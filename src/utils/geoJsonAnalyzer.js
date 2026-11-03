// GeoJSON Parser & Infrastructure Gap Analysis Engine
// Strictly adheres to data integrity: Missing datasets are never synthetically assumed.

// Decide which infrastructure layer a feature belongs to (or null when it
// matches none). Shared by the analysis engine and the map so both always
// agree on what the uploaded data contains.
export function classifyFeature(feature) {
  const props = feature?.properties || {};
  const geomType = feature?.geometry ? feature.geometry.type : '';
  const cat = String(props.category || '').toLowerCase();
  const amenity = String(props.amenity || '').toLowerCase();
  const highway = String(props.highway || '').toLowerCase();
  const waterway = String(props.waterway || '').toLowerCase();
  const power = props.power || props.outages !== undefined || props.grid_voltage !== undefined;

  if (
    cat === 'healthcare' || cat === 'hospital' ||
    ['hospital', 'clinic', 'doctors', 'health_centre', 'dispensary'].includes(amenity)
  ) return 'healthcare';

  if (
    cat === 'education' || cat === 'school' || cat === 'college' ||
    ['school', 'college', 'university', 'kindergarten'].includes(amenity)
  ) return 'education';

  if (
    cat === 'water' || cat === 'pipeline' || waterway === 'pipeline' ||
    props.water_pipe !== undefined || props.water_pressure !== undefined || props.diameterMm !== undefined
  ) return 'water';

  if (
    cat === 'drainage' || cat === 'stormwater' || waterway === 'drain' || waterway === 'ditch' ||
    props.drain_type !== undefined || props.stormwater !== undefined
  ) return 'drainage';

  if (
    cat === 'power' || cat === 'electricity' || power ||
    props.outage_history !== undefined || props.blackout_hours !== undefined
  ) return 'power';

  if (cat === 'road' || highway || geomType === 'LineString' || geomType === 'MultiLineString') return 'roads';

  if (cat === 'building' || props.building || geomType === 'Polygon' || geomType === 'MultiPolygon') return 'buildings';

  return null;
}

export function analyzeGeoJsonData(geoJsonPayload) {
  if (!geoJsonPayload || !geoJsonPayload.features || !Array.isArray(geoJsonPayload.features)) {
    throw new Error('Invalid GeoJSON: Payload must contain a FeatureCollection with an array of features.');
  }

  const features = geoJsonPayload.features;

  const counts = {
    buildings: 0,
    roads: 0,
    healthcare: 0,
    education: 0,
    water: 0,
    drainage: 0,
    power: 0
  };

  const detectedCategories = {
    buildings: [],
    roads: [],
    healthcare: [],
    education: [],
    water: [],
    drainage: [],
    power: []
  };

  // Inspect each feature to detect category based on OSM tags and GeoJSON properties
  for (const feature of features) {
    const category = classifyFeature(feature);
    if (!category) continue;
    counts[category]++;
    detectedCategories[category].push(feature);
  }

  // Determine Data Availability with explicit verification statuses
  const dataAvailability = {
    buildings: {
      available: counts.buildings > 0,
      count: counts.buildings,
      label: 'Buildings',
      detail: `${counts.buildings} structural footprints detected`,
      status: counts.buildings > 0 ? 'verified' : 'missing'
    },
    roads: {
      available: counts.roads > 0,
      count: counts.roads,
      label: 'Roads',
      detail: `${counts.roads} road segments detected`,
      status: counts.roads > 0 ? 'verified' : 'missing'
    },
    healthcare: {
      available: counts.healthcare > 0,
      count: counts.healthcare,
      label: 'Healthcare Facilities',
      detail: `${counts.healthcare} hospitals/clinics registered`,
      status: counts.healthcare > 0 ? 'verified' : 'missing'
    },
    education: {
      available: counts.education > 0,
      count: counts.education,
      label: 'Educational Facilities',
      detail: `${counts.education} schools/colleges registered`,
      status: counts.education > 0 ? 'verified' : 'missing'
    },
    water: {
      available: counts.water > 0,
      count: counts.water,
      label: 'Water Network',
      detail: `${counts.water} pipeline segments detected`,
      status: counts.water > 0 ? 'verified' : 'missing'
    },
    drainage: {
      available: counts.drainage > 0,
      count: counts.drainage,
      label: 'Drainage Network',
      detail: `${counts.drainage} stormwater channels detected`,
      status: counts.drainage > 0 ? 'verified' : 'missing'
    },
    power: {
      available: counts.power > 0,
      count: counts.power,
      label: 'Power Outage Data',
      detail: counts.power > 0 ? `${counts.power} telemetry feeds verified` : 'Not Available',
      status: counts.power > 0 ? 'verified' : 'missing',
      notice: counts.power > 0
        ? 'Power outage telemetry feed verified.'
        : 'Power outage data is not present in the uploaded GeoJSON file. The system will not make assumptions for missing power infrastructure.'
    }
  };

  return {
    featureCount: features.length,
    counts,
    dataAvailability,
    detectedCategories
  };
}

// Compute Priority Counts from an issues list
export function calculatePrioritySummary(issuesList) {
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const issue of issuesList) {
    if (issue.priority === 'HIGH') high++;
    else if (issue.priority === 'MEDIUM') medium++;
    else low++;
  }

  return {
    total: issuesList.length,
    high,
    medium,
    low
  };
}
