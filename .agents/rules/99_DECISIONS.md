# 99. 결정 변경 이력

> 이미 ✅로 확정된 결정을 **변경**할 때만 기록한다. (최초 결정은 각 문서에 기록되므로 여기 쓰지 않는다)
> 목적: 나중에 "왜 이렇게 바꿨더라?"를 추적하고, AI가 과거에 폐기된 방안을 다시 제안하지 않게 한다.

## 변경 이력

> 최신 항목을 표의 맨 위에 추가한다.

| 날짜 | 문서 | 항목 | 이전 결정 | 새 결정 | 변경 이유 |
|---|---|---|---|---|---|
| 2026-08-26 | components/AuthModal.tsx, .env.example | 개발용 데모 로그인 노출 정책 | 모든 환경에서 상시 노출 | 환경변수(`VITE_SHOW_DEMO_LOGIN`) 및 DEV 환경 기반 조건부 노출 (운영 기본 숨김) | 실제 운영(Production) 환경에서 일반 사용자에게 테스트용 데모 계정이 노출되는 보안 및 UX 문제 방지 |
| 2026-08-26 | components/GNB.tsx, components/AuthModal.tsx | 로그인/회원가입 버튼 UI | GNB 상단에 '로그인'과 '회원가입' 2개 버튼 분리 표시 | GNB 상단에 '로그인' 단일 버튼으로 일원화 및 모달 내 간편가입 통합 안내 | OAuth 기반 특성(기존 회원 로그인/신규 회원 자동가입 Upsert)에 맞춰 UX 단순화 및 헤더 레이아웃 최적화 |
| 2026-08-25 | .agents/*, coding/08_COLLABORATION.md | Git Push 사용자 승인 정책 | 품질 게이트 통과 시 `git commit & push` 일괄 자동 실행 | `git commit`은 품질 게이트 통과 후 자동 수행, `git push`는 항상 사용자 승인 확인 후 실행 | 커밋은 안전하게 보존하면서 원격 저장소 배포 및 푸시 시점을 사용자가 직접 검토하고 통제할 수 있도록 개선 |
| 2026-08-25 | specs/11_SCREEN_SPEC.md | 상세 보기 UI 패턴 전환 | 화면 전체를 덮는 오버레이(Overlay) 드로어 방식 | 마스터-디테일 스플릿 뷰 (Master-Detail Split View) + 조건부 컬럼 자동 숨김/압축 | 상세 정보 확인 중에도 좌측 목록 탐색과 컨텍스트를 유지하고, 공간에 맞게 중요 컬럼만 남기는 현대적 대시보드 UX 제공 |
| 2026-08-24 | .agents/* | 하네스 Git Pull & Push 연동 | 수동 Git 관리 / 미정의 | 작업 시작 시 `git pull` 사전 동기화 및 품질 게이트 통과 후 `git commit & push` 자동화 파이프라인 연동 | 에이전틱 개발 파이프라인에서 원격 코드 동기화 누락 방지 및 검증 완료된 코드의 안정적인 형상 관리/원격 배포 보장 |
| 2026-08-21 | .agents/plugins/* | Ralph-Loop 플러그인 도입 | 수동 빌드/테스트 후 단발성 수정 | `.agents/plugins/ralph-loop/` 네이티브 플러그인 및 스킬 도입 (Antigravity 환경 맞춤 자율 루프) | Claude Code 전용 플러그인(`ralph-loop@claude-plugins-official`)의 기능을 Antigravity 환경에 맞게 네이티브 플러그인으로 전환 구현하여 자율 반복 개선 지원 |
| 2026-08-20 | specs/*, docs/bizs/* | 핵심 누락 기능 완비 | AI 튜터/가상 IR/전자계약 미구현 상태 | 플로팅 AI 창업 튜터 위젯(`AITutorWidget`), 원클릭 자체 지원서(`JobApplicationModal`), 가상 IR 화상 피칭룸 & NDA 전자계약(`VirtualIRModal`), 멀티 게시판 생성 마법사(`AdminBoardCreateModal`) 통합 완료 | biz_flows.md 및 menus.md 비즈니스 지시서 상의 전 주기 올인원 파이프라인 완성 |
| 2026-08-18 | docs/bizs/menus.md, specs/11_SCREEN_SPEC.md | UX 및 기능 명세 보완 | 기본 목록 및 정적 화면 구성 | 공통 검색/페이지네이션, AI 초벌 강의 개설 & 징검다리 달력 연동, 강사 상세 모달/인포그래픽, IR 구인 옵션/영상/실명설정, CRM 타깃 메시징 반영 | 사용자 요구에 따른 UX 고도화 및 실무 인터랙션 강화 |
| 2026-08-11 | (전체) | 프로젝트 전환 | CCTV 출결 자동 관리 & 알림 시스템 | 「AI로 창업하라」 — 창업 교육~투자 유치 올인원 플랫폼 | 프로젝트 전면 변경. 기존 문서 세트 구조(AGENT_GUIDE 템플릿)는 유지하되 프로젝트별 내용 전체 교체. 업무 정의는 docs/bizs/biz_flows.md 참조 |

## 폐기된 방안 (다시 제안 금지)

> 검토했지만 명확한 이유로 폐기한 방안. AI는 아래 방안을 다시 제안하지 않는다.

| 방안 | 폐기 이유 | 날짜 |
|---|---|---|
| Vercel 종속 배포 | biz_flows.md — 클라우드 종속 없이 On-Premise/타 클라우드 이전 가능 구조 요구 | 2026-08-11 |
