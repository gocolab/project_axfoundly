import { Router } from "express";
import { db } from "../db.js";
import type { CRMMessage, SettlementRecord, Notification, CourseStudent, PaymentRecord, Course } from "../../src/types.js";

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

export default router;
