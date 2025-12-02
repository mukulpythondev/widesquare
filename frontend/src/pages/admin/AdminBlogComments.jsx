import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2, ArrowLeft } from "lucide-react";

const AdminBlogComments = () => {
  const { id } = useParams(); // blog ID

  const [comments, setComments] = useState([]);
  const [blogTitle, setBlogTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Fetch comments and blog title
  const fetchComments = async () => {
    try {
      setLoading(true);

      // Get blog details + comments
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/blogs/${id}/comments`,
        {
          params: {
            page: pagination.page,
            limit: pagination.limit
          }
        }
      );

      if (res.data.success) {
        setComments(res.data.comments);
        setPagination(res.data.pagination);
        setBlogTitle(res.data.blogTitle || "Blog");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [pagination.page]);

  // Delete a comment
  const deleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/blogs/${id}/comments/${commentId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Comment deleted");
        fetchComments();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting comment");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <Link
        to="/admin/blogs"
        className="flex items-center gap-2 text-blue-600 mb-4 hover:underline"
      >
        <ArrowLeft size={18} />
        Back to Blogs
      </Link>

      <h2 className="text-xl font-bold mb-1">Comments for:</h2>
      <p className="text-lg font-semibold mb-6 text-gray-700">{blogTitle}</p>

      <div className="bg-white shadow rounded p-4">
        {loading ? (
          <p className="text-center py-5">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center py-5 text-gray-500">No comments found</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div
                key={c._id}
                className="border p-3 rounded flex justify-between items-start"
              >
                <div>
                  <p className="text-gray-800 font-medium">{c.user?.name || "User"}</p>
                  <p className="text-gray-600 text-sm mt-1">{c.text}</p>

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => deleteComment(c._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: pagination.pages }).map((_, idx) => (
            <button
              key={idx}
              className={`px-3 py-1 rounded ${
                pagination.page === idx + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() =>
                setPagination({ ...pagination, page: idx + 1 })
              }
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBlogComments;
