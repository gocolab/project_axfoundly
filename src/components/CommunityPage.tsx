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
  Search,
  CheckCircle2,
  Lock,
  Lightbulb,
} from "lucide-react";
import type { BoardPost, BoardType, UserRole, AdminBoard } from "../types";
import Pagination from "./common/Pagination";
import SearchBar from "./common/SearchBar";
import HighlightText from "./common/HighlightText";
import { multiMatch } from "../utils/searchUtils";
import { useUrlPagination } from "../hooks/useUrlQueryState";
import CommunityPostDetailModal from "./CommunityPostDetailModal";
import { api } from "../lib/api";
import { useToast } from "./common/Toast";

interface CommunityPageProps {
  posts: BoardPost[];
  onAddPost: (post: Omit<BoardPost, "id" | "viewCount" | "commentCount" | "authorAvatar">) => void;
  onUpdatePost?: (post: BoardPost) => void;
  onDeletePost?: (postId: string) => void;
  isLoggedIn: boolean;
  userRoles?: UserRole[];
  userName?: string;
  onLoginClick: () => void;
  initialPostId?: string | null;
  onClearSelectedPost?: () => void;
  adminBoards?: AdminBoard[];
}

export default function CommunityPage({
  posts,
  onAddPost,
  onUpdatePost,
  onDeletePost,
  isLoggedIn,
  userRoles = ["member"],
  userName = "김수강생",
  onLoginClick,
  initialPostId,
  onClearSelectedPost,
  adminBoards = [],
}: CommunityPageProps) {
  const toast = useToast();
  const isAdmin = userRoles.includes("admin") || userRoles.includes("manager");
  const [activeBoard, setActiveBoard] = React.useState<string>("전체");
  const {
    page: currentPage,
    setPage: setCurrentPage,
    query: searchText,
    setQuery: setSearchText,
  } = useUrlPagination({ pageKey: "page", queryKey: "q", defaultPage: 1 });
  const [itemsPerPage, setItemsPerPage] = React.useState(6);

  const [isClosing, setIsClosing] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState<BoardPost | null>(null);
  const [selectedPost, setSelectedPost] = React.useState<BoardPost | null>(() => {
    if (initialPostId) {
      return posts.find((p) => p.id === initialPostId) || null;
    }
    return null;
  });

  React.useEffect(() => {
    if (initialPostId) {
      const match = posts.find((p) => p.id === initialPostId);
      if (match) {
        setSelectedPost(match);
      }
    }
  }, [initialPostId, posts]);

  const [showWriteModal, setShowWriteModal] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newContent, setNewContent] = React.useState("");
  const [newBoardType, setNewBoardType] = React.useState<string>("QnA");
  const [newIsPinned, setNewIsPinned] = React.useState(false);

  // 동적 게시판 탭 구성 (관리자 등록 게시판 연동)
  const boards = React.useMemo(() => {
    const defaultList = [
      { type: "전체", label: "전체", icon: <MessageSquare size={14} />, desc: "모든 게시판" },
      { type: "공지사항", label: "공지사항", icon: <Megaphone size={14} />, desc: "플랫폼 공식 알림", writePermission: "관리자" },
      { type: "팀빌딩", label: "팀 빌딩", icon: <Users size={14} />, desc: "Co-founder 모집 게시판", writePermission: "회원" },
      { type: "QnA", label: "Q&A 자유게시판", icon: <HelpCircle size={14} />, desc: "기술/사업 질의응답", writePermission: "회원" },
      { type: "수강생 역제안", label: "수강생 역제안", icon: <Lightbulb size={14} />, desc: "배우고 싶은 강의 수요 역제안 게시판", writePermission: "회원" },
    ];

    if (!adminBoards || adminBoards.length === 0) {
      return defaultList;
    }

    const dynamicBoards = adminBoards.map((b) => {
      let icon = <MessageSquare size={14} />;
      if (b.name.includes("공지") || b.name.includes("알림")) {
        icon = <Megaphone size={14} />;
      } else if (b.name.includes("팀") || b.name.includes("빌딩") || b.name.includes("Co-founder")) {
        icon = <Users size={14} />;
      } else if (b.name.includes("QnA") || b.name.includes("질문") || b.name.includes("문의")) {
        icon = <HelpCircle size={14} />;
      }

      return {
        type: b.name,
        label: b.name,
        icon,
        desc: `${b.template || "일반형"} · 읽기: ${b.readPermission} · 쓰기: ${b.writePermission}`,
        writePermission: b.writePermission,
      };
    });

    return [
      { type: "전체", label: "전체", icon: <MessageSquare size={14} />, desc: "모든 게시판", writePermission: "전체" },
      ...dynamicBoards,
    ];
  }, [adminBoards]);

  // 글쓰기 가능한 게시판 목록 필터링 (권한 기반)
  const availableWriteBoards = React.useMemo(() => {
    const list = boards.filter((b) => b.type !== "전체");
    if (isAdmin) {
      return list;
    }
    // 일반 사용자는 writePermission이 '관리자'인 게시판 제외
    return list.filter((b) => b.writePermission !== "관리자" && b.type !== "공지사항");
  }, [boards, isAdmin]);

  // 글쓰기 모달 열릴 때 초기 선택값 보정
  const handleOpenWriteModal = () => {
    if (!isLoggedIn) {
      onLoginClick();
      return;
    }
    setEditingPost(null);
    setNewTitle("");
    setNewContent("");
    const currentBoard = availableWriteBoards.find((b) => b.type === activeBoard);
    if (currentBoard) {
      setNewBoardType(currentBoard.type);
    } else if (availableWriteBoards.length > 0) {
      setNewBoardType(availableWriteBoards[0].type);
    } else {
      setNewBoardType("QnA");
    }
    setNewIsPinned(false);
    setShowWriteModal(true);
  };

  const handleOpenEditModal = (post: BoardPost) => {
    setEditingPost(post);
    setNewTitle(post.title);
    setNewContent(post.content);
    setNewBoardType(post.boardType);
    setNewIsPinned(!!post.isPinned);
    setShowWriteModal(true);
  };

  // 중복 ID 방어 및 상단 고정(isPinned) 최우선 정렬
  const uniquePosts = React.useMemo(() => {
    const seen = new Set<string>();
    const unique = posts.filter((p) => {
      if (!p.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    return unique.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [posts]);

  const filtered = uniquePosts.filter((p) => {
    const matchBoard = activeBoard === "전체" || p.boardType === activeBoard;
    const matchSearch = multiMatch([p.title, p.author, p.content], searchText);
    return matchBoard && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedPosts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isFirstCommunityRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstCommunityRender.current) {
      isFirstCommunityRender.current = false;
      return;
    }
    setCurrentPage(1);
    if (selectedPost) {
      setSelectedPost(null);
      setIsClosing(false);
    }
  }, [activeBoard]);

  React.useEffect(() => {
    if (selectedPost) {
      setSelectedPost(null);
      setIsClosing(false);
    }
  }, [currentPage]);

  const handleCloseDetail = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPost(null);
      setIsClosing(false);
      if (onClearSelectedPost) onClearSelectedPost();
    }, 300);
  };

  const handleRowClick = (post: BoardPost) => {
    if (selectedPost?.id === post.id) {
      handleCloseDetail();
    } else {
      setSelectedPost(post);
      setIsClosing(false);
    }
  };

  const handleSubmit = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    if (editingPost) {
      try {
        const res = await api.updatePost(editingPost.id, {
          title: newTitle.trim(),
          content: newContent.trim(),
          boardType: newBoardType as BoardType,
          isPinned: isAdmin ? newIsPinned : false,
          author: userName,
          userRoles,
        });
        if (res?.post) {
          if (onUpdatePost) {
            onUpdatePost(res.post);
          }
          if (selectedPost?.id === res.post.id) {
            setSelectedPost(res.post);
          }
        }
        toast.success("게시글 수정 완료", "게시글이 성공적으로 수정되었습니다.");
      } catch (error) {
        console.error("Failed to update post:", error);
        toast.error("게시글 수정 실패", "게시글 수정 중 오류가 발생했습니다.");
      } finally {
        setEditingPost(null);
        setNewTitle("");
        setNewContent("");
        setNewIsPinned(false);
        setShowWriteModal(false);
      }
      return;
    }

    onAddPost({
      boardType: newBoardType,
      title: newTitle.trim(),
      content: newContent.trim(),
      author: userName || "나",
      createdAt: "방금 전",
      isPinned: isAdmin ? newIsPinned : false,
    });
    setNewTitle("");
    setNewContent("");
    setNewIsPinned(false);
    setShowWriteModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">커뮤니티</h1>
          <p className="text-sm text-brand-on-surface-variant mt-1">
            실시간 창업 커뮤니티 — 공지, 팀 빌딩, Q&A 및 분야별 자유 게시판
          </p>
        </div>
        <button
          onClick={handleOpenWriteModal}
          data-testid="community-write-btn"
          className="bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs flex items-center gap-1.5 shadow-md"
        >
          <Plus size={14} />
          글쓰기
        </button>
      </div>

      {/* Board Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
          {boards.map((board) => (
            <button
              key={board.type}
              onClick={() => setActiveBoard(board.type)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border whitespace-nowrap transition-all cursor-pointer text-xs font-medium ${
                activeBoard === board.type
                  ? "bg-brand-primary-container/20 border-brand-primary text-brand-primary font-bold shadow-sm"
                  : "border-brand-border text-brand-on-surface-variant hover:text-white hover:border-brand-surface-highest"
              }`}
            >
              {board.icon}
              {board.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full xl:w-auto shrink-0">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="게시글 검색... (/ 단축키)"
            className="w-full xl:w-64"
          />
          {totalPages > 1 && (
            <div className="ml-auto">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageSizeChange={setItemsPerPage}
                pageSizeOptions={[6, 12, 20]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Active board description */}
      {activeBoard !== "전체" && (
        <div className="mb-4 px-4 py-2 bg-brand-surface-low rounded-lg border border-brand-border/30 flex items-center justify-between">
          <p className="text-xs text-brand-on-surface-variant">
            {boards.find((b) => b.type === activeBoard)?.desc}
          </p>
          {boards.find((b) => b.type === activeBoard)?.writePermission === "관리자" && (
            <span className="text-[10px] text-brand-accent-rose flex items-center gap-1 font-medium">
              <Lock size={11} /> 관리자 전용 작성
            </span>
          )}
        </div>
      )}

      {/* Master-Detail Split View Container */}
      <div className="relative flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Side: Posts List Table + Pagination (Master View) */}
        <div
          className={`min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            selectedPost ? "w-full lg:w-[48%] xl:w-[50%]" : "w-full"
          }`}
        >
          <div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md">
            {/* Header row */}
            <div className="flex items-center px-4 sm:px-5 py-2.5 bg-brand-surface-low border-b border-brand-border/30 text-[10px] font-mono text-brand-on-surface-variant uppercase tracking-wider gap-3">
              <span className="w-16 sm:w-20 shrink-0">분류</span>
              <span className="flex-1 min-w-0">제목</span>
              <div
                className={`flex items-center gap-3 sm:gap-4 shrink-0 transition-all duration-300 ease-in-out ${
                  selectedPost
                    ? "w-0 opacity-0 pointer-events-none overflow-hidden"
                    : "w-44 sm:w-64 opacity-100"
                }`}
              >
                <span className="w-20 sm:w-24 hidden sm:block">작성자</span>
                <span className="w-10 sm:w-12 text-center">조회</span>
                <span className="w-14 sm:w-16 text-right">날짜</span>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="px-5 py-14 text-center text-sm text-brand-on-surface-variant">
                게시글이 없습니다
              </div>
            ) : (
              paginatedPosts.map((post, idx) => (
                <div
                  key={post.id}
                  data-testid="community-post-row"
                  onClick={() => handleRowClick(post)}
                  className={`flex items-center px-4 sm:px-5 py-3.5 gap-3 transition-colors duration-200 cursor-pointer ${
                    idx < paginatedPosts.length - 1 ? "border-b border-brand-border/20" : ""
                  } ${
                    selectedPost?.id === post.id
                      ? "bg-brand-primary-container/20 border-l-4 border-brand-primary text-white shadow-sm"
                      : "border-l-4 border-transparent hover:bg-brand-surface-low/80 text-brand-on-surface-variant"
                  }`}
                >
                  {/* Category Badge */}
                  <div className="w-16 sm:w-20 shrink-0">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded inline-block truncate max-w-full ${
                        post.boardType === "공지사항"
                          ? "bg-brand-accent-rose/10 text-brand-accent-rose border border-brand-accent-rose/20"
                          : post.boardType === "팀빌딩" || post.boardType?.includes("팀")
                          ? "bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20"
                          : post.boardType === "QnA"
                          ? "bg-brand-primary-container/10 text-brand-primary border border-brand-primary-container/20"
                          : post.boardType === "수강생 역제안"
                          ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      }`}
                    >
                      {post.boardType}
                    </span>
                  </div>

                  {/* Title & Comment count */}
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    {post.isPinned && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.2 rounded bg-brand-accent-rose/20 text-brand-accent-rose shrink-0">
                        <Pin size={10} /> 공지
                      </span>
                    )}
                    <span
                      className={`text-xs truncate transition-colors ${
                        selectedPost?.id === post.id
                          ? "text-white font-semibold"
                          : post.isPinned
                          ? "text-white font-bold"
                          : "text-white/90 font-medium hover:text-brand-primary"
                      }`}
                    >
                      <HighlightText text={post.title} query={searchText} />
                    </span>
                    {post.commentCount > 0 && (
                      <span className="text-[9px] text-brand-primary shrink-0 font-mono font-bold">
                        [{post.commentCount}]
                      </span>
                    )}
                  </div>

                  {/* Metadata Columns */}
                  <div
                    className={`flex items-center gap-3 sm:gap-4 shrink-0 transition-all duration-300 ease-in-out ${
                      selectedPost
                        ? "w-0 opacity-0 pointer-events-none overflow-hidden"
                        : "w-44 sm:w-64 opacity-100"
                    }`}
                  >
                    <div className="w-20 sm:w-24 hidden sm:flex items-center gap-1.5 overflow-hidden">
                      <div className="w-4 h-4 rounded-full bg-brand-surface-high flex items-center justify-center text-[8px] font-bold text-brand-primary shrink-0">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-[10px] text-brand-on-surface-variant truncate">
                        <HighlightText text={post.author} query={searchText} />
                      </span>
                    </div>
                    <div className="w-10 sm:w-12 text-center">
                      <span className="text-[10px] text-brand-on-surface-variant flex items-center justify-center gap-0.5">
                        <Eye size={10} /> {post.viewCount}
                      </span>
                    </div>
                    <div className="w-14 sm:w-16 text-right">
                      <span className="text-[10px] text-brand-on-surface-variant">{post.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Inline Post Detail & Comments Panel (Detail View) */}
        {selectedPost && (
          <div
            className={`w-full lg:w-[52%] xl:w-[50%] flex-shrink-0 sticky top-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isClosing ? "opacity-0 translate-x-8 scale-[0.98]" : "animate-slideInFromRight"
            }`}
          >
            <CommunityPostDetailModal
              inline
              key={selectedPost.id}
              post={selectedPost}
              onClose={handleCloseDetail}
              isLoggedIn={isLoggedIn}
              userRoles={userRoles}
              userName={userName}
              onLoginClick={onLoginClick}
              onEditPost={handleOpenEditModal}
              onDeletePost={(postId) => {
                if (onDeletePost) onDeletePost(postId);
                setSelectedPost(null);
              }}
              onCommentAdded={(newComment) => {
                setSelectedPost((prev) => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : null));
              }}
            />
          </div>
        )}
      </div>

      {/* Write / Edit Post Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-brand-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg font-bold text-white">
                {editingPost ? "게시글 수정" : "게시글 작성"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowWriteModal(false);
                  setEditingPost(null);
                }}
                className="text-brand-on-surface-variant hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Board Type Select (동적 및 권한 분기) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-brand-on-surface-variant block">
                    게시판 선택
                  </label>
                  {isAdmin && (
                    <span className="text-[10px] text-brand-primary font-medium flex items-center gap-1">
                      <CheckCircle2 size={11} /> 관리자 권한 활성화
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableWriteBoards.map((b) => (
                    <button
                      key={b.type}
                      type="button"
                      onClick={() => setNewBoardType(b.type)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        newBoardType === b.type
                          ? "bg-brand-primary-container/20 border-brand-primary text-brand-primary font-bold shadow-sm"
                          : "border-brand-border text-brand-on-surface-variant hover:text-white bg-brand-surface-low"
                      }`}
                    >
                      {b.icon}
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pinned notice option (관리자 전용) */}
              {isAdmin && (
                <div className="p-3 bg-brand-surface-low rounded-xl border border-brand-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pin size={14} className={newIsPinned ? "text-brand-accent-rose" : "text-brand-on-surface-variant"} />
                    <div>
                      <p className="text-xs font-semibold text-white">상단 공지 고정 (Pin)</p>
                      <p className="text-[10px] text-brand-on-surface-variant">게시판 목록 최상단에 항상 고정하여 노출합니다</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsPinned}
                      onChange={(e) => setNewIsPinned(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-brand-surface-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-accent-rose"></div>
                  </label>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1.5">제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="글 제목을 입력하세요"
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl py-2.5 px-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-on-surface-variant block mb-1.5">내용</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="내용을 작성하세요..."
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors h-32 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowWriteModal(false);
                    setEditingPost(null);
                  }}
                  className="flex-1 border border-brand-border text-white py-2.5 rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-xs"
                >
                  취소
                </button>
                <button
                  type="button"
                  data-testid="community-submit-post-btn"
                  onClick={handleSubmit}
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="flex-1 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send size={13} />
                  {editingPost ? "수정 완료" : "등록 완료"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

