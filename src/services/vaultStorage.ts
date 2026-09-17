import { WhiteSpotCandidate } from '../types';
import { WHITE_SPOT_CANDIDATES } from '../data/mockDatabase';

const STORAGE_KEY = 'EXXONMOBIL_SAVED_WHITE_SPOTS_VAULT_V1';

// Calculate distance between two lat/lng points in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

/**
 * Load saved candidate sites from localStorage, falling back to preloaded base list
 */
export function getSavedVaultCandidates(): WhiteSpotCandidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read saved white spots from localStorage:', err);
  }
  return WHITE_SPOT_CANDIDATES;
}

/**
 * Persist candidate sites to localStorage
 */
export function persistVaultCandidates(candidates: WhiteSpotCandidate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  } catch (err) {
    console.warn('Failed to save white spots to localStorage:', err);
  }
}

/**
 * Add or update candidate site with smart deduplication
 * - If ID matches -> update in-place
 * - If within 350 meters (~0.003 deg) -> merge/update existing site
 * - Otherwise -> prepend as new candidate
 */
export function addOrUpdateCandidateInVault(
  newCand: WhiteSpotCandidate,
  currentList: WhiteSpotCandidate[]
): { updatedList: WhiteSpotCandidate[]; isNew: boolean; candidate: WhiteSpotCandidate } {
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

  return { updatedList, isNew, candidate: finalCandidate };
}

/**
 * Bulk insert or update candidates with deduplication
 */
export function bulkUpsertVaultCandidates(
  incoming: WhiteSpotCandidate[],
  currentList: WhiteSpotCandidate[]
): WhiteSpotCandidate[] {
  let list = [...currentList];

  for (const cand of incoming) {
    const res = addOrUpdateCandidateInVault(cand, list);
    list = res.updatedList;
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
}): WhiteSpotCandidate {
  const {
    lat,
    lng,
    label,
    address,
    radiusMiles,
    competitorsCount,
    nearestCompetitorMiles = 2.1,
    competitorsPumps = 16
  } = params;

  const id = `click-osm-${lat.toFixed(4)}-${lng.toFixed(4)}`;
  const cleanLabel = label || `Trade Area (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
  
  // Model reasonable volume & scores based on competitor density
  const calculatedDemand = Math.round(75 + (nearestCompetitorMiles * 6));
  const calculatedSupplyGap = Math.max(60, Math.min(98, Math.round(95 - (competitorsCount * 3.5))));
  const calculatedTrafficScore = Math.min(96, Math.max(65, Math.round(72 + (nearestCompetitorMiles * 4))));
  const overallScore = Math.min(99, Math.max(62, Math.round((calculatedDemand * 0.35) + (calculatedSupplyGap * 0.35) + (calculatedTrafficScore * 0.30))));

  const projectedFuelGal = Math.round((1.2 + (nearestCompetitorMiles * 0.35)) * 1000000);
  const estimatedCapEx = 4800000;
  const projectedEbitda = Math.round(projectedFuelGal * 0.42 * 0.65 + 450000);
  const payback = Math.round((estimatedCapEx / (projectedEbitda || 1)) * 10) / 10;
  const irr = Math.round(Math.min(32, Math.max(16, (projectedEbitda / estimatedCapEx) * 100 * 1.15)) * 10) / 10;

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
    opportunityScore: overallScore,
    demandScore: calculatedDemand,
    supplyGapScore: calculatedSupplyGap,
    trafficScore: calculatedTrafficScore,
    competitionScore: Math.max(30, 100 - competitorsCount * 8),
    commercialScore: 88,
    financialScore: Math.min(95, Math.round(irr * 3.2)),
    growthScore: 92,
    confidenceLevel: 'High',
    riskLevel: overallScore >= 85 ? 'Low' : 'Moderate',
    modelVersion: 'OSM-Radius-Vault-2026',
    primaryRationale: [
      `Real-time OpenStreetMap detected ${competitorsCount} competitor stations in ${radiusMiles}mi radius.`,
      `Nearest competitor is ${nearestCompetitorMiles.toFixed(1)} miles away, creating a prime spatial fuel capture void.`,
      `Underwriting pro-forma projects ${(projectedFuelGal / 1000000).toFixed(2)}M annual retail gallons with ${irr}% Unlevered IRR.`
    ],
    dataGaps: ['Driveway deceleration lane engineering study recommended.'],
    projectedAnnualFuelGallons: projectedFuelGal,
    projectedAnnualCStoreRevenue: 2150000,
    projectedAnnualTotalRevenue: Math.round(projectedFuelGal * 3.45 + 2150000),
    projectedAnnualEbitda: projectedEbitda,
    projectedDailyFootfall: Math.round(35000 * 0.058),
    projectedMarketSharePct: 34.0,
    estimatedCapEx: estimatedCapEx,
    estimatedPaybackYears: payback,
    estimatedIrrPct: irr,
    estimatedNpv: Math.round((projectedEbitda * 5.2) - estimatedCapEx),
    pop1Mile: 8400,
    pop3Mile: 46200,
    pop5Mile: 118000,
    medianIncome3Mile: 94500,
    aadt: Math.round(32000 + (nearestCompetitorMiles * 4500)),
    nearestStationMiles: nearestCompetitorMiles,
    competitorCount3Miles: competitorsCount,
    proposedStoreType: overallScore >= 88 ? 'Fuel Station + C-Store + EV Fast Charge' : 'Fuel Station + Express C-Store',
    recommendedPumps: competitorsPumps > 12 ? 16 : 12,
    recommendedCStoreSqFt: 4500,
    sourceDate: new Date().toISOString().split('T')[0]
  };
}
