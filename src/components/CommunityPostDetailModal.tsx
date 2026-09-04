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
  Trash2,
} from "lucide-react";
import type { BoardPost, Comment, UserRole } from "../types";
import { api } from "../lib/api";
import { useToast } from "./common/Toast";

interface CommunityPostDetailModalProps {
  key?: React.Key;
  post: BoardPost | null;
  onClose: () => void;
  isLoggedIn: boolean;
  userRoles: UserRole[];
  userName: string;
  onLoginClick: () => void;
  onCommentAdded?: (newComment: Comment) => void;
  onDeletePost?: (postId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onSendTeamRequest?: (projectName: string, message: string) => void;
  inline?: boolean;
}

export default function CommunityPostDetailModal({
  post,
  onClose,
  isLoggedIn,
  userRoles,
  userName,
  onLoginClick,
  onCommentAdded,
  onDeletePost,
  onDeleteComment,
  onSendTeamRequest,
  inline = false,
}: CommunityPostDetailModalProps) {
  const toast = useToast();
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [commentInput, setCommentInput] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [deletingPost, setDeletingPost] = React.useState(false);

  const isAdmin = userRoles.includes("admin") || userRoles.includes("manager");
  const isPostAuthor = isLoggedIn && post?.author === userName;
  const canDeletePost = isAdmin || isPostAuthor;

  // Team proposal inside post
  const [showTeamProposalInput, setShowTeamProposalInput] = React.useState(false);
  const [proposalMsg, setProposalMsg] = React.useState("");

  // ESC key listener to close detail
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
    if (!isLoggedIn) {
      onLoginClick();
      return;
    }
    if (!commentInput.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.addComment(post.id, {
        author: userName,
        authorRoles: userRoles,
        content: commentInput.trim(),
      });
      setComments((prev) => [...prev, res.comment]);
      setCommentInput("");
      toast.success("댓글 등록 완료", "댓글이 성공적으로 등록되었습니다.");
      if (onCommentAdded) onCommentAdded(res.comment);
    } catch (error) {
      console.error("Failed to submit comment", error);
      toast.error("댓글 작성 실패", "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
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
      toast.success("팀 빌딩 제안 전송 완료", "작성자에게 팀 빌딩 제안이 성공적으로 전달되었습니다.");
    } else {
      api.sendTeamRequest({
        projectName: post.title,
        fromUser: userName,
        role: "팀원",
        message: proposalMsg.trim(),
      }).then(() => {
        toast.success("팀 빌딩 제안 전송 완료", "작성자에게 팀 빌딩 제안이 성공적으로 전달되었습니다.");
      }).catch(() => {
        toast.error("제안 전송 실패", "일시적인 오류가 발생했습니다.");
      });
    }
    setProposalMsg("");
    setShowTeamProposalInput(false);
  };

  const handleDeletePost = async () => {
    const confirmed = await toast.confirm({
      title: "게시글 삭제 확인",
      message: "정말로 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.",
      confirmText: "삭제",
      cancelText: "취소",
      type: "danger",
    });
    if (!confirmed) return;
    setDeletingPost(true);
    try {
      await api.deletePost(post.id, { author: userName, userRoles });
      toast.success("게시글 삭제 완료", "게시글이 성공적으로 삭제되었습니다.");
      if (onDeletePost) onDeletePost(post.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete post", error);
      toast.error("게시글 삭제 실패", "게시글 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingPost(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const confirmed = await toast.confirm({
      title: "댓글 삭제 확인",
      message: "댓글을 삭제하시겠습니까?",
      confirmText: "삭제",
      cancelText: "취소",
      type: "danger",
    });
    if (!confirmed) return;
    try {
      await api.deleteComment(post.id, commentId, { author: userName, userRoles });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("댓글 삭제 완료", "댓글이 삭제되었습니다.");
      if (onDeleteComment) onDeleteComment(commentId);
    } catch (error) {
      console.error("Failed to delete comment", error);
      toast.error("댓글 삭제 실패", "댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  const content = (
    <div className={`glass-panel-heavy ${inline ? "rounded-2xl border border-brand-border/60 shadow-xl" : "rounded-l-2xl border-l border-brand-border shadow-2xl animate-slideInFromRight"} w-full h-full flex flex-col overflow-hidden`}>
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-brand-border/40 flex justify-between items-start bg-brand-surface-low/80">
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
          <div className="flex items-center gap-2">
            {canDeletePost && (
              <button
                onClick={handleDeletePost}
                disabled={deletingPost}
                className="p-1 px-2 rounded-lg text-brand-accent-rose/80 hover:text-brand-accent-rose hover:bg-brand-accent-rose/10 transition-colors cursor-pointer text-xs flex items-center gap-1 border border-brand-accent-rose/20"
                title="게시글 삭제"
              >
                <Trash2 size={13} />
                <span className="text-[11px] font-semibold">{deletingPost ? "삭제 중..." : "삭제"}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
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
                        {comment.authorRoles && (comment.authorRoles.includes("admin") || comment.authorRoles.includes("manager")) && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-primary-container/10 text-brand-primary font-medium">
                            관리자
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-brand-on-surface-variant">{comment.createdAt}</span>
                        {(isAdmin || (isLoggedIn && comment.author === userName)) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-brand-on-surface-variant/60 hover:text-brand-accent-rose transition-colors p-0.5 cursor-pointer"
                            title="댓글 삭제"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
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
  );

  if (inline) {
    return content;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-brand-surface/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg h-full flex flex-col">
        {content}
      </div>
    </div>
  );
}
