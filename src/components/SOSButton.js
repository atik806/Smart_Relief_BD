import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SOSButton.css';

const SOSButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const emergencyServices = [
    { icon: '🚑', label: 'Call Ambulance', number: '999', action: 'tel:999' },
    { icon: '🚒', label: 'Fire Service', number: '199', action: 'tel:199' },
    { icon: '🚔', label: 'Police', number: '999', action: 'tel:999' },
  ];

  return (
    <div className="sos-container">
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="sos-options"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {emergencyServices.map((service, index) => (
              <motion.a
                key={service.label}
                href={service.action}
                className="sos-option"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="sos-option-icon">{service.icon}</span>
                <div className="sos-option-text">
                  <span className="sos-option-label">{service.label}</span>
                  <span className="sos-option-number">{service.number}</span>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="sos-button"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(230, 57, 70, 0.7)',
            '0 0 0 20px rgba(230, 57, 70, 0)',
            '0 0 0 0 rgba(230, 57, 70, 0)'
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <span className="sos-text">SOS</span>
        <motion.span 
          className="sos-pulse"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    </div>
  );
};

export default SOSButton;