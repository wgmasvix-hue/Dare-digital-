import React from 'react';
import { Book, Globe, Library, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const UnifiedResourceCard = ({ resource, onAskAI }) => {
  const { title, author, description, source, url, availability } = resource;

  const getSourceIcon = () => {
    switch (source) {
      case 'DARE': return <Book className="text-amber-600" size={18} />;
      case 'KOHA': return <Library className="text-emerald-600" size={18} />;
      case 'OPEN': return <Globe className="text-blue-600" size={18} />;
      default: return <Book size={18} />;
    }
  };

  const getSourceLabel = () => {
    switch (source) {
      case 'DARE': return 'Digital Book';
      case 'KOHA': return 'Physical Library';
      case 'OPEN': return 'Open Resource';
      default: return source;
    }
  };

  const getBadgeColor = () => {
    switch (source) {
      case 'DARE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'KOHA': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeColor()}`}>
            {getSourceIcon()}
            {getSourceLabel()}
          </div>
          {availability && (
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              {availability}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">
          {title}
        </h3>
        {author && (
          <p className="text-sm text-slate-500 mb-3 italic">by {author}</p>
        )}
        {description && (
          <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
        <a 
          href={url || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
        >
          {source === 'KOHA' ? 'Locate Book' : 'Open Resource'}
        </a>
        <button 
          onClick={() => onAskAI(resource)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors"
        >
          <Sparkles size={16} className="text-amber-500" />
          Ask AI
        </button>
      </div>
    </motion.div>
  );
};

export default UnifiedResourceCard;
