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

// GET /api/auth/google/url
router.get("/google/url", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || "mock-google-client-id";
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3005/api/auth/google/callback";
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email`;
  res.json({ url: authUrl });
});

// POST /api/auth/google (Google OAuth Login & 회원가입)
router.post("/google", (req, res) => {
  const { email, name, role, avatar } = req.body as {
    email?: string;
    name?: string;
    role?: UserRole;
    avatar?: string;
    credential?: string;
    code?: string;
  };

  // Google OAuth 기본 계정: otter.oh@gmail.com
  const userEmail = email || "otter.oh@gmail.com";
  const userName = name || (userEmail.includes("otter") ? "오승환" : "구글 사용자");
  const today = new Date().toISOString().split("T")[0];

  // DB 회원 조회 또는 생성
  const members = db.get("members");
  let existingMember = members.find((m) => m.email.toLowerCase() === userEmail.toLowerCase());
  const isOtter = userEmail.toLowerCase() === "otter.oh@gmail.com";

  let userRole: UserRole = role || (isOtter ? "admin" : (existingMember ? existingMember.role : "student"));

  if (existingMember) {
    // 기존 회원인 경우 role과 lastLogin 갱신
    db.update("members", (mList) =>
      mList.map((m) =>
        m.email.toLowerCase() === userEmail.toLowerCase()
          ? { ...m, role: isOtter && !role ? "admin" : userRole, lastLogin: today }
          : m
      )
    );
  } else {
    // 신규 회원이면 DB에 등록
    const newMember: AdminMember = {
      id: `m-google-${Date.now()}`,
      name: userName,
      email: userEmail,
      role: userRole,
      joinDate: today,
      lastLogin: today,
      status: "활성",
      courseCount: 0,
    };
    db.update("members", (mList) => [newMember, ...mList]);
  }

  currentUser = {
    id: `user-google-${userEmail.replace(/[^a-zA-Z0-9]/g, "-")}`,
    name: userName,
    email: userEmail,
    role: userRole,
    avatar: avatar || "",
    joinDate: existingMember ? existingMember.joinDate : today,
  };

  res.json({
    user: currentUser,
    token: `mock-jwt-token-google-${userEmail === "otter.oh@gmail.com" ? "otter" : userRole}`,
  });
});

// POST /api/auth/signup (회원 등급 가입)
router.post("/signup", (req, res) => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
  };

  if (!email || !name) {
    return res.status(400).json({ error: "이름과 이메일은 필수 입력값입니다." });
  }

  const userRole: UserRole = role || "student";
  const today = new Date().toISOString().split("T")[0];

  // DB에 회원 추가
  const members = db.get("members");
  const existing = members.find((m) => m.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    // 이미 가입된 경우 등급 업데이트 및 로그인
    db.update("members", (mList) =>
      mList.map((m) =>
        m.email.toLowerCase() === email.toLowerCase()
          ? { ...m, role: userRole, lastLogin: today, name: name || m.name }
          : m
      )
    );
  } else {
    const newMember: AdminMember = {
      id: `m-${Date.now()}`,
      name,
      email,
      role: userRole,
      joinDate: today,
      lastLogin: today,
      status: "활성",
      courseCount: 0,
    };
    db.update("members", (mList) => [newMember, ...mList]);
  }

  currentUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: userRole,
    avatar: "",
    joinDate: today,
  };

  res.status(201).json({
    user: currentUser,
    token: `mock-jwt-token-${userRole}`,
  });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { role, email } = req.body as { role?: UserRole; email?: string; password?: string };

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

  let userRole: UserRole = role || "student";
  let userName = nameMap[userRole] || "사용자";
  let userEmail = emailMap[userRole] || `${userRole}@mail.com`;

  if (email) {
    const member = db.get("members").find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (member) {
      userRole = member.role;
      userName = member.name;
      userEmail = member.email;
    }
  }

  const today = new Date().toISOString().split("T")[0];

  currentUser = {
    id: `user-${userRole}`,
    name: userName,
    email: userEmail,
    role: userRole,
    avatar: "",
    joinDate: "2025-01-15",
  };

  // Update member lastLogin in db
  db.update("members", (members) =>
    members.map((m) =>
      m.email.toLowerCase() === userEmail.toLowerCase() || m.role === userRole
        ? { ...m, lastLogin: today }
        : m
    )
  );

  res.json({ user: currentUser, token: `mock-jwt-token-${userRole}` });
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer mock-jwt-token-")) {
    const tokenPart = authHeader.replace("Bearer mock-jwt-token-", "");
    if (tokenPart === "google-otter") {
      return res.json({
        user: {
          id: "user-google-otter",
          name: "오승환",
          email: "otter.oh@gmail.com",
          role: "admin" as UserRole,
          avatar: "",
          joinDate: "2024-01-01",
        },
      });
    }

    const role = tokenPart as UserRole;
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
