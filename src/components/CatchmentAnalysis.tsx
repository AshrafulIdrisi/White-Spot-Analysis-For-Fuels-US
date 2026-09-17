import React, { useState } from 'react';
import { 
  Users, 
  Car, 
  DollarSign, 
  MapPin, 
  Activity, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Target,
  Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { WhiteSpotCandidate, StoreLocationRecord, CatchmentBufferData } from '../types';

interface CatchmentAnalysisProps {
  candidates: WhiteSpotCandidate[];
  locations: StoreLocationRecord[];
}

export const CatchmentAnalysis: React.FC<CatchmentAnalysisProps> = ({
  candidates,
  locations
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>(candidates[0]?.id || '');
  const [catchmentMode, setCatchmentMode] = useState<'radius' | 'drivetime'>('radius');

  const activeCandidate = candidates.find(c => c.id === selectedTargetId) || candidates[0] || null;

  if (!activeCandidate) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 font-sans">
        <div className="p-8 bg-white border border-purple-200 rounded-3xl text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-purple-100 border border-purple-200 text-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-purple-950">No Trade Area Selected</h2>
          <p className="text-xs text-purple-700 max-w-md mx-auto">
            Scan for trade area voids or click anywhere on the live map to analyze 1, 3, and 5-mile demographic catchments and daytime employee flows.
          </p>
        </div>
      </div>
    );
  }

  const pop3Mile = activeCandidate?.pop3Mile || 38000;
  const pop1Mile = activeCandidate?.pop1Mile ?? Math.round(pop3Mile * 0.28);
  const pop5Mile = activeCandidate?.pop5Mile ?? Math.round(pop3Mile * 2.85);
  const medianIncome = activeCandidate?.medianIncome3Mile ?? activeCandidate?.medianHouseholdIncome ?? 86500;
  const aadt = activeCandidate?.aadt || 28000;

  // Data for 1 mi vs 3 mi vs 5 mi comparison
  const radiusCatchmentRows: CatchmentBufferData[] = [
    {
      bufferType: '1-Mile Core Buffer',
      population: pop1Mile,
      households: Math.round(pop1Mile / 2.65),
      medianIncome: Math.round(medianIncome * 1.04),
      trafficAadt: aadt,
      businessCount: 142,
      daytimeEmployees: Math.round(pop1Mile * 0.42),
      vehicleCount: Math.round(pop1Mile * 0.88),
      retailGapIndex: 124 // 100 is balanced, >100 is unmet demand
    },
    {
      bufferType: '3-Mile Primary Catchment',
      population: pop3Mile,
      households: Math.round(pop3Mile / 2.65),
      medianIncome: medianIncome,
      trafficAadt: aadt,
      businessCount: 680,
      daytimeEmployees: Math.round(pop3Mile * 0.46),
      vehicleCount: Math.round(pop3Mile * 0.85),
      retailGapIndex: 118
    },
    {
      bufferType: '5-Mile Regional Trade Area',
      population: pop5Mile,
      households: Math.round(pop5Mile / 2.65),
      medianIncome: Math.round(medianIncome * 0.96),
      trafficAadt: aadt,
      businessCount: 1850,
      daytimeEmployees: Math.round(pop5Mile * 0.49),
      vehicleCount: Math.round(pop5Mile * 0.82),
      retailGapIndex: 110
    }
  ];

  // Radar metrics for trade area saturation
  const radarData = [
    { subject: 'Commuter Flow', A: 92, fullMark: 100 },
    { subject: 'Resident Pop', A: 85, fullMark: 100 },
    { subject: 'Income Affluence', A: 88, fullMark: 100 },
    { subject: 'Vehicle Ownership', A: 95, fullMark: 100 },
    { subject: 'Daytime Workforce', A: 78, fullMark: 100 },
    { subject: 'Retail Void', A: 90, fullMark: 100 },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header & Target Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-purple-200 p-5 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-700" />
              Catchment & Demographics
            </span>
            <span className="text-xs text-purple-600 font-medium">Multi-Ring Isochrone Analytics</span>
          </div>
          <h2 className="text-2xl font-black text-purple-950 tracking-tight">
            Trade Area Catchment Demographics & Leakage
          </h2>
          <p className="text-xs text-purple-700">
            Profiling 1-3-5 mile radius concentric bands and 5-10-15 minute drive-time customer trade areas.
          </p>
        </div>

        {/* Target Site Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-purple-900 font-bold">Catchment Center:</span>
          <select
            value={activeCandidate.id}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            className="bg-purple-50 text-xs text-purple-950 px-3.5 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-bold cursor-pointer"
          >
            {candidates.map(c => (
              <option key={c.id} value={c.id}>
                {c.candidateName} ({c.city}, {c.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Demographic Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold">3-Mile Population</div>
          <div className="text-2xl font-black text-purple-950">{pop3Mile.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-bold">+18.4% 5-Yr Growth</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold">Median Household Income</div>
          <div className="text-2xl font-black text-purple-700">${medianIncome.toLocaleString()}</div>
          <div className="text-[10px] text-purple-700 font-medium">High Discretionary Spend</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold">Primary Corridor AADT</div>
          <div className="text-2xl font-black text-purple-950">{aadt.toLocaleString()} <span className="text-xs font-normal text-purple-600">v/d</span></div>
          <div className="text-[10px] text-purple-700 font-bold">Arterial Corridor Volume</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold">Retail Demand Gap Index</div>
          <div className="text-2xl font-black text-emerald-600">124 <span className="text-xs font-normal text-purple-600">/ 100</span></div>
          <div className="text-[10px] text-emerald-600 font-bold">High Unmet Retail Demand</div>
        </div>
      </div>

      {/* Concentric 1-3-5 Mile Table */}
      <div className="bg-white border border-purple-200 rounded-3xl p-5 space-y-4 shadow-xl overflow-x-auto">
        <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-700" />
          Concentric Trade Area Multi-Ring Summary
        </h3>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-purple-100 text-purple-700 text-[11px] uppercase font-bold">
              <th className="py-3 px-3">Buffer Band</th>
              <th className="py-3 px-3">Population</th>
              <th className="py-3 px-3">Households</th>
              <th className="py-3 px-3">Median Income</th>
              <th className="py-3 px-3">Daytime Employees</th>
              <th className="py-3 px-3">Commercial Establishments</th>
              <th className="py-3 px-3">Retail Gap Index</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100 text-purple-900 font-medium">
            {radiusCatchmentRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-purple-50/50">
                <td className="py-3 px-3 font-bold text-purple-950">{row.bufferType}</td>
                <td className="py-3 px-3">{row.population.toLocaleString()}</td>
                <td className="py-3 px-3">{row.households.toLocaleString()}</td>
                <td className="py-3 px-3 font-bold text-purple-700">${row.medianIncome.toLocaleString()}</td>
                <td className="py-3 px-3">{row.daytimeEmployees.toLocaleString()}</td>
                <td className="py-3 px-3">{row.businessCount.toLocaleString()}</td>
                <td className="py-3 px-3 font-bold text-emerald-600">{row.retailGapIndex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
