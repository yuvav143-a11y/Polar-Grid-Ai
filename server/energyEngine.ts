import { db, AlertRecord } from './db.js';
import { WebSocket } from 'ws';

export interface EnergySourceState {
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

export interface GridNodeState {
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
  batteryFlowMw: number; // Positive = discharging to grid, negative = charging from grid
  gridEfficiencyPct: number;
  gridHealthPct: number;
  gridFrequencyHz: number;
  gridVoltageKv: number;
  powerFactor: number;
  aiEngineStatus: 'ACTIVE' | 'OFFLINE';
  timestamp: string;
}

export interface PredictionData {
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

export interface LiveTelemetryPayload {
  metrics: SystemMetrics;
  sources: EnergySourceState[];
  nodes: GridNodeState[];
  recentReadings: Array<{
    time: string;
    generation: number;
    consumption: number;
    renewable: number;
    frequency: number;
    efficiency: number;
  }>;
  predictions: PredictionData[];
  anomalies: AnomalyItem[];
  activeAlertsCount: number;
  aiEngineActive: boolean;
}

class EnergyEngineManager {
  private isEngineActive: boolean = false;
  private intervalTimer: NodeJS.Timeout | null = null;
  private wsClients: Set<WebSocket> = new Set();
  
  // Simulation physics state
  private step: number = 0;
  private batterySoC: number = 68.4; // %
  private baseSolarIrradiance: number = 0.75;
  private baseWindSpeed: number = 12.8; // m/s
  private baseHydroFlow: number = 0.88;
  private gridFrequencyNominal: number = 50.00;
  private gridVoltageNominal: number = 230.0;
  
  // Historical telemetry buffer for real-time charting
  private telemetryHistory: Array<{
    time: string;
    generation: number;
    consumption: number;
    renewable: number;
    frequency: number;
    efficiency: number;
  }> = [];

  constructor() {
    this.seedHistory();
  }

  private seedHistory() {
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const past = new Date(now - i * 3000);
      const timeStr = past.toTimeString().split(' ')[0];
      const gen = Math.round(145 + Math.sin(i * 0.4) * 8 + (Math.random() * 4));
      const cons = Math.round(124 + Math.cos(i * 0.4) * 6 + (Math.random() * 3));
      const renPct = Math.round(62 + Math.sin(i * 0.3) * 6);
      this.telemetryHistory.push({
        time: timeStr,
        generation: gen,
        consumption: cons,
        renewable: renPct,
        frequency: Number((50.00 + (Math.sin(i) * 0.03)).toFixed(2)),
        efficiency: Number((93.5 + (Math.cos(i * 0.5) * 1.5)).toFixed(1))
      });
    }
  }

  public registerClient(ws: WebSocket) {
    this.wsClients.add(ws);
    // Send immediate snapshot upon connection
    ws.send(JSON.stringify(this.getTelemetrySnapshot()));

    ws.on('close', () => {
      this.wsClients.delete(ws);
    });
  }

  public getIsEngineActive(): boolean {
    return this.isEngineActive;
  }

  public setEngineState(active: boolean): boolean {
    this.isEngineActive = active;
    if (active) {
      if (!this.intervalTimer) {
        this.intervalTimer = setInterval(() => {
          this.computeNextStep();
          this.broadcastTelemetry();
        }, 2200);
      }
    } else {
      if (this.intervalTimer) {
        clearInterval(this.intervalTimer);
        this.intervalTimer = null;
      }
      this.broadcastTelemetry();
    }
    return this.isEngineActive;
  }

