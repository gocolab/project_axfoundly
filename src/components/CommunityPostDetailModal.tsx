import React from "react";
import {
  X,
  MessageSquare,
  Eye,
  Send,
  User,
  Shield,
  Briefcase,
  CornerDownRight,
  Pin,
} from "lucide-react";
import type { BoardPost, Comment, UserRole } from "../types";
import { api } from "../lib/api";

interface CommunityPostDetailModalProps {
  post: BoardPost | null;
  onClose: () => void;
  isLoggedIn: boolean;
  userRole: UserRole;
  userName: string;
  onLoginClick: () => void;
  onCommentAdded?: (newComment: Comment) => void;
  onSendTeamRequest?: (projectName: string, message: string) => void;
}

export default function CommunityPostDetailModal({
  post,
  onClose,
  isLoggedIn,
  userRole,
  userName,
  onLoginClick,
  onCommentAdded,
  onSendTeamRequest,
}: CommunityPostDetailModalProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [commentInput, setCommentInput] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Team proposal inside post
  const [showTeamProposalInput, setShowTeamProposalInput] = React.useState(false);
  const [proposalMsg, setProposalMsg] = React.useState("");

  React.useEffect(() => {
    if (!post) return;
    setLoading(true);
    api
      .getComments(post.id)
      .then((res) => {
        setComments(res.comments || []);
      })
      .catch((err) => console.error("Failed to load comments", err))
      .finally(() => setLoading(false));
  }, [post?.id]);

  if (!post) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (!isLoggedIn) {
      onLoginClick();
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.addComment(post.id, {
        author: userName,
        authorRole: userRole,
        content: commentInput.trim(),
      });
      setComments((prev) => [...prev, res.comment]);
      setCommentInput("");
      if (onCommentAdded) onCommentAdded(res.comment);
    } catch (error) {
      console.error("Failed to submit comment", error);
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendTeamProposal = () => {
    if (!proposalMsg.trim()) return;
    if (!isLoggedIn) {
      onLoginClick();
      return;
    }
    if (onSendTeamRequest) {
      onSendTeamRequest(post.title, proposalMsg.trim());
    } else {
      api.sendTeamRequest({
        projectName: post.title,
        fromUser: userName,
        role: "팀원",
        message: proposalMsg.trim(),
      }).then(() => {
        alert("팀 빌딩 제안이 전송되었습니다!");
      });
    }
    setProposalMsg("");
    setShowTeamProposalInput(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-panel-heavy rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-brand-border overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-brand-border/40 flex justify-between items-start bg-brand-surface-low/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                post.boardType === "공지사항"
                  ? "bg-brand-accent-rose/15 text-brand-accent-rose border border-brand-accent-rose/30"
                  : post.boardType === "팀빌딩"
                  ? "bg-brand-tertiary/15 text-brand-tertiary border border-brand-tertiary/30"
                  : "bg-brand-primary-container/15 text-brand-primary border border-brand-primary/30"
              }`}
            >
              {post.boardType}
            </span>
            {post.isPinned && (
              <span className="text-[10px] bg-brand-accent-rose/20 text-brand-accent-rose px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                <Pin size={10} /> 공지 고정
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Post Header */}
          <div>
            <h2 className="font-display text-xl font-bold text-white leading-snug">
              {post.title}
            </h2>
            <div className="flex items-center justify-between text-xs text-brand-on-surface-variant mt-3 pb-4 border-b border-brand-border/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-primary-container/30 border border-brand-primary-container/40 flex items-center justify-center text-xs font-bold text-white">
                  {post.author.charAt(0)}
                </div>
                <span className="font-medium text-white">{post.author}</span>
                <span>•</span>
                <span>{post.createdAt}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye size={13} /> {post.viewCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={13} /> {comments.length}
                </span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="text-sm text-brand-on-surface leading-relaxed whitespace-pre-wrap bg-brand-surface-low/40 p-4 rounded-xl border border-brand-border/20">
            {post.content}
          </div>

          {/* Team Building Special Action */}
          {post.boardType === "팀빌딩" && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-brand-tertiary/10 to-brand-primary-container/10 border border-brand-tertiary/30 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-brand-tertiary" />
                  <span className="text-xs font-bold text-white">Co-founder / 팀원 합류에 관심이 있으신가요?</span>
                </div>
                {!showTeamProposalInput && (
                  <button
                    onClick={() => setShowTeamProposalInput(true)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-brand-tertiary text-white font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    팀 합류 제안하기
                  </button>
                )}
              </div>

              {showTeamProposalInput && (
                <div className="mt-2 space-y-2 animate-fadeIn">
                  <textarea
                    value={proposalMsg}
                    onChange={(e) => setProposalMsg(e.target.value)}
                    placeholder="담당자에게 전할 간단한 자기소개 및 보유 기술/포트폴리오 링크를 남겨주세요."
                    className="w-full bg-brand-surface-high border border-brand-border rounded-lg p-3 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-tertiary h-20 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowTeamProposalInput(false)}
                      className="px-3 py-1 text-xs text-brand-on-surface-variant hover:text-white"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSendTeamProposal}
                      className="px-4 py-1.5 text-xs bg-brand-tertiary text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      제안 전송
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-brand-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider">
              <MessageSquare size={13} className="text-brand-primary" />
              댓글 ({comments.length})
            </h3>

            {loading ? (
              <div className="py-6 text-center text-xs text-brand-on-surface-variant">댓글 로딩 중...</div>
            ) : comments.length === 0 ? (
              <div className="py-6 text-center text-xs text-brand-on-surface-variant bg-brand-surface-low/30 rounded-xl border border-dashed border-brand-border/40">
                첫 번째 댓글을 작성해보세요!
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-xl bg-brand-surface-low border border-brand-border/30 flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-brand-surface-high flex items-center justify-center text-[10px] font-bold text-brand-primary">
                          {comment.author.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-white">{comment.author}</span>
                        {comment.authorRole && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-primary-container/10 text-brand-primary">
                            {comment.authorRole === "admin" ? "관리자" : "수강생"}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-brand-on-surface-variant">{comment.createdAt}</span>
                    </div>
                    <p className="text-xs text-brand-on-surface pl-7">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer (Comment Input Box) */}
        <div className="p-4 border-t border-brand-border/40 bg-brand-surface-low/90">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={isLoggedIn ? "의견이나 질문을 댓글로 남겨보세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
              disabled={submitting}
              className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors"
            />
            <button
              type="submit"
              disabled={submitting || !commentInput.trim()}
              className="bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold px-4 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer text-xs flex items-center gap-1.5 shadow-md flex-shrink-0"
            >
              <Send size={13} />
              등록
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
