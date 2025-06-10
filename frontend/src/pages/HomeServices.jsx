import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendurl } from "../config";
import { toast } from "react-hot-toast";
import Hero from "../components/services/Hero";

const HomeServices = () => {
    const [services, setServices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

    useEffect(() => {
        axios.get(`${backendurl}/api/services/list`).then(res => {
            setServices(res.data.services || []);
        });
    }, []);

    const handleEnquire = (service) => {
        setSelectedService(service);
        setShowForm(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${backendurl}/api/services/enquiry`, {
                serviceId: selectedService._id,
                ...form,
            });
            toast.success("Enquiry submitted!");
            setShowForm(false);
            setForm({ name: "", email: "", phone: "", message: "" });
        } catch {
            toast.error("Failed to submit enquiry");
        }
    };

    return (
        <>
        <Hero/>
        <div className="min-h-screen pt-32 px-4 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Our Services</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div key={service._id} className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
                            <img
                                src={service.image || "/placeholder.jpg"}
                                alt={service.title}
                                className="w-full h-40 object-cover rounded mb-3"
                            />
                            <h2 className="text-lg font-bold mb-1">{service.title}</h2>
                            <div className="text-gray-600 mb-2">{service.description}</div>
                            <button
                                className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                onClick={() => handleEnquire(service)}
                            >
                                Enquire
                            </button>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow max-w-lg w-full relative">
                            <button
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                                onClick={() => setShowForm(false)}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <h2 className="text-xl font-bold mb-2">Enquire for {selectedService.title}</h2>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your Name"
                                    value={form.name}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full border rounded px-3 py-2"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Your Email"
                                    value={form.email}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full border rounded px-3 py-2"
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Your Phone"
                                    value={form.phone}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full border rounded px-3 py-2"
                                />
                                <textarea
                                    name="message"
                                    placeholder="Message (optional)"
                                    value={form.message}
                                    onChange={handleFormChange}
                                    className="w-full border rounded px-3 py-2"
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                                        Submit Enquiry
                                    </button>
                                    <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    )
}

export default HomeServices;