import { test, expect } from '@playwright/test';

test.describe('Backend API Direct Integration Tests', () => {
  test('GET /api/health returns 200 OK and healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });

  test('POST /api/diagnosis with invalid body returns 400 Bad Request', async ({ request }) => {
    const response = await request.post('/api/diagnosis', {
      data: {},
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Survey answers are required.');
  });
});
