import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  Search, 
  MapPin, 
  Navigation, 
  Target, 
  Fuel, 
  Store,
  Zap, 
  Building, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Info, 
  CheckCircle2, 
  Sliders, 
  DollarSign, 
  Clock, 
  Compass, 
  Scale, 
  X, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Share2,
  Globe,
  RefreshCw,
  PlusCircle,
  Filter
} from 'lucide-react';
import { StoreLocationRecord, WhiteSpotCandidate, RadiusAnalysisData, OsmPoiRecord } from '../types';
import { RadiusIntelligenceDrawer } from './RadiusIntelligenceDrawer';
import { OsmScannerModal } from './OsmScannerModal';
import { ApiKeyGuideModal } from './ApiKeyGuideModal';
import { CompetitorPumpsPanel } from './CompetitorPumpsPanel';
import { GeoapifyPlaceDetailsModal } from './GeoapifyPlaceDetailsModal';
import { getCompetitorBrandStyle } from '../utils/brandStyling';
import { analyzeLocationRadius, fetchLiveOsmPois } from '../services/osmService';
import { haversineDistance } from '../data/osmSeedData';
import { getGeoapifyDriveTimeIsochrones, GeoapifyIsochroneResponse } from '../services/geoapifyService';
import { createCandidateFrom1ClickAnalysis } from '../services/vaultStorage';

interface InteractiveMapProps {
  locations: StoreLocationRecord[];
  whiteSpots: WhiteSpotCandidate[];
  selectedLocation: StoreLocationRecord | null;
  selectedWhiteSpot: WhiteSpotCandidate | null;
  targetCoord?: { lat: number; lng: number; displayName?: string; address?: string } | null;
  onSelectLocation: (loc: StoreLocationRecord | null) => void;
  onSelectWhiteSpot: (ws: WhiteSpotCandidate | null) => void;
  onEvaluateCustomSite: (lat: number, lng: number, address: string) => void;
  onOpenAIRecommendation: (candidate: WhiteSpotCandidate) => void;
  onAddWhiteSpot?: (cand: WhiteSpotCandidate) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locations,
  whiteSpots,
  selectedLocation,
  selectedWhiteSpot,
  targetCoord,
  onSelectLocation,
  onSelectWhiteSpot,
  onEvaluateCustomSite,
  onOpenAIRecommendation,
  onAddWhiteSpot
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const circlesGroupRef = useRef<L.LayerGroup | null>(null);
  const isochronesGroupRef = useRef<L.LayerGroup | null>(null);
  const osmPoisGroupRef = useRef<L.LayerGroup | null>(null);
  const pinnedMarkerRef = useRef<L.Marker | null>(null);

  const [mapTheme, setMapTheme] = useState<'street' | 'osm' | 'positron' | 'satellite' | 'dark'>('street');
  const [selectedRadiusMiles, setSelectedRadiusMiles] = useState<1 | 3 | 5>(3);
  const [driveTimeMinutes, setDriveTimeMinutes] = useState<number>(10);
  const [activeCatchmentMode, setActiveCatchmentMode] = useState<'radius' | 'drivetime' | 'multiring'>('radius');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(false);
  
  // Radius Intelligence Drawer & OSM Data state
  const [radiusData, setRadiusData] = useState<RadiusAnalysisData | null>(null);
  const [isRadiusLoading, setIsRadiusLoading] = useState<boolean>(false);
  const [pinnedCoord, setPinnedCoord] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  
  // OSM Scanner Modal state
  const [showOsmScannerModal, setShowOsmScannerModal] = useState<boolean>(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [showCompetitorPumpsPanel, setShowCompetitorPumpsPanel] = useState<boolean>(false);
  const [liveOsmPois, setLiveOsmPois] = useState<OsmPoiRecord[]>([]);
  const [isLoadingOsmPois, setIsLoadingOsmPois] = useState<boolean>(false);

  // Geoapify Intelligence State
  const [showGeoapifyModal, setShowGeoapifyModal] = useState<boolean>(false);
  const [geoapifyTarget, setGeoapifyTarget] = useState<{ lat: number; lng: number; name?: string; placeId?: string } | null>(null);
  const [isComputingIsochrones, setIsComputingIsochrones] = useState<boolean>(false);
  const [isochroneCount, setIsochroneCount] = useState<number>(0);
  const [savedToVaultToast, setSavedToVaultToast] = useState<{ name: string; score: number; count: number } | null>(null);

  // 18 Toggleable Layer States
  const [layers, setLayers] = useState({
    whiteSpotOpportunities: true,
    existingFuelStations: true,
    osmPoisLive: true,
    competitors: true,
    convenienceStores: true,
    trafficAadt: true,
    evChargers: true,
    highways: true,
    populationHeatmap: false,
    incomeChoropleth: false,
    footfallHeatmap: false,
    newDevelopments: true,
    catchmentBuffers: true,
    concentricRings: true,
    storePerformance: false,
    commercialPois: false,
    travelPlazas: true,
    brandQuikTrip: true,
    brandWawa: true,
    brandBucees: true,
  });

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Perform radius analysis on coordinate
  const performRadiusAnalysis = async (lat: number, lng: number, radius: 1 | 3 | 5, addressLabel?: string) => {
    setIsRadiusLoading(true);
    setPinnedCoord({ lat, lng, address: addressLabel });

    try {
      // First attempt backend API, with frontend fallback to osmService
      let analysisResult: RadiusAnalysisData | null = null;
      try {
        const response = await fetch('/api/v1/spatial/radius-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng, radiusMiles: radius, addressLabel })
        });
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.analysis) {
            analysisResult = resJson.analysis;
          }
        }
      } catch (apiErr) {
        console.warn('Backend radius API fallback to client service:', apiErr);
      }

      if (!analysisResult) {
        analysisResult = await analyzeLocationRadius(lat, lng, radius, addressLabel);
      }

      setRadiusData(analysisResult);

