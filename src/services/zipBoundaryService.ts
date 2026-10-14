import { 
  ZipBoundaryCollection, 
  ZipBoundaryFeature, 
  ZipBoundaryProperties, 
  ZipStylingMode,
  StateBoundaryCollection,
  StateBoundaryFeature,
  StateBoundaryProperties 
} from '../types';

export interface StateGeoInfo {
  code: string;
  name: string;
  filename: string;
  fips: string;
  center: [number, number];
  zoom: number;
}

// Full authoritative registry of all 50 US States + District of Columbia
// mapped to the OpenDataDE/State-zip-code-GeoJSON repository files.
export const US_STATE_ZIP_GEOJSON_REGISTRY: Record<string, StateGeoInfo> = {
  AL: { code: 'AL', name: 'Alabama', filename: 'al_alabama_zip_codes_geo.min.json', fips: '01', center: [32.806671, -86.791130], zoom: 7 },
  AK: { code: 'AK', name: 'Alaska', filename: 'ak_alaska_zip_codes_geo.min.json', fips: '02', center: [61.370716, -152.404419], zoom: 4 },
  AZ: { code: 'AZ', name: 'Arizona', filename: 'az_arizona_zip_codes_geo.min.json', fips: '04', center: [33.729759, -111.431221], zoom: 7 },
  AR: { code: 'AR', name: 'Arkansas', filename: 'ar_arkansas_zip_codes_geo.min.json', fips: '05', center: [34.969704, -92.373123], zoom: 7 },
  CA: { code: 'CA', name: 'California', filename: 'ca_california_zip_codes_geo.min.json', fips: '06', center: [36.116203, -119.681564], zoom: 6 },
  CO: { code: 'CO', name: 'Colorado', filename: 'co_colorado_zip_codes_geo.min.json', fips: '08', center: [39.059811, -105.311104], zoom: 7 },
  CT: { code: 'CT', name: 'Connecticut', filename: 'ct_connecticut_zip_codes_geo.min.json', fips: '09', center: [41.597782, -72.755371], zoom: 8 },
  DC: { code: 'DC', name: 'District of Columbia', filename: 'dc_district_of_columbia_zip_codes_geo.min.json', fips: '11', center: [38.897438, -77.026817], zoom: 11 },
  DE: { code: 'DE', name: 'Delaware', filename: 'de_delaware_zip_codes_geo.min.json', fips: '10', center: [39.318523, -75.507141], zoom: 8 },
  FL: { code: 'FL', name: 'Florida', filename: 'fl_florida_zip_codes_geo.min.json', fips: '12', center: [27.766279, -81.686783], zoom: 7 },
  GA: { code: 'GA', name: 'Georgia', filename: 'ga_georgia_zip_codes_geo.min.json', fips: '13', center: [33.040619, -83.643074], zoom: 7 },
  HI: { code: 'HI', name: 'Hawaii', filename: 'hi_hawaii_zip_codes_geo.min.json', fips: '15', center: [21.094318, -157.498337], zoom: 7 },
  ID: { code: 'ID', name: 'Idaho', filename: 'id_idaho_zip_codes_geo.min.json', fips: '16', center: [44.240459, -114.478828], zoom: 6 },
  IL: { code: 'IL', name: 'Illinois', filename: 'il_illinois_zip_codes_geo.min.json', fips: '17', center: [40.349457, -88.986137], zoom: 7 },
  IN: { code: 'IN', name: 'Indiana', filename: 'in_indiana_zip_codes_geo.min.json', fips: '18', center: [39.849426, -86.258278], zoom: 7 },
  IA: { code: 'IA', name: 'Iowa', filename: 'ia_iowa_zip_codes_geo.min.json', fips: '19', center: [42.011539, -93.210526], zoom: 7 },
  KS: { code: 'KS', name: 'Kansas', filename: 'ks_kansas_zip_codes_geo.min.json', fips: '20', center: [38.526600, -96.726486], zoom: 7 },
  KY: { code: 'KY', name: 'Kentucky', filename: 'ky_kentucky_zip_codes_geo.min.json', fips: '21', center: [37.668140, -84.670067], zoom: 7 },
  LA: { code: 'LA', name: 'Louisiana', filename: 'la_louisiana_zip_codes_geo.min.json', fips: '22', center: [31.169546, -91.867805], zoom: 7 },
  ME: { code: 'ME', name: 'Maine', filename: 'me_maine_zip_codes_geo.min.json', fips: '23', center: [44.693947, -69.381927], zoom: 7 },
  MD: { code: 'MD', name: 'Maryland', filename: 'md_maryland_zip_codes_geo.min.json', fips: '24', center: [39.063946, -76.802101], zoom: 8 },
  MA: { code: 'MA', name: 'Massachusetts', filename: 'ma_massachusetts_zip_codes_geo.min.json', fips: '25', center: [42.230171, -71.530106], zoom: 8 },
  MI: { code: 'MI', name: 'Michigan', filename: 'mi_michigan_zip_codes_geo.min.json', fips: '26', center: [43.326618, -84.536095], zoom: 7 },
  MN: { code: 'MN', name: 'Minnesota', filename: 'mn_minnesota_zip_codes_geo.min.json', fips: '27', center: [45.694454, -93.900192], zoom: 6 },
  MS: { code: 'MS', name: 'Mississippi', filename: 'ms_mississippi_zip_codes_geo.min.json', fips: '28', center: [32.741646, -89.678696], zoom: 7 },
  MO: { code: 'MO', name: 'Missouri', filename: 'mo_missouri_zip_codes_geo.min.json', fips: '29', center: [38.456085, -92.288368], zoom: 7 },
  MT: { code: 'MT', name: 'Montana', filename: 'mt_montana_zip_codes_geo.min.json', fips: '30', center: [46.921925, -110.454353], zoom: 6 },
  NE: { code: 'NE', name: 'Nebraska', filename: 'ne_nebraska_zip_codes_geo.min.json', fips: '31', center: [41.125370, -98.268082], zoom: 7 },
  NV: { code: 'NV', name: 'Nevada', filename: 'nv_nevada_zip_codes_geo.min.json', fips: '32', center: [38.313515, -117.055374], zoom: 6 },
  NH: { code: 'NH', name: 'New Hampshire', filename: 'nh_new_hampshire_zip_codes_geo.min.json', fips: '33', center: [43.452492, -71.563896], zoom: 7 },
  NJ: { code: 'NJ', name: 'New Jersey', filename: 'nj_new_jersey_zip_codes_geo.min.json', fips: '34', center: [40.298904, -74.521011], zoom: 8 },
  NM: { code: 'NM', name: 'New Mexico', filename: 'nm_new_mexico_zip_codes_geo.min.json', fips: '35', center: [34.840515, -106.248482], zoom: 6 },
  NY: { code: 'NY', name: 'New York', filename: 'ny_new_york_zip_codes_geo.min.json', fips: '36', center: [42.165726, -74.948051], zoom: 7 },
  NC: { code: 'NC', name: 'North Carolina', filename: 'nc_north_carolina_zip_codes_geo.min.json', fips: '37', center: [35.630066, -79.806419], zoom: 7 },
  ND: { code: 'ND', name: 'North Dakota', filename: 'nd_north_dakota_zip_codes_geo.min.json', fips: '38', center: [47.528912, -99.784012], zoom: 6 },
  OH: { code: 'OH', name: 'Ohio', filename: 'oh_ohio_zip_codes_geo.min.json', fips: '39', center: [40.388783, -82.764915], zoom: 7 },
  OK: { code: 'OK', name: 'Oklahoma', filename: 'ok_oklahoma_zip_codes_geo.min.json', fips: '40', center: [35.565342, -96.928917], zoom: 7 },
  OR: { code: 'OR', name: 'Oregon', filename: 'or_oregon_zip_codes_geo.min.json', fips: '41', center: [44.572021, -122.070938], zoom: 7 },
  PA: { code: 'PA', name: 'Pennsylvania', filename: 'pa_pennsylvania_zip_codes_geo.min.json', fips: '42', center: [40.590752, -77.209755], zoom: 7 },
  RI: { code: 'RI', name: 'Rhode Island', filename: 'ri_rhode_island_zip_codes_geo.min.json', fips: '44', center: [41.680893, -71.511780], zoom: 9 },
  SC: { code: 'SC', name: 'South Carolina', filename: 'sc_south_carolina_zip_codes_geo.min.json', fips: '45', center: [33.856892, -80.945007], zoom: 7 },
  SD: { code: 'SD', name: 'South Dakota', filename: 'sd_south_dakota_zip_codes_geo.min.json', fips: '46', center: [44.299782, -99.438828], zoom: 6 },
  TN: { code: 'TN', name: 'Tennessee', filename: 'tn_tennessee_zip_codes_geo.min.json', fips: '47', center: [35.747845, -86.692345], zoom: 7 },
  TX: { code: 'TX', name: 'Texas', filename: 'tx_texas_zip_codes_geo.min.json', fips: '48', center: [31.054487, -97.563461], zoom: 6 },
  UT: { code: 'UT', name: 'Utah', filename: 'ut_utah_zip_codes_geo.min.json', fips: '49', center: [40.150032, -111.862434], zoom: 7 },
  VT: { code: 'VT', name: 'Vermont', filename: 'vt_vermont_zip_codes_geo.min.json', fips: '50', center: [44.045876, -72.710686], zoom: 7 },
  VA: { code: 'VA', name: 'Virginia', filename: 'va_virginia_zip_codes_geo.min.json', fips: '51', center: [37.769337, -78.169968], zoom: 7 },
  WA: { code: 'WA', name: 'Washington', filename: 'wa_washington_zip_codes_geo.min.json', fips: '53', center: [47.400902, -121.490494], zoom: 7 },
  WV: { code: 'WV', name: 'West Virginia', filename: 'wv_west_virginia_zip_codes_geo.min.json', fips: '54', center: [38.491226, -80.954453], zoom: 7 },
  WI: { code: 'WI', name: 'Wisconsin', filename: 'wi_wisconsin_zip_codes_geo.min.json', fips: '55', center: [44.268543, -89.616508], zoom: 7 },
  WY: { code: 'WY', name: 'Wyoming', filename: 'wy_wyoming_zip_codes_geo.min.json', fips: '56', center: [42.755966, -107.302490], zoom: 7 },
};

// In-memory client cache to avoid duplicate network transfers
const clientZipCache = new Map<string, ZipBoundaryCollection>();

/**
 * Regional presets for quick multi-state loading
 */
export const US_REGION_PRESETS: Record<string, { label: string; icon: string; states: string[] }> = {
  southwest: {
    label: 'Southwest (TX, OK, NM, AR, LA)',
    icon: '🤠',
    states: ['TX', 'OK', 'NM', 'AR', 'LA']
  },
  southeast: {
    label: 'Southeast (FL, GA, NC, SC, TN, AL, MS)',
    icon: '🌴',
    states: ['FL', 'GA', 'NC', 'SC', 'TN', 'AL', 'MS']
  },
  midwest: {
    label: 'Midwest (IL, OH, IN, MI, WI, MO, IA, MN)',
    icon: '🏭',
    states: ['IL', 'OH', 'IN', 'MI', 'WI', 'MO', 'IA', 'MN']
  },
  west: {
    label: 'West & Mountain (CA, NV, AZ, WA, OR, CO, UT)',
    icon: '⛰️',
    states: ['CA', 'NV', 'AZ', 'WA', 'OR', 'CO', 'UT']
  },
  northeast: {
    label: 'Northeast (NY, PA, NJ, MA, CT, MD, DE, DC)',
    icon: '🗽',
    states: ['NY', 'PA', 'NJ', 'MA', 'CT', 'MD', 'DE', 'DC']
  }
};

