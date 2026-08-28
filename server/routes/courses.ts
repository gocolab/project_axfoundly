import { Router } from "express";
import { db } from "../db.js";
import { classifyContent } from "../services/aiClassifier.js";
import { notificationService } from "../services/notificationService.js";
import type { Course, PaymentRecord, Notification, Review, CourseRequest, CourseProposal } from "../../src/types.js";

const router = Router();

// GET /api/courses/categories (실시간 등록된 강의 기반 인기 카테고리 및 태그 집계)
router.get("/categories", (req, res) => {
  const courses = db.get("courses") || [];

  const categoryCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  courses.forEach((c) => {
    if (c.category) {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    }
    if (Array.isArray(c.tags)) {
      c.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const popularCategories = Object.keys(categoryCounts).sort(
    (a, b) => categoryCounts[b] - categoryCounts[a]
  );
  const popularTags = Object.keys(tagCounts).sort(
    (a, b) => tagCounts[b] - tagCounts[a]
  );

  res.json({
    categories: ["전체", ...popularCategories],
    popularTags,
  });
});

// ── Course Reverse Proposals (수강생 개강 요청 & 강사 역제안 API) ──

// GET /api/courses/requests
router.get("/requests", (req, res) => {
  const { category, tag, search, sort = "popular", status, page, limit } = req.query as {
    category?: string;
    tag?: string;
    search?: string;
    sort?: "popular" | "recent";
    status?: string;
    page?: string;
    limit?: string;
  };

  let requests = (db.get("courseRequests") || []) as CourseRequest[];
  const proposals = (db.get("courseProposals") || []) as CourseProposal[];

  // Attach proposals to each request
  requests = requests.map((r) => ({
    ...r,
    proposals: proposals.filter((p) => p.requestId === r.id),
  }));

  if (category && category !== "전체") {
    requests = requests.filter((r) => r.category === category);
  }

  if (tag && tag !== "전체") {
    requests = requests.filter((r) => r.tags?.includes(tag));
  }

  if (status && status !== "전체") {
    requests = requests.filter((r) => r.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    requests = requests.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.requestedBy?.userName.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (sort === "popular") {
    requests.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
  } else {
    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const pageNum = parseInt(page || "1", 10);
  const limitNum = parseInt(limit || "100", 10);
  const total = requests.length;
  const paginated = requests.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    requests: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// POST /api/courses/requests (Create new request)
router.post("/requests", async (req, res) => {
  try {
    const { title, description, category, tags, targetLevel, preferredSchedule, expectedPriceRange, requestedBy } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "제목과 설명은 필수입니다." });
    }

    let finalTags = tags || [];
    let finalCategory = category || "AI 모델링";

    if (!finalTags.length || !finalCategory) {
      const classified = await classifyContent("course", { title, description });
      finalTags = finalTags.length ? finalTags : classified.tags;
      finalCategory = finalCategory || classified.category;
    }

    const newRequest: CourseRequest = {
      id: `cr-${Date.now()}`,
      title,
      description,
      category: finalCategory,
      tags: finalTags,
      targetLevel: targetLevel || "입문",
      preferredSchedule: preferredSchedule || "평일 저녁",
      expectedPriceRange: expectedPriceRange || "협의",
      requestedBy: requestedBy || {
        userId: "u-current",
        userName: "김수강생",
        avatar: "",
      },
      upvotes: [requestedBy?.userId || "u-current"],
      upvoteCount: 1,
      targetCount: 20,
      status: "모집중",
      createdAt: new Date().toISOString(),
    };

    db.update("courseRequests", (list) => [newRequest, ...(list || [])]);

    notificationService.sendNotification({
      category: "course",
      type: "course",
      title: "개강 요청 등록 완료",
      message: `'${title}' 개강 요청이 성공적으로 등록되었습니다.`,
      targetUrl: `/courses?tab=requests&requestId=${newRequest.id}`,
      actionLabel: "내 요청 확인하기",
    });

    res.status(201).json({ success: true, request: newRequest });
  } catch (error) {
    console.error("Error creating course request:", error);
    res.status(500).json({ error: "Failed to create course request" });
  }
});

// GET /api/courses/requests/:id
router.get("/requests/:id", (req, res) => {
  const { id } = req.params;
  const request = (db.get("courseRequests") || []).find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ error: "개강 요청을 찾을 수 없습니다." });
  }
  const proposals = (db.get("courseProposals") || []).filter((p) => p.requestId === id);
  res.json({ request: { ...request, proposals } });
});

// POST /api/courses/requests/:id/upvote
router.post("/requests/:id/upvote", (req, res) => {
  const { id } = req.params;
  const { userId = "u-student-1" } = req.body;

  let updatedRequest: CourseRequest | null = null;
  let isUpvoted = false;

  db.update("courseRequests", (list) =>
    (list || []).map((r) => {
      if (r.id === id) {
        const upvotes = r.upvotes || [];
        const exists = upvotes.includes(userId);
        let newUpvotes: string[];
        if (exists) {
          newUpvotes = upvotes.filter((u) => u !== userId);
          isUpvoted = false;
        } else {
          newUpvotes = [...upvotes, userId];
          isUpvoted = true;
        }
        const count = newUpvotes.length;
        let newStatus = r.status;
        if (count >= r.targetCount && r.status === "모집중") {
          newStatus = "강사매칭중";
        }
        updatedRequest = { ...r, upvotes: newUpvotes, upvoteCount: count, status: newStatus };
        return updatedRequest;
      }
      return r;
    })
  );

  if (!updatedRequest) {
    return res.status(404).json({ error: "개강 요청을 찾을 수 없습니다." });
  }

  res.json({ success: true, isUpvoted, request: updatedRequest });
});

// POST /api/courses/requests/:id/proposals (Instructor submits a proposal)
router.post("/requests/:id/proposals", (req, res) => {
  const { id } = req.params;
  const {
    instructorId = "ins-1",
    instructorName = "김소현",
    instructorAvatar = "",
    instructorTitle = "전문 강사",
    proposedTitle,
    curriculumDraft = [],
    proposedPrice = 300000,
    proposedSchedule = "일정 협의",
    message = "",
  } = req.body;

  const request = (db.get("courseRequests") || []).find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ error: "개강 요청을 찾을 수 없습니다." });
  }

  const newProposal: CourseProposal = {
    id: `cp-${Date.now()}`,
    requestId: id,
    instructorId,
    instructorName,
    instructorAvatar,
    instructorTitle,
    proposedTitle: proposedTitle || `${request.title} 실전 완성`,
    curriculumDraft: Array.isArray(curriculumDraft) ? curriculumDraft : [curriculumDraft],
    proposedPrice: Number(proposedPrice) || 300000,
    proposedSchedule,
    message,
    status: "대기중",
    createdAt: new Date().toISOString(),
  };

  db.update("courseProposals", (list) => [newProposal, ...(list || [])]);

  db.update("courseRequests", (list) =>
    (list || []).map((r) => (r.id === id && r.status === "모집중" ? { ...r, status: "강사매칭중" } : r))
  );

  notificationService.sendNotification({
    templateCode: "COURSE_PROPOSAL_MATCHED",
    category: "course",
    type: "course",
    title: `🧑‍🏫 요청하신 '${request.title}'에 전문 강사님의 커리큘럼 제안이 도착했습니다!`,
    message: `'${request.title}' 요청에 ${instructorName} 강사님의 개강 제안서가 등록되었습니다.`,
    targetUrl: `/courses?tab=requests&requestId=${request.id}`,
    actionLabel: "강사 제안서 검토하기",
    data: {
      requestTitle: request.title,
      instructorName,
      requestId: request.id,
    },
  });

  res.status(201).json({ success: true, proposal: newProposal });
});

