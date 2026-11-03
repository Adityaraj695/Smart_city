// The seam an external analysis model plugs into.
//
// Built for the water-drainage model: it accepts a GeoJSON FeatureCollection
// and returns findings in the exact shape the dashboard already consumes, so
// integrating a model becomes a matter of pointing MODEL_URL at it rather than
// of touching the UI.
//
// Two rules the endpoint enforces on anything a model returns, because the
// dashboard's credibility depends on them and a model author should not have
// to remember them:
//
//   1. Every issue must carry coordinates that fall inside the uploaded
//      extent. The failure this guards against is real and was shipped: the
//      dashboard displayed findings at Patiala coordinates over a map of
//      somewhere else entirely.
//   2. Every issue must carry evidence — a sentence naming what in the data
//      produced it. A severity score with no derivation cannot be contested,
//      and an officer who cannot contest a number will not act on it.

import express from 'express';

export const CONTRACT = {
  request: {
    geojson: 'FeatureCollection — the uploaded file, unchanged',
    options: 'optional object passed through to the model',
  },
  response: {
    issues: [
      {
        id: 'string, unique within the response',
        category: "'Water & Drainage' | 'Healthcare' | 'Education' | 'Roads & Buildings'",
        problem: 'one sentence, plain language',
        location: 'human-readable place within the uploaded extent',
        severity: 'number 0-10',
        priority: "'HIGH' | 'MEDIUM' | 'LOW'",
        coordinates: '[lat, lng], inside the uploaded bounds',
        affectedBuildings: 'integer, optional',
        affectedPopulation: 'integer, optional — mark estimated if inferred',
        evidence: 'what in the data produced this finding',
        metrics: 'object, optional — whatever the model wants to expose',
      },
    ],
    recommendations: 'same shape as issues, plus action, proposedSite, estimatedCost',
    gapZones: '[{ id, coordinates, radiusMeters, severity, priority, title, detail }]',
    modules: 'optional per-service stats keyed by healthcare|education|water|drainage',
  },
};

function boundsOf(geojson) {
  let n = -Infinity, s = Infinity, e = -Infinity, w = Infinity;
  const walk = (c) => {
    if (typeof c[0] === 'number' && typeof c[1] === 'number') {
      const [lng, lat] = c;
      n = Math.max(n, lat); s = Math.min(s, lat);
      e = Math.max(e, lng); w = Math.min(w, lng);
      return;
    }
    if (Array.isArray(c)) c.forEach(walk);
  };
  for (const f of geojson.features || []) {
    if (f?.geometry?.coordinates) walk(f.geometry.coordinates);
  }
  return Number.isFinite(n) ? { north: n, south: s, east: e, west: w } : null;
}

/**
 * Check a model's output before it reaches the dashboard.
 *
 * Returns { ok, errors, warnings }. Violations of the two hard rules are
 * errors and the response is rejected; everything else is a warning that is
 * surfaced to the user alongside the findings, so a slightly malformed but
 * useful result still gets through.
 */
export function validateFindings(payload, bounds) {
  const errors = [];
  const warnings = [];

  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: ['model returned a non-object response'], warnings };
  }
  const issues = Array.isArray(payload.issues) ? payload.issues : null;
  if (!issues) {
    return { ok: false, errors: ['model response has no `issues` array'], warnings };
  }

  // A degree of slack around the extent: a proposed site may legitimately sit
  // just outside the mapped features it serves.
  const pad = bounds
    ? Math.max(0.02, (bounds.north - bounds.south) * 0.25, (bounds.east - bounds.west) * 0.25)
    : 0;

  issues.forEach((issue, i) => {
    const at = `issues[${i}]`;
    if (!Array.isArray(issue.coordinates) || issue.coordinates.length !== 2) {
      errors.push(`${at}: coordinates must be [lat, lng]`);
    } else if (bounds) {
      const [lat, lng] = issue.coordinates;
      const inside =
        lat <= bounds.north + pad && lat >= bounds.south - pad &&
        lng <= bounds.east + pad && lng >= bounds.west - pad;
      if (!inside) {
        errors.push(
          `${at}: coordinates [${lat}, ${lng}] fall outside the uploaded extent. ` +
          'A finding must be located in the data it was derived from.'
        );
      }
    }
    if (!issue.evidence || !String(issue.evidence).trim()) {
      errors.push(`${at}: missing \`evidence\` — a finding must say what produced it`);
    }
    const sev = Number(issue.severity);
    if (!Number.isFinite(sev) || sev < 0 || sev > 10) {
      errors.push(`${at}: severity must be a number between 0 and 10`);
    }
    if (!['HIGH', 'MEDIUM', 'LOW'].includes(issue.priority)) {
      warnings.push(`${at}: priority "${issue.priority}" is not HIGH/MEDIUM/LOW`);
    }
    if (issue.affectedPopulation != null && issue.populationIsEstimated == null) {
      warnings.push(
        `${at}: affectedPopulation given without populationIsEstimated. ` +
        'GeoJSON rarely carries population, so an inferred figure should say so.'
      );
    }
  });

  return { ok: errors.length === 0, errors, warnings };
}

export function createAnalyzeRouter({ fetchImpl = globalThis.fetch } = {}) {
  const router = express.Router();
  router.use(express.json({ limit: '50mb' }));

  router.get('/contract', (_req, res) => {
    res.json({
      contract: CONTRACT,
      modelConfigured: Boolean(process.env.MODEL_URL),
      modelUrl: process.env.MODEL_URL ? '(configured)' : null,
      note:
        'Set MODEL_URL to the analysis service. Until it is set, the dashboard ' +
        'runs its own built-in spatial analysis and this endpoint reports that ' +
        'no external model is attached.',
    });
  });

  router.post('/', async (req, res) => {
    const { geojson, options } = req.body || {};
    if (!geojson || !Array.isArray(geojson.features)) {
      return res.status(400).json({ error: 'a GeoJSON FeatureCollection is required' });
    }

    const modelUrl = process.env.MODEL_URL;
    if (!modelUrl) {
      // Explicitly not a silent fallback. The client needs to know whether the
      // findings it is about to show came from the model or from the built-in
      // engine, because they are not the same claim.
      return res.status(503).json({
        error: 'no analysis model configured',
        modelConfigured: false,
        hint: 'Set MODEL_URL. The dashboard falls back to its built-in spatial analysis.',
      });
    }

    const bounds = boundsOf(geojson);
    try {
      const upstream = await fetchImpl(modelUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geojson, options: options || {} }),
      });
      if (!upstream.ok) {
        return res.status(502).json({
          error: `analysis model returned ${upstream.status}`,
          modelConfigured: true,
        });
      }
      const payload = await upstream.json();
      const check = validateFindings(payload, bounds);
      if (!check.ok) {
        return res.status(422).json({
          error: 'analysis model returned findings that failed validation',
          errors: check.errors,
          warnings: check.warnings,
        });
      }
      return res.json({
        ...payload,
        source: 'external model',
        warnings: check.warnings,
        bounds,
      });
    } catch (err) {
      return res.status(502).json({
        error: 'could not reach the analysis model',
        detail: String(err.message || err),
      });
    }
  });

  return router;
}
