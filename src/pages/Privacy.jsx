import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowRight, ChevronRight } from 'lucide-react';

const sections = [
  {
    id: 'information',
    title: '1. Information We Collect',
    content: [
      {
        subtitle: '1.1 Account Information',
        text: 'When you create a DARE account, we collect your full name, email address, institution affiliation, and role (student, lecturer, or researcher). This information is used to personalise your experience and provide access to role-specific features.'
      },
      {
        subtitle: '1.2 Usage Data',
        text: 'We collect information about how you use DARE, including pages visited, search queries, books accessed, reading progress, and interactions with the DARA AI Tutor. This data is used to improve our services and personalise recommendations.'
      },
      {
        subtitle: '1.3 Device & Technical Information',
        text: 'We automatically collect certain technical information when you use DARE, including your IP address, browser type, operating system, and device identifiers. This helps us ensure compatibility and detect security issues.'
      },
      {
        subtitle: '1.4 Reading Progress & Gamification',
        text: 'Your reading progress, XP points, streaks, badges, and level data are stored locally on your device using browser localStorage. This information is not transmitted to our servers unless you explicitly choose to sync your data.'
      },
    ]
  },
  {
    id: 'use',
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: 'Educational Services',
        text: 'We use your information to provide personalised learning recommendations, power the DARA AI Tutor, track your reading progress, and connect you with relevant academic resources aligned with your institution and field of study.'
      },
      {
        subtitle: 'Platform Improvement',
        text: 'Aggregate, anonymised usage data is used to improve search results, identify popular resources, fix bugs, and develop new features. We analyse patterns across all users to make DARE better for everyone.'
      },
      {
        subtitle: 'Communications',
        text: 'We may send you emails about new resources, platform updates, and important account information. You can control notification preferences in your account settings at any time.'
      },
      {
        subtitle: 'Research & Analytics',
        text: 'We may use anonymised, aggregated data for research on educational technology effectiveness and to produce reports that benefit the broader Zimbabwean education ecosystem.'
      },
    ]
  },
  {
    id: 'sharing',
    title: '3. Information Sharing',
    content: [
      {
        subtitle: 'We Do Not Sell Your Data',
        text: 'DARE does not sell, rent, or trade your personal information to third parties for their marketing purposes. Your data is used solely to provide and improve our educational services.'
      },
      {
        subtitle: 'Institutional Partners',
        text: 'If you access DARE through an institutional account (university or college), your institution may have access to aggregated usage statistics (not individual data) to assess the platform\'s educational impact. We have data sharing agreements with all partner institutions.'
      },
      {
        subtitle: 'Service Providers',
        text: 'We work with trusted third-party service providers (including Supabase for database services and Google/DeepSeek for AI capabilities) who process data on our behalf under strict confidentiality agreements and data processing agreements.'
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose your information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect the rights, safety, or property of DARE, our users, or the public.'
      },
    ]
  },
  {
    id: 'storage',
    title: '4. Data Storage & Security',
    content: [
      {
        subtitle: 'Data Storage',
        text: 'Your account data is stored on secure servers provided by Supabase, with data centres that meet international security standards. Reading progress and gamification data are stored locally in your browser and are not transmitted to remote servers by default.'
      },
      {
        subtitle: 'Security Measures',
        text: 'We implement industry-standard security measures including HTTPS encryption for all data transmission, password hashing, and regular security audits. However, no method of transmission over the internet is 100% secure.'
      },
      {
        subtitle: 'Data Retention',
        text: 'We retain your account information for as long as your account is active or as needed to provide services. If you delete your account, your personal data will be removed from our active systems within 30 days, though anonymised analytics may be retained.'
      },
    ]
  },
  {
    id: 'rights',
    title: '5. Your Rights',
    content: [
      {
        subtitle: 'Access & Portability',
        text: 'You have the right to request a copy of all personal data we hold about you. You can access most of this information directly through your account dashboard. For a full data export, contact us at dare.digitallib@gmail.com.'
      },
      {
        subtitle: 'Correction',
        text: 'You can update most of your personal information directly in your account settings. If you need assistance correcting inaccurate data, contact us and we will address the issue within 14 days.'
      },
      {
        subtitle: 'Deletion',
        text: 'You have the right to request deletion of your personal data. You can delete your account directly from Settings → Danger Zone, or contact us for assistance. Note that some data may need to be retained for legal or legitimate business purposes.'
      },
      {
        subtitle: 'Opt-Out',
        text: 'You may opt out of non-essential communications at any time through your account notification settings. You may also opt out of analytics tracking by contacting us, though this may affect some personalisation features.'
      },
    ]
  },
  {
    id: 'cookies',
    title: '6. Cookies & Local Storage',
    content: [
      {
        subtitle: 'What We Use',
        text: 'DARE uses browser localStorage (not traditional cookies) to store your session state, reading preferences, and gamification progress. We also use essential session cookies for authentication purposes.'
      },
      {
        subtitle: 'Third-Party Analytics',
        text: 'We may use analytics tools to understand how users interact with DARE. These tools may set their own cookies. You can control analytics cookies through your browser settings or our cookie preference centre.'
      },
    ]
  },
  {
    id: 'children',
    title: '7. Children\'s Privacy',
    content: [
      {
        subtitle: 'Age Requirements',
        text: 'DARE is designed for students and educators at tertiary level and above. We do not knowingly collect personal information from children under the age of 13. Secondary school students accessing DARE should do so under educator supervision and with parental consent.'
      },
    ]
  },
  {
    id: 'changes',
    title: '8. Changes to This Policy',
    content: [
      {
        subtitle: 'Updates',
        text: 'We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify users of significant changes via email or a prominent notice on the platform. The "Last Updated" date at the top of this page reflects the most recent revision.'
      },
    ]
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase tracking-widest mb-4">
            <Shield size={12} />
            Legal
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-slate-500">Last updated: June 2026 · Effective: June 2026</p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            DARE Digital Library ("DARE", "we", "our", or "us"), a project by ChengetAI Labs, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our platform at mydala.app and related services.
          </p>
        </motion.div>

        {/* Table of Contents */}
        <motion.nav
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8"
        >
          <h2 className="font-bold text-sm text-slate-500 uppercase tracking-widest mb-4">Contents</h2>
          <div className="space-y-1">
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 py-1.5 text-sm font-medium text-slate-700 hover:text-teal-600 transition group"
              >
                <ChevronRight size={14} className="text-slate-300 group-hover:text-teal-500 transition" />
                {s.title}
              </a>
            ))}
          </div>
        </motion.nav>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.03 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm scroll-mt-28"
            >
              <h2 className="text-xl font-black text-slate-900 mb-5 pb-4 border-b border-slate-100">{section.title}</h2>
              <div className="space-y-5">
                {section.content.map((item, j) => (
                  <div key={j}>
                    <h3 className="font-bold text-slate-800 mb-1.5 text-sm">{item.subtitle}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-8 bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h3 className="font-bold text-lg mb-1">Questions about your privacy?</h3>
            <a href="mailto:dare.digitallib@gmail.com" className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 transition text-sm font-medium">
              <Mail size={14} /> dare.digitallib@gmail.com
            </a>
          </div>
          <Link
            to="/contact"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-slate-900 font-bold text-sm rounded-xl hover:bg-teal-400 transition"
          >
            Contact Us <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Footer links */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
          <Link to="/terms" className="hover:text-teal-600 transition font-medium">Terms of Service</Link>
          <span>·</span>
          <Link to="/help" className="hover:text-teal-600 transition font-medium">Help Center</Link>
          <span>·</span>
          <Link to="/" className="hover:text-teal-600 transition font-medium">Back to DARE</Link>
        </div>
      </div>
    </div>
  );
}
