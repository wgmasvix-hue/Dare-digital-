import { useLocation, Link } from "react-router-dom";
import { BookOpen, Globe, Building2, Sparkles, ArrowLeft, Search } from "lucide-react";
import { Book, ResearchItem } from "../types";
import BookCard from "../components/library/BookCard";

export default function SearchResults() {
  const { state } = useLocation();
  const results = state?.results;
  const query = state?.query;

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
              <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tight">
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

        {!hasResults ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Search size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No results found</h2>
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
                  <h2 className="text-3xl font-black text-text-main tracking-tight">Books & Research</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {results.books.map((book: Book) => (
                    <div key={book.id} className="relative group">
                      <BookCard publication={book} />
                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 py-2.5 bg-amber/10 text-amber rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber/20 transition-all flex items-center justify-center gap-2 border border-amber/20">
                          <Sparkles size={14} /> Ask DARE AI
                        </button>
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
                  <h2 className="text-2xl font-bold text-gray-900">🎓 Research & Archives (DSpace)</h2>
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
                        <Link to={`/research/${item.id}`} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors text-center">
                          View
                        </Link>
                        <button className="flex-1 py-2 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-purple-100 transition-colors flex items-center justify-center gap-1">
                          <Sparkles size={12} /> Ask AI
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* OER Section */}
            {results.oer.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Globe size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">🌍 Open Resources</h2>
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
                        <button className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors">
                          View
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

            {/* Institutional Section */}
            {results.institutional.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">🏛️ Institutional Content</h2>
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
                  <h2 className="text-3xl font-black text-text-main tracking-tight">Global Open Resources</h2>
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
