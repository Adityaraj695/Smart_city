import React from 'react';
import {
  Droplets,
  Zap,
  HeartPulse,
  GraduationCap,
  ArrowRight,
  Lock,
  Building,
  Navigation,
  Activity,
  AlertTriangle
} from 'lucide-react';

// Every figure on these cards is now computed from the loaded GeoJSON.
//
// They were previously literals in this file — "78.4% REACH", "3 nodes",
// "Hospitals: 1 General (Rajindra)", "Road Links: 86 segments". Those numbers
// rendered unchanged for any uploaded file, directly beneath a Data
// Availability panel that correctly reported the file's real counts. A user
// could see "Roads: 2 items" and "Road Links: 86 segments" on one screen.
//
// The locked state for a missing layer is kept exactly as it was. Refusing to
// compute a module when its data is absent, rather than interpolating, is the
// best idea in this codebase and the reason the rest of it is worth fixing.

const pct = (x) => `${(x * 100).toFixed(1)}%`;

function SampleBadge() {
  return (
    <span
      className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 font-bold"
      title="These figures belong to the built-in demo dataset, not to an uploaded file."
    >
      SAMPLE
    </span>
  );
}

function ModuleCard({
  icon: Icon,
  iconClass,
  title,
  blurb,
  module: mod,
  sampleFallback,
  isSample,
  issues,
  category,
  onFilterCategory,
  onFocusGap,
  accent
}) {
  const relevant = issues.filter((i) => i.category === category);
  const worst = relevant.reduce(
    (m, i) => (m === null || i.severity > m.severity ? i : m),
    null
  );

  // Layer absent from the file: lock the module rather than estimate it.
  if (!isSample && (!mod || !mod.available)) {
    return (
      <div className="rounded-xl p-3.5 flex flex-col justify-between border shadow-sm bg-neutral-50 border-neutral-200">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-neutral-400" />
              <h4 className="font-bold text-xs text-neutral-900">{title}</h4>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded border bg-neutral-100 text-neutral-400 border-neutral-200">
              NO DATA
            </span>
          </div>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800 leading-snug">
                {mod?.reason ||
                  `No ${title.toLowerCase()} features in this file. Coverage is not computed, and is not assumed.`}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-2.5 border-t border-neutral-100">
          <div className="text-xs text-neutral-400 mb-2">0 Issues (No Data)</div>
          <button
            disabled
            className="w-full py-1.5 px-3 rounded bg-neutral-100 border border-neutral-200 text-neutral-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed"
          >
            <Lock className="w-3 h-3" />
            <span>Analysis Unavailable</span>
          </button>
        </div>
      </div>
    );
  }

  const stats = isSample ? sampleFallback.stats : [
    { k: 'Coverage', v: pct(mod.coverage), strong: true },
    { k: 'Features mapped', v: `${mod.facilities}` },
    { k: 'Buildings served', v: `${mod.buildingsServed.toLocaleString('en-IN')}` },
    { k: 'Beyond the norm', v: `${mod.buildingsUnderserved.toLocaleString('en-IN')}`, warn: mod.buildingsUnderserved > 0 }
  ];
  const reach = isSample ? sampleFallback.reach : pct(mod.coverage);
  const norm = isSample ? sampleFallback.norm : mod.norm;

  return (
    <div className={`rounded-xl p-3.5 flex flex-col justify-between border shadow-sm bg-white ${accent}`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${iconClass}`} />
            <h4 className="font-bold text-xs text-neutral-900">{title}</h4>
          </div>
          <div className="flex items-center gap-1">
            {isSample && <SampleBadge />}
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
              {reach} REACH
            </span>
          </div>
        </div>

        <p className="text-[11px] text-neutral-500 font-sans leading-tight">{blurb}</p>

        {norm && (
          <p className="text-[10px] text-neutral-400 font-sans mt-1 leading-tight">
            Norm: {norm.label} — {norm.citation}
          </p>
        )}

        <ul className="mt-3 space-y-1.5 text-[11px] border-t border-neutral-100 pt-2.5 text-neutral-600">
          {stats.map((s) => (
            <li key={s.k} className="flex items-center justify-between">
              <span className="text-neutral-400">{s.k}:</span>
              <span
                className={
                  s.warn ? 'font-bold text-rose-600'
                    : s.strong ? 'font-bold text-neutral-700'
                      : 'text-neutral-600'
                }
              >
                {s.v}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 pt-2.5 border-t border-neutral-100">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className={`font-bold flex items-center gap-1 ${relevant.length ? 'text-rose-600' : 'text-emerald-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${relevant.length ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
            {relevant.length} {relevant.length === 1 ? 'Issue' : 'Issues'} Detected
          </span>
          {worst && (
            <span className="text-neutral-400 text-[10px]">Severity {worst.severity}</span>
          )}
        </div>

        <button
          onClick={() => {
            onFilterCategory(category);
            if (worst) {
              onFocusGap(
                worst.coordinates,
                `${worst.category} Gap`,
                worst.problem,
                worst.category,
                worst.severity,
                worst.priority
              );
            }
          }}
          disabled={!relevant.length}
          className="w-full py-1.5 px-3 rounded bg-neutral-100 hover:bg-cyan-600 hover:text-white border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:hover:bg-neutral-100 disabled:hover:text-neutral-700"
        >
          <span>View Analysis</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function AnalysisModules({
  powerAvailable,
  onFilterCategory,
  onFocusGap,
  modules = {},
  issues = [],
  counts = {},
  isSample = false
}) {
  // Water and drainage are presented as one module, as they were before;
  // whichever is worse covered drives the card.
  const waterish = [modules.water, modules.drainage].filter((m) => m && m.available);
  const waterModule = waterish.length
    ? waterish.reduce((a, b) => (a.coverage <= b.coverage ? a : b))
    : (modules.water || modules.drainage || null);

  return (
    <section className="space-y-3 font-mono">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-neutral-400" />
          <h3 className="font-bold uppercase tracking-wider text-neutral-600">
            Infrastructure Analysis Modules (Core Pillars)
          </h3>
        </div>
        <span className="text-[10px] text-neutral-400">
          {isSample
            ? 'BUILT-IN SAMPLE DATASET'
            : 'COMPUTED FROM THE UPLOADED FILE'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <ModuleCard
          icon={Droplets}
          iconClass="text-cyan-500"
          title="Water & Drainage"
          blurb="Distance from each building to the mapped supply and drainage network."
          module={waterModule}
          isSample={isSample}
          sampleFallback={{
            reach: '78.4%',
            norm: null,
            stats: [
              { k: 'Network coverage', v: '78.4%', strong: true },
              { k: 'Disconnected areas', v: '3 nodes', warn: true },
              { k: 'Potential gaps', v: 'Eastern zone' }
            ]
          }}
          issues={issues}
          category="Water & Drainage"
          onFilterCategory={onFilterCategory}
          onFocusGap={onFocusGap}
          accent="border-neutral-200"
        />

        {/* Power keeps its locked state; nothing here computes outage telemetry. */}
        <div className={`rounded-xl p-3.5 flex flex-col justify-between border shadow-sm ${
          powerAvailable ? 'bg-white border-amber-300' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${powerAvailable ? 'text-amber-500' : 'text-neutral-400'}`} />
                <h4 className="font-bold text-xs text-neutral-900">Power Outages</h4>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                powerAvailable
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-neutral-100 text-neutral-400 border-neutral-200'
              }`}>
                {powerAvailable ? 'SIMULATED FEED' : 'NO TELEMETRY'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-sans leading-tight">
              Reported blackout zones and distribution grid frequency analysis.
            </p>
            {!powerAvailable && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-amber-800 leading-snug">
                    No electrical telemetry in this GeoJSON. Analysis is disabled
                    rather than assumed.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 pt-2.5 border-t border-neutral-100">
            <div className="text-xs text-neutral-400 mb-2">
              {powerAvailable ? 'Simulated telemetry active' : '0 Issues (No Data)'}
            </div>
            <button
              disabled
              className="w-full py-1.5 px-3 rounded bg-neutral-100 border border-neutral-200 text-neutral-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Lock className="w-3 h-3" />
              <span>Analysis Unavailable (No Data)</span>
            </button>
          </div>
        </div>

        <ModuleCard
          icon={HeartPulse}
          iconClass="text-rose-500"
          title="Healthcare"
          blurb="Distance from each building to the nearest mapped health facility."
          module={modules.healthcare}
          isSample={isSample}
          sampleFallback={{
            reach: '68.2%',
            norm: null,
            stats: [
              { k: 'Accessibility', v: '68.2% (15 min)', strong: true },
              { k: 'Underserved', v: 'Northern 4B', warn: true }
            ]
          }}
          issues={issues}
          category="Healthcare"
          onFilterCategory={onFilterCategory}
          onFocusGap={onFocusGap}
          accent="border-neutral-200"
        />

        <ModuleCard
          icon={GraduationCap}
          iconClass="text-indigo-500"
          title="Education"
          blurb="Distance from each building to the nearest mapped school."
          module={modules.education}
          isSample={isSample}
          sampleFallback={{
            reach: '72.1%',
            norm: null,
            stats: [
              { k: 'Accessibility', v: '72.1%', strong: true },
              { k: 'Underserved', v: 'Eastern zone', warn: true }
            ]
          }}
          issues={issues}
          category="Education"
          onFilterCategory={onFilterCategory}
          onFocusGap={onFocusGap}
          accent="border-neutral-200"
        />
      </div>

      {/* Supporting counts, read from the same source as the availability panel
          above so the two can no longer disagree on screen. */}
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-[11px]">
        <span className="text-neutral-400 uppercase tracking-wider font-bold text-[10px]">
          Supporting features
        </span>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5 text-neutral-600">
            <Navigation className="w-3 h-3 text-neutral-400" />
            Road links: <b className="text-neutral-800">{(counts.roads ?? 0).toLocaleString('en-IN')}</b>
          </span>
          <span className="flex items-center gap-1.5 text-neutral-600">
            <Building className="w-3 h-3 text-neutral-400" />
            Buildings: <b className="text-neutral-800">{(counts.buildings ?? 0).toLocaleString('en-IN')}</b>
          </span>
        </div>
      </div>
    </section>
  );
}
