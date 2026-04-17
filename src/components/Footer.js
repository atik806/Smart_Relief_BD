import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-about">
            <div className="footer-logo">
              <svg className="footer-logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2L4 10V22C4 31.94 10.84 41.16 20 44C29.16 41.16 36 31.94 36 22V10L20 2Z" 
                  stroke="#E63946" strokeWidth="2" fill="none"/>
                <path d="M20 8L10 13V20C10 26.63 14.25 32.75 20 35C25.75 32.75 30 26.63 30 20V13L20 8Z" 
                  fill="#E63946"/>
                <circle cx="20" cy="18" r="4" fill="#FFFFFF"/>
                <path d="M20 22V28" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Smart Relief BD</span>
            </div>
            <p className="footer-description">
              Unified disaster response, health emergency, and smart city management platform for Bangladesh.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#0A1628"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Dashboard</a></li>
              <li><a href="/flood-map">Flood Map</a></li>
              <li><a href="/health">Health Assistant</a></li>
              <li><a href="/report">Report Issue</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact</h4>
            <ul>
              <li>
                <span className="contact-icon">📍</span>
                East West University, Dhaka
              </li>
              <li>
                <span className="contact-icon">📞</span>
                Emergency: 999
              </li>
              <li>
                <span className="contact-icon">📧</span>
                info@resqbd.gov.bd
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Powered by <strong>EWU Robotics Club</strong> × <strong>NRF26 Hackathon</strong></p>
          <p className="copyright">© 2026 Smart Relief BD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;