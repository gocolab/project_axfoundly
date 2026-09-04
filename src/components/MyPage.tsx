import React from "react";
import {
  User,
  GraduationCap,
  Briefcase,
  CreditCard,
  CheckCircle,
  Mail,
  Calendar,
  Edit3,
  Save,
  ArrowLeft,
  Shield,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Receipt,
  Heart,
  Settings,
} from "lucide-react";
import type {
  UserRole,
  Course,
  Notification,
  PaymentRecord,
  SettlementRecord,
  TeamBuildingRequest,
  InvestmentProposal,
  AIRecommendation,
  IRProject,
  CRMMessage,
  IdeaRequest,
} from "../types";
import MyOverview from "./MyOverview";
import MyCoursesView from "./MyCoursesView";
import MyStartupView from "./MyStartupView";
import InstructorDashboard from "./InstructorDashboard";
import InvestorDashboard from "./InvestorDashboard";
import AccountSettingsView from "./AccountSettingsView";
import IdeaRequestModal from "./IdeaRequestModal";

export type MyPageTabId =
  | "overview"
  | "courses"
  | "startup"
  | "instructor"
  | "investor"
  | "settings";

interface MyPageProps {
  isLoggedIn: boolean;
  userName: string;
  userRoles: UserRole[];
  courses: Course[];
  teamRequests: TeamBuildingRequest[];
  payments: PaymentRecord[];
  notifications: Notification[];
  irProjects: IRProject[];
  settlements: SettlementRecord[];
  recommendations: AIRecommendation[];
  proposals: InvestmentProposal[];
  onNavigate: (page: string) => void;
  onLoginClick: () => void;

  // Dashboard Handlers
  handleViewCourse: (id: string) => void;
  handleViewIR: (id: string) => void;
  handleSaveProject: (project: IRProject) => void;
  handleRefundPayment: (updatedPayment: PaymentRecord) => void;
  handleUpdateTeamRequest: (id: string, status: "수락" | "거절") => void;
  handleSaveCourse: (course: Course) => void;
  handleSendCRMMessage: (msg: any) => void;
  handleToggleBookmark: (id: string) => void;
}

export default function MyPage({
  isLoggedIn,
  userName,
  userRoles,
  courses,
  teamRequests,
  payments,
  notifications,
  irProjects,
  settlements,
  recommendations,
  proposals,
  onNavigate,
  onLoginClick,
  handleViewCourse,
  handleViewIR,
  handleSaveProject,
  handleRefundPayment,
  handleUpdateTeamRequest,
  handleSaveCourse,
  handleSendCRMMessage,
  handleToggleBookmark,
}: MyPageProps) {
  const getInitialTab = (): MyPageTabId => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["overview", "courses", "startup", "instructor", "investor", "settings"].includes(tabParam)) {
      return tabParam as MyPageTabId;
    }
    return "overview";
  };

  const [activeTab, setActiveTabRaw] = React.useState<MyPageTabId>(getInitialTab);
  const [isProjectModalOpenExternal, setIsProjectModalOpenExternal] = React.useState(false);

  const setActiveTab = React.useCallback((tab: MyPageTabId) => {
    setActiveTabRaw(tab);
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("tab", tab);
    window.history.replaceState({}, "", currentUrl.toString());
  }, []);

  React.useEffect(() => {
    const handleLocationChange = () => {
      const tab = getInitialTab();
      setActiveTabRaw(tab);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);
  const [isCourseModalOpenExternal, setIsCourseModalOpenExternal] = React.useState(false);
  const [showIdeaRequestModal, setShowIdeaRequestModal] = React.useState(false);
  const [deletedProjectIds, setDeletedProjectIds] = React.useState<string[]>([]);

  const handleDeleteProject = (projectId: string) => {
    setDeletedProjectIds((prev) => [...prev, projectId]);
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-surface-low border border-brand-border flex items-center justify-center">
          <User size={28} className="text-brand-on-surface-variant" />
        </div>
        <h2 className="font-display text-xl font-bold text-white">로그인이 필요합니다</h2>
        <p className="text-sm text-brand-on-surface-variant">
          마이페이지는 로그인 후 이용하실 수 있습니다.
        </p>
        <button
          onClick={onLoginClick}
          className="mt-2 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm shadow-md"
        >
          Google로 로그인
        </button>
      </div>
    );
  }

  // 6대 통합 메뉴 (수강생, 강사, 투자자 역할 분리 없는 기능 중심 메뉴)
  const tabs: { id: MyPageTabId; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: "overview",
      label: "마이 홈",
      icon: <LayoutDashboard size={16} />,
    },
    {
      id: "courses",
      label: "내 강의실",
      icon: <BookOpen size={16} />,
      badge: courses.filter((c) => c.isEnrolled).length || undefined,
    },
    {
      id: "startup",
      label: "내 스타트업",
      icon: <Briefcase size={16} />,
      badge:
        teamRequests.filter((r) => r.type === "received" && r.status === "대기중").length ||
        undefined,
    },
    {
      id: "instructor",
      label: "강의 개설 & 운영",
      icon: <Sparkles size={16} />,
    },
    {
      id: "investor",
      label: "관심 스타트업 & 투자",
      icon: <Heart size={16} />,
    },
    {
      id: "settings",
      label: "결제 및 계정 설정",
      icon: <Settings size={16} />,
    },
  ];

  // 내 프로젝트 & 내가 개설한 강의 & 팀 빌딩 제안
  const myProjects = irProjects
    .filter((p) => !deletedProjectIds.includes(p.id))
    .filter(
      (p) =>
        p.authorName === userName ||
        p.members?.some((m) => m.name === userName || m.anonymousName === userName)
    );
  const myCreatedCourses = courses.filter((c) => c.instructor.includes(userName));
  const bookmarkedProjects = irProjects.filter((p) => p.bookmarked);
  const myTeamRequests = teamRequests.filter(
    (req) => req.fromUser === userName || req.toUser === userName
  );

  const handleOpenProjectModal = () => {
    setActiveTab("startup");
    setIsProjectModalOpenExternal(true);
  };

  const handleOpenCreateCourseModal = () => {
    setActiveTab("instructor");
    setIsCourseModalOpenExternal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary-container to-brand-primary flex items-center justify-center shadow-md">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">마이페이지</h1>
            <p className="text-xs sm:text-sm text-brand-on-surface-variant">
              올인원 창업가 워크스페이스 (학습 · IR & 팀빌딩 · 강의 개설 · 투자 협업)
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Left Sidebar + Right Content ── */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar Menu */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <nav className="flex md:flex-col gap-1.5 sticky top-20 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsProjectModalOpenExternal(false);
                    setIsCourseModalOpenExternal(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer text-left whitespace-nowrap ${
                    isActive
                      ? "bg-brand-primary-container/20 text-brand-primary border border-brand-primary-container/40 shadow-sm font-bold"
                      : "text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive
                          ? "bg-brand-primary text-white"
                          : "bg-brand-surface-highest text-brand-on-surface-variant"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content View */}
        <main className="flex-1 min-w-0">
          {/* 1. 마이 홈 (종합 대시보드) */}
          {activeTab === "overview" && (
            <MyOverview
              userName={userName}
              courses={courses}
              myProjects={myProjects}
              teamRequests={teamRequests}
              createdCourses={myCreatedCourses}
              settlements={settlements}
              bookmarkedProjects={bookmarkedProjects}
              recommendations={recommendations}
              proposals={proposals}
              notifications={notifications}
              onNavigateTab={(tabId) => setActiveTab(tabId as MyPageTabId)}
              onViewCourse={handleViewCourse}
              onViewIR={handleViewIR}
              onOpenProjectModal={handleOpenProjectModal}
              onOpenCreateCourseModal={handleOpenCreateCourseModal}
              onOpenIdeaModal={() => setShowIdeaRequestModal(true)}
            />
          )}

          {/* 2. 내 강의실 (수강 관리) */}
          {activeTab === "courses" && (
            <MyCoursesView
              courses={courses}
              onViewCourse={handleViewCourse}
              onNavigateToCourses={() => onNavigate("courses")}
            />
          )}

          {/* 3. 내 스타트업 (창업 & 팀빌딩) */}
          {activeTab === "startup" && (
            <MyStartupView
              myProjects={myProjects}
              teamRequests={myTeamRequests}
              receivedProposals={proposals}
              userName={userName}
              onViewIR={handleViewIR}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
              onUpdateTeamRequest={handleUpdateTeamRequest}
              isModalOpenExternal={isProjectModalOpenExternal}
              onCloseModalExternal={() => setIsProjectModalOpenExternal(false)}
            />
          )}

          {/* 4. 강의 개설 & 운영 (스튜디오) */}
          {activeTab === "instructor" && (
            <div className="animate-fadeIn">
              <InstructorDashboard
                myCourses={myCreatedCourses}
                settlements={settlements}
                onSaveCourse={handleSaveCourse}
                onSendCRMMessage={handleSendCRMMessage}
                onViewCourse={handleViewCourse}
                isModalOpenExternal={isCourseModalOpenExternal}
                onCloseModalExternal={() => setIsCourseModalOpenExternal(false)}
              />
            </div>
          )}

          {/* 5. 관심 스타트업 & 투자 (탐색 & 제안) */}
          {activeTab === "investor" && (
            <div className="animate-fadeIn">
              <InvestorDashboard
                bookmarkedProjects={bookmarkedProjects}
                recommendations={recommendations}
                proposals={proposals}
                onViewProject={handleViewIR}
                onRemoveBookmark={handleToggleBookmark}
              />
            </div>
          )}

          {/* 6. 결제 및 계정 설정 (관리) */}
          {activeTab === "settings" && (
            <AccountSettingsView
              userName={userName}
              userRoles={userRoles}
              payments={payments}
              notifications={notifications}
              onRefundPayment={handleRefundPayment}
              onNavigate={onNavigate}
            />
          )}
        </main>
      </div>

      {/* ── Idea Request Modal (AI PRD) ── */}
      <IdeaRequestModal
        isOpen={showIdeaRequestModal}
        onClose={() => setShowIdeaRequestModal(false)}
        onRequestCreated={() => {
          setShowIdeaRequestModal(false);
          setActiveTab("startup");
        }}
        userName={userName}
        userId={userName || "user-member"}
      />
    </div>
  );
}
