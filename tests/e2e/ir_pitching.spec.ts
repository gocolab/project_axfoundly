import { test, expect } from '@playwright/test';

test.describe('E2E: IR 피칭 스타트업 탐색 및 팀원 모집 신청 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'IR 피칭', exact: true }).click();
  });

  test('IR 피칭 페이지 타이틀 및 스타트업 목록이 표시된다', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'IR 피칭 & 스타트업' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '뉴로플로우' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '헬스브릿지' })).toBeVisible();
  });

  test('분야 필터 클릭 시 해당하는 스타트업만 렌더링된다', async ({ page }) => {
    // '헬스케어' 카테고리 클릭
    await page.getByRole('button', { name: '헬스케어' }).click();

    await expect(page.locator('h3', { hasText: '헬스브릿지' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '뉴로플로우' })).not.toBeVisible();
  });

  test('스타트업 카드 클릭 시 상세 정보(문제, 솔루션, 비즈니스 모델, 멤버)가 표시된다', async ({ page }) => {
    await page.locator('h3', { hasText: '뉴로플로우' }).click();

    // 상세 비즈니스 모델, 문제 및 솔루션 섹션 렌더링 확인
    await expect(page.locator('h1', { hasText: '뉴로플로우' })).toBeVisible();
    await expect(page.locator('text=비즈니스 모델')).toBeVisible();
    await expect(page.locator('text=해결하는 문제')).toBeVisible();
  });

  test('채용 중인 스타트업에서 [팀원 모집 신청] 클릭 시 팀빌딩 신청 모달이 렌더링된다', async ({ page }) => {
    // 로그인 처리
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('button', { hasText: '수강생' }).first().click();

    // IR 페이지 이동 후 채용 중인 뉴로플로우 선택
    await page.getByRole('button', { name: 'IR 피칭', exact: true }).click();
    await page.locator('h3', { hasText: '뉴로플로우' }).click();

    // 팀원 모집 신청 버튼 확인 및 클릭
    const applyBtn = page.getByRole('button', { name: '팀원 모집 신청' });
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();

    // 신청 모달 오픈 확인
    await expect(page.locator('h2', { hasText: '팀빌딩 지원하기' })).toBeVisible();
  });
});
