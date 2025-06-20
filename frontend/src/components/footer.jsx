import React, { useState } from 'react';
import { 
  Home, 
  Twitter, 
  Facebook, 
  Instagram, 
  Github, 
  Mail, 
  MapPin, 
  Phone,
  ChevronRight,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Mobile Collapsible Footer Section
const MobileFooterSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border py-3 lg:border-none lg:py-0 bg-background">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left lg:hidden"
      >
        <h3 className="text-sm font-bold tracking-wider text-foreground uppercase">
          {title}
        </h3>
        <ChevronDown 
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </button>
      
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-3 lg:mt-0 lg:h-auto lg:opacity-100"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Footer Column Component
const FooterColumn = ({ title, children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {title && (
        <h3 className="hidden lg:block text-sm font-bold tracking-wider text-foreground uppercase mb-4">
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
};

// Footer Link Component
const FooterLink = ({ href, children }) => {
  return (
    <a 
      href={href} 
      className="flex items-center text-base text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1 py-1.5 lg:py-0 group"
    >
      <ChevronRight className="w-3.5 h-3.5 mr-1 text-primary opacity-0 transition-all duration-200 group-hover:opacity-100" />
      {children}
    </a>
  );
};

// Social Links Component
const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter', color: 'bg-foreground', hoverColor: 'hover:bg-primary' },
  { icon: Facebook, href: '#', label: 'Facebook', color: 'bg-foreground', hoverColor: 'hover:bg-primary' },
  { icon: Instagram, href: '#', label: 'Instagram', color: 'bg-foreground', hoverColor: 'hover:bg-primary' },
  { icon: Github, href: 'https://github.com/AAYUSH412/Real-Estate-Website', label: 'GitHub', color: 'bg-foreground', hoverColor: 'hover:bg-primary' },
];

const SocialLinks = () => {
  return (
    <div className="flex items-center gap-3 mt-6">
      {socialLinks.map(({ icon: Icon, href, label, color, hoverColor }) => (
        <motion.a
          key={label}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          href={href}
          title={label}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center text-background ${color} ${hoverColor} rounded-full w-9 h-9 shadow-sm transition-all duration-200`}
        >
          <Icon className="w-4 h-4" />
        </motion.a>
      ))}
    </div>
  );
};

// Thought of the Day Component
const ThoughtOfTheDay = () => {
  const thoughts = [
    "Home is the starting place of love, hope and dreams.",
    "The best investment on Earth is earth.",
    "A house is made of bricks and beams. A home is made of hopes and dreams.",
    "Your future is created by what you do today, not tomorrow.",
    "Opportunities don't happen. You create them.",
    "Every day is a new beginning. Take a deep breath and start again."
  ];
  const today = new Date().getDate();
  const thought = thoughts[today % thoughts.length];

  return (
    <div className="w-full bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-bold tracking-wider text-primary uppercase mb-2">Thought of the Day</h3>
      <p className="text-foreground text-base italic">"{thought}"</p>
    </div>
  );
};

const companyLinks = [
  { name: 'Home', href: '/' },
  { name: 'Properties', href: '/properties' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const helpLinks = [
  { name: 'Customer Support', href: '/contact' },
  { name: 'FAQs', href: '/' },
  { name: 'Terms & Conditions', href: '/' },
  { name: 'Privacy Policy', href: '/' },
];

const contactInfo = [
  { 
    icon: MapPin, 
    text: '4th floor, Bhardwaj bhawan, jakariyapur, Patna.',
    href: 'https://maps.google.com/?q=4th+floor,+Bhardwaj+bhawan,+jakariyapur,+Patna' 
  },
  { 
    icon: Phone, 
    text: '+91 70613 21898',
    href: 'tel:+7061321898'
  },
  { 
    icon: Mail, 
    text: 'support@Widesquare.com',
    href: 'mailto:support@Widesquare.com' 
  },
];

const Footer = () => {
  return (
    <footer className="bg-background text-foreground">
      {/* Main Footer */}
      <div className="pt-12 lg:pt-16 pb-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand section */}
          <div className="mb-10">
            <div className="flex items-center justify-center lg:justify-start">
              <div className="p-2 bg-card rounded-lg">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <span className="ml-3 text-2xl font-bold text-primary">
                Widesquare
              </span>
            </div>
            
            <p className="text-muted-foreground mt-4 text-center lg:text-left lg:mt-6 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Your trusted partner in finding the perfect property. We make property hunting simple, efficient, and tailored to your unique needs.
            </p>
            
            <div className="flex justify-center lg:justify-start">
              <SocialLinks />
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:grid grid-cols-12 gap-8">
            {/* Quick Links Column */}
            <FooterColumn title="Quick Links" className="col-span-2" delay={0.2}>
              <ul className="space-y-3">
                {companyLinks.map(link => (
                  <li key={link.name} className="group">
                    <FooterLink href={link.href}>{link.name}</FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            {/* Help Column */}
            <FooterColumn title="Support" className="col-span-2" delay={0.3}>
              <ul className="space-y-3">
                {helpLinks.map(link => (
                  <li key={link.name} className="group">
                    <FooterLink href={link.href}>{link.name}</FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            {/* Contact Info */}
            <FooterColumn title="Contact Us" className="col-span-3" delay={0.4}>
              <ul className="space-y-4">
                {contactInfo.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className="flex items-start text-muted-foreground hover:text-primary transition-colors duration-200"
                      target={item.icon === MapPin ? "_blank" : undefined}
                      rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                    >
                      <item.icon className="w-4 h-4 mt-1 mr-3 flex-shrink-0 text-primary" />
                      <span className="text-sm">{item.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </FooterColumn>
            
            {/* Thought of the Day */}
            <div className="col-span-5">
              <ThoughtOfTheDay />
            </div>
          </div>

          {/* Mobile Accordions */}
          <div className="lg:hidden space-y-4">
            <MobileFooterSection title="Quick Links">
              <ul className="space-y-2 py-2">
                {companyLinks.map(link => (
                  <li key={link.name} className="group">
                    <FooterLink href={link.href}>{link.name}</FooterLink>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <MobileFooterSection title="Support">
              <ul className="space-y-2 py-2">
                {helpLinks.map(link => (
                  <li key={link.name} className="group">
                    <FooterLink href={link.href}>{link.name}</FooterLink>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <MobileFooterSection title="Contact Us">
              <ul className="space-y-3 py-2">
                {contactInfo.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className="flex items-start text-muted-foreground hover:text-primary transition-colors duration-200"
                      target={item.icon === MapPin ? "_blank" : undefined}
                      rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                    >
                      <item.icon className="w-4 h-4 mt-1 mr-3 flex-shrink-0 text-primary" />
                      <span className="text-sm">{item.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <div className="pt-6 pb-4">
              <ThoughtOfTheDay />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="bg-card border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0 text-center md:text-left">
            © {new Date().getFullYear()} Widesquare properties consultancy Pvt. Ltd. All Rights Reserved.
          </p>
          
          <motion.a
            href="/properties"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center text-primary hover:text-foreground text-sm font-medium"
          >
            Browse Our Properties
            <ArrowRight className="ml-2 h-4 w-4" />
          </motion.a>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </footer>
  );
};

export default Footer;