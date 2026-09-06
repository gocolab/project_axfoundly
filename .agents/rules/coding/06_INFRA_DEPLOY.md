# 06. 배포 / 인프라

> 문서 상태: ✅ 결정 완료
> Docker & Docker Compose 기반 컨테이너화 및 배포 명세

## 1. 배포 대상

### 실행 환경
- 상태: ✅ 결정
- 선택지: 로컬 실행만 / 클라우드 PaaS / 클라우드 IaaS / 자체 서버 / Docker Compose
- 결정: **Docker & Docker Compose (자체 서버 / 클라우드 VM 어디서든 독립 배포)**
- 이유: 특정 클라우드 종속성 없이 표준 컨테이너 환경으로 이식 가능
- 결정일: 2026-08-20

### 컨테이너화 여부
- 상태: ✅ 결정
- 선택지: 사용 안 함 / Docker / Docker Compose(멀티 서비스)
- 결정: Docker & Docker Compose
- 결정일: 2026-08-20

#### 서비스 구성

| 서비스 | 기반 | 포트 | 역할 |
|---|---|---|---|
| `web` (server.ts) | Node.js 22 | 3010 | Express API 서버 + SPA 프로덕션 정적 자산 서빙 |
| `mongodb` | MongoDB 7.x | 27017 | BSON 도큐먼트 데이터베이스 |

## 2. 환경 분리

### 환경 구성
- 상태: ✅ 결정
- 선택지: local만 / local + prod / local + dev + staging + prod
- 결정: **Local / Development (`ax_foundly_dev`) / Production (`ax_foundly_pro`)**
- 결정일: 2026-08-20

### 환경별 설정 관리
- 상태: ✅ 결정
- 결정: `.env` 파일 기반 환경변수 주입 (포트 3010, MONGODB_URI, MONGODB_DBNAME, GEMINI_API_KEY, KAKAO_PAY_*, GOOGLE_CLIENT_*)
- 결정일: 2026-08-20

## 3. CI/CD

### CI (빌드/테스트 자동화)
- 상태: ❓ 미결정
- 선택지: 없음(수동) / GitHub Actions / GitLab CI
- 결정:
- 결정일:

### CD (배포 자동화)
- 상태: ❓ 미결정
- 선택지: 수동 배포 / push 시 자동 배포 / 태그 기반 배포
- 결정:
- 결정일:

## 4. 도메인 / 네트워크

### 도메인 및 HTTPS
- 상태: ❓ 미결정
- 결정:
- 결정일:

## 5. 운영

### 모니터링 / 로그 수집
- 상태: ❓ 미결정
- 선택지: 없음 / 플랫폼 기본 로그 / Sentry(에러 추적) / 자체 구축
- 결정:
- 결정일:

### 백업 정책
- 상태: ❓ 미결정
- 결정:
- 결정일:
