import {
  User,
  ResearchStation,
  TelemetrySnapshot,
  Alert,
  Recommendation,
  UserSettings,
  SystemMetrics,
  EnergySource,
  GridNode,
  TimeSeriesPoint,
  PredictionHorizon,
  AnomalyItem
} from '../types';

const TOKEN_KEY = 'polar_grid_jwt_token';
const STATIC_USERS_KEY = 'polar_grid_static_users';
const STATIC_SETTINGS_KEY = 'polar_grid_static_settings';
const STATIC_ALERTS_KEY = 'polar_grid_static_alerts';
const STATIC_ENGINE_KEY = 'polar_grid_static_engine_active';

const DEFAULT_STATIONS: ResearchStation[] = [
  {
    id: 'station-alpha',
    name: 'Research Station Alpha',
    code: 'POLAR-ALPHA-01',
    location: 'Arctic Polar Ridge, Sector 1',
    coordinates: "78°13'N, 15°38'E",
    gridCapacityMw: 180,
    connectedSources: ['Solar Energy', 'Wind Energy', 'Battery Storage', 'Diesel Generator', 'Hydro Energy'],
    status: 'ACTIVE',
    ambientTempC: -28.5,
    windChillC: -41.2
  },
  {
    id: 'station-beta',
    name: 'Research Station Beta',
    code: 'POLAR-BETA-02',
    location: 'Antarctic High Plateau, Sector 4',
    coordinates: "82°04'S, 104°22'E",
    gridCapacityMw: 160,
    connectedSources: ['Wind Energy', 'Battery Storage', 'Hydro Energy', 'Diesel Generator'],
    status: 'ACTIVE',
    ambientTempC: -34.8,
    windChillC: -52.0
  },
  {
    id: 'station-gamma',
    name: 'Research Station Gamma',
    code: 'POLAR-GAMMA-03',
    location: 'Sub-Zero Continental Base, Sector 2',
    coordinates: "71°18'N, 156°46'W",
    gridCapacityMw: 210,
    connectedSources: ['Solar Energy', 'Wind Energy', 'Hydro Energy', 'Battery Storage'],
    status: 'ACTIVE',
    ambientTempC: -24.2,
    windChillC: -36.5
  },
  {
    id: 'station-delta',
    name: 'Research Station Delta',
    code: 'POLAR-DELTA-04',
    location: 'Glacier Perimeter Station, Sector 7',
    coordinates: "69°32'S, 76°11'E",
    gridCapacityMw: 140,
    connectedSources: ['Hydro Energy', 'Wind Energy', 'Battery Storage', 'Diesel Generator'],
    status: 'ACTIVE',
    ambientTempC: -19.4,
    windChillC: -30.0
  }
];

const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-001',
    stationId: 'station-alpha',
    alertType: 'FREQUENCY_INSTABILITY',
    severity: 'WARNING',
    location: 'Primary Substation Alpha',
    nodeId: 'node-arctic-1',
    description: 'Minor frequency deviation (50.14 Hz) observed during rapid wind fluctuation.',
    recommendedAction: 'Ramp down battery inverter discharge rate by 4.2 MW.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 'alt-002',
    stationId: 'station-alpha',
    alertType: 'HIGH_VOLTAGE_SPIKE',
    severity: 'CRITICAL',
    location: 'Collector Node 2',
    nodeId: 'node-arctic-2',
    description: 'Substation Alpha-2 registered +3.8% over-voltage surge following diesel transition.',
    recommendedAction: 'Engage reactive power absorption capacitor bank at Node 2.',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 14 * 60000).toISOString()
  },
  {
    id: 'alt-003',
    stationId: 'station-alpha',
    alertType: 'TEMPERATURE_ANOMALY',
    severity: 'NORMAL',
    location: 'Cryo-Storage Bay',
    nodeId: 'node-arctic-4',
    description: 'Cryogenic battery thermal jacket operating at 98.4% nominal heating output.',
    recommendedAction: 'Monitor insulation efficiency during -41°C wind chill period.',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 42 * 60000).toISOString()
  }
];

