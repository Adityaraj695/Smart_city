import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Lightbulb,
  Activity,
  Filter
} from 'lucide-react';

export default function SummaryMetrics({
  totalIssues = 24,
  highPriority = 6,
  mediumPriority = 11,
  lowPriority = 7,
  recommendationsCount = 18,
  activePriorityFilter,
  onSelectPriorityFilter
}) {
  const cards = [
    {
      id: 'ALL',
      title: 'Total Issues Detected',
      count: totalIssues,
      icon: AlertOctagon,
      countColor: 'text-neutral-900',
      accentColor: 'border-l-blue-500',
      badge: '+4 Q2 Audit',
      badgeClass: 'bg-neutral-100 text-neutral-600'
    },
    {
      id: 'HIGH',
      title: 'High Priority',
      count: highPriority,
      icon: AlertOctagon,
      countColor: 'text-rose-600',
      accentColor: 'border-l-rose-500',
      badge: 'Immediate Action',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'MEDIUM',
      title: 'Medium Priority',
      count: mediumPriority,
      icon: AlertTriangle,
      countColor: 'text-amber-600',
      accentColor: 'border-l-amber-500',
      badge: 'Planned Budget',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'LOW',
      title: 'Low Priority',
      count: lowPriority,
      icon: Info,
      countColor: 'text-sky-600',
      accentColor: 'border-l-sky-500',
      badge: 'Routine Log',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      id: 'RECOMMENDATIONS',
      title: 'Recommendations',
      count: recommendationsCount,
      icon: Lightbulb,
      countColor: 'text-emerald-600',
      accentColor: 'border-l-emerald-500',
      badge: '18 Generated',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  ];

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-neutral-400" />
          <h3 className="font-bold uppercase tracking-wider text-neutral-600">
            Analysis Summary Dashboard
          </h3>
        </div>
        {activePriorityFilter && activePriorityFilter !== 'ALL' && (
          <button
            onClick={() => onSelectPriorityFilter('ALL')}
            className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-semibold"
          >
            <Filter className="w-3 h-3" />
            <span>Reset Priority Filter ({activePriorityFilter})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const isSelected = activePriorityFilter === card.id;

          return (
            <button
              key={card.id}
              onClick={() => {
                if (card.id === 'RECOMMENDATIONS') {
                  const el = document.getElementById('tabbed-details-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onSelectPriorityFilter(card.id);
                }
              }}
              className={`p-3.5 rounded-xl border border-l-4 text-left transition-all flex flex-col justify-between shadow-sm ${card.accentColor} ${
                isSelected
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                  : 'bg-white hover:bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-neutral-500 font-semibold truncate">
                  {card.title}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${card.badgeClass}`}>
                  {card.badge}
                </span>
              </div>

              <div className="my-2">
                <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${card.countColor}`}>
                  {card.count}
                </span>
              </div>

              <div className="text-[11px] text-neutral-400 pt-1.5 border-t border-neutral-100 flex items-center justify-between">
                <span>{card.id === 'RECOMMENDATIONS' ? 'View solutions' : 'Filter table'}</span>
                <span className="text-blue-500 font-semibold">→</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
