export type MetricSourceType = 'MEASURED' | 'ESTIMATED' | 'MODELED' | 'ASSUMPTION';

export interface BaseLocation {
  id: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  state: string;
  county: string;
  zipCode: string;
  lat: number;
  lng: number;
  storeType: 'Fuel Station + C-Store' | 'Travel Plaza / Truck Stop' | 'Express Fuel' | 'Urban C-Store' | 'EV Charging Hub' | 'Fleet Fueling';
  isOpen: boolean;
  openingYear?: number;
  source: string;
  sourceDate: string;
  sourceType: MetricSourceType;
}

export interface FuelStationDetails {
  pumpsCount: number;
  fuelingPositions: number;
  cStoreSqFt: number;
  fuelTypes: string[];
  hasCarWash: boolean;
  hasEvChargers: boolean;
  evChargersCount?: number;
  hasQsrFood: boolean;
  qsrBrand?: string;
  hasDieselHdv: boolean;
  operatingHours: '24/7' | '5am-11pm' | '6am-10pm';
  ownershipType: 'Company Owned' | 'Dealer / Franchise' | 'Jobber Wholesale';
}

export interface Demographics {
  pop1Mile: number;
  pop3Mile: number;
  pop5Mile: number;
  households3Mile: number;
  medianIncome3Mile: number;
  vehicleOwnershipRate: number; // e.g. 0.94 (94%)
  annualPopGrowthRate: number; // e.g. 0.024 (2.4%)
  daytimeWorkers3Mile: number;
  retailSpendingIndex: number; // 100 is US average
}

export interface TrafficData {
  aadt: number; // Average Annual Daily Traffic
  roadClass: 'Interstate / Highway' | 'Principal Arterial' | 'Minor Arterial' | 'Major Collector';
  highwayAccess: boolean;
  nearbyIntersections: number;
  trafficSpeedMph: number;
  congestionIndex: number; // 1.0 - 5.0
}

export interface StoreFinancials {
  monthlyFuelVolumeGallons: number;
  avgFuelMarginCentsPerGal: number;
  monthlyCStoreRevenue: number;
  cStoreGrossMarginPct: number;
  monthlyOperatingExpenses: number;
  annualTotalRevenue: number;
  annualEbitda: number;
  sourceType: MetricSourceType;
}

export interface StoreFootfall {
  avgDailyVisits: number;
  peakHour: string;
  dwellTimeMinutes: number;
  repeatVisitorPct: number;
  weekdayVsWeekendRatio: number;
  sourceType: MetricSourceType;
}

export interface StoreLocationRecord extends BaseLocation {
  fuelDetails: FuelStationDetails;
  demographics: Demographics;
  traffic: TrafficData;
  financials?: StoreFinancials;
  footfall?: StoreFootfall;
  nearestCompetitorDistanceMiles: number;
  competitorsWithin3Miles: number;
  cannibalizationRiskScore: number; // 0 - 100
  marketShare3MilePct: number;
}

export interface ForecourtPumpsConfig {
  mpdCount: number; // Multi-product dispensers (e.g. 8, 12, 16)
  fuelingPositions: number; // MPD * 2 (e.g. 16, 24, 32)
  dieselHdvLanes: number; // High-speed diesel master/satellite lanes
  hasDefAtPump: boolean; // Diesel Exhaust Fluid at pump
  hasE85: boolean;
  evDcFastPorts: number; // e.g. 8 ports
  evPowerKw: number; // e.g. 350
  canopySqFt: number; // e.g. 6,800
  undergroundStorageTanksGallons: number; // e.g. 80,000 (3x 25k tanks)
  avgPumpsUtilizationPct: number; // e.g. 68%
}

export interface CStoreFootprintConfig {
  totalCStoreSqFt: number; // e.g. 5,500
  salesFloorSqFt: number; // e.g. 2,400
  foodServiceKitchenSqFt: number; // e.g. 1,400
  coffeeBeverageBarSqFt: number; // e.g. 550
  beerCaveSqFt: number; // e.g. 450
  restroomsSqFt: number; // e.g. 400
  backOfHouseStorageSqFt: number; // e.g. 300
  projectedSalesPerSqFtYear: number; // e.g. $740 / sq ft
  qsrFoodServiceMarginPct: number; // e.g. 58%
  packagedMerchandiseMarginPct: number; // e.g. 34%
  insideSalesShareFoodServicePct: number; // e.g. 42%
}

