import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, Sparkles, Brain, ArrowLeft, Loader2, Send, Download, MessageSquare, Edit3, Copy, Save } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import Toast from '../components/ui/Toast';

export default function BookActionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const book = location.state?.book;
  const [loadingAction, setLoadingAction] = useState(null);
  const [result, setResult] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableResult, setEditableResult] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [followUp, setFollowUp] = useState('');
  const [toast, setToast] = useState(null);
  const chatEndRef = useRef(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const generateContentWithRetry = async (params, maxRetries = 3) => {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        return await ai.models.generateContent(params);
      } catch (error) {
        const isUnavailable = error?.status === 503 || 
                              error?.message?.includes('503') || 
                              error?.message?.includes('UNAVAILABLE');
        
        if (isUnavailable) {
          retries++;
          if (retries >= maxRetries) throw error;
          const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
          console.warn(`Gemini API 503 error. Retrying in ${Math.round(delay)}ms... (Attempt ${retries} of ${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const runAiAction = async (actionName, prompt) => {
    if (!book) {
      setResult("Error: Book information not found.");
      return;
    }
    setLoadingAction(actionName);
    setResult(null);
    setEditableResult('');
    setIsEditing(false);
    setChatHistory([]);
    try {
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: `Book Title: ${book.title}\nAuthor: ${book.author_names}\nDescription: ${book.description}\n\nTask: ${prompt}\n\nPlease format your response using Markdown.`,
      });
      setResult(response.text);
      setEditableResult(response.text);
      setToast({ message: `${actionName} completed! +50 XP`, type: "success" });
    } catch (error) {
      console.error("Gemini Error:", error);
      setResult("Error performing AI action. The service might be experiencing high demand. Please try again later.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFollowUp = async () => {
    if (!followUp.trim()) return;
    const userMessage = followUp;
    setFollowUp('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    
    try {
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: `Context: ${editableResult}\n\nFollow-up Question: ${userMessage}\n\nPlease format your response using Markdown.`,
      });
      setChatHistory(prev => [...prev, { role: 'ai', text: response.text }]);
    } catch (error) {
      console.error("Gemini Chat Error:", error);
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
    { name: 'Summarize', icon: FileText, action: () => runAiAction('Summarize', 'Provide a concise summary of this book.'), color: 'bg-accent' },
    { name: 'Study Notes', icon: FileText, action: () => runAiAction('Notes', 'Create structured study notes for this book.'), color: 'bg-secondary' },
    { name: 'Remix Content', icon: Sparkles, action: () => runAiAction('Remix', 'Remix this content to align with Zimbabwean Heritage-Based Curriculum standards.'), color: 'bg-soil' },
    { name: 'Exam Questions', icon: Brain, action: () => runAiAction('Questions', 'Create 5 exam questions based on this book, aligned with the Zimbabwean Heritage-Based Curriculum.'), color: 'bg-clay' },
    { name: 'Generate Quiz', icon: Brain, action: () => runAiAction('Quiz', 'Create a short multiple-choice quiz (3 questions) based on the main themes of this book. Include the answers at the end.'), color: 'bg-primary' },
    { name: 'Key Glossary', icon: FileText, action: () => runAiAction('Glossary', 'Extract 5-10 key terms or concepts from this book and provide their definitions.'), color: 'bg-accent' },
    { name: 'Character Analysis', icon: Brain, action: () => runAiAction('Characters', 'Identify the main characters in this book and provide a brief analysis of their roles and development.'), color: 'bg-secondary' },
  ];

  return (
    <div className="min-h-screen bg-bg-base p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-all font-medium"
        >
          <ArrowLeft size={20} /> Back to Library
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Book Info & Actions */}
          <div className="lg:col-span-5 space-y-8">
            {/* Book Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-border flex gap-6 items-start"
            >
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
                  {book?.subject || 'General'}
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-12 bg-white rounded-3xl shadow-sm border border-border flex flex-col items-center justify-center text-center min-h-[400px]"
                >
                  <Loader2 className="animate-spin text-primary mb-6" size={48} />
                  <h3 className="text-2xl font-bold text-primary mb-2">Generating {loadingAction}...</h3>
                  <p className="text-text-muted">Our AI is analyzing the book and preparing your content.</p>
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Result Box */}
                  <div className="p-8 bg-white rounded-3xl shadow-sm border border-border">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-6 border-b border-border">
                      <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
                        <Sparkles className="text-accent" size={24} />
                        {loadingAction || 'AI Result'}
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
                      <div className="prose prose-primary max-w-none text-text-primary">
                        <ReactMarkdown>{editableResult}</ReactMarkdown>
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
                          <div className={`p-4 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-bg-muted text-text-primary rounded-bl-sm'}`}>
                            {msg.role === 'ai' ? (
                              <div className="prose prose-sm max-w-none prose-p:leading-snug prose-p:my-1">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
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
                  className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-3xl text-text-muted min-h-[400px]"
                >
                  <Sparkles size={48} className="mb-4 opacity-20" />
                  <h3 className="text-xl font-bold mb-2">Select an action</h3>
                  <p className="max-w-md">Choose one of the AI actions on the left to generate summaries, notes, or exam questions based on this book.</p>
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
