import { Router } from "express";
import { db } from "../db.js";
import type { PaymentRecord, Notification } from "../../src/types.js";

const router = Router();

// GET /api/payments
router.get("/", (req, res) => {
  const payments = db.get("payments");
  res.json({ payments });
});

// GET /api/payments/:id/receipt
router.get("/:id/receipt", (req, res) => {
  const { id } = req.params;
  const payment = db.get("payments").find((p) => p.id === id);
  if (!payment) {
    return res.status(404).json({ error: "Payment record not found" });
  }

  const receipt = {
    receiptId: `REC-${payment.id.toUpperCase()}`,
    orderNumber: `ORD-${Date.now()}`,
    payment,
    issuer: "(주)AI로 창업하라 플랫폼",
    taxAmount: Math.round(payment.amount * 0.1),
    supplyAmount: Math.round(payment.amount * 0.9),
    totalAmount: payment.amount,
    paidAt: payment.date,
    cardDetails: payment.method === "카드" ? "현대카드 (5428-****-****-9102)" : "가상계좌 입금",
    status: payment.status,
  };

  res.json({ receipt });
});

// POST /api/payments/:id/refund
router.post("/:id/refund", (req, res) => {
  const { id } = req.params;
  const { reason = "단순 변심" } = req.body;

  let refundedPayment: PaymentRecord | null = null;

  db.update("payments", (payments) =>
    payments.map((p) => {
      if (p.id === id) {
        refundedPayment = { ...p, status: "환불" };
        return refundedPayment;
      }
      return p;
    })
  );

  if (!refundedPayment) {
    return res.status(404).json({ error: "Payment record not found" });
  }

  const payment: PaymentRecord = refundedPayment;

  // Notification
  const newNotif: Notification = {
    id: `notif-${Date.now()}`,
    type: "system",
    title: `[환불 완료] ${payment.courseTitle}`,
    message: `${payment.amount.toLocaleString()}원의 환불 처리가 접수되었습니다. (사유: ${reason})`,
    time: "방금 전",
    isRead: false,
  };
  db.update("notifications", (notifs) => [newNotif, ...notifs]);

  res.json({ success: true, payment: refundedPayment });
});

export default router;
