import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const TICKER_MESSAGES = [
  '🌊 FLOOD ALERT: Sylhet district - Level 3',
  '🚧 Road closed: Dhaka-Chittagong highway km 45',
  "⚠️ Cyclone watch: Cox's Bazar coastal areas",
  '🏥 Emergency: Dhaka Medical College accepting flood victims',
];

const EMERGENCY_SOS_LINKS = [
  { icon: '🚔', label: 'Police', number: '999', href: 'tel:999' },
  { icon: '🚒', label: 'Fire', number: '199', href: 'tel:199' },
  { icon: '🌊', label: 'Flood helpline', number: '16555', href: 'tel:16555' },
];

const Navbar = () => {
  const [time, setTime] = useState(new Date());
  const [sosOpen, setSosOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSosOpen, setMobileSosOpen] = useState(false);
  const sosRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sosRef.current && !sosRef.current.contains(e.target)) {
        setSosOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSosOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/flood-map', label: 'Flood Map' },
    { path: '/health', label: 'Health' },
    { path: '/report', label: 'Report Issue' },
  ];

  const tickerLoop = [...TICKER_MESSAGES, ...TICKER_MESSAGES];

  return (
    <>
      <div
        className="alert-ticker"
        role="region"
        aria-label="Live emergency alerts"
        aria-live="polite"
      >
        <div className="ticker-content">
          {tickerLoop.map((message, index) => (
            <span key={`alert-${index}`} className="ticker-item">
              {message}
            </span>
          ))}
        </div>
      </div>

      <header className="site-header">
        <nav className="navbar" aria-label="Main navigation">
          <div className="navbar-container">
            <Link to="/" className="navbar-logo">
              <span className="logo-shield" aria-hidden="true">
                🛡️
              </span>
              <span className="logo-title">Smart Relief BD</span>
              <span className="logo-badge">BD</span>
            </Link>

            <ul className="navbar-links">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="navbar-trailing">
              <div className="navbar-right">
                <div className="navbar-time">
                  <span className="time-display">{formatTime(time)}</span>
                  <span className="date-display">{formatDate(time)}</span>
                </div>
                <div className="weather-badge" aria-label="Weather Dhaka">
                  <span className="weather-icon" aria-hidden="true">
                    ⛅
                  </span>
                  <span className="weather-compact">32°C Dhaka</span>
                </div>

                <div ref={sosRef} className="sos-dropdown-desktop sos-dropdown-container">
                  <button
                    type="button"
                    className="nav-link emergency-link"
                    onClick={() => setSosOpen(!sosOpen)}
                    aria-expanded={sosOpen}
                    aria-haspopup="true"
                    aria-label="Emergency SOS: open helpline numbers"
                  >
                    Emergency SOS
                  </button>
                  {sosOpen && (
                    <div className="sos-dropdown">
                      {EMERGENCY_SOS_LINKS.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          className="sos-dropdown-item"
                          aria-label={`Call ${item.label}, ${item.number}`}
                        >
                          <span className="sos-item-icon">{item.icon}</span>
                          <div className="sos-item-text">
                            <span className="sos-item-label">{item.label}</span>
                            <span className="sos-item-number">Dial {item.number}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                className={`mobile-menu-btn ${mobileMenuOpen ? 'is-open' : ''}`}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-panel"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileMenuOpen((o) => !o)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav-panel"
            className="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              type="button"
              className="mobile-nav-backdrop"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="mobile-nav-panel glass-card"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              <ul className="mobile-nav-links">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="mobile-sos-block">
                  <button
                    type="button"
                    className="mobile-sos-toggle"
                    aria-expanded={mobileSosOpen}
                    aria-label="Emergency SOS: show helpline numbers"
                    onClick={() => setMobileSosOpen((o) => !o)}
                  >
                    Emergency SOS
                    <span className="mobile-sos-chevron">{mobileSosOpen ? '▲' : '▼'}</span>
                  </button>
                  {mobileSosOpen && (
                    <div className="mobile-sos-list">
                      {EMERGENCY_SOS_LINKS.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          className="mobile-sos-item"
                          aria-label={`Call ${item.label}, ${item.number}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                          <span className="mobile-sos-dial">Dial {item.number}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
