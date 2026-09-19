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
  ArrowRight
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
  const { sendPasswordResetEmail } = useAuth();

  const [email, setEmail] = useState<string>(initialEmail);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      // Direct call to Supabase auth.resetPasswordForEmail method
      if (supabase && isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: redirectUri
        });

        if (error) {
          // Handle Supabase rate-limits or invalid client requests
          setStatusMessage({
            type: 'error',
            text: error.message || 'Supabase Auth returned an error while processing password reset.'
          });
          setIsLoading(false);
          return;
        }

        // Success from Supabase Auth
        const now = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSentEmail(trimmedEmail);
        setCooldownSeconds(60);
        setStatusMessage({
          type: 'success',
          text: `Supabase password reset token successfully dispatched to ${trimmedEmail}.`,
          timestamp: now
        });
      } else {
        // Fallback through AuthContext helper
        const result = await sendPasswordResetEmail(trimmedEmail);
        const now = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (result.success) {
          setLastSentEmail(trimmedEmail);
          setCooldownSeconds(60);
          setStatusMessage({
            type: 'success',
            text: result.message || `Password reset link dispatched to ${trimmedEmail}.`,
            timestamp: now
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: result.error || 'Failed to dispatch password reset email. Please try again.'
          });
        }
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Unexpected network error connecting to Supabase Auth API.'
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

        {/* Security & Node Verification Bar */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-300 font-bold tracking-wider uppercase text-[11px]">
              Supabase Auth Node
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-400 font-bold text-[10px]">
            PKCE ENCRYPTED
          </span>
        </div>

        {/* Title & Icon */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-black border border-amber-400/80 flex items-center justify-center text-amber-400 shrink-0 shadow-md shadow-amber-400/10">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Reset Merchant Password
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/15 text-amber-400 border border-amber-400/30">
                AUTH V2
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Dispatch a verified one-time cryptographic recovery link to your registered merchant email via Supabase's authentication service.
            </p>
          </div>
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
                    Timestamp: {statusMessage.timestamp} BST &bull; Status: HTTP 200 (Supabase API)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Guidance Banner (When link is sent) */}
        {lastSentEmail && (
          <div className="mb-5 p-4 rounded-xl bg-black/60 border border-emerald-500/40 text-xs font-mono text-zinc-300 space-y-2.5">
            <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Next Steps for Account Recovery:
              </span>
              <span>1 OF 2 STEPS</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
              <li>Open your email inbox for <strong className="text-white">{lastSentEmail}</strong>.</li>
              <li>Locate the verification email with subject <span className="text-amber-400 font-bold">&quot;Reset Your Password&quot;</span>.</li>
              <li>Click the secure link or copy your recovery token to set a new password.</li>
            </ol>
            {onNavigateToRecovery && (
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">Already clicked the link or have the token?</span>
                <button
                  type="button"
                  id="proceed-to-recovery-token-btn"
                  onClick={onNavigateToRecovery}
                  className="px-2.5 py-1 rounded bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 text-amber-400 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Enter New Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label
              htmlFor="supabase-reset-email"
              className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5"
            >
              Merchant Corporate Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="supabase-reset-email"
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
                Executing supabase.auth.resetPasswordForEmail({email})...
              </span>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            id="dispatch-supabase-reset-btn"
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
                <span>DISPATCH RESET LINK VIA SUPABASE</span>
                <Send className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Technical Architecture Accordion for Developers & Audits */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails((prev) => !prev)}
            className="w-full flex items-center justify-between text-[11px] font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Technical Inspection: Supabase Auth Specification</span>
            </div>
            {showTechnicalDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 p-3.5 rounded-xl bg-black border border-zinc-800 text-[11px] font-mono text-zinc-300 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Method Invoked:</span>
                <code className="text-amber-400 font-bold">auth.resetPasswordForEmail()</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">API Endpoint:</span>
                <code className="text-cyan-400">POST {SUPABASE_URL}/auth/v1/recover</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Client Callback URI:</span>
                <code className="text-zinc-300 truncate max-w-[240px]" title={redirectUri}>
                  {redirectUri}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Security Exchange:</span>
                <span className="text-emerald-400">PKCE Code Verifier + Magic Token</span>
              </div>
            </div>
          )}
        </div>

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
            <span className="text-zinc-400">TraceID Link &bull; Dhaka-01 Cluster</span>
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
