import  { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Trash2, Edit3, PlusCircle, MessageSquareMore } from "lucide-react";

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [status, setStatus] = useState("all"); // all | published | draft | deleted
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchBlogs = async () => {
    try {
      setLoading(true);

     const res = await axios.get(
  `${import.meta.env.VITE_BACKEND_URL}/api/admin/blogs`,
  {
    params: {
      page: pagination.page,
      limit: pagination.limit,
      search,
      status: status === "unpublished" ? "draft" : status,
    },
    withCredentials: true,
  }
);


      if (res.data.success) {
        setBlogs(res.data.blogs);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Error fetching blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [pagination.page, status]);

  const deleteBlog = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/blogs/${id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Blog deleted");
        fetchBlogs();
      }
    } catch (error) {
      toast.error("Error deleting blog");
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchBlogs();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Manage Blogs</h2>

        <Link
          to="/admin/blogs/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" /> Add Blog
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-full md:w-1/3"
          />

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg"
          >
            Search
          </button>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>

      {/* Blog Table */}
      <div className="bg-white shadow rounded p-4">
        {loading ? (
          <p className="text-center py-5">Loading...</p>
        ) : blogs.length === 0 ? (
          <p className="text-center py-5">No blogs found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Created</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id} className="border-b">
                    <td className="p-3">{blog.title}</td>

                    <td className="p-3">
                      {blog.isDeleted ? (
                        <span className="text-red-600 font-medium">Deleted</span>
                      ) : blog.isPublished ? (
                        <span className="text-green-600 font-medium">
                          Published
                        </span>
                      ) : (
                        <span className="text-yellow-600 font-medium">Draft</span>
                      )}
                    </td>

                    <td className="p-3">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3 flex justify-center gap-3">

  {/* Edit */}
  <Link
    to={`/admin/blogs/edit/${blog._id}`}
    className="text-blue-600 hover:text-blue-800"
  >
    <Edit3 className="h-5 w-5" />
  </Link>

  {/* Comments */}
  <Link
    to={`/admin/blogs/${blog._id}/comments`}
    className="text-green-600 hover:text-green-800"
  >
    <MessageSquareMore className="h-5 w-5" />
  </Link>

  {/* Delete */}
  {!blog.isDeleted && (
    <button
      onClick={() => deleteBlog(blog._id)}
      className="text-red-600 hover:text-red-800"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  )}
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: pagination.pages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() =>
                setPagination({ ...pagination, page: idx + 1 })
              }
              className={`px-3 py-1 rounded ${
                pagination.page === idx + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
