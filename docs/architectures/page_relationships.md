# 페이지 연관 관계 (Page Relationships)

본 문서는 **「AI로 창업하라」** 플랫폼의 프론트엔드 아키텍처를 정의합니다. 창업 교육부터 팀 빌딩, 투자 유치까지 연결되는 올인원 비즈니스 흐름을 일관되게 지원하기 위해 페이지와 모달 간의 렌더링 및 탐색 연관 관계를 설계했습니다.

## 1. 아키텍처 개요
플랫폼은 단일 진입점(`App.tsx`)에서 상태 기반 라우팅을 수행하며, 역할 기반 접근 제어(`UserRole` 및 `userAssignedRoles`)를 통해 사용자 맞춤형 뷰(특히 `MyPage` 및 `AdminDashboard`)를 제공합니다.

## 2. 페이지 및 컴포넌트 구조도 (Mermaid)

```mermaid
graph TD
    %% Root 및 전역 UI
    Root[App (Root & State Manager)]
    GNB[GNB (네비게이션 바)]
    AITutor[AITutorWidget (우측 하단 AI 챗봇)]
    AuthModal[AuthModal (로그인 및 회원가입)]

    Root -.-> GNB
    Root -.-> AITutor
    Root -.-> AuthModal

    %% 핵심 비즈니스 도메인 라우팅
    Root -->|라우팅: home| Main[MainPage (메인 대시보드)]
    Root -->|라우팅: courses| Course[CoursePage (창업 교육/강의)]
    Root -->|라우팅: ir| IR[IRPage (팀빌딩/투자유치)]
    Root -->|라우팅: community| Comm[CommunityPage (창업 커뮤니티)]
    
    %% 권한별 대시보드 라우팅
    Root -->|라우팅: dashboard| MyPage[MyPage (통합 마이페이지)]
    Root -->|라우팅: admin| Admin[AdminDashboard (플랫폼 관리자)]

    %% -------------------------------------
    %% 도메인별 하위 모달 및 연관 컴포넌트
    %% -------------------------------------
    
    %% 창업 교육
    Course --> CourseModal[CourseCreateEditModal (강의 개설/수정)]
    
    %% 팀빌딩 및 투자 유치
    IR --> ProjectModal[ProjectCreateEditModal (프로젝트 등록/수정)]
    IR --> InvestModal[InvestmentProposalModal (투자 제안 발송)]
    
    %% 커뮤니티
    Comm --> PostDetail[CommunityPostDetailModal (게시글 상세 및 댓글)]
    
    %% 마이페이지 (사용자/강사/투자자 통합)
    MyPage --> Profile[Profile (내 프로필 및 계정 설정)]
    MyPage --> MemDash[MemberDashboard (수강/결제/팀빌딩 내역)]
    MyPage --> InstDash[InstructorDashboard (내 강의 관리/정산)]
    MyPage --> InvDash[InvestorDashboard (관심 프로젝트/투자 내역)]
    
    MemDash --> PaymentModal[PaymentReceiptModal (결제 영수증/환불)]
    MemDash --> JobModal[JobApplicationModal (팀빌딩 지원 내역)]
    
    %% 관리자
    Admin --> AdminBoardModal[AdminBoardCreateModal (커뮤니티 게시판 관리)]

    %% 비즈니스 흐름 관계선 (점선)
    Course -.->|교육 수료 후 팀빌딩| IR
    IR -.->|팀빌딩 후 투자 연결| InvDash
```

## 3. 핵심 비즈니스 흐름 연관성
- **교육 -> 팀빌딩 -> 투자**: 사용자는 `CoursePage`에서 창업 교육을 받고, `IRPage`에서 팀빌딩을 진행하며, 투자자는 `InvestorDashboard`를 통해 우수 팀을 발굴하여 투자/미팅을 제안하는 선순환 구조를 가집니다.
- **통합된 마이페이지**: 기존 파편화되어 있던 프로필, 수강생, 강사, 투자자 대시보드를 `MyPage`로 일원화하여, 사용자가 다중 역할(수강생이면서 동시에 투자자/강사)을 수행하더라도 매끄러운 UX를 경험하도록 설계되었습니다.
