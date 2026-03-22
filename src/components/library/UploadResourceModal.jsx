import { useState } from 'react';
import { X, Upload, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
import styles from './UploadResourceModal.module.css';
import { oerService } from '../../services/oerService';
import { useAuth } from '../../hooks/useAuth';

const FACULTIES = [
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'business', label: 'Business' },
  { id: 'education', label: 'Education' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'health', label: 'Health' },
  { id: 'humanities', label: 'Humanities' },
  { id: 'law', label: 'Law' },
  { id: 'stem', label: 'STEM' },
  { id: 'other', label: 'Other' }
];

export default function UploadResourceModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    subject: 'agriculture',
    publisher: '',
    year: new Date().getFullYear(),
    license: 'CC BY 4.0'
  });
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCoverChange = (e) => {
    if (e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resource file (PDF/EPUB).');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 1. Upload File
      const fileUrl = await oerService.uploadFile(file, 'resources');
      
      // 2. Upload Cover (if any)
      let coverUrl = null;
      if (coverImage) {
        coverUrl = await oerService.uploadFile(coverImage, 'covers');
      }

      // 3. Insert Metadata
      const content = {
        title: formData.title,
        authors: formData.author.split(',').map(a => a.trim()),
        description: formData.description,
        subject: formData.subject,
        publisher_name: formData.publisher || 'Partner Institution',
        publication_year: formData.year,
        license_type: formData.license,
        file_url: fileUrl,
        cover_image_url: coverUrl,
        creator_id: user?.id,
        format: file.name.split('.').pop().toLowerCase(),
        access_model: 'dare_access',
        is_peer_reviewed: true // Assuming partner uploads are vetted
      };

      await oerService.insertOER(content);
      
      setSuccess(true);
      if (onSuccess) onSuccess();
      
      // Reset form after delay
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          title: '',
          author: '',
          description: '',
          subject: 'agriculture',
          publisher: '',
          year: new Date().getFullYear(),
          license: 'CC BY 4.0'
        });
        setFile(null);
        setCoverImage(null);
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload resource.');
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal} style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--leaf)', marginBottom: '16px' }}>
            <CheckCircle size={64} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Upload Successful!</h3>
          <p style={{ color: 'var(--clay)' }}>Your resource has been added to the library.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <Upload className={styles.icon} size={24} />
            <h2>Upload Partner Resource</h2>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#b91c1c', 
            padding: '12px', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Resource Title *</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Introduction to Agronomy"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Author(s) *</label>
              <input 
                type="text" 
                required
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
                placeholder="Comma separated names"
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Subject *</label>
              <select 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              >
                {FACULTIES.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Brief summary of the resource..."
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Publisher</label>
              <input 
                type="text" 
                value={formData.publisher}
                onChange={e => setFormData({...formData, publisher: e.target.value})}
                placeholder="Institution Name"
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Year</label>
              <input 
                type="number" 
                value={formData.year}
                onChange={e => setFormData({...formData, year: e.target.value})}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Resource File (PDF/EPUB) *</label>
              <div className={styles.fileInput} onClick={() => document.getElementById('resourceFile').click()}>
                <input 
                  id="resourceFile"
                  type="file" 
                  accept=".pdf,.epub"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <FileText size={24} color="var(--clay)" />
                  <span style={{ fontSize: '0.9rem', color: file ? 'var(--soil)' : 'var(--clay)' }}>
                    {file ? file.name : 'Click to select file'}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Cover Image (Optional)</label>
              <div className={styles.fileInput} onClick={() => document.getElementById('coverFile').click()}>
                <input 
                  id="coverFile"
                  type="file" 
                  accept="image/*"
                  onChange={handleCoverChange}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={24} color="var(--clay)" />
                  <span style={{ fontSize: '0.9rem', color: coverImage ? 'var(--soil)' : 'var(--clay)' }}>
                    {coverImage ? coverImage.name : 'Click to select image'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.secondaryBtn} disabled={uploading}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
