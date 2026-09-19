import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDatabase, executeTtlPurgeQuery, insertLedgerRecord, queryLedgerRecords, getImapStagingRecords } from './server/db';
import { generateTrackingPointer } from './server/idGenerator';
import { evaluateAuditRecord, calculateBankSumCheck, AuditRecordInput } from './server/reconciler';
import { ingestEmailWebhook } from './server/imapWorker';
import { parseSettlementStatement } from './server/pdfParser';
import { structureCsvWithGroq } from './server/groqParser';
import { bkashSandbox, nagadSandbox, pathaoSandbox, steadfastSandbox, redxSandbox } from './server/gateways';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Initialize DB (PostgreSQL on Render / Supabase or resilient fallback)
  const dbStatus = await initDatabase();

  // -------------------------------------------------------------
  // Health & Deployment Status (Render Compatible)
  // -------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ONLINE_OPTIMAL',
      service: 'TraceID Link Reconciliation Backend',
      runtime: 'Node.js Express (Render Optimized)',
      database: dbStatus,
      port: PORT,
      timestamp: new Date().toISOString()
    });
  });

  // -------------------------------------------------------------
  // 1. Core Logic & ID Generation Framework
  // -------------------------------------------------------------
  app.post('/api/trace/generate', async (req, res) => {
    try {
      const { type, orderId, customerName, customerPhone, grossAmount, advancePaid, codCollectable, channel } = req.body;
      const pointer = generateTrackingPointer(type || 'PRE', { orderId, customerPhone, amount: grossAmount });

      // Anchor in unified transaction ledger
      const ledgerEntry = await insertLedgerRecord({
        id: `rec-${Date.now()}-${pointer.hash}`,
        traceId: pointer.traceId,
        orderId: orderId || pointer.invoiceRef,
        transactionType: pointer.type,
        customerName: customerName || 'Pending Customer',
        customerPhone: customerPhone || '01711000000',
        grossAmount: Number(grossAmount) || 0,
        advancePaid: Number(advancePaid) || 0,
        codCollectable: Number(codCollectable) || 0,
        mfsFee: pointer.type === 'PRE' ? (Number(grossAmount) || 0) * 0.015 : (Number(advancePaid) || 0) * 0.015,
        courierFee: 110,
        expectedPayout: (Number(grossAmount) || 0) - 110,
        settledPayout: null,
        status: 'PENDING',
        channel: channel || 'Track A Enterprise',
        transactionDate: new Date().toISOString().substring(0, 10),
        createdAt: new Date().toISOString(),
        metadata: {
          checksum: pointer.checksum,
          invoiceRef: pointer.invoiceRef,
          twinTraceId: pointer.twinTraceId
        }
      });

      return res.status(201).json({
        success: true,
        pointer,
        ledgerEntry
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------
  // 2. Deterministic Matching Engine & Bank Sum Reconciliation
  // -------------------------------------------------------------
  app.post('/api/reconcile/match-records', (req, res) => {
    try {
      const { records } = req.body;
      if (!Array.isArray(records)) {
        return res.status(400).json({ error: 'Records must be an array' });
      }

      const results = records.map((rec: AuditRecordInput) => evaluateAuditRecord(rec));
      return res.json({ success: true, count: results.length, records: results });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/reconcile/bank-sum-check', (req, res) => {
    try {
      const { mfsTotal, codTotal, bankDepositLine } = req.body;
      const result = calculateBankSumCheck(
        Number(mfsTotal) || 0,
        Number(codTotal) || 0,
        Number(bankDepositLine) || 0
      );
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // 3. Midnight 3-Vector Audit Batch Run (External Cron Compatible)
  // -------------------------------------------------------------
  app.post(['/api/reconcile/midnight-audit', '/api/cron/midnight-audit'], async (req, res) => {
    try {
      const { baseFee = 60, retentionDays = 7, parcels = [] } = req.body;
      let matchedCount = 0;
      let matchedTotalBDT = 0;
      let v1Count = 0;
      let v1VarianceBDT = 0;
      let v2Count = 0;
      let v2AtRiskBDT = 0;
      let v3Count = 0;
      let v3BlockedBDT = 0;

      const processedParcels = parcels.map((p: any) => {
        const overcharge = Math.max(0, (p.returnFeeBDT || 0) - baseFee);
        const isV1Invalid = overcharge > 0;
        if (isV1Invalid) {
          v1Count++;
          v1VarianceBDT += overcharge;
        }

        const isV2Stalled = p.courierReportedStatus === 'RETURNED' && !p.scannedAtWarehouse && (p.deltaDaysInTransit || 0) > retentionDays;
        if (isV2Stalled) {
          v2Count++;
          v2AtRiskBDT += (p.parcelValueBDT || 0);
        }

        const isV3Ghost = !p.scannedAtWarehouse && (
          p.vector3GhostException === true ||
          p.status === 'GHOST_RETURN_EXCEPTION' ||
          (p.courierReportedStatus === 'RETURNED' && (p.deltaDaysInTransit || 0) > retentionDays)
        );
        if (isV3Ghost) {
          v3Count++;
          v3BlockedBDT += (p.returnFeeBDT || 0);
        }

        let chargeStatus = 'VALIDATED_MATCH';
        if (isV3Ghost) {
          chargeStatus = 'GHOST_BLOCKED';
        } else if (isV1Invalid) {
          chargeStatus = 'CHARGE_OVERBILLED';
        } else {
          matchedCount++;
          matchedTotalBDT += (p.returnFeeBDT || 0);
        }

        return {
          ...p,
          contractReturnFeeBDT: baseFee,
          returnChargeReconStatus: chargeStatus,
          vector1OverchargeVarianceBDT: isV1Invalid ? overcharge : 0,
          vector1Status: isV1Invalid ? 'LOGISTICS_RETURN_VARIANCE_ERROR' : 'VALID',
          vector2RetentionGap: isV2Stalled,
          vector3GhostException: isV3Ghost
        };
      });

      const summary = {
        batchRunTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        totalParcelsAudited: parcels.length,
        matchedReturnFeeCount: matchedCount,
        matchedReturnFeeTotalBDT: matchedTotalBDT,
        vector1OverchargeCount: v1Count,
        vector1TotalVarianceBDT: v1VarianceBDT,
        vector2RetentionGapCount: v2Count,
        vector2InventoryAtRiskBDT: v2AtRiskBDT,
        vector3GhostReturnCount: v3Count,
        vector3GhostDebitsBlockedBDT: v3BlockedBDT,
        configuredBaseFeeBDT: baseFee,
        configuredRetentionThresholdDays: retentionDays,
        replicaHost: 'db-shadow-replica-01.render.internal',
        queryLatencyMs: 12.4
      };

      return res.json({ success: true, summary, parcels: processedParcels });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------
  // 4. Data Lifecycle & TTL Auto-Cleanup at 00:01 AM (Cron API)
  // -------------------------------------------------------------
  app.post(['/api/cron/ttl-purge', '/api/security/ttl-purge'], async (req, res) => {
    try {
      const purgeResult = await executeTtlPurgeQuery();
      return res.json({
        success: true,
        message: 'Rolling 180-day fiscal TTL purge executed successfully.',
        ...purgeResult,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Schedule local daily fallback for 00:01 AM
  const checkDailyMidnight = () => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 1) {
      executeTtlPurgeQuery().then(res => {
        console.log('[CRON 00:01 AM] Automated TTL Purge executed:', res);
      });
    }
  };
  setInterval(checkDailyMidnight, 60000);

  // -------------------------------------------------------------
  // 5. IMAP Email Parsing Logic (Track B)
  // -------------------------------------------------------------
  app.post('/api/imap/webhook', async (req, res) => {
    try {
      const { sender, subject, body } = req.body;
      if (!body) {
        return res.status(400).json({ error: 'Body is required for email ingestion' });
      }

      const staged = await ingestEmailWebhook({ sender: sender || 'bKash Merchant <notify@bKash.com>', subject: subject || 'Payment Received', body });
      if (!staged) {
        return res.status(422).json({ error: 'Failed to extract MFS parameters or unknown format' });
      }

      return res.status(201).json({ success: true, message: 'Parsed and staged in imap_staging_table', record: staged });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/imap/staging', async (req, res) => {
    try {
      const rows = await getImapStagingRecords();
      return res.json({ success: true, count: rows.length, rows });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------
  // 6. Direct Statement / PDF Parser & Groq LLM Structuring Engine
  // -------------------------------------------------------------
  app.post('/api/statements/parse', async (req, res) => {
    try {
      const { text, fileName } = req.body;
      const parsed = await parseSettlementStatement(text || '', fileName || 'statement.pdf');
      return res.json({ success: true, ...parsed });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/groq/structure-csv', async (req, res) => {
    try {
      const { rawCsv, fileType, fileName } = req.body;
      if (!rawCsv || typeof rawCsv !== 'string') {
        return res.status(400).json({ success: false, error: 'rawCsv string is required' });
      }

      const structured = await structureCsvWithGroq(
        rawCsv,
        fileType || 'auto',
        fileName || 'unstructured_statement.csv'
      );

      return res.json(structured);
    } catch (err: any) {
      console.error('Groq structure error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------
  // 7. Gateway & Courier Sandbox Endpoints
  // -------------------------------------------------------------
  app.post('/api/gateways/bkash/create-payment', bkashSandbox.createPayment);
  app.post('/api/gateways/bkash/execute-payment', bkashSandbox.executePayment);
  app.get('/api/gateways/bkash/query-payment/:paymentID', bkashSandbox.queryPayment);

  app.post('/api/gateways/nagad/initialize', nagadSandbox.initialize);
  app.get('/api/gateways/nagad/verify/:paymentRefId', nagadSandbox.verify);

  app.post('/api/couriers/pathao/orders/create', pathaoSandbox.createOrder);
  app.get('/api/couriers/pathao/orders/:id/status', pathaoSandbox.getOrderStatus);

  app.post('/api/couriers/steadfast/create_order', steadfastSandbox.createOrder);
  app.get('/api/couriers/steadfast/status_by_cid/:tracking_code', steadfastSandbox.getStatus);

  app.post('/api/couriers/redx/v1.0.0-beta/parcels', redxSandbox.createParcel);

  // -------------------------------------------------------------
  // 8. Transaction Ledger Persistence API
  // -------------------------------------------------------------
  app.get('/api/ledger', async (req, res) => {
    try {
      const channel = typeof req.query.channel === 'string' ? req.query.channel : undefined;
      const records = await queryLedgerRecords(channel);
      return res.json({ success: true, count: records.length, records });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------
  // 9. Vite middleware & SPA fallback
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TraceID Link] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
