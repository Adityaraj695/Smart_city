import React from 'react';
import {
  UploadCloud,
  Layers,
  Cpu,
  AlertOctagon,
  Gauge,
  Lightbulb,
  Flag,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function WorkflowStepper() {
  const steps = [
    { label: 'Upload GeoJSON', icon: UploadCloud },
    { label: 'Detect Data', icon: Layers },
    { label: 'Run Analyses', icon: Cpu },
    { label: 'Detect Gaps', icon: AlertOctagon },
    { label: 'Score Severity', icon: Gauge },
    { label: 'Generate Recs', icon: Lightbulb },
    { label: 'Assign Priority', icon: Flag },
    { label: 'Display on GIS', icon: MapPin }
  ];

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-2 overflow-x-auto font-mono">
      <div className="flex items-center min-w-max justify-between gap-1 text-[10px]">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                <span className="text-neutral-600 text-[9px] font-bold">0{idx + 1}</span>
                <Icon className="w-3 h-3 text-neutral-400" />
                <span className="font-semibold">{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-3 h-3 text-neutral-600 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
