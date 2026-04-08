import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Hammer, 
  Calculator, 
  ShieldCheck, 
  ArrowLeft, 
  Download, 
  Share2, 
  Loader2,
  Sparkles,
  Zap,
  Sprout,
  Car,
  ChefHat,
  Scissors,
  History,
  BookOpen,
  Play,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Eye,
  EyeOff,
  Users,
  X,
  ListChecks,
  ShieldAlert,
  ArrowRightCircle,
  BrainCircuit
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import TrainerAI from '../components/TrainerAI';
import styles from './VocationalTools.module.css';

const TRADES = [
  { id: 'construction', name: 'Building & Construction', icon: Hammer },
  { id: 'engineering', name: 'Mechanical Engineering', icon: Wrench },
  { id: 'electrical', name: 'Electrical & Electronics', icon: Zap },
  { id: 'automotive', name: 'Motor Mechanics', icon: Car },
  { id: 'agriculture', name: 'Agriculture & Horticulture', icon: Sprout },
  { id: 'hospitality', name: 'Hospitality & Tourism', icon: ChefHat },
  { id: 'textiles', name: 'Textiles & Fashion', icon: Scissors }
];

const FLOW_STEPS = [
  { id: 'tasks', label: 'Tasks', icon: BookOpen },
  { id: 'steps', label: 'Steps', icon: Play },
  { id: 'practice', label: 'Practice', icon: Hammer },
  { id: 'test', label: 'Test', icon: CheckCircle2 }
];

