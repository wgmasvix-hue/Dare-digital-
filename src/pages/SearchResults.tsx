import { useLocation, Link } from "react-router-dom";
import { BookOpen, Globe, Building2, Sparkles, ArrowLeft, Search, Cpu, TrendingUp, Zap } from "lucide-react";
import { Book, ResearchItem } from "../types";
import BookCard from "../components/library/BookCard";
import { VECTOR_MODEL_LABEL } from "../services/jinaEmbeddingService";

export default function SearchResults() {
  const { state } = useLocation();
  const results = state?.results;
  const query = state?.query;

  const vectorMeta = results?._vector as {
    available: boolean;
    count: number;
    topMatches: Array<{ id: string; title: string; author_names: string; similarity: number }>;
  } | undefined;

  const hasResults = results && (
    (results.books && results.books.length > 0) ||
    (results.federated && results.federated.length > 0) ||
    (results.oer && results.oer.length > 0) ||
    (results.institutional && results.institutional.length > 0) ||
    (results.research && results.research.length > 0) ||
    (results.external && results.external.length > 0)
  );

  return (
    <div className="min-h-screen bg-bg-base pb-20 pt-8">
      {/* Search Context Header */}
      <div className="relative overflow-hidden bg-primary py-20 mb-12">
        {/* Real Book Background Image */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000"
            alt="Search Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 text-accent font-bold text-sm uppercase tracking-widest mb-4">
                <Search size={16} />
                <span>Search Results</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight heading-light">
                Results for <span className="text-accent italic">"{query}"</span>
              </h1>
            </div>
            <Link to="/library" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2 w-fit shadow-premium">
              <ArrowLeft size={18} /> New Search
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6">

        {/* ── Semantic Search Status Banner ── */}
        {vectorMeta && (
          <div className={`mb-10 p-4 rounded-2xl flex items-center gap-4 border ${
            vectorMeta.available && vectorMeta.count > 0
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              vectorMeta.available && vectorMeta.count > 0
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <Cpu size={20} />
            </div>
            <div className="flex-1 min-w-0">
              {vectorMeta.available && vectorMeta.count > 0 ? (
                <>
                  <p className="text-sm font-bold text-emerald-800">
                    Semantic search active — {vectorMeta.count} vector matches merged into results
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Powered by {VECTOR_MODEL_LABEL} · Results ranked by Reciprocal Rank Fusion
                  </p>
                </>
              ) : vectorMeta.available ? (
                <>
                  <p className="text-sm font-bold text-gray-700">No semantic matches found</p>
                  <p className="text-xs text-gray-500 mt-0.5">Showing keyword results only · {VECTOR_MODEL_LABEL}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-600">Keyword search only</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Add <code className="bg-gray-100 px-1 rounded text-xs">VITE_JINA_API_KEY</code> to enable semantic search
                  </p>
                </>
              )}
            </div>
            {vectorMeta.available && vectorMeta.count > 0 && (
              <div className="shrink-0 flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                <Zap size={12} /> AI Ranked
              </div>
            )}
          </div>
        )}

        {/* ── Top Semantic Matches ── */}
        {vectorMeta?.available && vectorMeta.topMatches && vectorMeta.topMatches.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white flex items-center justify-center shadow-sm">
                <TrendingUp size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-text-main tracking-tight heading-vivid">Top Semantic Matches</h2>
                <p className="text-sm text-gray-500 mt-0.5">Most conceptually similar to your query</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {vectorMeta.topMatches.map((match, i) => (
                <Link
                  key={match.id}
                  to={`/book-action/${match.id}?action=edu5`}
                  state={{ book: match }}
                  className="group flex items-start gap-4 p-4 bg-white rounded-2xl border border-violet-100 hover:border-violet-300 hover:shadow-lg transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 flex items-center justify-center shrink-0 font-black text-sm">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-violet-700 transition-colors">
                      {match.title}
                    </p>
                    {match.author_names && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{match.author_names}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block text-xs font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg">
                      {Math.round(match.similarity * 100)}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!hasResults ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Search size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 heading-vivid">No results found</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">We couldn't find anything matching your search. Try different keywords or browse our categories.</p>
            <Link to="/library" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
              Browse Library
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Books Section */}
            {results.books && results.books.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-sm">
                    <BookOpen size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-text-main tracking-tight heading-vivid">Books & Research</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {results.books.map((book: Book) => (
                    <div key={book.id} className="relative group">
                      <BookCard publication={book} />
                      <div className="mt-4 flex gap-2">
                        <Link to={`/book-action/${book.id}?action=edu5`} state={{ book }} className="flex-1 py-2.5 bg-amber/10 text-amber rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber/20 transition-all flex items-center justify-center gap-2 border border-amber/20">
                          <Sparkles size={14} /> Ask BAKO AI
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Research Section */}
            {results.research && results.research.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 heading-vivid">Research & Archives (DSpace)</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {results.research.map((item: ResearchItem) => (
                    <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                        <BookOpen size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-amber-600 font-bold mb-2">{item.author_names || item.creator}</p>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-3">{item.abstract || item.description}</p>
                      <div className="mt-auto flex gap-2">
                        <Link to={`/research/${item.id}`} state={{ item }} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors text-center">
                          View
                        </Link>
                        <Link to={`/book-action/${item.id}?action=edu5`} state={{ book: item }} className="flex-1 py-2 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-purple-100 transition-colors flex items-center justify-center gap-1">
                          <Sparkles size={12} /> Ask AI
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* OER Section */}
            {results.oer && results.oer.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Globe size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 heading-vivid">Open Resources</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {results.oer.map((res: Book) => (
                    <div key={res.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                        <Globe size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{res.title}</h3>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-3">{res.description}</p>
                      <div className="mt-auto flex gap-2">
                        <Link to={`/book-action/${res.id}`} state={{ book: res }} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors text-center">
                          View
                        </Link>
                        <Link to={`/book-action/${res.id}?action=edu5`} state={{ book: res }} className="flex-1 py-2 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-purple-100 transition-colors flex items-center justify-center gap-1">
                          <Sparkles size={12} /> Ask AI
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Institutional Section */}
            {results.institutional && results.institutional.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 heading-vivid">Institutional Content</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {results.institutional.map((item: Book) => (
                    <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                        <Building2 size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-3">{item.description}</p>
                      <div className="mt-auto flex gap-2">
                        <button className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors">
                          Access
                        </button>
                        <button className="flex-1 py-2 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-purple-100 transition-colors flex items-center justify-center gap-1">
                          <Sparkles size={12} /> Ask AI
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* External Section */}
            {results.external && results.external.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                    <Globe size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-text-main tracking-tight heading-vivid">Global Open Resources</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {results.external.map((book: Book) => (
                    <div key={book.id} className="relative group">
                      <BookCard publication={book} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
