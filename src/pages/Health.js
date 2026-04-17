import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Health.css';

const Health = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    description: '',
    symptoms: []
  });
  const [showResult, setShowResult] = useState(false);
  const [isBangla, setIsBangla] = useState(false);

  const commonSymptoms = [
    'Fever', 'Headache', 'Chest Pain', 'Breathing Difficulty', 
    'Nausea', 'Fatigue', 'Cough', 'Body Aches'
  ];

  const toggleSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowResult(true);
  };

  const mockAIResponse = {
    analysis: isBangla 
      ? 'আপনার লক্ষণগুলি বিশ্লেষণ করে, আমি কিছু উদ্বেগজনক প্যাটার্ন দেখতে পাচ্ছি। বুকে ব্যথা এবং শ্বাসকষ্ট একসাথে হওয়ায় তাৎক্ষণিক চিকিৎসা প্রয়োজন।'
      : 'Based on your symptoms analysis, I notice some concerning patterns. The combination of chest pain and breathing difficulty requires immediate medical attention.',
    severity: 'HIGH',
    action: isBangla ? 'নিকটতম হাসপাতালে যান' : 'Visit nearest hospital immediately',
    recommendation: isBangla 
      ? 'অবিলম্বে 999 নম্বরে কল করুন এবং বুকে ব্যয়ের বিষয়টি জানান।'
      : 'Call 999 immediately and inform about chest pain and breathing difficulty.',
    hospital: 'Bangabandhu Sheikh Mujib Medical University',
    distance: '2.3 km'
  };

  return (
    <div className="health-page">
      <div className="container">
        <motion.div 
          className="health-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>🏥 AI Health Assistant</h1>
          <p>Get instant health guidance and find nearest medical facilities</p>
        </motion.div>

        <div className="health-content">
          <motion.div 
            className="health-form-section glass-card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Check Your Symptoms</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="Enter your age"
                    min="1"
                    max="150"
                  />
                </div>
                
                <div className="form-group">
                  <label>Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Describe your symptoms</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe how you're feeling..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Common Symptoms</label>
                <div className="symptoms-grid">
                  {commonSymptoms.map(symptom => (
                    <button
                      key={symptom}
                      type="button"
                      className={`symptom-chip ${formData.symptoms.includes(symptom) ? 'selected' : ''}`}
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-teal analyze-btn">
                <span>🤖</span> Analyze with AI →
              </button>
            </form>
          </motion.div>

          <motion.div 
            className="health-result-section glass-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="result-header">
              <h2>AI Response</h2>
              <button 
                className={`lang-toggle ${isBangla ? 'active' : ''}`}
                onClick={() => setIsBangla(!isBangla)}
              >
                {isBangla ? '🇧🇩 বাংলা' : '🇺🇸 English'}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {showResult ? (
                <motion.div 
                  className="ai-response"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="response-bubble">
                    <p>{mockAIResponse.analysis}</p>
                  </div>

                  <div className={`severity-badge ${mockAIResponse.severity.toLowerCase()}`}>
                    <span className="severity-label">Severity:</span>
                    <span className="severity-value">{mockAIResponse.severity}</span>
                  </div>

                  <div className="recommended-action">
                    <h4>{isBangla ? 'প্রস্তাবিত পদক্ষেপ:' : 'Recommended Action:'}</h4>
                    <p className="action-text">{mockAIResponse.action}</p>
                    <p className="recommendation">{mockAIResponse.recommendation}</p>
                  </div>

                  <div className="nearest-hospital">
                    <div className="hospital-icon">🏥</div>
                    <div className="hospital-info">
                      <span className="hospital-label">Nearest Hospital</span>
                      <span className="hospital-name">{mockAIResponse.hospital}</span>
                      <span className="hospital-distance">{mockAIResponse.distance}</span>
                    </div>
                    <a href="tel:999" className="btn btn-primary call-btn">
                      📞 Call
                    </a>
                  </div>

                  <div className="emergency-note">
                    <span className="warning-icon">⚠️</span>
                    <span>This is an AI-generated assessment. Please consult a healthcare professional for accurate diagnosis.</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="empty-icon">🤖</span>
                  <p>{isBangla ? 'আপনার লক্ষণ বিশ্লেষণ করতে ফর্ম পূরণ করুন' : 'Fill in the form to analyze your symptoms'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div 
          className="quick-health-links"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Quick Health Services</h3>
          <div className="health-links-grid">
            <button type="button" className="health-link-card">
              <span className="link-icon">🧠</span>
              <span className="link-label">Mental Health Chatbot</span>
            </button>
            <button type="button" className="health-link-card">
              <span className="link-icon">💊</span>
              <span className="link-label">Medicine Delivery</span>
            </button>
            <button type="button" className="health-link-card">
              <span className="link-icon">🚑</span>
              <span className="link-label">Ambulance Service</span>
            </button>
            <button type="button" className="health-link-card">
              <span className="link-icon">📋</span>
              <span className="link-label">Health Records</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Health;