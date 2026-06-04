import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface FinancialHealthSphereProps {
  score: number;
  grade: string;
  rating: string;
}

const FinancialHealthSphere: React.FC<FinancialHealthSphereProps> = ({ score, grade, rating }) => {
  const [displayScore, setDisplayScore] = useState(0);

  // Smooth Count-Up Animation
  useEffect(() => {
    let start = 0;
    const end = score;
    if (start === end) return;

    const totalDuration = 1200; // ms
    const incrementTime = Math.max(Math.floor(totalDuration / end), 12);
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [score]);

  // Circumference of radius 60 circle = 2 * Math.PI * 60 = 376.99
  const circumference = 376.99;
  const strokeDashoffset = circumference - (circumference * displayScore) / 100;

  // Determine colors based on score
  const getScoreColor = (val: number) => {
    if (val >= 80) return { stroke: "#10B981", glow: "rgba(16, 185, 129, 0.3)" }; // emerald
    if (val >= 60) return { stroke: "#06B6D4", glow: "rgba(6, 182, 212, 0.3)" }; // cyan
    return { stroke: "#F43F5E", glow: "rgba(244, 63, 94, 0.3)" }; // rose
  };

  const colors = getScoreColor(score);

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Decorative Background Pulsing Glow */}
        <div 
          className="absolute w-36 h-36 rounded-full blur-[16px] opacity-25 animate-pulse transition-all duration-700" 
          style={{ backgroundColor: colors.stroke }}
        />

        {/* SVG Progress Circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor={colors.stroke} />
              <stop offset="100%" stopColor="#4F8CFF" />
            </linearGradient>
          </defs>

          {/* Underlay Track */}
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="8"
          />

          {/* Glowing Target Ring */}
          <motion.circle
            cx="70"
            cy="70"
            r="60"
            fill="transparent"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${colors.glow})`,
              transition: "stroke-dashoffset 0.1s ease-out",
            }}
          />
        </svg>

        {/* Score Inner Label */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-white tracking-tight"
          >
            {displayScore}
          </motion.span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
            Grade {grade}
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          {rating} Rating
        </h4>
        <p className="text-xs text-slate-400">
          Formulated dynamically against liquid assets
        </p>
      </div>
    </div>
  );
};

export default FinancialHealthSphere;
