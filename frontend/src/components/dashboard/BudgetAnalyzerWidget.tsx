import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { TrendingUp, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface BudgetData {
  needs: number;
  wants: number;
  savings: number;
  needsAmount: number;
  wantsAmount: number;
  savingsAmount: number;
  income: number;
  score: number;
  verdict: string;
  alerts: string[];
}

const BudgetBar = ({
  label,
  pct,
  target,
  amount,
  color,
  bgColor,
  delay = 0,
}: {
  label: string;
  pct: number;
  target: number;
  amount: number;
  color: string;
  bgColor: string;
  delay?: number;
}) => {
  const [animPct, setAnimPct] = useState(0);
  const isOver = pct > target;
  const isUnder = label === "Savings" && pct < target;

  useEffect(() => {
    const timer = setTimeout(() => setAnimPct(pct), delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`font-bold ${color}`}>{label}</span>
          <span className="text-slate-500">
            ₹{amount.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[10px]">Target: {target}%</span>
          {isOver || isUnder ? (
            <span className={`font-bold text-amber-400 flex items-center gap-0.5`}>
              <AlertTriangle size={10} />
              {pct}%
            </span>
          ) : (
            <span className={`font-bold text-emerald-400 flex items-center gap-0.5`}>
              <CheckCircle2 size={10} />
              {pct}%
            </span>
          )}
        </div>
      </div>
      <div className={`h-2.5 rounded-full overflow-hidden ${bgColor}`}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: `${Math.min(100, animPct)}%`,
            background: isOver || isUnder
              ? "linear-gradient(90deg, #f59e0b, #f97316)"
              : `linear-gradient(90deg, ${
                  label === "Needs"
                    ? "#22d3ee, #06b6d4"
                    : label === "Wants"
                    ? "#a78bfa, #818cf8"
                    : "#10b981, #34d399"
                })`,
          }}
        />
      </div>
    </div>
  );
};

const BudgetAnalyzerWidget: React.FC = () => {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/budget-analysis");
        setData(res.data);
        setError(false);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (score >= 65) return { label: "Good", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" };
    if (score >= 50) return { label: "Fair", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
    return { label: "Needs Work", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" };
  };

  return (
    <div className="glass rounded-3xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Budget Analyzer</h3>
            <p className="text-[10px] text-slate-400">50 / 30 / 20 Rule Breakdown</p>
          </div>
        </div>
        {data && !loading && (
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${getScoreBadge(data.score).bg} ${getScoreBadge(data.score).color}`}>
            Score: {data.score}/100 · {getScoreBadge(data.score).label}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="animate-spin text-cyan-400" size={22} />
        </div>
      ) : error || !data ? (
        <div className="py-6 text-center space-y-2">
          <AlertTriangle className="mx-auto text-amber-400" size={24} />
          <p className="text-xs text-slate-400">
            Add expenses to see your 50/30/20 breakdown.
          </p>
        </div>
      ) : (
        <>
          {/* Budget Bars */}
          <div className="space-y-4">
            <BudgetBar
              label="Needs"
              pct={data.needs}
              target={50}
              amount={data.needsAmount}
              color="text-cyan-400"
              bgColor="bg-cyan-500/10"
              delay={100}
            />
            <BudgetBar
              label="Wants"
              pct={data.wants}
              target={30}
              amount={data.wantsAmount}
              color="text-purple-400"
              bgColor="bg-purple-500/10"
              delay={250}
            />
            <BudgetBar
              label="Savings"
              pct={data.savings}
              target={20}
              amount={data.savingsAmount}
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
              delay={400}
            />
          </div>

          {/* AI Verdict */}
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-3.5 flex items-start gap-2.5">
            <div className="p-1.5 bg-purple-500/10 rounded-lg shrink-0 mt-0.5">
              <TrendingUp size={12} className="text-purple-400" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{data.verdict}</p>
          </div>

          {/* Alerts */}
          {data.alerts && data.alerts.length > 0 && (
            <div className="space-y-1.5">
              {data.alerts.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-[10px] text-amber-300/80"
                >
                  <AlertTriangle size={10} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BudgetAnalyzerWidget;
