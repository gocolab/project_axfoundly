# 「AI로 창업하라」 — 에이전트 프로젝트 가이드

> 창업 교육부터 팀 빌딩, 투자 유치까지 연결하는 올인원 플랫폼

이 문서는 AI 에이전트가 프로젝트에 진입할 때 **가장 먼저 읽는 목차**입니다.
전체 문서 구조를 파악하고, 작업 유형에 따라 적절한 문서를 참조하세요.

---

## 문서 맵

### 규칙 & 명세 (`.agents/rules/`)

| 경로 | 내용 |
|------|------|
| [`AGENT_GUIDE.md`](file:///apps/project_launch_bizs/.agents/rules/AGENT_GUIDE.md) | 에이전트 작업 지침서 — 인터뷰 절차, 개발 시작 조건, 문서 유지 규칙 |
| [`99_DECISIONS.md`](file:///apps/project_launch_bizs/.agents/rules/99_DECISIONS.md) | 결정 변경 이력 — 폐기된 방안 추적 |
| [`coding/`](file:///apps/project_launch_bizs/.agents/rules/coding) | 규칙 문서 (00~09) — 프로젝트·스택·백엔드·프론트엔드·DB·AI·인프라·테스트·협업·네이밍 |
| [`specs/`](file:///apps/project_launch_bizs/.agents/rules/specs) | 산출물 문서 (10~14) — API·화면·배치·운영·LLM 명세 + 와이어프레임 |

### 비즈니스 문서 (`docs/bizs/`)

| 경로 | 내용 |
|------|------|
| [`biz_flows.md`](file:///apps/project_launch_bizs/docs/bizs/biz_flows.md) | 비즈니스 모델·기능 구성·개발 로드맵 |
| [`menus.md`](file:///apps/project_launch_bizs/docs/bizs/menus.md) | 메뉴 구조·업무지시서 (프론트엔드/백엔드 구현 기준) |

### 스킬 (`.agents/skills/`)

| 스킬 | 용도 |
|------|------|
| [`agentic-dev`](file:///apps/project_launch_bizs/.agents/skills/agentic-dev/SKILL.md) | 에이전틱 개발 가이드 — 역할 분담, 품질 게이트, 컨텍스트 관리, 문서 우선 원칙 |
| [`e2e-testing`](file:///apps/project_launch_bizs/.agents/skills/e2e-testing/SKILL.md) | Playwright E2E 테스트 — Plan → Generate → Heal 파이프라인 |

---

## 에이전트 역할 정의

| 역할 | 책임 | 참조 문서 |
|------|------|-----------|
| **구현 에이전트** | 아키텍처 규칙에 따라 실제 코드를 작성 | `coding/*`, `specs/*` |
| **테스트/리뷰 에이전트** | 코드 품질 검토, E2E·유닛 테스트 실행 | `e2e-testing` 스킬, `coding/07_TEST.md` |
| **문서화 에이전트** | 코드 변경에 맞춰 명세·문서를 최신 상태로 업데이트 | `AGENT_GUIDE.md`, `99_DECISIONS.md` |

---

## 컨텍스트 관리 원칙

1. **가벼운 컨텍스트 유지** — 이 파일(`AGENTS.md`)이 프로젝트 개요를 제공하고, 에이전트가 특정 작업을 할 때 어떤 문서를 참조해야 하는지 안내하는 **목차** 역할을 수행합니다.
2. **필요할 때만 참조** — 모든 문서를 한 번에 읽지 마세요. 작업에 필요한 문서만 참조하세요.
3. **중복 금지** — 동일한 정보가 두 곳에 존재하면 안 됩니다. 정보의 원본은 하나만 유지하세요.

---

## 품질 게이트 체크리스트

코드 변경 시 아래 게이트를 **반드시** 통과해야 합니다:

- [ ] `npm run build` — 빌드 성공
- [ ] 린트 에러 0건
- [ ] 관련 테스트 스위트 통과
- [ ] 코드와 명세 문서 일치 확인
- [ ] 결정 변경 시 `99_DECISIONS.md` 업데이트

---

## 작업 유형별 진입점

| 작업 | 먼저 읽을 문서 |
|------|---------------|
| 새 기능 구현 | `AGENT_GUIDE.md` → `coding/*` → `specs/*` |
| 버그 수정 | 관련 `specs/*` → 소스코드 |
| E2E 테스트 | `e2e-testing` 스킬 |
| 설계 결정 | `AGENT_GUIDE.md` (인터뷰 규칙) → `coding/*` |
| 비즈니스 요구사항 확인 | `docs/bizs/biz_flows.md`, `docs/bizs/menus.md` |
