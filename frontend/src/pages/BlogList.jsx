import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Calendar, Clock, Search, ChevronRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", "Buying", "Selling", "Investment", "Tips"];

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/blogs?limit=100`
      );

      if (res.data.success) {
        setBlogs(res.data.blogs);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filtered = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.content.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || b.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="pt-32 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className="text-4xl font-bold text-foreground text-center mb-10">
          Property News
        </h1>

        {/* Search & Filter */}
        <div className="mb-10 flex flex-col md:flex-row justify-between gap-4">

          {/* Search */}
          <div className="relative max-w-md w-full">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-input focus:ring-2 focus:ring-primary"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-muted-foreground w-5" />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm ${
                  category === c
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Blogs Grid */}
        {loading ? (
          <p className="text-center py-10">Loading blogs...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground">
            No blogs found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((blog) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={blog._id}
                className="rounded-xl overflow-hidden bg-card border border-border shadow hover:shadow-lg transition"
              >
                <Link to={`/blogs/${blog.slug}`}>
                  <img
                    src={blog.bannerImageUrl}
                    className="w-full h-56 object-cover"
                    alt={blog.title}
                  />

                  <div className="p-6">
                    <div className="flex justify-between text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />{" "}
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> 3 min read
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2 line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {blog.content.replace(/<[^>]+>/g, "").slice(0, 150)}...
                    </p>

                    <div className="flex justify-between items-center mt-4">
                      <span className="flex items-center text-xs gap-1">
                        <Tag size={12} /> {blog.category || "Real Estate"}
                      </span>

                      <span className="text-primary flex items-center text-sm">
                        Read More <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogList;
