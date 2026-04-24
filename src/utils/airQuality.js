const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/**
 * Pick hourly index closest to now (Asia/Dhaka-aligned timestamps from API).
 */
function indexClosestToNow(timeStrings) {
  if (!timeStrings?.length) return 0;
  const now = Date.now();
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < timeStrings.length; i += 1) {
    const t = new Date(timeStrings[i]).getTime();
    if (Number.isNaN(t)) continue;
    const diff = Math.abs(now - t);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{ pm25: number, pm10: number, lastUpdated: string } | null>}
 */
export async function fetchAirQuality(lat = 23.685, lon = 90.356) {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      hourly: 'pm10,pm2_5',
      timezone: 'Asia/Dhaka',
    });
    const response = await fetch(`${AIR_QUALITY_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`Air quality API error: ${response.status}`);
    }
    const data = await response.json();
    const hourly = data.hourly;
    if (!hourly?.time || !hourly?.pm2_5 || !hourly?.pm10) {
      throw new Error('Unexpected API shape');
    }
    const idx = indexClosestToNow(hourly.time);
    const pm25 = hourly.pm2_5[idx];
    const pm10 = hourly.pm10[idx];
    if (pm25 == null || pm10 == null) {
      throw new Error('Missing PM values');
    }
    const lastUpdated = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return {
      pm25: Number(pm25),
      pm10: Number(pm10),
      lastUpdated,
    };
  } catch {
    return null;
  }
}

/**
 * WHO-oriented PM2.5 tiers (µg/m³).
 * @param {number|null|undefined} pm25
 * @returns {{ label: string, color: string, emoji: string }}
 */
export function getAQIStatus(pm25) {
  if (pm25 == null || Number.isNaN(pm25)) {
    return { label: 'Unknown', color: '#8892a6', emoji: '❔' };
  }
  if (pm25 <= 12) {
    return { label: 'Good', color: '#2dc653', emoji: '😊' };
  }
  if (pm25 <= 35) {
    return { label: 'Moderate', color: '#f4a261', emoji: '😐' };
  }
  if (pm25 <= 55) {
    return {
      label: 'Unhealthy for Sensitive',
      color: '#ff8c42',
      emoji: '😷',
    };
  }
  return { label: 'Unhealthy', color: '#e63946', emoji: '⚠️' };
}
