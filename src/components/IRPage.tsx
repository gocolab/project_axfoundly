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
} from "lucide-react";
import type { IRProject, UserRole, HiringRoleDetail, InvestmentProposal, IdeaRequest, IdeaProposal } from "../types";
import Pagination from "./common/Pagination";
import InvestmentProposalModal from "./InvestmentProposalModal";
import JobApplicationModal from "./JobApplicationModal";
import ProjectCreateEditModal from "./ProjectCreateEditModal";
import IdeaRequestModal from "./IdeaRequestModal";
import IdeaProposalModal from "./IdeaProposalModal";
import { api } from "../lib/api";

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
  const [activeTab, setActiveTab] = React.useState<"browse" | "ideas">("browse");

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

  // Video & Apply Modals
  const [showVideoModal, setShowVideoModal] = React.useState(false);
  const [showEditVideoModal, setShowEditVideoModal] = React.useState(false);
  const [videoUrlInput, setVideoUrlInput] = React.useState("");
  const [selectedHiringRole, setSelectedHiringRole] = React.useState<HiringRoleDetail | null>(null);
  const [showApplyModal, setShowApplyModal] = React.useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = React.useState(false);

  // ── Reverse Proposal (아이디어 제작 요청소) State ──
  const [ideaRequests, setIdeaRequests] = React.useState<IdeaRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = React.useState(false);
  const [selectedIdeaRequest, setSelectedIdeaRequest] = React.useState<IdeaRequest | null>(null);
  const [showIdeaRequestModal, setShowIdeaRequestModal] = React.useState(false);
  const [showIdeaProposalModal, setShowIdeaProposalModal] = React.useState(false);
  const [proposalTargetIdea, setProposalTargetIdea] = React.useState<IdeaRequest | null>(null);
  const [ideaSort, setIdeaSort] = React.useState<"popular" | "recent">("popular");
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
      setIdeaRequests(res.requests || []);
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
      const res = await api.upvoteIdeaRequest(reqId, userName || "u-student-1");
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

  const handleAcceptIdeaProposal = async (reqId: string, propId: string) => {
    if (!confirm("이 빌더 팀의 제안을 수락하여 정식 스타트업 IR 프로젝트로 승격하시겠습니까?")) return;
    try {
      const res = await api.acceptIdeaProposal(reqId, propId);
      alert("🎉 축하합니다! 빌더 팀 매칭이 완료되어 정식 스타트업 IR 프로젝트로 등록되었습니다.");
      if (onSaveProject) {
        onSaveProject(res.project);
      }
      fetchIdeaRequests();
      setSelectedIdeaRequest(null);
    } catch (err) {
      console.error("Accept idea proposal failed", err);
      alert("제안 수락에 실패했습니다.");
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

  // Filter projects
  const filtered = projects.filter((p) => {
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
  });

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
      setVideoUrlInput(selectedProject.demoVideoUrl || "");
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
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                      {currentTeamName}
                    </h1>
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
              </div>
            </div>

            {/* ── Demo / Operational Video Player Section ── */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Video size={18} className="text-brand-primary" />
                  서비스 동작 및 피칭 영상
                </h2>
                <button
                  onClick={() => setShowEditVideoModal(true)}
                  className="text-xs text-brand-primary hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Link size={12} /> 영상 링크 설정/변경
                </button>
              </div>

              {selectedProject.demoVideoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-brand-border/40 aspect-video bg-black flex items-center justify-center group shadow-inner">
                  {/* Video Thumbnail / Mock Player View */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-black flex flex-col items-center justify-center p-6 text-center">
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="w-16 h-16 rounded-full bg-brand-primary-container text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Play size={28} className="ml-1" />
                    </button>
                    <p className="text-sm font-bold text-white mt-4">
                      {selectedProject.teamName} 서비스 시연 & 피칭 데모
                    </p>
                    <p className="text-xs text-brand-on-surface-variant mt-1 font-mono">
                      {selectedProject.demoVideoUrl}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-brand-surface-low rounded-xl border border-brand-border/30">
                  <Video size={28} className="text-brand-on-surface-variant mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-brand-on-surface-variant">등록된 시연 영상 링크가 없습니다</p>
                  <button
                    onClick={() => setShowEditVideoModal(true)}
                    className="mt-3 text-xs bg-brand-primary-container/20 text-brand-primary border border-brand-primary/30 px-3 py-1.5 rounded-lg hover:bg-brand-primary-container hover:text-white transition-colors cursor-pointer"
                  >
                    + 영상 링크 입력하기
                  </button>
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

        {/* ── Modal 1: Demo Video Player Modal ── */}
        {showVideoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/85 backdrop-blur-md p-4 animate-fadeIn">
            <div className="glass-panel-heavy rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-brand-border">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                  <Video size={16} className="text-brand-primary" />
                  {selectedProject.teamName} 서비스 동작 시연
                </h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="p-1 rounded-lg hover:bg-brand-surface-high text-brand-on-surface-variant hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="aspect-video bg-black rounded-xl overflow-hidden border border-brand-border/40 flex items-center justify-center relative">
                {/* Embed video or placeholder playback demo */}
                <iframe
                  src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0"
                  title="Demo Video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="mt-3 flex justify-between items-center text-xs text-brand-on-surface-variant">
                <span>동영상 원본 링크: {selectedProject.demoVideoUrl}</span>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-brand-surface-high text-white hover:bg-brand-primary-container text-xs cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal 2: Edit Demo Video URL Modal ── */}
        {showEditVideoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full shadow-2xl border border-brand-border">
              <h3 className="font-display text-base font-bold text-white mb-2">동작/시연 영상 링크 등록</h3>
              <p className="text-xs text-brand-on-surface-variant mb-4">
                YouTube, Vimeo, Loom 등의 영상 URL을 입력하세요.
              </p>

              <input
                type="text"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2.5 px-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary mb-4"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditVideoModal(false)}
                  className="flex-1 border border-brand-border text-white py-2 rounded-xl hover:bg-brand-surface-high text-xs cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setSelectedProject({ ...selectedProject, demoVideoUrl: videoUrlInput });
                    setShowEditVideoModal(false);
                    alert("영상 링크가 저장되었습니다.");
                  }}
                  className="flex-1 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2 rounded-xl text-xs hover:opacity-90 cursor-pointer shadow-md"
                >
                  저장하기
                </button>
              </div>
            </div>
          </div>
        )}

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
          {/* Filter & Search Bar */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2 flex-wrap">
                {dynamicFields.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveField(f)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      activeField === f
                        ? "bg-brand-primary-container/20 border-brand-primary text-brand-primary font-bold shadow-sm"
                        : "border-brand-border text-brand-on-surface-variant hover:text-white hover:border-brand-surface-highest"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {/* 프로젝트 등록 버튼 */}
              {isLoggedIn && (
                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-md"
                >
                  <span className="text-base leading-none">+</span> 프로젝트 등록
                </button>
              )}
            </div>

            {/* Search + Pagination */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                <input
                  type="text"
                  placeholder="스타트업명, 아이템, 태그 검색..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors w-full"
                />
              </div>
              {totalPages > 1 && (
                <div className="ml-auto">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filtered.length}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
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
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                        {project.field}
                      </span>
                      {project.isHiring && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                          채용중
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/90">{project.teamName}</span>
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

          {/* Filter & Search Bar for Ideas */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Category & Status Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                {dynamicFields.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveField(f)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      activeField === f
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold"
                        : "border-brand-border text-brand-on-surface-variant hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}

                <span className="text-white/20">|</span>

                {["전체", "모집중", "빌더제안중", "매칭완료"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setIdeaStatusFilter(st)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      ideaStatusFilter === st
                        ? "bg-white/15 text-white font-bold"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Sort Switch */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setIdeaSort("popular")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    ideaSort === "popular"
                      ? "bg-cyan-500/20 text-cyan-300 font-bold"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  🔥 공감순
                </button>
                <button
                  onClick={() => setIdeaSort("recent")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    ideaSort === "recent"
                      ? "bg-cyan-500/20 text-cyan-300 font-bold"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  ⏱️ 최신순
                </button>
              </div>
            </div>

            {/* Search + Pagination */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                <input
                  type="text"
                  placeholder="아이디어, 문제점, 솔루션 검색..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-cyan-500 transition-colors w-full"
                />
              </div>
              {totalIdeaPages > 1 && (
                <div className="ml-auto">
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
                    const isUpvoted = req.upvotes?.includes(userName || "u-student-1");

                    return (
                      <div
                        key={req.id}
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
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                req.status === "모집중"
                                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                  : req.status === "빌더제안중"
                                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              }`}
                            >
                              {req.status === "모집중" ? "💡 빌더 모집중" : req.status === "빌더제안중" ? "🛠️ 제작 제안 검토중" : "✓ 매칭 완료"}
                            </span>
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

                          {/* Reward & Roles */}
                          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
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
                          <button
                            type="button"
                            onClick={(e) => handleUpvoteIdea(e, req.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isUpvoted
                                ? "bg-cyan-500 text-black border-cyan-500 shadow-sm"
                                : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? "fill-black" : ""}`} />
                            {isUpvoted ? "공감 완료" : "나도 쓸래요!"} ({req.upvoteCount})
                          </button>

                          <div className="text-[11px] text-cyan-300 font-medium">
                            빌더 제안 {req.proposals?.length || 0}건
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
                          : selectedIdeaRequest.status === "빌더제안중"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {selectedIdeaRequest.status}
                    </span>
                    <span className="text-xs text-white/50">{selectedIdeaRequest.category}</span>
                  </div>
                  <button
                    onClick={() => setSelectedIdeaRequest(null)}
                    className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
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

                {/* Upvote CTA */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-white/60">출시 응원 잠재고객</div>
                    <div className="text-base font-bold text-cyan-400">
                      {selectedIdeaRequest.upvoteCount}명 공감 중
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleUpvoteIdea(e, selectedIdeaRequest.id)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ThumbsUp className="w-4 h-4 fill-black" />
                    나도 쓸래요 (+1)
                  </button>
                </div>

                {/* Builder Proposals Section */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      🛠️ 빌더 팀 제작 제안서 ({selectedIdeaRequest.proposals?.length || 0}건)
                    </h4>
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          onLoginClick();
                          return;
                        }
                        setProposalTargetIdea(selectedIdeaRequest);
                        setShowIdeaProposalModal(true);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors font-medium cursor-pointer"
                    >
                      + 저희가 제작하겠습니다
                    </button>
                  </div>

                  {(!selectedIdeaRequest.proposals || selectedIdeaRequest.proposals.length === 0) ? (
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-white/50">
                      아직 등록된 빌더 팀의 제안서가 없습니다. <br />
                      개발/기획 팀이시라면 MVP 제작을 제안해보세요!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedIdeaRequest.proposals.map((prop) => (
                        <div
                          key={prop.id}
                          className={`p-4 rounded-xl border transition-all ${
                            prop.status === "수락됨"
                              ? "bg-emerald-950/30 border-emerald-500/50"
                              : "bg-white/5 border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs font-bold">
                                {prop.proposerName.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-white">{prop.proposerName} 팀</span>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                prop.status === "수락됨"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-white/10 text-white/60"
                              }`}
                            >
                              {prop.status}
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

                          <p className="text-xs text-white/80 bg-black/30 p-2.5 rounded-lg border border-white/5 leading-relaxed whitespace-pre-line mb-3">
                            {prop.planSummary}
                          </p>

                          {prop.status === "대기중" && (
                            <button
                              onClick={() => handleAcceptIdeaProposal(selectedIdeaRequest.id, prop.id)}
                              className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                            >
                              ✓ 이 팀과 제작 확정하기 (정식 스타트업 IR 승격)
                            </button>
                          )}
                        </div>
                      ))}
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
      {/* 스타트업 IR 프로젝트 등록 모달 */}
      <ProjectCreateEditModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onSave={(newProject) => {
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
        userId="u-student-1"
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
        onProposalSubmitted={() => {
          fetchIdeaRequests();
        }}
      />
    </div>
  );
}
