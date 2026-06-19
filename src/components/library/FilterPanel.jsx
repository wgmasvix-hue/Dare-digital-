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

const LEVELS = ['All', 'Certificate', 'Diploma', 'HND', 'Degree'];
const PILLARS = ['All', 'Teaching', 'Research', 'Community Engagement', 'Innovation', 'Industrialisation'];
const ACCESS_TYPES = ['All', 'Dare Access', 'Licensed', 'Purchased'];
const FACULTIES = ['All', 'STEM', 'Agriculture & Environmental', 'Health Sciences', 'Business & Law', 'Education (Heritage-based)', 'Vocational', 'Polytechnic', 'Engineering', 'Humanities & Social Sciences', 'AI & Future Tech'];
const UNIVERSITIES = ['All', 'UZ', 'MSU', 'NUST', 'CUT', 'BUSE', 'LSU', 'GZU', 'HIT', 'AU', 'ZEGU', 'ZOU'];
const SOURCES = ['All', 'Featured Items', 'Dare Library', 'Partner Resources', 'Project Gutenberg', 'Open Library', 'arXiv Research'];
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
    <div className={`flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${isOpen ? 'w-80' : 'w-0 overflow-hidden'} ${className}`}>
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Filter size={18} />
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button 
            className="text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wider transition-colors"
            onClick={onClearFilters}
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide pb-24">
        
        {/* AI Data Saver Mode */}
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
               <Sparkles size={16} className="text-emerald-600" />
               <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">AI Data Saver</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={filters.aiDataSaver || false}
                onChange={(e) => onFilterChange('aiDataSaver', e.target.checked)}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">
            Prioritize AI summaries and quick views to save up to 95% of your mobile data.
          </p>
        </div>

        {/* Source Filter */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
             Resource Source
          </h4>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map(source => (
              <button
                key={source}
                onClick={() => onFilterChange('source', source)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  filters.source === source 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        </div>

        {/* ISBN Filter */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">ISBN Search</h4>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="e.g. 978-3-16..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-slate-900 font-medium"
              value={filters.isbn || ''}
              onChange={(e) => onFilterChange('isbn', e.target.value)}
            />
          </div>
        </div>

        {/* Faculty Filter */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
             Faculty
          </h4>
          <div className="flex flex-wrap gap-2">
            {FACULTIES.map(faculty => (
              <button
                key={faculty}
                onClick={() => onFilterChange('faculty', faculty)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                  filters.faculty === faculty 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {faculty}
              </button>
            ))}
          </div>
        </div>

        {/* Access Type Filter */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
             Access Type
          </h4>
          <div className="flex flex-wrap gap-2">
            {ACCESS_TYPES.map(type => (
              <button
                key={type}
                onClick={() => onFilterChange('access', type)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                  filters.access === type 
                    ? 'bg-amber-500 border-amber-500 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Education 5.0 Pillars Filter */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
             Education 5.0 Pillars
          </h4>
          <div className="flex flex-wrap gap-2">
            {PILLARS.map(pillar => (
              <button
                key={pillar}
                onClick={() => onFilterChange('pillar', pillar)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                  filters.pillar === pillar 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {pillar}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Filter */}
        {subjects.length > 0 && (
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
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${isSelected ? 'bg-teal-500 border-teal-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    {subjectName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Format Filter */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Resource Format</h4>
          <div className="grid grid-cols-2 gap-2">
            {FORMATS.map(fmt => (
              <button
                key={fmt.id}
                onClick={() => onFilterChange('format', fmt.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-2 ${filters.format === fmt.id ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <fmt.icon size={20} className={filters.format === fmt.id ? 'text-white' : 'text-slate-400'} />
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-900"
              value={filters.yearFrom || ''}
              onChange={(e) => onFilterChange('yearFrom', e.target.value)}
            />
            <span className="text-slate-400">—</span>
            <input 
              type="number" 
              placeholder="To" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-900"
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
              <label key={item.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors bg-white">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                </div>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                  checked={filters[item.id] || false}
                  onChange={(e) => onFilterChange(item.id, e.target.checked)}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Digitization Promo */}
        <div className="p-6 rounded-3xl bg-slate-50 text-slate-900 space-y-3 relative overflow-hidden border border-slate-200">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 blur-2xl rounded-full -mr-10 -mt-10" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Can't find a book?</p>
          <h5 className="font-serif font-black text-lg leading-tight">Request Digitization</h5>
          <button 
            onClick={onRequestDigitization}
            className="mt-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <ScanLine size={16} /> Submit Request
          </button>
        </div>

      </div>
    </div>
  );
}
