import Papa from "papaparse";

export type CSVFormat =
  | "mpesa_till"
  | "mpesa_paybill"
  | "mpesa_statement"
  | "shopify"
  | "unknown";

export interface NormalizedTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "credit" | "debit";
  balance?: number;
  reference?: string;
  raw: Record<string, string>;
}

export interface ParseResult {
  format: CSVFormat;
  formatLabel: string;
  transactions: NormalizedTransaction[];
  rawRows: Record<string, string>[];
  headers: string[];
  totalRows: number;
  errors: string[];
}

// --- Format detection signatures ---

const MPESA_STATEMENT_KEYS = [
  "receipt no",
  "completion time",
  "details",
  "transaction status",
  "paid in",
  "withdrawn",
  "balance",
];

const MPESA_TILL_KEYS = [
  "initiation time",
  "completion time",
  "details",
  "transaction status",
  "paid in",
  "withdrawn",
  "balance",
];

const MPESA_PAYBILL_KEYS = [
  "account number",
  "receipt number",
  "date",
  "amount",
  "transaction type",
];

const SHOPIFY_KEYS = [
  "name",
  "email",
  "financial status",
  "paid at",
  "fulfillment status",
  "total",
];

function normalizeHeaders(headers: string[]): string[] {
  return headers.map((h) => h.toLowerCase().trim().replace(/[^a-z0-9 ]/g, ""));
}

function scoreMatch(normalized: string[], signature: string[]): number {
  let hits = 0;
  for (const key of signature) {
    if (normalized.some((h) => h.includes(key))) hits++;
  }
  return hits / signature.length;
}

export function detectFormat(headers: string[]): CSVFormat {
  const norm = normalizeHeaders(headers);

  const scores: Record<CSVFormat, number> = {
    mpesa_statement: scoreMatch(norm, MPESA_STATEMENT_KEYS),
    mpesa_till: scoreMatch(norm, MPESA_TILL_KEYS),
    mpesa_paybill: scoreMatch(norm, MPESA_PAYBILL_KEYS),
    shopify: scoreMatch(norm, SHOPIFY_KEYS),
    unknown: 0,
  };

  const best = (Object.entries(scores) as [CSVFormat, number][]).reduce(
    (a, b) => (b[1] > a[1] ? b : a)
  );

  return best[1] >= 0.5 ? best[0] : "unknown";
}

export function formatLabel(format: CSVFormat): string {
  const labels: Record<CSVFormat, string> = {
    mpesa_statement: "M-Pesa Statement",
    mpesa_till: "M-Pesa Till",
    mpesa_paybill: "M-Pesa Paybill",
    shopify: "Shopify Orders",
    unknown: "Unknown Format",
  };
  return labels[format];
}

// --- Normalizers per format ---

function parseKESAmount(val: string): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.\-]/g, "")) || 0;
}

function parseMpesaStatement(
  rows: Record<string, string>[],
  headers: string[]
): NormalizedTransaction[] {
  const norm = normalizeHeaders(headers);

  const getCol = (row: Record<string, string>, keyword: string): string => {
    const idx = norm.findIndex((h) => h.includes(keyword));
    if (idx === -1) return "";
    return row[headers[idx]] ?? "";
  };

  return rows
    .map((row, i) => {
      const paidIn = parseKESAmount(getCol(row, "paid in"));
      const withdrawn = parseKESAmount(getCol(row, "withdrawn"));
      const amount = paidIn > 0 ? paidIn : -withdrawn;
      const dateStr = getCol(row, "completion time") || getCol(row, "date");
      const date = dateStr ? new Date(dateStr) : new Date();

      return {
        id: getCol(row, "receipt") || `txn-${i}`,
        date: isNaN(date.getTime()) ? new Date() : date,
        description: getCol(row, "details"),
        amount,
        type: amount >= 0 ? ("credit" as const) : ("debit" as const),
        balance: parseKESAmount(getCol(row, "balance")) || undefined,
        reference: getCol(row, "receipt"),
        raw: row,
      };
    })
    .filter((t) => t.amount !== 0 || t.description);
}

function parseMpesaPaybill(
  rows: Record<string, string>[],
  headers: string[]
): NormalizedTransaction[] {
  const norm = normalizeHeaders(headers);

  const getCol = (row: Record<string, string>, keyword: string): string => {
    const idx = norm.findIndex((h) => h.includes(keyword));
    if (idx === -1) return "";
    return row[headers[idx]] ?? "";
  };

  return rows
    .map((row, i) => {
      const amount = parseKESAmount(getCol(row, "amount"));
      const txType = getCol(row, "transaction type").toLowerCase();
      const isDebit =
        txType.includes("debit") ||
        txType.includes("payment") ||
        txType.includes("withdraw");

      return {
        id: getCol(row, "receipt") || `txn-${i}`,
        date: new Date(getCol(row, "date") || Date.now()),
        description: getCol(row, "account") || getCol(row, "details"),
        amount: isDebit ? -amount : amount,
        type: isDebit ? ("debit" as const) : ("credit" as const),
        reference: getCol(row, "receipt"),
        raw: row,
      };
    })
    .filter((t) => t.amount !== 0);
}

function parseShopify(
  rows: Record<string, string>[],
  headers: string[]
): NormalizedTransaction[] {
  const norm = normalizeHeaders(headers);

  const getCol = (row: Record<string, string>, keyword: string): string => {
    const idx = norm.findIndex((h) => h.includes(keyword));
    if (idx === -1) return "";
    return row[headers[idx]] ?? "";
  };

  return rows
    .map((row, i) => {
      const total = parseKESAmount(getCol(row, "total"));
      const status = getCol(row, "financial status").toLowerCase();
      const isPaid = status === "paid" || status === "partially_paid";

      return {
        id: getCol(row, "name") || `order-${i}`,
        date: new Date(getCol(row, "paid at") || getCol(row, "created at") || Date.now()),
        description: `Order ${getCol(row, "name")} — ${getCol(row, "email")}`,
        amount: isPaid ? total : 0,
        type: "credit" as const,
        reference: getCol(row, "name"),
        raw: row,
      };
    })
    .filter((t) => t.description);
}

function parseGeneric(
  rows: Record<string, string>[],
  headers: string[]
): NormalizedTransaction[] {
  const norm = normalizeHeaders(headers);

  const getCol = (row: Record<string, string>, keyword: string): string => {
    const idx = norm.findIndex((h) => h.includes(keyword));
    if (idx === -1) return "";
    return row[headers[idx]] ?? "";
  };

  return rows.map((row, i) => {
    const amountRaw =
      getCol(row, "amount") ||
      getCol(row, "total") ||
      getCol(row, "value") ||
      "0";
    const amount = parseKESAmount(amountRaw);

    return {
      id: `row-${i}`,
      date: new Date(getCol(row, "date") || getCol(row, "time") || Date.now()),
      description:
        getCol(row, "description") ||
        getCol(row, "details") ||
        getCol(row, "narration") ||
        Object.values(row)[0] ||
        "",
      amount,
      type: amount >= 0 ? ("credit" as const) : ("debit" as const),
      raw: row,
    };
  });
}

// --- Main parse function ---

export function parseCSVFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ParseResult> {
  return new Promise((resolve) => {
    let headers: string[] = [];
    const rawRows: Record<string, string>[] = [];
    const errors: string[] = [];

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => h.trim(),
      step: (result, parser) => {
        if (headers.length === 0 && result.meta.fields) {
          headers = result.meta.fields;
        }
        if (result.errors.length) {
          result.errors.forEach((e) => errors.push(e.message));
        }
        if (result.data && Object.keys(result.data).length > 0) {
          rawRows.push(result.data as Record<string, string>);
        }
      },
      complete: () => {
        onProgress?.(100);

        const format = detectFormat(headers);
        let transactions: NormalizedTransaction[] = [];

        switch (format) {
          case "mpesa_statement":
          case "mpesa_till":
            transactions = parseMpesaStatement(rawRows, headers);
            break;
          case "mpesa_paybill":
            transactions = parseMpesaPaybill(rawRows, headers);
            break;
          case "shopify":
            transactions = parseShopify(rawRows, headers);
            break;
          default:
            transactions = parseGeneric(rawRows, headers);
        }

        resolve({
          format,
          formatLabel: formatLabel(format),
          transactions,
          rawRows,
          headers,
          totalRows: rawRows.length,
          errors: errors.slice(0, 5),
        });
      },
      error: (error) => {
        resolve({
          format: "unknown",
          formatLabel: "Unknown Format",
          transactions: [],
          rawRows: [],
          headers: [],
          totalRows: 0,
          errors: [error.message],
        });
      },
    });
  });
}
