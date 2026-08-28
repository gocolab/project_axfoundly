import nodemailer from "nodemailer";
import { db } from "../db.js";
import type {
  Notification,
  NotificationPreference,
  NotificationTemplate,
  NotificationLog,
  NotificationCategory,
  NotificationChannel,
} from "../../src/types.js";

interface SendNotificationOptions {
  userId?: string;
  recipientEmail?: string;
  templateCode?: string;
  category?: NotificationCategory;
  type?: Notification["type"];
  title?: string;
  message?: string;
  targetUrl?: string;
  actionLabel?: string;
  sender?: string;
  courseTitle?: string;
  aggregationKey?: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
  isUrgent?: boolean; // 결제/보안 등 긴급 트랜잭션 (방해금지/스누즈 무시)
}

class NotificationService {
  /**
   * 사용자 알림 설정(Preference) 조회 (없으면 기본값 생성)
   */
  public getPreferences(userId: string): NotificationPreference {
    const prefs = db.get("notificationPreferences") || [];
    const exactMatch = prefs.find((p) => p.userId === userId);

    if (exactMatch) {
      return exactMatch;
    }

    const defaultPref: NotificationPreference = {
      userId,
      emailEnabled: true,
      inAppEnabled: true,
      alimtalkEnabled: true,
      categories: {
        course: { inapp: true, email: true, alimtalk: true },
        team: { inapp: true, email: true, alimtalk: false },
        investor: { inapp: true, email: true, alimtalk: true },
        community: { inapp: true, email: false, alimtalk: false },
        digest: { inapp: true, email: true, alimtalk: false },
        marketing: { inapp: true, email: false, alimtalk: false },
      },
      quietHours: {
        enabled: true,
        start: "21:00",
        end: "08:00",
      },
      snoozeUntil: null,
      updatedAt: new Date().toISOString(),
    };

    db.update("notificationPreferences", (list) => [...(list || []), defaultPref]);
    return defaultPref;
  }

  /**
   * 사용자 알림 설정 업데이트 (안전한 업서트)
   */
  public updatePreferences(
    userId: string,
    updates: Partial<NotificationPreference>
  ): NotificationPreference {
    let updated: NotificationPreference | null = null;

    db.update("notificationPreferences", (list) => {
      const currentList = list || [];
      const index = currentList.findIndex((p) => p.userId === userId);

      if (index !== -1) {
        updated = {
          ...currentList[index],
          ...updates,
          userId,
          updatedAt: new Date().toISOString(),
        };
        const next = [...currentList];
        next[index] = updated;
        return next;
      } else {
        const base: NotificationPreference = {
          userId,
          emailEnabled: true,
          inAppEnabled: true,
          alimtalkEnabled: true,
          categories: {
            course: { inapp: true, email: true, alimtalk: true },
            team: { inapp: true, email: true, alimtalk: false },
            investor: { inapp: true, email: true, alimtalk: true },
            community: { inapp: true, email: false, alimtalk: false },
            digest: { inapp: true, email: true, alimtalk: false },
            marketing: { inapp: true, email: false, alimtalk: false },
          },
          quietHours: {
            enabled: true,
            start: "21:00",
            end: "08:00",
          },
          snoozeUntil: null,
          updatedAt: new Date().toISOString(),
          ...updates,
        };
        updated = base;
        return [...currentList, updated];
      }
    });

    return updated!;
  }

  /**
   * 30일 알림 일시 중지 (Snooze)
   */
  public snoozeNotifications(userId: string, days = 30): NotificationPreference {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + days);

