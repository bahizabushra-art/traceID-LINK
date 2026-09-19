import React, { useState } from 'react';
import { useRecon } from '../context/ReconContext';
import { PaymentSchemeType } from '../types';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Flame,
  PlusCircle,
  RotateCw,
  Send,
  Truck,
  Zap
} from 'lucide-react';

export const DailyPaymentLiveWidget: React.FC<{ trackName?: string }> = ({ trackName = 'Track' }) => {
  const {
    dailyPaymentBreakdown,
    simulateIncomingPayment,
    closeDayAndTransferToHistory
  } = useRecon();

  const [notification, setNotification] = useState<string | null>(null);
  const [isClosingDay, setIsClosingDay] = useState<boolean>(false);

  const handleSimulate = (scheme: PaymentSchemeType) => {
    simulateIncomingPayment(scheme);
    const label =
      scheme === 'FULL_ADVANCE'
        ? 'Full Advance Payment (bKash/Nagad)'
        : scheme === 'SPLIT_PAYMENT'
        ? 'Split Payment (Delivery Charge Advance + COD)'
        : scheme === 'FULL_COD'
        ? 'Full Cash On Delivery'
        : 'Free Delivery Order';
    setNotification(`⚡ New customer payment received for ${label}!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCloseDay = () => {
    setIsClosingDay(true);
    setTimeout(() => {
      const res = closeDayAndTransferToHistory();
      setIsClosingDay(false);
      setNotification(`✅ ${res.message}`);
      setTimeout(() => setNotification(null), 6000);
    }, 1200);
  };

  return (
    <div id="daily-payment-live-card" className="rounded-2xl bg-[#0D1426] border border-[#1E293B] p-4 sm:p-6 shadow-xl space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Live Daily Inbound Payments
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE INGESTION
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Live customer transaction counter across 4 payment schemes • Date: {dailyPaymentBreakdown.date}
            </p>
          </div>
        </div>

        {/* Action Button: Close Day & Transfer to 6-Month Ledger */}
        <button
          id="close-day-transfer-btn"
          onClick={handleCloseDay}
          disabled={isClosingDay}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50 transition-all min-h-[40px] shrink-0"
        >
          {isClosingDay ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Transferring to 6-Month Ledger...</span>
            </>
          ) : (
            <>
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Close Day & Transfer Data to Visual Bar</span>
            </>
          )}
        </button>
      </div>

      {/* Live Toast Notification */}
      {notification && (
        <div className="p-3 rounded-xl bg-blue-950/80 border border-cyan-500/40 text-xs text-cyan-200 flex items-center gap-2 animate-fadeIn">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="flex-1 font-medium">{notification}</span>
        </div>
      )}

      {/* 4 Live Scheme Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Full Advance */}
        <div className="rounded-xl bg-[#090D18] border border-emerald-500/30 p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">1. Full Advance</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              bKash / Nagad
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
              BDT {dailyPaymentBreakdown.fullAdvanceBDT.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Customer Tally:</span>
              <span className="text-emerald-400 font-bold">{dailyPaymentBreakdown.fullAdvanceCount} paid orders</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-tight">
            100% prepaid in advance. Zero COD risk, courier collects ৳0 at doorstep.
          </div>

          {/* Live Sim Trigger */}
          <button
            onClick={() => handleSimulate('FULL_ADVANCE')}
            className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate Customer Advance (+৳)</span>
          </button>
        </div>

        {/* 2. Split Payment */}
        <div className="rounded-xl bg-[#090D18] border border-blue-500/30 p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-xs font-semibold text-blue-300">2. Split Payment</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              Advance + COD
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
              BDT {dailyPaymentBreakdown.splitTotalBDT.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Customer Tally:</span>
              <span className="text-blue-400 font-bold">{dailyPaymentBreakdown.splitPaymentCount} paid orders</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span>Advance MFS:</span>
              <span className="text-slate-200">BDT {dailyPaymentBreakdown.splitAdvanceBDT.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>COD Doorstep:</span>
              <span className="text-slate-200">BDT {dailyPaymentBreakdown.splitCodBDT.toLocaleString()}</span>
            </div>
          </div>

          {/* Live Sim Trigger */}
          <button
            onClick={() => handleSimulate('SPLIT_PAYMENT')}
            className="w-full py-1.5 px-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-blue-500/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate Customer Split (+৳)</span>
          </button>
        </div>

        {/* 3. Full COD */}
        <div className="rounded-xl bg-[#090D18] border border-amber-500/30 p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-amber-300">3. Full COD</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Pathao / Steadfast
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
              BDT {dailyPaymentBreakdown.fullCodBDT.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Customer Tally:</span>
              <span className="text-amber-400 font-bold">{dailyPaymentBreakdown.fullCodCount} paid orders</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-tight">
            100% collectable at customer delivery point. Subject to 1% COD courier commission.
          </div>

          {/* Live Sim Trigger */}
          <button
            onClick={() => handleSimulate('FULL_COD')}
            className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-amber-500/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate COD Delivery (+৳)</span>
          </button>
        </div>

        {/* 4. Free Delivery */}
        <div className="rounded-xl bg-[#090D18] border border-indigo-500/30 p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300">4. Free Delivery</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              Absorbed Promo
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
              {dailyPaymentBreakdown.freeDeliveryCount} Orders
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Absorbed Subsidy:</span>
              <span className="text-indigo-400 font-bold">BDT {dailyPaymentBreakdown.freeDeliveryAbsorbedBDT.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-tight">
            Customer charged ৳0 delivery. Merchant absorbs courier transit expense.
          </div>

          {/* Live Sim Trigger */}
          <button
            onClick={() => handleSimulate('FREE_DELIVERY')}
            className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-500/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate Free Delivery Order</span>
          </button>
        </div>
      </div>

      {/* Today's Consolidated Running Tally */}
      <div className="rounded-xl bg-[#090D18] border border-[#1A2338] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Today's Inbound Net Intake across All Categories:</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white">
              BDT {dailyPaymentBreakdown.totalVolumeBDT.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">({dailyPaymentBreakdown.totalOrdersCount} Total Transactions)</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono text-right flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next Automated Midnight Ledger Transfer in 14h 22m</span>
        </div>
      </div>
    </div>
  );
};
