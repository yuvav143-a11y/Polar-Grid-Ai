import React from 'react';
import { Cpu, Activity, Zap, AlertTriangle, ShieldCheck, Gauge } from 'lucide-react';
import { GridNode, SystemMetrics } from '../types';

interface GridMonitoringViewProps {
  nodes: GridNode[];
  metrics: SystemMetrics;
}

export const GridMonitoringView: React.FC<GridMonitoringViewProps> = ({ nodes, metrics }) => {
  return (
    <div id="grid-monitoring-view" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0a101d] border border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Cpu className="w-4 h-4" />
            <span>SUBSTATION TOPOLOGY MATRIX</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Rajdhani'] text-white">
            Grid Substation & Distribution Monitoring
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Continuous bus voltage, frequency synchronism, and feeder load distribution.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Bus Frequency</span>
            <span className="text-cyan-400 font-bold text-sm">{metrics.gridFrequencyHz} Hz</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Transmission Line</span>
            <span className="text-cyan-400 font-bold text-sm">{metrics.gridVoltageKv} kV</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Power Factor</span>
            <span className="text-emerald-400 font-bold text-sm">{metrics.powerFactor}</span>
          </div>
        </div>
      </div>

      {/* Nodes Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map((node) => {
          const loadPct = Math.round((node.currentLoadMw / node.maxLoadMw) * 100);
          const isWarning = node.status === 'WARNING';
          const isCritical = node.status === 'CRITICAL';

          return (
            <div
              key={node.id}
              id={`grid-node-card-${node.id}`}
              className={`p-5 rounded-2xl bg-[#0a101d] border transition-all ${
                isCritical
                  ? 'border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                  : isWarning
                  ? 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : 'border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                  {node.id}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                    isCritical
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/40 animate-pulse'
                      : isWarning
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  {node.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white font-['Rajdhani'] mb-0.5">
                {node.name}
              </h3>
              <p className="text-xs text-slate-400 mb-4">{node.substationType}</p>

              {/* Load Progress Bar */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Current Load:</span>
                  <span className="font-bold text-white">
                    {node.currentLoadMw} / {node.maxLoadMw} MW ({loadPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#070b14] rounded-full border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      loadPct > 90
                        ? 'bg-rose-500'
                        : loadPct > 75
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(100, loadPct)}%` }}
                  />
                </div>
              </div>

              {/* Voltage & Frequency telemetry */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#070b14] border border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Bus Voltage</span>
                  <span className="font-bold text-cyan-300 text-sm">{node.currentVoltageKv} kV</span>
                  <span className="text-slate-400 text-[9px] block">Rated: {node.ratedVoltageKv} kV</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Frequency</span>
                  <span className="font-bold text-cyan-300 text-sm">{node.currentFrequencyHz} Hz</span>
                  <span className="text-slate-400 text-[9px] block">Tolerance ±0.2 Hz</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
