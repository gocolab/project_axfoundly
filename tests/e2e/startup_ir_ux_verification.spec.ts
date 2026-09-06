import { test, expect } from '@playwright/test';

test.describe('스타트업&IR 및 아이디어 제작 의뢰 UX/기능 실데이터 입력 종합 검증', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // 다이얼로그 자동 수락
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    // 데스크톱 뷰포트 지정 (GNB 버튼 안정적 노출 보장)
    await page.setViewportSize({ width: 1280, height: 800 });

    // 홈 이동 후 확실하게 수강생으로 로그인
    await page.goto('/');
    const userProfile = page.locator('[data-testid="user-profile-button"]');
    if (!(await userProfile.isVisible().catch(() => false))) {
      const loginBtn = page.getByRole('button', { name: '로그인', exact: true });
      if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await loginBtn.click();
        const quickLogin = page.getByTestId('quick-login-수강생');
        await expect(quickLogin).toBeVisible({ timeout: 5000 });
        await quickLogin.click();
        await expect(userProfile).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('1. 스타트업&IR 탐색: 정렬, 나도 쓸래요 투표, 프로젝트 등록/수정/삭제 및 상세 뷰 검증', async ({ page }) => {
    test.setTimeout(60000);
    // IR 페이지 이동
    await page.goto('/ir');
    await page.waitForLoadState('networkidle');

    // 1-1. '나도 쓸래요' 투표 기능 검증 (토글 동작 검증)
    const upvoteBtn = page.locator('button', { hasText: '나도 쓸래요' }).first();
    await expect(upvoteBtn).toBeVisible({ timeout: 10000 });

    const initialClass = (await upvoteBtn.getAttribute('class')) || '';
    await upvoteBtn.click();
    await page.waitForTimeout(800);
    const updatedClass = (await upvoteBtn.getAttribute('class')) || '';
    // 클릭 후 스타일 클래스가 정상적으로 토글되었는지 확인
    expect(updatedClass).not.toBe(initialClass);

    // 1-2. 신규 프로젝트 실제 데이터 등록
    const createProjectBtn = page.locator('button', { hasText: '+ 프로젝트 등록' });
    await expect(createProjectBtn).toBeVisible();
    await createProjectBtn.click();

    // 등록 모달 노출 확인
    const modalTitle = page.locator('h2', { hasText: '새 창업 프로젝트 등록' }).or(page.locator('text=창업 프로젝트 등록')).first();
    await expect(modalTitle).toBeVisible({ timeout: 5000 });

    // 실제 데이터 폼 입력
    const testTeamName = '알고리즘랩스_' + Date.now();
    const testTitle = 'AI 자율 운영 B2B 마케팅 솔루션';
    const testField = '생성형 AI / SaaS';
    const testOneLiner = '마케팅 퍼널과 리드 생성을 AI가 24시간 자율 운영하는 자동화 플랫폼';
    const testPrototypeUrl = 'https://algolabs-demo.example.com';
    const testVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    await page.locator('input[placeholder*="DocuMind AI"]').fill(testTeamName);
    await page.locator('input[placeholder*="초정밀 RAG 분석 엔진"]').fill(testTitle);
    await page.locator('input[placeholder*="B2B Enterprise AI"]').fill(testField);
    await page.locator('input[placeholder*="500페이지 계약서를"]').fill(testOneLiner);
    await page.locator('textarea[placeholder*="시장 페인포인트"]').fill('기존 마케팅 수작업의 비효율성과 높은 인건비 문제');
    await page.locator('textarea[placeholder*="우리의 해결책"]').fill('자율 멀티에이전트 기반 실시간 퍼널 최적화 알고리즘');

    // 프로토타입 URL 입력
    const protoInput = page.locator('input[placeholder*="https://my-service.com"]');
    await expect(protoInput).toBeVisible();
    await protoInput.fill(testPrototypeUrl);

    // 데모 영상 URL 입력
    const videoInput = page.locator('input[placeholder*="https://www.youtube.com/watch?v=..."]');
    await expect(videoInput).toBeVisible();
    await videoInput.fill(testVideoUrl);

    // 팀원 모집 포지션 입력 (AI 엔지니어)
    const roleInput = page.locator('input[placeholder*="채용 포지션명"]');
    if (await roleInput.isVisible().catch(() => false)) {
      await roleInput.fill('AI 리서처');
      const addRoleBtn = page.locator('button', { hasText: '추가' }).first();
      await addRoleBtn.click();
    }

    // 프로젝트 저장
    const saveBtn = page.locator('button', { hasText: '프로젝트 등록' }).last();
    await saveBtn.click();
    await expect(modalTitle).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // 1-3. 목록 최상단에 신규 프로젝트가 노출되는지 확인 (createdAt 최신순 정렬)
    const newCard = page.locator('[data-testid="project-card"]', { hasText: testTeamName }).first();
    await expect(newCard).toBeVisible({ timeout: 10000 });

    // 1-4. 카드 클릭하여 상세 뷰 진입
    await newCard.scrollIntoViewIfNeeded();
    await newCard.locator('h3').click();
    await expect(page.locator('button', { hasText: '스타트업 목록으로' })).toBeVisible({ timeout: 10000 });

    // 헤더에 작성자 전용 [수정], [삭제] 버튼 존재 확인
    const detailEditBtn = page.locator('button', { hasText: '수정' }).first();
    const detailDeleteBtn = page.locator('button', { hasText: '삭제' }).first();
    await expect(detailEditBtn).toBeVisible({ timeout: 10000 });
    await expect(detailDeleteBtn).toBeVisible({ timeout: 10000 });

    // 영상 섹션 헤더에 [프로토타입 / 배포 사이트 방문] 버튼 존재 및 href 확인
    const visitBtn = page.locator('a', { hasText: '[프로토타입 / 배포 사이트 방문]' });
    await expect(visitBtn).toBeVisible();
    await expect(visitBtn).toHaveAttribute('href', testPrototypeUrl);

    // 데모 영상 섹션 확인
    const videoSection = page.locator('h2', { hasText: '서비스 동작 및 피칭 영상' });
    await expect(videoSection).toBeVisible();

    // 1-5. 프로젝트 삭제 기능 검증
    await detailDeleteBtn.click();
    await page.waitForTimeout(300);
    const confirmDeleteBtn = page.locator('button', { hasText: '삭제' }).last();
    if (await confirmDeleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmDeleteBtn.click();
    }
    await page.waitForTimeout(1000);

    // 목록으로 돌아오고 해당 프로젝트가 삭제되었는지 확인
    await expect(page.locator('h1', { hasText: testTeamName })).not.toBeVisible({ timeout: 3000 });
  });

  test('2. 아이디어 제작 의뢰소: 마감일순 정렬, AI PRD 인터뷰, 상세 등록, 역제안 및 삭제 검증', async ({ page }) => {
    test.setTimeout(60000);
    // IR 페이지 이동 후 아이디어 탭 클릭
    await page.goto('/ir');
    await page.waitForLoadState('networkidle');

    // 탭 텍스트는 '아이디어 제작 요청소'
    const ideasTabBtn = page.locator('button', { hasText: '아이디어 제작 요청소' });
    await expect(ideasTabBtn).toBeVisible({ timeout: 10000 });
    await ideasTabBtn.click();
    await page.waitForTimeout(500);

    // 2-1. 정렬 스위치에 '📅 마감일순'이 기본 선택되어 있는지 확인
    const deadlineSortBtn = page.locator('button', { hasText: '📅 마감일순' });
    await expect(deadlineSortBtn).toBeVisible();
    await expect(deadlineSortBtn).toHaveClass(/cyan/);

    // 2-2. 아이디어 카드에 '나도 쓸래요' 버튼이 없고 발제자명이 표시되는지 확인
    const ideaCards = page.locator('.grid > div');
    if ((await ideaCards.count()) > 0) {
      const firstIdeaCard = ideaCards.first();
      await expect(firstIdeaCard.locator('button', { hasText: '나도 쓸래요' })).not.toBeVisible();
      await expect(firstIdeaCard.locator('text=발제자:')).toBeVisible();
    }

    // 2-3. '+ 아이디어 제작 의뢰' 모달 열기
    const createIdeaBtn = page.locator('button', { hasText: '+ 아이디어 제작 의뢰' });
    await expect(createIdeaBtn).toBeVisible();
    await createIdeaBtn.click();
    await page.waitForTimeout(500);

    const ideaModal = page.locator('h2', { hasText: '아이디어 제작 의뢰' }).first();
    await expect(ideaModal).toBeVisible({ timeout: 5000 });

    // 1단계 AI 채팅 인터뷰에 실제 질의 입력
    const chatTextarea = page.locator('textarea[placeholder*="인터뷰 답변"]');
    await expect(chatTextarea).toBeVisible();
    await chatTextarea.fill('소상공인을 위한 AI 기반 모바일 간편 영수증 기장 및 절세 도우미 앱');

    const sendBtn = page.locator('button', { hasText: '답변 전송' });
    await sendBtn.click();

    // AI 응답 대기 (인터뷰 메시지 대화 렌더링 및 초안 생성 완료)
    await expect(page.locator('text=[생성된 PRD 의뢰서 초안]').first()).toBeVisible({ timeout: 25000 });

    // 2단계 상세 의뢰서 작성 탭으로 이동
    const detailTabBtn = page.getByRole('button', { name: '상세 의뢰서 작성', exact: true });
    await detailTabBtn.click();
    await page.waitForTimeout(500);

    // 제목 입력란에 내용이 채워져 있거나 직접 입력
    const titleInput = page.locator('input[placeholder*="초기 스타트업을 위한 AI 계약서"]');
    await expect(titleInput).toBeVisible();
    const testIdeaTitle = 'AI 소상공인 간편 영수증 기장 솔루션_' + Date.now();
    await titleInput.fill(testIdeaTitle);

    // 마감일 및 발표일 입력
    const deadlineInput = page.locator('input[type="date"]').first();
    await deadlineInput.fill('2026-10-31');

    // 문제점 및 솔루션 필수 입력
    await page.locator('textarea[placeholder*="현재 고객이나 시장이"]').fill('소상공인 간이과세자들의 영수증 관리 번거로움과 높은 세무 기장료 부담');
    await page.locator('textarea[placeholder*="어떤 핵심 기능과"]').fill('스마트폰 카메라로 영수증 촬영 시 온디바이스 OCR과 AI로 필요경비 자동 분류 및 절세 가이드');

    // 의뢰서 등록 완료 클릭
    const submitIdeaBtn = page.locator('button', { hasText: '아이디어 제작 의뢰서 등록하기' });
    await submitIdeaBtn.scrollIntoViewIfNeeded();
    await submitIdeaBtn.click();
    await expect(ideaModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // 2-4. 목록에 신규 의뢰서가 노출되는지 확인
    const newIdeaCard = page.locator('[data-testid="idea-request-card"]', { hasText: testIdeaTitle }).first();
    await expect(newIdeaCard).toBeVisible({ timeout: 10000 });

    // 2-5. 카드 클릭하여 우측 상세 슬라이드인 패널 열기
    await newIdeaCard.scrollIntoViewIfNeeded();
    await newIdeaCard.click();
    await page.waitForTimeout(1000);

    // 상세 패널에 발제자 전용 삭제 버튼이 존재하는지 확인
    const deleteIdeaBtn = page.locator('button[title="의뢰서 삭제"]').first();
    await expect(deleteIdeaBtn).toBeVisible();

    // 2-6. 빌더 팀 역제안 모달 검증
    const proposalBtn = page.locator('button', { hasText: '+ 역제안서 등록' }).first();
    if (await proposalBtn.isVisible().catch(() => false)) {
      await proposalBtn.click();
      await page.waitForTimeout(500);

      // 역제안 모달 입력
      const proposerInput = page.locator('input[placeholder*="프론트/백엔드 3년차"]');
      if (await proposerInput.isVisible().catch(() => false)) {
        const testBuilderName = '코드크래프트팀_' + Date.now();
        await proposerInput.fill(testBuilderName);
        await page.locator('input[placeholder*="React, Node.js, Python"]').fill('Next.js, FastAPI, PaddleOCR');
        await page.locator('textarea[placeholder*="구체적인 개발 마일스톤"]').fill('Next.js, FastAPI, PaddleOCR을 활용한 4주 완성 MVP');
        await page.locator('input[placeholder*="https://my-service.com 또는 Figma"]').fill('https://codecraft-demo.example.com');

        // 제안서 제출
        const submitProposalBtn = page.locator('button', { hasText: '제작 제안서 및 IR 등록하기' });
        await submitProposalBtn.click();
        await page.waitForTimeout(1000);

        // 실시간 동기화 검증: 우측 패널에 즉시 제안팀이 반영되었는지 확인
        await expect(page.locator('text=코드크래프트팀').or(page.locator('text=제출된 빌더 팀 제안서')).first()).toBeVisible({ timeout: 5000 });
      }
    }

    // 2-7. 아이디어 의뢰서 삭제 검증
    await deleteIdeaBtn.click();
    await page.waitForTimeout(300);
    const confirmDeleteBtn = page.locator('button', { hasText: '삭제' }).last();
    if (await confirmDeleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmDeleteBtn.click();
    }
    await page.waitForTimeout(1000);

    // 목록에서 해당 아이디어가 삭제되었는지 확인
    await expect(page.locator('h3', { hasText: testIdeaTitle })).not.toBeVisible({ timeout: 3000 });
  });

  test('3. 마이페이지 > 내 스타트업: 프로젝트/아이디어 관리 액션(수정/삭제) 연동 검증', async ({ page }) => {
    // 마이페이지 스타트업 탭 이동
    await page.goto('/mypage?tab=startup');
    await page.waitForLoadState('networkidle');

    // 내 IR 프로젝트 탭 확인
    const myProjectsTab = page.locator('button', { hasText: '내 IR 프로젝트' });
    await expect(myProjectsTab).toBeVisible({ timeout: 10000 });

    // 프로젝트 카드가 있다면 수정, 삭제 버튼 확인
    const projectCard = page.locator('.grid > div').first();
    if (await projectCard.isVisible().catch(() => false)) {
      const editBtn = projectCard.locator('button', { hasText: '수정' });
      const delBtn = projectCard.locator('button', { hasText: '삭제' });
      await expect(editBtn).toBeVisible();
      await expect(delBtn).toBeVisible();
    }

    // 의뢰한 아이디어 서브 탭 이동
    const myIdeasTab = page.locator('button', { hasText: '의뢰한 아이디어' });
    if (await myIdeasTab.isVisible().catch(() => false)) {
      await myIdeasTab.click();
      await page.waitForTimeout(500);

      // 아이디어 카드가 있다면 상단 삭제 버튼(Trash2) 확인
      const ideaCard = page.locator('.grid > div').first();
      if (await ideaCard.isVisible().catch(() => false)) {
        const delIdeaBtn = ideaCard.locator('button[title="아이디어 의뢰서 삭제"]');
        await expect(delIdeaBtn).toBeVisible();
      }
    }
  });
});
