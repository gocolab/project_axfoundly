import React from "react";
import {
  BookOpen,
  Briefcase,
  Users,
  CreditCard,
  DollarSign,
  Heart,
  Sparkles,
  Play,
  Plus,
  ArrowRight,
  Bell,
  CheckCircle,
  Calendar as CalendarIcon,
  MessageSquare,
  Flame,
  Layers,
  Lightbulb,
} from "lucide-react";
import type {
  Course,
  IRProject,
  TeamBuildingRequest,
  SettlementRecord,
  AIRecommendation,
  InvestmentProposal,
  Notification,
} from "../types";

interface MyOverviewProps {
  userName: string;
  courses: Course[];
  myProjects: IRProject[];
  teamRequests: TeamBuildingRequest[];
  createdCourses: Course[];
  settlements: SettlementRecord[];
  bookmarkedProjects: IRProject[];
  recommendations: AIRecommendation[];
  proposals: InvestmentProposal[];
  notifications: Notification[];
  onNavigateTab: (tabId: string) => void;
  onViewCourse: (id: string) => void;
  onViewIR: (id: string) => void;
  onOpenProjectModal: () => void;
  onOpenCreateCourseModal: () => void;
  onOpenIdeaModal?: () => void;
}

export default function MyOverview({
  userName,
  courses,
  myProjects,
  teamRequests,
  createdCourses,
  settlements,
  bookmarkedProjects,
  recommendations,
  proposals,
  notifications,
  onNavigateTab,
  onViewCourse,
  onViewIR,
  onOpenProjectModal,
  onOpenCreateCourseModal,
  onOpenIdeaModal,
}: MyOverviewProps) {
  const enrolledCourses = courses.filter((c) => c.isEnrolled);
  const avgProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) /
            enrolledCourses.length
        )
      : 0;

  const totalTeachingStudents = createdCourses.reduce(
    (acc, c) => acc + (c.studentCount || 0),
    0
  );

  const pendingTeamRequests = teamRequests.filter(
    (r) => r.type === "received" && r.status === "대기중"
  );

  const totalSettlementPending = settlements
    .filter((s) => s.status === "정산대기")
    .reduce((acc, s) => acc + s.netAmount, 0);

  const recentNotifications = notifications.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-primary-container/40 via-brand-secondary/30 to-brand-primary/20 p-6 border border-brand-primary-container/40 backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary-container/30 border border-brand-primary-container/40 text-brand-primary text-xs font-semibold mb-2">
              <Sparkles size={13} />
              올인원 창업가 워크스페이스
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              안녕하세요, {userName}님! 👋
            </h2>
            <p className="text-xs sm:text-sm text-brand-on-surface-variant mt-1">
              오늘도 아이디어 검증부터 MVP 개발, 팀 빌딩, 투자 유치까지 한 단계 더 전진해보세요.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenProjectModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white text-xs font-bold hover:opacity-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> 새 IR 프로젝트
            </button>
            {onOpenIdeaModal && (
              <button
                onClick={onOpenIdeaModal}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb size={14} className="text-cyan-400" /> 아이디어 의뢰 (AI PRD)
              </button>
            )}
            <button
              onClick={onOpenCreateCourseModal}
              className="px-4 py-2.5 rounded-xl bg-brand-surface-high border border-brand-border/60 text-white text-xs font-bold hover:bg-brand-surface-highest transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} className="text-brand-tertiary" /> AI 강의 개설
            </button>
          </div>
        </div>
      </div>

      {/* ── 4대 핵심 지표 스탯 바 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. 수강 중인 강의 */}
        <div
          onClick={() => onNavigateTab("courses")}
          className="bg-brand-card border border-brand-border/60 rounded-xl p-4 cursor-pointer hover:border-brand-primary-container/50 transition-all card-hover group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-brand-on-surface-variant uppercase">
              수강 중인 강의
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-primary-container/15 text-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white font-display">
              {enrolledCourses.length}
              <span className="text-xs font-normal text-brand-on-surface-variant ml-1">
                개
              </span>
            </p>
            <span className="text-xs text-brand-primary font-mono font-semibold">
              평균 {avgProgress}%
            </span>
          </div>
        </div>

        {/* 2. 내 IR 프로젝트 */}
        <div
          onClick={() => onNavigateTab("startup")}
          className="bg-brand-card border border-brand-border/60 rounded-xl p-4 cursor-pointer hover:border-brand-tertiary/50 transition-all card-hover group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-brand-on-surface-variant uppercase">
              내 IR 프로젝트
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-tertiary/15 text-brand-tertiary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white font-display">
              {myProjects.length}
              <span className="text-xs font-normal text-brand-on-surface-variant ml-1">
                개
              </span>
            </p>
            {pendingTeamRequests.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-tertiary/20 text-brand-tertiary font-bold">
                지원 {pendingTeamRequests.length}건
              </span>
            )}
          </div>
        </div>

        {/* 3. 개설 강의 및 수강생 */}
        <div
          onClick={() => onNavigateTab("instructor")}
          className="bg-brand-card border border-brand-border/60 rounded-xl p-4 cursor-pointer hover:border-brand-secondary/50 transition-all card-hover group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-brand-on-surface-variant uppercase">
              개설 강의 수강생
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-secondary/15 text-brand-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white font-display">
              {totalTeachingStudents}
              <span className="text-xs font-normal text-brand-on-surface-variant ml-1">
                명
              </span>
            </p>
            <span className="text-xs text-brand-secondary font-mono font-semibold">
              {createdCourses.length}개 강의
            </span>
          </div>
        </div>

        {/* 4. 관심 스타트업 / 추천 딜 */}
        <div
          onClick={() => onNavigateTab("investor")}
          className="bg-brand-card border border-brand-border/60 rounded-xl p-4 cursor-pointer hover:border-brand-accent-orange/50 transition-all card-hover group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-brand-on-surface-variant uppercase">
              관심 스타트업
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-accent-orange/15 text-brand-accent-orange flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white font-display">
              {bookmarkedProjects.length}
              <span className="text-xs font-normal text-brand-on-surface-variant ml-1">
                개
              </span>
            </p>
            <span className="text-xs text-brand-accent-orange font-mono font-semibold">
              추천 {recommendations.length}건
            </span>
          </div>
        </div>
      </div>

      {/* ── 2열 메인 섹션 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: 수강 이어보기 & 내 프로젝트 현황 */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 수강 중인 강의 섹션 */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Play size={14} className="text-brand-primary" /> 수강 중인 강의
              </h3>
              <button
                onClick={() => onNavigateTab("courses")}
                className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                전체보기 <ArrowRight size={12} />
              </button>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className="py-8 text-center bg-brand-surface-low rounded-xl border border-brand-border/30">
                <p className="text-xs text-brand-on-surface-variant">
                  현재 수강 중인 강의가 없습니다.
                </p>
                <button
                  onClick={() => onNavigateTab("courses")}
                  className="mt-3 text-xs text-brand-primary font-bold hover:underline"
                >
                  강의 탐색하러 가기
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {enrolledCourses.slice(0, 2).map((course) => (
                  <div
                    key={course.id}
                    className="p-3.5 bg-brand-surface-low rounded-xl border border-brand-border/40 hover:border-brand-primary-container/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-primary-container/20 text-brand-primary font-bold">
                          {course.category}
                        </span>
                        <span className="text-[11px] text-brand-on-surface-variant">
                          진도율 {course.progress || 0}%
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {course.title}
                      </h4>
                      <p className="text-[11px] text-brand-on-surface-variant mt-0.5">
                        일정: 매주 [{course.schedule?.daysOfWeek?.join(", ")}] {course.schedule?.timeSlot}
                      </p>
                    </div>

                    <button
                      onClick={() => onViewCourse(course.id)}
                      className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <Play size={11} /> 강의실 입장
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 내 스타트업 & IR 현황 요약 */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase size={14} className="text-brand-tertiary" /> 내 스타트업 워크스페이스
              </h3>
              <button
                onClick={() => onNavigateTab("startup")}
                className="text-xs text-brand-tertiary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                전체보기 <ArrowRight size={12} />
              </button>
            </div>

            {myProjects.length === 0 ? (
              <div className="py-8 text-center bg-brand-surface-low rounded-xl border border-brand-border/30">
                <p className="text-xs text-brand-on-surface-variant">
                  아직 등록된 창업 프로젝트가 없습니다.
                </p>
                <button
                  onClick={onOpenProjectModal}
                  className="mt-3 text-xs bg-brand-tertiary/20 text-brand-tertiary px-3 py-1.5 rounded-lg font-bold hover:bg-brand-tertiary hover:text-white transition-colors"
                >
                  + 첫 IR 프로젝트 등록하기
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myProjects.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-brand-surface-low rounded-xl border border-brand-border/40 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{p.teamName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-surface-high text-brand-on-surface-variant font-mono">
                          {p.investmentStage}
                        </span>
                        <span className="text-[10px] text-brand-on-surface-variant">
                          {p.isAnonymous ? "🔒 스텔스" : "🌐 실명"}
                        </span>
                      </div>
                      <p className="text-xs text-brand-on-surface-variant mt-1 line-clamp-1">
                        {p.title}
                      </p>
                    </div>

                    <button
                      onClick={() => onViewIR(p.id)}
                      className="text-xs text-brand-tertiary hover:underline font-bold flex-shrink-0 cursor-pointer"
                    >
                      IR 보기 →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: 실시간 알림 & 빠른 액션 허브 */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 최근 알림 피드 */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell size={14} className="text-brand-accent-orange" /> 실시간 알림 & 메시지
              </h3>
              <button
                onClick={() => onNavigateTab("notifications")}
                className="text-xs text-brand-on-surface-variant hover:text-white transition-colors"
              >
                전체보기
              </button>
            </div>

            {recentNotifications.length === 0 ? (
              <p className="text-xs text-brand-on-surface-variant py-6 text-center">
                새로운 알림이 없습니다.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 bg-brand-surface-low rounded-lg border border-brand-border/30 flex items-start gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-brand-primary-container mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-white truncate">
                          {notif.title}
                        </p>
                        <span className="text-[9px] text-brand-on-surface-variant flex-shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-on-surface-variant line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI 추천 매칭 위젯 */}
          <div className="bg-gradient-to-br from-brand-card to-brand-surface-low border border-brand-border/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={14} className="text-brand-primary" /> AI 맞춤 추천 스타트업
              </h3>
              <button
                onClick={() => onNavigateTab("investor")}
                className="text-xs text-brand-primary hover:underline font-semibold cursor-pointer"
              >
                더보기
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {recommendations.slice(0, 2).map((rec, idx) => (
                <div
                  key={rec.projectId || idx}
                  onClick={() => onViewIR(rec.projectId)}
                  className="p-3 bg-brand-surface-high/60 rounded-lg border border-brand-border/30 hover:border-brand-primary-container/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{rec.projectName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary-container/20 text-brand-primary font-bold">
                      매칭률 {rec.matchScore}%
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-on-surface-variant mt-1 line-clamp-1">
                    {rec.matchReasons?.[0] || `${rec.field} 분야 맞춤 추천`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
