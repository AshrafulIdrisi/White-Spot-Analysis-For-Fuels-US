import React, { useState } from 'react';
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
  Compass
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
  Cell 
} from 'recharts';
import { WhiteSpotCandidate, StoreLocationRecord } from '../types';

interface ExecutiveOverviewProps {
  locations: StoreLocationRecord[];
  whiteSpots: WhiteSpotCandidate[];
  onNavigateToMap: () => void;
  onSelectWhiteSpot: (candidate: WhiteSpotCandidate) => void;
  onSelectLocation: (location: StoreLocationRecord) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  locations,
  whiteSpots,
  onNavigateToMap,
  onSelectWhiteSpot,
  onSelectLocation,
}) => {
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('suburban-infill');

  const filteredWhiteSpots = whiteSpots.filter(ws => {
    if (selectedState !== 'ALL' && ws.state !== selectedState) return false;
    return true;
  });

  const totalProjectedVolumeGal = filteredWhiteSpots.reduce((sum, ws) => sum + (ws.projectedAnnualFuelGallons || 0), 0);
  const totalProjectedRevenue = filteredWhiteSpots.reduce((sum, ws) => sum + (ws.projectedAnnualTotalRevenue || 0), 0);
  const totalPipelineCapEx = filteredWhiteSpots.reduce((sum, ws) => sum + (ws.estimatedCapEx || 0), 0);
  const avgOpportunityScore = Math.round(filteredWhiteSpots.reduce((sum, ws) => sum + (ws.opportunityScore || 0), 0) / (filteredWhiteSpots.length || 1) * 10) / 10;
  const avgPayback = Math.round(filteredWhiteSpots.reduce((sum, ws) => sum + (ws.estimatedPaybackYears || 0), 0) / (filteredWhiteSpots.length || 1) * 10) / 10;

  // Chart data for Corridor Ranking
  const corridorChartData = filteredWhiteSpots.slice(0, 6).map(ws => ({
    name: ws.candidateName?.split(' ')[0] + ' ' + (ws.candidateName?.split(' ')[1] || ''),
    score: ws.opportunityScore || 0,
    traffic: Math.round((ws.aadt || 0) / 1000),
    revenueMil: Math.round((ws.projectedAnnualTotalRevenue || 0) / 100000) / 10,
    cityState: `${ws.city}, ${ws.state}`,
    candidate: ws
  }));

  // Strategic Retail Business Scenarios
  const businessScenarios = [
    {
      id: 'suburban-infill',
      title: 'Suburban High-Growth Corridor Infill',
      problem: 'High-income residential growth nodes have massive fuel and fresh food voids, allowing regional competitors to capture new commuter lifetime value.',
      solution: 'Deploy high-throughput 8-MPD forecourt with gourmet market and EV fast chargers.',
      targetCandidate: whiteSpots.find(w => w.state === 'TX') || whiteSpots[0] || null,
      keyMetrics: { demandGap: '1.45M Gal/yr', medianIncome: '$104k', payback: '3.8 Yrs', risk: 'Low' },
      color: 'border-purple-200 bg-purple-50/50',
      badge: 'Core Growth'
    },
    {
      id: 'highway-defense',
      title: 'Interstate Mega-Plaza Defense & Out-Positioning',
      problem: 'Mega-operators intercept long-distance highway traffic with large super-centers.',
      solution: 'Acquire high-AADT interchange parcels and build 16-MPD travel centers with high-speed diesel & 350kW EV plazas.',
      targetCandidate: whiteSpots.find(w => w.state === 'FL' || w.state === 'GA') || whiteSpots[1] || null,
      keyMetrics: { demandGap: '2.80M Gal/yr', trafficAadt: '58,000 AADT', payback: '4.1 Yrs', risk: 'Moderate' },
      color: 'border-purple-200 bg-purple-50/50',
      badge: 'Interstate Defense'
    },
    {
      id: 'premium-turnaround',
      title: 'High-Margin Premium Retail Strategy',
      problem: 'Underserved luxury vehicle corridors are buying fuel at discounters due to lack of tier-one premium branded stations.',
      solution: 'Target high-density affluent suburbs and optimize dispenser blending for 38%+ premium fuel sales mix.',
      targetCandidate: whiteSpots.find(w => w.state === 'NC' || w.state === 'FL') || whiteSpots[2] || null,
      keyMetrics: { demandGap: '1.15M Gal/yr', premiumShare: '42% Target', payback: '3.4 Yrs', risk: 'Low' },
      color: 'border-purple-200 bg-purple-50/50',
      badge: 'High-Margin Retail'
    }
  ];

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
              <span className="text-xs text-purple-600 font-mono font-medium">Real-Time OSM Scanner</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">
              Retail Fuel & Forecourt Network Expansion
            </h1>
            <p className="text-sm text-purple-700 leading-relaxed">
              Detect spatial voids, under-pumped arterial corridors, and underserved commuter zones with live OpenStreetMap competitor feeds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-purple-950 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-700" />
              Strategic Growth Vectors & Case Studies
            </h2>
            <p className="text-xs text-purple-600">
              Select an acquisition thesis to model capital allocation across target corridors:
            </p>
          </div>
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
              className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 shadow-md ${scen.color} ${activeScenarioId === scen.id ? 'ring-2 ring-purple-600 bg-purple-100/60' : 'hover:border-purple-300'}`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-200 text-purple-900">
                  {scen.badge}
                </span>
                <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                  Inspect Site <ArrowRight className="w-3 h-3" />
                </span>
              </div>

              <h3 className="text-sm font-black text-purple-950 leading-snug">
                {scen.title}
              </h3>

              <p className="text-xs text-purple-800 line-clamp-2">
                {scen.problem}
              </p>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-purple-200 text-center text-[10px]">
                <div className="p-1.5 bg-white rounded-xl border border-purple-100">
                  <span className="text-purple-600 block text-[9px] font-bold">Target Site</span>
                  <span className="font-bold text-purple-950 truncate block">{scen.targetCandidate?.city || 'Selected'}</span>
                </div>
                <div className="p-1.5 bg-white rounded-xl border border-purple-100">
                  <span className="text-purple-600 block text-[9px] font-bold">Fuel Gap</span>
                  <span className="font-bold text-emerald-600">{scen.keyMetrics.demandGap}</span>
                </div>
                <div className="p-1.5 bg-white rounded-xl border border-purple-100">
                  <span className="text-purple-600 block text-[9px] font-bold">Payback</span>
                  <span className="font-bold text-purple-700">{scen.keyMetrics.payback}</span>
                </div>
                <div className="p-1.5 bg-white rounded-xl border border-purple-100">
                  <span className="text-purple-600 block text-[9px] font-bold">Risk</span>
                  <span className="font-bold text-purple-950">{scen.keyMetrics.risk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
                  <th className="p-3">Rank & Node</th>
                  <th className="p-3">Location & State</th>
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
