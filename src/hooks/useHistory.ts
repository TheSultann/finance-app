import { useState, useEffect } from 'react';
import { fetchHistory } from '../services/financeApi';
import type { HistoryPoint } from '../types/HistoryPoint';
import type { ViewRange } from '../types/ViewRange';

export interface UseHistoryResult {
  history: HistoryPoint[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches OHLCV history for a single symbol and range.
 * Re-fetches automatically when symbol or range changes.
 */
export function useHistory(symbol: string, range: ViewRange): UseHistoryResult {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchHistory(symbol, range)
      .then((data) => {
        if (!cancelled) {
          setHistory(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load history');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  return { history, loading, error };
}
