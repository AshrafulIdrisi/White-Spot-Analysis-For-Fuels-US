import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Target, 
  Store, 
  Swords, 
  PieChart, 
  Footprints, 
  CircleDot, 
  DollarSign, 
  Sparkles, 
  UploadCloud, 
  ShieldCheck, 
  Sliders, 
  FileText,
  Building2,
  Zap,
  Fuel,
  Database,
  X,
  Menu,
  MoreHorizontal,
  BookOpen,
  Compass
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  whiteSpotCount?: number;
  locationCount?: number;
  collapsed?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenGlossary?: (kpiId?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab, 
  setActiveTab,
  whiteSpotCount = 12,
  locationCount = 15,
  isMobileOpen = false,
  onCloseMobile,
  onOpenGlossary
}) => {
  const handleTabChange = (id: string) => {
    if (onSelectTab) onSelectTab(id);
    else if (setActiveTab) setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const navGroups = [
    {
      title: 'CORE INTELLIGENCE & GIS',
      items: [
        { id: 'overview', label: 'Executive Problem Solver', icon: LayoutDashboard, badge: 'Strategy' },
        { id: 'map', label: '1-Click OSM Map Hub', icon: Map, badge: '1/3/5M Overpass' },
        { id: 'whitespots', label: 'White Spot Pipeline', icon: Target, badge: `${whiteSpotCount} Opps` },
        { id: 'vault', label: 'Saved Analyses Vault', icon: Database, badge: `${whiteSpotCount} Stored` },
      ]
    },
    {
      title: 'SPATIAL & TRADE AREA DEEP DIVE',
      items: [
        { id: 'diagnostics', label: 'Location Spatial Diagnostics', icon: Compass, badge: 'Pure Spatial' },
        { id: 'catchment', label: '1/3/5-Mile Catchment & Risk', icon: CircleDot, badge: 'Multi-Ring' },
        { id: 'cannibalization', label: 'Cannibalization Simulator', icon: ShieldCheck, badge: 'Huff Model' },
        { id: 'store', label: 'Forecourt & Pumps Analyzer', icon: Fuel },
        { id: 'competitors', label: 'Competitor Intelligence', icon: Swords, badge: 'OSM POIs' },
      ]
    },
    {
      title: 'MARKET & VALUATION',
      items: [
        { id: 'matrix', label: 'Multi-Site Investment Matrix', icon: Building2, badge: 'IC Benchmark' },
        { id: 'marketshare', label: 'Market Share Analytics', icon: PieChart },
        { id: 'footfall', label: 'Footfall & Commuter Flow', icon: Footprints, badge: 'FHWA AADT' },
        { id: 'financials', label: 'CapEx & Pro-Forma Feasibility', icon: DollarSign, badge: 'IRR & NPV' },
        { id: 'ai-recommendations', label: 'AI Underwriting Advisor', icon: Sparkles, badge: 'Gemini' },
        { id: 'reports', label: 'Executive Memos & Export', icon: FileText },
      ]
    },
    {
      title: 'SYSTEM DATA & ENGINE',
      items: [
        { id: 'etl', label: 'Data Ingestion & Scanner', icon: UploadCloud },
        { id: 'dataquality', label: 'Data Lineage & Coverage', icon: ShieldCheck },
        { id: 'settings', label: 'Scoring Weights & Admin', icon: Sliders },
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
      {navGroups.map((group, gIdx) => (
        <div key={gIdx} className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-purple-900/60 uppercase tracking-wider mb-2">
            {group.title}
          </div>
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-500/20'
                    : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-purple-400 group-hover:text-purple-600'
                  }`} />
                  <span className="truncate text-left">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-purple-50 text-purple-700 border border-purple-200/80 group-hover:bg-purple-100'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-purple-100 flex-col flex-shrink-0 min-h-screen select-none shadow-sm">
        {sidebarContent}

        {/* Footer system status badge & KPI Glossary button */}
        <div className="p-3 border-t border-purple-100 bg-purple-50/40 space-y-2">
          <button
            onClick={() => {
              if (onOpenGlossary) onOpenGlossary();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-100/70 hover:bg-purple-200/80 border border-purple-200 text-purple-950 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-700 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-bold text-purple-950">KPI Glossary &amp; Docs</div>
                <div className="text-[10px] text-purple-700">Math &amp; Underwriting Rules</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200">
              Docs
            </span>
          </button>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-100 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <div className="text-[11px] font-semibold text-purple-950">OSM Live Overpass</div>
            </div>
            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Real-Time
            </span>
          </div>
        </div>
      </aside>

      {/* 2. Mobile / Tablet Slide-over Drawer Modal */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-purple-950/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Canvas */}
          <aside className="relative w-72 max-w-[85vw] bg-white border-r border-purple-200 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-purple-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-purple-950">Navigation Menu</h3>
                  <p className="text-[10px] text-purple-600">Forecourt & Spatial Modules</p>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-xl text-purple-400 hover:text-purple-900 hover:bg-purple-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Groups List */}
            {sidebarContent}

            {/* Drawer Footer */}
            <div className="p-3 border-t border-purple-100 bg-purple-50/50 space-y-2">
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  if (onOpenGlossary) onOpenGlossary();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-100/70 hover:bg-purple-200/80 border border-purple-200 text-purple-950 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-700" />
                  <div className="text-left">
                    <div className="text-xs font-bold text-purple-950">KPI Glossary &amp; Docs</div>
                    <div className="text-[10px] text-purple-700">Math &amp; Underwriting Rules</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200">
                  Docs
                </span>
              </button>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-purple-950 text-[11px]">OSM Nominatim Live</span>
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  Online
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* 3. Mobile / Tablet Quick Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-200 shadow-2xl py-1 px-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[56px] min-h-[44px] transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'text-purple-700 font-bold scale-105'
                : 'text-slate-500 hover:text-purple-800'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-purple-600' : ''}`} />
            <span className="text-[10px] mt-0.5">Solver</span>
          </button>

          <button
            onClick={() => handleTabChange('map')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[56px] min-h-[44px] transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'text-purple-700 font-bold scale-105'
                : 'text-slate-500 hover:text-purple-800'
            }`}
          >
            <Map className={`w-4 h-4 ${activeTab === 'map' ? 'text-purple-600' : ''}`} />
            <span className="text-[10px] mt-0.5">1-Click Map</span>
          </button>

          <button
            onClick={() => handleTabChange('whitespots')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[56px] min-h-[44px] transition-all cursor-pointer ${
              activeTab === 'whitespots'
                ? 'text-purple-700 font-bold scale-105'
                : 'text-slate-500 hover:text-purple-800'
            }`}
          >
            <Target className={`w-4 h-4 ${activeTab === 'whitespots' ? 'text-purple-600' : ''}`} />
            <span className="text-[10px] mt-0.5">Pipeline</span>
          </button>

          <button
            onClick={() => handleTabChange('vault')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[56px] min-h-[44px] transition-all cursor-pointer ${
              activeTab === 'vault'
                ? 'text-purple-700 font-bold scale-105'
                : 'text-slate-500 hover:text-purple-800'
            }`}
          >
            <Database className={`w-4 h-4 ${activeTab === 'vault' ? 'text-purple-600' : ''}`} />
            <span className="text-[10px] mt-0.5">Vault</span>
          </button>

          <button
            onClick={() => {
              if (isMobileOpen && onCloseMobile) onCloseMobile();
              else if (onCloseMobile) onCloseMobile();
              // If not open, we trigger open
              const event = new CustomEvent('toggle-mobile-menu');
              window.dispatchEvent(event);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[56px] min-h-[44px] transition-all cursor-pointer ${
              ['catchment', 'store', 'competitors', 'marketshare', 'footfall', 'financials', 'ai-recommendations', 'reports', 'etl', 'dataquality', 'settings'].includes(activeTab)
                ? 'text-purple-700 font-bold scale-105'
                : 'text-slate-500 hover:text-purple-800'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
