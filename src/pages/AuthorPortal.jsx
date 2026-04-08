import { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  LayoutDashboard,
  BookOpen,
  Library,
  ShieldCheck,
  GraduationCap,
  TrendingUp,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import UploadWizard from '../components/author/UploadWizard';
import styles from './AuthorPortal.module.css';

export default function AuthorPortal() {
  const { user, profile } = useAuth();
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'wizard'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState([]);
  const [collections, setCollections] = useState([]);
  const [royalties, setRoyalties] = useState({ total: 0, pending: 0, history: [] });
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch Submissions
        const { data: subs, error: subsError } = await supabase
          .from('books')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (subsError) throw subsError;
        setSubmissions(subs || []);

        // Fetch Collections
        const { data: cols, error: colsError } = await supabase
          .from('collections')
          .select('*')
          .eq('creator_id', user.id)
          .order('updated_at', { ascending: false });

        if (colsError) throw colsError;
        setCollections(cols || []);

        // Fetch Royalties
        const { data: roys, error: roysError } = await supabase
          .from('royalties')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (roysError) throw roysError;
        if (roys) {
          const total = roys.reduce((acc, curr) => acc + (curr.status === 'paid' ? Number(curr.amount) : 0), 0);
          const pending = roys.reduce((acc, curr) => acc + (curr.status === 'pending' ? Number(curr.amount) : 0), 0);
          setRoyalties({ total, pending, history: roys });
        }

        // Fetch Resources
        const { data: res, error: resError } = await supabase
          .from('author_resources')
          .select('*');

        if (resError) throw resError;
        setResources(res || []);

      } catch (err) {
        console.error('Error fetching author data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, view]);

  const handleCreateCollection = async () => {
    const title = prompt('Enter collection title:');
    if (!title) return;

    try {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          title,
          creator_id: user.id,
          items_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      setCollections(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error creating collection:', err);
      alert('Failed to create collection');
    }
  };

  const getIcon = (name) => {
    const icons = {
      ShieldCheck,
      FileText,
      GraduationCap,
      TrendingUp,
      BookOpen,
      Library
    };
    return icons[name] || FileText;
  };

  if (!user) {
    return (
      <div className={styles.container} style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div className={styles.authPrompt}>
          <ShieldCheck size={64} color="var(--amber)" style={{marginBottom: '24px'}} />
          <h1 className={styles.title}>Author Portal</h1>
          <p className={styles.subtitle}>Please sign in to access your creative hub and publish your work.</p>
          <button 
            className={styles.newBtn} 
            style={{marginTop: '24px', marginInline: 'auto'}}
            onClick={() => window.location.href = '/login'}
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  if (view === 'wizard') {
    return (
      <div className={styles.wizardWrapper}>
        <div className={styles.wizardHeader}>
          <button onClick={() => setView('dashboard')} className={styles.backLink}>
            &larr; Back to Dashboard
          </button>
          <h1>New Submission</h1>
        </div>
        <UploadWizard />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{submissions.length}</span>
                <span className={styles.statLabel}>Total Works</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>
                  {submissions.reduce((acc, curr) => acc + (curr.total_reads || 0), 0)}
                </span>
                <span className={styles.statLabel}>Total Reads</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>${royalties.total}</span>
                <span className={styles.statLabel}>Est. Earnings</span>
              </div>
            </div>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
              {/* Reuse the table but limit items */}
              {renderSubmissionsTable(submissions.slice(0, 3))}
            </section>
          </>
        );
      
      case 'works':
        return (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>My Submissions</h2>
              <button onClick={() => setView('wizard')} className={styles.newBtn}>
                <Plus size={16} /> New Work
              </button>
            </div>
            {renderSubmissionsTable(submissions)}
          </section>
        );

      case 'curation':
        return (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>Creative Curation</h2>
              <button className={styles.newBtn} onClick={handleCreateCollection}>
                <Plus size={16} /> New Collection
              </button>
            </div>
            <div className={styles.curationGrid}>
              {collections.map(col => (
                <div key={col.id} className={styles.collectionCard}>
                  <div className={styles.collectionTitle}>{col.title}</div>
                  <div className={styles.collectionMeta}>
                    {col.items_count} items • Updated {new Date(col.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              <div 
                className={`${styles.collectionCard} ${styles.addCard}`} 
                style={{borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                onClick={handleCreateCollection}
              >
                <span style={{color: 'var(--amber)', fontWeight: 500}}>+ Create Empty Collection</span>
              </div>
            </div>
          </section>
        );

      case 'rights':
        return (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Rights & Royalties</h2>
            <div className={styles.royaltyHeader}>
              <div className={styles.royaltyCard}>
                <div className={styles.statLabel}>Total Earnings (All Time)</div>
                <div className={styles.royaltyAmount}>${royalties.total.toFixed(2)}</div>
              </div>
              <div className={styles.royaltyCard}>
                <div className={styles.statLabel}>Pending Payout</div>
                <div className={styles.royaltyAmount}>${royalties.pending.toFixed(2)}</div>
              </div>
            </div>
            
            <h3 className={styles.sectionTitle} style={{fontSize: '1rem'}}>Payout History</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {royalties.history.map(h => (
                  <tr key={h.id}>
                    <td>{h.month}</td>
                    <td>${h.amount.toFixed(2)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles.published}`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );

      case 'resources':
        return (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Author Development</h2>
            <div className={styles.resourceList}>
              {resources.map(res => {
                const Icon = getIcon(res.icon_name);
                return (
                  <a key={res.id} href={res.url} className={styles.resourceItem}>
                    <div className={styles.resourceIcon}>
                      <Icon size={24} />
                    </div>
                    <div className={styles.resourceContent}>
                      <h3>{res.title}</h3>
                      <p>{res.description}</p>
                    </div>
                    <div style={{marginLeft: 'auto'}}>
                      <ChevronRight size={20} color="var(--clay)" />
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const renderSubmissionsTable = (data) => (
    loading ? (
      <div className={styles.loading}>Loading...</div>
    ) : data.length > 0 ? (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(sub => (
              <tr key={sub.id}>
                <td className={styles.titleCell}>
                  <FileText size={16} className={styles.icon} />
                  <span className={styles.subTitle}>{sub.title}</span>
                </td>
                <td>{new Date(sub.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[sub.status]}`}>
                    {sub.status}
                  </span>
                </td>
                <td>
                  <button className={styles.actionBtn}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className={styles.emptyState}>
        <p>No publications found.</p>
      </div>
    )
  );

  return (
    <div className={styles.container}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Author Portal</h2>
          <span className={styles.sidebarSubtitle}>{profile?.full_name || 'Author'}</span>
        </div>
        <nav className={styles.nav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'works' ? styles.active : ''}`}
            onClick={() => setActiveTab('works')}
          >
            <BookOpen size={18} /> My Works
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'curation' ? styles.active : ''}`}
            onClick={() => setActiveTab('curation')}
          >
            <Library size={18} /> Curation
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'rights' ? styles.active : ''}`}
            onClick={() => setActiveTab('rights')}
          >
            <ShieldCheck size={18} /> Rights & Royalties
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'resources' ? styles.active : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            <TrendingUp size={18} /> Development
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          {/* Real Book Background Image */}
          <div className="absolute inset-0 z-0 opacity-10">
            <img 
              src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=2000" 
              alt="Header Background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg-subtle via-transparent to-bg-subtle" />
          </div>

          <div className="relative z-10">
            <h1 className={styles.title}>
              {activeTab === 'dashboard' && 'Overview'}
              {activeTab === 'works' && 'My Works'}
              {activeTab === 'curation' && 'Creative Curation'}
              {activeTab === 'rights' && 'Intellectual Property'}
              {activeTab === 'resources' && 'Author Development'}
            </h1>
            <p className={styles.subtitle}>
              {activeTab === 'dashboard' && 'Welcome back to your creative hub.'}
              {activeTab === 'works' && 'Manage your published and pending content.'}
              {activeTab === 'curation' && 'Curate collections and course packs.'}
              {activeTab === 'rights' && 'Manage licenses and track your earnings.'}
              {activeTab === 'resources' && 'Grow your skills and reach.'}
            </p>
          </div>
          {activeTab === 'works' && (
            <button onClick={() => setView('wizard')} className={`${styles.newBtn} relative z-10`}>
              <Plus size={20} /> Submit New Work
            </button>
          )}
        </header>

        {renderContent()}
      </main>
    </div>
  );
}
