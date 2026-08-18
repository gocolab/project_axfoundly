import React from "react";
import {
  BookOpen,
  Play,
  Clock,
  FileText,
  Users,
  Bell,
  Briefcase,
  Send,
  CheckCircle,
  Calendar as CalendarIcon,
  ChevronRight,
  Download,
  CreditCard,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import type { Course, TeamBuildingRequest, PaymentRecord, Notification } from "../types";

interface StudentDashboardProps {
  enrolledCourses: Course[];
  teamRequests: TeamBuildingRequest[];
  payments: PaymentRecord[];
  notifications: Notification[];
  onViewCourse: (id: string) => void;
}

export default function StudentDashboard({
  enrolledCourses,
  teamRequests,
  payments,
  notifications,
  onViewCourse,
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"courses" | "projects" | "notifications">("courses");

  const tabs = [
    { id: "courses" as const, label: "내 강의실 (수강 관리)", icon: <BookOpen size={14} /> },
    { id: "projects" as const, label: "프로젝트 & 팀 빌딩", icon: <Briefcase size={14} /> },
    { id: "notifications" as const, label: "알림 & 강사 메시지함", icon: <Bell size={14} /> },
  ];

  const instructorMessages = notifications.filter((n) => n.type === "instructor_msg" || n.type === "course");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">수강생 대시보드</h1>
        <p className="text-sm text-brand-on-surface-variant mt-1">
          강의 일정, 학습 진도 및 강사 1:1/공지 메시지를 확인하세요
        </p>
      </div>

      {/* Dashboard Tabs */}
      <div className="flex gap-2 mb-6 border-b border-brand-border/30 pb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? "text-brand-primary tab-active font-bold"
                : "text-brand-on-surface-variant hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 1. 내 강의실 ── */}
      {activeTab === "courses" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* 수강 중인 강의 */}
          <section>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Play size={15} className="text-brand-primary" />
              수강 중인 강의 ({enrolledCourses.filter((c) => c.isEnrolled).length}개)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.filter((c) => c.isEnrolled).length === 0 ? (
                <div className="col-span-3 py-12 text-center bg-brand-card rounded-xl border border-brand-border/40">
                  <p className="text-xs text-brand-on-surface-variant">수강 중인 강의가 없습니다</p>
                </div>
              ) : (
                enrolledCourses
                  .filter((c) => c.isEnrolled)
                  .map((course) => {
                    const schedule = course.schedule;
                    return (
                      <div
                        key={course.id}
                        className="bg-brand-card border border-brand-border/60 rounded-xl p-4 card-hover cursor-pointer shadow-md flex flex-col justify-between"
                        onClick={() => onViewCourse(course.id)}
                      >
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-[9px] font-mono text-brand-on-surface-variant">
                                {course.category}
                              </span>
                              <h3 className="text-sm font-bold text-white mt-0.5">{course.title}</h3>
                              <p className="text-[10px] text-brand-on-surface-variant mt-0.5">
                                {course.instructor} 강사
                              </p>
                            </div>
                            <ChevronRight size={14} className="text-brand-on-surface-variant mt-1" />
                          </div>

                          {/* Schedule badge */}
                          <div className="p-2 bg-brand-surface-low rounded-lg border border-brand-border/30 mb-3 text-[10px]">
                            <div className="flex items-center justify-between text-brand-tertiary font-semibold">
                              <span className="flex items-center gap-1">
                                <CalendarIcon size={10} />
                                {schedule?.startDate} ~ {schedule?.endDate}
                              </span>
                              <span>매주 {schedule?.daysOfWeek?.join("·")}</span>
                            </div>
                            <div className="text-brand-on-surface-variant mt-0.5 font-mono">
                              시간: {schedule?.timeSlot}
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: `${course.progress || 0}%` }} />
                          </div>
                          <div className="flex justify-between mt-1.5 mb-3">
                            <span className="text-[10px] text-brand-on-surface-variant">진도율</span>
                            <span className="text-[10px] font-bold text-brand-primary">
                              {course.progress || 0}%
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-brand-border/20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewCourse(course.id);
                            }}
                            className="flex-1 text-[10px] bg-brand-primary-container/15 text-brand-primary py-2 rounded-lg border border-brand-primary/30 hover:bg-brand-primary-container hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1 font-bold"
                          >
                            <Play size={10} /> VOD 재생 & 커리큘럼
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert("학습 자료 및 강의 슬라이드가 다운로드되었습니다.");
                            }}
                            className="text-[10px] bg-brand-surface-low text-brand-on-surface-variant py-2 px-3 rounded-lg border border-brand-border/30 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Download size={10} /> 자료
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </section>

          {/* 수강 내역 / 결제 내역 */}
          <section>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CreditCard size={15} className="text-brand-accent-orange" />
              수강 및 결제 영수증 내역
            </h2>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md">
              <div className="grid grid-cols-5 gap-2 px-5 py-2.5 bg-brand-surface-low border-b border-brand-border/30 text-[10px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
                <span className="col-span-2">강의명</span>
                <span>결제 금액</span>
                <span>결제일</span>
                <span className="text-right">결제 상태</span>
              </div>
              {payments.length === 0 ? (
                <p className="px-5 py-8 text-center text-xs text-brand-on-surface-variant">
                  결제 내역이 없습니다
                </p>
              ) : (
                payments.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-5 gap-2 px-5 py-3 items-center border-b border-brand-border/20 last:border-0 hover:bg-brand-surface-low transition-colors"
                  >
                    <span className="col-span-2 text-xs text-white truncate font-medium">
                      {p.courseTitle}
                    </span>
                    <span className="text-xs text-brand-on-surface-variant">
                      ₩{p.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-brand-on-surface-variant">{p.date}</span>
                    <span
                      className={`text-[10px] font-bold text-right ${
                        p.status === "완료" ? "text-brand-tertiary" : "text-error"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* ── 2. 프로젝트 & 팀 빌딩 ── */}
      {activeTab === "projects" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* 내 프로젝트 */}
          <section>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Briefcase size={15} className="text-brand-primary" />
              내 창업 아이템 & IR 프로젝트
            </h2>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6 shadow-md text-center">
              <div className="w-12 h-12 rounded-full bg-brand-surface-low mx-auto flex items-center justify-center mb-3">
                <Briefcase size={20} className="text-brand-on-surface-variant" />
              </div>
              <p className="text-xs text-brand-on-surface-variant">
                기획 중인 창업 아이템을 등록하고 IR 및 팀 빌딩을 시작하세요
              </p>
              <button
                onClick={() => alert("새 프로젝트 등록 화면으로 이동합니다.")}
                className="mt-3 text-xs bg-brand-primary-container/20 text-brand-primary py-2 px-4 rounded-xl border border-brand-primary/30 hover:bg-brand-primary-container hover:text-white transition-colors cursor-pointer font-bold"
              >
                + 새 프로젝트 등록하기
              </button>
            </div>
          </section>

          {/* 팀 빌딩 현황 */}
          <section>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Users size={15} className="text-brand-tertiary" />
              팀 빌딩 및 합류 제안 현황
            </h2>
            <div className="flex flex-col gap-3">
              {teamRequests.length === 0 ? (
                <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6 text-center">
                  <p className="text-xs text-brand-on-surface-variant">팀 빌딩 제안 내역이 없습니다</p>
                </div>
              ) : (
                teamRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-brand-card border border-brand-border/60 rounded-xl p-4 flex items-center justify-between shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          req.type === "sent" ? "bg-brand-primary-container" : "bg-brand-tertiary/30"
                        }`}
                      >
                        {req.type === "sent" ? <Send size={12} /> : <Users size={12} />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{req.projectName}</p>
                        <p className="text-[10px] text-brand-on-surface-variant">
                          {req.type === "sent" ? `${req.toUser}에게 보냄` : `${req.fromUser}로부터 받음`}
                          {" · "}{req.role} 역할 · {req.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        req.status === "대기중"
                          ? "badge-progress"
                          : req.status === "수락"
                          ? "badge-recruiting"
                          : "badge-closed"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* ── 3. 알림 및 강사 메시지함 ── */}
      {activeTab === "notifications" && (
        <div className="animate-fadeIn flex flex-col gap-5">
          {/* Instructor Direct Messages Banner */}
          <div className="bg-gradient-to-r from-brand-primary-container/20 via-brand-surface-low to-brand-card p-4 rounded-xl border border-brand-primary/30">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <MessageSquare size={15} className="text-brand-primary" />
              강사 메시지 & 1:1 공지함
            </h3>
            <p className="text-[11px] text-brand-on-surface-variant mt-0.5">
              수강 중인 강의의 강사님이 보낸 학습 가이드와 1:1 메시지입니다.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bg-brand-card border border-brand-border/60 rounded-xl p-4 flex items-start gap-3.5 shadow-md ${
                  !n.isRead ? "border-l-4 border-l-brand-primary" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    n.type === "course" || n.type === "instructor_msg"
                      ? "bg-brand-primary-container/20 text-brand-primary"
                      : n.type === "team"
                      ? "bg-brand-tertiary/15 text-brand-tertiary"
                      : n.type === "investor"
                      ? "bg-brand-accent-orange/15 text-brand-accent-orange"
                      : "bg-brand-surface-high text-brand-on-surface-variant"
                  }`}
                >
                  {n.type === "course" || n.type === "instructor_msg" ? (
                    <BookOpen size={16} />
                  ) : n.type === "team" ? (
                    <Users size={16} />
                  ) : n.type === "investor" ? (
                    <FileText size={16} />
                  ) : (
                    <Bell size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">{n.title}</p>
                    <span className="text-[9px] text-brand-on-surface-variant font-mono">{n.time}</span>
                  </div>
                  <p className="text-xs text-brand-on-surface-variant mt-1 leading-relaxed">{n.message}</p>
                  {n.sender && (
                    <p className="text-[10px] text-brand-primary font-semibold mt-1">
                      보낸 사람: {n.sender} {n.courseTitle ? `(${n.courseTitle})` : ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
