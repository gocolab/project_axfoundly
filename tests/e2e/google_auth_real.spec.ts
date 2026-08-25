import { test, expect } from '@playwright/test';

test.describe('TC-Google-Real: 실제 구글 OAuth 회원(mahau.master@gmail.com) Storage State 기반 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('1. 저장된 Storage State를 통해 페이지 접속 시 자동으로 구글 회원 세션이 복원된다', async ({ page }) => {
    // 1) 로그인 버튼이 보이지 않고 프로필 버튼이 렌더링되는지 확인
    await expect(page.getByRole('button', { name: '로그인', exact: true })).not.toBeVisible();

    const profileButton = page.getByTestId('user-profile-button');
    await expect(profileButton).toBeVisible();
    await expect(profileButton).toContainText('수강생');

    // 2) 프로필 드롭다운 열기
    await profileButton.click();
    await expect(page.getByRole('button', { name: '마이페이지' })).toBeVisible();
    await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible();
  });

  test('2. 실제 구글 회원 권한으로 마이페이지 및 수강생 대시보드 진입이 가능하다', async ({ page }) => {
    // 1) 프로필 드롭다운 열기 및 마이페이지 클릭
    await page.getByTestId('user-profile-button').click();
    await page.getByRole('button', { name: '마이페이지' }).click();

    // 2) 마이페이지 헤더 및 사이드 메뉴 확인
    await expect(page.locator('h1', { hasText: '마이페이지' })).toBeVisible();
    await expect(page.getByRole('button', { name: '내 프로필' })).toBeVisible();
    await expect(page.getByRole('button', { name: '수강생 대시보드' })).toBeVisible();

    // 3) 수강생 대시보드 탭 전환 및 내부 하위 탭 검증
    await page.getByRole('button', { name: '수강생 대시보드' }).click();
    await expect(page.getByRole('button', { name: /내 강의실/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /프로젝트 & 팀 빌딩/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /알림/ })).toBeVisible();
  });

  test('3. 실제 구글 회원 계정으로 커뮤니티 게시글을 작성할 수 있다', async ({ page }) => {
    // 1) 커뮤니티 메뉴 이동
    await page.getByRole('button', { name: '커뮤니티' }).click();
    await expect(page.locator('h1', { hasText: '커뮤니티' })).toBeVisible();

    // 2) 글쓰기 버튼 클릭
    const writeBtn = page.getByRole('button', { name: '글쓰기' });
    await expect(writeBtn).toBeVisible();
    await writeBtn.click();

    // 3) 모달/폼 입력
    const postTitle = `[실제 구글 회원 E2E] 테스트 게시글 ${Date.now()}`;
    await page.locator('input[placeholder*="글 제목"]').fill(postTitle);
    await page.locator('textarea[placeholder*="내용을"]').fill('Playwright Storage State를 활용한 실제 구글 회원 작성 테스트입니다.');
    
    // 4) 등록 완료 버튼 클릭
    await page.getByRole('button', { name: '등록 완료' }).click();

    // 5) 등록된 게시글 확인
    await expect(page.getByText(postTitle)).toBeVisible();
  });

  test('4. 실제 구글 회원 계정으로 교육과정 페이지 탐색 및 인터랙션이 정상 작동한다', async ({ page }) => {
    // 1) 교육/강의 페이지 이동
    await page.getByRole('button', { name: '교육/강의' }).click();
    await expect(page.locator('h1', { hasText: '교육 / 강의' })).toBeVisible();

    // 2) 첫 번째 강의 카드 선택 (h3 헤딩 클릭하여 상세 이동)
    const firstCourseTitle = page.locator('main h3').first();
    await expect(firstCourseTitle).toBeVisible();
    await firstCourseTitle.click();

    // 3) 강의 상세 화면에서 '강의 목록으로' 버튼 노출 확인
    await expect(page.getByRole('button', { name: /강의 목록으로/ })).toBeVisible();
  });

  test('5. 로그아웃 시 정상적으로 세션이 종료되고 비로그인 상태로 복귀한다', async ({ page }) => {
    // 1) 프로필 열기
    await page.getByTestId('user-profile-button').click();
    
    // 2) 로그아웃 클릭
    await page.getByRole('button', { name: '로그아웃' }).click();

    // 3) 로그인 버튼 다시 노출 확인
    await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeVisible();
  });
});
