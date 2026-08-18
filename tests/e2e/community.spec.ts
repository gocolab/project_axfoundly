import { test, expect } from '@playwright/test';

test.describe('E2E: 커뮤니티 게시판 탐색 및 새 글 작성 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '커뮤니티' }).click();
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
    await expect(page.locator('text=모집 안내')).toBeVisible();
  });

  test('로그인 후 [글쓰기] 버튼 클릭 시 작성 모달이 오픈되고 폼 입력이 가능하다', async ({ page }) => {
    // 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('button', { hasText: '수강생' }).first().click();

    // 커뮤니티로 이동
    await page.getByRole('button', { name: '커뮤니티' }).click();

    // 글쓰기 버튼 클릭
    const newPostBtn = page.getByRole('button', { name: '글쓰기' });
    await expect(newPostBtn).toBeVisible();
    await newPostBtn.click();

    // 작성 모달 확인
    await expect(page.locator('h3', { hasText: '게시글 작성' })).toBeVisible();

    // 제목 및 내용 입력
    await page.getByPlaceholder('글 제목을 입력하세요').fill('Playwright 자동화 테스트 게시글');
    await page.getByPlaceholder('내용을 작성하세요...').fill('E2E 통합 테스트 검증 내용입니다.');

    // 등록 버튼 클릭
    const submitBtn = page.getByRole('button', { name: '등록 완료' });
    await submitBtn.click();

    // 작성 완료 후 목록에 나타나는지 확인
    await expect(page.locator('text=Playwright 자동화 테스트 게시글')).toBeVisible();
  });
});
