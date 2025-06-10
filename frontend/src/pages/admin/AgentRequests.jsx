import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { User, Mail, Phone, Check, X, Loader, Briefcase, MapPin, } from "lucide-react";
import { backendurl } from "../../config";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const AgentRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await axios.get(`${backendurl}/api/admin/agent-requests`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setRequests(res.data.requests);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (userId, action) => {
    await axios.post(`${backendurl}/api/admin/${action}-agent/${userId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    fetchRequests();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex justify-between items-center w-full">
            <div className="">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Agent Requests
              </h1>
              <p className="text-gray-600">
                Review and manage agent applications
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                to="/admin/all-agents"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >

                All Agents
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    About
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((r) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    {/* Applicant */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">{r.name}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center text-gray-700 text-sm">
                          <Mail className="w-4 h-4 mr-1" /> {r.email}
                        </span>
                        <span className="flex items-center text-gray-700 text-sm">
                          <Phone className="w-4 h-4 mr-1" /> {r.agentRequestData?.phone}
                        </span>
                      </div>
                    </td>
                    {/* Experience */}
                    <td className="px-6 py-4">
                      <span className="flex items-center text-gray-700 text-sm">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {r.agentRequestData?.experience} yrs
                      </span>
                    </td>
                    {/* License */}
                    <td className="px-6 py-4">
                      <span className="text-gray-700 text-sm">
                        {r.agentRequestData?.licenseNumber}
                      </span>
                    </td>
                    {/* Agency */}
                    <td className="px-6 py-4">
                      <span className="text-gray-700 text-sm">
                        {r.agentRequestData?.agency || "-"}
                      </span>
                    </td>
                    {/* Location */}
                    <td className="px-6 py-4">
                      <span className="flex items-center text-gray-700 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {r.agentRequestData?.location}
                      </span>
                    </td>
                    {/* About */}
                    <td className="px-6 py-4">
                      <span className="text-gray-700 text-sm line-clamp-2" title={r.agentRequestData?.about}>
                        {r.agentRequestData?.about}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(r._id, "approve")}
                          className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(r._id, "reject")}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {requests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No agent requests found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentRequests;