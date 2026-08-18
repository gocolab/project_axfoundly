import { test, expect } from '@playwright/test';

test.describe('TC-06: 커뮤니티 멀티 게시판, 새 글 작성 및 댓글 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('header nav').getByRole('button', { name: '커뮤니티' }).click();
  });

  test('커뮤니티 페이지 타이틀 및 게시글 목록이 표시된다', async ({ page }) => {
    await expect(page.locator('h1', { hasText: '커뮤니티' })).toBeVisible();
    await expect(page.getByRole('button', { name: '전체' })).toBeVisible();
    await expect(page.getByRole('button', { name: '공지사항' })).toBeVisible();
  });

  test('게시판 탭 필터링 동작을 확인한다', async ({ page }) => {
    // '공지사항' 탭 선택
    await page.getByRole('button', { name: '공지사항' }).click();

    // 공지사항 게시글 확인
    await expect(page.locator('text=공지').first()).toBeVisible();
  });

  test('게시글 실시간 검색이 동작한다', async ({ page }) => {
    const searchInput = page.getByPlaceholder('게시글 검색...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('모집');

    // 검색 결과 확인
    await expect(page.locator('text=모집').first()).toBeVisible();
  });

  test('비로그인 상태에서 [글쓰기] 클릭 시 로그인 모달이 오픈된다', async ({ page }) => {
    const writeBtn = page.getByRole('button', { name: '글쓰기' });
    await expect(writeBtn).toBeVisible();
    await writeBtn.click();

    await expect(page.locator('.glass-panel-heavy h2')).toHaveText('로그인');
  });

  test('로그인 후 [글쓰기] 버튼 클릭 시 작성 모달이 오픈되고 게시글 등록이 처리된다', async ({ page }) => {
    // 1. 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '수강생' }).first().click();
    await expect(page.locator('header button', { hasText: '김수강생' })).toBeVisible();

    // 2. 커뮤니티 이동
    await page.locator('header nav').getByRole('button', { name: '커뮤니티' }).click();

    // 3. 글쓰기 버튼 클릭
    const newPostBtn = page.getByRole('button', { name: '글쓰기' });
    await expect(newPostBtn).toBeVisible();
    await newPostBtn.click();

    // 4. 작성 모달 확인
    await expect(page.locator('h3', { hasText: '게시글 작성' })).toBeVisible();

    // 5. 제목 및 내용 입력
    const uniqueTitle = `Playwright 자동화 통합 테스트 ${Date.now()}`;
    await page.getByPlaceholder('글 제목을 입력하세요').fill(uniqueTitle);
    await page.getByPlaceholder('내용을 작성하세요...').fill('E2E 통합 테스트 완결성 검증 본문 내용입니다.');

    // 6. 등록 완료 클릭
    const submitBtn = page.getByRole('button', { name: '등록 완료' });
    await submitBtn.click();

    // 7. 작성 완료 후 목록에 나타나는지 확인
    await expect(page.locator(`text=${uniqueTitle}`).first()).toBeVisible();
  });

  test('게시글 행 클릭 시 게시글 상세 및 댓글 모달이 오픈된다', async ({ page }) => {
    // 첫 번째 게시글 클릭
    const firstPost = page.locator('[data-testid="community-post-row"], .grid.grid-cols-12.cursor-pointer').first();
    await expect(firstPost).toBeVisible();
    await firstPost.click();
    // 상세 모달 내 댓글 영역 확인
    await expect(page.locator('h3', { hasText: '댓글' })).toBeVisible();
  });

});
