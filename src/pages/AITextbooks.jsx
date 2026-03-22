import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  Upload, 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/library/BookCard';
import { transformBooks, BOOK_SELECT } from '../lib/transformBook';
import { AI_OER, AI_PRIORITY_OER } from '../lib/oerCatalog';
import styles from './AITextbooks.module.css';

import { oerService } from '../services/oerService';

export default function AITextbooks() {
  const { user, profile } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ingesting, setIngesting] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setCurrentPage(p => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore]);

  useEffect(() => {
    if (currentPage * itemsPerPage >= books.length) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [currentPage, books.length]);

  const isDeveloper = profile?.role === 'developer';

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: '',
    author: '',
    description: '',
    file: null,
    cover: null
  });
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error'
  const [uploadMessage, setUploadMessage] = useState('');

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Combine static OER from catalog
  const STATIC_AI_BOOKS = transformBooks([...AI_PRIORITY_OER, ...AI_OER]);

  useEffect(() => {
    fetchAIBooks();
  }, [searchQuery]); // Refetch/Re-filter when search changes

  const fetchAIBooks = async () => {
    setLoading(true);
    let dbBooks = [];
    
    try {
      let query = supabase
        .from('books')
        .select(BOOK_SELECT)
        .ilike('subject', '%AI%')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.warn('Supabase fetch error:', error);
      } else {
        dbBooks = transformBooks(data || []);
      }
    } catch (error) {
      console.error('Error fetching AI books:', error);
    }

    // Filter static books based on search query
    const filteredStatic = searchQuery 
      ? STATIC_AI_BOOKS.filter(book => 
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author_names.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : STATIC_AI_BOOKS;

    // Filter DB books based on search query (if not already filtered by Supabase)
    const filteredDB = searchQuery
      ? dbBooks.filter(book =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author_names.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : dbBooks;

    // Merge and remove duplicates by ID or Title
    // Prioritize static books (Priority OER) by adding them first
    const combined = [...filteredStatic];
    
    filteredDB.forEach(dbBook => {
      const exists = combined.some(b => 
        b.id === dbBook.id || 
        b.title.toLowerCase() === dbBook.title.toLowerCase()
      );
      if (!exists) {
        combined.push(dbBook);
      }
    });

    setBooks(combined);
    setLoading(false);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setUploading(true);
    setUploadStatus(null);
    setUploadMessage('');

    try {
      // 1. Upload PDF
      const pdfFileName = `${Date.now()}_${uploadForm.file.name.replace(/\s+/g, '_')}`;
      const { data: pdfData, error: pdfError } = await supabase.storage
        .from('books') // Ensure this bucket exists
        .upload(`pdfs/${pdfFileName}`, uploadForm.file);

      if (pdfError) throw pdfError;

      const pdfUrl = supabase.storage.from('books').getPublicUrl(`pdfs/${pdfFileName}`).data.publicUrl;

      // 2. Upload Cover (Optional)
      let coverUrl = null;
      if (uploadForm.cover) {
        const coverFileName = `${Date.now()}_${uploadForm.cover.name.replace(/\s+/g, '_')}`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from('books')
          .upload(`covers/${coverFileName}`, uploadForm.cover);
        
        if (coverError) throw coverError;
        coverUrl = supabase.storage.from('books').getPublicUrl(`covers/${coverFileName}`).data.publicUrl;
      }

      // 3. Insert Record using oerService to trigger embeddings
      await oerService.insertOER({
        title: uploadForm.title,
        author_names: uploadForm.author,
        description: uploadForm.description,
        file_url: pdfUrl,
        cover_image_url: coverUrl,
        subject: 'AI & Future Tech',
        creator_id: user.id,
        status: 'published',
        page_count: 0 // Placeholder
      });

      setUploadStatus('success');
      setUploadMessage('Book uploaded successfully!');
      setUploadForm({ title: '', author: '', description: '', file: null, cover: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (coverInputRef.current) coverInputRef.current.value = '';
      fetchAIBooks(); // Refresh list
      setTimeout(() => setShowUploadModal(false), 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleQuickIngest = async (bookData) => {
    setIngesting(true);
    try {
      await oerService.insertOER({ ...bookData, creator_id: user.id, is_peer_reviewed: true });
      alert(`${bookData.title} ingested successfully!`);
      fetchAIBooks();
    } catch (error) {
      console.error('Ingest error:', error);
      alert(`Ingest failed: ${error.message}. Check console for details.`);
    } finally {
      setIngesting(false);
    }
  };

  const totalPages = Math.ceil(books.length / itemsPerPage);
  const paginatedBooks = books.slice(0, currentPage * itemsPerPage);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleGroup}>
            <div className={styles.iconWrapper}>
              <Cpu size={32} />
            </div>
            <div>
              <h1 className={styles.title}>AI Textbooks Collection</h1>
              <p className={styles.subtitle}>Curated resources for the future of technology</p>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            {user && (
              <button 
                className={styles.uploadBtn}
                onClick={() => setShowUploadModal(true)}
              >
                <Upload size={18} /> Upload Resource
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Developer Priority Ingest Section */}
      {isDeveloper && (
        <section className={styles.priorityIngest}>
          <div className={styles.priorityHeader}>
            <div className={styles.priorityTitleGroup}>
              <Cpu size={20} className={styles.priorityIcon} />
              <h2>Priority Ingest (Developer Only)</h2>
            </div>
            <button 
              className={styles.bulkIngestBtn}
              onClick={async () => {
                if (confirm('Ingest all priority books?')) {
                  setIngesting(true);
                  for (const book of AI_PRIORITY_OER) {
                    try {
                      await handleQuickIngest(book);
                    } catch (e) {
                      console.error(e);
                    }
                  }
                  setIngesting(false);
                }
              }}
              disabled={ingesting}
            >
              {ingesting ? 'Ingesting...' : 'Bulk Ingest All'}
            </button>
          </div>
          <div className={styles.priorityGrid}>
            {AI_PRIORITY_OER.map((book, idx) => (
              <div key={idx} className={styles.priorityCard}>
                <div className={styles.priorityInfo}>
                  <h3>{book.title}</h3>
                  <p>{book.author_names}</p>
                </div>
                <button 
                  className={styles.miniIngestBtn}
                  onClick={() => handleQuickIngest(book)}
                  disabled={ingesting}
                >
                  {ingesting ? '...' : 'Ingest'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search AI textbooks..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAIBooks()}
          />
        </div>
      </div>

      {/* Book Grid */}
      <div className={styles.grid}>
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))
        ) : books.length > 0 ? (
          <>
            {paginatedBooks.map(book => (
              <div key={book.id} className={styles.bookGridItem}>
                <BookCard publication={book} variant="tile" />
                <Link 
                  to={`/book/${book.id}`} 
                  className={styles.gridDetailsLink}
                >
                  View Details
                </Link>
              </div>
            ))}
            
            {/* Infinite Scroll Sentinel */}
            <div ref={loadMoreRef} style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
              {hasMore && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--clay)', fontSize: 14 }}>
                  <div className={styles.spinnerSmall} />
                  Loading more textbooks...
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <Cpu size={48} />
            <h3>No AI textbooks found</h3>
            <p>Be the first to contribute to this collection.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Upload AI Textbook</h2>
              <button onClick={() => setShowUploadModal(false)} className={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className={styles.uploadForm}>
              <div className={styles.formGroup}>
                <label>Title*</label>
                <input 
                  type="text" 
                  required 
                  value={uploadForm.title}
                  onChange={e => setUploadForm({...uploadForm, title: e.target.value})}
                  placeholder="e.g. Deep Learning with Python"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Author(s)*</label>
                <input 
                  type="text" 
                  required 
                  value={uploadForm.author}
                  onChange={e => setUploadForm({...uploadForm, author: e.target.value})}
                  placeholder="e.g. François Chollet"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  rows="3"
                  value={uploadForm.description}
                  onChange={e => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Brief summary of the book..."
                />
              </div>

              <div className={styles.fileInputs}>
                <div className={styles.fileGroup}>
                  <label>PDF File*</label>
                  <div className={styles.fileUploadBox} onClick={() => fileInputRef.current?.click()}>
                    <FileText size={24} />
                    <span>{uploadForm.file ? uploadForm.file.name : 'Select PDF'}</span>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      required
                      ref={fileInputRef}
                      onChange={e => handleFileChange(e, 'file')}
                      hidden
                    />
                  </div>
                </div>

                <div className={styles.fileGroup}>
                  <label>Cover Image</label>
                  <div className={styles.fileUploadBox} onClick={() => coverInputRef.current?.click()}>
                    <BookOpen size={24} />
                    <span>{uploadForm.cover ? uploadForm.cover.name : 'Select Cover'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={coverInputRef}
                      onChange={e => handleFileChange(e, 'cover')}
                      hidden
                    />
                  </div>
                </div>
              </div>

              {uploadStatus && (
                <div className={`${styles.statusMessage} ${styles[uploadStatus]}`}>
                  {uploadStatus === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  {uploadMessage}
                </div>
              )}

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Book'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
