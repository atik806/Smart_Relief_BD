import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCurrentLocation,
  sendEmergencySMS,
  playAlarm,
  stopAlarm,
} from '../utils/sosFeatures';
import './SOSButton.css';

function useFinePointerHover() {
  const [fineHover, setFineHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const apply = () => setFineHover(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return fineHover;
}

const SOSButton = () => {
  const rootRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [alarmOn, setAlarmOn] = useState(false);
  const [shareError, setShareError] = useState(null);
  const finePointerHover = useFinePointerHover();

  useEffect(() => {
    const onPointerDown = (e) => {
      if (!expanded) return;
      const el = rootRef.current;
      if (el && !el.contains(e.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [expanded]);

  useEffect(
    () => () => {
      stopAlarm();
    },
    []
  );

  const handleMainClick = () => {
    if (!finePointerHover) {
      setExpanded((v) => !v);
    }
  };

  const handleShareLocation = async () => {
    setShareError(null);
    try {
      const { lat, lon } = await getCurrentLocation();
      sendEmergencySMS(lat, lon);
    } catch {
      setShareError('Could not get location. Allow access and try again.');
      window.setTimeout(() => setShareError(null), 4000);
    }
  };

  const handleAlarm = async () => {
    if (alarmOn) {
      stopAlarm();
      setAlarmOn(false);
      return;
    }
    try {
      await playAlarm();
      setAlarmOn(true);
    } catch {
      setShareError('Could not play alarm.');
      window.setTimeout(() => setShareError(null), 3000);
    }
  };

  const onContainerEnter = useCallback(() => {
    if (finePointerHover) setExpanded(true);
  }, [finePointerHover]);

  const onContainerLeave = useCallback(() => {
    if (finePointerHover) setExpanded(false);
  }, [finePointerHover]);

  return (
    <div
      ref={rootRef}
      className="sos-root"
      onMouseEnter={onContainerEnter}
      onMouseLeave={onContainerLeave}
    >
      <AnimatePresence>
        {expanded ? (
          <motion.div
            className="sos-panel"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            style={{ transformOrigin: 'bottom right' }}
            role="dialog"
            aria-label="Emergency options"
          >
            <p className="sos-panel-header">EMERGENCY</p>
            {shareError ? (
              <p className="sos-panel-error" role="alert">
                {shareError}
              </p>
            ) : null}
            <div className="sos-panel-actions">
              <a
                href="tel:999"
                className="sos-panel-btn"
                aria-label="Call emergency police, 999"
              >
                <span aria-hidden>📞</span>
                <span>Call 999 (Police)</span>
              </a>
              <a
                href="tel:199"
                className="sos-panel-btn"
                aria-label="Call fire and rescue, 199"
              >
                <span aria-hidden>🚒</span>
                <span>Call 199 (Fire)</span>
              </a>
              <a
                href="tel:16555"
                className="sos-panel-btn"
                aria-label="Call flood helpline, 16555"
              >
                <span aria-hidden>🌊</span>
                <span>Call 16555 (Flood)</span>
              </a>
              <button
                type="button"
                className="sos-panel-btn"
                aria-label="Share my location for emergency SMS"
                onClick={() => handleShareLocation()}
              >
                <span aria-hidden>📍</span>
                <span>Share Location</span>
              </button>
              <button
                type="button"
                className={`sos-panel-btn sos-panel-btn--alarm ${alarmOn ? 'is-active' : ''}`}
                aria-label={alarmOn ? 'Stop emergency alarm sound' : 'Play emergency alarm sound'}
                onClick={() => handleAlarm()}
              >
                <span aria-hidden>🔊</span>
                <span>{alarmOn ? 'Stop Alarm' : 'Play Alarm'}</span>
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        className={`sos-fab ${alarmOn ? 'sos-fab--alarm' : ''}`}
        aria-expanded={expanded}
        aria-haspopup="dialog"
        aria-label="Emergency SOS: open menu for 999, location share, and alarm"
        onClick={handleMainClick}
      >
        <span className="sos-fab-ring" aria-hidden />
        <span className="sos-fab-label">SOS</span>
      </button>
    </div>
  );
};

export default SOSButton;
