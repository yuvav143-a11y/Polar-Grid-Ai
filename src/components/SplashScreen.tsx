import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ShieldCheck, Activity } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    // Step 0: Initial grid & logo appear
    // Step 1: Energy lines animate & surge
    // Step 2: Glowing electricity & Tagline
    // Step 3: Smooth transition to login
    const t1 = setTimeout(() => setStep(1), 700);
    const t2 = setTimeout(() => setStep(2), 1700);
    const t3 = setTimeout(() => {
      setStep(3);
      setTimeout(onComplete, 600);
    }, 3100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {step < 3 && (
        <motion.div
          id="polar-grid-splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b14] overflow-hidden select-none"
        >
          {/* Cybernetic Grid Matrix Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.14),transparent_70%)] pointer-events-none" />
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(56, 189, 248, 0.15) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(56, 189, 248, 0.15) 1px, transparent 1px)`,
              backgroundSize: '48px 48px'
            }}
          />

          {/* Animated Electrical Wave Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <motion.path
              d="M0,300 Q400,220 800,320 T1600,280 T2400,310"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: step >= 1 ? 1 : 0, opacity: step >= 1 ? 0.7 : 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            <motion.path
              d="M0,500 Q450,560 900,480 T1800,520 T2400,490"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: step >= 1 ? 1 : 0, opacity: step >= 1 ? 0.6 : 0 }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
            />
          </svg>

          {/* Center Brand Cluster */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {/* Glowing Icon Frame */}
            <motion.div
              id="splash-logo-symbol"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-28 h-28 mb-8 flex items-center justify-center"
            >
              {/* Electric Pulse Halo */}
              <div className="absolute inset-0 rounded-3xl bg-cyan-500/20 blur-2xl animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border border-cyan-400/40 bg-gradient-to-b from-cyan-950/80 to-[#0b162c] shadow-[0_0_40px_rgba(6,182,212,0.35)] flex items-center justify-center backdrop-blur-md">
                {/* Geometric Grid Emblem */}
                <div className="relative flex items-center justify-center">
                  <Zap className="w-14 h-14 text-cyan-400 drop-shadow-[0_0_16px_rgba(6,182,212,0.8)]" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                    className="absolute -inset-3 rounded-full border border-dashed border-cyan-400/30 pointer-events-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              id="splash-brand-title"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl font-extrabold tracking-wider text-white font-['Rajdhani'] flex items-center gap-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
            >
              POLAR-GRID <span className="text-cyan-400">AI</span>
            </motion.h1>

            {/* Animated Electricity Divider */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: step >= 1 ? '160px' : 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-4 shadow-[0_0_12px_#22d3ee]"
            />

            {/* Tagline */}
            <motion.p
              id="splash-tagline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }}
              transition={{ duration: 0.6 }}
              className="text-cyan-200/90 text-sm md:text-base font-medium tracking-widest uppercase font-['Plus_Jakarta_Sans']"
            >
              Intelligent Grid Energy Management & AI Analytics
            </motion.p>

            {/* Loading Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex items-center gap-2 text-xs font-mono text-cyan-400/70"
            >
              <Activity className="w-4 h-4 animate-spin" />
              <span>INITIALIZING SECURE GRID CORE...</span>
            </motion.div>
          </div>

          {/* Quick Skip Control in corner */}
          <button
            id="splash-skip-button"
            onClick={onComplete}
            className="absolute bottom-6 right-8 text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-wider py-1 px-3 rounded border border-slate-800 hover:border-cyan-800"
          >
            Skip Intro [Esc]
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
