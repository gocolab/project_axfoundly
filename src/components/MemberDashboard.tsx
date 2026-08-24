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
  Plus,
  Receipt,
  ExternalLink,
} from "lucide-react";
import type { Course, TeamBuildingRequest, PaymentRecord, Notification, IRProject } from "../types";
import ProjectCreateEditModal from "./ProjectCreateEditModal";
import PaymentReceiptModal from "./PaymentReceiptModal";

interface MemberDashboardProps {
  enrolledCourses: Course[];
  teamRequests: TeamBuildingRequest[];
  payments: PaymentRecord[];
  notifications: Notification[];
  myProjects?: IRProject[];
  onViewCourse: (id: string) => void;
  onViewIR?: (id: string) => void;
  onSaveProject?: (project: IRProject) => void;
  onRefundPayment?: (updatedPayment: PaymentRecord) => void;
  onUpdateTeamRequest?: (id: string, status: "수락" | "거절") => void;
}

export default function MemberDashboard({
  enrolledCourses,
  teamRequests,
  payments,
  notifications,
  myProjects = [],
  onViewCourse,
  onViewIR,
  onSaveProject,
  onRefundPayment,
  onUpdateTeamRequest,
}: MemberDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"courses" | "projects" | "notifications">("courses");

  // Modals
  const [showProjectModal, setShowProjectModal] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<IRProject | null>(null);
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentRecord | null>(null);

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
                        className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden card-hover cursor-pointer shadow-lg flex flex-col justify-between"
                        onClick={() => onViewCourse(course.id)}
                      >
                        <div>
                          {/* Thumbnail Header — 첨부 이미지 스타일 */}
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
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-slate-400 font-medium">
                                {course.category}
                              </span>
                              <span className="text-xs font-semibold text-[#34d399] flex items-center gap-1">
                                <CalendarIcon size={12} className="text-[#34d399]" />
                                {schedule.startDate.slice(5)} ~ {schedule.endDate.slice(5)}
                              </span>
                            </div>

                            <h3 className="font-display text-base font-bold text-white leading-snug line-clamp-1">
                              {course.title}
                            </h3>

                            <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 mb-3 leading-relaxed">
                              {course.description}
                            </p>

                            {/* 일정 배지 */}
                            <div className="bg-[#0b1329]/90 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300 font-medium">일정: 매주 [{schedule.daysOfWeek.join(", ")}]</span>
                                <span className="text-white font-mono font-bold">{schedule.timeSlot}</span>
                              </div>
                            </div>

                            {/* 진도율 바 */}
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
                              <Play size={12} /> 강의실 입장
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert("학습 자료 및 강의 슬라이드가 다운로드되었습니다.");
                              }}
                              className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2.5 rounded-xl hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Download size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </section>

          {/* 수강 내역 / 결제 영수증 */}
          <section>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CreditCard size={15} className="text-brand-accent-orange" />
              수강 및 결제 영수증 내역
            </h2>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md">
              <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-brand-surface-low border-b border-brand-border/30 text-[10px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
                <span className="col-span-5">강의명</span>
                <span className="col-span-2">결제 금액</span>
                <span className="col-span-2">결제일</span>
                <span className="col-span-1">상태</span>
                <span className="col-span-2 text-right">영수증/환불</span>
              </div>
              {payments.length === 0 ? (
                <p className="px-5 py-8 text-center text-xs text-brand-on-surface-variant">
                  결제 내역이 없습니다
                </p>
              ) : (
                payments.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center border-b border-brand-border/20 last:border-0 hover:bg-brand-surface-low transition-colors"
                  >
                    <span className="col-span-5 text-xs text-white truncate font-medium">
                      {p.courseTitle}
                    </span>
                    <span className="col-span-2 text-xs text-brand-on-surface-variant font-mono">
                      ₩{p.amount.toLocaleString()}
                    </span>
                    <span className="col-span-2 text-[10px] text-brand-on-surface-variant">{p.date}</span>
                    <span className="col-span-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          p.status === "완료"
                            ? "bg-brand-tertiary/15 text-brand-tertiary"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {p.status}
                      </span>
                    </span>
                    <span className="col-span-2 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="text-[10px] px-2.5 py-1 rounded bg-brand-surface-high hover:bg-brand-surface-highest text-white border border-brand-border/40 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Receipt size={10} /> 영수증 조회
                      </button>
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
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase size={15} className="text-brand-primary" />
                내 창업 아이템 & IR 프로젝트
              </h2>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setShowProjectModal(true);
                }}
                className="text-xs bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-1.5 px-3 rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Plus size={13} /> 신규 프로젝트 등록
              </button>
            </div>

            {myProjects.length === 0 ? (
              <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 shadow-md text-center">
                <div className="w-12 h-12 rounded-full bg-brand-surface-low mx-auto flex items-center justify-center mb-3">
                  <Briefcase size={20} className="text-brand-on-surface-variant" />
                </div>
                <p className="text-xs text-brand-on-surface-variant">
                  기획 중인 창업 아이템을 등록하고 IR 및 팀 빌딩을 시작하세요
                </p>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setShowProjectModal(true);
                  }}
                  className="mt-4 text-xs bg-brand-primary-container/20 text-brand-primary py-2 px-4 rounded-xl border border-brand-primary/30 hover:bg-brand-primary-container hover:text-white transition-colors cursor-pointer font-bold inline-flex items-center gap-1.5"
                >
                  <Plus size={13} /> 신규 프로젝트 등록
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myProjects.map((p) => (
                  <div
                    key={p.id}
                    className="bg-brand-card border border-brand-border/60 rounded-xl p-5 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[10px] text-brand-tertiary font-bold">{p.field}</span>
                          <h3 className="text-sm font-bold text-white mt-0.5">{p.teamName}</h3>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-primary-container/15 text-brand-primary font-bold">
                          {p.investmentStage}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white mb-1">{p.title}</p>
                      <p className="text-xs text-brand-on-surface-variant line-clamp-2 mb-3">
                        {p.oneLiner}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-brand-border/30 flex justify-between items-center">
                      <span className="text-[10px] text-brand-on-surface-variant">
                        {p.isAnonymous ? "🔒 스텔스 모드 적용됨" : "🌐 실명 모드"}
                      </span>
                      <div className="flex items-center gap-2">
                        {onViewIR && (
                          <button
                            onClick={() => onViewIR(p.id)}
                            className="text-xs text-brand-on-surface-variant hover:text-white transition-colors cursor-pointer inline-flex items-center gap-0.5"
                          >
                            <ExternalLink size={11} /> IR 보기
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingProject(p);
                            setShowProjectModal(true);
                          }}
                          className="text-xs text-brand-primary hover:underline font-bold"
                        >
                          수정 →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    className="bg-brand-card border border-brand-border/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            req.type === "received"
                              ? "bg-brand-tertiary/10 text-brand-tertiary"
                              : "bg-brand-primary-container/10 text-brand-primary"
                          }`}
                        >
                          {req.type === "received" ? "받은 제안" : "보낸 제안"}
                        </span>
                        <span className="text-xs font-bold text-white">{req.projectName}</span>
                        <span className="text-[10px] text-brand-on-surface-variant">포지션: {req.role}</span>
                      </div>
                      <p className="text-xs text-brand-on-surface-variant pl-0 sm:pl-2">
                        {req.message}
                      </p>
                      <span className="text-[9px] text-brand-on-surface-variant/60 mt-1 block">
                        {req.date} | {req.fromUser} → {req.toUser}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          req.status === "수락"
                            ? "bg-brand-tertiary/20 text-brand-tertiary"
                            : req.status === "거절"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-brand-surface-high text-brand-on-surface-variant"
                        }`}
                      >
                        {req.status}
                      </span>
                      {req.status === "대기중" && req.type === "received" && onUpdateTeamRequest && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onUpdateTeamRequest(req.id, "수락")}
                            className="px-2.5 py-1 rounded bg-brand-tertiary text-white text-[11px] font-bold hover:opacity-90"
                          >
                            수락
                          </button>
                          <button
                            onClick={() => onUpdateTeamRequest(req.id, "거절")}
                            className="px-2.5 py-1 rounded border border-brand-border text-brand-on-surface-variant text-[11px] hover:text-white"
                          >
                            거절
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* ── 3. 알림 & 강사 메시지함 ── */}
      {activeTab === "notifications" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare size={15} className="text-brand-primary" />
            강사 1:1 피드백 & 공지 메시지 ({instructorMessages.length}개)
          </h2>
          {instructorMessages.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <p className="text-xs text-brand-on-surface-variant">수신된 강사 메시지가 없습니다</p>
            </div>
          ) : (
            instructorMessages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-brand-card border rounded-xl p-4 shadow-md transition-colors ${
                  !msg.isRead
                    ? "border-brand-primary-container/40 bg-brand-primary-container/5"
                    : "border-brand-border/60"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {!msg.isRead && <span className="notification-dot" />}
                    <span className="text-xs font-bold text-white">{msg.title}</span>
                  </div>
                  <span className="text-[10px] text-brand-on-surface-variant">{msg.time}</span>
                </div>
                <p className="text-xs text-brand-on-surface-variant leading-relaxed pl-3 border-l-2 border-brand-primary-container/40">
                  {msg.message}
                </p>
                {msg.courseTitle && (
                  <p className="text-[10px] text-brand-primary font-mono mt-2">
                    연관 강의: {msg.courseTitle}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Project Modal */}
      <ProjectCreateEditModal
        isOpen={showProjectModal}
        initialProject={editingProject}
        onClose={() => setShowProjectModal(false)}
        onSave={(project) => {
          if (onSaveProject) onSaveProject(project);
        }}
      />

      {/* Payment Receipt Modal */}
      {selectedPayment && (
        <PaymentReceiptModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onRefundCompleted={(updatedPayment) => {
            setSelectedPayment(null);
            if (onRefundPayment) onRefundPayment(updatedPayment);
          }}
        />
      )}
    </div>
  );
}
