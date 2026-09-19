import React, { useState } from 'react';
import { useRecon } from '../../context/ReconContext';
import { 
  Barcode, 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  Zap,
  RotateCcw,
  Camera,
  Layers,
  Search
} from 'lucide-react';

export const WarehouseScanner: React.FC = () => {
  const { 
    scanBarcode, 
    warehouseScanHistory, 
    auditRecords,
    setActivePage,
    currentTrack 
  } = useRecon();

  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isScanningAnimation, setIsScanningAnimation] = useState<boolean>(false);

  // Check if TR-RET-203 is resolved
  const ret203Record = auditRecords.find(r => r.traceId === 'TR-RET-203');
  const is203Resolved = ret203Record?.resolved;

  const handleScan = (codeToScan?: string) => {
    const targetCode = (codeToScan || barcodeInput).trim();
    if (!targetCode) return;

    setIsScanningAnimation(true);
    setTimeout(() => {
      setIsScanningAnimation(false);
      const res = scanBarcode(targetCode);
      setFeedback(res);
      setBarcodeInput('');
    }, 400);
  };

  const sampleTargets = [
    { code: 'TR-RET-203', badge: 'GHOST RETURN EXCEPTION', desc: 'Steadfast ghost return billed without parcel' },
    { code: 'TR-RET-202', badge: 'HUB STALLED 14D', desc: 'SLA breached courier transit gap' },
    { code: 'TR-RET-201', badge: 'PENALTY OVERCHARGE', desc: 'BDT 110 fee vs BDT 60 contract cap' },
    { code: 'TR-COD-7701', badge: 'TRACK A COD RETURN', desc: 'Standard Pathao return parcel' },
    { code: 'TR-SME-9912', badge: 'TRACK B SME RETURN', desc: 'Paperfly reverse parcel' }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Info Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121212] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-[#FACC15]" />
            <h2 className="text-base font-bold text-[#FFFFFF] font-mono uppercase tracking-wide">
              Warehouse & Shop Gate-Keeper Barcode Terminal
            </h2>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1 font-medium">
            Physical receiving gate verification: scanning returned packages auto-resolves Ghost Return penalties across enterprise audit tables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActivePage('returns')}
            className="px-3.5 py-2 rounded-xl bg-[#050505] hover:bg-zinc-900 border border-[#FACC15]/40 text-[#FACC15] text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm min-h-[44px] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Return Audit Terminal →</span>
          </button>

          {is203Resolved ? (
            <span className="px-3 py-2 rounded-xl bg-[#050505] text-[#22C55E] border border-[#22C55E]/40 text-xs font-mono font-bold flex items-center gap-1.5 min-h-[44px]">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>TR-RET-203 RESOLVED</span>
            </span>
          ) : (
            <span className="px-3 py-2 rounded-xl bg-[#050505] text-[#A855F7] border border-[#A855F7]/40 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse min-h-[44px]">
              <AlertTriangle className="w-4 h-4 text-[#A855F7]" />
              <span>TR-RET-203 Awaiting Gate Scan</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Barcode Operation Workspace: Responsive for Android, Tab, Laptop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Responsive Handheld Scanner */}
        <div className="lg:col-span-6 w-full space-y-4">
          <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FFFFFF]">
                <Camera className="w-4 h-4 text-[#FACC15]" />
                <span>CAMERA / OPTICAL SCANNER VIEWFINDER</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 font-bold">
                LASER ARMED
              </span>
            </div>

            {/* Camera Viewfinder Screen - Responsive Height & Touch-to-Scan */}
            <div 
              onClick={() => handleScan('TR-RET-203')}
              title="Tap viewfinder to simulate optical scan"
              className="bg-[#050505] p-4 rounded-xl border border-[#27272A] relative overflow-hidden h-48 sm:h-56 flex flex-col items-center justify-center cursor-pointer active:scale-[0.99] transition-transform select-none group"
            >
              {/* Corner Reticles */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#FACC15]"></div>
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#FACC15]"></div>
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#FACC15]"></div>
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#FACC15]"></div>

              {/* Red Laser Scanning Line */}
              <div className={`absolute inset-x-4 h-0.5 bg-[#EF4444] shadow-[0_0_12px_#ef4444] transition-all duration-700 ${
                isScanningAnimation ? 'top-1/2 scale-x-110 opacity-100' : 'top-1/3 opacity-70 animate-bounce'
              }`}></div>

              {/* Mock Barcode in Viewfinder */}
              <div className="text-center space-y-2 select-none">
                <div className="flex justify-center items-end gap-1 h-14 opacity-50">
                  {[2, 5, 3, 7, 2, 8, 4, 3, 6, 2, 7, 4, 3, 8, 2, 6, 4, 7].map((h, i) => (
                    <div key={i} className="bg-[#FACC15] w-1 sm:w-1.5 rounded-xs" style={{ height: `${h * 6}px` }}></div>
                  ))}
                </div>
                <div className="text-xs font-mono font-bold text-[#FACC15]">
                  ALIGN PHYSICAL BARCODE IN RETICLE
                </div>
                <span className="text-[10px] font-mono text-[#A1A1AA] bg-[#121212] px-2 py-0.5 rounded border border-[#27272A] inline-block">
                  📱 Mobile tap enabled: Tap anywhere inside to scan
                </span>
              </div>

              {isScanningAnimation && (
                <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-xs flex items-center justify-center font-mono text-[#FACC15] text-xs font-bold animate-pulse">
                  DECODING TRACEID BARCODE...
                </div>
              )}
            </div>

            {/* Manual Barcode Input & Scan Button - Touch targets ≥48px */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-xs text-[#A1A1AA] block mb-1.5 font-semibold">
                  Manual Barcode / TraceID Key-In:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="warehouse-barcode-input"
                    type="text"
                    value={barcodeInput}
                    onChange={e => setBarcodeInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleScan()}
                    placeholder="e.g. TR-RET-203"
                    className="flex-1 bg-[#050505] border border-[#27272A] rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-zinc-600 text-sm sm:text-xs focus:outline-none focus:border-[#FACC15] uppercase min-h-[48px]"
                  />
                  <button
                    id="warehouse-simulate-scan-btn"
                    type="button"
                    onClick={() => handleScan()}
                    disabled={isScanningAnimation || !barcodeInput.trim()}
                    className="px-5 py-3 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#FACC15]/20 shrink-0 min-h-[48px] disabled:opacity-40 cursor-pointer active:scale-[0.98]"
                  >
                    <Scan className="w-4 h-4 stroke-[2.5]" />
                    <span>CHECK-IN PARCEL</span>
                  </button>
                </div>
              </div>

              {/* Feedback alert */}
              {feedback && (
                <div className={`p-3.5 rounded-xl text-xs font-mono border animate-fadeIn ${
                  feedback.success
                    ? 'bg-[#050505] text-[#22C55E] border-[#22C55E]'
                    : 'bg-[#050505] text-[#EF4444] border-[#EF4444]'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{feedback.message}</span>
                  </div>
                  {feedback.success && (
                    <p className="text-[11px] text-[#A1A1AA] mt-1 font-sans">
                      Shadow ledger updated: <span className="text-[#22C55E] font-bold">RETURN_RECEIVED_IN_WAREHOUSE</span>. Discrepancy flags cleared.
                    </p>
                  )}
                </div>
              )}

              {/* Quick One-Tap Simulation Presets - Touch Friendly */}
              <div className="pt-2">
                <div className="text-xs text-[#A1A1AA] font-semibold mb-2 flex items-center justify-between">
                  <span>⚡ Quick Tap Parcels (Phone / Tab / Laptop):</span>
                  <span className="text-[10px] text-[#FACC15]">One-Touch Intake</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sampleTargets.map(t => (
                    <button
                      key={t.code}
                      type="button"
                      onClick={() => handleScan(t.code)}
                      className="p-3 rounded-xl bg-[#050505] hover:bg-zinc-900 border border-[#27272A] hover:border-[#FACC15] text-left transition-all cursor-pointer min-h-[48px] flex flex-col justify-center active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#FACC15]">{t.code}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-[#A1A1AA] font-semibold">
                          SCAN
                        </span>
                      </div>
                      <span className="text-[10px] text-[#A1A1AA] truncate mt-0.5 font-sans">
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Operational Logic & Real-Time Scan History */}
        <div className="lg:col-span-6 w-full space-y-4">
          {/* Target Impact Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121212] border border-[#27272A] font-mono text-xs shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <span className="text-[#FACC15] font-bold uppercase flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#FACC15]" />
                Cross-System Reactive Reconciliation
              </span>
              <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/30 font-bold">
                Zero-Latency Broadcast
              </span>
            </div>

            <p className="text-[#A1A1AA] font-sans text-xs leading-relaxed">
              When physical returns arrive at the receiving gate, scanning the package barcode pushes an immediate state change (<code className="text-[#22C55E]">RETURN_RECEIVED_IN_WAREHOUSE</code>) into the shadow ledger, clearing Ghost Return penalties in real time.
            </p>

            <div className="p-3.5 rounded-xl bg-[#050505] border border-[#27272A] space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Primary Target Anomaly:</span>
                <span className="text-[#A855F7] font-bold">[GHOST RETURN] TR-RET-203</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Current Ledger Status:</span>
                {is203Resolved ? (
                  <span className="text-[#22C55E] font-bold">✅ RETURN_RECEIVED_IN_WAREHOUSE (Resolved)</span>
                ) : (
                  <span className="text-[#EF4444] font-bold">❌ ABSENT AT GATE (Penalty Contested)</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Financial Protection:</span>
                <span className="text-[#FFFFFF]">
                  {is203Resolved ? 'BDT 90 RedX fee blocked from payment' : 'BDT 90 ghost penalty actively challenged'}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Scan Intake History */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121212] border border-[#27272A] font-mono text-xs shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2 font-bold text-[#FFFFFF]">
                <Clock className="w-4 h-4 text-[#FACC15]" />
                <span>RECENT PHYSICAL INTAKE LOGS</span>
              </div>
              <span className="text-[10px] text-[#A1A1AA]">
                {warehouseScanHistory.length} Scanned Today
              </span>
            </div>

            {warehouseScanHistory.length === 0 ? (
              <div className="p-6 text-center text-[#A1A1AA] bg-[#050505] rounded-xl border border-[#27272A]">
                No parcel scanned in this session yet. Use the camera viewport or tap any preset button above!
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {warehouseScanHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#050505] border border-[#27272A] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#FACC15]">{item.barcode}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 font-bold">
                          {item.resolvedStatus}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#A1A1AA] mt-0.5 block">
                        Gate: {item.location} • Op: {item.operator}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#A1A1AA] shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
