// routes/blogRoutes.js
import express from "express";


import { protect } from "../middleware/authmiddleware.js"; // adjust path/name if different
import { addBlogComment, getBlogComments } from "../controller/blogCommentController.js";
import { getBlogBySlug, getBlogs } from "../controller/blogController.js";

const router = express.Router();

// Public blog list + single blog
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

// Comments
router.get("/:blogId/comments", getBlogComments);
router.post("/:blogId/comments", protect, addBlogComment);

export default router;
