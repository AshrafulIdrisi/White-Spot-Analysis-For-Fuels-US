import React, { useState, useEffect } from 'react';
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
  Layers,
  Zap,
  Sliders,
  RotateCcw,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { StoreLocationRecord, WhiteSpotCandidate, ForecourtPumpsConfig, CStoreFootprintConfig } from '../types';
import { analyzeLocationRadius } from '../services/osmService';

interface StoreAnalysisProps {
  locations: StoreLocationRecord[];
  selectedLocation: StoreLocationRecord | null;
  onSelectLocation: (loc: StoreLocationRecord) => void;
  selectedCandidate?: WhiteSpotCandidate | null;
  onSelectCandidate?: (cand: WhiteSpotCandidate) => void;
  candidates?: WhiteSpotCandidate[];
  onNavigateToMap: (cand?: WhiteSpotCandidate) => void;
}

export const StoreAnalysis: React.FC<StoreAnalysisProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  selectedCandidate,
  onSelectCandidate,
  candidates = [],
  onNavigateToMap
}) => {
  // Mode: 'live-target' (Forecourt optimization on live click site) or 'existing-network'
  const [activeMode, setActiveMode] = useState<'live-target' | 'existing-network'>(
    selectedCandidate ? 'live-target' : 'live-target'
  );

  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    selectedCandidate?.id || candidates[0]?.id || ''
  );

  // Sync if selectedCandidate changes from external click on map
  useEffect(() => {
    if (selectedCandidate) {
      setSelectedTargetId(selectedCandidate.id);
      setActiveMode('live-target');
    }
  }, [selectedCandidate?.id, selectedCandidate?.lat, selectedCandidate?.lng]);

  const activeCandidate = (selectedCandidate && (selectedCandidate.id === selectedTargetId || !selectedTargetId))
    ? selectedCandidate
    : (candidates.find(c => c.id === selectedTargetId) || selectedCandidate || candidates[0]);
  const currentStore = selectedLocation || locations[0];

  // Interactive Forecourt Configurator State
  const [mpdCount, setMpdCount] = useState<number>(() => {
    return activeCandidate?.forecourtPumps?.mpdCount || 8;
  });
  const [evPorts, setEvPorts] = useState<number>(() => {
    return activeCandidate?.forecourtPumps?.evDcFastPorts || 8;
  });
  const [cStoreSqFt, setCStoreSqFt] = useState<number>(() => {
    return activeCandidate?.cStoreDetails?.totalCStoreSqFt || 5200;
  });
  const [hasCommercialDiesel, setHasCommercialDiesel] = useState<boolean>(true);
  const [hasCarWash, setHasCarWash] = useState<boolean>(true);

  // Sync state when active candidate changes
  useEffect(() => {
    if (activeCandidate) {
      if (activeCandidate.forecourtPumps) {
        setMpdCount(activeCandidate.forecourtPumps.mpdCount || 8);
        setEvPorts(activeCandidate.forecourtPumps.evDcFastPorts || 8);
      }
      if (activeCandidate.cStoreDetails) {
        setCStoreSqFt(activeCandidate.cStoreDetails.totalCStoreSqFt || 5200);
      }
    }
  }, [activeCandidate?.id]);

  // Derived live calculations based on interactive forecourt configuration
  const fuelingPositions = mpdCount * 2;
  const canopySqFt = mpdCount * 550;
  const ustCapacityGallons = mpdCount * 6500 + (hasCommercialDiesel ? 20000 : 0);
  const estMonthlyGallonsPerNozzle = 12500;
  const totalMonthlyFuelGallons = fuelingPositions * estMonthlyGallonsPerNozzle;
  const projectedAnnualFuelGallons = totalMonthlyFuelGallons * 12;
  const projectedAnnualFuelGrossProfit = Math.round(projectedAnnualFuelGallons * 0.285);
  
  const projectedAnnualCStoreSales = Math.round(cStoreSqFt * 740);
  const projectedAnnualCStoreGrossProfit = Math.round(projectedAnnualCStoreSales * 0.38);

  const projectedAnnualEvRevenue = evPorts * 18500;
  const projectedCarWashRevenue = hasCarWash ? 280000 : 0;

  const totalAnnualGrossMargin = projectedAnnualFuelGrossProfit + projectedAnnualCStoreGrossProfit + projectedAnnualEvRevenue + projectedCarWashRevenue;
  const estimatedOperatingExpenses = Math.round(620000 + (cStoreSqFt * 35) + (mpdCount * 12000));
  const projectedAnnualEbitda = Math.max(350000, totalAnnualGrossMargin - estimatedOperatingExpenses);

  const estimatedCapEx = Math.round(
    2200000 + // Land acquisition
    (mpdCount * 95000) + // MPDs, UST tanks, piping
    (cStoreSqFt * 360) + // Building construction
    (evPorts * 55000) + // DC Fast Chargers 350kW
    (hasCarWash ? 650000 : 0) + // Touchless wash
    450000 // Civil & canopy
  );

  const estimatedPaybackYears = Math.round((estimatedCapEx / projectedAnnualEbitda) * 10) / 10;
  const estimatedIrrPct = Math.min(42, Math.round((projectedAnnualEbitda / estimatedCapEx) * 1000) / 10);

  // Hourly utilization chart data
  const hourlyThroughputData = [
    { hour: '6 AM', gallons: Math.round(totalMonthlyFuelGallons / 30 * 0.05), utilization: 38 },
    { hour: '8 AM', gallons: Math.round(totalMonthlyFuelGallons / 30 * 0.12), utilization: 88 },
    { hour: '10 AM', gallons: Math.round(totalMonthlyFuelGallons / 30 * 0.07), utilization: 55 },
    { hour: '12 PM', gallons: Math.round(totalMonthlyFuelGallons / 30 * 0.11), utilization: 82 },
    { hour: '2 PM', gallons: Math.round(totalMonthlyFuelGallons / 30 * 0.08), utilization: 62 },
    { hour: '5 PM', gallons: Math.round(totalMonthlyFuelGallons / 30 * 0.14), utilization: 94 },
    { hour: '8 PM', gallons: Math.round(totalMonthlyFuelGallons / 30 * 0.06), utilization: 48 },
    { hour: '10 PM', gallons: Math.round(totalMonthlyFuelGallons / 30 * 0.03), utilization: 25 },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header & Mode Selector Bar */}
      <div className="bg-white border border-purple-200 p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-purple-700" />
                Forecourt & Pumps Analyzer
              </span>
              <span className="text-xs text-purple-600 font-medium">
                Live Physical Blueprint & Nozzle Economics
              </span>
            </div>
            <h2 className="text-2xl font-black text-purple-950 tracking-tight">
              Forecourt Capacity, Pump Dispensers & EV Architecture
            </h2>
            <p className="text-xs text-purple-700">
              Configure Multi-Product Dispensers (MPDs), underground fuel storage, canopy scale, and Mobil EV™ fast-charge plazas.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-900 font-bold hidden sm:inline">Active Target:</span>
              <select
                value={activeCandidate?.id}
                onChange={(e) => {
                  const target = candidates.find(c => c.id === e.target.value);
                  if (target) {
                    setSelectedTargetId(target.id);
                    if (onSelectCandidate) onSelectCandidate(target);
                  }
                }}
                className="bg-purple-50 text-xs text-purple-950 px-3.5 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-bold cursor-pointer max-w-[220px] truncate"
              >
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.candidateName} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            {onNavigateToMap && (
              <button
                onClick={() => onNavigateToMap(activeCandidate)}
                className="px-3.5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Pick on Map</span>
              </button>
            )}
          </div>
        </div>

        {/* Target Geopoint Context Pill */}
        {activeCandidate && (
          <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-700 flex-shrink-0" />
              <span className="font-bold text-purple-950 truncate">{activeCandidate.address || activeCandidate.candidateName}</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                {activeCandidate.city}, {activeCandidate.state}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-purple-800">
                Corridor AADT: <strong className="text-purple-950 font-bold">{(activeCandidate.aadt || 32000).toLocaleString()} v/d</strong>
              </span>
              <span className="text-purple-800">
                Supply Gap Score: <strong className="text-purple-950 font-bold">{activeCandidate.supplyGapScore || 88} / 100</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4 Key Forecourt Vital Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-purple-700" />
            <span>Fueling Positions</span>
          </div>
          <div className="text-2xl font-black text-purple-950">
            {fuelingPositions} <span className="text-xs font-normal text-purple-600">positions ({mpdCount} MPDs)</span>
          </div>
          <div className="text-[10px] text-purple-700 font-medium">{canopySqFt.toLocaleString()} sq ft canopy coverage</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Mobil EV™ DC Fast Plaza</span>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {evPorts} <span className="text-xs font-normal text-purple-600">Ports (350kW)</span>
          </div>
          <div className="text-[10px] text-amber-700 font-medium">Liquid-cooled CCS / NACS</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Projected Annual Volume</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {(projectedAnnualFuelGallons / 1000000).toFixed(2)}M <span className="text-xs font-normal text-purple-600">Gal/yr</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">${(projectedAnnualFuelGrossProfit / 1000).toFixed(0)}k Fuel Margin</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-purple-700" />
            <span>Annual Asset EBITDA</span>
          </div>
          <div className="text-2xl font-black text-purple-950">
            ${(projectedAnnualEbitda / 1000).toFixed(0)}k <span className="text-xs font-normal text-purple-600">/ yr</span>
          </div>
          <div className="text-[10px] text-purple-700 font-bold">Payback: {estimatedPaybackYears} yrs ({estimatedIrrPct}% IRR)</div>
        </div>
      </div>

      {/* Main Grid: Interactive Forecourt Configurator + Blueprint Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Forecourt Sliders */}
        <div className="bg-white border border-purple-200 rounded-3xl p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-purple-100">
            <h3 className="text-sm font-black text-purple-950 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-700" />
              Forecourt Dimension Configurator
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Live Tuning
            </span>
          </div>

          {/* Slider 1: MPD Count */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-purple-900">Multi-Product Dispensers (MPD):</span>
              <span className="font-black text-purple-700 text-sm">{mpdCount} MPDs ({mpdCount * 2} Nozzles)</span>
            </div>
            <input 
              type="range" 
              min={4} 
              max={16} 
              step={2} 
              value={mpdCount} 
              onChange={(e) => setMpdCount(Number(e.target.value))}
              className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-700"
            />
            <div className="flex justify-between text-[10px] text-purple-600 font-mono">
              <span>4 MPDs (8 Pos)</span>
              <span>8 MPDs (16 Pos)</span>
              <span>16 MPDs (32 Pos)</span>
            </div>
          </div>

          {/* Slider 2: Mobil EV Charging Ports */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-purple-900">350kW DC Fast EV Ports:</span>
              <span className="font-black text-amber-600 text-sm">{evPorts} Ports</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={16} 
              step={2} 
              value={evPorts} 
              onChange={(e) => setEvPorts(Number(e.target.value))}
              className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-purple-600 font-mono">
              <span>0 (None)</span>
              <span>8 Ports</span>
              <span>16 Ultra-Plaza</span>
            </div>
          </div>

          {/* Slider 3: C-Store Square Footage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-purple-900">On the Run™ C-Store Footprint:</span>
              <span className="font-black text-purple-700 text-sm">{cStoreSqFt.toLocaleString()} sq ft</span>
            </div>
            <input 
              type="range" 
              min={3000} 
              max={8500} 
              step={500} 
              value={cStoreSqFt} 
              onChange={(e) => setCStoreSqFt(Number(e.target.value))}
              className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-700"
            />
            <div className="flex justify-between text-[10px] text-purple-600 font-mono">
              <span>3,000 sq ft</span>
              <span>5,000 sq ft</span>
              <span>8,500 sq ft</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/60 border border-purple-100 cursor-pointer">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-purple-950">High-Flow Commercial Diesel</div>
                <div className="text-[10px] text-purple-600">Dual satellite dispensers with bulk DEF nozzle</div>
              </div>
              <input 
                type="checkbox" 
                checked={hasCommercialDiesel} 
                onChange={(e) => setHasCommercialDiesel(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 accent-purple-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/60 border border-purple-100 cursor-pointer">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-purple-950">Touchless Express Car Wash</div>
                <div className="text-[10px] text-purple-600">Enclosed rollover wash bay +$280k annual revenue</div>
              </div>
              <input 
                type="checkbox" 
                checked={hasCarWash} 
                onChange={(e) => setHasCarWash(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 accent-purple-700 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Right 2 Columns: Physical Site Specifications & Fuel Chemistry Blueprint */}
        <div className="lg:col-span-2 space-y-6">
          {/* Engineering Specifications Card */}
          <div className="bg-white border border-purple-200 rounded-3xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-purple-950 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-700" />
              Site Physical Layout & Fuel Logistics Architecture
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">UST Fuel Storage</span>
                <span className="text-lg font-black text-purple-950">{ustCapacityGallons.toLocaleString()} Gal</span>
                <span className="text-[10px] text-purple-600 block">3x Fiberglass Tanks</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Canopy Footprint</span>
                <span className="text-lg font-black text-purple-950">{canopySqFt.toLocaleString()} sq ft</span>
                <span className="text-[10px] text-purple-600 block">16.5 ft Clearance</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Fresh Food Kitchen</span>
                <span className="text-lg font-black text-purple-950">{Math.round(cStoreSqFt * 0.26).toLocaleString()} sq ft</span>
                <span className="text-[10px] text-purple-600 block">On the Run™ Bakery</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">CapEx Estimate</span>
                <span className="text-lg font-black text-purple-950">${(estimatedCapEx / 1000000).toFixed(2)}M</span>
                <span className="text-[10px] text-emerald-600 font-bold">{estimatedPaybackYears} Yr Payback</span>
              </div>
            </div>

            {/* Fuel Grades & Chemistry Matrix */}
            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
              <div className="text-xs font-bold text-purple-950 flex items-center justify-between">
                <span>Dispensable Product Grades at Every MPD:</span>
                <span className="text-emerald-700 font-bold">Synergy Supreme+™ 93 Certified</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-purple-200">
                  <div className="font-bold text-purple-950">Synergy Regular 87</div>
                  <div className="text-[10px] text-purple-600">62% Volume Share</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-200">
                  <div className="font-bold text-purple-950">Synergy Plus 89</div>
                  <div className="text-[10px] text-purple-600">12% Volume Share</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-200">
                  <div className="font-bold text-purple-700">Synergy Supreme+ 93</div>
                  <div className="text-[10px] text-purple-600">18% Premium Share</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-200">
                  <div className="font-bold text-emerald-700">Ultra-Low Diesel / DEF</div>
                  <div className="text-[10px] text-purple-600">Commercial Grade</div>
                </div>
              </div>
            </div>
          </div>

          {/* Diurnal Pump Throughput Chart */}
          <div className="bg-white border border-purple-200 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-purple-950 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-700" />
                  Diurnal Forecourt Nozzle Utilization & Hourly Gallons
                </h3>
                <p className="text-xs text-purple-600">
                  Projected hourly dispensing curve and peak rush hour capacity load
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Peak 94% Utilization
              </span>
            </div>

            <div className="h-60 w-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyThroughputData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <XAxis dataKey="hour" stroke="#7e22ce" fontSize={11} tickLine={false} />
                  <YAxis 
                    yAxisId="left"
                    stroke="#7e22ce" 
                    fontSize={10} 
                    tickLine={false}
                    width={45}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#06b6d4" 
                    fontSize={10} 
                    tickLine={false}
                    domain={[0, 100]}
                    width={35}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d8b4fe', borderRadius: '12px', fontSize: '11px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    formatter={(val: any, name: any) => [
                      name === 'Hourly Fuel Volume (Gal)' ? `${Number(val).toLocaleString()} Gal` : `${val}% Load`,
                      name
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  <Bar yAxisId="left" dataKey="gallons" name="Hourly Fuel Volume (Gal)" fill="#7e22ce" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="utilization" name="Dispenser Utilization (%)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
