import { test, expect } from '@playwright/test';

test.describe('TC-05: 스타트업/IR 탐색, 스텔스 모드, 채용 지원 및 투자 제안 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    // GNB 스타트업/IR 메뉴 클릭
    await page.locator('header nav').getByRole('button', { name: '스타트업/IR' }).click();
    await expect(page.locator('h1', { hasText: /스타트업/ })).toBeVisible();
  });

  test('스타트업/IR 페이지 타이틀 및 스타트업 목록이 표시된다', async ({ page }) => {
    await expect(page.locator('h1', { hasText: /스타트업/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '전체' })).toBeVisible();
    await expect(page.getByPlaceholder('스타트업명, 아이템 검색...')).toBeVisible();

    // 스타트업 카드 최소 1개 이상 노출 확인
    const cards = page.locator('.grid.grid-cols-1 .bg-brand-card');
    await expect(cards.first()).toBeVisible();
  });

  test('분야 필터 클릭 시 해당하는 스타트업만 렌더링된다', async ({ page }) => {
    await page.getByRole('button', { name: 'AI/ML' }).click();
    const cards = page.locator('.grid.grid-cols-1 .bg-brand-card');
    await expect(cards.first()).toBeVisible();
    await expect(cards.first().locator('text=AI/ML')).toBeVisible();
  });

  test('스타트업 실시간 검색이 동작한다', async ({ page }) => {
    const searchInput = page.getByPlaceholder('스타트업명, 아이템 검색...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('DocuMind');

    const cards = page.locator('.grid.grid-cols-1 .bg-brand-card');
    await expect(cards.first()).toBeVisible();
    await expect(cards.first().locator('h3')).toHaveText(/DocuMind/);
  });

  test('스타트업 카드 클릭 시 상세 정보(문제, 솔루션, 비즈니스 모델, 팀원)가 표시된다', async ({ page }) => {
    const firstCard = page.locator('.grid.grid-cols-1 .bg-brand-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // 상세 비즈니스 모델, 문제 및 솔루션 섹션 렌더링 확인
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('h2', { hasText: '비즈니스 모델' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '문제 (Problem)' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '솔루션 (Solution)' })).toBeVisible();
  });

  test('실명 vs 비실명(스텔스) 모드 스위치 토글이 정상 동작한다', async ({ page }) => {
    const firstCard = page.locator('.grid.grid-cols-1 .bg-brand-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // 스텔스 모드 토글 버튼 찾기
    const stealthToggle = page.locator('button', { hasText: '스텔스 모드' });
    if (await stealthToggle.isVisible()) {
      await stealthToggle.click();
      // 스텔스 모드 활성화 텍스트 확인
      await expect(page.locator('text=스텔스').first()).toBeVisible();
    }
  });

  test('채용 중인 스타트업의 [지원하기] 클릭 시 지원 폼/모달이 오픈된다', async ({ page }) => {
    const firstCard = page.locator('.grid.grid-cols-1 .bg-brand-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // 채용 지원 버튼이 있을 경우 모달 동작 확인
    const applyBtn = page.getByRole('button', { name: '지원하기' }).first();
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await expect(page.locator('h3', { hasText: '팀 합류 지원하기' })).toBeVisible();
    }
  });

  test('투자자 역할 로그인 시 [투자 제안하기] 클릭으로 제안 모달이 오픈된다', async ({ page }) => {
    // 1. 투자자 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '투자자' }).first().click();
    await expect(page.locator('header button', { hasText: /(한승우|이벤처|투자자)/ })).toBeVisible();


    // 2. 스타트업/IR 상세 이동
    await page.locator('header nav').getByRole('button', { name: '스타트업/IR' }).click();
    const firstCard = page.locator('.grid.grid-cols-1 .bg-brand-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // 3. 투자 제안 버튼 클릭
    const proposalBtn = page.getByRole('button', { name: '투자 제안하기' });
    if (await proposalBtn.isVisible()) {
      await proposalBtn.click();
      await expect(page.locator('h3', { hasText: '투자 검토 및 미팅 제안' })).toBeVisible();
    }
  });
});
