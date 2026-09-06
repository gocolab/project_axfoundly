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
  ArrowUpRight,
} from "lucide-react";
import type { UserRole, Notification } from "../types";

interface GNBProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isLoggedIn: boolean;
  userRoles: UserRole[];
  userName: string;
  userAvatar?: string;
  onLoginClick: () => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
}

export default function GNB({
  currentPage,
  setCurrentPage,
  isLoggedIn,
  userRoles,
  userName,
  userAvatar,
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
    { id: "courses", label: "교육/강의", icon: <GraduationCap size={16} /> },
    { id: "ir", label: "스타트업/IR", icon: <TrendingUp size={16} /> },
    { id: "community", label: "커뮤니티", icon: <MessageSquare size={16} /> },
  ];


  const roleLabel: Record<UserRole, string> = {
    member: "member",
    manager: "manager",
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

  // 마이페이지 > 알림센터로 즉시 이동
  const handleGoToNotifications = () => {
    window.history.pushState({ page: "dashboard" }, "", "/mypage?tab=notifications");
    setCurrentPage("dashboard");
    window.dispatchEvent(new Event("popstate"));
    setShowNotifications(false);
  };

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
                FOUND WITH AI
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
                    <div className="absolute right-0 mt-2 w-88 glass-panel-heavy rounded-xl shadow-2xl overflow-hidden animate-fadeIn border border-brand-border/60">
                      <div className="p-3 border-b border-brand-border/40 flex justify-between items-center bg-brand-surface-low/80">
                        <span className="font-bold text-sm text-white flex items-center gap-1.5">
                          <Bell size={14} className="text-brand-primary" /> 알림
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-brand-on-surface-variant font-mono">{unreadCount}개 안 읽음</span>
                          <button
                            type="button"
                            onClick={handleGoToNotifications}
                            className="text-[11px] font-bold text-brand-primary hover:text-brand-primary-light hover:underline cursor-pointer flex items-center gap-0.5 ml-1"
                          >
                            전체 보기 &rarr;
                          </button>
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-xs text-center text-brand-on-surface-variant">수신된 알림이 없습니다</p>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                onMarkNotificationRead(n.id);
                                setShowNotifications(false);
                                if (n.targetUrl) {
                                  if (n.targetUrl.startsWith("/courses")) setCurrentPage("courses");
                                  else if (n.targetUrl.startsWith("/ir")) setCurrentPage("ir");
                                  else if (n.targetUrl.startsWith("/community")) setCurrentPage("community");
                                  else if (n.targetUrl.startsWith("/mypage")) {
                                    window.history.pushState({ page: "dashboard" }, "", n.targetUrl);
                                    setCurrentPage("dashboard");
                                    window.dispatchEvent(new Event("popstate"));
                                  }
                                }
                              }}
                              className={`w-full text-left p-3 border-b border-brand-border/20 hover:bg-brand-surface-low transition-colors cursor-pointer ${
                                !n.isRead ? "bg-brand-primary-container/10" : ""
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {!n.isRead && <span className="mt-1.5 notification-dot flex-shrink-0" />}
                                <div className={`flex-1 min-w-0 ${!n.isRead ? "" : "ml-3"}`}>
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                                    {n.aggregationCount && n.aggregationCount > 1 && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                        {n.aggregationCount}건
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-brand-on-surface-variant mt-0.5 line-clamp-2">{n.message}</p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-[9px] text-brand-on-surface-variant/60 font-mono">{n.time}</span>
                                    {n.actionLabel && (
                                      <span className="text-[9px] font-bold text-brand-primary">
                                        {n.actionLabel} &rarr;
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="p-2.5 border-t border-brand-border/40 bg-brand-surface-low/80 text-center">
                        <button
                          type="button"
                          onClick={handleGoToNotifications}
                          className="text-xs text-brand-primary hover:text-brand-primary-light font-bold cursor-pointer flex items-center justify-center gap-1.5 w-full py-1 hover:underline"
                        >
                          <span>마이페이지 &gt; 알림센터 전체 보기</span>
                          <ArrowUpRight size={13} />
                        </button>
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

                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-brand-primary-container to-brand-tertiary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 border border-brand-border/60">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                            const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "block";
                          }}
                        />
                      ) : null}
                      <span className={userAvatar ? "hidden" : "block"}>
                        {userName.charAt(0)}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <span className="text-xs font-semibold text-white block leading-tight">{userName}</span>
                      {userRoles.includes("admin") && (
                        <span className="text-[10px] text-brand-tertiary font-mono">
                          관리자
                        </span>
                      )}
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

                      {userRoles.includes("admin") && (
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
                  className="text-sm font-semibold text-white bg-gradient-to-r from-brand-primary-container to-brand-secondary px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-brand-primary/20"
                >
                  로그인
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
