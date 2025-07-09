// src/components/CategoryChart.jsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// 8 distinct colours
const COLORS = [
  '#38bdf8', // blue-400
  '#4ade80', // green-400
  '#f87171', // red-400
  '#facc15', // yellow-400
  '#a78bfa', // purple-400
  '#fb923c', // orange-400
  '#60a5fa', // blue-300
  '#34d399', // green-300
];

// custom slice label (inside pie)
const renderLabel = ({ name, value, cx, cy, midAngle, outerRadius, fill }) => {
  // position text just outside the slice centre
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={14}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${name}: ${Number(value).toFixed(2)}`}
    </text>
  );
};

export default function CategoryChart({ data = [], title = '' }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <div className="bg-zinc-900 rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>

      <ResponsiveContainer width="100%" height={340}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"          
            outerRadius={90}  // slightly smaller radius to avoid clipping
            label={renderLabel}
            stroke="#0f172a"
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => Number(v).toFixed(2)} />
          <Legend verticalAlign="bottom" iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
