# 페이지 연관 관계 (Page Relationships)

이 문서는 AI로 창업하라 플랫폼의 프론트엔드 페이지 및 모달 컴포넌트 간의 렌더링 및 탐색 연관 관계를 나타냅니다.

## 아키텍처 다이어그램 (Mermaid)

```mermaid
graph TD
    App[App (Root)] --> GNB[GNB (네비게이션 바)]
    App --> Tutor[AITutorWidget (우측 하단 챗봇)]
    App --> Auth[AuthModal (로그인 모달)]
    
    %% 라우팅 페이지
    App -->|currentPage: home| Main[MainPage (메인 홈)]
    App -->|currentPage: courses| Course[CoursePage (강의 찾기)]
    App -->|currentPage: ir| IR[IRPage (투자/팀빌딩)]
    App -->|currentPage: community| Comm[CommunityPage (커뮤니티)]
    App -->|currentPage: dashboard| MyPage[MyPage (마이페이지)]
    App -->|currentPage: admin| Admin[AdminDashboard (관리자)]

    %% 하위 모달 및 컴포넌트
    Course --> CourseModal[CourseCreateEditModal (강의 개설)]
    
    IR --> ProjectModal[ProjectCreateEditModal (프로젝트 등록)]
    IR --> VirtualIR[VirtualIRModal (가상 IR 밋업)]
    IR --> InvestModal[InvestmentProposalModal (투자 제안)]
    
    Comm --> PostDetail[CommunityPostDetailModal (게시글 상세)]
    
    MyPage --> Profile[Profile (내 프로필 탭)]
    MyPage --> MemDash[MemberDashboard (수강생 탭)]
    MyPage --> InstDash[InstructorDashboard (강사 탭)]
    MyPage --> InvDash[InvestorDashboard (투자자 탭)]
    
    MemDash --> PaymentModal[PaymentReceiptModal (결제 영수증)]
    MemDash --> JobModal[JobApplicationModal (지원 내역)]
    
    Admin --> AdminBoardModal[AdminBoardCreateModal (게시판 생성)]
```
