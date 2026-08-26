import React from "react";
import { X, Send, Wrench, Calendar, Code2, Link2, Mail, Users, CheckCircle } from "lucide-react";
import type { IdeaRequest, IdeaProposal } from "../types";
import { api } from "../lib/api";

interface IdeaProposalModalProps {
  request: IdeaRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onProposalSubmitted: (proposal: IdeaProposal) => void;
  proposerName?: string;
  proposerId?: string;
}

export default function IdeaProposalModal({
  request,
  isOpen,
  onClose,
  onProposalSubmitted,
  proposerName = "오승환",
  proposerId = "u-builder-1",
}: IdeaProposalModalProps) {
  const [teamSummary, setTeamSummary] = React.useState("풀스택 개발자 1인 + LLM 에이전트 전문 개발자 1인 팀");
  const [techStackInput, setTechStackInput] = React.useState("React, TypeScript, FastAPI, OpenAI API, MongoDB");
  const [estimatedWeeks, setEstimatedWeeks] = React.useState(4);
  const [planSummary, setPlanSummary] = React.useState("");
  const [portfolioUrl, setPortfolioUrl] = React.useState("https://github.com/example/portfolio");
  const [contactEmail, setContactEmail] = React.useState("builder.team@gmail.com");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (request) {
      setPlanSummary(
        `안녕하세요, ${request.requestedBy.userName} 발제자님!\n귀하의 '${request.title}' 아이디어에 깊이 공감하며, 4주 이내에 상용화 가능한 MVP를 제작하고자 제안드립니다.\n\n[주요 개발 마일스톤]\n- 1~2주차: 핵심 데이터 파이프라인 및 AI 백엔드 API 구현\n- 3주차: 사용자 UI/UX 및 반응형 프론트엔드 연동\n- 4주차: 결제/인증 및 클라우드 배포, 테스트 완료`
      );
    }
  }, [request, isOpen]);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamSummary.trim() || !planSummary.trim()) {
      alert("팀 소개와 MVP 제작 계획을 입력해주세요.");
      return;
    }

    const techStack = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      const res = await api.submitIdeaProposal(request.id, {
        proposerId,
        proposerName,
        proposerAvatar: "",
        teamSummary: teamSummary.trim(),
        techStack,
        planSummary: planSummary.trim(),
        estimatedWeeks: Number(estimatedWeeks) || 4,
        portfolioUrl: portfolioUrl.trim(),
        contactEmail: contactEmail.trim(),
      });

      alert(`'${request.title}' 의뢰에 제작 제안서가 성공적으로 전달되었습니다!`);
      onProposalSubmitted(res.proposal);
      onClose();
    } catch (error) {
      console.error("Failed to submit idea proposal", error);
      alert("제작 제안서 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-brand-surface/95 border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🛠️ 빌더 팀 제작 역제안서 작성 <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">빌더 역제안</span>
              </h2>
              <p className="text-xs text-white/60">
                발제된 아이디어를 현실로 구현할 빌더 팀의 기술 스택과 MVP 개발 계획을 제안하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Request Info Box */}
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs text-cyan-400 font-semibold mb-1">대상 아이디어 의뢰</div>
          <div className="text-sm font-bold text-white mb-1.5">{request.title}</div>
          <div className="text-xs text-white/70 mb-2">{request.solutionConcept}</div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
            <span>발제자: <b className="text-white/80">{request.requestedBy.userName}</b></span>
            <span>•</span>
            <span>협업 조건: <b className="text-emerald-400 font-bold">{request.rewardType} ({request.rewardDetail || "협의"})</b></span>
            <span>•</span>
            <span>공감 잠재고객: <b className="text-blue-400 font-bold">{request.upvoteCount}명</b></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Team Summary */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> 제안자 / 빌더 팀 구성 소개 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={teamSummary}
              onChange={(e) => setTeamSummary(e.target.value)}
              placeholder="예: 테크 스타트업 출신 풀스택 1인 + LLM 엔지니어 1인 팀"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          {/* Tech Stack & Estimated Weeks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" /> 추천 기술 스택 (쉼표 구분)
              </label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="예: React, TypeScript, FastAPI, OpenAI"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> 예상 MVP 제작 기간 (주)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={estimatedWeeks}
                onChange={(e) => setEstimatedWeeks(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Portfolio & Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" /> 포트폴리오 / Github 링크
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> 연락용 이메일
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="builder@gmail.com"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Plan Summary */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              MVP 제작 계획 및 발제자에게 전하는 제안 메시지 <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={planSummary}
              onChange={(e) => setPlanSummary(e.target.value)}
              placeholder="구체적인 개발 마일스톤, 팀의 강점, 제안 조건을 작성해주세요."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? "제안서 전송 중..." : "제작 제안서 전송하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
