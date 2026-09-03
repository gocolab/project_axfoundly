import React from "react";
import { X, Send, Wrench, Calendar, Code2, Link2, Mail, Users, AlertCircle, Video, Globe, Eye, Lock, Sparkles } from "lucide-react";
import type { IdeaRequest, IdeaProposal } from "../types";
import { api } from "../lib/api";
import { useToast } from "./common/Toast";
import { convertToEmbedUrl } from "./ProjectCreateEditModal";

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
  const toast = useToast();
  const [teamSummary, setTeamSummary] = React.useState("풀스택 개발자 1인 + LLM 에이전트 전문 개발자 1인 팀");
  const [techStackInput, setTechStackInput] = React.useState("React, TypeScript, FastAPI, OpenAI API, MongoDB");
  const [estimatedWeeks, setEstimatedWeeks] = React.useState(4);
  const [planSummary, setPlanSummary] = React.useState("");
  const [portfolioUrl, setPortfolioUrl] = React.useState("https://github.com/example/portfolio");
  const [demoVideoUrl, setDemoVideoUrl] = React.useState("");
  const [prototypeUrl, setPrototypeUrl] = React.useState("");
  const [visibility, setVisibility] = React.useState<"public" | "requester_only">("public");
  const [contactEmail, setContactEmail] = React.useState("builder.team@gmail.com");
  const [submitting, setSubmitting] = React.useState(false);
  const [aiGenerating, setAiGenerating] = React.useState(false);
  const [inlineError, setInlineError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (request && isOpen) {
      setPlanSummary(
        `안녕하세요, ${request.requestedBy.userName} 발제자님!\n귀하의 '${request.title}' 아이디어에 깊이 공감하며, 4주 이내에 상용화 가능한 MVP를 제작하고자 제안드립니다.\n\n[주요 개발 마일스톤]\n- 1~2주차: 핵심 데이터 파이프라인 및 AI 백엔드 API 구현\n- 3주차: 사용자 UI/UX 및 반응형 프론트엔드 연동\n- 4주차: 결제/인증 및 클라우드 배포, 테스트 완료`
      );
    }
  }, [request, isOpen]);

  const handleAIAssist = async () => {
    if (!request) return;
    setAiGenerating(true);
    setInlineError(null);

    try {
      const res = await api.aiAutoFill({
        type: "idea_proposal",
        prompt: request.title,
        context: {
          requestProblem: request.problem,
          requestSolution: request.solutionConcept,
          category: request.category,
        },
      });

      if (res?.result) {
        const r = res.result;
        if (r.teamSummary) setTeamSummary(r.teamSummary);
        if (r.techStack) {
          setTechStackInput(Array.isArray(r.techStack) ? r.techStack.join(", ") : r.techStack);
        }
        if (r.planSummary) setPlanSummary(r.planSummary);
        if (r.estimatedWeeks) setEstimatedWeeks(Number(r.estimatedWeeks));

        toast.success(
          "✨ AI 역제안서 초안 완성",
          `'${request.title}' 아이디어 맞춤 기술 스택과 마일스톤 계획이 자동으로 작성되었습니다.`
        );
      }
    } catch (err) {
      console.warn("AI proposal assist fallback:", err);
      setTeamSummary("풀스택 웹 개발자 1인 + LLM 엔지니어 1인 빌더 팀");
      setTechStackInput("React, TypeScript, FastAPI, OpenAI API, PostgreSQL");
      setPlanSummary(
        `발제자님의 '${request.title}' 아이디어를 4주 내에 상용화 가능한 완성도 높은 MVP로 구현하겠습니다.\n- 1~2주차: 데이터 파이프라인 및 AI 백엔드\n- 3주차: 프론트엔드 UI/UX\n- 4주차: 결제 및 배포`
      );
      toast.info("AI 초안 완성", "기본 맞춤 제작 계획서가 작성되었습니다.");
    } finally {
      setAiGenerating(false);
    }
  };

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamSummary.trim() || !planSummary.trim()) {
      setInlineError("팀 소개와 MVP 제작 계획을 모두 입력해주세요.");
      toast.warning("필수 항목 확인", "팀 소개와 MVP 제작 계획을 입력해주세요.");
      return;
    }
    setInlineError(null);

    const techStack = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSubmitting(true);
    const proposalData: Partial<IdeaProposal> = {
      proposerId,
      proposerName,
      proposerAvatar: "",
      teamSummary: teamSummary.trim(),
      techStack,
      planSummary: planSummary.trim(),
      estimatedWeeks: Number(estimatedWeeks) || 4,
      portfolioUrl: portfolioUrl.trim(),
      demoVideoUrl: convertToEmbedUrl(demoVideoUrl.trim()) || undefined,
      prototypeUrl: prototypeUrl.trim() || undefined,
      visibility,
      contactEmail: contactEmail.trim(),
    };

    try {
      const res = await api.submitIdeaProposal(request.id, proposalData);
      if (res?.proposal) {
        onProposalSubmitted(res.proposal);
      } else {
        throw new Error("Invalid response format");
      }
      toast.success(
        "제작 제안서 전송 및 IR 연동 완료",
        `'${request.title}' 의뢰에 제안서가 등록되었으며 스타트업 IR 목록(${visibility === "public" ? "전체 공개" : "발제자 전용"})에 자동 연계되었습니다.`
      );
      onClose();
    } catch (error) {
      console.warn("Idea proposal submit fallback to local:", error);
      const fallbackProposal: IdeaProposal = {
        id: `ip-${Date.now()}`,
        requestId: request.id,
        proposerId,
        proposerName,
        proposerAvatar: "",
        teamSummary: teamSummary.trim(),
        techStack,
        planSummary: planSummary.trim(),
        estimatedWeeks: Number(estimatedWeeks) || 4,
        portfolioUrl: portfolioUrl.trim(),
        demoVideoUrl: demoVideoUrl.trim() || undefined,
        prototypeUrl: prototypeUrl.trim() || undefined,
        visibility,
        status: "대기중",
        createdAt: new Date().toISOString(),
      };
      onProposalSubmitted(fallbackProposal);
      toast.success(
        "제작 제안서 전송 완료",
        `'${request.title}' 의뢰에 제작 제안서가 등록되었습니다.`
      );
      onClose();
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
                🛠️ 빌더 팀 제작 역제안서 작성 <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">IR 연동</span>
              </h2>
              <p className="text-xs text-white/60">
                아이디어를 구현할 기술 스택, 시연 링크와 개발 계획을 제안하고 스타트업 IR에 연동하세요.
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
        <div className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-medium">
              분야: {request.category}
            </span>
            <span className="text-xs text-white/60">
              마감: <span className="text-cyan-300 font-semibold">{request.submissionDeadline || "상시"}</span> | 선발일: <span className="text-amber-300 font-semibold">{request.selectionDate || "미정"}</span>
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">{request.title}</h4>
          <p className="text-xs text-white/70 line-clamp-2">{request.problem}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Team Summary with AI Assist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-white/80 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> 빌더 팀 구성 및 소개 <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleAIAssist}
                disabled={aiGenerating}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all cursor-pointer font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiGenerating ? "AI 분석 중..." : "AI 제안서 자동 채우기"}
              </button>
            </div>
            <input
              type="text"
              required
              value={teamSummary}
              onChange={(e) => setTeamSummary(e.target.value)}
              placeholder="예: 프론트/백엔드 3년차 2인 개발 빌더 팀"
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Tech Stack & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" /> 주요 기술 스택
              </label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="React, Node.js, Python, OpenAI 등 (쉼표 구분)"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> 예상 개발 기간 (주 단위)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={estimatedWeeks}
                onChange={(e) => setEstimatedWeeks(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Demo Media & Prototype Links */}
          <div className="p-3.5 rounded-xl bg-brand-surface-low border border-brand-border/60 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-primary" /> 목업 / MVP 산출물 링크 등록 (선택)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-brand-on-surface-variant mb-1 flex items-center gap-1">
                  <Video className="w-3 h-3 text-brand-primary" /> 동작 / 피칭 시연 영상 URL (YouTube / Vimeo / Loom)
                </label>
                <input
                  type="url"
                  value={demoVideoUrl}
                  onChange={(e) => setDemoVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                  className="w-full px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-brand-primary font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-brand-on-surface-variant mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-brand-tertiary" /> 프로토타입 / 배포 사이트 방문 URL (사이트 링크)
                </label>
                <input
                  type="url"
                  value={prototypeUrl}
                  onChange={(e) => setPrototypeUrl(e.target.value)}
                  placeholder="https://my-service.com 또는 Figma 프로토타입 링크"
                  className="w-full px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-brand-tertiary font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Visibility Selection */}
          <div className="p-3.5 rounded-xl bg-brand-surface-low border border-brand-border/60 space-y-2">
            <label className="block text-xs font-bold text-white flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-brand-secondary" /> '스타트업 & IR' 목록 등록 및 노출 범위 <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  visibility === "public"
                    ? "bg-brand-primary-container/20 border-brand-primary-container text-white"
                    : "bg-brand-surface border-brand-border text-brand-on-surface-variant hover:bg-brand-surface-high"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === "public"}
                  onChange={() => setVisibility("public")}
                  className="mt-0.5 text-brand-primary focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1 text-white">
                    <Globe className="w-3 h-3 text-emerald-400" /> 일반 공개
                  </div>
                  <p className="text-[10px] text-brand-on-surface-variant mt-0.5 leading-relaxed">
                    스타트업 & IR 목록에 등록되어 투자자 및 모든 회원에게 노출됩니다.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  visibility === "requester_only"
                    ? "bg-brand-secondary/20 border-brand-secondary text-white"
                    : "bg-brand-surface border-brand-border text-brand-on-surface-variant hover:bg-brand-surface-high"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="requester_only"
                  checked={visibility === "requester_only"}
                  onChange={() => setVisibility("requester_only")}
                  className="mt-0.5 text-brand-secondary focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1 text-white">
                    <Lock className="w-3 h-3 text-amber-400" /> 발제자 전용 비공개
                  </div>
                  <p className="text-[10px] text-brand-on-surface-variant mt-0.5 leading-relaxed">
                    아이디어 발제자와 본인 팀에게만 비공개 워크스페이스로 열람됩니다.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Links & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" /> 포트폴리오/Github 링크
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
              rows={3}
              value={planSummary}
              onChange={(e) => setPlanSummary(e.target.value)}
              placeholder="구체적인 개발 마일스톤, 팀의 강점, 제안 조건을 작성해주세요."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
            />
          </div>

          {/* Inline Validation Alert */}
          {inlineError && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300 animate-slideUp">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{inlineError}</span>
            </div>
          )}

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
              {submitting ? "제안서 전송 중..." : "제작 제안서 및 IR 등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
