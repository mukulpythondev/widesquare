import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Loader,
  BedDouble,
  Bath,
  Maximize,
  MapPin,
  Building,
  User,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { backendurl } from "../../config";

const PropertyRequests = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPropertyRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/products/requests`);
      if (response.data.success) {
        setProperties(response.data.property);
      } else {
        toast.error(response.data.message || "Failed to fetch property requests");
      }
    } catch (error) {
      console.error("Error fetching property requests:", error);
      toast.error("Failed to fetch property requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyRequests();
  }, []);

  const handleApprove = async (propertyId) => {
    if (!window.confirm("Approve this property?")) return;
    setActionLoading(propertyId + "-approve");
    try {
      const response = await axios.put(
        `${backendurl}/api/admin/approve-property/${propertyId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Property approved and is now live!");
        fetchPropertyRequests();
      } else {
        toast.error(response.data.message || "Approval failed");
      }
    } catch (error) {
      toast.error("Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (propertyId) => {
    if (!window.confirm("Reject this property?")) return;
    setActionLoading(propertyId + "-reject");
    try {
      const response = await axios.put(
        `${backendurl}/api/admin/reject-property/${propertyId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Property rejected.");
        fetchPropertyRequests();
      } else {
        toast.error(response.data.message || "Rejection failed");
      }
    } catch (error) {
      toast.error("Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading property requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Property Requests
            </h1>
            <p className="text-gray-600">
              {properties.length} Pending Properties
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {properties.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-lg shadow-sm col-span-full"
              >
                <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No property requests found
                </h3>
                <p className="text-gray-600">
                  All property requests have been reviewed.
                </p>
              </motion.div>
            )}
            {properties.map((property) => (
              <motion.div
                key={property._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Property Image */}
                <div className="relative h-48">
                  <img
                    src={property.image?.[0] || "/placeholder.jpg"}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                      {property.type}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {property.title}
                    </h2>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      {property.location}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{property.price?.toLocaleString()}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${property.availability === 'rent'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                      }`}>
                      For {property.availability}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <BedDouble className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">{property.beds} Beds</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <Bath className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">{property.baths} Baths</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <Maximize className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">{property.sqft} sqft</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 text-sm">{property.description}</p>
                  </div>
                  {/* Amenities */}
                  {property.amenities?.length > 0 && (
                    <div className="border-t pt-4 mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            <Building className="w-3 h-3 mr-1" />
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{property.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Seller/User Info */}
                  <div className="border-t pt-4 mt-auto">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Created By</h3>
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <User className="w-4 h-4" />
                      {property.seller?.name || "Unknown"} ({property.seller?.email || "N/A"})
                    </div>
                  </div>
                  {/* Approve/Reject Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleApprove(property._id)}
                      disabled={actionLoading === property._id + "-approve"}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-60"
                    >
                      {actionLoading === property._id + "-approve" ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(property._id)}
                      disabled={actionLoading === property._id + "-reject"}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
                    >
                      {actionLoading === property._id + "-reject" ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PropertyRequests;