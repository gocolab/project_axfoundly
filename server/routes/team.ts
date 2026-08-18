import { Router } from "express";
import { db } from "../db.js";
import type { TeamBuildingRequest, Notification } from "../../src/types.js";

const router = Router();

// GET /api/team/requests
router.get("/requests", (req, res) => {
  const requests = db.get("teamRequests");
  res.json({ requests });
});

// POST /api/team/requests (Send team building request)
router.post("/requests", (req, res) => {
  const { projectName, fromUser = "김수강생", toUser, role, message } = req.body;

  if (!projectName || !message) {
    return res.status(400).json({ error: "Project name and message are required" });
  }

  const newReq: TeamBuildingRequest = {
    id: `tr-${Date.now()}`,
    type: "sent",
    projectName,
    fromUser,
    toUser: toUser || "프로젝트 대표",
    role: role || "팀원",
    message,
    status: "대기중",
    date: new Date().toISOString().split("T")[0],
  };

  db.update("teamRequests", (reqs) => [newReq, ...reqs]);

  // Update team match count
  db.update("stats", (stats) => ({
    ...stats,
    teamMatchCount: stats.teamMatchCount + 1,
  }));

  // Trigger Notification
  const newNotif: Notification = {
    id: `notif-${Date.now()}`,
    type: "team",
    title: `[팀빌딩 제안] ${projectName}`,
    message: `${fromUser}님이 '${projectName}' 프로젝트에 ${role || "팀원"} 포지션으로 합류를 제안했습니다.`,
    time: "방금 전",
    isRead: false,
  };
  db.update("notifications", (notifs) => [newNotif, ...notifs]);

  res.status(201).json({ request: newReq });
});

// PATCH /api/team/requests/:id (Accept / Reject)
router.patch("/requests/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: "수락" | "거절" | "대기중" };

  let updatedReq: TeamBuildingRequest | null = null;
  db.update("teamRequests", (reqs) =>
    reqs.map((r) => {
      if (r.id === id) {
        updatedReq = { ...r, status };
        return updatedReq;
      }
      return r;
    })
  );

  if (!updatedReq) {
    return res.status(404).json({ error: "Team request not found" });
  }

  res.json({ request: updatedReq });
});

export default router;
