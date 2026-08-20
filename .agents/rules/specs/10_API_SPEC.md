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
| API-IR-01 | GET | `/api/ir/projects` | 스타트업 IR 목록 조회 | IR | 불필요 | ✅ 완료 |
| API-IR-02 | GET | `/api/ir/projects/:id` | 스타트업 IR 상세 조회 | IR | 불필요 | ✅ 완료 |
| API-IR-03 | POST | `/api/ir/projects` | 프로젝트 등록/수정 | IR | 회원 | ✅ 완료 |
| API-IR-04 | POST | `/api/ir/projects/:id/bookmark` | 관심 스타트업 북마크 토글 | IR | 투자자 | ✅ 완료 |
| API-IR-05 | POST | `/api/ir/projects/:id/apply` | 구인 공고 원클릭 자체 지원 | IR | 수강생 | ✅ 완료 |
| API-IR-06 | POST | `/api/ir/projects/:id/virtual-ir` | 가상 IR 화상 피칭룸 예약 | IR | 투자자 | ✅ 완료 |
| API-IR-07 | POST | `/api/ir/projects/:id/nda` | 간편 전자 계약 (NDA 체결) | IR | 투자자 | ✅ 완료 |
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

## 2. 주요 신규 고도화 API 상세

### API-AI-04. 실시간 AI 창업 튜터 Q&A (`POST /api/ai/tutor`)
- **설명**: 사용자의 창업/강의/IR 질의에 대해 Gemini 2.5 Flash 기반으로 실시간 액션 아이템 및 맞춤 제안 키워드를 반환합니다.
- **요청 Body**: `{ "question": "...", "context": "현재 페이지" }`
- **응답 (200)**: `{ "answer": "...", "suggestions": ["..."] }`

### API-IR-06. 가상 IR 화상 피칭룸 예약 (`POST /api/ir/projects/:id/virtual-ir`)
- **설명**: 투자자와 창업팀 간의 실시간 화상 미팅 링크(`Jitsi`) 생성 및 아젠다를 등록합니다.
- **요청 Body**: `{ "investorName": "...", "scheduledAt": "2025-09-15 14:00", "feedbackNotes": "..." }`
- **응답 (201)**: `{ "success": true, "meeting": { "id": "vir-...", "meetingLink": "..." } }`

### API-IR-07. 간편 전자 계약 NDA 체결 (`POST /api/ir/projects/:id/nda`)
- **설명**: 2년 기밀유지 및 지식재산권 보호 표준 NDA 전자 서명을 체결합니다.
- **요청 Body**: `{ "investorName": "...", "termsSummary": "..." }`
- **응답 (201)**: `{ "success": true, "nda": { "id": "nda-...", "agreedAt": "2025-08-20" } }`
