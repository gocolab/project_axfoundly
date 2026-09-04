# 03. 프론트엔드 설계 규칙

> 문서 상태: ❓ 인터뷰 진행 중
> biz_flows.md 제안: React (혹은 Next.js Export 모드), Tailwind CSS. 직관적이고 단순한 사용성을 갖춘 모던 스타일.

## 1. 기본 구조

### 렌더링 방식
- 상태: ❓ 미결정
- 선택지: SPA(CSR) / SSR / SSG / 하이브리드(Next.js)
- 결정:
- 이유:
- 결정일:

### 라우팅 규칙
- 상태: ❓ 미결정
- 결정: (biz_flows.md 기반 예상 라우트)
  - `/` — 메인 랜딩
  - `/courses` — 강의 목록·검색
  - `/courses/:id` — 강의 상세·수강 신청
  - `/dashboard/student` — 수강생 대시보드
  - `/dashboard/instructor` — 강사 대시보드 (강의 관리·정산)
  - `/dashboard/investor` — 투자자 대시보드
  - `/projects` — 프로젝트(팀빌딩) 목록
  - `/projects/:id` — 프로젝트 상세·팀원 매칭
  - `/investments` — 투자 유치 공고 목록
  - `/board/:boardId` — 멀티 게시판
  - `/login`, `/signup` — 인증
- 결정일:

### 폴더 구조
- 상태: ❓ 미결정
- 결정:
```
src/
├── app/              # main · providers · router
├── pages/            # 라우트별 페이지
├── components/
│   ├── layout/       # Header · Sidebar · Footer · PageLayout
│   └── ui/           # Button · Card · Table · Modal 등 공통 UI
├── features/
│   ├── auth/         # 로그인·회원가입 — components/ api/ types/
│   ├── course/       # 강의 목록·상세·수강 (동일 하위 구조)
│   ├── team/         # 팀빌딩·프로젝트
│   ├── investment/   # 투자 유치·IR
│   ├── board/        # 멀티 게시판
│   └── payment/      # 결제·정산
├── lib/              # API 클라이언트 · 유틸
├── types/            # 공통 타입
└── styles/           # 전역 CSS · Tailwind 설정
```
- 결정일:

## 2. 상태 관리

### 서버 상태 (API 데이터)
- 상태: ❓ 미결정
- 선택지: TanStack Query / SWR / 직접 fetch
- 결정:
- 이유:
- 결정일:

### 클라이언트 상태 (UI 상태)
- 상태: ❓ 미결정
- 선택지: 컴포넌트 로컬 state만 / Zustand / Jotai / Redux Toolkit
- 결정:
- 결정일:

## 3. 스타일링

### 스타일링 방식
- 상태: ❓ 미결정 (biz_flows.md 제안: Tailwind CSS)
- 선택지: Tailwind CSS / CSS Modules / styled-components / UI 라이브러리(shadcn/ui, MUI 등)
- 결정:
- 이유:
- 결정일:

### 디자인 기준
- 상태: ❓ 미결정
- 결정: (biz_flows.md: "직관적이고 단순한 사용성을 갖춘 모던 스타일 적극 적용")
- 결정일:

## 4. API 통신

### HTTP 클라이언트 / 공통 처리
- 상태: ❓ 미결정
- 선택지: fetch 래퍼 / axios (+ 인터셉터)
- 결정:
- 결정일:

### API 타입 관리
- 상태: ❓ 미결정
- 선택지: 수동 타입 정의 / OpenAPI 코드 생성 / 백엔드와 타입 공유
- 결정:
- 결정일:

## 5. 지원 범위

### 대상 디바이스 / 반응형
- 상태: ❓ 미결정
- 선택지: 데스크톱만 / 모바일 우선 / 완전 반응형
- 결정:
- 결정일:

### 지원 브라우저
- 상태: ❓ 미결정
- 결정:
- 결정일:

## 6. 사용자별 대시보드 (biz_flows.md 요건)

> biz_flows.md: "사용자 권한별 대시보드를 분리하여 설계"

### 강사용 대시보드
- 강의 등록·관리, 수강생 목록, 진도율 관리, 수익 정산

### 수강생용 대시보드
- 수강 현황, 팀빌딩 참여, 프로젝트 진행 이력, AI 창업 튜터

### 투자자용 대시보드
- IR 열람, AI 매칭 추천, 미팅 제안, 포트폴리오 관리

---

## 7. 사용자 피드백 및 알림 시스템 규칙 (하네스 전사 표준)

- **원칙**: 브라우저 내장 회색 팝업창(`window.alert()`, `window.confirm()`, `window.prompt()`) 사용 **전면 금지**
- **이유**: 브라우저 JS 싱글 스레드 블로킹, 반응형/모바일 UI 부조화, 일관되지 않은 플랫폼 기본 룩앤필 배제 및 글래스모피즘 기반 프리미엄 UX 제공
- **표준 도구**: `src/components/common/Toast.tsx`의 `useToast()` 훅 활용

| 알림 유형 | 사용 API | 설명 및 규격 |
|---|---|---|
| **작업 성공** | `toast.success(title, message?)` | 우상단 슬라이드 인앱 토스트 (녹색 테두리/글로우) |
| **작업 실패/에러** | `toast.error(title, message?)` | 우상단 슬라이드 인앱 토스트 (적색 테두리/글로우) |
| **주의/경고** | `toast.warning(title, message?)` | 우상단 슬라이드 인앱 토스트 (황색 테두리/글로우) |
| **일반 정보** | `toast.info(title, message?)` | 우상단 슬라이드 인앱 토스트 (청색 테두리/글로우) |
| **양방향 확인/취소** | `await toast.confirm({ title, message, confirmText?, cancelText?, type? })` | CSS 글래스모피즘 모달 다이얼로그 (Promise&lt;boolean&gt; 반환, Esc/Enter 단축키 지원, `danger`/`primary`/`success` 타입 지원) |
| **단일 확인 모달 알림** | `await toast.alert({ title?, message, confirmText?, type? })` | 시스템 `alert()`를 대체하는 CSS 모달 다이얼로그 (Promise&lt;void&gt; 반환, Esc/Enter 지원, `info`/`warning`/`error`/`success` 타입 지원) |

> ⚠️ **주의**: 컴포넌트나 이벤트 핸들러 작성 시 절대로 `window.confirm`이나 `window.alert`를 직접 호출하지 마십시오. 반드시 `const toast = useToast();`를 통해 상기 표준 API를 호출해야 합니다.

