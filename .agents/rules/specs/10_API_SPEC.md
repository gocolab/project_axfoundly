# 10. API 명세서

> 문서 상태: 산출물 문서 (구현 완료 및 동기화)
> 공통 응답 포맷 및 규약은 `rules/coding/02_BACKEND.md`를 따른다.

## 1. API 목록 요약

| ID | 메서드 | URL | 이름 | 모듈 | 인증 | 상태 |
|---|---|---|---|---|---|---|
| API-AUTH-01 | POST | `/api/auth/login` | 역할 기반 데모 로그인 | Auth | 불필요 | ✅ 완료 |
| API-CRS-01 | GET | `/api/courses` | 강의 목록 조회 (필터/페이징) | Courses | 불필요 | ✅ 완료 |
| API-CRS-02 | GET | `/api/courses/:id` | 강의 상세 조회 | Courses | 불필요 | ✅ 완료 |
| API-CRS-03 | POST | `/api/courses` | 신규 강의 개설 및 등록 | Courses | 강사/관리자 | ✅ 완료 |
| API-CRS-04 | POST | `/api/courses/:id/enroll` | 수강 신청 및 결제 | Courses | 수강생 | ✅ 완료 |
| API-CRS-05 | PATCH | `/api/courses/:id/approve` | 강의 승인 | Courses | 관리자 | ✅ 완료 |
| API-CRS-06 | PATCH | `/api/courses/:id/reject` | 강의 반려 | Courses | 관리자 | ✅ 완료 |
| API-REV-CRS-01 | GET | `/api/courses/requests` | 수강생 개강 요청 목록 조회 | Courses | 불필요 | ✅ 완료 |
| API-REV-CRS-02 | POST | `/api/courses/requests` | 신규 개강 요청 등록 (AI 분류) | Courses | 수강생 | ✅ 완료 |
| API-REV-CRS-03 | POST | `/api/courses/requests/:id/upvote` | 개강 요청 공감 투표 토글 | Courses | 수강생 | ✅ 완료 |
| API-REV-CRS-04 | POST | `/api/courses/requests/:id/proposals` | 강사 개강 제안서 제출 | Courses | 강사 | ✅ 완료 |
| API-REV-CRS-05 | POST | `/api/courses/requests/:id/accept-proposal` | 강사 제안 채택 및 정식 강의 승격 | Courses | 수강생 | ✅ 완료 |
| API-IR-01 | GET | `/api/ir/projects` | 스타트업 IR 목록 조회 | IR | 불필요 | ✅ 완료 |
| API-IR-02 | GET | `/api/ir/projects/:id` | 스타트업 IR 상세 조회 | IR | 불필요 | ✅ 완료 |
| API-IR-03 | POST | `/api/ir/projects` | 프로젝트 등록/수정 | IR | 회원 | ✅ 완료 |
| API-IR-04 | POST | `/api/ir/projects/:id/bookmark` | 관심 스타트업 북마크 토글 | IR | 투자자 | ✅ 완료 |
| API-IR-05 | POST | `/api/ir/projects/:id/apply` | 구인 공고 원클릭 자체 지원 | IR | 수강생 | ✅ 완료 |
| API-REV-IR-01 | GET | `/api/ir/idea-requests` | 아이디어 제작 의뢰 목록 조회 | IR | 불필요 | ✅ 완료 |
| API-REV-IR-02 | POST | `/api/ir/idea-requests` | 신규 아이디어 제작 의뢰 등록 | IR | 회원 | ✅ 완료 |
| API-REV-IR-03 | POST | `/api/ir/idea-requests/:id/upvote` | 잠재 고객 공감 투표 토글 | IR | 회원 | ✅ 완료 |
| API-REV-IR-04 | POST | `/api/ir/idea-requests/:id/proposals` | 빌더 팀 MVP 제작 제안서 제출 (산출물 링크/공개범위 포함, IR 자동 연동) | IR | 빌더/개발자 | ✅ 완료 |
| API-REV-IR-05 | POST | `/api/ir/idea-requests/:id/accept-proposal` | 빌더 제안 최종 채택 및 정식 IR 프로젝트 승격 | IR | 회원 | ✅ 완료 |
| API-REV-IR-06 | POST | `/api/ir/idea-requests/:id/select-proposals` | 아이디어 제안서 복수 선발 및 협의 대상 지정 | IR | 회원 | ✅ 완료 |
| API-AI-01 | POST | `/api/ai/course-draft` | AI 강의 초벌 커리큘럼 생성 | AI | 강사 | ✅ 완료 |
| API-AI-02 | POST | `/api/ai/diagnosis` | 빌더 AI 아키텍트 페르소나 진단 | AI | 전체 | ✅ 완료 |
| API-AI-03 | POST | `/api/ai/innovation-chat` | B2B 인큐베이터 멘토 챗 | AI | 전체 | ✅ 완료 |
| API-AI-04 | POST | `/api/ai/tutor` | 실시간 AI 창업 튜터 Q&A | AI | 전체 | ✅ 완료 |
| API-COM-01 | GET | `/api/community/posts` | 멀티 게시판 글 목록 | Community | 불필요 | ✅ 완료 |
| API-COM-02 | POST | `/api/community/posts` | 게시글 작성 | Community | 회원 | ✅ 완료 |
| API-COM-03 | GET | `/api/community/posts/:id` | 게시글 상세 및 댓글 조회 | Community | 불필요 | ✅ 완료 |
| API-COM-04 | POST | `/api/community/posts/:id/comments` | 댓글 등록 | Community | 회원 | ✅ 완료 |
| API-ADM-01 | GET | `/api/admin/stats` | 대시보드 KPI 통계 조회 | Admin | 관리자 | ✅ 완료 |
| API-ADM-02 | GET | `/api/admin/members` | 회원 목록 및 상태 조회 | Admin | 관리자 | ✅ 완료 |
| API-ADM-03 | PATCH | `/api/admin/members/:id/role` | 회원 권한 변경 | Admin | 관리자 | ✅ 완료 |
| API-ADM-04 | POST | `/api/admin/boards` | 신규 멀티 게시판 생성 | Admin | 관리자 | ✅ 완료 |
| API-CRM-01 | POST | `/api/instructor/crm/send` | 강사 수강생 타깃 CRM 발송 | Instructor | 강사 | ✅ 완료 |
| API-CODE-01 | GET | `/api/common/codes` | 공통 코드 목록 조회 (그룹 필터링) | Common | 불필요 | ✅ 완료 |
| API-CODE-02 | GET | `/api/common/groups` | 공통 코드 그룹 목록 조회 | Common | 불필요 | ✅ 완료 |
| API-CODE-03 | POST | `/api/common/codes` | 신규 공통 코드 등록 | Common | 관리자 | ✅ 완료 |
| API-CODE-04 | PUT | `/api/common/codes/:id` | 공통 코드 수정 | Common | 관리자 | ✅ 완료 |

