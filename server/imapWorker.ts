import { insertImapStaging, ImapStagingRecord } from './db';

export interface RawEmailPayload {
  sender: string;
  subject: string;
  body: string;
  receivedAt?: string;
}

export interface ParsedMfsData {
  provider: 'bKash Merchant' | 'Nagad Merchant';
  trxId: string;
  amount: number;
  senderMobile: string;
  timestamp: string;
  isValid: boolean;
}

/**
 * Robust regex parser for bKash and Nagad notification emails / SMS alerts
 */
export function parseMfsNotificationEmail(payload: RawEmailPayload): ParsedMfsData | null {
  const { sender, subject, body } = payload;
  const combinedText = `${subject} \n ${body}`;

  // Identify provider
  const isNagad = /nagad/i.test(sender) || /nagad/i.test(subject) || /nagad/i.test(body);
  const isBkash = /bkash/i.test(sender) || /bkash/i.test(subject) || /bkash/i.test(body);

  if (!isNagad && !isBkash) {
    return null;
  }

  const provider: 'bKash Merchant' | 'Nagad Merchant' = isNagad ? 'Nagad Merchant' : 'bKash Merchant';

  // Extract TrxID
  // bKash: TrxID: BLM9A2K4X7 or Transaction ID 8N7A2B11
  // Nagad: TrxID: 72890142 or Nagad Txn ID: 72890142
  const trxMatch = combinedText.match(/(?:TrxID|Transaction\s*ID|Txn\s*ID|Trx\s*Id|Trx)[:\s]*([A-Za-z0-9]{8,14})/i)
    || combinedText.match(/\b([A-Z0-9]{8,12})\b/);
  const trxId = trxMatch ? trxMatch[1].toUpperCase() : `TRX-${Date.now().toString(36).toUpperCase()}`;

  // Extract Amount: Tk 1,200.00 or BDT 1,200 or Amount: 1200
  const amountMatch = combinedText.match(/(?:Tk|BDT|Amount|Taka)[\s.:]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/i)
    || combinedText.match(/(?:received|collected|paid)[\s.:]*Tk[\s.:]*([0-9,.]+)/i);
  
  let amount = 0;
  if (amountMatch) {
    const rawAmt = amountMatch[1].replace(/,/g, '');
    amount = parseFloat(rawAmt) || 0;
  }

  // Extract Sender Mobile: 01711XXXXXX, 01XXXXXXXXX
  const mobileMatch = combinedText.match(/(?:from|customer|sender|mobile|MSISDN)[:\s]*(01[3-9]\d{2}[-*]?\d{3}[-*]?\d{3})/i)
    || combinedText.match(/\b(01[3-9]\d{8})\b/);
  const senderMobile = mobileMatch ? mobileMatch[1].replace(/[-*]/g, '') : '01711000000';

  const timestamp = payload.receivedAt || new Date().toISOString().replace('T', ' ').substring(0, 19);

  return {
    provider,
    trxId,
    amount,
    senderMobile,
    timestamp,
    isValid: amount > 0 && trxId.length >= 6
  };
}

/**
 * Processes incoming email payload and inserts it directly into the IMAP staging table
 */
export async function ingestEmailWebhook(payload: RawEmailPayload): Promise<ImapStagingRecord | null> {
  const parsed = parseMfsNotificationEmail(payload);
  if (!parsed || !parsed.isValid) {
    return null;
  }

  const record: ImapStagingRecord = {
    id: `em-in-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    receivedAt: parsed.timestamp,
    senderAddress: payload.sender,
    subject: payload.subject,
    provider: parsed.provider,
    trxId: parsed.trxId,
    senderMobile: parsed.senderMobile,
    amount: parsed.amount,
    status: 'RAW_INGESTED',
    rawBody: payload.body
  };

  await insertImapStaging(record);
  return record;
}
