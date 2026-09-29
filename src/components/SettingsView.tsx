import React, { useState } from 'react';
import { Settings as SettingsIcon, User as UserIcon, Lock, Bell, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { User, UserSettings } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUserUpdated }) => {
  const [username, setUsername] = useState(user.username);
  const [alertNotifications, setAlertNotifications] = useState(user.settings?.alertNotificationsEnabled ?? true);
  const [highLoadThreshold, setHighLoadThreshold] = useState(user.settings?.highLoadThresholdPct ?? 85);
  const [voltageVariance, setVoltageVariance] = useState(user.settings?.voltageVarianceTolerancePct ?? 5);
  const [theme, setTheme] = useState<'dark' | 'light'>(user.settings?.theme ?? 'dark');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSaveProfileAndPreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await api.updateSettings({
        username: username.trim(),
        alertNotificationsEnabled: alertNotifications,
        highLoadThresholdPct: Number(highLoadThreshold),
        voltageVarianceTolerancePct: Number(voltageVariance),
        theme
      });

      onUserUpdated({
        ...user,
        username: res.username || username.trim(),
        settings: res.settings
      });
      setFeedback({ type: 'success', message: 'Profile and preferences updated successfully in database.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update preferences.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!newPassword || newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setSaving(true);
    try {
      await api.updateSettings({
        oldPassword,
        newPassword
      } as any);

      setFeedback({ type: 'success', message: 'Security credentials updated successfully.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0a101d] border border-cyan-500/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-1">
            <SettingsIcon className="w-4 h-4" />
            <span>OPERATOR CONFIGURATION</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Rajdhani'] text-white">
            System Settings & Security Controls
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Manage operator profile, station alert triggers, and security credentials.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Profile & Grid Parameters Form */}
      <form onSubmit={handleSaveProfileAndPreferences} className="p-6 rounded-2xl bg-[#0a101d] border border-slate-800 space-y-6">
        <div>
          <h3 className="text-base font-bold font-['Rajdhani'] text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-cyan-400" /> Operator Profile
          </h3>
          <p className="text-xs text-slate-400">Account identity stored in PostgreSQL.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Operator Username
            </label>
            <input
              id="settings-username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-[#070b14] border border-slate-700 focus:border-cyan-400 rounded-lg px-3.5 py-2 text-sm text-white transition-colors outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">Stored exactly as entered (e.g. Yuva Raj).</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Account Status & Role
            </label>
            <div className="w-full bg-[#070b14]/50 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-cyan-400 font-mono flex items-center justify-between">
              <span>{user.role || 'GRID_OPERATOR'}</span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded font-semibold uppercase">
                {user.account_status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Trigger Thresholds */}
        <div className="pt-4 border-t border-slate-800/80">
          <h3 className="text-base font-bold font-['Rajdhani'] text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" /> Grid Alert Thresholds
          </h3>
          <p className="text-xs text-slate-400 mb-4">Set operational tolerances for anomaly engine triggers.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">High Load Alarm Threshold:</span>
                <span className="font-bold text-cyan-400">{highLoadThreshold}%</span>
              </div>
              <input
                id="settings-high-load-slider"
                type="range"
                min="60"
                max="95"
                value={highLoadThreshold}
                onChange={(e) => setHighLoadThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Voltage Variance Tolerance:</span>
                <span className="font-bold text-cyan-400">±{voltageVariance}%</span>
              </div>
              <input
                id="settings-voltage-variance-slider"
                type="range"
                min="1"
                max="10"
                value={voltageVariance}
                onChange={(e) => setVoltageVariance(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <input
              id="settings-alerts-toggle"
              type="checkbox"
              checked={alertNotifications}
              onChange={(e) => setAlertNotifications(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
            <label htmlFor="settings-alerts-toggle" className="text-xs text-slate-300 cursor-pointer">
              Enable immediate audio/visual alert notifications on critical load spikes
            </label>
          </div>
        </div>

        <button
          id="settings-save-profile-btn"
          type="submit"
          disabled={saving}
          className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-['Rajdhani'] tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>

      {/* Security Credentials Form */}
      <form onSubmit={handleUpdatePassword} className="p-6 rounded-2xl bg-[#0a101d] border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold font-['Rajdhani'] text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" /> Security Credentials
          </h3>
          <p className="text-xs text-slate-400">Change master operator password.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
            <input
              id="settings-old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#070b14] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
            <input
              id="settings-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#070b14] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
            <input
              id="settings-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#070b14] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white outline-none"
            />
          </div>
        </div>

        <button
          id="settings-update-password-btn"
          type="submit"
          disabled={saving}
          className="py-2 px-5 rounded-xl border border-slate-700 hover:border-cyan-400 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          Update Password
        </button>
      </form>

      {/* Backend Server & Cross-Device Synchronization */}
      <div className="p-6 rounded-2xl bg-[#0a101d] border border-cyan-500/30 space-y-4">
        <div>
          <h3 className="text-base font-bold font-['Rajdhani'] text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Backend Server & Cross-Device Synchronization
          </h3>
          <p className="text-xs text-slate-400">
            Configure the persistent backend API URL used for cross-device authentication and centralized database storage.
          </p>
        </div>

        <BackendEndpointManager />
      </div>
    </div>
  );
};

const BackendEndpointManager: React.FC = () => {
  const [customUrl, setCustomUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('polar_grid_backend_url') || '';
    } catch {
      return '';
    }
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (customUrl.trim()) {
        localStorage.setItem('polar_grid_backend_url', customUrl.trim().replace(/\/+$/, ''));
      } else {
        localStorage.removeItem('polar_grid_backend_url');
      }

      const res = await api.checkBackendHealth();
      setTestResult({
        ok: true,
        message: `Connected successfully: ${res.service || 'POLAR-GRID AI Backend'} (${res.status || 'OK'})`
      });
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err.message || 'Unable to connect to backend server.'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Backend API URL (for GitHub Pages / External Hosting):
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Leave blank for same-origin, or enter https://your-backend.onrender.com"
            className="flex-1 bg-[#070b14] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
          />
          <button
            type="button"
            onClick={handleSaveAndTest}
            disabled={testing}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold font-['Rajdhani'] tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Save & Test Connection'}
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          When hosting on GitHub Pages, enter the live URL of your deployed Polar Grid AI Node/Express backend.
        </p>
      </div>

      {testResult && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            testResult.ok
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {testResult.ok ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}
    </div>
  );
};