  private computeNextStep() {
    this.step++;
    const t = this.step * 0.2;

    // 1. Natural fluctuations
    // Solar in Arctic: gentle sinusoidal variation with light cloud cover factor
    const solarFactor = Math.max(0.2, Math.min(1.0, 0.72 + Math.sin(t * 0.4) * 0.22 + (Math.random() * 0.05 - 0.025)));
    // Wind: gusts and turbulence
    const windFactor = Math.max(0.3, Math.min(0.98, 0.68 + Math.cos(t * 0.5) * 0.2 + (Math.random() * 0.08 - 0.04)));
    // Hydro: steady mountain melt flow
    const hydroFactor = Math.max(0.7, Math.min(0.99, 0.89 + Math.sin(t * 0.15) * 0.05));

    // Dynamic Station Consumption
    const baseDemand = 122; // MW
    const dynamicDemandVariation = Math.sin(t * 0.3) * 12 + Math.cos(t * 0.7) * 4;
    const totalConsumption = Number((baseDemand + dynamicDemandVariation).toFixed(1));

    // Capacities (MW)
    const solarCap = 50;
    const windCap = 42;
    const hydroCap = 40;
    const batteryCap = 30; // Max discharge/charge rate
    const dieselCap = 34;

    // Available outputs
    const solarOutput = Number((solarCap * solarFactor).toFixed(1));
    const windOutput = Number((windCap * windFactor).toFixed(1));
    const hydroOutput = Number((hydroCap * hydroFactor).toFixed(1));

    const totalRenewableOutput = solarOutput + windOutput + hydroOutput;
    const renewableDeficitOrSurplus = totalRenewableOutput - totalConsumption;

    // Battery & Diesel dispatch logic
    let batteryFlow = 0; // MW (+ discharging, - charging)
    let dieselOutput = 0;

    if (renewableDeficitOrSurplus > 5) {
      // Surplus: Charge battery if not full
      if (this.batterySoC < 95) {
        batteryFlow = -Math.min(batteryCap, Number((renewableDeficitOrSurplus * 0.75).toFixed(1)));
        this.batterySoC = Math.min(100, this.batterySoC + Math.abs(batteryFlow) * 0.015);
      }
      dieselOutput = 0; // Standby
    } else if (renewableDeficitOrSurplus < 0) {
      // Deficit: Discharge battery first, then diesel
      const needed = Math.abs(renewableDeficitOrSurplus);
      if (this.batterySoC > 18) {
        batteryFlow = Math.min(batteryCap, Number((needed * 0.8).toFixed(1)));
        this.batterySoC = Math.max(5, this.batterySoC - batteryFlow * 0.018);
        const remainder = Math.max(0, needed - batteryFlow);
        dieselOutput = Number(Math.min(dieselCap, remainder).toFixed(1));
      } else {
        // Battery depleted: Diesel takes primary compensation
        batteryFlow = 0;
        dieselOutput = Number(Math.min(dieselCap, needed).toFixed(1));
      }
    } else {
      batteryFlow = 0;
      dieselOutput = 0;
    }

    // Total generation includes physical sources + net battery discharge (if discharging)
    const physicalGeneration = solarOutput + windOutput + hydroOutput + dieselOutput;
    const totalGeneration = batteryFlow > 0 ? physicalGeneration + batteryFlow : physicalGeneration;
    const availableCapacity = solarCap + windCap + hydroCap + dieselCap + (this.batterySoC > 15 ? batteryCap : 0);

    const renewableContribution = Math.min(100, Math.round(((solarOutput + windOutput + hydroOutput) / Math.max(1, totalGeneration)) * 100));
    const currentGridLoadPct = Math.min(100, Math.round((totalConsumption / totalGeneration) * 100));

    // Dynamic Frequency & Voltage (physics droop control)
    const netImbalance = totalGeneration - totalConsumption;
    const freqDrift = Math.max(-0.15, Math.min(0.15, netImbalance * 0.008));
    const currentFrequency = Number((this.gridFrequencyNominal + freqDrift).toFixed(2));
    const voltDrift = Math.max(-2.5, Math.min(2.5, netImbalance * 0.12));
    const currentVoltage = Number((this.gridVoltageNominal + voltDrift).toFixed(1));

    // Grid Efficiency and Health
    const efficiency = Number((92.0 + Math.min(4.0, (renewableContribution * 0.05) - (dieselOutput * 0.08))).toFixed(1));
    const freqPenalty = Math.abs(currentFrequency - 50.0) * 80;
    const voltPenalty = Math.abs(currentVoltage - 230.0) * 2;
    const loadPenalty = currentGridLoadPct > 90 ? (currentGridLoadPct - 90) * 2 : 0;
    const gridHealth = Math.max(70, Math.min(100, Math.round(98 - freqPenalty - voltPenalty - loadPenalty)));

    // Update node metrics realistically
    const nodes = db.getNodes('station-alpha');
    const loadSplits = [0.35, 0.20, 0.23, 0.14, 0.08];
    nodes.forEach((node, idx) => {
      const split = loadSplits[idx] || 0.1;
      const nodeLoad = Number((totalConsumption * split).toFixed(1));
      const nodeVolt = Number((node.ratedVoltageKv * (currentVoltage / 230.0)).toFixed(1));
      const nodeStatus = nodeLoad > node.maxLoadMw * 0.9 ? 'WARNING' : 'NORMAL';
      db.updateNodeMetrics(node.id, nodeLoad, nodeVolt, currentFrequency, nodeStatus);
    });

    // Check for real-time anomaly detection and dynamic alerts
    this.evaluateAnomaliesAndAlerts(currentFrequency, currentVoltage, currentGridLoadPct, this.batterySoC, dieselOutput);

    // Push into time-series buffer
    const nowTime = new Date().toTimeString().split(' ')[0];
    this.telemetryHistory.push({
      time: nowTime,
      generation: Math.round(totalGeneration),
      consumption: Math.round(totalConsumption),
      renewable: renewableContribution,
      frequency: currentFrequency,
      efficiency
    });
    if (this.telemetryHistory.length > 30) {
      this.telemetryHistory.shift();
    }

    // Refresh dynamic AI recommendations based on logical state
    this.updateDynamicRecommendations(solarFactor, windFactor, this.batterySoC, currentGridLoadPct, dieselOutput);
  }

