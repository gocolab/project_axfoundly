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
} from "lucide-react";
import type { PaymentRecord, Notification, UserRole } from "../types";
import PaymentReceiptModal from "./PaymentReceiptModal";

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

  const instructorMessages = notifications.filter(
    (n) => n.type === "instructor_msg" || n.type === "course"
  );

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
          <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md">
            <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-brand-surface-low border-b border-brand-border/30 text-[10px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
              <span className="col-span-5">항목 / 강의명</span>
              <span className="col-span-2">결제 금액</span>
              <span className="col-span-2">결제일</span>
              <span className="col-span-1">상태</span>
              <span className="col-span-2 text-right">영수증 / 환불</span>
            </div>

            {payments.length === 0 ? (
              <p className="px-5 py-12 text-center text-xs text-brand-on-surface-variant">
                결제 내역이 존재하지 않습니다.
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
                  <span className="col-span-2 text-xs text-brand-on-surface-variant font-mono font-bold">
                    ₩{p.amount.toLocaleString()}
                  </span>
                  <span className="col-span-2 text-[10px] text-brand-on-surface-variant">
                    {p.date}
                  </span>
                  <span className="col-span-1">
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
                  <span className="col-span-2 text-right">
                    <button
                      onClick={() => setSelectedPayment(p)}
                      className="text-[11px] px-3 py-1 rounded-lg bg-brand-surface-high hover:bg-brand-surface-highest text-white border border-brand-border/50 transition-colors cursor-pointer inline-flex items-center gap-1 font-medium shadow-sm"
                    >
                      <Receipt size={12} /> 영수증 조회
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── SubTab 2: 알림 & 메시지함 ── */}
      {activeSubTab === "notifications" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare size={15} className="text-brand-primary" />
              수신된 메시지 & 강사 피드백 ({notifications.length}개)
            </h3>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <p className="text-xs text-brand-on-surface-variant">수신된 알림이 없습니다.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((msg) => (
                <div
                  key={msg.id}
                  className={`bg-brand-card border rounded-xl p-4 shadow-md transition-colors ${
                    !msg.isRead
                      ? "border-brand-primary-container/50 bg-brand-primary-container/5"
                      : "border-brand-border/60"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {!msg.isRead && <span className="w-2 h-2 rounded-full bg-brand-primary-container" />}
                      <span className="text-xs font-bold text-white">{msg.title}</span>
                    </div>
                    <span className="text-[10px] text-brand-on-surface-variant font-mono">
                      {msg.time}
                    </span>
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
              ))}
            </div>
          )}
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
