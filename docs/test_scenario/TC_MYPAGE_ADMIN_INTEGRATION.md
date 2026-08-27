# 📊 통합 마이페이지 & 최고 관리자(Admin) 통합 테스트 시나리오 및 결과

> **문서 버전:** v1.0  
> **작성일:** 2026-08-27  
> **대상 메뉴:** 마이 홈(`Overview`), 내 강의실, 내 스타트업, 관심 스타트업, 계정 설정, 최고 관리자 대시보드(`SCR-011`)  
> **대상 API:** `GET /api/admin/stats`, `GET /api/admin/members`, `PATCH /api/admin/members/:id/roles`, `PATCH /api/admin/members/:id/status`, `GET /api/admin/category-insights`, `GET /api/notifications`  
> **대상 UI:** `/mypage`, `/admin`, `/admin?tab=stats`, `/admin?tab=members`, `/admin?tab=courses`, `/admin?tab=categories`  
> **입력값 규칙:** 모든 테스트 입력값에 `임시_` prefix 사용  

---

## 0. 테스트 환경 및 사전 조건

### 0.1. 테스트 계정
- **T1:** `김수강생` (student@mail.com / `member`) — 마이페이지 올인원 대시보드(진도율, IR, 북마크) 열람
- **T2:** `김소현` (sohyun.kim@mail.com / `manager`) — 강사/빌더 마이페이지 대시보드 열람
- **T3:** `최관리` (admin@platform.com / `admin`) — 최고 관리자 전사 KPI, 회원 권한/상태 제어, 자연어 분야 인사이트

---

## 1. 테스트 결과 기록 시트

| Phase | 테스트 ID | TC명 | 예상 결과 | 실제 결과 | 상태 | 비고 |
|---|---|---|---|---|---|---|
| 1 | TC-MY-ADM-001 | 마이페이지 올인원 Overview 지표 브리핑 | 수강 진도율, IR 프로젝트, 북마크 수 반환 | 마이 홈 종합 지표 정상 로드 | ✅ 통과 | 멀티 롤 통합 뷰 |
| 1 | TC-MY-ADM-002 | 알림 센터 통합 피드백 | 강사 메시지, 팀빌딩, 투자 알림 수신 | 인앱 알림 목록 5건 이상 정상 집계 | ✅ 통과 | GNB 알림 센터 |
| 2 | TC-MY-ADM-003 | 최고 관리자 전사 KPI 통계 지표 | 가입자, 결제액, 매칭률, AI 자동채우기 수치 | stats 종합 지표 정상 반환 | ✅ 통과 | AdminDashboard |
| 2 | TC-MY-ADM-004 | 전체 회원 목록 및 권한/상태 제어 | 회원 상태(활성/정지) 및 권한 다중 배정 | 상태 '활성'/'정지' 및 role 변경 확인 | ✅ 통과 | 회원 관리 2단 스플릿 뷰 |
| 2 | TC-MY-ADM-005 | 자연어 분야 및 추천 칩 인사이트 | 등록된 데이터 기반 분야별 랭킹 산출 | 9개 이상 카테고리 랭킹 산출 | ✅ 통과 | AI 분류 자동 연동 |
| 3 | TC-MY-ADM-006 | 관리자-사용자 간 권한 격리 보안 검증 | 비인가 사용자의 관리자 API 접근 제어 | 권한 경계 및 데이터 격리 확인 | ✅ 통과 | 보안 품질 게이트 |
| 3 | TC-MY-ADM-007 | 관리자 스플릿 뷰 및 반응형 UX | 2단 스플릿 뷰 슬라이드 인 & ESC 단축키 | 트랜지션 애니메이션 & 단축키 동작 | ✅ 통과 | 프론트엔드 UX |

> **상태 범례:** 🔲 미실행 | ✅ 통과 | ❌ 실패 | ⚠️ 부분 통과 | 🔄 재실행 필요
