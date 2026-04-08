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
  ArrowLeft,
  MessageSquare,
  Hammer,
  Heart as HeartIcon,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import HBCLessonPlannerAssistant from '../components/tools/HBCLessonPlannerAssistant';
import HBCTeachingAidAssistant from '../components/tools/HBCTeachingAidAssistant';
import HBCAssessmentAssistant from '../components/tools/HBCAssessmentAssistant';
import UnhuRubricAssistant from '../components/tools/UnhuRubricAssistant';
import HBCRemedialAssistant from '../components/tools/HBCRemedialAssistant';
import styles from './TeacherTools.module.css';

export default function TeacherTools() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const greenBookUrl = "https://green-book-hbc-assistant-865320790103.us-west1.run.app/";
  
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
    if (activeTab === 'resources') recommendResources();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/lecturer-dashboard" className={styles.backLink}>
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <div className={styles.headerTitleGroup}>
            <div className="flex items-center gap-3">
              <h1 className={styles.title}>HBC Alignment Tools</h1>
              <span className={styles.hbcBadge}>
                HBC 5.0 Certified
              </span>
            </div>
            <p className={styles.subtitle}>Interactive Heritage-Based Curriculum (HBC) Alignment Studio</p>
          </div>
        </div>
        
        <div className={styles.xpContainer}>
          <div className={styles.xpHeader}>
            <span className={styles.xpLabel}>Teacher Level 12</span>
            <span className={styles.xpValue}>2,450 / 3,000 XP</span>
          </div>
          <div className={styles.xpBarBackground}>
            <motion.div 
              className={styles.xpBarFill}
              initial={{ width: 0 }}
              animate={{ width: '82%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.sidebar}>
          <nav className={styles.nav}>
            <button 
              className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
              onClick={() => { setActiveTab('dashboard'); setResult(''); }}
            >
              <div className={styles.navItemContent}>
                <GraduationCap size={20} />
                <span>Teacher Dashboard</span>
              </div>
              <span className={styles.tabBadge}>Home</span>
              <div className={styles.xpBar} style={{ width: '100%' }} />
            </button>

            <div className={styles.navDivider}>HBC TOOLS</div>

            <button 
              className={`${styles.navItem} ${activeTab === 'lesson-plan' ? styles.active : ''}`}
              onClick={() => { setActiveTab('lesson-plan'); setResult(''); }}
            >
              <div className={styles.navItemContent}>
                <FileText size={20} />
                <span>HBC Lesson Planner</span>
              </div>
              <span className={styles.tabBadge}>Pro</span>
              <div className={styles.xpBar} />
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'teaching-aid' ? styles.active : ''}`}
              onClick={() => { setActiveTab('teaching-aid'); setResult(''); }}
            >
              <div className={styles.navItemContent}>
                <Hammer size={20} />
                <span>HBC Teaching Aid Guide</span>
              </div>
              <span className={styles.tabBadge}>New</span>
              <div className={styles.xpBar} />
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'assessment' ? styles.active : ''}`}
              onClick={() => { setActiveTab('assessment'); setResult(''); }}
            >
              <div className={styles.navItemContent}>
                <CheckCircle size={20} />
                <span>HBC Assessment Specialist</span>
              </div>
              <span className={styles.tabBadge}>Core</span>
              <div className={styles.xpBar} />
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'unhu' ? styles.active : ''}`}
              onClick={() => { setActiveTab('unhu'); setResult(''); }}
            >
              <div className={styles.navItemContent}>
                <HeartIcon size={20} className={styles.unhuIcon} />
                <span>Unhu/Ubuntu Specialist</span>
              </div>
              <span className={styles.tabBadge}>Ethos</span>
              <div className={styles.xpBar} />
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'remedial' ? styles.active : ''}`}
              onClick={() => { setActiveTab('remedial'); setResult(''); }}
            >
              <div className={styles.navItemContent}>
                <Zap size={20} className={styles.remedialIcon} />
                <span>HBC Inclusivity Specialist</span>
              </div>
              <span className={styles.tabBadge}>Boost</span>
              <div className={styles.xpBar} />
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'resources' ? styles.active : ''}`}
              onClick={() => { setActiveTab('resources'); setResult(''); }}
            >
              <div className={styles.navItemContent}>
                <BookOpen size={20} />
                <span>Resource Recommender</span>
              </div>
              <span className={styles.tabBadge}>Beta</span>
              <div className={styles.xpBar} />
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'green-book' ? styles.active : ''}`}
              onClick={() => { setActiveTab('green-book'); setResult(''); }}
            >
              <div className={styles.navItemContent}>
                <Wand2 size={20} className={styles.greenBookIcon} />
                <span>Green Book Assistant</span>
              </div>
              <span className={styles.tabBadge}>Live</span>
              <div className={styles.xpBar} style={{ width: '45%' }} />
            </button>
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.footerXp}>
              <div className={styles.footerXpHeader}>
                <span className={styles.footerXpLabel}>Weekly Goal</span>
                <span className={styles.footerXpValue}>85%</span>
              </div>
              <div className={styles.footerXpBar}>
                <div className={styles.footerXpFill} style={{ width: '85%' }} />
              </div>
            </div>
            <div className={styles.badges}>
              <div className={styles.badgeIcon} title="Early Adopter">🏅</div>
              <div className={styles.badgeIcon} title="HBC Expert">🎓</div>
              <div className={styles.badgeIcon} title="Top Contributor">⭐</div>
            </div>
          </div>

          {activeTab === 'resources' && (
            <>
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

                <button 
                  className={styles.generateBtn} 
                  onClick={handleGenerate}
                  disabled={loading || !formData.subject || !formData.topic}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className={styles.spin} />
                      Searching Library...
                    </>
                  ) : (
                    <>
                      <Wand2 size={18} />
                      Find Resources
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
            </>
          )}
        </div>

        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {activeTab === 'lesson-plan' ? (
              <motion.div
                key="lesson-plan-assistant"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={styles.assistantWrapper}
              >
                <HBCLessonPlannerAssistant initialData={formData.subject && formData.topic ? formData : null} />
              </motion.div>
            ) : activeTab === 'teaching-aid' ? (
              <motion.div
                key="teaching-aid-assistant"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={styles.assistantWrapper}
              >
                <HBCTeachingAidAssistant initialData={formData.subject && formData.topic ? formData : null} />
              </motion.div>
            ) : activeTab === 'assessment' ? (
              <motion.div
                key="assessment-assistant"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={styles.assistantWrapper}
              >
                <HBCAssessmentAssistant initialData={formData.subject && formData.topic ? formData : null} />
              </motion.div>
            ) : activeTab === 'unhu' ? (
              <motion.div
                key="unhu-assistant"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={styles.assistantWrapper}
              >
                <UnhuRubricAssistant initialData={formData.subject && formData.topic ? formData : null} />
              </motion.div>
            ) : activeTab === 'remedial' ? (
              <motion.div
                key="remedial-assistant"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={styles.assistantWrapper}
              >
                <HBCRemedialAssistant initialData={formData.subject && formData.topic ? formData : null} />
              </motion.div>
            ) : activeTab === 'green-book' ? (
              <motion.div
                key="green-book"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={styles.iframeContainer}
              >
                <div className={styles.iframeHeader}>
                  <div className={styles.iframeTitle}>
                    <Wand2 size={18} className={styles.greenBookIcon} />
                    <h3>Green Book HBC Assistant</h3>
                  </div>
                  <a href={greenBookUrl} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                    Open in New Tab <Share2 size={14} />
                  </a>
                </div>
                <iframe 
                  src={greenBookUrl} 
                  className={styles.iframe}
                  title="Green Book HBC Assistant"
                  allow="camera; microphone; geolocation"
                />
              </motion.div>
            ) : result ? (
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
            ) : activeTab === 'resources' && !result ? (
              <motion.div 
                key="resources-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.toolPlaceholder}
              >
                <div className={styles.placeholderIcon}>
                  <BookOpen size={64} />
                </div>
                <h2>Resource Recommender</h2>
                <p>Enter a subject and topic in the sidebar to find aligned books and materials from the Dare Digital Library.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.dashboard}
              >
                <div className={styles.dashboardHeader}>
                  {/* Real Book Background Image */}
                  <div className="absolute inset-0 z-0 opacity-10">
                    <img 
                      src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&q=80&w=2000" 
                      alt="Dashboard Background" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-subtle via-transparent to-bg-subtle" />
                  </div>

                  <div className={`${styles.welcomeSection} relative z-10`}>
                    <h2>Welcome back, Mufundisi!</h2>
                    <p>Your Heritage-Based Curriculum assistant is ready.</p>
                  </div>
                  <div className={`${styles.statsGrid} relative z-10`}>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Total XP</span>
                      <span className={styles.statValue}>12,450</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Certifications</span>
                      <span className={styles.statValue}>5</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Daily Goal</span>
                      <span className={styles.statValue}>85%</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Rank</span>
                      <span className={styles.statValue}>#12</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.dashboardGrid}>
                  <div className={styles.greenBookPromo} onClick={() => setActiveTab('green-book')}>
                    <div className={styles.promoContent}>
                      <div className={styles.promoIcon}>
                        <Wand2 size={24} />
                      </div>
                      <div>
                        <h4>Green Book HBC Assistant</h4>
                        <p>Our most advanced Heritage-Based Curriculum planning tool.</p>
                      </div>
                    </div>
                    <button className={styles.promoBtn}>Launch Assistant</button>
                  </div>

                  <div className={styles.quickActions}>
                    <h3>Quick Actions</h3>
                    <div className={styles.actionButtons}>
                      <button onClick={() => setActiveTab('lesson-plan')} className={styles.actionBtn}>
                        <FileText size={18} /> New Lesson Plan
                      </button>
                      <button onClick={() => setActiveTab('assessment')} className={styles.actionBtn}>
                        <CheckCircle size={18} /> Create Assessment
                      </button>
                      <button onClick={() => setActiveTab('unhu')} className={styles.actionBtn}>
                        <HeartIcon size={18} /> Unhu Reflection
                      </button>
                    </div>
                  </div>
                </div>

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
