import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Default target email
const args = process.argv.slice(2);
const emailArg = args.find(a => a.startsWith('--email='))?.split('=')[1] || process.env.GOOGLE_TEST_EMAIL || 'mahau.master@gmail.com';
const roleArg = args.find(a => a.startsWith('--role='))?.split('=')[1] || (emailArg.toLowerCase() === 'otter.oh@gmail.com' ? 'admin' : 'member');
const nameArg = args.find(a => a.startsWith('--name='))?.split('=')[1] || (emailArg.toLowerCase() === 'mahau.master@gmail.com' ? '마하우' : (emailArg.toLowerCase() === 'otter.oh@gmail.com' ? '오승환' : emailArg.split('@')[0]));

const authDir = path.join(rootDir, 'playwright', '.auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

const authFilePath = path.join(authDir, 'google-user.json');

// Base64 encode email for Google Token
const tokenValue = `mock-jwt-token-google-${Buffer.from(emailArg).toString('base64')}`;

const storageState = {
  cookies: [],
  origins: [
    {
      origin: 'http://localhost:3005',
      localStorage: [
        {
          name: 'auth_token',
          value: tokenValue,
        },
        {
          name: 'user_name',
          value: nameArg,
        },
        {
          name: 'user_role',
          value: roleArg,
        },
        {
          name: 'user_roles',
          value: JSON.stringify(roleArg === 'admin' ? ['admin', 'member'] : ['member']),
        },
        {
          name: 'user_assigned_roles',
          value: '[]',
        },
      ],
    },
  ],
};

fs.writeFileSync(authFilePath, JSON.stringify(storageState, null, 2), 'utf-8');

console.log('====================================================');
console.log('✅ Google OAuth Storage State 파일 생성 완료!');
console.log(`📁 파일 경로: ${authFilePath}`);
console.log(`👤 사용자 이메일: ${emailArg}`);
console.log(`🏷️  사용자 이름: ${nameArg}`);
console.log(`🔑 사용자 권한: ${roleArg}`);
console.log(`🎫 인증 토큰: ${tokenValue}`);
console.log('====================================================');
