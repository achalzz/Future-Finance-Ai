import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, User, RefreshCw, Sparkles } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to register");
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-lg glass rounded-[32px] p-10 md:p-12 border border-white/10 relative z-10 shadow-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-3xl mx-auto shadow-lg shadow-cyan-500/10 mb-2">
            F
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
              Create Account
            </h2>
            <p className="text-slate-400 text-sm">
              Start tracking and planning your finances with AI.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-2">
              <User size={16} className="text-cyan-400" />
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-cyan-400 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-2">
              <Mail size={16} className="text-cyan-400" />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-cyan-400 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-2">
              <Lock size={16} className="text-cyan-400" />
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-cyan-400 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-5 rounded-2xl flex items-center justify-center gap-2 mt-8 hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 text-base"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <>
                <Sparkles size={18} />
                Register
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-white/5">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 hover:underline font-semibold transition-all">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
