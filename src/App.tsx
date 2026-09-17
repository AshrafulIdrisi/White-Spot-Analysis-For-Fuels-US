import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { InteractiveMap } from './components/InteractiveMap';
import { WhiteSpotExplorer } from './components/WhiteSpotExplorer';
import { StoreAnalysis } from './components/StoreAnalysis';
import { CompetitorIntelligence } from './components/CompetitorIntelligence';
import { MarketShareModule } from './components/MarketShareModule';
import { FootfallIntelligence } from './components/FootfallIntelligence';
import { CatchmentAnalysis } from './components/CatchmentAnalysis';
import { FinancialFeasibility } from './components/FinancialFeasibility';
import { AIRecommendationModule } from './components/AIRecommendationModule';
import { DataETLModule } from './components/DataETLModule';
import { DataQualityDashboard } from './components/DataQualityDashboard';
import { AdminSettings } from './components/AdminSettings';
import { ReportsExports } from './components/ReportsExports';
import { NewSiteModal } from './components/NewSiteModal';
import { SavedVaultModule } from './components/SavedVaultModule';
import { 
  StoreLocationRecord, 
  WhiteSpotCandidate, 
  ScoringWeights, 
  MarketShareRecord
} from './types';
import { 
  US_STORE_LOCATIONS, 
  WHITE_SPOT_CANDIDATES, 
  US_MARKET_SHARE_BRANDS, 
  DEFAULT_SCORING_WEIGHTS 
} from './data/mockDatabase';
import {
  getSavedVaultCandidates,
  persistVaultCandidates,
  addOrUpdateCandidateInVault,
  bulkUpsertVaultCandidates
} from './services/vaultStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [locations, setLocations] = useState<StoreLocationRecord[]>(US_STORE_LOCATIONS);
  const [whiteSpots, setWhiteSpots] = useState<WhiteSpotCandidate[]>(() => getSavedVaultCandidates());
  const [marketShareData, setMarketShareData] = useState<MarketShareRecord[]>(US_MARKET_SHARE_BRANDS);
  const [scoringWeights, setScoringWeights] = useState<ScoringWeights>(DEFAULT_SCORING_WEIGHTS);

  const [selectedLocation, setSelectedLocation] = useState<StoreLocationRecord | null>(null);
  const [selectedWhiteSpot, setSelectedWhiteSpot] = useState<WhiteSpotCandidate | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [targetMapCoord, setTargetMapCoord] = useState<{ lat: number; lng: number; displayName?: string; address?: string } | null>(null);

  // Modal State for New Site Evaluation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialCoords, setModalInitialCoords] = useState<{ lat?: number; lng?: number; address?: string }>({});

  const handleCommitNewStore = (newStore: StoreLocationRecord) => {
    setLocations(prev => [newStore, ...prev]);
    setSelectedLocation(newStore);
  };

  // Recalculate White Spot Scores when weights update
  const handleUpdateWeights = async (newWeights: ScoringWeights) => {
    setScoringWeights(newWeights);
    try {
      const res = await fetch('/api/v1/white-spots/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights: newWeights })
      });
      if (res.ok) {
        const data = await res.json();
        setWhiteSpots(data.candidates);
        persistVaultCandidates(data.candidates);
      }
    } catch (e) {
      // Local fallback calculation if backend request fails
      const updated = whiteSpots.map(c => {
        const totalW = newWeights.demandPotential + newWeights.trafficAccessibility + newWeights.supplyGap + newWeights.financialFeasibility;
        const newScore = Math.round(
          (c.demandScore * (newWeights.demandPotential / totalW)) +
          (c.trafficScore * (newWeights.trafficAccessibility / totalW)) +
          (c.supplyGapScore * (newWeights.supplyGap / totalW)) +
          (c.financialScore * (newWeights.financialFeasibility / totalW))
        );
        return { ...c, opportunityScore: Math.min(99, Math.max(50, newScore)) };
      }).sort((a, b) => b.opportunityScore - a.opportunityScore);
      setWhiteSpots(updated);
      persistVaultCandidates(updated);
    }
  };

  const handleAddCustomCandidate = (newCand: WhiteSpotCandidate) => {
    setWhiteSpots(prev => {
      const res = addOrUpdateCandidateInVault(newCand, prev);
      setSelectedWhiteSpot(res.candidate);
      return res.updatedList;
    });
  };

  const handleScanAndPopulateWhiteSpots = (newCandidates: WhiteSpotCandidate[]) => {
    setWhiteSpots(prev => {
      const updated = bulkUpsertVaultCandidates(newCandidates, prev);
      if (newCandidates.length > 0) {
        setSelectedWhiteSpot(newCandidates[0]);
      }
      return updated;
    });
  };

  const handleDeleteCandidate = (id: string) => {
    setWhiteSpots(prev => {
      const filtered = prev.filter(c => c.id !== id);
      persistVaultCandidates(filtered);
      return filtered;
    });
    if (selectedWhiteSpot?.id === id) {
      setSelectedWhiteSpot(null);
    }
  };

  const handleClearAllWhiteSpots = () => {
    setWhiteSpots([]);
    persistVaultCandidates([]);
    setSelectedWhiteSpot(null);
  };

  const handleEvaluateCustomSite = (lat: number, lng: number, address: string) => {
    setModalInitialCoords({ lat, lng, address });
    setIsModalOpen(true);
  };

  const handleOpenAIRecommendation = (candidate: WhiteSpotCandidate) => {
    setSelectedWhiteSpot(candidate);
    setActiveTab('ai-recommendations');
  };

  const handleExportData = (format: 'csv' | 'geojson') => {
    if (format === 'csv') {
      const headers = ['CandidateName', 'City', 'State', 'ZipCode', 'OpportunityScore', 'AADT', '3Mi_Pop', 'MedianIncome', 'PaybackYears', 'EstimatedCapEx'];
      const rows = whiteSpots.map(w => [
        `"${w.candidateName}"`,
        `"${w.city}"`,
        `"${w.state}"`,
        `"${w.zipCode}"`,
        w.opportunityScore,
        w.aadt,
        w.pop3Mile,
        w.medianIncome3Mile,
        w.estimatedPaybackYears,
        w.estimatedCapEx
      ].join(','));
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'exxonmobil_white_spots_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex h-screen bg-[#faf8ff] text-slate-800 overflow-hidden font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        whiteSpotCount={whiteSpots.length}
        locationCount={locations.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={(query) => setSearchQuery(query)}
          onSelectCoordinate={(coord) => {
            setTargetMapCoord(coord);
            setActiveTab('map');
          }}
          onNewSiteClick={() => setIsModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-[#faf8ff] custom-scrollbar">
          {activeTab === 'overview' && (
            <ExecutiveOverview 
              locations={locations}
              whiteSpots={whiteSpots}
              onNavigateToMap={() => setActiveTab('map')}
              onSelectWhiteSpot={(candidate) => {
                setSelectedWhiteSpot(candidate);
                setTargetMapCoord({
                  lat: candidate.lat,
                  lng: candidate.lng,
                  displayName: candidate.candidateName,
                  address: candidate.address
                });
                setActiveTab('map');
              }}
              onSelectLocation={(loc) => {
                setSelectedLocation(loc);
                setActiveTab('store');
              }}
            />
          )}

          {activeTab === 'map' && (
            <InteractiveMap
              locations={locations}
              whiteSpots={whiteSpots}
              selectedLocation={selectedLocation}
              selectedWhiteSpot={selectedWhiteSpot}
              targetCoord={targetMapCoord}
              onSelectLocation={setSelectedLocation}
              onSelectWhiteSpot={setSelectedWhiteSpot}
              onEvaluateCustomSite={handleEvaluateCustomSite}
              onOpenAIRecommendation={handleOpenAIRecommendation}
              onAddWhiteSpot={handleAddCustomCandidate}
            />
          )}

          {activeTab === 'whitespots' && (
            <WhiteSpotExplorer
              candidates={whiteSpots}
              weights={scoringWeights}
              onUpdateWeights={handleUpdateWeights}
              onClearAllWhiteSpots={handleClearAllWhiteSpots}
              onScanAndPopulateWhiteSpots={handleScanAndPopulateWhiteSpots}
              onNavigateToMap={() => setActiveTab('map')}
              onSelectCandidate={(c) => {
                setSelectedWhiteSpot(c);
                setTargetMapCoord({
                  lat: c.lat,
                  lng: c.lng,
                  displayName: c.candidateName,
                  address: c.address
                });
                setActiveTab('map');
              }}
              onOpenAIRecommendation={handleOpenAIRecommendation}
              onExportData={handleExportData}
            />
          )}

          {activeTab === 'vault' && (
            <SavedVaultModule
              candidates={whiteSpots}
              onSelectCandidate={(c) => {
                setSelectedWhiteSpot(c);
                setTargetMapCoord({
                  lat: c.lat,
                  lng: c.lng,
                  displayName: c.candidateName,
                  address: c.address
                });
              }}
              onNavigateToMap={(c) => {
                if (c) {
                  setSelectedWhiteSpot(c);
                  setTargetMapCoord({
                    lat: c.lat,
                    lng: c.lng,
                    displayName: c.candidateName,
                    address: c.address
                  });
                }
                setActiveTab('map');
              }}
              onOpenAIRecommendation={handleOpenAIRecommendation}
              onDeleteCandidate={handleDeleteCandidate}
              onClearVault={handleClearAllWhiteSpots}
              onNavigateToCatchment={(c) => {
                setSelectedWhiteSpot(c);
                setActiveTab('catchment');
              }}
              onNavigateToFinancials={(c) => {
                setSelectedWhiteSpot(c);
                setActiveTab('financials');
              }}
            />
          )}

          {activeTab === 'store' && (
            <StoreAnalysis
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
              onNavigateToMap={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'competitors' && (
            <CompetitorIntelligence
              candidates={whiteSpots}
              locations={locations}
            />
          )}

          {activeTab === 'marketshare' && (
            <MarketShareModule
              marketShareData={marketShareData}
            />
          )}

          {activeTab === 'footfall' && (
            <FootfallIntelligence
              candidates={whiteSpots}
              locations={locations}
            />
          )}

          {activeTab === 'catchment' && (
            <CatchmentAnalysis
              candidates={whiteSpots}
              locations={locations}
            />
          )}

          {activeTab === 'financials' && (
            <FinancialFeasibility
              candidates={whiteSpots}
            />
          )}

          {activeTab === 'ai-recommendations' && (
            <AIRecommendationModule
              candidates={whiteSpots}
              selectedCandidate={selectedWhiteSpot}
              onSelectCandidate={setSelectedWhiteSpot}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsExports
              candidates={whiteSpots}
              locations={locations}
            />
          )}

          {activeTab === 'etl' && (
            <DataETLModule />
          )}

          {activeTab === 'dataquality' && (
            <DataQualityDashboard />
          )}

          {activeTab === 'settings' && (
            <AdminSettings
              weights={scoringWeights}
              onUpdateWeights={handleUpdateWeights}
            />
          )}
        </main>
      </div>

      {/* New Site Evaluation Modal */}
      <NewSiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCandidate={handleAddCustomCandidate}
        initialLat={modalInitialCoords.lat}
        initialLng={modalInitialCoords.lng}
        initialAddress={modalInitialCoords.address}
      />
    </div>
  );
}
