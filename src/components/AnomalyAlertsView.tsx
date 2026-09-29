import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Clock, MapPin, Wrench, RefreshCw } from 'lucide-react';
import { Alert, AnomalyItem } from '../types';
import { api } from '../services/api';

interface AnomalyAlertsViewProps {
  alerts: Alert[];
  anomalies: AnomalyItem[];
  onRefreshAlerts: () => void;
}

export const AnomalyAlertsView: React.FC<AnomalyAlertsViewProps> = ({
  alerts,
  anomalies,
  onRefreshAlerts
}) => {
  const [actingId, setActingId] = useState<string | null>(null);

  const handleAcknowledge = async (id: string) => {
    setActingId(id);
    try {
      await api.acknowledgeAlert(id);
      onRefreshAlerts();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    } finally {
      setActingId(null);
    }
  };

  const handleResolve = async (id: string) => {
    setActingId(id);
    try {
      await api.resolveAlert(id);
      onRefreshAlerts();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div id="anomaly-alerts-view" className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0a101d] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>ANOMALY DETECTION & ALERTS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Rajdhani'] text-white">
            Live Anomaly Diagnostics & Station Fault Isolation
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Continuous waveform surveillance for harmonic voltage drops, load surges, and line faults.
          </p>
        </div>

        <button
          onClick={onRefreshAlerts}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Status</span>
        </button>
      </div>

      {/* Real-Time Waveform Anomalies */}
      <div>
        <h3 className="text-sm font-bold font-['Rajdhani'] text-white uppercase tracking-wider mb-3">
          ACTIVE WAVEFORM ANOMALY RADAR
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {anomalies.map((ano) => (
            <div
              key={ano.id}
              className="p-4 rounded-xl bg-[#0a101d] border border-amber-500/30 flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white font-['Rajdhani'] text-sm">{ano.type}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-bold">
                    {ano.severity}
                  </span>
                </div>
                <div className="text-slate-400 font-mono text-[11px] mb-2">
                  Node: <span className="text-cyan-300">{ano.affectedNode}</span> • Value: <span className="text-amber-300">{ano.currentValue}</span> (Expected: {ano.expectedRange})
                </div>
                <div className="p-2 rounded-lg bg-[#070b14] border border-slate-800 text-[11px] text-slate-300">
                  <strong className="text-cyan-400">Action:</strong> {ano.recommendedAction}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Incidents & Station Alerts Table/List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-['Rajdhani'] text-white uppercase tracking-wider">
            STATION INCIDENTS & ALERT QUEUE
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {alerts.filter(a => a.status === 'ACTIVE').length} Active Alerts
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {alerts.map((alert) => {
              const isCritical = alert.severity === 'CRITICAL';
              const isWarning = alert.severity === 'WARNING';
              const isResolved = alert.status === 'RESOLVED';
              const isAck = alert.status === 'ACKNOWLEDGED';

              return (
                <motion.div
                  key={alert.id}
                  id={`alert-item-${alert.id}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-xl border transition-all ${
                    isResolved
                      ? 'bg-[#080d18]/40 border-slate-800/60 opacity-60'
                      : isCritical
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-[#0a101d] border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isCritical ? 'bg-rose-950 text-rose-400' : isWarning ? 'bg-amber-950 text-amber-400' : 'bg-slate-900 text-slate-400'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                            isCritical ? 'bg-rose-950 text-rose-300 border-rose-500/50' : isWarning ? 'bg-amber-950 text-amber-300 border-amber-500/50' : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-sm font-bold text-white font-['Rajdhani']">
                            {alert.alertType}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            • {alert.location}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mb-2">
                          {alert.description}
                        </p>

                        <div className="text-[11px] text-cyan-300 font-mono">
                          Recommended Protocol: <span className="text-slate-200">{alert.recommendedAction}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {alert.status === 'ACTIVE' && (
                        <button
                          id={`alert-ack-btn-${alert.id}`}
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={actingId === alert.id}
                          className="px-3 py-1.5 rounded-lg border border-cyan-700 text-cyan-300 hover:bg-cyan-950 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}

                      {alert.status !== 'RESOLVED' && (
                        <button
                          id={`alert-resolve-btn-${alert.id}`}
                          onClick={() => handleResolve(alert.id)}
                          disabled={actingId === alert.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}

                      {isResolved && (
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
