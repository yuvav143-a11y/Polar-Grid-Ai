import React from 'react';
import { motion } from 'motion/react';
import { Zap, TrendingUp, BatteryCharging, Leaf, ShieldAlert, Activity, Gauge, Server } from 'lucide-react';
import { SystemMetrics } from '../types';

interface SystemMetricsBannerProps {
  metrics: SystemMetrics;
  aiEngineActive: boolean;
}

export const SystemMetricsBanner: React.FC<SystemMetricsBannerProps> = ({ metrics, aiEngineActive }) => {
  const cards = [
    {
      id: 'metric-total-gen',
      label: 'Total Generation',
      value: `${metrics.totalGenerationMw} MW`,
      sub: 'Active Output',
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-950/20',
      icon: Zap
    },
    {
      id: 'metric-total-cons',
      label: 'Total Consumption',
      value: `${metrics.totalConsumptionMw} MW`,
      sub: 'Base Station Demand',
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/20',
      icon: Activity
    },
    {
      id: 'metric-available-cap',
      label: 'Available Capacity',
      value: `${metrics.availableCapacityMw} MW`,
      sub: 'Reserve Headroom',
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-950/20',
      icon: Server
    },
    {
      id: 'metric-grid-load',
      label: 'Current Grid Load',
      value: `${metrics.currentGridLoadPct}%`,
      sub: 'Nominal Bus Rating',
      color: metrics.currentGridLoadPct > 88 ? 'text-rose-400' : 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-950/20',
      icon: Gauge
    },
    {
      id: 'metric-renewable-contrib',
      label: 'Renewable Contribution',
      value: `${metrics.renewableContributionPct}%`,
      sub: 'Solar + Wind + Hydro',
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
      icon: Leaf
    },
    {
      id: 'metric-battery-charge',
      label: 'Battery Charge',
      value: `${metrics.batteryChargePct}%`,
      sub: metrics.batteryFlowMw < 0 ? 'Charging from Grid' : metrics.batteryFlowMw > 0 ? 'Discharging to Grid' : 'Standby Balanced',
      color: metrics.batteryChargePct < 25 ? 'text-rose-400' : 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
      icon: BatteryCharging
    },
    {
      id: 'metric-grid-efficiency',
      label: 'Grid Efficiency',
      value: `${metrics.gridEfficiencyPct}%`,
      sub: 'Thermal & Inverter',
      color: 'text-sky-300',
      border: 'border-sky-500/30',
      bg: 'bg-sky-950/20',
      icon: TrendingUp
    },
    {
      id: 'metric-grid-health',
      label: 'Grid Health',
      value: `${metrics.gridHealthPct}%`,
      sub: `${metrics.gridFrequencyHz} Hz • ${metrics.gridVoltageKv} kV`,
      color: metrics.gridHealthPct > 90 ? 'text-cyan-300' : 'text-amber-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-950/20',
      icon: ShieldAlert
    }
  ];

  return (
    <div id="system-metrics-banner" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className={`p-3 rounded-xl border ${card.border} ${card.bg} backdrop-blur-sm bg-[#0a101d] transition-all hover:border-cyan-400/50 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 truncate">
                {card.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${card.color} shrink-0`} />
            </div>

            <div>
              <div className={`text-lg sm:text-xl font-bold font-['Rajdhani'] ${card.color} tracking-tight`}>
                {card.value}
              </div>
              <div className="text-[9px] text-slate-400 font-mono truncate mt-0.5">
                {card.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
