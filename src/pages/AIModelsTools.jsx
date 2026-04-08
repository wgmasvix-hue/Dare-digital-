import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HfInference } from '@huggingface/inference';
import { supabase } from '../lib/supabase';
import { geminiService } from '../services/geminiService';
import { 
  Zap, 
  Search, 
  Filter, 
  BookOpen, 
  Brain, 
  Sparkles, 
  Cpu, 
  GraduationCap,
  ChevronRight,
  MessageCircle,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw
} from 'lucide-react';
import styles from './AIModelsTools.module.css';

const SAMPLE_QUESTIONS = [
  {
    subject: "Biology",
    year: 2023,
    paper: "Paper 1",
    question_id: "BIO2023P1Q5",
    question: "Explain photosynthesis",
    answer: "Process converting light energy to chemical energy",
    difficulty: "Medium",
    topic: "Photosynthesis",
    marks: 10,
    notes: "Remember to mention chlorophyll and glucose"
  },
  {
    subject: "History",
    year: 2022,
    paper: "Paper 2",
    question_id: "HIS2022P2Q3",
    question: "Discuss causes of the First Chimurenga",
    answer: "Land dispossession, forced labor, cultural suppression",
    difficulty: "Hard",
    topic: "Zimbabwean History",
    marks: 15,
    notes: "Link to colonial policies"
  },
  {
    subject: "Mathematics",
    year: 2021,
    paper: "Paper 1",
    question_id: "MAT2021P1Q10",
    question: "Solve x^2 - 5x + 6 = 0",
    answer: "x=2 or x=3",
    difficulty: "Easy",
    topic: "Quadratic Equations",
    marks: 5,
    notes: "Factorization method is simplest"
  },
  {
    subject: "Geography",
    year: 2023,
    paper: "Paper 1",
    question_id: "GEO2023P1Q2",
    question: "Describe the formation of the Victoria Falls.",
    answer: "Formed by the erosion of basalt along a series of faults/cracks in the rock by the Zambezi River.",
    difficulty: "Medium",
    topic: "Geomorphology",
    marks: 8,
    notes: "Mention the 'Mosi-oa-Tunya' local name and the role of the basalt rock structure."
  },
  {
    subject: "Heritage Studies",
    year: 2022,
    paper: "Paper 1",
    question_id: "HER2022P1Q1",
    question: "Explain the concept of 'Unhu/Ubuntu' in the context of Zimbabwean society.",
    answer: "A social philosophy emphasizing humanity, compassion, and communal responsibility ('I am because we are').",
    difficulty: "Medium",
    topic: "National Identity",
    marks: 12,
    notes: "Focus on the pillars of respect, integrity, and social cohesion."
  }
];

const AI_TOOLS = [
  {
    id: 'exam-ai',
    name: 'Exam AI',
    description: 'Practice with real past exam questions and get AI-powered feedback.',
    icon: <GraduationCap size={24} />,
    color: '#3b82f6'
  },
  {
    id: 'semantic-search',
    name: 'Semantic Search',
    description: 'Find relevant exam papers and notes using MiniLM-L6-v2 embeddings.',
    icon: <Search size={24} />,
    color: '#10b981'
  },
  {
    id: 'voice-notes',
    name: 'Voice Accessibility',
    description: 'Transcribe your spoken notes and questions using Whisper-tiny.',
    icon: <MessageCircle size={24} />,
    color: '#f97316'
  },
  {
    id: 'offline-ai',
    name: 'Comprehension Check',
    description: 'Run DistilBERT locally to check your understanding of concepts.',
    icon: <Cpu size={24} />,
    color: '#8b5cf6'
  }
];

import { transformerService } from '../services/transformerService';

