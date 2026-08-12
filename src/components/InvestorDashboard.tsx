import React from "react";
import {
  Heart,
  Sparkles,
  Calendar,
  MessageSquare,
  Star,
  Target,
  BookmarkCheck,
  TrendingUp,
  Send,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { IRProject, AIRecommendation, InvestmentProposal } from "../types";

interface InvestorDashboardProps {
  bookmarkedProjects: IRProject[];
  recommendations: AIRecommendation[];
  proposals: InvestmentProposal[];
  onViewProject: (id: string) => void;
  onRemoveBookmark: (id: string) => void;
}

export default function InvestorDashboard({
  bookmarkedProjects,
  recommendations,
  proposals,
  onViewProject,
  onRemoveBookmark,
}: InvestorDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"bookmarks" | "ai" | "proposals">("bookmarks");

  const tabs = [
    { id: "bookmarks" as const, label: "관심 스타트업", icon: <Heart size={14} /> },
    { id: "ai" as const, label: "AI 추천 매칭", icon: <Sparkles size={14} /> },
    { id: "proposals" as const, label: "제안 및 미팅 관리", icon: <Calendar size={14} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">투자자 대시보드</h1>
        <p className="text-sm text-brand-on-surface-variant mt-1">관심 스타트업과 투자 제안을 관리하세요</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">관심 스타트업</p>
          <p className="text-2xl font-bold text-brand-accent-orange font-display mt-1">{bookmarkedProjects.length}</p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">AI 추천</p>
          <p className="text-2xl font-bold text-brand-primary font-display mt-1">{recommendations.length}</p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">보낸 제안</p>
          <p className="text-2xl font-bold text-white font-display mt-1">{proposals.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-brand-border/30 pb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? "text-brand-primary tab-active"
                : "text-brand-on-surface-variant hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 관심 스타트업 ── */}
      {activeTab === "bookmarks" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {bookmarkedProjects.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <BookmarkCheck size={32} className="text-brand-on-surface-variant mx-auto mb-3" />
              <p className="text-sm text-brand-on-surface-variant">관심 등록한 스타트업이 없습니다</p>
              <p className="text-xs text-brand-on-surface-variant/60 mt-1">IR 게시판에서 관심 표시를 해보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookmarkedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-brand-card border border-brand-border/60 rounded-xl p-5 card-hover cursor-pointer group"
                  onClick={() => onViewProject(project.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[9px] font-mono text-brand-on-surface-variant">{project.field}</span>
                      <h3 className="text-sm font-bold text-white mt-0.5 group-hover:text-brand-primary transition-colors">
                        {project.teamName}
                      </h3>
                      <p className="text-[10px] text-brand-on-surface-variant mt-1">{project.oneLiner}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveBookmark(project.id); }}
                      className="text-brand-accent-orange hover:text-brand-accent-rose transition-colors cursor-pointer p-1"
                      title="관심 해제"
                    >
                      <Heart size={16} fill="currentColor" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-brand-border/30">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-primary-container/15 text-brand-primary border border-brand-primary-container/25">
                      {project.investmentStage}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-brand-on-surface-variant">
                      <TrendingUp size={10} />
                      <span>업데이트 알림 활성</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── AI 추천 매칭 ── */}
      {activeTab === "ai" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="bg-gradient-to-r from-brand-primary-container/10 to-brand-tertiary/5 border border-brand-primary-container/20 rounded-xl p-4 flex items-center gap-3 mb-2">
            <Sparkles size={20} className="text-brand-primary flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-brand-primary">AI가 분석한 맞춤 추천</p>
              <p className="text-[10px] text-brand-on-surface-variant mt-0.5">투자 선호 분야 및 키워드를 기반으로 자동 매칭된 프로젝트입니다</p>
            </div>
          </div>

          {recommendations.map((rec, idx) => (
            <div
              key={rec.projectId}
              className="bg-brand-card border border-brand-border/60 rounded-xl p-5 card-hover cursor-pointer animate-slideUp"
              style={{ animationDelay: `${idx * 80}ms` }}
              onClick={() => onViewProject(rec.projectId)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{rec.projectName}</h3>
                  <span className="text-[9px] font-mono text-brand-on-surface-variant">{rec.field}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-brand-primary-container/15 px-2.5 py-1 rounded-full border border-brand-primary-container/25">
                  <Target size={12} className="text-brand-primary" />
                  <span className="text-xs font-bold text-brand-primary">{rec.matchScore}%</span>
                  <span className="text-[9px] text-brand-on-surface-variant">매칭</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {rec.matchReasons.map((reason, i) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-brand-surface-low text-brand-on-surface-variant border border-brand-border/30">
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 제안 및 미팅 관리 ── */}
      {activeTab === "proposals" && (
        <div className="flex flex-col gap-3 animate-fadeIn">
          {proposals.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <Send size={32} className="text-brand-on-surface-variant mx-auto mb-3" />
              <p className="text-sm text-brand-on-surface-variant">보낸 투자 제안이 없습니다</p>
            </div>
          ) : (
            proposals.map((proposal) => (
              <div key={proposal.id} className="bg-brand-card border border-brand-border/60 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    proposal.status === "수락" ? "bg-brand-tertiary/15 text-brand-tertiary" :
                    proposal.status === "거절" ? "bg-error/15 text-error" :
                    "bg-brand-primary-container/15 text-brand-primary"
                  }`}>
                    {proposal.status === "수락" ? <CheckCircle size={18} /> :
                     proposal.status === "거절" ? <XCircle size={18} /> :
                     <Clock size={18} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{proposal.projectName}</h3>
                    <p className="text-[10px] text-brand-on-surface-variant mt-0.5">
                      {proposal.message.slice(0, 60)}...
                    </p>
                    <p className="text-[9px] text-brand-on-surface-variant/50 mt-1">{proposal.sentDate}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${
                  proposal.status === "수락" ? "badge-recruiting" :
                  proposal.status === "거절" ? "bg-error/10 text-error border border-error/20" :
                  "badge-progress"
                }`}>
                  {proposal.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
