import React, { useState } from 'react';
import { 
  Store, 
  Fuel, 
  Users, 
  Navigation, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Building2,
  Car,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { StoreLocationRecord } from '../types';

interface StoreAnalysisProps {
  locations: StoreLocationRecord[];
  selectedLocation: StoreLocationRecord | null;
  onSelectLocation: (loc: StoreLocationRecord) => void;
  onNavigateToMap: () => void;
}

export const StoreAnalysis: React.FC<StoreAnalysisProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onNavigateToMap
}) => {
  const currentStore = selectedLocation || locations[0];

  const demographicChartData = [
    { name: '1 Mile', pop: currentStore?.demographics.pop1Mile || 0, label: 'Immediate Core' },
    { name: '3 Miles', pop: currentStore?.demographics.pop3Mile || 0, label: 'Primary Catchment' },
    { name: '5 Miles', pop: currentStore?.demographics.pop5Mile || 0, label: 'Outer Trade Area' },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Store Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-xs font-bold flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              Module C: Store Profile & Performance
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {currentStore?.id}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Store & Location Deep-Dive Intelligence
          </h2>
          <p className="text-xs text-slate-300">
            Physical site profile, trade area demographics, traffic counts, competitive density, and cannibalization risk.
          </p>
        </div>

        {/* Store Selector Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={currentStore?.id}
            onChange={(e) => {
              const found = locations.find(l => l.id === e.target.value);
              if (found) onSelectLocation(found);
            }}
            className="bg-slate-950 text-xs text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.city}, {loc.state})
              </option>
            ))}
          </select>

          <button
            onClick={onNavigateToMap}
            className="px-3.5 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Store Profile Card + Key Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Physical Store Specs & Fuel Amenities */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{currentStore.brand}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                {currentStore.fuelDetails.operatingHours}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{currentStore.name}</h3>
            <p className="text-xs text-slate-400">{currentStore.address}, {currentStore.city}, {currentStore.state} {currentStore.zipCode}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Pumps / Positions</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {currentStore.fuelDetails.pumpsCount} Pumps ({currentStore.fuelDetails.fuelingPositions} pos)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[11px]">C-Store Retail Size</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {(currentStore?.fuelDetails?.cStoreSqFt || 0).toLocaleString()} sq ft
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Ownership Model</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {currentStore.fuelDetails.ownershipType}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Opening Year</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {currentStore.openingYear || 'Established'}
              </div>
            </div>
          </div>

          {/* Fuel Types Available */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-cyan-400" />
              Fuel Formulations & Grades
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentStore.fuelDetails.fuelTypes.map((ft, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium">
                  {ft}
                </span>
              ))}
            </div>
          </div>

          {/* Site Amenities & Offerings */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="text-slate-300 font-bold">Site Offerings & Food Programs</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span>🚗 Car Wash:</span>
                <strong className={currentStore.fuelDetails.hasCarWash ? 'text-emerald-400' : 'text-slate-500'}>
                  {currentStore.fuelDetails.hasCarWash ? 'Yes' : 'No'}
                </strong>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span>⚡ EV Fast Charging:</span>
                <strong className={currentStore.fuelDetails.hasEvChargers ? 'text-cyan-400' : 'text-slate-500'}>
                  {currentStore.fuelDetails.hasEvChargers ? `${currentStore.fuelDetails.evChargersCount} Ports` : 'No'}
                </strong>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span>🍔 Food Service / QSR:</span>
                <strong className={currentStore.fuelDetails.hasQsrFood ? 'text-amber-400' : 'text-slate-500'}>
                  {currentStore.fuelDetails.qsrBrand || (currentStore.fuelDetails.hasQsrFood ? 'Fresh Food' : 'Snacks')}
                </strong>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span>🚛 Heavy Diesel / DEF:</span>
                <strong className={currentStore.fuelDetails.hasDieselHdv ? 'text-emerald-400' : 'text-slate-500'}>
                  {currentStore.fuelDetails.hasDieselHdv ? 'Yes' : 'No'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Location Demographics & Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Road Traffic (AADT)</div>
              <div className="text-xl font-bold text-white mt-1">{(currentStore?.traffic?.aadt || 0).toLocaleString()}</div>
              <div className="text-[10px] text-cyan-400">{currentStore?.traffic?.roadClass || 'Corridor'}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Median Household Income</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">${(currentStore?.demographics?.medianIncome3Mile || 0).toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">3-Mile Radius Catchment</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Daytime Workers</div>
              <div className="text-xl font-bold text-white mt-1">{(currentStore?.demographics?.daytimeWorkers3Mile || 0).toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">Lunch / Commute Demand</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Cannibalization Risk</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{currentStore.cannibalizationRiskScore}/100</div>
              <div className="text-[10px] text-emerald-400">Low Impact on Sister Stores</div>
            </div>
          </div>

          {/* Demographic Population Catchment Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Demographic Catchment Radii (1 Mi vs 3 Mi vs 5 Mi)
                </h3>
                <p className="text-xs text-slate-400">
                  Census ACS 5-Year population density & annual growth trajectory (+{(currentStore.demographics.annualPopGrowthRate * 100).toFixed(1)}%/yr)
                </p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
                US Census ACS 2024
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographicChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="pop" name="Population" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Store Sales & Fuel Performance (Modeled / Measured) */}
          {currentStore.financials && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Store Economics & Volume Metrics
                  </h3>
                  <p className="text-xs text-slate-400">
                    Monthly throughput, margins, operating expenses, and annual EBITDA yield
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Classification: [{currentStore.financials.sourceType}]
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Monthly Fuel Gallons</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {(currentStore.financials.monthlyFuelVolumeGallons || 0).toLocaleString()} gal
                  </div>
                  <div className="text-[10px] text-cyan-400">@ {currentStore.financials.avgFuelMarginCentsPerGal}¢/gal margin</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Monthly C-Store Sales</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    ${(currentStore.financials.monthlyCStoreRevenue || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-400">@ {currentStore.financials.cStoreGrossMarginPct}% gross margin</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Annual Gross Revenue</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    ${(currentStore.financials.annualTotalRevenue / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-[10px] text-slate-400">Turnover</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Annual EBITDA Yield</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    ${(currentStore.financials.annualEbitda / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">Healthy Operating Margin</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