  private evaluateAnomaliesAndAlerts(freq: number, volt: number, loadPct: number, batterySoC: number, dieselMw: number) {
    if (loadPct > 92) {
      const existing = db.getAlerts().find(a => a.alertType === 'High Grid Load' && a.status === 'ACTIVE');
      if (!existing) {
        db.addAlert({
          stationId: 'station-alpha',
          alertType: 'High Grid Load',
          severity: loadPct > 96 ? 'CRITICAL' : 'WARNING',
          location: 'Core Substation Step-Down Bus',
          nodeId: 'GRID-001',
          description: `Total substation demand reached ${loadPct}% of nominal capacity.`,
          recommendedAction: 'Engage fast-response Battery Storage dispatch and throttle non-critical scientific arrays.',
          status: 'ACTIVE'
        });
      }
    }

    if (batterySoC < 20) {
      const existing = db.getAlerts().find(a => a.alertType === 'Low Battery Reserve' && a.status === 'ACTIVE');
      if (!existing) {
        db.addAlert({
          stationId: 'station-alpha',
          alertType: 'Low Battery Reserve',
          severity: 'WARNING',
          location: 'Energy Storage Facility Alpha',
          description: `Battery state of charge depleted to ${batterySoC.toFixed(1)}%.`,
          recommendedAction: 'Conserve battery discharge. Divert excess hydro generation to replenish storage reserves.',
          status: 'ACTIVE'
        });
      }
    }
  }