## 2. 주요 신규 고도화 API 상세

### API-CODE-01. 공통 코드 목록 조회 (`GET /api/common/codes`)
- **설명**: 프론트엔드 드롭다운/필터/뱃지 렌더링에 필요한 공통 코드 목록을 그룹별로 조회합니다.
- **Query Params**: `?groups=INVESTMENT_STAGE,EMPLOYMENT_TYPE&all=false`
- **응답 (200)**:
  ```json
  {
    "codes": [
      {
        "id": "cc-inv-1",
        "groupCode": "INVESTMENT_STAGE",
        "code": "PRE_SEED",
        "codeName": "Pre-Seed",
        "displayName": "Pre-Seed",
        "sortOrder": 1,
        "extraValue": { "badgeColor": "amber" },
        "isActive": true,
        "isSystem": true
      }
    ]
  }
  ```

### API-AI-04. 실시간 AI 창업 튜터 Q&A (`POST /api/ai/tutor`)
- **설명**: 사용자의 창업/강의/IR 질의에 대해 Gemini 2.5 Flash 기반으로 실시간 액션 아이템 및 맞춤 제안 키워드를 반환합니다.
- **요청 Body**: `{ "question": "...", "context": "현재 페이지" }`
- **응답 (200)**: `{ "answer": "...", "suggestions": ["..."] }`

