import { test, expect } from '@playwright/test';

test.describe('Backend API Direct Integration Tests', () => {
  test('GET /api/health returns 200 OK and healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });

  test('GET /api/courses returns paginated course list', async ({ request }) => {
    const res = await request.get('/api/courses');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.courses)).toBeTruthy();
    expect(data.courses.length).toBeGreaterThan(0);
  });

  test('GET /api/ir/projects returns startup projects', async ({ request }) => {
    const res = await request.get('/api/ir/projects');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.projects)).toBeTruthy();
    expect(data.projects.length).toBeGreaterThan(0);
  });

  test('GET /api/community/posts returns posts with comments', async ({ request }) => {
    const res = await request.get('/api/community/posts');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.posts)).toBeTruthy();
    expect(data.posts.length).toBeGreaterThan(0);

    const firstPostId = data.posts[0].id;
    const detailRes = await request.get(`/api/community/posts/${firstPostId}`);
    expect(detailRes.status()).toBe(200);
    const detailData = await detailRes.json();
    expect(detailData.post.id).toBe(firstPostId);
  });

  test('GET /api/admin/stats returns dashboard metrics', async ({ request }) => {
    const res = await request.get('/api/admin/stats');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.stats).toBeDefined();
    expect(data.stats.totalRevenue).toBeGreaterThan(0);
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
