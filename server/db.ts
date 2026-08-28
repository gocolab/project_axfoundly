import "dotenv/config";
import { MongoClient, type Db, type Collection } from "mongodb";
import type {
  Course,
  CourseStudent,
  IRProject,
  BoardPost,
  Comment,
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
  JobApplication,
  UserRole,
  CodeGroup,
  CommonCode,
  CourseRequest,
  CourseProposal,
  IdeaRequest,
  IdeaProposal,
  NotificationPreference,
  NotificationTemplate,
  NotificationLog,
} from "../src/types";

export interface DatabaseSchema {
  courses: Course[];
  courseStudents: CourseStudent[];
  courseRequests: CourseRequest[];
  courseProposals: CourseProposal[];
  irProjects: IRProject[];
  ideaRequests: IdeaRequest[];
  ideaProposals: IdeaProposal[];
  posts: BoardPost[];
  comments: Comment[];
  notifications: Notification[];
  notificationPreferences: NotificationPreference[];
  notificationTemplates: NotificationTemplate[];
  notificationLogs: NotificationLog[];
  teamRequests: TeamBuildingRequest[];
  payments: PaymentRecord[];
  settlements: SettlementRecord[];
  proposals: InvestmentProposal[];
  recommendations: AIRecommendation[];
  stats: DashboardStats;
  members: AdminMember[];
  boards: AdminBoard[];
  crmMessages: CRMMessage[];
  applications: JobApplication[];
  codeGroups: CodeGroup[];
  commonCodes: CommonCode[];
  kakao_sessions: Array<{
    tid: string;
    orderId: string;
    userId: string;
    itemName: string;
    totalAmount: number;
  }>;
}

// ──────────────────────── MongoDB 연결 설정 ────────────────────────

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://mahaumaster:!Mahaumaster2515@localhost:27017/?authSource=admin";
const MONGODB_DBNAME = process.env.MONGODB_DBNAME || "launch_bizs_dev";

let client: MongoClient;
let mongodb: Db;

// ──────────────────────── Seed Data ────────────────────────

const SEED_COURSES: Course[] = [
  {
    id: "c1",
    title: "AI 프로덕트 매니저 부트캠프",
    description: "GPT·Claude·Gemini 등 LLM 활용 제품 기획부터 런칭까지. 실무 프로젝트 중심 6주 12회차 집중 과정.",
    category: "AI 모델링",
    tags: ["AI프로덕트", "프롬프트", "RAG", "멀티모달", "AI에이전트"],
    aiSummary: "LLM/RAG 파이프라인부터 자율 에이전트까지 실전 AI 상용 프로덕트 런칭 실습",
    deliveryType: "online",
    liveMeetingUrl: "https://zoom.us/j/ai-pm-bootcamp-live",
    location: "실시간 Zoom 라이브 화상 강의실",
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
    isEnrolled: false,
    progress: 0,
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
      { week: 1, sessionNumber: 1, title: "AI 프로덕트 이해 & 가설 수립", description: "LLM 생태계와 비즈니스 기획 프레임워크", duration: "2시간", date: "2025-09-02", dayOfWeek: "화", time: "19:30 ~ 21:30", deliveryType: "online" },
      { week: 1, sessionNumber: 2, title: "프롬프트 엔지니어링 실전", description: "효과적인 프롬프트 설계와 체인 구축", duration: "2시간", date: "2025-09-04", dayOfWeek: "목", time: "19:30 ~ 21:30", deliveryType: "online" },
      { week: 2, sessionNumber: 3, title: "RAG 파이프라인 아키텍처", description: "검색 증강 생성 시스템 설계 실습", duration: "2시간", date: "2025-09-09", dayOfWeek: "화", time: "19:30 ~ 21:30", deliveryType: "online" },
      { week: 2, sessionNumber: 4, title: "파인튜닝 & 커스텀 모델", description: "데이터셋 구축과 평가 지표 설정", duration: "2시간", date: "2025-09-11", dayOfWeek: "목", time: "19:30 ~ 21:30", deliveryType: "online" },
      { week: 3, sessionNumber: 5, title: "멀티모달 AI 솔루션", description: "이미지·음성·텍스트 통합 프로덕트", duration: "2시간", date: "2025-09-16", dayOfWeek: "화", time: "19:30 ~ 21:30", deliveryType: "online" },
      { week: 3, sessionNumber: 6, title: "자율 AI 에이전트 구축", description: "도구 호출과 자율 의사결정 체계", duration: "2시간", date: "2025-09-18", dayOfWeek: "목", time: "19:30 ~ 21:30", deliveryType: "online" },
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
    tags: ["린캔버스", "BM설계", "TAM-SAM-SOM", "유닛이코노믹스"],
    aiSummary: "린 캔버스부터 유닛 이코노믹스까지 투자자를 설득하는 비즈니스 모델 완성 실무",
    deliveryType: "offline",
    location: "서울시 강남구 테헤란로 152 강남파이낸스센터 18층 아카데미룸",
    instructor: "정우석",
    instructorTitle: "전) 시드 VC 심사역 & 엑셀러레이터 대표",
    instructorAvatar: "",
    price: 490000,
    thumbnail: "",
    rating: 4.7,
    reviewCount: 89,
    studentCount: 215,
    status: "진행중",
    isEnrolled: true,
    progress: 60,
    schedule: {
      startDate: "2025-08-18",
      endDate: "2025-09-12",
      daysOfWeek: ["월", "수"],
      timeSlot: "20:00 ~ 22:00",
      totalSessions: 8,
      scheduleType: "stepping_stone",
    },
    curriculum: [
      { week: 1, sessionNumber: 1, title: "린 캔버스 작성 실습", description: "비즈니스 모델 가설 수립", duration: "2시간", date: "2025-08-18", dayOfWeek: "월", time: "20:00 ~ 22:00", deliveryType: "offline" },
      { week: 1, sessionNumber: 2, title: "시장 분석 & TAM/SAM/SOM", description: "시장 규모 추정 및 타깃 정의", duration: "2시간", date: "2025-08-20", dayOfWeek: "수", time: "20:00 ~ 22:00", deliveryType: "offline" },
      { week: 2, sessionNumber: 3, title: "포지셔닝 맵 & 차별화", description: "경쟁사 대비 핵심 가치 제안", duration: "2시간", date: "2025-08-25", dayOfWeek: "월", time: "20:00 ~ 22:00", deliveryType: "offline" },
      { week: 2, sessionNumber: 4, title: "유닛 이코노믹스 & LTV/CAC", description: "지속 가능한 수익 구조 설계", duration: "2시간", date: "2025-08-27", dayOfWeek: "수", time: "20:00 ~ 22:00", deliveryType: "offline" },
    ],
    reviews: [
      { id: "r4", author: "김하은", avatar: "", rating: 5, content: "IR 피칭 준비할 때 정말 큰 도움이 됐습니다.", date: "2025-08-01" },
    ],
  },
  {
    id: "c3",
    title: "그로스 해킹 마스터클래스",
    description: "데이터 기반 성장 전략. 퍼널 분석, A/B 테스트, 바이럴 루프 설계 실전 6주.",
    category: "마케팅·그로스",
    tags: ["그로스해킹", "AARRR", "A/B테스트", "GA4"],
    aiSummary: "데이터 기반 AARRR 퍼널 분석 및 바이럴 루프 설계 실전 마스터클래스",
    deliveryType: "vod",
    liveMeetingUrl: "https://player.vimeo.com/video/sample",
    instructor: "한지민",
    instructorAvatar: "",
    price: 390000,
    discountedPrice: 290000,
    thumbnail: "",
    rating: 4.8,
    reviewCount: 64,
    studentCount: 178,
    status: "모집중",
    isEnrolled: false,
    progress: 0,
    schedule: {
      startDate: "2025-09-15",
      endDate: "2025-10-27",
      daysOfWeek: ["월", "수"],
      timeSlot: "19:00 ~ 21:00",
      totalSessions: 12,
      scheduleType: "stepping_stone",
    },
    curriculum: [
      { week: 1, sessionNumber: 1, title: "그로스 퍼널 기본 프레임워크", description: "AARRR 모델 완벽 분석", duration: "2시간", deliveryType: "vod" },
      { week: 1, sessionNumber: 2, title: "정량 데이터 트래킹 세팅", description: "GA4 및 믹스패널 이벤트 정의", duration: "2시간", deliveryType: "vod" },
    ],
    reviews: [],
  },
  {
    id: "c4",
    title: "풀스택 AI 웹앱 개발",
    description: "Next.js 15, FastAPI, LangChain을 활용한 상용 수준의 AI 웹 서비스 풀스택 구축.",
    category: "개발·IT",
    tags: ["Next.js", "FastAPI", "LangChain", "풀스택AI"],
    aiSummary: "Next.js 15와 FastAPI, LangChain을 활용한 상용 수준의 AI 웹 서비스 풀스택 구축",
    deliveryType: "hybrid",
    location: "서울시 서초구 강남대로 311 드림플러스 5층 세미나실 & 온라인 Zoom",
    instructor: "강민수",
    instructorAvatar: "",
    price: 790000,
    thumbnail: "",
    rating: 4.9,
    reviewCount: 203,
    studentCount: 412,
    status: "모집중",
    isEnrolled: false,
    progress: 0,
    schedule: {
      startDate: "2025-09-05",
      endDate: "2025-10-24",
      daysOfWeek: ["금"],
      timeSlot: "19:00 ~ 22:00",
      totalSessions: 8,
      scheduleType: "regular",
    },
    curriculum: [
      { week: 1, sessionNumber: 1, title: "Next.js App Router & 서버 컴포넌트", description: "모던 프론트엔드 아키텍처", duration: "3시간", deliveryType: "hybrid" },
      { week: 2, sessionNumber: 2, title: "FastAPI 비동기 API 서버 구축", description: "고성능 백엔드 엔드포인트 설계", duration: "3시간", deliveryType: "hybrid" },
    ],
    reviews: [],
  },
  {
    id: "c5",
    title: "AI 네이티브 UI/UX 디자인",
    description: "생성형 AI 인터페이스(CUI, Agent UI) 디자인 패턴과 Figma 실전 프로토타이핑.",
    category: "디자인/UX",
    tags: ["CUI", "AgentUI", "Figma", "AI인터페이스"],
    aiSummary: "생성형 AI 인터페이스(CUI, Agent UI) 디자인 패턴과 Figma 실전 프로토타이핑",
    deliveryType: "online",
    liveMeetingUrl: "https://zoom.us/j/ai-uiux-live",
    instructor: "윤서연",
    instructorAvatar: "",
    price: 450000,
    thumbnail: "",
    rating: 4.6,
    reviewCount: 42,
    studentCount: 120,
    status: "진행중",
    isEnrolled: false,
    progress: 0,
    schedule: {
      startDate: "2025-08-20",
      endDate: "2025-09-17",
      daysOfWeek: ["수"],
      timeSlot: "19:30 ~ 21:30",
      totalSessions: 5,
      scheduleType: "regular",
    },
    curriculum: [
      { week: 1, sessionNumber: 1, title: "생성형 AI 인터랙션의 특징", description: "비결정적 UX 설계 원칙", duration: "2시간", deliveryType: "online" },
    ],
    reviews: [],
  },
  {
    id: "c6",
    title: "LLM 에이전트 & 멀티에이전트 시스템",
    description: "AutoGen, CrewAI를 활용한 복합 업무 자동화 에이전트 오케스트레이션 실전.",
    category: "AI 모델링",
    deliveryType: "offline",
    location: "서울시 영등포구 여의대로 108 파크원 타워2 22층 컨퍼런스홀",
    instructor: "김소현",
    instructorAvatar: "",
    price: 690000,
    discountedPrice: 490000,
    thumbnail: "",
    rating: 4.9,
    reviewCount: 95,
    studentCount: 260,
    status: "모집중",
    isEnrolled: false,
    progress: 0,
    schedule: {
      startDate: "2025-09-20",
      endDate: "2025-11-01",
      daysOfWeek: ["토"],
      timeSlot: "14:00 ~ 18:00",
      totalSessions: 6,
      scheduleType: "regular",
    },
    curriculum: [
      { week: 1, sessionNumber: 1, title: "멀티 에이전트 아키텍처 개요", description: "협업과 피드백 루프 설계", duration: "4시간", deliveryType: "offline" },
    ],
    reviews: [],
  },
];

