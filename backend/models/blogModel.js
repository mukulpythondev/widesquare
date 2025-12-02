// models/blogModel.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    bannerImageUrl: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    authorName: {
      type: String,
      trim: true,
    },
    propertyAds: {
      position: {
        type: String,
        enum: ["left", "right", null],
        default: null,
      },
      propertyIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Property",
        },
      ],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
     metaTitle: { type: String, default: "" },
  metaDescription: { type: String, default: "" },
  metaKeywords: [{ type: String }],
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
