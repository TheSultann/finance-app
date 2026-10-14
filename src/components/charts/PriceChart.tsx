import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { HistoryPoint } from '../../types/HistoryPoint';
import { formatIntradayTime, formatDateLabel } from '../../utils/formatters';
import styles from './PriceChart.module.css';

// Palette for up to 5 series
const COLORS = ['#3b82d4', '#7c5cd8', '#16a34a', '#dc2626', '#ea580c'];

export interface ChartSeries {
  label: string;
  points: HistoryPoint[];
}

interface Props {
  /** One entry per index line on the chart */
  series: ChartSeries[];
  /** true = intraday (absolute price on Y), false = daily (% return on Y) */
  intraday?: boolean;
  height?: number;
}

// `date` is a string; other keys are numeric series values.
// Declared as Record<string, unknown> so the index signature doesn't conflict.
type DataPoint = Record<string, unknown> & { date: string };

/**
 * Multi-series line chart.
 *
 * Intraday mode: absolute price Y-axis, HH:MM X-axis ticks.
 * Daily mode: % return Y-axis (normalised to period open), date X-axis.
 */
export function PriceChart({ series, intraday = false, height = 280 }: Props) {
  const merged = buildMergedData(series);

  const yTickFormatter = intraday
    ? (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : (v: number) => `${v.toFixed(1)}%`;

  const xTickFormatter = intraday ? formatIntradayTime : formatDateLabel;

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={merged} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={xTickFormatter}
            tick={{ fontSize: 11, fill: '#57606a' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={yTickFormatter}
            tick={{ fontSize: 11, fill: '#57606a' }}
            width={55}
          />
          <Tooltip
            formatter={(value, name) => {
              const v = value as number;
              const n = String(name);
              return intraday
                ? [v.toLocaleString('en-US', { minimumFractionDigits: 2 }), n]
                : [`${v.toFixed(2)}%`, n];
            }}
            labelFormatter={(label) =>
              intraday ? formatIntradayTime(String(label)) : formatDateLabel(String(label))
            }
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((s, i) => (
            <Line
              key={s.label}
              type="monotone"
              dataKey={s.label}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={2}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function buildMergedData(series: ChartSeries[]): DataPoint[] {
  const dateSet = new Set<string>();
  series.forEach((s) => s.points.forEach((p) => dateSet.add(p.date)));
  const dates = Array.from(dateSet).sort();

  return dates.map((date) => {
    const point: DataPoint = { date };
    series.forEach((s) => {
      const match = s.points.find((p) => p.date === date);
      point[s.label] = match?.close ?? null;
    });
    return point;
  });
}
