import { test, expect } from '../setup/anomaly-fixture';

test.describe('프론트엔드 동작 및 이상 여부 판단 통합 테스트', () => {

  // -------------------------------------------------------------
  // [1. 정상 시나리오 검증: HTML 렌더링 + 인터랙션 + 무결성]
  // -------------------------------------------------------------
  test('1. [정상 동작] 메인 페이지 로드, HTML 렌더링 및 인터랙션 시 이상(에러, 백화, 요청실패)이 없다', async ({ page, tracker }) => {
    await page.goto('/');

    // 1-1. 화면 백화(White-out) 여부 검증
    await tracker.assertNoWhiteout('#root');

    // 1-2. 필수 HTML 시맨틱 요소 렌더링 확인
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    // 1-3. 핵심 비즈니스 텍스트 렌더링 확인
    const heroTitle = page.locator('text=AI로 빠르게 창업하라');
    await expect(heroTitle).toBeVisible();

    // 1-4. 사용자 클릭 인터랙션 및 모달 상태 변화 검증
    const signupBtn = page.getByRole('button', { name: '무료 가입하기' });
    await expect(signupBtn).toBeVisible();
    await signupBtn.click();

    // 모달 헤더 오픈 확인
    const modalHeader = page.locator('.glass-panel-heavy h2');
    await expect(modalHeader).toBeVisible();
    await expect(modalHeader).toHaveText('로그인');

    // 모달 닫기 버튼 클릭
    const closeBtn = page.locator('.glass-panel-heavy button:has(svg.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }

    // 1-5. 자동 테어다운(Teardown)에서 콘솔 에러 0건, 런타임 예외 0건, 네트워크 실패 0건 자동 검증
  });

  // -------------------------------------------------------------
  // [2. 이상 감지 기능 검증: 화면 백화(White-out) 감지]
  // -------------------------------------------------------------
  test('2. [이상 감지] DOM 노드가 소실되어 화면 백화가 발생하면 감지하여 실패 처리한다', async ({ page, tracker }) => {
    await page.goto('/');
    await tracker.assertNoWhiteout('#root');

    // 고의로 #root 내부의 모든 DOM 노드를 삭제하여 백화 현상 시뮬레이션
    await page.evaluate(() => {
      const root = document.getElementById('root');
      if (root) root.innerHTML = '';
    });

    // assertNoWhiteout이 백화 현상을 올바르게 탐지하고 에러를 발생하는지 확인
    let whiteoutDetected = false;
    try {
      await tracker.assertNoWhiteout('#root');
    } catch (e: any) {
      whiteoutDetected = true;
      expect(e.message).toContain('화면 백화(White-out) 감지');
    }

    expect(whiteoutDetected, '화면 백화 현상이 탐지되어야 합니다.').toBe(true);
  });

  // -------------------------------------------------------------
  // [3. 이상 감지 기능 검증: 런타임 JavaScript 예외 감지]
  // -------------------------------------------------------------
  test('3. [이상 감지] 브라우저 Uncaught Exception 및 console.error 발생 시 즉시 포착한다', async ({ page, tracker }) => {
    // 본 테스트는 고의로 에러를 유발하므로 테스트 종료 시 자동 assertion은 비활성화
    tracker.setStrictMode(false);

    await page.goto('/');

    // 브라우저 내부에서 콘솔 에러 및 비동기 미처리 예외(Uncaught Exception) 발생 시뮬레이션
    await page.evaluate(() => {
      console.error('[테스트 시뮬레이션] React 컴포넌트 렌더링 경고/에러 발생');
      setTimeout(() => {
        throw new Error('Uncaught TypeError: Cannot read properties of undefined (reading "title")');
      }, 50);
    });

    // 에러 수집 대기
    await page.waitForTimeout(200);

    const logs = tracker.getLogs();
    
    // 콘솔 에러 포착 확인
    expect(logs.consoleErrors.length).toBeGreaterThan(0);
    expect(logs.consoleErrors[0]).toContain('[테스트 시뮬레이션] React 컴포넌트 렌더링 경고/에러 발생');

    // 런타임 Uncaught 예외 포착 확인
    expect(logs.pageErrors.length).toBeGreaterThan(0);
    expect(logs.pageErrors[0]).toContain('Cannot read properties of undefined');
  });

  // -------------------------------------------------------------
  // [4. 이상 감지 기능 검증: 네트워크 요청 실패 감지]
  // -------------------------------------------------------------
  test('4. [이상 감지] 연결 불가능한 네트워크 요청 실패(Connection Refused / Aborted)를 감지한다', async ({ page, tracker }) => {
    tracker.setStrictMode(false);

    await page.goto('/');

    // 도달할 수 없는 포트로 fetch 요청하여 네트워크 실패(requestfailed) 유도
    await page.evaluate(() => {
      fetch('http://127.0.0.1:59999/api/unreachable-resource').catch(() => {
        // 브라우저 fetch catch
      });
    });

    // 네트워크 실패 이벤트 대기
    await page.waitForTimeout(300);

    const logs = tracker.getLogs();
    const hasFailedRequest = logs.failedRequests.some(req => req.includes('59999'));
    
    // requestfailed가 정상적으로 수집되었는지 확인
    expect(hasFailedRequest, '연결 실패 요청이 이상 로그로 감지되어야 합니다.').toBe(true);
  });

  // -------------------------------------------------------------
  // [5. 라우팅 및 HTML 렌더링 무결성 검증]
  // -------------------------------------------------------------
  test('5. [라우팅 무결성] 주요 네비게이션(교육/강의, 스타트업/IR, 커뮤니티) 전환 시 렌더링 무결성 확인', async ({ page, tracker }) => {
    await page.goto('/');

    const routes = [
      { name: '교육/강의', expectedHeader: '교육 / 강의' },
      { name: '스타트업/IR', expectedHeader: '스타트업 & IR' },
      { name: '커뮤니티', expectedHeader: '커뮤니티' },
    ];

    const nav = page.locator('header nav');

    for (const route of routes) {
      const navBtn = nav.getByRole('button', { name: route.name, exact: true });
      await expect(navBtn).toBeVisible();
      await navBtn.click();

      // 페이지 전환 후 백화 검사
      await tracker.assertNoWhiteout('#root');

      // 헤더 h1 렌더링 확인
      const header = page.locator('h1').first();
      await expect(header).toBeVisible();
      await expect(header).toContainText(route.expectedHeader);
    }
  });

});
