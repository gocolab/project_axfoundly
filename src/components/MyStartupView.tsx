import React from "react";
import {
  Briefcase,
  Users,
  Plus,
  ExternalLink,
  Edit3,
  Calendar as CalendarIcon,
  MessageSquare,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  X,
  RotateCcw,
  Lightbulb,
} from "lucide-react";
import type { IRProject, TeamBuildingRequest, InvestmentProposal, IdeaRequest } from "../types";
import ProjectCreateEditModal from "./ProjectCreateEditModal";
import Pagination from "./common/Pagination";
import { api } from "../lib/api";

interface MyStartupViewProps {
  myProjects: IRProject[];
  teamRequests: TeamBuildingRequest[];
  receivedProposals?: InvestmentProposal[];
  onViewIR: (id: string) => void;
  onSaveProject: (project: IRProject) => void;
  onUpdateTeamRequest: (id: string, status: "수락" | "거절") => void;
  isModalOpenExternal?: boolean;
  onCloseModalExternal?: () => void;
}

export default function MyStartupView({
  myProjects,
  teamRequests,
  receivedProposals = [],
  onViewIR,
  onSaveProject,
  onUpdateTeamRequest,
  isModalOpenExternal,
  onCloseModalExternal,
}: MyStartupViewProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<"projects" | "teambuilding" | "proposals" | "ideas">("projects");
  const [showProjectModal, setShowProjectModal] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<IRProject | null>(null);

  // SubTab: Idea Requests
  const [myIdeas, setMyIdeas] = React.useState<IdeaRequest[]>([]);
  const [ideasLoading, setIdeasLoading] = React.useState(false);

  const loadIdeaRequests = React.useCallback(() => {
    setIdeasLoading(true);
    api.getIdeaRequests()
      .then((res) => {
        setMyIdeas(res.requests || []);
      })
      .catch((err) => console.error("Failed to load idea requests", err))
      .finally(() => setIdeasLoading(false));
  }, []);

  React.useEffect(() => {
    loadIdeaRequests();
  }, [loadIdeaRequests]);

  React.useEffect(() => {
    if (activeSubTab === "ideas") {
      loadIdeaRequests();
    }
  }, [activeSubTab, loadIdeaRequests]);

  // SubTab 1: Projects Search & Pagination
  const [searchProject, setSearchProject] = React.useState("");
  const [projectPage, setProjectPage] = React.useState(1);
  const projectItemsPerPage = 6;

  // SubTab 2: Team Building Search, Filter & Pagination
  const [teamFilter, setTeamFilter] = React.useState<"all" | "received" | "sent" | "pending">("all");
  const [searchTeam, setSearchTeam] = React.useState("");
  const [teamPage, setTeamPage] = React.useState(1);
  const teamItemsPerPage = 5;

  // SubTab 3: Proposals Search, Filter & Pagination
  const [proposalFilter, setProposalFilter] = React.useState<"all" | "대기중" | "수락" | "거절">("all");
  const [searchProposal, setSearchProposal] = React.useState("");
  const [proposalPage, setProposalPage] = React.useState(1);
  const proposalItemsPerPage = 5;

  // External trigger handler
  React.useEffect(() => {
    if (isModalOpenExternal) {
      setEditingProject(null);
      setShowProjectModal(true);
    }
  }, [isModalOpenExternal]);

  const handleCloseModal = () => {
    setShowProjectModal(false);
    if (onCloseModalExternal) onCloseModalExternal();
  };

  const pendingRequestsCount = teamRequests.filter(
    (r) => r.type === "received" && r.status === "대기중"
  ).length;

  // Filtered Projects
  const filteredProjects = myProjects.filter((p) => {
    if (!searchProject.trim()) return true;
    const query = searchProject.toLowerCase();
    return (
      p.teamName.toLowerCase().includes(query) ||
      p.title.toLowerCase().includes(query) ||
      p.oneLiner.toLowerCase().includes(query) ||
      p.field.toLowerCase().includes(query)
    );
  });
  const projectTotalPages = Math.ceil(filteredProjects.length / projectItemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (projectPage - 1) * projectItemsPerPage,
    projectPage * projectItemsPerPage
  );

  React.useEffect(() => {
    setProjectPage(1);
  }, [searchProject]);

  // Filtered Team Requests
  const filteredTeamRequests = teamRequests.filter((req) => {
    const matchFilter =
      teamFilter === "all"
        ? true
        : teamFilter === "received"
        ? req.type === "received"
        : teamFilter === "sent"
        ? req.type === "sent"
        : req.status === "대기중";
    const query = searchTeam.toLowerCase().trim();
    const matchSearch =
      query === "" ||
      req.projectName.toLowerCase().includes(query) ||
      req.role.toLowerCase().includes(query) ||
      req.message.toLowerCase().includes(query) ||
      req.fromUser.toLowerCase().includes(query) ||
      req.toUser.toLowerCase().includes(query);
    return matchFilter && matchSearch;
  });
  const teamTotalPages = Math.ceil(filteredTeamRequests.length / teamItemsPerPage);
  const paginatedTeamRequests = filteredTeamRequests.slice(
    (teamPage - 1) * teamItemsPerPage,
    teamPage * teamItemsPerPage
  );

  React.useEffect(() => {
    setTeamPage(1);
  }, [teamFilter, searchTeam]);

  // Filtered Received Proposals
  const filteredProposals = receivedProposals.filter((prop) => {
    const matchFilter = proposalFilter === "all" ? true : prop.status === proposalFilter;
    const query = searchProposal.toLowerCase().trim();
    const matchSearch =
      query === "" ||
      prop.projectName.toLowerCase().includes(query) ||
      prop.message.toLowerCase().includes(query);
    return matchFilter && matchSearch;
  });
  const proposalTotalPages = Math.ceil(filteredProposals.length / proposalItemsPerPage);
  const paginatedProposals = filteredProposals.slice(
    (proposalPage - 1) * proposalItemsPerPage,
    proposalPage * proposalItemsPerPage
  );

  React.useEffect(() => {
    setProposalPage(1);
  }, [proposalFilter, searchProposal]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Briefcase size={20} className="text-brand-tertiary" /> 내 스타트업 (창업 & 팀빌딩)
          </h2>
          <p className="text-xs text-brand-on-surface-variant mt-1">
            내 창업 IR 프로젝트를 게시하고, 팀원 지원자 및 투자 제안을 한 곳에서 관리하세요
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProject(null);
            setShowProjectModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus size={14} /> 신규 프로젝트 등록
        </button>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-brand-border/40 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("projects")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "projects"
              ? "text-brand-primary border-b-2 border-brand-primary tab-active"
              : "text-brand-on-surface-variant hover:text-white"
          }`}
        >
          <Briefcase size={14} /> 내 IR 프로젝트 ({myProjects.length})
        </button>
        <button
          onClick={() => setActiveSubTab("teambuilding")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap relative ${
            activeSubTab === "teambuilding"
              ? "text-brand-primary border-b-2 border-brand-primary tab-active"
              : "text-brand-on-surface-variant hover:text-white"
          }`}
        >
          <Users size={14} /> 팀 빌딩 & 지원자 관리 ({teamRequests.length})
          {pendingRequestsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-brand-accent-orange ml-0.5" />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab("proposals")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "proposals"
              ? "text-brand-primary border-b-2 border-brand-primary tab-active"
              : "text-brand-on-surface-variant hover:text-white"
          }`}
        >
          <TrendingUp size={14} /> 받은 투자 제안 ({receivedProposals.length})
        </button>
        <button
          onClick={() => setActiveSubTab("ideas")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "ideas"
              ? "text-cyan-400 border-b-2 border-cyan-400 tab-active font-extrabold"
              : "text-brand-on-surface-variant hover:text-white"
          }`}
        >
          <Sparkles size={14} className="text-cyan-400" /> 내가 의뢰한 아이디어
        </button>
      </div>

      {/* ── SubTab 1: 내 IR 프로젝트 ── */}
      {activeSubTab === "projects" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Search & Pagination Toolbar */}
          {myProjects.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-xs text-brand-on-surface-variant">
                등록된 프로젝트: <span className="text-white font-semibold">{myProjects.length}</span>개
              </div>

              <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full sm:w-auto shrink-0">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                  <input
                    type="text"
                    placeholder="프로젝트명, 한줄소개 검색..."
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    className="w-full bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-8 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  {searchProject && (
                    <button
                      onClick={() => setSearchProject("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant hover:text-white cursor-pointer"
                      title="검색어 지우기"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {projectTotalPages > 1 && (
                  <div className="ml-auto">
                    <Pagination
                      currentPage={projectPage}
                      totalPages={projectTotalPages}
                      onPageChange={setProjectPage}
                      totalItems={filteredProjects.length}
                      itemsPerPage={projectItemsPerPage}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {myProjects.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-2xl p-12 text-center shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-brand-surface-low border border-brand-border/40 mx-auto flex items-center justify-center mb-3">
                <Briefcase size={24} className="text-brand-on-surface-variant" />
              </div>
              <h3 className="text-sm font-bold text-white">등록된 창업 프로젝트가 없습니다</h3>
              <p className="text-xs text-brand-on-surface-variant mt-1 max-w-sm mx-auto">
                아이디어 한 줄 소개, 피치덱 링크, 팀원 모집 포지션을 등록하여 스타트업/IR 게시판에 노출해보세요!
              </p>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setShowProjectModal(true);
                }}
                className="mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white text-xs font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus size={14} /> 신규 프로젝트 등록
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-2xl p-12 text-center shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-brand-surface-low border border-brand-border/40 mx-auto flex items-center justify-center mb-3">
                <Search size={24} className="text-brand-on-surface-variant" />
              </div>
              <h3 className="text-sm font-bold text-white">일치하는 프로젝트가 없습니다</h3>
              <p className="text-xs text-brand-on-surface-variant mt-1 max-w-sm mx-auto">
                검색어를 확인하거나 초기화해 보세요.
              </p>
              <button
                onClick={() => setSearchProject("")}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-surface-high border border-brand-border text-white text-xs font-bold hover:bg-brand-surface-highest transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <RotateCcw size={13} /> 검색 조건 초기화
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paginatedProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-brand-card border border-brand-border/60 rounded-xl p-5 shadow-md flex flex-col justify-between hover:border-brand-tertiary/40 transition-all card-hover"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] text-brand-tertiary font-bold tracking-wide uppercase">
                          {p.field}
                        </span>
                        <h3 className="text-base font-bold text-white mt-0.5">{p.teamName}</h3>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-brand-primary-container/20 text-brand-primary font-bold">
                        {p.investmentStage}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-white mb-1.5">{p.title}</p>
                    <p className="text-xs text-brand-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                      {p.oneLiner}
                    </p>

                    {/* Member Avatars */}
                    {p.members && p.members.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-[10px] text-brand-on-surface-variant">팀원:</span>
                        <div className="flex -space-x-1.5">
                          {p.members.map((m, idx) => (
                            <div
                              key={idx}
                              title={`${m.name} (${m.role})`}
                              className="w-5 h-5 rounded-full bg-brand-surface-high border border-brand-card flex items-center justify-center text-[9px] font-bold text-white"
                            >
                              {m.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-brand-border/30 flex justify-between items-center">
                    <span className="text-[10px] text-brand-on-surface-variant flex items-center gap-1">
                      {p.isAnonymous ? "🔒 스텔스 모드" : "🌐 실명 공개"}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onViewIR(p.id)}
                        className="text-xs text-brand-on-surface-variant hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> IR 상세 보기
                      </button>
                      <button
                        onClick={() => {
                          setEditingProject(p);
                          setShowProjectModal(true);
                        }}
                        className="text-xs text-brand-tertiary hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={12} /> 수정
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SubTab 2: 팀 빌딩 및 지원자 관리 ── */}
      {activeSubTab === "teambuilding" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Filter Pills & Search Bar (Community Style) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-xl border border-brand-border/40 self-start overflow-x-auto max-w-full">
              <button
                onClick={() => setTeamFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  teamFilter === "all"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                전체 ({teamRequests.length})
              </button>
              <button
                onClick={() => setTeamFilter("received")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  teamFilter === "received"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                받은 지원 ({teamRequests.filter((r) => r.type === "received").length})
              </button>
              <button
                onClick={() => setTeamFilter("sent")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  teamFilter === "sent"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                보낸 제안 ({teamRequests.filter((r) => r.type === "sent").length})
              </button>
              <button
                onClick={() => setTeamFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  teamFilter === "pending"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                대기중 ({teamRequests.filter((r) => r.status === "대기중").length})
              </button>
            </div>

            <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full sm:w-auto shrink-0">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                <input
                  type="text"
                  placeholder="프로젝트, 포지션, 지원자 검색..."
                  value={searchTeam}
                  onChange={(e) => setSearchTeam(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-8 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors"
                />
                {searchTeam && (
                  <button
                    onClick={() => setSearchTeam("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant hover:text-white cursor-pointer"
                    title="검색어 지우기"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {teamTotalPages > 1 && (
                <div className="ml-auto">
                  <Pagination
                    currentPage={teamPage}
                    totalPages={teamTotalPages}
                    onPageChange={setTeamPage}
                    totalItems={filteredTeamRequests.length}
                    itemsPerPage={teamItemsPerPage}
                  />
                </div>
              )}
            </div>
          </div>

          {teamRequests.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <p className="text-xs text-brand-on-surface-variant">
                수신되거나 발신된 팀 빌딩 제안이 없습니다.
              </p>
            </div>
          ) : filteredTeamRequests.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <p className="text-xs text-brand-on-surface-variant">
                일치하는 팀 빌딩 제안 내역이 없습니다.
              </p>
              <button
                onClick={() => {
                  setTeamFilter("all");
                  setSearchTeam("");
                }}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-brand-surface-high border border-brand-border text-white text-xs font-semibold hover:bg-brand-surface-highest transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={12} /> 조건 초기화
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paginatedTeamRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-brand-card border border-brand-border/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          req.type === "received"
                            ? "bg-brand-tertiary/15 text-brand-tertiary"
                            : "bg-brand-primary-container/15 text-brand-primary"
                        }`}
                      >
                        {req.type === "received" ? "📥 받은 지원" : "📤 보낸 제안"}
                      </span>
                      <span className="text-xs font-bold text-white">{req.projectName}</span>
                      <span className="text-[10px] text-brand-on-surface-variant">
                        희망 포지션: <b className="text-white">{req.role}</b>
                      </span>
                    </div>
                    <p className="text-xs text-brand-on-surface-variant mt-1 leading-relaxed">
                      "{req.message}"
                    </p>
                    <span className="text-[9px] text-brand-on-surface-variant/70 mt-1 block font-mono">
                      {req.date} | {req.fromUser} → {req.toUser}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        req.status === "수락"
                          ? "bg-brand-tertiary/20 text-brand-tertiary border border-brand-tertiary/30"
                          : req.status === "거절"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-brand-surface-high text-brand-on-surface-variant border border-brand-border/40"
                      }`}
                    >
                      {req.status}
                    </span>
                    {req.status === "대기중" && req.type === "received" && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onUpdateTeamRequest(req.id, "수락")}
                          className="px-3 py-1.5 rounded-lg bg-brand-tertiary text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle size={12} /> 수락
                        </button>
                        <button
                          onClick={() => onUpdateTeamRequest(req.id, "거절")}
                          className="px-3 py-1.5 rounded-lg border border-brand-border/60 text-brand-on-surface-variant text-xs hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <XCircle size={12} /> 거절
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SubTab 3: 받은 투자 제안 ── */}
      {activeSubTab === "proposals" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Filter Pills & Search Bar (Community Style) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-xl border border-brand-border/40 self-start overflow-x-auto max-w-full">
              <button
                onClick={() => setProposalFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  proposalFilter === "all"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                전체 ({receivedProposals.length})
              </button>
              <button
                onClick={() => setProposalFilter("대기중")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  proposalFilter === "대기중"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                대기중 ({receivedProposals.filter((p) => p.status === "대기중").length})
              </button>
              <button
                onClick={() => setProposalFilter("수락")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  proposalFilter === "수락"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                수락 ({receivedProposals.filter((p) => p.status === "수락").length})
              </button>
              <button
                onClick={() => setProposalFilter("거절")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  proposalFilter === "거절"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                거절 ({receivedProposals.filter((p) => p.status === "거절").length})
              </button>
            </div>

            <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full sm:w-auto shrink-0">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                <input
                  type="text"
                  placeholder="프로젝트, 제안 메시지 검색..."
                  value={searchProposal}
                  onChange={(e) => setSearchProposal(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-8 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors"
                />
                {searchProposal && (
                  <button
                    onClick={() => setSearchProposal("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant hover:text-white cursor-pointer"
                    title="검색어 지우기"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {proposalTotalPages > 1 && (
                <div className="ml-auto">
                  <Pagination
                    currentPage={proposalPage}
                    totalPages={proposalTotalPages}
                    onPageChange={setProposalPage}
                    totalItems={filteredProposals.length}
                    itemsPerPage={proposalItemsPerPage}
                  />
                </div>
              )}
            </div>
          </div>

          {receivedProposals.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <p className="text-xs text-brand-on-surface-variant">
                아직 수신된 투자 미팅 제안이 없습니다. IR 프로젝트를 최신 정보로 업데이트해보세요!
              </p>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <p className="text-xs text-brand-on-surface-variant">
                일치하는 투자 제안 내역이 없습니다.
              </p>
              <button
                onClick={() => {
                  setProposalFilter("all");
                  setSearchProposal("");
                }}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-brand-surface-high border border-brand-border text-white text-xs font-semibold hover:bg-brand-surface-highest transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={12} /> 조건 초기화
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paginatedProposals.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-brand-card border border-brand-border/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white">{prop.projectName}</span>
                      <span className="text-[10px] text-brand-on-surface-variant font-mono">
                        {prop.sentDate}
                      </span>
                    </div>
                    <p className="text-xs text-brand-on-surface-variant">{prop.message}</p>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full self-start sm:self-auto ${
                      prop.status === "수락"
                        ? "bg-brand-tertiary/20 text-brand-tertiary"
                        : prop.status === "거절"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-brand-surface-high text-brand-on-surface-variant"
                    }`}
                  >
                    {prop.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SubTab 4: 내가 의뢰한 아이디어 ── */}
      {activeSubTab === "ideas" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
            <div className="text-xs text-cyan-200">
              💡 내가 발제한 아이디어 제작 의뢰 건입니다. 빌더 팀이 제안한 개발 계획을 확인하고 수락하면 정식 IR 프로젝트로 전환됩니다.
            </div>
          </div>

          {ideasLoading ? (
            <div className="text-center py-12 text-white/50 text-xs">아이디어 목록 로딩 중...</div>
          ) : myIdeas.length === 0 ? (
            <div className="text-center py-12 bg-brand-surface-low rounded-xl border border-white/10">
              <p className="text-xs text-white/50">등록된 아이디어 제작 의뢰가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          idea.status === "모집중"
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                            : idea.status === "빌더제안중" || idea.status === "협의중" || idea.status === "선발진행중"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {idea.status}
                      </span>
                      <span className="text-[10px] text-white/50 font-mono">{idea.category}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{idea.title}</h4>
                    <p className="text-xs text-white/60 mt-1 line-clamp-2">{idea.problem}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-amber-300 font-medium">💎 {idea.rewardType} ({idea.rewardDetail || "협의"})</span>
                      <span className="text-cyan-400 font-bold">{idea.upvoteCount}명 공감</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cyan-300 font-medium">
                        접수된 빌더 제안: <strong className="text-white font-bold">{idea.proposals?.length || 0}건</strong>
                      </span>
                      {idea.status !== "매칭완료" && (
                        <span className="text-[10px] text-brand-on-surface-variant font-mono">
                          마감: {idea.deadline || "상시접수"}
                        </span>
                      )}
                    </div>

                    {idea.proposals && idea.proposals.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {idea.proposals.map((p) => (
                          <div
                            key={p.id}
                            className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs flex flex-col gap-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">{p.proposerName} 빌더팀</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded ${
                                  p.status === "채택됨"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : p.status === "선발(협의중)"
                                    ? "bg-amber-500/20 text-amber-300"
                                    : "bg-slate-700 text-slate-300"
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/70 line-clamp-2">{p.planSummary}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                              <span>스택: {Array.isArray(p.techStack) ? p.techStack.slice(0, 3).join(", ") : p.techStack}</span>
                              <span className="font-semibold text-cyan-300">{p.estimatedWeeks}주 완성</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Project Modal */}
      <ProjectCreateEditModal
        isOpen={showProjectModal}
        initialProject={editingProject}
        onClose={handleCloseModal}
        onSave={(project) => {
          onSaveProject(project);
          handleCloseModal();
        }}
      />
    </div>
  );
}
