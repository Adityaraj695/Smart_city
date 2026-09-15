// GeoJSON Parser & Infrastructure Gap Analysis Engine
// Strictly adheres to data integrity: Missing datasets are never synthetically assumed.

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
    const props = feature.properties || {};
    const geomType = feature.geometry ? feature.geometry.type : '';
    const cat = (props.category || '').toLowerCase();
    const amenity = (props.amenity || '').toLowerCase();
    const highway = (props.highway || '').toLowerCase();
    const building = props.building;
    const waterway = (props.waterway || '').toLowerCase();
    const power = (props.power || props.outages !== undefined || props.grid_voltage !== undefined);

    // 1. Healthcare Facilities
    if (
      cat === 'healthcare' ||
      cat === 'hospital' ||
      amenity === 'hospital' ||
      amenity === 'clinic' ||
      amenity === 'doctors' ||
      amenity === 'health_centre' ||
      amenity === 'dispensary'
    ) {
      counts.healthcare++;
      detectedCategories.healthcare.push(feature);
      continue;
    }

    // 2. Educational Facilities
    if (
      cat === 'education' ||
      cat === 'school' ||
      cat === 'college' ||
      amenity === 'school' ||
      amenity === 'college' ||
      amenity === 'university' ||
      amenity === 'kindergarten'
    ) {
      counts.education++;
      detectedCategories.education.push(feature);
      continue;
    }

    // 3. Water Network
    if (
      cat === 'water' ||
      cat === 'pipeline' ||
      waterway === 'pipeline' ||
      props.water_pipe !== undefined ||
      props.water_pressure !== undefined ||
      props.diameterMm !== undefined
    ) {
      counts.water++;
      detectedCategories.water.push(feature);
      continue;
    }

    // 4. Drainage Network
    if (
      cat === 'drainage' ||
      cat === 'stormwater' ||
      waterway === 'drain' ||
      waterway === 'ditch' ||
      props.drain_type !== undefined ||
      props.stormwater !== undefined
    ) {
      counts.drainage++;
      detectedCategories.drainage.push(feature);
      continue;
    }

    // 5. Power / Electrical Network & Outage Telemetry
    if (
      cat === 'power' ||
      cat === 'electricity' ||
      power ||
      props.outage_history !== undefined ||
      props.blackout_hours !== undefined
    ) {
      counts.power++;
      detectedCategories.power.push(feature);
      continue;
    }

    // 6. Roads / Transportation
    if (
      cat === 'road' ||
      highway ||
      geomType === 'LineString' ||
      geomType === 'MultiLineString'
    ) {
      counts.roads++;
      detectedCategories.roads.push(feature);
      continue;
    }

    // 7. Buildings / Urban Footprints
    if (
      cat === 'building' ||
      building ||
      geomType === 'Polygon' ||
      geomType === 'MultiPolygon'
    ) {
      counts.buildings++;
      detectedCategories.buildings.push(feature);
      continue;
    }
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
