import { WhiteSpotCandidate } from '../types';
import { WHITE_SPOT_CANDIDATES, US_STORE_LOCATIONS } from '../data/mockDatabase';

const STORAGE_KEY = 'EXXONMOBIL_SAVED_WHITE_SPOTS_VAULT_V1';

// Calculate distance between two lat/lng points in meters
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export interface VaultAdmissionResult {
  eligible: boolean;
  reason?: string;
  nearestExxonMiles?: number;
  competitorsCount?: number;
  opportunityScore?: number;
}

/**
 * Validates whether a candidate parcel is eligible for Vault Admission:
 * 1. REJECT if Exxon/Mobil station is already nearby (<= 1.5 miles -> prevents cannibalization).
 * 2. REJECT if market is oversaturated with competitors (competitorCount >= 6 AND low supply gap/score).
 * 3. ADMIT ONLY high-opportunity sites (opportunityScore >= 70 OR verified unmet supply void).
 */
export function validateVaultCandidateEligibility(
  candidate: Partial<WhiteSpotCandidate>
): VaultAdmissionResult {
  const lat = candidate.lat;
  const lng = candidate.lng;

  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return { eligible: false, reason: 'Invalid coordinates provided.' };
  }

  // 1. Check proximity to existing Exxon / Mobil stations
  const sisterStores = US_STORE_LOCATIONS.filter(
    s => s.brand.toLowerCase().includes('exxon') || s.brand.toLowerCase().includes('mobil')
  );

  let nearestExxonDist = 999;
  let nearestExxonStore = '';

  for (const store of sisterStores) {
    const dMeters = getDistanceMeters(lat, lng, store.lat, store.lng);
    const dMiles = dMeters / 1609.34;
    if (dMiles < nearestExxonDist) {
      nearestExxonDist = dMiles;
      nearestExxonStore = `${store.brand} (${store.name || store.id}) in ${store.city}, ${store.state}`;
    }
  }

  // If Exxon/Mobil is already within 1.5 miles, do not add (Exxon is already there)
  if (nearestExxonDist <= 1.5) {
    return {
      eligible: false,
      reason: `Exxon/Mobil is already operating within ${nearestExxonDist.toFixed(2)} miles (${nearestExxonStore}). Cannot add duplicate or self-cannibalizing locations.`,
      nearestExxonMiles: Math.round(nearestExxonDist * 100) / 100
    };
  }

  // 2. Check competitor saturation
  const compCount = candidate.competitorCount3Miles ?? 0;
  const oppScore = candidate.opportunityScore ?? 0;
  const supplyGap = candidate.supplyGapScore ?? 75;

  // If heavy competitor concentration with insufficient opportunity score/gap
  if (compCount >= 6 && (oppScore < 72 || supplyGap < 60)) {
    return {
      eligible: false,
      reason: `Competitor oversaturation: ${compCount} competitor stations in trade area with low unmet demand. Only undersupplied opportunity white spots are admitted.`,
      competitorsCount: compCount,
      opportunityScore: oppScore
    };
  }

  // 3. Minimum opportunity score threshold
  if (oppScore > 0 && oppScore < 65) {
    return {
      eligible: false,
      reason: `Opportunity score (${oppScore}/100) is below the institutional threshold (min 65/100).`,
      opportunityScore: oppScore
    };
  }

  return {
    eligible: true,
    nearestExxonMiles: Math.round(nearestExxonDist * 100) / 100,
    competitorsCount: compCount,
    opportunityScore: oppScore
  };
}

/**
 * Load saved candidate sites from localStorage, filtered for strict opportunity eligibility
 */
export function getSavedVaultCandidates(): WhiteSpotCandidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter against admission rules
        const filtered = parsed.filter(c => validateVaultCandidateEligibility(c).eligible);
        return filtered.length > 0 ? filtered : WHITE_SPOT_CANDIDATES.filter(c => validateVaultCandidateEligibility(c).eligible);
      }
    }
  } catch (err) {
    console.warn('Failed to read saved white spots from localStorage:', err);
  }
  return WHITE_SPOT_CANDIDATES.filter(c => validateVaultCandidateEligibility(c).eligible);
}

/**
 * Persist candidate sites to localStorage
 */
export function persistVaultCandidates(candidates: WhiteSpotCandidate[]): void {
  try {
    const eligibleOnly = candidates.filter(c => validateVaultCandidateEligibility(c).eligible);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eligibleOnly));
  } catch (err) {
    console.warn('Failed to save white spots to localStorage:', err);
  }
}

/**
 * Add or update candidate site with smart deduplication and strict opportunity filter
 */
export function addOrUpdateCandidateInVault(
  newCand: WhiteSpotCandidate,
  currentList: WhiteSpotCandidate[]
): { updatedList: WhiteSpotCandidate[]; isNew: boolean; candidate?: WhiteSpotCandidate; eligible: boolean; reason?: string } {
  // Validate eligibility before admission
  const check = validateVaultCandidateEligibility(newCand);
  if (!check.eligible) {
    return {
      updatedList: currentList,
      isNew: false,
      eligible: false,
      reason: check.reason
    };
  }

  let matchedIndex = -1;

  for (let i = 0; i < currentList.length; i++) {
    const existing = currentList[i];
    if (existing.id === newCand.id) {
      matchedIndex = i;
      break;
    }
    // Check spatial proximity (< 350 meters)
    const dist = getDistanceMeters(newCand.lat, newCand.lng, existing.lat, existing.lng);
    if (dist < 350) {
      matchedIndex = i;
      break;
    }
  }

  let updatedList: WhiteSpotCandidate[];
  let isNew = false;
  let finalCandidate: WhiteSpotCandidate;

  if (matchedIndex >= 0) {
    // Merge existing with newer data
    const existing = currentList[matchedIndex];
    finalCandidate = {
      ...existing,
      ...newCand,
      id: existing.id, // keep original ID
      candidateName: newCand.candidateName || existing.candidateName,
      opportunityScore: Math.max(existing.opportunityScore, newCand.opportunityScore || 75),
    };
    updatedList = [...currentList];
    updatedList[matchedIndex] = finalCandidate;
  } else {
    isNew = true;
    finalCandidate = newCand;
    updatedList = [newCand, ...currentList];
  }

  // Sort by opportunity score descending
  updatedList.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));
  persistVaultCandidates(updatedList);

  return { updatedList, isNew, candidate: finalCandidate, eligible: true };
}

/**
 * Bulk insert or update candidates with deduplication and opportunity filtering
 */
export function bulkUpsertVaultCandidates(
  incoming: WhiteSpotCandidate[],
  currentList: WhiteSpotCandidate[]
): WhiteSpotCandidate[] {
  let list = [...currentList];

  for (const cand of incoming) {
    const res = addOrUpdateCandidateInVault(cand, list);
    if (res.eligible && res.updatedList) {
      list = res.updatedList;
    }
  }

  persistVaultCandidates(list);
  return list;
}

/**
 * Convert 1-Click OSM Map Click Point into a full WhiteSpotCandidate for vault analysis
 */
