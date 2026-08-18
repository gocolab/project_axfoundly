import React from "react";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (role: "student" | "instructor" | "investor" | "admin") => void;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<"student" | "instructor" | "investor">("student");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
    onClose();
  };

  const roles = [
    { value: "student" as const, label: "수강생", desc: "강의 수강 및 창업 프로젝트 참여" },
    { value: "instructor" as const, label: "강사", desc: "강의 개설 및 수강생 관리" },
    { value: "investor" as const, label: "투자자", desc: "스타트업 발굴 및 투자 제안" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-panel-heavy rounded-2xl p-0 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Top gradient accent */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-primary-container via-brand-secondary to-brand-tertiary" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-brand-on-surface-variant hover:text-white p-1 rounded-full hover:bg-brand-surface-high transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-white">
              {mode === "login" ? "로그인" : "회원가입"}
            </h2>
            <p className="text-sm text-brand-on-surface-variant mt-1">
              {mode === "login" 
                ? "AI로 창업하라 플랫폼에 오신 것을 환영합니다" 
                : "새 계정을 만들고 창업 여정을 시작하세요"
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={16} />
                <input
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={16} />
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-brand-on-surface-variant">계정 유형 선택</label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedRole === r.value
                          ? "border-brand-primary-container bg-brand-primary-container/15 text-brand-primary"
                          : "border-brand-border bg-brand-surface-low text-brand-on-surface-variant hover:border-brand-surface-highest"
                      }`}
                    >
                      <span className="text-xs font-bold block">{r.label}</span>
                      <span className="text-[10px] block mt-0.5 opacity-70">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm"
            >
              {mode === "login" ? "로그인" : "가입하기"}
            </button>

            {/* Quick demo login */}
            <div className="border-t border-brand-border/40 pt-4 mt-1">
              <p className="text-[10px] text-center text-brand-on-surface-variant mb-2 uppercase tracking-wider font-mono">데모 빠른 로그인</p>
              <div className="grid grid-cols-4 gap-1.5">
                {([...roles, { value: "admin" as const, label: "관리자", desc: "" }]).map((r) => (
                  <button
                    key={r.value}
                    data-testid={`quick-login-${r.value}`}
                    type="button"
                    onClick={() => { onLogin(r.value); onClose(); }}
                    className="text-[10px] py-1.5 rounded-lg border border-brand-border bg-brand-surface-low text-brand-on-surface-variant hover:text-white hover:border-brand-primary-container/50 transition-colors cursor-pointer font-medium"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

          </form>

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
