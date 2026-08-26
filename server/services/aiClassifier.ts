import { GoogleGenAI } from "@google/genai";

let googleAIClient: GoogleGenAI | null = null;
function getGoogleAI(): GoogleGenAI | null {
  if (!googleAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return null;
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

function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("LLM classification request timed out")), ms)
    ),
  ]);
}

export interface ClassificationResult {
  category: string;
  tags: string[];
  aiSummary: string;
}

/**
 * 사용자 입력 본문(제목, 설명, 문제/해결책 등)을 분석하여
 * 카테고리(category), 키워드 태그(tags), 한줄 요약(aiSummary)을 100% 자동 생성/추출합니다.
 */
export async function classifyContent(
  type: "ir" | "course",
  payload: {
    title: string;
    description?: string;
    oneLiner?: string;
    problem?: string;
    solution?: string;
    businessModel?: string;
    curriculumSummary?: string;
  }
): Promise<ClassificationResult> {
  const fullText = [
    `제목: ${payload.title}`,
    payload.oneLiner ? `한줄소개: ${payload.oneLiner}` : "",
    payload.description ? `상세설명: ${payload.description}` : "",
    payload.problem ? `해결하려는 문제: ${payload.problem}` : "",
    payload.solution ? `솔루션/기술: ${payload.solution}` : "",
    payload.businessModel ? `비즈니스모델: ${payload.businessModel}` : "",
    payload.curriculumSummary ? `커리큘럼: ${payload.curriculumSummary}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = getGoogleAI();
    if (!client) {
      throw new Error("No Gemini API Key provided");
    }

    const systemInstruction =
      type === "ir"
        ? `당신은 스타트업 IR 투자 분석 및 기술 분류 전문 AI입니다.
주어진 스타트업 본문을 심층 분석하여 다음 세 가지를 JSON으로 추출하세요:
1. 'category': 가장 직관적인 한국어 산업 분야 (예: 'AI/딥테크', '바이오·헬스케어', '핀테크/금융', 'B2B SaaS', '에듀테크', '모빌리티', '커머스/플랫폼', '콘텐츠/미디어', '로보틱스/하드웨어', '친환경/에너지' 등)
2. 'tags': 핵심 비즈니스 및 기술 키워드 3~5개의 배열 (예: ['의료AI', '비대면진료', '원격모니터링'])
3. 'aiSummary': 투자자가 한눈에 이해할 수 있는 1~2문장의 명확한 비즈니스 요약 문구

반드시 마크다운 백틱 없이 순수 JSON 형식만 반환하세요:
{"category": "...", "tags": ["...", "..."], "aiSummary": "..."}`
        : `당신은 실무 교육 커리큘럼 분석 및 강의 분류 전문 AI입니다.
주어진 강의 본문을 심층 분석하여 다음 세 가지를 JSON으로 추출하세요:
1. 'category': 가장 직관적인 한국어 교육 분야 (예: 'AI 모델링', '비즈니스 기획', '개발·IT', '마케팅·그로스', '투자·IR', '디자인/UX' 등)
2. 'tags': 수강생이 습득할 핵심 실무 스킬/도구 키워드 3~5개의 배열 (예: ['LLM', 'RAG', 'LangChain', '프롬프트'])
3. 'aiSummary': 강의의 핵심 학습 효과와 목표를 요약한 1~2문장의 문구

반드시 마크다운 백틱 없이 순수 JSON 형식만 반환하세요:
{"category": "...", "tags": ["...", "..."], "aiSummary": "..."}`;

    const response = await withTimeout(
      client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullText,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      })
    );

    const rawText = response.text || "";
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      category: parsed.category || (type === "ir" ? "AI/딥테크" : "AI 모델링"),
      tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : generateRuleBasedTags(fullText),
      aiSummary: parsed.aiSummary || payload.oneLiner || payload.description?.slice(0, 100) || payload.title,
    };
  } catch (error) {
    // LLM 실패 시 고품질 규칙 기반(Rule-based) 스마트 폴백
    return generateSmartFallback(type, payload, fullText);
  }
}

function generateRuleBasedTags(text: string): string[] {
  const t = text.toLowerCase();
  const matched: string[] = [];

  const keywords = [
    { key: "rag", tag: "RAG" },
    { key: "llm", tag: "LLM" },
    { key: "agent", tag: "AI에이전트" },
    { key: "에이전트", tag: "AI에이전트" },
    { key: "의료", tag: "의료AI" },
    { key: "바이오", tag: "바이오헬스" },
    { key: "핀테크", tag: "핀테크" },
    { key: "금융", tag: "금융AI" },
    { key: "saas", tag: "B2B SaaS" },
    { key: "투자", tag: "투자유치" },
    { key: "ir", tag: "IR피칭" },
    { key: "창업", tag: "초기창업" },
    { key: "mvp", tag: "MVP개발" },
    { key: "프롬프트", tag: "프롬프트엔지니어링" },
    { key: "자동화", tag: "업무자동화" },
    { key: "마케팅", tag: "그로스마케팅" },
    { key: "커머스", tag: "이커머스" },
    { key: "모빌리티", tag: "모빌리티" },
    { key: "로봇", tag: "로보틱스" },
    { key: "데이터", tag: "데이터분석" },
  ];

  for (const item of keywords) {
    if (t.includes(item.key) && !matched.includes(item.tag)) {
      matched.push(item.tag);
      if (matched.length >= 4) break;
    }
  }

  if (matched.length === 0) {
    matched.push("AI창업", "실전MVP", "스타트업");
  }

  return matched;
}

function generateSmartFallback(
  type: "ir" | "course",
  payload: any,
  fullText: string
): ClassificationResult {
  const t = fullText.toLowerCase();

  let category = type === "ir" ? "AI/딥테크" : "AI 모델링";

  if (type === "ir") {
    if (t.includes("의료") || t.includes("바이오") || t.includes("헬스") || t.includes("진료") || t.includes("환자")) {
      category = "바이오·헬스케어";
    } else if (t.includes("금융") || t.includes("결제") || t.includes("투자") || t.includes("핀테크") || t.includes("자산")) {
      category = "핀테크/금융";
    } else if (t.includes("saas") || t.includes("b2b") || t.includes("업무") || t.includes("기업용") || t.includes("생산성")) {
      category = "B2B SaaS";
    } else if (t.includes("교육") || t.includes("학습") || t.includes("수강") || t.includes("에듀")) {
      category = "에듀테크";
    } else if (t.includes("물류") || t.includes("배송") || t.includes("차량") || t.includes("자율주행") || t.includes("모빌리티")) {
      category = "모빌리티";
    } else if (t.includes("커머스") || t.includes("쇼핑") || t.includes("유통") || t.includes("마켓")) {
      category = "커머스/플랫폼";
    } else if (t.includes("콘텐츠") || t.includes("영상") || t.includes("미디어") || t.includes("웹툰")) {
      category = "콘텐츠/미디어";
    }
  } else {
    if (t.includes("기획") || t.includes("비즈니스") || t.includes("bm") || t.includes("아이템") || t.includes("창업")) {
      category = "비즈니스 기획";
    } else if (t.includes("마케팅") || t.includes("그로스") || t.includes("광고") || t.includes("고객유치")) {
      category = "마케팅·그로스";
    } else if (t.includes("개발") || t.includes("코딩") || t.includes("풀스택") || t.includes("서버") || t.includes("프론트")) {
      category = "개발·IT";
    } else if (t.includes("투자") || t.includes("ir") || t.includes("재무") || t.includes("피칭")) {
      category = "투자·IR";
    } else if (t.includes("디자인") || t.includes("ui") || t.includes("ux") || t.includes("피그마")) {
      category = "디자인/UX";
    }
  }

  const tags = generateRuleBasedTags(fullText);
  const aiSummary =
    payload.oneLiner ||
    (payload.description ? `${payload.description.slice(0, 75)}...` : `${payload.title} 프로젝트/강의`);

  return {
    category,
    tags,
    aiSummary,
  };
}
