import React, { useState } from 'react';
import { useRecon } from '../../context/ReconContext';
import { playScannerBeep } from '../../utils/scannerAudio';
import { 
  Camera, 
  Barcode, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Flashlight
} from 'lucide-react';

interface GlobalQuickScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ScanFilterTab = 'ALL' | 'TRACK_A' | 'TRACK_B' | 'RETURNS';

export const GlobalQuickScanModal: React.FC<GlobalQuickScanModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentTrack, 
    scanReturnedParcel, 
    warehouseId,
    operatorId
  } = useRecon();

  const [inputCode, setInputCode] = useState('');
  const [selectedTab, setSelectedTab] = useState<ScanFilterTab>('ALL');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    targetStatus?: string;
    traceId?: string;
    trackSource?: string;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const targetStatusLabel = currentTrack === 'track-a' 
    ? 'RETURN_RECEIVED_AT_WAREHOUSE' 
    : 'RETURN_RECEIVED_AT_SHOP';

  const handleExecuteScan = (codeToScan?: string) => {
    const code = (codeToScan || inputCode).trim().toUpperCase();
    if (!code) return;

    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      const res = scanReturnedParcel(
        code, 
        currentTrack === 'track-a' ? 'Warehouse Dock Bay 2' : 'Shop Intake Counter 1',
        warehouseId || (currentTrack === 'track-a' ? 'WH-DHK-TEJGAON-01' : 'SHOP-DHAKA-BANANI-02'),
        operatorId || 'OP-SCANNER-409'
      );

      if (isSoundEnabled) {
        if (res.success) {
          playScannerBeep('success');
        } else {
          playScannerBeep('alert');
        }
      }

      setIsScanning(false);
      
      const isTrackBCode = code.includes('SME') || code.includes('FB-ORD');
      const isTrackACode = code.includes('COD-101') || code.includes('PRE-100') || code.includes('SPLIT-103') || code.includes('FRE-107');

      setScanResult({
        success: res.success,
        message: res.message,
        targetStatus: targetStatusLabel,
        traceId: code,
        trackSource: isTrackBCode ? 'Track B: SME Social Commerce' : isTrackACode ? 'Track A: Enterprise API' : 'Universal Reconciled'
      });
      setInputCode(code);
    }, 320);
  };

  const sampleBarcodes = [
    // Returns / Reverse Logistics (Critical for both Track A and Track B)
    { 
      code: 'TR-RET-203', 
      label: 'TR-RET-203', 
      tag: 'RETURNS', 
      track: 'BOTH',
      scheme: 'Table 5: Reverse Logistics',
      note: 'Ghost Return Exception (Releases Debit Hold & Clears BDT 90 Penalty)' 
    },
    { 
      code: 'TR-RET-201', 
      label: 'TR-RET-201', 
      tag: 'RETURNS', 
      track: 'BOTH',
      scheme: 'Table 5: Reverse Logistics',
      note: 'Contractual Overcharge Penalty Check-in (BDT 110 Cap)' 
    },
    { 
      code: 'TR-RET-202', 
      label: 'TR-RET-202', 
      tag: 'RETURNS', 
      track: 'BOTH',
      scheme: 'Table 5: Reverse Logistics',
      note: '14-Day Stalled Hub Retention Physical Receipt' 
    },
    
    // Track A Enterprise Automated Stream
    { 
      code: 'TR-COD-101', 
      label: 'TR-COD-101 (ORD-1001)', 
      tag: 'TRACK_A', 
      track: 'TRACK_A',
      scheme: 'Table 2: 100% Cash on Delivery',
      note: 'Pathao Courier Doorstep Handover (BDT 60 Fee Deducted)' 
    },
    { 
      code: 'TR-PRE-100', 
      label: 'TR-PRE-100 (ORD-1000)', 
      tag: 'TRACK_A', 
      track: 'TRACK_A',
      scheme: 'Table 1: 100% Prepaid MFS',
      note: 'bKash Direct Gateway Settlement (Net BDT 1,000 Realized)' 
    },
    { 
      code: 'TR-SPLIT-103', 
      label: 'TR-SPLIT-103 (ORD-1003)', 
      tag: 'TRACK_A', 
      track: 'TRACK_A',
      scheme: 'Table 3: Split Advance + COD',
      note: 'Nagad Advance + RedX Doorstep Courier Delivery' 
    },
    { 
      code: 'TR-FRE-107', 
      label: 'TR-FRE-107 (ORD-1007)', 
      tag: 'TRACK_A', 
      track: 'TRACK_A',
      scheme: 'Table 4: Campaign Free Delivery',
      note: 'Pathao Promo Settlement (Contractual BDT 80 Fee Deducted)' 
    },

    // Track B SME Dual-File Stream
    { 
      code: 'TR-SME-2026-P02', 
      label: 'FB-ORD-5502 (TR-SME-P02)', 
      tag: 'TRACK_B', 
      track: 'TRACK_B',
      scheme: 'Table 2: 100% Cash on Delivery',
      note: 'Pathao COD Remittance (Doorstep BDT 1,950 Collected, BDT 90 Fee)' 
    },
    { 
      code: 'TR-SME-2026-P01', 
      label: 'FB-ORD-5501 (TR-SME-P01)', 
      tag: 'TRACK_B', 
      track: 'TRACK_B',
      scheme: 'Table 1: 100% Prepaid MFS',
      note: 'Facebook Messenger Order (bKash Trx CK44PP190X Matched)' 
    },
    { 
      code: 'TR-SME-2026-P04', 
      label: 'FB-ORD-5504 (TR-SME-P04)', 
      tag: 'TRACK_B', 
      track: 'TRACK_B',
      scheme: 'Table 3: Split Advance + COD',
      note: 'Advance Token BK-SP-5504 + Paperfly COD Consignment' 
    },
    { 
      code: 'TR-SME-2026-P05', 
      label: 'FB-ORD-5505 (TR-SME-P05)', 
      tag: 'TRACK_B', 
      track: 'TRACK_B',
      scheme: 'Table 4: Free Delivery Campaign',
      note: 'Steadfast Courier (Customer Charged 0, Contract BDT 70 Fee Deducted)' 
    },
    { 
      code: 'TR-SME-2026-P06', 
      label: 'FB-ORD-5506 (TR-SME-P06)', 
      tag: 'TRACK_B', 
      track: 'TRACK_B',
      scheme: 'Table 1: 100% Prepaid Nagad',
      note: 'Nagad Trx NG-9K72MM091 Matched with RedX Consignment' 
    }
  ];

  const filteredBarcodes = sampleBarcodes.filter(b => {
    if (selectedTab === 'ALL') return true;
    if (selectedTab === 'TRACK_A') return b.track === 'TRACK_A' || b.track === 'BOTH';
    if (selectedTab === 'TRACK_B') return b.track === 'TRACK_B' || b.track === 'BOTH';
    if (selectedTab === 'RETURNS') return b.tag === 'RETURNS';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn font-sans">
      <div 
        className="bg-[#121212] border border-[#27272A] rounded-2xl w-full max-w-xl shadow-2xl shadow-black max-h-[92vh] flex flex-col overflow-hidden relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#27272A] bg-[#050505] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#FACC15] text-[#050505] flex items-center justify-center font-bold shrink-0 shadow-md shadow-[#FACC15]/20">
              <Camera className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#FFFFFF] tracking-tight">
                  Universal Barcode Scan Terminal
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/30 font-bold hidden sm:inline">
                  TRACK A &amp; B READY
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#A1A1AA]">
                Active Node: <span className="text-[#FACC15] font-semibold">{currentTrack === 'track-a' ? 'Enterprise Tejgaon Central WH' : 'SME Banani Retail Hub'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              title={isSoundEnabled ? 'Laser Beep Audio Enabled' : 'Muted'}
              className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#FACC15] hover:bg-zinc-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4 text-[#FACC15]" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
            </button>

            {/* Torch Flashlight Toggle */}
            <button
              type="button"
              onClick={() => setIsTorchOn(!isTorchOn)}
              title={isTorchOn ? 'Torch Light On' : 'Torch Light Off'}
              className={`p-2 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer ${
                isTorchOn ? 'text-[#FACC15] bg-[#FACC15]/15' : 'text-[#A1A1AA] hover:bg-zinc-800'
              }`}
            >
              <Flashlight className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-zinc-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Simulated Camera Viewport with Touch to Scan */}
          <div 
            onClick={() => handleExecuteScan(inputCode || 'TR-RET-203')}
            title="Tap viewport to trigger optical laser barcode scan"
            className={`relative rounded-xl overflow-hidden border-2 border-dashed border-[#FACC15]/60 bg-[#050505] h-40 sm:h-44 flex flex-col items-center justify-center cursor-pointer active:scale-[0.99] transition-all select-none group ${
              isTorchOn ? 'shadow-inner shadow-yellow-500/20 bg-zinc-900/80' : ''
            }`}
          >
            {/* Viewport Corners */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#FACC15]" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#FACC15]" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#FACC15]" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#FACC15]" />

            {/* Laser scanning line animation */}
            <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-[#EF4444] to-transparent shadow-md shadow-[#EF4444] animate-bounce" />

            {/* Torch halo when torch is on */}
            {isTorchOn && (
              <div className="absolute inset-0 bg-yellow-400/5 pointer-events-none" />
            )}

            <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-[#A1A1AA] mb-1.5 group-hover:text-[#FACC15] transition-colors" />
            <span className="text-xs font-mono text-[#FFFFFF] font-bold">
              Optical Camera &amp; Laser Viewport
            </span>
            <span className="text-[10px] font-mono text-[#FACC15] bg-[#FACC15]/10 px-2.5 py-0.5 rounded border border-[#FACC15]/30 mt-1 font-semibold">
              Tap screen to simulate laser gun barcode trigger
            </span>

            {/* Facility status bar */}
            <div className="absolute bottom-2 inset-x-3 flex items-center justify-between text-[10px] font-mono text-[#A1A1AA] bg-[#121212]/90 px-2 py-1 rounded border border-[#27272A]">
              <span>WH: {currentTrack === 'track-a' ? 'WH-DHK-TEJGAON-01' : 'SHOP-BANANI-02'}</span>
              <span className="text-[#22C55E] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                READY (WEB AUDIO &amp; HAPTIC)
              </span>
            </div>
          </div>

          {/* Quick Input Barcode Field - Touch & Keyboard friendly */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-semibold flex items-center justify-between">
              <span>Scan or Enter Barcode / TraceID / Order ID:</span>
              <span className="text-[10px] text-[#FACC15] lowercase">press Enter or tap Verify</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
                  <Barcode className="w-5 h-5 text-[#FACC15]" />
                </div>
                <input
                  id="modal-barcode-input"
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteScan()}
                  placeholder="e.g. TR-RET-203, TR-COD-101, FB-ORD-5502"
                  className="w-full pl-10 pr-3 py-3 bg-[#050505] border border-[#27272A] rounded-xl text-sm sm:text-xs text-[#FFFFFF] font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#FACC15] min-h-[48px]"
                />
              </div>

              <button
                id="modal-verify-scan-btn"
                type="button"
                onClick={() => handleExecuteScan()}
                disabled={isScanning || !inputCode.trim()}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-bold text-xs font-mono tracking-wide shadow-md shadow-[#FACC15]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] shrink-0 active:scale-[0.98]"
              >
                {isScanning ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current stroke-none" />
                    <span>VERIFY SCAN</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code-128 1D Barcode Graphic Simulation if a code is present */}
          {inputCode.trim() && (
            <div className="p-3 bg-[#050505] border border-[#27272A] rounded-xl flex flex-col items-center justify-center">
              <div className="flex items-center gap-[2px] h-9 w-full max-w-xs justify-center overflow-hidden opacity-90">
                {/* Visual barcode lines generated deterministically from input text */}
                {inputCode.split('').map((char, i) => {
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
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#A1A1AA] mt-1 font-bold">
                *{inputCode.toUpperCase()}*
              </span>
            </div>
          )}

          {/* Track Category Filter Tabs for Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#A1A1AA] font-semibold">
                📱 Touch-to-Scan Presets:
              </span>
              <div className="flex items-center gap-1 bg-[#050505] p-0.5 rounded-lg border border-[#27272A] text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedTab('ALL')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    selectedTab === 'ALL' ? 'bg-[#FACC15] text-[#050505]' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTab('TRACK_A')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    selectedTab === 'TRACK_A' ? 'bg-[#FACC15] text-[#050505]' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Track A
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTab('TRACK_B')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    selectedTab === 'TRACK_B' ? 'bg-[#FACC15] text-[#050505]' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Track B
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTab('RETURNS')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    selectedTab === 'RETURNS' ? 'bg-[#A855F7] text-white' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Returns
                </button>
              </div>
            </div>

            {/* Preset Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5 custom-scrollbar">
              {filteredBarcodes.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleExecuteScan(item.code)}
                  className="text-left p-2.5 rounded-xl bg-[#050505] hover:bg-zinc-900 border border-[#27272A] hover:border-[#FACC15] active:border-[#FACC15] active:bg-[#1a1a1a] transition-all cursor-pointer min-h-[50px] flex flex-col justify-center group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#FACC15] group-hover:underline truncate mr-1">
                      {item.code}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      item.tag === 'RETURNS' 
                        ? 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40'
                        : item.track === 'TRACK_A'
                        ? 'bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40'
                        : 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40'
                    }`}>
                      {item.tag === 'RETURNS' ? 'REVERSE' : item.track}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A1A1AA] truncate mt-0.5 font-sans">
                    {item.note}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Scan Execution Feedback Notice */}
          {scanResult && (
            <div className={`p-3.5 rounded-xl border text-xs font-mono animate-fadeIn ${
              scanResult.success 
                ? 'bg-[#050505] border-[#22C55E] text-[#22C55E]' 
                : 'bg-[#050505] border-[#EF4444] text-[#EF4444]'
            }`}>
              <div className="flex items-start gap-2.5">
                {scanResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-2 flex-wrap justify-between">
                    <span>{scanResult.success ? 'CONSIGNMENT / RETURN VERIFIED & CHECKED-IN' : 'SCAN FAILED'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 font-bold">
                      STATE_RECONCILED
                    </span>
                  </div>
                  <p className="text-xs text-[#FFFFFF] mt-1 leading-relaxed">
                    {scanResult.message}
                  </p>
                  <div className="mt-2 text-[11px] text-[#FACC15] flex items-center gap-1.5 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Synchronized across Track A, Track B, Table 5, and Warehouse Ledger in real time.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-[#27272A] bg-[#050505] flex items-center justify-between text-xs font-mono text-[#A1A1AA] shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span className="hidden sm:inline">Zero-latency state broadcast active (Mobile &amp; PC)</span>
            <span className="sm:hidden">Live Sync OK</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs transition-colors min-h-[40px] cursor-pointer"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
