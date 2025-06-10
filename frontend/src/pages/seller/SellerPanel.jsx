import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendurl } from "../../config";
import { Link } from "react-router-dom";
import { Loader, Edit3, Trash2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

const SellerPanel = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all properties created by this seller
    const fetchSellerProperties = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${backendurl}/api/products/my-properties`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setProperties(res.data.properties || []);
        } catch {
            toast.error("Failed to fetch your properties");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSellerProperties();
    }, []);

    // Delete property
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this property?")) return;
        try {
            await axios.delete(`${backendurl}/api/products/seller/property/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            toast.success("Property deleted");
            fetchSellerProperties();
        } catch {
            toast.error("Failed to delete property");
        }
    };

    return (
        <div className="min-h-screen pt-32 px-4 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Seller Panel</h1>
                <Link
                    to="/sell-property"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 inline-block"
                >
                    <Plus className="inline-block w-5 h-5 mr-2" />
                    Add New Property
                </Link>
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader className="animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.length === 0 && (
                            <div className="col-span-full text-center text-gray-500">
                                No properties created yet.
                            </div>
                        )}
                        {properties.map((p) => (
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
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${p.status === "approved"
                                                ? "bg-green-100 text-green-700"
                                                : p.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {p.status === "approved"
                                            ? "Live"
                                            : p.status === "pending"
                                                ? "Pending Approval"
                                                : "Rejected"}
                                    </span>
                                </div>
                                <div className="flex-1"></div>
                                <div className="flex gap-2 mt-3">
                                    <Link
                                        to={`/seller-panel/edit/${p._id}`}
                                        className="text-blue-600"
                                    >
                                        <Edit3 />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(p._id)}
                                        className="text-red-600"
                                    >
                                        <Trash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerPanel;