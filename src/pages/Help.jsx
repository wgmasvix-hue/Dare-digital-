import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, Search, Sparkles, Globe, Mail } from 'lucide-react';

const FAQ = [
  {
    category: 'Getting Started',
    icon: BookOpen,
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click "Join DARE" in the top navigation. Fill in your name, email, and password. You\'ll get instant access to the library.'
      },
      {
        q: 'Is DARE Digital Library free?',
        a: 'Yes, DARE provides free access to millions of open access resources. Some premium institutional resources may require institutional login.'
      },
      {
        q: 'What types of resources are available?',
        a: 'We offer textbooks, research papers, theses, journal articles, open educational resources, and multimedia learning materials.'
      }
    ]
  },
  {
    category: 'Searching & Discovery',
    icon: Search,
    items: [
      {
        q: 'How do I use the Research Database?',
        a: 'Go to Research DB in the navigation. Use boolean search (AND/OR/NOT) to combine terms. Filter by date, document type, and peer-review status.'
      },
      {
        q: 'What does "Open Access" mean?',
        a: 'Open Access resources are freely available to read online without a subscription or paywall. Look for the green OA badge on search results.'
      },
      {
        q: 'Can I search across multiple databases at once?',
        a: 'Yes! The Research Database searches OpenAlex (250M+ works), CORE (220M+ papers), and Semantic Scholar simultaneously.'
      }
    ]
  },
  {
    category: 'DARA AI Tutor',
    icon: Sparkles,
    items: [
      {
        q: 'What is DARA?',
        a: 'DARA is DARE\'s AI learning assistant. It can explain concepts, summarize papers, help with assignments, and answer questions about any topic in our library.'
      },
      {
        q: 'Is the AI tutor available 24/7?',
        a: 'Yes, DARA is always available. It uses advanced AI to provide instant, accurate educational support.'
      }
    ]
  },
  {
    category: 'International Repositories',
    icon: Globe,
    items: [
      {
        q: 'Can I access resources from other universities?',
        a: 'Yes! The International Repositories section connects you to 20+ major repositories including MIT, Oxford, Cambridge, and African universities.'
      },
      {
        q: 'How do I cite a resource I found on DARE?',
        a: 'Each research result has a "Cite" button that generates citations in APA, MLA, Chicago, BibTeX, and RIS formats. Click the format you need and copy or download.'
      }
    ]
  }
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-bold text-slate-800 text-sm pr-4">{question}</span>
        {open ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white border-t border-slate-50">
          <p className="text-sm text-slate-600 leading-relaxed pt-3">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Help() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={28} className="text-teal-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">Help Center</h1>
          <p className="text-slate-500 text-lg">Find answers to common questions about DARE Digital Library</p>
        </div>

        <div className="space-y-8">
          {FAQ.map(section => (
            <div key={section.category}>
              <div className="flex items-center gap-2 mb-4">
                <section.icon size={16} className="text-teal-600" />
                <h2 className="font-black text-slate-900 uppercase tracking-wider text-xs">{section.category}</h2>
              </div>
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <FAQItem key={i} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-teal-50 border border-teal-100 rounded-2xl p-6 text-center">
          <Mail size={24} className="text-teal-600 mx-auto mb-3" />
          <h3 className="font-black text-slate-900 mb-2">Still need help?</h3>
          <p className="text-sm text-slate-600 mb-4">Can't find what you're looking for? Our support team is here.</p>
          <Link to="/contact" className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
