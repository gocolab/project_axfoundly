import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { host: '0.0.0.0', port: 9323, open: 'never' }]
  ],
  use: {
    baseURL: 'http://localhost:3005',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup-auth',
      testMatch: /.*google-auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      testMatch: /e2e\/(?!google_auth_real).*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'google-real-user',
      testMatch: /e2e\/google_auth_real\.spec\.ts/,
      dependencies: ['setup-auth'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: './playwright/.auth/google-user.json',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3005',
    reuseExistingServer: true,
    timeout: 120 * 1000,
    env: {
      PLAYWRIGHT_AUTH_METHOD: 'mock',
    },
  },
});
