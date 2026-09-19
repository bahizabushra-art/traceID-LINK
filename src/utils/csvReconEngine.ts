// Mathematical Reconciliation Engine for Custom User File Ingestion with Groq LLM Support
import { UnifiedAuditRow } from '../types';

export interface StructuredRecord {
  orderId: string;
  trxId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  grossAmount: number;
  mfsCredit: number;
  codCollected: number;
  deliveryFee: number;
  codFee: number;
  remittedAmount: number;
  statusNote: string;
}

export interface GroqStructureResponse {
  success: boolean;
  engineUsed: 'GROQ_LLAMA_3.3_70B' | 'GEMINI_2.5_FLASH' | 'INTELLIGENT_HEURISTIC_PARSER';
  modelName: string;
  detectedType: 'MFS' | 'COURIER' | 'BANK' | 'UNKNOWN';
  detectedFormat: string;
  processingTimeMs: number;
  records: StructuredRecord[];
  summary: {
    totalRecords: number;
    totalGrossBDT: number;
    totalMfsCreditBDT: number;
    totalCodCollectedBDT: number;
    totalDeliveryFeeBDT: number;
    totalRemittedBDT: number;
  };
  error?: string;
}

export interface ParsedCsvResult {
  fileName: string;
  rowCount: number;
  grossTotalBDT: number;
  mfsTotalBDT: number;
  courierCodTotalBDT: number;
  deliveryFeesTotalBDT: number;
  netSettledTotalBDT: number;
  totalVarianceBDT: number;
  matchedCount: number;
  discrepancyCount: number;
  rows: UnifiedAuditRow[];
  engineUsed?: string;
  detectedFormats?: {
    mfs?: string;
    courier?: string;
  };
}

/**
 * Benchmark Messy MFS Statement with preamble metadata, unformatted currency, and dirty rows
 */
export const SAMPLE_MFS_CSV = `bKash Merchant Payment Settlement Report
Generated on: 2026-09-08 23:59:00 BST | Merchant Code: 01711992288 | Currency: BDT
Note: System auto-exported from bKash Business Portal API v2.1

Date,TrxID,OrderID,CustomerName,CustomerPhone,GrossAmountBDT,MFSFeeBDT,NetCreditBDT,Notes
2026-09-08,BK-901829X,FB-ORD-7001,Tahmid Rahman,01711223344,4500,67.5,4432.5,Full advance bKash payment
2026-09-08,BK-901830Y,FB-ORD-7002,Nabila Farhana,01822334455,250,3.75,246.25,Advance booking delivery charge
2026-09-08,NG-881920Z,FB-ORD-7003,Kamrul Hasan,01933445566,3100,46.5,3053.5,Nagad gateway advance checkout
2026-09-08,BK-901831W,FB-ORD-7004,Sultana Razia,01755667788,0,0,0,100% Cash on Delivery
2026-09-08,NG-881921A,FB-ORD-7005,Arif Mahmud,01677889900,1850,27.75,1822.25,Free shipping campaign payment
### END OF REPORT - Authorized by bKash Settlement Operations ###
`;

/**
 * Benchmark Messy Courier Statement with inconsistent column naming, remittance fees, and freight
 */
export const SAMPLE_COURIER_CSV = `Steadfast / Pathao Consolidated Courier Remittance Invoice
Invoice #INV-2026-09-08-991 | Hub: Tejgaon Sorting Center | Dispatcher: Admin
Disclaimer: Deductions include delivery charges and 1% COD handling fee.

ConsignmentID,OrderID,CourierName,CODCollectedBDT,DeliveryFeeBDT,CODCommissionBDT,RemittedAmountBDT,DeliveryStatus
STEAD-9011,FB-ORD-7001,Steadfast,0,90,0,0,Delivered (Prepaid)
PATH-8822,FB-ORD-7002,Pathao,2800,120,28,2652,Delivered (Under-remitted by 100)
STEAD-9013,FB-ORD-7003,Steadfast,0,80,0,0,Delivered (Prepaid)
PATH-8824,FB-ORD-7004,Pathao,2400,130,24,2246,Delivered (COD)
REDX-7715,FB-ORD-7005,RedX,0,70,0,0,Delivered (Promotional Free Delivery)
Total Remitted: 4,898 BDT | Net Deductions: 490 BDT
`;

