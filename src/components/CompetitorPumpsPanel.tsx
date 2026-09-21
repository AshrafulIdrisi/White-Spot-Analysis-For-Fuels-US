import React, { useState } from 'react';
import { 
  X, 
  Fuel, 
  Navigation, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpRight, 
  Store, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2,
  MapPin,
  Flame,
  Award
} from 'lucide-react';
import { OsmPoiRecord } from '../types';
import { getCompetitorBrandStyle } from '../utils/brandStyling';

interface CompetitorPumpsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  competitors: OsmPoiRecord[];
  onFlyToCompetitor: (comp: OsmPoiRecord) => void;
  onAnalyzeCompetitor: (comp: OsmPoiRecord) => void;
  activeCenterLabel?: string;
  selectedRadiusMiles: 1 | 3 | 5;
}

export const CompetitorPumpsPanel: React.FC<CompetitorPumpsPanelProps> = ({
  isOpen,
  onClose,
  competitors,
  onFlyToCompetitor,
  onAnalyzeCompetitor,
  activeCenterLabel = 'Active Trade Area',
  selectedRadiusMiles
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'distance' | 'pumps' | 'cstore'>('distance');

  if (!isOpen) return null;

  // Filter and sort competitors
  const filtered = competitors.filter(comp => {
    const brand = (comp.brand || comp.name || '').toLowerCase();
    const name = (comp.name || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    if (query && !brand.includes(query) && !name.includes(query)) return false;
    if (selectedBrandFilter !== 'ALL') {
      if (!brand.toLowerCase().includes(selectedBrandFilter.toLowerCase())) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'pumps') {
      return (b.pumpsCount || 8) - (a.pumpsCount || 8);
    }
    if (sortBy === 'cstore') {
      return (b.cStoreSqFt || 3500) - (a.cStoreSqFt || 3500);
    }
    return (a.distanceMiles || 0) - (b.distanceMiles || 0);
  });

  const totalPumps = competitors.reduce((sum, c) => sum + (c.pumpsCount || 8), 0);
  const avgPumps = Math.round(totalPumps / (competitors.length || 1));

  // Extract unique brands for quick filter chips
  const uniqueBrands = Array.from(new Set(
    competitors.map(c => {
      const style = getCompetitorBrandStyle(c.brand, c.name);
      return style.name;
    })
  )).slice(0, 8);

  return (
    <div className="absolute top-14 sm:top-16 inset-x-2 sm:inset-x-auto sm:right-4 z-30 w-auto sm:w-96 max-h-[calc(100vh-140px)] bg-white/95 backdrop-blur-md rounded-2xl border border-purple-200 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="p-4 border-b border-purple-100 bg-purple-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
            <Fuel className="w-4 h-4 text-purple-700" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
              Competitor Forecourt Pumps
            </h3>
            <p className="text-[11px] text-purple-900/60 truncate max-w-[200px]">
              {activeCenterLabel} • {selectedRadiusMiles}M
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-lg text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Aggregate Stats Summary */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-purple-50/40 border-b border-purple-100 text-center text-xs">
        <div className="p-1.5 rounded-lg bg-white border border-purple-100 shadow-xs">
          <span className="text-[10px] text-slate-500 block">Stations</span>
          <span className="text-sm font-bold text-purple-950">{competitors.length}</span>
        </div>
        <div className="p-1.5 rounded-lg bg-white border border-purple-100 shadow-xs">
          <span className="text-[10px] text-slate-500 block">Total Pumps</span>
          <span className="text-sm font-bold text-purple-700">{totalPumps}</span>
        </div>
        <div className="p-1.5 rounded-lg bg-white border border-purple-100 shadow-xs">
          <span className="text-[10px] text-slate-500 block">Avg Forecourt</span>
          <span className="text-sm font-bold text-indigo-700">{avgPumps} MPDs</span>
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="p-3 border-b border-purple-100 space-y-2.5 bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search competitor brand, street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-purple-50/50 text-xs text-slate-800 placeholder-purple-900/40 pl-8 pr-3 py-1.5 rounded-lg border border-purple-200 focus:outline-none focus:border-purple-600 focus:bg-white"
          />
        </div>

        {/* Brand Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] custom-scrollbar">
          <button
            onClick={() => setSelectedBrandFilter('ALL')}
            className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors ${
              selectedBrandFilter === 'ALL'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            All Brands ({competitors.length})
          </button>
          {uniqueBrands.map((brandName) => (
            <button
              key={brandName}
              onClick={() => setSelectedBrandFilter(brandName)}
              className={`px-2 py-0.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
                selectedBrandFilter === brandName
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              {brandName}
            </button>
          ))}
        </div>

        {/* Sort Radio */}
        <div className="flex items-center justify-between text-[11px] text-purple-900/70 font-medium">
          <span>Sort By:</span>
          <div className="flex items-center gap-1 bg-purple-50 p-0.5 rounded-md border border-purple-200">
            <button
              onClick={() => setSortBy('distance')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                sortBy === 'distance' ? 'bg-purple-600 text-white' : 'text-purple-800 hover:text-purple-950'
              }`}
            >
              Distance
            </button>
            <button
              onClick={() => setSortBy('pumps')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                sortBy === 'pumps' ? 'bg-purple-600 text-white' : 'text-purple-800 hover:text-purple-950'
              }`}
            >
              Pumps
            </button>
            <button
              onClick={() => setSortBy('cstore')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                sortBy === 'cstore' ? 'bg-purple-600 text-white' : 'text-purple-800 hover:text-purple-950'
              }`}
            >
              C-Store
            </button>
          </div>
        </div>
      </div>

      {/* Competitor List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar text-xs bg-purple-50/20">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-400 space-y-1">
            <Fuel className="w-8 h-8 text-purple-300 mx-auto" />
            <p className="font-semibold text-xs text-purple-900">No competitor stations found</p>
            <p className="text-[10px] text-slate-500">Try expanding your radius to 3M or 5M or resetting filters.</p>
          </div>
        ) : (
          filtered.map((comp) => {
            const brandStyle = getCompetitorBrandStyle(comp.brand, comp.name);
            const isMegaCenter = (comp.pumpsCount || 8) >= 24;

            return (
              <div
                key={comp.id}
                className={`p-3 rounded-xl border transition-all space-y-2 bg-white hover:bg-purple-50/40 border-purple-100 hover:border-purple-300 shadow-sm group`}
              >
                {/* Brand & Pumps Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${brandStyle.badgeBg} border ${brandStyle.borderColor} flex items-center justify-center text-xs shadow-xs shrink-0`}>
                      {brandStyle.icon}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="truncate max-w-[140px]">{comp.name}</span>
                        {isMegaCenter && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-300 text-[9px] font-black uppercase">
                            Mega Plaza
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {comp.brand || brandStyle.name} • {comp.distanceMiles !== undefined ? `${comp.distanceMiles.toFixed(2)} mi away` : 'Corridor Site'}
                      </div>
                    </div>
                  </div>

                  {/* Highlighted Pump Count Badge */}
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-lg bg-purple-100 border border-purple-300 text-purple-800 text-[11px] font-black inline-flex items-center gap-1 shadow-2xs">
                      <Fuel className="w-3 h-3 text-purple-600" />
                      {comp.pumpsCount || 8} Pumps
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5 font-medium">
                      {comp.mpdCount || Math.round((comp.pumpsCount || 8) / 2)} MPD Dispenser{(comp.mpdCount || Math.round((comp.pumpsCount || 8) / 2)) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Estimation Rationale & Confidence Tag */}
                {comp.pumpsEstimationRationale && (
                  <div className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-[9.5px] text-slate-600 flex items-start justify-between gap-2">
                    <span className="line-clamp-1">{comp.pumpsEstimationRationale}</span>
                    <span className={`shrink-0 px-1 py-0.2 text-[8.5px] font-semibold rounded ${
                      comp.forecourtConfidence === 'EXPLICIT_TAG' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : comp.forecourtConfidence === 'HIGH_CONFIDENCE'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {comp.forecourtConfidenceLabel || 'Model Est.'}
                    </span>
                  </div>
                )}

                {/* Amenities & Fuel Grades */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 pt-1 border-t border-purple-100">
                  <div className="flex items-center gap-1">
                    <Store className="w-3 h-3 text-emerald-600" />
                    <span>C-Store: <strong className="text-slate-800">{(comp.cStoreSqFt || 3800).toLocaleString()} sq ft</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-500" />
                    <span>Diesel & 93: <strong className="text-emerald-700">Available</strong></span>
                  </div>
                </div>

                {comp.address && (
                  <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0 text-purple-400" />
                    <span>{comp.address}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onFlyToCompetitor(comp)}
                    className="flex-1 py-1 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-[10px] font-bold text-purple-800 border border-purple-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3 h-3 text-purple-600" />
                    <span>Locate on Map</span>
                  </button>
                  <button
                    onClick={() => onAnalyzeCompetitor(comp)}
                    className="flex-1 py-1 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-[10px] font-bold text-white border border-purple-600 flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    <span>Analyze Radius</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-purple-50/80 border-t border-purple-100 text-[10px] text-purple-900/70 flex items-center justify-between">
        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          OpenStreetMap Real-Time
        </span>
        <span>Click any station for details</span>
      </div>
    </div>
  );
};
