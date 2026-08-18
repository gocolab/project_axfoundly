import { test, expect } from '@playwright/test';

test.describe('TC-07: 4종 역할별 대시보드 종합 기능 E2E 테스트', () => {
  test('수강생 대시보드에서 내 강의실, 결제 영수증, 프로젝트 탭이 정상 작동한다', async ({ page }) => {
    // 1. 수강생 로그인
    await page.goto('/');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '수강생' }).first().click();

    // 2. 마이페이지 이동
    await page.locator('header button', { hasText: '김수강생' }).click();
    await page.getByRole('button', { name: '마이페이지' }).click();
    await expect(page.locator('h1', { hasText: '수강생 대시보드' })).toBeVisible();

    // 3. 내 강의실 탭 확인
    await expect(page.getByRole('button', { name: '내 강의실' })).toBeVisible();

    // 4. 결제 내역 탭 확인
    const paymentTab = page.getByRole('button', { name: '수강 및 결제 내역' });
    if (await paymentTab.isVisible()) {
      await paymentTab.click();
      await expect(page.locator('text=결제 내역').first()).toBeVisible();
    }

    // 5. 프로젝트 & 팀 빌딩 탭 확인
    const projectTab = page.getByRole('button', { name: '프로젝트 & 팀 빌딩' });
    await expect(projectTab).toBeVisible();
    await projectTab.click();
    await expect(page.getByRole('button', { name: '신규 프로젝트 등록' }).first()).toBeVisible();
  });

  test('강사 대시보드에서 강의 목록, AI 강의 개설 모달, CRM, 정산 탭이 작동한다', async ({ page }) => {
    // 1. 강사 로그인
    await page.goto('/');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '강사' }).first().click();

    // 2. 대시보드 이동
    await page.locator('header button', { hasText: '김소현' }).click();
    await page.getByRole('button', { name: '마이페이지' }).click();
    await expect(page.locator('h1', { hasText: '강사 대시보드' })).toBeVisible();

    // 3. [AI 강의 개설] 버튼 및 모달 확인
    const createCourseBtn = page.getByRole('button', { name: 'AI 강의 개설' });
    await expect(createCourseBtn).toBeVisible();
    await createCourseBtn.click();
    await expect(page.locator('h2', { hasText: 'AI 연계 강의 개설 & 달력 일정 등록' })).toBeVisible();
    await page.locator('.glass-panel-heavy button[aria-label="닫기"]').click(); // 닫기

    // 4. CRM 탭 전환
    await page.getByRole('button', { name: '수강생 관리 (CRM)' }).click();
    await expect(page.locator('text=수강생 명단 및 진도 관리')).toBeVisible();

    // 5. 정산 관리 탭 전환
    await page.getByRole('button', { name: '정산 관리' }).click();
    await expect(page.locator('text=매출 및 정산 통계')).toBeVisible();
  });

  test('투자자 대시보드에서 관심 스타트업 및 AI 추천 매칭 탭이 작동한다', async ({ page }) => {
    // 1. 투자자 로그인
    await page.goto('/');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '투자자' }).first().click();

    // 2. 대시보드 이동
    await expect(page.locator('header button', { hasText: '이벤처' })).toBeVisible();
    await page.locator('header button', { hasText: '이벤처' }).click();
    await page.getByRole('button', { name: '마이페이지' }).click();
    await expect(page.locator('h1', { hasText: '투자자 대시보드' })).toBeVisible();

    // 3. 탭 전환 확인
    await expect(page.getByRole('button', { name: '관심 스타트업' })).toBeVisible();
    await page.getByRole('button', { name: 'AI 추천 매칭' }).click();
    await expect(page.locator('text=AI 맞춤 스타트업 추천')).toBeVisible();
  });

  test('관리자 대시보드에서 통계 홈, 회원 관리, 강의 승인, 게시판 탭이 작동한다', async ({ page }) => {
    // 1. 관리자 로그인
    await page.goto('/');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '관리자' }).first().click();
    await expect(page.locator('header button', { hasText: '최관리' })).toBeVisible();

    // 2. 관리자 메뉴 이동
    await page.locator('header button', { hasText: '최관리' }).click();
    await page.getByRole('button', { name: '관리자 대시보드' }).click();
    await expect(page.locator('h1', { hasText: '플랫폼 관리자 대시보드' })).toBeVisible();

    // 3. 통계 홈 탭
    await expect(page.locator('text=통계 홈')).toBeVisible();

    // 4. 회원 관리 탭
    await page.getByRole('button', { name: '회원 관리' }).click();
    await expect(page.locator('text=플랫폼 가입 회원 목록')).toBeVisible();

    // 5. 강의 검수 & 승인 탭
    await page.getByRole('button', { name: '강의 검수 & 승인' }).click();
    await expect(page.locator('text=신청/등록된 강의 커리큘럼')).toBeVisible();

    // 6. 게시판 관리 탭
    await page.getByRole('button', { name: '게시판 관리' }).click();
    await expect(page.getByRole('button', { name: '새 게시판 만들기' })).toBeVisible();
  });
});