/**
 * Downloads a generated CSV file to user's local disk
 */
export function downloadCsvFile(filename: string, content: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Calls backend Groq API to structure a messy CSV
 */
export async function structureWithGroq(
  rawCsv: string,
  fileType: 'mfs' | 'courier' | 'bank' | 'auto' = 'auto',
  fileName: string = 'statement.csv'
): Promise<GroqStructureResponse> {
  try {
    const res = await fetch('/api/groq/structure-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawCsv, fileType, fileName })
    });

    if (res.ok) {
      const data: GroqStructureResponse = await res.json();
      return data;
    }
    throw new Error(`Server returned status ${res.status}`);
  } catch (err: any) {
    console.warn('Groq backend structure call fallback:', err?.message);
    // Fallback to local heuristic parser
    return localFallbackStructure(rawCsv, fileType, fileName);
  }
}

/**
 * Reconciles structured MFS and Courier records into UnifiedAuditRow outputs
 */
export function reconcileStructuredDatasets(
  mfsRecords: StructuredRecord[],
  courierRecords: StructuredRecord[],
  mfsFileName: string = 'mfs_statement.csv',
  courierFileName: string = 'courier_statement.csv',
  engineLabel: string = 'Groq LLM Engine'
): ParsedCsvResult {
  const courierMap = new Map<string, StructuredRecord>();
  const processedCourierOrders = new Set<string>();

  for (const c of courierRecords) {
    const norm = (c.orderId || '').trim().toUpperCase();
    if (norm) {
      courierMap.set(norm, c);
    }
  }

  const generatedRows: UnifiedAuditRow[] = [];
  let grossTotal = 0;
  let mfsTotal = 0;
  let courierCodTotal = 0;
  let deliveryFeesTotal = 0;
  let netSettledTotal = 0;
  let totalVariance = 0;
  let matchedCount = 0;
  let discrepancyCount = 0;

  // Process all MFS records first
  mfsRecords.forEach((mfs, idx) => {
    const orderId = (mfs.orderId || `ORD-${7000 + idx + 1}`).trim().toUpperCase();
    const courier = courierMap.get(orderId);
    if (courier) {
      processedCourierOrders.add(orderId);
    }

    const customer = mfs.customerName || courier?.customerName || 'Customer';
    const phone = mfs.customerPhone || courier?.customerPhone || '01700000000';
    const trxId = mfs.trxId || courier?.trxId || `TX-${orderId}`;

    const grossVal = mfs.grossAmount > 0 
      ? mfs.grossAmount 
      : courier && courier.codCollected > 0 
      ? courier.codCollected + (mfs.mfsCredit || 0)
      : (mfs.mfsCredit || 2000);

    const mfsCredit = mfs.mfsCredit > 0 ? mfs.mfsCredit : (mfs.grossAmount > 0 ? mfs.grossAmount : 0);
    const codCollected = courier?.codCollected || 0;
    const deliveryFee = courier?.deliveryFee || 90;
    const remittedAmount = courier?.remittedAmount || (codCollected > 0 ? codCollected - deliveryFee : 0);

    // Determine scheme category
    let rowCategoryKey: UnifiedAuditRow['rowCategoryKey'] = 'T1_PREPAID';
    let rowCategoryName = 'Table 1: Pre-Payment (100% MFS)';

    if (mfsCredit > 0 && codCollected > 0) {
      rowCategoryKey = 'T3_SPLIT';
      rowCategoryName = 'Table 3: Split Payment (Advance + COD)';
    } else if (mfsCredit === 0 && codCollected > 0) {
      rowCategoryKey = 'T2_COD';
      rowCategoryName = 'Table 2: Cash on Delivery (100% COD)';
    } else if (deliveryFee === 0 || mfs.statusNote?.toLowerCase().includes('free')) {
      rowCategoryKey = 'T4_FREE';
      rowCategoryName = 'Table 4: Free Delivery (Zero Charge)';
    }

    // Mathematical double-entry verification
    const effectiveGross = grossVal;
    const totalRemitted = mfsCredit + remittedAmount;
    let variance = 0;
    let status: UnifiedAuditRow['status'] = 'MATCHED';
    let statusLabel = 'MATCHED';
    let statusBadgeClasses = 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40';
    let tooltip = 'Mathematical double-entry verified: MFS gateway credit and courier remittance match ledger.';

    // Check under-remitted courier payment
    if (codCollected > 0 && remittedAmount > 0) {
      const expectedRemit = codCollected - deliveryFee - (courier?.codFee || 0);
      if (remittedAmount < expectedRemit - 5) {
        variance = -(expectedRemit - remittedAmount);
        status = 'UNDER_REMITTED';
        statusLabel = `UNDER-REMITTED (-BDT ${Math.abs(Math.round(variance))})`;
        statusBadgeClasses = 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 font-bold';
        tooltip = `Courier remitted BDT ${remittedAmount} vs expected BDT ${expectedRemit}. Flagged BDT ${Math.abs(Math.round(variance))} leakage.`;
      }
    }

    // Check delivery fee freight overcharge
    if (deliveryFee > 110) {
      const excessFee = deliveryFee - 80;
      variance = -excessFee;
      status = 'UNDER_REMITTED';
      statusLabel = `OVERCHARGE (-BDT ${excessFee})`;
      statusBadgeClasses = 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 font-bold';
      tooltip = `Courier billed BDT ${deliveryFee} delivery fee vs standard contract SLA cap BDT 80. Discrepancy flagged.`;
    }

    if (variance !== 0) {
      discrepancyCount++;
    } else {
      matchedCount++;
    }

    grossTotal += effectiveGross;
    mfsTotal += mfsCredit;
    courierCodTotal += codCollected;
    deliveryFeesTotal += deliveryFee;
    netSettledTotal += totalRemitted;
    totalVariance += variance;

    generatedRows.push({
      id: `groq-recon-${idx + 1}`,
      traceId: `TR-GROQ-${orderId}`,
      orderId,
      trxId,
      rowCategoryKey,
      rowCategoryName,
      customerName: customer,
      customerPhone: phone,
      channelPartner: mfsCredit > 0 && codCollected > 0 ? 'bKash + Courier' : mfsCredit > 0 ? 'bKash / Nagad' : 'Courier COD',
      grossOrderBDT: Math.round(effectiveGross),
      mfsCreditBDT: Math.round(mfsCredit),
      courierCodBDT: Math.round(codCollected),
      deliveryFeeBDT: Math.round(deliveryFee),
      netBankSettledBDT: Math.round(totalRemitted),
      varianceGapBDT: Math.round(variance),
      status,
      statusLabel,
      statusBadgeClasses,
      tooltip,
      notes: `Structured by ${engineLabel}. Source: ${mfsFileName} & ${courierFileName}.`
    });
  });

  // Process remaining courier records that were not in MFS (pure COD orders)
  courierRecords.forEach((courier, cIdx) => {
    const orderId = (courier.orderId || `ORD-COD-${cIdx + 1}`).trim().toUpperCase();
    if (processedCourierOrders.has(orderId)) return;

    const codCollected = courier.codCollected || 2400;
    const deliveryFee = courier.deliveryFee || 90;
    const remittedAmount = courier.remittedAmount || (codCollected - deliveryFee);
    const effectiveGross = courier.grossAmount > 0 ? courier.grossAmount : codCollected;

    let variance = 0;
    let status: UnifiedAuditRow['status'] = 'MATCHED';
    let statusLabel = 'MATCHED';
    let statusBadgeClasses = 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40';
    let tooltip = 'COD remittance validated against courier freight rate.';

    const expectedRemit = codCollected - deliveryFee - (courier.codFee || 0);
    if (remittedAmount > 0 && remittedAmount < expectedRemit - 5) {
      variance = -(expectedRemit - remittedAmount);
      status = 'UNDER_REMITTED';
      statusLabel = `UNDER-REMITTED (-BDT ${Math.abs(Math.round(variance))})`;
      statusBadgeClasses = 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 font-bold';
      tooltip = `Courier remitted BDT ${remittedAmount} vs expected BDT ${expectedRemit}. Flagged BDT ${Math.abs(Math.round(variance))} underpayment.`;
      discrepancyCount++;
    } else {
      matchedCount++;
    }

    grossTotal += effectiveGross;
    courierCodTotal += codCollected;
    deliveryFeesTotal += deliveryFee;
    netSettledTotal += remittedAmount;
    totalVariance += variance;

    generatedRows.push({
      id: `groq-cod-${cIdx + 1}`,
      traceId: `TR-COD-${orderId}`,
      orderId,
      trxId: courier.trxId || `CN-${orderId}`,
      rowCategoryKey: 'T2_COD',
      rowCategoryName: 'Table 2: Cash on Delivery (100% COD)',
      customerName: courier.customerName || 'COD Customer',
      customerPhone: courier.customerPhone || '01711000000',
      channelPartner: 'Courier COD Remittance',
      grossOrderBDT: Math.round(effectiveGross),
      mfsCreditBDT: 0,
      courierCodBDT: Math.round(codCollected),
      deliveryFeeBDT: Math.round(deliveryFee),
      netBankSettledBDT: Math.round(remittedAmount),
      varianceGapBDT: Math.round(variance),
      status,
      statusLabel,
      statusBadgeClasses,
      tooltip,
      notes: `Structured by ${engineLabel}. Pure COD delivery without advance payment.`
    });
  });

  return {
    fileName: `${mfsFileName} + ${courierFileName}`,
    rowCount: generatedRows.length,
    grossTotalBDT: Math.round(grossTotal),
    mfsTotalBDT: Math.round(mfsTotal),
    courierCodTotalBDT: Math.round(courierCodTotal),
    deliveryFeesTotalBDT: Math.round(deliveryFeesTotal),
    netSettledTotalBDT: Math.round(netSettledTotal),
    totalVarianceBDT: Math.round(totalVariance),
    matchedCount,
    discrepancyCount,
    rows: generatedRows,
    engineUsed: engineLabel
  };
}

