import React from "react";
import {
  ArrowLeft,
  Users,
  Briefcase,
  Target,
  Lightbulb,
  Search,
  Send,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Play,
  Video,
  Eye,
  EyeOff,
  Plus,
  X,
  Link,
  FileText,
  CheckCircle,
  Share2,
  Lock,
  Sparkles,
  ThumbsUp,
  Wrench,
  DollarSign,
  Layers,
  Code2,
  Calendar,
  Globe,
  Check,
  CheckCircle2,
  Trash2,
  Edit3,
} from "lucide-react";
import type { IRProject, UserRole, HiringRoleDetail, InvestmentProposal, IdeaRequest, IdeaProposal } from "../types";
import Pagination from "./common/Pagination";
import InvestmentProposalModal from "./InvestmentProposalModal";
import JobApplicationModal from "./JobApplicationModal";
import ProjectCreateEditModal, { convertToEmbedUrl } from "./ProjectCreateEditModal";
import IdeaRequestModal from "./IdeaRequestModal";
import IdeaProposalModal from "./IdeaProposalModal";
import { useToast } from "./common/Toast";
import { api } from "../lib/api";

export const getDDayText = (dateStr?: string) => {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "접수 마감";
  if (diffDays === 0) return "D-Day (오늘)";
  return `D-${diffDays}`;
};

export const getEmploymentTypeBadgeClass = (type?: string) => {
  switch (type) {
    case "코파운더":
      return "bg-brand-tertiary/20 text-brand-tertiary border-brand-tertiary/40";
    case "풀타임":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "파트타임":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "인턴":
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    default:
      return "bg-brand-primary/20 text-brand-primary border-brand-primary/30";
  }
};

export const getInvestmentStageBadgeClass = (stage?: string) => {
  switch (stage) {
    case "Pre-Seed":
      return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    case "Seed":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    case "Pre-A":
      return "bg-blue-500/20 text-blue-300 border-blue-500/40";
    case "Series A":
      return "bg-purple-500/20 text-purple-300 border-purple-500/40";
    default:
      return "bg-[#030712]/70 text-white border-white/10";
  }
};

interface IRPageProps {
  projects: IRProject[];
  userRoles: UserRole[];
  isLoggedIn: boolean;
  userName?: string;
  onLoginClick: () => void;
  onToggleBookmark: (id: string) => void;
  onSendProposal?: (proposal: InvestmentProposal) => void;
  onSaveProject?: (project: IRProject) => void;
  initialProjectId?: string | null;
  onClearSelectedProject?: () => void;
}

