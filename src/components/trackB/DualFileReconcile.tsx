import React, { useState, useMemo } from 'react';
import { useRecon } from '../../context/ReconContext';
import { formatBDT } from '../../data/mockData';
import { UnifiedAuditRow } from '../../types';
import { UnifiedAuditResultsTable } from '../shared/UnifiedAuditResultsTable';
import { 
  GitCompare, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  FileText, 
  ShieldAlert, 
  Info, 
  Cpu,
  Store,
  ArrowRight
} from 'lucide-react';

export const DualFileReconcile: React.FC = () => {
  const {
    trackBMfsUploaded,
    trackBMfsFileName,
    uploadTrackBMfsFile,
    trackBCourierUploaded,
    trackBCourierFileName,
    uploadTrackBCourierFile,
    trackBBankUploaded,
    trackBBankFileName,
    uploadTrackBBankFile,
    removeTrackBBankFile,
    isTrackBAuditRunning,
    trackBAuditExecuted,
    runTrackBDualAudit,
    setActivePage,
    auditRecords,
    returnParcels
  } = useRecon();

  const [dragMfs, setDragMfs] = useState<boolean>(false);
  const [dragCourier, setDragCourier] = useState<boolean>(false);
  const [dragBank, setDragBank] = useState<boolean>(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const handleDropMfs = (e: React.DragEvent) => {
    e.preventDefault();
    setDragMfs(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      uploadTrackBMfsFile(f.name);
      setUploadFeedback(`MFS statement uploaded: ${f.name}`);
      setTimeout(() => setUploadFeedback(null), 3500);
    }
  };

  const handleDropCourier = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCourier(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      uploadTrackBCourierFile(f.name);
      setUploadFeedback(`Courier remittance uploaded: ${f.name}`);
      setTimeout(() => setUploadFeedback(null), 3500);
    }
  };

  const handleDropBank = (e: React.DragEvent) => {
    e.preventDefault();
    setDragBank(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      uploadTrackBBankFile(f.name);
      setUploadFeedback(`Bank statement uploaded (optional): ${f.name}`);
      setTimeout(() => setUploadFeedback(null), 3500);
    }
  };

  // Convert Track B records into the exact same 11-column UnifiedAuditRow structure
  const unifiedTrackBRows: UnifiedAuditRow[] = useMemo(() => {
    const isRet203Scanned = 
      Boolean(auditRecords.find(r => r.traceId === 'TR-RET-203')?.resolved) ||
      Boolean(returnParcels.find(p => p.traceId === 'TR-RET-203')?.scannedAtWarehouse);

    return [
      // 1. Table 1: Pre-Payment (100% MFS)
      {
        id: 'sme-row-01',
        traceId: 'TR-SME-2026-P01',
        orderId: 'FB-ORD-5501',
        trxId: 'CK44PP190X',
        rowCategoryKey: 'T1_PREPAID',
        rowCategoryName: 'Table 1: Pre-Payment (100% MFS)',
        customerName: 'Amina Chowdhury',
        customerPhone: '01711892019',
        channelPartner: 'bKash + Pathao Courier',
        grossOrderBDT: 3200,
        mfsCreditBDT: 3200,
        courierCodBDT: 0,
        deliveryFeeBDT: 80,
        netBankSettledBDT: 3120,
        varianceGapBDT: 0,
        status: 'MATCHED',
        statusLabel: 'MATCHED',
        statusBadgeClasses: 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40',
        tooltip: '100% Verified: Advance payment verified on bKash merchant statement. Pathao delivery fee of BDT 80 accounted for; net BDT 3,120 credited to bank.',
        notes: 'FB Order messenger booking token matched with bKash TrxID CK44PP190X. Net payout settled in City Bank.'
      },
      // 2. Table 3: Split Payment (Advance + COD)
      {
        id: 'sme-row-02',
        traceId: 'TR-SME-2026-P02',
        orderId: 'FB-ORD-5502',
        trxId: 'DA88LL2091',
        rowCategoryKey: 'T3_SPLIT',
        rowCategoryName: 'Table 3: Split Payment (Advance + COD)',
        customerName: 'Tanvir Hossain',
        customerPhone: '01822490182',
        channelPartner: 'bKash Advance + Steadfast COD',
        grossOrderBDT: 2600,
        mfsCreditBDT: 150,
        courierCodBDT: 2350,
        deliveryFeeBDT: 130,
        netBankSettledBDT: 2370,
        varianceGapBDT: -100,
        status: 'UNDER_REMITTED',
        statusLabel: 'UNDER-REMITTED',
        statusBadgeClasses: 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40',
        tooltip: 'Courier under-remitted COD funds by BDT 100 (Assessed unapproved transit insurance charge).',
        notes: 'Steadfast booking manifest specified BDT 2,450 COD, but remittance batch paid only BDT 2,350.'
      },
      // 3. Table 5: Returned Products (Reverse)
      (() => {
        const ret203 = returnParcels.find(p => p.traceId === 'TR-RET-203');
        const isScanned = isRet203Scanned;
        const overcharge = ret203?.vector1OverchargeVarianceBDT ?? 30;
        const billedFee = ret203?.returnFeeBDT ?? 90;
        const capFee = ret203?.contractReturnFeeBDT ?? 60;
        const isSla = ret203?.returnChargeReconStatus === 'SLA_BREACH_WAIVED';

        if (isScanned) {
          if (isSla) {
            return {
              id: 'sme-row-03',
              traceId: 'TR-RET-203',
              orderId: 'FB-ORD-5503',
              trxId: 'RDX-RET-703',
              rowCategoryKey: 'T5_RETURN' as const,
              rowCategoryName: 'Table 5: Returned Products (Reverse)',
              customerName: 'Rafiqul Islam',
              customerPhone: '01811223344',
              channelPartner: 'RedX Courier Return',
              grossOrderBDT: 2200,
              mfsCreditBDT: 0,
              courierCodBDT: 'ABSENT' as const,
              deliveryFeeBDT: billedFee,
              netBankSettledBDT: 0,
              varianceGapBDT: -billedFee,
              status: 'RETURN_RECEIVED_IN_WAREHOUSE' as const,
              statusLabel: 'RESTOCKED: SLA FEE WAIVED',
              statusBadgeClasses: 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40',
              tooltip: `Return verified: Physical barcode scanned at warehouse gate. SLA threshold breached (${ret203?.deltaDaysInTransit || 7}d in hub) -> Return fee BDT 0 allowable. Full BDT ${billedFee} courier fee disputed.`,
              notes: 'Gate-Keeper scanner confirmed package receipt. Inventory restocked. Courier return fee 100% blocked under SLA clause.'
            };
          } else if (overcharge > 0) {
            return {
              id: 'sme-row-03',
              traceId: 'TR-RET-203',
              orderId: 'FB-ORD-5503',
              trxId: 'RDX-RET-703',
              rowCategoryKey: 'T5_RETURN' as const,
              rowCategoryName: 'Table 5: Returned Products (Reverse)',
              customerName: 'Rafiqul Islam',
              customerPhone: '01811223344',
              channelPartner: 'RedX Courier Return',
              grossOrderBDT: 2200,
              mfsCreditBDT: 0,
              courierCodBDT: 'ABSENT' as const,
              deliveryFeeBDT: billedFee,
              netBankSettledBDT: capFee,
              varianceGapBDT: -overcharge,
              status: 'RETURN_RECEIVED_IN_WAREHOUSE' as const,
              statusLabel: `RESTOCKED: OVERCHARGE (+BDT ${overcharge})`,
              statusBadgeClasses: 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40',
              tooltip: `Physical barcode scanned at warehouse gate & inventory restocked. HOWEVER: RedX billed BDT ${billedFee} return fee vs Contract Cap BDT ${capFee}. Overcharge of BDT ${overcharge} flagged for remittance clawback.`,
              notes: `Physical receipt confirmed. Return charge financial reconciliation flagged +BDT ${overcharge} excess courier fee.`
            };
          } else {
            return {
              id: 'sme-row-03',
              traceId: 'TR-RET-203',
              orderId: 'FB-ORD-5503',
              trxId: 'RDX-RET-703',
              rowCategoryKey: 'T5_RETURN' as const,
              rowCategoryName: 'Table 5: Returned Products (Reverse)',
              customerName: 'Rafiqul Islam',
              customerPhone: '01811223344',
              channelPartner: 'RedX Courier Return',
              grossOrderBDT: 2200,
              mfsCreditBDT: 0,
              courierCodBDT: 'ABSENT' as const,
              deliveryFeeBDT: billedFee,
              netBankSettledBDT: billedFee,
              varianceGapBDT: 0,
              status: 'RETURN_RECEIVED_IN_WAREHOUSE' as const,
              statusLabel: 'RESTOCKED: CHARGE VALIDATED',
              statusBadgeClasses: 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40',
              tooltip: `Return verified: Physical barcode scanned at warehouse gate. Return fee of BDT ${billedFee} validated against contract.`,
              notes: 'Gate-Keeper scanner confirmed package receipt at Tejgaon warehouse bay 2. Stock restored, hold cleared, return fee validated.'
            };
          }
        }

        return {
          id: 'sme-row-03',
          traceId: 'TR-RET-203',
          orderId: 'FB-ORD-5503',
          trxId: 'RDX-RET-703',
          rowCategoryKey: 'T5_RETURN' as const,
          rowCategoryName: 'Table 5: Returned Products (Reverse)',
          customerName: 'Rafiqul Islam',
          customerPhone: '01811223344',
          channelPartner: 'RedX Courier Return',
          grossOrderBDT: 2200,
          mfsCreditBDT: 0,
          courierCodBDT: 'ABSENT' as const,
          deliveryFeeBDT: billedFee,
          netBankSettledBDT: 'ABSENT' as const,
          varianceGapBDT: -billedFee,
          status: 'GHOST_RETURN_EXCEPTION' as const,
          statusLabel: 'GHOST RETURN (DEBIT BLOCKED)',
          statusBadgeClasses: 'bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/40 animate-pulse',
          tooltip: `Parcel marked returned by courier, but return fee deducted with zero physical warehouse gate check-in. BDT ${billedFee} debit blocked.`,
          notes: 'Debit hold enforced. Physical parcel missing from Tejgaon warehouse receiving log.'
        };
      })(),
      // 4. Table 2: Cash on Delivery (100% COD)
      {
        id: 'sme-row-04',
        traceId: 'TR-SME-COD-01',
        orderId: 'FB-ORD-5499',
        trxId: 'PTH-COD-9912',
        rowCategoryKey: 'T2_COD',
        rowCategoryName: 'Table 2: Cash on Delivery (100% COD)',
        customerName: 'Zubair Hossain',
        customerPhone: '01933551122',
        channelPartner: 'Pathao Courier COD',
        grossOrderBDT: 1950,
        mfsCreditBDT: 0,
        courierCodBDT: 1950,
        deliveryFeeBDT: 90,
        netBankSettledBDT: 1860,
        varianceGapBDT: 0,
        status: 'MATCHED',
        statusLabel: 'MATCHED',
        statusBadgeClasses: 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40',
        tooltip: '100% COD verified: Doorstep cash collected by rider. Pathao deducted BDT 90 freight, net BDT 1,860 remitted to merchant account.',
        notes: 'Pathao remittance report ref PTH-SETTL-5499 cleared in Dutch-Bangla Bank.'
      },
      // 5. Table 4: Free Delivery (Zero Charge)
      {
        id: 'sme-row-05',
        traceId: 'TR-SME-FRE-01',
        orderId: 'FB-ORD-5488',
        trxId: 'BK-FRE-7721',
        rowCategoryKey: 'T4_FREE',
        rowCategoryName: 'Table 4: Free Delivery (Zero Charge)',
        customerName: 'Tania Sultana',
        customerPhone: '01722334455',
        channelPartner: 'Steadfast (Promo Subsidized)',
        grossOrderBDT: 1400,
        mfsCreditBDT: 1400,
        courierCodBDT: 0,
        deliveryFeeBDT: 70,
        netBankSettledBDT: 1330,
        varianceGapBDT: 0,
        status: 'MATCHED',
        statusLabel: 'MATCHED',
        statusBadgeClasses: 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40',
        tooltip: 'Campaign promo verified: Steadfast deducted contractual BDT 70 delivery fee, subsidized by merchant Marketing Ledger EXP-MKTG-SHP-5488. Zero fee charged to customer.',
        notes: 'Zero delivery fee charged to buyer on Facebook page. Steadfast courier shipping fee BDT 70 absorbed by promo budget; net BDT 1,330 realized.'
      },
      // 6. Table 1: Pre-Payment (100% MFS)
      {
        id: 'sme-row-06',
        traceId: 'TR-SME-2026-P06',
        orderId: 'FB-ORD-5506',
        trxId: 'NG-9K72MM091',
        rowCategoryKey: 'T1_PREPAID',
        rowCategoryName: 'Table 1: Pre-Payment (100% MFS)',
        customerName: 'Mehedi Hasan',
        customerPhone: '01822490182',
        channelPartner: 'Nagad Merchant + RedX Courier',
        grossOrderBDT: 2450,
        mfsCreditBDT: 2450,
        courierCodBDT: 0,
        deliveryFeeBDT: 80,
        netBankSettledBDT: 2370,
        varianceGapBDT: 0,
        status: 'MATCHED',
        statusLabel: 'MATCHED',
        statusBadgeClasses: 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40',
        tooltip: '100% Verified: Full advance Nagad payment mapped to FB-ORD-5506. RedX delivery fee BDT 80 accounted for; net BDT 2,370 cleared in bank.',
        notes: 'Facebook messenger conversation order ref matched Nagad TrxID NG-9K72MM091. RedX parcel consignment RDX-90182 verified.'
      }
    ];
  }, [auditRecords, returnParcels]);

  // Totals calculations
  const totalExpected = unifiedTrackBRows.reduce((acc, r) => acc + r.grossOrderBDT, 0);
  const totalSettled = unifiedTrackBRows.reduce((acc, r) => acc + (typeof r.netBankSettledBDT === 'number' ? r.netBankSettledBDT : 0), 0);
  const totalVariance = Math.abs(unifiedTrackBRows.reduce((acc, r) => acc + r.varianceGapBDT, 0));
  const anomaliesCount = unifiedTrackBRows.filter(r => r.varianceGapBDT !== 0).length;

  return (
    <div className="space-y-6 relative">
      {/* 2-Second Execution Animation Overlay in High-Contrast Obsidian & Yellow */}
      {isTrackBAuditRunning && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121212] border-2 border-[#FACC15] rounded-2xl max-w-lg w-full p-6 font-mono text-xs shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3 text-[#FACC15] font-black">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 animate-spin" />
                <span>TRACK B SIMULTANEOUS DUAL-ENGINE</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#050505] text-[#FACC15] border border-[#FACC15]/40 font-bold">
                EXECUTING
              </span>
            </div>

            <div className="space-y-2 py-2">
              <div className="p-3 rounded-xl bg-[#050505] border border-[#27272A] text-[#FFFFFF]">
                <div className="font-bold text-[#FACC15]">[DUAL MATRIX ALIGNMENT]</div>
                Aligning bKash/Nagad statement TrxIDs with Steadfast/Pathao COD remittance batches...
              </div>
              <div className="p-3 rounded-xl bg-[#050505] border border-[#27272A] text-[#FFFFFF]">
                <div className="font-bold text-[#22C55E]">[VECTOR DISCREPANCY AUDIT]</div>
                Generating net cash settlements &amp; flagging unlinked F-commerce deposits...
              </div>
            </div>

            <div className="w-full bg-[#050505] h-2 rounded-full overflow-hidden border border-[#27272A]">
              <div className="bg-gradient-to-r from-[#FACC15] via-[#EAB308] to-[#22C55E] h-full w-full animate-[pulse_1s_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner & Operating Logic */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#050505] border border-[#FACC15] flex items-center justify-center text-[#FACC15] shrink-0">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold text-[#FACC15] tracking-wider">
                  Category B: Track B SME
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#050505] text-[#FACC15] border border-[#FACC15]/40 font-bold">
                  Dual-File Portal
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#FFFFFF] font-mono tracking-tight mt-0.5">
                Simultaneous Dual-File Reconciling Area
              </h2>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-[#050505] border border-[#27272A] text-xs font-mono text-[#A1A1AA] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#FACC15] shrink-0" />
            <span>No checkout APIs or cron jobs required. Upload MFS &amp; Courier files together.</span>
          </div>
        </div>

        {/* Triple Upload Dropzone (Side-by-Side: MFS, Courier, and Bank) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Dropzone A: Upload bKash/Nagad MFS Statement CSV */}
          <div
            onDragOver={e => { e.preventDefault(); setDragMfs(true); }}
            onDragLeave={() => setDragMfs(false)}
            onDrop={handleDropMfs}
            className={`p-4 rounded-xl border-2 border-dashed transition-all relative ${
              dragMfs
                ? 'bg-[#050505] border-[#FACC15] ring-2 ring-[#FACC15]/20'
                : trackBMfsUploaded
                ? 'bg-[#050505] border-[#27272A]'
                : 'bg-[#050505] border-[#27272A] hover:border-[#FACC15]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-[#FACC15] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></span>
                Dropzone A (Required)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                trackBMfsUploaded ? 'bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/40' : 'bg-[#121212] text-[#A1A1AA]'
              }`}>
                {trackBMfsUploaded ? '✅ Uploaded' : 'Required'}
              </span>
            </div>

            <div className="mt-2 text-center">
              <UploadCloud className="w-6 h-6 text-[#FACC15] mx-auto" />
              <div className="text-xs font-bold text-[#FFFFFF] font-mono mt-1 truncate" title={trackBMfsFileName}>
                {trackBMfsFileName}
              </div>
              <p className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">
                bKash / Nagad MFS Statement CSV
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#A1A1AA]">Samples:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    uploadTrackBMfsFile('bKash_Merchant_Sept08.csv');
                    setUploadFeedback('Loaded bKash merchant statement');
                    setTimeout(() => setUploadFeedback(null), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#FACC15] border border-[#27272A] transition-colors text-[9px] font-bold"
                >
                  bKash
                </button>
                <button
                  type="button"
                  onClick={() => {
                    uploadTrackBMfsFile('Nagad_Merchant_Sept08.csv');
                    setUploadFeedback('Loaded Nagad merchant statement');
                    setTimeout(() => setUploadFeedback(null), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#FACC15] border border-[#27272A] transition-colors text-[9px] font-bold"
                >
                  Nagad
                </button>
              </div>
            </div>

            <label className="absolute inset-0 cursor-pointer opacity-0" title="Click or drop to update MFS statement">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    uploadTrackBMfsFile(f.name);
                    setUploadFeedback(`Updated MFS Statement: ${f.name}`);
                    setTimeout(() => setUploadFeedback(null), 3500);
                  }
                }}
              />
            </label>
          </div>

          {/* Dropzone B: Upload 3PL Courier Settlement CSV */}
          <div
            onDragOver={e => { e.preventDefault(); setDragCourier(true); }}
            onDragLeave={() => setDragCourier(false)}
            onDrop={handleDropCourier}
            className={`p-4 rounded-xl border-2 border-dashed transition-all relative ${
              dragCourier
                ? 'bg-[#050505] border-[#06B6D4] ring-2 ring-[#06B6D4]/20'
                : trackBCourierUploaded
                ? 'bg-[#050505] border-[#27272A]'
                : 'bg-[#050505] border-[#27272A] hover:border-[#06B6D4]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-[#06B6D4] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"></span>
                Dropzone B (Required)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                trackBCourierUploaded ? 'bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/40' : 'bg-[#121212] text-[#A1A1AA]'
              }`}>
                {trackBCourierUploaded ? '✅ Uploaded' : 'Required'}
              </span>
            </div>

            <div className="mt-2 text-center">
              <UploadCloud className="w-6 h-6 text-[#06B6D4] mx-auto" />
              <div className="text-xs font-bold text-[#FFFFFF] font-mono mt-1 truncate" title={trackBCourierFileName}>
                {trackBCourierFileName}
              </div>
              <p className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">
                3PL Courier Remittance CSV
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#A1A1AA]">Samples:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    uploadTrackBCourierFile('Steadfast_Remit_Sept08.csv');
                    setUploadFeedback('Loaded Steadfast Remittance file');
                    setTimeout(() => setUploadFeedback(null), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#06B6D4] border border-[#27272A] transition-colors text-[9px] font-bold"
                >
                  Steadfast
                </button>
                <button
                  type="button"
                  onClick={() => {
                    uploadTrackBCourierFile('Pathao_Settlement_Sept08.csv');
                    setUploadFeedback('Loaded Pathao Settlement file');
                    setTimeout(() => setUploadFeedback(null), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#06B6D4] border border-[#27272A] transition-colors text-[9px] font-bold"
                >
                  Pathao
                </button>
              </div>
            </div>

            <label className="absolute inset-0 cursor-pointer opacity-0" title="Click or drop to update Courier remittance">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    uploadTrackBCourierFile(f.name);
                    setUploadFeedback(`Updated Courier File: ${f.name}`);
                    setTimeout(() => setUploadFeedback(null), 3500);
                  }
                }}
              />
            </label>
          </div>

          {/* Dropzone C: Bank File (Optional) */}
          <div
            onDragOver={e => { e.preventDefault(); setDragBank(true); }}
            onDragLeave={() => setDragBank(false)}
            onDrop={handleDropBank}
            className={`p-4 rounded-xl border-2 border-dashed transition-all relative ${
              dragBank
                ? 'bg-[#050505] border-[#FFFFFF] ring-2 ring-white/20'
                : trackBBankUploaded
                ? 'bg-[#050505] border-[#27272A]'
                : 'bg-[#050505] border-[#27272A] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-[#A1A1AA] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Dropzone C (Bank File)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                trackBBankUploaded ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40' : 'bg-[#121212] text-[#A1A1AA] border border-[#27272A]'
              }`}>
                {trackBBankUploaded ? '✅ Attached' : 'Optional'}
              </span>
            </div>

            <div className="mt-2 text-center">
              <FileText className={`w-6 h-6 mx-auto ${trackBBankUploaded ? 'text-[#22C55E]' : 'text-[#A1A1AA]'}`} />
              <div className="text-xs font-bold text-[#FFFFFF] font-mono mt-1 truncate" title={trackBBankFileName}>
                {trackBBankUploaded ? trackBBankFileName : 'Bank statement (Optional)'}
              </div>
              <p className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">
                Optional 3-way check against bank credit
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono">
              {trackBBankUploaded ? (
                <>
                  <span className="text-[#22C55E] font-semibold">Attached for 3-way check</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTrackBBankFile();
                      setUploadFeedback('Detached optional bank statement');
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
                      uploadTrackBBankFile('City_Bank_Deposit_Sept08.csv');
                      setUploadFeedback('Attached City Bank statement (Optional)');
                      setTimeout(() => setUploadFeedback(null), 3000);
                    }}
                    className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A] transition-colors text-[9px] font-bold z-10"
                  >
                    + Attach City Bank
                  </button>
                </>
              )}
            </div>

            <label className="absolute inset-0 cursor-pointer opacity-0" title="Click or drop to attach optional bank statement">
              <input
                type="file"
                accept=".csv,.pdf,.xlsx"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    uploadTrackBBankFile(f.name);
                    setUploadFeedback(`Updated Bank File: ${f.name}`);
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

        {/* Quick Link to Return Policy Page */}
        <div className="mt-3 px-4 py-2.5 rounded-xl bg-[#050505] border border-[#27272A] flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#FFFFFF]">
            <span className="px-2 py-0.5 rounded-full bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/40 text-[10px] font-bold">
              RETURN AUDIT
            </span>
            <span className="text-[#A1A1AA]">Unsure about return parcel fee deductions or warehouse scans?</span>
          </div>
          <button
            onClick={() => setActivePage('return-policy')}
            className="text-[#FACC15] hover:text-[#EAB308] underline text-[11px] font-semibold shrink-0"
          >
            Open Return Policy &amp; Scanned Table →
          </button>
        </div>

        {/* Action Trigger */}
        <div className="mt-5 pt-4 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-mono text-[#A1A1AA]">
            Mapping Matrix: <span className="text-[#FACC15] font-semibold">Facebook Order Inbox ↔ MFS Bank Statement ↔ Courier Remittance</span>
          </div>

          <button
            id="execute-dual-audit-btn"
            onClick={runTrackBDualAudit}
            disabled={!trackBMfsUploaded || !trackBCourierUploaded}
            className="px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FACC15]/10 transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-[#050505]" />
            <span>Execute Simultaneous Dual-File Reconciliation</span>
          </button>
        </div>
      </div>

      {/* Synchronized Reconciled Audit Table */}
      {trackBAuditExecuted && (
        <UnifiedAuditResultsTable
          currentCategory="Track B SME"
          rows={unifiedTrackBRows}
          totalExpectedVolumeBDT={totalExpected}
          totalSettledVolumeBDT={totalSettled}
          totalVarianceGapBDT={totalVariance}
          anomaliesCount={anomaliesCount}
        />
      )}
    </div>
  );
};
