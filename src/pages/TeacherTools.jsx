import { useState } from 'react';
import { 
  Wand2, 
  FileText, 
  CheckCircle, 
  Download, 
  Share2, 
  RefreshCw,
  BookOpen,
  GraduationCap,
  History,
  Lightbulb,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import styles from './TeacherTools.module.css';

export default function TeacherTools() {
  const [activeTab, setActiveTab] = useState('lesson-plan');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  
  // Form States
  const [formData, setFormData] = useState({
    subject: '',
    level: 'Secondary',
    topic: '',
    duration: '40 minutes',
    resources: '',
    type: 'Quiz'
  });

  const [recommendations, setRecommendations] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert('Copied to clipboard!');
  };

  const generateLessonPlan = async () => {
    if (!formData.subject || !formData.topic) return;
    setLoading(true);
    setResult('');
    setRecommendations([]);
    try {
      const plan = await geminiService.generateLessonPlan(formData);
      setResult(plan);
    } catch (error) {
      console.error(error);
      setResult('Error generating lesson plan. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateAssessment = async () => {
    if (!formData.subject || !formData.topic) return;
    setLoading(true);
    setResult('');
    setRecommendations([]);
    try {
      const assessment = await geminiService.generateAssessment(formData);
      setResult(assessment);
    } catch (error) {
      console.error(error);
      setResult('Error generating assessment. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const recommendResources = async () => {
    if (!formData.subject || !formData.topic) return;
    setLoading(true);
    setResult('');
    setRecommendations([]);
    try {
      // Search for books in Supabase based on subject and topic
      const { data, error } = await geminiService.searchBooks(`${formData.subject} ${formData.topic}`);
      
      const { data: books, error: searchError } = await supabase
        .from('books')
        .select('*')
        .or(`title.ilike.%${formData.subject}%,description.ilike.%${formData.subject}%,faculty.eq.${data.faculty}`)
        .limit(5);

      if (searchError) throw searchError;
      
      setRecommendations(books || []);
      setResult(`## Recommended Resources for ${formData.topic}\n\nI have found ${books?.length || 0} relevant resources in the Dare Digital Library that align with your topic.`);
    } catch (error) {
      console.error(error);
      setResult('Error finding resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (activeTab === 'lesson-plan') generateLessonPlan();
    else if (activeTab === 'assessment') generateAssessment();
    else if (activeTab === 'resources') recommendResources();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/lecturer-dashboard" className={styles.backLink}>
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>DARA Teacher Tools</h1>
          <p className={styles.subtitle}>Interactive Heritage-Based Curriculum (HBC) Alignment Studio</p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.sidebar}>
          <nav className={styles.nav}>
            <button 
              className={`${styles.navItem} ${activeTab === 'lesson-plan' ? styles.active : ''}`}
              onClick={() => { setActiveTab('lesson-plan'); setResult(''); }}
            >
              <FileText size={20} />
              <span>HBC Lesson Planner</span>
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'assessment' ? styles.active : ''}`}
              onClick={() => { setActiveTab('assessment'); setResult(''); }}
            >
              <CheckCircle size={20} />
              <span>Interactive Assessment</span>
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'resources' ? styles.active : ''}`}
              onClick={() => { setActiveTab('resources'); setResult(''); }}
            >
              <BookOpen size={20} />
              <span>Resource Recommender</span>
            </button>
          </nav>

          <div className={styles.formCard}>
            <div className={styles.formGroup}>
              <label>Subject</label>
              <input 
                type="text" 
                name="subject"
                placeholder="e.g. Agriculture, History" 
                value={formData.subject}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Level</label>
              <select name="level" value={formData.level} onChange={handleInputChange}>
                <option>Primary</option>
                <option>Secondary</option>
                <option>Teachers College</option>
                <option>University</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Topic</label>
              <input 
                type="text" 
                name="topic"
                placeholder="e.g. Soil Erosion, Liberation War" 
                value={formData.topic}
                onChange={handleInputChange}
              />
            </div>
            {activeTab === 'lesson-plan' && (
              <div className={styles.formGroup}>
                <label>Duration</label>
                <input 
                  type="text" 
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </div>
            )}
            {activeTab === 'assessment' && (
              <div className={styles.formGroup}>
                <label>Assessment Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange}>
                  <option>Quiz</option>
                  <option>Structured Questions</option>
                  <option>Practical Task</option>
                  <option>Unhu/Ubuntu Reflection</option>
                </select>
              </div>
            )}

            <button 
              className={styles.generateBtn} 
              onClick={handleGenerate}
              disabled={loading || !formData.subject || !formData.topic}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className={styles.spin} />
                  {activeTab === 'resources' ? 'Searching Library...' : 'Aligning with HBC...'}
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  {activeTab === 'lesson-plan' ? 'Generate Lesson Plan' : 
                   activeTab === 'assessment' ? 'Generate Assessment' : 'Find Resources'}
                </>
              )}
            </button>
          </div>

          <div className={styles.hbcInfo}>
            <h3 className={styles.hbcTitle}>
              <Lightbulb size={16} /> HBC Alignment Tips
            </h3>
            <ul className={styles.hbcList}>
              <li>Integrate <strong>Unhu/Ubuntu</strong> values.</li>
              <li>Use <strong>Local Resources</strong> from the environment.</li>
              <li>Focus on <strong>Production & Innovation</strong>.</li>
              <li>Connect to <strong>Zimbabwean Heritage</strong>.</li>
            </ul>
          </div>
        </div>

        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={styles.resultCard}
              >
                <div className={styles.resultHeader}>
                  <div className={styles.resultBadge}>HBC ALIGNED</div>
                  <div className={styles.resultActions}>
                    <button className={styles.iconBtn} onClick={copyToClipboard} title="Copy to Clipboard"><History size={18} /></button>
                    <button className={styles.iconBtn} title="Download PDF"><Download size={18} /></button>
                    <button className={styles.iconBtn} title="Share with Department"><Share2 size={18} /></button>
                  </div>
                </div>
                <div className={styles.markdownBody}>
                  <Markdown>{result}</Markdown>
                  
                  {activeTab === 'resources' && recommendations.length > 0 && (
                    <div className={styles.recommendationList}>
                      {recommendations.map(book => (
                        <Link key={book.id} to={`/book/${book.id}`} className={styles.recommendationCard}>
                          <img src={book.cover_url || `https://picsum.photos/seed/${book.id}/200/300`} alt={book.title} referrerPolicy="no-referrer" />
                          <div className={styles.recommendationInfo}>
                            <h4>{book.title}</h4>
                            <p>{book.author}</p>
                            <span className={styles.badge}>{book.faculty}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.placeholder}
              >
                <div className={styles.placeholderIcon}>
                  <GraduationCap size={64} />
                </div>
                <h2>Ready to assist, Mufundisi.</h2>
                <p>Fill in the details on the left to generate interactive, Heritage-Based Curriculum materials.</p>
                <div className={styles.features}>
                  <div className={styles.feature}>
                    <CheckCircle size={16} />
                    <span>ZIMSEC & HBC Aligned</span>
                  </div>
                  <div className={styles.feature}>
                    <CheckCircle size={16} />
                    <span>Interactive Pedagogy</span>
                  </div>
                  <div className={styles.feature}>
                    <CheckCircle size={16} />
                    <span>Local Context Guaranteed</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
