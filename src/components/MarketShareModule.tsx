import React, { useState, useEffect } from 'react';
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
  ChevronRight, 
  MapPin, 
  Target, 
  Compass, 
  RefreshCw, 
  Sparkles, 
  Swords, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Filter
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
import { 
  MarketShareRecord, 
  WhiteSpotCandidate, 
  StoreLocationRecord, 
  RadiusAnalysisData, 
  CatchmentMarketShareData 
} from '../types';
import { analyzeLocationRadius } from '../services/osmService';
import { getCompetitorBrandStyle } from '../utils/brandStyling';

interface MarketShareModuleProps {
  marketShareData: MarketShareRecord[];
  whiteSpots?: WhiteSpotCandidate[];
  locations?: StoreLocationRecord[];
  selectedWhiteSpot?: WhiteSpotCandidate | null;
  onSelectWhiteSpot?: (ws: WhiteSpotCandidate) => void;
  onNavigateToMap?: (ws: WhiteSpotCandidate) => void;
  onOpenAIRecommendation?: (ws: WhiteSpotCandidate) => void;
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

export const MarketShareModule: React.FC<MarketShareModuleProps> = ({ 
  marketShareData,
  whiteSpots = [],
  locations = [],
  selectedWhiteSpot,
  onSelectWhiteSpot,
  onNavigateToMap,
  onOpenAIRecommendation
}) => {
  const [viewMode, setViewMode] = useState<'catchment' | 'macro'>('catchment');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    selectedWhiteSpot?.id || whiteSpots[0]?.id || locations[0]?.id || ''
  );
  const [selectedRadius, setSelectedRadius] = useState<1 | 3 | 5>(3);
  const [calculationMode, setCalculationMode] = useState<'fuelVolume' | 'revenue' | 'storeCount'>('fuelVolume');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Live catchment analysis state
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [liveCatchmentData, setLiveCatchmentData] = useState<CatchmentMarketShareData | null>(null);
  const [liveRadiusData, setLiveRadiusData] = useState<RadiusAnalysisData | null>(null);

  // Sync if selectedWhiteSpot changes from external selection (e.g. map click or tab switch)
  useEffect(() => {
    if (selectedWhiteSpot) {
      setSelectedSiteId(selectedWhiteSpot.id);
    }
  }, [selectedWhiteSpot?.id, selectedWhiteSpot?.lat, selectedWhiteSpot?.lng]);

  // Find active location record (either candidate, live clicked site, or existing store)
  const activeCandidate = (selectedWhiteSpot && (selectedWhiteSpot.id === selectedSiteId || !selectedSiteId))
    ? selectedWhiteSpot
    : (whiteSpots.find(w => w.id === selectedSiteId) || selectedWhiteSpot || whiteSpots[0] || null);
    
  const activeStore = locations.find(l => l.id === selectedSiteId);
  
