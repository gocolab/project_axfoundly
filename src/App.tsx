import React from "react";
import GNB from "./components/GNB";
import AuthModal from "./components/AuthModal";
import MainPage from "./components/MainPage";
import CoursePage from "./components/CoursePage";
import IRPage from "./components/IRPage";
import CommunityPage from "./components/CommunityPage";
import StudentDashboard from "./components/StudentDashboard";
import InstructorDashboard from "./components/InstructorDashboard";
import InvestorDashboard from "./components/InvestorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import type {
  UserRole,
  Course,
  IRProject,
  BoardPost,
  Notification,
  TeamBuildingRequest,
  PaymentRecord,
  SettlementRecord,
  InvestmentProposal,
  AIRecommendation,
  DashboardStats,
  AdminMember,
  AdminBoard,
  CRMMessage,
} from "./types";

// ──────────────────────── Enriched Mock Data ────────────────────────

const MOCK_COURSES: Course[] = [
  {
    id: "c1",
    title: "AI 프로덕트 매니저 부트캠프",
    description: "GPT·Claude·Gemini 등 LLM 활용 제품 기획부터 런칭까지. 실무 프로젝트 중심 6주 12회차 집중 과정.",
    category: "AI 모델링",
    instructor: "김소현",
    instructorTitle: "전) 글로벌 테크 유니콘 AI PM 리드",
    instructorAvatar: "",
    price: 890000,
    discountedPrice: 590000,
    thumbnail: "",
    rating: 4.9,
    reviewCount: 127,
    studentCount: 342,
    status: "모집중",
    schedule: {
      startDate: "2025-09-02",
      endDate: "2025-10-14",
      daysOfWeek: ["화", "목"],
      timeSlot: "19:30 ~ 21:30",
      totalSessions: 12,
      scheduleType: "stepping_stone",
    },
    instructorProfile: {
      id: "inst-1",
      name: "김소현",
      title: "전) 글로벌 유니콘 AI PM 디렉터 & 창업 멘토",
      bio: "10년 이상의 프로덕트 매니지먼트 및 생성형 AI 제품 런칭 경험을 바탕으로, 비개발자도 시장에서 검증 가능한 AI 서비스를 기획하고 런칭할 수 있도록 돕습니다.",
      avatar: "",
      rating: 4.9,
      reviewCount: 127,
      totalStudents: 3420,
      infographic: {
        experienceYears: 11,
        totalStudents: 3420,
        satisfactionRate: 99,
        topKeywords: ["AI 프로덕트", "프롬프트 체이닝", "린스타트업", "IR 피칭 덱", "RAG 아키텍처"],
        careerHighlights: [
          "전) 실리콘밸리 테크 유니콘 AI PM 총괄",
          "누적 12개 AI SaaS 프로덕트 글로벌 런칭",
          "스타트업 인큐베이팅 및 시리즈A 유치 멘토링 50+팀",
        ],
        certifiedBadge: "공식 최고 인증 마스터 강사",
      },
      careerHistory: [
        "2022~현재: AI 비즈니스 랩 대표 디렉터",
        "2018~2022: 글로벌 유니콘 플랫폼 수석 PM",
        "2014~2018: 빅데이터 솔루션 기획 팀장",
      ],
      courses: [
        { id: "c1", title: "AI 프로덕트 매니저 부트캠프", category: "AI 모델링", period: "2025.09~", studentCount: 342, rating: 4.9, status: "모집중" },
        { id: "c-past1", title: "생성형 AI 비즈니스 기획 마스터클래스", category: "비즈니스 기획", period: "2024.10~2025.01", studentCount: 420, rating: 4.9, status: "종료" },
        { id: "c-past2", title: "LLM 에이전트 구축 실무 워크숍", category: "개발", period: "2025.03~2025.05", studentCount: 290, rating: 4.8, status: "종료" },
      ],
      reviews: [
        { id: "r1", author: "박지훈", avatar: "", rating: 5, content: "실무에서 바로 쓸 수 있는 내용이 가득합니다. 강사님의 현업 경험 공유가 특히 좋았어요.", date: "2025-07-28" },
        { id: "r2", author: "이수진", avatar: "", rating: 5, content: "RAG 파이프라인 실습이 정말 도움됐습니다. 회사 프로젝트에 바로 적용했어요!", date: "2025-07-15" },
        { id: "r3", author: "최민호", avatar: "", rating: 4, content: "전반적으로 훌륭한 강의입니다. 징검다리 일정 덕분에 복습할 시간이 충분했어요.", date: "2025-07-01" },
      ],
    },
    curriculum: [
      { week: 1, sessionNumber: 1, title: "AI 프로덕트 이해 & 가설 수립", description: "LLM 생태계와 비즈니스 기획 프레임워크", duration: "2시간", date: "2025-09-02", dayOfWeek: "화", time: "19:30 ~ 21:30" },
      { week: 1, sessionNumber: 2, title: "프롬프트 엔지니어링 실전", description: "효과적인 프롬프트 설계와 체인 구축", duration: "2시간", date: "2025-09-04", dayOfWeek: "목", time: "19:30 ~ 21:30" },
      { week: 2, sessionNumber: 3, title: "RAG 파이프라인 아키텍처", description: "검색 증강 생성 시스템 설계 실습", duration: "2시간", date: "2025-09-09", dayOfWeek: "화", time: "19:30 ~ 21:30" },
      { week: 2, sessionNumber: 4, title: "파인튜닝 & 커스텀 모델", description: "데이터셋 구축과 평가 지표 설정", duration: "2시간", date: "2025-09-11", dayOfWeek: "목", time: "19:30 ~ 21:30" },
      { week: 3, sessionNumber: 5, title: "멀티모달 AI 솔루션", description: "이미지·음성·텍스트 통합 프로덕트", duration: "2시간", date: "2025-09-16", dayOfWeek: "화", time: "19:30 ~ 21:30" },
      { week: 3, sessionNumber: 6, title: "자율 AI 에이전트 구축", description: "도구 호출과 자율 의사결정 체계", duration: "2시간", date: "2025-09-18", dayOfWeek: "목", time: "19:30 ~ 21:30" },
    ],
    reviews: [
      { id: "r1", author: "박지훈", avatar: "", rating: 5, content: "실무에서 바로 쓸 수 있는 내용이 가득합니다. 강사님의 현업 경험 공유가 특히 좋았어요.", date: "2025-07-28" },
      { id: "r2", author: "이수진", avatar: "", rating: 5, content: "RAG 파이프라인 실습이 정말 도움됐습니다. 회사 프로젝트에 바로 적용했어요!", date: "2025-07-15" },
      { id: "r3", author: "최민호", avatar: "", rating: 4, content: "전반적으로 훌륭한 강의입니다. 다만 에이전트 파트가 좀 더 깊었으면 합니다.", date: "2025-07-01" },
    ],
  },
  {
    id: "c2",
    title: "스타트업 비즈니스 모델 설계",
    description: "린 캔버스부터 유닛 이코노믹스까지. 투자자를 설득하는 비즈니스 모델 완성 4주 8회차 과정.",
    category: "비즈니스 기획",
    instructor: "정우석",
    instructorTitle: "전) 시드 VC 심사역 & 엑셀러레이터 대표",
    instructorAvatar: "",
    price: 490000,
    thumbnail: "",
    rating: 4.7,
    reviewCount: 89,
    studentCount: 215,
    status: "진행중",
    schedule: {
      startDate: "2025-08-18",
      endDate: "2025-09-12",
      daysOfWeek: ["월", "수"],
      timeSlot: "20:00 ~ 22:00",
      totalSessions: 8,
      scheduleType: "stepping_stone",
    },
    curriculum: [
      { week: 1, sessionNumber: 1, title: "린 캔버스 작성 실습", description: "비즈니스 모델 가설 수립", duration: "2시간", date: "2025-08-18", dayOfWeek: "월", time: "20:00 ~ 22:00" },
      { week: 1, sessionNumber: 2, title: "시장 분석 & TAM/SAM/SOM", description: "시장 규모 추정 및 타깃 정의", duration: "2시간", date: "2025-08-20", dayOfWeek: "수", time: "20:00 ~ 22:00" },
      { week: 2, sessionNumber: 3, title: "포지셔닝 맵 & 차별화", description: "경쟁사 대비 핵심 가치 제안", duration: "2시간", date: "2025-08-25", dayOfWeek: "월", time: "20:00 ~ 22:00" },
      { week: 2, sessionNumber: 4, title: "유닛 이코노믹스 & LTV/CAC", description: "지속 가능한 수익 구조 설계", duration: "2시간", date: "2025-08-27", dayOfWeek: "수", time: "20:00 ~ 22:00" },
    ],
    reviews: [
      { id: "r4", author: "김하은", avatar: "", rating: 5, content: "IR 피칭 준비할 때 정말 큰 도움이 됐습니다.", date: "2025-08-01" },
    ],
  },
  {
    id: "c3",
    title: "그로스 해킹 마스터클래스",
    description: "데이터 기반 성장 전략. 퍼널 분석, A/B 테스트, 바이럴 루프 설계 실전 6주.",
    category: "마케팅",
    instructor: "한지민",
    instructorAvatar: "",
    price: 390000,
    discountedPrice: 290000,
    thumbnail: "",
    rating: 4.8,
    reviewCount: 64,
    studentCount: 178,
    status: "모집중",
    schedule: {
      startDate: "2025-09-05",
      endDate: "2025-10-17",
      daysOfWeek: ["금"],
      timeSlot: "19:00 ~ 22:00",
      totalSessions: 6,
      scheduleType: "regular",
    },
    curriculum: [
      { week: 1, sessionNumber: 1, title: "그로스 프레임워크 AARRR", description: "핵심 성장 지표 정의", duration: "3시간", date: "2025-09-05", dayOfWeek: "금", time: "19:00 ~ 22:00" },
      { week: 2, sessionNumber: 2, title: "GA4 & Mixpanel 데이터 분석", description: "유저 행동 퍼널 추적", duration: "3시간", date: "2025-09-12", dayOfWeek: "금", time: "19:00 ~ 22:00" },
    ],
    reviews: [
      { id: "r5", author: "오세진", avatar: "", rating: 5, content: "실제 케이스 스터디가 풍부해서 좋았습니다.", date: "2025-07-20" },
    ],
  },
  {
    id: "c4",
    title: "풀스택 MVP 개발 워크숍",
    description: "React + Node.js + PostgreSQL로 4주 만에 MVP 완성. 배포까지 원스톱.",
    category: "개발",
    instructor: "이준혁",
    instructorAvatar: "",
    price: 690000,
    discountedPrice: 490000,
    thumbnail: "",
    rating: 4.6,
    reviewCount: 52,
    studentCount: 134,
    status: "진행중",
    schedule: {
      startDate: "2025-08-11",
      endDate: "2025-09-05",
      daysOfWeek: ["월", "금"],
      timeSlot: "20:00 ~ 22:00",
      totalSessions: 8,
      scheduleType: "stepping_stone",
    },
    curriculum: [
      { week: 1, sessionNumber: 1, title: "MVP 아키텍처 설계", description: "모노레포와 API 명세", duration: "2시간", date: "2025-08-11", dayOfWeek: "월", time: "20:00 ~ 22:00" },
    ],
    reviews: [],
  },
  {
    id: "c5",
    title: "AI 시대의 UX/UI 디자인",
    description: "AI 도구를 활용한 디자인 워크플로우. Figma + AI 프로토타이핑 4주 과정.",
    category: "디자인",
    instructor: "박서영",
    instructorAvatar: "",
    price: 450000,
    thumbnail: "",
    rating: 4.5,
    reviewCount: 38,
    studentCount: 96,
    status: "종료",
    schedule: {
      startDate: "2025-06-01",
      endDate: "2025-06-30",
      daysOfWeek: ["토"],
      timeSlot: "14:00 ~ 17:00",
      totalSessions: 4,
      scheduleType: "regular",
    },
    curriculum: [
      { week: 1, sessionNumber: 1, title: "AI 디자인 트렌드", description: "생성형 AI와 디자인의 융합", duration: "3시간" },
    ],
    reviews: [],
  },
  {
    id: "c6",
    title: "SaaS 창업 A to Z",
    description: "SaaS 비즈니스 모델 설계, 프라이싱, PLG 전략까지 총정리 6주 과정.",
    category: "비즈니스 기획",
    instructor: "강민수",
    instructorAvatar: "",
    price: 780000,
    discountedPrice: 580000,
    thumbnail: "",
    rating: 4.8,
    reviewCount: 71,
    studentCount: 203,
    status: "모집중",
    schedule: {
      startDate: "2025-09-10",
      endDate: "2025-10-22",
      daysOfWeek: ["수"],
      timeSlot: "19:30 ~ 21:30",
      totalSessions: 6,
      scheduleType: "regular",
    },
    curriculum: [
      { week: 1, sessionNumber: 1, title: "SaaS 시장 이해", description: "글로벌 SaaS 트렌드와 기회", duration: "2시간" },
    ],
    reviews: [],
  },
];

