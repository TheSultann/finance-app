import { useState } from 'react';
import { Header } from './components/layout/Header';
import { TabNav } from './components/layout/TabNav';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { QuarterView } from './views/QuarterView';
import type { ViewRange } from './types/ViewRange';
import styles from './App.module.css';

export function App() {
  const [range, setRange] = useState<ViewRange>('day');

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
        </main>
      </div>
    </div>
  );
}
