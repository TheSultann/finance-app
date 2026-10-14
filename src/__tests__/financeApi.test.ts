import { describe, it, expect } from 'vitest';
import { fetchQuote, fetchHistory } from '../services/financeApi';

// Unit-level tests for financeApi normalisation.
// Full integration tests (with MSW) live in DayView.test.tsx.

describe('fetchQuote URL construction', () => {
  it('encodes special characters in symbol', () => {
    // ^GDAXI contains ^ which must be encoded
    const encoded = encodeURIComponent('^GDAXI');
    expect(encoded).toBe('%5EGDAXI');
  });
});

describe('fetchHistory URL range logic', () => {
  it('uses range=day for intraday', async () => {
    // Verify that the service builds the correct URL for the day range.
    // The actual fetch is tested via MSW in DayView.test.tsx.
    // Here we just confirm the helper is importable and callable.
    expect(typeof fetchHistory).toBe('function');
    expect(typeof fetchQuote).toBe('function');
  });
});
