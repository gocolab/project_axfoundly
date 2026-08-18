import { Router } from "express";
import { db } from "../db.js";
import type { IRProject, JobApplication, Notification } from "../../src/types.js";

const router = Router();

// GET /api/ir/projects
router.get("/projects", (req, res) => {
  const { field, search, page, limit } = req.query as {
    field?: string;
    search?: string;
    page?: string;
    limit?: string;
  };

  let projects = db.get("irProjects");

  if (field && field !== "전체") {
    projects = projects.filter((p) => p.field === field);
  }

  if (search) {
    const q = search.toLowerCase();
    projects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.teamName.toLowerCase().includes(q) ||
        p.oneLiner.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
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

// POST /api/ir/projects (Create or update project)
router.post("/projects", (req, res) => {
  const projectData = req.body as Partial<IRProject>;
  if (!projectData.teamName || !projectData.title) {
    return res.status(400).json({ error: "Team name and title are required" });
  }

  const newProject: IRProject = {
    id: projectData.id || `p-${Date.now()}`,
    teamName: projectData.teamName,
    anonymousTeamName: projectData.anonymousTeamName || `⚡ ${projectData.teamName} (스텔스)`,
    title: projectData.title,
    oneLiner: projectData.oneLiner || "",
    description: projectData.description || "",
    field: projectData.field || "AI/ML",
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
    message: `IR 스타트업 페이지에 '${newProject.title}' 프로젝트가 성공적으로 등록/업데이트되었습니다.`,
    time: "방금 전",
    isRead: false,
  };
  db.update("notifications", (notifs) => [newNotif, ...notifs]);

  res.status(201).json({ project: newProject });
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

export default router;
