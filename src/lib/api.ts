import type {
  Course,
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
  UserRole,
  CodeGroup,
  CommonCode,
} from "../types";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // ── Auth ──
  login: async (roles?: UserRole[], email?: string, password?: string) => {
    return fetchJson<{ user: any; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ roles, email, password }),
    });
  },

  googleLogin: async (data?: { email?: string; name?: string; roles?: UserRole[]; credential?: string; code?: string }) => {
    return fetchJson<{ user: any; token: string }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(data || { email: "otter.oh@gmail.com" }),
    });
  },

  signup: async (data: { name: string; email: string; password?: string; roles: UserRole[] }) => {
    return fetchJson<{ user: any; token: string }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getGoogleAuthUrl: async () => {
    return fetchJson<{ url: string }>("/api/auth/google/url");
  },

  getMe: async (token: string) => {
    return fetchJson<{ user: any }>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // ── Courses ──
  getCourses: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    return fetchJson<{ courses: Course[]; total: number; page: number; limit: number; totalPages: number }>(
      `/api/courses?${query.toString()}`
    );
  },

  getCourse: async (id: string) => {
    return fetchJson<{ course: Course }>(`/api/courses/${id}`);
  },

  saveCourse: async (courseData: Partial<Course>) => {
    return fetchJson<{ course: Course }>("/api/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  },

  enrollCourse: async (id: string, paymentMethod: "카드" | "계좌이체" = "카드") => {
    return fetchJson<{ success: boolean; course: Course; payment: PaymentRecord }>(
      `/api/courses/${id}/enroll`,
      {
        method: "POST",
        body: JSON.stringify({ paymentMethod }),
      }
    );
  },

  enrollWithKakaoPay: async (data: { itemName: string; totalAmount: number; orderId: string; userId: string }) => {
    return fetchJson<{ next_redirect_pc_url: string; tid: string }>("/api/payments/ready", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },


  approveCourse: async (id: string) => {
    return fetchJson<{ success: boolean; course: Course }>(`/api/courses/${id}/approve`, {
      method: "PATCH",
    });
  },

  rejectCourse: async (id: string, reason?: string) => {
    return fetchJson<{ success: boolean; course: Course }>(`/api/courses/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  addCourseReview: async (id: string, review: { author: string; rating: number; content: string }) => {
    return fetchJson<{ review: any }>(`/api/courses/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify(review),
    });
  },

  // ── Payments ──
  getPayments: async () => {
    return fetchJson<{ payments: PaymentRecord[] }>("/api/payments");
  },

  getReceipt: async (id: string) => {
    return fetchJson<{ receipt: any }>(`/api/payments/${id}/receipt`);
  },

  refundPayment: async (id: string, reason?: string) => {
    return fetchJson<{ success: boolean; payment: PaymentRecord }>(`/api/payments/${id}/refund`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  // ── IR & Startup ──
  getIRProjects: async (params?: { field?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.field) query.set("field", params.field);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    return fetchJson<{ projects: IRProject[]; total: number; page: number; limit: number; totalPages: number }>(
      `/api/ir/projects?${query.toString()}`
    );
  },

  getIRProject: async (id: string) => {
    return fetchJson<{ project: IRProject }>(`/api/ir/projects/${id}`);
  },

  saveIRProject: async (projectData: Partial<IRProject>) => {
    return fetchJson<{ project: IRProject }>("/api/ir/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
  },

  toggleBookmark: async (id: string) => {
    return fetchJson<{ success: boolean; bookmarked: boolean; project: IRProject }>(
      `/api/ir/projects/${id}/bookmark`,
      { method: "POST" }
    );
  },

  applyForJob: async (projectId: string, application: { roleId?: string; applicantName: string; applicantEmail: string; portfolioUrl?: string; coverLetter: string }) => {
    return fetchJson<{ success: boolean; application: any }>(`/api/ir/projects/${projectId}/apply`, {
      method: "POST",
      body: JSON.stringify(application),
    });
  },

  // ── Investments ──
  getProposals: async () => {
    return fetchJson<{ proposals: InvestmentProposal[] }>("/api/investments/proposals");
  },

  sendProposal: async (data: { projectId: string; projectName?: string; message: string }) => {
    return fetchJson<{ proposal: InvestmentProposal }>("/api/investments/proposals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateProposalStatus: async (id: string, status: "수락" | "거절" | "대기중") => {
    return fetchJson<{ proposal: InvestmentProposal }>(`/api/investments/proposals/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  getAIRecommendations: async () => {
    return fetchJson<{ recommendations: AIRecommendation[] }>("/api/investments/recommendations");
  },

  // ── Community ──
  getPosts: async (params?: { boardType?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.boardType) query.set("boardType", params.boardType);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    return fetchJson<{ posts: BoardPost[]; total: number; page: number; limit: number; totalPages: number }>(
      `/api/community/posts?${query.toString()}`
    );
  },

  getPostDetail: async (id: string) => {
    return fetchJson<{ post: BoardPost; comments: Comment[] }>(`/api/community/posts/${id}`);
  },

  createPost: async (postData: Partial<BoardPost>) => {
    return fetchJson<{ post: BoardPost }>("/api/community/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  },

  getComments: async (postId: string) => {
    return fetchJson<{ comments: Comment[] }>(`/api/community/posts/${postId}/comments`);
  },

  addComment: async (postId: string, commentData: { author: string; authorRoles?: UserRole[]; content: string }) => {
    return fetchJson<{ comment: Comment }>(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    });
  },

  // ── Team Building ──
  getTeamRequests: async () => {
    return fetchJson<{ requests: TeamBuildingRequest[] }>("/api/team/requests");
  },

  sendTeamRequest: async (data: { projectName: string; fromUser?: string; toUser?: string; role: string; message: string }) => {
    return fetchJson<{ request: TeamBuildingRequest }>("/api/team/requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateTeamRequestStatus: async (id: string, status: "수락" | "거절") => {
    return fetchJson<{ request: TeamBuildingRequest }>(`/api/team/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // ── Notifications ──
  getNotifications: async () => {
    return fetchJson<{ notifications: Notification[] }>("/api/notifications");
  },

  markNotificationRead: async (id: string) => {
    return fetchJson<{ notification: Notification }>(`/api/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  markAllNotificationsRead: async () => {
    return fetchJson<{ success: boolean; count: number }>("/api/notifications/read-all", {
      method: "POST",
    });
  },

  // ── Instructor CRM & Settlements ──
  sendCRMMessage: async (crmData: {
    courseId?: string;
    courseTitle: string;
    targetType: "all" | "selected" | "behind";
    targetCount: number;
    title: string;
    content: string;
    channels: ("inapp" | "email" | "alimtalk")[];
  }) => {
    return fetchJson<{ message: CRMMessage }>("/api/instructor/crm/send", {
      method: "POST",
      body: JSON.stringify(crmData),
    });
  },

  getSettlements: async () => {
    return fetchJson<{ settlements: SettlementRecord[] }>("/api/instructor/settlements");
  },

  withdrawSettlement: async (settlementId?: string) => {
    return fetchJson<{ success: boolean; settlement: SettlementRecord }>("/api/instructor/settlements/withdraw", {
      method: "POST",
      body: JSON.stringify({ settlementId }),
    });
  },

  // ── Admin ──
  getAdminStats: async () => {
    return fetchJson<{ stats: DashboardStats }>("/api/admin/stats");
  },

  getAdminMembers: async () => {
    return fetchJson<{ members: AdminMember[] }>("/api/admin/members");
  },

  changeMemberRole: async (id: string, roles: UserRole[]) => {
    return fetchJson<{ member: AdminMember }>(`/api/admin/members/${id}/roles`, {
      method: "PATCH",
      body: JSON.stringify({ roles }),
    });
  },

  changeMemberStatus: async (id: string, status: "활성" | "정지" | "탈퇴") => {
    return fetchJson<{ member: AdminMember }>(`/api/admin/members/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  getAdminBoards: async () => {
    return fetchJson<{ boards: AdminBoard[] }>("/api/admin/boards");
  },

  createAdminBoard: async (boardData: { name: string; readPermission: string; writePermission: string; template: string }) => {
    return fetchJson<{ board: AdminBoard }>("/api/admin/boards", {
      method: "POST",
      body: JSON.stringify(boardData),
    });
  },

  deleteAdminBoard: async (id: string) => {
    return fetchJson<{ success: boolean }>(`/api/admin/boards/${id}`, {
      method: "DELETE",
    });
  },

  // ── AI Services ──
  generateCourseDraft: async (data: { topic: string; targetAudience?: string; totalSessions?: number }) => {
    return fetchJson<{ draft: Partial<Course> }>("/api/ai/course-draft", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  diagnosePersona: async (answers: any) => {
    return fetchJson<{ report: string }>("/api/ai/diagnosis", {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },

  sendMentorChat: async (message: string, history?: any[]) => {
    return fetchJson<{ text: string }>("/api/ai/innovation-chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    });
  },

  askAITutor: async (question: string, context?: string) => {
    return fetchJson<{ answer: string; suggestions?: string[] }>("/api/ai/tutor", {
      method: "POST",
      body: JSON.stringify({ question, context }),
    });
  },

  // ── Common Codes ──
  getCommonCodes: async (groups?: string[]): Promise<{ codes: CommonCode[] }> => {
    const query = groups && groups.length > 0 ? `?groups=${encodeURIComponent(groups.join(","))}` : "";
    return fetchJson<{ codes: CommonCode[] }>(`/api/common/codes${query}`);
  },

  getCodeGroups: async (): Promise<{ groups: CodeGroup[] }> => {
    return fetchJson<{ groups: CodeGroup[] }>("/api/common/groups");
  },

  createCommonCode: async (codeData: Partial<CommonCode>): Promise<{ code: CommonCode }> => {
    return fetchJson<{ code: CommonCode }>("/api/common/codes", {
      method: "POST",
      body: JSON.stringify(codeData),
    });
  },

  updateCommonCode: async (id: string, updates: Partial<CommonCode>): Promise<{ code: CommonCode }> => {
    return fetchJson<{ code: CommonCode }>(`/api/common/codes/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },
};

