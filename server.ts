import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-initialized Gemini Client
let googleAIClient: GoogleGenAI | null = null;
function getGoogleAI(): GoogleGenAI {
  if (!googleAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in the secrets panel.");
    }
    googleAIClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return googleAIClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Persona Diagnosis
  app.post("/api/diagnosis", async (req, res) => {
    try {
      const { answers } = req.body;
      if (!answers) {
        return res.status(400).json({ error: "Survey answers are required." });
      }

      const client = getGoogleAI();
      const prompt = `
You are the elite Principal AI Architect of Accelerator Hub (Nexus Lab). 
Analyze the following builder's survey responses and construct an extremely professional, inspiring, and technical "B2B AI Architect Profile" detailed report in Korean.

Survey Answers:
- 역할 (Role): ${answers.role || "Not specified"}
- 핵심 기술분야 (CoreTech): ${answers.focus || "Not specified"}
- 개발 단계 (Stage): ${answers.stage || "Not specified"}
- 팀 규모 (Team): ${answers.team || "Not specified"}
- 최대 직면 과제 (Challenge): ${answers.challenge || "Not specified"}

Construct the report with the following 5 structured sections in rich Markdown format. Be specific, structured, and use rich developer/B2B terminology fitting the "Accelerator Core" theme:
1. **[페르소나 매칭 및 진단]** (Detailed builder type evaluation, witty naming of their archetype, and specific talent matches based on their role and team)
2. **[맞춤형 액셀러레이터 트랙 추천]** (Specific bootcamp/event recommendations like "LLM 파인튜닝 마스터리" or "B2B 에이전틱 워크플로우" matching their coretech and challenge)
3. **[AI 아키텍처 맞춤 설계 청사진]** (Provide a conceptual diagram or specific system diagram in text/markdown, and describe the deployment solution, caching, and latency optimization matching their coretech)
4. **[추천 라이브러리 및 에셋]** (Recommend specific starter assets to download, e.g., JSON schemas or YAML prompt kits)
5. **[3,000 XP 획득을 위한 단계별 실천 로드맵]** (5 clear professional actions they should perform in the Accelerator Hub to unlock the next level and scale their AI startup)

Make the tone highly professional, encouraging, and deeply technical (referencing parameters, models, vector stores, and workflow automation).
`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the Chief AI Architect at B2B Accelerator Hub. You speak Korean perfectly, using polished, modern tech startup vocabulary. Format output concisely and beautifully in Markdown.",
          temperature: 0.8,
        },
      });

      res.json({ report: response.text });
    } catch (error: any) {
      console.error("Diagnosis error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI Persona Report." });
    }
  });

  // API Route: Laboratory Mentor AI Chat
  app.post("/api/innovation-chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const client = getGoogleAI();
      const chatHistory = (history || []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      // Add the final user message to the chat contents
      const chat = client.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: "You are 'Nexus Lead Mentor', an authoritative, highly knowledgeable B2B AI Incubator assistant. You guide elite developers on how to scale LLM pipeline, optimize fine-tuning, implement secure multi-agents, and pitch deep learning architectures. Answer concisely and professionally in Korean with clean code or prompt design examples where appropriate.",
        },
      });

      // Maintain history if provided, otherwise just query
      let responseText = "";
      if (chatHistory.length > 0) {
        // Feed mock history manually or simply send messages
        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            ...chatHistory,
            { role: "user", parts: [{ text: message }] }
          ]
        });
        responseText = response.text || "";
      } else {
        const response = await chat.sendMessage({ message });
        responseText = response.text || "";
      }

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Chat mentor error:", error);
      res.status(500).json({ error: error.message || "Failed to obtain mentor response." });
    }
  });

  // API Route: Mock Registration State or Dynamic Action
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Serve static UI assets and handle hot reload in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Accelerator Hub Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
