import { useState, useEffect } from 'react';
import { PriceChart } from '../components/charts/PriceChart';
import { INDICES } from '../constants/indices';
import { fetchHistory } from '../services/financeApi';
import { normaliseToPctReturn, formatChange, formatPercent } from '../utils/formatters';
import type { HistoryPoint } from '../types/HistoryPoint';
import type { ViewRange } from '../types/ViewRange';
import styles from './MultiView.module.css';

interface SeriesState {
  label: string;
  symbol: string;
  points: HistoryPoint[];
  loading: boolean;
  error: string | null;
}

interface Props {
  range: Extract<ViewRange, '7d' | 'quarter'>;
  title: string;
}

/**
 * Multi-index chart view shared by WeekView and QuarterView.
 *
 * All 5 indices are shown on a single chart normalised to % return
 * from the period open, so different absolute price levels are comparable.
 * A summary table below shows period open, latest close, and net return.
 */
export function MultiIndexView({ range, title }: Props) {
  const [series, setSeries] = useState<SeriesState[]>(
    INDICES.map((idx) => ({
      label: idx.shortLabel,
      symbol: idx.symbol,
      points: [],
      loading: true,
      error: null,
    }))
  );

  useEffect(() => {
    setSeries((prev) => prev.map((s) => ({ ...s, loading: true, error: null, points: [] })));

    INDICES.forEach((idx, i) => {
      fetchHistory(idx.symbol, range)
        .then((data) => {
          setSeries((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], points: data, loading: false };
            return next;
          });
        })
        .catch((err) => {
          setSeries((prev) => {
            const next = [...prev];
            next[i] = {
              ...next[i],
              error: err instanceof Error ? err.message : 'Failed',
              loading: false,
            };
            return next;
          });
        });
    });
  }, [range]);

  const anyLoading = series.some((s) => s.loading);
  const firstError = series.find((s) => s.error);

  // Normalise each series to % return from the period open
  const chartSeries = series.map((s) => ({
    label: s.label,
    points: normaliseToPctReturn(s.points).map((p) => ({
      date: p.date,
      open: null,
      high: null,
      low: null,
      close: p.value,
      volume: null,
    })) as HistoryPoint[],
  }));

  return (
    <div>
      <h2 className={styles.viewTitle}>{title}</h2>

      {anyLoading && <div className={styles.status}>Loading…</div>}
      {firstError && <div className={styles.error}>Error: {firstError.error}</div>}

      {!anyLoading && (
        <>
          <PriceChart series={chartSeries} intraday={false} height={320} />
          <SummaryTable series={series} />
        </>
      )}
    </div>
  );
}

// ── summary table ─────────────────────────────────────────────────────────────

function SummaryTable({ series }: { series: SeriesState[] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Index</th>
          <th>Period Open</th>
          <th>Latest Close</th>
          <th>Net Change</th>
          <th>Return</th>
        </tr>
      </thead>
      <tbody>
        {series.map((s) => {
          const valid = s.points.filter((p) => p.close !== null && p.close > 0);
          if (valid.length === 0) {
            return (
              <tr key={s.symbol}>
                <td>{s.label}</td>
                <td colSpan={4} className={styles.noData}>No data</td>
              </tr>
            );
          }
          const open = valid[0].close as number;
          const close = valid[valid.length - 1].close as number;
          const change = close - open;
          const pct = (change / open) * 100;
          const isPos = change >= 0;
          return (
            <tr key={s.symbol}>
              <td className={styles.label}>{s.label}</td>
              <td>{open.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
              <td>{close.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
              <td className={isPos ? styles.positive : styles.negative}>{formatChange(change)}</td>
              <td className={isPos ? styles.positive : styles.negative}>{formatPercent(pct)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
