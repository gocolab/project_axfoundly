# 01. 기술 스택 및 버전

> 문서 상태: ✅ 결정 완료
> 실제 프로젝트 코드베이스 기준 확정된 기술 스택 및 버전 명세.

## 1. 개발 환경

### 개발 OS / 환경
- 상태: ✅ 결정
- 선택지: Windows / WSL(Ubuntu) / macOS / Linux — 혼용 시 각각 기재
- 결정: Linux (Ubuntu x86_64 Container 환경)
- 이유: 일관된 Docker/CI/CD 및 에이전트 실행 환경 제공
- 결정일: 2026-08-20

## 2. 백엔드

### 언어 및 버전
- 상태: ✅ 결정
- 선택지 예: Node.js 22 LTS / Node.js 20 LTS / Python 3.12 / Java 21
- 결정: Node.js 22.x LTS (ES2022 / ES Modules)
- 이유: 최신 ECMAScript 표준 및 비동기 처리 성능 최적화
- 결정일: 2026-08-20

### 프레임워크 및 버전
- 상태: ✅ 결정
- 선택지 예: Express 5.x / NestJS 11.x / Fastify / Hono
- 결정: Express 4.21.x
- 이유: 직관적인 REST API 라우팅과 Vite 개발 서버 미들웨어 연동 용이성
- 결정일: 2026-08-20

### 빌드 도구 / 패키지 매니저
- 상태: ✅ 결정
- 선택지 예: npm / pnpm / yarn
- 결정: npm + tsx (개발 핫리로드) + esbuild (프로덕션 서버 번들링)
- 결정일: 2026-08-20

## 3. 프론트엔드

### 언어 및 버전
- 상태: ✅ 결정
- 선택지 예: TypeScript 5.x / JavaScript(ES2022+)
- 결정: TypeScript 5.8.x
- 이유: 도메인 모델(types.ts) 타입 안전성 및 컴파일 시점 오류 검증
- 결정일: 2026-08-20

### 프레임워크 및 버전
- 상태: ✅ 결정
- 선택지 예: React 19 + Vite / Next.js 15 (Export) / Vue 3
- 결정: React 19.0.x + Vite 6.2.x
- 이유: 모던 React 19 렌더링 성능 및 초고속 Vite HMR 개발 생산성
- 결정일: 2026-08-20

### CSS 프레임워크
- 상태: ✅ 결정
- 선택지 예: Tailwind CSS 4.x / CSS Modules / styled-components
- 결정: Tailwind CSS 4.1.x (@tailwindcss/vite) + motion 12.x
- 이유: CSS-first 설정 방식, 초경량 엔진, 부드러운 모달/인터랙션 애니메이션
- 결정일: 2026-08-20

### Node.js 버전 / 패키지 매니저
- 상태: ✅ 결정
- 선택지 예: Node 22 LTS + npm / pnpm / yarn
- 결정: Node.js 22 LTS + npm (package-lock.json 고정)
- 결정일: 2026-08-20

## 4. 데이터베이스 (상세 규칙은 04_DATABASE.md)

### DBMS 및 버전
- 상태: ✅ 결정
- 선택지 예: PostgreSQL 17 / PostgreSQL 16 / MySQL 8.4 / MongoDB 8
- 결정: MongoDB 7.5.x (공식 네이티브 드라이버 `mongodb: ^7.5.0`)
- 이유: 유연한 JSON 도메인 객체(멀티 게시판, 다양한 커리큘럼/팀빌딩/아이디어 구조) 저장 및 동적 스키마 진화에 최적화
- 결정일: 2026-08-24

## 5. 필수 도구 버전 요약표

| 구분 | 도구 | 버전 | 확인 명령어 |
|---|---|---|---|
| 개발 환경 | Linux (Ubuntu) | x86_64 | `uname -a` |
| 백엔드 언어 | Node.js | v22.x LTS | `node --version` |
| 백엔드 프레임워크 | Express | ^4.21.2 | `npm list express` |
| 백엔드 런타임/빌드 | tsx / esbuild | ^4.21.0 / ^0.25.0 | `npx tsx --version` |
| 프론트 언어 | TypeScript | ~5.8.2 | `npx tsc --version` |
| 프론트 프레임워크 | React | ^19.0.1 | `npm list react` |
| 번들러 | Vite | ^6.2.3 | `npx vite --version` |
| CSS | Tailwind CSS | ^4.1.14 | `npm list tailwindcss` |
| DBMS | MongoDB | ^7.5.0 | `mongod --version` |
| AI API SDK | @google/genai | ^2.4.0 | `npm list @google/genai` |
| E2E 테스트 | Playwright | ^1.62.1 | `npx playwright --version` |

## 6. 버전 정책

### 버전 고정 방식
- 상태: ✅ 결정
- 선택지: lockfile 커밋 필수 / 마이너 버전까지 고정 / LTS만 사용
- 결정: `package-lock.json` 커밋 필수 및 Node.js LTS 기반 일관 유지
- 결정일: 2026-08-20
