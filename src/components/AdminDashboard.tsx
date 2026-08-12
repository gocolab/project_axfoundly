import React from "react";
import {
  BarChart3,
  Users,
  BookOpen,
  MessageSquare,
  Bell,
  TrendingUp,
  Shield,
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  RefreshCw,
  Send,
  AlertTriangle,
  DollarSign,
  Zap,
  Eye,
} from "lucide-react";
import type { DashboardStats, AdminMember, AdminBoard, UserRole, Course } from "../types";

interface AdminDashboardProps {
  stats: DashboardStats;
  members: AdminMember[];
  boards: AdminBoard[];
  pendingCourses: Course[];
  onChangeRole: (memberId: string, newRole: UserRole) => void;
  onApproveCourse: (courseId: string) => void;
  onRejectCourse: (courseId: string) => void;
}

export default function AdminDashboard({
  stats,
  members,
  boards,
  pendingCourses,
  onChangeRole,
  onApproveCourse,
  onRejectCourse,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"stats" | "members" | "courses" | "boards" | "crm">("stats");
  const [memberSearch, setMemberSearch] = React.useState("");
  const [showCreateBoardModal, setShowCreateBoardModal] = React.useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = React.useState(false);
  const [newBoardName, setNewBoardName] = React.useState("");
  const [newBoardTemplate, setNewBoardTemplate] = React.useState<"일반형" | "갤러리형" | "카드형">("일반형");

  const tabs = [
    { id: "stats" as const, label: "통계 홈", icon: <BarChart3 size={14} /> },
    { id: "members" as const, label: "회원 관리", icon: <Users size={14} /> },
    { id: "courses" as const, label: "강의/콘텐츠 관리", icon: <BookOpen size={14} /> },
    { id: "boards" as const, label: "게시판 관리", icon: <MessageSquare size={14} /> },
    { id: "crm" as const, label: "알림/마케팅 CRM", icon: <Bell size={14} /> },
  ];

  const filteredMembers = members.filter(
    (m) => m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
           m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  // Mock chart data
  const chartBars = [35, 52, 48, 70, 65, 82, 90, 78, 95, 88, 72, 60];
  const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

  // Mock send logs
  const sendLogs = [
    { id: "log1", type: "이메일", target: "전체 회원", subject: "8월 신규 강의 오픈 안내", sentAt: "2025-08-10 09:00", status: "성공", count: 2400 },
    { id: "log2", type: "알림톡", target: "수강생 (Active)", subject: "결제 완료 확인", sentAt: "2025-08-09 14:30", status: "성공", count: 156 },
    { id: "log3", type: "이메일", target: "투자자", subject: "월간 스타트업 하이라이트", sentAt: "2025-08-08 10:00", status: "실패 (3건)", count: 45 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent-rose to-brand-accent-orange flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">관리자 대시보드</h1>
          <p className="text-sm text-brand-on-surface-variant">플랫폼 전체 통제 및 데이터 관리</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-brand-border/30 pb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
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

      {/* ── 통계 홈 ── */}
      {activeTab === "stats" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} className="text-brand-primary" />
                <span className="text-[10px] text-brand-on-surface-variant font-mono uppercase">일일 가입자</span>
              </div>
              <p className="text-2xl font-bold text-white font-display">{stats.dailySignups}</p>
              <p className="text-[9px] text-brand-tertiary flex items-center gap-0.5 mt-1">
                <ArrowUpRight size={9} /> 월간 {stats.monthlySignups}명
              </p>
            </div>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={14} className="text-brand-tertiary" />
                <span className="text-[10px] text-brand-on-surface-variant font-mono uppercase">총 결제액</span>
              </div>
              <p className="text-2xl font-bold text-white font-display">₩{(stats.monthlyRevenue / 10000).toFixed(0)}만</p>
              <p className="text-[9px] text-brand-on-surface-variant mt-1">
                누적 ₩{(stats.totalRevenue / 100000000).toFixed(1)}억
              </p>
            </div>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} className="text-brand-accent-orange" />
                <span className="text-[10px] text-brand-on-surface-variant font-mono uppercase">활성 강의</span>
              </div>
              <p className="text-2xl font-bold text-white font-display">{stats.activeCourses}</p>
            </div>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-brand-accent-rose" />
                <span className="text-[10px] text-brand-on-surface-variant font-mono uppercase">매칭 성사</span>
              </div>
              <p className="text-2xl font-bold text-white font-display">{stats.teamMatchCount + stats.investmentMatchCount}</p>
              <p className="text-[9px] text-brand-on-surface-variant mt-1">
                팀빌딩 {stats.teamMatchCount} + 투자 {stats.investmentMatchCount}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-brand-primary" />
              월별 가입자 추이
            </h2>
            <div className="flex items-end gap-2 h-40">
              {chartBars.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[8px] text-brand-on-surface-variant">{val * 3}</span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-brand-primary-container to-brand-secondary chart-bar"
                    style={{ height: `${val}%` }}
                  />
                  <span className="text-[8px] text-brand-on-surface-variant">{months[idx]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 회원 관리 ── */}
      {activeTab === "members" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
              <input
                type="text"
                placeholder="회원 검색..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors w-full sm:w-64"
              />
            </div>
            <span className="text-xs text-brand-on-surface-variant">총 {members.length}명</span>
          </div>

          <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">
            <div className="grid grid-cols-8 gap-1 px-5 py-2 bg-brand-surface-low border-b border-brand-border/30 text-[9px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
              <span className="col-span-2">이름</span>
              <span className="col-span-2">이메일</span>
              <span>역할</span>
              <span>가입일</span>
              <span>상태</span>
              <span className="text-right">액션</span>
            </div>
            {filteredMembers.map((member) => (
              <div key={member.id} className="grid grid-cols-8 gap-1 px-5 py-2.5 items-center border-b border-brand-border/20 last:border-0 hover:bg-brand-surface-low transition-colors">
                <div className="col-span-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-surface-high flex items-center justify-center text-[9px] font-bold text-brand-primary flex-shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <span className="text-xs text-white truncate">{member.name}</span>
                </div>
                <span className="col-span-2 text-[10px] text-brand-on-surface-variant truncate">{member.email}</span>
                <div>
                  <select
                    value={member.role}
                    onChange={(e) => onChangeRole(member.id, e.target.value as UserRole)}
                    className="text-[9px] bg-brand-surface-low border border-brand-border rounded px-1 py-0.5 text-brand-on-surface-variant cursor-pointer focus:outline-none"
                  >
                    <option value="student">수강생</option>
                    <option value="instructor">강사</option>
                    <option value="investor">투자자</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
                <span className="text-[10px] text-brand-on-surface-variant">{member.joinDate}</span>
                <span className={`text-[9px] font-bold ${
                  member.status === "활성" ? "text-brand-tertiary" :
                  member.status === "정지" ? "text-brand-accent-orange" : "text-error"
                }`}>
                  {member.status}
                </span>
                <div className="flex justify-end gap-1">
                  <button className="text-[9px] text-brand-on-surface-variant hover:text-white cursor-pointer p-0.5" title="상세">
                    <Eye size={11} />
                  </button>
                  <button className="text-[9px] text-brand-accent-orange hover:text-brand-accent-rose cursor-pointer p-0.5" title="제재">
                    <AlertTriangle size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 강의/콘텐츠 관리 ── */}
      {activeTab === "courses" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen size={14} className="text-brand-accent-orange" />
            개설 신청된 강의 검수
          </h2>

          {pendingCourses.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <CheckCircle size={32} className="text-brand-tertiary mx-auto mb-3" />
              <p className="text-sm text-brand-on-surface-variant">검수 대기 중인 강의가 없습니다</p>
            </div>
          ) : (
            pendingCourses.map((course) => (
              <div key={course.id} className="bg-brand-card border border-brand-border/60 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-700 to-purple-900 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={24} className="text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white">{course.title}</h3>
                    <p className="text-[10px] text-brand-on-surface-variant mt-1">
                      {course.instructor} · {course.category} · {course.curriculum.length}주 과정
                    </p>
                    <p className="text-[10px] text-brand-on-surface-variant mt-0.5">
                      수강료: ₩{(course.discountedPrice || course.price).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => onApproveCourse(course.id)}
                      className="text-xs bg-brand-tertiary/15 text-brand-tertiary py-1.5 px-3 rounded-lg border border-brand-tertiary/25 hover:bg-brand-tertiary/25 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle size={12} /> 승인
                    </button>
                    <button
                      onClick={() => onRejectCourse(course.id)}
                      className="text-xs bg-error/10 text-error py-1.5 px-3 rounded-lg border border-error/20 hover:bg-error/20 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <XCircle size={12} /> 반려
                    </button>
                    <button className="text-xs bg-brand-surface-low text-brand-on-surface-variant py-1.5 px-3 rounded-lg border border-brand-border/30 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                      <Eye size={12} /> 상세
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="border-t border-brand-border/30 pt-4 mt-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <RefreshCw size={14} className="text-brand-primary" />
              환불 처리
            </h2>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center">
              <p className="text-xs text-brand-on-surface-variant">처리 대기 중인 환불 요청이 없습니다</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 게시판 관리 ── */}
      {activeTab === "boards" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare size={14} className="text-brand-primary" />
              멀티 게시판 관리
            </h2>
            <button
              onClick={() => setShowCreateBoardModal(true)}
              className="text-xs bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} />
              게시판 생성
            </button>
          </div>

          <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 gap-2 px-5 py-2 bg-brand-surface-low border-b border-brand-border/30 text-[9px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
              <span className="col-span-2">게시판명</span>
              <span>읽기 권한</span>
              <span>쓰기 권한</span>
              <span>템플릿</span>
              <span>게시글 수</span>
              <span className="text-right">액션</span>
            </div>
            {boards.map((board) => (
              <div key={board.id} className="grid grid-cols-7 gap-2 px-5 py-3 items-center border-b border-brand-border/20 last:border-0 hover:bg-brand-surface-low transition-colors">
                <span className="col-span-2 text-xs font-semibold text-white">{board.name}</span>
                <span className="text-[10px] text-brand-on-surface-variant">{board.readPermission}</span>
                <span className="text-[10px] text-brand-on-surface-variant">{board.writePermission}</span>
                <span className="text-[10px] text-brand-on-surface-variant">{board.template}</span>
                <span className="text-[10px] text-brand-on-surface-variant">{board.postCount}</span>
                <div className="flex justify-end gap-1.5">
                  <button className="text-[9px] text-brand-on-surface-variant hover:text-white cursor-pointer"><Edit size={11} /></button>
                  <button className="text-[9px] text-error hover:text-brand-accent-rose cursor-pointer"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-white flex items-center gap-2 mt-2">
            <Eye size={14} className="text-brand-on-surface-variant" />
            게시글 모니터링
          </h3>
          <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center">
            <p className="text-xs text-brand-on-surface-variant">신고된 불량 게시물이 없습니다 ✓</p>
          </div>
        </div>
      )}

      {/* ── 알림/마케팅 CRM ── */}
      {activeTab === "crm" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Send size={14} className="text-brand-primary" />
              알림 및 마케팅 관리
            </h2>
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="text-xs bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
            >
              <Send size={14} />
              새 공지 발송
            </button>
          </div>

          <h3 className="text-xs font-bold text-brand-on-surface-variant mt-2">발송 로그</h3>
          <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 gap-2 px-5 py-2 bg-brand-surface-low border-b border-brand-border/30 text-[9px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
              <span>유형</span>
              <span>대상</span>
              <span className="col-span-2">제목</span>
              <span>발송일</span>
              <span>수신 수</span>
              <span className="text-right">상태</span>
            </div>
            {sendLogs.map((log) => (
              <div key={log.id} className="grid grid-cols-7 gap-2 px-5 py-3 items-center border-b border-brand-border/20 last:border-0 hover:bg-brand-surface-low transition-colors">
                <span className={`text-[10px] font-bold ${log.type === "이메일" ? "text-brand-primary" : "text-brand-accent-orange"}`}>
                  {log.type}
                </span>
                <span className="text-[10px] text-brand-on-surface-variant">{log.target}</span>
                <span className="col-span-2 text-xs text-white truncate">{log.subject}</span>
                <span className="text-[10px] text-brand-on-surface-variant">{log.sentAt}</span>
                <span className="text-[10px] text-brand-on-surface-variant">{log.count}건</span>
                <span className={`text-[9px] font-bold text-right ${
                  log.status === "성공" ? "text-brand-tertiary" : "text-brand-accent-orange"
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateBoardModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white mb-4">멀티 게시판 생성기</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1.5">게시판 이름</label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="새 게시판 이름"
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1.5">템플릿</label>
                <div className="flex gap-2">
                  {(["일반형", "갤러리형", "카드형"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewBoardTemplate(t)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        newBoardTemplate === t
                          ? "bg-brand-primary-container/20 border-brand-primary-container/40 text-brand-primary font-bold"
                          : "border-brand-border text-brand-on-surface-variant hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-brand-on-surface-variant block mb-1">읽기 권한</label>
                  <select className="w-full text-xs bg-brand-surface-low border border-brand-border rounded-lg px-2.5 py-1.5 text-white focus:outline-none cursor-pointer">
                    <option>전체</option>
                    <option>회원</option>
                    <option>관리자</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-brand-on-surface-variant block mb-1">쓰기 권한</label>
                  <select className="w-full text-xs bg-brand-surface-low border border-brand-border rounded-lg px-2.5 py-1.5 text-white focus:outline-none cursor-pointer">
                    <option>전체</option>
                    <option>회원</option>
                    <option>관리자</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setShowCreateBoardModal(false)}
                  className="flex-1 border border-brand-border text-white py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-sm"
                >
                  취소
                </button>
                <button
                  onClick={() => { setShowCreateBoardModal(false); alert(`"${newBoardName}" 게시판이 생성되었습니다!`); setNewBoardName(""); }}
                  className="flex-1 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm"
                >
                  생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white mb-4">공지 일괄 발송</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1.5">발송 대상</label>
                <select className="w-full text-xs bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                  <option>전체 회원</option>
                  <option>수강생</option>
                  <option>강사</option>
                  <option>투자자</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1.5">발송 채널</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-brand-on-surface-variant cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" /> 이메일
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-brand-on-surface-variant cursor-pointer">
                    <input type="checkbox" className="rounded" /> 알림톡
                  </label>
                </div>
              </div>
              <input
                type="text"
                placeholder="제목"
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors"
              />
              <textarea
                placeholder="메시지 내용..."
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors h-28 resize-none"
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 border border-brand-border text-white py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-sm"
                >
                  취소
                </button>
                <button
                  onClick={() => { setShowBroadcastModal(false); alert("공지가 발송되었습니다!"); }}
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
