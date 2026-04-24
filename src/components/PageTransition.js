import React from 'react';
import { motion } from 'framer-motion';

const pageMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

/**
 * Wrap route page content for AnimatePresence exit transitions.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div {...pageMotion} style={{ width: '100%' }}>
      {children}
    </motion.div>
  );
}
