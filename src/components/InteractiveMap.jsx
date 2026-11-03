import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { classifyFeature } from '../utils/geoJsonAnalyzer';
import { detectRegion, reverseGeocode } from '../utils/regionDetector';
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
  Maximize2,
  Crosshair
} from 'lucide-react';

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const svg = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

// How each classified layer is drawn, and how it is named in popups.
const LAYER_STYLES = {
  roads: { label: 'ROAD / TRANSPORT', color: '#38bdf8', fill: '#38bdf8', fillOpacity: 0.1, weight: 2.5, text: 'text-sky-600', bg: '#0284c7', border: '#7dd3fc', svg: svg('<path d="M3 11l19-9-9 19-2-8-8-2z"/>') },
  buildings: { label: 'BUILDING / FOOTPRINT', color: '#f59e0b', fill: '#d97706', fillOpacity: 0.25, weight: 1.2, text: 'text-amber-600', bg: '#d97706', border: '#fcd34d', svg: svg('<rect x="4" y="2" width="16" height="20"/><path d="M9 22v-4h6v4"/>') },
  water: { label: 'WATER NETWORK', color: '#06b6d4', fill: '#06b6d4', fillOpacity: 0.15, weight: 3, dash: '5, 5', text: 'text-cyan-600', bg: '#0891b2', border: '#67e8f9', svg: svg('<path d="M12 2.7l5.7 5.7a8 8 0 1 1-11.4 0z"/>') },
  drainage: { label: 'DRAINAGE NETWORK', color: '#3b82f6', fill: '#3b82f6', fillOpacity: 0.15, weight: 3.5, text: 'text-blue-600', bg: '#2563eb', border: '#93c5fd', svg: svg('<path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>') },
  healthcare: { label: 'HEALTHCARE FACILITY', color: '#f43f5e', fill: '#f43f5e', fillOpacity: 0.3, weight: 2, text: 'text-rose-600', bg: '#e11d48', border: '#fda4af', svg: svg('<path d="M12 5v14"/><path d="M5 12h14"/>') },
  education: { label: 'EDUCATION FACILITY', color: '#818cf8', fill: '#818cf8', fillOpacity: 0.3, weight: 2, text: 'text-indigo-600', bg: '#4f46e5', border: '#c7d2fe', svg: svg('<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>') },
  power: { label: 'POWER / ELECTRICAL', color: '#eab308', fill: '#eab308', fillOpacity: 0.25, weight: 2.5, text: 'text-amber-600', bg: '#d97706', border: '#fde047', svg: svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>') },
  other: { label: 'UNCLASSIFIED FEATURE', color: '#a3a3a3', fill: '#a3a3a3', fillOpacity: 0.2, weight: 2, text: 'text-neutral-500', bg: '#737373', border: '#d4d4d4', svg: svg('<circle cx="12" cy="12" r="4"/>') }
};

// Popup shows the feature's own properties, exactly as stored in the file.
function buildPopup(style, props, geomType) {
  const title = props.name || props.title || props['name:en'] || props.id || style.label;
  const rows = Object.entries(props)
    .filter(([k]) => k !== 'name')
    .slice(0, 14)
    .map(([k, v]) => {
      const val = typeof v === 'object' && v !== null ? JSON.stringify(v) : v;
      return `<p>${esc(k)}: <span class="text-neutral-700">${esc(val)}</span></p>`;
    })
    .join('');
  return `
    <div class="p-2.5 font-mono text-xs">
      <span class="text-[9px] font-bold ${style.text} block uppercase">${style.label} &bull; ${esc(geomType)}</span>
      <h4 class="font-bold text-neutral-900 text-xs">${esc(title)}</h4>
      <div class="text-[11px] text-neutral-500 mt-1 space-y-0.5">${rows || '<p>No properties in file</p>'}</div>
    </div>`;
}


export default function InteractiveMap({
  dataset,
  mapGapZones,
  mapInterventions,
  focusedLocation,
  onClearFocus
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupsRef = useRef({});
  const markersRef = useRef({});
  const dataBoundsRef = useRef(null);

  const [renderStats, setRenderStats] = useState(null);
  const [place, setPlace] = useState(null);

  // Where the uploaded data actually is, and what place that is.
  const region = useMemo(() => detectRegion(dataset?.geoJson), [dataset]);
  // Only trust a looked-up name that belongs to the current region.
  const placeName = place?.region === region ? place : null;
  useEffect(() => {
    if (!region.valid) return;
    const ctrl = new AbortController();
    reverseGeocode(region.centre.lat, region.centre.lng, ctrl.signal).then((r) => {
      if (!ctrl.signal.aborted) setPlace(r ? { ...r, region } : null);
    });
    return () => ctrl.abort();
  }, [region]);

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
    power: true,
    other: true,
    extent: true
  });

  const [activeLegend, setActiveLegend] = useState(true);
  const [activeLayerPanel, setActiveLayerPanel] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 78],
      zoom: 4,
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
      power: L.layerGroup().addTo(map),
      other: L.layerGroup().addTo(map),
      extent: L.layerGroup().addTo(map)
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

  // Render Layers — every feature in the uploaded GeoJSON is drawn exactly
  // where its coordinates say, in the layer the analysis engine classified it into.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(layerGroupsRef.current).forEach((grp) => grp.clearLayers());
    markersRef.current = {};

    const features = dataset?.geoJson?.features || [];
    const stats = { rendered: 0, skipped: 0 };
    const dataBounds = L.latLngBounds([]);

    features.forEach((f) => {
      const geom = f?.geometry;
      const p = f?.properties || {};
      if (!geom || !geom.type || (!geom.coordinates && geom.type !== 'GeometryCollection')) {
        stats.skipped++;
        return;
      }

      const layerKey = classifyFeature(f) || 'other';
      const style = LAYER_STYLES[layerKey];
      const isPoint = geom.type === 'Point' || geom.type === 'MultiPoint';
      const popupHtml = buildPopup(style, p, geom.type);

      let layer;
      try {
        layer = L.geoJSON(f, {
          style: () => ({
            color: style.color,
            weight: style.weight,
            opacity: 0.9,
            fillColor: style.fill,
            fillOpacity: style.fillOpacity,
            dashArray: style.dash
          }),
          pointToLayer: (_pt, latlng) => L.marker(latlng, { icon: createCustomIcon(style.bg, style.border, style.svg) })
        });
      } catch {
        stats.skipped++;
        return;
      }

      const bounds = layer.getBounds();
      if (!bounds.isValid()) {
        stats.skipped++;
        return;
      }

      layer.bindPopup(popupHtml, { maxWidth: 300 });
      layer.addTo(layerGroupsRef.current[layerKey]);
      dataBounds.extend(bounds);
      stats.rendered++;

      // Facilities also get a service catchment ring around their location.
      if (layerKey === 'healthcare' || layerKey === 'education') {
        const radiusKm = Number(p.catchmentRadiusKm) || (layerKey === 'healthcare' ? 1.5 : 1.2);
        if (!isPoint) {
          // polygon facility: also place a marker at its centre
          L.marker(bounds.getCenter(), { icon: createCustomIcon(style.bg, style.border, style.svg) })
            .bindPopup(popupHtml, { maxWidth: 300 })
            .addTo(layerGroupsRef.current[layerKey]);
        }
        L.circle(bounds.getCenter(), {
          radius: radiusKm * 1000,
          color: style.color,
          fillColor: style.color,
          fillOpacity: 0.07,
          weight: 1,
          dashArray: '3, 4',
          interactive: false
        }).addTo(layerGroupsRef.current[layerKey]);
      }
    });

    // Outline of the data's actual extent
    if (dataBounds.isValid()) {
      L.rectangle(dataBounds, {
        color: '#2563eb',
        weight: 1.5,
        dashArray: '6, 6',
        fill: false,
        interactive: false
      }).addTo(layerGroupsRef.current.extent);
    }

    dataBoundsRef.current = dataBounds.isValid() ? dataBounds : null;
    setRenderStats({ ...stats, total: features.length });

    // Gap Zones (only present for the built-in sample analysis)
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
          <h4 class="font-bold text-neutral-900 text-xs">${esc(gap.name)}</h4>
          <p class="text-[11px] text-neutral-600 mt-1">${esc(gap.description)}</p>
          <div class="mt-2 pt-1 border-t border-neutral-200 flex justify-between text-[10px]">
            <span class="text-neutral-500">Severity:</span>
            <span class="font-bold text-rose-600">${esc(gap.severity)}/10 (${esc(gap.priority)})</span>
          </div>
        </div>
      `);
      circle.addTo(layerGroupsRef.current.gaps);
      markersRef.current[gap.id] = circle;
    });

    // Proposed Interventions
    mapInterventions.forEach((intv) => {
      const starSvg = svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>');
      const marker = L.marker(intv.coordinates, {
        icon: createCustomIcon('#059669', '#34d399', starSvg)
      });

      marker.bindPopup(`
        <div class="p-2.5 font-mono text-xs">
          <span class="text-[9px] font-bold text-emerald-600 block uppercase">PROPOSED CAPITAL INTERVENTION</span>
          <h4 class="font-bold text-neutral-900 text-xs">${esc(intv.name)}</h4>
          <p class="text-[11px] text-neutral-600 mt-1">${esc(intv.details)}</p>
        </div>
      `);
      marker.addTo(layerGroupsRef.current.interventions);
      markersRef.current[intv.id] = marker;
    });
  }, [dataset, mapGapZones, mapInterventions]);

  // Zoom to the uploaded data whenever the dataset changes
  useEffect(() => {
    fitToData();
  }, [dataset]);

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
        <div class="p-2.5 font-mono text-xs max-w-65">
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

  function fitToData() {
    const map = mapInstanceRef.current;
    const b = dataBoundsRef.current;
    if (map && b) map.fitBounds(b, { padding: [30, 30], maxZoom: 17 });
  }

  const toggleLayer = (key) => {
    setLayersVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetMapView = () => {
    if (mapInstanceRef.current) {
      fitToData();
      if (onClearFocus) onClearFocus();
    }
  };

  return (
    <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm relative flex flex-col h-130 lg:h-145">
      {/* Top Console Bar */}
      <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 flex items-center justify-between z-20 shrink-0 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="font-bold uppercase tracking-wider text-neutral-700">
            Spatial GIS & Gap Zones Viewer
          </span>
          <span className="hidden sm:inline text-neutral-300">|</span>
          <span className="hidden sm:inline text-neutral-500 text-[11px]">
            {region.valid
              ? `${placeName?.label ? placeName.label + ' • ' : ''}${region.centre.lat.toFixed(4)}°, ${region.centre.lng.toFixed(4)}°`
              : 'No valid coordinates in file'}
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

        {/* Detected region banner */}
        <div className="absolute top-3 left-3 z-500 max-w-75 bg-white/95 border border-neutral-200 rounded-lg p-2.5 shadow-xl font-mono text-[10px] text-neutral-600">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-blue-600 mb-1">
            <Crosshair className="w-3 h-3" />
            <span>Detected Region</span>
          </div>
          {region.valid ? (
            <>
              <p className="text-xs font-bold text-neutral-900 leading-tight">
                {placeName?.label || 'Locating place name…'}
              </p>
              <p className="mt-1">Centre: {region.centre.lat.toFixed(4)}°N, {region.centre.lng.toFixed(4)}°E</p>
              <p>
                Extent: {region.widthKm.toFixed(1)} × {region.heightKm.toFixed(1)} km (~{region.areaKm2.toFixed(1)} km²)
              </p>
              <p className="text-neutral-400">
                W {region.bounds.west.toFixed(4)} · E {region.bounds.east.toFixed(4)} · S {region.bounds.south.toFixed(4)} · N {region.bounds.north.toFixed(4)}
              </p>
              {renderStats && (
                <p className="mt-1 pt-1 border-t border-neutral-200">
                  Showing <b className="text-neutral-900">{renderStats.rendered}</b> of {renderStats.total} features from file
                  {renderStats.skipped > 0 && <span className="text-rose-600"> ({renderStats.skipped} without usable geometry)</span>}
                </p>
              )}
            </>
          ) : (
            <p className="text-rose-600">No valid WGS84 coordinates found, so nothing can be placed on the map.</p>
          )}
          {region.warnings.map((w) => (
            <p key={w} className="mt-1 text-amber-700">⚠ {w}</p>
          ))}
        </div>

        {/* Floating Layer Selection Panel */}
        {activeLayerPanel && (
          <div className="absolute top-3 right-3 z-500 w-60 bg-white/95 border border-neutral-200 rounded-lg p-3 shadow-xl font-mono text-xs">
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
                { key: 'power', label: 'Power / Electrical', icon: Zap, color: 'text-amber-600' },
                { key: 'other', label: 'Unclassified Features', icon: MapPin, color: 'text-neutral-500' },
                { key: 'extent', label: 'Data Extent Outline', icon: Maximize2, color: 'text-blue-600' },
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

            </div>
          </div>
        )}

        {/* Legend */}
        {activeLegend && (
          <div className="absolute bottom-3 left-3 z-500 bg-white/95 border border-neutral-200 rounded-lg p-2.5 shadow-xl font-mono text-[10px] text-neutral-600 max-w-xs">
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

        <div className="absolute bottom-2 right-2 z-400 bg-white/80 px-2 py-0.5 rounded border border-neutral-200 text-[9px] font-mono text-neutral-500">
          &copy; OpenStreetMap contributors
        </div>
      </div>
    </section>
  );
}
