import React from "react";
import {
  MessageSquare,
  Users,
  HelpCircle,
  Megaphone,
  Pin,
  Eye,
  Plus,
  X,
  Send,
} from "lucide-react";
import type { BoardPost, BoardType } from "../types";

interface CommunityPageProps {
  posts: BoardPost[];
  onAddPost: (post: Omit<BoardPost, "id" | "viewCount" | "commentCount" | "authorAvatar">) => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export default function CommunityPage({ posts, onAddPost, isLoggedIn, onLoginClick }: CommunityPageProps) {
  const [activeBoard, setActiveBoard] = React.useState<BoardType | "전체">("전체");
  const [showWriteModal, setShowWriteModal] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newContent, setNewContent] = React.useState("");
  const [newBoardType, setNewBoardType] = React.useState<BoardType>("QnA");

  const boards: { type: BoardType | "전체"; label: string; icon: React.ReactNode; desc: string }[] = [
    { type: "전체", label: "전체", icon: <MessageSquare size={14} />, desc: "모든 게시판" },
    { type: "공지사항", label: "공지사항", icon: <Megaphone size={14} />, desc: "플랫폼 공식 알림" },
    { type: "팀빌딩", label: "팀 빌딩", icon: <Users size={14} />, desc: "Co-founder 모집 게시판" },
    { type: "QnA", label: "Q&A 자유게시판", icon: <HelpCircle size={14} />, desc: "기술/사업 질의응답" },
  ];

  const filtered = activeBoard === "전체" ? posts : posts.filter((p) => p.boardType === activeBoard);

  const handleSubmit = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddPost({
      boardType: newBoardType,
      title: newTitle,
      content: newContent,
      author: "나",
      createdAt: "방금 전",
      isPinned: false,
    });
    setNewTitle("");
    setNewContent("");
    setShowWriteModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">커뮤니티</h1>
          <p className="text-sm text-brand-on-surface-variant mt-1">멀티 게시판 — 공지, 팀 빌딩, Q&A</p>
        </div>
        <button
          onClick={() => {
            if (!isLoggedIn) { onLoginClick(); return; }
            setShowWriteModal(true);
          }}
          className="bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm flex items-center gap-1.5"
        >
          <Plus size={14} />
          글쓰기
        </button>
      </div>

      {/* Board Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {boards.map((board) => (
          <button
            key={board.type}
            onClick={() => setActiveBoard(board.type)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border whitespace-nowrap transition-all cursor-pointer text-xs font-medium ${
              activeBoard === board.type
                ? "bg-brand-primary-container/20 border-brand-primary-container/40 text-brand-primary"
                : "border-brand-border text-brand-on-surface-variant hover:text-white hover:border-brand-surface-highest"
            }`}
          >
            {board.icon}
            {board.label}
          </button>
        ))}
      </div>

      {/* Active board description */}
      {activeBoard !== "전체" && (
        <div className="mb-4 px-4 py-2.5 bg-brand-surface-low rounded-lg border border-brand-border/30">
          <p className="text-xs text-brand-on-surface-variant">
            {boards.find((b) => b.type === activeBoard)?.desc}
          </p>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-brand-surface-low border-b border-brand-border/30 text-[10px] font-mono text-brand-on-surface-variant uppercase tracking-wider">
          <span className="col-span-1">분류</span>
          <span className="col-span-7 sm:col-span-6">제목</span>
          <span className="col-span-2 hidden sm:block">작성자</span>
          <span className="col-span-2 sm:col-span-1 text-center">조회</span>
          <span className="col-span-2 text-right">날짜</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-brand-on-surface-variant">
            게시글이 없습니다
          </div>
        ) : (
          filtered.map((post, idx) => (
            <div
              key={post.id}
              className={`grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-brand-surface-low transition-colors cursor-pointer ${
                idx < filtered.length - 1 ? "border-b border-brand-border/20" : ""
              } ${post.isPinned ? "bg-brand-primary-container/5" : ""}`}
            >
              <div className="col-span-1">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  post.boardType === "공지사항" ? "bg-brand-accent-rose/10 text-brand-accent-rose" :
                  post.boardType === "팀빌딩" ? "bg-brand-tertiary/10 text-brand-tertiary" :
                  "bg-brand-primary-container/10 text-brand-primary"
                }`}>
                  {post.boardType === "공지사항" ? "공지" : post.boardType === "팀빌딩" ? "팀" : "Q&A"}
                </span>
              </div>
              <div className="col-span-7 sm:col-span-6 flex items-center gap-1.5 min-w-0">
                {post.isPinned && <Pin size={10} className="text-brand-accent-rose flex-shrink-0" />}
                <span className="text-xs text-white truncate font-medium">{post.title}</span>
                {post.commentCount > 0 && (
                  <span className="text-[9px] text-brand-primary flex-shrink-0">[{post.commentCount}]</span>
                )}
              </div>
              <div className="col-span-2 hidden sm:flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-brand-surface-high flex items-center justify-center text-[8px] font-bold text-brand-primary">
                  {post.author.charAt(0)}
                </div>
                <span className="text-[10px] text-brand-on-surface-variant truncate">{post.author}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 text-center">
                <span className="text-[10px] text-brand-on-surface-variant flex items-center justify-center gap-0.5">
                  <Eye size={9} /> {post.viewCount}
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-[10px] text-brand-on-surface-variant">{post.createdAt}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Write Post Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg font-bold text-white">글쓰기</h3>
              <button onClick={() => setShowWriteModal(false)} className="text-brand-on-surface-variant hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Board Type Select */}
              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1.5">게시판 선택</label>
                <div className="flex gap-2">
                  {(["팀빌딩", "QnA"] as BoardType[]).map((bt) => (
                    <button
                      key={bt}
                      onClick={() => setNewBoardType(bt)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        newBoardType === bt
                          ? "bg-brand-primary-container/20 border-brand-primary-container/40 text-brand-primary font-bold"
                          : "border-brand-border text-brand-on-surface-variant hover:text-white"
                      }`}
                    >
                      {bt === "팀빌딩" ? "팀 빌딩" : "Q&A 자유게시판"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1.5">제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="글 제목을 입력하세요"
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1.5">내용</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="내용을 작성하세요..."
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors h-36 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowWriteModal(false)}
                  className="flex-1 border border-brand-border text-white py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-sm"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm flex items-center justify-center gap-1.5"
                >
                  <Send size={14} />
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
