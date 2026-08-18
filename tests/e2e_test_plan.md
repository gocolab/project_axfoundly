# 「AI로 창업하라」 통합 테스트(E2E & API) 마스터 플랜

> **최종 검증 완료일**: 2026-08-18  
> **테스트 도구**: Playwright 1.58+ (Chromium) / Fetch REST Client  
> **총 테스트 케이스**: 8개 스위트 / 45개 시나리오  
> **통과율**: 100% (45/45 Passed)

---

## 1. 테스트 개요 및 목적

본 마스터 플랜은 「AI로 창업하라」 플랫폼의 모든 비즈니스 도메인(GNB, 메인 홈, 4종 RBAC 인증, 교육/강의, 스타트업/IR, 커뮤니티, 4종 대시보드, 백엔드 REST API)의 기능적 완결성과 데이터 무결성을 빠짐없이 검증하기 위해 구축되었습니다.

---

## 2. 테스트 스위트 구성 및 커버리지 매트릭스

| 스위트 ID | 테스트 파일명 | 검증 도메인 | TC 수 | 통과 여부 |
|---|---|---|:---:|:---:|
| **TC-01** | [`tests/e2e/gnb_navigation.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/gnb_navigation.spec.ts) | GNB 공통 네비게이션, 반응형, 알림 센터 드롭다운 | 4 | **4/4 PASS** |
| **TC-02** | [`tests/e2e/main_page.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/main_page.spec.ts) | 메인 히어로 배너, 플랫폼 통계 지표, 섹션 바로가기 | 4 | **4/4 PASS** |
| **TC-03** | [`tests/e2e/auth_roles.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/auth_roles.spec.ts) | 4종 RBAC 데모 빠른 로그인 및 권한별 화면 격리 | 6 | **6/6 PASS** |
| **TC-04** | [`tests/e2e/courses.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/courses.spec.ts) | 강의 탐색, 카테고리 필터, 검색, 달력, 인포그래픽, 결제 | 7 | **7/7 PASS** |
| **TC-05** | [`tests/e2e/ir_pitching.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/ir_pitching.spec.ts) | 스타트업 탐색, 스텔스 토글, 채용 지원, 투자 제안 | 7 | **7/7 PASS** |
| **TC-06** | [`tests/e2e/community.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/community.spec.ts) | 멀티 게시판 탭, 실시간 검색, 글 작성, 댓글 상세 모달 | 6 | **6/6 PASS** |
| **TC-07** | [`tests/e2e/dashboards.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/dashboards.spec.ts) | 4종 역할별 마이페이지/관리자 대시보드 및 CRM/정산 | 4 | **4/4 PASS** |
| **TC-08** | [`tests/e2e/api_integration.spec.ts`](file:///apps/project_launch_bizs/tests/e2e/api_integration.spec.ts) | 백엔드 12개 REST API 엔드포인트 CRUD 통합 검증 | 7 | **7/7 PASS** |

---

## 3. 핵심 자동화 인프라 최적화

1. **Vite Hot-Reload 루프 방지**:
   - `vite.config.ts` 및 `server.ts`의 `watch.ignored` 설정에 `data/`, `server/`, `tests/` 디렉터리를 등록하여 파일 I/O로 인한 브라우저 자동 새로고침 방지.
2. **REST API 세션 동기화**:
   - `GET /api/auth/me`에서 `Authorization: Bearer mock-jwt-token-{role}` 헤더 파싱을 지원하여 병렬 테스트 환경에서도 정확한 RBAC 역할 식별.
3. **견고한 셀렉터 체계**:
   - 특정 고정 텍스트 의존성을 탈피하고, 시맨틱 요소(헤딩, 폼 컨트롤, first/nth 로케이터)를 조합하여 데이터 변경 시에도 깨지지 않는 자가 치유형 테스트 구축.

---

## 4. 테스트 실행 방법

```bash
# 전체 E2E 통합 테스트 실행
npm run test:e2e

# 특정 테스트 스위트 개별 실행
npx playwright test tests/e2e/courses.spec.ts

# HTML 리포트 확인
npx playwright show-report --host 0.0.0.0 --port 9323
```