const SEED_COURSE_STUDENTS: CourseStudent[] = [
  {
    id: "cs-1",
    userId: "m1",
    name: "김수강생",
    email: "student@mail.com",
    avatar: "",
    courseId: "c1",
    courseTitle: "AI 프로덕트 매니저 부트캠프",
    enrolledAt: "2025-07-25",
    progress: 85,
    completed: false,
    paymentId: "pay-1",
    paymentAmount: 590000,
    paymentStatus: "완료",
    lastActive: "2시간 전",
  },
  {
    id: "cs-2",
    userId: "s2",
    name: "이서연",
    email: "sy.lee@mail.com",
    avatar: "",
    courseId: "c1",
    courseTitle: "AI 프로덕트 매니저 부트캠프",
    enrolledAt: "2025-07-26",
    progress: 100,
    completed: true,
    completedAt: "2025-08-15",
    certificateIssued: true,
    paymentId: "pay-s2",
    paymentAmount: 590000,
    paymentStatus: "완료",
    lastActive: "1일 전",
  },
  {
    id: "cs-3",
    userId: "s3",
    name: "박민재",
    email: "mj.park@mail.com",
    avatar: "",
    courseId: "c1",
    courseTitle: "AI 프로덕트 매니저 부트캠프",
    enrolledAt: "2025-07-28",
    progress: 35,
    completed: false,
    paymentId: "pay-s3",
    paymentAmount: 590000,
    paymentStatus: "완료",
    lastActive: "3일 전",
  },
  {
    id: "cs-4",
    userId: "s4",
    name: "정유진",
    email: "yj.jung@mail.com",
    avatar: "",
    courseId: "c1",
    courseTitle: "AI 프로덕트 매니저 부트캠프",
    enrolledAt: "2025-07-29",
    progress: 95,
    completed: false,
    paymentId: "pay-s4",
    paymentAmount: 590000,
    paymentStatus: "완료",
    lastActive: "방금 전",
  },
  {
    id: "cs-5",
    userId: "s5",
    name: "최도윤",
    email: "dy.choi@mail.com",
    avatar: "",
    courseId: "c1",
    courseTitle: "AI 프로덕트 매니저 부트캠프",
    enrolledAt: "2025-07-30",
    progress: 20,
    completed: false,
    paymentId: "pay-s5",
    paymentAmount: 590000,
    paymentStatus: "환불",
    lastActive: "5일 전",
  },
  {
    id: "cs-6",
    userId: "s6",
    name: "한지우",
    email: "jw.han@mail.com",
    avatar: "",
    courseId: "c6",
    courseTitle: "LLM 에이전트 & 멀티에이전트 시스템",
    enrolledAt: "2025-08-01",
    progress: 75,
    completed: false,
    paymentId: "pay-s6",
    paymentAmount: 490000,
    paymentStatus: "완료",
    lastActive: "4시간 전",
  },
];

const SEED_IR_PROJECTS: IRProject[] = [
  {
    id: "p1",
    teamName: "DocuMind AI",
    anonymousTeamName: "⚡ 캡틴 AI (스텔스)",
    title: "법률·금융 문서를 위한 초정밀 RAG 분석 엔진",
    oneLiner: "복잡한 500페이지 계약서·규제 문서를 3초 만에 검토하고 리스크를 탐지하는 AI",
    description: "복잡한 법률·금융 규제 문서를 고도화된 계층형 RAG와 멀티모달 OCR로 3초 만에 분석하여 계약 리스크와 위반 조항을 즉각 리포팅합니다.",
    field: "AI/딥테크",
    tags: ["법률AI", "RAG", "B2B SaaS", "문서분석"],
    aiSummary: "멀티모달 RAG 기반 복잡한 기업 계약서 및 법률 문서 10초 분석 솔루션",
    thumbnail: "",
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isAnonymous: false,
    businessModel: "B2B SaaS (월 $499 ~ $2,999 티어 요금제) + 커스텀 온프레미스 엔터프라이즈 라이선스",
    problem: "법무/금융팀의 계약서 검토에 건당 평균 4.2시간 소요되며, 담당자 피로도로 인한 조항 누락 리스크 상존",
    solution: "특허 출원한 도메인 특화 RAG 엔진으로 정확도 99.4% 달성 및 검토 시간 85% 단축",
    isHiring: true,
    hiringRoles: ["프론트엔드 (React)", "AI/ML 엔지니어"],
    hiringDetails: [
      {
        id: "hr-1",
        role: "시니어 프론트엔드 개발자 (React/Next.js)",
        type: "풀타임",
        compensation: "연봉 6,000 ~ 8,500만원",
        equity: "0.5% ~ 2.0%",
        skills: ["React", "TypeScript", "TailwindCSS", "Next.js", "Zustand"],
        applyMethod: "internal",
        description: "복잡한 문서 뷰어 및 실시간 AI 협업 인터페이스를 설계하고 개발합니다.",
      },
      {
        id: "hr-2",
        role: "LLM / RAG 엔지니어 (Co-founder 레벨)",
        type: "코파운더",
        compensation: "월 300만원 + 지분 협의",
        equity: "5.0% ~ 15.0%",
        skills: ["Python", "LangChain", "pgvector", "vLLM", "Docker"],
        applyMethod: "link",
        externalLink: "https://wanted.co.kr",
        description: "자체 도메인 모델 파인튜닝 및 벡터 파이프라인 최적화를 리드합니다.",
      },
    ],
    members: [
      { name: "이지훈", role: "CEO / AI Researcher", avatar: "", anonymousName: "⚡ 캡틴 AI", anonymousRole: "CEO (스텔스)", bio: "전) 글로벌 AI 연구소 연구원", socialLink: "https://linkedin.com" },
      { name: "최수아", role: "CTO / Backend", avatar: "", anonymousName: "🤖 코드 마스터", anonymousRole: "CTO (스텔스)", bio: "대용량 트래픽 분산처리 8년차", socialLink: "https://github.com" },
      { name: "정민우", role: "Product Lead", avatar: "", anonymousName: "🎯 그로스 해커", anonymousRole: "PM (스텔스)", bio: "핀테크 유니콘 출신 PM" },
    ],
    bookmarked: true,
    investmentStage: "Seed",
    originIdeaRequestId: "ir-req-1",
    originIdeaTitle: "초기 창업자를 위한 AI 계약서 위험조항 자동 검토 & 수정 제안 SaaS",
    originProposalId: "ip-1",
    visibility: "public",
    prototypeUrl: "https://www.figma.com/@legal-ai-mvp",
  },
  {
    id: "p2",
    teamName: "VoiceFlow KR",
    anonymousTeamName: "🎙 사운드웨이브 랩",
    title: "감정 반응형 한국어 초저지연 음성 AI 에이전트",
    oneLiner: "고객 감정을 실시간 감지하여 톤을 조절하는 B2B CS/아웃바운드 음성 AI 솔루션",
    description: "200ms 미만의 초저지연 실시간 음성 대화 파이프라인과 감정 인식 알고리즘을 결합한 지능형 컨택센터 솔루션입니다.",
    field: "AI/딥테크",
    tags: ["음성AI", "LLM에이전트", "초저지연", "컨택센터"],
    aiSummary: "200ms 초저지연 감정 반응형 B2B CS/아웃바운드 음성 AI 에이전트",
    thumbnail: "",
    isAnonymous: true,
    businessModel: "통화 시간당 종량 과금(분당 120원) + 월 기본 구독료",
    problem: "콜센터 인력 부족과 높은 이직률, 기존 ARS/단순 챗봇의 낮은 고객 만족도",
    solution: "사람 수준의 자연스러운 대화 호흡과 감정 케어로 상담사 업무 70% 자동화",
    isHiring: true,
    hiringRoles: ["보이스/오디오 ML 엔지니어", "B2B 세일즈 리드"],
    hiringDetails: [
      {
        id: "hr-3",
        role: "음성 합성/인식(TTS/STT) ML 엔지니어",
        type: "풀타임",
        compensation: "연봉 7,000 ~ 9,000만원",
        equity: "1.0% ~ 3.0%",
        skills: ["Python", "PyTorch", "Whisper", "WebRTC", "CUDA"],
        applyMethod: "internal",
        description: "실시간 음성 스트리밍 파이프라인 및 경량화 모델 서빙을 담당합니다.",
      },
    ],
    members: [
      { name: "강현우", role: "Co-founder", avatar: "", anonymousName: "🎙 보이스 마스터", anonymousRole: "Founder", bio: "음성 AI 스타트업 2회 창업" },
    ],
    bookmarked: false,
    investmentStage: "Pre-Seed",
  },
  {
    id: "p3",
    teamName: "MedScan AI",
    anonymousTeamName: "🧬 헬스 퓨처스",
    title: "1차 병원용 피부 병변 3초 스크리닝 보조 솔루션",
    oneLiner: "스마트폰 카메라로 촬영한 피부 질환을 98% 정확도로 1차 판독하는 의사용 AI 보조 툴",
    description: "스마트폰 및 전용 렌즈로 촬영한 이미지를 딥러닝 비전 알고리즘으로 분석하여 의사의 1차 진료를 보조합니다.",
    field: "바이오·헬스케어",
    tags: ["의료AI", "비전AI", "스크리닝", "디지털헬스"],
    aiSummary: "스마트폰 카메라 기반 피부 질환 3초 1차 스크리닝 의사용 보조 솔루션",
    thumbnail: "",
    isAnonymous: false,
    businessModel: "병원당 월 구독료(50만원) + 분석 건당 마이크로 과금",
    problem: "비전문의 1차 진료 시 피부암 등 중증 질환 조기 발견 지연 및 오진 가능성",
    solution: "10만 건 이상의 전문의 라벨링 데이터 기반 3초 판독 및 의사 진단서 자동 생성",
    isHiring: false,
    members: [
      { name: "박서준", role: "대표 / 피부과 전문의", avatar: "", bio: "서울대 의대 졸업, 현직 피부과 원장" },
      { name: "임도윤", role: "AI 총괄", avatar: "", bio: "의료영상 딥러닝 박사" },
    ],
    bookmarked: true,
    investmentStage: "Seed",
  },
  {
    id: "p4",
    teamName: "EduCraft",
    title: "생성형 AI 기반 맞춤형 수학 문제 생성 & 튜터",
    oneLiner: "학생의 취약 개념을 실시간 추적하여 1초 만에 맞춤 변형 문제를 생성하는 에듀테크",
    description: "초중고 학생의 오답 데이터를 학습하여 취약한 수학 개념을 정밀 타깃팅하는 문제 생성 엔진입니다.",
    field: "에듀테크",
    tags: ["생성형AI", "맞춤형학습", "수학튜터", "지식그래프"],
    aiSummary: "취약 개념 실시간 추적 및 맞춤형 변형 문제 생성 에듀테크 엔진",
    thumbnail: "",
    isAnonymous: false,
    businessModel: "B2C 학부모 구독(월 39,000원) / B2B 학원 솔루션(학생당 월 15,000원)",
    problem: "기존 문제집의 획일적 구성과 일대일 과외의 비싼 비용 부담",
    solution: "학생별 오답 원인을 그래프 구조로 분석하여 최적의 단계별 유사/변형 문제 무한 생성",
    isHiring: true,
    hiringRoles: ["풀스택 개발자", "교육 콘텐츠 기획자"],
    members: [
      { name: "윤아름", role: "CEO", avatar: "", bio: "대치동 수학 강사 7년차" },
    ],
    bookmarked: false,
    investmentStage: "Pre-Seed",
  },
  {
    id: "p5",
    teamName: "SupplyGenius",
    title: "중소 이커머스를 위한 AI 수요예측 & 자동 발주",
    oneLiner: "트렌드·날씨·이벤트를 종합 분석해 재고 폐기율을 40% 줄여주는 공급망 AI",
    description: "중소 셀러들의 주문 데이터와 외부 트렌드 신호를 결합하여 안전재고를 계산하고 발주를 자동화합니다.",
    field: "커머스/플랫폼",
    tags: ["수요예측", "공급망관리", "이커머스", "시계열AI"],
    aiSummary: "트렌드·날씨 결합 다변량 시계열 AI 기반 중소 이커머스 자동 발주 솔루션",
    thumbnail: "",
    isAnonymous: false,
    businessModel: "스마트스토어/쿠팡 연동 월 구독료(월 99,000원) + 재고 절감 성과보수",
    problem: "수동 엑셀 발주로 인한 잦은 품절 및 악성 재고 누적",
    solution: "다변량 시계열 AI 모델로 상품별 최적 발주일/수량 자동 계산 및 원클릭 발주서 전송",
    isHiring: false,
    members: [
      { name: "송태양", role: "CEO / 데이터 사이언티스트", avatar: "", bio: "쿠팡 물류 데이터 엔지니어 출신" },
    ],
    bookmarked: false,
    investmentStage: "Series A",
  },
];

const SEED_POSTS: BoardPost[] = [
  {
    id: "p-1",
    boardType: "공지사항",
    title: "🚀 [공지] 2025년 하반기 AI 스타트업 배치 3기 모집 안내",
    content: "총 상금 5,000만원 및 Seed 투자 연계! AI로 창업하라 3기 모집이 시작되었습니다. 마감일: 2025.09.30까지.",
    author: "관리자",
    authorAvatar: "",
    createdAt: "2025-08-10",
    viewCount: 1420,
    commentCount: 8,
    isPinned: true,
  },
  {
    id: "p-2",
    boardType: "팀빌딩",
    title: "⚡ [팀빌딩] B2B 법률 AI SaaS 프론트엔드 리드 개발자 모십니다 (지분 2~5%)",
    content: "DocuMind 팀에서 LLM 인터페이스와 복잡한 문서 뷰어를 함께 만들 풀스택/프론트엔드 팀원을 찾습니다. React/TypeScript 경험자 우대합니다.",
    author: "이지훈",
    authorAvatar: "",
    createdAt: "2025-08-12",
    viewCount: 380,
    commentCount: 3,
    isPinned: false,
  },
  {
    id: "p-3",
    boardType: "QnA",
    title: "❓ FastAPI와 Gemini 1.5 Flash 연동 시 스트리밍 응답 팁 공유",
    content: "SSE(Server-Sent Events)를 활용하여 지연시간을 50% 줄인 경험을 공유합니다. 질문 있으시면 댓글 남겨주세요!",
    author: "최수아",
    authorAvatar: "",
    createdAt: "2025-08-11",
    viewCount: 520,
    commentCount: 4,
    isPinned: false,
  },
  {
    id: "p-4",
    boardType: "팀빌딩",
    title: "💡 [팀빌딩] 헬스케어 AI 비전 엔지니어 & UI 디자이너 코파운더 모십니다",
    content: "병원 진료 보조 솔루션 MedScan 팀입니다. 초기 멤버로 조인하실 비전 모델 개발자 및 프로덕트 디자이너 분 커피챗 제안 환영합니다.",
    author: "박서준",
    authorAvatar: "",
    createdAt: "2025-08-09",
    viewCount: 290,
    commentCount: 2,
    isPinned: false,
  },
  {
    id: "p-5",
    boardType: "QnA",
    title: "❓ 초기 시드 투자 IR 피칭 덱 작성 시 유닛 이코노믹스 작성 팁이 있을까요?",
    content: "비즈니스 모델 수업을 듣고 있는데, B2B SaaS의 CAC 산정 기준이 궁금합니다.",
    author: "김수강생",
    authorAvatar: "",
    createdAt: "2025-08-08",
    viewCount: 195,
    commentCount: 2,
    isPinned: false,
  },
];

