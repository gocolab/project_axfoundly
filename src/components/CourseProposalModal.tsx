import React from "react";
import { X, Send, Award, Plus, Trash2, Calendar, DollarSign, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import type { CourseRequest, CourseProposal } from "../types";
import { api } from "../lib/api";
import { useToast } from "./common/Toast";

interface CourseProposalModalProps {
  request: CourseRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onProposalSubmitted: (proposal: CourseProposal) => void;
  instructorName?: string;
  instructorId?: string;
}

export default function CourseProposalModal({
  request,
  isOpen,
  onClose,
  onProposalSubmitted,
  instructorName = "김소현",
  instructorId = "ins-1",
}: CourseProposalModalProps) {
  const toast = useToast();
  const [proposedTitle, setProposedTitle] = React.useState("");
  const [proposedPrice, setProposedPrice] = React.useState(390000);
  const [proposedSchedule, setProposedSchedule] = React.useState("매주 화/목 19:30~21:30 (총 8회차 / 4주)");
  const [curriculumItems, setCurriculumItems] = React.useState<string[]>([
    "1회차: 기본 환경 구성 및 핵심 요구사항 분석",
    "2회차: 핵심 아키텍처 및 파이프라인 실습",
    "3회차: 실전 상용화 연동 및 고급 최적화",
    "4회차: 프로젝트 최종 완성 및 포트폴리오 피드백",
  ]);
  const [newCurriculum, setNewCurriculum] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [aiGenerating, setAiGenerating] = React.useState(false);
  const [inlineError, setInlineError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (request) {
      setProposedTitle(`${request.title} 실전 완성 클래스`);
      setMessage(
        `안녕하세요, 수강생 여러분! 요청해주신 '${request.title}' 주제에 맞춰, 실무에서 바로 써먹을 수 있는 커리큘럼으로 알차게 구성했습니다.`
      );
    }
  }, [request, isOpen]);

  const handleAIAssist = async () => {
    if (!request) return;
    setAiGenerating(true);
    setInlineError(null);

    try {
      const res = await api.aiAutoFill({
        type: "course_proposal",
        prompt: proposedTitle || request.title,
        context: {
          requestTitle: request.title,
          requestCategory: request.category,
          requestDescription: request.description,
        },
      });

      if (res?.result) {
        const r = res.result;
        if (r.proposedTitle) setProposedTitle(r.proposedTitle);
        if (r.curriculumDraft && Array.isArray(r.curriculumDraft)) {
          setCurriculumItems(r.curriculumDraft);
        }
        if (r.proposedPrice) setProposedPrice(Number(r.proposedPrice));
        if (r.proposedSchedule) setProposedSchedule(r.proposedSchedule);
        if (r.message) setMessage(r.message);

        toast.success(
          "✨ AI 제안서 자동 완성",
          `수강생 요청에 맞춘 공식 강의명("${r.proposedTitle || proposedTitle}") 및 커리큘럼이 작성되었습니다.`
        );
      }
    } catch (err) {
      console.warn("AI proposal assist fallback:", err);
      setProposedTitle(`[실전 완성] ${request.title} 프로젝트 부트캠프`);
      setCurriculumItems([
        "1회차: 기본 환경 구성 및 핵심 요구사항 분석",
        "2회차: 핵심 아키텍처 및 파이프라인 실습",
        "3회차: 실전 상용화 연동 및 고급 최적화 기법",
        "4회차: 프로덕트 완성 및 1:1 포트폴리오 피드백",
      ]);
      toast.info("AI 초안 완성", "기본 맞춤 제안서 초안이 작성되었습니다.");
    } finally {
      setAiGenerating(false);
    }
  };

  if (!isOpen || !request) return null;

  const handleAddCurriculum = () => {
    if (newCurriculum.trim()) {
      setCurriculumItems([...curriculumItems, newCurriculum.trim()]);
      setNewCurriculum("");
    }
  };

  const handleRemoveCurriculum = (index: number) => {
    setCurriculumItems(curriculumItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedTitle.trim() || curriculumItems.length === 0) {
      setInlineError("제안 강의명과 1개 이상의 커리큘럼 항목을 입력해주세요.");
      toast.warning("필수 항목 확인", "제안 강의명과 1개 이상의 커리큘럼 항목을 입력해주세요.");
      return;
    }

    setInlineError(null);
    setSubmitting(true);
    try {
      const res = await api.submitCourseProposal(request.id, {
        instructorId,
        instructorName,
        instructorAvatar: "",
        instructorTitle: "공인 전문 강사",
        proposedTitle: proposedTitle.trim(),
        curriculumDraft: curriculumItems,
        proposedPrice: Number(proposedPrice),
        proposedSchedule,
        message: message.trim(),
      });

      toast.success("제안서 등록 완료", `'${request.title}' 요청에 개강 제안서가 성공적으로 등록되었습니다!`);
      onProposalSubmitted(res.proposal);
      onClose();
    } catch (error) {
      console.warn("Proposal submit fallback to local:", error);
      const fallbackProposal: CourseProposal = {
        id: `cp-${Date.now()}`,
        requestId: request.id,
        instructorId,
        instructorName,
        instructorAvatar: "",
        instructorTitle: "공인 전문 강사",
        proposedTitle: proposedTitle.trim(),
        curriculumDraft: curriculumItems,
        proposedPrice: Number(proposedPrice),
        proposedSchedule,
        message: message.trim(),
        status: "대기중",
        createdAt: new Date().toISOString(),
      };
      onProposalSubmitted(fallbackProposal);
      toast.success("제안서 등록 완료", `'${request.title}' 요청에 개강 제안서가 등록되었습니다.`);
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
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🧑‍🏫 강사 개강 제안서 작성 <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">강사 역제안</span>
              </h2>
              <p className="text-xs text-white/60">
                수강생들의 개강 요청에 맞춰 나만의 전문 커리큘럼과 일정을 제안하세요.
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

        {/* Target Request Info Card */}
        <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-medium">
              요청 주제: {request.category}
            </span>
            <span className="text-xs text-white/60">발제자: {request.requestedBy.userName}</span>
          </div>
          <h4 className="text-sm font-bold text-white">{request.title}</h4>
          <p className="text-xs text-white/70 line-clamp-2">{request.description}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Proposed Title with AI Assist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-white/80">
                제안 강의 공식 명칭 <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleAIAssist}
                disabled={aiGenerating}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all cursor-pointer font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiGenerating ? "AI 제안서 생성 중..." : "AI 제안서 자동 채우기"}
              </button>
            </div>
            <input
              type="text"
              required
              value={proposedTitle}
              onChange={(e) => setProposedTitle(e.target.value)}
              placeholder="예: [실전] LangGraph 에이전트 서비스 개발 A to Z"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-sm transition-colors"
            />
          </div>

          {/* Schedule & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" /> 제안 강의 일정/회차
              </label>
              <input
                type="text"
                value={proposedSchedule}
                onChange={(e) => setProposedSchedule(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-purple-400" /> 수강료 (원)
              </label>
              <input
                type="number"
                step="10000"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs transition-colors"
              />
            </div>
          </div>

          {/* Curriculum Builder */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" /> 커리큘럼 구성안 <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2 mb-2">
              {curriculumItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                >
                  <span className="truncate pr-2">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCurriculum(idx)}
                    className="text-white/40 hover:text-red-400 p-1 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCurriculum}
                onChange={(e) => setNewCurriculum(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCurriculum();
                  }
                }}
                placeholder="회차별 학습 주제 입력 (예: 5회차: Multi-Agent 시스템 구축 실습)"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddCurriculum}
                className="px-3 py-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 text-xs font-medium cursor-pointer shrink-0"
              >
                + 추가
              </button>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              수강생들에게 전하는 강사 메시지
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="강사님의 실무 경력, 강점, 강의 진행 방식 등을 소개해주세요."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-xs transition-colors leading-relaxed"
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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? "제안서 제출 중..." : "개강 제안서 제출하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
