import React from "react";
import {
  User,
  CreditCard,
  Receipt,
  CheckCircle,
  Edit3,
  Save,
  Sparkles,
  RotateCcw,
  Search,
  X,
  Building2,
  AlertCircle,
} from "lucide-react";
import type { PaymentRecord, UserRole, Notification } from "../types";
import PaymentReceiptModal from "./PaymentReceiptModal";
import Pagination from "./common/Pagination";
import SearchBar from "./common/SearchBar";
import HighlightText from "./common/HighlightText";
import { multiMatch } from "../utils/searchUtils";

interface AccountSettingsViewProps {
  userName: string;
  userRoles: UserRole[];
  payments: PaymentRecord[];
  notifications?: Notification[];
  onRefundPayment: (updatedPayment: PaymentRecord) => void;
  onNavigate?: (url: string) => void;
}

export default function AccountSettingsView({
  userName,
  userRoles,
  payments,
  onRefundPayment,
  onNavigate,
}: AccountSettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<"payments" | "profile">("payments");
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentRecord | null>(null);
  const [isClosingPayment, setIsClosingPayment] = React.useState(false);

  // ESC key listener to close detail panel
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedPayment) handleClosePaymentDetail();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPayment]);

  const handleClosePaymentDetail = () => {
    setIsClosingPayment(true);
    setTimeout(() => {
      setSelectedPayment(null);
      setIsClosingPayment(false);
    }, 200);
  };

  const handlePaymentClick = (payment: PaymentRecord) => {
    if (selectedPayment?.id === payment.id) {
      handleClosePaymentDetail();
    } else {
      setSelectedPayment(payment);
    }
  };

  // ── SubTab 1: Payments Search, Filter & Pagination ──
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<"all" | "완료" | "환불">("all");
  const [searchPayment, setSearchPayment] = React.useState("");
  const [paymentPage, setPaymentPage] = React.useState(1);
  const [paymentItemsPerPage, setPaymentItemsPerPage] = React.useState(6);

  // ── SubTab 2: Profile Edit States ──
  const [isEditing, setIsEditing] = React.useState(false);
  const [displayName, setDisplayName] = React.useState(userName);
  const [bio, setBio] = React.useState("AI로 창업을 준비 중인 기업가입니다.");
  const [saved, setSaved] = React.useState(false);

  const handleSaveProfile = () => {
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── 정산/출금 계좌 정보 State ──
  const [bankName, setBankName] = React.useState("신한은행");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [accountHolder, setAccountHolder] = React.useState(userName || "김소현");
  const [accountType, setAccountType] = React.useState<"individual" | "business">("individual");
  const [accountSaved, setAccountSaved] = React.useState(false);

  // 계좌 정보 로드
  React.useEffect(() => {
    const userKey = `withdrawal_payout_account_${userName || "김소현"}`;
    const defaultKey = "withdrawal_payout_account_default";
    const savedAccount = localStorage.getItem(userKey) || localStorage.getItem(defaultKey);
    if (savedAccount) {
      try {
        const parsed = JSON.parse(savedAccount);
        if (parsed.bank) setBankName(parsed.bank);
        if (parsed.account) setAccountNumber(parsed.account);
        if (parsed.holder) setAccountHolder(parsed.holder);
        if (parsed.type) setAccountType(parsed.type);
      } catch (e) {
        console.error("Failed to parse saved payout account", e);
      }
    }
  }, [userName]);

  // 계좌 정보 저장
  const handleSavePayoutAccount = () => {
    const payload = {
      bank: bankName,
      account: accountNumber.trim(),
      holder: accountHolder.trim(),
      type: accountType,
      updatedAt: new Date().toISOString(),
    };
    const userKey = `withdrawal_payout_account_${userName || "김소현"}`;
    localStorage.setItem(userKey, JSON.stringify(payload));
    localStorage.setItem("withdrawal_payout_account_default", JSON.stringify(payload));
    setAccountSaved(true);
    setTimeout(() => setAccountSaved(false), 3000);
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchStatus = paymentStatusFilter === "all" ? true : p.status === paymentStatusFilter;
    const matchSearch = multiMatch([p.courseTitle, p.date, p.amount, p.method], searchPayment);
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

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <CreditCard size={20} className="text-brand-tertiary" /> 결제 및 계정 설정
          </h2>
          <p className="text-xs text-brand-on-surface-variant mt-1">
            결제 영수증 및 환불 내역 조회, 강사 정산 계좌 관리, 프로필을 안전하게 관리하세요
          </p>
        </div>
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
              <SearchBar
                value={searchPayment}
                onChange={setSearchPayment}
                placeholder="강의명, 일자, 금액 검색... (/ 단축키)"
                className="w-full sm:w-64"
              />

              {paymentTotalPages > 1 && (
                <div className="shrink-0">
                  <Pagination
                    currentPage={paymentPage}
                    totalPages={paymentTotalPages}
                    onPageChange={setPaymentPage}
                    totalItems={filteredPayments.length}
                    itemsPerPage={paymentItemsPerPage}
                    onPageSizeChange={setPaymentItemsPerPage}
                    pageSizeOptions={[6, 12, 24]}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Master-Detail Container */}
          <div className="flex flex-col lg:flex-row items-start gap-4 w-full">
            {/* Left Side: Payments List */}
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
                          <HighlightText text={p.courseTitle} query={searchPayment} />
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

      {/* ── SubTab 2: 프로필 & 연동 설정 ── */}
      {activeSubTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Left Column: Summary & Integrations */}
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

          {/* Right Column: Edit Profile & Payout Account */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Basic Info Card */}
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
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1 animate-fadeIn">
                    <CheckCircle size={14} /> 프로필이 성공적으로 업데이트되었습니다.
                  </p>
                )}
              </div>
            </div>

            {/* 정산/출금 계좌 정보 관리 Card */}
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary-container/20 border border-brand-primary-container/40 flex items-center justify-center text-brand-primary">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      정산/출금 계좌 정보 관리
                    </h4>
                    <p className="text-[11px] text-brand-on-surface-variant mt-0.5">
                      강의 개설 & 운영 시 수강료 정산금 출금 신청에 사용될 기본 계좌입니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* 정산 유형 */}
                <div>
                  <label className="text-brand-on-surface-variant block mb-1.5 font-medium">정산 대상 유형</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        accountType === "individual"
                          ? "bg-brand-primary-container/20 border-brand-primary text-white font-semibold"
                          : "bg-brand-surface-low border-brand-border text-brand-on-surface-variant hover:text-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountType"
                        checked={accountType === "individual"}
                        onChange={() => setAccountType("individual")}
                        className="accent-brand-primary"
                      />
                      <span>개인 (소득세 3.3% 원천징수)</span>
                    </label>
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        accountType === "business"
                          ? "bg-brand-primary-container/20 border-brand-primary text-white font-semibold"
                          : "bg-brand-surface-low border-brand-border text-brand-on-surface-variant hover:text-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountType"
                        checked={accountType === "business"}
                        onChange={() => setAccountType("business")}
                        className="accent-brand-primary"
                      />
                      <span>사업자 (전자세금계산서 발행)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 은행명 */}
                  <div>
                    <label className="text-brand-on-surface-variant block mb-1 font-medium">은행명</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-brand-surface-low border border-brand-border rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary"
                    >
                      <option value="신한은행">신한은행</option>
                      <option value="KB국민은행">KB국민은행</option>
                      <option value="우리은행">우리은행</option>
                      <option value="하나은행">하나은행</option>
                      <option value="카카오뱅크">카카오뱅크</option>
                      <option value="토스뱅크">토스뱅크</option>
                      <option value="NH농협은행">NH농협은행</option>
                      <option value="IBK기업은행">IBK기업은행</option>
                      <option value="SC제일은행">SC제일은행</option>
                    </select>
                  </div>

                  {/* 계좌번호 */}
                  <div className="sm:col-span-2">
                    <label className="text-brand-on-surface-variant block mb-1 font-medium">
                      계좌번호 ('-' 제외 숫자)
                    </label>
                    <input
                      type="text"
                      placeholder="예: 110123456789"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-brand-surface-low border border-brand-border rounded-lg p-2.5 text-white font-mono placeholder:text-brand-on-surface-variant/50 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                {/* 예금주명 */}
                <div>
                  <label className="text-brand-on-surface-variant block mb-1 font-medium">예금주명</label>
                  <input
                    type="text"
                    placeholder="예금주 실명을 입력하세요"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full bg-brand-surface-low border border-brand-border rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="p-3 bg-brand-surface-low/60 rounded-xl border border-brand-border/30 flex items-start gap-2 text-[11px] text-brand-on-surface-variant leading-relaxed">
                  <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    등록된 계좌 정보는 강의 운영 탭의 '출금 신청' 모달에 기본 바인딩되며, 실명 및 예금주 불일치 시 출금 승인이 반려될 수 있습니다.
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    {accountSaved && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-fadeIn">
                        <CheckCircle size={14} /> 정산 계좌 정보가 안전하게 저장되었습니다.
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSavePayoutAccount}
                    className="px-4 py-2 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold rounded-xl text-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Save size={13} /> 계좌 정보 저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
