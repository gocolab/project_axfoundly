import { test, expect } from "@playwright/test";

test.describe("수정 관련 모달창 보완 및 아이디어/커뮤니티 수정 기능 검증", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    // 1. 데스크톱 뷰포트 설정
    await page.setViewportSize({ width: 1280, height: 800 });

    // 2. 홈 화면 이동 후 관리자로 확실하게 로그인
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const userProfile = page.locator('[data-testid="user-profile-button"]');
    if (!(await userProfile.isVisible().catch(() => false))) {
      const loginBtn = page.getByRole("button", { name: "로그인", exact: true });
      if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await loginBtn.click();
        const quickLoginAdmin = page.locator(".glass-panel-heavy button", { hasText: "관리자" }).first();
        await expect(quickLoginAdmin).toBeVisible({ timeout: 5000 });
        await quickLoginAdmin.click();
        await expect(userProfile).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("1. 강의 상세 화면에서 '강의 수정' 클릭 시 모달창이 상세 화면 위에 정상 표시된다", async ({ page }) => {
    await page.goto("/courses");
    await page.waitForLoadState("networkidle");

    // 첫 번째 강의 카드 클릭
    const firstCourseCard = page.locator('[data-testid="course-card"]').first();
    await expect(firstCourseCard).toBeVisible({ timeout: 10000 });
    await firstCourseCard.click();

    // 상세 화면 진입 확인
    const backBtn = page.locator("button", { hasText: "강의 목록으로" });
    await expect(backBtn).toBeVisible({ timeout: 5000 });

    // "강의 수정" 버튼 클릭
    const editBtn = page.locator("button", { hasText: "강의 수정" });
    await expect(editBtn).toBeVisible({ timeout: 5000 });
    await editBtn.click();

    // 상세 화면 위에 CourseCreateEditModal이 즉시 표시되는지 확인
    const modal = page.locator(".glass-panel-heavy").filter({ hasText: /강의 기획|강의 정보|커리큘럼/ });
    await expect(modal.first()).toBeVisible({ timeout: 5000 });

    // 모달 닫기
    const closeBtn = page.locator(".glass-panel-heavy button").filter({ hasText: /닫기|취소/ }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  test("2. 스타트업 & IR 상세 화면에서 '수정' 클릭 시 모달창이 상세 화면 위에 정상 표시된다", async ({ page }) => {
    await page.goto("/ir");
    await page.waitForLoadState("networkidle");

    // 첫 번째 프로젝트 카드 클릭
    const firstProject = page.locator('[data-testid="project-card"]').first();
    await expect(firstProject).toBeVisible({ timeout: 10000 });
    await firstProject.click();

    // 상세 화면 진입 확인 ("스타트업 목록으로" 버튼 노출)
    const backBtn = page.locator("button", { hasText: "스타트업 목록으로" });
    await expect(backBtn).toBeVisible({ timeout: 5000 });

    // "수정" 버튼 클릭
    const editBtn = page.locator("button", { hasText: "수정" }).first();
    await expect(editBtn).toBeVisible({ timeout: 5000 });
    await editBtn.click();

    // 상세 화면 위에 ProjectCreateEditModal이 즉시 표시되는지 확인
    const modal = page.locator(".glass-panel-heavy").filter({ hasText: /프로젝트|스타트업/ });
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
  });

  test("3. 아이디어 제작 요청소: '공감순' 정렬 버튼 제거 및 '수정' 버튼/모달 동작 검증", async ({ page }) => {
    await page.goto("/ir");
    await page.waitForLoadState("networkidle");

    // '아이디어 제작 요청소' 탭 클릭
    const ideaTab = page.locator("button", { hasText: "아이디어 제작 요청소" });
    await ideaTab.click();
    await page.waitForTimeout(500);

    // '공감순' 정렬 버튼이 완전히 제거되었는지 확인
    const popularSortBtn = page.locator("button", { hasText: "🔥 공감순" });
    await expect(popularSortBtn).toHaveCount(0);

    // 마감일순, 최신순 버튼은 여전히 존재하는지 확인
    await expect(page.locator("button", { hasText: /마감일순/ })).toBeVisible();
    await expect(page.locator("button", { hasText: /최신순/ })).toBeVisible();

    // 첫 번째 의뢰서 카드 클릭하여 우측 상세 슬라이드인 패널 오픈
    const firstReqCard = page.locator('[data-testid="idea-request-card"]').first();
    await expect(firstReqCard).toBeVisible({ timeout: 5000 });
    await firstReqCard.click();

    // 우측 상세 패널 헤더의 '수정' 버튼 확인
    const editReqBtn = page.locator("button[title='의뢰서 수정']");
    await expect(editReqBtn).toBeVisible({ timeout: 5000 });

    // '수정' 버튼 클릭
    await editReqBtn.click();

    // 아이디어 제작 의뢰서 수정 모달 표시 확인
    const editModalTitle = page.locator("h2", { hasText: "아이디어 제작 의뢰서 수정" });
    await expect(editModalTitle).toBeVisible({ timeout: 5000 });

    // 수정 완료 버튼 라벨 확인
    const submitBtn = page.locator("button[type='submit']", { hasText: "의뢰서 수정 완료" });
    await expect(submitBtn).toBeVisible();
  });

  test("4. 커뮤니티 상세: '수정' 버튼 노출 및 게시글 수정 모달 동작 검증", async ({ page }) => {
    await page.goto("/community");
    await page.waitForLoadState("networkidle");

    // 첫 번째 게시글 행 클릭하여 우측 상세 패널 오픈
    const firstPostRow = page.locator('[data-testid="community-post-row"]').first();
    await expect(firstPostRow).toBeVisible({ timeout: 5000 });
    await firstPostRow.click();

    // 상세 헤더에 '수정' 버튼 노출 확인
    const editPostBtn = page.locator("button[title='게시글 수정']");
    await expect(editPostBtn).toBeVisible({ timeout: 5000 });

    // '수정' 버튼 클릭
    await editPostBtn.click();

    // 게시글 수정 모달 노출 확인
    const modalTitle = page.locator("h3", { hasText: "게시글 수정" });
    await expect(modalTitle).toBeVisible({ timeout: 5000 });

    // 수정 완료 버튼 노출 확인
    const submitBtn = page.locator("button", { hasText: "수정 완료" });
    await expect(submitBtn).toBeVisible();
  });
});
