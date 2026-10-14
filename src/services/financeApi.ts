import type { StockQuote } from '../types/StockQuote';
import type { HistoryPoint } from '../types/HistoryPoint';
import type { ViewRange } from '../types/ViewRange';

const BASE = '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${url}`);
  }
  return res.json() as Promise<T>;
}

/** Fetch a live quote snapshot for one symbol. */
export function fetchQuote(symbol: string): Promise<StockQuote> {
  return fetchJson<StockQuote>(`${BASE}/quote/${encodeURIComponent(symbol)}`);
}

/** Fetch quotes for multiple symbols in parallel. */
export function fetchQuotes(symbols: string[]): Promise<StockQuote[]> {
  return Promise.all(symbols.map(fetchQuote));
}

/** Build the query string for a history request. */
function historyUrl(symbol: string, range: ViewRange): string {
  const base = `${BASE}/history/${encodeURIComponent(symbol)}`;

  if (range === 'day') {
    return `${base}?range=day`;
  }

  const now = new Date();
  const period2 = toDateString(now);

  if (range === '7d') {
    const period1 = toDateString(daysAgo(now, 7));
    return `${base}?range=7d&period1=${period1}&period2=${period2}`;
  }

  // quarter ≈ 90 days
  const period1 = toDateString(daysAgo(now, 90));
  return `${base}?range=quarter&period1=${period1}&period2=${period2}`;
}

/** Fetch OHLCV history for one symbol and a given range. */
export function fetchHistory(symbol: string, range: ViewRange): Promise<HistoryPoint[]> {
  return fetchJson<HistoryPoint[]>(historyUrl(symbol, range));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return d;
}