  private updateDynamicRecommendations(solarFac: number, windFac: number, batterySoC: number, loadPct: number, dieselMw: number) {
    const recs: Array<{ priority: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string; recommendation: string; affectedSource: string }> = [];

    if (solarFac > 0.8) {
      recs.push({
        priority: 'HIGH',
        reason: 'Polar daytime solar irradiance is currently peaking at maximum efficiency.',
        recommendation: 'Increase renewable utilization priority and maximize battery charging rates while irradiance holds.',
        affectedSource: 'Solar Energy'
      });
    }

    if (windFac < 0.5) {
      recs.push({
        priority: 'MEDIUM',
        reason: 'Wind velocity has decelerated below standard turbine threshold in Sector 1.',
        recommendation: 'Hydro turbine capacity ramped up to offset wind drop. Keep auxiliary reserves on standby.',
        affectedSource: 'Wind Energy'
      });
    }

    if (batterySoC < 25) {
      recs.push({
        priority: 'HIGH',
        reason: 'Battery storage reserve is low at under 25% capacity.',
        recommendation: 'Inhibit non-emergency battery discharge cycles to maintain emergency life-support buffer.',
        affectedSource: 'Battery Storage'
      });
    } else if (batterySoC > 85) {
      recs.push({
        priority: 'LOW',
        reason: 'Battery energy storage is nearly full (above 85%).',
        recommendation: 'Grid can utilize battery peak-shaving during upcoming evening residential load shifts.',
        affectedSource: 'Battery Storage'
      });
    }

    if (loadPct > 85) {
      recs.push({
        priority: 'HIGH',
        reason: 'Station load is approaching peak threshold (>85%).',
        recommendation: 'Implement automated demand response in non-essential Cryo-cooling research bays.',
        affectedSource: 'GRID-003 Substation'
      });
    }

    if (recs.length === 0) {
      recs.push({
        priority: 'LOW',
        reason: 'Grid generation and demand are balanced with high stability.',
        recommendation: 'Maintain standard operating profile and continue normal scheduled telemetry scans.',
        affectedSource: 'Main Grid Inverter'
      });
    }

    db.setRecommendations('station-alpha', recs);
  }

