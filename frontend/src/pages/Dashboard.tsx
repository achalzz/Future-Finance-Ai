import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useFinance } from "../hooks/useFinance";
import { checkBackend } from "../services/health.service";
import { downloadMonthlyReport } from "../services/report.service";
import StatCard from "../components/dashboard/StatCard";
import SavingsChart from "../components/dashboard/SavingsChart";
import ExpensePieChart from "../components/dashboard/ExpensePieChart";
import ExpenseTrendChart from "../components/dashboard/ExpenseTrendChart";
import GoalProgressAnalytics from "../components/dashboard/GoalProgressAnalytics";
import GoalProgressChart from "../components/dashboard/GoalProgressChart";
import AIInsightsWidget from "../components/dashboard/AIInsightsWidget";
import BudgetAnalyzerWidget from "../components/dashboard/BudgetAnalyzerWidget";
import {
  Brain,
  Star,
  Activity,
  Target,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FileDown,
  Loader2,
  PlusCircle,
  Wallet,
} from "lucide-react";

// Clean empty-state defaults — new users see zeros, not fake data
const DEFAULT_DATA = {
  stats: {
    netWorth: { value: "₹0", status: "No data yet" },
    emergencyFund: { value: "₹0", status: "0% Funded (Create Goal)" },
    monthlyExpenses: { value: "₹0", status: "No expenses logged" },
    investmentGrowth: { value: "+0%", status: "Add your data" },
  },
  secondary: {
    financialHealth: { score: 0, grade: "—", rating: "No data" },
    goalsActive: { count: 0, status: "None yet" },
    riskProfile: { level: "—", rating: "—" },
  },
  expenseBreakdown: [],
  expenseTrend: [],
  goalProgress: [],
  spendingAlerts: [],
  aiRecommendation: {
    suggestion: "Add your income in Budget Planner and log your first expense to unlock AI-powered financial insights.",
    footer: "Personalized insights appear once you have at least one expense recorded.",
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: apiData } = useFinance();
  const [apiStatus, setApiStatus] = useState<{ status: string; message: string } | null>(null);
  const [apiError, setApiError] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // Use API data if available, else fall back to local defaults
  const data: any = apiData || DEFAULT_DATA;
  const hasData = data.expenseBreakdown.length > 0 || data.goalProgress.length > 0;

  // Verify backend API health connection
  useEffect(() => {
    const verifyApi = async () => {
      try {
        const status = await checkBackend();
        setApiStatus(status);
        setApiError(false);
      } catch {
        setApiError(true);
        setApiStatus(null);
      }
    };
    verifyApi();
    const interval = setInterval(verifyApi, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      await downloadMonthlyReport();
    } catch (err) {
      console.error("Failed to download report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* Welcome Banner & Connection Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
            Welcome Back 👋
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {hasData
              ? "Here is your real-time financial overview."
              : "Set up your profile to unlock personalized insights."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Generate Report Button */}
          <button
            id="btn-generate-report"
            onClick={handleGenerateReport}
            disabled={reportLoading}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-400 rounded-2xl flex items-center gap-2 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.05)]"
          >
            {reportLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileDown size={14} />
            )}
            {reportLoading ? "Generating..." : "Generate Report"}
          </button>

          {/* Live Backend Connection Indicator */}
          <div
            className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 backdrop-blur-md transition-all duration-300 ${
              apiStatus
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : apiError
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : "bg-slate-500/10 border-slate-500/20 text-slate-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full relative flex ${
                apiStatus ? "bg-emerald-400" : apiError ? "bg-rose-500" : "bg-slate-400"
              }`}
            >
              {apiStatus && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
            </span>
            <span className="text-xs font-semibold flex items-center gap-1.5">
              {apiStatus ? (
                <>
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  API Connected: {apiStatus.message}
                </>
              ) : apiError ? (
                <>
                  <AlertTriangle size={14} className="text-rose-450 shrink-0" />
                  API Disconnected: Reconnecting...
                </>
              ) : (
                "Connecting to API..."
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── ONBOARDING BANNER (shown only when no data) ── */}
      {!hasData && (
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 shadow-[0_0_30px_rgba(6,182,212,0.03)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🚀</span> Get Started with Future Finance AI
              </h2>
              <p className="text-sm text-slate-450 max-w-xl leading-relaxed">
                Your dashboard is ready. Add your income in Budget Planner and log your first
                expense to unlock personalized AI insights, health scores, and goal forecasting.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                id="btn-go-budget-planner"
                onClick={() => navigate("/budget")}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                <Wallet size={14} /> Budget Planner
              </button>
              <button
                id="btn-go-add-expense"
                onClick={() => navigate("/expenses")}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <PlusCircle size={14} /> Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Grid — 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Net Worth"
          value={data.stats.netWorth.value}
          status={data.stats.netWorth.status}
        />
        <StatCard
          title="Emergency Fund"
          value={data.stats.emergencyFund.value}
          status={data.stats.emergencyFund.status}
        />
        <StatCard
          title="Monthly Expenses"
          value={data.stats.monthlyExpenses.value}
          status={data.stats.monthlyExpenses.status}
        />
        <StatCard
          title="Investment Growth"
          value={data.stats.investmentGrowth.value}
          status={data.stats.investmentGrowth.status}
        />
        <StatCard
          title="Monthly Income"
          value={data.secondary?.financialHealth?.metrics
            ? `₹${(data.secondary.financialHealth.metrics as any).income?.toLocaleString("en-IN") || "0"}`
            : "Set in Planner"}
          status="Budget target"
        />
        <StatCard
          title="Health Score"
          value={data.secondary.financialHealth.score > 0 ? `${data.secondary.financialHealth.score}/100` : "—"}
          status={`Grade ${data.secondary.financialHealth.grade} · ${data.secondary.financialHealth.rating}`}
        />
      </div>

      {/* Secondary Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-white/10 transition-all duration-300">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Activity size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Financial Health</span>
            <span className="text-sm font-bold text-white">
              {data.secondary.financialHealth.score}/100 · Grade{" "}
              {data.secondary.financialHealth.grade || "—"} (
              {data.secondary.financialHealth.rating})
            </span>
          </div>
        </div>

        <div className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-white/10 transition-all duration-300">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
            <Target size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Goals Active</span>
            <span className="text-sm font-bold text-white">
              {data.secondary.goalsActive.count} Goals{" "}
              {data.secondary.goalsActive.status}
            </span>
          </div>
        </div>

        <div className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-white/10 transition-all duration-300">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Risk Profile</span>
            <span className="text-sm font-bold text-white">
              {data.secondary.riskProfile.level} ({data.secondary.riskProfile.rating})
            </span>
          </div>
        </div>
      </div>

      {/* Budget Analyzer + AI Insight Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BudgetAnalyzerWidget />
        </div>

        {/* AI Advisor Insight */}
        <div className="lg:col-span-1 flex flex-col justify-between glass rounded-3xl p-6 space-y-6 hover:border-white/10 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
                <Brain size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">AI Advisor Insight</h3>
            </div>
            <p className="text-sm text-slate-350 leading-relaxed">
              {data.aiRecommendation.suggestion}
            </p>
          </div>
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex items-start gap-3">
            <Star className="text-yellow-400 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-slate-405 leading-relaxed">{data.aiRecommendation.footer}</p>
          </div>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="glass rounded-3xl p-6 hover:border-white/10 transition-all duration-300">
        <SavingsChart trendData={data.expenseTrend} />
      </div>

      {/* AI Financial Health Audit Widget */}
      <AIInsightsWidget spendingAlerts={data.spendingAlerts} />

      {/* Bottom Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Goal Progress Analytics (list view) */}
        <GoalProgressAnalytics goals={data.goalProgress} />

        {/* Expenses vs Savings Bar Chart */}
        <ExpenseTrendChart trendData={data.expenseTrend} />

        {/* Category Breakdown Pie Chart */}
        <ExpensePieChart breakdown={data.expenseBreakdown} />
      </div>

      {/* Goal Progress Chart (horizontal bar) */}
      {data.goalProgress.length > 0 && (
        <GoalProgressChart goals={data.goalProgress} />
      )}
    </motion.div>
  );
};

export default Dashboard;
