---
name: dev-orchestrator
description: |
  「AI로 창업하라」 개발 파이프라인 오케스트레이터. 사전 Git pull → architect(설계) → implementer(구현) → qa-reviewer(검증) → doc-syncer(문서화) → Git commit → 사용자 승인 후 push 순서로 에이전트 스킬을 조율하여 기능을 완성한다.
  (1) '기능 개발해줘', '메뉴 구현해줘', '전체 개발 플로우', '파이프라인 실행' 요청 시,
  (2) '[교육/IR/커뮤니티/대시보드] 기능 만들어줘' 등 메뉴 단위 개발 요청 시,
  (3) '설계부터 검증까지', '풀 사이클 개발', '전체 프로세스' 요청 시,
  (4) '다시 실행', '재실행', '부분 재실행', '결과 개선', '이전 결과 기반으로' 등 후속 요청 시,
  (5) '개발 현황', '진행 상태', '파이프라인 상태 확인' 요청 시 사용.
  개별 에이전트를 직접 호출하고 싶으면 architect/implementer/qa-reviewer/doc-syncer 스킬을 각각 사용할 것.
---

# Dev Orchestrator — 개발 파이프라인 통합 조율

「AI로 창업하라」 플랫폼의 기능 개발을 소스 동기화부터 설계, 구현, 검증, 문서화, 로컬 커밋 및 승인 기반 원격 Git 푸시까지 완전한 파이프라인으로 실행하는 통합 스킬.

## 실행 모드: 파이프라인 (순차 실행)

## 에이전트 및 단계 구성

| 순서 | 담당 / 스킬 | 역할 | 출력 / 작업 내용 |
|------|-------------|------|------------------|
| Phase 0 | 오케스트레이터 | 사전 상태 점검 & 소스 동기화 | `git status`, `git pull origin <branch>` 최신화 |
| Phase 1 | [`architect`](file:///apps/project_launch_bizs/.agents/skills/architect/SKILL.md) | 명세 작성 (API/화면/DB) | `specs/*` 문서 갱신 |
| Phase 2 | [`implementer`](file:///apps/project_launch_bizs/.agents/skills/implementer/SKILL.md) | 코드 구현 (프론트+백엔드) | `src/`, `server/` 코드 |
| Phase 3 | [`qa-reviewer`](file:///apps/project_launch_bizs/.agents/skills/qa-reviewer/SKILL.md) | 품질 검증 (경계면+빌드+린트) | 검증 보고서 + 수정 (품질 게이트 통과) |
| Phase 4 | [`doc-syncer`](file:///apps/project_launch_bizs/.agents/skills/doc-syncer/SKILL.md) | 문서 동기화 | `specs/*`, `99_DECISIONS.md` 갱신 |
| Phase 5 | 오케스트레이터 | 안전한 Git 커밋 & **사용자 승인 후 원격 푸시** | `git add`, `git commit` 완료 후 사용자 승인 확인 → `git push origin <branch>` |
| Phase 6 | 오케스트레이터 | 최종 완료 보고 | 작업 결과 및 커밋/푸시 상태 요약 보고 |

## 워크플로우

### Phase 0: 컨텍스트 확인 및 사전 Git 동기화

기능 개발 요청을 받으면 가장 먼저 현재 소스코드 상태와 원격 변경사항을 확인한다:

1. **Git 상태 및 소스 동기화 (사전 Pull)**:
   ```bash
   git status
   git pull origin $(git branch --show-current)
   ```
   - 현재 브랜치와 미커밋 변경사항 확인
   - 원격 저장소의 최신 코드를 안전하게 가져와 로컬과 동기화
   - 충돌 발생 시 사용자에게 즉시 알리고 해결 후 진행
2. **요구사항 분석**: 사용자 요청에서 구현할 기능/메뉴를 식별한다
3. **기존 상태 확인**:
   - 해당 기능의 명세가 `specs/*`에 이미 존재하는지 확인
   - 해당 기능의 코드가 `src/`, `server/`에 이미 존재하는지 확인
4. **실행 모드 결정**:
   - **신규 개발**: 명세도 코드도 없음 → Phase 1부터 전체 실행
   - **명세 있음, 코드 없음**: → Phase 2부터 실행
   - **코드 수정 요청**: 기존 코드 수정 → Phase 2(구현 수정)부터 실행
   - **부분 재실행**: 특정 Phase만 재실행 요청 → 해당 Phase만 실행
5. **사용자에게 실행 계획을 보고**하고 확인을 받는다

### Phase 1: 설계 (architect)

> 이 Phase의 스킬: [`architect`](file:///apps/project_launch_bizs/.agents/skills/architect/SKILL.md)

1. [`biz_flows.md`](file:///apps/project_launch_bizs/docs/bizs/biz_flows.md)와 [`menus.md`](file:///apps/project_launch_bizs/docs/bizs/menus.md)에서 기능 요구사항을 확인한다
2. API 명세를 작성한다 → `specs/10_API_SPEC.md`
3. 화면 설계를 작성한다 → `specs/11_SCREEN_SPEC.md`
4. DB 스키마를 설계한다 → `coding/04_DATABASE.md`
5. **체크포인트**: 명세 작성 완료를 사용자에게 보고하고 승인을 받는다

### Phase 2: 구현 (implementer)

> 이 Phase의 스킬: [`implementer`](file:///apps/project_launch_bizs/.agents/skills/implementer/SKILL.md)

1. Phase 1의 명세를 기반으로 타입을 정의한다 → `src/types.ts`
2. 백엔드 API를 구현한다 → `server/routes/`
3. 프론트엔드 컴포넌트를 구현한다 → `src/components/`
4. 빌드 검증을 실행한다 → `npm run build`
5. **빌드 실패 시**: 에러를 분석하고 수정한 후 재빌드 (최대 3회)

### Phase 3: 검증 (qa-reviewer)

> 이 Phase의 스킬: [`qa-reviewer`](file:///apps/project_launch_bizs/.agents/skills/qa-reviewer/SKILL.md)

1. 빌드·린트 검증을 실행한다:
   ```bash
   npm run build
   npx tsc --noEmit
   ```
2. 경계면 교차 비교를 수행한다:
   - API 응답 ↔ 프론트 타입 (`types.ts`)
   - API 엔드포인트 ↔ 명세 (`10_API_SPEC.md`)
   - DB 쿼리 ↔ DB 스키마 (`04_DATABASE.md`)
3. 코드 리뷰를 수행한다 (규칙 문서 기준)
4. **문제 발견 시**: 직접 수정하거나 수정안을 제시한다
5. 수정 후 재빌드하여 **품질 게이트 100% 통과**를 확인한다

### Phase 4: 문서 동기화 (doc-syncer)

> 이 Phase의 스킬: [`doc-syncer`](file:///apps/project_launch_bizs/.agents/skills/doc-syncer/SKILL.md)

1. Phase 2~3에서 변경된 코드를 기반으로 명세 문서를 갱신한다
2. 결정 변경이 있었으면 `99_DECISIONS.md`에 기록한다
3. 문서 drift 검사를 수행한다
4. 동기화 결과를 확인한다

### Phase 5: Git 커밋 및 승인 후 원격 푸시

> 품질 게이트(빌드/린트/테스트/문서동기화)가 모두 통과된 경우에만 로컬 커밋을 수행하고, 푸시는 반드시 사용자 승인을 거친다.

1. **변경 파일 검토**:
   ```bash
   git status
   ```
   - 불필요한 임시 파일, 민감 정보 포함 여부 점검
2. **커밋 메시지 작성 및 커밋**:
   - Conventional Commits 컨벤션 적용 (`feat:`, `fix:`, `docs:`, `refactor:` 등)
   - 명확하고 구체적인 작업 요약 작성
   ```bash
   git add <변경파일들>
   git commit -m "feat(scope): 기능 및 명세 동기화 완료"
   ```
3. **사용자 푸시 승인 확인**:
   - 커밋 완료 후 사용자에게 커밋 해시, 커밋 메시지, 대상 원격 브랜치를 안내하고 푸시 여부를 확인한다:
     > "로컬 커밋이 완료되었습니다 (`<commit-hash>` `<commit-message>`). 원격 브랜치(`origin/<branch>`)로 push를 진행할까요?"
4. **승인 시 원격 저장소 푸시 실행**:
   - 사용자가 승인하면 원격 푸시를 실행한다:
   ```bash
   git push origin $(git branch --show-current)
   ```
5. **푸시 결과 확인**: 원격 반영 상태 확인

### Phase 6: 최종 완료 보고

1. 전체 파이프라인 실행 결과를 요약 보고한다:
   - ✅ 소스 동기화: 시작 전 최신 `git pull` 완료
   - ✅ 설계 완료: 작성/갱신된 명세 목록
   - ✅ 구현 완료: 생성/수정된 소스 파일 목록
   - ✅ 검증 통과: 빌드·린트·경계면 검증 100% 성공
   - ✅ 문서 동기화: 갱신된 문서 목록
   - ✅ Git 반영: 커밋 완료 (메시지, 커밋 해시) 및 푸시 상태 (승인 후 푸시 완료 또는 푸시 대기 중)
2. 미완료 항목이 있으면 명시한다
3. 다음 단계 제안 (추가 기능 개발, E2E 테스트, 배포 등)

## 데이터 흐름

```
[사용자 요청]
      ↓
  Phase 0: 사전 동기화 (git status & git pull) + 컨텍스트 확인
      ↓
  Phase 1: architect → specs/* 갱신
      ↓
  Phase 2: implementer → src/, server/ 코드 생성
      ↓
  Phase 3: qa-reviewer → 검증 + 수정 (품질 게이트 통과)
      ↓
  Phase 4: doc-syncer → specs/* 최종 동기화
      ↓
  Phase 5: Git 로컬 커밋 → [사용자 승인 요청] → 승인 시 git push
      ↓
  Phase 6: 최종 완료 보고
```

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| Phase 0 Git Pull 충돌 | 로컬 미커밋 변경사항 확인 → stash 또는 병합 후 사용자에게 상태 보고 |
| Phase 1 실패 (명세 작성 불가) | 사용자에게 부족한 정보를 요청, 정보 확보 후 재시도 |
| Phase 2 빌드 실패 | 에러 분석 → 코드 수정 → 재빌드 (최대 3회). 3회 실패 시 사용자에게 보고 |
| Phase 3 경계면 불일치 | 직접 수정 후 Phase 2 재빌드. 구조적 문제면 Phase 1(설계)로 회귀 |
| Phase 4 문서 충돌 | 사용자에게 확인 후 처리 |
| Phase 5 Git Push 거절/보류 | 로컬 커밋 상태를 안전하게 보존하고 완료 보고에 '푸시 대기' 상태 명시 |
| Phase 5 Git Push 실패 | 원격 충돌 여부 확인 (`git fetch` / `git log`), upstream 설정 점검, force push 금지 |

## 테스트 시나리오

### 정상 흐름
1. 사용자가 "교육/강의 목록 페이지를 구현해줘"를 요청
2. Phase 0: `git status` 확인 및 `git pull origin loop_engineerings`로 최신 상태 동기화
3. Phase 1: API 명세(GET /api/courses), 화면 설계(CoursePage 컴포넌트), DB 스키마(courses 컬렉션) 작성
4. Phase 2: courses 라우트, CoursePage 컴포넌트, 타입 정의 구현, 빌드 성공
5. Phase 3: 경계면 검증 통과, 빌드·린트 통과 (`npm run build`, `npx tsc --noEmit`)
6. Phase 4: specs 문서 갱신 및 drift 0건 확인
7. Phase 5: `git add .`, `git commit -m "feat(course): 강의 목록 페이지 및 API 연동"` 실행 후 사용자에게 푸시 승인 확인 → 사용자 승인 시 `git push origin loop_engineerings` 실행
8. Phase 6: 커밋 해시 및 푸시 브랜치 상태 포함 완료 보고

### 에러 흐름
1. Phase 2에서 빌드 실패 (타입 에러)
2. 에러 분석: types.ts의 Course 인터페이스와 API 응답 불일치
3. types.ts 수정 후 재빌드 → 성공
4. Phase 3에서 추가 경계면 불일치 발견 → 수정 후 재빌드 성공
5. Phase 4~5 로컬 커밋 완료 및 사용자 승인 후 원격 Git 푸시 완료
6. Phase 6 최종 완료 보고
