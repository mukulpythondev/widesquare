import  { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { ImagePlus, Loader2 } from "lucide-react";
import { uploadToCloudinary } from "../../lib/cloudinaryUpload"; // <<< your actual uploader

const AdminBlogAdd = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
const [metaDescription, setMetaDescription] = useState("");
const [metaKeywords, setMetaKeywords] = useState([]);

  const [properties, setProperties] = useState([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState([]);
  const [adsPosition, setAdsPosition] = useState("left");

  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch properties
  const fetchProperties = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/list`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setProperties(res.data.property || []);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // CLOUDINARY UPLOAD — SAME AS PROPERTY FORM
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isValid = file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024;
    if (!isValid) {
      toast.error("Invalid file or file too large (max 10MB)");
      return;
    }

    try {
      setUploadingImage(true);

      const uploadedUrl = await uploadToCloudinary(file);

      if (!uploadedUrl) throw new Error("No upload URL returned");

      setBannerImageUrl(uploadedUrl);
      toast.success("Banner uploaded successfully");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Blog
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const body = {
        title,
        bannerImageUrl,
        content,
        authorName,
        isPublished,
        propertyAds: {
          position: adsPosition,
          propertyIds: selectedPropertyIds,
        },
        metaTitle,
        metaDescription,
        metaKeywords,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/blogs`,
        body,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Blog created successfully");
        navigate("/admin/blogs");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating blog");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-6">Add New Blog</h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title */}
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="Blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Banner Image */}
        <div>
          <label className="block font-medium mb-1">Banner Image</label>

          {bannerImageUrl && (
            <img
              src={bannerImageUrl}
              className="w-full h-48 object-cover rounded mb-3"
            />
          )}

          <label className="flex items-center gap-2 cursor-pointer bg-gray-100 p-2 rounded w-fit">
            <ImagePlus className="h-5 w-5" />
            <span>Upload Banner</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
            />
          </label>

          {uploadingImage && (
            <p className="flex items-center gap-2 text-blue-600 mt-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Uploading...
            </p>
          )}
        </div>
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
  <h3 className="text-lg font-semibold mb-2">SEO Settings</h3>

  <label className="block mb-1">Meta Title</label>
  <input
    type="text"
    className="w-full border p-2 rounded mb-3"
    value={metaTitle}
    onChange={(e) => setMetaTitle(e.target.value)}
  />

  <label className="block mb-1">Meta Description</label>
  <textarea
    rows={3}
    className="w-full border p-2 rounded mb-3"
    value={metaDescription}
    onChange={(e) => setMetaDescription(e.target.value)}
  />

  <label className="block mb-1">Meta Keywords (comma separated)</label>
  <input
    type="text"
    className="w-full border p-2 rounded"
    value={metaKeywords.join(", ")}
    onChange={(e) =>
      setMetaKeywords(
        e.target.value.split(",").map((k) => k.trim())
      )
    }
  />
</div>

        {/* Content */}
        <div>
          <label className="block font-medium mb-1">Content</label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            className="h-64 mb-10 bg-white"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block font-medium mb-1">Author Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="Author name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>

        {/* Property Ads */}
        <div className="border p-4 rounded">
          <label className="block font-semibold mb-3">Property Ads (Optional)</label>

          {/* Position */}
          <div className="mb-4">
            <label className="block mb-1">Position</label>
            <select
              value={adsPosition}
              onChange={(e) => setAdsPosition(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="left">Left Side</option>
              <option value="right">Right Side</option>
            </select>
          </div>

          {/* Property list */}
          <div>
            <label className="block mb-1">Select Properties</label>

            <select
              multiple
              className="border px-3 py-2 rounded w-full h-32"
              value={selectedPropertyIds}
              onChange={(e) =>
                setSelectedPropertyIds(
                  [...e.target.selectedOptions].map((o) => o.value)
                )
              }
            >
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Publish */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <label>Publish Blog</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Blog
        </button>
      </form>
    </div>
  );
};

export default AdminBlogAdd;
