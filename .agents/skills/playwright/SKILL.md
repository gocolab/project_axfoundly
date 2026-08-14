---
name: playwright
description: Playwright E2E 테스트 작성, 실행, 브라우저 자동화 및 화면/기능 검증 스킬
---

# Playwright Skill — E2E 테스트 및 브라우저 자동화

이 스킬은 「AI로 창업하라」 (react-example) 프로젝트에서 Playwright를 사용하여 E2E(End-to-End) 테스트를 작성하고 실행하며 UI/API 통합 검증을 수행할 때 참조합니다.

## 프로젝트 가동 환경 정보

- **개발 서버 주소**: `http://localhost:3000` (Express + Vite 통합 서버)
- **테스트 파일 위치**: `tests/e2e/*.spec.ts`
- **설정 파일**: `playwright.config.ts`

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
```

## E2E 테스트 작성지침

1. **테스트 파일 작성 위치**: `tests/e2e/` 디렉토리 내에 `*.spec.ts` 확장자로 작성합니다.
2. **페이지 기반 로케이터**: DOM 접근 시 `getByRole`, `getByText`, `getByTestId` 등 사용자 시각적 기준 로케이터를 최우선으로 사용합니다.
3. **비동기 처리**: 모든 동작 및 단성에 `await`를 반드시 부여합니다.
4. **서버 자동 가동**: `playwright.config.ts`에 설정된 `webServer`로 인해 테스트 시작 시 `http://localhost:3000` 서버가 자동 확인/시작됩니다.

## 디버깅 및 리포트 관리

- 실패 시 자동 생성되는 스크린샷 및 추적 기록(`test-results/`)을 활용하여 문제 원인을 파악합니다.
- HTML 리포트 확인: `npx playwright show-report`

## E2E 자동화 연계 스킬 (Sub-Skills)

아래 3개의 스킬이 **Plan → Generate → Heal** 파이프라인을 구성합니다.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│  e2e-test-       │ ──▶ │  eze-test-       │ ──▶ │  playwright-test-    │
│  generator       │     │  generator       │     │  healer              │
│  (Plan)          │     │  (Generate)      │     │  (Heal)              │
│                  │     │                  │     │                      │
│  페이지 분석     │     │  코드 작성       │     │  실패 진단·수정      │
│  → 명세서 생성   │     │  → 테스트 실행   │     │  → 통과까지 반복     │
└─────────────────┘     └─────────────────┘     └─────────────────────┘
```

- **`e2e-test-generator`** (Plan): 대상 페이지 접속 후 테스트 요소를 분석하여 자연어 마크다운 명세서(`./tests/`)로 생성하는 스킬
- **`eze-test-generator`** (Generate): 명세를 바탕으로 Playwright E2E 테스트 코드를 자동 생성·실행하는 스킬
- **`playwright-test-healer`** (Heal): 실패한 테스트를 체계적으로 진단하고 자동 수정하여 통과시키는 스킬

## 구동 프롬프트 예시 (전체 파이프라인)

```
http://localhost:3000/dashboard 페이지에 대해 E2E 테스트를 계획하고, 코드를 생성한 뒤, 모든 테스트가 통과할 때까지 자동 수정해줘
```


