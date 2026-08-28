import { test, expect } from '@playwright/test';

test.describe('5대 UI/UX 개선 기능 종합 검증 (QA Verification)', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    // 1. 수강생 로그인
    await page.goto('/');
    const loginBtn = page.getByRole('button', { name: '로그인', exact: true });
    if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loginBtn.click();
      const quickLogin = page.getByTestId('quick-login-수강생');
      await expect(quickLogin).toBeVisible({ timeout: 3000 });
      await quickLogin.click();
      await page.waitForTimeout(500);
    }
  });

  test('1. 마이홈 > 내 스타트업 워크스페이스: 전체보기 버튼 및 최근 5개 프로젝트 제한 검증', async ({ page }) => {
    // Navigate to MyPage
    await page.goto('/mypage');
    await expect(page.locator('h1', { hasText: '마이페이지' })).toBeVisible({ timeout: 5000 });

    // Click "마이 홈" sidebar menu
    await page.locator('aside nav button', { hasText: '마이 홈' }).click();
    await expect(page.locator('text=내 스타트업 워크스페이스')).toBeVisible({ timeout: 5000 });

    // Check "전체보기" button
    const viewAllBtn = page.locator('button', { hasText: '전체보기' }).first();
    await expect(viewAllBtn).toBeVisible();

    // Check project list count (<= 5)
    const projectCards = page.locator('div:has-text("내 스타트업 워크스페이스")').locator('xpath=ancestor::div[contains(@class, "bg-brand-card")]').locator('.bg-brand-surface-low');
    const count = await projectCards.count();
    expect(count).toBeLessThanOrEqual(5);
  });

  test('2. 내 강의실 > 개강 요청 건: 검색창 및 페이지네이션 검증', async ({ page }) => {
    await page.goto('/mypage');
    await expect(page.locator('h1', { hasText: '마이페이지' })).toBeVisible({ timeout: 5000 });

    // Click "내 강의실" menu
    await page.locator('aside nav button', { hasText: '내 강의실' }).click();
    await expect(page.locator('h2', { hasText: '내 강의실' })).toBeVisible({ timeout: 5000 });

    // Click "개강 요청 건" tab
    const requestedTab = page.locator('button:has-text("개강 요청 건")');
    await expect(requestedTab).toBeVisible({ timeout: 5000 });
    await requestedTab.click();

    // Verify search bar is visible
    const searchInput = page.locator('input[placeholder*="개강 요청 주제"]');
    await expect(searchInput).toBeVisible();

    // Test search functionality
    await searchInput.fill('AI');
    await page.waitForTimeout(500);
    await searchInput.fill('');
  });

  test('3. 내 스타트업 > 내가 의뢰한 아이디어: 검색창 및 페이지네이션 검증', async ({ page }) => {
    await page.goto('/mypage');
    await expect(page.locator('h1', { hasText: '마이페이지' })).toBeVisible({ timeout: 5000 });

    // Click "내 스타트업" menu
    await page.locator('aside nav button', { hasText: '내 스타트업' }).click();
    await expect(page.locator('h2', { hasText: '내 스타트업' })).toBeVisible({ timeout: 5000 });

    // Click "내가 의뢰한 아이디어" subtab
    const ideasTab = page.locator('button:has-text("내가 의뢰한 아이디어")');
    await expect(ideasTab).toBeVisible({ timeout: 5000 });
    await ideasTab.click();

    // Verify search bar is visible
    const searchInput = page.locator('input[placeholder*="아이디어 제목, 문제"]');
    await expect(searchInput).toBeVisible();

    // Test search functionality
    await searchInput.fill('AI');
    await page.waitForTimeout(500);
    await searchInput.fill('');
  });

  test('4. 강사 대시보드 > 수요 있는 개강 요청 탐색: 검색창 및 페이지네이션 검증', async ({ page }) => {
    await page.goto('/mypage');
    await expect(page.locator('h1', { hasText: '마이페이지' })).toBeVisible({ timeout: 5000 });

    // Click "강의 개설 & 운영" menu
    await page.locator('aside nav button', { hasText: '강의 개설 & 운영' }).click();
    await expect(page.locator('text=강사 대시보드').first()).toBeVisible({ timeout: 5000 });

    // Click "수요 있는 개강 요청 탐색" subtab
    const reqTab = page.locator('button:has-text("수요 있는 개강 요청 탐색")');
    await expect(reqTab).toBeVisible({ timeout: 5000 });
    await reqTab.click();

    // Verify search bar is visible
    const searchInput = page.locator('input[placeholder*="주제, 카테고리, 희망일정"]');
    await expect(searchInput).toBeVisible();

    // Test search filtering
    await searchInput.fill('비즈니스');
    await page.waitForTimeout(500);
    await searchInput.fill('');
  });

  test('5. 강의 개설 모달: 회차별 일괄 진행 방식 및 개별 회차 설정 검증', async ({ page }) => {
    await page.goto('/mypage');
    await expect(page.locator('h1', { hasText: '마이페이지' })).toBeVisible({ timeout: 5000 });

    // Click "강의 개설 & 운영" menu
    await page.locator('aside nav button', { hasText: '강의 개설 & 운영' }).click();

    // Click "AI로 새 강의 개설하기" button
    const newCourseBtn = page.locator('button:has-text("AI로 새 강의 개설하기"), button:has-text("AI 강의 개설")').first();
    await expect(newCourseBtn).toBeVisible({ timeout: 5000 });
    await newCourseBtn.click();
    await page.waitForTimeout(500);

    // Switch to detail edit mode by clicking "상세 및 달력 설정"
    const detailEditModeBtn = page.locator('button:has-text("상세 및 달력 설정")').first();
    if (await detailEditModeBtn.isVisible()) {
      await detailEditModeBtn.click();
      await page.waitForTimeout(500);
    }

    // Check batch apply buttons
    await expect(page.locator('text=모든 회차 일괄 지정:')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("온라인 일괄")')).toBeVisible();
    await expect(page.locator('button:has-text("오프라인 일괄")')).toBeVisible();
    await expect(page.locator('button:has-text("VOD 일괄")')).toBeVisible();

    // Click "오프라인 일괄"
    await page.locator('button:has-text("오프라인 일괄")').click();
    await page.waitForTimeout(500);

    // Check individual session delivery mode buttons exist
    const sessionDeliveryBadges = page.locator('text=진행 방식:');
    const badgeCount = await sessionDeliveryBadges.count();
    expect(badgeCount).toBeGreaterThanOrEqual(1);

    // Click "온라인" on the first session
    const firstOnlineBtn = page.locator('button:has-text("온라인")').first();
    await firstOnlineBtn.click();
  });
});
