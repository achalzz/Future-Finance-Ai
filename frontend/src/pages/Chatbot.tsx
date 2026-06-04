import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";
import type { ChatMessage } from "../types/chat.types";
import ChatWindow from "../features/ai-chat/ChatWindow";
import { api } from "../services/api";
import { Sparkles, HelpCircle, CheckCircle, Info } from "lucide-react";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hello! I am your AI Financial Assistant. Ask me anything about your budget, expenses, savings rate, or financial health score.",
  timestamp: new Date().toISOString(),
};

const SUGGESTED_PROMPTS = [
  "How much should I save?",
  "What is the 50/30/20 budget rule?",
  "How do I build an Emergency Fund?",
  "Where should I start investing my savings?",
];

// Floating 3D AI Assistant Core
const HologramCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = elapsed * 0.35;
      meshRef.current.rotation.x = elapsed * 0.2;
      meshRef.current.scale.setScalar(1.0 + Math.sin(elapsed * 2) * 0.04); // breathing effect
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = -elapsed * 0.15;
    }
  });

  return (
    <group>
      {/* Outer wireframe sphere */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.95, 2]} />
        <meshBasicMaterial 
          color="#06B6D4" 
          wireframe={true} 
          transparent={true} 
          opacity={0.35} 
        />
      </mesh>
      {/* Inner points grid */}
      <points ref={pointsRef}>
        <sphereGeometry args={[0.5, 10, 10]} />
        <pointsMaterial 
          size={0.04} 
          color="#4F8CFF" 
          transparent={true} 
          opacity={0.8} 
        />
      </points>
    </group>
  );
};

const Chatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([
    "View Expense Breakdown",
    "Create Emergency Fund",
    "Increase Savings Goal",
  ]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await api.post("/financial-advice", { message: content.trim() });
      const { reply, suggestedActions: newActions } = response.data;

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (newActions && Array.isArray(newActions)) {
        setSuggestedActions(newActions);
      }
    } catch (error) {
      console.warn("Backend API not reachable. Using frontend fallback response.", error);
      
      setTimeout(() => {
        const replyText = "I encountered a connection issue reaching the AI service. Please verify your internet connection or backend port configurations.";
        const assistantMsg: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          role: "assistant",
          content: replyText,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setSuggestedActions([
          "View Expense Breakdown",
          "Create Emergency Fund",
          "Increase Savings Goal",
        ]);
      }, 1000);
    } finally {
      setTimeout(() => {
        setIsTyping(false);
      }, 300);
    }
  };

  const handleActionClick = (action: string) => {
    const text = action.toLowerCase();
    if (text.includes("breakdown") || text.includes("expense") || text.includes("patterns")) {
      navigate("/expenses");
    } else if (text.includes("savings goal") || text.includes("emergency fund") || text.includes("fund")) {
      navigate("/goals");
    } else {
      handleSendMessage(action);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...WELCOME_MESSAGE,
        timestamp: new Date().toISOString(),
      },
    ]);
    setSuggestedActions([
      "View Expense Breakdown",
      "Create Emergency Fund",
      "Increase Savings Goal",
    ]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-6xl mx-auto pb-10"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
          AI Financial Advisor
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Get real-time insights, budgeting guidance, and tailored advice for building wealth.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Chat Box */}
        <div className="lg:col-span-2">
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onResetChat={handleResetChat}
            suggestedActions={suggestedActions}
            onActionClick={handleActionClick}
          />
        </div>

        {/* Right Column: Suggested Cards */}
        <div className="lg:col-span-1 flex flex-col justify-between glass rounded-3xl p-6 h-[640px] border border-white/5 hover:border-white/10 transition-all duration-300 shadow-2xl">
          <div className="space-y-4">
            {/* Hologram Canvas Container */}
            <div className="w-full h-32 relative bg-slate-950/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
              <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <HologramCore />
              </Canvas>
              <span className="absolute bottom-2 text-[8px] font-black text-cyan-400 uppercase tracking-widest pointer-events-none">
                Advisor Engine Core
              </span>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
                <Sparkles size={16} />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Suggested Topics</h3>
                <span className="text-[10px] text-slate-500 block">Click to ask the advisor directly</span>
              </div>
            </div>

            <div className="space-y-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isTyping}
                  className="w-full text-left bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 px-4 py-3 rounded-xl text-xs text-slate-350 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities Footer */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle size={14} className="text-slate-500" />
              Capabilities Overview
            </h4>
            <ul className="space-y-2 text-xs text-slate-350 text-left">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="text-cyan-400 shrink-0 mt-0.5" size={12} />
                <span>Evaluate monthly cash flow allocations</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="text-cyan-400 shrink-0 mt-0.5" size={12} />
                <span>Optimize budget using the 50/30/20 model</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="text-cyan-400 shrink-0 mt-0.5" size={12} />
                <span>Estimate ideal emergency reserves</span>
              </li>
            </ul>
            <div className="bg-slate-950/40 border border-white/5 px-4 py-2.5 rounded-2xl flex items-start gap-2.5">
              <Info size={14} className="text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-slate-500 leading-relaxed text-left">
                Insights are educational and do not constitute formal investment advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Chatbot;