export default function VocationalTools() {
  const [activeTool, setActiveTool] = useState('skill-lab'); // 'skill-lab', 'guide', or 'estimator'
  const [activeFlow, setActiveFlow] = useState('tasks');
  const [workshopMode, setWorkshopMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [flowResults, setFlowResults] = useState({ tasks: '', steps: '', practice: '', test: '' });
  const [assistResult, setAssistResult] = useState('');
  const [assistLoading, setAssistLoading] = useState(false);
  
  // Progress Tracking
  const [progress, setProgress] = useState({});

  // Form States
  const [trade, setTrade] = useState(TRADES[0].id);
  const [skill, setSkill] = useState('');
  const [level, setLevel] = useState('NC'); // National Certificate
  const [resources, setResources] = useState('');
  const [project, setProject] = useState('');
  const [scale, setScale] = useState('Medium/Group');

  useEffect(() => {
    const savedProgress = localStorage.getItem('vocational_progress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  const updateProgress = (skillId, step) => {
    const newProgress = { ...progress };
    if (!newProgress[skillId]) newProgress[skillId] = { tasks: false, steps: false, practice: false, test: false };
    newProgress[skillId][step] = true;
    setProgress(newProgress);
    localStorage.setItem('vocational_progress', JSON.stringify(newProgress));
  };

  const calculateProgress = (skillId) => {
    if (!progress[skillId]) return 0;
    const steps = progress[skillId];
    const completed = Object.values(steps).filter(Boolean).length;
    return Math.round((completed / 4) * 100);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text || result);
    alert('Copied to clipboard!');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    setFlowResults({ tasks: '', steps: '', practice: '', test: '' });
    try {
      if (activeTool === 'skill-lab') {
        const tasks = await geminiService.generateVocationalSkillModule({
          trade: TRADES.find(t => t.id === trade)?.name || trade,
          skill,
          level,
          part: 'tasks'
        });
        const steps = await geminiService.generateVocationalSkillModule({
          trade: TRADES.find(t => t.id === trade)?.name || trade,
          skill,
          level,
          part: 'steps'
        });
        const practice = await geminiService.generateVocationalSkillModule({
          trade: TRADES.find(t => t.id === trade)?.name || trade,
          skill,
          level,
          part: 'practice'
        });
        const test = await geminiService.generateVocationalSkillModule({
          trade: TRADES.find(t => t.id === trade)?.name || trade,
          skill,
          level,
          part: 'test'
        });
        setFlowResults({ tasks, steps, practice, test });
        setResult(tasks); // Default to tasks
        setActiveFlow('tasks');
      } else if (activeTool === 'guide') {
        const output = await geminiService.generateVocationalGuide({
          trade: TRADES.find(t => t.id === trade)?.name || trade,
          skill,
          level,
          resources
        });
        setResult(output);
      } else {
        const output = await geminiService.generateProjectEstimator({
          project,
          trade: TRADES.find(t => t.id === trade)?.name || trade,
          scale
        });
        setResult(output);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setResult('### Error\nFailed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssist = async (action, contextOverride = null) => {
    try {
      setAssistLoading(true);
      const context = contextOverride || flowResults[activeFlow] || skill;
      const result = await geminiService.vocationalAssist({
        action,
        trade: TRADES.find(t => t.id === trade)?.name || trade,
        skill,
        context
      });
      setFlowResults(prev => ({
        ...prev,
        [activeFlow]: prev[activeFlow] + "\n\n### Trainer AI Advice\n" + result
      }));
    } catch (err) {
      console.error('Assist failed:', err);
    } finally {
      setAssistLoading(false);
    }
  };

  const skillId = `${trade}-${skill.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {/* Real Book Background Image */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.25
        }}>
          <img 
            src="https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=2000" 
            alt="Vocational Tools Background" 
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            referrerPolicy="no-referrer"
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(45, 34, 28, 0.8), var(--soil))"
          }} />
        </div>

        <Link to="/vocational" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Vocational Portal
        </Link>
        <h1 className={styles.title}>Vocational Skills Lab</h1>
        <p className={styles.subtitle}>AI-powered practical guides and project tools for Zimbabwe's technical excellence.</p>
      </header>

      <main className={styles.main}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <button 
              className={`${styles.navItem} ${activeTool === 'skill-lab' ? styles.active : ''}`}
              onClick={() => setActiveTool('skill-lab')}
            >
              <Zap size={20} /> Skill Learning Lab
            </button>
            <button 
              className={`${styles.navItem} ${activeTool === 'guide' ? styles.active : ''}`}
              onClick={() => setActiveTool('guide')}
            >
              <ShieldCheck size={20} /> Practical Skill Guide
            </button>
            <button 
              className={`${styles.navItem} ${activeTool === 'estimator' ? styles.active : ''}`}
              onClick={() => setActiveTool('estimator')}
            >
              <Calculator size={20} /> Project Cost Estimator
            </button>
          </nav>

          <div className={styles.formCard}>
            <div className={styles.formGroup}>
              <label>Select Trade</label>
              <select value={trade} onChange={(e) => setTrade(e.target.value)}>
                {TRADES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {activeTool !== 'estimator' ? (
              <>
                <div className={styles.formGroup}>
                  <label>Specific Skill (e.g., Arc Welding)</label>
                  <input 
                    type="text" 
                    placeholder="What skill are we teaching?"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Level</label>
                  <select value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="Foundation">Foundation/Short Course</option>
                    <option value="NC">National Certificate (NC)</option>
                    <option value="ND">National Diploma (ND)</option>
                    <option value="HND">Higher National Diploma (HND)</option>
                  </select>
                </div>
                {activeTool === 'guide' && (
                  <div className={styles.formGroup}>
                    <label>Available Workshop Resources</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Basic hand tools, scrap metal"
                      value={resources}
                      onChange={(e) => setResources(e.target.value)}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.formGroup}>
                  <label>Project Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Solar Water Heater"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Project Scale</label>
                  <select value={scale} onChange={(e) => setScale(e.target.value)}>
                    <option value="Small/Individual">Small/Individual</option>
                    <option value="Medium/Group">Medium/Group</option>
                    <option value="Large/Commercial">Large/Commercial</option>
                  </select>
                </div>
              </>
            )}

            <button 
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={loading || (activeTool !== 'estimator' ? !skill : !project)}
            >
              {loading ? (
                <Loader2 size={20} className={styles.spin} />
              ) : (
                <Sparkles size={20} />
              )}
              {loading ? 'Generating...' : `Start ${activeTool === 'skill-lab' ? 'Learning' : 'HBC Tool'}`}
            </button>
          </div>

          {skill && activeTool === 'skill-lab' && (
            <div className={styles.formCard}>
              <div className={styles.skillProgress}>
                <div className={styles.progressText}>
                  <span>Skill Progress</span>
                  <span>{calculateProgress(skillId)}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${calculateProgress(skillId)}%` }} 
                  />
                </div>
              </div>
            </div>
          )}

          <div className={styles.hbcInfo}>
            <h3 className={styles.hbcTitle}>
              <Zap size={16} className="text-amber-500" /> Education 5.0 Focus
            </h3>
            <ul className={styles.hbcList}>
              <li>Production-oriented tasks</li>
              <li>Local material substitution</li>
              <li>Industrial safety standards</li>
              <li>Professional Unhu/Ubuntu</li>
            </ul>
          </div>
        </aside>

        <section className={styles.content}>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.placeholder}
              >
                <div className={styles.placeholderIcon}>
                  {activeTool === 'guide' ? <ShieldCheck size={64} /> : activeTool === 'estimator' ? <Calculator size={64} /> : <Zap size={64} />}
                </div>
                <h2>Ready to Build?</h2>
                <p>Select a trade and provide details to generate HBC-aligned vocational resources.</p>
                <div className={styles.features}>
                  <div className={styles.feature}><Zap size={16} /> Practical</div>
                  <div className={styles.feature}><Hammer size={16} /> Hands-on</div>
                  <div className={styles.feature}><Sprout size={16} /> Sustainable</div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.resultCard}
              >
                <div className={styles.resultHeader}>
                  <span className={styles.resultBadge}>
                    {activeTool === 'skill-lab' ? 'SKILL LEARNING LAB' : 'HBC VOCATIONAL TOOL'}
                  </span>
                  <div className={styles.resultActions}>
                    <button className={styles.iconBtn} onClick={() => copyToClipboard()} title="Copy to Clipboard"><History size={18} /></button>
                    <button className={styles.iconBtn} title="Download PDF"><Download size={18} /></button>
                    <button className={styles.iconBtn} title="Share"><Share2 size={18} /></button>
                  </div>
                </div>

                {activeTool === 'skill-lab' && (
                  <div className={styles.learningFlow}>
                    {FLOW_STEPS.map(step => (
                      <button
                        key={step.id}
                        className={`${styles.flowTab} ${activeFlow === step.id ? styles.active : ''}`}
                        onClick={() => {
                          setActiveFlow(step.id);
                          setResult(flowResults[step.id]);
                          updateProgress(skillId, step.id);
                        }}
                      >
                        <step.icon size={18} />
                        {step.label}
                      </button>
                    ))}
                  </div>
                )}

                {activeFlow === 'steps' && (
                  <div className={styles.quickActions}>
                    <button className={styles.showHowBtn} onClick={() => handleAssist('show_how')}>
                      <Play size={18} /> Show Me How
                    </button>
                  </div>
                )}

                {activeFlow === 'practice' && (
                  <div className={styles.quickActions}>
                    <button className={styles.tryTaskBtn} onClick={() => handleAssist('try_task')}>
                      <Zap size={18} /> Try This Task
                    </button>
                  </div>
                )}

                <div className={styles.markdownBody}>
                  {workshopMode && activeFlow === 'steps' ? (
                    <Markdown>
                      {result.split('\n').filter(line => 
                        line.toLowerCase().includes('step') || 
                        line.toLowerCase().includes('tool') || 
                        line.toLowerCase().includes('safety') ||
                        line.toLowerCase().includes('material') ||
                        line.startsWith('#') ||
                        line.startsWith('##')
                      ).join('\n')}
                    </Markdown>
                  ) : (
                    <>
                      <Markdown>{result}</Markdown>
                      {activeFlow === 'test' && (
                        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Sparkles className="text-amber-600" size={24} />
                            <div>
                              <h4 className="font-bold text-amber-900">Ready for a real challenge?</h4>
                              <p className="text-sm text-amber-700">Start an interactive AI-powered quiz on this skill.</p>
                            </div>
                          </div>
                          <button 
                            className="w-full sm:w-auto px-6 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors shadow-lg"
                            onClick={() => handleAssist('quiz')}
                          >
                            Start Interactive Quiz
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {activeTool === 'skill-lab' && (
                  <div className={styles.dareAssist}>
                    <h3 style={{ gridColumn: '1 / -1', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={20} className="text-amber-500" />
                      Trainer AI Assistant
                    </h3>
                    <button className={styles.assistBtn} onClick={() => handleAssist('steps')}>
                      <ListChecks size={20} /> Show Steps
                    </button>
                    <button className={styles.assistBtn} onClick={() => handleAssist('fix_mistake')}>
                      <AlertTriangle size={20} /> Fix Mistake
                    </button>
                    <button className={styles.assistBtn} onClick={() => handleAssist('safety_tips')}>
                      <ShieldAlert size={20} /> Safety Tips
                    </button>
                    <button className={styles.assistBtn} onClick={() => handleAssist('next_task')}>
                      <ArrowRightCircle size={20} /> Next Task
                    </button>
                    <button className={styles.assistBtn} onClick={() => handleAssist('explain')}>
                      <HelpCircle size={20} /> Explain Concept
                    </button>
                    <button className={styles.assistBtn} onClick={() => handleAssist('quiz')}>
                      <BrainCircuit size={20} /> Quiz Me
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {assistResult && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={styles.interactiveQuestion}
                    >
                      <div className="flex items-center gap-2 mb-2 text-amber-600 font-bold">
                        <Sparkles size={18} /> DARE ASSIST
                      </div>
                      <div className={styles.markdownBody}>
                        <Markdown>{assistResult}</Markdown>
                      </div>
                      <div className={styles.questionActions}>
                        <button className={`${styles.actionBtn} ${styles.primaryAction}`} onClick={() => setAssistResult('')}>Got it!</button>
                        <button className={`${styles.actionBtn} ${styles.secondaryAction}`} onClick={() => handleAssist('quiz')}>
                          {assistResult.toLowerCase().includes('?') ? 'Show Solution' : 'Ask AI Again'}
                        </button>
                        <button className={`${styles.actionBtn} ${styles.secondaryAction}`} onClick={() => handleAssist('explain')}>
                          Ask AI
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
      {/* Floating Trainer AI Assistant */}
      <TrainerAI 
        trade={TRADES.find(t => t.id === trade)?.name}
        skill={skill}
        context={flowResults[activeFlow] || result}
        level={level}
      />
    </div>
  );
}
