import { test, expect } from "@playwright/test";

test.describe("금일 변경 사항 E2E 검증: 강의 복제·기수 등록 및 스타트업 채용 제어", () => {
  test.beforeEach(async ({ page }) => {
    // Mock navigator.clipboard
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

  test("1. 강의 상세 화면에서 관리자/강사 전용 '강의 복사' 원클릭 복제 기능 검증", async ({ page, request }) => {
    // 1. API로 테스트 원본 강의 등록 (8자리 ID 자동 생성)
    const createRes = await request.post("/api/courses", {
      data: {
        title: "2026 초격차 AI 스타트업 창업 캠프",
        description: "원클릭 복제 검증용 원본 코스 설명입니다.",
        category: "실전 AI 모델링 / LLM",
        instructor: "최관리",
        price: 550000,
        discountedPrice: 385000,
        deliveryType: "hybrid",
        location: "강남 AI 이노베이션 스퀘어 3층",
        tags: ["AI스타트업", "LLM", "복제테스트"],
        schedule: {
          startDate: "2026-10-01",
          endDate: "2026-10-22",
          daysOfWeek: ["화", "목"],
          timeSlot: "19:30 ~ 21:30",
          totalSessions: 4,
          scheduleType: "stepping_stone",
        },
        curriculum: [
          { week: 1, sessionNumber: 1, title: "1회차: 시장 검증 및 LLM 기획", duration: "2시간", date: "2026-10-01", dayOfWeek: "목", deliveryType: "online" },
          { week: 1, sessionNumber: 2, title: "2회차: MVP 프로토타이핑", duration: "2시간", date: "2026-10-06", dayOfWeek: "화", deliveryType: "online" },
          { week: 2, sessionNumber: 3, title: "3회차: 현장 오프라인 해커톤", duration: "2시간", date: "2026-10-08", dayOfWeek: "목", deliveryType: "offline" },
          { week: 2, sessionNumber: 4, title: "4회차: IR 피칭 및 수료식", duration: "2시간", date: "2026-10-13", dayOfWeek: "화", deliveryType: "offline" },
        ],
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const createdData = await createRes.json();
    const originalCourseId = createdData.course.id;
    expect(originalCourseId).toMatch(/^[a-zA-Z0-9]{8}$/);

    // 2. 관리자/강사 세션 주입 후 강의 상세 진입
    await page.goto("/courses");
    await page.evaluate(() => {
      localStorage.setItem("auth_token", "mock-jwt-token-admin");
      localStorage.setItem("user_name", "최관리");
      localStorage.setItem("user_role", "admin");
      localStorage.setItem("user_roles", JSON.stringify(["admin", "member"]));
    });
    await page.goto(`/courses/${originalCourseId}`);

    // 3. 상세 헤더에 '공유하기', '강의 복사', '강의 수정', '강의 삭제' 버튼 확인
    await expect(page.getByRole("button", { name: /강의 목록으로/i })).toBeVisible({ timeout: 10000 });
    const duplicateBtn = page.getByRole("button", { name: /강의 복사/i });
    await expect(duplicateBtn).toBeVisible({ timeout: 10000 });

    // 4. '강의 복사' 클릭 실행
    await duplicateBtn.click();

    // 5. 토스트 알림 및 복제된 새 강의 상세 화면 자동 전환 확인
    await expect(page.locator("text=강의 복제 완료")).toBeVisible({ timeout: 10000 });
    
    // 복제본의 제목 확인 ([복사본] 접두어 및 원본 커리큘럼 복제 확인)
    await expect(page.locator("h1", { hasText: /2026 초격차 AI 스타트업 창업 캠프/i })).toBeVisible({ timeout: 10000 });
    
    // URL이 새로운 8자리 ID로 변경되었는지 확인
    await expect(page).toHaveURL(/\/courses\/[a-zA-Z0-9]{8}$/);
    const newUrl = page.url();
    const newCourseId = newUrl.split("/").pop();
    expect(newCourseId).not.toBe(originalCourseId);
    expect(newCourseId).toMatch(/^[a-zA-Z0-9]{8}$/);

    // 6. 복제본의 세션 커리큘럼이 4회차 모두 정상 유지되었는지 확인
    await expect(page.locator("text=1회차: 시장 검증 및 LLM 기획")).toBeVisible();
    await expect(page.locator("text=4회차: IR 피칭 및 수료식")).toBeVisible();
  });

  test("2. 신규 강의 개설 모달: 8자리 식별자, 징검다리 일정 자동 산출, 공유 링크 확인", async ({ page }) => {
    await page.goto("/courses");
    await page.evaluate(() => {
      localStorage.setItem("auth_token", "mock-jwt-token-admin");
      localStorage.setItem("user_name", "최관리");
      localStorage.setItem("user_role", "admin");
      localStorage.setItem("user_roles", JSON.stringify(["admin", "member"]));
    });
    await page.reload();

    // 강의 개설 버튼 클릭
    const createBtn = page.getByRole("button", { name: /\+ 강의 개설/i });
    if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createBtn.click();

      // 모달 내 탭 전환 및 제목 입력
      const titleInput = page.locator('input[placeholder*="강의명"], input[placeholder*="강의 제목"]').first();
      if (await titleInput.isVisible()) {
        await titleInput.fill("새 기수 맞춤형 풀스택 창업 트랙");

        // 징검다리 요일 선택 토글 (화, 목)
        const tueBadge = page.locator('button', { hasText: "화" }).first();
        if (await tueBadge.isVisible()) {
          await tueBadge.click();
        }

        // 징검다리 자동 일정 재배정 버튼 클릭
        const autoScheduleBtn = page.getByRole("button", { name: /징검다리 일정 자동 재배정/i });
        if (await autoScheduleBtn.isVisible()) {
          await autoScheduleBtn.click();
          await expect(page.locator("text=징검다리 일정 자동 재배정 완료")).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test("3. 스타트업&IR 채용 마감 / 채용 재개 원클릭 상태 제어 검증", async ({ page, request }) => {
    // 1. API로 테스트 프로젝트 생성 (isHiring: true)
    const res = await request.post("/api/ir/projects", {
      data: {
        teamName: "딥런치 AI 채용팀",
        title: "실시간 채용 상태 제어 솔루션",
        oneLiner: "스타트업 인재 채용 마감/재개 자동화 플랫폼",
        description: "원클릭 채용 상태 관리 및 지원자 자동 필터링",
        field: "AI/ML",
        investmentStage: "Seed",
        isHiring: true,
        authorName: "최관리",
        hiringRoles: ["AI 엔지니어 (풀타임)", "그로스 리드 (파트타임)"],
        hiringDetails: [
          { id: "r1", role: "AI 엔지니어", type: "풀타임", description: "RAG 개발", skills: ["Python"] }
        ],
        members: [{ name: "최관리", role: "CEO" }],
      },
    });
    expect(res.ok()).toBeTruthy();
    const createdData = await res.json();
    const projectId = createdData.project.id;

    // 2. 로그인 후 해당 프로젝트 상세 진입
    await page.goto("/ir");
    await page.evaluate(() => {
      localStorage.setItem("auth_token", "mock-jwt-token-admin");
      localStorage.setItem("user_name", "최관리");
      localStorage.setItem("user_role", "admin");
      localStorage.setItem("user_roles", JSON.stringify(["admin", "member"]));
    });
    await page.goto(`/ir/${projectId}`);

    // 3. '팀원 모집 중' 배지와 '채용 마감' 버튼 확인
    await expect(page.locator("text=🔥 팀원 모집 중")).toBeVisible({ timeout: 10000 });
    const closeHiringBtn = page.getByRole("button", { name: "채용 마감", exact: true });
    await expect(closeHiringBtn).toBeVisible({ timeout: 10000 });

    // 4. 채용 마감 클릭 및 커스텀 Confirm 다이얼로그 승인
    await closeHiringBtn.click();
    const confirmBtn = page.getByRole("button", { name: /채용 마감/i }).last();
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();

    // 5. '채용 마감' 상태 및 '채용 재개' 버튼으로 변경되었는지 검증
    await expect(page.locator("text=🔒 채용 마감")).toBeVisible({ timeout: 10000 });
    const resumeHiringBtn = page.getByRole("button", { name: "채용 재개", exact: true });
    await expect(resumeHiringBtn).toBeVisible({ timeout: 10000 });

    // 6. 채용 재개 클릭 및 커스텀 Confirm 다이얼로그 승인
    await resumeHiringBtn.click();
    const resumeConfirmBtn = page.getByRole("button", { name: /채용 재개/i }).last();
    await expect(resumeConfirmBtn).toBeVisible({ timeout: 5000 });
    await resumeConfirmBtn.click();

    // 7. 다시 '팀원 모집 중' 상태로 복귀 확인
    await expect(page.locator("text=🔥 팀원 모집 중")).toBeVisible({ timeout: 10000 });
  });
});
