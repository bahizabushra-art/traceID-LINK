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
  ArrowRight,
  Download,
  FileSpreadsheet,
  RefreshCcw,
  Check,
  Zap,
  CheckCheck
} from 'lucide-react';
import { 
  parseAndReconcileUserFiles, 
  downloadCsvFile, 
  SAMPLE_MFS_CSV, 
  SAMPLE_COURIER_CSV, 
  ParsedCsvResult 
} from '../../utils/csvReconEngine';

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

  // User uploaded custom file contents
  const [customMfsContent, setCustomMfsContent] = useState<string | null>(null);
  const [customCourierContent, setCustomCourierContent] = useState<string | null>(null);
  const [userParsedResult, setUserParsedResult] = useState<ParsedCsvResult | null>(null);

  // Function to read and ingest custom user files
  const processUploadedFile = (file: File, type: 'mfs' | 'courier' | 'bank') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      if (type === 'mfs') {
        setCustomMfsContent(text);
        uploadTrackBMfsFile(file.name);
        setUploadFeedback(`Ingested custom MFS statement: ${file.name} (${file.size} bytes)`);

        // If courier is also provided, run parse engine
        const courierText = customCourierContent || SAMPLE_COURIER_CSV;
        const res = parseAndReconcileUserFiles(text, courierText, file.name, trackBCourierFileName || 'Steadfast_Remittance_Sample.csv');
        setUserParsedResult(res);
      } else if (type === 'courier') {
        setCustomCourierContent(text);
        uploadTrackBCourierFile(file.name);
        setUploadFeedback(`Ingested custom Courier statement: ${file.name} (${file.size} bytes)`);

        // If MFS is also provided, run parse engine
        const mfsText = customMfsContent || SAMPLE_MFS_CSV;
        const res = parseAndReconcileUserFiles(mfsText, text, trackBMfsFileName || 'bKash_Merchant_Sample.csv', file.name);
        setUserParsedResult(res);
      } else if (type === 'bank') {
        uploadTrackBBankFile(file.name);
        setUploadFeedback(`Attached Bank Statement for 3-way check: ${file.name}`);
      }
      setTimeout(() => setUploadFeedback(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleDropMfs = (e: React.DragEvent) => {
    e.preventDefault();
    setDragMfs(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0], 'mfs');
    }
  };

  const handleDropCourier = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCourier(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0], 'courier');
    }
  };

  const handleDropBank = (e: React.DragEvent) => {
    e.preventDefault();
    setDragBank(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0], 'bank');
    }
  };

  // Revert custom upload back to the default benchmark sample
  const handleResetToStandardSample = () => {
    setCustomMfsContent(null);
    setCustomCourierContent(null);
    setUserParsedResult(null);
    uploadTrackBMfsFile('bKash_Merchant_Sept08.csv');
    uploadTrackBCourierFile('Steadfast_Remit_Sept08.csv');
    setUploadFeedback('Reset to standard Dhaka Merchant benchmark dataset');
    setTimeout(() => setUploadFeedback(null), 3000);
  };

  // Convert Track B records into the exact 11-column UnifiedAuditRow structure
  const unifiedTrackBRows: UnifiedAuditRow[] = useMemo(() => {
    // If the user uploaded their own CSV statements, use the parsed mathematical rows!
    if (userParsedResult && userParsedResult.rows.length > 0) {
      return userParsedResult.rows;
    }

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
        courierCodBDT: 2450,
        deliveryFeeBDT: 100,
        netBankSettledBDT: 2500,
        varianceGapBDT: 0,
        status: 'MATCHED',
        statusLabel: 'MATCHED',
        statusBadgeClasses: 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40',
        tooltip: 'Twin-pulse reconciliation verified: BDT 150 delivery charge paid via bKash advance; BDT 2,450 remaining collected via Steadfast COD. Steadfast fee BDT 100 accounted for.',
        notes: 'Both legs cross-matched. Customer paid partial advance to confirm order.'
      },
      // 3. Table 2: 100% COD
      {
        id: 'sme-row-03',
        traceId: 'TR-SME-2026-P03',
        orderId: 'FB-ORD-5503',
        trxId: 'COD-ST-99120',
        rowCategoryKey: 'T2_COD',
        rowCategoryName: 'Table 2: 100% Cash On Delivery',
        customerName: 'Farhana Yasmin',
        customerPhone: '01933581029',
        channelPartner: 'Steadfast Courier',
        grossOrderBDT: 1850,
        mfsCreditBDT: 0,
        courierCodBDT: 1850,
        deliveryFeeBDT: 100,
        netBankSettledBDT: 1750,
        varianceGapBDT: 0,
        status: 'MATCHED',
        statusLabel: 'MATCHED',
        statusBadgeClasses: 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40',
        tooltip: 'Full COD remittance cleared. Customer paid BDT 1,850 in cash; Steadfast remitted net BDT 1,750 after deducting BDT 100 delivery charge.',
        notes: 'Standard 100% COD delivery in Chittagong region.'
      },
      // 4. Discrepancy 1: Under-remitted COD
      {
        id: 'sme-row-04',
        traceId: 'TR-SME-2026-P04',
        orderId: 'FB-ORD-5504',
        trxId: 'COD-PT-44810',
        rowCategoryKey: 'T2_COD',
        rowCategoryName: 'Table 2: 100% Cash On Delivery',
        customerName: 'Arif Chowdhury',
        customerPhone: '01677291044',
        channelPartner: 'Pathao Courier',
        grossOrderBDT: 2400,
        mfsCreditBDT: 0,
        courierCodBDT: 2300,
        deliveryFeeBDT: 120,
        netBankSettledBDT: 2180,
        varianceGapBDT: -100,
        status: 'UNDER_REMITTED',
        statusLabel: 'UNDER-REMITTED (-BDT 100)',
        statusBadgeClasses: 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 font-bold',
        tooltip: 'Discrepancy: Customer receipt shows BDT 2,400 collected; Pathao remittance report indicates only BDT 2,300 collected. Net gap of BDT 100 flagged.',
        notes: 'Delivery agent remittance discrepancy. Clawback ticket #PT-CLAW-901 generated.'
      },
      // 5. Discrepancy 2: Overcharge Delivery Fee
      {
        id: 'sme-row-05',
        traceId: 'TR-SME-2026-P05',
        orderId: 'FB-ORD-5505',
        trxId: 'COD-ST-88219',
        rowCategoryKey: 'T2_COD',
        rowCategoryName: 'Table 2: 100% Cash On Delivery',
        customerName: 'Shahadat Hossain',
        customerPhone: '01555201948',
        channelPartner: 'Steadfast Courier',
        grossOrderBDT: 1400,
        mfsCreditBDT: 0,
        courierCodBDT: 1400,
        deliveryFeeBDT: 130,
        netBankSettledBDT: 1270,
        varianceGapBDT: -30,
        status: 'UNDER_REMITTED',
        statusLabel: 'OVERCHARGE (-BDT 30)',
        statusBadgeClasses: 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 font-bold',
        tooltip: 'Overcharge: Standard inside-Dhaka parcel SLA contract rate is BDT 100, but Steadfast deducted BDT 130 freight fee. Excess BDT 30 deduction caught.',
        notes: 'Courier billed remote zone rate for central Dhanmondi address. Overcharge dispute filed.'
      },
      // 6. Return Parcel Scanned vs Unscanned
      {
        id: 'sme-row-06',
        traceId: 'TR-RET-203',
        orderId: 'FB-ORD-5507',
        trxId: 'RET-ST-203',
        rowCategoryKey: 'RETURN_SCANNED',
        rowCategoryName: 'Return Parcel: Delivery Failed',
        customerName: 'Nusrat Jahan',
        customerPhone: '01711902847',
        channelPartner: 'Steadfast Courier',
        grossOrderBDT: 2100,
        mfsCreditBDT: 0,
        courierCodBDT: 0,
        deliveryFeeBDT: 50,
        netBankSettledBDT: isRet203Scanned ? -50 : -50,
        varianceGapBDT: isRet203Scanned ? 0 : -2100,
        status: isRet203Scanned ? 'RETURN_RECONCILED' : 'RETURN_DEFICIT',
        statusLabel: isRet203Scanned ? 'RETURN INVENTORY VERIFIED' : 'GHOST RETURN (-BDT 2,100)',
        statusBadgeClasses: isRet203Scanned 
          ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 font-bold'
          : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 font-black animate-pulse',
        tooltip: isRet203Scanned
          ? 'Physical parcel barcode verified at Dhaka warehouse scanner. Return return freight fee BDT 50 accounted for.'
          : 'ALARM: Steadfast marked order as "Returned to Merchant", but parcel barcode has NOT been scanned in merchant warehouse. Inventory deficit of BDT 2,100 flagged.',
        notes: isRet203Scanned
          ? 'Barcode scanned by operator. Inventory restocked.'
          : 'Ghost return audit protocol triggered. Courier SLA claim in progress.'
      },
      // 7. Table 1: Nagad Advance Payment
      {
        id: 'sme-row-07',
        traceId: 'TR-SME-2026-P06',
        orderId: 'FB-ORD-5506',
        trxId: 'NG-9K72MM091',
        rowCategoryKey: 'T1_PREPAID',
        rowCategoryName: 'Table 1: Pre-Payment (100% Nagad)',
        customerName: 'Mehedi Hasan',
        customerPhone: '01799281039',
        channelPartner: 'Nagad + RedX Courier',
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
  }, [auditRecords, returnParcels, userParsedResult]);

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
                Calculating Bank Sum balance: &Sigma;(MFS) + &Sigma;(COD) - &Sigma;(Fees) = Net Settled...
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
                  Dual-File Ingestion Portal
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#FFFFFF] font-mono tracking-tight mt-0.5">
                Simultaneous Dual-File Reconciling Area
              </h2>
            </div>
          </div>

          {/* Download Sample CSV Templates */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadCsvFile('bKash_Merchant_Statement_Sample.csv', SAMPLE_MFS_CSV)}
              className="px-3 py-1.5 rounded-lg bg-[#050505] hover:bg-zinc-800 border border-[#27272A] text-[#FACC15] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Download sample bKash statement CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample MFS CSV</span>
            </button>
            <button
              type="button"
              onClick={() => downloadCsvFile('Steadfast_Remittance_Invoice_Sample.csv', SAMPLE_COURIER_CSV)}
              className="px-3 py-1.5 rounded-lg bg-[#050505] hover:bg-zinc-800 border border-[#27272A] text-[#06B6D4] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Download sample Steadfast courier remittance CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample Courier CSV</span>
            </button>
          </div>
        </div>

        {/* Custom Data Ingestion Active Notification */}
        {userParsedResult && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white">Custom Files Parsed &amp; Reconciled:</strong> {userParsedResult.fileName} ({userParsedResult.rowCount} rows processed)
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-300">
                Matched: {userParsedResult.matchedCount} | Discrepancies: {userParsedResult.discrepancyCount}
              </span>
              <button
                type="button"
                onClick={handleResetToStandardSample}
                className="px-2.5 py-1 rounded bg-black hover:bg-zinc-900 border border-emerald-500/40 text-white hover:text-emerald-300 transition-colors flex items-center gap-1 text-[11px]"
              >
                <RefreshCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        )}

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
                    setUploadFeedback('Loaded bKash merchant statement sample');
                    setTimeout(() => setUploadFeedback(null), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#FACC15] border border-[#27272A] transition-colors text-[9px] font-bold cursor-pointer"
                >
                  bKash
                </button>
                <button
                  type="button"
                  onClick={() => {
                    uploadTrackBMfsFile('Nagad_Merchant_Sept08.csv');
                    setUploadFeedback('Loaded Nagad merchant statement sample');
                    setTimeout(() => setUploadFeedback(null), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#FACC15] border border-[#27272A] transition-colors text-[9px] font-bold cursor-pointer"
                >
                  Nagad
                </button>
              </div>
            </div>

            <label className="absolute inset-0 cursor-pointer opacity-0" title="Click or drop your actual MFS statement CSV">
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    processUploadedFile(e.target.files[0], 'mfs');
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
                    setUploadFeedback('Loaded Steadfast Remittance sample');
                    setTimeout(() => setUploadFeedback(null), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#06B6D4] border border-[#27272A] transition-colors text-[9px] font-bold cursor-pointer"
                >
                  Steadfast
                </button>
                <button
                  type="button"
                  onClick={() => {
                    uploadTrackBCourierFile('Pathao_Settlement_Sept08.csv');
                    setUploadFeedback('Loaded Pathao Settlement sample');
                    setTimeout(() => setUploadFeedback(null), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#06B6D4] border border-[#27272A] transition-colors text-[9px] font-bold cursor-pointer"
                >
                  Pathao
                </button>
              </div>
            </div>

            <label className="absolute inset-0 cursor-pointer opacity-0" title="Click or drop your actual Courier remittance CSV">
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    processUploadedFile(e.target.files[0], 'courier');
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
                    className="text-[#EF4444] hover:underline z-10 cursor-pointer"
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
                    className="px-2 py-0.5 rounded bg-[#121212] hover:bg-zinc-800 text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#27272A] transition-colors text-[9px] font-bold z-10 cursor-pointer"
                  >
                    + Attach City Bank
                  </button>
                </>
              )}
            </div>

            <label className="absolute inset-0 cursor-pointer opacity-0" title="Click or drop to attach optional bank statement">
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    processUploadedFile(e.target.files[0], 'bank');
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
            className="text-[#FACC15] hover:text-[#EAB308] underline text-[11px] font-semibold shrink-0 cursor-pointer"
          >
            Open Return Policy &amp; Scanned Table →
          </button>
        </div>

        {/* Action Trigger */}
        <div className="mt-5 pt-4 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-mono text-[#A1A1AA]">
            Mathematical Ledger: <span className="text-[#FACC15] font-semibold">Net Payout = &Sigma;(MFS) + &Sigma;(COD) - &Sigma;(Freight Fees)</span>
          </div>

          <button
            id="execute-dual-audit-btn"
            onClick={runTrackBDualAudit}
            disabled={!trackBMfsUploaded || !trackBCourierUploaded}
            className="px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FACC15]/10 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-[#050505]" />
            <span>Execute Simultaneous Dual-File Reconciliation</span>
          </button>
        </div>
      </div>

      {/* Synchronized Reconciled Audit Table */}
      {trackBAuditExecuted && (
        <UnifiedAuditResultsTable
          currentCategory={userParsedResult ? "Custom Merchant Upload" : "Track B SME"}
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
