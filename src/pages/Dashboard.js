import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatsBar from '../components/StatsBar';
import { fetchAirQuality } from '../utils/airQuality';
import './Dashboard.css';

const Dashboard = () => {
  const [aqiData, setAqiData] = useState({
    aqi: 0,
    status: 'Loading...',
    pm25: null,
    pm10: null,
    lastUpdated: null
  });

  useEffect(() => {
    const loadAirQuality = async () => {
      const data = await fetchAirQuality();
      if (data) {
        setAqiData({
          aqi: data.aqi,
          status: data.status,
          pm25: data.pm25.current,
          pm10: data.pm10.current,
          lastUpdated: data.lastUpdated
        });
      }
    };
    loadAirQuality();
    const interval = setInterval(loadAirQuality, 300000);
    return () => clearInterval(interval);
  }, []);

  const aqiValue = aqiData.aqi;

  const getAQIColor = (value) => {
    if (value <= 50) return '#2EC4B6';
    if (value <= 100) return '#F4A261';
    if (value <= 150) return '#E63946';
    return '#9B2335';
  };

  const getAQILabel = (value) => {
    if (value <= 50) return 'Good';
    if (value <= 100) return 'Moderate';
    if (value <= 150) return 'Unhealthy for Sensitive';
    if (value <= 200) return 'Unhealthy';
    if (value <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getFloodRiskColor = (level) => {
    const colors = {
      LOW: '#2EC4B6',
      MEDIUM: '#F4A261',
      HIGH: '#E63946',
      CRITICAL: '#9B2335'
    };
    return colors[level] || '#2EC4B6';
  };

  const missionCards = [
    {
      id: 'earthcare',
      title: 'EarthCare',
      icon: '🌍',
      accentColor: getFloodRiskColor('HIGH'),
      data: {
        aqi: aqiValue,
        floodRisk: 'HIGH',
        lastUpdated: '2 mins ago'
      },
      gradient: 'linear-gradient(135deg, rgba(46, 196, 182, 0.1), rgba(230, 57, 70, 0.1))'
    },
    {
      id: 'healthnet',
      title: 'HealthNet',
      icon: '🏥',
      accentColor: '#2EC4B6',
      data: {
        hospital: 'Bangabandhu Sheikh Mujib Medical University',
        distance: '2.3 km'
      },
      gradient: 'linear-gradient(135deg, rgba(46, 196, 182, 0.15), rgba(100, 149, 237, 0.15))'
    },
    {
      id: 'smartcity',
      title: 'SmartCity',
      icon: '🏙️',
      accentColor: '#F4A261',
      data: {
        activeReports: 47,
        trafficStatus: 'MODERATE'
      },
      gradient: 'linear-gradient(135deg, rgba(244, 162, 97, 0.15), rgba(230, 57, 70, 0.1))'
    }
  ];

  return (
    <div className="dashboard">
      <div className="container">
        <motion.div 
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Emergency Operations Center</h1>
          <p>Bangladesh's unified disaster response and smart city management platform</p>
        </motion.div>

        <StatsBar />

        <div className="mission-cards">
          {missionCards.map((card, index) => (
            <motion.div
              key={card.id}
              className="mission-card glass-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              style={{
                '--accent-color': card.accentColor,
                background: card.gradient
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: `0 0 30px ${card.accentColor}30`
              }}
            >
              <div className="mission-card-header">
                <span className="mission-icon">{card.icon}</span>
                <h3>{card.title}</h3>
              </div>

              <div className="mission-card-content">
                {card.id === 'earthcare' && (
                  <>
                    <div className="aqi-section">
                      <div className="aqi-gauge">
                        <svg viewBox="0 0 120 120" className="aqi-ring">
                          <circle
                            cx="60"
                            cy="60"
                            r="52"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="52"
                            fill="none"
                            stroke={getAQIColor(aqiValue)}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${(aqiValue / 300) * 326.7} 326.7`}
                            transform="rotate(-90 60 60)"
                            style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                          />
                        </svg>
                        <div className="aqi-value">
                          <span className="aqi-number">{aqiValue || '—'}</span>
                          <span className="aqi-label">{aqiData.status}</span>
                        </div>
                      </div>
                      <span className="aqi-title">Air Quality Index</span>
                    </div>
                    <div className="pollutant-info">
                      <span>PM2.5: {aqiData.pm25 !== null ? `${aqiData.pm25.toFixed(1)} µg/m³` : '—'}</span>
                      <span>PM10: {aqiData.pm10 !== null ? `${aqiData.pm10.toFixed(1)} µg/m³` : '—'}</span>
                    </div>
                    <div className="flood-risk-badge" style={{ '--risk-color': getFloodRiskColor('HIGH') }}>
                      <span className="risk-label">Flood Risk</span>
                      <span className="risk-value">{card.data.floodRisk}</span>
                    </div>
                    <span className="last-updated">{aqiData.lastUpdated || 'Updating...'}</span>
                  </>
                )}

                {card.id === 'healthnet' && (
                  <>
                    <div className="hospital-info">
                      <div className="hospital-icon">🏥</div>
                      <div className="hospital-details">
                        <span className="hospital-name">{card.data.hospital}</span>
                        <span className="hospital-distance">{card.data.distance} away</span>
                      </div>
                    </div>
                    <div className="health-actions">
                      <button className="btn btn-teal">
                        <span>🤖</span> AI Symptom Check
                      </button>
                      <button className="btn btn-outline">
                        <span>💚</span> Mental Health
                      </button>
                    </div>
                  </>
                )}

                {card.id === 'smartcity' && (
                  <>
                    <div className="city-stats">
                      <div className="city-stat">
                        <span className="stat-number">{card.data.activeReports}</span>
                        <span className="stat-text">Active Reports</span>
                      </div>
                      <div className="city-stat">
                        <span className="stat-number badge badge-warning">{card.data.trafficStatus}</span>
                        <span className="stat-text">Traffic Status</span>
                      </div>
                    </div>
                    <button className="btn btn-primary">
                      <span>📍</span> Report an Issue
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="quick-actions-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <a href="/flood-map" className="quick-action">
              <span className="action-icon">🌊</span>
              <span>View Flood Map</span>
            </a>
            <a href="/health" className="quick-action">
              <span className="action-icon">🩺</span>
              <span>Health Assistant</span>
            </a>
            <a href="/report" className="quick-action">
              <span className="action-icon">📱</span>
              <span>Report Issue</span>
            </a>
            <a href="tel:999" className="quick-action emergency">
              <span className="action-icon">🚨</span>
              <span>Emergency Call</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;