import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sun, Wind, Droplets, Fuel, BatteryCharging, Zap, Building2, ArrowRight, ArrowLeft, Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { EnergySource, SystemMetrics } from '../types';

interface EnergyFlowVisualizerProps {
  sources: EnergySource[];
  metrics: SystemMetrics;
  aiEngineActive: boolean;
  aiTopRecommendation?: string;
}

export const EnergyFlowVisualizer: React.FC<EnergyFlowVisualizerProps> = ({
  sources,
  metrics,
  aiEngineActive,
  aiTopRecommendation
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const solar = sources.find(s => s.type === 'SOLAR') || { outputMw: 42, capacityMw: 50, availabilityPct: 84 };
  const wind = sources.find(s => s.type === 'WIND') || { outputMw: 28, capacityMw: 42, availabilityPct: 67 };
  const hydro = sources.find(s => s.type === 'HYDRO') || { outputMw: 36, capacityMw: 40, availabilityPct: 90 };
  const diesel = sources.find(s => s.type === 'DIESEL') || { outputMw: 0, capacityMw: 34, availabilityPct: 75 };
  const battery = sources.find(s => s.type === 'BATTERY') || { outputMw: 18, capacityMw: 30, availabilityPct: 68 };

  const isBatteryDischarging = metrics.batteryFlowMw > 0;
  const isBatteryCharging = metrics.batteryFlowMw < 0;
  const batteryFlowAbsolute = Math.abs(metrics.batteryFlowMw);

  // Canvas particle stream effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      startX: number;
      startY: number;
      targetX: number;
      targetY: number;
      progress: number;
      speed: number;
      color: string;
      size: number;
    }> = [];

    // Resize canvas
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Create particles based on power sources
    const createParticle = (
      startX: number,
      startY: number,
      targetX: number,
      targetY: number,
      color: string,
      power: number
    ) => {
      if (power <= 0) return;
      particles.push({
        x: startX,
        y: startY,
        startX,
        startY,
        targetX,
        targetY,
        progress: Math.random(),
        speed: 0.005 + (power / 50) * 0.008,
        color,
        size: 2 + Math.min(3, power / 15)
      });
    };

    // Re-init particle pools
    const initParticles = () => {
      particles = [];
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      const gridX = w * 0.5;
      const gridY = h * 0.44;
      const loadX = w * 0.88;
      const loadY = h * 0.44;

      // Source positions (left column)
      const srcX = w * 0.12;
      const srcYs = [h * 0.16, h * 0.32, h * 0.58, h * 0.76]; // Solar, Wind, Hydro, Diesel
      const colors = ['#f59e0b', '#38bdf8', '#06b6d4', '#e2e8f0'];
      const powers = [solar.outputMw, wind.outputMw, hydro.outputMw, diesel.outputMw];

      for (let i = 0; i < 4; i++) {
        const count = Math.max(3, Math.min(10, Math.floor(powers[i] / 5)));
        for (let p = 0; p < count; p++) {
          createParticle(srcX, srcYs[i], gridX, gridY, colors[i], powers[i]);
        }
      }

      // Battery connection (bi-directional!)
      const battX = w * 0.5;
      const battY = h * 0.82;
      if (isBatteryDischarging) {
        // Discharging: Battery -> Grid
        for (let p = 0; p < 8; p++) {
          createParticle(battX, battY, gridX, gridY, '#10b981', batteryFlowAbsolute || 10);
        }
      } else if (isBatteryCharging) {
        // Charging: Grid -> Battery
        for (let p = 0; p < 8; p++) {
          createParticle(gridX, gridY, battX, battY, '#34d399', batteryFlowAbsolute || 10);
        }
      }

      // Grid -> Load
      const loadCount = Math.max(6, Math.min(14, Math.floor(metrics.totalConsumptionMw / 12)));
      for (let p = 0; p < loadCount; p++) {
        createParticle(gridX, gridY, loadX, loadY, '#22d3ee', metrics.totalConsumptionMw);
      }
    };

    initParticles();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (aiEngineActive) {
        particles.forEach((p) => {
          p.progress += p.speed;
          if (p.progress > 1) {
            p.progress = 0;
          }

          // Cubic Bezier interpolation towards target
          const t = p.progress;
          const cx1 = p.startX + (p.targetX - p.startX) * 0.5;
          const cy1 = p.startY;
          const cx2 = p.startX + (p.targetX - p.startX) * 0.5;
          const cy2 = p.targetY;

          // Standard 1D Bezier on both axes
          const x = (1 - t) ** 3 * p.startX + 3 * (1 - t) ** 2 * t * cx1 + 3 * (1 - t) * t ** 2 * cx2 + t ** 3 * p.targetX;
          const y = (1 - t) ** 3 * p.startY + 3 * (1 - t) ** 2 * t * cy1 + 3 * (1 - t) * t ** 2 * cy2 + t ** 3 * p.targetY;

          // Draw Glowing Energy Particle
          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    solar.outputMw,
    wind.outputMw,
    hydro.outputMw,
    diesel.outputMw,
    metrics.batteryFlowMw,
    metrics.totalConsumptionMw,
    aiEngineActive,
    isBatteryCharging,
    isBatteryDischarging,
    batteryFlowAbsolute
  ]);

  return (
    <div id="polar-grid-energy-flow-container" className="relative w-full bg-[#0a101d] border border-cyan-500/30 rounded-2xl p-4 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Background Cybernetic Blueprint Pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6,182,212,0.15) 0%, transparent 80%),
                            linear-gradient(to right, rgba(56, 189, 248, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(56, 189, 248, 0.08) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      />

      {/* Header bar of visualizer */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold font-['Rajdhani'] text-white tracking-wide">
              LIVE ENERGY FLOW VISUALIZATION
            </h2>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
              aiEngineActive
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}>
              {aiEngineActive ? 'TELEMETRY LIVE' : 'FLOW PAUSED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-source generation, bi-directional storage dispatch, and distribution load.
          </p>
        </div>

        {/* Immediate 5-second status badge */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-md bg-[#0f172a] border border-slate-700 text-slate-300">
            Total Gen: <span className="font-bold text-cyan-400">{metrics.totalGenerationMw} MW</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-[#0f172a] border border-slate-700 text-slate-300">
            Demand: <span className="font-bold text-amber-400">{metrics.totalConsumptionMw} MW</span>
          </div>
        </div>
      </div>

      {/* MOBILE FLOW PRESENTATION (< md) */}
      <div className="block md:hidden space-y-3">
        {/* 1. Generation Sources Grid (2x2) */}
        <div className="p-3.5 rounded-xl bg-[#070b14]/90 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2.5">
            <span className="uppercase tracking-wider font-bold text-slate-300">Generation Vectors</span>
            <span className="text-cyan-400 font-bold">{metrics.totalGenerationMw} MW Active</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Solar */}
            <div className="p-2.5 rounded-lg bg-[#0b1424] border border-amber-500/40">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-bold text-amber-300">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> SOLAR
                </span>
                <span className="text-[10px] font-mono text-amber-400">{solar.availabilityPct}%</span>
              </div>
              <div className="mt-1 font-mono">
                <span className="text-sm font-bold text-white">{solar.outputMw}</span>
                <span className="text-[10px] text-slate-400 ml-1">/{solar.capacityMw} MW</span>
              </div>
            </div>

            {/* Wind */}
            <div className="p-2.5 rounded-lg bg-[#0b1424] border border-sky-500/40">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-bold text-sky-300">
                  <Wind className="w-3.5 h-3.5 text-sky-400" /> WIND
                </span>
                <span className="text-[10px] font-mono text-sky-400">{wind.availabilityPct}%</span>
              </div>
              <div className="mt-1 font-mono">
                <span className="text-sm font-bold text-white">{wind.outputMw}</span>
                <span className="text-[10px] text-slate-400 ml-1">/{wind.capacityMw} MW</span>
              </div>
            </div>

            {/* Hydro */}
            <div className="p-2.5 rounded-lg bg-[#0b1424] border border-cyan-500/40">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-bold text-cyan-300">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> HYDRO
                </span>
                <span className="text-[10px] font-mono text-cyan-400">{hydro.availabilityPct}%</span>
              </div>
              <div className="mt-1 font-mono">
                <span className="text-sm font-bold text-white">{hydro.outputMw}</span>
                <span className="text-[10px] text-slate-400 ml-1">/{hydro.capacityMw} MW</span>
              </div>
            </div>

            {/* Diesel */}
            <div className="p-2.5 rounded-lg bg-[#0b1424] border border-slate-700/60">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-bold text-slate-300">
                  <Fuel className="w-3.5 h-3.5 text-slate-400" /> DIESEL
                </span>
                <span className="text-[10px] font-mono text-slate-400">{diesel.availabilityPct}%</span>
              </div>
              <div className="mt-1 font-mono">
                <span className="text-sm font-bold text-white">{diesel.outputMw}</span>
                <span className="text-[10px] text-slate-400 ml-1">/{diesel.capacityMw} MW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Downward Pulse Indicator */}
        <div className="flex items-center justify-center -my-1">
          <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-800/50 shadow-sm">
            <span>↓ POWER INJECTION FLOW ↓</span>
          </div>
        </div>

        {/* 2. Polar Core Grid Node */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-[#0b1a33] to-[#070f1f] border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] text-center">
          <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="font-extrabold font-['Rajdhani'] text-sm tracking-wider text-white">POLAR GRID CORE BUS</span>
          </div>
          <div className="text-2xl font-black font-['Rajdhani'] text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
            {metrics.totalGenerationMw} <span className="text-xs text-cyan-400 font-mono">MW GENERATED</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-cyan-900/60 text-[10px] font-mono">
            <div>
              <span className="block text-slate-400">Voltage</span>
              <span className="font-bold text-cyan-300">{metrics.gridVoltageKv} kV</span>
            </div>
            <div>
              <span className="block text-slate-400">Frequency</span>
              <span className="font-bold text-cyan-300">{metrics.gridFrequencyHz} Hz</span>
            </div>
            <div>
              <span className="block text-slate-400">Efficiency</span>
              <span className="font-bold text-emerald-300">{metrics.gridEfficiencyPct}%</span>
            </div>
          </div>
        </div>

        {/* 3. Battery Storage Bank Node */}
        <div className={`p-3 rounded-xl border text-xs font-mono transition-all ${
          isBatteryCharging
            ? 'bg-[#062016] border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
            : isBatteryDischarging
            ? 'bg-[#261506] border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
            : 'bg-[#0b1424] border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <BatteryCharging className={`w-3.5 h-3.5 ${
                isBatteryCharging ? 'text-emerald-400 animate-bounce' : isBatteryDischarging ? 'text-amber-400' : 'text-slate-400'
              }`} />
              BATTERY STORAGE
            </span>
            <span className="font-bold text-emerald-400">{battery.availabilityPct}% SoC</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
            <span className={isBatteryCharging ? 'text-emerald-400' : isBatteryDischarging ? 'text-amber-400' : 'text-slate-400'}>
              {isBatteryCharging ? '⚡ CHARGING FROM GRID' : isBatteryDischarging ? '⚡ DISCHARGING TO GRID' : 'STANDBY BALANCED'}
            </span>
            <span className="font-bold text-white">
              {batteryFlowAbsolute > 0 ? `${batteryFlowAbsolute} MW` : '0 MW'}
            </span>
          </div>
        </div>

        {/* Downward Pulse Indicator */}
        <div className="flex items-center justify-center -my-1">
          <div className="flex items-center gap-1 text-[10px] font-mono text-purple-400 bg-purple-950/70 px-2.5 py-0.5 rounded-full border border-purple-800/50 shadow-sm">
            <span>↓ LOAD DEMAND DISPATCH ↓</span>
          </div>
        </div>

        {/* 4. Station Consumption Node */}
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#1b122c] to-[#0c0a1a] border border-purple-400/80 text-center shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <div className="flex items-center justify-center gap-1.5 text-purple-300 mb-0.5">
            <Building2 className="w-3.5 h-3.5" />
            <span className="font-bold font-['Rajdhani'] text-xs uppercase tracking-wider text-white">RESEARCH STATION DEMAND</span>
          </div>
          <div className="text-2xl font-black font-['Rajdhani'] text-purple-200">
            {metrics.totalConsumptionMw} <span className="text-xs text-purple-400 font-mono">MW</span>
          </div>
          <div className="mt-1 text-[10px] text-amber-300 font-mono">
            Grid Load Index: {metrics.currentGridLoadPct}% of Capacity
          </div>
        </div>
      </div>

      {/* Main Flow Stage Canvas & Interactive Nodes (DESKTOP & TABLET >= md) */}
      <div className="hidden md:block relative w-full h-[480px] sm:h-[520px] rounded-xl bg-[#070b14]/90 border border-slate-800/80 overflow-hidden">
        {/* Dynamic Canvas for particles */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Static Background Circuit Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="cyanLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="battLine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Source lines to Grid */}
          <path d="M 16% 16% C 32% 16%, 35% 44%, 50% 44%" fill="none" stroke="url(#cyanLine)" strokeWidth="2.5" strokeDasharray={aiEngineActive ? '4 2' : 'none'} opacity="0.6" />
          <path d="M 16% 32% C 32% 32%, 35% 44%, 50% 44%" fill="none" stroke="url(#cyanLine)" strokeWidth="2.5" strokeDasharray={aiEngineActive ? '4 2' : 'none'} opacity="0.6" />
          <path d="M 16% 58% C 32% 58%, 35% 44%, 50% 44%" fill="none" stroke="url(#cyanLine)" strokeWidth="2.5" strokeDasharray={aiEngineActive ? '4 2' : 'none'} opacity="0.6" />
          <path d="M 16% 76% C 32% 76%, 35% 44%, 50% 44%" fill="none" stroke="url(#cyanLine)" strokeWidth="2.5" strokeDasharray={aiEngineActive ? '4 2' : 'none'} opacity="0.6" />

          {/* Battery Vertical Bi-directional Bus */}
          <path d="M 50% 44% L 50% 82%" fill="none" stroke="url(#battLine)" strokeWidth="3" strokeDasharray={aiEngineActive ? '4 2' : 'none'} opacity="0.7" />

          {/* Grid to Load Line */}
          <path d="M 50% 44% L 88% 44%" fill="none" stroke="#22d3ee" strokeWidth="3.5" strokeDasharray={aiEngineActive ? '6 3' : 'none'} opacity="0.8" />
        </svg>

        {/* 1. COLUMN 1: GENERATION SOURCES (LEFT) */}
        <div className="absolute left-2 sm:left-6 top-3 bottom-3 flex flex-col justify-around w-36 sm:w-44 z-20 pointer-events-auto">
          {/* Solar */}
          <div id="flow-node-solar" className="p-2 sm:p-2.5 rounded-xl bg-[#0b1424] border border-amber-500/40 shadow-lg text-slate-200">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1 font-bold text-amber-300">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> SOLAR
              </span>
              <span className="text-[10px] font-mono text-amber-400/90">{solar.availabilityPct}%</span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-sm sm:text-base font-bold text-white">{solar.outputMw} MW</span>
              <span className="text-[10px] text-slate-400">/{solar.capacityMw} MW</span>
            </div>
          </div>

          {/* Wind */}
          <div id="flow-node-wind" className="p-2 sm:p-2.5 rounded-xl bg-[#0b1424] border border-sky-500/40 shadow-lg text-slate-200">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1 font-bold text-sky-300">
                <Wind className="w-3.5 h-3.5 text-sky-400" /> WIND
              </span>
              <span className="text-[10px] font-mono text-sky-400/90">{wind.availabilityPct}%</span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-sm sm:text-base font-bold text-white">{wind.outputMw} MW</span>
              <span className="text-[10px] text-slate-400">/{wind.capacityMw} MW</span>
            </div>
          </div>

          {/* Hydro */}
          <div id="flow-node-hydro" className="p-2 sm:p-2.5 rounded-xl bg-[#0b1424] border border-cyan-500/40 shadow-lg text-slate-200">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1 font-bold text-cyan-300">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" /> HYDRO
              </span>
              <span className="text-[10px] font-mono text-cyan-400/90">{hydro.availabilityPct}%</span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-sm sm:text-base font-bold text-white">{hydro.outputMw} MW</span>
              <span className="text-[10px] text-slate-400">/{hydro.capacityMw} MW</span>
            </div>
          </div>

          {/* Diesel */}
          <div id="flow-node-diesel" className="p-2 sm:p-2.5 rounded-xl bg-[#0b1424] border border-slate-600/50 shadow-lg text-slate-200">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1 font-bold text-slate-300">
                <Fuel className="w-3.5 h-3.5 text-slate-400" /> DIESEL
              </span>
              <span className="text-[10px] font-mono text-slate-400">{diesel.availabilityPct}%</span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-sm sm:text-base font-bold text-white">{diesel.outputMw} MW</span>
              <span className="text-[10px] text-slate-400">/{diesel.capacityMw} MW</span>
            </div>
          </div>
        </div>

        {/* 2. CENTER: POLAR CORE GRID & INVERTER BUS */}
        <div 
          id="flow-node-grid-center"
          className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-48 sm:w-56 p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#0b1a33] to-[#070f1f] border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)] text-center z-20 pointer-events-auto"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1 text-cyan-400">
            <Zap className="w-5 h-5 animate-pulse" />
            <span className="font-extrabold font-['Rajdhani'] text-base tracking-wider text-white">POLAR GRID</span>
          </div>

          <div className="text-2xl sm:text-3xl font-black font-['Rajdhani'] text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            {metrics.totalGenerationMw} <span className="text-sm text-cyan-400 font-mono">MW</span>
          </div>

          <div className="grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-cyan-900/60 text-[10px] font-mono text-slate-300">
            <div>
              <span className="block text-slate-500">Voltage</span>
              <span className="font-bold text-cyan-300">{metrics.gridVoltageKv} kV</span>
            </div>
            <div>
              <span className="block text-slate-500">Frequency</span>
              <span className="font-bold text-cyan-300">{metrics.gridFrequencyHz} Hz</span>
            </div>
          </div>

          <div className="mt-1.5 text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Efficiency: {metrics.gridEfficiencyPct}%</span>
          </div>
        </div>

        {/* 3. BATTERY STORAGE BANK (ATTACHED VERTICALLY TO GRID) */}
        <div 
          id="flow-node-battery"
          className={`absolute left-1/2 top-[82%] -translate-x-1/2 -translate-y-1/2 w-48 sm:w-60 p-3 rounded-2xl border transition-all z-20 pointer-events-auto ${
            isBatteryCharging
              ? 'bg-[#062016] border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
              : isBatteryDischarging
              ? 'bg-[#261506] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
              : 'bg-[#0b1424] border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <BatteryCharging className={`w-4 h-4 ${
                isBatteryCharging ? 'text-emerald-400 animate-bounce' : isBatteryDischarging ? 'text-amber-400' : 'text-slate-400'
              }`} />
              BATTERY STORAGE
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400">{battery.availabilityPct}% SoC</span>
          </div>

          {/* Bi-directional Flow Status Pill */}
          <div className="flex items-center justify-between text-xs font-mono mt-1 pt-1 border-t border-slate-800">
            <span className="text-[11px] text-slate-300">
              {isBatteryCharging ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 rotate-90" /> CHARGING FROM GRID
                </span>
              ) : isBatteryDischarging ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3 rotate-90" /> DISCHARGING TO GRID
                </span>
              ) : (
                <span className="text-slate-400">STANDBY / BALANCED</span>
              )}
            </span>
            <span className="font-bold text-white">
              {batteryFlowAbsolute > 0 ? `${batteryFlowAbsolute} MW` : '0 MW'}
            </span>
          </div>
        </div>

        {/* 4. COLUMN 3: CONSUMPTION / STATION LOAD (RIGHT) */}
        <div 
          id="flow-node-consumption"
          className="absolute right-2 sm:right-6 top-[44%] -translate-y-1/2 w-36 sm:w-48 p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#1b122c] to-[#0c0a1a] border-2 border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.3)] text-center z-20 pointer-events-auto"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1 text-purple-300">
            <Building2 className="w-4 h-4" />
            <span className="font-extrabold font-['Rajdhani'] text-sm tracking-wider text-white">STATION LOAD</span>
          </div>

          <div className="text-2xl sm:text-3xl font-black font-['Rajdhani'] text-purple-200 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]">
            {metrics.totalConsumptionMw} <span className="text-sm text-purple-400 font-mono">MW</span>
          </div>

          <div className="mt-2 pt-2 border-t border-purple-900/60 text-[10px] font-mono text-slate-300">
            <span className="block text-slate-400">Grid Load Index</span>
            <span className="font-bold text-amber-300 text-xs">{metrics.currentGridLoadPct}% of Capacity</span>
          </div>

          <div className="mt-1 text-[9px] text-slate-400 font-mono">
            Scientific Arrays & Life Support
          </div>
        </div>
      </div>

      {/* Immediate AI Recommendation Guidance Pill at bottom of visualizer */}
      <div 
        id="flow-ai-recommendation-banner"
        className="relative z-10 mt-3 p-3 rounded-xl bg-gradient-to-r from-cyan-950/70 via-[#0d1c33] to-blue-950/70 border border-cyan-500/30 flex items-start sm:items-center gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold font-['Rajdhani'] text-white uppercase tracking-wider">AI RECOMMENDATION:</span>
            <span className="text-[10px] font-mono bg-cyan-900/60 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-700/50">
              OPTIMAL DISPATCH
            </span>
          </div>
          <p className="text-slate-300 mt-0.5">
            {aiTopRecommendation || "Solar & Hydro currently cover base station demand. Divert 14.5 MW surplus to Lithium Storage Bank to maximize polar reserve."}
          </p>
        </div>
      </div>
    </div>
  );
};
