import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Target, 
  PieChart, 
  Fuel, 
  DollarSign, 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle,
  ArrowUpRight,
  Calculator,
  ChevronRight,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';

export interface KpiGlossaryItem {
  id: string;
  name: string;
  category: 'market_share' | 'supply_forecourt' | 'financials' | 'cannibalization' | 'traffic_demographics';
  categoryLabel: string;
  abbreviation?: string;
  tagline: string;
  definition: string;
  formula: string;
  mathExplanation: string;
  dataSources: string[];
  benchmarks: {
    good: string;
    moderate: string;
    poor: string;
  };
  strategicUsage: string;
  practicalExample: string;
  decisionRule: string;
}

export const KPI_GLOSSARY_DATABASE: KpiGlossaryItem[] = [
  {
    id: 'catchment-rank',
    name: 'Projected Catchment Rank & Market Share',
    category: 'market_share',
    categoryLabel: 'Market Dominance & Share',
    abbreviation: 'Rank # / Share %',
    tagline: 'Relative competitive standing and volumetric capture across trade area fueling positions.',
    definition: 'Measures where the proposed new station will rank in overall market volume and dispenser share compared against all existing branded and independent operators inside the selected radius (1, 3, or 5 miles).',
    formula: 'Pump Share (%) = [ P_proposed / (∑ P_competitors + P_proposed) ] × 100',
    mathExplanation: 'Takes the recommended new pump count (e.g. 16 fueling positions) and divides it by the aggregate sum of all active competitor pumps in the trade area plus the proposed station.',
    dataSources: ['OpenStreetMap Overpass API (amenity=fuel & capacity:pumps)', 'Geoapify Places Polygon API', 'Live spatial corridor queries'],
    benchmarks: {
      good: 'Rank #1 or #2 (> 15% Share) — Dominant market anchor with maximum pricing power',
      moderate: 'Rank #3 to #5 (8% – 15% Share) — Healthy co-existing regional competitor',
      poor: 'Rank #6+ (< 8% Share) — Highly fragmented subscale presence with low brand pull'
    },
    strategicUsage: 'Determines whether the proposed capital expenditure achieves adequate scale to capture commuter traffic and support high-margin convenience store sales.',
    practicalExample: 'In a trade area with 84 existing competitor pumps, adding a 16-pump travel center brings total capacity to 100 pumps, establishing an immediate 16.0% market share (#2 Market Leader).',
    decisionRule: 'If Projected Share ≥ 14% and Rank ≤ #2, approve Tier-1 large-format forecourt allocation.'
  },
  {
    id: 'vulnerability-score',
    name: 'Vulnerability Score & Share Steal Potential',
    category: 'market_share',
    categoryLabel: 'Market Dominance & Share',
    abbreviation: 'Vulnerability %',
    tagline: 'Quantifies competitor fragility and ease of converting rival customer volume.',
    definition: 'An empirical index (0% to 100%) indicating how susceptible incumbent retail stations are to losing volume to a modern Tier-1 forecourt due to aging assets, subscale pump counts, lack of foodservice, or weak brand loyalty.',
    formula: 'Vulnerability = 100 - [ 0.40 × BrandMoat + 0.30 × (Pumps / 16 × 100) + 0.15 × FoodScore + 0.15 × EvScore ]',
    mathExplanation: 'Inversely proportional to the competitor’s brand moat, dispenser count, hot-food offering, and modern EV charging capabilities.',
    dataSources: ['OpenStreetMap amenity tags (fast_food, cafe, toilets, ev_charging)', 'Brand loyalty benchmarks', 'Forecourt infrastructure ratings'],
    benchmarks: {
      good: '> 65% Vulnerability — Prime target for aggressive share capture and traffic diversion',
      moderate: '35% – 65% Vulnerability — Standard competitor with moderate defensive stickiness',
      poor: '< 35% Vulnerability (Fortified) — Heavyweight operator (e.g. Buc-ee’s, QuikTrip, Wawa)'
    },
    strategicUsage: 'Directs marketing campaigns, loyalty rewards promotions, and billboard placements specifically toward corridors anchored by fragile competitors.',
    practicalExample: 'A trade area where 73.3% of pumps belong to unbranded 4-pump legacy kiosks allows a new 16-pump flagship to capture ~2.5M+ gallons simply by offering clean restrooms, premium fuel, and fresh food.',
    decisionRule: 'Target corridors where Vulnerable Share > 50% for maximum immediate return on investment.'
  },
  {
    id: 'brand-moat-index',
    name: 'Brand Moat Index',
    category: 'market_share',
    categoryLabel: 'Market Dominance & Share',
    abbreviation: 'Moat (0–100)',
    tagline: 'Strength of customer brand loyalty, fleet cards, and mobile app rewards defense.',
    definition: 'Scores the defensive barrier of a retail fuel operator based on proprietary additives, consumer brand perception, fleet credit cards, mobile app loyalty penetration, and proprietary foodservice reputation.',
    formula: 'BrandMoat = BaseBrandTier + FleetCardBonus + AppEcosystemBonus + FoodserviceRating',
    mathExplanation: 'Scored out of 100: Tier-1 national majors (ExxonMobil Synergy, Chevron Techron, Shell V-Power) receive 90–95; mega-convenience travel centers (Buc-ee’s, QuikTrip, Wawa) score 95–98; regional discounters score 80–85; unbranded independent stations score 40–60.',
    dataSources: ['NACS Retail Industry Benchmarks', 'Oil Brand Loyalty Studies', 'Fleet card acceptance registry'],
    benchmarks: {
      good: '90 – 100 (Tier-1 Fortified) — High willingness-to-pay, premium fuel mix > 30%',
      moderate: '70 – 89 (Tier-2 Regional) — Strong local following but vulnerable to modern amenities',
      poor: '< 70 (Commoditized) — Zero pricing power; purely dependent on discount pricing'
    },
    strategicUsage: 'Identifies which competitors will fiercely defend their volume vs. which will surrender margin and gallon throughput to a new market entrant.',
    practicalExample: 'An ExxonMobil station equipped with Synergy Supreme+™ 93 Octane and Mobil Rewards+ scores 95/100, effectively insulating high-margin premium volume.',
    decisionRule: 'Avoid direct price wars against brands with Moat > 92; instead compete on superior ingress and gourmet foodservice.'
  },
  {
    id: 'herfindahl-index',
    name: 'Herfindahl-Hirschman Index (HHI)',
    category: 'market_share',
    categoryLabel: 'Market Dominance & Share',
    abbreviation: 'HHI (0–10,000)',
    tagline: 'Standard economic metric measuring market concentration and antitrust landscape.',
    definition: 'The sum of the squared market shares of all operators in the trade area. Measures whether the market is fragmented among many small players or monopolized by a few large operators.',
    formula: 'HHI = ∑ (MarketShare_i)^2   for all operators i = 1 to N',
    mathExplanation: 'If 4 competitors each hold 25% share, HHI = 25² + 25² + 25² + 25² = 2,500. If 10 competitors each hold 10%, HHI = 1,000.',
    dataSources: ['Department of Justice (DOJ) & FTC antitrust guidelines', 'Live trade area pump share distributions'],
    benchmarks: {
      good: '< 1,500 (Highly Competitive / Fragmented) — Easy entry; volume is dispersed',
      moderate: '1,500 – 2,500 (Moderately Concentrated) — Balanced market with established regional leaders',
      poor: '> 2,500 (Highly Concentrated / Oligopoly) — Severe incumbent dominance with aggressive retaliation'
    },
    strategicUsage: 'Assesses competitive risk before committing land acquisition capital. Fragmented markets yield the fastest market-share ramp.',
    practicalExample: 'An HHI of 1,240 indicates a low-concentration trade area where multiple weak independent operators can be displaced without sparking a price war.',
    decisionRule: 'Prioritize parcels in HHI < 1,800 markets for rapid initial volume ramp within months 1–12.'
  },
  {
    id: 'unmet-fuel-demand',
    name: 'Unmet Fuel Demand Deficit',
    category: 'supply_forecourt',
    categoryLabel: 'Forecourt & Spatial Supply',
    abbreviation: 'Demand Gap (Gal/yr)',
    tagline: 'Calculated annual shortfall between commuter fuel demand and physical pumping capacity.',
    definition: 'The volume of vehicle fuel consumption generated by local households and passing highway traffic that cannot be efficiently serviced by existing outdated trade area pumps without excessive queuing.',
    formula: 'Unmet Gallons = (Pop_Catchment × 460 Gal/capita + AADT × 365 × CaptureRate × 12 Gal) - (Pumps_Existing × 195,000 Gal/pump)',
    mathExplanation: 'Calculates total consumption from residential population and corridor traffic, then subtracts the maximum throughput capacity of all existing trade area fueling positions.',
    dataSources: ['US Census Bureau American Community Survey (ACS)', 'FHWA / DOT Highway Traffic AADT', 'OSM Forecourt dispenser registry'],
    benchmarks: {
      good: '> 2.0M Gallons/yr — Severe supply deficit; rapid underwriting payback',
      moderate: '1.0M – 2.0M Gallons/yr — Healthy demand void for medium-format forecourt',
      poor: '< 0.5M Gallons/yr — Saturated market; growth requires 100% competitor share steal'
    },
    strategicUsage: 'Provides the core volume justification for bank financing, fuel supply agreements, and executive investment committee sign-off.',
    practicalExample: 'A 3-mile corridor with 48,000 residents and 42,000 AADT generates 6.8M Gal/yr demand, but only has 24 existing pumps (4.68M Gal capacity), leaving a 2.12M Gal unmet void.',
    decisionRule: 'Greenlight standard $5.5M CapEx only if Unmet Demand ≥ 1.75M Gal/yr.'
  },
  {
    id: 'pumps-per-thousand',
    name: 'Pumps per 1,000 Population Density',
    category: 'supply_forecourt',
    categoryLabel: 'Forecourt & Spatial Supply',
    abbreviation: 'Pumps / 1k Pop',
    tagline: 'Trade area dispenser saturation normalized against residential density.',
    definition: 'The number of operational fuel nozzles available per 1,000 residents in the trade area. Benchmarks local fuel infrastructure adequacy against the US national average of 3.8 pumps per 1,000 residents.',
    formula: 'Pumps/1k = (Total Trade Area Pumps / Catchment Population) × 1,000',
    mathExplanation: 'Divides active trade area fueling positions by the Census population in thousands.',
    dataSources: ['US Census Bureau population counts', 'OpenStreetMap pump audits'],
    benchmarks: {
      good: '< 2.8 Pumps / 1k Pop (Undersupplied) — High queues at existing sites; unmet demand',
      moderate: '2.8 – 4.2 Pumps / 1k Pop (Balanced) — Matches US national baseline (~3.8)',
      poor: '> 5.5 Pumps / 1k Pop (Oversupplied) — Severe dispenser glut; margin compression'
    },
    strategicUsage: 'Quickly filters out over-retailed suburbs from high-growth commuter growth zones during rapid portfolio screening.',
    practicalExample: 'A booming Sunbelt suburb with 35,000 residents but only 48 pumps has 1.37 pumps/1k pop, indicating massive pent-up demand for a new 16-pump station.',
    decisionRule: 'Target trade areas with Pumps/1k < 3.0 for premium returns on new forecourt builds.'
  },
  {
    id: 'huff-cannibalization',
    name: 'Huff Gravity Model Cannibalization Draw',
    category: 'cannibalization',
    categoryLabel: 'Network Risk & Cannibalization',
    abbreviation: 'Cannibalization %',
    tagline: 'Projected volumetric diversion from existing sister stations in the portfolio.',
    definition: 'Calculates the probability that existing customers at sister stores within an 8.5-mile radius will switch to the new proposed site based on relative store square footage, pump counts, and spatial travel impedance.',
    formula: 'P_ij = (S_j / (T_ij)^λ) / ∑ [ S_k / (T_ik)^λ ]   where λ = 2.0 (distance friction)',
    mathExplanation: 'Uses store attraction size (S) over driving travel time (T) squared to calculate customer diversion probabilities for every neighborhood centroid.',
    dataSources: ['Huff Gravity Spatial Retail Model', 'Internal portfolio location database', 'OpenStreetMap OSRM routing network'],
    benchmarks: {
      good: '< 8% Cannibalization Draw — Clean greenfield capture with minimal portfolio dilution',
      moderate: '8% – 15% Cannibalization Draw — Acceptable infill expansion with positive net EBITDA lift',
      poor: '> 18% Cannibalization Draw — Severe portfolio self-cannibalization; negative net lift'
    },
    strategicUsage: 'Guarantees that new store openings generate true incremental profit for the corporation rather than merely shifting gallons between sister units.',
    practicalExample: 'Opening a new site 4.2 miles away from an existing company unit creates a projected 6.4% draw (18,000 gal/mo diverted), easily offset by 280,000 gal/mo of net new competitor capture.',
    decisionRule: 'Reject or re-site candidate parcels if Net Incremental EBITDA Lift is < 70% of gross projected earnings.'
  },
  {
    id: 'unmet-cstore-sales',
    name: 'Unmet Inside C-Store Sales Potential',
    category: 'financials',
    categoryLabel: 'Financial Feasibility & CapEx',
    abbreviation: 'Inside Sales ($/yr)',
    tagline: 'High-margin non-fuel retail and foodservice revenue capture potential.',
    definition: 'Projected annual gross revenue generated inside the convenience store from packaged goods, proprietary foodservice, prepared beverages, and impulse retail.',
    formula: 'Inside Sales ($) = Recommended SqFt × $720/SqFt  (or Unmet Gallons × $0.78 C-Store Spend/Gal)',
    mathExplanation: 'Calibrated from top-quartile NACS industry benchmarks ($650–$850 sales per square foot per year for modern travel center footprints).',
    dataSources: ['NACS State of the Industry Annual Reports', 'Census retail trade merchandise spending'],
    benchmarks: {
      good: '> $2.2M / year — High-volume retail engine generating $1.2M+ gross profit @ 55% margin',
      moderate: '$1.4M – $2.2M / year — Standard profitable convenience store operation',
      poor: '< $1.0M / year — Subscale kiosk footprint vulnerable to wage overhead'
    },
    strategicUsage: 'Fuel drives customer visits; inside sales drive bottom-line net profit. C-Store revenue is the primary driver of corporate EBITDA and franchise valuation multiples.',
    practicalExample: 'A 5,500 sq ft On the Run™ gourmet market is projected to generate $3.96M annual inside revenue, delivering $2.18M in gross profit at a 55% composite margin.',
    decisionRule: 'Design stores with ≥ 4,500 sq ft whenever trade area daytime worker population exceeds 15,000.'
  },
  {
    id: 'projected-ebitda-irr',
    name: 'Projected EBITDA & Unlevered IRR',
    category: 'financials',
    categoryLabel: 'Financial Feasibility & CapEx',
    abbreviation: 'EBITDA / IRR %',
    tagline: 'Operating cash flow and compound annualized return on invested capital.',
    definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortization (EBITDA) generated by the retail asset, paired with the Unlevered Internal Rate of Return (IRR) over a 10-year pro-forma horizon.',
    formula: 'EBITDA = Fuel Gross Profit + C-Store Gross Profit + Carwash/EV - (OpEx + Labor + Utilities)',
    mathExplanation: 'Fuel Gross Profit = Gallons × $0.38/gal margin; C-Store Gross Profit = Inside Sales × 55% margin. IRR calculates the discount rate equating initial CapEx ($5.5M) to discounted 10-year cash flows.',
    dataSources: ['OPIS Fuel Margin Indices', 'Retail Labor & Utility Cost Models', '10-Year DCF Pro-Forma Engine'],
    benchmarks: {
      good: 'IRR > 20% | Payback < 4.5 Years — Exceptional Tier-1 investment committee priority',
      moderate: 'IRR 14% – 20% | Payback 4.5 – 6.5 Years — Solid accretive growth asset',
      poor: 'IRR < 12% | Payback > 7.0 Years — Capital prohibitive; reconfigure or decline parcel'
    },
    strategicUsage: 'Direct hurdle-rate threshold used by executive leadership, private equity sponsors, and REIT landlords for capital allocation approval.',
    practicalExample: '$5.50M initial CapEx generating $1.28M annual EBITDA yields a 23.3% unlevered IRR with full capital payback in 4.3 years.',
    decisionRule: 'Require minimum 16.0% Unlevered IRR for corporate-owned real estate development.'
  },
  {
    id: 'aadt-traffic-flow',
    name: 'Annual Average Daily Traffic (AADT)',
    category: 'traffic_demographics',
    categoryLabel: 'Traffic & Demographics',
    abbreviation: 'AADT (Vehicles/Day)',
    tagline: '24-hour bidirectional vehicular volume passing directly along the parcel frontage.',
    definition: 'The total volume of vehicular traffic on a highway or arterial road segment for a year, divided by 365 days. Sourced directly from federal and state DOT sensor records.',
    formula: 'AADT = Annual Roadway Vehicle Count / 365 Days',
    mathExplanation: 'Corridors are classified by functional road hierarchy: Interstate/Freeway (> 65,000 AADT), Principal Arterial (35,000–65,000 AADT), Minor Arterial (18,000–35,000 AADT), and Collector (< 18,000 AADT).',
    dataSources: ['Federal Highway Administration (FHWA) Highway Performance Monitoring System (HPMS)', 'State DOT Traffic Databases'],
    benchmarks: {
      good: '> 35,000 AADT — Tier-1 high-volume commercial corridor with continuous customer flow',
      moderate: '20,000 – 35,000 AADT — Standard suburban arterial supporting neighborhood convenience',
      poor: '< 15,000 AADT — Low commuter flow; highly reliant on ultra-local residential repeat visits'
    },
    strategicUsage: 'Determines the required deceleration lane geometry, curb cut permitting, and total dispenser positions needed to handle rush-hour peaks.',
    practicalExample: 'A parcel on State Highway 249 with 46,500 AADT and 55 mph speed limit captures ~2.8% of passing traffic, generating 1,300 daily vehicle fill-ups.',
    decisionRule: 'Verify deceleration slip-lane access if corridor AADT > 40,000 to prevent customer ingress friction.'
  }
];

