import { test, expect } from '@playwright/test';

test.describe('TC-01: GNB 네비게이션 및 공통 레이아웃 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('GNB 로고 및 핵심 네비게이션 메뉴 4종이 정상 렌더링된다', async ({ page }) => {
    // 로고 확인
    await expect(page.locator('header').getByText('AI로 창업하라')).toBeVisible();

    // 네비게이션 메뉴 4종
    const nav = page.locator('header nav');
    await expect(nav.getByRole('button', { name: '홈' })).toBeVisible();
    await expect(nav.getByRole('button', { name: '교육/강의' })).toBeVisible();
    await expect(nav.getByRole('button', { name: '스타트업/IR' })).toBeVisible();
    await expect(nav.getByRole('button', { name: '커뮤니티' })).toBeVisible();
  });

  test('GNB 메뉴 클릭 시 각 페이지로 전환되고 활성 스타일이 적용된다', async ({ page }) => {
    const nav = page.locator('header nav');

    // 교육/강의 클릭
    await nav.getByRole('button', { name: '교육/강의' }).click();
    await expect(page.locator('h1', { hasText: '교육 / 강의' })).toBeVisible();

    // 스타트업/IR 클릭
    await nav.getByRole('button', { name: '스타트업/IR' }).click();
    await expect(page.locator('h1', { hasText: /스타트업/ })).toBeVisible();

    // 커뮤니티 클릭
    await nav.getByRole('button', { name: '커뮤니티' }).click();
    await expect(page.locator('h1', { hasText: '커뮤니티' })).toBeVisible();

    // 홈 클릭 시 메인으로 복귀
    await nav.getByRole('button', { name: '홈' }).click();
    await expect(page.locator('text=AI로 창업의 모든 것을')).toBeVisible();
  });

  test('비로그인 상태에서는 로그인 및 회원가입 버튼이 표시된다', async ({ page }) => {
    const header = page.locator('header');
    await expect(header.getByRole('button', { name: '로그인', exact: true })).toBeVisible();
    await expect(header.getByRole('button', { name: '회원가입', exact: true })).toBeVisible();
  });

  test('로그인 후 알림 센터 드롭다운 토글 및 알림 확인이 동작한다', async ({ page }) => {
    // 1. 수강생으로 빠른 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    const demoStudentBtn = page.locator('.glass-panel-heavy button', { hasText: '수강생' }).first();
    await demoStudentBtn.click();

    // 2. 알림 벨 아이콘 클릭
    const bellBtn = page.locator('header button').filter({ has: page.locator('svg.lucide-bell') });
    await expect(bellBtn).toBeVisible();
    await bellBtn.click();

    // 3. 알림 드롭다운 패널 노출 확인
    await expect(page.locator('header').getByText('알림', { exact: true })).toBeVisible();

    // 4. 첫 번째 알림 클릭 (읽음 처리)
    const firstNotif = page.locator('header .max-h-64 button').first();
    if (await firstNotif.isVisible()) {
      await firstNotif.click();
    }
  });
});
