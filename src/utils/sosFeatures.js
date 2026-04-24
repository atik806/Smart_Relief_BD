/**
 * SOS: geolocation, flood SMS shortcode, Web Audio alarm.
 */

let audioContext = null;
let oscillator = null;
let gainNode = null;

export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });

/**
 * Opens SMS to 16555 with emergency coordinates.
 * @param {number} lat
 * @param {number} lon
 */
export const sendEmergencySMS = (lat, lon) => {
  const body = encodeURIComponent(`EMERGENCY ${lat},${lon}`);
  window.location.href = `sms:16555?body=${body}`;
};

export const playAlarm = async () => {
  if (oscillator) return;

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  oscillator = audioContext.createOscillator();
  gainNode = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 880;
  gainNode.gain.value = 0.2;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start(0);
};

export const stopAlarm = () => {
  try {
    if (oscillator) {
      oscillator.stop(0);
      oscillator.disconnect();
      oscillator = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  } catch {
    oscillator = null;
    gainNode = null;
    audioContext = null;
  }
};
