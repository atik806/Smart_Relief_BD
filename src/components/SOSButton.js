import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playAlarm, stopAlarm } from '../utils/sosFeatures';
import './SOSButton.css';

const SOSButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  const handleAlarm = async () => {
    if (isAlarmActive) {
      stopAlarm();
      setIsAlarmActive(false);
    } else {
      await playAlarm();
      setIsAlarmActive(true);
      setTimeout(() => {
        stopAlarm();
        setIsAlarmActive(false);
      }, 5000);
    }
  };

  const emergencyServices = [
    { icon: '🚑', label: 'Ambulance', number: '999', action: 'tel:999' },
    { icon: '🚒', label: 'Fire Service', number: '999', action: 'tel:999' },
    { icon: '🚔', label: 'Police', number: '999', action: 'tel:999' },
    { icon: '📞', label: 'Emergency Info', number: '999', action: 'tel:999' },
  ];

  return (
    <div 
      className="sos-container"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
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
                  <span className="sos-option-number">Dial {service.number}</span>
                </div>
              </motion.a>
            ))}
            <motion.button
              className={`sos-option sos-alarm ${isAlarmActive ? 'active' : ''}`}
              onClick={handleAlarm}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="sos-option-icon">{isAlarmActive ? '🔇' : '📢'}</span>
              <div className="sos-option-text">
                <span className="sos-option-label">{isAlarmActive ? 'Stop Alarm' : 'Loud Alarm'}</span>
                <span className="sos-option-number">5 second siren</span>
              </div>
            </motion.button>
            <motion.a
              href="tel:999"
              className="sos-option sos-sos"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="sos-option-icon">🆘</span>
              <div className="sos-option-text">
                <span className="sos-option-label">Call Emergency</span>
                <span className="sos-option-number">Dial 999 immediately</span>
              </div>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`sos-button ${isAlarmActive ? 'alarm-active' : ''}`}
        whileTap={{ scale: 0.95 }}
        animate={isAlarmActive ? {} : {
          boxShadow: [
            '0 0 0 0 rgba(230, 57, 70, 0.7)',
            '0 0 0 20px rgba(230, 57, 70, 0)',
            '0 0 0 0 rgba(230, 57, 70, 0)'
          ]
        }}
        transition={{
          duration: 2,
          repeat: isAlarmActive ? 0 : Infinity,
          ease: 'easeInOut'
        }}
      >
        <span className="sos-text">{isAlarmActive ? '🔊' : 'SOS'}</span>
        <motion.span 
          className="sos-pulse"
          animate={isAlarmActive ? { scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] } : { scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: isAlarmActive ? 0.3 : 2, repeat: Infinity }}
        />
      </motion.button>
    </div>
  );
};

export default SOSButton;