// POST /api/courses/requests/:id/accept-proposal
router.post("/requests/:id/accept-proposal", (req, res) => {
  const { id } = req.params;
  const { proposalId } = req.body;

  const request = (db.get("courseRequests") || []).find((r) => r.id === id);
  const proposal = (db.get("courseProposals") || []).find((p) => p.id === proposalId);

  if (!request || !proposal) {
    return res.status(404).json({ error: "요청 또는 제안서를 찾을 수 없습니다." });
  }

  db.update("courseProposals", (list) =>
    (list || []).map((p) => {
      if (p.requestId === id) {
        return p.id === proposalId ? { ...p, status: "채택됨" } : { ...p, status: "반려" };
      }
      return p;
    })
  );

  const newCourseId = `c-rev-${Date.now()}`;
  const curriculumItems = (proposal.curriculumDraft || []).map((c, idx) => ({
    week: idx + 1,
    sessionNumber: idx + 1,
    title: typeof c === "string" ? c : `차시 ${idx + 1}`,
    description: "역제안 매칭을 통해 개설된 실습 커리큘럼",
    duration: "2시간",
  }));

  const newCourse: Course = {
    id: newCourseId,
    title: proposal.proposedTitle,
    description: `${request.description}\n\n[수강생 역제안 매칭으로 개설된 강의입니다.]`,
    category: request.category,
    tags: request.tags,
    aiSummary: `수강생 ${request.upvoteCount}명의 요청으로 개설된 ${proposal.instructorName} 강사의 집중 실전 클래스`,
    instructor: proposal.instructorName,
    instructorTitle: proposal.instructorTitle,
    instructorAvatar: proposal.instructorAvatar,
    price: proposal.proposedPrice,
    discountedPrice: Math.round(proposal.proposedPrice * 0.8),
    thumbnail: "",
    rating: 5.0,
    reviewCount: 0,
    studentCount: request.upvoteCount,
    status: "모집중",
    schedule: {
      startDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      endDate: new Date(Date.now() + 35 * 86400000).toISOString().split("T")[0],
      daysOfWeek: ["화", "목"],
      timeSlot: "19:30 ~ 21:30",
      totalSessions: curriculumItems.length > 0 ? curriculumItems.length : 8,
      scheduleType: "stepping_stone",
    },
    curriculum: curriculumItems.length > 0 ? curriculumItems : [
      { week: 1, sessionNumber: 1, title: "1차시: 기초 및 요구사항 분석", description: "실전 워크플로우 셋업", duration: "2시간" },
      { week: 2, sessionNumber: 2, title: "2차시: 핵심 프로토타입 구현", description: "실전 파이프라인 개발", duration: "2시간" }
    ],
    reviews: [],
  };

  db.update("courses", (courses) => [newCourse, ...courses]);

  db.update("courseRequests", (list) =>
    (list || []).map((r) => (r.id === id ? { ...r, status: "개강완료", matchedCourseId: newCourseId } : r))
  );

  notificationService.sendNotification({
    category: "course",
    type: "course",
    title: "🎉 개강 제안 채택 및 강의 개설 완료!",
    message: `'${proposal.proposedTitle}' 강의가 정식으로 개설되었습니다.`,
    targetUrl: `/courses?courseId=${newCourseId}`,
    actionLabel: "개설된 강의 보기",
    courseTitle: proposal.proposedTitle,
  });

  res.json({ success: true, course: newCourse, request: { ...request, status: "개강완료", matchedCourseId: newCourseId } });
});

