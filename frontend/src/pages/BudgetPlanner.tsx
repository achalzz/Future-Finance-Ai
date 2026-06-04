import { useState, useEffect } from "react";
import { Calculator, ShieldAlert, CheckCircle, TrendingUp } from "lucide-react";
import { getBudget, saveBudget } from "../services/finance.service";

interface BudgetCalculation {
  savingsRate: number;
  financialScore: number;
  needs: number;
  wants: number;
  savings: number;
  recommendations: string[];
}

const BudgetPlanner = () => {
  const [income, setIncome] = useState<string>("");
  const [savingsGoal, setSavingsGoal] = useState<string>("");
  const [expenses, setExpenses] = useState<string>("");
  const [results, setResults] = useState<BudgetCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  // Load last inputs if any
  useEffect(() => {
    const loadBudgetData = async () => {
      try {
        const budget = await getBudget();
        if (budget && (budget.income || budget.savingsGoal)) {
          setIncome(budget.income ? budget.income.toString() : "");
          setSavingsGoal(budget.savingsGoal ? budget.savingsGoal.toString() : "");
          
          const saved = localStorage.getItem("future_finance_budget_inputs");
          let expStr = "";
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              expStr = parsed.expenses || "";
            } catch {}
          }
          setExpenses(expStr);
          calculateBudget(budget.income.toString(), budget.savingsGoal.toString(), expStr, false);
          return;
        }
      } catch (err) {
        console.warn("Failed to load budget from API, falling back to local storage:", err);
      }

      const saved = localStorage.getItem("future_finance_budget_inputs");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setIncome(parsed.income || "");
          setSavingsGoal(parsed.savingsGoal || "");
          setExpenses(parsed.expenses || "");
          if (parsed.hasResults) {
            calculateBudget(parsed.income, parsed.savingsGoal, parsed.expenses, false);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadBudgetData();
  }, []);

  const calculateBudget = (incVal: string, goalVal: string, expVal: string, saveToStorage = true) => {
    const inc = parseFloat(incVal);
    const goal = parseFloat(goalVal);
    const exp = parseFloat(expVal);

    if (isNaN(inc) || isNaN(goal) || isNaN(exp) || inc <= 0) return;

    if (saveToStorage) {
      localStorage.setItem(
        "future_finance_budget_inputs",
        JSON.stringify({ income: incVal, savingsGoal: goalVal, expenses: expVal, hasResults: true })
      );
    }

    const currentSavings = inc - exp;
    const savingsRate = Math.max(0, (currentSavings / inc) * 100);

    // Calculate a dynamic Financial Health Score
    // Higher savings rate + meeting savings goal = higher score
    let score = 50;
    if (savingsRate >= 30) score += 30;
    else if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 10;

    if (currentSavings >= goal) {
      score += 20;
    } else {
      const goalRatio = currentSavings > 0 ? currentSavings / goal : 0;
      score += Math.round(goalRatio * 15);
    }

    if (exp / inc > 0.8) {
      score -= 15;
    }
    score = Math.max(10, Math.min(100, score));

    // Recommend budget based on standard 50/30/20 but adapt to their goal
    let targetSavingsPercent = Math.max(20, Math.round((goal / inc) * 100));
    if (targetSavingsPercent > 60) targetSavingsPercent = 60; // Caps recommendations to realistic bounds

    const recommendedSavings = Math.round(inc * (targetSavingsPercent / 100));
    const remainingForNeedsAndWants = inc - recommendedSavings;
    const recommendedNeeds = Math.round(remainingForNeedsAndWants * 0.625); // ~50% total
    const recommendedWants = Math.round(remainingForNeedsAndWants * 0.375); // ~30% total

    // Generate specific recommendations based on user numbers
    const recommendations: string[] = [];
    if (savingsRate < 20) {
      recommendations.push("Your savings rate is below the recommended 20%. Try cutting discretionary spending in the 'Wants' category.");
    } else {
      recommendations.push("Excellent job! Your savings rate exceeds the baseline 20% mark. Consider investing the surplus.");
    }

    if (currentSavings < goal) {
      const gap = goal - currentSavings;
      recommendations.push(`You are short of your monthly savings goal by ₹${gap.toLocaleString("en-IN")}. Look to reduce bills or explore side income options.`);
    } else {
      recommendations.push("Congratulations! You are meeting your monthly savings target comfortably.");
    }

    if (exp / inc > 0.7) {
      recommendations.push("Alert: Fixed expenses occupy over 70% of your income. Evaluate subscriptions and utility packages.");
    }

    setResults({
      savingsRate,
      financialScore: score,
      needs: recommendedNeeds,
      wants: recommendedWants,
      savings: recommendedSavings,
      recommendations,
    });
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const inc = parseFloat(income);
      const goal = parseFloat(savingsGoal);
      if (!isNaN(inc) && !isNaN(goal)) {
        await saveBudget({ income: inc, savingsGoal: goal });
      }
    } catch (err) {
      console.warn("Failed to save budget settings to API:", err);
    }
    setTimeout(() => {
      calculateBudget(income, savingsGoal, expenses);
      setLoading(false);
    }, 800); // realistic minor calculation delay
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          AI Budget Planner
        </h1>
        <p className="text-slate-400 mt-2">
          Input your financials and let the system model the recommended path.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCalculate} className="glass rounded-3xl p-6 space-y-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-2">Financial Settings</h3>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 uppercase tracking-wider block">
                Monthly Income (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 80000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-700"
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 uppercase tracking-wider block">
                Savings Goal (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 20000"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-700"
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 uppercase tracking-wider block">
                Current Monthly Expenses (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-700"
                required
                min="0"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mt-4 hover:shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Calculating...</span>
              ) : (
                <>
                  <Calculator size={20} />
                  Calculate AI Budget
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {results ? (
            <div className="space-y-6">
              {/* Financial Health & Savings Rate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Score */}
                <div className="glass rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-slate-400 mb-2">Financial Score</span>
                  <div className="relative flex items-center justify-center w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="url(#cyanBlueGradient)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * results.financialScore) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="cyanBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute text-4xl font-extrabold text-white">
                      {results.financialScore}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-3">
                    {results.financialScore >= 80
                      ? "Excellent Financial Health"
                      : results.financialScore >= 65
                      ? "Healthy Financial Health"
                      : "Improvement Needed"}
                  </span>
                </div>

                {/* Savings Rate Card */}
                <div className="glass rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-sm text-slate-400">Calculated Savings Rate</span>
                    <h2 className="text-5xl font-black text-white mt-4">
                      {results.savingsRate.toFixed(1)}%
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-green-400 mt-4">
                    <TrendingUp size={20} />
                    <span className="text-xs">
                      Baseline standard: 20%
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Budget breakdown (50/30/20 adapt) */}
              <div className="glass rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Recommended AI Budget Allocation</h3>
                <div className="space-y-4">
                  {/* Needs */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Needs (Fixed bills, housing, essentials)</span>
                      <span className="text-white font-semibold">₹{results.needs.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${(results.needs / parseFloat(income)) * 100}%` }} />
                    </div>
                  </div>

                  {/* Wants */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Wants (Dining out, shopping, lifestyle)</span>
                      <span className="text-white font-semibold">₹{results.wants.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400" style={{ width: `${(results.wants / parseFloat(income)) * 100}%` }} />
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Savings & Investment (Target goals)</span>
                      <span className="text-white font-semibold">₹{results.savings.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${(results.savings / parseFloat(income)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="glass rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">AI Financial Insights</h3>
                <div className="space-y-3">
                  {results.recommendations.map((rec, index) => (
                    <div key={index} className="flex gap-3 items-start bg-white/5 p-4 rounded-xl border border-white/5">
                      {rec.includes("Alert") ? (
                        <ShieldAlert className="text-amber-400 shrink-0 mt-0.5" size={18} />
                      ) : (
                        <CheckCircle className="text-cyan-400 shrink-0 mt-0.5" size={18} />
                      )}
                      <p className="text-sm text-slate-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
              <Calculator size={48} className="text-slate-600 mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-white">No Calculation Yet</h3>
              <p className="text-slate-400 max-w-sm mt-2">
                Enter your monthly numbers and hit calculate to receive personalized AI budget models and financial advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
