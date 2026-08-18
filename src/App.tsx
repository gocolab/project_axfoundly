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
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userRole, setUserRole] = React.useState<UserRole>("student");
  const [userName, setUserName] = React.useState("게스트");
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  // Navigation
  const [currentPage, setCurrentPage] = React.useState("home");

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

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handlers
  const handleLogin = async (role: UserRole) => {
    const names: Record<UserRole, string> = {
      student: "김수강생",
      instructor: "김소현",
      investor: "이벤처",
      admin: "최관리",
    };
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(names[role]);

    try {
      const res = await api.login(role);
      setUserName(res.user.name);
      refreshData();
    } catch (error) {
      console.error("Login API call failed:", error);
    }
  };


  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("student");
    setUserName("게스트");
    setCurrentPage("home");
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const res = await api.enrollCourse(courseId, "카드");
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, isEnrolled: true, progress: 0 } : c))
      );
      if (res.payment) {
        setPayments((prev) => [res.payment, ...prev]);
      }
      refreshData();
      alert("수강 신청 및 결제가 완료되었습니다!");
    } catch (error) {
      console.error("Enrollment failed:", error);
      alert("수강 신청에 실패했습니다.");
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
    } catch (error) {
      console.error("Create post failed:", error);
      alert("게시글 작성에 실패했습니다.");
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
      alert("강의가 성공적으로 개설/등록되었습니다.");
    } catch (error) {
      console.error("Save course failed:", error);
      alert("강의 개설에 실패했습니다.");
    }
  };

  const handleSendCRMMessage = async (msg: Omit<CRMMessage, "id" | "sentAt">) => {
    try {
      await api.sendCRMMessage(msg);
      refreshData();
      alert("수강생 대상 타깃 CRM 메시지가 발송되었습니다.");
    } catch (error) {
      console.error("Send CRM failed:", error);
      alert("CRM 메시지 발송에 실패했습니다.");
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
      alert(`강의(${courseId})가 승인되었습니다.`);
    } catch (error) {
      console.error("Approve course failed:", error);
    }
  };

  const handleRejectCourse = async (courseId: string) => {
    try {
      await api.rejectCourse(courseId);
      refreshData();
      alert(`강의(${courseId})가 반려되었습니다.`);
    } catch (error) {
      console.error("Reject course failed:", error);
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
      alert("스타트업 프로젝트가 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("Save project failed:", error);
      alert("프로젝트 저장에 실패했습니다.");
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
      alert(`팀 빌딩 제안이 '${status}' 처리되었습니다.`);
    } catch (error) {
      console.error("Update team request failed:", error);
    }
  };

  const handleViewCourse = (courseId: string) => {
    setCurrentPage("courses");
  };

  const handleViewIR = (projectId: string) => {
    setCurrentPage("ir");
  };

  // Pending courses for admin review
  const pendingCourses = courses.filter((c) => c.status === "종료" || c.status === "모집중");

  // Render dashboard based on role
  const renderDashboard = () => {
    switch (userRole) {
      case "student":
        return (
          <StudentDashboard
            enrolledCourses={courses}
            teamRequests={teamRequests}
            payments={payments}
            notifications={notifications}
            myProjects={irProjects.filter((p) => p.members?.some((m) => m.name === "김수강생"))}
            onViewCourse={handleViewCourse}
            onSaveProject={handleSaveProject}
            onRefundPayment={handleRefundPayment}
            onUpdateTeamRequest={handleUpdateTeamRequest}
          />
        );
      case "instructor":
        return (
          <InstructorDashboard
            myCourses={courses.filter((c) => c.instructor.includes("김소현") || c.instructor.includes("김수강생"))}
            settlements={settlements}
            onSaveCourse={handleSaveCourse}
            onSendCRMMessage={handleSendCRMMessage}
          />
        );
      case "investor":
        return (
          <InvestorDashboard
            bookmarkedProjects={irProjects.filter((p) => p.bookmarked)}
            recommendations={recommendations}
            proposals={proposals}
            onViewProject={handleViewIR}
            onRemoveBookmark={handleToggleBookmark}
          />
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
            onSendProposal={handleSendProposal}
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
