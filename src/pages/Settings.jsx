import { useState } from 'react';
import { motion } from 'motion/react';
import {
  User, Bell, Shield, Palette, Save, Eye, EyeOff,
  ChevronRight, Zap, Trash2, Moon, Sun, Monitor,
  BookOpen, Volume2, Languages, LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGamification } from '../context/GamificationContext';

const Section = ({ title, description, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <div className="px-6 py-5 border-b border-slate-100">
      <h2 className="font-bold text-lg text-slate-900">{title}</h2>
      {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <label className="text-sm font-semibold text-slate-700 shrink-0 w-40">{label}</label>
    <div className="flex-1">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-teal-500' : 'bg-slate-200'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  </div>
);

export default function Settings() {
  const { user, profile, signOut } = useAuth();
  const { xp, streak, level, getLevelInfo } = useGamification();
  const levelInfo = getLevelInfo();

  const [name, setName] = useState(profile?.first_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [institution, setInstitution] = useState('University of Zimbabwe');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    newResources: true,
    aiUpdates: true,
    streakReminders: true,
    weeklyDigest: false,
    institutionNews: true,
  });
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    showProgress: true,
    showLeaderboard: true,
  });
  const [reading, setReading] = useState({
    autoSave: true,
    showProgress: true,
    darkReader: false,
  });

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your profile, preferences, and privacy.</p>
        </motion.div>

        {/* XP Summary Card */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-2xl font-black text-teal-300 shrink-0">
              {level}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Rank</p>
              <p className="text-xl font-black">{levelInfo.current.title}</p>
              <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden w-48">
                <div
                  className="h-full bg-teal-400 rounded-full transition-all duration-700"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{xp} XP total · Level {level}</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-black text-orange-400">🔥 {streak}</p>
                <p className="text-xs text-slate-400 mt-0.5">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black flex items-center gap-1 text-blue-300"><Zap size={20} />{xp}</p>
                <p className="text-xs text-slate-400 mt-0.5">Total XP</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title="Profile" description="Update your personal information.">
            <Field label="Full Name">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition"
                placeholder="Your full name"
              />
            </Field>
            <Field label="Email">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition"
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Institution">
              <select
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 focus:outline-none focus:border-teal-400 transition"
              >
                {['University of Zimbabwe','Midlands State University','NUST','Great Zimbabwe University','Chinhoyi University','Bindura University','HIT'].map(i => (
                  <option key={i}>{i}</option>
                ))}
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Role">
              <select
                defaultValue={profile?.role || 'student'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 focus:outline-none focus:border-teal-400 transition"
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer / Educator</option>
                <option value="researcher">Researcher</option>
                <option value="admin">Administrator</option>
              </select>
            </Field>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleSaveProfile}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition active:scale-95"
              >
                <Save size={16} />
                Save Changes
              </button>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-semibold text-teal-600"
                >
                  Saved!
                </motion.span>
              )}
            </div>
          </Section>
        </motion.div>

        {/* Password */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section title="Password" description="Change your account password.">
            <Field label="Current Password">
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition"
                />
                <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field label="New Password">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="New password (min 8 characters)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition"
              />
            </Field>
            <div className="pt-2">
              <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition active:scale-95">
                <Shield size={16} />
                Update Password
              </button>
            </div>
          </Section>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Section title="Appearance" description="Customize how DARE looks for you.">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Theme</p>
              <div className="flex gap-3">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all text-sm font-bold ${
                      theme === id
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={20} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Language</p>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 focus:outline-none focus:border-teal-400 transition"
              >
                <option value="en">English</option>
                <option value="sn">Shona (ChiShona)</option>
                <option value="nd">Ndebele (IsiNdebele)</option>
              </select>
            </div>
          </Section>
        </motion.div>

        {/* Reading Preferences */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Section title="Reading Preferences" description="Customize your reading experience.">
            <Toggle checked={reading.autoSave} onChange={v => setReading(r => ({ ...r, autoSave: v }))} label="Auto-save reading position" />
            <Toggle checked={reading.showProgress} onChange={v => setReading(r => ({ ...r, showProgress: v }))} label="Show reading progress bar" />
            <Toggle checked={reading.darkReader} onChange={v => setReading(r => ({ ...r, darkReader: v }))} label="Dark mode for reader" />
          </Section>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Section title="Notifications" description="Choose what you want to hear about.">
            <Toggle checked={notifications.newResources} onChange={v => setNotifications(n => ({ ...n, newResources: v }))} label="New resources added to library" />
            <Toggle checked={notifications.aiUpdates} onChange={v => setNotifications(n => ({ ...n, aiUpdates: v }))} label="DARA AI feature updates" />
            <Toggle checked={notifications.streakReminders} onChange={v => setNotifications(n => ({ ...n, streakReminders: v }))} label="Daily streak reminders" />
            <Toggle checked={notifications.weeklyDigest} onChange={v => setNotifications(n => ({ ...n, weeklyDigest: v }))} label="Weekly learning digest email" />
            <Toggle checked={notifications.institutionNews} onChange={v => setNotifications(n => ({ ...n, institutionNews: v }))} label="Institution announcements" />
          </Section>
        </motion.div>

        {/* Privacy */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Section title="Privacy" description="Control your profile visibility.">
            <Toggle checked={privacy.publicProfile} onChange={v => setPrivacy(p => ({ ...p, publicProfile: v }))} label="Make my profile public" />
            <Toggle checked={privacy.showProgress} onChange={v => setPrivacy(p => ({ ...p, showProgress: v }))} label="Show reading progress to others" />
            <Toggle checked={privacy.showLeaderboard} onChange={v => setPrivacy(p => ({ ...p, showLeaderboard: v }))} label="Appear on the leaderboard" />
          </Section>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
            <h2 className="font-bold text-lg text-red-700 mb-1">Danger Zone</h2>
            <p className="text-sm text-red-500 mb-5">These actions are permanent and cannot be undone.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {user && (
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              )}
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition">
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
