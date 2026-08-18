import { Router } from "express";
import { db } from "../db.js";
import type { DashboardStats, AdminMember, AdminBoard, UserRole } from "../../src/types.js";

const router = Router();

// GET /api/admin/stats
router.get("/stats", (req, res) => {
  const stats = db.get("stats");
  res.json({ stats });
});

// GET /api/admin/members
router.get("/members", (req, res) => {
  const members = db.get("members");
  res.json({ members });
});

// PATCH /api/admin/members/:id/role
router.patch("/members/:id/role", (req, res) => {
  const { id } = req.params;
  const { role } = req.body as { role: UserRole };

  let updatedMember: AdminMember | null = null;
  db.update("members", (members) =>
    members.map((m) => {
      if (m.id === id) {
        updatedMember = { ...m, role };
        return updatedMember;
      }
      return m;
    })
  );

  if (!updatedMember) {
    return res.status(404).json({ error: "Member not found" });
  }

  res.json({ member: updatedMember });
});

// PATCH /api/admin/members/:id/status
router.patch("/members/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: "활성" | "정지" | "탈퇴" };

  let updatedMember: AdminMember | null = null;
  db.update("members", (members) =>
    members.map((m) => {
      if (m.id === id) {
        updatedMember = { ...m, status };
        return updatedMember;
      }
      return m;
    })
  );

  if (!updatedMember) {
    return res.status(404).json({ error: "Member not found" });
  }

  res.json({ member: updatedMember });
});

// GET /api/admin/boards
router.get("/boards", (req, res) => {
  const boards = db.get("boards");
  res.json({ boards });
});

// POST /api/admin/boards (Create new board)
router.post("/boards", (req, res) => {
  const { name, readPermission = "전체", writePermission = "회원", template = "일반형" } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Board name is required" });
  }

  const newBoard: AdminBoard = {
    id: `b-${Date.now()}`,
    name,
    readPermission,
    writePermission,
    template,
    postCount: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };

  db.update("boards", (boards) => [...boards, newBoard]);

  res.status(201).json({ board: newBoard });
});

// DELETE /api/admin/boards/:id
router.delete("/boards/:id", (req, res) => {
  const { id } = req.params;
  db.update("boards", (boards) => boards.filter((b) => b.id !== id));
  res.json({ success: true });
});

export default router;
