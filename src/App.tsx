import React, { useState, useEffect, useCallback } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { AuthModal } from './components/AuthModal';
import { StationSelector } from './components/StationSelector';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Header } from './components/Header';
import { EnergyFlowVisualizer } from './components/EnergyFlowVisualizer';
import { SystemMetricsBanner } from './components/SystemMetricsBanner';
import { EnergySourcesGrid } from './components/EnergySourcesGrid';
import { EnergyMixDonut } from './components/EnergyMixDonut';
import { GridMonitoringView } from './components/GridMonitoringView';
import { AiAnalyticsView } from './components/AiAnalyticsView';
import { AiPredictionsView } from './components/AiPredictionsView';
import { AnomalyAlertsView } from './components/AnomalyAlertsView';
import { AiRecommendationsView } from './components/AiRecommendationsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { api, connectGridWebSocket } from './services/api';
import {
  User,
  ResearchStation,
  TelemetrySnapshot,
  SystemMetrics,
  EnergySource,
  GridNode,
  TimeSeriesPoint,
  PredictionHorizon,
  AnomalyItem,
  Alert,
  Recommendation
} from './types';

export default function App() {
  // Navigation & Screen States
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [station, setStation] = useState<ResearchStation | null>(null);
  const [isSelectingStation, setIsSelectingStation] = useState<boolean>(false);
  const [hasStartedEngineOnce, setHasStartedEngineOnce] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [togglingEngine, setTogglingEngine] = useState<boolean>(false);

  // Telemetry States
  const [aiEngineActive, setAiEngineActive] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalGenerationMw: 149.2,
    totalConsumptionMw: 126.4,
    availableCapacityMw: 183.0,
    currentGridLoadPct: 84.1,
    renewableContributionPct: 61.2,
    batteryChargePct: 64,
    batteryFlowMw: -14.5,
    gridEfficiencyPct: 93.8,
    gridHealthPct: 96,
    gridFrequencyHz: 50.02,
    gridVoltageKv: 230.4,
    powerFactor: 0.98,
    aiEngineStatus: 'OFFLINE',
    timestamp: new Date().toISOString()
  });

  const [sources, setSources] = useState<EnergySource[]>([]);
  const [nodes, setNodes] = useState<GridNode[]>([]);
  const [recentReadings, setRecentReadings] = useState<TimeSeriesPoint[]>([]);
  const [predictions, setPredictions] = useState<PredictionHorizon[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // 1. Initial Authentication & Station Fetch
  useEffect(() => {
    async function initSession() {
      try {
        const me = await api.getMe();
        setUser(me.user);
        if (me.user.station) {
          setStation(me.user.station);
        } else {
          setIsSelectingStation(true);
        }
      } catch (err) {
        // Not logged in yet
        setUser(null);
      } finally {
        setLoadingInitial(false);
      }
    }
    initSession();
  }, []);

  // 2. Load Telemetry Snapshot & Alerts
  const fetchOverview = useCallback(async () => {
    try {
      const data = await api.getOverview();
      setMetrics(data.metrics);
      setSources(data.sources);
      setNodes(data.nodes);
      setRecentReadings(data.recentReadings);
      setPredictions(data.predictions);
      setAnomalies(data.anomalies);
      setAiEngineActive(data.aiEngineActive);
    } catch (err) {
      console.error('Failed to fetch telemetry snapshot:', err);
    }
  }, []);

  const fetchAlertsAndRecs = useCallback(async () => {
    try {
      const [alertsData, recsData] = await Promise.all([
        api.getAlerts(),
        api.getRecommendations()
      ]);
      setAlerts(alertsData);
      setRecommendations(recsData);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchAlertsAndRecs();
  }, [fetchOverview, fetchAlertsAndRecs]);

  // 3. Connect Real-Time WebSocket for dynamic grid data stream
  useEffect(() => {
    const disconnect = connectGridWebSocket((snapshot: TelemetrySnapshot) => {
      setMetrics(snapshot.metrics);
      setSources(snapshot.sources);
      setNodes(snapshot.nodes);
      setRecentReadings(snapshot.recentReadings);
      setPredictions(snapshot.predictions);
      setAnomalies(snapshot.anomalies);
      setAiEngineActive(snapshot.aiEngineActive);
    });

    return () => disconnect();
  }, []);

  // 4. Toggle AI Engine command
  const handleToggleAiEngine = async () => {
    const targetState = !aiEngineActive;
    setTogglingEngine(true);
    try {
      const res = await api.toggleAiEngine(targetState);
      setAiEngineActive(res.aiEngineActive);
      if (res.aiEngineActive) {
        setHasStartedEngineOnce(true);
      }
      fetchOverview();
    } catch (err: any) {
      console.error('AI engine toggle error:', err);
    } finally {
      setTogglingEngine(false);
    }
  };

  // Auth Handlers
  const handleAuthSuccess = (authenticatedUser: User, isNewUser: boolean) => {
    setUser(authenticatedUser);
    if (isNewUser || !authenticatedUser.selectedStationId) {
      setIsSelectingStation(true);
    } else if (authenticatedUser.station) {
      setStation(authenticatedUser.station);
    }
  };

  const handleStationSelected = (selectedStation: ResearchStation) => {
    setStation(selectedStation);
    setIsSelectingStation(false);
    if (user) {
      setUser({ ...user, selectedStationId: selectedStation.id, station: selectedStation });
    }
  };

  const handleLogout = () => {
    api.removeToken();
    setUser(null);
    setStation(null);
    setHasStartedEngineOnce(false);
    setActiveTab('dashboard');
  };

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // RENDER FLOW:
  // 1. Splash Screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // 2. Authentication Modal (if not logged in)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4">
        <AuthModal onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  // 3. Station Selection (for new users or when explicitly switching)
  if (isSelectingStation || !station) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100">
        <StationSelector
          onSelected={handleStationSelected}
          currentStationId={station?.id}
        />
      </div>
    );
  }

  // 4. Welcome Screen (shown initially after station assignment until user presses START AI ENGINE)
  if (!hasStartedEngineOnce && !aiEngineActive) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100">
        <Header
          user={user}
          station={station}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          aiEngineActive={aiEngineActive}
          onToggleAiEngine={handleToggleAiEngine}
          onSwitchStation={() => setIsSelectingStation(true)}
          onLogout={handleLogout}
          activeAlertsCount={alerts.filter(a => a.status === 'ACTIVE').length}
        />
        <WelcomeScreen
          user={user}
          station={station}
          onStartEngine={handleToggleAiEngine}
          loading={togglingEngine}
        />
      </div>
    );
  }

  // Top AI Recommendation text for visualizer
  const topRec = recommendations.length > 0 ? recommendations[0].recommendation : undefined;

  return (
    <div id="polar-grid-app-root" className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] overflow-x-hidden w-full">
      {/* Header with real-time controls */}
      <Header
        user={user}
        station={station}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        aiEngineActive={aiEngineActive}
        onToggleAiEngine={handleToggleAiEngine}
        onSwitchStation={() => setIsSelectingStation(true)}
        onLogout={handleLogout}
        activeAlertsCount={alerts.filter(a => a.status === 'ACTIVE').length}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        {/* TAB 1: DASHBOARD (Overview + Energy Flow + Sources + Mix) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* System Metrics Banner (Total Generation, Consumption, Available Capacity, Load %, etc.) */}
            <SystemMetricsBanner metrics={metrics} aiEngineActive={aiEngineActive} />

            {/* Central Animated Energy Flow Visualization */}
            <EnergyFlowVisualizer
              sources={sources}
              metrics={metrics}
              aiEngineActive={aiEngineActive}
              aiTopRecommendation={topRec}
            />

            {/* Generation Sources Grid & Availability & Mix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EnergySourcesGrid sources={sources} />
              </div>
              <div className="lg:col-span-1">
                <EnergyMixDonut sources={sources} metrics={metrics} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GRID MONITORING */}
        {activeTab === 'grid' && (
          <GridMonitoringView nodes={nodes} metrics={metrics} />
        )}

        {/* TAB 3: AI ANALYTICS */}
        {activeTab === 'analytics' && (
          <AiAnalyticsView recentReadings={recentReadings} metrics={metrics} />
        )}

        {/* TAB 4: AI PREDICTIONS */}
        {activeTab === 'predictions' && (
          <AiPredictionsView predictions={predictions} />
        )}

        {/* TAB 5: ALERTS & ANOMALIES */}
        {activeTab === 'alerts' && (
          <AnomalyAlertsView
            alerts={alerts}
            anomalies={anomalies}
            onRefreshAlerts={fetchAlertsAndRecs}
          />
        )}

        {/* TAB 6: RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <AiRecommendationsView recommendations={recommendations} />
        )}

        {/* TAB 7: REPORTS */}
        {activeTab === 'reports' && (
          <ReportsView metrics={metrics} />
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'settings' && (
          <SettingsView user={user} onUserUpdated={setUser} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060911] py-4 text-xs font-mono text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>POLAR-GRID AI • Intelligent Grid Energy Management System</span>
          <span className="text-slate-400">Station Connected: {station.name} ({station.code})</span>
        </div>
      </footer>
    </div>
  );
}
