import React, { useState } from 'react';
import { 
  Footprints, 
  Clock, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  Store, 
  Fuel, 
  Zap, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { WhiteSpotCandidate, StoreLocationRecord } from '../types';

interface FootfallIntelligenceProps {
  candidates: WhiteSpotCandidate[];
  locations: StoreLocationRecord[];
}

export const FootfallIntelligence: React.FC<FootfallIntelligenceProps> = ({
  candidates,
  locations
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(locations[0]?.id || 'loc-tx-001');

  const activeStore = locations.find(l => l.id === selectedSiteId) || locations[0];

  // Hourly Footfall Distribution Curve (00:00 - 23:00)
  const hourlyData = [
    { hour: '12 AM', visits: 45, fuelPct: 80, cstorePct: 20 },
    { hour: '2 AM', visits: 25, fuelPct: 85, cstorePct: 15 },
    { hour: '4 AM', visits: 60, fuelPct: 75, cstorePct: 25 },
    { hour: '6 AM', visits: 210, fuelPct: 60, cstorePct: 40 },
    { hour: '7 AM', visits: 480, fuelPct: 52, cstorePct: 48 }, // Morning Peak (Coffee & Commute)
    { hour: '8 AM', visits: 520, fuelPct: 50, cstorePct: 50 },
    { hour: '9 AM', visits: 340, fuelPct: 55, cstorePct: 45 },
    { hour: '11 AM', visits: 390, fuelPct: 45, cstorePct: 55 },
    { hour: '12 PM', visits: 580, fuelPct: 40, cstorePct: 60 }, // Lunch Peak (Food & Beverage)
    { hour: '1 PM', visits: 490, fuelPct: 42, cstorePct: 58 },
    { hour: '3 PM', visits: 410, fuelPct: 50, cstorePct: 50 },
    { hour: '5 PM', visits: 640, fuelPct: 58, cstorePct: 42 }, // Evening Rush Peak (Fuel Fill-up)
    { hour: '6 PM', visits: 610, fuelPct: 56, cstorePct: 44 },
    { hour: '8 PM', visits: 380, fuelPct: 50, cstorePct: 50 },
    { hour: '10 PM', visits: 190, fuelPct: 65, cstorePct: 35 },
  ];

  const weekdayWeekendData = [
    { day: 'Mon', footfall: 4200, conversion: 68 },
    { day: 'Tue', footfall: 4350, conversion: 70 },
    { day: 'Wed', footfall: 4600, conversion: 71 },
    { day: 'Thu', footfall: 4900, conversion: 73 },
    { day: 'Fri', footfall: 5800, conversion: 76 }, // High Friday Travel
    { day: 'Sat', footfall: 5200, conversion: 74 },
    { day: 'Sun', footfall: 4400, conversion: 69 },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Site Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5" />
              Module F: Human Mobility & Footfall
            </span>
            <span className="text-xs text-slate-400 font-mono">Aggregated Anonymized Mobile SDK</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Footfall Patterns, Dwell Time & Conversion
          </h2>
          <p className="text-xs text-slate-300">
            Hourly diurnal traffic curves, dwell times, and fuel pump to inside c-store conversion ratios.
          </p>
        </div>

        {/* Location Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold">Location:</span>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.city}, {loc.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Footfall Performance KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Avg Daily Footfall</div>
          <div className="text-2xl font-bold text-white">4,820 <span className="text-xs font-normal text-slate-400">visits/day</span></div>
          <div className="text-[10px] text-emerald-400 font-medium">+14.2% vs Suburban Benchmark</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Average Dwell Time</div>
          <div className="text-2xl font-bold text-cyan-400">7.4 <span className="text-xs font-normal text-slate-400">Minutes</span></div>
          <div className="text-[10px] text-slate-400">Optimal High-Velocity Velocity</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Pump to C-Store Conversion</div>
          <div className="text-2xl font-bold text-emerald-400">54.8%</div>
          <div className="text-[10px] text-emerald-400 font-medium">Industry Best-in-Class (&gt;45%)</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Peak Daypart Windows</div>
          <div className="text-xl font-bold text-amber-400">7-9 AM & 5-6 PM</div>
          <div className="text-[10px] text-slate-400">Dual Commute Spikes</div>
        </div>
      </div>

      {/* Hourly Diurnal Footfall Distribution Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              24-Hour Diurnal Hourly Footfall & Daypart Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Correlating morning rush, midday QSR lunch spike, and evening fuel fill-up patterns.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Total Visits
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="footfallGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="visits" name="Visits / Hr" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#footfallGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekday vs Weekend Comparison & Conversion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Day-of-Week Visit Volume & Conversion
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayWeekendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="footfall" name="Total Daily Footfall" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Conversion Funnel Diagnostics
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown of customer journey from road approach to retail purchase.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">1. Road Traffic Pass-by (AADT):</span>
                <strong className="text-white">{activeStore.traffic.aadt.toLocaleString()} vehicles/day</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">2. Site Capture Rate (% turning in):</span>
                <strong className="text-cyan-400">8.6% Capture</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">3. Pump-to-C-Store Inside Walk:</span>
                <strong className="text-emerald-400">54.8% Cross-Shop</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">4. Average Basket Spend:</span>
                <strong className="text-amber-400">$12.40 Inside / $46.80 Fuel</strong>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            Source: <strong className="text-slate-200">[Modeled from Location SDK & POS Logs]</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
