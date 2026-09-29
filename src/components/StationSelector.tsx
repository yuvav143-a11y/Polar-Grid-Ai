import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, CheckCircle2, Zap, Thermometer, Wind, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { ResearchStation } from '../types';

interface StationSelectorProps {
  onSelected: (station: ResearchStation) => void;
  currentStationId?: string;
}

export const StationSelector: React.FC<StationSelectorProps> = ({ onSelected, currentStationId }) => {
  const [stations, setStations] = useState<ResearchStation[]>([]);
  const [selectedId, setSelectedId] = useState<string>(currentStationId || 'station-alpha');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStations() {
      try {
        setLoading(true);
        const list = await api.getStations();
        setStations(list);
        if (currentStationId && list.some(s => s.id === currentStationId)) {
          setSelectedId(currentStationId);
        } else if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load research stations.');
      } finally {
        setLoading(false);
      }
    }
    loadStations();
  }, [currentStationId]);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.selectStation(selectedId);
      onSelected(res.station);
    } catch (err: any) {
      setError(err.message || 'Failed to save research station.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="station-selection-view" className="fixed inset-0 z-40 flex items-center justify-center bg-[#070b14]/95 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#0c1322] border border-cyan-500/30 rounded-2xl p-6 md:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.8)]"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-1">
              <Compass className="w-4 h-4" />
              <span>POLAR DEPLOYMENT SECTOR</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-['Rajdhani'] tracking-wide">
              Select Your Research Station
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Assign your operator profile to a telemetry sector for real-time grid monitoring and AI control.
            </p>
          </div>

          <button
            id="station-confirm-button"
            onClick={handleConfirm}
            disabled={saving || loading}
            className="self-start md:self-auto py-2.5 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Assigning...' : 'Confirm Assignment'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Station Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stations.map((station) => {
            const isSelected = station.id === selectedId;
            return (
              <div
                key={station.id}
                id={`station-card-${station.id}`}
                onClick={() => setSelectedId(station.id)}
                className={`relative rounded-xl p-5 border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/40 to-[#0f1b33] border-cyan-400/80 shadow-[0_0_24px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                    : 'bg-[#090e1a] border-slate-800 hover:border-slate-700 hover:bg-[#0d1424]'
                }`}
              >
                {/* Station Code Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                    {station.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{station.status}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white font-['Rajdhani'] mb-1">
                  {station.name}
                </h3>
                <p className="text-xs text-slate-400 mb-4">{station.location} • <span className="font-mono">{station.coordinates}</span></p>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#070b14]/70 border border-slate-800/80 mb-4 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-mono">Capacity</span>
                    <span className="text-sm font-bold text-cyan-300 font-mono">{station.gridCapacityMw} MW</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-mono flex items-center justify-center gap-0.5">
                      <Thermometer className="w-2.5 h-2.5 text-blue-400" /> Temp
                    </span>
                    <span className="text-sm font-bold text-blue-300 font-mono">{station.ambientTempC}°C</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-mono flex items-center justify-center gap-0.5">
                      <Wind className="w-2.5 h-2.5 text-cyan-400" /> Wind Chill
                    </span>
                    <span className="text-sm font-bold text-slate-300 font-mono">{station.windChillC}°C</span>
                  </div>
                </div>

                {/* Connected Sources */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Connected Generation Sources:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {station.connectedSources.map((source, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 text-xs text-cyan-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
