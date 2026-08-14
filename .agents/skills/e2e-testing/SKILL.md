---
name: e2e-testing
description: |
  Playwright 기반 E2E 테스트 통합 스킬.
  Plan(명세 분석) → Generate(코드 작성) → Heal(자동 수정)
  3단계 파이프라인으로 E2E 테스트를 자동화한다.
---

# E2E Testing — Playwright 통합 테스트 스킬

이 스킬은 「AI로 창업하라」 프로젝트에서 Playwright를 사용하여 E2E 테스트를 **계획 → 생성 → 자가 복구**하는 전체 파이프라인을 다룹니다.

## 프로젝트 환경 정보

- **개발 서버 주소**: `http://localhost:3000` (Express + Vite 통합 서버)
- **테스트 파일 위치**: `tests/e2e/*.spec.ts`
- **설정 파일**: `playwright.config.ts`
- **MCP 서버**: `.agents/mcp.json` — `@playwright/mcp-server` (headless 모드)

## 핵심 명령어

```bash
# E2E 테스트 실행 (Headless)
npm run test:e2e

# UI 모드로 테스트 실행
npm run test:e2e:ui

# 특정 테스트 파일만 실행
npx playwright test tests/e2e/example.spec.ts

# 브라우저 디버그 모드로 실행
npx playwright test --debug

# HTML 리포트 확인
npx playwright show-report
```

---

## 3단계 파이프라인

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│  ① Plan          │ ──▶ │  ② Generate      │ ──▶ │  ③ Heal              │
│                  │     │                  │     │                      │
│  페이지 분석     │     │  코드 작성       │     │  실패 진단·수정      │
│  → 명세서 생성   │     │  → 테스트 실행   │     │  → 통과까지 반복     │
└─────────────────┘     └─────────────────┘     └─────────────────────┘
```

---

### ① Plan — 테스트 명세 분석 및 설계

대상 웹 페이지를 분석하여 테스트가 필요한 주요 UI 요소, 사용자 시나리오 및 인터랙션 포인트를 도출하고 자연어 기반의 마크다운 명세서로 정리합니다.

#### 워크플로우

1. **페이지 접속**: 대상 페이지 URL(예: `http://localhost:3000/login`)에 접속하여 DOM 및 UI 요소 상태를 확인합니다.
2. **테스트 요소 분석**:
   - 폼 입력 항목(Input, Select, Checkbox 등) 및 입력 유효성 검사
   - 주요 버튼 클릭 및 페이지 이동/모달 팝업 액션
   - 주요 텍스트/데이터 렌더링 정상 여부
   - 예외 상황 및 에러 메시지 노출 패턴
3. **시나리오 설계**:
   - **탐색** — 대상 페이지에 접속하여 인터페이스를 둘러봅니다.
   - **사용자 플로우 분석** — critical path를 식별합니다.
   - **시나리오 설계** — happy path / edge case / 에러 핸들링 시나리오를 구분하여 설계합니다.
   - **계획서 구조화** — 명확한 제목, 단계별 지침, 예상 결과를 포함합니다.
4. **마크다운 저장**: 테스트 요소를 자연어로 `./tests/` 디렉터리에 마크다운 형태로 정리합니다.
   - 대상 파일 위치 및 테스트 대상 페이지 URL
   - 테스트 항목별 역할 및 시나리오 (입력값, 조건, 기대 결과)
   - 권장 로케이터 전략 (`getByRole`, `getByText`, `getByTestId` 등)

#### 품질 기준
- 누구나 따라할 수 있는 **구체적인 단계**로 기술
- **negative 시나리오** 반드시 포함
- 각 시나리오는 **독립적으로, 어떤 순서로도 실행 가능**하게 설계

---

### ② Generate — 테스트 코드 작성 및 실행

명세를 바탕으로 Playwright E2E 테스트 코드를 작성하고 실행합니다.

#### 워크플로우

