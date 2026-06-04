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
    <aside className="w-72 glass border-r border-white/10 p-6 flex flex-col shrink-0 min-h-screen bg-slate-950/20 backdrop-blur-xl">
      {/* Brand logo header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-extrabold text-slate-950 text-2xl shadow-[0_0_15px_rgba(34,211,238,0.35)] shrink-0">
          F
        </div>
        <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
          Future Finance
        </h1>
      </div>

      {/* Navigation menu items */}
      <nav className="mt-12 space-y-3 flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center gap-4 py-3.5 pr-4 pl-8 rounded-xl text-base font-medium transition-all duration-300 cursor-pointer border ${
                isActive
                  ? "bg-slate-800/70 border-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "text-slate-400 border-transparent hover:text-slate-100 hover:bg-slate-800/30 hover:border-white/5 hover:translate-x-1"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.5)] animate-pulse" />
                )}
                
                {/* Icon Container */}
                <div
                  className={`transition-all duration-300 ${
                    isActive
                      ? "text-cyan-400 scale-110 drop-shadow-[0_0_6px_rgba(34,211,238,0.35)]"
                      : "text-slate-400 group-hover:text-cyan-400/80 group-hover:scale-105"
                  }`}
                >
                  {item.icon}
                </div>
                
                {/* Name */}
                <span className="transition-colors duration-300">
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile Footer with Logout Button */}
      <div className="pt-6 border-t border-white/10 mt-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.05)] uppercase shrink-0">
              {user?.name ? user.name.slice(0, 2) : "JD"}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-100 truncate">
                {user?.name || "John Doe"}
              </h4>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 mt-0.5">
                Premium
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all duration-300 cursor-pointer shrink-0"
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