const DEFAULT_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-001',
    stationId: 'station-alpha',
    priority: 'HIGH',
    recommendation: 'Increase Wind Turbine Generation to 58 MW; throttle Diesel Gen-1 to idle',
    reason: 'Wind velocity increasing to 18.4 m/s in Arctic Sector 1 over the next 4 hours.',
    affectedSource: 'High-Latitude Arctic Wind Turbines',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rec-002',
    stationId: 'station-alpha',
    priority: 'MEDIUM',
    recommendation: 'Initiate Battery Fast-Charge Cycle at 18.5 MW rate',
    reason: 'Hydro generation surplus detected ahead of projected 18:00 base station peak load.',
    affectedSource: 'Cryogenic Lithium-Iron Battery Bank',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rec-003',
    stationId: 'station-alpha',
    priority: 'LOW',
    recommendation: 'Recalibrate Substation Alpha-3 voltage regulation relays',
    reason: 'Phase angle deviation of 1.8° detected on Glacier Feeder Line 3.',
    affectedSource: 'Station Alpha Main Substation',
    createdAt: new Date().toISOString()
  }
];

let isBackendUnavailable = false;

async function safeApiCall<T>(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: any; failedToReachBackend: boolean }> {
  if (isBackendUnavailable) {
    return { ok: false, status: 404, data: null, failedToReachBackend: true };
  }

  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (res.status === 404 || res.status === 405 || contentType.includes('text/html')) {
        isBackendUnavailable = true;
      }
      return { ok: false, status: res.status, data: null, failedToReachBackend: true };
    }
    const data = await res.json();
    return { ok: res.ok, status: res.status, data, failedToReachBackend: false };
  } catch {
    isBackendUnavailable = true;
    return { ok: false, status: 0, data: null, failedToReachBackend: true };
  }
}

