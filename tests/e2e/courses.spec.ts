import { test, expect } from '@playwright/test';

test.describe('TC-04: 교육 / 강의 탐색, 필터링, 검색, 달력, 인포그래픽, 강사 모달 및 수강신청 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // GNB 교육/강의 메뉴 클릭
    await page.locator('header nav').getByRole('button', { name: '교육/강의' }).click();
    await expect(page.locator('h1', { hasText: '교육 / 강의' })).toBeVisible();
  });

  test('강의 목록 페이지 타이틀 및 카테고리 필터가 정상 표시된다', async ({ page }) => {
    await expect(page.locator('h1', { hasText: '교육 / 강의' })).toBeVisible();

    // 카테고리 필터 버튼 존재 확인
    await expect(page.getByRole('button', { name: '전체', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI 모델링', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '비즈니스 기획', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '마케팅', exact: true })).toBeVisible();
  });

  test('카테고리 필터 클릭 시 해당하는 강의만 필터링된다', async ({ page }) => {
    // 'AI 모델링' 필터 클릭
    await page.getByRole('button', { name: 'AI 모델링' }).click();

    // AI 모델링 카테고리 강의 카드 노출 확인
    const cards = page.locator('[data-testid="course-card"]');
    await expect(cards.first()).toBeVisible();
    await expect(cards.first().locator('text=AI 모델링')).toBeVisible();
  });

  test('실시간 키워드 검색 시 해당 강의 카드만 필터링된다', async ({ page }) => {
    const searchInput = page.getByPlaceholder('강의명, 강사명, 태그 검색...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('그로스 해킹');

    // 검색된 강의 카드 노출 확인
    await expect(page.locator('h3', { hasText: '그로스 해킹 마스터클래스' }).first()).toBeVisible();
  });

  test('일치하는 결과가 없을 경우 검색 결과 없음 메시지가 노출된다', async ({ page }) => {
    const searchInput = page.getByPlaceholder('강의명, 강사명, 태그 검색...');
    await searchInput.fill('NonExistentKeyword99');

    // 빈 상태 메시지 확인
    await expect(page.locator('text=검색 결과가 없습니다')).toBeVisible();
  });

  test('강의 카드 클릭 시 상세 페이지(커리큘럼, 강의 달력, 인포그래픽, 리뷰)가 정상 표시된다', async ({ page }) => {
    // 첫 번째 강의 카드 클릭
    const firstCourseCard = page.locator('[data-testid="course-card"]').first();
    await expect(firstCourseCard).toBeVisible();
    await firstCourseCard.click();

    // 상세 헤더 및 커리큘럼 확인
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('h2', { hasText: '커리큘럼 및 회차별 일정' })).toBeVisible();

    // 강의 달력 섹션 확인
    await expect(page.locator('h2', { hasText: '강의 달력 & 수강 일정' })).toBeVisible();

    // 강사 인포그래픽 카드 확인
    await expect(page.locator('text=강사 전문성').first()).toBeVisible();
    await expect(page.locator('text=공식 인증').first()).toBeVisible();

    // 수강 후기 섹션 확인
    await expect(page.locator('h2', { hasText: /수강 후기/ })).toBeVisible();
  });

  test('강사 인포그래픽 클릭 시 강사 상세 모달(과거 강의 및 리뷰 모음)이 팝업된다', async ({ page }) => {
    // 첫 번째 강의 카드 클릭
    const firstCourseCard = page.locator('[data-testid="course-card"]').first();
    await firstCourseCard.click();

    // 강사 상세 모달 버튼 클릭
    const viewAllBtn = page.locator('button', { hasText: '진행한 모든 강의 & 전체 리뷰 보기' });
    await expect(viewAllBtn).toBeVisible();
    await viewAllBtn.click();

    // 강사 상세 모달 확인
    await expect(page.locator('text=진행했던 모든 강의 이력')).toBeVisible();
    await expect(page.locator('text=수강생 전체 리뷰 모음')).toBeVisible();

    // 모달 닫기
    await page.locator('.glass-panel-heavy button').first().click();
    await expect(page.locator('text=진행했던 모든 강의 이력')).not.toBeVisible();
  });

  test('비로그인 상태에서 [수강 신청하기] 클릭 시 로그인 모달이 오픈된다', async ({ page }) => {
    // 첫 번째 강의 선택
    const firstCourseCard = page.locator('[data-testid="course-card"]').first();
    await expect(firstCourseCard).toBeVisible();
    await firstCourseCard.click();

    // 수강 신청 버튼 클릭
    const enrollBtn = page.getByRole('button', { name: '수강 신청하기' });
    await expect(enrollBtn).toBeVisible();
    await enrollBtn.click();

    // 로그인 모달 오픈 확인
    await expect(page.locator('.glass-panel-heavy h2')).toHaveText('로그인');
  });

  test('로그인 상태에서 [수강 신청하기] 클릭 시 결제 모달이 뜨고 수강신청 및 결제가 완료된다', async ({ page }) => {
    // 1. 수강생 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '수강생' }).first().click();
    await expect(page.locator('header button', { hasText: '김수강생' })).toBeVisible();

    // 2. 강의 상세 이동 (모의 결제 테스트를 위해 외부 PG 리다이렉트 abort)
    await page.route('**/api/payments/kakao/ready', route => route.abort());
    await page.locator('header nav').getByRole('button', { name: '교육/강의' }).click();
    const firstCourseCard = page.locator('[data-testid="course-card"]').first();
    await expect(firstCourseCard).toBeVisible();
    await firstCourseCard.click();

    // 3. 수강 신청 버튼 클릭
    const enrollBtn = page.getByRole('button', { name: '수강 신청하기' });
    if (await enrollBtn.isVisible()) {
      // alert 다이얼로그 자동 수락
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });

      await enrollBtn.click();

      // 4. 수강 신청 및 결제 모달 확인 및 결제하기 클릭
      await expect(page.locator('h3', { hasText: '수강 신청 및 결제' })).toBeVisible();
      await page.getByRole('button', { name: '카카오페이로 결제하기' }).click();

      // 5. 결제 후 수강완료 상태 배지 확인
      await expect(page.locator('text=수강 신청 완료')).toBeVisible();
    }
  });
});
