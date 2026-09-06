import "dotenv/config";
import http from "http";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initDb } from "./server/db.js";

// Route modules
import authRouter from "./server/routes/auth.js";
import coursesRouter from "./server/routes/courses.js";
import paymentsRouter from "./server/routes/payments.js";
import irRouter from "./server/routes/ir.js";
import investmentsRouter from "./server/routes/investments.js";
import communityRouter from "./server/routes/community.js";
import teamRouter from "./server/routes/team.js";
import notificationsRouter from "./server/routes/notifications.js";
import instructorRouter from "./server/routes/instructor.js";
import adminRouter from "./server/routes/admin.js";
import aiRouter from "./server/routes/ai.js";
import commonRouter from "./server/routes/common.js";
import { ogCrawlerMiddleware } from "./server/middlewares/ogCrawler.js";

const getDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};
const __dirname = getDirname();

function listenWithFallback(server: http.Server, initialPort: number, host = "0.0.0.0"): Promise<number> {
  return new Promise((resolve, reject) => {
    let port = initialPort;
    const maxTries = 10;
    let tries = 0;

    const tryListen = () => {
      const errorHandler = (err: any) => {
        if (err.code === "EADDRINUSE") {
          tries++;
          if (tries < maxTries) {
            const nextPort = port + 1;
            console.warn(`[AI Platform Server] 포트 ${port}가 이미 사용 중입니다. 포트 ${nextPort}로 자동 전환합니다...`);
            port = nextPort;
            setTimeout(() => tryListen(), 150);
          } else {
            console.error(`[AI Platform Server] 사용 가능한 포트를 찾을 수 없습니다 (${initialPort}~${port}).`);
            reject(err);
          }
        } else {
          reject(err);
        }
      };

      server.once("error", errorHandler);
      server.listen(port, host, () => {
        server.removeListener("error", errorHandler);
        resolve(port);
      });
    };

    tryListen();
  });
}

async function startServer() {
  // MongoDB 초기화 (연결 + 시드 데이터 로드)
  await initDb();

  const app = express();
  const PORT = Number(process.env.PORT) || 3010;
  const httpServer = http.createServer(app);

  // CORS 설정
  const allowedOrigins = process.env.ALLOWED_ORIGINS || "*";
  app.use((req, res, next) => {
    const origin = req.headers.origin || "";
    if (allowedOrigins === "*") {
      res.header("Access-Control-Allow-Origin", "*");
    } else {
      const origins = allowedOrigins.split(",").map((o) => o.trim());
      if (origins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
      }
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(express.json());

  // Register API Routes
  app.use("/api/auth", authRouter);
  app.use("/api/courses", coursesRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/ir", irRouter);
  app.use("/api/investments", investmentsRouter);
  app.use("/api/community", communityRouter);
  app.use("/api/team", teamRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/instructor", instructorRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/common", commonRouter);

  // Fallback for legacy endpoints
  app.use("/api", aiRouter);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Social media bot Open Graph crawler middleware
  app.use(ogCrawlerMiddleware);

  // Serve static UI assets and handle hot reload in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: path.join(__dirname, "vite.config.ts"),
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const boundPort = await listenWithFallback(httpServer, PORT, "0.0.0.0");
  console.log(`[AI Platform Server] Running on http://localhost:${boundPort}`);
}

startServer();
