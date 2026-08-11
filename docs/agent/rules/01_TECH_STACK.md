# 01. 기술 스택 및 버전

> 문서 상태: ❓ 인터뷰 진행 중
> 버전을 명시하지 않으면 AI마다 다른 버전을 가정해 코드가 꼬인다. 반드시 구체적인 버전까지 결정한다.
> biz_flows.md 기술 스택 제안을 기반으로 초안 작성.

## 1. 개발 환경

### 개발 OS / 환경
- 상태: ❓ 미결정
- 선택지: Windows / WSL(Ubuntu) / macOS / Linux — 혼용 시 각각 기재
- 결정:
- 이유:
- 결정일:

## 2. 백엔드

### 언어 및 버전
- 상태: ❓ 미결정 (biz_flows.md 제안: Node.js)
- 선택지 예: Node.js 22 LTS / Node.js 20 LTS / Python 3.12 / Java 21
- 결정:
- 이유:
- 결정일:

### 프레임워크 및 버전
- 상태: ❓ 미결정 (biz_flows.md 제안: Express 또는 NestJS)
- 선택지 예: Express 5.x / NestJS 11.x / Fastify / Hono
- 결정:
- 이유:
- 결정일:

### 빌드 도구 / 패키지 매니저
- 상태: ❓ 미결정
- 선택지 예: npm / pnpm / yarn
- 결정:
- 결정일:

## 3. 프론트엔드

### 언어 및 버전
- 상태: ❓ 미결정
- 선택지 예: TypeScript 5.x / JavaScript(ES2022+)
- 결정:
- 이유:
- 결정일:

### 프레임워크 및 버전
- 상태: ❓ 미결정 (biz_flows.md 제안: React 또는 Next.js Export 모드)
- 선택지 예: React 19 + Vite / Next.js 15 (Export) / Vue 3
- 결정:
- 이유:
- 결정일:

### CSS 프레임워크
- 상태: ❓ 미결정 (biz_flows.md 제안: Tailwind CSS)
- 선택지 예: Tailwind CSS 4.x / CSS Modules / styled-components
- 결정:
- 이유:
- 결정일:

### Node.js 버전 / 패키지 매니저
- 상태: ❓ 미결정
- 선택지 예: Node 22 LTS + npm / pnpm / yarn
- 결정:
- 결정일:

## 4. 데이터베이스 (버전만 — 상세 규칙은 04_DATABASE.md)

### DBMS 및 버전
- 상태: ❓ 미결정 (biz_flows.md 제안: PostgreSQL + pgvector)
- 선택지 예: PostgreSQL 17 / PostgreSQL 16 / MySQL 8.4 / MongoDB 8
- 결정:
- 이유:
- 결정일:

## 5. 필수 도구 버전 요약표

> 모든 결정이 끝나면 AI가 아래 표를 채운다. 개발 시작 시 AI는 이 표의 버전을 기준으로 코드를 작성한다.

| 구분 | 도구 | 버전 | 확인 명령어 |
|---|---|---|---|
| 개발 환경 | | | |
| 백엔드 언어 | Node.js | | `node --version` |
| 백엔드 프레임워크 | | | |
| 빌드 도구 | | | |
| 프론트 언어 | TypeScript | | `npx tsc --version` |
| 프론트 프레임워크 | React | | `npm list react` |
| CSS | Tailwind CSS | | `npm list tailwindcss` |
| DBMS | PostgreSQL + pgvector | | `psql --version` |
| 컨테이너 | Docker + Docker Compose | | `docker --version` |

## 6. 버전 정책

### 버전 고정 방식
- 상태: ❓ 미결정
- 선택지: lockfile 커밋 필수 / 마이너 버전까지 고정 / LTS만 사용
- 결정:
- 이유:
- 결정일:
