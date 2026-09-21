import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Fuel, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Sliders, 
  Download, 
  Filter, 
  Search, 
  Target,
  RefreshCw,
  Trash2,
  Globe,
  PlusCircle,
  Building2,
  ArrowRight,
  Zap,
  Activity,
  Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { WhiteSpotCandidate, ScoringWeights } from '../types';
import { scanOsmRegionalWhiteSpots } from '../services/osmService';
import { US_GROWTH_CORRIDORS, UsCorridor } from '../data/corridors';

interface WhiteSpotExplorerProps {
  candidates: WhiteSpotCandidate[];
  weights: ScoringWeights;
  onUpdateWeights: (newWeights: ScoringWeights) => void;
  onSelectCandidate: (candidate: WhiteSpotCandidate) => void;
  onOpenAIRecommendation: (candidate: WhiteSpotCandidate) => void;
  onExportData: (format: 'csv' | 'geojson') => void;
  onLaunchStoreBuilder?: (candidate: WhiteSpotCandidate) => void;
  onClearAllWhiteSpots?: () => void;
  onScanAndPopulateWhiteSpots?: (candidates: WhiteSpotCandidate[]) => void;
  onNavigateToMap?: () => void;
}

export const WhiteSpotExplorer: React.FC<WhiteSpotExplorerProps> = ({
  candidates,
  weights,
  onUpdateWeights,
  onSelectCandidate,
  onOpenAIRecommendation,
  onExportData,
  onLaunchStoreBuilder,
  onClearAllWhiteSpots,
  onScanAndPopulateWhiteSpots,
  onNavigateToMap
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [showWeightSliders, setShowWeightSliders] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState<WhiteSpotCandidate | null>(candidates[0] || null);
  const [isLiveScanning, setIsLiveScanning] = useState(false);
  const [scanStatusMessage, setScanStatusMessage] = useState('');

  // Corridor Selection & Filtering
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [corridorSearchFilter, setCorridorSearchFilter] = useState<string>('');
  const [showCorridorScannerDrawer, setShowCorridorScannerDrawer] = useState(false);

  // Custom location geocoder
  const [customSearchLocation, setCustomSearchLocation] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  // Local weights state for instant slider tweaking
  const [localWeights, setLocalWeights] = useState<ScoringWeights>({ ...weights });

  const handleSliderChange = (key: keyof ScoringWeights, val: number) => {
    const updated = { ...localWeights, [key]: val };
    setLocalWeights(updated);
    onUpdateWeights(updated);
  };

  const handleResetWeights = () => {
    const defaultW: ScoringWeights = {
      demandPotential: 25,
      trafficAccessibility: 20,
      supplyGap: 20,
      competitiveIntensity: 10,
      commercialAttractiveness: 10,
      financialFeasibility: 10,
      growthPotential: 5,
    };
    setLocalWeights(defaultW);
    onUpdateWeights(defaultW);
  };

  // Run live map scanning for a corridor
  const handleRunCorridorScan = async (corridor: UsCorridor) => {
    setIsLiveScanning(true);
    setScanStatusMessage(`Scanning live OpenStreetMap forecourts in ${corridor.name}...`);
    try {
      const generated = await scanOsmRegionalWhiteSpots(corridor.lat, corridor.lng, corridor.name);
      if (generated && generated.length > 0) {
        onScanAndPopulateWhiteSpots?.(generated);
        setActiveCandidate(generated[0]);
        setShowCorridorScannerDrawer(false);
      }
    } catch (err) {
      console.error('Failed to run live scan:', err);
    } finally {
      setIsLiveScanning(false);
      setScanStatusMessage('');
    }
  };

  // Run live scan for custom US address/city
  const handleRunCustomLocationScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchLocation.trim()) return;
    setIsGeocoding(true);
    setGeocodeError(null);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&q=${encodeURIComponent(customSearchLocation)}&limit=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en-US,en' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const regionName = data[0].display_name.split(',')[0] + ' Trade Area';
        
        setIsLiveScanning(true);
        setScanStatusMessage(`Scanning live OpenStreetMap voids in ${regionName}...`);
        
        const generated = await scanOsmRegionalWhiteSpots(lat, lng, regionName);
        if (generated && generated.length > 0) {
          onScanAndPopulateWhiteSpots?.(generated);
          setActiveCandidate(generated[0]);
          setShowCorridorScannerDrawer(false);
          setCustomSearchLocation('');
        }
      } else {
        setGeocodeError('Could not locate US address. Please try "City, State" (e.g., "Austin, TX" or "Miami, FL").');
      }
    } catch (err) {
      console.error('Custom location search error:', err);
      setGeocodeError('Failed to geocode address. Please try another query.');
    } finally {
      setIsGeocoding(false);
      setIsLiveScanning(false);
      setScanStatusMessage('');
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (selectedRisk !== 'ALL' && c.riskLevel !== selectedRisk) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (c.candidateName || '').toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q) ||
        (c.state || '').toLowerCase().includes(q) ||
        (c.zipCode || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredCorridors = US_GROWTH_CORRIDORS.filter(c => {
    if (selectedRegion !== 'ALL' && c.region !== selectedRegion) return false;
    if (corridorSearchFilter) {
      const q = corridorSearchFilter.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.growthTag.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Scatter data for Demand vs Supply Matrix
  const scatterData = filteredCandidates.map(c => ({
    x: c.demandScore,
    y: c.supplyGapScore,
    z: c.opportunityScore,
    name: c.candidateName,
    cityState: `${c.city}, ${c.state}`,
    score: c.opportunityScore,
    candidate: c
  }));

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header & Scanning Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-purple-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold border border-purple-200">
              Live Trade Area Opportunity Matrix
            </span>
            <span className="text-xs text-purple-600 font-mono">
              {candidates.length} candidate sites evaluated
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-purple-950">
            US Retail Forecourt White Spot Scanner
          </h1>
          <p className="text-xs text-purple-700">
            Scan high-growth US highway corridors and municipal growth boundaries for forecourt & C-store voids.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCorridorScannerDrawer(!showCorridorScannerDrawer)}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Scan US Corridors & Cities ({US_GROWTH_CORRIDORS.length})</span>
          </button>

          <button
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className={`px-3.5 py-2.5 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              showWeightSliders
                ? 'bg-purple-100 border-purple-600 text-purple-950'
                : 'bg-white border-purple-200 text-purple-800 hover:bg-purple-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-700" />
            <span>Weights</span>
          </button>

          {candidates.length > 0 && onClearAllWhiteSpots && (
            <button
              onClick={onClearAllWhiteSpots}
              className="px-3 py-2.5 rounded-2xl bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Clear all candidates to trigger a clean live corridor scan"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <div className="flex items-center rounded-2xl bg-purple-50 border border-purple-200 p-1">
            <button
              onClick={() => onExportData('csv')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-purple-900 hover:bg-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-purple-700" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => onExportData('geojson')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-purple-900 hover:bg-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-purple-700" />
              <span>GeoJSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Corridor & US Location Drawer (Expandable at top) */}
      {showCorridorScannerDrawer && (
        <div className="bg-white border border-purple-200 rounded-3xl p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-4">
            <div>
              <h3 className="text-base font-black text-purple-950 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-700" />
                Select Any US Growth Corridor or Custom City to Scan Live
              </h3>
              <p className="text-xs text-purple-600">
                Queries live OpenStreetMap Forecourts, Fuel Pumps, and Highway AADT to detect underserved spatial voids:
              </p>
            </div>

            {/* Custom Location Search */}
            <form onSubmit={handleRunCustomLocationScan} className="flex gap-2 min-w-[280px]">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  placeholder="Scan any city (e.g., Miami, FL)..."
                  value={customSearchLocation}
                  onChange={(e) => setCustomSearchLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-purple-50 text-xs text-purple-950 border border-purple-200 rounded-xl focus:outline-none focus:border-purple-600 font-medium placeholder:text-purple-400"
                />
              </div>
              <button
                type="submit"
                disabled={isGeocoding || isLiveScanning || !customSearchLocation.trim()}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-md shadow-purple-500/20"
              >
                {isGeocoding || isLiveScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Scan</span>
              </button>
            </form>
          </div>

          {geocodeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {geocodeError}
            </div>
          )}

          {/* Regional Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 text-xs">
              {['ALL', 'South', 'West', 'Midwest', 'Northeast'].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRegion(r)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedRegion === r
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  {r === 'ALL' ? 'All US Corridors' : r}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                placeholder="Filter corridors by state or name..."
                value={corridorSearchFilter}
                onChange={(e) => setCorridorSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-purple-50 text-xs text-purple-950 border border-purple-200 focus:outline-none focus:border-purple-600 font-medium placeholder:text-purple-300 w-full sm:w-64"
              />
            </div>
          </div>

          {/* Corridor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {filteredCorridors.map((corridor) => (
              <div
                key={corridor.id}
                className="bg-purple-50/40 border border-purple-100 hover:border-purple-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-950 group-hover:text-purple-700 transition-colors">
                      {corridor.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-200 text-purple-900 text-[10px] font-black">
                      {corridor.state}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-700 leading-snug line-clamp-2">
                    {corridor.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-purple-100 text-[10px]">
                  <span className="font-semibold text-purple-600">{corridor.growthTag}</span>
                  <span className="font-mono text-purple-900 font-bold">{corridor.aadtEstimate.toLocaleString()} AADT</span>
                </div>

                <button
                  onClick={() => handleRunCorridorScan(corridor)}
                  disabled={isLiveScanning}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-purple-500/20 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan {corridor.state} Voids Live</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weight Adjuster Panel */}
      {showWeightSliders && (
        <div className="bg-white border border-purple-200 rounded-3xl p-5 space-y-4 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-600" />
                Dynamic Site Scoring Multipliers (Total: {Object.values(localWeights).reduce((a: number, b: number) => a + b, 0)}%)
              </h3>
              <p className="text-[11px] text-purple-600">
                Adjust corporate weights to dynamically re-rank expansion nodes across trade areas.
              </p>
            </div>
            <button
              onClick={handleResetWeights}
              className="text-xs text-purple-600 hover:text-purple-900 underline font-semibold cursor-pointer"
            >
              Reset to Corporate Baseline
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
              <div className="flex justify-between text-xs font-bold text-purple-900">
                <span>Demand Potential</span>
                <span className="text-purple-700">{localWeights.demandPotential}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={localWeights.demandPotential}
                onChange={(e) => handleSliderChange('demandPotential', parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
              <div className="flex justify-between text-xs font-bold text-purple-900">
                <span>Traffic & AADT Capture</span>
                <span className="text-purple-700">{localWeights.trafficAccessibility}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={localWeights.trafficAccessibility}
                onChange={(e) => handleSliderChange('trafficAccessibility', parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
              <div className="flex justify-between text-xs font-bold text-purple-900">
                <span>Supply Void / Distance Gap</span>
                <span className="text-purple-700">{localWeights.supplyGap}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={localWeights.supplyGap}
                onChange={(e) => handleSliderChange('supplyGap', parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
              <div className="flex justify-between text-xs font-bold text-purple-900">
                <span>Financial Feasibility / IRR</span>
                <span className="text-purple-700">{localWeights.financialFeasibility}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={localWeights.financialFeasibility}
                onChange={(e) => handleSliderChange('financialFeasibility', parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ZERO STATE: Process Fresh White Spots from Live Map */}
      {candidates.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-white border-2 border-dashed border-purple-200 rounded-3xl p-8 text-center space-y-5 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 mx-auto">
              <Target className="w-8 h-8" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="text-xl font-black text-purple-950">
                Select a High-Growth US Corridor or City to Scan Live
              </h3>
              <p className="text-xs text-purple-700 leading-relaxed">
                Scan real-time OpenStreetMap fuel stations, forecourt pump counts, and AADT traffic volumes to identify genuine high-opportunity expansion voids across all US states.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onNavigateToMap && (
                <button
                  onClick={onNavigateToMap}
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open Interactive Map & Click Any Point</span>
                </button>
              )}

              <button
                onClick={() => handleRunCorridorScan(US_GROWTH_CORRIDORS[0])}
                disabled={isLiveScanning}
                className="px-5 py-3 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLiveScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-700" />
                    <span>Querying Overpass Live Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    <span>Scan Houston TX-99 Corridor Voids</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Regional Preset Scan Selector */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                Select a High-Growth US Corridor to Scan Live:
              </h4>
              
              {/* Region Filters */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {['ALL', 'South', 'West', 'Midwest', 'Northeast'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRegion(r)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedRegion === r
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white text-purple-800 border border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    {r === 'ALL' ? 'All US' : r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCorridors.map((corridor) => (
                <div
                  key={corridor.id}
                  className="bg-white border border-purple-100 hover:border-purple-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-950 group-hover:text-purple-700 transition-colors">
                        {corridor.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black">
                        {corridor.state}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-600 leading-snug">
                      {corridor.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-purple-50 text-[10px]">
                    <span className="text-purple-600 font-semibold">{corridor.growthTag}</span>
                    <span className="font-mono text-purple-900 font-bold">{corridor.aadtEstimate.toLocaleString()} AADT</span>
                  </div>

                  <button
                    onClick={() => handleRunCorridorScan(corridor)}
                    disabled={isLiveScanning}
                    className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-800 hover:text-white border border-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Live Void Scan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* POPULATED STATE: Candidates Explorer Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Search, Filter, and Ranked List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search & Risk Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-purple-200 shadow-sm">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter candidate sites by city, corridor, zip..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-purple-50/50 border border-purple-100 rounded-xl text-xs text-purple-950 placeholder-purple-400 focus:outline-none focus:border-purple-400 font-medium"
                />
              </div>

              <div className="flex items-center gap-1 text-xs">
                {['ALL', 'Low', 'Moderate'].map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setSelectedRisk(risk)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      selectedRisk === risk
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100'
                    }`}
                  >
                    {risk === 'ALL' ? 'All Risks' : `${risk} Risk`}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate List Cards */}
            <div className="space-y-3">
              {filteredCandidates.map((cand, idx) => {
                const isSelected = activeCandidate?.id === cand.id;
                return (
                  <div
                    key={cand.id}
                    onClick={() => {
                      setActiveCandidate(cand);
                      onSelectCandidate(cand);
                    }}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-600 ring-1 ring-purple-600 shadow-purple-500/10'
                        : 'bg-white border-purple-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 border border-purple-300 flex items-center justify-center text-xs font-black">
                            #{idx + 1}
                          </span>
                          <h3 className="font-bold text-sm text-purple-950">
                            {cand.candidateName}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cand.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {cand.riskLevel} Risk
                          </span>
                        </div>
                        <div className="text-xs text-purple-600 flex items-center gap-3">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3 text-purple-500" />
                            {cand.city}, {cand.state} {cand.zipCode}
                          </span>
                          <span>•</span>
                          <span>{(cand.aadt || 0).toLocaleString()} AADT</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">{cand.nearestStationMiles} mi to nearest fuel</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-purple-600 font-medium">Opportunity Score</div>
                          <div className="text-xl font-black text-purple-900">
                            {cand.opportunityScore} <span className="text-xs font-normal text-purple-500">/ 100</span>
                          </div>
                        </div>

                        {onLaunchStoreBuilder && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLaunchStoreBuilder(cand);
                            }}
                            className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Design and Underwrite Store on this Candidate Site"
                          >
                            <Building2 className="w-3.5 h-3.5 text-purple-700" />
                            <span className="hidden sm:inline">Build Store</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAIRecommendation(cand);
                          }}
                          className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Memo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Active Candidate Deep-Dive & Demand vs Supply Scatter */}
          <div className="space-y-6">
            {/* Demand vs Supply Void Matrix Plot */}
            <div className="bg-white border border-purple-200 rounded-3xl p-5 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Demand vs Supply Gap Matrix
              </h3>
              <p className="text-xs text-purple-600">
                Upper-right quadrant represents prime tier-1 expansion targets.
              </p>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 15, bottom: 20, left: 10 }}>
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Demand Score" 
                      domain={[60, 100]} 
                      stroke="#7e22ce" 
                      fontSize={10} 
                      tickLine={false}
                      tickFormatter={(val) => `${val}`}
                      label={{ value: 'Demand Score →', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#7e22ce', fontWeight: 600 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Supply Gap" 
                      domain={[60, 100]} 
                      stroke="#7e22ce" 
                      fontSize={10} 
                      tickLine={false}
                      width={35}
                      tickFormatter={(val) => `${val}`}
                    />
                    <ZAxis type="number" dataKey="z" range={[60, 200]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e9d5ff', borderRadius: '12px', fontSize: '11px', color: '#3b0764' }}
                      formatter={(val, name, item: any) => [`Score: ${item.payload.score} (Demand: ${item.payload.x}, Supply Gap: ${item.payload.y})`, item.payload.cityState]}
                    />
                    <Scatter data={scatterData} fill="#9333ea">
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score >= 90 ? '#7c3aed' : '#10b981'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Candidate Inspection Summary */}
            {activeCandidate && (
              <div className="bg-white border border-purple-200 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700">Site Feasibility Snapshot</span>
                  <span className="text-[10px] font-mono text-purple-500 font-semibold">Conf: {activeCandidate.confidenceLevel}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                    <div className="text-purple-600 text-[10px] font-medium">Annual Fuel Volume</div>
                    <div className="font-bold text-purple-950">{((activeCandidate.projectedAnnualFuelGallons || 0) / 1000000).toFixed(2)}M gal</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                    <div className="text-purple-600 text-[10px] font-medium">Annual EBITDA</div>
                    <div className="font-bold text-emerald-700">${((activeCandidate.projectedAnnualEbitda || 0) / 1000000).toFixed(2)}M</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                    <div className="text-purple-600 text-[10px] font-medium">CapEx Requirement</div>
                    <div className="font-bold text-purple-950">${((activeCandidate.estimatedCapEx || 0) / 1000000).toFixed(2)}M</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                    <div className="text-purple-600 text-[10px] font-medium">Unlevered IRR</div>
                    <div className="font-bold text-purple-700">{activeCandidate.estimatedIrrPct}%</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-semibold text-purple-900">Primary Rationale & Proofs</div>
                  <ul className="space-y-1 text-xs text-purple-700">
                    {(activeCandidate.primaryRationale || []).map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {onLaunchStoreBuilder && (
                  <button
                    onClick={() => onLaunchStoreBuilder(activeCandidate)}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Build & Underwrite Store On This Site</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
