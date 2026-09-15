import React from 'react';
import {
  X,
  Printer,
  Download,
  Building2,
  FileCheck2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

export default function ReportModal({
  isOpen,
  onClose,
  datasetName,
  dataAvailability,
  issues,
  recommendations,
  powerAvailable
}) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      title: 'Smart City Infrastructure Analysis & Recommendation Report',
      studyArea: datasetName,
      generatedAt: new Date().toISOString(),
      methodology: 'Strict Empirical Spatial Proximity Modeling (Zero Assumption Policy)',
      dataAvailability,
      summary: {
        totalIssues: issues.length,
        highPriority: issues.filter(i => i.priority === 'HIGH').length,
        mediumPriority: issues.filter(i => i.priority === 'MEDIUM').length,
        lowPriority: issues.filter(i => i.priority === 'LOW').length,
        recommendationsCount: recommendations.length
      },
      detectedIssues: issues,
      recommendations: recommendations
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Smart_City_Infrastructure_Audit_${datasetName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-neutral-900">
              Official Municipal Infrastructure Audit Report
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-500" />
              <span>Print Report</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-neutral-700 text-xs leading-relaxed">
          {/* Executive Summary Card */}
          <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-3 gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  MUNICIPAL PLANNING DIRECTORATE
                </span>
                <h2 className="text-lg font-bold text-neutral-900 mt-0.5">
                  Spatial Decision-Support Audit: {datasetName}
                </h2>
              </div>
              <div className="text-right text-[11px] text-neutral-500">
                <p>Audit Date: September 2026</p>
                <p>Engine Standard: ISO 37120 Smart Cities</p>
              </div>
            </div>

            <p className="text-neutral-600 text-xs leading-relaxed">
              This spatial infrastructure evaluation combines multi-criteria GIS distance modeling, public service catchment buffers, and building density analysis to formulate prioritized capital recommendations.
            </p>

            {/* Strict Integrity Warning */}
            {!powerAvailable && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Data Integrity Notice: </strong>
                  Electrical grid and outage telemetry was omitted in the source GeoJSON. In strict adherence to municipal standards, power outage gap analysis was not assumed or estimated.
                </div>
              </div>
            )}
          </div>

          {/* Audit Metrics Breakdown */}
          <div>
            <h4 className="font-bold text-neutral-900 uppercase text-[11px] tracking-wider mb-2">
              Key Audit Metrics Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Total Deficits</span>
                <span className="text-xl font-extrabold text-neutral-900 mt-1 block">{issues.length}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-[10px] uppercase text-rose-600 block font-semibold">High Priority</span>
                <span className="text-xl font-extrabold text-rose-600 mt-1 block">
                  {issues.filter(i => i.priority === 'HIGH').length}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-[10px] uppercase text-amber-600 block font-semibold">Medium Priority</span>
                <span className="text-xl font-extrabold text-amber-600 mt-1 block">
                  {issues.filter(i => i.priority === 'MEDIUM').length}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-[10px] uppercase text-emerald-600 block font-semibold">Proposed Projects</span>
                <span className="text-xl font-extrabold text-emerald-600 mt-1 block">{recommendations.length}</span>
              </div>
            </div>
          </div>

          {/* Top Priority Recommendations */}
          <div>
            <h4 className="font-bold text-neutral-900 uppercase text-[11px] tracking-wider mb-2">
              Prioritized Capital Improvement Interventions
            </h4>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={rec.id} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 text-xs">
                      #{i + 1} {rec.problemDetected} ({rec.location})
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Severity {rec.severityScore}/10 • {rec.priority}
                    </span>
                  </div>
                  <p className="text-neutral-600 text-[11px]">{rec.reason}</p>
                  <p className="text-neutral-600 text-[11px] font-medium">
                    Action: {rec.suggestedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Smart City Infrastructure Analysis & Recommendation Platform</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 font-semibold"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
