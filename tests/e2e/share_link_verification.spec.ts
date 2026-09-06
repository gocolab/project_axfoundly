import { test, expect } from "@playwright/test";

test.describe("상세 정보 화면 공유 링크 및 딥링크 E2E 검증", () => {
  test.beforeEach(async ({ page }) => {
    // navigator.clipboard 모킹
    await page.addInitScript(() => {
      let clipboardData = "";
      Object.assign(navigator, {
        clipboard: {
          writeText: async (text: string) => {
            clipboardData = text;
            return Promise.resolve();
          },
          readText: async () => Promise.resolve(clipboardData),
        },
      });
    });
  });

  test("1. 강의 상세 진입 시 URL 동기화, 공유 버튼, 목록 복귀 검증", async ({ page }) => {
    await page.goto("/courses");


    // 강의 카드 확인
    const courseCard = page.locator('[data-testid="course-card"]').first();
    await expect(courseCard).toBeVisible({ timeout: 10000 });

    // 카드 클릭
    await courseCard.click();

    // URL이 /courses/<id> 형식으로 변경되었는지 확인
    await expect(page).toHaveURL(/\/courses\/.+/);

    // 상세 헤더에 공유하기 버튼 확인 및 클릭
    const shareBtn = page.getByRole("button", { name: /공유하기/i });
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    // 토스트 알림 표시 확인
    await expect(page.locator("text=공유 링크 복사")).toBeVisible({ timeout: 5000 });

    // 강의 목록으로 복귀
    const backBtn = page.getByRole("button", { name: /강의 목록으로/i });
    await backBtn.click();

    // URL이 /courses로 복귀했는지 확인 (쿼리스트링 허용)
    await expect(page).toHaveURL(/\/courses(\?.*)?$/);
    await expect(courseCard).toBeVisible();
  });

  test("2. 강의 상세 딥링크 직접 URL 접속 검증", async ({ page }) => {
    // 딥링크 직접 접근
    await page.goto("/courses/c-1788680857973");

    // 상세 화면이 바로 열렸는지 확인
    const backBtn = page.getByRole("button", { name: /강의 목록으로/i });
    await expect(backBtn).toBeVisible({ timeout: 15000 });

    const shareBtn = page.getByRole("button", { name: /공유하기/i });
    await expect(shareBtn).toBeVisible();
  });

  test("3. IR 프로젝트 상세 URL 동기화, 공유 버튼, 목록 복귀 검증", async ({ page }) => {
    await page.goto("/ir");


    // 프로젝트 카드 확인
    const projectCard = page.locator('[data-testid="project-card"]').first();
    await expect(projectCard).toBeVisible({ timeout: 10000 });

    // 카드 클릭
    await projectCard.click();

    // URL이 /ir/<id> 형식으로 변경되었는지 확인
    await expect(page).toHaveURL(/\/ir\/.+/);

    // 상세 헤더에 공유하기 버튼 확인 및 클릭
    const shareBtn = page.getByRole("button", { name: /공유하기/i });
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    // 토스트 알림 확인
    await expect(page.locator("text=공유 링크 복사")).toBeVisible({ timeout: 5000 });

    // 스타트업 목록으로 복귀
    const backBtn = page.getByRole("button", { name: /스타트업 목록으로/i });
    await backBtn.click();

    // URL이 /ir로 복귀했는지 확인
    await expect(page).toHaveURL(/\/ir(\?.*)?$/);
    await expect(projectCard).toBeVisible();
  });

  test("4. 커뮤니티 게시글 상세 URL 동기화 및 공유 버튼 검증", async ({ page }) => {
    await page.goto("/community");


    // 게시글 행 클릭
    const postRow = page.locator("tbody tr, div[data-testid='post-card']").first();
    if (await postRow.isVisible()) {
      await postRow.click();

      // URL이 /community/<id>로 변경되었는지 확인
      await expect(page).toHaveURL(/\/community\/.+/);

      // 공유 버튼 확인
      const shareBtn = page.getByRole("button", { name: /공유/i }).first();
      await expect(shareBtn).toBeVisible();
      await shareBtn.click();

      // 토스트 알림 확인
      await expect(page.locator("text=공유 링크 복사")).toBeVisible({ timeout: 5000 });
    }
  });
});
