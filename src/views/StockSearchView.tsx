import { useHistory } from '../hooks/useHistory';
import { PriceChart } from '../components/charts/PriceChart';
import type { ViewRange } from '../types/ViewRange';
import styles from './StockSearchView.module.css';

interface Props {
  symbol: string;
  range: ViewRange;
}

const RANGE_LABEL: Record<ViewRange, string> = {
  day: 'Today',
  '7d': 'Last 7 Days',
  quarter: 'Last Quarter',
};

export function StockSearchView({ symbol, range }: Props) {
  const { history, loading, error } = useHistory(symbol, range);

  if (loading) {
    return <div className={styles.status}>Loading {symbol}…</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>
        {symbol} — {RANGE_LABEL[range]}
      </h3>
      <PriceChart
        series={[{ label: symbol, points: history }]}
        intraday={range === 'day'}
        height={280}
      />
    </div>
  );
}
