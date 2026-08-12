import React from "react";
import {
  BookOpen,
  Users,
  DollarSign,
  Edit,
  Eye,
  Send,
  BarChart3,
  PlusCircle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  Download,
  Mail,
} from "lucide-react";
import type { Course, SettlementRecord } from "../types";

interface InstructorDashboardProps {
  myCourses: Course[];
  settlements: SettlementRecord[];
}

export default function InstructorDashboard({ myCourses, settlements }: InstructorDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"courses" | "students" | "settlement">("courses");
  const [selectedCourseForCRM, setSelectedCourseForCRM] = React.useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = React.useState(false);

  const tabs = [
    { id: "courses" as const, label: "강의 관리", icon: <BookOpen size={14} /> },
    { id: "students" as const, label: "수강생 관리 (CRM)", icon: <Users size={14} /> },
    { id: "settlement" as const, label: "정산 관리", icon: <DollarSign size={14} /> },
  ];

  // Mock student data per course
  const mockStudents = [
    { id: "s1", name: "김현우", email: "hw.kim@mail.com", progress: 85, lastActive: "2시간 전" },
    { id: "s2", name: "이서연", email: "sy.lee@mail.com", progress: 62, lastActive: "1일 전" },
    { id: "s3", name: "박민재", email: "mj.park@mail.com", progress: 45, lastActive: "3시간 전" },
    { id: "s4", name: "정유진", email: "yj.jung@mail.com", progress: 95, lastActive: "방금 전" },
    { id: "s5", name: "최도윤", email: "dy.choi@mail.com", progress: 30, lastActive: "2일 전" },
  ];

  const totalRevenue = settlements.reduce((sum, s) => sum + s.netAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">강사 대시보드</h1>
        <p className="text-sm text-brand-on-surface-variant mt-1">강의, 수강생, 정산을 관리하세요</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">내 강의</p>
          <p className="text-2xl font-bold text-white font-display mt-1">{myCourses.length}</p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">총 수강생</p>
          <p className="text-2xl font-bold text-white font-display mt-1">
            {myCourses.reduce((s, c) => s + c.studentCount, 0)}
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">진행중</p>
          <p className="text-2xl font-bold text-brand-tertiary font-display mt-1">
            {myCourses.filter((c) => c.status === "진행중").length}
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">총 수익</p>
          <p className="text-2xl font-bold text-brand-primary font-display mt-1">₩{(totalRevenue / 10000).toFixed(0)}만</p>
        </div>
      </div>

      {/* Tabs */}
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

      {/* ── 강의 관리 ── */}
      {activeTab === "courses" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex justify-end">
            <button className="text-xs bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5">
              <PlusCircle size={14} />
              새 강의 등록
            </button>
          </div>

          {myCourses.map((course) => (
            <div key={course.id} className="bg-brand-card border border-brand-border/60 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-700 to-purple-900 flex items-center justify-center flex-shrink-0">
                <BookOpen size={24} className="text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{course.title}</h3>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    course.status === "모집중" ? "badge-recruiting" :
                    course.status === "진행중" ? "badge-progress" : "badge-closed"
                  }`}>
                    {course.status}
                  </span>
                </div>
                <p className="text-[10px] text-brand-on-surface-variant mt-1">{course.category} · {course.studentCount}명 수강 · {course.curriculum.length}주 과정</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="text-[10px] bg-brand-surface-low text-brand-on-surface-variant py-1.5 px-3 rounded-lg border border-brand-border/30 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                  <Edit size={10} /> 수정
                </button>
                <button className="text-[10px] bg-brand-surface-low text-brand-on-surface-variant py-1.5 px-3 rounded-lg border border-brand-border/30 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                  <Eye size={10} /> 미리보기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 수강생 관리 (CRM) ── */}
      {activeTab === "students" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Course selector */}
          <div className="flex gap-2 flex-wrap">
            {myCourses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourseForCRM(c.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  selectedCourseForCRM === c.id
                    ? "bg-brand-primary-container/20 border-brand-primary-container/40 text-brand-primary font-bold"
                    : "border-brand-border text-brand-on-surface-variant hover:text-white"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>

          {/* Student list */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">
            <div className="grid grid-cols-6 gap-2 px-5 py-2 bg-brand-surface-low border-b border-brand-border/30 text-[10px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
              <span className="col-span-2">수강생</span>
              <span>진도율</span>
              <span>마지막 활동</span>
              <span className="col-span-2 text-right">액션</span>
            </div>
            {mockStudents.map((student) => (
              <div key={student.id} className="grid grid-cols-6 gap-2 px-5 py-3 items-center border-b border-brand-border/20 last:border-0 hover:bg-brand-surface-low transition-colors">
                <div className="col-span-2 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-surface-high flex items-center justify-center text-[10px] font-bold text-brand-primary">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{student.name}</p>
                    <p className="text-[9px] text-brand-on-surface-variant">{student.email}</p>
                  </div>
                </div>
                <div>
                  <div className="progress-bar w-16">
                    <div className="progress-bar-fill" style={{ width: `${student.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-brand-on-surface-variant mt-0.5">{student.progress}%</span>
                </div>
                <span className="text-[10px] text-brand-on-surface-variant">{student.lastActive}</span>
                <div className="col-span-2 flex justify-end gap-1.5">
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="text-[9px] bg-brand-primary-container/15 text-brand-primary py-1 px-2 rounded border border-brand-primary-container/25 hover:bg-brand-primary-container/25 transition-colors cursor-pointer flex items-center gap-0.5"
                  >
                    <Mail size={9} /> 메시지
                  </button>
                  <button className="text-[9px] bg-brand-surface-low text-brand-on-surface-variant py-1 px-2 rounded border border-brand-border/30 hover:text-white transition-colors cursor-pointer">
                    상세
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bulk message */}
          <button
            onClick={() => setShowMessageModal(true)}
            className="text-xs bg-brand-surface-high text-brand-on-surface-variant py-2.5 px-4 rounded-xl border border-brand-border hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 self-start"
          >
            <Send size={12} /> 전체 수강생 메시지 발송
          </button>
        </div>
      )}

      {/* ── 정산 관리 ── */}
      {activeTab === "settlement" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center stat-shimmer">
              <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">총 수익</p>
              <p className="text-2xl font-bold text-white font-display mt-1">₩{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center stat-shimmer">
              <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">PG 수수료 공제</p>
              <p className="text-2xl font-bold text-error font-display mt-1">
                -₩{settlements.reduce((s, r) => s + r.pgFee + r.platformFee, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center stat-shimmer">
              <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">출금 가능</p>
              <p className="text-2xl font-bold text-brand-tertiary font-display mt-1">
                ₩{settlements.filter((s) => s.status === "정산완료").reduce((sum, s) => sum + s.netAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Settlement records */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">
            <div className="grid grid-cols-6 gap-2 px-5 py-2 bg-brand-surface-low border-b border-brand-border/30 text-[10px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
              <span>기간</span>
              <span>총수익</span>
              <span>PG수수료</span>
              <span>플랫폼 수수료</span>
              <span>정산액</span>
              <span className="text-right">상태</span>
            </div>
            {settlements.map((record) => (
              <div key={record.id} className="grid grid-cols-6 gap-2 px-5 py-3 items-center border-b border-brand-border/20 last:border-0 hover:bg-brand-surface-low transition-colors">
                <span className="text-xs text-white">{record.period}</span>
                <span className="text-xs text-brand-on-surface-variant">₩{record.totalRevenue.toLocaleString()}</span>
                <span className="text-xs text-error">-₩{record.pgFee.toLocaleString()}</span>
                <span className="text-xs text-error">-₩{record.platformFee.toLocaleString()}</span>
                <span className="text-xs font-bold text-white">₩{record.netAmount.toLocaleString()}</span>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    record.status === "정산완료" ? "badge-recruiting" :
                    record.status === "출금신청" ? "badge-progress" : "badge-closed"
                  }`}>
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="text-xs bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-semibold py-2.5 px-5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 self-start">
            <ArrowUpRight size={14} /> 출금 신청
          </button>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white mb-4">메시지 발송</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="제목"
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors"
              />
              <textarea
                placeholder="메시지 내용..."
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors h-28 resize-none"
              />
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 text-[10px] text-brand-on-surface-variant cursor-pointer">
                  <input type="checkbox" className="rounded" /> 이메일 발송
                </label>
                <label className="flex items-center gap-1.5 text-[10px] text-brand-on-surface-variant cursor-pointer">
                  <input type="checkbox" className="rounded" /> 알림톡 발송
                </label>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 border border-brand-border text-white py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-sm"
                >
                  취소
                </button>
                <button
                  onClick={() => { setShowMessageModal(false); alert("메시지가 발송되었습니다!"); }}
                  className="flex-1 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm"
                >
                  발송
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
