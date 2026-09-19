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
  RefreshCw,
  ArrowLeft,
  KeyRound,
  Send
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

      {/* Main Centered Login / Registration / Recovery Card */}
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

            {/* Mode Switcher Bar */}
            {authMode !== 'recovery' && (
              <div className="mt-5 p-1 bg-[#050505] border border-[#27272A] rounded-xl grid grid-cols-2 gap-1">
                <button
                  id="auth-tab-signin"
                  type="button"
                  onClick={() => handleSwitchMode('signin')}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMode === 'signin' || authMode === 'forgot'
                      ? 'bg-[#FACC15] text-[#050505] shadow-md'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>1. Sign In</span>
                </button>

                <button
                  id="auth-tab-signup"
                  type="button"
                  onClick={() => handleSwitchMode('signup')}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                    authMode === 'signup'
                      ? 'bg-[#FACC15] text-[#050505] shadow-md'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>2. New Account</span>
                  <span className={`text-[9px] px-1 rounded uppercase tracking-wider font-extrabold ${
                    authMode === 'signup' ? 'bg-black text-[#FACC15]' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    Sign Up
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Form Header Banner */}
          <div className="mb-4 pb-2 border-b border-[#27272A]/70 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                {authMode === 'forgot' && <KeyRound className="w-3.5 h-3.5 text-[#FACC15]" />}
                {authMode === 'recovery' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                {authMode === 'signin' && 'Sign In to Workspace'}
                {authMode === 'signup' && 'Create Merchant Account'}
                {authMode === 'forgot' && 'Reset Merchant Password'}
                {authMode === 'recovery' && 'Set New Password'}
              </span>
              <p className="text-[11px] text-zinc-400">
                {authMode === 'signin' && 'Access your bKash, Nagad & Courier settlement portal'}
                {authMode === 'signup' && 'Register a new merchant user in Supabase PostgreSQL Auth'}
                {authMode === 'forgot' && 'Dispatch an authenticated Supabase recovery link to your inbox'}
                {authMode === 'recovery' && 'Configure your new password to regain access to the portal'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
                {authMode === 'signin' && 'EXISTING'}
                {authMode === 'signup' && 'NEW USER'}
                {authMode === 'forgot' && 'RECOVERY'}
                {authMode === 'recovery' && 'RESET'}
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {(authError || formValidationWarning) && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-700/80 text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{formValidationWarning || authError}</div>
            </div>
          )}

          {/* Success / Info Message */}
          {infoMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-xs text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{infoMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* VIEW A: FORGOT PASSWORD REQUEST FORM */}
            {authMode === 'forgot' && (
              <>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                    Registered Corporate Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="merchant@corporate.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#050505] border border-[#27272A] rounded-lg text-sm text-[#FFFFFF] font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5 font-mono">
                    Supabase Auth will verify your email and dispatch a secure 256-bit password recovery link.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#091122] border border-[#1E305C] text-xs font-mono text-cyan-200 space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Supabase Email Verification Flow:</span>
                  </div>
                  <p className="text-[11px] text-cyan-200/80">
                    1. Click below to trigger the Supabase Auth verification email.
                    <br />
                    2. Check your inbox for the link with recovery token.
                    <br />
                    3. Clicking the link verifies your identity and prompts you to choose a new password.
                  </p>
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
                    className="text-[#FACC15] hover:underline cursor-pointer"
                  >
                    Enter New Password directly &rarr;
                  </button>
                </div>
              </>
            )}

            {/* VIEW B: SET NEW PASSWORD (RECOVERY MODE) */}
            {authMode === 'recovery' && (
              <>
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs font-mono text-emerald-200">
                  <span className="font-bold text-emerald-300 flex items-center gap-1 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Password Recovery Session
                  </span>
                  Choose a strong, secure password for <strong className="text-white">{email}</strong>.
                </div>

                {/* New Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                      New Merchant Password (min 6 chars)
                    </label>
                    <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Supabase Secured
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      id="recovery-new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Enter new password"
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

                {/* Confirm New Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                      Confirm New Password
                    </label>
                    {confirmPassword && password === confirmPassword && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Passwords match
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      id="recovery-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Confirm new password"
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-[#050505] border rounded-lg text-sm text-[#FFFFFF] font-mono placeholder:text-zinc-600 focus:outline-none transition-all ${
                        confirmPassword && password !== confirmPassword 
                          ? 'border-rose-500 focus:border-rose-500' 
                          : 'border-[#27272A] focus:border-[#FACC15]'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signin')}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot')}
                    className="text-[#FACC15] hover:underline cursor-pointer"
                  >
                    Request new reset link
                  </button>
                </div>
              </>
            )}

            {/* VIEW C: SIGN IN & SIGN UP FORMS */}
            {(authMode === 'signin' || authMode === 'signup') && (
              <>
                {/* Field for New Account: Merchant Business / Organization Name */}
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                      Business / Company Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        id="signup-merchant-org"
                        type="text"
                        value={merchantName}
                        onChange={(e) => setMerchantName(e.target.value)}
                        required
                        placeholder="e.g., Apex Footwear / Dhaka Retail"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#050505] border border-[#27272A] rounded-lg text-sm text-[#FFFFFF] font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Field: Merchant Email */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                    Merchant Corporate Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-merchant-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="merchant@corporate.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#050505] border border-[#27272A] rounded-lg text-sm text-[#FFFFFF] font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition-all"
                    />
                  </div>
                </div>

                {/* Field: Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                      {authMode === 'signin' ? 'Merchant Password' : 'Create Password (min 6 chars)'}
                    </label>

                    {authMode === 'signin' ? (
                      <button
                        id="forgot-password-trigger-btn"
                        type="button"
                        onClick={() => handleSwitchMode('forgot')}
                        className="text-xs font-mono text-[#FACC15] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <KeyRound className="w-3 h-3" />
                        Forgot Password?
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Supabase Encrypted
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
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

                {/* Field for New Account: Confirm Password */}
                {authMode === 'signup' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                        Confirm Password
                      </label>
                      {confirmPassword && password === confirmPassword && (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Passwords match
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
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
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-[#050505] border rounded-lg text-sm text-[#FFFFFF] font-mono placeholder:text-zinc-600 focus:outline-none transition-all ${
                          confirmPassword && password !== confirmPassword 
                            ? 'border-rose-500 focus:border-rose-500' 
                            : 'border-[#27272A] focus:border-[#FACC15]'
                        }`}
                      />
                    </div>
                  </div>
                )}

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
              </>
            )}

            {/* Authenticating Progress Indicator */}
            {(isAuthLoading || authStep) && (
              <div className="p-3 rounded-lg bg-[#050505] border border-[#FACC15]/60 text-xs font-mono text-[#FACC15] flex items-center gap-2.5 animate-pulse">
                <div className="w-3.5 h-3.5 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
                <span className="truncate">{authStep || 'Communicating with Supabase PostgreSQL Auth...'}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              id="login-access-btn"
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-bold text-sm tracking-wide shadow-lg shadow-[#FACC15]/20 hover:shadow-[#FACC15]/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer font-sans disabled:opacity-50"
            >
              {authMode === 'signin' && (
                <>
                  <span>LOGIN & ACCESS DASHBOARD</span>
                  <ArrowRight className="w-4 h-4 text-[#050505] stroke-[2.5]" />
                </>
              )}
              {authMode === 'signup' && (
                <>
                  <span>REGISTER NEW ACCOUNT IN SUPABASE</span>
                  <ArrowRight className="w-4 h-4 text-[#050505] stroke-[2.5]" />
                </>
              )}
              {authMode === 'forgot' && (
                <>
                  <span>SEND SUPABASE RESET EMAIL</span>
                  <Send className="w-4 h-4 text-[#050505] stroke-[2.5]" />
                </>
              )}
              {authMode === 'recovery' && (
                <>
                  <span>UPDATE PASSWORD & UNLOCK WORKSPACE</span>
                  <ArrowRight className="w-4 h-4 text-[#050505] stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Switch Links */}
          <div className="mt-4 pt-3 border-t border-[#27272A] text-center">
            {authMode === 'signin' && (
              <div className="flex flex-col gap-1 text-xs text-zinc-400 font-mono">
                <div>
                  Don't have a merchant account yet?{' '}
                  <button
                    id="switch-to-signup-link"
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className="text-[#FACC15] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    Create New Account here &rarr;
                  </button>
                </div>
              </div>
            )}

            {authMode === 'signup' && (
              <div className="text-xs text-zinc-400 font-mono">
                Already registered with Supabase?{' '}
                <button
                  id="switch-to-signin-link"
                  type="button"
                  onClick={() => handleSwitchMode('signin')}
                  className="text-[#FACC15] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  Sign In to existing account &rarr;
                </button>
              </div>
            )}

            {authMode === 'forgot' && (
              <div className="text-xs text-zinc-400 font-mono">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signin')}
                  className="text-[#FACC15] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  Return to Sign In &rarr;
                </button>
              </div>
            )}

            {authMode === 'recovery' && (
              <div className="text-xs text-zinc-400 font-mono">
                Cancel recovery?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signin')}
                  className="text-zinc-400 hover:text-white hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>

          {/* Security & Database Status Footer */}
          <div className="mt-4 pt-3 border-t border-[#27272A]/80 flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
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
            <span className="font-bold">Merchant Demo Fill:</span>
          </div>
          <div className="flex items-center justify-center gap-3 pt-0.5">
            <button
              type="button"
              onClick={() => handleQuickFill('bahizabushra@gmail.com', 'SecureMerchant@2026', 'track-a', 'Daraz Enterprise Hub')}
              className="text-[#FACC15] hover:underline cursor-pointer"
            >
              bahizabushra@gmail.com (Track A)
            </button>
            <span className="text-zinc-700">|</span>
            <button
              type="button"
              onClick={() => handleQuickFill('sme.finance@merchant.bd', 'DhakaFintech@2026', 'track-b', 'Dhaka SME Store')}
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
          <span>For Online Businesses</span>
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
