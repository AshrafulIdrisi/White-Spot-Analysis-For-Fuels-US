import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Navigation, 
  Fuel, 
  Store, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Globe,
  Sliders,
  Layers,
  Database,
  Compass,
  Filter
} from 'lucide-react';
import { WhiteSpotCandidate } from '../types';
import { scanOsmRegionalWhiteSpots } from '../services/osmService';
import { US_GROWTH_CORRIDORS, UsCorridor } from '../data/corridors';

interface OsmScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (newCandidates: WhiteSpotCandidate[]) => void;
  currentMapCenter?: { lat: number; lng: number };
}

export const OsmScannerModal: React.FC<OsmScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  currentMapCenter
}) => {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(US_GROWTH_CORRIDORS[0].id);
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [corridorSearch, setCorridorSearch] = useState<string>('');
  
  // Custom location mode
  const [scanMode, setScanMode] = useState<'preset' | 'custom' | 'mapCenter'>('preset');
  const [customSearchQuery, setCustomSearchQuery] = useState<string>('');
  const [customGeocodedLocation, setCustomGeocodedLocation] = useState<{ lat: number; lng: number; displayName: string } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<WhiteSpotCandidate[] | null>(null);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>('');

  if (!isOpen) return null;

  const filteredCorridors = US_GROWTH_CORRIDORS.filter(c => {
    if (regionFilter !== 'ALL' && c.region !== regionFilter) return false;
    if (corridorSearch) {
      const q = corridorSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.growthTag.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedCorridor = US_GROWTH_CORRIDORS.find(c => c.id === selectedCorridorId) || US_GROWTH_CORRIDORS[0];

  // Geocode custom location
  const handleGeocodeCustomLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchQuery.trim()) return;
    setIsGeocoding(true);
    setGeocodeError(null);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&q=${encodeURIComponent(customSearchQuery)}&limit=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en-US,en' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        setCustomGeocodedLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        });
      } else {
        setGeocodeError('Could not locate address in the US. Please try typing City, State (e.g., "Austin, TX" or "Miami, FL").');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setGeocodeError('Geocoding lookup timed out. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    setScanResults(null);
    setScanStatusMessage('Contacting live OpenStreetMap Overpass servers...');

    let targetLat = selectedCorridor.lat;
    let targetLng = selectedCorridor.lng;
    let regionName = selectedCorridor.name;

    if (scanMode === 'custom' && customGeocodedLocation) {
      targetLat = customGeocodedLocation.lat;
      targetLng = customGeocodedLocation.lng;
      regionName = customGeocodedLocation.displayName.split(',')[0] + ' Trade Area';
    } else if (scanMode === 'mapCenter' && currentMapCenter) {
      targetLat = currentMapCenter.lat;
      targetLng = currentMapCenter.lng;
      regionName = 'Map Viewport Center';
    }

    try {
      // First try local client-side overpass spatial scan which directly evaluates void nodes
      const results = await scanOsmRegionalWhiteSpots(targetLat, targetLng, regionName);
      if (results && results.length > 0) {
        setScanResults(results);
      } else {
        // Fallback to backend endpoint
        const response = await fetch('/api/v1/osm/detect-whitespots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: targetLat,
            lng: targetLng,
            regionName
          })
        });

        const resJson = await response.json();
        if (resJson.success && resJson.detectedCandidates) {
          setScanResults(resJson.detectedCandidates);
        }
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
      setScanStatusMessage('');
    }
  };

  const handleApplyAll = () => {
    if (scanResults) {
      onScanComplete(scanResults);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-purple-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-purple-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 font-sans">
        {/* Header */}
        <div className="p-5 border-b border-purple-100 bg-purple-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-inner">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-purple-950 flex items-center space-x-2">
                <span>Nationwide US Growth Corridor Scanner</span>
              </h3>
              <p className="text-xs text-purple-600">
                Live OpenStreetMap spatial scan across all 50 states and target metro corridors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-purple-400 hover:text-purple-700 hover:bg-purple-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
          {/* Scan Target Mode Selector */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-purple-50/70 rounded-2xl border border-purple-100 text-xs">
            <button
              onClick={() => setScanMode('preset')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                scanMode === 'preset'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-purple-800 hover:bg-purple-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>US Corridors ({US_GROWTH_CORRIDORS.length})</span>
            </button>

            <button
              onClick={() => setScanMode('custom')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                scanMode === 'custom'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-purple-800 hover:bg-purple-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Any US City / Zip Code</span>
            </button>

            {currentMapCenter && (
              <button
                onClick={() => setScanMode('mapCenter')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  scanMode === 'mapCenter'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-purple-800 hover:bg-purple-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Map Center Viewport</span>
              </button>
            )}
          </div>

          {/* MODE 1: PRESET US CORRIDORS */}
          {scanMode === 'preset' && (
            <div className="space-y-3">
              {/* Region Filter Buttons & Quick Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {['ALL', 'South', 'West', 'Midwest', 'Northeast'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRegionFilter(r)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        regionFilter === r
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      {r === 'ALL' ? 'All US' : r}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    placeholder="Filter by state / city..."
                    value={corridorSearch}
                    onChange={(e) => setCorridorSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-purple-50 text-xs text-purple-950 border border-purple-200 focus:outline-none focus:border-purple-600 font-medium placeholder:text-purple-300 w-full sm:w-48"
                  />
                </div>
              </div>

              {/* Corridor List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {filteredCorridors.map((corridor) => (
                  <button
                    key={corridor.id}
                    onClick={() => setSelectedCorridorId(corridor.id)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      selectedCorridorId === corridor.id
                        ? 'bg-purple-100/80 border-purple-600 text-purple-950 shadow-md shadow-purple-500/10 ring-1 ring-purple-600'
                        : 'bg-purple-50/40 border-purple-100 text-purple-800 hover:bg-purple-50 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate max-w-[220px] text-purple-950">{corridor.name}</span>
                      <span className="px-2 py-0.5 bg-purple-200 text-purple-900 rounded-md text-[10px] font-black">
                        {corridor.state}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-700 leading-snug line-clamp-2">
                      {corridor.desc}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-100/60 text-[10px]">
                      <span className="font-semibold text-purple-600">{corridor.growthTag}</span>
                      <span className="font-mono text-purple-800 font-bold">{corridor.aadtEstimate.toLocaleString()} AADT</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MODE 2: CUSTOM ANY US CITY / ZIP CODE */}
          {scanMode === 'custom' && (
            <div className="space-y-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
              <form onSubmit={handleGeocodeCustomLocation} className="space-y-2">
                <label className="block text-xs font-bold text-purple-950">
                  Search Any City, County, Highway, or Zip Code in the United States:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-500" />
                    <input
                      type="text"
                      placeholder="e.g., Dallas, TX or 33101 or I-95 Savannah GA..."
                      value={customSearchQuery}
                      onChange={(e) => setCustomSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-purple-200 focus:outline-none focus:border-purple-600 text-xs text-purple-950 font-medium shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isGeocoding || !customSearchQuery.trim()}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-purple-500/20"
                  >
                    {isGeocoding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Locate</span>
                  </button>
                </div>
              </form>

              {geocodeError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {geocodeError}
                </div>
              )}

              {customGeocodedLocation && (
                <div className="p-3 rounded-xl bg-white border border-purple-200 text-xs space-y-1 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Target Trade Area Located</span>
                  </div>
                  <div className="font-bold text-purple-950">{customGeocodedLocation.displayName}</div>
                  <div className="text-[11px] font-mono text-purple-600">
                    GPS: [{customGeocodedLocation.lat.toFixed(4)}, {customGeocodedLocation.lng.toFixed(4)}]
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 3: MAP VIEWPORT CENTER */}
          {scanMode === 'mapCenter' && currentMapCenter && (
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-purple-950">Active Viewport Coordinates</div>
                <div className="text-[11px] font-mono text-purple-700">
                  Lat: {currentMapCenter.lat.toFixed(4)} | Lng: {currentMapCenter.lng.toFixed(4)}
                </div>
                <div className="text-[10px] text-purple-500">
                  The scanner will query Overpass API within a 5-mile radius around your current map view.
                </div>
              </div>
            </div>
          )}

          {/* Trigger Scan Button */}
          <div className="pt-2">
            <button
              onClick={handleRunScan}
              disabled={isScanning || (scanMode === 'custom' && !customGeocodedLocation)}
              className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{scanStatusMessage || 'Querying Overpass API & Computing Voids...'}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>
                    {scanMode === 'custom' 
                      ? `Scan ${customGeocodedLocation ? customGeocodedLocation.displayName.split(',')[0] : 'Custom US Location'} for Voids`
                      : scanMode === 'mapCenter' 
                        ? 'Scan Active Map Viewport for Voids'
                        : `Scan ${selectedCorridor.name} for Voids`}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Scan Results Display */}
          {scanResults && (
            <div className="p-4 bg-purple-50/60 rounded-3xl border border-purple-200 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-purple-950 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Discovered {scanResults.length} High-Opportunity Spatial Voids</span>
                </div>
                <span className="text-[11px] text-purple-600 font-medium">Source: OpenStreetMap Live</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {scanResults.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-3 bg-white rounded-2xl border border-purple-100 hover:border-purple-300 transition-all flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="font-bold text-purple-950 text-xs">{cand.candidateName}</div>
                      <div className="text-[11px] text-purple-600">
                        {cand.nearestStationMiles} mi to nearest fuel • {(cand.aadt || 0).toLocaleString()} AADT
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-purple-700">{cand.opportunityScore} <span className="text-[10px] font-normal text-purple-400">/ 100</span></div>
                      <div className="text-[10px] text-emerald-700 font-bold">{cand.riskLevel} Risk</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleApplyAll}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-md shadow-purple-500/20 cursor-pointer"
              >
                <span>Import All {scanResults.length} Candidates into Pipeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
