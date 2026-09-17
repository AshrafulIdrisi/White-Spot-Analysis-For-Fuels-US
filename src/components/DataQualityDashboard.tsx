import React from 'react';
import { 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Server, 
  Layers, 
  RefreshCw, 
  FileCheck 
} from 'lucide-react';
import { DataQualitySummary } from '../types';

export const DataQualityDashboard: React.FC = () => {
  const sources = [
    {
      sourceName: 'US Census Bureau ACS 5-Year Data',
      frequency: 'Annual Refresh',
      lastUpdated: 'Aug 2026',
      recordsCount: 74200,
      completenessPct: 99.8,
      status: 'Live & Certified'
    },
    {
      sourceName: 'FHWA Highway Performance Monitoring System (HPMS)',
      frequency: 'Semi-Annual',
      lastUpdated: 'Jul 2026',
      recordsCount: 184500,
      completenessPct: 99.2,
      status: 'Live & Certified'
    },
    {
      sourceName: 'US Retail Fuel & C-Store Point Registry',
      frequency: 'Daily Continuous',
      lastUpdated: 'Today, 06:00 UTC',
      recordsCount: 12450,
      completenessPct: 100.0,
      status: 'Real-time Feed'
    },
    {
      sourceName: 'Aggregated Mobile SDK Footfall Ingestion',
      frequency: 'Weekly Batch',
      lastUpdated: '2 Days Ago',
      recordsCount: 5200000,
      completenessPct: 98.6,
      status: 'Active Pipeline'
    },
    {
      sourceName: 'Alternative Fuels Data Center (DOE AFDC)',
      frequency: 'Weekly Continuous',
      lastUpdated: 'Sep 2026',
      recordsCount: 65400,
      completenessPct: 99.9,
      status: 'Live & Certified'
    }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Data Governance & Lineage
            </span>
            <span className="text-xs text-slate-400 font-mono">SOC2 / Enterprise Grade</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Data Quality, Completeness & Source Lineage
          </h2>
          <p className="text-xs text-slate-300">
            Real-time telemetry on coordinate integrity, schema validation, deduplication logs, and source refresh intervals.
          </p>
        </div>
      </div>

      {/* Primary Data Quality KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Coordinate Completeness</div>
          <div className="text-2xl font-bold text-emerald-400">100.0%</div>
          <div className="text-[10px] text-slate-400">Zero missing Lat/Lng coordinates</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Geocoding Match Rate</div>
          <div className="text-2xl font-bold text-cyan-400">99.4%</div>
          <div className="text-[10px] text-cyan-400">Rooftop precision accuracy</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Deduplication Resolved</div>
          <div className="text-2xl font-bold text-white">100%</div>
          <div className="text-[10px] text-slate-400">14 duplicates merged in Q3</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Data Lineage Audit</div>
          <div className="text-2xl font-bold text-teal-400">Clean</div>
          <div className="text-[10px] text-teal-400">100% Source Traceability</div>
        </div>
      </div>

      {/* Source Lineage Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Active Source Feeds & Pipeline Status
          </h3>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            PostGIS Master Spatial DB
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3">Data Provider / Source Name</th>
              <th className="py-3 px-3">Refresh Cadence</th>
              <th className="py-3 px-3">Last Synced</th>
              <th className="py-3 px-3">Records Ingested</th>
              <th className="py-3 px-3">Completeness</th>
              <th className="py-3 px-3">Feed Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {sources.map((src, i) => (
              <tr key={i} className="hover:bg-slate-800/40">
                <td className="py-3.5 px-3 font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {src.sourceName}
                </td>
                <td className="py-3.5 px-3 text-slate-300">{src.frequency}</td>
                <td className="py-3.5 px-3 font-mono text-slate-400">{src.lastUpdated}</td>
                <td className="py-3.5 px-3 font-mono">{src.recordsCount.toLocaleString()}</td>
                <td className="py-3.5 px-3 text-emerald-400 font-bold">{src.completenessPct}%</td>
                <td className="py-3.5 px-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {src.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
