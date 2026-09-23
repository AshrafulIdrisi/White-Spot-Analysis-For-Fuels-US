import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Fuel, 
  Users, 
  Navigation, 
  Building, 
  Target, 
  ArrowUpRight, 
  Filter, 
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Layers,
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Compass,
  Sliders,
  Check
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
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { WhiteSpotCandidate, StoreLocationRecord } from '../types';

interface ExecutiveOverviewProps {
  locations: StoreLocationRecord[];
  whiteSpots: WhiteSpotCandidate[];
  onNavigateToMap: () => void;
  onSelectWhiteSpot: (candidate: WhiteSpotCandidate) => void;
  onSelectLocation: (location: StoreLocationRecord) => void;
  onNavigateToDiagnostics?: () => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  locations,
  whiteSpots,
  onNavigateToMap,
  onSelectWhiteSpot,
  onSelectLocation,
  onNavigateToDiagnostics
}) => {
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('suburban-infill');
  const [allocatedSiteIds, setAllocatedSiteIds] = useState<string[]>([]);

  const filteredWhiteSpots = useMemo(() => {
    return whiteSpots.filter(ws => {
      if (selectedState !== 'ALL' && ws.state !== selectedState) return false;
      return true;
    });
  }, [whiteSpots, selectedState]);

  const totalProjectedVolumeGal = filteredWhiteSpots.reduce((sum, ws) => sum + (ws.projectedAnnualFuelGallons || 0), 0);
  const totalProjectedRevenue = filteredWhiteSpots.reduce((sum, ws) => sum + (ws.projectedAnnualTotalRevenue || 0), 0);
  const totalPipelineCapEx = filteredWhiteSpots.reduce((sum, ws) => sum + (ws.estimatedCapEx || 0), 0);
  const avgOpportunityScore = Math.round(filteredWhiteSpots.reduce((sum, ws) => sum + (ws.opportunityScore || 0), 0) / (filteredWhiteSpots.length || 1) * 10) / 10;
  const avgPayback = Math.round(filteredWhiteSpots.reduce((sum, ws) => sum + (ws.estimatedPaybackYears || 0), 0) / (filteredWhiteSpots.length || 1) * 10) / 10;

  // Helper to format chart tick labels cleanly with real place/corridor names or lat/long
  const formatChartLabel = (ws: WhiteSpotCandidate) => {
    // 1. If candidateName has a valid place/corridor name
    if (ws.candidateName && !ws.candidateName.toLowerCase().startsWith('pinned') && !ws.candidateName.toLowerCase().startsWith('custom')) {
      const cleanName = ws.candidateName.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
      if (cleanName.includes(',')) {
        return cleanName.split(',')[0].trim();
      }
      const parts = cleanName.split(' ');
      if (parts.length <= 3) return cleanName;
      return parts.slice(0, 2).join(' ');
    }
    // 2. If it has a real city & state
    if (ws.city && ws.state && ws.city !== 'Analyzed Corridor' && ws.city !== 'Analyzed Catchment' && ws.city !== 'Corridor' && ws.city !== 'Custom') {
      return `${ws.city}, ${ws.state}`;
    }
    // 3. If it has a real street address
    if (ws.address && !ws.address.toLowerCase().startsWith('pinned') && !ws.address.toLowerCase().startsWith('custom') && !ws.address.includes('Trade Node') && !ws.address.includes('Arterial Parcel')) {
      const cleanAddr = ws.address.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
      if (cleanAddr.length > 0) {
        return cleanAddr.split(',')[0].trim();
      }
    }
    // 4. Return precise Lat / Long
    if (typeof ws.lat === 'number' && typeof ws.lng === 'number') {
      return `${ws.lat.toFixed(3)}, ${ws.lng.toFixed(3)}`;
    }
    return ws.city || 'Site';
  };

  // Chart data for Corridor Ranking
  const corridorChartData = useMemo(() => {
    return filteredWhiteSpots.slice(0, 6).map(ws => ({
      name: formatChartLabel(ws),
      fullName: ws.candidateName || `${ws.lat?.toFixed(4)}, ${ws.lng?.toFixed(4)}`,
      score: ws.opportunityScore || 0,
      traffic: Math.round((ws.aadt || 0) / 1000),
      revenueMil: Math.round((ws.projectedAnnualTotalRevenue || 0) / 100000) / 10,
      cityState: ws.city && ws.state && ws.city !== 'Analyzed Corridor' ? `${ws.city}, ${ws.state}` : `${ws.lat?.toFixed(4)}, ${ws.lng?.toFixed(4)}`,
      candidate: ws
    }));
  }, [filteredWhiteSpots]);

  // Dynamically compute Strategic Retail Acquisition Theses based on live incoming whiteSpots data
  const businessScenarios = useMemo(() => {
    // 1. Suburban High-Growth Corridor Infill:
    const suburbanCandidates = [...filteredWhiteSpots].sort((a, b) => {
      const popA = a.pop3Mile || 0;
      const popB = b.pop3Mile || 0;
      return (popB * 0.6 + (b.opportunityScore || 0) * 1000) - (popA * 0.6 + (a.opportunityScore || 0) * 1000);
    });
    const suburbanTarget = suburbanCandidates[0] || null;
    const suburbanMatches = suburbanCandidates.slice(0, 4);
    const suburbanTotalFuel = suburbanMatches.reduce((acc, c) => acc + (c.projectedAnnualFuelGallons || 1450000), 0);
    const suburbanAvgPayback = suburbanMatches.length ? (suburbanMatches.reduce((acc, c) => acc + (c.estimatedPaybackYears || 3.8), 0) / suburbanMatches.length).toFixed(1) : '3.8';
    const suburbanAvgIncome = suburbanTarget?.medianHouseholdIncome || 104000;
    const suburbanTotalCapEx = suburbanMatches.reduce((acc, c) => acc + (c.estimatedCapEx || 5500000), 0);

    // 2. Interstate Mega-Plaza Defense & Out-Positioning:
    const highwayCandidates = [...filteredWhiteSpots].sort((a, b) => {
      const aadtA = a.aadt || 0;
      const aadtB = b.aadt || 0;
      return (aadtB * 0.7 + (b.trafficScore || 0) * 500) - (aadtA * 0.7 + (a.trafficScore || 0) * 500);
    });
    const highwayTarget = highwayCandidates[0] || null;
    const highwayMatches = highwayCandidates.slice(0, 4);
    const highwayTotalFuel = highwayMatches.reduce((acc, c) => acc + (c.projectedAnnualFuelGallons || 2800000), 0);
    const highwayAvgPayback = highwayMatches.length ? (highwayMatches.reduce((acc, c) => acc + (c.estimatedPaybackYears || 4.1), 0) / highwayMatches.length).toFixed(1) : '4.1';
    const highwayAadt = highwayTarget?.aadt || 58000;
    const highwayTotalCapEx = highwayMatches.reduce((acc, c) => acc + (c.estimatedCapEx || 7800000), 0);

    // 3. High-Margin Premium Retail & C-Store Optimization:
    const premiumCandidates = [...filteredWhiteSpots].sort((a, b) => {
      const cstoreA = a.projectedAnnualCStoreRevenue || 0;
      const cstoreB = b.projectedAnnualCStoreRevenue || 0;
      const incA = a.medianHouseholdIncome || 0;
      const incB = b.medianHouseholdIncome || 0;
      return (cstoreB + incB * 10) - (cstoreA + incA * 10);
    });
    const premiumTarget = premiumCandidates[0] || null;
    const premiumMatches = premiumCandidates.slice(0, 4);
    const premiumTotalFuel = premiumMatches.reduce((acc, c) => acc + (c.projectedAnnualFuelGallons || 1150000), 0);
    const premiumAvgPayback = premiumMatches.length ? (premiumMatches.reduce((acc, c) => acc + (c.estimatedPaybackYears || 3.4), 0) / premiumMatches.length).toFixed(1) : '3.4';
    const premiumTotalCapEx = premiumMatches.reduce((acc, c) => acc + (c.estimatedCapEx || 6200000), 0);

    return [
      {
        id: 'suburban-infill',
        title: 'Suburban High-Growth Corridor Infill',
        problem: 'High-income residential growth nodes have massive fuel and fresh food voids, allowing regional competitors to capture new commuter lifetime value.',
        solution: 'Deploy high-throughput 8-MPD forecourt with gourmet market and EV fast chargers.',
        targetCandidate: suburbanTarget,
        matchingCandidates: suburbanMatches,
        keyMetrics: { 
          demandGap: suburbanTotalFuel > 0 ? `${(suburbanTotalFuel / 1000000).toFixed(2)}M Gal/yr` : '1.45M Gal/yr', 
          primaryIndicator: `$${Math.round(suburbanAvgIncome / 1000)}k Income`, 
          payback: `${suburbanAvgPayback} Yrs`, 
          risk: (suburbanTarget?.opportunityScore || 85) >= 80 ? 'Low' : 'Moderate',
          matchingCount: suburbanMatches.length,
          totalCapEx: suburbanTotalCapEx
        },
        color: 'border-purple-200 bg-purple-50/50',
        badge: 'Core Growth'
      },
      {
        id: 'highway-defense',
        title: 'Interstate Mega-Plaza Defense & Out-Positioning',
        problem: 'Mega-operators intercept long-distance highway traffic with large super-centers.',
        solution: 'Acquire high-AADT interchange parcels and build 16-MPD travel centers with high-speed diesel & 350kW EV plazas.',
        targetCandidate: highwayTarget,
        matchingCandidates: highwayMatches,
        keyMetrics: { 
          demandGap: highwayTotalFuel > 0 ? `${(highwayTotalFuel / 1000000).toFixed(2)}M Gal/yr` : '2.80M Gal/yr', 
          primaryIndicator: `${highwayAadt.toLocaleString()} AADT`, 
          payback: `${highwayAvgPayback} Yrs`, 
          risk: (highwayTarget?.opportunityScore || 80) >= 80 ? 'Moderate' : 'High',
          matchingCount: highwayMatches.length,
          totalCapEx: highwayTotalCapEx
        },
        color: 'border-purple-200 bg-purple-50/50',
        badge: 'Interstate Defense'
      },
      {
        id: 'premium-turnaround',
        title: 'High-Margin Premium Retail Strategy',
        problem: 'Underserved luxury vehicle corridors are buying fuel at discounters due to lack of tier-one premium branded stations.',
        solution: 'Target high-density affluent suburbs and optimize dispenser blending for 38%+ premium fuel sales mix.',
        targetCandidate: premiumTarget,
        matchingCandidates: premiumMatches,
        keyMetrics: { 
          demandGap: premiumTotalFuel > 0 ? `${(premiumTotalFuel / 1000000).toFixed(2)}M Gal/yr` : '1.15M Gal/yr', 
          primaryIndicator: '42% Prem. Share', 
          payback: `${premiumAvgPayback} Yrs`, 
          risk: 'Low',
          matchingCount: premiumMatches.length,
          totalCapEx: premiumTotalCapEx
        },
        color: 'border-purple-200 bg-purple-50/50',
        badge: 'High-Margin Retail'
      }
    ];
  }, [filteredWhiteSpots]);

  // Active Selected Thesis
  const activeScenario = businessScenarios.find(s => s.id === activeScenarioId) || businessScenarios[0];

  // Matching Candidates for Active Thesis
  const activeMatchingCandidates = activeScenario?.matchingCandidates || [];

  // Compute live capital allocation metrics based on selected sites
  const activeAllocatedSites = activeMatchingCandidates.filter(c => 
    allocatedSiteIds.length === 0 || allocatedSiteIds.includes(c.id)
  );

  const modelTotalCapEx = activeAllocatedSites.reduce((sum, c) => sum + (c.estimatedCapEx || 5500000), 0);
  const modelTotalGallons = activeAllocatedSites.reduce((sum, c) => sum + (c.projectedAnnualFuelGallons || 1400000), 0);
  const modelTotalRevenue = activeAllocatedSites.reduce((sum, c) => sum + (c.projectedAnnualTotalRevenue || 6500000), 0);
  const modelTotalEbitda = activeAllocatedSites.reduce((sum, c) => sum + (c.projectedAnnualEbitda || (c.projectedAnnualTotalRevenue ? c.projectedAnnualTotalRevenue * 0.16 : 850000)), 0);
  const modelAvgPayback = activeAllocatedSites.length ? (activeAllocatedSites.reduce((sum, c) => sum + (c.estimatedPaybackYears || 3.8), 0) / activeAllocatedSites.length).toFixed(1) : '3.8';
  const modelUnleveredIrr = modelTotalCapEx > 0 ? Math.round((modelTotalEbitda / modelTotalCapEx) * 100 * 1.35 * 10) / 10 : 22.4;

  const toggleSiteAllocation = (siteId: string) => {
    setAllocatedSiteIds(prev => {
      if (prev.includes(siteId)) {
        return prev.filter(id => id !== siteId);
      } else {
        return [...prev, siteId];
      }
    });
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Top Hero Section */}
      <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                White Spot Intelligence Platform
              </span>
              <span className="text-xs text-purple-600 font-mono font-medium">
                Live Data: {filteredWhiteSpots.length} Pipeline Sites
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">
              Retail Fuel &amp; Forecourt Network Expansion
            </h1>
            <p className="text-sm text-purple-700 leading-relaxed">
              Detect spatial voids, under-pumped arterial corridors, and underserved commuter zones with live OpenStreetMap competitor feeds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* State Filter Selector */}
            <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-3 py-2 rounded-2xl">
              <Filter className="w-3.5 h-3.5 text-purple-700" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-xs font-bold text-purple-950 outline-none cursor-pointer"
              >
                <option value="ALL">All US States ({whiteSpots.length})</option>
                {Array.from(new Set(whiteSpots.map(w => w.state).filter(Boolean))).sort().map(st => (
                  <option key={st} value={st}>{st} State</option>
                ))}
              </select>
            </div>

            {onNavigateToDiagnostics && (
              <button
                onClick={onNavigateToDiagnostics}
                className="px-4 py-3 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-purple-700" />
                <span>Location Diagnostics</span>
              </button>
            )}

            <button
              onClick={onNavigateToMap}
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Launch Live GIS Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Strategic Playbook Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-purple-950 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-700" />
              Strategic Growth Vectors &amp; Case Studies
            </h2>
            <p className="text-xs text-purple-600">
              Select an acquisition thesis to model capital allocation across target corridors (dynamically updates with live data):
            </p>
          </div>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/70 border border-purple-200 px-3 py-1 rounded-xl self-start sm:self-auto">
            ⚡ Dynamic: {businessScenarios.reduce((sum, s) => sum + s.matchingCandidates.length, 0)} Corridors Analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {businessScenarios.map((scen) => (
            <div
              key={scen.id}
              onClick={() => {
                setActiveScenarioId(scen.id);
                if (scen.targetCandidate) {
                  onSelectWhiteSpot(scen.targetCandidate);
                }
              }}
              className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 shadow-md ${scen.color} ${activeScenarioId === scen.id ? 'ring-2 ring-purple-600 bg-purple-100/70 shadow-lg' : 'hover:border-purple-300 hover:bg-purple-50'}`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-200 text-purple-900">
                  {scen.badge}
                </span>
                <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                  Model Allocation <ArrowRight className="w-3 h-3" />
                </span>
              </div>

              <h3 className="text-sm font-black text-purple-950 leading-snug">
                {scen.title}
              </h3>

              <p className="text-xs text-purple-800 line-clamp-2">
                {scen.problem}
              </p>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-purple-200 text-center text-[10px]">
                <div className="p-1.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-purple-600 block text-[9px] font-bold">Top Node</span>
                  <span className="font-bold text-purple-950 truncate block">{scen.targetCandidate?.city || 'Corridor'}</span>
                </div>
                <div className="p-1.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-purple-600 block text-[9px] font-bold">Fuel Gap</span>
                  <span className="font-bold text-emerald-600 truncate block">{scen.keyMetrics.demandGap}</span>
                </div>
                <div className="p-1.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-purple-600 block text-[9px] font-bold">Payback</span>
                  <span className="font-bold text-purple-700 block">{scen.keyMetrics.payback}</span>
                </div>
                <div className="p-1.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-purple-600 block text-[9px] font-bold">Risk</span>
                  <span className="font-bold text-purple-950 block">{scen.keyMetrics.risk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Acquisition Thesis Capital Allocation & Portfolio Modeler */}
        {activeScenario && (
          <div className="p-6 rounded-3xl bg-white border-2 border-purple-300 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-purple-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white">
                    Active Capital Allocation Model
                  </span>
                  <span className="text-xs font-bold text-purple-900">{activeScenario.title}</span>
                </div>
                <p className="text-xs text-purple-700 mt-1">
                  {activeScenario.solution}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start lg:self-auto">
                {activeScenario.targetCandidate && (
                  <button
                    onClick={() => onSelectWhiteSpot(activeScenario.targetCandidate!)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Inspect Top Site ({activeScenario.targetCandidate.city || 'Flagship'})
                  </button>
                )}
                <button
                  onClick={onNavigateToMap}
                  className="px-3.5 py-2 bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-purple-700" />
                  View On Map
                </button>
              </div>
            </div>

            {/* Dynamic Pro-Forma Summary for Active Thesis Portfolio */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
                <span className="text-[10px] font-bold text-purple-600 block uppercase">Allocated CapEx</span>
                <span className="text-lg font-black text-purple-950">${(modelTotalCapEx / 1000000).toFixed(1)}M</span>
                <span className="text-[10px] text-purple-600 block">{activeAllocatedSites.length} Selected Sites</span>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
                <span className="text-[10px] font-bold text-purple-600 block uppercase">Annual Net Gallons</span>
                <span className="text-lg font-black text-emerald-600">{((modelTotalGallons) / 1000000).toFixed(2)}M</span>
                <span className="text-[10px] text-emerald-600 block">Fuel Capture/Yr</span>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
                <span className="text-[10px] font-bold text-purple-600 block uppercase">Gross Turnover</span>
                <span className="text-lg font-black text-purple-950">${(modelTotalRevenue / 1000000).toFixed(1)}M</span>
                <span className="text-[10px] text-purple-600 block">Fuel + C-Store/Yr</span>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
                <span className="text-[10px] font-bold text-purple-600 block uppercase">Projected EBITDA</span>
                <span className="text-lg font-black text-purple-700">${(modelTotalEbitda / 1000000).toFixed(2)}M</span>
                <span className="text-[10px] text-purple-600 block">Operating Income</span>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
                <span className="text-[10px] font-bold text-purple-600 block uppercase">Unlevered IRR</span>
                <span className="text-lg font-black text-emerald-600">{modelUnleveredIrr}%</span>
                <span className="text-[10px] text-emerald-600 block">10-Yr Pro-Forma</span>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
                <span className="text-[10px] font-bold text-purple-600 block uppercase">Blended Payback</span>
                <span className="text-lg font-black text-purple-950">{modelAvgPayback} Yrs</span>
                <span className="text-[10px] text-purple-600 block">Capital Recovery</span>
              </div>
            </div>

            {/* Target Corridors Matching this Thesis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-700" />
                  Target Corridor Pipeline Matching &quot;{activeScenario.title}&quot;
                </span>
                <span className="text-[11px] text-purple-600">
                  Select corridors to include in pro-forma capital model:
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {activeMatchingCandidates.map((candidate, idx) => {
                  const isAllocated = allocatedSiteIds.length === 0 || allocatedSiteIds.includes(candidate.id);
                  return (
                    <div
                      key={candidate.id}
                      onClick={() => onSelectWhiteSpot(candidate)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${isAllocated ? 'bg-purple-50/80 border-purple-300 shadow-sm' : 'bg-slate-50/60 border-slate-200 opacity-60'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-purple-900 bg-purple-200/80 px-2 py-0.5 rounded-md">
                          Rank #{idx + 1}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSiteAllocation(candidate.id);
                          }}
                          className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${isAllocated ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                          title="Toggle capital allocation inclusion"
                        >
                          <Check className="w-3 h-3" />
                          <span>{isAllocated ? 'Allocated' : 'Omit'}</span>
                        </button>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-purple-950 truncate">
                          {candidate.candidateName}
                        </div>
                        <div className="text-[11px] text-purple-700">
                          {candidate.city}, {candidate.state} • Score: <span className="font-black text-purple-900">{candidate.opportunityScore}/100</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-1.5 border-t border-purple-200/60 text-[10px]">
                        <div>
                          <span className="text-purple-600 block text-[9px]">Corridor AADT</span>
                          <span className="font-bold text-purple-950">{(candidate.aadt || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-purple-600 block text-[9px]">CapEx Sizing</span>
                          <span className="font-bold text-purple-950">${((candidate.estimatedCapEx || 5500000) / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-purple-200 shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-600 font-semibold">
            <span>Identified Pipeline</span>
            <Target className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl font-black text-purple-950">
            {filteredWhiteSpots.length} <span className="text-xs font-semibold text-purple-600">sites</span>
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>Avg Score: {avgOpportunityScore}/100</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-purple-200 shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-600 font-semibold">
            <span>Annual Fuel Demand</span>
            <Fuel className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl font-black text-purple-950">
            {(totalProjectedVolumeGal / 1000000).toFixed(1)}M <span className="text-xs font-semibold text-purple-600">gal/yr</span>
          </div>
          <div className="text-[11px] text-purple-600 font-medium">
            Unmet retail gallon voids
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-purple-200 shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-600 font-semibold">
            <span>Pipeline Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-purple-950">
            ${(totalProjectedRevenue / 1000000).toFixed(1)}M <span className="text-xs font-semibold text-purple-600">/yr</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">
            Fuel + C-Store Sales
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-purple-200 shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-600 font-semibold">
            <span>Average Payback</span>
            <ShieldCheck className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl font-black text-purple-950">
            {avgPayback} <span className="text-xs font-semibold text-purple-600">years</span>
          </div>
          <div className="text-[11px] text-purple-600 font-medium">
            CapEx: ${(totalPipelineCapEx / 1000000).toFixed(1)}M total
          </div>
        </div>
      </div>

      {/* Executive Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Pipeline Opportunity Index vs Traffic Volume */}
        <div className="p-5 rounded-3xl bg-white border border-purple-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-purple-950 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-700" />
                Pipeline Opportunity Index vs Traffic Volume
              </h3>
              <p className="text-xs text-purple-600">
                Composite Opportunity Index (0–100) vs Daily Corridor Traffic (k AADT) across top expansion candidates
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Ranked Pipeline
            </span>
          </div>

          <div className="h-64 w-full min-h-[240px]">
            {corridorChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={corridorChartData} margin={{ top: 10, right: 15, left: 5, bottom: 30 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#7e22ce" 
                    fontSize={10} 
                    tickLine={false} 
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis 
                    stroke="#7e22ce" 
                    fontSize={10} 
                    tickLine={false} 
                    domain={[0, 100]}
                    width={35}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d8b4fe', borderRadius: '12px', fontSize: '11px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    formatter={(val: any, name: any, item: any) => [
                      name === 'Pipeline Opportunity Index' ? `${val} / 100` : `${val}k vehicles/day`,
                      item?.payload?.cityState ? `${name} (${item.payload.cityState})` : name
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  <Bar dataKey="score" name="Pipeline Opportunity Index" fill="#7e22ce" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="traffic" name="Traffic Volume (k AADT)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-purple-600">
                No active candidate sites available for chart.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Pipeline Opportunity vs Projected Annual Turnover ($M) */}
        <div className="p-5 rounded-3xl bg-white border border-purple-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-purple-950 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Pipeline Opportunity Index vs Revenue ($M)
              </h3>
              <p className="text-xs text-purple-600">
                Underwritten fuel + c-store turnover ($M/yr) correlated against Pipeline Opportunity Score
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Pro-Forma DCF
            </span>
          </div>

          <div className="h-64 w-full min-h-[240px]">
            {corridorChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={corridorChartData} margin={{ top: 10, right: 15, left: 5, bottom: 30 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#7e22ce" 
                    fontSize={10} 
                    tickLine={false} 
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis 
                    stroke="#7e22ce" 
                    fontSize={10} 
                    tickLine={false} 
                    width={45}
                    tickFormatter={(val) => `$${val}M`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d8b4fe', borderRadius: '12px', fontSize: '11px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    formatter={(val: any, name: any, item: any) => [
                      name === 'Pipeline Revenue ($M)' ? `$${val}M / yr` : `${val} / 100`,
                      item?.payload?.cityState ? `${name} (${item.payload.cityState})` : name
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  <Bar dataKey="revenueMil" name="Pipeline Revenue ($M)" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-purple-600">
                No active candidate revenue data.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top High-Priority White Spot Ranking Table */}
      <div className="p-5 rounded-3xl bg-white border border-purple-200 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
          <div>
            <h3 className="text-base font-black text-purple-950">
              Prioritized White Spot Pipeline (1/3/5-Mile Evaluated)
            </h3>
            <p className="text-xs text-purple-600">
              Click any candidate to inspect its OpenStreetMap competitor pumps, risk matrix, and full pro-forma:
            </p>
          </div>
          <button
            onClick={onNavigateToMap}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All on GIS Map</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {filteredWhiteSpots.length === 0 ? (
          <div className="p-8 text-center text-xs text-purple-700">
            No saved white spots yet. Open the map or scanner to discover and save trade area voids.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-purple-100 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50 text-purple-800 text-[10px] uppercase font-bold border-b border-purple-100">
                <tr>
                  <th className="p-3">Rank &amp; Node</th>
                  <th className="p-3">Location &amp; State</th>
                  <th className="p-3">Corridor AADT</th>
                  <th className="p-3">3M Population</th>
                  <th className="p-3">Unmet Fuel Gap</th>
                  <th className="p-3">Opportunity Score</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 text-purple-900 font-medium">
                {filteredWhiteSpots.slice(0, 5).map((ws, idx) => (
                  <tr 
                    key={ws.id}
                    onClick={() => onSelectWhiteSpot(ws)}
                    className="hover:bg-purple-50/70 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-bold text-purple-950 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 flex items-center justify-center text-[10px] font-black">
                        #{idx + 1}
                      </span>
                      <span className="truncate max-w-[180px]">{ws.candidateName}</span>
                    </td>
                    <td className="p-3">
                      <div className="text-purple-950 font-bold">{ws.city}, {ws.state}</div>
                      <div className="text-[10px] text-purple-600">{ws.county || 'County'}</div>
                    </td>
                    <td className="p-3 font-semibold text-purple-900">
                      {(ws.aadt || 0).toLocaleString()} vehicles/day
                    </td>
                    <td className="p-3 font-semibold text-purple-900">
                      {(ws.pop3Mile || 0).toLocaleString()} residents
                    </td>
                    <td className="p-3 font-bold text-emerald-600">
                      {((ws.projectedAnnualFuelGallons || 0) / 1000000).toFixed(2)}M gal/yr
                    </td>
                    <td className="p-3 font-black text-purple-700">
                      {ws.opportunityScore} / 100
                    </td>
                    <td className="p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectWhiteSpot(ws);
                        }}
                        className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        1/3/5M Analysis
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
