import { useState, useEffect, useRef } from 'react';
import { Loader2, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import generatedContent from '../data/generatedBookContent.json';

/**
 * Drop-in BAKO AI summary card for any resource.
 * Props:
 *   resource: { id, title, author_names?, subject?, description? }
 *   compact?: boolean  — smaller card for use inside lists
 */
export default function BakoSummaryCard({ resource, compact = false }) {
  const [summary, setSummary] = useState(null);
  const [lessonPlan, setLessonPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('summary');
  const [expanded, setExpanded] = useState(!compact);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!resource?.id || ranRef.current) return;
    ranRef.current = true;

    const cacheKey = `bako_content_${resource.id}`;

    // 1. Pre-generated JSON bundle
    if (generatedContent[resource.id]?.summary) {
      setSummary(generatedContent[resource.id].summary);
      setLessonPlan(generatedContent[resource.id].lessonPlan || null);
      return;
    }

    // 2. localStorage
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached?.summary) {
        setSummary(cached.summary);
        setLessonPlan(cached.lessonPlan || null);
        return;
      }
    } catch { /* ignore */ }

    // 3. Live DeepSeek generation
    setLoading(true);
    const desc = `Title: ${resource.title}\nAuthor: ${resource.author_names || 'Unknown'}\nSubject: ${resource.subject || 'General'}\nDescription: ${resource.description || ''}`;

    Promise.all([
      geminiService.summarize(desc,
        'Write a concise 150-200 word educational summary for Zimbabwean students covering key concepts and relevance. No bullet points.'),
      geminiService.generateLessonPlan({
        subject: resource.subject || 'General Studies',
        level: 'Secondary/Tertiary',
        topic: resource.title,
        duration: '60 minutes',
        resources: 'Textbook, chalk, local environment',
      }),
    ])
      .then(([s, lp]) => {
        setSummary(s);
        setLessonPlan(lp);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            summary: s, lessonPlan: lp, generatedAt: new Date().toISOString()
          }));
        } catch { /* storage full */ }
      })
      .catch(err => {
        console.warn('BAKO summary error:', err);
        setSummary('BAKO summary unavailable. Check your connection and try again.');
      })
      .finally(() => setLoading(false));
  }, [resource]);

  if (!resource) return null;

  if (compact && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-amber-800 transition-all hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg,rgba(251,191,36,0.15),rgba(194,65,12,0.10))', border: '1px solid rgba(217,119,6,0.25)' }}
      >
        <span className="text-lg">🌳</span>
        <span>Show BAKO AI Summary</span>
        <ChevronDown size={15} className="ml-auto" />
      </button>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden shadow-sm border border-amber-100"
      style={{ background: 'linear-gradient(135deg, #1C0A00 0%, #451A03 100%)' }}>

      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🌳</span>
          <div>
            <p className="text-amber-300 font-bold text-xs tracking-wide uppercase">BAKO AI Analysis</p>
            {!loading && summary && (
              <p className="text-amber-100/50 text-[10px]">Cached · DeepSeek powered</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 size={13} className="animate-spin text-amber-400" />}
          {compact && (
            <button onClick={() => setExpanded(false)} className="text-amber-400/60 hover:text-amber-400">
              <ChevronUp size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5">
        <button onClick={() => setTab('summary')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-t-xl transition-all ${tab === 'summary' ? 'bg-amber-500 text-white' : 'text-amber-300/60 hover:text-amber-300'}`}>
          📖 Summary
        </button>
        <button onClick={() => setTab('lesson')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-t-xl transition-all ${tab === 'lesson' ? 'bg-amber-500 text-white' : 'text-amber-300/60 hover:text-amber-300'}`}>
          📋 Lesson Plan
        </button>
      </div>

      {/* Content */}
      <div className="bg-[#fdf8f0] rounded-b-3xl p-5 min-h-[120px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-amber-800">
            <Loader2 size={24} className="animate-spin text-amber-600" />
            <p className="text-sm font-medium">BAKO is generating your {tab === 'summary' ? 'summary' : 'lesson plan'}…</p>
          </div>
        ) : tab === 'summary' ? (
          summary ? (
            <div className="prose prose-sm prose-amber max-w-none text-stone-800 prose-headings:text-amber-900 prose-strong:text-amber-800">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          ) : (
            <EmptyState label="Summary will appear here." />
          )
        ) : (
          lessonPlan ? (
            <div className="prose prose-sm prose-amber max-w-none text-stone-800 prose-headings:text-amber-900 prose-strong:text-amber-800 prose-table:text-xs">
              <ReactMarkdown>{lessonPlan}</ReactMarkdown>
            </div>
          ) : (
            <EmptyState label="Lesson plan will appear here." />
          )
        )}
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 gap-2 text-amber-700">
      <GraduationCap size={24} className="opacity-30" />
      <p className="text-sm italic">{label}</p>
    </div>
  );
}
