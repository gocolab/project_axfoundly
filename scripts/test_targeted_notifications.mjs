import "dotenv/config";
import express from "express";
import { initDb } from "../server/db.js";
import notificationsRouter from "../server/routes/notifications.js";
import { notificationService } from "../server/services/notificationService.js";

const PORT = 3459;
const BASE_URL = `http://localhost:${PORT}`;

const TARGET_A = "mahau.master@gmail.com";
const TARGET_B = "otter.oh@gmail.com";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTargetedTests() {
  console.log("================================================================================");
  console.log("🚀 [TEST SUITE] 이메일 & 알림 업무별 10대 테스트 케이스 수행 (대상: mahau.master & otter.oh)");
  console.log("================================================================================\n");

  // 1. DB 초기화 & 테스트 서버 기동
  await initDb();
  const app = express();
  app.use(express.json());
  app.use("/api/notifications", notificationsRouter);

  const server = app.listen(PORT);
  console.log(`[TEST SERVER] Ready on port ${PORT}\n`);

  const testResults = [];

  try {
    // ─────────────────────────────────────────────────────────────
    // TC-01: [강의] 수강 신청 및 결제 완료 알림 (mahau.master)
    // ─────────────────────────────────────────────────────────────
    console.log("▶ [TC-01] 수강 신청 및 결제 완료 알림 발송 (대상: mahau.master@gmail.com)");
    const tc01Res = await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "u-mahau",
        recipientEmail: TARGET_A,
        templateCode: "PAYMENT_COMPLETED",
        isUrgent: true,
        data: {
          courseTitle: "AI 프로덕트 매니저 부트캠프",
          userName: "마하우 대표",
        },
      }),
    });
    const tc01Data = await tc01Res.json();
    console.log(`  - 결과: title="${tc01Data.result?.notification?.title}"`);
    console.log(`  - 발송 채널: ${tc01Data.result?.channelsSent?.join(", ")}`);
    console.log(`  - 스마트 딥링크: ${tc01Data.result?.notification?.targetUrl}`);
    testResults.push({ tc: "TC-01", name: "수강 결제 완료 알림", status: tc01Data.success ? "PASS" : "FAIL" });

    // ─────────────────────────────────────────────────────────────
    // TC-02: [강의] 강의 시작 D-1 리마인더 (mahau.master)
    // ─────────────────────────────────────────────────────────────
    console.log("\n▶ [TC-02] 강의 시작 D-1 리마인더 발송 (대상: mahau.master@gmail.com)");
    const tc02Res = await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "u-mahau",
        recipientEmail: TARGET_A,
        templateCode: "COURSE_D1_REMINDER",
        data: {
          courseTitle: "AI 프로덕트 매니저 부트캠프",
          userName: "마하우 수강생",
          startTime: "내일 19:30",
          courseId: "c1",
        },
      }),
    });
    const tc02Data = await tc02Res.json();
    console.log(`  - 결과: title="${tc02Data.result?.notification?.title}"`);
    console.log(`  - 발송 채널: ${tc02Data.result?.channelsSent?.join(", ")}`);
    testResults.push({ tc: "TC-02", name: "강의 D-1 리마인더", status: tc02Data.success ? "PASS" : "FAIL" });

    // ─────────────────────────────────────────────────────────────
    // TC-03: [팀빌딩] 코파운더 팀 합류 제안 (otter.oh ➔ mahau.master)
    // ─────────────────────────────────────────────────────────────
    console.log("\n▶ [TC-03] 코파운더 팀 합류 제안 도착 (otter.oh ➔ mahau.master@gmail.com)");
    const tc03Res = await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "u-mahau",
        recipientEmail: TARGET_A,
        templateCode: "TEAM_PROPOSAL_RECEIVED",
        data: {
          fromUser: "오승환 (Full-stack AI Lead)",
          projectName: "DocuMind AI",
          role: "프론트엔드 리드 / 코파운더",
        },
      }),
    });
    const tc03Data = await tc03Res.json();
    console.log(`  - 결과: title="${tc03Data.result?.notification?.title}"`);
    console.log(`  - 호기심 갭 & CTA: ${tc03Data.result?.notification?.actionLabel}`);
    testResults.push({ tc: "TC-03", name: "팀 합류 제안 수신 (호기심 갭)", status: tc03Data.success ? "PASS" : "FAIL" });

    // ─────────────────────────────────────────────────────────────
    // TC-04: [투자/IR] 전문 투자자 미팅 제안 (otter.oh ➔ mahau.master)
    // ─────────────────────────────────────────────────────────────
    console.log("\n▶ [TC-04] 전문 투자자 미팅 제안 도착 (otter.oh ➔ mahau.master@gmail.com)");
    const tc04Res = await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "u-mahau",
        recipientEmail: TARGET_A,
        templateCode: "INVESTMENT_PROPOSAL_RECEIVED",
        data: {
          projectName: "DocuMind AI",
        },
      }),
    });
    const tc04Data = await tc04Res.json();
    console.log(`  - 결과: title="${tc04Data.result?.notification?.title}"`);
    testResults.push({ tc: "TC-04", name: "투자자 미팅/투자 제안", status: tc04Data.success ? "PASS" : "FAIL" });

    // ─────────────────────────────────────────────────────────────
    // TC-05: [스타트업] 아이디어 의뢰 빌더 역제안 도착 (otter.oh ➔ mahau.master)
    // ─────────────────────────────────────────────────────────────
    console.log("\n▶ [TC-05] 아이디어 의뢰 빌더 역제안 도착 (otter.oh ➔ mahau.master@gmail.com)");
    const tc05Res = await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "u-mahau",
        recipientEmail: TARGET_A,
        templateCode: "IDEA_PROPOSAL_MATCHED",
        data: {
          ideaTitle: "AI 계약서 위험 조항 자동 검토 SaaS",
          requestId: "ir-req-1",
        },
      }),
    });
    const tc05Data = await tc05Res.json();
    console.log(`  - 결과: title="${tc05Data.result?.notification?.title}"`);
    testResults.push({ tc: "TC-05", name: "빌더 팀 MVP 제작 역제안", status: tc05Data.success ? "PASS" : "FAIL" });

    // ─────────────────────────────────────────────────────────────
    // TC-06: [커뮤니티] 게시글 새 댓글 & 5분 스마트 묶음 (Roll-up)
    // ─────────────────────────────────────────────────────────────
    console.log("\n▶ [TC-06] 게시글 새 댓글 & 5분 스마트 묶음(Roll-up) 검증");
    const testPostId = `p-demo-${Date.now()}`;
    const testAggregationKey = `post:${testPostId}:comment`;

    // 1차 댓글
    await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "u-mahau",
        recipientEmail: TARGET_A,
        templateCode: "POST_COMMENT_RECEIVED",
        aggregationKey: testAggregationKey,
        data: {
          postTitle: "AI 스타트업 초기 CAC 최적화 방안",
          author: "오승환",
          commentSnippet: "초기 POC 전환율을 감안한 블렌디드 CAC가 중요합니다.",
          postId: testPostId,
        },
      }),
    });

    // 2차 댓글 (5분 이내 동일 글)
    const tc06Res2 = await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "u-mahau",
        recipientEmail: TARGET_A,
        templateCode: "POST_COMMENT_RECEIVED",
        aggregationKey: testAggregationKey,
        data: {
          postTitle: "AI 스타트업 초기 CAC 최적화 방안",
          author: "김소현",
          commentSnippet: "매우 유익한 글 잘 보았습니다!",
          postId: testPostId,
        },
      }),
    });
    const tc06Data2 = await tc06Res2.json();
    console.log(`  - 스마트 병합 제목: "${tc06Data2.result?.notification?.title}"`);
    console.log(`  - 병합 건수: ${tc06Data2.result?.notification?.aggregationCount}건`);
    const isAggregated = tc06Data2.result?.notification?.aggregationCount === 2;
    testResults.push({ tc: "TC-06", name: "5분 스마트 묶음 (Roll-up)", status: isAggregated ? "PASS" : "FAIL" });

    // ─────────────────────────────────────────────────────────────
    // TC-07: [스팸방지] 야간 방해금지 시간대(21:00~08:00) 외부 발송 보류
    // ─────────────────────────────────────────────────────────────
    console.log("\n▶ [TC-07] 야간 방해금지 시간대(Quiet Hours) 발송 보류 검증");
    const nowHour = new Date().getHours();
    const startH = (nowHour - 1 + 24) % 24;
    const endH = (nowHour + 2) % 24;
    const startStr = `${startH.toString().padStart(2, "0")}:00`;
    const endStr = `${endH.toString().padStart(2, "0")}:00`;

    await fetch(`${BASE_URL}/api/notifications/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "u-quiet-test",
        quietHours: { enabled: true, start: startStr, end: endStr },
      }),
    });

    const tc07Res = await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "u-quiet-test",
        recipientEmail: TARGET_B,
        title: "🌙 심야 등록된 알림",
        message: "밤 시간대에 작성된 메시지입니다.",
        category: "community",
        isUrgent: false,
      }),
    });
    const tc07Data = await tc07Res.json();
    const emailLog = tc07Data.result?.logs?.find((l) => l.channel === "email");
    console.log(`  - 인앱 발송 여부: ${tc07Data.result?.channelsSent?.includes("inapp") ? "발송됨(적재)" : "미발송"}`);
    console.log(`  - 이메일 발송 상태: status="${emailLog?.status}" (held_quiet_hours)`);
    const isQuietHeld = emailLog?.status === "held_quiet_hours";
    testResults.push({ tc: "TC-07", name: "야간 방해금지 발송 보류", status: isQuietHeld ? "PASS" : "FAIL" });

    // ─────────────────────────────────────────────────────────────
    // TC-08: [스팸방지] 30일 알림 일시 중지 (Snooze) (otter.oh)
    // ─────────────────────────────────────────────────────────────
    console.log("\n▶ [TC-08] 30일 알림 일시 중지 (Snooze) 검증 (대상: otter.oh@gmail.com)");
    // Snooze 활성화
    const snoozeRes = await fetch(`${BASE_URL}/api/notifications/snooze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "u-otter-snooze-test", days: 30 }),
    });
    const snoozeData = await snoozeRes.json();
    console.log(`  - Snooze 설정 완료: snoozeUntil=${snoozeData.preferences?.snoozeUntil}`);

    const tc08Res = await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "u-otter-snooze-test",
        recipientEmail: TARGET_B,
        title: "일시중지 상태 테스트",
        message: "Snooze 기간 동안 외부 발송이 차단되어야 합니다.",
        category: "digest",
        isUrgent: false,
      }),
    });
    const tc08Data = await tc08Res.json();
    const snoozeEmailLog = tc08Data.result?.logs?.find((l) => l.channel === "email");
    console.log(`  - Snooze 중 이메일 상태: status="${snoozeEmailLog?.status}" (unsubscribed/차단)`);

    // Snooze 해제
    await fetch(`${BASE_URL}/api/notifications/unsnooze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "u-otter-snooze-test" }),
    });
    console.log("  - Snooze 정상 해제 완료");
    testResults.push({ tc: "TC-08", name: "30일 Snooze 일시 중지", status: snoozeEmailLog?.status === "unsubscribed" ? "PASS" : "FAIL" });

    // ─────────────────────────────────────────────────────────────
    // TC-09: [스팸방지] RFC 8058 1-Click 원클릭 수신 거부 (otter.oh)
    // ─────────────────────────────────────────────────────────────
    console.log("\n▶ [TC-09] RFC 8058 1-Click 원클릭 수신 거부 검증 (대상: otter.oh@gmail.com)");
    const tc09Res = await fetch(`${BASE_URL}/api/notifications/unsubscribe?userId=u-otter&category=marketing`, {
      method: "POST",
    });
    const tc09Data = await tc09Res.json();
    console.log(`  - 수신거부 결과: "${tc09Data.message}"`);
    testResults.push({ tc: "TC-09", name: "1-Click 원클릭 수신 거부", status: tc09Data.success ? "PASS" : "FAIL" });

    // ─────────────────────────────────────────────────────────────
    // TC-10: [위클리] 주간 인기 스타트업 다이제스트 발송 (mahau.master & otter.oh)
    // ─────────────────────────────────────────────────────────────
    console.log("\n▶ [TC-10] 주간 인기 스타트업 다이제스트 발송 (mahau.master & otter.oh)");
    const tc10A = await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "u-mahau",
        recipientEmail: TARGET_A,
        templateCode: "WEEKLY_DIGEST",
        isUrgent: true,
      }),
    });
    const tc10B = await fetch(`${BASE_URL}/api/notifications/test-trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "u-otter",
        recipientEmail: TARGET_B,
        templateCode: "WEEKLY_DIGEST",
        isUrgent: true,
      }),
    });
    const tc10DataA = await tc10A.json();
    const tc10DataB = await tc10B.json();
    console.log(`  - mahau.master 발송: title="${tc10DataA.result?.notification?.title}"`);
    console.log(`  - otter.oh 발송: title="${tc10DataB.result?.notification?.title}"`);
    testResults.push({ tc: "TC-10", name: "주간 스타트업 다이제스트", status: tc10DataA.success && tc10DataB.success ? "PASS" : "FAIL" });

    // ─────────────────────────────────────────────────────────────
    // 최종 결과 리포트 출력
    // ─────────────────────────────────────────────────────────────
    console.log("\n================================================================================");
    console.log("📊 [TEST SUMMARY] 10대 테스트 케이스 수행 결과 리포트");
    console.log("================================================================================");
    console.table(testResults);

    const allPassed = testResults.every((r) => r.status === "PASS");
    if (allPassed) {
      console.log("\n✨ 10/10 모든 테스트 케이스가 성공적으로 통과(PASS)하였습니다!");
    } else {
      console.error("\n❌ 일부 테스트 케이스가 실패하였습니다.");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("❌ Test execution failed with error:", error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTargetedTests();