const SEED_COMMENTS: Comment[] = [
  {
    id: "c-1",
    postId: "p-1",
    author: "이지훈",
    authorAvatar: "",
    authorRoles: ["member"],
    content: "이번 3기 프로그램에 저희 팀도 꼭 지원하겠습니다! 선발 절차가 어떻게 되나요?",
    createdAt: "2025-08-10 14:20",
  },
  {
    id: "c-2",
    postId: "p-1",
    author: "관리자",
    authorAvatar: "",
    authorRoles: ["admin"],
    content: "1차 서류 심사 후 2차 비대면 피칭 인터뷰로 최종 10팀을 선발합니다.",
    createdAt: "2025-08-10 14:45",
  },
  {
    id: "c-3",
    postId: "p-2",
    author: "김수강생",
    authorAvatar: "",
    authorRoles: ["member"],
    content: "안녕하세요! React와 Next.js 3년차입니다. 포트폴리오 전달드릴 수 있을까요?",
    createdAt: "2025-08-12 16:30",
  },
  {
    id: "c-4",
    postId: "p-3",
    author: "강민수",
    authorAvatar: "",
    authorRoles: ["member"],
    content: "SSE 연결 시 타임아웃 처리와 재연결 로직도 신경쓰시면 프로덕션 안정성이 올라갑니다!",
    createdAt: "2025-08-11 20:10",
  },
  {
    id: "c-5",
    postId: "p-5",
    author: "정우석",
    authorAvatar: "",
    authorRoles: ["member"],
    content: "초기 단계에서는 마케팅비 외에 대표의 세일즈 인건비와 POC 전환율을 감안한 블렌디드 CAC로 산출하는 것이 설득력 있습니다.",
    createdAt: "2025-08-08 21:00",
  },
];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "instructor_msg",
    category: "instructor_msg",
    title: "[김소현 강사] 2회차 과제 피드백이 등록되었습니다",
    message: "작성해주신 프롬프트 체이닝 구조도가 매우 우수합니다. 에러 핸들링 폴백만 보완해보세요.",
    time: "10분 전",
    isRead: false,
    sender: "김소현 강사",
    courseTitle: "AI 프로덕트 매니저 부트캠프",
    targetUrl: "/courses?courseId=c1",
    actionLabel: "강의실 바로가기",
    createdAt: "2025-08-10 19:40",
  },
  {
    id: "n2",
    type: "course",
    category: "course",
    title: "내일 19:30 라이브 세션 안내",
    message: "3회차 'RAG 파이프라인 아키텍처' 라이브 수업이 내일 19:30에 시작됩니다.",
    time: "2시간 전",
    isRead: false,
    courseTitle: "AI 프로덕트 매니저 부트캠프",
    targetUrl: "/courses?courseId=c1",
    actionLabel: "강의실 입장",
    createdAt: "2025-08-10 17:30",
  },
  {
    id: "n3",
    type: "team",
    category: "team",
    title: "팀 빌딩 합류 제안 도착",
    message: "'VoiceFlow KR' 프로젝트로부터 프론트엔드 포지션 제안이 도착했습니다.",
    time: "1일 전",
    isRead: true,
    targetUrl: "/mypage?tab=startup",
    actionLabel: "제안서 확인하기",
    createdAt: "2025-08-09 14:20",
  },
  {
    id: "n4",
    type: "investor",
    category: "investor",
    title: "투자자 관심 알림",
    message: "넥서스벤처스 한승우 심사역님이 회원님의 프로젝트를 북마크했습니다.",
    time: "2일 전",
    isRead: true,
    targetUrl: "/mypage?tab=startup",
    actionLabel: "관심 투자자 보기",
    createdAt: "2025-08-08 11:05",
  },
];

const SEED_NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  {
    userId: "user-default",
    emailEnabled: true,
    inAppEnabled: true,
    alimtalkEnabled: true,
    categories: {
      course: { inapp: true, email: true, alimtalk: true },
      team: { inapp: true, email: true, alimtalk: false },
      investor: { inapp: true, email: true, alimtalk: true },
      community: { inapp: true, email: false, alimtalk: false },
      digest: { inapp: true, email: true, alimtalk: false },
      marketing: { inapp: true, email: false, alimtalk: false },
    },
    quietHours: {
      enabled: true,
      start: "21:00",
      end: "08:00",
    },
    snoozeUntil: null,
    updatedAt: "2025-08-10 10:00",
  },
];

const SEED_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "tmpl-course-d1",
    code: "COURSE_D1_REMINDER",
    name: "강의 시작 D-1 리마인더",
    category: "course",
    titleTemplate: "[D-1] 내일 {{courseTitle}} 라이브 수업이 시작됩니다!",
    contentTemplate: "안녕하세요 {{userName}}님! 신청하신 '{{courseTitle}}' 1회차가 내일 {{startTime}}에 시작됩니다. 원활한 수강을 위해 강의실 환경과 사전 실습 자료를 미리 확인해 보세요.",
    targetUrlTemplate: "/courses?courseId={{courseId}}",
    actionLabelTemplate: "강의실 바로가기",
    channels: ["email", "alimtalk", "inapp"],
  },
  {
    id: "tmpl-team-proposal",
    code: "TEAM_PROPOSAL_RECEIVED",
    name: "팀 빌딩 합류 제안 수신",
    category: "team",
    titleTemplate: "🤝 {{fromUser}}님이 '{{projectName}}' 팀 합류를 제안했습니다",
    contentTemplate: "{{fromUser}}님이 회원님의 포트폴리오를 확인하고 {{role}} 포지션으로 합류를 제안했습니다. 제안 메시지와 프로젝트 비전을 확인하고 48시간 내에 응답해 주세요.",
    targetUrlTemplate: "/mypage?tab=startup",
    actionLabelTemplate: "제안서 확인하기",
    channels: ["email", "inapp"],
  },
  {
    id: "tmpl-invest-proposal",
    code: "INVESTMENT_PROPOSAL_RECEIVED",
    name: "투자자 미팅/투자 제안 수신",
    category: "investor",
    titleTemplate: "💼 [투자 제안] 전문 투자자로부터 '{{projectName}}' 미팅 제안이 도착했습니다",
    contentTemplate: "유망 스타트업 발굴을 진행 중인 투자자로부터 미팅 제안이 접수되었습니다. 플랫폼 워크스페이스에서 상세 제안 내용을 확인하고 일정을 조율해 보세요.",
    targetUrlTemplate: "/mypage?tab=startup",
    actionLabelTemplate: "투자 제안서 열람",
    channels: ["email", "alimtalk", "inapp"],
  },
  {
    id: "tmpl-post-comment",
    code: "POST_COMMENT_RECEIVED",
    name: "게시글 새 댓글 등록",
    category: "community",
    titleTemplate: "💬 회원님의 글 '{{postTitle}}'에 새 댓글이 달렸습니다",
    contentTemplate: "{{author}}님이 회원님의 게시글에 새로운 의견을 남겼습니다: \"{{commentSnippet}}\"",
    targetUrlTemplate: "/community?postId={{postId}}",
    actionLabelTemplate: "댓글 답글달기",
    channels: ["inapp", "email"],
  },
  {
    id: "tmpl-weekly-digest",
    code: "WEEKLY_DIGEST",
    name: "주간 인기 스타트업 & 트렌드 다이제스트",
    category: "digest",
    isMarketing: true,
    titleTemplate: "☕ [위클리 다이제스트] 이번 주 주목받은 AI 스타트업 TOP 3",
    contentTemplate: "이번 주 가장 많은 투자자 북마크를 받은 유망 AI 스타트업과 커뮤니티 인기 토론글을 모았습니다. 창업 생태계의 최신 트렌드를 지금 확인하세요!",
    targetUrlTemplate: "/ir",
    actionLabelTemplate: "위클리 트렌드 보기",
    channels: ["email"],
  },
  {
    id: "tmpl-course-proposal",
    code: "COURSE_PROPOSAL_MATCHED",
    name: "수강생 개강요청 강사 역제안 도착",
    category: "course",
    titleTemplate: "🧑‍🏫 요청하신 '{{requestTitle}}'에 전문 강사님의 커리큘럼 제안이 도착했습니다!",
    contentTemplate: "수강생님께서 발제하신 '{{requestTitle}}' 수요에 맞춰 전문 강사님이 맞춤 커리큘럼과 일정을 제안했습니다. 제안서를 검토하고 정식 개강을 확정해 주세요.",
    targetUrlTemplate: "/courses?tab=requests&requestId={{requestId}}",
    actionLabelTemplate: "강사 제안서 검토하기",
    channels: ["email", "inapp"],
  },
  {
    id: "tmpl-idea-proposal",
    code: "IDEA_PROPOSAL_MATCHED",
    name: "아이디어 의뢰 빌더 팀 제작 역제안",
    category: "team",
    titleTemplate: "🧩 '{{ideaTitle}}' 아이디어에 빌더 팀의 MVP 제작 계획서가 접수되었습니다",
    contentTemplate: "등록하신 아이디어에 실력파 개발/기획 빌더 팀이 예상 개발 기간과 기술 스택을 역제안했습니다. 제안서를 확인하고 선발 여부를 결정하세요.",
    targetUrlTemplate: "/ir?tab=idea_requests&requestId={{requestId}}",
    actionLabelTemplate: "빌더 제안서 열람하기",
    channels: ["email", "inapp"],
  },
  {
    id: "tmpl-payment-complete",
    code: "PAYMENT_COMPLETED",
    name: "강의 수강 결제 완료",
    category: "course",
    titleTemplate: "🎉 [결제 완료] '{{courseTitle}}' 수강 신청이 완료되었습니다",
    contentTemplate: "{{userName}}님, '{{courseTitle}}' 결제가 정상 완료되었습니다. 강의 일정과 준비사항을 내 강의실에서 확인하세요.",
    targetUrlTemplate: "/mypage?tab=courses",
    actionLabelTemplate: "내 강의실 바로가기",
    channels: ["email", "alimtalk", "inapp"],
  },
];

