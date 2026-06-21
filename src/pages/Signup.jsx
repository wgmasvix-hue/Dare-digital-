import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const ROLES = [
  { value: 'student', label: '🎓 Student' },
  { value: 'lecturer', label: '👨‍🏫 Lecturer' },
  { value: 'researcher', label: '🔬 Researcher' },
];

const pwStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
};

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, isSupabaseAvailable } = useAuth();
  const strength = pwStrength(password);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await signUpWithEmail(email, password, name, role);
      if (err) { setError(err); setLoading(false); return; }
      if (isSupabaseAvailable) {
        setSuccess('Account created! Check your email to verify, then sign in.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        navigate('/library');
      }
    } catch (err) {
      setError(err.message || 'Sign-up failed.');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8"
      style={{ background: 'linear-gradient(135deg, #0D1F17 0%, #1a3a28 60%, #0D1F17 100%)' }}>

      <div className="absolute top-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(90deg,#166534 0% 25%,#D97706 25% 50%,#C2410C 50% 75%,#1C1917 75% 100%)' }} />
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: '#D97706' }} />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: '#166534' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#D97706,#C2410C)' }}>
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">DARE Digital</span>
          </div>
          <p className="text-stone-400 text-sm">Create your free account</p>
        </div>

        <div className="rounded-3xl p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>

          <h2 className="text-white font-black text-2xl mb-2">Join DARE</h2>
          <p className="text-stone-400 text-sm mb-6">Free access to Zimbabwe's largest learning platform</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-2xl mb-4 border border-red-500/30"
              style={{ background: 'rgba(239,68,68,0.12)' }}>
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-2xl mb-4 border border-green-500/30"
              style={{ background: 'rgba(34,197,94,0.12)' }}>
              <CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" />
              <p className="text-green-300 text-sm">{success}</p>
            </motion.div>
          )}

          <button onClick={handleGoogle} disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl font-semibold text-stone-900 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 mb-4"
            style={{ background: 'white' }}>
            {googleLoading ? <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" /> : <GoogleIcon />}
            {googleLoading ? 'Redirecting…' : 'Sign up with Google'}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-stone-500 text-xs font-medium">or with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-stone-300 text-xs font-semibold mb-1.5 block">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tendai Moyo"
                  required disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
              </div>
            </div>

            <div>
              <label className="text-stone-300 text-xs font-semibold mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  required disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
              </div>
            </div>

            <div>
              <label className="text-stone-300 text-xs font-semibold mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters" required disabled={loading}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-stone-400">{strength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-stone-300 text-xs font-semibold mb-2 block">I am a…</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className={`p-2.5 rounded-2xl text-center transition-all text-xs font-semibold border ${role === r.value
                      ? 'border-amber-500 text-amber-300'
                      : 'border-white/10 text-stone-400 hover:border-white/20'}`}
                    style={{ background: role === r.value ? 'rgba(217,119,6,0.15)' : 'rgba(255,255,255,0.04)' }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg,#166534,#15803D)' }}>
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 font-semibold hover:text-amber-300">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-stone-600 text-xs mt-4">
          🔒 Secured · No spam · Free forever
        </p>
      </motion.div>
    </div>
  );
}
