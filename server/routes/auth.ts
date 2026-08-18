import { Router } from "express";
import { db } from "../db.js";
import type { UserRole, AdminMember } from "../../src/types.js";

const router = Router();

let currentUser = {
  id: "user-student",
  name: "김수강생",
  email: "student@mail.com",
  role: "student" as UserRole,
  avatar: "",
  joinDate: "2025-01-15",
};

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { role } = req.body as { role?: UserRole };
  const userRole: UserRole = role || "student";

  const nameMap: Record<UserRole, string> = {
    student: "김수강생",
    instructor: "김소현",
    investor: "이벤처",
    admin: "최관리",
  };


  const emailMap: Record<UserRole, string> = {
    student: "student@mail.com",
    instructor: "sohyun.kim@mail.com",
    investor: "sw.han@nexusvc.com",
    admin: "admin@platform.com",
  };

  currentUser = {
    id: `user-${userRole}`,
    name: nameMap[userRole],
    email: emailMap[userRole],
    role: userRole,
    avatar: "",
    joinDate: "2025-01-15",
  };

  // Update member lastLogin in db
  db.update("members", (members) =>
    members.map((m) =>
      m.role === userRole
        ? { ...m, lastLogin: new Date().toISOString().split("T")[0] }
        : m
    )
  );

  res.json({ user: currentUser, token: `mock-jwt-token-${userRole}` });
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer mock-jwt-token-")) {
    const role = authHeader.replace("Bearer mock-jwt-token-", "") as UserRole;
    const nameMap: Record<UserRole, string> = {
      student: "김수강생",
      instructor: "김소현",
      investor: "한승우",
      admin: "관리자",
    };
    const emailMap: Record<UserRole, string> = {
      student: "student@mail.com",
      instructor: "sohyun.kim@mail.com",
      investor: "sw.han@nexusvc.com",
      admin: "admin@platform.com",
    };
    return res.json({
      user: {
        id: `user-${role}`,
        name: nameMap[role] || "회원",
        email: emailMap[role] || `${role}@mail.com`,
        role,
        avatar: "",
        joinDate: "2025-01-15",
      },
    });
  }
  res.json({ user: currentUser });
});

export default router;
