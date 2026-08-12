import { test, expect } from '@playwright/test';

test.describe('E2E: Login Button & Authentication Modal Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('GNB 영역에 [로그인] 버튼이 존재하는지 확인한다', async ({ page }) => {
    // 1. [로그인] 버튼 요소 찾기 및 존재 여부 검증
    const loginButton = page.getByRole('button', { name: '로그인', exact: true });
    
    // 버튼이 화면에 가시적으로 표시되는지 확인
    await expect(loginButton).toBeVisible();
  });

  test('[로그인] 버튼 클릭 시 로그인 모달이 정상 오픈된다', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: '로그인', exact: true });
    await expect(loginButton).toBeVisible();

    // 2. [로그인] 버튼 클릭
    await loginButton.click();

    // 3. 로그인 모달 상단 타이틀 "로그인" 표시 확인
    const modalHeader = page.locator('h2', { hasText: '로그인' });
    await expect(modalHeader).toBeVisible();

    // 4. 이메일 및 비밀번호 입력란 존재 확인
    const emailInput = page.getByPlaceholder('이메일');
    const passwordInput = page.getByPlaceholder('비밀번호');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // 5. 모달 내 로그인 제출 버튼 확인
    const submitButton = page.locator('form button[type="submit"]', { hasText: '로그인' });
    await expect(submitButton).toBeVisible();
  });

  test('데모 빠른 로그인 버튼 클릭 시 모달이 닫히고 로그인이 처리된다', async ({ page }) => {
    // 로그인 버튼 클릭하여 모달 열기
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    // '데모 빠른 로그인' 영역의 '수강생' 버튼 클릭
    const demoStudentButton = page.locator('button', { hasText: '수강생' }).first();
    await expect(demoStudentButton).toBeVisible();
    await demoStudentButton.click();

    // 모달이 닫혔는지 확인
    const modalHeader = page.locator('h2', { hasText: '로그인' });
    await expect(modalHeader).not.toBeVisible();
  });
});