export interface WhiteSpotCandidate {
  id: string;
  candidateName: string;
  address: string;
  city: string;
  state: string;
  county: string;
  zipCode: string;
  lat: number;
  lng: number;
  opportunityScore: number; // 0 - 100
  demandScore: number; // 0 - 100
  supplyGapScore: number; // 0 - 100
  trafficScore: number; // 0 - 100
  competitionScore: number; // 0 - 100
  commercialScore: number; // 0 - 100
  financialScore: number; // 0 - 100
  growthScore: number; // 0 - 100
  confidenceLevel: 'High' | 'Medium' | 'Preliminary';
  riskLevel: 'Low' | 'Moderate' | 'High';
  modelVersion: string;
  primaryRationale: string[];
  dataGaps: string[];
  
  // Projections
  projectedAnnualFuelGallons: number;
  projectedAnnualCStoreRevenue: number;
  projectedAnnualTotalRevenue: number;
  projectedAnnualEbitda: number;
  projectedDailyFootfall: number;
  projectedMarketSharePct: number;
  
  // Feasibility
  estimatedCapEx: number;
  estimatedPaybackYears: number;
  estimatedIrrPct: number;
  estimatedNpv: number;

  // Context
  pop1Mile?: number;
  pop3Mile: number;
  pop5Mile?: number;
  medianIncome3Mile: number;
  medianHouseholdIncome?: number;
  aadt: number;
  nearestStationMiles: number;
  competitorCount3Miles: number;
  proposedStoreType: string;
  recommendedPumps: number;
  recommendedCStoreSqFt: number;
  sourceDate: string;

  // Advanced Forecourt & C-Store Architecture
  forecourtPumps?: ForecourtPumpsConfig;
  cStoreDetails?: CStoreFootprintConfig;
  tradeAreaPumpsSupplyDeficit?: number;
  tradeAreaCStoreSqFtDeficit?: number;
}

export interface CompetitorComparison {
  id: string;
  brand: string;
  name: string;
  distanceMiles: number;
  address: string;
  pumps: number;
  cStoreSqFt: number;
  estimatedDailyTraffic: number;
  estimatedDailyFootfall: number;
  estimatedMonthlyGallons: number;
  estimatedFuelPriceDifference: number; // in cents e.g. -2.5c
  amenities: string[];
  ratings: number;
  reviewsCount: number;
  marketSharePct: number;
  threatLevel: 'Dominant Leader' | 'Strong Challenger' | 'Moderate Competitor' | 'Aging / Vulnerable';
}

export interface ScoringWeights {
  demandPotential: number; // default 25
  trafficAccessibility: number; // default 20
  supplyGap: number; // default 20
  competitiveIntensity: number; // default 10
  commercialAttractiveness: number; // default 10
  financialFeasibility: number; // default 10
  growthPotential: number; // default 5
}

export interface FinancialScenarioConfig {
  landAcquisitionCost: number;
  constructionCost: number;
  equipmentCost: number;
  workingCapital: number;
  pumpsCount: number;
  cStoreSqFt: number;
  fuelVolumeMonthlyGal: number;
  fuelMarginCents: number;
  cStoreMonthlySales: number;
  cStoreGrossMarginPct: number;
  monthlyLaborCost: number;
  monthlyUtilities: number;
  monthlyInsuranceAndTaxes: number;
  monthlyOtherOpex: number;
  costOfCapitalPct: number; // Discount rate e.g. 8.5%
  inflationRatePct: number; // 2.5%
  taxRatePct: number; // 24%
  projectionYears: number; // 10 years
}

export interface FinancialScenarioResult {
  scenarioName: 'Conservative' | 'Base' | 'Optimistic';
  totalCapEx: number;
  annualFuelRevenue: number;
  annualCStoreRevenue: number;
  annualGrossProfit: number;
  annualOpEx: number;
  annualEbitda: number;
  annualNetProfit: number;
  breakEvenMonthlyGallons: number;
  breakEvenMonthlyRevenue: number;
  paybackPeriodYears: number;
  roiPct: number;
  npv: number;
  irrPct: number;
  cashFlows: { year: number; netCashFlow: number; cumulative: number }[];
}

