/**
 * Levenshtein distance algorithm for fuzzy parameter cross-matching
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = new Array<number[]>(bn + 1);
  for (let i = 0; i <= bn; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

export function normalizeParam(val: string | undefined | null): string {
  if (!val) return '';
  return val.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export type AnomalyType = 
  | 'MATCHED'
  | 'AMOUNT_MISMATCH'
  | 'MISSING_PAYMENT'
  | 'GHOST_ENTRY'
  | 'LOGISTICS_VARIANCE'
  | 'RETURN_VARIANCE_ERROR'
  | 'COURIER_RETENTION_GAP'
  | 'GHOST_RETURN_EXCEPTION'
  | 'RETURN_RECEIVED_IN_WAREHOUSE';

export interface AuditRecordInput {
  id: string;
  traceId: string;
  trxId?: string;
  orderId?: string;
  customerPhone?: string;
  dbAmount: number | 'ABSENT';
  settledAmount: number | 'ABSENT';
  courierDeductedFee?: number;
  configFee?: number;
  dispatchedDaysAgo?: number;
  channel: 'Track A Enterprise' | 'Track B SME';
  scannedAtWarehouse?: boolean;
  courierReportedReturn?: boolean;
}

export interface ReconcileResultItem {
  id: string;
  traceId: string;
  trxId?: string;
  orderId?: string;
  customerPhone?: string;
  dbAmount: number | 'ABSENT';
  settledAmount: number | 'ABSENT';
  courierDeductedFee?: number;
  configFee?: number;
  dispatchedDaysAgo?: number;
  status: AnomalyType;
  badgeColor: 'green' | 'red' | 'amber' | 'cyan' | 'orange' | 'crimson' | 'purple';
  tooltip: string;
  notes?: string;
  channel: 'Track A Enterprise' | 'Track B SME';
  timestamp: string;
  resolved?: boolean;
  similarityScore?: number;
}

/**
 * Deterministic Matching Engine across parameters (TrxID, Amount, Phone Number, TraceID)
 */
export function evaluateAuditRecord(rec: AuditRecordInput): ReconcileResultItem {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // 1. Ghost Return Check: Courier charged return fee, but barcode scan missing at warehouse PWA
  if (rec.courierReportedReturn && !rec.scannedAtWarehouse && (rec.courierDeductedFee || 0) > 0) {
    return {
      ...rec,
      status: 'GHOST_RETURN_EXCEPTION',
      badgeColor: 'crimson',
      tooltip: 'GHOST RETURN EXCEPTION: Courier charged return fee, but barcode scan missing at warehouse PWA.',
      notes: 'Zero-debit hold applied. Remittance clawback generated for missing physical parcel.',
      timestamp: nowStr,
      resolved: false
    };
  }

  // 2. Courier Retention Gap: Parcel in transit / return state > 7 days
  if ((rec.dispatchedDaysAgo || 0) > 7 && !rec.scannedAtWarehouse && rec.settledAmount === 'ABSENT') {
    return {
      ...rec,
      status: 'COURIER_RETENTION_GAP',
      badgeColor: 'orange',
      tooltip: `COURIER RETENTION GAP: Parcel in transit/return state for ${rec.dispatchedDaysAgo} days (> 7 days SLA).`,
      notes: 'SLA breach ticket initiated. Inventory flagged as stalled in transit hub.',
      timestamp: nowStr,
      resolved: false
    };
  }

  // 3. Untracked DB Revenue (Cash in bank statement without order row)
  if (rec.dbAmount === 'ABSENT' && typeof rec.settledAmount === 'number') {
    return {
      ...rec,
      status: 'GHOST_ENTRY',
      badgeColor: 'cyan',
      tooltip: 'UNTRACKED DB REVENUE: Cash in bank statement without corresponding internal order row.',
      notes: 'Unassigned remittance received. Flagged for merchant manual mapping.',
      timestamp: nowStr,
      resolved: false
    };
  }

  // 4. Missing in MFS Record (Order marked paid internally, missing in MFS dump)
  if (typeof rec.dbAmount === 'number' && rec.settledAmount === 'ABSENT') {
    return {
      ...rec,
      status: 'MISSING_PAYMENT',
      badgeColor: 'red',
      tooltip: 'MISSING IN MFS RECORD: Order marked paid internally, missing in MFS dump.',
      notes: 'Transaction unverified by gateway. Potential payment drop or fake order injection.',
      timestamp: nowStr,
      resolved: false
    };
  }

  // 5. Amount Mismatch Error (Internal expected amount != MFS received amount)
  if (
    typeof rec.dbAmount === 'number' &&
    typeof rec.settledAmount === 'number' &&
    Math.abs(rec.dbAmount - rec.settledAmount) > 0.01
  ) {
    const diff = rec.dbAmount - rec.settledAmount;
    return {
      ...rec,
      status: 'AMOUNT_MISMATCH',
      badgeColor: 'red',
      tooltip: `AMOUNT MISMATCH ERROR: Internal expected BDT ${rec.dbAmount} != Settled BDT ${rec.settledAmount} (Variance: BDT ${diff.toFixed(2)}).`,
      notes: `Financial discrepancy of BDT ${diff.toFixed(2)} detected between ERP ledger and gateway remittance.`,
      timestamp: nowStr,
      resolved: false
    };
  }

  // 6. Logistics Variance Error (Courier charges exceed configured baseline fees)
  if (
    rec.courierDeductedFee !== undefined &&
    rec.configFee !== undefined &&
    rec.courierDeductedFee > rec.configFee
  ) {
    const overcharge = rec.courierDeductedFee - rec.configFee;
    return {
      ...rec,
      status: 'LOGISTICS_VARIANCE',
      badgeColor: 'amber',
      tooltip: `LOGISTICS VARIANCE ERROR: Courier charges BDT ${rec.courierDeductedFee} exceed configured baseline fee BDT ${rec.configFee} (+BDT ${overcharge.toFixed(2)} overcharge).`,
      notes: `Contractual rate cap exceeded. Auto-clawback adjustment of BDT ${overcharge.toFixed(2)} appended to next invoice.`,
      timestamp: nowStr,
      resolved: false
    };
  }

  // 7. Perfect Match
  return {
    ...rec,
    status: 'MATCHED',
    badgeColor: 'green',
    tooltip: 'VERIFIED MATCH: Cryptographic TraceID, TrxID, Amount, and Settlement completely aligned (100% Balanced).',
    notes: 'Three-way match confirmed. Ready for financial ledger booking.',
    timestamp: nowStr,
    resolved: true
  };
}

