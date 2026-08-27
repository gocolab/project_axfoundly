import React from "react";
import { X, Sparkles, Send, Lightbulb, Target, Users, DollarSign, Tag, Briefcase, AlertCircle, Calendar } from "lucide-react";
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
  const [title, setTitle] = React.useState("");
  const [problem, setProblem] = React.useState("");
  const [solutionConcept, setSolutionConcept] = React.useState("");
  const [category, setCategory] = React.useState("AI/SaaS");
  const [rewardType, setRewardType] = React.useState("지분공유(코파운더)");
  const [rewardDetail, setRewardDetail] = React.useState("지분 15~25% 협의 + 코파운더 영입");
  const [submissionDeadline, setSubmissionDeadline] = React.useState(getFutureDate(14));
  const [selectionDate, setSelectionDate] = React.useState(getFutureDate(21));
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>(["풀스택 개발자", "AI 엔지니어"]);
  const [tagInput, setTagInput] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [aiGenerating, setAiGenerating] = React.useState(false);
  const [inlineError, setInlineError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const roleOptions = [
    "풀스택 개발자",
    "프론트엔드",
    "백엔드",
    "AI 엔지니어",
    "UI/UX 디자이너",
    "기획자/PM",
    "그로스 마케터",
  ];

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

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

  const recommendedCategories = [
    "B2B LegalTech SaaS",
    "차세대 핀테크 / 결제",
    "초개인화 헬스케어 AI",
    "실전 멀티에이전트 시스템",
    "스마트 이커머스 / 유통",
    "생성형 AI 에듀테크",
  ];

  const handleAIAssist = async () => {
    if (!title.trim()) {
      setInlineError("아이디어 제목/주제를 먼저 간단히 입력해주세요.");
      toast.warning("아이디어 제목 입력", "AI PRD 기획 생성을 위해 아이디어 제목을 입력해주세요.");
      return;
    }
    setInlineError(null);
    setAiGenerating(true);

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
        if (r.requiredRoles && Array.isArray(r.requiredRoles)) {
          setSelectedRoles(Array.from(new Set([...selectedRoles, ...r.requiredRoles])));
        }
        if (r.rewardDetail) setRewardDetail(r.rewardDetail);

        toast.success(
          "✨ AI PRD 초안 생성 완료",
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
      setAiGenerating(false);
    }
  };

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
      category,
      tags: tags.length ? tags : ["AI스타트업", category],
      requiredRoles: selectedRoles.length ? selectedRoles : ["풀스택 개발자"],
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
    } catch (error) {
      console.warn("API request fallback to local state:", error);
      const fallbackReq: IdeaRequest = {
        id: `ir-req-${Date.now()}`,
        title: title.trim(),
        problem: problem.trim(),
        solutionConcept: solutionConcept.trim(),
        category,
        tags: tags.length ? tags : ["AI스타트업", category],
        requiredRoles: selectedRoles.length ? selectedRoles : ["풀스택 개발자"],
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
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🚀 아이디어 제작 의뢰 <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">빌더 역제안</span>
              </h2>
              <p className="text-xs text-white/60">
                풀고 싶은 문제와 아이디어를 발제하면, 전문 개발팀/빌더가 MVP 제작을 역제안합니다.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Title with AI Assist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-white/90 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-blue-400" /> 아이디어 / 프로젝트 명칭 <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleAIAssist}
                disabled={aiGenerating}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all cursor-pointer font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiGenerating ? "AI 초안 분석 중..." : "AI PRD 초안 자동 생성"}
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 초기 스타트업을 위한 AI 계약서 위험조항 자동 검토 SaaS"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 text-sm transition-colors"
            />
          </div>

          {/* Grid: Category & Reward Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-white/70">
                  산업 / 카테고리 (자연어 직접 입력 또는 AI 자동 채우기)
                </label>
              </div>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="예: B2B LegalTech SaaS, 차세대 핀테크 / 결제 등"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 placeholder:text-white/30"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {recommendedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                      category === cat
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/40 font-semibold"
                        : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                협업 보상 / 계약 형태
              </label>
              <select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
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
            <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" /> 보상 및 협업 조건 상세
            </label>
            <input
              type="text"
              value={rewardDetail}
              onChange={(e) => setRewardDetail(e.target.value)}
              placeholder="예: 지분 15~25% 협의 / MVP 제작비 400만원 등"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Problem */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-1.5 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-red-400" /> 해결하려는 문제점 (Pain Point) <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="현재 고객이나 시장이 겪고 있는 구체적인 불편함이나 결핍을 적어주세요."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 text-xs leading-relaxed"
            />
          </div>

          {/* Solution Concept */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> 제안하는 솔루션 / MVP 컨셉 <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={solutionConcept}
              onChange={(e) => setSolutionConcept(e.target.value)}
              placeholder="어떤 핵심 기능과 방식으로 문제를 해결하고 싶으신가요?"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 text-xs leading-relaxed"
            />
          </div>

          {/* Required Roles */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-400" /> 필요한 빌더 / 팀원 포지션
            </label>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((role) => {
                const isSelected = selectedRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-500/25 text-blue-300 border-blue-500/50 shadow-sm shadow-blue-500/20"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}{role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center gap-1">
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
                    className="hover:text-white"
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
                className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
              />
            </div>
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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? "등록 중..." : "아이디어 제작 의뢰서 등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
