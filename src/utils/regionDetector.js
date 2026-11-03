// Region detection for an uploaded GeoJSON: where on Earth the data actually
// is (bounding box + centre), whether the coordinates look valid, and a
// human-readable place name via reverse geocoding.

function walkCoordinates(coords, visit) {
  if (!Array.isArray(coords)) return;
  if (typeof coords[0] === 'number') {
    visit(coords);
    return;
  }
  coords.forEach((c) => walkCoordinates(c, visit));
}

function walkGeometry(geom, visit) {
  if (!geom) return;
  if (geom.type === 'GeometryCollection') {
    (geom.geometries || []).forEach((g) => walkGeometry(g, visit));
  } else {
    walkCoordinates(geom.coordinates, visit);
  }
}

// GeoJSON positions are [longitude, latitude].
export function detectRegion(geoJson) {
  const features = geoJson?.features || [];
  let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
  let positions = 0;
  let outOfRange = 0;
  let swapped = 0;

  features.forEach((f) => {
    walkGeometry(f.geometry, ([lng, lat]) => {
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
      if (Math.abs(lng) > 180 || Math.abs(lat) > 90) {
        // Lat/lon swapped (lat value too big to be a latitude but valid longitude)?
        if (Math.abs(lng) <= 90 && Math.abs(lat) <= 180) swapped++;
        else outOfRange++;
        return;
      }
      positions++;
      west = Math.min(west, lng);
      east = Math.max(east, lng);
      south = Math.min(south, lat);
      north = Math.max(north, lat);
    });
  });

  const warnings = [];
  if (outOfRange > 0) {
    warnings.push(
      `${outOfRange} coordinates fall outside valid longitude/latitude ranges — the file may use a projected CRS (e.g. UTM) instead of WGS84.`
    );
  }
  if (swapped > 0) {
    warnings.push(`${swapped} coordinates look like [latitude, longitude] instead of GeoJSON's [longitude, latitude].`);
  }

  if (positions === 0) {
    return { valid: false, positions: 0, warnings };
  }

  const centre = { lat: (south + north) / 2, lng: (west + east) / 2 };
  const kmPerDegLat = 111.32;
  const kmPerDegLng = 111.32 * Math.cos((centre.lat * Math.PI) / 180);
  const widthKm = (east - west) * kmPerDegLng;
  const heightKm = (north - south) * kmPerDegLat;

  return {
    valid: true,
    positions,
    bounds: { west, south, east, north },
    centre,
    widthKm,
    heightKm,
    areaKm2: widthKm * heightKm,
    warnings
  };
}

// Reverse-geocode the centre of the data to a place name using OpenStreetMap
// Nominatim (free, no key). Returns null when offline or nothing is found.
export async function reverseGeocode(lat, lng, signal) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=12&accept-language=en&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address || {};
    const locality = a.city || a.town || a.village || a.suburb || a.county || a.state_district;
    const parts = [locality, a.state, a.country].filter(Boolean);
    return parts.length ? { label: parts.join(', '), full: data.display_name } : null;
  } catch {
    return null;
  }
}
