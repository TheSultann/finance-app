/** A normalised quote snapshot for one index. */
export interface StockQuote {
  symbol: string;
  longName: string;
  regularMarketPrice: number;
  /** Computed: regularMarketPrice - chartPreviousClose (NOT from API) */
  regularMarketChange: number;
  /** Computed: (change / chartPreviousClose) * 100 (NOT from API) */
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  chartPreviousClose: number;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  /** Unix seconds of last price update */
  regularMarketTime: number | null;
}
