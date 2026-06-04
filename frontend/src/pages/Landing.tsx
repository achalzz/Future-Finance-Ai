import { useRef, useMemo } from "react";
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
  Cpu
} from "lucide-react";

// 3D Particles Sphere Component
const ParticlesSphere = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const particlePositions = useMemo(() => {
    const count = 1200;
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
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.03;
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
        size={0.025}
        color="#06B6D4"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// 3D Rotating Glass Torus Component
const GlassTorus = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[0.9, 0.28, 30, 200]} />
      <meshPhysicalMaterial
        color="#4F8CFF"
        roughness={0.1}
        transmission={0.6}
        thickness={0.8}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transparent={true}
        opacity={0.85}
      />
    </mesh>
  );
};

// Custom Feature Card with scroll triggers and tilt effect
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}

const FeatureCard = ({ icon, title, desc, delay }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay * 0.1 }}
      className="h-full"
    >
      <Tilt
        glareEnable={true}
        glareMaxOpacity={0.08}
        glareColor="#ffffff"
        glarePosition="all"
        tiltMaxAngleX={10}
        tiltMaxAngleY={10}
        className="h-full"
      >
        <div className="glass h-full p-8 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Learn more <ArrowRight size={14} />
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
};

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain size={24} />,
      title: "AI Financial Advisor",
      desc: "Instant conversational advisory regarding budgeting benchmarks, tax-planning routes, and emergency fund coverage.",
      delay: 0,
    },
    {
      icon: <Activity size={24} />,
      title: "Budget Analyzer",
      desc: "Align your expenditures against the 50/30/20 standard models. Receive real-time insights to rebalance.",
      delay: 1,
    },
    {
      icon: <Cpu size={24} />,
      title: "Financial Health Score",
      desc: "Audit your savings rates, debt ratios, and utility trends to derive a dynamic score ranging from 0 to 100.",
      delay: 2,
    },
    {
      icon: <Target size={24} />,
      title: "Goal Forecasting",
      desc: "Intelligent forecasts calculate remaining milestones and months required to hit target dates.",
      delay: 3,
    },
    {
      icon: <Wallet size={24} />,
      title: "Expense Tracking",
      desc: "Log daily expenditures and map them under visual categories to identify lifestyle leaks immediately.",
      delay: 4,
    },
    {
      icon: <Sparkles size={24} />,
      title: "Smart Insights",
      desc: "Custom notifications flag spending increases and suggest opportunities to channel surplus cash.",
      delay: 5,
    },
    {
      icon: <FileText size={24} />,
      title: "PDF Reports",
      desc: "Export dynamic monthly reports capturing balances, category breakdowns, and advisor verdicts.",
      delay: 6,
    },
    {
      icon: <History size={24} />,
      title: "Conversation Memory",
      desc: "The AI agent remembers context across prompts, creating a fully personalized, long-term advisor profile.",
      delay: 7,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1020] text-white relative overflow-hidden select-none">
      {/* Background radial spotlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Header Glass Navbar */}
      <nav className="glass border-b border-white/5 py-4 px-8 fixed top-0 w-full z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-cyan-500/10">
              F
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
              Future Finance
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">Integrations</a>
            <a href="#demo" className="hover:text-white transition-colors">Developer API</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/15 active:scale-[0.98] cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8 max-w-7xl mx-auto min-h-screen flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        <div className="flex-1 space-y-8 text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/5 text-xs text-cyan-400 font-semibold"
          >
            <Sparkles size={14} /> AI-Powered Wealth Ecosystem
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
          >
            Your AI-Powered <br />
            <span className="text-gradient-purple font-black">
              Financial Future
            </span> <br />
            Starts Here
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg max-w-lg leading-relaxed"
          >
            Audits your monthly trends against standard 50/30/20 metrics, forecasts savings targets, logs expenditures, and generates tailored wealth-building advice.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:shadow-xl hover:shadow-cyan-500/20 flex items-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              Get Started <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="glass border border-white/10 hover:bg-white/5 hover:border-white/20 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
            >
              View Demo
            </button>
          </motion.div>

          {/* Quick Metrics Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-10 grid grid-cols-3 gap-6 max-w-md border-t border-white/5"
          >
            <div>
              <h4 className="text-2xl font-bold text-white">99%</h4>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">Accuracy</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-cyan-400">10ms</h4>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">Latency</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-emerald-400">Zero</h4>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">Data Leak</p>
            </div>
          </motion.div>
        </div>

        {/* 3D Visual Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 w-full h-[350px] md:h-[500px] relative z-10"
        >
          <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
            <ambientLight intensity={1.2} />
            <directionalLight position={[2, 4, 3]} intensity={1.5} />
            <pointLight position={[-2, -3, -1]} intensity={0.8} color="#7C3AED" />
            <ParticlesSphere />
            <GlassTorus />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
          <div className="absolute top-[80%] left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block animate-pulse">
              Interactive 3D Hologram Assistant
            </span>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-8 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass border border-white/5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <Shield size={12} /> Autonomous Analytics
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Engineered for absolute visual and analytical excellence.
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Future Finance blends machine intelligence with streamlined data configurations to offer premium personal asset management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, idx) => (
              <FeatureCard
                key={f.title}
                icon={f.icon}
                title={f.title}
                desc={f.desc}
                delay={idx}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 border-t border-white/5 relative z-10 glass bg-slate-950/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-slate-950 text-xs">
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
