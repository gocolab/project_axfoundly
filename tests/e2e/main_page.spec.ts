import { test, expect } from '@playwright/test';

test.describe('TC-02: 메인 페이지 & 비즈니스 진입점 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('메인 히어로 배너가 슬림 중앙 집중형으로 정상 렌더링된다', async ({ page }) => {
    // 히어로 텍스트 확인
    await expect(page.locator('text=AI로 빠르게 창업하라')).toBeVisible();
    await expect(page.locator('text=아이디어부터 투자까지')).toBeVisible();
  });

  test('인기 추천 강의 섹션 [전체 보기] 클릭 시 교육/강의 페이지로 이동한다', async ({ page }) => {
    const exploreBtn = page.locator('section', { hasText: '인기 추천 강의' }).getByRole('button', { name: '전체 보기' });
    await expect(exploreBtn).toBeVisible();
    await exploreBtn.click();

    await expect(page.locator('h1', { hasText: '교육 / 강의' })).toBeVisible();
  });

  test('GNB [로그인] 클릭 시 로그인 모달이 오픈된다', async ({ page }) => {
    const loginBtn = page.locator('header').getByRole('button', { name: '로그인' });
    await expect(loginBtn).toBeVisible();
    await loginBtn.click();

    // 로그인 모달 오픈 확인
    await expect(page.locator('.glass-panel-heavy h2')).toBeVisible();
  });

  test('메인 페이지 주요 섹션(강의, 스타트업, 최근 소식) 및 전체보기 링크가 동작한다', async ({ page }) => {
    // 인기 추천 강의 섹션
    await expect(page.locator('text=인기 추천 강의')).toBeVisible();

    // 주목받는 스타트업 섹션
    await expect(page.locator('text=주목받는 스타트업')).toBeVisible();

    // 최근 소식 섹션
    await expect(page.locator('h2', { hasText: '최근 소식' })).toBeVisible();

    // 스타트업 카드의 [전체 보기] 클릭
    const viewAllStartupBtn = page.locator('section', { hasText: '주목받는 스타트업' }).getByRole('button', { name: '전체 보기' });
    await viewAllStartupBtn.click();
    await expect(page.locator('h1', { hasText: /스타트업/ })).toBeVisible();
  });

  test('하단 푸터(Footer)가 렌더링되고 회사소개, 이용약관, 개인정보처리방침 링크가 올바르게 존재한다', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // 상호명 및 사업자 정보 확인
    await expect(footer).toContainText('렉토메이트 (LectoMate)');
    await expect(footer).toContainText('634-62-00683');
    await expect(footer).toContainText('오상훈');

    // 회사소개 링크
    const companyLink = footer.getByRole('link', { name: '회사소개' });
    await expect(companyLink).toBeVisible();
    await expect(companyLink).toHaveAttribute('href', 'https://www.lectomate.com/policy/company');

    // 이용약관 링크
    const termsLink = footer.getByRole('link', { name: '이용약관' });
    await expect(termsLink).toBeVisible();
    await expect(termsLink).toHaveAttribute('href', 'https://www.lectomate.com/policy/terms');

    // 개인정보처리방침 링크
    const privacyLink = footer.getByRole('link', { name: '개인정보처리방침' });
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute('href', 'https://www.lectomate.com/policy/privacy');
  });
});

