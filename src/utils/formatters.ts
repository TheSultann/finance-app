/**
 * Format a price change with sign (e.g. "+12.34" or "-5.67").
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
}

/**
 * Format a percentage change with sign (e.g. "+1.23%" or "-0.45%").
 */
export function formatPercent(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

/**
 * Format an absolute price to 2 decimal places.
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Convert a full ISO timestamp to HH:MM (local time) for intraday X-axis labels.
 * Input:  "2026-07-13T13:30:00.000Z"
 * Output: "15:30" (in CET)
 */
export function formatIntradayTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format a YYYY-MM-DD date string to a short label (e.g. "Jul 13").
 */
export function formatDateLabel(dateString: string): string {
  const d = new Date(`${dateString}T12:00:00Z`); // noon UTC avoids timezone shift
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Normalise a series of close prices to % return from the first point.
 * Used so indices with different absolute price scales can share one chart.
 *
 * Returns an empty array when input is empty or has no valid first close.
 */
export function normaliseToPctReturn(
  points: Array<{ date: string; close: number | null }>
): Array<{ date: string; value: number }> {
  const valid = points.filter((p) => p.close !== null && p.close > 0) as Array<{
    date: string;
    close: number;
  }>;

  if (valid.length === 0) return [];

  const base = valid[0].close;
  return valid.map((p) => ({
    date: p.date,
    value: ((p.close - base) / base) * 100,
  }));
}
