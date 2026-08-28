import { Router } from "express";
import { db } from "../db.js";
import { notificationService } from "../services/notificationService.js";
import type { Notification, NotificationCategory } from "../../src/types.js";

const router = Router();

// GET /api/notifications
router.get("/", (req, res) => {
  const notifications = db.get("notifications") || [];
  res.json({ notifications });
});

// PATCH /api/notifications/:id/read (Mark as read)
router.patch("/:id/read", (req, res) => {
  const { id } = req.params;
  let updatedNotif: Notification | null = null;

  db.update("notifications", (notifs) =>
    notifs.map((n) => {
      if (n.id === id) {
        updatedNotif = { ...n, isRead: true };
        return updatedNotif;
      }
      return n;
    })
  );

  if (!updatedNotif) {
    return res.status(404).json({ error: "Notification not found" });
  }

  res.json({ notification: updatedNotif });
});

// POST /api/notifications/read-all (Mark all as read)
router.post("/read-all", (req, res) => {
  db.update("notifications", (notifs) =>
    notifs.map((n) => ({ ...n, isRead: true }))
  );
  res.json({ success: true, count: (db.get("notifications") || []).length });
});

// ── Preferences API (알림 수신 설정) ──

// GET /api/notifications/preferences
router.get("/preferences", (req, res) => {
  const userId = (req.query.userId as string) || "user-default";
  const preferences = notificationService.getPreferences(userId);
  res.json({ preferences });
});

// PUT /api/notifications/preferences
router.put("/preferences", (req, res) => {
  const userId = (req.body.userId as string) || "user-default";
  const updates = req.body;
  const preferences = notificationService.updatePreferences(userId, updates);
  res.json({ success: true, preferences });
});

// POST /api/notifications/snooze (30일 일시 중지)
router.post("/snooze", (req, res) => {
  const { userId = "user-default", days = 30 } = req.body;
  const preferences = notificationService.snoozeNotifications(userId, days);
  res.json({ success: true, preferences, message: `${days}일간 모든 알림이 일시 중지되었습니다.` });
});

// POST /api/notifications/unsnooze (일시 중지 해제)
router.post("/unsnooze", (req, res) => {
  const { userId = "user-default" } = req.body;
  const preferences = notificationService.cancelSnooze(userId);
  res.json({ success: true, preferences, message: "알림 일시 중지가 해제되었습니다." });
});

// ── 1-Click Unsubscribe (RFC 8058) ──

// GET & POST /api/notifications/unsubscribe
const handleUnsubscribe = (req: any, res: any) => {
  const userId = (req.query.userId || req.body.userId || "user-default") as string;
  const category = (req.query.category || req.body.category || "marketing") as NotificationCategory;

  notificationService.unsubscribeOneClick(userId, category);

  const categoryNames: Record<string, string> = {
    course: "강의 및 학습 알림",
    team: "스타트업 & 팀빌딩 알림",
    investor: "투자 및 IR 알림",
    community: "커뮤니티 알림",
    digest: "위클리 다이제스트",
    marketing: "마케팅 및 혜택 알림",
  };

  const catName = categoryNames[category] || category;

  if (req.method === "GET") {
    // 사용자가 메일에서 링크를 클릭했을 때 브라우저 렌더링 화면
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>수신거부 완료 | AI로 창업하라</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f3f4f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 40px; max-width: 480px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .icon { width: 64px; height: 64px; border-radius: 50%; background-color: rgba(99, 102, 241, 0.1); color: #818cf8; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; }
          h1 { font-size: 22px; margin-bottom: 12px; color: #fff; }
          p { font-size: 14px; color: #9ca3af; line-height: 1.6; margin-bottom: 28px; }
          .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✓</div>
          <h1>수신 거부가 완료되었습니다</h1>
          <p><strong>[${catName}]</strong>에 대한 이메일 및 알림톡 수신이 안전하게 차단되었습니다.<br>설정은 언제든지 마이페이지에서 다시 변경하실 수 있습니다.</p>
          <a href="/mypage?tab=settings" class="btn">알림 설정 확인하기</a>
        </div>
      </body>
      </html>
    `);
  }

  res.json({ success: true, message: `[${catName}] 수신 거부가 완료되었습니다.` });
};

router.get("/unsubscribe", handleUnsubscribe);
router.post("/unsubscribe", handleUnsubscribe);

// ── Templates & Preview API ──

// GET /api/notifications/templates
router.get("/templates", (req, res) => {
  const templates = db.get("notificationTemplates") || [];
  res.json({ templates });
});

// POST /api/notifications/preview-email (HTML 이메일 미리보기)
router.post("/preview-email", (req, res) => {
  const {
    title = "[AI로 창업하라] 새로운 알림이 도착했습니다",
    message = "회원님의 프로젝트에 새로운 제안이 도착했습니다. 지금 확인해보세요.",
    targetUrl = "/mypage?tab=startup",
    actionLabel = "제안서 확인하기",
    category = "team",
    userName = "김창업",
    userId = "user-default",
  } = req.body;

  const html = notificationService.renderEmailHtml({
    title,
    message,
    targetUrl,
    actionLabel,
    category,
    userName,
    userId,
  });

  res.json({ html });
});

// GET /api/notifications/logs (발송 로그 조회)
router.get("/logs", (req, res) => {
  const logs = db.get("notificationLogs") || [];
  res.json({ logs: logs.slice(0, 50) });
});

// POST /api/notifications/test-trigger (테스트 알림 발송)
router.post("/test-trigger", async (req, res) => {
  const {
    userId,
    recipientEmail,
    templateCode,
    title,
    message,
    targetUrl,
    actionLabel,
    category,
    aggregationKey,
    isUrgent,
    data,
  } = req.body;

  const result = await notificationService.sendNotification({
    userId,
    recipientEmail,
    templateCode,
    title,
    message,
    targetUrl,
    actionLabel,
    category,
    aggregationKey,
    isUrgent,
    data,
  });

  res.json({ success: true, result });
});

export default router;
