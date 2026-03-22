import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

import { 
  ArrowLeft, 
  Maximize, 
  Minimize, 
  ExternalLink,
  Sparkles, 
  Send, 
  X, 
  MessageSquare,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  BookOpen,
  Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { OPENSTAX_CURATED } from '../lib/transformBook';
import { ALL_ADDITIONAL_OER } from '../lib/oerCatalog';
import { openStaxService } from '../services/openStaxService';
import { geminiService } from '../services/geminiService';

const ALL_OER = [...OPENSTAX_CURATED, ...ALL_ADDITIONAL_OER];
import styles from './Reader.module.css';

export default function Reader() {
  const { id } = useParams();
  const { user, institution } = useAuth();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [viewUrl, setViewUrl] = useState('');
  const [dataSaverMode, setDataSaverMode] = useState(false);
  
  // PDF Viewer State
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [useNativeViewer, setUseNativeViewer] = useState(true);
  const [forceShowViewer, setForceShowViewer] = useState(false);

  // Memoize options to prevent unnecessary reloads
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), []);
  
  // AI Tutor State
  const [showAiSidebar, setShowAiSidebar] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', text: "Mhoro! I'm DARA, your personal AI Tutor. I'm here to help you master the material in this book. \n\nI can summarize chapters, explain complex concepts, or test your knowledge with a quick quiz. What shall we tackle first?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const chatEndRef = useRef(null);

  const QUICK_QUESTIONS = [
    "Summarize this chapter",
    "Explain this concept",
    "Generate exam questions"
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [generatedBook, setGeneratedBook] = useState(null);
  const [isGeneratingBook, setIsGeneratingBook] = useState(false);

  const handleGenerateBook = async () => {
    setIsGeneratingBook(true);
    try {
      const context = `
        Title: ${book?.title}
        Author: ${book?.author_names}
        Description: ${book?.description}
        Subject: ${book?.subject}
      `;
      
      const prompt = `
        Create a comprehensive study guide for this book. 
        Structure it as a mini e-book with the following sections:
        1. Executive Summary
        2. Key Concepts & Definitions
        3. Chapter-by-Chapter Breakdown (estimated)
        4. Critical Analysis
        5. Review Questions
        
        Format the output in clean Markdown.
      `;

      const response = await geminiService.askQuestion(prompt, context);
      setGeneratedBook(response);
    } catch (err) {
      console.error('Error generating book:', err);
      alert('Failed to generate AI book. Please try again.');
    } finally {
      setIsGeneratingBook(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  useEffect(() => {
    async function fetchBookAndCheckAccess() {
      try {
        setLoading(true);
        let bookData = null;

        const { data: dbBook, error: dbError } = await supabase
          .from('books')
          .select('*')
          .eq('id', id)
          .single();

        if (dbBook && !dbError) {
          bookData = {
            ...dbBook,
            file_path: dbBook.file_url,
            access_model: dbBook.access_model || 'dare_access',
            allow_download: true
          };
          setAccessGranted(true);
          setPreviewMode(false);
        } else {
          const osBook = ALL_OER.find(b => b.id === id);
          if (osBook) {
            bookData = {
              ...osBook,
              file_path: osBook.file_url,
              access_model: 'dare_access',
              allow_download: true
            };
            setAccessGranted(true);
            setPreviewMode(false);
          } else {
            throw new Error('Book not found');
          }
        }

        setBook(bookData);

        // Update initial AI message with book context
        setAiMessages([
          { 
            role: 'assistant', 
            text: `Mhoro! I'm DARA, your AI Tutor. I see you're reading **${bookData.title}** by ${bookData.author_names || 'various authors'}. Great choice — this is one of our most popular resources. How can I help you master it? I can summarize sections, explain concepts, generate practice questions, or help you take structured notes.` 
          }
        ]);

        if (bookData?.file_path) {
          let finalUrl = bookData.file_path;
          const isSupabaseStorage = finalUrl.includes('.supabase.co/storage/v1/object/');
          if (isSupabaseStorage && user) {
            try {
              const urlParts = finalUrl.split('/books/');
              if (urlParts.length > 1) {
                const path = urlParts[1];
                const { data: signedData, error: signedError } = await supabase.storage
                  .from('books')
                  .createSignedUrl(path, 3600);
                if (!signedError && signedData?.signedUrl) {
                  finalUrl = signedData.signedUrl;
                }
              }
            } catch (err) {
              console.warn('Signed URL fallback:', err);
            }
          }
          setViewUrl(finalUrl);
          setUseNativeViewer(finalUrl.toLowerCase().includes('.pdf'));
        }

        if (user) {
          const updateSession = async () => {
            try {
              await supabase.from('reading_sessions').upsert({
                user_id: user.id,
                book_id: id,
                last_read_at: new Date().toISOString(),
              }, { onConflict: 'user_id, book_id' });
            } catch (err) {
              // Silent failure for background task
            }
          };
          updateSession();
        }

      } catch (err) {
        console.error('Error loading reader:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookAndCheckAccess();
  }, [id, user, institution]);

  const handleSendMessage = async (e, customMessage = null) => {
    if (e) e.preventDefault();
    const messageToSend = customMessage || inputMessage;
    
    if (!messageToSend.trim() || isAiThinking) return;

    setInputMessage('');
    setAiMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setIsAiThinking(true);

    try {
      // 1. Ensure we have a session if user is logged in
      let currentSessionId = sessionId;
      if (user && !currentSessionId) {
        const { data: session, error: sError } = await supabase
          .from('dara_sessions')
          .insert({
            user_id: user.id,
            book_id: id,
            session_title: `Reading: ${book?.title || id}`
          })
          .select()
          .single();
        
        if (!sError && session) {
          currentSessionId = session.id;
          setSessionId(currentSessionId);
        }
      }

      // 2. Save user message to DB
      if (user && currentSessionId) {
        await supabase.from('dara_messages').insert({
          session_id: currentSessionId,
          user_id: user.id,
          role: 'user',
          content: messageToSend,
          books_referenced: [id]
        });
      }

      // 3. Get AI response
      const toc = book?.table_of_contents?.join('\n') || '';
      const context = `
        Title: ${book?.title}
        Author: ${book?.author_names}
        Description: ${book?.description}
        Table of Contents:
        ${toc}
        Current Page: ${pageNumber}
        
        Task: Answer the student's question based on the provided book context.
        Student Question: ${messageToSend}
      `;
      
      const response = await geminiService.chat(context, aiMessages.map(m => ({
        role: m.role === 'assistant' ? 'ai' : 'user',
        text: m.text
      })));
      
      setAiMessages(prev => [...prev, { role: 'assistant', text: response }]);

      // 4. Save AI response to DB
      if (user && currentSessionId) {
        await supabase.from('dara_messages').insert({
          session_id: currentSessionId,
          user_id: user.id,
          role: 'assistant',
          content: response,
          books_referenced: [id]
        });
      }
    } catch (err) {
      console.error('AI Error:', err);
      setAiMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSummarize = async () => {
    if (isSummarizing || isAiThinking) return;
    
    setIsSummarizing(true);
    setIsAiThinking(true);
    setAiMessages(prev => [...prev, { role: 'user', text: 'Please summarize this book for me.' }]);

    try {
      const toc = book?.table_of_contents?.join('\n') || '';
      const context = `
        Title: ${book?.title}
        Author: ${book?.author_names}
        Description: ${book?.description}
        Table of Contents:
        ${toc}
      `;
      const response = await geminiService.summarize(context, "This is a book from the Dare Digital Library.");
      setAiMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      console.error('Summarization Error:', err);
      setAiMessages(prev => [...prev, { role: 'assistant', text: 'Failed to generate summary. Please try again.' }]);
    } finally {
      setIsSummarizing(false);
      setIsAiThinking(false);
    }
  };

  const clearChat = () => {
    const greeting = book 
      ? `Mhoro! I'm DARA, your AI Tutor. I see you're reading **${book.title}** by ${book.author_names || 'various authors'}. Great choice — this is one of our most popular resources. How can I help you master it? I can summarize sections, explain concepts, generate practice questions, or help you take structured notes.`
      : "Mhoro! I'm DARA, your personal AI Tutor. I'm here to help you master the material in this book. \n\nI can summarize chapters, explain complex concepts, or test your knowledge with a quick quiz. What shall we tackle first?";
    
    setAiMessages([
      { role: 'assistant', text: greeting }
    ]);
  };

  const handleDownload = () => {
    if (!viewUrl) return;
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = viewUrl;
    link.setAttribute('download', `${book?.title || 'document'}.pdf`);
    link.setAttribute('target', '_blank'); // Fallback for some browsers
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleDataSaver = () => {
    setDataSaverMode(!dataSaverMode);
    if (!dataSaverMode && !generatedBook) {
      handleGenerateBook();
    }
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(err => {
            console.warn('Fullscreen request failed:', err);
          });
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen API error:', err);
      setIsFullscreen(!isFullscreen); // Fallback toggle
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading document...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className={styles.errorContainer}>
        <h2>Document not found</h2>
        <Link to="/library" className={styles.backLink}>Return to Library</Link>
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className={styles.errorContainer}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this document.</p>
        <Link to={`/book/${id}`} className={styles.backLink}>Go back to details</Link>
      </div>
    );
  }

  return (
    <div className={`${styles.readerContainer} ${isFullscreen ? styles.fullscreen : ''}`}>
      {/* Preview Banner */}
      {previewMode && (
        <div className={styles.previewBanner}>
          <span>Preview Mode — Showing first 25 pages only</span>
          <Link to={`/book/${id}`} className={styles.upgradeLink}>
            Get Full Access
          </Link>
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <button 
            onClick={() => {
              if (book?.publisher_name === 'OpenStax' || book?.source === 'OpenStax') {
                navigate('/library');
              } else if (book?.id?.startsWith('res-')) {
                navigate('/research');
              } else if (book?.subject?.toLowerCase().includes('artificial intelligence') || book?.id?.startsWith('ai-')) {
                navigate('/ai-textbooks');
              } else {
                navigate('/library');
              }
            }} 
            className={styles.backBtn}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>{book.title}</h1>
        </div>
        
        <div className={styles.toolbarRight}>
          <button 
            onClick={toggleDataSaver} 
            className={`${styles.toolBtn} ${dataSaverMode ? styles.activeDataSaver : ''}`}
            title={dataSaverMode ? "Switch to Standard Mode" : "Enable Data Saver Mode"}
          >
            <div className={styles.dataSaverIcon}>
              <span className={styles.dataSaverText}>DATA SAVER</span>
            </div>
          </button>
          {book?.allow_download && (
            <button onClick={handleDownload} className={styles.toolBtn} title="Download PDF">
              <Download size={20} />
            </button>
          )}
          <button 
            onClick={() => setShowAiSidebar(!showAiSidebar)} 
            className={`${styles.toolBtn} ${showAiSidebar ? styles.activeTool : ''}`} 
            title="AI Tutor"
          >
            <Sparkles size={20} />
          </button>
          <button onClick={toggleFullscreen} className={styles.toolBtn} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      {/* PDF Viewer & Sidebar */}
      <div className={styles.mainContent}>
        <div className={styles.viewerContent}>
          {dataSaverMode ? (
            <div className={styles.dataSaverView}>
              <div className={styles.dataSaverHeader}>
                <div className={styles.dataSaverTitle}>
                  <Sparkles size={20} className={styles.aiIcon} />
                  <h2>Data Saver Mode: AI Study Guide</h2>
                </div>
                <p className={styles.dataSaverHint}>PDF disabled to save data. Reading AI-generated summary.</p>
              </div>
              <div className={styles.generatedBookContent}>
                {isGeneratingBook ? (
                  <div className={styles.generatingState}>
                    <Loader2 size={48} className={styles.spin} />
                    <h3>Generating Study Guide...</h3>
                    <p>DARA is analyzing the book to save your data budget.</p>
                  </div>
                ) : generatedBook ? (
                  <div className="markdown-body">
                    <ReactMarkdown>{generatedBook}</ReactMarkdown>
                  </div>
                ) : (
                  <div className={styles.errorState}>
                    <p>Failed to load study guide.</p>
                    <button onClick={handleGenerateBook} className={styles.retryBtn}>Retry Generation</button>
                  </div>
                )}
              </div>
            </div>
          ) : viewUrl ? (
            (!viewUrl.toLowerCase().includes('.pdf') && !forceShowViewer && !generatedBook) ? (
              <div className={styles.externalResource}>
                <div className={styles.externalContent}>
                  <ExternalLink size={48} className={styles.externalIcon} />
                  <h2>External Resource</h2>
                  <p>This content cannot be embedded directly in the reader.</p>
                  
                  <div className={styles.externalActions}>
                    <a href={viewUrl} target="_blank" rel="noopener noreferrer" className={styles.openExternalBtn}>
                      Open Resource <ExternalLink size={16} />
                    </a>
                    <button 
                      onClick={() => setForceShowViewer(true)} 
                      className={styles.forceViewBtn}
                    >
                      Try to View in Reader
                    </button>
                  </div>

                  <div className={styles.aiGenerationSection}>
                    <div className={styles.divider}><span>OR</span></div>
                    <button 
                      onClick={handleGenerateBook}
                      disabled={isGeneratingBook}
                      className={styles.generateBookBtn}
                    >
                      {isGeneratingBook ? (
                        <>
                          <Loader2 size={18} className={styles.spin} />
                          Generating AI Study Guide...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Generate AI Study Guide
                        </>
                      )}
                    </button>
                    <p className={styles.aiHint}>Create an instant AI-powered e-book summary for this resource.</p>
                  </div>
                </div>
              </div>
            ) : generatedBook ? (
              <div className={styles.generatedBookContainer}>
                <div className={styles.generatedBookHeader}>
                  <div className={styles.generatedTitleGroup}>
                    <Sparkles size={20} className={styles.aiIcon} />
                    <h2>AI Study Guide: {book.title}</h2>
                  </div>
                  <button onClick={() => setGeneratedBook(null)} className={styles.closeGeneratedBtn}>
                    Close Guide
                  </button>
                </div>
                <div className={styles.generatedBookContent}>
                  <div className="markdown-body">
                    <ReactMarkdown>{generatedBook}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : useNativeViewer ? (
              <div className={styles.pdfWrapper}>
                <div className={styles.pdfControls}>
                  <div className={styles.pdfControlGroup}>
                    <button 
                      onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))} 
                      disabled={pageNumber <= 1}
                      className={styles.pdfBtn}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className={styles.pageInfo}>
                      Page {pageNumber} of {numPages || '--'}
                    </span>
                    <button 
                      onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || prev))} 
                      disabled={pageNumber >= (numPages || 1)}
                      className={styles.pdfBtn}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  
                  <div className={styles.pdfControlGroup}>
                    <button onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))} className={styles.pdfBtn} title="Zoom Out">
                      <ZoomOut size={18} />
                    </button>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2.0" 
                      step="0.1" 
                      value={scale} 
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className={styles.zoomSlider}
                      title={`Zoom: ${Math.round(scale * 100)}%`}
                    />
                    <button onClick={() => setScale(prev => Math.min(prev + 0.1, 2.0))} className={styles.pdfBtn} title="Zoom In">
                      <ZoomIn size={18} />
                    </button>
                    <span className={styles.scaleInfo}>{Math.round(scale * 100)}%</span>
                  </div>

                  <button 
                    onClick={() => setUseNativeViewer(false)} 
                    className={styles.fallbackBtn}
                    title="Switch to Google Viewer"
                  >
                    Switch Viewer
                  </button>
                </div>

                <div className={styles.pdfDocument}>
                  <Document
                    file={viewUrl}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    onLoadError={(error) => {
                      console.error('PDF Load Error:', error);
                      setUseNativeViewer(false);
                    }}
                    loading={
                      <div className={styles.pdfLoading}>
                        <Loader2 className={styles.spin} size={32} />
                        <p>Loading PDF...</p>
                      </div>
                    }
                    error={
                      <div className={styles.pdfError}>
                        <p>Failed to load PDF. Switching to fallback viewer...</p>
                      </div>
                    }
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      scale={scale} 
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className={styles.pdfPage}
                      width={window.innerWidth > 1000 ? (showAiSidebar ? 600 : 800) : window.innerWidth - 48}
                    />
                  </Document>
                </div>
              </div>
            ) : (
              <>
                {/* Use Google Docs Viewer for documents, plain iframe for others */}
                <iframe 
                  src={
                    (viewUrl.toLowerCase().includes('.pdf') || 
                     viewUrl.toLowerCase().includes('.doc') || 
                     viewUrl.toLowerCase().includes('.ppt')) 
                      ? `https://docs.google.com/viewer?url=${encodeURIComponent(viewUrl)}&embedded=true`
                      : viewUrl
                  }
                  className={styles.pdfFrame}
                  title={book.title}
                />
                
                <div className={styles.fallbackBar}>
                   <p>Having trouble viewing this document?</p>
                   <div className={styles.fallbackActions}>
                     <a href={viewUrl} target="_blank" rel="noopener noreferrer" className={styles.fallbackBtn}>
                       Open in New Tab <ExternalLink size={14} />
                     </a>
                     <button 
                      onClick={() => setUseNativeViewer(true)} 
                      className={styles.retryBtn}
                     >
                       Try Native Viewer
                     </button>
                   </div>
                </div>
              </>
            )
          ) : (
            <div className={styles.noFile}>
              <p>No PDF file associated with this record.</p>
            </div>
          )}
        </div>

        {/* AI Sidebar */}
        {showAiSidebar && (
          <aside className={styles.aiSidebar}>
            <div className={styles.aiSidebarHeader}>
              <div className={styles.aiTitleGroup}>
                <Sparkles size={18} className={styles.aiIcon} />
                <h3>DARA AI Tutor</h3>
              </div>
              <div className={styles.aiHeaderActions}>
                <button onClick={clearChat} className={styles.headerActionBtn} title="Clear Chat">
                  <X size={16} />
                </button>
                <button onClick={() => setShowAiSidebar(false)} className={styles.closeAiBtn}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className={styles.aiQuickActions}>
              <button 
                onClick={() => setIsStudyMode(!isStudyMode)}
                className={`${styles.quickActionBtn} ${isStudyMode ? styles.activeStudy : ''}`}
              >
                <BookOpen size={14} />
                {isStudyMode ? 'Exit Study Mode' : 'Start Study Session'}
              </button>
              {!isStudyMode && (
                <>
                  <button 
                    onClick={handleSummarize} 
                    disabled={isSummarizing || isAiThinking}
                    className={styles.quickActionBtn}
                  >
                    {isSummarizing ? <Loader2 size={14} className={styles.spin} /> : <BookOpen size={14} />}
                    Summarize Book
                  </button>
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSendMessage(null, q)}
                      disabled={isAiThinking}
                      className={styles.quickActionBtn}
                    >
                      <MessageSquare size={14} />
                      {q}
                    </button>
                  ))}
                </>
              )}
            </div>

            {isStudyMode && (
              <div className={styles.studyModePanel}>
                <h4>Study Session Tools</h4>
                <div className={styles.studyToolsGrid}>
                  <button onClick={() => handleSendMessage(null, "Extract 10 key terms and definitions from this book")}>
                    Key Terms
                  </button>
                  <button onClick={() => handleSendMessage(null, "Generate 5 flashcard style questions for active recall")}>
                    Flashcards
                  </button>
                  <button onClick={() => handleSendMessage(null, "Create a 5-question multiple choice quiz")}>
                    Quick Quiz
                  </button>
                  <button onClick={() => handleSendMessage(null, "Explain the most difficult concept in this book simply")}>
                    Explain Simply
                  </button>
                </div>
              </div>
            )}

            <div className={styles.chatContainer}>
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                  <div className={`${styles.messageBubble} ${msg.role === 'assistant' ? 'markdown-body' : ''}`}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={`${styles.messageBubble} ${styles.thinking}`}>
                    <Loader2 size={16} className={styles.spin} />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form className={styles.chatInputArea} onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Ask a question about this book..." 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button type="submit" disabled={!inputMessage.trim() || isAiThinking}>
                <Send size={18} />
              </button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}
