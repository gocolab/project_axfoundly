import { Router } from "express";
import { db } from "../db.js";
import type { CRMMessage, SettlementRecord, Notification } from "../../src/types.js";

const router = Router();

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
