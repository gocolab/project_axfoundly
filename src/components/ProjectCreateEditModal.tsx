import React from "react";
import { X, Rocket, Video, Shield, Plus, Trash2, Send, Sparkles, Globe } from "lucide-react";
import type { IRProject, HiringRoleDetail } from "../types";
import { api } from "../lib/api";
import { useToast } from "./common/Toast";
import { useCommonCodes } from "../hooks/useCommonCodes";

export function convertToEmbedUrl(url?: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  // YouTube watch?v=... or youtu.be/...
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
  }
  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
  }
  // Loom
  const loomMatch = trimmed.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    return `https://www.loom.com/embed/${loomMatch[1]}`;
  }
  return trimmed;
}

interface ProjectCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProject?: IRProject | null;
  onSave: (project: IRProject) => void;
  userName?: string;
}

export default function ProjectCreateEditModal({
  isOpen,
  onClose,
  initialProject,
  onSave,
  userName,
}: ProjectCreateEditModalProps) {
  const toast = useToast();
  const { getCodesByGroup } = useCommonCodes(["INVESTMENT_STAGE", "EMPLOYMENT_TYPE"]);
  const stageCodes = getCodesByGroup("INVESTMENT_STAGE");
  const empTypeCodes = getCodesByGroup("EMPLOYMENT_TYPE");

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
  const [prototypeUrl, setPrototypeUrl] = React.useState(initialProject?.prototypeUrl || "");
  const [isAnonymous, setIsAnonymous] = React.useState(initialProject?.isAnonymous || false);
  const [businessModel, setBusinessModel] = React.useState(initialProject?.businessModel || "");
  const [problem, setProblem] = React.useState(initialProject?.problem || "");
  const [solution, setSolution] = React.useState(initialProject?.solution || "");

  // Hiring section
  const [isHiring, setIsHiring] = React.useState(initialProject?.isHiring || false);
  const [hiringRoleInput, setHiringRoleInput] = React.useState("");
  const [hiringTypeInput, setHiringTypeInput] = React.useState(
    empTypeCodes[0]?.displayName || empTypeCodes[0]?.codeName || "풀타임"
  );
  const [hiringRoles, setHiringRoles] = React.useState<string[]>(initialProject?.hiringRoles || []);
  const [hiringDetails, setHiringDetails] = React.useState<HiringRoleDetail[]>(
    initialProject?.hiringDetails || []
  );
  const [saving, setSaving] = React.useState(false);
  const [isAiGenerating, setIsAiGenerating] = React.useState(false);

  const handleAIAssist = async () => {
    const rawInput = (title || teamName || "").trim();
    if (!rawInput) {
      toast.warning("프로젝트명 또는 팀명을 입력해주세요", "AI가 IR 프로젝트 초안을 생성하기 위한 기본 키워드가 필요합니다.");
      return;
    }

    setIsAiGenerating(true);
    try {
      const res = await api.aiAutoFill({
        type: "ir_project",
        prompt: rawInput,
        context: { teamName, currentField: field },
      });

      if (res?.result) {
        const r = res.result;
        if (r.refinedTitle) setTitle(r.refinedTitle);
        if (r.teamName && !teamName.trim()) setTeamName(r.teamName);
        if (r.naturalCategory) setField(r.naturalCategory);
        if (r.oneLiner) setOneLiner(r.oneLiner);
        if (r.description) setDescription(r.description);
        if (r.problem) setProblem(r.problem);
        if (r.solution) setSolution(r.solution);
        if (r.businessModel) setBusinessModel(r.businessModel);

        toast.success(
          "✨ AI 프로젝트 초안 자동 채우기 완료",
          `타이틀("${r.refinedTitle || title}") 및 산업 분야("${r.naturalCategory || field}")가 맞춤 재조정되었습니다.`
        );
      }
    } catch (err) {
      console.warn("AI project auto-fill fallback:", err);
      const prefix = teamName || title.split(" ")[0] || "AI";
      setTitle(`${prefix}Mind : ${title || "차세대 기업용 AI 솔루션"}`);
      setField(title.includes("의료") ? "초정밀 헬스케어 AI" : "B2B Enterprise AI");
      setOneLiner(`${rawInput} 분야의 비효율을 혁신하는 고성능 AI 플랫폼`);
      setDescription(`${rawInput} 시장의 페인포인트를 해결하기 위해 자체 AI 엔진을 적용한 솔루션입니다.`);
      setProblem("기존 시장의 높은 수작업 운영 비용과 실시간 대응 한계");
      setSolution("자체 최적화 AI 파이프라인을 통한 업무 시간 90% 단축");
      setBusinessModel("B2B SaaS 구독 및 사용량 기반 API 과금");
      toast.info("AI 초안 완성", "프로젝트 타이틀 및 One-Liner, 핵심 내용이 작성되었습니다.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen) return;
    if (initialProject) {
      setTeamName(initialProject.teamName);
      setAnonymousTeamName(initialProject.anonymousTeamName || `⚡ ${initialProject.teamName} (스텔스)`);
      setTitle(initialProject.title);
      setOneLiner(initialProject.oneLiner);
      setDescription(initialProject.description);
      setField(initialProject.field);
      setInvestmentStage(initialProject.investmentStage);
      setDemoVideoUrl(initialProject.demoVideoUrl || "");
      setPrototypeUrl(initialProject.prototypeUrl || "");
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
      setPrototypeUrl("");
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
        skills: ["협업", "열정"],
        description: `${roleName} 포지션 팀원을 모집합니다.`,
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
      toast.warning("필수 입력 확인", "팀명과 프로젝트 제목을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      // isHiring이 켜져있는데 hiringDetails가 비어있으면 hiringRoles로부터 자동 생성
      const finalHiringDetails: HiringRoleDetail[] = hiringDetails.length > 0
        ? hiringDetails
        : hiringRoles.map((r, idx) => {
            const match = r.match(/^(.*?)(?:\s*\((.*?)\))?$/);
            const roleName = match ? match[1].trim() : r;
            const typeName = match && match[2] ? match[2].trim() : "풀타임";
            return {
              id: `role-${Date.now()}-${idx}`,
              role: roleName,
              type: typeName,
              applyMethod: "internal" as const,
              skills: ["협업", "열정"],
              description: `${roleName} 포지션 팀원을 모집합니다.`,
            };
          });

      const effectiveAuthor = initialProject?.authorName || userName || (typeof window !== "undefined" ? localStorage.getItem("user_name") || "김수강생" : "김수강생");

      const projectPayload: Partial<IRProject> = {
        id: initialProject?.id,
        teamName,
        anonymousTeamName,
        title,
        oneLiner,
        description,
        field,
        investmentStage,
        demoVideoUrl: convertToEmbedUrl(demoVideoUrl),
        prototypeUrl: prototypeUrl.trim(),
        isAnonymous,
        authorName: effectiveAuthor,
        businessModel: businessModel || "B2B SaaS 구독 모델",
        problem: problem || "시장 내 페인포인트",
        solution: solution || "자체 AI 엔진 기반 해결책",
        isHiring,
        hiringRoles,
        hiringDetails: isHiring ? finalHiringDetails : [],
        members: initialProject?.members || [
          {
            name: effectiveAuthor,
            role: "Founder / CEO",
            avatar: "",
            anonymousName: "⚡ 캡틴 AI",
            anonymousRole: "Founder",
            bio: "AI 부트캠프 수료 및 프로젝트 발제자",
          },
        ],
      };

      const res = await api.saveIRProject(projectPayload);
      toast.success("프로젝트 저장 완료", "스타트업 IR 정보가 성공적으로 등록/수정되었습니다.");
      onSave(res.project);
      onClose();
    } catch (error) {
      console.error("Failed to save project", error);
      toast.error("프로젝트 저장 실패", "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
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

          {/* Title with AI Assist */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-white">프로젝트 타이틀 *</label>
              <button
                type="button"
                onClick={handleAIAssist}
                disabled={isAiGenerating}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/30 transition-all cursor-pointer font-medium"
              >
                <Sparkles size={13} />
                {isAiGenerating ? "AI 초안 생성 중..." : "AI 프로젝트 초안 자동 채우기"}
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 법률 문서를 위한 초정밀 RAG 분석 엔진"
              className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-primary text-xs"
            />
          </div>

          {/* Natural Language Industry Field */}
          <div>
            <label className="font-semibold text-white block mb-1">
              산업 / 분야 (자연어 직접 입력 또는 AI 자동 생성)
            </label>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="예: B2B Enterprise AI, 차세대 핀테크 / 결제, 초정밀 헬스케어 AI"
              className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-primary text-xs placeholder:text-white/30"
            />
          </div>

          {/* AI Auto-Classification Info Banner */}
          <div className="p-3 bg-gradient-to-r from-brand-primary/10 via-brand-secondary/10 to-transparent border border-brand-primary/20 rounded-xl flex items-center gap-2.5">
            <Sparkles size={16} className="text-brand-primary shrink-0" />
            <p className="text-[11px] text-brand-on-surface-variant leading-relaxed">
              <strong className="text-brand-primary font-semibold">🤖 AI 자율 채우기 & 태깅:</strong> AI가 생성한 자연어 산업 분야와 핵심 가치 제안을 즉시 사용할 수 있으며, 자유롭게 수정할 수 있습니다.
            </p>
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
              동작 / 피칭 시연 영상 URL (YouTube / Vimeo / Loom)
            </label>
            <input
              type="text"
              value={demoVideoUrl}
              onChange={(e) => setDemoVideoUrl(e.target.value)}
              placeholder="예: https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
              className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-primary font-mono text-[11px]"
            />
            <p className="text-[10px] text-brand-on-surface-variant mt-1">
              일반 YouTube, Vimeo, Loom 링크를 입력하시면 자동으로 임베드 플레이어로 변환됩니다.
            </p>
          </div>

          {/* Prototype / Website URL */}
          <div>
            <label className="font-semibold text-white block mb-1 flex items-center gap-1.5">
              <Globe size={14} className="text-brand-tertiary" />
              프로토타입 / 배포 사이트 방문 URL (사이트 링크)
            </label>
            <input
              type="url"
              value={prototypeUrl}
              onChange={(e) => setPrototypeUrl(e.target.value)}
              placeholder="예: https://my-service.com 또는 Figma 프로토타입 링크"
              className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-primary font-mono text-[11px]"
            />
            <p className="text-[10px] text-brand-on-surface-variant mt-1">
              등록 시 상세 페이지 및 영상 섹션 상단에 [프로토타입 / 배포 사이트 방문] 버튼이 노출됩니다.
            </p>
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
