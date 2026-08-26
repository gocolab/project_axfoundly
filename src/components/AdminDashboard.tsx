import React from "react";
import Pagination from "./common/Pagination";
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
  X,
  ArrowUpRight,
  RefreshCw,
  Send,
  AlertTriangle,
  DollarSign,
  Zap,
  Eye,
} from "lucide-react";
import type { DashboardStats, AdminMember, AdminBoard, UserRole, Course } from "../types";
import AdminBoardCreateModal from "./AdminBoardCreateModal";
import { api } from "../lib/api";

interface AdminDashboardProps {
  stats: DashboardStats;
  members: AdminMember[];
  boards: AdminBoard[];
  pendingCourses: Course[];
  onChangeRole: (memberId: string, newRoles: UserRole[]) => void;
  onApproveCourse: (courseId: string) => void;
  onRejectCourse: (courseId: string) => void;
  onViewCourse?: (courseId: string) => void;
}

export default function AdminDashboard({
  stats,
  members,
  boards,
  pendingCourses,
  onChangeRole,
  onApproveCourse,
  onRejectCourse,
  onViewCourse,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"stats" | "members" | "courses" | "boards" | "crm" | "payments">("stats");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [localBoards, setLocalBoards] = React.useState<AdminBoard[]>(boards);
  const [showCreateBoardModal, setShowCreateBoardModal] = React.useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = React.useState(false);
  const [newBoardName, setNewBoardName] = React.useState("");
  const [newBoardTemplate, setNewBoardTemplate] = React.useState<"일반형" | "갤러리형" | "카드형">("일반형");
  const [payments, setPayments] = React.useState<any[]>([]);
  const [selectedPanelItem, setSelectedPanelItem] = React.useState<{type: 'member', data: AdminMember} | {type: 'course', data: Course} | {type: 'board', data: AdminBoard} | {type: 'payment', data: any} | {type: 'crm', data: any} | null>(null);

  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    setLocalBoards(boards);
  }, [boards]);

  React.useEffect(() => {
    setSearchQuery("");
    setCurrentPage(1);
    if (selectedPanelItem) {
      setSelectedPanelItem(null);
      setIsClosing(false);
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (selectedPanelItem) {
      setSelectedPanelItem(null);
      setIsClosing(false);
    }
  }, [currentPage, searchQuery]);

  // ESC key listener to close detail panel
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedPanelItem) {
        handleCloseDetail();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPanelItem]);

  const handleCloseDetail = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPanelItem(null);
      setIsClosing(false);
    }, 300);
  };

  const renderDetailPanel = () => {
    if (!selectedPanelItem) return null;
    return (
      <div
        className={`w-full lg:w-[48%] xl:w-[45%] flex-shrink-0 sticky top-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isClosing ? "opacity-0 translate-x-8 scale-[0.98]" : "animate-slideInFromRight"
        }`}
      >
        <div className="glass-panel-heavy border border-brand-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full">
          <div className="p-4 sm:p-5 border-b border-brand-border/40 flex justify-between items-center bg-brand-surface-low/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
              <h3 className="font-display font-bold text-white text-sm">
                {selectedPanelItem.type === "member" && "회원 상세 정보"}
                {selectedPanelItem.type === "course" && "강의 검수 & 승인"}
                {selectedPanelItem.type === "board" && "게시판 상세 관리"}
                {selectedPanelItem.type === "payment" && "결제 영수증 상세"}
                {selectedPanelItem.type === "crm" && "CRM 발송 상세"}
              </h3>
            </div>
            <button
              onClick={handleCloseDetail}
              className="text-brand-on-surface-variant hover:text-white p-1 rounded-lg hover:bg-brand-surface-high transition-colors cursor-pointer"
              title="닫기 (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        <div className="p-5 overflow-y-auto max-h-[calc(100vh-140px)] space-y-4">
          {selectedPanelItem.type === 'member' && (
            <div className="space-y-4 text-sm text-brand-on-surface-variant">
              <div className="w-16 h-16 rounded-full bg-brand-surface-high flex items-center justify-center text-xl font-bold text-brand-primary mx-auto mb-4 border-2 border-brand-primary/30 shadow-inner">
                {selectedPanelItem.data.name.charAt(0)}
              </div>
              <div className="bg-brand-surface-low/60 rounded-xl p-3.5 space-y-2 border border-brand-border/30">
                <p><span className="font-semibold text-white">이름:</span> {selectedPanelItem.data.name}</p>
                <p><span className="font-semibold text-white">이메일:</span> {selectedPanelItem.data.email}</p>
                <p><span className="font-semibold text-white">가입일:</span> {selectedPanelItem.data.joinDate}</p>
                <p><span className="font-semibold text-white">상태:</span> {selectedPanelItem.data.status}</p>
                <p><span className="font-semibold text-white">권한:</span> {selectedPanelItem.data.roles.includes('admin') ? '관리자' : '수강생'}</p>
              </div>
            </div>
          )}
          {selectedPanelItem.type === 'course' && (
            <div className="space-y-4 text-sm text-brand-on-surface-variant">
              <h4 className="text-base font-bold text-white mb-2">{selectedPanelItem.data.title}</h4>
              <div className="bg-brand-surface-low/60 rounded-xl p-3.5 space-y-2 border border-brand-border/30">
                <p><span className="font-semibold text-white">카테고리:</span> {selectedPanelItem.data.category}</p>
                <p><span className="font-semibold text-white">강사:</span> {selectedPanelItem.data.instructor}</p>
                <p><span className="font-semibold text-white">가격:</span> ₩{(selectedPanelItem.data.discountedPrice || selectedPanelItem.data.price).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-brand-surface-low rounded-xl border border-brand-border/30">
                <p className="font-semibold text-white mb-2 text-xs">커리큘럼 요약</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  {selectedPanelItem.data.curriculum.slice(0, 5).map((curr: any, i: number) => (
                    <li key={i}>{curr.title}</li>
                  ))}
                  {selectedPanelItem.data.curriculum.length > 5 && <li>...</li>}
                </ul>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { onApproveCourse(selectedPanelItem.data.id); setSelectedPanelItem(null); }}
                  className="flex-1 py-2 bg-brand-tertiary/20 text-brand-tertiary font-bold rounded-xl border border-brand-tertiary/30 hover:bg-brand-tertiary/30 transition-colors cursor-pointer text-xs"
                >
                  강의 승인
                </button>
                <button
                  onClick={() => { onRejectCourse(selectedPanelItem.data.id); setSelectedPanelItem(null); }}
                  className="flex-1 py-2 bg-error/20 text-error font-bold rounded-xl border border-error/30 hover:bg-error/30 transition-colors cursor-pointer text-xs"
                >
                  강의 반려
                </button>
              </div>
            </div>
          )}
          {selectedPanelItem.type === 'board' && (
            <div className="space-y-4 text-sm text-brand-on-surface-variant">
              <div className="bg-brand-surface-low/60 rounded-xl p-3.5 space-y-2 border border-brand-border/30">
                <p><span className="font-semibold text-white">게시판명:</span> {selectedPanelItem.data.name}</p>
                <p><span className="font-semibold text-white">읽기 권한:</span> {selectedPanelItem.data.readPermission}</p>
                <p><span className="font-semibold text-white">쓰기 권한:</span> {selectedPanelItem.data.writePermission}</p>
                <p><span className="font-semibold text-white">템플릿:</span> {selectedPanelItem.data.template}</p>
                <p><span className="font-semibold text-white">게시글 수:</span> {selectedPanelItem.data.postCount}</p>
              </div>
            </div>
          )}
          {selectedPanelItem.type === 'payment' && (
            <div className="space-y-4 text-sm text-brand-on-surface-variant">
              <div className="bg-brand-surface-low/60 rounded-xl p-3.5 space-y-2 border border-brand-border/30">
                <p><span className="font-semibold text-white">주문번호:</span> {selectedPanelItem.data.id}</p>
                <p><span className="font-semibold text-white">결제 항목:</span> {selectedPanelItem.data.courseTitle || selectedPanelItem.data.course}</p>
                <p><span className="font-semibold text-white">결제자:</span> {selectedPanelItem.data.userId || selectedPanelItem.data.user}</p>
                <p><span className="font-semibold text-white">결제 금액:</span> ₩{selectedPanelItem.data.amount.toLocaleString()}</p>
                <p><span className="font-semibold text-white">결제일:</span> {selectedPanelItem.data.date}</p>
                <p><span className="font-semibold text-white">상태:</span> {selectedPanelItem.data.status}</p>
              </div>
            </div>
          )}
          {selectedPanelItem.type === 'crm' && (
            <div className="space-y-4 text-sm text-brand-on-surface-variant">
              <div className="bg-brand-surface-low/60 rounded-xl p-3.5 space-y-2 border border-brand-border/30">
                <p><span className="font-semibold text-white">유형:</span> {selectedPanelItem.data.type}</p>
                <p><span className="font-semibold text-white">대상:</span> {selectedPanelItem.data.target}</p>
                <p><span className="font-semibold text-white">제목:</span> {selectedPanelItem.data.subject}</p>
                <p><span className="font-semibold text-white">발송일시:</span> {selectedPanelItem.data.sentAt}</p>
                <p><span className="font-semibold text-white">수신 건수:</span> {selectedPanelItem.data.count}</p>
                <p><span className="font-semibold text-white">결과:</span> {selectedPanelItem.data.status}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  };

  React.useEffect(() => {
    if (activeTab === "payments") {
      api.getPayments().then(res => {
        if (res.payments) setPayments(res.payments);
      }).catch(console.error);
    }
  }, [activeTab]);

  const handleRefund = async (id: string) => {
    if (window.confirm(`결제 ${id}를 취소(환불)하시겠습니까?`)) {
      try {
        const res = await api.refundPayment(id, "관리자 직권 취소");
        setPayments(prev => prev.map(p => p.id === id ? res.payment : p));
        alert(`${id} 결제가 취소되었습니다.`);
      } catch (err) {
        console.error(err);
        alert("결제 취소에 실패했습니다.");
      }
    }
  };

  const handleDeleteBoard = async (id: string, name: string) => {
    try {
      await api.deleteAdminBoard(id);
      setLocalBoards((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      console.error(e);
      setLocalBoards((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const tabs = [
    { id: "stats" as const, label: "통계 홈", icon: <BarChart3 size={16} /> },
    { id: "members" as const, label: "회원 관리", icon: <Users size={16} /> },
    { id: "courses" as const, label: "강의 검수 & 승인", icon: <BookOpen size={16} /> },
    { id: "boards" as const, label: "게시판 관리", icon: <MessageSquare size={16} /> },
    { id: "payments" as const, label: "결제 관리", icon: <DollarSign size={16} /> },
    { id: "crm" as const, label: "알림/마케팅 CRM", icon: <Bell size={16} /> },
  ];




  // Mock chart data
  const chartBars = [35, 52, 48, 70, 65, 82, 90, 78, 95, 88, 72, 60];
  const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

  // Mock send logs
  const sendLogs = [
    { id: "log1", type: "이메일", target: "전체 회원", subject: "8월 신규 강의 오픈 안내", sentAt: "2025-08-10 09:00", status: "성공", count: 2400 },
    { id: "log2", type: "알림톡", target: "수강생 (Active)", subject: "결제 완료 확인", sentAt: "2025-08-09 14:30", status: "성공", count: 156 },
    { id: "log3", type: "이메일", target: "투자자", subject: "월간 스타트업 하이라이트", sentAt: "2025-08-08 10:00", status: "실패 (3건)", count: 45 },
  ];

  // --- Pagination & Filtering ---
  const itemsPerPage = 8;
  const lcSearch = searchQuery.toLowerCase();

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(lcSearch) || m.email.toLowerCase().includes(lcSearch));
  const totalMemberPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredCourses = pendingCourses.filter(c => c.title.toLowerCase().includes(lcSearch) || c.instructor.toLowerCase().includes(lcSearch));
  const totalCoursePages = Math.max(1, Math.ceil(filteredCourses.length / itemsPerPage));
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredBoards = localBoards.filter(b => b.name.toLowerCase().includes(lcSearch));
  const totalBoardPages = Math.max(1, Math.ceil(filteredBoards.length / itemsPerPage));
  const paginatedBoards = filteredBoards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredLogs = sendLogs.filter(l => l.subject.toLowerCase().includes(lcSearch) || l.target.toLowerCase().includes(lcSearch));
  const totalLogPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredPayments = payments.filter(p => (p.courseTitle || p.course)?.toLowerCase().includes(lcSearch) || (p.userId || p.user)?.toLowerCase().includes(lcSearch));
  const totalPaymentPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage));
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  // ------------------------------

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent-rose to-brand-accent-orange flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">플랫폼 관리자 대시보드</h1>
          <p className="text-sm text-brand-on-surface-variant">플랫폼 전체 통제 및 데이터 관리</p>
        </div>
      </div>

      {/* 좌측 사이드바 + 콘텐츠 */}
      <div className="flex gap-5">
        {/* ── 좌측 사이드바 메뉴 ── */}
        <aside className="w-52 flex-shrink-0">
          <nav className="flex flex-col gap-1 sticky top-20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                  activeTab === tab.id
                    ? "bg-brand-primary-container/20 text-brand-primary border border-brand-primary-container/30 shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high border border-transparent"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── 우측 콘텐츠 영역 ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5 items-start">
          {/* Main Master Content (Tables / Lists) */}
          <div className="w-full">
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
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users size={14} className="text-brand-primary" />
                      플랫폼 가입 회원 목록
                    </h2>
                    <p className="text-xs text-brand-on-surface-variant mt-0.5">전체 회원의 권한 및 계정 상태를 조회하고 변경합니다.</p>
                  </div>
                  <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full xl:w-auto shrink-0">
                    <div className="relative w-full xl:w-60">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                      <input
                        type="text"
                        placeholder="회원 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors w-full"
                      />
                    </div>
                    {totalMemberPages > 1 && (
                      <div className="ml-auto">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalMemberPages}
                          onPageChange={setCurrentPage}
                          totalItems={filteredMembers.length}
                          itemsPerPage={itemsPerPage}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative flex flex-col lg:flex-row gap-5 items-start">
                  <div className={`min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedPanelItem ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"}`}>
                    <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md">
                      {/* Header row */}
                      <div className="flex items-center px-5 py-2.5 bg-brand-surface-low border-b border-brand-border/30 text-[9px] font-mono text-brand-on-surface-variant uppercase tracking-wider gap-3">
                        <span className="flex-1 min-w-0">이름</span>
                        <span className="w-16 shrink-0">역할</span>
                        <div
                          className={`flex items-center gap-3 shrink-0 transition-all duration-300 ease-in-out ${
                            selectedPanelItem
                              ? "w-0 opacity-0 pointer-events-none overflow-hidden"
                              : "w-56 sm:w-72 opacity-100"
                          }`}
                        >
                          <span className="flex-1 min-w-0">이메일</span>
                          <span className="w-20 text-center font-mono">가입일</span>
                          <span className="w-12 text-center">상태</span>
                        </div>
                        <span className="w-12 text-right shrink-0">액션</span>
                      </div>

                      {paginatedMembers.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => setSelectedPanelItem({ type: 'member', data: member })}
                          className={`flex items-center px-5 py-3 border-b border-brand-border/20 last:border-0 transition-colors duration-200 cursor-pointer gap-3 ${
                            selectedPanelItem?.type === 'member' && selectedPanelItem.data.id === member.id
                              ? "bg-brand-primary-container/20 border-l-4 border-brand-primary text-white shadow-sm"
                              : "border-l-4 border-transparent hover:bg-brand-surface-low/80 text-brand-on-surface-variant"
                          }`}
                        >
                          {/* Name & Avatar */}
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-surface-high flex items-center justify-center text-[9px] font-bold text-brand-primary flex-shrink-0">
                              {member.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs text-white truncate block font-medium">{member.name}</span>
                              {selectedPanelItem && <span className="text-[9px] text-brand-on-surface-variant truncate block">{member.email}</span>}
                            </div>
                          </div>

                          {/* Role Select */}
                          <div className="w-16 shrink-0">
                            <select
                              value={member.roles.includes("admin") ? "admin" : "member"}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => onChangeRole(member.id, [e.target.value as UserRole])}
                              className="text-[9px] bg-brand-surface-low border border-brand-border rounded px-1.5 py-0.5 text-brand-on-surface-variant cursor-pointer focus:outline-none"
                            >
                              <option value="member">수강생</option>
                              <option value="admin">관리자</option>
                            </select>
                          </div>

                          {/* Metadata Columns (Collapses smoothly) */}
                          <div
                            className={`flex items-center gap-3 shrink-0 transition-all duration-300 ease-in-out ${
                              selectedPanelItem
                                ? "w-0 opacity-0 pointer-events-none overflow-hidden"
                                : "w-56 sm:w-72 opacity-100"
                            }`}
                          >
                            <span className="flex-1 text-[10px] text-brand-on-surface-variant truncate">{member.email}</span>
                            <span className="w-20 text-[10px] text-brand-on-surface-variant text-center font-mono">{member.joinDate}</span>
                            <span className="w-12 text-center">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                member.status === "활성" ? "text-brand-tertiary bg-brand-tertiary/10" :
                                member.status === "정지" ? "text-brand-accent-orange bg-brand-accent-orange/10" : "text-error bg-error/10"
                              }`}>
                                {member.status}
                              </span>
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="w-12 flex justify-end gap-1 shrink-0">
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
                  {renderDetailPanel()}
                </div>
              </div>
            )}

            {/* ── 강의/콘텐츠 관리 ── */}
            {activeTab === "courses" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen size={14} className="text-brand-accent-orange" />
                      신청/등록된 강의 커리큘럼 검수 & 승인
                    </h2>
                    <p className="text-xs text-brand-on-surface-variant mt-0.5">전체 강의 커리큘럼을 검수하고 승인/반려합니다.</p>
                  </div>
                  <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full xl:w-auto shrink-0">
                    <div className="relative w-full xl:w-60">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                      <input
                        type="text"
                        placeholder="강의 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors w-full"
                      />
                    </div>
                    {totalCoursePages > 1 && (
                      <div className="ml-auto">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalCoursePages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredCourses.length}
                        itemsPerPage={itemsPerPage}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex flex-col lg:flex-row gap-5 items-start">
                  <div className={`min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedPanelItem ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"}`}>
                    {filteredCourses.length === 0 ? (
                      <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center shadow-md">
                        <CheckCircle size={32} className="text-brand-tertiary mx-auto mb-3" />
                        <p className="text-sm text-brand-on-surface-variant">검수 대기 중인 강의가 없습니다</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {paginatedCourses.map((course) => (
                          <div
                            key={course.id}
                            onClick={() => setSelectedPanelItem({ type: 'course', data: course })}
                            className={`bg-brand-card border rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-sm ${
                              selectedPanelItem?.type === 'course' && selectedPanelItem.data.id === course.id
                                ? "border-brand-primary bg-brand-primary-container/15 ring-1 ring-brand-primary/40 shadow-md"
                                : "border-brand-border/60 hover:bg-brand-surface-low"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-700 to-purple-900 flex items-center justify-center flex-shrink-0 shadow-inner">
                                <BookOpen size={20} className="text-white/60" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-bold text-white truncate">{course.title}</h3>
                                <p className="text-[10px] text-brand-on-surface-variant mt-0.5 truncate">
                                  {course.instructor} · {course.category} · {course.curriculum.length}주 과정
                                </p>
                                <p className="text-[10px] text-brand-on-surface-variant font-mono">
                                  수강료: ₩{(course.discountedPrice || course.price).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex gap-1.5 flex-shrink-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); onApproveCourse(course.id); }}
                                  className="text-[10px] bg-brand-tertiary/15 text-brand-tertiary py-1 px-2.5 rounded-lg border border-brand-tertiary/25 hover:bg-brand-tertiary/25 transition-colors cursor-pointer flex items-center gap-1 font-bold"
                                >
                                  <CheckCircle size={11} /> 승인
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); onRejectCourse(course.id); }}
                                  className="text-[10px] bg-error/10 text-error py-1 px-2.5 rounded-lg border border-error/20 hover:bg-error/20 transition-colors cursor-pointer flex items-center gap-1 font-bold"
                                >
                                  <XCircle size={11} /> 반려
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedPanelItem({ type: 'course', data: course }); }}
                                  className="text-[10px] bg-brand-surface-low text-brand-on-surface-variant py-1 px-2.5 rounded-lg border border-brand-border/30 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Eye size={11} /> 상세
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="border-t border-brand-border/30 pt-4 mt-4">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                        <RefreshCw size={14} className="text-brand-primary" />
                        환불 처리
                      </h2>
                      <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center">
                        <p className="text-xs text-brand-on-surface-variant">처리 대기 중인 환불 요청이 없습니다</p>
                      </div>
                    </div>
                  </div>
                  {renderDetailPanel()}
                </div>
              </div>
            )}

            {/* ── 게시판 관리 ── */}
            {activeTab === "boards" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare size={14} className="text-brand-primary" />
                    멀티 게시판 관리
                  </h2>
                  <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full xl:w-auto shrink-0">
                    <div className="relative w-full xl:w-60">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                      <input
                        type="text"
                        placeholder="게시판 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors w-full"
                      />
                    </div>
                    {totalBoardPages > 1 && (
                      <div className="ml-auto">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalBoardPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredBoards.length}
                        itemsPerPage={itemsPerPage}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => setShowCreateBoardModal(true)}
                    className="text-xs bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 ml-2"
                  >
                    <Plus size={14} />
                    새 게시판 만들기
                  </button>
                </div>
              </div>

              <div className="relative flex flex-col lg:flex-row gap-5 items-start">
                  <div className={`min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedPanelItem ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"}`}>
                    <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md">
                      <div className="flex items-center px-5 py-2.5 bg-brand-surface-low border-b border-brand-border/30 text-[9px] font-mono text-brand-on-surface-variant uppercase tracking-wider gap-3">
                        <span className="flex-1 min-w-0">게시판명</span>
                        <div
                          className={`flex items-center gap-3 shrink-0 transition-all duration-300 ease-in-out ${
                            selectedPanelItem
                              ? "w-0 opacity-0 pointer-events-none overflow-hidden"
                              : "w-56 sm:w-72 opacity-100"
                          }`}
                        >
                          <span className="w-16 text-center">읽기 권한</span>
                          <span className="w-16 text-center">쓰기 권한</span>
                          <span className="w-16 text-center">템플릿</span>
                        </div>
                        <span className="w-16 text-center shrink-0">게시글 수</span>
                        <span className="w-12 text-right shrink-0">액션</span>
                      </div>
                      {paginatedBoards.map((board) => (
                        <div
                          key={board.id}
                          onClick={() => setSelectedPanelItem({ type: 'board', data: board })}
                          className={`flex items-center px-5 py-3 border-b border-brand-border/20 last:border-0 transition-colors duration-200 cursor-pointer gap-3 ${
                            selectedPanelItem?.type === 'board' && selectedPanelItem.data.id === board.id
                              ? "bg-brand-primary-container/20 border-l-4 border-brand-primary text-white shadow-sm"
                              : "border-l-4 border-transparent hover:bg-brand-surface-low/80 text-brand-on-surface-variant"
                          }`}
                        >
                          <span className="flex-1 text-xs font-semibold text-white truncate">{board.name}</span>
                          <div
                            className={`flex items-center gap-3 shrink-0 transition-all duration-300 ease-in-out ${
                              selectedPanelItem
                                ? "w-0 opacity-0 pointer-events-none overflow-hidden"
                                : "w-56 sm:w-72 opacity-100"
                            }`}
                          >
                            <span className="w-16 text-[10px] text-brand-on-surface-variant text-center">{board.readPermission}</span>
                            <span className="w-16 text-[10px] text-brand-on-surface-variant text-center">{board.writePermission}</span>
                            <span className="w-16 text-[10px] text-brand-on-surface-variant text-center">{board.template}</span>
                          </div>
                          <span className="w-16 text-[10px] text-brand-on-surface-variant text-center font-mono shrink-0">{board.postCount}</span>
                          <div className="w-12 flex justify-end gap-1.5 shrink-0">
                            <button onClick={(e) => e.stopPropagation()} className="text-[9px] text-brand-on-surface-variant hover:text-white cursor-pointer"><Edit size={11} /></button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteBoard(board.id, board.name); }}
                              className="text-[9px] text-error hover:text-brand-accent-rose cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mt-4">
                      <Eye size={14} className="text-brand-on-surface-variant" />
                      게시글 모니터링
                    </h3>
                    <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center shadow-sm mt-2">
                      <p className="text-xs text-brand-on-surface-variant">신고된 불량 게시물이 없습니다 ✓</p>
                    </div>
                  </div>
                  {renderDetailPanel()}
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

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                  <h3 className="text-xs font-bold text-brand-on-surface-variant m-0">발송 로그</h3>
                  <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full xl:w-auto shrink-0">
                    <div className="relative w-full xl:w-60">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                      <input
                        type="text"
                        placeholder="발송 로그 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors w-full"
                      />
                    </div>
                    {totalLogPages > 1 && (
                      <div className="ml-auto">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalLogPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredLogs.length}
                        itemsPerPage={itemsPerPage}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex flex-col lg:flex-row gap-5 items-start">
                  <div className={`min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedPanelItem ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"}`}>
                    <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md">
                      <div className="flex items-center px-5 py-2.5 bg-brand-surface-low border-b border-brand-border/30 text-[9px] font-mono text-brand-on-surface-variant uppercase tracking-wider gap-3">
                        <span className="w-14 shrink-0">유형</span>
                        <span className="flex-1 min-w-0">제목</span>
                        <div
                          className={`flex items-center gap-3 shrink-0 transition-all duration-300 ease-in-out ${
                            selectedPanelItem
                              ? "w-0 opacity-0 pointer-events-none overflow-hidden"
                              : "w-56 sm:w-72 opacity-100"
                          }`}
                        >
                          <span className="w-20 text-center">대상</span>
                          <span className="w-20 text-center font-mono">발송일</span>
                          <span className="w-12 text-center">수신 수</span>
                        </div>
                        <span className="w-12 text-right shrink-0">상태</span>
                      </div>
                      {paginatedLogs.map((log) => (
                        <div
                          key={log.id}
                          onClick={() => setSelectedPanelItem({ type: 'crm', data: log })}
                          className={`flex items-center px-5 py-3 border-b border-brand-border/20 last:border-0 transition-colors duration-200 cursor-pointer gap-3 ${
                            selectedPanelItem?.type === 'crm' && selectedPanelItem.data.id === log.id
                              ? "bg-brand-primary-container/20 border-l-4 border-brand-primary text-white shadow-sm"
                              : "border-l-4 border-transparent hover:bg-brand-surface-low/80 text-brand-on-surface-variant"
                          }`}
                        >
                          <span className={`w-14 shrink-0 text-[10px] font-bold ${log.type === "이메일" ? "text-brand-primary" : "text-brand-accent-orange"}`}>
                            {log.type}
                          </span>
                          <span className="flex-1 min-w-0 text-xs text-white truncate font-medium">{log.subject}</span>
                          <div
                            className={`flex items-center gap-3 shrink-0 transition-all duration-300 ease-in-out ${
                              selectedPanelItem
                                ? "w-0 opacity-0 pointer-events-none overflow-hidden"
                                : "w-56 sm:w-72 opacity-100"
                            }`}
                          >
                            <span className="w-20 text-[10px] text-brand-on-surface-variant text-center truncate">{log.target}</span>
                            <span className="w-20 text-[10px] text-brand-on-surface-variant text-center font-mono">{log.sentAt}</span>
                            <span className="w-12 text-[10px] text-brand-on-surface-variant text-center font-mono">{log.count}건</span>
                          </div>
                          <span className={`w-12 shrink-0 text-[9px] font-bold text-right ${
                            log.status === "성공" ? "text-brand-tertiary" : "text-brand-accent-orange"
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {renderDetailPanel()}
                </div>
              </div>
            )}

            {/* ── 결제 관리 탭 ── */}
            {activeTab === "payments" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign size={14} className="text-brand-tertiary" />
                    결제 관리
                  </h2>
                </div>

                {/* Kakao Pay 연동 상태 */}
                <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFCD00] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#3A1D1D]">Pay</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">카카오페이 테스트 연동
                      <span className="ml-2 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/30">연동됨</span>
                    </p>
                    <p className="text-[10px] text-brand-on-surface-variant mt-0.5">CID: TC0ONETIME (테스트 일회성 카드결제)</p>
                  </div>
                </div>

                {/* 모의 결제 내역 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                  <h3 className="text-xs font-bold text-brand-on-surface-variant m-0">모의 결제 내역</h3>
                  <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full xl:w-auto shrink-0">
                    <div className="relative w-full xl:w-60">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                      <input
                        type="text"
                        placeholder="결제 내역 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors w-full"
                      />
                    </div>
                    {totalPaymentPages > 1 && (
                      <div className="ml-auto">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPaymentPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredPayments.length}
                        itemsPerPage={itemsPerPage}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex flex-col lg:flex-row gap-5 items-start">
                  <div className={`min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedPanelItem ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"}`}>
                    <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md">
                  <div className="flex items-center px-5 py-2.5 bg-brand-surface-low border-b border-brand-border/30 text-[9px] font-mono text-brand-on-surface-variant uppercase tracking-wider gap-3">
                    <span className="flex-1 min-w-0">강의명</span>
                    <div
                      className={`flex items-center gap-3 shrink-0 transition-all duration-300 ease-in-out ${
                        selectedPanelItem
                          ? "w-0 opacity-0 pointer-events-none overflow-hidden"
                          : "w-56 sm:w-72 opacity-100"
                      }`}
                    >
                      <span className="w-20 font-mono text-center">주문번호</span>
                      <span className="w-20 text-center">결제자</span>
                      <span className="w-20 text-center font-mono">결제일</span>
                    </div>
                    <span className="w-16 text-right shrink-0">금액</span>
                    <span className="w-14 text-right shrink-0">상태</span>
                  </div>
                  {filteredPayments.length === 0 ? (
                    <div className="py-10 text-center text-sm text-brand-on-surface-variant">
                      결제 내역이 없습니다.
                    </div>
                  ) : (
                    paginatedPayments.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPanelItem({ type: 'payment', data: p })}
                        className={`flex items-center px-5 py-3 border-b border-brand-border/20 last:border-0 transition-colors duration-200 cursor-pointer gap-3 ${
                          selectedPanelItem?.type === 'payment' && selectedPanelItem.data.id === p.id
                            ? "bg-brand-primary-container/20 border-l-4 border-brand-primary text-white shadow-sm"
                            : "border-l-4 border-transparent hover:bg-brand-surface-low/80 text-brand-on-surface-variant"
                        }`}
                      >
                        <span className="flex-1 min-w-0 text-xs text-white truncate font-medium">{p.courseTitle || p.course}</span>
                        <div
                          className={`flex items-center gap-3 shrink-0 transition-all duration-300 ease-in-out ${
                            selectedPanelItem
                              ? "w-0 opacity-0 pointer-events-none overflow-hidden"
                              : "w-56 sm:w-72 opacity-100"
                          }`}
                        >
                          <span className="w-20 text-[10px] font-mono text-brand-on-surface-variant text-center truncate">{p.id}</span>
                          <span className="w-20 text-[10px] text-brand-on-surface-variant text-center truncate">{p.userId || p.user}</span>
                          <span className="w-20 text-[10px] text-brand-on-surface-variant text-center font-mono">{p.date}</span>
                        </div>
                        <span className="w-16 text-[10px] font-semibold text-white text-right font-mono shrink-0">₩{p.amount.toLocaleString()}</span>
                        <div className="w-14 flex items-center justify-end gap-1 shrink-0">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            p.status === "완료" ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
                          }`}>{p.status}</span>
                          {p.status === "완료" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRefund(p.id); }}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border border-red-500/20 flex-shrink-0"
                            >
                              취소
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                    </div>
                  </div>
                  {renderDetailPanel()}
                </div>
              </div>
            )}

            {/* Create Board Modal */}
            <AdminBoardCreateModal
              isOpen={showCreateBoardModal}
              onClose={() => setShowCreateBoardModal(false)}
              onSuccess={(newBoard) => {
                setLocalBoards((prev) => [newBoard, ...prev]);
                alert(`"${newBoard.name}" 게시판이 생성되었습니다!`);
              }}
            />

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
        </div>
      </div>{/* end flex sidebar+content */}
    </div>
  );
}
