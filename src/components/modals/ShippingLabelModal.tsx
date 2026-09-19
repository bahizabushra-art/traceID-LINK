import React from 'react';
import { DispatchedParcel } from '../../types';
import { formatBDT } from '../../data/mockData';
import { Printer, X, CheckCircle, Barcode as BarcodeIcon, ShieldCheck } from 'lucide-react';

interface Props {
  parcel: DispatchedParcel | null;
  onClose: () => void;
}

export const ShippingLabelModal: React.FC<Props> = ({ parcel, onClose }) => {
  if (!parcel) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-[#0B0F19] border border-[#1F293D] rounded-xl max-w-md w-full max-h-[92vh] overflow-y-auto p-4 sm:p-5 shadow-2xl space-y-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
          <div className="flex items-center gap-2">
            <BarcodeIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Printable Shipping Label Preview
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs p-1 rounded bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Label Canvas Card (Classic Courier Thermal 4x6 Style) */}
        <div 
          id="printable-shipping-tag"
          className="bg-white text-black p-5 rounded-md border-2 border-dashed border-slate-400 font-mono text-xs shadow-md space-y-3"
        >
          {/* Header Courier & Hub */}
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <div>
              <div className="font-extrabold text-sm uppercase tracking-wider text-black">
                {parcel.courier}
              </div>
              <div className="text-[10px] text-neutral-600">3PL LOGISTICS NETWORK • DHAKA HUB</div>
            </div>
            <div className="text-right">
              <span className="inline-block border-2 border-black px-2 py-0.5 font-black text-xs">
                {parcel.dispatchType === '100% COD' ? 'COD PARCEL' : 'PRE-VERIFIED'}
              </span>
            </div>
          </div>

          {/* Barcode Graphic Simulation */}
          <div className="text-center py-2 bg-neutral-50 border border-neutral-200 rounded">
            <div className="flex justify-center items-end gap-[2px] h-14 px-4">
              {/* Stylized barcode stripes */}
              {[4, 2, 6, 2, 8, 3, 5, 2, 7, 3, 4, 8, 2, 5, 3, 6, 2, 8, 4, 3, 7, 2, 5, 3, 8, 4, 2, 6, 3, 5, 8, 2, 4, 6].map((h, i) => (
                <div
                  key={i}
                  className="bg-black"
                  style={{
                    width: (i % 3 === 0) ? '3px' : (i % 2 === 0) ? '2px' : '1px',
                    height: `${40 + (h * 2)}px`
                  }}
                ></div>
              ))}
            </div>
            <div className="text-xs font-black tracking-widest mt-1 font-mono">
              *{parcel.traceId}*
            </div>
            <div className="text-[9px] text-neutral-500 font-mono">
              BARCODE TAG: {parcel.barcodeTag}
            </div>
          </div>

          {/* Destination Details */}
          <div className="border border-black p-2.5 rounded space-y-1">
            <div className="text-[9px] font-bold text-neutral-500 uppercase">Deliver To Recipient:</div>
            <div className="font-bold text-sm text-black">{parcel.customerName}</div>
            <div className="font-bold text-xs text-neutral-800">Phone: {parcel.customerPhone}</div>
            <div className="text-[11px] text-neutral-700 leading-tight pt-0.5">
              {parcel.deliveryAddress}
            </div>
          </div>

          {/* Financial Settlement Strip */}
          <div className="grid grid-cols-2 gap-2 border-t-2 border-black pt-2">
            <div className="p-2 bg-neutral-100 border border-neutral-300 rounded">
              <div className="text-[9px] text-neutral-600 uppercase">Cash to Collect (COD):</div>
              <div className="text-base font-black text-black">
                {formatBDT(parcel.codCollectionBDT)}
              </div>
            </div>

            <div className="p-2 bg-neutral-100 border border-neutral-300 rounded">
              <div className="text-[9px] text-neutral-600 uppercase">Advance MFS Settled:</div>
              <div className="text-sm font-bold text-emerald-700">
                {parcel.advancePaidBDT > 0 ? formatBDT(parcel.advancePaidBDT) : 'BDT 0'}
              </div>
              {parcel.linkedTrxId && (
                <div className="text-[8px] text-neutral-500 truncate">Trx: {parcel.linkedTrxId}</div>
              )}
            </div>
          </div>

          {/* Footer Security Watermark */}
          <div className="flex items-center justify-between text-[8px] text-neutral-500 pt-1 font-mono">
            <span>FinRecon BD System Dispatched • {parcel.timestamp}</span>
            <span>Security Hash: SHA256-OK</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] font-mono text-slate-400">
            Thermal Roll Compatible (4" × 6")
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
