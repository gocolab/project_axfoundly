# 페이지 간 필요 변수값 (Page Variables & Props)

본 문서는 **「AI로 창업하라」** 플랫폼의 컴포넌트 간 데이터 흐름을 정의합니다. `App.tsx`에서 중앙 집중식으로 관리되는 상태(State)들이 각 페이지 및 모달에 어떻게 Props로 주입되어 올인원 비즈니스 로직(교육 → 팀빌딩 → 투자)을 수행하는지 명세합니다.

## 1. 전역 상태 및 접근 제어 (App.tsx)
가장 최상단 라우터인 `App`은 모든 핵심 데이터를 들고 있으며, 권한에 따라 하위 페이지에 데이터를 선별적으로 주입합니다.

- `isLoggedIn`: `boolean` - 세션 활성화 여부
- `userName`: `string` - 사용자 이름
- `userRole`: `"admin" | "member"` - 시스템 접근 기본 권한 (`UserPermission` 제거 후 통합됨)
- `userAssignedRoles`: `string[]` - 추가 역할 그룹 (예: `"course_instructor"`, `"investor_active"`)
- `currentPage`: `string` - 현재 렌더링 중인 라우트
- `courses`, `irProjects`, `posts`, `notifications`, `payments` 등: 백엔드 API로부터 불러온 도메인 데이터 배열

## 2. 주요 페이지 컴포넌트 (Pages)

### MainPage.tsx
플랫폼의 허브 역할을 하며 전체 데이터를 요약하여 보여줍니다.
- **주입 변수 (Props)**:
  - `courses: Course[]` (인기/신규 강의 렌더링용)
  - `irProjects: IRProject[]` (주목받는 스타트업 렌더링용)
  - `notices: BoardPost[]` (주요 커뮤니티 공지)
  - `isLoggedIn: boolean` (CTA 버튼 상태 분기용)
- **액션 콜백**: `onNavigate`, `onViewCourse`, `onViewIR`, `onViewPost`, `onLoginClick`

### CoursePage.tsx (창업 교육)
강의 탐색 및 수강 신청을 처리합니다.
- **주입 변수 (Props)**:
  - `courses: Course[]` (전체 강의 데이터)
  - `initialCourseId?: string | null` (딥링크용 선택된 강의)
  - `isLoggedIn: boolean`, `userName: string`
- **액션 콜백**: 
  - `onEnroll(courseId)` (결제/수강 연동)
  - `onSaveCourse(course)` (강사가 새 강의 개설 시)
  - `onClearSelectedCourse()`

### IRPage.tsx (팀빌딩 및 투자 유치)
구인구직, 팀빌딩, 투자 제안 등 핵심 트랜잭션이 발생합니다.
- **주입 변수 (Props)**:
  - `projects: IRProject[]` (스타트업 프로젝트 데이터)
  - `userRole: UserRole`, `userAssignedRoles: string[]` (투자자 여부에 따라 '투자 제안' 버튼 활성화 분기)
  - `initialProjectId?: string | null`
- **액션 콜백**:
  - `onToggleBookmark(projectId)` (투자자의 관심 프로젝트 등록)
  - `onSendProposal(projectId, proposal)` (IR 투자 제안)
  - `onSaveProject(project)` (창업자의 프로젝트 등록)

### MyPage.tsx (통합 마이페이지)
사용자의 다중 역할(수강생/강사/투자자)을 탭 형태로 통합 관리합니다.
- **공통 주입 변수**: `isLoggedIn`, `userName`, `userRole`, `userAssignedRoles`
- **수강생(Member) 탭 필요 변수**:
  - `courses: Course[]` (수강 중인 강의 필터링 목적)
  - `teamRequests: TeamBuildingRequest[]` (내가 받은/보낸 팀빌딩 제안)
  - `payments: PaymentRecord[]` (결제 및 환불 내역)
- **강사(Instructor) 탭 필요 변수** (`userAssignedRoles`에 `"course_instructor"` 포함 시 활성화):
  - `courses: Course[]` (내가 개설한 강의 관리 목적)
  - `settlements: SettlementRecord[]` (강사 정산 내역)
- **투자자(Investor) 탭 필요 변수** (`userAssignedRoles`에 `"investor_active"` 포함 시 활성화):
  - `irProjects: IRProject[]` (북마크한 프로젝트 필터링 목적)
  - `recommendations: AIRecommendation[]` (AI 기반 맞춤형 스타트업 추천)
  - `proposals: InvestmentProposal[]` (내가 보낸 투자 제안 상태)

## 3. 핵심 비즈니스 모달 (Modals)

### ProjectCreateEditModal.tsx
창업 팀이 자신들의 프로젝트(IR)를 등록하고 팀원을 모집하기 위한 입력 폼.
- **주입 변수**: `initialProject: IRProject | null`, `isOpen: boolean`
- **필요 내부 상태**: `teamName`, `title`, `field`, `investmentStage`, `hiringRoles` 등
- **액션 콜백**: `onSave(project: IRProject)`

### VirtualIRModal.tsx
투자자가 관심 있는 스타트업에 화상 미팅을 제안합니다.
- **주입 변수**: `project: IRProject` (대상 프로젝트), `investorName: string`
- **액션 콜백**: `onSuccess()` (일정 등록 완료 후 UI 갱신)

### PaymentReceiptModal.tsx
수강생 대시보드에서 특정 결제 건의 상세 영수증 조회 및 환불 처리를 담당합니다.
- **주입 변수**: `payment: PaymentRecord | null`
- **액션 콜백**: `onRefundCompleted(updatedPayment: PaymentRecord)`
