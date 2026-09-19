import React, { useState } from 'react';
import { UnifiedAuditRow, UnifiedRowCategoryKey } from '../../types';
import { formatBDT } from '../../data/mockData';
import { useRecon } from '../../context/ReconContext';
import { playScannerBeep } from '../../utils/scannerAudio';
import { GlobalQuickScanModal } from '../modals/GlobalQuickScanModal';
import { 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Layers, 
  Building2, 
  Store, 
  Sparkles,
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  ExternalLink, 
  ChevronDown,
  Barcode,
  Camera,
  ScanLine,
  Zap,
  Check
} from 'lucide-react';

interface UnifiedAuditResultsTableProps {
  currentCategory: 'Track A Enterprise' | 'Track B SME';
  rows: UnifiedAuditRow[];
  totalExpectedVolumeBDT: number;
  totalSettledVolumeBDT: number;
  totalVarianceGapBDT: number;
  anomaliesCount: number;
}

export const UnifiedAuditResultsTable: React.FC<UnifiedAuditResultsTableProps> = ({
  currentCategory,
  rows,
  totalExpectedVolumeBDT,
  totalSettledVolumeBDT,
  totalVarianceGapBDT,
  anomaliesCount
}) => {
  const { currentTrack, setCurrentTrack, setActivePage, scanReturnedParcel, warehouseId, operatorId } = useRecon();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'ALL' | UnifiedRowCategoryKey>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [inspectingRow, setInspectingRow] = useState<UnifiedAuditRow | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanToast, setScanToast] = useState<{ message: string; traceId: string } | null>(null);
  const [lastScannedTraceId, setLastScannedTraceId] = useState<string | null>(null);

  const handleDirectRowScan = (row: UnifiedAuditRow) => {
    playScannerBeep('success');
    const scanRes = scanReturnedParcel(
      row.traceId,
      currentTrack === 'track-a' ? 'Warehouse Dock Bay 2' : 'Shop Intake Counter 1',
      warehouseId || (currentTrack === 'track-a' ? 'WH-DHK-TEJGAON-01' : 'SHOP-DHAKA-BANANI-02'),
      operatorId || 'OP-SCANNER-409'
    );

    setLastScannedTraceId(row.traceId);
    setTimeout(() => setLastScannedTraceId(null), 3000);

    const updatedP = scanRes.updatedParcel;
    const overcharge = updatedP ? updatedP.vector1OverchargeVarianceBDT : 0;
    const isSlaBreached = updatedP ? updatedP.returnChargeReconStatus === 'SLA_BREACH_WAIVED' : false;
    const hasChargeDiscrepancy = overcharge > 0 || isSlaBreached;

    let toastMsg = scanRes.message;
    if (updatedP) {
      if (isSlaBreached) {
        toastMsg = `Physical Check-in Verified: [${row.traceId}] restocked, BUT SLA retention breached (${updatedP.deltaDaysInTransit}d in hub). Contract fee BDT 0. BDT ${updatedP.returnFeeBDT} return fee disputed!`;
      } else if (overcharge > 0) {
        toastMsg = `Physical Check-in Verified: [${row.traceId}] restocked, BUT Return Charge overbilled by BDT ${overcharge} (Billed BDT ${updatedP.returnFeeBDT} vs Cap BDT ${updatedP.contractReturnFeeBDT || 60}). Clawback active!`;
      } else {
        toastMsg = `Physical Check-in & Fee Reconciled: [${row.traceId}] restocked and Return Charge of BDT ${updatedP.returnFeeBDT} validated against contract rate.`;
      }
    }

    setScanToast({ message: toastMsg, traceId: row.traceId });
    setTimeout(() => setScanToast(null), 6000);

    if (inspectingRow && inspectingRow.traceId === row.traceId) {
      setInspectingRow({
        ...inspectingRow,
        status: 'RETURN_RECEIVED_IN_WAREHOUSE',
        statusLabel: isSlaBreached 
          ? 'RESTOCKED: SLA FEE WAIVED' 
          : overcharge > 0 
          ? `RESTOCKED: OVERCHARGE (+BDT ${overcharge})` 
          : 'RESTOCKED: CHARGE VALIDATED',
        statusBadgeClasses: hasChargeDiscrepancy
          ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40'
          : 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40',
        varianceGapBDT: isSlaBreached ? -(updatedP?.returnFeeBDT || 0) : overcharge > 0 ? -overcharge : 0,
        tooltip: hasChargeDiscrepancy
          ? isSlaBreached
            ? `Physical item restocked at warehouse gate, but parcel stalled in hub past SLA. Entire courier return charge of BDT ${updatedP?.returnFeeBDT} is disputed.`
            : `Physical item restocked at warehouse gate, but Courier Return Charge of BDT ${updatedP?.returnFeeBDT} exceeds Contract Cap of BDT ${updatedP?.contractReturnFeeBDT || 60} by BDT ${overcharge}.`
          : 'RESOLVED: Barcode physically scanned at receiving dock gate. Stock restored and return charge verified valid.',
        notes: hasChargeDiscrepancy
          ? `Physically checked-in via Gate-Keeper Barcode Scanner. Financial Return Charge discrepancy flagged for remittance clawback.`
          : `Physically checked-in via Gate-Keeper Barcode Scanner. Return fee validated.`
      });
    }
  };

  // Filter rows by Row Category and Audit Status
  const isRowMatched = (row: UnifiedAuditRow) => {
    return (
      row.status === 'MATCHED' ||
      row.status === 'RETURN_RECEIVED_IN_WAREHOUSE' ||
      row.statusLabel?.toUpperCase().includes('MATCHED') ||
      row.statusLabel?.toUpperCase().includes('VALIDATED') ||
      row.statusLabel?.toUpperCase().includes('RESTOCKED') ||
      row.varianceGapBDT === 0
    );
  };

  const isRowMismatch = (row: UnifiedAuditRow) => {
    return (
      ['AMOUNT_MISMATCH', 'UNDER_REMITTED', 'LOGISTICS_VARIANCE', 'RETURN_VARIANCE_ERROR'].includes(row.status) ||
      row.statusLabel?.toUpperCase().includes('MISMATCH') ||
      row.statusLabel?.toUpperCase().includes('OVERCHARGE') ||
      row.statusLabel?.toUpperCase().includes('UNDER-REMITTED')
    );
  };

  const isRowMissing = (row: UnifiedAuditRow) => {
    return (
      ['MISSING_PAYMENT', 'COURIER_RETENTION_GAP', 'UNLINKED_MFS'].includes(row.status) ||
      row.statusLabel?.toUpperCase().includes('MISSING') ||
      row.statusLabel?.toUpperCase().includes('RETENTION')
    );
  };

  const isRowGhost = (row: UnifiedAuditRow) => {
    return (
      ['GHOST_ENTRY', 'GHOST_RETURN_EXCEPTION'].includes(row.status) ||
      row.statusLabel?.toUpperCase().includes('GHOST')
    );
  };

  const filteredRows = rows.filter(row => {
    if (selectedCategoryFilter !== 'ALL' && row.rowCategoryKey !== selectedCategoryFilter) {
      return false;
    }
    if (selectedStatusFilter === 'MATCHED' && !isRowMatched(row)) {
      return false;
    }
    if (selectedStatusFilter === 'MISMATCH' && !isRowMismatch(row)) {
      return false;
    }
    if (selectedStatusFilter === 'MISSING' && !isRowMissing(row)) {
      return false;
    }
    if (selectedStatusFilter === 'GHOST_RETURN' && !isRowGhost(row)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Live In-Table Barcode Scan Toast Feedback */}
      {scanToast && (
        <div className="p-3.5 rounded-xl bg-[#050505] border border-[#22C55E] text-[#22C55E] text-xs font-mono shadow-xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
            <div>
              <span className="font-bold text-white uppercase tracking-wider block">
                Optical Barcode Scan Acknowledged
              </span>
              <span className="text-[#22C55E] text-[11px]">
                {scanToast.message}
              </span>
            </div>
          </div>
          <button
            onClick={() => setScanToast(null)}
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-mono shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Category Synchronization Header & Switcher */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] animate-pulse"></span>
              <span className="text-xs uppercase font-mono font-bold text-[#FACC15] tracking-wider">
                Synchronized Multi-Vector Audit Grid
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#FFFFFF] font-mono tracking-tight mt-1 flex items-center gap-2 flex-wrap">
              <span>{currentCategory} Reconciled Results</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#050505] text-[#FACC15] border border-[#FACC15]/40 font-mono">
                {filteredRows.length} Records In Scope
              </span>
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-1 font-sans">
              Identical 11-column data structure and uniform color codes across both Track A (Enterprise API) &amp; Track B (SME Dual-File).
            </p>
          </div>

          {/* Action Buttons: Category Switcher + Barcode Terminal Trigger */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* Open Global Barcode Scanner Modal Button */}
            <button
              onClick={() => setIsScanModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#050505] hover:bg-[#FACC15] hover:text-[#050505] text-[#FACC15] border border-[#FACC15]/50 text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm shadow-[#FACC15]/10 cursor-pointer min-h-[40px] group active:scale-[0.98]"
              title="Open Barcode Scanner Terminal for both tracks"
            >
              <Barcode className="w-4 h-4 text-[#FACC15] group-hover:text-[#050505] transition-colors" />
              <span>Scan Barcode Terminal</span>
            </button>

            {/* Direct Category Switcher Tab Buttons */}
            <div className="flex items-center bg-[#050505] p-1 rounded-xl border border-[#27272A]">
              <button
                onClick={() => {
                  setCurrentTrack('track-a');
                  setActivePage('track-a/audit');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  currentTrack === 'track-a'
                    ? 'bg-[#FACC15] text-[#050505] shadow-md'
                    : 'text-[#A1A1AA] hover:text-[#FFFFFF]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Track A</span>
              </button>
              <button
                onClick={() => {
                  setCurrentTrack('track-b');
                  setActivePage('track-b/audit');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  currentTrack === 'track-b'
                    ? 'bg-[#FACC15] text-[#050505] shadow-md'
                    : 'text-[#A1A1AA] hover:text-[#FFFFFF]'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Track B</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Standardized Metric Cards in High-Contrast Theme */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#27272A]">
          <div className="p-3 bg-[#050505] rounded-xl border border-[#27272A]">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">Total Audited Gross</span>
            <div className="text-base sm:text-lg font-black font-mono text-[#FFFFFF] mt-0.5">
              {formatBDT(totalExpectedVolumeBDT)}
            </div>
            <span className="text-[10px] text-[#A1A1AA] font-mono">100% TraceID verified</span>
          </div>

          <div className="p-3 bg-[#050505] rounded-xl border border-[#27272A]">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">Net Bank Settled</span>
            <div className="text-base sm:text-lg font-black font-mono text-[#22C55E] mt-0.5">
              {formatBDT(totalSettledVolumeBDT)}
            </div>
            <span className="text-[10px] text-[#22C55E]/80 font-mono">Realized bank credits</span>
          </div>

          <div className="p-3 bg-[#050505] rounded-xl border border-[#27272A]">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">Net Variance Gap</span>
            <div className={`text-base sm:text-lg font-black font-mono mt-0.5 ${totalVarianceGapBDT === 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {totalVarianceGapBDT === 0 ? 'BDT 0.00' : formatBDT(totalVarianceGapBDT)}
            </div>
            <span className={`text-[10px] font-mono ${totalVarianceGapBDT === 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {totalVarianceGapBDT === 0 ? 'Zero Variance Balanced' : 'Actionable Discrepancy'}
            </span>
          </div>

          <div className="p-3 bg-[#050505] rounded-xl border border-[#27272A]">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">Identified Anomalies</span>
            <div className="text-base sm:text-lg font-black font-mono text-[#EF4444] mt-0.5">
              {anomaliesCount} {anomaliesCount === 1 ? 'Record' : 'Records'}
            </div>
            <span className="text-[10px] text-[#EF4444] font-mono">Deterministic audit flags</span>
          </div>
        </div>

        {/* 5 Row Category Filter Tabs (Table 1 to Table 5) */}
        <div className="mt-4 pt-3 border-t border-[#27272A]">
          <div className="text-[11px] font-mono uppercase font-bold text-[#A1A1AA] mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>Filter by 5 Commercial Schemes (Bangladeshi Ecosystem Standard):</span>
            </span>
            <span className="text-[#FACC15] lowercase">5 distinct transactional behaviors</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                selectedCategoryFilter === 'ALL'
                  ? 'bg-[#FACC15] text-[#050505] font-bold shadow-md'
                  : 'bg-[#050505] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A]'
              }`}
            >
              All 5 Schemes
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('T1_PREPAID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                selectedCategoryFilter === 'T1_PREPAID'
                  ? 'bg-[#FACC15] text-[#050505] font-bold shadow-md'
                  : 'bg-[#050505] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A]'
              }`}
            >
              Table 1: Pre-Payment (100% MFS)
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('T2_COD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                selectedCategoryFilter === 'T2_COD'
                  ? 'bg-[#FACC15] text-[#050505] font-bold shadow-md'
                  : 'bg-[#050505] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A]'
              }`}
            >
              Table 2: Cash on Delivery (100% COD)
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('T3_SPLIT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                selectedCategoryFilter === 'T3_SPLIT'
                  ? 'bg-[#FACC15] text-[#050505] font-bold shadow-md'
                  : 'bg-[#050505] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A]'
              }`}
            >
              Table 3: Split Payment (Advance + COD)
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('T4_FREE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                selectedCategoryFilter === 'T4_FREE'
                  ? 'bg-[#FACC15] text-[#050505] font-bold shadow-md'
                  : 'bg-[#050505] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A]'
              }`}
            >
              Table 4: Free Delivery (Zero Charge)
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('T5_RETURN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                selectedCategoryFilter === 'T5_RETURN'
                  ? 'bg-[#FACC15] text-[#050505] font-bold shadow-md'
                  : 'bg-[#050505] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A]'
              }`}
            >
              Table 5: Returned Products (Reverse)
            </button>
          </div>
        </div>

        {/* Audit Status Filter Pills */}
        <div className="pt-2 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-[#A1A1AA] mr-1">Status:</span>
            <button
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-[#FFFFFF] text-[#050505] font-bold'
                  : 'bg-[#050505] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A]'
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => setSelectedStatusFilter('MATCHED')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                selectedStatusFilter === 'MATCHED'
                  ? 'bg-[#22C55E] text-[#050505] font-bold'
                  : 'bg-[#050505] text-[#22C55E] border border-[#22C55E]/40'
              }`}
            >
              Matched (0 Variance)
            </button>
            <button
              onClick={() => setSelectedStatusFilter('MISMATCH')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                selectedStatusFilter === 'MISMATCH'
                  ? 'bg-[#EF4444] text-[#FFFFFF] font-bold'
                  : 'bg-[#050505] text-[#EF4444] border border-[#EF4444]/40'
              }`}
            >
              Amount Mismatch
            </button>
            <button
              onClick={() => setSelectedStatusFilter('MISSING')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                selectedStatusFilter === 'MISSING'
                  ? 'bg-[#06B6D4] text-[#050505] font-bold'
                  : 'bg-[#050505] text-[#06B6D4] border border-[#06B6D4]/40'
              }`}
            >
              Missing / Gap
            </button>
            <button
              onClick={() => setSelectedStatusFilter('GHOST_RETURN')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                selectedStatusFilter === 'GHOST_RETURN'
                  ? 'bg-[#A855F7] text-[#FFFFFF] font-bold'
                  : 'bg-[#050505] text-[#A855F7] border border-[#A855F7]/40'
              }`}
            >
              Ghost / Returns
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#A1A1AA]">
            Showing <span className="text-[#FFFFFF] font-bold">{filteredRows.length}</span> of {rows.length} rows
          </div>
        </div>
      </div>

      {/* Synchronized Reconciled Audit Table with Exact 11 Columns */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            {/* Exactly Identical 11 Columns */}
            <thead className="bg-[#050505] text-[#A1A1AA] border-b border-[#27272A] text-[11px] uppercase tracking-wider font-bold select-none">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">TraceID &amp; Order Ref</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Row Category &amp; Scheme</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Customer &amp; Partner</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">Gross Order (BDT)</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">MFS Credit (Adv)</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">Courier COD</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">Courier Delivery Fee</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">Net Settled (BDT)</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">Variance Gap</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Audit Status Badge</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-center">Forensic Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
              {filteredRows.map((row) => {
                const isDiscrepant = row.varianceGapBDT !== 0;
                const isJustScanned = lastScannedTraceId === row.traceId;

                return (
                  <tr
                    key={row.id}
                    onClick={() => setInspectingRow(row)}
                    className={`hover:bg-zinc-900/60 transition-colors cursor-pointer group ${
                      isJustScanned ? 'bg-emerald-950/30' : ''
                    }`}
                  >
                    {/* Col 1: TraceID & Order Ref + In-Table Barcode Scan Trigger */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#FFFFFF] group-hover:text-[#FACC15] transition-colors">
                          {row.traceId}
                        </span>

                        {/* Interactive Barcode Icon Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectRowScan(row);
                          }}
                          title={`Scan & verify barcode for ${row.traceId}`}
                          className="p-1 rounded bg-[#050505] hover:bg-[#FACC15] text-zinc-400 hover:text-[#050505] border border-[#27272A] hover:border-[#FACC15] transition-all cursor-pointer"
                        >
                          <Barcode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[10px] text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                        <span>Ref: {row.orderId}</span>
                        {row.trxId && <span>· Tx: {row.trxId}</span>}
                      </div>
                    </td>

                    {/* Col 2: Row Category & Scheme */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#050505] border border-[#27272A] text-[#FACC15] block w-fit">
                        {row.rowCategoryName}
                      </span>
                    </td>

                    {/* Col 3: Customer & Courier Partner */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-[#FFFFFF]">{row.customerName}</div>
                      <div className="text-[10px] text-[#A1A1AA] flex items-center gap-1">
                        <span>{row.channelPartner}</span>
                        {row.customerPhone && <span>· {row.customerPhone}</span>}
                      </div>
                    </td>

                    {/* Col 4: Gross Order (BDT) */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-[#FFFFFF]">
                      {formatBDT(row.grossOrderBDT)}
                    </td>

                    {/* Col 5: MFS Credit (Advance) */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono">
                      {row.mfsCreditBDT === 'ABSENT' ? (
                        <span className="text-[#06B6D4] text-[11px] font-bold">ABSENT</span>
                      ) : row.mfsCreditBDT > 0 ? (
                        <span className="text-[#FACC15] font-bold">{formatBDT(row.mfsCreditBDT)}</span>
                      ) : (
                        <span className="text-[#A1A1AA]">0.00</span>
                      )}
                    </td>

                    {/* Col 6: Courier COD Collected */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono">
                      {row.courierCodBDT === 'ABSENT' ? (
                        <span className="text-[#06B6D4] text-[11px] font-bold">ABSENT</span>
                      ) : row.courierCodBDT > 0 ? (
                        <span className="text-[#FFFFFF] font-bold">{formatBDT(row.courierCodBDT)}</span>
                      ) : (
                        <span className="text-[#A1A1AA]">0.00</span>
                      )}
                    </td>

                    {/* Col 7: Courier Delivery Fee (Deducted) */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-semibold text-[#EF4444]">
                      {row.deliveryFeeBDT > 0 ? (
                        <span>- BDT {row.deliveryFeeBDT.toLocaleString()}</span>
                      ) : (
                        <span>BDT 0.00</span>
                      )}
                    </td>

                    {/* Col 8: Net Settled (BDT) */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold">
                      {row.netBankSettledBDT === 'ABSENT' ? (
                        <span className="text-[#06B6D4] font-bold">ABSENT</span>
                      ) : (
                        <span className={row.varianceGapBDT === 0 ? 'text-[#22C55E]' : 'text-[#FFFFFF]'}>
                          {formatBDT(row.netBankSettledBDT)}
                        </span>
                      )}
                    </td>

                    {/* Col 9: Variance Gap */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold">
                      {row.varianceGapBDT === 0 ? (
                        <span className="text-[#22C55E]">0.00</span>
                      ) : (
                        <span className="text-[#EF4444] bg-[#EF4444]/10 px-1.5 py-0.5 rounded border border-[#EF4444]/30">
                          {row.varianceGapBDT > 0 ? `+${row.varianceGapBDT.toLocaleString()}` : row.varianceGapBDT.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Col 10: Audit Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border tracking-wider block w-fit ${row.statusBadgeClasses}`}>
                        {row.statusLabel}
                      </span>
                    </td>

                    {/* Col 11: Forensic Action with Direct Barcode Scan for Returns */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      {row.status === 'GHOST_RETURN_EXCEPTION' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectRowScan(row);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#A855F7] hover:bg-[#9333EA] text-white text-[10px] font-mono font-bold transition-all flex items-center gap-1 mx-auto shadow-sm shadow-[#A855F7]/30 cursor-pointer animate-pulse"
                          title="Physically check-in returned parcel at dock gate"
                        >
                          <Barcode className="w-3.5 h-3.5" />
                          <span>Scan Return</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectingRow(row);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#050505] hover:bg-[#FACC15] hover:text-[#050505] text-[#A1A1AA] hover:border-[#FACC15] border border-[#27272A] text-[11px] font-mono font-bold transition-all flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state if filter yields zero */}
        {filteredRows.length === 0 && (
          <div className="p-8 text-center text-[#A1A1AA] font-mono text-xs">
            No reconciliation rows match the selected category &amp; status filter.
          </div>
        )}
      </div>

      {/* Row Forensic Inspection Modal in Unified Obsidian & Yellow Theme */}
      {inspectingRow && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn"
          onClick={() => setInspectingRow(null)}
        >
          <div 
            className="bg-[#121212] border border-[#27272A] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#050505] border border-[#FACC15] flex items-center justify-center text-[#FACC15]">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#FFFFFF] font-mono">
                    Audit Forensic Dossier: {inspectingRow.traceId}
                  </h3>
                  <div className="text-[11px] text-[#A1A1AA] font-mono">
                    Reference: {inspectingRow.orderId} · {inspectingRow.rowCategoryName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectingRow(null)}
                className="text-[#A1A1AA] hover:text-[#FFFFFF] text-xs px-2.5 py-1 rounded-lg bg-[#050505] border border-[#27272A] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Diagnostic Details */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#050505] border border-[#27272A] space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-[#27272A]">
                  <span className="text-[#A1A1AA]">Audit Diagnosis Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${inspectingRow.statusBadgeClasses}`}>
                    {inspectingRow.statusLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Gross Expected Order Value:</span>
                  <span className="text-[#FFFFFF] font-bold">{formatBDT(inspectingRow.grossOrderBDT)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">MFS Advance Credit:</span>
                  <span className="text-[#FACC15] font-bold">
                    {inspectingRow.mfsCreditBDT === 'ABSENT' ? 'ABSENT' : formatBDT(inspectingRow.mfsCreditBDT)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Courier COD Collected:</span>
                  <span className="text-[#FFFFFF] font-bold">
                    {inspectingRow.courierCodBDT === 'ABSENT' ? 'ABSENT' : formatBDT(inspectingRow.courierCodBDT)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Courier Delivery Fee (Deducted):</span>
                  <span className="text-[#EF4444] font-bold">- BDT {inspectingRow.deliveryFeeBDT.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#27272A]">
                  <span className="text-[#A1A1AA]">Consolidated Bank Settled:</span>
                  <span className="text-[#22C55E] font-bold">
                    {inspectingRow.netBankSettledBDT === 'ABSENT' ? 'ABSENT' : formatBDT(inspectingRow.netBankSettledBDT)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Financial Variance Gap:</span>
                  <span className={`font-bold ${inspectingRow.varianceGapBDT === 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {inspectingRow.varianceGapBDT === 0 ? 'BDT 0.00 (Zero Variance)' : `BDT ${inspectingRow.varianceGapBDT.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Barcode & Physical Custody Verification Card */}
              <div className="p-4 rounded-xl bg-[#050505] border border-[#27272A] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#FACC15] font-bold flex items-center gap-1.5">
                    <Barcode className="w-4 h-4" />
                    <span>Physical Consignment Barcode Validation</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#A1A1AA]">
                    1D Code-128
                  </span>
                </div>

                {/* Barcode Graphics */}
                <div className="p-2.5 bg-[#121212] border border-[#27272A] rounded-lg flex flex-col items-center justify-center">
                  <div className="flex items-center gap-[2px] h-7 w-full max-w-xs justify-center opacity-85">
                    {inspectingRow.traceId.split('').map((char, i) => {
                      const code = char.charCodeAt(0);
                      const w1 = (code % 3) + 1;
                      const w2 = ((code * 2) % 3) + 1;
                      return (
                        <React.Fragment key={i}>
                          <div className="bg-[#FFFFFF] h-full" style={{ width: `${w1}px` }} />
                          <div className="bg-transparent h-full" style={{ width: `${w2}px` }} />
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-mono tracking-[0.2em] text-[#A1A1AA] mt-1 font-bold">
                    *{inspectingRow.traceId}*
                  </span>
                </div>

                {/* Scan Action Button */}
                <button
                  type="button"
                  onClick={() => handleDirectRowScan(inspectingRow)}
                  className="w-full py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-bold text-xs font-mono tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Camera className="w-4 h-4" />
                  <span>Simulate Dock Gate Optical Scan for {inspectingRow.traceId}</span>
                </button>
              </div>

              {/* Tooltip & Root Cause Explanation */}
              <div className="p-4 rounded-xl bg-[#050505] border border-[#27272A] text-[#A1A1AA]">
                <div className="text-[10px] font-mono text-[#FACC15] uppercase font-bold mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Deterministic Root Cause Analysis</span>
                </div>
                <p className="text-xs text-[#FFFFFF] leading-relaxed font-sans">
                  {inspectingRow.tooltip}
                </p>
              </div>

              {/* Forensic Notes */}
              {inspectingRow.notes && (
                <div className="p-4 rounded-xl bg-[#050505] border border-[#FACC15]/30 text-[#FFFFFF]">
                  <div className="text-[10px] text-[#FACC15] uppercase font-mono font-bold mb-1">
                    Auditor Ledger Evidence:
                  </div>
                  <p className="text-xs font-sans text-[#A1A1AA] leading-relaxed">
                    {inspectingRow.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-[#27272A] flex items-center justify-between">
              {inspectingRow.rowCategoryKey === 'T5_RETURN' && (
                <button
                  onClick={() => {
                    setInspectingRow(null);
                    setActivePage('return-policy');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#050505] hover:bg-[#27272A] text-[#FACC15] border border-[#FACC15]/40 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Return Gate Scanner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="ml-auto">
                <button
                  onClick={() => setInspectingRow(null)}
                  className="px-4 py-2 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Quick Scan Modal */}
      <GlobalQuickScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </div>
  );
};
