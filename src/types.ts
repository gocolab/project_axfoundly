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

// ── Course ──
export interface Course {
  id: string;
  title: string;
  description: string;
  category: "AI 모델링" | "비즈니스 기획" | "마케팅" | "개발" | "디자인";
  instructor: string;
  instructorAvatar: string;
  price: number;
  discountedPrice?: number;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  studentCount: number;
  status: "모집중" | "진행중" | "종료";
  curriculum: CurriculumItem[];
  reviews: Review[];
  isEnrolled?: boolean;
  progress?: number; // 0-100
}

export interface CurriculumItem {
  week: number;
  title: string;
  description: string;
  duration: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  content: string;
  date: string;
}

// ── IR / Startup ──
export interface IRProject {
  id: string;
  teamName: string;
  title: string;
  oneLiner: string;
  description: string;
  field: "AI/ML" | "핀테크" | "헬스케어" | "에듀테크" | "커머스" | "SaaS";
  thumbnail: string;
  members: TeamMember[];
  businessModel: string;
  problem: string;
  solution: string;
  isHiring: boolean;
  hiringRoles?: string[];
  bookmarked?: boolean;
  investmentStage: "Pre-Seed" | "Seed" | "Series A";
}

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

// ── Community / Board ──
export type BoardType = "공지사항" | "팀빌딩" | "QnA";

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

// ── Notification ──
export interface Notification {
  id: string;
  type: "course" | "team" | "investor" | "system";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
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

// ── Instructor ──
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
