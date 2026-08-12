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
  XCircle,
  ChevronRight,
  Download,
  CreditCard,
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
    { id: "courses" as const, label: "내 강의실", icon: <BookOpen size={14} /> },
    { id: "projects" as const, label: "프로젝트 & 팀 빌딩", icon: <Briefcase size={14} /> },
    { id: "notifications" as const, label: "알림 센터", icon: <Bell size={14} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">수강생 대시보드</h1>
        <p className="text-sm text-brand-on-surface-variant mt-1">내 학습 현황과 프로젝트를 관리하세요</p>
      </div>

      {/* Dashboard Tabs */}
      <div className="flex gap-2 mb-6 border-b border-brand-border/30 pb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? "text-brand-primary tab-active"
                : "text-brand-on-surface-variant hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 내 강의실 ── */}
      {activeTab === "courses" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* 수강 중인 강의 */}
          <section>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Play size={14} className="text-brand-primary" />
              수강 중인 강의
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.filter((c) => c.isEnrolled).length === 0 ? (
                <p className="text-xs text-brand-on-surface-variant col-span-3 py-8 text-center">수강 중인 강의가 없습니다</p>
              ) : (
                enrolledCourses.filter((c) => c.isEnrolled).map((course) => (
                  <div
                    key={course.id}
                    className="bg-brand-card border border-brand-border/60 rounded-xl p-4 card-hover cursor-pointer"
                    onClick={() => onViewCourse(course.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[9px] font-mono text-brand-on-surface-variant">{course.category}</span>
                        <h3 className="text-sm font-bold text-white mt-0.5">{course.title}</h3>
                        <p className="text-[10px] text-brand-on-surface-variant mt-1">{course.instructor}</p>
                      </div>
                      <ChevronRight size={14} className="text-brand-on-surface-variant mt-1" />
                    </div>

                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${course.progress || 0}%` }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] text-brand-on-surface-variant">진도율</span>
                      <span className="text-[10px] font-bold text-brand-primary">{course.progress || 0}%</span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 text-[10px] bg-brand-primary-container/15 text-brand-primary py-1.5 rounded-lg border border-brand-primary-container/25 hover:bg-brand-primary-container/25 transition-colors cursor-pointer flex items-center justify-center gap-1">
                        <Play size={10} /> VOD 재생
                      </button>
                      <button className="text-[10px] bg-brand-surface-low text-brand-on-surface-variant py-1.5 px-3 rounded-lg border border-brand-border/30 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                        <Download size={10} /> 자료
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 수강 내역 / 결제 내역 */}
          <section>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CreditCard size={14} className="text-brand-accent-orange" />
              수강/결제 내역
            </h2>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">
              <div className="grid grid-cols-5 gap-2 px-5 py-2 bg-brand-surface-low border-b border-brand-border/30 text-[10px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
                <span className="col-span-2">강의명</span>
                <span>결제 금액</span>
                <span>결제일</span>
                <span className="text-right">상태</span>
              </div>
              {payments.length === 0 ? (
                <p className="px-5 py-8 text-center text-xs text-brand-on-surface-variant">결제 내역이 없습니다</p>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="grid grid-cols-5 gap-2 px-5 py-3 items-center border-b border-brand-border/20 last:border-0 hover:bg-brand-surface-low transition-colors">
                    <span className="col-span-2 text-xs text-white truncate">{p.courseTitle}</span>
                    <span className="text-xs text-brand-on-surface-variant">₩{p.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-brand-on-surface-variant">{p.date}</span>
                    <span className={`text-[10px] font-bold text-right ${p.status === "완료" ? "text-brand-tertiary" : "text-error"}`}>
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* ── 프로젝트 & 팀 빌딩 ── */}
      {activeTab === "projects" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* 내 프로젝트 */}
          <section>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Briefcase size={14} className="text-brand-primary" />
              내 프로젝트
            </h2>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5">
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-brand-surface-low mx-auto flex items-center justify-center mb-3">
                  <Briefcase size={20} className="text-brand-on-surface-variant" />
                </div>
                <p className="text-xs text-brand-on-surface-variant">아직 등록된 창업 프로젝트가 없습니다</p>
                <button className="mt-3 text-xs bg-brand-primary-container/15 text-brand-primary py-2 px-4 rounded-lg border border-brand-primary-container/25 hover:bg-brand-primary-container/25 transition-colors cursor-pointer">
                  + 새 프로젝트 등록
                </button>
              </div>
            </div>
          </section>

          {/* 팀 빌딩 현황 */}
          <section>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Users size={14} className="text-brand-tertiary" />
              팀 빌딩 현황
            </h2>
            <div className="flex flex-col gap-3">
              {teamRequests.length === 0 ? (
                <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center">
                  <p className="text-xs text-brand-on-surface-variant">팀 빌딩 제안 내역이 없습니다</p>
                </div>
              ) : (
                teamRequests.map((req) => (
                  <div key={req.id} className="bg-brand-card border border-brand-border/60 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        req.type === "sent" ? "bg-brand-primary-container" : "bg-brand-tertiary/30"
                      }`}>
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      req.status === "대기중" ? "badge-progress" :
                      req.status === "수락" ? "badge-recruiting" : "badge-closed"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* ── 알림 센터 ── */}
      {activeTab === "notifications" && (
        <div className="animate-fadeIn">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Bell size={14} className="text-brand-accent-rose" />
            알림 센터
          </h2>
          <div className="flex flex-col gap-2">
            {notifications.length === 0 ? (
              <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center">
                <p className="text-xs text-brand-on-surface-variant">알림이 없습니다</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`bg-brand-card border border-brand-border/60 rounded-xl p-4 flex items-start gap-3 ${
                  !n.isRead ? "border-l-2 border-l-brand-primary" : ""
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    n.type === "course" ? "bg-brand-primary-container/20 text-brand-primary" :
                    n.type === "team" ? "bg-brand-tertiary/15 text-brand-tertiary" :
                    n.type === "investor" ? "bg-brand-accent-orange/15 text-brand-accent-orange" :
                    "bg-brand-surface-high text-brand-on-surface-variant"
                  }`}>
                    {n.type === "course" ? <BookOpen size={14} /> :
                     n.type === "team" ? <Users size={14} /> :
                     n.type === "investor" ? <FileText size={14} /> :
                     <Bell size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{n.title}</p>
                    <p className="text-[10px] text-brand-on-surface-variant mt-0.5">{n.message}</p>
                    <p className="text-[9px] text-brand-on-surface-variant/50 mt-1">{n.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
