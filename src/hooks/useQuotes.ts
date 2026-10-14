import { useState, useEffect, useRef } from 'react';
import { fetchQuotes } from '../services/financeApi';
import { SYMBOLS } from '../constants/indices';
import type { StockQuote } from '../types/StockQuote';

const REFRESH_INTERVAL_MS = 60_000; // 1 minute

export interface UseQuotesResult {
  quotes: StockQuote[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches live quotes for all five indices and refreshes every 60 s
 * while the tab is visible.
 */
export function useQuotes(): UseQuotesResult {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    try {
      const data = await fetchQuotes(SYMBOLS);
      setQuotes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    timerRef.current = setInterval(() => {
      if (!document.hidden) load();
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { quotes, loading, error };
}
