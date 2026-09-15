import React from 'react';
import {
  Lightbulb,
  MapPin,
  ArrowRight,
  HeartPulse,
  Droplets,
  GraduationCap,
  Zap,
  Sparkles,
  CheckSquare
} from 'lucide-react';

export default function RecommendationsList({
  recommendations = [],
  onFocusOnMap
}) {
  const getCategoryIcon = (category) => {
    if (category.includes('Health')) return HeartPulse;
    if (category.includes('Water') || category.includes('Drainage')) return Droplets;
    if (category.includes('Education')) return GraduationCap;
    if (category.includes('Power')) return Zap;
    return Sparkles;
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'HIGH':
        return {
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          borderAccent: 'border-l-4 border-l-rose-500'
        };
      case 'MEDIUM':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          borderAccent: 'border-l-4 border-l-amber-500'
        };
      default:
        return {
          badge: 'bg-sky-50 text-sky-700 border-sky-200',
          borderAccent: 'border-l-4 border-l-sky-500'
        };
    }
  };

  return (
    <section id="recommendations-section" className="space-y-3 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <h3 className="font-bold uppercase tracking-wider text-neutral-800">
            Actionable Infrastructure Recommendations
          </h3>
          <span className="text-[10px] text-neutral-400">
            ({recommendations.length} Proposals Generated)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.map((rec) => {
          const Icon = getCategoryIcon(rec.category);
          const prioStyle = getPriorityStyle(rec.priority);

          return (
            <div
              key={rec.id}
              className={`bg-white border border-neutral-200 shadow-sm ${prioStyle.borderAccent} rounded-xl p-3.5 flex flex-col justify-between`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-xs font-bold text-neutral-700 uppercase">{rec.category}</span>
                  </div>

                  <span className={`px-2 py-0.2 rounded text-[9px] font-bold border ${prioStyle.badge}`}>
                    {rec.priority === 'HIGH' ? '🔴 HIGH' : rec.priority === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW'}
                  </span>
                </div>

                {/* Problem Detected */}
                <div className="font-sans">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block font-mono">
                    PROBLEM DETECTED
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 mt-0.5 leading-snug">
                    {rec.problemDetected}
                  </h4>
                </div>

                {/* Location */}
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-600 bg-neutral-50 p-1.5 rounded border border-neutral-200">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="truncate">{rec.location}</span>
                </div>

                {/* Reason */}
                <div className="mt-2 font-sans">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block font-mono">
                    ANALYTICAL REASON
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed bg-neutral-50 p-2 rounded border border-neutral-200">
                    {rec.reason}
                  </p>
                </div>

                {/* Severity Score Meter */}
                <div className="mt-2.5 flex items-center justify-between text-xs bg-neutral-50 p-1.5 rounded border border-neutral-200">
                  <span className="text-neutral-400 text-[10px]">SEVERITY SCORE:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-14 bg-neutral-200 rounded h-1.5 overflow-hidden border border-neutral-200">
                      <div
                        className={`h-full ${rec.severityScore >= 7.5 ? 'bg-rose-500' : 'bg-amber-500'}`}
                        style={{ width: `${(rec.severityScore / 10) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-rose-600 text-xs">{rec.severityScore} / 10</span>
                  </div>
                </div>

                {/* Suggested Action */}
                <div className="mt-2.5 p-2 rounded bg-neutral-50 border border-neutral-200 font-sans">
                  <span className="text-[9px] text-neutral-500 font-mono font-bold uppercase block mb-0.5">
                    SUGGESTED ACTION:
                  </span>
                  <p className="text-[11px] text-neutral-700 leading-snug">
                    {rec.suggestedAction}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3 pt-2.5 border-t border-neutral-100">
                <button
                  onClick={() => {
                    const mapEl = document.getElementById('interactive-map-section');
                    if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
                    onFocusOnMap(
                      rec.coordinates,
                      rec.problemDetected,
                      `${rec.location} • Action: ${rec.suggestedAction}`,
                      rec.category,
                      rec.severityScore,
                      rec.priority
                    );
                  }}
                  className="w-full py-1.5 px-3 rounded bg-neutral-100 hover:bg-blue-600 hover:text-white border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500 group-hover:text-white" />
                  <span>View on Map</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
