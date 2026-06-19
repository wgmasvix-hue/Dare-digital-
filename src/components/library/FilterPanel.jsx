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
  Sparkles,
  GraduationCap,
  Building2
} from 'lucide-react';
import { ZIMBABWE_INSTITUTIONS } from '../../data/zimbabweInstitutions';

const LEVELS = ['All', 'Certificate', 'Diploma', 'HND', 'Degree'];
const PILLARS = ['All', 'Teaching', 'Research', 'Community Engagement', 'Innovation', 'Industrialisation'];
const ACCESS_TYPES = ['All', 'Dare Access', 'Licensed', 'Purchased'];
const FACULTIES = ['All', 'STEM', 'Agriculture & Environmental', 'Health Sciences', 'Business & Law', 'Education (Heritage-based)', 'Vocational', 'Polytechnic', 'Engineering', 'Humanities & Social Sciences', 'AI & Future Tech'];
const SOURCES = ['All', 'Featured Items', 'Dare Library', 'Partner Resources', 'Project Gutenberg', 'Open Library', 'arXiv Research'];
const FORMATS = [
  { id: 'All', label: 'All Formats', icon: LayoutGrid },
  { id: 'PDF', label: 'PDFs', icon: FileText },
  { id: 'Video', label: 'Video Lectures', icon: Video },
  { id: 'Audio', label: 'Audiobooks', icon: Headphones },
  { id: 'Interactive', label: 'Interactive', icon: MonitorPlay }
];

const INSTITUTION_TYPES = [
  'All Types',
  'Public University',
  'Private University',
  'Polytechnic',
  'Vocational Training Centre',
  'Specialized Training College',
];

const TYPE_COLORS = {
  'Public University': 'bg-blue-100 text-blue-800',
  'Private University': 'bg-purple-100 text-purple-800',
  'Polytechnic': 'bg-orange-100 text-orange-800',
  'Vocational Training Centre': 'bg-green-100 text-green-800',
  'Specialized Training College': 'bg-rose-100 text-rose-800',
};

export default function FilterPanel({
  filters,
  subjects = [],
  onFilterChange,
  onClearFilters,
  onRequestDigitization,
  className = '',
  isOpen: externalIsOpen,
  onToggle: externalOnToggle
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [institutionDropdownOpen, setInstitutionDropdownOpen] = useState(false);

  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  const toggleOpen = () => {
    if (isControlled) {
      externalOnToggle && externalOnToggle(!isOpen);
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

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
    const newSubjects = currentSubjects.includes(subjectName)
      ? currentSubjects.filter(s => s !== subjectName)
      : [...currentSubjects, subjectName];
    onFilterChange('subjects', newSubjects);
  };

  const filteredInstitutions = ZIMBABWE_INSTITUTIONS.filter(inst => {
    const matchesType = selectedType === 'All Types' || inst.type === selectedType;
    const matchesSearch = !institutionSearch ||
      inst.name.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      inst.location?.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      inst.focus.some(f => f.toLowerCase().includes(institutionSearch.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const selectedInstitution = filters.university !== 'All'
    ? ZIMBABWE_INSTITUTIONS.find(i => i.id === filters.university)
    : null;

  const handleSelectInstitution = (id) => {
    onFilterChange('university', id);
    setInstitutionDropdownOpen(false);
    setInstitutionSearch('');
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

        {/* ── Zimbabwean Institution Filter ─────────────────────────────── */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <GraduationCap size={13} /> Zimbabwean Institution
          </h4>

          {/* Type quick-filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {INSTITUTION_TYPES.map(type => (
              <button
                key={type}
                onClick={() => { setSelectedType(type); setInstitutionSearch(''); }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                  selectedType === type
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                }`}
              >
                {type === 'All Types' ? 'All' : type.replace('Vocational Training Centre', 'VTC').replace('Specialized Training College', 'Specialised')}
              </button>
            ))}
          </div>

          {/* Selected institution badge */}
          {selectedInstitution && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200">
              <Building2 size={14} className="text-teal-600 shrink-0" />
              <span className="text-xs font-bold text-teal-800 flex-1 truncate">{selectedInstitution.name}</span>
              <button onClick={() => handleSelectInstitution('All')} className="text-teal-500 hover:text-teal-700">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setInstitutionDropdownOpen(!institutionDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 transition-all"
            >
              <span className="truncate">
                {selectedInstitution ? selectedInstitution.name : 'Select institution…'}
              </span>
              {institutionDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {institutionDropdownOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                {/* Search inside dropdown */}
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search by name, city, focus…"
                      value={institutionSearch}
                      onChange={e => setInstitutionSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-400 font-medium text-slate-800"
                    />
                  </div>
                </div>

                {/* All option */}
                <button
                  onClick={() => handleSelectInstitution('All')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                    filters.university === 'All' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Institutions
                </button>

                {/* Institution list, grouped by type */}
                <div className="max-h-64 overflow-y-auto">
                  {INSTITUTION_TYPES.filter(t => t !== 'All Types').map(type => {
                    const group = filteredInstitutions.filter(i => i.type === type);
                    if (group.length === 0) return null;
                    return (
                      <div key={type}>
                        <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border-t border-slate-100">
                          {type}
                        </div>
                        {group.map(inst => (
                          <button
                            key={inst.id}
                            onClick={() => handleSelectInstitution(inst.id)}
                            className={`w-full text-left px-4 py-2.5 transition-colors border-b border-slate-50 last:border-0 ${
                              filters.university === inst.id
                                ? 'bg-teal-50 text-teal-800'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold truncate">{inst.name}</span>
                              {inst.location && (
                                <span className="text-[10px] text-slate-400 shrink-0">{inst.location}</span>
                              )}
                            </div>
                            {inst.focus.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {inst.focus.slice(0, 2).map(f => (
                                  <span key={f} className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${TYPE_COLORS[inst.type] || 'bg-slate-100 text-slate-600'}`}>
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                  {filteredInstitutions.length === 0 && (
                    <p className="px-4 py-6 text-xs text-slate-400 text-center">No institutions match your search.</p>
                  )}
                </div>
              </div>
            )}
          </div>
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
