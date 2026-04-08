import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Database, 
  Loader2, 
  ExternalLink, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  ChevronRight,
  Settings as SettingsIcon,
  X,
  BookOpen,
  Info,
  Send
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DSpaceItem {
  uuid: string;
  name: string;
  handle: string;
  metadata: Record<string, Array<{ value: string; language: string | null }>>;
  _links: {
    self: { href: string };
    bundles: { href: string };
  };
}

interface SearchResult {
  _embedded: {
    indexableObject: DSpaceItem;
  };
}

interface DSpaceBundle {
  uuid: string;
  name: string;
  _embedded?: {
    bitstreams?: Array<{
      uuid: string;
      name: string;
      sizeBytes: number;
      format?: { description: string };
      _links: { content: { href: string } };
    }>;
  };
}

export default function DSpaceExplorer() {
  // Configuration
  const [config, setConfig] = useState({
    apiUrl: localStorage.getItem('dspace_api_url') || 'https://demo.dspace.org/server/api',
  });
  const [showConfig, setShowConfig] = useState(false);

  // Search State
  const [query, setQuery] = useState('');
  const [type, setType] = useState('item');
  const [results, setResults] = useState<DSpaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail State
  const [selectedItem, setSelectedItem] = useState<DSpaceItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [bundles, setBundles] = useState<DSpaceBundle[]>([]);

  useEffect(() => {
    const storedUrl = localStorage.getItem('dspace_api_url');
    if (storedUrl === 'https://your-dspace-repo.edu/server/api') {
      localStorage.removeItem('dspace_api_url');
      setConfig({ apiUrl: 'https://demo.dspace.org/server/api' });
    } else {
      localStorage.setItem('dspace_api_url', config.apiUrl);
    }
  }, [config.apiUrl]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);
    setSelectedItem(null);

    try {
      const targetUrl = new URL(`${config.apiUrl}/discover/search/objects`);
      targetUrl.searchParams.append('query', query);
      targetUrl.searchParams.append('dsoType', type);
      targetUrl.searchParams.append('size', '20');

      const { data, error: proxyError } = await supabase.functions.invoke('external-proxy', {
        body: { 
          url: targetUrl.toString(),
          method: 'GET'
        }
      });
      
      if (proxyError) throw proxyError;
      
      const searchObjects = data._embedded?.searchObjects || [];
      const items = searchObjects.map((obj: SearchResult) => obj._embedded.indexableObject);
      
      setResults(items);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during search';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItemDetails = async (item: DSpaceItem) => {
    setSelectedItem(item);
    setIsDetailLoading(true);
    setBundles([]);

    try {
      // Fetch Bundles (for files) via Proxy
      const { data: bundlesData, error: proxyError } = await supabase.functions.invoke('external-proxy', {
        body: { 
          url: item._links.bundles.href,
          method: 'GET'
        }
      });
      
      if (!proxyError && bundlesData) {
        setBundles(bundlesData._embedded?.bundles || []);
      } else if (proxyError) {
        console.error('Failed to fetch bundles:', proxyError);
      }
    } catch (err) {
      console.error('Error fetching bundles:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const getMetadataValue = (item: DSpaceItem, field: string) => {
    return item.metadata?.[field]?.[0]?.value || 'N/A';
  };

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Database className="text-amber w-8 h-8" />
              <h1 className="text-3xl font-display font-bold text-soil">DSpace Repository Explorer</h1>
            </div>
            <p className="text-clay max-w-2xl">
              Search and browse academic repositories powered by DSpace 7. Access local research, theses, and journals.
            </p>
          </motion.div>

          <div className="flex items-center gap-2">
            <Link
              to="/dspace"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-soil hover:border-amber transition-all"
            >
              <Send size={18} />
              <span>Submit to Repository</span>
            </Link>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                showConfig ? 'bg-soil text-white border-soil' : 'bg-white text-soil border-border hover:border-amber'
              }`}
            >
              <SettingsIcon size={18} />
              <span>Repository Config</span>
            </button>
          </div>
        </div>

        {/* Config Panel */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white p-6 rounded-2xl border border-amber/20 shadow-sm">
                <div className="max-w-md space-y-1">
                  <label className="text-xs font-bold text-clay uppercase">DSpace API Base URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.apiUrl}
                      onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                      className="flex-1 p-2 text-sm border border-border rounded-lg focus:border-amber outline-none"
                      placeholder="https://your-dspace-repo.edu/server/api"
                    />
                    <button 
                      onClick={() => setShowConfig(false)}
                      className="px-4 py-2 bg-bg-base text-soil rounded-lg text-sm font-bold hover:bg-border/30"
                    >
                      Save
                    </button>
                  </div>
                  <p className="text-[10px] text-clay mt-1">
                    Example: https://demo.dspace.org/server/api
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 mb-8"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-clay" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for research papers, authors, keywords..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-amber/20 focus:border-amber outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="px-4 py-3 rounded-xl border border-border bg-white text-soil outline-none focus:border-amber"
              >
                <option value="item">Items</option>
                <option value="collection">Collections</option>
                <option value="community">Communities</option>
              </select>
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-8 py-3 bg-soil text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-soil/90 disabled:opacity-50 transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Results List */}
          <div className="lg:col-span-2 space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 flex items-center gap-3">
                <X size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-clay">
                <Loader2 size={48} className="animate-spin mb-4 text-amber" />
                <p>Searching repository...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-clay font-medium px-2">{results.length} results found</p>
                {results.map((item) => (
                  <motion.div
                    key={item.uuid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => fetchItemDetails(item)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                      selectedItem?.uuid === item.uuid 
                        ? 'border-amber bg-amber/5 shadow-md' 
                        : 'border-border bg-white hover:border-amber hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-soil group-hover:text-amber transition-colors leading-tight mb-2">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-clay">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {getMetadataValue(item, 'dc.contributor.author')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {getMetadataValue(item, 'dc.date.issued')}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={14} />
                            {getMetadataValue(item, 'dc.type')}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} className={`text-border group-hover:text-amber transition-all ${selectedItem?.uuid === item.uuid ? 'rotate-90' : ''}`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : !isLoading && query ? (
              <div className="flex flex-col items-center justify-center py-20 text-clay text-center">
                <Database size={48} className="text-border mb-4" />
                <p className="font-bold text-soil">No results found</p>
                <p className="text-sm">Try adjusting your search terms or repository configuration.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-clay text-center border-2 border-dashed border-border/50 rounded-3xl">
                <BookOpen size={48} className="text-border mb-4" />
                <p className="font-bold text-soil">Start Exploring</p>
                <p className="text-sm max-w-xs">Enter a query above to search the DSpace academic repository.</p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedItem ? (
                <motion.div
                  key={selectedItem.uuid}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl border border-border/50 shadow-lg overflow-hidden sticky top-24"
                >
                  <div className="p-6 bg-soil text-white">
                    <h2 className="text-xl font-display font-bold leading-tight mb-4">
                      {selectedItem.name}
                    </h2>
                    <div className="flex items-center gap-2 text-xs opacity-80">
                      <span className="px-2 py-1 bg-white/20 rounded">UUID: {selectedItem.uuid.substring(0, 8)}...</span>
                      <a 
                        href={`https://hdl.handle.net/${selectedItem.handle}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink size={12} />
                        View Handle
                      </a>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Abstract */}
                    <div>
                      <h4 className="text-xs font-bold text-clay uppercase mb-2 flex items-center gap-2">
                        <Info size={14} />
                        Abstract / Description
                      </h4>
                      <p className="text-sm text-soil leading-relaxed line-clamp-6">
                        {getMetadataValue(selectedItem, 'dc.description.abstract')}
                      </p>
                    </div>

                    {/* Files */}
                    <div>
                      <h4 className="text-xs font-bold text-clay uppercase mb-3 flex items-center gap-2">
                        <Download size={14} />
                        Files & Bitstreams
                      </h4>
                      {isDetailLoading ? (
                        <div className="flex items-center gap-2 text-sm text-clay">
                          <Loader2 size={16} className="animate-spin" />
                          Loading files...
                        </div>
                      ) : bundles.length > 0 ? (
                        <div className="space-y-2">
                          {bundles.map((bundle) => (
                            <div key={bundle.uuid}>
                              {bundle._embedded?.bitstreams?.map((file) => (
                                <a
                                  key={file.uuid}
                                  href={file._links.content.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-3 bg-bg-base rounded-xl hover:bg-border/20 transition-colors group"
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText size={20} className="text-amber shrink-0" />
                                    <div className="overflow-hidden">
                                      <p className="text-sm font-bold text-soil truncate">{file.name}</p>
                                      <p className="text-[10px] text-clay">{(file.sizeBytes / 1024 / 1024).toFixed(2)} MB • {file.format?.description || 'File'}</p>
                                    </div>
                                  </div>
                                  <Download size={16} className="text-clay group-hover:text-amber transition-colors" />
                                </a>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-clay italic">No files available for this item.</p>
                      )}
                    </div>

                    {/* Full Metadata Link */}
                    <div className="pt-4 border-top border-border/30">
                      <button className="w-full py-3 bg-bg-base text-soil rounded-xl text-sm font-bold hover:bg-border/30 transition-all flex items-center justify-center gap-2">
                        <FileText size={16} />
                        View Full Metadata
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="hidden lg:flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-border/30 rounded-3xl text-clay text-center p-8">
                  <Info size={48} className="text-border mb-4" />
                  <p className="font-bold text-soil">Item Details</p>
                  <p className="text-sm">Select an item from the search results to view its full metadata and download files.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
