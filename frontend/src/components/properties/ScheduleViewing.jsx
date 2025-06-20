import React, { useState } from 'react';
import { X, CheckCircle, Users, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendurl } from '../../config';

const ScheduleViewing = ({ propertyId, propertyTitle, propertyLocation, propertyImage, onClose }) => {
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGuestChange = (e) => {
    setGuestInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
        toast.error('Please fill in all your details');
        setLoading(false);
        return;
      }
      const payload = {
        propertyId,
        ...guestInfo,
        isGuest: true
      };
      const response = await axios.post(
        `${backendurl}/api/appointments/enquiry`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error('Enquiry error:', error);
      const errorMessage = error.response?.data?.message || 'Error sending enquiry';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-black hover:text-gray-700 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors z-10"
            aria-label="Close dialog"
          >
            <X size={20} className="text-black" />
          </button>

          {!isSuccess ? (
            <>
              <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
                {propertyImage && (
                  <div className="mr-4 flex-shrink-0">
                    <img 
                      src={propertyImage} 
                      alt={propertyTitle} 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-black truncate">Property Enquiry</h2>
                  {propertyTitle && (
                    <p className="text-black font-medium truncate">{propertyTitle}</p>
                  )}
                  {propertyLocation && (
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="w-3 h-3 mr-1 text-black" />
                      <span className="truncate">{propertyLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={guestInfo.name}
                  onChange={handleGuestChange}
                  className="w-full px-4 py-2 border rounded-lg text-black bg-white"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={guestInfo.email}
                  onChange={handleGuestChange}
                  className="w-full px-4 py-2 border rounded-lg text-black bg-white"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone"
                  value={guestInfo.phone}
                  onChange={handleGuestChange}
                  className="w-full px-4 py-2 border rounded-lg text-black bg-white"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                >
                  {loading ? "Sending..." : "Send Enquiry"}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Enquiry Sent!</h3>
              <p className="text-gray-700 mb-6">
                We've sent your enquiry to our team. You'll be contacted soon.
              </p>
              <button
                onClick={onClose}
                className="bg-black text-white py-2 px-6 rounded-lg hover:bg-gray-900 transition-colors"
              >
                Close
              </button>
            </motion.div>
          )}

          {!isSuccess && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-700">
                <Users className="w-4 h-4 text-black mr-2" />
                <span>A qualified agent will contact you soon</span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScheduleViewing;