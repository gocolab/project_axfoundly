import React from "react";
import { 
  Handshake, 
  Download, 
  Plus, 
  ThumbsUp, 
  MessageSquare,
  Search,
  Filter,
  FileCode,
  Check,
  Send,
  Boxes,
  Briefcase,
  Code2
} from "lucide-react";
import { ShowcaseProject, AssetLibraryItem, ProjectMatchRequest } from "../types";

interface AssetsTabProps {
  showcaseProjects: ShowcaseProject[];
  matchRequests: ProjectMatchRequest[];
  onAddMatchRequest: (title: string, description: string, budget: "높음" | "중간" | "연구협력") => void;
  onLikeProject: (id: string) => void;
  assetItems: AssetLibraryItem[];
  addXpPoints: (points: number) => void;
}

export default function AssetsTab({
  showcaseProjects,
  matchRequests,
  onAddMatchRequest,
  onLikeProject,
  assetItems,
  addXpPoints
}: AssetsTabProps) {
  
  // States
  const [activeDownloadAsset, setActiveDownloadAsset] = React.useState<AssetLibraryItem | null>(null);
  const [showPostRequestModal, setShowPostRequestModal] = React.useState(false);
  const [showSubmitSolutionModal, setShowSubmitSolutionModal] = React.useState<ProjectMatchRequest | null>(null);
  
  // Post Request Form State
  const [formTitle, setFormTitle] = React.useState("");
  const [formDesc, setFormDesc] = React.useState("");
  const [formBudget, setFormBudget] = React.useState<"높음" | "중간" | "연구협력">("중간");

  // Submit Solution Form State
  const [solutionProposal, setSolutionProposal] = React.useState("");
  const [solutionEmail, setSolutionEmail] = React.useState("");

  const handlePostRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) return;
    onAddMatchRequest(formTitle, formDesc, formBudget);
    addXpPoints(150);
    setFormTitle("");
    setFormDesc("");
    setFormBudget("중간");
    setShowPostRequestModal(false);
    alert("새 매칭 의뢰가 성공적으로 등록되었습니다! (+150 XP 획득)");
  };

  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionProposal.trim()) return;
    addXpPoints(200);
    setSolutionProposal("");
    setSolutionEmail("");
    setShowSubmitSolutionModal(null);
    alert("성공적으로 솔루션을 전달하였습니다. 티어 1 파트너 컴퍼니에서 검토 후 프로필로 이메일을 발송해 드릴 예정입니다. (+200 XP 획득)");
  };

  // Pre-compiled code block mocks to show elite value
  const codeBlocks: Record<string, string> = {
    "json": `{
  "name": "B2B_Enterprise_Routing",
  "version": "2.4.1",
  "nodes": [
    { "id": "agent-gate", "type": "classifier", "model": "gemini-3.5-flash", "temperature": 0.1 },
    { "id": "rag-vector-db", "type": "embeddings-chroma", "threshold": 0.82 },
    { "id": "pricing-evaluator", "type": "structured-output", "schema": "pricing_v2" },
    { "id": "compliance-validator", "type": "rule-based", "fallback": "human-in-the-loop" }
  ],
  "latency_goal_ms": 450,
  "cache_strategy": "redis-semantic",
  "security": {
    "pii_redacting": true,
    "max_rpm": 2500
  }
}`,
    "yaml": `prompt_metadata:
  agent_id: "negotiator_pro_b2b"
  system_instruction: |
    당신은 B2B SaaS 라이선스 조율을 담당하는 수석 협상 중재 에이전트입니다.
    회사 이익을 보호하면서도, 상대방 고객의 전환율을 최대화하는 윈윈 옵션을 설계하십시오.
  fallback_rules:
    - when: "competitor_name_mentioned"
      action: "highlight_unique_developer_acceleration_factors"
    - when: "budget_hard_cap"
      action: "offer_computational_credits_conversion"
  model_params:
    temperature: 0.72
    frequency_penalty: 0.1`
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-4xl font-extrabold text-white tracking-tight">
          이노베이션 허브
        </h2>
        <p className="text-[#c7c4d8] text-base max-w-2xl">
          프로젝트 쇼케이스 및 B2B 매칭. 고성능 AI 서비스를 탐색하고 자산을 다운로드하세요.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column (Spans 8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* Project Showcase Gallery */}
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-end border-b border-[#273647]/50 pb-2">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Boxes size={18} className="text-[#c3c0ff]" />
                <span>프로젝트 쇼케이스</span>
              </h3>
              <button 
                onClick={() => alert("현재 승인된 정규 얼라이언스 AI 프로토타입 전체를 무제한으로 리뷰할 수 있는 전용 채널로 이동합니다.")}
                className="text-xs font-semibold text-brand-primary hover:text-white transition-colors"
              >
                전체 보기 →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showcaseProjects.map((project) => (
                <div 
                  key={project.id}
                  className="glass-panel rounded-2xl overflow-hidden flex flex-col glow-hover transition-all duration-300 ambient-shadow cursor-pointer group"
                >
                  <div className="h-28 bg-[#1c2b3c] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5]/20 to-[#010f1f]/80" />
                    {project.live && (
                      <div className="absolute top-3 right-3 bg-brand-tertiary/10 text-brand-tertiary font-display text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-brand-tertiary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-tertiary animate-pulse" />
                        <span>라이브</span>
                      </div>
                    )}
                    <div className="absolute inset-x-4 bottom-2 font-display text-xs text-[#c7c4d8]/40 select-none">
                      AI Sandbox Container
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 gap-2">
                    <h4 className="font-display text-lg font-bold text-white group-hover:text-brand-primary transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-xs text-[#c7c4d8]/90 leading-relaxed line-clamp-2 mb-2">
                      {project.description}
                    </p>

                    <div className="mt-auto pt-3 flex justify-between items-center border-t border-[#273647]/30">
                      <div className="flex items-center gap-3 text-xs text-[#c7c4d8]/70">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onLikeProject(project.id);
                          }}
                          className="flex items-center gap-1 hover:text-white transition-all hover:scale-105"
                          title="추천하기"
                        >
                          <ThumbsUp size={12} className="text-[#4f46e5]" />
                          <span>{project.likes}</span>
                        </button>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={12} className="text-brand-tertiary" />
                          <span>{project.comments}</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#c7c4d8]/50">
                        By {project.author}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 에셋 라이브러리 (List View) */}
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-end border-b border-[#273647]/50 pb-2">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <FileCode size={18} className="text-brand-tertiary" />
                <span>에셋 라이브러리</span>
              </h3>
              <div className="flex gap-2 text-xs">
                <span className="text-[#c7c4d8]/60">최신 덤프 v2.4</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {assetItems.map((asset) => (
                <div 
                  key={asset.id}
                  className="bg-[#122131]/80 hover:bg-[#1a2c3f]/80 border border-brand-border/40 rounded-xl p-4 flex items-center gap-4 hover:border-brand-primary/40 transition-all cursor-pointer group"
                  onClick={() => setActiveDownloadAsset(asset)}
                >
                  <div className="w-10 h-10 rounded bg-[#0d1c2d] flex items-center justify-center text-[#c3c0ff] group-hover:bg-[#4f46e5]/20 group-hover:scale-105 transition-all border border-[#273647]/30">
                    <Code2 size={18} />
                  </div>

                  <div className="flex-1">
                    <h5 className="font-display text-sm font-bold text-white flex items-center gap-2">
                      {asset.filename}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold select-none border font-display uppercase tracking-wider
                        ${asset.grade === "엘리트 등급" 
                          ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20" 
                          : "bg-brand-tertiary/10 text-brand-tertiary border-brand-tertiary/20"
                        }
                      `}>
                        {asset.grade}
                      </span>
                    </h5>
                    <p className="text-xs text-[#c7c4d8]/80 mt-1">
                      {asset.description}
                    </p>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDownloadAsset(asset);
                    }}
                    className="text-[#c7c4d8] hover:text-brand-primary transition-colors p-2 rounded-full hover:bg-brand-surface-low"
                    title="에셋 코드 보기 및 다운로드"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: B2B Matchmaking Sidebar (Spans 4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl border border-brand-border p-5 flex flex-col h-full ambient-shadow bg-[#122131]/95">
            <div className="flex items-center gap-2 pb-3 border-b border-[#273647]/40 mb-4 justify-between">
              <div className="flex items-center gap-2">
                <Handshake size={18} className="text-brand-tertiary" />
                <h3 className="font-display text-lg font-bold text-white">프로젝트 매칭</h3>
              </div>
              <span className="bg-[#4f46e5]/10 text-brand-primary font-mono text-[11px] font-bold px-2 py-0.5 rounded-full select-none border border-brand-primary/20">
                {matchRequests.length} 활성
              </span>
            </div>

            {/* List of Requests */}
            <div className="flex flex-col gap-4 flex-1">
              {matchRequests.map((req) => (
                <div 
                  key={req.id}
                  className="border-l-2 border-brand-primary hover:bg-[#1a2c3f]/30 pl-3 py-1.5 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-display text-sm font-bold text-white group-hover:text-brand-primary transition-all">
                      {req.title}
                    </h5>
                    <span className="text-[10px] text-[#c7c4d8]/50 font-mono">
                      {req.timeAgo}
                    </span>
                  </div>
                  <p className="text-xs text-[#c7c4d8]/90 mb-3 leading-relaxed">
                    {req.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-brand-surface-high border border-brand-border rounded px-1.5 text-brand-tertiary font-mono">
                      예산: {req.budget}
                    </span>
                    <button 
                      onClick={() => setShowSubmitSolutionModal(req)}
                      className="text-[11px] font-bold text-brand-primary hover:text-white border border-[#4f46e5]/30 hover:bg-[#4f46e5]/10 px-2.5 py-1 rounded transition-colors cursor-pointer"
                    >
                      솔루션 제안
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Post Request Action */}
            <div className="mt-6 pt-4 border-t border-brand-border/40">
              <button 
                onClick={() => setShowPostRequestModal(true)}
                className="w-full bg-[#1c2b3c] border border-brand-border text-brand-on-surface hover:text-[#131b2e] hover:bg-brand-primary hover:border-brand-primary font-semibold font-display py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={16} />
                <span>의뢰 게시하기</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL 1: Code Downloader Preview */}
      {activeDownloadAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-xl w-full flex flex-col gap-4 border border-[#4f46e5]/40 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-brand-border/40">
              <h4 className="font-display text-lg font-bold text-[#c3c0ff] flex items-center gap-2">
                <Code2 size={18} />
                <span>호스트 에셋 코드 세트</span>
              </h4>
              <button 
                onClick={() => setActiveDownloadAsset(null)}
                className="p-1 text-brand-on-surface-variant hover:text-white transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
            
            <div>
              <p className="text-white text-sm font-semibold">{activeDownloadAsset.filename}</p>
              <p className="text-xs text-[#c7c4d8] mt-1">{activeDownloadAsset.description}</p>
            </div>

            <div className="bg-[#090f17] rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-64 border border-[#122131]">
              <pre className="text-brand-on-surface">
                <code>{codeBlocks[activeDownloadAsset.type] || JSON.stringify(activeDownloadAsset, null, 2)}</code>
              </pre>
            </div>

            <div className="flex justify-end gap-2.5 mt-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(codeBlocks[activeDownloadAsset.type] || "");
                  addXpPoints(50);
                  alert("소스로더: 에셋 파일 코드가 클립보드에 인스톨되었습니다! (+50 XP 획득)");
                  setActiveDownloadAsset(null);
                }}
                className="bg-[#4f46e5] text-brand-on-surface font-semibold text-xs py-2 px-5 rounded-lg hover:bg-brand-primary hover:text-[#131b2e] transition-colors cursor-pointer"
              >
                코드 복사 및 다운로드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Post Request Modal */}
      {showPostRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <form 
            onSubmit={handlePostRequest}
            className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 border border-[#4f46e5]/40 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-3 border-b border-brand-border/40">
              <h4 className="font-display text-lg font-bold text-brand-primary flex items-center gap-2">
                <Briefcase size={18} />
                <span>새 B2B 매칭의뢰 게시</span>
              </h4>
              <button 
                type="button"
                onClick={() => setShowPostRequestModal(false)}
                className="p-1 text-[#c7c4d8] hover:text-white cursor-pointer"
              >
                취소
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#c7c4d8]">의뢰 타이틀</label>
              <input 
                type="text" 
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="예: 멀티에이전트 토크나이저 검토"
                className="bg-[#051424] border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#c7c4d8]">상세 개발조건설명</label>
              <textarea 
                required
                rows={3}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="어느 수준의 리서처와 기술 아키텍처가 결합되어야 하는지 명시하십시오."
                className="bg-[#051424] border border-brand-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#c7c4d8]">책정 엔터프라이즈 예산</label>
              <div className="grid grid-cols-3 gap-2">
                {(["높음", "중간", "연구협력"] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setFormBudget(b)}
                    className={`text-xs py-2 rounded-lg border font-semibold transition-all cursor-pointer
                      ${formBudget === b 
                        ? "bg-[#4f46e5]/20 text-brand-primary border-brand-primary" 
                        : "bg-[#1c2b3c]/50 text-brand-on-surface-variant border-[#273647]"
                      }
                    `}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#4f46e5] hover:bg-[#c3c0ff] hover:text-[#131b2e] text-white font-semibold py-2.5 rounded-xl transition-all mt-2 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus size={16} />
              <span>의뢰 등록하기</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL 3: Submit Solution Modal */}
      {showSubmitSolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <form 
            onSubmit={handleSubmitSolution}
            className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 border border-[#4edea3]/50 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-3 border-b border-[#273647]/50">
              <h4 className="font-display text-lg font-bold text-brand-tertiary flex items-center gap-2">
                <Send size={18} />
                <span>솔루션 제안서 작성</span>
              </h4>
              <button 
                type="button"
                onClick={() => setShowSubmitSolutionModal(null)}
                className="p-1 text-[#c7c4d8] hover:text-white cursor-pointer"
              >
                취소
              </button>
            </div>

            <div>
              <p className="text-xs text-[#c7c4d8]">대상 의뢰 프로젝트:</p>
              <p className="text-sm font-bold text-white mt-0.5">{showSubmitSolutionModal.title}</p>
            </div>

            <div className="flex flex-col gap-1.55">
              <label className="text-xs font-semibold text-[#c7c4d8]">기술적 해결 솔루션 설명</label>
              <textarea 
                required
                rows={4}
                value={solutionProposal}
                onChange={(e) => setSolutionProposal(e.target.value)}
                placeholder="당사 LLM 및 MLOps 인프라를 활용한 해결 방법론과 이노베이션 매칭 세부방안을 작성해 주십시오."
                className="bg-[#051424] border border-brand-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#c7c4d8]">커뮤니테이션 수신용 이메일 주소</label>
              <input 
                type="email" 
                required
                value={solutionEmail}
                onChange={(e) => setSolutionEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="bg-[#051424] border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#4edea3] hover:bg-white text-brand-bg font-semibold py-2.5 rounded-xl transition-all mt-2 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check size={16} />
              <span>제안서 발송하기</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
