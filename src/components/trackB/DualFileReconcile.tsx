import React, { useState, useMemo } from 'react';
import { useRecon } from '../../context/ReconContext';
import { useAuth } from '../../context/AuthContext';
import { UnifiedAuditRow } from '../../types';
import { UnifiedAuditResultsTable } from '../shared/UnifiedAuditResultsTable';
import { 
  GitCompare, 
  UploadCloud, 
  Play, 
  FileText, 
  Download, 
  FileSpreadsheet, 
  RefreshCcw, 
  Check, 
  CheckCheck, 
  Trash2,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  parseAndReconcileUserFiles, 
  downloadCsvFile, 
  SAMPLE_MFS_CSV, 
  SAMPLE_COURIER_CSV, 
  ParsedCsvResult,
  DEFAULT_TRACK_B_BENCHMARK_RESULT
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
    clearTrackBFiles,
    isTrackBAuditRunning,
    runTrackBDualAudit,
    setActivePage
  } = useRecon();
  const { user, logout } = useAuth();

  const [dragMfs, setDragMfs] = useState<boolean>(false);
  const [dragCourier, setDragCourier] = useState<boolean>(false);
  const [dragBank, setDragBank] = useState<boolean>(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // File processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  // User uploaded custom file contents & structured results
  const [customMfsContent, setCustomMfsContent] = useState<string | null>(null);
  const [customCourierContent, setCustomCourierContent] = useState<string | null>(null);
  const [userParsedResult, setUserParsedResult] = useState<ParsedCsvResult | null>(null);
  const [hasExplicitlyCleared, setHasExplicitlyCleared] = useState<boolean>(false);

  // Helper to extract clean text/CSV from CSV, Excel (.xlsx, .xls) and PDF files
  const extractFileContent = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();

    // 1. Handle Excel files (.xlsx, .xls)
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error('Excel workbook contains no sheets');
      const sheet = workbook.Sheets[firstSheetName];
      return XLSX.utils.sheet_to_csv(sheet);
    }

    // 2. Handle PDF statement files
    if (fileName.endsWith('.pdf')) {
      const rawText = await file.text();
      try {
        const res = await fetch('/api/statements/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: rawText.substring(0, 50000), fileName: file.name })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.rows && data.rows.length > 0) {
            const csvLines = [
              'Date,Reference,TrxID,Description,Debit,Credit',
              ...data.rows.map((r: any) => `${r.date || ''},${r.reference || ''},${r.trxId || ''},"${(r.description || '').replace(/"/g, '""')}",${r.debit || 0},${r.credit || 0}`)
            ];
            return csvLines.join('\n');
          }
        }
      } catch (err) {
        console.warn('PDF statement parsing error, falling back to text:', err);
      }
      return rawText;
    }

    // 3. Standard CSV / TSV / TXT
    return await file.text();
  };

  // Ingests custom user CSV/Excel/PDF files
  const processUploadedFile = async (file: File, type: 'mfs' | 'courier' | 'bank') => {
    setIsProcessing(true);
    setProcessingStatus(`Parsing ${file.name} format...`);

    try {
      const text = await extractFileContent(file);

      if (type === 'bank') {
        uploadTrackBBankFile(file.name);
        try {
          const res = await fetch('/api/statements/parse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text.substring(0, 50000), fileName: file.name })
          });
          if (res.ok) {
            const data = await res.json();
            const totalCredit = data.summary?.totalCredit || 0;
            const rowsCount = data.summary?.rowCount || data.rows?.length || 0;
            setUploadFeedback(`Attached Bank Statement: ${file.name} (${rowsCount} entries, BDT ${totalCredit.toLocaleString()} credits verified)`);
          } else {
            setUploadFeedback(`Attached Bank Statement: ${file.name}`);
          }
        } catch {
          setUploadFeedback(`Attached Bank Statement: ${file.name}`);
        }
        setTimeout(() => setUploadFeedback(null), 4500);
        return;
      }

      setProcessingStatus(`Structuring records in ${file.name}...`);

      if (type === 'mfs') {
        setCustomMfsContent(text);
        uploadTrackBMfsFile(file.name);
        setUploadFeedback(`Uploaded payment statement: ${file.name}`);

        const courierText = customCourierContent || '';
        if (courierText) {
          setProcessingStatus('Matching payment and courier statements...');
          const res = await parseAndReconcileUserFiles(text, courierText, file.name, trackBCourierFileName || 'courier_statement.csv');
          setUserParsedResult(res);
        } else {
          const res = await parseAndReconcileUserFiles(text, '', file.name, 'Awaiting Courier Statement');
          setUserParsedResult(res);
        }
      } else if (type === 'courier') {
        setCustomCourierContent(text);
        uploadTrackBCourierFile(file.name);
        setUploadFeedback(`Uploaded courier remittance: ${file.name}`);

        const mfsText = customMfsContent || '';
        if (mfsText) {
          setProcessingStatus('Matching payment and courier statements...');
          const res = await parseAndReconcileUserFiles(mfsText, text, trackBMfsFileName || 'mfs_statement.csv', file.name);
          setUserParsedResult(res);
        } else {
          const res = await parseAndReconcileUserFiles('', text, 'Awaiting Payment Statement', file.name);
          setUserParsedResult(res);
        }
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setUploadFeedback(`Error reading file: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      setTimeout(() => setUploadFeedback(null), 4000);
    }
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

  // Loads benchmark sample statements
  const handleLoadBenchmarkSample = async () => {
    setIsProcessing(true);
    setProcessingStatus('Loading sample statements...');
    
    uploadTrackBMfsFile('bKash_Merchant_Sample.csv');
    uploadTrackBCourierFile('Steadfast_Remittance_Sample.csv');
    setCustomMfsContent(SAMPLE_MFS_CSV);
    setCustomCourierContent(SAMPLE_COURIER_CSV);

    try {
      const res = await parseAndReconcileUserFiles(
        SAMPLE_MFS_CSV,
        SAMPLE_COURIER_CSV,
        'bKash_Merchant_Sample.csv',
        'Steadfast_Remittance_Sample.csv'
      );
      setUserParsedResult(res);
      setUploadFeedback('Sample statements loaded and matched successfully');
    } catch (err: any) {
      console.error('Benchmark load error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      setHasExplicitlyCleared(false);
      setTimeout(() => setUploadFeedback(null), 3500);
    }
  };

  // Resets to clean workspace
  const handleClearAllFiles = () => {
    setCustomMfsContent(null);
    setCustomCourierContent(null);
    setUserParsedResult(null);
    setHasExplicitlyCleared(true);
    clearTrackBFiles();
    setUploadFeedback('All statements cleared.');
    setTimeout(() => setUploadFeedback(null), 3000);
  };

  // Output rows to display
  const unifiedTrackBRows: UnifiedAuditRow[] = useMemo(() => {
    if (userParsedResult && userParsedResult.rows.length > 0) {
      return userParsedResult.rows;
    }
    if (hasExplicitlyCleared) {
      return [];
    }
    return DEFAULT_TRACK_B_BENCHMARK_RESULT.rows;
  }, [userParsedResult, hasExplicitlyCleared]);

  const totalExpected = unifiedTrackBRows.reduce((acc, r) => acc + r.grossOrderBDT, 0);
  const totalSettled = unifiedTrackBRows.reduce((acc, r) => acc + (typeof r.netBankSettledBDT === 'number' ? r.netBankSettledBDT : 0), 0);
  const totalVariance = Math.abs(unifiedTrackBRows.reduce((acc, r) => acc + r.varianceGapBDT, 0));
  const anomaliesCount = unifiedTrackBRows.filter(r => r.varianceGapBDT !== 0).length;

  return (
    <div className="space-y-6 relative">
      
      {/* Execution Animation Overlay */}
      {isTrackBAuditRunning && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121214] border border-zinc-700 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto">
              <RefreshCcw className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Reconciling Statements</h3>
              <p className="text-xs text-zinc-400 mt-1">Cross-referencing payment transactions with delivery settlements...</p>
            </div>
            <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div className="bg-amber-400 h-full w-full animate-[pulse_1s_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {/* File Processing Loader Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121214] border border-zinc-700 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Processing Statement File</h3>
              <p className="text-xs text-zinc-400 mt-1">{processingStatus || 'Parsing rows and mapping transaction IDs...'}</p>
            </div>
            <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div className="bg-amber-400 h-full w-full animate-[pulse_1s_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Trial Header Notice */}
      {user?.isGuest && (
        <div className="px-4 py-2.5 rounded-xl bg-[#0F0F12] border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white">Trial Mode:</strong> You are testing reconciliation with your data.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              setActivePage('login');
            }}
            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Sign In to Save Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Statement Ingestion Panel */}
      <div className="bg-[#0F0F12] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Payment &amp; Courier Reconciliation
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload your payment gateway and courier delivery remittance statements to detect payout variances.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadBenchmarkSample}
              className="px-3 py-1.5 rounded-lg bg-black hover:bg-zinc-900 border border-zinc-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Test with sample statements"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Load Sample Statements</span>
            </button>

            {unifiedTrackBRows.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllFiles}
                className="px-3 py-1.5 rounded-lg bg-black hover:bg-rose-950/40 border border-rose-900/50 text-rose-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Clear all statements and reset"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Files</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => downloadCsvFile('bKash_Merchant_Sample.csv', SAMPLE_MFS_CSV)}
              className="px-3 py-1.5 rounded-lg bg-black hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Download sample payment gateway statement"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample MFS</span>
            </button>
            <button
              type="button"
              onClick={() => downloadCsvFile('Steadfast_Remittance_Sample.csv', SAMPLE_COURIER_CSV)}
              className="px-3 py-1.5 rounded-lg bg-black hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Download sample courier remittance statement"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample Courier</span>
            </button>
          </div>
        </div>

        {/* Custom Data Ingestion Active Notification */}
        {userParsedResult && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white">Statements Processed:</strong> {userParsedResult.fileName} ({userParsedResult.rowCount} records analyzed)
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-300">
                Matched: {userParsedResult.matchedCount} | Discrepancies: {userParsedResult.discrepancyCount}
              </span>
              <button
                type="button"
                onClick={handleClearAllFiles}
                className="px-2.5 py-1 rounded bg-black hover:bg-zinc-900 border border-emerald-500/40 text-white hover:text-emerald-300 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <RefreshCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}

        {/* Triple Upload Dropzone (Side-by-Side: MFS, Courier, and Bank) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Dropzone 1: Upload MFS Statement */}
          <div
            onDragOver={e => { e.preventDefault(); setDragMfs(true); }}
            onDragLeave={() => setDragMfs(false)}
            onDrop={handleDropMfs}
            className={`p-4 rounded-xl border-2 border-dashed transition-all relative ${
              dragMfs
                ? 'bg-black border-amber-400 ring-2 ring-amber-400/20'
                : trackBMfsUploaded
                ? 'bg-black border-zinc-800'
                : 'bg-black border-zinc-800 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Payment Gateway Statement
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                trackBMfsUploaded ? 'bg-amber-400/15 text-amber-400 border border-amber-400/40' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {trackBMfsUploaded ? 'Loaded' : 'Required'}
              </span>
            </div>

            <div className="mt-3 text-center">
              <UploadCloud className="w-6 h-6 text-amber-400 mx-auto" />
              <div className="text-xs font-semibold text-white mt-1.5 truncate" title={trackBMfsFileName || 'Upload Payment Statement'}>
                {trackBMfsFileName || 'Drop bKash / Nagad Statement'}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Drop CSV, Excel (.xlsx), or PDF
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-850 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Supported:</span>
              <span className="text-zinc-300">bKash, Nagad, Upay, Rocket</span>
            </div>

            <label className="absolute inset-0 cursor-pointer opacity-0" title="Click or drop your actual MFS statement (CSV, Excel, PDF)">
              <input
                type="file"
                accept=".csv,.txt,.tsv,.xlsx,.xls,.pdf"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    processUploadedFile(e.target.files[0], 'mfs');
                  }
                }}
              />
            </label>
          </div>

          {/* Dropzone 2: Upload Courier Settlement CSV */}
          <div
            onDragOver={e => { e.preventDefault(); setDragCourier(true); }}
            onDragLeave={() => setDragCourier(false)}
            onDrop={handleDropCourier}
            className={`p-4 rounded-xl border-2 border-dashed transition-all relative ${
              dragCourier
                ? 'bg-black border-cyan-400 ring-2 ring-cyan-400/20'
                : trackBCourierUploaded
                ? 'bg-black border-zinc-800'
                : 'bg-black border-zinc-800 hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Courier Remittance Statement
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                trackBCourierUploaded ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/40' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {trackBCourierUploaded ? 'Loaded' : 'Required'}
              </span>
            </div>

            <div className="mt-3 text-center">
              <FileSpreadsheet className="w-6 h-6 text-cyan-400 mx-auto" />
              <div className="text-xs font-semibold text-white mt-1.5 truncate" title={trackBCourierFileName || 'Upload Courier Remittance'}>
                {trackBCourierFileName || 'Drop Courier Remittance Statement'}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Drop CSV, Excel (.xlsx), or PDF
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-850 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Supported:</span>
              <span className="text-zinc-300">Steadfast, Pathao, RedX, Paperfly</span>
            </div>

            <label className="absolute inset-0 cursor-pointer opacity-0" title="Click or drop your actual Courier remittance (CSV, Excel, PDF)">
              <input
                type="file"
                accept=".csv,.txt,.tsv,.xlsx,.xls,.pdf"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    processUploadedFile(e.target.files[0], 'courier');
                  }
                }}
              />
            </label>
          </div>

          {/* Dropzone 3: Bank File (Optional) */}
          <div
            onDragOver={e => { e.preventDefault(); setDragBank(true); }}
            onDragLeave={() => setDragBank(false)}
            onDrop={handleDropBank}
            className={`p-4 rounded-xl border-2 border-dashed transition-all relative ${
              dragBank
                ? 'bg-black border-white ring-2 ring-white/20'
                : trackBBankUploaded
                ? 'bg-black border-zinc-800'
                : 'bg-black border-zinc-800 hover:border-zinc-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                Bank Statement (Optional)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                trackBBankUploaded ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/40' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {trackBBankUploaded ? 'Attached' : 'Optional'}
              </span>
            </div>

            <div className="mt-3 text-center">
              <FileText className={`w-6 h-6 mx-auto ${trackBBankUploaded ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <div className="text-xs font-semibold text-white mt-1.5 truncate" title={trackBBankFileName || 'Bank Statement (Optional)'}>
                {trackBBankUploaded ? trackBBankFileName : 'Bank statement (Optional)'}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Optional 3-way check against bank credit (.csv, .xlsx, .pdf)
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-850 flex items-center justify-between text-[11px]">
              {trackBBankUploaded ? (
                <>
                  <span className="text-emerald-400 font-semibold">Attached for verification</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTrackBBankFile();
                      setUploadFeedback('Detached optional bank statement');
                      setTimeout(() => setUploadFeedback(null), 3000);
                    }}
                    className="text-rose-400 hover:underline z-10 cursor-pointer"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <span className="text-zinc-500">City Bank, Dhaka Bank, EBL</span>
              )}
            </div>

            <label className="absolute inset-0 cursor-pointer opacity-0" title="Click or drop to attach optional bank statement">
              <input
                type="file"
                accept=".csv,.txt,.tsv,.xlsx,.xls,.pdf"
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
          <div className="mt-3 px-3.5 py-2 rounded-xl bg-black border border-emerald-600/40 text-xs text-emerald-400 flex items-center justify-between animate-fadeIn">
            <span>{uploadFeedback}</span>
            <button onClick={() => setUploadFeedback(null)} className="text-zinc-500 hover:text-white cursor-pointer">✕</button>
          </div>
        )}

        {/* Action Trigger */}
        <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-zinc-400">
            Formula: <span className="text-amber-400 font-medium">Net Payout = Gross Order Value - Courier Fees - Gateway Deductions</span>
          </div>

          <button
            id="execute-dual-audit-btn"
            onClick={runTrackBDualAudit}
            disabled={!trackBMfsUploaded || !trackBCourierUploaded}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-400/10 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Run Reconciliation</span>
          </button>
        </div>
      </div>

      {/* Output Table */}
      <UnifiedAuditResultsTable
        currentCategory="Track B SME"
        rows={unifiedTrackBRows}
        totalExpectedVolumeBDT={totalExpected}
        totalSettledVolumeBDT={totalSettled}
        totalVarianceGapBDT={totalVariance}
        anomaliesCount={anomaliesCount}
      />
    </div>
  );
};
