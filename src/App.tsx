import { useState } from 'react';
import { Header } from './components/layout/Header';
import { TabNav } from './components/layout/TabNav';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { QuarterView } from './views/QuarterView';
import { StockSearchView } from './views/StockSearchView';
import type { ViewRange } from './types/ViewRange';
import styles from './App.module.css';

export function App() {
  const [range, setRange] = useState<ViewRange>('day');
  const [draftSymbol, setDraftSymbol] = useState('');
  const [ticker, setTicker] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draftSymbol.trim().toUpperCase();
    if (trimmed) {
      setTicker(trimmed);
      setDraftSymbol('');
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <Header />
        <div className={styles.controls}>
          <TabNav active={range} onChange={setRange} />
        </div>
        <main className={styles.main}>
          {range === 'day'     && <DayView />}
          {range === '7d'      && <WeekView />}
          {range === 'quarter' && <QuarterView />}

          <form onSubmit={handleSearch} className={styles.tickerForm}>
            <input
              className={styles.tickerInput}
              type="text"
              placeholder="Enter ticker symbol (e.g. AAPL)"
              value={draftSymbol}
              onChange={(e) => setDraftSymbol(e.target.value)}
              aria-label="Stock ticker symbol"
            />
            <button className={styles.tickerButton} type="submit">
              Search
            </button>
          </form>

          {ticker && <StockSearchView symbol={ticker} range={range} />}
        </main>
      </div>
    </div>
  );
}
