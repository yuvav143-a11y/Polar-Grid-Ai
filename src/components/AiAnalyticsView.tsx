import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Zap, Leaf, ShieldCheck, Activity } from 'lucide-react';
import { TimeSeriesPoint, SystemMetrics } from '../types';

interface AiAnalyticsViewProps {
  recentReadings: TimeSeriesPoint[];
  metrics: SystemMetrics;
}

export const AiAnalyticsView: React.FC<AiAnalyticsViewProps> = ({ recentReadings, metrics }) => {
  return (
    <div id="ai-analytics-view" className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-[#0a101d] border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>NEURAL GRID ANALYTICS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Rajdhani'] text-white">
            Real-Time Energy Telemetry & System Dynamics
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Automated load balancing algorithms and dynamic fuel-minimization analytics.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Grid Stability</span>
            <span className="text-emerald-400 font-bold text-sm">98.6% Stable</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
            <span className="text-slate-400 block text-[10px]">CO2 Avoided</span>
            <span className="text-cyan-400 font-bold text-sm">4.82 Tons/hr</span>
          </div>
        </div>
      </div>

      {/* Primary Chart: Generation vs Demand */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0a101d] border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold font-['Rajdhani'] text-white">
              GENERATION VS. CONSUMPTION TELEMETRY
            </h3>
            <p className="text-xs text-slate-400">
              Live power flow trend over the last 15 updates (MW)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" /> Generation
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" /> Demand
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" /> Clean Mix
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recentReadings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGen" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCons" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRen" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c1322',
                  borderColor: '#06b6d4',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="generation" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGen)" name="Total Gen (MW)" />
              <Area type="monotone" dataKey="consumption" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorCons)" name="Demand (MW)" />
              <Area type="monotone" dataKey="renewable" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRen)" name="Renewable (MW)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Dual Charts: Grid Efficiency & Frequency Stability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grid Efficiency */}
        <div className="p-5 rounded-2xl bg-[#0a101d] border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-['Rajdhani'] text-white">
                INVERTER CONVERSION EFFICIENCY (%)
              </h3>
              <p className="text-xs text-slate-400">Harmonic distortion & thermal transmission metric</p>
            </div>
            <span className="text-xs font-mono font-bold text-sky-400">{metrics.gridEfficiencyPct}%</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentReadings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <YAxis domain={[85, 100]} stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1322',
                    borderColor: '#38bdf8',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="efficiency" stroke="#38bdf8" strokeWidth={2} dot={false} name="Efficiency %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Frequency Stability */}
        <div className="p-5 rounded-2xl bg-[#0a101d] border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-['Rajdhani'] text-white">
                GRID SYNCHRONOUS FREQUENCY (HZ)
              </h3>
              <p className="text-xs text-slate-400">Phase synchronization around 50.00 Hz nominal</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{metrics.gridFrequencyHz} Hz</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentReadings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <YAxis domain={[49.8, 50.2]} stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1322',
                    borderColor: '#10b981',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="frequency" stroke="#10b981" strokeWidth={2} dot={false} name="Frequency (Hz)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
