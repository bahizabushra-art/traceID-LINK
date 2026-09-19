import React, { useState } from 'react';
import { useRecon } from '../../context/ReconContext';
import { formatBDT } from '../../data/mockData';
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertOctagon, 
  Database, 
  Terminal, 
  Play, 
  Pause, 
  Trash2, 
  Scale, 
  ArrowRight, 
  Copy, 
  Check, 
  Sliders, 
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  FileCode,
  Download,
  FileSpreadsheet,
  Layers,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import { DailyPaymentLiveWidget } from '../DailyPaymentLiveWidget';
import { SixMonthReconBarChart } from '../SixMonthReconBarChart';
import { PerformanceMetricsView } from './PerformanceMetricsView';

export const ExecutiveDashboard: React.FC<{ initialView?: 'overview' | 'metrics' }> = ({ initialView }) => {
  const {
    todayIngestedRevenue,
    isBankVarianceToggled,
    setIsBankVarianceToggled,
    mfsTotal,
    codTotal,
    bankDepositLine,
    varianceAmount,
    webhooks,
    isWebhookStreaming,
    setIsWebhookStreaming,
    clearWebhooks,
    auditRecords,
    activePage,
    setActivePage,
    generateAndDownloadTrackAReconciledCSV
  } = useRecon();

  const [currentView, setCurrentView] = useState<'overview' | 'metrics'>(
    initialView || (activePage === 'metrics' || activePage === 'performance-metrics' ? 'metrics' : 'overview')
  );
  const [filterGateway, setFilterGateway] = useState<string>('ALL');
  const [selectedWebhook, setSelectedWebhook] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const handleDownloadTrackARecon = () => {
    const batch = generateAndDownloadTrackAReconciledCSV();
    setDownloadSuccessToast(`Reconciled output downloaded (${batch.fileName}) and archived!`);
    setTimeout(() => setDownloadSuccessToast(null), 4000);
  };

  // Calculate total anomaly value
  const totalAnomalyValue = auditRecords.reduce((acc, rec) => {
    if (rec.status === 'MATCHED' || rec.resolved) return acc;
    if (typeof rec.dbAmount === 'number' && typeof rec.settledAmount === 'number') {
      return acc + Math.abs(rec.dbAmount - rec.settledAmount);
    }
    if (typeof rec.dbAmount === 'number') return acc + rec.dbAmount;
    if (typeof rec.settledAmount === 'number') return acc + rec.settledAmount;
    return acc;
  }, 0);

  const filteredWebhooks = filterGateway === 'ALL'
    ? webhooks
    : webhooks.filter(w => w.gateway.toLowerCase() === filterGateway.toLowerCase());

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Quick Actions Bar for Track A */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0B1020] border border-[#1F293D]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              TRACK A ENTERPRISE
            </span>
            <span className="text-xs font-bold text-white">Live Ingest & Settlement Hub</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated MFS Webhooks • Bank Sum Equation • 4-Scheme Lifecycle
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="track-a-download-recon-btn"
            onClick={handleDownloadTrackARecon}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md cursor-pointer transition-all min-h-[38px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Track A Reconciled Output (CSV)</span>
          </button>

          <button
            onClick={() => setActivePage('track-a/lifecycle')}
            className="px-3.5 py-2 rounded-lg bg-[#141E36] hover:bg-[#1C2B4E] border border-[#233354] text-cyan-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all min-h-[38px]"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View 4 Payment Schemes Lifecycle</span>
          </button>
        </div>
      </div>

      {downloadSuccessToast && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* View Switcher Tabs: Executive Overview vs Performance Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-xl bg-[#090D1A] border border-[#1F293D]">
        <div className="flex items-center gap-2">
          <button
            id="exec-tab-overview"
            onClick={() => setCurrentView('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
              currentView === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Executive Overview & Ingest Stream</span>
          </button>

          <button
            id="exec-tab-metrics"
            onClick={() => setCurrentView('metrics')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
              currentView === 'metrics'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <PieIcon className="w-4 h-4 text-cyan-300" />
            <span>Performance Metrics (Dynamic Pie Charts)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-sans font-medium">
              NEW
            </span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400 pr-2 hidden sm:block">
          {currentView === 'overview' ? (
            <span>Live Webhook Ingestion & 3-Way Sum Equation</span>
          ) : (
            <span>Monthly Settlement Success Rates (Balanced / Under / Over)</span>
          )}
        </div>
      </div>

      {currentView === 'metrics' ? (
        <PerformanceMetricsView />
      ) : (
        <>
          {/* 1. Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Ingested Revenue */}
        <div className="bg-[#0F172A] border border-[#1F293D] rounded-lg p-4 relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Today's Ingested Revenue</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Synced
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {formatBDT(todayIngestedRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">+14.2%</span> vs yesterday midnight
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Metric 2: Auto-Reconciled Ledger Rate */}
        <div className="bg-[#0F172A] border border-[#1F293D] rounded-lg p-4 relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Auto-Reconciled Ledger Rate</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-cyan-300 border border-blue-800">
              3-Way Match
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              99.4%
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>14,812 / 14,820 tx settled</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Total Anomaly Value Flagged */}
        <div className="bg-[#0F172A] border border-[#1F293D] rounded-lg p-4 relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Anomaly Flagged</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950/80 text-rose-400 border border-rose-800/80">
              Action Required
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-rose-400 tracking-tight">
              {formatBDT(totalAnomalyValue)}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>8 vectors awaiting audit</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Active 6-Month Partition Storage */}
        <div className="bg-[#0F172A] border border-[#1F293D] rounded-lg p-4 relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Active Partition Storage</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
              Replica Active
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              2.5 GB <span className="text-xs text-slate-400 font-normal font-sans">/ 180 Days</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Read-Replica Active (0-Cloud)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Consolidated Bank Sum Check Status Card */}
      <div className="bg-[#0F172A] border border-[#1F293D] rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1F293D]">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Consolidated Bank Sum Check Status Card
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic double-entry audit balancing gateway direct MFS payout deposits against 3PL courier COD lines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Indicator Badge */}
            {isBankVarianceToggled ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-950/80 border border-red-700 text-rose-300 font-mono text-xs font-bold shadow-sm animate-pulse">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Under-Settled Variance (- BDT 10,000)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono text-xs font-bold shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Balanced Ledger</span>
              </div>
            )}

            {/* Toggle Button for Demonstration */}
            <button
              id="dashboard-variance-toggle-btn"
              onClick={() => setIsBankVarianceToggled(prev => !prev)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all flex items-center gap-1.5 border ${
                isBankVarianceToggled
                  ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500'
                  : 'bg-[#182338] text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              {isBankVarianceToggled ? 'Reset to 100% Balanced' : 'Toggle Under-Settled Gap'}
            </button>
          </div>
        </div>

        {/* Mathematical Equation Display State */}
        <div className="mt-5 p-4 rounded-lg bg-[#0a0e18] border border-[#1F293D]">
          <div className="text-[11px] font-mono text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>Mathematical Ledger Formulation</span>
            <span className="text-slate-400">Dhaka Bank Corp Settlement Account #2104-***-8801</span>
          </div>

          {/* Equation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-center font-mono">
            {/* Term 1: Sigma MFS */}
            <div className="md:col-span-3 p-3 rounded bg-[#101726] border border-[#1F293D] text-left">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Term A: Direct Digital MFS</span>
              <div className="text-xs text-pink-400 font-bold mt-0.5">Σ MFS Gateways</div>
              <div className="text-lg font-bold text-white mt-1">
                {formatBDT(mfsTotal)}
              </div>
              <span className="text-[10px] text-slate-400">bKash + Nagad + Rocket API</span>
            </div>

            {/* Operator Plus */}
            <div className="md:col-span-1 flex justify-center text-xl font-bold text-slate-400">
              +
            </div>

            {/* Term 2: Sigma Courier COD */}
            <div className="md:col-span-3 p-3 rounded bg-[#101726] border border-[#1F293D] text-left">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Term B: 3PL Courier COD</span>
              <div className="text-xs text-red-400 font-bold mt-0.5">Σ Courier COD Remit</div>
              <div className="text-lg font-bold text-white mt-1">
                {formatBDT(codTotal)}
              </div>
              <span className="text-[10px] text-slate-400">Pathao + Steadfast + RedX</span>
            </div>

            {/* Operator Equals */}
            <div className="md:col-span-1 flex justify-center text-xl font-bold text-slate-400">
              =
            </div>

            {/* Term 3: Bank Deposit Line */}
            <div className={`md:col-span-4 p-3 rounded text-left border ${
              isBankVarianceToggled 
                ? 'bg-rose-950/40 border-rose-700/80 text-rose-200' 
                : 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-slate-300">Target Statement Line</span>
                {isBankVarianceToggled && (
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-1 rounded border border-rose-800">
                    GAP: -10,000 BDT
                  </span>
                )}
              </div>
              <div className="text-xs font-bold mt-0.5 text-cyan-300">Corporate Bank Deposit Line</div>
              <div className={`text-lg font-bold mt-1 ${isBankVarianceToggled ? 'text-rose-300' : 'text-white'}`}>
                {formatBDT(bankDepositLine)}
              </div>
              <span className="text-[10px] opacity-75">
                {isBankVarianceToggled 
                  ? 'Variance detected: Unsettled courier rider holding or API lag'
                  : 'Equation fully satisfied. Zero unallocated variance.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Terminal Log Panel: Live API Webhook Stream */}
      <div className="bg-[#0F172A] border border-[#1F293D] rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1F293D]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Terminal Log Panel: Live API Webhook Stream
            </h2>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#142036] text-slate-300 border border-[#1F293D]">
              Incoming JSON Payloads: bKash, Nagad, Pathao, Steadfast
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Buttons */}
            <div className="flex items-center p-0.5 rounded bg-[#0a0e18] border border-[#1F293D] text-[10px] sm:text-[11px] font-mono overflow-x-auto max-w-full no-scrollbar">
              {['ALL', 'bKash', 'Nagad', 'Pathao', 'Steadfast'].map(gw => (
                <button
                  key={gw}
                  onClick={() => setFilterGateway(gw)}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    filterGateway === gw
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {gw}
                </button>
              ))}
            </div>

            {/* Stream Play/Pause */}
            <button
              id="toggle-webhook-stream-btn"
              onClick={() => setIsWebhookStreaming(prev => !prev)}
              className={`p-1.5 rounded border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                isWebhookStreaming
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                  : 'bg-amber-950 text-amber-300 border-amber-800 hover:bg-amber-900'
              }`}
              title={isWebhookStreaming ? 'Pause Incoming Stream' : 'Resume Incoming Stream'}
            >
              {isWebhookStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isWebhookStreaming ? 'Live' : 'Paused'}</span>
            </button>

            {/* Clear button */}
            <button
              id="clear-webhooks-btn"
              onClick={clearWebhooks}
              className="p-1.5 rounded bg-[#101726] border border-[#1F293D] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
              title="Clear Terminal View"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="mt-4 rounded-lg bg-[#060911] border border-[#1F293D] font-mono text-xs overflow-hidden">
          {/* Terminal Titlebar */}
          <div className="bg-[#0b101d] px-3 py-1.5 border-b border-[#1F293D] flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="text-slate-400">finrecon-webhook-listener.sock — /api/v1/webhooks/ingest</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-emerald-400">PORT: 3000 (NGINX PROXY)</span>
              <span>{filteredWebhooks.length} events staged</span>
            </div>
          </div>

          {/* Stream Log Lines */}
          <div className="p-3 max-h-96 overflow-y-auto space-y-2.5 custom-scrollbar">
            {filteredWebhooks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-mono text-xs">
                Terminal buffer clear. Awaiting incoming API webhook events...
              </div>
            ) : (
              filteredWebhooks.map(wh => {
                const gatewayColors: Record<string, string> = {
                  bKash: 'text-pink-400 border-pink-800 bg-pink-950/40',
                  Nagad: 'text-amber-400 border-amber-800 bg-amber-950/40',
                  Pathao: 'text-red-400 border-red-800 bg-red-950/40',
                  Steadfast: 'text-blue-400 border-blue-800 bg-blue-950/40'
                };

                return (
                  <div
                    key={wh.id}
                    className="p-2.5 rounded bg-[#0b0f1a] border border-[#1a2336] hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400">{wh.timestamp}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${gatewayColors[wh.gateway] || 'text-slate-300'}`}>
                          {wh.gateway}
                        </span>
                        <span className="text-cyan-400 font-semibold">{wh.eventType}</span>
                        <span className="text-slate-400">TrxID:</span>
                        <span className="text-white font-bold bg-slate-800 px-1 py-0.5 rounded">{wh.trxId}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">
                          {formatBDT(wh.amount)}
                        </span>
                        <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {wh.status}
                        </span>
                        <button
                          onClick={() => setSelectedWebhook(wh)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] hover:bg-slate-700 border border-slate-700"
                        >
                          Payload JSON
                        </button>
                      </div>
                    </div>

                    {/* Quick preview snippet */}
                    <div className="mt-1.5 text-[10px] text-slate-400 truncate font-mono">
                      {JSON.stringify(wh.payload)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Live Daily Payment Scheme Breakdown */}
      <DailyPaymentLiveWidget trackName="Track A Enterprise" />

      {/* 5. 6-Month Visual Order & Payment Details Bar Chart */}
      <SixMonthReconBarChart titlePrefix="Track A Enterprise 6-Month" />
        </>
      )}

      {/* JSON Payload Modal */}
      {selectedWebhook && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0B0F19] border border-[#1F293D] rounded-lg max-w-2xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Inbound Webhook Payload: {selectedWebhook.gateway} ({selectedWebhook.trxId})
                </h3>
              </div>
              <button
                onClick={() => setSelectedWebhook(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                ESC / Close
              </button>
            </div>

            <div className="p-3 rounded bg-[#050811] border border-[#1F293D] text-xs font-mono text-emerald-400 max-h-80 overflow-y-auto custom-scrollbar">
              <pre>{JSON.stringify(selectedWebhook.payload, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-slate-400">
                Timestamp: {selectedWebhook.timestamp} | Status: {selectedWebhook.status}
              </span>
              <button
                onClick={() => handleCopy(JSON.stringify(selectedWebhook.payload, null, 2), selectedWebhook.id)}
                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-500 text-xs font-mono flex items-center gap-1.5"
              >
                {copiedId === selectedWebhook.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === selectedWebhook.id ? 'Copied to Clipboard' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
