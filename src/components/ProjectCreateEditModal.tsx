import React from "react";
import { X, Rocket, Video, Shield, Plus, Trash2, Send, Sparkles } from "lucide-react";
import type { IRProject, HiringRoleDetail, CommonCode } from "../types";
import { api } from "../lib/api";

interface ProjectCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProject?: IRProject | null;
  onSave: (project: IRProject) => void;
}

export default function ProjectCreateEditModal({
  isOpen,
  onClose,
  initialProject,
  onSave,
}: ProjectCreateEditModalProps) {
  const [stageCodes, setStageCodes] = React.useState<CommonCode[]>([]);
  const [empTypeCodes, setEmpTypeCodes] = React.useState<CommonCode[]>([]);

  const [teamName, setTeamName] = React.useState(initialProject?.teamName || "");
  const [anonymousTeamName, setAnonymousTeamName] = React.useState(
    initialProject?.anonymousTeamName || "⚡ 캡틴 AI (스텔스)"
  );
  const [title, setTitle] = React.useState(initialProject?.title || "");
  const [oneLiner, setOneLiner] = React.useState(initialProject?.oneLiner || "");
  const [description, setDescription] = React.useState(initialProject?.description || "");
  const [field, setField] = React.useState<IRProject["field"]>(initialProject?.field || "AI/ML");
  const [investmentStage, setInvestmentStage] = React.useState<IRProject["investmentStage"]>(
    initialProject?.investmentStage || "Pre-Seed"
  );
  const [demoVideoUrl, setDemoVideoUrl] = React.useState(initialProject?.demoVideoUrl || "");
  const [isAnonymous, setIsAnonymous] = React.useState(initialProject?.isAnonymous || false);
  const [businessModel, setBusinessModel] = React.useState(initialProject?.businessModel || "");
  const [problem, setProblem] = React.useState(initialProject?.problem || "");
  const [solution, setSolution] = React.useState(initialProject?.solution || "");

  // Hiring section
  const [isHiring, setIsHiring] = React.useState(initialProject?.isHiring || false);
  const [hiringRoleInput, setHiringRoleInput] = React.useState("");
  const [hiringTypeInput, setHiringTypeInput] = React.useState("풀타임");
  const [hiringRoles, setHiringRoles] = React.useState<string[]>(initialProject?.hiringRoles || []);
  const [hiringDetails, setHiringDetails] = React.useState<HiringRoleDetail[]>(
    initialProject?.hiringDetails || []
  );

  const [saving, setSaving] = React.useState(false);

  // 공통 코드 로드
  React.useEffect(() => {
    if (!isOpen) return;
    api.getCommonCodes(["INVESTMENT_STAGE", "EMPLOYMENT_TYPE"])
      .then((res) => {
        if (res.codes) {
          const stages = res.codes.filter((c) => c.groupCode === "INVESTMENT_STAGE" && c.isActive);
          const empTypes = res.codes.filter((c) => c.groupCode === "EMPLOYMENT_TYPE" && c.isActive);
          if (stages.length > 0) setStageCodes(stages);
          if (empTypes.length > 0) {
            setEmpTypeCodes(empTypes);
            setHiringTypeInput(empTypes[0].displayName || empTypes[0].codeName);
          }
        }
      })
      .catch((err) => console.error("공통 코드 로드 실패:", err));
  }, [isOpen]);

  React.useEffect(() => {
    if (initialProject) {
      setTeamName(initialProject.teamName);
      setAnonymousTeamName(initialProject.anonymousTeamName || `⚡ ${initialProject.teamName} (스텔스)`);
      setTitle(initialProject.title);
      setOneLiner(initialProject.oneLiner);
      setDescription(initialProject.description);
      setField(initialProject.field);
      setInvestmentStage(initialProject.investmentStage);
      setDemoVideoUrl(initialProject.demoVideoUrl || "");
      setIsAnonymous(initialProject.isAnonymous || false);
      setBusinessModel(initialProject.businessModel);
      setProblem(initialProject.problem);
      setSolution(initialProject.solution);
      setIsHiring(initialProject.isHiring);
      setHiringRoles(initialProject.hiringRoles || []);
      setHiringDetails(initialProject.hiringDetails || []);
    } else {
      // Default initial
      setTeamName("");
      setAnonymousTeamName("⚡ 캡틴 AI (스텔스)");
      setTitle("");
      setOneLiner("");
      setDescription("");
      setField("AI/ML");
      setInvestmentStage("Pre-Seed");
      setDemoVideoUrl("");
      setIsAnonymous(false);
      setBusinessModel("");
      setProblem("");
      setSolution("");
      setIsHiring(false);
      setHiringRoles([]);
      setHiringDetails([]);
    }
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const handleAddHiringRole = () => {
    if (!hiringRoleInput.trim()) return;
    const roleName = hiringRoleInput.trim();
    const roleType = hiringTypeInput || "풀타임";

    setHiringRoles((prev) => [...prev, `${roleName} (${roleType})`]);
    setHiringDetails((prev) => [
      ...prev,
      {
        id: `role-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        role: roleName,
        type: roleType,
        applyMethod: "internal",
        skills: [],
      },
    ]);
    setHiringRoleInput("");
  };

  const handleRemoveHiringRole = (index: number) => {
    setHiringRoles((prev) => prev.filter((_, i) => i !== index));
    setHiringDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !title.trim()) {
      alert("팀명과 프로젝트 제목을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const projectPayload: Partial<IRProject> = {
        id: initialProject?.id,
        teamName,
        anonymousTeamName,
        title,
        oneLiner,
        description,
        field,
        investmentStage,
        demoVideoUrl,
        isAnonymous,
        businessModel: businessModel || "B2B SaaS 구독 모델",
        problem: problem || "시장 내 페인포인트",
        solution: solution || "자체 AI 엔진 기반 해결책",
        isHiring,
        hiringRoles,
        hiringDetails,
        members: initialProject?.members || [
          {
            name: "김수강생",
            role: "Founder / CEO",
            avatar: "",
            anonymousName: "⚡ 캡틴 AI",
            anonymousRole: "Founder",
            bio: "AI 부트캠프 수료 및 프로젝트 발제자",
          },
        ],
      };

      const res = await api.saveIRProject(projectPayload);
      onSave(res.project);
      onClose();
    } catch (error) {
      console.error("Failed to save project", error);
      alert("프로젝트 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-panel-heavy rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-brand-border overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-brand-border/40 flex justify-between items-center bg-brand-surface-low/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-tertiary/20 text-brand-tertiary flex items-center justify-center">
              <Rocket size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                {initialProject ? "창업 프로젝트 수정" : "새 창업 프로젝트 등록"}
              </h2>
              <p className="text-[10px] text-brand-on-surface-variant">
                스타트업/IR 게시판에 노출되어 투자자 및 팀원을 연결합니다
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Team Name & Stealth Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-white block mb-1">팀 / 스타트업 이름 *</label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="예: DocuMind AI"
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="font-semibold text-white block mb-1">스텔스(비실명) 모드 팀명</label>
              <input
                type="text"
                value={anonymousTeamName}
                onChange={(e) => setAnonymousTeamName(e.target.value)}
                placeholder="예: ⚡ 캡틴 AI (스텔스)"
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Title & Field */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-semibold text-white block mb-1">프로젝트 타이틀 *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 법률 문서를 위한 초정밀 RAG 분석 엔진"
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="font-semibold text-white block mb-1">분야</label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value as IRProject["field"])}
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-primary"
              >
                {["AI/ML", "핀테크", "헬스케어", "에듀테크", "커머스", "SaaS"].map((f) => (
                  <option key={f} value={f} className="bg-brand-surface">
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* One-Liner */}
          <div>
            <label className="font-semibold text-white block mb-1">한 줄 소개</label>
            <input
              type="text"
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              placeholder="예: 500페이지 계약서를 3초 만에 검토하는 AI"
              className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-white block mb-1">상세 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="서비스 핵심 기능 및 가치를 상세히 기술해주세요."
              className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-3 text-white focus:outline-none focus:border-brand-primary h-20 resize-none"
            />
          </div>

          {/* Investment Stage & Stealth Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-brand-surface-low/50 p-3.5 rounded-xl border border-brand-border/30">
            <div>
              <label className="font-semibold text-white block mb-1">현재 투자 유치 단계</label>
              <div className="flex flex-wrap gap-2">
                {(stageCodes.length > 0
                  ? stageCodes.map((c) => c.displayName || c.codeName)
                  : ["Pre-Seed", "Seed", "Pre-A", "Series A"]
                ).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setInvestmentStage(st)}
                    className={`px-3 py-1 rounded-lg border text-xs cursor-pointer transition-colors ${
                      investmentStage === st
                        ? "bg-brand-tertiary/20 border-brand-tertiary text-brand-tertiary font-bold"
                        : "border-brand-border text-brand-on-surface-variant hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <input
                type="checkbox"
                id="stealthToggle"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-brand-border text-brand-primary focus:ring-0 cursor-pointer"
              />
              <label htmlFor="stealthToggle" className="text-white cursor-pointer select-none">
                스텔스(비실명) 모드 기본 활성화 (팀원 프라이버시 보호)
              </label>
            </div>
          </div>

          {/* Demo Video URL */}
          <div>
            <label className="font-semibold text-white block mb-1 flex items-center gap-1.5">
              <Video size={14} className="text-brand-primary" />
              동작 / 피칭 시연 영상 임베드 URL (YouTube / Vimeo / Loom)
            </label>
            <input
              type="text"
              value={demoVideoUrl}
              onChange={(e) => setDemoVideoUrl(e.target.value)}
              placeholder="예: https://www.youtube.com/embed/..."
              className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-primary font-mono text-[11px]"
            />
          </div>

          {/* Problem, Solution, BM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-white block mb-1">해결하려는 문제 (Problem)</label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="시장 페인포인트..."
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-2.5 text-white focus:outline-none focus:border-brand-primary h-16 resize-none"
              />
            </div>
            <div>
              <label className="font-semibold text-white block mb-1">해결 방안 (Solution)</label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="우리의 해결책..."
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-2.5 text-white focus:outline-none focus:border-brand-primary h-16 resize-none"
              />
            </div>
            <div>
              <label className="font-semibold text-white block mb-1">비즈니스 모델 (BM)</label>
              <textarea
                value={businessModel}
                onChange={(e) => setBusinessModel(e.target.value)}
                placeholder="수익 모델..."
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-2.5 text-white focus:outline-none focus:border-brand-primary h-16 resize-none"
              />
            </div>
          </div>

          {/* Hiring Section */}
          <div className="p-3.5 rounded-xl bg-brand-surface-low/50 border border-brand-border/30 space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-white flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHiring}
                  onChange={(e) => setIsHiring(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-primary"
                />
                현재 팀원 채용 / Co-founder 영입 중
              </label>
            </div>

            {isHiring && (
              <div className="space-y-2 animate-fadeIn">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={hiringRoleInput}
                    onChange={(e) => setHiringRoleInput(e.target.value)}
                    placeholder="채용 포지션명 (예: 프론트엔드 리드, LLM 엔지니어)"
                    className="flex-1 bg-brand-surface border border-brand-border rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-brand-primary"
                  />
                  <select
                    value={hiringTypeInput}
                    onChange={(e) => setHiringTypeInput(e.target.value)}
                    className="bg-brand-surface border border-brand-border rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-brand-primary text-sm"
                  >
                    {(empTypeCodes.length > 0
                      ? empTypeCodes.map((c) => c.displayName || c.codeName)
                      : ["풀타임", "파트타임", "인턴", "코파운더"]
                    ).map((t) => (
                      <option key={t} value={t} className="bg-brand-surface text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddHiringRole}
                    className="px-3 py-1.5 bg-brand-surface-high hover:bg-brand-surface-highest text-white rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> 추가
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {hiringRoles.map((role, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-brand-tertiary/15 text-brand-tertiary border border-brand-tertiary/30 flex items-center gap-1.5 text-xs"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => handleRemoveHiringRole(idx)}
                        className="hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
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
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5 shadow-md"
            >
              <Send size={13} />
              {saving ? "저장 중..." : initialProject ? "수정 완료" : "프로젝트 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
