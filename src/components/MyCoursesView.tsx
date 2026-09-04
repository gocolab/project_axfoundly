import React from "react";
import {
  BookOpen,
  Play,
  Calendar as CalendarIcon,
  Download,
  Sparkles,
  Search,
  X,
  RotateCcw,
} from "lucide-react";
import type { Course } from "../types";
import Pagination from "./common/Pagination";
import SearchBar from "./common/SearchBar";
import HighlightText from "./common/HighlightText";
import { multiMatch } from "../utils/searchUtils";
import { useToast } from "./common/Toast";

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
  const toast = useToast();
  const enrolledCourses = courses.filter((c) => c.isEnrolled);
  const [filter, setFilter] = React.useState<"all" | "in_progress" | "completed">("all");
  const [searchText, setSearchText] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(6);

  const filteredCourses = enrolledCourses.filter((course) => {
    const matchFilter =
      filter === "all"
        ? true
        : filter === "in_progress"
        ? (course.progress || 0) < 100
        : (course.progress || 0) === 100;
    const matchSearch = multiMatch(
      [course.title, course.category, course.description, course.instructor],
      searchText
    );
    return matchFilter && matchSearch;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchText]);

  const handleResetFilters = () => {
    setFilter("all");
    setSearchText("");
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <BookOpen size={20} className="text-brand-primary" /> 내 강의실 (수강 관리)
          </h2>
          <p className="text-xs text-brand-on-surface-variant mt-1">
            수강 중인 강의의 일정 및 진도율을 확인하고 학습을 이어가세요
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-primary-container/20 border border-brand-primary/40 text-brand-primary text-xs font-bold self-start">
          <BookOpen className="w-3.5 h-3.5" /> 수강 중인 강의 {enrolledCourses.length}개
        </div>
      </div>

      {/* ── Filter Pills & Search Bar (Community Style) ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-xl border border-brand-border/40 self-start overflow-x-auto max-w-full">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === "all"
                ? "bg-brand-primary-container text-white shadow-sm"
                : "text-brand-on-surface-variant hover:text-white"
            }`}
          >
            전체 ({enrolledCourses.length})
          </button>
          <button
            onClick={() => setFilter("in_progress")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === "in_progress"
                ? "bg-brand-primary-container text-white shadow-sm"
                : "text-brand-on-surface-variant hover:text-white"
            }`}
          >
            수강 중 ({enrolledCourses.filter((c) => (c.progress || 0) < 100).length})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === "completed"
                ? "bg-brand-primary-container text-white shadow-sm"
                : "text-brand-on-surface-variant hover:text-white"
            }`}
          >
            수료 ({enrolledCourses.filter((c) => (c.progress || 0) === 100).length})
          </button>
        </div>

        <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full sm:w-auto shrink-0">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="강의명, 카테고리 검색... (/ 단축키)"
            className="w-full sm:w-64"
          />

          {totalPages > 1 && (
            <div className="ml-auto">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredCourses.length}
                itemsPerPage={itemsPerPage}
                onPageSizeChange={setItemsPerPage}
                pageSizeOptions={[6, 12, 24]}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Course Grid ── */}
      {enrolledCourses.length === 0 ? (
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
      ) : filteredCourses.length === 0 ? (
        <div className="bg-brand-card border border-brand-border/60 rounded-2xl p-12 text-center shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-brand-surface-low border border-brand-border/40 mx-auto flex items-center justify-center mb-3">
            <Search size={24} className="text-brand-on-surface-variant" />
          </div>
          <h3 className="text-sm font-bold text-white">일치하는 강의가 없습니다</h3>
          <p className="text-xs text-brand-on-surface-variant mt-1 max-w-sm mx-auto">
            검색어 또는 필터 조건을 변경해 보시거나 초기화해 보세요.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-surface-high border border-brand-border text-white text-xs font-bold hover:bg-brand-surface-highest transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <RotateCcw size={13} /> 검색 조건 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedCourses.map((course) => {
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
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
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
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md border ${
                          course.deliveryType === "vod"
                            ? "bg-purple-500/30 border-purple-500/50 text-purple-200"
                            : course.deliveryType === "offline"
                            ? "bg-amber-500/30 border-amber-500/50 text-amber-200"
                            : course.deliveryType === "hybrid"
                            ? "bg-emerald-500/30 border-emerald-500/50 text-emerald-200"
                            : "bg-cyan-500/30 border-cyan-500/50 text-cyan-200"
                        }`}
                      >
                        {course.deliveryType === "vod"
                          ? "🎥 VOD"
                          : course.deliveryType === "offline"
                          ? "🏢 현장"
                          : course.deliveryType === "hybrid"
                          ? "🔄 혼합"
                          : "💻 온라인"}
                      </span>
                      {isCompleted && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 backdrop-blur-md">
                          🎓 수료 완료
                        </span>
                      )}
                      {schedule && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#030712]/70 text-white border border-white/10 backdrop-blur-md">
                          {schedule.totalSessions}회차
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
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
                      <HighlightText text={course.title} query={searchText} />
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 mb-3 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Schedule & Location Info */}
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
                        {course.location && (
                          <div className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800/60">
                            🏢 오프라인: {course.location}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">
                          {isCompleted ? "🎉 공식 수료 완료" : "학습 진도율"}
                        </span>
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
                      <Play size={12} /> {isCompleted ? "복습하기 / 수료증" : "강의실 입장"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success("다운로드 시작", "학습 자료 및 강의 슬라이드가 다운로드되었습니다.");
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
