# 02. 백엔드 설계 규칙

> 문서 상태: ✅ 결정 완료
> Node.js 22 LTS + Express 4.21 기반 RESTful API 서버 아키텍처 규칙

## 1. 아키텍처

### 아키텍처 스타일
- 상태: ✅ 결정
- 선택지: 레이어드 / 모듈러 모놀리스 / 멀티모듈
- 결정: **모듈러 모놀리스 (Express Route Modules)**
- 이유: 도메인별(인증, 강의, IR, 커뮤니티, 알림, 관리자, AI) 라우터를 독립 파일로 격리하여 코드 충돌 방지 및 확장성 확보
- 결정일: 2026-08-20

### 패키지 / 모듈 구조
- 상태: ✅ 결정
- 결정:
```
server/
├── db.ts                  # MongoDB 연결, 인메모리 캐시 및 sync 관리 (289줄)
├── seeds/
│   └── seedData.ts        # 도메인별 초기 시드 데이터 모듈
├── routes/                # 도메인별 REST API 엔드포인트
│   ├── auth.ts            # 로그인, 회원가입, Google OAuth, 세션 (/api/auth)
│   ├── courses.ts         # 강의 목록·상세·수강·복제·역제안 (/api/courses)
│   ├── ir.ts              # 스타트업 IR, 아이디어 제작 의뢰 (/api/ir)
│   ├── community.ts       # 멀티 게시판, 댓글 (/api/community)
│   ├── notifications.ts   # 알림 센터, 환경설정 (/api/notifications)
│   ├── payments.ts        # 카카오페이 결제 승인·취소 (/api/payments)
│   ├── instructor.ts      # 강사 CRM, 정산 및 출금 (/api/instructor)
│   ├── admin.ts           # 회원관리, 통계, 게시판설정 (/api/admin)
│   ├── ai.ts              # Gemini AI 인터뷰·초벌·분류 (/api/ai)
│   └── common.ts          # 공통 코드 시스템 (/api/common)
├── services/              # 비즈니스 서비스
│   ├── aiClassifier.ts    # AI 태그/요약 자동 인리치먼트
│   └── notificationService.ts # 도메인 알림 발송 엔진
├── middlewares/           # 미들웨어 (ogCrawler 등)
└── utils/                 # 백엔드 유틸리티 (idGenerator 등)
```
- 결정일: 2026-08-20

### 서버 간 통신
- 상태: ➖ 해당 없음 (단일 백엔드 서버 구조)
- 결정일: 2026-08-20

## 2. API 설계 규칙

### API 스타일
- 상태: ✅ 결정
- 선택지: REST / GraphQL / gRPC / 혼합
- 결정: RESTful JSON API
- 결정일: 2026-08-20

### URL / 네이밍 규칙
- 상태: ✅ 결정
- 결정: 복수형 명사 + HTTP 메서드 표준 매핑 (`GET /api/courses`, `POST /api/courses/:id/duplicate`, `DELETE /api/community/posts/:id`)
- 결정일: 2026-08-20

### 공통 응답 포맷
- 상태: ✅ 결정
- 결정: 성공 시 JSON 데이터 객체 직접 반환, 오류 시 `{ error: string, code?: string }` 형식
- 결정일: 2026-08-20

### 에러 응답 규약
- 상태: ❓ 미결정
- 결정:
- 결정일:

## 3. 인증 / 인가

### 인증 방식
- 상태: ❓ 미결정
- 선택지: 없음 / 세션 / JWT / OAuth2 소셜 로그인 / API Key / 혼합
- 결정:
- 이유:
- 결정일:

### 인가(권한) 모델
- 상태: ❓ 미결정
- 선택지: RBAC / ABAC / 없음
- 결정: (biz_flows.md 기반 예상 역할: 수강생, 강사, 투자자, 관리자)
- 결정일:

## 4. 공통 처리 규칙

### 예외 처리 전략
- 상태: ❓ 미결정
- 결정:
- 결정일:

### 로깅 규칙
- 상태: ❓ 미결정
- 결정:
- 결정일:

### 환경설정 / 시크릿 관리
- 상태: ❓ 미결정
- 선택지: .env + gitignore / 프로파일 분리 / 환경변수
- 결정:
- 결정일:

### 유효성 검증 위치
- 상태: ❓ 미결정
- 선택지: 컨트롤러(DTO) / 도메인 / 양쪽
- 결정:
- 결정일:

## 5. 결제/정산 연동 (biz_flows.md 추가 요건)

### PG사 선택
- 상태: ❓ 미결정
- 선택지: 토스페이먼츠 / 아임포트(포트원) / KG이니시스 / NHN KCP
- 결정:
- 이유:
- 결정일:

### 정산 규칙
- 상태: ❓ 미결정
- 결정: (강사 수익 정산 방식 — 수수료율·정산 주기 등)
- 결정일:
