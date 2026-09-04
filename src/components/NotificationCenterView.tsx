import React from "react";
import {
  Bell,
  MessageSquare,
  CheckCircle,
  Shield,
  Clock,
  Sparkles,
  RotateCcw,
  Search,
  X,
  Moon,
  PauseCircle,
  PlayCircle,
  Eye,
  ExternalLink,
  Sliders,
  Mail,
  Smartphone,
  Layers,
} from "lucide-react";
import type {
  Notification,
  NotificationPreference,
  NotificationCategory,
  NotificationChannel,
  NotificationTemplate,
} from "../types";
import Pagination from "./common/Pagination";
import { api } from "../lib/api";
import { useToast } from "./common/Toast";

interface NotificationCenterViewProps {
  userName?: string;
  notifications: Notification[];
  onNavigate?: (url: string) => void;
}

export default function NotificationCenterView({
  userName,
  notifications: initialNotifications,
  onNavigate,
}: NotificationCenterViewProps) {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = React.useState<"notifications" | "preferences">("notifications");
  const [localNotifications, setLocalNotifications] = React.useState<Notification[]>(initialNotifications);

  React.useEffect(() => {
    setLocalNotifications(initialNotifications);
  }, [initialNotifications]);

  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null);
  const [isClosingNotification, setIsClosingNotification] = React.useState(false);

  // ── 알림 수신 설정 (Preference Center) State ──
  const [preferences, setPreferences] = React.useState<NotificationPreference | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = React.useState(false);
  const [prefsSavedMessage, setPrefsSavedMessage] = React.useState("");

  // ── 이메일 미리보기 모달 State ──
  const [showEmailPreviewModal, setShowEmailPreviewModal] = React.useState(false);
  const [previewTemplateCode, setPreviewTemplateCode] = React.useState("TEAM_PROPOSAL_RECEIVED");
  const [previewHtml, setPreviewHtml] = React.useState<string>("");
  const [templates, setTemplates] = React.useState<NotificationTemplate[]>([]);

  // Preferences 로드
  const loadPreferences = async () => {
    try {
      const res = await api.getNotificationPreferences();
      if (res?.preferences) {
        setPreferences(res.preferences);
      }
    } catch (err) {
      console.error("Failed to load preferences:", err);
    }
  };

  // Templates 로드
  const loadTemplates = async () => {
    try {
      const res = await api.getNotificationTemplates();
      if (res?.templates) {
        setTemplates(res.templates);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  };

  React.useEffect(() => {
    loadPreferences();
    loadTemplates();
  }, []);

  // Notifications Filter & Pagination
  const [notificationFilter, setNotificationFilter] = React.useState<string>("all");
  const [searchNotification, setSearchNotification] = React.useState<string>("");
  const [notificationPage, setNotificationPage] = React.useState(1);
  const notificationItemsPerPage = 6;

  const filteredNotifications = localNotifications.filter((n) => {
    const matchFilter =
      notificationFilter === "all"
        ? true
        : notificationFilter === "unread"
        ? !n.isRead
        : n.type === notificationFilter || n.category === notificationFilter;
    const matchSearch =
      searchNotification.trim() === "" ||
      n.title.toLowerCase().includes(searchNotification.toLowerCase()) ||
      n.message.toLowerCase().includes(searchNotification.toLowerCase());
    return matchFilter && matchSearch;
  });
  const notificationTotalPages = Math.ceil(filteredNotifications.length / notificationItemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (notificationPage - 1) * notificationItemsPerPage,
    notificationPage * notificationItemsPerPage
  );

  React.useEffect(() => {
    setNotificationPage(1);
  }, [notificationFilter, searchNotification]);

  const handleCloseNotificationPanel = () => {
    setIsClosingNotification(true);
    setTimeout(() => {
      setSelectedNotification(null);
      setIsClosingNotification(false);
    }, 280);
  };

  const handleToggleChannel = (category: NotificationCategory, channel: NotificationChannel) => {
    if (!preferences) return;
    const currentChannels = preferences.categories[category] || [];
    const exists = currentChannels.includes(channel);
    const nextChannels = exists
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel];

    setPreferences({
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: nextChannels,
      },
    });
  };

  const handleToggleNightMode = () => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      nightTimeMuted: !preferences.nightTimeMuted,
    });
  };

  const handleToggleSnooze = () => {
    if (!preferences) return;
    const isCurrentlySnoozed =
      preferences.snoozeUntil && new Date(preferences.snoozeUntil) > new Date();

    if (isCurrentlySnoozed) {
      setPreferences({
        ...preferences,
        snoozeUntil: null,
      });
      toast.info("알림 재개", "알림 수신이 정상 재개되었습니다.");
    } else {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      setPreferences({
        ...preferences,
        snoozeUntil: future.toISOString(),
      });
      toast.warning("30일 일시중지", "앞으로 30일간 외부 알림(메일/알림톡)이 일시 중지됩니다.");
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    try {
      setIsSavingPrefs(true);
      await api.updateNotificationPreferences({
        categories: preferences.categories,
        quietHours: preferences.quietHours,
        snoozeUntil: preferences.snoozeUntil,
      });
      setPrefsSavedMessage("알림 수신 설정이 성공적으로 저장되었습니다.");
      toast.success("설정 저장", "알림 수신 및 스팸 방지 설정이 저장되었습니다.");
      setTimeout(() => setPrefsSavedMessage(""), 3500);
    } catch (err) {
      console.error("Failed to save preferences:", err);
      toast.error("저장 실패", "설정을 저장하는 중 오류가 발생했습니다.");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleOpenEmailPreview = async (templateCode: string) => {
    setPreviewTemplateCode(templateCode);
    try {
      const res = await api.previewEmailTemplate({
        title:
          templateCode === "TEAM_PROPOSAL_RECEIVED"
            ? "🤝 [팀 합류 제안] React/Node.js 역량을 보유한 빌더가 합류를 제안했습니다"
            : templateCode === "COURSE_D1_REMINDER"
            ? "[D-1] 내일 19:30 AI 프로덕트 매니저 부트캠프 라이브 세션이 시작됩니다!"
            : templateCode === "INVESTMENT_PROPOSAL_RECEIVED"
            ? "💼 [투자 제안] 전문 투자자로부터 DocuMind AI 미팅 제안이 도착했습니다"
            : "💬 회원님의 게시글에 새로운 의견이 등록되었습니다",
        message:
          templateCode === "TEAM_PROPOSAL_RECEIVED"
            ? "스타트업 IR 덱을 보고 비전에 깊이 공감하여 프론트엔드 포지션으로 합류를 제안했습니다.\n\n📌 상세 포트폴리오와 희망 조건은 플랫폼 워크스페이스에서 확인하고 48시간 이내에 수락 여부를 결정해 주세요."
            : templateCode === "COURSE_D1_REMINDER"
            ? "안녕하세요 김수강생님! 신청하신 강의 1회차가 내일 19:30에 실시간 Zoom으로 시작됩니다.\n원활한 수강을 위해 사전 환경 세팅과 실습 자료를 미리 확인해 보세요."
            : "새로운 소식이 등록되었습니다. 플랫폼에서 자세한 내용을 확인하세요.",
        targetUrl: templateCode === "COURSE_D1_REMINDER" ? "/courses?courseId=c1" : "/mypage?tab=startup",
        actionLabel: templateCode === "COURSE_D1_REMINDER" ? "강의실 바로가기" : "제안서 열람 및 응답하기",
        category: "team",
        userName: userName || "김수강생",
      });
      if (res?.html) {
        setPreviewHtml(res.html);
        setShowEmailPreviewModal(true);
      }
    } catch (err) {
      console.error("Preview email failed:", err);
      toast.error("미리보기 오류", "이메일 템플릿 렌더링에 실패했습니다.");
    }
  };

  const isSnoozedActive =
    preferences?.snoozeUntil && new Date(preferences.snoozeUntil) > new Date();

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Bell size={20} className="text-brand-primary" /> 알림 센터
          </h2>
          <p className="text-xs text-brand-on-surface-variant mt-1">
            수신된 주요 업무 알림 보관함 열람과 스마트 스팸 방지(야간 차단/30일 일시중지)를 통합 관리하세요
          </p>
        </div>

        {prefsSavedMessage && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold animate-fadeIn flex items-center gap-1.5">
            <CheckCircle size={14} /> {prefsSavedMessage}
          </div>
        )}
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-brand-border/40 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("notifications")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "notifications"
              ? "text-brand-primary border-b-2 border-brand-primary tab-active"
              : "text-brand-on-surface-variant hover:text-white"
          }`}
        >
          <Bell size={14} /> 수신 알림 보관함 ({localNotifications.filter((n) => !n.isRead).length}개 안읽음)
        </button>
        <button
          onClick={() => setActiveSubTab("preferences")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "preferences"
              ? "text-brand-primary border-b-2 border-brand-primary tab-active"
              : "text-brand-on-surface-variant hover:text-white"
          }`}
        >
          <Shield size={14} className="text-amber-400" /> 알림 수신 & 스팸 방지 설정
        </button>
      </div>

      {/* ── SubTab 1: 수신 알림 보관함 ── */}
      {activeSubTab === "notifications" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-xl border border-brand-border/40 self-start overflow-x-auto max-w-full">
              {[
                { id: "all", label: `전체 (${localNotifications.length})` },
                { id: "unread", label: `안읽음 (${localNotifications.filter((n) => !n.isRead).length})` },
                { id: "course", label: "강의" },
                { id: "proposal", label: "투자/제안" },
                { id: "team", label: "팀빌딩" },
                { id: "community", label: "커뮤니티" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setNotificationFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    notificationFilter === f.id
                      ? "bg-brand-primary-container text-white shadow-sm"
                      : "text-brand-on-surface-variant hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full sm:w-auto shrink-0">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                <input
                  type="text"
                  placeholder="알림 제목, 내용 검색..."
                  value={searchNotification}
                  onChange={(e) => setSearchNotification(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-8 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors"
                />
                {searchNotification && (
                  <button
                    onClick={() => setSearchNotification("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant hover:text-white cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {notificationTotalPages > 1 && (
                <div className="ml-auto">
                  <Pagination
                    currentPage={notificationPage}
                    totalPages={notificationTotalPages}
                    onPageChange={setNotificationPage}
                    totalItems={filteredNotifications.length}
                    itemsPerPage={notificationItemsPerPage}
                  />
                </div>
              )}
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <p className="text-xs text-brand-on-surface-variant">일치하는 수신 알림이 없습니다.</p>
              {searchNotification && (
                <button
                  onClick={() => setSearchNotification("")}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-brand-surface-high border border-brand-border text-white text-xs font-semibold hover:bg-brand-surface-highest transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={12} /> 검색 초기화
                </button>
              )}
            </div>
          ) : (
            <div className="relative flex flex-col lg:flex-row gap-5 items-start">
              {/* Left Column: Notification List */}
              <div
                className={`min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  selectedNotification ? "w-full lg:w-[50%] xl:w-[52%]" : "w-full"
                }`}
              >
                <div className="flex flex-col gap-2.5">
                  {paginatedNotifications.map((notif) => {
                    const isSelected = selectedNotification?.id === notif.id;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setSelectedNotification(notif);
                          if (!notif.isRead) {
                            setLocalNotifications((prev) =>
                              prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
                            );
                            api.markNotificationRead(notif.id).catch(() => {});
                          }
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand-primary-container/20 border-brand-primary shadow-md"
                            : notif.isRead
                            ? "bg-brand-card border-brand-border/60 hover:border-brand-border"
                            : "bg-[#0b1329] border-cyan-500/40 hover:border-cyan-500"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
                            )}
                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {notif.title}
                            </h4>
                          </div>
                          <span className="text-[10px] text-brand-on-surface-variant shrink-0 font-mono">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detail Panel */}
              {selectedNotification && (
                <div
                  className={`w-full lg:w-[50%] xl:w-[48%] sticky top-4 transition-all duration-300 ease-out ${
                    isClosingNotification
                      ? "opacity-0 translate-x-4 pointer-events-none"
                      : "opacity-100 translate-x-0"
                  }`}
                >
                  <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-primary uppercase font-mono">
                          {selectedNotification.category || selectedNotification.type || "알림"}
                        </span>
                      </div>
                      <button
                        onClick={handleCloseNotificationPanel}
                        className="text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                        {selectedNotification.title}
                      </h3>
                      <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                        {selectedNotification.message}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-white/40 font-mono">
                        수신일시: {selectedNotification.timestamp}
                      </span>
                      {selectedNotification.targetUrl && onNavigate && (
                        <button
                          onClick={() => onNavigate(selectedNotification.targetUrl!)}
                          className="px-3 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                        >
                          해당 화면 바로가기 <ExternalLink size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SubTab 2: 알림 수신 & 스팸 방지 설정 ── */}
      {activeSubTab === "preferences" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Top Warning / Snooze Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">
                  스팸 피로도 제로 보장 시스템 & 야간 방해금지 적용 중
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  야간(21:00~08:00) 발송 자동 제한 및 동일 게시글 연속 반응 5분 묶음(Roll-up) 발송
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleSnooze}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap ${
                isSnoozedActive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
              }`}
            >
              {isSnoozedActive ? <PlayCircle size={13} /> : <PauseCircle size={13} />}
              {isSnoozedActive ? "30일 알림 일시정지 해제" : "모든 외부 알림 30일 Snooze"}
            </button>
          </div>

          {/* Preference Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Category Preferences */}
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sliders size={14} className="text-brand-primary" /> 업무별 수신 채널 설정
                </h4>
                <span className="text-[10px] text-white/40">카테고리별 개별 On/Off</span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { key: "course" as NotificationCategory, label: "🎓 교육/강의 알림", desc: "결제 완료, 개강 D-1 리마인더, 강사 역제안 소식" },
                  { key: "startup" as NotificationCategory, label: "🚀 스타트업/IR 알림", desc: "투자 미팅 제안, 빌더 역제안서 등록, IR 승격 안내" },
                  { key: "teambuilding" as NotificationCategory, label: "🤝 팀 빌딩 알림", desc: "팀 합류 제안 및 구인 공고 지원자 등록" },
                  { key: "community" as NotificationCategory, label: "💬 커뮤니티 알림", desc: "내 글의 댓글/답글 및 멘션" },
                ].map((cat) => {
                  const channels = preferences?.categories[cat.key] || ["inapp", "email"];
                  return (
                    <div key={cat.key} className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{cat.label}</span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-[10px] text-white/70 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={channels.includes("inapp")}
                              onChange={() => handleToggleChannel(cat.key, "inapp")}
                              className="rounded border-white/20 text-brand-primary"
                            />
                            인앱
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-white/70 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={channels.includes("email")}
                              onChange={() => handleToggleChannel(cat.key, "email")}
                              className="rounded border-white/20 text-brand-primary"
                            />
                            이메일
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-white/70 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={channels.includes("alimtalk")}
                              onChange={() => handleToggleChannel(cat.key, "alimtalk")}
                              className="rounded border-white/20 text-brand-primary"
                            />
                            알림톡
                          </label>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/50">{cat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Night Mode & Email Preview Box */}
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Moon size={14} className="text-indigo-400" /> 야간 방해금지 시간대
                  </h4>
                  <button
                    onClick={handleToggleNightMode}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-bold cursor-pointer transition-colors ${
                      preferences?.nightTimeMuted
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {preferences?.nightTimeMuted ? "활성화됨" : "해제됨"}
                  </button>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  야간(21:00 ~ 08:00)에는 외부 이메일/알림톡 발송을 자동 제한하고 인앱에만 조용히 보관합니다.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3.5 shadow-md">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Mail size={14} className="text-brand-tertiary" /> 유입 유도 반응형 이메일 미리보기
                </h4>
                <p className="text-xs text-white/60">
                  실제 사용자에게 발송되는 호기심 갭 이메일 템플릿 렌더링 화면을 확인하세요.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenEmailPreview("TEAM_PROPOSAL_RECEIVED")}
                  className="w-full py-2.5 px-3 rounded-xl bg-brand-surface-high hover:bg-brand-surface-highest text-white border border-brand-border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye size={13} /> 이메일 미리보기 모달 열기
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSavePreferences}
              disabled={isSavingPrefs}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shadow-md flex items-center gap-1.5"
            >
              <CheckCircle size={14} /> 설정 저장하기
            </button>
          </div>
        </div>
      )}

      {/* ── Email Preview Modal ── */}
      {showEmailPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-brand-card border border-brand-border/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-brand-border/40 flex justify-between items-center bg-brand-surface-low">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-brand-primary" />
                <h3 className="font-display font-bold text-white text-sm">
                  반응형 이메일 발송 미리보기
                </h3>
              </div>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="text-brand-on-surface-variant hover:text-white p-1 rounded-lg hover:bg-brand-surface-high transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-brand-surface-low/60 border-b border-brand-border/30 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-brand-on-surface-variant text-[11px] font-bold shrink-0">템플릿 선택:</span>
              {[
                { code: "TEAM_PROPOSAL_RECEIVED", label: "🤝 팀 합류 제안" },
                { code: "COURSE_D1_REMINDER", label: "🎓 강의 시작 D-1" },
                { code: "INVESTMENT_PROPOSAL_RECEIVED", label: "💼 투자자 제안" },
                { code: "POST_COMMENT_RECEIVED", label: "💬 게시글 새 댓글" },
              ].map((t) => (
                <button
                  key={t.code}
                  onClick={() => handleOpenEmailPreview(t.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    previewTemplateCode === t.code
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-brand-surface-high text-brand-on-surface-variant hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-black/40">
              <div
                className="rounded-xl overflow-hidden border border-brand-border/40 shadow-inner"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>

            <div className="p-3 bg-brand-surface-low border-t border-brand-border/40 flex justify-between items-center text-[11px] text-brand-on-surface-variant">
              <span>💡 호기심 유발 후킹 문구 및 스마트 딥링크 CTA, 1-Click 수신거부가 포함되어 있습니다.</span>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-brand-surface-high hover:bg-brand-surface-highest text-white font-bold transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
