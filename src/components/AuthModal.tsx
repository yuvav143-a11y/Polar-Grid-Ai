import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  onSuccess: (user: User, isNewUser: boolean) => void;
}

type AuthTab = 'login' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [tab, setTab] = useState<AuthTab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state (Show only: Username, Password, Confirm Password)
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const clearMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // 1. Validate username
    if (!registerUsername.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (registerUsername.trim().length < 2) {
      setError('Username must be at least 2 characters long.');
      return;
    }

    // 2. Validate password
    if (!registerPassword) {
      setError('Please enter a password.');
      return;
    }
    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // 3. Check that Password and Confirm Password match
    if (registerPassword !== registerConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // 4-6. Call backend registration
      await api.register({
        username: registerUsername.trim(),
        password: registerPassword,
        confirmPassword: registerConfirmPassword
      });

      // Show: "Account created successfully."
      setSuccessMsg('Account created successfully.');
      // Prepare Login tab with registered username
      setLoginUsername(registerUsername.trim());
      setLoginPassword('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      // Allow user to login using Username + Password
      setTab('login');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!loginUsername.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({
        username: loginUsername.trim(),
        password: loginPassword
      });
      onSuccess(res.user, false);
    } catch (err: any) {
      setError(err.message || 'Incorrect username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="polar-grid-auth-portal" className="fixed inset-0 z-40 flex items-center justify-center bg-[#070b14]/90 backdrop-blur-xl p-3 sm:p-4 overflow-y-auto">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-[#0c1322] border border-cyan-500/20 rounded-2xl p-5 sm:p-7 shadow-[0_12px_48px_rgba(0,0,0,0.7)] text-slate-100 my-auto"
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-5 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-[0_0_16px_rgba(6,182,212,0.4)] shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-wider font-['Rajdhani'] text-white">
                POLAR-GRID <span className="text-cyan-400">AI</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Secure Grid Control Authentication</p>
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded">
            PORTAL 3.0
          </span>
        </div>

        {/* Tab Switcher (LOGIN vs CREATE ACCOUNT) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#070b14] rounded-xl border border-slate-800 mb-6">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => { setTab('login'); clearMessages(); }}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            LOGIN
          </button>
          <button
            id="auth-tab-register"
            type="button"
            onClick={() => { setTab('register'); clearMessages(); }}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Status Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              id="auth-error-banner"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              id="auth-success-banner"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. LOGIN FORM */}
        {tab === 'login' && (
          <form id="form-login" onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-['Plus_Jakarta_Sans']">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="login-username-input"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoFocus
                  className="w-full bg-[#080d18] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-colors outline-none font-['Plus_Jakarta_Sans']"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 font-['Plus_Jakarta_Sans']">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="login-password-input"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#080d18] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 transition-colors outline-none font-['Plus_Jakarta_Sans']"
                />
                <button
                  type="button"
                  id="login-toggle-password-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer rounded focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-[0_4px_16px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Polar Grid</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. CREATE ACCOUNT FORM (Shows ONLY: Username, Password, Confirm Password, Show/Hide, Create Account) */}
        {tab === 'register' && (
          <form id="form-register" onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-['Plus_Jakarta_Sans']">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="register-username-input"
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="Choose your username"
                  required
                  autoFocus
                  className="w-full bg-[#080d18] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-colors outline-none font-['Plus_Jakarta_Sans']"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-['Plus_Jakarta_Sans']">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="register-password-input"
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#080d18] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 transition-colors outline-none font-['Plus_Jakarta_Sans']"
                />
                <button
                  type="button"
                  id="register-toggle-password-btn"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                  title={showRegisterPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer rounded focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                >
                  {showRegisterPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-['Plus_Jakarta_Sans']">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="register-confirm-password-input"
                  type={showRegisterConfirmPassword ? 'text' : 'password'}
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#080d18] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 transition-colors outline-none font-['Plus_Jakarta_Sans']"
                />
                <button
                  type="button"
                  id="register-toggle-confirm-password-btn"
                  onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                  aria-label={showRegisterConfirmPassword ? 'Hide password' : 'Show password'}
                  title={showRegisterConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer rounded focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                >
                  {showRegisterConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              id="register-submit-button"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-[0_4px_16px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
