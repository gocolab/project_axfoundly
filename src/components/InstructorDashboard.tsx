import React from "react";
import {
  BookOpen,
  Users,
  DollarSign,
  Edit,
  Eye,
  Send,
  PlusCircle,
  Clock,
  ArrowUpRight,
  Mail,
  Calendar as CalendarIcon,
  Sparkles,
  Bot,
  MessageSquare,
  CheckCircle,
  X,
  RefreshCw,
  Sliders,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import type { Course, SettlementRecord, CurriculumItem, CourseSchedule, CRMMessage } from "../types";
import { api } from "../lib/api";

interface InstructorDashboardProps {

  myCourses: Course[];
  settlements: SettlementRecord[];
  onSaveCourse?: (course: Course) => void;
  onSendCRMMessage?: (msg: Omit<CRMMessage, "id" | "sentAt">) => void;
}

export default function InstructorDashboard({
  myCourses,
  settlements,
  onSaveCourse,
  onSendCRMMessage,
}: InstructorDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"courses" | "students" | "settlement">("courses");
  const [selectedCourseForCRM, setSelectedCourseForCRM] = React.useState<string>(myCourses[0]?.id || "c1");

  // Course Creation Modal States
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [createStep, setCreateStep] = React.useState<"ai_chat" | "detail_edit">("ai_chat");
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiChatMessages, setAiChatMessages] = React.useState<
    { sender: "user" | "ai"; text: string; generatedDraft?: Partial<Course> }[]
  >([
    {
      sender: "ai",
      text: "안녕하세요! 어떤 주제의 강의를 개설하고 싶으신가요? 핵심 타깃, 목표 회차, 전달하고 싶은 가치를 편하게 말씀해 주시면 맞춤형 강의 커리큘럼과 일정을 초벌 생성해 드립니다.",
    },
  ]);
  const [isAiGenerating, setIsAiGenerating] = React.useState(false);

  // Detail Form States
  const [courseTitle, setCourseTitle] = React.useState("");
  const [courseCategory, setCourseCategory] = React.useState<Course["category"]>("AI 모델링");
  const [courseDesc, setCourseDesc] = React.useState("");
  const [coursePrice, setCoursePrice] = React.useState(590000);
  const [startDate, setStartDate] = React.useState("2025-09-01");
  const [endDate, setEndDate] = React.useState("2025-10-15");
  const [selectedDays, setSelectedDays] = React.useState<string[]>(["화", "목"]);
  const [timeSlot, setTimeSlot] = React.useState("19:30 ~ 21:30");
  const [curriculumDraft, setCurriculumDraft] = React.useState<CurriculumItem[]>([
    { week: 1, sessionNumber: 1, title: "오리엔테이션 & 기초 이해", description: "강의 개요 및 환경 설정", duration: "2시간" },
    { week: 1, sessionNumber: 2, title: "실전 프레임워크 설계", description: "기본 모델 아키텍처 실습", duration: "2시간" },
  ]);

  // CRM Messaging States
  const [showMessageModal, setShowMessageModal] = React.useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);
  const [studentFilter, setStudentFilter] = React.useState<"all" | "behind" | "high">("all");
  const [messageTitle, setMessageTitle] = React.useState("");
  const [messageContent, setMessageContent] = React.useState("");
  const [messageChannels, setMessageChannels] = React.useState<{ inapp: boolean; email: boolean; alimtalk: boolean }>({
    inapp: true,
    email: true,
    alimtalk: false,
  });
  const [sentHistory, setSentHistory] = React.useState<CRMMessage[]>([
    {
      id: "crm-1",
      courseId: "c1",
      courseTitle: "AI 프로덕트 매니저 부트캠프",
      targetType: "behind",
      targetCount: 4,
      title: "3주차 과제 제출 안내 및 학습 독려",
      content: "3주차 RAG 실습 과제 마감이 다가왔습니다. 막히는 부분은 질문 남겨주세요!",
      channels: ["inapp", "email"],
      sentAt: "2025-08-10 14:30",
    },
  ]);

  const tabs = [
    { id: "courses" as const, label: "내 강의 목록", icon: <BookOpen size={14} /> },
    { id: "students" as const, label: "수강생 관리 (CRM)", icon: <Users size={14} /> },
    { id: "settlement" as const, label: "정산 관리", icon: <DollarSign size={14} /> },
  ];


  // Mock student data
  const mockStudents = [
    { id: "s1", name: "김현우", email: "hw.kim@mail.com", progress: 85, lastActive: "2시간 전" },
    { id: "s2", name: "이서연", email: "sy.lee@mail.com", progress: 42, lastActive: "1일 전" },
    { id: "s3", name: "박민재", email: "mj.park@mail.com", progress: 35, lastActive: "3일 전" },
    { id: "s4", name: "정유진", email: "yj.jung@mail.com", progress: 95, lastActive: "방금 전" },
    { id: "s5", name: "최도윤", email: "dy.choi@mail.com", progress: 28, lastActive: "4일 전" },
    { id: "s6", name: "한지우", email: "jw.han@mail.com", progress: 78, lastActive: "5시간 전" },
  ];

  const filteredStudents = mockStudents.filter((s) => {
    if (studentFilter === "behind") return s.progress < 50;
    if (studentFilter === "high") return s.progress >= 80;
    return true;
  });

  const totalRevenue = settlements.reduce((sum, s) => sum + s.netAmount, 0);

  // ── AI Chat Draft Generation Handler ──
  const handleGenerateFromAi = async () => {
    if (!aiPrompt.trim()) return;

    const userText = aiPrompt;
    setAiPrompt("");
    setAiChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsAiGenerating(true);

    try {
      const res = await api.generateCourseDraft({
        topic: userText,
        totalSessions: 12,
      });

      const draft = res.draft;
      const generatedDraft: Partial<Course> = {
        title: draft.title || `실전 ${userText.slice(0, 15)} 완성반`,
        category: (draft.category as Course["category"]) || "AI 모델링",
        description: draft.description || `${userText} 실전 마스터 코스`,
        price: draft.price || 690000,
        discountedPrice: draft.discountedPrice || 490000,
        schedule: {
          startDate: "2025-09-02",
          endDate: "2025-10-14",
          daysOfWeek: ["화", "목"],
          timeSlot: "19:30 ~ 21:30",
          totalSessions: draft.curriculum?.length || 12,
          scheduleType: "stepping_stone",
        },
        curriculum: draft.curriculum || [
          { week: 1, sessionNumber: 1, title: "AI 창업 아이디어 검증 및 세팅", description: "시장 가설 수립 및 개발 환경 구성", duration: "2시간" },
          { week: 1, sessionNumber: 2, title: "프롬프트 체인 & RAG 파이프라인", description: "실시간 검색 증강 생성 구현", duration: "2시간" },
        ],
      };

      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `요청하신 아이디어를 분석하여 **"${generatedDraft.title}"** 강의 초안과 징검다리 커리큘럼을 생성했습니다!\n\n아래 '상세 편집기로 적용' 버튼을 클릭하면 달력 연계 및 회차 일정을 자유롭게 추가 조정할 수 있습니다.`,
          generatedDraft,
        },
      ]);
    } catch (err) {
      console.error("AI Generation failed", err);
    } finally {
      setIsAiGenerating(false);
    }
  };


  // Apply draft to form
  const handleApplyDraft = (draft: Partial<Course>) => {
    if (draft.title) setCourseTitle(draft.title);
    if (draft.category) setCourseCategory(draft.category);
    if (draft.description) setCourseDesc(draft.description);
    if (draft.price) setCoursePrice(draft.price);
    if (draft.schedule) {
      setStartDate(draft.schedule.startDate);
      setEndDate(draft.schedule.endDate);
      setSelectedDays(draft.schedule.daysOfWeek);
      setTimeSlot(draft.schedule.timeSlot);
    }
    if (draft.curriculum) {
      setCurriculumDraft(draft.curriculum);
    }
    setCreateStep("detail_edit");
  };

  // Auto generate stepping-stone dates for curriculum
  const handleAutoGenerateSchedule = () => {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const targetDayIndices = selectedDays.map((d) => dayNames.indexOf(d));

    const sessions: CurriculumItem[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    let sessionCount = 0;

    while (current <= end && sessionCount < curriculumDraft.length) {
      const dayIdx = current.getDay();
      if (targetDayIndices.includes(dayIdx)) {
        sessionCount++;
        const dateStr = current.toISOString().slice(0, 10);
        const prevItem = curriculumDraft[sessionCount - 1];
        sessions.push({
          week: Math.ceil(sessionCount / selectedDays.length),
          sessionNumber: sessionCount,
          title: prevItem ? prevItem.title : `${sessionCount}회차 실전 강의`,
          description: prevItem ? prevItem.description : "강의 세부 실습 및 질의응답",
          duration: "2시간",
          date: dateStr,
          dayOfWeek: dayNames[dayIdx],
          time: timeSlot,
        });
      }
      current.setDate(current.getDate() + 1);
    }

    if (sessions.length > 0) {
      setCurriculumDraft(sessions);
      alert(`선택한 징검다리 요일(${selectedDays.join(",")})에 맞춰 총 ${sessions.length}회차 일정이 달력에 자동 배정되었습니다.`);
    }
  };

  // ── CRM Message Send Handler ──
  const handleSendMessage = () => {
    if (!messageTitle.trim() || !messageContent.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const targetCount =
      selectedStudentIds.length > 0
        ? selectedStudentIds.length
        : filteredStudents.length;

    const channels: ("email" | "alimtalk" | "inapp")[] = [];
    if (messageChannels.inapp) channels.push("inapp");
    if (messageChannels.email) channels.push("email");
    if (messageChannels.alimtalk) channels.push("alimtalk");

    const newCRM: CRMMessage = {
      id: `crm-${Date.now()}`,
      courseId: selectedCourseForCRM,
      courseTitle: myCourses.find((c) => c.id === selectedCourseForCRM)?.title || "선택 강의",
      targetType: selectedStudentIds.length > 0 ? "selected" : studentFilter,
      targetCount,
      title: messageTitle,
      content: messageContent,
      channels,
      sentAt: new Date().toLocaleString(),
    };

    setSentHistory((prev) => [newCRM, ...prev]);
    if (onSendCRMMessage) {
      onSendCRMMessage(newCRM);
    }

    setShowMessageModal(false);
    setMessageTitle("");
    setMessageContent("");
    setSelectedStudentIds([]);
    alert(`수강 대상자 ${targetCount}명에게 메시지가 성공적으로 발송되었습니다!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">강사 대시보드</h1>
          <p className="text-sm text-brand-on-surface-variant mt-1">
            AI 채팅 초벌 개설, 징검다리 일정 관리 및 수강생 타깃 CRM
          </p>
        </div>
        <button
          onClick={() => {
            setCreateStep("ai_chat");
            setShowCreateModal(true);
          }}
          className="bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs flex items-center gap-2 shadow-lg shadow-brand-primary/20"
        >
          <Sparkles size={15} />
          AI로 새 강의 개설하기
        </button>
      </div>

      {/* Quick Stat Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">내 강의</p>
          <p className="text-2xl font-bold text-white font-display mt-1">{myCourses.length}</p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">총 수강생</p>
          <p className="text-2xl font-bold text-white font-display mt-1">
            {myCourses.reduce((s, c) => s + c.studentCount, 0)}
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">진행중 세션</p>
          <p className="text-2xl font-bold text-brand-tertiary font-display mt-1">
            {myCourses.filter((c) => c.status === "진행중").length}개
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">총 수익</p>
          <p className="text-2xl font-bold text-brand-primary font-display mt-1">
            ₩{(totalRevenue / 10000).toFixed(0)}만
          </p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex gap-2 mb-6 border-b border-brand-border/30 pb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? "text-brand-primary tab-active font-bold"
                : "text-brand-on-surface-variant hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ──────────────── 1. 강의 관리 탭 ──────────────── */}
      {activeTab === "courses" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex justify-between items-center bg-brand-surface-low p-4 rounded-xl border border-brand-border/40">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-primary" />
                AI 초벌 생성 및 징검다리 달력 연동 지원
              </h3>
              <p className="text-[11px] text-brand-on-surface-variant mt-0.5">
                채팅창 대화로 강의를 자동 생성하고, 요일별 징검다리 일정을 간편하게 등록하세요.
              </p>
            </div>
            <button
              onClick={() => {
                setCreateStep("ai_chat");
                setShowCreateModal(true);
              }}
              className="text-xs bg-brand-primary-container/20 text-brand-primary border border-brand-primary/40 font-bold px-3 py-2 rounded-xl hover:bg-brand-primary-container hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={14} /> AI 강의 개설
            </button>

          </div>

          {myCourses.map((course) => (
            <div
              key={course.id}
              className="bg-brand-card border border-brand-border/60 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-700 to-purple-900 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  <BookOpen size={24} className="text-white/60" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white">{course.title}</h3>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        course.status === "모집중"
                          ? "badge-recruiting"
                          : course.status === "진행중"
                          ? "badge-progress"
                          : "badge-closed"
                      }`}
                    >
                      {course.status}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-surface-high text-brand-tertiary">
                      {course.schedule.scheduleType === "stepping_stone" ? "징검다리 일정" : "정기 일정"}
                    </span>
                  </div>

                  <p className="text-[11px] text-brand-on-surface-variant mt-1">
                    {course.category} · {course.studentCount}명 수강 · 총 {course.curriculum.length}회차 과정
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[10px] text-brand-on-surface-variant font-mono">
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={11} className="text-brand-primary" />
                      {course.schedule.startDate} ~ {course.schedule.endDate}
                    </span>
                    <span>({course.schedule.daysOfWeek.join("·")} {course.schedule.timeSlot})</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0 self-end md:self-center">
                <button
                  onClick={() => {
                    handleApplyDraft(course);
                    setShowCreateModal(true);
                  }}
                  className="text-xs bg-brand-surface-low text-brand-on-surface-variant py-2 px-3 rounded-lg border border-brand-border/30 hover:text-white hover:border-brand-primary/40 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Edit size={12} /> 수정 / 달력 설정
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──────────────── 2. 수강생 관리 (CRM) 탭 ──────────────── */}
      {activeTab === "students" && (
        <div className="flex flex-col gap-5 animate-fadeIn">
          <div>
            <h2 className="text-sm font-bold text-white">수강생 명단 및 진도 관리</h2>
            <p className="text-xs text-brand-on-surface-variant mt-0.5">강의별 수강생들의 학습 현황을 확인하고 맞춤 CRM 메시지를 발송하세요.</p>
          </div>
          {/* Top Bar: Course Selector & Filter */}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-brand-surface-low p-4 rounded-xl border border-brand-border/40">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-brand-on-surface-variant">강의 선택:</span>
              {myCourses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCourseForCRM(c.id);
                    setSelectedStudentIds([]);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    selectedCourseForCRM === c.id
                      ? "bg-brand-primary-container/20 border-brand-primary text-brand-primary font-bold"
                      : "border-brand-border text-brand-on-surface-variant hover:text-white"
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-on-surface-variant">대상 필터:</span>
              <button
                onClick={() => setStudentFilter("all")}
                className={`text-[11px] px-2.5 py-1 rounded-md border cursor-pointer ${
                  studentFilter === "all"
                    ? "bg-brand-surface-high text-white font-bold border-brand-border"
                    : "text-brand-on-surface-variant border-transparent"
                }`}
              >
                전체 ({mockStudents.length})
              </button>
              <button
                onClick={() => setStudentFilter("behind")}
                className={`text-[11px] px-2.5 py-1 rounded-md border cursor-pointer ${
                  studentFilter === "behind"
                    ? "bg-brand-accent-rose/20 text-brand-accent-rose font-bold border-brand-accent-rose/40"
                    : "text-brand-on-surface-variant border-transparent"
                }`}
              >
                진도율 50% 미만 (3명)
              </button>
              <button
                onClick={() => setStudentFilter("high")}
                className={`text-[11px] px-2.5 py-1 rounded-md border cursor-pointer ${
                  studentFilter === "high"
                    ? "bg-brand-tertiary/20 text-brand-tertiary font-bold border-brand-tertiary/40"
                    : "text-brand-on-surface-variant border-transparent"
                }`}
              >
                우수 수강생 (2명)
              </button>
            </div>
          </div>

          {/* Action Bar for Message */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedStudentIds.length === filteredStudents.length) {
                    setSelectedStudentIds([]);
                  } else {
                    setSelectedStudentIds(filteredStudents.map((s) => s.id));
                  }
                }}
                className="text-xs text-brand-on-surface-variant hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                  <CheckSquare size={14} className="text-brand-primary" />
                ) : (
                  <Square size={14} />
                )}
                전체 선택 ({selectedStudentIds.length}/{filteredStudents.length})
              </button>
            </div>

            <button
              onClick={() => setShowMessageModal(true)}
              className="text-xs bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 px-4 rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Mail size={13} />
              {selectedStudentIds.length > 0
                ? `선택한 ${selectedStudentIds.length}명에게 메시지 전송`
                : `${studentFilter === "behind" ? "진도율 미달자" : "전체 대상자"}에게 메시지 전송`}
            </button>
          </div>

          {/* Student Table */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md">
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-brand-surface-low border-b border-brand-border/30 text-[10px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
              <span className="col-span-1">선택</span>
              <span className="col-span-4">수강생</span>
              <span className="col-span-3">진도율</span>
              <span className="col-span-2">마지막 활동</span>
              <span className="col-span-2 text-right">개별 발송</span>
            </div>

            {filteredStudents.map((student) => {
              const isChecked = selectedStudentIds.includes(student.id);
              return (
                <div
                  key={student.id}
                  className={`grid grid-cols-12 gap-2 px-5 py-3 items-center border-b border-brand-border/20 last:border-0 hover:bg-brand-surface-low transition-colors ${
                    isChecked ? "bg-brand-primary-container/5" : ""
                  }`}
                >
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedStudentIds((prev) =>
                          isChecked ? prev.filter((id) => id !== student.id) : [...prev, student.id]
                        );
                      }}
                      className="rounded border-brand-border text-brand-primary focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <div className="col-span-4 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-surface-high flex items-center justify-center text-[10px] font-bold text-brand-primary">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{student.name}</p>
                      <p className="text-[10px] text-brand-on-surface-variant">{student.email}</p>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-24">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${student.progress}%`,
                            backgroundColor: student.progress < 50 ? "#f43f5e" : undefined,
                          }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-bold font-mono ${
                          student.progress < 50 ? "text-brand-accent-rose" : "text-brand-tertiary"
                        }`}
                      >
                        {student.progress}%
                      </span>
                    </div>
                  </div>
                  <span className="col-span-2 text-xs text-brand-on-surface-variant">
                    {student.lastActive}
                  </span>
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedStudentIds([student.id]);
                        setShowMessageModal(true);
                      }}
                      className="text-[10px] bg-brand-primary-container/15 text-brand-primary py-1 px-2.5 rounded-lg border border-brand-primary/30 hover:bg-brand-primary-container hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Send size={10} /> 1:1 메시지
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CRM Message Sent History Log */}
          <div className="mt-4">
            <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
              <Clock size={14} className="text-brand-primary" />
              최근 CRM 메시지 발송 이력
            </h3>
            <div className="flex flex-col gap-2.5">
              {sentHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-brand-card border border-brand-border/40 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-brand-primary-container/20 text-brand-primary font-mono">
                        {item.targetCount}명 전송
                      </span>
                      <div className="flex gap-1">
                        {item.channels.map((ch) => (
                          <span key={ch} className="text-[9px] px-1.5 py-0.2 rounded bg-brand-surface-high text-brand-on-surface-variant">
                            {ch === "inapp" ? "인앱" : ch === "email" ? "이메일" : "알림톡"}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-brand-on-surface-variant mt-1">{item.content}</p>
                  </div>
                  <span className="text-[10px] text-brand-on-surface-variant/70 font-mono whitespace-nowrap self-start sm:self-center">
                    {item.sentAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── 3. 정산 관리 탭 ──────────────── */}
      {activeTab === "settlement" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div>
            <h2 className="text-sm font-bold text-white">매출 및 정산 통계</h2>
            <p className="text-xs text-brand-on-surface-variant mt-0.5">강의별 정산 내역 및 출금 신청 현황을 투명하게 확인하세요.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center stat-shimmer">
              <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">총 매출</p>
              <p className="text-2xl font-bold text-white font-display mt-1">₩{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center stat-shimmer">
              <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">수수료 공제</p>
              <p className="text-2xl font-bold text-error font-display mt-1">
                -₩{settlements.reduce((s, r) => s + r.pgFee + r.platformFee, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center stat-shimmer">
              <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">출금 가능 정산액</p>
              <p className="text-2xl font-bold text-brand-tertiary font-display mt-1">
                ₩{settlements.filter((s) => s.status === "정산완료").reduce((sum, s) => sum + s.netAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md">
            <div className="grid grid-cols-6 gap-2 px-5 py-2.5 bg-brand-surface-low border-b border-brand-border/30 text-[10px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
              <span>기간</span>
              <span>총매출</span>
              <span>PG수수료</span>
              <span>플랫폼 수수료</span>
              <span>실 정산액</span>
              <span className="text-right">상태</span>
            </div>
            {settlements.map((record) => (
              <div
                key={record.id}
                className="grid grid-cols-6 gap-2 px-5 py-3 items-center border-b border-brand-border/20 last:border-0 hover:bg-brand-surface-low transition-colors"
              >
                <span className="text-xs text-white">{record.period}</span>
                <span className="text-xs text-brand-on-surface-variant">₩{record.totalRevenue.toLocaleString()}</span>
                <span className="text-xs text-error">-₩{record.pgFee.toLocaleString()}</span>
                <span className="text-xs text-error">-₩{record.platformFee.toLocaleString()}</span>
                <span className="text-xs font-bold text-white">₩{record.netAmount.toLocaleString()}</span>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      record.status === "정산완료"
                        ? "badge-recruiting"
                        : record.status === "출금신청"
                        ? "badge-progress"
                        : "badge-closed"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="text-xs bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 px-5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 self-start shadow-md">
            <ArrowUpRight size={14} /> 출금 신청
          </button>
        </div>
      )}

      {/* ──────────────── Modal 1: AI Chat & Curriculum Calendar Modal ──────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-brand-border relative">
            <button
              onClick={() => setShowCreateModal(false)}
              aria-label="닫기"
              className="absolute top-4 right-4 text-brand-on-surface-variant hover:text-white p-1.5 rounded-lg hover:bg-brand-surface-high transition-colors cursor-pointer z-10"
            >
              <X size={18} />
            </button>
            {/* Header */}
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-brand-border/30 pr-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary-container flex items-center justify-center text-white font-bold">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">AI 연계 강의 개설 & 달력 일정 등록</h2>
                  <p className="text-xs text-brand-on-surface-variant">
                    {createStep === "ai_chat"
                      ? "1단계: AI 채팅창으로 초벌 생성"
                      : "2단계: 상세 수정 및 커리큘럼 달력 연계 설정"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-brand-surface-low rounded-lg p-1 border border-brand-border/40 text-xs">
                  <button
                    onClick={() => setCreateStep("ai_chat")}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      createStep === "ai_chat" ? "bg-brand-primary text-white font-bold" : "text-brand-on-surface-variant"
                    }`}
                  >
                    AI 채팅 초벌
                  </button>
                  <button
                    onClick={() => setCreateStep("detail_edit")}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      createStep === "detail_edit" ? "bg-brand-primary text-white font-bold" : "text-brand-on-surface-variant"
                    }`}
                  >
                    상세 및 달력 설정
                  </button>
                </div>
              </div>
            </div>


            {/* STEP 1: AI Chat Interface */}
            {createStep === "ai_chat" && (
              <div className="flex flex-col gap-4">
                {/* Chat Log Window */}
                <div className="bg-brand-surface-low rounded-xl p-4 border border-brand-border/40 h-80 overflow-y-auto flex flex-col gap-3">
                  {aiChatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.sender === "ai" && (
                        <div className="w-7 h-7 rounded-full bg-brand-primary-container flex items-center justify-center text-white flex-shrink-0">
                          <Bot size={14} />
                        </div>
                      )}
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-brand-primary text-white rounded-tr-none shadow"
                            : "bg-brand-card border border-brand-border text-brand-on-surface rounded-tl-none shadow"
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>

                        {/* Generated Draft Preview Card */}
                        {msg.generatedDraft && (
                          <div className="mt-3 p-3 bg-brand-surface-low rounded-xl border border-brand-primary/30">
                            <span className="text-[10px] font-bold text-brand-primary block mb-1">
                              [생성된 커리큘럼 초안]
                            </span>
                            <p className="text-xs font-bold text-white">{msg.generatedDraft.title}</p>
                            <p className="text-[11px] text-brand-on-surface-variant mt-1">
                              일정: {msg.generatedDraft.schedule?.startDate} ~ {msg.generatedDraft.schedule?.endDate} (매주 {msg.generatedDraft.schedule?.daysOfWeek?.join(",")})
                            </p>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => handleApplyDraft(msg.generatedDraft!)}
                                className="w-full text-xs bg-brand-primary-container text-white font-bold py-1.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1"
                              >
                                상세 편집기로 적용 & 달력 설정 →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isAiGenerating && (
                    <div className="flex gap-2 items-center text-xs text-brand-primary p-2 animate-pulse">
                      <Bot size={14} />
                      AI가 맞춤형 커리큘럼 및 징검다리 일정을 설계하고 있습니다...
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateFromAi()}
                    placeholder="예: '비개발자 창업가를 위한 AI 자동화 에이전트 6회차 실무 강의 만들어줘'"
                    className="flex-1 bg-brand-surface-low border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors"
                  />
                  <button
                    onClick={handleGenerateFromAi}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    className="bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send size={13} />
                    생성
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Detail Form & Stepping Stone Calendar Linking */}
            {createStep === "detail_edit" && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                {/* Basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">강의 제목</label>
                    <input
                      type="text"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="강의 제목을 입력하세요"
                      className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">카테고리</label>
                    <select
                      value={courseCategory}
                      onChange={(e) => setCourseCategory(e.target.value as any)}
                      className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors"
                    >
                      <option value="AI 모델링">AI 모델링</option>
                      <option value="비즈니스 기획">비즈니스 기획</option>
                      <option value="마케팅">마케팅</option>
                      <option value="개발">개발</option>
                      <option value="디자인">디자인</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">강의 설명</label>
                  <textarea
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    placeholder="강의 세부 설명을 작성하세요"
                    className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors h-20 resize-none"
                  />
                </div>

                {/* Stepping-Stone Calendar Settings Section */}
                <div className="p-4 bg-brand-surface-low rounded-xl border border-brand-primary/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-brand-tertiary" />
                      커리큘럼 달력 연계 설정 (기간 & 징검다리 방식 날짜·시간)
                    </h4>
                    <button
                      onClick={handleAutoGenerateSchedule}
                      className="text-[11px] bg-brand-primary-container/20 text-brand-primary border border-brand-primary/40 font-bold px-2.5 py-1 rounded-lg hover:bg-brand-primary-container hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw size={11} /> 달력 일정 자동 재배정
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-[11px] text-brand-on-surface-variant block mb-1">시작일</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-brand-card border border-brand-border rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-brand-on-surface-variant block mb-1">종료일</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-brand-card border border-brand-border rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-brand-on-surface-variant block mb-1">진행 시간대</label>
                      <input
                        type="text"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        placeholder="19:30 ~ 21:30"
                        className="w-full bg-brand-card border border-brand-border rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Days of week selector (Stepping Stone) */}
                  <div className="mb-4">
                    <label className="text-[11px] text-brand-on-surface-variant block mb-1.5">
                      징검다리 요일 지정 (선택한 요일에 순차적으로 세션이 배정됩니다)
                    </label>
                    <div className="flex gap-1.5">
                      {["월", "화", "수", "목", "금", "토", "일"].map((day) => {
                        const isSelected = selectedDays.includes(day);
                        return (
                          <button
                            key={day}
                            onClick={() => {
                              setSelectedDays((prev) =>
                                isSelected ? prev.filter((d) => d !== day) : [...prev, day]
                              );
                            }}
                            className={`w-9 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-brand-primary text-white shadow-sm"
                                : "bg-brand-card text-brand-on-surface-variant border border-brand-border hover:text-white"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Curriculum Session Items List */}
                  <div>
                    <label className="text-[11px] font-bold text-white block mb-2">
                      회차별 세부 커리큘럼 & 배정된 일정 ({curriculumDraft.length}회차)
                    </label>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                      {curriculumDraft.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 bg-brand-card rounded-lg border border-brand-border/30 text-xs"
                        >
                          <span className="w-6 h-6 rounded-md bg-brand-primary-container/20 text-brand-primary flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                            {item.sessionNumber || idx + 1}
                          </span>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...curriculumDraft];
                              updated[idx].title = e.target.value;
                              setCurriculumDraft(updated);
                            }}
                            placeholder="회차 제목"
                            className="flex-1 bg-transparent border-b border-brand-border/40 text-xs text-white focus:outline-none focus:border-brand-primary"
                          />
                          <input
                            type="text"
                            value={item.date || ""}
                            onChange={(e) => {
                              const updated = [...curriculumDraft];
                              updated[idx].date = e.target.value;
                              setCurriculumDraft(updated);
                            }}
                            placeholder="2025-09-02"
                            className="w-24 bg-transparent border-b border-brand-border/40 text-[10px] text-brand-primary font-mono focus:outline-none"
                          />
                          <span className="text-[10px] text-brand-on-surface-variant font-mono">
                            {item.dayOfWeek || "화"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Final Submit Buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setCreateStep("ai_chat")}
                    className="flex-1 border border-brand-border text-white py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-xs"
                  >
                    ← AI 채팅으로 돌아가기
                  </button>
                  <button
                    onClick={() => {
                      if (!courseTitle.trim()) {
                        alert("강의 제목을 입력하세요.");
                        return;
                      }
                      const newCourse: Course = {
                        id: `c-${Date.now()}`,
                        title: courseTitle,
                        description: courseDesc || "실전 AI 창업 집중 코스",
                        category: courseCategory,
                        instructor: "김소현",
                        instructorAvatar: "",
                        price: coursePrice,
                        discountedPrice: coursePrice * 0.8,
                        thumbnail: "",
                        rating: 5.0,
                        reviewCount: 0,
                        studentCount: 0,
                        status: "모집중",
                        schedule: {
                          startDate,
                          endDate,
                          daysOfWeek: selectedDays,
                          timeSlot,
                          totalSessions: curriculumDraft.length,
                          scheduleType: "stepping_stone",
                        },
                        curriculum: curriculumDraft,
                        reviews: [],
                      };
                      if (onSaveCourse) onSaveCourse(newCourse);
                      setShowCreateModal(false);
                      alert("강의가 성공적으로 등록 및 개설되었습니다!");
                    }}
                    className="flex-1 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs shadow-md"
                  >
                    강의 개설 및 배포 완료
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── Modal 2: CRM Targeted Messaging Modal ──────────────── */}
      {showMessageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-brand-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Mail size={16} className="text-brand-primary" />
                수강 대상자 맞춤 메시지 발송
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-brand-on-surface-variant hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Audience Summary */}
            <div className="p-3 bg-brand-surface-low rounded-xl border border-brand-border/40 mb-4 text-xs">
              <span className="text-[10px] text-brand-on-surface-variant block font-mono">발송 대상자</span>
              <p className="font-bold text-brand-primary mt-0.5">
                {selectedStudentIds.length > 0
                  ? `선택한 수강생 ${selectedStudentIds.length}명`
                  : studentFilter === "behind"
                  ? "진도율 50% 미만 수강생 전체 (집중 독려)"
                  : studentFilter === "high"
                  ? "우수 수강생 전체"
                  : "현재 강의 수강생 전체 (전체 공지)"}
              </p>
            </div>

            {/* Message Template quick picker */}
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-brand-on-surface-variant block mb-1.5">
                빠른 템플릿 선택
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  {
                    title: "학습 진도 독려",
                    subject: "[알림] 실습 과제 마감 및 학습 독려 안내",
                    body: "안녕하세요! 이번 주차 실전 과제 마감이 다가왔습니다. 막히는 부분은 커뮤니티 Q&A나 댓글에 남겨주시면 피드백 드리겠습니다.",
                  },
                  {
                    title: "라이브 Q&A 공지",
                    subject: "[공지] 금주 목요일 19:30 실시간 라이브 오피스아워",
                    body: "이번 회차 실습에 대한 실시간 질의응답 오피스아워가 진행됩니다. 사전 질문을 준비해 주세요!",
                  },
                  {
                    title: "1:1 피드백 완료",
                    subject: "[피드백] 제출하신 비즈니스 캔버스 피드백이 등록되었습니다",
                    body: "제출해주신 기획안을 검토 후 피드백을 남겨드렸습니다. 확인 후 보완해 보세요.",
                  },
                ].map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMessageTitle(tmpl.subject);
                      setMessageContent(tmpl.body);
                    }}
                    className="text-[10px] bg-brand-surface-high text-brand-on-surface-variant hover:text-white px-2.5 py-1 rounded-md border border-brand-border/40 cursor-pointer"
                  >
                    + {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="메시지 제목을 입력하세요"
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2.5 px-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary"
              />
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="수강생에게 전달할 메시지 내용..."
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary h-28 resize-none"
              />

              {/* Delivery Channels */}
              <div>
                <label className="text-[11px] font-semibold text-brand-on-surface-variant block mb-1">
                  발송 채널 선택
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-brand-on-surface-variant cursor-pointer">
                    <input
                      type="checkbox"
                      checked={messageChannels.inapp}
                      onChange={(e) => setMessageChannels({ ...messageChannels, inapp: e.target.checked })}
                      className="rounded border-brand-border text-brand-primary"
                    />
                    인앱 알림
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-brand-on-surface-variant cursor-pointer">
                    <input
                      type="checkbox"
                      checked={messageChannels.email}
                      onChange={(e) => setMessageChannels({ ...messageChannels, email: e.target.checked })}
                      className="rounded border-brand-border text-brand-primary"
                    />
                    이메일 발송
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-brand-on-surface-variant cursor-pointer">
                    <input
                      type="checkbox"
                      checked={messageChannels.alimtalk}
                      onChange={(e) => setMessageChannels({ ...messageChannels, alimtalk: e.target.checked })}
                      className="rounded border-brand-border text-brand-primary"
                    />
                    카카오 알림톡
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 border border-brand-border text-white py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-xs"
                >
                  취소
                </button>
                <button
                  onClick={handleSendMessage}
                  className="flex-1 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send size={13} />
                  메시지 즉시 발송
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