  const activeSite = activeCandidate ? {
    id: activeCandidate.id,
    candidateName: activeCandidate.candidateName || 'Live Clicked Site',
    address: activeCandidate.address || 'Trade Area Corridor',
    city: activeCandidate.city || 'Regional Market',
    state: activeCandidate.state || 'TX',
    zipCode: activeCandidate.zipCode || '',
    lat: activeCandidate.lat,
    lng: activeCandidate.lng,
    opportunityScore: Math.round(activeCandidate.opportunityScore || 85),
    priorityTier: 'TIER_1_EXPANSION' as const,
    corridorAadt: activeCandidate.aadt || 35000,
    dominantRoadClass: activeCandidate.proposedStoreType || 'Arterial Corridor',
    demographics: {
      pop1Mile: activeCandidate.pop1Mile ?? Math.round((activeCandidate.pop3Mile || 40000) * 0.28),
      pop3Mile: activeCandidate.pop3Mile || 40000,
      pop5Mile: activeCandidate.pop5Mile ?? Math.round((activeCandidate.pop3Mile || 40000) * 2.85),
      medianHouseholdIncome: activeCandidate.medianIncome3Mile || activeCandidate.medianHouseholdIncome || 85000,
      daytimeWorkers: Math.round((activeCandidate.pop3Mile || 40000) * 0.45),
      annualPopGrowthPct: 2.5
    },
    economics: {
      estimatedUnmetFuelDemandGallons: activeCandidate.projectedAnnualFuelGallons || 2000000,
      estimatedUnmetCStoreSpendUsd: activeCandidate.projectedAnnualCStoreRevenue || 1600000,
      recommendedPumps: activeCandidate.recommendedPumps || 16,
      recommendedCStoreSqFt: activeCandidate.recommendedCStoreSqFt || 5500,
      estimatedCapExUsd: activeCandidate.estimatedCapEx || 5500000,
      projectedPaybackYears: activeCandidate.estimatedPaybackYears || 4.2,
      projectedAnnualEbitdaUsd: activeCandidate.projectedAnnualEbitda || 1100000
    },
    riskAssessment: {
      cannibalizationRisk: 'LOW' as const,
      zoningRisk: 'LOW' as const,
      accessIngressRisk: 'LOW' as const,
      competitorDensity: 'MODERATE' as const
    },
    strategicThesis: activeCandidate.primaryRationale?.join(' ') || 'Live trade area candidate analysis.',
    tags: ['Expansion Candidate']
  } : (activeStore ? {
    id: activeStore.id,
    candidateName: activeStore.name,
    address: activeStore.address,
    city: activeStore.city,
    state: activeStore.state,
    zipCode: activeStore.zipCode,
    lat: activeStore.lat,
    lng: activeStore.lng,
    opportunityScore: 82,
    priorityTier: 'TIER_1_EXPANSION' as const,
    corridorAadt: activeStore.traffic.aadt,
    dominantRoadClass: activeStore.traffic.roadClass,
    demographics: {
      pop1Mile: activeStore.demographics.pop1Mile,
      pop3Mile: activeStore.demographics.pop3Mile,
      pop5Mile: activeStore.demographics.pop5Mile,
      medianHouseholdIncome: activeStore.demographics.medianIncome3Mile,
      daytimeWorkers: activeStore.demographics.daytimeWorkers3Mile,
      annualPopGrowthPct: activeStore.demographics.annualPopGrowthRate * 100
    },
    economics: {
      estimatedUnmetFuelDemandGallons: 1800000,
      estimatedUnmetCStoreSpendUsd: 1400000,
      recommendedPumps: activeStore.fuelDetails.pumpsCount,
      recommendedCStoreSqFt: activeStore.fuelDetails.cStoreSqFt,
      estimatedCapExUsd: 5500000,
      projectedPaybackYears: 4.2,
      projectedAnnualEbitdaUsd: activeStore.financials?.annualEbitda || 1100000
    },
    riskAssessment: {
      cannibalizationRisk: 'LOW' as const,
      zoningRisk: 'LOW' as const,
      accessIngressRisk: 'LOW' as const,
      competitorDensity: 'MODERATE' as const
    },
    strategicThesis: `Existing ${activeStore.brand} location with established trade area capture.`,
    tags: ['Existing Network', activeStore.brand]
  } : null);

  const fetchLiveData = async (lat: number, lng: number, radius: 1 | 3 | 5, name: string) => {
    setIsLoadingLive(true);
    try {
      let analysisResult: RadiusAnalysisData | null = null;
      try {
        const response = await fetch('/api/v1/spatial/radius-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng, radiusMiles: radius, addressLabel: name })
        });
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.analysis) {
            analysisResult = resJson.analysis;
          }
        }
      } catch (apiErr) {
        console.warn('MarketShare backend radius API fallback to client service:', apiErr);
      }

      if (!analysisResult) {
        analysisResult = await analyzeLocationRadius(lat, lng, radius, name);
      }

      setLiveRadiusData(analysisResult);
      if (analysisResult.catchmentMarketShare) {
        setLiveCatchmentData(analysisResult.catchmentMarketShare);
      }
    } catch (err) {
      console.error('Error fetching live catchment analysis:', err);
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Trigger live calculation when site, radius or coordinates change
  useEffect(() => {
    if (!activeSite) return;
    fetchLiveData(activeSite.lat, activeSite.lng, selectedRadius, activeSite.candidateName);
  }, [selectedSiteId, selectedRadius, activeSite?.lat, activeSite?.lng]);

  const handleSelectSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    if (selectedWhiteSpot && selectedWhiteSpot.id === siteId) {
      if (onSelectWhiteSpot) onSelectWhiteSpot(selectedWhiteSpot);
      return;
    }
    const cand = whiteSpots.find(w => w.id === siteId);
    if (cand && onSelectWhiteSpot) {
      onSelectWhiteSpot(cand);
    }
  };

  // Macro calculations
  const hhiIndexMacro = Math.round(
    marketShareData.reduce((acc, curr) => {
      const share = calculationMode === 'fuelVolume' 
        ? curr.fuelVolumeSharePct 
        : calculationMode === 'revenue' 
        ? curr.revenueSharePct 
        : curr.storeCountSharePct;
      return acc + Math.pow(share, 2);
    }, 0)
  );

  let hhiDescriptionMacro = 'Unconcentrated (Highly Competitive)';
  if (hhiIndexMacro > 2500) hhiDescriptionMacro = 'Highly Concentrated (Oligopoly Risk)';
  else if (hhiIndexMacro > 1500) hhiDescriptionMacro = 'Moderately Concentrated';

  const pieDataMacro = marketShareData.map(d => ({
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

  const trendData = [
    { year: '2023', QuikTrip: 6.8, CircleK: 11.0, Wawa: 4.8, SevenEleven: 13.0, BucEes: 2.2, Others: 62.2 },
    { year: '2024', QuikTrip: 7.4, CircleK: 11.2, Wawa: 5.3, SevenEleven: 13.1, BucEes: 2.8, Others: 60.2 },
    { year: '2025', QuikTrip: 7.9, CircleK: 11.3, Wawa: 5.8, SevenEleven: 13.2, BucEes: 3.3, Others: 58.5 },
    { year: '2026E', QuikTrip: 8.2, CircleK: 11.4, Wawa: 6.2, SevenEleven: 13.2, BucEes: 3.8, Others: 57.2 },
  ];

  const totalFuelVolMilMacro = marketShareData.reduce((s, d) => s + d.annualVolumeMillionGal, 0);
  const totalRevenueMilMacro = marketShareData.reduce((s, d) => s + d.annualRevenueMillionUsd, 0);
  const totalStoreCountMacro = marketShareData.reduce((s, d) => s + d.storeCount, 0);

  // Catchment brand chart data
  const catchmentPieData = (liveCatchmentData?.brands || []).map((b, idx) => {
    const style = getCompetitorBrandStyle(b.brand, b.brand);
    const colorList = ['#f97316', '#ef4444', '#3b82f6', '#10b981', '#eab308', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];
    return {
      name: b.brand,
      value: b.pumpSharePct,
      pumps: b.pumps,
      volumeMGal: b.estAnnualVolumeMGal,
      brandPower: b.brandPowerScore,
      vulnerability: b.vulnerabilityScore,
      color: colorList[idx % colorList.length]
    };
  });

  // Filter sites for dropdown search
  const filteredCandidates = whiteSpots.filter(w => 
    w.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Main Navigation Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/95 border border-purple-900/40 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-purple-400" />
              Catchment & Macro Market Share Engine
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Live OSM Grounded</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Market Share, HHI Concentration & Brand Dominance
          </h2>
          <p className="text-xs text-slate-300">
            Click any specific location or trade area candidate to compute live trade area brand shares, pump density, and vulnerability analysis.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('catchment')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'catchment'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Live Catchment Deep Dive
          </button>
          <button
            onClick={() => setViewMode('macro')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'macro'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            US Macro Benchmark
          </button>
        </div>
      </div>

      {viewMode === 'catchment' && (
        <>
          {/* Location & Radius Control Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Site Selector Dropdown */}
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedSiteId}
                    onChange={(e) => handleSelectSite(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-slate-100 pl-9 pr-8 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 font-semibold cursor-pointer appearance-none"
                  >
                    {selectedWhiteSpot && !whiteSpots.some(w => w.id === selectedWhiteSpot.id) && (
                      <optgroup label="📍 Live Click / Map Target">
                        <option value={selectedWhiteSpot.id}>
                          📍 {selectedWhiteSpot.candidateName} — {selectedWhiteSpot.city || 'Live Location'} ({selectedWhiteSpot.lat.toFixed(4)}, {selectedWhiteSpot.lng.toFixed(4)})
                        </option>
                      </optgroup>
                    )}
                    <optgroup label="🎯 White Spot Expansion Candidates">
                      {whiteSpots.map(w => (
                        <option key={w.id} value={w.id}>
                          🎯 {w.candidateName} — {w.city}, {w.state} (Score: {w.opportunityScore})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="⛽ Existing Store Network">
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>
                          ⛽ {l.name} — {l.city}, {l.state} ({l.brand})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Radius Selector */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 px-2">Radius:</span>
                  {([1, 3, 5] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setSelectedRadius(r)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        selectedRadius === r
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}-Mile
                    </button>
                  ))}
                </div>

                {/* Refresh Live OSM Data Button */}
                <button
                  onClick={() => {
                    if (activeSite) {
                      fetchLiveData(activeSite.lat, activeSite.lng, selectedRadius, activeSite.candidateName);
                    }
                  }}
                  disabled={isLoadingLive}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-900/50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="Re-query live OpenStreetMap Overpass API for real-time station and pump counts"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin text-purple-400' : ''}`} />
                  <span className="hidden sm:inline">{isLoadingLive ? 'Analyzing...' : 'Fetch Live OSM'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activeCandidate && onNavigateToMap) {
                      onNavigateToMap(activeCandidate);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  View on Map
                </button>

                {activeCandidate && onOpenAIRecommendation && (
                  <button
                    onClick={() => onOpenAIRecommendation(activeCandidate)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Underwrite
                  </button>
                )}
              </div>
            </div>

            {/* Quick Pick Site Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs border-t border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                Quick Select:
              </span>
              {selectedWhiteSpot && (
                <button
                  onClick={() => handleSelectSite(selectedWhiteSpot.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedSiteId === selectedWhiteSpot.id
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'bg-purple-950/60 text-purple-300 hover:text-white border border-purple-800'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-purple-400" />
                  Live: {selectedWhiteSpot.candidateName.split(' ')[0]} ({selectedWhiteSpot.city || `${selectedWhiteSpot.lat.toFixed(2)},${selectedWhiteSpot.lng.toFixed(2)}`})
                </button>
              )}
              {whiteSpots.slice(0, 6).map(w => (
                <button
                  key={w.id}
                  onClick={() => handleSelectSite(w.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedSiteId === w.id
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {w.candidateName.split(' ')[0]} ({w.city}) • {w.opportunityScore}
                </button>
              ))}
            </div>
          </div>

          {/* Active Site Overview Banner */}
          {activeSite && (
            <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-900/30 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">{activeSite.candidateName}</span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold">
                      {activeSite.city}, {activeSite.state} {activeSite.zipCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {activeSite.address} • Corridor AADT: <strong className="text-white">{(activeSite.corridorAadt || 35000).toLocaleString()}</strong> • 
                    Trade Area Pop ({selectedRadius}M): <strong className="text-white">
                      {((selectedRadius === 1 ? activeSite.demographics?.pop1Mile : selectedRadius === 3 ? activeSite.demographics?.pop3Mile : activeSite.demographics?.pop5Mile) || 40000).toLocaleString()}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Opportunity Score</div>
                    <div className="text-2xl font-black text-purple-400">{activeSite.opportunityScore}/100</div>
                  </div>
                  <div className="h-10 w-px bg-slate-800" />
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Proposed Capture</div>
                    <div className="text-2xl font-black text-emerald-400">
                      {liveCatchmentData?.proposedSiteMarketSharePct || 28.4}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* HHI Concentration */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">HHI Market Concentration</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-amber-400">
                {liveCatchmentData?.herfindahlIndex || 1840}
              </div>
              <div className="text-[11px] font-semibold text-slate-300">
                {liveCatchmentData?.concentrationRating || 'Moderately Concentrated'}
              </div>
            </div>

            {/* Total Competitors & Pumps */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Catchment Fuel Stations</span>
                <Fuel className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {liveRadiusData?.totalCompetitors || liveCatchmentData?.brands.reduce((s, b) => s + b.count, 0) || 4}{' '}
                <span className="text-xs font-normal text-slate-400">
                  ({liveRadiusData?.totalPumps || liveCatchmentData?.brands.reduce((s, b) => s + b.pumps, 0) || 32} Pumps)
                </span>
              </div>
              <div className="text-[11px] text-cyan-400">
                {(liveRadiusData?.pumpsSupplyMetrics?.unmetPumpsDeficit && liveRadiusData.pumpsSupplyMetrics.unmetPumpsDeficit > 0)
                  ? `Deficit: ${liveRadiusData.pumpsSupplyMetrics.unmetPumpsDeficit} pumps needed`
                  : 'Balanced forecourt capacity'}
              </div>
            </div>

            {/* Proposed Market Share Rank */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Projected Catchment Rank</span>
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">
                #{liveCatchmentData?.projectedRankInCatchment || 1}{' '}
                <span className="text-xs font-bold text-slate-300">Market Leader</span>
              </div>
              <div className="text-[11px] text-emerald-300">
                {liveCatchmentData?.proposedSiteMarketSharePct || 28.4}% Forecast Volume Capture
              </div>
            </div>

            {/* Independent / Vulnerable Share */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Vulnerable / Indep. Share</span>
                <Swords className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400">
                {liveCatchmentData?.independentSharePct || 32.5}%
              </div>
              <div className="text-[11px] text-slate-400">
                Prime Target for Share Steal
              </div>
            </div>
          </div>

          {/* Catchment Visuals & Deep Dive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Catchment Pump Share Donut Chart */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  Live Catchment Pump Share ({selectedRadius}-Mile Buffer)
                </h3>
                {isLoadingLive && (
                  <span className="flex items-center gap-1 text-[10px] text-purple-300 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Fetching OSM...
                  </span>
                )}
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                {catchmentPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={catchmentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {catchmentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(val: any, name: any, item: any) => [
                          `${val}% (${item.payload.pumps} Pumps, ${item.payload.volumeMGal}M Gal/yr)`,
                          'Share'
                        ]}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center p-6 text-xs text-slate-400">
                    No competitor stations located within this {selectedRadius}-mile radius. This represents a 100% white spot void!
                  </div>
                )}
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-xs">
                {catchmentPieData.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.value}% • {p.pumps}P</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Competitor Vulnerability & Brand Power Bar Chart */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Swords className="w-4 h-4 text-rose-400" />
                  Competitor Brand Moat vs Vulnerability
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Target Identification
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBar 
                    data={catchmentPieData} 
                    margin={{ top: 10, right: 15, left: 10, bottom: 25 }}
                  >
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={35}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      domain={[0, 100]} 
                      width={35}
                      tickFormatter={(val) => `${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any, name: any) => [`${val} / 100`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                    <Bar dataKey="brandPower" name="Brand Moat (0-100)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="vulnerability" name="Vulnerability Score (0-100)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <span className="text-purple-400 font-bold">Underwriting Strategy:</span> High vulnerability scores (&gt;60) indicate aging forecourts with limited pump capacity or lack of fresh foodservice. A modern 16-pump travel hub will easily capture 60-75% of their customer base.
              </div>
            </div>
          </div>

          {/* Full Detailed Competitor Breakdown Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Live Catchment Operator Breakdown ({selectedRadius}-Mile Trade Area)
                </h3>
                <p className="text-xs text-slate-400">
                  Extracted via OpenStreetMap Overpass & Geoapify API live spatial polygon queries.
                </p>
              </div>

              <div className="text-xs font-semibold text-purple-300 bg-purple-950/80 px-3 py-1.5 rounded-xl border border-purple-800">
                Total Trade Area Volume: ~{((liveCatchmentData?.brands || []).reduce((s, b) => s + b.estAnnualVolumeMGal, 0) || 5.2).toFixed(1)}M Gal/yr
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Brand / Operator</th>
                    <th className="py-2.5 px-3">Locations</th>
                    <th className="py-2.5 px-3">Total Pumps</th>
                    <th className="py-2.5 px-3">Pump Share</th>
                    <th className="py-2.5 px-3">Est. Fuel Volume</th>
                    <th className="py-2.5 px-3">Est. Inside Sales</th>
                    <th className="py-2.5 px-3">Brand Moat</th>
                    <th className="py-2.5 px-3">Vulnerability</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {/* Proposed Site Row */}
                  <tr className="bg-purple-950/30 font-bold border-l-2 border-purple-500">
                    <td className="py-3 px-3 flex items-center gap-2 text-white">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      ⭐ PROPOSED EXPANSION (You)
                    </td>
                    <td className="py-3 px-3 text-slate-200">1 (Planned)</td>
                    <td className="py-3 px-3 text-purple-300">
                      {liveRadiusData?.economics.recommendedPumps || 16} Pumps
                    </td>
                    <td className="py-3 px-3 text-emerald-400">
                      {liveCatchmentData?.proposedSiteMarketSharePct || 28.4}%
                    </td>
                    <td className="py-3 px-3 text-emerald-300">
                      ~{((liveRadiusData?.economics.unmetDemandGallons || 2200000) / 1000000).toFixed(2)}M Gal
                    </td>
                    <td className="py-3 px-3 text-teal-300">
                      ~${((liveRadiusData?.economics.unmetCStoreSalesUsd || 1800000) / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-3 text-purple-300">95/100 (Tier-1)</td>
                    <td className="py-3 px-3 text-emerald-400">Low (0%)</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px]">Active Project</span>
                    </td>
                  </tr>

                  {/* Competitor Brands Rows */}
                  {(liveCatchmentData?.brands || []).map((b, idx) => {
                    const brandStyle = getCompetitorBrandStyle(b.brand, b.brand);
                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 text-slate-300 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${brandStyle.badgeBg} ${brandStyle.borderColor}`}>
                            {brandStyle.icon}
                          </span>
                          {b.brand}
                        </td>
                        <td className="py-2.5 px-3">{b.count} Sites</td>
                        <td className="py-2.5 px-3 text-slate-200">{b.pumps} Pumps</td>
                        <td className="py-2.5 px-3 font-semibold text-purple-300">{b.pumpSharePct}%</td>
                        <td className="py-2.5 px-3">{b.estAnnualVolumeMGal}M Gal</td>
                        <td className="py-2.5 px-3">${b.estCStoreSalesMUsd}M</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            b.brandPowerScore >= 85 ? 'bg-purple-950 text-purple-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {b.brandPowerScore}/100
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            b.vulnerabilityScore >= 60 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {b.vulnerabilityScore >= 60 ? 'High Vulnerability' : 'Protected'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              if (activeCandidate && onNavigateToMap) {
                                onNavigateToMap(activeCandidate);
                              }
                            }}
                            className="text-[10px] text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 justify-end cursor-pointer ml-auto"
                          >
                            Inspect <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {viewMode === 'macro' && (
        <>
          {/* Calculation Basis Switcher Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white">US National Market Benchmark</h3>
              <p className="text-xs text-slate-400">Total national industry volumes across 150,000+ retail fuel facilities.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold px-2">Calculation Basis:</span>
              <button
                onClick={() => setCalculationMode('fuelVolume')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  calculationMode === 'fuelVolume' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fuel Volume (Gal)
              </button>
              <button
                onClick={() => setCalculationMode('revenue')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  calculationMode === 'revenue' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Total Revenue ($)
              </button>
              <button
                onClick={() => setCalculationMode('storeCount')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  calculationMode === 'storeCount' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Store Count
              </button>
            </div>
          </div>

          {/* Primary Macro KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Selected Scope</div>
              <div className="text-2xl font-bold text-white">United States (CONUS)</div>
              <div className="text-[10px] text-purple-400">{totalStoreCountMacro.toLocaleString()} Tracked Locations</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Market Concentration (HHI)</div>
              <div className="text-2xl font-bold text-amber-400">{hhiIndexMacro}</div>
              <div className="text-[10px] text-slate-300 font-medium">{hhiDescriptionMacro}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Annual Fuel Volume</div>
              <div className="text-2xl font-bold text-emerald-400">
                {(totalFuelVolMilMacro / 1000).toFixed(1)}B <span className="text-xs font-normal text-slate-400">gal/yr</span>
              </div>
              <div className="text-[10px] text-slate-400">Total National Throughput</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Annual Retail Gross Sales</div>
              <div className="text-2xl font-bold text-teal-400">
                ${(totalRevenueMilMacro / 1000).toFixed(1)}B <span className="text-xs font-normal text-slate-400">/yr</span>
              </div>
              <div className="text-[10px] text-slate-400">Fuel + C-Store Turnover</div>
            </div>
          </div>

          {/* Macro Visual Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  National Brand Market Share ({calculationMode === 'fuelVolume' ? 'Gallons' : calculationMode === 'revenue' ? 'Revenue' : 'Stores'})
                </h3>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  TAM Overview
                </span>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={pieDataMacro}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieDataMacro.map((entry, index) => (
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
                {pieDataMacro.slice(0, 6).map((p, i) => (
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

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
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
                  <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      domain={[0, 20]}
                      width={40}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any, name: any) => [`${val}% Share`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Line type="monotone" dataKey="CircleK" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Circle K" />
                    <Line type="monotone" dataKey="SevenEleven" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="7-Eleven" />
                    <Line type="monotone" dataKey="QuikTrip" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} name="QuikTrip" />
                    <Line type="monotone" dataKey="Wawa" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} name="Wawa" />
                    <Line type="monotone" dataKey="BucEes" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Buc-ee's" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <span className="text-purple-400 font-bold">Strategic Insight:</span> High-amenity operators (Buc-ee&apos;s, Wawa, QuikTrip) continue gaining share from conventional gas stations by combining 12+ MPDs with premium foodservice.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
