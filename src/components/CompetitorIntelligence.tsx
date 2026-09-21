import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  MapPin, 
  Fuel, 
  Store, 
  TrendingUp, 
  Star, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Sparkles,
  Layers,
  Search,
  Compass,
  RefreshCw,
  Zap,
  Target,
  ExternalLink
} from 'lucide-react';
import { WhiteSpotCandidate, StoreLocationRecord, CompetitorComparison, OsmPoiRecord, RadiusAnalysisData } from '../types';
import { fetchLiveOsmPois, analyzeLocationRadius } from '../services/osmService';
import { getCompetitorBrandStyle } from '../utils/brandStyling';

interface CompetitorIntelligenceProps {
  candidates: WhiteSpotCandidate[];
  locations: StoreLocationRecord[];
  selectedCandidate?: WhiteSpotCandidate | null;
  onSelectCandidate?: (cand: WhiteSpotCandidate) => void;
  onNavigateToMap?: (cand?: WhiteSpotCandidate) => void;
}

export const CompetitorIntelligence: React.FC<CompetitorIntelligenceProps> = ({
  candidates,
  locations,
  selectedCandidate,
  onSelectCandidate,
  onNavigateToMap
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    selectedCandidate?.id || candidates[0]?.id || ''
  );
  const [activeRadius, setActiveRadius] = useState<1 | 3 | 5>(3);
  const [livePois, setLivePois] = useState<OsmPoiRecord[]>([]);
  const [liveAnalysis, setLiveAnalysis] = useState<RadiusAnalysisData | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const activeTarget = (selectedCandidate && (selectedCandidate.id === selectedTargetId || !selectedTargetId))
    ? selectedCandidate
    : (candidates.find(c => c.id === selectedTargetId) || selectedCandidate || candidates[0] || null);

  // Fetch live OSM competitors around active target
  const fetchLiveCompetitors = async (lat: number, lng: number, radius: 1 | 3 | 5) => {
    setIsLoadingLive(true);
    try {
      const [pois, analysis] = await Promise.all([
        fetchLiveOsmPois(lat, lng, radius),
        analyzeLocationRadius(lat, lng, radius, activeTarget?.candidateName)
      ]);
      setLivePois(pois);
      setLiveAnalysis(analysis);
      setLastFetchedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error('Failed to load live competitor POIs:', e);
    } finally {
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    if (activeTarget) {
      fetchLiveCompetitors(activeTarget.lat, activeTarget.lng, activeRadius);
    }
  }, [selectedTargetId, activeRadius, activeTarget?.lat, activeTarget?.lng]);

  // Sync with parent selectedCandidate
  useEffect(() => {
    if (selectedCandidate) {
      setSelectedTargetId(selectedCandidate.id);
    }
  }, [selectedCandidate?.id, selectedCandidate?.lat, selectedCandidate?.lng]);

  if (!activeTarget) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="p-8 bg-white border border-purple-200 rounded-3xl text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-purple-100 border border-purple-200 text-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Swords className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-purple-950">No Active Target Selected</h2>
          <p className="text-xs text-purple-700 max-w-md mx-auto">
            Scan for trade area voids using the Live OpenStreetMap Scanner or click any point on the live map to evaluate competitive density.
          </p>
          {onNavigateToMap && (
            <button
              onClick={() => onNavigateToMap()}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-500/20 cursor-pointer"
            >
              Open Map Hub
            </button>
          )}
        </div>
      </div>
    );
  }

  // Filter live POIs for fuel competitors
  const competitorStations = livePois.filter(p => p.amenity === 'fuel' || (p.pumpsCount && p.pumpsCount > 0));

  const totalCompetitorPumps = competitorStations.reduce((sum, s) => sum + (s.pumpsCount || 8), 0);
  const nearestStationMiles = competitorStations[0]?.distanceMiles ?? (activeTarget.nearestStationMiles || 2.2);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header & Live Target Selector */}
      <div className="bg-white border border-purple-200 p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-purple-700" />
                Competitor Intelligence
              </span>
              <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                Live Overpass POI Engine
              </span>
              {lastFetchedAt && (
                <span className="text-[11px] text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Synced: {lastFetchedAt}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-purple-950 tracking-tight">
              Live Competitor Head-to-Head & Capacity Analysis
            </h2>
            <p className="text-xs text-purple-700">
              Surrounding station locations, brand power ratings, pump counts, and competitive vulnerability.
            </p>
          </div>

          {/* Target Site Selector & Refresh */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-900 font-bold hidden sm:inline">Active Target:</span>
              <select
                value={activeTarget.id}
                onChange={(e) => {
                  const target = candidates.find(c => c.id === e.target.value);
                  setSelectedTargetId(e.target.value);
                  if (target && onSelectCandidate) onSelectCandidate(target);
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

            <button
              onClick={() => fetchLiveCompetitors(activeTarget.lat, activeTarget.lng, activeRadius)}
              disabled={isLoadingLive}
              className="px-3.5 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin text-purple-700' : ''}`} />
              <span>{isLoadingLive ? 'Fetching...' : 'Fetch Live OSM'}</span>
            </button>

            {onNavigateToMap && (
              <button
                onClick={() => onNavigateToMap(activeTarget)}
                className="px-3.5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
            )}
          </div>
        </div>

        {/* Radius Filter & Summary Pill */}
        <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-900">Trade Area Buffer:</span>
            <div className="flex gap-1.5">
              {([1, 3, 5] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRadius(r)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    activeRadius === r
                      ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                      : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  {r} {r === 1 ? 'Mile' : 'Miles'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-purple-800">
              Live Competitors: <strong className="text-purple-950 font-bold">{competitorStations.length} stations</strong>
            </span>
            <span className="text-purple-800">
              Total Pumps: <strong className="text-purple-950 font-bold">{totalCompetitorPumps} nozzles</strong>
            </span>
            <span className="text-purple-800">
              Nearest Rival: <strong className="text-purple-950 font-bold">{nearestStationMiles} miles</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Summary Benchmark Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold">Competitor Density ({activeRadius}M)</div>
          <div className="text-2xl font-black text-purple-950">{competitorStations.length} <span className="text-xs font-normal text-purple-600">stations</span></div>
          <div className="text-[10px] text-purple-700 font-medium">Real OSM Overpass Nodes</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold">Nearest Competitor Distance</div>
          <div className="text-2xl font-black text-purple-700">{nearestStationMiles} <span className="text-xs font-normal text-purple-600">miles</span></div>
          <div className="text-[10px] text-emerald-600 font-bold">{nearestStationMiles >= 2.0 ? 'Prime Undersupplied Void' : 'Competitive Infill'}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold">Competitor Forecourt Pumps</div>
          <div className="text-2xl font-black text-purple-950">{totalCompetitorPumps} <span className="text-xs font-normal text-purple-600">pumps</span></div>
          <div className="text-[10px] text-purple-700 font-medium">In {activeRadius}-mile trade zone</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold">Competitor Moat Score</div>
          <div className="text-2xl font-black text-emerald-600">
            {liveAnalysis?.detailedScores.competitionMoatScore || activeTarget.competitionScore || 85} <span className="text-xs font-normal text-purple-600">/ 100</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">High ExxonMobil Advantage</div>
        </div>
      </div>

      {/* Live Competitor Stations Table */}
      <div className="bg-white border border-purple-200 rounded-3xl p-5 space-y-4 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-purple-950 flex items-center gap-2">
            <Fuel className="w-4 h-4 text-purple-700" />
            Live OpenStreetMap Competitors in {activeRadius}-Mile Radius ({competitorStations.length} Discovered)
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            Overpass Real-Time
          </span>
        </div>

        {competitorStations.length === 0 ? (
          <div className="p-8 text-center text-purple-700 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-sm text-purple-950">Zero Direct Fuel Competitors Found within {activeRadius} Miles</p>
            <p className="text-xs text-purple-600">This coordinate represents a major retail white spot void with no immediate station competition.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-100 text-purple-700 text-[11px] uppercase font-bold">
                <th className="py-3 px-3">Station Name / Operator</th>
                <th className="py-3 px-3">Brand</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3">Est. Pumps</th>
                <th className="py-3 px-3">C-Store Size</th>
                <th className="py-3 px-3">Fuel Grades / Amenities</th>
                <th className="py-3 px-3">Competitive Threat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 text-purple-900 font-medium">
              {competitorStations.map((comp, idx) => {
                const brandStyle = getCompetitorBrandStyle(comp.brand || comp.name);
                const threat = (comp.pumpsCount || 8) >= 12 ? 'High Challenger' : (comp.pumpsCount || 8) >= 8 ? 'Moderate Competitor' : 'Aging / Vulnerable';
                return (
                  <tr key={idx} className="hover:bg-purple-50/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-purple-950">{comp.name}</div>
                      <div className="text-[10px] text-purple-600 truncate max-w-[200px]">{comp.street || comp.city || 'Corridor Road'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${brandStyle.badgeBg} ${brandStyle.badgeText} ${brandStyle.borderColor}`}>
                        {brandStyle.icon} {comp.brand || 'Independent'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-purple-700">{comp.distanceMiles} mi</td>
                    <td className="py-3 px-3 font-bold text-purple-950">{comp.pumpsCount || 8} pumps</td>
                    <td className="py-3 px-3">{comp.cStoreSqFt ? `${comp.cStoreSqFt.toLocaleString()} sq ft` : '3,400 sq ft'}</td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1 flex-wrap">
                        {comp.fuelDiesel && <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">Diesel</span>}
                        {comp.amenity === 'charging_station' && <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">EV</span>}
                        {comp.shop === 'convenience' && <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded text-[9px] font-bold">C-Store</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        threat === 'High Challenger'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : threat === 'Moderate Competitor'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {threat}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
