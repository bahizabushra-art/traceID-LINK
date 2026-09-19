import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useRecon } from '../../context/ReconContext';
import { INITIAL_MONTHLY_SETTLEMENT_METRICS, formatBDT } from '../../data/mockData';
import { MonthlySettlementMetric } from '../../types';
import {
  PieChart as PieIcon,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Info,
  Sliders,
  DollarSign,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Building2,
  AlertOctagon
} from 'lucide-react';

const COLORS = {
  balanced: '#10B981',     // Emerald Green
  underSettled: '#F43F5E', // Rose / Red
  overSettled: '#F59E0B'   // Amber / Gold
};

export const PerformanceMetricsView: React.FC = () => {
  const {
    isBankVarianceToggled,
    setIsBankVarianceToggled,
    mfsTotal,
    codTotal,
    bankDepositLine,
    auditRecords
  } = useRecon();

  // Selected period key: 'ALL' or specific periodKey e.g. '2026-09'
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>('2026-09');
  const [activeSliceIndex, setActiveSliceIndex] = useState<number | null>(null);
  const [metricExportToast, setMetricExportToast] = useState<string | null>(null);

  // Compute live adjusted monthly metrics if Bank Variance is toggled
  const monthlyMetrics: MonthlySettlementMetric[] = useMemo(() => {
    return INITIAL_MONTHLY_SETTLEMENT_METRICS.map(m => {
      // If current month (Sep 2026) and variance is toggled, reflect the live simulated 10k under-settled gap
      if (m.periodKey === '2026-09' && isBankVarianceToggled) {
        const extraGap = 10000;
        const newUnder = m.underSettledBDT + extraGap;
        const newBalanced = m.balancedBDT - extraGap;
        const newRate = Number(((newBalanced / m.totalTransactionsBDT) * 100).toFixed(1));
        const newUnderRatio = Number(((newUnder / m.totalTransactionsBDT) * 100).toFixed(1));
        return {
          ...m,
          balancedBDT: newBalanced,
          underSettledBDT: newUnder,
          settlementSuccessRate: newRate,
          balancedRatio: newRate,
          underSettledRatio: newUnderRatio,
          underSettledReasons: {
            ...m.underSettledReasons,
            courierRiderHoldingBDT: m.underSettledReasons.courierRiderHoldingBDT + extraGap
          }
        };
      }
      return m;
    });
  }, [isBankVarianceToggled]);

  // Consolidated "All 6 Months" aggregation
  const consolidatedMetric: MonthlySettlementMetric = useMemo(() => {
    const totalTransactionsBDT = monthlyMetrics.reduce((acc, m) => acc + m.totalTransactionsBDT, 0);
    const totalOrderCount = monthlyMetrics.reduce((acc, m) => acc + m.totalOrderCount, 0);
    const balancedBDT = monthlyMetrics.reduce((acc, m) => acc + m.balancedBDT, 0);
    const balancedCount = monthlyMetrics.reduce((acc, m) => acc + m.balancedCount, 0);
    const underSettledBDT = monthlyMetrics.reduce((acc, m) => acc + m.underSettledBDT, 0);
    const underSettledCount = monthlyMetrics.reduce((acc, m) => acc + m.underSettledCount, 0);
    const overSettledBDT = monthlyMetrics.reduce((acc, m) => acc + m.overSettledBDT, 0);
    const overSettledCount = monthlyMetrics.reduce((acc, m) => acc + m.overSettledCount, 0);

    const balancedRatio = Number(((balancedBDT / totalTransactionsBDT) * 100).toFixed(1));
    const underSettledRatio = Number(((underSettledBDT / totalTransactionsBDT) * 100).toFixed(1));
    const overSettledRatio = Number(((overSettledBDT / totalTransactionsBDT) * 100).toFixed(1));

    return {
      periodKey: 'ALL',
      displayMonth: 'All 6 Months (Consolidated)',
      shortLabel: 'All 6M',
      totalTransactionsBDT,
      totalOrderCount,
      settlementSuccessRate: balancedRatio,
      balancedBDT,
      balancedCount,
      balancedRatio,
      underSettledBDT,
      underSettledCount,
      underSettledRatio,
      overSettledBDT,
      overSettledCount,
      overSettledRatio,
      underSettledReasons: {
        courierRiderHoldingBDT: monthlyMetrics.reduce((acc, m) => acc + m.underSettledReasons.courierRiderHoldingBDT, 0),
        feeSlaOverchargeBDT: monthlyMetrics.reduce((acc, m) => acc + m.underSettledReasons.feeSlaOverchargeBDT, 0),
        ghostDebitsBlockedBDT: monthlyMetrics.reduce((acc, m) => acc + m.underSettledReasons.ghostDebitsBlockedBDT, 0)
      },
      overSettledReasons: {
        duplicateMfsCreditsBDT: monthlyMetrics.reduce((acc, m) => acc + m.overSettledReasons.duplicateMfsCreditsBDT, 0),
        promotionalRebatesBDT: monthlyMetrics.reduce((acc, m) => acc + m.overSettledReasons.promotionalRebatesBDT, 0)
      },
      settlementBatchesCount: monthlyMetrics.reduce((acc, m) => acc + m.settlementBatchesCount, 0),
      bankSettlementLineBDT: balancedBDT,
      reconciliationAuditChecksum: 'SHA256-CONS-6M-AUDITED'
    };
  }, [monthlyMetrics]);

  // Current active metric based on selection
  const currentMetric: MonthlySettlementMetric = useMemo(() => {
    if (selectedPeriodKey === 'ALL') {
      return consolidatedMetric;
    }
    return monthlyMetrics.find(m => m.periodKey === selectedPeriodKey) || monthlyMetrics[0];
  }, [selectedPeriodKey, monthlyMetrics, consolidatedMetric]);

  // Data formatted strictly for Recharts Pie Chart
  const pieChartData = useMemo(() => {
    return [
      {
        name: 'Balanced',
        value: currentMetric.balancedBDT,
        count: currentMetric.balancedCount,
        ratio: currentMetric.balancedRatio,
        color: COLORS.balanced,
        description: 'Settlements verified and matching bank statement lines exactly.'
      },
      {
        name: 'Under-Settled',
        value: currentMetric.underSettledBDT,
        count: currentMetric.underSettledCount,
        ratio: currentMetric.underSettledRatio,
        color: COLORS.underSettled,
        description: 'Unsettled courier transit holdings, SLA fee overcharges, and blocked ghost returns.'
      },
      {
        name: 'Over-Settled',
        value: currentMetric.overSettledBDT,
        count: currentMetric.overSettledCount,
        ratio: currentMetric.overSettledRatio,
        color: COLORS.overSettled,
        description: 'Duplicate webhook callbacks, promotional rebates, and courier credit adjustments.'
      }
    ];
  }, [currentMetric]);

  // Month navigation helpers
  const periodKeysList = ['ALL', ...monthlyMetrics.map(m => m.periodKey)];
  const currentIndex = periodKeysList.indexOf(selectedPeriodKey);
  const handlePrevMonth = () => {
    if (currentIndex > 0) {
      setSelectedPeriodKey(periodKeysList[currentIndex - 1]);
    }
  };
  const handleNextMonth = () => {
    if (currentIndex < periodKeysList.length - 1) {
      setSelectedPeriodKey(periodKeysList[currentIndex + 1]);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Period',
      'Total Transactions (BDT)',
      'Total Orders',
      'Success Rate (%)',
      'Balanced (BDT)',
      'Balanced Ratio (%)',
      'Under-Settled (BDT)',
      'Under-Settled Ratio (%)',
      'Over-Settled (BDT)',
      'Over-Settled Ratio (%)',
      'Courier Rider Holding (BDT)',
      'Fee SLA Overcharge (BDT)',
      'Ghost Debits Blocked (BDT)',
      'Duplicate MFS Credits (BDT)'
    ];

    const rows = monthlyMetrics.map(m => [
      `"${m.displayMonth}"`,
      m.totalTransactionsBDT,
      m.totalOrderCount,
      m.settlementSuccessRate,
      m.balancedBDT,
      m.balancedRatio,
      m.underSettledBDT,
      m.underSettledRatio,
      m.overSettledBDT,
      m.overSettledRatio,
      m.underSettledReasons.courierRiderHoldingBDT,
      m.underSettledReasons.feeSlaOverchargeBDT,
      m.underSettledReasons.ghostDebitsBlockedBDT,
      m.overSettledReasons.duplicateMfsCreditsBDT
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Monthly_Settlement_Performance_Metrics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMetricExportToast('Settlement performance metrics CSV exported successfully!');
    setTimeout(() => setMetricExportToast(null), 3500);
  };

  // Custom Tooltip for Recharts Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0A0F1D] border border-[#233354] rounded-xl p-3.5 shadow-2xl text-xs space-y-2 min-w-[240px] font-sans">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
            <span className="flex items-center gap-2 font-bold text-white">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
              {data.name}
            </span>
            <span className="font-mono text-cyan-400 font-bold text-xs bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              {data.ratio}% of Total
            </span>
          </div>

          <div className="space-y-1.5 pt-1 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Transaction Volume:</span>
              <span className="font-mono font-bold text-white text-sm">
                {formatBDT(data.value)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Order Count:</span>
              <span className="font-mono font-medium text-slate-200">
                {data.count.toLocaleString()} orders
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 leading-relaxed">
            {data.description}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header and Month Selector Bar */}
      <div className="bg-[#0F172A] border border-[#1F293D] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-cyan-400">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-mono uppercase">
                  <span>Settlement Success Performance Metrics</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-sans font-medium normal-case">
                    Dynamic Recharts Visualizer
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monthly audit ratio of <span className="text-emerald-400 font-medium">Balanced</span>, <span className="text-rose-400 font-medium">Under-Settled</span>, and <span className="text-amber-400 font-medium">Over-Settled</span> transaction totals.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Live Gap Simulation */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="export-metrics-csv-btn"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-[#141E36] hover:bg-[#1C2B4E] border border-[#233354] text-cyan-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Metrics (CSV)</span>
            </button>

            <button
              id="metrics-variance-toggle-btn"
              onClick={() => setIsBankVarianceToggled(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                isBankVarianceToggled
                  ? 'bg-rose-950 text-rose-300 border-rose-700 hover:bg-rose-900'
                  : 'bg-[#141E36] text-slate-300 border-[#233354] hover:bg-[#1C2B4E]'
              }`}
              title="Test dynamic chart updating with an active gap"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isBankVarianceToggled ? 'Reset Gap (100% Balanced)' : 'Simulate Under-Settled Gap'}</span>
            </button>
          </div>
        </div>

        {/* Month Selector Pills */}
        <div className="mt-5 pt-4 border-t border-[#1F293D] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1 shrink-0 mr-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Fiscal Period:
            </span>

            <button
              onClick={() => setSelectedPeriodKey('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                selectedPeriodKey === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500'
                  : 'bg-[#0A0F1D] text-slate-400 hover:text-white border border-[#1F293D]'
              }`}
            >
              All 6 Months (Consolidated)
            </button>

            {monthlyMetrics.map(metric => (
              <button
                key={metric.periodKey}
                onClick={() => setSelectedPeriodKey(metric.periodKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  selectedPeriodKey === metric.periodKey
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 border border-cyan-400'
                    : 'bg-[#0A0F1D] text-slate-400 hover:text-white border border-[#1F293D]'
                }`}
              >
                <span>{metric.displayMonth}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  metric.settlementSuccessRate >= 97.5 ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <button
              onClick={handlePrevMonth}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded bg-[#0A0F1D] border border-[#1F293D] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous Period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-1 rounded bg-[#0A0F1D] border border-[#1F293D] text-white font-bold">
              {currentMetric.displayMonth}
            </span>
            <button
              onClick={handleNextMonth}
              disabled={currentIndex >= periodKeysList.length - 1}
              className="p-1.5 rounded bg-[#0A0F1D] border border-[#1F293D] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {metricExportToast && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{metricExportToast}</span>
        </div>
      )}

      {/* 2. Top Metric KPI Ratio Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Settlement Success Rate */}
        <div className="bg-[#0F172A] border border-[#1F293D] rounded-xl p-4 relative overflow-hidden group hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Settlement Success Rate</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ShieldCheck className="w-3 h-3" />
              SLA Target Met
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight flex items-baseline gap-1">
              <span>{currentMetric.settlementSuccessRate}%</span>
              <span className="text-xs font-sans text-emerald-400 font-normal">Balanced Ratio</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentMetric.balancedCount.toLocaleString()} / {currentMetric.totalOrderCount.toLocaleString()} orders</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${currentMetric.settlementSuccessRate}%` }}
            />
          </div>
        </div>

        {/* KPI 2: 'Balanced' Volume */}
        <div className="bg-[#0F172A] border border-[#1F293D] rounded-xl p-4 relative overflow-hidden group hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-mono text-slate-300 font-bold">Balanced Total</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              {currentMetric.balancedRatio}% Ratio
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              {formatBDT(currentMetric.balancedBDT)}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Verified Ledger Lines</span>
              <span className="text-slate-300">{currentMetric.balancedCount.toLocaleString()} tx</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 truncate">
            100% satisfied in bank settlement batches
          </div>
        </div>

        {/* KPI 3: 'Under-Settled' Volume */}
        <div className="bg-[#0F172A] border border-[#1F293D] rounded-xl p-4 relative overflow-hidden group hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-xs font-mono text-slate-300 font-bold">Under-Settled Total</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
              {currentMetric.underSettledRatio}% Ratio
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-rose-400 tracking-tight">
              {formatBDT(currentMetric.underSettledBDT)}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Outstanding Shortfall</span>
              <span className="text-slate-300">{currentMetric.underSettledCount.toLocaleString()} tx</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-rose-300/80 truncate">
            Courier rider holdings & SLA fee variances
          </div>
        </div>

        {/* KPI 4: 'Over-Settled' Volume */}
        <div className="bg-[#0F172A] border border-[#1F293D] rounded-xl p-4 relative overflow-hidden group hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-xs font-mono text-slate-300 font-bold">Over-Settled Total</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
              {currentMetric.overSettledRatio}% Ratio
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
              {formatBDT(currentMetric.overSettledBDT)}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Credit Over-Remittance</span>
              <span className="text-slate-300">{currentMetric.overSettledCount.toLocaleString()} tx</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-amber-300/80 truncate">
            Duplicate webhooks & promotional adjustments
          </div>
        </div>
      </div>

      {/* 3. Core Visualization Grid: Recharts Pie Chart + Diagnostic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Dynamic Recharts Pie Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-[#1F293D] rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-[#1F293D]">
            <div>
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Settlement Ratio Distribution — {currentMetric.displayMonth}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Proportional breakdown of gross transaction volume by settlement status.
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="text-[11px] text-slate-400 uppercase">Gross Audited</span>
              <div className="text-sm font-bold text-white">
                {formatBDT(currentMetric.totalTransactionsBDT)}
              </div>
            </div>
          </div>

          {/* Interactive Pie Chart Container */}
          <div className="relative py-4 flex items-center justify-center">
            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={82}
                    outerRadius={135}
                    paddingAngle={3.5}
                    dataKey="value"
                    animationDuration={900}
                    cornerRadius={6}
                    stroke="#0B0F19"
                    strokeWidth={3}
                    onMouseEnter={(_, index) => setActiveSliceIndex(index)}
                    onMouseLeave={() => setActiveSliceIndex(null)}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={activeSliceIndex === null || activeSliceIndex === index ? 1 : 0.65}
                        style={{ outline: 'none', cursor: 'pointer' }}
                      />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string, entry: any) => {
                      const payload = entry.payload;
                      return (
                        <span className="text-xs font-mono text-slate-300 font-medium px-2">
                          {value}: <span className="font-bold text-white">{payload.ratio}%</span> ({formatBDT(payload.value)})
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Centered Donut Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[62%] text-center pointer-events-none">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block font-semibold">
                Success Rate
              </span>
              <span className="text-3xl font-extrabold font-mono text-emerald-400 tracking-tight block">
                {currentMetric.settlementSuccessRate}%
              </span>
              <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                {currentMetric.shortLabel}
              </span>
            </div>
          </div>

          {/* Ratio Summary Pill Row */}
          <div className="pt-3 border-t border-[#1F293D] grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-lg bg-[#102018] border border-emerald-900/60">
              <span className="text-[10px] text-emerald-300 uppercase font-semibold block">Balanced</span>
              <div className="text-sm font-bold text-white mt-0.5">{currentMetric.balancedRatio}%</div>
              <span className="text-[10px] text-slate-400">{formatBDT(currentMetric.balancedBDT)}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#241216] border border-rose-900/60">
              <span className="text-[10px] text-rose-300 uppercase font-semibold block">Under-Settled</span>
              <div className="text-sm font-bold text-white mt-0.5">{currentMetric.underSettledRatio}%</div>
              <span className="text-[10px] text-slate-400">{formatBDT(currentMetric.underSettledBDT)}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#241c10] border border-amber-900/60">
              <span className="text-[10px] text-amber-300 uppercase font-semibold block">Over-Settled</span>
              <div className="text-sm font-bold text-white mt-0.5">{currentMetric.overSettledRatio}%</div>
              <span className="text-[10px] text-slate-400">{formatBDT(currentMetric.overSettledBDT)}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Root Cause Diagnostics & Variance Attribution (5 cols) */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-[#1F293D] rounded-xl p-5 shadow-xl space-y-4">
          <div className="pb-3 border-b border-[#1F293D]">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Variance Attribution Diagnostics
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Root causes for settlement discrepancies detected in {currentMetric.displayMonth}.
            </p>
          </div>

          {/* Under-Settled Root Causes */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Under-Settled Drivers ({formatBDT(currentMetric.underSettledBDT)})
            </span>

            {/* Reason 1: Courier Rider Cash Holding */}
            <div className="p-3 rounded-lg bg-[#14121a] border border-[#2d1b28] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Courier Rider Cash Holding</span>
                <span className="font-mono font-bold text-rose-400">
                  {formatBDT(currentMetric.underSettledReasons.courierRiderHoldingBDT)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Customer doorstep cash collected by 3PL courier riders, pending banking batch deposit.
              </p>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (currentMetric.underSettledReasons.courierRiderHoldingBDT / currentMetric.underSettledBDT) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Reason 2: Fee SLA Overcharges */}
            <div className="p-3 rounded-lg bg-[#14121a] border border-[#2d1b28] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Logistics Return SLA Overcharges</span>
                <span className="font-mono font-bold text-rose-400">
                  {formatBDT(currentMetric.underSettledReasons.feeSlaOverchargeBDT)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Excess return fee deductions exceeding contract rate (e.g. BDT 90 charged vs BDT 60 contract).
              </p>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (currentMetric.underSettledReasons.feeSlaOverchargeBDT / currentMetric.underSettledBDT) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Reason 3: Ghost Debits Blocked */}
            <div className="p-3 rounded-lg bg-[#14121a] border border-[#2d1b28] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Ghost Debits Blocked at Gate</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatBDT(currentMetric.underSettledReasons.ghostDebitsBlockedBDT)} (Protected)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Unreceived reverse parcels flagged and prevented from unauthorized payout debits.
              </p>
            </div>
          </div>

          {/* Over-Settled Root Causes */}
          <div className="space-y-3 pt-2 border-t border-[#1F293D]">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Over-Settled Adjustments ({formatBDT(currentMetric.overSettledBDT)})
            </span>

            <div className="p-3 rounded-lg bg-[#181610] border border-[#332a18] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Duplicate MFS Gateway Webhooks</span>
                <span className="font-mono font-bold text-amber-400">
                  {formatBDT(currentMetric.overSettledReasons.duplicateMfsCreditsBDT)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Duplicate payment completion notifications de-duplicated via SHA256 settlement checksums.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#181610] border border-[#332a18] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Promotional Rebates & Adjustments</span>
                <span className="font-mono font-bold text-amber-400">
                  {formatBDT(currentMetric.overSettledReasons.promotionalRebatesBDT)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Subsidized promotional delivery fee credits refunded by 3PL logistics partner campaigns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Month-over-Month Success Rate Progression Comparison */}
      <div className="bg-[#0F172A] border border-[#1F293D] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F293D]">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                6-Month Settlement Success Rate Evolution
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Trend showing reduction in under-settled gaps as automated 3-way reconciliation was deployed.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Balanced
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Under-Settled
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Over-Settled
            </span>
          </div>
        </div>

        {/* Stacked Percentage Bar Visualizer */}
        <div className="mt-5 space-y-4">
          {monthlyMetrics.map(item => {
            const isSelected = item.periodKey === selectedPeriodKey;
            return (
              <div
                key={item.periodKey}
                onClick={() => setSelectedPeriodKey(item.periodKey)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#142038] border-cyan-500/80 shadow-md'
                    : 'bg-[#0A0F1D] border-[#1F293D] hover:border-slate-600'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-white">{item.displayMonth}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-emerald-400 font-bold">
                      {item.settlementSuccessRate}% Balanced
                    </span>
                    <span className="text-slate-400">
                      Total: <strong className="text-white">{formatBDT(item.totalTransactionsBDT)}</strong>
                    </span>
                    <span className="text-slate-400">
                      ({item.totalOrderCount.toLocaleString()} orders)
                    </span>
                  </div>
                </div>

                {/* Stacked Visual Bar */}
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${item.balancedRatio}%` }}
                    title={`Balanced: ${item.balancedRatio}% (${formatBDT(item.balancedBDT)})`}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${item.underSettledRatio}%` }}
                    title={`Under-Settled: ${item.underSettledRatio}% (${formatBDT(item.underSettledBDT)})`}
                  />
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${item.overSettledRatio}%` }}
                    title={`Over-Settled: ${item.overSettledRatio}% (${formatBDT(item.overSettledBDT)})`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Historical Monthly Batches Verification Table */}
      <div className="bg-[#0F172A] border border-[#1F293D] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F293D]">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Monthly Settlement Ledger Archive & Audit Verification
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Consolidated banking statement verification lines for Dhaka Bank Corp Account #2104-***-8801.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {monthlyMetrics.length} fiscal months stored in 180-day partition
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1F293D] text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Gross Transactions</th>
                <th className="py-2.5 px-3">Balanced Total</th>
                <th className="py-2.5 px-3">Under-Settled</th>
                <th className="py-2.5 px-3">Over-Settled</th>
                <th className="py-2.5 px-3">Success Rate</th>
                <th className="py-2.5 px-3">Audit Checksum</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2336]">
              {monthlyMetrics.map(m => (
                <tr
                  key={m.periodKey}
                  onClick={() => setSelectedPeriodKey(m.periodKey)}
                  className={`hover:bg-[#141e33] transition-colors cursor-pointer ${
                    m.periodKey === selectedPeriodKey ? 'bg-[#101b30]' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-semibold text-white">
                    {m.displayMonth}
                  </td>
                  <td className="py-3 px-3 text-slate-200">
                    {formatBDT(m.totalTransactionsBDT)}
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">
                    {formatBDT(m.balancedBDT)}
                  </td>
                  <td className="py-3 px-3 text-rose-400">
                    {formatBDT(m.underSettledBDT)}
                  </td>
                  <td className="py-3 px-3 text-amber-400">
                    {formatBDT(m.overSettledBDT)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {m.settlementSuccessRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[10px]">
                    {m.reconciliationAuditChecksum}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-cyan-300 border border-blue-800">
                      VERIFIED_SETTLED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
