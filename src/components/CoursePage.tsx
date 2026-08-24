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
} from "lucide-react";
import type { Course, InstructorProfile, Review } from "../types";
import Pagination from "./common/Pagination";

interface CoursePageProps {
  courses: Course[];
  onEnroll: (courseId: string, paymentMethod?: "카드" | "계좌이체" | "카카오페이") => void;
  isLoggedIn: boolean;
  userRole?: import("../types").UserRole;
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
  userName,
  onLoginClick,
  onSaveCourse,
  initialCourseId,
  onClearSelectedCourse,
}: CoursePageProps) {
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(() => {
    if (initialCourseId) {
      return courses.find((c) => c.id === initialCourseId) || null;
    }
    return null;
  });

  React.useEffect(() => {
    if (initialCourseId) {
      const match = courses.find((c) => c.id === initialCourseId);
      if (match) {
        setSelectedCourse(match);
      }
    }
  }, [initialCourseId, courses]);
  const [activeCategory, setActiveCategory] = React.useState<string>("전체");
  const [searchText, setSearchText] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"카드" | "카카오페이">("카카오페이");
  const [showInstructorModal, setShowInstructorModal] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(new Date(2025, 8, 1)); // Sep 2025

  const categories = ["전체", "AI 모델링", "비즈니스 기획", "마케팅", "개발", "디자인"];

  // Filtered courses
  const filtered = courses.filter((c) => {
    const matchCategory = activeCategory === "전체" || c.category === activeCategory;
    const matchSearch =
      c.title.toLowerCase().includes(searchText.toLowerCase()) ||
      c.description.toLowerCase().includes(searchText.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchText.toLowerCase());
    return matchCategory && matchSearch;
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
  }, [activeCategory, searchText]);

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

  // ── Course List View ──
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">교육 / 강의</h1>
        <p className="text-sm text-brand-on-surface-variant mt-1">
          실시간 일정 연계와 AI 창업 실전 커리큘럼을 만나보세요
        </p>
      </div>

      {/* Filter & Search Bar — with Pagination on right */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Row 1: 카테고리 필터 + 생성 버튼 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-brand-primary-container/20 border-brand-primary-container/40 text-brand-primary font-bold shadow-sm"
                    : "border-brand-border text-brand-on-surface-variant hover:text-white hover:border-brand-surface-highest"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* 강의 생성 버튼 — 로그인 회원 누구나 */}
          {isLoggedIn && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="text-base leading-none">+</span> 강의 생성
            </button>
          )}
        </div>
        {/* Row 2: 검색창 + Pagination */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
            <input
              type="text"
              placeholder="강의명, 강사명 검색..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors w-full"
            />
          </div>
          {/* Pagination — 검색창 우측 */}
          {totalPages > 1 && (
            <div className="ml-auto">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Course Grid */}
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
                {/* Thumbnail Header — 첨부 이미지 스타일의 바이올렛/인디고 헤더 & 배지 */}
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

                  {/* Schedule Details Badge */}
                  <div className="mt-3.5 p-3 bg-[#0b1329]/90 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">일정: 매주 {schedule.daysOfWeek.join("·")}</span>
                    <span className="text-white font-mono font-bold tracking-wider">{schedule.timeSlot}</span>
                  </div>

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

              {/* Price & Rating Footer */}
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

      {/* 강의 생성 모달 — placeholder (실제 InstructorDashboard 모달 재사용) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white mb-3">강의 개설/수정</h3>
            <p className="text-xs text-brand-on-surface-variant mb-4">
              강의 생성은 강사 대시보드에서 AI 초벌 생성기와 함께 진행할 수 있습니다.
              마이페이지 → 강의 관리 메뉴를 이용해 주세요.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
