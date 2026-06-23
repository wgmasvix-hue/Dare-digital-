import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

const ROLES = [
  { value: 'student', label: 'Student', icon: '🎓', desc: 'Access textbooks & AI tutoring' },
  { value: 'lecturer', label: 'Lecturer', icon: '👨‍🏫', desc: 'Teaching tools & lesson planning' },
  { value: 'author', label: 'Author', icon: '✍️', desc: 'Publish & share your work' },
];

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', role: 'student'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error: signupError } = await authService.signUp(
      formData.email, formData.password, formData.fullName, formData.role
    );

    if (signupError) {
      setError(signupError);
      setLoading(false);
    } else {
      setSuccess('Account created! Check your email to verify, then sign in.');
      setTimeout(() => navigate('/login'), 3500);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1200"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-900/60" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
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
            Join thousands of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Zimbabwean learners.
            </span>
          </h2>
          <div className="flex flex-col gap-4">
            {[
              'Free access to 1M+ open-access resources',
              'AI-powered DARA tutor for any subject',
              'Earn XP and climb the leaderboard',
              'Track your reading history & progress',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} DARE Digital Library · A project by ChengetAI Labs
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <BookOpen size={22} className="text-teal-600" />
            <span className="font-black text-lg text-slate-900 tracking-wider">DARE</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-500">Free forever. No credit card required.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-700 text-sm">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Role picker */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">I am a…</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: r.value }))}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border text-center transition-all text-xs font-semibold ${
                      formData.role === r.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1.5">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="fullName" name="fullName" type="text" placeholder="Your name"
                  value={formData.fullName} onChange={handleChange} required disabled={loading}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email" name="email" type="email" placeholder="you@example.com"
                  value={formData.email} onChange={handleChange} required disabled={loading}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password" name="password" type="password" placeholder="Min 6 chars"
                    value={formData.password} onChange={handleChange} required disabled={loading} minLength={6}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-60"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirmPassword" name="confirmPassword" type="password" placeholder="Repeat"
                    value={formData.confirmPassword} onChange={handleChange} required disabled={loading}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-sm rounded-2xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account…' : (<><GraduationCap size={16} /> Create Free Account</>)}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
              Sign in <ArrowRight size={13} className="inline -mt-0.5" />
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-slate-400">
            By signing up you agree to our{' '}
            <Link to="/terms" className="underline hover:text-slate-600">Terms</Link> and{' '}
            <Link to="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
