import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  MapPin,
  AlertOctagon,
  Lightbulb,
  BarChart3,
  History,
  Building2,
  ChevronRight,
  ShieldCheck,
  FolderOpen,
  LogOut
} from 'lucide-react';

export default function Sidebar({ activeNav, onNavigate, datasetName, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Map Analysis', icon: MapPin },
    { id: 'upload', label: 'Upload GeoJSON', icon: UploadCloud },
    { id: 'files', label: 'Saved Files', icon: FolderOpen },
    { id: 'issues', label: 'Infrastructure Issues', icon: AlertOctagon, count: 24 },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, count: 18 },
    { id: 'visuals', label: 'Priority Visuals', icon: BarChart3 },
    { id: 'history', label: 'Analysis History', icon: History }
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-neutral-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-neutral-900 text-sm tracking-tight leading-tight">
            CivicPulse
          </h2>
          <p className="text-[11px] text-neutral-500 font-medium">Smart City Analytics</p>
        </div>
      </div>

      {/* Selected Scope Indicator */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
            Current Analysis
          </span>
          <p className="text-xs font-semibold text-neutral-800 truncate mt-0.5">
            {datasetName}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Audit Active</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Zero Assumption Rule Badge */}
      <div className="px-4 py-2">
        <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-200 text-[11px] text-neutral-500 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-neutral-500 leading-tight">
            Strict No-Assumption Engine. Unverified missing data remains locked.
          </p>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
          {user?.fullName?.split(' ').map((w) => w[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-800 truncate">{user?.fullName}</p>
          <p className="text-[10px] text-neutral-500 truncate">{user?.role}</p>
        </div>
        <button
          onClick={onLogout}
          title="Log out"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