function getLocalUsers(): any[] {
  try {
    const raw = localStorage.getItem(STATIC_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: any[]) {
  try {
    localStorage.setItem(STATIC_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save local users:', err);
  }
}

function getLocalAlerts(): Alert[] {
  try {
    const raw = localStorage.getItem(STATIC_ALERTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_ALERTS;
  } catch {
    return INITIAL_ALERTS;
  }
}

function saveLocalAlerts(alerts: Alert[]) {
  try {
    localStorage.setItem(STATIC_ALERTS_KEY, JSON.stringify(alerts));
  } catch (err) {
    console.error('Failed to save local alerts:', err);
  }
}

function generateTelemetry(engineActive: boolean): TelemetrySnapshot {
  const now = new Date();
  const baseGen = engineActive ? 154.6 : 142.0;
  const jitter = (Math.random() - 0.5) * 4;
  const totalGen = Math.round((baseGen + jitter) * 10) / 10;
  const totalCons = Math.round((124.5 + (Math.random() - 0.5) * 3) * 10) / 10;

  const sources: EnergySource[] = [
    {
      id: 'src-solar',
      name: 'Bifacial Polar Solar Array',
      type: 'SOLAR',
      outputMw: Math.round((28.5 + (Math.random() - 0.5) * 2) * 10) / 10,
      capacityMw: 35.0,
      availabilityPct: 81.4,
      utilizationPct: 81.4,
      status: 'AVAILABLE',
      icon: 'Sun'
    },
    {
      id: 'src-wind',
      name: 'High-Latitude Arctic Wind Turbines',
      type: 'WIND',
      outputMw: Math.round((54.8 + (Math.random() - 0.5) * 3) * 10) / 10,
      capacityMw: 70.0,
      availabilityPct: 78.3,
      utilizationPct: 78.3,
      status: 'HIGH AVAILABILITY',
      icon: 'Wind'
    },
    {
      id: 'src-hydro',
      name: 'Sub-Glacial Meltwater Hydro',
      type: 'HYDRO',
      outputMw: Math.round((42.0 + (Math.random() - 0.5) * 1.5) * 10) / 10,
      capacityMw: 50.0,
      availabilityPct: 84.0,
      utilizationPct: 84.0,
      status: 'AVAILABLE',
      icon: 'Droplets'
    },
    {
      id: 'src-battery',
      name: 'Cryogenic Lithium-Iron Battery Bank',
      type: 'BATTERY',
      outputMw: Math.round((14.5 + (Math.random() - 0.5) * 1) * 10) / 10,
      capacityMw: 30.0,
      availabilityPct: 92.0,
      utilizationPct: 68.0,
      status: 'DISCHARGING',
      icon: 'BatteryCharging'
    },
    {
      id: 'src-diesel',
      name: 'Ultra-Low Sulfur Diesel Backup Gen-1',
      type: 'DIESEL',
      outputMw: Math.round((14.8 + (Math.random() - 0.5) * 1) * 10) / 10,
      capacityMw: 40.0,
      availabilityPct: 37.0,
      utilizationPct: 37.0,
      status: 'STANDBY',
      icon: 'Fuel'
    }
  ];

  const nodes: GridNode[] = [
    {
      id: 'node-arctic-1',
      name: 'Station Alpha Main Substation',
      substationType: 'PRIMARY_DISTRIBUTION',
      ratedVoltageKv: 230,
      maxLoadMw: 80,
      currentLoadMw: 62.4,
      currentVoltageKv: 230.2,
      currentFrequencyHz: 50.01,
      status: 'NORMAL'
    },
    {
      id: 'node-arctic-2',
      name: 'Wind Generation Collector Node',
      substationType: 'COLLECTOR_STEP_UP',
      ratedVoltageKv: 69,
      maxLoadMw: 75,
      currentLoadMw: 54.8,
      currentVoltageKv: 69.1,
      currentFrequencyHz: 50.02,
      status: 'NORMAL'
    },
    {
      id: 'node-arctic-3',
      name: 'Cryo-Storage & Battery Interface',
      substationType: 'INVERTER_SUBSTATION',
      ratedVoltageKv: 34.5,
      maxLoadMw: 40,
      currentLoadMw: 18.2,
      currentVoltageKv: 34.6,
      currentFrequencyHz: 49.99,
      status: 'NORMAL'
    },
    {
      id: 'node-arctic-4',
      name: 'Glacier Drill Camp Feeder',
      substationType: 'DISTRIBUTION_STEP_DOWN',
      ratedVoltageKv: 13.8,
      maxLoadMw: 35,
      currentLoadMw: 24.1,
      currentVoltageKv: 13.78,
      currentFrequencyHz: 50.0,
      status: 'NORMAL'
    }
  ];

  const recentReadings: TimeSeriesPoint[] = [
    { time: '12:00', generation: 142.1, consumption: 118.2, renewable: 62.4, frequency: 50.01, efficiency: 93.8 },
    { time: '13:00', generation: 148.6, consumption: 122.5, renewable: 64.1, frequency: 50.02, efficiency: 94.2 },
    { time: '14:00', generation: 153.2, consumption: 126.8, renewable: 67.5, frequency: 49.99, efficiency: 94.6 },
    { time: '15:00', generation: 151.0, consumption: 125.1, renewable: 65.2, frequency: 50.0, efficiency: 94.1 },
    { time: '16:00', generation: 149.4, consumption: 124.7, renewable: 63.8, frequency: 50.01, efficiency: 93.9 },
    { time: '17:00', generation: totalGen, consumption: totalCons, renewable: 66.8, frequency: 50.02, efficiency: 94.5 }
  ];

  const predictions: PredictionHorizon[] = [
    {
      horizon: '1H',
      predictedLoadMw: 128.4,
      predictedRenewableMw: 92.1,
      confidencePct: 96.4,
      trend: 'RISING',
      expectedPeakPeriod: '17:45 - 18:15',
      hourlyForecast: [
        { hour: '+15m', loadMw: 126.8, solarMw: 27.2, windMw: 56.4, hydroMw: 42.0, confidenceLow: 124.5, confidenceHigh: 129.2 },
        { hour: '+30m', loadMw: 127.9, solarMw: 26.5, windMw: 57.8, hydroMw: 42.0, confidenceLow: 125.1, confidenceHigh: 130.4 },
        { hour: '+45m', loadMw: 128.6, solarMw: 25.8, windMw: 59.2, hydroMw: 42.1, confidenceLow: 125.9, confidenceHigh: 131.2 },
        { hour: '+60m', loadMw: 128.4, solarMw: 24.9, windMw: 60.1, hydroMw: 42.0, confidenceLow: 125.4, confidenceHigh: 131.0 }
      ]
    },
    {
      horizon: '6H',
      predictedLoadMw: 134.2,
      predictedRenewableMw: 88.5,
      confidencePct: 91.8,
      trend: 'RISING',
      expectedPeakPeriod: '20:00 - 21:30',
      hourlyForecast: [
        { hour: '+1h', loadMw: 128.4, solarMw: 24.9, windMw: 60.1, hydroMw: 42.0, confidenceLow: 124.8, confidenceHigh: 131.5 },
        { hour: '+2h', loadMw: 131.2, solarMw: 21.0, windMw: 62.4, hydroMw: 41.8, confidenceLow: 127.1, confidenceHigh: 134.8 },
        { hour: '+3h', loadMw: 134.5, solarMw: 16.2, windMw: 63.8, hydroMw: 42.0, confidenceLow: 129.8, confidenceHigh: 138.4 },
        { hour: '+4h', loadMw: 132.8, solarMw: 12.0, windMw: 61.2, hydroMw: 42.0, confidenceLow: 128.0, confidenceHigh: 136.9 },
        { hour: '+5h', loadMw: 129.4, solarMw: 8.5, windMw: 58.7, hydroMw: 41.9, confidenceLow: 124.6, confidenceHigh: 133.5 },
        { hour: '+6h', loadMw: 126.1, solarMw: 5.0, windMw: 56.0, hydroMw: 42.0, confidenceLow: 121.2, confidenceHigh: 130.8 }
      ]
    },
    {
      horizon: '24H',
      predictedLoadMw: 122.8,
      predictedRenewableMw: 94.2,
      confidencePct: 86.5,
      trend: 'STABLE',
      expectedPeakPeriod: 'Tomorrow 12:30',
      hourlyForecast: [
        { hour: '+4h', loadMw: 132.8, solarMw: 12.0, windMw: 61.2, hydroMw: 42.0, confidenceLow: 126.0, confidenceHigh: 138.5 },
        { hour: '+8h', loadMw: 118.4, solarMw: 2.0, windMw: 52.4, hydroMw: 41.5, confidenceLow: 111.8, confidenceHigh: 125.0 },
        { hour: '+12h', loadMw: 112.6, solarMw: 0.0, windMw: 54.0, hydroMw: 41.2, confidenceLow: 105.4, confidenceHigh: 119.2 },
        { hour: '+16h', loadMw: 124.5, solarMw: 14.2, windMw: 58.6, hydroMw: 41.8, confidenceLow: 117.0, confidenceHigh: 131.8 },
        { hour: '+20h', loadMw: 139.8, solarMw: 29.8, windMw: 64.2, hydroMw: 42.0, confidenceLow: 131.2, confidenceHigh: 147.9 },
        { hour: '+24h', loadMw: 126.4, solarMw: 26.5, windMw: 59.8, hydroMw: 42.1, confidenceLow: 118.0, confidenceHigh: 134.2 }
      ]
    }
  ];

  const anomalies: AnomalyItem[] = [
    {
      id: 'anom-1',
      type: 'Phase Angle Harmonic Deviation',
      severity: 'WARNING',
      affectedNode: 'node-arctic-2',
      currentValue: '2.4% harmonic distortion',
      expectedRange: '< 1.5% nominal',
      recommendedAction: 'Active filter harmonic compensation initiated.',
      timestamp: '8 min ago'
    },
    {
      id: 'anom-2',
      type: 'Cryogenic Thermal Gradient Drop',
      severity: 'NORMAL',
      affectedNode: 'node-arctic-3',
      currentValue: '-30.3°C cell temp',
      expectedRange: '-28.5°C to -32.0°C',
      recommendedAction: 'Auxiliary heating loop routed 1.2 kW excess meltwater heat.',
      timestamp: '26 min ago'
    }
  ];

  const metrics: SystemMetrics = {
    totalGenerationMw: totalGen,
    totalConsumptionMw: totalCons,
    availableCapacityMw: 183.0,
    currentGridLoadPct: Math.round((totalCons / totalGen) * 1000) / 10,
    renewableContributionPct: 66.8,
    batteryChargePct: 68,
    batteryFlowMw: -14.5,
    gridEfficiencyPct: 94.5,
    gridHealthPct: 97,
    gridFrequencyHz: 50.02,
    gridVoltageKv: 230.4,
    powerFactor: 0.98,
    aiEngineStatus: engineActive ? 'ACTIVE' : 'OFFLINE',
    timestamp: now.toISOString()
  };

  const activeAlerts = getLocalAlerts().filter(a => a.status === 'ACTIVE').length;

  return {
    metrics,
    sources,
    nodes,
    recentReadings,
    predictions,
    anomalies,
    activeAlertsCount: activeAlerts,
    aiEngineActive: engineActive
  };
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async register(payload: { username: string; password: string; confirmPassword: string }): Promise<{ message: string; user: User }> {
    const res = await safeApiCall<{ message: string; user: User }>('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.failedToReachBackend) {
      if (!res.ok) {
        throw new Error(res.data?.error || 'Failed to create account.');
      }
      return res.data;
    }

    // Static / GitHub Pages fallback
    const { username, password, confirmPassword } = payload;
    const cleanUsername = username?.trim() || '';

    if (!cleanUsername || cleanUsername.length < 2) {
      throw new Error('Username must be at least 2 characters long.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const users = getLocalUsers();
    const existing = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (existing) {
      throw new Error('Username already exists. Please choose another username.');
    }

    const newUser = {
      id: Date.now(),
      username: cleanUsername,
      password,
      selectedStationId: 'station-alpha',
      role: 'GRID_OPERATOR',
      account_status: 'ACTIVE'
    };

    users.push(newUser);
    saveLocalUsers(users);

    const userObj: User = {
      id: newUser.id,
      username: newUser.username,
      selectedStationId: newUser.selectedStationId,
      role: newUser.role,
      account_status: 'ACTIVE'
    };

    return {
      message: 'Account created successfully.',
      user: userObj
    };
  },

  async login(payload: { username: string; password: string }): Promise<{ message: string; token: string; user: User }> {
    const res = await safeApiCall<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.failedToReachBackend) {
      if (!res.ok) {
        throw new Error(res.data?.error || 'Incorrect username or password. Please try again.');
      }
      if (res.data.token) {
        this.setToken(res.data.token);
      }
      return res.data;
    }

    // Static / GitHub Pages fallback
    const cleanUsername = payload.username?.trim() || '';
    const users = getLocalUsers();

    let user = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (!user) {
      if (cleanUsername.toLowerCase() === 'operator' && payload.password === 'polar-grid') {
        user = {
          id: 1,
          username: 'operator',
          password: 'polar-grid',
          selectedStationId: 'station-alpha',
          role: 'GRID_OPERATOR',
          account_status: 'ACTIVE'
        };
        users.push(user);
        saveLocalUsers(users);
      } else {
        throw new Error('Incorrect username or password. Please try again.');
      }
    }

    if (user.password !== payload.password) {
      throw new Error('Incorrect username or password. Please try again.');
    }

    const token = `static_jwt_${user.id}_${Date.now()}`;
    this.setToken(token);

    const activeUser: User = {
      id: user.id,
      username: user.username,
      selectedStationId: user.selectedStationId || 'station-alpha',
      role: user.role || 'GRID_OPERATOR',
      account_status: 'ACTIVE',
      station: DEFAULT_STATIONS.find(s => s.id === (user.selectedStationId || 'station-alpha'))
    };

    return {
      message: 'Login successful',
      token,
      user: activeUser
    };
  },

  async getMe(): Promise<{ user: User }> {
    const res = await safeApiCall<{ user: User }>('/api/auth/me', {
      headers: this.getHeaders()
    });

    if (!res.failedToReachBackend) {
      if (!res.ok) {
        throw new Error(res.data?.error || 'Failed to fetch user session.');
      }
      return res.data;
    }

    const token = this.getToken();
    if (!token) {
      throw new Error('No active session.');
    }

    const users = getLocalUsers();
    const current = users[users.length - 1] || {
      id: 1,
      username: 'PolarOperator',
      selectedStationId: 'station-alpha',
      role: 'GRID_OPERATOR',
      account_status: 'ACTIVE'
    };

    const station = DEFAULT_STATIONS.find(s => s.id === (current.selectedStationId || 'station-alpha'));

    return {
      user: {
        id: current.id,
        username: current.username,
        selectedStationId: current.selectedStationId || 'station-alpha',
        role: current.role || 'GRID_OPERATOR',
        account_status: 'ACTIVE',
        station
      }
    };
  },

  async getStations(): Promise<ResearchStation[]> {
    const res = await safeApiCall<ResearchStation[]>('/api/stations');
    if (!res.failedToReachBackend && res.ok) {
      return res.data;
    }
    return DEFAULT_STATIONS;
  },

  async selectStation(stationId: string): Promise<{ station: ResearchStation }> {
    const res = await safeApiCall<{ station: ResearchStation }>('/api/stations/select', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ stationId })
    });

    if (!res.failedToReachBackend && res.ok) {
      return res.data;
    }

    const station = DEFAULT_STATIONS.find(s => s.id === stationId) || DEFAULT_STATIONS[0];
    const users = getLocalUsers();
    if (users.length > 0) {
      users[users.length - 1].selectedStationId = station.id;
      saveLocalUsers(users);
    }
    return { station };
  },

  async getOverview(): Promise<TelemetrySnapshot> {
    const res = await safeApiCall<TelemetrySnapshot>('/api/dashboard/overview');
    if (!res.failedToReachBackend && res.ok) {
      return res.data;
    }

    const engineActive = localStorage.getItem(STATIC_ENGINE_KEY) === 'true';
    return generateTelemetry(engineActive);
  },

  async toggleAiEngine(active: boolean): Promise<{ success: boolean; aiEngineActive: boolean; status: string }> {
    const res = await safeApiCall<{ success: boolean; aiEngineActive: boolean; status: string }>('/api/engine/toggle', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ active })
    });

    if (!res.failedToReachBackend && res.ok) {
      return res.data;
    }

    localStorage.setItem(STATIC_ENGINE_KEY, active ? 'true' : 'false');
    return {
      success: true,
      aiEngineActive: active,
      status: active ? 'ACTIVE' : 'OFFLINE'
    };
  },

  async getAlerts(): Promise<Alert[]> {
    const res = await safeApiCall<Alert[]>('/api/alerts');
    if (!res.failedToReachBackend && res.ok) {
      return res.data;
    }
    return getLocalAlerts();
  },

  async acknowledgeAlert(id: string): Promise<Alert> {
    const res = await safeApiCall<{ alert: Alert }>(`/api/alerts/${id}/acknowledge`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });

    if (!res.failedToReachBackend && res.ok) {
      return res.data.alert;
    }

    const alerts = getLocalAlerts();
    const target = alerts.find(a => a.id === id);
    if (target) {
      target.status = 'ACKNOWLEDGED';
      saveLocalAlerts(alerts);
      return target;
    }
    throw new Error('Alert not found.');
  },

  async resolveAlert(id: string): Promise<Alert> {
    const res = await safeApiCall<{ alert: Alert }>(`/api/alerts/${id}/resolve`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });

    if (!res.failedToReachBackend && res.ok) {
      return res.data.alert;
    }

    const alerts = getLocalAlerts();
    const target = alerts.find(a => a.id === id);
    if (target) {
      target.status = 'RESOLVED';
      saveLocalAlerts(alerts);
      return target;
    }
    throw new Error('Alert not found.');
  },

  async getRecommendations(): Promise<Recommendation[]> {
    const res = await safeApiCall<Recommendation[]>('/api/recommendations');
    if (!res.failedToReachBackend && res.ok) {
      return res.data;
    }
    return DEFAULT_RECOMMENDATIONS;
  },

  async getReports() {
    const res = await safeApiCall<any>('/api/reports');
    if (!res.failedToReachBackend && res.ok) {
      return res.data;
    }

    return {
      generatedAt: new Date().toISOString(),
      station: 'Research Station Alpha',
      metrics: {
        totalEnergyGeneratedMwh: 3540.8,
        totalEnergyConsumedMwh: 3012.4,
        renewableEnergyMwh: 2266.1,
        dieselBackupMwh: 746.3,
        batteryDischargedMwh: 528.4,
        averageEfficiencyPct: 93.6,
        averageGridHealthScore: 96.2,
        anomaliesRecorded: 3,
        unresolvedAlerts: 1
      },
      dailyBreakdown: [
        { date: '2026-09-22', generationMwh: 498.2, consumptionMwh: 422.1, renewablePct: 65, efficiency: 94.1 },
        { date: '2026-09-23', generationMwh: 512.4, consumptionMwh: 435.6, renewablePct: 68, efficiency: 94.5 },
        { date: '2026-09-24', generationMwh: 489.1, consumptionMwh: 418.0, renewablePct: 62, efficiency: 93.2 },
        { date: '2026-09-25', generationMwh: 504.6, consumptionMwh: 429.3, renewablePct: 64, efficiency: 93.8 },
        { date: '2026-09-26', generationMwh: 520.8, consumptionMwh: 441.2, renewablePct: 69, efficiency: 94.7 },
        { date: '2026-09-27', generationMwh: 509.3, consumptionMwh: 432.8, renewablePct: 66, efficiency: 94.0 },
        { date: '2026-09-28', generationMwh: 506.4, consumptionMwh: 433.4, renewablePct: 64, efficiency: 93.8 }
      ]
    };
  },

  getReportExportUrl() {
    return '/api/reports/export';
  },

  async getSettings(): Promise<{ settings: UserSettings; user: User }> {
    const res = await safeApiCall<any>('/api/settings', {
      headers: this.getHeaders()
    });

    if (!res.failedToReachBackend && res.ok) {
      return res.data;
    }

    const raw = localStorage.getItem(STATIC_SETTINGS_KEY);
    const settings: UserSettings = raw ? JSON.parse(raw) : {
      userId: 1,
      alertNotificationsEnabled: true,
      highLoadThresholdPct: 90,
      voltageVarianceTolerancePct: 5,
      theme: 'dark',
      autoAcknowledgeMinorAlerts: false,
      updatedAt: new Date().toISOString()
    };

    const me = await this.getMe();
    return { settings, user: me.user };
  },

  async updateSettings(settings: Partial<UserSettings> & { username?: string }) {
    const res = await safeApiCall<any>('/api/settings', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settings)
    });

    if (!res.failedToReachBackend && res.ok) {
      return res.data;
    }

    const current = await this.getSettings();
    const updated: UserSettings = {
      ...current.settings,
      ...settings,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STATIC_SETTINGS_KEY, JSON.stringify(updated));

    if (settings.username) {
      const users = getLocalUsers();
      if (users.length > 0) {
        users[users.length - 1].username = settings.username.trim();
        saveLocalUsers(users);
      }
    }

    return {
      message: 'Settings updated successfully',
      settings: updated,
      username: settings.username || current.user.username
    };
  }
};

