/**
 * Domain Type Definitions for "AI로 창업하라" Platform Mockup
 */

// ── Common Code (공통 코드) ──
export interface CodeGroup {
  groupCode: string;
  groupName: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CommonCode {
  id: string;
  groupCode: string;
  code: string;
  codeName: string;
  displayName: string;
  sortOrder: number;
  extraValue?: Record<string, any> | string;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
}

// ── User / Auth ──
export type UserRole = "member" | "manager" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  avatar: string;
  joinDate: string;
  bio?: string;
}

// ── Course Schedule & Curriculum ──
export type CourseDeliveryType = "online" | "offline" | "vod" | "hybrid";

export interface CourseSchedule {
  startDate: string; // "2025-09-01"
  endDate: string;   // "2025-10-15"
  daysOfWeek: string[]; // ["화", "목"]
  timeSlot: string;  // "19:30 ~ 21:30"
  totalSessions: number; // 12
  scheduleType: "regular" | "stepping_stone"; // 징검다리 방식 여부
}

export interface CurriculumItem {
  week: number;
  sessionNumber?: number;
  title: string;
  description: string;
  duration: string;
  date?: string;       // "2025-09-02"
  dayOfWeek?: string;  // "화"
  time?: string;       // "19:30 ~ 21:30"
  deliveryType?: CourseDeliveryType;
  locationOrLink?: string;
}

// ── Instructor Profile & Infographics ──
export interface InstructorInfographic {
  experienceYears: number;
  totalStudents: number;
  satisfactionRate: number; // 98 (%)
  topKeywords: string[];
  careerHighlights: string[];
  certifiedBadge: string;
}

export interface InstructorProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  totalStudents: number;
  infographic: InstructorInfographic;
  careerHistory: string[];
  courses: {
    id: string;
    title: string;
    category: string;
    period: string;
    studentCount: number;
    rating: number;
    status: "모집중" | "진행중" | "종료";
  }[];
  reviews: Review[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string; // AI가 자동 분류한 카테고리 (예: "AI 모델링", "비즈니스 기획", "바이오헬스" 등)
  tags?: string[]; // AI가 자동 추출한 키워드 태그
  aiSummary?: string; // AI가 생성한 1줄 요약
  deliveryType?: CourseDeliveryType; // "online" | "offline" | "vod" | "hybrid"
  location?: string; // 오프라인 강의장 주소
  liveMeetingUrl?: string; // 온라인 화상 회의 / VOD 링크
  instructor: string;
  instructorAvatar: string;
  instructorTitle?: string;
  price: number;
  discountedPrice?: number;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  studentCount: number;
  status: "모집중" | "진행중" | "종료";
  schedule: CourseSchedule;
  curriculum: CurriculumItem[];
  reviews: Review[];
  instructorProfile?: InstructorProfile;
  isEnrolled?: boolean;
  progress?: number; // 0-100
}

export interface CourseStudent {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number; // 0-100
  completed: boolean;
  completedAt?: string;
  certificateIssued?: boolean;
  paymentId?: string;
  paymentAmount?: number;
  paymentStatus: "완료" | "환불" | "취소";
  lastActive: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  content: string;
  date: string;
  courseTitle?: string;
}

// ── Course Reverse Proposal (개강 요청 & 역제안) ──
export interface CourseProposal {
  id: string;
  requestId: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  instructorTitle?: string;
  proposedTitle: string;
  curriculumDraft: string[];
  proposedPrice: number;
  proposedSchedule: string;
  message: string;
  status: "대기중" | "채택됨" | "반려";
  createdAt: string;
}

export interface CourseRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  targetLevel?: "입문" | "초급" | "중급" | "고급" | string;
  preferredSchedule?: string;
  expectedPriceRange?: string;
  requestedBy: {
    userId: string;
    userName: string;
    avatar: string;
  };
  upvotes: string[];
  upvoteCount: number;
  targetCount: number;
  status: "모집중" | "강사매칭중" | "개강완료" | "마감";
  matchedCourseId?: string;
  proposals?: CourseProposal[];
  createdAt: string;
  updatedAt?: string;
}

