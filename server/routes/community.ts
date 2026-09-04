import { Router } from "express";
import { db } from "../db.js";
import { notificationService } from "../services/notificationService.js";
import type { BoardPost, Comment, Notification, BoardType, UserRole } from "../../src/types.js";

const router = Router();

// GET /api/community/posts
router.get("/posts", (req, res) => {
  const { boardType, search, page, limit } = req.query as {
    boardType?: string;
    search?: string;
    page?: string;
    limit?: string;
  };

  let posts = db.get("posts");

  // 고유 ID 기준 중복 제거
  const seenIds = new Set<string>();
  posts = posts.filter((p) => {
    if (!p.id || seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  });

  if (boardType && boardType !== "전체") {
    posts = posts.filter((p) => p.boardType === boardType);
  }

  if (search) {
    const tokens = search.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length > 0) {
      posts = posts.filter((p) => {
        const text = `${p.title} ${p.content} ${p.author}`.toLowerCase();
        return tokens.every((token) => text.includes(token));
      });
    }
  }

  // 상단 공지 고정(isPinned) 게시글 최우선 정렬
  posts = [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const parsedPage = parseInt(page || "1", 10);
  const pageNum = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const parsedLimit = parseInt(limit || "100", 10);
  const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 100 : Math.min(parsedLimit, 200);
  const total = posts.length;
  const paginated = posts.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    posts: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

// GET /api/community/posts/:id (Detail & View count increment)
router.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  let targetPost: BoardPost | null = null;

  db.update("posts", (posts) =>
    posts.map((p) => {
      if (p.id === id) {
        targetPost = { ...p, viewCount: p.viewCount + 1 };
        return targetPost;
      }
      return p;
    })
  );

  if (!targetPost) {
    return res.status(404).json({ error: "Post not found" });
  }

  const comments = db.get("comments").filter((c) => c.postId === id);
  res.json({ post: targetPost, comments });
});

// POST /api/community/posts (Create post with permission checks)
router.post("/posts", (req, res) => {
  const {
    boardType = "QnA",
    title,
    content,
    author = "김수강생",
    authorRoles = ["member"],
    isPinned = false,
  } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const isAdmin =
    Array.isArray(authorRoles) &&
    (authorRoles.includes("admin") || authorRoles.includes("manager"));

  // 1. 공지사항 카테고리 또는 상단 고정은 관리자만 가능
  if ((boardType === "공지사항" || isPinned) && !isAdmin) {
    return res.status(403).json({
      error: "공지사항 작성 및 상단 고정글 설정은 관리자 권한이 필요합니다.",
    });
  }

  // 2. 관리자가 생성한 게시판의 쓰기 권한(writePermission) 검증
  const boards = db.get("boards") || [];
  const targetBoard = boards.find((b) => b.name === boardType);
  if (targetBoard && targetBoard.writePermission === "관리자" && !isAdmin) {
    return res.status(403).json({
      error: `'${boardType}' 게시판은 관리자 전용 게시판입니다.`,
    });
  }

  const newPost: BoardPost = {
    id: `p-${Date.now()}`,
    boardType: boardType as BoardType,
    title,
    content,
    author,
    authorAvatar: "",
    authorRoles: Array.isArray(authorRoles) ? authorRoles : ["member"],
    createdAt: new Date().toISOString().split("T")[0],
    viewCount: 0,
    commentCount: 0,
    isPinned: !!isPinned,
  };

  db.update("posts", (posts) => [newPost, ...posts]);

  // Update board postCount in admin boards
  db.update("boards", (boards) =>
    boards.map((b) =>
      b.name === boardType || (boardType === "공지사항" && b.name === "공지사항")
        ? { ...b, postCount: b.postCount + 1 }
        : b
    )
  );

  res.status(201).json({ post: newPost });
});

// PUT /api/community/posts/:id (Update post)
router.put("/posts/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, boardType, isPinned, author, userRoles } = req.body || {};

  const targetPost = db.get("posts").find((p) => p.id === id);
  if (!targetPost) {
    return res.status(404).json({ error: "Post not found" });
  }

  const isAdmin =
    Array.isArray(userRoles) &&
    (userRoles.includes("admin") || userRoles.includes("manager"));

  if (author && targetPost.author !== author && !isAdmin) {
    return res.status(403).json({ error: "게시글 수정 권한이 없습니다." });
  }

  // 공지사항 카테고리 또는 상단 고정은 관리자만 가능
  if ((boardType === "공지사항" || isPinned) && !isAdmin) {
    return res.status(403).json({
      error: "공지사항 설정 및 상단 고정글 설정은 관리자 권한이 필요합니다.",
    });
  }

  const oldBoardType = targetPost.boardType;
  const newBoardType = boardType !== undefined ? boardType : targetPost.boardType;

  let updatedPost: BoardPost = targetPost;
  db.update("posts", (posts) =>
    posts.map((p) => {
      if (p.id === id) {
        updatedPost = {
          ...p,
          title: title !== undefined ? title : p.title,
          content: content !== undefined ? content : p.content,
          boardType: newBoardType as BoardType,
          isPinned: isPinned !== undefined ? !!isPinned : p.isPinned,
        };
        return updatedPost;
      }
      return p;
    })
  );

  // 게시판이 변경된 경우 boards의 postCount 업데이트
  if (oldBoardType !== newBoardType) {
    db.update("boards", (boards) =>
      boards.map((b) => {
        if (b.name === oldBoardType) {
          return { ...b, postCount: Math.max(0, b.postCount - 1) };
        }
        if (b.name === newBoardType) {
          return { ...b, postCount: b.postCount + 1 };
        }
        return b;
      })
    );
  }

  res.json({ success: true, post: updatedPost });
});

