import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { leafletMarkerShadowUrl } from '../utils/leafletDefaultIcon';
import hospitalIconUrl from 'leaflet-color-markers/img/marker-icon-blue.png';
import hospitalIcon2xUrl from 'leaflet-color-markers/img/marker-icon-2x-blue.png';
import reportIconUrl from 'leaflet-color-markers/img/marker-icon-gold.png';
import reportIcon2xUrl from 'leaflet-color-markers/img/marker-icon-2x-gold.png';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import './FloodMap.css';

const BD_CENTER = [23.685, 90.356];
const BD_ZOOM = 7;

const hospitalIcon = new L.Icon({
  iconUrl: hospitalIconUrl,
  iconRetinaUrl: hospitalIcon2xUrl,
  shadowUrl: leafletMarkerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const reportIcon = new L.Icon({
  iconUrl: reportIconUrl,
  iconRetinaUrl: reportIcon2xUrl,
  shadowUrl: leafletMarkerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Approximate flood polygons — northeast Bangladesh */
const FLOOD_POLYGONS = [
  {
    id: 'sylhet',
    label: 'Severe Flooding',
    areaName: 'Sylhet division',
    positions: [
      [25.25, 90.95],
      [25.2, 92.35],
      [24.35, 92.55],
      [24.05, 91.85],
      [24.15, 91.05],
      [24.85, 90.75],
      [25.25, 90.95],
    ],
    color: '#e63946',
    fillOpacity: 0.4,
    status: 'Active — severe',
    updated: '45m ago',
  },
  {
    id: 'sunamganj',
    label: 'Moderate Flooding',
    areaName: 'Sunamganj',
    positions: [
      [25.08, 90.95],
      [25.02, 91.65],
      [24.52, 91.55],
      [24.58, 91.05],
      [25.08, 90.95],
    ],
    color: '#f4a261',
    fillOpacity: 0.35,
    status: 'Active — moderate',
    updated: '1h ago',
  },
  {
    id: 'netrokona',
    label: 'Watch Zone',
    areaName: 'Netrokona',
    positions: [
      [24.98, 90.25],
      [24.92, 91.05],
      [24.42, 90.95],
      [24.48, 90.18],
      [24.98, 90.25],
    ],
    color: '#f4d03f',
    fillOpacity: 0.32,
    status: 'Monitoring',
    updated: '2h ago',
  },
];

const HOSPITALS = [
  {
    id: 'dmch',
    name: 'Dhaka Medical',
    position: [23.7265, 90.3976],
    status: 'Operational',
    updated: '12m ago',
    phone: '029506760',
  },
  {
    id: 'cgh',
    name: 'Chittagong General',
    position: [22.359, 91.8208],
    status: 'High census',
    updated: '8m ago',
    phone: '031619400',
  },
  {
    id: 'osmani',
    name: 'Sylhet MAG Osmani',
    position: [24.9032, 91.8709],
    status: 'Flood surge ready',
    updated: '20m ago',
    phone: '0821716663',
  },
  {
    id: 'rmc',
    name: 'Rajshahi Medical',
    position: [24.3715, 88.6002],
    status: 'Operational',
    updated: '15m ago',
    phone: '0721777101',
  },
  {
    id: 'kmc',
    name: 'Khulna Medical',
    position: [22.8456, 89.5366],
    status: 'Operational',
    updated: '10m ago',
    phone: '041725556',
  },
];

const CITIZEN_REPORTS = [
  {
    id: 1,
    name: 'Report #SR-2401',
    position: [24.82, 91.42],
    type: 'Road submerged',
    detail: 'Village road to Zakiganj cut off; boats only.',
    status: 'Verified',
    updated: '2h ago',
  },
  {
    id: 2,
    name: 'Report #SR-2402',
    position: [24.58, 91.18],
    type: 'Shelter needed',
    detail: '~120 families need dry rations and tarpaulins.',
    status: 'In progress',
    updated: '4h ago',
  },
  {
    id: 3,
    name: 'Report #SR-2403',
    position: [24.95, 90.62],
    type: 'Embankment breach',
    detail: 'Minor breach reported; local admin notified.',
    status: 'Pending',
    updated: '5h ago',
  },
  {
    id: 4,
    name: 'Report #SR-2404',
    position: [23.78, 90.42],
    type: 'Waterlogging',
    detail: 'Old Dhaka lane — knee-deep water, pumps requested.',
    status: 'Assigned',
    updated: '6h ago',
  },
  {
    id: 5,
    name: 'Report #SR-2405',
    position: [22.32, 91.78],
    type: 'Landslide risk',
    detail: 'Hill cutting near informal settlement; flag for inspection.',
    status: 'Verified',
    updated: '8h ago',
  },
  {
    id: 6,
    name: 'Report #SR-2406',
    position: [24.38, 88.62],
    type: 'Heat / power',
    detail: 'Outage at ward 12; backup for vaccine cold chain.',
    status: 'Resolved',
    updated: '1d ago',
  },
];

const CARTO_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function mapsDirUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function statusClass(status) {
  return status
    .toLowerCase()
    .replace(/—/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function PopupActions({ phone, lat, lng, primary = 'Navigate', viewTo = '/' }) {
  const destLat = lat;
  const destLng = lng;
  return (
    <div className="popup-actions">
      {phone ? (
        <a
          className="popup-action-btn popup-action-call"
          href={`tel:${phone.replace(/\s/g, '')}`}
          aria-label={`Call ${phone}`}
        >
          Call
        </a>
      ) : null}
      <a
        className="popup-action-btn popup-action-nav"
        href={mapsDirUrl(destLat, destLng)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {primary}
      </a>
      <Link to={viewTo} className="popup-action-btn popup-action-view">
        View
      </Link>
    </div>
  );
}

function MapReady({ onReady }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
    return () => onReady(null);
  }, [map, onReady]);
  return null;
}

const FloodMap = () => {
  const showToast = useToast();
  const [layers, setLayers] = useState({
    floodZones: true,
    hospitals: true,
    reports: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [leafletMap, setLeafletMap] = useState(null);
  const [geoMessage, setGeoMessage] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)');
    const apply = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setMobileSheetOpen(false);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const setMapRef = useCallback((map) => {
    setLeafletMap(map);
  }, []);

  const toggleLayer = (layer) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const zoomToBangladesh = () => {
    leafletMap?.flyTo(BD_CENTER, BD_ZOOM, { duration: 1 });
  };

  const locateMe = () => {
    setGeoMessage(null);
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported.';
      setGeoMessage(msg);
      showToast(msg, 'error');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        leafletMap?.flyTo([latitude, longitude], 12, { duration: 1 });
        setGeoMessage(null);
        setGeoLoading(false);
      },
      () => {
        const msg = 'Could not get your location. Allow access and try again.';
        setGeoMessage(msg);
        showToast(msg, 'error');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const polygonCenter = (positions) => {
    let lat = 0;
    let lng = 0;
    const n = positions.length;
    for (let i = 0; i < n; i += 1) {
      lat += positions[i][0];
      lng += positions[i][1];
    }
    return [lat / n, lng / n];
  };

  const sidebarPanel = (
    <>
      <h2 className="map-sidebar-title">Map layers</h2>

      <div className="layer-checkboxes">
        <label className="layer-checkbox">
          <input
            type="checkbox"
            checked={layers.floodZones}
            onChange={() => toggleLayer('floodZones')}
          />
          <span>Flood Zones</span>
        </label>
        <label className="layer-checkbox">
          <input
            type="checkbox"
            checked={layers.hospitals}
            onChange={() => toggleLayer('hospitals')}
          />
          <span>Hospitals</span>
        </label>
        <label className="layer-checkbox">
          <input
            type="checkbox"
            checked={layers.reports}
            onChange={() => toggleLayer('reports')}
          />
          <span>Citizen Reports</span>
        </label>
      </div>

      <div className="map-stats-block">
        <h3 className="map-sidebar-subtitle">Stats</h3>
        <ul className="map-stats-list">
          <li>3 flood zones active</li>
          <li>5 hospitals</li>
          <li>6 reports</li>
        </ul>
      </div>

      <div className="search-section">
        <h3 className="map-sidebar-subtitle">Search area</h3>
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
        <h3 className="map-sidebar-subtitle">Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ background: 'rgba(230, 57, 70, 0.45)' }}
            />
            <span>Severe flooding</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ background: 'rgba(244, 162, 97, 0.45)' }}
            />
            <span>Moderate flooding</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-color"
              style={{ background: 'rgba(244, 208, 63, 0.45)' }}
            />
            <span>Watch zone</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🔵</span>
            <span>Hospital</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🟡</span>
            <span>Citizen report</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <PageTransition>
    <div className="flood-map-page">
      {/* Desktop: collapsible left sidebar */}
      {!isMobile && (
        <div className="map-sidebar-desktop-wrap">
          <motion.aside
            className="map-sidebar map-sidebar--desktop"
            initial={false}
            animate={{
              width: desktopSidebarOpen ? 300 : 0,
            }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <AnimatePresence initial={false}>
              {desktopSidebarOpen && (
                <motion.div
                  className="sidebar-inner"
                  key="sidebar-inner"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="sidebar-content">{sidebarPanel}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
          <motion.button
            type="button"
            className="sidebar-toggle sidebar-toggle--desktop"
            onClick={() => setDesktopSidebarOpen((v) => !v)}
            aria-expanded={desktopSidebarOpen}
            aria-label={desktopSidebarOpen ? 'Collapse map layers' : 'Expand map layers'}
            initial={false}
            animate={{ left: desktopSidebarOpen ? 278 : 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
          >
            {desktopSidebarOpen ? '◀' : '▶'}
          </motion.button>
        </div>
      )}

      {/* Mobile: scrim + bottom sheet */}
      <AnimatePresence>
        {isMobile && mobileSheetOpen && (
          <motion.button
            type="button"
            key="sheet-scrim"
            className="map-bottom-scrim"
            aria-label="Close layers panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileSheetOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobile && mobileSheetOpen && (
          <motion.div
            key="bottom-sheet"
            className="map-bottom-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Map layers"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="map-bottom-sheet-handle" aria-hidden />
            <button
              type="button"
              className="map-bottom-sheet-collapse"
              onClick={() => setMobileSheetOpen(false)}
              aria-label="Collapse layers"
            >
              ▼ Close
            </button>
            <div className="sidebar-content map-bottom-sheet-body">{sidebarPanel}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMobile && !mobileSheetOpen && (
        <motion.button
          type="button"
          className="mobile-layers-fab"
          onClick={() => setMobileSheetOpen(true)}
          aria-expanded={false}
          aria-label="Open map layers"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          Layers
        </motion.button>
      )}

      <div className="map-container">
        <MapContainer
          center={BD_CENTER}
          zoom={BD_ZOOM}
          className="leaflet-map"
          scrollWheelZoom
        >
          <MapReady onReady={setMapRef} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={CARTO_DARK}
            subdomains="abcd"
          />

          {layers.floodZones &&
            FLOOD_POLYGONS.map((zone) => {
              const [cLat, cLng] = polygonCenter(zone.positions);
              return (
                <Polygon
                  key={zone.id}
                  positions={zone.positions}
                  pathOptions={{
                    color: zone.color,
                    fillColor: zone.color,
                    fillOpacity: zone.fillOpacity,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="popup-content">
                      <h4>{zone.label}</h4>
                      <p className="popup-zone-name">{zone.areaName}</p>
                      <p className="popup-meta-row">
                        <span className="popup-meta-label">Status</span>
                        <span>{zone.status}</span>
                      </p>
                      <p className="popup-meta-row">
                        <span className="popup-meta-label">Last updated</span>
                        <span>{zone.updated}</span>
                      </p>
                      <PopupActions
                        phone="999"
                        lat={cLat}
                        lng={cLng}
                        primary="Navigate"
                        viewTo="/"
                      />
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

          {layers.hospitals &&
            HOSPITALS.map((h) => (
              <Marker key={h.id} position={h.position} icon={hospitalIcon}>
                <Popup>
                  <div className="popup-content hospital-popup">
                    <h4>{h.name}</h4>
                    <p className="popup-meta-row">
                      <span className="popup-meta-label">Status</span>
                      <span>{h.status}</span>
                    </p>
                    <p className="popup-meta-row">
                      <span className="popup-meta-label">Last updated</span>
                      <span>{h.updated}</span>
                    </p>
                    <PopupActions
                      phone={h.phone}
                      lat={h.position[0]}
                      lng={h.position[1]}
                      primary="Navigate"
                      viewTo="/health"
                    />
                  </div>
                </Popup>
              </Marker>
            ))}

          {layers.reports &&
            CITIZEN_REPORTS.map((r) => (
              <Marker key={r.id} position={r.position} icon={reportIcon}>
                <Popup>
                  <div className="popup-content report-popup">
                    <h4>{r.name}</h4>
                    <p className="popup-sub">{r.type}</p>
                    <p className="report-detail">{r.detail}</p>
                    <p className="report-popup-meta">
                      <span className={`status-badge ${statusClass(r.status)}`}>
                        {r.status}
                      </span>
                    </p>
                    <p className="popup-meta-row">
                      <span className="popup-meta-label">Last updated</span>
                      <span>{r.updated}</span>
                    </p>
                    <PopupActions
                      phone="999"
                      lat={r.position[0]}
                      lng={r.position[1]}
                      primary="Navigate"
                      viewTo="/report"
                    />
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        <div className="map-top-controls">
          <button
            type="button"
            className="map-control-btn"
            onClick={zoomToBangladesh}
            disabled={!leafletMap}
            title="Zoom to Bangladesh"
            aria-label="Zoom map to Bangladesh"
          >
            BD
          </button>
          <button
            type="button"
            className={`map-control-btn ${geoLoading ? 'is-loading' : ''}`}
            onClick={locateMe}
            disabled={!leafletMap || geoLoading}
            title="Locate me"
            aria-label="Locate me on the map"
            aria-busy={geoLoading}
          >
            {geoLoading ? <Spinner size={18} /> : '⌖'}
          </button>
        </div>
        {geoMessage ? (
          <div className="map-geo-toast" role="status">
            {geoMessage}
          </div>
        ) : null}

        <div className="map-info-bar">
          <span>
            Center: <strong>Bangladesh</strong> · Carto Dark Matter
          </span>
          <span className="risk-indicator">
            Live layers: <strong>floods, hospitals, reports</strong>
          </span>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default FloodMap;
