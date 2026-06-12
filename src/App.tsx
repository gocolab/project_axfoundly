import React from "react";
import { 
  Bell, 
  Zap, 
  Search, 
  Award, 
  BookOpen, 
  Briefcase, 
  CheckCircle, 
  Code,
  Sparkles,
  Beaker,
  User,
  Activity
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import LaboratoryTab from "./components/LaboratoryTab";
import EventsTab from "./components/EventsTab";
import AssetsTab from "./components/AssetsTab";
import InsightsTab from "./components/InsightsTab";
import { 
  B2BBootcamp, 
  ShowcaseProject, 
  ProjectMatchRequest, 
  AssetLibraryItem 
} from "./types";

export default function App() {
  // Global States
  const [activeTab, setActiveTab] = React.useState<string>("events");
  const [xpPoints, setXpPoints] = React.useState<number>(2450);
  const [searchText, setSearchText] = React.useState<string>("");
  
  // Modals / Trigger UI States
  const [showProfileCard, setShowProfileCard] = React.useState<boolean>(false);
  const [showNotificationOverlay, setShowNotificationOverlay] = React.useState<boolean>(false);
  const [showMissionModal, setShowMissionModal] = React.useState<boolean>(false);
  const [missionsCompleted, setMissionsCompleted] = React.useState<Record<string, boolean>>({
    quest1: false,
    quest2: false,
    quest3: false
  });

  const addXpPoints = (amount: number) => {
    setXpPoints(prev => prev + amount);
  };

  // Mock Datasets (Stateful for live interactions!)
  const [bootcamps, setBootcamps] = React.useState<B2BBootcamp[]>([
    {
      id: "bc-1",
      title: "LLM 파인튜닝 마스터리",
      description: "커스텀 모델 어라인먼트를 위한 실무 아키텍처. LoRA, QLoRA, 전용 컴퓨팅 GPU 토큰 및 엔프 크레딧 팩 포함.",
      startDate: "10월 15일 시작",
      originalPrice: 1200,
      discountedPrice: 899,
      deposit: 150,
      isRegistered: false
    },
    {
      id: "bc-2",
      title: "B2B 에이전틱 워크플로우",
      description: "기업 전속 자동화 워크플로우를 위한 자율 분산형 멀티 에이전트 시스템 빌드 및 비공개 엔터프라이즈 배포 가이드.",
      startDate: "11월 1일 시작",
      originalPrice: 1500,
      discountedPrice: 1050,
      deposit: 200,
      isRegistered: false
    }
  ]);

  const [showcaseProjects, setShowcaseProjects] = React.useState<ShowcaseProject[]>([
    {
      id: "proj-1",
      title: "뉴로로직 에이전트",
      description: "금융 분석 및 시계열 트렌드 리포트 작성을 위해 정합이 완료된 자율형 실시간 웹 파싱 솔계 에이전트.",
      live: true,
      likes: 1240,
      comments: 84,
      author: "@cipher_x",
      bgGradient: "from-blue-600 to-indigo-900"
    },
    {
      id: "proj-2",
      title: "신세틱스 NLP 파이프라인",
      description: "실시간 글로벌 분산 소셜 미디어 인덱스 및 리서치를 위해 메모리 컴포넌트가 격리된 멀티채널 감성 평가 파이프라인.",
      live: false,
      likes: 856,
      comments: 22,
      author: "@data_smith",
      bgGradient: "from-teal-600 to-emerald-950"
    }
  ]);

  const [matchRequests, setMatchRequests] = React.useState<ProjectMatchRequest[]>([
    {
      id: "match-1",
      title: "핀테크 인프라 구축",
      description: "안전하게 격리된 LLM 다단계 라우팅 레이블 및 규격 가이드를 수용할 코어 엔지니어 아키텍트를 소집합니다. 예산: 높음.",
      budget: "높음",
      timeAgo: "2시간 전"
    },
    {
      id: "match-2",
      title: "커스텀 비전 모델 R&D",
      description: "분류 보틀넥이 완료된 물류 창고 파이프라인 장비를 위한 YOLOv8 프레임 가속 및 피팅 전문가 협업이 필요합니다.",
      budget: "중간",
      timeAgo: "1일 전"
    }
  ]);

  const assetItems: AssetLibraryItem[] = [
    {
      id: "item-1",
      filename: "엔터프라이즈 워크플로우 v2.json",
      description: "내부 LLM 통합을 위한 자동화된 QA 전용 라우팅 스키마. 분기 컴파일 45개 노드.",
      grade: "엘리트 등급",
      type: "json"
    },
    {
      id: "item-2",
      filename: "B2B_협상_프롬프트.yaml",
      description: "에이전틱 협상 시뮬레이터 및 의사 결정 트리를 위한 전용 파라메트릭 프롬프트 팩.",
      grade: "코어 등급",
      type: "yaml"
    }
  ];

  // Actions
  const handleRegisterBootcamp = (id: string) => {
    setBootcamps(prev =>
      prev.map(bc => {
        if (bc.id === id) {
          addXpPoints(350); // reward on registration
          return { ...bc, isRegistered: true };
        }
        return bc;
      })
    );
    alert("부트캠프 코호트 등록이 완료되었습니다! 보증금 가결제가 인가되었으며 연구실 마일스톤에 반영되었습니다. (+350 XP 획득)");
  };

  const handleAddMatchRequest = (title: string, description: string, budget: "높음" | "중간" | "연구협력") => {
    const newReq: ProjectMatchRequest = {
      id: `match-${Date.now()}`,
      title,
      description,
      budget,
      timeAgo: "방금 전",
      isCustom: true
    };
    setMatchRequests(prev => [newReq, ...prev]);
  };

  const handleLikeProject = (id: string) => {
    setShowcaseProjects(prev =>
      prev.map(p => {
        if (p.id === id) {
          return { ...p, likes: p.likes + 1 };
        }
        return p;
      })
    );
  };

  const handleCompleteMissionQuest = (questKey: string, xpReward: number) => {
    if (missionsCompleted[questKey]) return;
    setMissionsCompleted(prev => ({ ...prev, [questKey]: true }));
    addXpPoints(xpReward);
    alert(`데일리 퀘스트 클리어! 경험치 ${xpReward} XP가 안전하게 연동되었습니다.`);
  };

  // Helper counting registered bootcamps
  const registeredBootcampCount = bootcamps.filter(b => b.isRegistered).length;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-on-surface flex flex-col font-sans selection:bg-brand-primary-container selection:text-white">
      
      {/* 1. Global Side Navigation Bar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        xpPoints={xpPoints}
        onStartMission={() => setShowMissionModal(true)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        
        {/* Top Header Navigation Bar */}
        <header className="bg-brand-bg/85 backdrop-blur-xl border-b border-brand-border/40 top-0 sticky z-30 flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 select-none">
            <span className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <Sparkles className="text-brand-primary animate-pulse" size={20} />
              <span>Nexus Lab</span>
            </span>
          </div>

          {/* Quick Universal App Search Filter Bar */}
          <div className="flex-1 max-w-md mx-6 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={16} />
              <input 
                type="text" 
                placeholder="관심 아티클, 에셋, 연구 아젠다 통합 검색..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-brand-surface-low border border-brand-border rounded-full py-1.5 pl-10 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/70 focus:outline-none focus:border-brand-primary transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Interface interactive controls */}
          <div className="flex items-center gap-2">
            
            {/* Notification drop indicator */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationOverlay(!showNotificationOverlay)}
                className="text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high p-2 rounded-full transition-colors relative cursor-pointer"
                title="통합 알림"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-bounce" />
              </button>

              {showNotificationOverlay && (
                <div className="absolute right-0 mt-2 w-72 bg-brand-surface-high border border-brand-border rounded-xl p-4 shadow-xl z-50 text-xs flex flex-col gap-2.5 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                    <span className="font-bold text-white">동기화 알림</span>
                    <button 
                      onClick={() => setShowNotificationOverlay(false)}
                      className="text-[10px] text-brand-on-surface-variant hover:text-white"
                    >
                      모두 읽음
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="p-1.5 hover:bg-brand-surface-low rounded transition-colors cursor-pointer">
                      <p className="font-semibold text-brand-primary">멘토 코멘트 도착</p>
                      <p className="text-[10px] text-[#c7c4d8] mt-0.5">Sarah Chen 설계사가 로드맵을 승인했습니다.</p>
                    </div>
                    <div className="p-1.5 hover:bg-brand-surface-low rounded transition-colors cursor-pointer">
                      <p className="font-semibold text-brand-tertiary">새로운 B2B 챌린지 오픈</p>
                      <p className="text-[10px] text-[#c7c4d8] mt-0.5">대량 분산 캐싱 트랙 검토가 업로드되었습니다.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick energy speed-up trigger */}
            <button 
              onClick={() => {
                addXpPoints(50);
                alert("가속 부스터가 기동되었습니다! 임시 연산 분산 노드에서 토큰을 징수하였습니다. (+50 XP 획득)");
              }}
              className="text-brand-tertiary hover:bg-brand-surface-high p-2 rounded-full transition-colors cursor-pointer"
              title="연산 가속 부스트"
            >
              <Zap size={18} className="animate-pulse" />
            </button>

            {/* Profile Avatar Trigger Card */}
            <div 
              onClick={() => setShowProfileCard(true)}
              className="w-8 h-8 rounded-full overflow-hidden border border-brand-primary/50 relative ml-2 cursor-pointer hover:scale-105 transition-transform"
              title="아키텍트 프로필 진단"
            >
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4DzOXtcLhlJaObXjpTySO3CMprQZs1z8lGuQLG-GhophiJP1iD39ZxJWilu0vkYP6bgmPuvBTKH9VhdvthM6AXcAisZmYptPterwwjTyPVpBFzGObMtT37hA7gwyVWBNJG-KMQdau7LTQUr8i3L3DokMedIOEJ45_3d6QthIZrdFq9Dih1Z_d7DQxKNrxPNbBbyoCTCjqmAYZnWH0wufC9hV28nIFZS2hkLzD6__fjY-SA3NIwkZoE6sX6ZHumoN76dC30mANV6xw"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-tertiary rounded-full border border-brand-surface pulse-indicator" />
            </div>
          </div>
        </header>

        {/* 3. Render Area with Grid Padding */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {activeTab === "laboratory" && (
            <LaboratoryTab 
              xpPoints={xpPoints} 
              addXpPoints={addXpPoints}
              registeredBootcampCount={registeredBootcampCount}
              onStartMission={() => setShowMissionModal(true)}
            />
          )}

          {activeTab === "events" && (
            <EventsTab 
              bootcamps={bootcamps} 
              onRegisterBootcamp={handleRegisterBootcamp}
              searchText={searchText}
              setSearchText={setSearchText}
            />
          )}

          {activeTab === "assets" && (
            <AssetsTab 
              showcaseProjects={showcaseProjects}
              matchRequests={matchRequests}
              onAddMatchRequest={handleAddMatchRequest}
              onLikeProject={handleLikeProject}
              assetItems={assetItems}
              addXpPoints={addXpPoints}
            />
          )}

          {activeTab === "insights" && (
            <InsightsTab 
              addXpPoints={addXpPoints}
            />
          )}
        </main>

      </div>

      {/* MODAL 4: User Profile accomplishments */}
      {showProfileCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4 border border-brand-primary/40 shadow-2xl relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-brand-primary overflow-hidden bg-brand-surface-low">
              <img 
                alt="User Profile Modal" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4DzOXtcLhlJaObXjpTySO3CMprQZs1z8lGuQLG-GhophiJP1iD39ZxJWilu0vkYP6bgmPuvBTKH9VhdvthM6AXcAisZmYptPterwwjTyPVpBFzGObMtT37hA7gwyVWBNJG-KMQdau7LTQUr8i3L3DokMedIOEJ45_3d6QthIZrdFq9Dih1Z_d7DQxKNrxPNbBbyoCTCjqmAYZnWH0wufC9hV28nIFZS2hkLzD6__fjY-SA3NIwkZoE6sX6ZHumoN76dC30mANV6xw"
              />
            </div>

            <div className="text-center mt-10">
              <h4 className="font-display text-lg font-bold text-white">Nexus Elite Builder</h4>
              <p className="text-xs font-semibold text-[#4edea3] mt-1 font-mono uppercase tracking-wider">
                Rank: {xpPoints >= 3000 ? "Core AI Architect (코어 아키텍트)" : "Elite Candidate (엘리트 후보군)"}
              </p>
              <p className="text-[11px] text-[#c7c4d8] mt-2">이메일: mahau.master@gmail.com</p>
            </div>

            <div className="bg-[#051424] rounded-xl p-3 border border-brand-border/40 grid grid-cols-2 gap-3 text-center text-xs">
              <div>
                <p className="text-[#c7c4d8]/60 text-[10px] uppercase font-mono">가속 레벨</p>
                <p className="font-bold text-brand-primary mt-0.5">Grade AA</p>
              </div>
              <div>
                <p className="text-[#c7c4d8]/60 text-[10px] uppercase font-mono">참가 코호트</p>
                <p className="font-bold text-white mt-0.5">{registeredBootcampCount}개 트랙</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-brand-primary flex items-center gap-1">
                <Award size={14} />
                <span>승인 완료된 기술 엠블럼</span>
              </p>
              <div className="flex gap-2">
                <span className="bg-brand-primary-container/20 text-[#c3c0ff] border border-[#c3c0ff]/30 text-[10px] px-2 py-1 rounded">RAG Spec</span>
                <span className="bg-brand-tertiary/15 text-brand-tertiary border border-brand-tertiary/20 text-[10px] px-2 py-1 rounded">Finetune</span>
                <span className="bg-brand-surface-high text-[#c7c4d8] text-[10px] px-2 py-1 rounded">GPU Node</span>
              </div>
            </div>

            <button 
              onClick={() => setShowProfileCard(false)}
              className="w-full bg-[#1c2b3c] border border-brand-border text-white text-xs py-2 rounded-lg hover:bg-brand-surface-highest transition-colors cursor-pointer"
            >
              프로필 패널 닫기
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: Mission start daily challenges */}
      {showMissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 border border-[#4f46e5]/40 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-brand-border/40">
              <h4 className="font-display text-lg font-bold text-[#c3c0ff] flex items-center gap-2">
                <Activity size={18} className="text-[#4edea3]" />
                <span>데일리 미션: 수석 챌린지</span>
              </h4>
              <button 
                onClick={() => setShowMissionModal(false)}
                className="text-xs text-[#c7c4d8] hover:text-white cursor-pointer"
              >
                닫기
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs text-[#c7c4d8] leading-relaxed">
                오늘 완료하여 더 많은 경험치(XP)와 엠블럼을 수령해 등급을 업그레이드 하십시오:
              </p>

              {/* Quest item 1 */}
              <div className="p-3 bg-[#051424] border border-brand-border/40 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">아키텍처 멘토 1:1 토크 채널 가동</h5>
                  <p className="text-[10px] text-[#c7c4d8] mt-0.5">내 연구실에서 AI 아키텍트에게 1회 이상 질문 던지기</p>
                </div>
                {missionsCompleted.quest1 ? (
                  <span className="text-[10px] bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20 px-2 py-0.5 rounded font-bold">완료</span>
                ) : (
                  <button 
                    onClick={() => {
                      setActiveTab("laboratory");
                      setShowMissionModal(false);
                      setTimeout(() => {
                        const elem = document.getElementById("ai-mentor-section");
                        elem?.scrollIntoView({ behavior: "smooth" });
                      }, 120);
                      handleCompleteMissionQuest("quest1", 100);
                    }}
                    className="text-[10px] bg-[#4f46e5] text-white px-2.5 py-1 rounded font-semibold hover:bg-brand-primary hover:text-brand-bg transition-colors cursor-pointer"
                  >
                    이동 (+100 XP)
                  </button>
                )}
              </div>

              {/* Quest item 2 */}
              <div className="p-3 bg-[#051424] border border-brand-border/40 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">엔터프라이즈 JSON 스키마 에셋 다운로드</h5>
                  <p className="text-[10px] text-[#c7c4d8] mt-0.5">이노베이션 허브 아카이브에서 v2.json 에셋 복수 다운로드하기</p>
                </div>
                {missionsCompleted.quest2 ? (
                  <span className="text-[10px] bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20 px-2 py-0.5 rounded font-bold">완료</span>
                ) : (
                  <button 
                    onClick={() => {
                      setActiveTab("assets");
                      setShowMissionModal(false);
                      handleCompleteMissionQuest("quest2", 150);
                    }}
                    className="text-[10px] bg-[#4f46e5] text-white px-2.5 py-1 rounded font-semibold hover:bg-brand-primary hover:text-brand-bg transition-colors cursor-pointer"
                  >
                    이동 (+150 XP)
                  </button>
                )}
              </div>

              {/* Quest item 3 */}
              <div className="p-3 bg-[#051424] border border-brand-border/40 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">에디토리얼 테크 아티클 원터치 요약</h5>
                  <p className="text-[10px] text-[#c7c4d8] mt-0.5">인사이트 블로그에서 Elena의 리포트 AI 분석해 요약본 읽기</p>
                </div>
                {missionsCompleted.quest3 ? (
                  <span className="text-[10px] bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20 px-2 py-0.5 rounded font-bold">완료</span>
                ) : (
                  <button 
                    onClick={() => {
                      setActiveTab("insights");
                      setShowMissionModal(false);
                      handleCompleteMissionQuest("quest3", 100);
                    }}
                    className="text-[10px] bg-[#4f46e5] text-white px-2.5 py-1 rounded font-semibold hover:bg-brand-primary hover:text-brand-bg transition-colors cursor-pointer"
                  >
                    이동 (+100 XP)
                  </button>
                )}
              </div>

            </div>

            <button 
              onClick={() => setShowMissionModal(false)}
              className="w-full bg-[#1c2b3c] border border-brand-border text-xs py-2 rounded-lg hover:bg-brand-surface-highest transition-colors cursor-pointer"
            >
              퀘스트 창 닫기
            </button>
          </div>
        </div>
      )}

      {/* Mobile view bottom navigations */}
      <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 w-full bg-brand-surface-low border-t border-brand-border/40 z-40 px-3 py-2 flex justify-around items-center select-none">
        <button 
          onClick={() => setActiveTab("laboratory")}
          className={`flex flex-col items-center gap-1 p-1 text-xs cursor-pointer ${activeTab === "laboratory" ? "text-brand-primary font-bold" : "text-brand-on-surface-variant"}`}
        >
          <Beaker size={18} />
          <span>연구실</span>
        </button>
        <button 
          onClick={() => setActiveTab("events")}
          className={`flex flex-col items-center gap-1 p-1 text-xs cursor-pointer ${activeTab === "events" ? "text-brand-primary font-bold" : "text-brand-on-surface-variant"}`}
        >
          <Award size={18} />
          <span>이벤트</span>
        </button>
        <button 
          onClick={() => setActiveTab("assets")}
          className={`flex flex-col items-center gap-1 p-1 text-xs cursor-pointer ${activeTab === "assets" ? "text-brand-primary font-bold" : "text-brand-on-surface-variant"}`}
        >
          <Code size={18} />
          <span>에셋공유</span>
        </button>
        <button 
          onClick={() => setActiveTab("insights")}
          className={`flex flex-col items-center gap-1 p-1 text-xs cursor-pointer ${activeTab === "insights" ? "text-brand-primary font-bold" : "text-brand-on-surface-variant"}`}
        >
          <BookOpen size={18} />
          <span>인사이트</span>
        </button>
      </nav>

    </div>
  );
}
