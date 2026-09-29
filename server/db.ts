import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'polargrid_database.json');

export interface UserRecord {
  id: number;
  username: string; // Exact username entered by user
  passwordHash: string;
  selectedStationId: string;
  role: string;
  account_status: 'ACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface ResearchStationRecord {
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

export interface GridNodeRecord {
  id: string;
  stationId: string;
  name: string;
  substationType: string;
  ratedVoltageKv: number;
  maxLoadMw: number;
  currentStatus: 'NORMAL' | 'WARNING' | 'CRITICAL';
  currentLoadMw: number;
  currentVoltageKv: number;
  currentFrequencyHz: number;
}

export interface AlertRecord {
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

export interface RecommendationRecord {
  id: string;
  stationId: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  recommendation: string;
  affectedSource?: string;
  createdAt: string;
}

export interface UserSettingsRecord {
  userId: number;
  alertNotificationsEnabled: boolean;
  highLoadThresholdPct: number;
  voltageVarianceTolerancePct: number;
  theme: 'dark' | 'light';
  autoAcknowledgeMinorAlerts: boolean;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  researchStations: ResearchStationRecord[];
  gridNodes: GridNodeRecord[];
  alerts: AlertRecord[];
  recommendations: RecommendationRecord[];
  userSettings: Record<number, UserSettingsRecord>;
}

const DEFAULT_STATIONS: ResearchStationRecord[] = [
  {
    id: 'station-alpha',
    name: 'Research Station Alpha',
    code: 'POLAR-ALPHA-01',
    location: 'Arctic Polar Ridge, Sector 1',
    coordinates: '78°13\'N, 15°38\'E',
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
    coordinates: '82°04\'S, 104°22\'E',
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
    coordinates: '71°18\'N, 156°46\'W',
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
    coordinates: '69°32\'S, 76°11\'E',
    gridCapacityMw: 140,
    connectedSources: ['Hydro Energy', 'Wind Energy', 'Battery Storage', 'Diesel Generator'],
    status: 'ACTIVE',
    ambientTempC: -19.4,
    windChillC: -30.0
  }
];

const DEFAULT_NODES: GridNodeRecord[] = [
  {
    id: 'GRID-001',
    stationId: 'station-alpha',
    name: 'Main Central Substation',
    substationType: 'Primary Step-Down & Inverter Hub',
    ratedVoltageKv: 230.0,
    maxLoadMw: 60.0,
    currentStatus: 'NORMAL',
    currentLoadMw: 44.2,
    currentVoltageKv: 230.4,
    currentFrequencyHz: 50.01
  },
  {
    id: 'GRID-002',
    stationId: 'station-alpha',
    name: 'North Scientific Array',
    substationType: 'High-Precision Research Feed',
    ratedVoltageKv: 115.0,
    maxLoadMw: 35.0,
    currentStatus: 'NORMAL',
    currentLoadMw: 24.8,
    currentVoltageKv: 115.2,
    currentFrequencyHz: 49.99
  },
  {
    id: 'GRID-003',
    stationId: 'station-alpha',
    name: 'Cryo-Storage Lab & Life Support',
    substationType: 'Critical Tier-1 Uninterruptible Feed',
    ratedVoltageKv: 115.0,
    maxLoadMw: 40.0,
    currentStatus: 'NORMAL',
    currentLoadMw: 28.5,
    currentVoltageKv: 114.8,
    currentFrequencyHz: 50.02
  },
  {
    id: 'GRID-004',
    stationId: 'station-alpha',
    name: 'Habitation Pods & Hydroponics',
    substationType: 'Residential & Thermal Support Feed',
    ratedVoltageKv: 69.0,
    maxLoadMw: 30.0,
    currentStatus: 'NORMAL',
    currentLoadMw: 18.2,
    currentVoltageKv: 69.1,
    currentFrequencyHz: 50.00
  },
  {
    id: 'GRID-005',
    stationId: 'station-alpha',
    name: 'Perimeter Defense & Radar Beacon',
    substationType: 'Remote Security & Satellite Uplink Feed',
    ratedVoltageKv: 69.0,
    maxLoadMw: 20.0,
    currentStatus: 'NORMAL',
    currentLoadMw: 10.4,
    currentVoltageKv: 68.9,
    currentFrequencyHz: 49.98
  }
];

const INITIAL_ALERTS: AlertRecord[] = [
  {
    id: 'ALT-1082',
    stationId: 'station-alpha',
    alertType: 'Voltage Fluctuation',
    severity: 'WARNING',
    location: 'North Scientific Array (GRID-002)',
    nodeId: 'GRID-002',
    description: 'Minor harmonic voltage dip detected during spectrometer initialization.',
    recommendedAction: 'Engage secondary static capacitor bank on bus 2B.',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
  },
  {
    id: 'ALT-1081',
    stationId: 'station-alpha',
    alertType: 'Renewable Availability Shift',
    severity: 'NORMAL',
    location: 'Wind Turbine Field Alpha',
    description: 'Turbine array 3 wind speed transitioned from 14.2 m/s to 11.8 m/s.',
    recommendedAction: 'Automated pitch regulation engaged. Hydro output compensation initiated.',
    status: 'ACKNOWLEDGED',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  }
];

const INITIAL_RECOMMENDATIONS: RecommendationRecord[] = [
  {
    id: 'REC-301',
    stationId: 'station-alpha',
    priority: 'HIGH',
    reason: 'Hydro and Solar generation currently exceed base research station consumption.',
    recommendation: 'Direct 14.5 MW surplus to Battery Storage Bank Alpha to maximize resilience.',
    affectedSource: 'Battery Storage',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 'REC-302',
    stationId: 'station-alpha',
    priority: 'MEDIUM',
    reason: 'Incoming weather front shows sustained gust speeds of 18 m/s over Sector 1.',
    recommendation: 'Pre-schedule diesel backup to idle standby; elevate wind dispatch priority.',
    affectedSource: 'Wind Energy',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    id: 'REC-303',
    stationId: 'station-alpha',
    priority: 'LOW',
    reason: 'Cryo-Lab heating thermal cycle peak expected in 90 minutes.',
    recommendation: 'Ensure GRID-003 step-down capacitor maintains 115.0 kV baseline.',
    affectedSource: 'GRID-003',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  }
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const rawUsers: any[] = parsed.users || [];
        const normalizedUsers: UserRecord[] = rawUsers.map(u => ({
          id: u.id,
          username: u.username,
          passwordHash: u.passwordHash,
          selectedStationId: u.selectedStationId || 'station-alpha',
          role: u.role || 'GRID_OPERATOR',
          account_status: 'ACTIVE',
          createdAt: u.createdAt || new Date().toISOString(),
          updatedAt: u.updatedAt || new Date().toISOString()
        }));

        return {
          users: normalizedUsers,
          researchStations: parsed.researchStations?.length ? parsed.researchStations : DEFAULT_STATIONS,
          gridNodes: parsed.gridNodes?.length ? parsed.gridNodes : DEFAULT_NODES,
          alerts: parsed.alerts || INITIAL_ALERTS,
          recommendations: parsed.recommendations || INITIAL_RECOMMENDATIONS,
          userSettings: parsed.userSettings || {}
        };
      }
    } catch (err) {
      console.error('Failed reading database file, initializing defaults:', err);
    }

