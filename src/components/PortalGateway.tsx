import React from 'react';
import { useRecon } from '../context/ReconContext';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  Store,
  FileSpreadsheet,
  QrCode,
  Lock,
  BarChart3,
  TrendingUp,
  Cpu,
  BadgeCheck
} from 'lucide-react';

export const PortalGateway: React.FC = () => {
  const { setCurrentTrack, setActivePage } = useRecon();

  const handleSelectTrack = (track: 'track-a' | 'track-b') => {
    setCurrentTrack(track);
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="border-b border-[#1A2338] bg-[#0A0F1D]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-wide text-white">RECON-CORE BD</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
                PROTOTYPE GATEWAY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Enterprise & SME Dual-Track Settlement Engine • Bangladesh
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10172A] border border-[#1E293B] text-xs font-mono text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>180-Day Fiscal TTL Active</span>
          </div>
        </div>
      </header>

      {/* Main Selection Area */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col justify-center relative z-10 w-full">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> Choose Operational Journey to Begin
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Dual-Track Financial Reconciliation Prototype
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Track A and Track B operate as independent specialized environments. Choose your user journey below to experience targeted settlement flows, live daily payment updates, downloadable outputs, and 6-month historical audits.
          </p>
        </div>

        {/* Track Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* TRACK A: ENTERPRISE CARD */}
          <div
            id="gateway-track-a-card"
            className="group relative rounded-2xl bg-[#0C1222] border-2 border-[#1E293B] hover:border-blue-500/60 p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between"
          >
            <div className="space-y-5">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  TRACK A • ENTERPRISE
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  Enterprise Automated FinOps
                </h2>
                <p className="text-xs font-mono text-cyan-400 mt-0.5">
                  High-Throughput Webhook Stream & Core Bank Ledger
                </p>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                  Tailored for large marketplace volumes (90L+ records). Cross-reconciles automated MFS webhooks (bKash/Nagad), Courier Logistics APIs (Pathao/Steadfast), and Bank Settlement Statements with zero domestic fee leakage.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-[#1E293B]">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <BadgeCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>4 Payment Tables: Full Advance, COD, Split & Free Delivery</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <BadgeCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Mathematical Lifecycle: Pre-Reconciled vs Settled Ledger</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <BadgeCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Live Daily Payment Intake & 6-Month Visual Bar Chart</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <BadgeCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Downloadable Reconciled CSVs & Saved Batch Archive</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              id="enter-track-a-btn"
              onClick={() => handleSelectTrack('track-a')}
              className="mt-8 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer min-h-[46px]"
            >
              <span>Enter Track A: Enterprise Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* TRACK B: SME / F-COMMERCE CARD */}
          <div
            id="gateway-track-b-card"
            className="group relative rounded-2xl bg-[#0C1222] border-2 border-[#1E293B] hover:border-cyan-500/60 p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between"
          >
            <div className="space-y-5">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Store className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  TRACK B • SME PORTAL
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  SME & F-Commerce Hub
                </h2>
                <p className="text-xs font-mono text-cyan-400 mt-0.5">
                  Zero-Code Passive Ingestion & Warehouse Scanner
                </p>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                  Tailored for social commerce stores without dev teams. Passively extracts bKash/Nagad SMS alerts via IMAP, reconciles Excel spreadsheets against courier invoices, and verifies returned parcels with an Android barcode scanner.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-[#1E293B]">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Passive IMAP Email & SMS Transaction Ingestion</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dual-File Reconciliation (Internal vs Courier Excel)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Warehouse PWA Barcode Scanner for Ghost Returns</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Downloadable Output Sheets & Historical Retention</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              id="enter-track-b-btn"
              onClick={() => handleSelectTrack('track-b')}
              className="mt-8 w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/30 cursor-pointer min-h-[46px]"
            >
              <span>Enter Track B: SME Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Informational Guidance Footer Box */}
        <div className="mt-10 rounded-xl bg-[#0A0F1D] border border-[#1F293D] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="font-semibold text-white">Prototype Note: </span>
              Both tracks can be switched at any time via the top navigation bar or sidebar.
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bank-Grade Encryption • Live Simulation Data</span>
          </div>
        </div>
      </main>

      {/* Gateway Footer */}
      <footer className="border-t border-[#1A2338] bg-[#070A12] px-6 py-4 text-center text-xs text-slate-400 font-mono">
        Financial Reconciliation System for Bangladesh E-Commerce & F-Commerce Ecosystem
      </footer>
    </div>
  );
};
