import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import './FloodMap.css';

const BangladeshBounds = [
  [20.5, 87.8],
  [26.7, 92.8]
];

const floodZones = [
  { id: 1, positions: [[24.5, 91.5], [24.8, 91.8], [24.7, 92.2], [24.3, 92.0]], name: 'Sylhet Region', risk: 'HIGH' },
  { id: 2, positions: [[24.8, 90.5], [25.0, 90.8], [24.9, 91.2], [24.6, 91.0]], name: 'Netrokona', risk: 'HIGH' },
  { id: 3, positions: [[24.2, 90.0], [24.5, 90.3], [24.4, 90.7], [24.1, 90.5]], name: 'Sunamganj', risk: 'MEDIUM' },
];

const disasterAlerts = [
  { id: 1, position: [24.9, 91.9], title: 'Flood Warning', description: 'Surma River water level rising' },
  { id: 2, position: [24.4, 91.8], title: 'Landslide Alert', description: 'Risk in hilly areas' },
  { id: 3, position: [23.8, 90.5], title: 'Waterlogging', description: 'Severe water accumulation' },
];

const hospitals = [
  { id: 1, position: [24.9, 91.8], name: 'Sylhet MAG Osmani Medical College' },
  { id: 2, position: [24.7, 91.4], name: 'Sylhet Women\'s Medical College' },
  { id: 3, position: [24.5, 90.6], name: 'Netrokona District Hospital' },
  { id: 4, position: [24.2, 90.3], name: 'Sunamganj District Hospital' },
];

const citizenReports = [
  { id: 1, position: [24.8, 91.5], type: 'Road Damage', status: 'Pending' },
  { id: 2, position: [24.6, 91.2], type: 'Waterlogging', status: 'In Progress' },
  { id: 3, position: [24.4, 90.8], type: 'Power Outage', status: 'Resolved' },
];

const FloodMap = () => {
  const [layers, setLayers] = useState({
    floodRisk: true,
    hospitals: true,
    reports: true,
    routes: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleLayer = (layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const getRiskColor = (risk) => {
    const colors = {
      HIGH: '#E63946',
      MEDIUM: '#F4A261',
      LOW: '#2EC4B6'
    };
    return colors[risk] || '#F4A261';
  };

  return (
    <div className="flood-map-page">
      <div className={`map-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
        
        {sidebarOpen && (
          <motion.div 
            className="sidebar-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2>Map Layers</h2>
            
            <div className="layer-toggles">
              <label className="layer-toggle">
                <input 
                  type="checkbox" 
                  checked={layers.floodRisk}
                  onChange={() => toggleLayer('floodRisk')}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-label">Flood Risk Zones</span>
              </label>
              
              <label className="layer-toggle">
                <input 
                  type="checkbox" 
                  checked={layers.hospitals}
                  onChange={() => toggleLayer('hospitals')}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-label">Hospitals</span>
              </label>
              
              <label className="layer-toggle">
                <input 
                  type="checkbox" 
                  checked={layers.reports}
                  onChange={() => toggleLayer('reports')}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-label">Citizen Reports</span>
              </label>
              
              <label className="layer-toggle">
                <input 
                  type="checkbox" 
                  checked={layers.routes}
                  onChange={() => toggleLayer('routes')}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-label">Emergency Routes</span>
              </label>
            </div>

            <div className="search-section">
              <h3>Search Area</h3>
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search area in Bangladesh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="legend-section">
              <h3>Legend</h3>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-color" style={{ background: 'rgba(230, 57, 70, 0.5)' }}></span>
                  <span>Flood Risk Zone</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon">🚨</span>
                  <span>Disaster Alert</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon">🏥</span>
                  <span>Hospital</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon">🟠</span>
                  <span>Citizen Report</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="map-container">
        <MapContainer 
          center={[24.5, 91.2]} 
          zoom={8} 
          bounds={BangladeshBounds}
          className="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {layers.floodRisk && floodZones.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.positions}
              pathOptions={{
                color: getRiskColor(zone.risk),
                fillColor: getRiskColor(zone.risk),
                fillOpacity: 0.3,
                weight: 2
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h4>{zone.name}</h4>
                  <span className={`risk-badge ${zone.risk.toLowerCase()}`}>
                    {zone.risk} Risk
                  </span>
                </div>
              </Popup>
            </Polygon>
          ))}

          {disasterAlerts.map((alert) => (
            <Marker key={alert.id} position={alert.position}>
              <Popup>
                <div className="popup-content alert-popup">
                  <h4>🚨 {alert.title}</h4>
                  <p>{alert.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {layers.hospitals && hospitals.map((hospital) => (
            <Marker key={hospital.id} position={hospital.position}>
              <Popup>
                <div className="popup-content hospital-popup">
                  <h4>🏥 {hospital.name}</h4>
                </div>
              </Popup>
            </Marker>
          ))}

          {layers.reports && citizenReports.map((report) => (
            <Marker key={report.id} position={report.position}>
              <Popup>
                <div className="popup-content report-popup">
                  <h4>🟠 {report.type}</h4>
                  <span className={`status-badge ${report.status.toLowerCase().replace(' ', '-')}`}>
                    {report.status}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        <div className="map-info-bar">
          <span>Showing: <strong>Sylhet, Sunamganj, Netrokona</strong></span>
          <span className="risk-indicator">
            Flood Risk: <strong style={{ color: '#E63946' }}>HIGH</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default FloodMap;