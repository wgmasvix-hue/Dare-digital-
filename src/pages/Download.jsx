import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Download, Shield, Wifi, BookOpen, Zap, CheckCircle2, ChevronRight, Smartphone } from 'lucide-react';

// ── Update this URL once you build & host your APK ──────────────────────────
const APK_URL = '/dare-digital-v1.0.0.apk';
const APK_VERSION = '1.0.0';
const APK_SIZE = '~8 MB';
// ────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: <Wifi size={20} />,     label: 'Works Offline',        desc: 'Read books and access cached content without internet.' },
  { icon: <Zap size={20} />,      label: 'BAKO AI Built-in',     desc: 'Get AI summaries and lesson plans on every resource.' },
  { icon: <BookOpen size={20} />, label: '500M+ Resources',      desc: 'Full access to every source — papers, books, audiobooks.' },
  { icon: <Shield size={20} />,   label: 'Secure & Private',     desc: 'No tracking. Your reading stays on your device.' },
];

const STEPS = [
  { n: '1', title: 'Download the APK', desc: 'Tap the green button above to download the DARE Digital APK file to your Android device.' },
  { n: '2', title: 'Allow Installation', desc: 'Go to Settings → Security → Unknown Sources and enable "Install from unknown sources".' },
  { n: '3', title: 'Open the APK', desc: 'Tap the downloaded file in your notifications or file manager and select Install.' },
  { n: '4', title: 'Launch & Learn', desc: 'Open DARE Digital, sign in with your account, and start learning!' },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: '#0D1F17' }}>
        <div className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg,#166534 0% 25%,#D97706 25% 50%,#C2410C 50% 75%,#1C1917 75% 100%)' }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: '#22c55e', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: '#166534', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-stone-500 text-xs mb-8">
            <Link to="/" className="hover:text-stone-300 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-green-400 font-semibold">Download</span>
          </div>

          {/* Phone icon */}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#166534,#15803D)' }}>
            <Smartphone size={44} className="text-white" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            DARE Digital for Android
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-stone-400 text-lg mb-2">
            Zimbabwe's largest learning platform — now in your pocket.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-stone-500 text-sm mb-10">
            Version {APK_VERSION} · {APK_SIZE} · Android 7.0+
          </motion.p>

          {/* Download button */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <a href={APK_URL} download
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xl text-white transition-all hover:-translate-y-1 active:translate-y-0 shadow-2xl"
              style={{ background: 'linear-gradient(135deg,#166534,#15803D)', boxShadow: '0 8px 32px rgba(21,128,61,0.40)' }}>
              <Download size={24} />
              Download APK — Free
            </a>
            <p className="text-stone-500 text-xs mt-3">
              Direct APK · No Play Store required · Works without internet after install
            </p>
          </motion.div>

          {/* Badge row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {['Free Forever', '100% Safe', 'No Ads', 'Offline Ready', 'v' + APK_VERSION].map(b => (
              <span key={b} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-green-300 border border-green-800"
                style={{ background: 'rgba(34,197,94,0.08)' }}>
                <CheckCircle2 size={11} /> {b}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14 space-y-16">
        {/* ── Features ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-black text-stone-800 mb-6 text-center">Everything in the app</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.label}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-green-700"
                  style={{ background: '#F0FDF4' }}>
                  {f.icon}
                </div>
                <div>
                  <p className="font-bold text-stone-800 mb-0.5">{f.label}</p>
                  <p className="text-stone-500 text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Installation steps ────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-black text-stone-800 mb-6 text-center">How to install</h2>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <motion.div key={s.n}
                initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex items-start gap-5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-white text-lg"
                  style={{ background: 'linear-gradient(135deg,#166534,#15803D)' }}>
                  {s.n}
                </div>
                <div>
                  <p className="font-bold text-stone-800 mb-0.5">{s.title}</p>
                  <p className="text-stone-500 text-sm">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Also available as PWA ─────────────────────────────────────── */}
        <section className="rounded-3xl p-8 text-center border border-stone-200 bg-white shadow-sm">
          <p className="text-stone-500 text-sm font-semibold uppercase tracking-widest mb-2">Also available</p>
          <h3 className="text-xl font-black text-stone-800 mb-2">Install as a Web App (PWA)</h3>
          <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
            Visit DARE Digital in Chrome on Android, tap the menu → "Add to Home Screen". Works just like a native app — no APK needed.
          </p>
          <Link to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#166534,#15803D)' }}>
            Open Web App <ChevronRight size={15} />
          </Link>
        </section>
      </div>
    </div>
  );
}
