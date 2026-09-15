import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  RotateCcw,
  MapPin,
  HeartPulse,
  GraduationCap,
  Droplets,
  Waves,
  Zap,
  Building,
  Navigation,
  AlertOctagon,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';

export default function InteractiveMap({
  dataset,
  mapGapZones,
  mapInterventions,
  powerAvailable,
  focusedLocation,
  onClearFocus
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupsRef = useRef({});
  const markersRef = useRef({});

  // Layer Visibility
  const [layersVisibility, setLayersVisibility] = useState({
    roads: true,
    buildings: true,
    water: true,
    drainage: true,
    healthcare: true,
    education: true,
    gaps: true,
    interventions: true,
    power: powerAvailable
  });

  const [activeLegend, setActiveLegend] = useState(true);
  const [activeLayerPanel, setActiveLayerPanel] = useState(false);

  useEffect(() => {
    setLayersVisibility((prev) => ({
      ...prev,
      power: powerAvailable
    }));
  }, [powerAvailable]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [30.342, 76.388],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // Free, no-key OpenStreetMap tiles, recolored to a calm dark map via
    // CSS filter on .leaflet-tile-pane (see index.css) — CARTO's basemap CDN
    // now requires a paid API key and was rendering "API KEY REQUIRED" tiles.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abc',
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    layerGroupsRef.current = {
      roads: L.layerGroup().addTo(map),
      buildings: L.layerGroup().addTo(map),
      water: L.layerGroup().addTo(map),
      drainage: L.layerGroup().addTo(map),
      healthcare: L.layerGroup().addTo(map),
      education: L.layerGroup().addTo(map),
      gaps: L.layerGroup().addTo(map),
      interventions: L.layerGroup().addTo(map),
      power: L.layerGroup().addTo(map)
    };

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const createCustomIcon = (bgColor, borderColor, svgIconHtml) => {
    return L.divIcon({
      className: 'custom-ioc-marker',
      html: `
        <div style="
          background: ${bgColor};
          border: 1.5px solid ${borderColor};
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.7);
          color: #ffffff;
        ">
          ${svgIconHtml}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16]
    });
  };

  // Render Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(layerGroupsRef.current).forEach((grp) => grp.clearLayers());
    markersRef.current = {};

    const features = dataset?.geoJson?.features || [];

    features.forEach((f) => {
      const p = f.properties || {};
      const cat = (p.category || '').toLowerCase();
      const amenity = (p.amenity || '').toLowerCase();
      const geom = f.geometry;

      if (!geom) return;

      // Roads
      if (cat === 'road' && geom.type === 'LineString') {
        const latLngs = geom.coordinates.map((c) => [c[1], c[0]]);
        const color = p.type === 'primary' ? '#38bdf8' : '#737373';
        const weight = p.type === 'primary' ? 3.5 : 1.8;

        const line = L.polyline(latLngs, { color, weight, opacity: 0.85 });
        line.bindPopup(`
          <div class="p-2.5 font-mono text-xs">
            <span class="text-[9px] font-bold text-sky-600 block uppercase">ROAD CORRIDOR</span>
            <h4 class="font-bold text-neutral-900 text-xs">${p.name}</h4>
            <div class="text-[11px] text-neutral-500 mt-1 space-y-0.5">
              <p>Type: <span class="text-neutral-700">${p.type}</span></p>
              <p>Lanes: <span class="text-neutral-700">${p.lanes || 2}</span></p>
              <p>Design Speed: <span class="text-neutral-700">${p.speedLimit || 40} km/h</span></p>
            </div>
          </div>
        `);
        line.addTo(layerGroupsRef.current.roads);
      }

      // Water Supply
      if (cat === 'water' && geom.type === 'LineString') {
        const latLngs = geom.coordinates.map((c) => [c[1], c[0]]);
        const line = L.polyline(latLngs, {
          color: '#06b6d4',
          weight: 3,
          dashArray: '5, 5',
          opacity: 0.9
        });
        line.bindPopup(`
          <div class="p-2.5 font-mono text-xs">
            <span class="text-[9px] font-bold text-cyan-600 block uppercase">WATER SUPPLY TRUNK</span>
            <h4 class="font-bold text-neutral-900 text-xs">${p.name}</h4>
            <div class="text-[11px] text-neutral-500 mt-1 space-y-0.5">
              <p>Diameter: <span class="text-neutral-700">${p.diameterMm} mm</span></p>
              <p>Operating Pressure: <span class="text-neutral-700">${p.pressureBar} bar</span></p>
              <p>Flow Status: <span class="text-emerald-600 font-bold">Pressurized</span></p>
            </div>
          </div>
        `);
        line.addTo(layerGroupsRef.current.water);
      }

      // Drainage Network
      if (cat === 'drainage' && geom.type === 'LineString') {
        const latLngs = geom.coordinates.map((c) => [c[1], c[0]]);
        const line = L.polyline(latLngs, { color: '#3b82f6', weight: 3.5, opacity: 0.85 });
        line.bindPopup(`
          <div class="p-2.5 font-mono text-xs">
            <span class="text-[9px] font-bold text-blue-600 block uppercase">STORMWATER CONDUIT</span>
            <h4 class="font-bold text-neutral-900 text-xs">${p.name}</h4>
            <div class="text-[11px] text-neutral-500 mt-1 space-y-0.5">
              <p>Width: <span class="text-neutral-700">${p.widthM} m</span></p>
              <p>Channel: <span class="text-neutral-700">${p.type}</span></p>
              <p>Maintenance: <span class="text-amber-700">${p.maintenance}</span></p>
            </div>
          </div>
        `);
        line.addTo(layerGroupsRef.current.drainage);
      }

      // Healthcare
      if (cat === 'healthcare' && geom.type === 'Point') {
        const latLng = [geom.coordinates[1], geom.coordinates[0]];
        const isHospital = amenity === 'hospital';

        L.circle(latLng, {
          radius: (p.catchmentRadiusKm || 1.5) * 1000,
          color: '#f43f5e',
          fillColor: '#f43f5e',
          fillOpacity: 0.07,
          weight: 1,
          dashArray: '3, 4'
        }).addTo(layerGroupsRef.current.healthcare);

        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`;
        const marker = L.marker(latLng, {
          icon: createCustomIcon(isHospital ? '#e11d48' : '#be123c', '#fda4af', iconSvg)
        });

        marker.bindPopup(`
          <div class="p-2.5 font-mono text-xs">
            <span class="text-[9px] font-bold text-rose-600 block uppercase">${isHospital ? 'GENERAL HOSPITAL' : 'COMMUNITY CLINIC'}</span>
            <h4 class="font-bold text-neutral-900 text-xs">${p.name}</h4>
            <div class="text-[11px] text-neutral-500 mt-1 space-y-0.5">
              <p>Sector: <span class="text-neutral-700">${p.sector || 'Urban Core'}</span></p>
              <p>Bed Capacity: <span class="text-neutral-700">${p.beds} beds</span></p>
              <p>Catchment Buffer: <span class="text-rose-700 font-bold">${p.catchmentRadiusKm} km</span></p>
            </div>
          </div>
        `);
        marker.addTo(layerGroupsRef.current.healthcare);
      }

      // Education
      if (cat === 'education' && geom.type === 'Point') {
        const latLng = [geom.coordinates[1], geom.coordinates[0]];
        const isCollege = amenity === 'college';

        L.circle(latLng, {
          radius: (p.catchmentRadiusKm || 1.2) * 1000,
          color: '#818cf8',
          fillColor: '#818cf8',
          fillOpacity: 0.07,
          weight: 1,
          dashArray: '3, 4'
        }).addTo(layerGroupsRef.current.education);

        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>`;
        const marker = L.marker(latLng, {
          icon: createCustomIcon(isCollege ? '#4338ca' : '#4f46e5', '#c7d2fe', iconSvg)
        });

        marker.bindPopup(`
          <div class="p-2.5 font-mono text-xs">
            <span class="text-[9px] font-bold text-indigo-600 block uppercase">${isCollege ? 'COLLEGE / TERTIARY' : 'MODEL SCHOOL'}</span>
            <h4 class="font-bold text-neutral-900 text-xs">${p.name}</h4>
            <div class="text-[11px] text-neutral-500 mt-1 space-y-0.5">
              <p>Levels: <span class="text-neutral-700">${p.gradeLevels}</span></p>
              <p>Capacity: <span class="text-neutral-700">${p.capacity} students</span></p>
              <p>Buffer: <span class="text-indigo-700 font-bold">${p.catchmentRadiusKm} km</span></p>
            </div>
          </div>
        `);
        marker.addTo(layerGroupsRef.current.education);
      }

      // Buildings
      if (cat === 'building' && geom.type === 'Polygon') {
        const latLngs = geom.coordinates[0].map((c) => [c[1], c[0]]);
        const poly = L.polygon(latLngs, {
          color: '#f59e0b',
          fillColor: '#d97706',
          fillOpacity: 0.2,
          weight: 1.2
        });

        poly.bindPopup(`
          <div class="p-2.5 font-mono text-xs">
            <span class="text-[9px] font-bold text-amber-600 block uppercase">BUILDING FOOTPRINT CLUSTER</span>
            <h4 class="font-bold text-neutral-900 text-xs">${p.name}</h4>
            <div class="text-[11px] text-neutral-500 mt-1 space-y-0.5">
              <p>Classification: <span class="text-neutral-700">${p.type}</span></p>
              <p>Population: <span class="text-neutral-700">${p.estimatedPopulation?.toLocaleString()}</span></p>
              <p>Units: <span class="text-neutral-700">${p.buildingUnits}</span></p>
            </div>
          </div>
        `);
        poly.addTo(layerGroupsRef.current.buildings);
      }
    });

    // Gap Zones
    mapGapZones.forEach((gap) => {
      const circle = L.circle(gap.coordinates, {
        radius: gap.radiusMeters,
        color: gap.color,
        fillColor: gap.fillColor,
        fillOpacity: 0.3,
        weight: 1.8,
        dashArray: '4, 4'
      });

      circle.bindPopup(`
        <div class="p-2.5 font-mono text-xs">
          <span class="text-[9px] font-bold text-rose-600 block uppercase">GAP ZONE DETECTED</span>
          <h4 class="font-bold text-neutral-900 text-xs">${gap.name}</h4>
          <p class="text-[11px] text-neutral-600 mt-1">${gap.description}</p>
          <div class="mt-2 pt-1 border-t border-neutral-200 flex justify-between text-[10px]">
            <span class="text-neutral-500">Severity:</span>
            <span class="font-bold text-rose-600">${gap.severity}/10 (${gap.priority})</span>
          </div>
        </div>
      `);
      circle.addTo(layerGroupsRef.current.gaps);
      markersRef.current[gap.id] = circle;
    });

    // Proposed Interventions
    mapInterventions.forEach((intv) => {
      const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      const marker = L.marker(intv.coordinates, {
        icon: createCustomIcon('#059669', '#34d399', starSvg)
      });

      marker.bindPopup(`
        <div class="p-2.5 font-mono text-xs">
          <span class="text-[9px] font-bold text-emerald-600 block uppercase">PROPOSED CAPITAL INTERVENTION</span>
          <h4 class="font-bold text-neutral-900 text-xs">${intv.name}</h4>
          <p class="text-[11px] text-neutral-600 mt-1">${intv.details}</p>
        </div>
      `);
      marker.addTo(layerGroupsRef.current.interventions);
      markersRef.current[intv.id] = marker;
    });

    // Power Outage Nodes (if powerAvailable is true)
    if (powerAvailable) {
      const powerHotspots = [
        { id: 'pwr-1', name: 'Grid Feeder 14 Substation', coords: [30.341, 76.398], freq: '5 incidents / month' },
        { id: 'pwr-2', name: 'Industrial Sector Feeder', coords: [30.350, 76.415], freq: '8 incidents / month' }
      ];

      powerHotspots.forEach((pwr) => {
        const zapSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
        const marker = L.marker(pwr.coords, {
          icon: createCustomIcon('#d97706', '#fde047', zapSvg)
        });
        marker.bindPopup(`
          <div class="p-2.5 font-mono text-xs">
            <span class="text-[9px] font-bold text-amber-600 block uppercase">POWER TELEMETRY FEED</span>
            <h4 class="font-bold text-neutral-900 text-xs">${pwr.name}</h4>
            <p class="text-[11px] text-neutral-500 mt-1">Outage Rate: <span class="text-amber-700 font-bold">${pwr.freq}</span></p>
          </div>
        `);
        marker.addTo(layerGroupsRef.current.power);
      });
    }
  }, [dataset, mapGapZones, mapInterventions, powerAvailable]);

  // Sync Layer Visibility
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.entries(layersVisibility).forEach(([layerKey, isVisible]) => {
      const group = layerGroupsRef.current[layerKey];
      if (!group) return;

      if (isVisible) {
        if (!map.hasLayer(group)) map.addLayer(group);
      } else {
        if (map.hasLayer(group)) map.removeLayer(group);
      }
    });
  }, [layersVisibility]);

  // FlyTo handler on focusedLocation
  useEffect(() => {
    if (!focusedLocation || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const { coordinates, title, details, severity, priority } = focusedLocation;

    map.flyTo(coordinates, 15, { duration: 1.2 });

    const highlightPulse = L.circle(coordinates, {
      radius: 400,
      color: '#f43f5e',
      fillColor: '#f43f5e',
      fillOpacity: 0.4,
      weight: 2
    }).addTo(map);

    L.popup({ autoClose: false, closeOnClick: true })
      .setLatLng(coordinates)
      .setContent(`
        <div class="p-2.5 font-mono text-xs max-w-[260px]">
          <span class="text-[9px] font-bold uppercase text-rose-600 block">TARGETED GAP ZONE</span>
          <h4 class="font-bold text-neutral-900 text-xs">${title}</h4>
          <p class="text-[11px] text-neutral-600 mt-1">${details || ''}</p>
          <div class="mt-2 pt-1 border-t border-neutral-200 flex justify-between text-[10px]">
            <span class="text-neutral-500">Severity:</span>
            <span class="font-bold text-rose-600">${severity ? `${severity}/10` : 'HIGH'} (${priority || 'HIGH'})</span>
          </div>
        </div>
      `)
      .openOn(map);

    const timer = setTimeout(() => {
      if (map.hasLayer(highlightPulse)) map.removeLayer(highlightPulse);
    }, 8000);

    return () => {
      clearTimeout(timer);
      if (map.hasLayer(highlightPulse)) map.removeLayer(highlightPulse);
    };
  }, [focusedLocation]);

  const toggleLayer = (key) => {
    setLayersVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([30.342, 76.388], 13, { duration: 1.0 });
      if (onClearFocus) onClearFocus();
    }
  };

  return (
    <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm relative flex flex-col h-[520px] lg:h-[580px]">
      {/* Top Console Bar */}
      <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 flex items-center justify-between z-20 shrink-0 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="font-bold uppercase tracking-wider text-neutral-700">
            Spatial GIS & Gap Zones Viewer
          </span>
          <span className="hidden sm:inline text-neutral-300">|</span>
          <span className="hidden sm:inline text-neutral-500 text-[11px]">
            LAT: 30.342° N &bull; LON: 76.388° E
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <button
            onClick={() => setActiveLayerPanel(!activeLayerPanel)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition-colors ${
              activeLayerPanel
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Layers ({Object.values(layersVisibility).filter(Boolean).length})</span>
          </button>

          <button
            onClick={() => setActiveLegend(!activeLegend)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition-colors ${
              activeLegend
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-neutral-200 text-neutral-400'
            }`}
          >
            <Info className="w-3 h-3" />
            <span>Legend</span>
          </button>

          <button
            onClick={resetMapView}
            className="px-2.5 py-1 rounded bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-600 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Layer Selection Panel */}
        {activeLayerPanel && (
          <div className="absolute top-3 right-3 z-[500] w-60 bg-white/95 border border-neutral-200 rounded-lg p-3 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-neutral-200 text-[10px] text-neutral-400 uppercase font-bold">
              <span>LAYER VISIBILITY</span>
              <span>TOGGLE</span>
            </div>

            <div className="space-y-1 text-[11px]">
              {[
                { key: 'roads', label: 'Road Networks', icon: Navigation, color: 'text-sky-600' },
                { key: 'buildings', label: 'Building Footprints', icon: Building, color: 'text-amber-600' },
                { key: 'water', label: 'Water Pipelines', icon: Droplets, color: 'text-cyan-600' },
                { key: 'drainage', label: 'Drainage Channels', icon: Waves, color: 'text-blue-600' },
                { key: 'healthcare', label: 'Hospitals & Clinics', icon: HeartPulse, color: 'text-rose-600' },
                { key: 'education', label: 'Schools & Colleges', icon: GraduationCap, color: 'text-indigo-600' },
                { key: 'gaps', label: 'Infrastructure Gap Zones', icon: AlertOctagon, color: 'text-rose-600' },
                { key: 'interventions', label: 'Proposed Interventions', icon: Sparkles, color: 'text-emerald-600' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <label key={item.key} className="flex items-center justify-between p-1 rounded hover:bg-neutral-50 cursor-pointer text-neutral-600">
                    <span className="flex items-center gap-2">
                      <Icon className={`w-3 h-3 ${item.color}`} />
                      <span>{item.label}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={layersVisibility[item.key]}
                      onChange={() => toggleLayer(item.key)}
                      className="rounded border-neutral-300 bg-white text-blue-600 focus:ring-0"
                    />
                  </label>
                );
              })}

              {/* Power Outages layer */}
              <label className={`flex items-center justify-between p-1 rounded text-neutral-600 ${
                powerAvailable ? 'hover:bg-neutral-50 cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}>
                <span className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>Power Telemetry</span>
                </span>
                <input
                  type="checkbox"
                  disabled={!powerAvailable}
                  checked={layersVisibility.power && powerAvailable}
                  onChange={() => toggleLayer('power')}
                  className="rounded border-neutral-300 bg-white text-blue-600 focus:ring-0"
                />
              </label>
              {!powerAvailable && (
                <span className="text-[9px] text-amber-600/90 block px-1 italic">
                  * Locked (Telemetry omitted in GeoJSON)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        {activeLegend && (
          <div className="absolute bottom-3 left-3 z-[500] bg-white/95 border border-neutral-200 rounded-lg p-2.5 shadow-xl font-mono text-[10px] text-neutral-600 max-w-xs">
            <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-neutral-200">
              <span className="font-bold text-neutral-400 uppercase">GIS LEGEND</span>
              <button onClick={() => setActiveLegend(false)} className="text-neutral-400 hover:text-neutral-900">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 shrink-0"></span>
                <span>Hospital/Clinic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500 shrink-0"></span>
                <span>School/College</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-cyan-400 border-dashed shrink-0"></span>
                <span>Water Main</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-500 shrink-0"></span>
                <span>Storm Drain</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0"></span>
                <span>Proposed Site</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/40 border border-rose-500 shrink-0"></span>
                <span className="text-rose-600">Gap Zone</span>
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-2 right-2 z-[400] bg-white/80 px-2 py-0.5 rounded border border-neutral-200 text-[9px] font-mono text-neutral-500">
          SCALE 1:25,000 &bull; CARTO DARK
        </div>
      </div>
    </section>
  );
}