export function connectGridWebSocket(
  onData: (snapshot: TelemetrySnapshot) => void,
  onStatusChange?: (connected: boolean) => void
): () => void {
  let socket: WebSocket | null = null;
  let isClosed = false;
  let simulationInterval: any = null;

  function startSimulationFallback() {
    if (simulationInterval || isClosed) return;
    if (onStatusChange) onStatusChange(true);

    simulationInterval = setInterval(() => {
      if (isClosed) return;
      const engineActive = localStorage.getItem(STATIC_ENGINE_KEY) === 'true';
      onData(generateTelemetry(engineActive));
    }, 2500);
  }

  // If in static GitHub Pages environment, skip socket network attempt and run simulation immediately
  if (isBackendUnavailable || (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))) {
    startSimulationFallback();
    return () => {
      isClosed = true;
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }

  try {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/grid`;

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      if (onStatusChange) onStatusChange(true);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        onData(payload);
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    socket.onclose = () => {
      if (!isClosed) {
        startSimulationFallback();
      }
    };

    socket.onerror = () => {
      socket?.close();
      startSimulationFallback();
    };
  } catch {
    startSimulationFallback();
  }

  return () => {
    isClosed = true;
    if (simulationInterval) clearInterval(simulationInterval);
    if (socket) socket.close();
  };
}
