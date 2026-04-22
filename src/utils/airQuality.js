const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

const AQI_BREAKPOINTS = [
  { pmLo: 0.0, pmHi: 12.0, aqiLo: 0, aqiHi: 50 },
  { pmLo: 12.1, pmHi: 35.4, aqiLo: 51, aqiHi: 100 },
  { pmLo: 35.5, pmHi: 55.4, aqiLo: 101, aqiHi: 150 },
  { pmLo: 55.5, pmHi: 150.4, aqiLo: 151, aqiHi: 200 },
  { pmLo: 150.5, pmHi: 250.4, aqiLo: 201, aqiHi: 300 },
  { pmLo: 250.5, pmHi: 350.4, aqiLo: 301, aqiHi: 400 },
  { pmLo: 350.5, pmHi: 500.4, aqiLo: 401, aqiHi: 500 },
];

const pm25ToAqi = (pm) => {
  if (pm === null) return null;
  for (const bp of AQI_BREAKPOINTS) {
    if (pm >= bp.pmLo && pm <= bp.pmHi) {
      return Math.round(((bp.aqiHi - bp.aqiLo) / (bp.pmHi - bp.pmLo)) * (pm - bp.pmLo) + bp.aqiLo);
    }
  }
  return null;
};

const getAqiStatus = (aqi) => {
  if (aqi === null) return 'Unknown';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

const smoothPM25 = (data, window = 6) => {
  if (!data || data.length === 0) return [];
  const smoothed = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    smoothed.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return smoothed;
};

const weightedAveragePM25 = (data, window = 6) => {
  if (!data || data.length === 0) return [];
  const weights = [0.4, 0.3, 0.2, 0.1, 0.05, 0.05];
  const weighted = [];
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    const relevantWeights = weights.slice(weights.length - slice.length);
    const totalWeight = relevantWeights.reduce((a, b) => a + b, 0);
    const weightedSum = slice.reduce((acc, val, idx) => acc + val * relevantWeights[relevantWeights.length - 1 - idx], 0);
    weighted.push(weightedSum / totalWeight);
  }
  return weighted;
};

export const fetchAirQuality = async (latitude = 23.8103, longitude = 90.4125) => {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      hourly: 'pm10,pm2_5',
      forecast_days: '3',
      timezone: 'Asia/Dhaka'
    });

    const response = await fetch(`${AIR_QUALITY_API_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    const hourlyData = data.hourly;
    const pm25Values = hourlyData.pm2_5.map(v => v === null ? 0 : v);
    const pm10Values = hourlyData.pm10.map(v => v === null ? 0 : v);
    
    const times = hourlyData.time.map(t => {
      const date = new Date(t);
      return date.toLocaleString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' });
    });
    
    const pm25Smooth = smoothPM25(pm25Values, 6);
    const pm25Weighted = weightedAveragePM25(pm25Smooth, 6);
    
    const avgPm25 = pm25Weighted.reduce((a, b) => a + b, 0) / pm25Weighted.length;
    const peakPm25 = Math.max(...pm25Values);
    
    const finalPm25 = (0.7 * avgPm25) + (0.3 * peakPm25);
    const aqi = pm25ToAqi(finalPm25);
    const status = getAqiStatus(aqi);
    
    return {
      aqi,
      status,
      pm25: {
        current: pm25Values[pm25Values.length - 1],
        avg: avgPm25,
        peak: peakPm25,
        final: finalPm25
      },
      pm10: {
        current: pm10Values[pm10Values.length - 1]
      },
      history: times.map((time, i) => ({
        time,
        pm25: pm25Values[i],
        pm10: pm10Values[i]
      })),
      lastUpdated: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' })
    };
  } catch (error) {
    console.error('Failed to fetch air quality data:', error);
    return null;
  }
};

export { pm25ToAqi, getAqiStatus };