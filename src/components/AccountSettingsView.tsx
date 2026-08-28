import React from "react";
import {
  User,
  CreditCard,
  Receipt,
  Bell,
  MessageSquare,
  CheckCircle,
  Edit3,
  Save,
  Shield,
  Clock,
  Sparkles,
  RotateCcw,
  Search,
  X,
  Moon,
  PauseCircle,
  PlayCircle,
  Eye,
  ExternalLink,
  Sliders,
  Mail,
  Smartphone,
  Layers,
} from "lucide-react";
import type {
  PaymentRecord,
  Notification,
  UserRole,
  NotificationPreference,
  NotificationCategory,
  NotificationChannel,
  NotificationTemplate,
} from "../types";
import PaymentReceiptModal from "./PaymentReceiptModal";
import Pagination from "./common/Pagination";
import { api } from "../lib/api";

interface AccountSettingsViewProps {
  userName: string;
  userRoles: UserRole[];
  payments: PaymentRecord[];
  notifications: Notification[];
  onRefundPayment: (updatedPayment: PaymentRecord) => void;
  onNavigate?: (url: string) => void;
}

export default function AccountSettingsView({
  userName,
  userRoles,
  payments,
  notifications,
  onRefundPayment,
  onNavigate,
}: AccountSettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<"payments" | "notifications" | "preferences" | "profile">("payments");
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentRecord | null>(null);
  const [isClosingPayment, setIsClosingPayment] = React.useState(false);

  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null);
  const [isClosingNotification, setIsClosingNotification] = React.useState(false);

  // ── 알림 수신 설정 (Preference Center) State ──
  const [preferences, setPreferences] = React.useState<NotificationPreference | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = React.useState(false);
  const [prefsSavedMessage, setPrefsSavedMessage] = React.useState("");

  // ── 이메일 미리보기 모달 State ──
  const [showEmailPreviewModal, setShowEmailPreviewModal] = React.useState(false);
  const [previewTemplateCode, setPreviewTemplateCode] = React.useState("TEAM_PROPOSAL_RECEIVED");
  const [previewHtml, setPreviewHtml] = React.useState<string>("");
  const [templates, setTemplates] = React.useState<NotificationTemplate[]>([]);

  // Preferences 로드
  const loadPreferences = async () => {
    try {
      const res = await api.getNotificationPreferences();
      if (res?.preferences) {
        setPreferences(res.preferences);
      }
    } catch (err) {
      console.error("Failed to load preferences:", err);
    }
  };

  // Templates 로드
  const loadTemplates = async () => {
    try {
      const res = await api.getNotificationTemplates();
      if (res?.templates) {
        setTemplates(res.templates);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  };

  React.useEffect(() => {
    loadPreferences();
    loadTemplates();
  }, []);

  // ESC key listener to close detail panel
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedPayment) handleClosePaymentDetail();
        if (selectedNotification) handleCloseNotificationDetail();
        if (showEmailPreviewModal) setShowEmailPreviewModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPayment, selectedNotification, showEmailPreviewModal]);

  const handleClosePaymentDetail = () => {
    setIsClosingPayment(true);
    setTimeout(() => {
      setSelectedPayment(null);
      setIsClosingPayment(false);
    }, 300);
  };

  const handleCloseNotificationDetail = () => {
    setIsClosingNotification(true);
    setTimeout(() => {
      setSelectedNotification(null);
      setIsClosingNotification(false);
    }, 300);
  };

  const handlePaymentClick = (p: PaymentRecord) => {
    if (selectedPayment?.id === p.id) {
      handleClosePaymentDetail();
    } else {
      setSelectedPayment(p);
      setIsClosingPayment(false);
    }
  };

  const handleNotificationClick = (msg: Notification) => {
    if (selectedNotification?.id === msg.id) {
      handleCloseNotificationDetail();
    } else {
      setSelectedNotification(msg);
      setIsClosingNotification(false);
      msg.isRead = true;
      api.markNotificationRead(msg.id).catch(() => {});
    }
  };

  // 스마트 딥링크 이동 핸들러
  const handleActionClick = (targetUrl?: string) => {
    if (!targetUrl) return;
    if (onNavigate) {
      onNavigate(targetUrl);
    } else {
      window.location.href = targetUrl;
    }
  };

  // ── Preferences 변경 핸들러 ──
  const handleCategoryChannelToggle = (
    catKey: keyof NotificationPreference["categories"],
    channel: NotificationChannel
  ) => {
    if (!preferences) return;
    const currentCat = preferences.categories[catKey];
    const updated = {
      ...preferences,
      categories: {
        ...preferences.categories,
        [catKey]: {
          ...currentCat,
          [channel]: !currentCat[channel],
        },
      },
    };
    setPreferences(updated);
    savePreferences(updated);
  };

  const handleToggleQuietHours = () => {
    if (!preferences) return;
    const updated = {
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        enabled: !preferences.quietHours.enabled,
      },
    };
    setPreferences(updated);
    savePreferences(updated);
  };

  const handleQuietHoursChange = (field: "start" | "end", value: string) => {
    if (!preferences) return;
    const updated = {
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        [field]: value,
      },
    };
    setPreferences(updated);
    savePreferences(updated);
  };

  const handleSnooze = async (days = 30) => {
    try {
      setIsSavingPrefs(true);
      const res = await api.snoozeNotifications(days);
      if (res?.preferences) {
        setPreferences(res.preferences);
        setPrefsSavedMessage(`🔔 ${days}일간 모든 알림이 일시 중지되었습니다.`);
        setTimeout(() => setPrefsSavedMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleUnsnooze = async () => {
    try {
      setIsSavingPrefs(true);
      const res = await api.unsnoozeNotifications();
      if (res?.preferences) {
        setPreferences(res.preferences);
        setPrefsSavedMessage("🔔 알림 일시 중지가 정상적으로 해제되었습니다.");
        setTimeout(() => setPrefsSavedMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const savePreferences = async (newPrefs: NotificationPreference) => {
    setIsSavingPrefs(true);
    try {
      const res = await api.updateNotificationPreferences(newPrefs);
      if (res?.preferences) {
        setPreferences(res.preferences);
        setPrefsSavedMessage("설정이 저장되었습니다.");
        setTimeout(() => setPrefsSavedMessage(""), 2000);
      }
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // ── 이메일 미리보기 렌더링 ──
  const handleOpenEmailPreview = async (templateCode = "TEAM_PROPOSAL_RECEIVED") => {
    setPreviewTemplateCode(templateCode);
    setShowEmailPreviewModal(true);
    try {
      const res = await api.previewEmailTemplate({
        title:
          templateCode === "TEAM_PROPOSAL_RECEIVED"
            ? "🤝 [팀 합류 제안] React/Node.js 역량을 보유한 빌더가 합류를 제안했습니다"
            : templateCode === "COURSE_D1_REMINDER"
            ? "[D-1] 내일 19:30 AI 프로덕트 매니저 부트캠프 라이브 세션이 시작됩니다!"
            : templateCode === "INVESTMENT_PROPOSAL_RECEIVED"
            ? "💼 [투자 제안] 전문 투자자로부터 DocuMind AI 미팅 제안이 도착했습니다"
            : "💬 회원님의 게시글에 새로운 의견이 등록되었습니다",
        message:
          templateCode === "TEAM_PROPOSAL_RECEIVED"
            ? "스타트업 IR 덱을 보고 비전에 깊이 공감하여 프론트엔드 포지션으로 합류를 제안했습니다.\n\n📌 상세 포트폴리오와 희망 조건은 플랫폼 워크스페이스에서 확인하고 48시간 이내에 수락 여부를 결정해 주세요."
            : templateCode === "COURSE_D1_REMINDER"
            ? "안녕하세요 김수강생님! 신청하신 강의 1회차가 내일 19:30에 실시간 Zoom으로 시작됩니다.\n원활한 수강을 위해 사전 환경 세팅과 실습 자료를 미리 확인해 보세요."
            : "새로운 소식이 등록되었습니다. 플랫폼에서 자세한 내용을 확인하세요.",
        targetUrl: templateCode === "COURSE_D1_REMINDER" ? "/courses?courseId=c1" : "/mypage?tab=startup",
        actionLabel: templateCode === "COURSE_D1_REMINDER" ? "강의실 바로가기" : "제안서 열람 및 응답하기",
        category: "team",
        userName,
      });
      setPreviewHtml(res.html);
    } catch (err) {
      console.error("Failed to preview email:", err);
    }
  };

  // SubTab 1: Payments Search, Filter & Pagination
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<"all" | "완료" | "환불">("all");
  const [searchPayment, setSearchPayment] = React.useState("");
  const [paymentPage, setPaymentPage] = React.useState(1);
  const paymentItemsPerPage = 6;

  // SubTab 2: Notifications Search, Filter & Pagination
  const [notificationFilter, setNotificationFilter] = React.useState<"all" | "unread" | "instructor" | "system">("all");
  const [searchNotification, setSearchNotification] = React.useState("");
  const [notificationPage, setNotificationPage] = React.useState(1);
  const notificationItemsPerPage = 6;

  // Profile Edit States
  const [isEditing, setIsEditing] = React.useState(false);
  const [displayName, setDisplayName] = React.useState(userName);
  const [bio, setBio] = React.useState("AI로 창업을 준비 중인 기업가입니다.");
  const [saved, setSaved] = React.useState(false);

  const handleSaveProfile = () => {
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchStatus = paymentStatusFilter === "all" ? true : p.status === paymentStatusFilter;
    const query = searchPayment.toLowerCase().trim();
    const matchSearch =
      query === "" ||
      p.courseTitle.toLowerCase().includes(query) ||
      p.date.toLowerCase().includes(query) ||
      p.amount.toString().includes(query);
    return matchStatus && matchSearch;
  });
  const paymentTotalPages = Math.ceil(filteredPayments.length / paymentItemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (paymentPage - 1) * paymentItemsPerPage,
    paymentPage * paymentItemsPerPage
  );
  React.useEffect(() => {
    setPaymentPage(1);
  }, [paymentStatusFilter, searchPayment]);

  // Filtered Notifications
  const filteredNotifications = notifications.filter((n) => {
    const matchFilter =
      notificationFilter === "all"
        ? true
        : notificationFilter === "unread"
        ? !n.isRead
        : notificationFilter === "instructor"
        ? n.type === "instructor_msg" || n.type === "course"
        : n.type === "system" || n.type === "team" || n.type === "investor" || n.type === "community";
    const query = searchNotification.toLowerCase().trim();
    const matchSearch =
      query === "" ||
      n.title.toLowerCase().includes(query) ||
      n.message.toLowerCase().includes(query) ||
      (n.courseTitle && n.courseTitle.toLowerCase().includes(query));
    return matchFilter && matchSearch;
  });
  const notificationTotalPages = Math.ceil(filteredNotifications.length / notificationItemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (notificationPage - 1) * notificationItemsPerPage,
    notificationPage * notificationItemsPerPage
  );
  React.useEffect(() => {
    setNotificationPage(1);
  }, [notificationFilter, searchNotification]);

  const isSnoozedActive =
    preferences?.snoozeUntil && new Date(preferences.snoozeUntil) > new Date();

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <CreditCard size={20} className="text-brand-tertiary" /> 결제 및 계정 설정
          </h2>
          <p className="text-xs text-brand-on-surface-variant mt-1">
            결제 영수증 조회, 알림 수신 & 스팸 방지 설정, 수신된 메시지 및 프로필을 관리하세요
          </p>
        </div>

        {prefsSavedMessage && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold animate-fadeIn flex items-center gap-1.5">
            <CheckCircle size={14} /> {prefsSavedMessage}
          </div>
        )}
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-brand-border/40 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("payments")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "payments"
              ? "text-brand-primary border-b-2 border-brand-primary tab-active"
              : "text-brand-on-surface-variant hover:text-white"
          }`}
        >
          <Receipt size={14} /> 결제 및 영수증 관리 ({payments.length})
        </button>
        <button
          onClick={() => setActiveSubTab("notifications")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "notifications"
              ? "text-brand-primary border-b-2 border-brand-primary tab-active"
              : "text-brand-on-surface-variant hover:text-white"
          }`}
        >
          <Bell size={14} /> 수신 알림 보관함 ({notifications.filter((n) => !n.isRead).length}개 안읽음)
        </button>
        <button
          onClick={() => setActiveSubTab("preferences")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "preferences"
              ? "text-brand-primary border-b-2 border-brand-primary tab-active"
              : "text-brand-on-surface-variant hover:text-white"
          }`}
        >
          <Shield size={14} className="text-amber-400" /> 알림 수신 & 스팸 방지 설정
        </button>
        <button
          onClick={() => setActiveSubTab("profile")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "profile"
              ? "text-brand-primary border-b-2 border-brand-primary tab-active"
              : "text-brand-on-surface-variant hover:text-white"
          }`}
        >
          <User size={14} /> 프로필 & 연동 설정
        </button>
      </div>

      {/* ── SubTab 1: 결제 및 영수증 관리 ── */}
      {activeSubTab === "payments" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-xl border border-brand-border/40 self-start overflow-x-auto max-w-full">
              <button
                onClick={() => setPaymentStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  paymentStatusFilter === "all"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                전체 ({payments.length})
              </button>
              <button
                onClick={() => setPaymentStatusFilter("완료")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  paymentStatusFilter === "완료"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                결제 완료 ({payments.filter((p) => p.status === "완료").length})
              </button>
              <button
                onClick={() => setPaymentStatusFilter("환불")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  paymentStatusFilter === "환불"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                환불 완료 ({payments.filter((p) => p.status === "환불").length})
              </button>
            </div>

            <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full sm:w-auto shrink-0">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                <input
                  type="text"
                  placeholder="강의명, 일자, 금액 검색..."
                  value={searchPayment}
                  onChange={(e) => setSearchPayment(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-8 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors"
                />
                {searchPayment && (
                  <button
                    onClick={() => setSearchPayment("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant hover:text-white cursor-pointer"
                    title="검색어 지우기"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {paymentTotalPages > 1 && (
                <div className="ml-auto">
                  <Pagination
                    currentPage={paymentPage}
                    totalPages={paymentTotalPages}
                    onPageChange={setPaymentPage}
                    totalItems={filteredPayments.length}
                    itemsPerPage={paymentItemsPerPage}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="relative flex flex-col lg:flex-row gap-5 items-start">
            <div
              className={`min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                selectedPayment ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="hidden sm:flex items-center justify-between px-4 py-2 text-[11px] font-bold text-brand-on-surface-variant uppercase tracking-wider bg-brand-surface-low/60 rounded-lg border border-brand-border/30">
                  <span className="w-24">결제일시</span>
                  <span className="flex-1 px-4">강의명</span>
                  <span className="w-28 text-right">결제금액</span>
                  <span className="w-20 text-center">결제수단</span>
                  <span className="w-16 text-center">상태</span>
                  <span className="w-24 text-right">액션</span>
                </div>

                {payments.length === 0 ? (
                  <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center shadow-md">
                    <p className="text-xs text-brand-on-surface-variant">결제 내역이 없습니다.</p>
                  </div>
                ) : filteredPayments.length === 0 ? (
                  <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center shadow-md">
                    <p className="text-xs text-brand-on-surface-variant">일치하는 결제 내역이 없습니다.</p>
                    <button
                      onClick={() => {
                        setPaymentStatusFilter("all");
                        setSearchPayment("");
                      }}
                      className="mt-3 px-3.5 py-1.5 rounded-lg bg-brand-surface-high border border-brand-border text-white text-xs font-semibold hover:bg-brand-surface-highest transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={12} /> 조건 초기화
                    </button>
                  </div>
                ) : (
                  paginatedPayments.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handlePaymentClick(p)}
                      className={`bg-brand-card border rounded-xl p-3.5 sm:px-4 sm:py-3 shadow-md transition-all duration-200 cursor-pointer ${
                        selectedPayment?.id === p.id
                          ? "border-brand-primary bg-brand-primary-container/15 ring-1 ring-brand-primary/40 shadow-md"
                          : "border-brand-border/60 hover:border-brand-border hover:bg-brand-surface-low"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="w-24 text-brand-on-surface-variant font-mono text-[11px]">
                          {p.date}
                        </span>
                        <span className="flex-1 sm:px-4 font-bold text-white truncate">
                          {p.courseTitle}
                        </span>
                        <span className="w-28 sm:text-right font-mono font-bold text-white">
                          {p.amount.toLocaleString()}원
                        </span>
                        <span className="w-20 sm:text-center text-[11px] text-brand-on-surface-variant">
                          {p.method}
                        </span>
                        <span className="w-14 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.status === "완료"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/15 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {p.status}
                          </span>
                        </span>
                        <span className="w-24 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePaymentClick(p);
                            }}
                            className="text-[11px] px-3 py-1 rounded-lg bg-brand-surface-high hover:bg-brand-surface-highest text-white border border-brand-border/50 transition-colors cursor-pointer inline-flex items-center gap-1 font-medium shadow-sm"
                          >
                            <Receipt size={12} /> 영수증
                          </button>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Side: Payment Receipt Detail Panel */}
            {selectedPayment && (
              <div
                className={`w-full lg:w-[48%] xl:w-[45%] flex-shrink-0 sticky top-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isClosingPayment ? "opacity-0 translate-x-8 scale-[0.98]" : "animate-slideInFromRight"
                }`}
              >
                <PaymentReceiptModal
                  inline
                  key={selectedPayment.id}
                  payment={selectedPayment}
                  onClose={handleClosePaymentDetail}
                  onRefundCompleted={(updated) => {
                    onRefundPayment(updated);
                    setSelectedPayment(updated);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SubTab 2: 수신 알림 보관함 (스마트 딥링크 적용) ── */}
      {activeSubTab === "notifications" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-xl border border-brand-border/40 self-start overflow-x-auto max-w-full">
              <button
                onClick={() => setNotificationFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  notificationFilter === "all"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                전체 ({notifications.length})
              </button>
              <button
                onClick={() => setNotificationFilter("unread")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  notificationFilter === "unread"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                안읽음 ({notifications.filter((n) => !n.isRead).length})
              </button>
              <button
                onClick={() => setNotificationFilter("instructor")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  notificationFilter === "instructor"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                강사 피드백 ({notifications.filter((n) => n.type === "instructor_msg" || n.type === "course").length})
              </button>
              <button
                onClick={() => setNotificationFilter("system")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  notificationFilter === "system"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                시스템/제안 ({notifications.filter((n) => n.type !== "instructor_msg" && n.type !== "course").length})
              </button>
            </div>

            <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full sm:w-auto shrink-0">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                <input
                  type="text"
                  placeholder="알림 제목, 내용 검색..."
                  value={searchNotification}
                  onChange={(e) => setSearchNotification(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-8 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors"
                />
                {searchNotification && (
                  <button
                    onClick={() => setSearchNotification("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant hover:text-white cursor-pointer"
                    title="검색어 지우기"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {notificationTotalPages > 1 && (
                <div className="ml-auto">
                  <Pagination
                    currentPage={notificationPage}
                    totalPages={notificationTotalPages}
                    onPageChange={setNotificationPage}
                    totalItems={filteredNotifications.length}
                    itemsPerPage={notificationItemsPerPage}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="relative flex flex-col lg:flex-row gap-5 items-start">
            <div
              className={`min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                selectedNotification ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"
              }`}
            >
              {notifications.length === 0 ? (
                <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center shadow-md">
                  <p className="text-xs text-brand-on-surface-variant">수신된 알림이 없습니다.</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center shadow-md">
                  <p className="text-xs text-brand-on-surface-variant">일치하는 알림 또는 메시지가 없습니다.</p>
                  <button
                    onClick={() => {
                      setNotificationFilter("all");
                      setSearchNotification("");
                    }}
                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-brand-surface-high border border-brand-border text-white text-xs font-semibold hover:bg-brand-surface-highest transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={12} /> 조건 초기화
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {paginatedNotifications.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => handleNotificationClick(msg)}
                      className={`bg-brand-card border rounded-xl p-4 shadow-md transition-all duration-200 cursor-pointer ${
                        selectedNotification?.id === msg.id
                          ? "border-brand-primary bg-brand-primary-container/15 ring-1 ring-brand-primary/40 shadow-md"
                          : !msg.isRead
                          ? "border-brand-primary-container/50 bg-brand-primary-container/5 hover:bg-brand-surface-low"
                          : "border-brand-border/60 hover:bg-brand-surface-low"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {!msg.isRead && <span className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0" />}
                          {msg.aggregationCount && msg.aggregationCount > 1 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              🔥 {msg.aggregationCount}건 묶음
                            </span>
                          )}
                          <span className="text-xs font-bold text-white truncate">{msg.title}</span>
                        </div>
                        <span className="text-[10px] text-brand-on-surface-variant font-mono flex-shrink-0 ml-2">
                          {msg.time}
                        </span>
                      </div>
                      <p className="text-xs text-brand-on-surface-variant leading-relaxed pl-3 border-l-2 border-brand-primary-container/40 line-clamp-2">
                        {msg.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/20">
                        {msg.courseTitle ? (
                          <span className="text-[10px] text-brand-primary font-mono truncate">
                            연관 강의: {msg.courseTitle}
                          </span>
                        ) : (
                          <span className="text-[10px] text-brand-on-surface-variant">플랫폼 알림</span>
                        )}

                        {msg.targetUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionClick(msg.targetUrl);
                            }}
                            className="text-[10px] px-2.5 py-1 rounded bg-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white border border-brand-primary/30 transition-all font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            {msg.actionLabel || "바로가기"} <ExternalLink size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Notification Detail Panel */}
            {selectedNotification && (
              <div
                className={`w-full lg:w-[48%] xl:w-[45%] flex-shrink-0 sticky top-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isClosingNotification ? "opacity-0 translate-x-8 scale-[0.98]" : "animate-slideInFromRight"
                }`}
              >
                <div className="glass-panel-heavy border border-brand-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full">
                  <div className="p-4 sm:p-5 border-b border-brand-border/40 flex justify-between items-center bg-brand-surface-low/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                      <h3 className="font-display font-bold text-white text-sm">알림 및 메시지 상세</h3>
                    </div>
                    <button
                      onClick={handleCloseNotificationDetail}
                      className="text-brand-on-surface-variant hover:text-white p-1 rounded-lg hover:bg-brand-surface-high transition-colors cursor-pointer"
                      title="닫기 (ESC)"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="p-5 space-y-4 text-xs">
                    <div className="bg-brand-surface-low/60 rounded-xl p-4 border border-brand-border/30 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-primary-container/20 text-brand-primary border border-brand-primary/30">
                          {selectedNotification.type === "instructor_msg"
                            ? "강사 피드백"
                            : selectedNotification.type === "course"
                            ? "강의 알림"
                            : selectedNotification.type === "team"
                            ? "팀 빌딩 알림"
                            : selectedNotification.type === "investor"
                            ? "투자 제안 알림"
                            : selectedNotification.type === "community"
                            ? "커뮤니티 알림"
                            : "시스템 공식 알림"}
                        </span>
                        <span className="text-[10px] text-brand-on-surface-variant font-mono">
                          {selectedNotification.time}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {selectedNotification.title}
                      </h4>
                      <p className="text-xs text-brand-on-surface leading-relaxed whitespace-pre-wrap bg-brand-surface-low/40 p-3.5 rounded-lg border border-brand-border/20">
                        {selectedNotification.message}
                      </p>

                      {/* Smart Deep Link CTA */}
                      {selectedNotification.targetUrl && (
                        <div className="pt-2">
                          <button
                            onClick={() => handleActionClick(selectedNotification.targetUrl)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs shadow-lg shadow-brand-primary/30 hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {selectedNotification.actionLabel || "해당 화면으로 바로가기"} &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SubTab 3: 알림 수신 & 스팸 방지 설정 (Preference Center) ── */}
      {activeSubTab === "preferences" && preferences && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Top Banner: Status & Snooze */}
          <div className="bg-gradient-to-r from-brand-surface-low via-brand-card to-brand-surface-low border border-brand-border/60 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-white text-sm">
                    알림 피로도 & 스팸 방지 센터
                  </h3>
                  {isSnoozedActive ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      30일 일시 중지 가동 중
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      맞춤 수신 보호 중
                    </span>
                  )}
                </div>
                <p className="text-xs text-brand-on-surface-variant mt-0.5 leading-relaxed">
                  필요한 채널(인앱·이메일·알림톡)만 선택하고, 야간 방해금지 시간 및 30일 일시 중지를 통해 편안한 플랫폼 경험을 유지하세요.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => handleOpenEmailPreview("TEAM_PROPOSAL_RECEIVED")}
                className="px-3 py-1.5 rounded-lg bg-brand-surface-high hover:bg-brand-surface-highest text-white border border-brand-border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye size={13} /> 이메일 미리보기
              </button>

              {isSnoozedActive ? (
                <button
                  onClick={handleUnsnooze}
                  disabled={isSavingPrefs}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <PlayCircle size={14} /> 일시중지 해제
                </button>
              ) : (
                <button
                  onClick={() => handleSnooze(30)}
                  disabled={isSavingPrefs}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-surface-high hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <PauseCircle size={14} /> 30일간 알림 쉬기 (Snooze)
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. 카테고리별 채널 수신 설정 (2 Cols) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-brand-card border border-brand-border/60 rounded-2xl p-5 shadow-md">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-brand-border/40">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Sliders size={16} className="text-brand-primary" /> 업무 카테고리별 수신 채널 설정
                    </h4>
                    <p className="text-[11px] text-brand-on-surface-variant mt-0.5">
                      각 항목별로 인앱(웹), 이메일, 카카오 알림톡 수신 여부를 개별 제어할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: "course" as const,
                      name: "🎓 강의 및 학습 알림",
                      desc: "과제 피드백, VOD 업로드, 강의 시작 D-1 리마인더, 개강 요청",
                    },
                    {
                      key: "team" as const,
                      name: "🤝 스타트업 & 팀 빌딩",
                      desc: "코파운더 합류 제안, 채용 지원서 접수, 아이디어 빌더 역제안",
                    },
                    {
                      key: "investor" as const,
                      name: "💼 투자 및 IR 제안",
                      desc: "전문 투자자의 미팅/투자 제안, 관심 스타트업 북마크 알림",
                    },
                    {
                      key: "community" as const,
                      name: "💬 커뮤니티 & 인터랙션",
                      desc: "내 게시글 새 댓글, @멘션, 질의응답 피드백 (5분 스마트 병합)",
                    },
                    {
                      key: "digest" as const,
                      name: "☕ 위클리 다이제스트",
                      desc: "이번 주 주목받은 AI 스타트업 TOP 3 및 인기 창업 토론글 큐레이션",
                    },
                    {
                      key: "marketing" as const,
                      name: "🎁 혜택 및 프로모션",
                      desc: "얼리버드 수강료 할인, 신규 창업 지원 프로그램 안내",
                    },
                  ].map((cat) => {
                    const catPref = preferences.categories[cat.key];
                    return (
                      <div
                        key={cat.key}
                        className="bg-brand-surface-low/60 rounded-xl p-3.5 border border-brand-border/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-white">{cat.name}</h5>
                          <p className="text-[11px] text-brand-on-surface-variant mt-0.5 truncate">
                            {cat.desc}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {/* In-App Toggle */}
                          <button
                            onClick={() => handleCategoryChannelToggle(cat.key, "inapp")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                              catPref.inapp
                                ? "bg-brand-primary-container/20 text-brand-primary border-brand-primary/40 shadow-sm"
                                : "bg-brand-surface-high/40 text-brand-on-surface-variant/50 border-brand-border/20"
                            }`}
                          >
                            <Bell size={11} /> 인앱 {catPref.inapp ? "ON" : "OFF"}
                          </button>

                          {/* Email Toggle */}
                          <button
                            onClick={() => handleCategoryChannelToggle(cat.key, "email")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                              catPref.email
                                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm"
                                : "bg-brand-surface-high/40 text-brand-on-surface-variant/50 border-brand-border/20"
                            }`}
                          >
                            <Mail size={11} /> 이메일 {catPref.email ? "ON" : "OFF"}
                          </button>

                          {/* Alimtalk Toggle */}
                          <button
                            onClick={() => handleCategoryChannelToggle(cat.key, "alimtalk")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                              catPref.alimtalk
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                                : "bg-brand-surface-high/40 text-brand-on-surface-variant/50 border-brand-border/20"
                            }`}
                          >
                            <Smartphone size={11} /> 알림톡 {catPref.alimtalk ? "ON" : "OFF"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. 야간 방해금지 시간대 & 원클릭 수신보호 (1 Col) */}
            <div className="flex flex-col gap-4">
              {/* Quiet Hours Card */}
              <div className="bg-brand-card border border-brand-border/60 rounded-2xl p-5 shadow-md flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Moon size={16} className="text-indigo-400" /> 🌙 야간 방해금지 모드
                  </h4>
                  <button
                    onClick={handleToggleQuietHours}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      preferences.quietHours.enabled ? "bg-brand-primary" : "bg-brand-surface-highest"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        preferences.quietHours.enabled ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-brand-on-surface-variant leading-relaxed">
                  설정된 시간대에는 외부 이메일 및 알림톡 발송을 자동 제한하고 인앱에만 조용히 보관하며, 익일 아침 요약 알림으로 발송합니다.
                </p>

                {preferences.quietHours.enabled && (
                  <div className="p-3 bg-brand-surface-low rounded-xl border border-brand-border/40 flex items-center justify-between text-xs">
                    <span className="text-brand-on-surface-variant">제한 시간대:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                      <select
                        value={preferences.quietHours.start}
                        onChange={(e) => handleQuietHoursChange("start", e.target.value)}
                        className="bg-brand-surface-high border border-brand-border rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="20:00">20:00</option>
                        <option value="21:00">21:00</option>
                        <option value="22:00">22:00</option>
                        <option value="23:00">23:00</option>
                      </select>
                      <span>~</span>
                      <select
                        value={preferences.quietHours.end}
                        onChange={(e) => handleQuietHoursChange("end", e.target.value)}
                        className="bg-brand-surface-high border border-brand-border rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="07:00">07:00</option>
                        <option value="08:00">08:00</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 1-Click Compliance Card */}
              <div className="bg-brand-card border border-brand-border/60 rounded-2xl p-5 shadow-md flex flex-col gap-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Shield size={16} className="text-emerald-400" /> 스팸 방지 표준 준수
                </h4>
                <div className="space-y-2 text-xs text-brand-on-surface-variant leading-relaxed">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>5분 스마트 묶음(Roll-up)</strong>: 연속 댓글 발생 시 1통으로 자동 병합</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>RFC 8058 원클릭 수신 거부</strong>: 메일 상단 및 푸터 1-Click 지원</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>웹 세션 감지</strong>: 사이트 접속 중 불필요한 중복 메일 자동 취소</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SubTab 4: 프로필 & 연동 설정 ── */}
      {activeSubTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Left Profile Summary Card */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6 flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary-container to-brand-secondary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {displayName.charAt(0)}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">{displayName}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border mt-1 text-brand-primary border-brand-primary/30 bg-brand-primary/10">
                  <Sparkles size={12} /> 올인원 창업가
                </span>
              </div>
            </div>

            {/* Google Sync */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4">
              <h4 className="text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1.5">
                Google 계정 연동
              </h4>
              <div className="flex items-center gap-2 p-2.5 bg-brand-surface-low rounded-lg border border-brand-border/30">
                <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-brand-on-surface-variant">인증 완료</p>
                  <p className="text-xs text-white font-medium">user@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Edit Details */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <User size={14} className="text-brand-primary" /> 기본 정보
                </h4>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-xs text-brand-on-surface-variant hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} /> 수정
                  </button>
                ) : (
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-primary-light font-bold transition-colors cursor-pointer"
                  >
                    <Save size={13} /> 저장
                  </button>
                )}
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-brand-on-surface-variant block mb-1">표시 이름</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-brand-surface-low border border-brand-border rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary"
                    />
                  ) : (
                    <p className="text-white font-medium p-2.5 bg-brand-surface-low/40 rounded-lg border border-brand-border/20">
                      {displayName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-brand-on-surface-variant block mb-1">한 줄 소개</label>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-brand-surface-low border border-brand-border rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary resize-none"
                    />
                  ) : (
                    <p className="text-white font-medium p-2.5 bg-brand-surface-low/40 rounded-lg border border-brand-border/20">
                      {bio}
                    </p>
                  )}
                </div>

                {saved && (
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle size={14} /> 프로필이 성공적으로 업데이트되었습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Email Preview Modal (호기심 갭 & 딥링크 뷰어) ── */}
      {showEmailPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-brand-card border border-brand-border/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-brand-border/40 flex justify-between items-center bg-brand-surface-low">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-brand-primary" />
                <h3 className="font-display font-bold text-white text-sm">
                  반응형 이메일 발송 미리보기 (사이트 유입 유도)
                </h3>
              </div>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="text-brand-on-surface-variant hover:text-white p-1 rounded-lg hover:bg-brand-surface-high transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Template Selector Bar */}
            <div className="p-3 bg-brand-surface-low/60 border-b border-brand-border/30 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-brand-on-surface-variant text-[11px] font-bold shrink-0">템플릿 선택:</span>
              {[
                { code: "TEAM_PROPOSAL_RECEIVED", label: "🤝 팀 합류 제안" },
                { code: "COURSE_D1_REMINDER", label: "🎓 강의 시작 D-1" },
                { code: "INVESTMENT_PROPOSAL_RECEIVED", label: "💼 투자자 제안" },
                { code: "POST_COMMENT_RECEIVED", label: "💬 게시글 새 댓글" },
              ].map((t) => (
                <button
                  key={t.code}
                  onClick={() => handleOpenEmailPreview(t.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    previewTemplateCode === t.code
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-brand-surface-high text-brand-on-surface-variant hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Rendered HTML Container */}
            <div className="p-4 overflow-y-auto flex-1 bg-black/40">
              <div
                className="rounded-xl overflow-hidden border border-brand-border/40 shadow-inner"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>

            <div className="p-3 bg-brand-surface-low border-t border-brand-border/40 flex justify-between items-center text-[11px] text-brand-on-surface-variant">
              <span>💡 호기심 유발 후킹 문구 및 스마트 딥링크 CTA, 1-Click 수신거부가 포함되어 있습니다.</span>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-brand-surface-high hover:bg-brand-surface-highest text-white font-bold transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
