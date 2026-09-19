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
  CheckCheck,
  Sparkles,
  Layers,
  Trash2
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
    clearTrackBFiles,
    isTrackBAuditRunning,
    trackBAuditExecuted,
    runTrackBDualAudit,
    setActivePage
  } = useRecon();

  const [dragMfs, setDragMfs] = useState<boolean>(false);
  const [dragCourier, setDragCourier] = useState<boolean>(false);
  const [dragBank, setDragBank] = useState<boolean>(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Groq LLM Processing & Telemetry State
  const [isGroqProcessing, setIsGroqProcessing] = useState<boolean>(false);
  const [groqStatusMsg, setGroqStatusMsg] = useState<string>('');
  const [groqTelemetry, setGroqTelemetry] = useState<{
    engine: string;
    model: string;
    detectedFormats?: { mfs?: string; courier?: string };
  } | null>(null);

  // User uploaded custom file contents & structured results
  const [customMfsContent, setCustomMfsContent] = useState<string | null>(null);
  const [customCourierContent, setCustomCourierContent] = useState<string | null>(null);
  const [userParsedResult, setUserParsedResult] = useState<ParsedCsvResult | null>(null);

  // Ingests custom user CSV/TXT files and triggers Groq structuring
  const processUploadedFile = async (file: File, type: 'mfs' | 'courier' | 'bank') => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = (e.target?.result as string) || '';
      
      if (type === 'bank') {
        uploadTrackBBankFile(file.name);
        setUploadFeedback(`Attached Bank Statement for 3-way check: ${file.name}`);
        setTimeout(() => setUploadFeedback(null), 4000);
        return;
      }

      setIsGroqProcessing(true);
      setGroqStatusMsg(`Groq LLaMA-3.3 70B is analyzing raw columns in ${file.name}...`);

      try {
        if (type === 'mfs') {
          setCustomMfsContent(text);
          uploadTrackBMfsFile(file.name);
          setUploadFeedback(`Ingested MFS statement: ${file.name} (${file.size} bytes)`);

          const courierText = customCourierContent || '';
          if (courierText) {
            setGroqStatusMsg('Groq LLM cross-structuring MFS & Courier statements...');
            const res = await parseAndReconcileUserFiles(text, courierText, file.name, trackBCourierFileName || 'courier_statement.csv');
            setUserParsedResult(res);
            setGroqTelemetry({
              engine: res.engineUsed || 'Groq LLaMA-3.3 70B AI Engine',
              model: 'llama-3.3-70b-versatile',
              detectedFormats: res.detectedFormats
            });
          } else {
            // Single-file preview until courier is dropped
            const res = await parseAndReconcileUserFiles(text, '', file.name, 'Awaiting Courier Statement');
            setUserParsedResult(res);
            setGroqTelemetry({
              engine: res.engineUsed || 'Groq LLaMA-3.3 70B AI Engine',
              model: 'llama-3.3-70b-versatile',
              detectedFormats: res.detectedFormats
            });
          }
        } else if (type === 'courier') {
          setCustomCourierContent(text);
          uploadTrackBCourierFile(file.name);
          setUploadFeedback(`Ingested Courier statement: ${file.name} (${file.size} bytes)`);

          const mfsText = customMfsContent || '';
          if (mfsText) {
            setGroqStatusMsg('Groq LLM cross-structuring MFS & Courier statements...');
            const res = await parseAndReconcileUserFiles(mfsText, text, trackBMfsFileName || 'mfs_statement.csv', file.name);
            setUserParsedResult(res);
            setGroqTelemetry({
              engine: res.engineUsed || 'Groq LLaMA-3.3 70B AI Engine',
              model: 'llama-3.3-70b-versatile',
              detectedFormats: res.detectedFormats
            });
          } else {
            // Single-file preview until MFS is dropped
            const res = await parseAndReconcileUserFiles('', text, 'Awaiting MFS Statement', file.name);
            setUserParsedResult(res);
            setGroqTelemetry({
              engine: res.engineUsed || 'Groq LLaMA-3.3 70B AI Engine',
              model: 'llama-3.3-70b-versatile',
              detectedFormats: res.detectedFormats
            });
          }
        }
      } catch (err: any) {
        console.error('File parsing error:', err);
        setUploadFeedback(`Structuring error: ${err.message}`);
      } finally {
        setIsGroqProcessing(false);
        setGroqStatusMsg('');
        setTimeout(() => setUploadFeedback(null), 4000);
      }
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

  // Loads benchmark messy CSV statements with Groq LLM for demonstration
  const handleLoadBenchmarkSample = async () => {
    setIsGroqProcessing(true);
    setGroqStatusMsg('Groq LLaMA-3.3 70B is analyzing and structuring benchmark statements...');
    
    uploadTrackBMfsFile('bKash_Merchant_Benchmark_Sept08.csv');
    uploadTrackBCourierFile('Steadfast_Remit_Benchmark_Sept08.csv');
    setCustomMfsContent(SAMPLE_MFS_CSV);
    setCustomCourierContent(SAMPLE_COURIER_CSV);

    try {
      const res = await parseAndReconcileUserFiles(
        SAMPLE_MFS_CSV,
        SAMPLE_COURIER_CSV,
        'bKash_Merchant_Sept08.csv',
        'Steadfast_Remit_Sept08.csv'
      );
      setUserParsedResult(res);
      setGroqTelemetry({
        engine: res.engineUsed || 'Groq LLaMA-3.3 70B AI Engine',
        model: 'llama-3.3-70b-versatile',
        detectedFormats: res.detectedFormats
      });
      setUploadFeedback('Structured benchmark statements via Groq LLM');
    } catch (err: any) {
      console.error('Benchmark load error:', err);
    } finally {
      setIsGroqProcessing(false);
      setGroqStatusMsg('');
      setTimeout(() => setUploadFeedback(null), 3500);
    }
  };

  // Resets to clean workspace with empty data
  const handleClearAllFiles = () => {
    setCustomMfsContent(null);
    setCustomCourierContent(null);
    setUserParsedResult(null);
    setGroqTelemetry(null);
    clearTrackBFiles();
    setUploadFeedback('Cleared uploaded statements. Workspace is ready for your files.');
    setTimeout(() => setUploadFeedback(null), 3000);
  };

  // The output rows to display in the audit table:
  // In production app mode, this is strictly derived from the files dropped by the user!
  const unifiedTrackBRows: UnifiedAuditRow[] = useMemo(() => {
    if (userParsedResult && userParsedResult.rows.length > 0) {
      return userParsedResult.rows;
    }
    // Clean production state: empty until user drops files or loads benchmark demo
    return [];
  }, [userParsedResult]);

  // Totals calculations based strictly on current rows
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

      {/* Groq LLM Structuring Active Loader Modal */}
      {isGroqProcessing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121212] border-2 border-[#F59E0B] rounded-2xl max-w-md w-full p-6 font-mono text-xs shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#050505] border border-[#F59E0B] text-[#F59E0B] flex items-center justify-center mx-auto shadow-lg shadow-[#F59E0B]/20">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>Groq LLaMA-3.3 70B Inference</span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
                {groqStatusMsg || 'Analyzing messy CSV statements, matching headers, and normalizing columns...'}
              </p>
            </div>
            <div className="w-full bg-[#050505] h-2 rounded-full overflow-hidden border border-[#27272A]">
              <div className="bg-gradient-to-r from-[#F59E0B] via-[#EAB308] to-[#22C55E] h-full w-full animate-[pulse_0.8s_infinite]"></div>
            </div>
            <div className="text-[10px] text-[#A1A1AA]">
              Hardware accelerated via Groq LPU™ · Ultra-low latency parsing
            </div>
          </div>
        </div>
      )}

      {/* Top Banner & Groq LLM Control Engine */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                  Production App Ingestion
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#FFFFFF] font-mono tracking-tight mt-0.5">
                Simultaneous Dual-File Reconciling Area
              </h2>
            </div>
          </div>

          {/* Groq LLM Badge & Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-[#050505] border border-[#F59E0B]/50 text-[#F59E0B] text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Groq LLaMA-3.3 70B Engine Ready</span>
            </div>

            <button
              type="button"
              onClick={handleLoadBenchmarkSample}
              className="px-3 py-1.5 rounded-lg bg-[#050505] hover:bg-zinc-800 border border-[#27272A] text-[#FACC15] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Test with messy sample statements structured by Groq"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Test with Demo Statements</span>
            </button>

            {unifiedTrackBRows.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllFiles}
                className="px-3 py-1.5 rounded-lg bg-[#050505] hover:bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Clear all statements and reset table"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Files</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => downloadCsvFile('bKash_Merchant_Statement_Sample.csv', SAMPLE_MFS_CSV)}
              className="px-3 py-1.5 rounded-lg bg-[#050505] hover:bg-zinc-800 border border-[#27272A] text-[#A1A1AA] hover:text-[#FFFFFF] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Download sample bKash statement CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample MFS</span>
            </button>
            <button
              type="button"
              onClick={() => downloadCsvFile('Steadfast_Remittance_Invoice_Sample.csv', SAMPLE_COURIER_CSV)}
              className="px-3 py-1.5 rounded-lg bg-[#050505] hover:bg-zinc-800 border border-[#27272A] text-[#A1A1AA] hover:text-[#FFFFFF] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Download sample Steadfast courier remittance CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample Courier</span>
            </button>
          </div>
        </div>

        {/* Explanatory Context for Messy CSVs */}
        <div className="mt-4 p-3 rounded-xl bg-[#050505] border border-[#27272A] text-xs font-mono text-[#A1A1AA] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">LLM-Powered Messy CSV Structuring:</strong> Drop raw statements directly from bKash, Nagad, Pathao, Steadfast, or RedX.
            The embedded <span className="text-[#FACC15] font-bold">Groq LLaMA-3.3 70B</span> model strips report headers/preambles, resolves messy column naming (e.g. &apos;Trx ID&apos; vs &apos;Transaction ID&apos;), cleans unquoted currency formatting, and standardizes records into the output table below.
          </div>
        </div>

        {/* Custom Data Ingestion Active Notification */}
        {userParsedResult && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white">Structured &amp; Reconciled:</strong> {userParsedResult.fileName} ({userParsedResult.rowCount} rows processed)
                {groqTelemetry && (
                  <span className="ml-2 text-[11px] px-2 py-0.5 rounded bg-black/60 border border-emerald-500/40 text-[#FACC15]">
                    Engine: {groqTelemetry.engine}
                  </span>
                )}
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
                {trackBMfsUploaded ? '✅ Dropped' : 'Awaiting File'}
              </span>
            </div>

            <div className="mt-2 text-center">
              <UploadCloud className="w-6 h-6 text-[#FACC15] mx-auto" />
              <div className="text-xs font-bold text-[#FFFFFF] font-mono mt-1 truncate" title={trackBMfsFileName || 'Drop MFS Statement'}>
                {trackBMfsFileName || 'Drop bKash / Nagad Statement'}
              </div>
              <p className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">
                {trackBMfsUploaded ? 'File parsed via Groq LLM' : 'Drop CSV or click to browse'}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#A1A1AA]">Supported:</span>
              <span className="text-[#FACC15]">bKash, Nagad, Upay, Rocket</span>
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
                {trackBCourierUploaded ? '✅ Dropped' : 'Awaiting File'}
              </span>
            </div>

            <div className="mt-2 text-center">
              <FileSpreadsheet className="w-6 h-6 text-[#06B6D4] mx-auto" />
              <div className="text-xs font-bold text-[#FFFFFF] font-mono mt-1 truncate" title={trackBCourierFileName || 'Drop Courier Remittance'}>
                {trackBCourierFileName || 'Drop Courier Remittance CSV'}
              </div>
              <p className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">
                {trackBCourierUploaded ? 'File parsed via Groq LLM' : 'Drop CSV or click to browse'}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#A1A1AA]">Supported:</span>
              <span className="text-[#06B6D4]">Steadfast, Pathao, RedX, Paperfly</span>
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
              <div className="text-xs font-bold text-[#FFFFFF] font-mono mt-1 truncate" title={trackBBankFileName || 'Bank Statement (Optional)'}>
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
                <span className="text-[#A1A1AA]">City Bank, Dhaka Bank, EBL</span>
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
            <button onClick={() => setUploadFeedback(null)} className="text-[#A1A1AA] hover:text-[#FFFFFF] cursor-pointer">✕</button>
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

      {/* Output Table: Always displays the output from the dropped files (or awaiting state if empty) */}
      <UnifiedAuditResultsTable
        currentCategory={userParsedResult ? "Custom Merchant Statement Output" : "Dual-File Statement Output"}
        rows={unifiedTrackBRows}
        totalExpectedVolumeBDT={totalExpected}
        totalSettledVolumeBDT={totalSettled}
        totalVarianceGapBDT={totalVariance}
        anomaliesCount={anomaliesCount}
      />
    </div>
  );
};
