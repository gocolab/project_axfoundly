# 「AI로 창업하라」 통합 테스트 상세 기술 명세서

본 문서는 `tests/e2e/` 하위의 8개 통합 테스트 스위트별 상세 검증 시나리오와 연계 API 및 컴포넌트 매핑을 기술합니다.

---

## 1. TC-01: GNB 네비게이션 & 알림 센터 (`gnb_navigation.spec.ts`)
- **대상 컴포넌트**: [`src/components/GNB.tsx`](file:///apps/project_launch_bizs/src/components/GNB.tsx)
- **시나리오**:
  1. GNB 로고 및 핵심 네비게이션 4종 (홈, 교육/강의, 스타트업/IR, 커뮤니티) 가시성 확인.
  2. GNB 탭 클릭 시 각 페이지로 전환 및 활성 스타일 적용 확인.
  3. 비로그인 상태에서 [로그인], [회원가입] 버튼 노출 및 모달 트리거 확인.
  4. 로그인 후 종 아이콘 클릭 시 알림 센터 드롭다운 토글 및 알림 확인/읽음 처리.

---

## 2. TC-02: 메인 홈 & 비즈니스 진입점 (`main_page.spec.ts`)
- **대상 컴포넌트**: [`src/components/MainPage.tsx`](file:///apps/project_launch_bizs/src/components/MainPage.tsx)
- **시나리오**:
  1. 메인 히어로 배너 및 4대 핵심 지표(누적 수강생, 런칭 스타트업, 멘토/강사진, 매칭 투자액) 렌더링 확인.
  2. 히어로 배너 CTA [강의 둘러보기] 클릭 시 `courses` 페이지 이동.
  3. 히어로 배너 CTA [무료 가입하기] 클릭 시 회원가입 모달 오픈.
  4. 하단 3개 섹션(진행 중인 강의, 주목받는 스타트업, 최근 소식) 및 [전체보기] 링크 동작 검증.

---

## 3. TC-03: 4종 RBAC 권한 격리 및 빠른 로그인 (`auth_roles.spec.ts`)
- **대상 컴포넌트**: [`src/components/AuthModal.tsx`](file:///apps/project_launch_bizs/src/components/AuthModal.tsx), [`src/components/GNB.tsx`](file:///apps/project_launch_bizs/src/components/GNB.tsx)
- **연계 API**: `POST /api/auth/login`, `GET /api/auth/me`
- **시나리오**:
  1. **수강생(student)** 데모 로그인: 헤더 프로필 '김수강생', 마이페이지 진입 시 수강생 대시보드 표시.
  2. **강사(instructor)** 데모 로그인: 헤더 프로필 '김소현', 마이페이지 진입 시 강사 대시보드 표시.
  3. **투자자(investor)** 데모 로그인: 헤더 프로필 '이벤처'/'한승우', 마이페이지 진입 시 투자자 대시보드 표시.
  4. **관리자(admin)** 데모 로그인: 헤더 프로필 '최관리', GNB 프로필 메뉴에 '관리자 대시보드' 활성화.
  5. 수강생 로그인 상태에서는 관리자 대시보드 메뉴가 격리/비노출되는지 확인.
  6. 로그아웃 클릭 시 게스트(비로그인) 상태로 완벽 복귀.

---

## 4. TC-04: 교육 / 강의 탐색, 달력, 인포그래픽, 강사 모달 및 수강신청 (`courses.spec.ts`)
- **대상 컴포넌트**: [`src/components/CoursePage.tsx`](file:///apps/project_launch_bizs/src/components/CoursePage.tsx)
- **연계 API**: `GET /api/courses`, `POST /api/courses/:id/enroll`, `POST /api/courses/:id/reviews`
- **시나리오**:
  1. 강의 목록 페이지 타이틀 및 카테고리 필터(AI 모델링, 비즈니스 기획 등) 표시.
  2. 카테고리 필터 클릭 시 해당하는 강의만 필터링.
  3. 검색창 실시간 키워드 필터링 및 일치 결과 없을 시 빈 상태 안내.
  4. 강의 카드 클릭 시 상세 페이지(커리큘럼, 강의 달력, 강사 인포그래픽, 리뷰 목록) 렌더링.
  5. 강사 인포그래픽 클릭 시 `InstructorDetailModal` 팝업(역대 개설 강의 목록 및 수강생 전체 리뷰 모음) 노출 및 닫기.
  6. 비로그인 상태에서 [수강 신청하기] 클릭 시 로그인 모달 유도.
  7. 로그인 상태에서 [수강 신청하기] 클릭 시 결제 모달 오픈 및 결제 완료 처리 -> 수강 중 배지 표시.

---

## 5. TC-05: 스타트업/IR 탐색, 스텔스 모드, 구인 지원서 제출 및 투자 제안 (`ir_pitching.spec.ts`)
- **대상 컴포넌트**: [`src/components/IRPage.tsx`](file:///apps/project_launch_bizs/src/components/IRPage.tsx), [`src/components/InvestmentProposalModal.tsx`](file:///apps/project_launch_bizs/src/components/InvestmentProposalModal.tsx)
- **연계 API**: `GET /api/ir/projects`, `POST /api/ir/projects/:id/apply`, `POST /api/investments/proposals`, `POST /api/ir/projects/:id/bookmark`
- **시나리오**:
  1. 스타트업/IR 목록 및 분야별(AI/ML 등) 필터링, 실시간 검색.
  2. 스타트업 카드 클릭 시 상세 정보(문제, 솔루션, 비즈니스 모델, 팀원 목록) 렌더링.
  3. 실명 vs 비실명(스텔스) 모드 스위치 토글 동작 및 배지 확인.
  4. 채용 중인 스타트업의 [지원하기] 클릭 시 지원 폼 열기, 지원 동기 작성 후 제출 완료.
  5. 투자자 역할 로그인 상태에서 [투자 제안하기] 클릭 시 투자 검토 및 미팅 제안 모달 오픈, 제안 내용 작성 후 발송 완료.
  6. 관심 스타트업 북마크 등록 및 토글 확인.

---

## 6. TC-06: 커뮤니티 멀티 게시판, 새 글 작성, 상세 및 댓글 등록 (`community.spec.ts`)
- **대상 컴포넌트**: [`src/components/CommunityPage.tsx`](file:///apps/project_launch_bizs/src/components/CommunityPage.tsx), [`src/components/CommunityPostDetailModal.tsx`](file:///apps/project_launch_bizs/src/components/CommunityPostDetailModal.tsx)
- **연계 API**: `GET /api/community/posts`, `POST /api/community/posts`, `GET /api/community/posts/:id/comments`, `POST /api/community/posts/:id/comments`
- **시나리오**:
  1. 커뮤니티 헤더 및 4대 게시판(공지사항, 팀 빌딩, Q&A, 자유게시판) 탭 필터링.
  2. 게시글 실시간 키워드 검색.
  3. 비로그인 상태에서 [글쓰기] 클릭 시 로그인 모달 유도.
  4. 로그인 후 [글쓰기] 클릭 시 게시글 작성 모달 오픈, 동적 제목 게시글 등록 및 목록 반영.
  5. 게시글 행 클릭 시 게시글 상세 및 댓글 모달 오픈, 실시간 댓글 입력 및 등록 완료, 목록 즉시 노출 확인.

---

## 7. TC-07: 4종 역할별 대시보드 종합 기능 및 데이터 생성/수정/상태전환 (`dashboards.spec.ts`)
- **대상 컴포넌트**: 
  - [`src/components/StudentDashboard.tsx`](file:///apps/project_launch_bizs/src/components/StudentDashboard.tsx)
  - [`src/components/InstructorDashboard.tsx`](file:///apps/project_launch_bizs/src/components/InstructorDashboard.tsx)
  - [`src/components/InvestorDashboard.tsx`](file:///apps/project_launch_bizs/src/components/InvestorDashboard.tsx)
  - [`src/components/AdminDashboard.tsx`](file:///apps/project_launch_bizs/src/components/AdminDashboard.tsx)
  - [`src/components/ProjectCreateEditModal.tsx`](file:///apps/project_launch_bizs/src/components/ProjectCreateEditModal.tsx)
  - [`src/components/PaymentReceiptModal.tsx`](file:///apps/project_launch_bizs/src/components/PaymentReceiptModal.tsx)
- **시나리오**:
  1. **수강생 대시보드**:
     - 신규 창업 프로젝트 등록 모달(`ProjectCreateEditModal`)을 통한 프로젝트 정보 입력 및 생성 완료.
     - 내 강의실 수강 일정 및 진도율 확인, 결제 영수증 모달(`PaymentReceiptModal`) 확인 및 환불 신청 처리.
  2. **강사 대시보드**:
     - AI 연계 강의 개설 모달을 통한 AI 초안 생성, 징검다리 일정 배정 및 최종 강의 개설 완료.
     - 수강생 관리(CRM) 탭에서 타깃 수강생 메시지 작성 및 발송.
     - 정산 관리 탭에서 매출 통계 및 정산서 확인.
  3. **투자자 대시보드**: 관심 스타트업 목록, AI 추천 스타트업 매칭 탭 확인.
  4. **관리자 대시보드**: 통계 홈 KPI, 회원 검색, 강의 검수 & 승인/반려, 새 게시판 만들기 모달을 통한 게시판 생성.

---

## 8. TC-08: 백엔드 11개 도메인 REST API 전수 무결성 및 C/U/D (`api_integration.spec.ts`)
- **대상 라우트**: [`server/routes/`](file:///apps/project_launch_bizs/server/routes)
- **시나리오**:
  1. `GET /api/health` 헬스체크.
  2. `POST /api/auth/login`, `GET /api/auth/me` 인증/인가.
  3. `GET /api/courses`, `GET /api/courses/:id`, `POST /api/courses`, `POST /api/courses/:id/enroll`, `POST /api/courses/:id/reviews`, `PATCH /api/courses/:id/approve`, `PATCH /api/courses/:id/reject`.
  4. `GET /api/ir/projects`, `POST /api/ir/projects`, `PUT /api/ir/projects/:id`, `POST /api/ir/projects/:id/bookmark`, `POST /api/ir/projects/:id/apply`.
  5. `GET /api/community/posts`, `GET /api/community/posts/:id`, `POST /api/community/posts`, `GET /api/community/posts/:id/comments`, `POST /api/community/posts/:id/comments`.
  6. `GET /api/payments`, `GET /api/payments/:id/receipt`, `POST /api/payments/:id/refund`.
  7. `GET /api/team/requests`, `POST /api/team/requests`, `PATCH /api/team/requests/:id`.
  8. `POST /api/instructor/crm/send`, `GET /api/instructor/crm/messages`, `GET /api/instructor/settlements`, `POST /api/instructor/settlements/withdraw`.
  9. `GET /api/investments/proposals`, `POST /api/investments/proposals`, `PATCH /api/investments/proposals/:id/status`, `GET /api/investments/recommendations`.
  10. `GET /api/admin/stats`, `GET /api/admin/members`, `PATCH /api/admin/members/:id/role`, `PATCH /api/admin/members/:id/status`, `GET /api/admin/boards`, `POST /api/admin/boards`, `DELETE /api/admin/boards/:id`.
  11. `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `POST /api/notifications/read-all`.
  12. `POST /api/ai/course-draft`, `POST /api/ai/diagnosis`, `POST /api/ai/innovation-chat`.
