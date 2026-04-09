import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Zap, 
  Trophy, 
  Globe, 
  Search,
  Cpu,
  GraduationCap,
  Building2
} from "lucide-react"
import { OPENSTAX_EXPANDED, AI_PRIORITY_OER } from "../lib/oerCatalog"
import styles from "./Home.module.css"

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Combine some books for the featured section
    const books = [...AI_PRIORITY_OER, ...OPENSTAX_EXPANDED.slice(0, 4)]
    setFeaturedBooks(books)
    setLoading(false)
  }, [])

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.heroContent}
        >
          <h1 className={styles.headline}>
            <span className={styles.dare}>DARE</span> to <br />
            <span className={styles.shareText}>Share Knowledge.</span>
          </h1>
          <p className={styles.subheading}>
            Zimbabwe's premier Digital Academic Resource Engine. Empowering Education 5.0 through open access, AI-driven learning, and collaborative research.
          </p>
          
          <div className={styles.ctaGroup}>
            <Link to="/library" className={styles.primaryBtn}>
              Explore Library
            </Link>
            <Link to="/search" className={styles.secondaryLink}>
              <span>National Search</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Resources</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>15+</span>
              <span className={styles.statLabel}>Institutions</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Open Access</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={styles.heroVisual}
        >
          <div className={styles.bookStack}>
            <div className={`${styles.book} ${styles.book1}`} />
            <div className={`${styles.book} ${styles.book2}`} />
            <div className={`${styles.book} ${styles.book3}`} />
          </div>
          <div className={styles.tag}>
            <span className={styles.tagShona}>Kuziva mbuya huudzwa</span>
            <span className={styles.tagEnglish}>Knowledge is shared</span>
          </div>
        </motion.div>
      </section>

      {/* Features Strip */}
      <div className={styles.featuresStrip}>
        <div className={styles.featuresTrack}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className={styles.featuresTrack}>
              <span className={styles.featurePill}><Cpu size={14} /> AI-Powered Tutoring</span>
              <span className={styles.featurePill}><Globe size={14} /> Offline Access</span>
              <span className={styles.featurePill}><Zap size={14} /> Data-Lite Reading</span>
              <span className={styles.featurePill}><Trophy size={14} /> Gamified Learning</span>
              <span className={styles.featurePill}><Building2 size={14} /> Institutional Repositories</span>
              <span className={styles.featurePill}><GraduationCap size={14} /> ZIMSEC Aligned</span>
            </div>
          ))}
        </div>
      </div>

      {/* Study Hub Section */}
      <section className={styles.section}>
        <div className={styles.studyHubSection}>
          <div className={styles.studyHubHeader}>
            <div className={styles.studyHubTitle}>
              <Sparkles className={styles.aiIcon} size={32} />
              <div>
                <h2>Personalized Study Hub</h2>
                <p>AI-Driven Learning Paths</p>
              </div>
            </div>
            <div className={styles.dataSaverBadge}>
              <Zap size={14} />
              <span>Data Saver Active</span>
            </div>
          </div>

          <div className={styles.studyHubGrid}>
            <div className={styles.recentReads}>
              <div className={styles.hubSubHeader}>
                <BookOpen size={18} />
                <h3>Featured Resources</h3>
              </div>
              <div className={styles.recentReadsList}>
                {featuredBooks.slice(0, 3).map(book => (
                  <Link key={book.id} to={`/book/${book.id}`} className={styles.recentReadCard}>
                    <div className={styles.recentCover}>
                      <img src={book.cover_image_url} alt={book.title} referrerPolicy="no-referrer" />
                    </div>
                    <div className={styles.recentInfo}>
                      <h4>{book.title}</h4>
                      <p>{book.author_names}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.aiSuggestionBox}>
              <div className={styles.hubSubHeader}>
                <Sparkles size={18} />
                <h3>DARA Suggestions</h3>
              </div>
              <p>Based on current academic trends in Zimbabwe, you might find these topics relevant to your curriculum.</p>
              <div className={styles.suggestionTags}>
                <span className={styles.suggestionTag}>#Education5.0</span>
                <span className={styles.suggestionTag}>#STEM_Zimbabwe</span>
                <span className={styles.suggestionTag}>#ZIMSEC_Prep</span>
                <span className={styles.suggestionTag}>#HeritageStudies</span>
              </div>
              <button className={styles.askDaraBtn}>
                Ask DARA AI Tutor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured Library</h2>
          <Link to="/library" className={styles.viewAll}>
            <span>View All Books</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className={styles.bookScroll}>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonCover} />
                <div className={styles.skeletonText} />
                <div className={styles.skeletonTextShort} />
              </div>
            ))
          ) : (
            featuredBooks.map(book => (
              <div key={book.id} className={styles.bookWrapper}>
                <Link to={`/book/${book.id}`} className={styles.recentReadCard} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px', padding: '0', border: 'none', background: 'transparent' }}>
                  <div className={styles.recentCover} style={{ width: '100%', height: '320px', borderRadius: '12px' }}>
                    <img src={book.cover_image_url} alt={book.title} referrerPolicy="no-referrer" />
                  </div>
                  <div className={styles.recentInfo} style={{ padding: '0 8px' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>{book.title}</h4>
                    <p>{book.author_names}</p>
                  </div>
                </Link>
                <Link to={`/reader/${book.id}`} className={styles.readNowBtn}>
                  Read Now
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {/* AI Banner */}
      <section className={styles.section}>
        <div className={styles.aiBanner}>
          <div className={styles.aiContent}>
            <div className={styles.aiLabel}>
              <Sparkles size={16} />
              <span>AI-POWERED EDUCATION</span>
            </div>
            <h2 className={styles.sectionTitle} style={{ color: 'var(--text-main)', marginTop: '24px' }}>
              Meet DARA, Your AI Tutor
            </h2>
            <p className={styles.subheading} style={{ marginBottom: '32px' }}>
              DARA helps you summarize complex textbooks, generates practice quizzes, and explains concepts in Shona, Ndebele, or English.
            </p>
            <Link to="/ai-tools" className={styles.primaryBtn}>
              Try AI Tools
            </Link>
          </div>
          <div className="hidden lg:block">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Cpu size={200} className={styles.aiIcon} style={{ opacity: 0.1 }} />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