    return this.updatePreferences(userId, {
      snoozeUntil: snoozeDate.toISOString(),
    });
  }

  /**
   * Snooze 해제
   */
  public cancelSnooze(userId: string): NotificationPreference {
    return this.updatePreferences(userId, {
      snoozeUntil: null,
    });
  }

  /**
   * 1-Click 원클릭 수신 거부 (RFC 8058 대응)
   */
  public unsubscribeOneClick(userId: string, category: NotificationCategory): boolean {
    const prefs = this.getPreferences(userId);
    const updatedCategories = { ...prefs.categories };

    if (category in updatedCategories) {
      updatedCategories[category] = {
        ...updatedCategories[category],
        email: false,
        alimtalk: false,
      };
    }

    this.updatePreferences(userId, {
      categories: updatedCategories,
    });

    return true;
  }

  /**
   * 현재 시간이 야간 방해금지 시간(Quiet Hours)인지 체크
   */
  public isQuietHours(start = "21:00", end = "08:00"): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const startMinutes = startH * 60 + (startM || 0);
    const endMinutes = endH * 60 + (endM || 0);

    if (startMinutes > endMinutes) {
      // 익일 넘어가는 시간대 (예: 21:00 ~ 08:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  }

  /**
   * 템플릿 치환 렌더링 함수
   */
  public renderTemplate(templateStr: string, data: Record<string, any> = {}): string {
    return templateStr.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
      return data[key] !== undefined ? String(data[key]) : `{{${key}}}`;
    });
  }

  /**
   * Base URL 조회 (환경변수 기반)
   */
  public getBaseUrl(): string {
    return process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3005";
  }

  /**
   * 상대 경로를 절대 URL로 변환
   */
  public toAbsoluteUrl(url?: string): string {
    const baseUrl = this.getBaseUrl();
    if (!url || url === "/") return baseUrl;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  }

  /**
   * HTML 이메일 템플릿 렌더러 (호기심 갭 + 스마트 딥링크 CTA + 수신거부 하단 푸터)
   */
  public renderEmailHtml(params: {
    title: string;
    message: string;
    targetUrl: string;
    actionLabel: string;
    category: NotificationCategory;
    userName?: string;
    userId?: string;
  }): string {
    const { title, message, targetUrl, actionLabel, category, userName = "회원", userId = "user-default" } = params;
    const baseUrl = this.getBaseUrl();
    const fullTargetUrl = this.toAbsoluteUrl(targetUrl);
    const fullUnsubUrl = `${baseUrl}/api/notifications/unsubscribe?userId=${encodeURIComponent(userId)}&category=${category}`;
    const fullSettingsUrl = `${baseUrl}/mypage?tab=settings`;
    const fullHomeUrl = baseUrl;

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${fullHomeUrl}" target="_blank" style="text-decoration: none; display: block;">
                      <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                        🚀 AI로 창업하라
                      </div>
                      <div style="font-size: 11px; color: #e0e7ff; margin-top: 2px; letter-spacing: 1px; font-family: monospace;">
                        LAUNCH WITH AI
                      </div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.4;">
                ${title}
              </h2>
              <div style="font-size: 15px; line-height: 1.7; color: #d1d5db; margin-bottom: 28px; white-space: pre-line;">
                ${message}
              </div>

              <!-- CTA Button (Smart Deep Link) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${fullTargetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 14px rgba(99,102,241,0.4); letter-spacing: -0.3px;">
                      ${actionLabel} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #1f2937; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                💡 <strong>안내:</strong> 안전하고 빠른 확인을 위해 스마트 딥링크가 적용되어 있습니다. 버튼을 클릭하면 해당 화면으로 즉시 이동합니다.
              </div>
            </td>
          </tr>

          <!-- Footer & Anti-Spam (RFC 8058 Compliant) -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0d131f; border-top: 1px solid #1f2937; font-size: 12px; color: #6b7280; line-height: 1.6;">
              <div style="margin-bottom: 8px;">
                본 메일은 회원님의 계정 활동 및 플랫폼 알림 설정에 따라 발송되었습니다.
              </div>
              <div>
                (주)AI로창업하라 | 서울특별시 강남구 테헤란로 123 | 고객센터: support@launchbizs.ai
              </div>
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #1f2937;">
                <a href="${fullUnsubUrl}" target="_blank" style="color: #9ca3af; text-decoration: underline;">이 알림 유형 수신거부</a> &nbsp;|&nbsp;
                <a href="${fullSettingsUrl}" target="_blank" style="color: #9ca3af; text-decoration: underline;">알림 수신 설정 변경</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * 알림 발송 메인 메서드 (스마트 묶음, 야간 방해금지, 로깅 통합)
   */
  public async sendNotification(options: SendNotificationOptions): Promise<{
    notification: Notification;
    channelsSent: NotificationChannel[];
    logs: NotificationLog[];
  }> {
    const userId = options.userId || "user-default";
    const prefs = this.getPreferences(userId);

    // 템플릿 로드 (있는 경우)
    let finalTitle = options.title || "";
    let finalMessage = options.message || "";
    let finalTargetUrl = options.targetUrl || "/";
    let finalActionLabel = options.actionLabel || "자세히 보기";
    let finalCategory: NotificationCategory = options.category || (options.type as NotificationCategory) || "system";
    let templateCode = options.templateCode;

    if (templateCode) {
      const templates = db.get("notificationTemplates") || [];
      const tmpl = templates.find((t) => t.code === templateCode);
      if (tmpl) {
        finalCategory = tmpl.category;
        finalTitle = this.renderTemplate(tmpl.titleTemplate, options.data);
        finalMessage = this.renderTemplate(tmpl.contentTemplate, options.data);
        finalTargetUrl = this.renderTemplate(tmpl.targetUrlTemplate, options.data);
        finalActionLabel = this.renderTemplate(tmpl.actionLabelTemplate, options.data);
      }
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const createdAtStr = now.toISOString();

    // ── 1. 스마트 알림 묶음(Roll-up / Aggregation) 검사 (5분 윈도우) ──
    let targetNotification: Notification | null = null;
    const aggregationKey = options.aggregationKey;

    if (aggregationKey) {
      const existingNotifs = db.get("notifications") || [];
      const candidate = existingNotifs.find(
        (n) => n.aggregationKey === aggregationKey && !n.isRead
      );

      if (candidate) {
        const count = (candidate.aggregationCount || 1) + 1;
        const author = options.data?.author || options.sender || "사용자";
        const aggregatedTitle = `💬 ${author}님 외 ${count - 1}명이 새 반응을 남겼습니다`;

        db.update("notifications", (notifs) =>
          notifs.map((n) => {
            if (n.id === candidate.id) {
              return {
                ...n,
                title: aggregatedTitle,
                message: finalMessage,
                time: "방금 전",
                aggregationCount: count,
                createdAt: createdAtStr,
              };
            }
            return n;
          })
        );

        targetNotification = {
          ...candidate,
          title: aggregatedTitle,
          message: finalMessage,
          time: "방금 전",
          aggregationCount: count,
        };
      }
    }

    if (!targetNotification) {
      targetNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: options.type || (finalCategory as any) || "system",
        category: finalCategory,
        title: finalTitle,
        message: finalMessage,
        time: timeStr,
        isRead: false,
        sender: options.sender,
        courseTitle: options.courseTitle,
        targetUrl: finalTargetUrl,
        actionLabel: finalActionLabel,
        aggregationKey: options.aggregationKey,
        aggregationCount: 1,
        createdAt: createdAtStr,
        metadata: options.data,
      };

      db.update("notifications", (notifs) => [targetNotification!, ...notifs]);
    }

    // ── 2. 채널별 발송 및 스팸 방지/야간 억제 로직 ──
    const channelsSent: NotificationChannel[] = [];
    const logs: NotificationLog[] = [];

    // Snooze 활성화 여부 (안전한 타임스탬프 비교)
    const snoozeTime = prefs.snoozeUntil ? new Date(prefs.snoozeUntil).getTime() : 0;
    const isSnoozed = Boolean(snoozeTime && snoozeTime > now.getTime());

    // 야간 방해금지 시간 여부
    const isQuiet = Boolean(prefs.quietHours?.enabled && this.isQuietHours(prefs.quietHours.start, prefs.quietHours.end));

    const categoryPref = prefs.categories[finalCategory as keyof typeof prefs.categories] || {
      inapp: true,
      email: true,
      alimtalk: false,
    };

    // (A) 인앱 채널
    if (prefs.inAppEnabled && categoryPref.inapp) {
      channelsSent.push("inapp");
      logs.push({
        id: `log-${Date.now()}-inapp`,
        userId,
        templateCode,
        channel: "inapp",
        status: "sent",
        title: finalTitle,
        message: finalMessage,
        sentAt: createdAtStr,
        targetUrl: finalTargetUrl,
      });
    }

    // (B) 이메일 채널
    if (!options.isUrgent && isSnoozed) {
      logs.push({
        id: `log-${Date.now()}-email`,
        userId,
        templateCode,
        channel: "email",
        status: "unsubscribed",
        title: finalTitle,
        message: "[Snoozed] 30일 일시중지 상태로 이메일 발송 생략",
        sentAt: createdAtStr,
      });
    } else if (!options.isUrgent && isQuiet) {
      logs.push({
        id: `log-${Date.now()}-email`,
        userId,
        templateCode,
        channel: "email",
        status: "held_quiet_hours",
        title: finalTitle,
        message: `[야간 방해금지: ${prefs.quietHours.start}~${prefs.quietHours.end}] 익일 아침 요약 발송으로 보류`,
        sentAt: createdAtStr,
        targetUrl: finalTargetUrl,
      });
    } else if (prefs.emailEnabled && categoryPref.email) {
      channelsSent.push("email");
      logs.push({
        id: `log-${Date.now()}-email`,
        userId,
        templateCode,
        channel: "email",
        status: "sent",
        title: finalTitle,
        message: finalMessage,
        sentAt: createdAtStr,
        targetUrl: finalTargetUrl,
      });

      // 실제 SMTP 이메일 발송 실행 (비동기 처리)
      const recipient = options.recipientEmail || (userId.includes("@") ? userId : process.env.FEEDBACK_RECIPIENT_EMAIL || "mahau.master@gmail.com");
      const emailHtml = this.renderEmailHtml({
        title: finalTitle,
        message: finalMessage,
        targetUrl: finalTargetUrl,
        actionLabel: finalActionLabel,
        category: finalCategory,
        userName: options.data?.userName || "회원",
        userId,
      });

      this.sendRealEmail(recipient, finalTitle, emailHtml).catch((e) => {
        console.warn(`[NotificationService] Email delivery warning to ${recipient}:`, e?.message || e);
      });
    }

    // (C) 알림톡 채널
    if (!options.isUrgent && (isSnoozed || isQuiet)) {
      logs.push({
        id: `log-${Date.now()}-alimtalk`,
        userId,
        templateCode,
        channel: "alimtalk",
        status: isQuiet ? "held_quiet_hours" : "unsubscribed",
        title: finalTitle,
        message: "[억제] 알림톡 발송 생략",
        sentAt: createdAtStr,
      });
    } else if (prefs.alimtalkEnabled && categoryPref.alimtalk) {
      channelsSent.push("alimtalk");
      logs.push({
        id: `log-${Date.now()}-alimtalk`,
        userId,
        templateCode,
        channel: "alimtalk",
        status: "sent",
        title: finalTitle,
        message: finalMessage,
        sentAt: createdAtStr,
        targetUrl: finalTargetUrl,
      });
    }

    // DB 로그 적재
    db.update("notificationLogs", (prevLogs) => [...logs, ...(prevLogs || [])]);

    return {
      notification: targetNotification,
      channelsSent,
      logs,
    };
  }

  /**
   * 실제 SMTP 전송 메서드 (Gmail SMTP 연동)
   */
  public async sendRealEmail(to: string, subject: string, html: string): Promise<boolean> {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.log(`[NotificationService] SMTP config not set. Simulated email sent to ${to}: "${subject}"`);
      return true;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const baseUrl = this.getBaseUrl();
      const info = await transporter.sendMail({
        from: `"AI로 창업하라" <${smtpUser}>`,
        to,
        subject,
        html,
        headers: {
          "List-Unsubscribe": `<${baseUrl}/api/notifications/unsubscribe?userId=${encodeURIComponent(to)}&category=marketing>`,
        },
      });

      console.log(`[NotificationService] ✅ Real Email sent successfully to ${to} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      console.error(`[NotificationService] ❌ Failed to send real email to ${to}:`, err.message);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
