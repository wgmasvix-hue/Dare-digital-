import { useState } from 'react';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Search, 
  LayoutGrid, 
  FileText, 
  Video, 
  Headphones, 
  MonitorPlay,
  ScanLine,
  Sparkles
} from 'lucide-react';
import styles from './FilterPanel.module.css';

const LEVELS = ['All', 'Certificate', 'Diploma', 'HND', 'Degree'];
const PILLARS = ['All', 'Teaching', 'Research', 'Community Engagement', 'Innovation', 'Industrialisation'];
const ACCESS_TYPES = ['All', 'Open Access', 'Dare Access', 'Purchased'];
const FACULTIES = ['All', 'STEM', 'Agriculture & Environmental', 'Health Sciences', 'Business & Law', 'Education (Heritage-based)', 'Engineering', 'Humanities & Social Sciences', 'AI & Future Tech'];
const UNIVERSITIES = ['All', 'UZ', 'MSU', 'NUST', 'CUT', 'BUSE', 'LSU', 'GZU', 'HIT', 'AU', 'ZEGU', 'ZOU'];
const SOURCES = ['All', 'Featured Items', 'Dare Library', 'Partner Resources'];
const FORMATS = [
  { id: 'All', label: 'All Formats', icon: LayoutGrid },
  { id: 'PDF', label: 'PDFs', icon: FileText },
  { id: 'Video', label: 'Video Lectures', icon: Video },
  { id: 'Audio', label: 'Audiobooks', icon: Headphones },
  { id: 'Interactive', label: 'Interactive', icon: MonitorPlay }
];

export default function FilterPanel({ 
  filters, 
  subjects = [], // Array of subject objects { code, name } or strings
  onFilterChange, 
  onClearFilters,
  onRequestDigitization,
  className = '',
  isOpen: externalIsOpen,
  onToggle: externalOnToggle
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  const toggleOpen = () => {
    if (isControlled) {
      externalOnToggle && externalOnToggle(!isOpen);
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  // Check if any filter is active (excluding default values)
  const hasActiveFilters = 
    filters.q || 
    (filters.subjects && filters.subjects.length > 0) ||
    filters.level !== 'All' || 
    filters.pillar !== 'All' ||
    filters.access !== 'All' || 
    filters.source !== 'All' ||
    filters.format !== 'All' || 
    filters.university !== 'All' ||
    filters.yearFrom || 
    filters.yearTo || 
    filters.isbn || 
    filters.zimAuthored || 
    filters.africanContext;

  const handleSubjectChange = (subjectName) => {
    const currentSubjects = filters.subjects || [];
    let newSubjects;
    
    if (currentSubjects.includes(subjectName)) {
      newSubjects = currentSubjects.filter(s => s !== subjectName);
    } else {
      newSubjects = [...currentSubjects, subjectName];
    }
    
    onFilterChange('subjects', newSubjects);
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${isOpen ? 'w-80' : 'w-0 overflow-hidden'} ${className}`}>
      <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Filter size={18} />
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button 
            className="text-xs font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider transition-colors"
            onClick={onClearFilters}
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* AI Data Saver Mode */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
                <Sparkles size={14} />
              </div>
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-50 uppercase tracking-wider">AI Data Saver</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={filters.aiDataSaver || false}
                onChange={(e) => onFilterChange('aiDataSaver', e.target.checked)}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>
          <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">
            Prioritize AI summaries and quick views to save up to 95% of your mobile data.
          </p>
        </div>

        {/* Source Filter */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Resource Source</h4>
          <div className="grid grid-cols-1 gap-2">
            {SOURCES.map(source => (
              <button
                key={source}
                onClick={() => onFilterChange('source', source)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all border ${filters.source === source ? 'bg-amber-500 border-amber-500 text-white font-bold shadow-md shadow-amber-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:border-amber-500'}`}
              >
                <div className="flex items-center gap-3">
                  {source === 'Featured Items' && <Sparkles size={14} className={filters.source === source ? 'text-white' : 'text-amber-500'} />}
                  <span>{source}</span>
                </div>
                {filters.source === source && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* ISBN Filter */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">ISBN Search</h4>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="e.g. 978-3-16..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition-all"
              value={filters.isbn || ''}
              onChange={(e) => onFilterChange('isbn', e.target.value)}
            />
          </div>
        </div>

        {/* Faculty Filter */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Faculty</h4>
          <div className="grid grid-cols-1 gap-2">
            {FACULTIES.map(faculty => (
              <button
                key={faculty}
                onClick={() => onFilterChange('faculty', faculty)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${filters.faculty === faculty ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 font-bold border border-amber-200 dark:border-amber-800' : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
              >
                <div className={`w-2 h-2 rounded-full ${filters.faculty === faculty ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                {faculty}
              </button>
            ))}
          </div>
        </div>

        {/* Education 5.0 Pillars Filter */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Education 5.0 Pillars</h4>
          <div className="grid grid-cols-1 gap-2">
            {PILLARS.map(pillar => (
              <button
                key={pillar}
                onClick={() => onFilterChange('pillar', pillar)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${filters.pillar === pillar ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 font-bold border border-indigo-200 dark:border-indigo-800' : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
              >
                <div className={`w-2 h-2 rounded-full ${filters.pillar === pillar ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                {pillar}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Filter */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Subject Area</h4>
          <div className="flex flex-wrap gap-2">
            {subjects.map(subject => {
              const subjectName = typeof subject === 'string' ? subject : subject.name;
              const isSelected = (filters.subjects || []).includes(subjectName);
              
              return (
                <button
                  key={subjectName}
                  onClick={() => handleSubjectChange(subjectName)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${isSelected ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-500'}`}
                >
                  {subjectName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Filter */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Resource Format</h4>
          <div className="grid grid-cols-2 gap-2">
            {FORMATS.map(fmt => (
              <button
                key={fmt.id}
                onClick={() => onFilterChange('format', fmt.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 ${filters.format === fmt.id ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-amber-200'}`}
              >
                <fmt.icon size={18} className={filters.format === fmt.id ? 'text-amber-600' : 'text-slate-400'} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{fmt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Year Published Filter */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Publication Era</h4>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="From" 
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-amber-500 transition-all"
              value={filters.yearFrom || ''}
              onChange={(e) => onFilterChange('yearFrom', e.target.value)}
            />
            <span className="text-slate-300">—</span>
            <input 
              type="number" 
              placeholder="To" 
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-amber-500 transition-all"
              value={filters.yearTo || ''}
              onChange={(e) => onFilterChange('yearTo', e.target.value)}
            />
          </div>
        </div>

        {/* Local Context Filter */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Contextual Filters</h4>
          <div className="space-y-2">
            {[
              { id: 'zimAuthored', label: 'Zimbabwe Authored', icon: '🇿🇼' },
              { id: 'africanContext', label: 'African Context', icon: '🌍' },
              { id: 'peerReviewed', label: 'Peer Reviewed', icon: '🔬' }
            ].map(item => (
              <label key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  checked={filters[item.id] || false}
                  onChange={(e) => onFilterChange(item.id, e.target.checked)}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Digitization Promo */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/20 blur-2xl rounded-full -mr-10 -mt-10" />
          <p className="text-xs font-medium text-slate-400">Can't find a book?</p>
          <h5 className="font-serif font-bold text-sm">Request Digitization</h5>
          <button 
            onClick={onRequestDigitization}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <ScanLine size={14} /> Submit Request
          </button>
        </div>

      </div>
    </div>
  );
}
