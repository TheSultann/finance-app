import type { StockQuote } from '../../types/StockQuote';
import { formatPrice, formatChange, formatPercent } from '../../utils/formatters';
import styles from './QuoteCard.module.css';

interface Props {
  quote: StockQuote;
}

export function QuoteCard({ quote }: Props) {
  const isPositive = quote.regularMarketChange >= 0;
  const changeClass = isPositive ? styles.positive : styles.negative;

  return (
    <div className={styles.card}>
      <div className={styles.name}>{quote.longName}</div>
      <div className={styles.symbol}>{quote.symbol}</div>
      <div className={styles.price}>{formatPrice(quote.regularMarketPrice)}</div>
      <div className={`${styles.change} ${changeClass}`}>
        {formatChange(quote.regularMarketChange)}{' '}
        <span className={styles.pct}>({formatPercent(quote.regularMarketChangePercent)})</span>
      </div>
    </div>
  );
}
