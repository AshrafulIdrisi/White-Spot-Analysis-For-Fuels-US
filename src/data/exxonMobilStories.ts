import { WhiteSpotCandidate } from '../types';

export interface CorporateStoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  narrative: string;
  strategicTakeaways: string[];
  keyMetrics: { label: string; value: string; trend?: string; color?: string }[];
  visualType: 'challenge' | 'geospatial' | 'forecourt' | 'financial' | 'cannibalization' | 'boardroom';
  visualData?: any;
  actionCallout?: {
    buttonText: string;
    targetTab: string;
    description: string;
  };
}

export interface CorporateStory {
  id: string;
  title: string;
  tagline: string;
  corporateBrand: 'ExxonMobil' | 'Chevron' | 'Shell' | 'BP' | 'CircleK' | 'Custom';
  brandAssetPillars: {
    fuelBrand: string;
    premiumFuel: string;
    cStoreBrand: string;
    carCareBrand: string;
    evBrand: string;
    loyaltyProgram: string;
  };
  businessProblemId: string;
  targetMarket: string;
  corridorCoordinates: { lat: number; lng: number; zoom: number; locationName: string };
  investmentSummary: {
    totalCapEx: number;
    projectedAnnualEbitda: number;
    projectedIrr: number;
    paybackYears: number;
    marketShareGainPct: number;
  };
  executiveHeroHeadline: string;
  executiveSummary: string;
  chapters: CorporateStoryChapter[];
  boardApprovalStatus: 'READY_FOR_INVESTMENT_COMMITTEE' | 'UNDER_DUE_DILIGENCE' | 'APPROVED_BOARD_ALLOCATION';
}

export const EXXONMOBIL_CORPORATE_PROFILE = {
  name: 'ExxonMobil Corporation',
  division: 'Global Downstream, Fuels & Lubricants Retail Division',
  brandFamily: {
    primaryFuel: 'Exxon & Mobil Synergy Fuels',
    premiumGas: 'Synergy Supreme+™ 93 Octane (2X Cleaning Power)',
    commercialDiesel: 'Synergy Diesel Efficient™ (Fleet Fueling)',
    cStore: 'On the Run™ & Mobil Mart™',
    carCare: 'Mobil 1™ Lube Express / Mobil 1 Car Care Center',
    evCharging: 'Mobil EV™ Ultra-Fast Charging (350kW DC Fast)',
    loyalty: 'Exxon Mobil Rewards+™ & Speedpass+'
  },
  strategicPriorities: [
    'Expand Company-Operated (Co/Co) High-Throughput Travel Oasis Footprint in Sunbelt',
    'Capture 35%+ Premium Fuel Ratio via Synergy Supreme+ High-Margin Blends',
    'Transform Forecourt C-Store into High-Margin Gourmet Food Service & Bean-to-Cup Coffee',
    'Deploy High-Power Mobil EV Charging along Federally Designated NEVI Corridors',
    'Protect Neighboring Branded Wholesalers/Distributors via Cannibalization Guardrails'
  ]
};