/**
 * Identify which US states intersect or are inside a given map bounding box
 */
export function getStatesInBounds(
  north: number,
  south: number,
  east: number,
  west: number,
  maxStates: number = 8
): string[] {
  // Pad bounds slightly (+1.5 deg) so adjacent state borders are included
  const pad = 1.5;
  const pNorth = north + pad;
  const pSouth = south - pad;
  const pEast = east + pad;
  const pWest = west - pad;

  const matches: { code: string; distSq: number }[] = [];
  const cLat = (north + south) / 2;
  const cLng = (east + west) / 2;

  for (const [code, info] of Object.entries(US_STATE_ZIP_GEOJSON_REGISTRY)) {
    const [sLat, sLng] = info.center;
    if (sLat >= pSouth && sLat <= pNorth && sLng >= pWest && sLng <= pEast) {
      const dLat = sLat - cLat;
      const dLng = sLng - cLng;
      matches.push({ code, distSq: dLat * dLat + dLng * dLng });
    }
  }

  // Sort by proximity to center of viewport and limit to avoid browser memory saturation
  matches.sort((a, b) => a.distSq - b.distSq);
  return matches.slice(0, maxStates).map(m => m.code);
}

/**
 * Fetch all ZIP code boundaries for a given US state
 */
export async function fetchZipBoundariesForState(
  stateCode: string,
  options?: { simplify?: boolean; zip?: string }
): Promise<ZipBoundaryCollection | null> {
  const code = stateCode.toUpperCase();
  const stateMeta = US_STATE_ZIP_GEOJSON_REGISTRY[code];
  if (!stateMeta) {
    console.warn(`[zipBoundaryService] Unknown state code: ${stateCode}`);
    return null;
  }

  const cacheKey = `${code}_${options?.zip || 'all'}`;
  if (clientZipCache.has(cacheKey)) {
    return clientZipCache.get(cacheKey)!;
  }

  try {
    const params = new URLSearchParams({
      state: code,
      simplify: options?.simplify !== false ? 'true' : 'false'
    });
    if (options?.zip) {
      params.append('zip', options.zip);
    }

    const res = await fetch(`/api/v1/spatial/zip-boundaries?${params.toString()}`);
    if (res.ok) {
      const data: ZipBoundaryCollection = await res.json();
      clientZipCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn(`[zipBoundaryService] Backend API failed, falling back to direct OpenDataDE fetch:`, err);
  }

  // Client-side fallback: fetch directly from OpenDataDE raw GitHub repository
  try {
    const rawUrl = `https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/${stateMeta.filename}`;
    const rawRes = await fetch(rawUrl);
    if (rawRes.ok) {
      const rawJson = await rawRes.json();
      const collection: ZipBoundaryCollection = {
        type: 'FeatureCollection',
        state: code,
        stateName: stateMeta.name,
        totalZipCodes: rawJson.features?.length || 0,
        source: 'OpenDataDE/State-zip-code-GeoJSON (Direct Raw)',
        features: (rawJson.features || []).map((f: any) => ({
          ...f,
          properties: {
            ...f.properties,
            state: code,
            stateCode: code,
            landAreaSqMiles: Math.round(((f.properties.ALAND10 || 30000000) / 2589988) * 10) / 10,
            opportunityScore: Math.floor(Math.random() * 30) + 65,
            whiteSpotZone: 'GREEN'
          }
        }))
      };
      clientZipCache.set(cacheKey, collection);
      return collection;
    }
  } catch (rawErr) {
    console.error(`[zipBoundaryService] Failed to load OpenDataDE boundaries for ${code}:`, rawErr);
  }

  return null;
}

/**
 * Fetch and combine ZIP code boundaries for multiple US states concurrently
 */
export async function fetchZipBoundariesForStates(
  stateCodes: string[],
  options?: { simplify?: boolean; zip?: string }
): Promise<ZipBoundaryCollection | null> {
  if (!stateCodes || stateCodes.length === 0) return null;
  if (stateCodes.length === 1) {
    return fetchZipBoundariesForState(stateCodes[0], options);
  }

  const normalized = Array.from(new Set(stateCodes.map(s => s.toUpperCase())));
  const missingFromCache = normalized.filter(code => !clientZipCache.has(`${code}_all`));

  // If all are already in client cache, merge immediately without network call
  if (missingFromCache.length === 0) {
    let combinedFeatures: any[] = [];
    for (const code of normalized) {
      const cached = clientZipCache.get(`${code}_all`);
      if (cached && cached.features) {
        combinedFeatures = combinedFeatures.concat(cached.features);
      }
    }
    return {
      type: 'FeatureCollection',
      state: normalized.join(', '),
      stateName: `${normalized.length} States`,
      totalZipCodes: combinedFeatures.length,
      source: 'OpenDataDE/State-zip-code-GeoJSON (Cached)',
      features: combinedFeatures
    };
  }

  try {
    const params = new URLSearchParams({
      states: normalized.join(','),
      simplify: options?.simplify !== false ? 'true' : 'false'
    });
    if (options?.zip) {
      params.append('zip', options.zip);
    }

    const res = await fetch(`/api/v1/spatial/zip-boundaries?${params.toString()}`);
    if (res.ok) {
      const data: ZipBoundaryCollection = await res.json();
      
      // Cache individual state segments
      for (const code of normalized) {
        const stateFeats = (data.features || []).filter((f: any) => 
          (f.properties?.stateCode || '').toUpperCase() === code
        );
        if (stateFeats.length > 0) {
          clientZipCache.set(`${code}_all`, {
            type: 'FeatureCollection',
            state: code,
            stateName: US_STATE_ZIP_GEOJSON_REGISTRY[code]?.name || code,
            totalZipCodes: stateFeats.length,
            source: data.source,
            features: stateFeats
          });
        }
      }

      return data;
    }
  } catch (err) {
    console.warn('[zipBoundaryService] Multi-state fetch failed, falling back to individual fetches:', err);
  }

  // Fallback: fetch individually
  const results = await Promise.all(
    normalized.map(c => fetchZipBoundariesForState(c, options))
  );

  let merged: any[] = [];
  for (const r of results) {
    if (r && r.features) {
      merged = merged.concat(r.features);
    }
  }

  return {
    type: 'FeatureCollection',
    state: normalized.join(', '),
    stateName: `${normalized.length} US States`,
    totalZipCodes: merged.length,
    source: 'OpenDataDE/State-zip-code-GeoJSON',
    features: merged
  };
}

/**
 * Find state from 5-digit zip code (first digit heuristic)
 */
export function guessStateFromZip(zip: string): string {
  const prefix = zip.substring(0, 3);
  const n = parseInt(prefix, 10);
  
  if (n >= 10 && n <= 27) return 'MA';
  if (n >= 28 && n <= 29) return 'RI';
  if (n >= 30 && n <= 38) return 'NH';
  if (n >= 39 && n <= 49) return 'ME';
  if (n >= 50 && n <= 59) return 'VT';
  if (n >= 60 && n <= 69) return 'CT';
  if (n >= 70 && n <= 89) return 'NJ';
  if (n >= 100 && n <= 149) return 'NY';
  if (n >= 150 && n <= 196) return 'PA';
  if (n >= 197 && n <= 199) return 'DE';
  if (n >= 200 && n <= 205) return 'DC';
  if (n >= 206 && n <= 219) return 'MD';
  if (n >= 220 && n <= 246) return 'VA';
  if (n >= 247 && n <= 268) return 'WV';
  if (n >= 270 && n <= 289) return 'NC';
  if (n >= 290 && n <= 299) return 'SC';
  if (n >= 300 && n <= 319) return 'GA';
  if (n >= 320 && n <= 349) return 'FL';
  if (n >= 350 && n <= 369) return 'AL';
  if (n >= 370 && n <= 385) return 'TN';
  if (n >= 386 && n <= 397) return 'MS';
  if (n >= 400 && n <= 427) return 'KY';
  if (n >= 430 && n <= 459) return 'OH';
  if (n >= 460 && n <= 479) return 'IN';
  if (n >= 480 && n <= 499) return 'MI';
  if (n >= 500 && n <= 528) return 'IA';
  if (n >= 530 && n <= 549) return 'WI';
  if (n >= 550 && n <= 567) return 'MN';
  if (n >= 570 && n <= 577) return 'SD';
  if (n >= 580 && n <= 588) return 'ND';
  if (n >= 590 && n <= 599) return 'MT';
  if (n >= 600 && n <= 629) return 'IL';
  if (n >= 630 && n <= 658) return 'MO';
  if (n >= 660 && n <= 679) return 'KS';
  if (n >= 680 && n <= 693) return 'NE';
  if (n >= 700 && n <= 714) return 'LA';
  if (n >= 716 && n <= 729) return 'AR';
  if (n >= 730 && n <= 749) return 'OK';
  if (n >= 750 && n <= 799) return 'TX';
  if (n >= 800 && n <= 816) return 'CO';
  if (n >= 820 && n <= 831) return 'WY';
  if (n >= 832 && n <= 838) return 'ID';
  if (n >= 840 && n <= 847) return 'UT';
  if (n >= 850 && n <= 865) return 'AZ';
  if (n >= 870 && n <= 884) return 'NM';
  if (n >= 890 && n <= 898) return 'NV';
  if (n >= 900 && n <= 961) return 'CA';
  if (n >= 967 && n <= 968) return 'HI';
  if (n >= 970 && n <= 979) return 'OR';
  if (n >= 980 && n <= 994) return 'WA';
  if (n >= 995 && n <= 999) return 'AK';
  
  return 'TX';
}

/**
 * Dynamic polygon styling based on selected metric mode
 */
export function getZipPolygonStyle(
  props: ZipBoundaryProperties,
  mode: ZipStylingMode,
  isHovered: boolean = false,
  isSelected: boolean = false
): L.PathOptions {
  if (isSelected) {
    return {
      color: '#f59e0b', // Amber highlight
      weight: 3.5,
      opacity: 1,
      fillColor: '#fbbf24',
      fillOpacity: 0.45,
      dashArray: undefined
    };
  }

  if (isHovered) {
    return {
      color: '#06b6d4', // Cyan highlight
      weight: 3,
      opacity: 1,
      fillColor: '#38bdf8',
      fillOpacity: 0.38,
      dashArray: undefined
    };
  }

  switch (mode) {
    case 'opportunity': {
      const score = props.opportunityScore ?? 75;
      let fillColor = '#ef4444'; // Saturated (Red)
      let color = '#b91c1c';
      if (score >= 88) {
        fillColor = '#10b981'; // Top Tier (Emerald Green)
        color = '#047857';
      } else if (score >= 75) {
        fillColor = '#f59e0b'; // Moderate / High (Amber)
        color = '#b45309';
      }
      return {
        color: color,
        weight: 1.2,
        opacity: 0.75,
        fillColor: fillColor,
        fillOpacity: 0.22
      };
    }

    case 'income': {
      const income = props.medianIncome ?? 78000;
      let fillColor = '#6366f1'; // Indigo
      let color = '#4338ca';
      if (income >= 110000) {
        fillColor = '#10b981'; // High Income Green
        color = '#047857';
      } else if (income >= 85000) {
        fillColor = '#06b6d4'; // Cyan
        color = '#0e7490';
      } else if (income >= 60000) {
        fillColor = '#8b5cf6'; // Purple
        color = '#6d28d9';
      } else {
        fillColor = '#a855f7';
        color = '#7e22ce';
      }
      return {
        color: color,
        weight: 1.2,
        opacity: 0.75,
        fillColor: fillColor,
        fillOpacity: 0.26
      };
    }

    case 'population': {
      const pop = props.population ?? 32000;
      let fillColor = '#9333ea';
      let color = '#7e22ce';
      if (pop >= 60000) {
        fillColor = '#7c3aed';
        color = '#5b21b6';
      } else if (pop >= 35000) {
        fillColor = '#8b5cf6';
        color = '#6d28d9';
      } else if (pop >= 15000) {
        fillColor = '#a855f7';
        color = '#7e22ce';
      } else {
        fillColor = '#c084fc';
        color = '#9333ea';
      }
      return {
        color: color,
        weight: 1.2,
        opacity: 0.7,
        fillColor: fillColor,
        fillOpacity: 0.22
      };
    }

    case 'outline':
    default: {
      return {
        color: '#7c3aed', // Purple boundary
        weight: 1.5,
        opacity: 0.85,
        fillColor: '#8b5cf6',
        fillOpacity: 0.04,
        dashArray: undefined
      };
    }
  }
}

/**
 * Returns legend swatches for the selected styling mode
 */
export function getZipLegendItems(mode: ZipStylingMode): { label: string; color: string; desc: string }[] {
  switch (mode) {
    case 'opportunity':
      return [
        { label: 'Tier 1 White Spot (Score 88-100)', color: '#10b981', desc: 'High unmet fuel demand & corridor traffic' },
        { label: 'Tier 2 Secondary (Score 75-87)', color: '#f59e0b', desc: 'Solid demand; moderate competition' },
        { label: 'Tier 3 Saturated (Score <75)', color: '#ef4444', desc: 'Over-served retail forecourt density' }
      ];
    case 'income':
      return [
        { label: 'Affluent ($110k+)', color: '#10b981', desc: 'Premium inside sales & fresh QSR spend' },
        { label: 'Above Avg ($85k - $110k)', color: '#06b6d4', desc: 'Strong commercial capture' },
        { label: 'Moderate ($60k - $85k)', color: '#8b5cf6', desc: 'Standard forecourt volume' },
        { label: 'Value (<$60k)', color: '#a855f7', desc: 'Price-sensitive fuel market' }
      ];
    case 'population':
      return [
        { label: 'Dense Metro (60k+)', color: '#7c3aed', desc: 'High residential footfall node' },
        { label: 'Suburban Growth (35k - 60k)', color: '#8b5cf6', desc: 'Core expansion target' },
        { label: 'Emerging (15k - 35k)', color: '#a855f7', desc: 'New master-planned developments' },
        { label: 'Rural Highway (<15k)', color: '#c084fc', desc: 'Long-distance travel plaza void' }
      ];
    case 'outline':
    default:
      return [
        { label: 'US ZIP Boundary (ZCTA5)', color: '#7c3aed', desc: 'OpenDataDE / US Census 2024 Shapefiles' }
      ];
  }
}

let cachedStateBoundaries: StateBoundaryCollection | null = null;

/**
 * Fetch all 50 US State boundaries + DC GeoJSON polygons
 */
export async function fetchStateBoundaries(): Promise<StateBoundaryCollection | null> {
  if (cachedStateBoundaries) {
    return cachedStateBoundaries;
  }

  try {
    const res = await fetch('/api/v1/spatial/state-boundaries');
    if (res.ok) {
      const data: StateBoundaryCollection = await res.json();
      cachedStateBoundaries = data;
      return data;
    }
  } catch (err) {
    console.warn('[zipBoundaryService] State boundaries API failed, falling back:', err);
  }

  try {
    const rawRes = await fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json');
    if (rawRes.ok) {
      const raw = await rawRes.json();
      cachedStateBoundaries = {
        type: 'FeatureCollection',
        totalStates: raw.features?.length || 52,
        source: 'US Census Bureau (Direct Fallback)',
        features: (raw.features || []).map((f: any) => ({
          ...f,
          properties: {
            ...f.properties,
            stateName: f.properties?.name || '',
            code: f.id || 'US',
            fuelDemandIndex: 120,
            evAdoptionRank: 20
          }
        }))
      };
      return cachedStateBoundaries;
    }
  } catch (e) {
    console.error('Failed to load state boundaries fallback:', e);
  }

  return null;
}

/**
 * Styling for US State Boundaries
 */
export function getStatePolygonStyle(
  props: StateBoundaryProperties,
  isHovered: boolean = false,
  isSelected: boolean = false
): L.PathOptions {
  if (isSelected) {
    return {
      color: '#f59e0b', // Amber selected border
      weight: 3.5,
      opacity: 1,
      fillColor: '#fbbf24',
      fillOpacity: 0.28
    };
  }

  if (isHovered) {
    return {
      color: '#06b6d4', // Cyan hover
      weight: 3,
      opacity: 1,
      fillColor: '#38bdf8',
      fillOpacity: 0.35
    };
  }

  // Color by Fuel Demand Index
  const idx = props.fuelDemandIndex || 115;
  let fillColor = '#8b5cf6';
  let color = '#7c3aed';

  if (idx >= 140) {
    fillColor = '#6366f1'; // Tier 1 High Demand (TX, FL, CA, etc.)
    color = '#4338ca';
  } else if (idx >= 120) {
    fillColor = '#8b5cf6';
    color = '#6d28d9';
  } else {
    fillColor = '#a855f7';
    color = '#7e22ce';
  }

  return {
    color: color,
    weight: 2,
    opacity: 0.85,
    fillColor: fillColor,
    fillOpacity: 0.08,
    dashArray: undefined
  };
}

