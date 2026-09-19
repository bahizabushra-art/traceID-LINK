import React, { useState } from 'react';
import { useRecon } from '../context/ReconContext';
import { PaymentSchemeRecord, PaymentSchemeType } from '../types';
import {
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileSpreadsheet,
  Filter,
  HelpCircle,
  Layers,
  Percent,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';

export const PaymentSchemeLifecycle: React.FC<{ trackContext: 'Track A Enterprise' | 'Track B SME' }> = ({
  trackContext
}) => {
  const {
    paymentSchemeRecords,
    reconcileSchemeRecords,
    downloadSchemeLifecycleCSV,
    generateAndDownloadTrackAReconciledCSV,
    generateAndDownloadTrackBReconciledCSV,
    reportBatches
  } = useRecon();

  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'before' | 'after'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reconciling, setReconciling] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter by track and active filters
  const trackRecords = paymentSchemeRecords.filter(r => r.track === trackContext);

  const filteredRecords = trackRecords.filter(r => {
    const matchScheme = selectedSchemeFilter === 'ALL' || r.schemeType === selectedSchemeFilter;
    const matchTab =
      activeTab === 'all'
        ? true
        : activeTab === 'before'
        ? r.status === 'PRE_RECONCILED_PENDING'
        : r.status === 'RECONCILED_SETTLED';
    const matchQuery =
      searchQuery === '' ||
      r.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerPhone.includes(searchQuery);

    return matchScheme && matchTab && matchQuery;
  });

  const pendingRecords = trackRecords.filter(r => r.status === 'PRE_RECONCILED_PENDING');
  const settledRecords = trackRecords.filter(r => r.status === 'RECONCILED_SETTLED');

  // Interactive Reconcile & Transfer Handler
  const handleReconcileBatch = () => {
    if (pendingRecords.length === 0) {
      setSuccessToast('All records in this track are already reconciled and transferred!');
      setTimeout(() => setSuccessToast(null), 3500);
      return;
    }

    setReconciling(true);
    setTimeout(() => {
      const { count, settledSum } = reconcileSchemeRecords(undefined, trackContext);
      setReconciling(false);
      setSuccessToast(
        `SUCCESS: ${count} pending orders reconciled & transferred to Settled Ledger! BDT ${settledSum.toLocaleString()} verified with bank checksums.`
      );
      setTimeout(() => setSuccessToast(null), 5000);
    }, 1200);
  };

  // Direct CSV Export & Save
  const handleDownloadAndSave = () => {
    downloadSchemeLifecycleCSV(trackContext);
    if (trackContext === 'Track A Enterprise') {
      generateAndDownloadTrackAReconciledCSV();
    } else {
      generateAndDownloadTrackBReconciledCSV();
    }
    setSuccessToast(`Reconciled output sheet downloaded & saved into Previous Reconciled Archive!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0D1426] border border-[#1E293B] rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
              {trackContext.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400 font-mono">• 4-Payment Scheme Matrix</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Payment Scheme Lifecycle & Reconciled Settlement
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Mathematical breakdown of <strong className="text-emerald-400">Full Advance</strong>,{' '}
            <strong className="text-blue-400">Split Payment</strong>,{' '}
            <strong className="text-amber-400">Full COD</strong>, and{' '}
            <strong className="text-indigo-400">Free Delivery</strong>. Review pre-reconciliation expected net payouts, then transfer verified rows into the settled ledger.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="scheme-reconcile-transfer-btn"
            onClick={handleReconcileBatch}
            disabled={reconciling || pendingRecords.length === 0}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 transition-all min-h-[42px]"
          >
            {reconciling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditing & Transferring...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Reconcile Pending ({pendingRecords.length}) & Transfer</span>
              </>
            )}
          </button>

          <button
            id="scheme-download-csv-btn"
            onClick={handleDownloadAndSave}
            className="px-4 py-2.5 rounded-xl bg-[#131C33] hover:bg-[#1C294A] border border-[#233354] text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer min-h-[42px]"
          >
            <Download className="w-4 h-4" />
            <span>Download Reconciled Output (CSV)</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs sm:text-sm text-emerald-200 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="flex-1 font-medium">{successToast}</span>
        </div>
      )}

      {/* 4 Schemes Mathematical Logic Reference Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scheme 1 */}
        <div className="rounded-xl bg-[#0B1020] border border-emerald-500/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">1. Full Advance</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              100% Prepaid
            </span>
          </div>
          <div className="text-xs font-mono text-slate-200 bg-[#060913] p-2.5 rounded-lg border border-[#1A2338] space-y-1">
            <div className="text-emerald-300 font-semibold">Formula:</div>
            <div className="text-slate-300 text-[11px]">Net = Gross - MFS Fee - Courier Fee</div>
            <div className="text-[10px] text-slate-400">COD Collectable at Door: ৳0</div>
          </div>
          <p className="text-[11px] text-slate-400">
            Customer pays 100% via bKash/Nagad. MFS deducts ~1.5% gateway charge; courier receives ৳0 COD.
          </p>
        </div>

        {/* Scheme 2 */}
        <div className="rounded-xl bg-[#0B1020] border border-blue-500/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400">2. Split Payment</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              Advance + COD
            </span>
          </div>
          <div className="text-xs font-mono text-slate-200 bg-[#060913] p-2.5 rounded-lg border border-[#1A2338] space-y-1">
            <div className="text-blue-300 font-semibold">Formula:</div>
            <div className="text-slate-300 text-[11px]">Net = (Adv - MFS) + (COD - Delivery - 1% COD Fee)</div>
            <div className="text-[10px] text-slate-400">MFS Advance guarantees commitment</div>
          </div>
          <p className="text-[11px] text-slate-400">
            Delivery charge collected upfront via MFS; order remainder collected upon delivery by courier.
          </p>
        </div>

        {/* Scheme 3 */}
        <div className="rounded-xl bg-[#0B1020] border border-amber-500/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">3. Full COD</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              100% Doorstep
            </span>
          </div>
          <div className="text-xs font-mono text-slate-200 bg-[#060913] p-2.5 rounded-lg border border-[#1A2338] space-y-1">
            <div className="text-amber-300 font-semibold">Formula:</div>
            <div className="text-slate-300 text-[11px]">Net = COD - Delivery Fee - 1% COD Fee</div>
            <div className="text-[10px] text-slate-400">Advance MFS: ৳0</div>
          </div>
          <p className="text-[11px] text-slate-400">
            Zero prepayment. Full invoice collected by Pathao/Steadfast, subject to standard 1% COD handling fee.
          </p>
        </div>

        {/* Scheme 4 */}
        <div className="rounded-xl bg-[#0B1020] border border-indigo-500/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400">4. Free Delivery</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              Merchant Absorbed
            </span>
          </div>
          <div className="text-xs font-mono text-slate-200 bg-[#060913] p-2.5 rounded-lg border border-[#1A2338] space-y-1">
            <div className="text-indigo-300 font-semibold">Formula:</div>
            <div className="text-slate-300 text-[11px]">Net = Paid - MFS Fee - Absorbed Courier (৳100)</div>
            <div className="text-[10px] text-slate-400">Customer Delivery: ৳0</div>
          </div>
          <p className="text-[11px] text-slate-400">
            Promotional shipping campaign. Platform subsidizes ৳100 courier cost from promotional marketing ledger.
          </p>
        </div>
      </div>

      {/* Stage Counter & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#090D18] p-1 rounded-xl border border-[#1E293B] w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Schemes ({trackRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('before')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'before'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Before Reconciled ({pendingRecords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('after')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'after'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>After Reconciliation ({settledRecords.length})</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSchemeFilter}
            onChange={(e) => setSelectedSchemeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#090D18] border border-[#1E293B] text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All 4 Payment Schemes</option>
            <option value="FULL_ADVANCE">Full Advance</option>
            <option value="SPLIT_PAYMENT">Split Payment</option>
            <option value="FULL_COD">Full COD</option>
            <option value="FREE_DELIVERY">Free Delivery</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search Order / Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#090D18] border border-[#1E293B] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Main Table: Responsive with horizontal scrolling for mobile */}
      <div className="rounded-2xl bg-[#0D1426] border border-[#1E293B] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#090D18] border-b border-[#1E293B] text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-3.5 px-4">Order ID & Customer</th>
                <th className="py-3.5 px-3">Payment Scheme</th>
                <th className="py-3.5 px-3 text-right">Gross Price</th>
                <th className="py-3.5 px-3 text-right">Advance (MFS)</th>
                <th className="py-3.5 px-3 text-right">COD Doorstep</th>
                <th className="py-3.5 px-3 text-right">Fees (MFS + Courier)</th>
                <th className="py-3.5 px-3 text-right">Net Payout (BDT)</th>
                <th className="py-3.5 px-3 text-center">Lifecycle Status</th>
                <th className="py-3.5 px-4">Settlement Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2338] text-slate-200">
              {filteredRecords.map((r) => {
                const isSettled = r.status === 'RECONCILED_SETTLED';
                const totalDeductions = r.mfsGatewayFee + r.courierDeliveryFee + r.courierCodFee;

                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-[#111A30] transition-colors ${
                      isSettled ? 'bg-[#0A1224]/50' : 'bg-[#0D1426]'
                    }`}
                  >
                    {/* Order ID & Customer */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white flex items-center gap-1.5">
                        <span>{r.orderId}</span>
                        {r.dispatchedBarcode && (
                          <span className="text-[9px] px-1 rounded bg-[#1A2338] text-slate-400">
                            {r.dispatchedBarcode}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {r.customerName} • {r.customerPhone}
                      </div>
                    </td>

                    {/* Payment Scheme Type */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          r.schemeType === 'FULL_ADVANCE'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : r.schemeType === 'SPLIT_PAYMENT'
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            : r.schemeType === 'FULL_COD'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                        }`}
                      >
                        {r.schemeLabel}
                      </span>
                    </td>

                    {/* Gross */}
                    <td className="py-3 px-3 text-right font-mono font-semibold text-white">
                      ৳{r.grossAmount.toLocaleString()}
                    </td>

                    {/* Advance Paid */}
                    <td className="py-3 px-3 text-right font-mono">
                      {r.advancePaid > 0 ? (
                        <span className="text-emerald-400 font-medium">৳{r.advancePaid.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-600">৳0</span>
                      )}
                    </td>

                    {/* COD Collectable */}
                    <td className="py-3 px-3 text-right font-mono">
                      {r.codCollectable > 0 ? (
                        <span className="text-amber-300 font-medium">৳{r.codCollectable.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-600">৳0</span>
                      )}
                    </td>

                    {/* Deductions Breakdown */}
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-400">
                      <div>-৳{totalDeductions}</div>
                      <div className="text-[10px] text-slate-500">
                        (MFS: ৳{r.mfsGatewayFee}, Del: ৳{r.courierDeliveryFee}
                        {r.courierCodFee > 0 ? `, COD: ৳${r.courierCodFee}` : ''})
                      </div>
                      {r.marketingAbsorbedSubsidy > 0 && (
                        <div className="text-[10px] text-indigo-400">
                          +৳{r.marketingAbsorbedSubsidy} promo absorbed
                        </div>
                      )}
                    </td>

                    {/* Net Expected / Settled */}
                    <td className="py-3 px-3 text-right font-mono">
                      <div className={`font-bold ${isSettled ? 'text-emerald-400 text-sm' : 'text-cyan-300'}`}>
                        ৳{r.expectedNetPayout.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isSettled ? 'Settled to Bank' : 'Expected Payout'}
                      </div>
                    </td>

                    {/* Lifecycle Status: Before vs After Reconciled */}
                    <td className="py-3 px-3 text-center">
                      {isSettled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-medium font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>AFTER: SETTLED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-medium font-mono">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>BEFORE: PENDING</span>
                        </span>
                      )}
                    </td>

                    {/* Settlement Verification & Audit Note */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {isSettled ? (
                        <div className="space-y-0.5">
                          <div className="text-emerald-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>{r.settlementChecksum || 'SHA256-VERIFIED'}</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Ref: {r.bankStatementRef || 'BANK-MATCH'} • {r.reconciliationTimestamp}
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-400">
                          Pending cross-match against Bank clearing log. Click "Reconcile Pending" to settle.
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm">No payment records matching the selected filter.</p>
          </div>
        )}
      </div>

      {/* Reconciled Reports History Drawer / Summary */}
      <div className="rounded-2xl bg-[#090D18] border border-[#1E293B] p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A2338] pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Saved Previous Reconciled Sheets ({reportBatches.length} Archive Batches)
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Full downloadable audit history with details & tamper-evident signatures
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportBatches.slice(0, 3).map((batch) => (
            <div
              key={batch.batchId}
              className="p-3 rounded-xl bg-[#0D1426] border border-[#1A2338] space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">{batch.batchId}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {batch.matchedRate}% Matched
                  </span>
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  BDT {batch.netSettledSumBDT.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {batch.totalRows} Orders • Processed: {batch.dateProcessed}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1A2338] flex items-center justify-between">
                <span className="text-[10px] text-slate-400 truncate max-w-[170px]">{batch.fileName}</span>
                <button
                  onClick={() => downloadSchemeLifecycleCSV(trackContext)}
                  className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 text-[10px] font-mono font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
