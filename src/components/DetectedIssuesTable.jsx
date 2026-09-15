import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  HeartPulse,
  Droplets,
  GraduationCap,
  Zap,
  ArrowUpDown
} from 'lucide-react';

export default function DetectedIssuesTable({
  issues = [],
  categoryFilter,
  priorityFilter,
  onCategoryFilterChange,
  onPriorityFilterChange,
  onFocusOnMap
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [minSeverity, setMinSeverity] = useState(0);
  const [sortField, setSortField] = useState('severity');
  const [sortAsc, setSortAsc] = useState(false);

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Healthcare':
        return { icon: HeartPulse, cls: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'Water & Drainage':
        return { icon: Droplets, cls: 'text-cyan-700 bg-cyan-50 border-cyan-200' };
      case 'Education':
        return { icon: GraduationCap, cls: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'Power':
        return { icon: Zap, cls: 'text-amber-700 bg-amber-50 border-amber-200' };
      default:
        return { icon: AlertOctagon, cls: 'text-neutral-500 bg-neutral-100 border-neutral-200' };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'LOW':
        return 'bg-sky-50 text-sky-700 border-sky-200 font-medium';
      default:
        return 'bg-neutral-100 text-neutral-500';
    }
  };

  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        if (categoryFilter !== 'ALL' && issue.category !== categoryFilter) return false;
        if (priorityFilter !== 'ALL' && issue.priority !== priorityFilter) return false;
        if (issue.severity < minSeverity) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchProblem = issue.problem.toLowerCase().includes(q);
          const matchLocation = issue.location.toLowerCase().includes(q);
          const matchCategory = issue.category.toLowerCase().includes(q);
          if (!matchProblem && !matchLocation && !matchCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [issues, categoryFilter, priorityFilter, minSeverity, searchQuery, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <section id="detected-issues-section" className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-3 font-mono">
      {/* Header matching IOC Active Incidents Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-neutral-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Active Incidents & Detected Issues
          </h3>
          <span className="text-[10px] text-neutral-400">
            ({filteredIssues.length} of {issues.length} Logged)
          </span>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 text-xs font-sans">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search problem, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-700 placeholder-neutral-400 focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-50 p-2.5 rounded border border-neutral-200 text-[11px]">
        {/* Category Filters */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-neutral-400 mr-1 flex items-center gap-1 font-bold">
            <Filter className="w-3 h-3" /> CAT:
          </span>
          {['ALL', 'Healthcare', 'Water & Drainage', 'Education', 'Power'].map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryFilterChange(cat)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-500 hover:text-neutral-800 border border-neutral-200'
              }`}
            >
              {cat === 'ALL' ? 'ALL' : cat}
            </button>
          ))}
        </div>

        {/* Priority Filters */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-neutral-400 mr-1 font-bold">PRIO:</span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((prio) => (
            <button
              key={prio}
              onClick={() => onPriorityFilterChange(prio)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                priorityFilter === prio
                  ? prio === 'HIGH'
                    ? 'bg-rose-600 text-white'
                    : prio === 'MEDIUM'
                    ? 'bg-amber-600 text-white'
                    : prio === 'LOW'
                    ? 'bg-sky-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-500 hover:text-neutral-800 border border-neutral-200'
              }`}
            >
              {prio}
            </button>
          ))}
        </div>

        {/* Severity Slider */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 font-bold">SEV ≥</span>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={minSeverity}
            onChange={(e) => setMinSeverity(parseFloat(e.target.value))}
            className="w-16 accent-blue-500 h-1 bg-neutral-200 rounded cursor-pointer"
          />
          <span className="text-neutral-600 font-bold min-w-[20px]">
            {minSeverity > 0 ? minSeverity : '0'}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-neutral-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[10px] uppercase tracking-wider">
              <th onClick={() => handleSort('category')} className="py-2 px-3 cursor-pointer hover:text-neutral-800">
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-neutral-400" />
                </div>
              </th>
              <th onClick={() => handleSort('problem')} className="py-2 px-3 cursor-pointer hover:text-neutral-800">
                <div className="flex items-center gap-1">
                  <span>Problem</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-neutral-400" />
                </div>
              </th>
              <th onClick={() => handleSort('location')} className="py-2 px-3 cursor-pointer hover:text-neutral-800">
                <div className="flex items-center gap-1">
                  <span>Location</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-neutral-400" />
                </div>
              </th>
              <th onClick={() => handleSort('severity')} className="py-2 px-3 cursor-pointer hover:text-neutral-800">
                <div className="flex items-center gap-1">
                  <span>Severity</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-neutral-400" />
                </div>
              </th>
              <th onClick={() => handleSort('priority')} className="py-2 px-3 cursor-pointer hover:text-neutral-800">
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-neutral-400" />
                </div>
              </th>
              <th className="py-2 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white font-sans">
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => {
                const catBadge = getCategoryBadge(issue.category);
                const CatIcon = catBadge.icon;
                const priorityBadge = getPriorityBadge(issue.priority);

                return (
                  <tr key={issue.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${catBadge.cls}`}>
                        <CatIcon className="w-3 h-3" />
                        <span>{issue.category}</span>
                      </span>
                    </td>

                    <td className="py-2.5 px-3 max-w-sm">
                      <p className="font-medium text-neutral-800 text-xs leading-snug">
                        {issue.problem}
                      </p>
                      {issue.affectedPopulation && (
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          Pop: {issue.affectedPopulation.toLocaleString()}
                        </p>
                      )}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-neutral-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        <span>{issue.location}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-neutral-100 rounded h-1.5 overflow-hidden border border-neutral-200">
                          <div
                            className={`h-full ${
                              issue.severity >= 7.5 ? 'bg-rose-500' : issue.severity >= 5.0 ? 'bg-amber-500' : 'bg-sky-500'
                            }`}
                            style={{ width: `${(issue.severity / 10) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-neutral-700 text-xs">
                          {issue.severity}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${priorityBadge}`}>
                        {issue.priority}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono">
                      <button
                        onClick={() => {
                          onFocusOnMap(
                            issue.coordinates,
                            issue.problem,
                            `${issue.location} • Severity ${issue.severity}/10`,
                            issue.category,
                            issue.severity,
                            issue.priority
                          );
                        }}
                        className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-blue-600 hover:text-white border border-neutral-200 text-neutral-600 text-[10px] font-semibold transition-colors"
                      >
                        Locate
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-6 text-center text-neutral-400 text-xs font-mono">
                  No issues match the selected filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
