# 06. 배포 / 인프라

> 문서 상태: ❓ 인터뷰 진행 중
> biz_flows.md 제안: Docker & Docker Compose (인프라 종속성 탈피), 클라우드 독립 구조

## 1. 배포 대상

### 실행 환경
- 상태: ❓ 미결정
- 선택지: 로컬 실행만 / 클라우드 PaaS / 클라우드 IaaS / 자체 서버 / Docker Compose
- 결정: (biz_flows.md 제안: Docker 컨테이너화 → AWS EC2, GCP, 자체 서버 등 어디서든 배포)
- 이유:
- 결정일:

### 컨테이너화 여부
- 상태: ❓ 미결정 (biz_flows.md 제안: Docker & Docker Compose)
- 선택지: 사용 안 함 / Docker / Docker Compose(멀티 서비스)
- 결정:
- 이유:
- 결정일:

#### 예상 Compose 구성

| 서비스 | 기반 | 포트 | 역할 |
|---|---|---|---|
| `frontend` | Nginx (React 빌드 산출물) | 80 | SPA 서빙 + API 리버스 프록시 |
| `backend` | Node.js | 3000 (내부) | REST API 서버 |
| `postgres` | PostgreSQL + pgvector | 5432 (내부) | 관계형 DB + 벡터 검색 |

## 2. 환경 분리

### 환경 구성
- 상태: ❓ 미결정
- 선택지: local만 / local + prod / local + dev + staging + prod
- 결정:
- 결정일:

### 환경별 설정 관리
- 상태: ❓ 미결정
- 결정:
- 결정일:

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
