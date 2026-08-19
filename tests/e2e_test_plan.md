# 「AI로 창업하라」 E2E 및 API 통합 테스트 실행 계획서

> **문서 상태:** ✅ 최신화 완료 (전 도메인 C/U/D 및 상태전환 시나리오 반영)  
> **테스트 프레임워크:** Playwright (`@playwright/test`)

---

## 1. 테스트 실행 매트릭스

| ID | 테스트 스위트 파일 | 대상 도메인 | 검증 항목 수 |
|---|---|---|---|
| **TC-01** | [`gnb_navigation.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/gnb_navigation.spec.ts) | GNB & 알림 센터 | 4 |
| **TC-02** | [`main_page.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/main_page.spec.ts) | 메인 홈 & 비즈니스 진입점 | 4 |
| **TC-03** | [`auth_roles.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/auth_roles.spec.ts) | 4종 RBAC 빠른 로그인 & 권한 격리 | 6 |
| **TC-04** | [`courses.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/courses.spec.ts) | 강의 탐색, 달력, 인포그래픽, 강사 모달, 수강신청/결제 | 8 |
| **TC-05** | [`ir_pitching.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/ir_pitching.spec.ts) | 스타트업 IR, 스텔스 모드, 구인 지원서 제출, 투자 제안 | 8 |
| **TC-06** | [`community.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/community.spec.ts) | 멀티 게시판, 새 글 작성, 상세 모달, 실시간 댓글 등록 | 6 |
| **TC-07** | [`dashboards.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/dashboards.spec.ts) | 4종 역할 대시보드 (프로젝트 등록/수정, 환불, AI 강의 개설, CRM 발송, 게시판 생성) | 4 (통합 시나리오) |
| **TC-08** | [`api_integration.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/api_integration.spec.ts) | 백엔드 11개 라우터 전수 무결성 (Auth, Courses, IR, Community, Payments, Team, Instructor, Investments, Admin, Notifications, AI) | 12 |

---

## 2. 테스트 실행 명령어

```bash
# 린트 검증
npm run lint

# 전체 E2E 테스트 실행
npm run test:e2e

# 특정 테스트 파일 실행 예시
npx playwright test tests/e2e/dashboards.spec.ts
```
