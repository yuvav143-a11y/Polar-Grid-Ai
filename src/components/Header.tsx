import React from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  Power,
  Play,
  Square,
  Activity,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  MapPin,
  LayoutDashboard,
  Cpu,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { User, ResearchStation } from '../types';

interface HeaderProps {
  user: User;
  station: ResearchStation;
  activeTab: string;
  onTabChange: (tab: string) => void;
  aiEngineActive: boolean;
  onToggleAiEngine: () => void;
  onSwitchStation: () => void;
  onLogout: () => void;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  station,
  activeTab,
  onTabChange,
  aiEngineActive,
  onToggleAiEngine,
  onSwitchStation,
  onLogout,
  activeAlertsCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'grid', label: 'Grid Monitoring', icon: Cpu },
    { id: 'analytics', label: 'AI Analytics', icon: BarChart3 },
    { id: 'predictions', label: 'AI Predictions', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts & Anomalies', icon: AlertTriangle, badge: activeAlertsCount },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header id="polar-grid-master-header" className="sticky top-0 z-30 bg-[#090e1a]/95 backdrop-blur-md border-b border-cyan-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Top Telemetry & Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between border-b border-slate-800/80 gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-['Rajdhani'] tracking-wider text-white">
                POLAR-GRID <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] font-mono uppercase bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-300 border border-cyan-800/60 hidden sm:inline-block">
                GRID OPERATOR
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider hidden md:block">
              Intelligent Grid Energy Management & AI Analytics
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Active Station Badge & Selector */}
          <div
            id="header-station-badge"
            onClick={onSwitchStation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1628] hover:bg-[#131f38] border border-slate-700/60 text-xs text-slate-300 cursor-pointer transition-colors"
            title="Click to switch research station"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-white hidden sm:inline">{station.name}</span>
            <span className="font-semibold text-white sm:hidden">{station.code}</span>
            <span className="text-[10px] text-cyan-400 font-mono">[{station.gridCapacityMw} MW]</span>
          </div>

          {/* AI ENGINE Status Indicator & Toggle Button */}
          <div className="flex items-center gap-2">
            <div
              id="ai-engine-status-indicator"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                aiEngineActive
                  ? 'bg-cyan-950/70 border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  aiEngineActive ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'
                }`}
              />
              <span>AI ENGINE</span>
              <span className={aiEngineActive ? 'text-cyan-300' : 'text-slate-400'}>
                {aiEngineActive ? '● ACTIVE' : '● OFFLINE'}
              </span>
            </div>

            <button
              id="ai-engine-toggle-button"
              onClick={onToggleAiEngine}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Rajdhani'] tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                aiEngineActive
                  ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              }`}
            >
              {aiEngineActive ? (
                <>
                  <Square className="w-3 h-3 fill-rose-300" />
                  <span>STOP AI ENGINE</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-white" />
                  <span>START AI ENGINE</span>
                </>
              )}
            </button>
          </div>

          {/* User Profile Badge (Exact stored database username!) */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-left text-xs">
              <span className="block font-semibold text-white">Welcome, {user.username}</span>
              <span className="block text-[10px] text-cyan-400 font-mono tracking-wider">{user.role || 'GRID OPERATOR'}</span>
            </div>
          </div>

          {/* Logout */}
          <button
            id="header-logout-button"
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
