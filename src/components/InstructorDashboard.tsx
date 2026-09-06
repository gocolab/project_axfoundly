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
  Search,
  RotateCcw,
  GraduationCap,
  Undo2,
  AlertTriangle,
  CheckSquare,
  Square,
  Copy,
  UserCheck,
  Briefcase,
  ShieldCheck,
  Award,
  Trash2,
  Plus,
  ExternalLink,
  Save,
  Star,
  ChevronUp,
  ChevronDown,
  Lock,
} from "lucide-react";
import type {
  Course,
  SettlementRecord,
  CRMMessage,
  CourseStudent,
  InstructorProfile,
} from "../types";
import { api } from "../lib/api";
import Pagination from "./common/Pagination";
import SearchBar from "./common/SearchBar";
import HighlightText from "./common/HighlightText";
import { multiMatch } from "../utils/searchUtils";
import { useToast } from "./common/Toast";
import CourseCreateEditModal from "./CourseCreateEditModal";

interface InstructorDashboardProps {
  userName?: string;
  myCourses: Course[];
  settlements: SettlementRecord[];
  onSaveCourse?: (course: Course) => void;
  onSendCRMMessage?: (msg: Omit<CRMMessage, "id" | "sentAt">) => void;
  onViewCourse?: (courseId: string) => void;
  onDuplicateCourse?: (courseId: string) => Promise<Course | undefined> | void;
  isModalOpenExternal?: boolean;
  onCloseModalExternal?: () => void;
}

export default function InstructorDashboard({
  userName,
  myCourses,
  settlements,
  onSaveCourse,
  onSendCRMMessage,
  onViewCourse,
  onDuplicateCourse,
  isModalOpenExternal,
  onCloseModalExternal,
}: InstructorDashboardProps) {
  const toast = useToast();

  const [activeTab, setActiveTab] = React.useState<"courses" | "students" | "settlement" | "profile">("courses");
  const [selectedCourseForCRM, setSelectedCourseForCRM] = React.useState<string>(myCourses[0]?.id || "c1");

  // SubTab 1: Courses Search, Filter & Pagination
  const [courseStatusFilter, setCourseStatusFilter] = React.useState<"all" | "모집중" | "진행중" | "종료">("all");
  const [searchCourse, setSearchCourse] = React.useState("");
  const [coursePage, setCoursePage] = React.useState(1);
  const [courseItemsPerPage, setCourseItemsPerPage] = React.useState(5);

  // SubTab 2: Students Real Data, Filter & Pagination
  const [students, setStudents] = React.useState<CourseStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = React.useState(false);
  const [studentFilter, setStudentFilter] = React.useState<
    "all" | "in_progress" | "behind" | "high" | "completed" | "refunded"
  >("all");
  const [searchStudent, setSearchStudent] = React.useState("");
  const [studentPage, setStudentPage] = React.useState(1);
  const [studentItemsPerPage, setStudentItemsPerPage] = React.useState(6);

  // SubTab 3: Settlement Search, Filter & Pagination
  const [settlementFilter, setSettlementFilter] = React.useState<"all" | "정산완료" | "출금신청" | "대기중">("all");
  const [searchSettlement, setSearchSettlement] = React.useState("");
  const [settlementPage, setSettlementPage] = React.useState(1);
  const [settlementItemsPerPage, setSettlementItemsPerPage] = React.useState(5);

  // Course Creation / Edit Modal State
  const [showCourseModal, setShowCourseModal] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<Course | null>(null);

  React.useEffect(() => {
    if (isModalOpenExternal) {
      setEditingCourse(null);
      setShowCourseModal(true);
    }
  }, [isModalOpenExternal]);

  const [isDuplicatingCourse, setIsDuplicatingCourse] = React.useState(false);

  const handleDuplicateCourseItem = async (courseId: string) => {
    if (isDuplicatingCourse) return;
    try {
      setIsDuplicatingCourse(true);
      if (onDuplicateCourse) {
        await onDuplicateCourse(courseId);
      } else {
        const res = await api.duplicateCourse(courseId);
        if (res.course) {
          if (onSaveCourse) onSaveCourse(res.course);
          toast.success("강의 복제 완료", `'${res.course.title}' 강의가 성공적으로 등록되었습니다.`);
        }
      }
    } catch (err: any) {
      console.error("Duplicate course failed:", err);
      toast.error("강의 복제 실패", err?.message || "강의를 복제하는 중 오류가 발생했습니다.");
    } finally {
      setIsDuplicatingCourse(false);
    }
  };

  // Refund Modal State
  const [showRefundModal, setShowRefundModal] = React.useState(false);
  const [refundTargetStudent, setRefundTargetStudent] = React.useState<CourseStudent | null>(null);
  const [refundReason, setRefundReason] = React.useState("수강생 요청에 따른 직권 환불");
  const [isProcessingRefund, setIsProcessingRefund] = React.useState(false);

  // Settlement & Withdrawal States
  const [localSettlements, setLocalSettlements] = React.useState<SettlementRecord[]>(settlements);
  React.useEffect(() => {
    setLocalSettlements(settlements);
  }, [settlements]);

  const [showCourseSearchModal, setShowCourseSearchModal] = React.useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = React.useState("");

  const [showWithdrawModal, setShowWithdrawModal] = React.useState(false);
  const [withdrawAmount, setWithdrawAmount] = React.useState<number>(0);
  const [withdrawBank, setWithdrawBank] = React.useState("신한은행");
  const [withdrawAccount, setWithdrawAccount] = React.useState("");
  const [withdrawHolder, setWithdrawHolder] = React.useState("김소현");
  const [withdrawType, setWithdrawType] = React.useState<"individual" | "business">("individual");
  const [withdrawSaveToProfile, setWithdrawSaveToProfile] = React.useState(true);

  // CRM Messaging States
  const [showMessageModal, setShowMessageModal] = React.useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);
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
    { id: "students" as const, label: "수강생 관리 (수료·환불 권한)", icon: <Users size={14} /> },
    { id: "settlement" as const, label: "정산 관리", icon: <DollarSign size={14} /> },
    { id: "profile" as const, label: "강사 프로필 & 이력", icon: <UserCheck size={14} /> },
  ];

  // ── SubTab 4: Instructor Profile & Career States ──
  const [profileData, setProfileData] = React.useState<InstructorProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  const [profTitle, setProfTitle] = React.useState("");
  const [profBio, setProfBio] = React.useState("");
  const [profExpYears, setProfExpYears] = React.useState(10);
  const [profBadge, setProfBadge] = React.useState("공식 인증 전문 강사");
  const [profKeywords, setProfKeywords] = React.useState<string[]>([]);
  const [keywordInput, setKeywordInput] = React.useState("");
  const [profHighlights, setProfHighlights] = React.useState<string[]>([]);
  const [highlightInput, setHighlightInput] = React.useState("");
  const [profHistory, setProfHistory] = React.useState<string[]>([]);
  const [historyInput, setHistoryInput] = React.useState("");
  const [profExternalStudents, setProfExternalStudents] = React.useState(0);
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);

  // AI Bio Assistant Modal State
  const [showAiBioModal, setShowAiBioModal] = React.useState(false);
  const [aiRawText, setAiRawText] = React.useState("");
  const [isAiExtracting, setIsAiExtracting] = React.useState(false);

  const fetchInstructorProfile = React.useCallback(async () => {
    try {
      setIsProfileLoading(true);
      const res = await api.getInstructorProfile(userName || "김소현");
      if (res.profile) {
        setProfileData(res.profile);
        setProfTitle(res.profile.title || "");
        setProfBio(res.profile.bio || "");
        setProfExpYears(res.profile.infographic?.experienceYears ?? 10);
        setProfBadge(res.profile.infographic?.certifiedBadge || "공식 인증 전문 강사");
        setProfKeywords(res.profile.infographic?.topKeywords || ["AI창업", "실전실습"]);
        setProfHighlights(res.profile.infographic?.careerHighlights || []);
        setProfHistory(res.profile.careerHistory || []);
        setProfExternalStudents(res.profile.externalStudentCount || 0);
      }
    } catch (err) {
      console.error("Failed to load instructor profile:", err);
    } finally {
      setIsProfileLoading(false);
    }
  }, [userName]);

  React.useEffect(() => {
    fetchInstructorProfile();
  }, [fetchInstructorProfile]);

  const handleSaveInstructorProfile = async () => {
    if (!profTitle.trim()) {
      toast.warning("직함 입력 필요", "강사 대표 직함을 입력해주세요.");
      return;
    }
    try {
      setIsSavingProfile(true);
      const payload: Partial<InstructorProfile> = {
        name: userName || "김소현",
        title: profTitle,
        bio: profBio,
        externalStudentCount: Number(profExternalStudents) || 0,
        infographic: {
          experienceYears: Number(profExpYears) || 1,
          totalStudents: (profileData?.totalStudents || 0),
          satisfactionRate: profileData?.infographic?.satisfactionRate || 98,
          topKeywords: profKeywords,
          careerHighlights: profHighlights,
          certifiedBadge: profBadge,
        },
        careerHistory: profHistory,
      };
      const res = await api.updateInstructorProfile(payload);
      if (res.success && res.profile) {
        setProfileData(res.profile);
        toast.success("프로필 저장 완료", "강사 프로필 및 이력 정보가 성공적으로 반영되었습니다.");
      }
    } catch (err: any) {
      console.error("Failed to save instructor profile:", err);
      toast.error("저장 실패", "프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddKeyword = () => {
    const kw = keywordInput.trim().replace(/^#/, "");
    if (kw && !profKeywords.includes(kw)) {
      setProfKeywords([...profKeywords, kw]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setProfKeywords(profKeywords.filter((k) => k !== kwToRemove));
  };

  const handleAddHighlight = () => {
    if (highlightInput.trim() && !profHighlights.includes(highlightInput.trim())) {
      setProfHighlights([...profHighlights, highlightInput.trim()]);
      setHighlightInput("");
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setProfHighlights(profHighlights.filter((_, i) => i !== idx));
  };

  const handleMoveHighlight = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= profHighlights.length) return;
    const next = [...profHighlights];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setProfHighlights(next);
  };

  const handleAddHistory = () => {
    if (historyInput.trim()) {
      setProfHistory([...profHistory, historyInput.trim()]);
      setHistoryInput("");
    }
  };

  const handleRemoveHistory = (idx: number) => {
    setProfHistory(profHistory.filter((_, i) => i !== idx));
  };

  const handleRunAiBioExtraction = async () => {
    if (!aiRawText.trim()) {
      toast.warning("약력 텍스트 필요", "이력서나 소개글 텍스트를 입력해주세요.");
      return;
    }
    try {
      setIsAiExtracting(true);
      const res = await api.aiAutoFill({
        type: "instructor_profile",
        prompt: aiRawText,
      });
      if (res.result) {
        const d = res.result;
        if (d.title) setProfTitle(d.title);
        if (d.bio) setProfBio(d.bio);
        if (d.experienceYears) setProfExpYears(d.experienceYears);
        // certifiedBadge는 관리자 전용 승인/입력 항목이므로 AI가 임의로 덮어쓰지 않음
        if (Array.isArray(d.topKeywords) && d.topKeywords.length > 0) setProfKeywords(d.topKeywords);
        if (Array.isArray(d.careerHighlights) && d.careerHighlights.length > 0) setProfHighlights(d.careerHighlights);
        if (Array.isArray(d.careerHistory) && d.careerHistory.length > 0) setProfHistory(d.careerHistory);
        setShowAiBioModal(false);
        toast.success("AI 약력 정리 완료", "강사 프로필 및 인포그래픽 핵심 항목이 자동으로 정리되었습니다.");
      }
    } catch (err: any) {
      console.error("AI bio extraction failed:", err);
      toast.error("AI 분석 실패", "약력 자동 정리 중 오류가 발생했습니다.");
    } finally {
      setIsAiExtracting(false);
    }
  };

  // ── Load Real Students Data from API ──
  const fetchStudents = React.useCallback(async (courseId?: string) => {
    try {
      setStudentsLoading(true);
      const res = await api.getInstructorStudents(courseId);
      setStudents(res.students || []);
    } catch (err) {
      console.error("Failed to load instructor students", err);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === "students") {
      fetchStudents(selectedCourseForCRM);
    }
  }, [activeTab, selectedCourseForCRM, fetchStudents]);

  // 1. Filtered Courses
  const filteredCourses = myCourses.filter((course) => {
    const matchStatus = courseStatusFilter === "all" ? true : course.status === courseStatusFilter;
    const matchSearch = multiMatch(
      [course.title, course.category, course.description],
      searchCourse
    );
    return matchStatus && matchSearch;
  });
  const courseTotalPages = Math.ceil(filteredCourses.length / courseItemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (coursePage - 1) * courseItemsPerPage,
    coursePage * courseItemsPerPage
  );
  React.useEffect(() => {
    setCoursePage(1);
  }, [courseStatusFilter, searchCourse]);

  // 2. Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchFilter =
      studentFilter === "behind"
        ? (s.progress || 0) < 50 && !s.completed && s.paymentStatus !== "환불"
        : studentFilter === "high"
        ? (s.progress || 0) >= 80 && !s.completed && s.paymentStatus !== "환불"
        : studentFilter === "completed"
        ? s.completed
        : studentFilter === "refunded"
        ? s.paymentStatus === "환불"
        : studentFilter === "in_progress"
        ? !s.completed && s.paymentStatus !== "환불"
        : true;

    const matchSearch = multiMatch([s.name, s.email], searchStudent);
    return matchFilter && matchSearch;
  });
  const studentTotalPages = Math.ceil(filteredStudents.length / studentItemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (studentPage - 1) * studentItemsPerPage,
    studentPage * studentItemsPerPage
  );
  React.useEffect(() => {
    setStudentPage(1);
  }, [studentFilter, searchStudent]);

  // 3. Filtered Settlements
  const filteredSettlements = localSettlements.filter((record) => {
    const matchStatus = settlementFilter === "all" ? true : record.status === settlementFilter;
    const matchSearch = multiMatch([record.period, record.status], searchSettlement);
    return matchStatus && matchSearch;
  });
  const settlementTotalPages = Math.ceil(filteredSettlements.length / settlementItemsPerPage);
  const paginatedSettlements = filteredSettlements.slice(
    (settlementPage - 1) * settlementItemsPerPage,
    settlementPage * settlementItemsPerPage
  );
  React.useEffect(() => {
    setSettlementPage(1);
  }, [settlementFilter, searchSettlement]);

  const totalRevenue = localSettlements.reduce((sum, s) => sum + s.netAmount, 0);
  const availableWithdrawAmount = localSettlements
    .filter((s) => s.status === "정산완료")
    .reduce((sum, s) => sum + s.netAmount, 0);

  const handleConfirmWithdrawal = () => {
    if (withdrawAmount <= 0) {
      toast.warning("출금 금액 확인", "출금할 금액을 0원보다 크게 입력해주세요.");
      return;
    }
    if (withdrawAmount > availableWithdrawAmount) {
      toast.error("잔액 부족", "출금 가능 정산액을 초과하여 신청할 수 없습니다.");
      return;
    }
    if (!withdrawAccount.trim() || !withdrawHolder.trim()) {
      toast.warning("계좌 정보 입력", "입금받으실 계좌번호와 예금주명을 입력해주세요.");
      return;
    }

    if (withdrawSaveToProfile) {
      const savedData = {
        bank: withdrawBank,
        account: withdrawAccount,
        holder: withdrawHolder,
        type: withdrawType,
        updatedAt: new Date().toISOString(),
      };
      const userKey = `withdrawal_payout_account_${userName || "김소현"}`;
      localStorage.setItem(userKey, JSON.stringify(savedData));
      localStorage.setItem("withdrawal_payout_account_default", JSON.stringify(savedData));
    }

    let remainingToWithdraw = withdrawAmount;
    setLocalSettlements((prev) =>
      prev.map((item) => {
        if (item.status === "정산완료" && remainingToWithdraw > 0) {
          remainingToWithdraw -= item.netAmount;
          return {
            ...item,
            status: "출금신청" as const,
          };
        }
        return item;
      })
    );

    const feeAmount = Math.round(withdrawAmount * 0.033);
    const netPayout = withdrawAmount - feeAmount;

    toast.success(
      "출금 신청 완료",
      `₩${withdrawAmount.toLocaleString()} 출금 신청이 완료되었습니다. (실수령액: ₩${netPayout.toLocaleString()}, 2~3영업일 내 입금)`
    );
    setShowWithdrawModal(false);
  };

  // ── 강사 권한 1: 수료 완료 처리 핸들러 ──
  const handleCompleteStudent = async (student: CourseStudent) => {
    try {
      const res = await api.completeStudentCourse(student.courseId, student.id);
      toast.success(
        "수료 완료 처리 완료",
        `'${student.name}' 수강생의 수료 완료 승인이 정상 처리되었습니다. 수료증 발급 및 축하 알림이 발송되었습니다.`
      );
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? res.student : s))
      );
    } catch (err) {
      console.error("Complete student failed", err);
      toast.error("수료 처리 실패", "수료 처리 중 오류가 발생했습니다.");
    }
  };

  // ── 강사 권한 2: 직권 환불 처리 핸들러 ──
  const handleOpenRefundModal = (student: CourseStudent) => {
    setRefundTargetStudent(student);
    setRefundReason("수강생 요청에 따른 직권 환불 및 수강 취소");
    setShowRefundModal(true);
  };

  const handleConfirmRefund = async () => {
    if (!refundTargetStudent) return;
    try {
      setIsProcessingRefund(true);
      const res = await api.refundStudentCourse(
        refundTargetStudent.courseId,
        refundTargetStudent.id,
        refundReason
      );
      toast.success(
        "환불 처리 완료",
        `'${refundTargetStudent.name}' 수강생의 결제 취소 및 수강 환불 처리가 완료되었습니다.`
      );
      setStudents((prev) =>
        prev.map((s) => (s.id === refundTargetStudent.id ? res.student : s))
      );
      setShowRefundModal(false);
      setRefundTargetStudent(null);
    } catch (err) {
      console.error("Refund student failed", err);
      toast.error("환불 처리 실패", "환불 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessingRefund(false);
    }
  };

  // ── CRM Message Send Handler ──
  const handleSendMessage = () => {
    if (!messageTitle.trim() || !messageContent.trim()) {
      toast.warning("필수 입력 확인", "제목과 내용을 입력해주세요.");
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
      targetType: selectedStudentIds.length > 0 ? "selected" : studentFilter === "behind" ? "behind" : "all",
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
    toast.success("메시지 발송 완료", `수강 대상자 ${targetCount}명에게 메시지가 성공적으로 발송되었습니다!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">강사 대시보드</h1>
          <p className="text-sm text-brand-on-surface-variant mt-1">
            강의 생성/수정(방식·일정 자유 조정), 수강생 수료 승인 및 직권 환불 관리
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCourse(null);
            setShowCourseModal(true);
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
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">내 개설 강의</p>
          <p className="text-2xl font-bold text-white font-display mt-1">{myCourses.length}</p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">총 수강생</p>
          <p className="text-2xl font-bold text-white font-display mt-1">
            {myCourses.reduce((s, c) => s + (c.studentCount || 0), 0)}
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">진행중 세션</p>
          <p className="text-2xl font-bold text-brand-tertiary font-display mt-1">
            {myCourses.filter((c) => c.status === "진행중").length}개
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-4 stat-shimmer">
          <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">총 정산액</p>
          <p className="text-2xl font-bold text-brand-primary font-display mt-1">
            ₩{(totalRevenue / 10000).toFixed(0)}만
          </p>
        </div>
      </div>

      {/* Tabs Header */}
      <nav aria-label="강사 대시보드 탭" className="flex gap-2 mb-6 border-b border-brand-border/30 pb-px overflow-x-auto">
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
      </nav>

      {/* ──────────────── 1. 강의 관리 탭 ──────────────── */}
      {activeTab === "courses" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex justify-between items-center bg-brand-surface-low p-4 rounded-xl border border-brand-border/40">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-primary" />
                강의 진행 방식(VOD/온·오프라인) & 커리큘럼 일정 자유 수정 지원
              </h3>
              <p className="text-[11px] text-brand-on-surface-variant mt-0.5">
                AI 채팅 초벌 생성 후 회차별 강의일 캘린더 피커와 진행 방식을 자유롭게 구성하세요.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCourse(null);
                setShowCourseModal(true);
              }}
              className="text-xs bg-brand-primary-container/20 text-brand-primary border border-brand-primary/40 font-bold px-3 py-2 rounded-xl hover:bg-brand-primary-container hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Sparkles size={14} /> AI 강의 개설
            </button>
          </div>

          {/* Filter Pills & Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-xl border border-brand-border/40 self-start overflow-x-auto max-w-full">
              <button
                onClick={() => setCourseStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  courseStatusFilter === "all"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                전체 ({myCourses.length})
              </button>
              <button
                onClick={() => setCourseStatusFilter("모집중")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  courseStatusFilter === "모집중"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                모집중 ({myCourses.filter((c) => c.status === "모집중").length})
              </button>
              <button
                onClick={() => setCourseStatusFilter("진행중")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  courseStatusFilter === "진행중"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                진행중 ({myCourses.filter((c) => c.status === "진행중").length})
              </button>
              <button
                onClick={() => setCourseStatusFilter("종료")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  courseStatusFilter === "종료"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                종료 ({myCourses.filter((c) => c.status === "종료").length})
              </button>
            </div>

            <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full sm:w-auto shrink-0">
              <SearchBar
                value={searchCourse}
                onChange={setSearchCourse}
                placeholder="강의명, 카테고리 검색... (/ 단축키)"
                className="w-full sm:w-60"
              />

              {courseTotalPages > 1 && (
                <div className="ml-auto">
                  <Pagination
                    currentPage={coursePage}
                    totalPages={courseTotalPages}
                    onPageChange={setCoursePage}
                    totalItems={filteredCourses.length}
                    itemsPerPage={courseItemsPerPage}
                    onPageSizeChange={setCourseItemsPerPage}
                    pageSizeOptions={[5, 10, 20]}
                  />
                </div>
              )}
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-8 text-center">
              <p className="text-xs text-brand-on-surface-variant">일치하는 개설 강의가 없습니다.</p>
              <button
                onClick={() => {
                  setCourseStatusFilter("all");
                  setSearchCourse("");
                }}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-brand-surface-high border border-brand-border text-white text-xs font-semibold hover:bg-brand-surface-highest transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={12} /> 검색 조건 초기화
              </button>
            </div>
          ) : (
            paginatedCourses.map((course) => {
              const deliveryBadge =
                course.deliveryType === "vod"
                  ? { label: "🎥 VOD", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" }
                  : course.deliveryType === "offline"
                  ? { label: "🏢 오프라인", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" }
                  : course.deliveryType === "hybrid"
                  ? { label: "🔄 온·오프라인 혼합", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" }
                  : { label: "💻 실시간 온라인", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" };

              return (
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
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${deliveryBadge.color}`}>
                          {deliveryBadge.label}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-surface-high text-brand-tertiary">
                          {course.schedule?.scheduleType === "stepping_stone" ? "징검다리 일정" : "정기 일정"}
                        </span>
                      </div>

                      <p className="text-[11px] text-brand-on-surface-variant mt-1">
                        {course.category} · {course.studentCount}명 수강 · 총 {course.curriculum?.length || 0}회차 과정
                        {course.location && ` · 장소: ${course.location}`}
                      </p>

                      {course.schedule && (
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-brand-on-surface-variant font-mono">
                          <span className="flex items-center gap-1">
                            <CalendarIcon size={11} className="text-brand-primary" />
                            {course.schedule.startDate} ~ {course.schedule.endDate}
                          </span>
                          <span>
                            ({course.schedule.daysOfWeek?.join("·")} {course.schedule.timeSlot})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourseForCRM(course.id);
                        setActiveTab("students");
                      }}
                      className="text-xs bg-indigo-600/20 text-indigo-300 py-2 px-3 rounded-lg border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                      title="수강생 명단 및 진도 관리로 이동"
                    >
                      <Users size={12} /> 수강생 관리
                    </button>
                    {onViewCourse && (
                      <button
                        onClick={() => onViewCourse(course.id)}
                        className="text-xs bg-brand-surface-high text-white py-2 px-3 rounded-lg border border-brand-border/40 hover:bg-brand-surface-highest transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={12} /> 강의 보기
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingCourse(course);
                        setShowCourseModal(true);
                      }}
                      className="text-xs bg-brand-surface-low text-brand-on-surface-variant py-2 px-3 rounded-lg border border-brand-border/30 hover:text-white hover:border-brand-primary/40 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Edit size={12} /> 수정 / 달력 설정
                    </button>
                    <button
                      onClick={() => handleDuplicateCourseItem(course.id)}
                      disabled={isDuplicatingCourse}
                      className="text-xs bg-indigo-500/20 text-indigo-300 py-2 px-3 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/30 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium disabled:opacity-50"
                      title="이 강의를 복사하여 새 기수로 즉시 등록"
                    >
                      <Copy size={12} /> {isDuplicatingCourse ? "복사 중..." : "복사"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}



      {/* ──────────────── 2. 수강생 관리 (수료·환불 권한 강화) 탭 ──────────────── */}
      {activeTab === "students" && (
        <div className="flex flex-col gap-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Users size={16} className="text-brand-primary" />
                수강생 명단 및 강사 권한 관리 (수료 승인 · 직권 환불 · CRM)
              </h2>
              <p className="text-xs text-brand-on-surface-variant mt-0.5">
                강의별 수강생들의 진도 현황을 확인하고, <strong>[수료 완료]</strong> 승인(수료증 발급) 및 <strong>[직권 환불]</strong> 처리를 직접 수행할 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => fetchStudents(selectedCourseForCRM)}
              className="text-xs bg-brand-surface-high border border-brand-border/60 text-white hover:bg-brand-surface-highest px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw size={12} className={studentsLoading ? "animate-spin" : ""} /> 새로고침
            </button>
          </div>

          {/* Top Bar: Course Selector (최근 5개 퀵 선택 + 전체 검색 모달) */}
          <div className="flex items-center gap-2 flex-wrap bg-brand-surface-low p-3.5 rounded-xl border border-brand-border/40">
            <span className="text-xs font-semibold text-brand-on-surface-variant">강의 선택:</span>
            {myCourses.slice(0, 5).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCourseForCRM(c.id);
                  setSelectedStudentIds([]);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  selectedCourseForCRM === c.id
                    ? "bg-brand-primary-container/20 border-brand-primary text-brand-primary font-bold shadow-sm"
                    : "border-brand-border text-brand-on-surface-variant hover:text-white"
                }`}
              >
                {c.title}
              </button>
            ))}

            {selectedCourseForCRM && !myCourses.slice(0, 5).some((c) => c.id === selectedCourseForCRM) && (
              <button
                className="text-xs px-3 py-1.5 rounded-lg border bg-brand-primary-container/20 border-brand-primary text-brand-primary font-bold shadow-sm cursor-pointer"
              >
                {myCourses.find((c) => c.id === selectedCourseForCRM)?.title || "선택된 강의"}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCourseSearchModal(true)}
              className="text-xs px-3 py-1.5 rounded-lg border border-dashed border-brand-border/70 text-brand-on-surface-variant hover:text-white hover:border-brand-primary/50 transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
            >
              <Search size={11} /> 기타 강의 검색 ({myCourses.length}개 전체)
            </button>
          </div>

          {/* Filter Pills & Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-xl border border-brand-border/40 self-start overflow-x-auto max-w-full">
              <button
                onClick={() => setStudentFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  studentFilter === "all"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                전체 ({students.length})
              </button>
              <button
                onClick={() => setStudentFilter("in_progress")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  studentFilter === "in_progress"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                수강 중 ({students.filter((s) => !s.completed && s.paymentStatus !== "환불").length})
              </button>
              <button
                onClick={() => setStudentFilter("behind")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  studentFilter === "behind"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                진도율 50% 미만 ({students.filter((s) => (s.progress || 0) < 50 && !s.completed && s.paymentStatus !== "환불").length})
              </button>
              <button
                onClick={() => setStudentFilter("high")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  studentFilter === "high"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                우수 수강생 ({students.filter((s) => (s.progress || 0) >= 80 && !s.completed && s.paymentStatus !== "환불").length})
              </button>
              <button
                onClick={() => setStudentFilter("completed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  studentFilter === "completed"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-emerald-400 hover:text-white"
                }`}
              >
                🎓 수료 완료 ({students.filter((s) => s.completed).length})
              </button>
              <button
                onClick={() => setStudentFilter("refunded")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  studentFilter === "refunded"
                    ? "bg-rose-700 text-white shadow-sm"
                    : "text-rose-400 hover:text-white"
                }`}
              >
                💸 환불/취소 ({students.filter((s) => s.paymentStatus === "환불").length})
              </button>
            </div>

            <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full sm:w-auto shrink-0">
              <SearchBar
                value={searchStudent}
                onChange={setSearchStudent}
                placeholder="수강생 이름, 이메일 검색... (/ 단축키)"
                className="w-full sm:w-60"
              />

              {studentTotalPages > 1 && (
                <div className="ml-auto">
                  <Pagination
                    currentPage={studentPage}
                    totalPages={studentTotalPages}
                    onPageChange={setStudentPage}
                    totalItems={filteredStudents.length}
                    itemsPerPage={studentItemsPerPage}
                    onPageSizeChange={setStudentItemsPerPage}
                    pageSizeOptions={[6, 12, 24]}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Bar for Message */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
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
                : `${studentFilter === "behind" ? "진도율 미달자" : studentFilter === "completed" ? "수료자" : "대상자"}에게 메시지 전송`}
            </button>
          </div>

          {/* Student Table with Actions */}
          <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md">
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-brand-surface-low border-b border-brand-border/30 text-[10px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
              <span className="col-span-1">선택</span>
              <span className="col-span-3">수강생</span>
              <span className="col-span-2">진도율</span>
              <span className="col-span-2">수료 및 결제상태</span>
              <span className="col-span-2">수강등록일</span>
              <span className="col-span-2 text-right">강사 권한 액션</span>
            </div>

            {studentsLoading ? (
              <div className="px-5 py-12 text-center text-xs text-brand-on-surface-variant animate-pulse">
                수강생 목록을 불러오는 중...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-brand-on-surface-variant">
                일치하는 수강생이 없습니다.
              </div>
            ) : (
              paginatedStudents.map((student) => {
                const isChecked = selectedStudentIds.includes(student.id);
                const isRefunded = student.paymentStatus === "환불";

                return (
                  <div
                    key={student.id}
                    className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center border-b border-brand-border/20 last:border-0 hover:bg-brand-surface-low transition-colors ${
                      isChecked ? "bg-brand-primary-container/5" : ""
                    } ${isRefunded ? "opacity-60 bg-rose-950/10" : ""}`}
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
                    <div className="col-span-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-surface-high flex items-center justify-center text-[10px] font-bold text-brand-primary">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{student.name}</p>
                        <p className="text-[10px] text-brand-on-surface-variant">{student.email}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-20">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${student.progress || 0}%`,
                              backgroundColor: (student.progress || 0) < 50 ? "#f43f5e" : undefined,
                            }}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-bold font-mono ${
                            (student.progress || 0) < 50 ? "text-brand-accent-rose" : "text-brand-tertiary"
                          }`}
                        >
                          {student.progress || 0}%
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col gap-1">
                      {student.completed ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1 w-fit">
                          <CheckCircle size={10} /> 수료 완료
                        </span>
                      ) : isRefunded ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 w-fit">
                          환불 처리됨
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-surface-high text-brand-on-surface-variant w-fit">
                          수강 중
                        </span>
                      )}
                    </div>

                    <span className="col-span-2 text-xs text-brand-on-surface-variant font-mono">
                      {student.enrolledAt || "2025-08-01"}
                    </span>

                    {/* 강사 권한 Action Buttons */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5 flex-wrap">
                      {!student.completed && !isRefunded && (
                        <button
                          onClick={() => handleCompleteStudent(student)}
                          title="수강생 수료 승인 및 수료증 발급"
                          className="text-[10px] bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white py-1 px-2 rounded-lg border border-emerald-500/40 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                        >
                          <GraduationCap size={11} /> 수료
                        </button>
                      )}

                      {!isRefunded && (
                        <button
                          onClick={() => handleOpenRefundModal(student)}
                          title="수강생 결제 직권 환불 및 수강 취소"
                          className="text-[10px] bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white py-1 px-2 rounded-lg border border-rose-500/40 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                        >
                          <Undo2 size={11} /> 환불
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedStudentIds([student.id]);
                          setShowMessageModal(true);
                        }}
                        className="text-[10px] bg-brand-primary-container/15 text-brand-primary py-1 px-2 rounded-lg border border-brand-primary/30 hover:bg-brand-primary-container hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                        title="1:1 개별 메시지"
                      >
                        <Send size={10} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ──────────────── 3. 정산 관리 탭 ──────────────── */}
      {activeTab === "settlement" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">매출 및 정산 통계</h2>
              <p className="text-xs text-brand-on-surface-variant mt-0.5">강의별 정산 내역 및 출금 신청 현황을 투명하게 확인하세요.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const userKey = `withdrawal_payout_account_${userName || "김소현"}`;
                const saved = localStorage.getItem(userKey) || localStorage.getItem("withdrawal_payout_account_default");
                if (saved) {
                  try {
                    const parsed = JSON.parse(saved);
                    if (parsed.bank) setWithdrawBank(parsed.bank);
                    if (parsed.account) setWithdrawAccount(parsed.account);
                    if (parsed.holder) setWithdrawHolder(parsed.holder);
                    if (parsed.type) setWithdrawType(parsed.type);
                  } catch (e) {}
                }
                setWithdrawAmount(availableWithdrawAmount);
                setShowWithdrawModal(true);
              }}
              className="text-xs bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 px-4 rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-md"
            >
              <ArrowUpRight size={14} /> 출금 신청
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center stat-shimmer">
              <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">총 매출</p>
              <p className="text-2xl font-bold text-white font-display mt-1">₩{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center stat-shimmer">
              <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">수수료 공제</p>
              <p className="text-2xl font-bold text-error font-display mt-1">
                -₩{localSettlements.reduce((s, r) => s + r.pgFee + r.platformFee, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 text-center stat-shimmer">
              <p className="text-[10px] text-brand-on-surface-variant font-mono uppercase">출금 가능 정산액</p>
              <p className="text-2xl font-bold text-brand-tertiary font-display mt-1">
                ₩{availableWithdrawAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filter Pills & Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-xl border border-brand-border/40 self-start overflow-x-auto max-w-full">
              <button
                onClick={() => setSettlementFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  settlementFilter === "all"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                전체 ({settlements.length})
              </button>
              <button
                onClick={() => setSettlementFilter("정산완료")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  settlementFilter === "정산완료"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                정산완료 ({settlements.filter((s) => s.status === "정산완료").length})
              </button>
              <button
                onClick={() => setSettlementFilter("출금신청")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  settlementFilter === "출금신청"
                    ? "bg-brand-primary-container text-white shadow-sm"
                    : "text-brand-on-surface-variant hover:text-white"
                }`}
              >
                출금신청 ({settlements.filter((s) => s.status === "출금신청").length})
              </button>
            </div>

            <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full sm:w-auto shrink-0">
              <SearchBar
                value={searchSettlement}
                onChange={setSearchSettlement}
                placeholder="정산 기간, 상태 검색... (/ 단축키)"
                className="w-full sm:w-60"
              />

              {settlementTotalPages > 1 && (
                <div className="ml-auto">
                  <Pagination
                    currentPage={settlementPage}
                    totalPages={settlementTotalPages}
                    onPageChange={setSettlementPage}
                    totalItems={filteredSettlements.length}
                    itemsPerPage={settlementItemsPerPage}
                    onPageSizeChange={setSettlementItemsPerPage}
                    pageSizeOptions={[5, 10, 20]}
                  />
                </div>
              )}
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
            {filteredSettlements.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-brand-on-surface-variant">
                일치하는 정산 내역이 없습니다.
              </div>
            ) : (
              paginatedSettlements.map((record) => (
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
              ))
            )}
          </div>
        </div>
      )}

      {/* ──────────────── 4. 강사 프로필 & 이력 관리 탭 ──────────────── */}
      {activeTab === "profile" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Top Header Card */}
          <div className="bg-brand-surface-low p-5 rounded-2xl border border-brand-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary">
                  <Award size={18} />
                </span>
                <h3 className="font-display text-base font-bold text-white">
                  강사 프로필 & 전문성 이력 관리
                </h3>
              </div>
              <p className="text-xs text-brand-on-surface-variant">
                강의 상세 페이지의 인포그래픽 카드 및 강사 상세 모달에 노출되는 대표 직함, 경력 연차, 핵심 실적을 관리합니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAiBioModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-surface border border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                <Sparkles size={14} className="text-brand-primary" />
                AI 약력 스마트 정리
              </button>
              <button
                type="button"
                onClick={handleSaveInstructorProfile}
                disabled={isSavingProfile}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold transition-all cursor-pointer shadow-md hover:opacity-95 disabled:opacity-50 hover:scale-[1.02]"
              >
                <Save size={14} />
                {isSavingProfile ? "저장 중..." : "변경사항 저장"}
              </button>
            </div>
          </div>

          {/* 2-Column Split: Form (Left) vs Live Preview (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Form: 7 cols */}
            <div className="lg:col-span-7 space-y-6">
              {/* Section 1: 기본 직함 & 소개 */}
              <div className="bg-brand-card p-5 rounded-2xl border border-brand-border/60 shadow-md space-y-4">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5 text-brand-primary">
                  <UserCheck size={14} /> 기본 프로필 & 대표 직함
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-brand-on-surface-variant mb-1">
                      강사 이름
                    </label>
                    <input
                      type="text"
                      disabled
                      value={userName || "김소현"}
                      className="w-full bg-brand-surface-high border border-brand-border/50 rounded-xl px-3 py-2 text-xs text-white opacity-80 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-medium text-brand-on-surface-variant">
                        공식 인증 배지 문구
                      </label>
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        <Lock size={10} /> 관리자 직권 지정 항목
                      </span>
                    </div>
                    <input
                      type="text"
                      disabled
                      value={profBadge || "공식 인증 전문 강사"}
                      title="공식 인증 배지는 플랫폼 관리자 대시보드(회원 관리)에서만 승인 및 수정할 수 있습니다."
                      className="w-full bg-brand-surface-high border border-brand-border/50 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold opacity-90 cursor-not-allowed shadow-inner"
                    />
                    <p className="text-[10px] text-brand-on-surface-variant/70 mt-1">
                      * 공식 인증 배지는 관리자 검증 후 관리자 대시보드에서만 부여됩니다.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-brand-on-surface-variant mb-1">
                    대표 직함 (Title) <span className="text-brand-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={profTitle}
                    onChange={(e) => setProfTitle(e.target.value)}
                    placeholder="예: 피지컬 AI 시스템 아키텍트 & 로보틱스 엔지니어"
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-brand-on-surface-variant mb-1">
                    강사 상세 소개 (Bio)
                  </label>
                  <textarea
                    rows={3}
                    value={profBio}
                    onChange={(e) => setProfBio(e.target.value)}
                    placeholder="강사의 실무 전문 분야와 수강생들을 위한 교육/코칭 비전을 입력하세요."
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors leading-relaxed"
                  />
                </div>
              </div>

              {/* Section 2: 인포그래픽 지표 & 키워드 */}
              <div className="bg-brand-card p-5 rounded-2xl border border-brand-border/60 shadow-md space-y-4">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5 text-brand-tertiary">
                  <Award size={14} /> 인포그래픽 전문성 지표 & 키워드
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-brand-on-surface-variant mb-1">
                      실무 경력 연차 (년)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={profExpYears}
                        onChange={(e) => setProfExpYears(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors pr-10"
                      />
                      <span className="absolute right-3 top-2 text-xs text-brand-on-surface-variant">년+</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-brand-on-surface-variant mb-1">
                      외부 실무 누적 수강생 합산 (명)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        value={profExternalStudents}
                        onChange={(e) => setProfExternalStudents(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors pr-10"
                      />
                      <span className="absolute right-3 top-2 text-xs text-brand-on-surface-variant">명</span>
                    </div>
                  </div>
                </div>

                {/* Keywords Tagging */}
                <div>
                  <label className="block text-[11px] font-medium text-brand-on-surface-variant mb-1.5">
                    전문 분야 키워드 배지 (인포그래픽 하단 태그)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                      placeholder="키워드 입력 후 Enter (예: AI 에이전트)"
                      className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer border border-slate-700/60 transition-colors"
                    >
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-brand-surface-high text-brand-primary border border-brand-border/60"
                      >
                        #{kw}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="hover:text-rose-400 cursor-pointer ml-0.5"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                  {/* Quick Recommendation Chips */}
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-on-surface-variant flex-wrap">
                    <span>추천 태그:</span>
                    {["AI 에이전트", "LLM", "린스타트업", "하네스", "풀스택", "ROS2", "BM설계", "IR피칭"].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          if (!profKeywords.includes(chip)) {
                            setProfKeywords([...profKeywords, chip]);
                          }
                        }}
                        className="px-2 py-0.5 rounded bg-brand-surface-low hover:bg-brand-surface-high border border-brand-border/40 text-slate-300 hover:text-white cursor-pointer transition-colors"
                      >
                        +{chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: 핵심 실적 하이라이트 (3선) */}
              <div className="bg-brand-card p-5 rounded-2xl border border-brand-border/60 shadow-md space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5 text-[#34d399]">
                    <CheckCircle size={14} /> 인포그래픽 핵심 실적 하이라이트 (체크리스트 3선)
                  </h4>
                  <span className="text-[10px] text-brand-on-surface-variant font-mono">
                    {profHighlights.length}개 등록됨
                  </span>
                </div>
                <p className="text-[11px] text-brand-on-surface-variant leading-relaxed">
                  강의 상세 페이지 사이드바 인포그래픽 카드에 초록 체크마크와 함께 강조 노출되는 3~4개의 굵직한 실적입니다.
                </p>

                <div className="space-y-2">
                  {profHighlights.map((hl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 bg-brand-surface-low rounded-xl border border-brand-border/40 hover:border-brand-primary/40 transition-colors"
                    >
                      <CheckCircle size={13} className="text-[#34d399] flex-shrink-0" />
                      <span className="flex-1 text-xs text-white leading-relaxed">{hl}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveHighlight(idx, "up")}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === profHighlights.length - 1}
                          onClick={() => handleMoveHighlight(idx, "down")}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer ml-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    placeholder="새 핵심 실적 입력 (예: 전) 글로벌 테크 유니콘 AI PM 리드)"
                    className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer border border-slate-700/60 transition-colors flex items-center gap-1"
                  >
                    <Plus size={13} /> 추가
                  </button>
                </div>
              </div>

              {/* Section 4: 주요 경력 및 연혁 (Career History) */}
              <div className="bg-brand-card p-5 rounded-2xl border border-brand-border/60 shadow-md space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5 text-brand-secondary">
                    <Briefcase size={14} /> 주요 경력 및 연혁 (상세 모달 타임라인)
                  </h4>
                  <span className="text-[10px] text-brand-on-surface-variant font-mono">
                    {profHistory.length}개 등록됨
                  </span>
                </div>
                <p className="text-[11px] text-brand-on-surface-variant leading-relaxed">
                  수강생이 강사 카드를 클릭했을 때 열리는 상세 모달창에 타임라인 형태로 표시되는 연도별 약력입니다.
                </p>

                <div className="space-y-2">
                  {profHistory.map((hist, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 bg-brand-surface-low rounded-xl border border-brand-border/40 hover:border-brand-secondary/40 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary flex-shrink-0" />
                      <span className="flex-1 text-xs text-slate-300 leading-relaxed">{hist}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHistory(idx)}
                        className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={historyInput}
                    onChange={(e) => setHistoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHistory();
                      }
                    }}
                    placeholder="예: 2023~현재: AX Foundly 로보틱스 & AI 시스템 총괄"
                    className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddHistory}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer border border-slate-700/60 transition-colors flex items-center gap-1"
                  >
                    <Plus size={13} /> 추가
                  </button>
                </div>
              </div>
            </div>

            {/* Right Live Preview: 5 cols */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono text-brand-primary uppercase font-bold flex items-center gap-1">
                  <Eye size={13} /> 실시간 라이브 미리보기
                </span>
                <span className="text-[10px] text-brand-on-surface-variant">강의 상세 화면 연동 1:1</span>
              </div>

              {/* Exact side card preview matching CourseDetailView */}
              <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-brand-border/60">
                {/* Header Banner */}
                <div className="h-20 bg-gradient-to-r from-brand-primary-container via-brand-surface-high to-brand-primary/20 relative p-3">
                  <div className="absolute top-2.5 left-3 flex gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg backdrop-blur-md border bg-[#4f46e5]/30 border-[#6366f1]/60 text-[#a5b4fc]">
                      강사 전문성
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                      <ShieldCheck size={10} /> {profBadge || "공식 인증 전문 강사"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  {/* Instructor profile snippet */}
                  <div className="flex items-center gap-3 p-2 bg-[#0b1329] rounded-xl border border-slate-800/80 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary-container to-brand-secondary flex items-center justify-center text-white font-bold text-lg shadow">
                      {(userName || "김소현").charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1">
                        {userName || "김소현"}
                        <ExternalLink size={11} className="text-slate-400" />
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {profTitle || "대표 직함을 입력하세요"}
                      </p>
                    </div>
                  </div>

                  {/* Infographic Metric Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="p-2.5 bg-[#0b1329] rounded-lg border border-slate-800/80">
                      <p className="text-[9px] font-mono text-slate-400">경력</p>
                      <p className="text-sm font-bold text-white font-display mt-0.5">
                        {profExpYears}년+
                      </p>
                    </div>
                    <div className="p-2.5 bg-[#0b1329] rounded-lg border border-slate-800/80">
                      <p className="text-[9px] font-mono text-slate-400">누적 수강생</p>
                      <p className="text-sm font-bold text-brand-tertiary font-display mt-0.5">
                        {((profileData?.totalStudents || 0) + Number(profExternalStudents || 0)).toLocaleString()}+
                      </p>
                    </div>
                    <div className="p-2.5 bg-[#0b1329] rounded-lg border border-slate-800/80">
                      <p className="text-[9px] font-mono text-slate-400">만족도</p>
                      <p className="text-sm font-bold text-[#34d399] font-display mt-0.5">
                        {profileData?.infographic?.satisfactionRate || 98}%
                      </p>
                    </div>
                  </div>

                  {/* Infographic Highlights */}
                  <div className="space-y-2 text-[11px] text-slate-300 mb-4">
                    {(profHighlights.length > 0 ? profHighlights : [
                      "전) 글로벌 테크 유니콘 AI PM 리드",
                      "다수 생성형 AI 프로덕트 런칭 및 IR 유치 총괄",
                      "창업진흥원 및 주요 VC 공식 멘토",
                    ]).map((highlight, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-1.5">
                        <CheckCircle size={12} className="text-[#34d399] flex-shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {/* Keyword Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800/80">
                    {(profKeywords.length > 0 ? profKeywords : ["AI 프로덕트", "실전 린스타트업", "1:1 밀착 코칭", "IR 피칭"]).map((kw, kwIdx) => (
                      <span
                        key={kwIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#0b1329] text-slate-300 border border-slate-800/80"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="w-full mt-4 text-xs font-semibold py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer border border-slate-700/60 flex items-center justify-center gap-1"
                  >
                    진행한 모든 강의 & 전체 리뷰 보기 →
                  </button>
                </div>
              </div>

              {/* Bottom Information Tip Card */}
              <div className="p-4 rounded-xl bg-brand-surface-low border border-brand-border/40 text-xs text-brand-on-surface-variant space-y-1.5">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <ShieldCheck size={14} className="text-brand-primary" />
                  실시간 연동 안내
                </div>
                <p className="text-[11px] leading-relaxed">
                  여기서 저장하신 프로필 정보는 강사님이 개설하신 모든 강의 상세 페이지 사이드바 및 모달에 실시간으로 즉시 반영됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── Modal: Preview Modal for Instructor Detail ──────────────── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto border border-brand-border">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary-container to-brand-tertiary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {(userName || "김소현").charAt(0)}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    {userName || "김소현"}
                    <span className="text-xs px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-semibold">
                      대표 강사
                    </span>
                  </h3>
                  <p className="text-xs text-brand-on-surface-variant mt-0.5">
                    {profTitle || "대표 직함"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg hover:bg-brand-surface-high text-brand-on-surface-variant hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Bio */}
            <div className="p-4 bg-brand-surface-low rounded-xl border border-brand-border/40 mb-5">
              <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                <Award size={14} className="text-brand-primary" /> 강사 소개
              </h4>
              <p className="text-xs text-brand-on-surface-variant leading-relaxed">
                {profBio || `${userName || "김소현"} 강사는 실무 경험을 바탕으로 실전 창업 코칭을 제공합니다.`}
              </p>
            </div>

            {/* Career History */}
            {profHistory.length > 0 && (
              <div className="p-4 bg-brand-surface-low rounded-xl border border-brand-border/40 mb-5">
                <h4 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
                  <Briefcase size={14} className="text-brand-secondary" />
                  주요 경력 및 연혁
                </h4>
                <div className="space-y-2">
                  {profHistory.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary flex-shrink-0 mt-1.5" />
                      <span className="text-brand-on-surface-variant leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course History Preview */}
            <div className="mb-5">
              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                <BookOpen size={14} className="text-brand-tertiary" />
                개설 및 진행 강의 이력 ({myCourses.length}건)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {myCourses.map((c) => (
                  <div key={c.id} className="p-3 bg-brand-surface-low rounded-xl border border-brand-border/40 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono text-brand-on-surface-variant">{c.category}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded badge-recruiting">{c.status}</span>
                      </div>
                      <p className="text-xs font-bold text-white mt-1 line-clamp-1">{c.title}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-brand-border/20 text-[10px] text-brand-on-surface-variant">
                      <span>{c.schedule?.startDate || "2026.03~"}</span>
                      <div className="flex items-center gap-1">
                        <Star size={10} className="star-filled" />
                        <span className="text-white font-bold">{c.rating || 5.0}</span>
                        <span>({c.studentCount || 0}명)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowPreviewModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer border border-slate-700/60 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── Modal: AI 약력 스마트 정리 도우미 ──────────────── */}
      {showAiBioModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-brand-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-brand-primary" />
                AI 약력 스마트 정리 도우미
              </h3>
              <button
                onClick={() => setShowAiBioModal(false)}
                className="text-brand-on-surface-variant hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-brand-on-surface-variant mb-3 leading-relaxed">
              기존에 작성해 두신 이력서, 링크드인 소개, 포트폴리오 텍스트를 자유롭게 붙여넣으세요. AI가 직함, 연차, 핵심 실적 3선, 전문 키워드를 자동으로 추출하여 폼에 채워드립니다.
            </p>

            <textarea
              rows={6}
              value={aiRawText}
              onChange={(e) => setAiRawText(e.target.value)}
              placeholder={`[예시 붙여넣기]\n네이버/카카오에서 10년간 풀스택 소프트웨어 아키텍트로 근무했습니다. 다수의 대규모 RAG 및 LLM 에이전트 시스템을 설계하고 운영했으며, 현재 스타트업 테크 리드로 창업팀 멘토링을 진행 중입니다.`}
              className="w-full bg-brand-surface border border-brand-border rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors leading-relaxed mb-4"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAiBioModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-brand-border text-slate-300 hover:bg-brand-surface-high text-xs font-semibold cursor-pointer transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleRunAiBioExtraction}
                disabled={isAiExtracting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold cursor-pointer transition-all shadow-md hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Sparkles size={13} />
                {isAiExtracting ? "AI 분석 및 정리 중..." : "AI 스마트 채우기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── Modal 1: 강의 생성 / 수정 모달 통합 ──────────────── */}
      {showCourseModal && (
        <CourseCreateEditModal
          isOpen={showCourseModal}
          initialCourse={editingCourse}
          instructorName="김소현"
          onClose={() => {
            setShowCourseModal(false);
            if (onCloseModalExternal) onCloseModalExternal();
          }}
          onSave={(course) => {
            if (onSaveCourse) onSaveCourse(course);
            setShowCourseModal(false);
            if (onCloseModalExternal) onCloseModalExternal();
            toast.success("강의 저장 완료", `'${course.title}' 강의 설정이 저장되었습니다.`);
          }}
        />
      )}

      {/* ──────────────── Modal 2: 강사 직권 환불 확인 모달 ──────────────── */}
      {showRefundModal && refundTargetStudent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-500/40 relative">
            <div className="flex items-center gap-2 mb-4 text-rose-400">
              <AlertTriangle size={20} />
              <h3 className="font-display text-base font-bold text-white">강사 직권 환불 처리 확인</h3>
            </div>

            <div className="p-3 bg-brand-surface-low rounded-xl border border-brand-border/40 text-xs mb-4 space-y-1.5">
              <p className="text-brand-on-surface-variant">
                수강생: <strong className="text-white">{refundTargetStudent.name}</strong> ({refundTargetStudent.email})
              </p>
              <p className="text-brand-on-surface-variant">
                강의명: <strong className="text-white">{refundTargetStudent.courseTitle}</strong>
              </p>
              <p className="text-brand-on-surface-variant">
                환불 금액: <strong className="text-rose-400 font-mono font-bold">₩{(refundTargetStudent.paymentAmount || 590000).toLocaleString()}원</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1">
                환불 사유 입력 *
              </label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="예: 수강생 사정으로 인한 취소 요청 승인"
                className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-400"
              />
            </div>

            <p className="text-[11px] text-rose-300/80 mb-4 leading-relaxed">
              ⚠️ 환불 처리 시 수강생의 강의 수강 권한이 즉시 해제되며, 수강생에게 결제 취소 및 환불 안내 알림이 발송됩니다.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundTargetStudent(null);
                }}
                className="flex-1 border border-brand-border text-white py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-xs"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmRefund}
                disabled={isProcessingRefund}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Undo2 size={13} />
                {isProcessingRefund ? "환불 처리 중..." : "환불 확정 실행"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── Modal 3: CRM Targeted Messaging Modal ──────────────── */}
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
                  : studentFilter === "completed"
                  ? "수료 완료 수강생 전체"
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
                    title: "수료 축하 안내",
                    subject: "[수료 축하] 커리큘럼 이수 완료 및 수료증 발급 안내",
                    body: "축하합니다! 전 과정을 성실히 이수하셨습니다. 마이페이지 내 강의실에서 수료증을 확인해 보세요.",
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
                  발송하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── Modal 4: 강의 검색 모달 ──────────────── */}
      {showCourseSearchModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search size={16} className="text-brand-primary" />
                수강생 관리 대상 강의 검색
              </h3>
              <button
                onClick={() => setShowCourseSearchModal(false)}
                className="text-white/50 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
                placeholder="강의명 또는 카테고리 검색..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {myCourses
                .filter(
                  (c) =>
                    courseSearchQuery.trim() === "" ||
                    c.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                    c.category.toLowerCase().includes(courseSearchQuery.toLowerCase())
                )
                .map((course) => (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseForCRM(course.id);
                      setSelectedStudentIds([]);
                      setShowCourseSearchModal(false);
                      setCourseSearchQuery("");
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedCourseForCRM === course.id
                        ? "bg-brand-primary-container/20 border-brand-primary text-white"
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{course.title}</p>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        {course.category} · 수강생 {course.studentCount}명 · {course.status}
                      </p>
                    </div>
                    {selectedCourseForCRM === course.id && (
                      <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                        선택중
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── Modal 5: 강사 출금 신청 모달 (수수료 정책 & 계좌 관리) ──────────────── */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowUpRight size={16} className="text-brand-primary" />
                강사 정산금 출금 신청
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-white/50 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* 잔액 요약 */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-white/50">출금 가능 정산액</span>
                <p className="text-base font-bold text-brand-tertiary">
                  ₩{availableWithdrawAmount.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawAmount(availableWithdrawAmount)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 transition-colors cursor-pointer"
              >
                전액 입력
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* 출금 희망 금액 */}
              <div>
                <label className="block text-white/70 mb-1 font-semibold">출금 신청 금액</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">₩</span>
                  <input
                    type="number"
                    min={10000}
                    max={availableWithdrawAmount}
                    value={withdrawAmount || ""}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-7 pr-3 text-white font-mono text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* 수수료 정책 안내 */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-white/60">
                  <span>출금 신청액</span>
                  <span className="font-mono text-white">₩{withdrawAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>플랫폼 수수료 및 원천징수 (3.3%)</span>
                  <span className="font-mono">-₩{Math.round(withdrawAmount * 0.033).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-800 text-brand-tertiary font-bold">
                  <span>최종 입금 예정액</span>
                  <span className="font-mono text-sm">
                    ₩{(withdrawAmount - Math.round(withdrawAmount * 0.033)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 입금 계좌 정보 */}
              <div className="pt-2 border-t border-white/10 space-y-2.5">
                <span className="block text-white/80 font-semibold text-[11px]">입금 계좌 정보</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-white/50 mb-0.5">은행명</label>
                    <select
                      value={withdrawBank}
                      onChange={(e) => setWithdrawBank(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-brand-primary"
                    >
                      {["신한은행", "국민은행", "카카오뱅크", "토스뱅크", "우리은행", "하나은행", "NH농협", "IBK기업"].map((b) => (
                        <option key={b} value={b} className="bg-slate-900 text-white">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 mb-0.5">예금주</label>
                    <input
                      type="text"
                      value={withdrawHolder}
                      onChange={(e) => setWithdrawHolder(e.target.value)}
                      placeholder="예금주명"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-white/50 mb-0.5">계좌번호 (숫자만 입력)</label>
                  <input
                    type="text"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    placeholder="110-xxx-xxxxxx"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-[11px] text-white/70 cursor-pointer">
                    <input
                      type="radio"
                      name="withdrawType"
                      value="individual"
                      checked={withdrawType === "individual"}
                      onChange={() => setWithdrawType("individual")}
                      className="text-brand-primary"
                    />
                    개인 (소득세 3.3% 원천징수)
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-white/70 cursor-pointer">
                    <input
                      type="radio"
                      name="withdrawType"
                      value="business"
                      checked={withdrawType === "business"}
                      onChange={() => setWithdrawType("business")}
                      className="text-brand-primary"
                    />
                    사업자 (세금계산서)
                  </label>
                </div>

                <label className="flex items-center gap-2 pt-1 text-[11px] text-brand-on-surface-variant cursor-pointer">
                  <input
                    type="checkbox"
                    checked={withdrawSaveToProfile}
                    onChange={(e) => setWithdrawSaveToProfile(e.target.checked)}
                    className="rounded border-white/20 text-brand-primary"
                  />
                  이 계좌 정보를 프로필 기본 출금 계좌로 저장
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 font-semibold text-xs transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWithdrawal}
                  disabled={availableWithdrawAmount <= 0 || withdrawAmount <= 0}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-md"
                >
                  출금 신청 제출
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
