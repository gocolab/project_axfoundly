import React from "react";
import {
  Star,
  Users,
  Clock,
  ArrowLeft,
  Play,
  CheckCircle,
  Filter,
  Search,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import type { Course } from "../types";

interface CoursePageProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export default function CoursePage({ courses, onEnroll, isLoggedIn, onLoginClick }: CoursePageProps) {
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string>("전체");
  const [searchText, setSearchText] = React.useState("");
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);

  const categories = ["전체", "AI 모델링", "비즈니스 기획", "마케팅", "개발", "디자인"];

  const filtered = courses.filter((c) => {
    const matchCategory = activeCategory === "전체" || c.category === activeCategory;
    const matchSearch = c.title.toLowerCase().includes(searchText.toLowerCase()) ||
      c.description.toLowerCase().includes(searchText.toLowerCase());
    return matchCategory && matchSearch;
  });

  // ── Course Detail View ──
  if (selectedCourse) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-1.5 text-sm text-brand-on-surface-variant hover:text-white mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} />
          강의 목록으로
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Course info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">
              <div className="h-48 sm:h-56 bg-gradient-to-br from-indigo-700 to-purple-900 flex items-center justify-center relative">
                <Play size={48} className="text-white/30" />
                <span className="absolute top-4 left-4 badge-recruiting text-xs font-bold px-2 py-0.5 rounded">{selectedCourse.status}</span>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-mono text-brand-on-surface-variant">{selectedCourse.category}</span>
                <h1 className="font-display text-2xl font-bold text-white mt-1">{selectedCourse.title}</h1>
                <p className="text-sm text-brand-on-surface-variant mt-2 leading-relaxed">{selectedCourse.description}</p>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-brand-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary-container to-brand-tertiary flex items-center justify-center text-white text-xs font-bold">
                      {selectedCourse.instructor.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{selectedCourse.instructor}</p>
                      <p className="text-[10px] text-brand-on-surface-variant">강사</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="star-filled" />
                    <span className="text-sm font-bold text-white">{selectedCourse.rating}</span>
                    <span className="text-xs text-brand-on-surface-variant">({selectedCourse.reviewCount}개 리뷰)</span>
                  </div>
                  <div className="flex items-center gap-1 text-brand-on-surface-variant">
                    <Users size={14} />
                    <span className="text-xs">{selectedCourse.studentCount}명 수강중</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Curriculum */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-white mb-4">커리큘럼</h2>
              <div className="flex flex-col gap-3">
                {selectedCourse.curriculum.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-brand-surface-low rounded-lg border border-brand-border/30"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-primary-container/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-brand-primary">{item.week}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-white">{item.title}</h3>
                      <p className="text-[10px] text-brand-on-surface-variant mt-0.5">{item.description}</p>
                    </div>
                    <span className="text-[10px] text-brand-on-surface-variant flex items-center gap-1 flex-shrink-0">
                      <Clock size={10} /> {item.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-white mb-4">수강 후기</h2>
              <div className="flex flex-col gap-3">
                {selectedCourse.reviews.map((review) => (
                  <div key={review.id} className="p-3 bg-brand-surface-low rounded-lg border border-brand-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-brand-surface-high flex items-center justify-center text-[10px] font-bold text-brand-primary">
                        {review.author.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-white">{review.author}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className={i < review.rating ? "star-filled" : "star-empty"} fill={i < review.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="text-[10px] text-brand-on-surface-variant ml-auto">{review.date}</span>
                    </div>
                    <p className="text-[11px] text-brand-on-surface-variant leading-relaxed">{review.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Enrollment card */}
          <div className="lg:col-span-1">
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 sticky top-20">
              <div className="text-center mb-4">
                {selectedCourse.discountedPrice ? (
                  <>
                    <span className="text-sm text-brand-on-surface-variant line-through">₩{selectedCourse.price.toLocaleString()}</span>
                    <p className="text-3xl font-bold text-white font-display mt-1">₩{selectedCourse.discountedPrice.toLocaleString()}</p>
                    <span className="text-xs text-brand-accent-rose font-bold">
                      {Math.round((1 - selectedCourse.discountedPrice / selectedCourse.price) * 100)}% 할인
                    </span>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-white font-display">₩{selectedCourse.price.toLocaleString()}</p>
                )}
              </div>

              {selectedCourse.isEnrolled ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-brand-tertiary">
                    <CheckCircle size={18} />
                    <span className="text-sm font-bold">수강 중</span>
                  </div>
                  <div className="w-full progress-bar mt-2">
                    <div className="progress-bar-fill" style={{ width: `${selectedCourse.progress || 0}%` }} />
                  </div>
                  <span className="text-[10px] text-brand-on-surface-variant">진도율 {selectedCourse.progress || 0}%</span>
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
                  className="w-full bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm flex items-center justify-center gap-2"
                >
                  <CreditCard size={16} />
                  수강 신청
                </button>
              )}

              <div className="mt-5 pt-4 border-t border-brand-border/30 flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-brand-on-surface-variant">수강생 수</span>
                  <span className="text-white font-semibold">{selectedCourse.studentCount}명</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-brand-on-surface-variant">전체 주차</span>
                  <span className="text-white font-semibold">{selectedCourse.curriculum.length}주</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-brand-on-surface-variant">카테고리</span>
                  <span className="text-white font-semibold">{selectedCourse.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="glass-panel-heavy rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-display text-lg font-bold text-white mb-2">수강 신청 확인</h3>
              <p className="text-xs text-brand-on-surface-variant mb-4">아래 강의를 결제하시겠습니까?</p>

              <div className="bg-brand-surface-low rounded-xl p-4 border border-brand-border/30 mb-4">
                <p className="text-sm font-bold text-white">{selectedCourse.title}</p>
                <p className="text-xs text-brand-on-surface-variant mt-1">{selectedCourse.instructor} · {selectedCourse.category}</p>
                <p className="text-lg font-bold text-brand-tertiary mt-2">
                  ₩{(selectedCourse.discountedPrice || selectedCourse.price).toLocaleString()}
                </p>
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
                    onEnroll(selectedCourse.id);
                    setShowPaymentModal(false);
                    setSelectedCourse({ ...selectedCourse, isEnrolled: true, progress: 0 });
                  }}
                  className="flex-1 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm"
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
        <p className="text-sm text-brand-on-surface-variant mt-1">카테고리별로 원하는 강의를 찾아보세요</p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-brand-primary-container/20 border-brand-primary-container/40 text-brand-primary font-bold"
                  : "border-brand-border text-brand-on-surface-variant hover:text-white hover:border-brand-surface-highest"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
          <input
            type="text"
            placeholder="강의 검색..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors w-full sm:w-56"
          />
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((course, idx) => (
          <div
            key={course.id}
            className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden card-hover cursor-pointer group animate-slideUp"
            style={{ animationDelay: `${idx * 60}ms` }}
            onClick={() => setSelectedCourse(course)}
          >
            <div className="h-36 relative overflow-hidden">
              <div className={`w-full h-full bg-gradient-to-br ${
                idx % 4 === 0 ? "from-indigo-700 to-purple-900" :
                idx % 4 === 1 ? "from-teal-700 to-emerald-900" :
                idx % 4 === 2 ? "from-rose-700 to-orange-900" :
                "from-sky-700 to-blue-900"
              } flex items-center justify-center`}>
                <span className="text-4xl opacity-30">🎓</span>
              </div>
              <div className="absolute top-3 left-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  course.status === "모집중" ? "badge-recruiting" :
                  course.status === "진행중" ? "badge-progress" : "badge-closed"
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

              <div className="flex items-center gap-2 mt-3">
                <div className="w-5 h-5 rounded-full bg-brand-surface-high flex items-center justify-center text-[9px] font-bold text-brand-primary">
                  {course.instructor.charAt(0)}
                </div>
                <span className="text-[10px] text-brand-on-surface-variant">{course.instructor}</span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border/30">
                <div className="flex items-center gap-1">
                  <Star size={12} className="star-filled" fill="currentColor" />
                  <span className="text-[11px] text-white font-semibold">{course.rating}</span>
                  <span className="text-[10px] text-brand-on-surface-variant">({course.reviewCount})</span>
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

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-brand-on-surface-variant text-sm">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}
