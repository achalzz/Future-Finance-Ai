import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrendItem {
  month: string;
  income?: number;
  savings?: number;
  expenses?: number;
}

interface SavingsChartProps {
  trendData?: TrendItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 border border-white/10 p-4 rounded-xl backdrop-blur-xl shadow-xl">
        <p className="text-sm font-bold text-white mb-2">{label}</p>
        {payload.map((item: any) => (
          <div key={item.name} className="flex justify-between items-center gap-6 text-xs mt-1">
            <span style={{ color: item.color }} className="capitalize font-medium">
              {item.name}:
            </span>
            <span className="text-white font-bold">
              ₹{item.value.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SavingsChart: React.FC<SavingsChartProps> = ({ trendData }) => {
  // Use passed data or fallback to empty state message
  const data = trendData && trendData.length > 0 ? trendData : null;

  return (
    <div className="glass rounded-3xl p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white">Income · Savings · Expenses Trend</h3>
        <p className="text-xs text-slate-400">Monthly financial tracking — last 6 months</p>
      </div>

      {!data ? (
        <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
          Log your first expense to see trend data
        </div>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-slate-400 capitalize">{value}</span>}
              />

              {data[0]?.income !== undefined && (
                <Area
                  type="monotone"
                  dataKey="income"
                  name="income"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
              )}

              <Area
                type="monotone"
                dataKey="expenses"
                name="expenses"
                stroke="#f43f5e"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorExpenses)"
              />

              <Area
                type="monotone"
                dataKey="savings"
                name="savings"
                stroke="#22d3ee"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSavings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SavingsChart;