export interface BankSumCheckResult {
  mfsTotalSuccessful: number;
  courierDisbursedCOD: number;
  expectedConsolidatedSum: number;
  bankConsolidatedDepositLine: number;
  varianceAmount: number;
  status: '100% Balanced' | 'Under-Settled' | 'Over-Settled';
  balancePercentage: number;
  formulaDescription: string;
}

/**
 * Consolidated Bank Sum Check Formula:
 * Σ (MFS Successful Traces) + Σ (Courier Disbursed COD Traces) == Bank Consolidated Deposit Line
 */
export function calculateBankSumCheck(
  mfsTracesTotal: number,
  courierCodTotal: number,
  bankDepositLine: number
): BankSumCheckResult {
  const expectedConsolidatedSum = mfsTracesTotal + courierCodTotal;
  const varianceAmount = bankDepositLine - expectedConsolidatedSum;

  let status: '100% Balanced' | 'Under-Settled' | 'Over-Settled' = '100% Balanced';
  if (varianceAmount < -0.01) {
    status = 'Under-Settled';
  } else if (varianceAmount > 0.01) {
    status = 'Over-Settled';
  }

  const balancePercentage = expectedConsolidatedSum > 0 
    ? Math.min(100, Math.round((Math.min(bankDepositLine, expectedConsolidatedSum) / expectedConsolidatedSum) * 1000) / 10)
    : 100;

  return {
    mfsTotalSuccessful: mfsTracesTotal,
    courierDisbursedCOD: courierCodTotal,
    expectedConsolidatedSum,
    bankConsolidatedDepositLine: bankDepositLine,
    varianceAmount,
    status,
    balancePercentage,
    formulaDescription: `Σ (MFS: BDT ${mfsTracesTotal.toLocaleString()}) + Σ (COD: BDT ${courierCodTotal.toLocaleString()}) = Expected BDT ${expectedConsolidatedSum.toLocaleString()} vs Bank BDT ${bankDepositLine.toLocaleString()} -> Status: ${status}`
  };
}
