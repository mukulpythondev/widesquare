// controllers/blogController.js
import slugify from "slugify";
import Blog from "../models/blogModel.js";
import Property from "../models/propertymodel.js"; // for populate propertyAds if needed

// Public: list published blogs
export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = { isDeleted: false, isPublished: true };

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { content: new RegExp(search, "i") },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Blog.countDocuments(query),
    ]);

    res.json({
      success: true,
      blogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
    });
  }
};

// Public: get single blog by slug
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({
      slug,
      isDeleted: false,
      isPublished: true,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    let propertyAdsData = null;
    let properties = [];

    if (
      blog.propertyAds &&
      blog.propertyAds.propertyIds &&
      blog.propertyAds.propertyIds.length > 0
    ) {
      const foundProperties = await Property.find(
        { _id: { $in: blog.propertyAds.propertyIds } },
        "title price location image _id"
      );

      propertyAdsData = {
        position: blog.propertyAds.position,
        properties: foundProperties,
      };

      properties = foundProperties;
    }

    res.json({
      success: true,
      blog,
      properties,        // frontend expects this
      propertyAds: propertyAdsData, // still included
    });

  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
    });
  }
};

// Admin: list all blogs (including drafts/deleted based on filter)
export const getAdminBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status = "all" } = req.query;

    const query = {};

    if (status === "published") {
      query.isPublished = true;
      query.isDeleted = false;
    } else if (status === "draft") {
      query.isPublished = false;
      query.isDeleted = false;
    } else if (status === "deleted") {
      query.isDeleted = true;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { content: new RegExp(search, "i") },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Blog.countDocuments(query),
    ]);

    res.json({
      success: true,
      blogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching admin blogs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
    });
  }
};

// Admin: get single blog by id
export const getAdminBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Error fetching blog by id:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
    });
  }
};

// Admin: create a blog
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      bannerImageUrl,
      content,
      authorId,
      authorName,
      isPublished,
      propertyAds,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const slugBase = slugify(title, { lower: true, strict: true }) || title;
    let slug = slugBase;

    const existingSlug = await Blog.findOne({ slug });
    if (existingSlug) {
      slug = `${slugBase}-${Date.now()}`;
    }

    const blogData = {
      title,
      slug,
      bannerImageUrl,
      content,
      authorId,
      authorName,

      // NEW SEO FIELDS
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || content.substring(0, 150),
      metaKeywords: metaKeywords || [],

      isPublished: !!isPublished,
      publishedAt: isPublished ? new Date() : null,

      propertyAds: {
        position: propertyAds?.position || null,
        propertyIds: propertyAds?.propertyIds || [],
      },
    };

    const blog = await Blog.create(blogData);

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Error creating blog",
    });
  }
};


// Admin: update a blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      bannerImageUrl,
      content,
      authorId,
      authorName,
      isPublished,
      propertyAds,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // TITLE + SLUG UPDATE
    if (title) {
      blog.title = title;

      const newSlugBase = slugify(title, { lower: true, strict: true }) || title;
      let newSlug = newSlugBase;

      const exists = await Blog.findOne({
        slug: newSlug,
        _id: { $ne: blog._id },
      });

      if (exists) {
        newSlug = `${newSlugBase}-${Date.now()}`;
      }

      blog.slug = newSlug;
    }

    if (bannerImageUrl !== undefined) blog.bannerImageUrl = bannerImageUrl;
    if (content !== undefined) blog.content = content;
    if (authorId !== undefined) blog.authorId = authorId;
    if (authorName !== undefined) blog.authorName = authorName;

    // UPDATE SEO FIELDS
    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;
    if (metaKeywords !== undefined) blog.metaKeywords = metaKeywords;

    // PROPERTY ADS
    if (propertyAds) {
      blog.propertyAds = {
        position: propertyAds.position || null,
        propertyIds: propertyAds.propertyIds || [],
      };
    }

    // PUBLISHING
    if (typeof isPublished === "boolean") {
      if (!blog.isPublished && isPublished) {
        blog.publishedAt = new Date();
      }
      blog.isPublished = isPublished;
    }

    await blog.save();

    res.json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Error updating blog",
    });
  }
};

// Admin: soft delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    blog.isDeleted = true;
    await blog.save();

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting blog",
    });
  }
};
