/**
 * Fixes Leaflet default marker 404s when bundlers rewrite asset paths.
 * Import this module once before creating any map (e.g. in FloodMap).
 */
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

export { shadowUrl as leafletMarkerShadowUrl };
