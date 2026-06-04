import React, { useState, useEffect } from "react";
import { getGoals, addGoal, contributeToGoal, deleteGoal } from "../services/goals.service";
import type { Goal } from "../services/goals.service";
import { Target, TrendingUp, PlusCircle, Trash2, Coins, RefreshCw, CalendarRange } from "lucide-react";

const CATEGORIES = ["Car Fund", "Emergency Fund", "House Fund", "Vacation Fund", "Other Investment"];

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Goal Form State
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState("Car Fund");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // Contribution Modal/State
  const [contributeAmount, setContributeAmount] = useState<{ [key: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await getGoals();
      setGoals(data);
    } catch (err) {
      setError("Failed to load goals. Verify backend status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || parseFloat(targetAmount) <= 0) return;

    try {
      setError(null);
      const newGoal = await addGoal({
        title: title.trim(),
        targetAmount: parseFloat(targetAmount),
        category,
        monthlyContribution: parseFloat(monthlyContribution) || 0,
        targetDate: targetDate || null,
      });
      setGoals((prev) => [...prev, newGoal]);
      setTitle("");
      setTargetAmount("");
      setMonthlyContribution("");
      setTargetDate("");
    } catch (err) {
      setError("Failed to create new goal.");
    }
  };

  const handleContribute = async (id: string) => {
    const amountStr = contributeAmount[id];
    if (!amountStr || parseFloat(amountStr) <= 0) return;

    try {
      setActionLoading(id);
      setError(null);
      const updated = await contributeToGoal(id, parseFloat(amountStr));
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      setContributeAmount((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      setError("Failed to process contribution.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickContribute = async (id: string, amount: number) => {
    try {
      setActionLoading(id);
      setError(null);
      const updated = await contributeToGoal(id, amount);
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    } catch (err) {
      setError("Failed to process quick contribution.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      setError(null);
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError("Failed to delete goal.");
    }
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Financial Goals
        </h1>
        <p className="text-slate-400 mt-2">
          Establish objectives, track contributions, and visual progress bars.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Overview Card */}
      <div className="glass rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 flex-grow">
          <div className="flex justify-between items-center text-sm font-semibold text-slate-300">
            <span>Overall Portfolio Progress</span>
            <span className="text-cyan-400">{overallProgress.toFixed(1)}% Completed</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            Target Total: ₹{totalTarget.toLocaleString("en-IN")} • Accumulated: ₹{totalCurrent.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl shrink-0 flex items-center justify-center">
          <TrendingUp size={28} />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List of Goals */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="glass rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="text-cyan-400 animate-spin" size={32} />
              <h3 className="text-lg font-bold text-white">Loading Goals...</h3>
            </div>
          ) : goals.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center border border-dashed border-white/10 flex flex-col items-center justify-center">
              <Target size={48} className="text-slate-650 mb-3" />
              <h3 className="text-lg font-bold text-white">No active goals found</h3>
              <p className="text-slate-400 text-xs mt-1">Use the panel on the right to establish your first goal.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                const circleRadius = 24;
                const circleCircumference = 2 * Math.PI * circleRadius;
                const strokeDashoffset = circleCircumference - (circleCircumference * percent) / 100;
                
                const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
                const contribution = goal.monthlyContribution || 0;
                const monthsLeft = contribution > 0 ? Math.ceil(remaining / contribution) : null;
                const forecastLabel =
                  remaining === 0
                    ? "Goal Completed 🎉"
                    : monthsLeft === null
                    ? "Set a monthly contribution below"
                    : monthsLeft > 24
                    ? `~${(monthsLeft / 12).toFixed(1)} years remaining`
                    : `~${monthsLeft} months remaining`;

                return (
                  <div key={goal.id} className="glass rounded-3xl p-6 border border-white/5 space-y-4 hover:border-white/10 transition-all duration-300">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1 min-w-0 space-y-2 text-left">
                        <span className="text-[9px] uppercase font-extrabold tracking-widest text-cyan-400 bg-cyan-400/5 border border-cyan-400/10 px-2 py-0.5 rounded-md">
                          {goal.category}
                        </span>
                        <h3 className="text-base font-bold text-white truncate">{goal.title}</h3>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <CalendarRange
                            size={12}
                            className={remaining === 0 ? "text-emerald-400" : monthsLeft === null ? "text-slate-600" : "text-cyan-400"}
                          />
                          <span className={remaining === 0 ? "text-emerald-400 font-semibold" : monthsLeft === null ? "text-slate-500 italic" : "text-cyan-400 font-semibold"}>
                            {forecastLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span>₹{goal.currentAmount.toLocaleString("en-IN")} saved</span>
                          <span>·</span>
                          <span>Target: ₹{goal.targetAmount.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      {/* SVG Circular Progress Ring */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                            {/* Track */}
                            <circle
                              cx="28"
                              cy="28"
                              r={circleRadius}
                              fill="transparent"
                              stroke="rgba(255,255,255,0.03)"
                              strokeWidth="4"
                            />
                            {/* Fill */}
                            <circle
                              cx="28"
                              cy="28"
                              r={circleRadius}
                              fill="transparent"
                              stroke="url(#goalCardGradient)"
                              strokeWidth="4"
                              strokeDasharray={circleCircumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              style={{ transition: "stroke-dashoffset 0.5s ease" }}
                            />
                          </svg>
                          {/* Inner label */}
                          <span className="absolute text-[10px] font-black text-white">
                            {Math.round(percent)}%
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                          title="Delete Goal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Gradient Definition (will be mounted once per SVG area or at layout level) */}
                    <svg className="w-0 h-0 absolute">
                      <defs>
                        <linearGradient id="goalCardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4F8CFF" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Contribution Panel */}
                    <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Quick Contribution buttons */}
                      <div className="flex gap-2">
                        <button
                          disabled={actionLoading === goal.id}
                          onClick={() => handleQuickContribute(goal.id, 1000)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 text-slate-300 hover:text-cyan-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          +₹1,000
                        </button>
                        <button
                          disabled={actionLoading === goal.id}
                          onClick={() => handleQuickContribute(goal.id, 5000)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 text-slate-300 hover:text-cyan-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          +₹5,000
                        </button>
                        <button
                          disabled={actionLoading === goal.id}
                          onClick={() => handleQuickContribute(goal.id, 10000)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 text-slate-300 hover:text-cyan-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          +₹10,000
                        </button>
                      </div>

                      {/* Custom Contribution */}
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          placeholder="Custom Amount"
                          value={contributeAmount[goal.id] || ""}
                          onChange={(e) =>
                            setContributeAmount((prev) => ({ ...prev, [goal.id]: e.target.value }))
                          }
                          className="bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 w-28 placeholder:text-slate-700"
                        />
                        <button
                          onClick={() => handleContribute(goal.id)}
                          disabled={actionLoading === goal.id}
                          className="p-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer disabled:opacity-40"
                        >
                          <Coins size={14} />
                          Contribute
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Add Goal Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddGoal} className="glass rounded-3xl p-6 space-y-5">
            <h3 className="text-xl font-bold text-cyan-400 mb-2">Create New Goal</h3>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Goal Name
              </label>
              <input
                type="text"
                placeholder="e.g. Vacation to Bali, Rent Deposit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Target Amount (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                min="100"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Monthly Contribution (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                min="0"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-700"
              />
              <p className="text-[10px] text-slate-600">Used to forecast completion date</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Target Date (Optional)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-950 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mt-4 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle size={18} />
              Add Goal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Goals;
