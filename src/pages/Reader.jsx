import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize, Minimize, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import styles from './Reader.module.css';

export default function Reader() {
  const { id } = useParams();
  const { user, institution } = useAuth();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    async function fetchBookAndCheckAccess() {
      try {
        setLoading(true);
        
        // 1. Fetch Publication
        const { data: pubData, error: pubError } = await supabase
          .from('publications')
          .select('*')
          .eq('id', id)
          .single();

        if (pubError) throw pubError;
        setBook(pubData);

        // 2. Check Access (Simplified logic for Reader)
        let hasAccess = false;
        if (['free', 'open_access'].includes(pubData.access_model)) {
          hasAccess = true;
        } else if (user && institution) {
          const { data: license } = await supabase
            .from('licenses')
            .select('*')
            .eq('institution_id', institution.id)
            .eq('publication_id', pubData.id)
            .eq('status', 'active')
            .single();
          if (license) hasAccess = true;
        }

        // Allow preview if available
        const isPreview = new URLSearchParams(window.location.search).get('preview');
        if (!hasAccess && !isPreview) {
            // Redirect if no access and not preview mode
            // For now, we'll just set accessGranted to false and show a message
        } else {
            setAccessGranted(true);
        }

        // 3. Log Reading Session Start
        if (user) {
          await supabase.from('reading_sessions').upsert({
            user_id: user.id,
            publication_id: id,
            last_read_at: new Date().toISOString(),
            // In a real app, we'd track page progress here
          }, { onConflict: 'user_id, publication_id' });
        }

      } catch (err) {
        console.error('Error loading reader:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookAndCheckAccess();
  }, [id, user, institution]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading document...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className={styles.errorContainer}>
        <h2>Document not found</h2>
        <Link to="/library" className={styles.backLink}>Return to Library</Link>
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className={styles.errorContainer}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this document.</p>
        <Link to={`/book/${id}`} className={styles.backLink}>Go back to details</Link>
      </div>
    );
  }

  return (
    <div className={`${styles.readerContainer} ${isFullscreen ? styles.fullscreen : ''}`}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>{book.title}</h1>
        </div>
        
        <div className={styles.toolbarRight}>
          <button onClick={toggleFullscreen} className={styles.toolBtn} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          {/* Only show download if allowed */}
          {book.allow_download && (
            <a href={book.file_path} download className={styles.toolBtn} title="Download PDF">
              <Download size={20} />
            </a>
          )}
        </div>
      </div>

      {/* PDF Viewer (Iframe fallback) */}
      <div className={styles.viewerContent}>
        {book.file_path ? (
          <iframe 
            src={`${book.file_path}#toolbar=0`} 
            className={styles.pdfFrame}
            title={book.title}
          />
        ) : (
          <div className={styles.noFile}>
            <p>No PDF file associated with this record.</p>
          </div>
        )}
      </div>
    </div>
  );
}
