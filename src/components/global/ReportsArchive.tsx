import React, { useState } from 'react';
import { useRecon } from '../../context/ReconContext';
import { formatBDT } from '../../data/mockData';
import { 
  Archive, 
  Search, 
  Download, 
  Calendar, 
  Filter, 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CreditCard,
  Truck,
  Split,
  Gift,
  Package,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsArchive: React.FC = () => {
  const { 
    currentTrack, 
    table1Prepaid, 
    table2COD, 
    table3Split, 
    table4Free, 
    returnParcels 
  } = useRecon();

  const [activeTableTab, setActiveTableTab] = useState<'T1' | 'T2' | 'T3' | 'T4' | 'T5'>('T1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateStart, setDateStart] = useState<string>('2026-09-01');
  const [dateEnd, setDateEnd] = useState<string>('2026-09-08');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Table 1: Full Pre-Payment Reconciled Output (100% MFS)
  const t1Data = [
    { traceId: 'TR-PRE-2026-X89', orderAmount: 3200, mfsReceived: 3200, mfsCommission: 48, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-PRE-2026-X90', orderAmount: 5400, mfsReceived: 5400, mfsCommission: 81, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-PRE-2026-X91', orderAmount: 1850, mfsReceived: 1800, mfsCommission: 27, status: 'UNMATCHED' as const, varianceGap: -50 },
    { traceId: 'TR-PRE-2026-X92', orderAmount: 4100, mfsReceived: 4100, mfsCommission: 61.5, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-PRE-2026-X93', orderAmount: 2600, mfsReceived: 0, mfsCommission: 0, status: 'NOT_FOUND' as const, varianceGap: -2600 },
    { traceId: 'TR-PRE-2026-X94', orderAmount: 1250, mfsReceived: 1250, mfsCommission: 18.75, status: 'MATCHED' as const, varianceGap: 0 }
  ];

  // Table 2: Full COD Reconciled Output (100% Courier COD)
  const t2Data = [
    { traceId: 'TR-COD-2026-C12', orderAmount: 2100, courierCollected: 2100, deliveryFeeDeducted: 80, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-COD-2026-C13', orderAmount: 3800, courierCollected: 3800, deliveryFeeDeducted: 120, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-COD-2026-C14', orderAmount: 4500, courierCollected: 4350, deliveryFeeDeducted: 130, status: 'UNMATCHED' as const, varianceGap: -150 },
    { traceId: 'TR-COD-2026-C15', orderAmount: 1600, courierCollected: 1600, deliveryFeeDeducted: 70, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-COD-2026-C16', orderAmount: 2900, courierCollected: 0, deliveryFeeDeducted: 0, status: 'NOT_FOUND' as const, varianceGap: -2900 }
  ];

  // Table 3: Split Payment Reconciled Output (Advance MFS + Courier COD Balance)
  const t3Data = [
    { twinTraceId: 'TR-SPLIT-2026-S44', advExpected: 150, advReceived: 150, codExpected: 2500, codReceived: 2500, courierCharges: 110, status: 'MATCHED' as const, varianceGap: 0 },
    { twinTraceId: 'TR-SPLIT-2026-S45', advExpected: 200, advReceived: 200, codExpected: 3400, codReceived: 3400, courierCharges: 130, status: 'MATCHED' as const, varianceGap: 0 },
    { twinTraceId: 'TR-SPLIT-2026-S46', advExpected: 150, advReceived: 150, codExpected: 1800, codReceived: 1700, courierCharges: 90, status: 'UNMATCHED' as const, varianceGap: -100 },
    { twinTraceId: 'TR-SPLIT-2026-S47', advExpected: 200, advReceived: 0, codExpected: 4200, codReceived: 4200, courierCharges: 140, status: 'NOT_FOUND' as const, varianceGap: -200 }
  ];

  // Table 4: Free Delivery / No Delivery Charge Reconciled Output
  const t4Data = [
    { traceId: 'TR-FREE-2026-F09', productPrice: 4200, advancePaid: 4200, deliveryCharge: 0, internalExpenseEntry: 'EXP-MKTG-DH-09', status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-FREE-2026-F10', productPrice: 2800, advancePaid: 0, deliveryCharge: 0, internalExpenseEntry: 'EXP-MKTG-DH-10', status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-FREE-2026-F11', productPrice: 3500, advancePaid: 3500, deliveryCharge: 80, internalExpenseEntry: 'UNAUTHORIZED_COURIER_CHARGE', status: 'UNMATCHED' as const, varianceGap: -80 }
  ];

  // Table 5: Returned Products & Reverse Logistics Reconciled Output (Dynamically synced with returnParcels state!)
  const t5Data = returnParcels.map(p => {
    let auditBadge = 'VERIFIED_RETURNED';
    let impactBDT = 0;

    if (p.scannedAtWarehouse) {
      auditBadge = 'VERIFIED_RETURNED';
      impactBDT = 0;
    } else if (p.vector3GhostException) {
      auditBadge = 'GHOST_RETURN_EXCEPTION';
      impactBDT = -p.returnFeeBDT;
    } else if (p.vector2RetentionGap) {
      auditBadge = 'COURIER_RETENTION_LOST';
      impactBDT = -(p.parcelValueBDT + p.returnFeeBDT);
    } else if (p.vector1Status === 'LOGISTICS_RETURN_VARIANCE_ERROR' || p.vector1OverchargeVarianceBDT > 0) {
      auditBadge = 'RETURN_FEE_OVERCHARGE';
      impactBDT = -p.vector1OverchargeVarianceBDT;
    } else {
      auditBadge = 'RETURN_IN_TRANSIT';
      impactBDT = 0;
    }

    return {
      traceId: p.traceId,
      orderId: p.orderId,
      courierReturnedStatus: p.courierReportedStatus,
      returnFeeCharged: p.returnFeeBDT,
      warehouseShopScanStatus: p.scannedAtWarehouse ? 'SCANNED_OK' : 'PENDING_PHYSICAL_INTAKE',
      auditStatusBadge: auditBadge,
      financialImpactBDT: impactBDT,
      scannedAtWarehouse: p.scannedAtWarehouse
    };
  });

  // Filter Helper
  const filterBySearch = (val: string) => {
    if (!searchQuery) return true;
    return val.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Export 5-Table Batch Handler
  const handleDownloadBatch = () => {
    const trackLabel = currentTrack === 'track-a' ? 'TrackA_Enterprise' : 'TrackB_SME';
    const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
    const baseName = `TraceID_${trackLabel}`;

    const files = [
      { name: `${baseName}_Table1_FullPrepaid_${dateStart}_to_${dateEnd}_${timeStr}.csv`, content: 'TraceID,OrderAmount,MFSReceived,MFSCommission,Status,VarianceGap\n' + t1Data.map(r => `${r.traceId},${r.orderAmount},${r.mfsReceived},${r.mfsCommission},${r.status},${r.varianceGap}`).join('\n') },
      { name: `${baseName}_Table2_FullCOD_${dateStart}_to_${dateEnd}_${timeStr}.csv`, content: 'TraceID,OrderAmount,CourierCollected,DeliveryFee,Status,VarianceGap\n' + t2Data.map(r => `${r.traceId},${r.orderAmount},${r.courierCollected},${r.deliveryFeeDeducted},${r.status},${r.varianceGap}`).join('\n') },
      { name: `${baseName}_Table3_SplitPayment_${dateStart}_to_${dateEnd}_${timeStr}.csv`, content: 'TwinTraceID,AdvExpected,AdvReceived,CODExpected,CODReceived,CourierCharges,Status,VarianceGap\n' + t3Data.map(r => `${r.twinTraceId},${r.advExpected},${r.advReceived},${r.codExpected},${r.codReceived},${r.courierCharges},${r.status},${r.varianceGap}`).join('\n') },
      { name: `${baseName}_Table4_FreeDelivery_${dateStart}_to_${dateEnd}_${timeStr}.csv`, content: 'TraceID,ProductPrice,AdvancePaid,DeliveryCharge,InternalExpenseEntry,Status,VarianceGap\n' + t4Data.map(r => `${r.traceId},${r.productPrice},${r.advancePaid},${r.deliveryCharge},${r.internalExpenseEntry},${r.status},${r.varianceGap}`).join('\n') },
      { name: `${baseName}_Table5_ReturnedProducts_${dateStart}_to_${dateEnd}_${timeStr}.csv`, content: 'TraceID,CourierStatus,ReturnFee,ScanStatus,AuditStatus,FinancialImpact\n' + t5Data.map(r => `${r.traceId},${r.courierReturnedStatus},${r.returnFeeCharged},${r.warehouseShopScanStatus},${r.auditStatusBadge},${r.financialImpactBDT}`).join('\n') }
    ];

    // Trigger download for each CSV file
    files.forEach(f => {
      const blob = new Blob([f.content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', f.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    setDownloadSuccess(`Generated 5 Reconciled CSV Batch Files for ${dateStart} to ${dateEnd}`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Info & Date Range Selector */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-[#FACC15]" />
              <h2 className="text-base font-bold text-[#FFFFFF] font-mono uppercase tracking-wide">
                5-Table Reconciled Audit Center
              </h2>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1 font-medium">
              Comprehensive 5-Table Batch Output Center (6-Month Rolling Fiscal Retention)
            </p>
          </div>

          {/* Action Button: DOWNLOAD COMPLETE 5-TABLE RECONCILED BATCH */}
          <button
            id="download-complete-5-table-batch-btn"
            type="button"
            onClick={handleDownloadBatch}
            className="px-4 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-bold text-xs font-mono tracking-tight shadow-md shadow-[#FACC15]/20 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>📥 DOWNLOAD COMPLETE 5-TABLE RECONCILED BATCH (ZIP / MULTI-CSV)</span>
          </button>
        </div>

        {/* Date Range Selector & Search Bar */}
        <div className="mt-5 pt-4 border-t border-[#27272A] grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Filter */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by TraceID, Batch, or Status..."
              className="w-full bg-[#050505] border border-[#27272A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#FFFFFF] placeholder-zinc-600 focus:outline-none focus:border-[#FACC15] font-mono"
            />
          </div>

          {/* Start Date */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <span className="text-xs font-mono text-[#A1A1AA] shrink-0">From:</span>
            <input
              type="date"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
              className="w-full bg-[#050505] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#FFFFFF] font-mono focus:outline-none focus:border-[#FACC15]"
            />
          </div>

          {/* End Date */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <span className="text-xs font-mono text-[#A1A1AA] shrink-0">To:</span>
            <input
              type="date"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
              className="w-full bg-[#050505] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#FFFFFF] font-mono focus:outline-none focus:border-[#FACC15]"
            />
          </div>

          <div className="sm:col-span-1 flex items-center justify-end">
            <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded border border-[#22C55E]/30 whitespace-nowrap">
              ● Live Sync
            </span>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-[#050505] border border-[#22C55E]/60 text-xs font-mono text-[#22C55E] flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* 5 Distinct Tab Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar font-mono text-xs">
        {[
          { id: 'T1', label: 'Table 1: Full Pre-Payment (100% MFS)', count: t1Data.length, icon: CreditCard },
          { id: 'T2', label: 'Table 2: Full COD (100% Courier)', count: t2Data.length, icon: Truck },
          { id: 'T3', label: 'Table 3: Split Payment (Advance + COD)', count: t3Data.length, icon: Split },
          { id: 'T4', label: 'Table 4: Free Delivery (Promo Absorbed)', count: t4Data.length, icon: Gift },
          { id: 'T5', label: 'Table 5: Returned Products (Reverse Logistics)', count: t5Data.length, icon: RotateCcw }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTableTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTableTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#121212] border-[#FACC15] text-[#FFFFFF] shadow-sm shadow-[#FACC15]/20 font-bold'
                  : 'bg-[#121212]/60 border-[#27272A] text-[#A1A1AA] hover:text-[#FFFFFF]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FACC15]' : 'text-[#A1A1AA]'}`} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                isActive ? 'bg-[#FACC15] text-[#050505]' : 'bg-[#050505] text-[#A1A1AA]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TABLE 1: Full Pre-Payment Reconciled Output (100% MFS) */}
      {activeTableTab === 'T1' && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
              Table 1: Full Pre-Payment Reconciled Output (100% MFS)
            </h3>
            <span className="text-xs font-mono text-[#A1A1AA]">
              Audit Verification: Gateway Statement vs Orders Ledger
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">TraceID</th>
                  <th className="py-3 px-4 font-semibold text-right">Order Amount</th>
                  <th className="py-3 px-4 font-semibold text-right">MFS Received</th>
                  <th className="py-3 px-4 font-semibold text-right">MFS Commission</th>
                  <th className="py-3 px-4 font-semibold">Audit Status Badge</th>
                  <th className="py-3 px-4 font-semibold text-right">Variance Gap (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {t1Data.filter(r => filterBySearch(r.traceId) || filterBySearch(r.status)).map(row => (
                  <tr key={row.traceId} className="hover:bg-[#050505] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#FACC15]">{row.traceId}</td>
                    <td className="py-3 px-4 text-right">{formatBDT(row.orderAmount)}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#22C55E]">{formatBDT(row.mfsReceived)}</td>
                    <td className="py-3 px-4 text-right text-[#A1A1AA]">{formatBDT(row.mfsCommission)}</td>
                    <td className="py-3 px-4">
                      {row.status === 'MATCHED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40">
                          MATCHED
                        </span>
                      )}
                      {row.status === 'UNMATCHED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
                          UNMATCHED
                        </span>
                      )}
                      {row.status === 'NOT_FOUND' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40">
                          NOT_FOUND
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${row.varianceGap < 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                      {row.varianceGap === 0 ? 'BDT 0.00' : `${row.varianceGap < 0 ? '-' : '+'} ${formatBDT(Math.abs(row.varianceGap))}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 2: Full Cash on Delivery Reconciled Output (100% Courier COD) */}
      {activeTableTab === 'T2' && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
              Table 2: Full Cash on Delivery Reconciled Output (100% Courier COD)
            </h3>
            <span className="text-xs font-mono text-[#A1A1AA]">
              Audit Verification: Courier Remittance vs COD Receivables
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">TraceID</th>
                  <th className="py-3 px-4 font-semibold text-right">Order Amount</th>
                  <th className="py-3 px-4 font-semibold text-right">Courier Collected</th>
                  <th className="py-3 px-4 font-semibold text-right">Delivery Fee Deducted</th>
                  <th className="py-3 px-4 font-semibold">Audit Status Badge</th>
                  <th className="py-3 px-4 font-semibold text-right">Variance Gap (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {t2Data.filter(r => filterBySearch(r.traceId) || filterBySearch(r.status)).map(row => (
                  <tr key={row.traceId} className="hover:bg-[#050505] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#FACC15]">{row.traceId}</td>
                    <td className="py-3 px-4 text-right">{formatBDT(row.orderAmount)}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#FACC15]">{formatBDT(row.courierCollected)}</td>
                    <td className="py-3 px-4 text-right text-[#A1A1AA]">{formatBDT(row.deliveryFeeDeducted)}</td>
                    <td className="py-3 px-4">
                      {row.status === 'MATCHED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40">
                          MATCHED
                        </span>
                      )}
                      {row.status === 'UNMATCHED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
                          UNMATCHED
                        </span>
                      )}
                      {row.status === 'NOT_FOUND' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40">
                          NOT_FOUND
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${row.varianceGap < 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                      {row.varianceGap === 0 ? 'BDT 0.00' : `${row.varianceGap < 0 ? '-' : '+'} ${formatBDT(Math.abs(row.varianceGap))}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 3: Split Payment Reconciled Output (Advance MFS + Courier COD Balance) */}
      {activeTableTab === 'T3' && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
              Table 3: Split Payment Reconciled Output (Advance MFS + Courier COD Balance)
            </h3>
            <span className="text-xs font-mono text-[#A1A1AA]">
              Audit Verification: Dual-Pulse Synchronized Cross-Matching
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Twin-TraceID</th>
                  <th className="py-3 px-4 font-semibold text-right">Advance Exp vs Rec</th>
                  <th className="py-3 px-4 font-semibold text-right">COD Exp vs Rec</th>
                  <th className="py-3 px-4 font-semibold text-right">Courier Charges</th>
                  <th className="py-3 px-4 font-semibold">Audit Status Badge</th>
                  <th className="py-3 px-4 font-semibold text-right">Variance Gap (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {t3Data.filter(r => filterBySearch(r.twinTraceId) || filterBySearch(r.status)).map(row => (
                  <tr key={row.twinTraceId} className="hover:bg-[#050505] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#06B6D4]">{row.twinTraceId}</td>
                    <td className="py-3 px-4 text-right">
                      {formatBDT(row.advExpected)} / <span className="text-[#22C55E] font-bold">{formatBDT(row.advReceived)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatBDT(row.codExpected)} / <span className="text-[#FACC15] font-bold">{formatBDT(row.codReceived)}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#A1A1AA]">{formatBDT(row.courierCharges)}</td>
                    <td className="py-3 px-4">
                      {row.status === 'MATCHED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40">
                          MATCHED
                        </span>
                      )}
                      {row.status === 'UNMATCHED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
                          UNMATCHED
                        </span>
                      )}
                      {row.status === 'NOT_FOUND' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40">
                          NOT_FOUND
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${row.varianceGap < 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                      {row.varianceGap === 0 ? 'BDT 0.00' : `${row.varianceGap < 0 ? '-' : '+'} ${formatBDT(Math.abs(row.varianceGap))}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 4: Free Delivery / No Delivery Charge Reconciled Output */}
      {activeTableTab === 'T4' && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
              Table 4: Free Delivery / No Delivery Charge Reconciled Output
            </h3>
            <span className="text-xs font-mono text-[#A1A1AA]">
              Audit Verification: Zero Customer Delivery Charge & Marketing Expense Offset
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">TraceID</th>
                  <th className="py-3 px-4 font-semibold text-right">Product Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Advance Paid</th>
                  <th className="py-3 px-4 font-semibold text-center">Delivery Charge</th>
                  <th className="py-3 px-4 font-semibold">Internal Expense Entry</th>
                  <th className="py-3 px-4 font-semibold">Audit Status Badge</th>
                  <th className="py-3 px-4 font-semibold text-right">Variance Gap (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {t4Data.filter(r => filterBySearch(r.traceId) || filterBySearch(r.status)).map(row => (
                  <tr key={row.traceId} className="hover:bg-[#050505] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#FACC15]">{row.traceId}</td>
                    <td className="py-3 px-4 text-right">{formatBDT(row.productPrice)}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#22C55E]">{formatBDT(row.advancePaid)}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#22C55E]">BDT 0</td>
                    <td className="py-3 px-4 text-[#A1A1AA]">{row.internalExpenseEntry}</td>
                    <td className="py-3 px-4">
                      {row.status === 'MATCHED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40">
                          MATCHED
                        </span>
                      )}
                      {row.status === 'UNMATCHED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
                          UNMATCHED
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${row.varianceGap < 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                      {row.varianceGap === 0 ? 'BDT 0.00' : `${row.varianceGap < 0 ? '-' : '+'} ${formatBDT(Math.abs(row.varianceGap))}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 5: Returned Products & Reverse Logistics Reconciled Output */}
      {activeTableTab === 'T5' && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
                Table 5: Returned Products & Reverse Logistics Reconciled Output
              </h3>
              <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5">
                Real-Time Reactive: Scanning any barcode instantly clears Ghost Return exceptions and marks row VERIFIED_RETURNED
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
              Terminal Linked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">TraceID</th>
                  <th className="py-3 px-4 font-semibold">Courier Returned Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Return Fee Charged</th>
                  <th className="py-3 px-4 font-semibold">Warehouse/Shop Scan Status</th>
                  <th className="py-3 px-4 font-semibold">Audit Status Badge</th>
                  <th className="py-3 px-4 font-semibold text-right">Financial Impact (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {t5Data.filter(r => filterBySearch(r.traceId) || filterBySearch(r.auditStatusBadge)).map(row => (
                  <tr key={row.traceId} className="hover:bg-[#050505] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#FACC15]">{row.traceId}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px]">
                        {row.courierReturnedStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#A1A1AA]">
                      {formatBDT(row.returnFeeCharged)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        row.warehouseShopScanStatus === 'SCANNED_OK'
                          ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40'
                          : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40'
                      }`}>
                        {row.warehouseShopScanStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {row.auditStatusBadge === 'VERIFIED_RETURNED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED_RETURNED
                        </span>
                      )}
                      {row.auditStatusBadge === 'GHOST_RETURN_EXCEPTION' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          GHOST_RETURN_EXCEPTION
                        </span>
                      )}
                      {row.auditStatusBadge === 'COURIER_RETENTION_LOST' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          COURIER_RETENTION_LOST
                        </span>
                      )}
                      {row.auditStatusBadge === 'RETURN_FEE_OVERCHARGE' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/40 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          RETURN_FEE_OVERCHARGE
                        </span>
                      )}
                      {row.auditStatusBadge === 'RETURN_IN_TRANSIT' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 w-fit">
                          RETURN_IN_TRANSIT
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${row.financialImpactBDT < 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                      {row.financialImpactBDT === 0 ? 'BDT 0.00' : `- ${formatBDT(Math.abs(row.financialImpactBDT))}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