const MOCK_IR_PROJECTS: IRProject[] = [
  {
    id: "ir1",
    teamName: "뉴로플로우",
    anonymousTeamName: "🤖 뉴로플로우 (AI B2B 랩스)",
    title: "AI 기반 자동 보고서 생성 플랫폼",
    oneLiner: "기업 데이터를 분석하여 자동으로 경영 보고서를 생성하는 B2B SaaS",
    description: "기업의 다양한 데이터 소스를 연결하여 AI가 자동으로 인사이트를 도출하고 경영진용 보고서를 생성합니다.",
    field: "AI/ML",
    thumbnail: "",
    demoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isAnonymous: false,
    businessModel: "B2B SaaS 구독 모델. 기업당 월 50만원~300만원 데이터 연결 수에 따른 티어제.",
    problem: "기업 경영진은 데이터 기반 의사결정이 필요하지만, 보고서 작성에 평균 주당 12시간을 소비합니다. 데이터 분석가 인력도 부족합니다.",
    solution: "LLM + BI 도구를 결합하여 데이터 소스 연결만으로 자동 보고서 생성. 자연어 질문으로 실시간 인사이트 제공.",
    isHiring: true,
    hiringRoles: ["백엔드 개발자", "데이터 엔지니어", "영업/BD"],
    hiringDetails: [
      {
        id: "hr-1",
        role: "AI/LLM 파이프라인 개발자",
        type: "풀타임",
        compensation: "월 400~550만원",
        equity: "1.5% ~ 3.0%",
        skills: ["Python", "LangChain", "FastAPI", "VectorDB"],
        applyMethod: "internal",
        description: "RAG 시스템 아키텍처 및 자율 에이전트 엔지니어링 리드",
      },
      {
        id: "hr-2",
        role: "B2B SaaS 그로스 매니저",
        type: "파트타임",
        compensation: "월 200~300만원",
        equity: "협의",
        skills: ["B2B 세일즈", "GA4", "콘텐츠 마케팅"],
        applyMethod: "link",
        externalLink: "https://wanted.co.kr",
        description: "초기 파일럿 고객사 발굴 및 온보딩 지원",
      },
    ],
    members: [
      { name: "김태호", role: "CEO", avatar: "", anonymousName: "⚡ 캡틴 AI", anonymousRole: "총괄 기획 / CEO" },
      { name: "이소라", role: "CTO", avatar: "", anonymousName: "🧠 알고리즘 장인", anonymousRole: "기술 총괄 / CTO" },
      { name: "박현준", role: "AI Lead", avatar: "", anonymousName: "🔮 프롬프트 마스터", anonymousRole: "AI 파이프라인 리드" },
    ],
    investmentStage: "Seed",
    bookmarked: false,
  },
  {
    id: "ir2",
    teamName: "헬스브릿지",
    anonymousTeamName: "🧬 헬스브릿지 스텔스 팀",
    title: "AI 건강 관리 코치",
    oneLiner: "웨어러블 데이터 기반 개인 맞춤형 AI 건강 코칭 앱",
    description: "스마트워치 데이터를 분석하여 개인별 맞춤 건강 관리 코칭을 제공합니다.",
    field: "헬스케어",
    thumbnail: "",
    demoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isAnonymous: true,
    businessModel: "B2C 프리미엄 구독 모델. 무료 기본 분석 + 월 9,900원 AI 코칭.",
    problem: "만성질환 예방을 위한 생활 습관 개선이 필요하지만, 개인화된 건강 코칭은 비용이 높아 접근성이 낮습니다.",
    solution: "웨어러블 기기의 실시간 데이터를 AI가 분석하여 저비용으로 개인 맞춤형 건강 관리 솔루션을 제공합니다.",
    isHiring: false,
    members: [
      { name: "정예림", role: "CEO", avatar: "", anonymousName: "🩺 닥터 AI", anonymousRole: "메디컬 기획 / CEO" },
      { name: "한승우", role: "CTO", avatar: "", anonymousName: "💻 모바일 마법사", anonymousRole: "앱 개발 / CTO" },
    ],
    investmentStage: "Pre-Seed",
    bookmarked: false,
  },
  {
    id: "ir3",
    teamName: "에듀넥스트",
    anonymousTeamName: "📚 에듀넥스트 AI 연구소",
    title: "AI 튜터링 플랫폼",
    oneLiner: "학생 수준에 맞는 AI 개인 과외 시스템",
    description: "학생의 학습 패턴을 분석하여 개인 맞춤형 커리큘럼과 실시간 AI 튜터링을 제공합니다.",
    field: "에듀테크",
    thumbnail: "",
    demoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isAnonymous: false,
    businessModel: "B2C 구독 + B2B 학원/학교 라이센스. 월 3만원~15만원.",
    problem: "1:1 과외는 효과적이지만 비용이 높고, 학원은 개인화가 어렵습니다.",
    solution: "AI가 학생별 취약점을 파악하고 맞춤 문제를 출제하며, 실시간으로 풀이 과정을 코칭합니다.",
    isHiring: true,
    hiringRoles: ["프론트엔드 개발자", "AI 연구원"],
    hiringDetails: [
      {
        id: "hr-3",
        role: "React 프론트엔드 개발자",
        type: "풀타임",
        compensation: "월 350~500만원",
        equity: "1.0%",
        skills: ["React", "TypeScript", "TailwindCSS"],
        applyMethod: "internal",
        description: "인터랙티브 튜터링 화상 및 채팅 UI 구현",
      },
    ],
    members: [
      { name: "오지은", role: "CEO", avatar: "" },
      { name: "김도현", role: "CTO", avatar: "" },
      { name: "이하린", role: "PM", avatar: "" },
    ],
    investmentStage: "Seed",
    bookmarked: false,
  },
  {
    id: "ir4",
    teamName: "페이스마트",
    title: "AI 경비 관리 솔루션",
    oneLiner: "영수증 스캔부터 세금 신고까지 자동화하는 핀테크 솔루션",
    description: "소상공인과 스타트업을 위한 AI 기반 경비 관리 및 세무 자동화 플랫폼입니다.",
    field: "핀테크",
    thumbnail: "",
    businessModel: "B2B SaaS 구독. 월 2만원~10만원 기업 규모별 과금.",
    problem: "스타트업과 소상공인은 경비 처리와 세무 신고에 많은 시간을 쓰지만 전담 인력을 두기 어렵습니다.",
    solution: "영수증 OCR + AI 자동 분류 + 세무사 연동으로 경비 처리를 90% 자동화합니다.",
    isHiring: false,
    members: [
      { name: "서준혁", role: "CEO", avatar: "" },
      { name: "양미래", role: "CTO", avatar: "" },
    ],
    investmentStage: "Series A",
    bookmarked: false,
  },
  {
    id: "ir5",
    teamName: "커머스AI",
    title: "AI 상품 추천 엔진",
    oneLiner: "전환율을 3배 높이는 AI 추천 엔진 SaaS",
    description: "이커머스 플랫폼에 플러그인 형태로 연동되는 AI 상품 추천 엔진입니다.",
    field: "커머스",
    thumbnail: "",
    businessModel: "성과 기반 과금. 추천을 통한 매출의 3~5% 수수료.",
    problem: "중소 이커머스 업체는 추천 시스템 자체 개발이 어렵고, 기존 솔루션은 비싸고 연동이 복잡합니다.",
    solution: "노코드 연동으로 5분 내 설치 가능한 AI 추천 엔진. 구매 데이터 학습 자동화.",
    isHiring: true,
    hiringRoles: ["ML 엔지니어", "세일즈 매니저"],
    members: [
      { name: "강서윤", role: "CEO", avatar: "" },
      { name: "문재혁", role: "CTO", avatar: "" },
    ],
    investmentStage: "Seed",
    bookmarked: false,
  },
];

