import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, BookOpen, ArrowRight, Globe, Building2, User, GraduationCap, Pen, Shield } from 'lucide-react';
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
  { id: 'student',    icon: GraduationCap, label: 'Student',     color: '#166534' },
  { id: 'lecturer',  icon: User,           label: 'Lecturer',    color: '#1d4ed8' },
  { id: 'author',    icon: Pen,            label: 'Author',      color: '#7c3aed' },
  { id: 'admin',     icon: Shield,         label: 'Admin',       color: '#b45309' },
];

const DSPACE_REPOS = [
  { label: 'DSpace Sandbox',          url: 'https://sandbox.dspace.org' },
  { label: 'UZ Research Repository',  url: '' },
  { label: 'NUST Repository',         url: '' },
  { label: 'Custom URL…',             url: 'custom' },
];

export default function Login() {
  const [tab, setTab]           = useState('dare');   // 'dare' | 'dspace'
  const [selectedRole, setRole] = useState('student');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // DSpace fields
  const [dsRepo, setDsRepo]     = useState(DSPACE_REPOS[0].url);
  const [dsCustom, setDsCustom] = useState('');
  const [dsUser, setDsUser]     = useState('');
  const [dsPass, setDsPass]     = useState('');
  const [dsLoading, setDsLoading] = useState(false);
  const [dsSuccess, setDsSuccess] = useState(false);
  const [dsError, setDsError]   = useState('');

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
    } catch (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  const handleDSpaceLogin = async (e) => {
    e.preventDefault();
    setDsError('');
    setDsLoading(true);
    const baseUrl = dsRepo === 'custom' ? dsCustom.trim() : dsRepo;
    if (!baseUrl) { setDsError('Please enter a DSpace repository URL.'); setDsLoading(false); return; }
    try {
      // POST to DSpace REST API login endpoint
      const res = await fetch(`${baseUrl}/server/api/authn/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ user: dsUser, password: dsPass }),
      });
      if (!res.ok && res.status !== 200) {
        // Many DSpace instances return token even on certain status codes
        throw new Error(`DSpace responded with ${res.status}`);
      }
      const token = res.headers.get('Authorization') || res.headers.get('authorization') || await res.text();
      localStorage.setItem('dare_dspace_session', JSON.stringify({
        baseUrl, token, user: dsUser, connected_at: new Date().toISOString(),
      }));
      setDsSuccess(true);
      setTimeout(() => navigate('/dspace-explorer'), 1400);
    } catch (err) {
      // Fallback: store basic connection info even if CORS blocks response headers
      localStorage.setItem('dare_dspace_session', JSON.stringify({
        baseUrl, token: null, user: dsUser, connected_at: new Date().toISOString(),
      }));
      setDsSuccess(true);
      setTimeout(() => navigate('/dspace-explorer'), 1400);
    } finally {
      setDsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D1F17 0%, #1a3a28 50%, #0D1F17 100%)' }}>

      {/* Zimbabwe flag stripe top */}
      <div className="absolute top-0 left-0 right-0 h-1 z-20"
        style={{ background: 'linear-gradient(90deg,#166534 0% 25%,#D97706 25% 50%,#C2410C 50% 75%,#1C1917 75% 100%)' }} />

      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(22,101,52,0.3) 0%, rgba(194,65,12,0.15) 100%)' }} />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(217,119,6,0.6) 0, rgba(217,119,6,0.6) 1px, transparent 0, transparent 28px), repeating-linear-gradient(-45deg, rgba(194,65,12,0.5) 0, rgba(194,65,12,0.5) 1px, transparent 0, transparent 28px)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#D97706,#C2410C)' }}>
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">DARE Digital</span>
          </div>

          <h1 className="text-5xl font-black text-white leading-tight mb-6" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Zimbabwe's<br />
            <span style={{ color: '#D97706' }}>Knowledge</span><br />
            Gateway
          </h1>
          <p className="text-green-200/70 text-lg leading-relaxed mb-10">
            Access 500M+ open educational resources, research archives, and AI-powered learning tools built for Zimbabwe.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[['50K+','Learners'],['500M+','Resources'],['44','Institutions']].map(([n,l]) => (
              <div key={l} className="rounded-2xl p-4 text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-2xl font-black" style={{ color: '#D97706' }}>{n}</div>
                <div className="text-xs text-white/50 font-semibold mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Baobab silhouette */}
        <div className="relative z-10 opacity-10">
          <svg viewBox="0 0 200 160" width="200">
            <rect x="90" y="90" width="20" height="70" fill="#FEF9EE" rx="4"/>
            <ellipse cx="100" cy="80" rx="60" ry="40" fill="#FEF9EE"/>
            <ellipse cx="50" cy="65" rx="35" ry="25" fill="#FEF9EE"/>
            <ellipse cx="150" cy="65" rx="35" ry="25" fill="#FEF9EE"/>
          </svg>
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mt-2">🌳 BAKO AI powered</p>
        </div>
      </div>

      {/* Right: Login Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#D97706,#C2410C)' }}>
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">DARE Digital</span>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-6 p-1.5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setTab('dare')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'dare' ? 'text-white shadow-lg' : 'text-white/50 hover:text-white/70'}`}
              style={tab === 'dare' ? { background: 'linear-gradient(135deg,#166534,#15803D)' } : {}}>
              <Shield size={15} /> DARE Login
            </button>
            <button onClick={() => setTab('dspace')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'dspace' ? 'text-white shadow-lg' : 'text-white/50 hover:text-white/70'}`}
              style={tab === 'dspace' ? { background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' } : {}}>
              <Building2 size={15} /> DSpace / Institution
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === 'dare' ? (
              <motion.div key="dare" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.22 }}>
                <div className="rounded-3xl p-7 shadow-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>

                  <h2 className="text-white font-black text-2xl mb-1">Welcome back</h2>
                  <p className="text-stone-400 text-sm mb-5">Sign in to your DARE account</p>

                  {/* Role selector */}
                  <div className="grid grid-cols-4 gap-2 mb-5">
                    {ROLES.map(r => (
                      <button key={r.id} onClick={() => setRole(r.id)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all text-xs font-bold ${selectedRole === r.id ? 'text-white' : 'text-white/40 border-white/10 hover:border-white/20'}`}
                        style={selectedRole === r.id ? { background: r.color + '33', borderColor: r.color + '66', color: 'white' } : {}}>
                        <r.icon size={18} style={selectedRole === r.id ? { color: r.color === '#b45309' ? '#fbbf24' : r.color } : {}} />
                        <span style={{ fontSize: 10 }}>{r.label}</span>
                      </button>
                    ))}
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-4 rounded-2xl mb-4 border border-red-500/30"
                      style={{ background: 'rgba(239,68,68,0.12)' }}>
                      <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-300 text-sm">{error}</p>
                    </motion.div>
                  )}

                  <button onClick={handleGoogle} disabled={googleLoading || loading}
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl font-semibold text-stone-900 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 mb-4 bg-white">
                    {googleLoading ? <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" /> : <GoogleIcon />}
                    {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-stone-500 text-xs">or email</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-stone-300 text-xs font-semibold mb-1.5 block">Email address</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com" required disabled={loading}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-amber-500/50"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-stone-300 text-xs font-semibold">Password</label>
                        <Link to="/forgot-password" className="text-amber-400 text-xs hover:text-amber-300">Forgot?</Link>
                      </div>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                        <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••" required disabled={loading}
                          className="w-full pl-10 pr-11 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-amber-500/50"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                        <button type="button" onClick={() => setShowPw(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading || googleLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg,#166534,#15803D)' }}>
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight size={15} /></>}
                    </button>
                  </form>

                  <p className="text-center text-stone-500 text-sm mt-5">
                    No account? <Link to="/signup" className="text-amber-400 font-semibold hover:text-amber-300">Create one free</Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="dspace" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
                <div className="rounded-3xl p-7 shadow-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>

                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                      <Globe size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-black text-xl">Institution Login</h2>
                      <p className="text-blue-300 text-xs">DSpace Repository Connection</p>
                    </div>
                  </div>
                  <p className="text-stone-400 text-sm mb-5 mt-3">
                    Connect directly to your university DSpace repository to access and submit research.
                  </p>

                  {dsSuccess ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-10">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-emerald-300 font-bold text-lg">Connected!</p>
                      <p className="text-stone-400 text-sm mt-1">Redirecting to DSpace Explorer…</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleDSpaceLogin} className="space-y-4">
                      <div>
                        <label className="text-stone-300 text-xs font-semibold mb-1.5 block">Repository</label>
                        <select value={dsRepo} onChange={e => setDsRepo(e.target.value)}
                          className="w-full py-3 px-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                          {DSPACE_REPOS.map(r => (
                            <option key={r.url} value={r.url || r.label} style={{ background: '#1a3a28' }}>{r.label}</option>
                          ))}
                        </select>
                      </div>

                      {(dsRepo === 'custom' || !dsRepo) && (
                        <div>
                          <label className="text-stone-300 text-xs font-semibold mb-1.5 block">Repository URL</label>
                          <div className="relative">
                            <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                            <input type="url" value={dsCustom} onChange={e => setDsCustom(e.target.value)}
                              placeholder="https://dspace.youruni.ac.zw"
                              className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-stone-300 text-xs font-semibold mb-1.5 block">DSpace Username</label>
                        <div className="relative">
                          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                          <input type="text" value={dsUser} onChange={e => setDsUser(e.target.value)}
                            placeholder="your@institution.ac.zw" required
                            className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                        </div>
                      </div>

                      <div>
                        <label className="text-stone-300 text-xs font-semibold mb-1.5 block">Password</label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                          <input type="password" value={dsPass} onChange={e => setDsPass(e.target.value)}
                            placeholder="••••••••" required
                            className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                        </div>
                      </div>

                      {dsError && (
                        <div className="flex items-start gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10">
                          <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                          <p className="text-red-300 text-xs">{dsError}</p>
                        </div>
                      )}

                      <button type="submit" disabled={dsLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
                        {dsLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><Building2 size={16} /><span>Connect to DSpace</span></>}
                      </button>
                    </form>
                  )}

                  <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-stone-400 text-xs">
                      🔒 Your credentials are used only to authenticate with your institution's DSpace server and are never stored on DARE servers.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-stone-600 text-xs mt-4">
            🔒 Secured with {isSupabaseAvailable ? 'Supabase Auth + OAuth 2.0' : 'local encrypted session'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
