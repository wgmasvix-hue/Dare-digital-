import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BookOpen, Star, ShieldCheck, Globe, Lock, 
  FileText, Video, Headphones, MonitorPlay, Eye,
  Info, ArrowRight, Sparkles
} from 'lucide-react';

const FACULTY_COLORS = {
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

const ACCESS_BADGES = {
  free: { label: 'Free', color: '#059669', icon: Globe },
  dare_access: { label: 'Dare Access', color: '#D97706', icon: BookOpen },
  licensed: { label: 'Licensed', color: '#2563EB', icon: ShieldCheck },
  institutional: { label: 'Institutional', color: '#2563EB', icon: ShieldCheck },
  preview: { label: 'Preview', color: '#DC2626', bg: '#FEE2E2', icon: Lock }
};

const FORMAT_ICONS = {
  pdf: { icon: FileText, label: '' },
  video: { icon: Video, label: 'Video' },
  audio: { icon: Headphones, label: 'Audio' },
  interactive: { icon: MonitorPlay, label: 'Interactive' }
};

export default function BookCard({ publication, variant = 'grid', onOpen }) {
  if (!publication) return null;

  const {
    id, title, author_names, publisher_name,
    faculty, subject, cover_path, cover_image_url, access_model,
    year_published, average_rating, total_downloads,
    page_count, description, format = 'pdf',
    isZimbabwe, isAfrican, isPeerReviewed, type, featured, is_featured
  } = publication;

  const isFeatured = featured || is_featured;

  const displayFaculty = faculty || subject;
  const defaultCover = "https://ais-pre-u75ndaxnqrzxvc2lbelr6a-10195607233.europe-west1.run.app/dare-theme.jpg";
  const displayCover = cover_path || cover_image_url || defaultCover;
  
  const facultyColor = FACULTY_COLORS[displayFaculty?.toLowerCase()] || FACULTY_COLORS.default;
  const accessBadge = ACCESS_BADGES[access_model?.toLowerCase()] || ACCESS_BADGES.preview;
  const AccessIcon = accessBadge.icon;
  const FormatIcon = FORMAT_ICONS[format?.toLowerCase()]?.icon || FileText;

  const isNew = year_published && year_published >= new Date().getFullYear() - 1;

  const handleCardClick = (e) => {
    if (onOpen) {
      e.preventDefault();
      onOpen(publication);
    }
  };

  const Badge = ({ text, color = "#64748B", icon: Icon, small = false }) => (
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

  const CardContent = () => (
    <div className={`relative flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 transition-all duration-300 group-hover:shadow-xl group-hover:border-amber-500/30 ${variant === 'featured' ? 'md:flex-row' : ''}`}>
      {/* Cover Section */}
      <div className={`relative overflow-hidden ${
        variant === 'featured' ? 'md:w-1/3 aspect-[3/4]' : 
        variant === 'tile' ? 'aspect-[4/5]' : 
        'aspect-[3/4]'
      }`}>
        <img 
          src={displayCover} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy" 
        />
        
        {/* Spine Accent */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 z-10"
          style={{ backgroundColor: facultyColor }}
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-2">
           <button 
            onClick={handleCardClick}
            className="w-full py-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-white/30 active:scale-95"
           >
             <Eye size={14} /> Quick View
           </button>
           <button 
            className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.({ ...publication, _showAiInsight: true });
            }}
           >
             <Sparkles size={14} /> AI Insight
           </button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
          {isFeatured && (
            <span className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg flex items-center gap-1">
              <Star size={8} fill="currentColor" /> Featured
            </span>
          )}
          {isNew && variant !== 'tile' && (
            <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg">
              New
            </span>
          )}
          {publication.dara_summary && (
            <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg flex items-center gap-1">
              <Sparkles size={8} /> AI Ready
            </span>
          )}
          <span 
            className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg"
            style={{ 
              backgroundColor: accessBadge.bg || accessBadge.color,
              color: accessBadge.bg ? accessBadge.color : 'white'
            }}
          >
            <AccessIcon size={10} />
            {variant === 'tile' ? '' : accessBadge.label}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className={`p-4 flex flex-col flex-1 ${variant === 'tile' ? 'p-3' : ''}`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {isZimbabwe && <Badge text="🇿🇼 Zim" color="#C5973A" small />}
            {isPeerReviewed && <Badge text="Peer Reviewed" color="#1A7A4A" small />}
            {publication.zimche_code && <Badge text="ZIMCHE" color="#1B3A6B" small />}
          </div>

          <h3 className={`font-serif font-bold text-slate-900 dark:text-white leading-tight mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors ${variant === 'featured' ? 'text-2xl' : 'text-base'}`}>
            {title}
          </h3>
          
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-3">
            {author_names}
          </p>

          {variant === 'featured' && description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 italic">
              {description}
            </p>
          )}
        </div>

        {/* Footer */}
        {variant !== 'tile' && (
          <div className="pt-3 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              {average_rating > 0 && (
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Star size={12} fill="currentColor" />
                  <span>{average_rating.toFixed(1)}</span>
                </div>
              )}
              {total_downloads > 0 && (
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                  <Eye size={12} />
                  <span>{total_downloads > 1000 ? `${(total_downloads/1000).toFixed(1)}k` : total_downloads}</span>
                </div>
              )}
            </div>
            
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
              {year_published} 
              <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`group cursor-pointer ${variant === 'featured' ? 'col-span-full' : ''}`}
    >
      {onOpen ? (
        <div onClick={handleCardClick} role="button" tabIndex={0}>
          <CardContent />
        </div>
      ) : (
        <Link to={`/reader/${id}`} className="block no-underline">
          <CardContent />
        </Link>
      )}
    </motion.div>
  );
}
