export type TrackMode = 'track-a' | 'track-b';

export type ActivePage = 
  | 'login'
  | 'orders'
  | 'audit'
  | 'reports'
  | 'returns'
  | 'security'
  | 'portal-select'
  | 'track-a/dashboard'
  | 'track-a/orders'
  | 'track-a/lifecycle'
  | 'track-a/audit'
  | 'track-a/reports'
  | 'track-b/dashboard'
  | 'track-b/ingestion'
  | 'track-b/lifecycle'
  | 'track-b/audit'
  | 'track-b/warehouse'
  | 'track-b/reports'
  | 'return-policy'
  | 'metrics'
  | 'performance-metrics';

export type PaymentSchemeType = 
  | 'FULL_ADVANCE'    // 100% Pre-Paid via bKash/Nagad
  | 'SPLIT_PAYMENT'   // Advance MFS booking fee + COD balance at doorstep
  | 'FULL_COD'        // 100% Cash on Delivery
  | 'FREE_DELIVERY';  // Absorbed delivery fee (Promo campaign)

export type ReconcileLifecycleStatus = 
  | 'PRE_RECONCILED_PENDING'  // Ingested, unverified against bank / courier remit
  | 'RECONCILED_SETTLED'      // Matched, bank deposit locked, fee calculated, ledger updated
  | 'DISPUTE_VARIANCE';       // Variance detected (e.g. excess fee or missing payment)

export interface PaymentSchemeRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  scheme: PaymentSchemeType;
  schemeLabel: string;
  grossAmount: number;
  advancePaid: number;
  codCollectable: number;
  mfsGatewayFee: number;
  courierDeliveryFee: number;
  courierCodFee: number;
  marketingAbsorbedSubsidy: number;
  expectedNetPayout: number;
  settledNetPayout: number | null;
  status: ReconcileLifecycleStatus;
  mfsTrxId?: string;
  courierConsignment?: string;
  courierPartner?: string;
  preReconcileNote: string;
  postReconcileNote?: string;
  reconciliationTimestamp?: string;
  settlementChecksum?: string;
  bankStatementRef?: string;
  track: 'Track A Enterprise' | 'Track B SME';
}

export interface DailyPaymentBreakdown {
  date: string;
  fullAdvanceCount: number;
  fullAdvanceBDT: number;
  splitPaymentCount: number;
  splitAdvanceBDT: number;
  splitCodBDT: number;
  splitTotalBDT: number;
  fullCodCount: number;
  fullCodBDT: number;
  freeDeliveryCount: number;
  freeDeliveryAbsorbedBDT: number;
  totalOrdersCount: number;
  totalVolumeBDT: number;
}

export interface HistoricalChartPoint {
  periodKey: string;
  displayLabel: string;
  fullAdvanceBDT: number;
  splitPaymentBDT: number;
  fullCodBDT: number;
  freeDeliveryBDT: number;
  totalBDT: number;
  orderCount: number;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  gateway: 'bKash' | 'Nagad' | 'Pathao' | 'Steadfast';
  eventType: string;
  trxId: string;
  amount: number;
  currency: 'BDT';
  payload: Record<string, any>;
  status: '200_OK' | '202_ACCEPTED' | 'VERIFIED' | 'FAILED_HMAC';
}

export interface Table1PrepaidOrder {
  orderId: string;
  timestamp: string;
  traceId: string;
  gateway: 'bKash' | 'Nagad' | 'Rocket';
  amount: number;
  merchantInvoiceNumber: string;
  status: 'Paid';
}

export interface Table2CODOrder {
  orderId: string;
  timestamp: string;
  traceId: string;
  courierPartner: 'Pathao Courier' | 'Steadfast' | 'RedX';
  collectableAmount: number;
  barcodeShippingTag: string;
  status: 'Pending Delivery';
}

export interface Table3SplitOrder {
  orderId: string;
  twinTraceId: string;
  advanceMfsPaid: number;
  unpaidCodBalance: number;
  courierBookingRef: string;
  gateway: string;
  courierPartner: string;
  status: 'Dual-Pulse Injected';
}

