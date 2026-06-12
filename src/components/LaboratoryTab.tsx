import React from "react";
import { 
  Beaker, 
  CheckCircle2, 
  Award, 
  Hourglass, 
  PlayCircle, 
  FileText, 
  MessagesSquare, 
  Send, 
  Sparkles,
  ChevronRight,
  User,
  Cpu,
  Bookmark
} from "lucide-react";
import { SurveyAnswers, ActivityLog } from "../types";

interface LaboratoryTabProps {
  xpPoints: number;
  addXpPoints: (points: number) => void;
  registeredBootcampCount: number;
  onStartMission: () => void;
}

export default function LaboratoryTab({ 
  xpPoints, 
  addXpPoints, 
  registeredBootcampCount,
  onStartMission
}: LaboratoryTabProps) {

  // Survey Wizard State
  const [showSurveyQuiz, setShowSurveyQuiz] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<SurveyAnswers>({
    role: "Fullstack Developer / Builder",
    focus: "Large Language Models & Finetuning",
    stage: "아이디어 기획 및 POC 초기 실험",
    team: "1인 인디 빌더 (Solo Builder)",
    challenge: "연산 비용 소모 및 API 레이턴시 해소"
  });
  const [isLoadingReport, setIsLoadingReport] = React.useState(false);
  const [aiReport, setAiReport] = React.useState<string | null>(null);

  // Chat Assistant State
  const [chatMessages, setChatMessages] = React.useState<Array<{role: "user" | "mentor", content: string}>>([
    { role: "mentor", content: "안녕하세요! Nexus Lab 헤드 아키텍터 멘토입니다. LLM 파인튜닝, 자율형 에이전트 설계, 인프라 비용 절감 문제 등 궁금하신 기술 현안들을 자유롭게 문의하십시오." }
  ]);
  const [chatInput, setChatInput] = React.useState("");
  const [isChatLoading, setIsChatLoading] = React.useState(false);

  // Survey questions config
  const quizQuestions = [
    {
      key: "role",
      title: "귀하의 인튜베이팅 주요 역할은 무엇입니까?",
      options: [
        "AI Systems Architect (아키텍트)",
        "Product & Project Manager (피엠)",
        "Fullstack Developer / Builder (웹개발)",
        "SaaS Startup Founder (스타트업 창업자)",
        "Research Scholar / ML Scientist (데이터 과학자)"
      ]
    },
    {
      key: "focus",
      title: "가장 주력하고 있는 AI 핵심 기술 분야는 어디입니까?",
      options: [
        "Large Language Models & Finetuning (파인튜닝)",
        "Multi-agent systems & Workflows (주체적 워크플로우)",
        "Computer Vision & YOLO pipelines (객체인식 비전)",
        "Semantic Search & RAG platforms (시맨틱 벡터검색)"
      ]
    },
    {
      key: "stage",
      title: "귀하가 작성 중인 AI 제품의 개발 단계는 어디입니까?",
      options: [
        "아이디어 기획 및 POC 초기 실험 (Ideation)",
        "알파 릴리즈 및 파일럿 적용 과정 (Alpha)",
        "상용화 완료 및 API 트래픽 확장 준비 (Production Scaling)"
      ]
    },
    {
      key: "team",
      title: "현재 가동 중인 개발 코어 크루 규모는 어느 정도입니까?",
      options: [
        "1인 인디 빌더 (Solo Builder)",
        "3-5인의 민첩한 소규모 코어 크루 (Lean Team)",
        "엔터프라이즈 레벨의 대규모 패키지 엔지니어 집단"
      ]
    },
    {
      key: "challenge",
      title: "당장 해결해야 할 현물 최고의 허들은 무엇입니까?",
      options: [
        "연산 비용 소모 및 API 레이턴시 해소 (Latency Optimization)",
        "안전한 고독점 데이터 격리 및 보안 심사 (Compliance)",
        "사용자 지표 및 지속적 엔터프라이즈 스케일링 지점 확보"
      ]
    }
  ];

  const handleOptionSelect = (option: string) => {
    const key = quizQuestions[currentStep].key as keyof SurveyAnswers;
    setAnswers({ ...answers, [key]: option });
  };

  const handleNextStep = () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateReport();
    }
  };

  const generateReport = async () => {
    setIsLoadingReport(true);
    setAiReport(null);
    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.report) {
        setAiReport(data.report);
        addXpPoints(300); // give points for completing questionnaire
      } else {
        setAiReport("서버 연동 중 응답 형식이 올바르지 않습니다. 다시 시도해 주세요.");
      }
    } catch (err) {
      console.error(err);
      setAiReport("Gemini AI 서버와 임시 연결 상태에 이상이 발생했습니다. 비밀번호/시크릿 설정을 확인해 주십시오.");
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true);

    try {
      const historyPayload = chatMessages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));

      const res = await fetch("/api/innovation-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: historyPayload }),
      });
      const data = await res.json();
      if (data.text) {
        setChatMessages(prev => [...prev, { role: "mentor", content: data.text }]);
        addXpPoints(20); // reward small points for tech queries
      } else {
        setChatMessages(prev => [...prev, { role: "mentor", content: "응답을 해석하지 못했습니다. 질문을 다시 입력해 주세요." }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: "mentor", content: "멘토 서버 접근 중 지연이 발생했거나 크레딧 장애가 있을 수 있습니다." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const latestActivities: ActivityLog[] = [
    { id: "act-1", title: "성장 전술 워크숍", subtitle: "2일 전 녹화됨 • 45분", type: "video" },
    { id: "act-2", title: "검토: 세일즈 퍼널 V2", subtitle: "멘토 피드백 수신 완료", type: "feedback", unread: true },
    { id: "act-3", title: "코호트 토론", subtitle: "내 스레드에 3개의 새로운 답글", type: "discussion" }
  ];

  // Helper inside component to parse simple markdown titles and paragraphs to keep visual style neat
  const renderMarkdownInStyle = (mdText: string) => {
    const lines = mdText.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        return <h4 key={idx} className="text-brand-primary text-sm font-bold font-display mt-4 mb-2">{trimmed.replace("###", "")}</h4>;
      }
      if (trimmed.startsWith("##")) {
        return <h3 key={idx} className="text-white text-base font-bold font-display mt-5 mb-2 border-b border-[#273647]/30 pb-1">{trimmed.replace("##", "")}</h3>;
      }
      if (trimmed.startsWith("#")) {
        return <h2 key={idx} className="text-brand-primary text-lg font-extrabold font-display mt-6 mb-3">{trimmed.replace("#", "")}</h2>;
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return <li key={idx} className="text-[#d4e4fa] text-xs leading-relaxed ml-4 list-disc mt-1">{trimmed.substring(1).trim()}</li>;
      }
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs text-[#c7c4d8] leading-relaxed mb-1">{trimmed}</p>;
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-4xl font-extrabold text-white tracking-tight">
          내 연구실
        </h2>
        <p className="text-[#c7c4d8] text-base">
          개인 성장 지표 및 활성 미션 관리.
        </p>
      </div>

      {/* Main Grid: Quiz Banner + Challenge Progress */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Banner Column (Spans 8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <section className="glass-panel-heavy rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl">
            {/* Background blur decorative circles */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#4f46e5]/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-[#4f46e5]/17 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                <span className="font-display text-xs font-bold text-error tracking-wider uppercase">조치 필요</span>
              </div>
              <h3 className="font-display text-3xl font-extrabold text-white mb-2">
                혁신 프로필 잠금 해제
              </h3>
              <p className="text-sm text-[#c7c4d8] max-w-xl mb-6 leading-relaxed">
                헤드 멘토의 AI 정밀 진단을 수행하여 맞춤형 AI 에이전트 아키텍처 템플릿과 
                전문 액셀러레이터 트랙 라이브러리에 액세스하십시오.
              </p>
            </div>

            {/* Quiz Action Container */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-center mt-4 border-t border-brand-border/40 pt-4">
              {aiReport ? (
                <button 
                  onClick={() => {
                    setAiReport(null);
                    setShowSurveyQuiz(true);
                    setCurrentStep(0);
                  }}
                  className="w-full sm:w-auto bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-primary hover:text-brand-bg transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  다시 진단하기
                </button>
              ) : !showSurveyQuiz ? (
                <button 
                  onClick={() => setShowSurveyQuiz(true)}
                  className="w-full sm:w-auto bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-primary hover:text-brand-bg transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  진단 설문 시작
                </button>
              ) : (
                <div className="w-full text-xs text-[#c7c4d8]/70">진단이 기동 중입니다...</div>
              )}
              
              <span className="font-display text-xs bg-[#0d1c2d]/60 border border-brand-border/40 px-3 py-1.5 rounded-lg text-[#c7c4d8] flex items-center gap-1.5">
                <Hourglass size={12} className="text-brand-tertiary" />
                <span>예상 소요 시간 5분</span>
              </span>
            </div>

            {/* Survey Wizard Form inside the card itself! */}
            {showSurveyQuiz && (
              <div className="relative z-10 mt-6 bg-[#051424]/90 border border-[#4f46e5]/40 rounded-xl p-5 flex flex-col gap-4 shadow-2xl animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-brand-border/30">
                  <span className="text-[11px] font-mono font-bold text-brand-primary uppercase">
                    Step {currentStep + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-[10px] text-[#c7c4d8]/50">진단 진행률: {((currentStep + 1)/quizQuestions.length * 100).toFixed(0)}%</span>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-white font-display leading-snug">
                    {quizQuestions[currentStep].title}
                  </h4>
                  <div className="flex flex-col gap-2 mt-2">
                    {quizQuestions[currentStep].options.map((opt) => {
                      const key = quizQuestions[currentStep].key as keyof SurveyAnswers;
                      const isSelected = answers[key] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleOptionSelect(opt)}
                          className={`w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-all cursor-pointer
                            ${isSelected 
                              ? "bg-[#4f46e5]/15 border-brand-primary text-brand-primary font-semibold" 
                              : "bg-[#0d1c2d]/80 border-brand-border/50 text-[#c7c4d8] hover:bg-[#1c2b3c]/50 hover:text-white"
                            }
                          `}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="text-xs px-4 py-2 border border-brand-border rounded hover:bg-brand-surface-high text-[#c7c4d8] cursor-pointer"
                    >
                      이전
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-[#4f46e5] text-white text-xs font-bold px-5 py-2 rounded hover:bg-[#c3c0ff] hover:text-[#131b2e] transition-colors cursor-pointer"
                  >
                    {currentStep === quizQuestions.length - 1 ? "진단서 제출 및 리포트 대기" : "다음 단계"}
                  </button>
                </div>
              </div>
            )}

            {/* AI Diagnosis Result Report */}
            {isLoadingReport && (
              <div className="relative z-10 mt-6 bg-[#051424]/90 border border-brand-primary rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 animate-pulse">
                <Sparkles size={32} className="text-[#4edea3]" />
                <p className="text-sm font-bold text-white">헤드 아키텍처 인공지능 분석 중...</p>
                <p className="text-xs text-[#c7c4d8]/80 max-w-sm">
                  Gemini-3.5-Flash 모델이 팀의 지향 아키텍처 데이터베이스와 호스트 에셋 매칭 정보를 교차 대조 중입니다.
                </p>
              </div>
            )}

            {aiReport && !isLoadingReport && (
              <div className="relative z-10 mt-6 bg-[#051424]/90 border border-brand-primary rounded-xl p-6 max-h-[500px] overflow-y-auto flex flex-col gap-3 shadow-inner scrollbar-thin">
                <div className="flex justify-between items-center pb-2 border-b border-[#273647]/50">
                  <span className="text-xs font-bold text-[#4edea3] flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>진단 결과서 인코딩 완료</span>
                  </span>
                  <button 
                    onClick={() => setAiReport(null)}
                    className="text-[10px] text-brand-on-surface-variant hover:text-white transition-colors"
                  >
                    리포트 닫기
                  </button>
                </div>

                {/* Styled Document Body */}
                <div className="markdown-body">
                  {renderMarkdownInStyle(aiReport)}
                </div>
              </div>
            )}

          </section>
        </div>

        {/* Right Active Challenge Card (Spans 4 cols) */}
        <div className="xl:col-span-4">
          <section className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center shadow-xl h-full justify-between">
            <div className="w-full text-left">
              <h3 className="font-display text-lg font-bold text-white mb-1 border-b border-[#273647]/40 pb-1 flex items-center justify-between">
                <span>참여 중인 챌린지</span>
                <span className="text-[11px] font-mono text-brand-primary">Cohort Sprint</span>
              </h3>
              <p className="text-xs text-[#c7c4d8]/70 mt-1">
                {registeredBootcampCount > 0 
                  ? "B2B 엔터프라이즈 통합 스프린트 코호트" 
                  : "3분기 B2B 리드 생성 스프린트"
                }
              </p>
            </div>

            {/* Circular progress SVG */}
            <div className="relative w-36 h-36 my-4 select-none">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  className="text-brand-surface-highest stroke-current" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  strokeWidth="8"
                />
                <circle 
                  className="text-brand-tertiary stroke-current progress-ring__circle drop-shadow-[0_0_8px_rgba(78,222,163,0.3)]" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={registeredBootcampCount > 0 ? "35" : "62.8"} // custom progress depending on registered counts
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl font-black text-white leading-none">
                  {registeredBootcampCount > 0 ? "85" : "75"}
                  <span className="text-lg text-brand-tertiary font-bold">%</span>
                </span>
                <span className="text-[9px] text-brand-on-surface-variant uppercase mt-1">
                  Progress
                </span>
              </div>
            </div>

            <div className="w-full flex justify-between items-center bg-brand-surface-low rounded-xl p-3 border border-brand-border/40 select-none">
              <span className="text-xs text-[#c7c4d8]">환급 상태</span>
              <span className="px-2.5 py-1 bg-brand-tertiary/10 text-brand-tertiary rounded-lg text-xs font-bold flex items-center gap-1 border border-brand-tertiary/20">
                <CheckCircle2 size={12} />
                <span>정상 진행 중</span>
              </span>
            </div>
          </section>
        </div>

      </div>

      {/* Row 2: Mileages & Activities logs */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Activity Mileage XP Track (Spans 6 cols) */}
        <section className="col-span-12 xl:col-span-6 glass-panel rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <h3 className="font-display text-lg font-bold text-white border-b border-[#273647]/40 pb-1 flex items-center justify-between">
            <span>활동 마일리지</span>
            <Award size={18} className="text-brand-primary" />
          </h3>

          <div className="flex items-end gap-2.5">
            <span className="font-display text-4xl font-extrabold text-white leading-none">
              {xpPoints.toLocaleString()}
            </span>
            <span className="text-xs text-[#c7c4d8] mb-1 font-mono">XP ACQUIRED</span>
          </div>

          {/* Progress Tracker Bar */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#4f46e5] font-bold">초급 빌더</span>
              <span className="text-xs text-[#c7c4d8]/70">코어 멤버 (3,000 XP 달성 시)</span>
            </div>

            <div className="w-full h-2.5 bg-brand-surface-low rounded-full overflow-hidden border border-brand-border/40">
              <div 
                className="h-full bg-gradient-to-r from-[#4f46e5] to-brand-tertiary transition-all duration-500 relative"
                style={{ width: `${Math.min((xpPoints / 3000) * 100, 100)}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-[#010f1f]/80 p-3 rounded-xl border border-[#273647]/50 text-center">
              <p className="text-[10px] text-[#c7c4d8]/60 uppercase font-mono tracking-wider">세션 기록</p>
              <h5 className="font-display text-lg font-extrabold text-white">12</h5>
            </div>
            <div className="bg-[#010f1f]/80 p-3 rounded-xl border border-[#273647]/50 text-center">
              <p className="text-[10px] text-[#c7c4d8]/60 uppercase font-mono tracking-wider">마일스톤</p>
              <h5 className="font-display text-lg font-extrabold text-white">
                {registeredBootcampCount > 0 ? 5 : 4}
              </h5>
            </div>
            <div className="bg-[#010f1f]/80 p-3 rounded-xl border border-[#273647]/50 text-center">
              <p className="text-[10px] text-[#c7c4d8]/60 uppercase font-mono tracking-wider">연속 활동</p>
              <h5 className="font-display text-lg font-extrabold text-brand-tertiary">5d</h5>
            </div>
          </div>
        </section>

        {/* Recent & Related Activities (Spans 6 cols) */}
        <section className="col-span-12 xl:col-span-6 glass-panel rounded-2xl p-6 shadow-xl flex flex-col gap-3">
          <h3 className="font-display text-lg font-bold text-white border-b border-[#273647]/40 pb-1">
            최근 및 관련 활동
          </h3>

          <ul className="flex flex-col gap-2.5">
            {latestActivities.map((act) => (
              <li 
                key={act.id}
                className="flex items-center gap-3 p-2 bg-[#010f1f]/40 hover:bg-[#1a2c3f]/40 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-brand-border/40"
                onClick={() => alert(`[${act.title}] 상세 로그 조회 페이지 프로토타입입니다.`)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105
                  ${act.type === "video" ? "bg-[#4f46e5]/10 text-[#4f46e5]" : ""}
                  ${act.type === "feedback" ? "bg-brand-tertiary/10 text-brand-tertiary" : ""}
                  ${act.type === "discussion" ? "bg-brand-primary/10 text-brand-primary" : ""}
                `}>
                  {act.type === "video" && <PlayCircle size={16} />}
                  {act.type === "feedback" && <FileText size={16} />}
                  {act.type === "discussion" && <MessagesSquare size={16} />}
                </div>

                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white">{act.title}</h4>
                  <p className="text-[10px] text-[#c7c4d8]/70 mt-0.5">{act.subtitle}</p>
                </div>

                {act.unread && (
                  <span className="w-2 h-2 rounded-full bg-brand-tertiary animate-pulse mr-2" />
                )}
                <ChevronRight size={14} className="text-[#c7c4d8]/40 group-hover:translate-x-1 transition-transform" />
              </li>
            ))}
          </ul>
        </section>

      </div>

      {/* AI Assistant Chat Section (Bottom) */}
      <section id="ai-mentor-section" className="glass-panel rounded-2xl p-6 shadow-xl border border-[#4f46e5]/30 flex flex-col gap-4 mt-2">
        <div className="flex justify-between items-center pb-2 border-b border-[#273647]/40">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#c3c0ff]" />
            <h3 className="font-display text-lg font-bold text-white">헤드 아키텍터 멘토 1:1 토크 데스크</h3>
          </div>
          <span className="text-[10px] bg-[#4edea3]/10 text-brand-tertiary px-2 py-0.5 rounded border border-[#4edea3]/20 uppercase">
            Gemini-3.5-Flash 가동 중
          </span>
        </div>

        {/* Chat window viewport */}
        <div className="bg-[#090f17] border border-brand-border/40 rounded-xl p-4 h-64 overflow-y-auto flex flex-col gap-3 scrollbar-thin">
          {chatMessages.map((msg, index) => (
            <div 
              key={index}
              className={`flex gap-2.5 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border select-none
                ${msg.role === "user" 
                  ? "bg-[#4f46e5]/20 border-brand-primary text-brand-primary" 
                  : "bg-brand-tertiary/10 border-brand-tertiary text-brand-tertiary"
                }
              `}>
                <User size={12} />
              </div>

              <div className={`text-xs px-3 py-2 rounded-xl leading-relaxed whitespace-pre-wrap
                ${msg.role === "user" 
                  ? "bg-[#4f46e5] text-white rounded-tr-none" 
                  : "bg-[#1c2b3c] text-white rounded-tl-none border border-brand-border/30"
                }
              `}>
                {msg.content}
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="mr-auto flex gap-2.5 items-center text-xs text-[#c7c4d8]/60 animate-pulse">
              <div className="w-2 h-2 bg-brand-tertiary rounded-full" />
              <span>헤드 아키텍처 수석 멘토가 입력하는 중입니다...</span>
            </div>
          )}
        </div>

        {/* Chat input form */}
        <form onSubmit={handleSendChatMessage} className="flex gap-2.5">
          <input 
            type="text" 
            required
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isChatLoading}
            placeholder="예: MLOps 데이터 파이프라인에서 Redis 시맨틱 캐싱의 도입 방식을 구성하고 싶어."
            className="flex-1 bg-brand-surface-low border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#c7c4d8]/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!chatInput.trim() || isChatLoading}
            className="bg-[#4f46e5] hover:bg-[#c3c0ff] hover:text-[#131b2e] text-white p-2.5 rounded-xl transition-all font-semibold active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </section>

    </div>
  );
}
