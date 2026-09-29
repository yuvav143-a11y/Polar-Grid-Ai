import React from 'react';
import { Lightbulb, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Recommendation } from '../types';

interface AiRecommendationsViewProps {
  recommendations: Recommendation[];
}

export const AiRecommendationsView: React.FC<AiRecommendationsViewProps> = ({ recommendations }) => {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return {
          badge: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
          border: 'border-rose-500/40',
          indicator: 'bg-rose-500'
        };
      case 'MEDIUM':
        return {
          badge: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
          border: 'border-amber-500/40',
          indicator: 'bg-amber-500'
        };
      case 'LOW':
      default:
        return {
          badge: 'bg-blue-950/80 text-blue-300 border-blue-500/50',
          border: 'border-blue-500/40',
          indicator: 'bg-blue-500'
        };
    }
  };

  return (
    <div id="ai-recommendations-view" className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0a101d] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Lightbulb className="w-4 h-4" />
            <span>HEURISTIC AI OPTIMIZER</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Rajdhani'] text-white">
            Operational AI Guidance & Dispatch Rules
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Real-time automated guidance minimizing diesel burn while securing life-support redundancy.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Active Heuristic Engine v4.2</span>
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const style = getPriorityStyle(rec.priority);
          return (
            <div
              key={rec.id}
              className={`p-5 rounded-2xl bg-[#0a101d] border ${style.border} transition-all hover:border-cyan-400/50 shadow-md`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${style.indicator}`} />
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${style.badge}`}>
                    {rec.priority} PRIORITY
                  </span>
                  {rec.affectedSource && (
                    <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                      Target: {rec.affectedSource}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Calculated: {new Date(rec.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <h4 className="text-base font-bold text-white font-['Rajdhani']">
                    {rec.recommendation}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    <strong className="text-slate-300 font-mono">System Justification:</strong> {rec.reason}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Optimal for grid stability & reserve preservation</span>
                  </span>
                  <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold cursor-pointer hover:underline self-end sm:self-auto">
                    <span>Acknowledge Protocol</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
