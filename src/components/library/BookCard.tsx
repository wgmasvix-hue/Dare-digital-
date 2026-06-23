import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useState } from 'react';
import {
  BookOpen, Star, ShieldCheck, Globe, Lock,
  Eye, ArrowRight, Sparkles, LucideIcon,
  Heart, ExternalLink, Tag, Calendar,
  Users, Hash, CheckCircle2, FileText, Download
} from 'lucide-react';
import { Book } from '../../types';
import AIInsightModal from './AIInsightModal';
import CitationMenu from './CitationMenu';

// ── Colour maps ────────────────────────────────────────────────────────────────

const FACULTY_COLORS: Record<string, string> = {
  stem: '#2563EB',
  agriculture: '#059669',
  health: '#DC2626',
  business: '#D97706',
  education: '#EAB308',
  engineering: '#0284C7',
  law: '#991B1B',
  humanities: '#7C3AED',
  default: '#64748B',
};

const ACCESS_BADGES: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  free:          { label: 'Open Access',    color: '#059669', icon: Globe },
  open_access:   { label: 'Open Access',    color: '#059669', icon: Globe },
  public_domain: { label: 'Public Domain', color: '#059669', icon: Globe },
  dare_access:   { label: 'DARE Access',   color: '#0284C7', icon: BookOpen },
  licensed:      { label: 'Licensed',      color: '#7C3AED', icon: ShieldCheck },
  institutional: { label: 'Institutional', color: '#7C3AED', icon: ShieldCheck },
  preview:       { label: 'Preview',       color: '#DC2626', icon: Lock },
};