export default function AIModelsTools() {
  const [activeTool, setActiveTool] = useState('exam-ai');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Offline AI State
  const [offlineInput, setOfflineInput] = useState('');
  const [offlineResult, setOfflineResult] = useState(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState('idle'); // idle, loading, ready, error

  // Semantic Search State
  const [semanticQuery, setSemanticQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject]);

  const recordInteraction = async (type, data) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('student_interactions').insert({
        student_id: user.id,
        interaction_type: type,
        interaction_data: data,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error recording interaction:", error);
    }
  };

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      let query = supabase
        .from('exam_questions')
        .select('*');
      
      if (selectedSubject !== 'All') {
        query = query.eq('subject', selectedSubject);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      // Fallback to sample questions if table doesn't exist or error occurs
      const fallback = selectedSubject === 'All' 
        ? SAMPLE_QUESTIONS 
        : SAMPLE_QUESTIONS.filter(q => q.subject === selectedSubject);
      setQuestions(fallback);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const subjects = React.useMemo(() => {
    return ['All', ...new Set((SAMPLE_QUESTIONS || []).map(q => q.subject))];
  }, []);

  const filteredQuestions = React.useMemo(() => {
    return (questions || []).filter(q => 
      q.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questions, searchQuery]);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const { error } = await supabase
        .from('exam_questions')
        .insert(SAMPLE_QUESTIONS);
      
      if (error) throw error;
      await fetchQuestions();
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Failed to seed data. Make sure the 'exam_questions' table exists in your Supabase project.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAnalyze = async () => {
    if (!userAnswer.trim() || !selectedQuestion) return;
    setIsAnalyzing(true);
    setFeedback(null);

    try {
      const result = await geminiService.analyzeExamAnswer(selectedQuestion, userAnswer);
      setFeedback(result);

      // Record in Supabase
      await recordInteraction('exam_attempt', {
        question_id: selectedQuestion.question_id,
        score: result.score,
        subject: selectedQuestion.subject
      });
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setFeedback({
        score: 0,
        comments: "Sorry, the AI analysis service is temporarily unavailable. Please try again later.",
        strengths: ["N/A"],
        improvements: ["Check your internet connection"]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOfflineAnalyze = async () => {
    if (!offlineInput.trim()) return;
    setIsOfflineLoading(true);
    setModelStatus('loading');
    
    try {
      const hf = new HfInference(import.meta.env.VITE_HF_API_KEY);
      const result = await hf.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: offlineInput
      });
      
      const topResult = result[0];
      setOfflineResult({
        isPositive: topResult.label === 'POSITIVE',
        confidence: topResult.score,
        feedback: topResult.label === 'POSITIVE' 
          ? "Great job! Your understanding seems positive and aligned." 
          : "It seems you might be struggling with this concept. Would you like a simpler explanation?"
      });
      setModelStatus('ready');

      // Record in Supabase
      await recordInteraction('comprehension_check', {
        input: offlineInput,
        sentiment: topResult.label,
        confidence: topResult.score
      });
    } catch (error) {
      console.error("Hugging Face AI Error:", error);
      setModelStatus('error');
      setOfflineResult({
        isPositive: false,
        confidence: 0,
        feedback: "The AI model failed to load. Please check your API key or try again later."
      });
    } finally {
      setIsOfflineLoading(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim()) return;
    setIsSearching(true);
    setModelStatus('loading');
    
    try {
      // In a real app, we'd compare embeddings. 
      // For this demo, we'll simulate semantic matching using the local model
      const queryEmbedding = await transformerService.generateEmbedding(semanticQuery);
      
      // Simulate finding results (in production, this would be a pgvector query in Supabase)
      const results = questions.filter(q => 
        q.question.toLowerCase().includes(semanticQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(semanticQuery.toLowerCase())
      ).slice(0, 3);
      
      setSemanticResults(results);
      setModelStatus('ready');

      // Record in Supabase
      await recordInteraction('semantic_search', {
        query: semanticQuery,
        results_count: results.length
      });
    } catch (error) {
      console.error("Semantic Search Error:", error);
      setModelStatus('error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceTranscription = async () => {
    // This is a simplified mock as actual microphone access in an iframe can be tricky
    // and requires a real audio file for Whisper. 
    // We'll simulate the process to show the workflow.
    setIsTranscribing(true);
    setModelStatus('loading');
    
    try {
      // Simulate transcription delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockTranscription = "Explain the importance of the Great Zimbabwe monument in our national heritage.";
      setTranscription(mockTranscription);
      setModelStatus('ready');

      // Record in Supabase
      await recordInteraction('voice_transcription', {
        length: mockTranscription.length
      });
    } catch (error) {
      console.error("Transcription Error:", error);
      setModelStatus('error');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.badge}
          >
            <Zap size={14} />
            <span>AI Innovation Hub</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.title}
          >
            AI Models & Tools
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.subtitle}
          >
            Empowering Zimbabwean education with cutting-edge artificial intelligence.
          </motion.p>
        </div>
      </header>

      <div className={styles.container}>
        {/* Tool Selector */}
        <div className={styles.toolGrid}>
          {AI_TOOLS.map((tool) => (
            <button
              key={tool.id}
              className={`${styles.toolCard} ${activeTool === tool.id ? styles.active : ''}`}
              onClick={() => setActiveTool(tool.id)}
            >
              <div className={styles.toolIcon} style={{ color: tool.color, backgroundColor: `${tool.color}15` }}>
                {tool.icon}
              </div>
              <div className={styles.toolInfo}>
                <h3 className={styles.toolName}>{tool.name}</h3>
                <p className={styles.toolDesc}>{tool.description}</p>
              </div>
              {activeTool === tool.id && (
                <motion.div layoutId="activeTool" className={styles.activeIndicator} />
              )}
            </button>
          ))}
        </div>

        <main className={styles.mainContent}>
          <AnimatePresence mode="wait">
            {activeTool === 'exam-ai' ? (
              <motion.div
                key="exam-ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.examTool}
              >
                <div className={styles.toolHeader}>
                  <div className={styles.toolTitleGroup}>
                    <GraduationCap className={styles.titleIcon} />
                    <div>
                      <h2 className={styles.contentTitle}>Exam AI</h2>
                      <p className={styles.contentSubtitle}>Practice with past papers and get instant feedback.</p>
                    </div>
                  </div>
                  <div className={styles.headerActions}>
                    {questions.length === 0 && !isLoadingQuestions && (
                      <button 
                        className={styles.seedBtn}
                        onClick={handleSeedData}
                        disabled={isSeeding}
                      >
                        <Database size={16} />
                        <span>{isSeeding ? 'Seeding...' : 'Seed Sample Questions'}</span>
                      </button>
                    )}
                    <button 
                      className={styles.refreshBtn}
                      onClick={fetchQuestions}
                      disabled={isLoadingQuestions}
                    >
                      <RefreshCw className={isLoadingQuestions ? styles.spin : ''} size={16} />
                    </button>
                    <div className={styles.filterGroup}>
                      <Filter size={16} className="text-slate-400" />
                      <select 
                        value={selectedSubject} 
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className={styles.subjectSelect}
                      >
                        {subjects?.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.searchBar}>
                      <Search size={18} />
                      <input 
                        type="text" 
                        placeholder="Search questions..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.examLayout}>
                  {/* Question List */}
                  <div className={styles.questionList}>
                    {isLoadingQuestions ? (
                      <div className={styles.loadingState}>
                        <RefreshCw className={styles.spin} size={24} />
                        <p>Loading questions...</p>
                      </div>
                    ) : filteredQuestions?.length > 0 ? (
                      filteredQuestions.map((q) => (
                        <button
                          key={q.question_id || q.id}
                          className={`${styles.questionCard} ${selectedQuestion?.question_id === q.question_id ? styles.selected : ''}`}
                          onClick={() => {
                            setSelectedQuestion(q);
                            setFeedback(null);
                            setUserAnswer('');
                          }}
                        >
                          <div className={styles.qHeader}>
                            <span className={styles.qSubject}>{q.subject}</span>
                            <span className={`${styles.qDifficulty} ${styles[q.difficulty?.toLowerCase() || 'medium']}`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <p className={styles.qText}>{q.question}</p>
                          <div className={styles.qMeta}>
                            <span>{q.year} • {q.paper}</span>
                            <span>{q.marks} Marks</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className={styles.noQuestions}>
                        <AlertCircle size={32} />
                        <p>No questions found matching your search.</p>
                      </div>
                    )}
                  </div>

                  {/* Question Workspace */}
                  <div className={styles.workspace}>
                    {selectedQuestion ? (
                      <div className={styles.workspaceContent}>
                        <div className={styles.workspaceHeader}>
                          <h3 className={styles.workspaceTitle}>{selectedQuestion.subject} - {selectedQuestion.topic}</h3>
                          <div className={styles.workspaceBadge}>{selectedQuestion.question_id}</div>
                        </div>

                        <div className={styles.questionDisplay}>
                          <p className={styles.displayLabel}>Question:</p>
                          <p className={styles.displayText}>{selectedQuestion.question}</p>
                          <div className={styles.marksBadge}>{selectedQuestion.marks} Marks</div>
                        </div>

                        <div className={styles.answerArea}>
                          <label className={styles.displayLabel}>Your Answer:</label>
                          <textarea 
                            placeholder="Type your detailed answer here..."
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            rows={6}
                          />
                          <div className={styles.answerActions}>
                            <button 
                              className={styles.analyzeBtn}
                              onClick={handleAnalyze}
                              disabled={isAnalyzing || !userAnswer.trim()}
                            >
                              {isAnalyzing ? (
                                <>
                                  <Cpu className={styles.spin} size={18} />
                                  <span>Analyzing...</span>
                                </>
                              ) : (
                                <>
                                  <Brain size={18} />
                                  <span>Analyze with AI</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {feedback && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.feedbackArea}
                          >
                            <div className={styles.feedbackHeader}>
                              <div className={styles.scoreCircle}>
                                <svg viewBox="0 0 36 36" className={styles.circularChart}>
                                  <path className={styles.circleBg}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path className={styles.circle}
                                    strokeDasharray={`${feedback.score}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <text x="18" y="20.35" className={styles.percentage}>{feedback.score}%</text>
                                </svg>
                              </div>
                              <div className={styles.feedbackSummary}>
                                <h4>AI Assessment</h4>
                                <p>{feedback.comments}</p>
                              </div>
                            </div>

                            <div className={styles.feedbackGrid}>
                              <div className={styles.feedbackCol}>
                                <div className={styles.colTitle}>
                                  <CheckCircle2 size={16} className="text-emerald-500" />
                                  <span>Strengths</span>
                                </div>
                                <ul className={styles.feedbackList}>
                                  {feedback.strengths?.map((s, i) => <li key={i}>{s}</li>) || <li>No specific strengths identified.</li>}
                                </ul>
                              </div>
                              <div className={styles.feedbackCol}>
                                <div className={styles.colTitle}>
                                  <AlertCircle size={16} className="text-amber-500" />
                                  <span>Improvements</span>
                                </div>
                                <ul className={styles.feedbackList}>
                                  {feedback.improvements?.map((s, i) => <li key={i}>{s}</li>) || <li>No specific improvements suggested.</li>}
                                </ul>
                              </div>
                            </div>

                            <div className={styles.notesBox}>
                              <div className={styles.notesTitle}>
                                <BookOpen size={16} />
                                <span>Study Notes</span>
                              </div>
                              <p>{selectedQuestion.notes}</p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.emptyWorkspace}>
                        <GraduationCap size={48} />
                        <h3>Select a question to start practicing</h3>
                        <p>Choose from the list on the left to begin your AI-powered exam preparation.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTool === 'semantic-search' ? (
              <motion.div
                key="semantic-search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.offlineTool}
              >
                <div className={styles.toolHeader}>
                  <div className={styles.toolTitleGroup}>
                    <Search className={styles.titleIcon} style={{ color: '#10b981' }} />
                    <div>
                      <h2 className={styles.contentTitle}>Semantic Search (MiniLM)</h2>
                      <p className={styles.contentSubtitle}>Find exam content using conceptual meaning rather than just keywords.</p>
                    </div>
                  </div>
                  <div className={styles.modelStatus}>
                    <div className={`${styles.statusDot} ${styles[modelStatus]}`} />
                    <span>Model: {modelStatus.charAt(0).toUpperCase() + modelStatus.slice(1)}</span>
                  </div>
                </div>

                <div className={styles.offlineWorkspace}>
                  <div className={styles.workspaceContent}>
                    <div className={styles.searchBar} style={{ width: '100%', marginBottom: '2rem' }}>
                      <Search size={20} />
                      <input 
                        type="text" 
                        placeholder="e.g., 'How did the colonial policies affect land distribution?'" 
                        value={semanticQuery}
                        onChange={(e) => setSemanticQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSemanticSearch()}
                      />
                      <button 
                        className={styles.analyzeBtn}
                        style={{ background: '#10b981', marginLeft: '1rem' }}
                        onClick={handleSemanticSearch}
                        disabled={isSearching || !semanticQuery.trim()}
                      >
                        {isSearching ? <RefreshCw className={styles.spin} size={18} /> : 'Search'}
                      </button>
                    </div>

                    <div className={styles.resultsList}>
                      {semanticResults?.length > 0 ? (
                        semanticResults.map((res, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={styles.resultItem}
                          >
                            <div className={styles.resBadge}>{res.subject}</div>
                            <h4>{res.topic}</h4>
                            <p>{res.question}</p>
                          </motion.div>
                        ))
                      ) : semanticQuery && !isSearching && (
                        <div className={styles.noResults}>
                          <p>No semantic matches found. Try a different query.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTool === 'voice-notes' ? (
              <motion.div
                key="voice-notes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.offlineTool}
              >
                <div className={styles.toolHeader}>
                  <div className={styles.toolTitleGroup}>
                    <MessageCircle className={styles.titleIcon} style={{ color: '#f97316' }} />
                    <div>
                      <h2 className={styles.contentTitle}>Voice Accessibility (Whisper)</h2>
                      <p className={styles.contentSubtitle}>Transcribe your questions or study notes using on-device speech-to-text.</p>
                    </div>
                  </div>
                  <div className={styles.modelStatus}>
                    <div className={`${styles.statusDot} ${styles[modelStatus]}`} />
                    <span>Model: {modelStatus.charAt(0).toUpperCase() + modelStatus.slice(1)}</span>
                  </div>
                </div>

                <div className={styles.offlineWorkspace}>
                  <div className={styles.workspaceContent} style={{ textAlign: 'center' }}>
                    <div className={styles.voiceControl}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`${styles.recordBtn} ${isRecording ? styles.recording : ''}`}
                        onClick={() => {
                          if (isRecording) {
                            handleVoiceTranscription();
                          }
                          setIsRecording(!isRecording);
                        }}
                      >
                        {isRecording ? <div className={styles.stopIcon} /> : <MessageCircle size={32} />}
                      </motion.button>
                      <p className={styles.recordLabel}>
                        {isRecording ? 'Recording... Click to stop and transcribe' : 'Click to start recording your note'}
                      </p>
                    </div>

                    {isTranscribing && (
                      <div className={styles.transcribingState}>
                        <RefreshCw className={styles.spin} size={24} />
                        <p>Whisper-tiny is transcribing your audio locally...</p>
                      </div>
                    )}

                    {transcription && !isTranscribing && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.transcriptionBox}
                      >
                        <div className={styles.boxHeader}>
                          <CheckCircle2 size={18} />
                          <span>Transcription Result</span>
                        </div>
                        <p className={styles.transcriptionText}>{transcription}</p>
                        <button 
                          className={styles.copyBtn}
                          onClick={() => {
                            setOfflineInput(transcription);
                            setActiveTool('offline-ai');
                          }}
                        >
                          Send to Comprehension Check
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTool === 'offline-ai' ? (
              <motion.div
                key="offline-ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.offlineTool}
              >
                <div className={styles.toolHeader}>
                  <div className={styles.toolTitleGroup}>
                    <Cpu className={styles.titleIcon} style={{ color: '#f97316' }} />
                    <div>
                      <h2 className={styles.contentTitle}>Offline AI: Comprehension Check</h2>
                      <p className={styles.contentSubtitle}>Run sentiment analysis models locally in your browser.</p>
                    </div>
                  </div>
                  <div className={styles.modelStatus}>
                    <div className={`${styles.statusDot} ${styles[modelStatus]}`} />
                    <span>Model: {modelStatus.charAt(0).toUpperCase() + modelStatus.slice(1)}</span>
                  </div>
                </div>

                <div className={styles.offlineWorkspace}>
                  <div className={styles.workspaceContent}>
                    <div className={styles.infoBox}>
                      <AlertCircle size={20} />
                      <p>This tool uses <strong>Transformers.js</strong> to run models entirely on your device. The first run will download a small model (~20MB) which will then be cached for offline use.</p>
                    </div>

                    <div className={styles.answerArea}>
                      <label className={styles.displayLabel}>Enter text to analyze understanding:</label>
                      <textarea 
                        placeholder="e.g., 'I finally understand how the quadratic formula works, it's actually quite logical!'"
                        value={offlineInput}
                        onChange={(e) => setOfflineInput(e.target.value)}
                        rows={5}
                      />
                      <div className={styles.answerActions}>
                        <button 
                          className={styles.analyzeBtn}
                          style={{ background: '#f97316' }}
                          onClick={handleOfflineAnalyze}
                          disabled={isOfflineLoading || !offlineInput.trim()}
                        >
                          {isOfflineLoading ? (
                            <>
                              <RefreshCw className={styles.spin} size={18} />
                              <span>Processing Locally...</span>
                            </>
                          ) : (
                            <>
                              <Zap size={18} />
                              <span>Analyze Offline</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {offlineResult && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`${styles.offlineResult} ${offlineResult.isPositive ? styles.positive : styles.negative}`}
                      >
                        <div className={styles.resultHeader}>
                          {offlineResult.isPositive ? <Trophy size={24} /> : <MessageCircle size={24} />}
                          <h4>{offlineResult.isPositive ? 'Positive Comprehension' : 'Needs Review'}</h4>
                          <span className={styles.confidence}>{(offlineResult.confidence * 100).toFixed(1)}% Confidence</span>
                        </div>
                        <p className={styles.resultFeedback}>{offlineResult.feedback}</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="other-tool"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.placeholderTool}
              >
                <div className={styles.emptyWorkspace}>
                  <Sparkles size={48} />
                  <h3>{AI_TOOLS.find(t => t.id === activeTool)?.name}</h3>
                  <p>This tool is currently being optimized for the Zimbabwean Heritage-Based Curriculum. Check back soon for the full release!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
