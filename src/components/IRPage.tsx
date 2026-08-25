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
} from "lucide-react";
import type { IRProject, UserRole, HiringRoleDetail, InvestmentProposal } from "../types";
import Pagination from "./common/Pagination";
import InvestmentProposalModal from "./InvestmentProposalModal";
import JobApplicationModal from "./JobApplicationModal";
import VirtualIRModal from "./VirtualIRModal";
import ProjectCreateEditModal from "./ProjectCreateEditModal";
import { api } from "../lib/api";

interface IRPageProps {
  projects: IRProject[];
  userRoles: UserRole[];
  userAssignedRoles?: string[];
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
  userAssignedRoles = [],
  isLoggedIn,
  userName,
  onLoginClick,
  onToggleBookmark,
  onSendProposal,
  onSaveProject,
  initialProjectId,
  onClearSelectedProject,
}: IRPageProps) {
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
  const [showVirtualIRModal, setShowVirtualIRModal] = React.useState(false);
  const [applicantNote, setApplicantNote] = React.useState("");
  const [showCreateProjectModal, setShowCreateProjectModal] = React.useState(false);

  const fields = ["전체", "AI/ML", "핀테크", "헬스케어", "에듀테크", "커머스", "SaaS"];

  // Filter projects
  const filtered = projects.filter((p) => {
    const matchField = activeField === "전체" || p.field === activeField;
    const matchSearch =
      p.teamName.toLowerCase().includes(searchText.toLowerCase()) ||
      p.title.toLowerCase().includes(searchText.toLowerCase()) ||
      p.oneLiner.toLowerCase().includes(searchText.toLowerCase()) ||
      p.solution.toLowerCase().includes(searchText.toLowerCase());
    return matchField && matchSearch;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProjects = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeField, searchText]);

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
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#030712]/70 text-white border border-white/10 backdrop-blur-md">
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
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
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
                {userAssignedRoles.includes("investor_active") && isLoggedIn ? (
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

                    <button
                      onClick={() => setShowVirtualIRModal(true)}
                      className="w-full bg-brand-surface-high hover:bg-brand-primary-container/40 text-brand-primary border border-brand-primary/40 font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
                    >
                      <Video size={15} />
                      가상 IR 피칭룸 & NDA 계약
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      disabled={!isLoggedIn || !userAssignedRoles.includes("investor_active")}
                      className="w-full bg-brand-surface-high text-brand-on-surface-variant py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                      title="투자자 계정으로 로그인해야 합니다"
                    >
                      <Send size={14} />
                      투자 제안하기
                      <span className="text-[9px]">(투자자 권한 전용)</span>
                    </button>
                    <button
                      disabled={!isLoggedIn || !userAssignedRoles.includes("investor_active")}
                      className="w-full bg-brand-surface-low text-brand-on-surface-variant/60 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-40 border border-brand-border/30"
                    >
                      <Video size={14} />
                      가상 IR 피칭룸 (투자자 전용)
                    </button>
                  </div>
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

        {/* ── Modal 4: Virtual IR Pitching & NDA Modal ── */}
        <VirtualIRModal
          isOpen={showVirtualIRModal}
          onClose={() => setShowVirtualIRModal(false)}
          project={selectedProject}
          investorName="이벤처 (심사역)"
          onSuccess={() => {
            setShowVirtualIRModal(false);
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


  // ── IR List View ──
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">스타트업 & IR 피칭</h1>
        <p className="text-sm text-brand-on-surface-variant mt-1">
          수강생이 런칭한 혁신 프로젝트와 구인/투자 기회를 탐색하세요
        </p>
      </div>


      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Row 1: 분야 필터 + 등록 버튼 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2 flex-wrap">
            {fields.map((f) => (
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
          {/* 프로젝트 등록 버튼 — 로그인 회원 누구나 */}
          {isLoggedIn && (
            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="text-base leading-none">+</span> 프로젝트 등록
            </button>
          )}
        </div>
        {/* Row 2: 검색창 + Pagination */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
            <input
              type="text"
              placeholder="스타트업명, 아이템 검색..."
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
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedProjects.map((project, idx) => (
          <div
            key={project.id}
            className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden card-hover cursor-pointer group animate-slideUp flex flex-col justify-between shadow-lg"
            style={{ animationDelay: `${idx * 50}ms` }}
            onClick={() => setSelectedProject(project)}
          >
            <div>
              {/* Thumbnail Header — 첨부 이미지 스타일의 일관된 바이올렛/인디고 헤더 */}
              <div className="h-20 relative overflow-hidden bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] flex items-center justify-center">
                <span className="text-3xl opacity-50 drop-shadow-md select-none">🚀</span>

                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md border bg-[#4f46e5]/30 border-[#6366f1]/60 text-[#a5b4fc]">
                    {project.field}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#030712]/70 text-white border border-white/10 backdrop-blur-md">
                    {project.investmentStage}
                  </span>
                  {project.demoVideoUrl && (
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-300 flex items-center gap-1">
                      <Play size={10} /> 영상
                    </span>
                  )}
                  {project.isHiring && (
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300">
                      채용중
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">{project.field}</span>
                  <span className="px-2 py-0.5 rounded bg-brand-primary-container/20 text-brand-primary border border-brand-primary-container/30 font-bold text-[10px]">
                    {project.investmentStage}
                  </span>
                </div>

                <h3 className="font-display text-base font-bold text-white mt-1.5 group-hover:text-brand-primary transition-colors line-clamp-1 leading-snug">
                  {project.teamName}
                </h3>
                <p className="text-xs text-brand-primary font-medium mt-0.5 truncate">{project.title}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {project.oneLiner}
                </p>
              </div>
            </div>

            {/* Footer */}
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
                <span className="text-xs px-2.5 py-1 rounded bg-brand-primary-container/15 text-brand-primary border border-brand-primary/25 font-semibold">
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
    </div>
  );
}
