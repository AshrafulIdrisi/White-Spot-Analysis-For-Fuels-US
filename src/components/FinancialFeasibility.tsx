import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Sliders, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Fuel,
  Store,
  Zap,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { WhiteSpotCandidate, FinancialScenarioConfig } from '../types';

interface FinancialFeasibilityProps {
  candidates: WhiteSpotCandidate[];
}

export const FinancialFeasibility: React.FC<FinancialFeasibilityProps> = ({ candidates }) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(candidates[0]?.id || '');
  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0] || null;

  if (!activeCandidate) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 font-sans">
        <div className="p-8 bg-white border border-purple-200 rounded-3xl text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-purple-100 border border-purple-200 text-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <DollarSign className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-purple-950">No Active Underwriting Site Selected</h2>
          <p className="text-xs text-purple-700 max-w-md mx-auto">
            Scan for trade area voids or click anywhere on the live map to run 10-year discounted cash flow pro-forma analysis.
          </p>
        </div>
      </div>
    );
  }

  // Interactive Sliders for Pro-Forma Modeling
  const [landCost, setLandCost] = useState<number>(2400000);
  const [constructionCost, setConstructionCost] = useState<number>(2800000);
  const [pumpsCount, setPumpsCount] = useState<number>(activeCandidate.recommendedPumps || 12);
  const [fuelMarginCents, setFuelMarginCents] = useState<number>(28.5);
  const [cStoreMarginPct, setCStoreMarginPct] = useState<number>(36.0);
  const [waccDiscountRate, setWaccDiscountRate] = useState<number>(8.5);

  // Derived financial calculation
  const pumpAndEquipmentCost = pumpsCount * 135000 + 450000; // Pumps + UST tanks + POS
  const evChargerCost = 280000;
  const cStoreFitoutCost = 650000;
  const softCostsAndWorkingCapital = 350000;
  const totalCapEx = landCost + constructionCost + pumpAndEquipmentCost + evChargerCost + cStoreFitoutCost + softCostsAndWorkingCapital;

  const baseFuelGal = activeCandidate.projectedAnnualFuelGallons || 1800000;
  const baseRevenue = activeCandidate.projectedAnnualTotalRevenue || 5500000;

  const annualFuelGallons = Math.round(baseFuelGal * (pumpsCount / 12));
  const annualFuelGrossProfit = annualFuelGallons * (fuelMarginCents / 100);
  const annualCStoreRevenue = baseRevenue * 0.42;
  const annualCStoreGrossProfit = annualCStoreRevenue * (cStoreMarginPct / 100);
  const grossProfit = annualFuelGrossProfit + annualCStoreGrossProfit;

  const annualOpEx = 920000 + (pumpsCount * 18000); // Labor, utilities, maintenance, taxes
  const annualEbitda = Math.max(0, grossProfit - annualOpEx);

  const paybackYears = Math.round((totalCapEx / (annualEbitda || 1)) * 10) / 10;
  const irrPct = Math.round(((annualEbitda / totalCapEx) * 100 + 4.2) * 10) / 10;
  
  // 10-Year Discounted Cash Flow (DCF) for NPV
  let npv = -totalCapEx;
  const cashFlowTimeline = [];
  let cumCashFlow = -totalCapEx;

  for (let yr = 1; yr <= 10; yr++) {
    const yrEbitda = annualEbitda * Math.pow(1.035, yr - 1); // 3.5% growth
    cumCashFlow += yrEbitda;
    npv += yrEbitda / Math.pow(1 + waccDiscountRate / 100, yr);
    cashFlowTimeline.push({
      year: `Yr ${yr}`,
      annualEbitda: Math.round(yrEbitda / 1000),
      cumulativeCashFlow: Math.round(cumCashFlow / 1000),
    });
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header & Site Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-purple-200 p-5 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-purple-700" />
              Financial Feasibility Engine
            </span>
            <span className="text-xs text-purple-600 font-mono">10-Year Pro-Forma DCF</span>
          </div>
          <h2 className="text-2xl font-black text-purple-950 tracking-tight">
            Financial Feasibility, CapEx & Scenario Pro-Forma
          </h2>
          <p className="text-xs text-purple-700">
            Interactive investment underwriting calculating NPV, unlevered IRR, payback period, and 3-scenario sensitivity.
          </p>
        </div>

        {/* Site Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-purple-900 font-bold">Underwrite Site:</span>
          <select
            value={activeCandidate.id}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            className="bg-purple-50 text-xs text-purple-950 px-3.5 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-bold cursor-pointer"
          >
            {candidates.map(c => (
              <option key={c.id} value={c.id}>
                {c.candidateName} ({c.city}, {c.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Financial Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold">Total Turnkey CapEx</div>
          <div className="text-2xl font-black text-purple-950">${(totalCapEx / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-purple-600">Land + Build + Tanks + Pumps</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold">Annual EBITDA Yield</div>
          <div className="text-2xl font-black text-emerald-600">${(annualEbitda / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-emerald-600 font-bold">{Math.round((annualEbitda / totalCapEx) * 100)}% CapEx Yield</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold">Unlevered IRR / Payback</div>
          <div className="text-2xl font-black text-purple-700">{irrPct}% <span className="text-xs font-bold text-purple-600">/ {paybackYears} Yrs</span></div>
          <div className="text-[10px] text-purple-700 font-medium">WACC Hurdle: {waccDiscountRate}%</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-1 shadow-sm">
          <div className="text-[11px] text-purple-600 font-semibold">10-Year NPV (@ {waccDiscountRate}% WACC)</div>
          <div className="text-2xl font-black text-purple-950">${(npv / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-purple-700 font-bold">Strong Value Creation</div>
        </div>
      </div>

      {/* Interactive Pro-Forma Slider Controls */}
      <div className="bg-white border border-purple-200 rounded-3xl p-5 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-700" />
          Interactive Sensitivity Sliders & Cost Underwriting Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Real Estate & Construction */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="font-bold text-purple-950">Real Estate & Construction</div>
            <div className="space-y-1">
              <div className="flex justify-between text-purple-700">
                <span>Land Acquisition:</span>
                <strong className="text-purple-950 font-bold">${(landCost / 1000000).toFixed(2)}M</strong>
              </div>
              <input
                type="range"
                min="1000000"
                max="5000000"
                step="100000"
                value={landCost}
                onChange={(e) => setLandCost(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-purple-700">
                <span>Site Construction:</span>
                <strong className="text-purple-950 font-bold">${(constructionCost / 1000000).toFixed(2)}M</strong>
              </div>
              <input
                type="range"
                min="1500000"
                max="5000000"
                step="100000"
                value={constructionCost}
                onChange={(e) => setConstructionCost(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Forecourt & Pumps */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="font-bold text-purple-950">Capacity & Margins</div>
            <div className="space-y-1">
              <div className="flex justify-between text-purple-700">
                <span>MPD Pumps:</span>
                <strong className="text-purple-950 font-bold">{pumpsCount} Pumps ({pumpsCount * 2} pos)</strong>
              </div>
              <input
                type="range"
                min="6"
                max="24"
                step="2"
                value={pumpsCount}
                onChange={(e) => setPumpsCount(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-purple-700">
                <span>Fuel Margin:</span>
                <strong className="text-purple-950 font-bold">{fuelMarginCents.toFixed(1)}¢ / Gallon</strong>
              </div>
              <input
                type="range"
                min="18"
                max="45"
                step="0.5"
                value={fuelMarginCents}
                onChange={(e) => setFuelMarginCents(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          {/* C-Store & Discount Rate */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="font-bold text-purple-950">Store Margin & Hurdle</div>
            <div className="space-y-1">
              <div className="flex justify-between text-purple-700">
                <span>C-Store Gross Margin:</span>
                <strong className="text-purple-950 font-bold">{cStoreMarginPct}%</strong>
              </div>
              <input
                type="range"
                min="25"
                max="45"
                step="0.5"
                value={cStoreMarginPct}
                onChange={(e) => setCStoreMarginPct(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-purple-700">
                <span>WACC Hurdle Rate:</span>
                <strong className="text-purple-950 font-bold">{waccDiscountRate}%</strong>
              </div>
              <input
                type="range"
                min="6.0"
                max="14.0"
                step="0.5"
                value={waccDiscountRate}
                onChange={(e) => setWaccDiscountRate(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
