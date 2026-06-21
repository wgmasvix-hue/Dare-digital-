import React from 'react';
import { Link } from 'react-router-dom';
import Chat from '../components/Chat';
import { motion } from 'motion/react';
import { BookOpen, Globe, Zap, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const BAKO_FEATURES = [
  {
    step: "01",
    icon: <BookOpen size={26} />,
    bg: "bg-amber-100",
    color: "text-amber-800",
    border: "border-amber-200",
    title: "Heritage-Based",
    desc: "Aligned with Zimbabwe's Heritage-Based Curriculum — concepts explained through Unhu/Ubuntu and local cultural context.",
  },
  {
    step: "02",
    icon: <Globe size={26} />,
    bg: "bg-orange-100",
    color: "text-orange-800",
    border: "border-orange-200",
    title: "Trilingual",
    desc: "Ask in English, Shona, or Ndebele. BAKO understands your language and responds in kind.",
  },
  {
    step: "03",
    icon: <Zap size={26} />,
    bg: "bg-amber-50",
    color: "text-amber-700",
    border: "border-amber-100",
    title: "24/7 Innovation",
    desc: "Available anytime to brainstorm, troubleshoot, and guide your path toward innovative excellence.",
  },
];

const BAKO_CAPABILITIES = [
  "Summarise any chapter or paper in seconds",
  "Contextual Q&A inside your documents",
  "ZIMSEC & HBC-aligned quiz generation",
  "Shona & Ndebele language support",
  "Lesson plans, rubrics & TP reflections",
  "Research pathway guidance",
];

export default function TutorPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F0] pt-24 pb-20 overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{ background: "linear-gradient(135deg, #FEF3C7 0%, #FDF8F0 60%, #FFF7ED 100%)" }} />
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-40"
            style={{ background: "radial-gradient(circle, #F59E0B 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
            style={{ background: "radial-gradient(circle, #C2410C 0%, transparent 70%)" }} />
        </div>

        {/* Flag stripe */}
        <div className="absolute top-0 left-0 w-full h-1 pointer-events-none"
          style={{ background: "linear-gradient(90deg, #166534 0% 25%, #D97706 25% 50%, #C2410C 50% 75%, #1C1917 75% 100%)" }}
        />

        <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-14 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-amber-300 bg-amber-50 text-amber-900 text-xs font-black uppercase tracking-widest mb-8 shadow-sm">
                  <span className="text-lg leading-none">🌳</span>
                  Boundless African Knowledge Oracle
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.0] text-stone-900 mb-6"
                  style={{ fontFamily: 'var(--font-accent)' }}>
                  Meet{" "}
                  <span className="text-transparent bg-clip-text"
                    style={{ backgroundImage: "linear-gradient(135deg, #B45309 0%, #D97706 40%, #C2410C 100%)" }}>
                    BAKO
                  </span>
                  <br />
                  <span className="text-stone-900">AI.</span>
                </h1>

                <p className="text-xl text-stone-600 font-medium mb-8 leading-relaxed max-w-lg">
                  Like the baobab tree — ancient, vast, and life-giving — BAKO stands as your pillar of learning.
                  Zimbabwe's AI tutor, rooted in African wisdom, fluent in Shona &amp; Ndebele.
                </p>

                {/* Capabilities checklist */}
                <ul className="space-y-3 mb-10">
                  {BAKO_CAPABILITIES.map(cap => (
                    <li key={cap} className="flex items-center gap-3 text-stone-700 font-medium text-[15px]">
                      <CheckCircle2 size={18} className="text-amber-600 shrink-0" />
                      {cap}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-3">
                  <a href="#chat"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
                    style={{ background: "linear-gradient(135deg, #B45309, #C2410C)" }}>
                    Start Learning Free
                    <Sparkles size={18} />
                  </a>
                  <Link to="/library"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-stone-700 border border-stone-200 bg-white shadow-sm hover:border-amber-400 hover:text-amber-800 transition-all hover:-translate-y-0.5">
                    Browse Library <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right — BAKO identity card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Glow halo */}
              <div className="absolute -inset-4 rounded-[3rem] blur-2xl opacity-30 pointer-events-none"
                style={{ background: "linear-gradient(135deg, #F59E0B, #C2410C)" }} />

              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-amber-200/60"
                style={{ background: "linear-gradient(145deg, #1C0A00 0%, #2D1400 50%, #1A0800 100%)" }}>

                {/* Top accent */}
                <div className="h-1 w-full"
                  style={{ background: "linear-gradient(90deg, #F59E0B, #D97706, #C2410C)" }} />

                <div className="p-8 sm:p-10">
                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-xl border border-amber-600/30"
                      style={{ background: "linear-gradient(135deg, #92400E, #B45309)" }}>
                      🌳
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-white tracking-tight">BAKO AI</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-amber-300/80 text-xs font-bold uppercase tracking-widest">Online · Education 5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample conversation */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-stone-700 flex-shrink-0 flex items-center justify-center text-sm">👤</div>
                      <div className="px-4 py-3 bg-stone-700/50 rounded-2xl rounded-tl-none border border-stone-600/40 text-stone-200 text-sm leading-relaxed">
                        Ndinoda kunzwisisa photosynthesis — ndizvo chii?
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm"
                        style={{ background: "linear-gradient(135deg, #92400E, #C2410C)" }}>🌳</div>
                      <div className="px-4 py-3 rounded-2xl rounded-tr-none border text-sm leading-relaxed"
                        style={{ background: "rgba(217,119,6,0.12)", borderColor: "rgba(217,119,6,0.3)", color: "#FEF3C7" }}>
                        Fikiridza muti une "solar panels" mumashizha ake — chlorophyll. Inobata chiedza chezuva
                        ichishandura mvura ne CO₂ kuita zuccheri ne oksijeni! 🌿☀️
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-stone-700 flex-shrink-0 flex items-center justify-center text-sm">👤</div>
                      <div className="px-4 py-3 bg-stone-700/50 rounded-2xl rounded-tl-none border border-stone-600/40 text-stone-200 text-sm leading-relaxed">
                        Can you give me a ZIMSEC quiz on this topic?
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm"
                        style={{ background: "linear-gradient(135deg, #92400E, #C2410C)" }}>🌳</div>
                      <div className="px-4 py-3 rounded-2xl rounded-tr-none border text-sm leading-relaxed"
                        style={{ background: "rgba(217,119,6,0.12)", borderColor: "rgba(217,119,6,0.3)", color: "#FEF3C7" }}>
                        Absolutely! Here's a 5-question O-Level Biology quiz on Photosynthesis... 📝
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 border-t border-amber-900/30 pt-6">
                    {[
                      { val: "3", label: "Languages" },
                      { val: "24/7", label: "Available" },
                      { val: "5.0", label: "Education" },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <div className="text-xl font-black text-amber-400">{s.val}</div>
                        <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────── */}
      <section className="py-16 px-6 lg:px-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BAKO_FEATURES.map((f, i) => (
            <motion.div
              key={f.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-xl hover:border-amber-200 transition-all duration-300"
            >
              <div className={`w-12 h-12 ${f.bg} ${f.border} border rounded-2xl flex items-center justify-center ${f.color} mb-5`}>
                {f.icon}
              </div>
              <div className="text-4xl font-black text-stone-100 mb-2 select-none">{f.step}</div>
              <h3 className="font-black text-lg text-stone-900 mb-2">{f.title}</h3>
              <p className="text-stone-500 font-medium leading-relaxed text-[15px]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Live Chat ─────────────────────────────────── */}
      <section id="chat" className="px-6 lg:px-12 max-w-5xl mx-auto py-4 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-2"
            style={{ fontFamily: 'var(--font-accent)' }}>
            Talk to BAKO Now
          </h2>
          <p className="text-stone-500 font-medium">Ask in English, Shona, or Ndebele — BAKO understands.</p>
        </div>
        <div className="relative group">
          <div className="absolute -inset-1 rounded-[2rem] blur opacity-25 transition duration-1000 group-hover:opacity-40"
            style={{ background: "linear-gradient(135deg, #D97706, #C2410C)" }} />
          <Chat />
        </div>
      </section>

    </div>
  );
}
