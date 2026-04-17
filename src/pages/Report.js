import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Report.css';

const Report = () => {
  const [formData, setFormData] = useState({
    issueType: '',
    location: '',
    description: '',
    photo: null
  });

  const recentReports = [
    {
      id: 1,
      type: 'Road Damage',
      location: 'Gulshan, Dhaka',
      description: 'Large pothole on main road causing traffic',
      status: 'In Progress',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'Waterlogging',
      location: 'Mirpur, Dhaka',
      description: 'Severe water accumulation after heavy rain',
      status: 'Pending',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'Power Outage',
      location: 'Uttara, Dhaka',
      description: 'No electricity for 6 hours in sector 10',
      status: 'Resolved',
      time: '1 day ago'
    },
    {
      id: 4,
      type: 'Medical Emergency',
      location: 'Bangabandhu Sheikh Mujib Medical University',
      description: 'Need ambulance at emergency entrance',
      status: 'Resolved',
      time: '2 days ago'
    }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'badge-warning',
      'In Progress': 'badge-info',
      'Resolved': 'badge-success'
    };
    return badges[status] || 'badge-warning';
  };

  const getStatusIcon = (type) => {
    const icons = {
      'Road Damage': '🚧',
      'Waterlogging': '🌧️',
      'Power Outage': '⚡',
      'Medical Emergency': '🏥',
      'Other': '📋'
    };
    return icons[type] || '📋';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Report submitted successfully! We will review it shortly.');
    setFormData({
      issueType: '',
      location: '',
      description: '',
      photo: null
    });
  };

  return (
    <div className="report-page">
      <div className="container">
        <motion.div 
          className="report-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>📱 Report an Issue</h1>
          <p>Help improve your city by reporting civic issues</p>
        </motion.div>

        <div className="report-content">
          <motion.div 
            className="report-form-section glass-card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Submit a Report</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Issue Type</label>
                <select 
                  value={formData.issueType}
                  onChange={(e) => setFormData({...formData, issueType: e.target.value})}
                  required
                >
                  <option value="">Select issue type</option>
                  <option value="road-damage">Road Damage</option>
                  <option value="waterlogging">Waterlogging</option>
                  <option value="power-outage">Power Outage</option>
                  <option value="medical-emergency">Medical Emergency</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                <div className="location-input-group">
                  <button type="button" className="pin-btn">
                    📍
                  </button>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Enter location or click pin to select on map"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the issue in detail..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Photo (Optional)</label>
                <div className="photo-upload">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, photo: e.target.files[0]})}
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="upload-label">
                    <span className="upload-icon">📷</span>
                    <span>{formData.photo ? formData.photo.name : 'Click to upload photo'}</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary submit-btn">
                <span>📨</span> Report to City Authority
              </button>
            </form>
          </motion.div>

          <motion.div 
            className="recent-reports-section"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="section-header">
              <h2>Recent Reports</h2>
              <span className="report-count">{recentReports.length} reports</span>
            </div>

            <div className="reports-list">
              {recentReports.map((report, index) => (
                <motion.div 
                  key={report.id}
                  className="report-card glass-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="report-card-header">
                    <div className="report-type-icon">
                      {getStatusIcon(report.type)}
                    </div>
                    <div className="report-type-info">
                      <span className="report-type">{report.type}</span>
                      <span className="report-location">📍 {report.location}</span>
                    </div>
                    <span className={`badge ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="report-description">{report.description}</p>
                  <span className="report-time">{report.time}</span>
                </motion.div>
              ))}
            </div>

            <button className="view-all-btn">
              View All Reports →
            </button>
          </motion.div>
        </div>

        <motion.div 
          className="report-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="stat-item">
            <span className="stat-icon">📊</span>
            <span className="stat-text">This month: <strong>234 issues</strong> reported</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span className="stat-text">Resolved: <strong>189 issues</strong> (81%)</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <span className="stat-text">Avg. Response: <strong>4.2 hours</strong></span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Report;