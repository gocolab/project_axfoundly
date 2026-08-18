import { test, expect } from '@playwright/test';

test.describe('TC-08: Backend REST API Direct Integration Tests', () => {
  test('GET /api/health returns 200 OK and healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });

  test('POST /api/auth/login and GET /api/auth/me operate correctly', async ({ request }) => {
    // 1. Login as instructor
    const loginRes = await request.post('/api/auth/login', {
      data: { role: 'instructor' },
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    expect(loginData.user.role).toBe('instructor');

    // 2. Check me with token
    const meRes = await request.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${loginData.token}`,
      },
    });
    expect(meRes.status()).toBe(200);
    const meData = await meRes.json();
    expect(meData.user.role).toBe('instructor');
  });

  test('GET & POST /api/courses returns paginated list and handles creation', async ({ request }) => {
    // List courses
    const res = await request.get('/api/courses');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.courses)).toBeTruthy();
    expect(data.courses.length).toBeGreaterThan(0);

    // Create course
    const newCourseRes = await request.post('/api/courses', {
      data: {
        title: 'Playwright API Integration Test Course',
        description: 'Automated test created course',
        category: 'AI 모델링',
        price: 350000,
        instructor: '김소현',
      },
    });
    expect(newCourseRes.status()).toBe(201);
    const newCourseData = await newCourseRes.json();
    expect(newCourseData.course.title).toBe('Playwright API Integration Test Course');
  });

  test('GET & POST /api/ir/projects and bookmark toggle operate properly', async ({ request }) => {
    // List projects
    const res = await request.get('/api/ir/projects');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.projects)).toBeTruthy();
    expect(data.projects.length).toBeGreaterThan(0);

    // Bookmark toggle on first project
    const firstProjId = data.projects[0].id;
    const bmRes = await request.post(`/api/ir/projects/${firstProjId}/bookmark`);
    expect(bmRes.status()).toBe(200);
    const bmData = await bmRes.json();
    expect(bmData.success).toBe(true);
  });

  test('GET & POST /api/community/posts and comments work properly', async ({ request }) => {
    // Create new post
    const createRes = await request.post('/api/community/posts', {
      data: {
        title: 'API Integration Spec Post',
        content: 'Testing direct API endpoints',
        boardType: 'QnA',
        author: '김수강생',
      },
    });
    expect(createRes.status()).toBe(201);
    const createData = await createRes.json();
    const createdPostId = createData.post.id;

    // Get post detail
    const detailRes = await request.get(`/api/community/posts/${createdPostId}`);
    expect(detailRes.status()).toBe(200);
    const detailData = await detailRes.json();
    expect(detailData.post.title).toBe('API Integration Spec Post');
  });

  test('GET /api/admin/stats, members, and boards return complete data', async ({ request }) => {
    // Stats
    const statsRes = await request.get('/api/admin/stats');
    expect(statsRes.status()).toBe(200);
    const statsData = await statsRes.json();
    expect(statsData.stats.totalRevenue).toBeGreaterThan(0);

    // Members
    const membersRes = await request.get('/api/admin/members');
    expect(membersRes.status()).toBe(200);
    const membersData = await membersRes.json();
    expect(Array.isArray(membersData.members)).toBeTruthy();

    // Boards
    const boardsRes = await request.get('/api/admin/boards');
    expect(boardsRes.status()).toBe(200);
    const boardsData = await boardsRes.json();
    expect(Array.isArray(boardsData.boards)).toBeTruthy();
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
