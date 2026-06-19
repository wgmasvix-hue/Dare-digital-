import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Send, CheckCircle, AlertCircle,
  Facebook, Twitter, Linkedin, Instagram,
  MessageSquare, BookOpen, Sparkles, Building2
} from 'lucide-react';

const reasons = [
  { value: 'general', label: 'General Enquiry' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'content', label: 'Content / Resource Request' },
  { value: 'institution', label: 'Institutional Partnership' },
  { value: 'author', label: 'Publishing / Author Enquiry' },
  { value: 'privacy', label: 'Privacy or Data Request' },
  { value: 'other', label: 'Other' },
];

const contactLinks = [
  {
    icon: Mail,
    label: 'Email',
    value: 'dare.digitallib@gmail.com',
    href: 'mailto:dare.digitallib@gmail.com',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
  {
    icon: Phone,
    label: 'Phone / WhatsApp',
    value: '+263 784 457 922',
    href: 'tel:+263784457922',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Harare, Zimbabwe',
    href: null,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
];

const quickLinks = [
  { to: '/help', icon: BookOpen, label: 'Help Center', desc: 'Browse FAQs and guides' },
  { to: '/tutor', icon: Sparkles, label: 'DARA AI Tutor', desc: 'Get AI-powered answers' },
  { to: '/institutional', icon: Building2, label: 'Institutional', desc: 'Partner with DARE' },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    institution: '',
    reason: 'general',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.message.trim() || form.message.length < 20) errs.message = 'Message must be at least 20 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStatus('sending');
    // Simulate form submission (replace with real endpoint when available)
    await new Promise(r => setTimeout(r, 1500));
    setStatus('success');
    setForm({ name: '', email: '', institution: '', reason: 'general', message: '' });
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 transition ${
      errors[field]
        ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20 bg-red-50'
        : 'border-slate-200 focus:border-teal-400 focus:ring-teal-400/20'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4">
            <MessageSquare size={12} />
            Get In Touch
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Contact Us</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Have a question, partnership idea, or feedback? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
            className="space-y-4"
          >
            {contactLinks.map(link => {
              const Icon = link.icon;
              const inner = (
                <div className={`flex items-start gap-4 p-5 rounded-2xl border ${link.bg} ${link.border} transition`}>
                  <div className={`w-10 h-10 rounded-xl ${link.bg} border ${link.border} flex items-center justify-center shrink-0 ${link.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">{link.label}</p>
                    <p className={`font-bold text-sm ${link.color}`}>{link.value}</p>
                  </div>
                </div>
              );
              return link.href ? (
                <a key={link.label} href={link.href} className="block hover:scale-[1.02] transition-transform">
                  {inner}
                </a>
              ) : (
                <div key={link.label}>{inner}</div>
              );
            })}

            {/* Social Links */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, href: '#', label: 'Facebook' },
                  { icon: Twitter, href: '#', label: 'Twitter/X' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Instagram, href: '#', label: 'Instagram' },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Help Links */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Links</p>
              {quickLinks.map(({ to, icon: Icon, label, desc }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition group"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600 transition">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                <h2 className="font-bold text-lg text-slate-900">Send us a message</h2>
                <p className="text-sm text-slate-500 mt-0.5">We'll get back to you within 1–2 business days.</p>
              </div>

              {status === 'success' ? (
                <div className="p-12 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="font-black text-2xl text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500 max-w-sm">Thank you for reaching out. Our team will respond to your message within 1–2 business days.</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className={inputClass('name')}
                      />
                      {errors.name && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address *</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={inputClass('email')}
                      />
                      {errors.email && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Institution</label>
                      <input
                        name="institution"
                        value={form.institution}
                        onChange={handleChange}
                        placeholder="Your university or school (optional)"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Reason for Contact</label>
                      <select
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition"
                      >
                        {reasons.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Message *</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us how we can help you…"
                      className={`${inputClass('message')} resize-none`}
                    />
                    {errors.message && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.message}</p>}
                    <p className="text-xs text-slate-400 mt-1 text-right">{form.message.length} / 1000</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-slate-400">
                      By submitting, you agree to our{' '}
                      <Link to="/privacy" className="text-teal-600 hover:underline font-medium">Privacy Policy</Link>.
                    </p>
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === 'sending' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
