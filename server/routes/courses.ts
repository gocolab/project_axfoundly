import { Router } from "express";
import { db } from "../db.js";
import type { Course, PaymentRecord, Notification, Review } from "../../src/types.js";

const router = Router();

// GET /api/courses
router.get("/", (req, res) => {
  const { category, search, page, limit } = req.query as {
    category?: string;
    search?: string;
    page?: string;
    limit?: string;
  };

  let courses = db.get("courses");

  if (category && category !== "전체") {
    courses = courses.filter((c) => c.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    courses = courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q)
    );
  }

  const pageNum = parseInt(page || "1", 10);
  const limitNum = parseInt(limit || "100", 10);
  const total = courses.length;
  const paginated = courses.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    courses: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// GET /api/courses/:id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const course = db.get("courses").find((c) => c.id === id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  res.json({ course });
});

// POST /api/courses (Create or update course)
router.post("/", (req, res) => {
  const newCourseData = req.body as Partial<Course>;
  if (!newCourseData.title) {
    return res.status(400).json({ error: "Course title is required" });
  }

  const newCourse: Course = {
    id: newCourseData.id || `c-${Date.now()}`,
    title: newCourseData.title,
    description: newCourseData.description || "",
    category: newCourseData.category || "AI 모델링",
    instructor: newCourseData.instructor || "김소현",
    instructorAvatar: newCourseData.instructorAvatar || "",
    instructorTitle: newCourseData.instructorTitle || "전문 멘토 강사",
    price: Number(newCourseData.price) || 490000,
    discountedPrice: newCourseData.discountedPrice ? Number(newCourseData.discountedPrice) : undefined,
    thumbnail: newCourseData.thumbnail || "",
    rating: 5.0,
    reviewCount: 0,
    studentCount: 0,
    status: newCourseData.status || "모집중",
    isEnrolled: false,
    progress: 0,
    schedule: newCourseData.schedule || {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      daysOfWeek: ["화", "목"],
      timeSlot: "19:30 ~ 21:30",
      totalSessions: 8,
      scheduleType: "stepping_stone",
    },
    curriculum: newCourseData.curriculum || [],
    reviews: [],
  };

  db.update("courses", (courses) => {
    const idx = courses.findIndex((c) => c.id === newCourse.id);
    if (idx >= 0) {
      const updated = [...courses];
      updated[idx] = { ...updated[idx], ...newCourse };
      return updated;
    }
    return [newCourse, ...courses];
  });

  // Increment active courses stat
  db.update("stats", (stats) => ({
    ...stats,
    activeCourses: stats.activeCourses + 1,
  }));

  res.status(201).json({ course: newCourse });
});

// POST /api/courses/:id/enroll (Enroll & Pay)
router.post("/:id/enroll", (req, res) => {
  const { id } = req.params;
  const { paymentMethod = "카드" } = req.body;

  let enrolledCourse: Course | null = null;

  db.update("courses", (courses) =>
    courses.map((c) => {
      if (c.id === id) {
        enrolledCourse = {
          ...c,
          isEnrolled: true,
          studentCount: c.studentCount + 1,
          progress: 0,
        };
        return enrolledCourse;
      }
      return c;
    })
  );

  if (!enrolledCourse) {
    return res.status(404).json({ error: "Course not found" });
  }

  const course: Course = enrolledCourse;
  const finalPrice = course.discountedPrice || course.price;

  // Add Payment Record
  const newPayment: PaymentRecord = {
    id: `pay-${Date.now()}`,
    courseId: course.id,
    courseTitle: course.title,
    userId: "user", // TODO: Get actual user from session
    amount: finalPrice,
    date: new Date().toISOString().split("T")[0],
    method: paymentMethod === "계좌이체" ? "계좌이체" : "카드",
    status: "완료",
  };
  db.update("payments", (payments) => [newPayment, ...payments]);

  // Update Revenue stats
  db.update("stats", (stats) => ({
    ...stats,
    totalRevenue: stats.totalRevenue + finalPrice,
    monthlyRevenue: stats.monthlyRevenue + finalPrice,
  }));

  // Add Notification
  const newNotif: Notification = {
    id: `notif-${Date.now()}`,
    type: "course",
    title: `[수강신청 완료] ${course.title}`,
    message: `${course.title} 수강신청 및 결제가 정상 완료되었습니다. 강의실에서 일정을 확인하세요.`,
    time: "방금 전",
    isRead: false,
    courseTitle: course.title,
  };
  db.update("notifications", (notifs) => [newNotif, ...notifs]);

  res.json({
    success: true,
    course: enrolledCourse,
    payment: newPayment,
  });
});

// PATCH /api/courses/:id/approve (Admin Approve)
router.patch("/:id/approve", (req, res) => {
  const { id } = req.params;
  let updatedCourse: Course | null = null;

  db.update("courses", (courses) =>
    courses.map((c) => {
      if (c.id === id) {
        updatedCourse = { ...c, status: "모집중" };
        return updatedCourse;
      }
      return c;
    })
  );

  if (!updatedCourse) {
    return res.status(404).json({ error: "Course not found" });
  }

  res.json({ success: true, course: updatedCourse });
});

// PATCH /api/courses/:id/reject (Admin Reject)
router.patch("/:id/reject", (req, res) => {
  const { id } = req.params;
  const { reason = "관리자 반려" } = req.body;
  let updatedCourse: Course | null = null;

  db.update("courses", (courses) =>
    courses.map((c) => {
      if (c.id === id) {
        updatedCourse = { ...c, status: "종료" };
        return updatedCourse;
      }
      return c;
    })
  );

  if (!updatedCourse) {
    return res.status(404).json({ error: "Course not found" });
  }

  res.json({ success: true, course: updatedCourse, reason });
});

// POST /api/courses/:id/reviews
router.post("/:id/reviews", (req, res) => {
  const { id } = req.params;
  const { author = "김수강생", rating = 5, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Review content is required" });
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    author,
    avatar: "",
    rating: Number(rating) || 5,
    content,
    date: new Date().toISOString().split("T")[0],
  };

  db.update("courses", (courses) =>
    courses.map((c) => {
      if (c.id === id) {
        const nextReviews = [newReview, ...(c.reviews || [])];
        const nextReviewCount = nextReviews.length;
        const avgRating =
          nextReviews.reduce((sum, r) => sum + r.rating, 0) / nextReviewCount;
        return {
          ...c,
          reviews: nextReviews,
          reviewCount: nextReviewCount,
          rating: parseFloat(avgRating.toFixed(1)),
        };
      }
      return c;
    })
  );

  res.status(201).json({ review: newReview });
});

export default router;
