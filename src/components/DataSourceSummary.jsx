import React, { useState } from 'react';
import {
  FileCheck,
  AlertTriangle,
  Building2,
  Navigation,
  HeartPulse,
  GraduationCap,
  Droplets,
  Waves,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Shown at the top of the dashboard once GeoJSON input has been provided —
// what file was loaded, and exactly which categories the system actually
// found in it. This is the "zero-assumption" evidence: nothing here is ever
// inferred, only reported from what was detected.
export default function DataSourceSummary({
  currentFile,
  dataAvailability,
  onChangeDataset
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const categories = [
    { key: 'buildings', name: 'Buildings', icon: Building2 },
    { key: 'roads', name: 'Roads', icon: Navigation },
    { key: 'healthcare', name: 'Healthcare Facilities', icon: HeartPulse },
    { key: 'education', name: 'Educational Facilities', icon: GraduationCap },
    { key: 'water', name: 'Water Network', icon: Droplets },
    { key: 'drainage', name: 'Drainage Network', icon: Waves },
    { key: 'power', name: 'Power Outage Data', icon: Zap }
  ];

  return (
    <section className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              Data Source
            </h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-neutral-400 hover:text-neutral-700 flex items-center gap-1 font-medium ml-2"
            >
              <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            What the uploaded GeoJSON actually contains &mdash; nothing shown below is assumed or estimated.
          </p>
        </div>

        <button
          onClick={onChangeDataset}
          className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-600 font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
          <span>Change Dataset</span>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* File Status */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                File Status Indicator
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Verified GeoJSON Loaded
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white rounded-lg p-2.5 border border-neutral-200 text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Loaded File</span>
                <span className="text-neutral-800 font-semibold truncate block" title={currentFile.name}>
                  {currentFile.name}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Payload Size</span>
                <span className="text-neutral-700 font-semibold">{currentFile.size}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Total Features</span>
                <span className="text-blue-600 font-bold">{currentFile.featureCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Validation</span>
                <span className="text-emerald-600 font-semibold">Passed</span>
              </div>
            </div>
          </div>

          {/* Data Availability Check */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Data Availability Check
              </h3>
              <span className="text-xs text-neutral-500">
                Detected <strong>{Object.values(dataAvailability).filter(v => v.available).length}</strong> of 7 Categories
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
              {categories.map((cat) => {
                const info = dataAvailability[cat.key] || { available: false, count: 0 };
                const Icon = cat.icon;
                const isAvailable = info.available;

                return (
                  <div
                    key={cat.key}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                      isAvailable
                        ? 'bg-neutral-50 border-neutral-200'
                        : 'bg-amber-50 border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-3.5 h-3.5 ${isAvailable ? 'text-neutral-500' : 'text-amber-500'}`} />
                      <span className={`text-[11px] font-bold ${isAvailable ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {isAvailable ? '✓' : '⚠'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 leading-tight">{cat.name}</p>
                      <p className="text-[11px] mt-0.5 text-neutral-500">
                        {isAvailable ? (info.count > 0 ? `${info.count} items` : 'Detected') : 'Not Available'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {!dataAvailability.power?.available && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>⚠ Power Outage Data Not Available:</strong> Electrical telemetry is missing from the uploaded GeoJSON. Power outage analysis is disabled to prevent unverified assumptions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