const SEED_NOTIFICATION_LOGS: NotificationLog[] = [];

const SEED_TEAM_REQUESTS: TeamBuildingRequest[] = [
  {
    id: "tr1",
    type: "received",
    projectName: "DocuMind AI",
    fromUser: "이지훈 (대표)",
    toUser: "김수강생",
    role: "프론트엔드 리드",
    message: "수강생 대시보드 및 프로덕트 구현 포트폴리오를 인상깊게 보았습니다. 커피챗 가능하실까요?",
    status: "대기중",
    date: "2025-08-12",
  },
  {
    id: "tr2",
    type: "sent",
    projectName: "VoiceFlow KR",
    fromUser: "김수강생",
    toUser: "강현우 (대표)",
    role: "UI/UX 디자이너",
    message: "음성 인터랙션 UI 디자인에 관심이 많습니다. 함께하고 싶습니다.",
    status: "수락",
    date: "2025-08-05",
  },
];

const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay-1",
    courseId: "c1",
    courseTitle: "AI 프로덕트 매니저 부트캠프",
    userId: "user-1",
    amount: 890000,
    date: "2025-07-25",
    method: "카드",
    status: "완료",
  },
  {
    id: "pay-2",
    courseId: "c2",
    courseTitle: "스타트업 비즈니스 모델 설계",
    userId: "user-2",
    amount: 490000,
    date: "2025-07-26",
    method: "카드",
    status: "완료",
  },
];

const SEED_SETTLEMENTS: SettlementRecord[] = [
  { id: "s1", period: "2025년 8월", totalRevenue: 14750000, pgFee: 486750, platformFee: 2212500, netAmount: 12050750, status: "출금신청" },
  { id: "s2", period: "2025년 7월", totalRevenue: 18200000, pgFee: 600600, platformFee: 2730000, netAmount: 14869400, status: "정산완료" },
  { id: "s3", period: "2025년 6월", totalRevenue: 12400000, pgFee: 409200, platformFee: 1860000, netAmount: 10130800, status: "정산완료" },
];

const SEED_PROPOSALS: InvestmentProposal[] = [
  { id: "prop-1", projectId: "p1", projectName: "DocuMind AI", message: "시드 라운드 3억원 투자 및 미국 시장 진출 멘토링을 제안합니다.", sentDate: "2025-08-10", status: "대기중" },
  { id: "prop-2", projectId: "p3", projectName: "MedScan AI", message: "의료 AI 전문 펀드 5억원 팔로온 투자 검토를 위한 미팅을 요청드립니다.", sentDate: "2025-08-05", status: "수락" },
];

const SEED_RECOMMENDATIONS: AIRecommendation[] = [
  { projectId: "p1", projectName: "DocuMind AI", matchScore: 96, matchReasons: ["B2B SaaS 선호 조건 일치", "특허 기반 진입장벽", "팀원 전문성 상위 1%"], field: "AI/ML" },
  { projectId: "p2", projectName: "VoiceFlow KR", matchScore: 91, matchReasons: ["초저지연 음성 AI 시장 급성장", "연쇄 창업자 팀"], field: "AI/ML" },
  { projectId: "p5", projectName: "SupplyGenius", matchScore: 85, matchReasons: ["이커머스 물류 시장 검증", "데이터 파이프라인 우수"], field: "커머스" },
];

const SEED_STATS: DashboardStats = {
  dailySignups: 42,
  monthlySignups: 1280,
  totalRevenue: 84200000,
  monthlyRevenue: 28400000,
  activeCourses: 6,
  teamMatchCount: 38,
  investmentMatchCount: 12,
};

const SEED_MEMBERS: AdminMember[] = [
  { id: "m-otter", name: "오승환", email: "otter.oh@gmail.com", roles: ["admin", "member"], joinDate: "2024-01-01", lastLogin: "2025-08-20", status: "활성", courseCount: 0 },
  { id: "m-mahau", name: "마하우", email: "mahau.master@gmail.com", roles: ["member"], joinDate: "2025-02-01", lastLogin: "2025-08-20", status: "활성", courseCount: 1 },
  { id: "m0", name: "최관리", email: "admin@platform.com", roles: ["admin"], joinDate: "2024-01-01", lastLogin: "2025-08-20", status: "활성", courseCount: 0 },
  { id: "m1", name: "김수강생", email: "student@mail.com", roles: ["member"], joinDate: "2025-01-15", lastLogin: "2025-08-12", status: "활성", courseCount: 2 },
  { id: "m2", name: "김소현", email: "sohyun.kim@mail.com", roles: ["member"], joinDate: "2024-03-01", lastLogin: "2025-08-12", status: "활성", courseCount: 3 },
  { id: "m3", name: "이지훈", email: "jh.lee@documind.ai", roles: ["member"], joinDate: "2025-04-10", lastLogin: "2025-08-11", status: "활성", courseCount: 1 },
  { id: "m4", name: "정우석", email: "ws.jung@mail.com", roles: ["member"], joinDate: "2024-06-01", lastLogin: "2025-08-10", status: "활성", courseCount: 2 },
  { id: "m5", name: "한승우", email: "sw.han@nexusvc.com", roles: ["member"], joinDate: "2024-11-10", lastLogin: "2025-08-12", status: "활성", courseCount: 0 },
  { id: "m6", name: "오세진", email: "sj.oh@mail.com", roles: ["member"], joinDate: "2025-05-20", lastLogin: "2025-07-15", status: "정지", courseCount: 1 },
  { id: "m7", name: "강민수", email: "ms.kang@mail.com", roles: ["member"], joinDate: "2024-09-01", lastLogin: "2025-08-10", status: "활성", courseCount: 1 },
];

const SEED_BOARDS: AdminBoard[] = [
  { id: "b1", name: "공지사항", readPermission: "전체", writePermission: "관리자", template: "일반형", postCount: 45, createdAt: "2024-01-01" },
  { id: "b2", name: "팀 빌딩 (Co-founder)", readPermission: "회원", writePermission: "회원", template: "카드형", postCount: 128, createdAt: "2024-01-01" },
  { id: "b3", name: "Q&A 자유게시판", readPermission: "전체", writePermission: "회원", template: "일반형", postCount: 312, createdAt: "2024-01-01" },
];

const SEED_CRM_MESSAGES: CRMMessage[] = [
  {
    id: "crm-1",
    courseId: "c1",
    courseTitle: "AI 프로덕트 매니저 부트캠프",
    targetType: "all",
    targetCount: 42,
    title: "1주차 복습 영상 및 실습 파일 업로드 안내",
    content: "수강생 여러분, 1주차 강의 VOD와 실습 프롬프트 템플릿이 자료실에 업로드되었습니다.",
    channels: ["inapp", "email"],
    sentAt: "2025-08-10 18:00",
  },
];