export interface AIRecommendationResponse {
  locationIdOrZip: string;
  businessType: string;
  executiveVerdict: 'PROCEED_DUE_DILIGENCE' | 'INVESTIGATE_FURTHER' | 'MONITOR_CORRIDOR' | 'UNSUITABLE';
  recommendationVerdict?: string;
  riskLevel?: 'Low' | 'Moderate' | 'High' | 'Cautious' | string;
  executiveSummary?: string;
  optimalStoreFormat?: string;
  recommendedPumpsCount?: number;
  recommendedEvChargersCount?: number;
  confidenceScore: number;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  swotAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  demandAnalysis: string;
  supplyGapAnalysis: string;
  trafficAndCorridorVerdict: string;
  competitiveMoatVerdict: string;
  financialFeasibilitySummary: string;
  criticalRisks: string[];
  dueDiligenceRoadmap: string[];
  dataCaveats: string[];
  generatedAt: string;
  modelUsed: string;
}

export interface MarketShareRecord {
  brand: string;
  fuelVolumeSharePct: number;
  revenueSharePct: number;
  storeCountSharePct: number;
  storeCount: number;
  annualVolumeMillionGal: number;
  annualRevenueMillionUsd: number;
  trendYoY: number;
  category: 'Major Oil' | 'Hypermarket / Club' | 'Regional C-Store' | 'Independent / Jobber';
  isProxyOnly: boolean;
}

export interface FootfallTrendRecord {
  hour: string;
  weekdayVisits: number;
  weekendVisits: number;
  fuelingConversionPct: number;
  cStoreConversionPct: number;
}

export interface ETLJobRecord {
  id: string;
  filename: string;
  fileSizeKb: number;
  format: 'CSV' | 'GeoJSON' | 'Parquet' | 'Excel' | 'Shapefile';
  status: 'COMPLETED' | 'PROCESSING' | 'VALIDATED_WITH_WARNINGS' | 'FAILED';
  recordsTotal: number;
  recordsValid: number;
  recordsFlagged: number;
  duplicatesRemoved: number;
  invalidGeometriesFixed: number;
  uploadTimestamp: string;
  sourceAttribution: string;
  errors?: string[];
}

export interface DataQualitySummary {
  totalLocationsTracked: number;
  coordinateCompletenessPct: number;
  validZipCodePct: number;
  measuredDataRatioPct: number;
  modeledDataRatioPct: number;
  lastCensusSyncDate: string;
  lastFhwaTrafficSyncDate: string;
  freshnessScore: number;
  flaggedAnomaliesCount: number;
}

export interface CatchmentBufferData {
  bufferType: string;
  population: number;
  households: number;
  medianIncome: number;
  trafficAadt: number;
  businessCount: number;
  daytimeEmployees: number;
  vehicleCount: number;
  retailGapIndex: number;
}

export interface OsmPoiRecord {
  id: string;
  osmId: number | string;
  type: 'node' | 'way';
  lat: number;
  lng: number;
  name: string;
  brand?: string;
  operator?: string;
  amenity?: string; // fuel, charging_station, etc.
  shop?: string; // convenience, kiosk, etc.
  pumpsCount?: number;
  mpdCount?: number;
  cStoreSqFt?: number;
  isPumpsEstimated?: boolean;
  pumpsEstimationRationale?: string;
  forecourtConfidence?: 'EXPLICIT_TAG' | 'HIGH_CONFIDENCE' | 'CORRIDOR_MODEL' | string;
  forecourtConfidenceLabel?: string;
  forecourtArchetype?: string;
  openingHours?: string;
  fuelDiesel?: boolean;
  fuelLpg?: boolean;
  fuelOctane91?: boolean;
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
  source: 'OpenStreetMap Overpass' | 'Geoapify Places API' | string;
  distanceMiles?: number;
}

export interface LocationRiskFactor {
  id: string;
  category: 'CANNIBALIZATION' | 'REGULATORY_ZONING' | 'TRAFFIC_ACCESS' | 'COMPETITOR_WAR' | 'ENVIRONMENTAL_FLOOD' | 'UTILITY_GRID';
  title: string;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  score: number; // 0 (low risk) to 100 (extreme risk)
  impactDescription: string;
  mitigationStrategy: string;
}

export interface DetailedScoresBreakdown {
  compositeScore: number; // 0-100
  demandScore: number; // 0-100
  forecourtSupplyGapScore: number; // 0-100
  trafficCorridorScore: number; // 0-100
  competitionMoatScore: number; // 0-100
  evReadinessScore: number; // 0-100
  financialViabilityScore: number; // 0-100
  growthScore: number; // 0-100
}

