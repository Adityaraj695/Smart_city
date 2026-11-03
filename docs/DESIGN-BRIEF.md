# Design brief — prompt for Claude Design

Copy everything below the line into Claude Design.

---

You are redesigning a municipal GIS decision-support dashboard. A city
engineer uploads a GeoJSON of their jurisdiction and the system tells them
where infrastructure does not reach people — which neighbourhoods are beyond
walking distance of a school, which buildings sit outside the water network,
where a clinic should go.

Take real creative risk. The current interface is competent and generic, and
competent and generic is the failure mode I am trying to escape. I would
rather see something arguable than something safe.

## The product in one paragraph

**CivicPulse** — Smart City Infrastructure Analysis. A planner drops in a
GeoJSON file; the system measures every building's distance to the nearest
health facility, school, water main and storm drain, compares those against
published Indian norms, clusters the premises that fall outside into gap
zones, scores each gap for severity, and proposes intervention sites. It then
has to persuade a municipal committee that the recommendation is sound.

Users: a city engineer who will act on it this week, a planning officer
preparing a budget case, and a committee that will contest it.

## The idea that has to survive the redesign

This codebase does something unusually honest and the design must amplify
rather than smooth over it.

**When a layer is missing from the uploaded file, the system refuses to
compute that module.** No drainage features means no drainage score — not an
interpolation, not a greyed-out zero, not a plausible estimate. The module
locks and says why. There is a label in the sidebar that reads *"Strict
No-Assumption Engine. Unverified missing data remains locked."*

Most dashboards would quietly show something. This one declines.

**Design the locked state as a first-class thing, not an error.** It should
look deliberate and principled — the product being trustworthy, not the
product being broken. Right now it is a grey card with a warning triangle,
which reads as a failure. It is the opposite of a failure. This is the single
most distinctive thing about the product and it currently looks like a bug.

## The other three problems worth real effort

**1. A measured number and an inferred one must not look alike.**

Every figure now carries provenance: `OFFICIAL` (counted from the uploaded
file), `COMPUTED` (derived arithmetically), `ESTIMATED` (inferred, always with
an interval), `SAMPLE` (from the built-in demo dataset, never the user's data).

Population is the sharp case. A GeoJSON contains buildings, not people, so any
population figure is inferred — currently "33 people" from "6 buildings × 5.5".
That number must never carry the same visual weight as "6 buildings", which
was counted.

Build a **typographic and material grammar for confidence**. Weight, edge,
texture, whether a figure is permitted to look crisp. A counted integer can be
sharp; an inferred one probably should not be allowed to be.

**2. Distance is the whole subject, and the map treats it as decoration.**

The analysis is entirely about how far a person walks: 1.0 km to a primary
school under the RTE Act, 1.5 km to a health facility, 250 m to a water main.
A gap is "6 buildings, the furthest 4.4 km from any school".

The map draws catchment circles. Circles are not how anyone experiences
distance. **Find a way to make 4.4 km feel like 4.4 km** — to a parent walking
a child to school, to someone carrying water. Isochrones, cost surfaces,
something with texture that thins as it reaches outward. The gap zone should
read as *reach failing*, not as a red blob.

**3. The proposed site is the moment of consequence.**

The system suggests where to build. That is the output the whole product
exists for, and it is currently a pin on a map and a line of text.

A planner needs to see what a site *fixes* — which buildings come inside the
norm, which remain outside, what it costs, who it still misses. Make that
legible, and ideally make it **interactive: drag the proposed site and watch
coverage change.** The honest version shows what the intervention does not
solve as plainly as what it does.

## Also worth designing

- **Severity 0–10** combines two things: how far past the norm the shortfall
  runs, and how many premises it affects. A 200 m deficit over four houses and
  a 3 km deficit over two hundred are different problems that currently share
  a number. Consider showing the two components rather than their sum.
- **Four screens exist and three are weak**: upload, dashboard, issues table,
  recommendations. The upload screen is the first thing anyone sees and does
  nothing but accept a file — it could be doing the work of explaining what
  the system is about to do.
- **A report gets printed and carried into a committee room.** Design that
  artefact. It matters more than the screen and nobody has designed it.

## Constraints

React 19, Vite, Tailwind v4, Leaflet, Chart.js. Light theme. Desktop-first,
but a field engineer will open it on a phone standing in the place being
analysed. Must print legibly in greyscale for the committee.

Indian municipal context. Norms cited on screen are real: RTE Act 2009, IPHS
2022, Jal Jeevan Mission, Swachh Bharat Mission. **Keep the citations
visible** — they are what makes a threshold defensible rather than arbitrary,
and a planner being questioned needs to point at one.

## What I do not want

A dark command centre. Neon on black. Glassmorphism. Animated counters.
Gradient cards. Anything that makes a water shortage look like a stock ticker.

The register should be closer to a well-made public document — a survey sheet,
a census atlas, a transit map — than to a SaaS analytics product. But restraint
is not blandness: I want a real typographic position, a palette somebody chose
and can defend, and the sense that one person with a point of view made this.

## Deliverables

1. Visual system: type scale, palette with reasoning, grid, the provenance
   grammar, and how it survives greyscale printing.
2. High-fidelity designs: **the dashboard** (map + modules + issues),
   **a single gap zone in detail** with its proposed intervention, and
   **the upload screen** reimagined. Plus the dashboard at phone width.
3. **The locked state** — a module the system is refusing to compute, designed
   so it reads as integrity rather than breakage.
4. The printed committee report.
5. One page defending your decisions, particularly the provenance grammar and
   how you made distance felt.

## Current data shapes

```jsonc
// a detected gap
{ "id": "EDUCATION-1", "category": "Education",
  "problem": "6 buildings lie beyond the RTE 1 km neighbourhood-school distance; the furthest is 4.4 km.",
  "location": "Northern eastern cluster, 250 m radius",
  "severity": 8.2, "priority": "HIGH", "coordinates": [19.108, 72.913],
  "affectedBuildings": 6,        // counted
  "affectedPopulation": 33,      // ESTIMATED, 4.0-8.0 people per building
  "metrics": { "worstDistanceKm": 4.4, "normKm": 1.0,
               "citation": "Right to Education Act 2009" },
  "evidence": "6 of 25 buildings lie beyond 1 km of the nearest education feature in this file." }

// a module, when the layer exists
{ "available": true, "coverage": 0.56, "facilities": 1,
  "buildingsServed": 14, "buildingsUnderserved": 11,
  "norm": { "radiusKm": 1.0, "label": "primary school within 1 km",
            "citation": "Right to Education Act 2009" } }

// a module, when it does not
{ "available": false,
  "reason": "No drainage features in this file — coverage cannot be computed, and is not assumed." }
```

---

**One last thing.** The easy version of this is a tidy grey dashboard with
good spacing and a nice map. I am not interested in that. The version worth
building makes an engineer look at a locked module and understand that the
system is refusing to lie to them — and then look at a gap zone and feel the
four kilometres a child walks to school.
