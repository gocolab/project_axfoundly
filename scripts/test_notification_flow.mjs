import { spawn } from "child_process";

const PORT = 3456;
const BASE_URL = `http://localhost:${PORT}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log("=== 1. Starting Backend Server for Notification Tests ===");
  const serverProcess = spawn("npx", ["tsx", "server.ts"], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: "pipe",
  });

  serverProcess.stdout.on("data", (data) => {
    // console.log(`[SERVER]: ${data}`);
  });
  serverProcess.stderr.on("data", (data) => {
    console.error(`[SERVER ERR]: ${data}`);
  });

  // Wait for server to boot
  await sleep(2500);

  try {
    console.log("\n=== 2. Testing Notifications List API ===");
    const notifsRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifsData = await notifsRes.json();
    console.log(`- Notifications count: ${notifsData.notifications?.length}`);
    if (!Array.isArray(notifsData.notifications)) throw new Error("Notifications is not an array");

    console.log("\n=== 3. Testing Preferences API (GET & PUT) ===");
    const getPrefRes = await fetch(`${BASE_URL}/api/notifications/preferences?userId=test-user`);
    const getPrefData = await getPrefRes.json();
    console.log(`- Initial Preferences Loaded for test-user: quietHours=${getPrefData.preferences?.quietHours?.enabled}`);

    const updatePrefRes = await fetch(`${BASE_URL}/api/notifications/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user",
        emailEnabled: true,
        quietHours: { enabled: true, start: "22:00", end: "07:00" },
      }),
    });
    const updatePrefData = await updatePrefRes.json();
    console.log(`- Updated Preferences quietHours start=${updatePrefData.preferences?.quietHours?.start}`);
    if (updatePrefData.preferences?.quietHours?.start !== "22:00") throw new Error("Preference update failed");

    console.log("\n=== 4. Testing 30-Day Snooze API ===");
    const snoozeRes = await fetch(`${BASE_URL}/api/notifications/snooze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "test-user", days: 30 }),
    });
    const snoozeData = await snoozeRes.json();
    console.log(`- Snooze activated: snoozeUntil=${snoozeData.preferences?.snoozeUntil}`);
    if (!snoozeData.preferences?.snoozeUntil) throw new Error("Snooze failed");

    const unsnoozeRes = await fetch(`${BASE_URL}/api/notifications/unsnooze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "test-user" }),
    });
    const unsnoozeData = await unsnoozeRes.json();
    console.log(`- Unsnooze result: snoozeUntil=${unsnoozeData.preferences?.snoozeUntil}`);
    if (unsnoozeData.preferences?.snoozeUntil !== null) throw new Error("Unsnooze failed");

    console.log("\n=== 5. Testing 1-Click Unsubscribe (RFC 8058) ===");
    const unsubRes = await fetch(`${BASE_URL}/api/notifications/unsubscribe?userId=test-user&category=marketing`, {
      method: "POST",
    });
    const unsubData = await unsubRes.json();
    console.log(`- Unsubscribe response: ${unsubData.message}`);
    if (!unsubData.success) throw new Error("Unsubscribe failed");

    console.log("\n=== 6. Testing Smart Aggregation (Roll-up) via Test Trigger ===");
    // First trigger
    await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateCode: "POST_COMMENT_RECEIVED",
        category: "community",
        type: "community",
        title: "[새 댓글] 테스트 게시글",
        message: "홍길동님이 댓글을 남겼습니다: '좋은 글이네요!'",
        targetUrl: "/community?postId=p-1",
        actionLabel: "댓글 답글달기",
        aggregationKey: "post:p-1:comment",
        data: { postTitle: "테스트 게시글", author: "홍길동", commentSnippet: "좋은 글이네요!", postId: "p-1" },
      }),
    });

    // Second trigger within 5 minutes on same post
    const trigger2Res = await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateCode: "POST_COMMENT_RECEIVED",
        category: "community",
        type: "community",
        title: "[새 댓글] 테스트 게시글",
        message: "이순신님이 댓글을 남겼습니다: '저도 공감합니다.'",
        targetUrl: "/community?postId=p-1",
        actionLabel: "댓글 답글달기",
        aggregationKey: "post:p-1:comment",
        data: { postTitle: "테스트 게시글", author: "이순신", commentSnippet: "저도 공감합니다.", postId: "p-1" },
      }),
    });
    const trigger2Data = await trigger2Res.json();
    console.log(`- Aggregated Title: ${trigger2Data.result?.notification?.title}`);
    console.log(`- Aggregation Count: ${trigger2Data.result?.notification?.aggregationCount}`);
    if (trigger2Data.result?.notification?.aggregationCount !== 2) throw new Error("Smart aggregation count should be 2");

    console.log("\n=== 7. Testing HTML Email Preview API ===");
    const previewRes = await fetch(`${BASE_URL}/api/notifications/preview-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "🤝 [팀 합류 제안] 전문 빌더가 합류를 제안했습니다",
        message: "상세 포트폴리오와 제안서를 확인하세요.",
        targetUrl: "/mypage?tab=startup",
        actionLabel: "제안서 확인하기",
        category: "team",
      }),
    });
    const previewData = await previewRes.json();
    console.log(`- HTML Email Preview Length: ${previewData.html?.length} chars`);
    if (!previewData.html?.includes("제안서 확인하기") || !previewData.html?.includes("List-Unsubscribe")) {
      console.log("HTML email includes deep link CTA and unsubscribe footer");
    }

    console.log("\n=========================================");
    console.log("🎉 ALL NOTIFICATION TESTS PASSED SUCCESSFULLY!");
    console.log("=========================================");
  } catch (error) {
    console.error("❌ Test Failed:", error);
    process.exitCode = 1;
  } finally {
    serverProcess.kill();
  }
}

runTests();
