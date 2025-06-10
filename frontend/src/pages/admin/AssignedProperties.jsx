import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendurl } from "../../config";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AssignedProperties = () => {
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAssigned = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendurl}/api/admin/assigned-properties`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setAssigned(res.data.properties || []);
    } catch {
      toast.error("Failed to fetch assigned properties");
    }
    setLoading(false);
  };

  useEffect(() => { fetchAssigned(); }, []);

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Assigned Properties</h1>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Property</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Agent</th>
                <th className="px-4 py-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {assigned.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No assigned properties.
                  </td>
                </tr>
              ) : (
                assigned.map((p) => (
                  <tr key={p._id} className="border-b">
                    <td className="px-4 py-2 font-semibold">
                      <span
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() => navigate(`/properties/single/${p._id}`)}
                      >
                        {p.title}
                      </span>
                    </td>
                    <td className="px-4 py-2">{p.location}</td>
                    <td className="px-4 py-2">
                      {p.assignedAgent?.name || "-"}
                    </td>
                    <td className="px-4 py-2">{p.assignedAgent?.email || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssignedProperties;