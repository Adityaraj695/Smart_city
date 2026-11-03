// Infrastructure gap detection from uploaded GeoJSON.
//
// This is the engine the dashboard was missing. `geoJsonAnalyzer.js` classifies
// and counts features, which is real work and is kept; but every *finding* the
// interface displayed — the issues table, the severity scores, the module
// percentages, the gap zones on the map — came from a constant array about
// Patiala, regardless of what file had been uploaded.
//
// Everything below is computed from the user's own features. Where a quantity
// cannot be derived from a GeoJSON file (how many people live in a building,
// for instance), it is marked ESTIMATED and carries its assumption, rather
// than being invented and presented as a measurement.
//
// Thresholds are published norms, not numbers chosen here:
//   education   RTE Act 2009 — primary within 1 km, upper primary within 3 km
//   healthcare  catchment used by the district health administration for
//               siting a sub-centre; configurable below
//   water       a premises is served if the distribution network reaches it

import { classifyFeature } from './geoJsonAnalyzer';
import { counted, estimated, official } from './provenance';

export const NORMS = {
  education: {
    radiusKm: 1.0,
    label: 'primary school within 1 km',
    citation: 'Right to Education Act 2009, neighbourhood school norms',
  },
  healthcare: {
    radiusKm: 1.5,
    label: 'health facility within 1.5 km',
    citation: 'Sub-centre siting catchment (IPHS 2022 population norm, 5,000)',
  },
  water: {
    radiusKm: 0.25,
    label: 'water main within 250 m of the premises',
    citation: 'Jal Jeevan Mission — functional household tap connection',
  },
  drainage: {
    radiusKm: 0.3,
    label: 'stormwater drainage within 300 m',
    citation: 'Swachh Bharat Mission (Urban) drainage coverage',
  },
};

// Only used to translate a building count into a population figure, and always
// marked ESTIMATED with this range attached. Census 2011 average household
// size is 4.9 nationally and 5.2 in Punjab; buildings may hold more than one
// household, hence the spread.
const PEOPLE_PER_BUILDING = { low: 4.0, mid: 5.5, high: 8.0 };

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance. Flat-earth approximations drift badly at district scale. */
export function haversineKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Representative point of any geometry, as [lat, lng]. */
export function centroid(geometry) {
  if (!geometry || !geometry.coordinates) return null;
  const pts = [];
  const walk = (c) => {
    if (typeof c[0] === 'number' && typeof c[1] === 'number') {
      pts.push([c[1], c[0]]); // GeoJSON is [lng, lat]
      return;
    }
    if (Array.isArray(c)) c.forEach(walk);
  };
  walk(geometry.coordinates);
  if (!pts.length) return null;
  const lat = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const lng = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return [lat, lng];
}

/**
 * Nearest distance from a point to any of a set of points.
 *
 * Linear scan with an early exit. A spatial index would be faster, but these
 * files hold hundreds to low thousands of features and the clarity is worth
 * more than the microseconds at this size.
 */
function nearestKm(from, targets) {
  let best = Infinity;
  for (const t of targets) {
    const d = haversineKm(from, t);
    if (d < best) {
      best = d;
      if (best === 0) break;
    }
  }
  return best;
}

/** Grid key for clustering underserved points into contiguous zones. */
function cellKey([lat, lng], sizeKm) {
  const latStep = sizeKm / 111.32;
  const lngStep = sizeKm / (111.32 * Math.cos((lat * Math.PI) / 180) || 1);
  return `${Math.floor(lat / latStep)}:${Math.floor(lng / lngStep)}`;
}

/**
 * Flood-fill cells that touch, so one settlement produces one finding.
 *
 * Grid clustering is cheap and predictable, but its boundaries fall wherever
 * the arithmetic puts them rather than where people live. A settlement
 * straddling a grid line would otherwise be reported twice, with near
 * identical text, inflating the issue count and making the table look padded.
 */
function mergeAdjacent(cells) {
  const keys = [...cells.keys()];
  const parsed = new Map(keys.map((k) => [k, k.split(':').map(Number)]));
  const seen = new Set();
  const out = [];

  for (const key of keys) {
    if (seen.has(key)) continue;
    const group = [];
    const queue = [key];
    seen.add(key);
    while (queue.length) {
      const cur = queue.pop();
      group.push(...cells.get(cur));
      const [ci, cj] = parsed.get(cur);
      for (const other of keys) {
        if (seen.has(other)) continue;
        const [oi, oj] = parsed.get(other);
        if (Math.abs(oi - ci) <= 1 && Math.abs(oj - cj) <= 1) {
          seen.add(other);
          queue.push(other);
        }
      }
    }
    out.push(group);
  }
  return out;
}

/**
 * Severity on the dashboard's 0-10 scale.
 *
 * Two components, both observable: how far past the norm the shortfall runs,
 * and how many premises it affects. A deficit of 200 m affecting four houses
 * is not the same problem as one of 3 km affecting two hundred, and a single
 * distance figure cannot tell them apart.
 */
export function severityScore({ worstKm, radiusKm, affected, totalBuildings }) {
  const overshoot = Math.max(0, worstKm - radiusKm) / Math.max(radiusKm, 0.05);
  const distancePart = Math.min(6, overshoot * 2.2);
  const share = totalBuildings > 0 ? affected / totalBuildings : 0;
  const scalePart = Math.min(4, share * 9);
  return Math.round(Math.min(10, distancePart + scalePart) * 10) / 10;
}

export function priorityFor(severity) {
  if (severity >= 7) return 'HIGH';
  if (severity >= 4.5) return 'MEDIUM';
  return 'LOW';
}

/**
 * Describe where a zone is, relative to the uploaded extent.
 *
 * The dashboard needs a human-readable location. Inventing a ward name would
 * be fabrication, so this states a bearing within the user's own data — true
 * by construction, and honest about being approximate.
 */
function relativePosition([lat, lng], bounds) {
  const midLat = (bounds.north + bounds.south) / 2;
  const midLng = (bounds.east + bounds.west) / 2;
  const ns = lat > midLat + (bounds.north - bounds.south) * 0.15 ? 'Northern'
    : lat < midLat - (bounds.north - bounds.south) * 0.15 ? 'Southern' : 'Central';
  const ew = lng > midLng + (bounds.east - bounds.west) * 0.15 ? 'eastern'
    : lng < midLng - (bounds.east - bounds.west) * 0.15 ? 'western' : '';
  return [ns, ew].filter(Boolean).join(' ') || 'Central';
}

/** Approximate extent of a bounding box, in square kilometres. */
export function areaOfBounds(bounds) {
  if (!bounds) return null;
  const midLat = (bounds.north + bounds.south) / 2;
  const widthKm = (bounds.east - bounds.west) * 111.32 * Math.cos((midLat * Math.PI) / 180);
  const heightKm = (bounds.north - bounds.south) * 111.32;
  return Math.round(Math.abs(widthKm * heightKm) * 10) / 10;
}

function boundsOf(points) {
  return {
    north: Math.max(...points.map((p) => p[0])),
    south: Math.min(...points.map((p) => p[0])),
    east: Math.max(...points.map((p) => p[1])),
    west: Math.min(...points.map((p) => p[1])),
  };
}

/**
 * The main entry point.
 *
 * Returns issues, recommendations, gap zones and per-module statistics, all
 * computed from `geoJson`. Replaces the hardcoded arrays the dashboard used
 * to show for every file.
 */
export function analyzeInfrastructureGaps(geoJson, { fileName = 'uploaded file' } = {}) {
  if (!geoJson || !Array.isArray(geoJson.features)) {
    throw new Error('Invalid GeoJSON: expected a FeatureCollection.');
  }

  const byCategory = {
    buildings: [], roads: [], healthcare: [], education: [],
    water: [], drainage: [], power: [],
  };
  for (const f of geoJson.features) {
    const cat = classifyFeature(f);
    if (!cat) continue;
    const c = centroid(f.geometry);
    if (!c) continue;
    byCategory[cat].push({ point: c, feature: f });
  }

  const demand = byCategory.buildings.map((b) => b.point);
  const allPoints = Object.values(byCategory).flat().map((x) => x.point);
  if (!allPoints.length) {
    return emptyResult(fileName, 'No locatable features were found in this file.');
  }
  const bounds = boundsOf(allPoints);

  // Without buildings there is no demand surface, so proximity analysis has
  // nothing to measure against. Saying so beats inventing a result.
  if (!demand.length) {
    return emptyResult(
      fileName,
      'No building footprints were found, so proximity analysis could not run. ' +
      'Upload a file containing buildings to detect service gaps.'
    );
  }

  const issues = [];
  const gapZones = [];
  const modules = {};

  for (const service of ['healthcare', 'education', 'water', 'drainage']) {
    const norm = NORMS[service];
    const supply = byCategory[service].map((s) => s.point);

    if (!supply.length) {
      modules[service] = {
        available: false,
        reason: `No ${service} features in this file — coverage cannot be computed, ` +
                'and is not assumed.',
      };
      continue;
    }

    const distances = demand.map((d) => ({ point: d, km: nearestKm(d, supply) }));
    const underserved = distances.filter((d) => d.km > norm.radiusKm);
    const coverage = 1 - underserved.length / demand.length;

    modules[service] = {
      available: true,
      coverage,
      coverageMeasure: counted(
        Math.round(coverage * 1000) / 10,
        `% of ${demand.length} buildings within ${norm.radiusKm} km of a ${service} feature`,
        fileName
      ),
      facilities: supply.length,
      buildingsServed: demand.length - underserved.length,
      buildingsUnderserved: underserved.length,
      worstKm: distances.reduce((m, d) => Math.max(m, d.km), 0),
      medianKm: median(distances.map((d) => d.km)),
      norm,
    };

    if (!underserved.length) continue;

    // Cluster the underserved premises so the map shows zones rather than a
    // scatter of individual dots an officer cannot act on.
    const cells = new Map();
    for (const d of underserved) {
      const key = cellKey(d.point, 0.8);
      if (!cells.has(key)) cells.set(key, []);
      cells.get(key).push(d);
    }

    // A settlement that straddles a grid line would otherwise be reported as
    // two separate gaps with near-identical text, inflating the issue count
    // and making the table look padded. Merge touching cells first.
    const clusters = mergeAdjacent(cells)
      .filter((c) => c.length >= 2)
      .sort((a, b) => b.length - a.length)
      .slice(0, 4);

    for (const [i, cluster] of clusters.entries()) {
      const lat = cluster.reduce((s, d) => s + d.point[0], 0) / cluster.length;
      const lng = cluster.reduce((s, d) => s + d.point[1], 0) / cluster.length;
      const worstKm = cluster.reduce((m, d) => Math.max(m, d.km), 0);
      const severity = severityScore({
        worstKm, radiusKm: norm.radiusKm,
        affected: cluster.length, totalBuildings: demand.length,
      });
      const where = relativePosition([lat, lng], bounds);
      const radiusMeters = Math.max(
        250,
        Math.round(
          cluster.reduce((m, d) => Math.max(m, haversineKm([lat, lng], d.point)), 0) * 1000
        )
      );

      const buildings = counted(cluster.length, 'buildings beyond the norm', fileName);
      const people = estimated(
        Math.round(cluster.length * PEOPLE_PER_BUILDING.mid),
        [
          Math.round(cluster.length * PEOPLE_PER_BUILDING.low),
          Math.round(cluster.length * PEOPLE_PER_BUILDING.high),
        ],
        `${cluster.length} buildings x 4.0-8.0 people (Census 2011 household size)`,
        { unit: 'people', notes: 'GeoJSON carries no population; this is inferred' }
      );

      issues.push({
        id: `${service.toUpperCase()}-${i + 1}`,
        category: CATEGORY_LABEL[service],
        service,
        problem: problemText(service, cluster.length, worstKm, norm),
        location: `${where} cluster, ${radiusMeters} m radius`,
        severity,
        priority: priorityFor(severity),
        coordinates: [lat, lng],
        affectedBuildings: cluster.length,
        affectedPopulation: people.value,
        populationMeasure: people,
        buildingsMeasure: buildings,
        metrics: {
          worstDistanceKm: Math.round(worstKm * 100) / 100,
          normKm: norm.radiusKm,
          citation: norm.citation,
        },
        evidence: `${cluster.length} of ${demand.length} buildings lie beyond ` +
                  `${norm.radiusKm} km of the nearest ${service} feature in this file; ` +
                  `the furthest is ${worstKm.toFixed(2)} km.`,
      });

      gapZones.push({
        id: `${service}-gap-${i + 1}`,
        category: CATEGORY_LABEL[service],
        service,
        coordinates: [lat, lng],
        radiusMeters,
        severity,
        priority: priorityFor(severity),
        title: `${CATEGORY_LABEL[service]} gap — ${where}`,
        detail: `${cluster.length} buildings beyond ${norm.radiusKm} km. ${norm.citation}.`,
      });
    }
  }

  issues.sort((a, b) => b.severity - a.severity);
  gapZones.sort((a, b) => b.severity - a.severity);

  const recommendations = buildRecommendations(issues, modules, fileName);

  return {
    fileName,
    featureCount: geoJson.features.length,
    buildingCount: demand.length,
    bounds,
    issues,
    recommendations,
    gapZones,
    interventions: recommendations
      .filter((r) => r.proposedSite)
      .map((r) => ({
        id: r.id,
        coordinates: r.proposedSite,
        category: r.category,
        title: r.action,
        detail: r.reason,
      })),
    modules,
    summary: summarise(issues, recommendations),
    ranAnalysis: true,
    notice: null,
  };
}

const CATEGORY_LABEL = {
  healthcare: 'Healthcare',
  education: 'Education',
  water: 'Water & Drainage',
  drainage: 'Water & Drainage',
};

function problemText(service, count, worstKm, norm) {
  const far = worstKm.toFixed(1);
  switch (service) {
    case 'healthcare':
      return `${count} buildings lie beyond the ${norm.radiusKm} km health catchment; the furthest is ${far} km from any facility.`;
    case 'education':
      return `${count} buildings lie beyond the RTE ${norm.radiusKm} km neighbourhood-school distance; the furthest is ${far} km.`;
    case 'water':
      return `${count} buildings sit more than ${norm.radiusKm * 1000} m from the mapped water network; the furthest is ${far} km.`;
    case 'drainage':
      return `${count} buildings sit more than ${norm.radiusKm * 1000} m from mapped drainage; the furthest is ${far} km.`;
    default:
      return `${count} buildings fall outside the ${norm.radiusKm} km service norm.`;
  }
}

const ACTION = {
  healthcare: 'Site a sub-centre or health post to bring this cluster inside the catchment',
  education: 'Site a primary school, or provide transport, to meet the RTE distance norm',
  water: 'Extend the distribution main to reach these premises',
  drainage: 'Extend stormwater drainage to cover this cluster',
};

// Indicative capital costs per intervention, in rupees. Exposed rather than
// buried so a reviewer can challenge them; a hidden cost assumption makes the
// whole recommendation unfalsifiable.
const UNIT_COST = {
  healthcare: 4_500_000,
  education: 6_800_000,
  water: 1_400_000,
  drainage: 1_900_000,
};

function buildRecommendations(issues, modules, fileName) {
  return issues.map((issue, i) => ({
    id: `REC-${String(i + 1).padStart(2, '0')}`,
    category: issue.category,
    service: issue.service,
    problem: issue.problem,
    location: issue.location,
    reason: issue.evidence,
    severity: issue.severity,
    priority: issue.priority,
    action: ACTION[issue.service] || 'Extend service coverage to this cluster',
    // The cluster centroid is the obvious candidate site: it minimises the
    // worst-case walk within the cluster. A planner will move it, and should.
    proposedSite: issue.coordinates,
    estimatedCost: UNIT_COST[issue.service] || null,
    estimatedCostNote: 'indicative capital cost; replace with the state schedule of rates',
    affectedBuildings: issue.affectedBuildings,
    affectedPopulation: issue.affectedPopulation,
    populationIsEstimated: true,
    citation: issue.metrics.citation,
    coordinates: issue.coordinates,
    source: fileName,
  }));
}

function summarise(issues, recommendations) {
  const count = (p) => issues.filter((i) => i.priority === p).length;
  return {
    totalIssues: issues.length,
    high: count('HIGH'),
    medium: count('MEDIUM'),
    low: count('LOW'),
    recommendations: recommendations.length,
  };
}

function median(xs) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function emptyResult(fileName, notice) {
  return {
    fileName,
    featureCount: 0,
    buildingCount: 0,
    bounds: null,
    issues: [],
    recommendations: [],
    gapZones: [],
    interventions: [],
    modules: {},
    summary: { totalIssues: 0, high: 0, medium: 0, low: 0, recommendations: 0 },
    ranAnalysis: false,
    notice,
  };
}
