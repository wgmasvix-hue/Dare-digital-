import { useState, useRef, useEffect } from 'react';
import { Quote, Copy, Download, Check, ChevronDown } from 'lucide-react';
import { getCitation, downloadCitation } from '../../utils/citationExport';

const FORMATS = ['APA', 'MLA', 'Chicago', 'BibTeX', 'RIS'];

export default function CitationMenu({ item, className = '' }) {
  const [open, setOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState('APA');
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const citation = getCitation(item, activeFormat);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (activeFormat === 'BibTeX' || activeFormat === 'RIS') {
      downloadCitation(item, activeFormat);
    } else {
      const blob = new Blob([citation], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `citation_${activeFormat}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold transition-all"
      >
        <Quote size={13} /> Cite <ChevronDown size={11} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Export Citation</span>
            <div className="flex gap-1">
              {FORMATS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFormat(f)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                    activeFormat === f ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed font-mono min-h-[60px] whitespace-pre-wrap break-words select-all">
              {citation}
            </div>
          </div>

          <div className="flex gap-2 px-4 pb-4">
            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-700'
              }`}
            >
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              <Download size={13} /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
