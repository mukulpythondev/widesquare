import React from 'react';
import { steps } from '../assets/stepsdata';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 15
    }
  }
};

function Step({ icon: Icon, title, description, stepNumber }) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative flex flex-col items-center"
    >
      {/* Icon container */}
      <div className="w-20 h-20 bg-card rounded-2xl flex items-center justify-center mb-5 shadow-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Icon className="h-10 w-10 text-primary group-hover:text-primary-foreground relative z-10 transition-colors duration-300" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-xs text-center leading-relaxed">{description}</p>

      {/* Hover indicator */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="mt-4 p-2 bg-muted rounded-full hover:bg-primary transition-colors cursor-pointer"
      >
        <ChevronRight className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
      </motion.div>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-28 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span className="bg-card text-primary px-4 py-1.5 rounded-full text-sm font-medium tracking-wide uppercase">Simple Process</span>
          <h2 className="text-4xl font-bold text-foreground mt-4 mb-4">How It Works</h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Finding your perfect property is easy with our simple three-step process
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 lg:gap-16 relative"
        >
          {/* Process line - desktop */}
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-border">
            <div className="absolute left-0 right-0 top-0 h-full">
              <div className="h-full w-full bg-primary bg-size-200 animate-bg-pos-x"></div>
            </div>
          </div>

          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <Step
                icon={step.icon}
                title={step.title}
                description={step.description}
                stepNumber={index + 1}
              />

              {/* Connection arrows - desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute"
                  style={{ left: `${(index + 0.7) * (100 / 3) + 8}%`, top: '9%' }}>
                  <motion.div
                    animate={{
                      x: [0, 10, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <ArrowRight className="h-8 w-8 text-primary" />
                  </motion.div>
                </div>
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-16"
        >
          <motion.a
            href="/properties"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-black text-white font-medium rounded-lg shadow-lg hover:bg-gray-900 hover:text-white transition-all flex items-center"
          >
            Browse Properties
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.a>
        </motion.div>

        {/* Testimonial teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <div className="bg-card p-8 rounded-xl shadow-xl border border-border text-center">
            <p className="text-muted-foreground italic text-lg mb-4">
              {`"The 3-step process was incredibly smooth. Within a week, I found and secured my dream apartment!"`}
            </p>
            <p className="font-bold text-foreground">Sarah Johnson, New York</p>
            <div className="flex justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