// DELETE /api/courses/requests/:id
router.delete("/requests/:id", (req, res) => {
  const { id } = req.params;
  db.update("courseRequests", (list) => (list || []).filter((r) => r.id !== id));
  db.update("courseProposals", (list) => (list || []).filter((p) => p.requestId !== id));
  res.json({ success: true });
});

// GET /api/courses
router.get("/", (req, res) => {
  const { category, tag, search, page, limit } = req.query as {
    category?: string;
    tag?: string;
    search?: string;
    page?: string;
    limit?: string;
  };

  let courses = db.get("courses");

  if (category && category !== "전체") {
    courses = courses.filter((c) => c.category === category);
  }

  if (tag && tag !== "전체") {
    courses = courses.filter((c) => c.tags?.includes(tag));
  }

  if (search) {
    const q = search.toLowerCase();
    courses = courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
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

// POST /api/courses (Create or update course with AI Auto-Classification)
router.post("/", async (req, res) => {
  try {
    const newCourseData = req.body as Partial<Course>;
    if (!newCourseData.title) {
      return res.status(400).json({ error: "Course title is required" });
    }

    const curriculumSummary = (newCourseData.curriculum || [])
      .map((item) => `${item.title}: ${item.description}`)
      .join("\n");

    // 🤖 AI 본문 기반 자동 카테고리/태그/요약 생성 (100% 자동)
    const aiResult = await classifyContent("course", {
      title: newCourseData.title,
      description: newCourseData.description,
      curriculumSummary,
    });

    const newCourse: Course = {
      id: newCourseData.id || `c-${Date.now()}`,
      title: newCourseData.title,
      description: newCourseData.description || "",
      category: aiResult.category, // AI 자동 분류 카테고리
      tags: aiResult.tags, // AI 자동 추출 키워드 태그
      aiSummary: aiResult.aiSummary, // AI 요약
      deliveryType: newCourseData.deliveryType || "online",
      location: newCourseData.location || "",
      liveMeetingUrl: newCourseData.liveMeetingUrl || "",
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
  } catch (error: any) {
    console.error("[Courses API] POST / error:", error);
    res.status(500).json({ error: "강의 등록에 실패했습니다." });
  }
});

// POST /api/courses/:id/enroll (Enroll & Pay)
router.post("/:id/enroll", (req, res) => {
  const { id } = req.params;
  const { paymentMethod = "카드", userName = "김수강생", userEmail = "student@mail.com" } = req.body;

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
  const paymentId = `pay-${Date.now()}`;

  // Add Payment Record
  const newPayment: PaymentRecord = {
    id: paymentId,
    courseId: course.id,
    courseTitle: course.title,
    userId: "m1",
    amount: finalPrice,
    date: new Date().toISOString().split("T")[0],
    method: paymentMethod === "계좌이체" ? "계좌이체" : "카드",
    status: "완료",
  };
  db.update("payments", (payments) => [newPayment, ...payments]);

  // Add CourseStudent record
  const newStudent = {
    id: `cs-${Date.now()}`,
    userId: "m1",
    name: userName,
    email: userEmail,
    avatar: "",
    courseId: course.id,
    courseTitle: course.title,
    enrolledAt: new Date().toISOString().split("T")[0],
    progress: 0,
    completed: false,
    paymentId,
    paymentAmount: finalPrice,
    paymentStatus: "완료" as const,
    lastActive: "방금 전",
  };
  db.update("courseStudents", (students) => [newStudent, ...(students || [])]);

  // Update Revenue stats
  db.update("stats", (stats) => ({
    ...stats,
    totalRevenue: stats.totalRevenue + finalPrice,
    monthlyRevenue: stats.monthlyRevenue + finalPrice,
  }));

  // Add Notification via Service
  notificationService.sendNotification({
    templateCode: "PAYMENT_COMPLETED",
    category: "course",
    type: "course",
    title: `🎉 [결제 완료] '${course.title}' 수강 신청이 완료되었습니다`,
    message: `${course.title} 수강신청 및 결제가 정상 완료되었습니다. 강의실에서 일정을 확인하세요.`,
    targetUrl: `/mypage?tab=courses`,
    actionLabel: "내 강의실 바로가기",
    courseTitle: course.title,
    isUrgent: true,
    data: {
      courseTitle: course.title,
      userName: "김수강생",
    },
  });

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
