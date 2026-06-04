import type { Expense } from "../../types/finance.types";
import { Utensils, Fuel, Home, Tv, ShoppingBag, Trash2 } from "lucide-react";

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "food":
      return <Utensils className="text-orange-400" size={20} />;
    case "fuel":
      return <Fuel className="text-cyan-400" size={20} />;
    case "rent":
      return <Home className="text-purple-400" size={20} />;
    case "netflix":
    case "entertainment":
    case "subscription":
      return <Tv className="text-red-400" size={20} />;
    default:
      return <ShoppingBag className="text-emerald-400" size={20} />;
  }
};

const ExpenseCard = ({ expense, onDelete }: ExpenseCardProps) => {
  const formattedDate = new Date(expense.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="glass rounded-2xl p-4 flex items-center justify-between hover:scale-[1.01] transition-transform duration-200">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          {getCategoryIcon(expense.category)}
        </div>
        <div>
          <h4 className="font-semibold text-white">{expense.title}</h4>
          <span className="text-xs text-slate-400">{formattedDate} • {expense.category}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-cyan-400">
          ₹{expense.amount.toLocaleString("en-IN")}
        </span>
        <button
          onClick={() => onDelete(expense.id)}
          className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5"
          title="Delete expense"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default ExpenseCard;
