import React from "react";
import { X, Shield, Award, Briefcase, GraduationCap, Loader2, ChevronDown } from "lucide-react";
import type { UserRole } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (role: UserRole, email?: string) => void;
  onGoogleLogin?: (role?: UserRole, email?: string) => void;
  onSignup?: (data: { name: string; email: string; password?: string; role: UserRole }) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onGoogleLogin,
  onSignup,
}: AuthModalProps) {
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [loading, setLoading] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<UserRole>("student");
  const [showDemoLogin, setShowDemoLogin] = React.useState(false);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    setLoading(true);
    try {
      if (onGoogleLogin) {
        await onGoogleLogin(mode === "signup" ? selectedRole : undefined, "otter.oh@gmail.com");
      } else {
        onLogin("admin", "otter.oh@gmail.com");
      }
    } finally {
      setLoading(false);
    }
    onClose();
  };

  const roles = [
    {
      value: "student" as const,
      label: "수강생",
      desc: "강의 수강 및 창업팀 참여",
      icon: <GraduationCap size={14} className="text-brand-primary" />,
    },
    {
      value: "instructor" as const,
      label: "강사",
      desc: "강의 개설 및 수강생 CRM",
      icon: <Award size={14} className="text-brand-secondary" />,
    },
    {
      value: "investor" as const,
      label: "투자자",
      desc: "스타트업 발굴 & 투자 제안",
      icon: <Briefcase size={14} className="text-brand-tertiary" />,
    },
    {
      value: "admin" as const,
      label: "관리자",
      desc: "플랫폼 총괄 및 회원/강의 승인",
      icon: <Shield size={14} className="text-brand-accent-rose" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-panel-heavy rounded-2xl p-0 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Top gradient accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary-container via-brand-secondary to-brand-tertiary" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-brand-on-surface-variant hover:text-white p-1.5 rounded-full hover:bg-brand-surface-high transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-brand-primary-container to-brand-secondary flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              {mode === "login" ? "로그인" : "회원 가입"}
            </h2>
            <p className="text-xs text-brand-on-surface-variant mt-1">
              {mode === "login"
                ? "Google 계정으로 AI로 창업하라 플랫폼에 접속하세요"
                : "Google 계정으로 가입하고 플랫폼 서비스를 이용하세요"}
            </p>
          </div>

          {/* Google OAuth Login Button — Primary */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={loading}
            data-testid="google-oauth-button"
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-md text-sm border border-gray-200 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin text-gray-500" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
            )}
            <span>
              {mode === "login"
                ? "Google 계정으로 로그인"
                : "Google 계정으로 회원 가입"}
            </span>
          </button>

          {/* 회원가입 시 역할 선택 */}
          {mode === "signup" && (
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-brand-on-surface-variant flex items-center justify-between">
                <span>가입 유형 선택 (Google 로그인 후 설정)</span>
                <span className="text-[10px] text-brand-primary font-normal">
                  선택: {roles.find((r) => r.value === selectedRole)?.label}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    data-testid={`signup-role-${r.value}`}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === r.value
                        ? "border-brand-primary-container bg-brand-primary-container/20 text-white shadow-sm ring-1 ring-brand-primary"
                        : "border-brand-border bg-brand-surface-low text-brand-on-surface-variant hover:border-brand-surface-highest"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {r.icon}
                      <span className="text-xs font-bold text-white">{r.label}</span>
                    </div>
                    <span className="text-[9px] block text-brand-on-surface-variant leading-tight">
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 개발용 빠른 로그인 (접혀 있음) */}
          <div className="mt-4 border-t border-brand-border/30 pt-3">
            <button
              type="button"
              onClick={() => setShowDemoLogin(!showDemoLogin)}
              className="w-full flex items-center justify-between text-[10px] text-brand-on-surface-variant/60 hover:text-brand-on-surface-variant transition-colors cursor-pointer px-1"
            >
              <span className="uppercase tracking-wider font-mono">개발용 데모 로그인</span>
              <ChevronDown
                size={12}
                className={`transition-transform ${showDemoLogin ? "rotate-180" : ""}`}
              />
            </button>
            {showDemoLogin && (
              <div className="mt-2 grid grid-cols-4 gap-1.5 animate-fadeIn">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    data-testid={`quick-login-${r.value}`}
                    type="button"
                    onClick={() => {
                      onLogin(r.value);
                      onClose();
                    }}
                    className="text-[10px] py-1.5 rounded-lg border border-brand-border bg-brand-surface-low text-brand-on-surface-variant hover:text-white hover:border-brand-primary-container/50 transition-colors cursor-pointer font-medium text-center"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle mode */}
          <p className="text-center text-xs text-brand-on-surface-variant mt-4">
            {mode === "login" ? "아직 계정이 없으신가요? " : "이미 계정이 있으신가요? "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-brand-primary font-semibold hover:underline cursor-pointer"
            >
              {mode === "login" ? "회원가입" : "로그인"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
