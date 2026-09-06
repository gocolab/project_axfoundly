import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3010',
    trace: 'off',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    },
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
});
