import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecon } from '../context/ReconContext';
import { 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  CheckCircle2,
  Eye, 
  EyeOff, 
  AlertCircle,
  FileCheck2,
  Building2
} from 'lucide-react';
import { ForgotPassword } from './ForgotPassword';

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
  const [selectedTrack, setSelectedTrack] = useState<'track-a' | 'track-b'>('track-b');
  const [authStep, setAuthStep] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [formValidationWarning, setFormValidationWarning] = useState<string | null>(null);

  useEffect(() => {
    if (isRecoveryMode) {
      setAuthMode('recovery');
      setInfoMessage('Recovery link verified. Please enter your new password.');
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

  // Direct access to try reconciliation with user's own data
  const handleTryReconciliation = async () => {
    setAuthStep('Opening reconciliation tool...');
    await loginAsGuest('Guest Merchant');
    setCurrentTrack('track-b');
    setActivePage('audit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setInfoMessage(null);
    setFormValidationWarning(null);

    if (authMode === 'forgot') {
      setAuthStep('Sending password reset email...');
      const res = await sendPasswordResetEmail(email);
      if (res.success) {
        setInfoMessage(res.message || 'Password reset link sent to your email.');
        setAuthStep(null);
      } else {
        setAuthStep(null);
      }
      return;
    }

    if (authMode === 'recovery') {
      if (password !== confirmPassword) {
        setFormValidationWarning('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setFormValidationWarning('New password must be at least 6 characters.');
        return;
      }
      setAuthStep('Updating password...');
      const res = await updatePasswordWithRecovery(password, email);
      if (res.success) {
        setInfoMessage(res.message || 'Password successfully updated.');
        setAuthStep('Redirecting...');
        setTimeout(() => {
          setCurrentTrack(selectedTrack);
          setActivePage('orders');
        }, 800);
      } else {
        setAuthStep(null);
      }
      return;
    }

    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        setFormValidationWarning('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setFormValidationWarning('Password must be at least 6 characters.');
        return;
      }
      setAuthStep('Creating account...');
      const res = await signup(email, password, merchantName);
      if (res.success) {
        if (res.message) {
          setInfoMessage(res.message);
        }
        setAuthStep('Account created. Entering workspace...');
        setTimeout(() => {
          setCurrentTrack(selectedTrack);
          setActivePage('orders');
        }, 800);
      } else {
        setAuthStep(null);
      }
      return;
    }

    // Sign in
    setAuthStep('Signing in...');
    const res = await login(email, password);
    if (res.success) {
      setAuthStep('Entering workspace...');
      setTimeout(() => {
        setCurrentTrack(selectedTrack);
        setActivePage('orders');
      }, 400);
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
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-between items-center p-4 sm:p-8 relative overflow-hidden font-sans">
      {/* Top Header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-zinc-800 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="font-semibold text-white tracking-wide">TRACEID LINK</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400">Financial Reconciliation Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTryReconciliation}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-medium cursor-pointer transition-colors"
          >
            <span>Try Reconciliation with Your Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md my-auto py-8 relative z-10">
        
        {/* Try Reconciliation Link Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-[#0F0F12] border border-amber-400/40 shadow-lg shadow-black/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Try Reconciliation
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Upload your statements and test matching directly
              </p>
            </div>
          </div>
          <button
            type="button"
            id="try-reconciliation-link-btn"
            onClick={handleTryReconciliation}
            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <span>Open Tool</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Authentication Card */}
        <div className="bg-[#0F0F12] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/50">
          
          {/* Card Header & Switch Tabs */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {authMode === 'signup' ? 'Create Merchant Account' : authMode === 'recovery' ? 'Set New Password' : 'Sign In'}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                {authMode === 'signup' 
                  ? 'Register your company for automated reconciliation' 
                  : authMode === 'recovery' 
                  ? 'Enter your new credentials to restore access' 
                  : 'Enter your credentials to access your ledgers'}
              </p>
            </div>

            {authMode !== 'recovery' && (
              <div className="flex items-center bg-black border border-zinc-800 rounded-lg p-1 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signin')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-amber-400 text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signup')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-amber-400 text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Feedback & Error Alerts */}
          {authMode !== 'forgot' && (authError || formValidationWarning) && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-xs text-rose-200 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-snug">{formValidationWarning || authError}</div>
              </div>
              {authMode === 'signin' && (
                <div className="pt-2 border-t border-rose-800/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-rose-300">Forgot your password?</span>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot')}
                    className="px-2 py-0.5 rounded bg-amber-400 text-black font-bold hover:bg-amber-300 cursor-pointer"
                  >
                    Reset Password
                  </button>
                </div>
              )}
            </div>
          )}

          {authMode !== 'forgot' && infoMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{infoMessage}</div>
            </div>
          )}

          {/* Forgot Password View */}
          {authMode === 'forgot' ? (
            <ForgotPassword
              compact
              initialEmail={email || 'bahizabushra@gmail.com'}
              onBackToSignIn={() => handleSwitchMode('signin')}
              onNavigateToRecovery={() => handleSwitchMode('recovery')}
            />
          ) : (
            /* Auth Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* RECOVERY VIEW */}
              {authMode === 'recovery' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      New Password (minimum 6 characters)
                    </label>
                    <div className="relative">
                      <input
                        id="recovery-new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••••••"
                        className="w-full pl-3 pr-10 py-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="recovery-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </>
              )}

              {/* SIGN IN & SIGN UP */}
              {(authMode === 'signin' || authMode === 'signup') && (
                <>
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Company / Merchant Name
                      </label>
                      <input
                        id="signup-merchant-org"
                        type="text"
                        value={merchantName}
                        onChange={(e) => setMerchantName(e.target.value)}
                        required
                        placeholder="e.g. Dhaka Retail Ltd"
                        className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Business Email
                    </label>
                    <input
                      id="auth-merchant-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@company.com"
                      className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-zinc-300">
                        Password
                      </label>
                      {authMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => handleSwitchMode('forgot')}
                          className="text-xs text-amber-400 hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="auth-merchant-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••••••"
                        className="w-full pl-3 pr-10 py-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Confirm Password
                      </label>
                      <input
                        id="signup-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Status Message */}
              {(isAuthLoading || authStep) && (
                <div className="p-3 rounded-xl bg-black border border-amber-400/50 text-xs text-amber-400 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>{authStep || 'Processing...'}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="login-access-btn"
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-400/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {authMode === 'signin' && (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
                {authMode === 'signup' && (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
                {authMode === 'recovery' && (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Sample Account Access */}
          {authMode !== 'forgot' && (
            <div className="mt-6 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
              <span className="block mb-2 text-zinc-500 font-medium">Sample Accounts:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('bahizabushra@gmail.com', 'SecureMerchant@2026', 'track-a', 'Enterprise Hub')}
                  className="px-3 py-2 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-medium cursor-pointer text-left transition-colors"
                >
                  <div className="font-semibold">Track A</div>
                  <div className="text-[10px] text-zinc-400">Enterprise</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('sme.finance@merchant.bd', 'DhakaFintech@2026', 'track-b', 'Merchant Store')}
                  className="px-3 py-2 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-800 text-cyan-400 text-xs font-medium cursor-pointer text-left transition-colors"
                >
                  <div className="font-semibold">Track B</div>
                  <div className="text-[10px] text-zinc-400">Merchant</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
        <div>TraceID Link &bull; Financial Settlement Reconciliation</div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleTryReconciliation}
            className="text-amber-400 hover:underline cursor-pointer"
          >
            Try Reconciliation Tool
          </button>
          <span>&bull;</span>
          <span>Security &amp; Encryption</span>
        </div>
      </footer>
    </div>
  );
};
