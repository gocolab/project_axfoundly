import { Router } from "express";
import { db } from "../db.js";
import type { Notification } from "../../src/types.js";

const router = Router();

// GET /api/notifications
router.get("/", (req, res) => {
  const notifications = db.get("notifications");
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
  res.json({ success: true, count: db.get("notifications").length });
});

export default router;
