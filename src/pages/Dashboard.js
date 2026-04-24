import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatsBar from '../components/StatsBar';
import PageTransition from '../components/PageTransition';
import { fetchAirQuality, getAQIStatus } from '../utils/airQuality';
import './Dashboard.css';

const POLL_MS = 5 * 60 * 1000;

const MOCK_ALERTS = [
  {
    id: 1,
    time: '14:22',
    date: 'Today',
    type: 'Flood',
    typeClass: 'alert-type--flood',
    description: 'Surma River level rising — Sylhet Division on watch.',
  },
  {
    id: 2,
    time: '13:05',
    date: 'Today',
    type: 'Weather',
    typeClass: 'alert-type--weather',
    description: 'Heavy rainfall forecast for coastal districts next 24h.',
  },
  {
    id: 3,
    time: '11:40',
    date: 'Today',
    type: 'Road',
    typeClass: 'alert-type--road',
    description: 'Dhaka–Chittagong highway partial closure km 45 (landslide risk).',
  },
  {
    id: 4,
    time: '09:15',
    date: 'Today',
    type: 'Medical',
    typeClass: 'alert-type--medical',
    description: 'DMCH surge capacity activated for flood-related admissions.',
  },
  {
    id: 5,
    time: 'Yesterday',
    date: '23 Apr',
    type: 'Cyclone',
    typeClass: 'alert-type--cyclone',
    description: 'Cox’s Bazar coastal areas remain under cyclone watch.',
  },
];

