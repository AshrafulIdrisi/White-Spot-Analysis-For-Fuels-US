import { BusinessProblemTemplate } from '../types';

export const BUSINESS_PROBLEMS_CATALOG: BusinessProblemTemplate[] = [
  {
    id: 'prob-supply-void',
    title: 'Trade Area Supply Deficit & High-Growth Unmet Demand',
    category: 'GROWTH_EXPANSION',
    badge: 'High ROI Opportunity',
    shortDescription: 'Identify underserved high-AADT suburban growth corridors where rapid housing expansion outpaces existing fuel pumps and modern convenience retail.',
    fullProblemStatement: 'In high-velocity suburban growth markets (such as North Texas, Central Florida, and the Phoenix East Valley), new residential subdivisions add 4,000–8,000 residents annually, yet existing fueling infrastructure remains limited to legacy 4-to-6 pump gas stations without prepared food or modern amenities. This creates massive pump congestion, high customer dissatisfaction, and an immense unmet market demand.',
    keyMetricsToOptimize: [
      'Unmet Trade Area Demand Gallons (185k gal/pump deficit)',
      'Inside Sales Void ($750+/sq ft potential)',
      'Corridor AADT Traffic Density (40,000+ vehicles/day)',
      'Competitor Modernity Gap (absence of QSR kitchen & clean restrooms)'
    ],
    recommendedPlaybook: [
      'Acquire 2.5–3.5 acre hard corner on primary morning commute outbound arterial.',
      'Deploy 16–20 fueling positions (8–10 MPDs) with wide 28ft lane spacing for high-throughput passenger vehicles.',
      'Construct a 6,000–7,500 sq ft modern C-store featuring a dedicated made-to-order food service kitchen and bean-to-cup coffee bar.',
      'Add 8 ultra-fast 350kW DC fast charging ports under dedicated canopy to future-proof customer acquisition.'
    ],
    diagnosticChecklist: [
      { check: '3-Mile Population Growth Rate > 2.5% YoY', status: 'passed', details: 'Target corridors show +3.4% average 5-year compound annual growth.' },
      { check: 'Trade Area Pump Deficit > 12 Positions', status: 'passed', details: 'Existing competitor capacity is deficient by 14–22 fueling nozzles.' },
      { check: 'Convenience Retail Space < 2.0 sq ft / capita', status: 'passed', details: 'Current trade area only provides 1.1 sq ft of modern retail space per resident.' },
      { check: 'Direct Hard Corner Signalized Ingress/Egress', status: 'warning', details: 'Requires TxDOT / DOT right-in, right-out and deceleration lane permit.' }
    ],
    impactProjection: {
      revenueLiftPct: 34.5,
      paybackMonthsReduction: 8,
      ebitdaBoostUsd: 840000,
      marketShareCapturePct: 36.0
    },
    defaultStoreBuilderPreset: {
      storeType: 'Fuel Station + C-Store',
      pumps: 16,
      cStoreSqFt: 6200,
      hasDieselHdv: true,
      evChargersCount: 8,
      hasCarWash: true,
      hasQsrKitchen: true,
      targetAadt: 58000,
      targetPop: 68000,
      targetCorridorName: 'North Texas Rapid Suburban Growth Corridor'
    }
  },
  {
    id: 'prob-cannibalization',
    title: 'Network Cannibalization & Sister Store Protection',
    category: 'CANNIBALIZATION',
    badge: 'Risk Mitigation',
    shortDescription: 'Ensure new store expansion captures competitor market share rather than cannibalizing existing company-operated stores within a 3-mile radius.',
    fullProblemStatement: 'When growing aggressively within an existing metropolitan market, infill expansion risks drawing customers away from your existing company stores. Without trade-area drive-time modeling and origin-destination traffic flow analysis, new store openings can cause a 15–25% drop in sister store gallons, hurting overall portfolio profitability.',
    keyMetricsToOptimize: [
      'Sister Store Drive-Time Buffer (minimum 7-minute threshold)',
      'Natural Geographic Barriers (freeway medians, rivers, railway cuts)',
      'Net Incremental Gallons Ratio (> 82% from competitor share)',
      'Distinct Customer Demographic Targeting (Commuter vs Neighborhood)'
    ],
    recommendedPlaybook: [
      'Enforce a strict 2.5-mile minimum separation distance or natural highway barrier between company stores.',
      'Analyze directional commute flows: place the new site on the opposite commute direction (e.g., PM outbound vs AM inbound) of existing locations.',
      'Differentiate merchandise mix: if the existing store is an Express Fuel kiosk, build a full-format food service travel hub to capture different trip missions.',
      'Target high-traffic intersections that intercept traffic from major competing brands (e.g., Circle K, 7-Eleven, Speedway) before they reach competitor stores.'
    ],
    diagnosticChecklist: [
      { check: 'Distance to Nearest Sister Store > 2.5 Miles', status: 'passed', details: 'Nearest company-operated site is 3.4 miles away across major divided tollway.' },
      { check: 'Projected Sister Store Volume Impact < 6.0%', status: 'passed', details: 'Modeled cannibalization rate is 4.2% ($38,000 EBITDA risk), offset by $920,000 net new EBITDA.' },
      { check: 'Competitor Intercept Advantage Score > 80/100', status: 'passed', details: 'New location intercepts 62% of traffic prior to competitor cluster.' },
      { check: 'Shared Loyalty Program Cross-Promotional Lift', status: 'passed', details: 'App users gain reward network density, increasing total brand retention by 11%.' }
    ],
    impactProjection: {
      revenueLiftPct: 22.0,
      paybackMonthsReduction: 4,
      ebitdaBoostUsd: 650000,
      marketShareCapturePct: 28.5
    },
    defaultStoreBuilderPreset: {
      storeType: 'Fuel Station + C-Store',
      pumps: 14,
      cStoreSqFt: 5600,
      hasDieselHdv: false,
      evChargersCount: 6,
      hasCarWash: true,
      hasQsrKitchen: true,
      targetAadt: 46000,
      targetPop: 54000,
      targetCorridorName: 'Infill Market Intercept Node'
    }
  },
  {
    id: 'prob-low-margin-turnaround',
    title: 'Low Inside-Basket & Legacy Store Transformation',
    category: 'OPERATIONAL_TURNAROUND',
    badge: 'Value Creation',
    shortDescription: 'Transform low-margin fuel-only legacy stations into high-profit margin convenience retail and QSR prepared food profit centers.',
    fullProblemStatement: 'Legacy retail fuel sites generating thin margins (18–24¢/gallon) on commoditized fuel suffer during wholesale price volatility. Sites with small 1,500 sq ft kiosks generate less than $40,000/month in inside merchandise sales with low gross margin (28%). Transforming the asset into a high-margin food service destination boosts inside margin to 58%+.',
    keyMetricsToOptimize: [
      'Inside Gross Margin % (boost from 28% to 54%+)',
      'Fuel-to-C-Store Conversion Rate (boost from 24% to 52%)',
      'Average Inside Basket Size ($12.50+ target)',
      'Food Service & Specialty Beverage Sales Share (> 40% of inside sales)'
    ],
    recommendedPlaybook: [
      'Raze legacy kiosk or expand building footprint to 5,000+ sq ft with dedicated commercial QSR kitchen.',
      'Install touchless ordering kiosks, artisan bean-to-cup espresso machines, and a walk-in beer cave.',
      'Upgrade forecourt with modern EMV contactless dispensers and high-efficiency LED canopy lighting.',
      'Introduce a premium touchless rollover car wash with monthly recurring subscription membership.'
    ],
    diagnosticChecklist: [
      { check: 'Site Parcel Footprint >= 1.4 Acres for Expansion', status: 'passed', details: 'Existing lot has sufficient excess parking area to accommodate 5,200 sq ft building expansion.' },
      { check: 'Adequate Municipal Water & Grease Trap Utility Hookup', status: 'passed', details: 'Commercial 3-phase power and 4-inch sanitary sewer line verified.' },
      { check: 'Daytime Employment Density > 12,000 Workers in 3 Miles', status: 'passed', details: 'Nearby industrial parks and office campuses support lunch rush QSR demand.' },
      { check: 'Estimated ROI on Remodel > 24.5% IRR', status: 'passed', details: 'Projected $1.8M retrofit generates $480,000 in incremental annual cash flow.' }
    ],
    impactProjection: {
      revenueLiftPct: 48.0,
      paybackMonthsReduction: 12,
      ebitdaBoostUsd: 720000,
      marketShareCapturePct: 32.0
    },
    defaultStoreBuilderPreset: {
      storeType: 'Fuel Station + C-Store',
      pumps: 12,
      cStoreSqFt: 5400,
      hasDieselHdv: false,
      evChargersCount: 4,
      hasCarWash: true,
      hasQsrKitchen: true,
      targetAadt: 38000,
      targetPop: 48000,
      targetCorridorName: 'Legacy Retail Modernization Turnaround'
    }
  },
  {
    id: 'prob-highway-commute',
    title: 'Highway Deceleration & Commute Side-of-Road Optimization',
    category: 'COMMUTE_TRAFFIC',
    badge: 'Traffic Maximizer',
    shortDescription: 'Solve side-of-the-road placement, high-speed deceleration lane ingress, and rapid morning coffee/fuel commute trip missions.',
    fullProblemStatement: 'Morning commuters traveling at 55–70 mph will not make left turns across heavy traffic or make difficult U-turns to buy fuel and coffee. Situating a store on the wrong side of the road or lacking 300ft+ deceleration lanes reduces capture rates by up to 60%. Optimizing ingress geometry, morning drive-thru flow, and evening beer/dinner grab-and-go maximizes customer capture.',
    keyMetricsToOptimize: [
      'Highway Capture Rate % (increase from 1.2% to 3.8% of AADT)',
      'Ingress Sightline & Deceleration Distance (> 350 feet)',
      'Morning Peak Throughput (7:00 AM – 9:00 AM queue velocity)',
      'Drive-Thru Window Time (< 150 seconds per transaction)'
    ],
    recommendedPlaybook: [
      'Secure property on the morning (AM inbound) side of the commuter corridor with dedicated right-turn deceleration lane.',
      'Implement an efficient drive-thru lane wrapped around the rear of the C-store for rapid coffee and breakfast taco pickup.',
      'Configure wide canopy with angled pump fueling bays to eliminate queuing back-ups during morning rush hours.',
      'Erect high-visibility 60ft LED interstate pylon signage with real-time fuel price displays.'
    ],
    diagnosticChecklist: [
      { check: 'Corridor AADT > 50,000 Vehicles/Day', status: 'passed', details: 'Measured corridor volume is 64,000 AADT with 62% morning inbound directional split.' },
      { check: 'Deceleration Lane Length >= 300 Feet', status: 'passed', details: 'Highway permit allows 380-foot taper and deceleration lane.' },
      { check: 'Morning Peak Commute Share > 45% Daily Volume', status: 'passed', details: 'High commuter density delivers predictable morning volume spikes.' },
      { check: 'Dual Drive-Thru Order Point Capability', status: 'warning', details: 'Requires lot depth of 220ft to prevent drive-thru spillover into fueling lanes.' }
    ],
    impactProjection: {
      revenueLiftPct: 29.0,
      paybackMonthsReduction: 6,
      ebitdaBoostUsd: 590000,
      marketShareCapturePct: 26.0
    },
    defaultStoreBuilderPreset: {
      storeType: 'Fuel Station + C-Store',
      pumps: 16,
      cStoreSqFt: 5800,
      hasDieselHdv: true,
      evChargersCount: 8,
      hasCarWash: true,
      hasQsrKitchen: true,
      targetAadt: 62000,
      targetPop: 62000,
      targetCorridorName: 'High-Volume Commuter Expressway Node'
    }
  },
  {
    id: 'prob-ev-transition',
    title: 'EV Fast-Charging & Fleet Transition Hub Strategy',
    category: 'ENERGY_TRANSITION',
    badge: 'Future-Proofing',
    shortDescription: 'Deploy 8–16 port 350kW DC fast-charging plazas, capitalize on 25-minute charging dwell times, and unlock NEVI government grants.',
    fullProblemStatement: 'Electric vehicle market penetration is accelerating in Sunbelt and Western suburban markets. EV drivers experience 20–35 minute dwell times compared to 4 minutes for gas drivers. Traditional gas stations cannot monetize this dwell time without indoor seating, premium WiFi, upscale food service, and high-voltage grid interconnection.',
    keyMetricsToOptimize: [
      'EV Dwell Time Inside-Store Spend ($18.50+ average ticket)',
      'Substation Transformer Capacity (1.5 MW – 3.0 MW 3-phase grid hookup)',
      'NEVI Grant Co-Funding Eligibility ($500k–$1.2M capital subsidy)',
      'Charging Session Gross Margin (38–45% gross margin on $/kWh)'
    ],
    recommendedPlaybook: [
      'Co-locate 8–16 ultra-fast 350kW DC chargers under dedicated solar-canopy structure with digital queuing displays.',
      'Design indoor C-store customer lounge with high-speed WiFi, modern work bar counters, and clean luxury restrooms.',
      'Partner with regional utility for commercial fleet charging and time-of-use electrical rate discounts.',
      'Integrate charging billing directly with store loyalty mobile app to offer $2 off food items during active charging sessions.'
    ],
    diagnosticChecklist: [
      { check: 'Local Substation Power Capacity >= 2.0 MW Available', status: 'passed', details: 'Utility feeder line has existing 3-phase 12.47kV capacity available for dedicated transformer.' },
      { check: 'Trade Area EV Registration Share > 8.5%', status: 'passed', details: 'Local zip code EV adoption rate is 11.2% and growing at +35% YoY.' },
      { check: 'NEVI Corridor Compliant (< 1 Mile from Alternative Fuel Corridor)', status: 'passed', details: 'Directly on designated interstate corridor, eligible for up to 80% federal CapEx grant.' },
      { check: 'Indoor Lounge & Seating Area Allocated in C-Store', status: 'passed', details: 'Allocated 650 sq ft customer lounge with work tables and premium beverage bar.' }
    ],
    impactProjection: {
      revenueLiftPct: 41.0,
      paybackMonthsReduction: 10,
      ebitdaBoostUsd: 910000,
      marketShareCapturePct: 38.0
    },
    defaultStoreBuilderPreset: {
      storeType: 'EV Charging Hub',
      pumps: 12,
      cStoreSqFt: 6500,
      hasDieselHdv: false,
      evChargersCount: 16,
      hasCarWash: true,
      hasQsrKitchen: true,
      targetAadt: 52000,
      targetPop: 75000,
      targetCorridorName: 'Clean Energy Fast-Charging Travel Hub'
    }
  }
];
