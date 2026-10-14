import { useQuotes } from '../hooks/useQuotes';
import { useHistory } from '../hooks/useHistory';
import { QuoteCard } from '../components/cards/QuoteCard';
import { PriceChart } from '../components/charts/PriceChart';
import { INDICES } from '../constants/indices';
import type { HistoryPoint } from '../types/HistoryPoint';
import styles from './DayView.module.css';

/**
 * Current-day view.
 *
 * Top row: one QuoteCard per index (price, absolute change, % change).
 * Below: one intraday PriceChart per index showing 5-min candles.
 *
 * Intraday charts use absolute price on the Y-axis (not % return)
 * because the intraday range is typically < 3% and % return looks flat.
 */
export function DayView() {
  const { quotes, loading: quotesLoading, error: quotesError } = useQuotes();

  if (quotesLoading) return <div className={styles.status}>Loading quotes…</div>;
  if (quotesError) return <div className={styles.error}>Error: {quotesError}</div>;

  return (
    <div>
      {/* Quote summary row */}
      <div className={styles.cardRow}>
        {quotes.map((q) => (
          <QuoteCard key={q.symbol} quote={q} />
        ))}
      </div>

      {/* One intraday chart per index */}
      <div className={styles.charts}>
        {INDICES.map((idx) => (
          <IntradayChart key={idx.symbol} symbol={idx.symbol} label={idx.shortLabel} />
        ))}
      </div>
    </div>
  );
}

// ── per-index intraday chart ──────────────────────────────────────────────────

interface IntradayChartProps {
  symbol: string;
  label: string;
}

function IntradayChart({ symbol, label }: IntradayChartProps) {
  const { history, loading, error } = useHistory(symbol, 'day');

  if (loading) return <div className={styles.chartPlaceholder}>Loading {label}…</div>;
  if (error) return <div className={styles.chartError}>{label}: {error}</div>;

  const series = [{ label, points: history as HistoryPoint[] }];

  return (
    <div className={styles.chartWrapper}>
      <h3 className={styles.chartTitle}>{label} — Today</h3>
      <PriceChart series={series} intraday height={200} />
    </div>
  );
}
