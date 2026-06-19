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
import TrainerAI from '../components/TrainerAI';
import styles from './VocationalSchools.module.css';

const SCHOOLS = [
  {
    id: 'prince-edward',
    name: 'Prince Edward School',
    location: 'Harare',
    type: 'polytechnic', // Using 'polytechnic' to represent O-Level tab due to existing logic
    description: 'A prestigious public boys high school in Harare offering comprehensive O-Level and A-Level curricula with strong emphasis on sciences, arts, and sports.',
    programs: ['Sciences', 'Commercials', 'Arts', 'Sports'],
    icon: Building2,
    logo: 'https://picsum.photos/seed/princeedward/200'
  },
  {
    id: 'churchill',
    name: 'Churchill Boys High School',
    location: 'Harare',
    type: 'polytechnic',
    description: 'Known for academic excellence and developing a well-rounded O-Level and A-Level curriculum.',
    programs: ['Sciences', 'Commercials', 'Arts'],
    icon: Building2,
    logo: 'https://picsum.photos/seed/churchill/200'
  },
  {
    id: 'goromonzi',
    name: 'Goromonzi High School',
    location: 'Mashonaland East',
    type: 'polytechnic',
    description: 'One of the first schools to offer A-Level education to Africans in Zimbabwe, maintaining a strong tradition of academic excellence.',
    programs: ['Sciences', 'Commercials', 'Arts'],
    icon: Building2,
    logo: 'https://picsum.photos/seed/goromonzi/200'
  },
  {
    id: 'mabelreign',
    name: 'Mabelreign Girls High School',
    location: 'Harare',
    type: 'vocational', // 'vocational' mapping to A-Level in UI
    description: 'A top-tier girls high school providing robust A-Level programs to empower future female leaders in STEM and Humanities.',
    programs: ['STEM Education', 'Humanities', 'Commercials'],
    icon: Building2,
    logo: 'https://picsum.photos/seed/mabelreign/200'
  },
  {
    id: 'st-ignatius',
    name: 'St Ignatius College',
    location: 'Chishawasha',
    type: 'vocational',
    description: 'Highly acclaimed for remarkable A-Level academic results, particularly in Sciences and Mathematics.',
    programs: ['Advanced Sciences', 'Mathematics', 'Arts'],
    icon: Building2,
    logo: 'https://picsum.photos/seed/stignatius/200'
  },
  {
    id: 'sandringham',
    name: 'Sandringham High School',
    location: 'Norton',
    type: 'vocational',
    description: 'A renowned high school known for producing stellar A-Level students with a strong ethical and academic foundation.',
    programs: ['Sciences', 'Commercials', 'Arts'],
    icon: Building2,
    logo: 'https://picsum.photos/seed/sandringham/200'
  }
];

const STATS = [
  { number: '3000+', label: 'Registered High Schools', icon: Building2 },
  { number: '2M+', label: 'O-Level Students', icon: Users },
  { number: '150k+', label: 'A-Level Students', icon: GraduationCap },
  { number: '20+', label: 'Subject Areas', icon: Cpu }
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
        {/* Real Book Background Image */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000" 
            alt="Vocational Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary" />
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-4"
          >
            <GraduationCap className="w-5 h-5" />
            <span>O-Level & A-Level</span>
          </motion.div>
          <motion.h1 
            className="text-4xl md:text-6xl font-display font-black text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Zimbabwe <span className="text-accent italic">Secondary Schools</span>
          </motion.h1>
          <motion.p 
            className="text-white/70 max-w-2xl mx-auto text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Empowering O-Level and A-Level students through comprehensive open educational resources, past papers, and structured study guides.
          </motion.p>
        </div>
      </header>

      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'polytechnic' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('polytechnic')}
        >
          O-Level (Forms 1-4)
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'vocational' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('vocational')}
        >
          A-Level (Forms 5-6)
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
                {school.logo ? (
                  <img src={school.logo} alt={school.name} className={styles.logoImg} referrerPolicy="no-referrer" />
                ) : (
                  <school.icon size={28} />
                )}
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

              <Link to="/vocational-tools" className={styles.viewBtn}>
                View Resources <ExternalLink size={16} />
              </Link>
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
          Need Subject Specific Resources?
        </h2>
        <p style={{ color: 'var(--clay)', maxWidth: '600px', margin: '0 auto 32px', lineHeight: '1.6' }}>
          Access our specialized collection of study guides, past papers, marking schemes, and STEM textbooks curated for secondary schools.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/library" style={{ 
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
            <GraduationCap size={18} /> Browse O-Level Library
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
            Filter by Subject
          </button>
        </div>
      </section>
      
      <TrainerAI />
    </div>
  );
}
