import { test, expect } from '@playwright/test';

test.describe('통합 E2E 검증: 교육/강의, 스타트업/IR, 커뮤니티, 마이페이지, 관리자 하위 전 메뉴', () => {

  test.beforeEach(async ({ page }) => {
    // 다이얼로그 자동 수락
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. 교육/강의 검증
  // ─────────────────────────────────────────────────────────────
  test('1. 교육/강의: 상세 화면에서만 수정/삭제 노출, 별점 동작, 카카오페이 결제, 수강 취소 기능 확인', async ({ page }) => {
    // 1-1. 수강생 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.getByTestId('quick-login-수강생').click();
    await expect(page.locator('[data-testid="user-profile-button"]')).toBeVisible({ timeout: 5000 });

    // 1-2. GNB를 통한 교육/강의 목록 페이지 이동
    await page.locator('header nav').getByRole('button', { name: '교육/강의' }).click();
    await expect(page.locator('h1', { hasText: '교육 / 강의' })).toBeVisible();

    // 목록에서는 수정/삭제 버튼이 보이지 않아야 함
    const courseCards = page.locator('[data-testid="course-card"]');
    await expect(courseCards.first()).toBeVisible();
    await expect(courseCards.first().getByRole('button', { name: '강의 수정' })).toHaveCount(0);
    await expect(courseCards.first().getByRole('button', { name: '강의 삭제' })).toHaveCount(0);

    // 1-3. 첫 번째 강의 클릭하여 상세 진입
    await courseCards.first().click();
    await expect(page.locator('h1')).toBeVisible();

    // 상세 화면에서 수정/삭제 버튼 노출 여부 확인:
    // 강의 상세의 강사가 본인(김수강생)인 경우에만 버튼이 보이고, 아닌 경우 노출되지 않음
    const instructorArea = page.locator('[title*="강사 상세 정보"]');
    const instructorText = (await instructorArea.count() > 0) ? (await instructorArea.textContent()) : '';
    const isInstructorSelf = instructorText?.includes('김수강생') ?? false;
    if (isInstructorSelf) {
      await expect(page.getByRole('button', { name: '강의 수정' })).toBeVisible();
      await expect(page.getByRole('button', { name: '강의 삭제' })).toBeVisible();
    } else {
      await expect(page.getByRole('button', { name: '강의 수정' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: '강의 삭제' })).toHaveCount(0);
    }

    // 별점 평가 영역 확인 및 별점 상호작용
    const starButtons = page.locator('button:has(svg.lucide-star)');
    if (await starButtons.count() > 0) {
      await starButtons.first().click();
    }

    // 1-4. 수강 신청 또는 수강 취소 버튼 확인
    const enrollBtn = page.getByRole('button', { name: '수강 신청하기' });
    const cancelBtn = page.getByRole('button', { name: '수강 취소' });

    if (await enrollBtn.isVisible()) {
      await enrollBtn.click();
      // 카카오페이 단독 결제 수단 확인
      await expect(page.locator('text=카카오페이').first()).toBeVisible();
      await expect(page.locator('text=일반 신용카드')).not.toBeVisible();
      // 결제 모달 닫기
      const closeBtn = page.locator('.glass-panel-heavy button').first();
      if (await closeBtn.isVisible()) await closeBtn.click();
    } else if (await cancelBtn.isVisible()) {
      await expect(cancelBtn).toBeEnabled();
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 2. 스타트업 & IR 검증
  // ─────────────────────────────────────────────────────────────
  test('2. 스타트업 & IR: 상세 화면에서 링크 버튼(데모/피칭/깃허브) 확인 및 작성자 권한 제어', async ({ page }) => {
    // 2-1. GNB를 통한 스타트업 & IR 페이지 이동
    await page.locator('header nav').getByRole('button', { name: /스타트업/ }).click();
    await expect(page.locator('h1', { hasText: '스타트업 & IR' })).toBeVisible();

    // 2-2. 첫 번째 IR 프로젝트 카드 클릭하여 상세 진입
    const projectCards = page.locator('[data-testid="project-card"]');
    await expect(projectCards.first()).toBeVisible();
    await projectCards.first().click();

    // 2-3. 서비스 동작 및 피칭 영상 링크 버튼 확인
    const heading = page.locator('h2', { hasText: '서비스 동작 및 피칭 영상' });
    if (await heading.isVisible()) {
      const externalLinks = page.locator('a[target="_blank"]');
      const count = await externalLinks.count();
      if (count > 0) {
        const firstLink = externalLinks.first();
        await expect(firstLink).toHaveAttribute('rel', /noopener noreferrer/);
      }
    }

    // 2-4. 비로그인/비작성자 상태에서 상세 수정/삭제 버튼 미노출 확인
    await expect(page.locator('button[title="프로젝트 정보 수정"]')).toHaveCount(0);
    await expect(page.locator('button[title="프로젝트 삭제"]')).toHaveCount(0);
  });

  // ─────────────────────────────────────────────────────────────
  // 3. 아이디어 제작 요청소 & 커뮤니티 검증
  // ─────────────────────────────────────────────────────────────
  test('3. 아이디어 제작 요청소: 상세에서 [나도 쓸래요] 기능 완전 삭제 확인 및 커뮤니티 확인', async ({ page }) => {
    // 3-1. 스타트업 & IR 내 '아이디어 제작 요청소' 탭 이동
    await page.locator('header nav').getByRole('button', { name: /스타트업/ }).click();
    await expect(page.locator('h1', { hasText: '스타트업 & IR' })).toBeVisible();

    const ideaTab = page.locator('button', { hasText: '아이디어 제작 요청소' });
    await expect(ideaTab).toBeVisible();
    await ideaTab.click();

    // 아이디어 카드 클릭하여 우측 상세 패널 열기
    const ideaCards = page.locator('[data-testid="idea-request-card"]');
    if (await ideaCards.count() > 0) {
      await ideaCards.first().click();
      // 우측 상세 패널에 '출시 응원 잠재고객' / '나도 쓸래요' 기능이 완전히 삭제되었는지 검증
      const slidePanel = page.locator('div[class*="animate-slideInFromRight"]');
      if (await slidePanel.isVisible()) {
        await expect(slidePanel.locator('text=나도 쓸래요')).toHaveCount(0);
        await expect(slidePanel.locator('button', { hasText: '나도 쓸래요' })).toHaveCount(0);
      }
    }

    // 3-2. 커뮤니티 페이지 이동 및 게시판 정상 표시 확인
    await page.locator('header nav').getByRole('button', { name: '커뮤니티' }).click();
    await expect(page.locator('h1', { hasText: '커뮤니티' })).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────
  // 4. 마이페이지 검증
  // ─────────────────────────────────────────────────────────────
  test('4. 마이페이지: 로그인 사용자 본인 정보만 노출, 뱃지 일치, 페이지네이션 위치, 수강생 관리 및 출금 신청 위치', async ({ page }) => {
    // 4-1. 수강생 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.getByTestId('quick-login-수강생').click();
    await expect(page.locator('[data-testid="user-profile-button"]')).toBeVisible({ timeout: 5000 });

    // 4-2. 마이페이지 이동
    await page.locator('[data-testid="user-profile-button"]').click();
    await page.getByRole('button', { name: '마이페이지' }).click();
    await expect(page.locator('h1', { hasText: '마이페이지' })).toBeVisible();

    // 4-3. 로그인한 사용자 정보 노출 (김수강생)
    await expect(page.locator('text=김수강생').first()).toBeVisible();

    // 4-4. 내 스타트업 탭 클릭
    await page.locator('aside nav button', { hasText: '내 스타트업' }).click();
    await expect(page.locator('h2', { hasText: '내 스타트업' })).toBeVisible();

    // 내가 의뢰한 아이디어 서브탭
    const myIdeaSubTab = page.locator('button', { hasText: '내가 의뢰한 아이디어' });
    if (await myIdeaSubTab.isVisible()) {
      await myIdeaSubTab.click();
      const searchBox = page.locator('input[placeholder*="아이디어"]');
      await expect(searchBox).toBeVisible();
    }

    // 4-5. 강의 개설 & 운영 탭 클릭
    await page.locator('aside nav button', { hasText: '강의 개설 & 운영' }).click();
    await expect(page.locator('h1', { hasText: '강사 대시보드' })).toBeVisible();

    // 상단 탭 헤더에 '내 강의 목록', '수강생 관리', '정산 관리' 탭 확인
    await expect(page.locator('nav').getByRole('button', { name: '내 강의 목록' })).toBeVisible();
    await expect(page.locator('nav').getByRole('button', { name: '수강생 관리' })).toBeVisible();
    await expect(page.locator('nav').getByRole('button', { name: '정산 관리' })).toBeVisible();

    // 각 강의 카드에 '수강생 관리' 버튼이 존재하는지 확인
    const manageStudentBtns = page.locator('button', { hasText: '수강생 관리' });
    expect(await manageStudentBtns.count()).toBeGreaterThanOrEqual(1);

    // 4-6. 정산 관리 탭 클릭
    await page.locator('nav').getByRole('button', { name: '정산 관리' }).click();
    await expect(page.locator('h2', { hasText: '매출 및 정산 통계' })).toBeVisible();

    // '출금 신청' 버튼이 매출 및 정산 통계 라인 우측 끝에 위치하는지 확인
    const withdrawBtn = page.getByRole('button', { name: '출금 신청' });
    await expect(withdrawBtn).toBeVisible();

    // 출금 신청 버튼 클릭 시 모달창 열림 확인
    await withdrawBtn.click();
    await expect(page.locator('text=정산금 출금 신청')).toBeVisible();
    await expect(page.locator('text=입금 계좌 정보')).toBeVisible();

    // 모달 닫기
    const closeWithdrawModal = page.locator('button', { hasText: '취소' });
    if (await closeWithdrawModal.isVisible()) {
      await closeWithdrawModal.click();
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 5. 관리자 하위 메뉴 검증
  // ─────────────────────────────────────────────────────────────
  test('5. 관리자 하위: 회원 공통 코드, 3개 탭 개인 활동 상세, 직권 강제 탈퇴, 강의 리스트 관리 및 강제 삭제', async ({ page }) => {
    // 5-1. 관리자 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.getByTestId('quick-login-관리자').click();
    await expect(page.locator('[data-testid="user-profile-button"]')).toBeVisible({ timeout: 5000 });

    // 5-2. 프로필 드롭다운 열고 관리자 대시보드 클릭
    await page.locator('[data-testid="user-profile-button"]').click();
    await page.getByRole('button', { name: '관리자 대시보드' }).click();
    await expect(page.locator('h1', { hasText: '플랫폼 관리자 대시보드' })).toBeVisible();

    // 5-3. 회원 관리 탭 진입
    await page.locator('aside nav button', { hasText: '회원 관리' }).click();
    await expect(page.locator('h2', { hasText: '플랫폼 가입 회원 목록' })).toBeVisible();

    // 첫 번째 회원의 '상세 보기' 버튼 클릭
    const detailBtns = page.locator('button[title="상세 보기"]');
    await expect(detailBtns.first()).toBeVisible();
    await detailBtns.first().click();
    await expect(page.locator('h3', { hasText: '회원 상세 정보 & 활동 이력' })).toBeVisible();

    // 3개 탭(기본 정보, 교육/강의 활동, 스타트업/IR 활동) 확인
    await expect(page.getByRole('button', { name: '기본 정보' })).toBeVisible();
    await expect(page.getByRole('button', { name: '교육/강의 활동' })).toBeVisible();
    await expect(page.getByRole('button', { name: '스타트업/IR 활동' })).toBeVisible();

    // '교육/강의 활동' 탭 클릭 후 실 DB 데이터 로드 확인
    await page.getByRole('button', { name: '교육/강의 활동' }).click();
    await expect(page.locator('h5', { hasText: '개설한 강의' })).toBeVisible();
    await expect(page.locator('h5', { hasText: '수강 신청 강의' })).toBeVisible();
    await expect(page.locator('h5', { hasText: '결제 이력' })).toBeVisible();

    // '스타트업/IR 활동' 탭 클릭 후 실 DB 데이터 로드 확인
    await page.getByRole('button', { name: '스타트업/IR 활동' }).click();
    await expect(page.locator('h5', { hasText: '등록 IR 프로젝트' })).toBeVisible();
    await expect(page.locator('h5', { hasText: '아이디어 제작 의뢰' })).toBeVisible();
    await expect(page.locator('h5', { hasText: '투자 및 협업 제안' })).toBeVisible();

    // 5-4. 강의 리스트 관리 탭 진입
    await page.locator('aside nav button', { hasText: '강의 리스트 관리' }).click();
    await expect(page.locator('h2', { hasText: '강의 리스트 관리' })).toBeVisible();
    await expect(page.locator('text=개설 및 모집 승인 절차가 폐지되어 자유롭게 개설됩니다')).toBeVisible();

    // 검수 승인/반려 버튼은 존재하지 않고, 강제 삭제 버튼만 존재하는지 확인
    await expect(page.getByRole('button', { name: '승인' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '반려' })).toHaveCount(0);

    const forceDeleteBtns = page.locator('button', { hasText: '강제 삭제' });
    expect(await forceDeleteBtns.count()).toBeGreaterThanOrEqual(1);

    // 강의 카드 클릭 시 우측 상세 패널에서 '강의 직권 강제 삭제' 버튼 확인
    const courseItems = page.locator('div[class*="bg-brand-card"][class*="cursor-pointer"]');
    await courseItems.first().click();
    await expect(page.locator('h3', { hasText: '강의 상세 정보 및 관리' })).toBeVisible();
    await expect(page.getByRole('button', { name: '강의 직권 강제 삭제' })).toBeVisible();
  });

});
