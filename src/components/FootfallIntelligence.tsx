import React, { useState, useEffect } from 'react';
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
  Filter, 
  MapPin, 
  Compass, 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  Sun, 
  Moon, 
  Car, 
  Coffee, 
  Percent, 
  Users,
  ChevronRight
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
  Area, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  WhiteSpotCandidate, 
  StoreLocationRecord, 
  CommuterFlowData, 
  HourlyFlowItem, 
  RadiusAnalysisData 
} from '../types';
import { analyzeLocationRadius } from '../services/osmService';

interface FootfallIntelligenceProps {
  candidates?: WhiteSpotCandidate[];
  locations?: StoreLocationRecord[];
  selectedWhiteSpot?: WhiteSpotCandidate | null;
  onSelectWhiteSpot?: (ws: WhiteSpotCandidate) => void;
  onNavigateToMap?: (ws: WhiteSpotCandidate) => void;
  onOpenAIRecommendation?: (ws: WhiteSpotCandidate) => void;
}

export const FootfallIntelligence: React.FC<FootfallIntelligenceProps> = ({
  candidates = [],
  locations = [],
  selectedWhiteSpot,
  onSelectWhiteSpot,
  onNavigateToMap,
  onOpenAIRecommendation
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    selectedWhiteSpot?.id || candidates[0]?.id || locations[0]?.id || ''
  );
  const [selectedRadius, setSelectedRadius] = useState<1 | 3 | 5>(3);
  const [captureRateMultiplier, setCaptureRateMultiplier] = useState<number>(5.5); // % of passing AADT
  const [activeTabMode, setActiveTabMode] = useState<'hourly' | 'commuter' | 'conversion'>('hourly');

  // Live analysis state
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [liveRadiusData, setLiveRadiusData] = useState<RadiusAnalysisData | null>(null);
  const [liveCommuterData, setLiveCommuterData] = useState<CommuterFlowData | null>(null);

  // Sync if selectedWhiteSpot changes from external selection
  useEffect(() => {
    if (selectedWhiteSpot && selectedWhiteSpot.id !== selectedSiteId) {
      setSelectedSiteId(selectedWhiteSpot.id);
    }
  }, [selectedWhiteSpot]);

  // Find active location record
  const activeCandidate = candidates.find(c => c.id === selectedSiteId);
  const activeStore = locations.find(l => l.id === selectedSiteId);
  const activeSite = activeCandidate ? {
    id: activeCandidate.id,
    candidateName: activeCandidate.candidateName,
    address: activeCandidate.address,
    city: activeCandidate.city,
    state: activeCandidate.state,
    zipCode: activeCandidate.zipCode,
    lat: activeCandidate.lat,
    lng: activeCandidate.lng,
    opportunityScore: Math.round(activeCandidate.opportunityScore || 85),
    priorityTier: 'TIER_1_EXPANSION' as const,
    corridorAadt: activeCandidate.aadt || 38000,
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
    strategicThesis: activeCandidate.primaryRationale?.join(' ') || 'High footfall candidate corridor.',
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
    opportunityScore: 84,
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
      estimatedUnmetFuelDemandGallons: 1900000,
      estimatedUnmetCStoreSpendUsd: 1500000,
      recommendedPumps: activeStore.fuelDetails.pumpsCount,
      recommendedCStoreSqFt: activeStore.fuelDetails.cStoreSqFt,
      estimatedCapExUsd: 5800000,
      projectedPaybackYears: 4.1,
      projectedAnnualEbitdaUsd: activeStore.financials?.annualEbitda || 1150000
    },
    riskAssessment: {
      cannibalizationRisk: 'LOW' as const,
      zoningRisk: 'LOW' as const,
      accessIngressRisk: 'LOW' as const,
      competitorDensity: 'MODERATE' as const
    },
    strategicThesis: `Operating ${activeStore.brand} facility capturing strong arterial commuter volume.`,
    tags: ['Active Store', activeStore.brand]
  } : null);

  // Fetch live OSM and commuter flow analysis
  useEffect(() => {
    if (!activeSite) return;

    let isMounted = true;
    setIsLoadingLive(true);

    analyzeLocationRadius(activeSite.lat, activeSite.lng, selectedRadius, activeSite.candidateName)
      .then(analysis => {
        if (!isMounted) return;
        setLiveRadiusData(analysis);
        if (analysis.commuterFlow) {
          setLiveCommuterData(analysis.commuterFlow);
        }
        setIsLoadingLive(false);
      })
      .catch(err => {
        console.error('Error fetching live footfall analysis:', err);
        if (isMounted) setIsLoadingLive(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSiteId, selectedRadius, activeSite?.lat, activeSite?.lng]);

  const handleSelectSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    const cand = candidates.find(c => c.id === siteId);
    if (cand && onSelectWhiteSpot) {
      onSelectWhiteSpot(cand);
    }
  };

  const radiusMultiplier = selectedRadius === 1 ? 0.82 : selectedRadius === 3 ? 1.0 : 1.38;
  const rawSiteAadt = activeSite?.corridorAadt || (activeSite as any)?.aadt || (activeSite as any)?.traffic?.aadt || 38000;
  const baseAadt = Math.round(rawSiteAadt * radiusMultiplier);
  
  const catchmentPop = selectedRadius === 1
    ? (activeSite?.demographics?.pop1Mile || 12500)
    : selectedRadius === 3
      ? (activeSite?.demographics?.pop3Mile || 42000)
      : (activeSite?.demographics?.pop5Mile || 118000);

  const daytimeWorkforce = Math.round(catchmentPop * (selectedRadius === 1 ? 0.38 : selectedRadius === 3 ? 0.48 : 0.56));
  const activeCompetitorCount = liveRadiusData?.totalCompetitors ?? (selectedRadius === 1 ? 2 : selectedRadius === 3 ? 5 : 12);
  const activePumpCount = liveRadiusData?.totalPumps ?? (selectedRadius === 1 ? 16 : selectedRadius === 3 ? 48 : 112);

  // Dynamically scaled hourly flow based on custom capture rate slider
  const rawHourlyData = liveCommuterData?.hourlyFlow || [
    { hour: '05:00 - 06:00', passingVehiclesAadt: Math.round(baseAadt * 0.022), captureRatePct: 4.8, projectedVisits: Math.round(baseAadt * 0.022 * 0.048), fuelOnlyVisits: Math.round(baseAadt * 0.022 * 0.048 * 0.65), cStoreOnlyVisits: Math.round(baseAadt * 0.022 * 0.048 * 0.25), amPeak: false, pmPeak: false, lunchSurge: false },
    { hour: '06:00 - 07:00', passingVehiclesAadt: Math.round(baseAadt * 0.058), captureRatePct: 5.4, projectedVisits: Math.round(baseAadt * 0.058 * 0.054), fuelOnlyVisits: Math.round(baseAadt * 0.058 * 0.054 * 0.58), cStoreOnlyVisits: Math.round(baseAadt * 0.058 * 0.054 * 0.32), amPeak: true, pmPeak: false, lunchSurge: false },
    { hour: '07:00 - 08:00', passingVehiclesAadt: Math.round(baseAadt * 0.094), captureRatePct: 6.2, projectedVisits: Math.round(baseAadt * 0.094 * 0.062), fuelOnlyVisits: Math.round(baseAadt * 0.094 * 0.062 * 0.52), cStoreOnlyVisits: Math.round(baseAadt * 0.094 * 0.062 * 0.38), amPeak: true, pmPeak: false, lunchSurge: false },
    { hour: '08:00 - 09:00', passingVehiclesAadt: Math.round(baseAadt * 0.088), captureRatePct: 6.0, projectedVisits: Math.round(baseAadt * 0.088 * 0.060), fuelOnlyVisits: Math.round(baseAadt * 0.088 * 0.060 * 0.50), cStoreOnlyVisits: Math.round(baseAadt * 0.088 * 0.060 * 0.40), amPeak: true, pmPeak: false, lunchSurge: false },
    { hour: '09:00 - 10:00', passingVehiclesAadt: Math.round(baseAadt * 0.052), captureRatePct: 4.6, projectedVisits: Math.round(baseAadt * 0.052 * 0.046), fuelOnlyVisits: Math.round(baseAadt * 0.052 * 0.046 * 0.55), cStoreOnlyVisits: Math.round(baseAadt * 0.052 * 0.046 * 0.35), amPeak: false, pmPeak: false, lunchSurge: false },
    { hour: '10:00 - 11:00', passingVehiclesAadt: Math.round(baseAadt * 0.048), captureRatePct: 4.4, projectedVisits: Math.round(baseAadt * 0.048 * 0.044), fuelOnlyVisits: Math.round(baseAadt * 0.048 * 0.044 * 0.52), cStoreOnlyVisits: Math.round(baseAadt * 0.048 * 0.044 * 0.38), amPeak: false, pmPeak: false, lunchSurge: false },
    { hour: '11:00 - 12:00', passingVehiclesAadt: Math.round(baseAadt * 0.065), captureRatePct: 6.8, projectedVisits: Math.round(baseAadt * 0.065 * 0.068), fuelOnlyVisits: Math.round(baseAadt * 0.065 * 0.068 * 0.38), cStoreOnlyVisits: Math.round(baseAadt * 0.065 * 0.068 * 0.52), amPeak: false, pmPeak: false, lunchSurge: true },
    { hour: '12:00 - 13:00', passingVehiclesAadt: Math.round(baseAadt * 0.076), captureRatePct: 7.2, projectedVisits: Math.round(baseAadt * 0.076 * 0.072), fuelOnlyVisits: Math.round(baseAadt * 0.076 * 0.072 * 0.35), cStoreOnlyVisits: Math.round(baseAadt * 0.076 * 0.072 * 0.55), amPeak: false, pmPeak: false, lunchSurge: true },
    { hour: '13:00 - 14:00', passingVehiclesAadt: Math.round(baseAadt * 0.056), captureRatePct: 5.6, projectedVisits: Math.round(baseAadt * 0.056 * 0.056), fuelOnlyVisits: Math.round(baseAadt * 0.056 * 0.056 * 0.45), cStoreOnlyVisits: Math.round(baseAadt * 0.056 * 0.056 * 0.45), amPeak: false, pmPeak: false, lunchSurge: true },
    { hour: '14:00 - 15:00', passingVehiclesAadt: Math.round(baseAadt * 0.054), captureRatePct: 5.0, projectedVisits: Math.round(baseAadt * 0.054 * 0.050), fuelOnlyVisits: Math.round(baseAadt * 0.054 * 0.050 * 0.50), cStoreOnlyVisits: Math.round(baseAadt * 0.054 * 0.050 * 0.40), amPeak: false, pmPeak: false, lunchSurge: false },
    { hour: '15:00 - 16:00', passingVehiclesAadt: Math.round(baseAadt * 0.068), captureRatePct: 5.5, projectedVisits: Math.round(baseAadt * 0.068 * 0.055), fuelOnlyVisits: Math.round(baseAadt * 0.068 * 0.055 * 0.52), cStoreOnlyVisits: Math.round(baseAadt * 0.068 * 0.055 * 0.38), amPeak: false, pmPeak: false, lunchSurge: false },
    { hour: '16:00 - 17:00', passingVehiclesAadt: Math.round(baseAadt * 0.092), captureRatePct: 6.4, projectedVisits: Math.round(baseAadt * 0.092 * 0.064), fuelOnlyVisits: Math.round(baseAadt * 0.092 * 0.064 * 0.55), cStoreOnlyVisits: Math.round(baseAadt * 0.092 * 0.064 * 0.35), amPeak: false, pmPeak: true, lunchSurge: false },
    { hour: '17:00 - 18:00', passingVehiclesAadt: Math.round(baseAadt * 0.104), captureRatePct: 6.8, projectedVisits: Math.round(baseAadt * 0.104 * 0.068), fuelOnlyVisits: Math.round(baseAadt * 0.104 * 0.068 * 0.58), cStoreOnlyVisits: Math.round(baseAadt * 0.104 * 0.068 * 0.32), amPeak: false, pmPeak: true, lunchSurge: false },
    { hour: '18:00 - 19:00', passingVehiclesAadt: Math.round(baseAadt * 0.082), captureRatePct: 6.2, projectedVisits: Math.round(baseAadt * 0.082 * 0.062), fuelOnlyVisits: Math.round(baseAadt * 0.082 * 0.062 * 0.56), cStoreOnlyVisits: Math.round(baseAadt * 0.082 * 0.062 * 0.34), amPeak: false, pmPeak: true, lunchSurge: false },
    { hour: '19:00 - 20:00', passingVehiclesAadt: Math.round(baseAadt * 0.055), captureRatePct: 5.2, projectedVisits: Math.round(baseAadt * 0.055 * 0.052), fuelOnlyVisits: Math.round(baseAadt * 0.055 * 0.052 * 0.52), cStoreOnlyVisits: Math.round(baseAadt * 0.055 * 0.052 * 0.38), amPeak: false, pmPeak: false, lunchSurge: false },
    { hour: '20:00 - 22:00', passingVehiclesAadt: Math.round(baseAadt * 0.056), captureRatePct: 4.8, projectedVisits: Math.round(baseAadt * 0.056 * 0.048), fuelOnlyVisits: Math.round(baseAadt * 0.056 * 0.048 * 0.58), cStoreOnlyVisits: Math.round(baseAadt * 0.056 * 0.048 * 0.32), amPeak: false, pmPeak: false, lunchSurge: false },
    { hour: '22:00 - 05:00', passingVehiclesAadt: Math.round(baseAadt * 0.032), captureRatePct: 3.5, projectedVisits: Math.round(baseAadt * 0.032 * 0.035), fuelOnlyVisits: Math.round(baseAadt * 0.032 * 0.035 * 0.70), cStoreOnlyVisits: Math.round(baseAadt * 0.032 * 0.035 * 0.20), amPeak: false, pmPeak: false, lunchSurge: false }
  ];

  // Scale data dynamically with slider
  const hourlyData = rawHourlyData.map(h => {
    const scaleFactor = captureRateMultiplier / 5.5;
    const projectedVisits = Math.round(h.projectedVisits * scaleFactor);
    const fuelOnly = Math.round(h.fuelOnlyVisits * scaleFactor);
    const cStoreOnly = Math.round(h.cStoreOnlyVisits * scaleFactor);
    const dualVisit = Math.round(projectedVisits * 0.18);
    const evVisit = Math.round(projectedVisits * 0.04);

    return {
      ...h,
      projectedVisits,
      fuelOnly,
      cStoreOnly,
      dualVisit,
      evVisit,
      hourShort: h.hour.split(' - ')[0]
    };
  });

  const totalCalculatedDailyVisits = hourlyData.reduce((s, h) => s + h.projectedVisits, 0);
  const totalAnnualProjectedGallons = Math.round(totalCalculatedDailyVisits * 0.68 * 12.8 * 365);
  const totalAnnualProjectedInsideSales = Math.round(totalCalculatedDailyVisits * 0.52 * 14.5 * 365);

  const weekdayWeekendData = [
    { day: 'Mon', footfall: Math.round(totalCalculatedDailyVisits * 0.95), conversion: 71 },
    { day: 'Tue', footfall: Math.round(totalCalculatedDailyVisits * 0.98), conversion: 72 },
    { day: 'Wed', footfall: Math.round(totalCalculatedDailyVisits * 1.02), conversion: 73 },
    { day: 'Thu', footfall: Math.round(totalCalculatedDailyVisits * 1.06), conversion: 74 },
    { day: 'Fri', footfall: Math.round(totalCalculatedDailyVisits * 1.24), conversion: 78 }, // Peak Friday Travel
    { day: 'Sat', footfall: Math.round(totalCalculatedDailyVisits * 1.12), conversion: 75 },
    { day: 'Sun', footfall: Math.round(totalCalculatedDailyVisits * 0.92), conversion: 69 },
  ];

  const conversionPieData = [
    { name: 'Fuel Fill-up Only', value: 52, color: '#3b82f6', count: Math.round(totalCalculatedDailyVisits * 0.52) },
    { name: 'C-Store Food & Drink Only', value: 28, color: '#10b981', count: Math.round(totalCalculatedDailyVisits * 0.28) },
    { name: 'Dual Fuel + C-Store Basket', value: 16, color: '#8b5cf6', count: Math.round(totalCalculatedDailyVisits * 0.16) },
    { name: 'EV DC Fast Charging Dwell', value: 4, color: '#f59e0b', count: Math.round(totalCalculatedDailyVisits * 0.04) },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/95 border border-purple-900/40 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-purple-400" />
              Live Commuter Flow & Diurnal Mobility Engine
            </span>
            <span className="text-[11px] text-slate-400 font-mono">FHWA AADT & Diurnal Capture</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Footfall Patterns, Commuter Pulses & Trip Conversion
          </h2>
          <p className="text-xs text-slate-300">
            Select any location to simulate real 24-hour diurnal commuter curves, morning/evening rush splits, and forecourt-to-c-store conversion.
          </p>
        </div>

        {/* Action / View Mode */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTabMode('hourly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTabMode === 'hourly' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            24h Hourly Curve
          </button>
          <button
            onClick={() => setActiveTabMode('commuter')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTabMode === 'commuter' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            AM/PM Directional
          </button>
          <button
            onClick={() => setActiveTabMode('conversion')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTabMode === 'conversion' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Trip Conversion
          </button>
        </div>
      </div>

      {/* Location Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedSiteId}
                onChange={(e) => handleSelectSite(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-100 pl-9 pr-8 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 font-semibold cursor-pointer appearance-none"
              >
                <optgroup label="🎯 White Spot Expansion Candidates">
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>
                      🎯 {c.candidateName} — {c.city}, {c.state} (AADT: {(c.aadt || (c as any).corridorAadt || 35000).toLocaleString()})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="⛽ Existing Store Network">
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>
                      ⛽ {l.name} — {l.city}, {l.state} (AADT: {(l.traffic?.aadt || 35000).toLocaleString()})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Radius Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 px-2">Catchment:</span>
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
                  {r}M Buffer
                </button>
              ))}
            </div>
          </div>

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
                AI Advisor
              </button>
            )}
          </div>
        </div>

        {/* Interactive Capture Rate Slider */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300 font-semibold">Through-Traffic Capture Rate Sensitivity:</span>
            <span className="font-mono font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
              {captureRateMultiplier.toFixed(1)}% of AADT
            </span>
          </div>

          <div className="flex items-center gap-3 flex-1 sm:max-w-xs">
            <span className="text-[10px] text-slate-400">2.0%</span>
            <input
              type="range"
              min="2.0"
              max="10.0"
              step="0.5"
              value={captureRateMultiplier}
              onChange={(e) => setCaptureRateMultiplier(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">10.0%</span>
          </div>
        </div>

        {/* Catchment Radius Context Summary */}
        <div className="pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-900/50 text-purple-200 border border-purple-700/60 font-bold text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              {selectedRadius}-Mile Catchment ({selectedRadius === 1 ? 'Primary Infill Buffer' : selectedRadius === 3 ? 'Secondary Core Trade Area' : 'Macro Regional Feeder Corridor'})
            </span>
            {isLoadingLive && (
              <span className="text-[10px] text-cyan-400 font-mono animate-pulse">
                Recalculating live spatial buffer...
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Pop: <strong className="text-white">{catchmentPop.toLocaleString()}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Daytime Workers: <strong className="text-slate-200">{daytimeWorkforce.toLocaleString()}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Competitors in {selectedRadius}M: <strong className="text-amber-300">{activeCompetitorCount}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Total Pumps: <strong className="text-emerald-300">{activePumpCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Top Level Mobility KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Corridor Daily AADT</span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {baseAadt.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">veh/day</span>
          </div>
          <div className="text-[11px] text-cyan-300">
            {activeSite?.dominantRoadClass || 'Principal Arterial Corridor'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Projected Daily Customer Footfall</span>
            <Footprints className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">
            {totalCalculatedDailyVisits.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">visits/day</span>
          </div>
          <div className="text-[11px] text-purple-300 font-semibold">
            {Math.round(totalCalculatedDailyVisits * 365).toLocaleString()} Annual On-Site Patrons
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Est. Annual Fuel Volume</span>
            <Fuel className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {(totalAnnualProjectedGallons / 1000000).toFixed(2)}M{' '}
            <span className="text-xs font-normal text-slate-400">gal/yr</span>
          </div>
          <div className="text-[11px] text-slate-300">
            Based on ~12.8 gal average ticket
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Inside C-Store Sales</span>
            <Store className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-400">
            ${(totalAnnualProjectedInsideSales / 1000000).toFixed(2)}M{' '}
            <span className="text-xs font-normal text-slate-400">/yr</span>
          </div>
          <div className="text-[11px] text-slate-300">
            52% Fuel-to-Store Basket Conversion
          </div>
        </div>
      </div>

      {/* Main Visuals Breakdown */}
      {activeTabMode === 'hourly' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly 24h Diurnal Curve */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                24-Hour Diurnal Footfall & Traffic Capture Profile
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Sun className="w-3 h-3" /> AM Rush (7-9AM)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                  <Moon className="w-3 h-3" /> PM Rush (4-7PM)
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hourShort" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false}
                    width={40}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [
                      `${val} patrons`, 
                      name
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Area type="monotone" dataKey="projectedVisits" name="Total Customer Visits" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorVisits)" />
                  <Area type="monotone" dataKey="fuelOnly" name="Fuel Fill-up Customers" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFuel)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-800">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Morning Peak Pulse</div>
                <div className="text-sm font-black text-amber-300">07:00 - 08:30</div>
                <div className="text-[10px] text-slate-400">Coffee, bakery & commuter fill-up</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Midday Lunch Surge</div>
                <div className="text-sm font-black text-emerald-300">11:30 - 13:30</div>
                <div className="text-[10px] text-slate-400">Fresh foodservice & beverage grab</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Evening Commute Peak</div>
                <div className="text-sm font-black text-purple-300">16:30 - 18:30</div>
                <div className="text-[10px] text-slate-400">Full tank fill-ups & take-home dinners</div>
              </div>
            </div>
          </div>

          {/* Weekday vs Weekend Profile */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Day-of-Week Trajectory
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Weekly Volume
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayWeekendData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false}
                    width={45}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`${Number(val).toLocaleString()} visits`, 'Day Volume']}
                  />
                  <Bar dataKey="footfall" name="Day Footfall" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="text-emerald-400 font-bold">Friday Lift (+24%):</span> Interstate feeder traffic surges Friday afternoon as regional weekend recreational and highway travelers pass through the interchange corridor.
            </div>
          </div>
        </div>
      )}

      {activeTabMode === 'commuter' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AM Peak Split */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                Morning Rush Commuter Inbound Split (06:00 - 09:00)
              </h3>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                Inbound Heavy
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">CBD Inbound Traffic (Toward Metro Hub):</span>
                <span className="font-bold text-amber-400 text-sm">
                  68% ({((liveCommuterData?.amPeakDirectionalSplit?.morningCommutersPerHour || Math.round(baseAadt * 0.094))).toLocaleString()} veh/hr)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                <div className="bg-amber-500 h-full" style={{ width: '68%' }} />
                <div className="bg-slate-700 h-full" style={{ width: '32%' }} />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Inbound Commuters (Work Bound)</span>
                <span>Outbound Reverse Commute (32%)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <Coffee className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Morning Ingress Optimization:</strong> Direct deceleration slip-ramp from inbound arterial allows rapid 90-second drive-thru beverage pickup before interstate merge.
                </div>
              </div>
            </div>
          </div>

          {/* PM Peak Split */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                Evening Rush Outbound Split (16:00 - 19:00)
              </h3>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                Outbound Homeward
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Suburban Outbound Traffic (Homeward Bound):</span>
                <span className="font-bold text-indigo-400 text-sm">
                  71% ({((liveCommuterData?.pmPeakDirectionalSplit?.eveningCommutersPerHour || Math.round(baseAadt * 0.104))).toLocaleString()} veh/hr)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                <div className="bg-indigo-500 h-full" style={{ width: '71%' }} />
                <div className="bg-slate-700 h-full" style={{ width: '29%' }} />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Outbound Commuters (Home Bound)</span>
                <span>Inbound Traffic (29%)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <Fuel className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Evening Fuel Refill Behavior:</strong> 64% of weekly fuel gallons are dispensed on homeward commute when drivers have more flexible dwell time (6.2 minutes avg).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTabMode === 'conversion' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trip Purpose Donut */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-400" />
                Patron Trip Purpose & Conversion Breakdown
              </h3>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                Basket Composition
              </span>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {conversionPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val}% (${item.payload.count.toLocaleString()} visits/day)`,
                      'Share'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
              {conversionPieData.map((item, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="truncate">
                    <div className="font-bold text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400">{item.value}% • {item.count.toLocaleString()} /day</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dwell Time & Dual-Stop Lift */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Dwell Time & Average Spend Matrix
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-300">
                  Unit Economics
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Fuel className="w-4 h-4 text-blue-400" />
                    <span>Fuel Fill-up Customer Dwell:</span>
                  </div>
                  <div className="font-bold text-white">4.2 min <span className="text-slate-400 font-normal">($42.50 ticket)</span></div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span>C-Store / Foodservice Customer Dwell:</span>
                  </div>
                  <div className="font-bold text-white">6.8 min <span className="text-slate-400 font-normal">($11.20 ticket)</span></div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>EV DC Fast Charging Dwell:</span>
                  </div>
                  <div className="font-bold text-white">26.5 min <span className="text-slate-400 font-normal">($28.00 inside c-store spend)</span></div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-800/40 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> High Margin Insight:
              </div>
              <div>
                EV drivers exhibit 4x longer dwell time than gasoline patrons, resulting in an average of $28.00 in high-margin foodservice and premium coffee purchases while charging.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
