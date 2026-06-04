import { useRef, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import * as THREE from "three";
import {
  ArrowRight,
  Brain,
  Wallet,
  Target,
  Activity,
  FileText,
  History,
  Sparkles,
  Shield,
  Cpu,
  Zap,
  Bot,
  BarChart3,
  Lock,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

// ─── Typewriter Hook ─────────────────────────────────────────────────────────
const useTypewriter = (texts: string[], speed = 60, pause = 2000) => {
  const [displayed, setDisplayed] = useState("");
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTextIdx((i) => (i + 1) % texts.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts, speed, pause]);

  useEffect(() => {
    setDisplayed(texts[textIdx].slice(0, charIdx));
  }, [charIdx, textIdx, texts]);

  return displayed;
};

// ─── 3D Particles Sphere ─────────────────────────────────────────────────────
const ParticlesSphere = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const particlePositions = useMemo(() => {
    const count = 1400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.8 * Math.cbrt(Math.random());
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const px = state.pointer?.x || 0;
      const py = state.pointer?.y || 0;
      const elapsed = state.clock.getElapsedTime();
      pointsRef.current.rotation.y = THREE.MathUtils.lerp(
        pointsRef.current.rotation.y,
        elapsed * 0.05 + px * 0.3,
        0.05
      );
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        elapsed * 0.03 - py * 0.3,
        0.05
      );
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlePositions, 3]}
          count={particlePositions.length / 3}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#06B6D4"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// ─── 3D Slim Dual-Ring Torus ──────────────────────────────────────────────────
const GlassTorus = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const px = state.pointer?.x || 0;
    const py = state.pointer?.y || 0;
    const elapsed = state.clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, elapsed * 0.25 + px * 0.5, 0.07);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, elapsed * 0.12 - py * 0.3, 0.07);
      meshRef.current.position.y = Math.sin(elapsed * 1.5) * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = THREE.MathUtils.lerp(ring2Ref.current.rotation.y, -elapsed * 0.18 - px * 0.4, 0.07);
      ring2Ref.current.rotation.x = THREE.MathUtils.lerp(ring2Ref.current.rotation.x, elapsed * 0.22 + py * 0.4, 0.07);
      ring2Ref.current.position.y = Math.sin(elapsed * 1.5) * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} rotation={[Math.PI / 5, 0, 0]}>
        <torusGeometry args={[1.0, 0.055, 24, 120]} />
        <meshPhysicalMaterial
          color="#4F8CFF"
          roughness={0.05}
          metalness={0.1}
          transmission={0.5}
          thickness={0.5}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          transparent={true}
          opacity={0.9}
        />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[0.72, 0.03, 16, 80]} />
        <meshPhysicalMaterial
          color="#22D3EE"
          roughness={0.05}
          metalness={0.1}
          transmission={0.4}
          clearcoat={1.0}
          transparent={true}
          opacity={0.75}
        />
      </mesh>
    </group>
  );
};

// ─── Feature Card ─────────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
  color: string;
}

const FeatureCard = ({ icon, title, desc, delay, color }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: delay * 0.08 }}
  >
    <Tilt
      glareEnable={true}
      glareMaxOpacity={0.06}
      glareColor="#ffffff"
      glarePosition="all"
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
    >
      <div className="glass h-full p-6 rounded-2xl border border-white/5 hover:border-white/15 transition-all duration-300 flex flex-col gap-4 hover:shadow-[0_0_25px_rgba(6,182,212,0.08)] group cursor-default">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
      </div>
    </Tilt>
  </motion.div>
);

// ─── Scrolling Ticker ─────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "AI Budget Analysis", "50/30/20 Rule Engine", "Real-Time Insights",
  "Goal Forecasting", "Expense Intelligence", "Health Score", "PDF Reports",
  "Chat Memory", "Wealth Building", "Zero Data Leak",
];

const Ticker = () => (
  <div className="overflow-hidden whitespace-nowrap py-3 border-y border-white/5 bg-slate-950/40 select-none">
    <motion.div
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="inline-flex gap-10"
    >
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
        <span key={i} className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span className="w-1 h-1 rounded-full bg-cyan-500/60 inline-block" />
          {item}
        </span>
      ))}
    </motion.div>
  </div>
);