const MOCK_POSTS: BoardPost[] = [
  { id: "p1", boardType: "공지사항", title: "[필독] 2025년 하반기 징검다리 강의 일정 안내", content: "하반기 개설 강의의 징검다리 요일 일정 및 수강 신청 안내입니다.", author: "운영팀", authorAvatar: "", createdAt: "2025-08-10", viewCount: 1240, commentCount: 5, isPinned: true },
  { id: "p2", boardType: "공지사항", title: "플랫폼 업데이트: AI 추천 매칭 & CRM 메시지 시스템 도입", content: "강사-수강생 간 1:1 메시지 및 AI 추천 매칭 기능이 추가되었습니다.", author: "운영팀", authorAvatar: "", createdAt: "2025-08-08", viewCount: 890, commentCount: 12, isPinned: true },
  { id: "p3", boardType: "팀빌딩", title: "[CTO 구합니다] AI 헬스케어 스타트업 공동창업자 모집", content: "스텔스 모드로 진행 중인 헬스케어 팀에서 CTO를 모십니다.", author: "정예림", authorAvatar: "", createdAt: "2025-08-09", viewCount: 456, commentCount: 23 },
  { id: "p4", boardType: "팀빌딩", title: "프론트엔드 개발자 구합니다 - 에듀테크 프로젝트", content: "에듀넥스트 팀과 함께할 React 개발자 지원 환영합니다.", author: "김도현", authorAvatar: "", createdAt: "2025-08-07", viewCount: 312, commentCount: 8 },
  { id: "p5", boardType: "QnA", title: "RAG 파이프라인에서 벡터 DB 선택 질문", content: "Pinecone vs Qdrant vs pgvector 실무 성능 비교가 궁금합니다.", author: "이태준", authorAvatar: "", createdAt: "2025-08-10", viewCount: 189, commentCount: 15 },
  { id: "p6", boardType: "QnA", title: "스타트업 법인 설립 절차 궁금합니다", content: "온라인 법인설립 시스템 팁 공유 부탁드립니다.", author: "한소희", authorAvatar: "", createdAt: "2025-08-09", viewCount: 267, commentCount: 9 },
  { id: "p7", boardType: "팀빌딩", title: "[디자이너] AI 커머스 프로젝트 UI/UX 디자이너 팀원 모집", content: "피그마 프로토타이핑 가능한 디자이너 모십니다.", author: "강서윤", authorAvatar: "", createdAt: "2025-08-06", viewCount: 198, commentCount: 4 },
  { id: "p8", boardType: "QnA", title: "Series A 라운드 준비 시 핵심 지표는?", content: "ARR과 리텐션 지표 목표치 질문입니다.", author: "서준혁", authorAvatar: "", createdAt: "2025-08-05", viewCount: 345, commentCount: 18 },
  { id: "p9", boardType: "공지사항", title: "커뮤니티 이용 규칙 안내", content: "클린한 스타트업 생태계를 위한 규칙 안내입니다.", author: "운영팀", authorAvatar: "", createdAt: "2025-07-20", viewCount: 2100, commentCount: 0, isPinned: false },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "instructor_msg", title: "[강사 메시지] 3주차 실습 과제 피드백", message: "제출해주신 RAG 아키텍처에 코멘트를 남겨드렸습니다. 확인 후 보완해보세요!", time: "10분 전", isRead: false, sender: "김소현 강사", courseTitle: "AI 프로덕트 매니저 부트캠프" },
  { id: "n2", type: "team", title: "팀 빌딩 제안", message: "김태호님이 '뉴로플로우' 프로젝트에 합류를 제안했습니다.", time: "1시간 전", isRead: false },
  { id: "n3", type: "investor", title: "투자자 관심 표시", message: "한 투자자가 귀하의 프로젝트에 관심을 표시했습니다.", time: "3시간 전", isRead: true },
  { id: "n4", type: "course", title: "새 강의 일정 알림", message: "내일 19:30 '멀티모달 AI 솔루션' 5회차 라이브가 진행됩니다.", time: "1일 전", isRead: true },
];

