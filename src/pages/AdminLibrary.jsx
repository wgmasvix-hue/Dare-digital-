import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  BookOpen,
  Database,
  RefreshCw
} from 'lucide-react';
import styles from './AdminSeed.module.css'; // Reuse some styles or create new ones

const BOOK_SELECT = '*, creator:profiles(full_name), institution:institutions(institution_name)';

export default function AdminLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author_names: '',
    subject: 'General',
    description: '',
    status: 'draft',
    file_url: '',
    cover_image_url: ''
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      let query = supabase.from('books').select(BOOK_SELECT);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const published = data?.filter(b => b.status === 'published').length || 0;
      const drafts = total - published;
      setStats({ total, published, drafts });

    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [statusFilter]);

  const handleStatusToggle = async (bookId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase
        .from('books')
        .update({ status: newStatus })
        .eq('id', bookId);

      if (error) throw error;
      fetchBooks();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) throw error;
      fetchBooks();
    } catch (err) {
      alert('Failed to delete book: ' + err.message);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const bookData = {
        ...newBook,
        creator_id: user?.id || null
      };

      const { error } = await supabase
        .from('books')
        .insert([bookData]);

      if (error) throw error;
      
      setIsModalOpen(false);
      setNewBook({
        title: '',
        author_names: '',
        subject: 'General',
        description: '',
        status: 'draft',
        file_url: '',
        cover_image_url: ''
      });
      fetchBooks();
    } catch (err) {
      alert('Failed to add book: ' + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ 
        background: 'var(--soil)', 
        color: 'white', 
        padding: '4rem 5%', 
        position: 'relative', 
        overflow: 'hidden',
        borderBottom: 'none'
      }}>
        {/* Real Book Background Image */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.15
        }}>
          <img 
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" 
            alt="Admin Library Background" 
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            referrerPolicy="no-referrer"
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(45, 34, 28, 0.8), var(--soil))"
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'relative', zIndex: 10 }}>
          <div>
            <h1 className={styles.title} style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Backend Book Manager</h1>
            <p className={styles.subtitle} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>Manage and publish books directly from the Supabase backend.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/admin/seed" className={styles.clearBtn} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              &larr; Back to Seeder
            </Link>
            <button onClick={fetchBooks} className={styles.clearBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              <RefreshCw size={16} className={loading ? styles.spin : ''} /> Refresh
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className={styles.button} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--amber)', color: 'var(--soil)', border: 'none' }}
            >
              <Plus size={16} /> Add Manually
            </button>
          </div>
        </div>
      </header>

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            width: '100%',
            maxWIdth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '24px', color: 'var(--soil)' }}>Add New Book</h2>
            <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 500 }}>Title</label>
                <input 
                  required
                  type="text" 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--clay-light)' }}
                  value={newBook.title}
                  onChange={e => setNewBook({...newBook, title: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 500 }}>Author(s)</label>
                <input 
                  required
                  type="text" 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--clay-light)' }}
                  value={newBook.author_names}
                  onChange={e => setNewBook({...newBook, author_names: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 500 }}>Subject</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--clay-light)' }}
                  value={newBook.subject}
                  onChange={e => setNewBook({...newBook, subject: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 500 }}>Description</label>
                <textarea 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--clay-light)', minHeight: '80px' }}
                  value={newBook.description}
                  onChange={e => setNewBook({...newBook, description: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--clay-light)', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--soil)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.statsGrid} style={{ marginBottom: '24px' }}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total Books</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.published}</span>
          <span className={styles.statLabel}>Published</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.drafts}</span>
          <span className={styles.statLabel}>Drafts / Pending</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.logHeader} style={{ borderBottom: '1px solid var(--clay-light)', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clay)' }} />
              <input 
                type="text" 
                placeholder="Search books in backend..." 
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid var(--clay-light)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchBooks()}
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--clay-light)' }}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className={styles.tableWrapper} style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--clay-light)' }}>
                <th style={{ padding: '12px' }}>Book Info</th>
                <th style={{ padding: '12px' }}>Subject</th>
                <th style={{ padding: '12px' }}>Creator / Institution</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Created</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan="5" style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>Loading...</td></tr>
                ))
              ) : books.length > 0 ? (
                books.map(book => (
                  <tr key={book.id} style={{ borderBottom: '1px solid var(--clay-light)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '56px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                          {book.cover_image_url ? (
                            <img src={book.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><BookOpen size={16} color="var(--clay)" /></div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--soil)' }}>{book.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--clay)' }}>{book.author_names}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>{book.subject}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--soil)' }}>
                        {book.creator?.full_name || 'System'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--clay)' }}>
                        {book.institution?.institution_name || 'Dare Access'}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        background: book.status === 'published' ? '#e8f5e9' : '#fff3e0',
                        color: book.status === 'published' ? '#2e7d32' : '#ef6c00'
                      }}>
                        {book.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--clay)' }}>
                      {new Date(book.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleStatusToggle(book.id, book.status)}
                          title={book.status === 'published' ? 'Unpublish' : 'Publish'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: book.status === 'published' ? '#ef6c00' : '#2e7d32' }}
                        >
                          {book.status === 'published' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clay)' }}>
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(book.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--clay)' }}>No books found in the backend.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