export const PRESET_CORPORATE_STORIES: CorporateStory[] = [
  {
    id: 'story-exxonmobil-sunbelt-conquest',
    title: 'The Sunbelt Corridor Conquest: Beating Mega-Formats in North Texas',
    tagline: 'How ExxonMobil out-positions Buc-ee’s, Wawa, and QuikTrip along high-growth commuter arterials through modern 16-MPD On the Run Travel Oasis hubs.',
    corporateBrand: 'ExxonMobil',
    brandAssetPillars: {
      fuelBrand: 'Mobil Synergy™ Fuel',
      premiumFuel: 'Synergy Supreme+ 93 Octane',
      cStoreBrand: 'On the Run Gourmet Market',
      carCareBrand: 'Mobil 1 Lube Express',
      evBrand: 'Mobil EV High-Power Hub',
      loyaltyProgram: 'Exxon Mobil Rewards+ (14M Active App Users)'
    },
    businessProblemId: 'prob-supply-void',
    targetMarket: 'North Texas / Katy-Houston High-Growth Arterials',
    corridorCoordinates: {
      lat: 29.9845,
      lng: -95.7532,
      zoom: 13,
      locationName: 'US-290 & Grand Parkway North Corridor, Cypress / Houston, TX'
    },
    investmentSummary: {
      totalCapEx: 5850000,
      projectedAnnualEbitda: 980000,
      projectedIrr: 28.4,
      paybackYears: 4.1,
      marketShareGainPct: 34.0
    },
    executiveHeroHeadline: 'Capturing a 140,000 Gallon/Month Supply Vacuum in the Fastest Growing Commute Belt in Texas',
    executiveSummary: 'ExxonMobil Downstream Strategy team has identified a critical supply void in the US-290 Grand Parkway corridor. Over 18,000 new master-planned homes have been built within 3 miles over the last 36 months, yet the nearest modern branded fuel retail facility is 4.8 miles away. By deploying a premier 16-MPD forecourt paired with an On the Run fresh kitchen and 8-stall Mobil EV hub, ExxonMobil can capture $980,000 annual EBITDA with a 28.4% unlevered IRR.',
    boardApprovalStatus: 'READY_FOR_INVESTMENT_COMMITTEE',
    chapters: [
      {
        id: 'chap-1-challenge',
        chapterNumber: 1,
        title: 'The Macro Challenge: Market Share Erosion vs Modern Retailers',
        subtitle: 'Why legacy 4-pump dealer stations are losing suburban share to 6,000 sq ft convenience giants.',
        narrative: 'Over the last decade, regional competitors (Buc-ee’s, QuikTrip, Wawa, RaceTrac) have reshaped consumer expectations. Commuters no longer stop at cramped, fuel-only kiosks. They demand clean restrooms, fresh barista coffee, artisan grab-and-go food, and high-speed multi-product dispensers. In high-growth Sunbelt nodes, ExxonMobil has historically relied on third-party dealer networks that lack the capital to build flagship travel hubs. This creates an urgent corporate imperative: deploy strategic company-backed capital to plant high-throughput flagship flagpoles before competitors lock up prime hard corners.',
        strategicTakeaways: [
          'Legacy fuel-only kiosks convert only 22% of forecourt drivers to inside c-store transactions.',
          'Modern 6,000 sq ft On the Run formats achieve a 54% inside conversion rate and $720/sq ft merchandise sales.',
          'Securing the premier morning-commute outbound hard corner creates a durable 25-year defensive moat.'
        ],
        keyMetrics: [
          { label: 'Corridor Traffic Volume', value: '58,400 AADT', trend: '+4.2% YoY Growth', color: 'text-cyan-400' },
          { label: 'Trade Area Unmet Demand', value: '1.42M Gal/Yr', trend: 'Severe Deficit', color: 'text-emerald-400' },
          { label: 'Competitor Density (3-Mile)', value: '1 Legacy Kiosk', trend: 'Under-served', color: 'text-amber-400' }
        ],
        visualType: 'challenge',
        actionCallout: {
          buttonText: 'View Corridor Supply Void',
          targetTab: 'whitespots',
          description: 'Inspect the live algorithmic supply-demand score for this corridor.'
        }
      },
      {
        id: 'chap-2-geospatial',
        chapterNumber: 2,
        title: 'Geospatial Ground Truth: The US-290 / Grand Parkway Opportunity Void',
        subtitle: 'Validating trade-area demographics, traffic counts, and competitor displacement with live OpenStreetMap data.',
        narrative: 'Geospatial intelligence reveals that the 3-mile trade area contains 68,400 residents with an affluent median household income of $94,500. Morning commuter traffic flows outbound toward major commercial job centers with 58,400 daily vehicles passing the site. The nearest competitor is a legacy 6-pump station that suffers from severe bottleneck queues during peak 7:00 AM – 9:00 AM hours. Our proposed parcel sits at a fully signalized intersection with dedicated deceleration turn lanes.',
        strategicTakeaways: [
          'High morning rush capture: Site sits on the right-hand outbound commute side of arterial road.',
          'Affluent customer base aligns perfectly with Synergy Supreme+ premium gasoline uptake (modeled at 38% vs 22% national average).',
          'Zero direct modern food service competition within 2.5 radial miles.'
        ],
        keyMetrics: [
          { label: '3-Mile Population', value: '68,400', trend: '+3.6% Ann. Growth', color: 'text-white' },
          { label: 'Median Household Income', value: '$94,500', trend: 'Top 15% in Metro', color: 'text-emerald-400' },
          { label: 'Distance to Nearest Station', value: '4.8 Miles', trend: 'Clean Buffer', color: 'text-cyan-400' }
        ],
        visualType: 'geospatial',
        actionCallout: {
          buttonText: 'Open Live OSM Map Node',
          targetTab: 'map',
          description: 'Fly to the exact latitude and longitude with OpenStreetMap POI layers active.'
        }
      },
      {
        id: 'chap-3-forecourt',
        chapterNumber: 3,
        title: 'The ExxonMobil Forecourt Blueprint: Synergy™ + On the Run™ + Mobil EV™',
        subtitle: 'Designing a modern 3-acre multi-energy retail campus tailored for 2026-2035 customer behaviors.',
        narrative: 'We have configured a flagship master layout: 16 high-throughput Multi-Product Dispensers (32 fueling positions) featuring dual-sided EMV contactless pay and Speedpass+ integration. A 6,200 sq ft On the Run c-store features an open gourmet kitchen, bean-to-cup coffee bar, cold beverage cave, and luxury spotless restrooms. In addition, an 8-stall Mobil EV 350kW DC fast-charging plaza is placed on the northern parcel perimeter, maximizing dwell time and generating high-margin food and beverage basket spend while vehicles charge.',
        strategicTakeaways: [
          '16 MPDs provide zero-wait fueling during peak commute spikes, maximizing throughput.',
          'High-speed Mobil EV 350kW chargers capture EV drivers with an average 22-minute dwell time ($16.80 avg inside basket).',
          'Touchless Mobil 1 Express Car Wash generates $280,000/yr high-margin recurring subscription revenue.'
        ],
        keyMetrics: [
          { label: 'Forecourt Fueling Positions', value: '32 Nozzles (16 MPDs)', trend: 'High Throughput', color: 'text-cyan-400' },
          { label: 'C-Store Building Footprint', value: '6,200 Sq Ft', trend: 'Full Kitchen Format', color: 'text-white' },
          { label: 'Mobil EV Fast Chargers', value: '8 x 350kW Ports', trend: 'NEVI Compliant', color: 'text-emerald-400' }
        ],
        visualType: 'forecourt',
        actionCallout: {
          buttonText: 'Customize in Store Builder',
          targetTab: 'store-builder',
          description: 'Tweak dispensers, c-store kitchen footprint, and car wash modules in real time.'
        }
      },
      {
        id: 'chap-4-financial',
        chapterNumber: 4,
        title: 'Financial Underwriting & Pro-Forma Economics: $980K EBITDA & 28.4% IRR',
        subtitle: 'Capital allocation breakdown, EIA regional fuel margin modeling, and 10-year discounted cash flow.',
        narrative: 'Underwriting demonstrates compelling return metrics for ExxonMobil capital. Total CapEx of $5.85M ($2.1M land acquisition, $2.45M building & forecourt, $750k tanks/canopy/pumps, $550k EV/car wash) generates $3.2M in annual fuel gallons at a blended 34.5¢/gallon retail margin ($1.10M gross fuel margin). Inside merchandise sales generate $4.2M gross sales at 36% margin ($1.51M gross profit). After $1.63M in operating expenses and labor, steady-state annual EBITDA reaches $980,000.',
        strategicTakeaways: [
          'Unlevered IRR of 28.4% comfortably beats ExxonMobil Downstream hurdle rate of 15.0%.',
          'Payback achieved in 4.1 years; 10-Year NPV at 9.0% WACC is $4.62M.',
          'Synergy Supreme+ premium fuel share generates +$145,000 incremental margin above regular gasoline.'
        ],
        keyMetrics: [
          { label: 'Total Initial CapEx', value: '$5,850,000', trend: 'Turnkey All-In', color: 'text-white' },
          { label: 'Projected Annual EBITDA', value: '$980,000 / yr', trend: 'Steady-State Y2', color: 'text-emerald-400' },
          { label: 'Unlevered Project IRR', value: '28.4%', trend: 'Hurdle: 15.0%', color: 'text-cyan-400' },
          { label: 'Capital Payback Period', value: '4.1 Years', trend: 'Low Risk', color: 'text-amber-400' }
        ],
        visualType: 'financial',
        actionCallout: {
          buttonText: 'View DCF & Pro-Forma Engine',
          targetTab: 'financials',
          description: 'Run 10-year sensitivity scenarios on fuel margin volatility and basket size.'
        }
      },
      {
        id: 'chap-5-cannibalization',
        chapterNumber: 5,
        title: 'Sister Store Protection & Competitor Displacement Matrix',
        subtitle: 'Ensuring 88% of volume is net-new share stolen from competitors rather than cannibalizing existing ExxonMobil dealers.',
        narrative: 'A vital concern for corporate leadership is dealer relations and existing retail network harmony. Geospatial drive-time boundary analysis confirms that the nearest ExxonMobil branded dealer is 5.2 miles southeast across the US-290 highway divider, outside the primary 7-minute morning commute trade area. Over 88% of projected gallons will be diverted directly from competitor locations (Valero, Shell legacy dealer, and an unbranded independent). Modeled internal cannibalization is negligible at 2.4% ($23,000 EBITDA impact), creating an overwhelming net positive portfolio expansion.',
        strategicTakeaways: [
          '5.2-mile physical distance and highway median isolate existing ExxonMobil dealer catchment.',
          'Loyalty app data indicates over 4,200 Exxon Mobil Rewards+ members live in the primary trade area and currently purchase competitor fuel due to lack of an ExxonMobil station.',
          'Strengthens ExxonMobil metro market share from 18.2% to 22.4% across the northwest quadrant.'
        ],
        keyMetrics: [
          { label: 'Net Incremental Gallons', value: '88.2%', trend: 'Stolen from Rivals', color: 'text-emerald-400' },
          { label: 'Sister Store Impact', value: '-2.4%', trend: 'Well Below 6% Max', color: 'text-cyan-400' },
          { label: 'New Rewards+ App Captures', value: '4,200+ Drivers', trend: 'Immediate Base', color: 'text-white' }
        ],
        visualType: 'cannibalization',
        actionCallout: {
          buttonText: 'Inspect Competitor Intelligence',
          targetTab: 'competitors',
          description: 'Review competitor pump count, fuel margins, and price positioning.'
        }
      },
      {
        id: 'chap-6-boardroom',
        chapterNumber: 6,
        title: 'Investment Committee Recommendation & Execution Roadmap',
        subtitle: 'Formal request for $5.85M capital appropriation and 9-month development timeline.',
        narrative: 'The Corporate Development & Downstream Strategy team formally recommends proceeding with parcel acquisition and permitting for the US-290 Grand Parkway site. The transaction is structured with a 60-day due diligence feasibility study followed by a 9-month turnkey design-build schedule. Phase 1 Environmental Site Assessment (ESA) and preliminary TxDOT driveway access permits are pre-qualified. This asset serves as the flagship prototype for ExxonMobil’s 2026-2030 Sunbelt Expansion program.',
        strategicTakeaways: [
          'Immediate action: Execute 60-day Purchase & Sale Agreement (PSA) option for $2.1M land parcel.',
          'Submit expedited TxDOT deceleration lane and Harris County underground storage tank (UST) permit filings.',
          'Groundbreaking scheduled for Q1 with grand opening targeted before Q4 holiday travel surge.'
        ],
        keyMetrics: [
          { label: 'Board Recommendation', value: 'UNANIMOUS APPROVAL', trend: 'Strong Buy', color: 'text-emerald-400' },
          { label: '10-Year Project NPV', value: '$4.62 Million', trend: '@ 9.0% Discount', color: 'text-cyan-400' },
          { label: 'Target Completion Date', value: '9 Months from PSA', trend: 'On Schedule', color: 'text-white' }
        ],
        visualType: 'boardroom',
        actionCallout: {
          buttonText: 'Export Investment Committee Memo',
          targetTab: 'reports',
          description: 'Generate board-ready PDF/Word executive memo and formal pro-forma tables.'
        }
      }
    ]
  },
  {
    id: 'story-exxonmobil-synergy-premium',
    title: 'Synergy Supreme+ Premiumization & High-Margin Food Turnaround',
    tagline: 'Converting a struggling fuel-only dealer kiosk into an affluent suburban On the Run flagship delivering 38% Synergy Supreme+ premium fuel penetration.',
    corporateBrand: 'ExxonMobil',
    brandAssetPillars: {
      fuelBrand: 'ExxonMobil Synergy™ Technology',
      premiumFuel: 'Synergy Supreme+ 93 Octane',
      cStoreBrand: 'On the Run Artisan Bistro & Market',
      carCareBrand: 'Mobil 1 Lube Express & Wash',
      evBrand: 'Mobil EV Charging',
      loyaltyProgram: 'Exxon Mobil Rewards+ Premium Tier'
    },
    businessProblemId: 'prob-low-margin-turnaround',
    targetMarket: 'Affluent Suburbs (Plano / Frisco / North Dallas, TX)',
    corridorCoordinates: {
      lat: 33.0198,
      lng: -96.6989,
      zoom: 14,
      locationName: 'Legacy Drive & Dallas North Tollway Corridor, Plano, TX'
    },
    investmentSummary: {
      totalCapEx: 3450000,
      projectedAnnualEbitda: 780000,
      projectedIrr: 31.2,
      paybackYears: 3.6,
      marketShareGainPct: 29.0
    },
    executiveHeroHeadline: 'Upgrading Low-Margin Fuel Kiosk to a High-Yield Food & Premium Fuel Destination',
    executiveSummary: 'In the high-income corridor of North Dallas ($118,000 median income), a legacy 8-pump kiosk is generating thin margins of 19¢/gal with minimal inside sales ($35,000/mo). By razing the kiosk and building a 5,500 sq ft On the Run fresh kitchen with bean-to-cup coffee, artisan food, and Mobil 1 express lube, ExxonMobil can quadruple inside sales to $180,000/mo and achieve a 38% Synergy Supreme+ premium ratio, boosting annual EBITDA by $520,000.',
    boardApprovalStatus: 'APPROVED_BOARD_ALLOCATION',
    chapters: [
      {
        id: 'chap-prem-1',
        chapterNumber: 1,
        title: 'The Problem: The Margin Trap of Commoditized Fuel Sales',
        subtitle: 'Why operating small 1,500 sq ft kiosks in wealthy suburbs leaves massive profit on the table.',
        narrative: 'High-income drivers driving luxury vehicles and premium SUVs (BMW, Mercedes, Lexus, Porsche, Cadillac) demand premium 93-octane fuel and high-quality fresh food. When they encounter dated kiosks with unkempt restrooms and stale snacks, they bypass the site for upscale competitors. The current site only captures 18% Synergy Supreme+ fuel mix and $0.90 inside spend per fuel transaction.',
        strategicTakeaways: [
          'Wealthy trade area ($118k median income) has a 42% luxury vehicle registration rate.',
          'Synergy Supreme+ generates a 55¢/gallon retail margin versus 24¢ on regular 87 octane.',
          'Fresh QSR food programs generate 58% gross margins vs 26% on packaged tobacco/snacks.'
        ],
        keyMetrics: [
          { label: 'Trade Area Median Income', value: '$118,200', trend: 'Affluent Suburban', color: 'text-emerald-400' },
          { label: 'Current Supreme+ Mix', value: '18.4%', trend: 'Underperforming', color: 'text-amber-400' },
          { label: 'Target Supreme+ Mix', value: '38.0%', trend: '+19.6% Upside', color: 'text-cyan-400' }
        ],
        visualType: 'challenge'
      },
      {
        id: 'chap-prem-2',
        chapterNumber: 2,
        title: 'The Transformation: On the Run™ Artisan Market & Mobil 1™ Car Care',
        subtitle: 'Rebuilding the asset with luxury amenities, espresso bar, and express car care.',
        narrative: 'The redevelopment replaces the kiosk with a 5,500 sq ft On the Run store featuring artisan hot sandwiches, cold-pressed juices, an extensive wine selection, and spotless touchless restrooms. Outside, 6 new dispensers feature digital pump video displays promoting Exxon Mobil Rewards+ and Mobil 1 motor oil. A 2-bay Mobil 1 Lube Express provides 15-minute synthetic oil changes, creating a powerhouse automotive retail cluster.',
        strategicTakeaways: [
          'Mobil 1 Lube Express adds $260,000 in high-margin service revenue with a 65% cross-fuel attachment rate.',
          'Gourmet coffee & breakfast program captures morning commuters with high repeat loyalty.',
          'Forecourt canopy refreshed with signature ExxonMobil red-and-blue LED halo lighting.'
        ],
        keyMetrics: [
          { label: 'Total Retrofit CapEx', value: '$3,450,000', trend: 'Site Modernization', color: 'text-white' },
          { label: 'Incremental Annual EBITDA', value: '+$520,000', trend: '+180% Lift', color: 'text-emerald-400' },
          { label: 'Inside Merchandise Sales', value: '$2,160,000 / yr', trend: '$400/sq ft', color: 'text-cyan-400' }
        ],
        visualType: 'forecourt'
      },
      {
        id: 'chap-prem-3',
        chapterNumber: 3,
        title: 'Financial Payback & Boardroom Verdict',
        subtitle: 'Rapid 3.6-year capital payback with 31.2% unlevered IRR.',
        narrative: 'The redevelopment underwrites with extraordinary efficiency due to existing utility connections and parcel ownership. EBITDA expands from $260,000 to $780,000 annually. Capital payback is achieved in 3.6 years. The Investment Committee has authorized immediate project mobilization.',
        strategicTakeaways: [
          'Immediate CapEx authorization approved by ExxonMobil Retail Committee.',
          'Blueprint to be replicated across 14 additional Tier-1 suburban Texas locations in 2026-2027.',
          'Generates strong brand equity and customer lifetime value for ExxonMobil Rewards+.'
        ],
        keyMetrics: [
          { label: 'Project IRR', value: '31.2%', trend: 'Top Tier ROI', color: 'text-emerald-400' },
          { label: 'Payback Period', value: '3.6 Years', trend: 'Rapid Cash Recovery', color: 'text-cyan-400' },
          { label: 'Status', value: 'APPROVED', trend: 'Mobilizing', color: 'text-white' }
        ],
        visualType: 'boardroom'
      }
    ]
  },
  {
    id: 'story-exxonmobil-freight-fleet',
    title: 'Interstate Freight Arterial & Synergy Diesel Efficient™ Cardlock',
    tagline: 'Capturing Class 7-8 commercial logistics trucks and regional freight fleets along I-10 and I-35 corridor logistics hubs.',
    corporateBrand: 'ExxonMobil',
    brandAssetPillars: {
      fuelBrand: 'Synergy Diesel Efficient™',
      premiumFuel: 'Synergy Supreme+ (Passenger forecourt)',
      cStoreBrand: 'On the Run Mega Travel Center',
      carCareBrand: 'Mobil Delvac™ Heavy Duty Fleet Center',
      evBrand: 'Mobil EV Commercial Mega-Charger',
      loyaltyProgram: 'ExxonMobil Fleet National Card & B2B Fuel Account'
    },
    businessProblemId: 'prob-highway-commute',
    targetMarket: 'I-10 & I-35 Freight Logistics Corridors (San Antonio / Austin / Houston Triangle)',
    corridorCoordinates: {
      lat: 29.5841,
      lng: -97.9654,
      zoom: 13,
      locationName: 'I-10 Logistics Junction & State Hwy 130, Seguin / San Antonio, TX'
    },
    investmentSummary: {
      totalCapEx: 7200000,
      projectedAnnualEbitda: 1250000,
      projectedIrr: 26.8,
      paybackYears: 4.4,
      marketShareGainPct: 38.5
    },
    executiveHeroHeadline: 'Dominating Texas Triangle Freight Logistics with High-Speed Synergy Diesel Efficient & National Fleet Accounts',
    executiveSummary: 'The Texas Triangle (Houston–Dallas–San Antonio) moves over 60% of all Texas freight. Along I-10 near major industrial distribution centers, long-haul and regional delivery fleets lack high-speed DEF/diesel cardlock fueling with clean amenities. ExxonMobil can deploy a 6-acre dual-canopy travel center (8 high-speed master/satellite diesel lanes + 12 passenger MPDs) generating 5.4M gallons annually and $1.25M EBITDA.',
    boardApprovalStatus: 'READY_FOR_INVESTMENT_COMMITTEE',
    chapters: [
      {
        id: 'chap-fleet-1',
        chapterNumber: 1,
        title: 'The Logistics Void: Freight Congestion along the I-10 Trade Vein',
        subtitle: 'Over 22,000 commercial trucks daily pass this interchange without a high-speed ExxonMobil fleet fueling facility.',
        narrative: 'National B2B logistics fleets (Amazon, Walmart, FedEx, Sysco, regional flatbeds) carrying ExxonMobil Fleet National Cards are forced to divert off-route to Pilot Flying J or Love’s due to a lack of dedicated high-speed master/satellite diesel dispensers. Capturing this freight corridor unlocks immense high-volume diesel throughput with long-term B2B contract stability.',
        strategicTakeaways: [
          'High-speed master-satellite pumps fill an 80-gallon commercial tank in under 4 minutes.',
          'Bulk Diesel Exhaust Fluid (DEF) at pump generates 48¢/gal high-margin add-on.',
          'ExxonMobil Fleet Card guarantees captive institutional customer base from Day 1.'
        ],
        keyMetrics: [
          { label: 'Daily Heavy Truck Flow', value: '22,400 HDVs', trend: 'High Density', color: 'text-cyan-400' },
          { label: 'Projected Diesel Gallons', value: '3.8M Gal/Yr', trend: 'Commercial Volume', color: 'text-emerald-400' },
          { label: 'Commercial DEF Gallons', value: '320k Gal/Yr', trend: 'High Margin Add-on', color: 'text-white' }
        ],
        visualType: 'challenge'
      },
      {
        id: 'chap-fleet-2',
        chapterNumber: 2,
        title: 'Dual-Canopy Campus: Passenger Oasis + Commercial Truck Plaza',
        subtitle: 'Separating passenger cars from 18-wheelers for optimal safety, speed, and customer satisfaction.',
        narrative: 'The site features a bifurcated 6-acre layout: Front forecourt with 12 passenger MPDs (24 fueling positions) and a 7,000 sq ft On the Run Travel Center; Rear forecourt with 8 high-speed commercial truck lanes, bulk DEF, Mobil Delvac heavy-duty engine oil display, and dedicated truck parking. Driver amenities include private luxury shower suites and trucker lounge.',
        strategicTakeaways: [
          'Complete physical separation prevents passenger car intimidation by 18-wheelers.',
          'Driver amenities boost inside merchandise spend to $24.50 per commercial stop.',
          'Site pre-plumbed for future Hydrogen / Megawatt EV charging infrastructure.'
        ],
        keyMetrics: [
          { label: 'Total Land Parcel', value: '6.2 Acres', trend: 'Interstate Hard Corner', color: 'text-white' },
          { label: 'Annual Total Gallons', value: '5,400,000', trend: 'Top 5% in Network', color: 'text-emerald-400' },
          { label: 'Projected EBITDA', value: '$1,250,000 / yr', trend: 'Institutional Yield', color: 'text-cyan-400' }
        ],
        visualType: 'forecourt'
      },
      {
        id: 'chap-fleet-3',
        chapterNumber: 3,
        title: 'Investment Committee Pro-Forma & Decision',
        subtitle: '$7.2M CapEx yielding 26.8% IRR and $1.25M annual cash flow.',
        narrative: 'With conservative diesel margin assumptions (22¢/gal commercial contract floor) and strong inside travel center retail margins, this flagship facility establishes an unassailable commercial beachhead along the I-10 freight corridor.',
        strategicTakeaways: [
          'Pre-contracted fleet commitments cover 45% of Year 1 target diesel gallons.',
          'Projected payback is 4.4 years with durable 30+ year cash flow longevity.',
          'Executive recommendation: APPROVE site acquisition and TxDOT highway deceleration permit.'
        ],
        keyMetrics: [
          { label: 'Project IRR', value: '26.8%', trend: 'Strong Commercial Hurdle', color: 'text-emerald-400' },
          { label: 'Payback Period', value: '4.4 Years', trend: 'Capital Safe', color: 'text-cyan-400' },
          { label: 'Board Verdict', value: 'READY FOR IC', trend: 'Priority 1', color: 'text-white' }
        ],
        visualType: 'boardroom'
      }
    ]
  }
];
