import React from "react";
import { 
  TrendingUp, 
  ArrowRight, 
  BookOpen, 
  Bot, 
  Sparkles, 
  Clock, 
  User, 
  Flame,
  Award,
  BookOpenCheck
} from "lucide-react";
import { InsightArticle } from "../types";

interface InsightsTabProps {
  addXpPoints: (points: number) => void;
}

export default function InsightsTab({ addXpPoints }: InsightsTabProps) {

  const articles: InsightArticle[] = [
    {
      id: "art-1",
      title: "기업 아키텍처 내 AI 에이전트의 미래",
      description: "자율형 AI 시스템이 기업 내 데이터 플로우 구조와 분산 캐싱 패턴을 어떻게 근본적으로 재편하고 있는지에 대한 전면 연구 및 실무 심층 분석 리포트입니다.",
      category: "에디토리얼 피쳐",
      readTime: "읽기 시간 8분",
      authorName: "Dr. Elena Rostova",
      authorRole: "Lead AI Systems Architect",
      authorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjzWNLWXjzv1OC5qhPBB-bSyT8wqDWStFxKN7CfnKA7Hf2Wcz4kzbasLYbSqH_vYanDMk2J3X394BvAeS7wBFgLgtLluRaBORFaNLru0J2nE0FGFNipTzZ2lNSq_ZiDdeXV-fsj4emAk_90Ia-HoFNEWMo5zhfpwB8GOwTEp_JvBdiHDJJXVvRpORGA04CdTgt3p7qt7QoqQJxcMi-A90ohttv2ABLD9xsewyapWwVjvi5GeZX8d7YHRTbV3NkZJHNzKMu7gP6mkt0",
      publishDate: "2026.06.10"
    },
    {
      id: "art-2",
      title: "스타트업을 위한 규제 준수 및 보안 가이드",
      description: "투자 유치 성공 및 초기 연방 자금 지원 승인을 확보하기 위한 엔터프라이즈급 API 보안, PII 비식별화 암호화 가이드 및 규제 컴플라이언스 체크리스트.",
      category: "스타트업 가이드",
      readTime: "읽기 시간 5분",
      authorName: "Nexus Compliance Crew",
      authorRole: "Policy & Law Associate"
    },
    {
      id: "art-3",
      title: "0에서 1,000만 API 호출까지 데이터 인프라 스케일링",
      description: "Nexus Lab 멤버인 Sarah Chen 엔지니어가 설계하여 성장에 성공한 대량 분산 분산형 캐시 레이아웃과 서빙 코호트 오케스트레이션 성능 평가 단독 인터뷰.",
      category: "케이스 스터디",
      readTime: "읽기 시간 6분",
      authorName: "Sarah Chen",
      authorRole: "Software Infrastructure Lead",
      authorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpnjtBx6QhgZpv4KU9ysEeOsEpQDMC2xi197UCTnOhUxADPCt1GrGuP1ba23Gs1t20lZRilyOLjUCjVyR1z4d2HhLiIIdla_peR14Gt7USxYWFe-TCY1RyCoDbVKDKFxDt_vRdMkRFdz8_VLVjVjKdWkbBO6HBrW_Me9ZDJAPoabqcRq2f85AHhj5oRXVkFibJNdqN_VrvGIqSvd60HwKqdDsB3fmxmVbl9IMl3jS3JU6EuLmEgY01AKlqMVSBTSGHsqC3R5SuyRVp"
    }
  ];

  const trendReports = [
    {
      id: "trend-1",
      date: "Oct 12, 2023",
      title: "LLM과 심볼릭 로직의 융합 (Hybrid Neuro-Symbolic AI)",
      description: "금융 리스크 평가 및 하이 스케일 트레이딩 아키텍처 모델링에서 신경망 유도성과 논리 기호 체계 융합이 필수 지표로 자리 잡는 기술 해설.",
      accent: "bg-brand-tertiary"
    },
    {
      id: "trend-2",
      date: "Oct 08, 2023",
      title: "차세대 하드웨어 가속 기술 (Custom Silicon Scaling)",
      description: "초기 AI 인큐베이팅 스타트업이 범용 GPU 호스팅 대신 독점 엣지 가속기를 도입했을 때 거두는 ROI 비교 통계 및 연산 효율 분기점 분석.",
      accent: "bg-brand-primary"
    }
  ];

  // Article Summarizer States
  const [selectedArticle, setSelectedArticle] = React.useState<InsightArticle | null>(null);
  const [summaryResult, setSummaryResult] = React.useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = React.useState(false);

  const handleSummarize = async (article: InsightArticle) => {
    setSelectedArticle(article);
    setIsLoadingSummary(true);
    setSummaryResult("");

    try {
      const prompt = `
당신은 최고의 스타트업 투자 심사역이자 수석 기술 리포터입니다.
다음 B2B 테크 아키텍처 아티클의 내용을 3개의 정돈된 불렛 포인트로 한국어로 요약해 주십시오. 
기술 전문 용어(예: RAG, 파인튜닝, 다이내믹 피팅, 레이턴시, 스케일링)를 정밀하게 직관적으로 조합하여, 가치가 극대화되게 전달해 주십시오.

아티클 정보:
- 제목: ${article.title}
- 분류: ${article.category}
- 저자: ${article.authorName} (${article.authorRole || "Unknown"})
- 내용 개요: ${article.description}

최종 요약 구조:
- **[핵심 기술 테이크어웨이]**: 내용 요약
- **[비즈니스적 시너지]**: 스타트업 지표 및 자금 유치에 적용할 수 있는 가치
- **[액셀러레이팅 권장 사항]**: 허브 빌더가 당장 다운로드하여 테스트해봐야 할 설계 방식
      `;

      const response = await fetch("/api/innovation-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await response.json();
      if (data.text) {
        setSummaryResult(data.text);
        addXpPoints(75); // give reward to user for reading
      } else {
        setSummaryResult("요약 아티클 적합성 분석에 실패하였습니다.");
      }
    } catch (err) {
      console.error(err);
      setSummaryResult("서버 API 시큐리티 에러: Gemini AI 서비스 통신 실패. 프라이버시 설정을 조율하십시오.");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-1 text-center md:text-left">
        <h2 className="font-display text-4xl font-extrabold text-white tracking-tight">
          인사이트 블로그
        </h2>
        <p className="text-[#c7c4d8] text-base max-w-2xl">
          Knowledge sharing and thought leadership for AI builders and B2B entrepreneurs.
        </p>
      </div>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 1. L-SIZE Bento Hero Banner: Featured Editorial Article (Spans 8 cols) */}
        <article 
          onClick={() => handleSummarize(articles[0])}
          className="lg:col-span-8 glass-panel rounded-2xl overflow-hidden group cursor-pointer relative h-[480px] hover:border-brand-primary transition-all duration-300 shadow-xl"
        >
          {/* Background image illustration */}
          <div className="absolute inset-0 z-0">
            <img 
              alt="Interconnected tech nodes representing AI enterprise" 
              className="w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700 ease-out" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdGfFsBcfBcTrdhdGxjQMaig_wSCGoJceIXeNiHiRA5RWJrnQ1cha1VYciH8mscUofitV2xnvkuN5uPKffT7-gCI-3JOBiICSvelJxKtW8t2cSImxZmwiA53nEpNyeQ71dvr2w0hdonUaaq-T9go1CDqLR8f0OreSFhJNMEHtXTzcjXCyX-e8_78rePBr6Gb6tvohv7X0mvrAEBX-AoGKwIUw51iwwoIf-2qOX8bhaoT3iL92_vh3BrO0yiOluPUBFS-5KnikoYgx2"
              referrerPolicy="no-referrer"
            />
            {/* Dark heavy gradient on bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-[#051424]/85 to-[#051424]/10" />
          </div>

          {/* Card Content overlay */}
          <div className="absolute inset-0 p-6 md:p-8 z-10 flex flex-col justify-end h-full">
            <div className="mb-4 flex items-center gap-3">
              <span className="bg-[#4f46e5]/80 text-[#d4e4fa] px-3 py-1 rounded-full text-xs font-bold font-display uppercase tracking-wider select-none">
                에디토리얼 피쳐
              </span>
              <span className="text-xs text-[#c7c4d8]/90 font-mono flex items-center gap-1.5 select-none">
                <Clock size={12} className="text-brand-tertiary" />
                <span>읽기 시간 8분</span>
              </span>
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-3 leading-snug group-hover:text-brand-primary transition-colors">
              기업 아키텍처 내 AI 에이전트의 미래
            </h2>
            
            <p className="text-[#c7c4d8] text-sm md:text-base max-w-3xl mb-6 line-clamp-2 leading-relaxed">
              자율형 AI 시스템이 기업 내 레거시 데이터 플로우 구조와 분산 하이브리드 캐싱 패턴을 어떻게 근본적으로 재편하고 있는지에 대한 전면 실무 기술 리포트입니다.
            </p>

            {/* Author Profile */}
            <div className="flex items-center gap-3 mt-2 border-t border-[#273647]/50 pt-4">
              <div className="w-9 h-9 rounded-full border border-brand-border overflow-hidden bg-brand-surface-low shrink-0">
                <img 
                  alt="Author Елена Ростова" 
                  className="w-full h-full object-cover" 
                  src={articles[0].authorAvatar} 
                />
              </div>
              <div className="text-left select-none">
                <div className="text-xs font-bold text-white">{articles[0].authorName}</div>
                <div className="text-[10px] text-[#c7c4d8]/70 font-mono">{articles[0].authorRole}</div>
              </div>
              
              <span className="ml-auto text-xs font-bold text-brand-primary flex items-center gap-1 group-hover:translate-x-1 transition-all">
                <span>AI 원터치 요약</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </article>

        {/* 2. M-SIZE Bento: Startup Compliance Guide (Spans 4 cols) */}
        <article 
          onClick={() => handleSummarize(articles[1])}
          className="lg:col-span-4 bg-[#1c2b3c] border border-brand-border/40 hover:border-[#4edea3]/50 rounded-2xl p-6 flex flex-col group cursor-pointer h-[480px] shadow-xl relative overflow-hidden"
        >
          {/* Subtle logo vector watermark */}
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity select-none pointer-events-none">
            <BookOpen size={96} className="text-brand-tertiary" />
          </div>

          <div className="mb-4">
            <span className="text-brand-tertiary font-display text-xs font-bold uppercase tracking-wider block mb-2 select-none">
              스타트업 가이드
            </span>
            <h3 className="font-display text-xl font-bold text-white group-hover:text-brand-tertiary transition-colors leading-snug mb-3">
              스타트업을 위한 규제 준수 및 보안 가이드
            </h3>
            <p className="text-xs text-[#c7c4d8] leading-relaxed line-clamp-4">
              정밀 투자 유치 성공 및 초기 연방 자금 지원 승인을 확보하기 위한 엔터프라이즈급 API 보안 패턴, PII 비식별화 암호화 가이드 및 규제 컴플라이언스 세부 가이드라인.
            </p>
          </div>

          <div className="mt-auto border-t border-[#273647]/50 pt-4 flex justify-between items-center">
            <div className="text-[10px] font-mono text-brand-tertiary select-none">
              Policy & Compliance
            </div>
            <span className="text-xs font-bold text-brand-tertiary flex items-center gap-1 group-hover:translate-x-1.5 transition-transform duration-200">
              <span>요약 분석</span>
              <ArrowRight size={14} />
            </span>
          </div>
        </article>

        {/* 3. M-SIZE Bento: Case Study Spotlight (Spans 4 cols) */}
        <article 
          onClick={() => handleSummarize(articles[2])}
          className="lg:col-span-4 glass-panel rounded-2xl p-6 flex flex-col group cursor-pointer border-t-4 border-t-brand-primary hover:border-brand-primary transition-all duration-300 h-[380px] shadow-xl justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="bg-brand-primary/10 text-[#c3c0ff] border border-brand-primary/20 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider font-display uppercase select-none">
              케이스 스터디
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary pulse-indicator" />
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-white group-hover:text-brand-primary transition-colors leading-snug mb-2">
              0에서 1,000만 API 호출까지 데이터 인프라 스케일링
            </h3>
            <p className="text-xs text-[#c7c4d8]/90 leading-relaxed line-clamp-3">
              Nexus Lab 엘리트 오프라인 멤버 Sarah Chen 엔지니어가 설계하여 인큐베이팅에 성공한 다차원 고성능 래핑 인터뷰.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[#273647]/40">
            <div className="w-8 h-8 rounded-full border border-[#273647]/50 overflow-hidden bg-brand-surface-low">
              <img 
                alt="Sarah Chen Specialist" 
                className="w-full h-full object-cover" 
                src={articles[2].authorAvatar} 
              />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Sarah Chen</div>
              <div className="text-[10px] text-[#c7c4d8]/70 font-mono">인프라 아키텍처 아우트라인</div>
            </div>
          </div>
        </article>

        {/* 4. L-SIZE Bento: Industry Trends List / Pulse Reports (Spans 8 cols) */}
        <div className="lg:col-span-8 bg-[#122131]/80 border border-brand-border/40 rounded-2xl p-6 flex flex-col gap-4 shadow-xl h-[380px] justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#273647]/40 mb-1">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-[#4f46e5]" />
              <span>펄스 리포트 (B2B 트렌드 해설)</span>
            </h3>
            <span className="text-[10px] font-semibold text-[#c7c4d8]/50 uppercase font-mono">
              Live Market Tracking
            </span>
          </div>

          <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
            {trendReports.map((report) => (
              <a 
                key={report.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert(`[${report.title}] 아카데믹 논문 저널 전문은 미션 시작을 통해 멘토링 자료실에서 인쇄할 수 있습니다.`);
                }}
                className="group flex flex-col sm:flex-row gap-3 p-3 rounded-xl hover:bg-brand-surface-high/60 transition-colors border border-transparent hover:border-brand-border/30"
              >
                <div className="sm:w-1/4 pt-0.5 text-xs text-[#c7c4d8]/60 font-mono flex items-center gap-2 select-none">
                  <span className={`w-1.5 h-1.5 rounded-full ${report.accent} block shrink-0`} />
                  <span>{report.date}</span>
                </div>
                <div className="sm:w-3/4 text-left">
                  <h4 className="font-display text-sm font-bold text-white group-hover:text-[#c3c0ff] transition-all">
                    {report.title}
                  </h4>
                  <p className="text-[11px] text-[#c7c4d8]/80 leading-relaxed mt-1">
                    {report.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* AI Summarizer result display dashboard card (Connected dynamically!) */}
      {selectedArticle && (
        <section className="glass-panel rounded-2xl p-6 border border-[#4f46e5]/40 mt-4 shadow-2xl animate-scaleUp">
          <div className="flex justify-between items-center pb-3 border-b border-[#5f56e5]/30 mb-4 select-none">
            <h4 className="font-display text-base font-bold text-[#c3c0ff] flex items-center gap-2">
              <Bot size={18} className="text-brand-tertiary" />
              <span>AI 아티클 요약: {selectedArticle.title}</span>
            </h4>
            <button 
              onClick={() => setSelectedArticle(null)}
              className="text-xs text-[#c7c4d8]/60 hover:text-white cursor-pointer"
            >
              인터페이스 닫기
            </button>
          </div>

          {isLoadingSummary ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3 animate-pulse">
              <Sparkles className="text-brand-primary animate-spin" size={28} />
              <p className="text-xs text-[#c7c4d8]">서버 사이드 Gemini API에서 불렛포인트 요약을 작성 중입니다...</p>
            </div>
          ) : (
            <div className="text-left text-xs text-[#c7c4d8] leading-relaxed whitespace-pre-line bg-[#090f17] border border-brand-border rounded-xl p-4">
              {summaryResult}
              
              <div className="mt-4 pt-3 border-t border-[#273647]/50 flex items-center justify-between text-[10px] text-brand-primary font-mono select-none">
                <span>REVISION VERIFIED BY NEXUS AI TEAM</span>
                <span className="text-brand-tertiary font-bold">+75 XP 연동 완료</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Load More Button */}
      <div className="flex justify-center mt-6">
        <button 
          onClick={() => {
            getBetterInsights();
          }}
          className="bg-transparent border border-brand-border hover:border-[#c3c0ff] text-white px-8 py-3.5 rounded-xl font-display text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(79,70,229,0.25)] flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <BookOpenCheck size={16} className="text-[#c3c0ff]" />
          <span>인사이트 아카이브 로딩더보기</span>
        </button>
      </div>
    </div>
  );

  function getBetterInsights() {
    addXpPoints(30);
    alert("인사이트 피어: 신세틱 분산 트렌드 저널 4건이 연동되었습니다! (+30 XP 획득)");
  }
}
