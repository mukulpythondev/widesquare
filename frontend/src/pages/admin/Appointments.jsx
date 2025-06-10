import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  User,
  Home,
  Check,
  X,
  Loader,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { backendurl } from "../../config";
import { Link } from "react-router-dom";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/appointments/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.success) {
        setAppointments(response.data.appointments);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await axios.put(
        `${backendurl}/api/appointments/status`,
        {
          appointmentId,
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(`Appointment ${newStatus} successfully`);
        fetchAppointments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment status");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      searchTerm === "" ||
      apt.propertyId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.guest?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.guest?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "all" || apt.status === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "enquiry":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header and Search Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Appointments
            </h1>
            <p className="text-gray-600">
              Manage and track property viewing appointments and enquiries
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white font-medium transition">
              <Link to={'/admin/service-enquery'}>Service Enquery</Link>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Appointments</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="enquiry">Enquiry</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
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
                {filteredAppointments.map((appointment) => (
                  <motion.tr
                    key={appointment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    {/* Property Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Home className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {appointment.propertyId?._id ? (
                              <Link
                                to={`/properties/single/${appointment.propertyId._id}`}
                                className="text-blue-600 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {appointment.propertyId.title}
                              </Link>
                            ) : (
                              appointment.propertyId?.title || "-"
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.propertyId?.location || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Client Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {appointment.userId?.name ||
                              appointment.guest?.name ||
                              "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.userId?.email ||
                              appointment.guest?.email ||
                              "Unknown"}
                          </p>
                          {appointment.guest?.phone && (
                            <p className="text-xs text-gray-400">
                              {appointment.guest.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Agent Details */}
                    <td className="px-6 py-4">
                      {appointment.propertyId?.assignedAgent ? (
                        <div>
                          <p className="font-medium text-gray-900">
                            {appointment.propertyId.assignedAgent.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.propertyId.assignedAgent.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">No agent</span>
                      )}
                    </td>

                    {/* Seller Details */}
                    <td className="px-6 py-4">
                      {appointment.propertyId?.seller ? (
                        <div>
                          <p className="font-medium text-gray-900">
                            {appointment.propertyId.seller.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.propertyId.seller.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">No seller</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      {appointment.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleStatusChange(appointment._id, "confirmed")
                            }
                            className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(appointment._id, "cancelled")
                            }
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Mark enquiry as done */}
                      {appointment.status === "enquiry" && (
                        <button
                          onClick={() =>
                            handleStatusChange(appointment._id, "completed")
                          }
                          className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                          title="Mark as Done"
                        >
                          <Check className="w-4 h-4" />
                          Done
                        </button>
                      )}

                      {/* Show tick if already completed */}
                      {appointment.status === "completed" && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded">
                          <Check className="w-4 h-4 mr-1" /> Done
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No appointments found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;