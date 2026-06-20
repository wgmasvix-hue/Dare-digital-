import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} className="text-teal-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">Contact Us</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Have questions about DARE Digital Library? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            {[
              {
                icon: Mail,
                label: 'Email',
                value: 'support@dare.ac.zw',
                color: 'bg-blue-50 text-blue-600 border-blue-100'
              },
              {
                icon: Phone,
                label: 'Phone',
                value: '+263 (0)4 123 456',
                color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
              },
              {
                icon: MapPin,
                label: 'Location',
                value: 'Harare, Zimbabwe',
                color: 'bg-amber-50 text-amber-600 border-amber-100'
              }
            ].map(item => (
              <div key={item.label} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className={`p-2.5 rounded-xl border ${item.color} shrink-0`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-bold text-slate-800">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl">
              <p className="text-xs font-black uppercase tracking-widest text-teal-600 mb-1">Response Time</p>
              <p className="text-sm font-bold text-teal-800">We typically respond within 24 hours on business days.</p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="h-full flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500 text-sm">Thanks for reaching out. We'll get back to you shortly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-teal-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-teal-400 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Subject</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-teal-400 transition-colors bg-white"
                  >
                    <option value="">Select a topic...</option>
                    <option>Account & Access</option>
                    <option>Search & Resources</option>
                    <option>Technical Issue</option>
                    <option>Institutional Partnership</option>
                    <option>Content Suggestion</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Message</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-teal-400 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-700 transition-colors disabled:opacity-60"
                >
                  {sending ? 'Sending...' : <><Send size={15} /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