const SEED_CODE_GROUPS: CodeGroup[] = [
  {
    groupCode: "INVESTMENT_STAGE",
    groupName: "투자 유치 단계",
    description: "스타트업의 현재 펀딩 라운드 단계",
    isSystem: true,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    groupCode: "EMPLOYMENT_TYPE",
    groupName: "고용 형태",
    description: "창업팀 구인 공고의 고용 및 참여 형태",
    isSystem: true,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    groupCode: "COURSE_CATEGORY",
    groupName: "강의 카테고리",
    description: "교육/강의 등록 및 추천 카테고리 분류",
    isSystem: true,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    groupCode: "COURSE_STATUS",
    groupName: "강의 상태",
    description: "강의 모집 및 진행 단계 상태",
    isSystem: true,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    groupCode: "IR_FIELD",
    groupName: "스타트업 산업/기술 분야",
    description: "스타트업 IR 프로젝트의 산업 도메인 분류",
    isSystem: true,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    groupCode: "PAY_METHOD",
    groupName: "결제 수단",
    description: "강의 수강신청 결제 수단",
    isSystem: true,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    groupCode: "SETTLEMENT_STATUS",
    groupName: "정산 상태",
    description: "강사 수강료 정산 및 출금 처리 상태",
    isSystem: true,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    groupCode: "COURSE_DELIVERY_TYPE",
    groupName: "강의 진행 방식",
    description: "온라인/오프라인/VOD/하이브리드 등 강의 진행 형식 분류",
    isSystem: true,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
];

const SEED_COMMON_CODES: CommonCode[] = [
  // ── COURSE_DELIVERY_TYPE ──
  {
    id: "cc-deliv-1",
    groupCode: "COURSE_DELIVERY_TYPE",
    code: "ONLINE",
    codeName: "실시간 온라인",
    displayName: "💻 실시간 온라인",
    sortOrder: 1,
    extraValue: { badgeColor: "cyan", icon: "video" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-deliv-2",
    groupCode: "COURSE_DELIVERY_TYPE",
    code: "OFFLINE",
    codeName: "현장 오프라인",
    displayName: "🏢 현장 오프라인",
    sortOrder: 2,
    extraValue: { badgeColor: "amber", icon: "map-pin" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-deliv-3",
    groupCode: "COURSE_DELIVERY_TYPE",
    code: "VOD",
    codeName: "VOD 동영상",
    displayName: "🎥 VOD 동영상",
    sortOrder: 3,
    extraValue: { badgeColor: "purple", icon: "play-circle" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-deliv-4",
    groupCode: "COURSE_DELIVERY_TYPE",
    code: "HYBRID",
    codeName: "온·오프라인 혼합",
    displayName: "🔄 온·오프라인 혼합",
    sortOrder: 4,
    extraValue: { badgeColor: "emerald", icon: "layers" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  // ── INVESTMENT_STAGE ──
  {
    id: "cc-inv-1",
    groupCode: "INVESTMENT_STAGE",
    code: "PRE_SEED",
    codeName: "Pre-Seed",
    displayName: "Pre-Seed",
    sortOrder: 1,
    extraValue: { badgeColor: "amber" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-inv-2",
    groupCode: "INVESTMENT_STAGE",
    code: "SEED",
    codeName: "Seed",
    displayName: "Seed",
    sortOrder: 2,
    extraValue: { badgeColor: "emerald" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-inv-3",
    groupCode: "INVESTMENT_STAGE",
    code: "PRE_A",
    codeName: "Pre-A",
    displayName: "Pre-A",
    sortOrder: 3,
    extraValue: { badgeColor: "blue" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-inv-4",
    groupCode: "INVESTMENT_STAGE",
    code: "SERIES_A",
    codeName: "Series A",
    displayName: "Series A",
    sortOrder: 4,
    extraValue: { badgeColor: "purple" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },

  // ── EMPLOYMENT_TYPE ──
  {
    id: "cc-emp-1",
    groupCode: "EMPLOYMENT_TYPE",
    code: "FULL_TIME",
    codeName: "풀타임",
    displayName: "풀타임",
    sortOrder: 1,
    extraValue: { tagColor: "blue" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-emp-2",
    groupCode: "EMPLOYMENT_TYPE",
    code: "PART_TIME",
    codeName: "파트타임",
    displayName: "파트타임",
    sortOrder: 2,
    extraValue: { tagColor: "teal" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-emp-3",
    groupCode: "EMPLOYMENT_TYPE",
    code: "INTERN",
    codeName: "인턴",
    displayName: "인턴",
    sortOrder: 3,
    extraValue: { tagColor: "cyan" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-emp-4",
    groupCode: "EMPLOYMENT_TYPE",
    code: "CO_FOUNDER",
    codeName: "코파운더",
    displayName: "코파운더",
    sortOrder: 4,
    extraValue: { tagColor: "amber" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },

  // ── COURSE_CATEGORY ──
  {
    id: "cc-cat-1",
    groupCode: "COURSE_CATEGORY",
    code: "AI_MODEL",
    codeName: "AI 모델링 / LLM",
    displayName: "AI 모델링 / LLM",
    sortOrder: 1,
    extraValue: { icon: "Sparkles", badgeColor: "blue" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-cat-2",
    groupCode: "COURSE_CATEGORY",
    code: "MULTI_AGENT",
    codeName: "실전 멀티에이전트",
    displayName: "실전 멀티에이전트",
    sortOrder: 2,
    extraValue: { icon: "Bot", badgeColor: "purple" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-cat-3",
    groupCode: "COURSE_CATEGORY",
    code: "BIZ_PLAN",
    codeName: "비즈니스 기획",
    displayName: "비즈니스 기획",
    sortOrder: 3,
    extraValue: { icon: "Target", badgeColor: "amber" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-cat-4",
    groupCode: "COURSE_CATEGORY",
    code: "DEV_IT",
    codeName: "개발·IT",
    displayName: "개발·IT",
    sortOrder: 4,
    extraValue: { icon: "Code", badgeColor: "emerald" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-cat-5",
    groupCode: "COURSE_CATEGORY",
    code: "GROWTH_MKT",
    codeName: "그로스 마케팅",
    displayName: "그로스 마케팅",
    sortOrder: 5,
    extraValue: { icon: "TrendingUp", badgeColor: "rose" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-cat-6",
    groupCode: "COURSE_CATEGORY",
    code: "BIO_HEALTH",
    codeName: "바이오·헬스케어",
    displayName: "바이오·헬스케어",
    sortOrder: 6,
    extraValue: { icon: "HeartPulse", badgeColor: "teal" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },

  // ── COURSE_STATUS ──
  {
    id: "cc-cst-1",
    groupCode: "COURSE_STATUS",
    code: "RECRUITING",
    codeName: "모집중",
    displayName: "모집중",
    sortOrder: 1,
    extraValue: { badgeColor: "emerald" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-cst-2",
    groupCode: "COURSE_STATUS",
    code: "IN_PROGRESS",
    codeName: "진행중",
    displayName: "진행중",
    sortOrder: 2,
    extraValue: { badgeColor: "blue" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-cst-3",
    groupCode: "COURSE_STATUS",
    code: "CLOSED",
    codeName: "종료",
    displayName: "종료",
    sortOrder: 3,
    extraValue: { badgeColor: "slate" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-cst-4",
    groupCode: "COURSE_STATUS",
    code: "DRAFT",
    codeName: "임시저장",
    displayName: "임시저장",
    sortOrder: 4,
    extraValue: { badgeColor: "amber" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },

  // ── IR_FIELD ──
  {
    id: "cc-fld-1",
    groupCode: "IR_FIELD",
    code: "AI_ML",
    codeName: "AI/ML",
    displayName: "AI/ML",
    sortOrder: 1,
    extraValue: { badgeColor: "purple" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-fld-2",
    groupCode: "IR_FIELD",
    code: "FINTECH",
    codeName: "핀테크 / 결제",
    displayName: "핀테크 / 결제",
    sortOrder: 2,
    extraValue: { badgeColor: "blue" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-fld-3",
    groupCode: "IR_FIELD",
    code: "HEALTHCARE",
    codeName: "헬스케어 / 바이오",
    displayName: "헬스케어 / 바이오",
    sortOrder: 3,
    extraValue: { badgeColor: "teal" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-fld-4",
    groupCode: "IR_FIELD",
    code: "EDUTECH",
    codeName: "에듀테크",
    displayName: "에듀테크",
    sortOrder: 4,
    extraValue: { badgeColor: "amber" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-fld-5",
    groupCode: "IR_FIELD",
    code: "COMMERCE",
    codeName: "커머스 / 유통",
    displayName: "커머스 / 유통",
    sortOrder: 5,
    extraValue: { badgeColor: "rose" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-fld-6",
    groupCode: "IR_FIELD",
    code: "SAAS",
    codeName: "B2B SaaS",
    displayName: "B2B SaaS",
    sortOrder: 6,
    extraValue: { badgeColor: "emerald" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },

  // ── PAY_METHOD ──
  {
    id: "cc-pay-1",
    groupCode: "PAY_METHOD",
    code: "CARD",
    codeName: "신용/체크카드",
    displayName: "신용/체크카드",
    sortOrder: 1,
    extraValue: { icon: "CreditCard" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-pay-2",
    groupCode: "PAY_METHOD",
    code: "KAKAO_PAY",
    codeName: "카카오페이",
    displayName: "카카오페이",
    sortOrder: 2,
    extraValue: { icon: "Zap", badgeColor: "yellow" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-pay-3",
    groupCode: "PAY_METHOD",
    code: "TRANSFER",
    codeName: "실시간 계좌이체",
    displayName: "실시간 계좌이체",
    sortOrder: 3,
    extraValue: { icon: "Landmark" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },

  // ── SETTLEMENT_STATUS ──
  {
    id: "cc-set-1",
    groupCode: "SETTLEMENT_STATUS",
    code: "WAITING",
    codeName: "정산대기",
    displayName: "정산대기",
    sortOrder: 1,
    extraValue: { badgeColor: "amber" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-set-2",
    groupCode: "SETTLEMENT_STATUS",
    code: "REQUESTED",
    codeName: "출금신청",
    displayName: "출금신청",
    sortOrder: 2,
    extraValue: { badgeColor: "blue" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "cc-set-3",
    groupCode: "SETTLEMENT_STATUS",
    code: "COMPLETED",
    codeName: "정산완료",
    displayName: "정산완료",
    sortOrder: 3,
    extraValue: { badgeColor: "emerald" },
    isActive: true,
    isSystem: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
];

// ── 역제안 시드 데이터 (교육 개강 요청 / 스타트업 아이디어 제작 요청) ──

const SEED_COURSE_REQUESTS: CourseRequest[] = [
  {
    id: "cr-1",
    title: "실전 LangGraph & 멀티 에이전트 자율 코딩 시스템 개강 요청",
    description: "단순 프롬프트 엔지니어링을 넘어 LangGraph 기반 상태 관리, 서브에이전트 조율, 코드 자가 수정 루프를 직접 구현하는 실무 집중 강의를 열어주세요!",
    category: "AI 모델링",
    tags: ["LangGraph", "MultiAgent", "AgenticDev", "Python"],
    targetLevel: "중급",
    preferredSchedule: "평일 저녁 (화/목 19:30~21:30)",
    expectedPriceRange: "40~60만원대",
    requestedBy: {
      userId: "u-student-1",
      userName: "김수강생",
      avatar: "",
    },
    upvotes: ["u-student-1", "u-member-2", "u-member-3", "u-member-4", "u-member-5", "u-member-6", "u-member-7", "u-member-8", "u-member-9", "u-member-10", "u-member-11", "u-member-12", "u-member-13", "u-member-14", "u-member-15", "u-member-16", "u-member-17", "u-member-18"],
    upvoteCount: 18,
    targetCount: 20,
    status: "모집중",
    createdAt: "2025-09-01T10:00:00Z",
  },
  {
    id: "cr-2",
    title: "비개발자 창업자를 위한 AI 마케팅 & CRM 자동화 (Make + n8n + GPT-4o)",
    description: "코딩을 몰라도 웹 스크래핑, SNS 콘텐츠 자동 발행, 카카오톡 알림톡/CRM 연동까지 1인 창업자가 혼자서 매출을 만드는 자동화 파이프라인을 배우고 싶습니다.",
    category: "마케팅",
    tags: ["n8n", "Make", "CRM자동화", "노코드"],
    targetLevel: "입문",
    preferredSchedule: "주말 오전 (토/일 10:00~13:00)",
    expectedPriceRange: "30~45만원대",
    requestedBy: {
      userId: "u-founder-2",
      userName: "이창업",
      avatar: "",
    },
    upvotes: ["u-founder-2", "u-student-1", "u-member-2", "u-member-3", "u-member-4", "u-member-5", "u-member-6", "u-member-7", "u-member-8", "u-member-9", "u-member-10", "u-member-11", "u-member-12", "u-member-13", "u-member-14", "u-member-15", "u-member-16", "u-member-17", "u-member-18", "u-member-19", "u-member-20", "u-member-21", "u-member-22", "u-member-23", "u-member-24"],
    upvoteCount: 24,
    targetCount: 20,
    status: "강사매칭중",
    createdAt: "2025-08-28T14:30:00Z",
  },
  {
    id: "cr-3",
    title: "AI 헬스케어 규제 샌드박스 통과 및 의료기기 인허가 전략",
    description: "생성형 AI를 의료/헬스케어에 접목할 때 식약처 인허가 및 개인정보보호법 가이드라인을 실제 통과한 실무자의 생생한 케이스 스터디가 필요합니다.",
    category: "비즈니스 기획",
    tags: ["디지털헬스케어", "규제샌드박스", "식약처인허가"],
    targetLevel: "고급",
    preferredSchedule: "평일 저녁",
    expectedPriceRange: "50만원 이상",
    requestedBy: {
      userId: "u-med-1",
      userName: "최의료",
      avatar: "",
    },
    upvotes: ["u-med-1", "u-student-1", "u-member-2", "u-member-3", "u-member-4", "u-member-5", "u-member-6", "u-member-7"],
    upvoteCount: 8,
    targetCount: 15,
    status: "모집중",
    createdAt: "2025-09-02T09:15:00Z",
  },
];

const SEED_COURSE_PROPOSALS: CourseProposal[] = [
  {
    id: "cp-1",
    requestId: "cr-2",
    instructorId: "ins-1",
    instructorName: "김소현",
    instructorAvatar: "",
    instructorTitle: "전) 글로벌 테크 유니콘 AI PM 리드",
    proposedTitle: "1인 창업자를 위한 노코드 AI 그로스해킹 & 마케팅 자동화 4주 완성",
    curriculumDraft: [
      "1회차: Make & n8n 기초 및 웹훅(Webhook) 데이터 수집",
      "2회차: GPT-4o API 기반 맞춤형 카피라이팅 & SNS 자동 포스팅",
      "3회차: 리드 수집 랜딩페이지 구축 및 카카오 알림톡 CRM 연동",
      "4회차: 유료 광고 성과 대시보드 자동화 및 A/B 테스트 파이프라인",
    ],
    proposedPrice: 390000,
    proposedSchedule: "매주 토/일 10:00~12:30 (총 8회차 / 4주)",
    message: "안녕하세요, 비개발자 분들이 바로 당일 실무에 적용해 매출을 낼 수 있는 실습 100% 커리큘럼으로 준비했습니다!",
    status: "대기중",
    createdAt: "2025-08-30T11:00:00Z",
  },
];

const SEED_IDEA_REQUESTS: IdeaRequest[] = [
  {
    id: "ir-req-1",
    title: "초기 창업자를 위한 AI 계약서 위험조항 자동 검토 & 수정 제안 SaaS",
    problem: "초기 스타트업은 수백만원의 법률 자문료를 감당하기 어렵고, 투자계약서나 외주계약서 내 독소조항을 제때 발견하지 못해 큰 피해를 입는 경우가 빈번합니다.",
    solutionConcept: "계약서 PDF/Word 문서를 업로드하면 LLM과 리걸 온톨로지가 10초 만에 불공정 조항, 누락된 보호 장치를 색출하고 스타트업 친화적인 대체 문구를 제안하는 서비스.",
    category: "AI/SaaS",
    tags: ["LegalTech", "계약서검토", "SaaS", "AI에이전트"],
    requiredRoles: ["풀스택 개발자", "AI 엔지니어", "UI/UX 디자이너"],
    rewardType: "지분공유(코파운더)",
    rewardDetail: "지분 15~25% 협의 + 공동대표(Co-founder) 지위",
    submissionDeadline: "2025-09-20",
    selectionDate: "2025-09-25",
    requestedBy: {
      userId: "u-founder-legal",
      userName: "박창업 (변리사/예비창업자)",
      avatar: "",
    },
    upvotes: ["u-founder-legal", "u-student-1", "u-member-2", "u-member-3", "u-member-4", "u-member-5", "u-member-6", "u-member-7", "u-member-8", "u-member-9", "u-member-10", "u-member-11", "u-member-12", "u-member-13", "u-member-14", "u-member-15", "u-member-16", "u-member-17", "u-member-18", "u-member-19", "u-member-20", "u-member-21", "u-member-22", "u-member-23", "u-member-24", "u-member-25", "u-member-26", "u-member-27", "u-member-28", "u-member-29", "u-member-30", "u-member-31", "u-member-32"],
    upvoteCount: 32,
    status: "선발진행중",
    selectedProposalIds: [],
    createdAt: "2025-08-25T16:00:00Z",
  },
  {
    id: "ir-req-2",
    title: "로컬 디저트 카페 맞춤형 당일 마감할인 & 재고 예측 AI 에이전트",
    problem: "동네 카페/베이커리 사장님들은 매일 오후 남은 빵과 케이크를 폐기해야 하는 손실을 겪고 있으나, 복잡한 배달앱 설정이나 타임세일 관리에 일손이 부족합니다.",
    solutionConcept: "당일 날씨, 유동인구, 판매 추이를 학습해 적정 마감세일 개시 시간과 할인율을 카톡으로 추천하고, 인근 단골에게 자동 타임세일 알림톡을 발송하는 경량 솔루션.",
    category: "커머스",
    tags: ["로컬커머스", "재고예측", "소상공인", "알림톡"],
    requiredRoles: ["프론트엔드", "백엔드 개발자"],
    rewardType: "개발보상",
    rewardDetail: "MVP 개발비 400만원 + 런칭 후 월 구독료 30% 셰어",
    submissionDeadline: "2025-09-30",
    selectionDate: "2025-10-05",
    requestedBy: {
      userId: "u-cafe-owner",
      userName: "최점주 (베이커리 대표)",
      avatar: "",
    },
    upvotes: ["u-cafe-owner", "u-student-1", "u-member-2", "u-member-3", "u-member-4", "u-member-5", "u-member-6", "u-member-7", "u-member-8", "u-member-9", "u-member-10", "u-member-11", "u-member-12", "u-member-13", "u-member-14", "u-member-15"],
    upvoteCount: 15,
    status: "모집중",
    selectedProposalIds: [],
    createdAt: "2025-09-01T11:20:00Z",
  },
];

const SEED_IDEA_PROPOSALS: IdeaProposal[] = [
  {
    id: "ip-1",
    requestId: "ir-req-1",
    proposerId: "u-builder-1",
    proposerName: "오승환",
    proposerAvatar: "",
    teamSummary: "테크 스타트업 리드 개발자 출신 풀스택 1인 + LangChain 전문 AI 엔지니어 1인 팀",
    techStack: ["React", "TypeScript", "FastAPI", "OpenAI Embeddings", "MongoDB"],
    planSummary: "3주차에 계약서 파싱 및 RAG 기반 위험조항 추출 MVP 완성, 4주차에 PDF 리포트 생성 및 UI 완성 계획입니다.",
    estimatedWeeks: 4,
    portfolioUrl: "https://github.com/example/legal-ai-demo",
    contactEmail: "builder.oh@gmail.com",
    demoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    prototypeUrl: "https://www.figma.com/@legal-ai-mvp",
    visibility: "public",
    status: "선발(협의중)",
    linkedProjectId: "p1",
    createdAt: "2025-08-27T10:00:00Z",
  },
];

// ──────────────────── 초기 시드 데이터 맵 ────────────────────

function buildSeedData(): DatabaseSchema {
  return {
    courses: SEED_COURSES,
    courseStudents: SEED_COURSE_STUDENTS,
    courseRequests: SEED_COURSE_REQUESTS,
    courseProposals: SEED_COURSE_PROPOSALS,
    irProjects: SEED_IR_PROJECTS,
    ideaRequests: SEED_IDEA_REQUESTS,
    ideaProposals: SEED_IDEA_PROPOSALS,
    posts: SEED_POSTS,
    comments: SEED_COMMENTS,
    notifications: SEED_NOTIFICATIONS,
    notificationPreferences: SEED_NOTIFICATION_PREFERENCES,
    notificationTemplates: SEED_NOTIFICATION_TEMPLATES,
    notificationLogs: SEED_NOTIFICATION_LOGS,
    teamRequests: SEED_TEAM_REQUESTS,
    payments: SEED_PAYMENTS,
    settlements: SEED_SETTLEMENTS,
    proposals: SEED_PROPOSALS,
    recommendations: SEED_RECOMMENDATIONS,
    stats: SEED_STATS,
    members: SEED_MEMBERS,
    boards: SEED_BOARDS,
    crmMessages: SEED_CRM_MESSAGES,
    applications: [],
    codeGroups: SEED_CODE_GROUPS,
    commonCodes: SEED_COMMON_CODES,
    kakao_sessions: [],
  };
}

// ──────────────────────── Database Class (MongoDB 기반) ────────────────────────

// stats는 단일 문서이므로 별도 처리가 필요한 키 목록
const SINGLETON_KEYS: Array<keyof DatabaseSchema> = ["stats"];

class Database {
  private cache: DatabaseSchema;
  private initialized = false;

  constructor() {
    // 초기값으로 시드 데이터 세팅 (initDb() 호출 전까지 폴백용)
    this.cache = buildSeedData();
  }

  /**
   * MongoDB 연결 및 데이터 로드.
   * 서버 시작 전에 반드시 호출해야 합니다.
   */
  async init(): Promise<void> {
    try {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      mongodb = client.db(MONGODB_DBNAME);
      console.log(`[DB] MongoDB connected: ${MONGODB_DBNAME}`);

      // 각 컬렉션에서 데이터 로드 (비어있으면 시드 삽입)
      const seedData = buildSeedData();
      const keys = Object.keys(seedData) as Array<keyof DatabaseSchema>;

      for (const key of keys) {
        const collection = mongodb.collection(key);
        const count = await collection.countDocuments();

        if (count === 0) {
          // 시드 데이터 삽입
          if (SINGLETON_KEYS.includes(key)) {
            // 단일 문서 (stats 등)
            await collection.insertOne({ _singleton: true, ...(seedData[key] as object) });
          } else {
            const arr = seedData[key] as unknown[];
            if (arr.length > 0) {
              await collection.insertMany(arr as any[]);
            }
          }
          console.log(`[DB] Seeded collection: ${key} (${SINGLETON_KEYS.includes(key) ? 1 : (seedData[key] as unknown[]).length} docs)`);
        }

        // 캐시에 로드
        if (SINGLETON_KEYS.includes(key)) {
          const doc = await collection.findOne({ _singleton: true });
          if (doc) {
            const { _id, _singleton, ...rest } = doc as any;
            (this.cache as any)[key] = rest;
          }
        } else {
          const docs = await collection.find({}).toArray();
          const mappedDocs = docs.map((d: any) => {
            const { _id, ...rest } = d;
            if (key === "members") {
              const roles: UserRole[] = Array.isArray(rest.roles) && rest.roles.length > 0
                ? rest.roles
                : (rest.role === "admin" ? ["admin"] : rest.role === "manager" ? ["manager"] : ["member"]);
              return { ...rest, roles };
            }
            if (key === "comments") {
              const authorRoles: UserRole[] = Array.isArray(rest.authorRoles) && rest.authorRoles.length > 0
                ? rest.authorRoles
                : (rest.authorRole ? [rest.authorRole as UserRole] : ["member"]);
              return { ...rest, authorRoles };
            }
            return rest;
          });

          // 고유 ID / userId / groupCode 기준 중복 제거 방어
          const seen = new Set<string>();
          (this.cache as any)[key] = mappedDocs.filter((item: any) => {
            const uid = item?.id || item?.userId || item?.groupCode;
            if (uid) {
              if (seen.has(uid)) return false;
              seen.add(uid);
            }
            return true;
          });
        }
      }

      // ── AI 메타데이터 자동 마이그레이션 (기존 레코드에 tags/aiSummary 자동 부여 - 백그라운드 실행) ──
      (async () => {
        try {
          const { classifyContent } = await import("./services/aiClassifier.js");
          
          let coursesMigrated = false;
          for (const c of (this.cache.courses || [])) {
            if (!c.tags || c.tags.length === 0 || !c.aiSummary) {
              const res = await classifyContent("course", {
                title: c.title,
                description: c.description,
              });
              c.tags = c.tags && c.tags.length > 0 ? c.tags : res.tags;
              c.aiSummary = c.aiSummary || res.aiSummary;
              coursesMigrated = true;
            }
          }
          if (coursesMigrated) {
            await this.syncToMongo("courses");
            console.log("[DB Migration] Courses successfully enriched with AI tags and summary");
          }

          let irMigrated = false;
          for (const p of (this.cache.irProjects || [])) {
            if (!p.tags || p.tags.length === 0 || !p.aiSummary) {
              const res = await classifyContent("ir", {
                title: p.title,
                description: p.description,
                oneLiner: p.oneLiner,
                problem: p.problem,
                solution: p.solution,
              });
              p.tags = p.tags && p.tags.length > 0 ? p.tags : res.tags;
              p.aiSummary = p.aiSummary || res.aiSummary;
              irMigrated = true;
            }
          }
          if (irMigrated) {
            await this.syncToMongo("irProjects");
            console.log("[DB Migration] IR projects successfully enriched with AI tags and summary");
          }
        } catch (migError) {
          console.warn("[DB Migration] AI metadata migration skipped or encountered non-critical error:", migError);
        }
      })();

      this.initialized = true;
      console.log("[DB] All collections loaded into cache");
    } catch (error) {
      console.error("[DB] MongoDB connection failed, using seed data as fallback:", error);
      this.cache = buildSeedData();
      this.initialized = true;
    }
  }

  /**
   * MongoDB 컬렉션에 캐시 내용을 영속화 (전체 교체 방식)
   */
  private async syncToMongo<K extends keyof DatabaseSchema>(key: K): Promise<void> {
    if (!mongodb) return;

    try {
      const collection = mongodb.collection(key as string);

      if (SINGLETON_KEYS.includes(key)) {
        const value = this.cache[key];
        await collection.replaceOne(
          { _singleton: true },
          { _singleton: true, ...(value as object) },
          { upsert: true }
        );
      } else {
        const arr = ((this.cache[key] as unknown[]) || []).map((item: any) => {
          const { _id, ...rest } = item || {};
          return rest;
        });
        await collection.deleteMany({});
        if (arr.length > 0) {
          await collection.insertMany(arr);
        }
      }
    } catch (error) {
      console.error(`[DB] Failed to sync collection "${String(key)}" to MongoDB:`, error);
    }
  }

  public persist() {
    // 모든 컬렉션 동기화 (fire-and-forget)
    const keys = Object.keys(this.cache) as Array<keyof DatabaseSchema>;
    for (const key of keys) {
      this.syncToMongo(key);
    }
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.cache[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]) {
    this.cache[key] = value;
    this.syncToMongo(key);
  }

  public update<K extends keyof DatabaseSchema>(
    key: K,
    updater: (prev: DatabaseSchema[K]) => DatabaseSchema[K]
  ) {
    this.cache[key] = updater(this.cache[key]);
    this.syncToMongo(key);
    return this.cache[key];
  }
}

export const db = new Database();

/**
 * MongoDB 초기화 함수. 서버 시작 전에 반드시 호출.
 */
export async function initDb(): Promise<void> {
  await db.init();
}
