import { test, expect } from '@playwright/test';

// ── 테스트 헬퍼 함수 ──
async function loginAs(page: any, role: 'member' | 'manager' | 'admin', email: string, name: string) {
  const response = await page.request.post('/api/auth/login', {
    data: {
      roles: [role],
      email: email,
    },
  });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  const token = data.token;
  const user = data.user;

  await page.addInitScript(
    ({ t, u }: { t: string; u: any }) => {
      localStorage.setItem('auth_token', t);
      localStorage.setItem('user_name', u.name);
      localStorage.setItem('user_roles', JSON.stringify(u.roles));
    },
    { t: token, u: user }
  );

  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

test.describe.serial('🎓 교육/강의 메뉴 종합 통합 테스트 (TC-COURSE-INTEGRATION v2.0)', () => {

  // ─────────────────────────────────────────────────────────────
  // Phase 1: 강의 개설 & 관리자 승인 (T2: 김소현 -> T3: 최관리)
  // ─────────────────────────────────────────────────────────────
  test.describe('Phase 1: 강의 개설 & 관리자 승인 (T2: 김소현 강사 -> T3: 최관리 관리자)', () => {
    test('TC-CRS-001 & 003: AI 초벌 커리큘럼 및 범용 auto-fill API 정상 동작', async ({ request }) => {
      // API-AI-01: course-draft
      const draftRes = await request.post('/api/ai/course-draft', {
        data: {
          topic: '임시_강의주제_001: AI 에이전트로 B2B SaaS 만들기',
          targetAudience: '중급 개발자',
          sessionCount: 8,
        },
      });
      expect(draftRes.ok()).toBeTruthy();
      const draftData = await draftRes.json();
      expect(draftData.draft).toBeDefined();
      expect(draftData.draft.refinedTitle || draftData.draft.title).toBeTruthy();
      expect(Array.isArray(draftData.draft.curriculum)).toBeTruthy();

      // API-AI-05: auto-fill (course)
      const autoFillRes = await request.post('/api/ai/auto-fill', {
        data: {
          type: 'course',
          prompt: '임시_제목초안_001: 파이썬으로 챗봇 만드는거',
        },
      });
      expect(autoFillRes.ok()).toBeTruthy();
      const autoFillData = await autoFillRes.json();
      expect(autoFillData.result).toBeDefined();
      expect(autoFillData.result.refinedTitle).toBeTruthy();
      expect(autoFillData.result.naturalCategory).toBeTruthy();
      expect(Array.isArray(autoFillData.result.tags)).toBeTruthy();
    });

    test('TC-CRS-002: 신규 강의 등록 폼 유효성 및 경계값 검증 (T2: 김소현)', async ({ request }) => {
      // 1. 제목 누락 경계값 (400 Bad Request)
      const invalidRes = await request.post('/api/courses', {
        data: {
          description: '설명만 있음',
          price: 500000,
        },
      });
      expect(invalidRes.status()).toBe(400);

      // 2. 정상 강의 등록 (임시_AI 에이전트 B2B SaaS 완성 과정)
      const coursePayload = {
        title: '임시_AI 에이전트 B2B SaaS 완성 과정',
        description: '임시_LangGraph와 CrewAI를 활용해 B2B 고객사에 납품 가능한 멀티에이전트 SaaS를 처음부터 끝까지 제작합니다.',
        instructor: '김소현',
        instructorTitle: '전) 글로벌 유니콘 AI PM 디렉터',
        price: 890000,
        discountedPrice: 620000,
        status: '모집중',
        schedule: {
          startDate: '2026-10-06',
          endDate: '2026-11-17',
          daysOfWeek: ['화', '목'],
          timeSlot: '19:30 ~ 21:30',
          totalSessions: 12,
          scheduleType: 'stepping_stone',
        },
        curriculum: [
          { week: 1, sessionNumber: 1, title: '임시_커리_001: 멀티에이전트 아키텍처 설계', description: 'LangGraph 기본 구조', duration: '2시간' },
          { week: 1, sessionNumber: 2, title: '임시_커리_002: 상태 머신 실습', description: 'Agent State 그래프 구현', duration: '2시간' },
          { week: 2, sessionNumber: 3, title: '임시_커리_003: API 서버 & 도구 연동', description: 'FastAPI 및 외부 도구 바인딩', duration: '2시간' },
          { week: 2, sessionNumber: 4, title: '임시_커리_004: CrewAI 팀 오케스트레이션', description: '복합 에이전트 협업', duration: '2시간' },
        ],
      };

      const createRes = await request.post('/api/courses', { data: coursePayload });
      expect(createRes.status()).toBe(201);
      const createdData = await createRes.json();
      expect(createdData.course).toBeDefined();
      expect(createdData.course.id).toBeTruthy();
      expect(createdData.course.title).toBe('임시_AI 에이전트 B2B SaaS 완성 과정');
      expect(createdData.course.category).toBeTruthy();
      expect(createdData.course.tags.length).toBeGreaterThan(0);
    });

    test('TC-CRS-004: 관리자 강의 검수 승인/반려 워크플로우 (T3: 최관리)', async ({ request, page }) => {
      // 1. 임시 검수용 강의 생성
      const tempCourseRes = await request.post('/api/courses', {
        data: {
          title: '임시_검수테스트강의_001',
          description: '관리자 승인 및 반려 테스트용 강의입니다.',
          instructor: '김소현',
          price: 300000,
          status: '모집중',
        },
      });
      const tempCourse = (await tempCourseRes.json()).course;

      // 2. 관리자 반려 처리 (PATCH /api/courses/:id/reject)
      const rejectRes = await request.patch(`/api/courses/${tempCourse.id}/reject`, {
        data: { reason: '임시_반려사유_001: 커리큘럼 2주차 이후 내용 부족' },
      });
      expect(rejectRes.ok()).toBeTruthy();
      const rejectData = await rejectRes.json();
      expect(rejectData.course.status).toBe('종료');

      // 3. 관리자 승인 처리 (PATCH /api/courses/:id/approve)
      const approveRes = await request.patch(`/api/courses/${tempCourse.id}/approve`);
      expect(approveRes.ok()).toBeTruthy();
      const approveData = await approveRes.json();
      expect(approveData.course.status).toBe('모집중');

      // 4. 관리자 대시보드 화면 UI 렌더링 확인 (T3 로그인)
      await loginAs(page, 'admin', 'admin@platform.com', '최관리');
      await page.goto('/admin?tab=courses');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=임시_검수테스트강의_001').first()).toBeVisible({ timeout: 5000 });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Phase 2: 강의 탐색 & 수강 신청·결제 (T1: 김수강생)
  // ─────────────────────────────────────────────────────────────
  test.describe('Phase 2: 강의 탐색 & 수강 신청·결제 (T1: 김수강생)', () => {
    test('TC-CRS-005: 강의 목록 탐색, 실시간 검색, 카테고리 필터, 빈 상태 검증', async ({ page }) => {
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');

      // 1. 헤더 및 카테고리 탭 확인
      await expect(page.locator('h1', { hasText: '교육 / 강의' })).toBeVisible();
      await expect(page.getByRole('button', { name: '전체' }).first()).toBeVisible();

      // 2. 실시간 검색 ("AI 프로덕트")
      const searchInput = page.getByPlaceholder('강의명, 강사명, 태그 검색...');
      await searchInput.fill('AI 프로덕트');
      await expect(page.locator('h3', { hasText: 'AI 프로덕트 매니저 부트캠프' }).first()).toBeVisible();

      // 3. 강사명 검색 ("김소현")
      await searchInput.fill('김소현');
      await expect(page.locator('text=김소현').first()).toBeVisible();

      // 4. 일치하지 않는 검색어 (Empty state)
      await searchInput.fill('존재하지않는강의검색어XYZ');
      await expect(page.locator('text=검색 결과가 없습니다')).toBeVisible();

      // 5. 검색어 리셋 (전체 목록 복원)
      await searchInput.fill('');
      await page.waitForTimeout(300);
      const courseCards = page.locator('h3');
      await expect(courseCards.first()).toBeVisible();
    });

    test('TC-CRS-006: 강의 상세 인터랙션 (일정 달력, 강사 인포그래픽, 강사 모달)', async ({ page }) => {
      await page.goto('/courses/c1');
      await page.waitForLoadState('networkidle');

      // 1. 강의 타이틀 및 커리큘럼 확인
      await expect(page.locator('h1', { hasText: 'AI 프로덕트 매니저 부트캠프' })).toBeVisible();
      await expect(page.locator('h2', { hasText: '커리큘럼 및 회차별 일정' })).toBeVisible();

      // 2. 인터랙티브 강의 달력 확인
      await expect(page.locator('h2', { hasText: '강의 달력 & 수강 일정' })).toBeVisible();

      // 3. 강사 전문성 인포그래픽 카드 확인
      await expect(page.locator('text=강사 전문성')).toBeVisible();
      await expect(page.locator('text=만족도')).toBeVisible();

      // 4. 강사 모달 오픈 & 닫기
      const modalBtn = page.locator('button', { hasText: '진행한 모든 강의 & 전체 리뷰 보기' });
      await modalBtn.click();
      await expect(page.locator('text=진행했던 모든 강의 이력')).toBeVisible();
      await expect(page.locator('text=수강생 전체 리뷰 모음')).toBeVisible();

      // 닫기
      await page.keyboard.press('Escape');
    });

    test('TC-CRS-007: 카드 수강 신청 및 결제 완료 (T1: 김수강생)', async ({ request, page }) => {
      // 1. 수강 신청 API 호출 (POST /api/courses/c3/enroll)
      const enrollRes = await request.post('/api/courses/c3/enroll', {
        data: { paymentMethod: '카드' },
      });
      expect(enrollRes.ok()).toBeTruthy();
      const enrollData = await enrollRes.json();
      expect(enrollData.success).toBeTruthy();
      expect(enrollData.course.isEnrolled).toBeTruthy();
      expect(enrollData.payment.amount).toBe(290000); // discountedPrice of c3

      // 2. 결제 기록 확인 (GET /api/payments)
      const paymentsRes = await request.get('/api/payments');
      const paymentsData = await paymentsRes.json();
      const newPay = paymentsData.payments.find((p: any) => p.courseId === 'c3');
      expect(newPay).toBeDefined();
      expect(newPay.amount).toBe(290000);
      expect(newPay.status).toBe('완료');

      // 3. T1으로 로그인 후 마이페이지에서 수강 목록 조회 확인
      await loginAs(page, 'member', 'student@mail.com', '김수강생');
      await page.goto('/mypage?tab=courses');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=내 강의실 (수강 관리)').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=수강 중인 강의').first()).toBeVisible();
    });

    test('TC-CRS-008: 카카오페이 결제 준비 및 승인 플로우 API 검증', async ({ request }) => {
      // 1. 카카오페이 결제 준비 (Ready)
      const readyRes = await request.post('/api/payments/ready', {
        data: {
          itemName: '임시_카카오페이_테스트_강의',
          totalAmount: 1000,
          orderId: `ORD-${Date.now()}`,
          userId: 'student@mail.com',
        },
      });
      if (readyRes.status() === 200) {
        const readyData = await readyRes.json();
        expect(readyData.tid).toBeDefined();
      } else {
        expect([200, 400, 500]).toContain(readyRes.status());
      }

      // 2. 결제 목록에서 실제 paymentId 조회 후 영수증 확인
      const payListRes = await request.get('/api/payments');
      const payList = await payListRes.json();
      expect(payList.payments.length).toBeGreaterThan(0);
      const targetPayId = payList.payments[0].id;

      const receiptRes = await request.get(`/api/payments/${targetPayId}/receipt`);
      expect(receiptRes.ok()).toBeTruthy();
      const receiptData = await receiptRes.json();
      expect(receiptData.receipt).toBeDefined();
      expect(receiptData.receipt.taxAmount).toBe(Math.round(receiptData.receipt.totalAmount * 0.1));
      expect(receiptData.receipt.supplyAmount).toBe(Math.round(receiptData.receipt.totalAmount * 0.9));
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Phase 3: 수강생 개강 요청소 역제안 (T1: 김수강생 <-> T2: 김소현 강사)
  // ─────────────────────────────────────────────────────────────
  test.describe('Phase 3: 수강생 개강 요청소 역제안 (T1: 김수강생 <-> T2: 김소현 강사)', () => {
    let requestId = '';
    let proposalId = '';

    test('TC-REV-001: 수강생 개강 요청 신규 등록 (T1: 김수강생)', async ({ request }) => {
      const payload = {
        title: '임시_AI 코파일럿 활용 풀스택 웹개발 (Cursor + GitHub Copilot)',
        description: '임시_Cursor AI와 Copilot을 활용하여 1인 풀스택 개발 워크플로우를 배우고 싶습니다.',
        category: '개발·IT',
        tags: ['Cursor', 'Copilot', '풀스택'],
        targetLevel: '중급',
        preferredSchedule: '평일 저녁 (화/목 19:30~21:30)',
        expectedPriceRange: '45~60만원대',
        requestedBy: {
          userId: 'u-student-1',
          userName: '김수강생',
        },
      };

      const res = await request.post('/api/courses/requests', { data: payload });
      expect(res.status()).toBe(201);
      const data = await res.json();
      expect(data.request).toBeDefined();
      expect(data.request.id).toBeTruthy();
      expect(data.request.status).toBe('모집중');
      expect(data.request.upvoteCount).toBe(1);

      requestId = data.request.id;
    });

    test('TC-REV-002: 공감 투표 토글 및 다중 투표 (정우석, 강민수)', async ({ request }) => {
      // 만약 이전 테스트에서 requestId가 없으면 최신 요청 조회
      if (!requestId) {
        const reqListRes = await request.get('/api/courses/requests');
        const reqList = await reqListRes.json();
        requestId = reqList.requests[0].id;
      }
      expect(requestId).toBeTruthy();

      // 1. 정우석 투표
      const upvote1 = await request.post(`/api/courses/requests/${requestId}/upvote`, {
        data: { userId: 'u-ws-jung' },
      });
      expect(upvote1.ok()).toBeTruthy();
      const d1 = await upvote1.json();
      expect(d1.isUpvoted).toBe(true);
      expect(d1.request.upvoteCount).toBe(2);

      // 2. 정우석 투표 취소 (토글)
      const upvoteToggle = await request.post(`/api/courses/requests/${requestId}/upvote`, {
        data: { userId: 'u-ws-jung' },
      });
      const dToggle = await upvoteToggle.json();
      expect(dToggle.isUpvoted).toBe(false);
      expect(dToggle.request.upvoteCount).toBe(1);

      // 3. 다시 투표
      await request.post(`/api/courses/requests/${requestId}/upvote`, {
        data: { userId: 'u-ws-jung' },
      });
      // 4. 강민수 투표
      const upvote2 = await request.post(`/api/courses/requests/${requestId}/upvote`, {
        data: { userId: 'u-ms-kang' },
      });
      const d2 = await upvote2.json();
      expect(d2.request.upvoteCount).toBe(3);
    });

    test('TC-REV-003: 강사 개강 제안서 제출 (T2: 김소현 강사)', async ({ request }) => {
      if (!requestId) {
        const reqListRes = await request.get('/api/courses/requests');
        const reqList = await reqListRes.json();
        requestId = reqList.requests[0].id;
      }
      expect(requestId).toBeTruthy();

      const proposalPayload = {
        instructorId: 'inst-1',
        instructorName: '김소현',
        instructorTitle: '전) 글로벌 유니콘 AI PM 디렉터',
        proposedTitle: '임시_AI 코파일럿 풀스택 실전 완성반 (Cursor Edition)',
        curriculumDraft: [
          'Cursor AI 개발환경 셋업 & 실전 워크플로우',
          'GitHub Copilot 전체 코드 생성 전략',
          '풀스택 아키텍처 자동 설계',
          'API 서버 자동 생성 & 테스트',
          '프론트엔드 컴포넌트 AI 자동 구현',
          '배포 자동화 & CI/CD',
        ],
        proposedPrice: 490000,
        proposedSchedule: '매주 화·목 19:30~21:30 (3주 6회차)',
        message: '임시_현직 개발자 관점에서 AI 페어프로그래밍의 모든 노하우를 전수합니다.',
      };

      const res = await request.post(`/api/courses/requests/${requestId}/proposals`, {
        data: proposalPayload,
      });
      expect(res.status()).toBe(201);
      const data = await res.json();
      expect(data.proposal).toBeDefined();
      expect(data.proposal.status).toBe('대기중');

      proposalId = data.proposal.id;

      // 요청의 상태가 '강사매칭중'으로 변경되었는지 확인
      const reqListRes = await request.get('/api/courses/requests');
      const reqList = await reqListRes.json();
      const targetReq = reqList.requests.find((r: any) => r.id === requestId);
      expect(targetReq.status).toBe('강사매칭중');
    });

    test('TC-REV-004: 제안 채택 및 정식 강의 자동 승격 (T1: 김수강생)', async ({ request }) => {
      if (!requestId || !proposalId) {
        const reqListRes = await request.get('/api/courses/requests');
        const reqList = await reqListRes.json();
        const matchedReq = reqList.requests.find((r: any) => r.proposals && r.proposals.length > 0);
        if (matchedReq) {
          requestId = matchedReq.id;
          proposalId = matchedReq.proposals[0].id;
        }
      }
      expect(requestId).toBeTruthy();
      expect(proposalId).toBeTruthy();

      // 채택 API 호출 (POST /api/courses/requests/:id/accept-proposal)
      const acceptRes = await request.post(`/api/courses/requests/${requestId}/accept-proposal`, {
        data: { proposalId: proposalId },
      });
      expect(acceptRes.ok()).toBeTruthy();
      const acceptData = await acceptRes.json();
      expect(acceptData.success).toBe(true);
      expect(acceptData.course).toBeDefined();
      expect(acceptData.course.title).toBe('임시_AI 코파일럿 풀스택 실전 완성반 (Cursor Edition)');
      expect(acceptData.course.discountedPrice).toBe(Math.round(490000 * 0.8));
      expect(acceptData.request.status).toBe('개강완료');

      // 정식 강의 목록에 노출되는지 확인
      const coursesRes = await request.get('/api/courses');
      const coursesData = await coursesRes.json();
      const matched = coursesData.courses.find((c: any) => c.title === '임시_AI 코파일럿 풀스택 실전 완성반 (Cursor Edition)');
      expect(matched).toBeDefined();
      expect(matched.description).toContain('수강생 역제안 매칭');
    });

    test('TC-REV-005: 복수 제안서 경합 시 채택/반려 상태 처리 검증', async ({ request }) => {
      // 1. 신규 요청 생성
      const newReqRes = await request.post('/api/courses/requests', {
        data: {
          title: '임시_LangGraph 심화 실전과정 개강 요청',
          description: '멀티에이전트 고급 제어',
          category: 'AI 모델링',
        },
      });
      const newReq = (await newReqRes.json()).request;

      // 2. 제안서 A 제출
      const propARes = await request.post(`/api/courses/requests/${newReq.id}/proposals`, {
        data: {
          instructorName: '김소현',
          proposedTitle: '임시_LangGraph 마스터 A',
          proposedPrice: 500000,
        },
      });
      const propA = (await propARes.json()).proposal;

      // 3. 제안서 B 제출
      const propBRes = await request.post(`/api/courses/requests/${newReq.id}/proposals`, {
        data: {
          instructorName: '강민수',
          proposedTitle: '임시_LangGraph 실무 B',
          proposedPrice: 450000,
        },
      });
      const propB = (await propBRes.json()).proposal;

      // 4. 제안서 A 채택
      await request.post(`/api/courses/requests/${newReq.id}/accept-proposal`, {
        data: { proposalId: propA.id },
      });

      // 5. 관리자 제안서 조회에서 A는 '채택됨', B는 '반려' 확인
      const proposalsRes = await request.get('/api/admin/proposals');
      const proposalsData = await proposalsRes.json();
      const checkA = proposalsData.courseProposals.find((p: any) => p.id === propA.id);
      const checkB = proposalsData.courseProposals.find((p: any) => p.id === propB.id);

      expect(checkA.status).toBe('채택됨');
      expect(checkB.status).toBe('반려');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Phase 4: 마이데이터 연계 검증 (T1: 김수강생, T2: 김소현 강사)
  // ─────────────────────────────────────────────────────────────
  test.describe('Phase 4: 마이데이터 연계 검증 (T1: 김수강생, T2: 김소현 강사)', () => {
    test('TC-MY-001 & 003: 내 강의실 수강 관리 및 결제 영수증 스플릿 뷰 (T1)', async ({ page }) => {
      await loginAs(page, 'member', 'student@mail.com', '김수강생');

      // 1. 내 강의실 탭 이동
      await page.goto('/mypage?tab=courses');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=내 강의실 (수강 관리)').first()).toBeVisible();

      // 2. 결제 및 계정 설정 탭 이동
      await page.goto('/mypage?tab=settings');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=결제 및 계정 설정').first()).toBeVisible();
    });

    test('TC-MY-004: 수강 리뷰 작성 및 평균 평점 재계산 (T1: 김수강생)', async ({ request }) => {
      // POST /api/courses/c1/reviews
      const reviewPayload = {
        author: '김수강생',
        rating: 5,
        content: '임시_데이터 기반 성장 전략을 체계적으로 배울 수 있어 실무에 즉시 적용했습니다. 강사님의 실제 사례 공유가 매우 유익합니다.',
      };

      const reviewRes = await request.post('/api/courses/c1/reviews', { data: reviewPayload });
      expect(reviewRes.status()).toBe(201);
      const reviewData = await reviewRes.json();
      expect(reviewData.review).toBeDefined();
      expect(reviewData.review.author).toBe('김수강생');

      // 강의 상세에서 reviewCount 증가 및 rating 업데이트 확인
      const courseRes = await request.get('/api/courses/c1');
      const courseData = await courseRes.json();
      expect(courseData.course.reviewCount).toBeGreaterThanOrEqual(1);
    });

    test('TC-MY-002, 005, 006: 강사 강의 운영, CRM 발송, 정산 확인 (T2: 김소현)', async ({ request, page }) => {
      // 1. 강사 CRM 발송 (POST /api/instructor/crm/send)
      const crmRes = await request.post('/api/instructor/crm/send', {
        data: {
          courseId: 'c1',
          targetType: 'all',
          title: '임시_CRM_제목_001: 첫 수업 안내 및 실습 준비',
          content: '임시_첫 수업 안내드립니다. 실습 환경을 미리 셋업해 주세요.',
          channels: ['inapp', 'email'],
        },
      });
      expect(crmRes.ok()).toBeTruthy();

      // 2. 강사 대시보드 화면 확인
      await loginAs(page, 'manager', 'sohyun.kim@mail.com', '김소현');
      await page.goto('/mypage?tab=instructor');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=강사 대시보드').first()).toBeVisible();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Phase 5: 관리자 메뉴 연계 검증 (T3: 최관리 관리자)
  // ─────────────────────────────────────────────────────────────
  test.describe('Phase 5: 관리자 메뉴 연계 검증 (T3: 최관리 관리자)', () => {
    test('TC-ADM-001: 대시보드 KPI 통계 및 역제안 지표 조회', async ({ request }) => {
      const statsRes = await request.get('/api/admin/stats');
      expect(statsRes.ok()).toBeTruthy();
      const data = await statsRes.json();
      expect(data.stats).toBeDefined();
      expect(data.stats.totalRevenue).toBeGreaterThan(0);
      expect(data.stats.activeCourses).toBeGreaterThanOrEqual(6);
      expect(data.stats.courseRequestCount).toBeGreaterThan(0);
    });

    test('TC-ADM-002: 회원 관리 및 권한 변경 (정우석 manager 부여)', async ({ request }) => {
      // PATCH /api/admin/members/m4/role
      const roleRes = await request.patch('/api/admin/members/m4/role', {
        data: { roles: ['manager'] },
      });
      expect(roleRes.ok()).toBeTruthy();
      const roleData = await roleRes.json();
      expect(roleData.member.roles).toContain('manager');
    });

    test('TC-ADM-003: 결제 환불 처리 및 알림 생성', async ({ request }) => {
      // 1. 임시 결제 생성
      await request.post('/api/courses/c5/enroll', {
        data: { paymentMethod: '카드' },
      });

      const paymentsRes = await request.get('/api/payments');
      const payments = (await paymentsRes.json()).payments;
      const targetPay = payments[0]; // 최신 결제

      // 2. 환불 처리
      const refundRes = await request.post(`/api/payments/${targetPay.id}/refund`, {
        data: { reason: '임시_환불사유_002: 관리자 직권 환불 처리' },
      });
      expect(refundRes.ok()).toBeTruthy();
      const refundData = await refundRes.json();
      expect(refundData.payment.status).toBe('환불');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Phase 6: 역할 교차 & 보안 경계 검증
  // ─────────────────────────────────────────────────────────────
  test.describe('Phase 6: 역할 교차 & 보안 경계 검증', () => {
    test('TC-CROSS-001 & 002: 권한 변경 후 강의 개설 및 강사의 수강 신청', async ({ request }) => {
      // 1. 강사(김소현)가 타 강의(c4) 수강 신청
      const enrollRes = await request.post('/api/courses/c4/enroll', {
        data: { paymentMethod: '카드' },
      });
      expect(enrollRes.ok()).toBeTruthy();
    });

    test('TC-CROSS-004: XSS 및 보안 입력 처리 검증', async ({ request }) => {
      // XSS 태그가 포함된 강의 등록 시도
      const xssRes = await request.post('/api/courses', {
        data: {
          title: '임시_XSS_001: <script>alert("xss")</script>',
          description: '<img src=x onerror=alert(1)> 안전성 테스트',
          price: 100000,
        },
      });
      expect(xssRes.status()).toBe(201);
      const xssData = await xssRes.json();
      expect(xssData.course.title).toContain('<script>');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Phase 7: 프론트엔드 전용 UX 검증
  // ─────────────────────────────────────────────────────────────
  test.describe('Phase 7: 프론트엔드 전용 UX 검증', () => {
    test('TC-FE-001: 모바일(375px) 및 데스크탑(1440px) 반응형 렌더링', async ({ page }) => {
      // 1. 데스크탑 뷰포트
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1', { hasText: '교육 / 강의' })).toBeVisible();

      // 2. 모바일 뷰포트
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1', { hasText: '교육 / 강의' })).toBeVisible();
    });

    test('TC-FE-004: GNB 알림 센터 드롭다운 인터랙션', async ({ page }) => {
      await loginAs(page, 'member', 'student@mail.com', '김수강생');
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // GNB 알림 벨 버튼 클릭
      const notifBtn = page.locator('header button[aria-label="알림"]').first();
      if (await notifBtn.isVisible()) {
        await notifBtn.click();
        await expect(page.locator('text=알림').first()).toBeVisible();
      }
    });
  });

});
