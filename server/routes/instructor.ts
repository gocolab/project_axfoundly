import { Router } from "express";
import { db } from "../db.js";
import type { CRMMessage, SettlementRecord, Notification, CourseStudent, PaymentRecord, Course, InstructorProfile } from "../../src/types.js";

export function buildAggregatedInstructorProfile(baseInstructor: InstructorProfile): InstructorProfile {
  const courses = db.get("courses") || [];
  const allCourses = courses.filter(
    (c) => c.instructor === baseInstructor.name || (c.instructorProfile && c.instructorProfile.id === baseInstructor.id)
  );

  const directStudentCount = allCourses.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const totalStudents = (baseInstructor.externalStudentCount || 0) + directStudentCount;

  const allReviews = allCourses.flatMap((c) => c.reviews || []);
  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : baseInstructor.rating || 5.0;

  const satisfactionRate =
    allReviews.length > 0
      ? Math.min(100, Math.round((avgRating / 5) * 100))
      : baseInstructor.infographic?.satisfactionRate || 98;

  const courseList = allCourses.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category || "AI 모델링",
    period: c.schedule?.startDate ? `${c.schedule.startDate.slice(0, 7).replace("-", ".")}~` : "2026.03~",
    studentCount: c.studentCount || 0,
    rating: c.rating || 5.0,
    status: (c.status || "모집중") as "모집중" | "진행중" | "종료",
  }));

  return {
    ...baseInstructor,
    rating: Number(avgRating.toFixed(1)),
    reviewCount: allReviews.length || baseInstructor.reviewCount || 0,
    totalStudents,
    infographic: {
      ...baseInstructor.infographic,
      totalStudents,
      satisfactionRate,
    },
    courses: courseList,
    reviews: allReviews.length > 0 ? allReviews : baseInstructor.reviews || [],
    stats: {
      totalStudents,
      satisfactionRate,
      totalCourses: allCourses.length,
      averageRating: Number(avgRating.toFixed(1)),
    },
  };
}

const router = Router();

// GET /api/instructor/courses/:courseId/students (or GET /api/instructor/students)
router.get("/courses/:courseId/students", (req, res) => {
  const { courseId } = req.params;
  let students = db.get("courseStudents") || [];
  if (courseId && courseId !== "all") {
    students = students.filter((s) => s.courseId === courseId);
  }
  res.json({ students });
});

router.get("/students", (req, res) => {
  const { courseId } = req.query as { courseId?: string };
  let students = db.get("courseStudents") || [];
  if (courseId && courseId !== "all") {
    students = students.filter((s) => s.courseId === courseId);
  }
  res.json({ students });
});

// POST /api/instructor/courses/:courseId/students/:studentId/complete (Mark Course Completed / Issue Certificate)
router.post("/courses/:courseId/students/:studentId/complete", (req, res) => {
  const { courseId, studentId } = req.params;

  let targetStudent: CourseStudent | null = null;
  const nowStr = new Date().toISOString().split("T")[0];

  db.update("courseStudents", (students) =>
    (students || []).map((s) => {
      if (s.id === studentId || (s.courseId === courseId && s.id === studentId)) {
        targetStudent = {
          ...s,
          progress: 100,
          completed: true,
          completedAt: nowStr,
          certificateIssued: true,
        };
        return targetStudent;
      }
      return s;
    })
  );

  if (!targetStudent) {
    return res.status(404).json({ error: "수강생을 찾을 수 없습니다." });
  }

  const student: CourseStudent = targetStudent;

  // 수강생의 내 강의 진도율도 100% 동기화
  db.update("courses", (courses) =>
    courses.map((c) => {
      if (c.id === courseId) {
        return { ...c, progress: 100 };
      }
      return c;
    })
  );

  // 수강생에게 수료 축하 및 수료증 발급 알림 발송
  const completeNotif: Notification = {
    id: `notif-${Date.now()}`,
    type: "course",
    title: `🎓 [수료 완료] '${student.courseTitle}' 과정 수료를 축하합니다!`,
    message: `${student.name}님, '${student.courseTitle}' 커리큘럼을 성공적으로 수료하셨습니다. 내 강의실에서 공식 수료증을 확인하실 수 있습니다.`,
    time: "방금 전",
    isRead: false,
    courseTitle: student.courseTitle,
  };
  db.update("notifications", (notifs) => [completeNotif, ...notifs]);

  res.json({ success: true, student: targetStudent, message: "수료 완료 및 수료증이 성공적으로 발급되었습니다." });
});