// ── IR / Startup ──
export interface HiringRoleDetail {
  id: string;
  role: string;
  type: "풀타임" | "파트타임" | "인턴" | "코파운더" | string;
  compensation?: string; // "월 300~450만원" or "추후 협의"
  equity?: string;       // "1.0% ~ 3.0%" or "협의"
  skills: string[];      // ["React", "TypeScript", "Node.js"]
  applyMethod: "internal" | "link";
  externalLink?: string; // "https://wanted.co.kr/..."
  description?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  anonymousName?: string; // 비실명 모드용 이름 (예: "캡틴 AI")
  anonymousRole?: string;
  anonymousAvatar?: string;
  bio?: string;
  socialLink?: string;
}

export interface IRProject {
  id: string;
  teamName: string;
  anonymousTeamName?: string; // 비실명 팀명
  title: string;
  oneLiner: string;
  description: string;
  field: string; // AI가 자동 부여한 산업 카테고리 (예: "AI/딥테크", "바이오·헬스", "핀테크" 등 무한 확장)
  tags?: string[]; // AI가 본문에서 자동 추출한 핵심 키워드 태그 목록
  aiSummary?: string; // AI가 생성한 1줄 요약
  thumbnail: string;
  demoVideoUrl?: string; // 동작/시연 영상 URL (YouTube / Loom)
  prototypeUrl?: string; // Figma / 프로토타입 / 데모 사이트 URL
  isAnonymous?: boolean; // 비실명 모드 활성화 여부
  members: TeamMember[];
  businessModel: string;
  problem: string;
  solution: string;
  isHiring: boolean;
  hiringRoles?: string[];
  hiringDetails?: HiringRoleDetail[];
  bookmarked?: boolean;
  investmentStage: "Pre-Seed" | "Seed" | "Pre-A" | "Series A" | string;
  // 아이디어 제작 요청 연계 필드
  originIdeaRequestId?: string;
  originIdeaTitle?: string;
  originProposalId?: string;
  visibility?: "public" | "requester_only";
}

// ── Startup & IR Reverse Proposal (아이디어 제작 의뢰 & 빌더 역제안) ──
export interface IdeaProposal {
  id: string;
  requestId: string;
  proposerId: string;
  proposerName: string;
  proposerAvatar: string;
  teamSummary: string;
  techStack: string[];
  planSummary: string;
  estimatedWeeks: number;
  portfolioUrl?: string;
  contactEmail?: string;
  demoVideoUrl?: string; // 목업/MVP 시연 영상 링크 (YouTube, Loom 등)
  prototypeUrl?: string; // 프로토타입/데모 사이트 링크 (Figma, 배포 URL 등)
  visibility: "public" | "requester_only"; // 스타트업 IR 목록 일반 공개 vs 발제자 전용 비공개
  status: "대기중" | "선발(협의중)" | "최종채택" | "미선발" | "수락됨" | "거절됨";
  linkedProjectId?: string; // 자동 생성/연결된 스타트업 IR 프로젝트 ID
  createdAt: string;
}

export interface IdeaRequest {
  id: string;
  title: string;
  problem: string;
  solutionConcept: string;
  category: string;
  tags?: string[];
  requiredRoles: string[];
  rewardType: "지분공유(코파운더)" | "개발보상" | "수익셰어" | "협의" | string;
  rewardDetail?: string;
  submissionDeadline?: string; // 제안서 접수 마감일 (예: 2025-09-15)
  selectionDate?: string; // 빌더 팀 선발 발표일 (예: 2025-09-20)
  requestedBy: {
    userId: string;
    userName: string;
    avatar: string;
  };
  upvotes: string[];
  upvoteCount: number;
  status: "모집중" | "선발진행중" | "협의중" | "매칭완료" | "마감" | "빌더제안중";
  selectedProposalIds?: string[]; // 복수 선발(협의 대상)된 제안서 ID 목록
  matchedProjectId?: string; // 최종 매칭된 대표 IR 프로젝트 ID
  matchedProjectIds?: string[]; // 연계된 IR 프로젝트 ID 목록
  proposals?: IdeaProposal[];
  createdAt: string;
  updatedAt?: string;
}


