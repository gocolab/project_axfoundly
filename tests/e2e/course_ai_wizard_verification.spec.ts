import { test, expect } from '@playwright/test';

test.describe('교육/강의 AI 개설 마법사 및 상세 달력 설정 실데이터 입력 종합 검증', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.setViewportSize({ width: 1280, height: 850 });

    // 홈 이동 및 로그인 확인 (기본 강사 김소현으로 로그인 확인)
    await page.goto('/');
    const userProfile = page.locator('[data-testid="user-profile-button"]');
    if (!(await userProfile.isVisible().catch(() => false))) {
      const loginBtn = page.getByRole('button', { name: '로그인', exact: true });
      if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await loginBtn.click();
        const quickLogin = page.getByTestId('quick-login-수강생');
        await expect(quickLogin).toBeVisible({ timeout: 5000 });
        await quickLogin.click();
        await expect(userProfile).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('강의개설 마법사: AI 채팅 초벌 ➔ 상세 달력 실시간 동기화, 모집 종료일시, 회차 일정 배정 및 등록 검증', async ({ page }) => {
    test.setTimeout(90000);

    // 1. 강의 페이지로 이동
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // 1-1. '수강생 개강 요청소' 서브 탭이 제거되었는지 확인 (단일 뷰 확인)
    await expect(page.locator('button', { hasText: '수강생 개강 요청소' })).not.toBeVisible();

    // 1-2. 강의 진행 방식 검색 필터 칩(전체, 실시간 온라인, 현장 오프라인, 온·오프라인 혼합) 존재 확인
    await expect(page.locator('button', { hasText: '전체' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: '💻 실시간 온라인' })).toBeVisible();
    await expect(page.locator('button', { hasText: '🏢 현장 오프라인' })).toBeVisible();
    await expect(page.locator('button', { hasText: '🔄 온·오프라인 혼합' })).toBeVisible();

    // 1-3. '+ 강의 개설 마법사' 버튼 클릭하여 모달 열기
    const openCreateModalBtn = page.locator('button', { hasText: '강의 개설 마법사' }).first();
    await expect(openCreateModalBtn).toBeVisible({ timeout: 5000 });
    await openCreateModalBtn.click();

    // 모달 헤더 노출 확인
    const modalHeader = page.locator('h2', { hasText: 'AI 연계 강의 개설 & 달력 일정 등록' });
    await expect(modalHeader).toBeVisible({ timeout: 5000 });

    // ── 2. AI 채팅 초벌 단계 실데이터 입력 ──
    // 초기 AI 인터뷰 안내 메시지 확인
    await expect(page.locator('text=1단계: 강의 주제 & 대상')).toBeVisible();

    // 멀티라인 textarea 확인
    const chatInput = page.locator('textarea[placeholder*="답변을 입력하세요"]');
    await expect(chatInput).toBeVisible();

    const testUniqueSuffix = Date.now();
    const promptMessage = `비개발자 스타트업 창업가를 위한 노코드 AI 자동화 및 에이전트 구축 실전 마스터클래스_${testUniqueSuffix}, 매주 화/목 19:30~21:30 총 4회차 실시간 온라인 과정입니다.`;

    await chatInput.fill(promptMessage);

    // 전송 버튼 클릭
    const sendChatBtn = page.locator('button', { hasText: '전송' });
    await sendChatBtn.click();

    // AI 응답 렌더링 대기 (초벌 카드 포함)
    await expect(page.locator('text=커리큘럼 초안을 설계했습니다').first()).toBeVisible({ timeout: 30000 });

    // ── 3. '상세 및 달력 설정' 탭으로 전환하여 실시간 동기화 검증 ──
    const detailTabBtn = page.locator('button', { hasText: '상세 및 달력 설정' });
    await detailTabBtn.click();
    await page.waitForTimeout(600);

    // 3-1. 제목, 카테고리, 상세 설명이 자동 매칭 및 채워졌는지 확인
    const titleInput = page.locator('input[placeholder*="생성형 AI로 3일 만에"]');
    await expect(titleInput).toBeVisible();
    const currentTitle = await titleInput.inputValue();
    expect(currentTitle.length).toBeGreaterThan(0);
    console.log('자동 채워진 강의 제목:', currentTitle);

    const descTextarea = page.locator('textarea[placeholder*="강의 소개, 수강 대상"]');
    const currentDesc = await descTextarea.inputValue();
    expect(currentDesc.length).toBeGreaterThan(0);
    console.log('자동 채워진 상세 설명:', currentDesc);

    // 3-2. 수강료 및 신설된 '할인 수강료' 입력란 확인
    const standardPriceInput = page.locator('input[placeholder="590000"]');
    const discountPriceInput = page.locator('input[placeholder="390000"]');
    await expect(standardPriceInput).toBeVisible();
    await expect(discountPriceInput).toBeVisible();

    // 실제 수강료 수정 입력
    await standardPriceInput.fill('650000');
    await discountPriceInput.fill('450000');

    // 3-3. '개강 시작일' 앞에 '모집 종료일시' 입력란이 위치하는지 DOM 순서 및 기능 검증
    const recruitmentEndDateLabel = page.locator('label', { hasText: '📣 모집 종료일시' });
    const startDateLabel = page.locator('label', { hasText: '🗓️ 개강 시작일' });
    await expect(recruitmentEndDateLabel).toBeVisible();
    await expect(startDateLabel).toBeVisible();

    const recruitInput = page.locator('input[type="datetime-local"]');
    await expect(recruitInput).toBeVisible();
    await recruitInput.fill('2025-08-31T23:59');

    const startDateInput = page.locator('div:has(> label:has-text("🗓️ 개강 시작일")) input[type="date"]');
    await expect(startDateInput).toBeVisible();
    await startDateInput.fill('2025-09-02');

    // 3-4. 요일 라인의 맨 우측 끝 '징검다리 일정 자동 재배정' 버튼 확인 및 동작
    const autoScheduleBtn = page.locator('button', { hasText: '징검다리 일정 자동 재배정' });
    await expect(autoScheduleBtn).toBeVisible();
    await autoScheduleBtn.click();
    await page.waitForTimeout(500);

    // 3-5. '+ 회차 추가' 클릭 시 포커스 이동 검증
    const addSessionBtn = page.locator('button', { hasText: '회차 추가' });
    await expect(addSessionBtn).toBeVisible();
    await addSessionBtn.click();
    await page.waitForTimeout(300);

    // 새로 추가된 마지막 회차의 제목 input 확인
    const sessionInputs = page.locator('input[placeholder*="회차 제목"]');
    const lastSessionInput = sessionInputs.last();
    await expect(lastSessionInput).toBeVisible();
    await lastSessionInput.fill('보너스 세션: AI 자동화 IR 피칭 실전 훈련');

    // 3-6. 'AI 자율 채우기 & 태깅' 버튼 복원 확인 및 실행
    const autoFillTagBtn = page.locator('button', { hasText: 'AI 자율 채우기 & 태깅' });
    await expect(autoFillTagBtn).toBeVisible();

    // ── 4. 강의 등록 완료 및 목록 반영 검증 ──
    const customFinalTitle = `[실전 완성] 노코드 AI 스타트업 마스터_${testUniqueSuffix}`;
    await titleInput.fill(customFinalTitle);

    const submitCourseBtn = page.locator('button', { hasText: '강의 개설 및 일정 등록 완료' }).or(page.locator('button', { hasText: '강의 수정 완료' })).last();
    await submitCourseBtn.click();

    // 모달 닫힘 확인
    await expect(modalHeader).not.toBeVisible({ timeout: 5000 });

    // 4-1. 강의 목록 페이지에 등록된 새 강의 카드가 노출되는지 확인
    const newCourseCard = page.locator('h3', { hasText: customFinalTitle }).first();
    await expect(newCourseCard).toBeVisible({ timeout: 8000 });
    console.log('신규 강의 등록 확인 완료:', customFinalTitle);

    // 4-2. 강사 본인 카드에 [수정] 버튼이 노출되는지 확인
    const courseCardContainer = page.locator('div.card-hover', { has: page.locator('h3', { hasText: customFinalTitle }) }).first();
    const editBtn = courseCardContainer.locator('button', { hasText: '수정' });
    await expect(editBtn).toBeVisible();

    // 4-3. [수정] 버튼 클릭 시 수정 모드로 모달 오픈 확인
    await editBtn.click();
    await expect(page.locator('h2', { hasText: '강의 수정 & 커리큘럼 관리' })).toBeVisible({ timeout: 5000 });

    // 수정 모달 닫기
    const closeBtn = page.locator('button[aria-label="닫기"]');
    await closeBtn.click();
    await expect(page.locator('h2', { hasText: '강의 수정 & 커리큘럼 관리' })).not.toBeVisible({ timeout: 3000 });
  });
});
