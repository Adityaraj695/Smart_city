import React, { useState, useEffect } from 'react';
import {
  Layers,
  ChevronDown,
  Bell,
  User,
  Zap,
  ZapOff,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  Sun,
  Clock,
  Building2
} from 'lucide-react';

export default function TopNavbar({
  selectedArea,
  onSelectArea,
  powerSimulated,
  onTogglePowerSimulation,
  onExportReport
}) {
  const [timeStr, setTimeStr] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const areas = [
    { id: 'patiala-sector-4', name: 'Patiala Sector 4 Core', subtitle: 'Standard Study Zone (Power Data Omitted)' },
    { id: 'metro-east', name: 'Metropolitan Zone East', subtitle: 'High Building & Drainage Deficit Risk' },
    { id: 'greenfield-c', name: 'Greenfield Smart District Zone C', subtitle: 'Full Telemetry Grid Layout' }
  ];

  const notifications = [
    {
      id: 1,
      title: 'Healthcare Gap Detected',
      desc: 'Northern Sector 4B exceeds 3.0 km threshold to nearest emergency facility.',
      time: '09:42 AM',
      level: 'high'
    },
    {
      id: 2,
      title: 'Drainage Deficit Alert',
      desc: 'Eastern mixed residential blocks lack storm collector pipe within 350m.',
      time: '08:15 AM',
      level: 'high'
    },
    {
      id: 3,
      title: 'Missing Telemetry Logged',
      desc: 'Power outage telemetry omitted from source GeoJSON. Module locked.',
      time: '06:30 AM',
      level: 'info'
    }
  ];

  const currentAreaObj = areas.find(a => a.id === selectedArea) || areas[0];

  return (
    <header className="bg-[#0e2a47] text-white sticky top-0 z-40 select-none px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Platform Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              Smart City Infrastructure Analysis
            </h1>
            <p className="text-xs text-blue-100/70 leading-none mt-0.5">
              Decision-Support Platform &bull; Municipal Planning Division
            </p>
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center gap-3">
          {/* Status & Clock pill */}
          <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-blue-100/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Live System</span>
            <span className="text-blue-200/40">&bull;</span>
            <span className="text-white font-medium">{timeStr || '10:30 AM'}</span>
          </div>

          {/* Power Simulation Toggle */}
          <button
            onClick={onTogglePowerSimulation}
            title="Toggle power outage telemetry feed to inspect behavior with vs without power data"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              powerSimulated
                ? 'bg-amber-400/15 border-amber-300/40 text-amber-200 hover:bg-amber-400/25'
                : 'bg-white/10 hover:bg-white/15 border-white/10 text-blue-100/80 hover:text-white'
            }`}
          >
            {powerSimulated ? (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Power Feed: ON</span>
              </>
            ) : (
              <>
                <ZapOff className="w-3.5 h-3.5 text-blue-200/70" />
                <span>Simulate Power</span>
              </>
            )}
          </button>

          {/* Area Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAreaDropdown(!showAreaDropdown)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-blue-200" />
              <span className="max-w-[140px] truncate">{currentAreaObj.name.split('(')[0]}</span>
              <ChevronDown className="w-3 h-3 text-blue-200/70" />
            </button>

            {showAreaDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-neutral-200 rounded-xl shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-neutral-400 border-b border-neutral-100 mb-1">
                  Selected Area
                </div>
                {areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => {
                      onSelectArea(area.id);
                      setShowAreaDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex flex-col ${
                      selectedArea === area.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span>{area.name}</span>
                    <span className="text-[10px] text-neutral-400">{area.subtitle}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#0e2a47]">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Alerts</span>
                  <button onClick={() => setShowNotifications(false)} className="text-neutral-400 hover:text-neutral-800">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 bg-neutral-50 rounded border border-neutral-200 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-rose-600 text-[11px]">{n.title}</span>
                        <span className="text-[10px] text-neutral-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-neutral-600">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export Report Trigger */}
          <button
            onClick={onExportReport}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white text-xs font-bold">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
