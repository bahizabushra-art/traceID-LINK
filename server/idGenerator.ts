import crypto from 'crypto';

export type TrackingPointerType = 'PRE' | 'COD' | 'SPLIT' | 'FREE';

export interface TrackingPointerResult {
  traceId: string;
  type: TrackingPointerType;
  year: number;
  hash: string;
  checksum: string;
  invoiceRef: string;
  twinTraceId?: string; // For split-payments (Twin-Trace linking MFS advance + Courier COD)
}

/**
 * Generates unique cryptographic tracking pointers according to the FinTech specifications:
 * - TR-PRE-[YEAR]-[HASH] for 100% Pre-payment
 * - TR-COD-[HASH] for 100% Standard COD
 * - TR-SPLIT-[HASH] for Split-Payment (Twin-Trace linking MFS advance payment + Courier COD)
 * - TR-FREE-[HASH] for Free Delivery
 */
export function generateTrackingPointer(
  type: TrackingPointerType,
  seedData?: { orderId?: string; customerPhone?: string; amount?: number }
): TrackingPointerResult {
  const currentYear = new Date().getFullYear();
  
  // Seed cryptographic entropy with seedData if provided or random bytes
  const entropy = seedData 
    ? `${seedData.orderId || ''}:${seedData.customerPhone || ''}:${seedData.amount || ''}:${Date.now()}:${crypto.randomBytes(8).toString('hex')}`
    : `${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;

  const fullHash = crypto.createHash('sha256').update(entropy).digest('hex').toUpperCase();
  const shortHash = fullHash.substring(0, 6);
  const checksum = fullHash.substring(0, 16);

  let traceId = '';
  let twinTraceId: string | undefined = undefined;

  switch (type) {
    case 'PRE':
      traceId = `TR-PRE-${currentYear}-${shortHash}`;
      break;
    case 'COD':
      traceId = `TR-COD-${shortHash}`;
      break;
    case 'SPLIT': {
      traceId = `TR-SPLIT-${shortHash}`;
      const twinHash = crypto.createHash('sha256').update(`TWIN:${entropy}`).digest('hex').toUpperCase().substring(0, 6);
      twinTraceId = `TWIN-MFS-${shortHash}::COD-${twinHash}`;
      break;
    }
    case 'FREE':
      traceId = `TR-FREE-${shortHash}`;
      break;
    default:
      traceId = `TR-GEN-${shortHash}`;
  }

  const invoiceRef = `INV-${currentYear}-${shortHash}`;

  return {
    traceId,
    type,
    year: currentYear,
    hash: shortHash,
    checksum,
    invoiceRef,
    twinTraceId
  };
}
