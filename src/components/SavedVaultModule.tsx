import React, { useState } from 'react';
import { 
  Database, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Fuel, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  Trash2, 
  Search, 
  ChevronRight, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  BarChart3,
  SlidersHorizontal,
  Compass,
  Zap,
  Building2,
  X,
  Plus
} from 'lucide-react';
import { WhiteSpotCandidate } from '../types';

interface SavedVaultModuleProps {
  candidates: WhiteSpotCandidate[];
  onSelectCandidate: (candidate: WhiteSpotCandidate) => void;
  onNavigateToMap: (candidate?: WhiteSpotCandidate) => void;
  onOpenAIRecommendation: (candidate: WhiteSpotCandidate) => void;
  onDeleteCandidate?: (id: string) => void;
  onClearVault?: () => void;
  onNavigateToCatchment?: (candidate: WhiteSpotCandidate) => void;
  onNavigateToFinancials?: (candidate: WhiteSpotCandidate) => void;
}

export const SavedVaultModule: React.FC<SavedVaultModuleProps> = ({
  candidates,
  onSelectCandidate,
  onNavigateToMap,
  onOpenAIRecommendation,
  onDeleteCandidate,
  onClearVault,
  onNavigateToCatchment,
  onNavigateToFinancials
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'gallons' | 'irr' | 'aadt'>('score');

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    if (selectedState !== 'ALL' && c.state !== selectedState) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (c.candidateName || '').toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q) ||
        (c.state || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q) ||
        (c.zipCode || '').includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'score') return (b.opportunityScore || 0) - (a.opportunityScore || 0);
    if (sortBy === 'gallons') return (b.projectedAnnualFuelGallons || 0) - (a.projectedAnnualFuelGallons || 0);
    if (sortBy === 'irr') return (b.estimatedIrrPct || 0) - (a.estimatedIrrPct || 0);
    if (sortBy === 'aadt') return (b.aadt || 0) - (a.aadt || 0);
    return 0;
  });

  const uniqueStates = Array.from(new Set(candidates.map(c => c.state || 'US'))).filter(Boolean);

  const totalFuelGallons = candidates.reduce((sum, c) => sum + (c.projectedAnnualFuelGallons || 0), 0);
  const totalRevenue = candidates.reduce((sum, c) => sum + (c.projectedAnnualTotalRevenue || 0), 0);
  const totalEbitda = candidates.reduce((sum, c) => sum + (c.projectedAnnualEbitda || 0), 0);
  const avgOpportunityScore = Math.round(candidates.reduce((sum, c) => sum + (c.opportunityScore || 0), 0) / (candidates.length || 1));

  // Toggle comparison selection
  const handleToggleCompare = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(prev => prev.filter(item => item !== id));
    } else {
      if (selectedForComparison.length >= 4) {
        alert('You can compare up to 4 sites simultaneously.');
        return;
      }
      setSelectedForComparison(prev => [...prev, id]);
    }
  };

  const comparisonCandidates = candidates.filter(c => selectedForComparison.includes(c.id));

  // Export JSON
  const handleExportVaultJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(candidates, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'retail_spatial_vault_analysis.json');
    dlAnchorElem.click();
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Database className="w-3.5 h-3.5 text-purple-700" />
              Preserved Trade Area Vault
            </span>
            <span className="text-xs text-purple-600 font-mono font-medium">
              Zero Duplicates • {candidates.length} Scanned Trade Areas
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">
            Saved Voids & 1-Click OSM Map Analyses
          </h1>
          <p className="text-sm text-purple-700 leading-relaxed">
            Every scanned growth corridor and 1-click map trade area is automatically preserved without duplication for comprehensive deep-dive underwritings, pro-formas, and side-by-side site benchmarking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportVaultJSON}
            className="px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-700" />
            <span>Export Complete Vault (JSON)</span>
          </button>

          <button
            onClick={() => onNavigateToMap()}
            className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>Open Interactive Map</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-purple-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-600 font-semibold">
            <span>Stored Trade Areas</span>
            <Database className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl font-black text-purple-950">
            {candidates.length} <span className="text-xs font-semibold text-purple-600">unique sites</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Deduplicated & Persistent</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-purple-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-600 font-semibold">
            <span>Total Projected Volume</span>
            <Fuel className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl font-black text-purple-950">
            {(totalFuelGallons / 1000000).toFixed(1)}M <span className="text-xs font-semibold text-purple-600">gal/yr</span>
          </div>
          <div className="text-[11px] text-purple-600 font-medium">
            Aggregate retail fuel voids
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-purple-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-600 font-semibold">
            <span>Total Pipeline Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-purple-950">
            ${(totalRevenue / 1000000).toFixed(1)}M <span className="text-xs font-semibold text-purple-600">/yr</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">
            Fuel + C-Store Revenue
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-purple-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-600 font-semibold">
            <span>Average Site Score</span>
            <TrendingUp className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl font-black text-purple-950">
            {avgOpportunityScore} <span className="text-xs font-semibold text-purple-600">/ 100</span>
          </div>
          <div className="text-[11px] text-purple-600 font-medium">
            Est. EBITDA: ${(totalEbitda / 1000000).toFixed(1)}M total
          </div>
        </div>
      </div>

      {/* Side-by-Side Deep Dive Site Comparison Matrix */}
      {comparisonCandidates.length > 0 && (
        <div className="bg-white border-2 border-purple-300 rounded-3xl p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <div>
              <h3 className="text-base font-black text-purple-950 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-700" />
                Side-by-Side Multi-Site Underwriting Matrix ({comparisonCandidates.length} Selected)
              </h3>
              <p className="text-xs text-purple-600">
                Direct benchmark of spatial demand, demographic capture, CapEx requirements, and financial IRR:
              </p>
            </div>
            <button
              onClick={() => setSelectedForComparison([])}
              className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Comparison</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-purple-100">
                  <th className="p-3 bg-purple-50/50 text-purple-800 font-bold uppercase text-[10px] w-44">Parameter</th>
                  {comparisonCandidates.map((c) => (
                    <th key={c.id} className="p-3 bg-purple-100/60 font-black text-purple-950 text-xs min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <span className="truncate max-w-[150px]">{c.candidateName}</span>
                        <button
                          onClick={() => handleToggleCompare(c.id)}
                          className="text-purple-400 hover:text-purple-800 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-[10px] font-normal text-purple-600">{c.city}, {c.state}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 text-purple-900">
                <tr>
                  <td className="p-3 font-bold bg-purple-50/30 text-purple-950">Opportunity Score</td>
                  {comparisonCandidates.map((c) => (
                    <td key={c.id} className="p-3 font-black text-base text-purple-700">
                      {c.opportunityScore} / 100
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-purple-50/30 text-purple-950">Risk Rating</td>
                  {comparisonCandidates.map((c) => (
                    <td key={c.id} className="p-3 font-bold">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                        c.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.riskLevel} Risk
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-purple-50/30 text-purple-950">Arterial AADT Traffic</td>
                  {comparisonCandidates.map((c) => (
                    <td key={c.id} className="p-3 font-semibold text-purple-950">
                      {(c.aadt || 0).toLocaleString()} vehicles/day
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-purple-50/30 text-purple-950">Nearest Fuel Competitor</td>
                  {comparisonCandidates.map((c) => (
                    <td key={c.id} className="p-3 font-bold text-emerald-700">
                      {c.nearestStationMiles} miles away
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-purple-50/30 text-purple-950">3-Mile Catchment Population</td>
                  {comparisonCandidates.map((c) => (
                    <td key={c.id} className="p-3 font-medium">
                      {(c.pop3Mile || 0).toLocaleString()} residents
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-purple-50/30 text-purple-950">3-Mile Median Household Income</td>
                  {comparisonCandidates.map((c) => (
                    <td key={c.id} className="p-3 font-semibold text-purple-950">
                      ${(c.medianIncome3Mile || 0).toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-purple-50/30 text-purple-950">Projected Annual Fuel Volume</td>
                  {comparisonCandidates.map((c) => (
                    <td key={c.id} className="p-3 font-bold text-emerald-700">
                      {((c.projectedAnnualFuelGallons || 0) / 1000000).toFixed(2)}M gal/yr
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-purple-50/30 text-purple-950">Estimated CapEx</td>
                  {comparisonCandidates.map((c) => (
                    <td key={c.id} className="p-3 font-semibold">
                      ${((c.estimatedCapEx || 0) / 1000000).toFixed(2)}M
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-purple-50/30 text-purple-950">10-Year Unlevered IRR</td>
                  {comparisonCandidates.map((c) => (
                    <td key={c.id} className="p-3 font-black text-emerald-600 text-sm">
                      {c.estimatedIrrPct}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-purple-50/30 text-purple-950">Estimated Payback Period</td>
                  {comparisonCandidates.map((c) => (
                    <td key={c.id} className="p-3 font-semibold text-purple-950">
                      {c.estimatedPaybackYears} years
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-purple-50/30 text-purple-950">Quick Deep Dive</td>
                  {comparisonCandidates.map((c) => (
                    <td key={c.id} className="p-3">
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => {
                            onSelectCandidate(c);
                            onNavigateToMap(c);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>View on Map</span>
                        </button>
                        <button
                          onClick={() => onOpenAIRecommendation(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-purple-700" />
                          <span>AI Memo</span>
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-purple-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search saved sites by corridor, address, zip..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-purple-50 text-xs text-purple-950 border border-purple-200 rounded-xl focus:outline-none focus:border-purple-600 font-medium placeholder:text-purple-400"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-purple-600 text-[11px] font-bold mr-1">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-purple-50 text-xs text-purple-950 font-bold border border-purple-200 focus:outline-none focus:border-purple-600 cursor-pointer"
            >
              <option value="ALL">All States ({candidates.length})</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-purple-600 text-[11px] font-bold mr-1">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1.5 px-3 rounded-xl bg-purple-50 text-xs text-purple-950 font-bold border border-purple-200 focus:outline-none focus:border-purple-600 cursor-pointer"
            >
              <option value="score">Highest Opportunity Score</option>
              <option value="gallons">Annual Fuel Gallons</option>
              <option value="irr">Unlevered IRR %</option>
              <option value="aadt">Corridor Traffic (AADT)</option>
            </select>
          </div>
        </div>

        {selectedForComparison.length === 0 && candidates.length > 1 && (
          <div className="text-xs text-purple-600 font-medium flex items-center gap-1">
            <span>Tip: Check the compare box next to any site to benchmark up to 4 sites</span>
          </div>
        )}
      </div>

      {/* Main Preserved Sites List */}
      <div className="space-y-3">
        {filteredCandidates.length === 0 ? (
          <div className="bg-white border border-purple-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <Database className="w-12 h-12 text-purple-400 mx-auto" />
            <h3 className="text-lg font-black text-purple-950">No saved trade area analyses found</h3>
            <p className="text-xs text-purple-600 max-w-md mx-auto">
              Scan a high-growth US corridor or click any point on the live interactive map to automatically capture and store trade area voids.
            </p>
            <button
              onClick={() => onNavigateToMap()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Go to Map
            </button>
          </div>
        ) : (
          filteredCandidates.map((cand, idx) => {
            const isCompared = selectedForComparison.includes(cand.id);
            return (
              <div
                key={cand.id}
                className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 ${
                  isCompared ? 'border-purple-600 ring-2 ring-purple-600 bg-purple-50/20' : 'border-purple-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="flex items-start gap-3">
                    <label className="flex items-center gap-2 mt-1 cursor-pointer" title="Select to compare side-by-side">
                      <input
                        type="checkbox"
                        checked={isCompared}
                        onChange={() => handleToggleCompare(cand.id)}
                        className="rounded accent-purple-600 w-4 h-4 cursor-pointer"
                      />
                    </label>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-900 border border-purple-200 flex items-center justify-center text-xs font-black">
                          #{idx + 1}
                        </span>
                        <h3 className="text-base font-black text-purple-950">
                          {cand.candidateName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black">
                          {cand.state}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cand.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cand.riskLevel} Risk
                        </span>
                        <span className="text-[11px] font-mono text-purple-500 font-semibold">
                          [{cand.lat.toFixed(4)}, {cand.lng.toFixed(4)}]
                        </span>
                      </div>

                      <p className="text-xs text-purple-700 flex items-center gap-3">
                        <span className="font-medium">{cand.address || `${cand.city}, ${cand.state}`}</span>
                        <span>•</span>
                        <span>{(cand.aadt || 0).toLocaleString()} AADT</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">{cand.nearestStationMiles} mi to nearest station</span>
                        <span>•</span>
                        <span>3M Pop: {(cand.pop3Mile || 0).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Metrics & Quick Actions */}
                  <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pr-2 border-r border-purple-100">
                      <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
                        <div className="text-[10px] text-purple-600 font-semibold">Score</div>
                        <div className="text-base font-black text-purple-950">{cand.opportunityScore}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
                        <div className="text-[10px] text-purple-600 font-semibold">Volume</div>
                        <div className="text-base font-bold text-emerald-700">
                          {((cand.projectedAnnualFuelGallons || 0) / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
                        <div className="text-[10px] text-purple-600 font-semibold">IRR</div>
                        <div className="text-base font-black text-purple-900">{cand.estimatedIrrPct}%</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSelectCandidate(cand);
                          onNavigateToMap(cand);
                        }}
                        className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                        title="View catchment rings, competitor forecourts, and live map"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Map View</span>
                      </button>

                      <button
                        onClick={() => onOpenAIRecommendation(cand)}
                        className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1.5 border border-purple-200 transition-all cursor-pointer"
                        title="Generate AI investment underwriting memorandum"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                        <span>AI Memo</span>
                      </button>

                      {onDeleteCandidate && (
                        <button
                          onClick={() => onDeleteCandidate(cand.id)}
                          className="p-2 rounded-xl text-purple-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove from vault"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Rationale Highlights */}
                {cand.primaryRationale && cand.primaryRationale.length > 0 && (
                  <div className="pt-2 border-t border-purple-100/70 text-xs text-purple-700 flex flex-wrap gap-x-4 gap-y-1">
                    {cand.primaryRationale.slice(0, 2).map((r, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                        <span>{r}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
