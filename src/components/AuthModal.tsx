import React from "react";
import { X, Shield, Award, Briefcase, GraduationCap, Loader2, ChevronDown } from "lucide-react";
import type { UserRole } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (roles: UserRole[], email?: string) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
}: AuthModalProps) {
  const [loading, setLoading] = React.useState(false);

  // 환경변수(VITE_SHOW_DEMO_LOGIN) 또는 로컬 개발(DEV) 환경에서만 데모 로그인 활성화
  const isDemoLoginEnabled =
    import.meta.env.VITE_SHOW_DEMO_LOGIN === "true" ||
    (import.meta.env.DEV && import.meta.env.VITE_SHOW_DEMO_LOGIN !== "false");

  if (!isOpen) return null;

  const handleGoogleClick = () => {
    setLoading(true);
    // Real Google OAuth - Redirects to Backend URL which redirects to Google
    window.location.href = "/api/auth/google/url";
  };

  const demoUsers = [
    { roles: ["member"] as UserRole[], email: "student@mail.com", label: "수강생" },
    { roles: ["member"] as UserRole[], email: "sohyun.kim@mail.com", label: "강사" },
    { roles: ["member"] as UserRole[], email: "sw.han@nexusvc.com", label: "투자자" },
    { roles: ["admin"] as UserRole[], email: "admin@platform.com", label: "관리자" },
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
              로그인
            </h2>
            <p className="text-xs text-brand-on-surface-variant mt-1">
              Google 계정으로 로그인 또는 간편 가입을 진행하세요
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
            <span>Google 계정으로 로그인</span>
          </button>

          {/* 개발/시연용 빠른 데모 로그인 (환경변수 또는 DEV 환경에서만 노출) */}
          {isDemoLoginEnabled && (
            <div className="mt-4 border-t border-brand-border/30 pt-3">
              <div className="flex items-center justify-between text-[10px] text-brand-on-surface-variant/60 px-1 mb-2">
                <span className="uppercase tracking-wider font-mono">개발용 데모 로그인</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 animate-fadeIn">
                {demoUsers.map((u) => (
                  <button
                    key={u.label}
                    data-testid={`quick-login-${u.label}`}
                    type="button"
                    onClick={() => {
                      onLogin(u.roles, u.email);
                      onClose();
                    }}
                    className="text-[10px] py-1.5 rounded-lg border border-brand-border bg-brand-surface-low text-brand-on-surface-variant hover:text-white hover:border-brand-primary-container/50 transition-colors cursor-pointer font-medium text-center"
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
