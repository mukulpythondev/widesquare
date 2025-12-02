// routes/adminBlogRoutes.js
import express from "express";

import { isAdmin, protect } from "../middleware/authmiddleware.js"; // adjust path/name
import { createBlog, deleteBlog, getAdminBlogById, getAdminBlogs, updateBlog } from "../controller/blogController.js";
import { deleteBlogComment } from "../controller/blogCommentController.js";

const router = express.Router();

// All routes here are admin-only
router.use(protect);
router.use(isAdmin);

// blogs
router.get("/blogs", getAdminBlogs);
router.get("/blogs/:id", getAdminBlogById);
router.post("/blogs", createBlog);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);

// comments (admin delete)
router.delete("/blogs/:blogId/comments/:commentId", deleteBlogComment);

export default router;
