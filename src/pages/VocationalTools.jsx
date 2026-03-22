import { useState } from 'react';
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
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import styles from './TeacherTools.module.css'; // Reusing styles for consistency

const TRADES = [
  { id: 'construction', name: 'Building & Construction', icon: Hammer },
  { id: 'engineering', name: 'Mechanical Engineering', icon: Wrench },
  { id: 'electrical', name: 'Electrical & Electronics', icon: Zap },
  { id: 'automotive', name: 'Motor Mechanics', icon: Car },
  { id: 'agriculture', name: 'Agriculture & Horticulture', icon: Sprout },
  { id: 'hospitality', name: 'Hospitality & Tourism', icon: ChefHat },
  { id: 'textiles', name: 'Textiles & Fashion', icon: Scissors }
];

export default function VocationalTools() {
  const [activeTool, setActiveTool] = useState('guide'); // 'guide' or 'estimator'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  
  // Form States
  const [trade, setTrade] = useState(TRADES[0].id);
  const [skill, setSkill] = useState('');
  const [level, setLevel] = useState('NC'); // National Certificate
  const [resources, setResources] = useState('');
  const [project, setProject] = useState('');
  const [scale, setScale] = useState('Medium/Group');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert('Copied to clipboard!');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    try {
      let output = '';
      if (activeTool === 'guide') {
        output = await geminiService.generateVocationalGuide({
          trade: TRADES.find(t => t.id === trade)?.name || trade,
          skill,
          level,
          resources
        });
      } else {
        output = await geminiService.generateProjectEstimator({
          project,
          trade: TRADES.find(t => t.id === trade)?.name || trade,
          scale
        });
      }
      setResult(output);
    } catch (error) {
      console.error('Generation failed:', error);
      setResult('### Error\nFailed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
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

            {activeTool === 'guide' ? (
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
                <div className={styles.formGroup}>
                  <label>Available Workshop Resources</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Basic hand tools, scrap metal"
                    value={resources}
                    onChange={(e) => setResources(e.target.value)}
                  />
                </div>
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
              disabled={loading || (activeTool === 'guide' ? !skill : !project)}
            >
              {loading ? (
                <Loader2 size={20} className={styles.spin} />
              ) : (
                <Sparkles size={20} />
              )}
              {loading ? 'Generating...' : 'Generate HBC Tool'}
            </button>
          </div>

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
                  {activeTool === 'guide' ? <ShieldCheck size={64} /> : <Calculator size={64} />}
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
                  <span className={styles.resultBadge}>HBC VOCATIONAL TOOL</span>
                  <div className={styles.resultActions}>
                    <button className={styles.iconBtn} onClick={copyToClipboard} title="Copy to Clipboard"><History size={18} /></button>
                    <button className={styles.iconBtn} title="Download PDF"><Download size={18} /></button>
                    <button className={styles.iconBtn} title="Share"><Share2 size={18} /></button>
                  </div>
                </div>
                <div className={styles.markdownBody}>
                  <Markdown>{result}</Markdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
