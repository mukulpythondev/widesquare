import React, { useState } from "react";
import axios from "axios";
import { backendurl } from "../../config";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const ApplyAgent = () => {
    const { user } = useAuth();
    const [form, setForm] = useState({
        phone: "",
        experience: "",
        licenseNumber: "",
        about: "",
        agency: "",
        location: "",
    });
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError(""); setSuccess("");
        try {
            await axios.post(`${backendurl}/api/users/request-agent`, form, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setSuccess("Your agent application has been submitted!");
        } catch (err) {
            setError(err.response?.data?.message || "Error submitting request");
        }
    };

    return (
        <div className="bg-white w-full h-fit py-20">
            <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Apply to Become an Agent</h2>
                {!user ? (
                    <div className="text-center py-10">
                        <p className="text-lg text-gray-700 mb-4">
                            Please <Link to="/login" className="text-blue-600 underline">login</Link> to fill out the agent application form.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input name="phone" required placeholder="Phone Number" className="w-full border p-2 rounded" value={form.phone} onChange={handleChange} />
                        <input name="experience" required placeholder="Experience (years)" className="w-full border p-2 rounded" value={form.experience} onChange={handleChange} />
                        <input name="licenseNumber" required placeholder="Real Estate License Number" className="w-full border p-2 rounded" value={form.licenseNumber} onChange={handleChange} />
                        <input name="agency" placeholder="Agency (if any)" className="w-full border p-2 rounded" value={form.agency} onChange={handleChange} />
                        <input name="location" required placeholder="Location/City" className="w-full border p-2 rounded" value={form.location} onChange={handleChange} />
                        <textarea name="about" required placeholder="Tell us about yourself" className="w-full border p-2 rounded" value={form.about} onChange={handleChange} />
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Submit Application</button>
                    </form>
                )}
                {success && <div className="text-green-600 mt-4">{success}</div>}
                {error && <div className="text-red-600 mt-4">{error}</div>}
            </div>
        </div>
    );
};

export default ApplyAgent;