export interface LocationStrategicStory {
  headline: string;
  executiveSummary: string;
  tradeAreaDynamics: string;
  forecourtRecommendation: string;
  financialJustification: string;
  keyActionItems: string[];
}

export interface IsochroneBuffer {
  minutes: 5 | 10 | 15;
  drivableAreaSqMiles: number;
  concentricRadiusEquivalentMiles: number;
  drivablePopulation: number;
  concentricPopulation: number;
  barrierDeficitPct: number;
  accessibleWorkers: number;
  arterialCoverageMiles: number;
  polygonCoordinates: [number, number][];
}

export interface IsochroneAnalysisData {
  fiveMin: IsochroneBuffer;
  tenMin: IsochroneBuffer;
  fifteenMin: IsochroneBuffer;
  roadNetworkBarriers: { barrier: string; type: string; impact: string }[];
  accessibilityIndex: number;
}

export interface CatchmentBrandShareItem {
  brand: string;
  count: number;
  pumps: number;
  pumpSharePct: number;
  estAnnualVolumeMGal: number;
  volumeSharePct: number;
  estCStoreSalesMUsd: number;
  cStoreSharePct: number;
  brandPowerScore: number;
  vulnerabilityScore: number;
}

export interface CatchmentMarketShareData {
  brands: CatchmentBrandShareItem[];
  herfindahlIndex: number;
  concentrationRating: 'Highly Competitive' | 'Moderately Concentrated' | 'Highly Concentrated';
  proposedSiteMarketSharePct: number;
  projectedRankInCatchment: number;
  topCompetitorBrand: string;
  independentSharePct: number;
}

export interface HourlyFlowItem {
  hour: string;
  passingVehiclesAadt: number;
  captureRatePct: number;
  projectedVisits: number;
  fuelOnlyVisits: number;
  cStoreOnlyVisits: number;
  amPeak: boolean;
  pmPeak: boolean;
  lunchSurge: boolean;
}

export interface CommuterFlowData {
  hourlyFlow: HourlyFlowItem[];
  amPeakDirectionalSplit: { inboundPct: number; outboundPct: number; morningCommutersPerHour: number };
  pmPeakDirectionalSplit: { inboundPct: number; outboundPct: number; eveningCommutersPerHour: number };
  weekendVsWeekdayRatio: number;
  projectedDailyTotalVisits: number;
  fuelOnlyVisits: number;
  cStoreOnlyVisits: number;
  dualFuelCStoreVisits: number;
  evChargingVisits: number;
  avgDwellTimeMinutes: number;
}

