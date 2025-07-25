import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { backendurl } from "../config";
import { Upload, X } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const PROPERTY_TYPES = ['House', 'Apartment', 'Office', 'Villa','Shop','Plot','Flat','Farmhouse','Warehouse','Commercial Space','industrial Property'];
const AVAILABILITY_TYPES = ['rent', 'buy'];
const AMENITIES = [
    'Lake View', 'Fireplace', 'Central heating and air conditioning', 'Dock', 'Pool',
    'Garage', 'Garden', 'Gym', 'Security system', 'Master bathroom', 'Guest bathroom',
    'Home theater', 'Exercise room/gym', 'Covered parking', 'High-speed internet ready'
];

const SellRentPropertyForm = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        price: '',
        location: '',
        description: '',
        beds: '',
        baths: '',
        sqft: '',
        phone: '',
        availability: '',
        amenities: [],
        images: []
    });

    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newAmenity, setNewAmenity] = useState('');

    // Check if selected type should show beds/baths
    const shouldShowBedsAndBaths = () => {
        return formData.type !== 'Plot';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Reset beds and baths when Plot is selected
        if (name === 'type' && value === 'Plot') {
            setFormData(prev => ({
                ...prev,
                beds: '',
                baths: ''
            }));
        }
    };

    const handleAmenityToggle = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + previewUrls.length > 4) {
            alert('Maximum 4 images allowed');
            return;
        }

        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const removeImage = (index) => {
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleAddAmenity = () => {
        if (newAmenity && !formData.amenities.includes(newAmenity)) {
            setFormData(prev => ({
                ...prev,
                amenities: [...prev.amenities, newAmenity]
            }));
            setNewAmenity('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formdata = new FormData();
            formdata.append('title', formData.title);
            formdata.append('type', formData.type);
            formdata.append('price', formData.price);
            formdata.append('location', formData.location);
            formdata.append('description', formData.description);
            
            // Only add beds/baths if not Plot type
            if (shouldShowBedsAndBaths()) {
                formdata.append('beds', formData.beds);
                formdata.append('baths', formData.baths);
            }
            
            formdata.append('sqft', formData.sqft);
            formdata.append('phone', formData.phone);
            formdata.append('availability', formData.availability);
            formData.amenities.forEach((amenity, index) => {
                formdata.append(`amenities[${index}]`, amenity);
            });
            formData.images.forEach((image, index) => {
                formdata.append(`image${index + 1}`, image);
            });

            const response = await axios.post(`${backendurl}/api/products/add`, formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success('Property submitted for approval!');
                setFormData({
                    title: '',
                    type: '',
                    price: '',
                    location: '',
                    description: '',
                    beds: '',
                    baths: '',
                    sqft: '',
                    phone: '',
                    availability: '',
                    amenities: [],
                    images: []
                });
                setPreviewUrls([]);
            } else {
                toast.error(response.data.message || 'Submission failed');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                toast.error('Please login first to submit your property.');
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            } else {
                toast.error('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Disable all fields if not logged in
    const isDisabled = !user;

    return (
        <div className="min-h-screen pt-32 px-4 bg-gray-50">
            <div className="max-w-2xl mx-auto rounded-lg shadow-xl bg-white p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sell or Rent Your Property</h2>
                {!user && (
                    <div className="mb-6 text-center text-red-600 font-medium">
                        Please <Link to="/login" className="text-blue-600 underline">login</Link> to fill and submit this form.
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Property Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                disabled={isDisabled}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                disabled={isDisabled}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                    Property Type
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    required
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled={isDisabled}
                                >
                                    <option value="">Select Type</option>
                                    {PROPERTY_TYPES.map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                                    Availability
                                </label>
                                <select
                                    id="availability"
                                    name="availability"
                                    required
                                    value={formData.availability}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled={isDisabled}
                                >
                                    <option value="">Select Availability</option>
                                    {AVAILABILITY_TYPES.map(type => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    required
                                    min="0"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled={isDisabled}
                                />
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    required
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled={isDisabled}
                                />
                            </div>
                        </div>
                        <div className={`grid ${shouldShowBedsAndBaths() ? 'grid-cols-3' : 'grid-cols-1'} gap-4`}>
                            {/* Beds - Only show if not Plot */}
                            {shouldShowBedsAndBaths() && (
                                <div>
                                    <label htmlFor="beds" className="block text-sm font-medium text-gray-700">
                                        Bedrooms
                                    </label>
                                    <input
                                        type="number"
                                        id="beds"
                                        name="beds"
                                        required
                                        min="0"
                                        value={formData.beds}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        disabled={isDisabled}
                                    />
                                </div>
                            )}
                            {/* Baths - Only show if not Plot */}
                            {shouldShowBedsAndBaths() && (
                                <div>
                                    <label htmlFor="baths" className="block text-sm font-medium text-gray-700">
                                        Bathrooms
                                    </label>
                                    <input
                                        type="number"
                                        id="baths"
                                        name="baths"
                                        required
                                        min="0"
                                        value={formData.baths}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        disabled={isDisabled}
                                    />
                                </div>
                            )}
                            <div>
                                <label htmlFor="sqft" className="block text-sm font-medium text-gray-700">
                                    Square Feet
                                </label>
                                <input
                                    type="number"
                                    id="sqft"
                                    name="sqft"
                                    required
                                    min="0"
                                    value={formData.sqft}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled={isDisabled}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Contact Phone
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                disabled={isDisabled}
                            />
                        </div>
                    </div>
                    {/* Amenities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amenities
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {AMENITIES.map((amenity, index) => (
                                <div key={index} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`amenity-${index}`}
                                        name="amenities"
                                        value={amenity}
                                        checked={formData.amenities.includes(amenity)}
                                        onChange={() => handleAmenityToggle(amenity)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        disabled={isDisabled}
                                    />
                                    <label htmlFor={`amenity-${index}`} className="ml-2 block text-sm text-gray-700">
                                        {amenity}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center">
                            <input
                                type="text"
                                value={newAmenity}
                                onChange={(e) => setNewAmenity(e.target.value)}
                                placeholder="Add new amenity"
                                className="mt-1 block w-full rounded-md border border-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                disabled={isDisabled}
                            />
                            <button
                                type="button"
                                onClick={handleAddAmenity}
                                className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                disabled={isDisabled}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Property Images (Max 4)
                        </label>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        className="h-40 w-full object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        disabled={isDisabled}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {previewUrls.length < 4 && (
                            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                            <span>Upload images</span>
                                            <input
                                                id="images"
                                                name="images"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="sr-only"
                                                disabled={isDisabled}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={loading || isDisabled}
                        >
                            {loading ? 'Submitting...' : 'Submit Property'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SellRentPropertyForm;