const SOURCE_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  gutenberg:    { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  'project gutenberg': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  arxiv:        { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
  'arxiv research': { bg: 'bg-red-50', text: 'text-red-700',  border: 'border-red-200'    },
  openlibrary:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'open library': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  openstax:     { bg: 'bg-amber-50', text: 'text-amber-700',  border: 'border-amber-200'  },
  research:     { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  default:      { bg: 'bg-sky-50',   text: 'text-sky-700',    border: 'border-sky-200'    },
};

function getSourceConfig(source?: string) {
  const key = (source || '').toLowerCase();
  return SOURCE_CONFIG[key] || SOURCE_CONFIG.default;
}

function getFacultyColor(faculty?: string, subject?: string) {
  const text = ((faculty || subject) ?? '').toLowerCase();
  const key = Object.keys(FACULTY_COLORS).find(k => text.includes(k)) || 'default';
  return FACULTY_COLORS[key];
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const SourceBadge = ({ source }: { source?: string }) => {
  const cfg = getSourceConfig(source);
  const label = source || 'DARE Library';
  return (
    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {label}
    </span>
  );
};

const MetaPill = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 ${className}`}>
    {children}
  </span>
);

const BrandedPlaceholder = ({ title, color }: { title: string; color: string }) => (
  <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl opacity-30" style={{ backgroundColor: color }} />
    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full -ml-16 -mb-16 blur-3xl opacity-20" style={{ backgroundColor: color }} />
    <div className="relative z-10 flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center" style={{ color }}>
        <BookOpen size={32} strokeWidth={1.5} />
      </div>
      <h4 className="font-serif font-bold text-slate-800 text-sm leading-tight line-clamp-3 px-2">{title}</h4>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">DARE Digital Library</p>
    </div>
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
  </div>
);

// ── Skeleton ───────────────────────────────────────────────────────────────────

const Skeleton = ({ variant = 'tile' }: { variant?: string }) => {
  if (variant === 'list') {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 w-20 bg-slate-100 rounded-full animate-pulse" />
          <div className="h-4 w-16 bg-slate-100 rounded-full animate-pulse" />
        </div>
        <div className="h-6 bg-slate-100 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
        <div className="h-3 bg-slate-100 rounded animate-pulse w-full" />
        <div className="h-3 bg-slate-100 rounded animate-pulse w-5/6" />
        <div className="h-3 bg-slate-100 rounded animate-pulse w-4/5" />
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <div className="h-7 w-16 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-7 w-14 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-7 w-20 bg-slate-100 rounded-lg animate-pulse ml-auto" />
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      <div className={`bg-slate-100 animate-pulse ${variant === 'grid' ? 'aspect-[3/4]' : 'aspect-[4/5]'}`} />
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <div className="h-3 bg-slate-100 rounded animate-pulse w-1/3" />
        <div className="h-5 bg-slate-100 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
        <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between">
          <div className="h-3 bg-slate-100 rounded animate-pulse w-1/4" />
          <div className="h-3 bg-slate-100 rounded animate-pulse w-1/4" />
        </div>
      </div>
    </div>
  );
};

// ── Props ──────────────────────────────────────────────────────────────────────

interface BookCardProps {
  publication?: Book;
  variant?: 'grid' | 'featured' | 'tile' | 'list';
  onOpen?: (book: Book) => void;
  loading?: boolean;
  progress?: number;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function BookCard({
  publication, variant = 'tile', onOpen, loading = false,
  progress = 0, isSaved = false, onToggleSave,
}: BookCardProps) {
  const navigate = useNavigate();
  const [showInsight, setShowInsight] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (loading) return <Skeleton variant={variant} />;
  if (!publication) return null;

  const {
    id, title, author_names, faculty, subject,
    cover_path, cover_image_url, access_model,
    year_published, average_rating, total_downloads,
    description, abstract, isZimbabwe, isPeerReviewed,
    featured, is_featured, source, dara_summary,
    ai_topics, subjects: bookSubjects,
  } = publication as any;

  const excerpt = abstract || description;
  const isFeatured = featured || is_featured;
  const isNew = year_published && year_published >= new Date().getFullYear() - 1;
  const displayCover = !imgError ? (cover_path || cover_image_url) : null;
  const facultyColor = getFacultyColor(faculty, subject);
  const accessKey = (access_model || 'preview').toLowerCase();
  const accessBadge = ACCESS_BADGES[accessKey] || ACCESS_BADGES.preview;
  const AccessIcon = accessBadge.icon;
  const sourceLabel = source || 'DARE Library';
  const tags: string[] = [...(ai_topics || []), ...(bookSubjects || [])].slice(0, 5);

  const citableItem = {
    title,
    author_names,
    publisher_name: (publication as any).publisher_name || sourceLabel,
    year_published,
    url: (publication as any).file_url || (publication as any).url,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpen) onOpen(publication);
    else setShowInsight(true);
  };

  const goReader = (e: React.MouseEvent) => { e.stopPropagation(); navigate(`/reader/${id}`); };
  const goAI = (e: React.MouseEvent) => { e.stopPropagation(); navigate(`/book-action/${id}?action=edu5`, { state: { book: publication } }); };
  const handleSave = (e: React.MouseEvent) => { e.stopPropagation(); onToggleSave?.(String(id)); };

  // ── LIST VARIANT (ProQuest-grade) ──────────────────────────────────────────
  if (variant === 'list') {
    return (
      <>
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="group bg-white border border-slate-200 rounded-2xl hover:border-teal-300 hover:shadow-md transition-all duration-200 overflow-hidden"
        >
          <div className="p-5 flex gap-5">
            {/* Narrow thumbnail */}
            <div
              className="hidden sm:block shrink-0 w-[72px] h-[96px] rounded-xl overflow-hidden border border-slate-100 cursor-pointer"
              style={{ borderLeftColor: facultyColor, borderLeftWidth: 3 }}
              onClick={handleCardClick}
            >
              {displayCover ? (
                <img src={displayCover} alt={title} className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" onError={() => setImgError(true)} />
              ) : (
                <BrandedPlaceholder title={title} color={facultyColor} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Badge row */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <SourceBadge source={sourceLabel} />
                {isPeerReviewed && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
                    <CheckCircle2 size={9} /> Peer Reviewed
                  </span>
                )}
                <span
                  className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border"
                  style={{ color: accessBadge.color, borderColor: `${accessBadge.color}40`, backgroundColor: `${accessBadge.color}12` }}
                >
                  <AccessIcon size={9} /> {accessBadge.label}
                </span>
                {isZimbabwe && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-teal-50 text-teal-700 border-teal-200">🇿🇼 Zim</span>
                )}
                {isFeatured && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
                    ★ Featured
                  </span>
                )}
                {dara_summary && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-slate-900 text-amber-400 border-slate-700 flex items-center gap-1">
                    <Sparkles size={8} /> AI Ready
                  </span>
                )}
              </div>

              {/* Title */}
              <h3
                onClick={handleCardClick}
                className="font-serif font-black text-[17px] leading-snug text-slate-900 group-hover:text-teal-700 transition-colors cursor-pointer line-clamp-2 mb-1.5"
              >
                {title}
              </h3>

              {/* Authors */}
              {author_names && (
                <p className="text-sm text-slate-600 mb-1.5 flex items-center gap-1.5 font-medium">
                  <Users size={11} className="text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{author_names}</span>
                </p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-medium mb-3">
                {(publication as any).publisher_name && <span className="text-slate-500">{(publication as any).publisher_name}</span>}
                {year_published && (
                  <span className="flex items-center gap-1"><Calendar size={10} />{year_published}</span>
                )}
                {(publication as any).page_count > 0 && (
                  <span className="flex items-center gap-1"><FileText size={10} />{(publication as any).page_count} pp</span>
                )}
                {average_rating > 0 && (
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star size={10} fill="currentColor" />{average_rating.toFixed(1)}
                  </span>
                )}
                {total_downloads > 0 && (
                  <span className="flex items-center gap-1"><Eye size={10} />{total_downloads > 1000 ? `${(total_downloads / 1000).toFixed(1)}k` : total_downloads} reads</span>
                )}
              </div>

              {/* Abstract */}
              {excerpt && (
                <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-3">
                  {excerpt}
                </p>
              )}

              {/* Subject tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tags.map(tag => (
                    <MetaPill key={tag}><Tag size={8} />{tag}</MetaPill>
                  ))}
                </div>
              )}

              {/* DOI / ISBN */}
              {((publication as any).doi || (publication as any).isbn) && (
                <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                  <Hash size={10} />
                  {(publication as any).doi
                    ? <a href={`https://doi.org/${(publication as any).doi}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-teal-600 hover:underline flex items-center gap-1">doi:{(publication as any).doi} <ExternalLink size={9} /></a>
                    : <span>ISBN: {(publication as any).isbn}</span>
                  }
                </p>
              )}

              {/* Action row */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    isSaved
                      ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200'
                  }`}
                >
                  <Heart size={12} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>

                <div className="cite-wrap" onClick={e => e.stopPropagation()}>
                  <CitationMenu item={citableItem} />
                </div>

                <button
                  onClick={goAI}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 text-xs font-bold transition-all"
                >
                  <Sparkles size={12} /> AI Assist
                </button>

                <button
                  onClick={goReader}
                  className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-500 text-xs font-bold transition-all shadow-sm"
                >
                  <BookOpen size={12} /> Full Text <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* Reading progress */}
          {progress > 0 && (
            <div className="h-1 bg-slate-100 mx-5 mb-3 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-teal-500 rounded-full"
              />
            </div>
          )}
        </motion.div>

        <AIInsightModal isOpen={showInsight} onClose={() => setShowInsight(false)} book={publication} />
      </>
    );
  }

  // ── TILE / GRID VARIANTS ───────────────────────────────────────────────────
  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group cursor-pointer h-full block focus:outline-none ${variant === 'featured' ? 'col-span-full' : ''}`}
      >
        <div
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 transition-all duration-200 shadow-sm group-hover:shadow-lg group-hover:-translate-y-0.5 group-hover:border-teal-300 focus:outline-none focus:ring-4 ring-teal-500/20"
        >
          {/* Cover */}
          <div className={`relative overflow-hidden bg-slate-100 ${variant === 'grid' ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}>
            <div className="absolute left-0 top-0 bottom-0 w-1 z-10" style={{ backgroundColor: facultyColor }} />

            {displayCover ? (
              <img
                src={displayCover} alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy" referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <BrandedPlaceholder title={title} color={facultyColor} />
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4 gap-2">
              <button onClick={goAI} className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all">
                <Sparkles size={13} /> AI Assist
              </button>
              <button onClick={goReader} className="w-full py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-white/20 transition-all">
                <BookOpen size={13} /> Read
              </button>
            </div>

            {/* Top badges */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-20">
              {isFeatured && (
                <span className="bg-amber-500 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shadow-sm">★ Pick</span>
              )}
              {isNew && (
                <span className="bg-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shadow-sm">New</span>
              )}
              {dara_summary && (
                <span className="bg-slate-900/80 backdrop-blur-sm text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 shadow-sm">
                  <Sparkles size={8} /> AI
                </span>
              )}
            </div>

            {/* Save button (top-right) */}
            <button
              onClick={handleSave}
              className={`absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${
                isSaved
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-white opacity-0 group-hover:opacity-100'
              }`}
            >
              <Heart size={13} fill={isSaved ? 'currentColor' : 'none'} />
            </button>

            {/* Progress bar */}
            {progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-20">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.6)]" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 flex flex-col flex-1">
            {/* Source + access badges */}
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <SourceBadge source={sourceLabel} />
              {isPeerReviewed && (
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-0.5">
                  <CheckCircle2 size={8} /> Peer
                </span>
              )}
            </div>

            <h3 className={`font-serif font-black text-slate-900 leading-tight mb-1 line-clamp-2 group-hover:text-teal-700 transition-colors ${variant === 'grid' ? 'text-sm' : 'text-base'}`}>
              {title}
            </h3>

            <p className="text-xs text-slate-500 font-semibold mb-2 line-clamp-1">{author_names}</p>

            {/* Footer */}
            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {average_rating > 0 && (
                  <span className="flex items-center gap-1 text-amber-500 font-bold text-[10px]">
                    <Star size={10} fill="currentColor" />{average_rating.toFixed(1)}
                  </span>
                )}
                {total_downloads > 0 && (
                  <span className="flex items-center gap-1 text-slate-400 font-bold text-[10px]">
                    <Download size={10} />{total_downloads > 1000 ? `${(total_downloads / 1000).toFixed(1)}k` : total_downloads}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400">{year_published}</span>
                <div onClick={e => { e.stopPropagation(); }} className="cite-wrap">
                  <CitationMenu item={citableItem} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AIInsightModal isOpen={showInsight} onClose={() => setShowInsight(false)} book={publication} />
    </>
  );
}
