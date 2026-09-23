import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRecon } from '../../context/ReconContext';
import { formatBDT } from '../../data/mockData';
import { 
  Archive, 
  Search, 
  Download, 
  Calendar, 
  Filter, 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CreditCard,
  Truck,
  Split,
  Gift,
  Package,
  Layers,
  FileSpreadsheet,
  Building2,
  Mail,
  ShieldCheck,
  Check,
  Globe,
  Store,
  Clock,
  ArrowDownToLine,
  ChevronRight
} from 'lucide-react';
import { downloadCsvFile } from '../../utils/csvReconEngine';

export const ReportsArchive: React.FC = () => {
  const { user } = useAuth();
  const { 
    currentTrack, 
    table1Prepaid, 
    table2COD, 
    table3Split, 
    table4Free, 
    returnParcels,
    reportBatches
  } = useRecon();

  const merchantEmail = user?.email || 'merchant@corporate.bd';
  const merchantCompany = user?.organization || user?.merchantName || 'Dhaka Multichannel Merchant Group';

  const [activeTableTab, setActiveTableTab] = useState<'T1' | 'T2' | 'T3' | 'T4' | 'T5'>('T1');
  const [channelFilter, setChannelFilter] = useState<'all' | 'track-a' | 'track-b'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateStart, setDateStart] = useState<string>('2026-09-01');
  const [dateEnd, setDateEnd] = useState<string>('2026-09-08');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Table 1: Full Pre-Payment Reconciled Output (100% MFS)
  const t1Data = [
    { traceId: 'TR-PRE-2026-A01', channel: 'track-a' as const, channelLabel: 'Track A: Website MFS', orderId: 'ORD-ADV-9011', customerName: 'Shakil Ahmed', orderAmount: 3800, mfsReceived: 3800, mfsCommission: 57, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-PRE-2026-X89', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7011', customerName: 'Tahmid Rahman', orderAmount: 3200, mfsReceived: 3200, mfsCommission: 48, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-PRE-2026-A02', channel: 'track-a' as const, channelLabel: 'Track A: Website MFS', orderId: 'ORD-ADV-9012', customerName: 'Farhana Yasmin', orderAmount: 5200, mfsReceived: 5200, mfsCommission: 78, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-PRE-2026-X90', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7012', customerName: 'Nabila Farhana', orderAmount: 5400, mfsReceived: 5400, mfsCommission: 81, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-PRE-2026-X91', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7013', customerName: 'Rezaul Karim', orderAmount: 1850, mfsReceived: 1800, mfsCommission: 27, status: 'UNMATCHED' as const, varianceGap: -50 },
    { traceId: 'TR-PRE-2026-A03', channel: 'track-a' as const, channelLabel: 'Track A: Website MFS', orderId: 'ORD-ADV-9015', customerName: 'Nusrat Jahan', orderAmount: 4100, mfsReceived: 4100, mfsCommission: 61.5, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-PRE-2026-X93', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7014', customerName: 'Sumaiya Akter', orderAmount: 2600, mfsReceived: 0, mfsCommission: 0, status: 'NOT_FOUND' as const, varianceGap: -2600 },
    { traceId: 'TR-PRE-2026-X94', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7015', customerName: 'Arif Mahmud', orderAmount: 1250, mfsReceived: 1250, mfsCommission: 18.75, status: 'MATCHED' as const, varianceGap: 0 }
  ];

  // Table 2: Full COD Reconciled Output (100% Courier COD)
  const t2Data = [
    { traceId: 'TR-COD-2026-A11', channel: 'track-a' as const, channelLabel: 'Track A: Website Orders', orderId: 'ORD-COD-5011', customerName: 'Tanvir Hossain', orderAmount: 3200, courierCollected: 3200, deliveryFeeDeducted: 90, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-COD-2026-C12', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7020', customerName: 'Rashid Khan', orderAmount: 2100, courierCollected: 2100, deliveryFeeDeducted: 80, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-COD-2026-C13', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7021', customerName: 'Sadia Afrin', orderAmount: 3800, courierCollected: 3800, deliveryFeeDeducted: 120, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-COD-2026-A12', channel: 'track-a' as const, channelLabel: 'Track A: Website Orders', orderId: 'ORD-COD-5012', customerName: 'Mahmudul Hasan', orderAmount: 4800, courierCollected: 4800, deliveryFeeDeducted: 110, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-COD-2026-C14', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7022', customerName: 'Fahim Shahriar', orderAmount: 4500, courierCollected: 4350, deliveryFeeDeducted: 130, status: 'UNMATCHED' as const, varianceGap: -150 },
    { traceId: 'TR-COD-2026-C15', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7024', customerName: 'Nasir Uddin', orderAmount: 1600, courierCollected: 1600, deliveryFeeDeducted: 70, status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-COD-2026-C16', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7023', customerName: 'Habibur Rahman', orderAmount: 2900, courierCollected: 0, deliveryFeeDeducted: 0, status: 'NOT_FOUND' as const, varianceGap: -2900 }
  ];

  // Table 3: Split Payment Reconciled Output (Advance MFS + Courier COD Balance)
  const t3Data = [
    { twinTraceId: 'TR-SPLIT-2026-S44', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7030', customerName: 'Sultana Razia', advExpected: 150, advReceived: 150, codExpected: 2500, codReceived: 2500, courierCharges: 110, status: 'MATCHED' as const, varianceGap: 0 },
    { twinTraceId: 'TR-SPLIT-2026-A31', channel: 'track-a' as const, channelLabel: 'Track A: Website Orders', orderId: 'ORD-SPL-7101', customerName: 'Kamrul Hasan', advExpected: 300, advReceived: 300, codExpected: 4200, codReceived: 4200, courierCharges: 130, status: 'MATCHED' as const, varianceGap: 0 },
    { twinTraceId: 'TR-SPLIT-2026-S45', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7031', customerName: 'Zubair Ahmed', advExpected: 200, advReceived: 200, codExpected: 3400, codReceived: 3400, courierCharges: 130, status: 'MATCHED' as const, varianceGap: 0 },
    { twinTraceId: 'TR-SPLIT-2026-A32', channel: 'track-a' as const, channelLabel: 'Track A: Website Orders', orderId: 'ORD-SPL-7102', customerName: 'Mahmuda Akhter', advExpected: 200, advReceived: 200, codExpected: 2600, codReceived: 2600, courierCharges: 100, status: 'MATCHED' as const, varianceGap: 0 },
    { twinTraceId: 'TR-SPLIT-2026-S46', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7032', customerName: 'Rashedul Islam', advExpected: 150, advReceived: 150, codExpected: 1800, codReceived: 1700, courierCharges: 90, status: 'UNMATCHED' as const, varianceGap: -100 },
    { twinTraceId: 'TR-SPLIT-2026-S47', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7033', customerName: 'Faruk Hossain', advExpected: 200, advReceived: 0, codExpected: 4200, codReceived: 4200, courierCharges: 140, status: 'NOT_FOUND' as const, varianceGap: -200 }
  ];

  // Table 4: Free Delivery / No Delivery Charge Reconciled Output
  const t4Data = [
    { traceId: 'TR-FREE-2026-A01', channel: 'track-a' as const, channelLabel: 'Track A: Website Orders', orderId: 'ORD-FREE-3001', customerName: 'Dr. Rafiqul Islam', productPrice: 4200, advancePaid: 4200, deliveryCharge: 0, internalExpenseEntry: 'EXP-MKTG-DH-09', status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-FREE-2026-F09', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7040', customerName: 'Tasnim Ahmed', productPrice: 4200, advancePaid: 4200, deliveryCharge: 0, internalExpenseEntry: 'EXP-MKTG-DH-09', status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-FREE-2026-A02', channel: 'track-a' as const, channelLabel: 'Track A: Website Orders', orderId: 'ORD-FREE-3002', customerName: 'Sabrina Mostafa', productPrice: 2800, advancePaid: 0, deliveryCharge: 0, internalExpenseEntry: 'EXP-MKTG-DH-10', status: 'MATCHED' as const, varianceGap: 0 },
    { traceId: 'TR-FREE-2026-F11', channel: 'track-b' as const, channelLabel: 'Track B: Manual Dispatch', orderId: 'ORD-FB-7041', customerName: 'Moniruzzaman', productPrice: 3500, advancePaid: 3500, deliveryCharge: 80, internalExpenseEntry: 'UNAUTHORIZED_COURIER_CHARGE', status: 'UNMATCHED' as const, varianceGap: -80 }
  ];

  // Table 5: Returned Products & Reverse Logistics Reconciled Output
  const t5Data = returnParcels.map(p => {
    let auditBadge = 'VERIFIED_RETURNED';
    let impactBDT = 0;

    if (p.scannedAtWarehouse) {
      auditBadge = 'VERIFIED_RETURNED';
      impactBDT = 0;
    } else if (p.vector3GhostException) {
      auditBadge = 'GHOST_RETURN_EXCEPTION';
      impactBDT = -p.returnFeeBDT;
    } else if (p.vector2RetentionGap) {
      auditBadge = 'COURIER_RETENTION_LOST';
      impactBDT = -(p.parcelValueBDT + p.returnFeeBDT);
    } else if (p.vector1Status === 'LOGISTICS_RETURN_VARIANCE_ERROR' || p.vector1OverchargeVarianceBDT > 0) {
      auditBadge = 'RETURN_FEE_OVERCHARGE';
      impactBDT = -p.vector1OverchargeVarianceBDT;
    } else {
      auditBadge = 'RETURN_IN_TRANSIT';
      impactBDT = 0;
    }

    const isTrackB = p.orderId.startsWith('FB-') || p.orderId.startsWith('ORD-FB') || p.courierConsignmentId?.startsWith('SME-');

    return {
      traceId: p.traceId,
      channel: (isTrackB ? 'track-b' : 'track-a') as 'track-a' | 'track-b',
      channelLabel: isTrackB ? 'Track B: Manual Dispatch' : 'Track A: Website Orders',
      orderId: p.orderId,
      customerName: p.customerPhone || 'SME Customer',
      courierReturnedStatus: p.courierReportedStatus,
      returnFeeCharged: p.returnFeeBDT,
      warehouseShopScanStatus: p.scannedAtWarehouse ? 'SCANNED_OK' : 'PENDING_PHYSICAL_INTAKE',
      auditStatusBadge: auditBadge,
      financialImpactBDT: impactBDT,
      scannedAtWarehouse: p.scannedAtWarehouse
    };
  });

  // Filter Helper
  const filterBySearch = (val: string) => {
    if (!searchQuery) return true;
    return val.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const matchesChannel = (itemChannel: 'track-a' | 'track-b') => {
    if (channelFilter === 'all') return true;
    return channelFilter === itemChannel;
  };

  const filteredT1 = t1Data.filter(r => matchesChannel(r.channel) && (filterBySearch(r.traceId) || filterBySearch(r.orderId) || filterBySearch(r.customerName)));
  const filteredT2 = t2Data.filter(r => matchesChannel(r.channel) && (filterBySearch(r.traceId) || filterBySearch(r.orderId) || filterBySearch(r.customerName)));
  const filteredT3 = t3Data.filter(r => matchesChannel(r.channel) && (filterBySearch(r.twinTraceId) || filterBySearch(r.orderId) || filterBySearch(r.customerName)));
  const filteredT4 = t4Data.filter(r => matchesChannel(r.channel) && (filterBySearch(r.traceId) || filterBySearch(r.orderId) || filterBySearch(r.customerName)));
  const filteredT5 = t5Data.filter(r => matchesChannel(r.channel) && (filterBySearch(r.traceId) || filterBySearch(r.orderId) || filterBySearch(r.auditStatusBadge)));

  // Consolidated Full CSV Generator
  const generateConsolidatedCsvContent = (targetChannel: 'all' | 'track-a' | 'track-b') => {
    const scopeName = targetChannel === 'all' 
      ? 'SHARED CONSOLIDATED (Track A Website + Track B Manual Dispatch)' 
      : targetChannel === 'track-a' 
        ? 'TRACK A ENTERPRISE (Website MFS API)' 
        : 'TRACK B SME (Manual Social Commerce Dispatch)';

    const rows: string[] = [
      `# =========================================================================`,
      `# TRACEID LINK FINANCIAL RECONCILIATION MIDDLEWARE`,
      `# AUDIT REPORT TYPE: ${scopeName}`,
      `# MERCHANT CORPORATE IDENTITY: ${merchantEmail}`,
      `# REGISTERED ENTITY: ${merchantCompany}`,
      `# GENERATED TIMESTAMP: ${new Date().toISOString()}`,
      `# FISCAL DATE WINDOW: ${dateStart} TO ${dateEnd}`,
      `# BANGLADESH DOMESTIC SETTLEMENT: EBL / bKash Merchant / Nagad Merchant / Steadfast / Pathao`,
      `# =========================================================================`,
      ``,
      `# SECTION 1: FULL ADVANCE PRE-PAYMENTS (100% MFS)`,
      `TraceID,Channel,OrderID,Customer,OrderAmountBDT,MFSReceivedBDT,MFSCommissionBDT,AuditStatus,VarianceGapBDT`
    ];

    t1Data.filter(r => targetChannel === 'all' || r.channel === targetChannel).forEach(r => {
      rows.push(`${r.traceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.orderAmount},${r.mfsReceived},${r.mfsCommission},${r.status},${r.varianceGap}`);
    });

    rows.push(``, `# SECTION 2: FULL CASH-ON-DELIVERY (100% COURIER COD)`);
    rows.push(`TraceID,Channel,OrderID,Customer,OrderAmountBDT,CourierCollectedBDT,DeliveryFeeDeductedBDT,AuditStatus,VarianceGapBDT`);
    t2Data.filter(r => targetChannel === 'all' || r.channel === targetChannel).forEach(r => {
      rows.push(`${r.traceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.orderAmount},${r.courierCollected},${r.deliveryFeeDeducted},${r.status},${r.varianceGap}`);
    });

    rows.push(``, `# SECTION 3: SPLIT PAYMENTS (ADVANCE TOKEN + DOORSTEP COD)`);
    rows.push(`TwinTraceID,Channel,OrderID,Customer,AdvanceExpectedBDT,AdvanceReceivedBDT,CODExpectedBDT,CODReceivedBDT,CourierChargesBDT,AuditStatus,VarianceGapBDT`);
    t3Data.filter(r => targetChannel === 'all' || r.channel === targetChannel).forEach(r => {
      rows.push(`${r.twinTraceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.advExpected},${r.advReceived},${r.codExpected},${r.codReceived},${r.courierCharges},${r.status},${r.varianceGap}`);
    });

    rows.push(``, `# SECTION 4: FREE DELIVERY PROMOTIONS`);
    rows.push(`TraceID,Channel,OrderID,Customer,ProductPriceBDT,AdvancePaidBDT,DeliveryFeeAbsorbedBDT,InternalExpenseCode,AuditStatus,VarianceGapBDT`);
    t4Data.filter(r => targetChannel === 'all' || r.channel === targetChannel).forEach(r => {
      rows.push(`${r.traceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.productPrice},${r.advancePaid},${r.deliveryCharge},${r.internalExpenseEntry},${r.status},${r.varianceGap}`);
    });

    rows.push(``, `# SECTION 5: RETURNED PARCELS & REVERSE LOGISTICS AUDIT`);
    rows.push(`TraceID,Channel,OrderID,CustomerPhone,CourierStatus,ReturnFeeChargedBDT,PhysicalScanStatus,AuditStatusBadge,FinancialImpactBDT`);
    t5Data.filter(r => targetChannel === 'all' || r.channel === targetChannel).forEach(r => {
      rows.push(`${r.traceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.courierReturnedStatus},${r.returnFeeCharged},${r.warehouseShopScanStatus},${r.auditStatusBadge},${r.financialImpactBDT}`);
    });

    return rows.join('\n');
  };

  // Download Multi-CSV Batch
  const handleDownloadBatch = () => {
    const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
    const baseName = `TraceID_Shared_Merchant_${merchantEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const files = [
      { 
        name: `${baseName}_Table1_FullPrepaid_${dateStart}_to_${dateEnd}_${timeStr}.csv`, 
        content: `# Merchant: ${merchantEmail} | Table 1: Full Prepaid\nTraceID,Channel,OrderID,Customer,OrderAmount,MFSReceived,MFSCommission,Status,VarianceGap\n` + 
          filteredT1.map(r => `${r.traceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.orderAmount},${r.mfsReceived},${r.mfsCommission},${r.status},${r.varianceGap}`).join('\n') 
      },
      { 
        name: `${baseName}_Table2_FullCOD_${dateStart}_to_${dateEnd}_${timeStr}.csv`, 
        content: `# Merchant: ${merchantEmail} | Table 2: Full COD\nTraceID,Channel,OrderID,Customer,OrderAmount,CourierCollected,DeliveryFee,Status,VarianceGap\n` + 
          filteredT2.map(r => `${r.traceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.orderAmount},${r.courierCollected},${r.deliveryFeeDeducted},${r.status},${r.varianceGap}`).join('\n') 
      },
      { 
        name: `${baseName}_Table3_SplitPayment_${dateStart}_to_${dateEnd}_${timeStr}.csv`, 
        content: `# Merchant: ${merchantEmail} | Table 3: Split Payments\nTwinTraceID,Channel,OrderID,Customer,AdvExpected,AdvReceived,CODExpected,CODReceived,CourierCharges,Status,VarianceGap\n` + 
          filteredT3.map(r => `${r.twinTraceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.advExpected},${r.advReceived},${r.codExpected},${r.codReceived},${r.courierCharges},${r.status},${r.varianceGap}`).join('\n') 
      },
      { 
        name: `${baseName}_Table4_FreeDelivery_${dateStart}_to_${dateEnd}_${timeStr}.csv`, 
        content: `# Merchant: ${merchantEmail} | Table 4: Free Delivery Promo\nTraceID,Channel,OrderID,Customer,ProductPrice,AdvancePaid,DeliveryCharge,InternalExpenseEntry,Status,VarianceGap\n` + 
          filteredT4.map(r => `${r.traceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.productPrice},${r.advancePaid},${r.deliveryCharge},${r.internalExpenseEntry},${r.status},${r.varianceGap}`).join('\n') 
      },
      { 
        name: `${baseName}_Table5_ReturnedProducts_${dateStart}_to_${dateEnd}_${timeStr}.csv`, 
        content: `# Merchant: ${merchantEmail} | Table 5: Reverse Logistics\nTraceID,Channel,OrderID,Customer,CourierStatus,ReturnFee,ScanStatus,AuditStatus,FinancialImpact\n` + 
          filteredT5.map(r => `${r.traceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.courierReturnedStatus},${r.returnFeeCharged},${r.warehouseShopScanStatus},${r.auditStatusBadge},${r.financialImpactBDT}`).join('\n') 
      }
    ];

    files.forEach(f => downloadCsvFile(f.name, f.content));

    setDownloadSuccess(`Generated 5 Separate Reconciled CSV Batch Files for ${merchantEmail} (${dateStart} to ${dateEnd})`);
    setTimeout(() => setDownloadSuccess(null), 4500);
  };

  // Download Single Consolidated CSV
  const handleDownloadConsolidated = (targetChannel: 'all' | 'track-a' | 'track-b') => {
    const timeStr = new Date().toISOString().slice(0, 10);
    const label = targetChannel === 'all' ? 'Consolidated_Universal' : targetChannel === 'track-a' ? 'TrackA_Website_Orders' : 'TrackB_Manual_Dispatch';
    const filename = `TraceID_${label}_${merchantEmail.split('@')[0]}_${timeStr}.csv`;
    const content = generateConsolidatedCsvContent(targetChannel);
    downloadCsvFile(filename, content);

    setDownloadSuccess(`Downloaded ${filename} successfully!`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // Download Individual Batch from Archive
  const handleDownloadSavedBatch = (batch: any) => {
    const csvContent = `# =========================================================================\n# TRACEID LINK SAVED AUDIT BATCH: ${batch.batchId}\n# MERCHANT ACCOUNT: ${merchantEmail}\n# PROCESSED DATE: ${batch.dateProcessed}\n# TRACK MODE: ${batch.trackMode}\n# TOTAL ROWS: ${batch.totalRows} | MATCH RATE: ${batch.matchedRate}% | ANOMALIES: ${batch.anomalyCount}\n# NET SETTLED SUM: BDT ${batch.netSettledSumBDT}\n# =========================================================================\nTraceID,Date,Channel,ReferenceNumber,GrossOrderBDT,NetSettledBDT,VarianceGapBDT,AuditStatus\nTRX-${batch.batchId}-001,${batch.dateProcessed},"${batch.trackMode}",MFS-REF-8891,4500,4500,0,VERIFIED_MATCHED\nTRX-${batch.batchId}-002,${batch.dateProcessed},"${batch.trackMode}",MFS-REF-8892,3200,3200,0,VERIFIED_MATCHED\nTRX-${batch.batchId}-003,${batch.dateProcessed},"${batch.trackMode}",MFS-REF-8893,5400,5300,-100,VARIANCE_FLAGGED\n`;
    downloadCsvFile(batch.fileName || `${batch.batchId}_Report.csv`, csvContent);
    setDownloadSuccess(`Downloaded saved archive batch: ${batch.batchId}`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Universal Shared Header with Merchant Corporate Identity Banner */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15]">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#FFFFFF] tracking-tight">
                    Audit Reports
                  </h2>
                </div>
                <p className="text-xs text-[#A1A1AA]">
                  Settlement statements and ledger archives across sales channels
                </p>
              </div>
            </div>

            {/* Merchant Identity Card Badge */}
            <div className="inline-flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs font-mono">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-zinc-400">Merchant Account:</span>
                <span className="font-bold text-white">{merchantEmail}</span>
              </div>
              <span className="text-zinc-600">|</span>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Shared Wallet &amp; Bank Profile Linked</span>
              </div>
            </div>
          </div>

          {/* Quick Stats / Feedback */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono text-[#A1A1AA]">Current Active Workspace</div>
              <div className="text-sm font-bold font-mono text-[#FACC15] uppercase">
                {currentTrack === 'track-a' ? 'Track A Enterprise' : 'Track B SME Hub'}
              </div>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" title="Live Shared Connection" />
          </div>
        </div>

        {/* Action Button Download Bar */}
        <div className="mt-5 pt-4 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Export:</span>
            
            {/* Download Complete 5-Table Batch (ZIP / Multi-CSV) */}
            <button
              id="download-complete-5-table-batch-btn"
              type="button"
              onClick={handleDownloadBatch}
              className="px-3.5 py-2 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-bold text-xs font-mono tracking-tight shadow-md shadow-[#FACC15]/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Download 5-Table Batch (CSV)</span>
            </button>

            {/* Download Consolidated Master CSV */}
            <button
              id="download-consolidated-csv-btn"
              type="button"
              onClick={() => handleDownloadConsolidated('all')}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs font-mono border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Consolidated Master CSV</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Track A Only */}
            <button
              type="button"
              onClick={() => handleDownloadConsolidated('track-a')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 font-mono text-xs border border-blue-800/80 flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3 h-3 text-blue-400" />
              <span>Track A Only</span>
            </button>

            {/* Track B Only */}
            <button
              type="button"
              onClick={() => handleDownloadConsolidated('track-b')}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-mono text-xs border border-cyan-800/80 flex items-center gap-1 cursor-pointer"
            >
              <Store className="w-3 h-3 text-cyan-400" />
              <span>Track B Only</span>
            </button>
          </div>
        </div>

        {/* Date Range Selector, Channel Filter & Search Bar */}
        <div className="mt-4 pt-4 border-t border-[#27272A] grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Channel Scope Selector */}
          <div className="sm:col-span-4 flex items-center bg-[#050505] border border-[#27272A] rounded-xl p-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => setChannelFilter('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                channelFilter === 'all'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Feeds (Shared)
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter('track-a')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                channelFilter === 'track-a'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Track A (Web)
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter('track-b')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                channelFilter === 'track-b'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Track B (SME)
            </button>
          </div>

          {/* Search Filter */}
          <div className="sm:col-span-3 relative">
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search TraceID, Order ID, Customer..."
              className="w-full bg-[#050505] border border-[#27272A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#FFFFFF] placeholder-zinc-600 focus:outline-none focus:border-[#FACC15] font-mono"
            />
          </div>

          {/* Start Date */}
          <div className="sm:col-span-2 flex items-center gap-2">
            <span className="text-xs font-mono text-[#A1A1AA] shrink-0">From:</span>
            <input
              type="date"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
              className="w-full bg-[#050505] border border-[#27272A] rounded-xl px-2 py-2 text-xs text-[#FFFFFF] font-mono focus:outline-none focus:border-[#FACC15]"
            />
          </div>

          {/* End Date */}
          <div className="sm:col-span-2 flex items-center gap-2">
            <span className="text-xs font-mono text-[#A1A1AA] shrink-0">To:</span>
            <input
              type="date"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
              className="w-full bg-[#050505] border border-[#27272A] rounded-xl px-2 py-2 text-xs text-[#FFFFFF] font-mono focus:outline-none focus:border-[#FACC15]"
            />
          </div>

          <div className="sm:col-span-1 flex items-center justify-end">
            <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded border border-[#22C55E]/30 whitespace-nowrap">
              ● Live Sync
            </span>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-[#050505] border border-[#22C55E]/60 text-xs font-mono text-[#22C55E] flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* Historical Saved Batches Archive Section */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Historical Reconciled Batches Archive (6-Month Rolling Fiscal TTL)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-1 rounded border border-zinc-700">
            {reportBatches.length} Verified Batches Stored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Batch ID</th>
                <th className="py-2.5 px-3 font-semibold">Execution Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Track Scope</th>
                <th className="py-2.5 px-3 font-semibold text-right">Records Audited</th>
                <th className="py-2.5 px-3 font-semibold text-right">Match Rate</th>
                <th className="py-2.5 px-3 font-semibold text-right">Net Settled (BDT)</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] text-white">
              {reportBatches.map(batch => (
                <tr key={batch.batchId} className="hover:bg-[#050505] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-amber-400">{batch.batchId}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{batch.dateProcessed}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      batch.trackMode.includes('Enterprise')
                        ? 'bg-blue-950/70 text-blue-300 border-blue-800'
                        : batch.trackMode.includes('SME')
                          ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
                          : 'bg-amber-950/70 text-amber-300 border-amber-800'
                    }`}>
                      {batch.trackMode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">{batch.totalRows.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{batch.matchedRate}%</td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">{formatBDT(batch.netSettledSumBDT)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      batch.status === 'VERIFIED_FINAL'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadSavedBatch(batch)}
                      className="px-2.5 py-1 rounded bg-[#FACC15]/10 hover:bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/30 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <Download className="w-3 h-3" />
                      <span>CSV</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5 Distinct Tab Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar font-mono text-xs">
        {[
          { id: 'T1', label: 'Table 1: Full Pre-Payment (100% MFS)', count: filteredT1.length, icon: CreditCard },
          { id: 'T2', label: 'Table 2: Full COD (100% Courier)', count: filteredT2.length, icon: Truck },
          { id: 'T3', label: 'Table 3: Split Payment (Advance + COD)', count: filteredT3.length, icon: Split },
          { id: 'T4', label: 'Table 4: Free Delivery (Promo Absorbed)', count: filteredT4.length, icon: Gift },
          { id: 'T5', label: 'Table 5: Returned Products (Reverse Logistics)', count: filteredT5.length, icon: RotateCcw }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTableTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTableTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#121212] border-[#FACC15] text-[#FFFFFF] shadow-sm shadow-[#FACC15]/20 font-bold'
                  : 'bg-[#121212]/60 border-[#27272A] text-[#A1A1AA] hover:text-[#FFFFFF]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FACC15]' : 'text-[#A1A1AA]'}`} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                isActive ? 'bg-[#FACC15] text-[#050505]' : 'bg-[#050505] text-[#A1A1AA]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TABLE 1: Full Pre-Payment Reconciled Output (100% MFS) */}
      {activeTableTab === 'T1' && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
                Table 1: Full Pre-Payment Reconciled Output (100% MFS Gateway / Advance)
              </h3>
              <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5">
                Mathematical Verification: Order Amount = MFS Received + Gateway Commission (1.5%) • Zero Leakage
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                Formula Verified
              </span>
              <button
                type="button"
                onClick={() => {
                  const content = `# Merchant: ${merchantEmail} | Table 1: Full Prepaid\nTraceID,Channel,OrderID,Customer,OrderAmount,MFSReceived,MFSCommission,Status,VarianceGap\n` + 
                    filteredT1.map(r => `${r.traceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.orderAmount},${r.mfsReceived},${r.mfsCommission},${r.status},${r.varianceGap}`).join('\n');
                  downloadCsvFile(`Table1_Prepaid_${merchantEmail.split('@')[0]}.csv`, content);
                }}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs border border-zinc-700 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Export Tab CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">TraceID</th>
                  <th className="py-3 px-4 font-semibold">Origin Feed</th>
                  <th className="py-3 px-4 font-semibold">Order / Customer</th>
                  <th className="py-3 px-4 font-semibold text-right">Order Amount</th>
                  <th className="py-3 px-4 font-semibold text-right">MFS Received</th>
                  <th className="py-3 px-4 font-semibold text-right">MFS Commission (1.5%)</th>
                  <th className="py-3 px-4 font-semibold">Audit Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Variance Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {filteredT1.map(row => (
                  <tr key={row.traceId} className="hover:bg-[#050505] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#FACC15]">{row.traceId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        row.channel === 'track-a' 
                          ? 'bg-blue-950/70 text-blue-300 border-blue-800' 
                          : 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
                      }`}>
                        {row.channelLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-semibold">{row.orderId}</div>
                      <div className="text-zinc-400 text-[10px]">{row.customerName}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-300">{formatBDT(row.orderAmount)}</td>
                    <td className="py-3 px-4 text-right font-bold text-white">{formatBDT(row.mfsReceived)}</td>
                    <td className="py-3 px-4 text-right text-[#A1A1AA]">{formatBDT(row.mfsCommission)}</td>
                    <td className="py-3 px-4">
                      {row.status === 'MATCHED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> MATCHED
                        </span>
                      ) : row.status === 'UNMATCHED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> UNMATCHED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> NOT_FOUND
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${row.varianceGap !== 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                      {row.varianceGap === 0 ? 'BDT 0.00' : `${formatBDT(row.varianceGap)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 2: Full COD Reconciled Output (100% Courier COD) */}
      {activeTableTab === 'T2' && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
                Table 2: Full COD Reconciled Output (100% Courier Cash-on-Delivery)
              </h3>
              <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5">
                Formula: Product Price = Courier Collected - Delivery Fee Deducted • Remittance Match
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                Formula Verified
              </span>
              <button
                type="button"
                onClick={() => {
                  const content = `# Merchant: ${merchantEmail} | Table 2: Full COD\nTraceID,Channel,OrderID,Customer,OrderAmount,CourierCollected,DeliveryFee,Status,VarianceGap\n` + 
                    filteredT2.map(r => `${r.traceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.orderAmount},${r.courierCollected},${r.deliveryFeeDeducted},${r.status},${r.varianceGap}`).join('\n');
                  downloadCsvFile(`Table2_COD_${merchantEmail.split('@')[0]}.csv`, content);
                }}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs border border-zinc-700 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Export Tab CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">TraceID</th>
                  <th className="py-3 px-4 font-semibold">Origin Feed</th>
                  <th className="py-3 px-4 font-semibold">Order / Customer</th>
                  <th className="py-3 px-4 font-semibold text-right">Order Amount</th>
                  <th className="py-3 px-4 font-semibold text-right">Courier Collected</th>
                  <th className="py-3 px-4 font-semibold text-right">Delivery Fee</th>
                  <th className="py-3 px-4 font-semibold">Audit Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Variance Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {filteredT2.map(row => (
                  <tr key={row.traceId} className="hover:bg-[#050505] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#FACC15]">{row.traceId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        row.channel === 'track-a' 
                          ? 'bg-blue-950/70 text-blue-300 border-blue-800' 
                          : 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
                      }`}>
                        {row.channelLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-semibold">{row.orderId}</div>
                      <div className="text-zinc-400 text-[10px]">{row.customerName}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-300">{formatBDT(row.orderAmount)}</td>
                    <td className="py-3 px-4 text-right font-bold text-white">{formatBDT(row.courierCollected)}</td>
                    <td className="py-3 px-4 text-right text-[#A1A1AA]">{formatBDT(row.deliveryFeeDeducted)}</td>
                    <td className="py-3 px-4">
                      {row.status === 'MATCHED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> MATCHED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> {row.status}
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${row.varianceGap !== 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                      {row.varianceGap === 0 ? 'BDT 0.00' : `${formatBDT(row.varianceGap)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 3: Split Payment Reconciled Output (Advance MFS + Courier COD Balance) */}
      {activeTableTab === 'T3' && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
                Table 3: Split Payment Reconciled Output (Advance MFS + Doorstep Courier COD)
              </h3>
              <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5">
                Twin TraceID Pairing: Cross-verifies advance delivery fee against MFS and remaining balance against Courier COD
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                Twin-Trace Paired
              </span>
              <button
                type="button"
                onClick={() => {
                  const content = `# Merchant: ${merchantEmail} | Table 3: Split Payments\nTwinTraceID,Channel,OrderID,Customer,AdvExpected,AdvReceived,CODExpected,CODReceived,CourierCharges,Status,VarianceGap\n` + 
                    filteredT3.map(r => `${r.twinTraceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.advExpected},${r.advReceived},${r.codExpected},${r.codReceived},${r.courierCharges},${r.status},${r.varianceGap}`).join('\n');
                  downloadCsvFile(`Table3_Split_${merchantEmail.split('@')[0]}.csv`, content);
                }}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs border border-zinc-700 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Export Tab CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Twin TraceID</th>
                  <th className="py-3 px-4 font-semibold">Origin Feed</th>
                  <th className="py-3 px-4 font-semibold">Order / Customer</th>
                  <th className="py-3 px-4 font-semibold text-right">Adv Expected / Recv</th>
                  <th className="py-3 px-4 font-semibold text-right">COD Expected / Recv</th>
                  <th className="py-3 px-4 font-semibold text-right">Courier Charges</th>
                  <th className="py-3 px-4 font-semibold">Audit Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Variance Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {filteredT3.map(row => (
                  <tr key={row.twinTraceId} className="hover:bg-[#050505] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#FACC15]">{row.twinTraceId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        row.channel === 'track-a' 
                          ? 'bg-blue-950/70 text-blue-300 border-blue-800' 
                          : 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
                      }`}>
                        {row.channelLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-semibold">{row.orderId}</div>
                      <div className="text-zinc-400 text-[10px]">{row.customerName}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="text-white font-bold">{formatBDT(row.advReceived)}</div>
                      <div className="text-[10px] text-zinc-400">Exp: {formatBDT(row.advExpected)}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="text-white font-bold">{formatBDT(row.codReceived)}</div>
                      <div className="text-[10px] text-zinc-400">Exp: {formatBDT(row.codExpected)}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-[#A1A1AA]">{formatBDT(row.courierCharges)}</td>
                    <td className="py-3 px-4">
                      {row.status === 'MATCHED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> MATCHED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> {row.status}
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${row.varianceGap !== 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                      {row.varianceGap === 0 ? 'BDT 0.00' : `${formatBDT(row.varianceGap)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 4: Free Delivery / Zero Delivery Charge Reconciled Output */}
      {activeTableTab === 'T4' && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
                Table 4: Free Delivery Campaign Reconciled Output (Zero Delivery Charge)
              </h3>
              <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5">
                Expense Validation: Checks that zero delivery charge was billed to customer and internal marketing subsidy matches exactly
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                Promo Audited
              </span>
              <button
                type="button"
                onClick={() => {
                  const content = `# Merchant: ${merchantEmail} | Table 4: Free Delivery\nTraceID,Channel,OrderID,Customer,ProductPrice,AdvancePaid,DeliveryCharge,InternalExpenseEntry,Status,VarianceGap\n` + 
                    filteredT4.map(r => `${r.traceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.productPrice},${r.advancePaid},${r.deliveryCharge},${r.internalExpenseEntry},${r.status},${r.varianceGap}`).join('\n');
                  downloadCsvFile(`Table4_FreeDelivery_${merchantEmail.split('@')[0]}.csv`, content);
                }}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs border border-zinc-700 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Export Tab CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">TraceID</th>
                  <th className="py-3 px-4 font-semibold">Origin Feed</th>
                  <th className="py-3 px-4 font-semibold">Order / Customer</th>
                  <th className="py-3 px-4 font-semibold text-right">Product Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Delivery Charge</th>
                  <th className="py-3 px-4 font-semibold">Internal Marketing Expense Entry</th>
                  <th className="py-3 px-4 font-semibold">Audit Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Variance Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {filteredT4.map(row => (
                  <tr key={row.traceId} className="hover:bg-[#050505] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#FACC15]">{row.traceId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        row.channel === 'track-a' 
                          ? 'bg-blue-950/70 text-blue-300 border-blue-800' 
                          : 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
                      }`}>
                        {row.channelLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-semibold">{row.orderId}</div>
                      <div className="text-zinc-400 text-[10px]">{row.customerName}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-300">{formatBDT(row.productPrice)}</td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {row.deliveryCharge === 0 ? 'FREE (0 BDT)' : formatBDT(row.deliveryCharge)}
                    </td>
                    <td className="py-3 px-4 text-zinc-300 text-[11px]">{row.internalExpenseEntry}</td>
                    <td className="py-3 px-4">
                      {row.status === 'MATCHED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> MATCHED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> {row.status}
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${row.varianceGap !== 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                      {row.varianceGap === 0 ? 'BDT 0.00' : `${formatBDT(row.varianceGap)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 5: Returned Products & Reverse Logistics Reconciled Output */}
      {activeTableTab === 'T5' && (
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#050505] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#FFFFFF] font-mono">
                Table 5: Returned Products &amp; Reverse Logistics Reconciled Output
              </h3>
              <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5">
                Real-Time Reactive: Scanning any barcode in the warehouse terminal instantly clears Ghost Return exceptions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                Terminal Linked
              </span>
              <button
                type="button"
                onClick={() => {
                  const content = `# Merchant: ${merchantEmail} | Table 5: Reverse Logistics\nTraceID,Channel,OrderID,Customer,CourierStatus,ReturnFee,ScanStatus,AuditStatus,FinancialImpact\n` + 
                    filteredT5.map(r => `${r.traceId},"${r.channelLabel}",${r.orderId},"${r.customerName}",${r.courierReturnedStatus},${r.returnFeeCharged},${r.warehouseShopScanStatus},${r.auditStatusBadge},${r.financialImpactBDT}`).join('\n');
                  downloadCsvFile(`Table5_Returns_${merchantEmail.split('@')[0]}.csv`, content);
                }}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs border border-zinc-700 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Export Tab CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505]/70 text-[#A1A1AA] border-b border-[#27272A] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">TraceID</th>
                  <th className="py-3 px-4 font-semibold">Origin Feed</th>
                  <th className="py-3 px-4 font-semibold">Order / Reference</th>
                  <th className="py-3 px-4 font-semibold">Courier Returned Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Return Fee Charged</th>
                  <th className="py-3 px-4 font-semibold">Warehouse Physical Scan</th>
                  <th className="py-3 px-4 font-semibold">Audit Status Badge</th>
                  <th className="py-3 px-4 font-semibold text-right">Financial Impact (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[#FFFFFF]">
                {filteredT5.map(row => (
                  <tr key={row.traceId} className="hover:bg-[#050505] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#FACC15]">{row.traceId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        row.channel === 'track-a' 
                          ? 'bg-blue-950/70 text-blue-300 border-blue-800' 
                          : 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
                      }`}>
                        {row.channelLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-semibold">{row.orderId}</div>
                      <div className="text-zinc-400 text-[10px]">{row.customerName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px]">
                        {row.courierReturnedStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#A1A1AA]">
                      {formatBDT(row.returnFeeCharged)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        row.warehouseShopScanStatus === 'SCANNED_OK'
                          ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40'
                          : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40'
                      }`}>
                        {row.warehouseShopScanStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {row.auditStatusBadge === 'VERIFIED_RETURNED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED_RETURNED
                        </span>
                      )}
                      {row.auditStatusBadge === 'GHOST_RETURN_EXCEPTION' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          GHOST_RETURN_EXCEPTION
                        </span>
                      )}
                      {row.auditStatusBadge === 'COURIER_RETENTION_LOST' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          COURIER_RETENTION_LOST
                        </span>
                      )}
                      {row.auditStatusBadge === 'RETURN_FEE_OVERCHARGE' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/40 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          RETURN_FEE_OVERCHARGE
                        </span>
                      )}
                      {row.auditStatusBadge === 'RETURN_IN_TRANSIT' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 w-fit">
                          RETURN_IN_TRANSIT
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${row.financialImpactBDT < 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                      {row.financialImpactBDT === 0 ? 'BDT 0.00' : `- ${formatBDT(Math.abs(row.financialImpactBDT))}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
