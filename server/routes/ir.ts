import { Router } from "express";
import { db } from "../db.js";
import { classifyContent } from "../services/aiClassifier.js";
import type { IRProject, JobApplication, Notification, IdeaRequest, IdeaProposal } from "../../src/types.js";

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

// ── Startup & IR Reverse Proposals (아이디어 제작 요청 & 빌더 역제안 API) ──

// GET /api/ir/idea-requests
router.get("/idea-requests", (req, res) => {
  const { category, tag, search, sort = "popular", status, page, limit } = req.query as {
    category?: string;
    tag?: string;
    search?: string;
    sort?: "popular" | "recent";
    status?: string;
    page?: string;
    limit?: string;
  };

  let requests = (db.get("ideaRequests") || []) as IdeaRequest[];
  const proposals = (db.get("ideaProposals") || []) as IdeaProposal[];

  requests = requests.map((r) => ({
    ...r,
    proposals: proposals.filter((p) => p.requestId === r.id),
  }));

  if (category && category !== "전체") {
    requests = requests.filter((r) => r.category === category);
  }

  if (tag && tag !== "전체") {
    requests = requests.filter((r) => r.tags?.includes(tag));
  }

  if (status && status !== "전체") {
    requests = requests.filter((r) => r.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    requests = requests.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.problem.toLowerCase().includes(q) ||
        r.solutionConcept.toLowerCase().includes(q) ||
        r.requestedBy?.userName.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (sort === "popular") {
    requests.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
  } else {
    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const pageNum = parseInt(page || "1", 10);
  const limitNum = parseInt(limit || "100", 10);
  const total = requests.length;
  const paginated = requests.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    requests: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// POST /api/ir/idea-requests (Create new request)
router.post("/idea-requests", async (req, res) => {
  try {
    const {
      title,
      problem,
      solutionConcept,
      category,
      tags,
      requiredRoles,
      rewardType,
      rewardDetail,
      submissionDeadline,
      selectionDate,
      requestedBy,
    } = req.body;
    if (!title || !problem || !solutionConcept) {
      return res.status(400).json({ error: "제목, 문제점, 솔루션 컨셉은 필수 항목입니다." });
    }

    let finalTags = tags || [];
    let finalCategory = category || "AI/SaaS";

    if (!finalTags.length || !finalCategory) {
      const classified = await classifyContent("ir", { title, problem, solution: solutionConcept });
      finalTags = finalTags.length ? finalTags : classified.tags;
      finalCategory = finalCategory || classified.category;
    }

    const newRequest: IdeaRequest = {
      id: `ir-req-${Date.now()}`,
      title,
      problem,
      solutionConcept,
      category: finalCategory,
      tags: finalTags,
      requiredRoles: Array.isArray(requiredRoles) && requiredRoles.length ? requiredRoles : ["개발자", "디자이너"],
      rewardType: rewardType || "지분공유(코파운더)",
      rewardDetail: rewardDetail || "협의",
      submissionDeadline: submissionDeadline || undefined,
      selectionDate: selectionDate || undefined,
      requestedBy: requestedBy || {
        userId: "u-current",
        userName: "김수강생",
        avatar: "",
      },
      upvotes: [requestedBy?.userId || "u-current"],
      upvoteCount: 1,
      status: "모집중",
      selectedProposalIds: [],
      matchedProjectIds: [],
      createdAt: new Date().toISOString(),
    };

    db.update("ideaRequests", (list) => [newRequest, ...(list || [])]);

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      type: "team",
      title: "아이디어 제작 의뢰 등록 완료",
      message: `'${title}' 아이디어 제작 의뢰가 성공적으로 등록되었습니다. (마감: ${submissionDeadline || "상시"})`,
      time: "방금 전",
      isRead: false,
    };
    db.update("notifications", (notifs) => [notif, ...notifs]);

    res.status(201).json({ success: true, request: newRequest });
  } catch (error) {
    console.error("Error creating idea request:", error);
    res.status(500).json({ error: "Failed to create idea request" });
  }
});

// GET /api/ir/idea-requests/:id
router.get("/idea-requests/:id", (req, res) => {
  const { id } = req.params;
  const request = (db.get("ideaRequests") || []).find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ error: "아이디어 요청을 찾을 수 없습니다." });
  }
  const proposals = (db.get("ideaProposals") || []).filter((p) => p.requestId === id);
  res.json({ request: { ...request, proposals } });
});

// POST /api/ir/idea-requests/:id/upvote
router.post("/idea-requests/:id/upvote", (req, res) => {
  const { id } = req.params;
  const { userId = "u-student-1" } = req.body;

  let updatedRequest: IdeaRequest | null = null;
  let isUpvoted = false;

  db.update("ideaRequests", (list) =>
    (list || []).map((r) => {
      if (r.id === id) {
        const upvotes = r.upvotes || [];
        const exists = upvotes.includes(userId);
        let newUpvotes: string[];
        if (exists) {
          newUpvotes = upvotes.filter((u) => u !== userId);
          isUpvoted = false;
        } else {
          newUpvotes = [...upvotes, userId];
          isUpvoted = true;
        }
        const count = newUpvotes.length;
        updatedRequest = { ...r, upvotes: newUpvotes, upvoteCount: count };
        return updatedRequest;
      }
      return r;
    })
  );

  if (!updatedRequest) {
    return res.status(404).json({ error: "아이디어 요청을 찾을 수 없습니다." });
  }

  res.json({ success: true, isUpvoted, request: updatedRequest });
});

// POST /api/ir/idea-requests/:id/proposals (Builder submits proposal & auto-links to IRProject)
router.post("/idea-requests/:id/proposals", (req, res) => {
  const { id } = req.params;
  const {
    proposerId = "u-builder-1",
    proposerName = "오승환",
    proposerAvatar = "",
    teamSummary = "풀스택 개발팀",
    techStack = ["React", "Node.js", "MongoDB"],
    planSummary = "",
    estimatedWeeks = 4,
    portfolioUrl = "",
    contactEmail = "",
    demoVideoUrl = "",
    prototypeUrl = "",
    visibility = "public",
  } = req.body;

  const request = (db.get("ideaRequests") || []).find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ error: "아이디어 요청을 찾을 수 없습니다." });
  }

  const proposalId = `ip-${Date.now()}`;
  const linkedProjectId = `ir-prop-${Date.now()}`;

  // 1. Create linked IRProject in irProjects
  const linkedProject: IRProject = {
    id: linkedProjectId,
    teamName: `${proposerName} 팀`,
    title: `[${request.title.slice(0, 20)}...] ${proposerName} MVP`,
    oneLiner: planSummary || request.solutionConcept.slice(0, 60),
    description: `[아이디어 발제 과제 연동]\n${request.problem}\n\n[솔루션 및 빌더 개발 계획]\n${planSummary}`,
    field: request.category,
    tags: request.tags,
    aiSummary: `아이디어 의뢰 연계 프로젝트 (${request.title}) - ${proposerName} 빌더팀`,
    thumbnail: "",
    demoVideoUrl: demoVideoUrl || undefined,
    prototypeUrl: prototypeUrl || undefined,
    originIdeaRequestId: request.id,
    originIdeaTitle: request.title,
    originProposalId: proposalId,
    visibility: visibility as "public" | "requester_only",
    members: [
      {
        name: proposerName,
        role: "기술 총괄(CTO) / 빌더 리드",
        avatar: proposerAvatar,
        bio: teamSummary,
      },
    ],
    businessModel: "B2B SaaS / 플랫폼 수수료",
    problem: request.problem,
    solution: request.solutionConcept,
    isHiring: true,
    hiringRoles: request.requiredRoles || ["풀스택 개발자"],
    investmentStage: "Pre-Seed",
  };

  db.update("irProjects", (projects) => [linkedProject, ...(projects || [])]);

  // 2. Create new IdeaProposal
  const newProposal: IdeaProposal = {
    id: proposalId,
    requestId: id,
    proposerId,
    proposerName,
    proposerAvatar,
    teamSummary,
    techStack: Array.isArray(techStack) ? techStack : [techStack],
    planSummary,
    estimatedWeeks: Number(estimatedWeeks) || 4,
    portfolioUrl,
    contactEmail,
    demoVideoUrl: demoVideoUrl || undefined,
    prototypeUrl: prototypeUrl || undefined,
    visibility: visibility as "public" | "requester_only",
    status: "대기중",
    linkedProjectId,
    createdAt: new Date().toISOString(),
  };

  db.update("ideaProposals", (list) => [newProposal, ...(list || [])]);

  // 3. Update IdeaRequest status & matched project IDs
  db.update("ideaRequests", (list) =>
    (list || []).map((r) => {
      if (r.id === id) {
        const currentMatched = r.matchedProjectIds || [];
        const nextStatus = r.status === "모집중" ? "선발진행중" : r.status;
        return {
          ...r,
          status: nextStatus,
          matchedProjectIds: [...currentMatched, linkedProjectId],
        };
      }
      return r;
    })
  );

  const notif: Notification = {
    id: `notif-${Date.now()}`,
    type: "team",
    title: "새로운 빌더 제작 제안서 도착 (IR 연동 완료)",
    message: `'${request.title}' 의뢰에 ${proposerName} 팀의 제작 제안서가 등록되어 스타트업 IR에 연동되었습니다.`,
    time: "방금 전",
    isRead: false,
  };
  db.update("notifications", (notifs) => [notif, ...notifs]);

  res.status(201).json({ success: true, proposal: newProposal, project: linkedProject });
});

// POST /api/ir/idea-requests/:id/select-proposals (Multi-selection of proposals for negotiation)
router.post("/idea-requests/:id/select-proposals", (req, res) => {
  const { id } = req.params;
  const { selectedProposalIds = [] } = req.body as { selectedProposalIds: string[] };

  const request = (db.get("ideaRequests") || []).find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ error: "아이디어 요청을 찾을 수 없습니다." });
  }

  // Update proposals status
  db.update("ideaProposals", (list) =>
    (list || []).map((p) => {
      if (p.requestId === id) {
        if (selectedProposalIds.includes(p.id)) {
          return { ...p, status: "선발(협의중)" };
        } else if (p.status === "선발(협의중)") {
          return { ...p, status: "대기중" };
        }
      }
      return p;
    })
  );

  // Update request status
  const nextStatus = selectedProposalIds.length > 0 ? "협의중" : "선발진행중";
  let updatedReq: IdeaRequest | null = null;
  db.update("ideaRequests", (list) =>
    (list || []).map((r) => {
      if (r.id === id) {
        updatedReq = { ...r, status: nextStatus, selectedProposalIds };
        return updatedReq;
      }
      return r;
    })
  );

  res.json({ success: true, request: updatedReq, selectedProposalIds });
});

// POST /api/ir/idea-requests/:id/accept-proposal (Finalize matching with specific proposal)
router.post("/idea-requests/:id/accept-proposal", (req, res) => {
  const { id } = req.params;
  const { proposalId } = req.body;

  const request = (db.get("ideaRequests") || []).find((r) => r.id === id);
  const proposal = (db.get("ideaProposals") || []).find((p) => p.id === proposalId);

  if (!request || !proposal) {
    return res.status(404).json({ error: "요청 또는 제안서를 찾을 수 없습니다." });
  }

  // 1. Update proposal status
  db.update("ideaProposals", (list) =>
    (list || []).map((p) => {
      if (p.requestId === id) {
        return p.id === proposalId ? { ...p, status: "최종채택" } : { ...p, status: "미선발" };
      }
      return p;
    })
  );

  // 2. Find or create linked IRProject
  const targetProjectId = proposal.linkedProjectId || `ir-rev-${Date.now()}`;
  let targetProject = (db.get("irProjects") || []).find((p) => p.id === targetProjectId);

  if (targetProject) {
    // Add requester as founder to existing linked project
    db.update("irProjects", (projects) =>
      (projects || []).map((p) => {
        if (p.id === targetProjectId) {
          const members = p.members || [];
          const hasRequester = members.some((m) => m.name === request.requestedBy.userName);
          return {
            ...p,
            members: hasRequester
              ? members
              : [
                  {
                    name: request.requestedBy.userName,
                    role: "아이디어 발제 / 기획 리드",
                    avatar: request.requestedBy.avatar,
                  },
                  ...members,
                ],
            investmentStage: "Seed" as const,
            visibility: "public" as const,
          };
        }
        return p;
      })
    );
    targetProject = (db.get("irProjects") || []).find((p) => p.id === targetProjectId);
  } else {
    // Create new project
    const newProject: IRProject = {
      id: targetProjectId,
      teamName: `${request.title.slice(0, 10)} 팀`,
      title: request.title,
      oneLiner: request.solutionConcept.slice(0, 60),
      description: `${request.problem}\n\n[솔루션]\n${request.solutionConcept}\n\n[빌더 제안 플랜]\n${proposal.planSummary}`,
      field: request.category,
      tags: request.tags,
      aiSummary: `아이디어 역제안 매칭 완료: ${request.requestedBy.userName} 발제자 x ${proposal.proposerName} 빌더팀`,
      thumbnail: "",
      demoVideoUrl: proposal.demoVideoUrl,
      prototypeUrl: proposal.prototypeUrl,
      originIdeaRequestId: request.id,
      originIdeaTitle: request.title,
      originProposalId: proposal.id,
      visibility: "public",
      members: [
        { name: request.requestedBy.userName, role: "아이디어 발제 / 기획 리드", avatar: request.requestedBy.avatar },
        { name: proposal.proposerName, role: "기술 총괄(CTO) / 빌더 리드", avatar: proposal.proposerAvatar },
      ],
      businessModel: "B2B / B2C 구독 및 수수료 모델",
      problem: request.problem,
      solution: request.solutionConcept,
      isHiring: true,
      hiringRoles: request.requiredRoles || ["풀스택 개발자"],
      investmentStage: "Seed",
    };
    db.update("irProjects", (projects) => [newProject, ...projects]);
    targetProject = newProject;
  }

  // 3. Mark request as 매칭완료
  db.update("ideaRequests", (list) =>
    (list || []).map((r) => (r.id === id ? { ...r, status: "매칭완료", matchedProjectId: targetProjectId } : r))
  );

  // 4. Notification
  const notif: Notification = {
    id: `notif-${Date.now()}`,
    type: "investor",
    title: "🚀 스타트업 프로젝트 최종 제작 매칭 완료!",
    message: `'${request.title}' 의뢰에 ${proposal.proposerName} 팀이 최종 매칭되어 정식 IR 스타트업으로 승격되었습니다.`,
    time: "방금 전",
    isRead: false,
  };
  db.update("notifications", (notifs) => [notif, ...notifs]);

  res.json({
    success: true,
    project: targetProject,
    request: { ...request, status: "매칭완료", matchedProjectId: targetProjectId },
  });
});

// DELETE /api/ir/idea-requests/:id
router.delete("/idea-requests/:id", (req, res) => {
  const { id } = req.params;
  db.update("ideaRequests", (list) => (list || []).filter((r) => r.id !== id));
  db.update("ideaProposals", (list) => (list || []).filter((p) => p.requestId !== id));
  res.json({ success: true });
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

export default router;

