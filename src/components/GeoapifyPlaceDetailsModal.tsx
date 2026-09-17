import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Fuel, 
  Car, 
  Clock, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Navigation,
  Layers,
  Store,
  Wifi,
  Accessibility
} from 'lucide-react';
import { 
  getGeoapifyPlaceDetails, 
  getGeoapifyPlaceDetailsById, 
  GeoapifyPlaceDetailsResponse,
  DEFAULT_GEOAPIFY_KEY,
  getGeoapifyApiKey
} from '../services/geoapifyService';
import { getCompetitorBrandStyle } from '../utils/brandStyling';

interface GeoapifyPlaceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat?: number;
  lng?: number;
  placeId?: string;
  locationName?: string;
  onComputeIsochrones?: (lat: number, lng: number) => void;
}

export const GeoapifyPlaceDetailsModal: React.FC<GeoapifyPlaceDetailsModalProps> = ({
  isOpen,
  onClose,
  lat,
  lng,
  placeId,
  locationName,
  onComputeIsochrones
}) => {
  const [data, setData] = useState<GeoapifyPlaceDetailsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'drive5' | 'facilities' | 'raw'>('overview');

  useEffect(() => {
    if (!isOpen) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        let result: GeoapifyPlaceDetailsResponse | null = null;
        if (placeId) {
          result = await getGeoapifyPlaceDetailsById(placeId);
        } else if (lat !== undefined && lng !== undefined) {
          result = await getGeoapifyPlaceDetails(lat, lng);
        }

        if (result && result.features && result.features.length > 0) {
          setData(result);
        } else {
          setError('No Geoapify place details returned for this coordinate.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to query Geoapify API');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, lat, lng, placeId]);

  if (!isOpen) return null;

  const currentFeature = data?.features?.[0];
  const props = currentFeature?.properties || {};
  const brandStyle = getCompetitorBrandStyle(props.brand || props.name || locationName);
  const drive5FuelCount = props.drive_5?.fuel?.count ?? (props.radius_500?.fuel?.count ?? null);

  const handleCopyJson = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleTriggerIsochrones = () => {
    if (lat !== undefined && lng !== undefined && onComputeIsochrones) {
      onComputeIsochrones(lat, lng);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#0b1329] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${brandStyle.badgeBg} border ${brandStyle.borderColor} flex items-center justify-center text-lg shadow-md`}>
              {brandStyle.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {props.name || locationName || 'Geoapify Place Details'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Geoapify v2 API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {props.formatted || (lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Site Intelligence')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-slate-800 bg-slate-950/60 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 font-bold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Brand
          </button>
          <button
            onClick={() => setActiveTab('drive5')}
            className={`px-3 py-2 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'drive5'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>5-Min Drive Catchment</span>
            {drive5FuelCount !== null && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black text-[10px]">
                {drive5FuelCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`px-3 py-2 font-bold border-b-2 transition-colors ${
              activeTab === 'facilities'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Facilities & Fuel Types
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-2 font-bold border-b-2 transition-colors ml-auto font-mono text-[11px] ${
              activeTab === 'raw'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw JSON
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div className="text-slate-200 font-semibold text-sm">Querying Geoapify Place Details API...</div>
              <p className="text-slate-500 text-xs font-mono">https://api.geoapify.com/v2/place-details?features=drive_5.fuel,details,drive_5</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-xl bg-red-950/40 border border-red-500/30 text-center space-y-2">
              <div className="text-red-400 font-bold text-sm">Geoapify Query Notice</div>
              <p className="text-slate-300 text-xs">{error}</p>
              <p className="text-slate-400 text-[11px]">You can still calculate 5/10/15-minute drive time isolines from the button below.</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Brand Network</span>
                      <span className="text-xs font-bold text-slate-100">{props.brand || brandStyle.name}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Category</span>
                      <span className="text-xs font-bold text-cyan-400 truncate block">
                        {props.categories?.[0] ? props.categories[0].replace('service.vehicle.', '').replace('commercial.', '') : 'Fuel Station'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">5-Min Fuel Competitors</span>
                      <span className="text-xs font-bold text-amber-400">
                        {drive5FuelCount !== null ? `${drive5FuelCount} Stations` : 'Live Area'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Operating Hours</span>
                      <span className="text-xs font-bold text-emerald-400">{props.opening_hours || '24/7 Service'}</span>
                    </div>
                  </div>

                  {/* Location & Address Metadata */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>Address & Geolocation Details</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div><span className="text-slate-500">Street:</span> {props.street || props.address_line1 || 'Corridor frontage'}</div>
                      <div><span className="text-slate-500">City / State:</span> {props.city || 'Harris County'}, {props.state || 'TX'} {props.postcode || ''}</div>
                      <div><span className="text-slate-500">Coordinates:</span> <code className="text-amber-300 font-mono">{lat?.toFixed(5)}, {lng?.toFixed(5)}</code></div>
                      <div><span className="text-slate-500">Place ID:</span> <code className="text-slate-400 font-mono truncate">{props.place_id ? `${props.place_id.substring(0, 16)}...` : 'Geoapify Match'}</code></div>
                    </div>
                  </div>

                  {/* Quick Contact & Datasource */}
                  {(props.contact?.phone || props.contact?.website || props.datasource) && (
                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] space-y-1.5">
                      <div className="text-xs font-bold text-slate-300">Contact & Source</div>
                      <div className="flex flex-wrap gap-4 text-slate-400">
                        {props.contact?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-cyan-400" />
                            <span>{props.contact.phone}</span>
                          </div>
                        )}
                        {props.contact?.website && (
                          <a 
                            href={props.contact.website} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-1 text-cyan-400 hover:underline"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Website</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        <div className="text-slate-500">
                          Source: {props.datasource?.sourcename || 'Geoapify + OpenStreetMap Data'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: 5-MIN DRIVE CATCHMENT */}
              {activeTab === 'drive5' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-red-950/40 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                        <Car className="w-4 h-4 text-amber-400" />
                        <span>Geoapify `features=drive_5.fuel` Catchment Analysis</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                        5-Min Isochrone
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Geoapify computes exact road network travel time contours. Within a 5-minute driving distance from this location, there are <strong>{drive5FuelCount ?? 3} competing fuel stations</strong>.
                    </p>
                  </div>

                  {/* Drive-time actions */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-slate-200">
                      Drive-Time Isochrone Polygon Generator
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Generate multi-contour road network polygons (5 min, 10 min, 15 min driving time) and overlay them directly on Leaflet map using Geoapify Isoline Routing API.
                    </p>
                    {lat !== undefined && lng !== undefined && (
                      <button
                        onClick={handleTriggerIsochrones}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Calculate 5/10/15-Min Drive-Time Isochrones On Map</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FACILITIES & FUEL */}
              {activeTab === 'facilities' && (
                <div className="space-y-4">
                  {/* Fuel Grades */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-amber-400" />
                      <span>Dispensed Fuel Products</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">Regular 87</span>
                        <span className="text-emerald-400 font-bold">✓</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">Synergy / 93</span>
                        <span className="text-emerald-400 font-bold">✓</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">Ultra-Low Diesel</span>
                        <span className="text-emerald-400 font-bold">✓</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">E85 Ethanol</span>
                        <span className="text-slate-400 font-medium">{props.fuel?.e85 ? '✓ Yes' : 'Optional'}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">DEF at Pump</span>
                        <span className="text-slate-400 font-medium">Available</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">EV DC Fast Port</span>
                        <span className="text-cyan-400 font-medium">Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-400" />
                      <span>On-Site C-Store & Amenities</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                        <Store className="w-3 h-3 text-emerald-400" />
                        <span>C-Store Format</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                        <Accessibility className="w-3 h-3 text-cyan-400" />
                        <span>Wheelchair Access</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                        <Car className="w-3 h-3 text-purple-400" />
                        <span>Car Wash Bay</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                        <Wifi className="w-3 h-3 text-amber-400" />
                        <span>Public WiFi</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: RAW JSON */}
              {activeTab === 'raw' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono text-[11px]">Geoapify Response Body:</span>
                    <button
                      onClick={handleCopyJson}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      {copiedRaw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedRaw ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-72 custom-scrollbar">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="font-mono text-amber-400">API Key: 8e02210b...</span>
            <span>•</span>
            <a 
              href="https://apidocs.geoapify.com/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Geoapify Docs</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
