# Integrating an analysis model

Written for the water-drainage model. The dashboard already consumes a
findings shape; this is that shape and how to plug into it.

## Two ways in

**A. HTTP service.** Set `MODEL_URL` to an endpoint that accepts
`POST { geojson, options }` and returns findings. The backend proxies to it,
validates the response, and serves it at `POST /api/analyze`.

```bash
MODEL_URL=http://localhost:8800/analyze node serve.js
```

Check the contract and whether a model is attached:

```bash
curl localhost:3001/api/analyze/contract
```

**B. In-process JavaScript.** Drop a module in `src/utils/` exporting the same
shape and call it from `handleFileUpload` in `src/App.jsx`, beside
`analyzeInfrastructureGaps`.

Use A if the model is Python. Use B if it is JavaScript.

## What to return

```jsonc
{
  "issues": [{
    "id": "DRAIN-1",
    "category": "Water & Drainage",
    "problem": "One sentence a committee member can read.",
    "location": "Where, in terms of the uploaded extent.",
    "severity": 7.8,                   // 0-10
    "priority": "HIGH",                // HIGH | MEDIUM | LOW
    "coordinates": [19.108, 72.913],   // [lat, lng], inside the upload
    "affectedBuildings": 6,
    "affectedPopulation": 33,
    "populationIsEstimated": true,     // say so if inferred
    "evidence": "What in the data produced this.",
    "metrics": { "anything": "the model wants to expose" }
  }],
  "recommendations": [ /* same, plus action, proposedSite, estimatedCost */ ],
  "gapZones": [{ "id", "coordinates", "radiusMeters", "severity",
                 "priority", "title", "detail" }]
}
```

## Two rules the endpoint enforces

Both are rejections, not warnings, because both have already caused a visible
failure in this dashboard.

**1. Coordinates must fall inside the uploaded extent.** The dashboard once
displayed Patiala findings over a map of Mumbai, with "Inspect on Map" flying
1,500 km away. A finding must be located in the data it came from.

**2. Every issue must carry `evidence`.** A severity score with no derivation
cannot be contested, and a number an officer cannot contest is a number they
will not act on. One sentence naming what in the data produced the finding.

Softer checks come back as warnings and still render — notably, giving
`affectedPopulation` without `populationIsEstimated`. GeoJSON contains
buildings, not people, so a population figure is almost always inferred and
should say so.

## Testing without the dashboard

```js
import { validateFindings } from './server/analyze.js';
const bounds = { north: 19.12, south: 19.07, east: 72.92, west: 72.87 };
console.log(validateFindings(yourOutput, bounds));
// { ok, errors, warnings }
```

If `ok` is true, the dashboard will render it.

## What happens with no model configured

`/api/analyze` returns 503 and says so explicitly. The dashboard falls back to
its own built-in spatial analysis — deliberately not silently, because
findings from the model and findings from the built-in engine are different
claims and the user should know which they are looking at.
