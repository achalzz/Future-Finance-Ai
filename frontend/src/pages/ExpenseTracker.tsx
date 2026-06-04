import { useState, useEffect } from "react";
import ExpenseForm from "../features/expense-tracker/ExpenseForm";
import ExpenseList from "../features/expense-tracker/ExpenseList";
import type { Expense } from "../types/finance.types";
import { getExpenses, addExpense, deleteExpense } from "../services/expense.service";
import { Wallet, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

const DEFAULT_EXPENSES: Expense[] = [
  { id: "1", title: "Rent", amount: 12000, category: "Rent", date: "2026-06-01" },
  { id: "2", title: "Fuel", amount: 2000, category: "Fuel", date: "2026-06-02" },
  { id: "3", title: "Food", amount: 500, category: "Food", date: "2026-06-03" },
  { id: "4", title: "Netflix Subscription", amount: 199, category: "Netflix", date: "2026-06-04" },
];

const MONTHLY_LIMIT = 25000;

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      setIsUsingFallback(false);
    } catch (err) {
      console.warn("Backend API offline. Falling back to local storage.", err);
      setIsUsingFallback(true);
      const saved = localStorage.getItem("future_finance_expenses");
      if (saved) {
        try {
          setExpenses(JSON.parse(saved));
        } catch (e) {
          setExpenses(DEFAULT_EXPENSES);
        }
      } else {
        setExpenses(DEFAULT_EXPENSES);
        localStorage.setItem("future_finance_expenses", JSON.stringify(DEFAULT_EXPENSES));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleAddExpense = async (expenseData: Omit<Expense, "id">) => {
    try {
      const savedExpense = await addExpense(expenseData);
      setExpenses((prev) => [savedExpense, ...prev]);
    } catch (err) {
      console.warn("Backend API error, updating local storage fallback.", err);
      const newExpense: Expense = {
        ...expenseData,
        id: Math.random().toString(36).substr(2, 9),
      };
      const updated = [newExpense, ...expenses];
      setExpenses(updated);
      localStorage.setItem("future_finance_expenses", JSON.stringify(updated));
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.warn("Backend API error, deleting locally.", err);
      const updated = expenses.filter((e) => e.id !== id);
      setExpenses(updated);
      localStorage.setItem("future_finance_expenses", JSON.stringify(updated));
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = MONTHLY_LIMIT - totalSpent;
  const percentageSpent = Math.min((totalSpent / MONTHLY_LIMIT) * 100, 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Expense Tracker
          </h1>
          <p className="text-slate-400 mt-2">
            Monitor your outgoings, categories, and keep check of your limits.
          </p>
        </div>

        {/* Sync Mode Badge */}
        {isUsingFallback && (
          <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Offline Mode: Using LocalStorage
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-3xl p-6 flex items-center justify-between">
          <div>
            <span className="text-sm text-slate-400">Total Spent</span>
            <h3 className="text-3xl font-bold text-white mt-1">
              ₹{totalSpent.toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="glass rounded-3xl p-6 flex items-center justify-between">
          <div>
            <span className="text-sm text-slate-400">Remaining Budget</span>
            <h3 className={`text-3xl font-bold mt-1 ${remainingBudget < 0 ? 'text-red-400' : 'text-green-400'}`}>
              ₹{remainingBudget.toLocaleString("en-IN")}
            </h3>
          </div>
          <div className={`p-4 rounded-2xl border ${remainingBudget < 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="glass rounded-3xl p-6 flex items-center justify-between">
          <div>
            <span className="text-sm text-slate-400">Monthly Limit</span>
            <h3 className="text-3xl font-bold text-white mt-1">
              ₹{MONTHLY_LIMIT.toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl">
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div className="glass rounded-3xl p-6">
        <div className="flex justify-between items-center text-sm font-semibold text-slate-300 mb-2">
          <span>Monthly Limit Utilization</span>
          <span className={percentageSpent > 85 ? "text-red-400" : "text-cyan-400"}>
            {percentageSpent.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentageSpent > 90
                ? "bg-gradient-to-r from-red-500 to-rose-600"
                : percentageSpent > 75
                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                : "bg-gradient-to-r from-cyan-500 to-blue-600"
            }`}
            style={{ width: `${percentageSpent}%` }}
          />
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ExpenseForm onAddExpense={handleAddExpense} />
        </div>
        <div className="lg:col-span-2">
          {loading ? (
            <div className="glass rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="text-cyan-400 animate-spin" size={32} />
              <h3 className="text-lg font-bold text-white">Loading Expenses...</h3>
            </div>
          ) : (
            <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