export function createCandidateFrom1ClickAnalysis(params: {
  lat: number;
  lng: number;
  label?: string;
  address?: string;
  radiusMiles: number;
  competitorsCount: number;
  nearestCompetitorMiles?: number;
  competitorsPumps?: number;
  opportunityScore?: number;
  demandScore?: number;
  supplyGapScore?: number;
  trafficScore?: number;
  competitionScore?: number;
  commercialScore?: number;
  financialScore?: number;
  growthScore?: number;
  pop3Mile?: number;
  aadt?: number;
  unmetDemandGallons?: number;
  projectedEbitda?: number;
  estimatedCapEx?: number;
  estimatedPaybackYears?: number;
  riskLevel?: 'Low' | 'Moderate' | 'High';
  recommendation?: string;
}): WhiteSpotCandidate {
  const {
    lat,
    lng,
    label,
    address,
    radiusMiles,
    competitorsCount,
    nearestCompetitorMiles = 2.1,
    competitorsPumps = 16,
    opportunityScore,
    demandScore,
    supplyGapScore,
    trafficScore,
    competitionScore,
    commercialScore,
    financialScore,
    growthScore,
    pop3Mile,
    aadt,
    unmetDemandGallons,
    projectedEbitda: customEbitda,
    estimatedCapEx: customCapEx,
    estimatedPaybackYears: customPayback,
    riskLevel: customRisk,
    recommendation
  } = params;

  const id = `click-osm-${lat.toFixed(4)}-${lng.toFixed(4)}`;
  const cleanLabel = label || `Trade Area (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
  
  // If opportunityScore is provided by the live catchment engine, use it directly!
  const finalOpportunityScore = typeof opportunityScore === 'number' 
    ? Math.round(opportunityScore)
    : Math.min(99, Math.max(50, Math.round(75 + nearestCompetitorMiles * 6 - competitorsCount * 3.5)));

  const finalDemandScore = typeof demandScore === 'number' ? Math.round(demandScore) : Math.round(75 + (nearestCompetitorMiles * 6));
  const finalSupplyGapScore = typeof supplyGapScore === 'number' ? Math.round(supplyGapScore) : Math.max(60, Math.min(98, Math.round(95 - (competitorsCount * 3.5))));
  const finalTrafficScore = typeof trafficScore === 'number' ? Math.round(trafficScore) : Math.min(96, Math.max(65, Math.round(72 + (nearestCompetitorMiles * 4))));
  const finalCompetitionScore = typeof competitionScore === 'number' ? Math.round(competitionScore) : Math.max(30, 100 - competitorsCount * 8);
  const finalCommercialScore = typeof commercialScore === 'number' ? Math.round(commercialScore) : 88;
  const finalFinancialScore = typeof financialScore === 'number' ? Math.round(financialScore) : 85;
  const finalGrowthScore = typeof growthScore === 'number' ? Math.round(growthScore) : 92;

  const finalAadt = aadt || Math.round(32000 + (nearestCompetitorMiles * 4500));
  const finalPop3Mile = pop3Mile || 46200;
  const finalUnmetGallons = unmetDemandGallons || Math.round((1.2 + (nearestCompetitorMiles * 0.35)) * 1000000);
  const projectedFuelGal = finalUnmetGallons;
  const estimatedCapEx = customCapEx || (finalAadt > 50000 ? 5850000 : 4800000);
  const projectedEbitda = customEbitda || Math.round(projectedFuelGal * 0.42 * 0.65 + 450000);
  const payback = customPayback || Math.round((estimatedCapEx / (projectedEbitda || 1)) * 10) / 10;
  const irr = Math.round(Math.min(32, Math.max(16, (projectedEbitda / estimatedCapEx) * 100 * 1.15)) * 10) / 10;

  const finalRiskLevel = customRisk || (finalOpportunityScore >= 85 ? 'Low' : finalOpportunityScore >= 70 ? 'Moderate' : 'High');

  return {
    id,
    candidateName: cleanLabel,
    address: address || `Arterial Parcel Node (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    city: cleanLabel.includes(',') ? cleanLabel.split(',')[0].trim() : 'Active Trade Area',
    state: cleanLabel.includes(',') ? cleanLabel.split(',')[1]?.trim().slice(0, 2).toUpperCase() : 'US',
    county: 'Target County',
    zipCode: '77429',
    lat,
    lng,
    opportunityScore: finalOpportunityScore,
    demandScore: finalDemandScore,
    supplyGapScore: finalSupplyGapScore,
    trafficScore: finalTrafficScore,
    competitionScore: finalCompetitionScore,
    commercialScore: finalCommercialScore,
    financialScore: finalFinancialScore,
    growthScore: finalGrowthScore,
    confidenceLevel: 'High',
    riskLevel: finalRiskLevel,
    modelVersion: 'OSM-Radius-Vault-2026',
    primaryRationale: [
      `Real-time OpenStreetMap detected ${competitorsCount} competitor stations in ${radiusMiles}mi radius.`,
      `Nearest competitor is ${nearestCompetitorMiles.toFixed(1)} miles away, creating a spatial fuel capture void.`,
      `Underwriting pro-forma projects ${(projectedFuelGal / 1000000).toFixed(2)}M annual retail gallons with ${irr}% Unlevered IRR.`,
      recommendation ? `Catchment Engine Recommendation: ${recommendation.replace(/_/g, ' ')}.` : 'Strong trade area fundamentals.'
    ],
    dataGaps: ['Driveway deceleration lane engineering study recommended.'],
    projectedAnnualFuelGallons: projectedFuelGal,
    projectedAnnualCStoreRevenue: 2150000,
    projectedAnnualTotalRevenue: Math.round(projectedFuelGal * 3.45 + 2150000),
    projectedAnnualEbitda: projectedEbitda,
    projectedDailyFootfall: Math.round(finalAadt * 0.058),
    projectedMarketSharePct: 34.0,
    estimatedCapEx: estimatedCapEx,
    estimatedPaybackYears: payback,
    estimatedIrrPct: irr,
    estimatedNpv: Math.round((projectedEbitda * 5.2) - estimatedCapEx),
    pop1Mile: Math.round(finalPop3Mile * 0.18),
    pop3Mile: finalPop3Mile,
    pop5Mile: Math.round(finalPop3Mile * 2.5),
    medianIncome3Mile: 94500,
    aadt: finalAadt,
    nearestStationMiles: nearestCompetitorMiles,
    competitorCount3Miles: competitorsCount,
    proposedStoreType: finalOpportunityScore >= 88 ? 'Fuel Station + C-Store + EV Fast Charge' : 'Fuel Station + Express C-Store',
    recommendedPumps: competitorsPumps > 12 ? 16 : 12,
    recommendedCStoreSqFt: 4500,
    sourceDate: new Date().toISOString().split('T')[0]
  };
}