  public getTelemetrySnapshot(): LiveTelemetryPayload {
    const t = this.step * 0.2;
    const solarFactor = Math.max(0.2, Math.min(1.0, 0.72 + Math.sin(t * 0.4) * 0.22));
    const windFactor = Math.max(0.3, Math.min(0.98, 0.68 + Math.cos(t * 0.5) * 0.2));
    const hydroFactor = Math.max(0.7, Math.min(0.99, 0.89 + Math.sin(t * 0.15) * 0.05));

    const solarCap = 50;
    const windCap = 42;
    const hydroCap = 40;
    const batteryCap = 30;
    const dieselCap = 34;

    const solarOutput = Number((solarCap * solarFactor).toFixed(1));
    const windOutput = Number((windCap * windFactor).toFixed(1));
    const hydroOutput = Number((hydroCap * hydroFactor).toFixed(1));

    const baseDemand = 124;
    const dynamicDemandVariation = Math.sin(t * 0.3) * 10;
    const totalConsumption = Number((baseDemand + dynamicDemandVariation).toFixed(1));

    const totalRenewable = solarOutput + windOutput + hydroOutput;
    const diff = totalRenewable - totalConsumption;

    let batteryFlow = 0;
    let dieselOutput = 0;

    if (diff > 4) {
      batteryFlow = -Math.min(batteryCap, Number((diff * 0.7).toFixed(1))); // charging
      dieselOutput = 0;
    } else if (diff < 0) {
      const needed = Math.abs(diff);
      batteryFlow = Math.min(batteryCap, Number((needed * 0.7).toFixed(1))); // discharging
      dieselOutput = Number(Math.min(dieselCap, Math.max(0, needed - batteryFlow)).toFixed(1));
    }

    const physicalGen = solarOutput + windOutput + hydroOutput + dieselOutput;
    const totalGen = batteryFlow > 0 ? physicalGen + batteryFlow : physicalGen;
    const availableCap = 183;
    const renContrib = Math.min(100, Math.round((totalRenewable / Math.max(1, totalGen)) * 100));
    const loadPct = Math.min(100, Math.round((totalConsumption / totalGen) * 100));

    const dieselStatus: 'AVAILABLE' | 'STANDBY' | 'RUNNING' =
      dieselOutput > 15 ? 'RUNNING' : dieselOutput > 0 ? 'AVAILABLE' : 'STANDBY';

    const batteryStatus: 'CHARGING' | 'DISCHARGING' | 'IDLE' =
      batteryFlow < -0.1 ? 'CHARGING' : batteryFlow > 0.1 ? 'DISCHARGING' : 'IDLE';

    const sources: EnergySourceState[] = [
      {
        id: 'src-solar',
        name: 'Solar Energy',
        type: 'SOLAR',
        outputMw: solarOutput,
        capacityMw: solarCap,
        availabilityPct: Math.round(solarFactor * 100),
        utilizationPct: Math.round((solarOutput / solarCap) * 100),
        status: 'AVAILABLE',
        icon: 'Sun'
      },
      {
        id: 'src-wind',
        name: 'Wind Energy',
        type: 'WIND',
        outputMw: windOutput,
        capacityMw: windCap,
        availabilityPct: Math.round(windFactor * 100),
        utilizationPct: Math.round((windOutput / windCap) * 100),
        status: 'AVAILABLE',
        icon: 'Wind'
      },
      {
        id: 'src-hydro',
        name: 'Hydro Energy',
        type: 'HYDRO',
        outputMw: hydroOutput,
        capacityMw: hydroCap,
        availabilityPct: Math.round(hydroFactor * 100),
        utilizationPct: Math.round((hydroOutput / hydroCap) * 100),
        status: 'AVAILABLE',
        icon: 'Droplets'
      },
      {
        id: 'src-diesel',
        name: 'Diesel Generator',
        type: 'DIESEL',
        outputMw: dieselOutput,
        capacityMw: dieselCap,
        availabilityPct: 75,
        utilizationPct: Math.round((dieselOutput / dieselCap) * 100),
        status: dieselStatus,
        icon: 'Fuel'
      },
      {
        id: 'src-battery',
        name: 'Battery Storage',
        type: 'BATTERY',
        outputMw: Number(Math.abs(batteryFlow).toFixed(1)),
        capacityMw: batteryCap,
        availabilityPct: Math.round(this.batterySoC),
        utilizationPct: Math.round((Math.abs(batteryFlow) / batteryCap) * 100),
        status: batteryStatus,
        icon: 'BatteryCharging'
      }
    ];

    const nodes: GridNodeState[] = db.getNodes('station-alpha').map(n => ({
      id: n.id,
      name: n.name,
      substationType: n.substationType,
      ratedVoltageKv: n.ratedVoltageKv,
      maxLoadMw: n.maxLoadMw,
      currentLoadMw: n.currentLoadMw,
      currentVoltageKv: n.currentVoltageKv,
      currentFrequencyHz: n.currentFrequencyHz,
      status: n.currentStatus
    }));

    const metrics: SystemMetrics = {
      totalGenerationMw: totalGen,
      totalConsumptionMw: totalConsumption,
      availableCapacityMw: availableCap,
      currentGridLoadPct: loadPct,
      renewableContributionPct: renContrib,
      batteryChargePct: Math.round(this.batterySoC),
      batteryFlowMw: batteryFlow,
      gridEfficiencyPct: 93.8,
      gridHealthPct: 96,
      gridFrequencyHz: 50.02,
      gridVoltageKv: 230.4,
      powerFactor: 0.98,
      aiEngineStatus: this.isEngineActive ? 'ACTIVE' : 'OFFLINE',
      timestamp: new Date().toISOString()
    };

    // Realistic predictions
    const predictions: PredictionData[] = [
      {
        horizon: '1H',
        predictedLoadMw: Number((totalConsumption + 3.2).toFixed(1)),
        predictedRenewableMw: Number((totalRenewable * 0.98).toFixed(1)),
        confidencePct: 96.4,
        trend: 'RISING',
        expectedPeakPeriod: 'Next 45 minutes',
        hourlyForecast: [
          { hour: '+15m', loadMw: 128, solarMw: 39, windMw: 29, hydroMw: 36, confidenceLow: 124, confidenceHigh: 132 },
          { hour: '+30m', loadMw: 132, solarMw: 38, windMw: 30, hydroMw: 36, confidenceLow: 127, confidenceHigh: 136 },
          { hour: '+45m', loadMw: 136, solarMw: 37, windMw: 31, hydroMw: 36, confidenceLow: 130, confidenceHigh: 141 },
          { hour: '+60m', loadMw: 134, solarMw: 35, windMw: 30, hydroMw: 36, confidenceLow: 128, confidenceHigh: 139 }
        ]
      },
      {
        horizon: '6H',
        predictedLoadMw: 142.5,
        predictedRenewableMw: 108.0,
        confidencePct: 92.1,
        trend: 'RISING',
        expectedPeakPeriod: 'Peak demand expected between 18:00 and 20:00.',
        hourlyForecast: [
          { hour: '14:00', loadMw: 126, solarMw: 41, windMw: 28, hydroMw: 36, confidenceLow: 122, confidenceHigh: 130 },
          { hour: '16:00', loadMw: 131, solarMw: 38, windMw: 30, hydroMw: 36, confidenceLow: 126, confidenceHigh: 136 },
          { hour: '18:00', loadMw: 144, solarMw: 32, windMw: 34, hydroMw: 36, confidenceLow: 138, confidenceHigh: 150 },
          { hour: '20:00', loadMw: 141, solarMw: 22, windMw: 36, hydroMw: 36, confidenceLow: 135, confidenceHigh: 147 },
          { hour: '22:00', loadMw: 128, solarMw: 14, windMw: 37, hydroMw: 36, confidenceLow: 122, confidenceHigh: 134 },
          { hour: '00:00', loadMw: 118, solarMw: 8, windMw: 38, hydroMw: 36, confidenceLow: 112, confidenceHigh: 124 }
        ]
      },
      {
        horizon: '24H',
        predictedLoadMw: 129.0,
        predictedRenewableMw: 98.5,
        confidencePct: 88.5,
        trend: 'STABLE',
        expectedPeakPeriod: 'Morning scientific ramp (08:30) & Evening heating peak (19:15)',
        hourlyForecast: [
          { hour: '00:00', loadMw: 115, solarMw: 5, windMw: 35, hydroMw: 36, confidenceLow: 108, confidenceHigh: 122 },
          { hour: '04:00', loadMw: 112, solarMw: 8, windMw: 34, hydroMw: 36, confidenceLow: 105, confidenceHigh: 119 },
          { hour: '08:00', loadMw: 138, solarMw: 28, windMw: 31, hydroMw: 36, confidenceLow: 130, confidenceHigh: 146 },
          { hour: '12:00', loadMw: 135, solarMw: 42, windMw: 28, hydroMw: 36, confidenceLow: 128, confidenceHigh: 142 },
          { hour: '16:00', loadMw: 132, solarMw: 36, windMw: 32, hydroMw: 36, confidenceLow: 125, confidenceHigh: 139 },
          { hour: '20:00', loadMw: 143, solarMw: 18, windMw: 35, hydroMw: 36, confidenceLow: 136, confidenceHigh: 150 }
        ]
      }
    ];

    // Current anomalies
    const anomalies: AnomalyItem[] = [
      {
        id: 'ANOM-01',
        type: 'Harmonic Voltage Dip',
        severity: 'WARNING',
        affectedNode: 'GRID-002 (North Scientific Array)',
        currentValue: '113.8 kV',
        expectedRange: '114.5 - 116.0 kV',
        recommendedAction: 'Engage bus capacitor bank to stabilize research spectrometer bus.',
        timestamp: '4 minutes ago'
      },
      {
        id: 'ANOM-02',
        type: 'Rapid Wind Turbulence Shift',
        severity: 'NORMAL',
        affectedNode: 'Wind Turbine Array 3',
        currentValue: '14.2 m/s -> 10.9 m/s',
        expectedRange: '12.0 - 15.0 m/s',
        recommendedAction: 'Turbine pitch governor actively balancing rotor RPM.',
        timestamp: '12 minutes ago'
      }
    ];

    const activeAlerts = db.getAlerts().filter(a => a.status === 'ACTIVE').length;

    return {
      metrics,
      sources,
      nodes,
      recentReadings: this.telemetryHistory.slice(-15),
      predictions,
      anomalies,
      activeAlertsCount: activeAlerts,
      aiEngineActive: this.isEngineActive
    };
  }

  private broadcastTelemetry() {
    const payload = JSON.stringify(this.getTelemetrySnapshot());
    for (const client of this.wsClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }
}

export const energyEngine = new EnergyEngineManager();
