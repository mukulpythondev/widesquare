import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Check, Loader, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { backendurl } from "../../config";
import { Link } from "react-router-dom";

const ServiceEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendurl}/api/services/enquiries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEnquiries(res.data.enquiries || []);
    } catch {
      toast.error("Failed to fetch service enquiries");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      const res = await axios.put(
        `${backendurl}/api/services/enquiry-status`,
        { enquiryId, status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.success) {
        toast.success("Status updated");
        fetchEnquiries();
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch =
      searchTerm === "" ||
      enq.service?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
    <div className="min-h-screen px-4 bg-gray-50 pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Service Enquiries
            </h1>
            <p className="text-gray-600">
              Manage and track all service enquiries submitted by users
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search enquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEnquiries.map((enq) => (
                    <motion.tr
                      key={enq._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-50"
                    >
                      {/* Service */}
                      <td className="px-6 py-4">
                        {enq.service?._id ? (
                          <Link
                            to={`/admin/add-services`} // Or to a service detail page if you have one
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {enq.service.title}
                          </Link>
                        ) : (
                          enq.service?.title || "-"
                        )}
                      </td>
                      {/* Client */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{enq.name}</p>
                          <p className="text-sm text-gray-500">{enq.email}</p>
                        </div>
                      </td>
                      {/* Contact */}
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{enq.phone}</span>
                      </td>
                      {/* Message */}
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{enq.message || "-"}</span>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            enq.status || "pending"
                          )}`}
                        >
                          {(enq.status || "pending").charAt(0).toUpperCase() +
                            (enq.status || "pending").slice(1)}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        {(enq.status === "pending" || !enq.status) && (
                          <button
                            onClick={() =>
                              handleStatusChange(enq._id, "completed")
                            }
                            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                            title="Mark as Done"
                          >
                            <Check className="w-4 h-4" />
                            Done
                          </button>
                        )}
                        {enq.status === "completed" && (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded">
                            <Check className="w-4 h-4 mr-1" /> Done
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filteredEnquiries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No service enquiries found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default ServiceEnquiries;