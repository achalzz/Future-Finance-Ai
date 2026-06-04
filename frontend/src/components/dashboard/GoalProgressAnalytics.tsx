import React from "react";
import { Target, CalendarRange, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GoalProgressItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  percentage: number;
  monthlyContribution?: number;
}

interface GoalProgressAnalyticsProps {
  goals: GoalProgressItem[];
}

const GoalProgressAnalytics: React.FC<GoalProgressAnalyticsProps> = ({ goals }) => {
  const navigate = useNavigate();

  const getBarColor = (pct: number) => {
    if (pct >= 90) return "from-emerald-400 to-green-500";
    if (pct >= 60) return "from-cyan-400 to-blue-500";
    if (pct >= 25) return "from-blue-400 to-indigo-500";
    return "from-rose-400 to-pink-500";
  };

  return (
    <div className="glass rounded-3xl p-6 flex flex-col justify-between h-[360px]">
      <div>
        <h3 className="text-lg font-bold text-white">Goal Progress Analytics</h3>
        <p className="text-xs text-slate-400">Timeline tracking and completion forecasts</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-4 max-h-[260px] scrollbar-thin scrollbar-thumb-slate-800">
        {goals.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-6">
            <Target size={36} className="text-slate-700" />
            <p className="text-slate-500 text-sm font-medium">No savings goals yet</p>
            <button
              onClick={() => navigate("/goals")}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Link size={12} /> Create your first goal →
            </button>
          </div>
        ) : (
          goals.map((g) => {
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const contribution = g.monthlyContribution || 0;
            const monthsToGoal = contribution > 0 ? Math.ceil(remaining / contribution) : null;

            let completionLabel: string;
            if (remaining === 0) {
              completionLabel = "Completed 🎉";
            } else if (monthsToGoal === null) {
              completionLabel = "Set monthly contribution";
            } else if (monthsToGoal > 24) {
              completionLabel = `${(monthsToGoal / 12).toFixed(1)} years`;
            } else {
              completionLabel = `~${monthsToGoal} months`;
            }

            const pct = Math.min(100, g.percentage);
            const barGradient = getBarColor(pct);
            const isCompleted = remaining === 0;

            return (
              <div
                key={g.id}
                className="space-y-1.5 p-3 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Target
                      size={14}
                      className={isCompleted ? "text-emerald-400" : "text-cyan-400"}
                    />
                    <span className="truncate max-w-[130px]">{g.title}</span>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-lg border text-[10px] ${
                      isCompleted
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : pct >= 60
                        ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}
                  >
                    {pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${barGradient} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                  <span>
                    ₹{(g.currentAmount || 0).toLocaleString("en-IN")} / ₹
                    {g.targetAmount.toLocaleString("en-IN")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <CalendarRange
                      size={11}
                      className={monthsToGoal === null ? "text-slate-600" : "text-emerald-400"}
                    />
                    <span className={monthsToGoal === null ? "text-slate-600 italic" : "text-emerald-400 font-semibold"}>
                      {completionLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GoalProgressAnalytics;