// ── Community / Board & Comments ──
export type BoardType = "공지사항" | "팀빌딩" | "QnA" | string;

export interface Comment {
  id: string;
  postId: string;
  author: string;
  authorAvatar: string;
  authorRoles?: UserRole[];
  content: string;
  createdAt: string;
}

export interface BoardPost {
  id: string;
  boardType: BoardType;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  authorRoles?: UserRole[];
  createdAt: string;
  viewCount: number;
  commentCount: number;
  isPinned?: boolean;
}

export interface JobApplication {
  id: string;
  projectId: string;
  roleId?: string;
  applicantName: string;
  applicantEmail: string;
  portfolioUrl?: string;
  coverLetter: string;
  createdAt: string;
}


// ── Notification ──
export interface Notification {
  id: string;
  type: "course" | "team" | "investor" | "system" | "instructor_msg";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  sender?: string;
  courseTitle?: string;
}

// ── Dashboard Stats (Admin) ──
export interface DashboardStats {
  dailySignups: number;
  monthlySignups: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeCourses: number;
  teamMatchCount: number;
  investmentMatchCount: number;
  courseRequestCount?: number;
  courseMatchRate?: number;
  ideaRequestCount?: number;
  builderMatchRate?: number;
  aiAutoFillCount?: number;
}

// ── Admin Category Insight ──
export interface AdminCategoryInsight {
  category: string;
  count: number;
  type: "course" | "ir" | "idea" | "all";
  recentTrend: string;
  isRecommendedChip?: boolean;
}

// ── Instructor CRM & Settlement ──
export interface CRMMessage {
  id: string;
  courseId: string;
  courseTitle: string;
  targetType: "all" | "selected" | "behind";
  targetCount: number;
  title: string;
  content: string;
  channels: ("email" | "alimtalk" | "inapp")[];
  sentAt: string;
}

export interface SettlementRecord {
  id: string;
  period: string;
  totalRevenue: number;
  pgFee: number;
  platformFee: number;
  netAmount: number;
  status: "정산완료" | "정산대기" | "출금신청";
}

// ── Investor ──
export interface InvestmentProposal {
  id: string;
  projectId: string;
  projectName: string;
  message: string;
  sentDate: string;
  status: "대기중" | "수락" | "거절";
}

export interface AIRecommendation {
  projectId: string;
  projectName: string;
  matchScore: number;
  matchReasons: string[];
  field: string;
}

// ── Team Building ──
export interface TeamBuildingRequest {
  id: string;
  type: "sent" | "received";
  projectName: string;
  fromUser: string;
  toUser: string;
  role: string;
  message: string;
  status: "대기중" | "수락" | "거절";
  date: string;
}

// ── Payment / Enrollment ──
export interface PaymentRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  amount: number;
  method: "카드" | "계좌이체" | "카카오페이";
  date: string;
  status: "완료" | "환불";
}

// ── Admin Board Management ──
export interface AdminBoard {
  id: string;
  name: string;
  readPermission: "전체" | "회원" | "관리자";
  writePermission: "전체" | "회원" | "관리자";
  template: "일반형" | "갤러리형" | "카드형";
  postCount: number;
  createdAt: string;
}

// ── Admin Member Management ──
export interface AdminMember {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  joinDate: string;
  lastLogin: string;
  status: "활성" | "정지" | "탈퇴";
  courseCount: number;
}

// ── AI Startup Tutor ──
export interface AITutorMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
  relatedLink?: {
    type: "course" | "ir" | "community";
    id: string;
    title: string;
  };
}
