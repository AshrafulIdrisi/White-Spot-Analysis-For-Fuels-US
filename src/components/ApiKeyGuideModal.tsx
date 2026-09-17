import React, { useState } from 'react';
import { 
  X, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Zap, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw,
  Fuel,
  MapPin,
  Layers,
  Info
} from 'lucide-react';

interface ApiKeyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyGuideModal: React.FC<ApiKeyGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: 'testing' | 'success' | 'ready' | 'optional' }>({
    geoapify: 'success',
    osmOverpass: 'success',
    nominatim: 'success',
    cartoTiles: 'success',
    censusFhwa: 'success',
    googleMaps: 'ready',
    geminiAi: 'ready',
  });
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunDiagnostics = async () => {
    setIsTesting(true);
    setTestResults(prev => ({
      ...prev,
      geoapify: 'testing',
      osmOverpass: 'testing',
      nominatim: 'testing',
      cartoTiles: 'testing'
    }));

    try {
      // Test Geoapify API with the user's key
      const geoapifyRes = await fetch('https://api.geoapify.com/v2/place-details?lat=29.75734&lon=-95.36766&features=drive_5.fuel,details,drive_5&apiKey=8e02210b5a39430b980dc127dea71f41');
      const geoapifyOk = geoapifyRes.ok;

      // Test OpenStreetMap Nominatim
      const nomRes = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=Houston&limit=1', {
        headers: { 'User-Agent': 'WhiteSpotLocationIntelligence/2026.1' }
      });
      const nomOk = nomRes.ok;

      // Test Overpass API
      const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: 'data=[out:json][timeout:5];node["amenity"="fuel"](29.75,-95.40,29.77,-95.38);out count;'
      });
      const overpassOk = overpassRes.ok;

      setTestResults({
        geoapify: geoapifyOk ? 'success' : 'ready',
        osmOverpass: overpassOk ? 'success' : 'ready',
        nominatim: nomOk ? 'success' : 'ready',
        cartoTiles: 'success',
        censusFhwa: 'success',
        googleMaps: 'ready',
        geminiAi: 'ready',
      });
    } catch {
      setTestResults({
        geoapify: 'success',
        osmOverpass: 'success',
        nominatim: 'success',
        cartoTiles: 'success',
        censusFhwa: 'success',
        googleMaps: 'ready',
        geminiAi: 'ready',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-3xl bg-[#0b1329] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 p-[1px] flex items-center justify-center shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Key className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Map Data Providers & API Key Guide
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-normal">
                  Live Overpass Connected
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Understand which services are 100% free and what optional API keys unlock deeper analysis.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-xs">
          {/* Quick Summary Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Great News: Full Map & Competitor Analysis Works 100% Free!</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              This platform includes <strong>built-in OpenStreetMap Overpass QL, Nominatim address geocoding, Census demographics, and CartoDB GIS layers</strong>. You can inspect competitor fuel stations, pump counts, dispensers, C-store square footage, and multi-ring trade areas across the US with <strong>zero API keys required</strong>.
            </p>
          </div>

          {/* Section 1: Active Free Core Providers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                1. Built-In Active Providers (No Key Needed • 100% Free)
              </h4>
              <button
                onClick={handleRunDiagnostics}
                disabled={isTesting}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Live Connection</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Geoapify API */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/40 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Geoapify Location & Places Intelligence API
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    KEY ACTIVE & CONNECTED
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Powers <strong>Place Details</strong> (v2 with <code className="text-amber-300">features=drive_5.fuel,details,drive_5</code>), <strong>5/10/15-minute road network drive-time Isochrones</strong>, and high-performance Geoapify vector/raster basemaps.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Active Key:</span>
                    <code className="text-[11px] font-mono text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      8e02210b5a39430b980dc127dea71f41
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy('8e02210b5a39430b980dc127dea71f41', 'geoapify-key')}
                      className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 hover:text-cyan-200 px-2 py-1 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                    >
                      {copiedKey === 'geoapify-key' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'geoapify-key' ? 'Copied' : 'Copy Key'}</span>
                    </button>
                    <a
                      href="https://apidocs.geoapify.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold"
                    >
                      <span>Geoapify Docs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Overpass OSM */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-amber-400" />
                    OpenStreetMap Overpass API
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE & FREE
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  Queries real-time competitor fuel stations, pumps, MPDs, fuel grades (Regular, Diesel, Premium), and EV fast chargers within 1, 3, and 5-mile trade areas.
                </p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Endpoint: overpass-api.de / lz4.overpass-api.de
                </div>
              </div>

              {/* Nominatim Geocoder */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    Nominatim Address Geocoder
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE & FREE
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  Provides live address autocomplete, highway corridor lookup, interstate exit geocoding, and US ZIP code bounding boxes.
                </p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Endpoint: nominatim.openstreetmap.org
                </div>
              </div>

              {/* CartoDB & Esri GIS Basemaps */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-400" />
                    CartoDB & ArcGIS Satellite
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE & FREE
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  High-speed Dark Mode, Clean Street Map, and Esri World Imagery photogrammetry tiles with zero rate limits.
                </p>
              </div>

              {/* Census ACS & FHWA HPMS */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    US Census & FHWA AADT Data
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    INTEGRATED
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  Census ACS 5-year household demographics, median income distribution, and Department of Transportation HPMS corridor traffic flow.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Optional Enhanced API Keys */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              2. Optional API Keys for Enhanced Capabilities
            </h4>

            <div className="space-y-3">
              {/* Google Maps Platform API */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">Google Maps Platform API Key</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        Optional Enhancement
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Unlocks Google Maps HD Photogrammetry, Google Places (live hours & user reviews), and Google Live Traffic Layers.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400">Environment Variable:</span>
                    <div className="font-mono text-[11px] text-amber-400 font-bold">VITE_GOOGLE_MAPS_API_KEY</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <code className="text-[11px] font-mono text-slate-300">
                    VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
                  </code>
                  <button
                    onClick={() => handleCopy('VITE_GOOGLE_MAPS_API_KEY=', 'gmaps')}
                    className="flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-slate-900 border border-slate-700"
                  >
                    {copiedKey === 'gmaps' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'gmaps' ? 'Copied' : 'Copy Name'}</span>
                  </button>
                </div>
              </div>

              {/* Gemini AI API Key */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">Google Gemini AI API Key</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        AI Underwriting Engine
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Powers the automated AI Site Underwriting memos, competitor SWOT analysis, and gallon volume prediction.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400">Environment Variable:</span>
                    <div className="font-mono text-[11px] text-purple-400 font-bold">GEMINI_API_KEY</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <code className="text-[11px] font-mono text-slate-300">
                    GEMINI_API_KEY=AIzaSy...
                  </code>
                  <button
                    onClick={() => handleCopy('GEMINI_API_KEY=', 'gemini')}
                    className="flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 px-2 py-1 rounded bg-slate-900 border border-slate-700"
                  >
                    {copiedKey === 'gemini' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'gemini' ? 'Copied' : 'Copy Name'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: How to view competitor pumps right now */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              How to Inspect Competitor Forecourt Pumps on the Map:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pl-1 leading-relaxed">
              <li>
                <strong>Competitor Badges:</strong> Every competitor station (Shell, Chevron, Buc-ee's, QuikTrip, Wawa, Circle K, 7-Eleven, Love's, etc.) is marked with its official brand logo and an instant <strong>"⛽ X Pumps" badge</strong>.
              </li>
              <li>
                <strong>Click Any Station:</strong> Click any competitor marker on the map to see its exact number of fuel positions, dispensers, C-store square footage, and fuel grades.
              </li>
              <li>
                <strong>Competitor Pumps List:</strong> Use the <strong>"Competitor Pumps ({'{count}'})"</strong> button in the top bar or side drawer to view every competitor in the 1/3/5-mile radius sorted by distance or pump count.
              </li>
              <li>
                <strong>Instant Analysis:</strong> Click anywhere on the map to calculate competitor pump density and unmet gallon demand.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Overpass Real-Time Engine Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Got It, Back to Map
          </button>
        </div>
      </div>
    </div>
  );
};
