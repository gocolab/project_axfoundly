import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authDir = path.resolve(__dirname, '../../playwright/.auth');
const authFile = path.join(authDir, 'google-user.json');

setup('Google OAuth Storage State 준비 및 세션 확인', async () => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const testEmail = process.env.GOOGLE_TEST_EMAIL || 'mahau.master@gmail.com';
  const testName = '마하우';
  const testRole = 'member';
  const token = `mock-jwt-token-google-${Buffer.from(testEmail).toString('base64')}`;

  const state = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:3010',
        localStorage: [
          { name: 'auth_token', value: token },
          { name: 'user_name', value: testName },
          { name: 'user_role', value: testRole },
          { name: 'user_assigned_roles', value: '[]' },
        ],
      },
    ],
  };

  fs.writeFileSync(authFile, JSON.stringify(state, null, 2), 'utf-8');
  console.log(`[Setup] Google Auth State 파일이 준비되었습니다: ${authFile}`);
});
