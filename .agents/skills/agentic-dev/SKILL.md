---
name: agentic-dev
description: |
  에이전틱 개발(Agentic Development) 가이드.
  코드 작성·설계·기능 구현 등 모든 개발 작업 전에 이 스킬을 읽고 따른다.
  역할 분담, 품질 게이트, 컨텍스트 관리, 문서 우선 원칙을 정의한다.
---

# Agentic Development Guide — 「AI로 창업하라」 플랫폼

## 핵심 원칙

에이전틱 개발은 "바이브"가 아니라 **명세 기반의 자율적이고 검증 가능한 개발 방식**이다. 아래 원칙을 반드시 따른다.

### 1. 명확한 스펙 문서화 (문서 → 코드 순서)

- 코드를 작성하기 전, **"완료"의 기준**을 명확히 정의한다.
- 설계 변경이 필요하면 **문서를 먼저 수정**하고, 코드를 문서에 맞춘다. 반대 방향 금지.
- 결정 변경 시 `99_DECISIONS.md`에 변경 이력을 남긴다.

### 2. 가벼운 컨텍스트 관리

- 에이전트에 한 번에 너무 많은 정보를 주입하면 품질이 떨어지고 할루시네이션이 발생한다.
- **불필요하거나 중복된 명세는 제거**하고, 필요할 때만 참조한다.
- 이 스킬과 `AGENTS.md`가 **목차 역할**을 수행하며, 세부 문서는 필요 시 참조한다.

### 3. 품질 게이트 (자동화 검증 루프 & Git 배포)

코드 변경 후 아래 게이트를 **반드시** 통과해야 한다:

- [ ] **사전 동기화**: `git status` 점검 및 `git pull origin <branch>` 완료
- [ ] **빌드 통과**: `npm run build` 성공 (TypeScript 컴파일 포함)
- [ ] **린트 통과**: 린트 에러 0건
- [ ] **테스트 통과**: 관련 테스트 스위트 성공
- [ ] **문서 동기화**: 코드와 명세 문서 일치 확인
- [ ] **Git 반영**: 품질 게이트 통과 후 Conventional Commits 기반 `git commit` 완료 및 **사용자 승인 후 `git push`** 수행

실패 시 에러 로그를 읽고 **스스로 코드를 수정(Self-correction)** 한다.

### 4. 역할 분담 (하네스 기반 멀티 에이전트 파이프라인)

복잡한 작업은 하나의 에이전트에게 모두 맡기지 않고, 전문 에이전트 스킬로 역할을 분리한다.
전체 파이프라인을 한 번에 실행하려면 [`dev-orchestrator`](file:///apps/project_launch_bizs/.agents/skills/dev-orchestrator/SKILL.md) 스킬을 사용한다.

| 역할 | 스킬 | 책임 |
|------|------|------|
| **설계·명세** | [`architect`](file:///apps/project_launch_bizs/.agents/skills/architect/SKILL.md) | API/화면/DB 명세 작성, 인터뷰 진행, 기술 의사결정 |
| **풀스택 구현** | [`implementer`](file:///apps/project_launch_bizs/.agents/skills/implementer/SKILL.md) | specs 기반 React + Express + MongoDB 코드 작성 |
| **품질 검증** | [`qa-reviewer`](file:///apps/project_launch_bizs/.agents/skills/qa-reviewer/SKILL.md) | 경계면 교차 비교, 빌드·린트·E2E 테스트, 코드 리뷰 |
| **문서 동기화** | [`doc-syncer`](file:///apps/project_launch_bizs/.agents/skills/doc-syncer/SKILL.md) | 명세-코드 동기화, 결정 변경 이력 관리 |

---

## 필수 참조 문서

**코드를 작성하기 전에 반드시 아래 문서를 읽고 따라야 합니다.**

1. **컨텍스트 스위처**: [`.agents/AGENTS.md`](file:///apps/project_launch_bizs/.agents/AGENTS.md)
   - 프로젝트 전체 문서 맵과 에이전트 역할 정의의 진입점입니다.
2. **에이전트 작업 지침**: [`.agents/rules/AGENT_GUIDE.md`](file:///apps/project_launch_bizs/.agents/rules/AGENT_GUIDE.md)
   - 인터뷰 절차·개발 시작 조건·문서 유지 규칙을 정의합니다.
3. **협업 및 Git 규칙**: [`.agents/rules/coding/08_COLLABORATION.md`](file:///apps/project_launch_bizs/.agents/rules/coding/08_COLLABORATION.md)
   - 브랜치 전략, 커밋 컨벤션, Git Pull/Push 프로세스를 정의합니다.
4. **업무 정의**: [`docs/bizs/biz_flows.md`](file:///apps/project_launch_bizs/docs/bizs/biz_flows.md)
   - 플랫폼의 비즈니스 모델·기능 구성·개발 로드맵을 정의합니다.

## 워크플로우

1. **작업 시작 전**:
   - `.agents/AGENTS.md`를 읽어 문서 세트 구조와 현재 결정 상태를 파악한다.
   - `git status` 확인 및 `git pull origin <branch>`를 통해 원격 최신 코드를 동기화한다.
2. **설계 결정이 필요한 경우**: `.agents/rules/coding/` 폴더의 해당 문서에서 ✅/❓ 상태를 확인한다.
   - ❓ 미결정 항목이 있으면 **코드를 작성하지 않고** 사용자에게 질문한다.
3. **기능 구현 전**: 해당 기능의 API 명세(`specs/10_API_SPEC.md`), 화면 설계(`specs/11_SCREEN_SPEC.md`)를 먼저 작성하고 사용자 확인을 받는다.
4. **코드 작성 후**: 품질 게이트(빌드·린트·테스트)를 통과하고, 문서와 코드가 일치하는지 확인한다. 불일치 시 문서를 먼저 수정한다.
5. **검증 완료 후**: Conventional Commits 규칙으로 로컬 커밋을 완료한 후, 사용자에게 보고하여 **명시적 승인을 받은 후** 원격 저장소에 `git push`를 수행한다.

## 테스트 자동화

E2E 테스트가 필요한 경우 [`e2e-testing`](file:///apps/project_launch_bizs/.agents/skills/e2e-testing/SKILL.md) 스킬을 참조한다.
Plan → Generate → Heal 파이프라인으로 테스트를 자동화할 수 있다.
