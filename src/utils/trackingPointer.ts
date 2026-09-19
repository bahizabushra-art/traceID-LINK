export type TrackingType = '100% Pre-Paid' | '100% COD' | 'Split Advance Paid' | 'Free Shipping';

/**
 * Generates cryptographic tracking pointers according to FinTech specifications:
 * - TR-PRE-[YEAR]-[HASH] for 100% Pre-payment
 * - TR-COD-[HASH] for 100% Standard COD
 * - TR-SPLIT-[HASH] for Split-Payment (Twin-Trace linking MFS advance payment + Courier COD)
 * - TR-FREE-[HASH] for Free Delivery
 */
export function generateClientTrackingPointer(type: TrackingType | 'PRE' | 'COD' | 'SPLIT' | 'FREE'): {
  traceId: string;
  twinTraceId?: string;
  hash: string;
  year: number;
} {
  const year = new Date().getFullYear();
  // Generate random 6-character hex hash
  const randomArray = new Uint8Array(4);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomArray);
  } else {
    for (let i = 0; i < 4; i++) randomArray[i] = Math.floor(Math.random() * 256);
  }
  const hash = Array.from(randomArray).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase().substring(0, 6);

  if (type === '100% Pre-Paid' || type === 'PRE') {
    return {
      traceId: `TR-PRE-${year}-${hash}`,
      hash,
      year
    };
  }

  if (type === '100% COD' || type === 'COD') {
    return {
      traceId: `TR-COD-${hash}`,
      hash,
      year
    };
  }

  if (type === 'Split Advance Paid' || type === 'SPLIT') {
    const twinHash = Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      traceId: `TR-SPLIT-${hash}`,
      twinTraceId: `TWIN-MFS-${hash}::COD-${twinHash}`,
      hash,
      year
    };
  }

  // Free Shipping / FREE
  return {
    traceId: `TR-FREE-${hash}`,
    hash,
    year
  };
}
