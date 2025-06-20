import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BedDouble,
  Bath,
  Maximize,
  ArrowLeft,
  Phone,
  Calendar,
  MapPin,
  Loader,
  Building,
  Share2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Compass
} from "lucide-react";
import { backendurl } from "../../config";
import ScheduleViewing from "./ScheduleViewing";

const parseAmenities = (amenities) => {
  if (!amenities) return [];
  if (Array.isArray(amenities) && amenities.every(a => typeof a === "string")) {
    return amenities;
  }
  if (
    Array.isArray(amenities) &&
    amenities.length === 1 &&
    typeof amenities[0] === "string" &&
    amenities[0].trim().startsWith("[")
  ) {
    try {
      const parsed = JSON.parse(amenities[0]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [amenities[0]];
    }
  }
  if (typeof amenities === "string" && amenities.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(amenities);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [amenities];
    }
  }
  if (typeof amenities === "string") {
    return [amenities];
  }
  return [];
};

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendurl}/api/products/single/${id}`);

        if (response.data.success) {
          const propertyData = response.data.property;
          if (propertyData.status !== "approved") {
            setError("This property is not available.");
            setLoading(false);
            return;
          }
          setProperty({
            ...propertyData,
            amenities: parseAmenities(propertyData.amenities)
          });
          setError(null);
        } else {
          setError(response.data.message || "Failed to load property details.");
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        setError("Failed to load property details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0);
  }, [id]);

  const handleKeyNavigation = useCallback((e) => {
    if (!property) return;
    if (e.key === 'ArrowLeft') {
      setActiveImage(prev => (prev === 0 ? property.image.length - 1 : prev - 1));
    } else if (e.key === 'ArrowRight') {
      setActiveImage(prev => (prev === property.image.length - 1 ? 0 : prev + 1));
    } else if (e.key === 'Escape' && showSchedule) {
      setShowSchedule(false);
    }
  }, [property?.image?.length, showSchedule]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `Check out this ${property.type}: ${property.title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Skeletons ... */}
          <div className="flex items-center justify-between mb-8">
            <div className="w-32 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-[500px] bg-gray-200 rounded-xl mb-8 animate-pulse"></div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-3 w-full max-w-md">
                  <div className="h-10 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="h-28 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse mt-2"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-4/5 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 p-6 bg-gray-100 rounded-xl animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
              <div className="h-7 bg-gray-300 rounded-lg w-1/6"></div>
            </div>
            <div className="h-5 bg-gray-300 rounded-lg w-4/5 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded-lg w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link
            to="/properties"
            className="text-black hover:underline flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1 text-black" /> Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white pt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <Link
            to="/properties"
            className="inline-flex items-center text-black hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-black" /> Back to Properties
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
              hover:bg-gray-100 transition-colors relative text-black"
          >
            {copySuccess ? (
              <span className="text-green-600 flex items-center gap-1">
                <Copy className="w-5 h-5" />
                Copied!
              </span>
            ) : (
              <>
                <Share2 className="w-5 h-5 text-black" />
                Share
              </>
            )}
          </button>
        </nav>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="relative h-[500px] bg-gray-100 rounded-xl overflow-hidden mb-8">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={property.image[activeImage]}
                alt={`${property.title} - View ${activeImage + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              />
            </AnimatePresence>

            {/* Image Navigation */}
            {property.image.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage(prev =>
                    prev === 0 ? property.image.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full
                    bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-black" />
                </button>
                <button
                  onClick={() => setActiveImage(prev =>
                    prev === property.image.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full
                    bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-black" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 
              bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              {activeImage + 1} / {property.image.length}
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-black">
                  <MapPin className="w-5 h-5 mr-2 text-black" />
                  {property.location}
                </div>
              </div>
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Share2 className="w-5 h-5 text-black" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="bg-gray-100 rounded-lg p-6 mb-6">
                  <p className="text-3xl font-bold text-black mb-2">
                    ₹{Number(property.price).toLocaleString('en-IN')}
                  </p>
                  <p className="text-black">
                    Available for {property.availability}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg text-center border border-gray-200">
                    <BedDouble className="w-6 h-6 text-black mx-auto mb-2" />
                    <p className="text-sm text-black">
                      {property.beds} {property.beds > 1 ? 'Beds' : 'Bed'}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center border border-gray-200">
                    <Bath className="w-6 h-6 text-black mx-auto mb-2" />
                    <p className="text-sm text-black">
                      {property.baths} {property.baths > 1 ? 'Baths' : 'Bath'}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center border border-gray-200">
                    <Maximize className="w-6 h-6 text-black mx-auto mb-2" />
                    <p className="text-sm text-black">{property.sqft} sqft</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-black">Contact Details</h2>
                  <div className="flex items-center text-black">
                    <Phone className="w-5 h-5 mr-2 text-black" />
                    {property.phone}
                  </div>
                </div>

                <button
                  onClick={() => setShowSchedule(true)}
                  className="w-full bg-black text-white py-3 rounded-lg 
                    hover:bg-gray-900 transition-colors flex items-center 
                    justify-center gap-2"
                >
                  <Calendar className="w-5 h-5 text-white" />
                  Property Enquiry
                </button>
              </div>

              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-black">Description</h2>
                  <p className="text-black leading-relaxed">
                    {property.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-black">Amenities</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {property.amenities && property.amenities.length > 0 ? (
                      property.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center text-black"
                        >
                          <Building className="w-4 h-4 mr-2 text-black" />
                          {amenity}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400">No amenities listed.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Location */}
        <div className="mt-8 p-6 bg-gray-100 rounded-xl">
          <div className="flex items-center gap-2 text-black mb-4">
            <Compass className="w-5 h-5 text-black" />
            <h3 className="text-lg font-semibold text-black">Location</h3>
          </div>
          <p className="text-black mb-4">
            {property.location}
          </p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(property.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-black hover:underline"
          >
            <MapPin className="w-4 h-4 text-black" />
            View on Google Maps
          </a>
        </div>

        {/* Viewing Modal */}
        <AnimatePresence>
          {showSchedule && (
            <ScheduleViewing
              propertyId={property._id}
              onClose={() => setShowSchedule(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PropertyDetails;