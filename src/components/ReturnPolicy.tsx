import React, { useState, useMemo } from 'react';
import { useRecon } from '../context/ReconContext';
import { formatBDT } from '../data/mockData';
import { 
  RotateCcw, 
  Barcode, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Zap, 
  Layers, 
  Store, 
  Building2, 
  Package, 
  Truck, 
  Info,
  Check, 
  FileCheck2,
  Terminal,
  Eye,
  MapPin,
  Camera,
  Scan,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { ParcelDetailModal } from './return/ParcelDetailModal';
import { ReturnParcelRecord } from '../types';

export const ReturnPolicy: React.FC = () => {
  const {
    returnParcels,
    scanReturnedParcel,
    filterReturnTrack,
    setFilterReturnTrack,
    configuredBaseFeeBDT,
    setConfiguredBaseFeeBDT,
    retentionThresholdDays,
    setRetentionThresholdDays,
    warehouseId,
    setWarehouseId,
    operatorId,
    setOperatorId,
    midnightBatchLogs
  } = useRecon();

  // Form and Filter States
  const [inputBarcode, setInputBarcode] = useState<string>('');
  const [selectedBay, setSelectedBay] = useState<string>('Bay 1 - Main Inward Gate');
  const [vectorFilter, setVectorFilter] = useState<'ALL' | 'MATCHED' | 'VECTOR_1' | 'VECTOR_2' | 'VECTOR_3' | 'VERIFIED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [justScannedTraceId, setJustScannedTraceId] = useState<string | null>(null);
  const [isScanningAnim, setIsScanningAnim] = useState<boolean>(false);
  const [scanNotice, setScanNotice] = useState<{ success: boolean; message: string } | null>(null);
  const [inspectParcel, setInspectParcel] = useState<ReturnParcelRecord | null>(null);

  // Manual Scan Submission
  const handleManualScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputBarcode.trim()) return;
    const clean = inputBarcode.trim().toUpperCase();
    
    setIsScanningAnim(true);
    setTimeout(() => {
      setIsScanningAnim(false);
      const result = scanReturnedParcel(clean, selectedBay, warehouseId, operatorId);
      setScanNotice(result);
      if (result.success) {
        setJustScannedTraceId(clean);
        setTimeout(() => setJustScannedTraceId(null), 4000);
      }
      setInputBarcode('');
    }, 350);
  };

  // Quick One-Click Scan Simulation
  const handleQuickScan = (traceId: string) => {
    setIsScanningAnim(true);
    setTimeout(() => {
      setIsScanningAnim(false);
      const result = scanReturnedParcel(traceId, selectedBay, warehouseId, operatorId);
      setScanNotice(result);
      if (result.success) {
        setJustScannedTraceId(traceId);
        setTimeout(() => setJustScannedTraceId(null), 4000);
      }
    }, 300);
  };

  // 3-Vector Dynamic Aggregations
  const vectorStats = useMemo(() => {
    let matchedCount = 0;
    let matchedTotalBDT = 0;
    let v1Count = 0;
    let v1TotalVarianceBDT = 0;
    let v2Count = 0;
    let v2TotalRiskBDT = 0;
    let v3Count = 0;
    let v3TotalBlockedBDT = 0;
    let verifiedCount = 0;

    returnParcels.forEach(p => {
      const overcharge = p.returnFeeBDT - configuredBaseFeeBDT;
      const isV1Invalid = overcharge > 0;
      const isV2Stalled = p.courierReportedStatus === 'RETURNED' && !p.scannedAtWarehouse && p.deltaDaysInTransit > retentionThresholdDays;
      const isV3Ghost = !p.scannedAtWarehouse && (
        p.vector3GhostException === true || 
        p.status === 'GHOST_RETURN_EXCEPTION'
      );

      // Vector 1: Arbitrary Penalty Cap Overcharge
      if (isV1Invalid) {
        v1Count++;
        v1TotalVarianceBDT += overcharge;
      }

      // Vector 2: Courier Hub Transit Retention (Late Return alert)
      if (isV2Stalled) {
        v2Count++;
        v2TotalRiskBDT += p.parcelValueBDT;
      }

      // Vector 3: Ghost Return (Courier billed return fee without gate scan)
      if (isV3Ghost) {
        v3Count++;
        v3TotalBlockedBDT += p.returnFeeBDT;
      }

      // Matched Fee: Courier return fee complies with base rate and not blocked by ghost return
      // Business Rule: Return charge is legitimately deducted even if product is returned late to merchant
      const isFeeMatched = (p.returnFeeBDT <= configuredBaseFeeBDT && !isV3Ghost) || p.returnChargeReconStatus === 'VALIDATED_MATCH';
      if (isFeeMatched) {
        matchedCount++;
        matchedTotalBDT += p.returnFeeBDT;
      }

      if (p.scannedAtWarehouse) {
        verifiedCount++;
      }
    });

    return {
      matchedCount,
      matchedTotalBDT,
      v1Count,
      v1TotalVarianceBDT,
      v2Count,
      v2TotalRiskBDT,
      v3Count,
      v3TotalBlockedBDT,
      verifiedCount,
      totalCount: returnParcels.length
    };
  }, [returnParcels, configuredBaseFeeBDT, retentionThresholdDays]);

  // Filtered Parcels for Table
  const filteredParcels = useMemo(() => {
    return returnParcels.filter(parcel => {
      const isStalled = parcel.courierReportedStatus === 'RETURNED' && !parcel.scannedAtWarehouse && parcel.deltaDaysInTransit > retentionThresholdDays;
      const isGhost = !parcel.scannedAtWarehouse && (
        parcel.vector3GhostException === true || 
        parcel.status === 'GHOST_RETURN_EXCEPTION'
      );
      const isFeeMatched = (parcel.returnFeeBDT <= configuredBaseFeeBDT && !isGhost) || parcel.returnChargeReconStatus === 'VALIDATED_MATCH';

      // Track Filter
      if (filterReturnTrack === 'Track A Enterprise' && parcel.track !== 'Track A Enterprise') return false;
      if (filterReturnTrack === 'Track B SME' && parcel.track !== 'Track B SME') return false;

      // Vector Filter
      if (vectorFilter === 'MATCHED') {
        if (!isFeeMatched) return false;
      }
      if (vectorFilter === 'VECTOR_1') {
        const overcharge = parcel.returnFeeBDT - configuredBaseFeeBDT;
        if (overcharge <= 0) return false;
      }
      if (vectorFilter === 'VECTOR_2') {
        if (!isStalled) return false;
      }
      if (vectorFilter === 'VECTOR_3') {
        if (!isGhost) return false;
      }
      if (vectorFilter === 'VERIFIED') {
        if (!parcel.scannedAtWarehouse) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTrace = parcel.traceId.toLowerCase().includes(q);
        const matchOrder = parcel.orderId.toLowerCase().includes(q);
        const matchCustomer = parcel.customerName.toLowerCase().includes(q) || parcel.customerPhone.includes(q);
        const matchCourier = parcel.courierPartner.toLowerCase().includes(q);
        const matchBarcode = parcel.barcodeTag.toLowerCase().includes(q);
        if (!matchTrace && !matchOrder && !matchCustomer && !matchCourier && !matchBarcode) return false;
      }

      return true;
    });
  }, [returnParcels, filterReturnTrack, vectorFilter, searchQuery, configuredBaseFeeBDT, retentionThresholdDays]);

  // Recharts Data: Track A vs Track B 3-Vector Breakdown
  const chartData = useMemo(() => {
    const trackAParcels = returnParcels.filter(p => p.track === 'Track A Enterprise');
    const trackBParcels = returnParcels.filter(p => p.track === 'Track B SME');

    const isGhostItem = (p: ReturnParcelRecord) => !p.scannedAtWarehouse && (
      p.vector3GhostException === true || 
      p.status === 'GHOST_RETURN_EXCEPTION'
    );

    const isStalledItem = (p: ReturnParcelRecord) => 
      p.courierReportedStatus === 'RETURNED' && !p.scannedAtWarehouse && p.deltaDaysInTransit > retentionThresholdDays;

    return [
      {
        name: 'Track A (Enterprise API)',
        matched: trackAParcels.filter(p => ((p.returnFeeBDT <= configuredBaseFeeBDT && !isGhostItem(p)) || p.returnChargeReconStatus === 'VALIDATED_MATCH')).length,
        verified: trackAParcels.filter(p => p.scannedAtWarehouse).length,
        v1Overcharge: trackAParcels.filter(p => p.returnFeeBDT > configuredBaseFeeBDT).length,
        v2Retention: trackAParcels.filter(p => isStalledItem(p)).length,
        v3Ghost: trackAParcels.filter(p => isGhostItem(p)).length
      },
      {
        name: 'Track B (SME Portal)',
        matched: trackBParcels.filter(p => ((p.returnFeeBDT <= configuredBaseFeeBDT && !isStalledItem(p) && !isGhostItem(p)) || p.returnChargeReconStatus === 'VALIDATED_MATCH')).length,
        verified: trackBParcels.filter(p => p.scannedAtWarehouse).length,
        v1Overcharge: trackBParcels.filter(p => p.returnFeeBDT > configuredBaseFeeBDT).length,
        v2Retention: trackBParcels.filter(p => isStalledItem(p)).length,
        v3Ghost: trackBParcels.filter(p => isGhostItem(p)).length
      }
    ];
  }, [returnParcels, configuredBaseFeeBDT, retentionThresholdDays]);

  return (
    <div className="space-y-6 animate-fadeIn pb-24 font-sans text-[#FFFFFF]">
      
      {/* Top Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#121212] border border-[#27272A] p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#050505] border border-[#FACC15] flex items-center justify-center text-[#FACC15] shrink-0 font-bold">
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-mono font-bold text-[#FACC15] tracking-wider">
                  Page 4 of 5 • Reverse Logistics Terminal
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#050505] text-[#22C55E] border border-[#22C55E]/40">
                  Universal Cross-Device Ready (Android, Tab, PC)
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-[#FFFFFF] tracking-tight">
                Inbound Gate Barcode Terminal & 3-Vector Return Audit
              </h1>
            </div>
          </div>
          <p className="text-xs text-[#A1A1AA] max-w-3xl leading-relaxed">
            Physical receiving gate scanner and forensic verification: scanning package barcodes anchors physical receipt, restocks inventory, and clears Ghost Return exceptions in real time.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-[#050505] border border-[#27272A] text-xs font-mono">
            <span className="text-[#A1A1AA] mr-1.5">Gate Status:</span>
            <span className="text-[#22C55E] font-bold">● ONLINE (DHK-HUB-01)</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-[#050505] border border-[#22C55E]/40 text-xs font-mono">
            <span className="text-[#A1A1AA] mr-1.5">Matched Fees:</span>
            <span className="text-[#22C55E] font-bold">{vectorStats.matchedCount} ({formatBDT(vectorStats.matchedTotalBDT)})</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-[#050505] border border-[#27272A] text-xs font-mono">
            <span className="text-[#A1A1AA] mr-1.5">Floor Scans:</span>
            <span className="text-[#FACC15] font-bold">{vectorStats.verifiedCount} / {vectorStats.totalCount}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: RESPONSIVE INBOUND BARCODE ANCHORING GATE TERMINAL */}
      <div className="bg-[#121212] border-2 border-[#FACC15] rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] animate-ping" />
              <h2 className="text-sm sm:text-base font-bold text-[#FFFFFF] font-mono uppercase tracking-wide flex items-center gap-2 flex-wrap">
                <span>1. INBOUND BARCODE ANCHORING GATE TERMINAL</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/30">
                  Ready For Physical Scans
                </span>
              </h2>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1 font-sans">
              Scan parcel barcodes on Android mobile, tablet, or laptop. Anchors physical receipt, updates status to <strong className="text-[#22C55E]">RETURN_RECEIVED_IN_WAREHOUSE</strong>, and eliminates ghost deductions.
            </p>
          </div>

          {/* Facility, Operator & Intake Dock Controls */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-[#050505] border border-[#27272A] px-3 py-2 rounded-xl">
              <Building2 className="w-4 h-4 text-[#FACC15]" />
              <span className="text-[#A1A1AA] text-[11px]">Facility:</span>
              <select
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="WH-DHK-TEJGAON-01" className="bg-[#121212]">WH-DHK-TEJGAON-01</option>
                <option value="WH-DHK-MIRPUR-02" className="bg-[#121212]">WH-DHK-MIRPUR-02</option>
                <option value="WH-CTG-AGRABAD-03" className="bg-[#121212]">WH-CTG-AGRABAD-03</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#050505] border border-[#27272A] px-3 py-2 rounded-xl">
              <UserCheck className="w-4 h-4 text-[#FACC15]" />
              <span className="text-[#A1A1AA] text-[11px]">Operator:</span>
              <input
                type="text"
                value={operatorId}
                onChange={e => setOperatorId(e.target.value)}
                className="bg-transparent text-[#FFFFFF] font-bold text-xs w-28 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#050505] border border-[#27272A] px-3 py-2 rounded-xl">
              <MapPin className="w-4 h-4 text-[#22C55E]" />
              <span className="text-[#A1A1AA] text-[11px]">Bay:</span>
              <select
                value={selectedBay}
                onChange={e => setSelectedBay(e.target.value)}
                className="bg-transparent text-[#22C55E] font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="Bay 1 - Main Inward Gate" className="bg-[#121212]">Bay 1 - Main Inward Gate</option>
                <option value="Bay 2 - QC & Restock Station" className="bg-[#121212]">Bay 2 - QC & Restock Station</option>
                <option value="Bay 3 - Reverse Staging" className="bg-[#121212]">Bay 3 - Reverse Staging</option>
              </select>
            </div>
          </div>
        </div>

        {/* Optical Viewfinder + Input Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Responsive Camera Viewfinder - Tap to Scan on Phone / Tab */}
          <div 
            onClick={() => handleQuickScan('TR-RET-203')}
            title="Tap viewfinder to trigger instant physical return scan"
            className="lg:col-span-4 rounded-xl border border-dashed border-[#FACC15]/60 bg-[#050505] h-36 sm:h-40 flex flex-col items-center justify-center relative cursor-pointer active:scale-[0.99] transition-transform select-none group"
          >
            {/* Viewfinder Corners */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#FACC15]" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#FACC15]" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#FACC15]" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#FACC15]" />

            {/* Red Laser Scanning Line */}
            <div className="absolute inset-x-3 h-0.5 bg-[#EF4444] shadow-[0_0_10px_#ef4444] animate-bounce" />

            <Camera className="w-6 h-6 text-[#A1A1AA] mb-1 group-hover:text-[#FACC15] transition-colors" />
            <span className="text-xs font-mono font-bold text-[#FFFFFF]">OPTICAL CAMERA SCANNER</span>
            <span className="text-[10px] font-mono text-[#FACC15] bg-[#FACC15]/10 px-2 py-0.5 rounded border border-[#FACC15]/30 mt-1">
              📱 Tap screen to simulate camera scan
            </span>
          </div>

          {/* Barcode Scanner Input Form - Large Touch Targets */}
          <div className="lg:col-span-8 space-y-3">
            <form onSubmit={handleManualScan} className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Barcode className="w-5 h-5 text-[#FACC15] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="return-barcode-input"
                  type="text"
                  placeholder="Scan or type barcode (e.g. TR-RET-203, TR-RET-202, TR-COD-7701)..."
                  value={inputBarcode}
                  onChange={e => setInputBarcode(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#050505] border border-[#27272A] text-white font-mono text-sm sm:text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#FACC15] min-h-[48px]"
                />
              </div>

              <button
                id="return-checkin-submit-btn"
                type="submit"
                disabled={isScanningAnim || !inputBarcode.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-md shadow-[#FACC15]/20 transition-all shrink-0 min-h-[48px] active:scale-[0.98] disabled:opacity-40 cursor-pointer"
              >
                {isScanningAnim ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current stroke-none" />
                    <span>CHECK-IN PARCEL</span>
                  </>
                )}
              </button>
            </form>

            {/* Instant Verification Click Badges - Touch Target ≥44px */}
            <div className="pt-1">
              <div className="text-[11px] font-mono text-[#A1A1AA] flex items-center gap-1.5 mb-2 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>One-Tap Simulation Targets (Phone / Tab / PC):</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickScan('TR-RET-205')}
                  className="p-2 rounded-xl bg-[#050505] hover:bg-zinc-900 border border-[#22C55E]/50 hover:border-[#22C55E] text-left transition-all flex flex-col justify-center min-h-[46px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#22C55E]">TR-RET-205</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] font-bold">MATCHED</span>
                  </div>
                  <span className="text-[10px] text-[#A1A1AA] truncate mt-0.5">Steadfast BDT 60 cap</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickScan('TR-RET-203')}
                  className="p-2 rounded-xl bg-[#050505] hover:bg-zinc-900 border border-[#A855F7]/50 hover:border-[#A855F7] text-left transition-all flex flex-col justify-center min-h-[46px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#A855F7]">TR-RET-203</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#A855F7]/20 text-[#A855F7] font-bold">GHOST</span>
                  </div>
                  <span className="text-[10px] text-[#A1A1AA] truncate mt-0.5">Steadfast BDT 90 ghost</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickScan('TR-RET-202')}
                  className="p-2 rounded-xl bg-[#050505] hover:bg-zinc-900 border border-[#FACC15]/50 hover:border-[#FACC15] text-left transition-all flex flex-col justify-center min-h-[46px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#FACC15]">TR-RET-202</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FACC15]/20 text-[#FACC15] font-bold">14D HUB</span>
                  </div>
                  <span className="text-[10px] text-[#A1A1AA] truncate mt-0.5">RedX SLA breached</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickScan('TR-RET-201')}
                  className="p-2 rounded-xl bg-[#050505] hover:bg-zinc-900 border border-[#EF4444]/50 hover:border-[#EF4444] text-left transition-all flex flex-col justify-center min-h-[46px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#EF4444]">TR-RET-201</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] font-bold">OVERCHARGE</span>
                  </div>
                  <span className="text-[10px] text-[#A1A1AA] truncate mt-0.5">BDT 110 vs BDT 60 cap</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickScan('TR-COD-7701')}
                  className="p-2 rounded-xl bg-[#050505] hover:bg-zinc-900 border border-[#22C55E]/50 hover:border-[#22C55E] text-left transition-all flex flex-col justify-center min-h-[46px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#22C55E]">TR-COD-7701</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] font-bold">PATHAO</span>
                  </div>
                  <span className="text-[10px] text-[#A1A1AA] truncate mt-0.5">Track A COD Return</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Confirmation Notice */}
        {scanNotice && (
          <div className={`p-3.5 rounded-xl border text-xs font-mono animate-fadeIn ${
            scanNotice.success 
              ? 'bg-[#050505] border-[#22C55E] text-[#22C55E]' 
              : 'bg-[#050505] border-[#EF4444] text-[#EF4444]'
          }`}>
            <div className="flex items-center gap-2">
              {scanNotice.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
              <span className="font-bold">{scanNotice.message}</span>
            </div>
            {scanNotice.success && (
              <p className="text-[11px] text-[#FFFFFF] mt-1 font-sans pl-7">
                Status updated to <span className="text-[#22C55E] font-bold">RETURN_RECEIVED_IN_WAREHOUSE</span>. Discrepancy flags and ghost penalties cleared across audit ledgers.
              </p>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: 3-VECTOR RETURN AUDIT ENGINE */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#FFFFFF] font-mono uppercase tracking-wide flex items-center gap-2">
              <span>2. 3-VECTOR RETURN AUDIT ENGINE</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#FACC15]/20 text-[#FACC15] font-bold">
                Automated Forensic Validation
              </span>
            </h2>
            <p className="text-xs text-[#A1A1AA] mt-0.5 font-sans">
              Rule-driven reconciliation across courier reverse statements vs merchant physical gate scans.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#A1A1AA]">Base Return Fee Cap:</span>
            <div className="flex items-center gap-1 bg-[#050505] p-1 rounded-lg border border-[#27272A]">
              {[60, 80, 100].map(fee => (
                <button
                  key={fee}
                  type="button"
                  onClick={() => setConfiguredBaseFeeBDT(fee)}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                    configuredBaseFeeBDT === fee 
                      ? 'bg-[#FACC15] text-[#050505]' 
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  BDT {fee}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Vector Cards Grid + Matched Fee Assessment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Matched Fee: Contract Compliant Reverse Deductions */}
          <div className="p-4 rounded-xl bg-[#050505] border border-[#22C55E]/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#22C55E] uppercase tracking-wide">
                  Matched Fee (Compliant)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40">
                  {vectorStats.matchedCount} Matched
                </span>
              </div>
              <div className="mt-2 text-2xl font-mono font-bold text-[#22C55E]">
                {formatBDT(vectorStats.matchedTotalBDT)}
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-1 font-sans">
                Reverse deductions complying with contract cap (BDT {configuredBaseFeeBDT}). Clean reconciliation.
              </p>
            </div>
            <div className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 p-2 rounded border border-[#22C55E]/20">
              Rule: Courier Return Fee &le; Contract Base Cap (BDT {configuredBaseFeeBDT})
            </div>
          </div>

          {/* Vector 1: Arbitrary Penalty Cap Overcharge */}
          <div className="p-4 rounded-xl bg-[#050505] border border-[#EF4444]/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#EF4444] uppercase tracking-wide">
                  Vector 1: Penalty Overcharge
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
                  {vectorStats.v1Count} Flagged
                </span>
              </div>
              <div className="mt-2 text-2xl font-mono font-bold text-[#EF4444]">
                {formatBDT(vectorStats.v1TotalVarianceBDT)}
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-1 font-sans">
                Courier deductions exceeding contracted BDT {configuredBaseFeeBDT} cap.
              </p>
            </div>
            <div className="text-[10px] font-mono text-[#EF4444] bg-[#EF4444]/10 p-2 rounded border border-[#EF4444]/20">
              Rule: Courier Return Fee &gt; Contract Base Cap (BDT {configuredBaseFeeBDT})
            </div>
          </div>

          {/* Vector 2: Courier Hub Transit Retention Delta */}
          <div className="p-4 rounded-xl bg-[#050505] border border-[#FACC15]/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#FACC15] uppercase tracking-wide">
                  Vector 2: Hub Retention
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/40">
                  {vectorStats.v2Count} Gaps
                </span>
              </div>
              <div className="mt-2 text-2xl font-mono font-bold text-[#FACC15]">
                {formatBDT(vectorStats.v2TotalRiskBDT)}
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-1 font-sans">
                Merchandise trapped in courier hubs past {retentionThresholdDays}-day SLA.
              </p>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#FACC15] bg-[#FACC15]/10 p-2 rounded border border-[#FACC15]/20">
              <span>SLA Window:</span>
              <div className="flex gap-1">
                {[7, 10, 14].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setRetentionThresholdDays(d)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      retentionThresholdDays === d ? 'bg-[#FACC15] text-[#050505]' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vector 3: Ghost Return (Inbound Sync) */}
          <div className="p-4 rounded-xl bg-[#050505] border border-[#A855F7]/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#A855F7] uppercase tracking-wide">
                  Vector 3: Ghost Return
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40">
                  {vectorStats.v3Count} Ghost Flag
                </span>
              </div>
              <div className="mt-2 text-2xl font-mono font-bold text-[#A855F7]">
                {formatBDT(vectorStats.v3TotalBlockedBDT)}
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-1 font-sans">
                Reverse fees blocked from settlement until physically verified at gate.
              </p>
            </div>
            <div className="text-[10px] font-mono text-[#A855F7] bg-[#A855F7]/10 p-2 rounded border border-[#A855F7]/20">
              Rule: Courier Return Fee &gt; 0 &amp; Floor Scan Absent &rarr; 100% Payout Block
            </div>
          </div>
        </div>

        {/* Visual Analytics Bar Chart: Track A vs Track B */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">
              Visual Vector Breakdown: Track A Enterprise vs Track B SME
            </span>
            <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/30 font-bold">
              Live Synchronized
            </span>
          </div>

          <div className="h-52 w-full bg-[#050505] p-3 rounded-xl border border-[#27272A]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="name" stroke="#A1A1AA" tick={{ fill: '#A1A1AA', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#A1A1AA" tick={{ fill: '#A1A1AA', fontSize: 11, fontFamily: 'monospace' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', borderColor: '#27272A', borderRadius: '8px', fontFamily: 'monospace', fontSize: '11px', color: '#FFFFFF' }}
                  itemStyle={{ color: '#FACC15' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '6px' }} />
                <Bar dataKey="matched" name="✓ Matched Fee" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified" name="✅ Verified Gate Scan" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="v1Overcharge" name="🚨 V1 (Overcharge)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="v2Retention" name="⏳ V2 (Hub Stalled)" fill="#FACC15" radius={[4, 4, 0, 0]} />
                <Bar dataKey="v3Ghost" name="👻 V3 (Ghost Return)" fill="#A855F7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 3: REVERSE LOGISTICS LEDGER & PARCELS */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
        
        {/* Table Filters Header */}
        <div className="p-4 bg-[#050505] border-b border-[#27272A] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Package className="w-4 h-4 text-[#FACC15]" />
            <h3 className="text-xs font-mono font-bold text-[#FFFFFF] uppercase tracking-wide">
              3. Reverse Logistics Ledger ({filteredParcels.length} Records)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search trace, phone, courier..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#121212] border border-[#27272A] text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            {/* Track Filter */}
            <div className="flex items-center p-0.5 bg-[#121212] border border-[#27272A] rounded-lg text-xs font-mono">
              <button
                type="button"
                onClick={() => setFilterReturnTrack('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${filterReturnTrack === 'ALL' ? 'bg-[#FACC15] text-[#050505] font-bold' : 'text-[#A1A1AA]'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterReturnTrack('Track A Enterprise')}
                className={`px-2.5 py-1 rounded transition-colors ${filterReturnTrack === 'Track A Enterprise' ? 'bg-[#FACC15] text-[#050505] font-bold' : 'text-[#A1A1AA]'}`}
              >
                Track A
              </button>
              <button
                type="button"
                onClick={() => setFilterReturnTrack('Track B SME')}
                className={`px-2.5 py-1 rounded transition-colors ${filterReturnTrack === 'Track B SME' ? 'bg-[#FACC15] text-[#050505] font-bold' : 'text-[#A1A1AA]'}`}
              >
                Track B
              </button>
            </div>

            {/* Vector Filter */}
            <div className="flex items-center p-0.5 bg-[#121212] border border-[#27272A] rounded-lg text-xs font-mono">
              <button
                type="button"
                onClick={() => setVectorFilter('ALL')}
                className={`px-2 py-1 rounded transition-colors ${vectorFilter === 'ALL' ? 'bg-zinc-800 text-white font-bold' : 'text-[#A1A1AA]'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setVectorFilter('MATCHED')}
                className={`px-2 py-1 rounded transition-colors ${vectorFilter === 'MATCHED' ? 'bg-[#22C55E] text-[#050505] font-bold' : 'text-[#A1A1AA]'}`}
              >
                Matched
              </button>
              <button
                type="button"
                onClick={() => setVectorFilter('VECTOR_3')}
                className={`px-2 py-1 rounded transition-colors ${vectorFilter === 'VECTOR_3' ? 'bg-[#A855F7] text-white font-bold' : 'text-[#A1A1AA]'}`}
              >
                Ghost
              </button>
              <button
                type="button"
                onClick={() => setVectorFilter('VECTOR_1')}
                className={`px-2 py-1 rounded transition-colors ${vectorFilter === 'VECTOR_1' ? 'bg-[#EF4444] text-white font-bold' : 'text-[#A1A1AA]'}`}
              >
                Overcharge
              </button>
              <button
                type="button"
                onClick={() => setVectorFilter('VERIFIED')}
                className={`px-2 py-1 rounded transition-colors ${vectorFilter === 'VERIFIED' ? 'bg-[#22C55E] text-white font-bold' : 'text-[#A1A1AA]'}`}
              >
                Verified
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE CARD VIEW (< 640px) - Effortless Operation on Phone */}
        <div className="block sm:hidden divide-y divide-[#27272A]">
          {filteredParcels.map(parcel => {
            const isJustScanned = justScannedTraceId === parcel.traceId;
            const overchargeVariance = Math.max(0, parcel.returnFeeBDT - configuredBaseFeeBDT);
            const isV1Breach = overchargeVariance > 0;
            const isV2Stalled = parcel.courierReportedStatus === 'RETURNED' && !parcel.scannedAtWarehouse && parcel.deltaDaysInTransit > retentionThresholdDays;
            const isV3Ghost = !parcel.scannedAtWarehouse && (
              parcel.vector3GhostException === true || 
              parcel.status === 'GHOST_RETURN_EXCEPTION'
            );
            const isFeeMatched = (parcel.returnFeeBDT <= configuredBaseFeeBDT && !isV3Ghost) || parcel.returnChargeReconStatus === 'VALIDATED_MATCH';

            return (
              <div 
                key={parcel.id} 
                className={`p-4 space-y-2.5 transition-colors ${
                  isJustScanned 
                    ? 'bg-[#22C55E]/10 border-l-4 border-[#22C55E]' 
                    : isV3Ghost 
                    ? 'bg-[#A855F7]/10' 
                    : 'bg-[#121212]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-[#FACC15]">
                    <Barcode className="w-4 h-4 text-[#FACC15]" />
                    <span>{parcel.traceId}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-[#A1A1AA]">
                    {parcel.track}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[#A1A1AA] text-[10px] block">Customer / Courier:</span>
                    <span className="text-white font-bold">{parcel.customerName}</span>
                    <div className="text-[10px] text-[#A1A1AA]">{parcel.courierPartner} • {parcel.customerPhone}</div>
                  </div>
                  <div>
                    <span className="text-[#A1A1AA] text-[10px] block">Parcel / Fee:</span>
                    <span className="text-white font-bold">{formatBDT(parcel.parcelValueBDT)}</span>
                    <div className={`text-[10px] ${isV1Breach ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                      Ret Fee: {formatBDT(parcel.returnFeeBDT)} {isFeeMatched ? '(Matched)' : ''}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
                  {parcel.scannedAtWarehouse ? (
                    <span className="px-2 py-1 rounded bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      VERIFIED_RETURNED
                    </span>
                  ) : isV3Ghost ? (
                    <span className="px-2 py-1 rounded bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40 font-bold flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      GHOST RETURN EXCEPTION
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-zinc-800 text-[#A1A1AA] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      IN TRANSIT ({parcel.deltaDaysInTransit}d)
                    </span>
                  )}

                  {isFeeMatched && (
                    <span className="px-2 py-1 rounded bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#22C55E]" />
                      MATCHED FEE
                    </span>
                  )}

                  {isV1Breach && (
                    <span className="px-2 py-1 rounded bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-bold">
                      Fee Overcharge
                    </span>
                  )}
                </div>

                {/* Mobile Action Buttons (Min height 44px) */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectParcel(parcel)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs flex items-center justify-center gap-1 min-h-[44px]"
                  >
                    <Eye className="w-4 h-4 text-[#A1A1AA]" />
                    <span>Audit Detail</span>
                  </button>

                  {!parcel.scannedAtWarehouse ? (
                    <button
                      type="button"
                      onClick={() => handleQuickScan(parcel.traceId)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#FACC15]/20 min-h-[44px] active:scale-[0.98]"
                    >
                      <Zap className="w-4 h-4 fill-current stroke-none" />
                      <span>SCAN INWARD</span>
                    </button>
                  ) : (
                    <div className="flex-1 py-2.5 px-3 rounded-xl bg-[#22C55E]/20 text-[#22C55E] font-mono font-bold text-xs flex items-center justify-center gap-1 min-h-[44px] border border-[#22C55E]/40">
                      <Check className="w-4 h-4" />
                      <span>RESTOCKED</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* TABLET & LAPTOP TABULAR VIEW (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#050505] text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
              <tr>
                <th className="py-3 px-3.5 font-semibold">TraceID & Origin</th>
                <th className="py-3 px-3 font-semibold">Track Suite</th>
                <th className="py-3 px-3.5 font-semibold">Customer & Courier</th>
                <th className="py-3 px-3 font-semibold">Value / Fwd Fee</th>
                <th className="py-3 px-3 font-semibold">Vector 1: Penalty Cap</th>
                <th className="py-3 px-3.5 font-semibold">Vector 2: Hub Transit</th>
                <th className="py-3 px-4 font-semibold">Vector 3: Gate Scan Status</th>
                <th className="py-3 px-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] text-slate-300">
              {filteredParcels.map(parcel => {
                const isJustScanned = justScannedTraceId === parcel.traceId;
                const isTrackA = parcel.track === 'Track A Enterprise';
                const overchargeVariance = Math.max(0, parcel.returnFeeBDT - configuredBaseFeeBDT);
                const isV1Breach = overchargeVariance > 0;
                const isV2Stalled = parcel.courierReportedStatus === 'RETURNED' && !parcel.scannedAtWarehouse && parcel.deltaDaysInTransit > retentionThresholdDays;
                const isV3Ghost = !parcel.scannedAtWarehouse && (
                  parcel.vector3GhostException === true || 
                  parcel.status === 'GHOST_RETURN_EXCEPTION' || 
                  (parcel.courierReportedStatus === 'RETURNED' && parcel.deltaDaysInTransit > retentionThresholdDays)
                );
                const isFeeMatched = (parcel.returnFeeBDT <= configuredBaseFeeBDT && !isV2Stalled && !isV3Ghost) || parcel.returnChargeReconStatus === 'VALIDATED_MATCH';

                return (
                  <tr
                    key={parcel.id}
                    className={`transition-colors ${
                      isJustScanned
                        ? 'bg-[#22C55E]/15 ring-1 ring-[#22C55E]'
                        : isV3Ghost
                        ? 'bg-[#A855F7]/10 hover:bg-[#A855F7]/20'
                        : isV1Breach
                        ? 'bg-[#EF4444]/10 hover:bg-[#EF4444]/20'
                        : isFeeMatched && !parcel.scannedAtWarehouse
                        ? 'bg-[#22C55E]/5 hover:bg-[#22C55E]/10'
                        : parcel.scannedAtWarehouse
                        ? 'bg-[#121212] hover:bg-zinc-900'
                        : 'hover:bg-zinc-900'
                    }`}
                  >
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Barcode className="w-3.5 h-3.5 text-[#FACC15]" />
                        <span>{parcel.traceId}</span>
                      </div>
                      <div className="text-[10px] text-[#A1A1AA] mt-0.5">
                        Ref: {parcel.orderId}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-[#27272A] bg-[#050505] text-[#A1A1AA] inline-flex items-center gap-1">
                        {isTrackA ? <Building2 className="w-3 h-3 text-[#FACC15]" /> : <Store className="w-3 h-3 text-[#FACC15]" />}
                        {parcel.track}
                      </span>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-medium text-white">{parcel.customerName}</div>
                      <div className="text-[10px] text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                        <Truck className="w-3 h-3 text-[#FACC15]" />
                        <span>{parcel.courierPartner}</span>
                        <span>•</span>
                        <span>{parcel.customerPhone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{formatBDT(parcel.parcelValueBDT)}</div>
                      <div className="text-[10px] text-[#A1A1AA]">
                        Fwd: {formatBDT(parcel.forwardFeeBDT)}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{formatBDT(parcel.returnFeeBDT)}</span>
                        {isFeeMatched && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 inline-flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            MATCHED
                          </span>
                        )}
                      </div>
                      {isV1Breach ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 block w-fit mt-0.5">
                          Overcharge: +{formatBDT(overchargeVariance)}
                        </span>
                      ) : isFeeMatched ? (
                        <span className="text-[9px] text-[#22C55E] block mt-0.5">
                          ✓ BDT {parcel.returnFeeBDT} &le; BDT {configuredBaseFeeBDT} Cap
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#22C55E] block mt-0.5">
                          ✓ Below BDT {configuredBaseFeeBDT} Cap
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1 font-bold text-white">
                        <Clock className="w-3 h-3 text-[#FACC15]" />
                        <span>{parcel.deltaDaysInTransit} Days</span>
                      </div>
                      {isV2Stalled ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/40 block w-fit mt-0.5 animate-pulse">
                          ⚠️ Hub Retention SLA Breach
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#A1A1AA] block mt-0.5">
                          Within {retentionThresholdDays}d SLA
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {parcel.scannedAtWarehouse ? (
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                            VERIFIED_RETURNED
                          </span>
                          <div className="text-[9px] text-[#22C55E] font-mono">
                            {parcel.scanTimestamp || 'Scanned'} • {parcel.scannedBay || 'Gate 1'}
                          </div>
                        </div>
                      ) : isV3Ghost ? (
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40 inline-flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-[#A855F7]" />
                            GHOST RETURN EXCEPTION
                          </span>
                          <div className="text-[9px] text-[#A855F7] font-mono">
                            Courier billed BDT {parcel.returnFeeBDT} • 0 Gate check-ins
                          </div>
                        </div>
                      ) : isFeeMatched ? (
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                            IN TRANSIT (FEE MATCHED)
                          </span>
                          <div className="text-[9px] text-[#A1A1AA] font-mono">
                            Status: {parcel.courierReportedStatus} • Reconciled
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-[#A1A1AA] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#FACC15]" />
                            IN TRANSIT
                          </span>
                          <div className="text-[9px] text-[#A1A1AA] font-mono">
                            Status: {parcel.courierReportedStatus}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectParcel(parcel)}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-mono transition-colors"
                          title="View 3-Vector forensic audit detail"
                        >
                          <Eye className="w-3 h-3" />
                        </button>

                        {!parcel.scannedAtWarehouse ? (
                          <button
                            type="button"
                            onClick={() => handleQuickScan(parcel.traceId)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-bold text-[10px] font-mono shadow transition-all active:scale-95 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Zap className="w-3 h-3 fill-current stroke-none" />
                            <span>Scan Gate</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-1 rounded-lg inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Restocked
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Real-Time Sync Notice Footer */}
        <div className="p-3.5 bg-[#050505] border-t border-[#27272A] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#A1A1AA]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FACC15] shrink-0" />
            <span>
              Real-time cross-track sync: Scanned return parcels immediately clear Ghost Return flags in both Track A Enterprise and Track B SME workspaces.
            </span>
          </div>
        </div>
      </div>

      {/* Parcel Detail Modal */}
      <ParcelDetailModal
        parcel={inspectParcel}
        onClose={() => setInspectParcel(null)}
        onScanParcel={(traceId) => handleQuickScan(traceId)}
      />

    </div>
  );
};
