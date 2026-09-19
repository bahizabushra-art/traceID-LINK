import React, { useState } from 'react';
import { useRecon } from '../../context/ReconContext';
import { formatBDT } from '../../data/mockData';
import { 
  Search, 
  CreditCard, 
  Truck, 
  Split, 
  Gift, 
  Filter, 
  Copy, 
  Check, 
  Scale,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  PieChart as PieIcon
} from 'lucide-react';

export const OrdersStream: React.FC = () => {
  const { 
    table1Prepaid, 
    table2COD, 
    table3Split, 
    table4Free,
    isBankVarianceToggled,
    setIsBankVarianceToggled,
    mfsTotal,
    codTotal,
    bankDepositLine,
    varianceAmount,
    setActivePage
  } = useRecon();

  const [activeTab, setActiveTab] = useState<'ALL' | 'PREPAID' | 'COD' | 'SPLIT' | 'FREE'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const handleCopy = (text: string, tagId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(tagId);
    setTimeout(() => setCopiedTag(null), 1800);
  };

  const matchesSearch = (val: string) => {
    if (!searchTerm) return true;
    return val.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const filteredTable1 = table1Prepaid.filter(
    o => matchesSearch(o.orderId) || matchesSearch(o.traceId) || matchesSearch(o.merchantInvoiceNumber) || matchesSearch(o.gateway)
  );

  const filteredTable2 = table2COD.filter(
    o => matchesSearch(o.orderId) || matchesSearch(o.traceId) || matchesSearch(o.barcodeShippingTag) || matchesSearch(o.courierPartner)
  );

  const filteredTable3 = table3Split.filter(
    o => matchesSearch(o.orderId) || matchesSearch(o.twinTraceId) || matchesSearch(o.courierBookingRef)
  );

  const filteredTable4 = table4Free.filter(
    o => matchesSearch(o.orderId) || matchesSearch(o.traceId) || matchesSearch(o.marketingExpenseLedgerEntry)
  );

  return (
    <div className="space-y-6 font-sans">
      {/* FORMULA SUMMARY BAR AT TOP */}
      <div className="bg-[#121212] border-2 border-[#FACC15] rounded-2xl p-5 shadow-xl shadow-black">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FACC15] text-[#050505]">
                MATHEMATICAL RECONCILIATION EQUATION
              </span>
              <span className="text-xs font-mono text-[#A1A1AA]">
                Formula Verification Formula
              </span>
            </div>
            {/* Formula Expression */}
            <div className="text-sm sm:text-base font-mono font-bold text-[#FFFFFF] tracking-tight">
              [ &Sigma; MFS Net + &Sigma; Courier COD Net = Bank Consolidated Deposit Line ]
            </div>
            {/* Concrete Settlement Values */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm">
              <span className="text-[#FACC15] font-bold">
                {formatBDT(mfsTotal)} <span className="text-zinc-400 font-normal">(MFS Net)</span>
              </span>
              <span className="text-[#FFFFFF]">+</span>
              <span className="text-[#FACC15] font-bold">
                {formatBDT(codTotal)} <span className="text-zinc-400 font-normal">(Courier COD Net)</span>
              </span>
              <span className="text-[#FFFFFF]">=</span>
              <span className={`font-bold ${isBankVarianceToggled ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                {formatBDT(bankDepositLine)} <span className="text-zinc-400 font-normal">(Bank Credit)</span>
              </span>
            </div>
          </div>

          {/* Status Badge & Toggle Switch */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto shrink-0">
            {isBankVarianceToggled ? (
              <div className="px-3.5 py-2 rounded-xl bg-[#EF4444]/15 border border-[#EF4444] text-[#EF4444] font-mono text-xs font-bold flex items-center gap-2 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
                <span>Under-Settled Variance (- BDT 10,000)</span>
              </div>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-[#22C55E]/15 border border-[#22C55E] text-[#22C55E] font-mono text-xs font-bold flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>100% Balanced Ledger</span>
              </div>
            )}

            <button
              id="formula-toggle-variance-btn"
              onClick={() => setIsBankVarianceToggled(prev => !prev)}
              className="px-3 py-2 rounded-xl bg-[#050505] hover:bg-zinc-900 border border-[#27272A] hover:border-[#FACC15] text-xs font-mono text-[#FFFFFF] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Toggle variance simulation to test gap detection"
            >
              <Scale className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>{isBankVarianceToggled ? 'Reset to Balanced' : 'Simulate -10k Gap'}</span>
            </button>

            <button
              id="orders-stream-view-metrics-btn"
              onClick={() => setActivePage('metrics')}
              className="px-3 py-2 rounded-xl bg-[#121E36] hover:bg-[#1A2C4F] border border-[#233B6B] hover:border-cyan-400 text-xs font-mono text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Open Settlement Success Performance Metrics (Dynamic Pie Charts)"
            >
              <PieIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Performance Metrics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Subheader & Search Bar */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#FACC15]" />
              <h2 className="text-base font-bold text-[#FFFFFF] font-mono uppercase tracking-wide">
                Track A: Inbound Order Stream
              </h2>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1 font-medium">
              Real-Time Inbound Stream Across 4 Payment Combinations: 100% Pre-Paid, 100% COD, Dual-Pulse Split & Subsidized Delivery
            </p>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="orders-stream-search-input"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search Order ID, TraceID, Barcode..."
              className="w-full bg-[#050505] border border-[#27272A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#FFFFFF] placeholder-zinc-600 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#A1A1AA] hover:text-white"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Filter */}
        <div className="mt-4 flex items-center gap-2 pt-4 border-t border-[#27272A] overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-xs font-mono text-[#A1A1AA] flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#FACC15]" /> Scheme:
          </span>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-mono transition-all shrink-0 cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#FACC15] text-[#050505] font-bold shadow-md shadow-[#FACC15]/10'
                : 'bg-[#050505] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A]'
            }`}
          >
            All 4 Tables ({table1Prepaid.length + table2COD.length + table3Split.length + table4Free.length})
          </button>

          <button
            onClick={() => setActiveTab('PREPAID')}
            className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'PREPAID'
                ? 'bg-[#FACC15] text-[#050505] font-bold shadow-md shadow-[#FACC15]/10'
                : 'bg-[#050505] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Table 1: Pre-Paid ({table1Prepaid.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('COD')}
            className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'COD'
                ? 'bg-[#FACC15] text-[#050505] font-bold shadow-md shadow-[#FACC15]/10'
                : 'bg-[#050505] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Table 2: COD ({table2COD.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SPLIT')}
            className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'SPLIT'
                ? 'bg-[#FACC15] text-[#050505] font-bold shadow-md shadow-[#FACC15]/10'
                : 'bg-[#050505] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A]'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Table 3: Split ({table3Split.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('FREE')}
            className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'FREE'
                ? 'bg-[#FACC15] text-[#050505] font-bold shadow-md shadow-[#FACC15]/10'
                : 'bg-[#050505] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A]'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Table 4: Free Delivery ({table4Free.length})</span>
          </button>
        </div>
      </div>

      {/* TABLE 1: Full Pre-Payment (100% MFS via bKash/Nagad/Rocket/Upay + BDT 0 COD) */}
      {(activeTab === 'ALL' || activeTab === 'PREPAID') && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
              <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
                Table 1: Full Pre-Payment (100% MFS via bKash/Nagad/Rocket + BDT 0 COD)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#A1A1AA]">
              Logic: 100% settled via digital gateway checkout payload
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">TraceID</th>
                  <th className="py-3 px-4 font-semibold">Gateway</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount (BDT)</th>
                  <th className="py-3 px-4 font-semibold">Injected API Parameter (merchantInvoiceNumber)</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {filteredTable1.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-[#A1A1AA]">
                      No matching pre-payment orders found.
                    </td>
                  </tr>
                ) : (
                  filteredTable1.map(row => (
                    <tr key={row.orderId} className="hover:bg-[#050505] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#FFFFFF]">{row.orderId}</td>
                      <td className="py-3 px-4 text-[#A1A1AA]">{row.timestamp}</td>
                      <td className="py-3 px-4">
                        <span className="bg-[#050505] text-[#FACC15] px-2 py-0.5 rounded border border-[#27272A] font-bold">
                          {row.traceId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                          row.gateway === 'bKash' ? 'bg-pink-950/40 text-pink-400 border-pink-800' :
                          row.gateway === 'Nagad' ? 'bg-amber-950/40 text-amber-400 border-amber-800' :
                          'bg-purple-950/40 text-purple-400 border-purple-800'
                        }`}>
                          {row.gateway}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#FFFFFF]">
                        {formatBDT(row.amount)}
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        <span className="bg-[#050505] px-2 py-0.5 rounded border border-[#27272A] text-[11px] text-[#A1A1AA]">
                          invoice: {row.merchantInvoiceNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40">
                          <CheckCircle2 className="w-3 h-3" />
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 2: Full Cash on Delivery (100% COD via Pathao/RedX/Steadfast/Paperfly) */}
      {(activeTab === 'ALL' || activeTab === 'COD') && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#FACC15]" />
              <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
                Table 2: Full Cash on Delivery (100% COD via 3PL Courier)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#A1A1AA]">
              Logic: Doorstep cash collection via logistics remittance
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">TraceID</th>
                  <th className="py-3 px-4 font-semibold">Courier Partner</th>
                  <th className="py-3 px-4 font-semibold text-right">Collectable Amount (BDT)</th>
                  <th className="py-3 px-4 font-semibold">Barcode Shipping Tag</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {filteredTable2.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-[#A1A1AA]">
                      No matching COD orders found.
                    </td>
                  </tr>
                ) : (
                  filteredTable2.map(row => (
                    <tr key={row.orderId} className="hover:bg-[#050505] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#FFFFFF]">{row.orderId}</td>
                      <td className="py-3 px-4 text-[#A1A1AA]">{row.timestamp}</td>
                      <td className="py-3 px-4">
                        <span className="bg-[#050505] text-[#FACC15] px-2 py-0.5 rounded border border-[#27272A] font-bold">
                          {row.traceId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded border text-[11px] bg-zinc-900 text-zinc-200 border-zinc-700">
                          {row.courierPartner}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#FFFFFF]">
                        {formatBDT(row.collectableAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleCopy(row.barcodeShippingTag, row.orderId)}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#050505] hover:bg-zinc-800 text-zinc-300 border border-[#27272A] text-[11px] cursor-pointer"
                        >
                          <span>{row.barcodeShippingTag}</span>
                          {copiedTag === row.orderId ? (
                            <Check className="w-3 h-3 text-[#22C55E]" />
                          ) : (
                            <Copy className="w-3 h-3 text-[#A1A1AA]" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/40">
                          <span>🟡</span>
                          Pending Delivery
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 3: Split-Payment (Advance Delivery Fee via MFS + Remaining COD Balance via Courier) */}
      {(activeTab === 'ALL' || activeTab === 'SPLIT') && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#06B6D4]" />
              <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
                Table 3: Split-Payment (Advance Delivery Fee via MFS + Remaining COD Balance via Courier)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#A1A1AA]">
              Logic: Dual-pulse cross-match tying MFS TrxID + Courier Consignment to Twin-TraceID
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Twin-TraceID</th>
                  <th className="py-3 px-4 font-semibold text-right">Advance MFS Paid</th>
                  <th className="py-3 px-4 font-semibold text-right">Unpaid COD Balance</th>
                  <th className="py-3 px-4 font-semibold">Courier Booking Ref</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {filteredTable3.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#A1A1AA]">
                      No matching split-payment orders found.
                    </td>
                  </tr>
                ) : (
                  filteredTable3.map(row => (
                    <tr key={row.orderId} className="hover:bg-[#050505] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#FFFFFF]">{row.orderId}</td>
                      <td className="py-3 px-4">
                        <span className="bg-[#050505] text-[#06B6D4] px-2 py-0.5 rounded border border-cyan-800 font-bold">
                          {row.twinTraceId}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#22C55E]">
                        {formatBDT(row.advanceMfsPaid)}
                        <span className="block text-[10px] text-[#A1A1AA] font-normal">{row.gateway}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#FACC15]">
                        {formatBDT(row.unpaidCodBalance)}
                        <span className="block text-[10px] text-[#A1A1AA] font-normal">{row.courierPartner}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        <span className="bg-[#050505] px-2 py-0.5 rounded border border-[#27272A] text-[11px]">
                          {row.courierBookingRef}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40">
                          <span>🔵</span>
                          Dual-Pulse Injected
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 4: Free Delivery / No Delivery Charge (Delivery Fee BDT 0, Product Price via MFS or COD) */}
      {(activeTab === 'ALL' || activeTab === 'FREE') && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
              <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
                Table 4: Free Delivery / No Delivery Charge (Delivery Fee BDT 0)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#A1A1AA]">
              Logic: Delivery fee absorbed into internal marketing ledger
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">TraceID</th>
                  <th className="py-3 px-4 font-semibold text-center">Delivery Charge</th>
                  <th className="py-3 px-4 font-semibold">Marketing Expense Ledger Entry</th>
                  <th className="py-3 px-4 font-semibold text-right">Cash to Collect</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {filteredTable4.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#A1A1AA]">
                      No matching free delivery orders found.
                    </td>
                  </tr>
                ) : (
                  filteredTable4.map(row => (
                    <tr key={row.orderId} className="hover:bg-[#050505] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#FFFFFF]">{row.orderId}</td>
                      <td className="py-3 px-4">
                        <span className="bg-[#050505] text-[#FACC15] px-2 py-0.5 rounded border border-[#27272A] font-bold">
                          {row.traceId}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-[#22C55E]">
                        BDT 0 (Waived)
                      </td>
                      <td className="py-3 px-4 text-[#A1A1AA]">
                        <span className="bg-[#050505] px-2 py-0.5 rounded border border-[#27272A] text-[11px] text-zinc-300">
                          {row.marketingExpenseLedgerEntry}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#FFFFFF]">
                        {formatBDT(row.cashToCollect)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40">
                          <span>🟢</span>
                          Promo Verified
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
