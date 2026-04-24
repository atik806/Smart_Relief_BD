import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { getHealthAdvice } from '../utils/healthAI';
import './Health.css';

const SYMPTOM_CHIPS = [
  'Fever',
  'Diarrhea',
  'Vomiting',
  'Skin rash',
  'Difficulty breathing',
  'Chest pain',
  'Waterborne illness',
  'Injury',
  'Snake bite',
  'Drowning',
];

const DURATION_OPTIONS = [
  { value: '', label: 'How long?' },
  { value: 'lt24', label: 'Less than 24 hours' },
  { value: 'd1_3', label: '1–3 days' },
  { value: 'gt3', label: 'More than 3 days' },
  { value: 'unsure', label: 'Not sure' },
];

const AGE_OPTIONS = [
  { value: '', label: 'Age range' },
  { value: 'u5', label: 'Under 5' },
  { value: '5_17', label: '5–17' },
  { value: '18_39', label: '18–39' },
  { value: '40_64', label: '40–64' },
  { value: '65p', label: '65+' },
];

const QUICK_SERVICES = [
  {
    key: 'amb',
    emoji: '🚑',
    label: 'Ambulance (199)',
    href: 'tel:199',
    telLabel: 'Call ambulance emergency line 199',
  },
  {
    key: 'med',
    emoji: '💊',
    label: 'Medicine Info',
    href: 'https://www.dgda.gov.bd/',
    external: true,
    linkLabel: 'Medicine information on DGDA website (opens in new tab)',
  },
  { key: 'hosp', emoji: '🏥', label: 'Nearest Hospital', to: '/flood-map' },
  {
    key: 'blood',
    emoji: '🩸',
    label: 'Blood Bank',
    href: 'https://dghs.gov.bd/',
    external: true,
    linkLabel: 'DGHS government health site (opens in new tab)',
  },
];

function TypingDots() {
  return (
    <div className="typing-indicator" aria-hidden>
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

const Health = () => {
  const showToast = useToast();
  const [description, setDescription] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [duration, setDuration] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [formError, setFormError] = useState('');

  const [hasSubmitted, setHasSubmitted] = useState(false);
  /** idle | typing (API in flight) | streaming (typewriter) | ready */
  const [phase, setPhase] = useState('idle');
  const [advice, setAdvice] = useState(null);
  const [streamIndex, setStreamIndex] = useState(0);
  const [lang, setLang] = useState('en');
  const [adviceBusy, setAdviceBusy] = useState(false);

  const fullText = advice ? (lang === 'bn' ? advice.bn : advice.en) : '';
  const displayText =
    phase === 'streaming' ? fullText.slice(0, streamIndex) : fullText;

  useEffect(() => {
    if (phase !== 'streaming' || !advice) return undefined;
    const text = lang === 'bn' ? advice.bn : advice.en;
    if (streamIndex >= text.length) {
      setPhase('ready');
      return undefined;
    }
    const id = window.setTimeout(() => {
      setStreamIndex((i) => Math.min(i + 3, text.length));
    }, 14);
    return () => window.clearTimeout(id);
  }, [phase, streamIndex, advice, lang]);

  useEffect(() => {
    if (phase === 'streaming') setStreamIndex(0);
  }, [lang, phase]);

  const toggleSymptom = (s) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleGetAdvice = async () => {
    if (!description.trim() && symptoms.length === 0) {
      setFormError('Select at least one symptom or describe how you feel.');
      showToast('Add symptoms or a short description.', 'warning');
      return;
    }
    setFormError('');
    setHasSubmitted(true);
    setAdvice(null);
    setStreamIndex(0);
    setPhase('typing');
    setAdviceBusy(true);
    try {
      const next = await getHealthAdvice({
        symptoms,
        duration,
        age: ageRange,
        description,
      });
      setAdvice(next);
      setStreamIndex(0);
      setPhase('streaming');
      if (next.source === 'fallback' && process.env.REACT_APP_ANTHROPIC_API_KEY) {
        showToast('Using offline guidance — AI unavailable.', 'warning');
      }
    } finally {
      setAdviceBusy(false);
    }
  };

  const severityLabel = advice?.severity ?? 'Low';
  const severityClass = severityLabel.toLowerCase();

  const actionHint =
    advice?.action && lang === 'en'
      ? {
          rest: 'Suggested step: rest and monitor at home.',
          clinic: 'Suggested step: visit a clinic or physician.',
          emergency: 'Suggested step: use emergency services.',
        }[advice.action]
      : advice?.action && lang === 'bn'
        ? {
            rest: 'পরামর্শ: বাড়িতে বিশ্রাম ও পর্যবেক্ষণ।',
            clinic: 'পরামর্শ: ক্লিনিক বা ডাক্তারের কাছে যান।',
            emergency: 'পরামর্শ: জরুরি সেবা ব্যবহার করুন।',
          }[advice.action]
        : null;

  return (
    <PageTransition>
      <div className="health-page">
        <div className="container">
        <motion.header
          className="health-hero"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="health-hero-top">
            <div className="health-hero-text">
              <h1 className="health-hero-title">HealthNet Emergency Services</h1>
              <p className="health-hero-tagline">
                Triage guidance for flood‑affected areas — fast, bilingual, and
                built for emergencies.
              </p>
            </div>
            <span className="health-status-badge" role="status">
              <span className="health-status-dot" aria-hidden />
              Service online
            </span>
          </div>
        </motion.header>

        <div className="health-content">
          <motion.section
            className="health-form-section glass-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <h2 className="health-section-title">Symptom check</h2>

            <div className="health-form-stack">
              <div className="form-group">
                <label htmlFor="health-symptoms-desc">Your symptoms</label>
                <textarea
                  id="health-symptoms-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your symptoms..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <span className="form-label-static">Quick symptoms</span>
                <div className="symptoms-grid" role="group" aria-label="Quick symptoms">
                  {SYMPTOM_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className={`symptom-chip ${symptoms.includes(chip) ? 'selected' : ''}`}
                      onClick={() => toggleSymptom(chip)}
                      aria-pressed={symptoms.includes(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="health-duration">Duration</label>
                  <select
                    id="health-duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    {DURATION_OPTIONS.map((o) => (
                      <option key={o.value || 'placeholder'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="health-age">Age range</label>
                  <select
                    id="health-age"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                  >
                    {AGE_OPTIONS.map((o) => (
                      <option key={o.value || 'placeholder'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formError ? (
                <p className="health-form-error" role="alert">
                  {formError}
                </p>
              ) : null}

              <button
                type="button"
                className={`btn btn-primary health-advice-btn ${adviceBusy ? 'is-loading' : ''}`}
                onClick={handleGetAdvice}
                disabled={adviceBusy}
              >
                {adviceBusy ? <Spinner size={20} /> : null}
                Get AI Health Advice
              </button>
            </div>
          </motion.section>

          <motion.section
            className="health-result-section glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
          >
            <div className="result-header">
              <h2 className="health-section-title">AI response</h2>
              <div className="lang-toggle-group" role="group" aria-label="Language">
                <button
                  type="button"
                  className={`lang-toggle ${lang === 'en' ? 'active' : ''}`}
                  onClick={() => setLang('en')}
                >
                  English
                </button>
                <button
                  type="button"
                  className={`lang-toggle ${lang === 'bn' ? 'active' : ''}`}
                  onClick={() => setLang('bn')}
                >
                  বাংলা
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!hasSubmitted ? (
                <motion.div
                  key="empty"
                  className="health-ai-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="health-ai-empty-icon" aria-hidden>
                    ✚
                  </span>
                  <p>
                    Add symptoms or a short description, then run the assistant.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="panel"
                  className="health-ai-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {phase === 'typing' ? (
                    <motion.div
                      className="health-typing-wrap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="health-typing-label">HealthNet is thinking</p>
                      <TypingDots />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="health-advice-body"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.35 }}
                    >
                      <div
                        className="response-bubble"
                        {...(phase === 'streaming' ? { 'aria-live': 'polite' } : {})}
                      >
                        <p className="health-advice-text">
                          {displayText}
                          {phase === 'streaming' ? (
                            <span className="health-stream-cursor" aria-hidden />
                          ) : null}
                        </p>
                      </div>

                      {phase === 'ready' ? (
                        <>
                          <div className={`severity-badge ${severityClass}`}>
                            <span className="severity-label">Severity</span>
                            <span className="severity-value">{severityLabel}</span>
                          </div>

                          {actionHint ? (
                            <p className="health-action-hint">{actionHint}</p>
                          ) : null}

                          {advice?.severity === 'High' ? (
                            <div className="seek-care-cta">
                              <p className="seek-care-title">
                                {lang === 'bn'
                                  ? 'অবিলম্বে চিকিৎসা নিন'
                                  : 'Seek immediate care'}
                              </p>
                              <p className="seek-care-sub">
                                {lang === 'bn'
                                  ? 'অপেক্ষা করবেন না — জরুরি সেবা বা নিকটতম ইমার্জেন্সি বিভাগে যান।'
                                  : 'Do not wait — use emergency services or the nearest ER.'}
                              </p>
                              <div className="seek-care-actions">
                                <a
                              href="tel:999"
                              className="btn btn-primary seek-care-btn"
                              aria-label="Call emergency number 999"
                            >
                                  {lang === 'bn' ? '৯৯৯-এ কল' : 'Call 999'}
                                </a>
                                <Link
                                  to="/flood-map"
                                  className="btn btn-ghost seek-care-btn-secondary"
                                >
                                  {lang === 'bn'
                                    ? 'হাসপাতালের মানচিত্র'
                                    : 'Nearest hospital map'}
                                </Link>
                              </div>
                            </div>
                          ) : null}
                        </>
                      ) : null}

                      <p className="health-disclaimer">
                        {lang === 'bn'
                          ? 'এটি কেবল সাধারণ তথ্য; নির্ণয় বা চিকিৎসার বিকল্প নয়। সন্দেহ থাকলে সরাসরি যোগাযোগ করুন।'
                          : 'This assistant shares general information only. It is not a substitute for professional diagnosis or treatment. When in doubt, contact a clinician.'}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </div>

        <motion.div
          className="quick-health-links"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          <h3 className="quick-services-heading">Quick services</h3>
          <div className="health-links-grid">
            {QUICK_SERVICES.map((svc) => {
              if (svc.to) {
                return (
                  <Link key={svc.key} to={svc.to} className="health-service-card">
                    <span className="link-icon" aria-hidden>
                      {svc.emoji}
                    </span>
                    <span className="link-label">{svc.label}</span>
                  </Link>
                );
              }
              return (
                <a
                  key={svc.key}
                  href={svc.href}
                  className="health-service-card"
                  {...(svc.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  {...(svc.telLabel ? { 'aria-label': svc.telLabel } : {})}
                  {...(svc.linkLabel ? { 'aria-label': svc.linkLabel } : {})}
                >
                  <span className="link-icon" aria-hidden>
                    {svc.emoji}
                  </span>
                  <span className="link-label">{svc.label}</span>
                </a>
              );
            })}
          </div>
        </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Health;
