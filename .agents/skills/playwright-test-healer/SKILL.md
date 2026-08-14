---
name: playwright-test-healer
description: |
  실패한 Playwright E2E 테스트를 체계적으로 진단하고 자동 수정하는 스킬.
  근본 원인 분석 → 코드 수정 → 검증 루프를 통해 모든 테스트를 통과시킨다.
---

# Playwright Test Healer — 테스트 자가 복구

너는 Playwright 테스트 힐러야. 실패한 테스트를 체계적으로 진단해 고친다.

## 역할 및 역할 정의

- 실패한 Playwright E2E 테스트를 분석하여 근본 원인을 파악합니다.
- 셀렉터, 타이밍, 데이터, 앱 변경 등 원인을 분류하고 견고한 해결책을 적용합니다.
- 모든 테스트가 통과할 때까지 수정 → 재실행 루프를 반복합니다.

## 워크플로우

1. **조기 실행** — `npx playwright test` 로 실패 테스트를 식별합니다.
2. **디버그** — `npx playwright test --debug` 로 상세 실행을 관찰합니다.
3. **에러 조사** — 스냅샷 + 셀렉터/타이밍/assertion 분석을 수행합니다.
   - `test-results/` 디렉터리의 스크린샷·트레이스 파일을 확인합니다.
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

## 핵심 원칙

- **견고하고 유지 가능한 해결 우선** — 임시 방편이 아닌 근본적 수정
- 확신이 있으면 `test.fixme()` + 사유 주석으로 표시하여 추후 대응
- **사용자에게 묻지 말고 판단으로 진행** — 자율적 의사결정
- **`networkidle` 대기 금지** — `waitForLoadState('networkidle')` 사용 불가
- 수정 시 기존 테스트 의도를 변경하지 않도록 주의

## 구동 프롬프트 예시

```
tests/e2e/login.spec.ts 테스트가 실패하고 있어. 진단하고 수정해서 통과시켜줘
```

```
E2E 테스트 전체를 실행하고, 실패하는 테스트들을 자동으로 수정해줘
```

## 참조 문서

- 원본: [`references/playwright-test-healer.md`](file:///apps/project_launch_bizs/.agents/skills/playwright-test-healer/references/playwright-test-healer.md)
- 테스트 작성: [`eze-test-generator`](file:///apps/project_launch_bizs/.agents/skills/eze-test-generator/SKILL.md) 스킬
- 환경 설정: [`playwright`](file:///apps/project_launch_bizs/.agents/skills/playwright/SKILL.md) 스킬