const MOCK_TEAM_REQUESTS: TeamBuildingRequest[] = [
  { id: "tr1", type: "received", projectName: "뉴로플로우", fromUser: "김태호", toUser: "나", role: "프론트엔드 개발자", message: "뉴로플로우에서 프론트엔드 개발을 함께할 분을 찾고 있습니다.", status: "대기중", date: "2025-08-09" },
  { id: "tr2", type: "sent", projectName: "에듀넥스트", fromUser: "나", toUser: "최우진", role: "AI 연구원", message: "에듀넥스트 AI 파트에 지원합니다.", status: "수락", date: "2025-08-05" },
];

const MOCK_PAYMENTS: PaymentRecord[] = [
  { id: "pay1", courseTitle: "AI 프로덕트 매니저 부트캠프", amount: 590000, date: "2025-07-15", method: "카드", status: "완료" },
  { id: "pay2", courseTitle: "그로스 해킹 마스터클래스", amount: 290000, date: "2025-06-20", method: "계좌이체", status: "완료" },
];

const MOCK_SETTLEMENTS: SettlementRecord[] = [
  { id: "set1", period: "2025년 7월", totalRevenue: 4500000, pgFee: 135000, platformFee: 450000, netAmount: 3915000, status: "정산완료" },
  { id: "set2", period: "2025년 8월 (진행중)", totalRevenue: 2800000, pgFee: 84000, platformFee: 280000, netAmount: 2436000, status: "정산대기" },
];

