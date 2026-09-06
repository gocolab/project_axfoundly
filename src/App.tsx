import React from "react";
import GNB from "./components/GNB";
import AuthModal from "./components/AuthModal";
import MainPage from "./components/MainPage";
import CoursePage from "./components/CoursePage";
import IRPage from "./components/IRPage";
import CommunityPage from "./components/CommunityPage";
import MyPage from "./components/MyPage";
import AdminDashboard from "./components/AdminDashboard";
import Footer from "./components/Footer";
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
  const [userRoles, setUserRoles] = React.useState<UserRole[]>(() => {
    try {
      const saved = localStorage.getItem("user_roles");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["member"];
    } catch {
      return ["member"];
    }
  });
  const [userName, setUserName] = React.useState<string>(() => localStorage.getItem("user_name") || "게스트");
  const [userAvatar, setUserAvatar] = React.useState<string>(() => localStorage.getItem("user_avatar") || "");
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const toast = useToast();

  const saveSession = React.useCallback((token: string, user: { name: string; roles: UserRole[]; avatar?: string }) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_name", user.name);
    localStorage.setItem("user_roles", JSON.stringify(user.roles));
    localStorage.setItem("user_avatar", user.avatar || "");
  }, []);

  const clearSession = React.useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_roles");
    localStorage.removeItem("user_avatar");
  }, []);

  // Navigation & Selection (URL 동기화)
  const getInitialRoute = () => {
    const path = window.location.pathname;
    if (path.startsWith("/courses")) {
      const match = path.match(/^\/courses\/([^/]+)/);
      return { page: "courses", courseId: match ? match[1] : null, projectId: null, postId: null };
    }
    if (path.startsWith("/ir")) {
      const match = path.match(/^\/ir\/([^/]+)/);
      return { page: "ir", courseId: null, projectId: match ? match[1] : null, postId: null };
    }
    if (path.startsWith("/community")) {
      const match = path.match(/^\/community\/([^/]+)/);
      return { page: "community", courseId: null, projectId: null, postId: match ? match[1] : null };
    }
    if (path.startsWith("/mypage") || path.startsWith("/dashboard")) {
      return { page: "dashboard", courseId: null, projectId: null, postId: null };
    }
    if (path.startsWith("/admin")) {
      return { page: "admin", courseId: null, projectId: null, postId: null };
    }
    return { page: "home", courseId: null, projectId: null, postId: null };
  };

  const initialRoute = getInitialRoute();
  const [currentPage, setCurrentPageRaw] = React.useState<string>(initialRoute.page);
  const [dashboardTab, setDashboardTab] = React.useState<"member" | "instructor" | "investor">("member");
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(initialRoute.courseId);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(initialRoute.projectId);
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(initialRoute.postId);

  const setCurrentPage = React.useCallback((page: string, pushHistory = true) => {
    setCurrentPageRaw(page);
    if (page !== "courses") setSelectedCourseId(null);
    if (page !== "ir") setSelectedProjectId(null);
    if (page !== "community") setSelectedPostId(null);

    if (pushHistory) {
      const pathMap: Record<string, string> = {
        home: "/",
        courses: "/courses",
        ir: "/ir",
        community: "/community",
        dashboard: "/mypage",
        admin: "/admin",
      };
      const newPath = pathMap[page] || "/";
      if (window.location.pathname !== newPath) {
        window.history.pushState({ page }, "", newPath);
      }
    }
  }, []);

  // Popstate listener for back/forward browser buttons
  React.useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      setCurrentPageRaw(route.page);
      setSelectedCourseId(route.courseId);
      setSelectedProjectId(route.projectId);
      setSelectedPostId(route.postId);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
          setUserRoles(res.user.roles);
          setUserAvatar(res.user.avatar || "");
          toast.success("로그인 성공", `${res.user.name}님 환영합니다!`);
        }
      }).catch(err => {
        console.error("Token verification failed:", err);
        clearSession();
        setIsLoggedIn(false);
        setUserName("게스트");
        setUserRoles(["member"]);
        setUserAvatar("");
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
            setUserRoles(res.user.roles);
            setUserAvatar(res.user.avatar || "");
          }
        }).catch(err => {
          console.warn("Saved token session invalid:", err);
          clearSession();
          setIsLoggedIn(false);
          setUserName("게스트");
          setUserRoles(["member"]);
          setUserAvatar("");
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleLogin = async (roles: UserRole[], email?: string) => {
    try {
      const res = await api.login(roles, email);
      saveSession(res.token, res.user);
      setIsLoggedIn(true);
      setUserName(res.user.name);
      setUserRoles(res.user.roles);
      setUserAvatar(res.user.avatar || "");
      refreshData();
    } catch (error) {
      console.error("Login API call failed:", error);
    }
  };

  const handleLogout = () => {
    clearSession();
    setIsLoggedIn(false);
    setUserRoles(["member"]);
    setUserName("게스트");
    setUserAvatar("");
    setCurrentPage("home");
  };

  const handleEnroll = async (courseId: string, paymentMethod: "카카오페이" = "카카오페이") => {
    try {
      const course = courses.find((c) => c.id === courseId);
      if (!course) return;

      try {
        const res = await api.enrollWithKakaoPay({
          itemName: course.title,
          totalAmount: course.discountedPrice || course.price,
          orderId: courseId,
          userId: userName
        });
        if (res.next_redirect_pc_url) {
          window.location.href = res.next_redirect_pc_url;
          return;
        }
      } catch (e) {
        console.warn("KakaoPay ready fallback to local enrollment", e);
      }

      const res = await api.enrollCourse(courseId, "카카오페이");
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, isEnrolled: true, progress: 0 } : c))
      );
      if (res.payment) {
        setPayments((prev) => [res.payment, ...prev]);
      }
      refreshData();
      toast.success("결제 완료", "카카오페이 결제 및 수강 신청이 완료되었습니다!");
    } catch (error) {
      console.error("Enrollment failed:", error);
      toast.error("결제 실패", "수강 신청에 실패했습니다.");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await api.deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      refreshData();
      toast.success("강의 삭제", "강의가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("Delete course failed:", error);
      toast.error("강의 삭제 실패", "강의 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDuplicateCourse = async (courseId: string) => {
    try {
      const res = await api.duplicateCourse(courseId);
      if (res.course) {
        setCourses((prev) => [res.course, ...prev]);
        refreshData();
        toast.success("강의 복제 완료", `'${res.course.title}' 강의가 성공적으로 등록되었습니다.`);
        return res.course;
      }
    } catch (error) {
      console.error("Duplicate course failed:", error);
      toast.error("강의 복제 실패", "강의를 복제하는 중 오류가 발생했습니다.");
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
        authorRoles: userRoles,
      });
      setPosts((prev) => [res.post, ...prev]);
      refreshData();
      toast.success("게시글 작성 성공");
    } catch (error) {
      console.error("Add post failed:", error);
      toast.error("게시글 작성 실패");
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    refreshData();
  };

  const handleUpdatePost = (updatedPost: BoardPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
    refreshData();
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

  const handleAdminChangeRole = async (memberId: string, newRoles: UserRole[]) => {
    try {
      await api.changeMemberRole(memberId, newRoles);
      setAdminMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, roles: newRoles } : m))
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

  const handleForceDeleteCourse = async (courseId: string) => {
    try {
      await api.deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      refreshData();
    } catch (error) {
      console.error("Force delete course failed:", error);
      toast.error("삭제 실패", "강의 강제 삭제 중 오류가 발생했습니다.");
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
    setCurrentPageRaw("courses");
    const targetPath = `/courses/${courseId}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: "courses", courseId }, "", targetPath);
    }
  };

  const handleClearSelectedCourse = () => {
    setSelectedCourseId(null);
    if (window.location.pathname !== "/courses") {
      window.history.pushState({ page: "courses" }, "", "/courses");
    }
  };

  const handleViewIR = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPageRaw("ir");
    const targetPath = `/ir/${projectId}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: "ir", projectId }, "", targetPath);
    }
  };

  const handleClearSelectedProject = () => {
    setSelectedProjectId(null);
    if (window.location.pathname !== "/ir") {
      window.history.pushState({ page: "ir" }, "", "/ir");
    }
  };

  const handleViewPost = (postId: string) => {
    setSelectedPostId(postId);
    setCurrentPageRaw("community");
    const targetPath = `/community/${postId}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: "community", postId }, "", targetPath);
    }
  };

  const handleClearSelectedPost = () => {
    setSelectedPostId(null);
    if (window.location.pathname !== "/community") {
      window.history.pushState({ page: "community" }, "", "/community");
    }
  };

  // Pending courses for admin review
  const pendingCourses = courses.filter((c) => c.status === "종료" || c.status === "모집중");

  // Render dashboard based on role
  const renderDashboard = () => {
    return (
      <MyPage
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRoles={userRoles}
        courses={courses}
        teamRequests={teamRequests}
        payments={payments}
        notifications={notifications}
        irProjects={irProjects}
        settlements={settlements}
        recommendations={recommendations}
        proposals={proposals}
        onNavigate={setCurrentPage}
        onLoginClick={() => setShowAuthModal(true)}
        handleViewCourse={handleViewCourse}
        handleViewIR={handleViewIR}
        handleSaveProject={handleSaveProject}
        handleRefundPayment={handleRefundPayment}
        handleUpdateTeamRequest={handleUpdateTeamRequest}
        handleSaveCourse={handleSaveCourse}
        handleSendCRMMessage={handleSendCRMMessage}
        handleToggleBookmark={handleToggleBookmark}
        handleDuplicateCourse={handleDuplicateCourse}
      />
    );
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
            userRoles={userRoles}
            userName={userName}
            onLoginClick={() => setShowAuthModal(true)}
            onSaveCourse={handleSaveCourse}
            onDeleteCourse={handleDeleteCourse}
            onDuplicateCourse={handleDuplicateCourse}
            initialCourseId={selectedCourseId}
            onSelectCourse={handleViewCourse}
            onClearSelectedCourse={handleClearSelectedCourse}
          />
        );
      case "ir":
        return (
          <IRPage
            projects={irProjects}
            userRoles={userRoles}
            isLoggedIn={isLoggedIn}
            userName={userName}
            onLoginClick={() => setShowAuthModal(true)}
            onToggleBookmark={handleToggleBookmark}
            onSendProposal={handleSendProposal}
            onSaveProject={handleSaveProject}
            initialProjectId={selectedProjectId}
            onSelectProject={handleViewIR}
            onClearSelectedProject={handleClearSelectedProject}
          />
        );
      case "community":
        return (
          <CommunityPage
            posts={posts}
            onAddPost={handleAddPost}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
            isLoggedIn={isLoggedIn}
            userRoles={userRoles}
            userName={userName}
            onLoginClick={() => setShowAuthModal(true)}
            initialPostId={selectedPostId}
            onSelectPost={handleViewPost}
            onClearSelectedPost={handleClearSelectedPost}
            adminBoards={adminBoards}
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
        if (!isLoggedIn || !userRoles.includes("admin")) {
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
            courses={courses}
            onChangeRole={handleAdminChangeRole}
            onApproveCourse={handleApproveCourse}
            onRejectCourse={handleRejectCourse}
            onForceDeleteCourse={handleForceDeleteCourse}
            onViewCourse={handleViewCourse}
            onBoardCreated={(newBoard) => {
              setAdminBoards((prev) => [newBoard, ...prev]);
              refreshData();
            }}
            onBoardDeleted={(deletedId) => {
              setAdminBoards((prev) => prev.filter((b) => b.id !== deletedId));
              refreshData();
            }}
            onRefresh={refreshData}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-on-surface font-sans selection:bg-brand-primary-container selection:text-white">
      <GNB
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoggedIn={isLoggedIn}
        userRoles={userRoles}
        userName={userName}
        userAvatar={userAvatar}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
      />

      <main className="flex-1 pb-16">{renderPage()}</main>

      <Footer />

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
