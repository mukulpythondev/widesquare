import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendurl } from "../../config";
import { toast } from "react-hot-toast";
import { Loader, Search } from "lucide-react";

const AssignProperty = () => {
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [propertySearch, setPropertySearch] = useState("");
  const [agentSearch, setAgentSearch] = useState("");
  const [assigningId, setAssigningId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgents, setSelectedAgents] = useState({});

  // Fetch all approved properties
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendurl}/api/products/list`);
      setProperties(res.data.property || []);
    } catch {
      toast.error("Failed to fetch properties");
    }
    setLoading(false);
  };

  // Fetch all agents
  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${backendurl}/api/admin/all-agents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setAgents(res.data.agents || []);
    } catch {
      toast.error("Failed to fetch agents");
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchAgents();
  }, []);

  // Assign property to agent
  const handleAssign = async (propertyId) => {
    const agentId = selectedAgents[propertyId];
    if (!agentId) {
      toast.error("Please select an agent");
      return;
    }
    setAssigningId(propertyId);
    try {
      await axios.put(
        `${backendurl}/api/admin/assign-property`,
        { propertyId, agentId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Property assigned to agent!");
      fetchProperties();
    } catch {
      toast.error("Failed to assign property");
    }
    setAssigningId(null);
  };

  // Filtered lists
  const filteredProperties = properties.filter((p) =>
    p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
    p.location.toLowerCase().includes(propertySearch.toLowerCase())
  );
  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(agentSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Assign Property to Agent</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                value={propertySearch}
                onChange={e => setPropertySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search agents..."
                value={agentSearch}
                onChange={e => setAgentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.length === 0 && (
              <div className="col-span-full text-center text-gray-500">
                No properties found.
              </div>
            )}
            {filteredProperties.map((p) => {
              // Check if already assigned to selected agent
              const assignedAgentId = p.assignedAgent?._id || p.assignedAgent;
              const selectedAgentId = selectedAgents[p._id];
              const alreadyAssigned =
                selectedAgentId && assignedAgentId && selectedAgentId === assignedAgentId;

              return (
                <div
                  key={p._id}
                  className="bg-white rounded-lg shadow-lg p-4 flex flex-col"
                >
                  <img
                    src={p.image?.[0] || "/placeholder.jpg"}
                    alt={p.title}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                  <h2 className="text-lg font-bold mb-1">{p.title}</h2>
                  <div className="text-gray-600 mb-1">{p.location}</div>
                  <div className="mb-2">
                    <span className="text-blue-600 font-semibold">
                      ₹{p.price?.toLocaleString()}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">{p.type}</span>
                  </div>
                  <div className="mb-2">
                    <select
                      className="border rounded px-2 py-1 w-full"
                      value={selectedAgents[p._id] || ""}
                      onChange={e =>
                        setSelectedAgents((prev) => ({
                          ...prev,
                          [p._id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- Select Agent --</option>
                      {filteredAgents.map(a => (
                        <option key={a._id} value={a._id}>
                          {a.name} ({a.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={
                      assigningId === p._id ||
                      !selectedAgents[p._id] ||
                      alreadyAssigned
                    }
                    onClick={() => handleAssign(p._id)}
                  >
                    {alreadyAssigned
                      ? "Already Assigned"
                      : assigningId === p._id
                      ? "Assigning..."
                      : "Assign"}
                  </button>
                  {alreadyAssigned && (
                    <span className="text-green-600 text-xs mt-1">
                      This property is already assigned to this agent.
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignProperty;