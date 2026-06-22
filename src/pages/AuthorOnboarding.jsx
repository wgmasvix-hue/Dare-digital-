import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, BookOpen, Globe, Sparkles, Check, ChevronRight, Upload, Building2, Pen, Layers, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SUBJECTS = ['Mathematics','English','Biology','Chemistry','Physics','History','Geography','Business Studies','Agriculture','Computer Science','Shona','Ndebele','Art & Design','Music','Physical Education'];
const LEVELS = ['Primary (ECD–Grade 7)','O-Level (Form 1–4)','A-Level (Form 5–6)','Tertiary / University','Vocational / TVET','Professional Development'];
const LANGUAGES = ['English','Shona','Ndebele','Both Shona & English','All three languages'];

const STEPS = [
  { id: 1, label: 'Profile',     icon: User },
  { id: 2, label: 'Speciality', icon: BookOpen },
  { id: 3, label: 'Connect',    icon: Globe },
  { id: 4, label: 'Ready',      icon: Sparkles },
];

export default function AuthorOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef = useRef(null);

  const [step, setStep]         = useState(1);
  const [avatar, setAvatar]     = useState(null);
  const [name, setName]         = useState(user?.name || '');
  const [bio, setBio]           = useState('');
  const [institution, setInst]  = useState('');
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels]     = useState([]);
  const [language, setLanguage] = useState('English');
  const [dsUrl, setDsUrl]       = useState('');
  const [dsConnected, setDsConn]= useState(false);
  const [saving, setSaving]     = useState(false);

  const toggleArr = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    setSaving(true);
    const profile = { name, bio, institution, subjects, levels, language, dsUrl, dsConnected, completed_at: new Date().toISOString() };
    localStorage.setItem('dare_author_profile', JSON.stringify(profile));
    await new Promise(r => setTimeout(r, 900));
    navigate('/book-writer');
  };

  const canNext = (s) => {
    if (s === 1) return name.trim().length > 1;
    if (s === 2) return subjects.length > 0 && levels.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4"
      style={{ background: 'linear-gradient(135deg,#0D1F17 0%,#1a3a28 60%,#0D1F17 100%)' }}>

      {/* Kente stripe top */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ background: 'linear-gradient(90deg,#166534 0 25%,#D97706 25% 50%,#C2410C 50% 75%,#1C1917 75% 100%)' }} />

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <motion.div
              animate={{ scale: step === s.id ? 1.1 : 1 }}
              className={`flex flex-col items-center gap-1.5 relative`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                step > s.id ? 'border-emerald-500 bg-emerald-500' :
                step === s.id ? 'border-amber-400 bg-amber-400/20' : 'border-white/20 bg-white/5'}`}>
                {step > s.id
                  ? <Check size={16} className="text-white" />
                  : <s.icon size={16} className={step === s.id ? 'text-amber-400' : 'text-white/30'} />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${step === s.id ? 'text-amber-400' : step > s.id ? 'text-emerald-400' : 'text-white/25'}`}>{s.label}</span>
            </motion.div>
            {i < STEPS.length - 1 && (
              <div className={`w-14 h-0.5 mx-1 mb-4 transition-all duration-500 ${step > s.id ? 'bg-emerald-500' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Profile ── */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.35 }}
            className="w-full max-w-lg rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Pen size={20} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-white font-black text-xl" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Welcome, Author</h2>
                <p className="text-stone-400 text-xs">Set up your author profile</p>
              </div>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative shrink-0 cursor-pointer" onClick={() => fileRef.current?.click()}>
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.07)' }}>
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                    : <User size={32} className="text-white/30" />}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <Upload size={12} className="text-white" />
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm mb-1">Profile photo</p>
                <p className="text-stone-500 text-xs">Click to upload. Shown on published books.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-stone-300 text-xs font-bold mb-1.5 block">Full name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tendai Moyo"
                  className="w-full px-4 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
              </div>
              <div>
                <label className="text-stone-300 text-xs font-bold mb-1.5 block">Institution / Organisation</label>
                <input value={institution} onChange={e => setInst(e.target.value)} placeholder="University of Zimbabwe, ZIMSEC…"
                  className="w-full px-4 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
              </div>
              <div>
                <label className="text-stone-300 text-xs font-bold mb-1.5 block">Short bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  placeholder="Tell readers a little about yourself and your expertise…"
                  className="w-full px-4 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
              </div>
            </div>

            <button onClick={() => setStep(2)} disabled={!canNext(1)}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#D97706,#C2410C)' }}>
              Continue <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* ── Step 2: Speciality ── */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.35 }}
            className="w-full max-w-lg rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Layers size={20} className="text-violet-400" />
              </div>
              <div>
                <h2 className="text-white font-black text-xl" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Your Speciality</h2>
                <p className="text-stone-400 text-xs">Helps BAKO AI assist you better</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-stone-300 text-xs font-bold mb-2 block">Subjects (select all that apply) *</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button key={s} onClick={() => toggleArr(subjects, setSubjects, s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${subjects.includes(s) ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                    style={subjects.includes(s) ? { background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)' } : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-stone-300 text-xs font-bold mb-2 block">Education levels *</label>
              <div className="space-y-2">
                {LEVELS.map(l => (
                  <button key={l} onClick={() => toggleArr(levels, setLevels, l)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-all flex items-center justify-between ${levels.includes(l) ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                    style={levels.includes(l) ? { background: 'rgba(22,101,52,0.25)', border: '1px solid rgba(22,101,52,0.4)' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {l}
                    {levels.includes(l) && <Check size={14} className="text-emerald-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-stone-300 text-xs font-bold mb-2 block">Writing language</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => setLanguage(l)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${language === l ? 'text-amber-300' : 'text-white/40 hover:text-white/60'}`}
                    style={language === l ? { background: 'rgba(217,119,6,0.2)', border: '1px solid rgba(217,119,6,0.4)' } : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="px-5 py-3 rounded-2xl text-white/50 text-sm font-bold hover:text-white/70 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Back</button>
              <button onClick={() => setStep(3)} disabled={!canNext(2)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: DSpace Connection ── */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.35 }}
            className="w-full max-w-lg rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Globe size={20} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-white font-black text-xl" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Connect Repository</h2>
                <p className="text-stone-400 text-xs">Optional — publish directly to DSpace</p>
              </div>
            </div>
            <p className="text-stone-400 text-sm mb-6 mt-3">
              Link your institution's DSpace repository to publish your books and research directly from DARE's writing tools.
            </p>

            <div className="p-4 rounded-2xl mb-5" style={{ background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(22,101,52,0.2)' }}>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Benefits of connecting</p>
              <ul className="space-y-1.5">
                {['Publish books directly to your institution\'s repository','Auto-sync metadata and cover images','Track downloads and citations from DSpace','Grant open access with one click'].map(b => (
                  <li key={b} className="flex items-center gap-2 text-sm text-stone-300">
                    <Check size={13} className="text-emerald-400 shrink-0" /> {b}
                  </li>
                ))}
              </ul>
            </div>

            {!dsConnected ? (
              <div className="space-y-3">
                <div>
                  <label className="text-stone-300 text-xs font-bold mb-1.5 block">DSpace repository URL</label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                    <input value={dsUrl} onChange={e => setDsUrl(e.target.value)}
                      placeholder="https://dspace.uz.ac.zw"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  </div>
                </div>
                <button onClick={() => { setDsConn(true); }}
                  className="w-full py-3 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
                  <Building2 size={15} className="inline mr-2" />Test Connection
                </button>
                <button onClick={() => setStep(4)}
                  className="w-full py-3 rounded-2xl font-semibold text-white/50 text-sm transition-colors hover:text-white/70"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  Skip for now
                </button>
              </div>
            ) : (
              <div>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="p-4 rounded-2xl mb-4 flex items-center gap-3"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-300 font-bold text-sm">Repository connected</p>
                    <p className="text-stone-400 text-xs">{dsUrl || 'DSpace Sandbox'}</p>
                  </div>
                </motion.div>
                <button onClick={() => setStep(4)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#166534,#15803D)' }}>
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            )}

            <button onClick={() => setStep(2)} className="w-full mt-2 py-2 text-white/30 text-sm hover:text-white/50 transition-colors">← Back</button>
          </motion.div>
        )}

        {/* ── Step 4: All done ── */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
            className="w-full max-w-lg rounded-3xl p-10 text-center" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#D97706,#C2410C)' }}>
              <Sparkles size={36} className="text-white" />
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              You're all set, {name.split(' ')[0]}!
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-stone-400 mb-8 leading-relaxed">
              Your author profile is ready. BAKO AI will assist you as you write, suggest content improvements, generate quizzes, and help you publish to Zimbabwe's learning network.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: '✍️', label: 'Write Books' },
                { icon: '🤖', label: 'BAKO AI Help' },
                { icon: '📤', label: dsConnected ? 'DSpace Sync' : 'DARE Publish' },
              ].map(f => (
                <div key={f.label} className="p-4 rounded-2xl text-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <div className="text-xs font-bold text-white/60">{f.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              onClick={handleFinish} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white transition-all hover:-translate-y-1 hover:shadow-2xl text-lg disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#D97706,#C2410C)' }}>
              {saving ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Pen size={20} />Start Writing<ArrowRight size={18} /></>}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
