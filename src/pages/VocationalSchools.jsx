import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  MapPin, 
  ExternalLink, 
  GraduationCap, 
  Users, 
  Building2,
  Cpu,
  Hammer,
  Zap,
  Car,
  ChefHat,
  Scissors,
  Sprout,
  AlertCircle
} from 'lucide-react';
import { vocationalService } from '../services/vocationalService';
import styles from './VocationalSchools.module.css';

const SCHOOLS = [
  {
    id: 'hpt',
    name: 'Harare Polytechnic',
    location: 'Harare',
    type: 'polytechnic',
    description: 'The oldest and largest technical college in Zimbabwe, offering a wide range of engineering, business, and applied arts programs.',
    programs: ['Engineering', 'ICT', 'Business', 'Applied Arts', 'Mass Comm'],
    icon: Building2
  },
  {
    id: 'bpt',
    name: 'Bulawayo Polytechnic',
    location: 'Bulawayo',
    type: 'polytechnic',
    description: 'A leading technical institution in the southern region, known for its strong engineering and hospitality departments.',
    programs: ['Mechanical Eng', 'Electrical Eng', 'Hospitality', 'Commerce'],
    icon: Hammer
  },
  {
    id: 'kpt',
    name: 'Kwekwe Polytechnic',
    location: 'Kwekwe',
    type: 'polytechnic',
    description: 'Strategically located in the industrial hub, specializing in mining and heavy engineering skills.',
    programs: ['Mining Eng', 'Metallurgy', 'Automotive', 'Science Tech'],
    icon: Zap
  },
  {
    id: 'mpt',
    name: 'Mutare Polytechnic',
    location: 'Mutare',
    type: 'polytechnic',
    description: 'Providing technical and vocational training with a focus on sustainable development and industrial skills.',
    programs: ['Civil Eng', 'Wood Tech', 'Fashion', 'Tourism'],
    icon: Sprout
  },
  {
    id: 'msvtc',
    name: 'Mupfure Self-Help College',
    location: 'Chegutu',
    type: 'vocational',
    description: 'A unique vocational centre focusing on self-reliance and entrepreneurial skills for rural development.',
    programs: ['Agriculture', 'Building', 'Textiles', 'Metalwork'],
    icon: Hammer
  },
  {
    id: 'kvtc',
    name: 'Kaguvi VTC',
    location: 'Gweru',
    type: 'vocational',
    description: 'Specializing in youth empowerment through practical skills training in various trades.',
    programs: ['Bricklaying', 'Carpentry', 'Plumbing', 'Motor Mechanics'],
    icon: Wrench
  }
];

const STATS = [
  { number: '15+', label: 'Polytechnics', icon: Building2 },
  { number: '40+', label: 'Vocational Centres', icon: Wrench },
  { number: '50k+', label: 'Annual Graduates', icon: GraduationCap },
  { number: '100+', label: 'Skill Tracks', icon: Cpu }
];

export default function VocationalSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('polytechnic'); // 'polytechnic' or 'vocational'

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vocationalService.getVocationalResources();
      if (data && data.length > 0) {
        // Map icons if they come as strings or use default
        const mappedData = data.map(school => ({
          ...school,
          icon: ICON_MAP[school.icon_type] || Building2,
          type: school.type || (school.name.toLowerCase().includes('polytechnic') ? 'polytechnic' : 'vocational'),
          programs: Array.isArray(school.programs) ? school.programs : (school.programs ? school.programs.split(',') : [])
        }));
        setSchools(mappedData);
      } else {
        setSchools(SCHOOLS);
      }
    } catch (err) {
      console.error('Failed to fetch vocational schools:', err);
      setError('Unable to load vocational resources. Showing offline content.');
      setSchools(SCHOOLS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const ICON_MAP = {
    building: Building2,
    hammer: Hammer,
    zap: Zap,
    wrench: Wrench,
    sprout: Sprout,
    car: Car,
    chef: ChefHat,
    scissors: Scissors
  };

  const filteredSchools = schools.filter(school => school.type === activeTab);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Polytechnic & Vocational Portal
        </motion.h1>
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Empowering Zimbabwe's workforce through practical skills, technical excellence, and industrial innovation.
        </motion.p>
      </header>

      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'polytechnic' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('polytechnic')}
        >
          Polytechnics
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'vocational' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('vocational')}
        >
          Vocational Schools
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
          <button onClick={fetchSchools} className={styles.retryBtn}>Try Again</button>
        </div>
      )}

      <section className={styles.grid}>
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className={styles.skeletonCard} style={{ height: '300px', background: 'var(--mist)', borderRadius: '12px', opacity: 0.5 }} />
          ))
        ) : (
          filteredSchools.map((school, index) => (
            <motion.div 
              key={school.id}
              className={styles.schoolCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.iconWrapper}>
                <school.icon size={28} />
              </div>
              <h2 className={styles.schoolName}>{school.name}</h2>
              <div className={styles.location}>
                <MapPin size={16} />
                <span>{school.location}, Zimbabwe</span>
              </div>
              <p className={styles.description}>{school.description}</p>
              
              <div className={styles.programs}>
                {school.programs.map(prog => (
                  <span key={prog} className={styles.programTag}>{prog}</span>
                ))}
              </div>

              <a href="#" className={styles.viewBtn} onClick={(e) => e.preventDefault()}>
                View Resources <ExternalLink size={16} />
              </a>
            </motion.div>
          ))
        )}
      </section>

      <motion.section 
        className={styles.statsStrip}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        {STATS.map((stat, index) => (
          <div key={index} className={styles.statItem}>
            <span className={styles.statNumber}>{stat.number}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </motion.section>

      <section style={{ marginTop: '80px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--soil)', marginBottom: '24px' }}>
          Need Technical Resources?
        </h2>
        <p style={{ color: 'var(--clay)', maxWidth: '600px', margin: '0 auto 32px', lineHeight: '1.6' }}>
          Access our specialized collection of engineering manuals, workshop guides, and technical textbooks curated for vocational training.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/vocational-tools" style={{ 
            padding: '14px 32px', 
            background: 'var(--amber)', 
            color: 'var(--soil)', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: '700',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Wrench size={18} /> Open AI Skills Lab
          </Link>
          <button style={{ 
            padding: '14px 32px', 
            background: 'transparent', 
            color: 'var(--soil)', 
            border: '2px solid var(--soil)', 
            borderRadius: '8px', 
            fontWeight: '700',
            cursor: 'pointer'
          }}>
            Contact Skills Dept
          </button>
        </div>
      </section>
    </div>
  );
}
