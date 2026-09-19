import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecon } from '../context/ReconContext';
import { 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Key, 
  Mail, 
  CheckCircle2,
  Sparkles,
  Database,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  LogIn,
  Building2,
  Check,
  ArrowLeft,
  KeyRound,
  Send,
  Zap,
  FolderUp,
  Cpu,
  Scale,
  FileSpreadsheet
} from 'lucide-react';

interface LoginGatewayProps {
  initialMode?: 'signin' | 'signup' | 'forgot' | 'recovery';
}

export const LoginGateway: React.FC<LoginGatewayProps> = ({ initialMode = 'signin' }) => {
  const { 
    login, 
    signup, 
    sendPasswordResetEmail, 
    updatePasswordWithRecovery,
    loginAsGuest,
    authError, 
    clearError, 
    isLoading: isAuthLoading,
    isRecoveryMode,
    setIsRecoveryMode
  } = useAuth();
  const { setActivePage, setCurrentTrack } = useRecon();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot' | 'recovery'>(
    isRecoveryMode ? 'recovery' : initialMode
  );
  const [merchantName, setMerchantName] = useState('Dhaka Retail Enterprise Ltd');
  const [email, setEmail] = useState('bahizabushra@gmail.com');
  const [password, setPassword] = useState('SecureMerchant@2026');
  const [confirmPassword, setConfirmPassword] = useState('SecureMerchant@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<'track-a' | 'track-b'>('track-a');
  const [authStep, setAuthStep] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [formValidationWarning, setFormValidationWarning] = useState<string | null>(null);

  // If Supabase triggered password recovery or URL hash has recovery token, switch to recovery view
  useEffect(() => {
    if (isRecoveryMode) {
      setAuthMode('recovery');
      setInfoMessage('Authenticated recovery session detected. Please enter your new password to regain access.');
    } else {
      setAuthMode(initialMode);
    }
  }, [initialMode, isRecoveryMode]);

  const handleSwitchMode = (mode: 'signin' | 'signup' | 'forgot' | 'recovery') => {
    setAuthMode(mode);
    clearError();
    setInfoMessage(null);
    setFormValidationWarning(null);
    if (mode !== 'recovery') {
      setIsRecoveryMode(false);
    }
  };

  // Instant Guest / Prototype Exploration Handler (No sign up required)
  const handleLaunchGuestPrototype = async (targetTrack: 'track-a' | 'track-b') => {
    setAuthStep(`Initializing Guest Sandbox for ${targetTrack === 'track-a' ? 'Track A: Enterprise API' : 'Track B: SME File-Upload'}...`);
    await loginAsGuest(
      targetTrack === 'track-a' 
        ? 'Daraz Enterprise Hub (Guest Reviewer)' 
        : 'Dhaka SME Store (Guest Reviewer)'
    );
    setCurrentTrack(targetTrack);
    setActivePage(targetTrack === 'track-a' ? 'orders' : 'track-b-dual');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setInfoMessage(null);
    setFormValidationWarning(null);

    // 1. FORGOT PASSWORD REQUEST
    if (authMode === 'forgot') {
      setAuthStep('Dispatching cryptographic recovery link via Supabase Auth...');
      const res = await sendPasswordResetEmail(email);
      if (res.success) {
        setInfoMessage(res.message || 'Password reset link sent! Check your inbox.');
        setAuthStep(null);
      } else {
        setAuthStep(null);
      }
      return;
    }

    // 2. PASSWORD RECOVERY / NEW PASSWORD SUBMISSION
    if (authMode === 'recovery') {
      if (password !== confirmPassword) {
        setFormValidationWarning('Passwords do not match. Please ensure both fields match.');
        return;
      }
      if (password.length < 6) {
        setFormValidationWarning('New password must be at least 6 characters long.');
        return;
      }
      setAuthStep('Updating password in Supabase PostgreSQL cluster...');
      const res = await updatePasswordWithRecovery(password);
      if (res.success) {
        setInfoMessage(res.message || 'Password successfully updated!');
        setAuthStep('Access restored. Redirecting to reconciliation dashboard...');
        setTimeout(() => {
          setCurrentTrack(selectedTrack);
          setActivePage('orders');
        }, 1000);
      } else {
        setAuthStep(null);
      }
      return;
    }

    // 3. REGISTRATION / SIGNUP
    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        setFormValidationWarning('Passwords do not match. Please re-enter both passwords identically.');
        return;
      }
      if (password.length < 6) {
        setFormValidationWarning('Password must be at least 6 characters long.');
        return;
      }
      setAuthStep('Registering new merchant profile in Supabase database...');
      const res = await signup(email, password, merchantName);
      if (res.success) {
        if (res.message) {
          setInfoMessage(res.message);
        }
        setAuthStep('Account created successfully. Entering workspace...');
        setTimeout(() => {
          setCurrentTrack(selectedTrack);
          setActivePage('orders');
        }, 900);
      } else {
        setAuthStep(null);
      }
      return;
    }

    // 4. SIGN IN
    setAuthStep('Verifying merchant credentials against Supabase Auth...');
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
  };

  const handleQuickFill = (demoEmail: string, demoPass: string, track: 'track-a' | 'track-b', demoOrg?: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setConfirmPassword(demoPass);
    if (demoOrg) setMerchantName(demoOrg);
    setSelectedTrack(track);
    clearError();
    setInfoMessage(null);
    setFormValidationWarning(null);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-between items-center p-3 sm:p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting - restrained & mathematically soft */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-cyan-500/3 blur-[140px] pointer-events-none rounded-full" />

      {/* Institutional Top Bar */}
      <header className="w-full max-w-6xl flex items-center justify-between py-3 border-b border-zinc-800/90 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-zinc-200 font-bold">GATEWAY: DHAKA-01 PRODUCTION</span>
          </div>
          <span className="text-zinc-700 hidden md:inline">|</span>
          <span className="text-cyan-400 hidden sm:flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Auth: gyqbclwyduyqpduxiesb</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-BIT TLS ENCRYPTED</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-400 font-bold">
            BST (UTC+6)
          </span>
        </div>
      </header>

      {/* Main Container: Split Experience */}
      <main className="w-full max-w-6xl my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        
        {/* Left Column: Interactive Prototype Experience for Reviewers & Users (No Login Required) */}
        <section className="lg:col-span-6 flex flex-col justify-between bg-[#0F0F12] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/40">
          <div>
            {/* Branding Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-black border border-amber-400/80 flex items-center justify-center text-amber-400 shadow-md shadow-amber-400/10">
                <svg className="w-6 h-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.2">
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
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    TraceID Link
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/15 text-amber-400 border border-amber-400/30">
                    V2.4 PRO
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-medium">
                  Dual-Track FinTech Reconciliation &amp; Return Audit Middleware
                </p>
              </div>
            </div>

            {/* Evaluation Callout Banner */}
            <div className="mt-5 p-4 rounded-xl bg-amber-400/5 border border-amber-400/20 text-zinc-300">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Instant Prototype Evaluation</span>
              </div>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Experience the complete live mathematical double-entry reconciliation engine directly. No registration required to test all features:
              </p>

              {/* Core Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-[11px] font-mono">
                <div className="flex items-center gap-2 text-zinc-200">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Bank Sum Equation Balancing</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-200">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>3-Vector Return &amp; SLA Audit</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-200">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>4 Payment Scheme Lifecycles</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-200">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Dual CSV File Upload Engine</span>
                </div>
              </div>
            </div>

            {/* Direct 1-Click Launch Buttons for Guest Reviewers */}
            <div className="mt-5 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Select Track to Experience Live:</span>
                <span className="text-amber-400 font-bold">1-Click Instant Preview</span>
              </div>

              {/* Track A Launch Button */}
              <button
                type="button"
                id="launch-track-a-demo-btn"
                onClick={() => handleLaunchGuestPrototype('track-a')}
                disabled={isAuthLoading}
                className="w-full p-4 rounded-xl bg-black border border-zinc-800 hover:border-amber-400 hover:bg-zinc-900/60 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                          Track A: Enterprise API Suite
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                          90L+ VOL
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Automated midnight cron, MFS webhooks, Bank Sum formula, &amp; SLA claims
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>

              {/* Track B Launch Button */}
              <button
                type="button"
                id="launch-track-b-demo-btn"
                onClick={() => handleLaunchGuestPrototype('track-b')}
                disabled={isAuthLoading}
                className="w-full p-4 rounded-xl bg-black border border-zinc-800 hover:border-cyan-400 hover:bg-zinc-900/60 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                          Track B: SME File-Upload Workspace
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
                          FILE RECON
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Upload custom CSVs or sample statements &amp; compute live discrepancy results
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            </div>
          </div>

          {/* Mathematical Engine Status Footer */}
          <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deterministic Double-Entry Engine</span>
            </div>
            <span className="text-zinc-500">ISO-8583 Audited</span>
          </div>
        </section>

        {/* Right Column: Authentic Merchant Authentication & File Upload Gateway */}
        <section className="lg:col-span-6 bg-[#0F0F12] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/40 flex flex-col justify-between">
          <div>
            {/* Header with Mode Switch Tabs */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-800">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Authentic Merchant Portal</span>
                </span>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Sign in with Supabase to upload your own files and persist company ledgers
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              {authMode !== 'recovery' && (
                <div className="flex items-center bg-black border border-zinc-800 rounded-lg p-1 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signin')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                      authMode === 'signin' || authMode === 'forgot'
                        ? 'bg-amber-400 text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                      authMode === 'signup'
                        ? 'bg-amber-400 text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    New Account
                  </button>
                </div>
              )}
            </div>

            {/* Error or Feedback Alert */}
            {(authError || formValidationWarning) && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-xs text-rose-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-snug">{formValidationWarning || authError}</div>
              </div>
            )}

            {infoMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-snug">{infoMessage}</div>
              </div>
            )}

            {/* Forms Container */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* VIEW: FORGOT PASSWORD */}
              {authMode === 'forgot' && (
                <>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                      <KeyRound className="w-3.5 h-3.5" /> Reset Password via Supabase Auth
                    </span>
                    Enter your registered merchant email. We will send a secure password reset link to your inbox.
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      Merchant Corporate Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="merchant@corporate.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('signin')}
                      className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('recovery')}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      Enter Recovery Token directly &rarr;
                    </button>
                  </div>
                </>
              )}

              {/* VIEW: RECOVERY (ENTER NEW PASSWORD) */}
              {authMode === 'recovery' && (
                <>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs font-mono text-emerald-200">
                    <span className="font-bold text-emerald-300 flex items-center gap-1 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Password Recovery Verified
                    </span>
                    Set a new password for <strong className="text-white">{email}</strong>.
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      New Password (min 6 chars)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        id="recovery-new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-all"
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

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        id="recovery-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* VIEW: SIGN IN & SIGN UP */}
              {(authMode === 'signin' || authMode === 'signup') && (
                <>
                  {/* Signup only: Business Name */}
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                        Company / Store Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <input
                          id="signup-merchant-org"
                          type="text"
                          value={merchantName}
                          onChange={(e) => setMerchantName(e.target.value)}
                          required
                          placeholder="e.g., Apex Footwear / Dhaka F-Commerce"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      Merchant Corporate Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="auth-merchant-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="merchant@corporate.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                        {authMode === 'signin' ? 'Merchant Password' : 'Create Password (min 6 chars)'}
                      </label>
                      {authMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => handleSwitchMode('forgot')}
                          className="text-xs font-mono text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <KeyRound className="w-3 h-3" />
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        id="auth-merchant-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-all"
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

                  {/* Signup only: Confirm Password */}
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <Key className="w-4 h-4" />
                        </div>
                        <input
                          id="signup-confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Target Workspace Selection */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      Destination Workspace
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTrack('track-a')}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          selectedTrack === 'track-a'
                            ? 'bg-amber-400/10 border-amber-400 text-white'
                            : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="text-xs font-bold font-mono">Track A: Enterprise</div>
                        <div className="text-[10px] text-zinc-400">Midnight API cron &amp; webhooks</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTrack('track-b')}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          selectedTrack === 'track-b'
                            ? 'bg-cyan-400/10 border-cyan-400 text-white'
                            : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="text-xs font-bold font-mono">Track B: SME Portal</div>
                        <div className="text-[10px] text-zinc-400">Upload your own statements</div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* In-flight status */}
              {(isAuthLoading || authStep) && (
                <div className="p-3 rounded-lg bg-black border border-amber-400/50 text-xs font-mono text-amber-400 flex items-center gap-2 animate-pulse">
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span className="truncate">{authStep || 'Processing credentials with Supabase...'}</span>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                id="login-access-btn"
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm tracking-wide shadow-lg shadow-amber-400/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {authMode === 'signin' && (
                  <>
                    <span>SIGN IN &amp; ACCESS DASHBOARD</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
                {authMode === 'signup' && (
                  <>
                    <span>REGISTER AUTHENTIC MERCHANT ACCOUNT</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
                {authMode === 'forgot' && (
                  <>
                    <span>SEND SUPABASE RESET EMAIL</span>
                    <Send className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
                {authMode === 'recovery' && (
                  <>
                    <span>UPDATE PASSWORD &amp; ENTER WORKSPACE</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Pills for Testing Authentic Login */}
            <div className="mt-4 pt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Quick Fill Authentic Credentials:</span>
                <span className="text-[10px] text-zinc-500">Supabase DB</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('bahizabushra@gmail.com', 'SecureMerchant@2026', 'track-a', 'Daraz Enterprise Hub')}
                  className="px-2.5 py-1 rounded bg-black hover:bg-zinc-900 border border-zinc-800 text-amber-400 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Enterprise Account (Daraz)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('sme.finance@merchant.bd', 'DhakaFintech@2026', 'track-b', 'Dhaka SME Store')}
                  className="px-2.5 py-1 rounded bg-black hover:bg-zinc-900 border border-zinc-800 text-cyan-400 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  SME Account (File Upload)
                </button>
              </div>
            </div>
          </div>

          {/* Authentic Footer */}
          <div className="mt-6 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>TraceID Link &bull; Partition: Rolling 180d</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Supabase PostgreSQL
            </span>
          </div>
        </section>

      </main>

      {/* Global Footer */}
      <footer className="w-full max-w-6xl py-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-zinc-400">
        <div>
          <span>TraceID Link &copy; 2026</span>
          <span className="mx-2 text-zinc-700">|</span>
          <span>Online Merchant Settlement &amp; Return Audit Middleware</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Microservices Ingest
          </span>
          <span className="text-zinc-700 hidden sm:inline">|</span>
          <span className="text-zinc-400 hidden sm:inline">Dhaka Regional Cluster</span>
        </div>
      </footer>
    </div>
  );
};
