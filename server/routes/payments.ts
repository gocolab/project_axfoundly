import { Router } from "express";
import { db } from "../db.js";
import type { PaymentRecord, Notification } from "../../src/types.js";

const router = Router();

// 카카오페이 결제 준비
router.post("/ready", async (req, res) => {
  const { itemName, totalAmount, orderId, userId } = req.body;
  
  try {
    const response = await fetch("https://open-api.kakaopay.com/online/v1/payment/ready", {
      method: "POST",
      headers: {
        "Authorization": `SECRET_KEY ${process.env.KAKAO_PAY_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cid: process.env.KAKAO_PAY_CID || "TC0ONETIME",
        partner_order_id: orderId || `ORD-${Date.now()}`,
        partner_user_id: userId || "user",
        item_name: itemName || "강의 결제",
        quantity: 1,
        total_amount: totalAmount || 1000,
        tax_free_amount: 0,
        approval_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005'}/api/payments/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005'}/api/payments/cancel`,
        fail_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005'}/api/payments/fail`,
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("KakaoPay Ready Error:", errorText);
      return res.status(response.status).json({ error: errorText });
    }
    
    const data = await response.json();
    
    // TID 임시 저장 (메 방식)
    db.update("kakao_sessions", (sessions = []) => {
      return [...sessions, {
        tid: data.tid,
        orderId: orderId || `ORD-${Date.now()}`,
        userId: userId || "user",
        itemName: itemName || "강의 결제",
        totalAmount: totalAmount || 1000
      }];
    });

    res.json(data);
  } catch (error) {
    console.error("KakaoPay Request Failed", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 카카오페이 결제 승인 리다이렉트
router.get("/success", async (req, res) => {
  const pg_token = req.query.pg_token as string;
  // 실제 서비스라면 사용자 세션에서 tid를 조회해야 합니다.
  // 데모 목적상 가장 최근 저장된 tid를 가져옵니다.
  const sessions = db.get("kakao_sessions") || [];
  const session = sessions[sessions.length - 1];
  
  if (!session || !pg_token) {
    return res.redirect("/?payment=error&reason=invalid_session");
  }

  try {
    const response = await fetch("https://open-api.kakaopay.com/online/v1/payment/approve", {
      method: "POST",
      headers: {
        "Authorization": `SECRET_KEY ${process.env.KAKAO_PAY_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cid: process.env.KAKAO_PAY_CID || "TC0ONETIME",
        tid: session.tid,
        partner_order_id: session.orderId,
        partner_user_id: session.userId,
        pg_token: pg_token
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("KakaoPay Approve Error:", errorText);
      return res.redirect("/?payment=fail");
    }

    const data = await response.json();
    
    // DB에 결제 기록 추가
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      courseId: session.orderId, // 실제로는 강의 ID
      courseTitle: session.itemName,
      userId: session.userId,
      amount: data.amount.total,
      method: "카카오페이",
      date: new Date().toISOString().split("T")[0],
      status: "완료"
    };

    db.update("payments", (payments) => [newPayment, ...payments]);
    
    res.redirect("/?payment=success");
  } catch (error) {
    console.error("KakaoPay Approve Failed", error);
    res.redirect("/?payment=error");
  }
});

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
    cardDetails: payment.method === "카드" ? "현대카드 (5428-****-****-9102)" : payment.method,
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