const tierFromAqiLabel = (label) => {
  if (label === 'Data unavailable') return 'unavailable';
  if (label === 'Good') return 'good';
  if (label === 'Moderate') return 'moderate';
  if (label === 'Unhealthy for Sensitive') return 'sensitive';
  if (label === 'Unknown') return 'moderate';
  return 'unhealthy';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [aqiData, setAqiData] = useState({
    label: 'Loading...',
    emoji: '',
    color: 'rgba(255,255,255,0.35)',
    pm25: null,
    pm10: null,
    lastUpdated: null,
  });
  const [aqiLoading, setAqiLoading] = useState(true);

  const loadAirQuality = useCallback(async () => {
    const data = await fetchAirQuality();
    setAqiLoading(false);
    if (data) {
      const q = getAQIStatus(data.pm25);
      setAqiData({
        label: q.label,
        emoji: q.emoji,
        color: q.color,
        pm25: data.pm25,
        pm10: data.pm10,
        lastUpdated: data.lastUpdated,
      });
    }
  }, []);

  useEffect(() => {
    loadAirQuality();
    const poll = setInterval(loadAirQuality, POLL_MS);
    return () => clearInterval(poll);
  }, [loadAirQuality]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const aqiTier = tierFromAqiLabel(aqiData.label);
  const aqiStroke = aqiData.color;
  const pm25Gauge = aqiData.pm25 != null ? Math.min(aqiData.pm25 / 75, 1) : 0;

  const heroDateTime = now.toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const handleQuickSos = () => {
    window.location.href = 'tel:999';
  };

  return (
    <PageTransition>
      <div className="dashboard">
        <div className="container">
        <motion.header
          className="dashboard-hero"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="dashboard-hero-top">
            <span className="monitoring-badge" aria-label="System status">
              <span className="monitoring-badge-dot" aria-hidden />
              MONITORING ACTIVE
            </span>
          </div>
          <h1 className="dashboard-hero-title">Bangladesh Emergency Operations Center</h1>
          <p className="dashboard-hero-datetime">{heroDateTime} · Asia/Dhaka</p>
        </motion.header>

        <StatsBar />

        <section className="mission-cards" aria-label="Mission overview">
          <motion.article
            className={`mission-card glass-card mission-card--lift aqi-tier--${aqiTier}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.45 }}
            style={{ '--aqi-accent': aqiStroke }}
          >
            <div className="mission-card-header">
              <span className="mission-icon" aria-hidden="true">
                🌍
              </span>
              <div className="mission-title-row">
                <h2 className="mission-card-title">EarthCare</h2>
                <span className="mission-status-dot" title="Operational" aria-hidden />
              </div>
            </div>
            <p className="mission-tagline">Live air quality &amp; environmental risk</p>

            {aqiLoading ? (
              <div
                className="aqi-skeleton-block"
                aria-busy="true"
                aria-label="Loading air quality data"
              >
                <div className="aqi-skeleton-row aqi-skeleton-row--top">
                  <div className="skeleton skeleton--circle" />
                  <div className="skeleton skeleton--pill" />
                </div>
                <div className="aqi-skeleton-row">
                  <div className="skeleton skeleton--line" />
                  <div className="skeleton skeleton--line" />
                </div>
                <div className="skeleton skeleton--line skeleton--line-wide" />
              </div>
            ) : (
              <>
                <div className="aqi-flood-row">
                  <div className="aqi-gauge-wrap">
                    <div className="aqi-gauge">
                      <svg viewBox="0 0 120 120" className="aqi-ring" aria-hidden>
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
                          stroke={aqiStroke}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${pm25Gauge * 326.7} 326.7`}
                          transform="rotate(-90 60 60)"
                          style={{
                            transition: 'stroke 0.8s ease, stroke-dasharray 1.2s ease-out',
                          }}
                        />
                      </svg>
                      <div className="aqi-value-center">
                        <span className="aqi-number">
                          {aqiData.pm25 != null ? aqiData.pm25.toFixed(1) : '—'}
                        </span>
                        <span className={`aqi-status-label aqi-status-label--${aqiTier}`}>
                          {aqiData.emoji} {aqiData.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flood-risk-pill" data-level="HIGH">
                    <span className="flood-risk-pill-label">Flood risk</span>
                    <span className="flood-risk-pill-value">HIGH</span>
                  </div>
                </div>

                <div className="pollutant-grid">
                  <div className="pollutant-cell">
                    <span className="pollutant-key">PM2.5</span>
                    <span className="pollutant-val">
                      {aqiData.pm25 != null ? `${aqiData.pm25.toFixed(1)} µg/m³` : '—'}
                    </span>
                  </div>
                  <div className="pollutant-cell">
                    <span className="pollutant-key">PM10</span>
                    <span className="pollutant-val">
                      {aqiData.pm10 != null ? `${aqiData.pm10.toFixed(1)} µg/m³` : '—'}
                    </span>
                  </div>
                </div>
                <p className="aqi-updated">
                  {aqiData.lastUpdated
                    ? `Updated ${aqiData.lastUpdated} (Dhaka)`
                    : aqiData.label === 'Data unavailable'
                      ? 'Live air quality data could not be loaded. Try again later.'
                      : '…'}
                </p>
              </>
            )}
            <Link to="/flood-map" className="btn btn-primary mission-cta">
              🗺️ Open flood map
            </Link>
          </motion.article>

          <motion.article
            className="mission-card glass-card mission-card--lift"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45 }}
          >
            <div className="mission-card-header">
              <span className="mission-icon" aria-hidden="true">
                🏥
              </span>
              <div className="mission-title-row">
                <h2 className="mission-card-title">HealthNet</h2>
                <span className="mission-status-dot" title="Operational" aria-hidden />
              </div>
            </div>
            <p className="mission-stat-highlight">156 hospitals networked</p>
            <p className="mission-blurb">
              Coordinated bed availability and referral paths across divisions.
            </p>
            <Link to="/health" className="btn btn-teal mission-cta">
              🏥 Health services
            </Link>
          </motion.article>

          <motion.article
            className="mission-card glass-card mission-card--lift"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
          >
            <div className="mission-card-header">
              <span className="mission-icon" aria-hidden="true">
                🏙️
              </span>
              <div className="mission-title-row">
                <h2 className="mission-card-title">SmartCity</h2>
                <span className="mission-status-dot" title="Operational" aria-hidden />
              </div>
            </div>
            <p className="mission-stat-highlight">247 reports today</p>
            <p className="mission-blurb">
              Citizen issues triaged to city operations and response teams.
            </p>
            <Link to="/report" className="btn btn-outline mission-cta">
              📋 Submit a report
            </Link>
          </motion.article>
        </section>

        <motion.section
          className="quick-actions-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          aria-label="Quick actions"
        >
          <h2 className="section-heading">Quick Actions</h2>
          <div className="quick-actions-grid">
            <button
              type="button"
              className="quick-action"
              aria-label="Open flood map"
              onClick={() => navigate('/flood-map')}
            >
              <span className="action-icon" aria-hidden>
                🗺️
              </span>
              <span>View Flood Map</span>
            </button>
            <button
              type="button"
              className="quick-action"
              onClick={() => navigate('/health')}
            >
              <span className="action-icon" aria-hidden>
                🏥
              </span>
              <span>Find Hospital</span>
            </button>
            <button
              type="button"
              className="quick-action"
              aria-label="Submit a report"
              onClick={() => navigate('/report')}
            >
              <span className="action-icon" aria-hidden>
                📋
              </span>
              <span>Report Issue</span>
            </button>
            <button
              type="button"
              className="quick-action quick-action--sos"
              aria-label="Call emergency SOS 999"
              onClick={handleQuickSos}
            >
              <span className="action-icon" aria-hidden>
                🆘
              </span>
              <span>Emergency SOS</span>
            </button>
          </div>
        </motion.section>

        <motion.section
          className="recent-alerts"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          aria-label="Recent alerts"
        >
          <h2 className="section-heading">Recent Alerts</h2>
          <ul className="recent-alerts-list">
            {MOCK_ALERTS.map((alert) => (
              <li key={alert.id} className="recent-alert-item glass-card">
                <div className="recent-alert-meta">
                  <span className={`alert-type-badge ${alert.typeClass}`}>{alert.type}</span>
                  <span className="recent-alert-time">
                    {alert.time} · {alert.date}
                  </span>
                </div>
                <p className="recent-alert-desc">{alert.description}</p>
              </li>
            ))}
          </ul>
        </motion.section>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
