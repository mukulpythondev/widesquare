import React, { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import axios from "axios";
import { backendurl } from "../../config";
import { toast } from "react-hot-toast";

const ApprovedAgentProperties = () => {
  const [agentApproved, setAgentApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgentApproved = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendurl}/api/products/agent-approved`);
      setAgentApproved(res.data.properties || []);
    } catch {
      toast.error("Failed to fetch approved agent properties");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgentApproved();
  }, []);

  return (
    <div className="max-w-7xl mx-auto pt-32 px-4">
      <h2 className="text-2xl font-semibold mb-4">Agent Properties (Approved)</h2>
      {loading ? (
        <Loader className="w-6 h-6 animate-spin" />
      ) : agentApproved.length === 0 ? (
        <div className="text-gray-500">No approved agent properties.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow mb-4 ">
            <thead>
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Price</th>
              </tr>
            </thead>
            <tbody  className="text-center">
              {agentApproved.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-2">{p.title}</td>
                  <td className="px-4 py-2">{p.seller?.name || "Agent"}</td>
                  <td className="px-4 py-2">{p.location}</td>
                  <td className="px-4 py-2">₹{p.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApprovedAgentProperties;