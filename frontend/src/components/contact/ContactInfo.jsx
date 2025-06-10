import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ContactInfoItem from './InfoItem';

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    content: '+91 7250641818',
    link: 'tel:+7250641818',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'support@Widesquare.com',
    link: 'mailto:support@Widesquare.com',
  },
  {
    icon: MapPin,
    title: 'Address',
    content: '4th floor, Bhardwaj bhawan, jakariyapur, Patna.',
    link: 'https://maps.google.com/?q=4th+floor,+Bhardwaj+bhawan,+jakariyapur,+Patna',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    content: 'Mon-Fri: 9 AM - 6 PM',
  },
];

export default function ContactInfo() {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="bg-white p-8 rounded-2xl shadow-sm"
    >
      <h2 className="text-2xl font-bold mb-8">Our Office</h2>
      <div className="space-y-6">
        {contactInfo.map((info, index) => (
          <ContactInfoItem key={index} {...info} />
        ))}
      </div>
    </motion.div>
  );
}