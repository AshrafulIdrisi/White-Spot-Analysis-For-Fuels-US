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
import { 
  StoreLocationRecord, 
  WhiteSpotCandidate, 
  RadiusAnalysisData, 
  OsmPoiRecord,
  ZipBoundaryCollection,
  ZipBoundaryProperties,
  ZipStylingMode,
  StateBoundaryCollection,
  StateBoundaryProperties 
} from '../types';
import { RadiusIntelligenceDrawer } from './RadiusIntelligenceDrawer';
import { OsmScannerModal } from './OsmScannerModal';
import { ApiKeyGuideModal } from './ApiKeyGuideModal';
import { CompetitorPumpsPanel } from './CompetitorPumpsPanel';
import { GeoapifyPlaceDetailsModal } from './GeoapifyPlaceDetailsModal';
import { ZipBoundaryDetailModal } from './ZipBoundaryDetailModal';
import { getCompetitorBrandStyle } from '../utils/brandStyling';
import { analyzeLocationRadius, fetchLiveOsmPois } from '../services/osmService';
import { haversineDistance } from '../data/osmSeedData';
import { getGeoapifyDriveTimeIsochrones, GeoapifyIsochroneResponse, getGeoapifyApiKey } from '../services/geoapifyService';
import { createCandidateFrom1ClickAnalysis } from '../services/vaultStorage';
import { reverseGeocodeStructured } from '../services/realDataService';
import { 
  fetchZipBoundariesForState,
  fetchZipBoundariesForStates,
  getStatesInBounds,
  US_REGION_PRESETS,
  guessStateFromZip, 
  getZipPolygonStyle, 
  getZipLegendItems, 
  US_STATE_ZIP_GEOJSON_REGISTRY,
  fetchStateBoundaries,
  getStatePolygonStyle
} from '../services/zipBoundaryService';

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
  onUpdateAnalysisData?: (analysis: RadiusAnalysisData | null) => void;
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
  onAddWhiteSpot,
  onUpdateAnalysisData
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const circlesGroupRef = useRef<L.LayerGroup | null>(null);
  const isochronesGroupRef = useRef<L.LayerGroup | null>(null);
  const osmPoisGroupRef = useRef<L.LayerGroup | null>(null);
  const zipBoundariesGroupRef = useRef<L.LayerGroup | null>(null);
  const stateBoundariesGroupRef = useRef<L.LayerGroup | null>(null);
  const pinnedMarkerRef = useRef<L.Marker | null>(null);

  const [mapTheme, setMapTheme] = useState<'street' | 'osm' | 'positron' | 'satellite' | 'dark'>('street');
  const [selectedRadiusMiles, setSelectedRadiusMiles] = useState<1 | 3 | 5>(3);
  const [driveTimeMinutes, setDriveTimeMinutes] = useState<number>(10);
  const [activeCatchmentMode, setActiveCatchmentMode] = useState<'radius' | 'drivetime' | 'multiring'>('radius');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(false);

  // US All 50 State Boundaries State (US Census GeoJSON)
  const [stateBoundariesData, setStateBoundariesData] = useState<StateBoundaryCollection | null>(null);
  const [isStatesLoading, setIsStatesLoading] = useState<boolean>(false);

  // US ZIP Code Boundaries State (OpenDataDE / US Census GeoJSON)
  // Supports multi-state and nationwide dynamic viewport loading
  const [selectedZipState, setSelectedZipState] = useState<string>('TX');
  const [activeZipStates, setActiveZipStates] = useState<string[]>(['TX']);
  const [autoLoadViewportStates, setAutoLoadViewportStates] = useState<boolean>(true);
  const [zipStylingMode, setZipStylingMode] = useState<ZipStylingMode>('opportunity');
  const [isLoadingZipBoundaries, setIsLoadingZipBoundaries] = useState<boolean>(false);
  const [zipBoundariesData, setZipBoundariesData] = useState<ZipBoundaryCollection | null>(null);
  const [selectedZipProperties, setSelectedZipProperties] = useState<ZipBoundaryProperties | null>(null);
  const [isZipModalOpen, setIsZipModalOpen] = useState<boolean>(false);
  const [showStateDropdown, setShowStateDropdown] = useState<boolean>(false);
  const [stateFilterQuery, setStateFilterQuery] = useState<string>('');
  
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
  const [activeAnalysisToast, setActiveAnalysisToast] = useState<{ name: string; score: number; fuelDemand: string; revenue: string } | null>(null);

  // 20 Toggleable Layer States
  const [layers, setLayers] = useState({
    allStateBoundaries: true,
    zipCodeBoundaries: true,
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
  const performRadiusAnalysis = async (
    lat: number, 
    lng: number, 
    radius: 1 | 3 | 5, 
    addressLabel?: string,
    isExistingStore: boolean = false,
    existingCandidate?: WhiteSpotCandidate | null,
    structuredAddress?: {
      displayName: string;
      road?: string;
      city?: string;
      county?: string;
      state?: string;
      postcode?: string;
    }
  ) => {
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
      if (onUpdateAnalysisData) {
        onUpdateAnalysisData(analysisResult);
      }

      // If an existing ExxonMobil store was clicked, keep it as selectedLocation
      if (isExistingStore) {
        return;
      }

      // If an existing White Spot was clicked, enhance it with live analysis and sync across tabs
      if (existingCandidate) {
        const updatedCandidate: WhiteSpotCandidate = {
          ...existingCandidate,
          competitorCount3Miles: analysisResult?.totalCompetitors ?? existingCandidate.competitorCount3Miles,
          nearestStationMiles: analysisResult?.nearestStationMiles ?? existingCandidate.nearestStationMiles,
          aadt: analysisResult?.traffic?.corridorAadt ?? existingCandidate.aadt
        };
        if (onAddWhiteSpot) {
          onAddWhiteSpot(updatedCandidate);
        }
        if (onSelectWhiteSpot) {
          onSelectWhiteSpot(updatedCandidate);
        }
        return;
      }

      // 1-Click Map: Create clean candidate record for active selection across all tabs (without auto-storing into vault)
      if (analysisResult) {
        const candidateRecord = createCandidateFrom1ClickAnalysis({
          lat,
          lng,
          label: addressLabel,
          address: addressLabel,
          radiusMiles: radius,
          competitorsCount: analysisResult.totalCompetitors || 0,
          nearestCompetitorMiles: analysisResult.nearestStationMiles || 2.1,
          competitorsPumps: analysisResult.totalPumps || 16,
          rawAnalysis: analysisResult,
          structuredAddress
        });
        
        // 1. Store into Vault with full score, competitor fleet, population, and economics
        if (onAddWhiteSpot) {
          onAddWhiteSpot(candidateRecord);
        }

        // 2. Select as active candidate across all tabs
        if (onSelectWhiteSpot) {
          onSelectWhiteSpot(candidateRecord);
        }

        const unmetFuelMil = ((candidateRecord.tradeAreaUnmetDeficitGallons || 0) / 1000000).toFixed(2);
        const revMil = (candidateRecord.projectedAnnualTotalRevenue / 1000000).toFixed(2);
        setActiveAnalysisToast({
          name: candidateRecord.candidateName,
          score: candidateRecord.opportunityScore,
          fuelDemand: `${unmetFuelMil}M gal/yr`,
          revenue: `$${revMil}M/yr`
        });
        setTimeout(() => {
          setActiveAnalysisToast(null);
        }, 5000);
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
    const geoapifyKey = getGeoapifyApiKey();
    if (theme === 'satellite') {
      return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: '&copy; Esri World Imagery, Maxar',
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
      return L.tileLayer(`https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=${geoapifyKey}`, {
        maxZoom: 20,
        attribution: 'Powered by Geoapify | &copy; OpenStreetMap',
        crossOrigin: true,
      });
    }
    if (theme === 'dark') {
      return L.tileLayer(`https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?apiKey=${geoapifyKey}`, {
        maxZoom: 20,
        attribution: 'Powered by Geoapify | &copy; OpenStreetMap',
        crossOrigin: true,
      });
    }
    // Default 'street' -> Geoapify OSM Bright Smooth (High-speed vector-derived raster tiles, clean & no watermark)
    return L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright-smooth/{z}/{x}/{y}.png?apiKey=${geoapifyKey}`, {
      maxZoom: 20,
      attribution: 'Powered by Geoapify | &copy; OpenStreetMap',
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

    const stateBoundariesGroup = L.layerGroup().addTo(map);
    const zipBoundariesGroup = L.layerGroup().addTo(map);
    const isochronesGroup = L.layerGroup().addTo(map);
    const circlesGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const osmPoisGroup = L.layerGroup().addTo(map);

    leafletMapRef.current = map;
    stateBoundariesGroupRef.current = stateBoundariesGroup;
    zipBoundariesGroupRef.current = zipBoundariesGroup;
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
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const cLat = Math.round(lat * 10000) / 10000;
      const cLng = Math.round(lng * 10000) / 10000;
      
      onSelectWhiteSpot(null);
      onSelectLocation(null);
      setShowCompetitorPumpsPanel(true);
      
      let label = `${cLat.toFixed(4)}, ${cLng.toFixed(4)}`;
      let structuredAddress = undefined;
      try {
        const result = await reverseGeocodeStructured(cLat, cLng);
        if (result && result.displayName) {
          label = result.displayName;
          structuredAddress = result;
        }
      } catch (err) {
        console.warn('Failed structured reverse geocode:', err);
      }
      
      performRadiusAnalysis(cLat, cLng, selectedRadiusMiles, label, false, null, structuredAddress);
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

  // Load & Render All 50 US State Boundaries
  useEffect(() => {
    if (!leafletMapRef.current || !stateBoundariesGroupRef.current) return;
    const group = stateBoundariesGroupRef.current;

    if (!layers.allStateBoundaries) {
      group.clearLayers();
      return;
    }

    let isSubscribed = true;
    setIsStatesLoading(true);

    fetchStateBoundaries().then(data => {
      if (!isSubscribed || !leafletMapRef.current || !stateBoundariesGroupRef.current) return;
      setIsStatesLoading(false);

      if (!data || !data.features || data.features.length === 0) return;
      setStateBoundariesData(data);
      group.clearLayers();

      const geoJsonLayer = L.geoJSON(data as any, {
        style: (feature: any) => {
          const props: StateBoundaryProperties = feature?.properties || {};
          const isSelected = activeZipStates.includes(props.code || '');
          return getStatePolygonStyle(props, false, isSelected);
        },
        onEachFeature: (feature: any, layer: L.Layer) => {
          const props: StateBoundaryProperties = feature?.properties || {};
          const stateName = props.stateName || props.name || 'US State';
          const code = props.code || '';
          const idx = props.fuelDemandIndex || 115;
          const evRank = props.evAdoptionRank || 25;

          layer.bindTooltip(`
            <div style="font-family: system-ui, sans-serif; padding: 4px 7px; min-width: 150px;">
              <div style="font-weight: 800; color: #4338ca; font-size: 13px; margin-bottom: 2px; display: flex; justify-content: space-between;">
                <span>🏛️ ${stateName}</span>
                <span style="background: #e0e7ff; color: #3730a3; padding: 1px 5px; border-radius: 4px; font-size: 10px;">${code}</span>
              </div>
              <div style="font-size: 10px; color: #334155; line-height: 1.4;">
                <div>Fuel Demand Index: <strong style="color: ${idx >= 135 ? '#059669' : '#4338ca'}">${idx}</strong></div>
                <div>EV Adoption Rank: <strong>#${evRank} in US</strong></div>
                ${props.marketDescription ? `<div style="font-size: 9px; color: #64748b; margin-top: 2px;">${props.marketDescription}</div>` : ''}
              </div>
              <div style="margin-top: 4px; padding-top: 3px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #7c3aed; font-weight: bold;">
                👉 Click state to zoom & load all ZIP/Pincode boundaries
              </div>
            </div>
          `, { sticky: true, opacity: 0.95 });

          layer.on({
            mouseover: (e: any) => {
              const target = e.target;
              if (!activeZipStates.includes(props.code || '')) {
                target.setStyle(getStatePolygonStyle(props, true, false));
                target.bringToFront();
              }
            },
            mouseout: (e: any) => {
              const target = e.target;
              const isSelected = activeZipStates.includes(props.code || '');
              target.setStyle(getStatePolygonStyle(props, false, isSelected));
            },
            click: (e: any) => {
              L.DomEvent.stopPropagation(e);
              if (code && code !== 'US') {
                handleSelectState(code, true);
              }
            }
          });
        }
      });

      group.addLayer(geoJsonLayer);
    }).catch(err => {
      console.warn('Failed to load state boundaries:', err);
      if (isSubscribed) setIsStatesLoading(false);
    });

    return () => {
      isSubscribed = false;
    };
  }, [layers.allStateBoundaries, activeZipStates]);

  // Load & Render US ZIP Code Boundaries from OpenDataDE for All Active States
  useEffect(() => {
    if (!leafletMapRef.current || !zipBoundariesGroupRef.current) return;
    const group = zipBoundariesGroupRef.current;

    if (!layers.zipCodeBoundaries) {
      group.clearLayers();
      return;
    }

    let isSubscribed = true;
    setIsLoadingZipBoundaries(true);

    fetchZipBoundariesForStates(activeZipStates).then(collection => {
      if (!isSubscribed || !leafletMapRef.current || !zipBoundariesGroupRef.current) return;
      setIsLoadingZipBoundaries(false);

      if (!collection || !collection.features || collection.features.length === 0) {
        return;
      }

      setZipBoundariesData(collection);
      group.clearLayers();

      const geoJsonLayer = L.geoJSON(collection as any, {
        style: (feature: any) => {
          const props = feature?.properties || {};
          const isSelected = selectedZipProperties?.ZCTA5CE10 === props.ZCTA5CE10;
          return getZipPolygonStyle(props, zipStylingMode, false, isSelected);
        },
        onEachFeature: (feature: any, layer: L.Layer) => {
          const props: ZipBoundaryProperties = feature?.properties || {};
          const zipCode = props.ZCTA5CE10 || '00000';
          const score = props.opportunityScore ?? 75;
          const pop = props.population ?? 35000;
          const inc = props.medianIncome ?? 78000;
          const st = props.stateCode || props.state || '';
          const unmetM = ((props.unmetFuelGallons || 2500000) / 1000000).toFixed(1);

          layer.bindTooltip(`
            <div style="font-family: system-ui, sans-serif; padding: 4px 6px; min-width: 140px;">
              <div style="font-weight: 800; color: #6b21a8; font-size: 12px; margin-bottom: 2px;">
                📍 ZIP ${zipCode} ${st ? `(${st})` : ''} ${props.city ? `• ${props.city}` : ''}
              </div>
              <div style="font-size: 10px; color: #475569; display: flex; flex-direction: column; gap: 1px;">
                <span>White Spot Score: <strong style="color: ${score >= 88 ? '#059669' : score >= 75 ? '#d97706' : '#dc2626'}">${score}/100</strong></span>
                <span>Demand Gap: <strong style="color: #0284c7">${unmetM}M gal/yr</strong></span>
                <span>Pop: <strong>${pop.toLocaleString()}</strong> • Inc: <strong>$${inc.toLocaleString()}</strong></span>
              </div>
            </div>
          `, { sticky: true, opacity: 0.95 });

          layer.on({
            mouseover: (e: any) => {
              const target = e.target;
              if (selectedZipProperties?.ZCTA5CE10 !== props.ZCTA5CE10) {
                target.setStyle(getZipPolygonStyle(props, zipStylingMode, true, false));
                target.bringToFront();
              }
            },
            mouseout: (e: any) => {
              const target = e.target;
              const isSelected = selectedZipProperties?.ZCTA5CE10 === props.ZCTA5CE10;
              target.setStyle(getZipPolygonStyle(props, zipStylingMode, false, isSelected));
            },
            click: (e: any) => {
              L.DomEvent.stopPropagation(e);
              setSelectedZipProperties(props);
              setIsZipModalOpen(true);
            }
          });
        }
      });

      group.addLayer(geoJsonLayer);
    }).catch(err => {
      console.warn('Failed to load zip boundaries:', err);
      if (isSubscribed) setIsLoadingZipBoundaries(false);
    });

    return () => {
      isSubscribed = false;
    };
  }, [layers.zipCodeBoundaries, activeZipStates, zipStylingMode, selectedZipProperties]);

  // Auto-Load Pincodes in Viewport as user moves across the US
  useEffect(() => {
    if (!leafletMapRef.current || !autoLoadViewportStates || !layers.zipCodeBoundaries) return;
    const map = leafletMapRef.current;

    const handleMoveEnd = () => {
      const zoom = map.getZoom();
      // Only auto-load when at state or regional zoom (zoom 5+)
      if (zoom < 5) return;
      const bounds = map.getBounds();
      const visible = getStatesInBounds(
        bounds.getNorth(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getWest(),
        6
      );
      if (visible.length > 0) {
        setActiveZipStates(prev => {
          const next = Array.from(new Set([...prev, ...visible]));
          if (next.length === prev.length) return prev;
          return next;
        });
      }
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [autoLoadViewportStates, layers.zipCodeBoundaries]);

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
              ${poi.rating ? `<span style="margin-left: 6px; font-size: 10px; font-weight: bold; padding: 1px 6px; border-radius: 4px; background: #854d0e; color: #fef08a;">★ ${poi.rating} ${poi.userRatingsTotal ? `(${poi.userRatingsTotal})` : ''}</span>` : ''}
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
          performRadiusAnalysis(ws.lat, ws.lng, selectedRadiusMiles, ws.candidateName, false, ws);
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
          performRadiusAnalysis(loc.lat, loc.lng, selectedRadiusMiles, loc.name, true);
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

  const handleSelectState = (stateCode: string, flyTo: boolean = true) => {
    setSelectedZipState(stateCode);
    setActiveZipStates(prev => Array.from(new Set([...prev, stateCode])));
    setShowStateDropdown(false);
    if (!layers.zipCodeBoundaries) {
      setLayers(prev => ({ ...prev, zipCodeBoundaries: true }));
    }
    const stateMeta = US_STATE_ZIP_GEOJSON_REGISTRY[stateCode];
    if (flyTo && stateMeta && leafletMapRef.current) {
      leafletMapRef.current.flyTo(stateMeta.center, stateMeta.zoom, { duration: 1.0 });
    }
  };

  const handleToggleState = (stateCode: string) => {
    setActiveZipStates(prev => {
      if (prev.includes(stateCode)) {
        if (prev.length <= 1) return prev; // Keep at least one active state
        return prev.filter(s => s !== stateCode);
      } else {
        return [...prev, stateCode];
      }
    });
  };

  const handleSelectRegion = (regionKey: string) => {
    const preset = US_REGION_PRESETS[regionKey];
    if (preset) {
      setActiveZipStates(preset.states);
      setSelectedZipState(preset.states[0]);
      if (!layers.zipCodeBoundaries) {
        setLayers(prev => ({ ...prev, zipCodeBoundaries: true }));
      }
      const firstState = US_STATE_ZIP_GEOJSON_REGISTRY[preset.states[0]];
      if (firstState && leafletMapRef.current) {
        leafletMapRef.current.flyTo(firstState.center, Math.max(5, firstState.zoom - 1), { duration: 1.0 });
      }
    }
  };

  const handleResetToTexas = () => {
    setActiveZipStates(['TX']);
    setSelectedZipState('TX');
    const tx = US_STATE_ZIP_GEOJSON_REGISTRY['TX'];
    if (tx && leafletMapRef.current) {
      leafletMapRef.current.flyTo(tx.center, tx.zoom, { duration: 1.0 });
    }
  };

  const handleLoadAllVisibleStates = () => {
    if (!leafletMapRef.current) return;
    const bounds = leafletMapRef.current.getBounds();
    const visible = getStatesInBounds(
      bounds.getNorth(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getWest(),
      10
    );
    if (visible.length > 0) {
      setActiveZipStates(prev => Array.from(new Set([...prev, ...visible])));
    }
  };

  const handleRunAiFromZip = (props: ZipBoundaryProperties) => {
    const lat = props.INTPTLAT10 ? parseFloat(props.INTPTLAT10) : 29.98;
    const lng = props.INTPTLON10 ? parseFloat(props.INTPTLON10) : -95.75;
    const cand: WhiteSpotCandidate = {
      id: `zip-${props.ZCTA5CE10}`,
      candidateName: `ZIP ${props.ZCTA5CE10} Retail Corridor (${props.city || 'Metro'}, ${props.stateCode || props.state || 'US'})`,
      address: `Arterial Commercial Node, ZIP ${props.ZCTA5CE10}`,
      city: props.city || `Zone ${props.ZCTA5CE10}`,
      state: props.stateCode || props.state || 'US',
      county: props.county || 'Trade Area',
      zipCode: props.ZCTA5CE10,
      lat,
      lng,
      opportunityScore: props.opportunityScore ?? 86,
      demandScore: 88,
      supplyGapScore: 86,
      trafficScore: 84,
      competitionScore: 82,
      commercialScore: 87,
      financialScore: 89,
      growthScore: 91,
      confidenceLevel: 'High',
      riskLevel: (props.opportunityScore ?? 86) >= 88 ? 'Low' : 'Moderate',
      modelVersion: 'OpenDataDE-Census-2026',
      primaryRationale: [
        props.zoneRationale || `Identified strong forecourt retail demand gap in ZIP ${props.ZCTA5CE10}.`,
        `Catchment zone contains ${(props.population || 42000).toLocaleString()} residents with $${(props.medianIncome || 86500).toLocaleString()} median income.`,
        `Estimated annual unmet fuel volume deficit of ${((props.unmetFuelGallons || 2850000) / 1000000).toFixed(2)}M gallons.`
      ],
      dataGaps: ['State DOT driveway access permit review.'],
      projectedAnnualFuelGallons: props.unmetFuelGallons || 2850000,
      projectedAnnualCStoreRevenue: props.unmetCStoreDemandUsd || 2400000,
      projectedAnnualTotalRevenue: Math.round((props.unmetFuelGallons || 2850000) * 3.45 + (props.unmetCStoreDemandUsd || 2400000)),
      projectedAnnualEbitda: Math.round((props.unmetFuelGallons || 2850000) * 0.265 + (props.unmetCStoreDemandUsd || 2400000) * 0.38 - 620000),
      projectedDailyFootfall: Math.round((props.corridorAadt || 48000) * 0.056),
      projectedMarketSharePct: 28.5,
      estimatedCapEx: 5800000,
      estimatedPaybackYears: 3.8,
      estimatedIrrPct: 24.2,
      estimatedNpv: 2150000,
      pop3Mile: props.population || 42000,
      medianIncome3Mile: props.medianIncome || 86500,
      aadt: props.corridorAadt || 48000,
      nearestStationMiles: 2.8,
      competitorCount3Miles: props.existingCompetitorStations || 2,
      proposedStoreType: props.recommendedStoreFormat || '14-MPD Modern Forecourt + 5,500 sq ft C-Store',
      recommendedPumps: 14,
      recommendedCStoreSqFt: 5500,
      sourceDate: new Date().toISOString().split('T')[0]
    };
    onOpenAIRecommendation(cand);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    const q = searchQuery.toLowerCase();
    const trimmed = searchQuery.trim();

    // Check if user entered a 5-digit US ZIP Code
    if (/^\d{5}$/.test(trimmed)) {
      const targetState = guessStateFromZip(trimmed);
      setSelectedZipState(targetState);
      setActiveZipStates(prev => Array.from(new Set([...prev, targetState])));
      if (!layers.zipCodeBoundaries) {
        setLayers(prev => ({ ...prev, zipCodeBoundaries: true }));
      }
      fetchZipBoundariesForState(targetState, { zip: trimmed }).then(res => {
        const feat = res?.features?.find(f => f.properties?.ZCTA5CE10 === trimmed) || res?.features?.[0];
        if (feat) {
          setSelectedZipProperties(feat.properties);
          setIsZipModalOpen(true);
          const lat = feat.properties?.INTPTLAT10 ? parseFloat(feat.properties.INTPTLAT10) : null;
          const lng = feat.properties?.INTPTLON10 ? parseFloat(feat.properties.INTPTLON10) : null;
          if (lat && lng && leafletMapRef.current) {
            leafletMapRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
            performRadiusAnalysis(lat, lng, selectedRadiusMiles, `ZIP ${trimmed} Centroid (${feat.properties.city || ''}, ${targetState})`);
          }
        }
      });
      return;
    }
    
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

          {/* US All 50 State Boundaries Toggle Button */}
          <button
            onClick={() => {
              const nextVal = !layers.allStateBoundaries;
              toggleLayer('allStateBoundaries');
              if (nextVal && leafletMapRef.current) {
                // If currently zoomed in closer than state level, smoothly fly out to show all US states
                if (leafletMapRef.current.getZoom() > 6) {
                  leafletMapRef.current.flyTo([38.5, -96.5], 4, { duration: 1.2 });
                }
              }
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer flex-shrink-0 ${
              layers.allStateBoundaries
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25'
                : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-50'
            }`}
            title="Toggle All 50 US State Boundaries (US Census Bureau / Cartographic shapefiles)"
          >
            <span>🏛️</span>
            <span>All 50 States</span>
            {isStatesLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin text-indigo-200" />
            ) : (
              <span className="text-[10px] opacity-85">({stateBoundariesData?.totalStates || 52})</span>
            )}
          </button>

          {/* US State ZIP Code Boundaries (OpenDataDE) Multi-State Control */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowStateDropdown(!showStateDropdown)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                layers.zipCodeBoundaries
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/25'
                  : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
              }`}
              title="Toggle and switch US State ZIP Code / Pincode boundary polygons (OpenDataDE)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>
                {activeZipStates.length === 1
                  ? `Pincodes: ${activeZipStates[0]}`
                  : `Pincodes: ${activeZipStates.slice(0, 2).join(', ')}${activeZipStates.length > 2 ? ` +${activeZipStates.length - 2}` : ''}`}
              </span>
              {isLoadingZipBoundaries ? (
                <RefreshCw className="w-3 h-3 animate-spin text-purple-200" />
              ) : (
                <span className="text-[10px] opacity-80">({zipBoundariesData?.totalZipCodes || 0})</span>
              )}
            </button>

            {/* State Picker Dropdown Modal / Popover */}
            {showStateDropdown && (
              <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-88 max-w-[calc(100vw-24px)] bg-white rounded-2xl border border-purple-200 shadow-2xl p-3.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-purple-100 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span>US Pincode Boundaries (OpenDataDE)</span>
                  </div>
                  <button 
                    onClick={() => setShowStateDropdown(false)}
                    className="text-purple-400 hover:text-purple-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Auto-load in Viewport Toggle */}
                <div className="mb-2.5 p-2 rounded-xl bg-purple-50/80 border border-purple-200/80">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>Auto-Load Pincodes in View</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={autoLoadViewportStates}
                      onChange={(e) => setAutoLoadViewportStates(e.target.checked)}
                      className="rounded accent-purple-600 cursor-pointer w-4 h-4"
                    />
                  </label>
                  <p className="text-[10px] text-purple-700/80 mt-1">
                    Pan/zoom anywhere across the US to auto-load pincodes like Texas.
                  </p>
                </div>

                {/* Active States Chips & Controls */}
                <div className="mb-2.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                    <span>Active States ({activeZipStates.length})</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleLoadAllVisibleStates}
                        className="text-purple-600 hover:text-purple-900 lowercase font-medium hover:underline cursor-pointer"
                      >
                        + in view
                      </button>
                      <button
                        onClick={handleResetToTexas}
                        className="text-purple-600 hover:text-purple-900 lowercase font-medium hover:underline cursor-pointer"
                      >
                        reset tx
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto custom-scrollbar p-1.5 rounded-xl bg-slate-50 border border-purple-100">
                    {activeZipStates.map(code => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-950 text-[10px] font-bold border border-purple-200"
                      >
                        <span>{code}</span>
                        {activeZipStates.length > 1 && (
                          <button
                            onClick={() => handleToggleState(code)}
                            className="text-purple-500 hover:text-rose-600 cursor-pointer ml-0.5"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Regional Presets */}
                <div className="mb-2.5">
                  <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                    1-Click Regional Presets
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    {Object.entries(US_REGION_PRESETS).map(([key, reg]) => (
                      <button
                        key={key}
                        onClick={() => handleSelectRegion(key)}
                        className="px-2 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-950 font-semibold text-left flex items-center gap-1.5 border border-purple-100 transition-all cursor-pointer"
                      >
                        <span>{reg.icon}</span>
                        <span className="truncate">{reg.label.split('(')[0].trim()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Styling Mode Selector */}
                <div className="mb-2.5">
                  <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                    Polygon Metric Coloring
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    <button
                      onClick={() => setZipStylingMode('opportunity')}
                      className={`p-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                        zipStylingMode === 'opportunity' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                      }`}
                    >
                      🎯 White Spot
                    </button>
                    <button
                      onClick={() => setZipStylingMode('income')}
                      className={`p-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                        zipStylingMode === 'income' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                      }`}
                    >
                      💰 Income
                    </button>
                    <button
                      onClick={() => setZipStylingMode('population')}
                      className={`p-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                        zipStylingMode === 'population' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                      }`}
                    >
                      👥 Population
                    </button>
                    <button
                      onClick={() => setZipStylingMode('outline')}
                      className={`p-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                        zipStylingMode === 'outline' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                      }`}
                    >
                      📐 Outlines
                    </button>
                  </div>
                </div>

                {/* Filter States input */}
                <input
                  type="text"
                  placeholder="Filter 51 states (e.g. Texas, CA, FL)..."
                  value={stateFilterQuery}
                  onChange={(e) => setStateFilterQuery(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-purple-50/60 border border-purple-200 text-purple-950 placeholder:text-purple-400 focus:outline-none mb-1.5"
                />

                {/* State list scrollable with checkboxes */}
                <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                  {Object.values(US_STATE_ZIP_GEOJSON_REGISTRY)
                    .filter(s => 
                      s.name.toLowerCase().includes(stateFilterQuery.toLowerCase()) || 
                      s.code.toLowerCase().includes(stateFilterQuery.toLowerCase())
                    )
                    .map(st => {
                      const isActive = activeZipStates.includes(st.code);
                      return (
                        <div
                          key={st.code}
                          className={`w-full px-2 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                            isActive
                              ? 'bg-purple-100 text-purple-950 font-bold border border-purple-300'
                              : 'hover:bg-purple-50 text-slate-700'
                          }`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => handleToggleState(st.code)}
                              className="rounded accent-purple-600 cursor-pointer"
                            />
                            <span className="font-mono text-purple-700 text-[11px]">{st.code}</span>
                            <span className="truncate">{st.name}</span>
                          </label>
                          <button
                            onClick={() => handleSelectState(st.code, true)}
                            className="text-[10px] text-purple-600 hover:text-purple-900 underline font-semibold ml-2 cursor-pointer"
                            title={`Zoom to ${st.name}`}
                          >
                            Zoom
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

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
              <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">Live Geospatial POIs & Boundaries</div>
              <label className="flex items-center justify-between p-2 rounded-xl bg-purple-50/60 border border-purple-100 hover:border-purple-300 cursor-pointer">
                <span className="flex items-center gap-2 text-purple-950 font-semibold">
                  <span className="text-sm">🗺️</span> US ZIP Boundaries ({activeZipStates.join(', ')}: {zipBoundariesData?.totalZipCodes || 0})
                </span>
                <input
                  type="checkbox"
                  checked={layers.zipCodeBoundaries}
                  onChange={() => toggleLayer('zipCodeBoundaries')}
                  className="rounded accent-purple-600"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-purple-50/60 border border-purple-100 hover:border-purple-300 cursor-pointer">
                <span className="flex items-center gap-2 text-purple-950 font-semibold">
                  <span className="text-sm">🏛️</span> All 50 State Boundaries ({stateBoundariesData?.totalStates || 52})
                </span>
                <input
                  type="checkbox"
                  checked={layers.allStateBoundaries}
                  onChange={() => toggleLayer('allStateBoundaries')}
                  className="rounded accent-purple-600"
                />
              </label>

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
        {activeAnalysisToast && (
          <div className="pointer-events-auto bg-purple-950 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-2xl border border-purple-500/40 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            <span className="text-purple-300 hidden sm:inline">1-Click Live Site:</span>
            <span className="text-white truncate max-w-[140px] sm:max-w-[180px] font-black">{activeAnalysisToast.name}</span>
            <span className="px-2 py-0.5 rounded-md bg-purple-800 text-purple-200 text-[10px]">
              Index: {activeAnalysisToast.score}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-900/80 text-emerald-300 text-[10px]">
              Unmet Vol: {activeAnalysisToast.fuelDemand}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-900/80 text-indigo-200 text-[10px] hidden md:inline">
              Rev: {activeAnalysisToast.revenue}
            </span>
            <span className="text-emerald-400 text-[10px] sm:text-[11px] font-bold">✓ Stored in Vault &amp; Live in All Tabs</span>
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

      {/* Floating State & ZIP Boundaries Legend */}
      {(layers.zipCodeBoundaries || layers.allStateBoundaries) && (
        <div className="absolute bottom-16 sm:bottom-4 right-2 sm:right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-purple-200 shadow-xl text-xs max-w-xs space-y-2.5">
          {layers.allStateBoundaries && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-indigo-100">
                <span className="font-bold text-indigo-950 flex items-center gap-1 text-[11px]">
                  <span>🏛️</span> All 50 US States ({stateBoundariesData?.totalStates || 52})
                </span>
                <span className="text-[9px] uppercase font-bold text-indigo-700 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                  Demand Index
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-slate-700">
                  <span className="w-3 h-3 rounded-md flex-shrink-0 bg-indigo-700 border border-indigo-900/20 shadow-xs" />
                  <span className="font-semibold text-slate-900">Tier 1 High Demand (140+)</span>
                  <span className="text-[9px] text-indigo-600">TX, FL, CA</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-700">
                  <span className="w-3 h-3 rounded-md flex-shrink-0 bg-purple-600 border border-purple-900/20 shadow-xs" />
                  <span className="font-semibold text-slate-900">Tier 2 Solid Demand (120-139)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-700">
                  <span className="w-3 h-3 rounded-md flex-shrink-0 bg-purple-400 border border-purple-900/20 shadow-xs" />
                  <span className="font-semibold text-slate-900">Tier 3 Baseline Corridor</span>
                </div>
              </div>
              <div className="mt-1 pt-1 text-[9px] text-indigo-600 font-semibold italic">
                👉 Click any state to load all ZIPs
              </div>
            </div>
          )}

          {layers.zipCodeBoundaries && (
            <div className={layers.allStateBoundaries ? 'pt-2 border-t border-purple-100' : ''}>
              <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-purple-100">
                <span className="font-bold text-purple-950 flex items-center gap-1 text-[11px]">
                  <span>🗺️</span> {activeZipStates.slice(0, 3).join(', ')}{activeZipStates.length > 3 ? ` +${activeZipStates.length - 3}` : ''} Pincodes ({zipBoundariesData?.totalZipCodes || 0})
                </span>
                <span className="text-[9px] uppercase font-bold text-purple-600 px-1.5 py-0.5 rounded bg-purple-100">
                  {zipStylingMode}
                </span>
              </div>
              <div className="space-y-1">
                {getZipLegendItems(zipStylingMode).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-700">
                    <span className="w-3 h-3 rounded-md flex-shrink-0 border border-slate-900/20 shadow-xs" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-900">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-1.5 pt-1 border-t border-purple-100 text-[9px] text-purple-600/80 italic flex items-center justify-between">
                <span>OpenDataDE GeoJSON</span>
                <span>Click ZIP polygon for stats</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OpenDataDE US ZIP Code Boundary Detail Modal */}
      <ZipBoundaryDetailModal
        isOpen={isZipModalOpen}
        properties={selectedZipProperties}
        onClose={() => setIsZipModalOpen(false)}
        onSetCatchmentCenter={(lat, lng, label) => {
          performRadiusAnalysis(lat, lng, selectedRadiusMiles, label);
          loadLiveOsmPois(lat, lng, selectedRadiusMiles);
          if (leafletMapRef.current) {
            leafletMapRef.current.flyTo([lat, lng], 13, { duration: 1.0 });
          }
        }}
        onEvaluateSite={(lat, lng, address) => {
          onEvaluateCustomSite(lat, lng, address);
        }}
        onRunAiAnalysis={(props) => {
          handleRunAiFromZip(props);
        }}
        onFitBounds={() => {
          if (selectedZipProperties?.INTPTLAT10 && selectedZipProperties?.INTPTLON10 && leafletMapRef.current) {
            const lat = parseFloat(selectedZipProperties.INTPTLAT10);
            const lng = parseFloat(selectedZipProperties.INTPTLON10);
            leafletMapRef.current.flyTo([lat, lng], 13, { duration: 0.8 });
          }
        }}
      />
    </div>
  );
};
