import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecon } from '../context/ReconContext';
import { 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Server, 
  Layers, 
  Store, 
  Key, 
  Mail, 
  CheckCircle2,
  Sparkles,
  Cpu,
  Database,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  LogIn
} from 'lucide-react';

export const LoginGateway: React.FC = () => {
  const { login, signup, authError, clearError, isLoading: isAuthLoading, supabaseUrl } = useAuth();
  const { setActivePage, setCurrentTrack } = useRecon();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('bahizabushra@gmail.com');
  const [password, setPassword] = useState('SecureMerchant@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<'track-a' | 'track-b'>('track-a');
  const [authStep, setAuthStep] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setInfoMessage(null);

    setAuthStep(
      authMode === 'signin'
        ? 'Verifying merchant credentials against Supabase Auth...'
        : 'Registering new merchant profile in Supabase database...'
    );

    if (authMode === 'signin') {
      const res = await login(email, password);
      if (res.success) {
        setAuthStep('Access granted. Initializing Dhaka Bank reconciliation ledger...');
        setTimeout(() => {
          setCurrentTrack(selectedTrack);
          setActivePage('orders');
        }, 500);
      } else {
        setAuthStep(null);
      }
    } else {
      const res = await signup(email, password);
      if (res.success) {
        if (res.message) {
          setInfoMessage(res.message);
        }
        setAuthStep('Account confirmed. Entering workspace...');
        setTimeout(() => {
          setCurrentTrack(selectedTrack);
          setActivePage('orders');
        }, 800);
      } else {
        setAuthStep(null);
      }
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string, track: 'track-a' | 'track-b') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setSelectedTrack(track);
    clearError();
    setInfoMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Subtle glowing background aura in Electric Yellow & Carbon */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-yellow-400/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-yellow-500/3 blur-[120px] pointer-events-none rounded-full" />

      {/* Top micro-bar with Supabase Database connectivity status */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2 border-b border-[#27272A]/80 text-xs font-mono text-[#A1A1AA]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>GATEWAY: PRODUCTION CLUSTER (DHAKA-01)</span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="text-cyan-400 hidden sm:flex items-center gap-1">
            <Database className="w-3 h-3" />
            Supabase DB: gyqbclwyduyqpduxiesb
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">256-BIT TLS ENCRYPTED</span>
          <span className="text-[#FACC15]">BST (UTC+6)</span>
        </div>
      </div>

      {/* Main Centered Login Card */}
      <div className="w-full max-w-md my-auto py-6">
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black relative z-10">
          {/* Cryptographic Linked Nodes Branding Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#050505] border-2 border-[#FACC15] shadow-lg shadow-[#FACC15]/20 mb-3 text-[#FACC15] group">
              <svg 
                className="w-7 h-7 stroke-current" 
                viewBox="0 0 24 24" 
                fill="none" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Cryptographic Linked Nodes */}
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="18" r="3" />
                <line x1="9" y1="6" x2="15" y2="6" strokeDasharray="2 2" />
                <line x1="6" y1="9" x2="6" y2="15" />
                <line x1="18" y1="9" x2="18" y2="15" />
                <line x1="9" y1="18" x2="15" y2="18" strokeDasharray="2 2" />
                <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFFFFF] tracking-tight">
              TraceID Link
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1 font-medium">
              Intelligent FinTech Reconciliation Middleware
            </p>

            {/* Auth Mode Toggle: Sign In vs Sign Up */}
            <div className="mt-4 p-1 bg-[#050505] border border-[#27272A] rounded-xl flex items-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  clearError();
                  setInfoMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-[#FACC15] text-[#050505] shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  clearError();
                  setInfoMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-[#FACC15] text-[#050505] shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Merchant</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-700/80 text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{authError}</div>
            </div>
          )}

          {/* Success / Info Message */}
          {infoMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-xs text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{infoMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input 1: Merchant Email */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                Merchant Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-merchant-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="merchant@corporate.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#050505] border border-[#27272A] rounded-lg text-sm text-[#FFFFFF] font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition-all"
                />
              </div>
            </div>

            {/* Input 2: Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                  Merchant Password
                </label>
                <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Supabase Encrypted
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="login-merchant-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#050505] border border-[#27272A] rounded-lg text-sm text-[#FFFFFF] font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Operational Suite Mode Quick-Select */}
            <div className="pt-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-2">
                Operational Suite Mode
              </label>
              <div className="grid grid-cols-1 gap-2">
                {/* Track A Option */}
                <label 
                  className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedTrack === 'track-a'
                      ? 'bg-[#050505] border-[#FACC15] shadow-sm shadow-[#FACC15]/10'
                      : 'bg-[#050505]/60 border-[#27272A] hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="suite-track"
                    checked={selectedTrack === 'track-a'}
                    onChange={() => setSelectedTrack('track-a')}
                    className="mt-1 accent-[#FACC15]"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#FFFFFF]">Track A: Enterprise API Suite</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/40">
                        CRON
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                      Automated midnight MFS cron ingestion & shadow read-replica cross-matching
                    </p>
                  </div>
                </label>

                {/* Track B Option */}
                <label 
                  className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedTrack === 'track-b'
                      ? 'bg-[#050505] border-[#FACC15] shadow-sm shadow-[#FACC15]/10'
                      : 'bg-[#050505]/60 border-[#27272A] hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="suite-track"
                    checked={selectedTrack === 'track-b'}
                    onChange={() => setSelectedTrack('track-b')}
                    className="mt-1 accent-[#FACC15]"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#FFFFFF]">Track B: SME & F-Commerce Portal</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        MANUAL
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                      Passive IMAP email scraping & simultaneous dual-file (MFS + Courier) upload
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Authenticating Progress Indicator */}
            {(isAuthLoading || authStep) && (
              <div className="p-3 rounded-lg bg-[#050505] border border-[#FACC15]/60 text-xs font-mono text-[#FACC15] flex items-center gap-2.5 animate-pulse">
                <div className="w-3.5 h-3.5 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
                <span className="truncate">{authStep || 'Authenticating with Supabase...'}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              id="login-access-btn"
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-bold text-sm tracking-wide shadow-lg shadow-[#FACC15]/20 hover:shadow-[#FACC15]/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer font-sans disabled:opacity-50"
            >
              <span>{authMode === 'signin' ? 'LOGIN & ACCESS DASHBOARD' : 'REGISTER & ACCESS DASHBOARD'}</span>
              <ArrowRight className="w-4 h-4 text-[#050505] stroke-[2.5]" />
            </button>
          </form>

          {/* Security & Database Status Footer */}
          <div className="mt-5 pt-3.5 border-t border-[#27272A] flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              <span>Supabase Auth Protected</span>
            </div>
            <span className="text-zinc-600">•</span>
            <span>Rolling 180d Ledger</span>
          </div>
        </div>

        {/* Quick Demo Helpers for Instant Access */}
        <div className="mt-4 p-3 rounded-xl bg-[#121212]/70 border border-[#27272A] text-xs font-mono text-[#A1A1AA] space-y-1.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
            <span className="font-bold">Merchant Demo Credentials:</span>
          </div>
          <div className="flex items-center justify-center gap-3 pt-0.5">
            <button
              type="button"
              onClick={() => handleQuickFill('bahizabushra@gmail.com', 'SecureMerchant@2026', 'track-a')}
              className="text-[#FACC15] hover:underline cursor-pointer"
            >
              bahizabushra@gmail.com (Track A)
            </button>
            <span className="text-zinc-700">|</span>
            <button
              type="button"
              onClick={() => handleQuickFill('sme.finance@merchant.bd', 'DhakaFintech@2026', 'track-b')}
              className="text-[#FACC15] hover:underline cursor-pointer"
            >
              sme.finance@merchant.bd (Track B)
            </button>
          </div>
        </div>
      </div>

      {/* Global Bottom Bar */}
      <footer className="w-full max-w-5xl py-3 border-t border-[#27272A]/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#A1A1AA]">
        <div>
          <span>TraceID Link &copy; 2026</span>
          <span className="mx-2 text-zinc-700">|</span>
          <span>FinTech Middleware for bKash, Nagad, Pathao & Steadfast</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#22C55E] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Supabase DB Linked
          </span>
          <span className="text-zinc-700">|</span>
          <span>Partition: Rolling 180d</span>
        </div>
      </footer>
    </div>
  );
};
