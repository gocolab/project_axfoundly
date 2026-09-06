import React from "react";
import {
  Briefcase,
  Search,
  Bookmark,
  BookmarkCheck,
  X,
  Lock,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import type {
  IRProject,
  UserRole,
  HiringRoleDetail,
  InvestmentProposal,
  IdeaRequest,
} from "../types";
import Pagination from "./common/Pagination";
import SearchBar from "./common/SearchBar";
import HighlightText from "./common/HighlightText";
import { multiMatch } from "../utils/searchUtils";
import { useUrlPagination } from "../hooks/useUrlQueryState";
import ProjectCreateEditModal, { convertToEmbedUrl } from "./ProjectCreateEditModal";
import IRDetailView from "./ir/IRDetailView";
import IdeaRequestsTab from "./ir/IdeaRequestsTab";
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
  onSelectProject?: (projectId: string) => void;
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
  onSelectProject,
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

  const prevInitialProjectIdRef = React.useRef(initialProjectId);
  React.useEffect(() => {
    if (initialProjectId) {
      if (selectedProject?.id === initialProjectId) {
        return;
      }
      const match = projects.find((p) => p.id === initialProjectId) || localProjects.find((p) => p.id === initialProjectId);
      if (match) {
        setSelectedProject(match);
      } else if (projects.length > 0) {
        toast.error("프로젝트를 찾을 수 없습니다", "존재하지 않거나 삭제된 스타트업 프로젝트입니다.");
        onClearSelectedProject?.();
      }
    } else if (prevInitialProjectIdRef.current && !initialProjectId) {
      setSelectedProject(null);
    }
    prevInitialProjectIdRef.current = initialProjectId;
  }, [initialProjectId, projects, localProjects, onClearSelectedProject]);

  const [activeField, setActiveField] = React.useState<string>("전체");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const {
    page: currentPage,
    setPage: setCurrentPage,
    query: searchText,
    setQuery: setSearchText,
  } = useUrlPagination({ pageKey: "page", queryKey: "q", defaultPage: 1 });
  const [itemsPerPage, setItemsPerPage] = React.useState(6);

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
  const [selectedIdeaRequest, setSelectedIdeaRequest] = React.useState<IdeaRequest | null>(null);

  React.useEffect(() => {
    api.getIdeaRequests().then((res) => {
      if (res?.requests) {
        setIdeaRequests(res.requests);
      }
    }).catch((e) => console.error("Failed to fetch initial idea requests", e));
  }, []);

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

  const handleToggleHiring = async (projectId: string, currentHiringState: boolean) => {
    const targetState = !currentHiringState;
    const actionName = targetState ? "채용 재개" : "채용 마감";
    const confirmed = await toast.confirm({
      title: `${actionName} 확인`,
      message: targetState
        ? "팀원 모집을 다시 시작하시겠습니까?\n프로젝트 목록과 상세 페이지에 '채용중' 배지가 표시되고 지원 접수가 활성화됩니다."
        : "팀원 모집을 마감하시겠습니까?\n목록 및 상세 페이지에서 '채용 마감'으로 전환되며 신규 지원 접수가 제한됩니다.",
      confirmText: actionName,
      cancelText: "취소",
      type: targetState ? "success" : "primary",
    });
    if (!confirmed) return;

    try {
      if (!selectedProject) return;
      const updatedProject: IRProject = {
        ...selectedProject,
        isHiring: targetState,
      };
      const res = await api.saveIRProject(updatedProject);
      const saved = res.project || updatedProject;

      setSelectedProject(saved);
      setLocalProjects((prev) =>
        prev.map((p) => (p.id === saved.id ? saved : p))
      );
      if (onSaveProject) {
        onSaveProject(saved);
      }
      if (targetState) {
        toast.success("채용 재개 완료", "팀원 모집이 성공적으로 재개되었습니다.");
      } else {
        toast.info("채용 마감 완료", "팀원 채용 공고가 마감 처리되었습니다.");
      }
    } catch (err) {
      console.error("Toggle hiring failed", err);
      toast.error("상태 변경 실패", "채용 상태 변경 중 오류가 발생했습니다.");
    }
  };



  const [applicantNote, setApplicantNote] = React.useState("");

  const dynamicFields = React.useMemo(() => {
    const defaultFields = ["전체", "AI/ML", "B2B SaaS", "핀테크", "바이오/헬스케어", "커머스"];
    const fieldSet = new Set<string>(defaultFields);
    projects.forEach((p) => {
      if (p.field) fieldSet.add(p.field);
    });
    return Array.from(fieldSet);
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
        const matchSearch = multiMatch(
          [p.teamName, p.title, p.oneLiner, p.solution, p.field, ...(p.tags || [])],
          searchText
        );
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

  const isFirstFieldRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstFieldRender.current) {
      isFirstFieldRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [activeField, activeTag]);

  // When project changes, sync anonymous state
  React.useEffect(() => {
    if (selectedProject) {
      setIsAnonymousMode(selectedProject.isAnonymous || false);
    }
  }, [selectedProject]);

  // ── IR Detail View ──
  if (selectedProject) {
    return (
      <IRDetailView
        project={selectedProject}
        userRoles={userRoles}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onBack={() => {
          setSelectedProject(null);
          setProposalSent(false);
          onClearSelectedProject?.();
        }}
        onLoginClick={onLoginClick}
        onToggleBookmark={onToggleBookmark}
        onSendProposal={onSendProposal}
        onSaveProject={onSaveProject}
        onProjectDeleted={(deletedId) => {
          setLocalProjects((prev) => prev.filter((p) => p.id !== deletedId));
          setSelectedProject(null);
          onClearSelectedProject?.();
        }}
        onProjectUpdated={(updated) => {
          setSelectedProject(updated);
          setLocalProjects((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
          if (onSaveProject) {
            onSaveProject(updated);
          }
        }}
        onNavigateToIdeaRequest={(ideaRequestId) => {
          setSelectedProject(null);
          setActiveTab("ideas");
          const matchReq = ideaRequests.find((r) => r.id === ideaRequestId);
          if (matchReq) {
            setSelectedIdeaRequest(matchReq);
          } else {
            api.getIdeaRequest(ideaRequestId).then((res) => {
              if (res?.request) setSelectedIdeaRequest(res.request);
            }).catch(() => {});
          }
        }}
      />
    );
  }

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
              {/* Search Input with Debounce & Shortcut */}
              <SearchBar
                value={searchText}
                onChange={setSearchText}
                placeholder="스타트업명, 아이템, 분야, 태그 검색..."
                className="flex-1 max-w-md"
                inputClassName="rounded-xl py-2 shadow-inner"
              />

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
                    onPageSizeChange={setItemsPerPage}
                    pageSizeOptions={[6, 12, 24]}
                  />
                )}
              </div>
            </div>

            {/* Field Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-semibold text-brand-on-surface-variant">산업 분야:</span>
              {dynamicFields.map((field) => (
                <button
                  key={field}
                  onClick={() => setActiveField(field)}
                  className={`text-[11px] px-3 py-1 rounded-xl border transition-all cursor-pointer font-medium ${
                    activeField === field
                      ? "bg-brand-primary text-black border-brand-primary font-bold shadow-sm"
                      : "bg-brand-surface-low border-brand-border text-brand-on-surface-variant hover:text-white"
                  }`}
                >
                  {field}
                </button>
              ))}
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
                onClick={() => {
                  prevInitialProjectIdRef.current = project.id;
                  setSelectedProject(project);
                  onSelectProject?.(project.id);
                }}
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
                      <span className="text-xs font-bold text-white/90">
                        <HighlightText text={project.teamName} query={searchText} />
                      </span>
                      <div className="flex items-center gap-1.5">
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
                      <HighlightText text={project.title} query={searchText} />
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      <HighlightText text={project.oneLiner} query={searchText} />
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
        <IdeaRequestsTab
          initialIdeaRequests={ideaRequests}
          isLoggedIn={isLoggedIn}
          userRoles={userRoles}
          userName={userName}
          projects={localProjects}
          onLoginClick={onLoginClick}
          onSelectProject={(projectId) => {
            setActiveTab("browse");
            const match = localProjects.find((p) => p.id === projectId);
            if (match) setSelectedProject(match);
            onSelectProject?.(projectId);
          }}
          onSwitchToBrowseTab={() => {
            setActiveTab("browse");
            setSelectedProject(null);
          }}
          onSaveProject={(newProject) => {
            setLocalProjects((prev) => {
              const idx = prev.findIndex((p) => p.id === newProject.id);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = newProject;
                return copy;
              }
              return [newProject, ...prev];
            });
            if (onSaveProject) {
              onSaveProject(newProject);
            }
          }}
          selectedIdeaRequest={selectedIdeaRequest}
          onSelectIdeaRequest={setSelectedIdeaRequest}
        />
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* Modals                                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* 스타트업 IR 프로젝트 등록/수정 모달 */}
      <ProjectCreateEditModal
        isOpen={showCreateProjectModal}
        initialProject={editingProject || undefined}
        userName={userName}
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

      </div>
    );
  }
