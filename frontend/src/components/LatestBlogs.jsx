import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LatestBlogs = () => {
  const [blogs, setBlogs] = useState([]);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/blogs?limit=3`
      );
      
      if (res.data.success) setBlogs(res.data.blogs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Latest Articles</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {blogs.map((blog) => (
            <motion.div
              key={blog._id}
              whileHover={{ y: -5 }}
              className="rounded-xl overflow-hidden border border-border shadow"
            >
              <Link to={`/blogs/${blog.slug}`}>
                <img
                  src={blog.bannerImageUrl}
                  alt={blog.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {blog.content.replace(/<[^>]+>/g, "").slice(0, 120)}...
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestBlogs;
