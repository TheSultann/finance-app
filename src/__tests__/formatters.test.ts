import { describe, it, expect } from 'vitest';
import {
  formatChange,
  formatPercent,
  formatPrice,
  normaliseToPctReturn,
} from '../utils/formatters';

describe('formatChange', () => {
  it('prefixes positive values with +', () => {
    expect(formatChange(12.5)).toBe('+12.50');
  });

  it('keeps negative sign', () => {
    expect(formatChange(-3.7)).toBe('-3.70');
  });

  it('formats zero as +0.00', () => {
    expect(formatChange(0)).toBe('+0.00');
  });
});

describe('formatPercent', () => {
  it('includes % suffix', () => {
    expect(formatPercent(1.23)).toBe('+1.23%');
  });

  it('handles negative percent', () => {
    expect(formatPercent(-0.5)).toBe('-0.50%');
  });
});

describe('formatPrice', () => {
  it('formats with 2 decimal places', () => {
    // toLocaleString output varies by locale — verify decimal structure
    const result = formatPrice(1234.5);
    expect(result).toMatch(/1[,.]?234\.50/);
  });
});

describe('normaliseToPctReturn', () => {
  it('returns empty array for empty input', () => {
    expect(normaliseToPctReturn([])).toEqual([]);
  });

  it('first point is always 0%', () => {
    const points = [
      { date: '2026-01-01', close: 100 },
      { date: '2026-01-02', close: 110 },
    ];
    const result = normaliseToPctReturn(points);
    expect(result[0].value).toBe(0);
  });

  it('computes correct % return', () => {
    const points = [
      { date: '2026-01-01', close: 100 },
      { date: '2026-01-02', close: 105 },
    ];
    const result = normaliseToPctReturn(points);
    expect(result[1].value).toBeCloseTo(5);
  });

  it('filters out null and zero close prices', () => {
    const points = [
      { date: '2026-01-01', close: 0 },
      { date: '2026-01-02', close: null },
      { date: '2026-01-03', close: 100 },
    ];
    const result = normaliseToPctReturn(points);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-01-03');
  });
});
