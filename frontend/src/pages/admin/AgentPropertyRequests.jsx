import React, { useEffect, useState } from "react";
import { Loader, Check, X } from "lucide-react";
import axios from "axios";
import { backendurl } from "../../config";
import { toast } from "react-hot-toast";

const AgentPropertyRequests = () => {
  const [agentRequests, setAgentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgentRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendurl}/api/products/agent-requests`);
      setAgentRequests(res.data.properties || []);
    } catch {
      toast.error("Failed to fetch agent property requests");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgentRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`${backendurl}/api/products/approve/${id}`);
      toast.success("Property approved");
      fetchAgentRequests();
    } catch {
      toast.error("Failed to approve property");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${backendurl}/api/products/reject/${id}`);
      toast.success("Property rejected");
      fetchAgentRequests();
    } catch {
      toast.error("Failed to reject property");
    }
  };

  return (
    <div className="bg-white w-full h-fit py-20">
      <div className="max-w-7xl mx-auto pt-32 px-4">
        <h2 className="text-2xl font-semibold mb-4">Agent Property Requests</h2>
        {loading ? (
          <Loader className="w-6 h-6 animate-spin" />
        ) : agentRequests.length === 0 ? (
          <div className="text-gray-500">No pending agent property requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow mb-4">
              <thead>
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Agent</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agentRequests.map((p) => (
                  <tr key={p._id} className="text-center">
                    <td className="px-4 py-2">{p.title}</td>
                    <td className="px-4 py-2">{p.seller?.name || "Agent"}</td>
                    <td className="px-4 py-2">{p.location}</td>
                    <td className="px-4 py-2">₹{p.price.toLocaleString()}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => handleApprove(p._id)}
                        className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(p._id)}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentPropertyRequests;