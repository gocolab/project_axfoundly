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
  LayoutDashboard
} from "lucide-react";
import type { UserRole, Course, Notification, PaymentRecord, SettlementRecord, TeamBuildingRequest, InvestmentProposal, AIRecommendation, IRProject } from "../types";
import MemberDashboard from "./MemberDashboard";
import InstructorDashboard from "./InstructorDashboard";
import InvestorDashboard from "./InvestorDashboard";

interface MyPageProps {
  isLoggedIn: boolean;
  userName: string;
  userRoles: UserRole[];
  userAssignedRoles: string[];
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

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  member: {
    label: "수강생",
    icon: <GraduationCap size={16} className="text-brand-primary" />,
    color: "text-brand-primary border-brand-primary/30 bg-brand-primary/10",
  },
  manager: {
    label: "매니저",
    icon: <Briefcase size={16} className="text-brand-secondary" />,
    color: "text-brand-secondary border-brand-secondary/30 bg-brand-secondary/10",
  },
  admin: {
    label: "관리자",
    icon: <Shield size={16} className="text-brand-accent-rose" />,
    color: "text-brand-accent-rose border-brand-accent-rose/30 bg-brand-accent-rose/10",
  },
};

export default function MyPage({
  isLoggedIn, userName, userRoles, userAssignedRoles,
  courses, teamRequests, payments, notifications, irProjects, settlements, recommendations, proposals,
  onNavigate, onLoginClick,
  handleViewCourse, handleViewIR, handleSaveProject, handleRefundPayment, handleUpdateTeamRequest,
  handleSaveCourse, handleSendCRMMessage, handleToggleBookmark
}: MyPageProps) {
  
  const [activeTab, setActiveTab] = React.useState<"profile" | "member" | "instructor" | "investor">("profile");
  const [isEditing, setIsEditing] = React.useState(false);
  const [displayName, setDisplayName] = React.useState(userName);
  const [bio, setBio] = React.useState("AI로 창업을 준비 중인 기업가입니다.");
  const [saved, setSaved] = React.useState(false);

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-surface-low border border-brand-border flex items-center justify-center">
          <User size={28} className="text-brand-on-surface-variant" />
        </div>
        <h2 className="font-display text-xl font-bold text-white">로그인이 필요합니다</h2>
        <p className="text-sm text-brand-on-surface-variant">마이페이지는 로그인 후 이용하실 수 있습니다.</p>
        <button
          onClick={onLoginClick}
          className="mt-2 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm"
        >
          Google로 로그인
        </button>
      </div>
    );
  }

  const isInstructor = userAssignedRoles.includes("course_instructor") || userRoles.includes("admin");
  const isInvestor = userAssignedRoles.includes("investor_active") || userRoles.includes("admin");

  const tabs = [
    { id: "profile" as const, label: "내 프로필", icon: <User size={16} /> },
    { id: "member" as const, label: "수강생 대시보드", icon: <GraduationCap size={16} /> },
    ...(isInstructor ? [{ id: "instructor" as const, label: "강사 대시보드", icon: <Briefcase size={16} /> }] : []),
    ...(isInvestor ? [{ id: "investor" as const, label: "투자자 대시보드", icon: <CreditCard size={16} /> }] : []),
  ];

  const rc = roleConfig[userRoles[0]] || roleConfig["member"];
  const permissionLabel: Record<string, string> = {
    admin: "관리자 (Admin)",
    manager: "매니저 (Manager)",
    member: "일반 회원 (Member)",
  };

  const handleSave = () => {
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary-container to-brand-primary flex items-center justify-center">
          <LayoutDashboard size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">마이페이지</h1>
          <p className="text-sm text-brand-on-surface-variant">프로필 관리 및 업무별 대시보드</p>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Left Sidebar Menu */}
        <aside className="w-52 flex-shrink-0">
          <nav className="flex flex-col gap-1 sticky top-20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                  activeTab === tab.id
                    ? "bg-brand-primary-container/20 text-brand-primary border border-brand-primary-container/30 shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high border border-transparent"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* Left Profile Card */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6 flex flex-col items-center text-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary-container to-brand-secondary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {displayName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">{displayName}</h2>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 ${rc.color}`}>
                      {rc.icon}
                      {rc.label}
                    </span>
                  </div>
                  <div className="w-full p-2.5 bg-brand-surface-low rounded-lg border border-brand-border/30">
                    <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase mb-0.5">역할 그룹</p>
                    <p className="text-xs font-semibold text-white">{permissionLabel[userRoles[0]] || permissionLabel["member"]}</p>
                  </div>
                </div>

                {/* Google Sync */}
                <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    Google 계정 연동
                  </h3>
                  <div className="flex items-center gap-2 p-2.5 bg-brand-surface-low rounded-lg border border-brand-border/30">
                    <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-brand-on-surface-variant">연동됨</p>
                      <p className="text-xs text-white font-medium">user@gmail.com</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-brand-on-surface-variant mt-2 leading-relaxed">
                    이메일은 Google 계정과 연동되어 수정할 수 없습니다.
                  </p>
                </div>
              </div>

              {/* Right Edit Details */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <User size={14} className="text-brand-primary" />
                      기본 정보
                    </h3>
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-xs text-brand-on-surface-variant hover:text-white transition-colors cursor-pointer">
                        <Edit3 size={13} /> 수정
                      </button>
                    ) : (
                      <button onClick={handleSave} className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-semibold">
                        <Save size={13} /> 저장
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-brand-on-surface-variant block mb-1.5">표시 이름</label>
                      {isEditing ? (
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-brand-surface-low border border-brand-primary-container/40 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors" />
                      ) : (
                        <div className="flex items-center gap-2 p-2.5 bg-brand-surface-low rounded-xl border border-brand-border/30">
                          <User size={14} className="text-brand-on-surface-variant" />
                          <span className="text-sm text-white">{displayName}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-brand-on-surface-variant block mb-1.5">한 줄 소개</label>
                      {isEditing ? (
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="w-full bg-brand-surface-low border border-brand-primary-container/40 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors resize-none" />
                      ) : (
                        <div className="p-2.5 bg-brand-surface-low rounded-xl border border-brand-border/30">
                          <span className="text-sm text-brand-on-surface-variant">{bio}</span>
                        </div>
                      )}
                    </div>
                    {saved && <div className="flex items-center gap-2 text-emerald-400 text-xs"><CheckCircle size={14} /> 프로필이 저장되었습니다</div>}
                  </div>
                </div>

                <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <CreditCard size={14} className="text-brand-tertiary" /> 결제 수단 관리
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 bg-brand-surface-low rounded-xl border border-brand-border/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FFCD00] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#3A1D1D]">Pay</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">카카오페이</p>
                          <p className="text-[10px] text-brand-on-surface-variant">테스트 결제 연동</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/30">연동됨</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "member" && (
            <div className="animate-fadeIn">
              <MemberDashboard
                enrolledCourses={courses}
                teamRequests={teamRequests}
                payments={payments}
                notifications={notifications}
                myProjects={irProjects.filter((p) => p.members?.some((m) => m.name === userName))}
                onViewCourse={handleViewCourse}
                onViewIR={handleViewIR}
                onSaveProject={handleSaveProject}
                onRefundPayment={handleRefundPayment}
                onUpdateTeamRequest={handleUpdateTeamRequest}
              />
            </div>
          )}

          {activeTab === "instructor" && isInstructor && (
            <div className="animate-fadeIn">
              <InstructorDashboard
                myCourses={courses.filter((c) => c.instructor.includes(userName))}
                settlements={settlements}
                onSaveCourse={handleSaveCourse}
                onSendCRMMessage={handleSendCRMMessage}
                onViewCourse={handleViewCourse}
              />
            </div>
          )}

          {activeTab === "investor" && isInvestor && (
            <div className="animate-fadeIn">
              <InvestorDashboard
                bookmarkedProjects={irProjects.filter((p) => p.bookmarked)}
                recommendations={recommendations}
                proposals={proposals}
                onViewProject={handleViewIR}
                onRemoveBookmark={handleToggleBookmark}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
