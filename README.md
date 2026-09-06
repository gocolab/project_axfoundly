# AX Foundly (AX로 창업하라)

> **아이디어부터 투자까지, AI로 빠르게 창업하라**  
> 실시간 징검다리 교육, 자동 팀 매칭, 투자 유치 연계까지 지원하는 원스톱 창업 플랫폼

---

## 🛠️ 주요 실행 명령어 (Commands)

### 1. 데이터베이스 초기화 및 시딩 (DB Setup & Seed)

> ⚠️ **중요 (개발/운영 동일 원칙)**  
> 서버 실행(`npm run dev`, `npm run start`) 시에는 **자동 초기화/시딩이 절대 발생하지 않으며**, 오직 MongoDB에 저장된 실제 데이터를 순수 조회(Read-only)하여 서비스합니다.  
> 데이터베이스 초기화 및 현실성 시드 데이터 주입은 **오직 아래의 CLI 명령어를 직접 실행했을 때만 동작**합니다.

```bash
# [기본] .env의 MONGODB_DBNAME 기준으로 초기화 및 시딩
npm run db:reset

# [개발 환경 명시] 개발 DB (ax_foundly_dev) 초기화 및 시딩
npm run db:reset:dev

# [운영 환경 명시] 운영 DB (ax_foundly_pro) 초기화 및 시딩
npm run db:reset:prod
```

#### 직접 스크립트 실행 (Direct Script Execution)
```bash
# 개발 데이터베이스 지정 실행
MONGODB_DBNAME=ax_foundly_dev npx tsx scripts/reset-and-seed-db.ts

# 운영 데이터베이스 지정 실행
MONGODB_DBNAME=ax_foundly_pro npx tsx scripts/reset-and-seed-db.ts
```

#### 초기화 시 처리 내용:
1. **공통 코드 보존**: `codeGroups`, `commonCodes` 컬렉션 데이터 완벽 보존
2. **필수 회원 보존**: `otter.oh@gmail.com` (오승환), `mahau.master@gmail.com` (마하우) 계정 상태 유지
3. **가상 회원 30인 생성**: `status: "가상활성"` (`USER_STATUS` / `VIRTUAL_ACTIVE`), 2026년 1월~7월 가입일 및 한국 스타트업 직군 페르소나 배정
4. **교육/강의 실데이터 주입**: Lectomate 실데이터 기반 6개 강좌, 수강생 90명 및 결제 내역 90건 1:1 완벽 매칭
5. **스타트업 IR 프로젝트 연동**: CodeInDocker, 점•선•면 연구소, Lectomate, AX로 창업하라 (Pre-Seed 단계, 선발팀 뱃지, 구인 공고 활성화)
6. **커뮤니티 및 알림 로그 동기화**: 공지사항, 팀빌딩 모집글, Q&A, 수강/역제안/결제 알림 및 대시보드 통계 갱신

---

### 2. 로컬 개발 서버 실행 (Development)

```bash
# 의존성 패키지 설치
npm install

# 개발 서버 시작 (Express 백엔드 + Vite 프론트엔드 HMR)
npm run dev
```

- **로컬 웹 접속 주소**: [http://localhost:3010](http://localhost:3010)

---

### 3. 프로덕션 빌드 및 실행 (Production)

```bash
# 클라이언트(Vite) 및 백엔드(esbuild) 번들 빌드
npm run build

# 빌드된 서버 구동
npm run start
```

---

### 4. 코드 품질 및 테스트 (Lint & Test)

```bash
# TypeScript 컴파일 및 타입 검사
npm run lint

# E2E 테스트 실행 (Playwright)
npm run test:e2e

# E2E 테스트 보고서 확인
npm run report
```

---

## ⚙️ 환경 변수 설정 (`.env`)

프로젝트 루트의 `.env` 파일에 아래 설정을 확인/구성합니다:

```env
PORT=3010
MONGODB_URI=mongodb://host.docker.internal:27017
MONGODB_DBNAME=ax_foundly_dev
ALLOWED_ORIGINS=*

# JWT 설정
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=12360

# Google OAuth (선택)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3010/api/auth/google/callback

# Gemini API (AI 분류 및 추천)
GEMINI_API_KEY=your-gemini-api-key
```

---

## 👥 기본 계정 정보

- **관리자 / 메인 빌더**: `otter.oh@gmail.com` (오승환)
- **관리자 / 교육 운영**: `mahau.master@gmail.com` (마하우)
- **가상 회원**: `sj.kim@novatech.io` 등 총 30명 (`status: "가상활성"`)
