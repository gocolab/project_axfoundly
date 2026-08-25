# 페이지 간 필요 변수값 (Page Variables & Props)

이 문서는 전역 App 상태에서 하위 페이지로 주입되는 주요 State 및 Props(변수값)와 역할별 접근 권한 변수를 정리합니다.

## 전역 상태 (App.tsx)
- `isLoggedIn`: boolean - 사용자 로그인 여부
- `userName`: string - 사용자 식별 이름/ID
- `userRole`: "admin" | "member" - 기본 권한 (접근 제어 기준)
- `userAssignedRoles`: string[] - "course_instructor", "investor_active" 등 추가 역할 그룹
- `currentPage`: string - 라우팅 상태 (home, courses, ir, community, dashboard, admin)

## 주요 페이지별 필요 변수 (Props)

### 1. MainPage
- **데이터 변수**: `courses` (전체 강의 목록), `irProjects` (진행중인 IR 프로젝트), `notices` (최신 공지사항)
- **사용자 정보**: `isLoggedIn`
- **콜백 함수**: `onNavigate` (페이지 이동), `onViewCourse` (강의 상세), `onViewIR` (프로젝트 상세), `onViewPost` (게시물 상세), `onLoginClick`

### 2. CoursePage
- **데이터 변수**: `courses` (과정 목록), `initialCourseId` (초기 선택된 강의)
- **사용자 정보**: `isLoggedIn`, `userName`
- **콜백 함수**: `onEnroll` (수강신청/결제 처리), `onSaveCourse` (강의 개설/수정 처리), `onLoginClick`, `onClearSelectedCourse`

### 3. IRPage
- **데이터 변수**: `projects` (IR 프로젝트 목록), `initialProjectId`
- **사용자 정보**: `userRole`, `userAssignedRoles`, `isLoggedIn`, `userName` (팀빌딩, 투자 제안 권한 체크용)
- **콜백 함수**: `onToggleBookmark` (북마크), `onSendProposal` (투자 제안), `onSaveProject` (새 프로젝트 생성), `onLoginClick`, `onClearSelectedProject`

### 4. CommunityPage
- **데이터 변수**: `posts` (게시글 목록), `initialPostId`
- **사용자 정보**: `isLoggedIn`, `userRole`, `userName`
- **콜백 함수**: `onAddPost` (게시글 작성 콜백), `onLoginClick`, `onClearSelectedPost`

### 5. MyPage (통합 대시보드)
- **데이터 변수**: 
  - 기본: `isLoggedIn`, `userName`, `userRole`, `userAssignedRoles`
  - 수강생(Member) 탭: `courses` (전체 강의 중 수강중인 필터링용), `teamRequests` (팀빌딩 제안), `payments` (결제 내역), `notifications` (알림)
  - 강사(Instructor) 탭: `courses` (본인 개설 강의 필터링용), `settlements` (정산 내역)
  - 투자자(Investor) 탭: `irProjects` (관심 프로젝트 필터링용), `recommendations` (AI 추천), `proposals` (발송한 투자 제안)
- **콜백 함수**: `handleRefundPayment`, `handleUpdateTeamRequest`, `handleSendCRMMessage`, `handleToggleBookmark`, `handleViewCourse`, `handleViewIR`, `handleSaveProject`, `handleSaveCourse` 등 각 대시보드의 액션 핸들러

### 6. AdminDashboard
- **데이터 변수**: `stats` (플랫폼 전체 통계), `members` (회원 목록), `boards` (게시판 목록), `pendingCourses` (검수 대기 강의)
- **콜백 함수**: `onChangeRole` (회원 권한 변경), `onApproveCourse` (강의 승인), `onRejectCourse` (강의 반려), `onViewCourse`

## 주요 모달별 필요 변수 (Props)

- **PaymentReceiptModal**: `payment: PaymentRecord` (결제 정보 객체)
- **VirtualIRModal**: `project: IRProject` (대상 프로젝트), `investorName` (투자자명)
- **CourseCreateEditModal** / **ProjectCreateEditModal**: `initialCourse` / `initialProject` (수정 시 초기값 객체), `onSave` (저장 콜백)
- **CommunityPostDetailModal**: `post: BoardPost` (선택된 게시물 객체), `comments: Comment[]` (해당 게시물의 댓글 목록)
- **InvestmentProposalModal**: `project: IRProject` (투자 대상 프로젝트), `investorName: string` (투자자명)
