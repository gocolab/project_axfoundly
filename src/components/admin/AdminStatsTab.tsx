import React from "react";
import {
  Users,
  DollarSign,
  BookOpen,
  Zap,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import type { DashboardStats } from "../../types";

interface AdminStatsTabProps {
  stats: DashboardStats;
}

const CHART_BARS = [35, 52, 48, 70, 65, 82, 90, 78, 95, 88, 72, 60];
const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export default function AdminStatsTab({ stats }: AdminStatsTabProps) {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-brand-primary" />
            <span className="text-[10px] text-brand-on-surface-variant font-mono uppercase">일일 가입자</span>
          </div>
          <p className="text-2xl font-bold text-white font-display">{stats.dailySignups}</p>
          <p className="text-[9px] text-brand-tertiary flex items-center gap-0.5 mt-1">
            <ArrowUpRight size={9} /> 월간 {stats.monthlySignups}명
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-brand-tertiary" />
            <span className="text-[10px] text-brand-on-surface-variant font-mono uppercase">총 결제액</span>
          </div>
          <p className="text-2xl font-bold text-white font-display">₩{(stats.monthlyRevenue / 10000).toFixed(0)}만</p>
          <p className="text-[9px] text-brand-on-surface-variant mt-1">
            누적 ₩{(stats.totalRevenue / 100000000).toFixed(1)}억
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-brand-accent-orange" />
            <span className="text-[10px] text-brand-on-surface-variant font-mono uppercase">활성 강의</span>
          </div>
          <p className="text-2xl font-bold text-white font-display">{stats.activeCourses}</p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-brand-accent-rose" />
            <span className="text-[10px] text-brand-on-surface-variant font-mono uppercase">매칭 성사</span>
          </div>
          <p className="text-2xl font-bold text-white font-display">{stats.teamMatchCount + stats.investmentMatchCount}</p>
          <p className="text-[9px] text-brand-on-surface-variant mt-1">
            팀빌딩 {stats.teamMatchCount} + 투자 {stats.investmentMatchCount}
          </p>
        </div>
      </div>

      {/* AI & Reverse Proposal KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-purple-900/20 to-brand-card border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-purple-300 font-semibold flex items-center gap-1.5">
              <BookOpen size={13} /> 수강생 개강 요청 매칭률
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
              {stats.courseMatchRate || 75}%
            </span>
          </div>
          <p className="text-xl font-bold text-white mt-1">
            {stats.courseRequestCount || 8}<span className="text-xs text-brand-on-surface-variant font-normal ml-1">건 요청</span>
          </p>
          <p className="text-[10px] text-brand-on-surface-variant mt-1">공감 투표 기반 강사 커리큘럼 승격</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-900/20 to-brand-card border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-cyan-300 font-semibold flex items-center gap-1.5">
              <TrendingUp size={13} /> 아이디어 의뢰 ➔ IR 승격률
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
              {stats.builderMatchRate || 68}%
            </span>
          </div>
          <p className="text-xl font-bold text-white mt-1">
            {stats.ideaRequestCount || 12}<span className="text-xs text-brand-on-surface-variant font-normal ml-1">건 발제</span>
          </p>
          <p className="text-[10px] text-brand-on-surface-variant mt-1">빌더 팀 MVP 제작 수락 및 IR 전환</p>
        </div>

        <div className="bg-gradient-to-br from-brand-primary/20 to-brand-card border border-brand-primary/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-brand-primary font-semibold flex items-center gap-1.5">
              <Sparkles size={13} /> AI 자동 채우기 활용량
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary font-bold">
              99.8% 성공
            </span>
          </div>
          <p className="text-xl font-bold text-white mt-1">
            {stats.aiAutoFillCount || 146}<span className="text-xs text-brand-on-surface-variant font-normal ml-1">회 호출</span>
          </p>
          <p className="text-[10px] text-brand-on-surface-variant mt-1">자연어 분야 및 스마트 명칭 재조정</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={14} className="text-brand-primary" />
          월별 가입자 추이
        </h2>
        <div className="flex items-end gap-2 h-40">
          {CHART_BARS.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[8px] text-brand-on-surface-variant">{val * 3}</span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-brand-primary-container to-brand-secondary chart-bar"
                style={{ height: `${val}%` }}
              />
              <span className="text-[8px] text-brand-on-surface-variant">{MONTHS[idx]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