export interface Table4FreeDeliveryOrder {
  orderId: string;
  traceId: string;
  deliveryCharge: number;
  marketingExpenseLedgerEntry: string;
  cashToCollect: number;
  status: 'Promo Verified';
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

export interface AuditRecord {
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
}

export interface IngestedMfsEmail {
  id: string;
  receivedAt: string;
  senderAddress: string;
  subject: string;
  provider: 'bKash Merchant' | 'Nagad Merchant';
  trxId: string;
  senderMobile: string;
  amount: number;
  status: 'RAW_INGESTED' | 'LINKED_TO_PARCEL' | 'UNMATCHED';
  rawBody: string;
}

export interface DispatchedParcel {
  id: string;
  orderId: string;
  traceId: string;
  dispatchType: '100% Pre-Paid' | '100% COD' | 'Split Advance Paid' | 'Free Shipping';
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  courier: 'Pathao Courier' | 'Steadfast' | 'RedX';
  linkedTrxId?: string;
  advancePaidBDT: number;
  codCollectionBDT: number;
  deliveryFeeBDT: number;
  marketingSubsidyBDT: number;
  barcodeTag: string;
  timestamp: string;
  status: 'DISPATCHED_TO_COURIER' | 'IN_TRANSIT' | 'RETURN_IN_TRANSIT' | 'RETURN_RECEIVED_IN_WAREHOUSE';
}

export interface ReconciledReportBatch {
  batchId: string;
  dateProcessed: string;
  trackMode: 'Track A Enterprise' | 'Track B SME' | 'Consolidated';
  totalRows: number;
  matchedRate: number;
  anomalyCount: number;
  netSettledSumBDT: number;
  fileName: string;
  status: 'VERIFIED_FINAL' | 'VARIANCE_FLAGGED' | 'STAGED';
}

export type ReturnScanStatus = 
  | 'RETURN_IN_TRANSIT'
  | 'GHOST_RETURN_EXCEPTION'
  | 'RETURN_RECEIVED_IN_WAREHOUSE'
  | 'RESTOCKED_IN_INVENTORY'
  | 'DAMAGED_DISPUTED';

export type InboundBarcodeOrigin = 'API_CHECKOUT_WEBHOOK' | 'IMAP_EMAIL_LISTENER';

export interface ReturnAuditMetadata {
  timestamp: string;
  warehouseId: string;
  operatorId: string;
  traceId: string;
  intakeBay: string;
  deviceType?: 'PWA_CAMERA_SCANNER' | 'LASER_GUN_TERMINAL' | 'MANUAL_ENTRY';
}

export interface ReturnParcelRecord {
  id: string;
  traceId: string;
  orderId: string;
  track: 'Track A Enterprise' | 'Track B SME';
  originType: InboundBarcodeOrigin;
  originDetail: string; // e.g. "Direct Checkout Webhook API Payload (Pathao)" or "IMAP Email Token Mapped by Automated Broker"
  customerName: string;
  customerPhone: string;
  courierPartner: 'Pathao Courier' | 'Steadfast' | 'RedX';
  parcelValueBDT: number;
  forwardFeeBDT: number;
  returnFeeBDT: number; // Courier deducted / billed return fee
  contractReturnFeeBDT?: number; // Contractual allowable return fee (e.g. BDT 60 cap or BDT 0 for SLA waiver)
  returnChargeReconStatus?: 'VALIDATED_MATCH' | 'CHARGE_OVERBILLED' | 'SLA_BREACH_WAIVED' | 'GHOST_BLOCKED';
  returnChargeReconNote?: string;
  disputeClaimReference?: string;
  returnReason: string;
  dispatchedDate: string;
  dispatchTimestamp: string;
  returnInitiatedDate: string;
  scannedAtWarehouse: boolean;
  scanTimestamp?: string;
  scannedBay?: string;
  warehouseId?: string;
  operatorId?: string;
  status: ReturnScanStatus;
  notes?: string;
  barcodeTag: string;

  // 3-Vector Deterministic Audit Properties
  courierReportedStatus: 'RETURNED' | 'IN_TRANSIT' | 'CLAIMED_DELIVERED';
  deltaDaysInTransit: number; // Delta = Batch_Date - Dispatch_Timestamp

  // Vector 1: Arbitrary Penalty Cap Overcharge Audit
  vector1OverchargeVarianceBDT: number; // Courier_Deduction - Configured_Base_Fee
  vector1Status: 'VALID' | 'LOGISTICS_RETURN_VARIANCE_ERROR';

