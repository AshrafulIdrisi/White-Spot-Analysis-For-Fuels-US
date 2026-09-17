import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Building2, 
  DollarSign, 
  Fuel, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { WhiteSpotCandidate } from '../types';

interface NewSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCandidate: (newCandidate: WhiteSpotCandidate) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

export const NewSiteModal: React.FC<NewSiteModalProps> = ({
  isOpen,
  onClose,
  onAddCandidate,
  initialLat,
  initialLng,
  initialAddress
}) => {
  const [siteName, setSiteName] = useState('Custom Corridor Target');
  const [address, setAddress] = useState(initialAddress || '10400 State Highway Frontage');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('78748');
  const [lat, setLat] = useState<number>(initialLat || 30.18);
  const [lng, setLng] = useState<number>(initialLng || -97.79);
  const [aadt, setAadt] = useState<number>(58000);
  const [pop3Mile, setPop3Mile] = useState<number>(68000);
  const [medianIncome, setMedianIncome] = useState<number>(94000);
  const [storeType, setStoreType] = useState<'Fuel Station + C-Store' | 'Travel Plaza / Truck Stop' | 'EV Charging Hub'>('Fuel Station + C-Store');
  const [pumps, setPumps] = useState<number>(12);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate score based on inputs
    const demandScore = Math.min(98, Math.round((pop3Mile / 1000) * 0.4 + (medianIncome / 2000) * 0.4 + 30));
    const trafficScore = Math.min(99, Math.round((aadt / 1000) * 1.1 + 25));
    const supplyGapScore = 88;
    const oppScore = Math.round((demandScore * 0.35) + (trafficScore * 0.35) + (supplyGapScore * 0.3));

    const newCandidate: WhiteSpotCandidate = {
      id: `ws-custom-${Date.now()}`,
      candidateName: siteName,
      address,
      city,
      state,
      zipCode,
      lat,
      lng,
      opportunityScore: oppScore,
      demandScore,
      supplyGapScore,
      trafficScore,
      competitionScore: 78,
      commercialScore: 82,
      financialScore: 86,
      growthScore: 84,
      county: 'Travis',
      proposedStoreType: storeType,
      recommendedPumps: pumps,
      recommendedCStoreSqFt: 5200,
      aadt,
      pop3Mile,
      medianIncome3Mile: medianIncome,
      nearestStationMiles: 2.1,
      competitorCount3Miles: 3,
      projectedDailyFootfall: Math.round(aadt * 0.08),
      projectedAnnualFuelGallons: Math.round(pumps * 240000),
      projectedAnnualTotalRevenue: Math.round(pumps * 240000 * 3.45 + 2400000),
      projectedAnnualEbitda: Math.round(pumps * 240000 * 0.28 + 750000),
      estimatedCapEx: Math.round(pumps * 140000 + 4800000),
      estimatedPaybackYears: 4.8,
      estimatedIrrPct: 24.2,
      projectedMarketSharePct: 29.5,
      riskLevel: 'Low',
      confidenceLevel: 'High',
      modelVersion: 'WS-Alpha-2026.4',
      dataGaps: [],
      estimatedNpv: 2950000,
      projectedAnnualCStoreRevenue: 2400000,
      sourceDate: '2026-09-16',
      primaryRationale: [
        `High corridor traffic volume of ${aadt.toLocaleString()} AADT`,
        `Affluent 3-mile trade area ($${medianIncome.toLocaleString()} median household income)`,
        `Underserved trade area with 2.1 miles separation from nearest major competitor`
      ]
    };

    onAddCandidate(newCandidate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Evaluate Custom Candidate Site</h3>
              <p className="text-xs text-slate-400">Instantly score any US coordinate or address</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Site Name / Corridor</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Proposed Store Format</label>
              <select
                value={storeType}
                onChange={(e: any) => setStoreType(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
              >
                <option value="Fuel Station + C-Store">Fuel Station + C-Store</option>
                <option value="Travel Plaza / Truck Stop">Travel Plaza / Truck Stop</option>
                <option value="EV Charging Hub">EV Charging Hub</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">ZIP Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Daily Traffic (AADT)</label>
              <input
                type="number"
                value={aadt}
                onChange={(e) => setAadt(parseInt(e.target.value))}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">3-Mile Population</label>
              <input
                type="number"
                value={pop3Mile}
                onChange={(e) => setPop3Mile(parseInt(e.target.value))}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Dispenser Pumps</label>
              <input
                type="number"
                value={pumps}
                onChange={(e) => setPumps(parseInt(e.target.value))}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Score & Add Site</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
