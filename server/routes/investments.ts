import { Router } from "express";
import { db } from "../db.js";
import { notificationService } from "../services/notificationService.js";
import type { InvestmentProposal, Notification } from "../../src/types.js";

const router = Router();

// GET /api/investments/proposals
router.get("/proposals", (req, res) => {
  const proposals = db.get("proposals");
  res.json({ proposals });
});

// POST /api/investments/proposals (Send investment proposal / meeting request)
router.post("/proposals", (req, res) => {
  const { projectId, projectName, message } = req.body;

  if (!projectId || !message) {
    return res.status(400).json({ error: "Project ID and message are required" });
  }

  const project = db.get("irProjects").find((p) => p.id === projectId);
  const finalProjectName = projectName || project?.teamName || "스타트업";

  const newProposal: InvestmentProposal = {
    id: `prop-${Date.now()}`,
    projectId,
    projectName: finalProjectName,
    message,
    sentDate: new Date().toISOString().split("T")[0],
    status: "대기중",
  };

  db.update("proposals", (props) => [newProposal, ...props]);

  // Update matching stats
  db.update("stats", (stats) => ({
    ...stats,
    investmentMatchCount: stats.investmentMatchCount + 1,
  }));

  // Trigger Notification to project founder via Service
  notificationService.sendNotification({
    templateCode: "INVESTMENT_PROPOSAL_RECEIVED",
    category: "investor",
    type: "investor",
    title: `💼 [투자 제안] 전문 투자자로부터 '${finalProjectName}' 미팅 제안이 도착했습니다`,
    message: `투자자로부터 새로운 투자/미팅 제안이 도착했습니다: "${message.substring(0, 40)}..."`,
    targetUrl: `/mypage?tab=startup`,
    actionLabel: "투자 제안서 열람",
    data: {
      projectName: finalProjectName,
      message,
    },
  });

  res.status(201).json({ proposal: newProposal });
});

// PATCH /api/investments/proposals/:id/status (Accept / Reject)
router.patch("/proposals/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: "수락" | "거절" | "대기중" };

  let updatedProposal: InvestmentProposal | null = null;
  db.update("proposals", (props) =>
    props.map((p) => {
      if (p.id === id) {
        updatedProposal = { ...p, status };
        return updatedProposal;
      }
      return p;
    })
  );

  if (!updatedProposal) {
    return res.status(404).json({ error: "Proposal not found" });
  }

  res.json({ proposal: updatedProposal });
});

// GET /api/investments/recommendations (AI Matching Recommendations)
router.get("/recommendations", (req, res) => {
  const recommendations = db.get("recommendations");
  res.json({ recommendations });
});

export default router;
