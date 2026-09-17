import React, { useState } from 'react';
import { 
  PieChart, 
  BarChart, 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle, 
  Layers, 
  DollarSign, 
  Fuel, 
  Store,
  Info,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart as RechartsBar, 
  Bar, 
  XAxis, 
  YAxis, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { MarketShareRecord } from '../types';

interface MarketShareModuleProps {
  marketShareData: MarketShareRecord[];
}

const BRAND_COLORS: Record<string, string> = {
  'Circle K (Alimentation Couche-Tard)': '#f97316',
  '7-Eleven / Speedway': '#10b981',
  'ExxonMobil': '#ef4444',
  'Chevron / Texaco': '#3b82f6',
  'Shell': '#eab308',
  "Buc-ee's": '#f59e0b',
  'Wawa': '#06b6d4',
  'QuikTrip': '#ec4899',
  'Costco Wholesale (Fuel)': '#8b5cf6',
  'Murphy USA / Walmart': '#14b8a6',
  'Independent / Other Brands': '#64748b',
};

export const MarketShareModule: React.FC<MarketShareModuleProps> = ({ marketShareData }) => {
  const [calculationMode, setCalculationMode] = useState<'fuelVolume' | 'revenue' | 'storeCount'>('fuelVolume');

  // Calculate HHI Index (Sum of squared market shares) based on active mode
  const hhiIndex = Math.round(
    marketShareData.reduce((acc, curr) => {
      const share = calculationMode === 'fuelVolume' 
        ? curr.fuelVolumeSharePct 
        : calculationMode === 'revenue' 
        ? curr.revenueSharePct 
        : curr.storeCountSharePct;
      return acc + Math.pow(share, 2);
    }, 0)
  );

  let hhiDescription = 'Unconcentrated (Highly Competitive)';
  if (hhiIndex > 2500) hhiDescription = 'Highly Concentrated (Oligopoly Risk)';
  else if (hhiIndex > 1500) hhiDescription = 'Moderately Concentrated';

  // Format data for Recharts Pie
  const pieData = marketShareData.map(d => ({
    name: d.brand,
    value: calculationMode === 'fuelVolume' 
      ? d.fuelVolumeSharePct 
      : calculationMode === 'revenue' 
      ? d.revenueSharePct 
      : d.storeCountSharePct,
    color: BRAND_COLORS[d.brand] || '#06b6d4',
    volumeMil: d.annualVolumeMillionGal,
    revenueMil: d.annualRevenueMillionUsd,
    stores: d.storeCount,
    category: d.category
  }));

  // Historical YoY Market Share Trend Data
  const trendData = [
    { year: '2023', QuikTrip: 6.8, CircleK: 11.0, Wawa: 4.8, SevenEleven: 13.0, BucEes: 2.2, Others: 62.2 },
    { year: '2024', QuikTrip: 7.4, CircleK: 11.2, Wawa: 5.3, SevenEleven: 13.1, BucEes: 2.8, Others: 60.2 },
    { year: '2025', QuikTrip: 7.9, CircleK: 11.3, Wawa: 5.8, SevenEleven: 13.2, BucEes: 3.3, Others: 58.5 },
    { year: '2026E', QuikTrip: 8.2, CircleK: 11.4, Wawa: 6.2, SevenEleven: 13.2, BucEes: 3.8, Others: 57.2 },
  ];

  const totalFuelVolMil = marketShareData.reduce((s, d) => s + d.annualVolumeMillionGal, 0);
  const totalRevenueMil = marketShareData.reduce((s, d) => s + d.annualRevenueMillionUsd, 0);
  const totalStoreCount = marketShareData.reduce((s, d) => s + d.storeCount, 0);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5" />
              Module E: Market Share Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">HHI Index: {hhiIndex}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            US Fuel & Retail Market Share Analytics
          </h2>
          <p className="text-xs text-slate-300">
            Evaluating brand concentration, volume share vs revenue share, and competitive shifts across US markets.
          </p>
        </div>

        {/* Calculation Basis Switcher Pill */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold px-2">Calculation Basis:</span>
          <button
            onClick={() => setCalculationMode('fuelVolume')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              calculationMode === 'fuelVolume' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fuel Volume (Gal)
          </button>
          <button
            onClick={() => setCalculationMode('revenue')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              calculationMode === 'revenue' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Total Revenue ($)
          </button>
          <button
            onClick={() => setCalculationMode('storeCount')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              calculationMode === 'storeCount' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Store Count
          </button>
        </div>
      </div>

      {/* Primary KPI & HHI Concentration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Selected Scope</div>
          <div className="text-2xl font-bold text-white">United States (CONUS)</div>
          <div className="text-[10px] text-cyan-400">{totalStoreCount.toLocaleString()} Tracked Locations</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Market Concentration (HHI)</div>
          <div className="text-2xl font-bold text-amber-400">{hhiIndex}</div>
          <div className="text-[10px] text-slate-300 font-medium">{hhiDescription}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Annual Fuel Volume</div>
          <div className="text-2xl font-bold text-emerald-400">
            {(totalFuelVolMil / 1000).toFixed(1)}B <span className="text-xs font-normal text-slate-400">gal/yr</span>
          </div>
          <div className="text-[10px] text-slate-400">Total National Throughput</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Annual Retail Gross Sales</div>
          <div className="text-2xl font-bold text-teal-400">
            ${(totalRevenueMil / 1000).toFixed(1)}B <span className="text-xs font-normal text-slate-400">/yr</span>
          </div>
          <div className="text-[10px] text-slate-400">Fuel + C-Store Turnover</div>
        </div>
      </div>

      {/* Visual Analytics: Brand Breakdown Donut & YoY Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Brand Market Share Distribution Donut */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              Brand Market Share Breakdown ({calculationMode === 'fuelVolume' ? 'Gallons' : calculationMode === 'revenue' ? 'Revenue' : 'Stores'})
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              National TAM
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Share']}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
            {pieData.slice(0, 6).map((p, i) => (
              <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <div className="truncate">
                  <div className="font-semibold text-slate-200 truncate">{p.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-400">{p.value}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: YoY Historical & Forecast Market Share Shifts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              YoY Market Share Trajectory (2023 - 2026E)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
              Mega-Format Shift
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 20]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="CircleK" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="SevenEleven" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="QuikTrip" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Wawa" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="BucEes" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <span className="text-cyan-400 font-bold">Strategic Insight:</span> Food-centric travel plazas and regional high-amenity operators are capturing incremental share at +4.8% annually from conventional legacy distributors.
          </div>
        </div>
      </div>
    </div>
  );
};
