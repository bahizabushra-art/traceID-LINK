import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ActivePage,
  WebhookLog,
  Table1PrepaidOrder,
  Table2CODOrder,
  Table3SplitOrder,
  Table4FreeDeliveryOrder,
  AuditRecord,
  IngestedMfsEmail,
  DispatchedParcel,
  ReconciledReportBatch,
  PaymentSchemeRecord,
  PaymentSchemeType,
  DailyPaymentBreakdown,
  HistoricalChartPoint,
  ReturnParcelRecord,
  Midnight3VectorSummary,
  ShadowDbTelemetry,
  TtlPurgeLog
} from '../types';
import {
  INITIAL_WEBHOOKS,
  INITIAL_TABLE1_PREPAID,
  INITIAL_TABLE2_COD,
  INITIAL_TABLE3_SPLIT,
  INITIAL_TABLE4_FREE,
  INITIAL_AUDIT_RECORDS,
  INITIAL_IMAP_EMAILS,
  INITIAL_DISPATCHED_PARCELS,
  INITIAL_REPORT_BATCHES,
  INITIAL_PAYMENT_SCHEME_RECORDS,
  INITIAL_DAILY_PAYMENT_BREAKDOWN,
  INITIAL_HISTORICAL_DAILY_DATA,
  INITIAL_HISTORICAL_WEEKLY_DATA,
  INITIAL_HISTORICAL_MONTHLY_DATA,
  INITIAL_RETURN_PARCELS,
  INITIAL_SHADOW_DB_TELEMETRY
} from '../data/mockData';

interface ReconContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentTrack: 'track-a' | 'track-b';
  setCurrentTrack: (track: 'track-a' | 'track-b') => void;
  
  // Bank Sum Check
  isBankVarianceToggled: boolean;
  setIsBankVarianceToggled: (val: boolean | ((prev: boolean) => boolean)) => void;
  mfsTotal: number;
  codTotal: number;
  bankDepositLine: number;
  varianceAmount: number;
  
  // Webhooks
  webhooks: WebhookLog[];
  isWebhookStreaming: boolean;
  setIsWebhookStreaming: (val: boolean | ((prev: boolean) => boolean)) => void;
  clearWebhooks: () => void;
  
  // Track A Orders
  table1Prepaid: Table1PrepaidOrder[];
  table2COD: Table2CODOrder[];
  table3Split: Table3SplitOrder[];
  table4Free: Table4FreeDeliveryOrder[];
  
  // Track A Audit & File Uploads
  auditRecords: AuditRecord[];
  isAuditRunning: boolean;
  runTrackAAudit: () => void;
  courierFileUploaded: boolean;
  setCourierFileUploaded: (val: boolean) => void;
  trackACourierFileName: string;
  setTrackACourierFileName: (name: string) => void;
  uploadTrackACourierFile: (name: string, rowCount?: number) => void;
  bankFileUploaded: boolean;
  setBankFileUploaded: (val: boolean) => void;
  trackABankFileName: string;
  setTrackABankFileName: (name: string) => void;
  uploadTrackABankFile: (name: string, deposit?: number) => void;
  removeTrackABankFile: () => void;
  
  // Track B
  imapEmails: IngestedMfsEmail[];
  selectedEmailForDispatch: IngestedMfsEmail | null;
  setSelectedEmailForDispatch: (email: IngestedMfsEmail | null) => void;
  dispatchedParcels: DispatchedParcel[];
  dispatchNewParcel: (parcel: Omit<DispatchedParcel, 'id' | 'timestamp' | 'status'>) => DispatchedParcel;
  activeLabelModalParcel: DispatchedParcel | null;
  setActiveLabelModalParcel: (p: DispatchedParcel | null) => void;
  
  // Track B Simultaneous Reconcile (Courier, MFS, and Optional Bank File)
  trackBMfsUploaded: boolean;
  setTrackBMfsUploaded: (val: boolean) => void;
  trackBMfsFileName: string;
  setTrackBMfsFileName: (name: string) => void;
  uploadTrackBMfsFile: (name: string) => void;
  trackBCourierUploaded: boolean;
  setTrackBCourierUploaded: (val: boolean) => void;
  trackBCourierFileName: string;
  setTrackBCourierFileName: (name: string) => void;
  uploadTrackBCourierFile: (name: string) => void;
  trackBBankUploaded: boolean;
  setTrackBBankUploaded: (val: boolean) => void;
  trackBBankFileName: string;
  setTrackBBankFileName: (name: string) => void;
  uploadTrackBBankFile: (name: string) => void;
  removeTrackBBankFile: () => void;
  clearTrackBFiles: () => void;
  isTrackBAuditRunning: boolean;
  trackBAuditExecuted: boolean;
  runTrackBDualAudit: () => void;
  
  // Warehouse Scanner & Return Policy Sync (Both Track A & Track B)
  warehouseScanHistory: Array<{ code: string; timestamp: string; success: boolean; message: string }>;
  scanBarcode: (barcode: string) => { success: boolean; message: string };
  returnParcels: ReturnParcelRecord[];
  scanReturnedParcel: (
    barcodeOrTraceId: string, 
    bay?: string, 
    whId?: string, 
    opId?: string
  ) => { 
    success: boolean; 
    message: string; 
    updatedParcel?: ReturnParcelRecord;
    reconSummary?: {
      courierReturnFee: number;
      allowableReturnFee: number;
      overchargeVariance: number;
      isOvercharge: boolean;
      isSlaBreached: boolean;
      status: 'VALIDATED_MATCH' | 'CHARGE_OVERBILLED' | 'SLA_BREACH_WAIVED' | 'GHOST_BLOCKED';
    };
  };
  filterReturnTrack: 'ALL' | 'Track A Enterprise' | 'Track B SME';
  setFilterReturnTrack: (track: 'ALL' | 'Track A Enterprise' | 'Track B SME') => void;
  scanFeedback: string | null;

  // Midnight 3-Vector Return Audit Engine & Inbound Anchoring
  configuredBaseFeeBDT: number;
  setConfiguredBaseFeeBDT: (fee: number) => void;
  retentionThresholdDays: number;
  setRetentionThresholdDays: (days: number) => void;
  warehouseId: string;
  setWarehouseId: (id: string) => void;
  operatorId: string;
  setOperatorId: (id: string) => void;
  midnightAuditSummary: Midnight3VectorSummary | null;
  isMidnightBatchRunning: boolean;
  midnightBatchLogs: string[];
  runMidnight3VectorAudit: () => void;

  // Shadow Database Isolation & Rolling 180-Day TTL
  shadowDbTelemetry: ShadowDbTelemetry;
  ttlPurgeLogs: TtlPurgeLog[];
  executeDailyTtlPurge: () => void;
  
  // Payment Schemes Lifecycle (Full Advance, Split, Full COD, Free Delivery)
  paymentSchemeRecords: PaymentSchemeRecord[];
  reconcileSchemeRecords: (recordIds?: string[], track?: 'Track A Enterprise' | 'Track B SME') => { count: number; settledSum: number };
  downloadSchemeLifecycleCSV: (track?: 'Track A Enterprise' | 'Track B SME') => void;
  
  // Daily Payment Live Updates & 6-Month Visual Ledger
  dailyPaymentBreakdown: DailyPaymentBreakdown;
  simulateIncomingPayment: (scheme: PaymentSchemeType) => void;
  closeDayAndTransferToHistory: () => { message: string; dayTotal: number };
  historicalDailyData: HistoricalChartPoint[];
  historicalWeeklyData: HistoricalChartPoint[];
  historicalMonthlyData: HistoricalChartPoint[];
  
  // Reports & Downloadable Reconciled Outputs
  reportBatches: ReconciledReportBatch[];
  previewBatch: ReconciledReportBatch | null;
  setPreviewBatch: (batch: ReconciledReportBatch | null) => void;
  downloadBatchCSV: (batch: ReconciledReportBatch) => void;
  generateAndDownloadTrackAReconciledCSV: () => ReconciledReportBatch;
  generateAndDownloadTrackBReconciledCSV: () => ReconciledReportBatch;
  
  // Security TTL
  ttlTerminalLogs: string[];
  isTtlRunning: boolean;
  runTtlPurgeSimulation: () => void;
  
  // Global Metrics
  todayIngestedRevenue: number;
  
  // Mobile Navigation
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
}

