import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { backendurl } from "../config";
import { Upload, X } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { uploadToCloudinary } from '../lib/cloudinaryUpload';

const PROPERTY_TYPES = [
  'House','Apartment','Office','Villa','Shop','Plot','Flat',
  'Farmhouse','Warehouse','Commercial Space','industrial Property'
];
const AVAILABILITY_TYPES = ['rent', 'buy'];
const AMENITIES = [
  'Lake View','Fireplace','Central heating and air conditioning','Dock','Pool',
  'Garage','Garden','Gym','Security system','Master bathroom','Guest bathroom',
  'Home theater','Exercise room/gym','Covered parking','High-speed internet ready'
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
    imageUrls: []  // Changed from images to imageUrls for consistency
  });
  
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');

  // determine if beds/baths should appear
  const shouldShowBedsAndBaths = () => formData.type !== 'Plot';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'type' && value === 'Plot') {
      setFormData(prev => ({ ...prev, beds: '', baths: '' }));
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

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    if (files.length + previewUrls.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls = [];
    
    try {
      // Upload images sequentially to avoid overwhelming the service
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        
        try {
          const url = await uploadToCloudinary(file);
          
          if (url) {
            uploadedUrls.push(url);
            // Update preview immediately for better UX
            setPreviewUrls(prev => [...prev, url]);
          } else {
            throw new Error('No URL returned from upload');
          }
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      // Update form data with all successfully uploaded images
      if (uploadedUrls.length > 0) {
        setFormData(prev => {
          const updatedImageUrls = [...prev.imageUrls, ...uploadedUrls];
          return {
            ...prev, 
            imageUrls: updatedImageUrls
          };
        });
        
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      }

    } catch (err) {
      console.error("Image upload process failed:", err);
      toast.error('Image upload failed. Please try again.');
    } finally {
      setUploadingImages(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.imageUrls.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    
    if (shouldShowBedsAndBaths() && (!formData.beds || !formData.baths)) {
      toast.error('Please fill in bedrooms and bathrooms');
      return;
    }

    setLoading(true);
    try {
      // Prepare payload - map imageUrls to image field expected by backend
      const payload = {
        title: formData.title,
        type: formData.type,
        price: parseFloat(formData.price),
        location: formData.location,
        description: formData.description,
        beds: formData.beds ? parseInt(formData.beds) : null,
        baths: formData.baths ? parseInt(formData.baths) : null,
        sqft: parseFloat(formData.sqft),
        phone: formData.phone,
        availability: formData.availability,
        amenities: formData.amenities,
        image: formData.imageUrls // Map imageUrls to image field for backend
      };
      
      
      const response = await axios.post(
        `${backendurl}/api/products/add`,
        payload,
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000 // 30 second timeout
        }
      );
      
      if (response.data.success) {
        toast.success('Property submitted for approval!');
        // Reset form
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
          imageUrls: []
        });
        setPreviewUrls([]);
      } else {
        toast.error(response.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      if (error.response?.status === 401) {
        toast.error('Please login first to submit your property.');
        setTimeout(() => window.location.href = "/login", 2000);
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please try again.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !user || loading || uploadingImages;

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto rounded-lg shadow-xl bg-white p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Sell or Rent Your Property
        </h2>
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  disabled={isDisabled}
                >
                  <option value="">Select Type</option>
                  {PROPERTY_TYPES.map(p => (
                    <option key={p} value={p}>{p}</option>
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  disabled={isDisabled}
                >
                  <option value="">Select Availability</option>
                  {AVAILABILITY_TYPES.map(a => (
                    <option key={a} value={a}>{a.charAt(0).toUpperCase()+a.slice(1)}</option>
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
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  disabled={isDisabled}
                />
              </div>
            </div>
            <div className={`grid ${shouldShowBedsAndBaths() ? 'grid-cols-3' : 'grid-cols-1'} gap-4`}>
              {shouldShowBedsAndBaths() && (
                <>
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
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      disabled={isDisabled}
                    />
                  </div>
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
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      disabled={isDisabled}
                    />
                  </div>
                </>
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
                  step="0.01"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={isDisabled}
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`predefined-${amenity}`}
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    disabled={isDisabled}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={`predefined-${amenity}`} className="ml-2 block text-sm text-gray-700">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
            
            {/* Custom amenities */}
            {formData.amenities.filter(amenity => !AMENITIES.includes(amenity)).length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Custom Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities
                    .filter(amenity => !AMENITIES.includes(amenity))
                    .map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => handleAmenityToggle(amenity)}
                          className="ml-1 text-indigo-600 hover:text-indigo-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add custom amenity"
                disabled={isDisabled}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                disabled={isDisabled || !newAmenity.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Images (Max 4) {uploadingImages && <span className="text-indigo-600">- Uploading...</span>}
            </label>
            
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-40 w-full object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        console.error(`Failed to load image: ${url}`);
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">Failed to load</text></svg>';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={uploadingImages}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {previewUrls.length < 4 && (
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className={`mx-auto h-12 w-12 ${uploadingImages ? 'text-indigo-500 animate-pulse' : 'text-gray-400'}`} />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className={`relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 ${uploadingImages ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <span>{uploadingImages ? 'Uploading...' : 'Upload images'}</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                        disabled={uploadingImages}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDisabled || previewUrls.length === 0}
            >
              {loading ? 'Submitting...' : uploadingImages ? 'Please wait for upload...' : 'Submit Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellRentPropertyForm;