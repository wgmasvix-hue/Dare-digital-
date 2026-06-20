import { Shield } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, such as when you create an account, including your name, email address, and institutional affiliation. We also collect usage data such as search queries, resources accessed, and reading activity to power personalized recommendations and gamification features.`
  },
  {
    title: '2. How We Use Your Information',
    content: `We use your information to provide and improve the DARE Digital Library service, personalize your learning experience, track your reading history and achievements, send you notifications about new resources, and communicate with you about your account.`
  },
  {
    title: '3. Information Sharing',
    content: `We do not sell, trade, or rent your personal information to third parties. We may share anonymized, aggregated data for research purposes with academic partners. We may disclose information when required by law or to protect the rights and safety of our users.`
  },
  {
    title: '4. Data Storage and Security',
    content: `Your data is stored securely using Supabase infrastructure with industry-standard encryption. We use HTTPS for all data transmission. While we implement strong security measures, no system is completely secure and we cannot guarantee absolute security.`
  },
  {
    title: '5. Open Access Resources',
    content: `DARE aggregates content from open access repositories including OpenAlex, CORE, Semantic Scholar, and institutional repositories. These resources are subject to their own licensing terms. DARE does not claim ownership of any third-party content.`
  },
  {
    title: '6. Cookies',
    content: `We use cookies and similar technologies to maintain your session, remember your preferences, and analyze how our service is used. You can control cookie settings through your browser preferences.`
  },
  {
    title: '7. Your Rights',
    content: `You have the right to access, correct, or delete your personal information. You can request a copy of your data or ask us to delete your account by contacting support@dare.ac.zw. We will respond to all requests within 30 days.`
  },
  {
    title: '8. Children\'s Privacy',
    content: `DARE Digital Library is designed for tertiary education students and does not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it promptly.`
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our platform. Your continued use of DARE after changes constitutes acceptance of the updated policy.`
  },
  {
    title: '10. Contact Us',
    content: `If you have questions about this Privacy Policy or our data practices, please contact us at privacy@dare.ac.zw or through the Contact page.`
  }
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-teal-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">Privacy Policy</h1>
          <p className="text-slate-500">Last updated: January 2025</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
          <p className="text-slate-600 leading-relaxed">
            DARE Digital Library ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
          </p>

          {SECTIONS.map(section => (
            <div key={section.title}>
              <h2 className="font-black text-slate-900 text-lg mb-3">{section.title}</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