const MOCK_PROPOSALS: InvestmentProposal[] = [
  { id: "prop1", projectId: "ir1", projectName: "뉴로플로우", message: "AI 보고서 자동화 시장에 큰 관심이 있습니다. 투자 미팅을 요청드립니다.", sentDate: "2025-08-08", status: "대기중" },
  { id: "prop2", projectId: "ir3", projectName: "에듀넥스트", message: "에듀테크 분야 투자 포트폴리오 확대 중입니다. 미팅 일정 조율 부탁드립니다.", sentDate: "2025-08-01", status: "수락" },
];

const MOCK_AI_RECOMMENDATIONS: AIRecommendation[] = [
  { projectId: "ir1", projectName: "뉴로플로우", matchScore: 92, matchReasons: ["AI/ML 선호", "SaaS 모델", "B2B", "Seed 단계"], field: "AI/ML" },
  { projectId: "ir4", projectName: "페이스마트", matchScore: 85, matchReasons: ["핀테크 관심", "자동화 기술", "Series A"], field: "핀테크" },
  { projectId: "ir5", projectName: "커머스AI", matchScore: 78, matchReasons: ["AI/ML 기반", "성과 기반 과금", "Seed 단계"], field: "커머스" },
];

const MOCK_ADMIN_STATS: DashboardStats = {
  dailySignups: 47, monthlySignups: 1280, totalRevenue: 1200000000, monthlyRevenue: 85000000,
  activeCourses: 24, teamMatchCount: 34, investmentMatchCount: 12,
};

