import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
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
  Menu,
  X,
  User as UserIcon
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header id="polar-grid-master-header" className="sticky top-0 z-30 bg-[#090e1a]/95 backdrop-blur-md border-b border-cyan-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Top Telemetry & Control Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between border-b border-slate-800/80 gap-2 sm:gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => onTabChange('dashboard')}>
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl font-bold font-['Rajdhani'] tracking-wider text-white">
                POLAR-GRID <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-300 border border-cyan-800/60 hidden md:inline-block">
                GRID OPERATOR
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider hidden lg:block">
              Intelligent Grid Energy Management & AI Analytics
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Active Station Badge & Selector (Desktop & Tablet) */}
          <div
            id="header-station-badge"
            onClick={onSwitchStation}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0e1628] hover:bg-[#131f38] border border-slate-700/60 text-xs text-slate-300 cursor-pointer transition-colors"
            title="Click to switch research station"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-white hidden md:inline">{station.name}</span>
            <span className="font-semibold text-white md:hidden">{station.code}</span>
            <span className="text-[10px] text-cyan-400 font-mono">[{station.gridCapacityMw} MW]</span>
          </div>

          {/* AI ENGINE Status Indicator (Desktop only) */}
          <div
            id="ai-engine-status-indicator"
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
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

          {/* AI ENGINE Toggle Button (Adaptive for mobile & desktop) */}
          <button
            id="ai-engine-toggle-button"
            onClick={onToggleAiEngine}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold font-['Rajdhani'] tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
              aiEngineActive
                ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
            }`}
          >
            {aiEngineActive ? (
              <>
                <Square className="w-3 h-3 fill-rose-300 shrink-0" />
                <span className="hidden sm:inline">STOP AI ENGINE</span>
                <span className="sm:hidden text-[11px]">STOP</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-white shrink-0" />
                <span className="hidden sm:inline">START AI ENGINE</span>
                <span className="sm:hidden text-[11px]">START AI</span>
              </>
            )}
          </button>

          {/* User Profile Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-left text-xs">
              <span className="block font-semibold text-white max-w-[120px] truncate">{user.username}</span>
              <span className="block text-[10px] text-cyan-400 font-mono tracking-wider">{user.role || 'GRID OPERATOR'}</span>
            </div>
          </div>

          {/* Logout (Desktop) */}
          <button
            id="header-logout-button"
            onClick={onLogout}
            className="hidden md:flex p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            id="header-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative p-2 text-slate-300 hover:text-white rounded-lg bg-slate-900/80 border border-slate-700/80 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-cyan-400" />
            ) : (
              <>
                <Menu className="w-5 h-5" />
                {activeAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Horizontal Nav Bar (Scrollable on touch screens) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <nav className="flex space-x-1.5 overflow-x-auto py-2 scrollbar-none -mx-1 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-0.5 sm:ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu (Slide-down overlay on phones) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-slate-800 bg-[#080d18] px-4 py-4 space-y-4 shadow-2xl overflow-hidden"
          >
            {/* Operator Info & Station */}
            <div className="p-3 rounded-xl bg-[#0d1526] border border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="block text-xs font-bold text-white leading-tight">Operator: {user.username}</span>
                  <span className="block text-[10px] text-cyan-400 font-mono">{station.name}</span>
                </div>
              </div>
              <button
                onClick={() => { onSwitchStation(); setMobileMenuOpen(false); }}
                className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
              >
                Switch Station
              </button>
            </div>

            {/* AI Engine Status in Drawer */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a101d] border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className={`w-2 h-2 rounded-full ${aiEngineActive ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
                <span className="text-slate-300">AI Engine:</span>
                <span className={`font-bold ${aiEngineActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {aiEngineActive ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>
              <button
                onClick={onToggleAiEngine}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-['Rajdhani'] ${
                  aiEngineActive ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-cyan-600 text-white'
                }`}
              >
                {aiEngineActive ? 'STOP' : 'START'}
              </button>
            </div>

            {/* Navigation Links Grid */}
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                        : 'bg-[#0a101d] text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500 text-white font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Logout button */}
            <button
              onClick={() => { onLogout(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-rose-500/30 text-rose-400 hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Operator Session</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
