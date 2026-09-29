import React from 'react';
import { motion } from 'motion/react';
import { Zap, Play, Activity, CheckCircle, ShieldCheck, MapPin, Gauge } from 'lucide-react';
import { User, ResearchStation } from '../types';

interface WelcomeScreenProps {
  user: User;
  station: ResearchStation;
  onStartEngine: () => void;
  loading?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  user,
  station,
  onStartEngine,
  loading = false
}) => {
  return (
    <div id="polar-grid-welcome-view" className="min-h-[82vh] flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-2xl bg-[#0b1220]/90 border border-cyan-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 my-auto shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center overflow-hidden"
      >
        {/* Futuristic Background accents */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono mb-4 sm:mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Status: System Ready</span>
        </div>

        {/* Welcome Greeting with exact database username */}
        <h1 id="welcome-user-greeting" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-['Rajdhani'] mb-2">
          Welcome, <span className="text-cyan-400">{user.username}</span>
        </h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-300 font-mono mb-6 sm:mb-8">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
            <span>Research Station: <strong className="text-white">{station.name}</strong></span>
          </div>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 text-[11px] sm:text-xs">{station.location}</span>
        </div>

        {/* Center Control Emblem */}
        <div className="flex flex-col items-center justify-center my-4 sm:my-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-950 to-[#0d1f3f] border border-cyan-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-3 sm:mb-4">
            <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
          </div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-cyan-300/80 font-mono">POLAR-GRID AI</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-wider text-white font-['Rajdhani'] mt-0.5">
            AI GRID CONTROL CENTER
          </h2>
        </div>

        {/* Engine Offline Status Banner */}
        <div className="max-w-md mx-auto mb-6 sm:mb-8 p-3 rounded-xl bg-[#070b14] border border-slate-800 text-slate-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>AI ENGINE STATE:</span>
            <span className="font-bold text-slate-400">● OFFLINE</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Awaiting Operator Ignition</span>
        </div>

        {/* Large START AI ENGINE Button */}
        <div className="flex flex-col items-center">
          <motion.button
            id="start-ai-engine-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartEngine}
            disabled={loading}
            className="w-full max-w-md py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base sm:text-lg font-['Rajdhani'] tracking-widest shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 text-slate-950" />
                <span>START AI ENGINE</span>
              </>
            )}
          </motion.button>
          <p className="text-[11px] sm:text-xs text-slate-500 font-mono mt-3 max-w-sm sm:max-w-none">
            Initializes real-time telemetry, animated energy flow, predictive forecasting, and anomaly detection.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
