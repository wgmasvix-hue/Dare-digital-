import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { FileText, Mail, ArrowRight, ChevronRight } from 'lucide-react';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using DARE Digital Library ("DARE", "the Platform"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to these Terms, please do not use the platform.

These Terms apply to all users of DARE, including students, educators, researchers, and institutional users. DARE is operated by ChengetAI Labs in Zimbabwe.`
  },
  {
    id: 'access',
    title: '2. Access & Eligibility',
    content: `DARE is open to all users. However, certain features require registration. To create an account, you must:

• Be at least 13 years of age (those under 18 should have parental or guardian consent)
• Provide accurate and truthful registration information
• Be affiliated with or have a genuine interest in Zimbabwean or regional education
• Not be barred from receiving services under applicable laws

Institutional access is governed by additional agreements between ChengetAI Labs and the respective institution.`
  },
  {
    id: 'permitted-use',
    title: '3. Permitted Use',
    content: `DARE grants you a limited, non-exclusive, non-transferable, revocable licence to access and use the platform for the following purposes:

• Personal academic study and research
• Educational activities as a student, lecturer, or researcher
• Accessing, reading, and downloading openly licensed materials for educational purposes
• Using the DARA AI Tutor for learning assistance
• Uploading and sharing your own original educational content (subject to Section 5)

You may not use DARE for commercial purposes without prior written consent from ChengetAI Labs.`
  },
  {
    id: 'prohibited',
    title: '4. Prohibited Activities',
    content: `You agree not to:

• Reproduce, distribute, or resell DARE content or services for commercial gain
• Attempt to reverse engineer, hack, or gain unauthorised access to any part of the platform
• Upload malicious code, viruses, or harmful content
• Use DARE to spam, harass, or harm other users
• Create multiple accounts or use the platform under false pretences
• Scrape, crawl, or systematically extract data from DARE without written permission
• Use the DARA AI Tutor to generate content that violates academic integrity policies (plagiarism, deceptive submissions)
• Circumvent any security features or access controls
• Post content that is illegal, defamatory, discriminatory, or infringes on intellectual property rights`
  },
  {
    id: 'content',
    title: '5. User-Submitted Content',
    content: `If you upload, post, or submit content to DARE (including research papers, notes, or educational materials), you represent that:

• You own or have the right to share that content
• The content does not infringe on any third-party intellectual property rights
• The content complies with all applicable laws
• The content does not contain false information, spam, or harmful material

By submitting content, you grant DARE a worldwide, royalty-free, non-exclusive licence to host, display, and make your content available to other users of the platform. You retain ownership of your original work.

We reserve the right to remove any content that violates these Terms, without notice.`
  },
  {
    id: 'ip',
    title: '6. Intellectual Property',
    content: `DARE and its original content, features, and functionality are owned by ChengetAI Labs and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.

Open-access resources available through DARE are subject to their respective licences (such as Creative Commons, Public Domain, or OpenStax licences). You are responsible for complying with the licence terms of any resource you access or download.

The DARE name, logo, and branding are trademarks of ChengetAI Labs. You may not use them without our prior written consent.`
  },
  {
    id: 'ai',
    title: '7. AI Services (DARA)',
    content: `The DARA AI Tutor is powered by third-party AI technologies (including Google Gemini and DeepSeek). By using DARA, you acknowledge:

• AI-generated responses are provided for educational assistance only and may not always be accurate
• DARA is not a substitute for professional academic advice, medical guidance, legal counsel, or other expert services
• You should critically evaluate all AI-generated content before relying on it
• Your conversations with DARA may be processed by our AI service providers subject to their privacy policies
• You must not use DARA to generate content intended to deceive, plagiarise, or violate academic integrity policies`
  },
  {
    id: 'disclaimer',
    title: '8. Disclaimers & Limitation of Liability',
    content: `DARE is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that:

• The platform will be uninterrupted, error-free, or secure
• The content is always accurate, complete, or current
• The platform will meet all your specific requirements

To the maximum extent permitted by law, ChengetAI Labs shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of DARE, including but not limited to loss of data, loss of profits, or damage to reputation.

Our total liability to you for any claim arising from your use of DARE shall not exceed the amount you have paid us in the 12 months preceding the claim (which, since DARE is free, may be zero).`
  },
  {
    id: 'termination',
    title: '9. Termination',
    content: `We reserve the right to suspend or terminate your access to DARE at any time, without notice, if you violate these Terms or engage in conduct harmful to other users or the platform.

You may terminate your account at any time by visiting Settings → Danger Zone → Delete Account. Termination does not affect rights and obligations that accrued before termination.`
  },
  {
    id: 'governing',
    title: '10. Governing Law',
    content: `These Terms are governed by the laws of Zimbabwe. Any disputes arising from these Terms or your use of DARE shall be subject to the exclusive jurisdiction of the courts of Zimbabwe.

If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.`
  },
  {
    id: 'changes',
    title: '11. Changes to These Terms',
    content: `We may update these Terms from time to time. We will notify you of significant changes via email or a prominent notice on the platform. Your continued use of DARE after changes take effect constitutes acceptance of the revised Terms.

We encourage you to review these Terms periodically. The "Last Updated" date at the top reflects the most recent revision.`
  },
  {
    id: 'contact-terms',
    title: '12. Contact',
    content: `If you have questions about these Terms of Service, please contact us:

Email: dare.digitallib@gmail.com
Phone: +263 784 457 922
ChengetAI Labs — Zimbabwe`
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase tracking-widest mb-4">
            <FileText size={12} />
            Legal
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Terms of Service</h1>
          <p className="text-slate-500">Last updated: June 2026 · Effective: June 2026</p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Welcome to DARE Digital Library. Please read these Terms of Service carefully before using our platform. These terms govern your access to and use of DARE's website, mobile applications, and services.
          </p>
        </motion.div>

        {/* Table of Contents */}
        <motion.nav
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8"
        >
          <h2 className="font-bold text-sm text-slate-500 uppercase tracking-widest mb-4">Contents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 py-1.5 text-sm font-medium text-slate-700 hover:text-teal-600 transition group"
              >
                <ChevronRight size={14} className="text-slate-300 group-hover:text-teal-500 transition shrink-0" />
                <span className="truncate">{s.title}</span>
              </a>
            ))}
          </div>
        </motion.nav>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.025 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm scroll-mt-28"
            >
              <h2 className="text-lg font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">{section.title}</h2>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{section.content}</div>
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-8 bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h3 className="font-bold text-lg mb-1">Questions about our Terms?</h3>
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
          <Link to="/privacy" className="hover:text-teal-600 transition font-medium">Privacy Policy</Link>
          <span>·</span>
          <Link to="/help" className="hover:text-teal-600 transition font-medium">Help Center</Link>
          <span>·</span>
          <Link to="/" className="hover:text-teal-600 transition font-medium">Back to DARE</Link>
        </div>
      </div>
    </div>
  );
}
