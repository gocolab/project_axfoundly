import React from "react";
import { Bot, Sparkles, Send, X, MessageSquare, ChevronDown, RefreshCw, BookOpen, Briefcase, Users } from "lucide-react";
import { api } from "../../lib/api";
import type { AITutorMessage } from "../../types";

interface AITutorWidgetProps {
  currentPage: string;
  onNavigate?: (page: string) => void;
}

export default function AITutorWidget({ currentPage, onNavigate }: AITutorWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputMessage, setInputMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<AITutorMessage[]>([
    {
      id: "init-1",
      sender: "assistant",
      content: `안녕하세요! 🚀 **AI 창업 전담 튜터**입니다.\n창업 교육 커리큘럼, AI 비즈니스 모델링, Co-founder 팀빌딩, 투자 유치(IR) 등 무엇이든 물어보세요!`,
      timestamp: "방금 전",
      suggestions: [
        "창업 교육 커리큘럼 추천해줘",
        "투자자에게 어필할 수 있는 IR 덱 팁",
        "초기 팀빌딩 매칭 방법",
      ],
    },
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: AITutorMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: "방금 전",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await api.askAITutor(text, `현재 페이지: ${currentPage}`);
      const botMsg: AITutorMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        content: res.answer,
        timestamp: "방금 전",
        suggestions: res.suggestions,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("AI Tutor request error:", error);
      const fallbackMsg: AITutorMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        content: `질문해 주신 '${text}' 관련 답변:\nAI 창업은 빠른 MVP 실행과 타깃 고객 검증이 가장 중요합니다. [교육/강의] 메뉴의 실전 부트캠프를 수강하시거나 [스타트업/IR]에 프로젝트를 등록해 보세요!`,
        timestamp: "방금 전",
        suggestions: ["추천 강의 보기", "IR 프로젝트 등록", "팀빌딩 게시판 이동"],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-brand-surface/95 backdrop-blur-xl border border-brand-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3 animate-slideUp">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-primary-container via-purple-900 to-brand-surface-high border-b border-brand-border/40 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
                <Bot size={18} className="text-brand-tertiary" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold flex items-center gap-1.5">
                  AI 창업 튜터
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                    실시간 멘토링
                  </span>
                </h3>
                <p className="text-[10px] text-white/70">창업 교육 · 팀빌딩 · 투자 실시간 Q&A</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-brand-primary-container text-white rounded-br-xs"
                      : "bg-brand-surface-high border border-brand-border/50 text-brand-on-surface rounded-bl-xs whitespace-pre-wrap"
                  }`}
                >
                  {msg.content}
                </div>

                {/* Interactive Suggestions */}
                {msg.sender === "assistant" && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="text-[10px] bg-brand-surface-low hover:bg-brand-primary/20 text-brand-tertiary border border-brand-border/40 rounded-full px-2.5 py-1 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles size={10} />
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-brand-on-surface-variant text-[11px] p-2">
                <RefreshCw size={12} className="animate-spin text-brand-primary" />
                AI 튜터가 최적의 창업 솔루션을 분석 중입니다...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Shortcuts */}
          <div className="px-4 py-1.5 bg-brand-surface-low/80 border-t border-brand-border/30 flex items-center justify-between text-[10px] text-brand-on-surface-variant">
            <span>바로가기:</span>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate && onNavigate("courses")}
                className="hover:text-white flex items-center gap-0.5 cursor-pointer"
              >
                <BookOpen size={10} /> 강의
              </button>
              <button
                onClick={() => onNavigate && onNavigate("ir")}
                className="hover:text-white flex items-center gap-0.5 cursor-pointer"
              >
                <Briefcase size={10} /> IR
              </button>
              <button
                onClick={() => onNavigate && onNavigate("community")}
                className="hover:text-white flex items-center gap-0.5 cursor-pointer"
              >
                <Users size={10} /> 팀빌딩
              </button>
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-brand-surface-low border-t border-brand-border/40 flex items-center gap-2">
            <input
              type="text"
              placeholder="창업 또는 강의 관련 질문을 입력하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 bg-gradient-to-r from-brand-primary-container to-brand-tertiary rounded-xl text-white hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shadow-sm"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Toggle Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-brand-primary-container via-purple-600 to-brand-tertiary hover:opacity-95 text-white font-display font-bold px-4 py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <span className="text-xs tracking-wide">AI 창업 튜터</span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </button>
    </div>
  );
}
