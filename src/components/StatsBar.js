import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './StatsBar.css';

const StatsBar = () => {
  const stats = [
    { label: 'Alerts Issued Today', value: 2847, suffix: '' },
    { label: 'Hospitals Connected', value: 143, suffix: '' },
    { label: 'Issues Reported', value: 589, suffix: '' },
    { label: 'Districts Under Watch', value: 12, suffix: '' },
  ];

  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);

  const animateValues = React.useCallback(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues(stats.map((stat) => Math.floor(stat.value * easedProgress)));

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedValues(stats.map((stat) => stat.value));
      }
    }, interval);
  }, [stats]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateValues();
        }
      },
      { threshold: 0.5 }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, [hasAnimated, animateValues]);

  return (
    <div id="stats-section" className="stats-bar">
      <div className="stats-container">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            className="stat-item"
            initial={{ opacity: 0, y: 20 }}
            animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <span className="stat-value">
              {animatedValues[index].toLocaleString()}{stat.suffix}
            </span>
            <span className="stat-label">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StatsBar;