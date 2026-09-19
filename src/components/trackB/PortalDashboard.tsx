import React, { useState } from 'react';
import { useRecon } from '../../context/ReconContext';
import { formatBDT } from '../../data/mockData';
import { 
  Store, 
  Inbox, 
  Package, 
  AlertCircle, 
  Wallet, 
  ArrowRight, 
  Send, 
  GitCompare, 
  Barcode, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Download,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { DailyPaymentLiveWidget } from '../DailyPaymentLiveWidget';
import { SixMonthReconBarChart } from '../SixMonthReconBarChart';

export const PortalDashboard: React.FC = () => {
  const { 
    setActivePage, 
    imapEmails, 
    dispatchedParcels, 
    auditRecords,
    generateAndDownloadTrackBReconciledCSV
  } = useRecon();

  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const handleDownloadTrackB = () => {
    const batch = generateAndDownloadTrackBReconciledCSV();
    setDownloadToast(`Track B Reconciled CSV (${batch.fileName}) downloaded and saved to archive!`);
    setTimeout(() => setDownloadToast(null), 4000);
  };

  const unmatchedMfsCount = imapEmails.filter(e => e.status === 'RAW_INGESTED').length;
  const netSettledCash = 845200;

  return (
    <div className="space-y-6">
      {/* Target Demographic Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#101a30] to-[#0f172a] border border-blue-900/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-mono">
                TRACK B: SME & F-COMMERCE RECONCILIATION HUB
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                NO-CODE PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated IMAP SMS parsing • Dual-File Excel Reconciler • Android Barcode Gate-Keeper
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="track-b-download-csv-btn"
            onClick={handleDownloadTrackB}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer transition-all min-h-[38px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Track B Reconciled Output (CSV)</span>
          </button>

          <button
            onClick={() => setActivePage('track-b/lifecycle')}
            className="px-3.5 py-2 rounded-xl bg-[#141E36] hover:bg-[#1C2B4E] border border-[#233354] text-cyan-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all min-h-[38px]"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4-Payment Schemes Lifecycle</span>
          </button>

          <button
            onClick={() => setActivePage('track-b/ingestion')}
            className="px-3 py-2 rounded-xl bg-[#16233b] hover:bg-[#1f3152] text-slate-200 font-mono text-xs font-semibold border border-[#233354] flex items-center gap-1.5 cursor-pointer min-h-[38px]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Hub</span>
          </button>
        </div>
      </div>

      {downloadToast && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Scraped Inbox Invoices */}
        <div className="bg-[#0F172A] border border-[#1F293D] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Scraped Inbox Invoices</span>
            <Inbox className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              1,420 <span className="text-xs font-normal text-slate-400 font-sans">Emails</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
              <span>Auto-parsed via IMAP listener</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Outbound Courier Parcels */}
        <div className="bg-[#0F172A] border border-[#1F293D] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Outbound Courier Parcels</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {dispatchedParcels.length + 842}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dispatched via Pathao/Steadfast</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Unmatched MFS Deposits */}
        <div className="bg-[#0F172A] border border-[#1F293D] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Unmatched MFS Deposits</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
              Needs Link
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
              {unmatchedMfsCount} <span className="text-xs font-normal text-slate-400 font-sans">Pending</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>OTC payments awaiting parcel link</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Net Settled Cash */}
        <div className="bg-[#0F172A] border border-[#1F293D] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Net Settled Cash</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {formatBDT(netSettledCash)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <span>After courier COD fees & delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Feature 1: Passive Ingestion */}
        <div 
          onClick={() => setActivePage('track-b/ingestion')}
          className="p-4 rounded-lg bg-[#0b101e] border border-[#1F293D] hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded bg-blue-900/40 border border-blue-700/50 flex items-center justify-center text-blue-400">
              <Send className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-xs font-bold text-white font-mono mt-3">
            PAGE B2: Passive IMAP Ingestion & Dispatch
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Over-the-counter bKash/Nagad email sniffer auto-isolates TrxIDs and builds printable shipping labels with embedded TraceID barcodes.
          </p>
        </div>

        {/* Feature 2: Simultaneous Dual-File Reconcile */}
        <div 
          onClick={() => setActivePage('track-b/audit')}
          className="p-4 rounded-lg bg-[#0b101e] border border-[#1F293D] hover:border-cyan-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded bg-cyan-900/40 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
              <GitCompare className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-xs font-bold text-white font-mono mt-3">
            PAGE B3: Simultaneous Dual-File Reconciling
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Drop both MFS CSV and Courier settlement CSV side-by-side to detect under-remittances, courier overcharges, and unlinked deposits.
          </p>
        </div>

        {/* Feature 3: Warehouse Gate-Keeper Barcode Scanner */}
        <div 
          onClick={() => setActivePage('track-b/warehouse')}
          className="p-4 rounded-lg bg-[#0b101e] border border-[#1F293D] hover:border-purple-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded bg-purple-900/40 border border-purple-700/50 flex items-center justify-center text-purple-400">
              <Barcode className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-xs font-bold text-white font-mono mt-3">
            PAGE B4: Warehouse Gate-Keeper Scanner
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Simulate physical warehouse barcode scan for returned shipments, instantly resolving Ghost Return Exceptions across your audit books.
          </p>
        </div>
      </div>

      {/* Recent Dispatched Parcels Overview */}
      <div className="bg-[#0F172A] border border-[#1F293D] rounded-lg overflow-hidden">
        <div className="p-4 bg-[#10192e] border-b border-[#1F293D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase">
              Recent Dispatched F-Commerce Parcels (Track B)
            </h3>
          </div>
          <button
            onClick={() => setActivePage('track-b/ingestion')}
            className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>+ New Dispatch</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0b101c] text-slate-400 border-b border-[#1F293D] text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">TraceID / Order ID</th>
                <th className="py-2.5 px-4 font-semibold">Customer</th>
                <th className="py-2.5 px-4 font-semibold">Courier Partner</th>
                <th className="py-2.5 px-4 font-semibold">Payment Scheme</th>
                <th className="py-2.5 px-4 font-semibold">Advance / COD</th>
                <th className="py-2.5 px-4 font-semibold">Barcode Tag</th>
                <th className="py-2.5 px-4 font-semibold">Transit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172238] text-slate-300">
              {dispatchedParcels.map(p => (
                <tr key={p.id} className="hover:bg-[#131d33] transition-colors">
                  <td className="py-2.5 px-4">
                    <span className="font-bold text-white block">{p.traceId}</span>
                    <span className="text-[10px] text-slate-400">{p.orderId}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-slate-200 block font-sans font-medium">{p.customerName}</span>
                    <span className="text-[10px] text-slate-400">{p.customerPhone}</span>
                  </td>
                  <td className="py-2.5 px-4 text-cyan-300">{p.courier}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {p.dispatchType}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold">
                    {p.advancePaidBDT > 0 && (
                      <span className="text-emerald-400 block text-[11px]">
                        Adv: BDT {p.advancePaidBDT.toLocaleString()}
                      </span>
                    )}
                    <span className="text-amber-400 text-[11px]">
                      COD: BDT {p.codCollectionBDT.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <code className="text-[11px] text-slate-300 bg-[#070b14] px-1.5 py-0.5 rounded border border-[#1F293D]">
                      {p.barcodeTag}
                    </code>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      p.status === 'RETURN_RECEIVED_IN_WAREHOUSE'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : p.status === 'RETURN_IN_TRANSIT'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-blue-950 text-blue-300 border-blue-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Daily Payments Intake Widget */}
      <DailyPaymentLiveWidget trackName="Track B SME" />

      {/* 6-Month Visual Order & Payment Details Bar Chart */}
      <SixMonthReconBarChart titlePrefix="Track B SME 6-Month" />
    </div>
  );
};
