import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@finance.io');
    setPassword('password123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-emerald-500/[0.04] blur-[120px] rounded-full -z-10"
      />

      {/* Main Auth Container */}
      <div className="w-full max-w-md">
        {/* Brand / Title Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            FINANCIAL COMMAND CENTER
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Access Terminal
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1.5">
            Authenticate to inspect encrypted liquidity and portfolio metrics.
          </p>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl bg-[#121215] border border-[#27272a] p-6 sm:p-8 shadow-2xl">
          {/* Top glow border */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investor@commandcenter.io"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 text-sm text-white placeholder-zinc-500 outline-none transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 text-sm text-white placeholder-zinc-500 outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_-3px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-5 pt-5 border-t border-[#27272a]/70">
            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full py-2 px-3 rounded-xl bg-[#09090b] hover:bg-[#16161b] border border-[#27272a] text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Use Demo Account (demo@finance.io)</span>
            </button>
          </div>

          {/* Navigation to Register */}
          <div className="mt-6 text-center text-xs text-[#a1a1aa]">
            <span>Need an enterprise account? </span>
            <Link
              to="/register"
              className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Security watermark */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-[#71717a] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>256-Bit TLS End-to-End Handshake</span>
        </div>
      </div>
    </div>
  );
}