// DELETE /api/community/posts/:id (Delete post)
router.delete("/posts/:id", (req, res) => {
  const { id } = req.params;
  const { author, userRoles } = req.body || {};

  const targetPost = db.get("posts").find((p) => p.id === id);
  if (!targetPost) {
    return res.status(404).json({ error: "Post not found" });
  }

  const isAdmin =
    Array.isArray(userRoles) &&
    (userRoles.includes("admin") || userRoles.includes("manager"));

  if (author && targetPost.author !== author && !isAdmin) {
    return res.status(403).json({ error: "게시글 삭제 권한이 없습니다." });
  }

  // 게시글 삭제
  db.update("posts", (posts) => posts.filter((p) => p.id !== id));

  // 연관 댓글 삭제
  db.update("comments", (comments) => comments.filter((c) => c.postId !== id));

  // 게시판 postCount 감소
  db.update("boards", (boards) =>
    boards.map((b) =>
      b.name === targetPost.boardType
        ? { ...b, postCount: Math.max(0, b.postCount - 1) }
        : b
    )
  );

  res.json({ success: true, message: "게시글이 삭제되었습니다." });
});

// GET /api/community/posts/:id/comments (List comments)
router.get("/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const comments = db.get("comments").filter((c) => c.postId === id);
  res.json({ comments });
});

// POST /api/community/posts/:id/comments (Add comment)
router.post("/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const { author = "김수강생", authorRole = "member", authorRoles, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  const post = db.get("posts").find((p) => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const now = new Date();
  const timeStr = `${now.toISOString().split("T")[0]} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const resolvedRoles: UserRole[] = Array.isArray(authorRoles) && authorRoles.length > 0
    ? authorRoles
    : [authorRole as UserRole];

  const newComment: Comment = {
    id: `c-${Date.now()}`,
    postId: id,
    author,
    authorAvatar: "",
    authorRoles: resolvedRoles,
    content,
    createdAt: timeStr,
  };

  db.update("comments", (comments) => [...comments, newComment]);

  // Increment commentCount in post
  db.update("posts", (posts) =>
    posts.map((p) => (p.id === id ? { ...p, commentCount: p.commentCount + 1 } : p))
  );

  // Trigger Notification to post author (스마트 묶음 & 딥링크 적용)
  notificationService.sendNotification({
    templateCode: "POST_COMMENT_RECEIVED",
    category: "community",
    type: "community",
    title: `[새 댓글] ${post.title}`,
    message: `${author}님이 회원님의 게시글에 댓글을 남겼습니다: "${content.substring(0, 30)}..."`,
    targetUrl: `/community?postId=${post.id}`,
    actionLabel: "댓글 답글달기",
    aggregationKey: `post:${post.id}:comment`,
    data: {
      postTitle: post.title,
      author,
      commentSnippet: content.substring(0, 30),
      postId: post.id,
    },
  });

  res.status(201).json({ comment: newComment });
});

// DELETE /api/community/posts/:postId/comments/:commentId
const handleDeleteComment = (req: any, res: any) => {
  const { postId, commentId } = req.params;
  const { author, userRoles } = req.body || {};

  const targetComment = db.get("comments").find((c) => c.id === commentId);
  if (!targetComment) {
    return res.status(404).json({ error: "Comment not found" });
  }

  const isAdmin =
    Array.isArray(userRoles) &&
    (userRoles.includes("admin") || userRoles.includes("manager"));

  if (author && targetComment.author.trim() !== author.trim() && !isAdmin) {
    return res.status(403).json({ error: "댓글 삭제 권한이 없습니다." });
  }

  db.update("comments", (comments) => comments.filter((c) => c.id !== commentId));

  // Decrement commentCount in post
  const targetPostId = postId || targetComment.postId;
  db.update("posts", (posts) =>
    posts.map((p) =>
      p.id === targetPostId ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p
    )
  );

  res.json({ success: true, message: "댓글이 삭제되었습니다." });
};

router.delete("/posts/:postId/comments/:commentId", handleDeleteComment);
router.delete("/comments/:commentId", handleDeleteComment);

export default router;
