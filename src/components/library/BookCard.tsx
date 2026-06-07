import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useState } from 'react';
import { 
  BookOpen, Star, ShieldCheck, Globe, Lock, 
  Eye, ArrowRight, Sparkles, LucideIcon
} from 'lucide-react';
import { Book } from '../../types';
import AIInsightModal from './AIInsightModal';

const FACULTY_COLORS: Record<string, string> = {
  stem: '#2563EB', // Blue 600
  agriculture: '#059669', // Emerald 600
  health: '#DC2626', // Red 600
  business: '#D97706', // Amber 600
  education: '#EAB308', // Yellow 500
  engineering: '#0284C7', // Sky 600
  law: '#991B1B', // Red 800
  humanities: '#7C3AED', // Violet 600
  default: '#64748B' // Slate 500
};

const ACCESS_BADGES: Record<string, { label: string; color: string; icon: LucideIcon; bg?: string }> = {
  free: { label: 'Free', color: '#059669', icon: Globe },
  open_access: { label: 'Dare Access', color: '#059669', icon: Globe },
  public_domain: { label: 'Public Domain', color: '#059669', icon: Globe },
  dare_access: { label: 'Dare Access', color: '#D97706', icon: BookOpen },
  licensed: { label: 'Licensed', color: '#2563EB', icon: ShieldCheck },
  institutional: { label: 'Institutional', color: '#2563EB', icon: ShieldCheck },
  preview: { label: 'Preview', color: '#DC2626', bg: '#FEE2E2', icon: Lock }
};

const Badge = ({ text, color = "#64748B", icon: Icon, small = false }: { text: string; color?: string; icon?: LucideIcon; small?: boolean }) => (
  <span 
    className={`inline-flex items-center gap-1 rounded-md font-bold uppercase tracking-wider whitespace-nowrap backdrop-blur-sm ${small ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-1 text-[10px]'}`}
    style={{ 
      backgroundColor: `${color}20`, 
      color: color,
      border: `1px solid ${color}40`
    }}
  >
    {Icon && <Icon size={small ? 8 : 10} />}
    {text}
  </span>
);

