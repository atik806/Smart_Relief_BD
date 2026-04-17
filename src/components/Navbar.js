import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [time, setTime] = useState(new Date());
  const [weather] = useState({ city: 'Dhaka', temp: 34, condition: '⛈' });
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/flood-map', label: 'Flood Map' },
    { path: '/health', label: 'Health' },
    { path: '/report', label: 'Report Issue' },
  ];

  return (
    <>
      <div className="alert-ticker">
        <div className="ticker-content">
          <span className="ticker-item">⚠ Flood Warning: Sylhet Division — HIGH RISK</span>
          <span className="ticker-item">⚠ Heavy Rain Alert: North-East Bangladesh</span>
          <span className="ticker-item">⚠ Water Level Critical: Surma River</span>
          <span className="ticker-item">🟢 Road Cleared: Dhaka-Chittagong Highway</span>
          <span className="ticker-item">⚠ Flood Warning: Sylhet Division — HIGH RISK</span>
          <span className="ticker-item">⚠ Heavy Rain Alert: North-East Bangladesh</span>
          <span className="ticker-item">⚠ Water Level Critical: Surma River</span>
          <span className="ticker-item">🟢 Road Cleared: Dhaka-Chittagong Highway</span>
        </div>
      </div>
      
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <svg className="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2L4 10V22C4 31.94 10.84 41.16 20 44C29.16 41.16 36 31.94 36 22V10L20 2Z" 
                stroke="#E63946" strokeWidth="2" fill="none"/>
              <path d="M20 8L10 13V20C10 26.63 14.25 32.75 20 35C25.75 32.75 30 26.63 30 20V13L20 8Z" 
                fill="#E63946"/>
              <circle cx="20" cy="18" r="4" fill="#FFFFFF"/>
              <path d="M20 22V28" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="logo-text">Smart Relief <span className="logo-accent">BD</span></span>
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
            <li>
              <Link to="/emergency" className="nav-link emergency-link">
                Emergency SOS
              </Link>
            </li>
          </ul>

          <div className="navbar-right">
            <div className="navbar-time">
              <span className="time-display">{formatTime(time)}</span>
              <span className="date-display">{formatDate(time)}</span>
            </div>
            <div className="weather-badge">
              <span className="weather-icon">{weather.condition}</span>
              <span className="weather-temp">{weather.temp}°C</span>
              <span className="weather-city">{weather.city}</span>
            </div>
            <button className="login-btn">Login</button>
          </div>

          <button className="mobile-menu-btn">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;