import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { backendurl } from "../../config";
import { X, Upload } from 'lucide-react';
import { uploadToCloudinary } from '../../lib/cloudinaryUpload';
const PROPERTY_TYPES = ['House', 'Apartment', 'Office', 'Villa', 'Plot', 'Shop', 'Flat', 'Farmhouse', 'Warehouse', 'Commercial Space', 'industrial Property'];
const AVAILABILITY_TYPES = ['rent', 'buy'];
const AMENITIES = ['Lake View', 'Fireplace', 'Central heating and air conditioning', 'Dock', 'Pool', 'Garage', 'Garden', 'Gym', 'Security system', 'Master bathroom', 'Guest bathroom', 'Home theater', 'Exercise room/gym', 'Covered parking', 'High-speed internet ready'];

const Update = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    imageUrls: [] // Changed from images to imageUrls for Cloudinary
  });
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Check if selected type should show beds/baths
  const shouldShowBedsAndBaths = () => {
    return formData.type !== 'Plot';
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`${backendurl}/api/products/single/${id}`);

        if (response.data.success) {
          const property = response.data.property;
          
          // Extract URLs from the existing image structure
          const existingImageUrls = Array.isArray(property.image)
            ? property.image.filter(Boolean)
            : [];

          setFormData({
            title: property.title,
            type: property.type,
            price: property.price,
            location: property.location,
            description: property.description,
            beds: property.beds,
            baths: property.baths,
            sqft: property.sqft,
            phone: property.phone,
            availability: property.availability,
            amenities: property.amenities,
            imageUrls: existingImageUrls // Store URLs directly
          });
          
          setPreviewUrls(existingImageUrls);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error('An error occurred. Please try again.');
      }
    };

    fetchProperty();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
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
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
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
      // Prepare payload - send imageUrls as image field for backend compatibility
      const payload = {
        id: id,
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
        image: formData.imageUrls // Send URLs instead of files
      };



      const response = await axios.post(
        `${backendurl}/api/products/update`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json", // Changed from multipart/form-data
          },
          timeout: 30000 // 30 second timeout
        }
      );

      if (response.data.success) {
        toast.success('Property updated successfully');
        navigate('/admin/list');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Submit error:', error);
      if (error.code === 'ECONNABORTED') {
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

  const isDisabled = loading || uploadingImages;

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto rounded-lg shadow-xl bg-white p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Property</h2>

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
                disabled={isDisabled}
                className="mt-1 block w-full rounded-md border border-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                disabled={isDisabled}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  disabled={isDisabled}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  disabled={isDisabled}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  disabled={isDisabled}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  disabled={isDisabled}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                    disabled={isDisabled}
                    className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                    disabled={isDisabled}
                    className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  disabled={isDisabled}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                disabled={isDisabled}
                className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  disabled={isDisabled}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${formData.amenities.includes(amenity)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {amenity}
                </button>
              ))}
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
                    disabled={isDisabled}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
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
                    <label htmlFor="images" className={`relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <span>{uploadingImages ? 'Uploading...' : 'Upload images'}</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isDisabled}
                        className="sr-only"
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
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDisabled}
            >
              {loading ? 'Updating...' : uploadingImages ? 'Uploading Images...' : 'Update Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Update;