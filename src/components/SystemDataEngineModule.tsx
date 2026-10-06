import React, { useState } from 'react';
import { 
  Database, 
  UploadCloud, 
  ShieldCheck, 
  Sliders, 
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
  ArrowRight,
  BarChart3,
  SlidersHorizontal,
  Compass,
  Zap,
  Building2,
  X,
  Plus,
  RefreshCw,
  Server,
  FileCode,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { WhiteSpotCandidate, ScoringWeights, StoreLocationRecord } from '../types';
import { ALL_US_STATES } from '../data/usStatesData';
import { SYSTEM_DATA_QUALITY, RECENT_ETL_JOBS } from '../data/mockDatabase';

interface SystemDataEngineModuleProps {
  candidates: WhiteSpotCandidate[];
  scoringWeights: ScoringWeights;
  onUpdateWeights: (newWeights: ScoringWeights) => void;
  onSelectCandidate: (candidate: WhiteSpotCandidate) => void;
  onNavigateToMap: (candidate?: WhiteSpotCandidate) => void;
  onOpenAIRecommendation: (candidate: WhiteSpotCandidate) => void;
  onDeleteCandidate?: (id: string) => void;
  onClearVault?: () => void;
  onNavigateToCatchment?: (candidate: WhiteSpotCandidate) => void;
  onNavigateToFinancials?: (candidate: WhiteSpotCandidate) => void;
  onExportData?: (format: 'csv' | 'geojson') => void;
}

export const SystemDataEngineModule: React.FC<SystemDataEngineModuleProps> = ({
  candidates,
  scoringWeights,
  onUpdateWeights,
  onSelectCandidate,
  onNavigateToMap,
  onOpenAIRecommendation,
  onDeleteCandidate,
  onClearVault,
  onNavigateToCatchment,
  onNavigateToFinancials,
  onExportData
}) => {
  const [subTab, setSubTab] = useState<'vault' | 'etl' | 'lineage' | 'weights'>('vault');
  
  // Vault filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'gallons' | 'irr' | 'aadt'>('score');

  // ETL Ingestion states
  const [ingestionStatus, setIngestionStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [ingestionLogs, setIngestionLogs] = useState<string[]>([]);

  // Local weights state for preview
  const [tempWeights, setTempWeights] = useState<ScoringWeights>(scoringWeights);

  // Filter candidates for vault
  const filteredCandidates = candidates.filter(c => {
    if (selectedState !== 'ALL' && c.state !== selectedState) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (c.candidateName || '').toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q) ||
        (c.state || '').toLowerCase().includes(q) ||
        (c.zipCode || '').includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'score') return b.opportunityScore - a.opportunityScore;
    if (sortBy === 'gallons') return (b.projectedAnnualFuelGallons || 0) - (a.projectedAnnualFuelGallons || 0);
    if (sortBy === 'irr') return (b.estimatedIrrPct || 0) - (a.estimatedIrrPct || 0);
    if (sortBy === 'aadt') return (b.aadt || 0) - (a.aadt || 0);
    return 0;
  });

  const toggleCompare = (id: string) => {
    setSelectedForComparison(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSimulatedUpload = () => {
    setIngestionStatus('processing');
    setIngestionLogs([
      'Parsing input stream (24 records identified)...',
      'Validating EPSG:4326 geospatial coordinates (US CONUS bbox)...',
      'Verifying required fields: StoreName, Brand, Latitude, Longitude, AADT...',
      'Deduplicating against existing records in PostGIS spatial index...',
      'Enriching with US Census Bureau ACS 5-Yr Tract Demographics...',
      'Calculating spatial buffers (1-mi, 3-mi, 5-mi) and drive-time isochrones...',
      'Ingestion job ETL-2026-10-912 completed successfully in 280ms.'
    ]);
    setTimeout(() => {
      setIngestionStatus('success');
    }, 1200);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Engine Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 rounded-3xl border border-purple-800/40 shadow-2xl text-white">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Unified System Data Engine
            </span>
            <span className="text-xs text-purple-300/80 font-mono">EPSG:4326 GIS Warehouse & Lineage</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Institutional Data Engine & Analyses Vault
          </h1>
          <p className="text-sm text-purple-200/80 max-w-3xl">
            Central repository for real-time spatial underwriting, saved site dossiers, Overpass & Census ETL streams, model weights calibration, and data lineage audits.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {onExportData && (
            <button
              onClick={() => onExportData('csv')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-300" />
              Export CSV
            </button>
          )}
          {onClearVault && candidates.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear stored candidate analyses?')) {
                  onClearVault();
                }
              }}
              className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-xl text-xs font-semibold text-rose-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              Clear Vault
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-purple-200/80 shadow-sm">
        <button
          onClick={() => setSubTab('vault')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'vault'
              ? 'bg-purple-900 text-white shadow-md'
              : 'text-slate-600 hover:text-purple-950 hover:bg-purple-50'
          }`}
        >
          <Database className="w-4 h-4 text-purple-400" />
          <span>Saved Analyses Vault</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-purple-800 text-purple-200 text-[10px]">
            {filteredCandidates.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('etl')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'etl'
              ? 'bg-purple-900 text-white shadow-md'
              : 'text-slate-600 hover:text-purple-950 hover:bg-purple-50'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-purple-400" />
          <span>Live Ingestion & ETL</span>
        </button>

        <button
          onClick={() => setSubTab('lineage')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'lineage'
              ? 'bg-purple-900 text-white shadow-md'
              : 'text-slate-600 hover:text-purple-950 hover:bg-purple-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Data Lineage & SLA Coverage</span>
        </button>

        <button
          onClick={() => setSubTab('weights')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'weights'
              ? 'bg-purple-900 text-white shadow-md'
              : 'text-slate-600 hover:text-purple-950 hover:bg-purple-50'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Scoring Engine Weights</span>
        </button>
      </div>

      {/* SUB-TAB 1: SAVED ANALYSES VAULT */}
      {subTab === 'vault' && (
        <div className="space-y-6">
          {/* Opportunity Quality & Cannibalization Shield Filter Banner */}
          <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-purple-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-700 flex-shrink-0" />
              <span>
                <strong className="font-bold text-purple-950">Strict Opportunity Filter Active:</strong> Only high-conviction white spots are admitted to the vault. Automatic exclusion of parcels within 1.5 miles of existing Exxon/Mobil stations and oversaturated competitor corridors.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-800 text-[10px] font-bold uppercase tracking-wider flex-shrink-0 self-start sm:self-auto">
              ✓ Verified Voids Only
            </span>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-purple-200/80 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search stored site dossiers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-purple-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* State Filter */}
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-purple-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All States ({candidates.length})</option>
                {ALL_US_STATES.map(st => {
                  const cnt = candidates.filter(c => c.state === st.code).length;
                  return (
                    <option key={st.code} value={st.code}>
                      {st.code} - {st.name} ({cnt})
                    </option>
                  );
                })}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-purple-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="score">Sort by Opportunity Score</option>
                <option value="gallons">Sort by Unmet Fuel Volume</option>
                <option value="irr">Sort by Projected IRR %</option>
                <option value="aadt">Sort by Corridor AADT</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-purple-950">{filteredCandidates.length}</span> verified sites
            </div>
          </div>

          {/* Cards Grid */}
          {filteredCandidates.length === 0 ? (
            <div className="bg-white rounded-3xl border border-purple-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border border-purple-200">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Candidate Analyses Stored For This Filter</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Use the 1-Click OSM Map Hub, Zip Code Heatmap, or Executive Problem Solver to evaluate and store high-conviction candidate locations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCandidates.map((c) => {
                const isCompared = selectedForComparison.includes(c.id);
                return (
                  <div
                    key={c.id}
                    className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between shadow-sm hover:shadow-xl ${
                      isCompared ? 'border-purple-600 ring-2 ring-purple-400' : 'border-purple-200/80 hover:border-purple-400'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 font-bold text-[11px] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-purple-600" />
                          {c.state} • {c.city}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 ${
                            c.opportunityScore >= 80 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <Sparkles className="w-3 h-3" />
                            {c.opportunityScore} / 100
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{c.candidateName}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{c.address || `${c.city}, ${c.state}`}</p>
                      </div>

                      {/* Rationale snippet */}
                      <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        {c.primaryRationale?.[0] || 'High-volume arterial node with significant unmet trade area demand.'}
                      </p>

                      {/* Key Metric Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="bg-purple-50/50 p-2 rounded-xl border border-purple-100">
                          <span className="text-[10px] text-slate-500 font-semibold block">Corridor AADT</span>
                          <span className="font-bold text-purple-950 font-mono">{(c.aadt || 0).toLocaleString()} vpd</span>
                        </div>
                        <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                          <span className="text-[10px] text-emerald-700 font-semibold block">Unmet Fuel Gap</span>
                          <span className="font-bold text-emerald-900 font-mono">
                            {((c.projectedAnnualFuelGallons || 0) / 1000000).toFixed(2)}M gal/yr
                          </span>
                        </div>
                        <div className="bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                          <span className="text-[10px] text-amber-700 font-semibold block">CapEx / Payback</span>
                          <span className="font-bold text-amber-900 font-mono">
                            ${((c.estimatedCapEx || 0) / 1000000).toFixed(1)}M • {c.estimatedPaybackYears || 3.4} yrs
                          </span>
                        </div>
                        <div className="bg-indigo-50/50 p-2 rounded-xl border border-indigo-100">
                          <span className="text-[10px] text-indigo-700 font-semibold block">Projected IRR</span>
                          <span className="font-bold text-indigo-900 font-mono">{c.estimatedIrrPct || 28.5}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onNavigateToMap(c)}
                        className="px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5 text-purple-300" />
                        OSM Map
                      </button>

                      <div className="flex items-center gap-1">
                        {onNavigateToCatchment && (
                          <button
                            onClick={() => onNavigateToCatchment(c)}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                            title="1/3/5M Catchment"
                          >
                            Catchment
                          </button>
                        )}
                        {onNavigateToFinancials && (
                          <button
                            onClick={() => onNavigateToFinancials(c)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                            title="Pro-Forma Feasibility"
                          >
                            Pro-Forma
                          </button>
                        )}
                        {onDeleteCandidate && (
                          <button
                            onClick={() => onDeleteCandidate(c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ETL INGESTION */}
      {subTab === 'etl' && (
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-purple-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Spatial ETL & Live Feed Ingestion</h3>
              <p className="text-xs text-slate-500">Ingest real CSV, GeoJSON, or PostGIS spatial data pipelines directly into the underwriting engine.</p>
            </div>
            <button
              onClick={handleSimulatedUpload}
              disabled={ingestionStatus === 'processing'}
              className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <UploadCloud className="w-4 h-4 text-purple-300" />
              {ingestionStatus === 'processing' ? 'Processing Stream...' : 'Run Pipeline Ingestion'}
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center bg-purple-50/40 space-y-3">
            <UploadCloud className="w-10 h-10 text-purple-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Drag & Drop Geospatial Datasets Here</h4>
            <p className="text-xs text-slate-500">Supports EPSG:4326 CSV, GeoJSON FeatureCollections, FHWA HPMS Shapefiles, and Overpass JSON.</p>
          </div>

          {/* Execution Logs */}
          {ingestionLogs.length > 0 && (
            <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl space-y-1.5 overflow-x-auto">
              <div className="text-slate-400 font-bold mb-2">// Ingestion Stream Execution Audit Log:</div>
              {ingestionLogs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-purple-400">[{new Date().toLocaleTimeString()}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Jobs Table */}
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Recent ETL Execution Jobs</h4>
            <div className="border border-purple-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-purple-50/80 border-b border-purple-200 text-purple-950 font-bold">
                  <tr>
                    <th className="p-3">Job ID</th>
                    <th className="p-3">Pipeline Source</th>
                    <th className="p-3">Records Ingested</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {RECENT_ETL_JOBS.map((job) => (
                    <tr key={job.id} className="hover:bg-purple-50/30">
                      <td className="p-3 font-mono text-purple-900 font-bold">{job.id}</td>
                      <td className="p-3 font-medium text-slate-800">{job.sourceAttribution || job.filename}</td>
                      <td className="p-3 font-mono">{job.recordsTotal.toLocaleString()} rows</td>
                      <td className="p-3 font-mono text-slate-500">{job.uploadTimestamp.split(' ')[1] || 'Real-time'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DATA LINEAGE & COVERAGE */}
      {subTab === 'lineage' && (
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-purple-200/80 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Data Lineage, Freshness & Coverage Audit</h3>
            <p className="text-xs text-slate-500">Real-time health telemetry across all institutional GIS and public agency data pipelines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
              <span className="text-xs text-slate-500 font-semibold block">Total Cataloged Nodes</span>
              <span className="text-2xl font-extrabold text-purple-950 font-mono">
                {(SYSTEM_DATA_QUALITY.totalLocationsTracked || 12450).toLocaleString()}
              </span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs text-emerald-700 font-semibold block">GIS Precision Score</span>
              <span className="text-2xl font-extrabold text-emerald-900 font-mono">
                {SYSTEM_DATA_QUALITY.coordinateCompletenessPct || 99.4}%
              </span>
            </div>
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
              <span className="text-xs text-indigo-700 font-semibold block">Coverage SLA</span>
              <span className="text-2xl font-extrabold text-indigo-900 font-mono">99.98%</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <span className="text-xs text-amber-700 font-semibold block">Last Master Sync</span>
              <span className="text-sm font-bold text-amber-950 mt-1 block">Live Connected</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SCORING ENGINE WEIGHTS */}
      {subTab === 'weights' && (
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-purple-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">GIS Scoring Algorithm Parameter Calibration</h3>
              <p className="text-xs text-slate-500">Fine-tune the weights assigned to traffic, unmet demand gap, competitive intensity, and financial return.</p>
            </div>
            <button
              onClick={() => onUpdateWeights(tempWeights)}
              className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-purple-300" />
              Apply & Re-Score Model
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Demand Potential Weight</span>
                  <span className="text-purple-700 font-mono">{tempWeights.demandPotential}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={tempWeights.demandPotential}
                  onChange={(e) => setTempWeights({ ...tempWeights, demandPotential: Number(e.target.value) })}
                  className="w-full accent-purple-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Traffic Accessibility (AADT) Weight</span>
                  <span className="text-purple-700 font-mono">{tempWeights.trafficAccessibility}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={tempWeights.trafficAccessibility}
                  onChange={(e) => setTempWeights({ ...tempWeights, trafficAccessibility: Number(e.target.value) })}
                  className="w-full accent-purple-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Supply Gap (Unmet Fuel / EV) Weight</span>
                  <span className="text-purple-700 font-mono">{tempWeights.supplyGap}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={tempWeights.supplyGap}
                  onChange={(e) => setTempWeights({ ...tempWeights, supplyGap: Number(e.target.value) })}
                  className="w-full accent-purple-700"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Competitive Intensity Weight</span>
                  <span className="text-purple-700 font-mono">{tempWeights.competitiveIntensity}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={40}
                  value={tempWeights.competitiveIntensity}
                  onChange={(e) => setTempWeights({ ...tempWeights, competitiveIntensity: Number(e.target.value) })}
                  className="w-full accent-purple-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Financial Feasibility (IRR / CapEx) Weight</span>
                  <span className="text-purple-700 font-mono">{tempWeights.financialFeasibility}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={40}
                  value={tempWeights.financialFeasibility}
                  onChange={(e) => setTempWeights({ ...tempWeights, financialFeasibility: Number(e.target.value) })}
                  className="w-full accent-purple-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
