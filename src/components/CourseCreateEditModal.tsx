import React from "react";
import {
  X,
  Sparkles,
  Bot,
  Send,
  Calendar as CalendarIcon,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import type { Course, CurriculumItem } from "../types";
import { api } from "../lib/api";
import { useToast } from "./common/Toast";

interface CourseCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: Course | null;
  onSave: (course: Course) => void;
  instructorName?: string;
}

export default function CourseCreateEditModal({
  isOpen,
  onClose,
  initialCourse,
  onSave,
  instructorName = "김소현",
}: CourseCreateEditModalProps) {
  const toast = useToast();

  const [createStep, setCreateStep] = React.useState<"ai_chat" | "detail_edit">(
    initialCourse ? "detail_edit" : "ai_chat"
  );
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
  const [courseTitle, setCourseTitle] = React.useState(initialCourse?.title || "");
  const [courseCategory, setCourseCategory] = React.useState<Course["category"]>(
    initialCourse?.category || "AI 모델링"
  );
  const [courseDesc, setCourseDesc] = React.useState(initialCourse?.description || "");
  const [coursePrice, setCoursePrice] = React.useState(initialCourse?.price || 590000);
  const [deliveryType, setDeliveryType] = React.useState<"online" | "offline" | "vod" | "hybrid">(
    initialCourse?.deliveryType || "online"
  );
  const [courseLocation, setCourseLocation] = React.useState(initialCourse?.location || "");
  const [liveMeetingUrl, setLiveMeetingUrl] = React.useState(initialCourse?.liveMeetingUrl || "");
  const [startDate, setStartDate] = React.useState(initialCourse?.schedule?.startDate || "2025-09-01");
  const [endDate, setEndDate] = React.useState(initialCourse?.schedule?.endDate || "2025-10-15");
  const [selectedDays, setSelectedDays] = React.useState<string[]>(
    initialCourse?.schedule?.daysOfWeek || ["화", "목"]
  );
  const [timeSlot, setTimeSlot] = React.useState(initialCourse?.schedule?.timeSlot || "19:30 ~ 21:30");
  const [curriculumDraft, setCurriculumDraft] = React.useState<CurriculumItem[]>(
    initialCourse?.curriculum || [
      { week: 1, sessionNumber: 1, title: "오리엔테이션 & 기초 이해", description: "강의 개요 및 환경 설정", duration: "2시간", date: "2025-09-02", dayOfWeek: "화", time: "19:30 ~ 21:30" },
      { week: 1, sessionNumber: 2, title: "실전 프레임워크 설계", description: "기본 모델 아키텍처 실습", duration: "2시간", date: "2025-09-04", dayOfWeek: "목", time: "19:30 ~ 21:30" },
      { week: 2, sessionNumber: 3, title: "고급 에이전트 구축 실습", description: "멀티 에이전트 오케스트레이션", duration: "2시간", date: "2025-09-09", dayOfWeek: "화", time: "19:30 ~ 21:30" },
      { week: 2, sessionNumber: 4, title: "비즈니스 배포 및 운영", description: "클라우드 인프라 & 모니터링", duration: "2시간", date: "2025-09-11", dayOfWeek: "목", time: "19:30 ~ 21:30" },
    ]
  );

  React.useEffect(() => {
    if (initialCourse) {
      setCourseTitle(initialCourse.title);
      setCourseCategory(initialCourse.category);
      setCourseDesc(initialCourse.description);
      setCoursePrice(initialCourse.price);
      setDeliveryType(initialCourse.deliveryType || "online");
      setCourseLocation(initialCourse.location || "");
      setLiveMeetingUrl(initialCourse.liveMeetingUrl || "");
      if (initialCourse.schedule) {
        setStartDate(initialCourse.schedule.startDate);
        setEndDate(initialCourse.schedule.endDate);
        setSelectedDays(initialCourse.schedule.daysOfWeek || ["화", "목"]);
        setTimeSlot(initialCourse.schedule.timeSlot);
      }
      if (initialCourse.curriculum) {
        setCurriculumDraft(initialCourse.curriculum);
      }
      setCreateStep("detail_edit");
    }
  }, [initialCourse]);

  if (!isOpen) return null;

  // ── AI Chat Draft Generation Handler ──
  const handleGenerateFromAi = async () => {
    if (!aiPrompt.trim()) return;

    const userText = aiPrompt;
    setAiPrompt("");
    setAiChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsAiGenerating(true);

    try {
      const res = await api.aiAutoFill({
        type: "course",
        prompt: userText,
      });

      const draft = res?.result || {};
      const generatedDraft: Partial<Course> = {
        title: draft.refinedTitle || `[실전] ${userText.slice(0, 15)} 마스터클래스`,
        category: draft.naturalCategory || "실전 AI 모델링 / LLM",
        description: draft.description || `${userText} 실전 마스터 코스`,
        price: draft.price || 590000,
        discountedPrice: draft.discountedPrice || 390000,
        deliveryType: draft.deliveryType || "online",
        location: draft.location || "",
        liveMeetingUrl: draft.liveMeetingUrl || "",
        schedule: {
          startDate: "2025-09-02",
          endDate: "2025-10-14",
          daysOfWeek: ["화", "목"],
          timeSlot: "19:30 ~ 21:30",
          totalSessions: draft.curriculum?.length || 8,
          scheduleType: "stepping_stone",
        },
        curriculum: draft.curriculum || [
          { week: 1, sessionNumber: 1, title: "AI 창업 아이디어 검증 및 환경 설정", description: "시장 가설 수립 및 개발 환경 구성", duration: "2시간", date: "2025-09-02", dayOfWeek: "화", time: "19:30 ~ 21:30" },
          { week: 1, sessionNumber: 2, title: "프롬프트 체인 & RAG 파이프라인", description: "실시간 검색 증강 생성 구현", duration: "2시간", date: "2025-09-04", dayOfWeek: "목", time: "19:30 ~ 21:30" },
          { week: 2, sessionNumber: 3, title: "멀티에이전트 오케스트레이션", description: "LangGraph 기반 에이전트 협업 실습", duration: "2시간", date: "2025-09-09", dayOfWeek: "화", time: "19:30 ~ 21:30" },
          { week: 2, sessionNumber: 4, title: "상용 배포 및 비즈니스 연동", description: "클라우드 인프라 & 모니터링", duration: "2시간", date: "2025-09-11", dayOfWeek: "목", time: "19:30 ~ 21:30" },
        ],
      };

      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `요청하신 아이디어를 분석하여 **"${generatedDraft.title}"** (분야: ${generatedDraft.category}) 강의 초안과 커리큘럼을 생성했습니다!\n\n아래 '상세 편집기로 적용' 버튼을 클릭하면 진행 방식(VOD/온라인/오프라인)과 회차별 날짜를 자유롭게 조정할 수 있습니다.`,
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
    if (draft.deliveryType) setDeliveryType(draft.deliveryType);
    if (draft.location) setCourseLocation(draft.location);
    if (draft.liveMeetingUrl) setLiveMeetingUrl(draft.liveMeetingUrl);
    if (draft.schedule?.startDate) setStartDate(draft.schedule.startDate);
    if (draft.schedule?.endDate) setEndDate(draft.schedule.endDate);
    if (draft.schedule?.daysOfWeek) setSelectedDays(draft.schedule.daysOfWeek);
    if (draft.schedule?.timeSlot) setTimeSlot(draft.schedule.timeSlot);
    if (draft.curriculum) setCurriculumDraft(draft.curriculum as CurriculumItem[]);

    setCreateStep("detail_edit");
  };

  // Helper: Get Day of Week from Date string (YYYY-MM-DD)
  const getDayNameFromDateStr = (dateStr: string): string => {
    if (!dateStr) return "화";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
        return dayNames[d.getDay()] || "화";
      }
    } catch {
      // fallback
    }
    return "화";
  };

  // Auto Generate Stepping Stone Schedule Dates
  const handleAutoGenerateSchedule = () => {
    if (!startDate || selectedDays.length === 0) return;

    const dayNameToNum: Record<string, number> = {
      일: 0,
      월: 1,
      화: 2,
      수: 3,
      목: 4,
      금: 5,
      토: 6,
    };
    const targetDays = selectedDays.map((d) => dayNameToNum[d]);

    let currentDate = new Date(startDate);
    const updated = curriculumDraft.map((item, idx) => {
      while (!targetDays.includes(currentDate.getDay())) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
      const dd = String(currentDate.getDate()).padStart(2, "0");
      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
      const dayOfWeek = dayNames[currentDate.getDay()];

      const dateStr = `${yyyy}-${mm}-${dd}`;
      currentDate.setDate(currentDate.getDate() + 1);

      return {
        ...item,
        sessionNumber: idx + 1,
        date: dateStr,
        dayOfWeek,
        time: item.time || timeSlot,
      };
    });

    setCurriculumDraft(updated);
    toast.success("달력 일정 자동 재배정", `선택한 요일(${selectedDays.join(",")})에 맞춰 ${updated.length}개 회차의 일정이 자동 배정되었습니다. 날짜를 개별 수정하실 수도 있습니다.`);
  };

  // Batch Set Delivery Type for all sessions
  const handleBatchSetDeliveryType = (type: "online" | "offline" | "vod" | "hybrid") => {
    setDeliveryType(type);
    if (type !== "hybrid") {
      setCurriculumDraft((prev) =>
        prev.map((item) => ({
          ...item,
          deliveryType: type,
        }))
      );
      toast.success(
        "전체 회차 진행 방식 일괄 변경",
        `모든 회차가 '${type === "online" ? "실시간 온라인" : type === "offline" ? "현장 오프라인" : "VOD 동영상"}'으로 일괄 지정되었습니다.`
      );
    } else {
      toast.info("회차별 맞춤 설정", "아래 회차 목록에서 각 회차별 진행 방식(온라인/오프라인/VOD)을 개별 지정하세요.");
    }
  };

  // Curriculum Item Management Handlers
  const handleAddSession = () => {
    const nextSessionNum = curriculumDraft.length + 1;
    const newSession: CurriculumItem = {
      week: Math.ceil(nextSessionNum / (selectedDays.length || 2)),
      sessionNumber: nextSessionNum,
      title: `신규 실전 세션 ${nextSessionNum}`,
      description: "세부 실습 및 질의응답",
      duration: "2시간",
      date: startDate,
      dayOfWeek: getDayNameFromDateStr(startDate),
      time: timeSlot,
      deliveryType: deliveryType === "hybrid" ? "online" : deliveryType,
    };
    setCurriculumDraft((prev) => [...prev, newSession]);
    toast.info("회차 추가", `${nextSessionNum}회차 커리큘럼이 추가되었습니다.`);
  };

  const handleRemoveSession = (idx: number) => {
    if (curriculumDraft.length <= 1) {
      toast.warning("최소 1회차 필요", "강의 커리큘럼은 최소 1개 이상이어야 합니다.");
      return;
    }
    const updated = curriculumDraft.filter((_, i) => i !== idx).map((item, i) => ({
      ...item,
      sessionNumber: i + 1,
      week: Math.ceil((i + 1) / (selectedDays.length || 2)),
    }));
    setCurriculumDraft(updated);
  };

  const handleMoveSession = (idx: number, direction: "up" | "down") => {
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === curriculumDraft.length - 1)) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const updated = [...curriculumDraft];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    // Re-index sessionNumber
    setCurriculumDraft(updated.map((item, i) => ({ ...item, sessionNumber: i + 1 })));
  };

  const handleSubmit = () => {
    if (!courseTitle.trim()) {
      toast.warning("강의 제목 입력 필요", "강의 제목을 입력해주세요.");
      return;
    }
    const coursePayload: Course = {
      id: initialCourse?.id || `c-${Date.now()}`,
      title: courseTitle,
      description: courseDesc || "실전 AI 창업 집중 코스",
      category: courseCategory,
      deliveryType,
      location: (deliveryType === "offline" || deliveryType === "hybrid") ? courseLocation : undefined,
      liveMeetingUrl: (deliveryType === "online" || deliveryType === "vod" || deliveryType === "hybrid") ? liveMeetingUrl : undefined,
      instructor: initialCourse?.instructor || instructorName,
      instructorAvatar: initialCourse?.instructorAvatar || "",
      price: coursePrice,
      discountedPrice: Math.round(coursePrice * 0.8),
      thumbnail: initialCourse?.thumbnail || "",
      rating: initialCourse?.rating || 5.0,
      reviewCount: initialCourse?.reviewCount || 0,
      studentCount: initialCourse?.studentCount || 0,
      status: initialCourse?.status || "모집중",
      reviews: initialCourse?.reviews || [],
      schedule: {
        startDate,
        endDate,
        daysOfWeek: selectedDays,
        timeSlot,
        totalSessions: curriculumDraft.length,
        scheduleType: "stepping_stone",
      },
      curriculum: curriculumDraft,
    };

    onSave(coursePayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-panel-heavy rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-brand-border relative">
        <button
          onClick={onClose}
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
              <h2 className="font-display text-lg font-bold text-white">
                {initialCourse ? "강의 수정 & 커리큘럼 관리" : "AI 연계 강의 개설 & 달력 일정 등록"}
              </h2>
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
            <div>
              <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">강의 제목 *</label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="강의 제목을 입력하세요"
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">
                교육 분야 / 카테고리 (자연어 직접 입력 또는 AI 자동 생성)
              </label>
              <input
                type="text"
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                placeholder="예: 실전 AI 모델링 / LLM, 멀티에이전트 시스템, B2B SaaS 기획"
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors placeholder:text-white/30"
              />
            </div>

            {/* AI Auto-Classification Info Banner */}
            <div className="p-3 bg-gradient-to-r from-purple-500/10 via-brand-primary/10 to-transparent border border-purple-500/20 rounded-xl flex items-center gap-2.5">
              <Sparkles size={16} className="text-purple-400 shrink-0" />
              <p className="text-[11px] text-brand-on-surface-variant leading-relaxed">
                <strong className="text-purple-300 font-semibold">🤖 AI 자율 채우기 & 태깅:</strong> AI가 생성한 자연어 분야와 커리큘럼을 바로 사용할 수 있으며, 필요 시 자유롭게 수정 가능합니다.
              </p>
            </div>

            {/* 강의 진행 방식 선택 (VOD / 실시간 온라인 / 현장 오프라인 / 각 회차별 맞춤 설정) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <label className="text-xs font-semibold text-brand-on-surface-variant block">
                  강의 진행 방식 선택 *
                </label>
                <div className="flex items-center gap-1.5 bg-brand-surface-low px-2 py-1 rounded-lg border border-brand-border/40">
                  <span className="text-[10px] text-brand-on-surface-variant font-medium">모든 회차 일괄 지정:</span>
                  <button
                    type="button"
                    onClick={() => handleBatchSetDeliveryType("online")}
                    className="text-[10px] px-2 py-0.5 rounded bg-brand-surface-high hover:bg-brand-primary hover:text-white border border-brand-border/50 text-brand-primary font-bold cursor-pointer transition-all"
                  >
                    💻 온라인 일괄
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchSetDeliveryType("offline")}
                    className="text-[10px] px-2 py-0.5 rounded bg-brand-surface-high hover:bg-amber-500 hover:text-black border border-brand-border/50 text-amber-300 font-bold cursor-pointer transition-all"
                  >
                    🏢 오프라인 일괄
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchSetDeliveryType("vod")}
                    className="text-[10px] px-2 py-0.5 rounded bg-brand-surface-high hover:bg-purple-500 hover:text-white border border-brand-border/50 text-purple-300 font-bold cursor-pointer transition-all"
                  >
                    🎥 VOD 일괄
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { type: "online" as const, label: "실시간 온라인", desc: "Zoom / Meet 라이브 (전 회차)", icon: "💻" },
                  { type: "offline" as const, label: "현장 오프라인", desc: "오프라인 강의장 (전 회차)", icon: "🏢" },
                  { type: "vod" as const, label: "VOD 동영상", desc: "언제든 자유 수강 (전 회차)", icon: "🎥" },
                  { type: "hybrid" as const, label: "각 회차별 설정", desc: "회차마다 온·오프·VOD 개별 지정", icon: "🔄" },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleBatchSetDeliveryType(item.type)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      deliveryType === item.type
                        ? "bg-brand-primary-container/20 border-brand-primary text-white shadow-md shadow-brand-primary/10 ring-1 ring-brand-primary"
                        : "bg-brand-surface-low border-brand-border text-brand-on-surface-variant hover:text-white hover:border-brand-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] text-brand-on-surface-variant/80">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 진행 방식에 따른 세부 정보 (오프라인 주소 or 온라인 접속 링크) */}
            {(deliveryType === "offline" || deliveryType === "hybrid") && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-fadeIn">
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  🏢 오프라인 강의장 주소 / 장소 안내 *
                </label>
                <input
                  type="text"
                  value={courseLocation}
                  onChange={(e) => setCourseLocation(e.target.value)}
                  placeholder="예: 서울시 강남구 테헤란로 152 강남파이낸스센터 18층 아카데미룸"
                  className="w-full bg-brand-card border border-amber-500/40 rounded-lg py-1.5 px-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {(deliveryType === "online" || deliveryType === "vod" || deliveryType === "hybrid") && (
              <div className="p-3 bg-brand-primary/10 border border-brand-primary/30 rounded-xl animate-fadeIn">
                <label className="text-[11px] font-bold text-brand-primary block mb-1">
                  💻 실시간 화상 회의(Zoom/Meet) 또는 VOD 플레이어 링크
                </label>
                <input
                  type="text"
                  value={liveMeetingUrl}
                  onChange={(e) => setLiveMeetingUrl(e.target.value)}
                  placeholder="예: https://zoom.us/j/123456789 (수강생 결제 후 강의실에서 공개)"
                  className="w-full bg-brand-card border border-brand-primary/40 rounded-lg py-1.5 px-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-primary"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">수강료 (원)</label>
                <input
                  type="number"
                  value={coursePrice}
                  onChange={(e) => setCoursePrice(Number(e.target.value))}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">강사명</label>
                <input
                  type="text"
                  value={instructorName}
                  disabled
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2 px-3 text-xs text-brand-on-surface-variant/80 opacity-70"
                />
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
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CalendarIcon size={14} className="text-brand-tertiary" />
                    커리큘럼 달력 연계 설정 & 회차별 강의일 자유 수정
                  </h4>
                  <p className="text-[10px] text-brand-on-surface-variant mt-0.5">
                    징검다리 일괄 자동 배정 후에도 각 회차별 날짜를 캘린더 피커로 자유롭게 개별 조정할 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateSchedule}
                  className="text-[11px] bg-brand-primary-container/20 text-brand-primary border border-brand-primary/40 font-bold px-2.5 py-1 rounded-lg hover:bg-brand-primary-container hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw size={11} /> 징검다리 일정 자동 재배정
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-[11px] text-brand-on-surface-variant block mb-1">개강 시작일</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-brand-card border border-brand-border rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-brand-on-surface-variant block mb-1">종강 종료일</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-brand-card border border-brand-border rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-brand-on-surface-variant block mb-1">기본 진행 시간대</label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="19:30 ~ 21:30"
                    className="w-full bg-brand-card border border-brand-border rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Days of week selector (Stepping Stone) */}
              <div className="mb-4">
                <label className="text-[11px] text-brand-on-surface-variant block mb-1.5">
                  징검다리 기본 요일 지정 (선택한 요일에 순차적으로 세션이 배정됩니다)
                </label>
                <div className="flex gap-1.5">
                  {["월", "화", "수", "목", "금", "토", "일"].map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-white block">
                    회차별 커리큘럼 & 개별 강의일 설정 ({curriculumDraft.length}개 회차)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSession}
                    className="text-[10px] bg-brand-surface-high border border-brand-border/60 text-brand-primary hover:text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    + 회차 추가
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {curriculumDraft.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-brand-card rounded-xl border border-brand-border/50 text-xs flex flex-col gap-2 hover:border-brand-primary/40 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-2">
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
                          placeholder="회차 제목 (예: 프롬프트 엔지니어링 실전)"
                          className="flex-1 bg-transparent border-b border-brand-border/40 py-1 text-xs text-white font-semibold focus:outline-none focus:border-brand-primary"
                        />

                        {/* Order controls & Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSession(idx, "up")}
                            title="위로 이동"
                            className="p-1 text-brand-on-surface-variant hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === curriculumDraft.length - 1}
                            onClick={() => handleMoveSession(idx, "down")}
                            title="아래로 이동"
                            className="p-1 text-brand-on-surface-variant hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSession(idx)}
                            title="회차 삭제"
                            className="p-1 text-red-400/70 hover:text-red-400 cursor-pointer text-[11px] ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-brand-border/20 text-[11px]">
                        {/* Date Picker */}
                        <div className="flex items-center gap-1 bg-brand-surface-low px-2 py-1 rounded-lg border border-brand-border/30">
                          <span className="text-[10px] text-brand-on-surface-variant shrink-0">강의일:</span>
                          <input
                            type="date"
                            value={item.date || ""}
                            onChange={(e) => {
                              const newDate = e.target.value;
                              const updated = [...curriculumDraft];
                              updated[idx].date = newDate;
                              updated[idx].dayOfWeek = getDayNameFromDateStr(newDate);
                              setCurriculumDraft(updated);
                            }}
                            className="bg-transparent text-xs text-brand-primary font-mono focus:outline-none w-full cursor-pointer"
                          />
                          <span className="text-[10px] text-brand-on-surface-variant font-mono shrink-0">
                            ({item.dayOfWeek || "화"})
                          </span>
                        </div>

                        {/* Time Slot */}
                        <div className="flex items-center gap-1 bg-brand-surface-low px-2 py-1 rounded-lg border border-brand-border/30">
                          <span className="text-[10px] text-brand-on-surface-variant shrink-0">시간:</span>
                          <input
                            type="text"
                            value={item.time || timeSlot}
                            onChange={(e) => {
                              const updated = [...curriculumDraft];
                              updated[idx].time = e.target.value;
                              setCurriculumDraft(updated);
                            }}
                            placeholder="19:30 ~ 21:30"
                            className="bg-transparent text-xs text-white focus:outline-none w-full"
                          />
                        </div>

                        {/* Duration or Subtitle */}
                        <div className="flex items-center gap-1 bg-brand-surface-low px-2 py-1 rounded-lg border border-brand-border/30">
                          <span className="text-[10px] text-brand-on-surface-variant shrink-0">소요:</span>
                          <input
                            type="text"
                            value={item.duration || "2시간"}
                            onChange={(e) => {
                              const updated = [...curriculumDraft];
                              updated[idx].duration = e.target.value;
                              setCurriculumDraft(updated);
                            }}
                            placeholder="2시간"
                            className="bg-transparent text-xs text-white focus:outline-none w-full"
                          />
                        </div>
                      </div>

                      {/* Session Description */}
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...curriculumDraft];
                          updated[idx].description = e.target.value;
                          setCurriculumDraft(updated);
                        }}
                        placeholder="회차 세부 실습 및 다루는 내용 요약"
                        className="bg-transparent border-b border-brand-border/20 py-0.5 text-[11px] text-brand-on-surface-variant focus:outline-none focus:text-white"
                      />

                      {/* Per-Session Delivery Method Selector */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-brand-border/30 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-brand-on-surface-variant font-medium shrink-0">
                            진행 방식:
                          </span>
                          <div className="flex items-center bg-brand-surface-low rounded-lg p-0.5 border border-brand-border/40 gap-0.5">
                            {[
                              { type: "online" as const, label: "온라인", icon: "💻" },
                              { type: "offline" as const, label: "오프라인", icon: "🏢" },
                              { type: "vod" as const, label: "VOD", icon: "🎥" },
                            ].map((opt) => {
                              const currentSessionType = item.deliveryType || (deliveryType === "hybrid" ? "online" : deliveryType);
                              const isCurrent = currentSessionType === opt.type;
                              return (
                                <button
                                  key={opt.type}
                                  type="button"
                                  onClick={() => {
                                    const updated = [...curriculumDraft];
                                    updated[idx].deliveryType = opt.type;
                                    setCurriculumDraft(updated);
                                    // Check if mixed types exist
                                    const types = new Set(updated.map((s) => s.deliveryType || (deliveryType === "hybrid" ? "online" : deliveryType)));
                                    if (types.size > 1) {
                                      setDeliveryType("hybrid");
                                    }
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    isCurrent
                                      ? opt.type === "online"
                                        ? "bg-brand-primary text-white shadow-xs"
                                        : opt.type === "offline"
                                        ? "bg-amber-500 text-black shadow-xs"
                                        : "bg-purple-600 text-white shadow-xs"
                                      : "text-brand-on-surface-variant hover:text-white"
                                  }`}
                                >
                                  <span>{opt.icon}</span>
                                  <span>{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="text-[10px] font-mono shrink-0">
                          {(item.deliveryType || (deliveryType === "hybrid" ? "online" : deliveryType)) === "offline" && (
                            <span className="text-amber-300">📍 오프라인 강의장 참석</span>
                          )}
                          {(item.deliveryType || (deliveryType === "hybrid" ? "online" : deliveryType)) === "online" && (
                            <span className="text-brand-primary">💻 실시간 Zoom/Meet</span>
                          )}
                          {(item.deliveryType || (deliveryType === "hybrid" ? "online" : deliveryType)) === "vod" && (
                            <span className="text-purple-300">🎥 VOD 녹화 스트리밍</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Final Submit Buttons */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setCreateStep("ai_chat")}
                className="flex-1 border border-brand-border text-white py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-xs"
              >
                ← AI 채팅으로 돌아가기
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-brand-primary/20"
              >
                <BookOpen size={14} />
                {initialCourse ? "강의 수정 완료" : "강의 개설 및 일정 등록 완료"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
