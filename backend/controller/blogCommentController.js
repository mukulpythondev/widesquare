// controllers/blogCommentController.js
import Blog from "../models/blogModel.js";
import BlogComment from "../models/blogCommentModel.js";

// Public: get comments for a blog (approved + not deleted)
export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const [comments, total] = await Promise.all([
      BlogComment.find({
        blogId,
        isApproved: true,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      BlogComment.countDocuments({
        blogId,
        isApproved: true,
        isDeleted: false,
      }),
    ]);

    res.json({
      success: true,
      comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching blog comments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
    });
  }
};

// User: add a comment (registered users only)
export const addBlogComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const blog = await Blog.findOne({
      _id: blogId,
      isDeleted: false,
      isPublished: true,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // assuming auth middleware sets req.user
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const comment = await BlogComment.create({
      blogId,
      userId: user._id,
      userName: user.name || "User",
      text,
      isApproved: true,
    });

    // increment commentsCount
    blog.commentsCount = (blog.commentsCount || 0) + 1;
    await blog.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Error adding blog comment:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
    });
  }
};

// Admin: delete (soft) comment
export const deleteBlogComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;

    const comment = await BlogComment.findOne({
      _id: commentId,
      blogId,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (!comment.isDeleted) {
      comment.isDeleted = true;
      await comment.save();

      // decrement blog commentsCount
      await Blog.findByIdAndUpdate(blogId, {
        $inc: { commentsCount: -1 },
      });
    }

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog comment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
    });
  }
};
