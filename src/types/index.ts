export interface User {
  id: number;
  username: string;
  selectedStationId: string;
  role: string;
  account_status?: 'ACTIVE';
  station?: ResearchStation;
  settings?: UserSettings;
}

export interface ResearchStation {
  id: string;
  name: string;
  code: string;
  location: string;
  coordinates: string;
  gridCapacityMw: number;
  connectedSources: string[];
  status: 'ACTIVE' | 'STANDBY' | 'MAINTENANCE';
  ambientTempC: number;
  windChillC: number;
}

export interface EnergySource {
  id: string;
  name: string;
  type: 'SOLAR' | 'WIND' | 'HYDRO' | 'DIESEL' | 'BATTERY';
  outputMw: number;
  capacityMw: number;
  availabilityPct: number;
  utilizationPct: number;
  status: 'AVAILABLE' | 'HIGH AVAILABILITY' | 'LIMITED' | 'LOW AVAILABILITY' | 'STANDBY' | 'CHARGING' | 'DISCHARGING' | 'READY' | 'RUNNING' | 'IDLE';
  icon: string;
}

export interface GridNode {
  id: string;
  name: string;
  substationType: string;
  ratedVoltageKv: number;
  maxLoadMw: number;
  currentLoadMw: number;
  currentVoltageKv: number;
  currentFrequencyHz: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface SystemMetrics {
  totalGenerationMw: number;
  totalConsumptionMw: number;
  availableCapacityMw: number;
  currentGridLoadPct: number;
  renewableContributionPct: number;
  batteryChargePct: number;
  batteryFlowMw: number; // positive = discharging, negative = charging
  gridEfficiencyPct: number;
  gridHealthPct: number;
  gridFrequencyHz: number;
  gridVoltageKv: number;
  powerFactor: number;
  aiEngineStatus: 'ACTIVE' | 'OFFLINE';
  timestamp: string;
}

export interface TimeSeriesPoint {
  time: string;
  generation: number;
  consumption: number;
  renewable: number;
  frequency: number;
  efficiency: number;
}

export interface PredictionHorizon {
  horizon: '1H' | '6H' | '24H';
  predictedLoadMw: number;
  predictedRenewableMw: number;
  confidencePct: number;
  trend: 'RISING' | 'STABLE' | 'FALLING';
  expectedPeakPeriod: string;
  hourlyForecast: Array<{
    hour: string;
    loadMw: number;
    solarMw: number;
    windMw: number;
    hydroMw: number;
    confidenceLow: number;
    confidenceHigh: number;
  }>;
}

export interface AnomalyItem {
  id: string;
  type: string;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  affectedNode: string;
  currentValue: string;
  expectedRange: string;
  recommendedAction: string;
  timestamp: string;
}

export interface Alert {
  id: string;
  stationId: string;
  alertType: string;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  location: string;
  nodeId?: string;
  description: string;
  recommendedAction: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
}

export interface Recommendation {
  id: string;
  stationId: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  recommendation: string;
  affectedSource?: string;
  createdAt: string;
}

export interface UserSettings {
  userId: number;
  alertNotificationsEnabled: boolean;
  highLoadThresholdPct: number;
  voltageVarianceTolerancePct: number;
  theme: 'dark' | 'light';
  autoAcknowledgeMinorAlerts: boolean;
  updatedAt: string;
}

export interface TelemetrySnapshot {
  metrics: SystemMetrics;
  sources: EnergySource[];
  nodes: GridNode[];
  recentReadings: TimeSeriesPoint[];
  predictions: PredictionHorizon[];
  anomalies: AnomalyItem[];
  activeAlertsCount: number;
  aiEngineActive: boolean;
}
