import { Router } from "express";
import { randomUUID } from "node:crypto";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createDiscussion,
  getDiscussions,
  likeDiscussion,
} from "../services/store.js";
import { problem, rejectUnknownFields, requireObjectBody } from "../middleware/problem.js";

const router = Router();

const toDiscussion = (document: any) => {
  const { _id, ...discussion } = document;
  return { ...discussion, id: _id };
};

router.get("/", async (_req, res) => {
  const discussions = (await getDiscussions()).map(toDiscussion);
  res.json({ success: true, discussions });
});

router.post("/", authMiddleware, async (req, res) => {
  const body = requireObjectBody(req.body);
  rejectUnknownFields(body, ["title", "content", "category"]);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "General";
  if (title.length < 3 || title.length > 200)
    throw problem(422, "Title must be between 3 and 200 characters.", {
      code: "invalid_discussion_title",
    });
  if (content.length > 10000)
    throw problem(422, "Details cannot exceed 10,000 characters.", {
      code: "invalid_discussion_content",
    });
  if (!category || category.length > 80)
    throw problem(422, "Category must be between 1 and 80 characters.", {
      code: "invalid_discussion_category",
    });

  const discussion = {
    _id: randomUUID(),
    authorId: req.user.id,
    author: req.user.name,
    title,
    content,
    category,
    likes: 0,
    replies: 0,
    createdAt: new Date().toISOString(),
  };
  await createDiscussion(discussion);
  res.status(201).json({ success: true, discussion: toDiscussion(discussion) });
});

router.post("/:discussionId/like", authMiddleware, async (req, res) => {
  const discussion = await likeDiscussion(req.params.discussionId);
  if (!discussion)
    throw problem(404, "Discussion not found.", { code: "discussion_not_found" });
  res.json({ success: true, discussion: toDiscussion(discussion) });
});

export default router;