    const initialDb: DatabaseSchema = {
      users: [],
      researchStations: DEFAULT_STATIONS,
      gridNodes: DEFAULT_NODES,
      alerts: INITIAL_ALERTS,
      recommendations: INITIAL_RECOMMENDATIONS,
      userSettings: {}
    };
    this.saveDatabase(initialDb);
    return initialDb;
  }

  private saveDatabase(dataToSave = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }

  // --- Users ---
  public findUserByUsername(username: string): UserRecord | undefined {
    if (!username) return undefined;
    let user = this.data.users.find(u => u.username && u.username.trim().toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      this.data = this.loadDatabase();
      user = this.data.users.find(u => u.username && u.username.trim().toLowerCase() === username.trim().toLowerCase());
    }
    return user;
  }

  public findUserById(id: number): UserRecord | undefined {
    let user = this.data.users.find(u => u.id === id);
    if (!user) {
      this.data = this.loadDatabase();
      user = this.data.users.find(u => u.id === id);
    }
    return user;
  }

  public createUser(
    username: string,
    plainPassword: string,
    role: string = 'GRID_OPERATOR'
  ): UserRecord {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(plainPassword, salt);
    const nextId = this.data.users.length > 0 ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1;

    const newUser: UserRecord = {
      id: nextId,
      username: username.trim(), // Exact username entered by user!
      passwordHash,
      selectedStationId: 'station-alpha',
      role,
      account_status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    // Initialize user settings
    this.data.userSettings[newUser.id] = {
      userId: newUser.id,
      alertNotificationsEnabled: true,
      highLoadThresholdPct: 88.0,
      voltageVarianceTolerancePct: 4.5,
      theme: 'dark',
      autoAcknowledgeMinorAlerts: false,
      updatedAt: new Date().toISOString()
    };

    this.saveDatabase();
    return newUser;
  }

  public updateUserStation(userId: number, stationId: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;
    user.selectedStationId = stationId;
    user.updatedAt = new Date().toISOString();
    this.saveDatabase();
    return true;
  }

  public updateUserPasswordByUsername(username: string, newPasswordPlain: string): boolean {
    const user = this.findUserByUsername(username);
    if (!user) return false;
    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPasswordPlain, salt);
    user.updatedAt = new Date().toISOString();
    this.saveDatabase();
    return true;
  }

  public updateUserProfile(userId: number, newUsername: string): UserRecord | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    user.username = newUsername.trim();
    user.updatedAt = new Date().toISOString();
    this.saveDatabase();
    return user;
  }

  // --- Stations ---
  public getStations(): ResearchStationRecord[] {
    return this.data.researchStations;
  }

  public getStationById(id: string): ResearchStationRecord | undefined {
    return this.data.researchStations.find(s => s.id === id);
  }

  // --- Nodes ---
  public getNodes(stationId?: string): GridNodeRecord[] {
    if (stationId) {
      return this.data.gridNodes.filter(n => n.stationId === stationId);
    }
    return this.data.gridNodes;
  }

  public updateNodeMetrics(nodeId: string, loadMw: number, voltageKv: number, frequencyHz: number, status: 'NORMAL' | 'WARNING' | 'CRITICAL') {
    const node = this.data.gridNodes.find(n => n.id === nodeId);
    if (node) {
      node.currentLoadMw = loadMw;
      node.currentVoltageKv = voltageKv;
      node.currentFrequencyHz = frequencyHz;
      node.currentStatus = status;
    }
  }

  // --- Alerts ---
  public getAlerts(stationId?: string): AlertRecord[] {
    if (stationId) {
      return this.data.alerts.filter(a => a.stationId === stationId);
    }
    return this.data.alerts;
  }

  public addAlert(alert: Omit<AlertRecord, 'id' | 'createdAt'>): AlertRecord {
    const newAlert: AlertRecord = {
      ...alert,
      id: 'ALT-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString()
    };
    this.data.alerts.unshift(newAlert);
    if (this.data.alerts.length > 50) {
      this.data.alerts = this.data.alerts.slice(0, 50);
    }
    this.saveDatabase();
    return newAlert;
  }

  public acknowledgeAlert(id: string): AlertRecord | null {
    const alert = this.data.alerts.find(a => a.id === id);
    if (!alert) return null;
    if (alert.status === 'ACTIVE') {
      alert.status = 'ACKNOWLEDGED';
      this.saveDatabase();
    }
    return alert;
  }

  public resolveAlert(id: string): AlertRecord | null {
    const alert = this.data.alerts.find(a => a.id === id);
    if (!alert) return null;
    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date().toISOString();
    this.saveDatabase();
    return alert;
  }

  // --- Recommendations ---
  public getRecommendations(stationId?: string): RecommendationRecord[] {
    if (stationId) {
      return this.data.recommendations.filter(r => r.stationId === stationId);
    }
    return this.data.recommendations;
  }

  public setRecommendations(stationId: string, recs: Array<Omit<RecommendationRecord, 'id' | 'stationId' | 'createdAt'>>) {
    const filtered = this.data.recommendations.filter(r => r.stationId !== stationId);
    const brandNew = recs.map((r, idx) => ({
      ...r,
      id: `REC-${Math.floor(300 + idx * 10 + Math.random() * 9)}`,
      stationId,
      createdAt: new Date().toISOString()
    }));
    this.data.recommendations = [...brandNew, ...filtered].slice(0, 20);
    this.saveDatabase();
  }

  // --- Settings ---
  public getUserSettings(userId: number): UserSettingsRecord {
    if (!this.data.userSettings[userId]) {
      this.data.userSettings[userId] = {
        userId,
        alertNotificationsEnabled: true,
        highLoadThresholdPct: 88.0,
        voltageVarianceTolerancePct: 4.5,
        theme: 'dark',
        autoAcknowledgeMinorAlerts: false,
        updatedAt: new Date().toISOString()
      };
      this.saveDatabase();
    }
    return this.data.userSettings[userId];
  }

  public updateUserSettings(userId: number, updates: Partial<UserSettingsRecord>): UserSettingsRecord {
    const existing = this.getUserSettings(userId);
    const updated = {
      ...existing,
      ...updates,
      userId,
      updatedAt: new Date().toISOString()
    };
    this.data.userSettings[userId] = updated;
    this.saveDatabase();
    return updated;
  }
}

export const db = new DatabaseManager();
