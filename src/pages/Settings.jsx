import { useState } from 'react';
import { User, Bell, Lock, Palette, Globe, Save, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function Settings() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    bio: profile?.bio || '',
    institution: profile?.institution || '',
    email_notifications: true,
    weekly_digest: true,
    achievement_alerts: true,
    theme: 'light',
    font_size: 'medium',
    language: 'en',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Settings</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-48 shrink-0">
            <nav className="flex flex-row md:flex-col gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left w-full ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon size={15} /> {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <h2 className="text-lg font-black text-slate-900 mb-4">Profile Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">First Name</label>
                    <input
                      value={form.first_name}
                      onChange={e => setForm({ ...form, first_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-teal-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Last Name</label>
                    <input
                      value={form.last_name}
                      onChange={e => setForm({ ...form, last_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-teal-400 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Email</label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Institution</label>
                  <input
                    value={form.institution}
                    onChange={e => setForm({ ...form, institution: e.target.value })}
                    placeholder="e.g. University of Zimbabwe"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-teal-400 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 mb-4">Notification Preferences</h2>
                {[
                  { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive important updates via email' },
                  { key: 'weekly_digest', label: 'Weekly Digest', desc: 'Summary of new resources and activity' },
                  { key: 'achievement_alerts', label: 'Achievement Alerts', desc: 'Get notified when you earn badges or level up' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setForm({ ...form, [item.key]: !form[item.key] })}
                      className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
                        form[item.key] ? 'bg-teal-500' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                        form[item.key] ? 'left-5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-5">
                <h2 className="text-lg font-black text-slate-900 mb-4">Security</h2>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="font-bold text-slate-800 text-sm mb-1">Change Password</p>
                  <p className="text-xs text-slate-500 mb-3">Password changes are managed through your email provider</p>
                  <button className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors">
                    Send Reset Email
                  </button>
                </div>
                <div className="p-4 rounded-xl border border-amber-100 bg-amber-50">
                  <p className="font-bold text-amber-800 text-sm">Session Information</p>
                  <p className="text-xs text-amber-600 mt-1">Signed in as <span className="font-bold">{user?.email}</span></p>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <h2 className="text-lg font-black text-slate-900 mb-4">Appearance</h2>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Theme</label>
                  <div className="flex gap-3">
                    {['light', 'dark', 'system'].map(t => (
                      <button
                        key={t}
                        onClick={() => setForm({ ...form, theme: t })}
                        className={`px-4 py-2 rounded-xl border text-sm font-bold capitalize transition-all ${
                          form.theme === t ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Font Size</label>
                  <div className="flex gap-3">
                    {['small', 'medium', 'large'].map(s => (
                      <button
                        key={s}
                        onClick={() => setForm({ ...form, font_size: s })}
                        className={`px-4 py-2 rounded-xl border text-sm font-bold capitalize transition-all ${
                          form.font_size === s ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  saved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-700'
                }`}
              >
                {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
