import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BreakdownItem {
  name: string;
  value: number;
}

interface ExpensePieChartProps {
  breakdown: BreakdownItem[];
}

const COLORS = ["#22d3ee", "#3b82f6", "#818cf8", "#a78bfa", "#f472b6", "#fb7185"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/90 border border-white/10 p-3 rounded-xl backdrop-blur-xl shadow-xl">
        <p className="text-xs font-bold text-white mb-1">{data.name}</p>
        <p className="text-sm font-extrabold text-cyan-400">
          ₹{data.value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ breakdown }) => {
  const total = breakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="glass rounded-3xl p-6 flex flex-col justify-between h-[360px]">
      <div>
        <h3 className="text-lg font-bold text-white">Expense Breakdown</h3>
        <p className="text-xs text-slate-400">Distribution by categories this month</p>
      </div>

      <div className="h-[200px] w-full relative">
        {total === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm font-medium">
            No expenses logged yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {breakdown.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center max-h-[60px] overflow-y-auto pt-2">
        {breakdown.map((item, index) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-slate-350 truncate max-w-[80px]">{item.name}</span>
              <span className="text-white font-bold">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpensePieChart;
