import React, { useState, useMemo } from 'react';
import { useRecon } from '../../context/ReconContext';
import { formatBDT } from '../../data/mockData';
import { UnifiedAuditRow } from '../../types';
import { UnifiedAuditResultsTable } from '../shared/UnifiedAuditResultsTable';
import { 
  FileCheck2, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Cpu, 
  Play, 
  ShieldAlert, 
  FileText, 
  Info,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const CourierAuditArea: React.FC = () => {
  const { 
    auditRecords, 
    isAuditRunning, 
    runTrackAAudit, 
    courierFileUploaded, 
    trackACourierFileName,
    uploadTrackACourierFile,
    bankFileUploaded,
    trackABankFileName,
    uploadTrackABankFile,
    removeTrackABankFile,
    setActivePage,
    returnParcels
  } = useRecon();

  const [dragOverCourier, setDragOverCourier] = useState<boolean>(false);
  const [dragOverBank, setDragOverBank] = useState<boolean>(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const handleDropCourier = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCourier(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      uploadTrackACourierFile(file.name);
      setUploadFeedback(`Courier settlement file updated: ${file.name}`);
      setTimeout(() => setUploadFeedback(null), 3500);
    }
  };

  const handleDropBank = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverBank(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      uploadTrackABankFile(file.name);
      setUploadFeedback(`Bank statement file updated: ${file.name}`);
      setTimeout(() => setUploadFeedback(null), 3500);
    }
  };

  // Convert Track A records into the standard 11-column UnifiedAuditRow structure
  const unifiedTrackARows: UnifiedAuditRow[] = useMemo(() => {
    // Base 8 records from mock data
    const mapped: UnifiedAuditRow[] = auditRecords.map(rec => {
      let rowCategoryKey: UnifiedAuditRow['rowCategoryKey'] = 'T1_PREPAID';
      let rowCategoryName = 'Table 1: Pre-Payment (100% MFS)';
      let customerName = 'Enterprise Client';
      let channelPartner = 'bKash Merchant';
      let grossOrderBDT = typeof rec.dbAmount === 'number' ? rec.dbAmount : 1200;
      let mfsCreditBDT: number | 'ABSENT' = 0;
      let courierCodBDT: number | 'ABSENT' = 0;
      let deliveryFeeBDT = rec.courierDeductedFee || rec.configFee || 0;
      let netBankSettledBDT = rec.settledAmount;
      let varianceGapBDT = 0;
      let statusLabel: string | undefined = undefined;
      let statusBadgeClasses: string | undefined = undefined;

      if (rec.traceId === 'TR-PRE-101') {
        rowCategoryKey = 'T1_PREPAID';
        rowCategoryName = 'Table 1: Pre-Payment (100% MFS)';
        customerName = 'Shakil Ahmed';
        channelPartner = 'bKash Gateway + Pathao Courier';
        grossOrderBDT = 1060;
        mfsCreditBDT = 1060;
        courierCodBDT = 0;
        deliveryFeeBDT = 60;
        netBankSettledBDT = 1000;
        varianceGapBDT = 0;
      } else if (rec.traceId === 'TR-DESHI-102') {
        rowCategoryKey = 'T1_PREPAID';
        rowCategoryName = 'Table 1: Pre-Payment (100% MFS)';
        customerName = 'Nusrat Jahan';
        channelPartner = 'Nagad Gateway + Pathao Courier';
        grossOrderBDT = 5000;
        mfsCreditBDT = 500;
        courierCodBDT = 0;
        deliveryFeeBDT = 80;
        netBankSettledBDT = 500;
        varianceGapBDT = -4500;
      } else if (rec.traceId === 'TR-COD-103') {
        rowCategoryKey = 'T2_COD';
        rowCategoryName = 'Table 2: Cash on Delivery (100% COD)';
        customerName = 'Kamal Hossain';
        channelPartner = 'Pathao Courier';
        grossOrderBDT = 2500;
        mfsCreditBDT = 0;
        courierCodBDT = 'ABSENT';
        deliveryFeeBDT = 120;
        netBankSettledBDT = 'ABSENT';
        varianceGapBDT = -2500;
      } else if (rec.traceId === 'TR-GHOST-104') {
        rowCategoryKey = 'T1_PREPAID';
        rowCategoryName = 'Table 1: Pre-Payment (100% MFS)';
        customerName = 'Tariqul Islam';
        channelPartner = 'bKash Direct + Paperfly Courier';
        grossOrderBDT = 1280;
        mfsCreditBDT = 1280;
        courierCodBDT = 0;
        deliveryFeeBDT = 80;
        netBankSettledBDT = 1200;
        varianceGapBDT = 0;
      } else if (rec.traceId === 'TR-COD-105') {
        rowCategoryKey = 'T2_COD';
        rowCategoryName = 'Table 2: Cash on Delivery (100% COD)';
        customerName = 'Mahmudur Rahman';
        channelPartner = 'Steadfast Courier';
        grossOrderBDT = 3000;
        mfsCreditBDT = 0;
        courierCodBDT = 2750;
        deliveryFeeBDT = 250;
        netBankSettledBDT = 2750;
        varianceGapBDT = -250;
      } else if (rec.traceId === 'TR-RET-201' || rec.traceId === 'TR-RET-202' || rec.traceId === 'TR-RET-203') {
        rowCategoryKey = 'T5_RETURN';
        rowCategoryName = 'Table 5: Returned Products (Reverse)';
        
        const matchingReturn = returnParcels.find(p => p.traceId === rec.traceId);
        if (matchingReturn) {
          customerName = matchingReturn.customerName;
          channelPartner = `${matchingReturn.courierPartner} Reverse`;
          grossOrderBDT = matchingReturn.contractReturnFeeBDT ?? 60;
          mfsCreditBDT = 0;
          courierCodBDT = 0;
          deliveryFeeBDT = matchingReturn.returnFeeBDT;
          netBankSettledBDT = matchingReturn.scannedAtWarehouse ? matchingReturn.returnFeeBDT : 'ABSENT';

          const isOvercharged = (matchingReturn.vector1OverchargeVarianceBDT || 0) > 0;
          const isSlaBreached = matchingReturn.returnChargeReconStatus === 'SLA_BREACH_WAIVED';

          if (matchingReturn.scannedAtWarehouse) {
            if (isSlaBreached) {
              statusLabel = 'RESTOCKED: SLA FEE WAIVED';
              statusBadgeClasses = 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40';
              varianceGapBDT = -matchingReturn.returnFeeBDT;
            } else if (isOvercharged) {
              statusLabel = `RESTOCKED: OVERCHARGE (+BDT ${matchingReturn.vector1OverchargeVarianceBDT})`;
              statusBadgeClasses = 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40';
              varianceGapBDT = -matchingReturn.vector1OverchargeVarianceBDT;
            } else {
              statusLabel = 'RESTOCKED: CHARGE VALIDATED';
              statusBadgeClasses = 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40';
              varianceGapBDT = 0;
            }
          } else {
            if (matchingReturn.vector3GhostException) {
              statusLabel = 'GHOST RETURN (DEBIT BLOCKED)';
              statusBadgeClasses = 'bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/40 animate-pulse';
              varianceGapBDT = -matchingReturn.returnFeeBDT;
            } else if (matchingReturn.vector2RetentionGap) {
              statusLabel = 'HUB RETENTION SLA BREACH';
              statusBadgeClasses = 'bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/40';
              varianceGapBDT = -matchingReturn.parcelValueBDT;
            } else {
              statusLabel = 'RETURN IN TRANSIT';
              statusBadgeClasses = 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/40';
              varianceGapBDT = isOvercharged ? -matchingReturn.vector1OverchargeVarianceBDT : 0;
            }
          }
        }
      }

      // Check if status has not been computed yet (for non-return rows)
      if (!statusLabel) {
        if (rec.resolved || rec.status === 'RETURN_RECEIVED_IN_WAREHOUSE') {
          statusLabel = 'RESOLVED: WAREHOUSE SCANNED';
          statusBadgeClasses = 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40';
          varianceGapBDT = 0;
        } else if (rec.status === 'MATCHED') {
          statusLabel = 'MATCHED';
          statusBadgeClasses = 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40';
        } else if (rec.status === 'AMOUNT_MISMATCH') {
          statusLabel = 'AMOUNT MISMATCH';
          statusBadgeClasses = 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40';
        } else if (rec.status === 'MISSING_PAYMENT') {
          statusLabel = 'MISSING PAYMENT';
          statusBadgeClasses = 'bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/40';
        } else if (rec.status === 'GHOST_ENTRY') {
          statusLabel = 'GHOST ENTRY';
          statusBadgeClasses = 'bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/40';
        } else if (rec.status === 'LOGISTICS_VARIANCE') {
          statusLabel = 'LOGISTICS VARIANCE';
          statusBadgeClasses = 'bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/40';
        } else if (rec.status === 'RETURN_VARIANCE_ERROR') {
          statusLabel = 'RETURN PENALTY ERROR';
          statusBadgeClasses = 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40';
        } else if (rec.status === 'COURIER_RETENTION_GAP') {
          statusLabel = 'RETENTION GAP';
          statusBadgeClasses = 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40';
        } else if (rec.status === 'GHOST_RETURN_EXCEPTION') {
          statusLabel = 'GHOST RETURN EXCEPTION';
          statusBadgeClasses = 'bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/40 animate-pulse';
        } else {
          statusLabel = rec.status;
          statusBadgeClasses = 'bg-[#050505] text-[#A1A1AA] border border-[#27272A]';
        }
      }

      return {
        id: rec.id,
        traceId: rec.traceId,
        orderId: rec.orderId || 'ABSENT',
        trxId: rec.trxId,
        rowCategoryKey,
        rowCategoryName,
        customerName,
        customerPhone: rec.customerPhone,
        channelPartner,
        grossOrderBDT,
        mfsCreditBDT,
        courierCodBDT,
        deliveryFeeBDT,
        netBankSettledBDT,
        varianceGapBDT,
        status: rec.status,
        statusLabel,
        statusBadgeClasses,
        tooltip: rec.tooltip,
        notes: rec.notes,
        isResolved: rec.resolved
      };
    });

    // Add complementary Table 3 (Split) & Table 4 (Free Delivery) rows to guarantee all 5 categories are represented
    const extraRows: UnifiedAuditRow[] = [
      {
        id: 'aud-09-split',
        traceId: 'TR-SPL-106',
        orderId: 'ORD-1006',
        trxId: 'BK-SPL-8821',
        rowCategoryKey: 'T3_SPLIT',
        rowCategoryName: 'Table 3: Split Payment (Advance + COD)',
        customerName: 'Rezaul Karim',
        customerPhone: '01744556677',
        channelPartner: 'bKash (Adv) + Steadfast (COD)',
        grossOrderBDT: 3500,
        mfsCreditBDT: 500,
        courierCodBDT: 3000,
        deliveryFeeBDT: 130,
        netBankSettledBDT: 3370,
        varianceGapBDT: 0,
        status: 'MATCHED',
        statusLabel: 'MATCHED',
        statusBadgeClasses: 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40',
        tooltip: 'Twin-pulse reconciliation verified: advance booking fee matched in bKash statement, remainder COD remitted by Steadfast.',
        notes: 'Zero variance. Settlement checksum validated against bank credit.'
      },
      {
        id: 'aud-10-free',
        traceId: 'TR-FRE-107',
        orderId: 'ORD-1007',
        trxId: 'BK-FRE-3301',
        rowCategoryKey: 'T4_FREE',
        rowCategoryName: 'Table 4: Free Delivery (Zero Charge)',
        customerName: 'Farhan Kabir',
        customerPhone: '01988776655',
        channelPartner: 'Pathao Courier (Promo Subsidized)',
        grossOrderBDT: 2800,
        mfsCreditBDT: 2800,
        courierCodBDT: 0,
        deliveryFeeBDT: 80,
        netBankSettledBDT: 2720,
        varianceGapBDT: 0,
        status: 'MATCHED',
        statusLabel: 'MATCHED',
        statusBadgeClasses: 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40',
        tooltip: 'Campaign promo applied: Pathao deducted contractual shipping fee of BDT 80 from settlement batch. Absorbed by merchant Marketing Expense Ledger EXP-MKTG-SHP-1007. Customer charged zero delivery fee.',
        notes: 'Marketing ledger entry code EXP-MKTG-SHP-1007 validated. Pathao remittance ref PTH-FRE-8812 verified.'
      }
    ];

    return [...mapped, ...extraRows];
  }, [auditRecords]);

  // Totals calculations
  const totalExpected = unifiedTrackARows.reduce((acc, r) => acc + r.grossOrderBDT, 0);
  const totalSettled = unifiedTrackARows.reduce((acc, r) => acc + (typeof r.netBankSettledBDT === 'number' ? r.netBankSettledBDT : 0), 0);
  const totalVariance = Math.abs(unifiedTrackARows.reduce((acc, r) => acc + r.varianceGapBDT, 0));
  const anomaliesCount = unifiedTrackARows.filter(r => r.varianceGapBDT !== 0).length;

  return (
    <div className="space-y-6 relative">
      {/* 2-Second Execution Animation Overlay in High-Contrast Obsidian & Yellow */}
      {isAuditRunning && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121212] border-2 border-[#FACC15] rounded-2xl max-w-xl w-full p-6 shadow-2xl font-mono space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2.5 text-[#FACC15] font-black text-sm">
                <Cpu className="w-5 h-5 animate-spin" />
                <span>TRACK A DETERMINISTIC MULTI-VECTOR AUDIT</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#050505] text-[#FACC15] border border-[#FACC15]/40 font-bold">
                AUDITING
              </span>
            </div>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-xl bg-[#050505] border border-[#27272A] text-[#FFFFFF] flex items-start gap-2.5 animate-pulse">
                <Terminal className="w-4 h-4 shrink-0 mt-0.5 text-[#FACC15]" />
                <div>
                  <div className="font-bold text-[#FACC15]">[STATEMENT PARSING]</div>
                  Parsing courier CSV layout and normalizing transaction records...
                  <div className="text-[10px] text-[#A1A1AA] mt-1">Normalizing Pathao / Steadfast / RedX headers to standard schema</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#050505] border border-[#27272A] text-[#FFFFFF] flex items-start gap-2.5">
                <Cpu className="w-4 h-4 shrink-0 mt-0.5 text-[#22C55E]" />
                <div>
                  <div className="font-bold text-[#22C55E]">[CROSS-STATEMENT MATCHING]</div>
                  Executing 3-way cross-match audit...
                  <div className="text-[10px] text-[#A1A1AA] mt-1">Comparing payment gateway records vs courier settlement lines vs bank payouts</div>
                </div>
              </div>
            </div>

            <div className="w-full bg-[#050505] h-2 rounded-full overflow-hidden border border-[#27272A]">
              <div className="bg-gradient-to-r from-[#FACC15] via-[#EAB308] to-[#22C55E] h-full w-full animate-[pulse_1s_infinite]"></div>
            </div>

            <p className="text-[11px] text-[#A1A1AA] text-center">
              Reconciling vector hashes against immutable shadow DB replica ledger...
            </p>
          </div>
        </div>
      )}

      {/* Top Banner & Operating Logic */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#050505] border border-[#FACC15] flex items-center justify-center text-[#FACC15] shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold text-[#FACC15] tracking-wider">
                  Category A: Track A Enterprise
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#050505] text-[#22C55E] border border-[#22C55E]/40 font-bold">
                  API Automated
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#FFFFFF] font-mono tracking-tight mt-0.5">
                Courier Settlement Reconciling Area
              </h2>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-[#050505] border border-[#27272A] text-xs font-mono text-[#A1A1AA] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#FACC15] shrink-0" />
            <span>MFS daily statement is auto-extracted at midnight via server cron job.</span>
          </div>
        </div>

        {/* 3 Upload / Staging Cards in Unified Obsidian & Yellow Theme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Card 1: Auto-Extracted MFS Daily API Ledger */}
          <div className="p-4 rounded-xl bg-[#050505] border border-[#27272A] relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA] font-bold">
                Source 1: MFS Daily Cron
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Staged
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#FFFFFF] font-mono mt-2 truncate">
              bKash_Midnight_Cron.csv
            </h4>
            <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5">
              Status: ✅ Staged in Shadow DB (1,000 items)
            </p>
            <div className="mt-3 pt-2 border-t border-[#27272A] text-[10px] text-[#A1A1AA] font-mono flex items-center justify-between">
              <span>Timestamp: Today 00:01:00 AM</span>
              <span className="text-[#22C55E] font-bold">MD5 Verified</span>
            </div>
          </div>

          {/* Card 2: Interactive Drag-and-Drop for Courier */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOverCourier(true); }}
            onDragLeave={() => setDragOverCourier(false)}
            onDrop={handleDropCourier}
            className={`p-4 rounded-xl border-2 border-dashed transition-all relative ${
              dragOverCourier
                ? 'bg-[#050505] border-[#FACC15] ring-2 ring-[#FACC15]/20'
                : courierFileUploaded
                ? 'bg-[#050505] border-[#27272A]'
                : 'bg-[#050505] border-[#27272A] hover:border-[#FACC15]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></span>
                Source 2: 3PL Courier Settlement
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                courierFileUploaded ? 'bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/40' : 'bg-[#121212] text-[#A1A1AA]'
              }`}>
                {courierFileUploaded ? '✅ Uploaded' : 'Required'}
              </span>
            </div>

            <div className="mt-2 text-center">
              <UploadCloud className="w-6 h-6 text-[#FACC15] mx-auto" />
              <div className="text-xs font-bold text-[#FFFFFF] font-mono mt-1 truncate" title={trackACourierFileName}>
                {trackACourierFileName}
              </div>
              <p className="text-[10px] text-[#A1A1AA] mt-0.5 font-mono">
                Drop or click to update (.csv, .xlsx) · 1,000 rows
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#A1A1AA]">Samples:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    uploadTrackACourierFile('Pathao_Settlement_Sept07.csv');
                    setUploadFeedback('Loaded Pathao Courier Settlement batch');
                    setTimeout(() => setUploadFeedback(null), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#FACC15] border border-[#27272A] transition-colors text-[9px] font-bold"
                >
                  Pathao
                </button>
                <button
                  type="button"
                  onClick={() => {
                    uploadTrackACourierFile('Steadfast_Remittance_Sept07.csv');
                    setUploadFeedback('Loaded Steadfast Remittance batch');
                    setTimeout(() => setUploadFeedback(null), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#FACC15] border border-[#27272A] transition-colors text-[9px] font-bold"
                >
                  Steadfast
                </button>
                <button
                  type="button"
                  onClick={() => {
                    uploadTrackACourierFile('RedX_Settlement_Sept07.csv');
                    setUploadFeedback('Loaded RedX Settlement batch');
                    setTimeout(() => setUploadFeedback(null), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#FACC15] border border-[#27272A] transition-colors text-[9px] font-bold"
                >
                  RedX
                </button>
              </div>
            </div>

            <label className="absolute inset-0 cursor-pointer opacity-0" title="Click to upload or update courier settlement file">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    uploadTrackACourierFile(f.name);
                    setUploadFeedback(`Updated Courier File: ${f.name}`);
                    setTimeout(() => setUploadFeedback(null), 3500);
                  }
                }}
              />
            </label>
          </div>

          {/* Card 3: Interactive Drag-and-Drop for Bank Statement */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOverBank(true); }}
            onDragLeave={() => setDragOverBank(false)}
            onDrop={handleDropBank}
            className={`p-4 rounded-xl border-2 border-dashed transition-all relative ${
              dragOverBank
                ? 'bg-[#050505] border-[#06B6D4] ring-2 ring-[#06B6D4]/20'
                : bankFileUploaded
                ? 'bg-[#050505] border-[#27272A]'
                : 'bg-[#050505] border-[#27272A] hover:border-[#06B6D4]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"></span>
                Source 3: Corporate Bank Statement
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                bankFileUploaded ? 'bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/40' : 'bg-[#121212] text-[#A1A1AA] border border-[#27272A]'
              }`}>
                {bankFileUploaded ? '✅ Attached' : 'Optional'}
              </span>
            </div>

            <div className="mt-2 text-center">
              <FileText className={`w-6 h-6 mx-auto ${bankFileUploaded ? 'text-[#06B6D4]' : 'text-[#A1A1AA]'}`} />
              <div className="text-xs font-bold text-[#FFFFFF] font-mono mt-1 truncate" title={trackABankFileName}>
                {bankFileUploaded ? trackABankFileName : 'Corporate Bank Deposit Statement'}
              </div>
              <p className="text-[10px] text-[#A1A1AA] mt-0.5 font-mono">
                {bankFileUploaded ? 'Deposit matched: BDT 3,50,000' : 'Drop PDF / CSV statement or click to upload'}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono">
              {bankFileUploaded ? (
                <>
                  <span className="text-[#22C55E] font-semibold">Matched with ledger</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTrackABankFile();
                      setUploadFeedback('Bank statement detached');
                      setTimeout(() => setUploadFeedback(null), 3000);
                    }}
                    className="text-[#EF4444] hover:underline z-10"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <span className="text-[#A1A1AA]">Sample:</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      uploadTrackABankFile('Dhaka_Bank_Corporate_Deposit.pdf');
                      setUploadFeedback('Attached Dhaka Bank statement');
                      setTimeout(() => setUploadFeedback(null), 3000);
                    }}
                    className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#06B6D4] border border-[#27272A] transition-colors text-[9px] font-bold z-10"
                  >
                    + Attach Dhaka Bank
                  </button>
                </>
              )}
            </div>

            <label className="absolute inset-0 cursor-pointer opacity-0" title="Click to upload or update bank statement">
              <input
                type="file"
                accept=".pdf,.csv,.xlsx"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    uploadTrackABankFile(f.name);
                    setUploadFeedback(`Updated Bank Statement: ${f.name}`);
                    setTimeout(() => setUploadFeedback(null), 3500);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {uploadFeedback && (
          <div className="mt-3 px-3.5 py-2 rounded-xl bg-[#050505] border border-[#22C55E]/40 text-xs font-mono text-[#22C55E] flex items-center justify-between animate-fadeIn">
            <span>{uploadFeedback}</span>
            <button onClick={() => setUploadFeedback(null)} className="text-[#A1A1AA] hover:text-[#FFFFFF]">✕</button>
          </div>
        )}

        {/* Return Policy Quick Link Banner */}
        <div className="mt-3 px-4 py-2.5 rounded-xl bg-[#050505] border border-[#27272A] flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#FFFFFF]">
            <span className="px-2 py-0.5 rounded-full bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/40 text-[10px] font-bold">
              RETURN POLICY
            </span>
            <span className="text-[#A1A1AA]">Auditing parcel returns or ghost charge disputes?</span>
          </div>
          <button
            onClick={() => setActivePage('return-policy')}
            className="text-[#FACC15] hover:text-[#EAB308] underline text-[11px] font-semibold shrink-0"
          >
            Open Return Policy &amp; Scanned Table →
          </button>
        </div>

        {/* Action Trigger Button */}
        <div className="mt-5 pt-4 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-mono text-[#A1A1AA]">
            Engine Status: <span className="text-[#FACC15] font-semibold">Multi-Vector Settlement Audit Ready</span>
          </div>

          <button
            id="run-track-a-audit-btn"
            onClick={runTrackAAudit}
            className="px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-mono font-bold text-xs tracking-wide shadow-lg shadow-[#FACC15]/10 flex items-center gap-2 transition-all transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-[#050505]" />
            <span>Run Settlement Reconciliation</span>
          </button>
        </div>
      </div>

      {/* Synchronized Reconciled Audit Table */}
      <UnifiedAuditResultsTable
        currentCategory="Track A Enterprise"
        rows={unifiedTrackARows}
        totalExpectedVolumeBDT={totalExpected}
        totalSettledVolumeBDT={totalSettled}
        totalVarianceGapBDT={totalVariance}
        anomaliesCount={anomaliesCount}
      />
    </div>
  );
};
