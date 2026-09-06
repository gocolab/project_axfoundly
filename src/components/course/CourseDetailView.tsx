import React from "react";
import {
  Star,
  Users,
  Clock,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  MessageSquare,
  X,
  ExternalLink,
  ShieldCheck,
  Edit,
  Trash2,
  RotateCcw,
  Share2,
  Copy,
} from "lucide-react";
import type { Course, UserRole } from "../../types";
import { shareContent } from "../../utils/shareUtils";
import CourseCreateEditModal from "../CourseCreateEditModal";
import { useToast } from "../common/Toast";
import { api } from "../../lib/api";

export interface CourseDetailViewProps {
  course: Course;
  isLoggedIn: boolean;
  userRoles?: UserRole[];
  userName?: string;
  onBack: () => void;
  onEnroll: (courseId: string, paymentMethod?: "카카오페이") => void;
  onLoginClick: () => void;
  onSaveCourse?: (course: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onDuplicateCourse?: (courseId: string) => Promise<Course | undefined> | void;
  onCourseUpdated?: (course: Course) => void;
  onCourseDeleted?: (courseId: string) => void;
  onSelectCourse?: (courseId: string) => void;
}

export default function CourseDetailView({
  course: initialCourse,
  isLoggedIn,
  userRoles = ["member"],
  userName = "게스트",
  onBack,
  onEnroll,
  onLoginClick,
  onSaveCourse,
  onDeleteCourse,
  onDuplicateCourse,
  onCourseUpdated,
  onCourseDeleted,
  onSelectCourse,
}: CourseDetailViewProps) {
  const toast = useToast();
  const [course, setCourse] = React.useState<Course>(initialCourse);

  // Synchronize when initialCourse prop changes
  React.useEffect(() => {
    setCourse(initialCourse);
  }, [initialCourse]);

  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [showInstructorModal, setShowInstructorModal] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<Course | null>(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(new Date(2025, 8, 1)); // Sep 2025

  // Star Rating & Review State
  const [reviewRating, setReviewRating] = React.useState<number>(5);
  const [reviewHoverRating, setReviewHoverRating] = React.useState<number>(0);
  const [reviewContent, setReviewContent] = React.useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = React.useState<boolean>(false);
  const [isDuplicating, setIsDuplicating] = React.useState<boolean>(false);

  const schedule = course.schedule;
  const instructorProfile = course.instructorProfile;
  const isCourseClosed =
    course.status === "종료" ||
    course.status === "마감" ||
    (course.status !== "모집중" &&
      Boolean(schedule?.startDate) &&
      new Date(schedule.startDate).getTime() < new Date().setHours(0, 0, 0, 0));

  // Calendar generation helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  // Build session dates map for calendar
  const sessionDatesMap: Record<string, { week: number; title: string; time: string; sessionNumber?: number }> = {};
  course.curriculum.forEach((curr, idx) => {
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

  const handleDeleteCourseItem = async (courseId: string) => {
    const confirmed = await toast.confirm({
      title: "강의 삭제 확인",
      message: "정말 이 강의를 삭제하시겠습니까?\n삭제된 강의는 복구할 수 없습니다.",
      confirmText: "삭제",
      cancelText: "취소",
      type: "danger",
    });
    if (!confirmed) return;
    try {
      if (onDeleteCourse) {
        onDeleteCourse(courseId);
      } else {
        await api.deleteCourse(courseId);
        toast.success("강의 삭제", "강의가 성공적으로 삭제되었습니다.");
      }
      onCourseDeleted?.(courseId);
      onBack();
    } catch (err) {
      console.error("Delete course failed:", err);
      toast.error("강의 삭제 실패", "강의를 삭제하는 중 오류가 발생했습니다.");
    }
  };

  const handleDuplicateCourseItem = async (courseId: string) => {
    if (isDuplicating) return;
    try {
      setIsDuplicating(true);
      if (onDuplicateCourse) {
        const newCourse = await onDuplicateCourse(courseId);
        if (newCourse) {
          setCourse(newCourse);
          onCourseUpdated?.(newCourse);
          onSelectCourse?.(newCourse.id);
        }
      } else {
        const res = await api.duplicateCourse(courseId);
        if (res.course) {
          if (onSaveCourse) onSaveCourse(res.course);
          setCourse(res.course);
          onCourseUpdated?.(res.course);
          onSelectCourse?.(res.course.id);
          toast.success("강의 복제 완료", `'${res.course.title}' 강의가 성공적으로 등록되었습니다.`);
        }
      }
    } catch (err: any) {
      console.error("Duplicate course failed:", err);
      toast.error("강의 복제 실패", err?.message || "강의를 복제하는 중 오류가 발생했습니다.");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleCancelEnrollment = async (courseId: string) => {
    const confirmed = await toast.confirm({
      title: "수강 취소 및 환불 확인",
      message: "정말 이 강의의 수강을 취소하시겠습니까?\n취소 시 결제된 금액은 전액 환불 처리됩니다.",
      confirmText: "수강 취소",
      cancelText: "유지",
      type: "danger",
    });
    if (!confirmed) return;
    try {
      const res = await api.cancelCourseEnrollment(courseId, userName);
      if (res?.course) {
        setCourse(res.course);
        onCourseUpdated?.(res.course);
        if (onSaveCourse) {
          onSaveCourse(res.course);
        }
        toast.success("수강 취소 완료", `'${res.course.title}' 수강 취소 및 환불 처리가 완료되었습니다.`);
      }
    } catch (err) {
      console.error("Cancel enrollment failed:", err);
      toast.error("수강 취소 실패", "수강 취소 중 오류가 발생했습니다.");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("로그인 필요", "수강 후기를 작성하려면 먼저 로그인해주세요.");
      onLoginClick();
      return;
    }
    if (!reviewContent.trim()) {
      toast.error("내용 입력", "후기 내용을 입력해주세요.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await api.addCourseReview(course.id, {
        author: userName || "수강생",
        rating: reviewRating,
        content: reviewContent.trim(),
      });

      if (res.review) {
        const nextReviews = [res.review, ...(course.reviews || [])];
        const nextRating = parseFloat(
          (nextReviews.reduce((sum, r) => sum + r.rating, 0) / nextReviews.length).toFixed(1)
        );
        const updated: Course = {
          ...course,
          reviews: nextReviews,
          reviewCount: nextReviews.length,
          rating: nextRating,
        };
        setCourse(updated);
        onCourseUpdated?.(updated);
        if (onSaveCourse) {
          onSaveCourse(updated);
        }
        setReviewContent("");
        setReviewRating(5);
        toast.success("후기 등록 완료", "수강 후기와 별점이 성공적으로 등록되었습니다.");
      }
    } catch (err) {
      console.error("Submit review error:", err);
      toast.error("후기 등록 실패", "후기 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
      {/* Back Button & Author Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            setShowInstructorModal(false);
            onBack();
          }}
          className="flex items-center gap-1.5 text-sm text-brand-on-surface-variant hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} />
          강의 목록으로
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              shareContent({
                title: `${course.title} | AI로 창업하라`,
                text: `${course.aiSummary || course.description} (강사: ${course.instructor})`,
                url: `${window.location.origin}/courses/${course.id}`,
                onSuccess: () => toast.success("공유 링크 복사", "강의 상세 링크가 클립보드에 복사되었습니다."),
                onError: () => toast.error("복사 실패", "링크 복사 중 오류가 발생했습니다."),
              });
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 transition-all shadow-sm cursor-pointer"
            title="강의 상세 링크 공유"
          >
            <Share2 size={13} className="text-brand-primary" />
            <span>공유하기</span>
          </button>

          {isLoggedIn && (course.instructor === userName || userRoles?.includes("admin")) && (
            <>
              <button
                onClick={() => handleDuplicateCourseItem(course.id)}
                disabled={isDuplicating}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/30 transition-all shadow-md cursor-pointer disabled:opacity-50"
                title="기존 강의 설정을 복사하여 새 기수 강의를 즉시 등록합니다"
              >
                <Copy size={13} />
                <span>{isDuplicating ? "복사 중..." : "강의 복사"}</span>
              </button>
              <button
                onClick={() => {
                  setEditingCourse(course);
                  setShowEditModal(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary hover:opacity-90 text-white transition-all shadow-md cursor-pointer"
              >
                <Edit size={13} />
                강의 수정
              </button>
              <button
                onClick={() => handleDeleteCourseItem(course.id)}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all shadow-md cursor-pointer"
              >
                <Trash2 size={13} />
                강의 삭제
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Course Main Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Header Card — 일관된 바이올렛/인디고 썸네일 헤더 */}
          <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="h-24 sm:h-28 relative overflow-hidden bg-gradient-to-r from-[#2e1065] via-[#4338ca] to-[#3b0764] flex items-center justify-center">
              <span className="text-4xl opacity-50 drop-shadow-md select-none">🎓</span>
              <div className="absolute top-3.5 left-4 flex gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md border ${
                  course.status === "모집중"
                    ? "bg-[#4f46e5]/30 border-[#6366f1]/60 text-[#a5b4fc]"
                    : course.status === "진행중"
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : "bg-slate-700/40 border-slate-600/50 text-slate-300"
                }`}>
                  {course.status}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md border ${
                  course.deliveryType === "offline"
                    ? "bg-amber-500/30 border-amber-500/50 text-amber-200"
                    : course.deliveryType === "hybrid"
                    ? "bg-emerald-500/30 border-emerald-500/50 text-emerald-200"
                    : "bg-cyan-500/30 border-cyan-500/50 text-cyan-200"
                }`}>
                  {course.deliveryType === "offline"
                    ? "🏢 현장 오프라인"
                    : course.deliveryType === "hybrid"
                    ? "🔄 온·오프라인 혼합"
                    : "💻 실시간 온라인"}
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-brand-primary px-2.5 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
                  {course.category}
                </span>
                <span className="text-xs font-semibold text-[#34d399] flex items-center gap-1.5">
                  <CalendarIcon size={14} className="text-[#34d399]" />
                  {schedule.startDate} ~ {schedule.endDate}
                </span>
                {course.location && (
                  <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                    🏢 {course.location}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2.5 leading-tight">
                {course.title}
              </h1>
              <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                {course.description}
              </p>

              {/* AI 자동 추출 태그 목록 */}
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {course.tags.map((tag, tIdx) => (
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
                  <span className="text-[10px] text-slate-400 block font-mono">진행 방식</span>
                  <span className="text-xs font-semibold text-brand-primary">
                    {course.deliveryType === "offline"
                      ? "현장 오프라인"
                      : course.deliveryType === "hybrid"
                      ? "온·오프라인 혼합"
                      : "실시간 온라인"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">강의 일정 / 시간</span>
                  <span className="text-xs font-semibold text-white">매주 {schedule.daysOfWeek.join("·")} ({schedule.timeSlot})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">총 회차</span>
                  <span className="text-xs font-semibold text-brand-tertiary">{schedule.totalSessions}회차 완강</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">평균 평점</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-white">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    {course.rating} ({course.reviewCount})
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
                    {course.instructor.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white group-hover:text-brand-primary transition-colors">
                        {course.instructor}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-primary-container/20 text-brand-primary font-semibold">
                        강사 정보 보기 →
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {course.instructorTitle || "AI 및 스타트업 전문 디렉터"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Users size={14} className="text-[#34d399]" />
                  <span className="font-medium">{course.studentCount}명 수강중</span>
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
                총 {course.curriculum.length}개 세션
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {course.curriculum.map((item, idx) => (
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
                {!course.isEnrolled && (
                  isCourseClosed ? (
                    <button
                      type="button"
                      disabled
                      className="text-xs bg-slate-800 text-slate-500 font-bold py-1.5 px-3 rounded-lg border border-slate-700 cursor-not-allowed whitespace-nowrap"
                      title="모집이 마감되었습니다."
                    >
                      모집 마감
                    </button>
                  ) : (
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
                  )
                )}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-brand-primary" />
                수강 후기 ({course.reviews.length})
              </h2>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-white">{course.rating}</span>
              </div>
            </div>

            {/* Review Write Form with Star Rating */}
            {isLoggedIn ? (
              course.isEnrolled || userRoles?.includes("admin") ? (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-[#0b1329]/90 rounded-xl border border-slate-700/60 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">후기 작성 & 별점 평가</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = (reviewHoverRating || reviewRating) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setReviewHoverRating(star)}
                              onMouseLeave={() => setReviewHoverRating(0)}
                              className="p-0.5 text-slate-600 hover:scale-110 transition-transform cursor-pointer"
                              title={`${star}점`}
                            >
                              <Star
                                size={18}
                                className={isFilled ? "text-amber-400 fill-amber-400" : "text-slate-600"}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs font-bold text-amber-400 w-8 text-right">
                        {reviewHoverRating || reviewRating}점
                      </span>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="강의에 대한 솔직한 후기를 남겨주세요. (강의 내용, 실습 도움도 등)"
                    className="w-full text-xs bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary resize-none"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !reviewContent.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-brand-primary to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmittingReview ? "등록 중..." : "후기 및 별점 등록"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <p className="text-xs text-slate-400">
                    💡 수강 신청을 완료하시면 별점과 수강 후기를 직접 작성하실 수 있습니다.
                  </p>
                </div>
              )
            ) : (
              <div className="mb-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  수강생 후기 작성을 위해 로그인이 필요합니다.
                </p>
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-xs text-brand-primary hover:underline font-semibold"
                >
                  로그인하기
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {course.reviews.map((review) => (
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
                {course.discountedPrice ? (
                  <>
                    <span className="text-xs text-slate-500 line-through">
                      ₩{course.price.toLocaleString()}
                    </span>
                    <p className="text-3xl font-bold text-[#34d399] font-display mt-1">
                      ₩{course.discountedPrice.toLocaleString()}
                    </p>
                    <span className="text-xs text-rose-400 font-bold">
                      {Math.round((1 - course.discountedPrice / course.price) * 100)}% 특가 할인
                    </span>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-[#34d399] font-display">
                    ₩{course.price.toLocaleString()}
                  </p>
                )}
              </div>

              {isLoggedIn && course.isEnrolled ? (
                <div className="flex flex-col items-center gap-2 p-3 bg-[#0b1329] rounded-xl border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-[#34d399]">
                    <CheckCircle size={18} />
                    <span className="text-sm font-bold">수강 신청 완료</span>
                  </div>

                  <div className="w-full progress-bar mt-2">
                    <div className="progress-bar-fill" style={{ width: `${course.progress || 0}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    학습 진도율 {course.progress || 0}%
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCancelEnrollment(course.id)}
                    className="mt-2 w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={12} /> 수강 취소 / 환불 신청
                  </button>
                </div>
              ) : isCourseClosed ? (
                <button
                  type="button"
                  disabled
                  className="w-full bg-slate-800 text-slate-500 font-bold py-3.5 rounded-xl border border-slate-700 cursor-not-allowed text-sm flex items-center justify-center gap-2"
                >
                  <CreditCard size={16} />
                  모집 마감
                </button>
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
                  <span className="text-brand-tertiary font-semibold">{course.studentCount}명 수강중</span>
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
                  {course.instructor.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1">
                    {course.instructor}
                    <ExternalLink size={11} className="text-slate-400" />
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {instructorProfile?.title || course.instructorTitle || "AI 스타트업 디렉터"}
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
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    {course.instructor}
                    <span className="text-xs px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-semibold">
                      대표 강사
                    </span>
                  </h3>
                  <p className="text-xs text-brand-on-surface-variant mt-0.5">
                    {instructorProfile?.title || course.instructorTitle || "AI 및 스타트업 전문 디렉터"}
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
                  `${course.instructor} 강사는 다년간의 실무 AI 프로덕트 런칭 및 스타트업 인큐베이팅 경험을 바탕으로, 수강생들이 실제 시장에서 작동하는 비즈니스를 만들 수 있도록 핵심 실전 가이드를 제공합니다.`}
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
                  { id: "c1", title: course.title, category: course.category, period: "2025.09~", studentCount: course.studentCount, rating: course.rating, status: course.status },
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
                수강생 전체 리뷰 모음 ({course.reviews.length + 2}건)
              </h4>
              <div className="flex flex-col gap-2.5">
                {[
                  ...course.reviews,
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
              <p className="text-sm font-bold text-white">{course.title}</p>
              <p className="text-xs text-brand-on-surface-variant mt-1">
                {course.instructor} · {course.category}
              </p>
              <div className="mt-2 pt-2 border-t border-brand-border/20 text-[11px] text-brand-on-surface-variant">
                일정: {schedule.startDate} ~ {schedule.endDate} ({schedule.daysOfWeek.join(",")})
              </div>
              <p className="text-lg font-bold text-brand-tertiary mt-2">
                ₩{(course.discountedPrice || course.price).toLocaleString()}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-xs text-brand-on-surface-variant mb-2">결제 수단</p>
              <div className="p-3 rounded-xl border border-[#FEE500]/50 bg-[#FEE500]/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#FEE500] text-black font-extrabold text-xs flex items-center justify-center shadow-sm">
                    카톡
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">카카오페이 (단일 결제수단)</p>
                    <p className="text-[10px] text-slate-400">카카오 간편결제로 안전하게 결제됩니다</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEE500] text-black">선택됨</span>
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
                onClick={async () => {
                  const cId = course.id;
                  setCourse((prev) => ({ ...prev, isEnrolled: true, progress: 0 }));
                  setShowPaymentModal(false);
                  await onEnroll(cId, "카카오페이");
                }}
                className="flex-1 bg-[#FEE500] hover:bg-[#ebd300] text-black font-bold py-2.5 rounded-xl transition-all cursor-pointer text-sm shadow-md"
              >
                카카오페이로 결제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 강의 수정 모달 (상세 화면) */}
      {showEditModal && editingCourse && (
        <CourseCreateEditModal
          isOpen={showEditModal}
          initialCourse={editingCourse}
          onClose={() => {
            setShowEditModal(false);
            setEditingCourse(null);
          }}
          instructorName={editingCourse.instructor || userName || "김수강생"}
          onSave={(updatedCourse) => {
            if (onSaveCourse) {
              onSaveCourse(updatedCourse);
            }
            setCourse(updatedCourse);
            onCourseUpdated?.(updatedCourse);
            setShowEditModal(false);
            setEditingCourse(null);
            toast.success("강의 수정 완료", "강의 정보 및 커리큘럼 일정이 성공적으로 업데이트되었습니다.");
          }}
        />
      )}
    </div>
  );
}
