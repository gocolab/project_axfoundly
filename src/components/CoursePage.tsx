import React from "react";
import {
  Star,
  Users,
  Clock,
  Calendar as CalendarIcon,
  BookOpen,
  Sparkles,
  Edit,
  Copy,
  X,
} from "lucide-react";
import type { Course } from "../types";
import Pagination from "./common/Pagination";
import SearchBar from "./common/SearchBar";
import HighlightText from "./common/HighlightText";
import { multiMatch } from "../utils/searchUtils";
import { useUrlPagination } from "../hooks/useUrlQueryState";
import CourseCreateEditModal from "./CourseCreateEditModal";
import CourseDetailView from "./course/CourseDetailView";
import { useToast } from "./common/Toast";
import { api } from "../lib/api";

interface CoursePageProps {
  courses: Course[];
  onEnroll: (courseId: string, paymentMethod?: "카카오페이") => void;
  isLoggedIn: boolean;
  userRoles?: import("../types").UserRole[];
  userName?: string;
  onLoginClick: () => void;
  onSaveCourse?: (course: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onDuplicateCourse?: (courseId: string) => Promise<Course | undefined> | void;
  initialCourseId?: string | null;
  onSelectCourse?: (courseId: string) => void;
  onClearSelectedCourse?: () => void;
}

export default function CoursePage({
  courses,
  onEnroll,
  isLoggedIn,
  userRoles = ["member"],
  userName = "게스트",
  onLoginClick,
  onSaveCourse,
  onDeleteCourse,
  onDuplicateCourse,
  initialCourseId,
  onSelectCourse,
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

  const prevInitialCourseIdRef = React.useRef(initialCourseId);
  React.useEffect(() => {
    if (initialCourseId) {
      if (selectedCourse?.id === initialCourseId) {
        return;
      }
      const match = courses.find((c) => c.id === initialCourseId);
      if (match) {
        setSelectedCourse(match);
      } else if (courses.length > 0) {
        toast.error("강의를 찾을 수 없습니다", "존재하지 않거나 삭제된 강의입니다.");
        onClearSelectedCourse?.();
      }
    } else if (prevInitialCourseIdRef.current && !initialCourseId) {
      setSelectedCourse(null);
    }
    prevInitialCourseIdRef.current = initialCourseId;
  }, [initialCourseId, courses, onClearSelectedCourse]);

  const [activeCategory, setActiveCategory] = React.useState<string>("전체");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [deliveryFilter, setDeliveryFilter] = React.useState<"all" | "online" | "offline" | "hybrid">("all");
  const {
    page: currentPage,
    setPage: setCurrentPage,
    query: searchText,
    setQuery: setSearchText,
  } = useUrlPagination({ pageKey: "page", queryKey: "q", defaultPage: 1 });
  const [itemsPerPage, setItemsPerPage] = React.useState(6);

  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<Course | null>(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [isDuplicating, setIsDuplicating] = React.useState<boolean>(false);

  const handleDuplicateCourseItem = async (courseId: string) => {
    if (isDuplicating) return;
    try {
      setIsDuplicating(true);
      if (onDuplicateCourse) {
        const newCourse = await onDuplicateCourse(courseId);
        if (newCourse) {
          setSelectedCourse(newCourse);
          onSelectCourse?.(newCourse.id);
        }
      } else {
        const res = await api.duplicateCourse(courseId);
        if (res.course) {
          if (onSaveCourse) onSaveCourse(res.course);
          setSelectedCourse(res.course);
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

  const dynamicCategories = React.useMemo(() => {
    const defaultCats = ["전체", "AI 모델링", "비즈니스 기획", "마케팅", "개발", "디자인"];
    const catSet = new Set<string>(defaultCats);
    courses.forEach((c) => {
      if (c.category) catSet.add(c.category);
    });
    return Array.from(catSet);
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
    const matchCategory =
      activeCategory === "전체" ||
      c.category === activeCategory ||
      (c.category && c.category.startsWith(activeCategory));
    const matchTag = !activeTag || c.tags?.includes(activeTag);
    const matchDelivery = deliveryFilter === "all" || c.deliveryType === deliveryFilter;
    const matchSearch = multiMatch(
      [c.title, c.description, c.instructor, c.category, ...(c.tags || [])],
      searchText
    );
    return matchCategory && matchTag && matchDelivery && matchSearch;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCourses = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when category or tag or delivery changes
  const isFirstCourseRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstCourseRender.current) {
      isFirstCourseRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [activeCategory, activeTag, deliveryFilter]);

  // ── Course Detail View ──
  if (selectedCourse) {
    return (
      <CourseDetailView
        course={selectedCourse}
        isLoggedIn={isLoggedIn}
        userRoles={userRoles}
        userName={userName}
        onBack={() => {
          setSelectedCourse(null);
          onClearSelectedCourse?.();
        }}
        onEnroll={onEnroll}
        onLoginClick={onLoginClick}
        onSaveCourse={onSaveCourse}
        onDeleteCourse={onDeleteCourse}
        onDuplicateCourse={onDuplicateCourse}
        onCourseUpdated={(updated) => {
          setSelectedCourse(updated);
          if (onSaveCourse) onSaveCourse(updated);
        }}
        onCourseDeleted={(deletedId) => {
          setSelectedCourse(null);
          onClearSelectedCourse?.();
          if (onDeleteCourse) onDeleteCourse(deletedId);
        }}
        onSelectCourse={(newId) => {
          onSelectCourse?.(newId);
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">교육 / 강의</h1>
          <p className="text-sm text-brand-on-surface-variant mt-1">
            실시간 일정 연계 강의 탐색 및 맞춤형 커리큘럼을 지원합니다.
          </p>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-brand-primary/10 self-start sm:self-auto"
          >
            <span className="text-base leading-none">+</span> 강의 개설 마법사
          </button>
        )}
      </div>

      {/* Streamlined Search & Filter Action Bar */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input with Debounce & Shortcut */}
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="강의명, 강사명, 태그 검색..."
            className="flex-1 max-w-md"
            inputClassName="rounded-xl py-2 shadow-inner"
          />

          {/* Right Pagination */}
          <div className="flex items-center gap-3 justify-end shrink-0">
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageSizeChange={setItemsPerPage}
                pageSizeOptions={[6, 12, 24]}
              />
            )}
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-semibold text-brand-on-surface-variant">분야 / 카테고리:</span>
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[11px] px-3 py-1 rounded-xl border transition-all cursor-pointer font-medium ${
                activeCategory === cat
                  ? "bg-brand-primary text-black border-brand-primary font-bold shadow-sm"
                  : "bg-brand-surface-low border-brand-border text-brand-on-surface-variant hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Delivery Type Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-semibold text-brand-on-surface-variant">강의 진행 방식:</span>
          {[
            { id: "all" as const, label: "모든 방식" },
            { id: "online" as const, label: "💻 실시간 온라인" },
            { id: "offline" as const, label: "🏢 현장 오프라인" },
            { id: "hybrid" as const, label: "🔄 온·오프라인 혼합" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDeliveryFilter(item.id)}
              className={`text-[11px] px-3 py-1 rounded-xl border transition-all cursor-pointer font-medium ${
                deliveryFilter === item.id
                  ? "bg-brand-primary text-black border-brand-primary font-bold shadow-sm"
                  : "bg-brand-surface-low border-brand-border text-brand-on-surface-variant hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
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
              const isAuthor = isLoggedIn && (course.instructor === userName || userRoles?.includes("admin"));

              return (
                <div
                  key={course.id}
                  data-testid="course-card"
                  className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden card-hover cursor-pointer group animate-slideUp flex flex-col justify-between shadow-lg"
                  style={{ animationDelay: `${idx * 50}ms` }}
                  onClick={() => {
                    prevInitialCourseIdRef.current = course.id;
                    setSelectedCourse(course);
                    onSelectCourse?.(course.id);
                  }}
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
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-md border ${
                            course.deliveryType === "offline"
                              ? "bg-amber-500/30 border-amber-500/50 text-amber-200"
                              : course.deliveryType === "hybrid"
                              ? "bg-emerald-500/30 border-emerald-500/50 text-emerald-200"
                              : "bg-cyan-500/30 border-cyan-500/50 text-cyan-200"
                          }`}
                        >
                          {course.deliveryType === "offline"
                            ? "🏢 오프라인"
                            : course.deliveryType === "hybrid"
                            ? "🔄 혼합"
                            : "💻 온라인"}
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
                        <HighlightText text={course.title} query={searchText} />
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        <HighlightText text={course.description} query={searchText} />
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

                      {course.location && (
                        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-1.5">
                          <span>🏢</span>
                          <span className="truncate">{course.location}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2.5 mt-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                            {course.instructor.charAt(0)}
                          </div>
                          <span className="text-xs text-slate-300 font-medium">
                            <HighlightText text={course.instructor} query={searchText} /> 강사
                          </span>
                        </div>
                        {isAuthor && (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleDuplicateCourseItem(course.id)}
                              disabled={isDuplicating}
                              className="px-2 py-1 text-xs rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-semibold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                              title="기존 강의 복사 등록"
                            >
                              <Copy size={11} />
                              복사
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCourse(course);
                                setShowEditModal(true);
                              }}
                              className="px-2.5 py-1 text-xs rounded-lg bg-brand-primary-container/20 hover:bg-brand-primary-container/40 text-brand-primary border border-brand-primary/40 font-semibold transition-colors cursor-pointer"
                            >
                              수정
                            </button>
                          </div>
                        )}
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
          setShowCreateModal(false);
        }}
      />

      {/* 강의 수정 모달 */}
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
            if (selectedCourse?.id === updatedCourse.id) {
              setSelectedCourse(updatedCourse);
            }
            setShowEditModal(false);
            setEditingCourse(null);
            toast.success("강의 수정 완료", "강의 정보 및 커리큘럼 일정이 성공적으로 업데이트되었습니다.");
          }}
        />
      )}
    </div>
  );
}

