/**
 * Shared Type Definitions for the Accelerator Hub Applet
 */

export interface SurveyAnswers {
  role: string;
  focus: string;
  stage: string;
  team: string;
  challenge: string;
}

export interface ActivityLog {
  id: string;
  title: string;
  subtitle: string;
  type: "video" | "feedback" | "discussion";
  unread?: boolean;
}

export interface ShowcaseProject {
  id: string;
  title: string;
  description: string;
  live: boolean;
  likes: number;
  comments: number;
  author: string;
  bgGradient: string;
}

export interface AssetLibraryItem {
  id: string;
  filename: string;
  description: string;
  grade: "엘리트 등급" | "코어 등급" | "스탠다드 등급";
  type: "json" | "yaml" | "py" | "md";
}

export interface ProjectMatchRequest {
  id: string;
  title: string;
  description: string;
  budget: "높음" | "중간" | "연구협력";
  timeAgo: string;
  isCustom?: boolean;
}

export interface LiveScheduleItem {
  id: string;
  time: string;
  title: string;
  speaker: string;
  role: string;
  type: "video" | "audio";
  attendeesCount: number;
  attendeeAvatars: string[];
}

export interface B2BBootcamp {
  id: string;
  title: string;
  description: string;
  startDate: string;
  originalPrice: number;
  discountedPrice: number;
  deposit: number;
  isRegistered: boolean;
  bgPattern?: string;
}

export interface InsightArticle {
  id: string;
  title: string;
  description: string;
  category: "에디토리얼 피쳐" | "스타트업 가이드" | "케이스 스터디" | "트렌드";
  readTime?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  publishDate?: string;
}
