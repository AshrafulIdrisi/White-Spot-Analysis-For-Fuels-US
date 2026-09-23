import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  Search, 
  Navigation,
  Target,
  Layers,
  Map,
  Fuel,
  Plus,
  Menu,
  X,
  BookOpen
} from 'lucide-react';
import { geocodeSearch, GeocodedLocation } from '../services/realDataService';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onSearch?: (query: string) => void;
  onNewSiteClick?: () => void;
  onOpenNewAnalysisModal?: () => void;
  onSelectCoordinate?: (coord: { lat: number; lng: number; displayName?: string; address?: string }) => void;
  onSelectGeocodedLocation?: (loc: { lat: number; lng: number; displayName: string }) => void;
  onToggleMobileMenu?: () => void;
  onOpenGlossary?: (kpiId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'overview',
  setActiveTab,
  onSelectTab,
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery,
  onSearch,
  onNewSiteClick,
  onOpenNewAnalysisModal,
  onSelectCoordinate,
  onSelectGeocodedLocation,
  onToggleMobileMenu,
  onOpenGlossary
}) => {
  const [internalQuery, setInternalQuery] = useState<string>('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
  const query = externalSearchQuery !== undefined ? externalSearchQuery : internalQuery;
  
  const setQuery = (val: string) => {
    if (externalSetSearchQuery) {
      externalSetSearchQuery(val);
    } else {
      setInternalQuery(val);
    }
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleTabChange = (tab: string) => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  const handleNewSite = () => {
    if (onNewSiteClick) {
      onNewSiteClick();
    } else if (onOpenNewAnalysisModal) {
      onOpenNewAnalysisModal();
    }
  };

  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Live Geocode autocomplete debounce
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await geocodeSearch(query);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.warn('Live geocode search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: GeocodedLocation) => {
    setQuery(item.displayName);
    setShowDropdown(false);
    setIsMobileSearchOpen(false);
    
    if (onSelectCoordinate) {
      onSelectCoordinate({
        lat: item.lat,
        lng: item.lng,
        displayName: item.displayName,
        address: item.displayName
      });
    } else if (onSelectGeocodedLocation) {
      onSelectGeocodedLocation({
        lat: item.lat,
        lng: item.lng,
        displayName: item.displayName
      });
    }
    handleTabChange('map');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40 px-3 sm:px-4 lg:px-6 py-2 shadow-xs">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Hamburger & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger Menu Toggle (Mobile & Tablet) */}
          <button
            onClick={() => {
              if (onToggleMobileMenu) {
                onToggleMobileMenu();
              } else {
                window.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
              }
            }}
            className="lg:hidden p-2 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 hover:text-purple-950 border border-purple-200 flex items-center justify-center transition-colors min-w-[40px] min-h-[40px] cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo */}
          <div 
            onClick={() => handleTabChange('overview')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-700 p-[1.5px] shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Fuel className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-purple-950 flex items-center gap-1 truncate">
                  WhiteSpot <span className="text-purple-600 font-extrabold hidden xs:inline">Hub</span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live OSM
                </span>
              </div>
              <p className="text-[10px] text-purple-900/60 hidden xl:block truncate">
                1/3/5M Multi-Ring • Overpass POIs • Census ACS
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Live Geocoder Search Bar */}
        <div ref={searchWrapperRef} className="relative flex-1 max-w-md lg:max-w-lg mx-1 sm:mx-2 lg:mx-4">
          <div className="relative w-full">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
              isSearching ? 'text-purple-600 animate-spin' : 'text-purple-400'
            }`} />
            <input
              type="text"
              placeholder="Search US city, corridor, or ZIP (e.g. Katy Freeway, 77002)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              className="w-full bg-purple-50/60 text-xs sm:text-sm text-purple-950 pl-9 sm:pl-10 pr-12 sm:pr-14 py-1.5 sm:py-2 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder:text-purple-400/80 transition-all shadow-inner"
            />
            {query && (
              <button 
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-purple-500 hover:text-purple-800 px-1 cursor-pointer font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Real-Time Geocoding Auto-Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-purple-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-purple-100 max-w-[calc(100vw-32px)]">
              <div className="p-2 bg-purple-50/90 text-[10px] font-bold text-purple-900 uppercase tracking-wider flex items-center justify-between border-b border-purple-100">
                <span>Real Locations (OpenStreetMap Nominatim)</span>
                <span className="text-purple-600">{suggestions.length} Found</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-purple-50 text-xs text-slate-800 flex items-start gap-2.5 transition-colors group cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-purple-950 truncate group-hover:text-purple-700">
                        {item.displayName.split(',')[0]}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.displayName}
                      </div>
                      <div className="text-[10px] text-purple-400 font-mono mt-0.5">
                        {item.lat.toFixed(4)}, {item.lng.toFixed(4)} • {item.address?.state || 'USA'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Action Controls & User Role */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => handleTabChange('overview')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-sm'
                : 'bg-white text-purple-900 border-purple-200 hover:border-purple-400 hover:bg-purple-50/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span className="hidden xl:inline">Problem Solver</span>
            <span className="xl:hidden">Solver</span>
          </button>

          <button
            onClick={() => handleTabChange('map')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'map'
                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20 font-bold'
                : 'bg-white text-purple-900 border-purple-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            <Map className={`w-3.5 h-3.5 ${activeTab === 'map' ? 'text-white' : 'text-purple-600'}`} />
            <span className="hidden md:inline">1-Click</span> <span>Map</span>
          </button>

          <button
            onClick={() => {
              if (onOpenGlossary) onOpenGlossary();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-purple-900 text-xs font-semibold transition-all cursor-pointer min-h-[38px]"
            title="Open KPI Methodology & Underwriting Glossary"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden md:inline">Glossary</span> <span className="hidden lg:inline">&amp; Docs</span>
          </button>

          <button
            onClick={handleNewSite}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs tracking-wide shadow-md shadow-purple-600/25 transition-all active:scale-95 cursor-pointer min-h-[38px]"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Evaluate Site</span>
            <span className="sm:hidden">Add</span>
          </button>

          <div className="h-6 w-px bg-purple-100 hidden sm:block" />

          {/* User Profile / Status */}
          <div className="hidden sm:flex items-center gap-2 pl-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-xs font-bold text-purple-800">
              WS
            </div>
            <div className="hidden 2xl:block text-left">
              <div className="text-xs font-semibold text-purple-950">Spatial Strategy</div>
              <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Overpass Connected
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
