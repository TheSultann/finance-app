/** One OHLCV candle returned by the history endpoint. */
export interface HistoryPoint {
  /**
   * Intraday (range=day):  full ISO string  "2026-07-13T13:30:00.000Z"
   * Daily (range=7d/quarter): date string   "2026-07-13"
   *
   * Never truncate intraday to YYYY-MM-DD — chart libraries collapse all
   * same-date points into a single tick, producing a flat line.
   */
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}