const BrandedPlaceholder = ({ title }: { title: string }) => (
  <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
    {/* Decorative Background Elements */}
    <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
    <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full -ml-20 -mb-20 blur-3xl" />
    
    <div className="relative z-10 flex flex-col items-center gap-6">
      <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-teal-600 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
        <BookOpen size={40} strokeWidth={1.5} />
      </div>
      <div>
        <h4 className="font-serif font-bold text-slate-800 text-base leading-tight mb-2 line-clamp-3 px-4">
          {title}
        </h4>
        <div className="w-10 h-1 bg-teal-500/30 rounded-full mx-auto mb-3" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          DARE Digital Library
        </p>
      </div>
    </div>
    
    {/* Subtle Pattern Overlay */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(var(--color-slate-900) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
  </div>
);

interface BookCardProps {
  publication: Book;
  variant?: 'grid' | 'featured' | 'tile' | 'list';
  onOpen?: (book: Book) => void;
  loading?: boolean;
  progress?: number;
}

export default function BookCard({ publication, variant = 'tile', onOpen, loading = false, progress = 0 }: BookCardProps) {
  const navigate = useNavigate();
  const [showInsight, setShowInsight] = useState(false);

  if (loading) {
    return (
      <div className={`relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm ${variant === 'featured' || variant === 'list' ? 'md:flex-row' : ''}`}>
        <div className={`bg-slate-100 relative overflow-hidden animate-pulse ${
          variant === 'featured' || variant === 'list' ? 'md:w-1/3 aspect-[3/4]' : 
          variant === 'tile' ? 'aspect-[4/5]' : 
          'aspect-[3/4]'
        }`} />
        <div className="p-6 flex flex-col flex-1 space-y-4">
          <div className="h-4 bg-slate-100 rounded animate-pulse w-1/4" />
          <div className="h-8 bg-slate-100 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
          <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between">
            <div className="h-3 bg-slate-100 rounded animate-pulse w-1/4" />
            <div className="h-3 bg-slate-100 rounded animate-pulse w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!publication) return null;

  const {
    id, title, author_names,
    faculty, subject, cover_path, cover_image_url, access_model,
    year_published, average_rating, total_downloads,
    description,
    isZimbabwe, isPeerReviewed, featured, is_featured
  } = publication;

  const isFeatured = featured || is_featured;

  const displayFaculty = faculty || subject;
  const defaultCover = null; 
  const displayCover = cover_path || cover_image_url || defaultCover;
  
  const facultyKey = displayFaculty?.toLowerCase() || 'default';
  const facultyColor = FACULTY_COLORS[facultyKey] || FACULTY_COLORS.default;
  
  const accessKey = access_model?.toLowerCase() || 'preview';
  const accessBadge = ACCESS_BADGES[accessKey] || ACCESS_BADGES.preview;
  const AccessIcon = accessBadge.icon;
  
  const isNew = year_published && year_published >= new Date().getFullYear() - 1;

  const handleCardClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpen) {
      onOpen(publication);
    } else {
      setShowInsight(true);
    }
  };

  const cardContent = (
    <div className={`relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-200 transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 group-focus:ring-4 ring-teal-500/30 group-hover:border-teal-500/30 ${variant === 'featured' || variant === 'list' ? 'md:flex-row' : ''}`}>
      {/* Cover Section */}
      <div className={`relative overflow-hidden bg-slate-100 border-b md:border-b-0 md:border-r border-slate-100 ${
        variant === 'featured' || variant === 'list' ? 'md:w-1/3 aspect-[3/4]' : 
        variant === 'tile' ? 'aspect-[4/5]' : 
        'aspect-[3/4]'
      }`}>
        {displayCover ? (
          <img 
            src={displayCover} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.style.display = 'none';
              if (target.nextSibling instanceof HTMLElement) {
                target.nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        {/* Placeholder (hidden if image loads successfully) */}
        <div className={`${displayCover ? 'hidden' : 'flex'} w-full h-full`}>
          <BrandedPlaceholder title={title} />
        </div>
        
        {/* Spine Accent */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5 z-10"
          style={{ backgroundColor: facultyColor }}
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 gap-3">
           <button 
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              navigate(`/book-action/${id}?action=edu5`, { state: { book: publication } });
            }}
           >
             <Sparkles size={16} /> AI Assist Dissector
           </button>
           <button 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              navigate(`/reader/${id}`);
            }}
            className="w-full py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/20 active:scale-95 shadow-md"
           >
             <BookOpen size={16} /> Read Book
           </button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
          {isFeatured && (
            <span className="bg-amber-500 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Star size={8} fill="currentColor" /> Featured
            </span>
          )}
          {isNew && variant !== 'tile' && (
            <span className="bg-teal-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              New
            </span>
          )}
          {publication.dara_summary && (
            <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles size={8} className="text-amber-400" /> AI Ready
            </span>
          )}
          <span 
            className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm"
            style={{ 
              backgroundColor: accessBadge.bg || accessBadge.color,
              color: accessBadge.bg ? accessBadge.color : 'white'
            }}
          >
            <AccessIcon size={10} />
            {variant === 'tile' ? '' : accessBadge.label}
          </span>
        </div>

        {/* Persistent Floating AI Assist Pill */}
        <div className="absolute bottom-3 right-3 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              navigate(`/book-action/${id}?action=edu5`, { state: { book: publication } });
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all border border-teal-400/20"
            title="DARA AI Assist"
          >
            <Sparkles size={11} className="animate-pulse text-amber-300" />
            <span>AI Assist</span>
          </button>
        </div>

        {/* Progress Bar Overlay */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20 backdrop-blur-sm z-20">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]"
            />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className={`p-5 flex flex-col flex-1 ${variant === 'tile' ? 'p-4' : ''}`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {isZimbabwe && <Badge text="🇿🇼 Zim" color="#14b8a6" small />}
            {isPeerReviewed && <Badge text="Peer Reviewed" color="#3b82f6" small />}
            {publication.zimche_code && <Badge text="ZIMCHE" color="#6366f1" small />}
          </div>

          <h3 className={`font-serif font-black text-slate-900 leading-tight mb-1.5 line-clamp-2 group-hover:text-teal-600 transition-colors ${variant === 'featured' || variant === 'list' ? 'text-2xl' : 'text-lg'}`}>
            {title}
          </h3>
          
          <p className="text-xs text-slate-500 font-bold mb-4 uppercase tracking-wider">
            {author_names}
          </p>

          {(variant === 'featured' || variant === 'list') && description && (
            <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Footer */}
        {variant !== 'tile' && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              {average_rating !== undefined && average_rating > 0 && (
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Star size={12} fill="currentColor" />
                  <span>{average_rating.toFixed(1)}</span>
                </div>
              )}
              {total_downloads !== undefined && total_downloads > 0 && (
                <div className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                  <Eye size={12} />
                  <span>{total_downloads > 1000 ? `${(total_downloads/1000).toFixed(1)}k` : total_downloads}</span>
                </div>
              )}
            </div>
            
            <div className="text-[10px] font-black text-slate-300 hover:text-teal-600 uppercase tracking-widest flex items-center gap-1 transition-colors">
              {year_published} 
              <ArrowRight size={10} className="-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group cursor-pointer ${variant === 'featured' || variant === 'list' ? 'col-span-full' : ''} h-full block focus:outline-none`}
      >
        <div onClick={handleCardClick} role="button" tabIndex={0} className="h-full block focus:outline-none">
          {cardContent}
        </div>
      </motion.div>
      <AIInsightModal 
        isOpen={showInsight} 
        onClose={() => setShowInsight(false)} 
        book={publication} 
      />
    </>
  );
}
