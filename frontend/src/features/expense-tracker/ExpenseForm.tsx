import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import type { Expense } from "../../types/finance.types";

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, "id">) => void;
}

const CATEGORIES = ["Food", "Fuel", "Rent", "Netflix", "Entertainment", "Shopping", "Others"];

const ExpenseForm = ({ onAddExpense }: ExpenseFormProps) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) return;

    onAddExpense({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
    });

    setTitle("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 space-y-4">
      <h3 className="text-xl font-bold text-cyan-400 mb-2">Add New Expense</h3>

      <div className="space-y-2">
        <label className="text-xs text-slate-400 uppercase tracking-wider block">
          Expense Title
        </label>
        <input
          type="text"
          placeholder="e.g. Netflix Subscription, Fuel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-600"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider block">
            Amount (₹)
          </label>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-600"
            required
            min="0.01"
            step="any"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider block">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-950 text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400 uppercase tracking-wider block">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mt-4 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer"
      >
        <PlusCircle size={20} />
        Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;
