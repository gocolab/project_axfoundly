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
  Sparkles,
  Lightbulb,
  Check,
} from "lucide-react";
import type {
  DashboardStats,
  AdminMember,
  AdminBoard,
  UserRole,
  Course,
  IRProject,
  IdeaRequest,
  IdeaProposal,
  InvestmentProposal,
  AdminCategoryInsight,
  CodeGroup,
  CommonCode,
} from "../types";
import AdminBoardCreateModal from "./AdminBoardCreateModal";
import { useToast } from "./common/Toast";
import { api } from "../lib/api";
import { clearCommonCodesCache } from "../hooks/useCommonCodes";

interface AdminDashboardProps {
  stats: DashboardStats;
  members: AdminMember[];
  boards: AdminBoard[];
  pendingCourses: Course[];
  onChangeRole: (memberId: string, newRoles: UserRole[]) => void;
  onApproveCourse: (courseId: string) => void;
  onRejectCourse: (courseId: string) => void;
  onViewCourse?: (courseId: string) => void;
  onBoardCreated?: (board: AdminBoard) => void;
  onBoardDeleted?: (boardId: string) => void;
  onRefresh?: () => void;
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
  onBoardCreated,
  onBoardDeleted,
  onRefresh,
}: AdminDashboardProps) {
  const toast = useToast();
  type AdminTab = "stats" | "members" | "courses" | "startup" | "categories" | "boards" | "crm" | "payments" | "common_codes";

  const getInitialTab = (): AdminTab => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["stats", "members", "courses", "startup", "categories", "boards", "crm", "payments", "common_codes"].includes(tabParam)) {
      return tabParam as AdminTab;
    }
    return "stats";
  };

  const [activeTab, setActiveTabRaw] = React.useState<AdminTab>(getInitialTab);

  const setActiveTab = React.useCallback((tab: AdminTab) => {
    setActiveTabRaw(tab);
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("tab", tab);
    window.history.replaceState({}, "", currentUrl.toString());
  }, []);

  React.useEffect(() => {
    const handleLocationChange = () => {
      setActiveTabRaw(getInitialTab());
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [localBoards, setLocalBoards] = React.useState<AdminBoard[]>(boards);
  const [showCreateBoardModal, setShowCreateBoardModal] = React.useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = React.useState(false);
  const [newBoardName, setNewBoardName] = React.useState("");
  const [newBoardTemplate, setNewBoardTemplate] = React.useState<"일반형" | "갤러리형" | "카드형">("일반형");
  const [payments, setPayments] = React.useState<any[]>([]);

  // 신규 데이터 상태: IR 프로젝트, 아이디어 의뢰, 카테고리 인사이트, 공통 코드
  const [adminProjects, setAdminProjects] = React.useState<IRProject[]>([]);
  const [adminIdeaRequests, setAdminIdeaRequests] = React.useState<IdeaRequest[]>([]);
  const [adminCategoryInsights, setAdminCategoryInsights] = React.useState<AdminCategoryInsight[]>([]);
  const [irSubFilter, setIrSubFilter] = React.useState<"all" | "stealth" | "hiring">("all");
  const [dataLoading, setDataLoading] = React.useState(false);

  // 공통 코드 관리 상태
  const [codeGroups, setCodeGroups] = React.useState<CodeGroup[]>([]);
  const [commonCodes, setCommonCodes] = React.useState<CommonCode[]>([]);
  const [selectedGroupCode, setSelectedGroupCode] = React.useState<string>("COURSE_CATEGORY");
  const [showCodeModal, setShowCodeModal] = React.useState(false);
  const [editingCode, setEditingCode] = React.useState<CommonCode | null>(null);
  const [showGroupModal, setShowGroupModal] = React.useState(false);
  const [editingGroup, setEditingGroup] = React.useState<CodeGroup | null>(null);

  const [selectedPanelItem, setSelectedPanelItem] = React.useState<
    | { type: "member"; data: AdminMember }
    | { type: "course"; data: Course }
    | { type: "ir"; data: IRProject }
    | { type: "idea"; data: IdeaRequest }
    | { type: "category"; data: AdminCategoryInsight }
    | { type: "board"; data: AdminBoard }
    | { type: "payment"; data: any }
    | { type: "crm"; data: any }
    | null
  >(null);

  const [isClosing, setIsClosing] = React.useState(false);

  // Load data on tab switch
  React.useEffect(() => {
    if (activeTab === "startup") {
      setDataLoading(true);
      Promise.all([api.getAdminIRProjects(), api.getAdminIdeaRequests()])
        .then(([irRes, ideaRes]) => {
          setAdminProjects(irRes.projects || []);
          setAdminIdeaRequests(ideaRes.ideaRequests || []);
        })
        .catch((err) => console.error("Failed to load admin startup data", err))
        .finally(() => setDataLoading(false));
    } else if (activeTab === "categories") {
      setDataLoading(true);
      api.getAdminCategoryInsights()
        .then((res) => {
          setAdminCategoryInsights(res.insights || []);
        })
        .catch((err) => console.error("Failed to load category insights", err))
        .finally(() => setDataLoading(false));
    } else if (activeTab === "common_codes") {
      setDataLoading(true);
      Promise.all([api.getCodeGroups(), api.getCommonCodes()])
        .then(([gRes, cRes]) => {
          const groups = gRes.groups || [];
          setCodeGroups(groups);
          setCommonCodes(cRes.codes || []);
          if (groups.length > 0 && (!selectedGroupCode || !groups.some(g => g.groupCode === selectedGroupCode))) {
            setSelectedGroupCode(groups[0].groupCode);
          }
        })
        .catch((err) => console.error("Failed to load common codes", err))
        .finally(() => setDataLoading(false));
    }
  }, [activeTab]);

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
                {selectedPanelItem.type === "member" && "회원 상세 정보 & 활동 이력"}
                {selectedPanelItem.type === "course" && "강의 검수 & 승인"}
                {selectedPanelItem.type === "ir" && "스타트업 IR 프로젝트 검수"}
                {selectedPanelItem.type === "idea" && "아이디어 의뢰 & 제안 검수"}
                {selectedPanelItem.type === "category" && "자연어 카테고리 인사이트"}
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
          {selectedPanelItem.type === 'ir' && (
            <div className="space-y-4 text-sm text-brand-on-surface-variant">
              <h4 className="text-base font-bold text-white">{selectedPanelItem.data.teamName}</h4>
              <div className="bg-brand-surface-low/60 rounded-xl p-3.5 space-y-2 border border-brand-border/30">
                <p><span className="font-semibold text-white">프로젝트 타이틀:</span> {selectedPanelItem.data.title}</p>
                <p><span className="font-semibold text-white">산업 / 분야:</span> <span className="font-mono text-cyan-300 font-bold">{selectedPanelItem.data.field}</span></p>
                <p><span className="font-semibold text-white">투자 단계:</span> {selectedPanelItem.data.investmentStage}</p>
                <p><span className="font-semibold text-white">모드:</span> {selectedPanelItem.data.isAnonymous ? "⚡ 비실명(스텔스)" : "공개(실명)"}</p>
                <p><span className="font-semibold text-white">채용 중:</span> {selectedPanelItem.data.isHiring ? `채용 중 (${selectedPanelItem.data.hiringRoles?.join(", ")})` : "채용 없음"}</p>
              </div>
              <div className="p-4 bg-brand-surface-low rounded-xl border border-brand-border/30 space-y-2">
                <p className="font-semibold text-white text-xs">한 줄 소개</p>
                <p className="text-xs text-white/80">{selectedPanelItem.data.oneLiner}</p>
                <p className="font-semibold text-white text-xs pt-2 border-t border-white/10">문제 & 솔루션</p>
                <p className="text-xs text-white/70"><strong>Problem:</strong> {selectedPanelItem.data.problem}</p>
                <p className="text-xs text-white/70"><strong>Solution:</strong> {selectedPanelItem.data.solution}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={async () => {
                    await api.updateAdminIRProjectStatus(selectedPanelItem.data.id, "활성");
                    toast.success("IR 프로젝트 검수 완료", "프로젝트가 정상 활성 상태로 유지됩니다.");
                    setSelectedPanelItem(null);
                  }}
                  className="flex-1 py-2 bg-brand-tertiary/20 text-brand-tertiary font-bold rounded-xl border border-brand-tertiary/30 hover:bg-brand-tertiary/30 transition-colors cursor-pointer text-xs"
                >
                  정상 승인
                </button>
                <button
                  onClick={async () => {
                    await api.updateAdminIRProjectStatus(selectedPanelItem.data.id, "숨김");
                    toast.warning("IR 프로젝트 숨김 처리", "해당 프로젝트가 탐색 목록에서 숨김 처리되었습니다.");
                    setSelectedPanelItem(null);
                  }}
                  className="flex-1 py-2 bg-error/20 text-error font-bold rounded-xl border border-error/30 hover:bg-error/30 transition-colors cursor-pointer text-xs"
                >
                  숨김 / 블라인드
                </button>
              </div>
            </div>
          )}
          {selectedPanelItem.type === 'idea' && (
            <div className="space-y-4 text-sm text-brand-on-surface-variant">
              <h4 className="text-base font-bold text-white">{selectedPanelItem.data.title}</h4>
              <div className="bg-brand-surface-low/60 rounded-xl p-3.5 space-y-2 border border-brand-border/30">
                <p><span className="font-semibold text-white">발제자:</span> {selectedPanelItem.data.requestedBy?.userName}</p>
                <p><span className="font-semibold text-white">카테고리:</span> <span className="text-cyan-300 font-mono font-semibold">{selectedPanelItem.data.category}</span></p>
                <p><span className="font-semibold text-white">공감 수:</span> {selectedPanelItem.data.upvoteCount}명</p>
                <p><span className="font-semibold text-white">협업 보상:</span> {selectedPanelItem.data.rewardType} ({selectedPanelItem.data.rewardDetail})</p>
                <p><span className="font-semibold text-white">상태:</span> {selectedPanelItem.data.status}</p>
              </div>
              <div className="p-4 bg-brand-surface-low rounded-xl border border-brand-border/30 space-y-2">
                <p className="font-semibold text-white text-xs">해결하려는 문제 (Pain Point)</p>
                <p className="text-xs text-white/70">{selectedPanelItem.data.problem}</p>
                <p className="font-semibold text-white text-xs pt-2 border-t border-white/10">솔루션 컨셉</p>
                <p className="text-xs text-white/70">{selectedPanelItem.data.solutionConcept}</p>
              </div>
            </div>
          )}
          {selectedPanelItem.type === 'category' && (
            <div className="space-y-4 text-sm text-brand-on-surface-variant">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-brand-primary" />
                {selectedPanelItem.data.category}
              </h4>
              <div className="bg-brand-surface-low/60 rounded-xl p-3.5 space-y-2 border border-brand-border/30">
                <p><span className="font-semibold text-white">누적 사용 횟수:</span> <strong className="text-brand-primary font-bold">{selectedPanelItem.data.count}회</strong></p>
                <p><span className="font-semibold text-white">사용 도메인:</span> {selectedPanelItem.data.type === "all" ? "전체 (강의+IR+아이디어)" : selectedPanelItem.data.type}</p>
                <p><span className="font-semibold text-white">최근 트렌드:</span> {selectedPanelItem.data.recentTrend}</p>
                <p><span className="font-semibold text-white">추천 칩 등록 여부:</span> {selectedPanelItem.data.isRecommendedChip ? "✅ 등록됨" : "미등록 (자연어 생성)"}</p>
              </div>
              <div className="p-4 bg-brand-primary/10 rounded-xl border border-brand-primary/20 text-xs text-brand-on-surface-variant">
                사용자와 AI가 실시간으로 확장 중인 자연어 카테고리입니다. 빈도가 높은 카테고리는 프론트엔드 모달 추천 칩에 매핑됩니다.
              </div>
            </div>
          )}
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
                <p>
                  <span className="font-semibold text-white">권한:</span>{" "}
                  {selectedPanelItem.data.roles
                    .map((r) => (r === "admin" ? "관리자" : r === "manager" ? "manager" : "member"))
                    .join(", ")}
                </p>
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
    const confirmed = await toast.confirm({
      title: "결제 직권 취소(환불)",
      message: `결제 건(${id})을 직권 취소(전액 환불) 처리하시겠습니까?`,
      confirmText: "환불 처리",
      cancelText: "닫기",
      type: "danger",
    });
    if (!confirmed) return;

    try {
      const res = await api.refundPayment(id, "관리자 직권 취소");
      setPayments(prev => prev.map(p => p.id === id ? res.payment : p));
      toast.success("결제 취소 완료", `${id} 결제 건이 성공적으로 취소(환불)되었습니다.`);
    } catch (err) {
      console.error(err);
      toast.error("결제 취소 실패", "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleDeleteBoard = async (id: string, name: string) => {
    try {
      await api.deleteAdminBoard(id);
      setLocalBoards((prev) => prev.filter((b) => b.id !== id));
      if (onBoardDeleted) onBoardDeleted(id);
      if (onRefresh) onRefresh();
      toast.success("게시판 삭제 완료", `"${name}" 게시판이 삭제되었습니다.`);
    } catch (e) {
      console.error(e);
      setLocalBoards((prev) => prev.filter((b) => b.id !== id));
      if (onBoardDeleted) onBoardDeleted(id);
      if (onRefresh) onRefresh();
    }
  };

  const tabs = [
    { id: "stats" as const, label: "통계 홈", icon: <BarChart3 size={16} /> },
    { id: "members" as const, label: "회원 관리", icon: <Users size={16} /> },
    { id: "courses" as const, label: "강의 검수 & 승인", icon: <BookOpen size={16} /> },
    { id: "startup" as const, label: "스타트업 & IR 관리", icon: <TrendingUp size={16} /> },
    { id: "categories" as const, label: "자연어 분야 인사이트", icon: <Sparkles size={16} /> },
    { id: "boards" as const, label: "게시판 관리", icon: <MessageSquare size={16} /> },
    { id: "payments" as const, label: "결제 관리", icon: <DollarSign size={16} /> },
    { id: "crm" as const, label: "알림/마케팅 CRM", icon: <Bell size={16} /> },
    { id: "common_codes" as const, label: "공통 코드 관리", icon: <Settings size={16} /> },
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

  const filteredProjects = adminProjects.filter(p => {
    const matchSearch = p.teamName.toLowerCase().includes(lcSearch) || p.title.toLowerCase().includes(lcSearch) || p.field.toLowerCase().includes(lcSearch);
    const matchSub = irSubFilter === "all" ? true : irSubFilter === "stealth" ? p.isAnonymous : p.isHiring;
    return matchSearch && matchSub;
  });
  const totalProjectPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredCategories = adminCategoryInsights.filter(c => c.category.toLowerCase().includes(lcSearch));
  const totalCategoryPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

                {/* AI & Reverse Proposal KPI Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-purple-900/20 to-brand-card border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-purple-300 font-semibold flex items-center gap-1.5">
                        <BookOpen size={13} /> 수강생 개강 요청 매칭률
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                        {stats.courseMatchRate || 75}%
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white mt-1">
                      {stats.courseRequestCount || 8}<span className="text-xs text-brand-on-surface-variant font-normal ml-1">건 요청</span>
                    </p>
                    <p className="text-[10px] text-brand-on-surface-variant mt-1">공감 투표 기반 강사 커리큘럼 승격</p>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-900/20 to-brand-card border border-cyan-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-cyan-300 font-semibold flex items-center gap-1.5">
                        <TrendingUp size={13} /> 아이디어 의뢰 ➔ IR 승격률
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                        {stats.builderMatchRate || 68}%
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white mt-1">
                      {stats.ideaRequestCount || 12}<span className="text-xs text-brand-on-surface-variant font-normal ml-1">건 발제</span>
                    </p>
                    <p className="text-[10px] text-brand-on-surface-variant mt-1">빌더 팀 MVP 제작 수락 및 IR 전환</p>
                  </div>

                  <div className="bg-gradient-to-br from-brand-primary/20 to-brand-card border border-brand-primary/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-brand-primary font-semibold flex items-center gap-1.5">
                        <Sparkles size={13} /> AI 자동 채우기 활용량
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary font-bold">
                        99.8% 성공
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white mt-1">
                      {stats.aiAutoFillCount || 146}<span className="text-xs text-brand-on-surface-variant font-normal ml-1">회 호출</span>
                    </p>
                    <p className="text-[10px] text-brand-on-surface-variant mt-1">자연어 분야 및 스마트 명칭 재조정</p>
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
                          <div className="w-20 shrink-0">
                            <select
                              value={
                                member.roles.includes("admin") && member.roles.includes("member")
                                  ? "admin,member"
                                  : member.roles.includes("admin")
                                  ? "admin"
                                  : "member"
                              }
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "admin,member") {
                                  onChangeRole(member.id, ["admin", "member"]);
                                } else {
                                  onChangeRole(member.id, [val as UserRole]);
                                }
                              }}
                              className="text-[9px] bg-brand-surface-low border border-brand-border rounded px-1.5 py-0.5 text-brand-on-surface-variant cursor-pointer focus:outline-none"
                            >
                              <option value="member">member</option>
                              <option value="admin">관리자</option>
                              <option value="admin,member">관리자+member</option>
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

            {/* ── 스타트업 & IR 관리 ── */}
            {activeTab === "startup" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp size={14} className="text-cyan-400" />
                      스타트업 IR 프로젝트 & 아이디어 의뢰 통합 검수
                    </h2>
                    <p className="text-xs text-brand-on-surface-variant mt-0.5">
                      등록된 스타트업 프로젝트, 스텔스 모드, 구인 공고 및 아이디어 의뢰 건을 검수하고 관리합니다.
                    </p>
                  </div>
                  <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full xl:w-auto shrink-0">
                    <div className="relative w-full xl:w-60">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                      <input
                        type="text"
                        placeholder="프로젝트, 팀명, 분야 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors w-full"
                      />
                    </div>
                    {totalProjectPages > 1 && (
                      <div className="ml-auto">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalProjectPages}
                          onPageChange={setCurrentPage}
                          totalItems={filteredProjects.length}
                          itemsPerPage={itemsPerPage}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub Filter */}
                <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-xl border border-brand-border/40 self-start">
                  <button
                    onClick={() => setIrSubFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      irSubFilter === "all" ? "bg-brand-primary-container text-white shadow-sm" : "text-brand-on-surface-variant hover:text-white"
                    }`}
                  >
                    전체 프로젝트 ({adminProjects.length})
                  </button>
                  <button
                    onClick={() => setIrSubFilter("stealth")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      irSubFilter === "stealth" ? "bg-brand-primary-container text-white shadow-sm" : "text-brand-on-surface-variant hover:text-white"
                    }`}
                  >
                    ⚡ 스텔스 모드 ({adminProjects.filter((p) => p.isAnonymous).length})
                  </button>
                  <button
                    onClick={() => setIrSubFilter("hiring")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      irSubFilter === "hiring" ? "bg-brand-primary-container text-white shadow-sm" : "text-brand-on-surface-variant hover:text-white"
                    }`}
                  >
                    채용 중 ({adminProjects.filter((p) => p.isHiring).length})
                  </button>
                </div>

                <div className="relative flex flex-col lg:flex-row gap-5 items-start">
                  <div className={`min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedPanelItem ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"}`}>
                    {dataLoading ? (
                      <div className="text-center py-12 text-white/50 text-xs">스타트업 데이터 로딩 중...</div>
                    ) : filteredProjects.length === 0 ? (
                      <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center shadow-md">
                        <CheckCircle size={32} className="text-brand-tertiary mx-auto mb-3" />
                        <p className="text-sm text-brand-on-surface-variant">일치하는 스타트업 프로젝트가 없습니다</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {paginatedProjects.map((project) => (
                          <div
                            key={project.id}
                            onClick={() => setSelectedPanelItem({ type: 'ir', data: project })}
                            className={`bg-brand-card border rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-sm ${
                              selectedPanelItem?.type === 'ir' && selectedPanelItem.data.id === project.id
                                ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/40 shadow-md"
                                : "border-brand-border/60 hover:bg-brand-surface-low"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-white truncate">{project.teamName}</span>
                                  {project.isAnonymous && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                      ⚡ 스텔스
                                    </span>
                                  )}
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-semibold">
                                    {project.field}
                                  </span>
                                </div>
                                <h3 className="text-xs font-semibold text-white/90 truncate">{project.title}</h3>
                                <p className="text-[10px] text-brand-on-surface-variant mt-0.5 truncate">{project.oneLiner}</p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-surface-low text-brand-on-surface-variant border border-brand-border/30 font-mono">
                                  {project.investmentStage}
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedPanelItem({ type: 'ir', data: project }); }}
                                  className="text-[10px] bg-brand-surface-low text-brand-on-surface-variant py-1 px-2.5 rounded-lg border border-brand-border/30 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Eye size={11} /> 검수
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {renderDetailPanel()}
                </div>
              </div>
            )}

            {/* ── 자연어 분야 & 카테고리 인사이트 ── */}
            {activeTab === "categories" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles size={14} className="text-brand-primary" />
                      자연어 산업 분야 & AI 생성 카테고리 인사이트
                    </h2>
                    <p className="text-xs text-brand-on-surface-variant mt-0.5">
                      플랫폼 내에서 AI와 사용자가 자율 생성한 자연어 카테고리 빈도수를 분석하고 프론트엔드 추천 칩에 매핑합니다.
                    </p>
                  </div>
                  <div className="relative w-full xl:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                    <input
                      type="text"
                      placeholder="카테고리명 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors w-full"
                    />
                  </div>
                </div>

                <div className="relative flex flex-col lg:flex-row gap-5 items-start">
                  <div className={`min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedPanelItem ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paginatedCategories.map((cat, idx) => (
                        <div
                          key={cat.category}
                          onClick={() => setSelectedPanelItem({ type: 'category', data: cat })}
                          className={`p-4 rounded-xl border transition-all cursor-pointer bg-brand-card shadow-sm ${
                            selectedPanelItem?.type === 'category' && selectedPanelItem.data.category === cat.category
                              ? "border-brand-primary bg-brand-primary-container/15 ring-1 ring-brand-primary/40 shadow-md"
                              : "border-brand-border/60 hover:bg-brand-surface-low"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className="text-[10px] text-brand-primary font-mono">#{idx + 1}</span>
                              {cat.category}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary font-bold">
                              {cat.count}건
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-brand-on-surface-variant pt-2 border-t border-brand-border/30">
                            <span>도메인: {cat.type}</span>
                            <span className="font-semibold text-amber-300">{cat.recentTrend}</span>
                          </div>
                        </div>
                      ))}
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

            {/* ──────── Common Codes Management Tab ──────── */}
            {activeTab === "common_codes" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-surface-low/60 p-5 rounded-2xl border border-brand-border/40">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                      <Settings className="text-brand-primary" size={20} />
                      공통 코드 관리 (Common Code Management)
                    </h3>
                    <p className="text-xs text-brand-on-surface-variant mt-1">
                      강의 카테고리, IR 분야, 결제/정산 등 시스템 전반의 공통 분류 코드를 무중단으로 관리하고 뱃지 색상을 설정합니다.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingGroup(null);
                        setShowGroupModal(true);
                      }}
                      className="px-3.5 py-2 bg-brand-surface-high hover:bg-brand-surface-highest text-white rounded-xl text-xs font-bold border border-brand-border/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} /> 새 그룹 추가
                    </button>
                    <button
                      onClick={() => {
                        setEditingCode(null);
                        setShowCodeModal(true);
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-lg shadow-brand-primary/20"
                    >
                      <Plus size={14} /> 새 코드 등록
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Code Groups List */}
                  <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-white">코드 그룹 목록 ({codeGroups.length})</span>
                    </div>

                    <div className="space-y-2">
                      {codeGroups.map((group) => {
                        const count = commonCodes.filter((c) => c.groupCode === group.groupCode).length;
                        const isSelected = selectedGroupCode === group.groupCode;
                        return (
                          <div
                            key={group.groupCode}
                            onClick={() => setSelectedGroupCode(group.groupCode)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-brand-primary-container/20 border-brand-primary text-white shadow-md"
                                : "bg-brand-card border-brand-border/40 hover:border-brand-border text-brand-on-surface-variant hover:bg-brand-surface-low"
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-bold truncate ${isSelected ? "text-brand-primary" : "text-white"}`}>
                                  {group.groupName}
                                </span>
                                {group.isSystem && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    시스템
                                  </span>
                                )}
                                {!group.isActive && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                                    비활성
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-mono text-brand-on-surface-variant/80 mt-1 truncate">
                                {group.groupCode}
                              </p>
                              {group.description && (
                                <p className="text-[10px] text-brand-on-surface-variant/70 mt-0.5 truncate">
                                  {group.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-surface-high font-mono text-white/80 font-bold">
                                {count}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingGroup(group);
                                  setShowGroupModal(true);
                                }}
                                className="p-1.5 hover:text-brand-primary hover:bg-brand-surface-high rounded-lg transition-colors cursor-pointer text-brand-on-surface-variant"
                                title="그룹 수정"
                              >
                                <Edit size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Codes Table */}
                  <div className="lg:col-span-8 space-y-3">
                    {(() => {
                      const currentGroup = codeGroups.find((g) => g.groupCode === selectedGroupCode);
                      const currentCodes = commonCodes
                        .filter((c) => c.groupCode === selectedGroupCode)
                        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

                      return (
                        <div className="bg-brand-card border border-brand-border/60 rounded-2xl p-5 shadow-sm space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-brand-border/40">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-display text-base font-bold text-white">
                                  {currentGroup?.groupName || selectedGroupCode}
                                </h4>
                                <span className="text-xs font-mono text-brand-primary">[{selectedGroupCode}]</span>
                              </div>
                              <p className="text-xs text-brand-on-surface-variant mt-0.5">
                                {currentGroup?.description || "그룹 설명이 없습니다."}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                setEditingCode(null);
                                setShowCodeModal(true);
                              }}
                              className="px-3 py-1.5 bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 border border-brand-primary/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={13} /> 이 그룹에 코드 추가
                            </button>
                          </div>

                          {currentCodes.length === 0 ? (
                            <div className="text-center py-12 text-brand-on-surface-variant text-xs">
                              등록된 공통 코드가 없습니다. 새 코드를 등록해보세요.
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs text-brand-on-surface-variant">
                                <thead>
                                  <tr className="border-b border-brand-border/40 text-brand-on-surface-variant/80">
                                    <th className="py-2.5 px-3 font-semibold w-12 text-center">순서</th>
                                    <th className="py-2.5 px-3 font-semibold">코드 키</th>
                                    <th className="py-2.5 px-3 font-semibold">코드명 / 표시명</th>
                                    <th className="py-2.5 px-3 font-semibold">뱃지 미리보기</th>
                                    <th className="py-2.5 px-3 font-semibold text-center">상태</th>
                                    <th className="py-2.5 px-3 font-semibold text-right">관리</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/20">
                                  {currentCodes.map((codeItem) => {
                                    const badgeColor =
                                      (codeItem.extraValue as any)?.badgeColor ||
                                      (codeItem.extraValue as any)?.tagColor ||
                                      "blue";

                                    const getBadgeStyle = (color: string) => {
                                      switch (color) {
                                        case "amber": return "bg-amber-500/20 text-amber-300 border-amber-500/40";
                                        case "emerald": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                                        case "blue": return "bg-blue-500/20 text-blue-300 border-blue-500/40";
                                        case "purple": return "bg-purple-500/20 text-purple-300 border-purple-500/40";
                                        case "teal": return "bg-teal-500/20 text-teal-300 border-teal-500/40";
                                        case "rose": return "bg-rose-500/20 text-rose-300 border-rose-500/40";
                                        case "cyan": return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
                                        case "yellow": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
                                        case "slate": return "bg-slate-500/20 text-slate-300 border-slate-500/40";
                                        default: return "bg-brand-primary/20 text-brand-primary border-brand-primary/30";
                                      }
                                    };

                                    return (
                                      <tr key={codeItem.id} className="hover:bg-brand-surface-low/50 transition-colors">
                                        <td className="py-3 px-3 text-center font-mono font-bold text-white/80">
                                          {codeItem.sortOrder}
                                        </td>
                                        <td className="py-3 px-3 font-mono font-semibold text-white">
                                          {codeItem.code}
                                        </td>
                                        <td className="py-3 px-3">
                                          <div className="font-semibold text-white">{codeItem.displayName || codeItem.codeName}</div>
                                          {codeItem.codeName !== codeItem.displayName && (
                                            <div className="text-[10px] text-brand-on-surface-variant/70 font-mono">기본: {codeItem.codeName}</div>
                                          )}
                                        </td>
                                        <td className="py-3 px-3">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${getBadgeStyle(badgeColor)}`}>
                                            {codeItem.displayName || codeItem.codeName}
                                          </span>
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                          <button
                                            onClick={async () => {
                                              try {
                                                const updated = await api.updateCommonCode(codeItem.id, { isActive: !codeItem.isActive });
                                                setCommonCodes((prev) => prev.map((c) => (c.id === codeItem.id ? updated.code : c)));
                                                clearCommonCodesCache();
                                                toast.success("상태 변경 완료", `[${codeItem.code}] 상태가 변경되었습니다.`);
                                              } catch (e) {
                                                toast.error("상태 변경 실패", "오류가 발생했습니다.");
                                              }
                                            }}
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                                              codeItem.isActive ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
                                            }`}
                                          >
                                            {codeItem.isActive ? "사용중" : "미사용"}
                                          </button>
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                          <div className="flex items-center justify-end gap-1.5">
                                            <button
                                              onClick={() => {
                                                setEditingCode(codeItem);
                                                setShowCodeModal(true);
                                              }}
                                              className="p-1 hover:text-brand-primary hover:bg-brand-surface-high rounded-lg transition-colors cursor-pointer text-brand-on-surface-variant"
                                              title="수정"
                                            >
                                              <Edit size={14} />
                                            </button>
                                            <button
                                              onClick={async () => {
                                                if (codeItem.isSystem) {
                                                  toast.warning("삭제 불가", "시스템 필수 코드는 삭제할 수 없습니다. 비활성화를 이용해주세요.");
                                                  return;
                                                }
                                                const ok = await toast.confirm({
                                                  title: "공통 코드 삭제",
                                                  message: `[${codeItem.codeName}] 코드를 정말 삭제하시겠습니까?`,
                                                  confirmText: "삭제",
                                                  cancelText: "취소",
                                                  type: "danger",
                                                });
                                                if (!ok) return;
                                                try {
                                                  await api.deleteCommonCode(codeItem.id);
                                                  setCommonCodes((prev) => prev.filter((c) => c.id !== codeItem.id));
                                                  clearCommonCodesCache();
                                                  toast.success("코드 삭제 완료", `[${codeItem.codeName}] 코드가 삭제되었습니다.`);
                                                } catch (err: any) {
                                                  toast.error("삭제 실패", err?.message || "오류가 발생했습니다.");
                                                }
                                              }}
                                              disabled={codeItem.isSystem}
                                              className={`p-1 rounded-lg transition-colors ${
                                                codeItem.isSystem
                                                  ? "opacity-30 cursor-not-allowed text-brand-on-surface-variant"
                                                  : "hover:text-red-400 hover:bg-brand-surface-high cursor-pointer text-brand-on-surface-variant"
                                              }`}
                                              title={codeItem.isSystem ? "시스템 필수 코드 (삭제 불가)" : "삭제"}
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* ──────── Code Create / Edit Modal ──────── */}
            {showCodeModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
                <div className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-brand-border/60">
                  <div className="flex justify-between items-center pb-2 border-b border-brand-border/40">
                    <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-brand-primary" />
                      {editingCode ? "공통 코드 수정" : "신규 공통 코드 등록"}
                    </h3>
                    <button
                      onClick={() => setShowCodeModal(false)}
                      className="text-brand-on-surface-variant hover:text-white p-1 rounded-lg cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const formData = new FormData(form);
                      const groupCode = (formData.get("groupCode") as string) || selectedGroupCode;
                      const code = (formData.get("code") as string).trim().toUpperCase();
                      const codeName = (formData.get("codeName") as string).trim();
                      const displayName = (formData.get("displayName") as string).trim() || codeName;
                      const sortOrder = Number(formData.get("sortOrder")) || 1;
                      const badgeColor = (formData.get("badgeColor") as string) || "blue";
                      const isActive = formData.get("isActive") === "on";

                      try {
                        if (editingCode) {
                          const updated = await api.updateCommonCode(editingCode.id, {
                            codeName,
                            displayName,
                            sortOrder,
                            extraValue: { ...((editingCode.extraValue as any) || {}), badgeColor },
                            isActive,
                          });
                          setCommonCodes((prev) => prev.map((c) => (c.id === editingCode.id ? updated.code : c)));
                          toast.success("코드 수정 완료", `[${displayName}] 코드가 수정되었습니다.`);
                        } else {
                          const created = await api.createCommonCode({
                            groupCode,
                            code,
                            codeName,
                            displayName,
                            sortOrder,
                            extraValue: { badgeColor },
                            isActive,
                            isSystem: false,
                          });
                          setCommonCodes((prev) => [...prev, created.code]);
                          toast.success("코드 등록 완료", `[${displayName}] 코드가 새로 등록되었습니다.`);
                        }
                        clearCommonCodesCache();
                        setShowCodeModal(false);
                      } catch (err: any) {
                        toast.error("저장 실패", err?.message || "코드 저장 중 오류가 발생했습니다.");
                      }
                    }}
                    className="space-y-3.5 text-xs"
                  >
                    <div>
                      <label className="text-white font-semibold block mb-1">소속 코드 그룹</label>
                      <input
                        type="text"
                        name="groupCode"
                        defaultValue={editingCode ? editingCode.groupCode : selectedGroupCode}
                        disabled={Boolean(editingCode)}
                        className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none disabled:opacity-60"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-white font-semibold block mb-1">코드 키 (Code Key)</label>
                      <input
                        type="text"
                        name="code"
                        placeholder="예: AI_MODEL, FULL_TIME"
                        defaultValue={editingCode?.code || ""}
                        disabled={Boolean(editingCode)}
                        className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-brand-primary disabled:opacity-60 uppercase"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-white font-semibold block mb-1">기본 코드명</label>
                        <input
                          type="text"
                          name="codeName"
                          placeholder="예: AI 모델링"
                          defaultValue={editingCode?.codeName || ""}
                          className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-white font-semibold block mb-1">화면 표시명 (Label)</label>
                        <input
                          type="text"
                          name="displayName"
                          placeholder="예: AI 모델링 & LLM"
                          defaultValue={editingCode?.displayName || ""}
                          className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-white font-semibold block mb-1">정렬 순서</label>
                        <input
                          type="number"
                          name="sortOrder"
                          defaultValue={editingCode?.sortOrder || 1}
                          min={1}
                          className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="text-white font-semibold block mb-1">뱃지 색상 테마</label>
                        <select
                          name="badgeColor"
                          defaultValue={(editingCode?.extraValue as any)?.badgeColor || "blue"}
                          className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="blue" className="bg-brand-surface">블루 (Blue)</option>
                          <option value="purple" className="bg-brand-surface">퍼플 (Purple)</option>
                          <option value="emerald" className="bg-brand-surface">에메랄드 (Emerald)</option>
                          <option value="amber" className="bg-brand-surface">앰버/오렌지 (Amber)</option>
                          <option value="rose" className="bg-brand-surface">로즈/레드 (Rose)</option>
                          <option value="teal" className="bg-brand-surface">틸/청록 (Teal)</option>
                          <option value="cyan" className="bg-brand-surface">시안 (Cyan)</option>
                          <option value="yellow" className="bg-brand-surface">옐로우 (Yellow)</option>
                          <option value="slate" className="bg-brand-surface">슬레이트/그레이 (Slate)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="isActiveCheck"
                        name="isActive"
                        defaultChecked={editingCode ? editingCode.isActive : true}
                        className="rounded border-brand-border text-brand-primary focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="isActiveCheck" className="text-white font-medium cursor-pointer select-none">
                        화면 노출 활성화 (Active)
                      </label>
                    </div>

                    <div className="flex gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowCodeModal(false)}
                        className="flex-1 py-2.5 border border-brand-border text-white rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-xs"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs"
                      >
                        저장
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ──────── Group Create / Edit Modal ──────── */}
            {showGroupModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
                <div className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-brand-border/60">
                  <div className="flex justify-between items-center pb-2 border-b border-brand-border/40">
                    <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                      <Settings size={16} className="text-brand-primary" />
                      {editingGroup ? "코드 그룹 수정" : "신규 코드 그룹 생성"}
                    </h3>
                    <button
                      onClick={() => setShowGroupModal(false)}
                      className="text-brand-on-surface-variant hover:text-white p-1 rounded-lg cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const formData = new FormData(form);
                      const groupCode = (formData.get("groupCode") as string).trim().toUpperCase();
                      const groupName = (formData.get("groupName") as string).trim();
                      const description = (formData.get("description") as string).trim();
                      const isActive = formData.get("isActive") === "on";

                      try {
                        if (editingGroup) {
                          const updated = await api.updateCodeGroup(editingGroup.groupCode, {
                            groupName,
                            description,
                            isActive,
                          });
                          setCodeGroups((prev) =>
                            prev.map((g) => (g.groupCode === editingGroup.groupCode ? updated.group : g))
                          );
                          toast.success("그룹 수정 완료", `[${groupName}] 그룹 정보가 수정되었습니다.`);
                        } else {
                          const created = await api.createCodeGroup({
                            groupCode,
                            groupName,
                            description,
                            isActive,
                            isSystem: false,
                          });
                          setCodeGroups((prev) => [...prev, created.group]);
                          setSelectedGroupCode(created.group.groupCode);
                          toast.success("그룹 생성 완료", `[${groupName}] 그룹이 생성되었습니다.`);
                        }
                        setShowGroupModal(false);
                      } catch (err: any) {
                        toast.error("저장 실패", err?.message || "그룹 저장 중 오류가 발생했습니다.");
                      }
                    }}
                    className="space-y-3.5 text-xs"
                  >
                    <div>
                      <label className="text-white font-semibold block mb-1">그룹 코드 (Group Code)</label>
                      <input
                        type="text"
                        name="groupCode"
                        placeholder="예: COURSE_FORMAT, NOTIFICATION_TYPE"
                        defaultValue={editingGroup?.groupCode || ""}
                        disabled={Boolean(editingGroup)}
                        className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-brand-primary disabled:opacity-60 uppercase"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-white font-semibold block mb-1">그룹명 (Group Name)</label>
                      <input
                        type="text"
                        name="groupName"
                        placeholder="예: 강의 수업 방식, 알림 유형"
                        defaultValue={editingGroup?.groupName || ""}
                        className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-white font-semibold block mb-1">그룹 설명</label>
                      <textarea
                        name="description"
                        placeholder="이 코드 그룹의 용도와 설명을 입력하세요."
                        defaultValue={editingGroup?.description || ""}
                        className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-3 text-white text-xs focus:outline-none focus:border-brand-primary h-20 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="isGroupActiveCheck"
                        name="isActive"
                        defaultChecked={editingGroup ? editingGroup.isActive : true}
                        className="rounded border-brand-border text-brand-primary focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="isGroupActiveCheck" className="text-white font-medium cursor-pointer select-none">
                        그룹 활성화 (Active)
                      </label>
                    </div>

                    <div className="flex gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowGroupModal(false)}
                        className="flex-1 py-2.5 border border-brand-border text-white rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-xs"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs"
                      >
                        저장
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Create Board Modal */}
            <AdminBoardCreateModal
              isOpen={showCreateBoardModal}
              onClose={() => setShowCreateBoardModal(false)}
              onSuccess={(newBoard) => {
                setLocalBoards((prev) => [newBoard, ...prev]);
                if (onBoardCreated) onBoardCreated(newBoard);
                if (onRefresh) onRefresh();
                toast.success("게시판 생성 완료", `"${newBoard.name}" 게시판이 성공적으로 생성되었습니다.`);
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
                        onClick={() => {
                          setShowBroadcastModal(false);
                          toast.success("공지 발송 완료", "선택된 대상에게 공지가 성공적으로 발송되었습니다.");
                        }}
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
