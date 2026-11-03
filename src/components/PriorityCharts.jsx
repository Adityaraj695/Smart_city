import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { BarChart3, PieChart, Layers, Activity } from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function PriorityCharts({
  issues = [],
  powerAvailable = false
}) {
  const highCount = issues.filter(i => i.priority === 'HIGH').length;
  const medCount = issues.filter(i => i.priority === 'MEDIUM').length;
  const lowCount = issues.filter(i => i.priority === 'LOW').length;

  const waterCount = issues.filter(i => i.category === 'Water & Drainage').length;
  const powerCount = powerAvailable ? issues.filter(i => i.category === 'Power').length : 0;
  const healthCount = issues.filter(i => i.category === 'Healthcare').length;
  const eduCount = issues.filter(i => i.category === 'Education').length;

  const priorityData = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [
      {
        data: [highCount, medCount, lowCount],
        backgroundColor: [
          '#f43f5e',
          '#f59e0b',
          '#38bdf8'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const priorityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#525252',
          font: { size: 10, family: 'monospace' },
          padding: 10,
          usePointStyle: true,
          boxWidth: 6
        }
      },
      tooltip: {
        backgroundColor: '#171717',
        titleColor: '#fafafa',
        bodyColor: '#d4d4d4',
        borderColor: '#404040',
        borderWidth: 1,
        padding: 8
      }
    },
    cutout: '68%'
  };

  const categoryData = {
    labels: ['Water & Drainage', 'Power Outages', 'Healthcare', 'Education'],
    datasets: [
      {
        label: 'Issues Detected',
        data: [waterCount, powerCount, healthCount, eduCount],
        backgroundColor: [
          '#06b6d4',
          powerAvailable ? '#f59e0b' : '#d4d4d4',
          '#f43f5e',
          '#6366f1'
        ],
        borderRadius: 4
      }
    ]
  };

  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#171717',
        titleColor: '#fafafa',
        bodyColor: '#d4d4d4',
        borderColor: '#404040',
        borderWidth: 1,
        padding: 8
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.06)' },
        ticks: { color: '#737373', font: { size: 10, family: 'monospace' } }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.06)' },
        ticks: { color: '#737373', stepSize: 1, font: { size: 10, family: 'monospace' } },
        beginAtZero: true
      }
    }
  };

  return (
    <section id="visuals-section" className="space-y-3 font-mono">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-neutral-400" />
          <h3 className="font-bold uppercase tracking-wider text-neutral-600">
            Priority & Category Visualizations
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Priority Donut */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-[10px] text-neutral-400 font-bold uppercase">
            <span>ISSUES BY PRIORITY</span>
            <span>TOTAL: {issues.length}</span>
          </div>

          <div className="relative h-48 my-2 flex items-center justify-center">
            <Doughnut data={priorityData} options={priorityOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              <span className="text-xl font-black text-neutral-900">{issues.length}</span>
              <span className="text-[9px] uppercase font-bold text-neutral-400">DEFICITS</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-neutral-100 text-center text-xs">
            <div className="bg-neutral-50 p-1.5 rounded border border-neutral-200">
              <span className="text-[9px] text-rose-600 block font-bold">HIGH</span>
              <span className="font-bold text-neutral-900 text-xs">{highCount}</span>
            </div>
            <div className="bg-neutral-50 p-1.5 rounded border border-neutral-200">
              <span className="text-[9px] text-amber-600 block font-bold">MED</span>
              <span className="font-bold text-neutral-900 text-xs">{medCount}</span>
            </div>
            <div className="bg-neutral-50 p-1.5 rounded border border-neutral-200">
              <span className="text-[9px] text-sky-600 block font-bold">LOW</span>
              <span className="font-bold text-neutral-900 text-xs">{lowCount}</span>
            </div>
          </div>
        </div>

        {/* Category Bar */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-[10px] text-neutral-400 font-bold uppercase">
            <span>ISSUES BY CATEGORY</span>
            {!powerAvailable && (
              <span className="text-amber-600">POWER TELEMETRY OMITTED</span>
            )}
          </div>

          <div className="h-48 my-2">
            <Bar data={categoryData} options={categoryOptions} />
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-neutral-100 text-center text-xs">
            <div className="bg-neutral-50 p-1.5 rounded border border-neutral-200">
              <span className="text-[9px] text-cyan-600 block font-bold">WATER</span>
              <span className="font-bold text-neutral-900 text-xs">{waterCount}</span>
            </div>
            <div className="bg-neutral-50 p-1.5 rounded border border-neutral-200">
              <span className="text-[9px] text-amber-600 block font-bold">POWER</span>
              <span className="font-bold text-neutral-900 text-xs">{powerAvailable ? powerCount : 'N/A'}</span>
            </div>
            <div className="bg-neutral-50 p-1.5 rounded border border-neutral-200">
              <span className="text-[9px] text-rose-600 block font-bold">HEALTH</span>
              <span className="font-bold text-neutral-900 text-xs">{healthCount}</span>
            </div>
            <div className="bg-neutral-50 p-1.5 rounded border border-neutral-200">
              <span className="text-[9px] text-indigo-600 block font-bold">EDU</span>
              <span className="font-bold text-neutral-900 text-xs">{eduCount}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
