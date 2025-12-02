import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { Share2, Calendar, User, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BlogSingle = () => {
  const { slug } = useParams();
  const { isLoggedIn, user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [commentText, setCommentText] = useState("");

  const fetchBlog = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/blogs/${slug}`
      );

      if (res.data.success) {
        setBlog(res.data.blog);
        setProperties(res.data.properties || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchComments = async () => {
    if (!blog?._id) return;

    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/blogs/${blog._id}/comments`
    );

    if (res.data.success) {
      setComments(res.data.comments);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (blog) fetchComments();
  }, [blog]);

  const addComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/blogs/${blog._id}/comments`,
        { text: commentText },
        { withCredentials: true }
      );

      if (res.data.success) {
        setCommentText("");
        fetchComments();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!blog)
    return <p className="pt-32 text-center">Loading blog...</p>;

  return (
    <section className="pt-32 pb-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-10">

        {/* LEFT CONTENT */}
        <div className="flex-1 ">

         <img
  src={blog.bannerImageUrl}
  alt={blog.title}
  className="w-full h-72 sm:h-80 md:h-96 object-cover rounded-xl mb-6"
/>


          <h1 className="text-4xl font-bold text-foreground mb-4">
            {blog.title}
          </h1>

          <div className="flex items-center gap-6 text-muted-foreground mb-6">
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              {new Date(blog.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <User size={16} /> {blog.authorName}
            </span>
            <Share2 className="cursor-pointer hover:text-primary" />
          </div>

          {/* CONTENT */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* COMMENTS */}
          <h2 className="text-2xl font-bold mt-12 mb-4">Comments</h2>

          {isLoggedIn ? (
  <div className="mb-6 flex gap-3 items-start">
    <textarea
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
      className="w-full border border-border rounded-lg p-3"
      placeholder="Write a comment..."
    />
    <button
      onClick={addComment}
      className="bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center"
    >
      <Send size={18} />
    </button>
  </div>
) : (
  <p className="text-sm text-muted-foreground">
    Login to comment.
  </p>
)}


          {/* List comments */}
          {comments.map((c) => (
            <div
              key={c._id}
              className="border border-border p-4 rounded-lg mb-3"
            >
              <p className="font-medium">{c.user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground mt-1">{c.text}</p>
            </div>
          ))}
        </div>

        {/* RIGHT SIDEBAR (PROPERTY ADS) */}
        {/* PROPERTY ADS — position-aware */}
{blog.propertyAds?.propertyIds?.length > 0 && (
  <div className={`w-full lg:w-80 space-y-6 
     ${blog.propertyAds.position === "left" ? "order-first lg:order-none" : ""}`}>
    <h3 className="text-xl font-bold">Featured Properties</h3>

    {properties.map((p) => (
  <div
    key={p._id}
    className="border border-border p-3 rounded-xl shadow-sm hover:shadow-md transition-all"
  >
    <Link to={`/properties/single/${p._id}`}>
      <img
        src={p.image?.[0]}
        className="h-40 w-full object-cover rounded-lg"
        alt={p.title}
      />

      <h4 className="mt-3 font-bold">{p.title}</h4>
      <p className="text-muted-foreground text-sm">{p.location}</p>
      <p className="font-semibold mt-1">₹ {p.price}</p>
    </Link>
  </div>
))}

  </div>
)}

      </div>
    </section>
  );
};

export default BlogSingle;