const MOCK_ADMIN_MEMBERS: AdminMember[] = [
  { id: "m1", name: "김소현", email: "sh.kim@mail.com", role: "instructor", joinDate: "2024-03-15", lastLogin: "2025-08-10", status: "활성", courseCount: 3 },
  { id: "m2", name: "박지훈", email: "jh.park@mail.com", role: "student", joinDate: "2025-01-20", lastLogin: "2025-08-10", status: "활성", courseCount: 2 },
  { id: "m3", name: "이수진", email: "sj.lee@mail.com", role: "student", joinDate: "2025-04-10", lastLogin: "2025-08-09", status: "활성", courseCount: 1 },
  { id: "m4", name: "정우석", email: "ws.jung@mail.com", role: "instructor", joinDate: "2024-06-01", lastLogin: "2025-08-10", status: "활성", courseCount: 2 },
  { id: "m5", name: "한승우", email: "sw.han@mail.com", role: "investor", joinDate: "2024-11-10", lastLogin: "2025-08-07", status: "활성", courseCount: 0 },
  { id: "m6", name: "오세진", email: "sj.oh@mail.com", role: "student", joinDate: "2025-05-20", lastLogin: "2025-07-15", status: "정지", courseCount: 1 },
  { id: "m7", name: "강민수", email: "ms.kang@mail.com", role: "instructor", joinDate: "2024-09-01", lastLogin: "2025-08-10", status: "활성", courseCount: 1 },
];

