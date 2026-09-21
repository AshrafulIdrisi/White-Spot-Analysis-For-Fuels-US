import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Fuel, 
  Store, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  RotateCcw, 
  Compass, 
  Layers, 
  Info, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Share2
} from 'lucide-react';
import { WhiteSpotCandidate, StoreLocationRecord, CannibalizationDetail } from '../types';
import { haversineDistance } from '../data/osmSeedData';

interface CannibalizationSimulatorProps {
  candidates: WhiteSpotCandidate[];
  locations: StoreLocationRecord[];
  selectedCandidate?: WhiteSpotCandidate | null;
  onSelectCandidate?: (cand: WhiteSpotCandidate) => void;
  onNavigateToMap?: (cand: WhiteSpotCandidate) => void;
}

export const CannibalizationSimulatorModule: React.FC<CannibalizationSimulatorProps> = ({
  candidates,
  locations,
  selectedCandidate,
  onSelectCandidate,
  onNavigateToMap
}) => {
  const [activeSiteId, setActiveSiteId] = useState<string>(() => {
    return selectedCandidate?.id || (candidates[0]?.id ?? '');
  });

  // Sync when selectedCandidate prop updates (e.g. from live map click)
  useEffect(() => {
    if (selectedCandidate) {
      setActiveSiteId(selectedCandidate.id);
    }
  }, [selectedCandidate?.id, selectedCandidate?.lat, selectedCandidate?.lng]);

  // Simulator Tuning Parameters
  const [distanceDecayExponent, setDistanceDecayExponent] = useState<number>(2.0); // Lambda
  const [brandLoyaltyFactor, setBrandLoyaltyFactor] = useState<number>(1.25);
  const [pumpsCount, setPumpsCount] = useState<number>(12);
  const [cStoreSqFt, setCStoreSqFt] = useState<number>(4800);

  const currentSite = useMemo(() => {
    if (selectedCandidate && (selectedCandidate.id === activeSiteId || !activeSiteId)) {
      return selectedCandidate;
    }
    return candidates.find(c => c.id === activeSiteId) || selectedCandidate || candidates[0];
  }, [candidates, activeSiteId, selectedCandidate]);

  // Find all sister stores (e.g. ExxonMobil branded locations) in network
  const sisterStores = useMemo(() => {
    return locations.filter(l => 
      l.brand.toLowerCase().includes('exxon') || 
      l.brand.toLowerCase().includes('mobil') || 
      l.brand.toLowerCase().includes('synergy')
    );
  }, [locations]);

  // Compute live Huff Gravity Model diversion for each sister store
  const simulationResults = useMemo(() => {
    if (!currentSite) return null;

    const lat = currentSite.lat;
    const lng = currentSite.lng;

    // Proposed new store attractiveness score
    const newStoreAttractiveness = (pumpsCount * 12) + (cStoreSqFt * 0.08) * brandLoyaltyFactor;

    const details: CannibalizationDetail[] = sisterStores.map(s => {
      const dist = Math.round(haversineDistance(lat, lng, s.lat, s.lng) * 10) / 10;
      const driveTime = Math.round(dist * 2.2 + 1.2);
      const currMonthlyVol = s.financials?.monthlyFuelVolumeGallons || 155000;
      const sisterPumps = s.fuelDetails?.pumpsCount || 8;
      const sisterCStore = s.fuelDetails?.cStoreSqFt || 3600;
      const sisterAttractiveness = (sisterPumps * 10) + (sisterCStore * 0.07);

      // Huff Gravity Model Formulation:
      // Diversion probability ~ (Attractiveness_new / Dist^lambda) / (Attractiveness_new / Dist^lambda + Attractiveness_sister / 1.0^lambda)
      let diversionPct = 0;
      if (dist < 0.3) {
        diversionPct = 38;
      } else if (dist <= 10.0) {
        const gravityWeight = (newStoreAttractiveness / Math.pow(Math.max(0.5, dist), distanceDecayExponent));
        const sisterSelfWeight = (sisterAttractiveness / Math.pow(1.0, distanceDecayExponent));
        const rawProb = gravityWeight / (gravityWeight + sisterSelfWeight);
        diversionPct = Math.min(35, Math.max(0, Math.round(rawProb * 40 * brandLoyaltyFactor)));
      } else {
        diversionPct = 0;
      }

      const divertedMonthlyGal = Math.round(currMonthlyVol * (diversionPct / 100));
      const divertedGrossProfit = Math.round((divertedMonthlyGal * 0.265) + (divertedMonthlyGal / 14) * 1.8);

      return {
        sisterStoreId: s.id,
        sisterStoreName: s.name,
        distanceMiles: dist,
        driveTimeMinutes: driveTime,
        currentMonthlyVolumeGal: currMonthlyVol,
        projectedDiversionPct: diversionPct,
        divertedMonthlyVolumeGal: divertedMonthlyGal,
        divertedMonthlyGrossProfitUsd: divertedGrossProfit,
        riskLevel: diversionPct >= 15 ? 'HIGH' : diversionPct >= 6 ? 'MODERATE' : 'LOW'
      };
    }).filter(s => s.distanceMiles <= 10.0).sort((a, b) => a.distanceMiles - b.distanceMiles);

    const totalMonthlyDiverted = details.reduce((sum, d) => sum + d.divertedMonthlyVolumeGal, 0);
    const totalAnnualProfitLoss = details.reduce((sum, d) => sum + d.divertedMonthlyGrossProfitUsd, 0) * 12;

    const grossNewMonthlyGal = Math.round((currentSite.projectedAnnualFuelGallons || 1800000) / 12);
    const netIncrementalMonthlyGal = Math.max(0, grossNewMonthlyGal - totalMonthlyDiverted);
    const netIncrementalAnnualGal = netIncrementalMonthlyGal * 12;

    const grossAnnualEbitda = currentSite.projectedAnnualEbitda || 820000;
    const netIncrementalEbitda = Math.max(250000, grossAnnualEbitda - totalAnnualProfitLoss);
    const netLiftPct = Math.round((netIncrementalMonthlyGal / Math.max(1, grossNewMonthlyGal)) * 100);

    return {
      details,
      totalMonthlyDiverted,
      totalAnnualProfitLoss,
      grossNewMonthlyGal,
      netIncrementalMonthlyGal,
      netIncrementalAnnualGal,
      grossAnnualEbitda,
      netIncrementalEbitda,
      netLiftPct
    };
  }, [currentSite, sisterStores, distanceDecayExponent, brandLoyaltyFactor, pumpsCount, cStoreSqFt]);

  return (
    <div className="space-y-6 pb-12 font-sans text-purple-950">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 rounded-3xl p-6 text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Portfolio Defense & Spatial Gravity Model</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Sister-Store Cannibalization Simulator</h1>
            <p className="text-sm text-purple-200 mt-1 max-w-2xl">
              Calculate projected gallon diversion from existing owned network locations using the Huff Spatial Gravity Formulation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setDistanceDecayExponent(2.0);
                setBrandLoyaltyFactor(1.25);
                setPumpsCount(12);
                setCStoreSqFt(4800);
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-800/80 hover:bg-purple-700 text-xs font-bold text-purple-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Parameters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-900">Target Candidate:</span>
          <select
            value={activeSiteId}
            onChange={(e) => setActiveSiteId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-purple-50 text-xs font-bold text-purple-950 border border-purple-200 focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            {candidates.map(c => (
              <option key={c.id} value={c.id}>
                {c.candidateName} ({c.city}, {c.state})
              </option>
            ))}
          </select>
        </div>

        {currentSite && onNavigateToMap && (
          <button
            onClick={() => onNavigateToMap(currentSite)}
            className="text-xs font-bold text-purple-600 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
          >
            <span>View Spatial Radius on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Simulator Tuning Sliders */}
      <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900">
            Interactive Gravity Model Parameters
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Distance Decay Exponent */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-purple-900">Distance Decay (λ)</span>
              <span className="text-purple-600">{distanceDecayExponent.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={distanceDecayExponent}
              onChange={(e) => setDistanceDecayExponent(parseFloat(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <p className="text-[10px] text-purple-600 mt-1">Higher decay = customers less willing to drive further</p>
          </div>

          {/* Brand Loyalty Factor */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-purple-900">Brand Loyalty Factor</span>
              <span className="text-purple-600">{brandLoyaltyFactor.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={brandLoyaltyFactor}
              onChange={(e) => setBrandLoyaltyFactor(parseFloat(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <p className="text-[10px] text-purple-600 mt-1">Synergy rewards loyalty retention strength</p>
          </div>

          {/* Proposed MPD Pumps */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-purple-900">Proposed Forecourt Pumps</span>
              <span className="text-purple-600">{pumpsCount} Positions</span>
            </div>
            <input
              type="range"
              min="6"
              max="24"
              step="2"
              value={pumpsCount}
              onChange={(e) => setPumpsCount(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <p className="text-[10px] text-purple-600 mt-1">Higher pump count increases gravitational draw</p>
          </div>

          {/* Proposed C-Store Sq Ft */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-purple-900">C-Store Footprint</span>
              <span className="text-purple-600">{cStoreSqFt.toLocaleString()} Sq Ft</span>
            </div>
            <input
              type="range"
              min="2400"
              max="7500"
              step="200"
              value={cStoreSqFt}
              onChange={(e) => setCStoreSqFt(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <p className="text-[10px] text-purple-600 mt-1">Expanded food service draws non-fuel shoppers</p>
          </div>
        </div>
      </div>

      {/* Net Portfolio Lift Summary Cards */}
      {simulationResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm">
            <div className="text-[11px] font-bold text-purple-500 uppercase tracking-wider">Gross New Fuel Volume</div>
            <div className="text-2xl font-black text-purple-950 mt-1">
              {((simulationResults.grossNewMonthlyGal * 12) / 1000000).toFixed(2)}M
              <span className="text-xs font-normal text-purple-600 ml-1">gal/yr</span>
            </div>
            <div className="text-[11px] text-purple-600 mt-1">
              {simulationResults.grossNewMonthlyGal.toLocaleString()} gal/mo at proposed site
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm">
            <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Sister Network Diversion</div>
            <div className="text-2xl font-black text-rose-700 mt-1">
              -{((simulationResults.totalMonthlyDiverted * 12) / 1000000).toFixed(2)}M
              <span className="text-xs font-normal text-purple-600 ml-1">gal/yr</span>
            </div>
            <div className="text-[11px] text-rose-600 mt-1">
              -{simulationResults.totalMonthlyDiverted.toLocaleString()} gal/mo across {simulationResults.details.length} sister stores
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm">
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Net Incremental Volume</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              +{(simulationResults.netIncrementalAnnualGal / 1000000).toFixed(2)}M
              <span className="text-xs font-normal text-purple-600 ml-1">gal/yr</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">
              {simulationResults.netLiftPct}% Net Incremental Efficiency
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm">
            <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">Net Incremental EBITDA</div>
            <div className="text-2xl font-black text-purple-950 mt-1">
              ${(simulationResults.netIncrementalEbitda / 1000).toFixed(0)}k
              <span className="text-xs font-normal text-purple-600 ml-1">/yr</span>
            </div>
            <div className="text-[11px] text-purple-600 mt-1">
              After factoring ${Math.round(simulationResults.totalAnnualProfitLoss / 1000)}k/yr sister diversion loss
            </div>
          </div>
        </div>
      )}

      {/* Sister Store Network Breakdown Table */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-purple-100 bg-purple-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-purple-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-950">
              Sister Store Network Diversion Breakdown (10-Mile Radius)
            </h3>
          </div>
          <span className="text-xs text-purple-600 font-medium">
            {simulationResults?.details.length || 0} Owned Stores Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-purple-50/30 border-b border-purple-100 text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                <th className="p-3.5">Sister Store Facility</th>
                <th className="p-3.5 text-center">Distance</th>
                <th className="p-3.5 text-center">Drive Time</th>
                <th className="p-3.5 text-right">Current Monthly Gallons</th>
                <th className="p-3.5 text-center">Projected Diversion %</th>
                <th className="p-3.5 text-right">Monthly Volume Diverted</th>
                <th className="p-3.5 text-right">Monthly EBITDA Impact</th>
                <th className="p-3.5 text-center">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 font-medium">
              {simulationResults?.details.map(store => (
                <tr key={store.sisterStoreId} className="hover:bg-purple-50/30 transition-colors">
                  <td className="p-3.5 font-bold text-purple-950">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-purple-600" />
                      <span>{store.sisterStoreName}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-center font-bold text-purple-900">{store.distanceMiles} mi</td>
                  <td className="p-3.5 text-center text-purple-700">{store.driveTimeMinutes} mins</td>
                  <td className="p-3.5 text-right font-mono text-purple-950">
                    {store.currentMonthlyVolumeGal.toLocaleString()} gal
                  </td>
                  <td className="p-3.5 text-center font-bold">
                    <span className={`px-2 py-0.5 rounded-md text-xs ${
                      store.projectedDiversionPct > 15
                        ? 'bg-rose-100 text-rose-800'
                        : store.projectedDiversionPct > 5
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {store.projectedDiversionPct}%
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono text-rose-700 font-bold">
                    -{store.divertedMonthlyVolumeGal.toLocaleString()} gal
                  </td>
                  <td className="p-3.5 text-right font-mono text-rose-700 font-bold">
                    -${store.divertedMonthlyGrossProfitUsd.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      store.riskLevel === 'HIGH'
                        ? 'bg-rose-100 text-rose-800'
                        : store.riskLevel === 'MODERATE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {store.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Portfolio Playbook */}
      <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-600" />
          <span>Recommended Cannibalization Mitigation Playbook</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100">
            <div className="font-bold text-purple-950 mb-1">1. Format Specialization</div>
            <p className="text-slate-600 leading-relaxed">
              Position the proposed site as a high-volume Highway Travel Center with dedicated commercial diesel lanes and EV charging, while keeping the existing sister store focused on neighbourhood quick-stop convenience.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100">
            <div className="font-bold text-purple-950 mb-1">2. Synergy Rewards Cross-Ecosystem</div>
            <p className="text-slate-600 leading-relaxed">
              Use unified rewards incentives so existing customers earn cross-station multipliers, capturing incremental shopping trips rather than switching to third-party competitors.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100">
            <div className="font-bold text-purple-950 mb-1">3. Foodservice & Premium Octane Focus</div>
            <p className="text-slate-600 leading-relaxed">
              Differentiate product mix with On the Run™ fresh bakery and Synergy Supreme+™ 93 Octane to maximize high-margin gross profits that offset any minor regular 87 volume overlap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
