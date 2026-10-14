import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { DayView } from '../views/DayView';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockQuote = (symbol: string, price: number, prevClose: number) => ({
  symbol,
  longName: `${symbol} Index`,
  regularMarketPrice: price,
  regularMarketChange: price - prevClose,
  regularMarketChangePercent: ((price - prevClose) / prevClose) * 100,
  regularMarketVolume: 1000000,
  chartPreviousClose: prevClose,
  fiftyTwoWeekHigh: price * 1.1,
  fiftyTwoWeekLow: price * 0.9,
  regularMarketTime: Math.floor(Date.now() / 1000),
});

const mockHistory = [
  { date: '2026-07-13T13:30:00.000Z', open: 100, high: 102, low: 99, close: 101, volume: 5000 },
  { date: '2026-07-13T13:35:00.000Z', open: 101, high: 103, low: 100, close: 102, volume: 4800 },
];

const SYMBOLS = ['^STOXX50E', '^GDAXI', '^N225', '^DJI', 'URTH'];

// ── MSW server ────────────────────────────────────────────────────────────────

const server = setupServer(
  // Quote endpoint — responds to all 5 symbols
  http.get('/api/quote/:symbol', ({ params }) => {
    const symbol = params.symbol as string;
    return HttpResponse.json(mockQuote(symbol, 5000, 4950));
  }),
  // History endpoint
  http.get('/api/history/:symbol', () => {
    return HttpResponse.json(mockHistory);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DayView', () => {
  it('renders quote cards for all indices after loading', async () => {
    render(<DayView />);

    // Loading state visible initially
    expect(screen.getByText(/loading quotes/i)).toBeInTheDocument();

    // Cards appear once fetch resolves — use getAllByText because the symbol
    // appears in both the .name div and the .symbol div
    await waitFor(() => {
      for (const symbol of SYMBOLS) {
        const matches = screen.getAllByText(new RegExp(symbol.replace('^', '\\^'), 'i'));
        expect(matches.length).toBeGreaterThan(0);
      }
    });
  });

  it('shows positive change in green', async () => {
    render(<DayView />);

    await waitFor(() => {
      // price 5000, prev 4950 → +50 (+1.01%) — positive
      const changes = screen.getAllByText(/\+50\.00/);
      expect(changes.length).toBeGreaterThan(0);
    });
  });
});
