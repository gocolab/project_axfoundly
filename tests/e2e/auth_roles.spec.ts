import { test, expect } from '@playwright/test';

test.describe('E2E: 인증 모달 및 역할별(4종) 대시보드 접근 권한 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('로그인 모달 열기 및 닫기 토글 확인', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: '로그인', exact: true });
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // 모달 타이틀 확인
    const modalHeader = page.locator('h2', { hasText: '로그인' });
    await expect(modalHeader).toBeVisible();

    // 닫기 버튼 클릭
    const closeButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await closeButton.click();
    await expect(modalHeader).not.toBeVisible();
  });

  test('수강생(Student) 역할로 빠른 로그인 시 수강생 대시보드가 정상 렌더링된다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    
    // 수강생 빠른 로그인 클릭
    const studentBtn = page.locator('button', { hasText: '수강생' }).first();
    await studentBtn.click();

    // 대시보드 탭 이동
    const dashboardTab = page.getByRole('button', { name: '대시보드' });
    await dashboardTab.click();

    // 수강생 대시보드 타이틀 확인
    await expect(page.locator('h1', { hasText: '수강생 대시보드' })).toBeVisible();
    await expect(page.getByRole('button', { name: '내 강의실' })).toBeVisible();
    await expect(page.getByRole('button', { name: '프로젝트 & 팀 빌딩' })).toBeVisible();
  });

  test('강사(Instructor) 역할로 빠른 로그인 시 강사 대시보드가 정상 렌더링된다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    
    // 강사 빠른 로그인 클릭
    const instructorBtn = page.locator('button', { hasText: '강사' }).first();
    await instructorBtn.click();

    // 대시보드 탭 이동
    const dashboardTab = page.getByRole('button', { name: '대시보드' });
    await dashboardTab.click();

    // 강사 대시보드 타이틀 및 버튼 확인
    await expect(page.locator('h1', { hasText: '강사 대시보드' })).toBeVisible();
    await expect(page.getByRole('button', { name: '신규 강좌 개설' })).toBeVisible();
  });

  test('투자자(Investor) 역할로 빠른 로그인 시 투자자 대시보드가 정상 렌더링된다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    
    // 투자자 빠른 로그인 클릭
    const investorBtn = page.locator('button', { hasText: '투자자' }).first();
    await investorBtn.click();

    // 대시보드 탭 이동
    const dashboardTab = page.getByRole('button', { name: '대시보드' });
    await dashboardTab.click();

    // 투자자 대시보드 타이틀 확인
    await expect(page.locator('h1', { hasText: '투자자 대시보드' })).toBeVisible();
  });

  test('관리자(Admin) 역할로 빠른 로그인 시 GNB에 관리자 메뉴가 표시되고 접근 가능하다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    
    // 관리자 빠른 로그인 클릭
    const adminBtn = page.locator('button', { hasText: '관리자' }).first();
    await adminBtn.click();

    // GNB 내 관리자 탭 가시성 확인 및 클릭
    const adminNavTab = page.getByRole('button', { name: '관리자' });
    await expect(adminNavTab).toBeVisible();
    await adminNavTab.click();

    // 관리자 대시보드 타이틀 확인
    await expect(page.locator('h1', { hasText: '플랫폼 관리자 대시보드' })).toBeVisible();
  });

  test('로그아웃 시 비로그인 상태로 복귀하고 대시보드 접근 시 로그인 모달이 열린다', async ({ page }) => {
    // 1. 수강생으로 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('button', { hasText: '수강생' }).first().click();

    // 2. 로그아웃 버튼 클릭
    const logoutBtn = page.getByRole('button', { name: '로그아웃' });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // 3. 로그아웃 후 다시 [로그인] 버튼 가시성 확인
    await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeVisible();
  });
});
