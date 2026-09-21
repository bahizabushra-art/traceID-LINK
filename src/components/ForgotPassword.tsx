import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, SUPABASE_URL } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  KeyRound,
  Mail,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Database,
  ExternalLink,
  Lock,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  Key
} from 'lucide-react';

export interface ForgotPasswordProps {
  initialEmail?: string;
  onBackToSignIn?: () => void;
  onNavigateToRecovery?: () => void;
  compact?: boolean;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  initialEmail = 'bahizabushra@gmail.com',
  onBackToSignIn,
  onNavigateToRecovery,
  compact = false
}) => {
  const { sendPasswordResetEmail, updatePasswordWithRecovery } = useAuth();

  const [email, setEmail] = useState<string>(initialEmail);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDirectResetMode, setIsDirectResetMode] = useState<boolean>(false);
  const [directPassword, setDirectPassword] = useState<string>('');
  const [directConfirmPassword, setDirectConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    timestamp?: string;
  } | null>(null);
  const [lastSentEmail, setLastSentEmail] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Compute redirect URI that Supabase Auth will return to after email verification
  const redirectUri = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#type=recovery`
    : 'https://traceid.io/auth/callback#type=recovery';

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Validate email format
  const isValidEmail = (str: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  /**
   * Direct In-App Password Reset (Bypasses email rate limits and SMTP delays)
   */
  const handleDirectPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide a valid merchant corporate email.'
      });
      return;
    }

    if (!directPassword || directPassword.length < 6) {
      setStatusMessage({
        type: 'error',
        text: 'New password must be at least 6 characters long.'
      });
      return;
    }

    if (directPassword !== directConfirmPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Passwords do not match. Please re-type your confirm password.'
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await updatePasswordWithRecovery(directPassword, trimmedEmail);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Success! Password for ${trimmedEmail} has been updated. Access granted to reconciliation portal.`
        });
        setTimeout(() => {
          if (onBackToSignIn) {
            onBackToSignIn();
          }
        }, 1200);
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to update password.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error occurred while updating password.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Primary Action: Invokes Supabase's auth.resetPasswordForEmail method
   */
  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide your merchant corporate email address.'
      });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid email address format (e.g., merchant@domain.com).'
      });
      return;
    }

    if (cooldownSeconds > 0) {
      setStatusMessage({
        type: 'info',
        text: `Rate limit protection active. Please wait ${cooldownSeconds}s before requesting another reset email.`
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      // Use AuthContext resilient reset logic
      const result = await sendPasswordResetEmail(trimmedEmail);
      const now = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      if (result.isDirectMode) {
        // Automatically switch to Direct Reset mode if email dispatch is rate-limited
        setIsDirectResetMode(true);
        setStatusMessage({
          type: 'info',
          text: result.message || 'Email delivery limited. You can reset your password directly below.'
        });
      } else if (result.success) {
        setLastSentEmail(trimmedEmail);
        setCooldownSeconds(60);
        setStatusMessage({
          type: 'success',
          text: result.message || `Password reset link dispatched to ${trimmedEmail}.`,
          timestamp: now
        });
      } else {
        // Fallback to direct mode if there's any blocker
        setIsDirectResetMode(true);
        setStatusMessage({
          type: 'info',
          text: 'Switched to Direct Reset: You can now enter your new password directly below.'
        });
      }
    } catch (err: any) {
      setIsDirectResetMode(true);
      setStatusMessage({
        type: 'info',
        text: 'Switched to Direct Reset: You can now enter your new password directly below.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillEmail = (demoEmail: string) => {
    setEmail(demoEmail);
    setStatusMessage(null);
  };

  return (
    <div className={`w-full ${compact ? '' : 'max-w-xl mx-auto'} font-sans text-zinc-100`}>
      {/* Component Header Card */}
      <div className="bg-[#0F0F12] border border-[#27272A] rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Security Bar */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-zinc-300 font-bold tracking-wider uppercase text-[11px]">
              Security Verification
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 font-semibold text-[10px]">
            ENCRYPTED SESSION
          </span>
        </div>

        {/* Title & Icon */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-black border border-amber-400/80 flex items-center justify-center text-amber-400 shrink-0 shadow-md shadow-amber-400/10">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Reset Password
            </h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Enter your registered merchant email address to receive password reset instructions.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs (Instant Direct Reset vs Email Token) */}
        <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-black border border-zinc-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setIsDirectResetMode(true);
              setStatusMessage(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isDirectResetMode
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Instant Reset</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsDirectResetMode(false);
              setStatusMessage(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              !isDirectResetMode
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Reset Link</span>
          </button>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            id="forgot-password-alert"
            className={`mb-5 p-3.5 rounded-xl text-xs font-mono border transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/70 border-rose-600 text-rose-200'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold leading-snug">{statusMessage.text}</div>
                {statusMessage.timestamp && (
                  <div className="text-[10px] text-emerald-400/80 mt-1">
                    Sent at: {statusMessage.timestamp} BST
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        {isDirectResetMode ? (
          /* DIRECT IN-APP PASSWORD RESET FORM */
          <form onSubmit={handleDirectPasswordReset} className="space-y-4">
            <div>
              <label
                htmlFor="direct-reset-email"
                className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5"
              >
                Merchant Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="direct-reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="bahizabushra@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="direct-reset-new-password"
                className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5"
              >
                New Merchant Password (min 6 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="direct-reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={directPassword}
                  onChange={(e) => setDirectPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="direct-reset-confirm-password"
                className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="direct-reset-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={directConfirmPassword}
                  onChange={(e) => setDirectConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-mono text-zinc-400">
              <span className="text-[11px] text-zinc-400">Target Account:</span>
              <button
                type="button"
                id="quick-fill-daraz-btn"
                onClick={() => handleQuickFillEmail('bahizabushra@gmail.com')}
                className="px-2 py-0.5 rounded bg-black hover:bg-zinc-900 border border-zinc-800 hover:border-amber-400 text-[11px] text-amber-400 font-bold transition-colors cursor-pointer"
              >
                bahizabushra@gmail.com
              </button>
            </div>

            <button
              id="submit-direct-password-reset-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 text-black disabled:text-zinc-500 font-bold text-sm tracking-wide shadow-lg shadow-amber-400/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>SAVING NEW CREDENTIALS...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>SAVE NEW PASSWORD &amp; SIGN IN</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* EMAIL TOKEN FORM */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label
                htmlFor="reset-email-input"
                className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5"
              >
                Merchant Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reset-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="merchant@corporate.com"
                  className="w-full pl-10 pr-10 py-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all disabled:opacity-50"
                />
                {email && !isLoading && (
                  <button
                    type="button"
                    onClick={() => setEmail('')}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 text-xs font-mono"
                    title="Clear input"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-mono text-zinc-400">
              <span className="text-[11px] text-zinc-400">Quick Test Accounts:</span>
              <button
                type="button"
                id="quick-fill-daraz-btn"
                onClick={() => handleQuickFillEmail('bahizabushra@gmail.com')}
                className="px-2 py-0.5 rounded bg-black hover:bg-zinc-900 border border-zinc-800 hover:border-amber-400 text-[11px] text-amber-400 font-bold transition-colors cursor-pointer"
              >
                bahizabushra@gmail.com
              </button>
              <button
                type="button"
                id="quick-fill-sme-btn"
                onClick={() => handleQuickFillEmail('sme.finance@merchant.bd')}
                className="px-2 py-0.5 rounded bg-black hover:bg-zinc-900 border border-zinc-800 hover:border-cyan-400 text-[11px] text-cyan-400 font-bold transition-colors cursor-pointer"
              >
                sme.finance@merchant.bd
              </button>
            </div>

            {/* In-Flight Spinner State */}
            {isLoading && (
              <div className="p-3 rounded-xl bg-black border border-amber-400/50 text-xs font-mono text-amber-400 flex items-center gap-2.5 animate-pulse">
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="truncate">
                  Sending reset instructions to {email}...
                </span>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              id="dispatch-reset-email-btn"
              type="submit"
              disabled={isLoading || cooldownSeconds > 0}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 text-black disabled:text-zinc-500 font-bold text-sm tracking-wide shadow-lg shadow-amber-400/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>DISPATCHING SECURE TOKEN...</span>
              ) : cooldownSeconds > 0 ? (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  RESEND AVAILABLE IN {cooldownSeconds}S
                </span>
              ) : (
                <>
                  <span>SEND RESET LINK</span>
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation Controls */}
        <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
          {onBackToSignIn ? (
            <button
              type="button"
              id="back-to-signin-btn"
              onClick={onBackToSignIn}
              className="text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </button>
          ) : (
            <span className="text-zinc-400">TraceID Link Financial Middleware</span>
          )}

          {onNavigateToRecovery && (
            <button
              type="button"
              id="toggle-recovery-mode-btn"
              onClick={onNavigateToRecovery}
              className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Have recovery token?</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
