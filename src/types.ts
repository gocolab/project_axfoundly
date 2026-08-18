/**
 * Domain Type Definitions for "AI로 창업하라" Platform Mockup
 */

// ── User / Auth ──
export type UserRole = "student" | "instructor" | "investor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  joinDate: string;
}

// ── Course Schedule & Curriculum ──
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
  category: "AI 모델링" | "비즈니스 기획" | "마케팅" | "개발" | "디자인";
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

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  content: string;
  date: string;
  courseTitle?: string;
}

// ── IR / Startup ──
export interface HiringRoleDetail {
  id: string;
  role: string;
  type: "풀타임" | "파트타임" | "인턴" | "코파운더";
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
  field: "AI/ML" | "핀테크" | "헬스케어" | "에듀테크" | "커머스" | "SaaS";
  thumbnail: string;
  demoVideoUrl?: string; // 동작/시연 영상 URL (YouTube / Loom)
  isAnonymous?: boolean; // 비실명 모드 활성화 여부
  members: TeamMember[];
  businessModel: string;
  problem: string;
  solution: string;
  isHiring: boolean;
  hiringRoles?: string[];
  hiringDetails?: HiringRoleDetail[];
  bookmarked?: boolean;
  investmentStage: "Pre-Seed" | "Seed" | "Series A";
}

// ── Community / Board & Comments ──
export type BoardType = "공지사항" | "팀빌딩" | "QnA";

export interface Comment {
  id: string;
  postId: string;
  author: string;
  authorAvatar: string;
  authorRole?: UserRole;
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
  courseTitle: string;
  amount: number;
  date: string;
  method: "카드" | "계좌이체";
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
  role: UserRole;
  joinDate: string;
  lastLogin: string;
  status: "활성" | "정지" | "탈퇴";
  courseCount: number;
}
