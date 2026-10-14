import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { StockSearchView } from '../views/StockSearchView';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockHistory = [
  { date: '2026-07-13T13:30:00.000Z', open: 150, high: 152, low: 149, close: 151, volume: 3000 },
  { date: '2026-07-13T13:35:00.000Z', open: 151, high: 153, low: 150, close: 152, volume: 2800 },
];

// ── MSW server ────────────────────────────────────────────────────────────────

const server = setupServer(
  http.get('/api/history/:symbol', () => HttpResponse.json(mockHistory))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('StockSearchView', () => {
  it('shows loading state initially', () => {
    render(<StockSearchView symbol="AAPL" range="day" />);
    expect(screen.getByText(/loading aapl/i)).toBeInTheDocument();
  });

  it('renders the chart title once data loads', async () => {
    render(<StockSearchView symbol="AAPL" range="day" />);

    await waitFor(() => {
      expect(screen.getByText(/AAPL — Today/i)).toBeInTheDocument();
    });
  });

  it('shows an error message when the API fails', async () => {
    server.use(
      http.get('/api/history/:symbol', () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 })
      )
    );

    render(<StockSearchView symbol="FAKE" range="day" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('uses the correct range label for 7d', async () => {
    render(<StockSearchView symbol="TSLA" range="7d" />);

    await waitFor(() => {
      expect(screen.getByText(/TSLA — Last 7 Days/i)).toBeInTheDocument();
    });
  });

  it('uses the correct range label for quarter', async () => {
    render(<StockSearchView symbol="MSFT" range="quarter" />);

    await waitFor(() => {
      expect(screen.getByText(/MSFT — Last Quarter/i)).toBeInTheDocument();
    });
  });
});
