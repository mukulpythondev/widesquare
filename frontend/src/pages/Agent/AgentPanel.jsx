import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendurl } from "../../config";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";

const AgentPanel = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgentProperties = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendurl}/api/products/agent/assigned-properties`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setProperties(res.data.properties || []);
    } catch {
      toast.error("Failed to fetch your assigned properties");
    }
    setLoading(false);
  };

  useEffect(() => { fetchAgentProperties(); }, []);

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Agent Panel</h1>
        <p className="text-gray-600 mb-4">Manage your assigned properties here.</p>
        {loading ? (
          <div className="flex justify-center items-center h-40"><Loader className="animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.length === 0 && (
              <div className="col-span-full text-center text-gray-500">No assigned properties.</div>
            )}
            {properties.map((p) => (
              <Link
                key={p._id}
                to={`/properties/single/${p._id}`}
                className="bg-white rounded-lg shadow-lg p-4 flex flex-col hover:shadow-xl transition cursor-pointer"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={p.image?.[0] || "/placeholder.jpg"}
                  alt={p.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <h2 className="text-lg font-bold mb-1">{p.title}</h2>
                <div className="text-gray-600 mb-1">{p.location}</div>
                <div className="mb-2">
                  <span className="text-blue-600 font-semibold">₹{p.price?.toLocaleString()}</span>
                  <span className="ml-2 text-sm text-gray-500">{p.type}</span>
                </div>
                <div className="flex-1"></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentPanel;