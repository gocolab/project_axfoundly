import React from "react";
import {
  ArrowLeft,
  Briefcase,
  Target,
  Lightbulb,
  Send,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Play,
  Video,
  Lock,
  Sparkles,
  Globe,
  Trash2,
  Edit3,
  UserCheck,
  UserX,
  CheckCircle,
} from "lucide-react";
import type { IRProject, UserRole, HiringRoleDetail, InvestmentProposal } from "../../types";
import { getEmploymentTypeBadgeClass, getInvestmentStageBadgeClass } from "../IRPage";
import InvestmentProposalModal from "../InvestmentProposalModal";
import JobApplicationModal from "../JobApplicationModal";
import ProjectCreateEditModal from "../ProjectCreateEditModal";
import { useToast } from "../common/Toast";
import { api } from "../../lib/api";

export interface IRDetailViewProps {
  project: IRProject;
  userRoles: UserRole[];
  isLoggedIn: boolean;
  userName?: string;
  onBack: () => void;
  onLoginClick: () => void;
  onToggleBookmark: (id: string) => void;
  onSendProposal?: (proposal: InvestmentProposal) => void;
  onSaveProject?: (project: IRProject) => void;
  onProjectDeleted?: (projectId: string) => void;
  onProjectUpdated?: (project: IRProject) => void;
  onNavigateToIdeaRequest?: (ideaRequestId: string) => void;
}

