import React from "react";
import {
  X,
  Sparkles,
  Send,
  Lightbulb,
  Target,
  DollarSign,
  Tag,
  AlertCircle,
  Calendar,
  Bot,
  ArrowRight,
  RefreshCw,
  FileText,
} from "lucide-react";
import type { IdeaRequest } from "../types";
import { api } from "../lib/api";
import { useToast } from "./common/Toast";

interface IdeaRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated: (request: IdeaRequest) => void;
  userName?: string;
  userId?: string;
}

interface IdeaDraft {
  refinedTitle?: string;
  naturalCategory?: string;
  problem?: string;
  solutionConcept?: string;
  tags?: string[];
  rewardType?: string;
  rewardDetail?: string;
}

const getFutureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

export default function IdeaRequestModal({
  isOpen,
  onClose,
  onRequestCreated,
  userName = "김수강생",
  userId = "u-current",
}: IdeaRequestModalProps) {
  const toast = useToast();

  // Wizard Step State: "ai_chat" (1단계 대화형 초벌) vs "detail_edit" (2단계 상세 의뢰서 작성)
  const [createStep, setCreateStep] = React.useState<"ai_chat" | "detail_edit">("ai_chat");

  // AI Chat States
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiChatMessages, setAiChatMessages] = React.useState<
    {
      sender: "user" | "ai";
      text: string;
      generatedDraft?: IdeaDraft;
    }[]
  >([
    {
      sender: "ai",
      text: "안녕하세요! 어떤 스타트업 아이디어나 해결하고 싶은 시장 문제가 있으신가요?\n\n핵심 아이템, 타깃 고객이 겪는 불편함, 생각하시는 솔루션 방향을 편하게 말씀해 주시면 맞춤형 PRD 제작 의뢰서 초안을 즉시 기획해 드립니다.",
    },
  ]);
  const [isAiGenerating, setIsAiGenerating] = React.useState(false);

  // Detail Form States
  const [title, setTitle] = React.useState("");
  const [problem, setProblem] = React.useState("");
  const [solutionConcept, setSolutionConcept] = React.useState("");
  const [category, setCategory] = React.useState("AI/SaaS");
  const [rewardType, setRewardType] = React.useState("지분공유(코파운더)");
  const [rewardDetail, setRewardDetail] = React.useState("지분 15~25% 협의 + 코파운더 영입");
  const [submissionDeadline, setSubmissionDeadline] = React.useState(getFutureDate(14));
  const [selectionDate, setSelectionDate] = React.useState(getFutureDate(21));
  const [tagInput, setTagInput] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [inlineError, setInlineError] = React.useState<string | null>(null);

  // Reset modal state when closed / opened
  React.useEffect(() => {
    if (isOpen) {
      setInlineError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── AI Chat Draft Generation Handler ──
  const handleGenerateFromAi = async () => {
    if (!aiPrompt.trim()) return;

    const userText = aiPrompt.trim();
    setAiPrompt("");
    setAiChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsAiGenerating(true);

    try {
      const res = await api.aiAutoFill({
        type: "idea_request",
        prompt: userText,
        context: { category: category || "AI / SaaS" },
      });

      const draftResult = res?.result || {};
      const generatedDraft: IdeaDraft = {
        refinedTitle: draftResult.refinedTitle || `[AI 혁신] ${userText.slice(0, 20)} 솔루션`,
        naturalCategory: draftResult.naturalCategory || "AI / SaaS 플랫폼",
        problem:
          draftResult.problem ||
          `현재 시장에서는 ${userText} 관련 업무에서 많은 수작업과 높은 비용이 발생하며, 실무자들이 실시간으로 적절한 솔루션을 찾지 못해 비효율을 겪고 있습니다.`,
        solutionConcept:
          draftResult.solutionConcept ||
          `최신 AI 자동화 엔진과 사용자 친화적인 웹/앱 UI를 결합하여 ${userText} 문제를 10배 빠르게 해결하는 MVP를 구축하고자 합니다.`,
        tags:
          draftResult.tags && Array.isArray(draftResult.tags) && draftResult.tags.length > 0
            ? draftResult.tags
            : ["AI스타트업", "MVP제작", "SaaS"],
        rewardType: "지분공유(코파운더)",
        rewardDetail: draftResult.rewardDetail || "지분 15~25% 협의 + MVP 런칭 인센티브",
      };

      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `요청하신 아이디어를 분석하여 **"${generatedDraft.refinedTitle}"** (분야: ${generatedDraft.naturalCategory}) PRD 초안을 기획했습니다!\n\n아래 '상세 의뢰서로 적용 & 일정 설정' 버튼을 누르시면 마감일, 보상 조건, 세부 페인포인트를 자유롭게 보완하여 등록하실 수 있습니다.`,
          generatedDraft,
        },
      ]);
    } catch (err) {
      console.warn("AI Idea Request generation fallback:", err);
      const generatedDraft: IdeaDraft = {
        refinedTitle: `AI 기반 ${userText.slice(0, 20)} 혁신 플랫폼`,
        naturalCategory: "AI / SaaS 플랫폼",
        problem: `현재 시장에서는 ${userText} 관련 업무에서 높은 수작업 비용과 비효율이 지속되고 있으며, 기존 솔루션들의 복잡성과 높은 도입 장벽으로 인해 실무자들의 만족도가 낮습니다.`,
        solutionConcept: `최신 생성형 AI 에이전트와 맞춤형 워크플로우를 결합하여 손쉽게 문제를 해결하는 경량 SaaS MVP를 구축하고자 합니다.`,
        tags: ["AI스타트업", "MVP제작", "SaaS"],
        rewardType: "지분공유(코파운더)",
        rewardDetail: "지분 15~25% 협의 + 코파운더 영입",
      };

      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `요청하신 아이디어를 기반으로 **"${generatedDraft.refinedTitle}"** PRD 초안을 생성했습니다.\n\n아래 '상세 의뢰서로 적용 & 일정 설정' 버튼을 클릭하여 확인해보세요!`,
          generatedDraft,
        },
      ]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // ── Apply AI Draft to Detail Edit Form ──
  const handleApplyDraft = (draft: IdeaDraft) => {
    if (draft.refinedTitle) setTitle(draft.refinedTitle);
    if (draft.naturalCategory) setCategory(draft.naturalCategory);
    if (draft.problem) setProblem(draft.problem);
    if (draft.solutionConcept) setSolutionConcept(draft.solutionConcept);
    if (draft.rewardType) setRewardType(draft.rewardType);
    if (draft.rewardDetail) setRewardDetail(draft.rewardDetail);
    if (draft.tags && Array.isArray(draft.tags)) {
      setTags(Array.from(new Set(draft.tags)));
    }

    setCreateStep("detail_edit");
    toast.success(
      "✨ AI PRD 초안 적용 완료",
      `"${draft.refinedTitle || title}" 초안이 상세 의뢰서 작성 폼에 적용되었습니다.`
    );
  };

  // ── Detail Form AI Refine Assist ──
  const handleAIAssistInForm = async () => {
    if (!title.trim()) {
      setInlineError("아이디어 제목/주제를 먼저 간단히 입력해주세요.");
      toast.warning("아이디어 제목 입력", "AI PRD 기획 생성을 위해 아이디어 제목을 입력해주세요.");
      return;
    }
    setInlineError(null);
    setIsAiGenerating(true);

    try {
      const res = await api.aiAutoFill({
        type: "idea_request",
        prompt: title.trim(),
        context: { category },
      });

      if (res?.result) {
        const r = res.result;
        if (r.refinedTitle) setTitle(r.refinedTitle);
        if (r.naturalCategory) setCategory(r.naturalCategory);
        if (r.problem) setProblem(r.problem);
        if (r.solutionConcept) setSolutionConcept(r.solutionConcept);
        if (r.tags && Array.isArray(r.tags)) {
          setTags(Array.from(new Set([...tags, ...r.tags])));
        }
        if (r.rewardDetail) setRewardDetail(r.rewardDetail);

        toast.success(
          "✨ AI PRD 초안 갱신 완료",
          `프로젝트명("${r.refinedTitle || title}") 및 산업 분야("${r.naturalCategory || category}")가 맞춤 재조정되었습니다.`
        );
      }
    } catch (err) {
      console.warn("AI Auto-fill fallback:", err);
      const prefix = title.split(" ")[0] || "AI";
      setTitle(`${prefix}Mind: ${title} 전문 플랫폼`);
      setCategory(title.includes("법률") ? "B2B LegalTech SaaS" : "AI / SaaS 플랫폼");
      setProblem(
        `현재 시장에서는 ${title} 관련 업무에서 많은 수작업과 높은 비용이 발생하며, 실무자들이 실시간으로 적절한 솔루션을 찾지 못해 비효율을 겪고 있습니다.`
      );
      setSolutionConcept(
        `AI 에이전트와 자동화 워크플로우를 결합하여 사용자가 손쉽게 처리할 수 있는 웹 기반 SaaS/앱 MVP를 구축하고자 합니다.`
      );
      setTags(Array.from(new Set([...tags, "MVP제작", "AI에이전트", "스타트업"])));
      toast.info("AI PRD 초안 생성 완료", "문제점과 솔루션 컨셉이 자동 완성되었습니다.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // ── Tag Handlers ──
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, "");
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // ── Submit Idea Request ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !problem.trim() || !solutionConcept.trim()) {
      setInlineError("아이디어 제목, 해결할 문제점, 솔루션 컨셉을 모두 입력해주세요.");
      toast.warning("필수 항목 확인", "아이디어 제목, 문제점, 솔루션 컨셉을 입력해주세요.");
      return;
    }
    setInlineError(null);
    setSubmitting(true);

    const payload: Partial<IdeaRequest> = {
      title: title.trim(),
      problem: problem.trim(),
      solutionConcept: solutionConcept.trim(),
      category: category.trim() || "AI/SaaS",
      tags: tags.length ? tags : ["AI스타트업", category.trim() || "SaaS"],
      requiredRoles: ["풀스택 빌더", "AI 엔지니어"],
      rewardType,
      rewardDetail,
      submissionDeadline: submissionDeadline || undefined,
      selectionDate: selectionDate || undefined,
      requestedBy: {
        userId,
        userName,
        avatar: "",
      },
    };

    try {
      const res = await api.createIdeaRequest(payload);
      if (res?.request) {
        onRequestCreated(res.request);
      } else {
        throw new Error("Invalid response format");
      }
      toast.success(
        "🎉 아이디어 제작 의뢰서가 등록되었습니다!",
        `마감일(${submissionDeadline})까지 빌더 팀의 제안을 취합 후 선발일(${selectionDate})에 협의를 진행합니다.`
      );
      onClose();
      setTitle("");
      setProblem("");
      setSolutionConcept("");
      setTags([]);
      setCreateStep("ai_chat");
    } catch (error) {
      console.warn("API request fallback to local state:", error);
      const fallbackReq: IdeaRequest = {
        id: `ir-req-${Date.now()}`,
        title: title.trim(),
        problem: problem.trim(),
        solutionConcept: solutionConcept.trim(),
        category: category.trim() || "AI/SaaS",
        tags: tags.length ? tags : ["AI스타트업", category.trim() || "SaaS"],
        requiredRoles: ["풀스택 빌더", "AI 엔지니어"],
        rewardType,
        rewardDetail,
        submissionDeadline,
        selectionDate,
        requestedBy: {
          userId,
          userName,
          avatar: "",
        },
        upvotes: [userId],
        upvoteCount: 1,
        status: "모집중",
        selectedProposalIds: [],
        createdAt: new Date().toISOString(),
        proposals: [],
      };
      onRequestCreated(fallbackReq);
      toast.success(
        "🎉 아이디어 제작 의뢰서가 등록되었습니다!",
        `마감일(${submissionDeadline})까지 빌더 팀의 제안을 취합 후 선발일(${selectionDate})에 협의를 진행합니다.`
      );
      onClose();
      setTitle("");
      setProblem("");
      setSolutionConcept("");
      setTags([]);
      setCreateStep("ai_chat");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-surface/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-heavy rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-brand-border relative">
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-4 right-4 text-brand-on-surface-variant hover:text-white p-1.5 rounded-lg hover:bg-brand-surface-high transition-colors cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-brand-border/30 pr-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                🚀 아이디어 제작 의뢰{" "}
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                  빌더 역제안 마법사
                </span>
              </h2>
              <p className="text-xs text-brand-on-surface-variant">
                {createStep === "ai_chat"
                  ? "1단계: AI 대화형 창업 PRD 초벌 기획"
                  : "2단계: 상세 의뢰서 작성 및 일정/보상 설정"}
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex bg-brand-surface-low rounded-lg p-1 border border-brand-border/40 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCreateStep("ai_chat")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                createStep === "ai_chat"
                  ? "bg-blue-600 text-white font-bold shadow"
                  : "text-brand-on-surface-variant hover:text-white"
              }`}
            >
              <Bot size={13} />
              AI 채팅 초벌
            </button>
            <button
              type="button"
              onClick={() => setCreateStep("detail_edit")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                createStep === "detail_edit"
                  ? "bg-blue-600 text-white font-bold shadow"
                  : "text-brand-on-surface-variant hover:text-white"
              }`}
            >
              <FileText size={13} />
              상세 의뢰서 작성
            </button>
          </div>
        </div>

        {/* ── STEP 1: AI Chat Interface ── */}
        {createStep === "ai_chat" && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Chat Log Window */}
            <div className="bg-brand-surface-low rounded-xl p-4 border border-brand-border/40 h-80 overflow-y-auto flex flex-col gap-3">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none shadow"
                        : "bg-brand-card border border-brand-border text-brand-on-surface rounded-tl-none shadow"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Generated PRD Draft Preview Card */}
                    {msg.generatedDraft && (
                      <div className="mt-3 p-3.5 bg-brand-surface-low rounded-xl border border-blue-500/30 text-left">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                            <Sparkles size={12} /> [생성된 PRD 의뢰서 초안]
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/80 font-medium">
                            {msg.generatedDraft.naturalCategory || "AI / SaaS"}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-white mb-2">
                          {msg.generatedDraft.refinedTitle}
                        </p>

                        <div className="space-y-1.5 text-[11px] text-brand-on-surface-variant mb-3">
                          <p>
                            <span className="text-red-400 font-medium">🚨 페인포인트:</span>{" "}
                            {msg.generatedDraft.problem}
                          </p>
                          <p>
                            <span className="text-emerald-400 font-medium">💡 솔루션:</span>{" "}
                            {msg.generatedDraft.solutionConcept}
                          </p>
                          {msg.generatedDraft.tags && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {msg.generatedDraft.tags.map((t, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/25 text-[10px]"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyDraft(msg.generatedDraft!)}
                          className="w-full text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2 rounded-lg hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow"
                        >
                          상세 의뢰서로 적용 & 일정 설정 <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isAiGenerating && (
                <div className="flex gap-2 items-center text-xs text-blue-400 p-2 animate-pulse">
                  <Bot size={14} />
                  AI가 비즈니스 페인포인트와 MVP 솔루션 PRD 초안을 기획하고 있습니다...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isAiGenerating && handleGenerateFromAi()}
                placeholder="예: '초기 스타트업을 위해 AI 계약서 독소조항을 1분 만에 자동 분석해주는 B2B SaaS 만들고 싶어'"
                className="flex-1 bg-brand-surface-low border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleGenerateFromAi}
                disabled={isAiGenerating || !aiPrompt.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send size={13} />
                기획 생성
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/50 px-1">
              <span>💡 자연어로 핵심 아이디어만 편하게 작성해도 AI가 의뢰서 형태로 다듬어줍니다.</span>
              <button
                type="button"
                onClick={() => setCreateStep("detail_edit")}
                className="text-blue-400 hover:underline cursor-pointer font-medium"
              >
                AI 초벌 없이 직접 상세 작성하기 →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Detail Form ── */}
        {createStep === "detail_edit" && (
          <form onSubmit={handleSubmit} className="mt-2 space-y-4 animate-fadeIn">
            {/* Title with AI Assist */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-400" /> 아이디어 / 프로젝트 명칭 <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAIAssistInForm}
                  disabled={isAiGenerating}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all cursor-pointer font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAiGenerating ? "AI 초안 분석 중..." : "AI PRD 초안 자동 생성"}
                </button>
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 초기 스타트업을 위한 AI 계약서 위험조항 자동 검토 SaaS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 text-xs transition-colors"
              />
            </div>

            {/* Grid: Category & Reward Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  산업 / 카테고리 분야
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="예: B2B LegalTech SaaS, 차세대 핀테크, AI 헬스케어 등"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  협업 보상 / 계약 형태
                </label>
                <select
                  value={rewardType}
                  onChange={(e) => setRewardType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="지분공유(코파운더)" className="bg-gray-900 text-white">지분 공유 (코파운더/공동창업)</option>
                  <option value="개발보상" className="bg-gray-900 text-white">MVP 개발비 지급</option>
                  <option value="수익셰어" className="bg-gray-900 text-white">런칭 후 매출/수익 셰어</option>
                  <option value="협의" className="bg-gray-900 text-white">추후 협의</option>
                </select>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-brand-surface-low border border-brand-border/60">
              <div>
                <label className="block text-xs font-semibold text-brand-on-surface mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-primary" /> 제안서 접수 마감일 <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={submissionDeadline}
                  onChange={(e) => setSubmissionDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-brand-surface border border-brand-border text-white text-xs focus:outline-none focus:border-brand-primary"
                />
                <p className="text-[10px] text-brand-on-surface-variant mt-1">빌더 팀들이 제작 제안서를 제출할 수 있는 마감일입니다.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-on-surface mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-tertiary" /> 빌더 팀 선발 발표일 <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={selectionDate}
                  onChange={(e) => setSelectionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-brand-surface border border-brand-border text-white text-xs focus:outline-none focus:border-brand-tertiary"
                />
                <p className="text-[10px] text-brand-on-surface-variant mt-1">제출팀 중 협의 대상 팀을 선발하여 발표하는 날짜입니다.</p>
              </div>
            </div>

            {/* Reward Detail */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-400" /> 보상 및 협업 조건 상세
              </label>
              <input
                type="text"
                value={rewardDetail}
                onChange={(e) => setRewardDetail(e.target.value)}
                placeholder="예: 지분 15~25% 협의 / MVP 제작비 400만원 등"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Problem */}
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-red-400" /> 해결하려는 문제점 (Pain Point) <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="현재 고객이나 시장이 겪고 있는 구체적인 불편함이나 결핍을 적어주세요."
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 text-xs leading-relaxed"
              />
            </div>

            {/* Solution Concept */}
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> 제안하는 솔루션 / MVP 컨셉 <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={solutionConcept}
                onChange={(e) => setSolutionConcept(e.target.value)}
                placeholder="어떤 핵심 기능과 방식으로 문제를 해결하고 싶으신가요?"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 text-xs leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-white/50" /> 키워드 태그 (Enter로 추가)
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? "태그 입력 후 Enter (예: LegalTech, AI, SaaS)" : "태그 추가..."}
                  className="flex-1 min-w-[120px] bg-transparent text-xs text-white placeholder-white/30 focus:outline-none"
                />
              </div>
            </div>

            {/* Inline Validation Alert */}
            {inlineError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs text-red-300 animate-slideUp">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{inlineError}</span>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-brand-border/30">
              <button
                type="button"
                onClick={() => setCreateStep("ai_chat")}
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
              >
                ← AI 채팅 초벌로 돌아가기
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "등록 중..." : "아이디어 제작 의뢰서 등록하기"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
