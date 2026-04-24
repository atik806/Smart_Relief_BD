import React, { useState, useEffect, useRef, useCallback } from 'react';
import './StatsBar.css';

const STATS = [
  { value: 2847, label: 'People Evacuated', icon: '👥' },
  { value: 156, label: 'Active Rescuers', icon: '🚁' },
  { value: 43, label: 'Districts Affected', icon: '📍' },
  { value: 98, label: 'Hospitals Ready', icon: '🏥' },
];

const DURATION_MS = 2000;

/** ease-out cubic */
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const StatsBar = () => {
  const sectionRef = useRef(null);
  const [values, setValues] = useState(() => STATS.map(() => 0));
  const [hasStarted, setHasStarted] = useState(false);
  const rafRef = useRef(null);

  const runCountUp = useCallback(() => {
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      const eased = easeOutCubic(progress);

      setValues(STATS.map((s) => Math.floor(s.value * eased)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setValues(STATS.map((s) => s.value));
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          runCountUp();
        }
      },
      { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [hasStarted, runCountUp]);

  return (
    <section
      ref={sectionRef}
      className="stats-bar"
      aria-label="Response statistics"
    >
      <div className="stats-container">
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={`stat-card glass-card ${hasStarted ? 'stat-card--visible' : ''}`}
          >
            <span className="stat-icon" aria-hidden="true">
              {stat.icon}
            </span>
            <span className="stat-value">{values[index].toLocaleString()}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsBar;
