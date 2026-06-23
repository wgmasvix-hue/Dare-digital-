import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, BookOpen, Sparkles, LogIn } from 'lucide-react';
import { authService } from '../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowTimeoutMessage(false);

    const timeoutId = setTimeout(() => setShowTimeoutMessage(true), 8000);

    try {
      const { error: loginError } = await authService.signIn(email, password);
      clearTimeout(timeoutId);
      if (loginError) {
        setError(loginError);
        setLoading(false);
        setShowTimeoutMessage(false);
      } else {
        navigate('/library');
      }
    } catch {
      clearTimeout(timeoutId);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
      setShowTimeoutMessage(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    const demoEmail = 'wgmasvix@gmail.com';
    const demoPassword = 'Cheryl13..';
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      const { error: loginError } = await authService.signIn(demoEmail, demoPassword);
      if (!loginError) { navigate('/library'); return; }
      if (loginError.includes('Invalid login credentials')) {
        const { error: signUpError } = await authService.signUp(demoEmail, demoPassword, 'Admin User', 'admin');
        if (signUpError) { setError('Demo account error: ' + signUpError); setLoading(false); return; }
        const { error: retryError } = await authService.signIn(demoEmail, demoPassword);
        if (retryError) { setError('Demo login failed: ' + retryError); } else { navigate('/library'); }
      } else {
        setError(loginError);
      }
    } catch {
      setError('An unexpected error occurred during demo login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-between p-12 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1200"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-teal-900/60" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <BookOpen size={20} className="text-teal-400" />
            </div>
            <div>
              <div className="font-black text-xl text-white tracking-wider">DARE</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Digital Library</div>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-black text-white leading-tight">
            Zimbabwe's knowledge<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              at your fingertips.
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Access millions of open-access books, AI-powered tutoring, and research tools — all in one place.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: '📚', text: '1M+ open-access books and textbooks' },
              { icon: '🤖', text: 'DARA AI tutor for personalised learning' },
              { icon: '🔬', text: 'Research database and citation tools' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm text-slate-300">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} DARE Digital Library · A project by ChengetAI Labs
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-16 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <BookOpen size={22} className="text-teal-600" />
            <span className="font-black text-lg text-slate-900 tracking-wider">DARE</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500">Sign in to continue to your library.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {loading && showTimeoutMessage && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm">
              <p className="font-semibold">Taking a moment…</p>
              <p className="mt-1 text-amber-600">Slow connection detected. Hang tight.</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-teal-600 font-semibold hover:text-teal-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-sm rounded-2xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : (<><LogIn size={16} /> Sign In</>)}
            </button>

            <div className="relative flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">or</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-700 font-semibold text-sm rounded-2xl border border-slate-200 transition-all disabled:opacity-60"
            >
              <Sparkles size={16} className="text-amber-500" />
              {loading ? 'Processing…' : 'Try Demo (Admin)'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-teal-600 hover:text-teal-700">
              Create one free <ArrowRight size={13} className="inline -mt-0.5" />
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
