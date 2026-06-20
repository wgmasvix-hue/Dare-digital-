import { FileText } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using DARE Digital Library, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. We reserve the right to update these terms at any time.`
  },
  {
    title: '2. Description of Service',
    content: `DARE Digital Library is an open access academic resource platform providing students, researchers, and educators in Zimbabwe and Africa with access to digital learning materials, research databases, and AI-powered educational tools.`
  },
  {
    title: '3. User Accounts',
    content: `To access certain features, you must create an account with accurate information. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorized use at support@dare.ac.zw.`
  },
  {
    title: '4. Acceptable Use',
    content: `You agree to use DARE only for lawful educational and research purposes. You may not: (a) use our service to violate any laws; (b) attempt to gain unauthorized access to any systems; (c) distribute, reproduce, or commercially exploit copyrighted content without authorization; (d) harass, abuse, or harm other users; (e) use automated tools to scrape or download content in bulk.`
  },
  {
    title: '5. Intellectual Property',
    content: `DARE Digital Library aggregates open access content from third-party sources. Each resource is subject to its own license (e.g., Creative Commons). DARE's own platform design, features, and original content are protected by copyright. The DARE name and logo are trademarks of DARE Digital.`
  },
  {
    title: '6. Open Access Content',
    content: `Resources sourced from OpenAlex, CORE, Project Gutenberg, OpenStax, DSpace repositories, and other open access providers are made available under their respective licenses. Users are responsible for complying with those licenses when using, citing, or distributing content.`
  },
  {
    title: '7. AI Features',
    content: `DARA AI Tutor is provided as an educational tool. AI-generated responses may not always be accurate and should not be relied upon as the sole source for academic submissions. Always verify information against authoritative sources.`
  },
  {
    title: '8. Privacy',
    content: `Your use of DARE is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.`
  },
  {
    title: '9. Disclaimers',
    content: `DARE is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access, accuracy of third-party content, or fitness for any particular purpose. We are not liable for any indirect, incidental, or consequential damages arising from your use of our service.`
  },
  {
    title: '10. Governing Law',
    content: `These Terms are governed by the laws of Zimbabwe. Any disputes shall be resolved in the courts of Zimbabwe. If any provision of these Terms is found invalid, the remaining provisions continue in full force.`
  },
  {
    title: '11. Contact',
    content: `For questions about these Terms, contact us at legal@dare.ac.zw or through our Contact page.`
  }
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-teal-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">Terms of Service</h1>
          <p className="text-slate-500">Last updated: January 2025</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
          <p className="text-slate-600 leading-relaxed">
            Please read these Terms of Service carefully before using DARE Digital Library. These terms govern your access to and use of our platform.
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
