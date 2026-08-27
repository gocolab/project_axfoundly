import React from "react";
import {
  Star,
  Users,
  Clock,
  ArrowLeft,
  Play,
  CheckCircle,
  Search,
  CreditCard,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  MessageSquare,
  Sparkles,
  Briefcase,
  X,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Lightbulb,
  ThumbsUp,
  Send,
  Target,
  FileCheck,
} from "lucide-react";
import type { Course, InstructorProfile, Review, CourseRequest, CourseProposal } from "../types";
import Pagination from "./common/Pagination";
import CourseCreateEditModal from "./CourseCreateEditModal";
import CourseRequestModal from "./CourseRequestModal";
import CourseProposalModal from "./CourseProposalModal";
import { useToast } from "./common/Toast";
import { api } from "../lib/api";

interface CoursePageProps {
  courses: Course[];
  onEnroll: (courseId: string, paymentMethod?: "카드" | "계좌이체" | "카카오페이") => void;
  isLoggedIn: boolean;
  userRoles?: import("../types").UserRole[];
  userName?: string;
  onLoginClick: () => void;
  onSaveCourse?: (course: Course) => void;
  initialCourseId?: string | null;
  onClearSelectedCourse?: () => void;
}

export default function CoursePage({
  courses,
  onEnroll,
  isLoggedIn,
  userName = "게스트",
  onLoginClick,
  onSaveCourse,
  initialCourseId,
  onClearSelectedCourse,
}: CoursePageProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = React.useState<"browse" | "requests">("browse");

  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(() => {
    if (initialCourseId) {
      return courses.find((c) => c.id === initialCourseId) || null;
    }
    return null;
  });

  React.useEffect(() => {
    if (selectedCourse) {
      const match = courses.find((c) => c.id === selectedCourse.id);
      if (match && match !== selectedCourse) {
        setSelectedCourse(match);
      }
    } else if (initialCourseId) {
      const match = courses.find((c) => c.id === initialCourseId);
      if (match) {
        setSelectedCourse(match);
      }
    }
  }, [initialCourseId, courses]);

  const [activeCategory, setActiveCategory] = React.useState<string>("전체");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [searchText, setSearchText] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"카드" | "카카오페이">("카카오페이");
  const [showInstructorModal, setShowInstructorModal] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(new Date(2025, 8, 1)); // Sep 2025

  // ── Reverse Proposal (개강 요청소) State ──
  const [courseRequests, setCourseRequests] = React.useState<CourseRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<CourseRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = React.useState(false);
  const [showProposalModal, setShowProposalModal] = React.useState(false);
  const [proposalTargetRequest, setProposalTargetRequest] = React.useState<CourseRequest | null>(null);
  const [requestSort, setRequestSort] = React.useState<"popular" | "recent">("popular");
  const [requestStatusFilter, setRequestStatusFilter] = React.useState<string>("전체");
  const [requestPage, setRequestPage] = React.useState(1);
  const requestsPerPage = 6;

  const fetchRequests = React.useCallback(async () => {
    try {
      setRequestsLoading(true);
      const res = await api.getCourseRequests({
        category: activeCategory === "전체" ? undefined : activeCategory,
        search: searchText || undefined,
        sort: requestSort,
        status: requestStatusFilter === "전체" ? undefined : requestStatusFilter,
      });
      setCourseRequests(res.requests || []);
    } catch (e) {
      console.error("Failed to fetch course requests", e);
    } finally {
      setRequestsLoading(false);
    }
  }, [activeCategory, searchText, requestSort, requestStatusFilter]);

  React.useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
    }
  }, [activeTab, fetchRequests]);

  const handleUpvoteRequest = async (e: React.MouseEvent, reqId: string) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onLoginClick();
      return;
    }
    try {
      const res = await api.upvoteCourseRequest(reqId, userName || "u-student-1");
      setCourseRequests((prev) =>
        prev.map((r) => (r.id === reqId ? res.request : r))
      );
      if (selectedRequest?.id === reqId) {
        setSelectedRequest(res.request);
      }
    } catch (err) {
      console.error("Upvote failed", err);
    }
  };

  const handleAcceptProposal = async (reqId: string, propId: string) => {
    const confirmed = await toast.confirm({
      title: "강의 개설 확정",
      message: "이 강사님의 제안서를 채택하여 정식 강의로 개설하시겠습니까?\n채택 시 플랫폼에 정식 강의가 즉시 오픈됩니다.",
      confirmText: "채택 및 개설하기",
      cancelText: "취소",
      type: "success",
    });
    if (!confirmed) return;

    try {
      const res = await api.acceptCourseProposal(reqId, propId);
      toast.success(
        "🎉 축하합니다! 정식 강의가 개설되었습니다.",
        "강의 탐색 탭에서 개설된 강의를 바로 확인하실 수 있습니다."
      );
      if (onSaveCourse && res?.course) {
        onSaveCourse(res.course);
      }
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      console.error("Accept proposal failed", err);
      toast.error("제안 채택 실패", "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const dynamicCategories = React.useMemo(() => {
    const catSet = new Set<string>();
    courses.forEach((c) => {
      if (c.category) catSet.add(c.category);
    });
    return ["전체", ...Array.from(catSet)];
  }, [courses]);

  const popularTags = React.useMemo(() => {
    const tagCount: Record<string, number> = {};
    courses.forEach((c) => {
      c.tags?.forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });
    return Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]).slice(0, 8);
  }, [courses]);

  // Filtered courses
  const filtered = courses.filter((c) => {
    const matchCategory = activeCategory === "전체" || c.category === activeCategory;
    const matchTag = !activeTag || c.tags?.includes(activeTag);
    const q = searchText.toLowerCase();
    const matchSearch =
      !searchText ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.tags?.some((t) => t.toLowerCase().includes(q));
    return matchCategory && matchTag && matchSearch;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCourses = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when category or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeTag, searchText]);

  // Calendar generation helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  // ── Course Detail View ──
  if (selectedCourse) {
    const schedule = selectedCourse.schedule;
    const instructorProfile = selectedCourse.instructorProfile;

    // Build session dates map for calendar
    const sessionDatesMap: Record<string, { week: number; title: string; time: string; sessionNumber?: number }> = {};
    selectedCourse.curriculum.forEach((curr, idx) => {
      if (curr.date) {
        sessionDatesMap[curr.date] = {
          week: curr.week,
          sessionNumber: curr.sessionNumber || idx + 1,
          title: curr.title,
          time: curr.time || schedule.timeSlot,
        };
      }
    });

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingArray = Array.from({ length: firstDay }, (_, i) => i);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
        {/* Back Button */}
        <button
          onClick={() => {
            setSelectedCourse(null);
            setShowInstructorModal(false);
            onClearSelectedCourse?.();
          }}
          className="flex items-center gap-1.5 text-sm text-brand-on-surface-variant hover:text-white mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} />
          강의 목록으로
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Course Main Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header Card — 일관된 바이올렛/인디고 썸네일 헤더 */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="h-24 sm:h-28 relative overflow-hidden bg-gradient-to-r from-[#2e1065] via-[#4338ca] to-[#3b0764] flex items-center justify-center">
                <span className="text-4xl opacity-50 drop-shadow-md select-none">🎓</span>
                <div className="absolute top-3.5 left-4 flex gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md border ${
                    selectedCourse.status === "모집중"
                      ? "bg-[#4f46e5]/30 border-[#6366f1]/60 text-[#a5b4fc]"
                      : selectedCourse.status === "진행중"
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-700/40 border-slate-600/50 text-slate-300"
                  }`}>
                    {selectedCourse.status}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#030712]/70 text-white border border-white/10 backdrop-blur-md">
                    {schedule.totalSessions}회차 완강
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/15 backdrop-blur-md">
                    {schedule.scheduleType === "stepping_stone" ? "징검다리 일정 연계" : "정기 일정"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-brand-primary px-2.5 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
                    {selectedCourse.category}
                  </span>
                  <span className="text-xs font-semibold text-[#34d399] flex items-center gap-1.5">
                    <CalendarIcon size={14} className="text-[#34d399]" />
                    {schedule.startDate} ~ {schedule.endDate}
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2.5 leading-tight">
                  {selectedCourse.title}
                </h1>
                <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                  {selectedCourse.description}
                </p>

                {/* AI 자동 추출 태그 목록 */}
                {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedCourse.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Course Metadata Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 p-4 bg-[#0b1329]/90 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">강의 일정</span>
                    <span className="text-xs font-semibold text-white">매주 {schedule.daysOfWeek.join("·")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">진행 시간</span>
                    <span className="text-xs font-semibold text-white">{schedule.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">총 회차</span>
                    <span className="text-xs font-semibold text-brand-tertiary">{schedule.totalSessions}회차 완강</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">평균 평점</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-white">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      {selectedCourse.rating} ({selectedCourse.reviewCount})
                    </div>
                  </div>
                </div>

                {/* Instructor Quick Bar (Clickable for Modal) */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800/80">
                  <div
                    onClick={() => setShowInstructorModal(true)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer group"
                    title="강사 상세 정보 및 모든 리뷰 보기"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary-container to-brand-tertiary flex items-center justify-center text-white text-sm font-bold shadow group-hover:scale-105 transition-transform">
                      {selectedCourse.instructor.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white group-hover:text-brand-primary transition-colors">
                          {selectedCourse.instructor}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-primary-container/20 text-brand-primary font-semibold">
                          강사 정보 보기 →
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedCourse.instructorTitle || "AI 및 스타트업 전문 디렉터"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Users size={14} className="text-[#34d399]" />
                    <span className="font-medium">{selectedCourse.studentCount}명 수강중</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Curriculum with Date & Time */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-brand-primary" />
                  커리큘럼 및 회차별 일정
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  총 {selectedCourse.curriculum.length}개 세션
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {selectedCourse.curriculum.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#0b1329]/80 rounded-xl border border-slate-800/80 hover:border-brand-primary/40 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary-container/20 text-brand-primary flex items-center justify-center flex-shrink-0 text-xs font-bold border border-brand-primary/30">
                        {item.sessionNumber || idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-brand-tertiary font-mono">
                            {item.week}주차
                          </span>
                          <h3 className="text-xs font-bold text-white">{item.title}</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      {item.date && (
                        <span className="text-[11px] font-semibold text-[#34d399] bg-[#34d399]/10 px-2 py-1 rounded-md border border-[#34d399]/20 flex items-center gap-1">
                          <CalendarIcon size={11} />
                          {item.date} ({item.dayOfWeek || "화"})
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-md">
                        <Clock size={11} /> {item.time || item.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Course Schedule Calendar Section */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <CalendarIcon size={18} className="text-brand-tertiary" />
                    강의 달력 & 수강 일정
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    달력에서 강의 날짜를 확인하고 수강 계획을 세워보세요
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                    className="p-1.5 rounded-lg border border-slate-700/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-bold text-white font-mono">
                    {year}년 {month + 1}월
                  </span>
                  <button
                    onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                    className="p-1.5 rounded-lg border border-slate-700/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Month Calendar Grid */}
              <div className="bg-[#0b1329]/80 rounded-xl p-4 border border-slate-800/80">
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800/60">
                  <span className="text-rose-400">일</span>
                  <span>월</span>
                  <span>화</span>
                  <span>수</span>
                  <span>목</span>
                  <span>금</span>
                  <span>토</span>
                </div>
                <div className="grid grid-cols-7 gap-1 pt-2">
                  {/* Empty slots for start day */}
                  {paddingArray.map((_, idx) => (
                    <div key={`pad-${idx}`} className="h-10 sm:h-12 rounded-lg bg-transparent" />
                  ))}

                  {/* Days */}
                  {daysArray.map((d) => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                    const hasSession = sessionDatesMap[dateStr];
                    const isSelected = selectedCalendarDate === dateStr;

                    return (
                      <div
                        key={d}
                        onClick={() => {
                          if (hasSession) {
                            setSelectedCalendarDate(isSelected ? null : dateStr);
                          }
                        }}
                        className={`h-10 sm:h-12 p-1 rounded-lg border transition-all flex flex-col justify-between ${
                          hasSession
                            ? isSelected
                              ? "bg-brand-primary-container text-white border-brand-primary shadow-lg cursor-pointer scale-105"
                              : "bg-brand-primary-container/20 text-white border-brand-primary/40 hover:bg-brand-primary-container/30 cursor-pointer"
                            : "bg-slate-900/40 text-slate-500 border-slate-800/40"
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className={hasSession ? "font-bold text-brand-primary" : ""}>{d}</span>
                          {hasSession && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                          )}
                        </div>
                        {hasSession && (
                          <div className="text-[8px] truncate font-semibold text-brand-tertiary">
                            {hasSession.sessionNumber}강
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected date session info box */}
              {selectedCalendarDate && sessionDatesMap[selectedCalendarDate] && (
                <div className="mt-3 p-3 bg-brand-primary-container/10 border border-brand-primary/30 rounded-xl flex items-center justify-between animate-fadeIn">
                  <div>
                    <span className="text-[10px] text-brand-primary font-bold">
                      {selectedCalendarDate} ({sessionDatesMap[selectedCalendarDate].sessionNumber}회차 강의)
                    </span>
                    <p className="text-xs font-bold text-white mt-0.5">
                      {sessionDatesMap[selectedCalendarDate].title}
                    </p>
                    <p className="text-[10px] text-brand-on-surface-variant">
                      시간: {sessionDatesMap[selectedCalendarDate].time}
                    </p>
                  </div>
                  {!selectedCourse.isEnrolled && (
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          onLoginClick();
                          return;
                        }
                        setShowPaymentModal(true);
                      }}
                      className="text-xs bg-brand-primary-container text-white font-bold py-1.5 px-3 rounded-lg hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
                    >
                      이 일정으로 신청하기
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare size={18} className="text-brand-primary" />
                  수강 후기 ({selectedCourse.reviews.length})
                </h2>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-white">{selectedCourse.rating}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {selectedCourse.reviews.map((review) => (
                  <div key={review.id} className="p-3.5 bg-[#0b1329]/80 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-brand-primary">
                        {review.author.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-white">{review.author}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 ml-auto">{review.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{review.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Enrollment Card & Instructor Infographic (Sticky sidebar) */}
          <div className="lg:col-span-1 flex flex-col gap-5 sticky top-20 self-start">
            {/* Enrollment Card */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              {/* Card Header Banner — 바이올렛/인디고 헤더 */}
              <div className="h-16 relative overflow-hidden bg-gradient-to-r from-[#2e1065] via-[#4338ca] to-[#3b0764] flex items-center justify-center">
                <span className="text-2xl opacity-40 drop-shadow-md select-none">💳</span>
                <div className="absolute top-2.5 left-3 flex gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg backdrop-blur-md border bg-[#4f46e5]/30 border-[#6366f1]/60 text-[#a5b4fc]">
                    수강 신청
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#030712]/70 text-white border border-white/10 backdrop-blur-md">
                    {schedule.totalSessions}회차
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="text-center mb-4">
                  {selectedCourse.discountedPrice ? (
                    <>
                      <span className="text-xs text-slate-500 line-through">
                        ₩{selectedCourse.price.toLocaleString()}
                      </span>
                      <p className="text-3xl font-bold text-[#34d399] font-display mt-1">
                        ₩{selectedCourse.discountedPrice.toLocaleString()}
                      </p>
                      <span className="text-xs text-rose-400 font-bold">
                        {Math.round((1 - selectedCourse.discountedPrice / selectedCourse.price) * 100)}% 특가 할인
                      </span>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-[#34d399] font-display">
                      ₩{selectedCourse.price.toLocaleString()}
                    </p>
                  )}
                </div>

                {isLoggedIn && selectedCourse.isEnrolled ? (
                  <div className="flex flex-col items-center gap-2 p-3 bg-[#0b1329] rounded-xl border border-emerald-500/30">
                    <div className="flex items-center gap-2 text-[#34d399]">
                      <CheckCircle size={18} />
                      <span className="text-sm font-bold">수강 신청 완료</span>
                    </div>

                    <div className="w-full progress-bar mt-2">
                      <div className="progress-bar-fill" style={{ width: `${selectedCourse.progress || 0}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      학습 진도율 {selectedCourse.progress || 0}%
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        onLoginClick();
                        return;
                      }
                      setShowPaymentModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                  >
                    <CreditCard size={16} />
                    수강 신청하기
                  </button>
                )}

                {/* Course Features list */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">강의 형태</span>
                    <span className="text-white font-semibold">라이브 + VOD 복습</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">진행 기간</span>
                    <span className="text-[#34d399] font-semibold">
                      {schedule.startDate.slice(5)} ~ {schedule.endDate.slice(5)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">수업 요일/시간</span>
                    <span className="text-white font-semibold">
                      {schedule.daysOfWeek.join(",")} {schedule.timeSlot}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">총 커리큘럼</span>
                    <span className="text-white font-semibold">{schedule.totalSessions}회차</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">모집 정원</span>
                    <span className="text-brand-tertiary font-semibold">{selectedCourse.studentCount}명 수강중</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Instructor Infographic Graphic Card (Sticky 같이 유지) ── */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl relative">
              {/* Card Header Banner — 바이올렛/인디고 헤더 */}
              <div className="h-16 relative overflow-hidden bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] flex items-center justify-center">
                <span className="text-2xl opacity-40 drop-shadow-md select-none">👨‍🏫</span>
                <div className="absolute top-2.5 left-3 flex gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg backdrop-blur-md border bg-[#4f46e5]/30 border-[#6366f1]/60 text-[#a5b4fc]">
                    강사 전문성
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                    <ShieldCheck size={10} /> 공식 인증
                  </span>
                </div>
              </div>

              <div className="p-5">
                {/* Instructor profile snippet */}
                <div
                  onClick={() => setShowInstructorModal(true)}
                  className="flex items-center gap-3 p-2 bg-[#0b1329] rounded-xl border border-slate-800/80 cursor-pointer hover:border-brand-primary/50 transition-all mb-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary-container to-brand-secondary flex items-center justify-center text-white font-bold text-lg shadow">
                    {selectedCourse.instructor.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1">
                      {selectedCourse.instructor}
                      <ExternalLink size={11} className="text-slate-400" />
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {instructorProfile?.title || selectedCourse.instructorTitle || "AI 스타트업 디렉터"}
                    </p>
                  </div>
                </div>

                {/* Infographic Metric Grid */}
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="p-2.5 bg-[#0b1329] rounded-lg border border-slate-800/80">
                    <p className="text-[9px] font-mono text-slate-400">경력</p>
                    <p className="text-sm font-bold text-white font-display mt-0.5">
                      {instructorProfile?.infographic.experienceYears || 10}년+
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#0b1329] rounded-lg border border-slate-800/80">
                    <p className="text-[9px] font-mono text-slate-400">누적 수강생</p>
                    <p className="text-sm font-bold text-brand-tertiary font-display mt-0.5">
                      {(instructorProfile?.totalStudents || 3400).toLocaleString()}+
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#0b1329] rounded-lg border border-slate-800/80">
                    <p className="text-[9px] font-mono text-slate-400">만족도</p>
                    <p className="text-sm font-bold text-[#34d399] font-display mt-0.5">
                      {instructorProfile?.infographic.satisfactionRate || 98}%
                    </p>
                  </div>
                </div>

                {/* Infographic Highlights */}
                <div className="space-y-2 text-[11px] text-slate-300 mb-4">
                  {(instructorProfile?.infographic.careerHighlights || [
                    "전) 글로벌 테크 유니콘 AI PM 리드",
                    "다수 생성형 AI 프로덕트 런칭 및 IR 유치 총괄",
                    "창업진흥원 및 주요 VC 공식 멘토",
                  ]).map((highlight, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-1.5">
                      <CheckCircle size={12} className="text-[#34d399] flex-shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                {/* Keyword Badges */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800/80">
                  {(instructorProfile?.infographic.topKeywords || [
                    "AI 프로덕트",
                    "실전 린스타트업",
                    "1:1 밀착 코칭",
                    "IR 피칭",
                  ]).map((kw, kwIdx) => (
                    <span
                      key={kwIdx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#0b1329] text-slate-300 border border-slate-800/80"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setShowInstructorModal(true)}
                  className="w-full mt-4 text-xs font-semibold py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer border border-slate-700/60 flex items-center justify-center gap-1"
                >
                  진행한 모든 강의 & 전체 리뷰 보기 →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Instructor Profile & All Courses/Reviews Modal ── */}
        {showInstructorModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="glass-panel-heavy rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto border border-brand-border">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary-container to-brand-tertiary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {selectedCourse.instructor.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                      {selectedCourse.instructor}
                      <span className="text-xs px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-semibold">
                        대표 강사
                      </span>
                    </h3>
                    <p className="text-xs text-brand-on-surface-variant mt-0.5">
                      {instructorProfile?.title || selectedCourse.instructorTitle || "AI 및 스타트업 전문 디렉터"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstructorModal(false)}
                  className="p-1 rounded-lg hover:bg-brand-surface-high text-brand-on-surface-variant hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Instructor Bio */}
              <div className="p-4 bg-brand-surface-low rounded-xl border border-brand-border/40 mb-5">
                <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <Award size={14} className="text-brand-primary" /> 강사 소개
                </h4>
                <p className="text-xs text-brand-on-surface-variant leading-relaxed">
                  {instructorProfile?.bio ||
                    `${selectedCourse.instructor} 강사는 다년간의 실무 AI 프로덕트 런칭 및 스타트업 인큐베이팅 경험을 바탕으로, 수강생들이 실제 시장에서 작동하는 비즈니스를 만들 수 있도록 핵심 실전 가이드를 제공합니다.`}
                </p>
              </div>

              {/* Past and Current Courses List */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-brand-tertiary" />
                  진행했던 모든 강의 이력
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(instructorProfile?.courses || [
                    { id: "c1", title: selectedCourse.title, category: selectedCourse.category, period: "2025.09~", studentCount: selectedCourse.studentCount, rating: selectedCourse.rating, status: selectedCourse.status },
                    { id: "c-old1", title: "생성형 AI 비즈니스 모델 마스터클래스", category: "비즈니스 기획", period: "2024.11~2025.02", studentCount: 420, rating: 4.9, status: "종료" },
                    { id: "c-old2", title: "LLM 에이전트 구축 실무 워크숍", category: "개발", period: "2025.03~2025.05", studentCount: 280, rating: 4.8, status: "종료" },
                  ]).map((courseItem) => (
                    <div
                      key={courseItem.id}
                      className="p-3 bg-brand-surface-low rounded-xl border border-brand-border/40 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono text-brand-on-surface-variant">
                            {courseItem.category}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            courseItem.status === "모집중" ? "badge-recruiting" :
                            courseItem.status === "진행중" ? "badge-progress" : "badge-closed"
                          }`}>
                            {courseItem.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white mt-1 line-clamp-1">{courseItem.title}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-brand-border/20 text-[10px] text-brand-on-surface-variant">
                        <span>{courseItem.period}</span>
                        <div className="flex items-center gap-1">
                          <Star size={10} className="star-filled" />
                          <span className="text-white font-bold">{courseItem.rating}</span>
                          <span>({courseItem.studentCount}명)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Student Reviews */}
              <div>
                <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-brand-primary" />
                  수강생 전체 리뷰 모음 ({selectedCourse.reviews.length + 2}건)
                </h4>
                <div className="flex flex-col gap-2.5">
                  {[
                    ...selectedCourse.reviews,
                    {
                      id: "r-prev-1",
                      author: "강동원 (이전 수강생)",
                      avatar: "",
                      rating: 5,
                      content: "강사님의 커리큘럼 구성과 징검다리 일정 관리가 너무 좋았습니다. 이론과 실습의 밸런스가 최고입니다.",
                      date: "2025-06-18",
                    },
                    {
                      id: "r-prev-2",
                      author: "윤서아 (이전 수강생)",
                      avatar: "",
                      rating: 5,
                      content: "질문 하나하나 꼼꼼하게 피드백해주시고 강의 후에도 실무 질문에 친절하게 답변해주셨습니다.",
                      date: "2025-05-10",
                    },
                  ].map((rev) => (
                    <div key={rev.id} className="p-3 bg-brand-surface-low rounded-xl border border-brand-border/30">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{rev.author}</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                className={i < rev.rating ? "star-filled" : "star-empty"}
                                fill={i < rev.rating ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-brand-on-surface-variant">{rev.date}</span>
                      </div>
                      <p className="text-xs text-brand-on-surface-variant leading-relaxed">{rev.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowInstructorModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-brand-surface-high text-white hover:bg-brand-primary-container text-xs font-bold transition-colors cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Payment Confirmation Modal ── */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="glass-panel-heavy rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-brand-border">
              <h3 className="font-display text-lg font-bold text-white mb-2">수강 신청 및 결제</h3>
              <p className="text-xs text-brand-on-surface-variant mb-4">아래 강의를 결제하시겠습니까?</p>


              <div className="bg-brand-surface-low rounded-xl p-4 border border-brand-border/30 mb-4">
                <p className="text-sm font-bold text-white">{selectedCourse.title}</p>
                <p className="text-xs text-brand-on-surface-variant mt-1">
                  {selectedCourse.instructor} · {selectedCourse.category}
                </p>
                <div className="mt-2 pt-2 border-t border-brand-border/20 text-[11px] text-brand-on-surface-variant">
                  일정: {schedule.startDate} ~ {schedule.endDate} ({schedule.daysOfWeek.join(",")})
                </div>
                <p className="text-lg font-bold text-brand-tertiary mt-2">
                  ₩{(selectedCourse.discountedPrice || selectedCourse.price).toLocaleString()}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-brand-on-surface-variant mb-2">결제 수단 선택</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod("카카오페이")}
                    className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      paymentMethod === "카카오페이" 
                        ? "bg-[#FEE500] text-black border-[#FEE500]" 
                        : "bg-transparent text-brand-on-surface-variant border-brand-border"
                    }`}
                  >
                    카카오페이
                  </button>
                  <button
                    onClick={() => setPaymentMethod("카드")}
                    className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      paymentMethod === "카드" 
                        ? "bg-brand-surface-high text-white border-brand-border" 
                        : "bg-transparent text-brand-on-surface-variant border-brand-border"
                    }`}
                  >
                    일반 카드
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border border-brand-border text-white py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-sm"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    onEnroll(selectedCourse.id, paymentMethod);
                    setShowPaymentModal(false);
                    // setSelectedCourse is handled in parent/App if needed
                  }}
                  className="flex-1 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm shadow-md"
                >
                  결제하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Course List & Request View ──
  const filteredRequests = courseRequests.filter((r) => {
    const matchCategory = activeCategory === "전체" || r.category === activeCategory;
    const matchTag = !activeTag || r.tags?.includes(activeTag);
    const matchStatus = requestStatusFilter === "전체" || r.status === requestStatusFilter;
    const q = searchText.toLowerCase();
    const matchSearch =
      !searchText ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.requestedBy?.userName.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.tags?.some((t) => t.toLowerCase().includes(q));
    return matchCategory && matchTag && matchStatus && matchSearch;
  });

  const totalRequestPages = Math.ceil(filteredRequests.length / requestsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (requestPage - 1) * requestsPerPage,
    requestPage * requestsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-white">교육 / 강의</h1>
        <p className="text-sm text-brand-on-surface-variant mt-1">
          실시간 일정 연계 강의 탐색부터 수강생 수요 기반 개강 요청까지 모두 지원합니다.
        </p>
      </div>

      {/* ── Sub-Navigation Tabs (개설된 강의 탐색 vs 수강생 개강 요청소) ── */}
      <div className="flex items-center gap-3 border-b border-white/10 mb-6 pb-1">
        <button
          onClick={() => {
            setActiveTab("browse");
            setSelectedRequest(null);
          }}
          className={`pb-2.5 px-3 text-sm font-bold transition-all cursor-pointer relative flex items-center gap-2 ${
            activeTab === "browse"
              ? "text-brand-primary border-b-2 border-brand-primary font-extrabold"
              : "text-white/60 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" /> 개설된 강의 탐색
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
            {courses.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("requests");
            setSelectedCourse(null);
          }}
          className={`pb-2.5 px-3 text-sm font-bold transition-all cursor-pointer relative flex items-center gap-2 ${
            activeTab === "requests"
              ? "text-amber-400 border-b-2 border-amber-400 font-extrabold"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-400" /> 수강생 개강 요청소
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            수요 역제안
          </span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. 개설된 강의 탐색 (BROWSE TAB)                          */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "browse" && (
        <>
          {/* Streamlined Search & Action Bar */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={15} />
                <input
                  type="text"
                  placeholder="강의명, 강사명, 분야, 태그 검색..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="bg-brand-surface-low border border-brand-border rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors w-full shadow-inner"
                />
              </div>

              {/* Right Action & Pagination */}
              <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                {isLoggedIn && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-brand-primary/10"
                  >
                    <span className="text-base leading-none">+</span> 강의 개설 마법사
                  </button>
                )}

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filtered.length}
                    itemsPerPage={itemsPerPage}
                  />
                )}
              </div>
            </div>

            {/* Tag Cloud */}
            {popularTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-brand-border/20">
                <span className="text-[11px] font-semibold text-brand-on-surface-variant flex items-center gap-1">
                  <Sparkles size={12} className="text-purple-400" /> 실무 스킬 태그:
                </span>
                {popularTags.map((tag) => {
                  const isSelected = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(isSelected ? null : tag)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-purple-500/20 text-purple-300 border-purple-500 font-bold shadow-sm"
                          : "bg-brand-surface-low border-brand-border/60 text-slate-400 hover:text-white hover:border-brand-border"
                      }`}
                    >
                      #{tag}
                      {isSelected && <X size={10} className="ml-0.5" />}
                    </button>
                  );
                })}
                {activeTag && (
                  <button
                    onClick={() => setActiveTag(null)}
                    className="text-[10px] text-brand-on-surface-variant hover:text-white underline ml-1 cursor-pointer"
                  >
                    전체보기
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCourses.map((course, idx) => {
              const schedule = course.schedule;
              return (
                <div
                  key={course.id}
                  data-testid="course-card"
                  className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden card-hover cursor-pointer group animate-slideUp flex flex-col justify-between shadow-lg"
                  style={{ animationDelay: `${idx * 50}ms` }}
                  onClick={() => setSelectedCourse(course)}
                >
                  <div>
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
                          {schedule.totalSessions}회차
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">{course.category}</span>
                        <span className="text-xs font-semibold text-[#34d399] flex items-center gap-1.5">
                          <CalendarIcon size={13} className="text-[#34d399]" />
                          {schedule.startDate.slice(5)} ~ {schedule.endDate.slice(5)}
                        </span>
                      </div>

                      <h3 className="font-display text-base font-bold text-white mt-2 group-hover:text-brand-primary transition-colors line-clamp-1 leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>

                      {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {course.tags.slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3.5 p-3 bg-[#0b1329]/90 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">일정: 매주 {schedule.daysOfWeek.join("·")}</span>
                        <span className="text-white font-mono font-bold tracking-wider">{schedule.timeSlot}</span>
                      </div>

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

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-brand-card rounded-xl border border-brand-border/40 mt-4">
              <p className="text-brand-on-surface-variant text-sm">검색 결과가 없습니다</p>
            </div>
          )}
        </>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. 수강생 개강 요청소 (REVERSE PROPOSALS TAB)              */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {/* Hero Banner for Reverse Proposals */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/50 via-purple-950/40 to-slate-900 border border-amber-500/20 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                <Lightbulb className="w-3.5 h-3.5" /> 수요자 중심 개강 매칭
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                배우고 싶은 주제를 요청하면, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
                  전문 강사가 맞춤형 커리큘럼을 역제안합니다.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                공감 투표가 목표치에 도달하면 강사들의 개강 제안서가 등록되고, 채택 시 즉시 정식 강의로 개설됩니다.
              </p>
            </div>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  onLoginClick();
                  return;
                }
                setShowRequestModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-xl shadow-amber-500/20 transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Lightbulb className="w-4 h-4" /> + 개강 요청하기
            </button>
          </div>

          {/* Streamlined Filter & Search Bar for Requests */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {["전체", "모집중", "강사매칭중", "개강완료"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setRequestStatusFilter(st)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      requestStatusFilter === st
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold shadow-sm"
                        : "border-brand-border text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high/50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Sort Switch */}
              <div className="flex items-center gap-1 bg-brand-surface-low p-1 rounded-xl border border-brand-border text-xs shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setRequestSort("popular")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    requestSort === "popular"
                      ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  🔥 인기순
                </button>
                <button
                  onClick={() => setRequestSort("recent")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    requestSort === "recent"
                      ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  ⏱️ 최신순
                </button>
              </div>
            </div>

            {/* Search + Pagination */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={15} />
                <input
                  type="text"
                  placeholder="개강 요청 주제, 분야, 발제자, 키워드 검색..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="bg-brand-surface-low border border-brand-border rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-amber-500 transition-colors w-full shadow-inner"
                />
              </div>

              {totalRequestPages > 1 && (
                <div className="ml-auto shrink-0">
                  <Pagination
                    currentPage={requestPage}
                    totalPages={totalRequestPages}
                    onPageChange={setRequestPage}
                    totalItems={filteredRequests.length}
                    itemsPerPage={requestsPerPage}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Master-Detail Split Layout for Requests */}
          <div className="flex gap-6 items-start">
            {/* Left: Cards Grid (Pushes when detail panel is open) */}
            <div className={`transition-all duration-300 ${selectedRequest ? "w-full lg:w-3/5" : "w-full"}`}>
              {requestsLoading ? (
                <div className="text-center py-16 text-white/50 text-sm">개강 요청 목록을 불러오는 중...</div>
              ) : paginatedRequests.length === 0 ? (
                <div className="text-center py-16 bg-brand-card rounded-2xl border border-white/10">
                  <p className="text-white/60 text-sm">등록된 개강 요청이 없습니다.</p>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="mt-3 text-xs text-amber-400 hover:underline font-semibold"
                  >
                    + 첫 번째 개강 요청 등록하기
                  </button>
                </div>
              ) : (
                <div className={`grid gap-4 ${selectedRequest ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                  {paginatedRequests.map((req) => {
                    const isSelected = selectedRequest?.id === req.id;
                    const percent = Math.min(100, Math.round((req.upvoteCount / req.targetCount) * 100));
                    const isUpvoted = req.upvotes?.includes(userName || "u-student-1");

                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-lg relative overflow-hidden group ${
                          isSelected
                            ? "bg-brand-surface-high border-amber-500/60 ring-2 ring-amber-500/20"
                            : "bg-[#0f172a] border-slate-800 hover:border-slate-700 hover:bg-[#131d36]"
                        }`}
                      >
                        <div>
                          {/* Header badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                req.status === "모집중"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                  : req.status === "강사매칭중"
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              }`}
                            >
                              {req.status === "모집중" ? "🔥 수요 모집중" : req.status === "강사매칭중" ? "🧑‍🏫 강사 제안 검토중" : "✓ 개강 완료"}
                            </span>
                            <span className="text-[10px] text-white/50">{req.category}</span>
                          </div>

                          <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                            {req.title}
                          </h3>

                          <p className="text-xs text-white/60 mt-2 line-clamp-2 leading-relaxed">
                            {req.description}
                          </p>

                          {/* Progress Meter */}
                          <div className="mt-4 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-white/60">공감 수강생</span>
                              <span className="font-bold text-amber-400">
                                {req.upvoteCount} / {req.targetCount}명 ({percent}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Tags */}
                          {req.tags && req.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {req.tags.slice(0, 3).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/10"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer Buttons */}
                        <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => handleUpvoteRequest(e, req.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isUpvoted
                                ? "bg-amber-500 text-black border-amber-500 shadow-sm"
                                : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? "fill-black" : ""}`} />
                            {isUpvoted ? "공감 완료" : "나도 들을래요!"}
                          </button>

                          <div className="text-[11px] text-purple-300 font-medium">
                            강사 제안 {req.proposals?.length || 0}건
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Master-Detail Slide-in Panel */}
            {selectedRequest && (
              <div className="w-full lg:w-2/5 bg-brand-surface/95 border border-white/15 rounded-2xl p-6 shadow-2xl animate-slideInFromRight sticky top-24 max-h-[85vh] overflow-y-auto space-y-5">
                {/* Detail Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        selectedRequest.status === "모집중"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : selectedRequest.status === "강사매칭중"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {selectedRequest.status}
                    </span>
                    <span className="text-xs text-white/50">{selectedRequest.category}</span>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Request Info */}
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedRequest.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
                    <span>발제자: <b className="text-white">{selectedRequest.requestedBy.userName}</b></span>
                    <span>•</span>
                    <span>희망 난이도: <b className="text-amber-400">{selectedRequest.targetLevel || "입문"}</b></span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                    <span>희망 일정: <b className="text-white/80">{selectedRequest.preferredSchedule || "협의"}</b></span>
                    <span>•</span>
                    <span>희망 가격: <b className="text-emerald-400">{selectedRequest.expectedPriceRange || "협의"}</b></span>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 leading-relaxed whitespace-pre-line">
                  {selectedRequest.description}
                </div>

                {/* Upvote Meter & Action */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-white/60">현재 공감 수강생</div>
                    <div className="text-base font-bold text-amber-400">
                      {selectedRequest.upvoteCount} / {selectedRequest.targetCount}명
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleUpvoteRequest(e, selectedRequest.id)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ThumbsUp className="w-4 h-4 fill-black" />
                    나도 수강 희망 (+1)
                  </button>
                </div>

                {/* Instructor Proposals Section */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      🧑‍🏫 강사 개강 제안서 ({selectedRequest.proposals?.length || 0}건)
                    </h4>
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          onLoginClick();
                          return;
                        }
                        setProposalTargetRequest(selectedRequest);
                        setShowProposalModal(true);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors font-medium cursor-pointer"
                    >
                      + 내가 개강하기
                    </button>
                  </div>

                  {(!selectedRequest.proposals || selectedRequest.proposals.length === 0) ? (
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-white/50">
                      아직 등록된 강사 제안서가 없습니다. <br />
                      전문 강사님이시라면 커리큘럼을 제안해보세요!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedRequest.proposals.map((prop) => (
                        <div
                          key={prop.id}
                          className={`p-4 rounded-xl border transition-all ${
                            prop.status === "채택됨"
                              ? "bg-emerald-950/30 border-emerald-500/50"
                              : "bg-white/5 border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-300 flex items-center justify-center text-xs font-bold">
                                {prop.instructorName.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-white">{prop.instructorName} 강사</span>
                              <span className="text-[10px] text-white/40">{prop.instructorTitle || "전문가"}</span>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                prop.status === "채택됨"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-white/10 text-white/60"
                              }`}
                            >
                              {prop.status}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-white mb-1">{prop.proposedTitle}</div>
                          <div className="flex items-center gap-3 text-[11px] text-white/60 mb-2">
                            <span>수강료: <b className="text-emerald-400">₩{prop.proposedPrice.toLocaleString()}</b></span>
                            <span>•</span>
                            <span>일정: <b className="text-white/80">{prop.proposedSchedule}</b></span>
                          </div>

                          <p className="text-xs text-white/70 italic mb-3">"{prop.message}"</p>

                          {prop.curriculumDraft && prop.curriculumDraft.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-white/70 space-y-1 mb-3">
                              <div className="font-semibold text-white/90 mb-1">제안 커리큘럼:</div>
                              {prop.curriculumDraft.map((c, i) => (
                                <div key={i} className="truncate">• {c}</div>
                              ))}
                            </div>
                          )}

                          {prop.status === "대기중" && (
                            <button
                              onClick={() => handleAcceptProposal(selectedRequest.id, prop.id)}
                              className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                            >
                              ✓ 이 제안 채택하여 강의 개설 확정하기
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* Modals                                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* 강의 생성 마법사 모달 */}
      <CourseCreateEditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        instructorName={userName || "김수강생"}
        onSave={(newCourse) => {
          if (onSaveCourse) {
            onSaveCourse(newCourse);
          }
        }}
      />

      {/* 수강생 개강 요청 모달 */}
      <CourseRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        userName={userName || "김수강생"}
        userId="u-student-1"
        onRequestCreated={(newReq) => {
          setCourseRequests((prev) => [newReq, ...prev]);
        }}
      />

      {/* 강사 개강 제안 모달 */}
      <CourseProposalModal
        request={proposalTargetRequest}
        isOpen={showProposalModal}
        onClose={() => {
          setShowProposalModal(false);
          setProposalTargetRequest(null);
        }}
        instructorName={userName || "김소현"}
        instructorId="ins-1"
        onProposalSubmitted={() => {
          fetchRequests();
        }}
      />
    </div>
  );
}

