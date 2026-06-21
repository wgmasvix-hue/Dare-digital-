import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/library';
  const { signInWithEmail, signInWithGoogle, isSupabaseAvailable } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await signInWithEmail(email, password);
      if (err) { setError(err); setLoading(false); return; }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Supabase redirects automatically; no navigate() needed
    } catch (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D1F17 0%, #1a3a28 60%, #0D1F17 100%)' }}>

      {/* Zimbabwe flag stripe */}
      <div className="absolute top-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(90deg,#166534 0% 25%,#D97706 25% 50%,#C2410C 50% 75%,#1C1917 75% 100%)' }} />

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: '#D97706' }} />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: '#166534' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#D97706,#C2410C)' }}>
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">DARE Digital</span>
          </div>
          <p className="text-stone-400 text-sm">Zimbabwe's Open Academic Resource Engine</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>

          <h2 className="text-white font-black text-2xl mb-2">Welcome back</h2>
          <p className="text-stone-400 text-sm mb-6">Sign in to access 500M+ learning resources</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-2xl mb-5 border border-red-500/30"
              style={{ background: 'rgba(239,68,68,0.12)' }}>
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Google Sign-In */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl font-semibold text-stone-900 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 mb-4"
            style={{ background: 'white' }}
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
            ) : <GoogleIcon />}
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-stone-500 text-xs font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-stone-300 text-xs font-semibold mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-stone-300 text-xs font-semibold">Password</label>
                <Link to="/forgot-password" className="text-amber-400 text-xs hover:text-amber-300">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg,#166534,#15803D)' }}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm mt-6">
            No account?{' '}
            <Link to="/signup" className="text-amber-400 font-semibold hover:text-amber-300">Create one free</Link>
          </p>
        </div>

        {/* Security note */}
        <p className="text-center text-stone-600 text-xs mt-4">
          🔒 Secured with {isSupabaseAvailable ? 'Supabase Auth + OAuth 2.0' : 'local encrypted session'}
        </p>
      </motion.div>
    </div>
  );
}
