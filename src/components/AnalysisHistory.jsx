import React from 'react';
import {
  History,
  Calendar,
  User,
  Lightbulb,
  AlertOctagon,
  ArrowRight,
  Download,
  Activity
} from 'lucide-react';

export default function AnalysisHistory({
  historyItems = [],
  onLoadSnapshot,
  onExportReport
}) {
  return (
    <section id="history-section" className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-3 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-neutral-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Municipal Analysis History & Audit Log
          </h3>
        </div>

        <button
          onClick={onExportReport}
          className="px-3 py-1 rounded bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-neutral-500" />
          <span>Export Audit Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {historyItems.map((item) => (
          <div
            key={item.id}
            className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1 text-[10px]">
                <span className="px-1.5 py-0.2 rounded bg-white text-neutral-500 border border-neutral-200">
                  {item.status}
                </span>
                <span className="text-neutral-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>
              </div>

              <h4 className="text-xs font-bold text-neutral-900 mt-1">{item.title}</h4>
              <p className="text-[10px] text-neutral-400 mt-0.5">Analyst: {item.analyst}</p>

              <div className="mt-2.5 space-y-1 text-[11px] bg-white p-2 rounded border border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Recommendations:</span>
                  <span className="font-bold text-emerald-600">{item.recommendationsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Issues Detected:</span>
                  <span className="font-bold text-rose-600">{item.issuesCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Coverage:</span>
                  <span className="font-bold text-neutral-700">{item.coverageScore}</span>
                </div>
              </div>

              <p className="text-[10px] text-neutral-400 mt-1.5 leading-tight italic">
                {item.dataCompleteness}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-neutral-200">
              <button
                onClick={() => onLoadSnapshot(item.id)}
                className="w-full py-1 px-2.5 rounded bg-white hover:bg-blue-600 hover:text-white border border-neutral-200 text-neutral-600 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <span>View Previous Analysis</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
