/**
 * Institutional Forecourt & Fuel Pump Estimation Engine
 * 
 * Accurately estimates pump fueling positions and Multi-Pump Dispensers (MPDs) 
 * for fuel stations, travel centers, and convenience plazas based on:
 * 1. Verified OpenStreetMap capacity / pumps tags (when present)
 * 2. Brand archetype & prototype forecourt footprint standards
 * 3. Road hierarchy (Interstate / Highway / Arterial / Urban)
 * 4. Fuel & service amenities (HDV Commercial Diesel, EV Fast Charging, Foodservice)
 * 5. Deterministic coordinate spatial hash (ensuring stable, realistic numbers)
 */

export interface PumpEstimationResult {
  pumpsCount: number;
  mpdCount: number;
  cStoreSqFt: number;
  isEstimated: boolean;
  confidence: 'EXPLICIT_TAG' | 'HIGH_CONFIDENCE' | 'CORRIDOR_MODEL';
  confidenceLabel: string;
  rationale: string;
  archetype: string;
}

interface BrandProfile {
  basePumps: number;
  baseCStoreSqFt: number;
  archetype: string;
  highGrowthOffset?: number;
}

const BRAND_PROFILES: { pattern: RegExp; profile: BrandProfile }[] = [
  // Mega Travel Centers & Forecourts (60-120 pumps)
  {
    pattern: /buc-?ee/i,
    profile: {
      basePumps: 84,
      baseCStoreSqFt: 58000,
      archetype: "Mega Travel Center (60–120 Fueling Positions)"
    }
  },
  // Highway Travel Plazas & Truck Centers (16-24 pumps)
  {
    pattern: /pilot|flying\s*j/i,
    profile: {
      basePumps: 20,
      baseCStoreSqFt: 7500,
      archetype: 'Interstate Travel Plaza & Truck Center'
    }
  },
  {
    pattern: /love['’]?s/i,
    profile: {
      basePumps: 18,
      baseCStoreSqFt: 8000,
      archetype: 'Travel Stop & High-Flow Diesel Master'
    }
  },
  {
    pattern: /\bta\b|travelcenters|petro\s*stopping/i,
    profile: {
      basePumps: 20,
      baseCStoreSqFt: 9000,
      archetype: 'Full-Service Travel Center'
    }
  },
  // High-Volume C-Store / Foodservice Giants (14-20 pumps)
  {
    pattern: /quiktrip|\bqt\b/i,
    profile: {
      basePumps: 16,
      baseCStoreSqFt: 5800,
      archetype: 'QuikTrip Gen 3 High-Volume Forecourt'
    }
  },
  {
    pattern: /wawa/i,
    profile: {
      basePumps: 16,
      baseCStoreSqFt: 5800,
      archetype: 'Super Wawa Modern Forecourt'
    }
  },
  {
    pattern: /sheetz/i,
    profile: {
      basePumps: 18,
      baseCStoreSqFt: 6200,
      archetype: 'Sheetz Restaurant & High-Capacity Forecourt'
    }
  },
  {
    pattern: /racetrac/i,
    profile: {
      basePumps: 18,
      baseCStoreSqFt: 5500,
      archetype: 'RaceTrac Large-Format Forecourt'
    }
  },
  {
    pattern: /kwik\s*(trip|star)/i,
    profile: {
      basePumps: 18,
      baseCStoreSqFt: 6500,
      archetype: 'Kwik Trip Regional Travel Forecourt'
    }
  },
  {
    pattern: /maverik/i,
    profile: {
      basePumps: 16,
      baseCStoreSqFt: 5400,
      archetype: "Maverik Adventure's First Stop Forecourt"
    }
  },
  {
    pattern: /casey['’]?s/i,
    profile: {
      basePumps: 14,
      baseCStoreSqFt: 4800,
      archetype: "Casey's General Store Forecourt"
    }
  },
  {
    pattern: /thorntons/i,
    profile: {
      basePumps: 16,
      baseCStoreSqFt: 5400,
      archetype: 'Thorntons Commercial Forecourt'
    }
  },
  {
    pattern: /royal\s*farms/i,
    profile: {
      basePumps: 14,
      baseCStoreSqFt: 5000,
      archetype: 'Royal Farms High-Volume Forecourt'
    }
  },
  {
    pattern: /cumberland\s*farms/i,
    profile: {
      basePumps: 12,
      baseCStoreSqFt: 4500,
      archetype: 'Cumberland Farms Forecourt'
    }
  },
  {
    pattern: /stripes/i,
    profile: {
      basePumps: 14,
      baseCStoreSqFt: 4800,
      archetype: 'Stripes & Laredo Taco Forecourt'
    }
  },
  {
    pattern: /alltown/i,
    profile: {
      basePumps: 12,
      baseCStoreSqFt: 4400,
      archetype: 'Alltown Fresh Forecourt'
    }
  },

  // Big Box & Hypermarket Clubs (14-32 pumps)
  {
    pattern: /costco/i,
    profile: {
      basePumps: 28,
      baseCStoreSqFt: 1200,
      archetype: 'Costco High-Speed Multi-Lane Fuel Plaza'
    }
  },
  {
    pattern: /sam['’]?s\s*club/i,
    profile: {
      basePumps: 20,
      baseCStoreSqFt: 1200,
      archetype: "Sam's Club Member Fuel Center"
    }
  },
  {
    pattern: /bj['’]?s/i,
    profile: {
      basePumps: 16,
      baseCStoreSqFt: 1000,
      archetype: "BJ's Wholesale Fuel Center"
    }
  },
  {
    pattern: /kroger/i,
    profile: {
      basePumps: 14,
      baseCStoreSqFt: 1600,
      archetype: 'Kroger Fuel Center Forecourt'
    }
  },
  {
    pattern: /h-?e-?b\b/i,
    profile: {
      basePumps: 16,
      baseCStoreSqFt: 2500,
      archetype: 'H-E-B Commercial Fuel Center'
    }
  },
  {
    pattern: /meijer/i,
    profile: {
      basePumps: 16,
      baseCStoreSqFt: 3500,
      archetype: 'Meijer Express Gas Station'
    }
  },
  {
    pattern: /murphy|walmart/i,
    profile: {
      basePumps: 12,
      baseCStoreSqFt: 2400,
      archetype: 'Murphy USA / Walmart Fuel Plaza'
    }
  },

  // Major Oil Brands (10-14 pumps)
  {
    pattern: /exxon|mobil/i,
    profile: {
      basePumps: 12,
      baseCStoreSqFt: 3800,
      archetype: 'ExxonMobil Synergy Forecourt Prototype'
    }
  },
  {
    pattern: /shell/i,
    profile: {
      basePumps: 12,
      baseCStoreSqFt: 3600,
      archetype: 'Shell V-Power Forecourt Prototype'
    }
  },
  {
    pattern: /chevron|texaco/i,
    profile: {
      basePumps: 12,
      baseCStoreSqFt: 3800,
      archetype: 'Chevron with Techron Forecourt Prototype'
    }
  },
  {
    pattern: /\bbp\b|amoco/i,
    profile: {
      basePumps: 12,
      baseCStoreSqFt: 3600,
      archetype: 'BP Invigorate Forecourt Prototype'
    }
  },
  {
    pattern: /marathon|speedway/i,
    profile: {
      basePumps: 12,
      baseCStoreSqFt: 4000,
      archetype: 'Marathon / Speedway Forecourt'
    }
  },
  {
    pattern: /valero/i,
    profile: {
      basePumps: 10,
      baseCStoreSqFt: 3400,
      archetype: 'Valero Corner Store Forecourt'
    }
  },
  {
    pattern: /phillips\s*66|conoco|\b76\b/i,
    profile: {
      basePumps: 10,
      baseCStoreSqFt: 3400,
      archetype: 'Phillips 66 Commercial Forecourt'
    }
  },
  {
    pattern: /sunoco/i,
    profile: {
      basePumps: 10,
      baseCStoreSqFt: 3400,
      archetype: 'Sunoco Commercial Forecourt'
    }
  },
  {
    pattern: /citgo|sinclair/i,
    profile: {
      basePumps: 10,
      baseCStoreSqFt: 3200,
      archetype: 'Branded Regional Forecourt'
    }
  },

  // Major Convenience Chains (10-14 pumps)
  {
    pattern: /7-?eleven/i,
    profile: {
      basePumps: 12,
      baseCStoreSqFt: 4200,
      archetype: '7-Eleven Modern Forecourt & C-Store'
    }
  },
  {
    pattern: /circle\s*k/i,
    profile: {
      basePumps: 12,
      baseCStoreSqFt: 4400,
      archetype: 'Circle K Couche-Tard Forecourt'
    }
  },
  {
    pattern: /ampm|arco/i,
    profile: {
      basePumps: 12,
      baseCStoreSqFt: 3800,
      archetype: 'ARCO ampm High-Volume Forecourt'
    }
  }
];

const DEFAULT_INDEPENDENT_PROFILE: BrandProfile = {
  basePumps: 8,
  baseCStoreSqFt: 3200,
  archetype: 'Neighborhood / Independent Forecourt'
};

/**
 * Intelligent Multi-Factor Pump Estimator
 */
export function estimateForecourtPumps(params: {
  rawTags?: Record<string, any>;
  brand?: string;
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  hasDiesel?: boolean;
  hasEv?: boolean;
  amenity?: string;
  categories?: string[];
}): PumpEstimationResult {
  const {
    rawTags = {},
    brand = '',
    name = '',
    street = '',
    lat = 30.0,
    lng = -95.0,
    hasDiesel = false,
    hasEv = false,
    amenity = 'fuel',
    categories = []
  } = params;

  // 1. Check for explicit OpenStreetMap tags
  const explicitCapacity = rawTags.capacity || rawTags.pumps || rawTags['capacity:fuel'] || rawTags['fuel:pumps'] || rawTags.dispensers;
  if (explicitCapacity !== undefined && explicitCapacity !== null && explicitCapacity !== '') {
    let parsed = parseInt(String(explicitCapacity), 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 180) {
      // If tag is 'dispensers', convert to fueling positions (x2)
      if (rawTags.dispensers && !rawTags.capacity && !rawTags.pumps) {
        parsed = parsed * 2;
      }
      // Ensure even count for modern dual-sided MPDs
      const mpds = Math.max(2, Math.ceil(parsed / 2));
      const adjustedPumps = mpds * 2;
      return {
        pumpsCount: adjustedPumps,
        mpdCount: mpds,
        cStoreSqFt: rawTags.building_area ? parseInt(rawTags.building_area, 10) : 4200,
        isEstimated: false,
        confidence: 'EXPLICIT_TAG',
        confidenceLabel: 'OSM Verified Tag',
        rationale: `Direct capacity tag (${parsed} positions) recorded in OpenStreetMap`,
        archetype: 'Verified Forecourt Tag'
      };
    }
  }

  // 2. Identify Brand Profile
  const combinedText = `${brand} ${name}`.trim();
  let matchedProfile: BrandProfile = DEFAULT_INDEPENDENT_PROFILE;
  for (const item of BRAND_PROFILES) {
    if (item.pattern.test(combinedText)) {
      matchedProfile = item.profile;
      break;
    }
  }

  // 3. Road Corridor & Hierarchy Modifiers
  const addressText = `${street} ${name} ${rawTags['addr:street'] || ''}`.toLowerCase();
  let highwayBoostPumps = 0;
  let roadModifierRationale = '';

  const isInterstateOrHighway = /i-\d+|ih-\d+|interstate|hwy|highway|freeway|fwy|turnpike|tollway|parkway|pkwy|expressway|loop\s*\d+|us-\d+|sr-\d+|tx-\d+|sh-\d+|fm\s*\d+/i.test(addressText);
  const isMajorArterial = /blvd|boulevard|ave|avenue|parkway|commercial|crossing|plaza/i.test(addressText);

  if (isInterstateOrHighway) {
    // Highway forecourts feature larger canopies and higher dispenser counts
    if (matchedProfile.basePumps < 24) {
      highwayBoostPumps = 4;
      roadModifierRationale = 'Highway Corridor (+4 fueling positions)';
    } else {
      highwayBoostPumps = 0;
    }
  } else if (isMajorArterial) {
    if (matchedProfile.basePumps < 20) {
      highwayBoostPumps = 2;
      roadModifierRationale = 'Major Arterial (+2 fueling positions)';
    }
  }

  // 4. Forecourt Amenities Modifiers (Diesel, EV, C-Store, Truck Lanes)
  let amenityBoostPumps = 0;
  const isTruckDiesel = hasDiesel || rawTags['fuel:HGV'] === 'yes' || rawTags.hgv === 'yes' || rawTags.truck === 'yes' || categories.includes('commercial.gas_station.truck');
  if (isTruckDiesel && matchedProfile.basePumps < 24) {
    amenityBoostPumps += 2;
  }

  const isEvChargingHub = hasEv || amenity === 'charging_station' || rawTags.amenity === 'charging_station';
  if (isEvChargingHub) {
    amenityBoostPumps += 2;
  }

  // 5. Deterministic Coordinate Spatial Calibration
  // Uses lat/lng hash to generate stable, natural parcel variation (-2, 0, +2)
  const coordHash = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453);
  const varianceIndex = Math.floor(coordHash * 100) % 3; // 0, 1, or 2
  let spatialVariance = 0;
  if (matchedProfile.basePumps >= 12 && matchedProfile.basePumps < 40) {
    spatialVariance = (varianceIndex - 1) * 2; // -2, 0, or +2
  }

  // 6. Calculate Final Approximate Pump Count
  let calculatedPumps = matchedProfile.basePumps + highwayBoostPumps + amenityBoostPumps + spatialVariance;
  
  // Enforce realistic bounds & dual-sided MPD even number rule
  calculatedPumps = Math.max(4, Math.min(128, Math.round(calculatedPumps / 2) * 2));
  const mpdCount = Math.round(calculatedPumps / 2);

  // Approximate C-Store Square Footage
  let estimatedSqFt = matchedProfile.baseCStoreSqFt;
  if (highwayBoostPumps > 0) estimatedSqFt += 600;
  if (amenityBoostPumps > 0) estimatedSqFt += 400;

  // Build descriptive rationale string
  const rationaleParts: string[] = [matchedProfile.archetype];
  if (roadModifierRationale) rationaleParts.push(roadModifierRationale);
  if (isTruckDiesel) rationaleParts.push('Diesel/HDV Lanes');
  if (isEvChargingHub) rationaleParts.push('EV Charging Plaza');

  const isHighConfidence = matchedProfile !== DEFAULT_INDEPENDENT_PROFILE || isInterstateOrHighway;

  return {
    pumpsCount: calculatedPumps,
    mpdCount,
    cStoreSqFt: estimatedSqFt,
    isEstimated: true,
    confidence: isHighConfidence ? 'HIGH_CONFIDENCE' : 'CORRIDOR_MODEL',
    confidenceLabel: isHighConfidence ? 'Forecourt Model' : 'Corridor Estimate',
    rationale: rationaleParts.join(' • '),
    archetype: matchedProfile.archetype
  };
}
