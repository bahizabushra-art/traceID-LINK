import {
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
  DailyPaymentBreakdown,
  HistoricalChartPoint,
  ReturnParcelRecord,
  ShadowDbTelemetry
} from '../types';

export function formatBDT(val: number | 'ABSENT'): string {
  if (val === 'ABSENT' || typeof val !== 'number') return 'ABSENT';
  // South Asian Numbering System (e.g., 35,00,000)
  const isNegative = val < 0;
  const absVal = Math.abs(Math.round(val)).toString();
  
  if (absVal.length <= 3) {
    return (isNegative ? '- BDT ' : 'BDT ') + absVal;
  }
  
  const lastThree = absVal.substring(absVal.length - 3);
  const otherNumbers = absVal.substring(0, absVal.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  
  return `${isNegative ? '- BDT ' : 'BDT '}${formattedOther},${lastThree}`;
}

export const INITIAL_WEBHOOKS: WebhookLog[] = [
  {
    id: 'wh-01',
    timestamp: '15:42:19.402',
    gateway: 'bKash',
    eventType: 'payment.execute.success',
    trxId: 'BLM9A2K4X7',
    amount: 1200,
    currency: 'BDT',
    status: '200_OK',
    payload: {
      paymentID: 'TR0011H71672',
      trxID: 'BLM9A2K4X7',
      transactionStatus: 'Completed',
      amount: '1200.00',
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: 'INV-2026-9941',
      customerMsisdn: '01711***892',
      payerReference: 'REF-DHAKA-901'
    }
  },
  {
    id: 'wh-02',
    timestamp: '15:42:12.881',
    gateway: 'Pathao',
    eventType: 'order.status_updated',
    trxId: 'PTH-DEL-88902',
    amount: 2500,
    currency: 'BDT',
    status: 'VERIFIED',
    payload: {
      consignment_id: 'PTH-88902-DX',
      merchant_order_id: 'ORD-COD-8921',
      order_status: 'Delivered',
      collected_amount: 2500,
      delivery_fee: 120,
      cod_charge_percentage: 1.0,
      net_payable: 2355
    }
  },
  {
    id: 'wh-03',
    timestamp: '15:41:55.109',
    gateway: 'Steadfast',
    eventType: 'delivery.payout_ready',
    trxId: 'STF-PAY-33109',
    amount: 3000,
    currency: 'BDT',
    status: '200_OK',
    payload: {
      invoice: 'STF-INV-4402',
      tracking_code: 'SF9901844BD',
      status: 'delivered',
      cod_amount: 3000,
      delivery_charge: 70,
      weight_excess_fee: 250,
      payable_amount: 2680
    }
  },
  {
    id: 'wh-04',
    timestamp: '15:41:30.650',
    gateway: 'Nagad',
    eventType: 'checkout.payment.completed',
    trxId: 'NG99100342',
    amount: 4500,
    currency: 'BDT',
    status: 'VERIFIED',
    payload: {
      merchantId: 'NAGAD_ENTERPRISE_099',
      orderId: 'ORD-NG-4011',
      paymentRefId: 'NG99100342',
      status: 'Success',
      amount: 4500.0,
      clientMobile: '01822***114'
    }
  }
];

export const INITIAL_TABLE1_PREPAID: Table1PrepaidOrder[] = [
  {
    orderId: 'ORD-2026-9001',
    timestamp: '2026-09-08 15:38:10',
    traceId: 'TR-PRE-2026-X89',
    gateway: 'bKash',
    amount: 3450,
    merchantInvoiceNumber: 'INV-BK-9001-ALPHA',
    status: 'Paid'
  },
  {
    orderId: 'ORD-2026-9002',
    timestamp: '2026-09-08 15:35:44',
    traceId: 'TR-PRE-2026-X90',
    gateway: 'Nagad',
    amount: 1850,
    merchantInvoiceNumber: 'INV-NG-9002-BETA',
    status: 'Paid'
  },
  {
    orderId: 'ORD-2026-9003',
    timestamp: '2026-09-08 15:29:12',
    traceId: 'TR-PRE-2026-X91',
    gateway: 'bKash',
    amount: 6200,
    merchantInvoiceNumber: 'INV-BK-9003-GAMMA',
    status: 'Paid'
  },
  {
    orderId: 'ORD-2026-9004',
    timestamp: '2026-09-08 15:21:05',
    traceId: 'TR-PRE-2026-X92',
    gateway: 'Rocket',
    amount: 980,
    merchantInvoiceNumber: 'INV-RK-9004-DELTA',
    status: 'Paid'
  }
];

export const INITIAL_TABLE2_COD: Table2CODOrder[] = [
  {
    orderId: 'ORD-2026-8101',
    timestamp: '2026-09-08 15:39:20',
    traceId: 'TR-COD-2026-C12',
    courierPartner: 'Pathao Courier',
    collectableAmount: 2850,
    barcodeShippingTag: 'PTH-BAR-8101-DH',
    status: 'Pending Delivery'
  },
  {
    orderId: 'ORD-2026-8102',
    timestamp: '2026-09-08 15:31:02',
    traceId: 'TR-COD-2026-C13',
    courierPartner: 'Steadfast',
    collectableAmount: 1420,
    barcodeShippingTag: 'STF-BAR-8102-CTG',
    status: 'Pending Delivery'
  },
  {
    orderId: 'ORD-2026-8103',
    timestamp: '2026-09-08 15:25:40',
    traceId: 'TR-COD-2026-C14',
    courierPartner: 'RedX',
    collectableAmount: 4900,
    barcodeShippingTag: 'RDX-BAR-8103-SYL',
    status: 'Pending Delivery'
  },
  {
    orderId: 'ORD-2026-8104',
    timestamp: '2026-09-08 15:15:19',
    traceId: 'TR-COD-2026-C15',
    courierPartner: 'Pathao Courier',
    collectableAmount: 3100,
    barcodeShippingTag: 'PTH-BAR-8104-RAJ',
    status: 'Pending Delivery'
  }
];

export const INITIAL_TABLE3_SPLIT: Table3SplitOrder[] = [
  {
    orderId: 'ORD-2026-7201',
    twinTraceId: 'TR-SPLIT-2026-S44',
    advanceMfsPaid: 150,
    unpaidCodBalance: 2500,
    courierBookingRef: 'PTH-BK-7201-SPLIT',
    gateway: 'bKash Merchant',
    courierPartner: 'Pathao Courier',
    status: 'Dual-Pulse Injected'
  },
  {
    orderId: 'ORD-2026-7202',
    twinTraceId: 'TR-SPLIT-2026-S45',
    advanceMfsPaid: 150,
    unpaidCodBalance: 4200,
    courierBookingRef: 'STF-BK-7202-SPLIT',
    gateway: 'Nagad Checkout',
    courierPartner: 'Steadfast',
    status: 'Dual-Pulse Injected'
  },
  {
    orderId: 'ORD-2026-7203',
    twinTraceId: 'TR-SPLIT-2026-S46',
    advanceMfsPaid: 200,
    unpaidCodBalance: 1750,
    courierBookingRef: 'RDX-BK-7203-SPLIT',
    gateway: 'bKash Merchant',
    courierPartner: 'RedX',
    status: 'Dual-Pulse Injected'
  }
];

export const INITIAL_TABLE4_FREE: Table4FreeDeliveryOrder[] = [
  {
    orderId: 'ORD-2026-6301',
    traceId: 'TR-FREE-2026-F09',
    deliveryCharge: 0,
    marketingExpenseLedgerEntry: 'EXP-MKTG-SHP-6301 (BDT 120 Absorbed)',
    cashToCollect: 3200,
    status: 'Promo Verified'
  },
  {
    orderId: 'ORD-2026-6302',
    traceId: 'TR-FREE-2026-F10',
    deliveryCharge: 0,
    marketingExpenseLedgerEntry: 'EXP-MKTG-SHP-6302 (BDT 70 Absorbed)',
    cashToCollect: 1950,
    status: 'Promo Verified'
  },
  {
    orderId: 'ORD-2026-6303',
    traceId: 'TR-FREE-2026-F11',
    deliveryCharge: 0,
    marketingExpenseLedgerEntry: 'EXP-MKTG-SHP-6303 (BDT 150 Absorbed)',
    cashToCollect: 5400,
    status: 'Promo Verified'
  }
];

export const INITIAL_AUDIT_RECORDS: AuditRecord[] = [
  {
    id: 'aud-01',
    traceId: 'TR-PRE-101',
    trxId: 'BK-99102-TX',
    orderId: 'ORD-1001',
    customerPhone: '01711223344',
    dbAmount: 1000,
    settledAmount: 1000,
    status: 'MATCHED',
    badgeColor: 'green',
    tooltip: 'Verified: Database, MFS Statement, and Bank Payout match exactly.',
    channel: 'Track A Enterprise',
    timestamp: '2026-09-08 00:01:14'
  },
  {
    id: 'aud-02',
    traceId: 'TR-DESHI-102',
    trxId: 'NG-44102-PK',
    orderId: 'ORD-1002',
    customerPhone: '01899887766',
    dbAmount: 5000,
    settledAmount: 500,
    status: 'AMOUNT_MISMATCH',
    badgeColor: 'red',
    tooltip: 'Payload Tampering / Inspect Element Attack (BDT 4,500 Gap)',
    notes: 'Client altered checkout payload from 5,000 to 500 in browser DOM before submission.',
    channel: 'Track A Enterprise',
    timestamp: '2026-09-08 00:01:14'
  },
  {
    id: 'aud-03',
    traceId: 'TR-COD-103',
    trxId: 'PTH-DEL-331',
    orderId: 'ORD-1003',
    customerPhone: '01911445566',
    dbAmount: 2500,
    settledAmount: 'ABSENT',
    status: 'MISSING_PAYMENT',
    badgeColor: 'amber',
    tooltip: 'Rider Cash-Withholding / Unsettled COD Funds',
    notes: 'Pathao system indicates package was handed over 5 days ago, but COD remit is absent from courier bank batch.',
    channel: 'Track A Enterprise',
    timestamp: '2026-09-08 00:01:15'
  },
  {
    id: 'aud-04',
    traceId: 'TR-GHOST-104',
    trxId: 'BLM9A2K4X7',
    orderId: 'ABSENT',
    customerPhone: '01755667788',
    dbAmount: 'ABSENT',
    settledAmount: 1200,
    status: 'GHOST_ENTRY',
    badgeColor: 'cyan',
    tooltip: 'Gateway API Session Dropout (Customer debited, website missed order validation)',
    notes: 'Customer completed bKash PIN challenge, bKash bank credited merchant account, but redirect failed on customer network drop.',
    channel: 'Track A Enterprise',
    timestamp: '2026-09-08 00:01:15'
  },
  {
    id: 'aud-05',
    traceId: 'TR-COD-105',
    trxId: 'STF-REM-501',
    orderId: 'ORD-1005',
    customerPhone: '01677889900',
    dbAmount: 3000,
    settledAmount: 2750,
    courierDeductedFee: 250,
    status: 'LOGISTICS_VARIANCE',
    badgeColor: 'orange',
    tooltip: 'Unauthorized Courier Weight Penalty Deduction',
    notes: 'Steadfast auto-assessed 2.5kg volumetric penalty without photographic weight scale manifest proof.',
    channel: 'Track A Enterprise',
    timestamp: '2026-09-08 00:01:16'
  },
  {
    id: 'aud-06',
    traceId: 'TR-RET-201',
    trxId: 'PTH-RET-990',
    orderId: 'ORD-2001',
    customerPhone: '01522334455',
    configFee: 60,
    courierDeductedFee: 180,
    dbAmount: 60,
    settledAmount: 180,
    status: 'RETURN_VARIANCE_ERROR',
    badgeColor: 'red',
    tooltip: 'Arbitrary Return Penalty Overcharge Exceeding Base Rate Cap',
    notes: 'Service Level Agreement contractual return fee is capped at BDT 60, courier deducted BDT 180.',
    channel: 'Track A Enterprise',
    timestamp: '2026-09-08 00:01:16'
  },
  {
    id: 'aud-07',
    traceId: 'TR-RET-202',
    trxId: 'STF-RET-412',
    orderId: 'ORD-2002',
    customerPhone: '01733445566',
    dispatchedDaysAgo: 12,
    dbAmount: 1850,
    settledAmount: 'ABSENT',
    status: 'COURIER_RETENTION_GAP',
    badgeColor: 'crimson',
    tooltip: 'Package trapped in courier sorting hub > 10 days. Potential lost/stolen stock.',
    notes: 'Dispatched 12 days ago via Steadfast Tejgaon hub; neither delivered to customer nor scanned in returns.',
    channel: 'Track A Enterprise',
    timestamp: '2026-09-08 00:01:17'
  },
  {
    id: 'aud-08',
    traceId: 'TR-RET-203',
    trxId: 'RDX-RET-703',
    orderId: 'ORD-2003',
    customerPhone: '01811223344',
    dbAmount: 2200,
    settledAmount: 'ABSENT',
    courierDeductedFee: 90,
    status: 'GHOST_RETURN_EXCEPTION',
    badgeColor: 'purple',
    tooltip: 'Courier charged return fee but item was never scanned at warehouse receiving gate.',
    notes: 'RedX deducted BDT 90 return handling fee, but warehouse receiving barcode scanner has 0 records of package arrival.',
    channel: 'Track A Enterprise',
    timestamp: '2026-09-08 00:01:17',
    resolved: false
  }
];

export const INITIAL_IMAP_EMAILS: IngestedMfsEmail[] = [
  {
    id: 'em-01',
    receivedAt: '15:40:22',
    senderAddress: 'bKash-Payment-Alert@bKash.com',
    subject: 'bKash Merchant Payment Notification: BLM9A2K4X7',
    provider: 'bKash Merchant',
    trxId: 'BLM9A2K4X7',
    senderMobile: '01711892019',
    amount: 1200,
    status: 'RAW_INGESTED',
    rawBody: 'You have received Tk 1,200.00 from 01711892019. TrxID: BLM9A2K4X7. Ref: FB-PAGE-INBOX-209. Balance Tk 42,900.20.'
  },
  {
    id: 'em-02',
    receivedAt: '15:28:45',
    senderAddress: 'notification@nagad.com.bd',
    subject: 'Nagad Payment Received: 9K72MM091A',
    provider: 'Nagad Merchant',
    trxId: '9K72MM091A',
    senderMobile: '01822490182',
    amount: 250,
    status: 'RAW_INGESTED',
    rawBody: 'Payment received Tk 250.00 from 01822490182 via Nagad. TxnID: 9K72MM091A. Counter ref: AD-SHP-FEE.'
  },
  {
    id: 'em-03',
    receivedAt: '15:10:14',
    senderAddress: 'bKash-Payment-Alert@bKash.com',
    subject: 'bKash Merchant Payment Notification: CK44PP190X',
    provider: 'bKash Merchant',
    trxId: 'CK44PP190X',
    senderMobile: '01911770022',
    amount: 3200,
    status: 'LINKED_TO_PARCEL',
    rawBody: 'You have received Tk 3,200.00 from 01911770022. TrxID: CK44PP190X. Ref: SILK-SHARE-88.'
  },
  {
    id: 'em-04',
    receivedAt: '14:48:02',
    senderAddress: 'bKash-Payment-Alert@bKash.com',
    subject: 'bKash Merchant Payment Notification: DA88LL2091',
    provider: 'bKash Merchant',
    trxId: 'DA88LL2091',
    senderMobile: '01688339911',
    amount: 150,
    status: 'RAW_INGESTED',
    rawBody: 'You have received Tk 150.00 from 01688339911. TrxID: DA88LL2091. Advance Delivery Deposit.'
  }
];

export const INITIAL_DISPATCHED_PARCELS: DispatchedParcel[] = [
  {
    id: 'par-01',
    orderId: 'FB-ORD-5501',
    traceId: 'TR-SME-2026-P01',
    dispatchType: '100% Pre-Paid',
    customerName: 'Amina Chowdhury',
    customerPhone: '01711892019',
    deliveryAddress: 'House 14, Road 7, Sector 3, Uttara, Dhaka-1230',
    courier: 'Pathao Courier',
    linkedTrxId: 'CK44PP190X',
    advancePaidBDT: 3200,
    codCollectionBDT: 0,
    deliveryFeeBDT: 80,
    marketingSubsidyBDT: 0,
    barcodeTag: 'PTH-SME-5501-UTT',
    timestamp: '2026-09-08 14:15:00',
    status: 'IN_TRANSIT'
  },
  {
    id: 'par-02',
    orderId: 'FB-ORD-5502',
    traceId: 'TR-SME-2026-P02',
    dispatchType: 'Split Advance Paid',
    customerName: 'Tanvir Hossain',
    customerPhone: '01822490182',
    deliveryAddress: 'GEC Circle, Nasirabad, Chattogram',
    courier: 'Steadfast',
    linkedTrxId: 'DA88LL2091',
    advancePaidBDT: 150,
    codCollectionBDT: 2450,
    deliveryFeeBDT: 130,
    marketingSubsidyBDT: 0,
    barcodeTag: 'STF-SME-5502-CTG',
    timestamp: '2026-09-08 14:20:00',
    status: 'IN_TRANSIT'
  },
  {
    id: 'par-03',
    orderId: 'FB-ORD-5503',
    traceId: 'TR-RET-203',
    dispatchType: '100% COD',
    customerName: 'Rafiqul Islam',
    customerPhone: '01811223344',
    deliveryAddress: 'Station Road, Rangpur',
    courier: 'RedX',
    advancePaidBDT: 0,
    codCollectionBDT: 2200,
    deliveryFeeBDT: 150,
    marketingSubsidyBDT: 0,
    barcodeTag: 'TR-RET-203',
    timestamp: '2026-09-02 11:30:00',
    status: 'RETURN_IN_TRANSIT'
  }
];

export const INITIAL_REPORT_BATCHES: ReconciledReportBatch[] = [
  {
    batchId: 'BATCH-2026-09-07-A',
    dateProcessed: '2026-09-08 00:02:10',
    trackMode: 'Track A Enterprise',
    totalRows: 14820,
    matchedRate: 99.4,
    anomalyCount: 8,
    netSettledSumBDT: 5000000,
    fileName: 'Reconciled_Audit_TrackA_20260907.csv',
    status: 'VERIFIED_FINAL'
  },
  {
    batchId: 'BATCH-2026-09-06-A',
    dateProcessed: '2026-09-07 00:01:45',
    trackMode: 'Track A Enterprise',
    totalRows: 13910,
    matchedRate: 99.6,
    anomalyCount: 5,
    netSettledSumBDT: 4820000,
    fileName: 'Reconciled_Audit_TrackA_20260906.csv',
    status: 'VERIFIED_FINAL'
  },
  {
    batchId: 'BATCH-2026-09-07-B',
    dateProcessed: '2026-09-07 19:40:00',
    trackMode: 'Track B SME',
    totalRows: 420,
    matchedRate: 97.8,
    anomalyCount: 9,
    netSettledSumBDT: 340000,
    fileName: 'SME_DualFile_Audit_20260907.csv',
    status: 'VARIANCE_FLAGGED'
  },
  {
    batchId: 'BATCH-2026-09-05-C',
    dateProcessed: '2026-09-06 00:03:12',
    trackMode: 'Consolidated',
    totalRows: 15400,
    matchedRate: 99.5,
    anomalyCount: 7,
    netSettledSumBDT: 5310000,
    fileName: 'Consolidated_Enterprise_SME_20260905.csv',
    status: 'VERIFIED_FINAL'
  }
];

export const INITIAL_PAYMENT_SCHEME_RECORDS: PaymentSchemeRecord[] = [
  // 1. FULL ADVANCE PAYMENT (Track A)
  {
    id: 'sch-01',
    orderId: 'ORD-ADV-9011',
    customerName: 'Shakil Ahmed',
    customerPhone: '01711***291',
    scheme: 'FULL_ADVANCE',
    schemeLabel: '100% Full Advance (MFS)',
    grossAmount: 3800,
    advancePaid: 3800,
    codCollectable: 0,
    mfsGatewayFee: 57, // 1.5%
    courierDeliveryFee: 80,
    courierCodFee: 0,
    marketingAbsorbedSubsidy: 0,
    expectedNetPayout: 3663, // 3800 - 57 - 80
    settledNetPayout: null,
    status: 'PRE_RECONCILED_PENDING',
    mfsTrxId: 'BK-99214-ADV',
    courierConsignment: 'PTH-CONS-9011',
    courierPartner: 'Pathao Courier',
    preReconcileNote: 'bKash PGW Webhook received. Courier POD signed. Awaiting bank settlement batch verification.',
    track: 'Track A Enterprise'
  },
  {
    id: 'sch-02',
    orderId: 'ORD-ADV-9012',
    customerName: 'Farhana Yasmin',
    customerPhone: '01822***490',
    scheme: 'FULL_ADVANCE',
    schemeLabel: '100% Full Advance (MFS)',
    grossAmount: 5200,
    advancePaid: 5200,
    codCollectable: 0,
    mfsGatewayFee: 78,
    courierDeliveryFee: 120,
    courierCodFee: 0,
    marketingAbsorbedSubsidy: 0,
    expectedNetPayout: 5002, // 5200 - 78 - 120
    settledNetPayout: 5002,
    status: 'RECONCILED_SETTLED',
    mfsTrxId: 'NG-88310-ADV',
    courierConsignment: 'STF-CONS-9012',
    courierPartner: 'Steadfast',
    preReconcileNote: 'Nagad Checkout confirmed.',
    postReconcileNote: 'EBL Merchant Payout matching 100%. Tax and Gateway fee deducted per SLA.',
    reconciliationTimestamp: '2026-09-08 00:02:11',
    settlementChecksum: 'SHA256-SETTL-0912X',
    bankStatementRef: 'EBL-TX-20260908-4412',
    track: 'Track A Enterprise'
  },

  // 2. SPLIT PAYMENT (Track A & Track B)
  {
    id: 'sch-03',
    orderId: 'ORD-SPL-7101',
    customerName: 'Kamrul Hasan',
    customerPhone: '01911***982',
    scheme: 'SPLIT_PAYMENT',
    schemeLabel: 'Split Payment (Advance + COD)',
    grossAmount: 4500,
    advancePaid: 300, // Advance delivery token
    codCollectable: 4200, // Balance collected at door
    mfsGatewayFee: 4.5, // 1.5% of 300
    courierDeliveryFee: 130,
    courierCodFee: 42, // 1% of 4200
    marketingAbsorbedSubsidy: 0,
    expectedNetPayout: 4323.5, // (300 - 4.5) + (4200 - 42 - 130)
    settledNetPayout: null,
    status: 'PRE_RECONCILED_PENDING',
    mfsTrxId: 'BK-SPL-300-T1',
    courierConsignment: 'PTH-SPL-4200',
    courierPartner: 'Pathao Courier',
    preReconcileNote: 'Advance BDT 300 received via bKash. Courier collected BDT 4,200 COD. Twin-trace ready for reconciliation.',
    track: 'Track A Enterprise'
  },
  {
    id: 'sch-04',
    orderId: 'ORD-SPL-7102',
    customerName: 'Sadia Sultana',
    customerPhone: '01688***112',
    scheme: 'SPLIT_PAYMENT',
    schemeLabel: 'Split Payment (Advance + COD)',
    grossAmount: 2650,
    advancePaid: 150,
    codCollectable: 2500,
    mfsGatewayFee: 2.25,
    courierDeliveryFee: 70,
    courierCodFee: 25,
    marketingAbsorbedSubsidy: 0,
    expectedNetPayout: 2552.75, // (150 - 2.25) + (2500 - 25 - 70)
    settledNetPayout: 2552.75,
    status: 'RECONCILED_SETTLED',
    mfsTrxId: 'DA88LL2091',
    courierConsignment: 'STF-SME-5502-CTG',
    courierPartner: 'Steadfast',
    preReconcileNote: 'bKash advance paired with Steadfast Remittance.',
    postReconcileNote: 'Dual-pulse cross checked: advance and COD reconciled with bank deposit line.',
    reconciliationTimestamp: '2026-09-08 00:01:45',
    settlementChecksum: 'SHA256-SETTL-7102S',
    bankStatementRef: 'CITY-TX-20260908-1190',
    track: 'Track B SME'
  },

  // 3. FULL CASH ON DELIVERY (Track A & Track B)
  {
    id: 'sch-05',
    orderId: 'ORD-COD-8201',
    customerName: 'Mahmudur Rahman',
    customerPhone: '01722***610',
    scheme: 'FULL_COD',
    schemeLabel: '100% Cash on Delivery (COD)',
    grossAmount: 3200,
    advancePaid: 0,
    codCollectable: 3200,
    mfsGatewayFee: 0,
    courierDeliveryFee: 120,
    courierCodFee: 32, // 1%
    marketingAbsorbedSubsidy: 0,
    expectedNetPayout: 3048, // 3200 - 120 - 32
    settledNetPayout: null,
    status: 'PRE_RECONCILED_PENDING',
    courierConsignment: 'PTH-COD-8201-DH',
    courierPartner: 'Pathao Courier',
    preReconcileNote: 'Delivered to customer. Courier Remittance batch pending in Pathao API.',
    track: 'Track A Enterprise'
  },
  {
    id: 'sch-06',
    orderId: 'ORD-COD-8202',
    customerName: 'Nusrat Jahan',
    customerPhone: '01811***721',
    scheme: 'FULL_COD',
    schemeLabel: '100% Cash on Delivery (COD)',
    grossAmount: 1850,
    advancePaid: 0,
    codCollectable: 1850,
    mfsGatewayFee: 0,
    courierDeliveryFee: 70,
    courierCodFee: 18.5,
    marketingAbsorbedSubsidy: 0,
    expectedNetPayout: 1761.5, // 1850 - 70 - 18.5
    settledNetPayout: 1761.5,
    status: 'RECONCILED_SETTLED',
    courierConsignment: 'RDX-COD-8202-SYL',
    courierPartner: 'RedX',
    preReconcileNote: 'RedX Delivered parcel.',
    postReconcileNote: 'Remittance received in Brac Bank. Zero COD retention gap confirmed.',
    reconciliationTimestamp: '2026-09-07 23:45:10',
    settlementChecksum: 'SHA256-SETTL-8202C',
    bankStatementRef: 'BRAC-TX-20260907-8821',
    track: 'Track B SME'
  },

  // 4. FREE DELIVERY (ZERO DELIVERY CHARGE)
  {
    id: 'sch-07',
    orderId: 'ORD-FRE-6301',
    customerName: 'Zubair Hossain',
    customerPhone: '01933***551',
    scheme: 'FREE_DELIVERY',
    schemeLabel: 'Free Delivery (Promo Absorbed)',
    grossAmount: 4900,
    advancePaid: 4900,
    codCollectable: 0,
    mfsGatewayFee: 73.5, // 1.5%
    courierDeliveryFee: 150, // Absorbed by marketing
    courierCodFee: 0,
    marketingAbsorbedSubsidy: 150, // Absorbed subsidy
    expectedNetPayout: 4826.5, // 4900 - 73.5 (courier fee absorbed by marketing ledger)
    settledNetPayout: null,
    status: 'PRE_RECONCILED_PENDING',
    mfsTrxId: 'BK-FRE-4900-Z1',
    courierConsignment: 'PTH-FRE-6301',
    courierPartner: 'Pathao Courier',
    preReconcileNote: 'Campaign "DHAKA_FREE_SHIP". Marketing Voucher Ledger code EXP-MKTG-SHP-6301 verified.',
    track: 'Track A Enterprise'
  },
  {
    id: 'sch-08',
    orderId: 'ORD-FRE-6302',
    customerName: 'Rashedul Karim',
    customerPhone: '01777***889',
    scheme: 'FREE_DELIVERY',
    schemeLabel: 'Free Delivery (Promo Absorbed)',
    grossAmount: 2100,
    advancePaid: 0,
    codCollectable: 2100,
    mfsGatewayFee: 0,
    courierDeliveryFee: 80,
    courierCodFee: 21,
    marketingAbsorbedSubsidy: 80,
    expectedNetPayout: 2079, // 2100 - 21 (delivery charge waived)
    settledNetPayout: 2079,
    status: 'RECONCILED_SETTLED',
    courierConsignment: 'STF-FRE-6302',
    courierPartner: 'Steadfast',
    preReconcileNote: 'COD order with Free Shipping voucher.',
    postReconcileNote: 'Reconciled. Marketing expense ledger debited BDT 80, merchant received full BDT 2,079.',
    reconciliationTimestamp: '2026-09-08 00:02:15',
    settlementChecksum: 'SHA256-SETTL-6302F',
    bankStatementRef: 'DBBL-TX-20260908-3312',
    track: 'Track B SME'
  },

  // Additional pending records for live simulation in both tracks
  {
    id: 'sch-09',
    orderId: 'ORD-ADV-9015',
    customerName: 'Tariqul Islam',
    customerPhone: '01755***190',
    scheme: 'FULL_ADVANCE',
    schemeLabel: '100% Full Advance (MFS)',
    grossAmount: 6400,
    advancePaid: 6400,
    codCollectable: 0,
    mfsGatewayFee: 96,
    courierDeliveryFee: 120,
    courierCodFee: 0,
    marketingAbsorbedSubsidy: 0,
    expectedNetPayout: 6184,
    settledNetPayout: null,
    status: 'PRE_RECONCILED_PENDING',
    mfsTrxId: 'BK-ADV-6400-T9',
    courierConsignment: 'PTH-CONS-9015',
    courierPartner: 'Pathao Courier',
    preReconcileNote: 'Payment captured on bKash API. Courier tracking shows delivered. Pending batch transfer.',
    track: 'Track A Enterprise'
  },
  {
    id: 'sch-10',
    orderId: 'ORD-SPL-7105',
    customerName: 'Momena Begum',
    customerPhone: '01866***234',
    scheme: 'SPLIT_PAYMENT',
    schemeLabel: 'Split Payment (Advance + COD)',
    grossAmount: 3500,
    advancePaid: 200,
    codCollectable: 3300,
    mfsGatewayFee: 3,
    courierDeliveryFee: 90,
    courierCodFee: 33,
    marketingAbsorbedSubsidy: 0,
    expectedNetPayout: 3374,
    settledNetPayout: null,
    status: 'PRE_RECONCILED_PENDING',
    mfsTrxId: 'NG-SPL-200-MB',
    courierConsignment: 'STF-SPL-3300',
    courierPartner: 'Steadfast',
    preReconcileNote: 'Advance BDT 200 via Nagad. Steadfast delivered COD BDT 3,300 today.',
    track: 'Track B SME'
  },
  {
    id: 'sch-11',
    orderId: 'ORD-COD-8205',
    customerName: 'Anisur Rahman',
    customerPhone: '01988***443',
    scheme: 'FULL_COD',
    schemeLabel: '100% Cash on Delivery (COD)',
    grossAmount: 5100,
    advancePaid: 0,
    codCollectable: 5100,
    mfsGatewayFee: 0,
    courierDeliveryFee: 140,
    courierCodFee: 51,
    marketingAbsorbedSubsidy: 0,
    expectedNetPayout: 4909,
    settledNetPayout: null,
    status: 'PRE_RECONCILED_PENDING',
    courierConsignment: 'RDX-COD-5100',
    courierPartner: 'RedX',
    preReconcileNote: 'Customer paid 100% cash to RedX delivery agent. Ready for ledger settlement.',
    track: 'Track A Enterprise'
  },
  {
    id: 'sch-12',
    orderId: 'ORD-FRE-6305',
    customerName: 'Farhan Kabir',
    customerPhone: '01712***776',
    scheme: 'FREE_DELIVERY',
    schemeLabel: 'Free Delivery (Promo Absorbed)',
    grossAmount: 1750,
    advancePaid: 1750,
    codCollectable: 0,
    mfsGatewayFee: 26.25,
    courierDeliveryFee: 60,
    courierCodFee: 0,
    marketingAbsorbedSubsidy: 60,
    expectedNetPayout: 1723.75,
    settledNetPayout: null,
    status: 'PRE_RECONCILED_PENDING',
    mfsTrxId: 'BK-FRE-1750-FK',
    courierConsignment: 'PTH-FRE-1750',
    courierPartner: 'Pathao Courier',
    preReconcileNote: 'Promo code "FREESHIP2026" applied. Delivery fee recorded to marketing ledger.',
    track: 'Track B SME'
  }
];

export const INITIAL_DAILY_PAYMENT_BREAKDOWN: DailyPaymentBreakdown = {
  date: '2026-09-08',
  fullAdvanceCount: 684,
  fullAdvanceBDT: 2465000,
  splitPaymentCount: 412,
  splitAdvanceBDT: 82400,
  splitCodBDT: 1120000,
  splitTotalBDT: 1202400,
  fullCodCount: 526,
  fullCodBDT: 1684000,
  freeDeliveryCount: 198,
  freeDeliveryAbsorbedBDT: 23760,
  totalOrdersCount: 1622,
  totalVolumeBDT: 5351400
};

// 6-Month Historical Data: Monthly (April 2026 to September 2026)
export const INITIAL_HISTORICAL_MONTHLY_DATA: HistoricalChartPoint[] = [
  {
    periodKey: '2026-04',
    displayLabel: 'Apr 2026',
    fullAdvanceBDT: 52400000,
    splitPaymentBDT: 28200000,
    fullCodBDT: 44100000,
    freeDeliveryBDT: 840000,
    totalBDT: 125540000,
    orderCount: 38200
  },
  {
    periodKey: '2026-05',
    displayLabel: 'May 2026',
    fullAdvanceBDT: 58900000,
    splitPaymentBDT: 31400000,
    fullCodBDT: 41800000,
    freeDeliveryBDT: 920000,
    totalBDT: 133020000,
    orderCount: 40500
  },
  {
    periodKey: '2026-06',
    displayLabel: 'Jun 2026',
    fullAdvanceBDT: 64200000,
    splitPaymentBDT: 34900000,
    fullCodBDT: 39500000,
    freeDeliveryBDT: 1150000,
    totalBDT: 139750000,
    orderCount: 42800
  },
  {
    periodKey: '2026-07',
    displayLabel: 'Jul 2026',
    fullAdvanceBDT: 71800000,
    splitPaymentBDT: 38200000,
    fullCodBDT: 37400000,
    freeDeliveryBDT: 1240000,
    totalBDT: 148640000,
    orderCount: 45100
  },
  {
    periodKey: '2026-08',
    displayLabel: 'Aug 2026',
    fullAdvanceBDT: 79500000,
    splitPaymentBDT: 42100000,
    fullCodBDT: 35600000,
    freeDeliveryBDT: 1380000,
    totalBDT: 158580000,
    orderCount: 47900
  },
  {
    periodKey: '2026-09',
    displayLabel: 'Sep 2026 (MTD)',
    fullAdvanceBDT: 21400000,
    splitPaymentBDT: 10800000,
    fullCodBDT: 9200000,
    freeDeliveryBDT: 390000,
    totalBDT: 41790000,
    orderCount: 12600
  }
];

// 6-Month Historical Data: Weekly (Sample for last 8 weeks)
export const INITIAL_HISTORICAL_WEEKLY_DATA: HistoricalChartPoint[] = [
  { periodKey: 'W31', displayLabel: 'Week 31 (Jul)', fullAdvanceBDT: 17800000, splitPaymentBDT: 9400000, fullCodBDT: 9200000, freeDeliveryBDT: 310000, totalBDT: 36710000, orderCount: 11200 },
  { periodKey: 'W32', displayLabel: 'Week 32 (Aug)', fullAdvanceBDT: 19100000, splitPaymentBDT: 10200000, fullCodBDT: 8900000, freeDeliveryBDT: 340000, totalBDT: 38540000, orderCount: 11800 },
  { periodKey: 'W33', displayLabel: 'Week 33 (Aug)', fullAdvanceBDT: 19800000, splitPaymentBDT: 10500000, fullCodBDT: 8800000, freeDeliveryBDT: 350000, totalBDT: 39450000, orderCount: 12050 },
  { periodKey: 'W34', displayLabel: 'Week 34 (Aug)', fullAdvanceBDT: 20200000, splitPaymentBDT: 10700000, fullCodBDT: 8700000, freeDeliveryBDT: 340000, totalBDT: 39940000, orderCount: 12100 },
  { periodKey: 'W35', displayLabel: 'Week 35 (Aug)', fullAdvanceBDT: 20400000, splitPaymentBDT: 10700000, fullCodBDT: 8600000, freeDeliveryBDT: 350000, totalBDT: 40050000, orderCount: 12150 },
  { periodKey: 'W36', displayLabel: 'Week 36 (Sep)', fullAdvanceBDT: 20900000, splitPaymentBDT: 10900000, fullCodBDT: 8500000, freeDeliveryBDT: 360000, totalBDT: 40660000, orderCount: 12300 },
  { periodKey: 'W37', displayLabel: 'Week 37 (Current)', fullAdvanceBDT: 12400000, splitPaymentBDT: 6200000, fullCodBDT: 5100000, freeDeliveryBDT: 210000, totalBDT: 23910000, orderCount: 7200 }
];

// 6-Month Historical Data: Daily (Last 14 Days)
export const INITIAL_HISTORICAL_DAILY_DATA: HistoricalChartPoint[] = [
  { periodKey: '2026-08-26', displayLabel: '26 Aug', fullAdvanceBDT: 2650000, splitPaymentBDT: 1350000, fullCodBDT: 1200000, freeDeliveryBDT: 48000, totalBDT: 5248000, orderCount: 1590 },
  { periodKey: '2026-08-27', displayLabel: '27 Aug', fullAdvanceBDT: 2780000, splitPaymentBDT: 1420000, fullCodBDT: 1180000, freeDeliveryBDT: 51000, totalBDT: 5431000, orderCount: 1640 },
  { periodKey: '2026-08-28', displayLabel: '28 Aug', fullAdvanceBDT: 2910000, splitPaymentBDT: 1490000, fullCodBDT: 1150000, freeDeliveryBDT: 53000, totalBDT: 5603000, orderCount: 1710 },
  { periodKey: '2026-08-29', displayLabel: '29 Aug', fullAdvanceBDT: 2850000, splitPaymentBDT: 1460000, fullCodBDT: 1190000, freeDeliveryBDT: 49000, totalBDT: 5549000, orderCount: 1680 },
  { periodKey: '2026-08-30', displayLabel: '30 Aug', fullAdvanceBDT: 2980000, splitPaymentBDT: 1530000, fullCodBDT: 1220000, freeDeliveryBDT: 54000, totalBDT: 5784000, orderCount: 1750 },
  { periodKey: '2026-08-31', displayLabel: '31 Aug', fullAdvanceBDT: 3100000, splitPaymentBDT: 1600000, fullCodBDT: 1250000, freeDeliveryBDT: 58000, totalBDT: 6008000, orderCount: 1820 },
  { periodKey: '2026-09-01', displayLabel: '01 Sep', fullAdvanceBDT: 3250000, splitPaymentBDT: 1680000, fullCodBDT: 1290000, freeDeliveryBDT: 62000, totalBDT: 6282000, orderCount: 1910 },
  { periodKey: '2026-09-02', displayLabel: '02 Sep', fullAdvanceBDT: 3120000, splitPaymentBDT: 1610000, fullCodBDT: 1240000, freeDeliveryBDT: 59000, totalBDT: 6029000, orderCount: 1830 },
  { periodKey: '2026-09-03', displayLabel: '03 Sep', fullAdvanceBDT: 2990000, splitPaymentBDT: 1550000, fullCodBDT: 1210000, freeDeliveryBDT: 55000, totalBDT: 5805000, orderCount: 1760 },
  { periodKey: '2026-09-04', displayLabel: '04 Sep', fullAdvanceBDT: 3050000, splitPaymentBDT: 1580000, fullCodBDT: 1230000, freeDeliveryBDT: 57000, totalBDT: 5917000, orderCount: 1790 },
  { periodKey: '2026-09-05', displayLabel: '05 Sep', fullAdvanceBDT: 2880000, splitPaymentBDT: 1500000, fullCodBDT: 1180000, freeDeliveryBDT: 52000, totalBDT: 5612000, orderCount: 1700 },
  { periodKey: '2026-09-06', displayLabel: '06 Sep', fullAdvanceBDT: 2950000, splitPaymentBDT: 1520000, fullCodBDT: 1200000, freeDeliveryBDT: 54000, totalBDT: 5724000, orderCount: 1730 },
  { periodKey: '2026-09-07', displayLabel: '07 Sep', fullAdvanceBDT: 3020000, splitPaymentBDT: 1560000, fullCodBDT: 1210000, freeDeliveryBDT: 56000, totalBDT: 5846000, orderCount: 1770 }
];

export const INITIAL_RETURN_PARCELS: ReturnParcelRecord[] = [
  // Track A Enterprise Returns (Origin: API_CHECKOUT_WEBHOOK)
  {
    id: 'ret-a-01',
    traceId: 'TR-RET-201',
    orderId: 'ORD-2001',
    track: 'Track A Enterprise',
    originType: 'API_CHECKOUT_WEBHOOK',
    originDetail: 'Cryptographic TraceID injected into Pathao Courier API payload during checkout',
    customerName: 'Nasir Uddin',
    customerPhone: '01522334455',
    courierPartner: 'Pathao Courier',
    parcelValueBDT: 3400,
    forwardFeeBDT: 80,
    returnFeeBDT: 180, // Contractual SLA cap is 60, courier overbilled 180 (Variance: +120.00)
    contractReturnFeeBDT: 60,
    returnChargeReconStatus: 'CHARGE_OVERBILLED',
    returnChargeReconNote: 'RECONCILIATION DISCREPANCY: Courier deducted BDT 180.00 vs BDT 60.00 contractual cap. +BDT 120.00 overcharge variance flagged for courier remittance clawback.',
    disputeClaimReference: 'DISP-PTH-2026-0901',
    returnReason: 'Customer refused delivery: Item box opened/damaged prior to delivery handover',
    dispatchedDate: '2026-09-02',
    dispatchTimestamp: '2026-09-02 14:15:00',
    returnInitiatedDate: '2026-09-06',
    scannedAtWarehouse: false,
    status: 'RETURN_IN_TRANSIT',
    barcodeTag: 'TR-RET-201',
    courierReportedStatus: 'RETURNED',
    deltaDaysInTransit: 6,
    vector1OverchargeVarianceBDT: 120.00,
    vector1Status: 'LOGISTICS_RETURN_VARIANCE_ERROR',
    vector2RetentionGap: false,
    vector3GhostException: false,
    notes: 'VECTOR 1 OVERCHARGE: Courier deducted BDT 180.00 vs BDT 60.00 contractual cap. BDT 120.00 clawback pending.'
  },
  {
    id: 'ret-a-02',
    traceId: 'TR-RET-202',
    orderId: 'ORD-2002',
    track: 'Track A Enterprise',
    originType: 'API_CHECKOUT_WEBHOOK',
    originDetail: 'Cryptographic TraceID injected into Steadfast API payload during checkout',
    customerName: 'Mahmudul Haque',
    customerPhone: '01733445566',
    courierPartner: 'Steadfast',
    parcelValueBDT: 1850,
    forwardFeeBDT: 130,
    returnFeeBDT: 60,
    contractReturnFeeBDT: 60,
    returnChargeReconStatus: 'VALIDATED_MATCH',
    returnChargeReconNote: 'MATCHED RETURN FEE: Steadfast return fee BDT 60.00 matches contracted rate. Note: Product returned late to merchant (12 days in transit). Return charge is deducted and reconciled.',
    disputeClaimReference: 'DISP-STF-2026-0902',
    returnReason: 'Customer unreachable after 3 consecutive dispatch attempts',
    dispatchedDate: '2026-08-27',
    dispatchTimestamp: '2026-08-27 10:30:00',
    returnInitiatedDate: '2026-09-01',
    scannedAtWarehouse: false,
    status: 'RETURN_IN_TRANSIT',
    barcodeTag: 'TR-RET-202',
    courierReportedStatus: 'RETURNED',
    deltaDaysInTransit: 12, // 12 days late return
    vector1OverchargeVarianceBDT: 0.00,
    vector1Status: 'VALID',
    vector2RetentionGap: true,
    vector2AlertMessage: 'Transit Delay: 12 Days in hub transit (Late return received by merchant)',
    vector3GhostException: false,
    notes: 'LATE RETURN TRANSIT: Product returned late to merchant (12 days in hub), but contractual return charge BDT 60.00 is legitimately deducted and matched.'
  },
  {
    id: 'ret-a-03',
    traceId: 'TR-RET-203',
    orderId: 'ORD-2003',
    track: 'Track A Enterprise',
    originType: 'API_CHECKOUT_WEBHOOK',
    originDetail: 'Cryptographic TraceID injected into RedX API payload during checkout',
    customerName: 'Rafiqul Islam',
    customerPhone: '01811223344',
    courierPartner: 'RedX',
    parcelValueBDT: 2200,
    forwardFeeBDT: 150,
    returnFeeBDT: 90,
    contractReturnFeeBDT: 60,
    returnChargeReconStatus: 'GHOST_BLOCKED',
    returnChargeReconNote: 'GHOST RETURN ZERO-DEBIT HOLD: RedX billed BDT 90.00 return fee on statement, but parcel has 0 physical scans at merchant warehouse. Entire return fee + parcel value blocked from settlement.',
    disputeClaimReference: 'DISP-RDX-2026-0903',
    returnReason: 'Customer cancelled at door: Color & size variance from online catalogue',
    dispatchedDate: '2026-08-28',
    dispatchTimestamp: '2026-08-28 16:45:00',
    returnInitiatedDate: '2026-09-03',
    scannedAtWarehouse: false,
    status: 'GHOST_RETURN_EXCEPTION',
    barcodeTag: 'TR-RET-203',
    courierReportedStatus: 'RETURNED',
    deltaDaysInTransit: 11,
    vector1OverchargeVarianceBDT: 30.00,
    vector1Status: 'LOGISTICS_RETURN_VARIANCE_ERROR',
    vector2RetentionGap: true,
    vector3GhostException: true,
    vector3Recommendation: 'Debit block enforced. Courier charged return fee for physical parcel missing from floor.',
    notes: 'VECTOR 3 GHOST RETURN: Courier settlement claimed return fee BDT 90.00 with zero warehouse gate scan!'
  },
  {
    id: 'ret-a-04',
    traceId: 'TR-RET-204',
    orderId: 'ORD-2004',
    track: 'Track A Enterprise',
    originType: 'API_CHECKOUT_WEBHOOK',
    originDetail: 'Cryptographic TraceID printed on thermal label at Dhaka Central Fulfillment',
    customerName: 'Farhana Akter',
    customerPhone: '01922338877',
    courierPartner: 'Pathao Courier',
    parcelValueBDT: 4100,
    forwardFeeBDT: 80,
    returnFeeBDT: 60,
    contractReturnFeeBDT: 60,
    returnChargeReconStatus: 'VALIDATED_MATCH',
    returnChargeReconNote: 'RECONCILED CLEAN: Physical check-in verified at Bay 1. Courier return fee BDT 60.00 matches contracted SLA cap (BDT 60.00). Approved for settlement.',
    returnReason: 'Customer requested order exchange for larger size',
    dispatchedDate: '2026-09-01',
    dispatchTimestamp: '2026-09-01 11:20:00',
    returnInitiatedDate: '2026-09-05',
    scannedAtWarehouse: true,
    scanTimestamp: '2026-09-07 11:22:15',
    scannedBay: 'Warehouse Intake Bay 1',
    warehouseId: 'WH-DHK-TEJGAON-01',
    operatorId: 'OP-8821-RAHMAN',
    status: 'RESTOCKED_IN_INVENTORY',
    barcodeTag: 'PTH-RET-2004-DH',
    courierReportedStatus: 'RETURNED',
    deltaDaysInTransit: 6,
    vector1OverchargeVarianceBDT: 0.00,
    vector1Status: 'VALID',
    vector2RetentionGap: false,
    vector3GhostException: false,
    notes: 'QC passed, tags verified, physical barcode scan logged, inventory balance incremented.'
  },
  {
    id: 'ret-a-05',
    traceId: 'TR-RET-205',
    orderId: 'ORD-2005',
    track: 'Track A Enterprise',
    originType: 'API_CHECKOUT_WEBHOOK',
    originDetail: 'Cryptographic TraceID injected into Steadfast API payload during checkout',
    customerName: 'Nusrat Jahan',
    customerPhone: '01711998877',
    courierPartner: 'Steadfast',
    parcelValueBDT: 2750,
    forwardFeeBDT: 130,
    returnFeeBDT: 60, // Exactly matches contractual base fee BDT 60.00
    contractReturnFeeBDT: 60,
    returnChargeReconStatus: 'VALIDATED_MATCH',
    returnChargeReconNote: 'MATCHED RETURN FEE: Steadfast reverse fee BDT 60.00 matches contracted rate. Parcel in standard return transit window (3 days).',
    returnReason: 'Customer requested size exchange (Medium to Large)',
    dispatchedDate: '2026-09-04',
    dispatchTimestamp: '2026-09-04 11:15:00',
    returnInitiatedDate: '2026-09-06',
    scannedAtWarehouse: false,
    status: 'RETURN_IN_TRANSIT',
    barcodeTag: 'TR-RET-205',
    courierReportedStatus: 'IN_TRANSIT',
    deltaDaysInTransit: 3,
    vector1OverchargeVarianceBDT: 0.00,
    vector1Status: 'VALID',
    vector2RetentionGap: false,
    vector3GhostException: false,
    notes: 'MATCHED RETURN FEE: BDT 60.00 deduction matches contract rate. Legitimate in-transit exchange within 3-day SLA.'
  },
  {
    id: 'ret-a-06',
    traceId: 'TR-RET-206',
    orderId: 'ORD-2006',
    track: 'Track A Enterprise',
    originType: 'API_CHECKOUT_WEBHOOK',
    originDetail: 'Cryptographic TraceID printed on thermal label at Dhaka Central Fulfillment',
    customerName: 'Kazi Shafiul',
    customerPhone: '01844556677',
    courierPartner: 'Pathao Courier',
    parcelValueBDT: 3800,
    forwardFeeBDT: 80,
    returnFeeBDT: 60, // Exactly matches contractual base fee BDT 60.00
    contractReturnFeeBDT: 60,
    returnChargeReconStatus: 'VALIDATED_MATCH',
    returnChargeReconNote: 'RECONCILED CLEAN: Physical check-in verified at Bay 2. Return fee BDT 60.00 strictly matches contract cap (BDT 60.00).',
    returnReason: 'Customer cancelled: Order arrived after planned anniversary event',
    dispatchedDate: '2026-09-01',
    dispatchTimestamp: '2026-09-01 10:00:00',
    returnInitiatedDate: '2026-09-04',
    scannedAtWarehouse: true,
    scanTimestamp: '2026-09-06 14:10:00',
    scannedBay: 'Warehouse Intake Bay 2',
    warehouseId: 'WH-DHK-TEJGAON-01',
    operatorId: 'OP-8821-RAHMAN',
    status: 'RESTOCKED_IN_INVENTORY',
    barcodeTag: 'PTH-RET-2006-DH',
    courierReportedStatus: 'RETURNED',
    deltaDaysInTransit: 5,
    vector1OverchargeVarianceBDT: 0.00,
    vector1Status: 'VALID',
    vector2RetentionGap: false,
    vector3GhostException: false,
    notes: 'Physical scan logged, inventory balance restocked. Return fee BDT 60.00 validated clean.'
  },

  // Track B SME F-Commerce Returns (Origin: IMAP_EMAIL_LISTENER)
  {
    id: 'ret-b-01',
    traceId: 'TR-SME-RET-01',
    orderId: 'FB-ORD-5503',
    track: 'Track B SME',
    originType: 'IMAP_EMAIL_LISTENER',
    originDetail: 'Transaction token extracted via IMAP listener & mapped to RedX booking reference',
    customerName: 'Rafiqul Islam',
    customerPhone: '01811223344',
    courierPartner: 'RedX',
    parcelValueBDT: 2200,
    forwardFeeBDT: 150,
    returnFeeBDT: 90,
    contractReturnFeeBDT: 60,
    returnChargeReconStatus: 'GHOST_BLOCKED',
    returnChargeReconNote: 'GHOST RETURN: Linked with Track A Ghost Exception TR-RET-203. BDT 90.00 reverse deduction blocked pending physical floor scan.',
    disputeClaimReference: 'DISP-RDX-SME-01',
    returnReason: 'Cash on delivery buyer refused receipt without advance deposit',
    dispatchedDate: '2026-09-02',
    dispatchTimestamp: '2026-09-02 12:10:00',
    returnInitiatedDate: '2026-09-05',
    scannedAtWarehouse: false,
    status: 'RETURN_IN_TRANSIT',
    barcodeTag: 'TR-RET-203',
    courierReportedStatus: 'RETURNED',
    deltaDaysInTransit: 6,
    vector1OverchargeVarianceBDT: 30.00,
    vector1Status: 'LOGISTICS_RETURN_VARIANCE_ERROR',
    vector2RetentionGap: false,
    vector3GhostException: true,
    notes: 'Linked with Track A Ghost Exception TR-RET-203. Awaiting physical gate check-in.'
  },
  {
    id: 'ret-b-02',
    traceId: 'TR-SME-RET-02',
    orderId: 'FB-ORD-5488',
    track: 'Track B SME',
    originType: 'IMAP_EMAIL_LISTENER',
    originDetail: 'IMAP token mapped into Steadfast booking payload by automated broker',
    customerName: 'Tania Sultana',
    customerPhone: '01688112299',
    courierPartner: 'Steadfast',
    parcelValueBDT: 1450,
    forwardFeeBDT: 130,
    returnFeeBDT: 65,
    contractReturnFeeBDT: 60,
    returnChargeReconStatus: 'CHARGE_OVERBILLED',
    returnChargeReconNote: 'OVERCHARGE DETECTED: Steadfast billed BDT 65.00 vs BDT 60.00 base cap. BDT 5.00 variance flagged.',
    disputeClaimReference: 'DISP-STF-SME-02',
    returnReason: 'Messenger inbox buyer requested cancellation 2 hours after courier pickup',
    dispatchedDate: '2026-09-04',
    dispatchTimestamp: '2026-09-04 15:30:00',
    returnInitiatedDate: '2026-09-06',
    scannedAtWarehouse: false,
    status: 'RETURN_IN_TRANSIT',
    barcodeTag: 'STF-RET-5488-DHK',
    courierReportedStatus: 'IN_TRANSIT',
    deltaDaysInTransit: 4,
    vector1OverchargeVarianceBDT: 5.00,
    vector1Status: 'LOGISTICS_RETURN_VARIANCE_ERROR',
    vector2RetentionGap: false,
    vector3GhostException: false,
    notes: 'Steadfast driver returning parcel to Dhanmondi hub. Within normal SLA.'
  },
  {
    id: 'ret-b-03',
    traceId: 'TR-SME-RET-03',
    orderId: 'FB-ORD-5412',
    track: 'Track B SME',
    originType: 'IMAP_EMAIL_LISTENER',
    originDetail: 'Transaction token mapped into Pathao courier booking payload',
    customerName: 'Zahid Hassan',
    customerPhone: '01799220011',
    courierPartner: 'Pathao Courier',
    parcelValueBDT: 2800,
    forwardFeeBDT: 80,
    returnFeeBDT: 60,
    contractReturnFeeBDT: 60,
    returnChargeReconStatus: 'VALIDATED_MATCH',
    returnChargeReconNote: 'RECONCILED CLEAN: Package verified at Gate-Keeper terminal Bay 4. Return charge BDT 60.00 matches agreed rate. Stock restored.',
    returnReason: 'Wrong shipping address provided in Facebook comment section',
    dispatchedDate: '2026-09-03',
    dispatchTimestamp: '2026-09-03 09:40:00',
    returnInitiatedDate: '2026-09-06',
    scannedAtWarehouse: true,
    scanTimestamp: '2026-09-08 09:14:02',
    scannedBay: 'Warehouse Intake Bay 4',
    warehouseId: 'WH-SME-DHANMONDI-02',
    operatorId: 'OP-4102-KABIR',
    status: 'RETURN_RECEIVED_IN_WAREHOUSE',
    barcodeTag: 'PTH-RET-5412-RNG',
    courierReportedStatus: 'RETURNED',
    deltaDaysInTransit: 5,
    vector1OverchargeVarianceBDT: 0.00,
    vector1Status: 'VALID',
    vector2RetentionGap: false,
    vector3GhostException: false,
    notes: 'Package verified at Gate-Keeper terminal. Ready for restock.'
  },
  {
    id: 'ret-b-04',
    traceId: 'TR-SME-RET-04',
    orderId: 'FB-ORD-5610',
    track: 'Track B SME',
    originType: 'IMAP_EMAIL_LISTENER',
    originDetail: 'Transaction token extracted via IMAP listener & mapped to Pathao booking reference',
    customerName: 'Shamima Nasrin',
    customerPhone: '01511224466',
    courierPartner: 'Pathao Courier',
    parcelValueBDT: 1950,
    forwardFeeBDT: 80,
    returnFeeBDT: 60, // Matches contract base rate BDT 60.00
    contractReturnFeeBDT: 60,
    returnChargeReconStatus: 'VALIDATED_MATCH',
    returnChargeReconNote: 'MATCHED RETURN FEE: Pathao return charge BDT 60.00 complies with standard base agreement. In-transit within 2-day delivery SLA.',
    returnReason: 'Customer rejected order at doorstep due to change of mind',
    dispatchedDate: '2026-09-05',
    dispatchTimestamp: '2026-09-05 13:00:00',
    returnInitiatedDate: '2026-09-07',
    scannedAtWarehouse: false,
    status: 'RETURN_IN_TRANSIT',
    barcodeTag: 'TR-SME-RET-04',
    courierReportedStatus: 'IN_TRANSIT',
    deltaDaysInTransit: 2,
    vector1OverchargeVarianceBDT: 0.00,
    vector1Status: 'VALID',
    vector2RetentionGap: false,
    vector3GhostException: false,
    notes: 'MATCHED RETURN FEE: BDT 60.00 deduction matches contract. Legitimate return in transit.'
  },
  {
    id: 'ret-b-05',
    traceId: 'TR-SME-RET-05',
    orderId: 'FB-ORD-5632',
    track: 'Track B SME',
    originType: 'IMAP_EMAIL_LISTENER',
    originDetail: 'IMAP token mapped into Steadfast booking payload by automated broker',
    customerName: 'Arifur Rahman',
    customerPhone: '01988776655',
    courierPartner: 'Steadfast',
    parcelValueBDT: 3100,
    forwardFeeBDT: 130,
    returnFeeBDT: 60, // Matches contract base rate BDT 60.00
    contractReturnFeeBDT: 60,
    returnChargeReconStatus: 'VALIDATED_MATCH',
    returnChargeReconNote: 'RECONCILED CLEAN: Package verified at Gate-Keeper terminal Bay 1. Return fee BDT 60.00 matches contract cap. Stock restored.',
    returnReason: 'Customer phone switched off during delivery attempt',
    dispatchedDate: '2026-09-02',
    dispatchTimestamp: '2026-09-02 15:20:00',
    returnInitiatedDate: '2026-09-05',
    scannedAtWarehouse: true,
    scanTimestamp: '2026-09-07 16:30:00',
    scannedBay: 'Warehouse Intake Bay 1',
    warehouseId: 'WH-SME-DHANMONDI-02',
    operatorId: 'OP-4102-KABIR',
    status: 'RETURN_RECEIVED_IN_WAREHOUSE',
    barcodeTag: 'STF-RET-5632-DHK',
    courierReportedStatus: 'RETURNED',
    deltaDaysInTransit: 5,
    vector1OverchargeVarianceBDT: 0.00,
    vector1Status: 'VALID',
    vector2RetentionGap: false,
    vector3GhostException: false,
    notes: 'Steadfast return checked-in at gate. Return fee BDT 60.00 matches agreed rate.'
  }
];

export const INITIAL_SHADOW_DB_TELEMETRY: ShadowDbTelemetry = {
  primaryMaster: {
    host: 'db-primary-master.asia-east1.gcp.internal',
    cpuLoadPercent: 0.8,
    activeCheckouts: 247,
    iops: 42,
    status: 'ONLINE_OPTIMAL'
  },
  shadowReadReplica: {
    host: 'db-shadow-replica-01.asia-east1.gcp.internal',
    cpuLoadPercent: 14.2,
    replicationLagMs: 16,
    auditQueriesExecuted: 12450,
    status: 'ACTIVE_READ_REPLICA'
  },
  retentionWindowDays: 180,
  totalLedgerRows: 148520,
  oldestRecordDate: '2026-03-12',
  nextPurgeScheduled: '00:01:00 AM Local Time'
};

import { MonthlySettlementMetric } from '../types';

export const INITIAL_MONTHLY_SETTLEMENT_METRICS: MonthlySettlementMetric[] = [
  {
    periodKey: '2026-09',
    displayMonth: 'Sep 2026 (MTD)',
    shortLabel: 'Sep 26',
    totalTransactionsBDT: 41790000,
    totalOrderCount: 12600,
    settlementSuccessRate: 98.4,
    balancedBDT: 41121360,
    balancedCount: 12398,
    balancedRatio: 98.4,
    underSettledBDT: 501480,
    underSettledCount: 151,
    underSettledRatio: 1.2,
    overSettledBDT: 167160,
    overSettledCount: 51,
    overSettledRatio: 0.4,
    underSettledReasons: {
      courierRiderHoldingBDT: 312000,
      feeSlaOverchargeBDT: 129480,
      ghostDebitsBlockedBDT: 60000
    },
    overSettledReasons: {
      duplicateMfsCreditsBDT: 112000,
      promotionalRebatesBDT: 55160
    },
    settlementBatchesCount: 18,
    bankSettlementLineBDT: 41121360,
    reconciliationAuditChecksum: 'SHA256-SEP26-MTD-9981X'
  },
  {
    periodKey: '2026-08',
    displayMonth: 'August 2026',
    shortLabel: 'Aug 26',
    totalTransactionsBDT: 158580000,
    totalOrderCount: 47900,
    settlementSuccessRate: 97.9,
    balancedBDT: 155249820,
    balancedCount: 46894,
    balancedRatio: 97.9,
    underSettledBDT: 2537280,
    underSettledCount: 766,
    underSettledRatio: 1.6,
    overSettledBDT: 792900,
    overSettledCount: 240,
    overSettledRatio: 0.5,
    underSettledReasons: {
      courierRiderHoldingBDT: 1480000,
      feeSlaOverchargeBDT: 720280,
      ghostDebitsBlockedBDT: 337000
    },
    overSettledReasons: {
      duplicateMfsCreditsBDT: 490000,
      promotionalRebatesBDT: 302900
    },
    settlementBatchesCount: 62,
    bankSettlementLineBDT: 155249820,
    reconciliationAuditChecksum: 'SHA256-AUG26-FINAL-8812A'
  },
  {
    periodKey: '2026-07',
    displayMonth: 'July 2026',
    shortLabel: 'Jul 26',
    totalTransactionsBDT: 148640000,
    totalOrderCount: 45100,
    settlementSuccessRate: 97.6,
    balancedBDT: 145072640,
    balancedCount: 44017,
    balancedRatio: 97.6,
    underSettledBDT: 2675520,
    underSettledCount: 812,
    underSettledRatio: 1.8,
    overSettledBDT: 891840,
    overSettledCount: 271,
    overSettledRatio: 0.6,
    underSettledReasons: {
      courierRiderHoldingBDT: 1590000,
      feeSlaOverchargeBDT: 790520,
      ghostDebitsBlockedBDT: 295000
    },
    overSettledReasons: {
      duplicateMfsCreditsBDT: 560000,
      promotionalRebatesBDT: 331840
    },
    settlementBatchesCount: 58,
    bankSettlementLineBDT: 145072640,
    reconciliationAuditChecksum: 'SHA256-JUL26-FINAL-7741C'
  },
  {
    periodKey: '2026-06',
    displayMonth: 'June 2026',
    shortLabel: 'Jun 26',
    totalTransactionsBDT: 139750000,
    totalOrderCount: 42800,
    settlementSuccessRate: 97.2,
    balancedBDT: 135837000,
    balancedCount: 41601,
    balancedRatio: 97.2,
    underSettledBDT: 3074500,
    underSettledCount: 942,
    underSettledRatio: 2.2,
    overSettledBDT: 838500,
    overSettledCount: 257,
    overSettledRatio: 0.6,
    underSettledReasons: {
      courierRiderHoldingBDT: 1810000,
      feeSlaOverchargeBDT: 880500,
      ghostDebitsBlockedBDT: 384000
    },
    overSettledReasons: {
      duplicateMfsCreditsBDT: 510000,
      promotionalRebatesBDT: 328500
    },
    settlementBatchesCount: 54,
    bankSettlementLineBDT: 135837000,
    reconciliationAuditChecksum: 'SHA256-JUN26-FINAL-6623D'
  },
  {
    periodKey: '2026-05',
    displayMonth: 'May 2026',
    shortLabel: 'May 26',
    totalTransactionsBDT: 133020000,
    totalOrderCount: 40500,
    settlementSuccessRate: 96.8,
    balancedBDT: 128763360,
    balancedCount: 39204,
    balancedRatio: 96.8,
    underSettledBDT: 3325500,
    underSettledCount: 1012,
    underSettledRatio: 2.5,
    overSettledBDT: 931140,
    overSettledCount: 284,
    overSettledRatio: 0.7,
    underSettledReasons: {
      courierRiderHoldingBDT: 1980000,
      feeSlaOverchargeBDT: 910500,
      ghostDebitsBlockedBDT: 435000
    },
    overSettledReasons: {
      duplicateMfsCreditsBDT: 580000,
      promotionalRebatesBDT: 351140
    },
    settlementBatchesCount: 52,
    bankSettlementLineBDT: 128763360,
    reconciliationAuditChecksum: 'SHA256-MAY26-FINAL-5519E'
  },
  {
    periodKey: '2026-04',
    displayMonth: 'April 2026',
    shortLabel: 'Apr 26',
    totalTransactionsBDT: 125540000,
    totalOrderCount: 38200,
    settlementSuccessRate: 96.3,
    balancedBDT: 120895020,
    balancedCount: 36786,
    balancedRatio: 96.3,
    underSettledBDT: 3766200,
    underSettledCount: 1146,
    underSettledRatio: 3.0,
    overSettledBDT: 878780,
    overSettledCount: 268,
    overSettledRatio: 0.7,
    underSettledReasons: {
      courierRiderHoldingBDT: 2240000,
      feeSlaOverchargeBDT: 980200,
      ghostDebitsBlockedBDT: 546000
    },
    overSettledReasons: {
      duplicateMfsCreditsBDT: 520000,
      promotionalRebatesBDT: 358780
    },
    settlementBatchesCount: 48,
    bankSettlementLineBDT: 120895020,
    reconciliationAuditChecksum: 'SHA256-APR26-FINAL-4402F'
  }
];




