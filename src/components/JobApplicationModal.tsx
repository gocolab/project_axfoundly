import React from "react";
import { X, Send, Briefcase, FileText, CheckCircle, ExternalLink, Sparkles } from "lucide-react";
import type { HiringRoleDetail, IRProject } from "../types";
import { api } from "../lib/api";
import { getEmploymentTypeBadgeClass } from "./IRPage";
import { useToast } from "./common/Toast";

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: IRProject;
  hiringRole: HiringRoleDetail | null;
  applicantName?: string;
  applicantEmail?: string;
  onSuccess?: () => void;
}

export default function JobApplicationModal({
  isOpen,
  onClose,
  project,
  hiringRole,
  applicantName = "김수강생",
  applicantEmail = "student@mail.com",
  onSuccess,
}: JobApplicationModalProps) {
  const toast = useToast();
  const [name, setName] = React.useState(applicantName);
  const [email, setEmail] = React.useState(applicantEmail);
  const [portfolioUrl, setPortfolioUrl] = React.useState("");
  const [coverLetter, setCoverLetter] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setCoverLetter("");
      setPortfolioUrl("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.applyForJob(project.id, {
        roleId: hiringRole?.id,
        applicantName: name,
        applicantEmail: email,
        portfolioUrl: portfolioUrl.trim() || undefined,
        coverLetter: coverLetter.trim(),
      });
      setSubmitted(true);
      toast.success("지원서 제출 완료", `'${project.teamName}' 팀에 지원서가 성공적으로 전달되었습니다.`);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to submit job application:", error);
      toast.error("지원서 제출 실패", "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-panel-heavy rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-brand-border text-white relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <Briefcase size={20} className="text-brand-tertiary" />
              스타트업 팀빌딩 / 채용 지원서
            </h3>
            <p className="text-xs text-brand-on-surface-variant mt-0.5">
              {project.teamName} — <span className="text-brand-primary font-semibold">{hiringRole?.role || "창업팀 포지션"}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-brand-surface-high text-brand-on-surface-variant hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle size={28} />
            </div>
            <h4 className="font-display text-base font-bold text-white">지원서가 성공적으로 전달되었습니다!</h4>
            <p className="text-xs text-brand-on-surface-variant leading-relaxed">
              '{project.teamName}' 대표 및 채용 담당자에게 지원 내역이 전달되었으며, 마이페이지 알림함에서 진행 상황을 확인하실 수 있습니다.
            </p>
            <div className="pt-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-brand-primary-container hover:bg-brand-primary font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Position Summary Banner */}
            <div className="p-3 bg-brand-surface-low rounded-xl border border-brand-border/40 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-brand-on-surface-variant font-medium">고용 형태:</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getEmploymentTypeBadgeClass(hiringRole?.type)}`}>
                  {hiringRole?.type || "풀타임"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-on-surface-variant font-medium">보상 및 지분:</span>
                <span className="text-brand-tertiary font-mono">{hiringRole?.compensation || "협의"} (지분 {hiringRole?.equity || "협의"})</span>
              </div>
              {hiringRole?.skills && hiringRole.skills.length > 0 && (
                <div className="pt-1.5 border-t border-brand-border/20 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-brand-on-surface-variant">요구 스킬:</span>
                  {hiringRole.skills.map((s, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-brand-surface-high border border-brand-border/40 text-brand-primary">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Applicant Info Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant mb-1">지원자 성명</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant mb-1">연락처 / 이메일</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-on-surface-variant mb-1">포트폴리오 / GitHub / 링크 (선택)</label>
              <input
                type="url"
                placeholder="https://github.com/... or Notion 링크"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-brand-on-surface-variant/50 focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-on-surface-variant mb-1">자기소개 및 지원 동기 (필수)</label>
              <textarea
                required
                rows={4}
                placeholder="보유 역량, 프로젝트 경험, 본 팀에 기여하고 싶은 부분 등을 자유롭게 작성해 주세요."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
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
                disabled={isSubmitting || !coverLetter.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-tertiary text-white font-bold text-xs hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Send size={13} />
                {isSubmitting ? "제출 중..." : "지원서 제출하기"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