interface KpiGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedKpiId?: string;
}

export const KpiGlossaryModal: React.FC<KpiGlossaryModalProps> = ({
  isOpen,
  onClose,
  initialSelectedKpiId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeKpiId, setActiveKpiId] = useState<string>(
    initialSelectedKpiId || KPI_GLOSSARY_DATABASE[0].id
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync if initialSelectedKpiId changes externally
  React.useEffect(() => {
    if (initialSelectedKpiId) {
      setActiveKpiId(initialSelectedKpiId);
      // Ensure category matches if filtered
      const found = KPI_GLOSSARY_DATABASE.find(k => k.id === initialSelectedKpiId);
      if (found && selectedCategory !== 'all' && selectedCategory !== found.category) {
        setSelectedCategory('all');
      }
    }
  }, [initialSelectedKpiId]);

  // Handle ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const categories = [
    { id: 'all', label: 'All Platform KPIs', count: KPI_GLOSSARY_DATABASE.length },
    { id: 'market_share', label: 'Market Share & Dominance', count: KPI_GLOSSARY_DATABASE.filter(k => k.category === 'market_share').length },
    { id: 'supply_forecourt', label: 'Forecourt & Supply Void', count: KPI_GLOSSARY_DATABASE.filter(k => k.category === 'supply_forecourt').length },
    { id: 'financials', label: 'Feasibility, EBITDA & CapEx', count: KPI_GLOSSARY_DATABASE.filter(k => k.category === 'financials').length },
    { id: 'cannibalization', label: 'Cannibalization & Risk', count: KPI_GLOSSARY_DATABASE.filter(k => k.category === 'cannibalization').length },
    { id: 'traffic_demographics', label: 'Traffic & Demographics', count: KPI_GLOSSARY_DATABASE.filter(k => k.category === 'traffic_demographics').length },
  ];

  const filteredKpis = useMemo(() => {
    return KPI_GLOSSARY_DATABASE.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query || 
        item.name.toLowerCase().includes(query) ||
        item.tagline.toLowerCase().includes(query) ||
        item.definition.toLowerCase().includes(query) ||
        item.formula.toLowerCase().includes(query) ||
        item.abbreviation?.toLowerCase().includes(query) ||
        item.strategicUsage.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Active selected KPI item
  const currentKpi = useMemo(() => {
    return KPI_GLOSSARY_DATABASE.find(k => k.id === activeKpiId) || filteredKpis[0] || KPI_GLOSSARY_DATABASE[0];
  }, [activeKpiId, filteredKpis]);

  const handleCopyFormula = (formulaText: string, id: string) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="kpi-glossary-title"
        className="bg-slate-900 border border-slate-800 w-full max-w-6xl h-[92vh] max-h-[920px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="kpi-glossary-title" className="text-lg font-bold text-white tracking-tight">
                  Platform KPI & Underwriting Methodology Glossary
                </h2>
                <span className="text-[11px] font-mono text-purple-400 bg-purple-950/80 border border-purple-800 px-2 py-0.5 rounded-md">
                  V4.2 Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mathematical formulations, data lineage, benchmark thresholds, and corporate investment committee rules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Documentation (Esc)"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Sub-Bar: Search & Category Filter Pills */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search KPI by name, formula, or business use-case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-8 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  selectedCategory === cat.id ? 'bg-purple-800 text-purple-200' : 'bg-slate-900 text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Main Body: 2-Column Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
          {/* Left Column: KPI List Navigator */}
          <div className="md:col-span-4 lg:col-span-4 border-r border-slate-800 overflow-y-auto p-3 space-y-2 bg-slate-950/40 custom-scrollbar">
            {filteredKpis.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-bold text-slate-300">No KPIs Match Your Query</div>
                <div className="text-[11px] text-slate-500">
                  Try searching for terms like &quot;Moat&quot;, &quot;HHI&quot;, &quot;Pumps&quot;, or &quot;Cannibalization&quot;.
                </div>
              </div>
            ) : (
              filteredKpis.map((item) => {
                const isActive = item.id === (currentKpi?.id || '');
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveKpiId(item.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 group ${
                      isActive
                        ? 'bg-purple-950/40 border-purple-600/80 shadow-md shadow-purple-950/50'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                        {item.name}
                      </span>
                      {item.abbreviation && (
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800/60 shrink-0">
                          {item.abbreviation}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.tagline}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/50 mt-1">
                      <span>{item.categoryLabel}</span>
                      <span className="text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed KPI Underwriting Dossier */}
          <div className="md:col-span-8 lg:col-span-8 overflow-y-auto p-5 sm:p-7 space-y-6 bg-slate-900/50 custom-scrollbar">
            {currentKpi ? (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Header Banner for Selected KPI */}
                <div className="space-y-2 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{currentKpi.categoryLabel}</span>
                    <span className="text-slate-600">/</span>
                    <span className="font-mono text-slate-400">{currentKpi.abbreviation || currentKpi.id}</span>
                  </div>

                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {currentKpi.name}
                  </h3>
                  
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    {currentKpi.tagline}
                  </p>
                </div>

                {/* 1. Executive Definition */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-400" />
                    Executive Underwriting Definition
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {currentKpi.definition}
                  </div>
                </div>

                {/* 2. Mathematical Formulation & Lineage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-purple-400" />
                      Mathematical Formula & Logic
                    </h4>
                    <button
                      onClick={() => handleCopyFormula(currentKpi.formula, currentKpi.id)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedId === currentKpi.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Formula</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/60 space-y-2 font-mono text-xs sm:text-sm text-purple-200">
                    <div className="overflow-x-auto py-1 font-bold text-white tracking-wide">
                      {currentKpi.formula}
                    </div>
                    <div className="text-xs text-slate-300 font-sans border-t border-purple-900/40 pt-2 font-normal leading-relaxed">
                      {currentKpi.mathExplanation}
                    </div>
                  </div>

                  {/* Data Source Lineage */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-500">Live Data Lineage:</span>
                    {currentKpi.dataSources.map((ds, idx) => (
                      <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono text-[10px]">
                        {ds}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Underwriting Benchmark Thresholds */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    Performance Benchmark Bands
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/50 space-y-1">
                      <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Target / Optimal
                      </div>
                      <div className="text-xs text-emerald-200/90 leading-snug">
                        {currentKpi.benchmarks.good}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/50 space-y-1">
                      <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Moderate / Watch
                      </div>
                      <div className="text-xs text-amber-200/90 leading-snug">
                        {currentKpi.benchmarks.moderate}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-1">
                      <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-rose-400" />
                        Subscale / Warning
                      </div>
                      <div className="text-xs text-rose-200/90 leading-snug">
                        {currentKpi.benchmarks.poor}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Strategic Business Usage & Real Estate Decision Rule */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                      Strategic Business Usage
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentKpi.strategicUsage}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/80 space-y-2">
                    <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Investment Committee Decision Rule
                    </div>
                    <p className="text-xs text-purple-200 font-semibold leading-relaxed">
                      {currentKpi.decisionRule}
                    </p>
                  </div>
                </div>

                {/* 5. Real-World Corridor Case Study */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    Practical Corridor Case Study
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    &quot;{currentKpi.practicalExample}&quot;
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="text-sm font-bold text-white">Select a KPI from the left panel</div>
                <div className="text-xs text-slate-500">Inspect formula, benchmark bands, and business rationale.</div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer Bar */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Methodology conforms to NACS, FHWA, and DOJ Horizontal Merger Guidelines</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.print();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors cursor-pointer text-xs"
            >
              Done & Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
