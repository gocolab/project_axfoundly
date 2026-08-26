import React from "react";
import { X, Send, Award, Plus, Trash2, Calendar, DollarSign, BookOpen, CheckCircle } from "lucide-react";
import type { CourseRequest, CourseProposal } from "../types";
import { api } from "../lib/api";

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

  React.useEffect(() => {
    if (request) {
      setProposedTitle(`${request.title} 실전 완성 클래스`);
      setMessage(
        `안녕하세요, 수강생 여러분! 요청해주신 '${request.title}' 주제에 맞춰, 실무에서 바로 써먹을 수 있는 커리큘럼으로 알차게 구성했습니다.`
      );
    }
  }, [request, isOpen]);

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
      alert("제안 강의명과 1개 이상의 커리큘럼 항목을 입력해주세요.");
      return;
    }

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

      alert(`'${request.title}' 요청에 개강 제안서가 성공적으로 등록되었습니다!`);
      onProposalSubmitted(res.proposal);
      onClose();
    } catch (error) {
      console.error("Failed to submit proposal", error);
      alert("개강 제안서 등록에 실패했습니다.");
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

        {/* Target Request Info Box */}
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs text-brand-primary font-semibold mb-1">대상 개강 요청</div>
          <div className="text-sm font-bold text-white mb-1.5">{request.title}</div>
          <div className="text-xs text-white/60 line-clamp-2">{request.description}</div>
          <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
            <span>발제자: <b className="text-white/80">{request.requestedBy.userName}</b></span>
            <span>•</span>
            <span>공감 수강생: <b className="text-amber-400 font-bold">{request.upvoteCount}명</b></span>
            <span>•</span>
            <span>희망 일정: <b className="text-white/80">{request.preferredSchedule || "협의"}</b></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Proposed Title */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              제안 강의명 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={proposedTitle}
              onChange={(e) => setProposedTitle(e.target.value)}
              placeholder="예: 4주 완성 LangGraph 실전 에이전트 클래스"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>

          {/* Price & Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-purple-400" /> 제안 수강료 (원)
              </label>
              <input
                type="number"
                step="10000"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" /> 강의 진행 일정
              </label>
              <input
                type="text"
                value={proposedSchedule}
                onChange={(e) => setProposedSchedule(e.target.value)}
                placeholder="예: 화/목 19:30~21:30 (총 8회차)"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Curriculum Items */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" /> 주차별/차시별 커리큘럼 계획
            </label>
            <div className="space-y-2 mb-2">
              {curriculumItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/90"
                >
                  <span className="truncate pr-2">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCurriculum(idx)}
                    className="text-white/40 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
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
                placeholder="새 차시 내용 입력 후 추가 버튼 (예: 5회차: 배포 및 모니터링)"
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddCurriculum}
                className="px-3.5 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 text-xs font-medium transition-colors cursor-pointer"
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
