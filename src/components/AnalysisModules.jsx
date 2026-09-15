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
  Activity
} from 'lucide-react';

export default function AnalysisModules({
  powerAvailable,
  onFilterCategory,
  onFocusGap
}) {
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
          SPATIAL DISTANCE & BUFFER CATCHMENT MODELING
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Module 1: Water and Drainage */}
        <div className="bg-white border border-neutral-200 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-600" />
                <h4 className="font-bold text-xs text-neutral-900">Water & Drainage</h4>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                78.4% REACH
              </span>
            </div>

            <p className="text-[11px] text-neutral-500 font-sans leading-tight">
              Hydraulic pipeline pressure & stormwater drainage capacity analysis.
            </p>

            <ul className="mt-3 space-y-1.5 text-[11px] border-t border-neutral-100 pt-2.5 text-neutral-600">
              <li className="flex items-center justify-between">
                <span className="text-neutral-400">Network coverage:</span>
                <span className="font-bold text-neutral-700">78.4%</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-neutral-400">Disconnected areas:</span>
                <span className="font-bold text-rose-600">3 nodes</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-neutral-400">Potential drainage gaps:</span>
                <span className="font-bold text-amber-600">Eastern zone</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-neutral-400">Dense area coverage:</span>
                <span className="text-neutral-600">Deficit buffer</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-2.5 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                3 Issues Detected
              </span>
              <span className="text-neutral-400 text-[10px]">Severity 7.8</span>
            </div>

            <button
              onClick={() => {
                onFilterCategory('Water & Drainage');
                onFocusGap([30.334, 76.411], 'Water & Drainage Gap', 'Eastern Mixed Dense Quarter lacks storm drainage coverage.', 'Water & Drainage', 7.8, 'HIGH');
              }}
              className="w-full py-1.5 px-3 rounded bg-neutral-100 hover:bg-cyan-600 hover:text-white border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Analysis</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Module 2: Power Outages */}
        <div className={`rounded-xl p-3.5 flex flex-col justify-between border shadow-sm ${
          powerAvailable
            ? 'bg-white border-amber-300'
            : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${powerAvailable ? 'text-amber-500' : 'text-neutral-400'}`} />
                <h4 className="font-bold text-xs text-neutral-900">Power Outages</h4>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border ${
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

            {powerAvailable ? (
              <ul className="mt-3 space-y-1.5 text-[11px] border-t border-neutral-100 pt-2.5 text-neutral-600">
                <li className="flex items-center justify-between">
                  <span className="text-neutral-400">Reported outage zones:</span>
                  <span className="font-bold text-amber-600">2 sectors</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-400">Frequent outage areas:</span>
                  <span className="text-neutral-700">Feeder 14</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-400">Outage frequency:</span>
                  <span className="font-bold text-rose-600">5.4h / wk</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-400">Grid telemetry:</span>
                  <span className="text-emerald-600 font-bold">Active</span>
                </li>
              </ul>
            ) : (
              <div className="mt-3 p-2 rounded bg-white border border-neutral-200 text-[11px] space-y-1">
                <div className="flex items-center gap-1 text-amber-600 font-bold">
                  <Lock className="w-3 h-3" />
                  <span>Power outage data unavailable</span>
                </div>
                <p className="text-neutral-500 text-[10px] font-sans leading-tight">
                  No electrical telemetry in GeoJSON. Analysis disabled to avoid assumptions.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-2.5 border-t border-neutral-100">
            {powerAvailable ? (
              <>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    2 Problem Zones
                  </span>
                  <span className="text-neutral-400 text-[10px]">Severity 6.9</span>
                </div>
                <button
                  onClick={() => {
                    onFilterCategory('Power');
                    onFocusGap([30.341, 76.398], 'Power Feeder 14 Outage Zone', 'Recurring distribution failure during peak demand.', 'Power', 6.9, 'MEDIUM');
                  }}
                  className="w-full py-1.5 px-3 rounded bg-neutral-100 hover:bg-amber-600 hover:text-white border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Analysis</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2 text-xs text-neutral-400">
                  <span>0 Issues (No Data)</span>
                  <span className="text-[10px]">Locked</span>
                </div>
                <button
                  disabled
                  className="w-full py-1.5 px-2.5 rounded bg-white border border-neutral-200 text-neutral-400 text-[11px] font-medium cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Analysis Unavailable (No Data)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Module 3: Healthcare Services */}
        <div className="bg-white border border-neutral-200 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <h4 className="font-bold text-xs text-neutral-900">Healthcare</h4>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                68.2% REACH
              </span>
            </div>

            <p className="text-[11px] text-neutral-500 font-sans leading-tight">
              Hospital catchment buffers & emergency response travel-time modeling.
            </p>

            <ul className="mt-3 space-y-1.5 text-[11px] border-t border-neutral-100 pt-2.5 text-neutral-600">
              <li className="flex items-center justify-between">
                <span className="text-neutral-400">Hospitals:</span>
                <span className="font-bold text-neutral-700">1 General (Rajindra)</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-neutral-400">Clinics & dispensaries:</span>
                <span className="font-bold text-neutral-700">2 Community</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-neutral-400">Accessibility:</span>
                <span className="text-amber-600 font-bold">68.2% (15 min)</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-neutral-400">Underserved regions:</span>
                <span className="font-bold text-rose-600">Northern 4B</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-2.5 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                5 Potential Gaps Detected
              </span>
              <span className="text-neutral-400 text-[10px]">Severity 8.5</span>
            </div>

            <button
              onClick={() => {
                onFilterCategory('Healthcare');
                onFocusGap([30.355, 76.408], 'Northern Healthcare Void', 'Northern residential zone is 3.2km from nearest hospital.', 'Healthcare', 8.5, 'HIGH');
              }}
              className="w-full py-1.5 px-3 rounded bg-neutral-100 hover:bg-rose-600 hover:text-white border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Analysis</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Module 4: Education Services */}
        <div className="bg-white border border-neutral-200 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-xs text-neutral-900">Education</h4>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                72.1% REACH
              </span>
            </div>

            <p className="text-[11px] text-neutral-500 font-sans leading-tight">
              School capacity coverage & student walking radius accessibility.
            </p>

            <ul className="mt-3 space-y-1.5 text-[11px] border-t border-neutral-100 pt-2.5 text-neutral-600">
              <li className="flex items-center justify-between">
                <span className="text-neutral-400">Schools:</span>
                <span className="font-bold text-neutral-700">3 Model Secondary</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-neutral-400">Colleges & universities:</span>
                <span className="font-bold text-neutral-700">1 Polytechnic</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-neutral-400">Accessibility:</span>
                <span className="text-neutral-700 font-bold">72.1%</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-neutral-400">Underserved regions:</span>
                <span className="font-bold text-amber-600">Eastern zone</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-2.5 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                4 Potential Gaps Detected
              </span>
              <span className="text-neutral-400 text-[10px]">Severity 6.2</span>
            </div>

            <button
              onClick={() => {
                onFilterCategory('Education');
                onFocusGap([30.347, 76.418], 'Eastern Education Void', 'Expansion zone lacks secondary school access.', 'Education', 6.2, 'MEDIUM');
              }}
              className="w-full py-1.5 px-3 rounded bg-neutral-100 hover:bg-indigo-600 hover:text-white border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Analysis</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Supporting GIS Features: Roads & Buildings */}
      <div className="bg-white p-2.5 rounded-lg border border-neutral-200 text-[11px] text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
        <span className="font-bold text-neutral-600 uppercase text-[10px]">
          Supporting Features:
        </span>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-sky-600" />
            <span>Road Links: <strong className="text-neutral-700">86 segments</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-amber-600" />
            <span>Building Clusters: <strong className="text-neutral-700">142 structural units</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}
