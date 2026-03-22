import { useState } from 'react';
import { X, ScanLine, Book, Send } from 'lucide-react';
import styles from './DigitizationRequestModal.module.css';

export default function DigitizationRequestModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    notes: '',
    priority: 'normal'
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would submit to Supabase
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <ScanLine size={48} />
            </div>
            <h3>Request Received!</h3>
            <p>We've added this title to our digitization queue. You'll be notified when it becomes available.</p>
            <button onClick={onClose} className={styles.primaryBtn}>
              Back to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <ScanLine className={styles.icon} size={24} />
            <h2>Request Digitization</h2>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>
        
        <p className={styles.description}>
          Can't find a book? Request a physical copy to be scanned and added to the digital library.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Book Title *</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. The Stone Virgins"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Author</label>
              <input 
                type="text" 
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
                placeholder="e.g. Yvonne Vera"
              />
            </div>
            <div className={styles.inputGroup}>
              <label>ISBN (Optional)</label>
              <input 
                type="text" 
                value={formData.isbn}
                onChange={e => setFormData({...formData, isbn: e.target.value})}
                placeholder="978-..."
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Why is this needed? (Optional)</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="e.g. Required for ZIMCHE History module..."
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.secondaryBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn}>
              <Send size={16} /> Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
