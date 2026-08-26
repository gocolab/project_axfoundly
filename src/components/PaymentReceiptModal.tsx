import React from "react";
import { X, CreditCard, CheckCircle, AlertTriangle, FileText, Download, RotateCcw } from "lucide-react";
import type { PaymentRecord } from "../types";
import { api } from "../lib/api";

interface PaymentReceiptModalProps {
  key?: React.Key;
  payment: PaymentRecord | null;
  onClose: () => void;
  onRefundCompleted: (updatedPayment: PaymentRecord) => void;
  inline?: boolean;
}

export default function PaymentReceiptModal({
  payment,
  onClose,
  onRefundCompleted,
  inline = false,
}: PaymentReceiptModalProps) {
  const [receipt, setReceipt] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [showRefundForm, setShowRefundForm] = React.useState(false);
  const [refundReason, setRefundReason] = React.useState("");
  const [refunding, setRefunding] = React.useState(false);

  // ESC key listener to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && payment) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [payment, onClose]);

  React.useEffect(() => {
    if (!payment) return;
    setLoading(true);
    api
      .getReceipt(payment.id)
      .then((res) => {
        setReceipt(res.receipt);
      })
      .catch((err) => console.error("Failed to load receipt", err))
      .finally(() => setLoading(false));
  }, [payment?.id]);

  if (!payment) return null;

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      alert("환불 사유를 입력해주세요.");
      return;
    }

    setRefunding(true);
    try {
      const res = await api.refundPayment(payment.id, refundReason.trim());
      alert("환불 신청이 정상 완료되었습니다.");
      onRefundCompleted(res.payment);
      onClose();
    } catch (error) {
      console.error("Failed to refund", error);
      alert("환불 처리에 실패했습니다.");
    } finally {
      setRefunding(false);
    }
  };

  const content = (
    <div className={`glass-panel-heavy ${inline ? "rounded-2xl border border-brand-border/60 shadow-xl" : "rounded-2xl max-w-md border border-brand-border shadow-2xl"} w-full overflow-hidden`}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-brand-border/40 flex justify-between items-center bg-brand-surface-low/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-primary-container/20 text-brand-primary flex items-center justify-center">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="font-display text-sm sm:text-base font-bold text-white">결제 영수증 & 환불 관리</h2>
            <p className="text-[10px] text-brand-on-surface-variant font-mono">
              {receipt?.receiptId || `REC-${payment.id.toUpperCase()}`}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high transition-colors cursor-pointer"
          title="닫기 (ESC)"
        >
          <X size={18} />
        </button>
      </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {loading ? (
            <div className="py-8 text-center text-brand-on-surface-variant">영수증 로딩 중...</div>
          ) : (
            <>
              {/* Status Badge */}
              <div className="flex justify-between items-center bg-brand-surface-low p-3.5 rounded-xl border border-brand-border/40">
                <span className="text-brand-on-surface-variant font-medium">결제 상태</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    payment.status === "완료"
                      ? "bg-brand-primary-container/20 text-brand-primary border border-brand-primary/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {payment.status === "완료" ? "결제 완료" : "환불 완료"}
                </span>
              </div>

              {/* Detail Table */}
              <div className="space-y-2.5 bg-brand-surface-low/40 p-4 rounded-xl border border-brand-border/30">
                <div className="flex justify-between">
                  <span className="text-brand-on-surface-variant">상품명(강의)</span>
                  <span className="text-white font-semibold">{payment.courseTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-on-surface-variant">결제 일시</span>
                  <span className="text-white">{payment.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-on-surface-variant">결제 수단</span>
                  <span className="text-white">{receipt?.cardDetails || payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-on-surface-variant">공급가액</span>
                  <span className="text-white">
                    {(receipt?.supplyAmount || Math.round(payment.amount * 0.9)).toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-on-surface-variant">부가가치세 (10%)</span>
                  <span className="text-white">
                    {(receipt?.taxAmount || Math.round(payment.amount * 0.1)).toLocaleString()}원
                  </span>
                </div>
                <div className="border-t border-brand-border/40 pt-2 flex justify-between items-center">
                  <span className="font-bold text-white">최종 결제 금액</span>
                  <span className="font-bold text-base text-brand-primary">
                    {payment.amount.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* Issuer */}
              <div className="text-[10px] text-brand-on-surface-variant/70 text-center">
                발행처: {receipt?.issuer || "(주)AI로 창업하라"} | 대표: 안티그래비티
              </div>

              {/* Refund Section */}
              {payment.status === "완료" && (
                <div className="pt-2">
                  {!showRefundForm ? (
                    <button
                      onClick={() => setShowRefundForm(true)}
                      className="w-full py-2.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      수강 취소 및 환불 신청
                    </button>
                  ) : (
                    <div className="p-3.5 bg-red-500/5 border border-red-500/30 rounded-xl space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-red-400 font-bold">
                        <AlertTriangle size={13} />
                        <span>환불 사유 입력</span>
                      </div>
                      <textarea
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="환불 신청 사유를 입력해주세요 (예: 일정 중복, 단순 변심 등)"
                        className="w-full bg-brand-surface border border-brand-border rounded-lg p-2 text-white focus:outline-none focus:border-red-400 h-16 resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowRefundForm(false)}
                          className="px-3 py-1 text-brand-on-surface-variant hover:text-white"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleRefund}
                          disabled={refunding || !refundReason.trim()}
                          className="px-4 py-1.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                        >
                          {refunding ? "처리 중..." : "환불 확정"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/85 backdrop-blur-md p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {content}
    </div>
  );
}