export interface CannibalizationDetail {
  sisterStoreId: string;
  sisterStoreName: string;
  distanceMiles: number;
  driveTimeMinutes: number;
  currentMonthlyVolumeGal: number;
  projectedDiversionPct: number;
  divertedMonthlyVolumeGal: number;
  divertedMonthlyGrossProfitUsd: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface CannibalizationAnalysisData {
  nearbySisterStores: CannibalizationDetail[];
  totalMonthlyVolumeDivertedGal: number;
  totalAnnualProfitImpactUsd: number;
  grossNewVolumeGal: number;
  netIncrementalVolumeGal: number;
  netIncrementalEbitdaUsd: number;
  netIncrementalLiftPct: number;
  gravityDecayExponent: number;
  brandLoyaltyFactor: number;
  mitigationPlaybook: string[];
}

export interface RadiusAnalysisData {
  radiusMiles: 1 | 3 | 5;
  centerLat: number;
  centerLng: number;
  centerAddress?: string;
  totalCompetitors: number;
  totalPumps: number;
  totalCStores: number;
  totalEvChargers: number;
  detailedScores?: DetailedScoresBreakdown;
  riskMatrix?: LocationRiskFactor[];
  overallRiskLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  strategicStory?: LocationStrategicStory;
  isochrones?: IsochroneAnalysisData;
  catchmentMarketShare?: CatchmentMarketShareData;
  commuterFlow?: CommuterFlowData;
  cannibalization?: CannibalizationAnalysisData;
  competitors: {
    id: string;
    name: string;
    brand: string;
    type: string;
    pumps: number;
    mpdCount?: number;
    isPumpsEstimated?: boolean;
    pumpsEstimationRationale?: string;
    forecourtConfidence?: string;
    forecourtConfidenceLabel?: string;
    forecourtArchetype?: string;
    distanceMiles: number;
    lat: number;
    lng: number;
    address?: string;
    cStoreSqFt?: number;
    fuelTypes?: string[];
    hasEv?: boolean;
    hasDieselHdv?: boolean;
    source?: string;
  }[];
  brandBreakdown: { brand: string; count: number; sharePct: number }[];
  nearestStationMiles: number;
  nearestSisterStationMiles?: number;
  cannibalizationEstimatePct?: number;
  demographics: {
    population: number;
    households: number;
    medianHouseholdIncome: number;
    daytimeWorkers: number;
    vehicleCount: number;
    annualGrowthPct: number;
  };
  traffic: {
    corridorAadt: number;
    roadClass: string;
    accessibilityScore: number;
    speedLimitMph?: number;
    signalizedAccess?: boolean;
    curbCutsCount?: number;
  };
  economics: {
    estimatedAnnualDemandGallons: number;
    existingAnnualCapacityGallons: number;
    unmetDemandGallons: number;
    estimatedCStoreMarketSizeUsd: number;
    unmetCStoreSalesUsd: number;
    whiteSpotOpportunityScore: number; // 0 - 100
    recommendation: 'PRIME_WHITE_SPOT' | 'VIABLE_INFILL' | 'SATURATED_MARKET' | 'LOW_DEMAND_CORRIDOR';
    recommendedPumps: number;
    recommendedCStoreSqFt: number;
    estimatedCapEx: number;
    estimatedPaybackYears: number;
    estimatedIrrPct?: number;
    estimatedNpv?: number;
    annualEbitda?: number;
  };
  osmPois: OsmPoiRecord[];
  pumpsSupplyMetrics?: {
    totalTradeAreaPumps: number;
    tradeAreaPumpsPer1000Residents: number;
    recommendedNewPumps: number;
    unmetPumpsDeficit: number;
    estimatedPumpTurnoverPerDay: number;
    dieselHdvPumpsCount?: number;
    evChargersCount?: number;
  };
  cStoreSupplyMetrics?: {
    totalTradeAreaCStoreSqFt: number;
    cStoreSqFtPer1000Residents: number;
    recommendedNewCStoreSqFt: number;
    unmetCStoreSqFtDeficit: number;
    projectedInsideAnnualSales: number;
  };
  allRadiusBuffers: {
    oneMile: { competitors: number; pumps: number; population: number; demandGallons: number; unmetGallons: number; score: number; riskRating: string };
    threeMiles: { competitors: number; pumps: number; population: number; demandGallons: number; unmetGallons: number; score: number; riskRating: string };
    fiveMiles: { competitors: number; pumps: number; population: number; demandGallons: number; unmetGallons: number; score: number; riskRating: string };
  };
}

export interface BusinessProblemTemplate {
  id: string;
  title: string;
  category: 'GROWTH_EXPANSION' | 'CANNIBALIZATION' | 'OPERATIONAL_TURNAROUND' | 'COMMUTE_TRAFFIC' | 'ENERGY_TRANSITION';
  badge: string;
  shortDescription: string;
  fullProblemStatement: string;
  keyMetricsToOptimize: string[];
  recommendedPlaybook: string[];
  diagnosticChecklist: { check: string; status: 'passed' | 'warning' | 'critical'; details: string }[];
  impactProjection: {
    revenueLiftPct: number;
    paybackMonthsReduction: number;
    ebitdaBoostUsd: number;
    marketShareCapturePct: number;
  };
  defaultStoreBuilderPreset?: {
    storeType?: 'Fuel Station + C-Store' | 'Travel Plaza / Truck Stop' | 'Express Fuel' | 'Urban C-Store' | 'EV Charging Hub' | 'Fleet Fueling';
    candidateId?: string;
    candidateName?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
    aadt?: number;
    targetArchetype?: 'HighwayFlagship' | 'UrbanConvenience' | 'TravelCenter' | 'SuburbanAnchor' | 'EVHeavyHub';
    pumps?: number;
    dieselLanes?: number;
    cStoreSqFt?: number;
    foodServiceOption?: 'None' | 'CoffeeBakery' | 'QSR_Single' | 'QSR_Dual' | 'FullKitchenDiner';
    hasDieselHdv?: boolean;
    evChargers?: number;
    evChargersCount?: number;
    carWash?: boolean;
    hasCarWash?: boolean;
    hasQsrKitchen?: boolean;
    targetAadt?: number;
    targetPop?: number;
    targetCorridorName?: string;
  };
}


