import React from "react";
import { X, Video, ShieldCheck, Calendar, FileText, CheckCircle, ExternalLink, Sparkles, Send } from "lucide-react";
import type { IRProject } from "../types";
import { api } from "../lib/api";

interface VirtualIRModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: IRProject;
  investorName?: string;
  onSuccess?: () => void;
}

export default function VirtualIRModal({
  isOpen,
  onClose,
  project,
  investorName = "이벤처 (심사역)",
  onSuccess,
}: VirtualIRModalProps) {
  const [activeTab, setActiveTab] = React.useState<"pitching" | "nda">("pitching");
  const [scheduledDate, setScheduledDate] = React.useState("2025-09-15");
  const [scheduledTime, setScheduledTime] = React.useState("14:00");
  const [feedbackAgenda, setFeedbackAgenda] = React.useState("");
  const [ndaAgreed, setNdaAgreed] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [completedResult, setCompletedResult] = React.useState<{ type: "pitching" | "nda"; data: any } | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setCompletedResult(null);
      setNdaAgreed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSchedulePitching = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.scheduleVirtualIR(project.id, {
        investorName,
        scheduledAt: `${scheduledDate} ${scheduledTime}`,
        feedbackNotes: feedbackAgenda,
      });
      setCompletedResult({ type: "pitching", data: res.meeting });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Virtual IR scheduling failed:", error);
      alert("가상 IR 피칭룸 예약에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignNDA = async () => {
    if (!ndaAgreed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await api.signNDA(project.id, {
        investorName,
        termsSummary: "지식재산권 보호, 미공개 기술/사업정보 2년 비밀유지 및 상호 투자 협의",
      });
      setCompletedResult({ type: "nda", data: res.nda });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("NDA signing failed:", error);
      alert("NDA 전자 서명에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-panel-heavy rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-brand-border text-white relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <Video size={20} className="text-brand-tertiary" />
              가상 IR 피칭룸 & 간편 전자 계약
            </h3>
            <p className="text-xs text-brand-on-surface-variant mt-0.5">
              {project.teamName} — <span className="text-brand-primary font-semibold">{project.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-brand-surface-high text-brand-on-surface-variant hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        {!completedResult && (
          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-brand-surface-low rounded-xl border border-brand-border/40">
            <button
              onClick={() => setActiveTab("pitching")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "pitching"
                  ? "bg-brand-primary-container text-white shadow-sm"
                  : "text-brand-on-surface-variant hover:text-white"
              }`}
            >
              <Calendar size={13} />
              가상 IR 피칭룸 예약
            </button>
            <button
              onClick={() => setActiveTab("nda")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "nda"
                  ? "bg-brand-primary-container text-white shadow-sm"
                  : "text-brand-on-surface-variant hover:text-white"
              }`}
            >
              <ShieldCheck size={13} />
              간편 전자 계약 (NDA)
            </button>
          </div>
        )}

        {/* Result Screen */}
        {completedResult ? (
          <div className="py-8 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle size={32} />
            </div>
            {completedResult.type === "pitching" ? (
              <>
                <h4 className="font-display text-base font-bold text-white">가상 IR 화상 피칭룸이 예약되었습니다!</h4>
                <div className="p-4 bg-brand-surface-low rounded-xl border border-brand-border/40 text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="text-brand-on-surface-variant">일시:</span>
                    <span className="font-bold text-brand-tertiary">{completedResult.data.scheduledAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-on-surface-variant">화상 회의 링크:</span>
                    <span className="font-mono text-brand-primary underline truncate max-w-[200px]">
                      {completedResult.data.meetingLink}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h4 className="font-display text-base font-bold text-white">기초 NDA 전자 서명이 완료되었습니다!</h4>
                <p className="text-xs text-brand-on-surface-variant max-w-md mx-auto">
                  '{project.teamName}'와 '{investorName}' 간의 2년 기밀유지 및 상호 투자협의 전자문서가 블록체인/타임스탬프로 안전하게 체결되었습니다.
                </p>
              </>
            )}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-brand-primary-container hover:bg-brand-primary font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        ) : activeTab === "pitching" ? (
          /* Pitching Room Form */
          <form onSubmit={handleSchedulePitching} className="space-y-4">
            <div className="p-3 bg-brand-surface-low rounded-xl border border-brand-border/40 text-xs">
              <p className="text-brand-on-surface-variant">
                🎥 <strong className="text-white">가상 IR 피칭룸</strong>은 창업팀과 투자자 간 1:1 라이브 화상 질의응답 및 BM/지표 실시간 피드백 보드를 제공합니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant mb-1">희망 미팅 일자</label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant mb-1">시간대</label>
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-on-surface-variant mb-1">집중 논의 아젠다 / 질의 내용</label>
              <textarea
                rows={3}
                placeholder="예: AI 모델 서빙 인프라 비용 구조, 초기 고객 획득(CAC) 및 PoC 성과 집중 논의"
                value={feedbackAgenda}
                onChange={(e) => setFeedbackAgenda(e.target.value)}
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-3 text-xs text-white placeholder:text-brand-on-surface-variant/50 focus:outline-none focus:border-brand-primary resize-none leading-relaxed"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-brand-border text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high transition-colors text-xs font-bold cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-tertiary text-white font-bold text-xs hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Video size={13} />
                {isSubmitting ? "예약 처리 중..." : "화상 피칭룸 예약하기"}
              </button>
            </div>
          </form>
        ) : (
          /* NDA Agreement Form */
          <div className="space-y-4">
            <div className="p-4 bg-brand-surface-low rounded-xl border border-brand-border/40 text-xs space-y-2.5 leading-relaxed">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <FileText size={14} className="text-brand-primary" />
                표준 비밀유지계약서 (NDA) 및 투자 의향 합의 요약
              </h4>
              <div className="max-h-36 overflow-y-auto p-2 bg-brand-surface border border-brand-border/30 rounded text-[11px] text-brand-on-surface-variant space-y-1.5">
                <p><strong>제1조 (목적)</strong> 본 계약은 '{project.teamName}'와 '{investorName}' 간의 투자 검토를 위해 상호 제공되는 기술 및 영업비밀을 보호함을 목적으로 합니다.</p>
                <p><strong>제2조 (비밀의 범위)</strong> 공개된 미공개 AI 아키텍처, 소스코드, 재무지표 및 고객 데이터 일체.</p>
                <p><strong>제3조 (유효기간)</strong> 본 서명일로부터 2년간 유효합니다.</p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-brand-on-surface cursor-pointer p-2 rounded-lg bg-brand-surface-low border border-brand-border/30">
              <input
                type="checkbox"
                checked={ndaAgreed}
                onChange={(e) => setNdaAgreed(e.target.checked)}
                className="rounded accent-brand-primary-container cursor-pointer"
              />
              <span>위 NDA 조항을 확인하였으며, 전자 서명에 동의합니다.</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-brand-border text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high transition-colors text-xs font-bold cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSignNDA}
                disabled={!ndaAgreed || isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-tertiary text-white font-bold text-xs hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <ShieldCheck size={14} />
                {isSubmitting ? "서명 처리 중..." : "전자 계약 서명 완료"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
