// src/components/ChartWidget.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * Simple month-by-month Income vs Expenses chart.
 * Expects data like [{ name:'04', income:1900, expenses:640 }, …]
 */
export default function ChartWidget({ data = [], title = '' }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  // find min & max to pad both ends by 10 %
  const amounts = data.flatMap((d) => [d.income ?? 0, d.expenses ?? 0]);
  const maxVal = Math.max(...amounts);
  const minVal = Math.min(...amounts);

  // pad ±10 %, but never below zero
  const yMin = 0;
  const yMax = Math.ceil(maxVal * 1.3);

  return (
    <div className="bg-zinc-900 rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 16, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="#334155" />
          <XAxis dataKey="name" />

          <YAxis
            domain={[yMin, yMax]}
            allowDecimals={false}
            tickFormatter={(v) =>
              v.toLocaleString(undefined, { maximumFractionDigits: 0 })
            }
          />

          <Tooltip
            formatter={(v) => `$${Number(v).toLocaleString()}`}
            itemSorter={(a, b) => {
              const ak = a?.dataKey,
                bk = b?.dataKey;
              if (ak === 'income') return -1;
              if (bk === 'income') return 1;
              return 0;
            }}
          />

          <Legend verticalAlign="bottom" iconSize={12} />

          {/* Income first so legend + tooltip order match */}
          <Line
            type="monotone"
            dataKey="income"
            stroke="#4ade80"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#f87171"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
