import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrendItem {
  month: string;
  expenses: number;
  savings: number;
}

interface ExpenseTrendChartProps {
  trendData: TrendItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-white/10 p-4 rounded-xl backdrop-blur-xl shadow-xl">
        <p className="text-sm font-bold text-white mb-2">{label}</p>
        {payload.map((item: any) => (
          <div key={item.name} className="flex justify-between items-center gap-6 text-xs mt-1">
            <span style={{ color: item.color }} className="capitalize font-medium">
              {item.name === "expenses" ? "Spent" : "Saved"}:
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

const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({ trendData }) => {
  return (
    <div className="glass rounded-3xl p-6 flex flex-col justify-between h-[360px]">
      <div>
        <h3 className="text-lg font-bold text-white">Expenses vs Savings</h3>
        <p className="text-xs text-slate-400">Monthly side-by-side financial comparison</p>
      </div>

      <div className="h-[240px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={trendData}
            margin={{
              top: 10,
              right: 10,
              left: -15,
              bottom: 0,
            }}
          >
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
              formatter={(value) => (
                <span className="text-xs text-slate-400 capitalize">
                  {value === "expenses" ? "Expenses" : "Savings"}
                </span>
              )}
            />
            <Bar dataKey="expenses" name="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="savings" name="savings" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseTrendChart;
