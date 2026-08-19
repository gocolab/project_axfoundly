import { test, expect } from '@playwright/test';

test.describe('TC-08: 백엔드 11개 도메인 REST API 전수 무결성 및 C/U/D 통합 테스트', () => {
  // 1. Health check
  test('GET /api/health returns 200 OK and healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });

  // 2. Auth Domain
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

  // 3. Courses Domain (List, Get, Create, Enroll, Review, Approve, Reject)
  test('Courses Domain: GET, POST, Detail, Enroll, Reviews, Approve, Reject endpoints operate properly', async ({ request }) => {
    // List courses
    const listRes = await request.get('/api/courses');
    expect(listRes.status()).toBe(200);
    const listData = await listRes.json();
    expect(Array.isArray(listData.courses)).toBeTruthy();
    expect(listData.courses.length).toBeGreaterThan(0);

    const firstCourseId = listData.courses[0].id;

    // Get course detail
    const detailRes = await request.get(`/api/courses/${firstCourseId}`);
    expect(detailRes.status()).toBe(200);
    const detailData = await detailRes.json();
    expect(detailData.course.id).toBe(firstCourseId);

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
    const createdCourseId = newCourseData.course.id;
    expect(newCourseData.course.title).toBe('Playwright API Integration Test Course');

    // Enroll & Pay
    const enrollRes = await request.post(`/api/courses/${createdCourseId}/enroll`, {
      data: { paymentMethod: '카드' },
    });
    expect(enrollRes.status()).toBe(200);
    const enrollData = await enrollRes.json();
    expect(enrollData.success).toBe(true);
    expect(enrollData.course.isEnrolled).toBe(true);

    // Add Review
    const reviewRes = await request.post(`/api/courses/${createdCourseId}/reviews`, {
      data: {
        author: '김수강생',
        rating: 5,
        content: '최고의 강의였습니다!',
      },
    });
    expect(reviewRes.status()).toBe(201);
    const reviewData = await reviewRes.json();
    expect(reviewData.review.rating).toBe(5);

    // Admin Approve & Reject
    const approveRes = await request.patch(`/api/courses/${createdCourseId}/approve`);
    expect(approveRes.status()).toBe(200);

    const rejectRes = await request.patch(`/api/courses/${createdCourseId}/reject`, {
      data: { reason: '커리큘럼 보완 필요' },
    });
    expect(rejectRes.status()).toBe(200);
  });

  // 4. IR Projects Domain (List, Get, Create, Update, Bookmark, Apply)
  test('IR Domain: GET, POST, PUT, Bookmark, Apply endpoints operate properly', async ({ request }) => {
    // List projects
    const listRes = await request.get('/api/ir/projects');
    expect(listRes.status()).toBe(200);
    const listData = await listRes.json();
    expect(Array.isArray(listData.projects)).toBeTruthy();
    expect(listData.projects.length).toBeGreaterThan(0);

    // Create project
    const createRes = await request.post('/api/ir/projects', {
      data: {
        teamName: 'Playwright IR Team',
        title: 'B2B AI Document Solution',
        field: 'AI/ML',
        description: 'Auto testing project',
        businessModel: 'B2B SaaS',
      },
    });
    expect(createRes.status()).toBe(201);
    const createData = await createRes.json();
    const newProjId = createData.project.id;

    // Update project
    const updateRes = await request.put(`/api/ir/projects/${newProjId}`, {
      data: {
        oneLiner: 'Updated one-liner for testing',
      },
    });
    expect(updateRes.status()).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.project.oneLiner).toBe('Updated one-liner for testing');

    // Toggle Bookmark
    const bmRes = await request.post(`/api/ir/projects/${newProjId}/bookmark`);
    expect(bmRes.status()).toBe(200);
    const bmData = await bmRes.json();
    expect(bmData.success).toBe(true);

    // Apply for Job
    const applyRes = await request.post(`/api/ir/projects/${newProjId}/apply`, {
      data: {
        roleId: 'r1',
        applicantName: '김수강생',
        coverLetter: '성실히 임하겠습니다.',
      },
    });
    expect(applyRes.status()).toBe(201);
  });

  // 5. Community Domain (List, Get, Create Post, Comments)
  test('Community Domain: Posts and Comments CRUD endpoints operate properly', async ({ request }) => {
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

    // Add Comment
    const commentRes = await request.post(`/api/community/posts/${createdPostId}/comments`, {
      data: {
        author: '김소현',
        authorRole: 'instructor',
        content: '좋은 질문입니다!',
      },
    });
    expect(commentRes.status()).toBe(201);

    // List comments
    const listCommentsRes = await request.get(`/api/community/posts/${createdPostId}/comments`);
    expect(listCommentsRes.status()).toBe(200);
    const listCommentsData = await listCommentsRes.json();
    expect(listCommentsData.comments.length).toBeGreaterThan(0);
  });

  // 6. Payments Domain (List, Receipt, Refund)
  test('Payments Domain: GET, Receipt, Refund operate properly', async ({ request }) => {
    const listRes = await request.get('/api/payments');
    expect(listRes.status()).toBe(200);
    const listData = await listRes.json();
    expect(Array.isArray(listData.payments)).toBeTruthy();

    if (listData.payments.length > 0) {
      const paymentId = listData.payments[0].id;
      // Get receipt
      const receiptRes = await request.get(`/api/payments/${paymentId}/receipt`);
      expect(receiptRes.status()).toBe(200);
      const receiptData = await receiptRes.json();
      expect(receiptData.receipt.totalAmount).toBeGreaterThan(0);

      // Refund payment
      const refundRes = await request.post(`/api/payments/${paymentId}/refund`, {
        data: { reason: '테스트 환불' },
      });
      expect(refundRes.status()).toBe(200);
    }
  });

  // 7. Team Building Domain (Requests, Status update)
  test('Team Domain: Team building requests and status updates operate properly', async ({ request }) => {
    // Send request
    const createRes = await request.post('/api/team/requests', {
      data: {
        projectName: 'Playwright Team Proj',
        fromUser: '김수강생',
        role: 'AI 엔지니어',
        message: '함께하고 싶습니다.',
      },
    });
    expect(createRes.status()).toBe(201);
    const createData = await createRes.json();
    const reqId = createData.request.id;

    // Update status
    const updateRes = await request.patch(`/api/team/requests/${reqId}`, {
      data: { status: '수락' },
    });
    expect(updateRes.status()).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.request.status).toBe('수락');

    // List requests
    const listRes = await request.get('/api/team/requests');
    expect(listRes.status()).toBe(200);
  });

  // 8. Instructor Domain (CRM, Settlements, Withdraw)
  test('Instructor Domain: CRM messages, Settlements and Withdraw operate properly', async ({ request }) => {
    // Send CRM Message
    const crmRes = await request.post('/api/instructor/crm/send', {
      data: {
        courseId: 'c1',
        courseTitle: 'AI 부트캠프',
        title: '과제 제출 독려',
        content: '마감 2일 전입니다.',
      },
    });
    expect(crmRes.status()).toBe(201);

    // List CRM messages
    const listCrmRes = await request.get('/api/instructor/crm/messages');
    expect(listCrmRes.status()).toBe(200);

    // List Settlements
    const settRes = await request.get('/api/instructor/settlements');
    expect(settRes.status()).toBe(200);

    // Withdraw
    const withdrawRes = await request.post('/api/instructor/settlements/withdraw', {
      data: { settlementId: 's1' },
    });
    expect(withdrawRes.status()).toBe(200);
  });

  // 9. Investments Domain (Proposals, Status update, Recommendations)
  test('Investments Domain: Proposals, Status updates and Recommendations operate properly', async ({ request }) => {
    // Send Proposal
    const propRes = await request.post('/api/investments/proposals', {
      data: {
        projectId: 'p1',
        projectName: 'DocuMind AI',
        message: '3억원 투자 미팅을 제안합니다.',
      },
    });
    expect(propRes.status()).toBe(201);
    const propData = await propRes.json();
    const propId = propData.proposal.id;

    // Update status
    const updateRes = await request.patch(`/api/investments/proposals/${propId}/status`, {
      data: { status: '수락' },
    });
    expect(updateRes.status()).toBe(200);

    // List Proposals
    const listPropRes = await request.get('/api/investments/proposals');
    expect(listPropRes.status()).toBe(200);

    // AI Recommendations
    const recRes = await request.get('/api/investments/recommendations');
    expect(recRes.status()).toBe(200);
    const recData = await recRes.json();
    expect(Array.isArray(recData.recommendations)).toBeTruthy();
  });

  // 10. Admin Domain (Stats, Members, Role/Status update, Boards)
  test('Admin Domain: Stats, Members, Role/Status update, Boards CRUD operate properly', async ({ request }) => {
    // Stats
    const statsRes = await request.get('/api/admin/stats');
    expect(statsRes.status()).toBe(200);

    // Members
    const membersRes = await request.get('/api/admin/members');
    expect(membersRes.status()).toBe(200);
    const membersData = await membersRes.json();
    expect(membersData.members.length).toBeGreaterThan(0);

    const firstMemberId = membersData.members[0].id;

    // Change Role
    const roleRes = await request.patch(`/api/admin/members/${firstMemberId}/role`, {
      data: { role: 'instructor' },
    });
    expect(roleRes.status()).toBe(200);

    // Change Status
    const statusRes = await request.patch(`/api/admin/members/${firstMemberId}/status`, {
      data: { status: '활성' },
    });
    expect(statusRes.status()).toBe(200);

    // Create Board
    const createBoardRes = await request.post('/api/admin/boards', {
      data: { name: '테스트 전용 게시판', template: '일반형' },
    });
    expect(createBoardRes.status()).toBe(201);
    const createBoardData = await createBoardRes.json();
    const createdBoardId = createBoardData.board.id;

    // Delete Board
    const delBoardRes = await request.delete(`/api/admin/boards/${createdBoardId}`);
    expect(delBoardRes.status()).toBe(200);
  });

  // 11. Notifications Domain (List, Mark Read, Read All)
  test('Notifications Domain: List, Read, Read-all operate properly', async ({ request }) => {
    const listRes = await request.get('/api/notifications');
    expect(listRes.status()).toBe(200);
    const listData = await listRes.json();
    expect(Array.isArray(listData.notifications)).toBeTruthy();

    if (listData.notifications.length > 0) {
      const firstNotifId = listData.notifications[0].id;
      const readRes = await request.patch(`/api/notifications/${firstNotifId}/read`);
      expect(readRes.status()).toBe(200);
    }

    const readAllRes = await request.post('/api/notifications/read-all');
    expect(readAllRes.status()).toBe(200);
  });

  // 12. AI Domain (Course Draft, Diagnosis, Innovation Chat)
  test('AI Domain: Course Draft, Diagnosis, Innovation Chat generate fallback/real outputs', async ({ request }) => {
    // Course Draft
    const draftRes = await request.post('/api/ai/course-draft', {
      data: { topic: '생성형 AI 서비스 기획', totalSessions: 8 },
    });
    expect(draftRes.status()).toBe(200);
    const draftData = await draftRes.json();
    expect(draftData.draft.title).toContain('생성형 AI');

    // Diagnosis
    const diagRes = await request.post('/api/ai/diagnosis', {
      data: {
        answers: { role: 'AI PM', focus: 'LLM Agent', stage: 'MVP' },
      },
    });
    expect(diagRes.status()).toBe(200);
    const diagData = await diagRes.json();
    expect(diagData.report).toBeDefined();

    // Innovation Chat
    const chatRes = await request.post('/api/ai/innovation-chat', {
      data: { message: '초기 스타트업 AI 아키텍처 조언 부탁드립니다.' },
    });
    expect(chatRes.status()).toBe(200);
    const chatData = await chatRes.json();
    expect(chatData.text).toBeDefined();
  });
});