      // Automatically store and persist trade area analysis into the Deduplicated Vault
      if (onAddWhiteSpot && analysisResult) {
        const candidateRecord = createCandidateFrom1ClickAnalysis({
          lat,
          lng,
          label: addressLabel,
          address: addressLabel,
          radiusMiles: radius,
          competitorsCount: analysisResult.totalCompetitors || 0,
          nearestCompetitorMiles: analysisResult.nearestStationMiles || 2.1,
          competitorsPumps: analysisResult.totalPumps || 16
        });
        onAddWhiteSpot(candidateRecord);
        if (onSelectWhiteSpot) {
          onSelectWhiteSpot(candidateRecord);
        }
        setSavedToVaultToast({
          name: candidateRecord.candidateName,
          score: candidateRecord.opportunityScore,
          count: whiteSpots.length + 1
        });
        setTimeout(() => {
          setSavedToVaultToast(null);
        }, 4500);
      }
    } catch (err) {
      console.error('Radius analysis failed:', err);
    } finally {
      setIsRadiusLoading(false);
    }
  };

  // Fetch live OSM POIs on-demand strictly when a point is clicked or searched
  const loadLiveOsmPois = async (lat: number, lng: number, radius: number = 3) => {
    setIsLoadingOsmPois(true);
    try {
      const pois = await fetchLiveOsmPois(lat, lng, radius);
      // Strictly set only the POIs for this point, do not accumulate across past moves
      setLiveOsmPois(pois);
    } catch (e) {
      console.error('Failed to load OSM POIs:', e);
      setLiveOsmPois([]);
    } finally {
      setIsLoadingOsmPois(false);
    }
  };

  // Stable active catchment competitors filtered strictly for the active trade zone
  const activeCatchmentCompetitors = useMemo(() => {
    const activeCenter = pinnedCoord 
      ? { lat: pinnedCoord.lat, lng: pinnedCoord.lng }
      : selectedWhiteSpot 
      ? { lat: selectedWhiteSpot.lat, lng: selectedWhiteSpot.lng }
      : selectedLocation 
      ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
      : null;

    if (activeCenter) {
      return liveOsmPois
        .map(poi => ({
          ...poi,
          distanceMiles: Math.round(haversineDistance(activeCenter.lat, activeCenter.lng, poi.lat, poi.lng) * 100) / 100
        }))
        .filter(poi => (poi.distanceMiles || 0) <= selectedRadiusMiles)
        .sort((a, b) => (a.distanceMiles || 0) - (b.distanceMiles || 0));
    }

    return [];
  }, [liveOsmPois, pinnedCoord, selectedWhiteSpot, selectedLocation, selectedRadiusMiles]);

  // Clear pinned location and reset active competitors
  const handleClearSelection = () => {
    setPinnedCoord(null);
    setRadiusData(null);
    setLiveOsmPois([]);
    setShowCompetitorPumpsPanel(false);
    onSelectWhiteSpot(null);
    onSelectLocation(null);
    if (isochronesGroupRef.current) {
      isochronesGroupRef.current.clearLayers();
    }
    setIsochroneCount(0);
  };

  const getTileLayerInstance = (theme: 'street' | 'osm' | 'positron' | 'satellite' | 'dark') => {
    if (theme === 'satellite') {
      return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: '&copy; Esri World Imagery',
        crossOrigin: true,
      });
    }
    if (theme === 'osm') {
      return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: 'abc',
        attribution: '&copy; OpenStreetMap contributors',
        crossOrigin: true,
      });
    }
    if (theme === 'positron') {
      return L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        crossOrigin: true,
      });
    }
    if (theme === 'dark') {
      return L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        crossOrigin: true,
      });
    }
    // Default 'street' -> CartoDB Voyager (Rock solid OpenStreetMap street styling with high-bandwidth global CDN)
    return L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      crossOrigin: true,
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    // Safety cleanup for DOM container
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Default Center on US Geographic Core (Texas/Houston Crossroads)
    const map = L.map(mapContainerRef.current, {
      center: [29.98, -95.75],
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const baseTile = getTileLayerInstance(mapTheme);
    baseTile.addTo(map);

    const isochronesGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const osmPoisGroup = L.layerGroup().addTo(map);
    const circlesGroup = L.layerGroup().addTo(map);

    leafletMapRef.current = map;
    isochronesGroupRef.current = isochronesGroup;
    markersGroupRef.current = markersGroup;
    osmPoisGroupRef.current = osmPoisGroup;
    circlesGroupRef.current = circlesGroup;

    // Fix map sizing and prevent any white tiles on initial mount or container expansion
    const t1 = setTimeout(() => map.invalidateSize(), 80);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    const resizeObserver = new ResizeObserver(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleWindowResize = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleWindowResize);

    // Map click handler for custom location radius intelligence
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const cLat = Math.round(lat * 10000) / 10000;
      const cLng = Math.round(lng * 10000) / 10000;
      const label = `${cLat.toFixed(4)}, ${cLng.toFixed(4)}`;
      
      onSelectWhiteSpot(null);
      onSelectLocation(null);
      setShowCompetitorPumpsPanel(true);
      performRadiusAnalysis(cLat, cLng, selectedRadiusMiles, label);
      loadLiveOsmPois(cLat, cLng, selectedRadiusMiles);
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Handle targetCoord from Geocoding search or external navigation
  useEffect(() => {
    if (!targetCoord || !leafletMapRef.current) return;
    const { lat, lng } = targetCoord;
    const label = targetCoord.displayName || targetCoord.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    
    leafletMapRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
    leafletMapRef.current.invalidateSize();
    onSelectWhiteSpot(null);
    onSelectLocation(null);
    performRadiusAnalysis(lat, lng, selectedRadiusMiles, label);
    loadLiveOsmPois(lat, lng, selectedRadiusMiles);
  }, [targetCoord]);

  // Update Tile Layer on Theme Change
  useEffect(() => {
    if (!leafletMapRef.current) return;

    leafletMapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        leafletMapRef.current?.removeLayer(layer);
      }
    });

    const newTile = getTileLayerInstance(mapTheme);
    newTile.addTo(leafletMapRef.current);
    leafletMapRef.current.invalidateSize();
  }, [mapTheme]);

  // Compute Geoapify 5, 10, 15 minute drive-time isochrones
  const handleComputeIsochrones = async (lat: number, lng: number) => {
    if (!isochronesGroupRef.current || !leafletMapRef.current) return;
    setIsComputingIsochrones(true);

    try {
      const isoData = await getGeoapifyDriveTimeIsochrones(lat, lng, [5, 10, 15]);
      if (isoData && isoData.features && isoData.features.length > 0) {
        isochronesGroupRef.current.clearLayers();
        setIsochroneCount(isoData.features.length);

        // Sort descending so largest is drawn first
        const sorted = [...isoData.features].sort((a, b) => (b.properties?.range || 0) - (a.properties?.range || 0));

        sorted.forEach((feat: any) => {
          const rangeSec = feat.properties?.range || 300;
          const rangeMins = Math.round(rangeSec / 60);

          const color = rangeMins <= 5 ? '#f59e0b' : rangeMins <= 10 ? '#06b6d4' : '#a855f7';
          const fillOpacity = rangeMins <= 5 ? 0.28 : rangeMins <= 10 ? 0.16 : 0.08;

          const geoJsonLayer = L.geoJSON(feat, {
            style: {
              color: color,
              weight: rangeMins <= 5 ? 2.5 : 1.5,
              opacity: 0.9,
              fillColor: color,
              fillOpacity: fillOpacity,
              dashArray: rangeMins >= 15 ? '5, 5' : undefined
            }
          });

          geoJsonLayer.bindTooltip(`🚗 Geoapify ${rangeMins}-Min Driving Contour`, {
            permanent: false,
            direction: 'center',
            className: 'text-xs font-bold'
          });

          isochronesGroupRef.current?.addLayer(geoJsonLayer);
        });

        // Fit map bounds to show isochrone if available
        const firstLayer: any = isochronesGroupRef.current.getLayers()[0];
        if (firstLayer && firstLayer.getBounds) {
          leafletMapRef.current.fitBounds(firstLayer.getBounds(), { padding: [40, 40] });
        }
      }
    } catch (err) {
      console.warn('Geoapify Isochrone generation error:', err);
    } finally {
      setIsComputingIsochrones(false);
    }
  };

  // Handle radius changes for pinned location
  const handleRadiusChange = (newRadius: 1 | 3 | 5) => {
    setSelectedRadiusMiles(newRadius);
    const activeCenter = pinnedCoord 
      ? { lat: pinnedCoord.lat, lng: pinnedCoord.lng, label: pinnedCoord.address }
      : selectedWhiteSpot 
      ? { lat: selectedWhiteSpot.lat, lng: selectedWhiteSpot.lng, label: selectedWhiteSpot.candidateName }
      : selectedLocation 
      ? { lat: selectedLocation.lat, lng: selectedLocation.lng, label: selectedLocation.name }
      : null;

    if (activeCenter) {
      performRadiusAnalysis(activeCenter.lat, activeCenter.lng, newRadius, activeCenter.label);
      loadLiveOsmPois(activeCenter.lat, activeCenter.lng, newRadius);
    }
  };

  // Render Map Markers & Concentric Radius Overlays
  useEffect(() => {
    if (!leafletMapRef.current || !markersGroupRef.current || !circlesGroupRef.current || !osmPoisGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    const circlesGroup = circlesGroupRef.current;
    const osmPoisGroup = osmPoisGroupRef.current;

    markersGroup.clearLayers();
    circlesGroup.clearLayers();
    osmPoisGroup.clearLayers();

    // 1. Render Concentric Circles (1, 3, 5 Miles) around active focus coordinate
    const activeCenter = pinnedCoord 
      ? { lat: pinnedCoord.lat, lng: pinnedCoord.lng }
      : selectedWhiteSpot 
      ? { lat: selectedWhiteSpot.lat, lng: selectedWhiteSpot.lng }
      : selectedLocation 
      ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
      : null;

    if (activeCenter && layers.catchmentBuffers) {
      // 1-Mile Circle (Cyan / Inner Catchment)
      const circle1M = L.circle([activeCenter.lat, activeCenter.lng], {
        radius: 1 * 1609.34,
        color: '#06b6d4',
        weight: selectedRadiusMiles === 1 ? 3 : 1.5,
        dashArray: selectedRadiusMiles === 1 ? undefined : '4, 4',
        fillColor: '#06b6d4',
        fillOpacity: selectedRadiusMiles === 1 ? 0.18 : 0.05
      });
      circle1M.bindTooltip('1 Mile Radius (Immediate Catchment)', { permanent: false, direction: 'top' });
      circlesGroup.addLayer(circle1M);

      // 3-Mile Circle (Amber / Primary Trade Area)
      const circle3M = L.circle([activeCenter.lat, activeCenter.lng], {
        radius: 3 * 1609.34,
        color: '#f59e0b',
        weight: selectedRadiusMiles === 3 ? 3 : 1.5,
        dashArray: selectedRadiusMiles === 3 ? undefined : '5, 5',
        fillColor: '#f59e0b',
        fillOpacity: selectedRadiusMiles === 3 ? 0.14 : 0.04
      });
      circle3M.bindTooltip('3 Miles Radius (Core Secondary Trade Area)', { permanent: false, direction: 'top' });
      circlesGroup.addLayer(circle3M);

      // 5-Mile Circle (Purple / Regional Capture Zone)
      const circle5M = L.circle([activeCenter.lat, activeCenter.lng], {
        radius: 5 * 1609.34,
        color: '#a855f7',
        weight: selectedRadiusMiles === 5 ? 3 : 1.5,
        dashArray: selectedRadiusMiles === 5 ? undefined : '6, 6',
        fillColor: '#a855f7',
        fillOpacity: selectedRadiusMiles === 5 ? 0.12 : 0.03
      });
      circle5M.bindTooltip('5 Miles Radius (Regional Highway Capture Zone)', { permanent: false, direction: 'top' });
      circlesGroup.addLayer(circle5M);

      // Pinned coordinate radar pulse marker
      if (pinnedCoord) {
        const pinHtml = `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 rounded-full bg-amber-400/40 animate-ping"></div>
            <div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow-xl font-black text-xs z-10 scale-110">
              📍
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-950/95 border border-amber-500/60 text-[10px] font-bold text-amber-300 pointer-events-none shadow-md">
              ${selectedRadiusMiles}M Catchment
            </div>
          </div>
        `;
        const pinIcon = L.divIcon({
          html: pinHtml,
          className: 'custom-pin-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        const pinMarker = L.marker([pinnedCoord.lat, pinnedCoord.lng], { icon: pinIcon });
        circlesGroup.addLayer(pinMarker);
      }

      // Render Dynamic Drive-Time Isochrones if available
      if (radiusData?.isochrones) {
        // 15-min polygon (blue/purple)
        const poly15 = L.polygon(radiusData.isochrones.fifteenMin.polygonCoordinates, {
          color: '#6366f1',
          weight: 2,
          dashArray: '4, 4',
          fillColor: '#6366f1',
          fillOpacity: 0.08
        }).bindTooltip(`15-Min Drive Isochrone (${radiusData.isochrones.fifteenMin.drivablePopulation.toLocaleString()} Pop)`, { direction: 'top' });
        circlesGroup.addLayer(poly15);

        // 10-min polygon (indigo)
        const poly10 = L.polygon(radiusData.isochrones.tenMin.polygonCoordinates, {
          color: '#8b5cf6',
          weight: 2,
          fillColor: '#8b5cf6',
          fillOpacity: 0.14
        }).bindTooltip(`10-Min Drive Isochrone (${radiusData.isochrones.tenMin.drivablePopulation.toLocaleString()} Pop)`, { direction: 'top' });
        circlesGroup.addLayer(poly10);

        // 5-min polygon (purple)
        const poly5 = L.polygon(radiusData.isochrones.fiveMin.polygonCoordinates, {
          color: '#a855f7',
          weight: 2.5,
          fillColor: '#a855f7',
          fillOpacity: 0.22
        }).bindTooltip(`5-Min Drive Isochrone (${radiusData.isochrones.fiveMin.drivablePopulation.toLocaleString()} Pop)`, { direction: 'top' });
        circlesGroup.addLayer(poly5);
      }
    }

    // 2. Render Competitors & EV charging stations strictly for the active clicked point within the selected radius
    if (layers.osmPoisLive && activeCenter && activeCatchmentCompetitors.length > 0) {
      activeCatchmentCompetitors.forEach(poi => {
        const isEv = poi.amenity === 'charging_station' || !!poi.hasEvChargers;
        const isFuel = (poi.amenity === 'fuel' || (poi.pumpsCount && poi.pumpsCount > 0)) && !poi.id?.startsWith('ev-auto-');
        const isCStore = poi.shop === 'convenience' && !isFuel;

        const brandStyle = getCompetitorBrandStyle(poi.brand, poi.name);
        const pumpCount = poi.pumpsCount || 0;
        const mpdCount = Math.round(pumpCount / 2);
        const evPorts = poi.evPortCount || 8;
        const evKw = poi.evPowerKw || 250;

        let badgeBg = brandStyle.badgeBg;
        let borderColor = brandStyle.borderColor;
        let emoji = brandStyle.icon;
        let pillText = `${pumpCount}P`;
        let subtitleText = `${brandStyle.name} • ${mpdCount} MPD`;

        if (isEv && !isFuel) {
          badgeBg = 'bg-cyan-600 text-white';
          borderColor = 'border-cyan-300';
          emoji = '⚡';
          pillText = `${evPorts} EV`;
          subtitleText = `${poi.brand || poi.evNetwork || 'EV Hub'} • ${evKw}kW`;
        } else if (isCStore && !isFuel) {
          badgeBg = 'bg-emerald-600 text-white';
          borderColor = 'border-emerald-300';
          emoji = '🏪';
          pillText = 'C-Store';
          subtitleText = `${brandStyle.name} • Retail`;
        }

        const osmHtml = `
          <div class="relative flex flex-col items-center justify-center cursor-pointer group">
            <div class="flex items-center gap-1 px-1.5 py-0.5 rounded-lg ${badgeBg} border ${borderColor} shadow-md group-hover:scale-110 transition-transform">
              <span class="text-[10px]">${emoji}</span>
              <span class="text-[9px] font-black ${isEv && !isFuel ? 'text-cyan-950 bg-cyan-100' : 'text-slate-900 bg-white/90'} px-1 rounded shadow-sm">${pillText}</span>
            </div>
            <div class="mt-0.5 whitespace-nowrap px-1.5 py-0.2 rounded bg-slate-950/95 border border-slate-700/80 text-[8px] font-bold ${isEv && !isFuel ? 'text-cyan-300' : 'text-amber-300'} pointer-events-none shadow">
              ${subtitleText}
            </div>
          </div>
        `;

        const osmIcon = L.divIcon({
          html: osmHtml,
          className: 'custom-osm-competitor-icon',
          iconSize: [64, 38],
          iconAnchor: [32, 19]
        });

        const marker = L.marker([poi.lat, poi.lng], { icon: osmIcon });

        const popupContent = isEv && !isFuel ? `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 230px; padding: 6px; color: #f8fafc;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 800; color: #38bdf8; font-size: 13px;">⚡ ${poi.name}</span>
              <span style="background: #082f49; color: #38bdf8; border: 1px solid #0284c7; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 6px;">
                ${evPorts} DCFC STALLS
              </span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
              Network: <strong style="color: #e2e8f0;">${poi.evNetwork || poi.brand || 'EV Fast Network'}</strong> • ${evKw}kW Max Power
            </div>
            <div style="background: #0f172a; border-radius: 8px; padding: 6px; border: 1px solid #1e293b; margin-bottom: 6px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span style="color: #94a3b8;">Charging Speed:</span>
                <strong style="color: #38bdf8;">${evKw}kW Ultra-Fast DCFC</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span style="color: #94a3b8;">Connectors:</span>
                <strong style="color: #10b981;">${(poi.evConnectors || ['NACS / Tesla', 'CCS Combo']).join(', ')}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #94a3b8;">Forecourt Archetype:</span>
                <span style="color: #e2e8f0;">DC Fast Charging Plaza</span>
              </div>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;">
              📍 ${poi.address || poi.street || 'Alternative Fuel Corridor Node'}
            </div>
            <div style="font-size: 9px; color: #0284c7; font-weight: 600; text-align: center; margin-bottom: 4px;">
              Data Source: ${poi.source || 'OpenStreetMap & Alternative Fuel Feeds'}
            </div>
          </div>
        ` : `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; padding: 6px; color: #f8fafc;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 800; color: #fbbf24; font-size: 13px;">${brandStyle.icon} ${poi.name}</span>
              <span style="background: #451a03; color: #f59e0b; border: 1px solid #78350f; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 6px;">
                ${pumpCount} PUMPS
              </span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
              Brand: <strong style="color: #e2e8f0;">${poi.brand || brandStyle.name}</strong> • ${mpdCount} MPD Forecourt
              ${poi.forecourtConfidenceLabel ? `<span style="margin-left: 6px; font-size: 9px; padding: 1px 5px; border-radius: 4px; background: #334155; color: #94a3b8;">${poi.forecourtConfidenceLabel}</span>` : ''}
            </div>
            ${poi.pumpsEstimationRationale ? `
            <div style="font-size: 9.5px; color: #cbd5e1; background: #1e293b; padding: 4px 8px; border-radius: 6px; border: 1px solid #334155; margin-bottom: 6px;">
              ${poi.pumpsEstimationRationale}
            </div>
            ` : ''}
            <div style="background: #0f172a; border-radius: 8px; padding: 6px; border: 1px solid #1e293b; margin-bottom: 6px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span style="color: #94a3b8;">Fuel Positions:</span>
                <strong style="color: #38bdf8;">${pumpCount} Positions (${mpdCount} MPDs)</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span style="color: #94a3b8;">C-Store Format:</span>
                <strong style="color: #10b981;">${(poi.cStoreSqFt || 3800).toLocaleString()} sq ft</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #94a3b8;">Fuel Grades:</span>
                <span style="color: #e2e8f0;">Regular, Synergy/93, Diesel</span>
              </div>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;">
              📍 ${poi.address || poi.street || 'Corridor Trade Area'}
            </div>
            <div style="font-size: 9px; color: #059669; font-weight: 600; text-align: center; margin-bottom: 4px;">
              Data Source: ${poi.source || 'OpenStreetMap Overpass'}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          setShowCompetitorPumpsPanel(true);
          performRadiusAnalysis(poi.lat, poi.lng, selectedRadiusMiles, poi.name);
        });

        osmPoisGroup.addLayer(marker);
      });
    }

    // 3. Render White Spot Candidates
    if (layers.whiteSpotOpportunities) {
      whiteSpots.forEach(ws => {
        const isSelected = selectedWhiteSpot?.id === ws.id;
        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping"></div>
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 border-2 ${isSelected ? 'border-white scale-125 shadow-lg shadow-cyan-400/80' : 'border-slate-900 shadow-md'} flex items-center justify-center text-slate-950 font-black text-xs transition-transform">
              🎯
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-950/90 border border-cyan-500/50 text-[10px] font-bold text-cyan-300 pointer-events-none shadow">
              Score: ${ws.opportunityScore}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-ws-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([ws.lat, ws.lng], { icon: customIcon });
        marker.on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          onSelectWhiteSpot(ws);
          onSelectLocation(null);
          setShowCompetitorPumpsPanel(true);
          performRadiusAnalysis(ws.lat, ws.lng, selectedRadiusMiles, ws.candidateName);
          loadLiveOsmPois(ws.lat, ws.lng, selectedRadiusMiles);
        });

        markersGroup.addLayer(marker);
      });
    }

    // 4. Render Primary Network Locations
    if (layers.existingFuelStations) {
      locations.forEach(loc => {
        const isSelected = selectedLocation?.id === loc.id;
        const isBucees = loc.brand === "Buc-ee's";
        const isWawa = loc.brand === 'Wawa';
        const isQuikTrip = loc.brand === 'QuikTrip';

        let bgGradient = 'from-blue-600 to-indigo-500';
        let emoji = '⛽';

        if (isBucees) {
          bgGradient = 'from-amber-500 to-yellow-400';
          emoji = '🦫';
        } else if (isWawa) {
          bgGradient = 'from-red-600 to-rose-500';
          emoji = '🦅';
        } else if (isQuikTrip) {
          bgGradient = 'from-red-600 to-orange-500';
          emoji = '🔴';
        }

        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-6 h-6 rounded-lg bg-gradient-to-tr ${bgGradient} border ${isSelected ? 'border-white scale-125 ring-2 ring-cyan-400' : 'border-slate-900'} flex items-center justify-center text-[10px] shadow transition-transform">
              ${emoji}
            </div>
            <div class="absolute -bottom-4 whitespace-nowrap px-1 py-0.2 rounded bg-slate-900/90 text-[9px] font-medium text-slate-300 pointer-events-none">
              ${loc.brand}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-loc-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
        marker.on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          onSelectLocation(loc);
          onSelectWhiteSpot(null);
          setShowCompetitorPumpsPanel(true);
          performRadiusAnalysis(loc.lat, loc.lng, selectedRadiusMiles, loc.name);
          loadLiveOsmPois(loc.lat, loc.lng, selectedRadiusMiles);
        });

        markersGroup.addLayer(marker);
      });
    }
  }, [
    locations, 
    whiteSpots, 
    liveOsmPois,
    selectedLocation, 
    selectedWhiteSpot, 
    pinnedCoord,
    layers, 
    selectedRadiusMiles, 
    activeCatchmentMode,
    radiusData
  ]);

  // Pan to selected white spot
  useEffect(() => {
    if (!leafletMapRef.current) return;
    if (selectedWhiteSpot) {
      leafletMapRef.current.flyTo([selectedWhiteSpot.lat, selectedWhiteSpot.lng], 13, { duration: 1.0 });
    } else if (selectedLocation) {
      leafletMapRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 13, { duration: 1.0 });
    }
  }, [selectedWhiteSpot, selectedLocation]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    const q = searchQuery.toLowerCase();
    
    // Check white spots
    const foundWs = whiteSpots.find(w => 
      (w.city || '').toLowerCase().includes(q) || 
      (w.state || '').toLowerCase().includes(q) || 
      (w.zipCode || '').includes(q) || 
      (w.candidateName || '').toLowerCase().includes(q)
    );
    if (foundWs) {
      onSelectWhiteSpot(foundWs);
      performRadiusAnalysis(foundWs.lat, foundWs.lng, selectedRadiusMiles, foundWs.candidateName);
      return;
    }
    
    // Check locations
    const foundLoc = locations.find(l => 
      (l.name || '').toLowerCase().includes(q) || 
      (l.city || '').toLowerCase().includes(q) || 
      (l.state || '').toLowerCase().includes(q) || 
      (l.zipCode || '').includes(q)
    );
    if (foundLoc) {
      onSelectLocation(foundLoc);
      performRadiusAnalysis(foundLoc.lat, foundLoc.lng, selectedRadiusMiles, foundLoc.name);
    }
  };

  const handlePromoteRadiusToWhiteSpot = (rData: RadiusAnalysisData) => {
    const newCand: WhiteSpotCandidate = {
      id: `osm-detected-${Date.now()}`,
      candidateName: rData.centerAddress || `Site Catchment [${rData.centerLat}, ${rData.centerLng}]`,
      address: rData.centerAddress || `Trade Node [${rData.centerLat}, ${rData.centerLng}]`,
      city: 'Analyzed Corridor',
      state: 'US',
      county: 'Growth Buffer',
      zipCode: '77493',
      lat: rData.centerLat,
      lng: rData.centerLng,
      opportunityScore: rData.economics.whiteSpotOpportunityScore,
      demandScore: Math.min(99, Math.round(rData.demographics.population / 750)),
      supplyGapScore: Math.min(99, Math.round(rData.nearestStationMiles * 22)),
      trafficScore: Math.min(99, Math.round((rData.traffic.corridorAadt / 1000) * 1.35)),
      competitionScore: Math.max(30, 100 - rData.totalCompetitors * 8),
      commercialScore: 88,
      financialScore: 92,
      growthScore: 94,
      confidenceLevel: 'High',
      riskLevel: rData.economics.estimatedPaybackYears <= 4.0 ? 'Low' : 'Moderate',
      modelVersion: 'OSM-Radius-Engine-2026',
      primaryRationale: [
        `Catchment zone (${rData.radiusMiles} mi) contains ${rData.demographics.population.toLocaleString()} residents and ${rData.totalCompetitors} competing stations.`,
        `Corridor daily traffic of ${rData.traffic.corridorAadt.toLocaleString()} AADT with $${(rData.economics.unmetDemandGallons / 1000000).toFixed(2)}M annual unmet fuel gallons.`,
        `Nearest competing retail fuel facility is ${rData.nearestStationMiles} miles away.`
      ],
      dataGaps: ['Driveway deceleration lane engineering study recommended.'],
      projectedAnnualFuelGallons: rData.economics.unmetDemandGallons,
      projectedAnnualCStoreRevenue: rData.economics.unmetCStoreSalesUsd,
      projectedAnnualTotalRevenue: Math.round(rData.economics.unmetDemandGallons * 3.45 + rData.economics.unmetCStoreSalesUsd),
      projectedAnnualEbitda: Math.round(rData.economics.unmetDemandGallons * 0.265 + rData.economics.unmetCStoreSalesUsd * 0.38 - 620000),
      projectedDailyFootfall: Math.round(rData.traffic.corridorAadt * 0.058),
      projectedMarketSharePct: 32.5,
      estimatedCapEx: rData.economics.estimatedCapEx,
      estimatedPaybackYears: rData.economics.estimatedPaybackYears,
      estimatedIrrPct: Math.round(((rData.economics.unmetDemandGallons * 0.265) / rData.economics.estimatedCapEx) * 1000) / 10,
      estimatedNpv: Math.round((rData.economics.unmetDemandGallons * 0.265) * 5.2 - rData.economics.estimatedCapEx),
      pop3Mile: rData.demographics.population,
      medianIncome3Mile: rData.demographics.medianHouseholdIncome,
      aadt: rData.traffic.corridorAadt,
      nearestStationMiles: rData.nearestStationMiles,
      competitorCount3Miles: rData.totalCompetitors,
      proposedStoreType: 'Fuel Station + C-Store + EV Fast Charge',
      recommendedPumps: rData.economics.recommendedPumps,
      recommendedCStoreSqFt: rData.economics.recommendedCStoreSqFt,
      sourceDate: new Date().toISOString().split('T')[0]
    };

    if (onAddWhiteSpot) {
      onAddWhiteSpot(newCand);
    }
  };

  const handleScanComplete = (newCandidates: WhiteSpotCandidate[]) => {
    newCandidates.forEach(cand => {
      if (onAddWhiteSpot) {
        onAddWhiteSpot(cand);
      }
    });
    if (newCandidates.length > 0) {
      onSelectWhiteSpot(newCandidates[0]);
      performRadiusAnalysis(newCandidates[0].lat, newCandidates[0].lng, selectedRadiusMiles, newCandidates[0].candidateName);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden bg-slate-100 flex">
      {/* Interactive Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 pointer-events-none">
        {/* Search Input Pill */}
        <form onSubmit={handleSearchSubmit} className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-purple-200 shadow-xl max-w-full md:max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search US Metro, ZIP, or click map..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-purple-950 pl-9 pr-3 py-1.5 focus:outline-none placeholder:text-purple-400"
            />
          </div>
          <button type="submit" className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 cursor-pointer flex-shrink-0 min-h-[34px]">
            Analyze
          </button>
        </form>

        {/* Quick Radius & OSM Action Controls - Scrollable on Mobile */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-purple-200 shadow-xl overflow-x-auto max-w-full custom-scrollbar">
          {/* Active Site Pin / Clear Selection Button */}
          {(pinnedCoord || selectedWhiteSpot || selectedLocation) && (
            <button
              onClick={handleClearSelection}
              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs flex-shrink-0"
              title="Clear selected location and reset catchment"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Clear</span>
            </button>
          )}

          {/* 1, 3, 5 Mile Radius Switcher Pills */}
          <div className="flex items-center bg-purple-50 rounded-xl p-0.5 border border-purple-100 flex-shrink-0">
            <span className="text-[10px] text-purple-900/70 font-bold px-1.5 hidden md:inline">RADIUS:</span>
            {([1, 3, 5] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleRadiusChange(r)}
                className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRadiusMiles === r
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                    : 'text-purple-700 hover:text-purple-950 hover:bg-purple-100/60'
                }`}
              >
                {r}M
              </button>
            ))}
          </div>

          {/* Competitor Forecourt & Pumps Explorer Button */}
          <button
            onClick={() => setShowCompetitorPumpsPanel(!showCompetitorPumpsPanel)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer flex-shrink-0 ${
              showCompetitorPumpsPanel
                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/25'
                : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
            }`}
            title="Inspect Competitor Fuel Stations & Forecourt Pumps"
          >
            <Fuel className={`w-3.5 h-3.5 ${showCompetitorPumpsPanel ? 'text-white' : 'text-purple-600'}`} />
            <span>Pumps ({activeCatchmentCompetitors.length})</span>
          </button>

          {/* Regional OSM White Spot Scanner Button */}
          <button
            onClick={() => setShowOsmScannerModal(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Scan</span>
          </button>

          {/* Geoapify Place Details & Isochrone Button */}
          <button
            onClick={() => {
              const c = pinnedCoord 
                ? { lat: pinnedCoord.lat, lng: pinnedCoord.lng, name: pinnedCoord.address }
                : selectedWhiteSpot
                ? { lat: selectedWhiteSpot.lat, lng: selectedWhiteSpot.lng, name: selectedWhiteSpot.candidateName }
                : selectedLocation
                ? { lat: selectedLocation.lat, lng: selectedLocation.lng, name: selectedLocation.name }
                : leafletMapRef.current
                ? { lat: leafletMapRef.current.getCenter().lat, lng: leafletMapRef.current.getCenter().lng, name: 'Active Map Center' }
                : { lat: 29.98, lng: -95.75, name: 'Houston Metro' };
              
              setGeoapifyTarget(c);
              setShowGeoapifyModal(true);
            }}
            className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer flex-shrink-0"
            title="Geoapify Places, Fuel Details & 5/10/15-Min Drive Catchment"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden xs:inline">Geoapify</span>
          </button>

          {/* Geoapify Drive-Time Isochrones Button */}
          <button
            onClick={() => {
              const c = pinnedCoord 
                ? { lat: pinnedCoord.lat, lng: pinnedCoord.lng }
                : selectedWhiteSpot
                ? { lat: selectedWhiteSpot.lat, lng: selectedWhiteSpot.lng }
                : selectedLocation
                ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
                : leafletMapRef.current
                ? { lat: leafletMapRef.current.getCenter().lat, lng: leafletMapRef.current.getCenter().lng }
                : { lat: 29.98, lng: -95.75 };
              handleComputeIsochrones(c.lat, c.lng);
            }}
            disabled={isComputingIsochrones}
            className={`px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer flex-shrink-0 ${
              isochroneCount > 0
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
            }`}
            title="Compute 5, 10, and 15-minute road network drive-time Isochrones using Geoapify"
          >
            <Clock className={`w-3.5 h-3.5 text-purple-600 ${isComputingIsochrones ? 'animate-spin' : ''}`} />
            <span>{isComputingIsochrones ? 'Routing...' : isochroneCount > 0 ? `Drive (${isochroneCount})` : 'Drive'}</span>
          </button>

          {/* API Keys & Providers Guide Button */}
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
            title="Map Data Providers & API Key Guide"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">API Guide</span>
          </button>

          {/* Layer Panel Button */}
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 min-w-[34px] min-h-[34px] justify-center ${
              showLayerPanel 
                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20' 
                : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Left: GIS Layer Panel */}
      {showLayerPanel && (
        <div className="absolute top-28 sm:top-20 left-2 sm:left-4 z-30 w-[calc(100vw-16px)] sm:w-72 max-h-[calc(100vh-180px)] overflow-y-auto bg-white/95 backdrop-blur-md rounded-2xl border border-purple-200 p-4 shadow-2xl space-y-4 custom-scrollbar">
          <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">GIS Layer Manager</h4>
            </div>
            <button onClick={() => setShowLayerPanel(false)} className="text-purple-400 hover:text-purple-700 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">Live Geospatial POIs</div>
              <label className="flex items-center justify-between p-2 rounded-xl bg-purple-50/60 border border-purple-100 hover:border-purple-300 cursor-pointer">
                <span className="flex items-center gap-2 text-purple-950 font-semibold">
                  <span className="text-sm">⛽</span> Live OSM Forecourts ({liveOsmPois.length})
                </span>
                <input
                  type="checkbox"
                  checked={layers.osmPoisLive}
                  onChange={() => toggleLayer('osmPoisLive')}
                  className="rounded accent-purple-600"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-purple-50/60 border border-purple-100 hover:border-purple-300 cursor-pointer">
                <span className="flex items-center gap-2 text-purple-950 font-semibold">
                  <span className="text-sm">🎯</span> White Spot Targets ({whiteSpots.length})
                </span>
                <input
                  type="checkbox"
                  checked={layers.whiteSpotOpportunities}
                  onChange={() => toggleLayer('whiteSpotOpportunities')}
                  className="rounded accent-purple-600"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-purple-50/60 border border-purple-100 hover:border-purple-300 cursor-pointer">
                <span className="flex items-center gap-2 text-purple-950 font-medium">
                  <span className="text-sm">⭕</span> 1/3/5M Concentric Rings
                </span>
                <input
                  type="checkbox"
                  checked={layers.catchmentBuffers}
                  onChange={() => toggleLayer('catchmentBuffers')}
                  className="rounded accent-purple-600"
                />
              </label>
            </div>

            {/* Base Map Theme */}
            <div className="pt-2 border-t border-purple-100 space-y-1.5">
              <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">Base Map Style</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  onClick={() => setMapTheme('street')}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                    mapTheme === 'street'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  <span>Voyager Street</span>
                  <span className="text-[8px] font-normal opacity-80">OSM Street</span>
                </button>
                <button
                  onClick={() => setMapTheme('positron')}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                    mapTheme === 'positron'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  <span>Positron Light</span>
                  <span className="text-[8px] font-normal opacity-80">Clean Minimal</span>
                </button>
                <button
                  onClick={() => setMapTheme('osm')}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                    mapTheme === 'osm'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  <span>OSM Standard</span>
                  <span className="text-[8px] font-normal opacity-80">OpenStreetMap</span>
                </button>
                <button
                  onClick={() => setMapTheme('satellite')}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                    mapTheme === 'satellite'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  <span>Satellite</span>
                  <span className="text-[8px] font-normal opacity-80">ArcGIS Imagery</span>
                </button>
                <button
                  onClick={() => setMapTheme('dark')}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                    mapTheme === 'dark'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  <span>Dark Matter</span>
                  <span className="text-[8px] font-normal opacity-80">Night Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Right: Detailed Radius & OpenStreetMap Intelligence Drawer */}
      <RadiusIntelligenceDrawer
        data={radiusData}
        isLoading={isRadiusLoading}
        selectedRadius={selectedRadiusMiles}
        onChangeRadius={handleRadiusChange}
        onClose={() => {
          setRadiusData(null);
          setPinnedCoord(null);
        }}
        onPromoteToWhiteSpot={handlePromoteRadiusToWhiteSpot}
        onOpenAIRecommendation={onOpenAIRecommendation}
        onRefreshOsm={() => {
          if (pinnedCoord) {
            performRadiusAnalysis(pinnedCoord.lat, pinnedCoord.lng, selectedRadiusMiles, pinnedCoord.address);
          }
        }}
      />

      {/* Floating Competitor Forecourt Pumps Explorer Panel */}
      <CompetitorPumpsPanel
        isOpen={showCompetitorPumpsPanel}
        onClose={() => setShowCompetitorPumpsPanel(false)}
        competitors={activeCatchmentCompetitors.length > 0 ? activeCatchmentCompetitors : (radiusData?.osmPois || [])}
        activeCenterLabel={pinnedCoord?.address || selectedWhiteSpot?.candidateName || selectedLocation?.name || 'Active Map Catchment'}
        selectedRadiusMiles={selectedRadiusMiles}
        onFlyToCompetitor={(comp) => {
          if (leafletMapRef.current) {
            leafletMapRef.current.flyTo([comp.lat, comp.lng], 16, { duration: 1.2 });
          }
        }}
        onAnalyzeCompetitor={(comp) => {
          performRadiusAnalysis(comp.lat, comp.lng, selectedRadiusMiles, comp.name);
          if (leafletMapRef.current) {
            leafletMapRef.current.flyTo([comp.lat, comp.lng], 14, { duration: 1.0 });
          }
        }}
      />

      {/* Geoapify Place Details Modal */}
      <GeoapifyPlaceDetailsModal
        isOpen={showGeoapifyModal}
        onClose={() => setShowGeoapifyModal(false)}
        lat={geoapifyTarget?.lat}
        lng={geoapifyTarget?.lng}
        placeId={geoapifyTarget?.placeId}
        locationName={geoapifyTarget?.name}
        onComputeIsochrones={(lat, lng) => {
          handleComputeIsochrones(lat, lng);
        }}
      />

      {/* API Key & Data Providers Guide Modal */}
      <ApiKeyGuideModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />

      {/* OpenStreetMap Regional Scanner Modal */}
      <OsmScannerModal
        isOpen={showOsmScannerModal}
        onClose={() => setShowOsmScannerModal(false)}
        onScanComplete={handleScanComplete}
        currentMapCenter={leafletMapRef.current ? leafletMapRef.current.getCenter() : { lat: 29.98, lng: -95.75 }}
      />

      {/* Bottom Floating Legend & Active Forecourt Summary */}
      <div className="absolute bottom-14 sm:bottom-3 left-2 sm:left-4 right-2 sm:right-4 z-10 pointer-events-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        {savedToVaultToast && (
          <div className="pointer-events-auto bg-purple-950 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-2xl border border-purple-500/40 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-purple-200 hidden sm:inline">Preserved in Vault:</span>
            <span className="text-white truncate max-w-[140px] sm:max-w-[180px]">{savedToVaultToast.name}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-purple-800 text-purple-200 text-[10px]">
              Score {savedToVaultToast.score}
            </span>
            <span className="text-emerald-400 text-[10px] sm:text-[11px]">✓ Vaulted</span>
          </div>
        )}

        <div className="hidden md:flex flex-wrap items-center gap-2 text-[11px] font-sans text-purple-950 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-200 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-700">OSM + Geoapify Live</span>
          </div>
          <span className="text-purple-300">•</span>
          <span className="text-purple-700 font-medium">Click map for 1/3/5M</span>
          <span className="text-purple-300">•</span>
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="text-purple-600 hover:text-purple-800 underline font-semibold cursor-pointer"
          >
            API Guide
          </button>
        </div>

        {/* Dynamic Trade Area Forecourt Badge */}
        {(pinnedCoord || selectedWhiteSpot || selectedLocation) && (
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-purple-200 shadow-xl pointer-events-auto text-xs">
            <span className="text-purple-700 font-bold flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5" />
              {activeCatchmentCompetitors.reduce((sum, p) => sum + (p.pumpsCount || 8), 0)} Pumps
            </span>
            <span className="text-purple-200">|</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              {activeCatchmentCompetitors.length} Fuel & C-Stores
            </span>
            <button
              onClick={() => setShowCompetitorPumpsPanel(true)}
              className="ml-1 px-2 py-0.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] cursor-pointer transition-all shadow-sm shadow-purple-500/20"
            >
              Forecourts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
