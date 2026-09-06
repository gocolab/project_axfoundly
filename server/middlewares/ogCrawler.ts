import type { Request, Response, NextFunction } from "express";
import { db } from "../db.js";
import type { Course, IRProject, BoardPost } from "../../src/types.js";

const BOT_USER_AGENTS = [
  "kakaotalk-scrap",
  "facebookexternalhit",
  "slackbot",
  "twitterbot",
  "linkedinbot",
  "telegrambot",
  "discordbot",
  "bingbot",
  "googlebot",
  "yandexbot",
];

function isSocialBot(userAgent?: string): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function ogCrawlerMiddleware(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.headers["user-agent"] || "";

  if (!isSocialBot(userAgent)) {
    return next();
  }

  const urlPath = req.path;
  const host = req.get("host") || "localhost:3010";
  const protocol = req.protocol || "http";
  const origin = `${protocol}://${host}`;
  const fullUrl = `${origin}${req.originalUrl}`;

  let title = "AI로 창업하라 — 교육부터 팀 빌딩, 투자 유치까지";
  let description = "AI 기반 원스톱 스타트업 창업 및 매칭 플랫폼";
  let image = `${origin}/favicon.ico`;

  // 1. 강의 상세 (/courses/:id)
  const courseMatch = urlPath.match(/^\/courses\/([^/]+)/);
  if (courseMatch) {
    const courseId = courseMatch[1];
    const courses = (db.get("courses") || []) as Course[];
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      title = `${course.title} | AI로 창업하라`;
      description = `${course.aiSummary || course.description || ""} [강사: ${course.instructor}]`;
      if (course.thumbnail) {
        image = course.thumbnail.startsWith("http") ? course.thumbnail : `${origin}${course.thumbnail}`;
      }
    }
  }

  // 2. IR 프로젝트 상세 (/ir/:id)
  const irMatch = urlPath.match(/^\/ir\/([^/]+)/);
  if (irMatch) {
    const projId = irMatch[1];
    const projects = (db.get("irProjects") || []) as IRProject[];
    const proj = projects.find((p) => p.id === projId);
    if (proj) {
      const teamName = proj.isAnonymous
        ? proj.anonymousTeamName || `${proj.field} 스텔스 창업팀`
        : proj.teamName;
      title = `[IR 프로젝트] ${proj.title} (${teamName}) | AI로 창업하라`;
      description = proj.oneLiner || proj.problem || description;
      if (proj.thumbnail) {
        image = proj.thumbnail.startsWith("http") ? proj.thumbnail : `${origin}${proj.thumbnail}`;
      }
    }
  }

  // 3. 커뮤니티 게시글 상세 (/community/:id)
  const communityMatch = urlPath.match(/^\/community\/([^/]+)/);
  if (communityMatch) {
    const postId = communityMatch[1];
    const posts = (db.get("posts") || []) as BoardPost[];
    const post = posts.find((p) => p.id === postId);
    if (post) {
      title = `[${post.boardType}] ${post.title} | AI로 창업하라 커뮤니티`;
      description = (post.content || "").slice(0, 160);
    }
  }

  // 소셜 봇용 정적 메타태그 HTML 반환
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="AI로 창업하라" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:url" content="${escapeHtml(fullUrl)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(html);
}
