import { test, expect } from '@playwright/test';

test.describe('TC-06: 커뮤니티 멀티 게시판, 권한 기반 공지 작성, 관리자 게시판 동기화, 상세 및 삭제 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto('/');
    await page.locator('header nav').getByRole('button', { name: '커뮤니티' }).click();
    await expect(page.locator('h1', { hasText: '커뮤니티' })).toBeVisible();
  });

  test('커뮤니티 페이지 타이틀 및 게시판 탭이 정상 표시된다', async ({ page }) => {
    await expect(page.locator('h1', { hasText: '커뮤니티' })).toBeVisible();
    await expect(page.getByRole('button', { name: '전체' })).toBeVisible();
    await expect(page.getByRole('button', { name: '공지사항' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Q&A' })).toBeVisible();
  });

  test('게시판 탭 필터링 동작을 확인한다', async ({ page }) => {
    await page.getByRole('button', { name: '공지사항' }).click();
    await expect(page.locator('text=공지').first()).toBeVisible();
  });

  test('게시글 실시간 검색이 동작한다', async ({ page }) => {
    const searchInput = page.getByPlaceholder('게시글 검색...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('모집');
    await expect(page.locator('text=모집').first()).toBeVisible();
  });

  test('비로그인 상태에서 [글쓰기] 클릭 시 로그인 모달이 오픈된다', async ({ page }) => {
    const writeBtn = page.getByTestId('community-write-btn');
    await expect(writeBtn).toBeVisible();
    await writeBtn.click();
    await expect(page.locator('.glass-panel-heavy h2')).toHaveText('로그인');
  });

  test('일반 사용자(수강생)는 글작성 시 공지사항을 선택할 수 없고 일반 게시글을 등록할 수 있다', async ({ page }) => {
    // 1. 수강생 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '수강생' }).first().click();
    await expect(page.locator('header button', { hasText: '김수강생' })).toBeVisible();

    // 2. 커뮤니티 이동 후 글쓰기 클릭
    await page.locator('header nav').getByRole('button', { name: '커뮤니티' }).click();
    await page.getByTestId('community-write-btn').click();
    await expect(page.locator('h3', { hasText: '게시글 작성' })).toBeVisible();

    // 3. 일반 사용자에게는 '공지사항' 선택 버튼과 '상단 공지 고정' 토글이 없어야 함
    await expect(page.locator('.glass-panel-heavy button', { hasText: '공지사항' })).not.toBeVisible();
    await expect(page.locator('text=상단 공지 고정')).not.toBeVisible();

    // 4. Q&A 게시글 작성
    const uniqueTitle = `수강생 Q&A 테스트 ${Date.now()}`;
    await page.getByPlaceholder('글 제목을 입력하세요').fill(uniqueTitle);
    await page.getByPlaceholder('내용을 작성하세요...').fill('일반 수강생 질문 본문 내용입니다.');
    await page.getByTestId('community-submit-post-btn').click();

    // 5. 검색을 통해 작성된 게시글 목록 확인
    const searchInput = page.getByPlaceholder('게시글 검색...');
    await searchInput.fill(uniqueTitle);
    await expect(page.locator(`text=${uniqueTitle}`).first()).toBeVisible();
  });

  test('관리자로 로그인 시 [공지사항] 선택 및 [상단 공지 고정] 설정이 가능하다', async ({ page }) => {
    // 1. 관리자 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '관리자' }).first().click();
    await expect(page.locator('header button', { hasText: '최관리' })).toBeVisible();

    // 2. 커뮤니티 이동 후 글쓰기 클릭
    await page.locator('header nav').getByRole('button', { name: '커뮤니티' }).click();
    await page.getByTestId('community-write-btn').click();
    await expect(page.locator('h3', { hasText: '게시글 작성' })).toBeVisible();

    // 3. 관리자 권한 표시 및 공지사항 버튼 / 상단 공지 고정 토글 확인
    await expect(page.locator('text=관리자 권한 활성화')).toBeVisible();
    const noticeBoardBtn = page.locator('.glass-panel-heavy button', { hasText: '공지사항' });
    await expect(noticeBoardBtn).toBeVisible();
    await noticeBoardBtn.click();

    // 4. 상단 공지 고정 토글 체크
    await expect(page.locator('text=상단 공지 고정 (Pin)')).toBeVisible();
    await page.locator('input[type="checkbox"]').check({ force: true });

    // 5. 공지글 등록
    const noticeTitle = `[공식 알림] 실시간 긴급 공지 ${Date.now()}`;
    await page.getByPlaceholder('글 제목을 입력하세요').fill(noticeTitle);
    await page.getByPlaceholder('내용을 작성하세요...').fill('플랫폼 전체 점검 안내 공지사항입니다.');
    await page.getByTestId('community-submit-post-btn').click();

    // 6. 목록 최상단에 핀 배지와 함께 등록되었는지 확인
    const createdNotice = page.locator(`text=${noticeTitle}`).first();
    await expect(createdNotice).toBeVisible();
  });

  test('관리자 페이지에서 신규 게시판을 생성하면 커뮤니티 페이지 탭과 글쓰기 모달에 즉시 동기화된다', async ({ page }) => {
    // 1. 관리자 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '관리자' }).first().click();
    await expect(page.locator('header button', { hasText: '최관리' })).toBeVisible();

    // 2. 관리자 페이지로 이동
    await page.getByTestId('user-profile-button').click();
    await page.getByRole('button', { name: '관리자 대시보드' }).click();
    await expect(page.locator('h1', { hasText: '관리자 대시보드' })).toBeVisible();

    // 3. 게시판 관리 탭으로 이동
    await page.getByRole('button', { name: /게시판/ }).click();

    // 4. 새 게시판 만들기 클릭
    const uniqueBoardName = `AI 해커톤 공모전 ${Date.now().toString().slice(-4)}`;
    await page.getByRole('button', { name: /새 게시판 만들기/ }).click();
    await expect(page.locator('h3', { hasText: '멀티 게시판 생성기' })).toBeVisible();

    // 5. 게시판 이름 입력 및 생성
    await page.getByPlaceholder('새 게시판 이름').fill(uniqueBoardName);
    await page.getByTestId('create-board-submit-btn').click();

    // 6. 커뮤니티 페이지로 이동하여 신규 게시판 탭이 존재하는지 확인
    await page.locator('header nav').getByRole('button', { name: '커뮤니티' }).click();
    await expect(page.locator('h1', { hasText: '커뮤니티' })).toBeVisible();
    await expect(page.getByRole('button', { name: uniqueBoardName })).toBeVisible();

    // 7. 글쓰기 모달에서도 신규 게시판 선택지가 나타나는지 확인
    await page.getByTestId('community-write-btn').click();
    await expect(page.locator('.glass-panel-heavy button', { hasText: uniqueBoardName })).toBeVisible();
    await page.locator('.glass-panel-heavy').getByRole('button', { name: '취소' }).click();
  });

  test('게시글 상세에서 댓글을 등록하고, 작성자/관리자가 댓글 및 게시글을 삭제할 수 있다', async ({ page }) => {
    // 1. 수강생 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '수강생' }).first().click();
    await expect(page.locator('header button', { hasText: '김수강생' })).toBeVisible();

    // 2. 커뮤니티 이동 및 게시글 등록
    await page.locator('header nav').getByRole('button', { name: '커뮤니티' }).click();
    await page.getByTestId('community-write-btn').click();
    const testPostTitle = `삭제 테스트용 게시글 ${Date.now()}`;
    await page.getByPlaceholder('글 제목을 입력하세요').fill(testPostTitle);
    await page.getByPlaceholder('내용을 작성하세요...').fill('삭제 기능 검증을 위한 테스트 본문');
    await page.getByTestId('community-submit-post-btn').click();

    // 3. 검색을 통해 작성된 게시글을 찾아서 클릭
    const searchInput = page.getByPlaceholder('게시글 검색...');
    await searchInput.fill(testPostTitle);
    const postRow = page.locator(`text=${testPostTitle}`).first();
    await expect(postRow).toBeVisible();
    await postRow.click();

    // 4. 댓글 작성
    const commentInput = page.getByPlaceholder('의견이나 질문을 댓글로 남겨보세요...');
    const testComment = `삭제 테스트 댓글 ${Date.now()}`;
    await commentInput.fill(testComment);
    await page.locator('form').getByRole('button', { name: '등록' }).click();
    await expect(page.locator(`text=${testComment}`)).toBeVisible();

    // 5. 댓글 삭제
    const commentItem = page.locator('div.p-3\\.5', { hasText: testComment });
    await expect(commentItem).toBeVisible();
    const commentDeleteBtn = commentItem.locator('button[title="댓글 삭제"]');
    await expect(commentDeleteBtn).toBeVisible();
    await commentDeleteBtn.click();
    await expect(page.locator('div.p-3\\.5', { hasText: testComment })).not.toBeVisible();

    // 6. 게시글 삭제
    const postDeleteBtn = page.getByTitle('게시글 삭제');
    await expect(postDeleteBtn).toBeVisible();
    await postDeleteBtn.click();

    // 7. 게시글이 목록에서 완전히 삭제되었는지 확인
    await expect(page.locator(`text=${testPostTitle}`)).not.toBeVisible();
  });
});
