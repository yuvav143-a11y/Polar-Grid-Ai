import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Leaf, Zap } from 'lucide-react';
import { EnergySource, SystemMetrics } from '../types';

interface EnergyMixDonutProps {
  sources: EnergySource[];
  metrics: SystemMetrics;
}

const COLORS: Record<string, string> = {
  SOLAR: '#f59e0b',
  WIND: '#38bdf8',
  HYDRO: '#06b6d4',
  DIESEL: '#94a3b8',
  BATTERY: '#10b981'
};

export const EnergyMixDonut: React.FC<EnergyMixDonutProps> = ({ sources, metrics }) => {
  const chartData = sources
    .filter(s => s.outputMw > 0)
    .map(s => ({
      name: s.name.split(' ')[0],
      value: s.outputMw,
      type: s.type,
      color: COLORS[s.type] || '#22d3ee'
    }));

  const totalGen = metrics.totalGenerationMw > 0 ? metrics.totalGenerationMw : 1;

  return (
    <div id="energy-mix-container" className="p-4 sm:p-5 rounded-2xl bg-[#0a101d] border border-cyan-500/20 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold font-['Rajdhani'] text-white uppercase tracking-wider">
            ENERGY GENERATION MIX
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
            <Leaf className="w-3 h-3" /> {metrics.renewableContributionPct}% Clean
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-2">
          Proportional real-time share of active station grid injection.
        </p>
      </div>

      {/* Donut Chart with Center Total */}
      <div className="relative w-full h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#090e1a" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`${value} MW (${((Number(value) / totalGen) * 100).toFixed(1)}%)`, 'Output']}
              contentStyle={{
                backgroundColor: '#0c1322',
                borderColor: '#06b6d4',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-black font-['Rajdhani'] text-white">
            {metrics.totalGenerationMw}
          </span>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
            TOTAL MW
          </span>
        </div>
      </div>

      {/* Legend with percentages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-800">
        {chartData.map((item) => {
          const pct = ((item.value / totalGen) * 100).toFixed(1);
          return (
            <div key={item.name} className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
              <div className="truncate">
                <span className="text-slate-300 font-bold">{item.name}</span>
                <span className="text-slate-400 ml-1 text-[11px]">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
