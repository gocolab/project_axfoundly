import { Router } from "express";
import { db } from "../db.js";
import type {
  DashboardStats,
  AdminMember,
  AdminBoard,
  UserRole,
  IRProject,
  IdeaRequest,
  IdeaProposal,
  InvestmentProposal,
  AdminCategoryInsight,
  CourseRequest,
  CourseProposal,
} from "../../src/types.js";

const router = Router();

// GET /api/admin/stats (Enhanced with reverse proposals & AI metrics)
router.get("/stats", (req, res) => {
  const baseStats = db.get("stats") || {
    dailySignups: 24,
    monthlySignups: 412,
    totalRevenue: 48900000,
    monthlyRevenue: 12500000,
    activeCourses: 14,
    teamMatchCount: 38,
    investmentMatchCount: 19,
  };

  const courseRequests = db.get("courseRequests") || [];
  const ideaRequests = db.get("ideaRequests") || [];
  const ideaProposals = db.get("ideaProposals") || [];

  const matchedCourseCount = courseRequests.filter((r) => r.status === "개강완료").length;
  const courseMatchRate = courseRequests.length > 0 ? Math.round((matchedCourseCount / courseRequests.length) * 100) : 75;

  const matchedIdeaCount = ideaRequests.filter((r) => r.status === "매칭완료").length;
  const builderMatchRate = ideaRequests.length > 0 ? Math.round((matchedIdeaCount / ideaRequests.length) * 100) : 68;

  const stats: DashboardStats = {
    ...baseStats,
    courseRequestCount: courseRequests.length || 8,
    courseMatchRate: courseMatchRate || 75,
    ideaRequestCount: ideaRequests.length || 12,
    builderMatchRate: builderMatchRate || 68,
    aiAutoFillCount: 146,
  };

  res.json({ stats });
});

// GET /api/admin/members
router.get("/members", (req, res) => {
  const members = db.get("members");
  res.json({ members });
});

// PATCH /api/admin/members/:id/roles & /members/:id/role
router.patch(["/members/:id/roles", "/members/:id/role"], (req, res) => {
  const { id } = req.params;
  const { roles, role } = req.body as { roles?: UserRole[]; role?: string };
  const targetRoles: UserRole[] = Array.isArray(roles) && roles.length > 0 
    ? roles 
    : (role === "admin" ? ["admin"] : role === "manager" ? ["manager"] : ["member"]);

  let updatedMember: AdminMember | null = null;
  db.update("members", (members) =>
    members.map((m) => {
      if (m.id === id) {
        updatedMember = { ...m, roles: targetRoles };
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

// ── IR & Startup Management ──

// GET /api/admin/ir-projects
router.get("/ir-projects", (req, res) => {
  const projects = db.get("irProjects") || [];
  res.json({ projects });
});

// PATCH /api/admin/ir-projects/:id/status
router.patch("/ir-projects/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, isAnonymous } = req.body;

  let updatedProject: IRProject | null = null;
  db.update("irProjects", (projects) =>
    projects.map((p) => {
      if (p.id === id) {
        updatedProject = {
          ...p,
          ...(status ? { status } : {}),
          ...(typeof isAnonymous === "boolean" ? { isAnonymous } : {}),
        };
        return updatedProject;
      }
      return p;
    })
  );

  if (!updatedProject) {
    return res.status(404).json({ error: "Project not found" });
  }

  res.json({ project: updatedProject });
});

// GET /api/admin/idea-requests
router.get("/idea-requests", (req, res) => {
  const ideaRequests = db.get("ideaRequests") || [];
  const ideaProposals = db.get("ideaProposals") || [];
  res.json({ ideaRequests, ideaProposals });
});

// PATCH /api/admin/idea-requests/:id/status
router.patch("/idea-requests/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  let updatedRequest: IdeaRequest | null = null;
  db.update("ideaRequests", (requests) =>
    requests.map((r) => {
      if (r.id === id) {
        updatedRequest = { ...r, status };
        return updatedRequest;
      }
      return r;
    })
  );

  if (!updatedRequest) {
    return res.status(404).json({ error: "Idea request not found" });
  }

  res.json({ ideaRequest: updatedRequest });
});

// GET /api/admin/proposals (Investment & Builder Proposals)
router.get("/proposals", (req, res) => {
  const investmentProposals = db.get("proposals") || [];
  const ideaProposals = db.get("ideaProposals") || [];
  const courseProposals = db.get("courseProposals") || [];
  res.json({ investmentProposals, ideaProposals, courseProposals });
});

// ── Natural Category & Tags Insight ──

// GET /api/admin/category-insights
router.get("/category-insights", (req, res) => {
  const courses = db.get("courses") || [];
  const irProjects = db.get("irProjects") || [];
  const ideaRequests = db.get("ideaRequests") || [];

  const categoryMap: Record<string, { count: number; types: Set<string> }> = {};

  const registerCategory = (cat: string, type: string) => {
    const trimmed = (cat || "").trim();
    if (!trimmed) return;
    if (!categoryMap[trimmed]) {
      categoryMap[trimmed] = { count: 0, types: new Set() };
    }
    categoryMap[trimmed].count += 1;
    categoryMap[trimmed].types.add(type);
  };

  courses.forEach((c) => registerCategory(c.category, "course"));
  irProjects.forEach((p) => registerCategory(p.field, "ir"));
  ideaRequests.forEach((i) => registerCategory(i.category, "idea"));

  const recommendedDefaults = new Set([
    "B2B Enterprise AI",
    "B2B LegalTech SaaS",
    "실전 멀티에이전트 & RAG 시스템",
    "차세대 핀테크 / 결제",
    "초정밀 헬스케어 AI",
    "스마트 이커머스",
    "생성형 AI 에듀테크",
    "모빌리티 / 로보틱스",
    "AI 모델링 / 엔지니어링",
  ]);

  const insights: AdminCategoryInsight[] = Object.entries(categoryMap)
    .map(([category, info]) => {
      const typeList = Array.from(info.types);
      const inferredType: "course" | "ir" | "idea" | "all" =
        typeList.length > 1
          ? "all"
          : (typeList[0] as "course" | "ir" | "idea") || "all";

      return {
        category,
        count: info.count,
        type: inferredType,
        recentTrend: info.count >= 3 ? "🔥 급상승" : "📈 신규 등록",
        isRecommendedChip: recommendedDefaults.has(category),
      };
    })
    .sort((a, b) => b.count - a.count);

  res.json({ insights });
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
