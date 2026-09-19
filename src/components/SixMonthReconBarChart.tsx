import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useRecon } from '../context/ReconContext';
import { BarChart3, Calendar, Info, Layers, RefreshCw, TrendingUp } from 'lucide-react';

export const SixMonthReconBarChart: React.FC<{ titlePrefix?: string }> = ({ titlePrefix = '6-Month' }) => {
  const {
    historicalDailyData,
    historicalWeeklyData,
    historicalMonthlyData
  } = useRecon();

  const [granularity, setGranularity] = useState<'monthly' | 'weekly' | 'daily'>('monthly');

  const currentData =
    granularity === 'monthly'
      ? historicalMonthlyData
      : granularity === 'weekly'
      ? historicalWeeklyData
      : historicalDailyData;

  // Compute aggregated totals
  const totalVolume = currentData.reduce((acc, curr) => acc + curr.totalBDT, 0);
  const totalOrders = currentData.reduce((acc, curr) => acc + curr.orderCount, 0);
  const advanceVolume = currentData.reduce((acc, curr) => acc + curr.fullAdvanceBDT, 0);
  const splitVolume = currentData.reduce((acc, curr) => acc + curr.splitPaymentBDT, 0);
  const codVolume = currentData.reduce((acc, curr) => acc + curr.fullCodBDT, 0);

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-[#0A0F1D] border border-[#233354] rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
            <span className="font-semibold text-white">{dataPoint.displayLabel || label}</span>
            <span className="font-mono text-cyan-400 font-bold">{dataPoint.orderCount?.toLocaleString()} Orders</span>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Full Advance:
              </span>
              <span className="font-mono font-medium text-emerald-400">BDT {dataPoint.fullAdvanceBDT.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Split Payment:
              </span>
              <span className="font-mono font-medium text-blue-400">BDT {dataPoint.splitPaymentBDT.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Full COD:
              </span>
              <span className="font-mono font-medium text-amber-400">BDT {dataPoint.fullCodBDT.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                Free Delivery Absorbed:
              </span>
              <span className="font-mono font-medium text-indigo-300">BDT {dataPoint.freeDeliveryBDT.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between font-bold text-white">
              <span>Total Settled:</span>
              <span className="font-mono text-cyan-300">BDT {dataPoint.totalBDT.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="six-month-visual-bar-card" className="rounded-2xl bg-[#0D1426] border border-[#1E293B] p-4 sm:p-6 shadow-xl space-y-5">
      {/* Top Header & Granularity Toggles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {titlePrefix} Visual Order & Payment Ledger
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Post-Day Settlement Transfer • Full Advance vs Split vs COD vs Free Delivery
              </p>
            </div>
          </div>
        </div>

        {/* View Granularity Switcher */}
        <div className="flex items-center gap-1 bg-[#090D18] p-1 rounded-xl border border-[#1E293B] w-full sm:w-auto justify-between sm:justify-start">
          <button
            id="bar-granularity-monthly"
            onClick={() => setGranularity('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              granularity === 'monthly'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            6-Month
          </button>
          <button
            id="bar-granularity-weekly"
            onClick={() => setGranularity('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              granularity === 'weekly'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly
          </button>
          <button
            id="bar-granularity-daily"
            onClick={() => setGranularity('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              granularity === 'daily'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-[#090D18] border border-[#1A2338] p-3">
          <div className="text-[11px] text-slate-400">Total Filtered Volume</div>
          <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
            BDT {totalVolume.toLocaleString()}
          </div>
          <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{totalOrders.toLocaleString()} verified orders</div>
        </div>
        <div className="rounded-xl bg-[#090D18] border border-[#1A2338] p-3">
          <div className="text-[11px] text-emerald-400">Full Advance</div>
          <div className="text-sm sm:text-base font-bold font-mono text-emerald-300 mt-0.5">
            BDT {advanceVolume.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {Math.round((advanceVolume / (totalVolume || 1)) * 100)}% of total
          </div>
        </div>
        <div className="rounded-xl bg-[#090D18] border border-[#1A2338] p-3">
          <div className="text-[11px] text-blue-400">Split Payment</div>
          <div className="text-sm sm:text-base font-bold font-mono text-blue-300 mt-0.5">
            BDT {splitVolume.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {Math.round((splitVolume / (totalVolume || 1)) * 100)}% of total
          </div>
        </div>
        <div className="rounded-xl bg-[#090D18] border border-[#1A2338] p-3">
          <div className="text-[11px] text-amber-400">Full COD Collected</div>
          <div className="text-sm sm:text-base font-bold font-mono text-amber-300 mt-0.5">
            BDT {codVolume.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {Math.round((codVolume / (totalVolume || 1)) * 100)}% of total
          </div>
        </div>
      </div>

      {/* Interactive Bar Chart */}
      <div className="h-64 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="displayLabel"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
              interval={0}
              angle={granularity === 'daily' ? -35 : 0}
              textAnchor={granularity === 'daily' ? 'end' : 'middle'}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              formatter={(value) => {
                const map: Record<string, string> = {
                  fullAdvanceBDT: 'Full Advance',
                  splitPaymentBDT: 'Split Payment',
                  fullCodBDT: 'Full COD',
                  freeDeliveryBDT: 'Free Delivery'
                };
                return <span className="text-slate-300 mr-2">{map[value] || value}</span>;
              }}
            />
            <Bar dataKey="fullAdvanceBDT" stackId="recon" fill="#10B981" radius={[0, 0, 0, 0]} name="fullAdvanceBDT" />
            <Bar dataKey="splitPaymentBDT" stackId="recon" fill="#3B82F6" radius={[0, 0, 0, 0]} name="splitPaymentBDT" />
            <Bar dataKey="fullCodBDT" stackId="recon" fill="#F59E0B" radius={[0, 0, 0, 0]} name="fullCodBDT" />
            <Bar dataKey="freeDeliveryBDT" stackId="recon" fill="#818CF8" radius={[4, 4, 0, 0]} name="freeDeliveryBDT" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Explanatory Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 bg-[#090D18] rounded-xl p-3 border border-[#1A2338]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Data transfers automatically from daily incoming intake into this historical partition upon day closure.
          </span>
        </div>
        <span className="font-mono text-cyan-400 shrink-0">
          Showing {currentData.length} records • Indexed by fiscal partition
        </span>
      </div>
    </div>
  );
};
