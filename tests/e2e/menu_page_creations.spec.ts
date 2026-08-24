import { test, expect } from '@playwright/test';

test.describe('메뉴 페이지별 직접 등록/생성 기능 E2E 검증', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 1. 빠른 데모 로그인 (수강생)
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.getByRole('button', { name: '개발용 데모 로그인' }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '수강생' }).first().click();
    await expect(page.locator('header button', { hasText: '김수강생' })).toBeVisible();
  });

  test('교육/강의 메뉴 페이지에서 직접 [강의 생성] 모달을 열고 신규 강의를 등록할 수 있다', async ({ page }) => {
    // 1. 교육/강의 메뉴 이동
    await page.locator('header nav').getByRole('button', { name: '교육/강의' }).click();
    await expect(page.locator('h1', { hasText: '교육 / 강의' })).toBeVisible();

    // 2. [강의 생성] 버튼 클릭
    const createBtn = page.getByRole('button', { name: '강의 생성' });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // 3. AI 연계 강의 개설 모달 직접 렌더링 확인
    const modalTitle = page.locator('h2', { hasText: 'AI 연계 강의 개설 & 달력 일정 등록' });
    await expect(modalTitle).toBeVisible();

    // 4. 상세 및 달력 설정 탭으로 전환
    await page.getByRole('button', { name: '상세 및 달력 설정' }).click();

    // 5. 강의 제목 입력
    const uniqueCourseTitle = `E2E 신규 개설 강의 ${Date.now()}`;
    await page.getByPlaceholder('강의 제목을 입력하세요').fill(uniqueCourseTitle);

    // 6. 강의 개설 완료 버튼 클릭
    const submitBtn = page.getByRole('button', { name: '강의 개설 및 일정 등록 완료' });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 7. 모달 닫힘 및 성공 토스트/목록 갱신 확인
    await expect(modalTitle).not.toBeVisible();
    await expect(page.locator('h3', { hasText: uniqueCourseTitle })).toBeVisible();
  });

  test('스타트업/IR 메뉴 페이지에서 직접 [프로젝트 등록] 모달을 열고 신규 스타트업을 등록할 수 있다', async ({ page }) => {
    // 1. 스타트업/IR 메뉴 이동
    await page.locator('header nav').getByRole('button', { name: '스타트업/IR' }).click();
    await expect(page.locator('h1', { hasText: /스타트업/ })).toBeVisible();

    // 2. [프로젝트 등록] 버튼 클릭
    const createBtn = page.getByRole('button', { name: '프로젝트 등록' });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // 3. 스타트업 프로젝트 등록 모달 직접 렌더링 확인
    const modalTitle = page.locator('h2', { hasText: '새 창업 프로젝트 등록' });
    await expect(modalTitle).toBeVisible();

    // 4. 프로젝트 정보 입력
    const uniqueTeamName = `E2E팀 ${Date.now()}`;
    const uniqueTitle = `AI 에이전트 서비스 ${Date.now()}`;
    await page.getByPlaceholder('예: DocuMind AI').fill(uniqueTeamName);
    await page.getByPlaceholder('예: 법률 문서를 위한 초정밀 RAG 분석 엔진').fill(uniqueTitle);
    await page.getByPlaceholder('예: 500페이지 계약서를 3초 만에 검토하는 AI').fill('E2E 자동화 테스트 프로젝트');

    // 5. 프로젝트 등록 버튼 클릭
    const submitBtn = page.locator('form button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 6. 모달 닫힘 및 성공 확인
    await expect(modalTitle).not.toBeVisible();
    await expect(page.locator('h3', { hasText: uniqueTeamName })).toBeVisible();
  });

  test('커뮤니티 메뉴 페이지에서 직접 [글쓰기] 모달을 열고 신규 게시글을 등록할 수 있다', async ({ page }) => {
    // 1. 커뮤니티 이동
    await page.locator('header nav').getByRole('button', { name: '커뮤니티' }).click();
    await expect(page.locator('h1', { hasText: '커뮤니티' })).toBeVisible();

    // 2. 글쓰기 버튼 클릭
    const writeBtn = page.getByRole('button', { name: '글쓰기' });
    await expect(writeBtn).toBeVisible();
    await writeBtn.click();

    // 3. 작성 모달 확인
    const modalTitle = page.locator('h3', { hasText: '게시글 작성' });
    await expect(modalTitle).toBeVisible();

    // 4. 제목 및 내용 입력
    const uniqueTitle = `메뉴 페이지 직접 등록 테스트 ${Date.now()}`;
    await page.getByPlaceholder('글 제목을 입력하세요').fill(uniqueTitle);
    await page.getByPlaceholder('내용을 작성하세요...').fill('테스트 본문 내용입니다.');

    // 5. 등록 버튼 클릭
    await page.getByRole('button', { name: '등록 완료' }).click();

    // 6. 모달 닫힘 및 게시글 등록 확인
    await expect(modalTitle).not.toBeVisible();
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible();
  });
});
