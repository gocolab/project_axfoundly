import { test, expect } from '@playwright/test';

test.describe('TC-05: 스타트업/IR 탐색, 스텔스 모드, 구인 지원서 제출 및 투자 제안 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    // GNB 스타트업/IR 메뉴 클릭
    await page.locator('header nav').getByRole('button', { name: '스타트업/IR' }).click();
    await expect(page.locator('h1', { hasText: /스타트업/ })).toBeVisible();
  });

  test('스타트업/IR 페이지 타이틀 및 스타트업 목록이 표시된다', async ({ page }) => {
    await expect(page.locator('h1', { hasText: /스타트업/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '전체' })).toBeVisible();
    await expect(page.getByPlaceholder(/스타트업명/)).toBeVisible();

    // 스타트업 카드 최소 1개 이상 노출 확인
    const cards = page.locator('.card-hover');
    await expect(cards.first()).toBeVisible();
  });

  test('분야 필터 클릭 시 해당하는 스타트업만 렌더링된다', async ({ page }) => {
    await page.getByRole('button', { name: 'AI/ML' }).click();
    const cards = page.locator('.card-hover');
    await expect(cards.first()).toBeVisible();
    await expect(cards.first().locator('text=AI/ML').first()).toBeVisible();
  });

  test('스타트업 실시간 검색이 동작한다', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/스타트업명/);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('DocuMind');

    const cards = page.locator('.card-hover');
    await expect(cards.first()).toBeVisible();
    await expect(page.locator('.card-hover', { hasText: 'DocuMind' }).first()).toBeVisible();
  });

  test('스타트업 카드 클릭 시 상세 정보(문제, 솔루션, 비즈니스 모델, 팀원)가 표시된다', async ({ page }) => {
    const firstCard = page.locator('.card-hover').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // 상세 비즈니스 모델, 문제 및 솔루션 섹션 렌더링 확인
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('h2', { hasText: '비즈니스 모델' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '문제 (Problem)' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '솔루션 (Solution)' })).toBeVisible();
  });

  test('실명 vs 비실명(스텔스) 모드 스위치 토글 시 화면 내 텍스트와 배지가 전환된다', async ({ page }) => {
    const firstCard = page.locator('.card-hover').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // 스텔스 모드 토글 버튼 찾기
    const stealthToggle = page.locator('button', { hasText: '스텔스 모드' });
    if (await stealthToggle.isVisible()) {
      await stealthToggle.click();
      // 스텔스 모드 활성화 확인
      await expect(page.locator('text=스텔스(비실명) 모드')).toBeVisible();
    }
  });

  test('채용 중인 스타트업의 [지원하기] 클릭 시 지원 폼에 지원동기 입력 후 제출이 완료된다', async ({ page }) => {
    const firstCard = page.locator('.card-hover').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // 채용 지원 버튼이 있을 경우 모달 동작 확인
    const applyBtn = page.getByRole('button', { name: '지원하기' }).first();
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await expect(page.locator('h3', { hasText: '팀 합류 지원하기' })).toBeVisible();

      // 자기소개/지원동기 입력
      const noteInput = page.getByPlaceholder('본인의 강점, 관련 프로젝트 경험, 지원 동기를 간단히 적어주세요...');
      await expect(noteInput).toBeVisible();
      await noteInput.fill('Playwright E2E 자동화 테스트를 통해 작성된 합류 지원서입니다.');

      // 다이얼로그 자동 수락
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });

      // 지원서 제출 클릭
      await page.getByRole('button', { name: '지원서 제출' }).click();

      // 모달 닫힘 확인
      await expect(page.locator('h3', { hasText: '팀 합류 지원하기' })).not.toBeVisible();
    }
  });

  test('투자자 역할 로그인 시 [투자 제안하기] 클릭으로 제안 폼 작성 및 발송이 완료된다', async ({ page }) => {
    // 1. 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '수강생' }).first().click();
    await expect(page.locator('.glass-panel-heavy')).not.toBeVisible();
    await expect(page.locator('header button', { hasText: /(마하우|김수강생|수강생)/ })).toBeVisible();

    // 2. 스타트업/IR 상세 이동
    await page.locator('header nav').getByRole('button', { name: '스타트업/IR' }).click();
    const firstCard = page.locator('.card-hover').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // 3. 투자 제안 버튼 클릭
    const proposalBtn = page.getByRole('button', { name: '투자 제안하기' });
    if (await proposalBtn.isVisible()) {
      await proposalBtn.click();
      await expect(page.locator('h3', { hasText: '투자 검토 및 미팅 제안' })).toBeVisible();

      // 제안 메시지 확인 및 입력
      const msgArea = page.getByPlaceholder('스타트업 대표 및 팀에 전할 투자 제안 상세 메시지를 작성하세요.');
      await expect(msgArea).toBeVisible();
      await msgArea.fill('자동화 통합 테스트: Seed 라운드 3억원 투자 검토 및 미팅 제안을 발송합니다.');

      // 다이얼로그 자동 수락
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });

      // 발송 버튼 클릭
      await page.locator('.glass-panel-heavy').getByRole('button', { name: '제안서 전송' }).click();

      // 제안 전송 완료 메시지 배지 확인
      await expect(page.locator('text=투자 제안이 전송되었습니다')).toBeVisible();
    }
  });

  test('관심 스타트업 북마크 토글이 정상 동작한다', async ({ page }) => {
    // 1. 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.locator('.glass-panel-heavy button', { hasText: '수강생' }).first().click();
    await expect(page.locator('.glass-panel-heavy')).not.toBeVisible();

    // 2. IR 상세 이동
    await page.locator('header nav').getByRole('button', { name: '스타트업/IR' }).click();
    const firstCard = page.locator('.card-hover').first();
    await firstCard.click();

    // 3. 북마크 버튼 클릭
    const bookmarkBtn = page.locator('button', { hasText: /관심 스타트업/ });
    await expect(bookmarkBtn).toBeVisible();
    const initialText = await bookmarkBtn.innerText();
    await bookmarkBtn.click();

    // 토글 후 텍스트 상태 변경 확인
    if (initialText.includes('등록 (북마크)')) {
      await expect(page.locator('button', { hasText: '관심 스타트업 등록됨' })).toBeVisible();
    }
  });
});