const MOCK_ADMIN_BOARDS: AdminBoard[] = [
  { id: "b1", name: "공지사항", readPermission: "전체", writePermission: "관리자", template: "일반형", postCount: 45, createdAt: "2024-01-01" },
  { id: "b2", name: "팀 빌딩 (Co-founder)", readPermission: "회원", writePermission: "회원", template: "카드형", postCount: 128, createdAt: "2024-01-01" },
  { id: "b3", name: "Q&A 자유게시판", readPermission: "전체", writePermission: "회원", template: "일반형", postCount: 312, createdAt: "2024-01-01" },
];

// ──────────────────────── App Component ────────────────────────

export default function App() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userRole, setUserRole] = React.useState<UserRole>("student");
  const [userName, setUserName] = React.useState("게스트");
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  // Navigation
  const [currentPage, setCurrentPage] = React.useState("home");

  // Data state
  const [courses, setCourses] = React.useState<Course[]>(MOCK_COURSES);
  const [irProjects, setIrProjects] = React.useState<IRProject[]>(MOCK_IR_PROJECTS);
  const [posts, setPosts] = React.useState<BoardPost[]>(MOCK_POSTS);
  const [notifications, setNotifications] = React.useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [adminMembers, setAdminMembers] = React.useState<AdminMember[]>(MOCK_ADMIN_MEMBERS);
  const [pendingCourses] = React.useState<Course[]>([MOCK_COURSES[3], MOCK_COURSES[5]]);

  // Handlers
  const handleLogin = (role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
    const names: Record<UserRole, string> = {
      student: "김수강생",
      instructor: "김소현",
      investor: "한승우",
      admin: "관리자",
    };
    setUserName(names[role]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("student");
    setUserName("게스트");
    setCurrentPage("home");
  };

  const handleEnroll = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, isEnrolled: true, progress: 0 } : c))
    );
  };

  const handleToggleBookmark = (projectId: string) => {
    setIrProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, bookmarked: !p.bookmarked } : p))
    );
  };

  const handleAddPost = (post: Omit<BoardPost, "id" | "viewCount" | "commentCount" | "authorAvatar">) => {
    const newPost: BoardPost = {
      ...post,
      id: `p-${Date.now()}`,
      viewCount: 0,
      commentCount: 0,
      authorAvatar: "",
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleSaveCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const handleSendCRMMessage = (msg: Omit<CRMMessage, "id" | "sentAt">) => {
    // Deliver notification to student notification center as well
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      type: "instructor_msg",
      title: `[강사 메시지] ${msg.title}`,
      message: msg.content,
      time: "방금 전",
      isRead: false,
      sender: "김소현 강사",
      courseTitle: msg.courseTitle,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleAdminChangeRole = (memberId: string, newRole: UserRole) => {
    setAdminMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  const handleViewCourse = (courseId: string) => {
    setCurrentPage("courses");
  };

  const handleViewIR = (projectId: string) => {
    setCurrentPage("ir");
  };

  // Render dashboard based on role
  const renderDashboard = () => {
    switch (userRole) {
      case "student":
        return (
          <StudentDashboard
            enrolledCourses={courses}
            teamRequests={MOCK_TEAM_REQUESTS}
            payments={MOCK_PAYMENTS}
            notifications={notifications}
            onViewCourse={handleViewCourse}
          />
        );
      case "instructor":
        return (
          <InstructorDashboard
            myCourses={courses.slice(0, 3)}
            settlements={MOCK_SETTLEMENTS}
            onSaveCourse={handleSaveCourse}
            onSendCRMMessage={handleSendCRMMessage}
          />
        );
      case "investor":
        return (
          <InvestorDashboard
            bookmarkedProjects={irProjects.filter((p) => p.bookmarked)}
            recommendations={MOCK_AI_RECOMMENDATIONS}
            proposals={MOCK_PROPOSALS}
            onViewProject={handleViewIR}
            onRemoveBookmark={handleToggleBookmark}
          />
        );
      case "admin":
        return (
          <AdminDashboard
            stats={MOCK_ADMIN_STATS}
            members={adminMembers}
            boards={MOCK_ADMIN_BOARDS}
            pendingCourses={pendingCourses}
            onChangeRole={handleAdminChangeRole}
            onApproveCourse={(id) => alert(`강의 ${id} 승인됨`)}
            onRejectCourse={(id) => alert(`강의 ${id} 반려됨`)}
          />
        );
      default:
        return null;
    }
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <MainPage
            courses={courses}
            irProjects={irProjects}
            notices={posts}
            onNavigate={setCurrentPage}
            onViewCourse={handleViewCourse}
            onViewIR={handleViewIR}
            isLoggedIn={isLoggedIn}
            onLoginClick={() => setShowAuthModal(true)}
          />
        );
      case "courses":
        return (
          <CoursePage
            courses={courses}
            onEnroll={handleEnroll}
            isLoggedIn={isLoggedIn}
            onLoginClick={() => setShowAuthModal(true)}
          />
        );
      case "ir":
        return (
          <IRPage
            projects={irProjects}
            userRole={userRole}
            isLoggedIn={isLoggedIn}
            onLoginClick={() => setShowAuthModal(true)}
            onToggleBookmark={handleToggleBookmark}
          />
        );
      case "community":
        return (
          <CommunityPage
            posts={posts}
            onAddPost={handleAddPost}
            isLoggedIn={isLoggedIn}
            onLoginClick={() => setShowAuthModal(true)}
          />
        );
      case "dashboard":
        if (!isLoggedIn) {
          setShowAuthModal(true);
          setCurrentPage("home");
          return null;
        }
        return renderDashboard();
      case "admin":
        if (!isLoggedIn || userRole !== "admin") {
          setCurrentPage("home");
          return null;
        }
        return (
          <AdminDashboard
            stats={MOCK_ADMIN_STATS}
            members={adminMembers}
            boards={MOCK_ADMIN_BOARDS}
            pendingCourses={pendingCourses}
            onChangeRole={handleAdminChangeRole}
            onApproveCourse={(id) => alert(`강의 ${id} 승인됨`)}
            onRejectCourse={(id) => alert(`강의 ${id} 반려됨`)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-on-surface font-sans selection:bg-brand-primary-container selection:text-white">
      <GNB
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        userName={userName}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
      />

      <main className="pb-16">{renderPage()}</main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
