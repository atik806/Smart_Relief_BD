let isAlarmPlaying = false;

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

export const sendEmergencySMS = async (contacts, message = 'Emergency! I need help. My location:') => {
  if (!contacts || contacts.length === 0) return false;

  try {
    const location = await getCurrentLocation();
    const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    const fullMessage = `${message} ${mapsLink}`;
    const encoded = encodeURIComponent(fullMessage);
    
    for (const contact of contacts) {
      const cleanNumber = contact.replace(/\D/g, '');
      window.location.href = `sms:${cleanNumber}?body=${encoded}`;
    }
    return true;
  } catch (err) {
    console.error('SMS error:', err);
    return false;
  }
};

export const playAlarm = async () => {
  if (isAlarmPlaying) return;
  isAlarmPlaying = true;

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const createTone = (freq, startTime, duration) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.setValueAtTime(0, startTime + duration * 0.5);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    const pattern = [800, 600, 800, 600, 800, 600, 800, 1000, 600, 1000, 600, 1000];
    
    pattern.forEach((freq, i) => {
      createTone(freq, now + i * 0.25, 0.25);
    });

    isAlarmPlaying = false;
  } catch (err) {
    isAlarmPlaying = false;
    console.error('Alarm error:', err);
  }
};

export const stopAlarm = () => {
  isAlarmPlaying = false;
};