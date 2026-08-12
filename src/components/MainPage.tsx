import React from "react";
import {
  ArrowRight,
  Play,
  Star,
  Users,
  Clock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Megaphone,
  Zap,
} from "lucide-react";
import type { Course, IRProject, BoardPost } from "../types";

interface MainPageProps {
  courses: Course[];
  irProjects: IRProject[];
  notices: BoardPost[];
  onNavigate: (page: string) => void;
  onViewCourse: (id: string) => void;
  onViewIR: (id: string) => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export default function MainPage({
  courses,
  irProjects,
  notices,
  onNavigate,
  onViewCourse,
  onViewIR,
  isLoggedIn,
  onLoginClick,
}: MainPageProps) {
  const activeCourses = courses.filter((c) => c.status === "모집중" || c.status === "진행중");

  return (
    <div className="flex flex-col gap-0">
      {/* ── Hero Banner ── */}
      <section className="hero-gradient relative overflow-hidden rounded-2xl mx-4 sm:mx-6 mt-4 mb-8">
        {/* Decorative dots */}
        <div className="absolute top-6 right-8 w-32 h-32 rounded-full bg-brand-primary-container/10 blur-3xl" />
        <div className="absolute bottom-4 left-12 w-24 h-24 rounded-full bg-brand-tertiary/8 blur-2xl" />

        <div className="relative z-10 px-6 sm:px-10 py-12 sm:py-16 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-brand-primary-container/20 border border-brand-primary-container/30 rounded-full px-3 py-1 mb-4">
            <Sparkles size={12} className="text-brand-primary" />
            <span className="text-[11px] font-semibold text-brand-primary">AI 시대의 새로운 창업 여정</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
            AI로 창업의 모든 것을<br />
            <span className="bg-gradient-to-r from-brand-primary to-brand-tertiary bg-clip-text text-transparent">
              한 곳에서
            </span>
          </h1>

          <p className="text-sm sm:text-base text-brand-on-surface-variant mt-4 max-w-lg leading-relaxed">
            AI 기반 창업 교육부터 팀 빌딩, 투자 유치까지.
            당신의 아이디어를 현실로 만드는 올인원 플랫폼입니다.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => onNavigate("courses")}
              className="bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm flex items-center gap-2"
            >
              <Play size={14} />
              강의 둘러보기
            </button>
            {!isLoggedIn && (
              <button
                onClick={onLoginClick}
                className="border border-brand-border text-white px-5 py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-sm flex items-center gap-2"
              >
                무료 가입하기
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Quick stats */}
          <div className="flex gap-6 mt-8 text-center">
            <div>
              <p className="text-2xl font-bold text-white font-display">2,400+</p>
              <p className="text-[10px] text-brand-on-surface-variant mt-0.5">수강생</p>
            </div>
            <div className="w-px bg-brand-border/40" />
            <div>
              <p className="text-2xl font-bold text-white font-display">85+</p>
              <p className="text-[10px] text-brand-on-surface-variant mt-0.5">강의</p>
            </div>
            <div className="w-px bg-brand-border/40" />
            <div>
              <p className="text-2xl font-bold text-white font-display">₩12억</p>
              <p className="text-[10px] text-brand-on-surface-variant mt-0.5">투자 유치 총액</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col gap-10 pb-16">
        {/* ── 진행 중인 주요 강의 ── */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Zap size={18} className="text-brand-accent-orange" />
                진행 중인 주요 강의
              </h2>
              <p className="text-xs text-brand-on-surface-variant mt-1">지금 가장 인기 있는 강의를 만나보세요</p>
            </div>
            <button
              onClick={() => onNavigate("courses")}
              className="text-xs text-brand-primary hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              전체 보기 <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCourses.slice(0, 3).map((course, idx) => (
              <div
                key={course.id}
                className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden card-hover cursor-pointer group animate-slideUp"
                style={{ animationDelay: `${idx * 80}ms` }}
                onClick={() => onViewCourse(course.id)}
              >
                {/* Thumbnail */}
                <div className="h-36 relative overflow-hidden">
                  <div className={`w-full h-full bg-gradient-to-br ${
                    idx === 0 ? "from-indigo-700 to-purple-900" :
                    idx === 1 ? "from-teal-700 to-emerald-900" :
                    "from-rose-700 to-orange-900"
                  } flex items-center justify-center`}>
                    <span className="text-4xl opacity-30">🎓</span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      course.status === "모집중" ? "badge-recruiting" : "badge-progress"
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <span className="text-[10px] text-brand-on-surface-variant font-mono">{course.category}</span>
                  <h3 className="font-display text-sm font-bold text-white mt-1 group-hover:text-brand-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-[11px] text-brand-on-surface-variant mt-1 line-clamp-2">{course.description}</p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border/30">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="star-filled" />
                      <span className="text-[11px] text-white font-semibold">{course.rating}</span>
                      <span className="text-[10px] text-brand-on-surface-variant">({course.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-brand-on-surface-variant">
                      <Users size={12} />
                      <span className="text-[10px]">{course.studentCount}명</span>
                    </div>
                    <div className="text-right">
                      {course.discountedPrice ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-brand-on-surface-variant line-through">₩{course.price.toLocaleString()}</span>
                          <span className="text-xs font-bold text-brand-tertiary">₩{course.discountedPrice.toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-white">₩{course.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 주목받는 스타트업 ── */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-tertiary" />
                주목받는 스타트업
              </h2>
              <p className="text-xs text-brand-on-surface-variant mt-1">플랫폼을 통해 성장하는 우수 창업팀을 소개합니다</p>
            </div>
            <button
              onClick={() => onNavigate("ir")}
              className="text-xs text-brand-primary hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              전체 보기 <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {irProjects.slice(0, 4).map((project, idx) => (
              <div
                key={project.id}
                className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden card-hover cursor-pointer group animate-slideUp"
                style={{ animationDelay: `${idx * 60}ms` }}
                onClick={() => onViewIR(project.id)}
              >
                <div className="h-28 relative overflow-hidden">
                  <div className={`w-full h-full bg-gradient-to-br ${
                    idx === 0 ? "from-blue-600 to-indigo-900" :
                    idx === 1 ? "from-teal-600 to-emerald-950" :
                    idx === 2 ? "from-amber-600 to-orange-900" :
                    "from-violet-600 to-purple-950"
                  } flex items-center justify-center`}>
                    <span className="text-3xl opacity-30">🚀</span>
                  </div>
                  {project.isHiring && (
                    <span className="absolute top-2 right-2 badge-recruiting text-[9px] font-bold px-1.5 py-0.5 rounded">채용중</span>
                  )}
                </div>
                <div className="p-3">
                  <span className="text-[9px] text-brand-on-surface-variant font-mono">{project.field}</span>
                  <h3 className="text-xs font-bold text-white mt-0.5 group-hover:text-brand-primary transition-colors">{project.teamName}</h3>
                  <p className="text-[10px] text-brand-on-surface-variant mt-1 line-clamp-2">{project.oneLiner}</p>
                  <div className="mt-2 pt-2 border-t border-brand-border/30">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-primary-container/15 text-brand-primary border border-brand-primary-container/25">{project.investmentStage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 최근 소식/공지사항 ── */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Megaphone size={18} className="text-brand-accent-rose" />
                최근 소식
              </h2>
              <p className="text-xs text-brand-on-surface-variant mt-1">플랫폼 공지사항 및 커뮤니티 소식</p>
            </div>
            <button
              onClick={() => onNavigate("community")}
              className="text-xs text-brand-primary hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              전체 보기 <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">
            {notices.slice(0, 5).map((post, idx) => (
              <div
                key={post.id}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-brand-surface-low transition-colors cursor-pointer ${
                  idx < notices.slice(0, 5).length - 1 ? "border-b border-brand-border/30" : ""
                }`}
                onClick={() => onNavigate("community")}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {post.isPinned && (
                    <span className="text-[9px] font-bold text-brand-accent-rose bg-brand-accent-rose/10 px-1.5 py-0.5 rounded flex-shrink-0">공지</span>
                  )}
                  <span className="text-[10px] text-brand-on-surface-variant font-mono flex-shrink-0 w-12">{post.boardType}</span>
                  <h3 className="text-xs text-white font-medium truncate">{post.title}</h3>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className="text-[10px] text-brand-on-surface-variant">{post.createdAt}</span>
                  <span className="text-[10px] text-brand-on-surface-variant flex items-center gap-0.5">
                    <Users size={10} /> {post.viewCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