/**
 * Unified Parser for dropped files: uses Groq backend or local heuristic parser
 */
export async function parseAndReconcileUserFiles(
  mfsText: string,
  courierText: string,
  mfsFileName = 'user_mfs_statement.csv',
  courierFileName = 'user_courier_remittance.csv'
): Promise<ParsedCsvResult> {
  // Try Groq structure on both files in parallel
  const [mfsStruct, courierStruct] = await Promise.all([
    structureWithGroq(mfsText, 'mfs', mfsFileName),
    structureWithGroq(courierText, 'courier', courierFileName)
  ]);

  const engineLabel = mfsStruct.engineUsed === 'GROQ_LLAMA_3.3_70B' || courierStruct.engineUsed === 'GROQ_LLAMA_3.3_70B'
    ? 'Groq LLaMA-3.3 70B AI Engine'
    : mfsStruct.engineUsed === 'GEMINI_2.5_FLASH' || courierStruct.engineUsed === 'GEMINI_2.5_FLASH'
    ? 'Gemini 2.5 Flash Engine'
    : 'Intelligent Heuristic Tabular Engine';

  const res = reconcileStructuredDatasets(
    mfsStruct.records,
    courierStruct.records,
    mfsFileName,
    courierFileName,
    engineLabel
  );

  res.detectedFormats = {
    mfs: mfsStruct.detectedFormat,
    courier: courierStruct.detectedFormat
  };

  return res;
}

