import { Router } from "express";
import { db } from "../db.js";
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
    const q = search.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
    );
  }

  const pageNum = parseInt(page || "1", 10);
  const limitNum = parseInt(limit || "100", 10);
  const total = posts.length;
  const paginated = posts.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    posts: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
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

// POST /api/community/posts (Create post)
router.post("/posts", (req, res) => {
  const { boardType = "QnA", title, content, author = "김수강생", isPinned = false } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const newPost: BoardPost = {
    id: `p-${Date.now()}`,
    boardType: boardType as BoardType,
    title,
    content,
    author,
    authorAvatar: "",
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

// GET /api/community/posts/:id/comments (List comments)
router.get("/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const comments = db.get("comments").filter((c) => c.postId === id);
  res.json({ comments });
});

// POST /api/community/posts/:id/comments (Add comment)
router.post("/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const { author = "김수강생", authorRole = "member", content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  const post = db.get("posts").find((p) => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const now = new Date();
  const timeStr = `${now.toISOString().split("T")[0]} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const newComment: Comment = {
    id: `c-${Date.now()}`,
    postId: id,
    author,
    authorAvatar: "",
    authorRoles: [authorRole as UserRole],
    content,
    createdAt: timeStr,
  };

  db.update("comments", (comments) => [...comments, newComment]);

  // Increment commentCount in post
  db.update("posts", (posts) =>
    posts.map((p) => (p.id === id ? { ...p, commentCount: p.commentCount + 1 } : p))
  );

  // Trigger Notification to post author
  const newNotif: Notification = {
    id: `notif-${Date.now()}`,
    type: "team",
    title: `[새 댓글] ${post.title}`,
    message: `${author}님이 회원님의 게시글에 댓글을 남겼습니다: "${content.substring(0, 30)}..."`,
    time: "방금 전",
    isRead: false,
  };
  db.update("notifications", (notifs) => [newNotif, ...notifs]);

  res.status(201).json({ comment: newComment });
});

export default router;
