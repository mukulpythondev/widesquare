import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendurl } from "../../config";
import { toast } from "react-hot-toast";
import { Plus, Edit3, Trash2, Loader } from "lucide-react";

const Services = () => {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", image: null });
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendurl}/api/services/list`);
      setServices(res.data.services || []);
    } catch {
      toast.error("Failed to fetch services");
    }
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      if (form.image) formData.append("image", form.image);
      let url, method;
      if (editing) {
        formData.append("id", editing._id);
        url = `${backendurl}/api/services/update`;
        method = "post";
      } else {
        url = `${backendurl}/api/services/add`;
        method = "post";
      }
      await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(editing ? "Service updated" : "Service added");
      setShowForm(false);
      setEditing(null);
      setForm({ title: "", description: "", image: null });
      fetchServices();
    } catch {
      toast.error("Failed to save service");
    }
    setLoading(false);
  };

  const handleEdit = (service) => {
    setEditing(service);
    setForm({ title: service.title, description: service.description, image: null });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    setLoading(true);
    try {
      await axios.delete(`${backendurl}/api/services/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Service deleted");
      fetchServices();
    } catch {
      toast.error("Failed to delete service");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Services</h1>
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => { setShowForm(true); setEditing(null); setForm({ title: "", description: "", image: null }); }}
          >
            <Plus className="w-5 h-5 mr-2" /> Add Service
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 space-y-4">
            <div>
              <label className="block font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Image</label>
              <input type="file" name="image" accept="image/*" onChange={handleFormChange} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
                {editing ? "Update" : "Add"}
              </button>
              <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service._id} className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
                <img
                  src={service.image || "/placeholder.jpg"}
                  alt={service.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <h2 className="text-lg font-bold mb-1">{service.title}</h2>
                <div className="text-gray-600 mb-2">{service.description}</div>
                <div className="flex-1"></div>
                <div className="flex gap-2 mt-3">
                  <button className="text-blue-600" onClick={() => handleEdit(service)}>
                    <Edit3 />
                  </button>
                  <button className="text-red-600" onClick={() => handleDelete(service._id)}>
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;