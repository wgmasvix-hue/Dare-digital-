import { useState, useEffect } from 'react';
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import UploadWizard from '../components/author/UploadWizard';
import styles from './AuthorPortal.module.css';

export default function AuthorPortal() {
  const { user, profile } = useAuth();
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'wizard'
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchSubmissions() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('publication_submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSubmissions(data || []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, [user, view]); // Refetch when switching back to dashboard

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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Author Portal</h1>
          <p className={styles.subtitle}>Manage your publications and submissions</p>
        </div>
        <button onClick={() => setView('wizard')} className={styles.newBtn}>
          <Plus size={20} /> Submit New Work
        </button>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{submissions.length}</span>
          <span className={styles.statLabel}>Total Submissions</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {submissions.filter(s => s.status === 'published').length}
          </span>
          <span className={styles.statLabel}>Published</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {submissions.filter(s => s.status === 'pending' || s.status === 'submitted').length}
          </span>
          <span className={styles.statLabel}>Pending Review</span>
        </div>
      </div>

      <section className={styles.submissionsSection}>
        <h2 className={styles.sectionTitle}>My Submissions</h2>
        
        {loading ? (
          <div className={styles.loading}>Loading submissions...</div>
        ) : submissions.length > 0 ? (
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
                {submissions.map(sub => (
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
                      <button className={styles.actionBtn}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>You haven't submitted any publications yet.</p>
            <button onClick={() => setView('wizard')} className={styles.createBtn}>
              Start your first submission
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
