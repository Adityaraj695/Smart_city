import React, { useState, useMemo, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import SavedFilesPage from './components/SavedFilesPage';
import DatasetSelector from './components/DatasetSelector';
import { api } from './utils/api';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import UploadPage from './components/UploadPage';
import DataSourceSummary from './components/DataSourceSummary';
import InteractiveMap from './components/InteractiveMap';
import SummaryMetrics from './components/SummaryMetrics';
import AnalysisModules from './components/AnalysisModules';
import DetectedIssuesTable from './components/DetectedIssuesTable';
import RecommendationsList from './components/RecommendationsList';
import PriorityCharts from './components/PriorityCharts';
import AnalysisHistory from './components/AnalysisHistory';
import ReportModal from './components/ReportModal';

import {
  AlertOctagon,
  Lightbulb,
  BarChart3,
  History
} from 'lucide-react';

import {
  patialaSectorDataset,
  initialMetrics,
  detectedIssues as defaultIssues,
  recommendations as defaultRecommendations,
  mapGapZones as defaultMapGapZones,
  mapInterventions as defaultMapInterventions,
  analysisHistoryLog
} from './data/sampleDatasets';
import { analyzeGeoJsonData } from './utils/geoJsonAnalyzer';
import { analyzeInfrastructureGaps, areaOfBounds } from './utils/spatialAnalysis';

export default function App() {
  // Signed-in user (null = signed out); authChecked flips once /api/me answers.
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [savedFilesVersion, setSavedFilesVersion] = useState(0);
  // Which GeoJSON is on the map: 'sample' or a saved file's id
  const [activeSourceId, setActiveSourceId] = useState('sample');

  useEffect(() => {
    api.me().then((d) => setUser(d.user)).catch(() => {}).finally(() => setAuthChecked(true));
  }, []);

  // Which top-level screen is showing: 'upload' (the standalone GeoJSON intake
  // page) or 'dashboard' (the full analysis workspace). The app opens on the
  // upload page and moves to the dashboard once data is provided.
  const [page, setPage] = useState('upload');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedAreaId, setSelectedAreaId] = useState('patiala-sector-4');

  // Active Detail Tab: 'issues' | 'recommendations' | 'visuals' | 'history'
  const [activeDetailTab, setActiveDetailTab] = useState('issues');

  // Active Dataset & GeoJSON state
  const [currentDataset, setCurrentDataset] = useState(patialaSectorDataset);
  const [currentFileMeta, setCurrentFileMeta] = useState({
    name: 'patiala_urban_sector_4.geojson',
    size: '148.5 KB',
    featureCount: patialaSectorDataset.geoJson.features.length,
    timestamp: 'May 2026'
  });

  // Result of analysing an uploaded file (null while the built-in sample is loaded)
  const [uploadAnalysis, setUploadAnalysis] = useState(null);
  // Computed gap analysis for the uploaded file. Null means the built-in
  // sample is loaded and the findings on screen belong to it, not to the user.
  const [spatialAnalysis, setSpatialAnalysis] = useState(null);

  // Power Outage Telemetry Simulation
  const [powerSimulated, setPowerSimulated] = useState(false);

  // Issues & Recommendations state
  const [issues, setIssues] = useState(defaultIssues);
  const [recommendations, setRecommendations] = useState(defaultRecommendations);
  const [mapGapZones, setMapGapZones] = useState(defaultMapGapZones);
  const [mapInterventions, setMapInterventions] = useState(defaultMapInterventions);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Map Focus Coordinate trigger (for "View on Map" interactions)
  const [focusedLocation, setFocusedLocation] = useState(null);

  // Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Data Availability state
  const dataAvailability = useMemo(() => {
    const base = uploadAnalysis ? uploadAnalysis.dataAvailability : initialMetrics.dataAvailability;
    return {
      ...base,
      power: {
        ...base.power,
        available: powerSimulated,
        count: powerSimulated ? 14 : 0,
        status: powerSimulated ? 'verified' : 'missing',
        detail: powerSimulated ? '14 telemetry feeds verified (Simulated)' : 'Not Available'
      }
    };
  }, [powerSimulated, uploadAnalysis]);

  // Compute live summary counts
  const summaryCounts = useMemo(() => {
    let high = 0;
    let medium = 0;
    let low = 0;

    issues.forEach((i) => {
      if (i.priority === 'HIGH') high++;
      else if (i.priority === 'MEDIUM') medium++;
      else low++;
    });

    // These keys must match the props SummaryMetrics reads. They did not:
    // the component was passed `summaryCounts.highPriority` and friends, which
    // were undefined, so React fell back to its hardcoded defaults of 6/11/7.
    // The dashboard then showed a total of 12 beside a breakdown summing to 24.
    return {
      totalIssues: issues.length,
      highPriority: high,
      mediumPriority: medium,
      lowPriority: low,
      recommendationsCount: recommendations.length
    };
  }, [issues, recommendations]);

  // Handle custom file upload
  const handleFileUpload = (geoJsonData, fileName, fileSize, alreadySaved = false) => {
    try {
      const analysis = analyzeGeoJsonData(geoJsonData);
      // Detect gaps in the user's own data. Previously the layer counts below
      // were recomputed on upload while the issues, recommendations and module
      // percentages stayed on the Patiala sample — so a Mumbai file produced a
      // Mumbai map above a table of Patiala findings, and "Inspect on Map"
      // flew to Punjab.
      const spatial = analyzeInfrastructureGaps(geoJsonData, { fileName });

      const customDataset = {
        id: 'custom-' + Date.now(),
        name: fileName.replace('.geojson', '').replace('.json', ''),
        auditDate: 'Real-time Ingest',
        areaKm2: areaOfBounds(spatial.bounds),
        estimatedPopulation: null,
        hasPowerData: analysis.counts.power > 0,
        geoJson: geoJsonData
      };

      setCurrentDataset(customDataset);
      setUploadAnalysis(analysis);
      setSpatialAnalysis(spatial);
      // Mark the uploaded file as the active source immediately. This used to
      // wait for the save request to resolve, so the selector kept reading
      // "Sample: Patiala Sector 4" while the user's own file was on the map.
      setActiveSourceId(customDataset.id);
      setIssues(spatial.issues);
      setRecommendations(spatial.recommendations);
      setMapGapZones(spatial.gapZones);
      setMapInterventions(spatial.interventions);
      setCategoryFilter('ALL');
      setPriorityFilter('ALL');
      setCurrentFileMeta({
        name: fileName,
        size: fileSize || 'Custom File',
        featureCount: geoJsonData.features.length,
        timestamp: 'Live Session'
      });

      setPowerSimulated(analysis.counts.power > 0);

      // Store the file in the user's account so it can be reviewed later.
      if (!alreadySaved) {
        api.saveFile({ name: fileName, sizeLabel: fileSize, geojson: geoJsonData })
          .then(({ id }) => {
            setActiveSourceId(id);
            setSavedFilesVersion((v) => v + 1);
          })
          .catch((err) => console.error('Could not save GeoJSON file:', err));
      }

      // Input has been provided — move on to the main dashboard.
      goToDashboard();
    } catch (err) {
      alert('Error analyzing GeoJSON: ' + err.message);
    }
  };

  // Enter the main dashboard (from the upload page, or via sidebar nav).
  const goToDashboard = () => {
    setPage('dashboard');
    setActiveNav('dashboard');
    window.scrollTo(0, 0);
  };

  // Reset to default Patiala Sector Sample
  const handleResetToSample = () => {
    setActiveSourceId('sample');
    setUploadAnalysis(null);
    setCurrentDataset(patialaSectorDataset);
    setCurrentFileMeta({
      name: 'patiala_urban_sector_4.geojson',
      size: '148.5 KB',
      featureCount: patialaSectorDataset.geoJson.features.length,
      timestamp: 'May 2026'
    });
    setPowerSimulated(false);
    setSpatialAnalysis(null);
    setIssues(defaultIssues);
    setRecommendations(defaultRecommendations);
    setMapGapZones(defaultMapGapZones);
    setMapInterventions(defaultMapInterventions);
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
  };

  // Upload page's "Continue with the sample dataset" path — provides the
  // sample as input, then hands off to the dashboard just like a real upload.
  const handleUseSample = () => {
    handleResetToSample();
    goToDashboard();
  };

  // Switch Study Area
  const handleSelectArea = (areaId) => {
    setSelectedAreaId(areaId);
    if (areaId === 'patiala-sector-4') {
      handleResetToSample();
    } else if (areaId === 'metro-east') {
      setCurrentFileMeta({
        name: 'metro_zone_east_density.geojson',
        size: '220.4 KB',
        featureCount: 312,
        timestamp: 'August 2026'
      });
      setPowerSimulated(false);
    } else if (areaId === 'greenfield-c') {
      setCurrentFileMeta({
        name: 'greenfield_district_zone_c.geojson',
        size: '185.0 KB',
        featureCount: 198,
        timestamp: 'June 2026'
      });
      setPowerSimulated(true);
    }
  };

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    setUser(null);
    setPage('upload');
    setActiveNav('dashboard');
  };

  // Re-open a file stored in the database for review.
  const handleOpenSavedFile = (file) => {
    handleFileUpload(file.geojson, file.name, file.sizeLabel, true);
    setActiveSourceId(file.id);
  };

  // Handle "View on Map" requests
  const handleFocusOnMap = (coordinates, title, details, category, severity, priority) => {
    setFocusedLocation({
      coordinates,
      title,
      details,
      category,
      severity,
      priority
    });
    const mapEl = document.getElementById('interactive-map-section');
    if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
  };

  // Smooth Navigation Handler
  const handleNavigate = (navId) => {
    setActiveNav(navId);

    if (navId === 'dashboard') {
      setPage('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (navId === 'files') {
      setPage('files');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (navId === 'upload') {
      // The GeoJSON intake lives on its own page now — jump there.
      setPage('upload');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (navId === 'map') {
      const el = document.getElementById('interactive-map-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (navId === 'issues') {
      setActiveDetailTab('issues');
      const el = document.getElementById('tabbed-details-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (navId === 'recommendations') {
      setActiveDetailTab('recommendations');
      const el = document.getElementById('tabbed-details-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (navId === 'visuals') {
      setActiveDetailTab('visuals');
      const el = document.getElementById('tabbed-details-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (navId === 'history') {
      setActiveDetailTab('history');
      const el = document.getElementById('tabbed-details-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Standalone GeoJSON intake page — shown first, and whenever the user
  // navigates back to "Upload GeoJSON" from the sidebar. It only takes
  // input; providing it (a file, or the sample dataset) hands off straight
  // to the dashboard, where everything about that data is then shown.
  if (!authChecked) return null;
  if (!user) return <AuthPage onAuthenticated={setUser} />;

  if (page === 'upload') {
    return (
      <>
        <div className="flex items-center justify-end gap-4 px-6 py-2 bg-white border-b border-neutral-200 text-xs text-neutral-500">
          <span>Signed in as <b className="text-neutral-800">{user.fullName}</b></span>
          <button onClick={() => handleNavigate('files')} className="font-semibold text-blue-600 hover:underline">Saved Files</button>
          <button onClick={handleLogout} className="font-semibold text-rose-600 hover:underline">Log out</button>
        </div>
        <UploadPage
          onFileUpload={handleFileUpload}
          onUseSample={handleUseSample}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex antialiased">
      {/* Left Sidebar */}
      <Sidebar
        issueCount={issues.length}
        recommendationCount={recommendations.length}
        activeNav={activeNav}
        onNavigate={handleNavigate}
        datasetName={currentDataset.name}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <TopNavbar
          selectedArea={selectedAreaId}
          onSelectArea={handleSelectArea}
          powerSimulated={powerSimulated}
          onTogglePowerSimulation={() => setPowerSimulated(!powerSimulated)}
          onExportReport={() => setIsReportModalOpen(true)}
        />

        {/* Content Container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {page === 'files' ? (
            <SavedFilesPage refreshKey={savedFilesVersion} onOpenFile={handleOpenSavedFile} />
          ) : (<>
          <DatasetSelector
            activeSourceId={activeSourceId}
            refreshKey={savedFilesVersion}
            onSelectSample={handleResetToSample}
            onSelectFile={handleOpenSavedFile}
          />
          {/* 1. Data Source: what was actually provided, and what it contains */}
          <DataSourceSummary
            currentFile={currentFileMeta}
            dataAvailability={dataAvailability}
            onChangeDataset={() => handleNavigate('upload')}
          />

          {/* 2. Main Interactive Map (Large, central visual element) */}
          <div id="interactive-map-section">
            <InteractiveMap
              dataset={currentDataset}
              mapGapZones={mapGapZones}
              mapInterventions={mapInterventions}
              powerAvailable={powerSimulated}
              focusedLocation={focusedLocation}
              onClearFocus={() => setFocusedLocation(null)}
            />
          </div>

          {/* 3. Analysis Summary Metrics Dashboard */}
          <SummaryMetrics
            totalIssues={summaryCounts.totalIssues}
            highPriority={summaryCounts.highPriority}
            mediumPriority={summaryCounts.mediumPriority}
            lowPriority={summaryCounts.lowPriority}
            recommendationsCount={summaryCounts.recommendationsCount}
            activePriorityFilter={priorityFilter}
            onSelectPriorityFilter={(prio) => {
              setPriorityFilter(prio);
              setActiveDetailTab('issues');
              const el = document.getElementById('tabbed-details-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* 4. Primary Infrastructure Analysis Modules (Water, Power, Healthcare, Education) */}
          <AnalysisModules
            powerAvailable={powerSimulated}
            modules={spatialAnalysis ? spatialAnalysis.modules : {}}
            issues={issues}
            counts={uploadAnalysis ? uploadAnalysis.counts : {
              roads: patialaSectorDataset.geoJson.features.filter(
                (f) => f.geometry && /LineString/.test(f.geometry.type)).length,
              buildings: patialaSectorDataset.geoJson.features.filter(
                (f) => f.geometry && /Polygon/.test(f.geometry.type)).length
            }}
            isSample={!spatialAnalysis}
            onFilterCategory={(cat) => {
              setCategoryFilter(cat);
              setActiveDetailTab('issues');
              const el = document.getElementById('tabbed-details-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onFocusGap={handleFocusOnMap}
          />

          {/* 5. Clean Tabbed Detail Section (Eliminates vertical clutter!) */}
          <div id="tabbed-details-section" className="space-y-4 pt-2">
            {/* Tab Navigation Pill Bar */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-neutral-200 shadow-sm">
                <button
                  onClick={() => setActiveDetailTab('issues')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeDetailTab === 'issues'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Detected Issues ({issues.length})</span>
                </button>

                <button
                  onClick={() => setActiveDetailTab('recommendations')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeDetailTab === 'recommendations'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Recommendations ({recommendations.length})</span>
                </button>

                <button
                  onClick={() => setActiveDetailTab('visuals')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeDetailTab === 'visuals'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Priority Visuals</span>
                </button>

                <button
                  onClick={() => setActiveDetailTab('history')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeDetailTab === 'history'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Analysis History</span>
                </button>
              </div>

              <span className="text-xs text-neutral-400 hidden sm:inline">
                Click any tab to view detailed records
              </span>
            </div>

            {/* Render ONLY Active Tab content for maximum cleanliness and zero clutter */}
            {activeDetailTab === 'issues' && (
              <DetectedIssuesTable
                issues={issues}
                categoryFilter={categoryFilter}
                priorityFilter={priorityFilter}
                onCategoryFilterChange={(cat) => setCategoryFilter(cat)}
                onPriorityFilterChange={(prio) => setPriorityFilter(prio)}
                onFocusOnMap={handleFocusOnMap}
              />
            )}

            {activeDetailTab === 'recommendations' && (
              <RecommendationsList
                recommendations={recommendations}
                onFocusOnMap={handleFocusOnMap}
              />
            )}

            {activeDetailTab === 'visuals' && (
              <PriorityCharts
                issues={issues}
                powerAvailable={powerSimulated}
              />
            )}

            {activeDetailTab === 'history' && (
              <AnalysisHistory
                historyItems={analysisHistoryLog}
                onLoadSnapshot={(snapId) => {
                  if (snapId === 'hist-1') handleSelectArea('patiala-sector-4');
                  else if (snapId === 'hist-2') handleSelectArea('metro-east');
                  else if (snapId === 'hist-3') handleSelectArea('greenfield-c');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onExportReport={() => setIsReportModalOpen(true)}
              />
            )}
          </div>
          </>)}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-neutral-200 bg-white py-4 px-6 text-center text-xs text-neutral-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <p>
              Smart City Infrastructure Analysis and Recommendation System &bull; Municipal GIS Platform
            </p>
            <p className="text-neutral-500">
              Zero-Assumption Engine &bull; ISO 37120 Compliant
            </p>
          </div>
        </footer>
      </div>

      {/* Official Audit Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        datasetName={currentDataset.name}
        dataAvailability={dataAvailability}
        issues={issues}
        recommendations={recommendations}
        powerAvailable={powerSimulated}
      />
    </div>
  );
}