export default function IRDetailView({
  project: initialProject,
  userRoles,
  isLoggedIn,
  userName,
  onBack,
  onLoginClick,
  onToggleBookmark,
  onSendProposal,
  onSaveProject,
  onProjectDeleted,
  onProjectUpdated,
  onNavigateToIdeaRequest,
}: IRDetailViewProps) {
  const toast = useToast();
  const [selectedProject, setSelectedProject] = React.useState<IRProject>(initialProject);
  const [isAnonymousMode, setIsAnonymousMode] = React.useState<boolean>(initialProject.isAnonymous || false);
  const [proposalSent, setProposalSent] = React.useState(false);
  const [showProposalModal, setShowProposalModal] = React.useState(false);
  const [showApplyModal, setShowApplyModal] = React.useState(false);
  const [selectedHiringRole, setSelectedHiringRole] = React.useState<HiringRoleDetail | null>(null);
  const [showEditProjectModal, setShowEditProjectModal] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<IRProject | null>(null);

  React.useEffect(() => {
    setSelectedProject(initialProject);
    setIsAnonymousMode(initialProject.isAnonymous || false);
  }, [initialProject]);

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
      onProjectDeleted?.(projectId);
      onBack();
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
      const updatedProject: IRProject = {
        ...selectedProject,
        isHiring: targetState,
      };
      const res = await api.saveIRProject(updatedProject);
      const saved = res.project || updatedProject;

      setSelectedProject(saved);
      onProjectUpdated?.(saved);
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
          setProposalSent(false);
          onBack();
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
                {selectedProject.isHiring ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 backdrop-blur-md">
                    🔥 팀원 모집 중
                  </span>
                ) : (
                  ((selectedProject.hiringDetails && selectedProject.hiringDetails.length > 0) ||
                    (selectedProject.hiringRoles && selectedProject.hiringRoles.length > 0)) && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-700/60 border border-slate-600/50 text-slate-300 backdrop-blur-md">
                      🔒 채용 마감
                    </span>
                  )
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
                    {/* 작성자 / 관리자 수정·삭제·채용제어 액션 버튼 */}
                    {isLoggedIn &&
                      (selectedProject.authorName === userName ||
                        selectedProject.members?.some((m) => m.name === userName || m.anonymousName === userName) ||
                        userRoles.includes("admin") ||
                        userRoles.includes("manager")) && (
                        <div className="inline-flex items-center gap-1.5 ml-1 flex-wrap">
                          {selectedProject.isHiring ? (
                            <button
                              onClick={() => handleToggleHiring(selectedProject.id, true)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer font-semibold shadow-sm"
                              title="팀원 모집 마감하기"
                            >
                              <UserX size={12} />
                              <span>채용 마감</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleHiring(selectedProject.id, false)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer font-semibold shadow-sm"
                              title="팀원 모집 다시 시작하기"
                            >
                              <UserCheck size={12} />
                              <span>채용 재개</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingProject(selectedProject);
                              setShowEditProjectModal(true);
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
                      if (selectedProject.originIdeaRequestId) {
                        onNavigateToIdeaRequest?.(selectedProject.originIdeaRequestId);
                      }
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
                      setShowEditProjectModal(true);
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
          {(selectedProject.isHiring || (hiringDetails && hiringDetails.length > 0)) && (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase size={18} className="text-brand-tertiary" />
                  구인/구직 공고 ({hiringDetails.length}개 포지션)
                  {!selectedProject.isHiring && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 font-normal">
                      마감됨
                    </span>
                  )}
                </h2>
                <span className="text-xs text-brand-tertiary font-semibold">
                  자체 지원 및 외부 채용 링크 지원
                </span>
              </div>

              {/* 마감 상태 안내 배너 */}
              {!selectedProject.isHiring && (
                <div className="mb-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Lock size={14} className="text-slate-400 shrink-0" />
                    <span>현재 팀원 채용이 <strong>마감</strong>되었습니다. 등록된 포지션 내역을 열람 중입니다.</span>
                  </div>
                  {isLoggedIn &&
                    (selectedProject.authorName === userName ||
                      selectedProject.members?.some((m) => m.name === userName || m.anonymousName === userName) ||
                      userRoles.includes("admin") ||
                      userRoles.includes("manager")) && (
                      <button
                        onClick={() => handleToggleHiring(selectedProject.id, false)}
                        className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <UserCheck size={12} /> 채용 재개하기
                      </button>
                    )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {hiringDetails.map((roleItem) => (
                  <div
                    key={roleItem.id}
                    className={`p-4 bg-brand-surface-low rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      selectedProject.isHiring
                        ? "border-brand-border/40 hover:border-brand-primary/40"
                        : "border-slate-800 opacity-80"
                    }`}
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

                    {/* Action Button: Internal Apply vs External Link vs Closed */}
                    <div className="flex-shrink-0">
                      {!selectedProject.isHiring ? (
                        <button
                          disabled
                          className="text-xs bg-slate-800/80 text-slate-400 font-medium px-3.5 py-2 rounded-xl border border-slate-700/60 cursor-not-allowed flex items-center gap-1.5 shadow-none select-none"
                          title="현재 채용이 마감된 포지션입니다."
                        >
                          <Lock size={12} /> 지원 마감
                        </button>
                      ) : roleItem.applyMethod === "link" && roleItem.externalLink ? (
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
                  setSelectedProject((prev) => ({
                    ...prev,
                    bookmarked: !prev.bookmarked,
                  }));
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

      {/* ── Modal: One-click Job Application Modal ── */}
      <JobApplicationModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        project={selectedProject}
        hiringRole={selectedHiringRole}
        applicantName={isLoggedIn ? (userName || "김수강생") : "게스트"}
        applicantEmail="student@mail.com"
        onSuccess={() => {
          setShowApplyModal(false);
        }}
      />

      {/* ── Modal: Investment Proposal Modal ── */}
      <InvestmentProposalModal
        project={selectedProject}
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        onProposalSent={(proposal) => {
          setProposalSent(true);
          if (onSendProposal) onSendProposal(proposal);
        }}
      />

      {/* ── 스타트업 IR 프로젝트 수정 모달 (상세 화면) ── */}
      {showEditProjectModal && (
        <ProjectCreateEditModal
          isOpen={showEditProjectModal}
          initialProject={editingProject || selectedProject}
          onClose={() => {
            setShowEditProjectModal(false);
            setEditingProject(null);
          }}
          onSave={(newProject) => {
            setSelectedProject(newProject);
            onProjectUpdated?.(newProject);
            if (onSaveProject) {
              onSaveProject(newProject);
            }
            setShowEditProjectModal(false);
            setEditingProject(null);
            toast.success("프로젝트 수정 완료", "스타트업 프로젝트 정보가 성공적으로 업데이트되었습니다.");
          }}
        />
      )}
    </div>
  );
}
