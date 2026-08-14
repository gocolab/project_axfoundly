import { test, expect } from '@playwright/test';

test.describe('E2E: 강의 탐색, 필터링, 검색 및 수강신청 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // GNB 교육/강의 메뉴 클릭
    await page.getByRole('button', { name: '교육/강의' }).click();
  });

  test('강의 목록 페이지 타이틀 및 카테고리 필터가 정상 표시된다', async ({ page }) => {
    await expect(page.locator('h1', { hasText: '교육 / 강의' })).toBeVisible();

    // 카테고리 필터 버튼 존재 확인
    await expect(page.getByRole('button', { name: '전체' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI 모델링' })).toBeVisible();
    await expect(page.getByRole('button', { name: '비즈니스 기획' })).toBeVisible();
  });

  test('카테고리 필터 클릭 시 해당하는 강의만 필터링되어 나타난다', async ({ page }) => {
    // 'AI 모델링' 필터 클릭
    await page.getByRole('button', { name: 'AI 모델링' }).click();

    // AI 모델링 카테고리 강의 카드 확인
    await expect(page.locator('h3', { hasText: 'AI 프로덕트 매니저 부트캠프' })).toBeVisible();

    // 다른 카테고리 강의는 숨겨졌는지 확인
    await expect(page.locator('h3', { hasText: '스타트업 비즈니스 모델 설계' })).not.toBeVisible();
  });

  test('실시간 키워드 검색 시 해당 강의 카드만 필터링된다', async ({ page }) => {
    const searchInput = page.getByPlaceholder('강의 검색...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('그로스 해킹');

    // 검색된 강의 카드 노출 확인
    await expect(page.locator('h3', { hasText: '그로스 해킹 마스터클래스' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'AI 프로덕트 매니저 부트캠프' })).not.toBeVisible();
  });

  test('일치하는 결과가 없을 경우 검색 결과 없음 메시지가 노출된다', async ({ page }) => {
    const searchInput = page.getByPlaceholder('강의 검색...');
    await searchInput.fill('NonExistentKeyword99');

    // 빈 상태 메시지 확인
    await expect(page.locator('text=검색 결과가 없습니다')).toBeVisible();
  });

  test('강의 카드 클릭 시 상세 페이지(커리큘럼, 수강후기) 정보가 노출된다', async ({ page }) => {
    // 첫 번째 강의 클릭
    const courseCard = page.locator('h3', { hasText: 'AI 프로덕트 매니저 부트캠프' });
    await courseCard.click();

    // 상세 헤더 정보 확인
    await expect(page.locator('h1', { hasText: 'AI 프로덕트 매니저 부트캠프' })).toBeVisible();
    await expect(page.locator('h2', { hasText: '커리큘럼' })).toBeVisible();
    await expect(page.locator('h2', { hasText: '수강 후기' })).toBeVisible();

    // 수강 후기 내용 확인
    await expect(page.locator('text=실무에서 바로 쓸 수 있는 내용이 가득합니다')).toBeVisible();
  });

  test('비로그인 상태에서 [수강 신청] 클릭 시 로그인 모달이 오픈된다', async ({ page }) => {
    // 강의 선택
    await page.locator('h3', { hasText: 'AI 프로덕트 매니저 부트캠프' }).click();

    // 수강 신청 버튼 클릭
    const enrollBtn = page.getByRole('button', { name: '수강 신청' });
    await expect(enrollBtn).toBeVisible();
    await enrollBtn.click();

    // 로그인 모달 오픈 확인
    await expect(page.locator('h2', { hasText: '로그인' })).toBeVisible();
  });

  test('로그인 상태에서 [수강 신청] 클릭 시 결제 및 수강신청 완료 모달이 작동한다', async ({ page }) => {
    // 로그인 진행 (수강생)
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('button', { hasText: '수강생' }).first().click();

    // 강의 페이지 이동
    await page.getByRole('button', { name: '교육/강의' }).click();
    await page.locator('h3', { hasText: 'AI 프로덕트 매니저 부트캠프' }).click();

    // 수강 신청 버튼 클릭
    const enrollBtn = page.getByRole('button', { name: '수강 신청' });
    await enrollBtn.click();

    // 수강 신청 결제 모달 노출 확인 및 결제 완료
    await expect(page.locator('h3', { hasText: '수강 신청 확인' })).toBeVisible();
    await page.getByRole('button', { name: '결제하기' }).click();

    // 결제 완료 후 '수강 중' 상태 표시 확인
    await expect(page.locator('text=수강 중')).toBeVisible();
  });
});