1. **테스트 요소 및 명세 이해**: 테스트 요소 명세(자연어 마크다운 문서)를 상세히 읽고 이해합니다.
2. **Playwright 탐색 및 검증**: 브라우저 자동화 도구(Playwright)를 사용하여 명세에 기술된 요소 및 사용자 동작 흐름을 실제로 탐색하고 검증합니다.
3. **테스트 코드 작성**: 프로젝트 규칙에 맞춰 `tests/e2e/*.spec.ts` 파일을 작성합니다.
4. **테스트 실행**: `npx playwright test ...`으로 전체 실행합니다.

#### 코드 작성 규칙

- **로케이터**: `getByRole`, `getByText`, `getByTestId` 등 사용자 관점의 로케이터 최우선 사용
- **비동기 처리**: 모든 동작 및 단정에 `await` 필수
- **파일 구조**: 단일 테스트 1파일, 시나리오 이름과 매칭되는 파일명
- **블록 구성**: 계획서 top-level 항목과 매칭되는 `describe` 블록으로 구성
- **단계 주석**: 각 단계 실행 전 단계 텍스트를 주석으로 포함

---

### ③ Heal — 테스트 자가 복구

실패한 테스트를 체계적으로 진단하고 자동 수정하여 통과시킵니다.

#### 워크플로우

1. **조기 실행** — `npx playwright test`로 실패 테스트를 식별합니다.
2. **디버그** — `npx playwright test --debug`로 상세 실행을 관찰합니다.
3. **에러 조사** — `test-results/` 디렉터리의 스크린샷·트레이스 파일을 확인합니다.
4. **근본 원인 분석** — 아래 4가지 중 어디에 해당하는지 판별합니다:
   - **셀렉터 변경** — DOM 구조나 텍스트가 바뀐 경우
   - **타이밍 이슈** — 비동기 로딩, 애니메이션 지연 등
   - **데이터 변경** — 테스트 데이터 불일치
   - **앱 변경** — 기능 자체가 바뀐 경우
5. **코드 수정** — 원인에 맞는 해결책을 적용합니다:
   - 셀렉터 업데이트 (더 견고한 로케이터로 교체)
   - 동적 데이터에는 정규식 로케이터 사용
   - 적절한 `waitFor` / `toBeVisible` 등 대기 조건 추가
6. **검증** — 수정 후 해당 테스트를 재실행하여 통과 여부를 확인합니다.
7. **반복** — 통과할 때까지 4~6단계를 반복합니다.

#### 핵심 원칙

- **견고하고 유지 가능한 해결 우선** — 임시 방편이 아닌 근본적 수정
- 확신이 있으면 `test.fixme()` + 사유 주석으로 표시하여 추후 대응
- **사용자에게 묻지 말고 판단으로 진행** — 자율적 의사결정
- **`networkidle` 대기 금지** — `waitForLoadState('networkidle')` 사용 불가
- 수정 시 기존 테스트 의도를 변경하지 않도록 주의

---

## 디버깅 및 리포트

- 실패 시 자동 생성되는 스크린샷 및 추적 기록(`test-results/`)을 활용하여 문제 원인을 파악합니다.
- HTML 리포트 확인: `npx playwright show-report`

## 구동 프롬프트 예시

```
# 전체 파이프라인 실행
http://localhost:3000/dashboard 페이지에 대해 E2E 테스트를 계획하고, 코드를 생성한 뒤, 모든 테스트가 통과할 때까지 자동 수정해줘

# Plan만 실행
http://localhost:3000/login 페이지를 분석해서 E2E 테스트 명세서를 생성해줘

# Generate만 실행
tests/specs/login.md 명세를 바탕으로 Playwright E2E 테스트 코드를 작성하고 실행해줘

# Heal만 실행
tests/e2e/login.spec.ts 테스트가 실패하고 있어. 진단하고 수정해서 통과시켜줘
```

## 참조 문서

- Plan 원본: [`references/planner.md`](file:///apps/project_launch_bizs/.agents/skills/e2e-testing/references/planner.md)
- Generate 원본: [`references/generator.md`](file:///apps/project_launch_bizs/.agents/skills/e2e-testing/references/generator.md)
- Heal 원본: [`references/healer.md`](file:///apps/project_launch_bizs/.agents/skills/e2e-testing/references/healer.md)
