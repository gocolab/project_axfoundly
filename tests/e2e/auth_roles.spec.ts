import { test, expect } from '@playwright/test';

test.describe('TC-03: 인증(Auth), Google OAuth 및 4종 회원 등급 기반 접근 제어(RBAC) E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('로그인 모달 열기, 회원가입 탭 전환 및 닫기 토글 확인', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: '로그인', exact: true });
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // 모달 타이틀 확인
    const modalHeader = page.locator('.glass-panel-heavy h2');
    await expect(modalHeader).toHaveText('로그인');

    // 회원가입 탭 전환
    await page.locator('.glass-panel-heavy').getByRole('button', { name: '회원가입' }).click();
    await expect(modalHeader).toHaveText('회원 등급 가입');

    // 모달 닫기 버튼 클릭
    const closeButton = page.locator('.glass-panel-heavy button').first();
    await closeButton.click();
    await expect(modalHeader).not.toBeVisible();
  });

  test('Google OAuth 로그인 (otter.oh@gmail.com) 시 최고 관리자 프로필로 로그인되고 관리자 대시보드 접근이 가능하다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    // Google OAuth 로그인 버튼 확인 및 클릭
    const googleBtn = page.getByTestId('google-oauth-button');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText('otter.oh@gmail.com');
    await googleBtn.click();

    // GNB에 오승환 프로필 확인
    const profileBtn = page.locator('header button', { hasText: '오승환' });
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();

    // 관리자 메뉴 확인 및 대시보드 이동
    const adminMenu = page.getByRole('button', { name: '관리자 대시보드' });
    await expect(adminMenu).toBeVisible();
    await adminMenu.click();

    await expect(page.locator('h1', { hasText: '플랫폼 관리자 대시보드' })).toBeVisible();
  });

  test('회원 등급(강사) 선택 가입 시 해당 등급으로 등록 및 대시보드 기능이 활성화된다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy').getByRole('button', { name: '회원가입' }).click();

    // 회원 정보 입력
    const uniqueEmail = `teacher_${Date.now()}@test.com`;
    await page.getByPlaceholder('이름').fill('신규강사');
    await page.getByPlaceholder('이메일 주소').fill(uniqueEmail);
    await page.getByPlaceholder('비밀번호').fill('secret123');

    // 강사 등급 선택
    await page.getByTestId('signup-role-instructor').click();

    // 가입 완료 제출
    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('.glass-panel-heavy').getByRole('button', { name: '선택한 등급으로 가입 완료' }).click();

    // GNB에서 신규 가입자 확인
    const profileBtn = page.locator('header button', { hasText: '신규강사' });
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();

    await page.getByRole('button', { name: '마이페이지' }).click();
    await page.locator('aside nav button', { hasText: '강사 대시보드' }).click();
    await expect(page.locator('h1', { hasText: '강사 대시보드' })).toBeVisible();
  });

  test('수강생(Student) 빠른 로그인 시 수강생 대시보드가 정상 렌더링된다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    // 수강생 빠른 로그인 클릭
    const studentBtn = page.locator('.glass-panel-heavy button', { hasText: '수강생' }).first();
    await studentBtn.click();

    // 사용자 프로필 메뉴 클릭 후 마이페이지 이동
    const profileBtn = page.locator('header button', { hasText: '김수강생' });
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();
    await page.getByRole('button', { name: '마이페이지' }).click();

    await page.locator('aside nav button', { hasText: '수강생 대시보드' }).click();
    // 수강생 대시보드 타이틀 확인
    await expect(page.locator('h1', { hasText: '수강생 대시보드' })).toBeVisible();
    await expect(page.getByRole('button', { name: '내 강의실' })).toBeVisible();
    await expect(page.getByRole('button', { name: '프로젝트 & 팀 빌딩' })).toBeVisible();
  });

  test('강사(Instructor) 빠른 로그인 시 강사 대시보드가 정상 렌더링된다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    // 강사 빠른 로그인 클릭
    const instructorBtn = page.locator('.glass-panel-heavy button', { hasText: '강사' }).first();
    await instructorBtn.click();

    // 사용자 프로필 메뉴 클릭 후 마이페이지 이동
    const profileBtn = page.locator('header button', { hasText: '김소현' });
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();
    await page.getByRole('button', { name: '마이페이지' }).click();

    await page.locator('aside nav button', { hasText: '강사 대시보드' }).click();
    // 강사 대시보드 타이틀 및 탭 확인
    await expect(page.locator('h1', { hasText: '강사 대시보드' })).toBeVisible();
    await expect(page.getByRole('button', { name: '내 강의 목록' })).toBeVisible();
    await expect(page.getByRole('button', { name: '수강생 관리 (CRM)' })).toBeVisible();
    await expect(page.getByRole('button', { name: '정산 관리' })).toBeVisible();
  });

  test('투자자(Investor) 빠른 로그인 시 투자자 대시보드가 정상 렌더링된다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    // 투자자 빠른 로그인 클릭
    const investorBtn = page.locator('.glass-panel-heavy button', { hasText: '투자자' }).first();
    await investorBtn.click();

    // 사용자 프로필 메뉴 클릭 후 마이페이지 이동
    const profileBtn = page.locator('header button', { hasText: /(한승우|이벤처)/ });
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();
    await page.getByRole('button', { name: '마이페이지' }).click();

    await page.locator('aside nav button', { hasText: '투자자 대시보드' }).click();
    // 투자자 대시보드 타이틀 및 탭 확인
    await expect(page.locator('h1', { hasText: '투자자 대시보드' })).toBeVisible();
    await expect(page.getByRole('button', { name: '관심 스타트업' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI 추천 매칭' })).toBeVisible();
  });

  test('관리자(Admin) 빠른 로그인 시 GNB 드롭다운에 관리자 대시보드 메뉴가 활성화되고 접근 가능하다', async ({ page }) => {
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    // 관리자 빠른 로그인 클릭
    const adminBtn = page.locator('.glass-panel-heavy button', { hasText: '관리자' }).first();
    await adminBtn.click();

    // 사용자 메뉴 열기
    const profileBtn = page.locator('header button', { hasText: /(관리자|최관리)/ });
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
    await page.locator('.glass-panel-heavy button', { hasText: '수강생' }).first().click();

    // 2. 프로필 메뉴 열어서 로그아웃 클릭
    await page.locator('header button', { hasText: '김수강생' }).click();
    await page.getByRole('button', { name: '로그아웃' }).click();

    // 3. 로그인 버튼 원복 확인
    await expect(page.locator('header').getByRole('button', { name: '로그인', exact: true })).toBeVisible();
  });
});
