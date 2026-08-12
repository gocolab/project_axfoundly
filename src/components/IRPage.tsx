import React from "react";
import {
  ArrowLeft,
  Users,
  Briefcase,
  Target,
  Lightbulb,
  Search,
  Heart,
  Send,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import type { IRProject, UserRole } from "../types";

interface IRPageProps {
  projects: IRProject[];
  userRole: UserRole;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onToggleBookmark: (id: string) => void;
}

export default function IRPage({ projects, userRole, isLoggedIn, onLoginClick, onToggleBookmark }: IRPageProps) {
  const [selectedProject, setSelectedProject] = React.useState<IRProject | null>(null);
  const [activeField, setActiveField] = React.useState<string>("전체");
  const [searchText, setSearchText] = React.useState("");
  const [showProposalModal, setShowProposalModal] = React.useState(false);
  const [proposalMessage, setProposalMessage] = React.useState("");
  const [proposalSent, setProposalSent] = React.useState(false);

  const fields = ["전체", "AI/ML", "핀테크", "헬스케어", "에듀테크", "커머스", "SaaS"];

  const filtered = projects.filter((p) => {
    const matchField = activeField === "전체" || p.field === activeField;
    const matchSearch = p.teamName.toLowerCase().includes(searchText.toLowerCase()) ||
      p.oneLiner.toLowerCase().includes(searchText.toLowerCase());
    return matchField && matchSearch;
  });

  // ── IR Detail View ──
  if (selectedProject) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
        <button
          onClick={() => { setSelectedProject(null); setProposalSent(false); }}
          className="flex items-center gap-1.5 text-sm text-brand-on-surface-variant hover:text-white mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} />
          스타트업 목록으로
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Project Detail */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header Card */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-indigo-700 to-purple-900 flex items-center justify-center relative">
                <span className="text-5xl opacity-20">🚀</span>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-primary-container/20 text-brand-primary border border-brand-primary-container/30">
                    {selectedProject.investmentStage}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-surface-high/80 text-brand-on-surface-variant">
                    {selectedProject.field}
                  </span>
                </div>
                {selectedProject.isHiring && (
                  <span className="absolute top-4 right-4 badge-recruiting text-[10px] font-bold px-2 py-0.5 rounded">
                    🔥 팀원 모집 중
                  </span>
                )}
              </div>

              <div className="p-6">
                <h1 className="font-display text-2xl font-bold text-white">{selectedProject.teamName}</h1>
                <p className="text-sm text-brand-primary mt-1 font-medium">{selectedProject.title}</p>
                <p className="text-sm text-brand-on-surface-variant mt-3 leading-relaxed">{selectedProject.oneLiner}</p>
              </div>
            </div>

            {/* Business Model */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Target size={18} className="text-brand-primary" />
                비즈니스 모델
              </h2>
              <p className="text-sm text-brand-on-surface-variant leading-relaxed">{selectedProject.businessModel}</p>
            </div>

            {/* Problem & Solution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5">
                <h3 className="text-sm font-bold text-brand-accent-rose flex items-center gap-1.5 mb-3">
                  <Target size={14} />
                  문제 (Problem)
                </h3>
                <p className="text-xs text-brand-on-surface-variant leading-relaxed">{selectedProject.problem}</p>
              </div>
              <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5">
                <h3 className="text-sm font-bold text-brand-tertiary flex items-center gap-1.5 mb-3">
                  <Lightbulb size={14} />
                  해결책 (Solution)
                </h3>
                <p className="text-xs text-brand-on-surface-variant leading-relaxed">{selectedProject.solution}</p>
              </div>
            </div>

            {/* Hiring Roles */}
            {selectedProject.isHiring && selectedProject.hiringRoles && (
              <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <Briefcase size={18} className="text-brand-tertiary" />
                  구인/구직 공고
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProject.hiringRoles.map((role, idx) => (
                    <div key={idx} className="p-3 bg-brand-surface-low rounded-lg border border-brand-border/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-tertiary/10 flex items-center justify-center">
                          <Users size={14} className="text-brand-tertiary" />
                        </div>
                        <span className="text-xs font-semibold text-white">{role}</span>
                      </div>
                      <button className="text-[10px] text-brand-primary hover:text-white transition-colors cursor-pointer">
                        지원하기 →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Team & Actions */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Team Members */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Users size={14} className="text-brand-primary" />
                팀 소개
              </h3>
              <div className="flex flex-col gap-3">
                {selectedProject.members.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-brand-surface-low rounded-lg">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary-container to-brand-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{member.name}</p>
                      <p className="text-[10px] text-brand-on-surface-variant">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 flex flex-col gap-3">
              {userRole === "investor" && isLoggedIn ? (
                <>
                  {proposalSent ? (
                    <div className="text-center py-3">
                      <span className="text-brand-tertiary text-sm font-bold">✓ 투자 제안이 전송되었습니다</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowProposalModal(true)}
                      className="w-full bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm flex items-center justify-center gap-2"
                    >
                      <Send size={16} />
                      투자 제안하기
                    </button>
                  )}
                </>
              ) : (
                <button
                  disabled={!isLoggedIn || userRole !== "investor"}
                  className="w-full bg-brand-surface-high text-brand-on-surface-variant py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                  title="투자자 계정으로 로그인해야 합니다"
                >
                  <Send size={16} />
                  투자 제안하기
                  <span className="text-[9px]">(투자자 전용)</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (!isLoggedIn) { onLoginClick(); return; }
                  onToggleBookmark(selectedProject.id);
                  setSelectedProject({ ...selectedProject, bookmarked: !selectedProject.bookmarked });
                }}
                className={`w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  selectedProject.bookmarked
                    ? "border-brand-accent-orange text-brand-accent-orange bg-brand-accent-orange/10"
                    : "border-brand-border text-brand-on-surface-variant hover:text-white hover:border-brand-surface-highest"
                }`}
              >
                {selectedProject.bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {selectedProject.bookmarked ? "관심 등록됨" : "관심 스타트업 등록"}
              </button>
            </div>
          </div>
        </div>

        {/* Investment Proposal Modal */}
        {showProposalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="font-display text-lg font-bold text-white mb-2">투자 제안하기</h3>
              <p className="text-xs text-brand-on-surface-variant mb-4">
                {selectedProject.teamName}에 투자 제안 메시지를 보냅니다.
              </p>
              <textarea
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                placeholder="투자 의향 및 미팅 제안 메시지를 작성하세요..."
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-3 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors h-28 resize-none"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="flex-1 border border-brand-border text-white py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-sm"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowProposalModal(false);
                    setProposalSent(true);
                    setProposalMessage("");
                  }}
                  className="flex-1 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm"
                >
                  제안 보내기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── IR List View ──
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">스타트업 / IR</h1>
        <p className="text-sm text-brand-on-surface-variant mt-1">수강생이 등록한 창업 프로젝트를 만나보세요</p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {fields.map((f) => (
            <button
              key={f}
              onClick={() => setActiveField(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                activeField === f
                  ? "bg-brand-primary-container/20 border-brand-primary-container/40 text-brand-primary font-bold"
                  : "border-brand-border text-brand-on-surface-variant hover:text-white hover:border-brand-surface-highest"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
          <input
            type="text"
            placeholder="스타트업 검색..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors w-full sm:w-56"
          />
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project, idx) => (
          <div
            key={project.id}
            className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden card-hover cursor-pointer group animate-slideUp"
            style={{ animationDelay: `${idx * 60}ms` }}
            onClick={() => setSelectedProject(project)}
          >
            <div className="h-32 relative overflow-hidden">
              <div className={`w-full h-full bg-gradient-to-br ${
                idx % 5 === 0 ? "from-blue-600 to-indigo-900" :
                idx % 5 === 1 ? "from-teal-600 to-emerald-950" :
                idx % 5 === 2 ? "from-amber-600 to-orange-900" :
                idx % 5 === 3 ? "from-violet-600 to-purple-950" :
                "from-rose-600 to-pink-900"
              } flex items-center justify-center`}>
                <span className="text-4xl opacity-20">🚀</span>
              </div>
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-surface-high/80 text-brand-on-surface-variant">{project.field}</span>
              </div>
              {project.isHiring && (
                <span className="absolute top-3 right-3 badge-recruiting text-[9px] font-bold px-1.5 py-0.5 rounded">채용중</span>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-display text-sm font-bold text-white group-hover:text-brand-primary transition-colors">
                {project.teamName}
              </h3>
              <p className="text-[11px] text-brand-on-surface-variant mt-1 line-clamp-2">{project.oneLiner}</p>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border/30">
                <div className="flex -space-x-1.5">
                  {project.members.slice(0, 3).map((m, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-brand-surface-high border border-brand-card flex items-center justify-center text-[8px] font-bold text-brand-primary">
                      {m.name.charAt(0)}
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-brand-surface-high border border-brand-card flex items-center justify-center text-[8px] text-brand-on-surface-variant">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-primary-container/15 text-brand-primary border border-brand-primary-container/25">
                  {project.investmentStage}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-brand-on-surface-variant text-sm">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}
