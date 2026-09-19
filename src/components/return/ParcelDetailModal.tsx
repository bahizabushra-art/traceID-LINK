import React from 'react';
import { 
  Barcode, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  X, 
  Building2, 
  Store, 
  Truck, 
  Zap, 
  Check, 
  Calendar, 
  MapPin, 
  UserCheck, 
  DollarSign, 
  FileText
} from 'lucide-react';
import { ReturnParcelRecord } from '../../types';
import { formatBDT } from '../../data/mockData';
import { useRecon } from '../../context/ReconContext';

interface ParcelDetailModalProps {
  parcel: ReturnParcelRecord | null;
  onClose: () => void;
  onScanParcel: (traceId: string) => void;
}

export const ParcelDetailModal: React.FC<ParcelDetailModalProps> = ({
  parcel,
  onClose,
  onScanParcel
}) => {
  const { configuredBaseFeeBDT, retentionThresholdDays } = useRecon();

  if (!parcel) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b101d] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        
        {/* Header */}
        <div className="p-5 bg-[#0e1628] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">
                  {parcel.traceId}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${
                  isTrackA
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    : 'bg-pink-950 text-pink-300 border-pink-800'
                }`}>
                  {isTrackA ? <Building2 className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                  {parcel.track}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-sans mt-0.5">
                Internal Order Reference: <strong className="text-slate-200">{parcel.orderId}</strong> · Physical Barcode: <strong className="text-cyan-300">{parcel.barcodeTag}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          {/* Inbound Barcode Anchoring Origin Card */}
          <div className="p-4 rounded-xl bg-[#09101d] border border-slate-800">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Section 1: Inbound Barcode Anchoring Origin</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 text-[10px] block">Traceability Provenance:</span>
                <span className="font-bold text-white">
                  {parcel.originType === 'API_CHECKOUT_WEBHOOK'
                    ? 'Track A Digital API Payload Injection'
                    : 'Track B Automated IMAP Listener Mapping'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Origin Architecture:</span>
                <span className="text-slate-300 font-sans text-[11px]">
                  {parcel.originDetail || 'Cryptographic TraceID anchored into physical shipping label barcode'}
                </span>
              </div>
            </div>
          </div>

          {/* 3-Vector Return Audit Engine Breakdown */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Section 2: Midnight 3-Vector Audit Results</span>
            </div>

            {/* Vector 1 Card */}
            <div className={`p-4 rounded-xl border ${
              isV1Breach 
                ? 'bg-rose-950/20 border-rose-800/60' 
                : isFeeMatched
                ? 'bg-emerald-950/20 border-emerald-800/60'
                : 'bg-[#09101d] border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                  <span>Vector 1: Arbitrary Penalty Cap Audit</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isV1Breach
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : isFeeMatched
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {isV1Breach ? 'LOGISTICS_RETURN_VARIANCE_ERROR' : isFeeMatched ? '✓ MATCHED_FEE' : 'VALID'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-500 text-[10px] block">Courier Deducted:</span>
                  <span className="font-bold text-white">{formatBDT(parcel.returnFeeBDT)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Configured Base Fee:</span>
                  <span className="font-bold text-cyan-300">{formatBDT(configuredBaseFeeBDT)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Clawback Variance:</span>
                  <span className={`font-bold ${isV1Breach ? 'text-rose-400' : isFeeMatched ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isV1Breach ? `+ ${formatBDT(overchargeVariance)}` : 'BDT 0.00 (Matched)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Vector 2 Card */}
            <div className={`p-4 rounded-xl border ${
              isV2Stalled 
                ? 'bg-amber-950/20 border-amber-800/60' 
                : 'bg-[#09101d] border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px]">
                  Vector 2: Courier Hub Transit Retention Audit
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isV2Stalled
                    ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {isV2Stalled ? 'COURIER_RETENTION_GAP' : 'SLA_COMPLIANT'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-500 text-[10px] block">Transit Duration:</span>
                  <span className="font-bold text-white">{parcel.deltaDaysInTransit} Days</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">SLA Threshold:</span>
                  <span className="text-slate-300">{retentionThresholdDays} Days Max</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Inventory Asset at Risk:</span>
                  <span className="font-bold text-amber-400">{formatBDT(parcel.parcelValueBDT)}</span>
                </div>
              </div>
              {parcel.vector2AlertMessage && (
                <div className="mt-2 text-[11px] text-amber-300 font-sans">
                  ⚠️ {parcel.vector2AlertMessage}
                </div>
              )}
            </div>

            {/* Vector 3 Card */}
            <div className={`p-4 rounded-xl border ${
              isV3Ghost 
                ? 'bg-purple-950/20 border-purple-800/60' 
                : 'bg-[#09101d] border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px]">
                  Vector 3: Ghost Return Audit (Warehouse Inbound Sync)
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isV3Ghost
                    ? 'bg-purple-950 text-purple-300 border-purple-800 animate-pulse'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {isV3Ghost ? 'GHOST_RETURN_EXCEPTION' : 'PHYSICALLY_VERIFIED'}
                </span>
              </div>

              <div className="mt-2 text-slate-300 font-sans text-[11px] leading-relaxed">
                {isV3Ghost ? (
                  <div className="text-purple-300 space-y-1">
                    <div>🚨 <strong>Debit Block Enforced:</strong> 3PL Courier ({parcel.courierPartner}) billed a BDT {parcel.returnFeeBDT}.00 reverse fee, but warehouse gate receipt is missing from inventory floor.</div>
                    <div className="text-[10px] text-purple-400 font-mono">Status: ZERO_DEBIT_PAYOUT · 100% of reverse fees protected against unauthorized deduction.</div>
                  </div>
                ) : (
                  <div className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Physical gate intake verified. Inventory restored to warehouse ledger.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Return Policy Fee Reconciliation Assessment Card */}
            <div className={`p-4 rounded-xl border ${
              isFeeMatched 
                ? 'bg-emerald-950/20 border-emerald-800/60' 
                : isV3Ghost 
                ? 'bg-purple-950/20 border-purple-800/60'
                : isV2Stalled
                ? 'bg-amber-950/20 border-amber-800/60'
                : 'bg-rose-950/20 border-rose-800/60'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Return Charge Reconciliation Assessment</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isFeeMatched 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                    : isV3Ghost 
                    ? 'bg-purple-950 text-purple-300 border-purple-800'
                    : isV2Stalled
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}>
                  {isFeeMatched ? 'VALIDATED_MATCH' : parcel.returnChargeReconStatus || 'AUDITED'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
                {parcel.returnChargeReconNote || (isFeeMatched 
                  ? `MATCHED FEE VALIDATED: Courier deduction of BDT ${parcel.returnFeeBDT}.00 matches contract base cap (BDT ${configuredBaseFeeBDT}.00). Clean settlement permitted.` 
                  : `Automated audit active. Configured rate cap: BDT ${configuredBaseFeeBDT}.00.`)}
              </p>
            </div>
          </div>

          {/* Physical Receiving Log Stamp */}
          <div className="p-4 rounded-xl bg-[#09101d] border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Section 3: Physical Warehouse Receiving Audit Stamp</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 text-[10px] block">Scan Status:</span>
                <span className={`font-bold ${parcel.scannedAtWarehouse ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {parcel.scannedAtWarehouse ? 'CHECKED IN' : 'AWAITING GATE SCAN'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Intake Bay:</span>
                <span className="text-white">{parcel.scannedBay || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Facility ID:</span>
                <span className="text-slate-200">{parcel.warehouseId || 'WH-DHK-TEJGAON-01'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Operator ID:</span>
                <span className="text-slate-200">{parcel.operatorId || 'OP-8821-RAHMAN'}</span>
              </div>
            </div>

            {parcel.scanTimestamp && (
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-mono">
                Intake Timestamp: {parcel.scanTimestamp}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0e1628] border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Customer: <strong className="text-white">{parcel.customerName}</strong> ({parcel.customerPhone})
          </div>

          <div className="flex items-center gap-2">
            {!parcel.scannedAtWarehouse && (
              <button
                type="button"
                onClick={() => {
                  onScanParcel(parcel.traceId);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Simulate Physical Gate Check-In</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
