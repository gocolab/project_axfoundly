import { test, expect } from '@playwright/test';

test.describe('E2E: IR 피칭 스타트업 탐색 및 팀원 모집 신청 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '스타트업/IR' }).click();
  });

  test('스타트업/IR 페이지 타이틀 및 스타트업 목록이 표시된다', async ({ page }) => {
    await expect(page.locator('h1', { hasText: '스타트업 / IR' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'DocuMind AI' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'MedScan AI' })).toBeVisible();
  });

  test('분야 필터 클릭 시 해당하는 스타트업만 렌더링된다', async ({ page }) => {
    // '헬스케어' 카테고리 클릭
    await page.getByRole('button', { name: '헬스케어' }).click();

    await expect(page.locator('h3', { hasText: 'MedScan AI' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'DocuMind AI' })).not.toBeVisible();
  });

  test('스타트업 카드 클릭 시 상세 정보(문제, 솔루션, 비즈니스 모델, 멤버)가 표시된다', async ({ page }) => {
    await page.locator('h3', { hasText: 'DocuMind AI' }).click();

    // 상세 비즈니스 모델, 문제 및 솔루션 섹션 렌더링 확인
    await expect(page.locator('h1', { hasText: 'DocuMind AI' })).toBeVisible();
    await expect(page.locator('h2', { hasText: '비즈니스 모델' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '문제 (Problem)' })).toBeVisible();
  });

  test('투자자 역할 로그인 시 [투자 제안하기] 클릭으로 제안 모달이 오픈된다', async ({ page }) => {
    // 투자자로 로그인 처리
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('button', { hasText: '투자자' }).first().click();

    // IR 페이지 이동 후 DocuMind AI 선택
    await page.getByRole('button', { name: '스타트업/IR' }).click();
    await page.locator('h3', { hasText: 'DocuMind AI' }).click();

    // 투자 제안하기 버튼 확인 및 클릭
    const proposeBtn = page.getByRole('button', { name: '투자 제안하기' });
    await expect(proposeBtn).toBeVisible();
    await proposeBtn.click();

    // 제안 모달 오픈 확인
    await expect(page.locator('h2', { hasText: '투자 및 미팅 제안하기' })).toBeVisible();
  });
});