// POST /api/instructor/courses/:courseId/students/:studentId/refund (Instructor Refund & Unenroll)
router.post("/courses/:courseId/students/:studentId/refund", (req, res) => {
  const { courseId, studentId } = req.params;
  const { reason = "강사 직권 환불 처리" } = req.body;

  let targetStudent: CourseStudent | null = null;

  db.update("courseStudents", (students) =>
    (students || []).map((s) => {
      if (s.id === studentId || (s.courseId === courseId && s.id === studentId)) {
        targetStudent = {
          ...s,
          paymentStatus: "환불",
          completed: false,
          progress: 0,
        };
        return targetStudent;
      }
      return s;
    })
  );

  if (!targetStudent) {
    return res.status(404).json({ error: "수강생을 찾을 수 없습니다." });
  }

  const student: CourseStudent = targetStudent;

  // Payments 테이블 환불 상태 동기화
  if (student.paymentId) {
    db.update("payments", (payments) =>
      payments.map((p) => (p.id === student.paymentId ? { ...p, status: "환불" } : p))
    );
  }

  // 강의 수강생 수 차감 및 수강 해제
  db.update("courses", (courses) =>
    courses.map((c) => {
      if (c.id === courseId) {
        return {
          ...c,
          studentCount: Math.max(0, (c.studentCount || 1) - 1),
          isEnrolled: false,
          progress: 0,
        };
      }
      return c;
    })
  );

  // 수강생에게 환불 안내 알림 발송
  const refundNotif: Notification = {
    id: `notif-${Date.now()}`,
    type: "system",
    title: `💸 [수강 취소 및 환불 안내] '${student.courseTitle}'`,
    message: `${student.name}님의 '${student.courseTitle}' 수강이 취소되었으며 환불 처리가 완료되었습니다. (사유: ${reason})`,
    time: "방금 전",
    isRead: false,
    courseTitle: student.courseTitle,
  };
  db.update("notifications", (notifs) => [refundNotif, ...notifs]);

  res.json({ success: true, student: targetStudent, message: "환불 및 수강 취소 처리가 완료되었습니다." });
});

// PATCH /api/instructor/courses/:courseId/students/:studentId/progress (Update Progress)
router.patch("/courses/:courseId/students/:studentId/progress", (req, res) => {
  const { courseId, studentId } = req.params;
  const { progress } = req.body;

  let targetStudent: CourseStudent | null = null;
  const numProgress = Math.min(100, Math.max(0, Number(progress) || 0));

  db.update("courseStudents", (students) =>
    (students || []).map((s) => {
      if (s.id === studentId || (s.courseId === courseId && s.id === studentId)) {
        targetStudent = {
          ...s,
          progress: numProgress,
          completed: numProgress === 100,
        };
        return targetStudent;
      }
      return s;
    })
  );

  if (!targetStudent) {
    return res.status(404).json({ error: "수강생을 찾을 수 없습니다." });
  }

  res.json({ success: true, student: targetStudent });
});

