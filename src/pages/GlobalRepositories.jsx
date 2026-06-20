import { useState, useMemo } from 'react';
import { Globe, Search, ExternalLink, Database, BookOpen, Filter, ChevronDown } from 'lucide-react';
import { INTERNATIONAL_REPOSITORIES, REGIONS, REPO_TYPES } from '../data/internationalRepositories';

export default function GlobalRepositories() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All');
  const [type, setType] = useState('All');
  const [oaOnly, setOaOnly] = useState(false);

  const filtered = useMemo(() => {
    return INTERNATIONAL_REPOSITORIES.filter(r => {
      if (oaOnly && !r.openAccess) return false;
      if (region !== 'All' && r.region !== region) return false;
      if (type !== 'All' && r.type !== type) return false;
      if (query) {
        const q = query.toLowerCase();
        return r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.subjects.some(s => s.toLowerCase().includes(q));
      }
      return true;
    });
  }, [query, region, type, oaOnly]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-teal-50 rounded-2xl border border-teal-100">
              <Globe size={24} className="text-teal-600" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Global Access
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">International Repositories</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Discover and search across world-class academic repositories, preprint servers, and open access databases from institutions worldwide.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-8 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search repositories, subjects, countries..."
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
            />
          </div>

          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-none cursor-pointer"
          >
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>

          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-none cursor-pointer"
          >
            {REPO_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={oaOnly}
              onChange={e => setOaOnly(e.target.checked)}
              className="w-4 h-4 accent-teal-600 rounded"
            />
            <span className="text-sm font-medium text-slate-700">Open Access Only</span>
          </label>

          <span className="text-xs font-bold text-slate-400 ml-auto">
            {filtered.length} repositories
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(repo => (
            <div key={repo.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {repo.type}
                    </span>
                    {repo.openAccess && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Open Access
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-slate-900 text-base leading-snug">{repo.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{repo.country} · {repo.region}</p>
                </div>
                <div className="p-2 bg-teal-50 rounded-xl shrink-0">
                  <Database size={16} className="text-teal-600" />
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed flex-1">{repo.description}</p>

              {repo.recordCount && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <BookOpen size={12} />
                  {repo.recordCount} records
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {repo.subjects.slice(0, 4).map(s => (
                  <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                    {s}
                  </span>
                ))}
              </div>

              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors mt-auto"
              >
                <ExternalLink size={14} /> Visit Repository
              </a>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Globe size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">No repositories match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
