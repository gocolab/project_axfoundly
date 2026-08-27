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
  Lightbulb,
} from "lucide-react";
import type { Course, CourseRequest } from "../types";
import Pagination from "./common/Pagination";
import { useToast } from "./common/Toast";
import { api } from "../lib/api";

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
  const [viewTab, setViewTab] = React.useState<"enrolled" | "requested">("enrolled");
  const [myRequests, setMyRequests] = React.useState<CourseRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = React.useState(false);

  const enrolledCourses = courses.filter((c) => c.isEnrolled);
  const [filter, setFilter] = React.useState<"all" | "in_progress" | "completed">("all");
  const [searchText, setSearchText] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  React.useEffect(() => {
    if (viewTab === "requested") {
      setRequestsLoading(true);
      api.getCourseRequests()
        .then((res) => {
          setMyRequests(res.requests || []);
        })
        .catch((err) => console.error("Failed to load requests", err))
        .finally(() => setRequestsLoading(false));
    }
  }, [viewTab]);

  const filteredCourses = enrolledCourses.filter((course) => {
    const matchFilter =
      filter === "all"
        ? true
        : filter === "in_progress"
        ? (course.progress || 0) < 100
        : (course.progress || 0) === 100;
    const matchSearch =
      searchText.trim() === "" ||
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      course.category.toLowerCase().includes(searchText.toLowerCase()) ||
      course.description.toLowerCase().includes(searchText.toLowerCase()) ||
      (course.instructor && course.instructor.toLowerCase().includes(searchText.toLowerCase()));
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
      {/* ── Header with Tab Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <BookOpen size={20} className="text-brand-primary" /> 내 강의실 (수강 관리)
          </h2>
          <p className="text-xs text-brand-on-surface-variant mt-1">
            수강 중인 강의의 일정 및 진도율, 또는 내가 요청한 개강 건의 강사 제안 현황을 확인하세요
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 self-start">
          <button
            onClick={() => setViewTab("enrolled")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewTab === "enrolled"
                ? "bg-brand-primary text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> 수강 중인 강의 ({enrolledCourses.length})
          </button>
          <button
            onClick={() => setViewTab("requested")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewTab === "requested"
                ? "bg-amber-500 text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" /> 개강 요청 건
          </button>
        </div>
      </div>

      {viewTab === "requested" ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="text-xs text-amber-200">
              💡 내가 등록하거나 참여한 개강 요청 건입니다. 목표 공감 수가 모이면 전문 강사가 맞춤 커리큘럼을 제안합니다.
            </div>
            {onNavigateToCourses && (
              <button
                onClick={onNavigateToCourses}
                className="text-xs font-bold text-amber-400 hover:underline shrink-0 ml-2"
              >
                개강 요청소 가기 →
              </button>
            )}
          </div>

          {requestsLoading ? (
            <div className="text-center py-12 text-white/50 text-xs">요청 목록 로딩 중...</div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-12 bg-brand-surface-low rounded-xl border border-white/10">
              <p className="text-xs text-white/50">등록된 개강 요청이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          req.status === "모집중"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : req.status === "강사매칭중"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-[10px] text-white/50 font-mono">{req.category}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{req.title}</h4>
                    <p className="text-xs text-white/60 mt-1 line-clamp-2">{req.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-white/50">공감 수강생</span>
                      <span className="text-amber-400 font-bold">{req.upvoteCount} / {req.targetCount}명</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-300 font-medium">
                        접수된 강사 제안: <strong className="text-white font-bold">{req.proposals?.length || 0}건</strong>
                      </span>
                      {onNavigateToCourses && (
                        <button
                          onClick={onNavigateToCourses}
                          className="text-xs text-brand-primary hover:underline font-semibold cursor-pointer"
                        >
                          교육 메뉴로 이동 →
                        </button>
                      )}
                    </div>

                    {req.proposals && req.proposals.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {req.proposals.map((p) => {
                          const formattedPrice = (p.price || (p as any).proposedPrice || 0).toLocaleString();
                          const scheduleText =
                            typeof p.proposedSchedule === "string"
                              ? p.proposedSchedule
                              : p.proposedSchedule?.daysOfWeek
                              ? `매주 [${p.proposedSchedule.daysOfWeek.join(", ")}] (${p.proposedSchedule.totalSessions || 8}회차)`
                              : "일정 협의";

                          return (
                            <div
                              key={p.id}
                              className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs flex flex-col gap-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white">{p.instructorName} 강사</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded ${
                                    p.status === "채택됨"
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : "bg-slate-700 text-slate-300"
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-purple-200/90 font-medium">{p.proposedTitle}</p>
                              {p.message && <p className="text-[11px] text-white/70 line-clamp-2">{p.message}</p>}
                              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                                <span>일정: {scheduleText}</span>
                                <span className="font-semibold text-emerald-400">수강료: {formattedPrice}원</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
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
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
            <input
              type="text"
              placeholder="강의명, 카테고리 검색..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-8 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant hover:text-white cursor-pointer"
                title="검색어 지우기"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {totalPages > 1 && (
            <div className="ml-auto">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredCourses.length}
                itemsPerPage={itemsPerPage}
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
      </>
      )}
    </div>
  );
}
