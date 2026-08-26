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
} from "lucide-react";
import type { PaymentRecord, Notification, UserRole } from "../types";
import PaymentReceiptModal from "./PaymentReceiptModal";
import Pagination from "./common/Pagination";

interface AccountSettingsViewProps {
  userName: string;
  userRoles: UserRole[];
  payments: PaymentRecord[];
  notifications: Notification[];
  onRefundPayment: (updatedPayment: PaymentRecord) => void;
}

export default function AccountSettingsView({
  userName,
  userRoles,
  payments,
  notifications,
  onRefundPayment,
}: AccountSettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<"payments" | "notifications" | "profile">("payments");
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentRecord | null>(null);
  const [isClosingPayment, setIsClosingPayment] = React.useState(false);

  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null);
  const [isClosingNotification, setIsClosingNotification] = React.useState(false);

  // ESC key listener to close detail panel
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedPayment) handleClosePaymentDetail();
        if (selectedNotification) handleCloseNotificationDetail();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPayment, selectedNotification]);

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
        : n.type === "system" || n.type === "team" || n.type === "investor";
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

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <CreditCard size={20} className="text-brand-tertiary" /> 결제 및 계정 설정
        </h2>
        <p className="text-xs text-brand-on-surface-variant mt-1">
          결제 영수증 조회, 7일 이내 환불 신청, 수신된 알림 및 프로필 정보를 관리하세요
        </p>
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
          <Receipt size={14} /> 결제 및 영수증 내역 ({payments.length})
        </button>
        <button
          onClick={() => setActiveSubTab("notifications")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "notifications"
              ? "text-brand-primary border-b-2 border-brand-primary tab-active"
              : "text-brand-on-surface-variant hover:text-white"
          }`}
        >
          <Bell size={14} /> 알림 & 메시지함 ({notifications.length})
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

      {/* ── SubTab 1: 결제 및 영수증 내역 ── */}
      {activeSubTab === "payments" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Filter Pills & Search Bar (Community Style) */}
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
                결제완료 ({payments.filter((p) => p.status === "완료").length})
              </button>
              <button
                onClick={() => setPaymentStatusFilter("환불")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  paymentStatusFilter === "환불"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                환불 ({payments.filter((p) => p.status === "환불").length})
              </button>
            </div>

            <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full sm:w-auto shrink-0">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                <input
                  type="text"
                  placeholder="강의명, 결제일 검색..."
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
            {/* Left Side: Payments Table (Master View) */}
            <div
              className={`min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                selectedPayment ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"
              }`}
            >
              <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md">
                {/* Header row */}
                <div className="flex items-center px-5 py-3 bg-brand-surface-low border-b border-brand-border/30 text-[10px] font-mono text-brand-on-surface-variant uppercase tracking-wider gap-3">
                  <span className="flex-1 min-w-0">항목 / 강의명</span>
                  <span className="w-24 text-right shrink-0">결제 금액</span>
                  <div
                    className={`flex items-center gap-3 shrink-0 transition-all duration-300 ease-in-out ${
                      selectedPayment
                        ? "w-0 opacity-0 pointer-events-none overflow-hidden"
                        : "w-52 sm:w-64 opacity-100"
                    }`}
                  >
                    <span className="w-24 text-center font-mono">결제일</span>
                    <span className="w-14 text-center">상태</span>
                    <span className="w-24 text-right">영수증 / 환불</span>
                  </div>
                </div>

                {payments.length === 0 ? (
                  <p className="px-5 py-12 text-center text-xs text-brand-on-surface-variant">
                    결제 내역이 존재하지 않습니다.
                  </p>
                ) : filteredPayments.length === 0 ? (
                  <div className="px-5 py-12 text-center text-xs text-brand-on-surface-variant">
                    <p>일치하는 결제 내역이 없습니다.</p>
                    <button
                      onClick={() => {
                        setPaymentStatusFilter("all");
                        setSearchPayment("");
                      }}
                      className="mt-3 px-3 py-1 rounded-lg bg-brand-surface-high border border-brand-border text-white text-xs font-semibold hover:bg-brand-surface-highest transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} /> 조건 초기화
                    </button>
                  </div>
                ) : (
                  paginatedPayments.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPayment(p)}
                      className={`flex items-center px-5 py-3.5 border-b border-brand-border/20 last:border-0 transition-colors duration-200 cursor-pointer gap-3 ${
                        selectedPayment?.id === p.id
                          ? "bg-brand-primary-container/20 border-l-4 border-brand-primary text-white shadow-sm"
                          : "border-l-4 border-transparent hover:bg-brand-surface-low/80 text-brand-on-surface-variant"
                      }`}
                    >
                      <span className="flex-1 min-w-0 text-xs text-white truncate font-medium">
                        {p.courseTitle}
                      </span>
                      <span className="w-24 text-right text-xs text-brand-primary font-mono font-bold shrink-0">
                        ₩{p.amount.toLocaleString()}
                      </span>
                      <div
                        className={`flex items-center gap-3 shrink-0 transition-all duration-300 ease-in-out ${
                          selectedPayment
                            ? "w-0 opacity-0 pointer-events-none overflow-hidden"
                            : "w-52 sm:w-64 opacity-100"
                        }`}
                      >
                        <span className="w-24 text-[10px] text-brand-on-surface-variant text-center font-mono">
                          {p.date}
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
                              setSelectedPayment(p);
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

            {/* Right Side: Payment Receipt Detail Panel (Detail View) */}
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

      {/* ── SubTab 2: 알림 & 메시지함 ── */}
      {activeSubTab === "notifications" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Filter Pills & Search Bar (Community Style) */}
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
                      onClick={() => {
                        setSelectedNotification(msg);
                        msg.isRead = true;
                      }}
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
                          <span className="text-xs font-bold text-white truncate">{msg.title}</span>
                        </div>
                        <span className="text-[10px] text-brand-on-surface-variant font-mono flex-shrink-0 ml-2">
                          {msg.time}
                        </span>
                      </div>
                      <p className="text-xs text-brand-on-surface-variant leading-relaxed pl-3 border-l-2 border-brand-primary-container/40 line-clamp-2">
                        {msg.message}
                      </p>
                      {msg.courseTitle && (
                        <p className="text-[10px] text-brand-primary font-mono mt-2 truncate">
                          연관 강의: {msg.courseTitle}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Notification Detail Panel (Detail View) */}
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
                      {selectedNotification.courseTitle && (
                        <div className="pt-2 border-t border-brand-border/30 text-[11px] text-brand-primary flex items-center justify-between">
                          <span>연관 강의: <span className="font-semibold text-white">{selectedNotification.courseTitle}</span></span>
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

      {/* ── SubTab 3: 프로필 & 연동 설정 ── */}
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
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-semibold"
                  >
                    <Save size={13} /> 저장
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-brand-on-surface-variant block mb-1.5">
                    표시 이름
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-brand-surface-low border border-brand-primary-container/40 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 bg-brand-surface-low rounded-xl border border-brand-border/30">
                      <User size={14} className="text-brand-on-surface-variant" />
                      <span className="text-sm text-white">{displayName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-brand-on-surface-variant block mb-1.5">
                    한 줄 소개
                  </label>
                  {isEditing ? (
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={2}
                      className="w-full bg-brand-surface-low border border-brand-primary-container/40 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors resize-none"
                    />
                  ) : (
                    <div className="p-2.5 bg-brand-surface-low rounded-xl border border-brand-border/30">
                      <span className="text-sm text-brand-on-surface-variant">{bio}</span>
                    </div>
                  )}
                </div>

                {saved && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs">
                    <CheckCircle size={14} /> 프로필이 성공적으로 저장되었습니다
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <CreditCard size={14} className="text-brand-tertiary" /> 간편 결제 수단
              </h4>
              <div className="flex items-center justify-between p-3 bg-brand-surface-low rounded-xl border border-brand-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFCD00] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#3A1D1D]">Pay</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">카카오페이</p>
                    <p className="text-[10px] text-brand-on-surface-variant">원클릭 결제 연동됨</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/30">
                  연동됨
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {selectedPayment && (
        <PaymentReceiptModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onRefundCompleted={(updatedPayment) => {
            setSelectedPayment(null);
            onRefundPayment(updatedPayment);
          }}
        />
      )}
    </div>
  );
}
