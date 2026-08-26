import { Router } from "express";
import { db } from "../db.js";
import type { UserRole, AdminMember } from "../../src/types.js";

const router = Router();

let currentUser = {
  id: "user-member",
  name: "김수강생",
  email: "student@mail.com",
  roles: ["member"] as UserRole[],
  avatar: "",
  joinDate: "2025-01-15",
};

// GET /api/auth/google/url
router.get("/google/url", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || "mock-google-client-id";
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3005/api/auth/google/callback";
  
  // E2E Mock Bypass URL
  if (process.env.PLAYWRIGHT_AUTH_METHOD === "mock") {
    return res.redirect(`${redirectUri}?code=mock_playwright_code`);
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email`;
  res.redirect(authUrl); // 바로 리다이렉트
});

// GET /api/auth/google/callback (Google OAuth 콜백 처리)
router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3005/api/auth/google/callback";
  const frontendUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3005";

  if (!code) {
    return res.redirect(`${frontendUrl}/?error=no_code`);
  }

  let userEmail = "";
  let userName = "";
  let userAvatar = "";

  // Playwright Mock 우회 처리
  if (process.env.PLAYWRIGHT_AUTH_METHOD === "mock" && code === "mock_playwright_code") {
    userEmail = "otter.oh@gmail.com";
    userName = "오승환";
  } else {
    try {
      // 1. Authorization Code로 Access Token 교환
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: process.env.GOOGLE_CLIENT_ID || "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok) {
        console.error("Google Token Error:", tokenData);
        return res.redirect(`${frontendUrl}/?error=google_auth_failed`);
      }

      // 2. Access Token으로 사용자 프로필 가져오기
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      
      const userInfo = await userInfoResponse.json();
      if (!userInfoResponse.ok) {
        console.error("Google UserInfo Error:", userInfo);
        return res.redirect(`${frontendUrl}/?error=google_user_failed`);
      }

      userEmail = userInfo.email;
      userName = userInfo.name || "구글 사용자";
      userAvatar = userInfo.picture || "";
    } catch (error) {
      console.error("OAuth process error:", error);
      return res.redirect(`${frontendUrl}/?error=server_error`);
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const members = db.get("members") || [];
  let existingMember = members.find((m) => m.email.toLowerCase() === userEmail.toLowerCase());
  const isOtter = userEmail.toLowerCase() === "otter.oh@gmail.com";

  let assignedRoles: UserRole[] = isOtter ? ["admin", "member"] : (existingMember ? existingMember.roles : ["member"]);

  if (existingMember) {
    // 기존 회원 로그인 처리
    db.update("members", (mList) =>
      mList.map((m) =>
        m.email.toLowerCase() === userEmail.toLowerCase()
          ? { ...m, roles: (isOtter ? ["admin", "member"] : assignedRoles) as UserRole[], lastLogin: today }
          : m
      )
    );
  } else {
    // 신규 회원 자동 가입
    const newMember: AdminMember = {
      id: `m-google-${Date.now()}`,
      name: userName,
      email: userEmail,
      roles: assignedRoles,
      joinDate: today,
      lastLogin: today,
      status: "활성",
      courseCount: 0,
    };
    db.update("members", (mList) => [newMember, ...mList]);
  }

  // 3. 내부 JWT (Mock) 발급 및 프론트엔드로 전달
  const mockToken = `mock-jwt-token-google-${Buffer.from(userEmail).toString('base64')}`;
  
  // 프론트엔드로 토큰과 함께 리다이렉트
  res.redirect(`${frontendUrl}/?token=${mockToken}&roles=${assignedRoles.join(",")}`);
});


// POST /api/auth/google (기존 테스트용. 하위호환을 위해 남겨두거나 삭제)
router.post("/google", (req, res) => {
  res.status(400).json({ error: "Deprecated. Use /api/auth/google/url instead." });
});

// POST /api/auth/signup (Deprecated)
router.post("/signup", (req, res) => {
  res.status(400).json({ error: "Deprecated. Registration is handled via Google OAuth." });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { roles, email } = req.body as { roles?: UserRole[]; email?: string; password?: string };

  const nameMap: Record<UserRole, string> = {
    member: "김수강생",
    manager: "매니저",
    admin: "최관리",
  };

  const emailMap: Record<UserRole, string> = {
    member: "student@mail.com",
    manager: "manager@platform.com",
    admin: "admin@platform.com",
  };

  let userRoles: UserRole[] = Array.isArray(roles) && roles.length > 0 ? roles : ["member"];
  let userName = nameMap[userRoles[0]] || "사용자";
  let userEmail = emailMap[userRoles[0]] || `${userRoles[0]}@mail.com`;

  if (email) {
    const member = db.get("members").find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (member) {
      userRoles = Array.isArray(roles) && roles.length > 0 
        ? roles 
        : (Array.isArray(member.roles) && member.roles.length > 0 ? member.roles : ["member"]);
      userName = member.name;
      userEmail = member.email;
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const member = db.get("members").find((m) => m.email.toLowerCase() === userEmail.toLowerCase());
  
  currentUser = {
    id: member ? `user-${member.id}` : `user-${userRoles.join("-")}`,
    name: userName,
    email: userEmail,
    roles: userRoles,
    avatar: "",
    joinDate: "2025-01-15",
  };

  db.update("members", (members) =>
    members.map((m) => {
      const matchesEmail = m.email && m.email.toLowerCase() === userEmail.toLowerCase();
      return matchesEmail ? { ...m, lastLogin: today } : m;
    })
  );

  const token = member ? `mock-jwt-token-id-${member.id}` : `mock-jwt-token-${userRoles.join("-")}`;
  res.json({ user: currentUser, token });
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer mock-jwt-token-")) {
    const tokenPart = authHeader.replace("Bearer mock-jwt-token-", "");
    
    if (tokenPart.startsWith("google-")) {
      const emailBase64 = tokenPart.replace("google-", "");
      const email = Buffer.from(emailBase64, 'base64').toString('utf-8');
      
      let member = db.get("members").find((m) => m.email.toLowerCase() === email.toLowerCase());
      if (!member) {
        const isOtter = email.toLowerCase() === "otter.oh@gmail.com";
        const today = new Date().toISOString().split("T")[0];
        const newMember: AdminMember = {
          id: `m-google-${Date.now()}`,
          name: email.split("@")[0],
          email: email,
          roles: isOtter ? ["admin", "member"] : ["member"],
          joinDate: today,
          lastLogin: today,
          status: "활성",
          courseCount: 0,
        };
        db.update("members", (mList) => [newMember, ...mList]);
        member = newMember;
      }
      return res.json({
        user: {
          id: `user-${member.id}`,
          name: member.name,
          email: member.email,
          roles: Array.isArray(member.roles) ? member.roles : ["member"],
          avatar: "",
          joinDate: member.joinDate,
        }
      });
    }

    if (tokenPart.startsWith("id-")) {
      const memberId = tokenPart.replace("id-", "");
      const member = db.get("members").find((m) => m.id === memberId);
      if (member) {
        return res.json({
          user: {
            id: `user-${member.id}`,
            name: member.name,
            email: member.email,
            roles: Array.isArray(member.roles) ? member.roles : ["member"],
            avatar: "",
            joinDate: member.joinDate,
          }
        });
      }
    }

    const roles = tokenPart.split("-") as UserRole[];
    const nameMap: Record<UserRole, string> = {
      member: "김수강생",
      manager: "매니저",
      admin: "최관리",
    };
    const emailMap: Record<UserRole, string> = {
      member: "student@mail.com",
      manager: "manager@platform.com",
      admin: "admin@platform.com",
    };

    const targetEmail = emailMap[roles[0]] || `${roles[0]}@mail.com`;
    const member = db.get("members").find((m) => m.email.toLowerCase() === targetEmail.toLowerCase());

    return res.json({
      user: {
        id: member ? `user-${member.id}` : `user-${roles.join("-")}`,
        name: member?.name || nameMap[roles[0]] || "회원",
        email: member?.email || targetEmail,
        roles: member && Array.isArray(member.roles) ? member.roles : roles,
        avatar: "",
        joinDate: member?.joinDate || "2025-01-15",
      },
    });
  }
  res.json({ user: currentUser });
});

export default router;
