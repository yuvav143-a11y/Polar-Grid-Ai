import React from 'react';
import { Sun, Wind, Droplets, Fuel, BatteryCharging, ArrowUpRight } from 'lucide-react';
import { EnergySource } from '../types';

interface EnergySourcesGridProps {
  sources: EnergySource[];
}

export const EnergySourcesGrid: React.FC<EnergySourcesGridProps> = ({ sources }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'SOLAR': return <Sun className="w-5 h-5 text-amber-400" />;
      case 'WIND': return <Wind className="w-5 h-5 text-sky-400" />;
      case 'HYDRO': return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'DIESEL': return <Fuel className="w-5 h-5 text-slate-400" />;
      case 'BATTERY': return <BatteryCharging className="w-5 h-5 text-emerald-400" />;
      default: return <Sun className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HIGH AVAILABILITY':
      case 'AVAILABLE':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
      case 'RUNNING':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50 animate-pulse';
      case 'LIMITED':
      case 'LOW AVAILABILITY':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
      case 'STANDBY':
      case 'READY':
        return 'bg-blue-950/80 text-blue-400 border-blue-500/40';
      case 'CHARGING':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-400/60 animate-pulse';
      case 'DISCHARGING':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-400/60 animate-pulse';
      case 'IDLE':
        return 'bg-slate-900 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  const getProgressBarColor = (type: string) => {
    switch (type) {
      case 'SOLAR': return 'from-amber-500 to-yellow-400';
      case 'WIND': return 'from-sky-500 to-blue-400';
      case 'HYDRO': return 'from-cyan-500 to-teal-400';
      case 'DIESEL': return 'from-slate-500 to-slate-400';
      case 'BATTERY': return 'from-emerald-500 to-green-400';
      default: return 'from-cyan-500 to-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Energy Source Detail Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold font-['Rajdhani'] text-white tracking-wide uppercase">
            Connected Energy Generation Sources
          </h3>
          <span className="text-[11px] font-mono text-slate-400">5 Monitored Vectors</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {sources.map((src) => (
            <div
              key={src.id}
              id={`source-card-${src.id}`}
              className="p-4 rounded-xl bg-[#0a101d] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getIcon(src.type)}
                    <span className="font-bold text-sm text-white font-['Rajdhani']">{src.name}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${getStatusBadge(src.status)}`}>
                    {src.status}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    {src.type === 'BATTERY' ? 'Battery Flow' : src.type === 'DIESEL' ? 'Current Output' : 'Current Generation'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-mono text-white">{src.outputMw}</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {src.type === 'BATTERY' ? 'MW' : `/ ${src.capacityMw} MW`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    {src.type === 'BATTERY' ? 'Battery Charge:' : 'Availability:'}
                  </span>
                  <span className="font-bold text-cyan-300">{src.availabilityPct}%</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    {src.type === 'BATTERY' ? 'Rate Capacity:' : 'Utilization:'}
                  </span>
                  <span className="font-bold text-slate-300">
                    {src.type === 'BATTERY' ? `${src.capacityMw} MW` : `${src.utilizationPct}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressBarColor(src.type)} transition-all duration-500`}
                    style={{ width: `${Math.min(100, src.availabilityPct)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Dedicated ENERGY SOURCE AVAILABILITY Section (Requirement 12) */}
      <div id="energy-availability-section" className="p-4 sm:p-5 rounded-2xl bg-[#0a101d] border border-cyan-500/20">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold font-['Rajdhani'] text-white uppercase tracking-wider">
              ENERGY SOURCE AVAILABILITY
            </h3>
            <p className="text-xs text-slate-400">
              Live capacity readiness and environmental fuel conditions.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">DYNAMIC INDEX</span>
        </div>

        <div className="space-y-3.5">
          {sources.map((src) => {
            const isBattery = src.type === 'BATTERY';
            const isDiesel = src.type === 'DIESEL';

            let powerText = `${src.outputMw} MW generated`;
            if (isBattery) {
              if (src.status === 'CHARGING') {
                powerText = `${src.outputMw} MW charging`;
              } else if (src.status === 'DISCHARGING') {
                powerText = `${src.outputMw} MW discharging`;
              } else {
                powerText = `${src.outputMw} MW idle`;
              }
            } else if (isDiesel) {
              powerText = `${src.outputMw} MW output`;
            }

            return (
              <div key={`avail-${src.id}`} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-xs sm:text-sm">{src.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getStatusBadge(src.status)}`}>
                      {src.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-slate-400 font-mono text-[11px]">{powerText}</span>
                    <span className="font-bold text-cyan-400 text-xs sm:text-sm font-mono text-right">{src.availabilityPct}%</span>
                  </div>
                </div>

                {/* Graphical Bar */}
                <div className="w-full h-2.5 bg-[#070b14] rounded-full border border-slate-800 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(src.type)} transition-all duration-500`}
                    style={{ width: `${Math.min(100, src.availabilityPct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
