/**
 * Geoapify Location Intelligence & Places API Service
 * Official Documentation: https://apidocs.geoapify.com/
 * 
 * Supports:
 * - Place Details API (v2/place-details with features=drive_5.fuel,details,drive_5)
 * - Places API (v2/places for fuel stations, EV chargers, convenience stores)
 * - Isoline Routing API (v1/isoline for 5, 10, 15 min real drive-time catchments)
 * - Geocoding Autocomplete API (v1/geocode/autocomplete)
 * - Custom Map Tiles (OSM Bright, Dark Matter Purple Roads)
 */

export const DEFAULT_GEOAPIFY_KEY = '8e02210b5a39430b980dc127dea71f41';

export function getGeoapifyApiKey(): string {
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.VITE_GEOAPIFY_API_KEY) return process.env.VITE_GEOAPIFY_API_KEY.trim();
      if (process.env.GEOAPIFY_API_KEY) return process.env.GEOAPIFY_API_KEY.trim();
    }
  } catch {}
  return DEFAULT_GEOAPIFY_KEY;
}

export interface GeoapifyPlaceFeature {
  type: string;
  properties: {
    name?: string;
    brand?: string;
    brand_details?: {
      name?: string;
      wikidata?: string;
    };
    categories?: string[];
    details?: string[];
    datasource?: {
      sourcename?: string;
      raw?: Record<string, any>;
    };
    address_line1?: string;
    address_line2?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    formatted?: string;
    lat: number;
    lon: number;
    place_id?: string;
    facilities?: {
      wheelchair?: boolean;
      internet_access?: boolean;
      toilets?: boolean;
      car_wash?: boolean;
    };
    contact?: {
      phone?: string;
      website?: string;
      email?: string;
    };
    opening_hours?: string;
    fuel?: {
      diesel?: boolean;
      octane_91?: boolean;
      octane_95?: boolean;
      octane_98?: boolean;
      lpg?: boolean;
      cng?: boolean;
      e85?: boolean;
    };
    drive_5?: {
      fuel?: {
        count?: number;
        features?: any[];
      };
      [key: string]: any;
    };
    radius_500?: {
      fuel?: {
        count?: number;
        features?: any[];
      };
      [key: string]: any;
    };
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export interface GeoapifyPlaceDetailsResponse {
  type: string;
  features: GeoapifyPlaceFeature[];
}

export interface GeoapifyIsochroneFeature {
  type: string;
  properties: {
    mode: string;
    type: string;
    range: number; // e.g. 300 (5 min), 600 (10 min), 900 (15 min)
    range_type: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
}

export interface GeoapifyIsochroneResponse {
  type: string;
  features: GeoapifyIsochroneFeature[];
}

/**
 * 1. Fetch Geoapify Place Details by Coordinates
 * Example: https://api.geoapify.com/v2/place-details?lat=29.75734&lon=-95.36766&features=drive_5.fuel,details,drive_5&apiKey=...
 */
export async function getGeoapifyPlaceDetails(
  lat: number,
  lon: number,
  features: string = 'drive_5.fuel,details,drive_5,radius_500.fuel,radius_500'
): Promise<GeoapifyPlaceDetailsResponse | null> {
  const apiKey = getGeoapifyApiKey();
  const url = `https://api.geoapify.com/v2/place-details?lat=${lat}&lon=${lon}&features=${encodeURIComponent(features)}&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      console.warn(`Geoapify place-details responded with ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Geoapify place-details fetch error:', err);
    return null;
  }
}

/**
 * 2. Fetch Geoapify Place Details by Place ID
 * Example: https://api.geoapify.com/v2/place-details?id=...&apiKey=...
 */
export async function getGeoapifyPlaceDetailsById(
  placeId: string,
  features: string = 'details,drive_5.fuel,drive_5'
): Promise<GeoapifyPlaceDetailsResponse | null> {
  const apiKey = getGeoapifyApiKey();
  const url = `https://api.geoapify.com/v2/place-details?id=${encodeURIComponent(placeId)}&features=${encodeURIComponent(features)}&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Geoapify place-details by ID failed:', err);
    return null;
  }
}

/**
 * 3. Fetch Nearby Fuel Stations & C-Stores via Geoapify Places API
 * Example: https://api.geoapify.com/v2/places?categories=service.vehicle.fuel,commercial.convenience&filter=circle:lng,lat,5000&apiKey=...
 */
export async function getGeoapifyNearbyFuelStations(
  lat: number,
  lon: number,
  radiusMeters: number = 8046 // default 5 miles
): Promise<GeoapifyPlaceFeature[]> {
  const apiKey = getGeoapifyApiKey();
  const categories = 'service.vehicle.fuel,commercial.convenience,service.vehicle.charging_station,commercial.supermarket,service.vehicle.car_wash';
  const url = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(categories)}&filter=circle:${lon},${lat},${radiusMeters}&bias=proximity:${lon},${lat}&limit=60&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.features || [];
  } catch (err) {
    console.warn('Geoapify places nearby failed:', err);
    return [];
  }
}

/**
 * 3b. Geocode Search via Geoapify Geocoding API (Fast autocomplete & address resolver)
 * Example: https://api.geoapify.com/v1/geocode/search?text=4026%20NY-52&apiKey=...
 */
export async function searchGeoapifyGeocoding(
  text: string,
  limit: number = 8
): Promise<GeoapifyPlaceFeature[]> {
  if (!text || text.trim().length < 2) return [];
  const apiKey = getGeoapifyApiKey();
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text.trim())}&filter=countrycode:us&limit=${limit}&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.features || [];
  } catch (err) {
    console.warn('Geoapify geocode search failed:', err);
    return [];
  }
}

/**
 * 4. Fetch 5, 10, 15 Minute Real Road-Network Drive-Time Isochrones (Isolines)
 * Example: https://api.geoapify.com/v1/isoline?lat=...&lon=...&type=time&mode=drive&range=300,600,900&apiKey=...
 */
export async function getGeoapifyDriveTimeIsochrones(
  lat: number,
  lon: number,
  rangesInMinutes: number[] = [5, 10, 15]
): Promise<GeoapifyIsochroneResponse | null> {
  const apiKey = getGeoapifyApiKey();
  const rangeSeconds = rangesInMinutes.map(m => m * 60).join(',');
  const url = `https://api.geoapify.com/v1/isoline?lat=${lat}&lon=${lon}&type=time&mode=drive&range=${rangeSeconds}&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Geoapify isoline fetch failed:', err);
    return null;
  }
}

/**
 * 5. Get Tile URLs for Geoapify Basemaps
 */
export function getGeoapifyTileLayerUrl(style: 'osm-bright' | 'dark-matter-purple-roads' | 'klokantech-basic' = 'osm-bright'): string {
  const apiKey = getGeoapifyApiKey();
  return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${apiKey}`;
}
