import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Brain, Sparkles, ShieldAlert, CheckCircle2, ListFilter, RefreshCw } from "lucide-react";
import FinancialHealthSphere from "./FinancialHealthSphere";

interface HealthReport {
  score: number;
  grade?: string;
  rating?: string;
  metrics?: {
    income: number;
    expenses: number;
    savings: number;
    monthlySavings: number;
    expenseRatio: number;
    savingsRate: number;
    emergencyCoverageMonths: number;
  };
  reasons: string[];
  recommendations: string[];
}

interface AlertItem {
  category: string;
  message: string;
}

interface AIInsightsWidgetProps {
  spendingAlerts: AlertItem[];
}

const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ spendingAlerts }) => {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get("/financial-health");
        setReport(res.data);
        setError(false);
      } catch (err) {
        console.error("Failed to load financial health report:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  return (
    <div className="glass rounded-3xl p-6 flex flex-col gap-6 lg:col-span-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              Financial Health Audit <Sparkles size={16} className="text-yellow-400" />
            </h3>
            <p className="text-xs text-slate-400">Deep AI analysis of spending patterns and savings targets</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Ring Gauge */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900/30 border border-white/5 rounded-2xl">
          {loading ? (
            <div className="h-28 flex items-center justify-center">
              <RefreshCw className="animate-spin text-cyan-400" size={24} />
            </div>
          ) : error || !report ? (
            <div className="text-center py-4 text-xs text-slate-400">
              Score unavailable
            </div>
          ) : (
            <>
              <FinancialHealthSphere
                score={report.score}
                grade={report.grade || "B"}
                rating={report.rating || "Healthy"}
              />
              {report.metrics && (
                <div className="mt-4 grid grid-cols-2 gap-2 w-full text-[10px]">
                  <div className="bg-slate-950/40 rounded-xl p-2 border border-white/5">
                    <span className="text-slate-500 block">Income</span>
                    <span className="text-white font-bold">₹{report.metrics.income.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="bg-slate-950/40 rounded-xl p-2 border border-white/5">
                    <span className="text-slate-500 block">Expenses</span>
                    <span className="text-white font-bold">₹{report.metrics.expenses.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="bg-slate-950/40 rounded-xl p-2 border border-white/5">
                    <span className="text-slate-500 block">Savings Rate</span>
                    <span className="text-white font-bold">{report.metrics.savingsRate}%</span>
                  </div>
                  <div className="bg-slate-950/40 rounded-xl p-2 border border-white/5">
                    <span className="text-slate-500 block">Emergency</span>
                    <span className="text-white font-bold">{report.metrics.emergencyCoverageMonths} mo</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Reasons and recommendations */}
        <div className="md:col-span-2 flex flex-col md:flex-row gap-6">
          {/* Reasons */}
          <div className="flex-1 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ListFilter size={12} /> Key Observations
            </h4>
            {loading ? (
              <div className="space-y-2 py-2">
                <div className="h-3 w-3/4 rounded bg-slate-800 animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-slate-800 animate-pulse" />
              </div>
            ) : error || !report ? (
              <div className="text-xs text-slate-500">Failed to load observations.</div>
            ) : (
              <ul className="space-y-2">
                {report.reasons.map((r, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recommendations */}
          <div className="flex-1 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-400" /> Actions Recommended
            </h4>
            {loading ? (
              <div className="space-y-2 py-2">
                <div className="h-3 w-3/4 rounded bg-slate-800 animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-slate-800 animate-pulse" />
              </div>
            ) : error || !report ? (
              <div className="text-xs text-slate-500">Failed to load recommendations.</div>
            ) : (
              <ul className="space-y-2">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-emerald-300/90 flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Spending Alerts Widget */}
      {spendingAlerts.length > 0 && (
        <div className="mt-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2.5">
          <h4 className="text-xs font-bold text-rose-400 flex items-center gap-2">
            <ShieldAlert size={14} /> SPENDING ALERTS
          </h4>
          <div className="space-y-2">
            {spendingAlerts.map((alert, idx) => (
              <p key={idx} className="text-xs text-slate-300 leading-relaxed">
                • {alert.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightsWidget;
