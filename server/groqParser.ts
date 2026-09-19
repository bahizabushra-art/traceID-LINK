import { GoogleGenAI } from '@google/genai';

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
  rawMessage?: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are a financial reconciliation AI system specialized in Bangladeshi e-commerce statements (bKash, Nagad, Rocket, Upay, Pathao, Steadfast, RedX, Paperfly, and local Bank statements).
Your job is to read messy, unformatted, corrupted, or non-standard CSV / text data and structure it into clean, standardized tabular records.

The input data may have:
- Metadata preambles (e.g., "Report Date: ...", "Merchant Name: ...", "Batch #1049")
- Trailing summary footers (e.g., "Total count: ...", "Authorized by: ...")
- Non-standard headers (e.g., "Trx ID", "bKash Trx", "Invoice No", "Consignment Code", "Collected Tk", "Total Cost", "Delivery Paid")
- Commas inside unquoted currency values (e.g. "1,450.00 BDT")
- Missing fields or mixed order

You must extract each genuine transaction row and return a strictly valid JSON object matching this schema:
{
  "detectedType": "MFS" | "COURIER" | "BANK",
  "detectedFormat": "bKash Merchant Statement" | "Nagad Gateway" | "Pathao Courier Remittance" | "Steadfast Courier Settlement" | "RedX Logistics" | "Bank Statement" | "Custom CSV",
  "records": [
    {
      "orderId": "string (order/invoice reference like FB-ORD-7001 or ORD-102)",
      "trxId": "string (transaction hash or consignment code)",
      "customerName": "string (customer name if present or 'Customer')",
      "customerPhone": "string (phone number if present)",
      "date": "YYYY-MM-DD or string",
      "grossAmount": 0, // gross order or collection value as number
      "mfsCredit": 0, // advance amount credited through MFS as number
      "codCollected": 0, // cash on delivery collected by courier as number
      "deliveryFee": 0, // freight delivery charge as number
      "codFee": 0, // 1% COD commission fee as number
      "remittedAmount": 0, // final net payout remitted by courier or bank
      "statusNote": "string (e.g. 'Delivered', 'Prepaid', 'COD remitted', etc.)"
    }
  ]
}

DO NOT include markdown fences, preambles, or conversational commentary. Return ONLY the raw JSON object.`;

/**
 * Parses and structures messy CSV text using Groq LLM (with Gemini and heuristic fallbacks)
 */
export async function structureCsvWithGroq(
  rawCsv: string,
  fileType: 'mfs' | 'courier' | 'bank' | 'auto' = 'auto',
  fileName: string = 'uploaded_data.csv'
): Promise<GroqStructureResponse> {
  const startTime = Date.now();

  if (!rawCsv || !rawCsv.trim()) {
    return {
      success: false,
      engineUsed: 'INTELLIGENT_HEURISTIC_PARSER',
      modelName: 'None',
      detectedType: 'UNKNOWN',
      detectedFormat: 'Empty file',
      processingTimeMs: 0,
      records: [],
      summary: {
        totalRecords: 0,
        totalGrossBDT: 0,
        totalMfsCreditBDT: 0,
        totalCodCollectedBDT: 0,
        totalDeliveryFeeBDT: 0,
        totalRemittedBDT: 0
      },
      error: 'CSV content is empty'
    };
  }

  // 1. Try Groq API if GROQ_API_KEY is available
  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  if (groqApiKey) {
    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Input File Name: ${fileName}\nExpected File Category Hint: ${fileType}\n\nRaw CSV Data:\n${rawCsv.slice(0, 18000)}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 4000
        })
      });

      if (groqResponse.ok) {
        const groqData = await groqResponse.json();
        const contentStr = groqData.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = JSON.parse(contentStr);
          const records: StructuredRecord[] = Array.isArray(parsed.records) ? parsed.records : [];
          const summary = calculateSummary(records);

          return {
            success: true,
            engineUsed: 'GROQ_LLAMA_3.3_70B',
            modelName: 'llama-3.3-70b-versatile',
            detectedType: parsed.detectedType || (fileType === 'mfs' ? 'MFS' : 'COURIER'),
            detectedFormat: parsed.detectedFormat || 'Groq Normalized Statement',
            processingTimeMs: Date.now() - startTime,
            records,
            summary
          };
        }
      } else {
        const errText = await groqResponse.text();
        console.warn(`[Groq API Warning] Status ${groqResponse.status}: ${errText.slice(0, 200)}`);
      }
    } catch (groqErr: any) {
      console.warn('[Groq API Error] Encountered error, evaluating fallback:', groqErr?.message);
    }
  }

  // 2. Fallback to Gemini 2.5 Flash if GEMINI_API_KEY is available
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const prompt = `${SYSTEM_PROMPT}\n\nFile Name: ${fileName}\nHint: ${fileType}\n\nRaw Data:\n${rawCsv.slice(0, 18000)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        const records: StructuredRecord[] = Array.isArray(parsed.records) ? parsed.records : [];
        const summary = calculateSummary(records);

        return {
          success: true,
          engineUsed: 'GEMINI_2.5_FLASH',
          modelName: 'gemini-2.5-flash',
          detectedType: parsed.detectedType || (fileType === 'mfs' ? 'MFS' : 'COURIER'),
          detectedFormat: parsed.detectedFormat || 'AI Standardized Schema',
          processingTimeMs: Date.now() - startTime,
          records,
          summary
        };
      }
    } catch (geminiErr: any) {
      console.warn('[Gemini Fallback Warning]:', geminiErr?.message);
    }
  }

  // 3. Fallback to High-Grade Intelligent Heuristic Tabular Parser
  const heuristicResult = heuristicParseMessyCsv(rawCsv, fileType, fileName);
  return {
    ...heuristicResult,
    processingTimeMs: Date.now() - startTime
  };
}

/**
 * Computes arithmetic summary from structured records
 */
function calculateSummary(records: StructuredRecord[]) {
  return records.reduce(
    (acc, r) => {
      acc.totalRecords += 1;
      acc.totalGrossBDT += Number(r.grossAmount) || 0;
      acc.totalMfsCreditBDT += Number(r.mfsCredit) || 0;
      acc.totalCodCollectedBDT += Number(r.codCollected) || 0;
      acc.totalDeliveryFeeBDT += Number(r.deliveryFee) || 0;
      acc.totalRemittedBDT += Number(r.remittedAmount) || 0;
      return acc;
    },
    {
      totalRecords: 0,
      totalGrossBDT: 0,
      totalMfsCreditBDT: 0,
      totalCodCollectedBDT: 0,
      totalDeliveryFeeBDT: 0,
      totalRemittedBDT: 0
    }
  );
}

/**
 * Resilient Heuristic Parser for Messy Tabular CSVs (handles preambles, footers, dirty commas)
 */
function heuristicParseMessyCsv(
  rawCsv: string,
  fileType: 'mfs' | 'courier' | 'bank' | 'auto',
  fileName: string
): Omit<GroqStructureResponse, 'processingTimeMs'> {
  const allLines = rawCsv.split(/\r?\n/).map(l => l.trim());

  // Find the header line: the line with the highest count of recognizable column names
  const knownKeywords = [
    'order', 'invoice', 'trx', 'consignment', 'amount', 'gross', 'net',
    'customer', 'phone', 'fee', 'charge', 'cod', 'remit', 'status', 'date'
  ];

  let headerIndex = -1;
  let maxKeywordMatches = 0;

  for (let i = 0; i < Math.min(allLines.length, 25); i++) {
    const lineLower = allLines[i].toLowerCase();
    let matches = 0;
    knownKeywords.forEach(k => {
      if (lineLower.includes(k)) matches++;
    });
    if (matches > maxKeywordMatches && matches >= 2) {
      maxKeywordMatches = matches;
      headerIndex = i;
    }
  }

  if (headerIndex === -1) headerIndex = 0;

  const headerRow = splitRow(allLines[headerIndex]);
  const records: StructuredRecord[] = [];

  for (let i = headerIndex + 1; i < allLines.length; i++) {
    const line = allLines[i];
    if (!line || line.startsWith('#') || line.toLowerCase().includes('total') || line.toLowerCase().includes('authorized by')) {
      continue;
    }

    const cells = splitRow(line);
    if (cells.length < 2) continue;

    const rowObj: Record<string, string> = {};
    headerRow.forEach((col, idx) => {
      const cleanCol = col.toLowerCase().replace(/[^a-z0-9]/g, '');
      rowObj[cleanCol] = cells[idx] || '';
    });

    // Extract fields using fuzzy matches
    const orderId = findValue(rowObj, ['orderid', 'order', 'invoiceno', 'invoice', 'ref', 'customerorder']) || `ORD-${7000 + i}`;
    const trxId = findValue(rowObj, ['trxid', 'trx', 'transactionid', 'txnid', 'consignmentid', 'consignment', 'trackingid']) || `TRX-${i}`;
    const customerName = findValue(rowObj, ['customername', 'customer', 'name', 'recipient', 'client']) || 'Merchant Customer';
    const customerPhone = findValue(rowObj, ['customerphone', 'phone', 'mobile', 'contact']) || '01700000000';
    const date = findValue(rowObj, ['date', 'datetime', 'time', 'createdat']) || new Date().toISOString().slice(0, 10);

    const grossAmount = parseCurrency(findValue(rowObj, ['grossamountbdt', 'grossamount', 'gross', 'totalamount', 'amount', 'itemtotal']));
    const mfsCredit = parseCurrency(findValue(rowObj, ['netcreditbdt', 'mfscredit', 'mfsfee', 'credited', 'mfsamount']));
    const codCollected = parseCurrency(findValue(rowObj, ['codcollectedbdt', 'codcollected', 'cod', 'codamount', 'collectedbdt']));
    const deliveryFee = parseCurrency(findValue(rowObj, ['deliveryfeebdt', 'deliveryfee', 'freight', 'deliverycharge', 'fee'])) || 90;
    const codFee = parseCurrency(findValue(rowObj, ['codfee', 'codcommission', 'codfeebdt'])) || 0;
    const remittedAmount = parseCurrency(findValue(rowObj, ['remittedamountbdt', 'remittedamount', 'remitted', 'netpayable', 'settled'])) || 0;
    const statusNote = findValue(rowObj, ['status', 'deliverystatus', 'notes', 'remark']) || 'Processed';

    records.push({
      orderId: orderId.toUpperCase(),
      trxId: trxId.toUpperCase(),
      customerName,
      customerPhone,
      date,
      grossAmount,
      mfsCredit,
      codCollected,
      deliveryFee,
      codFee,
      remittedAmount,
      statusNote
    });
  }

  const detectedType = fileType !== 'auto'
    ? (fileType.toUpperCase() as 'MFS' | 'COURIER' | 'BANK')
    : fileName.toLowerCase().includes('bkash') || fileName.toLowerCase().includes('nagad')
    ? 'MFS'
    : 'COURIER';

  return {
    success: true,
    engineUsed: 'INTELLIGENT_HEURISTIC_PARSER',
    modelName: 'Deterministic Tabular Regex Heuristics',
    detectedType,
    detectedFormat: `${detectedType} (Heuristically Structured)`,
    records,
    summary: calculateSummary(records)
  };
}

function splitRow(row: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === '\t') && !inQuotes) {
      cells.push(current.trim().replace(/^"+|"+$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim().replace(/^"+|"+$/g, ''));
  return cells;
}

function findValue(rowObj: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    if (rowObj[k] !== undefined && rowObj[k] !== '') {
      return rowObj[k];
    }
  }
  return '';
}

function parseCurrency(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
