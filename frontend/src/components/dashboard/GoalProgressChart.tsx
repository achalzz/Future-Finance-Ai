import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Target } from "lucide-react";

interface GoalItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  percentage: number;
}

interface GoalProgressChartProps {
  goals: GoalItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-white/10 p-3 rounded-xl backdrop-blur-xl shadow-xl">
        <p className="text-xs font-bold text-white mb-1">{label}</p>
        <p className="text-sm font-extrabold text-cyan-400">
          {payload[0].value}% complete
        </p>
      </div>
    );
  }
  return null;
};

const GoalProgressChart: React.FC<GoalProgressChartProps> = ({ goals }) => {
  const chartData = goals.map((g) => ({
    name: g.title.length > 14 ? g.title.slice(0, 14) + "…" : g.title,
    fullName: g.title,
    percentage: Math.min(100, Math.round(((g.currentAmount || 0) / g.targetAmount) * 100)),
  }));

  const getBarColor = (pct: number) => {
    if (pct >= 75) return "#10b981";
    if (pct >= 40) return "#22d3ee";
    return "#f43f5e";
  };

  return (
    <div className="glass rounded-3xl p-6 flex flex-col h-[360px]">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
            <Target size={16} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Goal Completion</h3>
            <p className="text-xs text-slate-400">Progress per goal</p>
          </div>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          No goals yet — create one on the Goals page
        </div>
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={14}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-400">≥75% On track</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-slate-400">≥40% In progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-400">&lt;40% Needs focus</span>
        </div>
      </div>
    </div>
  );
};

export default GoalProgressChart;
