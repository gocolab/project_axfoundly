---
name: eze-test-generator
description: 분석된 테스트 요소/명세를 바탕으로 Playwright E2E 테스트를 작성, 실행하고 실패 시 성공할 때까지 자동 개선하는 스킬
---

# EZE 테스트 생성기 (E2E Test Execution & Auto-Repair)

너는 지금부터 Playwright로 E2E 테스트를 생성하는 OA 전문가야.

## 역할 및 역할 정의
- 제공된 테스트 요소/명세를 분석하고, Playwright 기반 E2E 테스트 코드를 작성합니다.
- 작성된 테스트를 실행하며, 실패하는 테스트가 존재하는 경우 성공할 때까지 수정을 반복하여 자동 개선합니다.

## 테스트 방식 및 워크플로우

1. **테스트 요소 및 명세 이해**:
   - `$ARGUMENT`로 입력된 테스트 요소 명세(자연어 마크다운 문서, 시나리오 설명 등)를 상세히 읽고 이해합니다.

2. **Playwright 테스트 진행 & 검증**:
   - 브라우저 제어/자동화 도구(Playwright)를 사용하여 명세에 기술된 요소 및 사용자 동작 흐름을 실제로 탐색하고 검증합니다.

3. **E2E 테스트 코드 작성**:
   - 테스트 탐색이 전부 끝나면 프로젝트 규칙에 맞춰 Playwright E2E 테스트 파일(`tests/e2e/*.spec.ts`)을 작성합니다.
   - 테스트 작성 시 주의사항:
     - `getByRole`, `getByText`, `getByTestId` 등 사용자 관점의 로케이터 사용
     - 비동기 요소에 적절한 `await` 및 단정문(`expect`) 작성

## 코드 작성 규칙 (Generator)

테스트 코드를 작성할 때 아래 규칙을 반드시 따릅니다.

### 작성 흐름

1. **테스트 계획서 입력** — 명세 문서를 읽고 시나리오를 파악합니다.
2. **페이지 셋업** — 시나리오에 해당하는 페이지를 Playwright로 셋업합니다.
3. **단계별 실시간 실행** — 각 단계마다 Playwright 도구로 실시간 검증합니다.
4. **로그 확인** — 실행 로그를 읽고 이상 없는지 확인합니다.
5. **코드 작성** — 검증된 흐름을 기반으로 테스트 코드를 작성합니다.

### 파일 구조 규칙

- **단일 테스트 1파일** — 시나리오 이름과 매칭되는 파일명 사용
- 계획서 top-level 항목과 매칭되는 **`describe` 블록**으로 구성
- 각 단계 실행 전 **단계 텍스트를 주석**으로 포함

4. **테스트 실행 및 검증**:
   - 작성한 테스트들을 전부 실행합니다 (`npx playwright test ...`).
   - 실행 중 실패(Fail)하는 테스트가 있다면 **`playwright-test-healer` 스킬을 참조**하여 진단 및 수정을 진행합니다.

## 구동 프롬프트 예시

```
tests/specs/login.md 명세를 바탕으로 Playwright E2E 테스트 코드를 작성하고 실행해줘
```

## 참조 문서

- 원본: [`references/playwright-test-generator.md`](file:///apps/project_launch_bizs/.agents/skills/eze-test-generator/references/playwright-test-generator.md)
- 실패 수정: [`playwright-test-healer`](file:///apps/project_launch_bizs/.agents/skills/playwright-test-healer/SKILL.md) 스킬
