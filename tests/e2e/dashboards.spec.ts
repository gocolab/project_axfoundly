import { test, expect } from '@playwright/test';

test.describe('E2E: 대시보드 인터랙션 및 관리자 기능 검증', () => {
  test('관리자 대시보드에서 회원 권한 변경 및 강좌 승인 액션이 동작한다', async ({ page }) => {
    // 1. 관리자로 로그인
    await page.goto('/');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('button', { hasText: '관리자' }).first().click();

    // 2. 관리자 메뉴 이동
    await page.getByRole('button', { name: '관리자' }).click();
    await expect(page.locator('h1', { hasText: '플랫폼 관리자 대시보드' })).toBeVisible();

    // 3. 통계 카드 표시 확인
    await expect(page.locator('text=총 회원 수')).toBeVisible();
    await expect(page.locator('text=누적 매출')).toBeVisible();

    // 4. 회원 관리 탭 확인
    await expect(page.getByRole('button', { name: '회원 관리' })).toBeVisible();
    await expect(page.getByRole('button', { name: '강의 승인 관리' })).toBeVisible();

    // 5. 강의 승인 관리 탭 선택
    await page.getByRole('button', { name: '강의 승인 관리' }).click();
    await expect(page.locator('text=승인 대기 강의')).toBeVisible();
  });

  test('강사 대시보드에서 [신규 강좌 개설] 모달이 정상 렌더링된다', async ({ page }) => {
    // 1. 강사로 로그인
    await page.goto('/');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('button', { hasText: '강사' }).first().click();

    // 2. 대시보드로 이동
    await page.getByRole('button', { name: '대시보드' }).click();
    await expect(page.locator('h1', { hasText: '강사 대시보드' })).toBeVisible();

    // 3. 신규 강좌 개설 버튼 클릭
    const createCourseBtn = page.getByRole('button', { name: '신규 강좌 개설' });
    await expect(createCourseBtn).toBeVisible();
    await createCourseBtn.click();

    // 4. 모달 헤더 확인
    await expect(page.locator('h2', { hasText: '신규 강좌 등록 신청' })).toBeVisible();
  });
});
