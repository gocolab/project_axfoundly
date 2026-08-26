import { test as base, expect, Page } from '@playwright/test';

/**
 * 프론트엔드 런타임 이상 로그 인터페이스
 */
export interface AnomalyLogs {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  serverErrors: { status: number; url: string; method: string }[];
}

/**
 * 이상 감지 추적기 클래스
 */
export class AnomalyTracker {
  private logs: AnomalyLogs = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    serverErrors: [],
  };

  private allowedConsolePatterns: (RegExp | string)[] = [];
  private allowedRequestPatterns: (RegExp | string)[] = [];
  private isStrictMode: boolean = true;

  constructor(private page: Page) {
    this.attachListeners();
  }

  private attachListeners() {
    // 1. 브라우저 콘솔 에러 리스너 (console.error)
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        const isAllowed = this.allowedConsolePatterns.some((pattern) =>
          typeof pattern === 'string' ? text.includes(pattern) : pattern.test(text)
        );
        if (!isAllowed) {
          this.logs.consoleErrors.push(text);
        }
      }
    });

    // 2. 브라우저 미처리 JavaScript 예외 리스너 (Uncaught Exceptions / React Crash)
    this.page.on('pageerror', (exception) => {
      this.logs.pageErrors.push(exception.stack || exception.message || String(exception));
    });

    // 3. 네트워크 요청 실패 리스너 (Aborted, Connection Refused, DNS 실패 등)
    this.page.on('requestfailed', (request) => {
      const url = request.url();
      const failureText = request.failure()?.errorText || 'Unknown network error';
      const isAllowed = this.allowedRequestPatterns.some((pattern) =>
        typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url)
      );
      if (!isAllowed) {
        this.logs.failedRequests.push(`${request.method()} ${url} [에러: ${failureText}]`);
      }
    });

    // 4. 백엔드 HTTP 5xx 서버 에러 응답 리스너
    this.page.on('response', (response) => {
      if (response.status() >= 500) {
        this.logs.serverErrors.push({
          status: response.status(),
          url: response.url(),
          method: response.request().method(),
        });
      }
    });
  }

  /**
   * 특정 콘솔 에러 패턴을 의도된 것으로 간주하여 예외 허용
   */
  allowConsoleError(pattern: RegExp | string) {
    this.allowedConsolePatterns.push(pattern);
  }

  /**
   * 특정 실패 요청 패턴을 의도된 것으로 간주하여 예외 허용
   */
  allowFailedRequest(pattern: RegExp | string) {
    this.allowedRequestPatterns.push(pattern);
  }

  /**
   * 엄격 모드 활성/비활성화 (테스트 종료 시 자동 검사 여부)
   */
  setStrictMode(enabled: boolean) {
    this.isStrictMode = enabled;
  }

  /**
   * 수집된 이상 로그 반환
   */
  getLogs(): Readonly<AnomalyLogs> {
    return this.logs;
  }

  /**
   * 화면 백화(White-out) 또는 빈 렌더링 상태 검사
   */
  async assertNoWhiteout(selector: string = '#root') {
    const root = this.page.locator(selector);
    await expect(root, `선택자 '${selector}' 엘리먼트가 DOM에 존재해야 합니다.`).toBeAttached();

    // 자식 엘리먼트 개수 확인
    const childCount = await root.locator('> *').count();
    expect(
      childCount,
      `🚨 화면 백화(White-out) 감지: '${selector}' 내에 렌더링된 자식 엘리먼트가 없습니다.`
    ).toBeGreaterThan(0);

    // 렌더링 영역 높이 확인 (0px 렌더링 방지)
    const box = await root.boundingBox();
    expect(
      box && box.height > 0,
      `🚨 렌더링 높이 이상 감지: '${selector}' 높이가 0px 입니다.`
    ).toBeTruthy();
  }

  /**
   * 수집된 모든 이상 로그(런타임 에러, 콘솔 에러, 네트워크 실패)가 0건인지 단언
   */
  assertNoAnomalies() {
    if (!this.isStrictMode) return;

    const errorSummaries: string[] = [];

    if (this.logs.pageErrors.length > 0) {
      errorSummaries.push(
        `🚨 브라우저 런타임 예외(${this.logs.pageErrors.length}건):\n` +
          this.logs.pageErrors.map((e, idx) => `  ${idx + 1}) ${e}`).join('\n')
      );
    }

    if (this.logs.consoleErrors.length > 0) {
      errorSummaries.push(
        `🚨 브라우저 console.error(${this.logs.consoleErrors.length}건):\n` +
          this.logs.consoleErrors.map((e, idx) => `  ${idx + 1}) ${e}`).join('\n')
      );
    }

    if (this.logs.failedRequests.length > 0) {
      errorSummaries.push(
        `🚨 네트워크 요청 실패(${this.logs.failedRequests.length}건):\n` +
          this.logs.failedRequests.map((e, idx) => `  ${idx + 1}) ${e}`).join('\n')
      );
    }

    if (this.logs.serverErrors.length > 0) {
      errorSummaries.push(
        `🚨 서버 5xx HTTP 응답(${this.logs.serverErrors.length}건):\n` +
          this.logs.serverErrors
            .map((e, idx) => `  ${idx + 1}) [${e.status}] ${e.method} ${e.url}`)
            .join('\n')
      );
    }

    expect(
      errorSummaries.length,
      `\n================= [프론트엔드 이상 발생 보고] =================\n` +
        errorSummaries.join('\n\n') +
        `\n============================================================\n`
    ).toBe(0);
  }
}

/**
 * 이상 감지 픽스처가 통합된 Playwright test 함수
 */
export const test = base.extend<{
  tracker: AnomalyTracker;
}>({
  tracker: async ({ page }, use) => {
    const tracker = new AnomalyTracker(page);

    await use(tracker);

    // 테스트 완료 후 자동으로 이상 여부 검증 (strict mode)
    tracker.assertNoAnomalies();
  },
});

export { expect };
