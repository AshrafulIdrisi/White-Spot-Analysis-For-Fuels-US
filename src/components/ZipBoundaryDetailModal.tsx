import React from 'react';
import { 
  X, 
  Target, 
  MapPin, 
  TrendingUp, 
  Fuel, 
  Store, 
  DollarSign, 
  Users, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Maximize2,
  Navigation,
  ArrowRight
} from 'lucide-react';
import { ZipBoundaryProperties } from '../types';

interface ZipBoundaryDetailModalProps {
  properties: ZipBoundaryProperties | null;
  isOpen: boolean;
  onClose: () => void;
  onSetCatchmentCenter: (lat: number, lng: number, label: string) => void;
  onEvaluateSite: (lat: number, lng: number, address: string) => void;
  onRunAiAnalysis: (zipProps: ZipBoundaryProperties) => void;
  onFitBounds?: () => void;
}

export const ZipBoundaryDetailModal: React.FC<ZipBoundaryDetailModalProps> = ({
  properties,
  isOpen,
  onClose,
  onSetCatchmentCenter,
  onEvaluateSite,
  onRunAiAnalysis,
  onFitBounds
}) => {
  if (!isOpen || !properties) return null;

  const zip = properties.ZCTA5CE10;
  const state = properties.stateCode || properties.state || 'US';
  const city = properties.city || `Zone ${zip}`;
  const score = properties.opportunityScore ?? 84;
  const pop = properties.population ?? 42000;
  const income = properties.medianIncome ?? 86500;
  const unmetGal = properties.unmetFuelGallons ?? 2850000;
  const unmetCStore = properties.unmetCStoreDemandUsd ?? 2400000;
  const comps = properties.existingCompetitorStations ?? 2;
  const pumps = properties.forecourtPumpsCount ?? 14;
  const areaSqMi = properties.landAreaSqMiles ?? 12.4;
  const aadt = properties.corridorAadt ?? 48000;
  const evPorts = properties.evDeficitPorts ?? 6;

  const lat = properties.INTPTLAT10 ? parseFloat(properties.INTPTLAT10) : 0;
  const lng = properties.INTPTLON10 ? parseFloat(properties.INTPTLON10) : 0;

  const isTier1 = score >= 88;
  const isTier2 = score >= 75 && score < 88;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl border border-purple-200 shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900 via-purple-950 to-indigo-950 text-white relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[11px] font-bold uppercase tracking-wider">
                  US ZIP Code Boundary
                </span>
                <span className="text-[11px] text-purple-300 font-mono">
                  ZCTA5: {zip} • FIPS: {properties.STATEFP10 || state}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>ZIP {zip}</span>
                <span className="text-purple-300 font-semibold text-base">({city}, {state})</span>
              </h3>
              <p className="text-xs text-purple-200/80 mt-1 flex items-center gap-3">
                <span>📍 Centroid: {lat ? lat.toFixed(4) : 'N/A'}, {lng ? lng.toFixed(4) : 'N/A'}</span>
                <span>📐 Area: {areaSqMi} sq mi</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Score Ribbon */}
          <div className="mt-3 pt-3 border-t border-purple-800/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${
                isTier1 ? 'bg-emerald-500 text-slate-950' : isTier2 ? 'bg-amber-400 text-slate-950' : 'bg-rose-400 text-slate-950'
              }`}>
                {isTier1 ? '🎯 Tier 1 Top White Spot' : isTier2 ? '⚡ Tier 2 Expansion Target' : '⚠️ Saturated Forecourt'}
              </span>
              <span className="text-xs font-bold text-purple-200">
                Opportunity Score: <strong className="text-white text-sm font-black">{score}/100</strong>
              </span>
            </div>

            <span className="text-[10px] text-purple-300/80 italic hidden sm:inline">
              Data: OpenDataDE / US Census 2024
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800 custom-scrollbar">
          {/* Key Metrics 4-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-purple-600 mb-1">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900">Population</span>
              </div>
              <div className="text-base font-black text-purple-950">
                {pop.toLocaleString()}
              </div>
              <div className="text-[10px] text-purple-700/80">
                ~{Math.round(pop / Math.max(1, areaSqMi)).toLocaleString()} / sq mi
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900">Median Income</span>
              </div>
              <div className="text-base font-black text-purple-950">
                ${income.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold">
                {income >= 90000 ? '+32% vs US Avg' : income >= 75000 ? '+12% vs US Avg' : 'Near National Avg'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                <Fuel className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900">Unmet Fuel Vol</span>
              </div>
              <div className="text-base font-black text-purple-950">
                {(unmetGal / 1000000).toFixed(2)}M <span className="text-xs font-medium">gal/yr</span>
              </div>
              <div className="text-[10px] text-amber-700 font-semibold">
                {(unmetGal / 12 / 1000).toFixed(0)}k gal/mo gap
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
                <Store className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900">Competitors</span>
              </div>
              <div className="text-base font-black text-purple-950">
                {comps} Stations
              </div>
              <div className="text-[10px] text-indigo-700 font-semibold">
                {pumps} existing pumps
              </div>
            </div>
          </div>

          {/* Trade Area Assessment */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              Underwriting Trade Area Verdict
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {properties.zoneRationale || 
                `High-priority residential & commuter artery void in ZIP ${zip}. Corridor traffic experiences ${aadt.toLocaleString()} AADT with a current forecourt supply shortfall of ${(unmetGal / 1000000).toFixed(2)}M gallons annually. Ideal for a high-capacity modern travel forecourt.`
              }
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-semibold">
                Recommended: {properties.recommendedStoreFormat || '14-MPD Modern Forecourt + 5,200 sq ft C-Store'}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-800 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-600" />
                EV Deficit: {evPorts} Ultra-Fast Stalls
              </span>
            </div>
          </div>

          {/* Geospatial Coordinate & Boundary Specs */}
          <div className="text-xs space-y-1.5 p-3 rounded-2xl bg-purple-50/40 border border-purple-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Boundary Source:</span>
              <strong className="text-purple-950">OpenDataDE / State-zip-code-GeoJSON</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">U.S. Census ZCTA5 Code:</span>
              <strong className="font-mono text-purple-950">{zip}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Internal Centroid Point:</span>
              <span className="font-mono text-purple-900 font-semibold">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-3 sm:p-4 bg-purple-50/80 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2">
          {onFitBounds && (
            <button
              onClick={onFitBounds}
              className="px-3 py-2 rounded-xl bg-white hover:bg-purple-100/60 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Zoom to exact polygon boundaries"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Zoom Boundary</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {lat !== 0 && lng !== 0 && (
              <button
                onClick={() => {
                  onSetCatchmentCenter(lat, lng, `ZIP ${zip} Centroid (${city}, ${state})`);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-white hover:bg-purple-100/60 text-purple-900 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5 text-purple-600" />
                <span>3M Catchment</span>
              </button>
            )}

            <button
              onClick={() => {
                onEvaluateSite(lat, lng, `${city}, ${state} ${zip} (ZIP Boundary Centroid)`);
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-500/20"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Evaluate Site</span>
            </button>

            <button
              onClick={() => {
                onRunAiAnalysis(properties);
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-700 hover:from-purple-900 hover:to-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Diligence</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
