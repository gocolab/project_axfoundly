import React from "react";
import {
  BookOpen,
  Play,
  Calendar as CalendarIcon,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import type { Course } from "../types";

interface MyCoursesViewProps {
  courses: Course[];
  onViewCourse: (id: string) => void;
  onNavigateToCourses?: () => void;
}

export default function MyCoursesView({
  courses,
  onViewCourse,
  onNavigateToCourses,
}: MyCoursesViewProps) {
  const enrolledCourses = courses.filter((c) => c.isEnrolled);
  const [filter, setFilter] = React.useState<"all" | "in_progress" | "completed">("all");

  const filteredCourses = enrolledCourses.filter((course) => {
    if (filter === "in_progress") return (course.progress || 0) < 100;
    if (filter === "completed") return (course.progress || 0) === 100;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <BookOpen size={20} className="text-brand-primary" /> 내 강의실 (수강 관리)
          </h2>
          <p className="text-xs text-brand-on-surface-variant mt-1">
            수강 중인 강의의 일정, 실시간 진도율 및 학습 슬라이드/VOD를 확인하세요
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-xl border border-brand-border/40 self-start">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-brand-primary-container text-white shadow-sm"
                : "text-brand-on-surface-variant hover:text-white"
            }`}
          >
            전체 ({enrolledCourses.length})
          </button>
          <button
            onClick={() => setFilter("in_progress")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "in_progress"
                ? "bg-brand-primary-container text-white shadow-sm"
                : "text-brand-on-surface-variant hover:text-white"
            }`}
          >
            수강 중 ({enrolledCourses.filter((c) => (c.progress || 0) < 100).length})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "completed"
                ? "bg-brand-primary-container text-white shadow-sm"
                : "text-brand-on-surface-variant hover:text-white"
            }`}
          >
            수료 ({enrolledCourses.filter((c) => (c.progress || 0) === 100).length})
          </button>
        </div>
      </div>

      {/* ── Course Grid ── */}
      {filteredCourses.length === 0 ? (
        <div className="bg-brand-card border border-brand-border/60 rounded-2xl p-12 text-center shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-brand-surface-low border border-brand-border/40 mx-auto flex items-center justify-center mb-3">
            <BookOpen size={24} className="text-brand-on-surface-variant" />
          </div>
          <h3 className="text-sm font-bold text-white">수강 중인 강의가 없습니다</h3>
          <p className="text-xs text-brand-on-surface-variant mt-1 max-w-sm mx-auto">
            AI 창업 커리큘럼에서 나에게 꼭 맞는 실전 강의를 탐색하고 첫 수업을 시작해보세요!
          </p>
          {onNavigateToCourses && (
            <button
              onClick={onNavigateToCourses}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white text-xs font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Sparkles size={13} /> 추천 강의 둘러보기
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const schedule = course.schedule;
            const isCompleted = (course.progress || 0) === 100;

            return (
              <div
                key={course.id}
                onClick={() => onViewCourse(course.id)}
                className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden card-hover cursor-pointer shadow-lg flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Header */}
                  <div className="h-24 relative overflow-hidden bg-gradient-to-r from-[#2e1065] via-[#4338ca] to-[#3b0764] flex items-center justify-center">
                    <span className="text-4xl opacity-50 drop-shadow-md select-none group-hover:scale-110 transition-transform duration-300">
                      🎓
                    </span>
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
                      {schedule && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#030712]/70 text-white border border-white/10 backdrop-blur-md">
                          {schedule.totalSessions}회차
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-400 font-medium">
                        {course.category}
                      </span>
                      {schedule && (
                        <span className="text-xs font-semibold text-[#34d399] flex items-center gap-1">
                          <CalendarIcon size={12} className="text-[#34d399]" />
                          {schedule.startDate.slice(5)} ~ {schedule.endDate.slice(5)}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-base font-bold text-white leading-snug line-clamp-1 group-hover:text-brand-primary transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 mb-3 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Schedule Info */}
                    {schedule && (
                      <div className="bg-[#0b1329]/90 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">
                            일정: 매주 [{schedule.daysOfWeek.join(", ")}]
                          </span>
                          <span className="text-white font-mono font-bold">
                            {schedule.timeSlot}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">학습 진도율</span>
                        <span className="text-[#34d399] font-mono font-bold">
                          {course.progress || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-primary-container to-[#34d399] rounded-full transition-all duration-500"
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex gap-2 pt-3.5 border-t border-slate-800/80">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewCourse(course.id);
                      }}
                      className="flex-1 text-xs font-bold bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Play size={12} /> {isCompleted ? "복습하기" : "강의실 입장"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("학습 자료 및 강의 슬라이드가 다운로드되었습니다.");
                      }}
                      title="학습 자료 다운로드"
                      className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2.5 rounded-xl hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
