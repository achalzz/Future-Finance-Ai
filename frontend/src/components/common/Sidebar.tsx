import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Calculator,
  Brain,
  Target,
  LogOut,
} from "lucide-react";
import { ROUTES } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: ROUTES.DASHBOARD,
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Budget Planner",
      path: ROUTES.BUDGET,
      icon: <Calculator size={20} />,
    },
    {
      name: "Expense Tracker",
      path: ROUTES.EXPENSES,
      icon: <Wallet size={20} />,
    },
    {
      name: "Savings Goals",
      path: ROUTES.GOALS,
      icon: <Target size={20} />,
    },
    {
      name: "AI Advisor",
      path: ROUTES.CHAT,
      icon: <Brain size={20} />,
    },
  ];

  return (
    <aside className="w-64 glass border-r border-white/10 p-6 flex flex-col shrink-0 min-h-screen">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-slate-950 text-lg">
          F
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Future Finance
        </h1>
      </div>

      <nav className="mt-10 space-y-2 flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Profile Footer with Logout Button */}
      <div className="pt-6 border-t border-white/10 mt-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center font-semibold text-white uppercase">
              {user?.name ? user.name.slice(0, 2) : "JD"}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white max-w-[100px] truncate">
                {user?.name || "John Doe"}
              </h4>
              <span className="text-[10px] text-slate-500 block">Premium</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
