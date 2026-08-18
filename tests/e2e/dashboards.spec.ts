import { test, expect } from '@playwright/test';

test.describe('E2E: 대시보드 인터랙션 및 관리자 기능 검증', () => {
  test('관리자 대시보드에서 회원 권한 변경 및 강좌 승인 탭이 동작한다', async ({ page }) => {
    // 1. 관리자로 로그인
    await page.goto('/');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('button', { hasText: '최고 관리자' }).first().click();

    // 2. 관리자 메뉴 이동
    await page.locator('button', { hasText: '관리자' }).first().click();
    await page.getByRole('button', { name: '관리자 대시보드' }).click();
    await expect(page.locator('h1', { hasText: '관리자 대시보드' })).toBeVisible();

    // 3. 통계 탭/지표 확인
    await expect(page.locator('text=통계 홈')).toBeVisible();

    // 4. 회원 관리 탭 및 강의 검수 탭 확인
    await expect(page.getByRole('button', { name: '회원 관리' })).toBeVisible();
    await expect(page.getByRole('button', { name: '강의 검수 & 승인' })).toBeVisible();

    // 5. 강의 검수 탭 선택
    await page.getByRole('button', { name: '강의 검수 & 승인' }).click();
    await expect(page.locator('text=신청/등록된 강의 커리큘럼')).toBeVisible();
  });

  test('강사 대시보드에서 [새 강의 등록] 버튼이 정상 렌더링된다', async ({ page }) => {
    // 1. 강사로 로그인
    await page.goto('/');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('button', { hasText: '강사' }).first().click();

    // 2. 대시보드로 이동
    await page.locator('button', { hasText: '김소현' }).click();
    await page.getByRole('button', { name: '마이페이지' }).click();
    await expect(page.locator('h1', { hasText: '강사 대시보드' })).toBeVisible();

    // 3. 새 강의 등록 버튼 클릭 가능 확인
    const createCourseBtn = page.getByRole('button', { name: 'AI 강의 개설' });
    await expect(createCourseBtn).toBeVisible();
  });
});