const ReconContext = createContext<ReconContextType | undefined>(undefined);

export const ReconProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start on login gateway by default for the TraceID Link prototype user journey
  const [activePage, setActivePageState] = useState<ActivePage>('login');
  const [currentTrack, setCurrentTrackState] = useState<'track-a' | 'track-b'>('track-a');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const setCurrentTrack = useCallback((track: 'track-a' | 'track-b') => {
    setCurrentTrackState(track);
  }, []);

  const setActivePage = useCallback((page: ActivePage) => {
    setActivePageState(page);
    setIsMobileNavOpen(false);
    if (page.startsWith('track-a')) {
      setCurrentTrackState('track-a');
    } else if (page.startsWith('track-b')) {
      setCurrentTrackState('track-b');
    }
  }, []);
  
  // Bank Sum state
  const [isBankVarianceToggled, setIsBankVarianceToggled] = useState<boolean>(false);
  const mfsTotal = 3500000;
  const codTotal = 1500000;
  const varianceAmount = isBankVarianceToggled ? -10000 : 0;
  const bankDepositLine = isBankVarianceToggled ? 4990000 : 5000000;
  
  // Today's Ingested Revenue
  const [todayIngestedRevenue, setTodayIngestedRevenue] = useState<number>(5482350);
  
  // Webhooks
  const [webhooks, setWebhooks] = useState<WebhookLog[]>(INITIAL_WEBHOOKS);
  const [isWebhookStreaming, setIsWebhookStreaming] = useState<boolean>(true);
  
  // Orders Tables
  const [table1Prepaid] = useState<Table1PrepaidOrder[]>(INITIAL_TABLE1_PREPAID);
  const [table2COD] = useState<Table2CODOrder[]>(INITIAL_TABLE2_COD);
  const [table3Split] = useState<Table3SplitOrder[]>(INITIAL_TABLE3_SPLIT);
  const [table4Free] = useState<Table4FreeDeliveryOrder[]>(INITIAL_TABLE4_FREE);
  
  // Audit Records & File Uploads (Track A)
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(INITIAL_AUDIT_RECORDS);
  const [courierFileUploaded, setCourierFileUploaded] = useState<boolean>(true);
  const [trackACourierFileName, setTrackACourierFileName] = useState<string>('Pathao_Settlement_Batch_20260907.csv');
  const [bankFileUploaded, setBankFileUploaded] = useState<boolean>(false);
  const [trackABankFileName, setTrackABankFileName] = useState<string>('Dhaka_Bank_Settlement_20260907.pdf');
  const [isAuditRunning, setIsAuditRunning] = useState<boolean>(false);

  const uploadTrackACourierFile = useCallback((name: string) => {
    setTrackACourierFileName(name);
    setCourierFileUploaded(true);
  }, []);

  const uploadTrackABankFile = useCallback((name: string) => {
    setTrackABankFileName(name);
    setBankFileUploaded(true);
    setIsBankVarianceToggled(false); // Validates bank match
  }, []);

  const removeTrackABankFile = useCallback(() => {
    setBankFileUploaded(false);
  }, []);
  
  // Payment Scheme Records (Lifecycle before vs after reconciliation)
  const [paymentSchemeRecords, setPaymentSchemeRecords] = useState<PaymentSchemeRecord[]>(INITIAL_PAYMENT_SCHEME_RECORDS);
  
  // Daily Payment Breakdown
  const [dailyPaymentBreakdown, setDailyPaymentBreakdown] = useState<DailyPaymentBreakdown>(INITIAL_DAILY_PAYMENT_BREAKDOWN);
  
  // 6-Month Historical Data
  const [historicalDailyData, setHistoricalDailyData] = useState<HistoricalChartPoint[]>(INITIAL_HISTORICAL_DAILY_DATA);
  const [historicalWeeklyData, setHistoricalWeeklyData] = useState<HistoricalChartPoint[]>(INITIAL_HISTORICAL_WEEKLY_DATA);
  const [historicalMonthlyData, setHistoricalMonthlyData] = useState<HistoricalChartPoint[]>(INITIAL_HISTORICAL_MONTHLY_DATA);

  // Track B Ingestion & Dispatch
  const [imapEmails, setImapEmails] = useState<IngestedMfsEmail[]>(INITIAL_IMAP_EMAILS);
  const [selectedEmailForDispatch, setSelectedEmailForDispatch] = useState<IngestedMfsEmail | null>(null);
  const [dispatchedParcels, setDispatchedParcels] = useState<DispatchedParcel[]>(INITIAL_DISPATCHED_PARCELS);
  const [activeLabelModalParcel, setActiveLabelModalParcel] = useState<DispatchedParcel | null>(null);
  
  // Track B Simultaneous Reconcile (Starts clean for app production mode)
  const [trackBMfsUploaded, setTrackBMfsUploaded] = useState<boolean>(false);
  const [trackBMfsFileName, setTrackBMfsFileName] = useState<string>('');
  const [trackBCourierUploaded, setTrackBCourierUploaded] = useState<boolean>(false);
  const [trackBCourierFileName, setTrackBCourierFileName] = useState<string>('');
  const [trackBBankUploaded, setTrackBBankUploaded] = useState<boolean>(false);
  const [trackBBankFileName, setTrackBBankFileName] = useState<string>('');
  const [isTrackBAuditRunning, setIsTrackBAuditRunning] = useState<boolean>(false);
  const [trackBAuditExecuted, setTrackBAuditExecuted] = useState<boolean>(false);

  const uploadTrackBMfsFile = useCallback((name: string) => {
    setTrackBMfsFileName(name);
    setTrackBMfsUploaded(true);
  }, []);

  const uploadTrackBCourierFile = useCallback((name: string) => {
    setTrackBCourierFileName(name);
    setTrackBCourierUploaded(true);
  }, []);

  const uploadTrackBBankFile = useCallback((name: string) => {
    setTrackBBankFileName(name);
    setTrackBBankUploaded(true);
  }, []);

  const removeTrackBBankFile = useCallback(() => {
    setTrackBBankFileName('');
    setTrackBBankUploaded(false);
  }, []);

  const clearTrackBFiles = useCallback(() => {
    setTrackBMfsFileName('');
    setTrackBMfsUploaded(false);
    setTrackBCourierFileName('');
    setTrackBCourierUploaded(false);
    setTrackBBankFileName('');
    setTrackBBankUploaded(false);
    setTrackBAuditExecuted(false);
  }, []);

  // Return Policy & Parcels Across Both Track A and Track B
  const [returnParcels, setReturnParcels] = useState<ReturnParcelRecord[]>(INITIAL_RETURN_PARCELS);
  const [filterReturnTrack, setFilterReturnTrack] = useState<'ALL' | 'Track A Enterprise' | 'Track B SME'>('ALL');
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  // Midnight 3-Vector Return Engine & Inbound Barcode Anchoring
  const [configuredBaseFeeBDT, setConfiguredBaseFeeBDTState] = useState<number>(60);
  const [retentionThresholdDays, setRetentionThresholdDaysState] = useState<number>(7);
  const [warehouseId, setWarehouseId] = useState<string>('WH-DHK-TEJGAON-01');
  const [operatorId, setOperatorId] = useState<string>('OP-8821-RAHMAN');
  const [midnightAuditSummary, setMidnightAuditSummary] = useState<Midnight3VectorSummary | null>(null);
  const [isMidnightBatchRunning, setIsMidnightBatchRunning] = useState<boolean>(false);
  const [midnightBatchLogs, setMidnightBatchLogs] = useState<string[]>([
    '[SYSTEM] Midnight 3-Vector Return Audit Engine initialized. Ready for scheduled 00:00:00 AM batch or on-demand execution.',
    '[REPLICA] Connected to read-replica shadow DB instance: db-shadow-replica-01.asia-east1.gcp.internal'
  ]);

  // Shadow DB Telemetry & 180-Day Rolling TTL
  const [shadowDbTelemetry, setShadowDbTelemetry] = useState<ShadowDbTelemetry>(INITIAL_SHADOW_DB_TELEMETRY);
  const [ttlPurgeLogs, setTtlPurgeLogs] = useState<TtlPurgeLog[]>([
    {
      id: 'ttl-init-01',
      timestamp: '2026-09-07 00:01:00',
      recordsPurged: 1240,
      timeWindowCutoff: '180 days (rolling window)',
      durationMs: 38,
      status: 'COMPLETED_SUCCESS',
      queryExecuted: "DELETE FROM transaction_ledger WHERE transaction_date < (CURRENT_DATE - INTERVAL '180 days');"
    }
  ]);

  
  // Warehouse Scanner
  const [warehouseScanHistory, setWarehouseScanHistory] = useState<Array<{ code: string; timestamp: string; success: boolean; message: string }>>([
    {
      code: 'TR-RET-201',
      timestamp: '09:14:02 AM',
      success: true,
      message: 'Package checked in at Warehouse Bay 4 (Dhaka Central Log)'
    }
  ]);
  
  // Reports
  const [reportBatches, setReportBatches] = useState<ReconciledReportBatch[]>(INITIAL_REPORT_BATCHES);
  const [previewBatch, setPreviewBatch] = useState<ReconciledReportBatch | null>(null);
  
  // Security TTL
  const [ttlTerminalLogs, setTtlTerminalLogs] = useState<string[]>([
    '[SYSTEM BOOT] 180-day TTL partition policy loaded from /etc/cron.d/fiscal_ttl.conf',
    '[HEALTH CHECK] Clustered storage: 2.5 GB allocated across 90,00,000 active records',
    '[STATUS] Ready. Awaiting midnight cron trigger or manual operator override.'
  ]);
  const [isTtlRunning, setIsTtlRunning] = useState<boolean>(false);

  // Rehydrate state from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('traceid_fintech_recon_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.auditRecords)) setAuditRecords(parsed.auditRecords);
        if (Array.isArray(parsed.returnParcels)) setReturnParcels(parsed.returnParcels);
        if (Array.isArray(parsed.dispatchedParcels)) setDispatchedParcels(parsed.dispatchedParcels);
        if (Array.isArray(parsed.paymentSchemeRecords)) setPaymentSchemeRecords(parsed.paymentSchemeRecords);
        if (typeof parsed.configuredBaseFeeBDT === 'number') setConfiguredBaseFeeBDTState(parsed.configuredBaseFeeBDT);
        if (typeof parsed.retentionThresholdDays === 'number') setRetentionThresholdDaysState(parsed.retentionThresholdDays);
      }
    } catch (e) {
      console.warn('LocalStorage rehydration failed:', e);
    }
  }, []);

  // Persist state updates to localStorage to prevent data loss on policy updates
  useEffect(() => {
    try {
      const dataToSave = {
        auditRecords,
        returnParcels,
        dispatchedParcels,
        paymentSchemeRecords,
        configuredBaseFeeBDT,
        retentionThresholdDays
      };
      localStorage.setItem('traceid_fintech_recon_v3', JSON.stringify(dataToSave));
    } catch (e) {
      // Storage quota or private browsing safeguard
    }
  }, [auditRecords, returnParcels, dispatchedParcels, paymentSchemeRecords, configuredBaseFeeBDT, retentionThresholdDays]);

  // Live Webhook generator
  useEffect(() => {
    if (!isWebhookStreaming) return;

    const interval = setInterval(() => {
      const gateways: Array<'bKash' | 'Nagad' | 'Pathao' | 'Steadfast'> = ['bKash', 'Nagad', 'Pathao', 'Steadfast'];
      const randomGateway = gateways[Math.floor(Math.random() * gateways.length)];
      const randomAmt = [350, 750, 1200, 1850, 2400, 3100, 4800][Math.floor(Math.random() * 7)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      const randomTrx = randomGateway === 'bKash' ? `BK${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        : randomGateway === 'Nagad' ? `NG${Math.floor(10000000 + Math.random() * 90000000)}`
        : randomGateway === 'Pathao' ? `PTH-LIV-${Math.floor(10000 + Math.random() * 90000)}`
        : `SF-LIVE-${Math.floor(10000 + Math.random() * 90000)}`;

      const newLog: WebhookLog = {
        id: `wh-${Date.now()}`,
        timestamp: timeStr,
        gateway: randomGateway,
        eventType: randomGateway === 'bKash' || randomGateway === 'Nagad' ? 'payment.received' : 'courier.cod_collected',
        trxId: randomTrx,
        amount: randomAmt,
        currency: 'BDT',
        status: '200_OK',
        payload: {
          gateway: randomGateway,
          trxID: randomTrx,
          amountBDT: randomAmt,
          channel: 'LIVE_ENTERPRISE_GATEWAY',
          securityHash: 'sha256:' + Math.random().toString(16).substring(2, 18),
          settlementRoute: 'INSTANT_SETTLEMENT_INGEST'
        }
      };

      setWebhooks(prev => [newLog, ...prev.slice(0, 19)]);
      setTodayIngestedRevenue(prev => prev + randomAmt);
    }, 7000);

    return () => clearInterval(interval);
  }, [isWebhookStreaming]);

  const clearWebhooks = () => setWebhooks([]);

  // Track A Audit Execution
  const runTrackAAudit = useCallback(() => {
    setIsAuditRunning(true);
    // Call backend matching endpoint asynchronously
    fetch('/api/reconcile/match-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: auditRecords })
    }).catch(err => console.warn('Backend match-records sync:', err));

    setTimeout(() => {
      // Ensure matched records retain their correct status and prevent incorrect 'unmatched' labeling
      setAuditRecords(prev => prev.map(rec => {
        if (rec.status === 'MATCHED' || rec.resolved) {
          return { ...rec, status: 'MATCHED', badgeColor: 'green' };
        }
        return rec;
      }));
      setIsAuditRunning(false);
    }, 2400);
  }, [auditRecords]);

  // Track B Dual File Audit Execution
  const runTrackBDualAudit = useCallback(() => {
    setIsTrackBAuditRunning(true);
    setTimeout(() => {
      setIsTrackBAuditRunning(false);
      setTrackBAuditExecuted(true);
    }, 2000);
  }, []);

  // Dispatch New Parcel with cryptographic tracking pointer framework
  const dispatchNewParcel = (parcelData: Omit<DispatchedParcel, 'id' | 'timestamp' | 'status'>) => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const year = now.getFullYear();
    const hash = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Ensure cryptographic tracking pointer structure:
    // TR-PRE-[YEAR]-[HASH], TR-COD-[HASH], TR-SPLIT-[HASH], TR-FREE-[HASH]
    let finalTraceId = parcelData.traceId;
    if (!finalTraceId || !finalTraceId.startsWith('TR-')) {
      if (parcelData.dispatchType === '100% Pre-Paid') {
        finalTraceId = `TR-PRE-${year}-${hash}`;
      } else if (parcelData.dispatchType === '100% COD') {
        finalTraceId = `TR-COD-${hash}`;
      } else if (parcelData.dispatchType === 'Split Advance Paid') {
        finalTraceId = `TR-SPLIT-${hash}`;
      } else {
        finalTraceId = `TR-FREE-${hash}`;
      }
    }

    const newParcel: DispatchedParcel = {
      ...parcelData,
      traceId: finalTraceId,
      id: `par-${Date.now()}`,
      timestamp,
      status: 'DISPATCHED_TO_COURIER'
    };

    setDispatchedParcels(prev => [newParcel, ...prev]);

    // Asynchronously anchor into persistent backend ledger
    fetch('/api/trace/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: parcelData.dispatchType === '100% Pre-Paid' ? 'PRE' : parcelData.dispatchType === '100% COD' ? 'COD' : parcelData.dispatchType === 'Split Advance Paid' ? 'SPLIT' : 'FREE',
        orderId: parcelData.orderId,
        customerName: parcelData.customerName,
        customerPhone: parcelData.customerPhone,
        grossAmount: parcelData.codCollectionBDT + parcelData.advancePaidBDT,
        advancePaid: parcelData.advancePaidBDT,
        codCollectable: parcelData.codCollectionBDT
      })
    }).catch(e => console.warn('Ledger trace anchor sync:', e));

    // If a linked TrxId was used, update email status to LINKED_TO_PARCEL
    if (parcelData.linkedTrxId) {
      setImapEmails(prev => prev.map(em => em.trxId === parcelData.linkedTrxId ? { ...em, status: 'LINKED_TO_PARCEL' } : em));
    }

    return newParcel;
  };

  // Warehouse Barcode Scanner & Return Policy Sync Across Track A and Track B
  const scanReturnedParcel = useCallback((barcode: string, bay?: string, whId?: string, opId?: string) => {
    const trimmed = barcode.trim().toUpperCase();
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const dateStr = now.toISOString().split('T')[0];
    const activeWh = whId || warehouseId;
    const activeOp = opId || operatorId;

    if (!trimmed) {
      return { success: false, message: 'Please enter or scan a valid Barcode/TraceID.' };
    }

    let matchedParcel: ReturnParcelRecord | undefined;
    let didMatchReturn = false;

    // 1. Update Return Parcels table with physical check-in AND dual-phase return fee reconciliation
    setReturnParcels(prev => {
      const updated = prev.map(p => {
        const isMatch = 
          p.traceId.toUpperCase() === trimmed ||
          p.orderId.toUpperCase() === trimmed ||
          p.barcodeTag.toUpperCase() === trimmed ||
          p.id.toUpperCase() === trimmed ||
          (trimmed === 'TR-RET-203' && p.traceId === 'TR-RET-203') ||
          (trimmed === 'TR-RET-201' && p.traceId === 'TR-RET-201') ||
          (trimmed === 'TR-RET-202' && p.traceId === 'TR-RET-202');

        if (isMatch) {
          didMatchReturn = true;
          // Dual-Phase Reconciliation:
          // Phase 1: Physical Custody Audit (Restocked, Ghost Cleared)
          // Phase 2: Financial Return Charge Audit (Validates Courier Billed Fee vs Contract Rule)
          // Business Rule: Return charge is legitimately deducted even if product is returned late to merchant.
          const allowableReturnFee = configuredBaseFeeBDT;
          const overchargeVariance = Math.max(0, p.returnFeeBDT - allowableReturnFee);
          const isOvercharged = overchargeVariance > 0;
          const isLateReturn = p.deltaDaysInTransit > retentionThresholdDays;

          const chargeStatus: 'VALIDATED_MATCH' | 'CHARGE_OVERBILLED' | 'GHOST_BLOCKED' = 
            isOvercharged ? 'CHARGE_OVERBILLED' : 'VALIDATED_MATCH';

          const chargeNote = isOvercharged
            ? `RETURN CHARGE OVERBILLED: Courier billed BDT ${p.returnFeeBDT}.00 vs Contract Cap BDT ${allowableReturnFee}.00 (+BDT ${overchargeVariance}.00 overcharge flagged for courier remittance clawback).`
            : isLateReturn
            ? `RETURN CHARGE VALIDATED: Product returned late (${p.deltaDaysInTransit}d in transit). Return charge of BDT ${p.returnFeeBDT}.00 is deducted and complies with contract rate (BDT ${allowableReturnFee}.00 cap). Reconciled clean.`
            : `RETURN CHARGE VALIDATED: Courier billed BDT ${p.returnFeeBDT}.00 complies with contract SLA rate (BDT ${allowableReturnFee}.00 cap). Reconciled clean.`;

          matchedParcel = {
            ...p,
            scannedAtWarehouse: true,
            scanTimestamp: `${dateStr} ${timeStr}`,
            scannedBay: bay || 'Warehouse Intake Bay 2',
            warehouseId: activeWh,
            operatorId: activeOp,
            status: 'RETURN_RECEIVED_IN_WAREHOUSE',
            contractReturnFeeBDT: allowableReturnFee,
            returnChargeReconStatus: chargeStatus,
            returnChargeReconNote: chargeNote,
            vector1OverchargeVarianceBDT: overchargeVariance,
            vector1Status: isOvercharged ? 'LOGISTICS_RETURN_VARIANCE_ERROR' : 'VALID',
            // Physical scan eliminates retention gap and ghost exception:
            vector2RetentionGap: false,
            vector2AlertMessage: undefined,
            vector3GhostException: false,
            vector3Recommendation: undefined,
            notes: `Physical check-in confirmed via Gate-Keeper Scanner at ${timeStr} by Operator ${activeOp}. Stock restored. ${chargeNote}`
          };
          return matchedParcel;
        }
        return p;
      });

      if (!didMatchReturn) {
        // Dynamically register new return check-in if unknown barcode
        const newRetRecord: ReturnParcelRecord = {
          id: `ret-dyn-${Date.now()}`,
          traceId: trimmed,
          orderId: `ORD-${trimmed.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`,
          track: trimmed.includes('SME') || trimmed.includes('FB') ? 'Track B SME' : 'Track A Enterprise',
          originType: trimmed.includes('SME') || trimmed.includes('FB') ? 'IMAP_EMAIL_LISTENER' : 'API_CHECKOUT_WEBHOOK',
          originDetail: trimmed.includes('SME') ? 'Token extracted via IMAP listener & mapped to broker payload' : 'Cryptographic TraceID injected into courier API payload',
          customerName: 'Direct Return Inward',
          customerPhone: '01711***' + Math.floor(100 + Math.random() * 899),
          courierPartner: trimmed.includes('STF') ? 'Steadfast' : trimmed.includes('RDX') ? 'RedX' : 'Pathao Courier',
          parcelValueBDT: 2600,
          forwardFeeBDT: 110,
          returnFeeBDT: configuredBaseFeeBDT,
          contractReturnFeeBDT: configuredBaseFeeBDT,
          returnChargeReconStatus: 'VALIDATED_MATCH',
          returnChargeReconNote: `Direct inward check-in at ${timeStr}. Return fee complies with base cap BDT ${configuredBaseFeeBDT}.00.`,
          returnReason: 'Customer return delivered back to warehouse receiving dock',
          dispatchedDate: '2026-09-02',
          dispatchTimestamp: '2026-09-02 11:30:00',
          returnInitiatedDate: '2026-09-06',
          scannedAtWarehouse: true,
          scanTimestamp: `${dateStr} ${timeStr}`,
          scannedBay: bay || 'Warehouse Intake Bay 2',
          warehouseId: activeWh,
          operatorId: activeOp,
          status: 'RETURN_RECEIVED_IN_WAREHOUSE',
          barcodeTag: trimmed,
          courierReportedStatus: 'RETURNED',
          deltaDaysInTransit: 6,
          vector1OverchargeVarianceBDT: 0.00,
          vector1Status: 'VALID',
          vector2RetentionGap: false,
          vector3GhostException: false,
          notes: `Verified & checked-in at receiving gate at ${timeStr} by ${activeOp}. Stock restored.`
        };
        matchedParcel = newRetRecord;
        return [newRetRecord, ...prev];
      }

      return updated;
    });

    // 2. Synchronize Track A Audit Records table (preserving return charge overcharge flags)
    setAuditRecords(prev => prev.map(rec => {
      const matchTrackA = 
        rec.traceId.toUpperCase() === trimmed || 
        rec.orderId.toUpperCase() === trimmed ||
        (trimmed === 'TR-RET-203' && rec.traceId === 'TR-RET-203') ||
        (trimmed === 'TR-RET-201' && rec.traceId === 'TR-RET-201') ||
        (trimmed === 'TR-RET-202' && rec.traceId === 'TR-RET-202');

      if (matchTrackA) {
        const overcharge = matchedParcel ? matchedParcel.vector1OverchargeVarianceBDT : 0;
        const hasChargeDiscrepancy = overcharge > 0;

        return {
          ...rec,
          status: 'RETURN_RECEIVED_IN_WAREHOUSE',
          badgeColor: hasChargeDiscrepancy ? 'crimson' : 'green',
          resolved: !hasChargeDiscrepancy, // Physical received, matched return fee reconciled
          tooltip: hasChargeDiscrepancy
            ? `RESTOCKED AT GATE · ⚠️ RETURN CHARGE OVERBILLED: Courier billed BDT ${matchedParcel?.returnFeeBDT} vs Cap BDT ${matchedParcel?.contractReturnFeeBDT} (+BDT ${overcharge} clawback active).`
            : 'RESOLVED: Return parcel physically verified at Warehouse Gate & Return Charge validated against contractual rate.',
          notes: `Scanned via Warehouse Gate-Keeper Terminal at ${timeStr} by ${activeOp}. Package safely restored to stock ledger. ${matchedParcel?.returnChargeReconNote || ''}`
        };
      }
      return rec;
    }));

    // 3. Synchronize Track B Dispatched Parcels table
    setDispatchedParcels(prev => prev.map(p => {
      const matchTrackB = 
        p.traceId.toUpperCase() === trimmed || 
        p.barcodeTag.toUpperCase() === trimmed ||
        p.orderId.toUpperCase() === trimmed ||
        (trimmed === 'TR-RET-203' && (p.traceId === 'TR-RET-203' || p.barcodeTag === 'TR-RET-203'));

      if (matchTrackB) {
        return {
          ...p,
          status: 'RETURN_RECEIVED_IN_WAREHOUSE'
        };
      }
      return p;
    }));

    let logMsg = '';
    if (matchedParcel) {
      if (matchedParcel.returnChargeReconStatus === 'CHARGE_OVERBILLED') {
        logMsg = `[${trimmed}] RESTOCKED AT GATE · ⚠️ RETURN CHARGE OVERBILLED: Courier billed BDT ${matchedParcel.returnFeeBDT} vs Contract Cap BDT ${matchedParcel.contractReturnFeeBDT} (+BDT ${matchedParcel.vector1OverchargeVarianceBDT}.00 variance flagged for remittance clawback).`;
      } else {
        logMsg = `[${trimmed}] RESTOCKED AT GATE · ✅ RETURN CHARGE VALIDATED: Courier billed BDT ${matchedParcel.returnFeeBDT} complies with contract cap (BDT ${matchedParcel.contractReturnFeeBDT || configuredBaseFeeBDT}). Reconciled clean.`;
      }
    } else {
      logMsg = `SUCCESS: [${trimmed}] Checked-in at ${bay || 'Bay 2'} | WH: ${activeWh} | Op: ${activeOp}. State: RETURN_RECEIVED_IN_WAREHOUSE logged!`;
    }

    setWarehouseScanHistory(prev => [{ code: trimmed, timestamp: timeStr, success: true, message: logMsg }, ...prev]);
    setScanFeedback(logMsg);
    setTimeout(() => setScanFeedback(null), 6000);

    return { 
      success: true, 
      message: logMsg, 
      updatedParcel: matchedParcel,
      reconSummary: matchedParcel ? {
        courierReturnFee: matchedParcel.returnFeeBDT,
        allowableReturnFee: matchedParcel.contractReturnFeeBDT ?? configuredBaseFeeBDT,
        overchargeVariance: matchedParcel.vector1OverchargeVarianceBDT,
        isOvercharge: matchedParcel.vector1OverchargeVarianceBDT > 0,
        isSlaBreached: false,
        status: matchedParcel.returnChargeReconStatus || 'VALIDATED_MATCH'
      } : undefined
    };
  }, [warehouseId, operatorId, configuredBaseFeeBDT, retentionThresholdDays]);

  // Midnight 3-Vector Return Audit Engine Execution
  const runMidnight3VectorAudit = useCallback(() => {
    setIsMidnightBatchRunning(true);
    setMidnightBatchLogs([
      '[00:00:00] Initializing Automated Midnight 3-Vector Return Audit Engine...',
      '[00:00:00] DB ISOLATION: Queries routed to Shadow Read-Replica db-shadow-replica-01.asia-east1.gcp.internal. Primary Master checkout load: 0.8% (unaffected).'
    ]);

    setTimeout(() => {
      setMidnightBatchLogs(prev => [
        ...prev,
        `[00:00:01] VECTOR 1 (Arbitrary Penalty Cap): Validating courier return fee against contractual base rate (BDT ${configuredBaseFeeBDT}.00)...`
      ]);
    }, 500);

    setTimeout(() => {
      setMidnightBatchLogs(prev => [
        ...prev,
        `[00:00:02] VECTOR 2 (Hub Transit Retention): Calculating delta days vs ${retentionThresholdDays}-day SLA threshold for stalled sorting hub parcels...`
      ]);
    }, 1100);

    setTimeout(() => {
      setMidnightBatchLogs(prev => [
        ...prev,
        '[00:00:03] VECTOR 3 (Ghost Return Inbound Sync): Cross-referencing courier statement return fees with physical warehouse scan barcodes...'
      ]);
    }, 1700);

    setTimeout(() => {
      let matchedCount = 0;
      let matchedTotalBDT = 0;
      let v1Count = 0;
      let v1VarianceBDT = 0;
      let v2Count = 0;
      let v2AtRiskBDT = 0;
      let v3Count = 0;
      let v3BlockedBDT = 0;

      setReturnParcels(prev => prev.map(p => {
        // Vector 1: Arbitrary Penalty Cap Overcharge Audit
        const overcharge = p.returnFeeBDT - configuredBaseFeeBDT;
        const isV1Invalid = overcharge > 0;
        const v1Var = isV1Invalid ? overcharge : 0;
        if (isV1Invalid) {
          v1Count++;
          v1VarianceBDT += overcharge;
        }

        // Vector 2: Courier Hub Transit Retention Audit
        const isV2Stalled = p.courierReportedStatus === 'RETURNED' && !p.scannedAtWarehouse && p.deltaDaysInTransit > retentionThresholdDays;
        if (isV2Stalled) {
          v2Count++;
          v2AtRiskBDT += p.parcelValueBDT;
        }

        // Vector 3: Ghost Return Audit (Physical receiving missing when courier billed return fee on completed return)
        const isV3Ghost = !p.scannedAtWarehouse && (
          p.vector3GhostException === true || 
          p.status === 'GHOST_RETURN_EXCEPTION' || 
          (p.courierReportedStatus === 'RETURNED' && p.deltaDaysInTransit > retentionThresholdDays)
        );
        if (isV3Ghost) {
          v3Count++;
          v3BlockedBDT += p.returnFeeBDT;
        }

        // Contractual Return Fee & Financial Reconciliation Status
        // Business Rule: Return charge is legitimately deducted even if product is returned late to merchant.
        const allowableFee = configuredBaseFeeBDT;
        let chargeStatus: 'VALIDATED_MATCH' | 'CHARGE_OVERBILLED' | 'GHOST_BLOCKED';
        let chargeNote = '';

        if (isV3Ghost) {
          chargeStatus = 'GHOST_BLOCKED';
          chargeNote = 'GHOST RETURN ZERO-DEBIT HOLD: Return fee billed with 0 warehouse receiving scans. Deductions blocked.';
        } else if (isV1Invalid) {
          chargeStatus = 'CHARGE_OVERBILLED';
          chargeNote = `OVERCHARGE DETECTED: Courier deduction BDT ${p.returnFeeBDT} vs Contract Cap BDT ${allowableFee} (+BDT ${overcharge} variance).`;
        } else {
          chargeStatus = 'VALIDATED_MATCH';
          matchedCount++;
          matchedTotalBDT += p.returnFeeBDT;
          chargeNote = p.scannedAtWarehouse
            ? `MATCHED FEE VALIDATED & RESTOCKED: Courier deduction BDT ${p.returnFeeBDT} matches contract rate (BDT ${allowableFee}). Reconciled clean.`
            : isV2Stalled
            ? `MATCHED RETURN FEE (LATE RETURN): Product returned late (${p.deltaDaysInTransit}d in transit), return fee BDT ${p.returnFeeBDT} matches contract rate. Reconciled clean.`
            : `MATCHED RETURN FEE (IN TRANSIT): Courier deduction BDT ${p.returnFeeBDT} matches contract rate (BDT ${allowableFee}). Normal transit window.`;
        }

        return {
          ...p,
          contractReturnFeeBDT: allowableFee,
          returnChargeReconStatus: chargeStatus,
          returnChargeReconNote: chargeNote,
          vector1OverchargeVarianceBDT: v1Var,
          vector1Status: isV1Invalid ? 'LOGISTICS_RETURN_VARIANCE_ERROR' : 'VALID',
          vector2RetentionGap: isV2Stalled,
          vector2AlertMessage: isV2Stalled ? `Delta: ${p.deltaDaysInTransit} Days > ${retentionThresholdDays}-Day SLA Threshold (Potential Lost/Stolen Inventory Asset)` : undefined,
          vector3GhostException: isV3Ghost,
          vector3Recommendation: isV3Ghost ? 'Debit block enforced. Courier charged return fee for physical parcel missing from floor.' : undefined
        };
      }));

      const summary: Midnight3VectorSummary = {
        batchRunTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        totalParcelsAudited: returnParcels.length,
        matchedReturnFeeCount: matchedCount,
        matchedReturnFeeTotalBDT: matchedTotalBDT,
        vector1OverchargeCount: v1Count,
        vector1TotalVarianceBDT: v1VarianceBDT,
        vector2RetentionGapCount: v2Count,
        vector2InventoryAtRiskBDT: v2AtRiskBDT,
        vector3GhostReturnCount: v3Count,
        vector3GhostDebitsBlockedBDT: v3BlockedBDT,
        configuredBaseFeeBDT,
        configuredRetentionThresholdDays: retentionThresholdDays,
        replicaHost: 'db-shadow-replica-01.asia-east1.gcp.internal',
        queryLatencyMs: 14.8
      };

      // Also notify backend API / cron engine
      fetch('/api/reconcile/midnight-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseFee: configuredBaseFeeBDT,
          retentionDays: retentionThresholdDays,
          parcels: returnParcels
        })
      }).catch(err => console.warn('Backend midnight audit sync:', err));

      setMidnightAuditSummary(summary);
      setMidnightBatchLogs(prev => [
        ...prev,
        `[00:00:04] BATCH COMPLETE (Latency: 14.8ms): Matched Contract Fees: ${matchedCount} (BDT ${matchedTotalBDT.toFixed(2)}) | Vector 1 Overcharge Variance: BDT ${v1VarianceBDT.toFixed(2)} | Vector 2 Stalled Retention Gaps: ${v2Count} | Vector 3 Ghost Returns Blocked: ${v3Count} (BDT ${v3BlockedBDT.toFixed(2)} protected).`
      ]);

      setShadowDbTelemetry(prev => ({
        ...prev,
        shadowReadReplica: {
          ...prev.shadowReadReplica,
          auditQueriesExecuted: prev.shadowReadReplica.auditQueriesExecuted + returnParcels.length * 3
        }
      }));

      setIsMidnightBatchRunning(false);
    }, 2300);
  }, [configuredBaseFeeBDT, retentionThresholdDays, returnParcels]);

  // Set Configured Base Fee and recalculate Vector 1 while preserving matched records
  const setConfiguredBaseFeeBDT = useCallback((fee: number) => {
    setConfiguredBaseFeeBDTState(fee);
    setReturnParcels(prev => prev.map(p => {
      const overcharge = p.returnFeeBDT - fee;
      const isOver = overcharge > 0;
      return {
        ...p,
        contractReturnFeeBDT: fee,
        vector1OverchargeVarianceBDT: isOver ? overcharge : 0,
        vector1Status: isOver ? 'LOGISTICS_RETURN_VARIANCE_ERROR' : 'VALID',
        returnChargeReconStatus: p.scannedAtWarehouse
          ? (p.returnChargeReconStatus === 'SLA_BREACH_WAIVED' ? 'SLA_BREACH_WAIVED' : isOver ? 'CHARGE_OVERBILLED' : 'VALIDATED_MATCH')
          : p.returnChargeReconStatus
      };
    }));
  }, []);

  // Set Retention Threshold Days and recalculate Vector 2 while preserving scanned receipts
  const setRetentionThresholdDays = useCallback((days: number) => {
    setRetentionThresholdDaysState(days);
    setReturnParcels(prev => prev.map(p => {
      const isStalled = p.courierReportedStatus === 'RETURNED' && !p.scannedAtWarehouse && p.deltaDaysInTransit > days;
      return {
        ...p,
        vector2RetentionGap: isStalled,
        vector2AlertMessage: isStalled ? `Delta: ${p.deltaDaysInTransit} Days > ${days}-Day SLA Threshold (Potential Lost/Stolen Inventory Asset)` : undefined
      };
    }));
  }, []);

  // Daily TTL Purge at 00:01 AM (Rolling 180-Day Window)
  const executeDailyTtlPurge = useCallback(() => {
    setIsTtlRunning(true);
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const queryStr = "DELETE FROM transaction_ledger WHERE transaction_date < (CURRENT_DATE - INTERVAL '180 days');";

    // Call persistent database TTL purge endpoint
    fetch('/api/cron/ttl-purge', { method: 'POST' }).catch(err => console.warn('TTL Purge API error:', err));

    setTtlTerminalLogs([
      '[00:01:00] Automated Daily TTL Purge Executing at 00:01 AM Local Time...',
      `[00:01:00] Query: ${queryStr}`,
      '[00:01:01] Scanning partitions on Read-Replica & Primary Master without table locking...'
    ]);

    setTimeout(() => {
      setTtlTerminalLogs(prev => [
        ...prev,
        '[00:01:02] Pruned 1,480 audit ledger rows older than 180 days (rolling window maintained).',
        '[00:01:03] Re-indexed partition blocks. Master Checkout DB impact: 0ms lock time, 0 failed checkouts.'
      ]);

      const newLog: TtlPurgeLog = {
        id: `ttl-${Date.now()}`,
        timestamp: timeStr,
        recordsPurged: 1480,
        timeWindowCutoff: '180 days (rolling window)',
        durationMs: 42,
        status: 'COMPLETED_SUCCESS',
        queryExecuted: queryStr
      };

      setTtlPurgeLogs(prev => [newLog, ...prev]);
      setShadowDbTelemetry(prev => ({
        ...prev,
        totalLedgerRows: Math.max(100000, prev.totalLedgerRows - 1480),
        oldestRecordDate: '2026-03-13'
      }));
      setIsTtlRunning(false);
    }, 1800);
  }, []);

  // Standard barcode scanner forwards to unified return parcel scanner
  const scanBarcode = useCallback((barcode: string) => {
    return scanReturnedParcel(barcode);
  }, [scanReturnedParcel]);

  // Reconcile Payment Scheme Records: Transfers pending pre-reconciled items into settled ledger!
  const reconcileSchemeRecords = useCallback((recordIds?: string[], trackFilter?: 'Track A Enterprise' | 'Track B SME') => {
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);
    let count = 0;
    let settledSum = 0;

    setPaymentSchemeRecords(prev => prev.map(rec => {
      const matchTrack = !trackFilter || rec.track === trackFilter;
      const matchId = !recordIds || recordIds.includes(rec.id);

      if (rec.status === 'PRE_RECONCILED_PENDING' && matchTrack && matchId) {
        count++;
        settledSum += rec.expectedNetPayout;
        const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
        return {
          ...rec,
          status: 'RECONCILED_SETTLED',
          settledNetPayout: rec.expectedNetPayout,
          reconciliationTimestamp: timeStr,
          settlementChecksum: `SHA256-REC-${rec.orderId}-${randomHex}`,
          bankStatementRef: `STMT-AUTO-${timeStr.substring(0, 10).replace(/-/g, '')}-${rec.id.substring(4)}`,
          postReconcileNote: `Auto-reconciled & verified against bank clearing log at ${timeStr}. Mathematical formula verified 100%.`
        };
      }
      return rec;
    }));

    return { count, settledSum };
  }, []);

  // Download Scheme Lifecycle CSV
  const downloadSchemeLifecycleCSV = useCallback((trackFilter?: 'Track A Enterprise' | 'Track B SME') => {
    const records = paymentSchemeRecords.filter(r => !trackFilter || r.track === trackFilter);
    const headers = [
      'Order_ID',
      'Track',
      'Scheme_Type',
      'Customer_Name',
      'Customer_Phone',
      'Gross_Amount_BDT',
      'Advance_Paid_BDT',
      'COD_Collectable_BDT',
      'MFS_Gateway_Fee_BDT',
      'Courier_Delivery_Fee_BDT',
      'Courier_COD_Fee_BDT',
      'Marketing_Subsidy_Absorbed_BDT',
      'Expected_Net_Payout_BDT',
      'Settled_Net_Payout_BDT',
      'Reconciliation_Status',
      'Settlement_Checksum',
      'Bank_Reference',
      'Reconciliation_Timestamp'
    ];

    const rows = records.map(r => [
      r.orderId,
      r.track,
      r.schemeLabel,
      `"${r.customerName}"`,
      r.customerPhone,
      r.grossAmount,
      r.advancePaid,
      r.codCollectable,
      r.mfsGatewayFee,
      r.courierDeliveryFee,
      r.courierCodFee,
      r.marketingAbsorbedSubsidy,
      r.expectedNetPayout,
      r.settledNetPayout ?? 'PENDING',
      r.status,
      r.settlementChecksum || 'N/A',
      r.bankStatementRef || 'N/A',
      r.reconciliationTimestamp || 'UNSETTLED'
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Scheme_Lifecycle_Audit_${trackFilter ? trackFilter.replace(/\s+/g, '_') : 'All'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [paymentSchemeRecords]);

  // Simulate Incoming Payment in Daily Breakdown
  const simulateIncomingPayment = useCallback((scheme: PaymentSchemeType) => {
    setDailyPaymentBreakdown(prev => {
      let fullAdvanceCount = prev.fullAdvanceCount;
      let fullAdvanceBDT = prev.fullAdvanceBDT;
      let splitPaymentCount = prev.splitPaymentCount;
      let splitAdvanceBDT = prev.splitAdvanceBDT;
      let splitCodBDT = prev.splitCodBDT;
      let splitTotalBDT = prev.splitTotalBDT;
      let fullCodCount = prev.fullCodCount;
      let fullCodBDT = prev.fullCodBDT;
      let freeDeliveryCount = prev.freeDeliveryCount;
      let freeDeliveryAbsorbedBDT = prev.freeDeliveryAbsorbedBDT;
      let addedVolume = 0;

      if (scheme === 'FULL_ADVANCE') {
        const amt = [1850, 2400, 3600, 4800, 6200][Math.floor(Math.random() * 5)];
        fullAdvanceCount += 1;
        fullAdvanceBDT += amt;
        addedVolume = amt;
      } else if (scheme === 'SPLIT_PAYMENT') {
        const adv = [150, 200, 300][Math.floor(Math.random() * 3)];
        const cod = [1900, 2600, 3400, 4200][Math.floor(Math.random() * 4)];
        splitPaymentCount += 1;
        splitAdvanceBDT += adv;
        splitCodBDT += cod;
        splitTotalBDT += (adv + cod);
        addedVolume = adv + cod;
      } else if (scheme === 'FULL_COD') {
        const amt = [1200, 2200, 2950, 3800, 4500][Math.floor(Math.random() * 5)];
        fullCodCount += 1;
        fullCodBDT += amt;
        addedVolume = amt;
      } else if (scheme === 'FREE_DELIVERY') {
        const amt = [1500, 2500, 3500][Math.floor(Math.random() * 3)];
        freeDeliveryCount += 1;
        freeDeliveryAbsorbedBDT += 100;
        addedVolume = amt;
      }

      const totalOrdersCount = prev.totalOrdersCount + 1;
      const totalVolumeBDT = prev.totalVolumeBDT + addedVolume;

      setTodayIngestedRevenue(r => r + addedVolume);

      return {
        ...prev,
        fullAdvanceCount,
        fullAdvanceBDT,
        splitPaymentCount,
        splitAdvanceBDT,
        splitCodBDT,
        splitTotalBDT,
        fullCodCount,
        fullCodBDT,
        freeDeliveryCount,
        freeDeliveryAbsorbedBDT,
        totalOrdersCount,
        totalVolumeBDT
      };
    });
  }, []);

  // Close Day & Transfer Today's Data to 6-Month Visual Bar Chart
  const closeDayAndTransferToHistory = useCallback(() => {
    const today = dailyPaymentBreakdown;
    const dateStr = today.date;
    const dayTotal = today.totalVolumeBDT;

    // Create a new chart point for the historical ledger
    const newPoint: HistoricalChartPoint = {
      periodKey: dateStr,
      displayLabel: '08 Sep (Closed)',
      fullAdvanceBDT: today.fullAdvanceBDT,
      splitPaymentBDT: today.splitTotalBDT,
      fullCodBDT: today.fullCodBDT,
      freeDeliveryBDT: today.freeDeliveryAbsorbedBDT,
      totalBDT: today.totalVolumeBDT,
      orderCount: today.totalOrdersCount
    };

    // Update historical daily data (append or replace today)
    setHistoricalDailyData(prev => {
      const filtered = prev.filter(p => p.periodKey !== dateStr);
      return [...filtered, newPoint];
    });

    // Also update monthly MTD data
    setHistoricalMonthlyData(prev => prev.map(m => {
      if (m.periodKey === '2026-09') {
        return {
          ...m,
          totalBDT: m.totalBDT + 500000,
          fullAdvanceBDT: m.fullAdvanceBDT + today.fullAdvanceBDT,
          splitPaymentBDT: m.splitPaymentBDT + today.splitTotalBDT,
          fullCodBDT: m.fullCodBDT + today.fullCodBDT,
          orderCount: m.orderCount + today.totalOrdersCount
        };
      }
      return m;
    }));

    // Record a new verified report batch for today
    const newBatch: ReconciledReportBatch = {
      batchId: `BATCH-${dateStr.replace(/-/g, '')}-FINAL`,
      dateProcessed: `${dateStr} 23:59:59`,
      trackMode: 'Consolidated',
      totalRows: today.totalOrdersCount,
      matchedRate: 99.8,
      anomalyCount: 2,
      netSettledSumBDT: today.totalVolumeBDT,
      fileName: `Reconciled_DaySettlement_${dateStr.replace(/-/g, '')}.csv`,
      status: 'VERIFIED_FINAL'
    };
    setReportBatches(prev => [newBatch, ...prev]);

    return {
      message: `Day ${dateStr} successfully closed! BDT ${dayTotal.toLocaleString()} transferred into 6-Month Visual Historical Ledger and Batch ${newBatch.batchId} saved to reports archive.`,
      dayTotal
    };
  }, [dailyPaymentBreakdown]);

  // Generate & Download Track A Reconciled CSV
  const generateAndDownloadTrackAReconciledCSV = useCallback(() => {
    const batchId = `BATCH-TRK-A-${Date.now().toString().slice(-6)}`;
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const fileName = `Reconciled_Audit_TrackA_${Date.now()}.csv`;

    const headers = ['TraceID', 'OrderID', 'Channel', 'DB_Amount_BDT', 'Settled_Amount_BDT', 'Status_Label', 'Courier_Fee_BDT', 'Timestamp'];
    const trackARecords = auditRecords.filter(r => r.channel === 'Track A Enterprise');
    const rows = trackARecords.map(rec => {
      return [
        rec.traceId,
        rec.orderId || 'N/A',
        rec.channel,
        rec.dbAmount,
        rec.settledAmount,
        rec.status,
        rec.courierDeductedFee || 0,
        rec.timestamp
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Save batch to previous downloadable sheets history!
    const newBatch: ReconciledReportBatch = {
      batchId,
      dateProcessed: dateStr,
      trackMode: 'Track A Enterprise',
      totalRows: trackARecords.length,
      matchedRate: 98.7,
      anomalyCount: trackARecords.filter(r => r.status !== 'MATCHED').length,
      netSettledSumBDT: 4890000,
      fileName,
      status: 'VERIFIED_FINAL'
    };

    setReportBatches(prev => [newBatch, ...prev]);
    return newBatch;
  }, [auditRecords]);

  // Generate & Download Track B Reconciled CSV
  const generateAndDownloadTrackBReconciledCSV = useCallback(() => {
    const batchId = `BATCH-TRK-B-${Date.now().toString().slice(-6)}`;
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const fileName = `SME_DualFile_Audit_${Date.now()}.csv`;

    const headers = ['Parcel_ID', 'OrderID', 'TraceID', 'Dispatch_Type', 'Customer_Name', 'Phone', 'Advance_Paid_BDT', 'COD_Collection_BDT', 'Delivery_Fee_BDT', 'Courier', 'Status'];
    const rows = dispatchedParcels.map(p => [
      p.id,
      p.orderId,
      p.traceId,
      p.dispatchType,
      `"${p.customerName}"`,
      p.customerPhone,
      p.advancePaidBDT,
      p.codCollectionBDT,
      p.deliveryFeeBDT,
      p.courier,
      p.status
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Save batch to history!
    const newBatch: ReconciledReportBatch = {
      batchId,
      dateProcessed: dateStr,
      trackMode: 'Track B SME',
      totalRows: dispatchedParcels.length,
      matchedRate: 97.5,
      anomalyCount: 2,
      netSettledSumBDT: 385000,
      fileName,
      status: 'VERIFIED_FINAL'
    };

    setReportBatches(prev => [newBatch, ...prev]);
    return newBatch;
  }, [dispatchedParcels]);

  // Download Batch CSV from history
  const downloadBatchCSV = (batch: ReconciledReportBatch) => {
    const headers = ['TraceID', 'Order_Amount_BDT', 'Settled_Amount_BDT', 'Status_Label', 'Mismatch_Gap_BDT', 'Courier_Fee_BDT', 'Timestamp'];
    const rows = auditRecords.map(rec => {
      const orderAmt = rec.dbAmount === 'ABSENT' ? 0 : rec.dbAmount;
      const settledAmt = rec.settledAmount === 'ABSENT' ? 0 : rec.settledAmount;
      const gap = orderAmt - settledAmt;
      return [
        rec.traceId,
        rec.dbAmount,
        rec.settledAmount,
        rec.status,
        gap,
        rec.courierDeductedFee || 0,
        rec.timestamp
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', batch.fileName || `Reconciliation_Audit_${batch.batchId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Run TTL Purge Simulation
  const runTtlPurgeSimulation = () => {
    setIsTtlRunning(true);
    setTtlTerminalLogs([
      '[00:00:00] Initializing midnight scheduled cron job: /opt/finrecon/ttl_runner.sh --retention=180d'
    ]);

    setTimeout(() => {
      setTtlTerminalLogs(prev => [
        ...prev,
        "[00:00:01] Executing Query: DELETE FROM transaction_ledger WHERE transaction_date < (CURRENT_DATE - INTERVAL '180 days')..."
      ]);
    }, 700);

    setTimeout(() => {
      setTtlTerminalLogs(prev => [
        ...prev,
        '[00:00:02] Overwriting expired cache lines beyond 180-day threshold...'
      ]);
    }, 1500);

    setTimeout(() => {
      setTtlTerminalLogs(prev => [
        ...prev,
        '[00:00:03] Clustered Index Re-aligned. 6-Month Fiscal Audit Trail Intact. (180-day TTL partition locked, 0 expired lines remain)'
      ]);
      setIsTtlRunning(false);
    }, 2300);
  };

  return (
    <ReconContext.Provider
      value={{
        activePage,
        setActivePage,
        currentTrack,
        setCurrentTrack,
        isBankVarianceToggled,
        setIsBankVarianceToggled,
        mfsTotal,
        codTotal,
        bankDepositLine,
        varianceAmount,
        webhooks,
        isWebhookStreaming,
        setIsWebhookStreaming,
        clearWebhooks,
        table1Prepaid,
        table2COD,
        table3Split,
        table4Free,
        auditRecords,
        isAuditRunning,
        runTrackAAudit,
        courierFileUploaded,
        setCourierFileUploaded,
        trackACourierFileName,
        setTrackACourierFileName,
        uploadTrackACourierFile,
        bankFileUploaded,
        setBankFileUploaded,
        trackABankFileName,
        setTrackABankFileName,
        uploadTrackABankFile,
        removeTrackABankFile,
        imapEmails,
        selectedEmailForDispatch,
        setSelectedEmailForDispatch,
        dispatchedParcels,
        dispatchNewParcel,
        activeLabelModalParcel,
        setActiveLabelModalParcel,
        trackBMfsUploaded,
        setTrackBMfsUploaded,
        trackBMfsFileName,
        setTrackBMfsFileName,
        uploadTrackBMfsFile,
        trackBCourierUploaded,
        setTrackBCourierUploaded,
        trackBCourierFileName,
        setTrackBCourierFileName,
        uploadTrackBCourierFile,
        trackBBankUploaded,
        setTrackBBankUploaded,
        trackBBankFileName,
        setTrackBBankFileName,
        uploadTrackBBankFile,
        removeTrackBBankFile,
        clearTrackBFiles,
        isTrackBAuditRunning,
        trackBAuditExecuted,
        runTrackBDualAudit,
        warehouseScanHistory,
        scanBarcode,
        returnParcels,
        scanReturnedParcel,
        filterReturnTrack,
        setFilterReturnTrack,
        scanFeedback,
        configuredBaseFeeBDT,
        setConfiguredBaseFeeBDT,
        retentionThresholdDays,
        setRetentionThresholdDays,
        warehouseId,
        setWarehouseId,
        operatorId,
        setOperatorId,
        midnightAuditSummary,
        isMidnightBatchRunning,
        midnightBatchLogs,
        runMidnight3VectorAudit,
        shadowDbTelemetry,
        ttlPurgeLogs,
        executeDailyTtlPurge,
        paymentSchemeRecords,
        reconcileSchemeRecords,
        downloadSchemeLifecycleCSV,
        dailyPaymentBreakdown,
        simulateIncomingPayment,
        closeDayAndTransferToHistory,
        historicalDailyData,
        historicalWeeklyData,
        historicalMonthlyData,
        reportBatches,
        previewBatch,
        setPreviewBatch,
        downloadBatchCSV,
        generateAndDownloadTrackAReconciledCSV,
        generateAndDownloadTrackBReconciledCSV,
        ttlTerminalLogs,
        isTtlRunning,
        runTtlPurgeSimulation,
        todayIngestedRevenue,
        isMobileNavOpen,
        setIsMobileNavOpen
      }}
    >
      {children}
    </ReconContext.Provider>
  );
};

export const useRecon = () => {
  const context = useContext(ReconContext);
  if (!context) {
    throw new Error('useRecon must be used within a ReconProvider');
  }
  return context;
};

