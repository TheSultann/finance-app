import { Router } from 'express';
import type { Request, Response } from 'express';
import { dedupe, setCache } from '../cache.js';

const router = Router();

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; finance-dashboard/1.0)',
  'Accept': 'application/json',
};

const QUOTE_TTL = 60; // seconds

router.get('/:symbol', async (req: Request, res: Response) => {
  const symbol = (req.params.symbol as string).toUpperCase();
  const cacheKey = `quote:${symbol}`;

  try {
    const data = await dedupe(cacheKey, async () => {
      // interval=5m keeps meta.regularMarketPrice fresh; interval=1d returns only 1 candle
      const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d`;
      const raw = await fetch(url, { headers: YF_HEADERS }).then(r => r.json()) as {
        chart: { result: Array<{ meta: Record<string, unknown> }> };
      };
      const meta = raw.chart.result[0].meta;

      const price = Number(meta.regularMarketPrice);
      // regularMarketChange is NOT present in v8 — compute from chartPreviousClose
      const prevClose = Number(meta.chartPreviousClose);
      const change = price - prevClose;

      const quote = {
        symbol: meta.symbol,
        longName: meta.longName ?? meta.shortName ?? symbol,
        regularMarketPrice: price,
        regularMarketChange: change,
        regularMarketChangePercent: prevClose !== 0 ? (change / prevClose) * 100 : 0,
        regularMarketVolume: meta.regularMarketVolume ?? 0,
        chartPreviousClose: prevClose,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
        regularMarketTime: meta.regularMarketTime ?? null,
      };

      setCache(cacheKey, quote, QUOTE_TTL);
      return quote;
    });

    res.json(data);
  } catch (err) {
    console.error(`[quote] ${symbol}:`, err);
    res.status(502).json({ error: 'Failed to fetch quote', symbol });
  }
});

export default router;
