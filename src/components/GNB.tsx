import React from "react";
import {
  Rocket,
  GraduationCap,
  Users,
  TrendingUp,
  MessageSquare,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  User,
} from "lucide-react";
import type { UserRole, Notification } from "../types";

interface GNBProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isLoggedIn: boolean;
  userRole: UserRole;
  userName: string;
  onLoginClick: () => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
}

export default function GNB({
  currentPage,
  setCurrentPage,
  isLoggedIn,
  userRole,
  userName,
  onLoginClick,
  onLogout,
  notifications,
  onMarkNotificationRead,
}: GNBProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    { id: "home", label: "홈", icon: <Rocket size={16} /> },
    { id: "courses", label: "교육/강의", icon: <GraduationCap size={16} /> },
    { id: "ir", label: "스타트업/IR", icon: <TrendingUp size={16} /> },
    { id: "community", label: "커뮤니티", icon: <MessageSquare size={16} /> },
  ];

  const roleLabel: Record<UserRole, string> = {
    student: "수강생",
    instructor: "강사",
    investor: "투자자",
    admin: "관리자",
  };

  // Close menus on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-xl border-b border-brand-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => setCurrentPage("home")}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary-container to-brand-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Rocket size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-lg font-bold text-white tracking-tight">
                AI로 창업하라
              </span>
              <span className="block text-[10px] text-brand-on-surface-variant -mt-0.5 font-mono tracking-wider">
                LAUNCH WITH AI
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentPage === item.id
                    ? "text-white bg-brand-primary-container/20 border border-brand-primary-container/30"
                    : "text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-full text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high transition-colors cursor-pointer"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 notification-dot" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 glass-panel-heavy rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                      <div className="p-3 border-b border-brand-border/40 flex justify-between items-center">
                        <span className="font-bold text-sm text-white">알림</span>
                        <span className="text-[10px] text-brand-on-surface-variant">{unreadCount}개 안 읽음</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-xs text-center text-brand-on-surface-variant">알림이 없습니다</p>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => { onMarkNotificationRead(n.id); }}
                              className={`w-full text-left p-3 border-b border-brand-border/20 hover:bg-brand-surface-low transition-colors cursor-pointer ${
                                !n.isRead ? "bg-brand-primary-container/5" : ""
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {!n.isRead && <span className="mt-1.5 notification-dot flex-shrink-0" />}
                                <div className={!n.isRead ? "" : "ml-4"}>
                                  <p className="text-xs font-semibold text-white">{n.title}</p>
                                  <p className="text-[10px] text-brand-on-surface-variant mt-0.5">{n.message}</p>
                                  <p className="text-[9px] text-brand-on-surface-variant/50 mt-1">{n.time}</p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    data-testid="user-profile-button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-full border border-brand-border/50 hover:border-brand-primary-container/40 transition-colors cursor-pointer"
                  >

                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-primary-container to-brand-tertiary flex items-center justify-center text-white text-xs font-bold">
                      {userName.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <span className="text-xs font-semibold text-white block leading-tight">{userName}</span>
                      <span className="text-[10px] text-brand-tertiary font-mono">{roleLabel[userRole]}</span>
                    </div>
                    <ChevronDown size={14} className="text-brand-on-surface-variant" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 glass-panel-heavy rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                      <button
                        onClick={() => { setCurrentPage("dashboard"); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-low transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <LayoutDashboard size={14} />
                        마이페이지
                      </button>
                      <button
                        onClick={() => { setCurrentPage("dashboard"); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-low transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <User size={14} />
                        프로필 설정
                      </button>
                      {userRole === "admin" && (
                        <button
                          onClick={() => { setCurrentPage("admin"); setShowUserMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-brand-tertiary hover:bg-brand-surface-low transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <LayoutDashboard size={14} />
                          관리자 대시보드
                        </button>
                      )}
                      <div className="border-t border-brand-border/40" />
                      <button
                        onClick={() => { onLogout(); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-error hover:bg-brand-surface-low transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onLoginClick}
                  className="text-sm text-brand-on-surface-variant hover:text-white transition-colors cursor-pointer px-3 py-1.5"
                >
                  로그인
                </button>
                <button
                  onClick={onLoginClick}
                  className="text-sm font-semibold text-white bg-gradient-to-r from-brand-primary-container to-brand-secondary px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                >
                  회원가입
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-surface-low border-t border-brand-border/40 animate-fadeIn">
          <div className="px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentPage === item.id
                    ? "text-white bg-brand-primary-container/20"
                    : "text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            {isLoggedIn && (
              <>
                <div className="border-t border-brand-border/40 my-1" />
                <button
                  onClick={() => { setCurrentPage("dashboard"); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high cursor-pointer"
                >
                  <LayoutDashboard size={16} />
                  마이페이지
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
