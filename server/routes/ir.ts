import { Router } from "express";
import { db } from "../db.js";
import { classifyContent } from "../services/aiClassifier.js";
import type { IRProject, JobApplication, Notification } from "../../src/types.js";

const router = Router();

// GET /api/ir/categories (실시간 등록된 프로젝트 기반 인기 카테고리 및 태그 집계)
router.get("/categories", (req, res) => {
  const projects = db.get("irProjects") || [];
  
  const categoryCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  projects.forEach((p) => {
    if (p.field) {
      categoryCounts[p.field] = (categoryCounts[p.field] || 0) + 1;
    }
    if (Array.isArray(p.tags)) {
      p.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const popularCategories = Object.keys(categoryCounts).sort(
    (a, b) => categoryCounts[b] - categoryCounts[a]
  );
  const popularTags = Object.keys(tagCounts).sort(
    (a, b) => tagCounts[b] - tagCounts[a]
  );

  res.json({
    categories: ["전체", ...popularCategories],
    popularTags,
  });
});

// GET /api/ir/projects
router.get("/projects", (req, res) => {
  const { field, tag, search, page, limit } = req.query as {
    field?: string;
    tag?: string;
    search?: string;
    page?: string;
    limit?: string;
  };

  let projects = db.get("irProjects");

  if (field && field !== "전체") {
    projects = projects.filter((p) => p.field === field);
  }

  if (tag && tag !== "전체") {
    projects = projects.filter((p) => p.tags?.includes(tag));
  }

  if (search) {
    const q = search.toLowerCase();
    projects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.teamName.toLowerCase().includes(q) ||
        p.oneLiner.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.field?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  const pageNum = parseInt(page || "1", 10);
  const limitNum = parseInt(limit || "100", 10);
  const total = projects.length;
  const paginated = projects.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    projects: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// GET /api/ir/projects/:id
router.get("/projects/:id", (req, res) => {
  const { id } = req.params;
  const project = db.get("irProjects").find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  res.json({ project });
});

// POST /api/ir/projects (Create or update project with AI Auto-Classification)
router.post("/projects", async (req, res) => {
  try {
    const projectData = req.body as Partial<IRProject>;
    if (!projectData.teamName || !projectData.title) {
      return res.status(400).json({ error: "Team name and title are required" });
    }

    // 🤖 AI 본문 기반 자동 카테고리/태그/요약 생성 (100% 자동)
    const aiResult = await classifyContent("ir", {
      title: projectData.title,
      description: projectData.description,
      oneLiner: projectData.oneLiner,
      problem: projectData.problem,
      solution: projectData.solution,
      businessModel: projectData.businessModel,
    });

    const newProject: IRProject = {
      id: projectData.id || `p-${Date.now()}`,
      teamName: projectData.teamName,
      anonymousTeamName: projectData.anonymousTeamName || `⚡ ${projectData.teamName} (스텔스)`,
      title: projectData.title,
      oneLiner: projectData.oneLiner || aiResult.aiSummary,
      description: projectData.description || "",
      field: aiResult.category, // AI 자동 판별 분야
      tags: aiResult.tags, // AI 자동 추출 키워드 태그
      aiSummary: aiResult.aiSummary, // AI 요약
      thumbnail: projectData.thumbnail || "",
      demoVideoUrl: projectData.demoVideoUrl || "",
      isAnonymous: !!projectData.isAnonymous,
      members: projectData.members || [
        { name: "김수강생", role: "CEO / Founder", avatar: "", anonymousName: "⚡ 캡틴 AI", anonymousRole: "Founder" },
      ],
      businessModel: projectData.businessModel || "B2B SaaS",
      problem: projectData.problem || "",
      solution: projectData.solution || "",
      isHiring: !!projectData.isHiring,
      hiringRoles: projectData.hiringRoles || [],
      hiringDetails: projectData.hiringDetails || [],
      bookmarked: false,
      investmentStage: projectData.investmentStage || "Pre-Seed",
    };

    db.update("irProjects", (projects) => {
      const idx = projects.findIndex((p) => p.id === newProject.id);
      if (idx >= 0) {
        const updated = [...projects];
        updated[idx] = { ...updated[idx], ...newProject };
        return updated;
      }
      return [newProject, ...projects];
    });

    // Notification to student
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      type: "team",
      title: `[프로젝트 등록] ${newProject.teamName}`,
      message: `AI가 '${newProject.field}' 분야 및 핵심 키워드를 자동 태깅하여 등록 완료했습니다.`,
      time: "방금 전",
      isRead: false,
    };
    db.update("notifications", (notifs) => [newNotif, ...notifs]);

    res.status(201).json({ project: newProject });
  } catch (error: any) {
    console.error("[IR API] POST /projects error:", error);
    res.status(500).json({ error: "프로젝트 등록에 실패했습니다." });
  }
});

// PUT /api/ir/projects/:id (Update)
router.put("/projects/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body as Partial<IRProject>;

  let updatedProject: IRProject | null = null;
  db.update("irProjects", (projects) =>
    projects.map((p) => {
      if (p.id === id) {
        updatedProject = { ...p, ...updateData };
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

// POST /api/ir/projects/:id/bookmark (Toggle bookmark)
router.post("/projects/:id/bookmark", (req, res) => {
  const { id } = req.params;
  let currentBookmarked = false;
  let foundProject: IRProject | null = null;

  db.update("irProjects", (projects) =>
    projects.map((p) => {
      if (p.id === id) {
        currentBookmarked = !p.bookmarked;
        foundProject = { ...p, bookmarked: currentBookmarked };
        return foundProject;
      }
      return p;
    })
  );

  if (!foundProject) {
    return res.status(404).json({ error: "Project not found" });
  }

  const project: IRProject = foundProject;

  // If bookmarked, trigger notification
  if (currentBookmarked) {
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      type: "investor",
      title: "투자자 관심 알림",
      message: `'${project.teamName}' 프로젝트가 관심 스타트업에 등록되었습니다.`,
      time: "방금 전",
      isRead: false,
    };
    db.update("notifications", (notifs) => [notif, ...notifs]);
  }

  res.json({ success: true, bookmarked: currentBookmarked, project });
});

// POST /api/ir/projects/:id/apply (Job Application)
router.post("/projects/:id/apply", (req, res) => {
  const { id } = req.params;
  const { roleId, applicantName = "김수강생", applicantEmail = "student@mail.com", portfolioUrl, coverLetter } = req.body;

  const project = db.get("irProjects").find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const newApp: JobApplication = {
    id: `app-${Date.now()}`,
    projectId: id,
    roleId,
    applicantName,
    applicantEmail,
    portfolioUrl,
    coverLetter: coverLetter || "",
    createdAt: new Date().toISOString(),
  };

  db.update("applications", (apps) => [newApp, ...(apps || [])]);

  // Notify
  const notif: Notification = {
    id: `notif-${Date.now()}`,
    type: "team",
    title: `[채용 지원 완료] ${project.teamName}`,
    message: `'${project.teamName}' 채용 포지션에 성공적으로 지원서를 제출했습니다.`,
    time: "방금 전",
    isRead: false,
  };
    db.update("notifications", (notifs) => [notif, ...notifs]);

    res.status(201).json({ success: true, application: newApp });
  });

// POST /api/ir/projects/:id/virtual-ir (Schedule Virtual IR Pitching Room)
router.post("/projects/:id/virtual-ir", (req, res) => {
  const { id } = req.params;
  const { investorName = "이벤처", scheduledAt = "2025-09-15 14:00", feedbackNotes } = req.body;

  const project = db.get("irProjects").find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const meeting = {
    id: `vir-${Date.now()}`,
    projectId: id,
    projectName: project.title,
    investorName,
    scheduledAt,
    meetingLink: `https://meet.jit.si/LaunchBiz-${id.slice(0, 6)}`,
    status: "확정",
    feedbackNotes: feedbackNotes || "AI 비즈니스 모델 및 시장 진입 전략 집중 질의",
  };

  const notif: Notification = {
    id: `notif-${Date.now()}`,
    type: "investor",
    title: `[가상 IR 피칭룸 예약] ${project.teamName}`,
    message: `${investorName} 심사역과 가상 IR 화상 피칭룸(${scheduledAt})이 예약되었습니다.`,
    time: "방금 전",
    isRead: false,
  };
  db.update("notifications", (notifs) => [notif, ...notifs]);

  res.status(201).json({ success: true, meeting });
});

// POST /api/ir/projects/:id/nda (Sign NDA / Letter of Intent)
router.post("/projects/:id/nda", (req, res) => {
  const { id } = req.params;
  const { investorName = "이벤처", termsSummary } = req.body;

  const project = db.get("irProjects").find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const nda = {
    id: `nda-${Date.now()}`,
    projectId: id,
    projectName: project.title,
    investorName,
    agreedAt: new Date().toISOString().split("T")[0],
    status: "서명완료",
    termsSummary: termsSummary || "지식재산권 보호 및 비공개 기술정보 2년간 비밀 유지",
  };

  const notif: Notification = {
    id: `notif-${Date.now()}`,
    type: "investor",
    title: `[간편 전자 계약] NDA 체결 완료`,
    message: `'${project.teamName}' 프로젝트에 대한 NDA 및 기초 투자 의향서 서명이 완료되었습니다.`,
    time: "방금 전",
    isRead: false,
  };
  db.update("notifications", (notifs) => [notif, ...notifs]);

  res.status(201).json({ success: true, nda });
});

export default router;

