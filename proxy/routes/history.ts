import { Router } from 'express';
import type { Request, Response } from 'express';
import { dedupe, setCache } from '../cache.js';

const router = Router();

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; finance-dashboard/1.0)',
  'Accept': 'application/json',
};

// Cache TTLs per range
const TTL: Record<string, number> = {
  day: 60,
  '7d': 300,
  quarter: 3600,
};

router.get('/:symbol', async (req: Request, res: Response) => {
  const symbol = (req.params.symbol as string).toUpperCase();
  const { range, period1, period2 } = req.query as {
    range: string;
    period1?: string;
    period2?: string;
  };

  if (!range) {
    res.status(400).json({ error: 'Missing required query param: range' });
    return;
  }

  const cacheKey = `history:${symbol}:${range}:${period1 ?? ''}:${period2 ?? ''}`;
  const ttl = TTL[range] ?? 300;

  try {
    const data = await dedupe(cacheKey, async () => {
      let url: string;

      if (range === 'day') {
        // Intraday: 5-min candles. DO NOT use interval=1d — returns only 1 candle.
        url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d`;
      } else {
        // Daily historical: period1/period2 as Unix seconds
        if (!period1 || !period2) {
          throw new Error('period1 and period2 are required for non-day ranges');
        }
        const p1 = Math.floor(new Date(period1).getTime() / 1000);
        const p2 = Math.floor(new Date(period2).getTime() / 1000);
        url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&period1=${p1}&period2=${p2}`;
      }

      const raw = await fetch(url, { headers: YF_HEADERS }).then(r => r.json()) as {
        chart: {
          result: Array<{
            timestamp: number[];
            indicators: { quote: Array<Record<string, (number | null)[]>> };
          }>;
        };
      };
      const result = raw.chart.result[0];
      const timestamps: number[] = result.timestamp ?? [];
      const ohlcv = result.indicators.quote[0];

      const history = timestamps
        .map((t: number, i: number) => ({
          // Intraday: keep full ISO string — truncating to YYYY-MM-DD collapses all points to one tick
          // Daily: truncate to YYYY-MM-DD
          date: range === 'day'
            ? new Date(t * 1000).toISOString()
            : new Date(t * 1000).toISOString().slice(0, 10),
          open: ohlcv.open[i] ?? null,
          high: ohlcv.high[i] ?? null,
          low: ohlcv.low[i] ?? null,
          close: ohlcv.close[i] ?? null,
          volume: ohlcv.volume[i] ?? null,
        }))
        .filter((p) => p.close !== null && p.close > 0); // skip non-trading rows

      setCache(cacheKey, history, ttl);
      return history;
    });

    res.json(data);
  } catch (err) {
    console.error(`[history] ${symbol} range=${range}:`, err);
    res.status(502).json({ error: 'Failed to fetch history', symbol, range });
  }
});

export default router;
