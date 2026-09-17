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
  Database
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  whiteSpotCount?: number;
  locationCount?: number;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab, 
  setActiveTab,
  whiteSpotCount = 12,
  locationCount = 15
}) => {
  const handleTabChange = (id: string) => {
    if (onSelectTab) onSelectTab(id);
    else if (setActiveTab) setActiveTab(id);
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
        { id: 'catchment', label: '1/3/5-Mile Catchment & Risk', icon: CircleDot, badge: 'Multi-Ring' },
        { id: 'store', label: 'Forecourt & Pumps Analyzer', icon: Fuel },
        { id: 'competitors', label: 'Competitor Intelligence', icon: Swords, badge: 'OSM POIs' },
      ]
    },
    {
      title: 'MARKET & VALUATION',
      items: [
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

  return (
    <aside className="w-64 bg-white border-r border-purple-100 flex flex-col flex-shrink-0 min-h-screen select-none shadow-sm">
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

      {/* Footer system status badge */}
      <div className="p-3 border-t border-purple-100 bg-purple-50/40">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-purple-100 shadow-sm">
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
  );
};
