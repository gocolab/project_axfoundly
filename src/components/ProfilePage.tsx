import React from "react";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Award,
  Briefcase,
  GraduationCap,
  Edit3,
  Save,
  CreditCard,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import type { UserRole } from "../types";
import { roleToPermission } from "../types";

interface ProfilePageProps {
  isLoggedIn: boolean;
  userName: string;
  userRole: UserRole;
  onNavigate: (page: string) => void;
  onLoginClick: () => void;
}

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  student: {
    label: "수강생",
    icon: <GraduationCap size={16} className="text-brand-primary" />,
    color: "text-brand-primary border-brand-primary/30 bg-brand-primary/10",
  },
  instructor: {
    label: "강사",
    icon: <Award size={16} className="text-brand-secondary" />,
    color: "text-brand-secondary border-brand-secondary/30 bg-brand-secondary/10",
  },
  investor: {
    label: "투자자",
    icon: <Briefcase size={16} className="text-brand-tertiary" />,
    color: "text-brand-tertiary border-brand-tertiary/30 bg-brand-tertiary/10",
  },
  admin: {
    label: "관리자",
    icon: <Shield size={16} className="text-brand-accent-rose" />,
    color: "text-brand-accent-rose border-brand-accent-rose/30 bg-brand-accent-rose/10",
  },
};

export default function ProfilePage({ isLoggedIn, userName, userRole, onNavigate, onLoginClick }: ProfilePageProps) {
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
        <p className="text-sm text-brand-on-surface-variant">프로필 설정 페이지는 로그인 후 이용하실 수 있습니다.</p>
        <button
          onClick={onLoginClick}
          className="mt-2 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm"
        >
          Google로 로그인
        </button>
      </div>
    );
  }

  const rc = roleConfig[userRole];
  const permission = roleToPermission(userRole);

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
      {/* Back */}
      <button
        onClick={() => onNavigate("home")}
        className="flex items-center gap-1.5 text-sm text-brand-on-surface-variant hover:text-white mb-6 cursor-pointer transition-colors"
      >
        <ArrowLeft size={16} />
        홈으로
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: 프로필 카드 ── */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Avatar & 기본 정보 */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6 flex flex-col items-center text-center gap-3">
            {/* Avatar (Google 프로필 이미지 자리) */}
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

            {/* 권한 레벨 */}
            <div className="w-full p-2.5 bg-brand-surface-low rounded-lg border border-brand-border/30">
              <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase mb-0.5">권한 레벨</p>
              <p className="text-xs font-semibold text-white">{permissionLabel[permission]}</p>
            </div>
          </div>

          {/* Google 연동 정보 */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4">
            <h3 className="text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              Google 계정 연동
            </h3>
            <div className="flex items-center gap-2 p-2.5 bg-brand-surface-low rounded-lg border border-brand-border/30">
              <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-brand-on-surface-variant">연동됨</p>
                <p className="text-xs text-white font-medium">otter.oh@gmail.com</p>
              </div>
            </div>
            <p className="text-[10px] text-brand-on-surface-variant mt-2 leading-relaxed">
              이메일은 Google 계정과 연동되어 수정할 수 없습니다.
            </p>
          </div>
        </div>

        {/* ── Right: 편집 가능한 정보 ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* 기본 정보 편집 */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User size={14} className="text-brand-primary" />
                기본 정보
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-xs text-brand-on-surface-variant hover:text-white transition-colors cursor-pointer"
                >
                  <Edit3 size={13} />
                  수정
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-semibold"
                >
                  <Save size={13} />
                  저장
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {/* 이름 */}
              <div>
                <label className="text-[11px] font-semibold text-brand-on-surface-variant block mb-1.5">
                  표시 이름
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-brand-surface-low border border-brand-primary-container/40 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2.5 bg-brand-surface-low rounded-xl border border-brand-border/30">
                    <User size={14} className="text-brand-on-surface-variant" />
                    <span className="text-sm text-white">{displayName}</span>
                  </div>
                )}
              </div>

              {/* 이메일 (수정 불가) */}
              <div>
                <label className="text-[11px] font-semibold text-brand-on-surface-variant block mb-1.5">
                  이메일 <span className="text-[10px] text-brand-on-surface-variant/50">(Google 계정 연동, 수정 불가)</span>
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-brand-surface-low/50 rounded-xl border border-brand-border/20 opacity-60">
                  <Mail size={14} className="text-brand-on-surface-variant" />
                  <span className="text-sm text-brand-on-surface-variant">otter.oh@gmail.com</span>
                </div>
              </div>

              {/* 가입일 */}
              <div>
                <label className="text-[11px] font-semibold text-brand-on-surface-variant block mb-1.5">
                  가입일
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-brand-surface-low rounded-xl border border-brand-border/30">
                  <Calendar size={14} className="text-brand-on-surface-variant" />
                  <span className="text-sm text-white">2025년 1월 15일</span>
                </div>
              </div>

              {/* 소개 */}
              <div>
                <label className="text-[11px] font-semibold text-brand-on-surface-variant block mb-1.5">
                  한 줄 소개
                </label>
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full bg-brand-surface-low border border-brand-primary-container/40 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors resize-none"
                  />
                ) : (
                  <div className="p-2.5 bg-brand-surface-low rounded-xl border border-brand-border/30">
                    <span className="text-sm text-brand-on-surface-variant">{bio}</span>
                  </div>
                )}
              </div>

              {saved && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs">
                  <CheckCircle size={14} />
                  프로필이 저장되었습니다
                </div>
              )}
            </div>
          </div>

          {/* 결제 수단 관리 */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <CreditCard size={14} className="text-brand-tertiary" />
              결제 수단 관리
            </h3>
            <div className="flex flex-col gap-3">
              {/* 카카오페이 */}
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
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/30">
                  연동됨
                </span>
              </div>

              {/* 일반 카드 */}
              <div className="flex items-center justify-between p-3 bg-brand-surface-low rounded-xl border border-brand-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-surface-high flex items-center justify-center">
                    <CreditCard size={15} className="text-brand-on-surface-variant" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">신용/체크카드</p>
                    <p className="text-[10px] text-brand-on-surface-variant">등록된 카드 없음</p>
                  </div>
                </div>
                <button className="text-[10px] font-semibold text-brand-primary hover:text-white transition-colors cursor-pointer">
                  추가
                </button>
              </div>
            </div>

            <p className="text-[10px] text-brand-on-surface-variant mt-3 leading-relaxed">
              결제 내역은 마이페이지 → 수강 및 결제 내역에서 확인하실 수 있습니다.
            </p>
          </div>

          {/* 활동 통계 */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">활동 통계</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-brand-surface-low rounded-xl border border-brand-border/30">
                <p className="text-xl font-bold text-white font-display">3</p>
                <p className="text-[10px] text-brand-on-surface-variant mt-0.5">수강 강의</p>
              </div>
              <div className="text-center p-3 bg-brand-surface-low rounded-xl border border-brand-border/30">
                <p className="text-xl font-bold text-white font-display">1</p>
                <p className="text-[10px] text-brand-on-surface-variant mt-0.5">등록 프로젝트</p>
              </div>
              <div className="text-center p-3 bg-brand-surface-low rounded-xl border border-brand-border/30">
                <p className="text-xl font-bold text-white font-display">12</p>
                <p className="text-[10px] text-brand-on-surface-variant mt-0.5">커뮤니티 활동</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
