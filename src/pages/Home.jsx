import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Library, 
  Sprout, 
  Stethoscope, 
  Briefcase, 
  GraduationCap, 
  Cog, 
  Scale, 
  Feather, 
  Microscope,
  Search,
  WifiOff,
  Database
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import BookCard from '../components/library/BookCard';
import styles from './Home.module.css';

const FACULTIES = [
  { name: 'STEM', icon: Microscope, id: 'stem' },
  { name: 'Agriculture', icon: Sprout, id: 'agriculture' },
  { name: 'Health', icon: Stethoscope, id: 'health' },
  { name: 'Business', icon: Briefcase, id: 'business' },
  { name: 'Education', icon: GraduationCap, id: 'education' },
  { name: 'Engineering', icon: Cog, id: 'engineering' },
  { name: 'Law', icon: Scale, id: 'law' },
  { name: 'Humanities', icon: Feather, id: 'humanities' },
];

const FEATURES = [
  { label: 'Offline-First PWA', icon: WifiOff },
  { label: 'ZIMCHE Aligned', icon: BookOpen },
  { label: 'OpenStax', icon: Library },
  { label: 'FAO', icon: Sprout },
  { label: 'WHO', icon: Stethoscope },
  { label: 'AI Search', icon: Search },
  { label: 'Zimbabwe Research', icon: Database },
];

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedBooks() {
      try {
        // Note: In a real app, ensure these columns exist or adjust query
        const { data, error } = await supabase
          .from('publications')
          .select('*')
          .eq('is_featured', true)
          .eq('is_published', true)
          .limit(8);

        if (error) throw error;
        setFeaturedBooks(data || []);
      } catch (err) {
        console.error('Error fetching featured books:', err);
        // Fallback or empty state handling could go here
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedBooks();
  }, []);

  return (
    <div className={styles.home}>
      {/* 1. HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.headline}>Where knowledge gathers</h1>
          <p className={styles.subheading}>
            Zimbabwe's premier digital library for tertiary education. 
            Access thousands of academic resources, anywhere, anytime.
          </p>
          
          <div className={styles.ctaGroup}>
            <Link to="/library" className={styles.primaryBtn}>
              Explore the Library
            </Link>
            <Link to="/institutions" className={styles.secondaryLink}>
              For Institutions <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>2500+</span>
              <span className={styles.statLabel}>Titles</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>20</span>
              <span className={styles.statLabel}>Sources</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>44</span>
              <span className={styles.statLabel}>Subjects</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.bookStack}>
            <div className={`${styles.book} ${styles.book1}`}></div>
            <div className={`${styles.book} ${styles.book2}`}></div>
            <div className={`${styles.book} ${styles.book3}`}></div>
          </div>
          <div className={styles.tag}>
            <span className={styles.tagShona}>Dare</span>
            <span className={styles.tagEnglish}>= gathering place of wisdom</span>
          </div>
        </div>
      </section>

      {/* 2. FEATURES STRIP */}
      <div className={styles.featuresStrip}>
        <div className={styles.featuresTrack}>
          {[...FEATURES, ...FEATURES].map((feature, index) => (
            <div key={index} className={styles.featurePill}>
              <feature.icon size={14} />
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FEATURED BOOKS */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Start reading today</h2>
          <Link to="/library" className={styles.viewAll}>View all books</Link>
        </div>
        
        <div className={styles.bookScroll}>
          {loading ? (
            // Skeleton Loaders
            Array(4).fill(0).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonCover} />
                <div className={styles.skeletonText} />
                <div className={styles.skeletonTextShort} />
              </div>
            ))
          ) : featuredBooks.length > 0 ? (
            featuredBooks.map(book => (
              <div key={book.id} className={styles.bookWrapper}>
                <BookCard book={book} />
              </div>
            ))
          ) : (
            <p className={styles.emptyText}>No featured books available at the moment.</p>
          )}
        </div>
      </section>

      {/* 4. SUBJECT BROWSE */}
      <section className={`${styles.section} ${styles.bgMist}`}>
        <h2 className={styles.sectionTitle}>Browse by Faculty</h2>
        <div className={styles.facultyGrid}>
          {FACULTIES.map((faculty) => (
            <Link 
              key={faculty.id} 
              to={`/library?faculty=${faculty.id}`}
              className={styles.facultyCard}
            >
              <div className={styles.facultyIcon}>
                <faculty.icon size={24} />
              </div>
              <span className={styles.facultyName}>{faculty.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. WHY DARE */}
      <section className={styles.section}>
        <div className={styles.whyGrid}>
          <div className={styles.whyContent}>
            <h2 className={styles.sectionTitle}>Why Dare Digital Library?</h2>
            <p className={styles.whyText}>
              We bridge the gap between global academic resources and local accessibility. 
              Our platform is designed for the Zimbabwean context, ensuring that 
              students and lecturers have reliable access to high-quality educational materials.
            </p>
            <ul className={styles.whyList}>
              <li>Curated content aligned with ZIMCHE standards</li>
              <li>Offline access for uninterrupted study</li>
              <li>Institutional integration for seamless access</li>
            </ul>
          </div>
          
          <div className={styles.researchSpotlight}>
            <div className={styles.spotlightHeader}>
              <Database size={20} className={styles.spotlightIcon} />
              <h3>Zimbabwe Research Spotlight</h3>
            </div>
            <p>
              Discover groundbreaking research from Zimbabwean institutions. 
              We integrate with OpenAlex to bring local knowledge to the global stage.
            </p>
            <Link to="/browse?collection=zim-research" className={styles.spotlightLink}>
              Browse Local Research
            </Link>
          </div>
        </div>
      </section>

      {/* 6. INSTITUTION CTA */}
      <section className={styles.institutionCta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Empower your institution</h2>
          <p className={styles.ctaText}>
            Join the network of leading Zimbabwean universities and colleges 
            transforming education through digital access.
          </p>
          <a href="mailto:partnerships@dare.co.zw" className={styles.emailBtn}>
            Request a Demo
          </a>
        </div>
      </section>
    </div>
  );
}