// POST /api/instructor/crm/send (Send CRM Message)
router.post("/crm/send", (req, res) => {
  const { courseId, courseTitle, targetType = "all", targetCount = 1, title, content, channels = ["inapp"] } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const now = new Date();
  const timeStr = `${now.toISOString().split("T")[0]} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const newCrm: CRMMessage = {
    id: `crm-${Date.now()}`,
    courseId: courseId || "c1",
    courseTitle: courseTitle || "강의",
    targetType,
    targetCount: Number(targetCount) || 1,
    title,
    content,
    channels,
    sentAt: timeStr,
  };

  db.update("crmMessages", (msgs) => [newCrm, ...(msgs || [])]);

  // Also deliver as notification for students
  const newNotif: Notification = {
    id: `notif-${Date.now()}`,
    type: "instructor_msg",
    title: `[강사 메시지] ${title}`,
    message: content,
    time: "방금 전",
    isRead: false,
    sender: "김소현 강사",
    courseTitle: courseTitle || "강의",
  };
  db.update("notifications", (notifs) => [newNotif, ...notifs]);

  res.status(201).json({ message: newCrm });
});

// GET /api/instructor/crm/messages
router.get("/crm/messages", (req, res) => {
  const messages = db.get("crmMessages") || [];
  res.json({ messages });
});

// GET /api/instructor/settlements
router.get("/settlements", (req, res) => {
  const settlements = db.get("settlements");
  res.json({ settlements });
});

// POST /api/instructor/settlements/withdraw (Request settlement withdrawal)
router.post("/settlements/withdraw", (req, res) => {
  const { settlementId } = req.body;

  let updatedSettlement: SettlementRecord | null = null;
  db.update("settlements", (list) =>
    list.map((s) => {
      if (s.id === settlementId || (!settlementId && s.status === "출금신청")) {
        updatedSettlement = { ...s, status: "정산완료" };
        return updatedSettlement;
      }
      return s;
    })
  );

  if (!updatedSettlement) {
    return res.status(400).json({ error: "Settlement record not eligible for withdrawal" });
  }

  // Notify instructor
  const newNotif: Notification = {
    id: `notif-${Date.now()}`,
    type: "system",
    title: `[정산 출금 완료]`,
    message: `신청하신 강사 정산금 입금이 정상 승인되었습니다.`,
    time: "방금 전",
    isRead: false,
  };
  db.update("notifications", (notifs) => [newNotif, ...notifs]);

  res.json({ success: true, settlement: updatedSettlement });
});

// ── Instructor Profile Management ──

// GET /api/instructor/profile
router.get("/profile", (req, res) => {
  const { name, id } = req.query as { name?: string; id?: string };
  const instructors = db.get("instructors") || [];

  let target = instructors.find(
    (inst) => (id ? inst.id === id : false) || (name ? inst.name === name : false)
  );

  // Default fallback if no name/id given
  if (!target && !name && !id) {
    target = instructors.find((inst) => inst.name === "김소현") || instructors[0];
  }

  // Create baseline if not found
  if (!target) {
    const defaultName = name || "김소현";
    target = {
      id: id || `inst-${Date.now()}`,
      name: defaultName,
      title: "AI 비즈니스 & 스타트업 디렉터",
      bio: `${defaultName} 강사는 다년간의 실무 AI 프로덕트 런칭 및 스타트업 인큐베이팅 경험을 바탕으로, 수강생들이 실제 시장에서 작동하는 비즈니스를 만들 수 있도록 핵심 실전 가이드를 제공합니다.`,
      avatar: "",
      rating: 5.0,
      reviewCount: 0,
      totalStudents: 0,
      externalStudentCount: 300,
      infographic: {
        experienceYears: 10,
        totalStudents: 300,
        satisfactionRate: 98,
        topKeywords: ["AI 프로덕트", "실전 린스타트업", "1:1 밀착 코칭", "IR 피칭"],
        careerHighlights: [
          "전) 글로벌 테크 유니콘 AI PM 리드",
          "다수 생성형 AI 프로덕트 런칭 및 IR 유치 총괄",
          "창업진흥원 및 주요 VC 공식 멘토",
        ],
        certifiedBadge: "AI 린스타트업 전문 디렉터",
      },
      careerHistory: [
        "2023~현재: AI 스타트업 엑셀러레이팅 수석 디렉터",
        "2020~2023: 글로벌 생성형 AI 서비스 PM 리드",
        "2017~2020: 린스타트업 인큐베이터 시니어 컨설턴트",
      ],
      courses: [],
      reviews: [],
    };
    db.update("instructors", (list) => [...(list || []), target!]);
  }

  const aggregated = buildAggregatedInstructorProfile(target);
  res.json({ profile: aggregated });
});

// PUT /api/instructor/profile
router.put("/profile", (req, res) => {
  const profileData = req.body as Partial<InstructorProfile>;
  if (!profileData.name) {
    return res.status(400).json({ error: "강사 이름은 필수입니다." });
  }

  let updatedProfile: InstructorProfile | null = null;

  db.update("instructors", (instructors = []) => {
    const idx = instructors.findIndex(
      (inst) => (profileData.id && inst.id === profileData.id) || inst.name === profileData.name
    );

    if (idx >= 0) {
      const existing = instructors[idx];
      updatedProfile = {
        ...existing,
        ...profileData,
        infographic: {
          ...existing.infographic,
          ...(profileData.infographic || {}),
        },
        externalStudentCount:
          profileData.externalStudentCount !== undefined
            ? Number(profileData.externalStudentCount)
            : existing.externalStudentCount,
        careerHistory: profileData.careerHistory || existing.careerHistory,
      };
      const next = [...instructors];
      next[idx] = updatedProfile;
      return next;
    } else {
      const newInst: InstructorProfile = {
        id: profileData.id || `inst-${Date.now()}`,
        name: profileData.name,
        title: profileData.title || "AI 전문 강사",
        bio: profileData.bio || "",
        avatar: profileData.avatar || "",
        rating: profileData.rating || 5.0,
        reviewCount: profileData.reviewCount || 0,
        totalStudents: profileData.totalStudents || 0,
        externalStudentCount: Number(profileData.externalStudentCount) || 0,
        infographic: profileData.infographic || {
          experienceYears: 10,
          totalStudents: 0,
          satisfactionRate: 98,
          topKeywords: ["AI창업"],
          careerHighlights: ["실전 창업 코칭"],
          certifiedBadge: "공인 전문 강사",
        },
        careerHistory: profileData.careerHistory || [],
        courses: [],
        reviews: [],
      };
      updatedProfile = newInst;
      return [...instructors, newInst];
    }
  });

  if (!updatedProfile) {
    return res.status(500).json({ error: "강사 프로필 저장에 실패했습니다." });
  }

  // Sync instructorTitle in courses
  if (profileData.title) {
    db.update("courses", (courses) =>
      courses.map((c) =>
        c.instructor === profileData.name ? { ...c, instructorTitle: profileData.title } : c
      )
    );
  }

  const aggregated = buildAggregatedInstructorProfile(updatedProfile);
  res.json({ success: true, profile: aggregated });
});

export default router;
