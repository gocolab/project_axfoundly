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
  MemberStatus,
  MemberActivity,
  AdminBoard,
  CRMMessage,
  UserRole,
  CodeGroup,
  CommonCode,
  CourseRequest,
  CourseProposal,
  IdeaRequest,
  IdeaProposal,
  AdminCategoryInsight,
  NotificationPreference,
  NotificationTemplate,
  NotificationLog,
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

  deleteCourse: async (id: string) => {
    return fetchJson<{ success: boolean; message: string }>(`/api/courses/${id}`, {
      method: "DELETE",
    });
  },

  enrollCourse: async (id: string, paymentMethod: "카카오페이" = "카카오페이") => {
    return fetchJson<{ success: boolean; course: Course; payment: PaymentRecord }>(
      `/api/courses/${id}/enroll`,
      {
        method: "POST",
        body: JSON.stringify({ paymentMethod }),
      }
    );
  },

  cancelCourseEnrollment: async (id: string, userName?: string) => {
    return fetchJson<{ success: boolean; course: Course }>(
      `/api/courses/${id}/cancel-enrollment`,
      {
        method: "POST",
        body: JSON.stringify({ userName }),
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

  // ── Course Requests (개강 요청 & 역제안) ──
  getCourseRequests: async (params?: { category?: string; tag?: string; search?: string; sort?: "popular" | "recent"; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.tag) query.set("tag", params.tag);
    if (params?.search) query.set("search", params.search);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    return fetchJson<{ requests: CourseRequest[]; total: number; page: number; limit: number; totalPages: number }>(
      `/api/courses/requests?${query.toString()}`
    );
  },

  getCourseRequest: async (id: string) => {
    return fetchJson<{ request: CourseRequest }>(`/api/courses/requests/${id}`);
  },

  createCourseRequest: async (data: Partial<CourseRequest>) => {
    return fetchJson<{ success: boolean; request: CourseRequest }>("/api/courses/requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  upvoteCourseRequest: async (id: string, userId?: string) => {
    return fetchJson<{ success: boolean; isUpvoted: boolean; request: CourseRequest }>(`/api/courses/requests/${id}/upvote`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  submitCourseProposal: async (requestId: string, data: Partial<CourseProposal>) => {
    return fetchJson<{ success: boolean; proposal: CourseProposal }>(`/api/courses/requests/${requestId}/proposals`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  acceptCourseProposal: async (requestId: string, proposalId: string) => {
    return fetchJson<{ success: boolean; course: Course; request: CourseRequest }>(`/api/courses/requests/${requestId}/accept-proposal`, {
      method: "POST",
      body: JSON.stringify({ proposalId }),
    });
  },

  deleteCourseRequest: async (id: string) => {
    return fetchJson<{ success: boolean }>(`/api/courses/requests/${id}`, {
      method: "DELETE",
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

  deleteIRProject: async (id: string) => {
    return fetchJson<{ success: boolean; message?: string }>(`/api/ir/projects/${id}`, {
      method: "DELETE",
    });
  },

  upvoteIRProject: async (id: string, userId?: string) => {
    return fetchJson<{ success: boolean; isUpvoted: boolean; project: IRProject }>(`/api/ir/projects/${id}/upvote`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  applyForJob: async (projectId: string, application: { roleId?: string; applicantName: string; applicantEmail: string; portfolioUrl?: string; coverLetter: string }) => {
    return fetchJson<{ success: boolean; application: any }>(`/api/ir/projects/${projectId}/apply`, {
      method: "POST",
      body: JSON.stringify(application),
    });
  },

  // ── Idea Requests (아이디어 제작 의뢰 & 빌더 역제안) ──
  getIdeaRequests: async (params?: { category?: string; tag?: string; search?: string; sort?: "popular" | "recent"; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.tag) query.set("tag", params.tag);
    if (params?.search) query.set("search", params.search);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    return fetchJson<{ requests: IdeaRequest[]; total: number; page: number; limit: number; totalPages: number }>(
      `/api/ir/idea-requests?${query.toString()}`
    );
  },

  getIdeaRequest: async (id: string) => {
    return fetchJson<{ request: IdeaRequest }>(`/api/ir/idea-requests/${id}`);
  },

  createIdeaRequest: async (data: Partial<IdeaRequest>) => {
    return fetchJson<{ success: boolean; request: IdeaRequest }>("/api/ir/idea-requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateIdeaRequest: async (id: string, data: Partial<IdeaRequest>) => {
    return fetchJson<{ success: boolean; request: IdeaRequest }>(`/api/ir/idea-requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  upvoteIdeaRequest: async (id: string, userId?: string) => {
    return fetchJson<{ success: boolean; isUpvoted: boolean; request: IdeaRequest }>(`/api/ir/idea-requests/${id}/upvote`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  submitIdeaProposal: async (requestId: string, data: Partial<IdeaProposal>) => {
    return fetchJson<{ success: boolean; proposal: IdeaProposal; project?: IRProject }>(`/api/ir/idea-requests/${requestId}/proposals`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  selectIdeaProposals: async (requestId: string, selectedProposalIds: string[]) => {
    return fetchJson<{ success: boolean; request: IdeaRequest; selectedProposalIds: string[] }>(
      `/api/ir/idea-requests/${requestId}/select-proposals`,
      {
        method: "POST",
        body: JSON.stringify({ selectedProposalIds }),
      }
    );
  },

  acceptIdeaProposal: async (requestId: string, proposalId: string) => {
    return fetchJson<{ success: boolean; project: IRProject; request: IdeaRequest }>(`/api/ir/idea-requests/${requestId}/accept-proposal`, {
      method: "POST",
      body: JSON.stringify({ proposalId }),
    });
  },

  deleteIdeaRequest: async (id: string) => {
    return fetchJson<{ success: boolean }>(`/api/ir/idea-requests/${id}`, {
      method: "DELETE",
    });
  },

  ideaInterview: async (data: {
    message: string;
    history?: { sender: "user" | "ai"; text: string }[];
    currentDraft?: any;
  }) => {
    return fetchJson<{
      reply: string;
      interviewStep: number;
      isReady: boolean;
      draft?: any;
    }>("/api/ai/idea-interview", {
      method: "POST",
      body: JSON.stringify(data),
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

  updatePost: async (
    id: string,
    postData: Partial<BoardPost> & { author?: string; userRoles?: UserRole[] }
  ) => {
    return fetchJson<{ success: boolean; post: BoardPost }>(`/api/community/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    });
  },

  deletePost: async (id: string, requesterInfo?: { author?: string; userRoles?: UserRole[] }) => {
    return fetchJson<{ success: boolean; message: string }>(`/api/community/posts/${id}`, {
      method: "DELETE",
      body: JSON.stringify(requesterInfo || {}),
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

  deleteComment: async (postId: string, commentId: string, requesterInfo?: { author?: string; userRoles?: UserRole[] }) => {
    return fetchJson<{ success: boolean; message: string }>(`/api/community/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
      body: JSON.stringify(requesterInfo || {}),
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

  // ── Notifications & Preferences ──
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

  getNotificationPreferences: async (userId?: string) => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    return fetchJson<{ preferences: NotificationPreference }>(`/api/notifications/preferences${query}`);
  },

  updateNotificationPreferences: async (preferences: Partial<NotificationPreference>, userId?: string) => {
    return fetchJson<{ success: boolean; preferences: NotificationPreference }>("/api/notifications/preferences", {
      method: "PUT",
      body: JSON.stringify({ userId, ...preferences }),
    });
  },

  snoozeNotifications: async (days = 30, userId?: string) => {
    return fetchJson<{ success: boolean; preferences: NotificationPreference; message: string }>("/api/notifications/snooze", {
      method: "POST",
      body: JSON.stringify({ userId, days }),
    });
  },

  unsnoozeNotifications: async (userId?: string) => {
    return fetchJson<{ success: boolean; preferences: NotificationPreference; message: string }>("/api/notifications/unsnooze", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  getNotificationTemplates: async () => {
    return fetchJson<{ templates: NotificationTemplate[] }>("/api/notifications/templates");
  },

  previewEmailTemplate: async (params: {
    title?: string;
    message?: string;
    targetUrl?: string;
    actionLabel?: string;
    category?: string;
    userName?: string;
    userId?: string;
  }) => {
    return fetchJson<{ html: string }>("/api/notifications/preview-email", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  getNotificationLogs: async () => {
    return fetchJson<{ logs: NotificationLog[] }>("/api/notifications/logs");
  },

  testTriggerNotification: async (payload: any) => {
    return fetchJson<{ success: boolean; result: any }>("/api/notifications/test-trigger", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // ── Instructor CRM, Students & Settlements ──
  getInstructorStudents: async (courseId?: string) => {
    const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
    return fetchJson<{ students: CourseStudent[] }>(`/api/instructor/students${query}`);
  },

  completeStudentCourse: async (courseId: string, studentId: string) => {
    return fetchJson<{ success: boolean; student: CourseStudent; message: string }>(
      `/api/instructor/courses/${courseId}/students/${studentId}/complete`,
      {
        method: "POST",
      }
    );
  },

  refundStudentCourse: async (courseId: string, studentId: string, reason?: string) => {
    return fetchJson<{ success: boolean; student: CourseStudent; message: string }>(
      `/api/instructor/courses/${courseId}/students/${studentId}/refund`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    );
  },

  updateStudentProgress: async (courseId: string, studentId: string, progress: number) => {
    return fetchJson<{ success: boolean; student: CourseStudent }>(
      `/api/instructor/courses/${courseId}/students/${studentId}/progress`,
      {
        method: "PATCH",
        body: JSON.stringify({ progress }),
      }
    );
  },

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

  changeMemberStatus: async (id: string, status: MemberStatus, withdrawalReason?: string) => {
    return fetchJson<{ member: AdminMember }>(`/api/admin/members/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, withdrawalReason }),
    });
  },

  forceWithdrawMember: async (id: string, reason: string) => {
    return fetchJson<{ member: AdminMember; notification: any }>(`/api/admin/members/${id}/force-withdraw`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  getAdminMemberActivity: async (id: string) => {
    return fetchJson<{ activity: MemberActivity }>(`/api/admin/members/${id}/activity`);
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

  getAdminIRProjects: async () => {
    return fetchJson<{ projects: IRProject[] }>("/api/admin/ir-projects");
  },

  updateAdminIRProjectStatus: async (id: string, status?: string, isAnonymous?: boolean) => {
    return fetchJson<{ project: IRProject }>(`/api/admin/ir-projects/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, isAnonymous }),
    });
  },

  getAdminIdeaRequests: async () => {
    return fetchJson<{ ideaRequests: IdeaRequest[]; ideaProposals: IdeaProposal[] }>("/api/admin/idea-requests");
  },

  updateAdminIdeaRequestStatus: async (id: string, status: string) => {
    return fetchJson<{ ideaRequest: IdeaRequest }>(`/api/admin/idea-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  getAdminCategoryInsights: async () => {
    return fetchJson<{ insights: AdminCategoryInsight[] }>("/api/admin/category-insights");
  },

  getAdminProposals: async () => {
    return fetchJson<{
      investmentProposals: InvestmentProposal[];
      ideaProposals: IdeaProposal[];
      courseProposals: CourseProposal[];
    }>("/api/admin/proposals");
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

  aiAutoFill: async (data: {
    type: "course_request" | "course" | "course_proposal" | "idea_request" | "ir_project" | "idea_proposal" | "investment_proposal" | string;
    prompt: string;
    context?: any;
  }) => {
    return fetchJson<{ result: any }>("/api/ai/auto-fill", {
      method: "POST",
      body: JSON.stringify(data),
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

  deleteCommonCode: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchJson<{ success: boolean; message: string }>(`/api/common/codes/${id}`, {
      method: "DELETE",
    });
  },

  createCodeGroup: async (groupData: Partial<CodeGroup>): Promise<{ group: CodeGroup }> => {
    return fetchJson<{ group: CodeGroup }>("/api/common/groups", {
      method: "POST",
      body: JSON.stringify(groupData),
    });
  },

  updateCodeGroup: async (groupCode: string, updates: Partial<CodeGroup>): Promise<{ group: CodeGroup }> => {
    return fetchJson<{ group: CodeGroup }>(`/api/common/groups/${groupCode}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  deleteCodeGroup: async (groupCode: string): Promise<{ success: boolean; message: string }> => {
    return fetchJson<{ success: boolean; message: string }>(`/api/common/groups/${groupCode}`, {
      method: "DELETE",
    });
  },
};

