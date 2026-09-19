import React, { useState } from 'react';
import { useRecon } from '../../context/ReconContext';
import { IngestedMfsEmail, DispatchedParcel } from '../../types';
import { formatBDT } from '../../data/mockData';
import { 
  Inbox, 
  Send, 
  Mail, 
  Phone, 
  CreditCard, 
  Check, 
  Copy, 
  ArrowRight, 
  Printer, 
  Barcode as BarcodeIcon, 
  Truck, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Search,
  CheckCircle2,
  FileCode,
  X
} from 'lucide-react';

export const PassiveIngestionHub: React.FC = () => {
  const { 
    imapEmails, 
    selectedEmailForDispatch, 
    setSelectedEmailForDispatch,
    dispatchNewParcel,
    setActiveLabelModalParcel,
    dispatchedParcels
  } = useRecon();

  // Search & Filter State
  const [emailSearch, setEmailSearch] = useState<string>('');
  const [selectedPayloadEmail, setSelectedPayloadEmail] = useState<IngestedMfsEmail | null>(null);

  // Form State
  const [dispatchType, setDispatchType] = useState<'100% Pre-Paid' | '100% COD' | 'Split Advance Paid' | 'Free Shipping'>('100% Pre-Paid');
  const [customerName, setCustomerName] = useState<string>('Sumaiya Akhter');
  const [customerPhone, setCustomerPhone] = useState<string>('01711892019');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Flat 4B, House 12, Road 4, Dhanmondi, Dhaka');
  const [courier, setCourier] = useState<'Pathao Courier' | 'Steadfast' | 'RedX'>('Pathao Courier');
  const [linkedTrxId, setLinkedTrxId] = useState<string>(imapEmails[0]?.trxId || 'BLM9A2K4X7');
  const [advancePaidBDT, setAdvancePaidBDT] = useState<number>(1200);
  const [codCollectionBDT, setCodCollectionBDT] = useState<number>(0);
  const [isFreeShipping, setIsFreeShipping] = useState<boolean>(false);
  const [deliveryFeeBDT, setDeliveryFeeBDT] = useState<number>(80);

  // When email selected from feed
  const handleSelectEmail = (email: IngestedMfsEmail) => {
    setSelectedEmailForDispatch(email);
    setLinkedTrxId(email.trxId);
    setCustomerPhone(email.senderMobile);
    setAdvancePaidBDT(email.amount);

    if (dispatchType === '100% COD') {
      setDispatchType('100% Pre-Paid');
      setCodCollectionBDT(0);
    }
  };

  const handleTypeChange = (type: typeof dispatchType) => {
    setDispatchType(type);
    if (type === '100% Pre-Paid') {
      setCodCollectionBDT(0);
      setAdvancePaidBDT(advancePaidBDT || 1200);
    } else if (type === '100% COD') {
      setAdvancePaidBDT(0);
      setCodCollectionBDT(1850);
    } else if (type === 'Split Advance Paid') {
      setAdvancePaidBDT(150);
      setCodCollectionBDT(2200);
    } else if (type === 'Free Shipping') {
      setIsFreeShipping(true);
      setDeliveryFeeBDT(0);
      setCodCollectionBDT(2500);
    }
  };

  const handleGenerateAndDispatch = (e: React.FormEvent) => {
    e.preventDefault();

    const timestampCode = Date.now().toString().slice(-4);
    const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
    const currentYear = new Date().getFullYear();
    
    // Cryptographic Tracking Pointer Framework:
    // TR-PRE-[YEAR]-[HASH] for 100% Pre-payment
    // TR-COD-[HASH] for 100% Standard COD
    // TR-SPLIT-[HASH] for Split-Payment
    // TR-FREE-[HASH] for Free Delivery
    const newTraceId = dispatchType === '100% Pre-Paid' ? `TR-PRE-${currentYear}-${hash}`
      : dispatchType === '100% COD' ? `TR-COD-${hash}`
      : dispatchType === 'Split Advance Paid' ? `TR-SPLIT-${hash}`
      : `TR-FREE-${hash}`;

    const newBarcode = `${courier.substring(0, 3).toUpperCase()}-BAR-${timestampCode}-DH`;

    const newParcel = dispatchNewParcel({
      orderId: `FB-ORD-${timestampCode}`,
      traceId: newTraceId,
      dispatchType,
      customerName,
      customerPhone,
      deliveryAddress,
      courier,
      linkedTrxId: dispatchType !== '100% COD' ? linkedTrxId : undefined,
      advancePaidBDT: Number(advancePaidBDT) || 0,
      codCollectionBDT: Number(codCollectionBDT) || 0,
      deliveryFeeBDT: isFreeShipping ? 0 : Number(deliveryFeeBDT) || 80,
      marketingSubsidyBDT: isFreeShipping ? 120 : 0,
      barcodeTag: newBarcode
    });

    // Open shipping label preview modal!
    setActiveLabelModalParcel(newParcel);
  };

  // Filtered emails
  const filteredEmails = imapEmails.filter(em => {
    if (!emailSearch) return true;
    const q = emailSearch.toLowerCase();
    return em.trxId.toLowerCase().includes(q) ||
           em.senderMobile.includes(q) ||
           em.amount.toString().includes(q) ||
           em.provider.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-[#121212] border border-[#27272A] flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-[#FACC15]" />
            <h2 className="text-base font-bold text-[#FFFFFF] font-mono uppercase tracking-wide">
              Track B: Passive Ingestion & Universal Parcel Dispatch
            </h2>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Automated OTC merchant email scraping, single-click order assignment, and barcoded courier thermal shipping tags.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#050505] border border-[#27272A] text-xs font-mono text-[#22C55E]">
          <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>IMAP Listener: connected (port 993 SSL)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module 1: Passive IMAP Email Ingestion Feed */}
        <div className="lg:col-span-5 bg-[#121212] border border-[#27272A] rounded-2xl p-5 flex flex-col shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#FACC15]" />
              <h3 className="text-xs font-bold text-[#FFFFFF] font-mono uppercase tracking-wide">
                Passive IMAP Email Feed
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/30">
              Scraping Active
            </span>
          </div>

          <p className="text-[11px] text-[#A1A1AA] mt-2">
            Isolates Native TrxID, Sender MSISDN, and Amount from incoming bKash, Nagad, and Rocket notification emails.
          </p>

          {/* Search / Filter in feed */}
          <div className="relative mt-3">
            <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              placeholder="Filter by TrxID, Mobile or Amount..."
              className="w-full bg-[#050505] border border-[#27272A] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#FFFFFF] font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#FACC15]"
            />
          </div>

          <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-1 custom-scrollbar">
            {filteredEmails.map(em => {
              const isSelected = selectedEmailForDispatch?.id === em.id || linkedTrxId === em.trxId;
              const isLinked = em.status === 'LINKED_TO_PARCEL';

              return (
                <div
                  key={em.id}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#050505] border-[#FACC15] shadow-sm shadow-[#FACC15]/20'
                      : 'bg-[#050505]/70 border-[#27272A] hover:border-zinc-700'
                  }`}
                  onClick={() => handleSelectEmail(em)}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#A1A1AA]">{em.receivedAt}</span>
                    {/* Status Badges: AWAITING_SHIPMENT_DISPATCH vs CONVERTED_TO_TRACEID_SHIPMENT */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isLinked
                        ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40'
                        : 'bg-[#FACC15]/20 text-[#FACC15] border-[#FACC15]/40'
                    }`}>
                      {isLinked ? 'CONVERTED_TO_TRACEID_SHIPMENT' : 'AWAITING_SHIPMENT_DISPATCH'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-bold text-[#FFFFFF] font-mono flex items-center justify-between">
                    <span className={em.provider === 'bKash' ? 'text-pink-400' : 'text-amber-400'}>
                      {em.provider}
                    </span>
                    <span className="text-[#22C55E] font-extrabold">{formatBDT(em.amount)}</span>
                  </div>

                  {/* Isolated Values Box */}
                  <div className="mt-2 p-2 rounded-lg bg-[#121212] border border-[#27272A] text-[11px] font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#A1A1AA]">Native TrxID:</span>
                      <span className="text-[#FACC15] font-bold bg-[#050505] px-1.5 py-0.5 rounded border border-[#27272A]">
                        {em.trxId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A1A1AA]">Sender Mobile:</span>
                      <span className="text-[#FFFFFF]">{em.senderMobile}</span>
                    </div>
                  </div>

                  <p className="mt-2 text-[10px] text-[#A1A1AA] font-mono line-clamp-2">
                    {em.rawBody}
                  </p>

                  <div className="mt-2 pt-2 border-t border-[#27272A] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPayloadEmail(em);
                      }}
                      className="text-[10px] font-mono text-[#A1A1AA] hover:text-[#FFFFFF] flex items-center gap-1 cursor-pointer"
                    >
                      <FileCode className="w-3 h-3 text-[#FACC15]" />
                      <span>Inspect Payload</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectEmail(em);
                      }}
                      className="text-[10px] font-mono text-[#FACC15] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Auto-fill Dispatch Form</span>
                      <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module 2: Universal Parcel Dispatch Form */}
        <div className="lg:col-span-7 bg-[#121212] border border-[#27272A] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FACC15]" />
              <h3 className="text-xs font-bold text-[#FFFFFF] font-mono uppercase tracking-wide">
                TraceID Universal Parcel Dispatch Form
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#A1A1AA]">
              Generates TraceID + Barcode Tag
            </span>
          </div>

          <form onSubmit={handleGenerateAndDispatch} className="mt-4 space-y-4 font-mono text-xs">
            {/* 4 Dispatch Options Selector */}
            <div>
              <label className="text-[11px] text-[#A1A1AA] block mb-1.5 uppercase font-semibold">
                Select Dispatch Scheme:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: '100% Pre-Paid', label: '100% Pre-Paid', desc: 'Full Advance Received' },
                  { id: '100% COD', label: '100% COD', desc: 'Doorstep Payment' },
                  { id: 'Split Advance Paid', label: 'Split Advance', desc: 'Delivery Adv + COD' },
                  { id: 'Free Shipping', label: 'Free Delivery', desc: 'Promo Absorbed' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleTypeChange(opt.id as any)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      dispatchType === opt.id
                        ? 'bg-[#050505] border-[#FACC15] text-[#FFFFFF] shadow-sm shadow-[#FACC15]/20'
                        : 'bg-[#050505] border-[#27272A] text-[#A1A1AA] hover:text-[#FFFFFF]'
                    }`}
                  >
                    <div className={`font-bold text-xs ${dispatchType === opt.id ? 'text-[#FACC15]' : 'text-zinc-200'}`}>
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-[#A1A1AA] mt-0.5 truncate">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#A1A1AA] block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  placeholder="e.g. Sumaiya Akhter"
                  className="w-full bg-[#050505] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#FFFFFF] font-mono focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#A1A1AA] block mb-1">Contact Mobile Number</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  placeholder="017xxxxxxxx"
                  className="w-full bg-[#050505] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#FFFFFF] font-mono focus:outline-none focus:border-[#FACC15]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#A1A1AA] block mb-1">Delivery Address (Thana / District)</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
                rows={2}
                placeholder="Full delivery location address"
                className="w-full bg-[#050505] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#FFFFFF] font-mono focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            {/* Financials & Linked TrxID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[#A1A1AA] block mb-1">Advance Paid (BDT)</label>
                <input
                  type="number"
                  value={advancePaidBDT}
                  onChange={(e) => setAdvancePaidBDT(Number(e.target.value))}
                  className="w-full bg-[#050505] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#22C55E] font-bold font-mono focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#A1A1AA] block mb-1">Cash to Collect COD (BDT)</label>
                <input
                  type="number"
                  value={codCollectionBDT}
                  onChange={(e) => setCodCollectionBDT(Number(e.target.value))}
                  className="w-full bg-[#050505] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#FACC15] font-bold font-mono focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#A1A1AA] block mb-1">3PL Courier Partner</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value as any)}
                  className="w-full bg-[#050505] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#FFFFFF] font-mono focus:outline-none focus:border-[#FACC15]"
                >
                  <option value="Pathao Courier">Pathao Courier</option>
                  <option value="Steadfast">Steadfast</option>
                  <option value="RedX">RedX</option>
                </select>
              </div>
            </div>

            {/* Linked TrxID Input */}
            {dispatchType !== '100% COD' && (
              <div>
                <label className="text-[11px] text-[#A1A1AA] block mb-1">Linked Scraped MFS TrxID</label>
                <input
                  type="text"
                  value={linkedTrxId}
                  onChange={(e) => setLinkedTrxId(e.target.value)}
                  placeholder="e.g. BLM9A2K4X7"
                  className="w-full bg-[#050505] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#FACC15] font-bold font-mono focus:outline-none focus:border-[#FACC15]"
                />
              </div>
            )}

            {/* Submit Action: Bold Yellow Button */}
            <button
              id="dispatch-parcel-btn"
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-bold text-xs tracking-wider shadow-lg shadow-[#FACC15]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              <BarcodeIcon className="w-4 h-4 stroke-[2.5]" />
              <span>DISPATCH PARCEL & GENERATE TRACEID BARCODE</span>
            </button>
          </form>

          {/* Dispatched parcels micro-list */}
          <div className="mt-6 pt-4 border-t border-[#27272A]">
            <h4 className="text-xs font-bold text-[#FFFFFF] font-mono uppercase mb-2">
              Recent Dispatches ({dispatchedParcels.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {dispatchedParcels.map(p => (
                <div 
                  key={p.orderId}
                  className="p-2.5 rounded-xl bg-[#050505] border border-[#27272A] flex items-center justify-between text-[11px] font-mono"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#FFFFFF]">{p.orderId}</span>
                      <span className="text-[#FACC15] font-bold">{p.traceId}</span>
                    </div>
                    <div className="text-[10px] text-[#A1A1AA] mt-0.5">
                      {p.customerName} • {p.courier} • {p.dispatchType}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveLabelModalParcel(p)}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[#FFFFFF] text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Printer className="w-3 h-3 text-[#FACC15]" />
                    <span>Print Label</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payload Inspection Modal */}
      {selectedPayloadEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121212] border border-[#27272A] rounded-2xl w-full max-w-lg shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#FACC15]" />
                <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
                  Raw Ingested Email Payload Inspector
                </h3>
              </div>
              <button
                onClick={() => setSelectedPayloadEmail(null)}
                className="p-1 text-[#A1A1AA] hover:text-[#FFFFFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#050505] border border-[#27272A] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Email Subject:</span>
                  <span className="text-[#FFFFFF]">{selectedPayloadEmail.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Sender MSISDN:</span>
                  <span className="text-[#FACC15]">{selectedPayloadEmail.senderMobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Extracted TrxID:</span>
                  <span className="text-[#22C55E] font-bold">{selectedPayloadEmail.trxId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Amount:</span>
                  <span className="text-[#FFFFFF] font-bold">{formatBDT(selectedPayloadEmail.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Received Timestamp:</span>
                  <span className="text-[#A1A1AA]">{selectedPayloadEmail.receivedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">SHA-256 Hash Stamp:</span>
                  <span className="text-zinc-400 text-[10px] truncate max-w-[200px]">
                    {selectedPayloadEmail.rawEmailHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#A1A1AA] block mb-1">Raw IMAP Body:</span>
                <pre className="p-3 rounded-lg bg-[#050505] border border-[#27272A] text-[11px] text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                  {selectedPayloadEmail.rawBody}
                </pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#27272A] flex justify-end">
              <button
                onClick={() => setSelectedPayloadEmail(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