  // Vector 2: Courier Hub Transit Retention Audit
  vector2RetentionGap: boolean; // Delta > Threshold_Days && Warehouse_Status != RETURN_RECEIVED_IN_WAREHOUSE
  vector2AlertMessage?: string;

  // Vector 3: Multi-Tenant Warehouse Inbound Synchronization (Ghost Return Audit)
  vector3GhostException: boolean; // Courier_Statement_Contains_Return_Fee && Warehouse_Status != RETURN_RECEIVED_IN_WAREHOUSE
  vector3Recommendation?: string;
}

export interface Midnight3VectorSummary {
  batchRunTimestamp: string;
  totalParcelsAudited: number;
  matchedReturnFeeCount?: number;
  matchedReturnFeeTotalBDT?: number;
  vector1OverchargeCount: number;
  vector1TotalVarianceBDT: number;
  vector2RetentionGapCount: number;
  vector2InventoryAtRiskBDT: number;
  vector3GhostReturnCount: number;
  vector3GhostDebitsBlockedBDT: number;
  configuredBaseFeeBDT: number;
  configuredRetentionThresholdDays: number;
  replicaHost: string;
  queryLatencyMs: number;
}

export interface ShadowDbTelemetry {
  primaryMaster: {
    host: string;
    cpuLoadPercent: number;
    activeCheckouts: number;
    iops: number;
    status: 'ONLINE_OPTIMAL';
  };
  shadowReadReplica: {
    host: string;
    cpuLoadPercent: number;
    replicationLagMs: number;
    auditQueriesExecuted: number;
    status: 'ACTIVE_READ_REPLICA';
  };
  retentionWindowDays: number;
  totalLedgerRows: number;
  oldestRecordDate: string;
  nextPurgeScheduled: string;
}

export interface TtlPurgeLog {
  id: string;
  timestamp: string;
  recordsPurged: number;
  timeWindowCutoff: string;
  durationMs: number;
  status: 'COMPLETED_SUCCESS' | 'RUNNING';
  queryExecuted: string;
}

export type UnifiedRowCategoryKey = 
  | 'T1_PREPAID'
  | 'T2_COD'
  | 'T3_SPLIT'
  | 'T4_FREE'
  | 'T5_RETURN';

export interface UnifiedAuditRow {
  id: string;
  traceId: string;
  orderId: string;
  trxId?: string;
  rowCategoryKey: UnifiedRowCategoryKey;
  rowCategoryName: string;
  customerName: string;
  customerPhone?: string;
  channelPartner: string;
  grossOrderBDT: number;
  mfsCreditBDT: number | 'ABSENT';
  courierCodBDT: number | 'ABSENT';
  deliveryFeeBDT: number;
  netBankSettledBDT: number | 'ABSENT';
  varianceGapBDT: number;
  status: AnomalyType | 'UNDER_REMITTED' | 'UNLINKED_MFS';
  statusLabel: string;
  statusBadgeClasses: string;
  tooltip: string;
  notes?: string;
  isResolved?: boolean;
}

export type SettlementStatusCategory = 'Balanced' | 'Under-Settled' | 'Over-Settled';

export interface MonthlySettlementMetric {
  periodKey: string;
  displayMonth: string;
  shortLabel: string;
  totalTransactionsBDT: number;
  totalOrderCount: number;
  settlementSuccessRate: number; // e.g. 96.8%
  
  // Ratios & Totals
  balancedBDT: number;
  balancedCount: number;
  balancedRatio: number; // percentage
  
  underSettledBDT: number;
  underSettledCount: number;
  underSettledRatio: number; // percentage
  
  overSettledBDT: number;
  overSettledCount: number;
  overSettledRatio: number; // percentage

  // Root cause metadata & audit details
  underSettledReasons: {
    courierRiderHoldingBDT: number;
    feeSlaOverchargeBDT: number;
    ghostDebitsBlockedBDT: number;
  };
  overSettledReasons: {
    duplicateMfsCreditsBDT: number;
    promotionalRebatesBDT: number;
  };
  settlementBatchesCount: number;
  bankSettlementLineBDT: number;
  reconciliationAuditChecksum: string;
}

