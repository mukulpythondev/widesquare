import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendurl } from "../../config";
import { toast } from "react-hot-toast";
import { Loader, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const AllAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all agents and their assigned properties
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendurl}/api/admin/all-agents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setAgents(res.data.agents || []);
      } else {
        toast.error(res.data.message || "Failed to fetch agents");
      }
    } catch (err) {
      toast.error("Error fetching agents");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Remove agent (set role to user)
  const handleRemoveAgent = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this agent?")) return;
    try {
      const res = await axios.post(
        `${backendurl}/api/admin/remove-agent/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        toast.success("Agent removed successfully");
        fetchAgents();
      } else {
        toast.error(res.data.message || "Failed to remove agent");
      }
    } catch (err) {
      toast.error("Error removing agent");
    }
  };

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">All Agents</h1>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Properties</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No agents found.
                    </td>
                  </tr>
                )}
                {agents.map((agent) => (
                  <tr key={agent._id} className="border-b">
                    <td className="px-4 py-3 font-medium">{agent.name}</td>
                    <td className="px-4 py-3">{agent.email}</td>
                    <td className="px-4 py-3">{agent.phone || <span className="text-gray-400">N/A</span>}</td>
                    <td className="px-4 py-3">
                      {agent.assignedProperties && agent.assignedProperties.length > 0 ? (
                        <ul className="list-disc ml-4">
                          {agent.assignedProperties.map((prop) => (
                            <li key={prop._id}>
                              <Link
                                to={`/properties/single/${prop._id}`}
                                className="text-blue-600 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {prop.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemoveAgent(agent._id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded"
                        title="Remove Agent"
                      >
                        <Trash2 />
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

export default AllAgents;