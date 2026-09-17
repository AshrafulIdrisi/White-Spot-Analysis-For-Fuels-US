import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  Key, 
  Server,
  Zap
} from 'lucide-react';
import { ScoringWeights } from '../types';

interface AdminSettingsProps {
  weights: ScoringWeights;
  onUpdateWeights: (newW: ScoringWeights) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ weights, onUpdateWeights }) => {
  const [localWeights, setLocalWeights] = useState<ScoringWeights>({ ...weights });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalWeight = Object.values(localWeights).reduce<number>((sum, v) => sum + Number(v), 0);

  const handleSave = () => {
    onUpdateWeights(localWeights);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
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

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Admin Configuration
            </span>
            <span className="text-xs text-slate-400 font-mono">Algorithm: WS-Alpha-2026.4</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Scoring Criteria, Weight Tuning & Platform Admin
          </h2>
          <p className="text-xs text-slate-300">
            Define corporate expansion thresholds, multi-criteria weight distributions, and spatial buffer defaults.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Scoring Weights</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Scoring weights updated and applied across all live candidate indices.</span>
        </div>
      )}

      {/* Weights Tuning Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Multi-Criteria Weights Distribution</h3>
            <p className="text-xs text-slate-400">Total must equal 100% (Current: <strong className={totalWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}>{totalWeight}%</strong>)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-200">1. Demand Potential (Population, Income, Vehicle Density)</span>
              <span className="text-cyan-400">{localWeights.demandPotential}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={localWeights.demandPotential}
              onChange={(e) => setLocalWeights({ ...localWeights, demandPotential: parseInt(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-200">2. Traffic & Access (FHWA AADT, Highway Ramps, Frontage)</span>
              <span className="text-emerald-400">{localWeights.trafficAccessibility}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={localWeights.trafficAccessibility}
              onChange={(e) => setLocalWeights({ ...localWeights, trafficAccessibility: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-200">3. Supply Gap / Void (Distance to Competitors, Capacity Deficit)</span>
              <span className="text-amber-400">{localWeights.supplyGap}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={localWeights.supplyGap}
              onChange={(e) => setLocalWeights({ ...localWeights, supplyGap: parseInt(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-200">4. Financial Feasibility (IRR, Payback Years, CapEx Recovery)</span>
              <span className="text-purple-400">{localWeights.financialFeasibility}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={localWeights.financialFeasibility}
              onChange={(e) => setLocalWeights({ ...localWeights, financialFeasibility: parseInt(e.target.value) })}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
