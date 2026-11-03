# Smart City Infrastructure Analysis and Recommendation System

A modern, interactive decision-support web application prototype designed for municipal authorities and urban planners to evaluate spatial infrastructure distribution, detect critical service deficits, compute weighted severity scores, and generate prioritized capital improvement recommendations from GeoJSON data.

---

## 🏛️ System Overview

The application combines a high-resolution **GIS spatial mapping engine**, **empirical proximity modeling**, and **executive analytics dashboard** tailored for university demonstrations and municipal planning presentations.

### Key Architectural Workflow:
```
Upload GeoJSON ➔ Detect Available Data ➔ Run Supported Analyses ➔ Detect Infrastructure Gaps ➔ Calculate Severity ➔ Generate Recommendations ➔ Assign Priority ➔ Display Results on Map & Dashboard
```

---

## 🔒 Strict Data Integrity Principle (No Assumption Rule)

> **Core System Rule**: The system strictly analyzes only physical infrastructure layers present within the uploaded GeoJSON dataset.
> 
> If essential telemetry (such as power outages or drainage networks) is absent, the system **marks the respective analysis module as "Data Unavailable" and locks it** rather than interpolating or inventing false infrastructure.
> 
> A demo toggle (*"Simulate Power Feed"*) is provided in the top navigation bar so evaluators can inspect system behavior both when telemetry is missing and when live feeds are present.

---

## 🚀 Key Modules & Features

1. **Left Sidebar Navigation**
   - Brand logo & municipal GIS crest
   - Direct navigation to Dashboard, GeoJSON Upload, Interactive Map, Issues, Recommendations, Visuals, and History
   - Active study area indicator & senior GIS analyst profile badge

2. **Top Navigation Bar**
   - Study area selector (`Patiala Sector 4 & Central Core`, `Metropolitan Zone East`, `Greenfield Smart District Zone C`)
   - Power telemetry simulation toggle (for demo testing)
   - Notifications center with active high-priority municipal alerts
   - Instant export of Municipal Infrastructure Audit Reports (Print/PDF/JSON)

3. **GeoJSON Upload & Data Availability Check**
   - Drag-and-drop file upload zone supporting `.geojson` and `.json` files
   - Real-time layer detection cards:
     - ✓ Buildings (footprint polygons)
     - ✓ Roads (arterial & local links)
     - ✓ Healthcare Facilities (hospitals & community clinics)
     - ✓ Educational Facilities (schools & polytechnics)
     - ✓ Water Network (pressurized supply mains)
     - ✓ Drainage Network (stormwater channels & culverts)
     - ⚠ Power Outage Data (prominent warning card and locked state when telemetry is absent)

4. **Interactive GIS Map Viewer**
   - Built with Leaflet on CartoDB Positron dark basemaps
   - Multi-category layer switcher: Roads, Buildings, Water pipelines, Drainage, Healthcare (with 1.5km catchment buffers), Education (with 1.2km catchment buffers), Infrastructure Gap Zones, and Proposed Interventions
   - Clickable popups with rich municipal metrics
   - Floating legend and reset view control

5. **Summary Metrics Dashboard**
   - Total Issues Detected: **24**
   - High Priority: **6**
   - Medium Priority: **11**
   - Low Priority: **7**
   - Recommendations Generated: **18**
   - Click-to-filter interaction linking metrics to table and map

6. **Primary Infrastructure Modules**
   - 💧 **Water & Drainage**: 78.4% coverage, 3 issues detected
   - ⚡ **Power Outages**: Locked unavailable state when data is absent; full telemetry view when simulated
   - 🏥 **Healthcare Services**: 68.2% 15-min catchment, 5 potential service gaps
   - 🎓 **Education Services**: 72.1% walking radius, 4 potential service gaps
   - 🚗 Roads & 🏢 Buildings supporting infrastructure indicators

7. **Detected Issues Section**
   - Searchable and sortable table with filters for Category, Priority, and Severity
   - Columns: Category, Problem, Location, Severity Score (0-10 meter), Priority Badge, "Inspect on Map" action

8. **Prioritized Urban Recommendations**
   - Cards matching exact prompt format:
     - Category
     - Problem Detected
     - Location
     - Analytical Reason
     - Severity Score (meter)
     - Priority Badge (🔴 HIGH / 🟡 MEDIUM / 🟢 LOW)
     - Suggested Action
     - Estimated Budget & Population Impact
     - **"View on Map"** trigger (pans, zooms, and highlights zone on Leaflet)

9. **Priority Visualizations**
   - Doughnut chart: Issues by Priority
   - Bar chart: Issues by Category
   - Responsive dark-mode styling via Chart.js

10. **Analysis History & Audit Reports**
    - Archive of past sector analyses (Patiala Sector, Metro East, Greenfield District)
    - Full report export modal with JSON download and print/PDF formatting

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS v4, Custom GIS Dark UI
- **Spatial Mapping**: Leaflet
- **Data Visualizations**: Chart.js, React-ChartJS-2
- **Icons**: Lucide React

---

## 🏃 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
# or run the background server
node serve.js

# 3. Open in browser
http://localhost:5173
```

