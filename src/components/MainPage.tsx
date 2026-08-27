import React from "react";
import {
  Star,
  Users,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Megaphone,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { Course, IRProject, BoardPost } from "../types";

interface MainPageProps {
  courses: Course[];
  irProjects: IRProject[];
  notices: BoardPost[];
  onNavigate: (page: string) => void;
  onViewCourse: (id: string) => void;
  onViewIR: (id: string) => void;
  onViewPost?: (id: string) => void;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

export default function MainPage({
  courses,
  irProjects,
  notices,
  onNavigate,
  onViewCourse,
  onViewIR,
  onViewPost,
}: MainPageProps) {
  const activeCourses = courses.filter((c) => c.status === "모집중" || c.status === "진행중");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* ── 1. Hero Banner (중앙 집중형 슬림 카드) ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#111827] to-[#0f172a] border border-brand-border/60 py-8 px-6 sm:py-9 sm:px-8 text-center shadow-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-primary-container/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-brand-secondary/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
          {/* 메인 타이틀 */}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight [word-break:keep-all]">
            아이디어부터 투자까지,{" "}
            <span className="bg-gradient-to-r from-brand-primary via-brand-tertiary to-brand-secondary bg-clip-text text-transparent">
              AI로 빠르게 창업하라
            </span>
          </h1>

          {/* 서브카피 */}
          <p className="text-xs sm:text-sm text-brand-on-surface-variant leading-relaxed max-w-xl mx-auto [word-break:keep-all]">
            실시간 징검다리 교육, 자동 팀 매칭, 투자 유치 연계까지 — 창업의 전 과정을 원스톱으로 지원합니다.
          </p>
        </div>
      </section>

      {/* ── 2. 인기 강의 ── */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-brand-primary" />
              인기 추천 강의
            </h2>
            <p className="text-xs text-brand-on-surface-variant mt-1">창업가와 예비 창업자가 가장 많이 찾는 집중 과정</p>
          </div>
          <button
            onClick={() => onNavigate("courses")}
            className="text-xs text-brand-primary hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            전체 보기 <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeCourses.slice(0, 3).map((course, idx) => {
            const schedule = course.schedule;
            return (
              <div
                key={course.id}
                className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden card-hover cursor-pointer group animate-slideUp flex flex-col justify-between shadow-lg"
                style={{ animationDelay: `${idx * 80}ms` }}
                onClick={() => onViewCourse(course.id)}
              >
                <div>
                  {/* Thumbnail Header — 첨부 이미지 스타일 */}
                  <div className="h-20 relative overflow-hidden bg-gradient-to-r from-[#2e1065] via-[#4338ca] to-[#3b0764] flex items-center justify-center">
                    <span className="text-3xl opacity-50 drop-shadow-md select-none">🎓</span>
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md border ${
                          course.status === "모집중"
                            ? "bg-[#4f46e5]/30 border-[#6366f1]/60 text-[#a5b4fc]"
                            : course.status === "진행중"
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                            : "bg-slate-700/40 border-slate-600/50 text-slate-300"
                        }`}
                      >
                        {course.status}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#030712]/70 text-white border border-white/10 backdrop-blur-md">
                        {schedule?.totalSessions || 12}회차
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">{course.category}</span>
                      {schedule && (
                        <span className="text-xs font-semibold text-[#34d399] flex items-center gap-1.5">
                          <CalendarIcon size={13} className="text-[#34d399]" />
                          {schedule.startDate.slice(5)} ~ {schedule.endDate.slice(5)}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-base font-bold text-white mt-2 group-hover:text-brand-primary transition-colors line-clamp-1 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Schedule Details Badge */}
                    {schedule && (
                      <div className="mt-3.5 p-3 bg-[#0b1329]/90 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">일정: 매주 {schedule.daysOfWeek.join("·")}</span>
                        <span className="text-white font-mono font-bold tracking-wider">{schedule.timeSlot}</span>
                      </div>
                    )}

                    {/* Instructor */}
                    <div className="flex items-center gap-2.5 mt-3.5">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                        {course.instructor.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-300 font-medium">
                        {course.instructor} 강사
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between pt-3.5 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-white font-bold">{course.rating}</span>
                      <span className="text-xs text-slate-400">({course.reviewCount})</span>
                    </div>
                    <div className="text-right">
                      {course.discountedPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 line-through">
                            ₩{course.price.toLocaleString()}
                          </span>
                          <span className="text-base font-bold text-[#34d399]">
                            ₩{course.discountedPrice.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-base font-bold text-[#34d399]">₩{course.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. 주목받는 스타트업 ── */}
      <section>
        <div className="flex justify-between items-center mb-6">
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
              className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden card-hover cursor-pointer group animate-slideUp flex flex-col justify-between shadow-lg"
              style={{ animationDelay: `${idx * 60}ms` }}
              onClick={() => onViewIR(project.id)}
            >
              <div>
                {/* Thumbnail Header — 일관된 바이올렛/인디고 헤더 & 배지 */}
                <div className="h-20 relative overflow-hidden bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] flex items-center justify-center">
                  <span className="text-3xl opacity-50 drop-shadow-md select-none">🚀</span>
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md border bg-[#4f46e5]/30 border-[#6366f1]/60 text-[#a5b4fc]">
                      {project.field}
                    </span>
                    {project.isHiring && (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300">
                        채용중
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono">{project.field}</span>
                    <span className="px-2 py-0.5 rounded bg-brand-primary-container/20 text-brand-primary border border-brand-primary-container/30 font-bold text-[10px]">
                      {project.investmentStage}
                    </span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-white mt-1.5 group-hover:text-brand-primary transition-colors line-clamp-1">
                    {project.teamName}
                  </h3>
                  <p className="text-[11px] text-brand-primary font-medium mt-0.5 truncate">{project.title}</p>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {project.oneLiner}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400">팀원 {project.members?.length || 1}명</span>
                  <span className="text-brand-primary font-bold">{project.investmentStage}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. 최근 소식/공지사항 ── */}
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
              onClick={() => {
                if (onViewPost) {
                  onViewPost(post.id);
                } else {
                  onNavigate("community");
                }
              }}
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
  );
}
