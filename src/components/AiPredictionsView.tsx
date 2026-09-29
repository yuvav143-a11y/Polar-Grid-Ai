import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { TrendingUp, AlertCircle, Clock, Sparkles, ArrowUpRight, ArrowDownRight, ShieldCheck } from 'lucide-react';
import { PredictionHorizon } from '../types';

interface AiPredictionsViewProps {
  predictions: PredictionHorizon[];
}

export const AiPredictionsView: React.FC<AiPredictionsViewProps> = ({ predictions }) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'1H' | '6H' | '24H'>('1H');

  const currentPred = predictions.find(p => p.horizon === selectedHorizon) || predictions[0];

  return (
    <div id="ai-predictions-view" className="space-y-6">
      {/* 1. Crucial Peak Demand Notification Banner (Requirement 17) */}
      <div 
        id="peak-demand-banner"
        className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#1e150a] to-amber-950/60 border border-amber-500/40 flex items-start sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(245,158,11,0.15)]"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                AI PREDICTIVE DISPATCH ADVISORY
              </span>
              <span className="text-[10px] font-mono bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded border border-amber-700/60">
                HIGH CERTAINTY
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-['Rajdhani'] text-white mt-0.5">
              Peak demand expected between 18:00 and 20:00.
            </h3>
            <p className="text-xs text-amber-200/80">
              Anticipated load ramp to 142 MW. Battery pre-charging cycle recommended during high solar hours.
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-col text-right font-mono text-xs">
          <span className="text-slate-400">Confidence Score</span>
          <span className="text-lg font-bold text-amber-400">{currentPred?.confidencePct}%</span>
        </div>
      </div>

      {/* 2. Horizon Selection Tabs & Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {predictions.map((p) => {
          const isSelected = p.horizon === selectedHorizon;
          return (
            <div
              key={p.horizon}
              id={`prediction-card-${p.horizon}`}
              onClick={() => setSelectedHorizon(p.horizon)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-950/50 to-[#0e172a] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                  : 'bg-[#0a101d] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#070b14] border border-cyan-800/60 text-cyan-300">
                  {p.horizon} HORIZON
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  p.trend === 'RISING'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                }`}>
                  {p.trend === 'RISING' ? '↑ RISING DEMAND' : 'STABLE LOAD'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Forecast Load</span>
                  <span className="text-xl font-bold font-['Rajdhani'] text-amber-300">{p.predictedLoadMw} MW</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Renewables</span>
                  <span className="text-xl font-bold font-['Rajdhani'] text-emerald-300">{p.predictedRenewableMw} MW</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Confidence:</span>
                <span className="font-bold text-cyan-400">{p.confidencePct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Detailed Forecast Curve with Upper & Lower Confidence Range */}
      {currentPred && (
        <div className="p-5 rounded-2xl bg-[#0a101d] border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold font-['Rajdhani'] text-white">
                  NEURAL NETWORK LOAD FORECAST & CONFIDENCE INTERVALS ({currentPred.horizon})
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Probability bounds (P10 to P90) calculated against historical polar meteorological models.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-300">
              Expected Event: <span className="text-white font-bold">{currentPred.expectedPeakPeriod}</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentPred.hourlyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="confidenceBand" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" domain={['dataMin - 15', 'dataMax + 15']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1322',
                    borderColor: '#06b6d4',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                {/* Confidence Range Area */}
                <Area
                  type="monotone"
                  dataKey="confidenceHigh"
                  stroke="#38bdf8"
                  strokeDasharray="3 3"
                  fill="url(#confidenceBand)"
                  name="Upper Bound (P90)"
                />
                <Area
                  type="monotone"
                  dataKey="confidenceLow"
                  stroke="#38bdf8"
                  strokeDasharray="3 3"
                  fill="transparent"
                  name="Lower Bound (P10)"
                />
                {/* Predicted Load Line */}
                <Line
                  type="monotone"
                  dataKey="loadMw"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b' }}
                  name="Forecast Load (MW)"
                />
                <Line
                  type="monotone"
                  dataKey="solarMw"
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  dot={false}
                  name="Solar Forecast (MW)"
                />
                <Line
                  type="monotone"
                  dataKey="windMw"
                  stroke="#0284c7"
                  strokeWidth={1.5}
                  dot={false}
                  name="Wind Forecast (MW)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
