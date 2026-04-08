import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  FileText, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Upload, 
  Settings as SettingsIcon,
  ChevronRight,
  FileUp,
  X,
  Copy,
  Search
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { supabase } from '../lib/supabase';

interface ExtractedMetadata {
  title: string;
  authors: string[];
  date: string;
  abstract: string;
}

interface DSpaceMetadata {
  metadata: {
    "dc.title": { value: string; language: string | null }[];
    "dc.date.issued": { value: string; language: string | null }[];
    "dc.description.abstract": { value: string; language: string | null }[];
    "dc.contributor.author": { value: string; language: string | null }[];
  };
}

interface WorkflowStatus {
  step: 'idle' | 'extracting' | 'creating' | 'uploading' | 'success' | 'error';
  message: string;
}

export default function DSpaceIntegration() {
  // Configuration State
  const [config, setConfig] = useState({
    apiUrl: localStorage.getItem('dspace_api_url') || 'https://demo.dspace.org/server/api',
    user: 'dspacedemo+admin@gmail.com',
    password: 'admin',
    collectionUuid: '1c11f3f1-ba1f-4f36-908a-3f1992a5581c' // Demo collection
  });

  // Sync API URL to localStorage and handle migrations
  React.useEffect(() => {
    const storedUrl = localStorage.getItem('dspace_api_url');
    if (storedUrl === 'https://your-dspace-repo.edu/server/api') {
      localStorage.removeItem('dspace_api_url');
      setConfig(prev => ({ ...prev, apiUrl: 'https://demo.dspace.org/server/api' }));
    } else {
      localStorage.setItem('dspace_api_url', config.apiUrl);
    }
  }, [config.apiUrl]);
  const [showConfig, setShowConfig] = useState(false);

  // Input State
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow State
  const [status, setStatus] = useState<WorkflowStatus>({ step: 'idle', message: '' });
  const [extractedData, setExtractedData] = useState<ExtractedMetadata | null>(null);
  const [formattedJson, setFormattedJson] = useState<DSpaceMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [itemUuid, setItemUuid] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFullWorkflow = async () => {
    if (!rawText.trim()) return;
    
    setError(null);
    setItemUuid(null);
    
    try {
      // Step 1: AI Metadata Extraction
      setStatus({ step: 'extracting', message: 'Gemini is analyzing your text...' });
      const data = await geminiService.extractMetadata(rawText);
      setExtractedData(data);
      
      const dspaceMetadata: DSpaceMetadata = {
        "metadata": {
          "dc.title": [{ "value": data.title || "", "language": "en" }],
          "dc.date.issued": [{ "value": data.date || "", "language": null }],
          "dc.description.abstract": [{ "value": data.abstract || "", "language": "en" }],
          "dc.contributor.author": (data.authors || []).map((author: string) => ({
            "value": author,
            "language": null
          }))
        }
      };
      setFormattedJson(dspaceMetadata);

      // Step 2: Login & Create Item
      setStatus({ step: 'creating', message: 'Authenticating and creating workspace item...' });
      
      // A. Login via Proxy
      const { data: loginProxyResponse, error: loginError } = await supabase.functions.invoke('external-proxy', {
        body: {
          url: `${config.apiUrl}/authn/login`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            user: config.user,
            password: config.password
          }
        }
      });

      if (loginError || loginProxyResponse.status !== 200) {
        throw new Error(`DSpace Authentication Failed: ${loginProxyResponse?.data?.message || loginError?.message || 'Unknown error'}`);
      }
      
      const token = loginProxyResponse.headers['authorization'];
      if (!token) throw new Error('No Authorization token received from DSpace');

      // B. Create Workspace Item via Proxy
      const { data: createProxyResponse, error: createError } = await supabase.functions.invoke('external-proxy', {
        body: {
          url: `${config.apiUrl}/submission/workspaceitems?owningCollection=${config.collectionUuid}`,
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: dspaceMetadata
        }
      });

      if (createError || createProxyResponse.status >= 400) {
        throw new Error(`Failed to create DSpace item: ${createProxyResponse?.data?.message || createError?.message || 'Unknown error'}`);
      }
      
      const itemData = createProxyResponse.data;
      const newItemUuid = itemData._embedded?.item?.uuid;
      if (!newItemUuid) throw new Error('Could not retrieve UUID for new item');
      setItemUuid(newItemUuid);

      // Step 3: Upload PDF (if selected)
      if (selectedFile) {
        setStatus({ step: 'uploading', message: `Uploading ${selectedFile.name}...` });
        
        const { data: bundlesProxyResponse, error: bundlesError } = await supabase.functions.invoke('external-proxy', {
          body: {
            url: `${config.apiUrl}/core/items/${newItemUuid}/bundles`,
            method: 'GET',
            headers: { 'Authorization': token }
          }
        });
        
        if (bundlesError || bundlesProxyResponse.status !== 200) {
          throw new Error(`Failed to fetch bundles: ${bundlesProxyResponse?.data?.message || bundlesError?.message || 'Unknown error'}`);
        }
        
        const bundlesData = bundlesProxyResponse.data;
        const bundles = (bundlesData._embedded?.bundles || []) as Array<{ 
          name: string; 
          _links: { bitstreams: { href: string } } 
        }>;
        const originalBundle = bundles.find((b) => b.name === 'ORIGINAL');
        
        if (!originalBundle) throw new Error('Could not find ORIGINAL bundle in DSpace item');
        const bitstreamUrl = originalBundle._links.bitstreams.href;

        // Upload File via Proxy
        // For file uploads, we'll convert to base64 and send to a modified proxy
        const reader = new FileReader();
        const fileBase64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:application/pdf;base64,
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        const fileBase64 = await fileBase64Promise;

        const { data: uploadProxyResponse, error: uploadError } = await supabase.functions.invoke('external-proxy', {
          body: { 
            url: bitstreamUrl,
            method: 'POST',
            headers: { 
              'Authorization': token,
              'Content-Type': selectedFile.type
            },
            base64Body: fileBase64,
            isRawBody: true // Flag for our proxy to send raw body
          }
        });

        if (uploadError || uploadProxyResponse.status >= 400) {
          throw new Error(`PDF Upload Failed: ${uploadProxyResponse?.data?.message || uploadError?.message || 'Unknown error'}`);
        }
      }

      setStatus({ step: 'success', message: 'Workflow completed successfully!' });
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Workflow failed. Please check your configuration and input.";
      setError(errorMessage);
      setStatus({ step: 'error', message: 'Workflow failed' });
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{count: number, message: string} | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    setError(null);
    try {
      // Derive OAI URL from API URL if possible
      const oaiUrl = config.apiUrl.replace('/api', '/oai');
      
      const { data, error } = await supabase.functions.invoke('repository-sync', {
        body: { oaiUrl }
      });
      
      if (data?.success) {
        setSyncResult({ count: data.synced_count, message: data.message });
      } else {
        throw new Error(error?.message || data?.error || 'Sync failed');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopy = () => {
    if (formattedJson) {
      navigator.clipboard.writeText(JSON.stringify(formattedJson, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Database className="text-amber w-8 h-8" />
              <h1 className="text-3xl font-display font-bold text-soil">DSpace Repository Integration</h1>
            </div>
            <p className="text-clay max-w-2xl">
              AI-powered metadata extraction and automated repository submission for DSpace 7.
            </p>
          </motion.div>

          <div className="flex items-center gap-2">
            <Link
              to="/dspace-explorer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-soil hover:border-amber transition-all"
            >
              <Search size={18} />
              <span>Explore Repository</span>
            </Link>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                isSyncing ? 'bg-bg-base text-clay border-border' : 'bg-white text-soil border-border hover:border-amber'
              }`}
            >
              {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
              <span>Sync to Library</span>
            </button>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                showConfig ? 'bg-soil text-white border-soil' : 'bg-white text-soil border-border hover:border-amber'
              }`}
            >
              <SettingsIcon size={18} />
              <span>API Configuration</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white p-6 rounded-2xl border border-amber/20 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-clay uppercase">DSpace API URL</label>
                  <input
                    type="text"
                    value={config.apiUrl}
                    onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                    className="w-full p-2 text-sm border border-border rounded-lg focus:border-amber outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-clay uppercase">User Email</label>
                  <input
                    type="email"
                    value={config.user}
                    onChange={(e) => setConfig({ ...config, user: e.target.value })}
                    className="w-full p-2 text-sm border border-border rounded-lg focus:border-amber outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-clay uppercase">Password</label>
                  <input
                    type="password"
                    value={config.password}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    className="w-full p-2 text-sm border border-border rounded-lg focus:border-amber outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-clay uppercase">Collection UUID</label>
                  <input
                    type="text"
                    value={config.collectionUuid}
                    onChange={(e) => setConfig({ ...config, collectionUuid: e.target.value })}
                    className="w-full p-2 text-sm border border-border rounded-lg focus:border-amber outline-none"
                    placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Input */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-border/50"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold text-soil flex items-center gap-2">
                  <FileText size={18} />
                  Submission Details
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-soil mb-2">Raw Academic Text</label>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste title, authors, abstract, or full text here..."
                    className="w-full h-48 p-4 rounded-xl border border-border focus:ring-2 focus:ring-amber/20 focus:border-amber outline-none transition-all resize-none font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-soil mb-2">Upload Research PDF (Optional)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      selectedFile ? 'border-amber bg-amber/5' : 'border-border hover:border-amber hover:bg-bg-base'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf"
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber/20 rounded-lg text-amber">
                          <FileUp size={24} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-soil">{selectedFile.name}</p>
                          <p className="text-xs text-clay">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="p-1 hover:bg-red-100 rounded-full text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="text-border mb-2" />
                        <p className="text-sm text-clay">Click to select or drag and drop PDF</p>
                        <p className="text-xs text-clay/60 mt-1">Maximum file size: 50MB</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleFullWorkflow}
                  disabled={status.step !== 'idle' && status.step !== 'success' && status.step !== 'error' || !rawText.trim()}
                  className="w-full py-4 bg-soil text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-soil/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-soil/20"
                >
                  {status.step === 'idle' || status.step === 'success' || status.step === 'error' ? (
                    <>
                      <Send size={20} />
                      Start Submission Workflow
                    </>
                  ) : (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {status.message}
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700"
              >
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Workflow Interrupted</p>
                  <p className="text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {syncResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 text-amber-900"
              >
                <Database size={20} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Sync Completed</p>
                  <p className="text-sm">{syncResult.message}</p>
                </div>
              </motion.div>
            )}

            {status.step === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4 text-green-800"
              >
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Submission Successful!</h3>
                  <p className="text-sm opacity-90">Item has been created and bitstream uploaded to DSpace.</p>
                  {itemUuid && (
                    <p className="text-xs mt-1 font-mono bg-green-100/50 p-1 rounded">UUID: {itemUuid}</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Status & Preview */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-border/50"
            >
              <h2 className="text-lg font-display font-bold text-soil mb-4">Workflow Progress</h2>
              <div className="space-y-4">
                {[
                  { id: 'extracting', label: 'AI Metadata Extraction' },
                  { id: 'creating', label: 'DSpace Item Creation' },
                  { id: 'uploading', label: 'Bitstream (PDF) Upload' }
                ].map((step, idx) => {
                  const isCompleted = 
                    (status.step === 'creating' && idx < 1) || 
                    (status.step === 'uploading' && idx < 2) || 
                    (status.step === 'success');
                  const isActive = status.step === step.id;
                  
                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted ? 'bg-green-500 text-white' : 
                        isActive ? 'bg-amber text-white animate-pulse' : 'bg-bg-base text-clay'
                      }`}>
                        {isCompleted ? <CheckCircle size={16} /> : idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${isActive ? 'text-soil' : 'text-clay'}`}>{step.label}</p>
                        {isActive && <p className="text-xs text-amber animate-pulse">{status.message}</p>}
                      </div>
                      {isCompleted && <ChevronRight size={16} className="text-green-500" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {extractedData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-border/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-soil uppercase tracking-wider">Metadata Preview</h3>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-amber font-bold hover:underline"
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle size={12} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-clay text-xs font-bold uppercase">Title</span>
                    <p className="text-soil font-medium leading-tight">{extractedData.title}</p>
                  </div>
                  <div>
                    <span className="text-clay text-xs font-bold uppercase">Authors</span>
                    <p className="text-soil">{extractedData.authors.join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-clay text-xs font-bold uppercase">Date</span>
                    <p className="text-soil">{extractedData.date}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
