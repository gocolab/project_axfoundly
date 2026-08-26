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
} from "lucide-react";
import type { IRProject, TeamBuildingRequest, InvestmentProposal } from "../types";
import ProjectCreateEditModal from "./ProjectCreateEditModal";

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
  const [activeSubTab, setActiveSubTab] = React.useState<"projects" | "teambuilding" | "proposals">("projects");
  const [showProjectModal, setShowProjectModal] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<IRProject | null>(null);

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
      </div>

      {/* ── SubTab 1: 내 IR 프로젝트 ── */}
      {activeSubTab === "projects" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myProjects.map((p) => (
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
          {teamRequests.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <p className="text-xs text-brand-on-surface-variant">
                수신되거나 발신된 팀 빌딩 제안이 없습니다.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {teamRequests.map((req) => (
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
          {receivedProposals.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <p className="text-xs text-brand-on-surface-variant">
                아직 수신된 투자 미팅 제안이 없습니다. IR 프로젝트를 최신 정보로 업데이트해보세요!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {receivedProposals.map((prop) => (
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
