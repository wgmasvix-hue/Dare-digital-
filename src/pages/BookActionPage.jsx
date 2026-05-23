import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, Sparkles, Brain, ArrowLeft, Loader2, Send, Download, MessageSquare, Edit3, Copy, Save, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { transformBook, BOOK_SELECT, OPENSTAX_CURATED } from '../lib/transformBook';
import { ALL_ADDITIONAL_OER } from '../lib/oerCatalog';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import Toast from '../components/ui/Toast';
import { useGamification } from '../context/GamificationContext';

const ALL_OER = [...OPENSTAX_CURATED, ...ALL_ADDITIONAL_OER];

export default function BookActionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const autoAction = searchParams.get('action');
  
  const locationBook = location.state?.book;
  const [book, setBook] = useState(locationBook);
  const [loadingBook, setLoadingBook] = useState(false);
  const [errorBook, setErrorBook] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [scanMessage, setScanMessage] = useState('');
  const [result, setResult] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableResult, setEditableResult] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [followUp, setFollowUp] = useState('');
  const [toast, setToast] = useState(null);
  const chatEndRef = useRef(null);
  const { gainXp } = useGamification();

  useEffect(() => {
    const fetchBookData = async () => {
      if (book || !id) return;
      try {
        setLoadingBook(true);
        setErrorBook(null);

        // 1. Check for Static/Mock Books (OpenStax, etc.)
        if (id.startsWith('openstax-') || id.startsWith('fao-') || id.startsWith('who-') || id.startsWith('andrews-') || id.startsWith('ai-') || id.startsWith('gutenberg-') || id.startsWith('ol-') || id.startsWith('olb-') || id.startsWith('arxiv-')) {
          const osBook = ALL_OER.find(b => b.id === id);
          if (osBook) {
            setBook({
              ...osBook,
              cover_path: osBook.cover_image_url,
              file_path: osBook.file_url,
              access_model: 'open_access',
              license_type: osBook.license_type || 'CC BY 4.0',
              source_url: `https://openstax.org`,
              table_of_contents: [],
              learning_objectives: []
            });
            setLoadingBook(false);
            return;
          } else if (id.startsWith('openstax-')) {
            const identifier = id.replace('openstax-', '');
            const targetUrl = `https://archive.org/metadata/${identifier}`;
            const { data: proxyResponse, error: proxyError } = await supabase.functions.invoke('external-proxy', {
              body: { url: targetUrl }
            });
            if (proxyError) throw proxyError;
            
            const data = proxyResponse.data;
            if (data.metadata) {
              const meta = data.metadata;
              const transformed = {
                id: `openstax-${identifier}`,
                title: meta.title,
                author_names: Array.isArray(meta.creator) ? meta.creator.join(', ') : meta.creator || 'OpenStax',
                description: meta.description || 'No description available.',
                cover_path: `https://archive.org/services/img/${identifier}`,
                file_url: `https://archive.org/download/${identifier}/${identifier}.pdf`,
                file_path: `https://archive.org/download/${identifier}/${identifier}.pdf`,
                language: meta.language || 'English',
                source: 'OpenStax',
                access_model: 'open_access',
                license_type: 'CC BY',
                table_of_contents: [],
                learning_objectives: []
              };
              setBook(transformed);
              setLoadingBook(false);
              return;
            }
          } else if (id.startsWith('gutenberg-')) {
            const gId = id.replace('gutenberg-', '');
            const targetUrl = `https://gutendex.com/books/?ids=${gId}`;
            const { data: proxyResponse, error: proxyError } = await supabase.functions.invoke('external-proxy', {
              body: { url: targetUrl }
            });
            if (proxyError) throw proxyError;

            const data = proxyResponse.data;
            if (data.results && data.results.length > 0) {
              const gBook = data.results[0];
              const transformed = {
                id: `gutenberg-${gBook.id}`,
                title: gBook.title,
                author_names: gBook.authors.map(a => a.name).join(', ') || 'Unknown Author',
                description: `Digitized by Project Gutenberg. Subjects: ${gBook.subjects.join(', ')}`,
                cover_path: gBook.formats['image/jpeg'] || 'https://picsum.photos/seed/book/400/600',
                file_url: gBook.formats['application/epub+zip'] || gBook.formats['text/html'] || gBook.formats['application/pdf'],
                file_path: gBook.formats['application/epub+zip'] || gBook.formats['text/html'] || gBook.formats['application/pdf'],
                language: gBook.languages[0] || 'English',
                source: 'Project Gutenberg',
                access_model: 'public_domain',
                license_type: 'Public Domain',
                table_of_contents: [],
                learning_objectives: []
              };
              setBook(transformed);
              setLoadingBook(false);
              return;
            }
          } else if (id.startsWith('ol-') || id.startsWith('olb-')) {
            const identifier = id.startsWith('ol-') ? id.replace('ol-', '/works/') : id.replace('olb-', '/books/');
            const targetUrl = `https://openlibrary.org${identifier}.json`;
            const { data: proxyResponse, error: proxyError } = await supabase.functions.invoke('external-proxy', {
              body: { url: targetUrl }
            });
            if (proxyError) throw proxyError;

            const data = proxyResponse.data;
            if (data) {
              const transformed = {
                id: id,
                title: data.title,
                author_names: 'Open Library Author',
                description: data.description?.value || data.description || 'No description available.',
                cover_path: data.covers ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg` : `https://picsum.photos/seed/${id}/400/600`,
                file_url: `https://openlibrary.org${identifier}`,
                file_path: `https://openlibrary.org${identifier}`,
                language: 'English',
                source: 'Open Library',
                access_model: 'open_access',
                license_type: 'Dare Access',
                table_of_contents: [],
                learning_objectives: []
              };
              setBook(transformed);
              setLoadingBook(false);
              return;
            }
          } else if (id.startsWith('arxiv-')) {
            const identifier = id.replace('arxiv-', '');
            const targetUrl = `https://export.arxiv.org/api/query?id_list=${identifier}`;
            const { data: proxyResponse, error: proxyError } = await supabase.functions.invoke('external-proxy', {
              body: { url: targetUrl }
            });
            if (proxyError) throw proxyError;

            const text = proxyResponse.data;
            const entryMatch = text.match(/<entry>([\s\S]*?)<\/entry>/);
            if (entryMatch) {
              const entry = entryMatch[1];
              const titleMatch = entry.match(/<title>(.*?)<\/title>/);
              const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/);
              const authorMatch = [...entry.matchAll(/<name>(.*?)<\/name>/g)];
              const pdfMatch = entry.match(/<link title="pdf" href="(.*?)"/);
              
              const transformed = {
                id: id,
                title: titleMatch ? titleMatch[1].replace(/\n/g, ' ').trim() : 'Unknown Title',
                author_names: authorMatch.map(m => m[1]).join(', ') || 'Unknown Author',
                description: summaryMatch ? summaryMatch[1].replace(/\n/g, ' ').trim() : 'No summary available.',
                cover_path: `https://picsum.photos/seed/${id}/400/600`,
                file_url: pdfMatch ? pdfMatch[1] : `https://arxiv.org/pdf/${identifier}.pdf`,
                file_path: pdfMatch ? pdfMatch[1] : `https://arxiv.org/pdf/${identifier}.pdf`,
                language: 'English',
                source: 'arXiv Research',
                access_model: 'open_access',
                license_type: 'Dare Access',
                table_of_contents: [],
                learning_objectives: []
              };
              setBook(transformed);
              setLoadingBook(false);
              return;
            }
          }
        }

        // 2. Fetch Publication from Supabase
        const { data: pubData, error: pubError } = await supabase
          .from('books')
          .select(BOOK_SELECT)
          .eq('id', id)
          .single();

        if (pubError) {
          if (id.startsWith('res-')) {
            const { data: resData, error: resError } = await supabase
              .from('local_research')
              .select('*')
              .eq('id', id)
              .single();
            
            if (!resError && resData) {
              const transformedRes = {
                ...resData,
                author_names: resData.author_names,
                publisher_name: resData.institution,
                year_published: resData.publication_date?.split('-')[0],
                faculty: resData.subject,
                access_model: 'dare_access',
                cover_path: null
              };
              setBook(transformedRes);
              setLoadingBook(false);
              return;
            }
          }
          throw pubError;
        }
        
        const decodedBook = transformBook(pubData);
        setBook(decodedBook);
      } catch (err) {
        console.error("Error loading book on Action Page:", err);
        setErrorBook("Unable to retrieve book metadata. Please return to the library.");
      } finally {
        setLoadingBook(false);
      }
    };

    fetchBookData();
  }, [id, book]);

  const runAiAction = async (actionName, prompt) => {
    if (!book) {
      setResult("Error: Book information not found.");
      return;
    }
    setLoadingAction(actionName);
    setResult(null);
    setEditableResult('');
    setIsEditing(false);
    setIsTyping(false);
    setChatHistory([]);

    const messages = [
      "Initializing DARA neural link...",
      "Extracting core concepts...",
      "Cross-referencing with Zimbabwe Heritage-Based Curriculum...",
      "Analyzing key themes...",
      "Synthesizing actionable insights...",
      "Formatting study materials..."
    ];
    
    let msgIndex = 0;
    setScanMessage(messages[0]);
    const msgInterval = setInterval(() => {
      msgIndex++;
      setScanMessage(messages[msgIndex % messages.length]);
    }, 1500);

    try {
      // Modify prompt for highly gamified output
      const addictivePrompt = `
        You are DARA, a highly advanced, engaging, and enthusiastic AI Tutor.
        Your task: ${prompt}
        
        Make your response incredibly engaging to read. Use structured markdown formatting, emojis, bold text for key insights, and an encouraging tone.
        Deliver the information in a way that feels rewarding and exciting for a student in Zimbabwe.
      `;

      const context = `Book Title: ${book.title}\nAuthor: ${book.author_names}\nDescription: ${book.description}`;
      const text = await geminiService.generateBookAction(context, addictivePrompt);
      
      clearInterval(msgInterval);
      setLoadingAction(null);
      setIsTyping(true);
      
      // Typewriter Effect
      let currentText = '';
      const speed = 10; // Fast typing
      const words = text.split(/(\s+)/); // Split by words/spaces to keep markdown relatively intact during render
      
      setResult('...');
      setEditableResult('');
      
      let delay = 0;
      for (let i = 0; i < words.length; i++) {
        setTimeout(() => {
          currentText += words[i];
          setResult(currentText);
          setEditableResult(currentText);
          if (i === words.length - 1) {
            setIsTyping(false);
            gainXp(parseInt(import.meta.env.VITE_XP_BOOK_ACTION || '50')); // add XP!
            setToast({ message: `DARA completed analysis! +50 XP`, type: "success" });
          }
        }, delay);
        delay += speed;
      }

    } catch (error) {
      clearInterval(msgInterval);
      setLoadingAction(null);
      console.error("Gemini Error:", error);
      setResult("Error performing AI action. The service might be experiencing high demand. Please try again later.");
    }
  };

  const handleFollowUp = async () => {
    if (!followUp.trim()) return;
    const userMessage = followUp;
    setFollowUp('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    
    // Add temporary AI message
    setChatHistory(prev => [...prev, { role: 'ai', text: '...', isTyping: true }]);
    
    try {
      const addictivePrompt = `
        You are DARA. The user is asking a follow-up about the study material.
        Question: ${userMessage}
        
        Make your response incredibly engaging to read. Use structured markdown formatting, emojis, bold text for key insights, and an encouraging tone.
      `;
      const text = await geminiService.chatWithBook(editableResult, userMessage + '\n\n' + addictivePrompt);
      
      // Typewriter Effect for Chat
      let currentText = '';
      const speed = 10;
      const words = text.split(/(\s+)/);
      
      let delay = 0;
      for (let i = 0; i < words.length; i++) {
        setTimeout(() => {
          currentText += words[i];
          setChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { role: 'ai', text: currentText, isTyping: i !== words.length - 1 };
            return newHistory;
          });
          
          if (chatEndRef.current) {
             chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, delay);
        delay += speed;
      }
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: "Failed to get response. Please try again.", isTyping: false };
        return newHistory;
      });
      setToast({ message: "Failed to get response. Please try again.", type: "error" });
    }
  };

  const exportToPdf = () => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(editableResult, 180);
    doc.text(splitText, 10, 10);
    doc.save(`${book.title.replace(/\s+/g, '_')}_result.pdf`);
    setToast({ message: "Exported to PDF!", type: "success" });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editableResult);
    setToast({ message: "Copied to clipboard!", type: "success" });
  };

  const saveResult = () => {
    setIsEditing(false);
    setToast({ message: "Saved to your profile!", type: "success" });
  };

  const actions = [
    { name: 'Read Book', icon: BookOpen, action: () => navigate(`/reader/${id}`), color: 'bg-primary' },
    { name: 'Edu 5.0 Dissector', icon: Sparkles, action: () => runAiAction('Edu 5.0 Dissector', 'Analyze this book through the lens of Zimbabwe Education 5.0. Highlight how its concepts apply to: 1. Teaching & Learning 2. Research 3. Community Service 4. Innovation 5. Industrialization. Provide practical examples for students.'), color: 'bg-teal-600' },
    { name: 'Summarize', icon: FileText, action: () => runAiAction('Summarize', 'Provide a concise summary of this book.'), color: 'bg-accent' },
    { name: 'Study Notes', icon: FileText, action: () => runAiAction('Notes', 'Create structured study notes for this book.'), color: 'bg-secondary' },
    { name: 'Remix Content', icon: Sparkles, action: () => runAiAction('Remix', 'Remix this content to align with Zimbabwean Heritage-Based Curriculum standards.'), color: 'bg-soil' },
    { name: 'Exam Questions', icon: Brain, action: () => runAiAction('Questions', 'Create 5 exam questions based on this book, aligned with the Zimbabwean Heritage-Based Curriculum.'), color: 'bg-clay' },
    { name: 'Generate Quiz', icon: Brain, action: () => runAiAction('Quiz', 'Create a short multiple-choice quiz (3 questions) based on the main themes of this book. Include the answers at the end.'), color: 'bg-primary' },
    { name: 'Key Glossary', icon: FileText, action: () => runAiAction('Glossary', 'Extract 5-10 key terms or concepts from this book and provide their definitions.'), color: 'bg-accent' },
    { name: 'Character Analysis', icon: Brain, action: () => runAiAction('Characters', 'Identify the main characters in this book and provide a brief analysis of their roles and development.'), color: 'bg-secondary' },
  ];

  const hasAutoRunRef = useRef(false);
  useEffect(() => {
    if (book && autoAction === 'edu5' && !hasAutoRunRef.current && !loadingAction && !result) {
      hasAutoRunRef.current = true;
      const action = actions.find(a => a.name === 'Edu 5.0 Dissector');
      if (action) {
         action.action();
      }
    }
  }, [book, autoAction, loadingAction, result]);

  if (loadingBook) {
    return (
      <div className="min-h-screen bg-bg-base p-4 md:p-8 flex flex-col items-center justify-center text-center">
        <Loader2 className="animate-spin text-teal-600 mb-4" size={48} />
        <h3 className="text-xl font-bold font-display text-primary">Loading Book and AI Tools...</h3>
        <p className="text-sm text-text-muted mt-2">DARA is loading content from the OER system.</p>
      </div>
    );
  }

  if (errorBook) {
    return (
      <div className="min-h-screen bg-bg-base p-4 md:p-8 flex flex-col items-center justify-center text-center">
        <AlertCircle className="text-rose-500 mb-4" size={48} />
        <h3 className="text-xl font-bold font-display text-primary">Failed to load publication</h3>
        <p className="text-sm text-text-muted mt-2">{errorBook}</p>
        <button 
          onClick={() => navigate('/library')}
          className="mt-6 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          Return to Library
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/library')} 
          className="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-all font-medium"
        >
          <ArrowLeft size={20} /> Back to Library
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-8">
                {/* Book Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-border flex flex-col gap-6"
                >
                  <div className="flex gap-6 items-start">
                    {book?.cover_image_url ? (
                      <img src={book.cover_image_url} alt={book.title} className="w-24 h-36 object-cover rounded-xl shadow-md flex-shrink-0" />
                    ) : (
                      <div className="w-24 h-36 bg-bg-muted rounded-xl shadow-md flex items-center justify-center flex-shrink-0">
                        <BookOpen className="text-text-muted opacity-50" size={32} />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-display font-bold text-primary mb-2 leading-tight">
                        {book?.title || 'Unknown Title'}
                      </h1>
                      <p className="text-text-muted font-medium mb-4">{book?.author_names || 'Unknown Author'}</p>
                      <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                        {book?.subject || 'Education 5.0 Text'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-start gap-4">
                    <div className="bg-teal-500 rounded-full p-2 text-white shrink-0 mt-1">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-teal-900 mb-1">Education 5.0 Alignment</h3>
                      <p className="text-sm text-teal-800 leading-relaxed">
                        This dedicated interaction hub uses AI to dissect and align the text entirely with Zimbabwe's Heritage-Based Education 5.0 curriculum: Innovation, Industrialization, Research, Teaching, and Community Service.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {actions.map((action, index) => (
                <motion.button
                  key={action.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                  disabled={!!loadingAction}
                  className={`group p-6 rounded-3xl ${action.color} text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-start gap-4 disabled:opacity-50 disabled:hover:translate-y-0`}
                >
                  <div className="p-3 bg-white/20 rounded-2xl">
                    {loadingAction === action.name ? <Loader2 className="animate-spin" size={24} /> : <action.icon size={24} />}
                  </div>
                  <span className="text-lg font-bold">{action.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right Column: Results & Chat */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              {loadingAction ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="p-12 bg-slate-900 overflow-hidden relative rounded-3xl shadow-xl border border-slate-800 flex flex-col items-center justify-center text-center min-h-[400px]"
                >
                  {/* Gamified Background effects */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                  
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ ease: "linear", duration: 8, repeat: Infinity }}
                    className="relative z-10 w-24 h-24 flex items-center justify-center rounded-full border-b-4 border-l-4 border-amber-500 mb-8"
                  >
                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-teal-500 animate-pulse"></div>
                    <Sparkles className="text-amber-500 animate-pulse" size={32} />
                  </motion.div>

                  <h3 className="text-3xl font-display font-black text-white mb-3 tracking-wide z-10 relative">
                    DARA IS ANALYZING
                  </h3>
                  
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={scanMessage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-teal-400 font-mono text-sm tracking-widest uppercase mb-8 z-10 relative h-6"
                    >
                      &gt; {scanMessage}
                    </motion.p>
                  </AnimatePresence>

                  <div className="w-full max-w-sm h-1.5 bg-slate-800 rounded-full overflow-hidden z-10 relative">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-teal-500 to-amber-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 6, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Result Box */}
                  <div className={`p-8 bg-white rounded-3xl shadow-sm border ${isTyping ? 'border-amber-400 shadow-amber-500/20' : 'border-border'}`}>
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-6 border-b border-border">
                      <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
                        {isTyping ? (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            <Zap className="text-amber-500" size={24} />
                          </motion.div>
                        ) : (
                          <CheckCircle2 className="text-emerald-500" size={24} />
                        )}
                        {isTyping ? 'DARA is Synching Data...' : 'Analysis Complete'}
                      </h2>
                      <div className="flex gap-2">
                        <button onClick={copyToClipboard} className="p-2 bg-bg-muted rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 transition-all" title="Copy">
                          <Copy size={18} />
                        </button>
                        <button onClick={exportToPdf} className="p-2 bg-bg-muted rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 transition-all" title="Download PDF">
                          <Download size={18} />
                        </button>
                        {isEditing ? (
                          <button onClick={saveResult} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
                            <Save size={16} /> Save
                          </button>
                        ) : (
                          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all">
                            <Edit3 size={16} /> Edit
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <textarea
                        value={editableResult}
                        onChange={(e) => setEditableResult(e.target.value)}
                        className="w-full h-96 p-4 border border-border rounded-xl text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y font-mono text-sm"
                      />
                    ) : (
                      <div className={`prose prose-primary max-w-none text-text-primary ${isTyping ? 'animate-pulse' : ''} prose-headings:text-primary prose-a:text-accent prose-strong:text-emerald-700 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner min-h-[300px]`}>
                        <ReactMarkdown>{editableResult}</ReactMarkdown>
                        {isTyping && <span className="inline-block w-2 h-4 bg-amber-500 animate-ping ml-1" />}
                      </div>
                    )}
                  </div>

                  {/* Follow-up Chat Box */}
                  <div className="p-8 bg-white rounded-3xl shadow-sm border border-border flex flex-col h-[500px]">
                    <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                      <MessageSquare size={20} /> Discuss this result
                    </h2>
                    
                    <div className="flex-grow overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                      {chatHistory.length === 0 && (
                        <div className="h-full flex items-center justify-center text-text-muted text-center italic">
                          Ask a question about the generated content above.
                        </div>
                      )}
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-4 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm shadow-md shadow-primary/20' : 'bg-slate-50 text-slate-800 rounded-bl-sm border border-slate-200 shadow-sm'}`}>
                            {msg.role === 'ai' ? (
                              <div className={`prose prose-sm max-w-none prose-p:leading-snug prose-p:my-1 prose-headings:text-primary prose-strong:text-emerald-700 ${msg.isTyping ? 'animate-pulse' : ''}`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                {msg.isTyping && <span className="inline-block w-1.5 h-3 bg-amber-500 animate-ping ml-1" />}
                              </div>
                            ) : (
                              msg.text
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    
                    <div className="flex gap-2 mt-auto">
                      <input 
                        value={followUp}
                        onChange={(e) => setFollowUp(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                        placeholder="Ask a follow-up question..."
                        className="flex-grow p-4 border border-border rounded-xl bg-bg-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                      <button 
                        onClick={handleFollowUp} 
                        disabled={!followUp.trim()}
                        className="p-4 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all flex items-center justify-center"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 bg-teal-50 border-2 border-dashed border-teal-200 rounded-3xl text-teal-800 min-h-[400px]"
                >
                  <Sparkles size={48} className="mb-4 opacity-30 text-teal-600" />
                  <h3 className="text-2xl font-bold mb-2">Education 5.0 AI Interaction Hub</h3>
                  <p className="max-w-md">The Edu 5.0 Dissector is ready. Select an action on the left to extract insights, summaries, and Heritage-Based alignments from this text.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