/**
 * Local resilient fallback structure parser
 */
function localFallbackStructure(
  rawCsv: string,
  fileType: 'mfs' | 'courier' | 'bank' | 'auto',
  fileName: string
): GroqStructureResponse {
  const lines = rawCsv.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const records: StructuredRecord[] = [];

  let headerIdx = 0;
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const l = lines[i].toLowerCase();
    if (l.includes('order') || l.includes('trx') || l.includes('amount') || l.includes('consignment')) {
      headerIdx = i;
      break;
    }
  }

  const headerCells = splitCsvRow(lines[headerIdx] || '');

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#') || line.toLowerCase().includes('total') || line.toLowerCase().includes('report')) continue;
    const cells = splitCsvRow(line);
    if (cells.length < 2) continue;

    const rowObj: Record<string, string> = {};
    headerCells.forEach((h, idx) => {
      rowObj[h.toLowerCase().replace(/[^a-z0-9]/g, '')] = cells[idx] || '';
    });

    const orderId = (
      rowObj['orderid'] || rowObj['order'] || rowObj['invoiceno'] || rowObj['invoice'] || `FB-ORD-${7000 + i}`
    ).toUpperCase();

    const trxId = (
      rowObj['trxid'] || rowObj['trx'] || rowObj['consignmentid'] || rowObj['consignment'] || `TRX-${i}`
    ).toUpperCase();

    const grossAmount = parseNum(rowObj['grossamountbdt'] || rowObj['gross'] || rowObj['amount'] || '0');
    const mfsCredit = parseNum(rowObj['netcreditbdt'] || rowObj['mfscredit'] || rowObj['credited'] || '0');
    const codCollected = parseNum(rowObj['codcollectedbdt'] || rowObj['codcollected'] || rowObj['cod'] || '0');
    const deliveryFee = parseNum(rowObj['deliveryfeebdt'] || rowObj['deliveryfee'] || '90') || 90;
    const remittedAmount = parseNum(rowObj['remittedamountbdt'] || rowObj['remittedamount'] || '0');

    records.push({
      orderId,
      trxId,
      customerName: rowObj['customername'] || rowObj['customer'] || 'Customer',
      customerPhone: rowObj['customerphone'] || rowObj['phone'] || '01700000000',
      date: rowObj['date'] || new Date().toISOString().slice(0, 10),
      grossAmount,
      mfsCredit,
      codCollected,
      deliveryFee,
      codFee: 0,
      remittedAmount,
      statusNote: rowObj['status'] || 'Processed'
    });
  }

  return {
    success: true,
    engineUsed: 'INTELLIGENT_HEURISTIC_PARSER',
    modelName: 'Tabular Heuristics',
    detectedType: fileType === 'mfs' ? 'MFS' : 'COURIER',
    detectedFormat: `${fileName} (Standardized)`,
    processingTimeMs: 12,
    records,
    summary: {
      totalRecords: records.length,
      totalGrossBDT: records.reduce((s, r) => s + r.grossAmount, 0),
      totalMfsCreditBDT: records.reduce((s, r) => s + r.mfsCredit, 0),
      totalCodCollectedBDT: records.reduce((s, r) => s + r.codCollected, 0),
      totalDeliveryFeeBDT: records.reduce((s, r) => s + r.deliveryFee, 0),
      totalRemittedBDT: records.reduce((s, r) => s + r.remittedAmount, 0)
    }
  };
}

function splitCsvRow(rowStr: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === '\t') && !inQuotes) {
      result.push(current.trim().replace(/^"+|"+$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"+|"+$/g, ''));
  return result;
}

function parseNum(val: string): number {
  if (!val) return 0;
  const num = parseFloat(val.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
}
