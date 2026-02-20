import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  Flame,
  Bookmark,
  PlayCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/library/BookCard';
import styles from './StudentDashboard.module.css';

export default function StudentDashboard() {
  const { user, profile, institution } = useAuth();
  
  const [continueReading, setContinueReading] = useState([]);
  const [readingLists, setReadingLists] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [stats, setStats] = useState({ booksStarted: 0, pagesRead: 0, hoursRead: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchDashboardData() {
      try {
        setLoading(true);

        // 1. Continue Reading (Sessions < 100%)
        const { data: sessions } = await supabase
          .from('reading_sessions')
          .select(`
            *,
            publication:publications(*)
          `)
          .eq('user_id', user.id)
          .lt('completion_percentage', 100)
          .order('last_read_at', { ascending: false })
          .limit(3);
        
        setContinueReading(sessions || []);

        // 2. Reading Lists (Created by user or public)
        const { data: lists } = await supabase
          .from('reading_lists')
          .select('*')
          .or(`created_by.eq.${user.id},is_public.eq.true`)
          .limit(4);
        
        setReadingLists(lists || []);

        // 3. Recommended (Same faculty)
        if (profile?.faculty) {
          const { data: recs } = await supabase
            .from('publications')
            .select('*')
            .eq('faculty', profile.faculty)
            .order('average_rating', { ascending: false })
            .limit(4);
          setRecommended(recs || []);
        }

        // 4. Recently Added
        const { data: recent } = await supabase
          .from('publications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
        
        setRecentlyAdded(recent || []);

        // 5. Reading Stats (Mock calculation for demo)
        // In a real app, aggregate from reading_sessions logs
        setStats({
          booksStarted: sessions?.length || 0,
          pagesRead: sessions?.reduce((acc, s) => acc + (s.last_page || 0), 0) || 0,
          hoursRead: Math.floor(Math.random() * 10) + 2 // Mock
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, profile]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* 1. WELCOME HEADER */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.greeting}>
            {getGreeting()}, {profile?.first_name}
          </h1>
          <p className={styles.subHeader}>
            {institution?.name || 'Independent Scholar'} • {profile?.programme || 'General Studies'}
          </p>
        </div>
        
        <div className={styles.streakBadge}>
          <div className={styles.streakIcon}>
            <Flame size={20} fill="var(--amber)" stroke="none" />
          </div>
          <div className={styles.streakInfo}>
            <span className={styles.streakCount}>3 Day Streak</span>
            <span className={styles.streakLabel}>Keep it up!</span>
          </div>
        </div>
      </header>

      {/* 2. CONTINUE READING */}
      {continueReading.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Continue Reading</h2>
          <div className={styles.continueGrid}>
            {continueReading.map(session => (
              <div key={session.id} className={styles.continueCard}>
                <div className={styles.continueCover}>
                  {session.publication.cover_path ? (
                    <img src={session.publication.cover_path} alt={session.publication.title} />
                  ) : (
                    <div className={styles.placeholderCover}>
                      <span>{session.publication.title[0]}</span>
                    </div>
                  )}
                </div>
                <div className={styles.continueInfo}>
                  <h3 className={styles.continueTitle}>{session.publication.title}</h3>
                  <p className={styles.continueMeta}>
                    Page {session.last_page} of {session.publication.page_count}
                  </p>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${session.completion_percentage}%` }}
                    />
                  </div>
                  <Link 
                    to={`/reader/${session.publication_id}?page=${session.last_page}`} 
                    className={styles.continueBtn}
                  >
                    <PlayCircle size={16} /> Continue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. READING STATS */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard} style={{ '--accent': 'var(--soil)' }}>
          <div className={styles.statIcon}><BookOpen size={20} /></div>
          <div className={styles.statValue}>{stats.booksStarted}</div>
          <div className={styles.statLabel}>Books Started</div>
        </div>
        <div className={styles.statCard} style={{ '--accent': 'var(--leaf)' }}>
          <div className={styles.statIcon}><TrendingUp size={20} /></div>
          <div className={styles.statValue}>{stats.pagesRead}</div>
          <div className={styles.statLabel}>Pages Read</div>
        </div>
        <div className={styles.statCard} style={{ '--accent': 'var(--amber)' }}>
          <div className={styles.statIcon}><Clock size={20} /></div>
          <div className={styles.statValue}>{stats.hoursRead}h</div>
          <div className={styles.statLabel}>Time Reading</div>
        </div>
      </section>

      {/* 3. MY READING LISTS */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>My Reading Lists</h2>
          <Link to="/lists" className={styles.viewAll}>View All <ChevronRight size={16} /></Link>
        </div>
        <div className={styles.listsGrid}>
          {readingLists.length > 0 ? (
            readingLists.map(list => (
              <Link key={list.id} to={`/lists/${list.id}`} className={styles.listCard}>
                <div className={styles.listIcon}><Bookmark size={20} /></div>
                <div className={styles.listInfo}>
                  <h3 className={styles.listName}>{list.name}</h3>
                  <p className={styles.listCount}>{list.item_count || 0} items</p>
                </div>
                {list.is_public && <span className={styles.publicBadge}>Public</span>}
              </Link>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No reading lists yet. Create one to organize your research.</p>
              <button className={styles.createListBtn}>Create List</button>
            </div>
          )}
        </div>
      </section>

      {/* 4. RECOMMENDED FOR YOU */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recommended for {profile?.faculty || 'You'}</h2>
        <div className={styles.bookGrid}>
          {recommended.map(book => (
            <BookCard key={book.id} publication={book} variant="grid" />
          ))}
        </div>
      </section>

      {/* 5. RECENTLY ADDED */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recently Added</h2>
        <div className={styles.bookGrid}>
          {recentlyAdded.map(book => (
            <BookCard key={book.id} publication={book} variant="grid" />
          ))}
        </div>
      </section>
    </div>
  );
}
