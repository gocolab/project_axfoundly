import { test, expect } from '@playwright/test';

test.describe('TC-03: 인증(Auth), Google OAuth 및 회원 권한 기반 접근 제어(RBAC) E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('로그인 모달 열기 및 닫기 토글 확인', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: '로그인', exact: true });
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // 모달 타이틀 확인
    const modalHeader = page.locator('.glass-panel-heavy h2');
    await expect(modalHeader).toHaveText('로그인');

    // 모달 닫기 버튼 클릭 (X 버튼)
    const closeButton = page.locator('.glass-panel-heavy button').first();
    await closeButton.click();
    await expect(modalHeader).not.toBeVisible();
  });

  test('수강생(Member) 빠른 로그인 시 마이페이지에서 통합 6대 메뉴가 정상 렌더링된다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    // 수강생 빠른 로그인 클릭
    const studentBtn = page.getByTestId('quick-login-수강생');
    await studentBtn.click();

    // 사용자 프로필 메뉴 클릭 후 마이페이지 이동
    const profileBtn = page.locator('header button', { hasText: '김수강생' });
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();
    await page.getByRole('button', { name: '마이페이지' }).click();

    // 마이페이지 헤더 및 6대 통합 메뉴 확인
    await expect(page.locator('h1', { hasText: '마이페이지' })).toBeVisible();
    await expect(page.locator('aside nav button', { hasText: '마이 홈' })).toBeVisible();
    await expect(page.locator('aside nav button', { hasText: '내 강의실' })).toBeVisible();
    await expect(page.locator('aside nav button', { hasText: '내 스타트업' })).toBeVisible();
    await expect(page.locator('aside nav button', { hasText: '강의 개설 & 운영' })).toBeVisible();
    await expect(page.locator('aside nav button', { hasText: '관심 스타트업 & 투자' })).toBeVisible();
    await expect(page.locator('aside nav button', { hasText: '결제 및 계정 설정' })).toBeVisible();
  });

  test('강사(Instructor) 빠른 로그인 시 마이페이지에서 강의 개설 및 관리를 즉시 이용할 수 있다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    // 강사 빠른 로그인 클릭
    const instructorBtn = page.getByTestId('quick-login-강사');
    await instructorBtn.click();

    // 사용자 프로필 메뉴 클릭 후 마이페이지 이동
    const profileBtn = page.locator('header button', { hasText: '김소현' });
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();
    await page.getByRole('button', { name: '마이페이지' }).click();

    await page.locator('aside nav button', { hasText: '강의 개설 & 운영' }).click();
    // 강사 대시보드 타이틀 및 탭 확인
    await expect(page.locator('h1', { hasText: '강사 대시보드' })).toBeVisible();
    await expect(page.getByRole('button', { name: '내 강의 목록' })).toBeVisible();
    await expect(page.getByRole('button', { name: '수강생 관리 (CRM)' })).toBeVisible();
    await expect(page.getByRole('button', { name: '정산 관리' })).toBeVisible();
  });

  test('투자자(Investor) 빠른 로그인 시 마이페이지에서 관심 스타트업 및 AI 추천을 즉시 이용할 수 있다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    // 투자자 빠른 로그인 클릭
    const investorBtn = page.getByTestId('quick-login-투자자');
    await investorBtn.click();

    // 사용자 프로필 메뉴 클릭 후 마이페이지 이동
    const profileBtn = page.locator('header button', { hasText: '한승우' });
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();
    await page.getByRole('button', { name: '마이페이지' }).click();

    await page.locator('aside nav button', { hasText: '관심 스타트업 & 투자' }).click();
    // 투자자 대시보드 타이틀 및 탭 확인
    await expect(page.locator('h1', { hasText: '투자자 대시보드' })).toBeVisible();
    await expect(page.getByRole('button', { name: '관심 스타트업', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI 추천 매칭' })).toBeVisible();
  });

  test('관리자(Admin) 빠른 로그인 시 GNB 드롭다운에 관리자 대시보드 메뉴가 활성화되고 접근 가능하다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();



    // 관리자 빠른 로그인 클릭
    const adminBtn = page.getByTestId('quick-login-관리자');
    await adminBtn.click();

    // 사용자 메뉴 열기
    const profileBtn = page.locator('header button', { hasText: '최관리' });
    await expect(profileBtn).toBeVisible();

    await profileBtn.click();

    // 관리자 대시보드 메뉴 확인 및 클릭
    const adminMenu = page.getByRole('button', { name: '관리자 대시보드' });
    await expect(adminMenu).toBeVisible();
    await adminMenu.click();

    // 관리자 대시보드 타이틀 확인
    await expect(page.locator('h1', { hasText: '플랫폼 관리자 대시보드' })).toBeVisible();
  });

  test('로그아웃 시 비로그인 상태로 복귀한다', async ({ page }) => {
    // 1. 수강생 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    

    
    await page.getByTestId('quick-login-수강생').click();

    // 2. 프로필 메뉴 열어서 로그아웃 클릭
    await page.locator('header button', { hasText: '김수강생' }).click();
    await page.getByRole('button', { name: '로그아웃' }).click();

    // 3. 로그인 버튼 원복 확인
    await expect(page.locator('header').getByRole('button', { name: '로그인', exact: true })).toBeVisible();
  });
});
