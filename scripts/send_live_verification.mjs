import "dotenv/config";
import { initDb } from "../server/db.js";
import { notificationService } from "../server/services/notificationService.js";

async function sendLiveEmails() {
  console.log("=== Initializing DB & Sending Live Verification Emails ===");
  await initDb();

  // mahau.master@gmail.com 발송
  console.log("▶ Sending to mahau.master@gmail.com...");
  await notificationService.sendNotification({
    userId: "u-mahau",
    recipientEmail: "mahau.master@gmail.com",
    title: "🚀 [수강 안내] AI 프로덕트 매니저 부트캠프 강의실이 열렸습니다",
    message: "안녕하세요 마하우 대표님!\n\n신청하신 AI 프로덕트 매니저 부트캠프의 첫 번째 라이브 수업이 준비되었습니다.\n지금 아래 버튼을 클릭하여 강의실에 입장하고 커리큘럼을 확인하세요.",
    targetUrl: "/mypage?tab=courses",
    actionLabel: "강의실 바로 입장하기",
    category: "course",
    isUrgent: true,
  });

  // otter.oh@gmail.com 발송
  console.log("▶ Sending to otter.oh@gmail.com...");
  await notificationService.sendNotification({
    userId: "u-otter",
    recipientEmail: "otter.oh@gmail.com",
    title: "🤝 [팀 합류 제안] 전문 빌더가 코파운더 합류를 제안했습니다",
    message: "안녕하세요 오승환님!\n\n귀하의 프로필과 프로젝트에 공감한 전문 빌더가 팀 합류 제안서를 보냈습니다.\n아래 버튼을 눌러 상세 제안서와 포트폴리오를 확인해보세요.",
    targetUrl: "/mypage?tab=startup",
    actionLabel: "제안서 열람하기",
    category: "team",
    isUrgent: true,
  });

  console.log("✨ All live verification emails sent successfully!");
  process.exit(0);
}

sendLiveEmails().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
