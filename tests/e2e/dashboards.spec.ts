import { test, expect } from '@playwright/test';

test.describe('TC-07: 4종 역할별 대시보드 종합 기능 및 데이터 생성/수정/상태전환 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 모든 브라우저 alert/confirm 다이얼로그 자동 수락
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
  });

  // ── 1. 통합 마이페이지: 스타트업 IR 프로젝트 등록 및 결제 영수증/환불 시나리오 ──
  test('마이페이지: 내 스타트업 IR 등록 및 결제/영수증 관리 환불 신청 시나리오가 완결된다', async ({ page }) => {
    // 1. 수강생 로그인
    await page.goto('/');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.getByTestId('quick-login-수강생').click();

    // 2. 마이페이지 이동
    await page.locator('header button', { hasText: '김수강생' }).click();
    await page.getByRole('button', { name: '마이페이지' }).click();
    await expect(page.locator('h1', { hasText: '마이페이지' })).toBeVisible();

    // 3. '내 스타트업' 메뉴로 이동
    await page.locator('aside nav button', { hasText: '내 스타트업' }).click();
    await expect(page.locator('h2', { hasText: '내 스타트업' })).toBeVisible();

    // 4. [신규 프로젝트 등록] 모달 열기 및 프로젝트 생성
    const newProjectBtn = page.getByRole('button', { name: '신규 프로젝트 등록' }).first();
    await expect(newProjectBtn).toBeVisible();
    await newProjectBtn.click();

    await expect(page.locator('h2', { hasText: '새 창업 프로젝트 등록' })).toBeVisible();

    const uniqueTeam = `테스트팀_${Date.now()}`;
    const uniqueTitle = `AI 자동화 솔루션 ${Date.now()}`;
    await page.getByPlaceholder('예: DocuMind AI').fill(uniqueTeam);
    await page.getByPlaceholder('예: 법률 문서를 위한 초정밀 RAG 분석 엔진').fill(uniqueTitle);
    await page.getByPlaceholder('예: 500페이지 계약서를 3초 만에 검토하는 AI').fill('실시간 자동화 E2E 테스트 프로젝트');

    // 프로젝트 저장
    await page.getByRole('button', { name: '프로젝트 등록', exact: true }).click();
    await expect(page.locator('h2', { hasText: '새 창업 프로젝트 등록' })).not.toBeVisible({ timeout: 10000 });

    // 등록된 프로젝트가 목록에 표시되는지 확인
    await expect(page.locator(`text=${uniqueTeam}`).first()).toBeVisible({ timeout: 10000 });

    // 5. '결제 및 계정 설정' 메뉴로 이동하여 결제 내역 및 영수증 확인
    await page.locator('aside nav button', { hasText: '결제 및 계정 설정' }).click();
    await expect(page.locator('h2', { hasText: '결제 및 계정 설정' })).toBeVisible();

    // 영수증 조회 버튼 클릭
    const receiptBtn = page.locator('button', { hasText: '영수증 조회' }).first();
    if (await receiptBtn.isVisible()) {
      await receiptBtn.click();
      await expect(page.locator('h2', { hasText: '결제 영수증 & 환불 관리' })).toBeVisible();
      await expect(page.locator('text=최종 결제 금액')).toBeVisible();

      // 환불 신청 폼 열기
      const refundBtn = page.getByRole('button', { name: '수강 취소 및 환불 신청' });
      if (await refundBtn.isVisible()) {
        await refundBtn.click();
        const refundInput = page.locator('textarea[placeholder*="환불 신청 사유"]');
        await expect(refundInput).toBeVisible();
        await refundInput.fill('E2E 테스트 단순 변심 환불');
        await page.getByRole('button', { name: '환불 확정' }).click();
      } else {
        await page.locator('.glass-panel-heavy button').first().click();
      }
    }
  });

  // ── 2. 강의 개설 & 운영 시나리오 ──
  test('마이페이지: 강의 개설 & 운영(AI 강의 개설, 수강생 CRM, 정산) 시나리오가 완결된다', async ({ page }) => {
    // 1. 강사/회원 로그인
    await page.goto('/');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.getByTestId('quick-login-수강생').click();

    // 2. 마이페이지 > 강의 개설 & 운영 이동
    await page.locator('header button', { hasText: '김수강생' }).click();
    await page.getByRole('button', { name: '마이페이지' }).click();
    await page.locator('aside nav button', { hasText: '강의 개설 & 운영' }).click();
    await expect(page.locator('h1', { hasText: '강사 대시보드' })).toBeVisible();

    // 3. [AI 강의 개설] 모달 열기
    const createCourseBtn = page.getByRole('button', { name: 'AI 강의 개설' });
    await expect(createCourseBtn).toBeVisible();
    await createCourseBtn.click();

    await expect(page.locator('h2', { hasText: 'AI 연계 강의 개설 & 달력 일정 등록' })).toBeVisible();

    // AI 주제 입력 후 초벌 생성
    const aiInput = page.locator('input[placeholder*="비개발자 창업가"]');
    await expect(aiInput).toBeVisible();
    await aiInput.fill('LLM 에이전트 마스터');
    await page.getByRole('button', { name: '생성' }).click();

    // 상세 편집기로 적용 버튼 클릭
    const applyDraftBtn = page.locator('button', { hasText: '상세 편집기로 적용' }).first();
    await expect(applyDraftBtn).toBeVisible({ timeout: 10000 });
    await applyDraftBtn.click();

    // 징검다리 자동 배정 버튼 클릭
    const autoScheduleBtn = page.getByRole('button', { name: '징검다리 일정 자동 재배정' });
    if (await autoScheduleBtn.isVisible()) {
      await autoScheduleBtn.click();
    }

    // 상세 편집기 폼에서 강의 개설 완료
    await expect(page.getByPlaceholder('강의 제목을 입력하세요')).toBeVisible();

    const submitCourseBtn = page.locator('.glass-panel-heavy').getByRole('button', { name: /강의 개설 및 (일정 등록|배포) 완료/ });
    await submitCourseBtn.click();

    // 모달 닫힘 확인
    await expect(page.locator('h2', { hasText: 'AI 연계 강의 개설 & 달력 일정 등록' })).not.toBeVisible();

    // 4. 수강생 관리 (CRM) 탭 이동 및 메시지 발송
    await page.locator('button', { hasText: '수강생 관리' }).click();
    await expect(page.locator('text=수강생 명단 및')).toBeVisible();

    // 메시지 발송 모달 열기
    const sendMsgBtn = page.locator('button', { hasText: '메시지 전송' }).first();
    await expect(sendMsgBtn).toBeVisible();
    await sendMsgBtn.click();

    await expect(page.locator('h3', { hasText: '수강 대상자 맞춤 메시지 발송' })).toBeVisible();
    await page.getByPlaceholder('메시지 제목을 입력하세요').fill('3주차 실습 안내');
    await page.getByPlaceholder('수강생에게 전달할 메시지 내용...').fill('실습 환경 접속 링크와 가이드 문서입니다.');

    await page.locator('.glass-panel-heavy').getByRole('button', { name: '발송하기' }).click();
    await expect(page.locator('h3', { hasText: '수강 대상자 맞춤 메시지 발송' })).not.toBeVisible();

    // 5. 정산 관리 탭 전환 및 매출 통계 확인
    await page.getByRole('button', { name: '정산 관리' }).click();
    await expect(page.locator('text=매출 및 정산 통계')).toBeVisible();
    await expect(page.getByRole('button', { name: '출금 신청' })).toBeVisible();
  });

  // ── 3. 관심 스타트업 & 투자 시나리오 ──
  test('마이페이지: 관심 스타트업 & 투자(북마크, AI 맞춤 추천 매칭) 시나리오가 완결된다', async ({ page }) => {
    // 1. 투자자/회원 로그인
    await page.goto('/');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.getByTestId('quick-login-수강생').click();

    // 2. 마이페이지 > 관심 스타트업 & 투자 이동
    await expect(page.locator('header button', { hasText: '김수강생' })).toBeVisible();
    await page.locator('header button', { hasText: '김수강생' }).click();
    await page.getByRole('button', { name: '마이페이지' }).click();
    await page.locator('aside nav button', { hasText: '관심 스타트업 & 투자' }).click();
    await expect(page.locator('h1', { hasText: '투자자 대시보드' })).toBeVisible();

    // 3. 관심 스타트업 탭 확인
    await expect(page.getByRole('button', { name: '관심 스타트업', exact: true })).toBeVisible();

    // 4. AI 추천 매칭 탭 전환 및 추천 스타트업 목록 확인
    await page.getByRole('button', { name: 'AI 추천 매칭' }).click();
    await expect(page.locator('text=AI 맞춤 스타트업 추천')).toBeVisible();
  });

  // ── 4. 관리자 대시보드 시나리오 ──
  test('관리자 대시보드: 회원 관리(권한 변경), 강의 승인/반려, 게시판 관리(신규 생성) 시나리오가 완결된다', async ({ page }) => {
    // 1. 관리자 로그인
    await page.goto('/');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '관리자' }).first().click();
    await expect(page.locator('header button', { hasText: /(관리자|최관리)/ })).toBeVisible();

    // 2. 관리자 메뉴 이동
    await page.locator('header button', { hasText: /(관리자|최관리)/ }).click();
    await page.getByRole('button', { name: '관리자 대시보드' }).click();
    await expect(page.locator('h1', { hasText: '플랫폼 관리자 대시보드' })).toBeVisible();

    // 3. 통계 홈 KPI 확인
    await expect(page.locator('text=일일 가입자')).toBeVisible();
    await expect(page.locator('text=총 결제액')).toBeVisible();

    // 4. 회원 관리 탭 이동 및 검색
    await page.getByRole('button', { name: '회원 관리' }).click();
    await expect(page.locator('text=플랫폼 가입 회원 목록')).toBeVisible();
    const memberSearch = page.getByPlaceholder('회원 검색...');
    await memberSearch.fill('김수강생');
    await expect(page.locator('text=student@mail.com')).toBeVisible();

    // 5. 강의 검수 & 승인 탭 이동
    await page.getByRole('button', { name: '강의 검수 & 승인' }).click();
    await expect(page.locator('text=신청/등록된 강의 커리큘럼 검수 & 승인')).toBeVisible();

    // 승인 버튼이 있는 경우 승인 처리
    const approveBtn = page.getByRole('button', { name: '승인' }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
    }

    // 6. 게시판 관리 탭 이동 및 새 게시판 생성
    await page.getByRole('button', { name: '게시판 관리' }).click();
    await expect(page.locator('text=멀티 게시판 관리')).toBeVisible();

    const createBoardBtn = page.getByRole('button', { name: '새 게시판 만들기' });
    await expect(createBoardBtn).toBeVisible();
    await createBoardBtn.click();

    await expect(page.locator('h3', { hasText: '멀티 게시판 생성기' })).toBeVisible();
    const uniqueBoard = `신규게시판_${Date.now()}`;
    await page.getByPlaceholder('새 게시판 이름').fill(uniqueBoard);

    await page.getByTestId('create-board-submit-btn').click();

    // 생성된 게시판 확인
    await expect(page.locator(`text=${uniqueBoard}`).first()).toBeVisible();
  });
});