export default function IRPage({
  projects,
  userRoles,
  isLoggedIn,
  userName,
  onLoginClick,
  onToggleBookmark,
  onSendProposal,
  onSaveProject,
  initialProjectId,
  onClearSelectedProject,
}: IRPageProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = React.useState<"browse" | "ideas">("browse");

  const [localProjects, setLocalProjects] = React.useState<IRProject[]>(projects);
  React.useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  const [selectedProject, setSelectedProject] = React.useState<IRProject | null>(() => {
    if (initialProjectId) {
      return projects.find((p) => p.id === initialProjectId) || null;
    }
    return null;
  });

  React.useEffect(() => {
    if (initialProjectId) {
      const match = projects.find((p) => p.id === initialProjectId);
      if (match) {
        setSelectedProject(match);
      }
    }
  }, [initialProjectId, projects]);

  const [activeField, setActiveField] = React.useState<string>("전체");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [searchText, setSearchText] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  // Detail View State
  const [isAnonymousMode, setIsAnonymousMode] = React.useState(false);
  const [showProposalModal, setShowProposalModal] = React.useState(false);
  const [proposalMessage, setProposalMessage] = React.useState("");
  const [proposalSent, setProposalSent] = React.useState(false);

  // Modals
  const [selectedHiringRole, setSelectedHiringRole] = React.useState<HiringRoleDetail | null>(null);
  const [showApplyModal, setShowApplyModal] = React.useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<IRProject | null>(null);

  // ── Reverse Proposal (아이디어 제작 요청소) State ──
  const [ideaRequests, setIdeaRequests] = React.useState<IdeaRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = React.useState(false);
  const [selectedIdeaRequest, setSelectedIdeaRequest] = React.useState<IdeaRequest | null>(null);
  const [showIdeaRequestModal, setShowIdeaRequestModal] = React.useState(false);
  const [showIdeaProposalModal, setShowIdeaProposalModal] = React.useState(false);
  const [proposalTargetIdea, setProposalTargetIdea] = React.useState<IdeaRequest | null>(null);
  const [ideaSort, setIdeaSort] = React.useState<"deadline" | "popular" | "recent">("deadline");
  const [ideaStatusFilter, setIdeaStatusFilter] = React.useState<string>("전체");
  const [ideaPage, setIdeaPage] = React.useState(1);
  const ideasPerPage = 6;

  const fetchIdeaRequests = React.useCallback(async () => {
    try {
      setRequestsLoading(true);
      const res = await api.getIdeaRequests({
        category: activeField === "전체" ? undefined : activeField,
        search: searchText || undefined,
        sort: ideaSort,
        status: ideaStatusFilter === "전체" ? undefined : ideaStatusFilter,
      });
      const fetched = res?.requests || [];
      setIdeaRequests(fetched);
      setSelectedIdeaRequest((prev) => {
        if (!prev) return null;
        const found = fetched.find((r) => r.id === prev.id);
        return found || prev;
      });
    } catch (e) {
      console.error("Failed to fetch idea requests", e);
    } finally {
      setRequestsLoading(false);
    }
  }, [activeField, searchText, ideaSort, ideaStatusFilter]);

  React.useEffect(() => {
    if (activeTab === "ideas") {
      fetchIdeaRequests();
    }
  }, [activeTab, fetchIdeaRequests]);

  const handleUpvoteIdea = async (e: React.MouseEvent, reqId: string) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onLoginClick();
      return;
    }
    try {
      const res = await api.upvoteIdeaRequest(reqId, userName);
      setIdeaRequests((prev) =>
        prev.map((r) => (r.id === reqId ? res.request : r))
      );
      if (selectedIdeaRequest?.id === reqId) {
        setSelectedIdeaRequest(res.request);
      }
    } catch (err) {
      console.error("Upvote failed", err);
    }
  };

  const handleUpvoteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onLoginClick();
      return;
    }
    try {
      const targetUser = userName;
      const res = await api.upvoteIRProject(projectId, targetUser);
      setLocalProjects((prev) =>
        prev.map((p) => (String(p.id) === String(projectId) ? res.project : p))
      );
      if (String(selectedProject?.id) === String(projectId)) {
        setSelectedProject(res.project);
      }
    } catch (err) {
      console.error("Upvote project failed", err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmed = await toast.confirm({
      title: "프로젝트 삭제",
      message: "정말 이 스타트업 프로젝트를 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.",
      confirmText: "삭제",
      cancelText: "취소",
      type: "danger",
    });
    if (!confirmed) return;

    try {
      await api.deleteIRProject(projectId);
      toast.success("삭제 완료", "프로젝트가 성공적으로 삭제되었습니다.");
      setLocalProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        onClearSelectedProject?.();
      }
    } catch (err) {
      console.error("Delete project failed", err);
      toast.error("삭제 실패", "일시적인 오류가 발생했습니다.");
    }
  };

  const handleDeleteIdeaRequest = async (reqId: string) => {
    const confirmed = await toast.confirm({
      title: "아이디어 의뢰서 삭제",
      message: "정말 이 아이디어 의뢰서를 삭제하시겠습니까?\n제출된 빌더 팀 제안서도 함께 정리됩니다.",
      confirmText: "삭제",
      cancelText: "취소",
      type: "danger",
    });
    if (!confirmed) return;

    try {
      await api.deleteIdeaRequest(reqId);
      toast.success("삭제 완료", "아이디어 제작 의뢰서가 삭제되었습니다.");
      setIdeaRequests((prev) => prev.filter((r) => r.id !== reqId));
      if (selectedIdeaRequest?.id === reqId) {
        setSelectedIdeaRequest(null);
      }
    } catch (err) {
      console.error("Delete idea request failed", err);
      toast.error("삭제 실패", "일시적인 오류가 발생했습니다.");
    }
  };

  const handleAcceptIdeaProposal = async (reqId: string, propId: string) => {
    const confirmed = await toast.confirm({
      title: "빌더 매칭 및 정식 스타트업 IR 승격",
      message: "이 빌더 팀의 제안을 수락하시겠습니까?\n수락 시 정식 스타트업 IR 프로젝트로 자동 등록되어 팀빌딩 및 투자 유치 단계로 진입합니다.",
      confirmText: "매칭 확정 및 IR 등록",
      cancelText: "취소",
      type: "success",
    });
    if (!confirmed) return;

    try {
      const res = await api.acceptIdeaProposal(reqId, propId);
      toast.success(
        "🎉 축하합니다! 스타트업 IR 프로젝트 등록 완료",
        "스타트업 탐색 탭에서 새롭게 승격된 프로젝트를 확인하실 수 있습니다."
      );
      if (onSaveProject && res?.project) {
        onSaveProject(res.project);
      }
      fetchIdeaRequests();
      setSelectedIdeaRequest(null);
    } catch (err) {
      console.error("Accept idea proposal failed", err);
      toast.error("제안 수락 실패", "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleToggleSelectProposal = async (reqId: string, propId: string) => {
    const currentSelected = selectedIdeaRequest?.selectedProposalIds || [];
    const isAlreadySelected = currentSelected.includes(propId);
    const updated = isAlreadySelected
      ? currentSelected.filter((id) => id !== propId)
      : [...currentSelected, propId];

    try {
      const res = await api.selectIdeaProposals(reqId, updated);
      if (res?.request) {
        setIdeaRequests((prev) =>
          prev.map((r) =>
            r.id === reqId
              ? { ...r, selectedProposalIds: updated, status: res.request.status }
              : r
          )
        );
        if (selectedIdeaRequest?.id === reqId) {
          setSelectedIdeaRequest((prev) =>
            prev
              ? {
                  ...prev,
                  selectedProposalIds: updated,
                  status: res.request.status,
                  proposals: prev.proposals?.map((p) =>
                    p.id === propId
                      ? { ...p, status: isAlreadySelected ? "대기중" : "선발(협의중)" }
                      : p
                  ),
                }
              : null
          );
        }
        if (isAlreadySelected) {
          toast.info("선발 취소", "해당 제안 팀이 협의 대상에서 제외되었습니다.");
        } else {
          toast.success(
            "협의 대상 선발 완료",
            "해당 제안 팀이 협의 대상(선발)으로 지정되었습니다. 복수 팀과 조건을 조율할 수 있습니다."
          );
        }
      }
    } catch (err) {
      console.error("Select proposal failed", err);
      toast.error("선발 처리 실패", "일시적인 오류가 발생했습니다.");
    }
  };

  const [applicantNote, setApplicantNote] = React.useState("");

  const dynamicFields = React.useMemo(() => {
    const fieldSet = new Set<string>();
    projects.forEach((p) => {
      if (p.field) fieldSet.add(p.field);
    });
    return ["전체", ...Array.from(fieldSet)];
  }, [projects]);

  const popularTags = React.useMemo(() => {
    const tagCount: Record<string, number> = {};
    projects.forEach((p) => {
      p.tags?.forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });
    return Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]).slice(0, 8);
  }, [projects]);

  // Filter and sort projects (생성일 역순)
  const filtered = React.useMemo(() => {
    return localProjects
      .filter((p) => {
        const matchField = activeField === "전체" || p.field === activeField;
        const matchTag = !activeTag || p.tags?.includes(activeTag);
        const q = searchText.toLowerCase();
        const matchSearch =
          !searchText ||
          p.teamName.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.oneLiner.toLowerCase().includes(q) ||
          p.solution.toLowerCase().includes(q) ||
          p.field?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q));
        return matchField && matchTag && matchSearch;
      })
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (parseInt((a.id || "").replace(/\D/g, ""), 10) || 0);
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (parseInt((b.id || "").replace(/\D/g, ""), 10) || 0);
        return timeB - timeA;
      });
  }, [localProjects, activeField, activeTag, searchText]);

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProjects = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeField, activeTag, searchText]);

  // When project changes, sync anonymous state
  React.useEffect(() => {
    if (selectedProject) {
      setIsAnonymousMode(selectedProject.isAnonymous || false);
    }
  }, [selectedProject]);

  // ── IR Detail View ──
  if (selectedProject) {
    // Default mock hiring roles if none specified
    const hiringDetails: HiringRoleDetail[] = selectedProject.hiringDetails || [
      {
        id: "hr-1",
        role: "AI/LLM 파이프라인 개발자",
        type: "풀타임",
        compensation: "월 400~550만원",
        equity: "1.0% ~ 3.0%",
        skills: ["Python", "LangChain", "FastAPI", "VectorDB"],
        applyMethod: "internal",
        description: "RAG 시스템 아키텍처 및 자율 에이전트 엔지니어링 리드",
      },
      {
        id: "hr-2",
        role: "B2B SaaS 그로스/마케터",
        type: "파트타임",
        compensation: "월 200~300만원",
        equity: "협의",
        skills: ["GA4", "콘텐츠 마케팅", "B2B 세일즈"],
        applyMethod: "link",
        externalLink: "https://wanted.co.kr",
        description: "초기 기업 대상 파일럿 고객 유치 및 퍼널 최적화",
      },
    ];

    const currentTeamName = isAnonymousMode
      ? selectedProject.anonymousTeamName || `${selectedProject.field} 스텔스 창업팀`
      : selectedProject.teamName;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
        <button
          onClick={() => {
            setSelectedProject(null);
            setProposalSent(false);
            onClearSelectedProject?.();
          }}
          className="flex items-center gap-1.5 text-sm text-brand-on-surface-variant hover:text-white mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} />
          스타트업 목록으로
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Project Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header Card — 일관된 바이올렛/인디고 썸네일 헤더 */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="h-24 sm:h-28 relative overflow-hidden bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] flex items-center justify-center">
                <span className="text-4xl opacity-50 drop-shadow-md select-none">🚀</span>

                {/* Badges */}
                <div className="absolute top-3.5 left-4 flex gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md border bg-[#4f46e5]/30 border-[#6366f1]/60 text-[#a5b4fc]">
                    {selectedProject.field}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md border ${getInvestmentStageBadgeClass(selectedProject.investmentStage)}`}>
                    {selectedProject.investmentStage}
                  </span>
                  {selectedProject.demoVideoUrl && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-300 flex items-center gap-1">
                      <Play size={11} /> 동작 영상
                    </span>
                  )}
                </div>

                {/* Team Hiring Badge & Anonymity Indicator */}
                <div className="absolute top-3.5 right-4 flex items-center gap-2">
                  {isAnonymousMode && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#030712]/80 text-brand-tertiary border border-brand-tertiary/40 flex items-center gap-1 backdrop-blur-md">
                      <Lock size={12} /> 스텔스(비실명) 모드
                    </span>
                  )}
                  {selectedProject.isHiring && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 backdrop-blur-md">
                      🔥 팀원 모집 중
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                        {currentTeamName}
                      </h1>
                      {/* 작성자 / 관리자 수정·삭제 액션 버튼 */}
                      {isLoggedIn &&
                        (selectedProject.authorName === userName ||
                          selectedProject.members?.some((m) => m.name === userName || m.anonymousName === userName) ||
                          userRoles.includes("admin") ||
                          userRoles.includes("manager")) && (
                          <div className="inline-flex items-center gap-1.5 ml-1">
                            <button
                              onClick={() => {
                                setEditingProject(selectedProject);
                                setShowCreateProjectModal(true);
                              }}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
                              title="프로젝트 정보 수정"
                            >
                              <Edit3 size={12} />
                              <span>수정</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProject(selectedProject.id)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-colors cursor-pointer"
                              title="프로젝트 삭제"
                            >
                              <Trash2 size={12} />
                              <span>삭제</span>
                            </button>
                          </div>
                        )}
                    </div>
                    <p className="text-sm font-semibold text-brand-primary mt-1">
                      {selectedProject.title}
                    </p>
                  </div>

                  {/* Real-Name vs Anonymous Toggle Switch */}
                  <div className="flex items-center gap-2 bg-brand-surface-low px-3 py-1.5 rounded-xl border border-brand-border/40">
                    <button
                      onClick={() => setIsAnonymousMode(!isAnonymousMode)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isAnonymousMode
                          ? "bg-brand-tertiary/20 text-brand-tertiary border border-brand-tertiary/40"
                          : "bg-brand-surface-high text-brand-on-surface-variant border border-brand-border/40 hover:text-white"
                      }`}
                      title="실명 / 비실명 표시 방식 전환"
                    >
                      <Lock size={12} />
                      <span>스텔스 모드 {isAnonymousMode ? "ON" : "OFF"}</span>
                    </button>
                  </div>
                </div>

                <p className="text-sm text-brand-on-surface-variant mt-3 leading-relaxed">
                  {selectedProject.oneLiner}
                </p>

                {/* AI 자동 추출 태그 목록 */}
                {selectedProject.tags && selectedProject.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedProject.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-[#6366f1]/15 text-[#a5b4fc] border border-[#6366f1]/30 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 💡 아이디어 제작 의뢰 연계 배너 */}
                {selectedProject.originIdeaRequestId && (
                  <div className="mt-4 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <span className="text-cyan-300 font-bold">아이디어 제작 의뢰 연계 프로젝트:</span>{" "}
                        <span className="text-white/80">{selectedProject.originIdeaTitle || "발제 과제"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProject(null);
                        setActiveTab("ideas");
                        const matchReq = ideaRequests.find((r) => r.id === selectedProject.originIdeaRequestId);
                        if (matchReq) setSelectedIdeaRequest(matchReq);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors font-medium whitespace-nowrap cursor-pointer"
                    >
                      💡 원본 의뢰 및 제안서 보기 →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Demo / Operational Video & Links Section ── */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Video size={18} className="text-brand-primary" />
                  서비스 동작 및 피칭 영상
                </h2>
                {isLoggedIn &&
                  (selectedProject.authorName === userName ||
                    selectedProject.members?.some((m) => m.name === userName || m.anonymousName === userName) ||
                    userRoles.includes("admin") ||
                    userRoles.includes("manager")) && (
                    <button
                      onClick={() => {
                        setEditingProject(selectedProject);
                        setShowCreateProjectModal(true);
                      }}
                      className="text-xs text-brand-primary hover:text-white transition-colors cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-surface-high border border-brand-border/40"
                    >
                      <Edit3 size={12} /> 링크 입력/수정 (수정 화면)
                    </button>
                  )}
              </div>

              {selectedProject.demoVideoUrl || selectedProject.prototypeUrl ? (
                <div className="flex flex-wrap gap-3">
                  {selectedProject.demoVideoUrl && (
                    <a
                      href={selectedProject.demoVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 hover:from-indigo-900 hover:to-purple-900 text-indigo-200 hover:text-white border border-indigo-500/40 hover:border-indigo-400 transition-all font-semibold text-xs shadow-md cursor-pointer group"
                    >
                      <Video size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span>[서비스 동작 및 피칭 영상 바로가기]</span>
                      <ExternalLink size={13} className="text-indigo-300 ml-1 opacity-70 group-hover:opacity-100" />
                    </a>
                  )}

                  {selectedProject.prototypeUrl && (
                    <a
                      href={selectedProject.prototypeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-950/80 to-teal-950/80 hover:from-cyan-900 hover:to-teal-900 text-cyan-200 hover:text-white border border-cyan-500/40 hover:border-cyan-400 transition-all font-semibold text-xs shadow-md cursor-pointer group"
                    >
                      <Globe size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span>[프로토타입 / 배포 사이트 방문]</span>
                      <ExternalLink size={13} className="text-cyan-300 ml-1 opacity-70 group-hover:opacity-100" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center bg-brand-surface-low rounded-xl border border-brand-border/30">
                  <Video size={26} className="text-brand-on-surface-variant mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-brand-on-surface-variant">등록된 시연 영상 또는 웹사이트 링크가 없습니다.</p>
                  <p className="text-[11px] text-slate-500 mt-1">프로젝트 수정 화면에서 각종 링크를 일괄 입력 및 변경할 수 있습니다.</p>
                </div>
              )}
            </div>

            {/* Business Model */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6 shadow-md">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-3">
                <Target size={18} className="text-brand-primary" />
                비즈니스 모델
              </h2>
              <p className="text-sm text-brand-on-surface-variant leading-relaxed">
                {selectedProject.businessModel}
              </p>
            </div>

            {/* Problem & Solution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 shadow-md">
                <h3 className="text-sm font-bold text-brand-accent-rose flex items-center gap-1.5 mb-2.5">
                  <Target size={15} /> 문제 (Problem)
                </h3>
                <p className="text-xs text-brand-on-surface-variant leading-relaxed">
                  {selectedProject.problem}
                </p>
              </div>
              <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 shadow-md">
                <h3 className="text-sm font-bold text-brand-tertiary flex items-center gap-1.5 mb-2.5">
                  <Lightbulb size={15} /> 솔루션 (Solution)
                </h3>
                <p className="text-xs text-brand-on-surface-variant leading-relaxed">
                  {selectedProject.solution}
                </p>
              </div>
            </div>


            {/* ── Hiring Roles with Option Inputs & Link Switching ── */}
            {selectedProject.isHiring && (
              <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <Briefcase size={18} className="text-brand-tertiary" />
                    구인/구직 공고 ({hiringDetails.length}개 포지션)
                  </h2>
                  <span className="text-xs text-brand-tertiary font-semibold">
                    자체 지원 및 외부 채용 링크 지원
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {hiringDetails.map((roleItem) => (
                    <div
                      key={roleItem.id}
                      className="p-4 bg-brand-surface-low rounded-xl border border-brand-border/40 hover:border-brand-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{roleItem.role}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getEmploymentTypeBadgeClass(roleItem.type)}`}>
                            {roleItem.type}
                          </span>
                          {roleItem.equity && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-brand-tertiary/15 text-brand-tertiary font-mono">
                              지분 {roleItem.equity}
                            </span>
                          )}
                          {roleItem.compensation && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-brand-surface-high text-brand-on-surface-variant">
                              {roleItem.compensation}
                            </span>
                          )}
                        </div>

                        {roleItem.description && (
                          <p className="text-[11px] text-brand-on-surface-variant mt-1.5">
                            {roleItem.description}
                          </p>
                        )}

                        {/* Skills */}
                        <div className="flex gap-1.5 flex-wrap mt-2.5">
                          {roleItem.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-brand-surface-high text-brand-on-surface-variant font-mono"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Button: Internal Apply vs External Link */}
                      <div className="flex-shrink-0">
                        {roleItem.applyMethod === "link" && roleItem.externalLink ? (
                          <a
                            href={roleItem.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-brand-surface-high text-white hover:bg-brand-primary-container px-3.5 py-2 rounded-xl border border-brand-border/40 transition-colors flex items-center gap-1.5"
                          >
                            외부 공고 링크 <ExternalLink size={12} />
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedHiringRole(roleItem);
                              setShowApplyModal(true);
                            }}
                            className="text-xs bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            지원하기
                          </button>

                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Team Intro (Real-name / Anonymous) & Actions */}
          <div className="lg:col-span-1 flex flex-col gap-4 sticky top-20 self-start">
            {/* Team Members Card */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              {/* Header Banner */}
              <div className="h-16 relative overflow-hidden bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] flex items-center justify-center">
                <span className="text-2xl opacity-40 drop-shadow-md select-none">👥</span>
                <div className="absolute top-2.5 left-3 flex gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg backdrop-blur-md border bg-[#4f46e5]/30 border-[#6366f1]/60 text-[#a5b4fc]">
                    팀 소개 ({isAnonymousMode ? "비실명 모드" : "실명 공개"})
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#030712]/70 text-white border border-white/10 backdrop-blur-md">
                    {selectedProject.members.length}명
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-3">
                {selectedProject.members.map((member, idx) => {
                  const displayName = isAnonymousMode
                    ? member.anonymousName || `팀원 ${idx + 1} (${member.role})`
                    : member.name;
                  const displayRole = isAnonymousMode
                    ? member.anonymousRole || member.role
                    : member.role;

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 bg-[#0b1329] rounded-xl border border-slate-800/80"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow ${
                          isAnonymousMode
                            ? "bg-gradient-to-br from-teal-600 to-emerald-800"
                            : "bg-gradient-to-br from-brand-primary-container to-brand-secondary"
                        }`}
                      >
                        {isAnonymousMode ? "👤" : member.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                        <p className="text-[10px] text-slate-400">{displayRole}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Investor Actions Card */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="h-16 relative overflow-hidden bg-gradient-to-r from-[#2e1065] via-[#4338ca] to-[#3b0764] flex items-center justify-center">
                <span className="text-2xl opacity-40 drop-shadow-md select-none">💼</span>
                <div className="absolute top-2.5 left-3 flex gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg backdrop-blur-md border bg-[#4f46e5]/30 border-[#6366f1]/60 text-[#a5b4fc]">
                    투자 연계 & 협업
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-3">
                {isLoggedIn ? (
                  <>
                    {proposalSent ? (
                      <div className="text-center py-3 bg-[#0b1329] rounded-xl border border-emerald-500/30">
                        <span className="text-[#34d399] text-xs font-bold flex items-center justify-center gap-1">
                          <CheckCircle size={14} /> 투자 제안이 전송되었습니다
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowProposalModal(true)}
                        className="w-full bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                      >
                        <Send size={15} />
                        투자 제안하기
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={onLoginClick}
                    className="w-full bg-brand-surface-high text-brand-primary hover:text-white hover:bg-brand-surface-highest py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-brand-border"
                  >
                    <Send size={14} />
                    로그인 후 투자 제안하기
                  </button>
                )}

              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    onLoginClick();
                    return;
                  }
                  onToggleBookmark(selectedProject.id);
                  setSelectedProject({
                    ...selectedProject,
                    bookmarked: !selectedProject.bookmarked,
                  });
                }}
                className={`w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  selectedProject.bookmarked
                    ? "border-brand-accent-orange text-brand-accent-orange bg-brand-accent-orange/10 font-bold"
                    : "border-brand-border text-brand-on-surface-variant hover:text-white hover:border-brand-surface-highest"
                }`}
              >
                {selectedProject.bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                {selectedProject.bookmarked ? "관심 스타트업 등록됨" : "관심 스타트업 등록 (북마크)"}
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* ── Modal 3: One-click Job Application Modal ── */}
        <JobApplicationModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          project={selectedProject}
          hiringRole={selectedHiringRole}
          applicantName={isLoggedIn ? "김수강생" : "게스트"}
          applicantEmail="student@mail.com"
          onSuccess={() => {
            setShowApplyModal(false);
          }}
        />

        {/* ── Modal 5: Investment Proposal Modal ── */}
        <InvestmentProposalModal
          project={selectedProject}
          isOpen={showProposalModal}
          onClose={() => setShowProposalModal(false)}
          onProposalSent={(proposal) => {
            setProposalSent(true);
            if (onSendProposal) onSendProposal(proposal);
          }}
        />
      </div>
    );
  }


  // ── IR List & Idea Request View ──
  const filteredIdeaRequests = ideaRequests.filter((r) => {
    const matchField = activeField === "전체" || r.category === activeField;
    const matchTag = !activeTag || r.tags?.includes(activeTag);
    const matchStatus = ideaStatusFilter === "전체" || r.status === ideaStatusFilter;
    const q = searchText.toLowerCase();
    const matchSearch =
      !searchText ||
      r.title.toLowerCase().includes(q) ||
      r.problem.toLowerCase().includes(q) ||
      r.solutionConcept.toLowerCase().includes(q) ||
      r.requestedBy?.userName.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.tags?.some((t) => t.toLowerCase().includes(q));
    return matchField && matchTag && matchStatus && matchSearch;
  });

  const totalIdeaPages = Math.ceil(filteredIdeaRequests.length / ideasPerPage);
  const paginatedIdeaRequests = filteredIdeaRequests.slice(
    (ideaPage - 1) * ideasPerPage,
    ideaPage * ideasPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-white">스타트업 & IR</h1>
        <p className="text-sm text-brand-on-surface-variant mt-1">
          혁신 스타트업 발굴 및 투자부터 아이디어 제작 의뢰와 빌더 팀 매칭까지 지원합니다.
        </p>
      </div>

      {/* ── Sub-Navigation Tabs (스타트업 IR 탐색 vs 아이디어 제작 요청소) ── */}
      <div className="flex items-center gap-3 border-b border-white/10 mb-6 pb-1">
        <button
          onClick={() => {
            setActiveTab("browse");
            setSelectedIdeaRequest(null);
          }}
          className={`pb-2.5 px-3 text-sm font-bold transition-all cursor-pointer relative flex items-center gap-2 ${
            activeTab === "browse"
              ? "text-brand-primary border-b-2 border-brand-primary font-extrabold"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Briefcase className="w-4 h-4" /> 스타트업 & IR 탐색
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
            {projects.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("ideas");
            setSelectedProject(null);
          }}
          className={`pb-2.5 px-3 text-sm font-bold transition-all cursor-pointer relative flex items-center gap-2 ${
            activeTab === "ideas"
              ? "text-cyan-400 border-b-2 border-cyan-400 font-extrabold"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" /> 아이디어 제작 요청소
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            빌더 역제안
          </span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. 스타트업 & IR 탐색 (BROWSE TAB)                         */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "browse" && (
        <>
          {/* Streamlined Search & Action Bar */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={15} />
                <input
                  type="text"
                  placeholder="스타트업명, 아이템, 분야, 태그 검색..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="bg-brand-surface-low border border-brand-border rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors w-full shadow-inner"
                />
              </div>

              {/* Right Action & Pagination */}
              <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                {isLoggedIn && (
                  <button
                    onClick={() => setShowCreateProjectModal(true)}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-brand-primary/10"
                  >
                    <span className="text-base leading-none">+</span> 프로젝트 등록
                  </button>
                )}

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filtered.length}
                    itemsPerPage={itemsPerPage}
                  />
                )}
              </div>
            </div>

            {/* Tag Cloud */}
            {popularTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-brand-border/20">
                <span className="text-[11px] font-semibold text-brand-on-surface-variant flex items-center gap-1">
                  <Sparkles size={12} className="text-brand-primary" /> 트렌딩 키워드:
                </span>
                {popularTags.map((tag) => {
                  const isSelected = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(isSelected ? null : tag)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-brand-primary/20 text-brand-primary border-brand-primary font-bold shadow-sm"
                          : "bg-brand-surface-low border-brand-border/60 text-slate-400 hover:text-white hover:border-brand-border"
                      }`}
                    >
                      #{tag}
                      {isSelected && <X size={10} className="ml-0.5" />}
                    </button>
                  );
                })}
                {activeTag && (
                  <button
                    onClick={() => setActiveTag(null)}
                    className="text-[10px] text-brand-on-surface-variant hover:text-white underline ml-1 cursor-pointer"
                  >
                    전체보기
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedProjects.map((project, idx) => (
              <div
                key={project.id}
                data-testid="project-card"
                className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden card-hover cursor-pointer group animate-slideUp flex flex-col justify-between shadow-lg"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => setSelectedProject(project)}
              >
                <div>
                  <div className="h-20 relative overflow-hidden bg-gradient-to-r from-[#1e1b4b] via-[#0f766e] to-[#042f2e] flex items-center justify-center">
                    <span className="text-3xl opacity-40 drop-shadow-md select-none">🚀</span>
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[85%]">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                        {project.field}
                      </span>
                      {project.isHiring && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                          채용중
                        </span>
                      )}
                      {project.originIdeaRequestId && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 backdrop-blur-md flex items-center gap-1">
                          <Sparkles size={10} /> 의뢰 연계
                        </span>
                      )}
                      {project.visibility === "requester_only" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/30 text-amber-200 border border-amber-500/40 backdrop-blur-md flex items-center gap-1">
                          <Lock size={10} /> 비공개
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/90">{project.teamName}</span>
                      <div className="flex items-center gap-1.5">
                        {isLoggedIn &&
                          (project.authorName === userName ||
                            project.members?.some((m) => m.name === userName || m.anonymousName === userName) ||
                            userRoles.includes("admin") ||
                            userRoles.includes("manager")) && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingProject(project);
                                  setShowCreateProjectModal(true);
                                }}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-0.5 transition-colors cursor-pointer"
                                title="프로젝트 수정"
                              >
                                <Edit3 size={10} /> 수정
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(project.id);
                                }}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 flex items-center gap-0.5 transition-colors cursor-pointer"
                                title="프로젝트 삭제"
                              >
                                <Trash2 size={10} /> 삭제
                              </button>
                            </div>
                          )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(project.id);
                          }}
                          className="text-white/40 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          {project.bookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="font-display text-base font-bold text-white mt-2 group-hover:text-brand-primary transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {project.oneLiner}
                    </p>

                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between pt-3.5 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 3).map((m, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-brand-primary"
                          >
                            {m.name.charAt(0)}
                          </div>
                        ))}
                        {project.members.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] text-slate-400">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>

                      {/* '나도 쓸래요!' 투표 버튼 */}
                      {(() => {
                        const isUpvoted = project.upvotes?.includes(userName);
                        const count = project.upvoteCount || project.upvotes?.length || 0;
                        return (
                          <button
                            type="button"
                            onClick={(e) => handleUpvoteProject(e, project.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                              isUpvoted
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                                : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                            title="이 스타트업을 응원하고 싶다면 클릭하세요!"
                          >
                            <ThumbsUp size={11} className={isUpvoted ? "fill-cyan-300" : ""} />
                            <span>나도 쓸래요</span>
                            {count > 0 && <span className="font-bold text-cyan-300">({count})</span>}
                          </button>
                        );
                      })()}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded border font-semibold ${getInvestmentStageBadgeClass(project.investmentStage)}`}>
                      {project.investmentStage}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-brand-card rounded-xl border border-brand-border/40 mt-4">
              <p className="text-brand-on-surface-variant text-sm">검색 결과가 없습니다</p>
            </div>
          )}
        </>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. 아이디어 제작 요청소 (REVERSE PROPOSALS TAB)            */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "ideas" && (
        <div className="space-y-6">
          {/* Hero Banner for Idea Requests */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/50 via-blue-950/40 to-slate-900 border border-cyan-500/20 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> 문제 발제 & 빌더 역제안 매칭
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                아이디어와 시장 문제를 발제하면, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-200">
                  실력 있는 개발팀/빌더가 MVP 제작을 역제안합니다.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                잠재 고객의 공감 투표로 시장성을 검증하고, 빌더 팀의 제안을 수락하면 정식 스타트업 IR 프로젝트로 즉시 승격됩니다.
              </p>
            </div>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  onLoginClick();
                  return;
                }
                setShowIdeaRequestModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" /> + 아이디어 제작 의뢰
            </button>
          </div>

          {/* Streamlined Filter & Search Bar for Ideas */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {["전체", "모집중", "선발진행중", "협의중", "매칭완료"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setIdeaStatusFilter(st)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      ideaStatusFilter === st
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold shadow-sm"
                        : "border-brand-border text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high/50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Sort Switch */}
              <div className="flex items-center gap-1 bg-brand-surface-low p-1 rounded-xl border border-brand-border text-xs shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setIdeaSort("deadline")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    ideaSort === "deadline"
                      ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  📅 마감일순
                </button>
                <button
                  onClick={() => setIdeaSort("popular")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    ideaSort === "popular"
                      ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  🔥 공감순
                </button>
                <button
                  onClick={() => setIdeaSort("recent")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    ideaSort === "recent"
                      ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  ⏱️ 최신순
                </button>
              </div>
            </div>

            {/* Search + Pagination */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={15} />
                <input
                  type="text"
                  placeholder="아이디어명, 분야, 문제점, 솔루션 검색..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="bg-brand-surface-low border border-brand-border rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-cyan-500 transition-colors w-full shadow-inner"
                />
              </div>

              {totalIdeaPages > 1 && (
                <div className="ml-auto shrink-0">
                  <Pagination
                    currentPage={ideaPage}
                    totalPages={totalIdeaPages}
                    onPageChange={setIdeaPage}
                    totalItems={filteredIdeaRequests.length}
                    itemsPerPage={ideasPerPage}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Master-Detail Split Layout for Ideas */}
          <div className="flex gap-6 items-start">
            {/* Left: Cards Grid */}
            <div className={`transition-all duration-300 ${selectedIdeaRequest ? "w-full lg:w-3/5" : "w-full"}`}>
              {requestsLoading ? (
                <div className="text-center py-16 text-white/50 text-sm">아이디어 요청 목록을 불러오는 중...</div>
              ) : paginatedIdeaRequests.length === 0 ? (
                <div className="text-center py-16 bg-brand-card rounded-2xl border border-white/10">
                  <p className="text-white/60 text-sm">등록된 아이디어 제작 의뢰가 없습니다.</p>
                  <button
                    onClick={() => setShowIdeaRequestModal(true)}
                    className="mt-3 text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    + 첫 번째 아이디어 제작 의뢰 등록하기
                  </button>
                </div>
              ) : (
                <div className={`grid gap-4 ${selectedIdeaRequest ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                  {paginatedIdeaRequests.map((req) => {
                    const isSelected = selectedIdeaRequest?.id === req.id;
                    const isUpvoted = req.upvotes?.includes(userName);
                    const dDay = getDDayText(req.submissionDeadline);
                    const selectedCount = req.selectedProposalIds?.length || 0;

                    return (
                      <div
                        key={req.id}
                        data-testid="idea-request-card"
                        onClick={() => setSelectedIdeaRequest(req)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-lg relative overflow-hidden group ${
                          isSelected
                            ? "bg-brand-surface-high border-cyan-500/60 ring-2 ring-cyan-500/20"
                            : "bg-[#0f172a] border-slate-800 hover:border-slate-700 hover:bg-[#131d36]"
                        }`}
                      >
                        <div>
                          {/* Header badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  req.status === "모집중"
                                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                    : req.status === "선발진행중" || req.status === "빌더제안중"
                                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                    : req.status === "협의중"
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                }`}
                              >
                                {req.status === "모집중"
                                  ? "💡 모집중"
                                  : req.status === "협의중"
                                  ? `🤝 ${selectedCount}팀 협의중`
                                  : req.status === "선발진행중" || req.status === "빌더제안중"
                                  ? "⏳ 선발진행중"
                                  : "✓ 매칭완료"}
                              </span>

                              {dDay && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  dDay.includes("D-Day") || dDay.includes("D-1") || dDay.includes("D-2")
                                    ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                                    : dDay === "접수 마감"
                                    ? "bg-white/10 text-white/50 border-white/10"
                                    : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                                }`}>
                                  {dDay}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-white/50">{req.category}</span>
                          </div>

                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                            {req.title}
                          </h3>

                          {/* Problem/Solution Summary */}
                          <div className="mt-2.5 space-y-1.5">
                            <p className="text-xs text-white/60 line-clamp-2">
                              <span className="text-red-400 font-semibold mr-1">[문제]</span>
                              {req.problem}
                            </p>
                            <p className="text-xs text-white/70 line-clamp-2">
                              <span className="text-emerald-400 font-semibold mr-1">[솔루션]</span>
                              {req.solutionConcept}
                            </p>
                          </div>

                          {/* Schedule Notice */}
                          {(req.submissionDeadline || req.selectionDate) && (
                            <div className="mt-2.5 p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[10px] text-white/60">
                              <span>📅 마감: <b className="text-cyan-300">{req.submissionDeadline || "상시"}</b></span>
                              <span>🎯 선발: <b className="text-amber-300">{req.selectionDate || "미정"}</b></span>
                            </div>
                          )}

                          {/* Reward & Roles */}
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              💎 {req.rewardType}
                            </span>
                            {req.requiredRoles?.slice(0, 2).map((role, rIdx) => (
                              <span
                                key={rIdx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/10"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[11px] text-white/50">
                            발제자: <b className="text-white/80">{req.requestedBy.userName}</b>
                          </span>

                          <div className="text-[11px] text-cyan-300 font-medium">
                            제안 {req.proposals?.length || 0}팀
                            {selectedCount > 0 && (
                              <span className="ml-1 text-amber-300 font-bold">({selectedCount}팀 협의)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Master-Detail Slide-in Panel */}
            {selectedIdeaRequest && (
              <div className="w-full lg:w-2/5 bg-brand-surface/95 border border-white/15 rounded-2xl p-6 shadow-2xl animate-slideInFromRight sticky top-24 max-h-[85vh] overflow-y-auto space-y-5">
                {/* Detail Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        selectedIdeaRequest.status === "모집중"
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                          : selectedIdeaRequest.status === "협의중"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : selectedIdeaRequest.status === "선발진행중" || selectedIdeaRequest.status === "빌더제안중"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {selectedIdeaRequest.status}
                    </span>
                    <span className="text-xs text-white/50">{selectedIdeaRequest.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* 발제자 또는 관리자 의뢰서 삭제 버튼 */}
                    {isLoggedIn &&
                      (userRoles.includes("admin") ||
                        userRoles.includes("manager") ||
                        selectedIdeaRequest.requestedBy.userName === userName) && (
                        <button
                          onClick={() => handleDeleteIdeaRequest(selectedIdeaRequest.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer text-xs flex items-center gap-1 mr-1"
                          title="의뢰서 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">삭제</span>
                        </button>
                      )}
                    <button
                      onClick={() => setSelectedIdeaRequest(null)}
                      className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Idea Info */}
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedIdeaRequest.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
                    <span>발제자: <b className="text-white">{selectedIdeaRequest.requestedBy.userName}</b></span>
                    <span>•</span>
                    <span>협업 조건: <b className="text-amber-400">{selectedIdeaRequest.rewardType} ({selectedIdeaRequest.rewardDetail || "협의"})</b></span>
                  </div>
                </div>

                {/* Schedule Timeline Banner */}
                <div className="p-3.5 rounded-xl bg-brand-surface-low border border-brand-border/60 space-y-1.5 text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-primary" /> 공모 & 선발 협의 일정
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-lg bg-brand-surface border border-brand-border">
                      <div className="text-brand-on-surface-variant">제안 접수 마감일</div>
                      <div className="font-bold text-cyan-300 mt-0.5">
                        {selectedIdeaRequest.submissionDeadline || "상시 접수"}
                        {selectedIdeaRequest.submissionDeadline && (
                          <span className="ml-1 text-[10px] text-brand-primary font-normal">
                            ({getDDayText(selectedIdeaRequest.submissionDeadline)})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-brand-surface border border-brand-border">
                      <div className="text-brand-on-surface-variant">선발 발표 / 협의일</div>
                      <div className="font-bold text-amber-300 mt-0.5">
                        {selectedIdeaRequest.selectionDate || "접수 후 수시"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Problem & Solution Cards */}
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-xs text-white/80 leading-relaxed">
                    <div className="font-semibold text-red-400 mb-1 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> 문제점 (Pain Point)
                    </div>
                    {selectedIdeaRequest.problem}
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-white/80 leading-relaxed">
                    <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> 제안 솔루션 & MVP 컨셉
                    </div>
                    {selectedIdeaRequest.solutionConcept}
                  </div>
                </div>

                {/* Required Roles */}
                <div>
                  <div className="text-xs font-semibold text-white/70 mb-1.5">필요한 빌더 포지션:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIdeaRequest.requiredRoles?.map((r, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80"
                      >
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                </div>


                {/* Builder Proposals Section */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        🛠️ 제출된 빌더 팀 제안서 ({selectedIdeaRequest.proposals?.length || 0}건)
                      </h4>
                      <p className="text-[10px] text-brand-on-surface-variant mt-0.5">
                        복수 팀을 협의 대상으로 선발한 후 최종 제작 확정을 진행할 수 있습니다.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          onLoginClick();
                          return;
                        }
                        setProposalTargetIdea(selectedIdeaRequest);
                        setShowIdeaProposalModal(true);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors font-medium whitespace-nowrap cursor-pointer"
                    >
                      + 역제안서 등록
                    </button>
                  </div>

                  {(!selectedIdeaRequest.proposals || selectedIdeaRequest.proposals.length === 0) ? (
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-white/50">
                      아직 등록된 빌더 팀의 제안서가 없습니다. <br />
                      개발/기획 팀이시라면 MVP 제작을 제안해보세요!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedIdeaRequest.proposals.map((prop) => {
                        const isSelectedForNegotiation =
                          selectedIdeaRequest.selectedProposalIds?.includes(prop.id) ||
                          prop.status === "선발(협의중)";
                        const isAccepted = prop.status === "최종채택" || prop.status === "수락됨";

                        return (
                          <div
                            key={prop.id}
                            className={`p-4 rounded-xl border transition-all ${
                              isAccepted
                                ? "bg-emerald-950/30 border-emerald-500/50"
                                : isSelectedForNegotiation
                                ? "bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/20"
                                : "bg-white/5 border-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs font-bold">
                                  {prop.proposerName.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-white">{prop.proposerName} 팀</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                                  prop.visibility === "requester_only"
                                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                }`}>
                                  {prop.visibility === "requester_only" ? "🔒 비공개" : "🌐 공개 IR"}
                                </span>
                              </div>

                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                  isAccepted
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                    : isSelectedForNegotiation
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                    : "bg-white/10 text-white/60"
                                }`}
                              >
                                {isAccepted ? "★ 최종 채택" : isSelectedForNegotiation ? "🤝 협의 대상 선발됨" : prop.status}
                              </span>
                            </div>

                            <div className="text-xs text-white/90 font-medium mb-2">{prop.teamSummary}</div>

                            <div className="flex items-center gap-3 text-[11px] text-white/60 mb-2">
                              <span>예상 기간: <b className="text-cyan-400">{prop.estimatedWeeks}주 완성</b></span>
                              {prop.contactEmail && (
                                <>
                                  <span>•</span>
                                  <span>이메일: <b className="text-white/80">{prop.contactEmail}</b></span>
                                </>
                              )}
                            </div>

                            {/* Tech Stack */}
                            {prop.techStack && prop.techStack.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2.5">
                                {prop.techStack.map((tech, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Media & Prototype Links */}
                            {(prop.demoVideoUrl || prop.prototypeUrl || prop.portfolioUrl || prop.linkedProjectId) && (
                              <div className="flex items-center gap-2 flex-wrap mb-3 p-2 rounded-lg bg-black/20 border border-white/5">
                                {prop.demoVideoUrl && (
                                  <a
                                    href={prop.demoVideoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-red-300 hover:text-red-200 flex items-center gap-1 font-semibold"
                                  >
                                    <Video size={12} /> 시연 영상 <ExternalLink size={10} />
                                  </a>
                                )}
                                {prop.prototypeUrl && (
                                  <a
                                    href={prop.prototypeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-semibold"
                                  >
                                    <Globe size={12} /> 프로토타입/사이트 <ExternalLink size={10} />
                                  </a>
                                )}
                                {prop.portfolioUrl && (
                                  <a
                                    href={prop.portfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1"
                                  >
                                    <Link size={12} /> 포트폴리오 <ExternalLink size={10} />
                                  </a>
                                )}
                                {prop.linkedProjectId && (
                                  <button
                                    onClick={() => {
                                      setActiveTab("browse");
                                      const targetProj = projects.find((p) => p.id === prop.linkedProjectId);
                                      if (targetProj) setSelectedProject(targetProj);
                                    }}
                                    className="ml-auto text-[11px] text-brand-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    🚀 연동된 IR 프로젝트 보기 →
                                  </button>
                                )}
                              </div>
                            )}

                            <p className="text-xs text-white/80 bg-black/30 p-2.5 rounded-lg border border-white/5 leading-relaxed whitespace-pre-line mb-3">
                              {prop.planSummary}
                            </p>

                            {/* Action Buttons for Requester */}
                            {!isAccepted && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleToggleSelectProposal(selectedIdeaRequest.id, prop.id)}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                    isSelectedForNegotiation
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30"
                                      : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
                                  }`}
                                >
                                  {isSelectedForNegotiation ? (
                                    <>✓ 협의 선발 취소</>
                                  ) : (
                                    <>+ 협의 대상 선발</>
                                  )}
                                </button>

                                <button
                                  onClick={() => handleAcceptIdeaProposal(selectedIdeaRequest.id, prop.id)}
                                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  ★ 최종 제작 확정 (IR 승격)
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* Modals                                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* 스타트업 IR 프로젝트 등록/수정 모달 */}
      <ProjectCreateEditModal
        isOpen={showCreateProjectModal}
        initialProject={editingProject || undefined}
        onClose={() => {
          setShowCreateProjectModal(false);
          setEditingProject(null);
        }}
        onSave={(newProject) => {
          setLocalProjects((prev) => {
            const idx = prev.findIndex((p) => p.id === newProject.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = newProject;
              return copy;
            }
            return [newProject, ...prev];
          });
          // 수정 후 리스트 화면으로 복귀
          setSelectedProject(null);
          onClearSelectedProject?.();
          if (onSaveProject) {
            onSaveProject(newProject);
          }
        }}
      />

      {/* 아이디어 제작 의뢰 모달 */}
      <IdeaRequestModal
        isOpen={showIdeaRequestModal}
        onClose={() => setShowIdeaRequestModal(false)}
        userName={userName || "김수강생"}
        userId={userName || "u-student-1"}
        onRequestCreated={(newReq) => {
          setIdeaRequests((prev) => [newReq, ...prev]);
        }}
      />

      {/* 빌더 제작 역제안 모달 */}
      <IdeaProposalModal
        request={proposalTargetIdea}
        isOpen={showIdeaProposalModal}
        onClose={() => {
          setShowIdeaProposalModal(false);
          setProposalTargetIdea(null);
        }}
        proposerName={userName || "오승환"}
        proposerId="u-builder-1"
        onProposalSubmitted={(newProp) => {
          fetchIdeaRequests();
          if (proposalTargetIdea) {
            setSelectedIdeaRequest((prev) => {
              if (!prev || prev.id !== proposalTargetIdea.id) return prev;
              const existingProps = prev.proposals || [];
              return {
                ...prev,
                proposals: [newProp, ...existingProps.filter((p) => p.id !== newProp.id)],
              };
            });
          }
        }}
      />
    </div>
  );
}
