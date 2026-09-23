import React, { useState, useMemo } from 'react';
import { 
  X, 
  Target, 
  Fuel, 
  Store, 
  Zap, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Navigation, 
  Sparkles, 
  Download, 
  PlusCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Compass, 
  Layers, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter,
  AlertTriangle,
  BookOpen,
  Check,
  Building,
  Truck,
  FileText
} from 'lucide-react';
import { RadiusAnalysisData, OsmPoiRecord, WhiteSpotCandidate, LocationRiskFactor } from '../types';
import { getCompetitorBrandStyle } from '../utils/brandStyling';

interface RadiusIntelligenceDrawerProps {
  data: RadiusAnalysisData | null;
  isLoading: boolean;
  selectedRadius: 1 | 3 | 5;
  onChangeRadius: (radius: 1 | 3 | 5) => void;
  onClose: () => void;
  onPromoteToWhiteSpot: (data: RadiusAnalysisData) => void;
  onOpenAIRecommendation: (candidate: WhiteSpotCandidate) => void;
  onNavigateToFinancials?: (data: RadiusAnalysisData) => void;
  onRefreshOsm: () => void;
}

export const RadiusIntelligenceDrawer: React.FC<RadiusIntelligenceDrawerProps> = ({
  data,
  isLoading,
  selectedRadius,
  onChangeRadius,
  onClose,
  onPromoteToWhiteSpot,
  onOpenAIRecommendation,
  onNavigateToFinancials,
  onRefreshOsm
}) => {
  const [poiFilter, setPoiFilter] = useState<'all' | 'fuel' | 'cstore' | 'ev'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'isochrone' | 'marketshare' | 'footfall' | 'cannibalization' | 'risk' | 'story' | 'competitors' | 'multiring'>('overview');
  const [isSaved, setIsSaved] = useState(false);

  // Helper to format clean display address: real place name or Lat/Long coordinates
  const cleanDisplayAddress = useMemo(() => {
    if (!data) return '';
    if (data.centerAddress && !data.centerAddress.toLowerCase().includes('pinned') && !data.centerAddress.toLowerCase().includes('geopoint')) {
      const cleaned = data.centerAddress.replace(/\[[0-9.,\s-]+\]/g, '').trim();
      if (cleaned.length > 0) return cleaned;
    }
    if (typeof data.centerLat === 'number' && typeof data.centerLng === 'number') {
      return `${data.centerLat.toFixed(4)}, ${data.centerLng.toFixed(4)}`;
    }
    return '';
  }, [data?.centerAddress, data?.centerLat, data?.centerLng]);

  if (!data && !isLoading) return null;

  const filteredPois = data?.osmPois.filter(p => {
    if (poiFilter === 'fuel') return (p.amenity === 'fuel' || (p.pumpsCount && p.pumpsCount > 0)) && !p.id?.startsWith('ev-auto-');
    if (poiFilter === 'cstore') return p.shop === 'convenience' || (p.cStoreSqFt && p.cStoreSqFt > 0);
    if (poiFilter === 'ev') return p.amenity === 'charging_station' || !!p.hasEvChargers || p.brand?.toLowerCase().includes('tesla') || p.brand?.toLowerCase().includes('electrify') || p.brand?.toLowerCase().includes('evgo') || p.brand?.toLowerCase().includes('chargepoint');
    return true;
  }) || [];

  const handleExportCsv = () => {
    if (!data) return;
    const headers = 'ID,Name,Brand,Type,Pumps,DistanceMiles,Latitude,Longitude,Address,Source\n';
    const rows = data.competitors.map(c => 
      `"${c.id}","${c.name}","${c.brand}","${c.type}",${c.pumps},${c.distanceMiles},${c.lat},${c.lng},"${c.address || ''}","OpenStreetMap"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `radius_${data.radiusMiles}mi_analysis_${data.centerLat}_${data.centerLng}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert current radius data into candidate object for AI recommendation
  const asCandidate: WhiteSpotCandidate | null = data ? {
    id: `custom-rad-${Date.now()}`,
    candidateName: `${cleanDisplayAddress} (${data.radiusMiles}-Mile Analysis)`,
    address: cleanDisplayAddress,
    city: 'Analyzed Catchment',
    state: 'US',
    county: 'Custom Buffer',
    zipCode: '00000',
    lat: data.centerLat,
    lng: data.centerLng,
    opportunityScore: data.economics.whiteSpotOpportunityScore,
    demandScore: data.detailedScores?.demandScore || Math.min(99, Math.round(data.demographics.population / 800)),
    supplyGapScore: data.detailedScores?.forecourtSupplyGapScore || Math.min(99, Math.round(data.nearestStationMiles * 22)),
    trafficScore: data.detailedScores?.trafficCorridorScore || Math.min(99, Math.round((data.traffic.corridorAadt / 1000) * 1.3)),
    competitionScore: data.detailedScores?.competitionMoatScore || Math.max(30, 100 - data.totalCompetitors * 8),
    commercialScore: 88,
    financialScore: data.detailedScores?.financialViabilityScore || 90,
    growthScore: data.detailedScores?.growthScore || 92,
    confidenceLevel: 'High',
    riskLevel: data.overallRiskLevel === 'HIGH' ? 'High' : data.overallRiskLevel === 'MODERATE' ? 'Moderate' : 'Low',
    modelVersion: 'OSM-Radius-Engine-2026',
    primaryRationale: [
      `Catchment zone (${data.radiusMiles} miles) contains ${data.demographics.population.toLocaleString()} residents and ${data.totalCompetitors} competing stations.`,
      `Corridor daily traffic of ${data.traffic.corridorAadt.toLocaleString()} AADT with $${(data.economics.unmetDemandGallons / 1000000).toFixed(2)}M annual unmet fuel gallons.`,
      `Nearest competing retail fuel facility is ${data.nearestStationMiles} miles away.`
    ],
    dataGaps: ['Driveway deceleration lane engineering study required.'],
    projectedAnnualFuelGallons: data.economics.unmetDemandGallons,
    projectedAnnualCStoreRevenue: data.economics.unmetCStoreSalesUsd,
    projectedAnnualTotalRevenue: Math.round(data.economics.unmetDemandGallons * 3.45 + data.economics.unmetCStoreSalesUsd),
    projectedAnnualEbitda: data.economics.annualEbitda || Math.round(data.economics.unmetDemandGallons * 0.265 + data.economics.unmetCStoreSalesUsd * 0.38 - 620000),
    projectedDailyFootfall: Math.round(data.traffic.corridorAadt * 0.058),
    projectedMarketSharePct: 32.5,
    estimatedCapEx: data.economics.estimatedCapEx,
    estimatedPaybackYears: data.economics.estimatedPaybackYears,
    estimatedIrrPct: data.economics.estimatedIrrPct || 24.5,
    estimatedNpv: data.economics.estimatedNpv || 1850000,
    pop3Mile: data.demographics.population,
    medianIncome3Mile: data.demographics.medianHouseholdIncome,
    aadt: data.traffic.corridorAadt,
    nearestStationMiles: data.nearestStationMiles,
    competitorCount3Miles: data.totalCompetitors,
    proposedStoreType: 'Fuel Station + C-Store + EV Fast Charge',
    recommendedPumps: data.economics.recommendedPumps,
    recommendedCStoreSqFt: data.economics.recommendedCStoreSqFt,
    sourceDate: new Date().toISOString().split('T')[0],
    forecourtPumps: {
      mpdCount: Math.round((data.economics.recommendedPumps || 8) / 2),
      fuelingPositions: data.economics.recommendedPumps || 8,
      dieselHdvLanes: (data.traffic.corridorAadt || 0) > 45000 ? 2 : 0,
      hasDefAtPump: (data.traffic.corridorAadt || 0) > 45000,
      hasE85: true,
      evDcFastPorts: 8,
      evPowerKw: 250,
      canopySqFt: (data.economics.recommendedPumps || 8) * 450,
      undergroundStorageTanksGallons: (data.economics.recommendedPumps || 8) * 5000,
      avgPumpsUtilizationPct: 72
    },
    cStoreDetails: {
      totalCStoreSqFt: data.economics.recommendedCStoreSqFt || 5000,
      salesFloorSqFt: Math.round((data.economics.recommendedCStoreSqFt || 5000) * 0.46),
      foodServiceKitchenSqFt: Math.round((data.economics.recommendedCStoreSqFt || 5000) * 0.24),
      coffeeBeverageBarSqFt: Math.round((data.economics.recommendedCStoreSqFt || 5000) * 0.12),
      beerCaveSqFt: Math.round((data.economics.recommendedCStoreSqFt || 5000) * 0.08),
      restroomsSqFt: Math.round((data.economics.recommendedCStoreSqFt || 5000) * 0.06),
      backOfHouseStorageSqFt: Math.round((data.economics.recommendedCStoreSqFt || 5000) * 0.04),
      projectedSalesPerSqFtYear: 750,
      qsrFoodServiceMarginPct: 58,
      packagedMerchandiseMarginPct: 35,
      insideSalesShareFoodServicePct: 40
    },
    tradeAreaPumpsSupplyDeficit: data.pumpsSupplyMetrics?.unmetPumpsDeficit || Math.round(data.nearestStationMiles * 4.5),
    tradeAreaCStoreSqFtDeficit: data.cStoreSupplyMetrics?.unmetCStoreSqFtDeficit || Math.round(data.nearestStationMiles * 2200)
  } : null;

  return (
    <div className="absolute inset-x-2 sm:inset-x-auto sm:right-4 top-14 sm:top-20 bottom-16 sm:bottom-4 w-auto sm:w-[480px] md:w-[540px] max-w-[calc(100vw-16px)] bg-white/95 backdrop-blur-xl border border-purple-200 rounded-2xl shadow-2xl z-[1000] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-purple-100 bg-purple-50/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-inner flex-shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                1-Click OSM Catchment
              </span>
              <span className="text-[10px] text-purple-900/60 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1 animate-pulse"></span>
                Overpass Live
              </span>
            </div>
            <h3 className="text-sm font-bold text-purple-950 truncate max-w-[320px]">
              {cleanDisplayAddress}
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onRefreshOsm}
            title="Refresh OpenStreetMap POIs"
            className="p-1.5 rounded-lg text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Radius Selector Tabs (1, 3, 5 Miles) */}
      <div className="p-3 bg-white border-b border-purple-100">
        <div className="text-[11px] font-semibold text-purple-900/70 mb-1.5 flex justify-between items-center">
          <span>SELECT TRADE AREA BUFFER:</span>
          <span className="text-purple-700 font-bold">{selectedRadius} Mile Radius Ring</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([1, 3, 5] as const).map((r) => (
            <button
              key={r}
              onClick={() => onChangeRadius(r)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border cursor-pointer ${
                selectedRadius === r
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20 scale-[1.02]'
                  : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
              }`}
            >
              <Target className={`w-3.5 h-3.5 ${selectedRadius === r ? 'text-white' : 'text-purple-600'}`} />
              <span>{r} {r === 1 ? 'Mile' : 'Miles'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-purple-100 px-2 bg-purple-50/40 text-xs font-medium overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-purple-900/60 hover:text-purple-900'
          }`}
        >
          Overview & Forecourt
        </button>
        <button
          onClick={() => setActiveTab('scores')}
          className={`py-2.5 px-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'scores'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-purple-900/60 hover:text-purple-900'
          }`}
        >
          <span>Scorecard</span>
          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded text-[10px] font-bold">
            {data?.detailedScores?.compositeScore || 85}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('isochrone')}
          className={`py-2.5 px-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'isochrone'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-purple-900/60 hover:text-purple-900'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Drive-Time Isochrones</span>
        </button>
        <button
          onClick={() => setActiveTab('marketshare')}
          className={`py-2.5 px-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'marketshare'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-purple-900/60 hover:text-purple-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Market Share & HHI</span>
        </button>
        <button
          onClick={() => setActiveTab('footfall')}
          className={`py-2.5 px-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'footfall'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-purple-900/60 hover:text-purple-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Commuter Flow</span>
        </button>
        <button
          onClick={() => setActiveTab('cannibalization')}
          className={`py-2.5 px-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'cannibalization'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-purple-900/60 hover:text-purple-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Cannibalization</span>
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`py-2.5 px-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'risk'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-purple-900/60 hover:text-purple-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Risk Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab('story')}
          className={`py-2.5 px-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'story'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-purple-900/60 hover:text-purple-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Business Story</span>
        </button>
        <button
          onClick={() => setActiveTab('competitors')}
          className={`py-2.5 px-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'competitors'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-purple-900/60 hover:text-purple-900'
          }`}
        >
          <span>OSM POIs ({data?.osmPois.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('multiring')}
          className={`py-2.5 px-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'multiring'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-purple-900/60 hover:text-purple-900'
          }`}
        >
          1/3/5M Matrix
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white text-slate-800">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-purple-800 space-y-3">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-sm font-semibold">Querying OpenStreetMap Overpass & Computing Catchment...</p>
            <p className="text-xs text-purple-900/60">Extracting fuel pumps, dispenser counts, and competitive risk</p>
          </div>
        ) : !data ? null : (
          <>
            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Score & Recommendation Banner */}
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-purple-900/80 uppercase tracking-wider">
                      {selectedRadius}-Mile Opportunity Score
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      data.economics.whiteSpotOpportunityScore >= 85
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : data.economics.whiteSpotOpportunityScore >= 70
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}>
                      {data.economics.recommendation.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-black text-purple-950">
                      {data.economics.whiteSpotOpportunityScore}
                    </span>
                    <span className="text-sm text-purple-600 font-semibold">/ 100</span>
                    <div className="ml-auto text-right">
                      <span className="text-xs text-purple-900/70 block">Overall Risk Rating:</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        data.overallRiskLevel === 'LOW' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {data.overallRiskLevel || 'LOW'} RISK PROFILE
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">
                    {data.nearestStationMiles >= 2.0 
                      ? `Prime undersupplied node: Nearest competing fuel station is ${data.nearestStationMiles} miles away with ${data.demographics.population.toLocaleString()} trade area residents.`
                      : `Infill trade area with ${data.totalCompetitors} competitor stations and ${data.totalPumps} existing forecourt pumps across ${selectedRadius} miles.`}
                  </p>
                </div>

                {/* 4 Core Forecourt Vitals */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-xs">
                    <div className="flex items-center space-x-2 text-purple-700 mb-1">
                      <Fuel className="w-4 h-4" />
                      <span className="text-[11px] font-semibold uppercase text-purple-900/70">Total Forecourt Pumps</span>
                    </div>
                    <div className="text-xl font-bold text-purple-950">
                      {data.totalPumps} <span className="text-xs text-purple-600 font-normal">pumps in {selectedRadius}M</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      across {data.totalCompetitors} competing stations
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-xs">
                    <div className="flex items-center space-x-2 text-indigo-600 mb-1">
                      <Navigation className="w-4 h-4" />
                      <span className="text-[11px] font-semibold uppercase text-purple-900/70">Nearest Station</span>
                    </div>
                    <div className="text-xl font-bold text-purple-950">
                      {data.nearestStationMiles} <span className="text-xs text-purple-600 font-normal">miles</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Sister Station: {data.nearestSisterStationMiles || 4.2} mi
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-xs">
                    <div className="flex items-center space-x-2 text-purple-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-[11px] font-semibold uppercase text-purple-900/70">Trade Area Population</span>
                    </div>
                    <div className="text-xl font-bold text-purple-950">
                      {(data.demographics?.population || 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Med Inc: ${(data.demographics?.medianHouseholdIncome || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-xs">
                    <div className="flex items-center space-x-2 text-emerald-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-[11px] font-semibold uppercase text-purple-900/70">Unmet Fuel Demand</span>
                    </div>
                    <div className="text-xl font-bold text-purple-950">
                      {((data.economics?.unmetDemandGallons || 0) / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      annual gallons deficit
                    </div>
                  </div>
                </div>

                {/* Recommended Forecourt Blueprint & Investment */}
                <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2.5">
                  <div className="text-xs font-bold text-purple-950 flex items-center justify-between">
                    <span className="text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      Recommended Forecourt Blueprint
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold">
                      Payback: {data.economics.estimatedPaybackYears} Yrs
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white border border-purple-100 shadow-xs">
                      <span className="text-purple-900/70 block text-[10px]">Dispenser Layout</span>
                      <span className="font-bold text-purple-950">{data.economics.recommendedPumps} Positions ({data.economics.recommendedPumps / 2} MPDs)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-purple-100 shadow-xs">
                      <span className="text-purple-900/70 block text-[10px]">C-Store Format</span>
                      <span className="font-bold text-purple-950">{data.economics.recommendedCStoreSqFt.toLocaleString()} sq ft</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-purple-100 shadow-xs">
                      <span className="text-purple-900/70 block text-[10px]">Turnkey CapEx</span>
                      <span className="font-bold text-purple-700">${(data.economics.estimatedCapEx / 1000000).toFixed(2)}M</span>
                    </div>
                  </div>
                </div>

                {/* Corridor & Traffic Insight */}
                <div className="p-3.5 bg-white rounded-xl border border-purple-100 space-y-2 text-xs shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Corridor Traffic (AADT):</span>
                    <span className="font-bold text-purple-950">{(data.traffic?.corridorAadt || 0).toLocaleString()} vehicles/day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Corridor Classification:</span>
                    <span className="font-semibold text-purple-700">{data.traffic?.roadClass || 'Principal Arterial'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Sister Store Cannibalization:</span>
                    <span className="font-semibold text-emerald-700">{data.cannibalizationEstimatePct || 4}% estimated</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Daytime Workforce:</span>
                    <span className="font-semibold text-purple-950">{(data.demographics?.daytimeWorkers || 0).toLocaleString()} workers</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Detailed Scores */}
            {activeTab === 'scores' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Algorithmic Multi-Factor Scoring Breakdown (0–100 scale):
                </div>

                {data.detailedScores && (
                  <div className="space-y-2.5">
                    {[
                      { label: 'Composite Opportunity Score', val: data.detailedScores.compositeScore, color: 'from-amber-500 to-amber-400', desc: 'Overall algorithmic attractiveness ranking.' },
                      { label: 'Demographic & Demand Score', val: data.detailedScores.demandScore, color: 'from-indigo-500 to-indigo-400', desc: 'Population density, household income, and commuter capture.' },
                      { label: 'Forecourt Supply Gap Score', val: data.detailedScores.forecourtSupplyGapScore, color: 'from-emerald-500 to-emerald-400', desc: 'Deficit of fueling positions per 1k residents.' },
                      { label: 'Traffic & Corridor Score', val: data.detailedScores.trafficCorridorScore, color: 'from-cyan-500 to-cyan-400', desc: 'Corridor vehicular AADT and road classification.' },
                      { label: 'Competition Moat Score', val: data.detailedScores.competitionMoatScore, color: 'from-purple-500 to-purple-400', desc: 'Proximity to nearest rival and brand fragmentation.' },
                      { label: 'EV Transition Readiness', val: data.detailedScores.evReadinessScore, color: 'from-teal-500 to-teal-400', desc: 'Commuter EV penetration and 3-phase utility power.' },
                      { label: 'Financial Viability & IRR', val: data.detailedScores.financialViabilityScore, color: 'from-amber-400 to-yellow-300', desc: 'EBITDA margin, CapEx payback speed, and IRR %.' },
                      { label: 'Corridor Growth Velocity', val: data.detailedScores.growthScore, color: 'from-blue-500 to-blue-400', desc: 'Suburban expansion and commercial permit trajectory.' }
                    ].map((s, idx) => (
                      <div key={idx} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">{s.label}</span>
                          <span className="font-black text-amber-400">{s.val} / 100</span>
                        </div>
                        <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`bg-gradient-to-r ${s.color} h-full rounded-full transition-all duration-700`}
                            style={{ width: `${s.val}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Risk Assessment Matrix */}
            {activeTab === 'risk' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">6-Pillar Geospatial Risk Assessment:</span>
                  <span className="text-[11px] font-bold text-amber-300">
                    Portfolio Cannibalization: {data.cannibalizationEstimatePct || 4}%
                  </span>
                </div>

                {data.riskMatrix && data.riskMatrix.map((risk) => (
                  <div 
                    key={risk.id}
                    className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {risk.level === 'HIGH' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        ) : risk.level === 'MODERATE' ? (
                          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-bold text-slate-200">{risk.title}</div>
                          <span className="text-[10px] text-slate-500 font-mono">[{risk.category}]</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        risk.level === 'HIGH' 
                          ? 'bg-rose-950 text-rose-300 border-rose-800' 
                          : risk.level === 'MODERATE' 
                          ? 'bg-amber-950 text-amber-300 border-amber-800' 
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}>
                        {risk.level} (Score: {risk.score})
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2 rounded-lg border border-slate-800/80">
                      {risk.impactDescription}
                    </p>

                    <div className="text-[11px] text-amber-300/90 flex items-start gap-1.5 pt-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Mitigation:</strong> {risk.mitigationStrategy}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Strategic Business Story */}
            {activeTab === 'story' && (
              <div className="space-y-3.5">
                {data.strategicStory ? (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/40 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold text-red-300">Executive Investment Narrative</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 leading-snug">
                        {data.strategicStory.headline}
                      </h4>
                    </div>

                    <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                      <div className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                        1. Executive Context & Catchment Sizing
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {data.strategicStory.executiveSummary}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                      <div className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
                        2. Trade Area & Forecourt Dynamics
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {data.strategicStory.tradeAreaDynamics}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                      <div className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                        3. Forecourt Blueprint & Equipment
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {data.strategicStory.forecourtRecommendation}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                      <div className="font-bold text-purple-400 uppercase tracking-wider text-[10px]">
                        4. Financial Justification & ROI
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {data.strategicStory.financialJustification}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                      <div className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                        5. Key Execution Action Items
                      </div>
                      <div className="space-y-1.5">
                        {data.strategicStory.keyActionItems.map((act, i) => (
                          <div key={i} className="flex items-start gap-2 text-slate-300 text-[11px]">
                            <span className="w-4 h-4 rounded bg-slate-700 flex items-center justify-center text-[10px] font-bold text-amber-400 flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Story narrative generating for this coordinate...
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: OpenStreetMap POIs List */}
            {activeTab === 'competitors' && (
              <div className="space-y-3">
                {/* POI Filter buttons */}
                <div className="flex space-x-1.5 p-1 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setPoiFilter('all')}
                    className={`flex-1 py-1 rounded font-medium transition-colors cursor-pointer ${
                      poiFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({data.osmPois.length})
                  </button>
                  <button
                    onClick={() => setPoiFilter('fuel')}
                    className={`flex-1 py-1 rounded font-medium transition-colors cursor-pointer ${
                      poiFilter === 'fuel' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Fuel ({data.osmPois.filter(p => p.amenity === 'fuel' || p.pumpsCount).length})
                  </button>
                  <button
                    onClick={() => setPoiFilter('cstore')}
                    className={`flex-1 py-1 rounded font-medium transition-colors cursor-pointer ${
                      poiFilter === 'cstore' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    C-Stores
                  </button>
                  <button
                    onClick={() => setPoiFilter('ev')}
                    className={`flex-1 py-1 rounded font-medium transition-colors cursor-pointer ${
                      poiFilter === 'ev' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    EV Hubs
                  </button>
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Found {filteredPois.length} nodes from OpenStreetMap</span>
                  <button
                    onClick={handleExportCsv}
                    className="text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV Export</span>
                  </button>
                </div>

                {filteredPois.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No matching OpenStreetMap POIs found in this specific filter.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredPois.map((poi, idx) => {
                      const isEv = poi.amenity === 'charging_station' || !!poi.hasEvChargers;
                      const isFuel = (poi.amenity === 'fuel' || (poi.pumpsCount && poi.pumpsCount > 0)) && !poi.id?.startsWith('ev-auto-');
                      const brandStyle = getCompetitorBrandStyle(poi.brand, poi.name);
                      const pumpCount = poi.pumpsCount || 0;
                      const mpdCount = Math.round(pumpCount / 2);
                      const evPorts = poi.evPortCount || 8;
                      const evKw = poi.evPowerKw || 250;

                      return (
                        <div
                          key={poi.id || idx}
                          className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all space-y-2 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center space-x-2.5">
                              <div className={`w-7 h-7 rounded-lg ${isEv && !isFuel ? 'bg-cyan-600 text-white border-cyan-400' : `${brandStyle.badgeBg} border ${brandStyle.borderColor}`} flex items-center justify-center text-xs shadow shrink-0`}>
                                {isEv && !isFuel ? '⚡' : brandStyle.icon}
                              </div>
                              <div>
                                <div className="font-bold text-slate-100 text-xs truncate max-w-[200px]">
                                  {poi.name}
                                </div>
                                <div className={`text-[10px] ${isEv && !isFuel ? 'text-cyan-300' : 'text-amber-300'} font-semibold flex items-center gap-1.5 flex-wrap`}>
                                  {isEv && !isFuel ? (
                                    <span>{poi.evNetwork || poi.brand || 'EV Fast Network'} • {evKw}kW DCFC</span>
                                  ) : (
                                    <span>{poi.brand || brandStyle.name} • {poi.mpdCount || mpdCount} MPD Forecourt</span>
                                  )}
                                  {poi.rating && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] text-amber-300 font-bold inline-flex items-center gap-0.5">
                                      ★ {poi.rating} {poi.userRatingsTotal ? `(${poi.userRatingsTotal})` : ''}
                                    </span>
                                  )}
                                  {poi.forecourtConfidenceLabel && (
                                    <span className="px-1 py-0.2 rounded bg-slate-700/80 text-[8.5px] text-slate-300 font-medium">
                                      {poi.forecourtConfidenceLabel}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              {isEv && !isFuel ? (
                                <span className="px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[11px] font-black inline-flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-cyan-400" />
                                  {evPorts} EV Stalls
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[11px] font-black inline-flex items-center gap-1">
                                  <Fuel className="w-3 h-3 text-amber-400" />
                                  {pumpCount} Pumps
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                                {poi.distanceMiles} mi away
                              </span>
                            </div>
                          </div>

                          {poi.pumpsEstimationRationale && (
                            <div className="px-2 py-1 rounded bg-slate-900/60 text-[9.5px] text-slate-300 border border-slate-700/40">
                              {poi.pumpsEstimationRationale}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pt-1.5 border-t border-slate-700/50">
                            {isEv && !isFuel ? (
                              <>
                                <span className="px-1.5 py-0.2 bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 rounded font-semibold">
                                  {(poi.evConnectors || ['NACS / Tesla', 'CCS Combo']).join(', ')}
                                </span>
                                <span className="px-1.5 py-0.2 bg-slate-900 text-slate-300 border border-slate-700 rounded">
                                  {evKw}kW Max Output
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="flex items-center text-slate-300">
                                  <Store className="w-3 h-3 mr-1 text-emerald-400" />
                                  {(poi.cStoreSqFt || 3800).toLocaleString()} sq ft C-Store
                                </span>
                                {poi.fuelDiesel && (
                                  <span className="px-1.5 py-0.2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded font-semibold">
                                    Ultra-Low Diesel
                                  </span>
                                )}
                                <span className="px-1.5 py-0.2 bg-blue-950/60 text-blue-300 border border-blue-800/50 rounded font-semibold">
                                  Synergy 93
                                </span>
                              </>
                            )}
                            {poi.osmId && (
                              <a
                                href={`https://www.openstreetmap.org/${poi.type || 'node'}/${poi.osmId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 underline ml-auto"
                                title="Inspect real node record on OpenStreetMap"
                              >
                                <span>OSM #{poi.osmId}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 6: 1 vs 3 vs 5 Mile Multi-Ring Matrix */}
            {activeTab === 'multiring' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Side-by-side demographic, forecourt supply, and risk comparison across concentric rings:
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-900/80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Metric</th>
                        <th className="p-2.5 text-cyan-400">1 Mile</th>
                        <th className="p-2.5 text-amber-400">3 Miles</th>
                        <th className="p-2.5 text-purple-400">5 Miles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="p-2.5 text-slate-400 font-medium">Population</td>
                        <td className="p-2.5 font-bold text-slate-200">{(data.allRadiusBuffers?.oneMile?.population || 0).toLocaleString()}</td>
                        <td className="p-2.5 font-bold text-slate-200">{(data.allRadiusBuffers?.threeMiles?.population || 0).toLocaleString()}</td>
                        <td className="p-2.5 font-bold text-slate-200">{(data.allRadiusBuffers?.fiveMiles?.population || 0).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400 font-medium">Competitors</td>
                        <td className="p-2.5 font-semibold">{data.allRadiusBuffers?.oneMile?.competitors || 0} stations</td>
                        <td className="p-2.5 font-semibold">{data.allRadiusBuffers?.threeMiles?.competitors || 0} stations</td>
                        <td className="p-2.5 font-semibold">{data.allRadiusBuffers?.fiveMiles?.competitors || 0} stations</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400 font-medium">Total Pumps</td>
                        <td className="p-2.5 font-semibold">{data.allRadiusBuffers?.oneMile?.pumps || 0} pumps</td>
                        <td className="p-2.5 font-semibold">{data.allRadiusBuffers?.threeMiles?.pumps || 0} pumps</td>
                        <td className="p-2.5 font-semibold">{data.allRadiusBuffers?.fiveMiles?.pumps || 0} pumps</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400 font-medium">Unmet Fuel Demand</td>
                        <td className="p-2.5 text-emerald-400 font-bold">{((data.allRadiusBuffers?.oneMile?.unmetGallons || 0) / 1000000).toFixed(2)}M gal</td>
                        <td className="p-2.5 text-emerald-400 font-bold">{((data.allRadiusBuffers?.threeMiles?.unmetGallons || 0) / 1000000).toFixed(2)}M gal</td>
                        <td className="p-2.5 text-emerald-400 font-bold">{((data.allRadiusBuffers?.fiveMiles?.unmetGallons || 0) / 1000000).toFixed(2)}M gal</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400 font-medium">Opportunity Score</td>
                        <td className="p-2.5 font-black text-cyan-400">{data.allRadiusBuffers?.oneMile?.score || 0}</td>
                        <td className="p-2.5 font-black text-amber-400">{data.allRadiusBuffers?.threeMiles?.score || 0}</td>
                        <td className="p-2.5 font-black text-purple-400">{data.allRadiusBuffers?.fiveMiles?.score || 0}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400 font-medium">Saturation Risk</td>
                        <td className="p-2.5 text-emerald-300 font-semibold">{data.allRadiusBuffers?.oneMile?.riskRating || 'Low Saturated'}</td>
                        <td className="p-2.5 text-amber-300 font-semibold">{data.allRadiusBuffers?.threeMiles?.riskRating || 'Moderate'}</td>
                        <td className="p-2.5 text-slate-300 font-semibold">{data.allRadiusBuffers?.fiveMiles?.riskRating || 'Regional Trade'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Isochrone Analysis */}
            {activeTab === 'isochrone' && data.isochrones && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-purple-600" />
                      <span>Road Network Drive-Time Isochrones</span>
                    </span>
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      Index: {data.isochrones.accessibilityIndex}/100
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 mt-1">
                    True road network accessibility accounting for highway speed limits, turn restrictions, and natural topography barriers.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-[10px] uppercase font-bold text-purple-700">5-Min Isochrone</div>
                    <div className="text-lg font-black text-purple-950 mt-0.5">
                      {(data.isochrones.fiveMin.drivablePopulation).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-purple-600">Drivable Population</div>
                    <div className="text-[10px] font-mono text-purple-500 mt-1">{data.isochrones.fiveMin.drivableAreaSqMiles} sq mi</div>
                  </div>

                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                    <div className="text-[10px] uppercase font-bold text-indigo-700">10-Min Isochrone</div>
                    <div className="text-lg font-black text-purple-950 mt-0.5">
                      {(data.isochrones.tenMin.drivablePopulation).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-indigo-600">Drivable Population</div>
                    <div className="text-[10px] font-mono text-indigo-500 mt-1">{data.isochrones.tenMin.drivableAreaSqMiles} sq mi</div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-[10px] uppercase font-bold text-purple-700">15-Min Isochrone</div>
                    <div className="text-lg font-black text-purple-950 mt-0.5">
                      {(data.isochrones.fifteenMin.drivablePopulation).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-purple-600">Drivable Population</div>
                    <div className="text-[10px] font-mono text-purple-500 mt-1">{data.isochrones.fifteenMin.drivableAreaSqMiles} sq mi</div>
                  </div>
                </div>

                {/* Road Network Barrier Log */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-purple-900 uppercase tracking-wider">Spatial Road Barriers Identified</div>
                  <div className="space-y-2">
                    {data.isochrones.roadNetworkBarriers.map((b, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-purple-100 shadow-xs text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-purple-950">
                          <span>{b.barrier}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">{b.type}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{b.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Catchment Market Share & HHI */}
            {activeTab === 'marketshare' && data.catchmentMarketShare && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                        Herfindahl-Hirschman Index (HHI)
                      </div>
                      <div className="text-2xl font-black text-purple-950 mt-0.5">
                        {data.catchmentMarketShare.herfindahlIndex}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                      data.catchmentMarketShare.concentrationRating === 'Highly Concentrated'
                        ? 'bg-rose-100 text-rose-800'
                        : data.catchmentMarketShare.concentrationRating === 'Moderately Concentrated'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {data.catchmentMarketShare.concentrationRating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-purple-700 mt-2 pt-2 border-t border-purple-200">
                    <span>Projected Site Capture Share:</span>
                    <span className="font-black text-purple-950">{data.catchmentMarketShare.proposedSiteMarketSharePct}% (Rank #{data.catchmentMarketShare.projectedRankInCatchment})</span>
                  </div>
                </div>

                {/* Brands Breakdown Table */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-purple-900 uppercase tracking-wider">Catchment Brand Share Breakdown</div>
                  <div className="space-y-2">
                    {data.catchmentMarketShare.brands.map((b, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-purple-100 shadow-xs text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-purple-950 flex items-center gap-1.5">
                            <span>{b.brand}</span>
                            <span className="text-[10px] text-purple-600 font-normal font-mono">({b.count} sites • {b.pumps} pumps)</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Brand Power: {b.brandPowerScore}/100 • Vulnerability: {b.vulnerabilityScore}%
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-black text-purple-900">{b.pumpSharePct}% Share</div>
                          <div className="text-[10px] text-purple-600 font-mono">~{b.estAnnualVolumeMGal}M gal/yr</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Commuter Flow 24h Profile */}
            {activeTab === 'footfall' && data.commuterFlow && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Daily Corridor Traffic & Capture
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {data.commuterFlow.projectedDailyTotalVisits.toLocaleString()} Daily Visits
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                      <div className="text-[10px] font-bold text-purple-600 uppercase">AM Rush Inbound</div>
                      <div className="font-black text-purple-950 text-sm">{data.commuterFlow.amPeakDirectionalSplit.inboundPct}% Inbound</div>
                      <div className="text-[10px] text-slate-500">{data.commuterFlow.amPeakDirectionalSplit.morningCommutersPerHour.toLocaleString()} veh/hr</div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                      <div className="text-[10px] font-bold text-purple-600 uppercase">PM Rush Outbound</div>
                      <div className="font-black text-purple-950 text-sm">{data.commuterFlow.pmPeakDirectionalSplit.outboundPct}% Outbound</div>
                      <div className="text-[10px] text-slate-500">{data.commuterFlow.pmPeakDirectionalSplit.eveningCommutersPerHour.toLocaleString()} veh/hr</div>
                    </div>
                  </div>
                </div>

                {/* Visit Breakdown */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="text-[10px] font-bold text-purple-700">Fuel Only</div>
                    <div className="font-bold text-purple-950">{data.commuterFlow.fuelOnlyVisits}</div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="text-[10px] font-bold text-purple-700">C-Store</div>
                    <div className="font-bold text-purple-950">{data.commuterFlow.cStoreOnlyVisits}</div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="text-[10px] font-bold text-purple-700">Dual Stop</div>
                    <div className="font-bold text-purple-950">{data.commuterFlow.dualFuelCStoreVisits}</div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="text-[10px] font-bold text-purple-700">EV Charge</div>
                    <div className="font-bold text-purple-950">{data.commuterFlow.evChargingVisits}</div>
                  </div>
                </div>

                {/* Top Rush Hour Intervals */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-purple-900 uppercase tracking-wider">Peak Traffic Hours</div>
                  {data.commuterFlow.hourlyFlow.filter(h => h.amPeak || h.pmPeak || h.lunchSurge).map((h, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white border border-purple-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-purple-950">{h.hour}</span>
                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          h.amPeak ? 'bg-amber-100 text-amber-800' : h.pmPeak ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {h.amPeak ? 'AM Rush' : h.pmPeak ? 'PM Rush' : 'Midday Lunch'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-purple-900">{h.projectedVisits} visits</span>
                        <span className="text-[10px] text-purple-600 block">{h.passingVehiclesAadt} passing AADT</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Cannibalization Simulator */}
            {activeTab === 'cannibalization' && data.cannibalization && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Huff Gravity Model Portfolio Net Lift
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {data.cannibalization.netIncrementalLiftPct}% Incremental
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                      <div className="text-[10px] font-bold text-purple-600 uppercase">Gross New Volume</div>
                      <div className="font-black text-purple-950 text-sm">
                        {(data.cannibalization.grossNewVolumeGal / 1000000).toFixed(2)}M gal/yr
                      </div>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase">Net Incremental Volume</div>
                      <div className="font-black text-emerald-700 text-sm">
                        {(data.cannibalization.netIncrementalVolumeGal / 1000000).toFixed(2)}M gal/yr
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nearby Sister Stores Table */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Sister Stores in Trade Area ({data.cannibalization.nearbySisterStores.length})
                  </div>
                  {data.cannibalization.nearbySisterStores.length === 0 ? (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-medium">
                      Zero sister store collision detected within 8.5-mile radius. 100% volume is net incremental to portfolio!
                    </div>
                  ) : (
                    data.cannibalization.nearbySisterStores.map((s, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-purple-100 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-purple-950">{s.sisterStoreName}</div>
                          <div className="text-[10px] text-purple-600">{s.distanceMiles} mi • {s.driveTimeMinutes} min drive</div>
                        </div>

                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {s.projectedDiversionPct}% Diversion
                          </span>
                          <div className="text-[10px] text-rose-600 font-mono mt-0.5">-{s.divertedMonthlyVolumeGal.toLocaleString()} gal/mo</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Action Buttons */}
      {data && (
        <div className="p-3.5 bg-purple-50/70 border-t border-purple-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onPromoteToWhiteSpot(data);
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
              }}
              disabled={isSaved}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all border cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shadow-md shadow-purple-500/20'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Added to Pipeline</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Save to White Spots</span>
                </>
              )}
            </button>

            {asCandidate && (
              <button
                onClick={() => onOpenAIRecommendation(asCandidate)}
                className="py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border border-purple-500 shadow-md shadow-purple-600/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>AI Strategic Memo</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
