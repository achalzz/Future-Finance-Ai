import React from "react";
import Tilt from "react-parallax-tilt";
import { Wallet, Target, Activity, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  status: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, status }) => {
  // Select icon based on title
  const getIcon = () => {
    const t = title.toLowerCase();
    if (t.includes("net")) return <Wallet size={16} className="text-cyan-400" />;
    if (t.includes("emergency")) return <Target size={16} className="text-purple-400" />;
    if (t.includes("expense")) return <Activity size={16} className="text-rose-400" />;
    return <TrendingUp size={16} className="text-emerald-400" />;
  };

  // Determine status color
  const getStatusColor = () => {
    const s = status.toLowerCase();
    if (s.includes("over") || s.includes("leak") || s.includes("critical")) return "text-rose-400";
    if (s.includes("no") || s.includes("add")) return "text-slate-500";
    return "text-emerald-400";
  };

  return (
    <Tilt
      glareEnable={true}
      glareMaxOpacity={0.05}
      glareColor="#ffffff"
      glarePosition="all"
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
    >
      <div className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all duration-300 flex flex-col justify-between h-36">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            {title}
          </span>
          <div className="p-2 rounded-xl bg-white/3 border border-white/5">
            {getIcon()}
          </div>
        </div>

        <div className="space-y-1.5 mt-2">
          <h3 className="text-2xl font-black text-white tracking-tight truncate">
            {value}
          </h3>
          <p className={`text-[10px] font-semibold tracking-wide ${getStatusColor()} truncate`}>
            {status}
          </p>
        </div>
      </div>
    </Tilt>
  );
};

export default StatCard;
