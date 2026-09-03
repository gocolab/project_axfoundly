import React from "react";
import {
  X,
  Sparkles,
  Bot,
  Send,
  Calendar as CalendarIcon,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
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

const DEFAULT_CURRICULUM: CurriculumItem[] = [
  { week: 1, sessionNumber: 1, title: "오리엔테이션 & 시장 가설 검증", description: "강의 로드맵 및 개발/실습 환경 구축", duration: "2시간", date: "2025-09-02", dayOfWeek: "화", time: "19:30 ~ 21:30", deliveryType: "online" },
  { week: 1, sessionNumber: 2, title: "실전 프롬프트 체인 & RAG 파이프라인", description: "실시간 검색 증강 생성 아키텍처 설계", duration: "2시간", date: "2025-09-04", dayOfWeek: "목", time: "19:30 ~ 21:30", deliveryType: "online" },
  { week: 2, sessionNumber: 3, title: "멀티에이전트 오케스트레이션", description: "LangGraph 기반 자율 에이전트 협업 실습", duration: "2시간", date: "2025-09-09", dayOfWeek: "화", time: "19:30 ~ 21:30", deliveryType: "online" },
  { week: 2, sessionNumber: 4, title: "클라우드 상용 배포 및 비즈니스 연동", description: "서버 인프라 구축, 결제 연동 및 운영 모니터링", duration: "2시간", date: "2025-09-11", dayOfWeek: "목", time: "19:30 ~ 21:30", deliveryType: "online" },
];

const INITIAL_AI_MESSAGE = {
  sender: "ai" as const,
  text: `안녕하세요! 'AI로 창업하라' 강의 기획 총괄 디렉터 AI입니다. 🎓\n\n성공적인 강의 런칭을 위해 4단계 인터뷰를 진행합니다. 답변해 주시면 실무 중심 커리큘럼과 징검다리 일정을 즉시 구성해 드립니다.\n\n**[1단계: 강의 주제 & 대상]**\n어떤 주제의 강의를 개설하고 싶으신가요? 주요 타깃 수강생(예: 비개발자 창업가, 주니어 개발자, 기획자 등)과 전달하고 싶은 핵심 목표를 편하게 알려주세요.`,
};

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
  >([INITIAL_AI_MESSAGE]);
  const [isAiGenerating, setIsAiGenerating] = React.useState(false);
  const [isAutoMatching, setIsAutoMatching] = React.useState(false);
  const [interviewStep, setInterviewStep] = React.useState<number>(1);

  // Detail Form States
  const [courseTitle, setCourseTitle] = React.useState(initialCourse?.title || "");
  const [courseCategory, setCourseCategory] = React.useState<Course["category"]>(
    initialCourse?.category || "실전 AI 모델링 / LLM"
  );
  const [courseDesc, setCourseDesc] = React.useState(initialCourse?.description || "");
  const [coursePrice, setCoursePrice] = React.useState(initialCourse?.price || 590000);
  const [courseDiscountedPrice, setCourseDiscountedPrice] = React.useState(
    initialCourse?.discountedPrice || 390000
  );
  const [deliveryType, setDeliveryType] = React.useState<"online" | "offline" | "hybrid">(
    (initialCourse?.deliveryType === "offline" || initialCourse?.deliveryType === "hybrid")
      ? initialCourse.deliveryType
      : "online"
  );
  const [courseLocation, setCourseLocation] = React.useState(initialCourse?.location || "");
  const [liveMeetingUrl, setLiveMeetingUrl] = React.useState(initialCourse?.liveMeetingUrl || "");
  const [courseTags, setCourseTags] = React.useState<string[]>(
    initialCourse?.tags || ["AI창업", "프롬프트", "에이전트", "실전실습"]
  );
  const [tagInput, setTagInput] = React.useState("");
  const [startDate, setStartDate] = React.useState(initialCourse?.schedule?.startDate || "2025-09-02");
  const [endDate, setEndDate] = React.useState(initialCourse?.schedule?.endDate || "2025-10-14");
  const [selectedDays, setSelectedDays] = React.useState<string[]>(
    initialCourse?.schedule?.daysOfWeek || ["화", "목"]
  );
  const [timeSlot, setTimeSlot] = React.useState(initialCourse?.schedule?.timeSlot || "19:30 ~ 21:30");
  const [curriculumDraft, setCurriculumDraft] = React.useState<CurriculumItem[]>(
    initialCourse?.curriculum || DEFAULT_CURRICULUM
  );

  const [shouldFocusNewSession, setShouldFocusNewSession] = React.useState(false);
  const newSessionInputRef = React.useRef<HTMLInputElement | null>(null);

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

  // 1. Reset on Re-open
  React.useEffect(() => {
    if (!isOpen) return;

    if (initialCourse) {
      setCourseTitle(initialCourse.title || "");
      setCourseCategory(initialCourse.category || "실전 AI 모델링 / LLM");
      setCourseDesc(initialCourse.description || "");
      setCoursePrice(initialCourse.price || 590000);
      setCourseDiscountedPrice(initialCourse.discountedPrice || Math.round((initialCourse.price || 590000) * 0.7));
      setDeliveryType(
        (initialCourse.deliveryType === "offline" || initialCourse.deliveryType === "hybrid")
          ? initialCourse.deliveryType
          : "online"
      );
      setCourseLocation(initialCourse.location || "");
      setLiveMeetingUrl(initialCourse.liveMeetingUrl || "");
      setCourseTags(initialCourse.tags || ["AI창업", "실전실습"]);
      if (initialCourse.schedule) {
        setStartDate(initialCourse.schedule.startDate || "2025-09-02");
        setEndDate(initialCourse.schedule.endDate || "2025-10-14");
        setSelectedDays(initialCourse.schedule.daysOfWeek || ["화", "목"]);
        setTimeSlot(initialCourse.schedule.timeSlot || "19:30 ~ 21:30");
      }
      if (initialCourse.curriculum && initialCourse.curriculum.length > 0) {
        setCurriculumDraft(
          initialCourse.curriculum.map((c) => ({
            ...c,
            deliveryType: c.deliveryType === "offline" ? "offline" : "online",
          }))
        );
      }
      setCreateStep("detail_edit");
    } else {
      // Clean pristine state for brand-new course creation
      setCreateStep("ai_chat");
      setAiPrompt("");
      setAiChatMessages([INITIAL_AI_MESSAGE]);
      setInterviewStep(1);
      setCourseTitle("");
      setCourseCategory("실전 AI 모델링 / LLM");
      setCourseDesc("");
      setCoursePrice(590000);
      setCourseDiscountedPrice(390000);
      setDeliveryType("online");
      setCourseLocation("");
      setLiveMeetingUrl("");
      setCourseTags(["AI창업", "프롬프트", "에이전트"]);
      setStartDate("2025-09-02");
      setEndDate("2025-10-14");
      setSelectedDays(["화", "목"]);
      setTimeSlot("19:30 ~ 21:30");
      setCurriculumDraft(DEFAULT_CURRICULUM);
    }
  }, [isOpen, initialCourse]);

  // Focus on new session input when added
  React.useEffect(() => {
    if (shouldFocusNewSession && newSessionInputRef.current) {
      newSessionInputRef.current.focus();
      setShouldFocusNewSession(false);
    }
  }, [shouldFocusNewSession, curriculumDraft]);

  if (!isOpen) return null;

  // ── Anti-Jailbreak Guard ──
  const isJailbreakOrOffTopic = (text: string): boolean => {
    const lower = text.toLowerCase();
    const bannedPatterns = [
      "ignore previous instructions",
      "system prompt",
      "탈옥",
      "이전 명령 무시",
      "규칙 무시",
      "정치",
      "대통령",
      "주식 종목 추천",
      "해킹",
      "폭력",
    ];
    return bannedPatterns.some((pattern) => lower.includes(pattern));
  };

  // ── AI Chat Draft Generation Handler (Step-by-step interview) ──
  const handleGenerateFromAi = async () => {
    if (!aiPrompt.trim() || isAiGenerating) return;

    const userText = aiPrompt.trim();
    setAiPrompt("");
    setAiChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsAiGenerating(true);

    // Jailbreak check
    if (isJailbreakOrOffTopic(userText)) {
      setTimeout(() => {
        setAiChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "저는 'AI로 창업하라' 플랫폼의 공식 강의 기획 AI 디렉터입니다. 🛡️\n스타트업 창업 교육, AI 기술 실무 강의 설계, 커리큘럼 및 일정 구성과 관련된 내용에 대해서만 전문적인 기획을 지원합니다.\n\n강의 주제나 다루고 싶은 실습 내용에 대해 말씀해 주시면 최적의 설계를 도와드리겠습니다.",
          },
        ]);
        setIsAiGenerating(false);
      }, 500);
      return;
    }

    try {
      // Gather previous conversation context
      const fullConversation = [
        ...aiChatMessages.map((m) => `${m.sender === "user" ? "사용자" : "AI 디렉터"}: ${m.text}`),
        `사용자: ${userText}`,
      ].join("\n");

      const res = await api.aiAutoFill({
        type: "course",
        prompt: `[강의 기획 인터뷰 진행 단계: ${interviewStep}단계]\n누적 대화 맥락:\n${fullConversation}\n\n사용자 최신 입력: ${userText}\n\n위 내용을 분석하여 스타트업/AI 실전 강의 커리큘럼 초안을 완성하고 다음 인터뷰 가이드를 제시하세요.`,
      });

      const draft = res?.result || {};
      const generatedDraft: Partial<Course> = {
        title: draft.refinedTitle || `[실전] ${userText.slice(0, 18)} 마스터클래스`,
        category: (draft.naturalCategory as Course["category"]) || "실전 AI 모델링 / LLM",
        description: draft.description || `${userText} 핵심 역량 집중 실전 코스`,
        price: draft.price || 590000,
        discountedPrice: draft.discountedPrice || 390000,
        deliveryType: draft.deliveryType === "offline" ? "offline" : draft.deliveryType === "hybrid" ? "hybrid" : "online",
        location: draft.location || (draft.deliveryType === "offline" ? "서울 강남 테헤란로 오픈스페이스" : ""),
        liveMeetingUrl: draft.liveMeetingUrl || "",
        tags: draft.tags || ["AI창업", "실전프로젝트", "MVP개발"],
        schedule: {
          startDate: "2025-09-02",
          endDate: "2025-10-14",
          daysOfWeek: ["화", "목"],
          timeSlot: "19:30 ~ 21:30",
          totalSessions: draft.curriculum?.length || 4,
          scheduleType: "stepping_stone",
        },
        curriculum: draft.curriculum || [
          { week: 1, sessionNumber: 1, title: `${userText.slice(0, 10)} 개요 및 환경 세팅`, description: "기본 이론 및 실습 준비", duration: "2시간", date: "2025-09-02", dayOfWeek: "화", time: "19:30 ~ 21:30", deliveryType: "online" },
          { week: 1, sessionNumber: 2, title: "핵심 파이프라인 실전 구현", description: "아키텍처 구축 및 데이터 연동", duration: "2시간", date: "2025-09-04", dayOfWeek: "목", time: "19:30 ~ 21:30", deliveryType: "online" },
          { week: 2, sessionNumber: 3, title: "고급 최적화 및 에이전트 확장", description: "자동화 워크플로우 실무 적용", duration: "2시간", date: "2025-09-09", dayOfWeek: "화", time: "19:30 ~ 21:30", deliveryType: "online" },
          { week: 2, sessionNumber: 4, title: "최종 프로젝트 발표 및 비즈니스 배포", description: "배포 파이프라인 & 수익화 검증", duration: "2시간", date: "2025-09-11", dayOfWeek: "목", time: "19:30 ~ 21:30", deliveryType: "online" },
        ],
      };

      let nextStepGuidance = "";
      if (interviewStep === 1) {
        nextStepGuidance = `\n\n**[2단계: 교육 기간 & 회차 설계]**\n주제를 바탕으로 멋진 강의 방향이 잡혔습니다! 희망하시는 전체 회차 수(예: 4회차, 8회차)와 선호 요일(예: 매주 화/목 저녁)이 있으신가요?`;
        setInterviewStep(2);
      } else if (interviewStep === 2) {
        nextStepGuidance = `\n\n**[3단계: 강의 진행 방식 & 장소]**\n일정 구상을 확인했습니다. 실시간 온라인(Zoom/Meet), 현장 오프라인(강의장 대면), 또는 온·오프라인 혼합 중 어떤 방식으로 진행하시겠습니까? 오프라인인 경우 희망 지역/강의장도 알려주세요.`;
        setInterviewStep(3);
      } else {
        nextStepGuidance = `\n\n**[4단계: 인터뷰 완료 및 초벌 준비]**\n입력해 주신 모든 요구사항을 종합하여 완성형 커리큘럼 초안을 마련했습니다! 아래 카드의 **[상세 편집기로 적용 & 달력 설정]**을 클릭하시면 달력 연계 및 상세 수정을 이어갈 수 있습니다.`;
        setInterviewStep(4);
      }

      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `"${generatedDraft.title}" (${generatedDraft.category}) 커리큘럼 초안을 설계했습니다.${nextStepGuidance}`,
          generatedDraft,
        },
      ]);
    } catch (err) {
      console.error("AI Generation failed", err);
      toast.error("AI 초벌 생성 실패", "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // ── Apply Draft to Form ──
  const handleApplyDraft = (draft: Partial<Course>) => {
    if (draft.title) setCourseTitle(draft.title);
    if (draft.category) setCourseCategory(draft.category);
    if (draft.description) setCourseDesc(draft.description);
    if (draft.price) setCoursePrice(draft.price);
    if (draft.discountedPrice) setCourseDiscountedPrice(draft.discountedPrice);
    if (draft.deliveryType && draft.deliveryType !== "vod") {
      setDeliveryType(draft.deliveryType as "online" | "offline" | "hybrid");
    }
    if (draft.location) setCourseLocation(draft.location);
    if (draft.liveMeetingUrl) setLiveMeetingUrl(draft.liveMeetingUrl);
    if (draft.tags) setCourseTags(draft.tags);
    if (draft.schedule?.startDate) setStartDate(draft.schedule.startDate);
    if (draft.schedule?.endDate) setEndDate(draft.schedule.endDate);
    if (draft.schedule?.daysOfWeek) setSelectedDays(draft.schedule.daysOfWeek);
    if (draft.schedule?.timeSlot) setTimeSlot(draft.schedule.timeSlot);
    if (draft.curriculum) {
      setCurriculumDraft(
        draft.curriculum.map((c) => ({
          ...c,
          deliveryType: c.deliveryType === "offline" ? "offline" : "online",
        }))
      );
    }

    setCreateStep("detail_edit");
    toast.success("초벌 적용 완료", "AI가 설계한 커리큘럼과 일정이 상세 편집기에 반영되었습니다.");
  };

  // ── User Feedback: "채팅 중간에 상세로 이동하면 AI로 자동 매칭 진행" ──
  const handleTransitionToDetail = async () => {
    const userInputs = aiChatMessages.filter((m) => m.sender === "user").map((m) => m.text);

    // If user has chatted but hasn't explicitly applied a draft yet and courseTitle is still empty
    if (userInputs.length > 0 && !courseTitle.trim() && !isAutoMatching) {
      setIsAutoMatching(true);
      toast.info("AI 자동 매칭 진행 중", "지금까지의 대화 내용을 바탕으로 상세 항목을 자동 구성합니다...");

      try {
        const promptContext = userInputs.join("\n");
        const res = await api.aiAutoFill({
          type: "course",
          prompt: `사용자와의 인터뷰 대화 요약:\n${promptContext}\n\n위 내용을 바탕으로 강의 제목, 카테고리, 설명, 추천 수강료, 추천 태그, 회차별 커리큘럼을 즉시 매칭 생성해 주세요.`,
        });

        const draft = res?.result || {};
        if (draft.refinedTitle) setCourseTitle(draft.refinedTitle);
        else setCourseTitle(`[실전] ${userInputs[0]?.slice(0, 16) || "맞춤형"} 마스터클래스`);

        if (draft.naturalCategory) setCourseCategory(draft.naturalCategory as Course["category"]);
        if (draft.description) setCourseDesc(draft.description);
        if (draft.price) setCoursePrice(draft.price);
        if (draft.discountedPrice) setCourseDiscountedPrice(draft.discountedPrice);
        if (draft.tags) setCourseTags(draft.tags);
        if (draft.deliveryType && draft.deliveryType !== "vod") {
          setDeliveryType(draft.deliveryType as "online" | "offline" | "hybrid");
        }
        if (draft.curriculum && draft.curriculum.length > 0) {
          setCurriculumDraft(
            draft.curriculum.map((c: any) => ({
              ...c,
              deliveryType: c.deliveryType === "offline" ? "offline" : "online",
            }))
          );
        }
        toast.success("AI 자동 매칭 완료", "대화 내용에 맞춰 상세 및 달력 설정이 자동으로 채워졌습니다.");
      } catch (err) {
        console.error("Auto match failed", err);
      } finally {
        setIsAutoMatching(false);
      }
    }

    setCreateStep("detail_edit");
  };

  // ── User Feedback: "AI 자율 채우기 & 태깅" Button (Restored from previous version) ──
  const handleAiAutoFillAndTagging = async () => {
    setIsAutoMatching(true);
    toast.info("AI 자율 채우기 & 태깅 분석", "현재 입력된 강의 정보를 분석하여 빈 항목을 채우고 실무 태그를 생성합니다...");

    try {
      const currentContext = `
강의 제목: ${courseTitle || "미정"}
카테고리: ${courseCategory}
설명: ${courseDesc || "미정"}
진행 방식: ${deliveryType}
수강료: ${coursePrice}원
커리큘럼: ${curriculumDraft.map((c) => `${c.sessionNumber}회차: ${c.title}`).join(", ")}
      `.trim();

      const res = await api.aiAutoFill({
        type: "course",
        prompt: `다음 강의 정보를 바탕으로 보완된 강의 제목(refinedTitle), 자연어 카테고리(naturalCategory), 매력적인 강의 소개글(description), 적정 할인가격(discountedPrice), 연관 추천 실무 태그 4~6개(tags), 정교한 회차별 커리큘럼(curriculum)을 완성해 주세요:\n\n${currentContext}`,
      });

      const draft = res?.result || {};
      if (!courseTitle.trim() && draft.refinedTitle) setCourseTitle(draft.refinedTitle);
      if (draft.description && (!courseDesc.trim() || courseDesc.length < 20)) setCourseDesc(draft.description);
      if (draft.naturalCategory) setCourseCategory(draft.naturalCategory as Course["category"]);
      if (draft.discountedPrice) setCourseDiscountedPrice(draft.discountedPrice);
      if (draft.tags && Array.isArray(draft.tags)) {
        setCourseTags((prev) => Array.from(new Set([...prev, ...draft.tags])));
      }
      if (draft.curriculum && draft.curriculum.length > 0) {
        setCurriculumDraft((prev) =>
          draft.curriculum.map((c: any, i: number) => ({
            week: c.week || Math.ceil((i + 1) / (selectedDays.length || 2)),
            sessionNumber: i + 1,
            title: c.title || prev[i]?.title || `실전 세션 ${i + 1}`,
            description: c.description || prev[i]?.description || "실무 집중 실습",
            duration: c.duration || "2시간",
            date: prev[i]?.date || startDate,
            dayOfWeek: prev[i]?.dayOfWeek || "화",
            time: prev[i]?.time || timeSlot,
            deliveryType: deliveryType === "hybrid" ? (c.deliveryType === "offline" ? "offline" : "online") : deliveryType,
          }))
        );
      }

      toast.success("AI 자율 채우기 & 태깅 완료", "강의 정보가 정교화되고 맞춤 태그가 자동 추가되었습니다.");
    } catch (err) {
      console.error("AI auto fill failed", err);
      toast.error("AI 자율 채우기 오류", "잠시 후 다시 시도해 주세요.");
    } finally {
      setIsAutoMatching(false);
    }
  };

  // ── Auto Generate Stepping Stone Schedule Dates ──
  const handleAutoGenerateSchedule = () => {
    if (!startDate || selectedDays.length === 0) {
      toast.warning("시작일 및 요일 선택 필요", "개강 시작일과 최소 1개 이상의 요일을 선택해주세요.");
      return;
    }

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
    if (updated.length > 0) {
      setEndDate(updated[updated.length - 1].date);
    }
    toast.success(
      "징검다리 일정 자동 재배정 완료",
      `선택한 요일(${selectedDays.join(",")})에 맞춰 ${updated.length}개 회차의 일정이 배정되었습니다.`
    );
  };

  // ── Batch Set Delivery Type for all sessions ──
  const handleBatchSetDeliveryType = (type: "online" | "offline" | "hybrid") => {
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
        `모든 회차가 '${type === "online" ? "실시간 온라인" : "현장 오프라인"}'으로 일괄 지정되었습니다.`
      );
    } else {
      toast.info("온·오프라인 혼합 설정", "아래 회차 목록에서 각 회차별 진행 방식(온라인/오프라인)을 개별 지정하세요.");
    }
  };

  // ── Curriculum Item Management Handlers ──
  const handleAddSession = () => {
    const nextSessionNum = curriculumDraft.length + 1;
    const newSession: CurriculumItem = {
      week: Math.ceil(nextSessionNum / (selectedDays.length || 2)),
      sessionNumber: nextSessionNum,
      title: `신규 실전 세션 ${nextSessionNum}`,
      description: "세부 실습 및 프로젝트 피드백",
      duration: "2시간",
      date: startDate,
      dayOfWeek: getDayNameFromDateStr(startDate),
      time: timeSlot,
      deliveryType: deliveryType === "hybrid" ? "online" : deliveryType,
    };
    setCurriculumDraft((prev) => [...prev, newSession]);
    setShouldFocusNewSession(true);
    toast.info("회차 추가", `${nextSessionNum}회차가 추가되었습니다. 제목을 입력하세요.`);
  };

  const handleRemoveSession = (idx: number) => {
    if (curriculumDraft.length <= 1) {
      toast.warning("최소 1회차 필요", "강의 커리큘럼은 최소 1개 회차 이상이어야 합니다.");
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
    setCurriculumDraft(updated.map((item, i) => ({ ...item, sessionNumber: i + 1 })));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().replace(/^#/, "");
    if (!courseTags.includes(cleanTag)) {
      setCourseTags((prev) => [...prev, cleanTag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCourseTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // ── IME-safe Enter handler with Shift+Enter support ──
  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Prevent double firing when Korean IME is actively composing
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      handleGenerateFromAi();
    }
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
      liveMeetingUrl: (deliveryType === "online" || deliveryType === "hybrid") ? liveMeetingUrl : undefined,
      instructor: initialCourse?.instructor || instructorName,
      instructorAvatar: initialCourse?.instructorAvatar || "",
      price: coursePrice,
      discountedPrice: courseDiscountedPrice > 0 ? courseDiscountedPrice : Math.round(coursePrice * 0.7),
      tags: courseTags,
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-brand-border/30 pr-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold shadow-md shadow-brand-primary/20">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                {initialCourse ? "강의 수정 & 커리큘럼 관리" : "AI 연계 강의 개설 & 달력 일정 등록"}
              </h2>
              <p className="text-xs text-brand-on-surface-variant">
                {createStep === "ai_chat"
                  ? "1단계: 전문 AI 인터뷰 대화로 맞춤형 초벌 구성"
                  : "2단계: 상세 및 달력 설정 (회차별 일정·가격·장소)"}
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-brand-surface-low rounded-xl p-1 border border-brand-border/40 text-xs self-start sm:self-auto">
            <button
              onClick={() => setCreateStep("ai_chat")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
                createStep === "ai_chat"
                  ? "bg-brand-primary text-black font-extrabold shadow-sm"
                  : "text-brand-on-surface-variant hover:text-white"
              }`}
            >
              💬 AI 채팅 초벌
            </button>
            <button
              onClick={handleTransitionToDetail}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold flex items-center gap-1 ${
                createStep === "detail_edit"
                  ? "bg-brand-primary text-black font-extrabold shadow-sm"
                  : "text-brand-on-surface-variant hover:text-white"
              }`}
            >
              ⚙️ 상세 및 달력 설정
              {isAutoMatching && <RefreshCw size={11} className="animate-spin text-amber-300" />}
            </button>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 1: AI Chat Interface                                  */}
        {/* ────────────────────────────────────────────────────────── */}
        {createStep === "ai_chat" && (
          <div className="flex flex-col gap-4">
            {/* Step Meter Indicator */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-brand-surface-low border border-brand-border/40 text-xs">
              <div className="flex items-center gap-1.5 text-brand-on-surface-variant">
                <Bot size={14} className="text-brand-primary" />
                <span className="font-semibold text-white">기획 인터뷰 진행 상태:</span>
                <span className="text-brand-primary font-bold">{interviewStep} / 4단계</span>
              </div>
              <button
                type="button"
                onClick={handleTransitionToDetail}
                className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                대화 건너뛰고 상세 설정으로 바로 이동 <ArrowRight size={11} />
              </button>
            </div>

            {/* Chat Log Window */}
            <div className="bg-brand-surface-low rounded-xl p-4 border border-brand-border/40 h-80 overflow-y-auto flex flex-col gap-3.5">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-brand-primary text-black font-medium rounded-tr-none shadow-md"
                        : "bg-brand-card border border-brand-border text-brand-on-surface rounded-tl-none shadow"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Generated Draft Preview Card */}
                    {msg.generatedDraft && (
                      <div className="mt-3 p-3 bg-brand-surface-low rounded-xl border border-brand-primary/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-brand-primary flex items-center gap-1">
                            <Sparkles size={11} /> AI 맞춤 초안 완성
                          </span>
                          <span className="text-[10px] text-brand-on-surface-variant font-mono">
                            {msg.generatedDraft.category}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white leading-snug">{msg.generatedDraft.title}</p>
                        <p className="text-[11px] text-brand-on-surface-variant">
                          일정: {msg.generatedDraft.schedule?.startDate} ~ {msg.generatedDraft.schedule?.endDate} (매주 {msg.generatedDraft.schedule?.daysOfWeek?.join(",")})
                        </p>
                        <div className="text-[11px] text-emerald-400 font-bold">
                          예상 수강료: ₩{msg.generatedDraft.price?.toLocaleString()}원
                          {msg.generatedDraft.discountedPrice && (
                            <span className="text-white/60 font-normal ml-1">
                              (할인가: ₩{msg.generatedDraft.discountedPrice.toLocaleString()}원)
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleApplyDraft(msg.generatedDraft!)}
                          className="w-full text-xs bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-extrabold py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-md mt-1"
                        >
                          <CheckCircle2 size={13} />
                          상세 편집기로 적용 & 달력 설정 →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAiGenerating && (
                <div className="flex gap-2 items-center text-xs text-brand-primary p-2 animate-pulse">
                  <Bot size={14} />
                  AI 디렉터가 맞춤형 커리큘럼 및 징검다리 일정을 정밀 설계하고 있습니다...
                </div>
              )}
            </div>

            {/* Chat Input (Multi-line Textarea + Shift+Enter Support + Korean IME Guard) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2 items-end">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="답변을 입력하세요 (Enter: 전송, Shift+Enter: 줄바꿈)&#10;예: '비개발자 창업가를 위한 AI 자동화 4회차 강의, 매주 화/목 실시간 온라인으로 개설하고 싶어요'"
                  rows={2}
                  className="flex-1 bg-brand-surface-low border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors resize-none leading-relaxed"
                />
                <button
                  type="button"
                  onClick={handleGenerateFromAi}
                  disabled={isAiGenerating || !aiPrompt.trim()}
                  className="bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold px-4 py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50 h-[58px] shrink-0 shadow-md"
                >
                  <Send size={14} />
                  전송
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-brand-on-surface-variant/70 px-1">
                <span>💡 한글 조합 입력 중 Enter 입력 시 중복 전송 방지 처리됨</span>
                <span>탈옥 방지 및 창업 강의 최적화 모드 동작 중</span>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 2: Detail Form & Stepping Stone Calendar Linking       */}
        {/* ────────────────────────────────────────────────────────── */}
        {createStep === "detail_edit" && (
          <div className="flex flex-col gap-5 animate-fadeIn">
            {/* Top AI Auto-Fill & Tagging Action Banner (Restored from previous version) */}
            <div className="p-4 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-brand-surface-low border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-purple-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-400" /> AI 자율 채우기 & 태깅
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    스마트 기획
                  </span>
                </div>
                <p className="text-[11px] text-brand-on-surface-variant leading-relaxed">
                  현재 입력된 제목/소개를 기반으로 부족한 항목을 자율 보완하고, 수강생 검색용 실무 태그를 자동 생성합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAiAutoFillAndTagging}
                disabled={isAutoMatching}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Sparkles size={13} />
                {isAutoMatching ? "분석 및 태깅 중..." : "AI 자율 채우기 & 태깅"}
              </button>
            </div>

            {/* Basic Info: Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">
                  강의 제목 *
                </label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="예: [실전] 생성형 AI로 3일 만에 MVP 웹서비스 완성하기"
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">
                  분야 / 카테고리
                </label>
                <input
                  type="text"
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value as Course["category"])}
                  placeholder="예: 실전 AI 모델링 / LLM"
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>

            {/* Pricing Section (Standard Price + Discounted Price) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">
                  정상 수강료 (원) *
                </label>
                <input
                  type="number"
                  value={coursePrice}
                  onChange={(e) => setCoursePrice(Number(e.target.value))}
                  placeholder="590000"
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-400 block mb-1">
                  할인 수강료 (원)
                </label>
                <input
                  type="number"
                  value={courseDiscountedPrice}
                  onChange={(e) => setCourseDiscountedPrice(Number(e.target.value))}
                  placeholder="390000"
                  className="w-full bg-brand-surface-low border border-emerald-500/40 rounded-xl py-2 px-3 text-xs text-[#34d399] font-bold focus:outline-none focus:border-emerald-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">
                  강사명
                </label>
                <input
                  type="text"
                  value={instructorName}
                  disabled
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2 px-3 text-xs text-brand-on-surface-variant/80 opacity-70"
                />
              </div>
            </div>

            {/* Course Description */}
            <div>
              <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">
                강의 상세 설명 & 기대 효과
              </label>
              <textarea
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                placeholder="강의 소개, 수강 대상, 얻어갈 수 있는 실무 결과물을 입력하세요"
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors h-20 resize-none leading-relaxed"
              />
            </div>

            {/* Tags Management */}
            <div>
              <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">
                실무 스킬 태그
              </label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-brand-surface-low border border-brand-border rounded-xl">
                {courseTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-300 cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="+ 태그 입력 (Enter)"
                    className="bg-transparent text-xs text-white focus:outline-none px-2 py-0.5 placeholder:text-white/30 w-28"
                  />
                  {tagInput.trim() && (
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="text-[10px] px-2 py-0.5 rounded bg-brand-surface-high text-white font-bold cursor-pointer"
                    >
                      추가
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Details (Location for Offline/Hybrid, Live Meeting URL for Online/Hybrid) */}
            {(deliveryType === "offline" || deliveryType === "hybrid") && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-fadeIn">
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  🏢 오프라인 강의장 주소 / 장소 안내 *
                </label>
                <input
                  type="text"
                  value={courseLocation}
                  onChange={(e) => setCourseLocation(e.target.value)}
                  placeholder="예: 서울시 강남구 테헤란로 152 강남파이낸스센터 18층 세미나홀"
                  className="w-full bg-brand-card border border-amber-500/40 rounded-lg py-1.5 px-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {(deliveryType === "online" || deliveryType === "hybrid") && (
              <div className="p-3 bg-brand-primary/10 border border-brand-primary/30 rounded-xl animate-fadeIn">
                <label className="text-[11px] font-bold text-brand-primary block mb-1">
                  💻 실시간 화상 회의(Zoom / Google Meet) 링크
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

            {/* Stepping-Stone Calendar Settings Section */}
            <div className="p-4 bg-brand-surface-low rounded-xl border border-brand-primary/30 space-y-3.5">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CalendarIcon size={14} className="text-brand-tertiary" />
                  커리큘럼 달력 연계 설정 & 징검다리 일정
                </h4>
                <p className="text-[10px] text-brand-on-surface-variant mt-0.5">
                  개강일과 요일을 선택하면 각 회차별 일정이 달력에 자동 매칭되며, 개별 날짜도 자유롭게 수정 가능합니다.
                </p>
              </div>

              {/* Start/End Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-brand-on-surface-variant block mb-1">개강 시작일</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-brand-card border border-brand-border rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-brand-primary cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-brand-on-surface-variant block mb-1">종강 종료일</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-brand-card border border-brand-border rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-brand-primary cursor-pointer"
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

              {/* Day of Week Selector Line (With Auto Schedule Button Relocated to the FAR RIGHT END) */}
              <div className="pt-2 border-t border-brand-border/20">
                <label className="text-[11px] text-brand-on-surface-variant block mb-1.5">
                  징검다리 기본 요일 지정 & 자동 재배정
                </label>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Mon-Sun Day Selection Buttons */}
                  <div className="flex items-center gap-1.5">
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
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-brand-primary text-black font-extrabold shadow-sm"
                              : "bg-brand-card text-brand-on-surface-variant border border-brand-border hover:text-white"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Relocated '징검다리 일정 자동 재배정' button at the far right end of the day selector line */}
                  <button
                    type="button"
                    onClick={handleAutoGenerateSchedule}
                    className="text-[11px] bg-brand-primary text-black font-extrabold px-3 py-1.5 rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ml-auto"
                  >
                    <RefreshCw size={12} />
                    징검다리 일정 자동 재배정
                  </button>
                </div>
              </div>

              {/* Curriculum Session Items List */}
              <div className="pt-3 border-t border-brand-border/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <label className="text-[11px] font-bold text-white block">
                    회차별 커리큘럼 & 개별 강의일 설정 ({curriculumDraft.length}개 회차)
                  </label>

                  {/* Relocated Batch Delivery Type Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-brand-on-surface-variant font-medium">진행방식 일괄지정:</span>
                    <button
                      type="button"
                      onClick={() => handleBatchSetDeliveryType("online")}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition-all ${
                        deliveryType === "online"
                          ? "bg-brand-primary text-black border-brand-primary"
                          : "bg-brand-surface-low text-brand-primary border-brand-border hover:text-white"
                      }`}
                    >
                      💻 온라인 일괄
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchSetDeliveryType("offline")}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition-all ${
                        deliveryType === "offline"
                          ? "bg-amber-500 text-black border-amber-500"
                          : "bg-brand-surface-low text-amber-300 border-brand-border hover:text-white"
                      }`}
                    >
                      🏢 오프라인 일괄
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchSetDeliveryType("hybrid")}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition-all ${
                        deliveryType === "hybrid"
                          ? "bg-emerald-500 text-black border-emerald-500"
                          : "bg-brand-surface-low text-emerald-300 border-brand-border hover:text-white"
                      }`}
                    >
                      🔄 회차별 혼합
                    </button>

                    {/* Add Session Button */}
                    <button
                      type="button"
                      onClick={handleAddSession}
                      className="text-[10px] bg-brand-surface-high border border-brand-border text-white hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold ml-1"
                    >
                      <Plus size={11} /> 회차 추가
                    </button>
                  </div>
                </div>

                {/* Session Cards List */}
                <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {curriculumDraft.map((item, idx) => {
                    const isLastAdded = idx === curriculumDraft.length - 1;

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-brand-card rounded-xl border border-brand-border/50 text-xs flex flex-col gap-2 hover:border-brand-primary/40 transition-colors shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                            {item.sessionNumber || idx + 1}
                          </span>
                          <input
                            ref={isLastAdded ? newSessionInputRef : null}
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...curriculumDraft];
                              updated[idx].title = e.target.value;
                              setCurriculumDraft(updated);
                            }}
                            placeholder="회차 제목 (예: 프롬프트 엔지니어링 실무)"
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
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === curriculumDraft.length - 1}
                              onClick={() => handleMoveSession(idx, "down")}
                              title="아래로 이동"
                              className="p-1 text-brand-on-surface-variant hover:text-white disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSession(idx)}
                              title="회차 삭제"
                              className="p-1 text-red-400/70 hover:text-red-400 cursor-pointer ml-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Date, Time, Duration Pickers */}
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

                          {/* Duration */}
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

                        {/* Per-Session Delivery Method Selector (Online vs Offline) */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-brand-border/20 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-brand-on-surface-variant font-medium">방식:</span>
                            <div className="flex items-center bg-brand-surface-low rounded-lg p-0.5 border border-brand-border/40 gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...curriculumDraft];
                                  updated[idx].deliveryType = "online";
                                  setCurriculumDraft(updated);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  (item.deliveryType || "online") === "online"
                                    ? "bg-brand-primary text-black shadow-xs"
                                    : "text-brand-on-surface-variant hover:text-white"
                                }`}
                              >
                                💻 온라인
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...curriculumDraft];
                                  updated[idx].deliveryType = "offline";
                                  setCurriculumDraft(updated);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  item.deliveryType === "offline"
                                    ? "bg-amber-500 text-black shadow-xs"
                                    : "text-brand-on-surface-variant hover:text-white"
                                }`}
                              >
                                🏢 오프라인
                              </button>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono text-brand-on-surface-variant">
                            {item.deliveryType === "offline" ? "📍 현장 출석 강의" : "💻 실시간 화상 라이브"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setCreateStep("ai_chat")}
                className="flex-1 border border-brand-border text-white py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-xs font-semibold"
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