// ─── Main Landing Page ────────────────────────────────────────────────────────
const Landing = () => {
  const navigate = useNavigate();
  const typed = useTypewriter(
    ["Budget Smarter.", "Invest with Confidence.", "Build Wealth Faster.", "Retire on Your Terms."],
    65,
    2200
  );

  const features = [
    { icon: <Brain size={20} />, title: "AI Financial Advisor", desc: "Instant conversational advisory on budgets, tax routes, and emergency fund coverage.", delay: 0, color: "bg-violet-500/10 border border-violet-500/20 text-violet-400" },
    { icon: <Activity size={20} />, title: "Budget Analyzer", desc: "Align expenditures against 50/30/20 benchmarks. Get real-time rebalancing insights.", delay: 1, color: "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400" },
    { icon: <Cpu size={20} />, title: "Health Score", desc: "Audit savings rates, debt ratios, and trends for a dynamic score from 0–100.", delay: 2, color: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" },
    { icon: <Target size={20} />, title: "Goal Forecasting", desc: "Intelligent projections calculate remaining milestones and target completion dates.", delay: 3, color: "bg-orange-500/10 border border-orange-500/20 text-orange-400" },
    { icon: <Wallet size={20} />, title: "Expense Tracking", desc: "Log daily expenditures and map them visually to identify lifestyle leaks.", delay: 4, color: "bg-pink-500/10 border border-pink-500/20 text-pink-400" },
    { icon: <Sparkles size={20} />, title: "Smart Insights", desc: "Custom alerts flag spending increases and suggest surplus cash opportunities.", delay: 5, color: "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400" },
    { icon: <FileText size={20} />, title: "PDF Reports", desc: "Export dynamic monthly reports with category breakdowns and advisor verdicts.", delay: 6, color: "bg-blue-500/10 border border-blue-500/20 text-blue-400" },
    { icon: <History size={20} />, title: "Chat Memory", desc: "The AI remembers context across prompts, building a long-term advisor profile.", delay: 7, color: "bg-teal-500/10 border border-teal-500/20 text-teal-400" },
  ];

  const steps = [
    { num: "01", icon: <Bot size={22} />, title: "Connect Your Data", desc: "Log expenses, income, and goals through a guided setup or manual input. Fully encrypted." },
    { num: "02", icon: <Brain size={22} />, title: "AI Learns Your Patterns", desc: "The AI engine analyzes your spending behavior, maps it to financial benchmarks, and builds a model of your habits." },
    { num: "03", icon: <BarChart3 size={22} />, title: "Get Actionable Reports", desc: "Receive a personalized Health Score, category breakdowns, and specific steps to improve your financial trajectory." },
    { num: "04", icon: <TrendingUp size={22} />, title: "Track and Grow", desc: "Set wealth goals, monitor forecasts, and chat with the AI advisor whenever you need guidance." },
  ];

  return (
    <div className="min-h-screen bg-[#060C1A] text-white relative overflow-hidden">
      {/* ── Animated Grid Background ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Radial glow orbs ── */}
      <div className="pointer-events-none fixed top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-700/10 blur-[140px] z-0" />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-700/8 blur-[130px] z-0" />
      <div className="pointer-events-none fixed top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-cyan-600/5 blur-[100px] z-0" />

      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-[#060C1A]/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-cyan-500/20">
              F
            </div>
            <span className="text-base font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
              Future Finance
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#how" className="hover:text-cyan-400 transition-colors">How It Works</a>
            <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.97] cursor-pointer"
            >
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Ticker ── */}
      <div className="fixed top-[61px] w-full z-40">
        <Ticker />
      </div>

      {/* ── Hero Section ── */}
      <section className="relative z-10 pt-40 pb-20 px-8 max-w-7xl mx-auto min-h-screen flex flex-col lg:flex-row items-center justify-between gap-16">

        {/* Left copy */}
        <div className="flex-1 space-y-8 text-left max-w-xl">
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs text-cyan-400 font-semibold"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            AI Engine Active · v2.0
          </motion.div>

          {/* Hero heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-2"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight">
              Your AI-Powered<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
                Financial Future
              </span><br />
              Starts Here
            </h1>
            {/* Typewriter line */}
            <div className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-slate-400 h-9 pt-1">
              <span>{typed}</span>
              <span className="inline-block w-0.5 h-6 bg-cyan-400 animate-pulse rounded" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md"
          >
            Future Finance audits your monthly trends against 50/30/20 metrics, forecasts savings targets, logs expenditures, and delivers tailored wealth-building advice powered by real-time AI.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-cyan-500/30 flex items-center gap-2 active:scale-[0.97] cursor-pointer text-sm"
            >
              Start Free <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border border-white/10 hover:border-white/25 bg-white/3 hover:bg-white/6 text-white font-semibold px-8 py-4 rounded-2xl transition-all text-sm cursor-pointer"
            >
              View Demo
            </button>
          </motion.div>

          {/* Trust metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5 max-w-sm"
          >
            {[
              { val: "99%", label: "Accuracy", color: "text-white" },
              { val: "10ms", label: "Latency", color: "text-cyan-400" },
              { val: "Zero", label: "Data Leak", color: "text-emerald-400" },
            ].map(({ val, label, color }) => (
              <div key={label}>
                <p className={`text-2xl font-extrabold ${color}`}>{val}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex items-center gap-4 flex-wrap"
          >
            {[
              { icon: <Lock size={12} />, text: "Bank-level Encryption" },
              { icon: <Shield size={12} />, text: "SOC2 Ready" },
              { icon: <Zap size={12} />, text: "Real-time AI" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="text-slate-500">{icon}</span> {text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: 3D Hologram + floating card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="flex-1 w-full h-[380px] md:h-[520px] relative z-10"
        >
          {/* Ambient glow behind canvas */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-radial from-cyan-600/10 via-transparent to-transparent pointer-events-none" />

          <Canvas camera={{ position: [0, 0, 4], fov: 42 }}>
            <ambientLight intensity={1.2} />
            <directionalLight position={[2, 4, 3]} intensity={1.5} />
            <pointLight position={[-2, -3, -1]} intensity={0.8} color="#7C3AED" />
            <pointLight position={[2, 2, 2]} intensity={0.5} color="#06B6D4" />
            <ParticlesSphere />
            <GlassTorus />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
          </Canvas>

          {/* Floating AI status card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-64 glass border border-white/8 rounded-2xl p-4 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Bot size={14} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white">AI Advisor</p>
                <p className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Analyzing your portfolio
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Budget Health", val: "87/100" },
                { label: "Savings Rate", val: "23%" },
                { label: "Debt Ratio", val: "0.18" },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-white font-semibold">{val}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "87%" }}
                transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              />
            </div>
            <p className="text-[9px] text-slate-600 mt-1.5">Overall Financial Score: 87/100</p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── AI Introduction / How It Works ── */}
      <section id="how" className="relative z-10 py-28 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs text-violet-400 font-semibold uppercase tracking-wider"
            >
              <Brain size={12} /> How the AI Works
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight"
            >
              Intelligent finance,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                engineered for you
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-sm leading-relaxed"
            >
              A four-step intelligent loop that continuously learns, adapts, and improves your financial outcomes.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line for large screens */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent pointer-events-none" />

            {steps.map(({ num, icon, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className="glass border border-white/5 hover:border-cyan-500/20 rounded-2xl p-6 text-left space-y-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.07)] h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      {icon}
                    </div>
                    <span className="text-4xl font-black text-white/5 select-none leading-none">{num}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="relative z-10 py-28 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 font-semibold uppercase tracking-wider"
            >
              <Shield size={12} /> Full Feature Suite
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-extrabold tracking-tight"
            >
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                master your money
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-sm leading-relaxed"
            >
              Future Finance blends machine intelligence with streamlined data configurations to deliver premium personal asset management.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, idx) => (
              <FeatureCard key={f.title} {...f} delay={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass border border-cyan-500/15 rounded-3xl p-12 text-center relative overflow-hidden"
          >
            {/* Glow inside card */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/8 via-transparent to-violet-600/8 pointer-events-none rounded-3xl" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-widest">
                <Sparkles size={14} /> Start Your Wealth Journey
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Ready to take control of<br />
                <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  your financial future?
                </span>
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                Join thousands using Future Finance to make smarter financial decisions every day — all powered by AI.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate("/register")}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-10 py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-cyan-500/30 flex items-center gap-2 active:scale-[0.97] cursor-pointer"
                >
                  Get Started Free <ArrowRight size={16} />
                </button>
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-slate-600 flex-wrap pt-2">
                {["No credit card required", "Free forever plan", "Cancel anytime"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle size={11} className="text-emerald-500" /> {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-10 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-slate-950 text-xs">
              F
            </div>
            <span className="font-bold text-slate-400">Future Finance AI</span>
          </div>
          <p>© 2026 Future Finance. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
