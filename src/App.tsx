import React from "react";
import GNB from "./components/GNB";
import AuthModal from "./components/AuthModal";
import MainPage from "./components/MainPage";
import CoursePage from "./components/CoursePage";
import IRPage from "./components/IRPage";
import CommunityPage from "./components/CommunityPage";
import MemberDashboard from "./components/MemberDashboard";
import InstructorDashboard from "./components/InstructorDashboard";
import InvestorDashboard from "./components/InvestorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ProfilePage from "./components/ProfilePage";
import AITutorWidget from "./components/common/AITutorWidget";
import { useToast } from "./components/common/Toast";
import { api } from "./lib/api";
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

export default function App() {
  // Auth state (LocalStorage 기반 세션 복원)
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(() => !!localStorage.getItem("auth_token"));
  const [userRole, setUserRole] = React.useState<UserRole>(() => {
    const saved = localStorage.getItem("user_role");
    return (saved === "admin" || saved === "member") ? saved : "member";
  });
  const [userAssignedRoles, setUserAssignedRoles] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("user_assigned_roles");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [userName, setUserName] = React.useState<string>(() => localStorage.getItem("user_name") || "게스트");
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const toast = useToast();

  const saveSession = React.useCallback((token: string, user: { name: string; role: UserRole; assignedRoles?: string[] }) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_name", user.name);
    localStorage.setItem("user_role", user.role);
    localStorage.setItem("user_assigned_roles", JSON.stringify(user.assignedRoles || []));
  }, []);

  const clearSession = React.useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_assigned_roles");
  }, []);

  // Navigation & Selection
  const [currentPage, setCurrentPage] = React.useState("home");
  const [dashboardTab, setDashboardTab] = React.useState<"member" | "instructor" | "investor">("member");
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null);

  // Data state
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [irProjects, setIrProjects] = React.useState<IRProject[]>([]);
  const [posts, setPosts] = React.useState<BoardPost[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [teamRequests, setTeamRequests] = React.useState<TeamBuildingRequest[]>([]);
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [settlements, setSettlements] = React.useState<SettlementRecord[]>([]);
  const [proposals, setProposals] = React.useState<InvestmentProposal[]>([]);
  const [recommendations, setRecommendations] = React.useState<AIRecommendation[]>([]);
  const [adminMembers, setAdminMembers] = React.useState<AdminMember[]>([]);
  const [adminBoards, setAdminBoards] = React.useState<AdminBoard[]>([]);
  const [adminStats, setAdminStats] = React.useState<DashboardStats | null>(null);

  const [loading, setLoading] = React.useState(true);

  // Load initial data from backend API
  const refreshData = React.useCallback(async () => {
    try {
      const [
        coursesRes,
        irRes,
        postsRes,
        notifsRes,
        teamRes,
        paymentsRes,
        settlementsRes,
        proposalsRes,
        recsRes,
        membersRes,
        boardsRes,
        statsRes,
      ] = await Promise.all([
        api.getCourses(),
        api.getIRProjects(),
        api.getPosts(),
        api.getNotifications(),
        api.getTeamRequests(),
        api.getPayments(),
        api.getSettlements(),
        api.getProposals(),
        api.getAIRecommendations(),
        api.getAdminMembers(),
        api.getAdminBoards(),
        api.getAdminStats(),
      ]);

      setCourses(coursesRes.courses || []);
      setIrProjects(irRes.projects || []);
      setPosts(postsRes.posts || []);
      setNotifications(notifsRes.notifications || []);
      setTeamRequests(teamRes.requests || []);
      setPayments(paymentsRes.payments || []);
      setSettlements(settlementsRes.settlements || []);
      setProposals(proposalsRes.proposals || []);
      setRecommendations(recsRes.recommendations || []);
      setAdminMembers(membersRes.members || []);
      setAdminBoards(boardsRes.boards || []);
      setAdminStats(statsRes.stats || null);
    } catch (error) {
      console.error("Failed to load initial data from backend:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const authProcessedRef = React.useRef(false);

  React.useEffect(() => {
    refreshData();
    
    // URL에서 token과 role 읽기 (OAuth 콜백 처리 - 중복 실행 방지)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");
    
    if (error && !authProcessedRef.current) {
      authProcessedRef.current = true;
      window.history.replaceState({}, document.title, window.location.pathname);
      toast.error("로그인 실패", `오류 코드: ${error}`);
    } else if (token && !authProcessedRef.current) {
      authProcessedRef.current = true;
      // 즉시 URL 쿼리 파라미터를 제거하여 중복 호출 방지
      window.history.replaceState({}, document.title, window.location.pathname);
      
      api.getMe(token).then(res => {
        if (res.user) {
          saveSession(token, res.user);
          setIsLoggedIn(true);
          setUserName(res.user.name);
          setUserRole(res.user.role);
          setUserAssignedRoles(res.user.assignedRoles || []);
          toast.success("로그인 성공", `${res.user.name}님 환영합니다!`);
        }
      }).catch(err => {
        console.error("Token verification failed:", err);
        clearSession();
        setIsLoggedIn(false);
        setUserName("게스트");
        setUserRole("member");
        setUserAssignedRoles([]);
      });
    } else {
      // 새로고침 시 저장된 토큰으로 세션 검증
      const savedToken = localStorage.getItem("auth_token");
      if (savedToken) {
        api.getMe(savedToken).then(res => {
          if (res.user) {
            saveSession(savedToken, res.user);
            setIsLoggedIn(true);
            setUserName(res.user.name);
            setUserRole(res.user.role);
            setUserAssignedRoles(res.user.assignedRoles || []);
          }
        }).catch(err => {
          console.warn("Saved token session invalid:", err);
          clearSession();
          setIsLoggedIn(false);
          setUserName("게스트");
          setUserRole("member");
          setUserAssignedRoles([]);
        });
      }
    }
  }, [refreshData, toast, saveSession, clearSession]);

  // Handlers
  const handleLogin = async (role: UserRole, email?: string) => {
    try {
      const res = await api.login(role, email);
      saveSession(res.token, res.user);
      setIsLoggedIn(true);
      setUserName(res.user.name);
      setUserRole(res.user.role);
      setUserAssignedRoles(res.user.assignedRoles || []);
      refreshData();
    } catch (error) {
      console.error("Login API call failed:", error);
    }
  };

  const handleLogout = () => {
    clearSession();
    setIsLoggedIn(false);
    setUserRole("member");
    setUserAssignedRoles([]);
    setUserName("게스트");
    setCurrentPage("home");
  };

  const handleEnroll = async (courseId: string, paymentMethod: "카드" | "계좌이체" | "카카오페이" = "카드") => {
    try {
      if (paymentMethod === "카카오페이") {
        const course = courses.find((c) => c.id === courseId);
        if (!course) return;
        const res = await api.enrollWithKakaoPay({
          itemName: course.title,
          totalAmount: course.discountedPrice || course.price,
          orderId: courseId,
          userId: userName
        });
        if (res.next_redirect_pc_url) {
          window.location.href = res.next_redirect_pc_url;
        }
        return;
      }

      const res = await api.enrollCourse(courseId, paymentMethod as "카드" | "계좌이체");
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, isEnrolled: true, progress: 0 } : c))
      );
      if (res.payment) {
        setPayments((prev) => [res.payment, ...prev]);
      }
      refreshData();
      toast.success("결제 완료", "수강 신청 및 결제가 완료되었습니다!");
    } catch (error) {
      console.error("Enrollment failed:", error);
      toast.error("결제 실패", "수강 신청에 실패했습니다.");
    }
  };

  const handleToggleBookmark = async (projectId: string) => {
    try {
      const res = await api.toggleBookmark(projectId);
      setIrProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, bookmarked: res.bookmarked } : p))
      );
      refreshData();
    } catch (error) {
      console.error("Bookmark toggle failed:", error);
      setIrProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, bookmarked: !p.bookmarked } : p))
      );
    }
  };

  const handleAddPost = async (post: Omit<BoardPost, "id" | "viewCount" | "commentCount" | "authorAvatar">) => {
    try {
      const res = await api.createPost({
        ...post,
        author: userName,
      });
      setPosts((prev) => [res.post, ...prev]);
      refreshData();
      toast.success("게시글 작성 성공");
    } catch (error) {
      console.error("Add post failed:", error);
      toast.error("게시글 작성 실패");
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Mark notification read failed:", error);
    }
  };

  const handleSaveCourse = async (newCourse: Course) => {
    try {
      const res = await api.saveCourse(newCourse);
      setCourses((prev) => [res.course, ...prev]);
      refreshData();
      toast.success("강의 개설 성공", "강의가 성공적으로 개설/등록되었습니다.");
    } catch (error) {
      console.error("Save course failed:", error);
      toast.error("강의 개설 실패");
    }
  };

  const handleSendCRMMessage = async (msg: Omit<CRMMessage, "id" | "sentAt">) => {
    try {
      await api.sendCRMMessage(msg);
      refreshData();
      toast.success("메시지 발송 성공", "수강생 대상 타깃 CRM 메시지가 발송되었습니다.");
    } catch (error) {
      console.error("Send CRM message failed:", error);
      toast.error("메시지 발송 실패");
    }
  };

  const handleAdminChangeRole = async (memberId: string, newRole: UserRole) => {
    try {
      await api.changeMemberRole(memberId, newRole);
      setAdminMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (error) {
      console.error("Change member role failed:", error);
    }
  };

  const handleApproveCourse = async (courseId: string) => {
    try {
      await api.approveCourse(courseId);
      refreshData();
      toast.success("승인 완료", `강의(${courseId})가 승인되었습니다.`);
    } catch (error) {
      console.error("Approve course failed:", error);
      toast.error("승인 실패");
    }
  };

  const handleRejectCourse = async (courseId: string) => {
    try {
      await api.rejectCourse(courseId);
      refreshData();
      toast.success("반려 완료", `강의(${courseId})가 반려되었습니다.`);
    } catch (error) {
      console.error("Reject course failed:", error);
      toast.error("반려 실패");
    }
  };

  const handleSaveProject = async (project: IRProject) => {
    try {
      const res = await api.saveIRProject(project);
      setIrProjects((prev) => {
        const idx = prev.findIndex((p) => p.id === res.project.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = res.project;
          return updated;
        }
        return [res.project, ...prev];
      });
      refreshData();
      toast.success("저장 완료", "스타트업 프로젝트가 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("Save project failed:", error);
      toast.error("저장 실패", "프로젝트 저장에 실패했습니다.");
    }
  };

  const handleRefundPayment = (updatedPayment: PaymentRecord) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
    );
    refreshData();
  };

  const handleSendProposal = (proposal: InvestmentProposal) => {
    setProposals((prev) => [proposal, ...prev]);
    refreshData();
  };

  const handleUpdateTeamRequest = async (id: string, status: "수락" | "거절") => {
    try {
      await api.updateTeamRequestStatus(id, status);
      setTeamRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      refreshData();
      toast.success("처리 완료", `팀 빌딩 제안이 '${status}' 처리되었습니다.`);
    } catch (error) {
      console.error("Update team request failed:", error);
      toast.error("처리 실패");
    }
  };

  const handleViewCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentPage("courses");
  };

  const handleViewIR = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPage("ir");
  };

  const handleViewPost = (postId: string) => {
    setSelectedPostId(postId);
    setCurrentPage("community");
  };

  // Pending courses for admin review
  const pendingCourses = courses.filter((c) => c.status === "종료" || c.status === "모집중");

  // Render dashboard based on role
  const renderDashboard = () => {
    switch (userRole) {
      case "member":
        const isInstructor = userAssignedRoles.includes("course_instructor");
        const isInvestor = userAssignedRoles.includes("investor_active");
        
        return (
          <div className="flex flex-col space-y-4">
            {(isInstructor || isInvestor) && (
              <div className="flex justify-center mt-6 mb-2">
                <div className="flex gap-2 p-1.5 glass-panel-heavy rounded-2xl shadow-xl border border-brand-border bg-brand-surface/80 backdrop-blur-md">
                  <button onClick={() => setDashboardTab("member")} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${dashboardTab === 'member' ? 'bg-gradient-to-r from-brand-primary-container to-brand-primary text-white shadow-md' : 'text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-low'}`}>
                    🎓 수강생 대시보드
                  </button>
                  {isInstructor && (
                    <button onClick={() => setDashboardTab("instructor")} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${dashboardTab === 'instructor' ? 'bg-gradient-to-r from-brand-secondary to-brand-tertiary text-white shadow-md' : 'text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-low'}`}>
                      👨‍🏫 강사 대시보드
                    </button>
                  )}
                  {isInvestor && (
                    <button onClick={() => setDashboardTab("investor")} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${dashboardTab === 'investor' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' : 'text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-low'}`}>
                      💼 투자자 대시보드
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {dashboardTab === "member" && (
              <MemberDashboard
                enrolledCourses={courses}
                teamRequests={teamRequests}
                payments={payments}
                notifications={notifications}
                myProjects={irProjects.filter((p) => p.members?.some((m) => m.name === "김수강생"))}
                onViewCourse={handleViewCourse}
                onViewIR={handleViewIR}
                onSaveProject={handleSaveProject}
                onRefundPayment={handleRefundPayment}
                onUpdateTeamRequest={handleUpdateTeamRequest}
              />
            )}
            {dashboardTab === "instructor" && isInstructor && (
              <InstructorDashboard
                myCourses={courses.filter((c) => c.instructor.includes("김소현") || c.instructor.includes("김수강생"))}
                settlements={settlements}
                onSaveCourse={handleSaveCourse}
                onSendCRMMessage={handleSendCRMMessage}
                onViewCourse={handleViewCourse}
              />
            )}
            {dashboardTab === "investor" && isInvestor && (
              <InvestorDashboard
                bookmarkedProjects={irProjects.filter((p) => p.bookmarked)}
                recommendations={recommendations}
                proposals={proposals}
                onViewProject={handleViewIR}
                onRemoveBookmark={handleToggleBookmark}
              />
            )}
          </div>
        );
      case "admin":
        return (
          <AdminDashboard
            stats={
              adminStats || {
                dailySignups: 42,
                monthlySignups: 1280,
                totalRevenue: 84200000,
                monthlyRevenue: 28400000,
                activeCourses: courses.length,
                teamMatchCount: 38,
                investmentMatchCount: 12,
              }
            }
            members={adminMembers}
            boards={adminBoards}
            pendingCourses={pendingCourses.slice(0, 2)}
            onChangeRole={handleAdminChangeRole}
            onApproveCourse={handleApproveCourse}
            onRejectCourse={handleRejectCourse}
            onViewCourse={handleViewCourse}
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
            onViewPost={handleViewPost}
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
            userName={userName}
            onLoginClick={() => setShowAuthModal(true)}
            onSaveCourse={handleSaveCourse}
            initialCourseId={selectedCourseId}
            onClearSelectedCourse={() => setSelectedCourseId(null)}
          />
        );
      case "ir":
        return (
          <IRPage
            projects={irProjects}
            userRole={userRole}
            userAssignedRoles={userAssignedRoles}
            isLoggedIn={isLoggedIn}
            userName={userName}
            onLoginClick={() => setShowAuthModal(true)}
            onToggleBookmark={handleToggleBookmark}
            onSendProposal={handleSendProposal}
            initialProjectId={selectedProjectId}
            onClearSelectedProject={() => setSelectedProjectId(null)}
          />
        );
      case "community":
        return (
          <CommunityPage
            posts={posts}
            onAddPost={handleAddPost}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            userName={userName}
            onLoginClick={() => setShowAuthModal(true)}
            initialPostId={selectedPostId}
            onClearSelectedPost={() => setSelectedPostId(null)}
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
            stats={
              adminStats || {
                dailySignups: 42,
                monthlySignups: 1280,
                totalRevenue: 84200000,
                monthlyRevenue: 28400000,
                activeCourses: courses.length,
                teamMatchCount: 38,
                investmentMatchCount: 12,
              }
            }
            members={adminMembers}
            boards={adminBoards}
            pendingCourses={pendingCourses.slice(0, 2)}
            onChangeRole={handleAdminChangeRole}
            onApproveCourse={handleApproveCourse}
            onRejectCourse={handleRejectCourse}
            onViewCourse={handleViewCourse}
          />
        );
      case "profile":
        return (
          <ProfilePage
            isLoggedIn={isLoggedIn}
            userName={userName}
            userRole={userRole}
            onNavigate={setCurrentPage}
            onLoginClick={() => setShowAuthModal(true)}
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

        <AITutorWidget
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
        />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
