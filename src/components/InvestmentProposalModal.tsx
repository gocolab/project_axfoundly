import React from "react";
import { X, TrendingUp, Send, Calendar, DollarSign, Sparkles } from "lucide-react";
import type { IRProject, InvestmentProposal } from "../types";
import { api } from "../lib/api";
import { useToast } from "./common/Toast";

interface InvestmentProposalModalProps {
  project: IRProject | null;
  isOpen: boolean;
  onClose: () => void;
  onProposalSent: (proposal: InvestmentProposal) => void;
}

export default function InvestmentProposalModal({
  project,
  isOpen,
  onClose,
  onProposalSent,
}: InvestmentProposalModalProps) {
  const toast = useToast();
  const [targetRound, setTargetRound] = React.useState("Seed");
  const [investmentAmount, setInvestmentAmount] = React.useState("3억원");
  const [meetingSchedule, setMeetingSchedule] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    if (project) {
      setTargetRound(project.investmentStage || "Seed");
      setMessage(
        `안녕하세요, ${project.teamName} 대표님. 귀사의 '${project.title}' 프로젝트에 깊은 인상을 받았습니다. ${project.investmentStage} 라운드 투자 검토 및 상세 피칭 미팅을 제안드립니다.`
      );
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.warning("메시지 입력 필요", "제안 메시지를 입력해주세요.");
      return;
    }

    setSending(true);
    try {
      const fullMessage = `[투자 라운드: ${targetRound} / 희망 규모: ${investmentAmount}${meetingSchedule ? ` / 미팅 희망일: ${meetingSchedule}` : ""}]\n\n${message.trim()}`;
      const res = await api.sendProposal({
        projectId: project.id,
        projectName: project.teamName,
        message: fullMessage,
      });

      toast.success("투자 제안 전달 완료", `'${project.teamName}' 팀에 투자 및 미팅 제안이 성공적으로 전달되었습니다.`);
      onProposalSent(res.proposal);
      onClose();
    } catch (error) {
      console.error("Failed to send proposal", error);
      toast.error("투자 제안 발송 실패", "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-panel-heavy rounded-2xl max-w-lg w-full shadow-2xl border border-brand-border overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-brand-border/40 flex justify-between items-center bg-brand-surface-low/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-secondary/20 text-brand-secondary flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">투자 검토 및 미팅 제안</h3>
              <p className="text-[10px] text-brand-on-surface-variant">
                수신: <span className="text-white font-semibold">{project.teamName}</span>
              </p>
            </div>

          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Round & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-white block mb-1">투자 라운드</label>
              <select
                value={targetRound}
                onChange={(e) => setTargetRound(e.target.value)}
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-primary"
              >
                <option value="Pre-Seed">Pre-Seed</option>
                <option value="Seed">Seed</option>
                <option value="Pre-A">Pre-A</option>
                <option value="Series A">Series A</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-white block mb-1">검토 투자 규모</label>
              <input
                type="text"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="예: 3억원 ~ 5억원"
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Meeting Schedule */}
          <div>
            <label className="font-semibold text-white block mb-1 flex items-center gap-1.5">
              <Calendar size={13} className="text-brand-primary" />
              희망 온/오프라인 미팅 일정 (선택)
            </label>
            <input
              type="text"
              value={meetingSchedule}
              onChange={(e) => setMeetingSchedule(e.target.value)}
              placeholder="예: 2025-08-25(월) 14:00 또는 비대면 Zoom"
              className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="font-semibold text-white block mb-1">제안 메시지 *</label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="스타트업 대표 및 팀에 전할 투자 제안 상세 메시지를 작성하세요."
              className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-3 text-white focus:outline-none focus:border-brand-primary h-28 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-on-surface-variant hover:text-white"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Send size={13} />
              {sending ? "전송 중..." : "제안서 전송"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
