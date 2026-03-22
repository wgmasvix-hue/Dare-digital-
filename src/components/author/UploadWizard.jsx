import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  X, 
  AlertCircle, 
  Info,
  DollarSign,
  BookOpen,
  Lock,
  ShieldCheck,
  Globe,
  Sparkles,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { enrichMetadata } from '../../services/enrichmentService';
import styles from './UploadWizard.module.css';

const STEPS = [
  { id: 1, label: 'Book Details' },
  { id: 2, label: 'Classification' },
  { id: 3, label: 'File Upload' },
  { id: 4, label: 'Access & Pricing' },
  { id: 5, label: 'Review & Submit' }
];

const ACCESS_MODELS = [
  { 
    id: 'free', 
    label: 'Free', 
    desc: 'Anyone can read this', 
    icon: Globe,
    color: 'var(--leaf)'
  },
  { 
    id: 'preview', 
    label: 'Preview Only', 
    desc: '25 pages free, full access via institution', 
    icon: Lock,
    color: 'var(--amber)'
  },
  { 
    id: 'institutional', 
    label: 'Institutional Only', 
    desc: 'Licensed institutions only', 
    icon: ShieldCheck,
    color: 'var(--soil)'
  }
];

const LEVELS = ['Certificate', 'Diploma', 'HND', 'Degree', 'Masters', 'PhD'];

const SUBJECTS = [
  'STEM', 'Agriculture', 'Health', 'Business', 
  'Education', 'Engineering', 'Law', 'Humanities', 'AI & Future Tech'
];

const EDUCATION_50_PILLARS = [
  'Teaching', 'Research', 'Community Engagement', 'Innovation', 'Industrialisation'
];

export default function UploadWizard() {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionId, setSubmissionId] = useState(null);
  const [error, setError] = useState(null);
  const [isEnriching, setIsEnriching] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    keywords: [],
    language: 'English',
    subject: '',
    zimcheCodes: [],
    targetAudience: '',
    level: '',
    edition: '',
    education50Pillars: [],
    accessModel: 'preview',
    price: '',
    isbn: '',
    license: 'All Rights Reserved',
    copyrightDeclared: false,
    enrichmentData: null,
    bookUrl: ''
  });

  const LICENSES = [
    { value: 'All Rights Reserved', label: 'All Rights Reserved' },
    { value: 'CC BY', label: 'CC BY (Attribution)' },
    { value: 'CC BY-SA', label: 'CC BY-SA (ShareAlike)' },
    { value: 'CC BY-NC', label: 'CC BY-NC (Non-Commercial)' },
    { value: 'CC BY-ND', label: 'CC BY-ND (NoDerivatives)' },
    { value: 'Public Domain', label: 'Public Domain' }
  ];

  // Files
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // UI State for inputs
  const [keywordInput, setKeywordInput] = useState('');
  const [zimcheInput, setZimcheInput] = useState('');
  const [zimcheError, setZimcheError] = useState(null);

  const ZIMCHE_SUGGESTIONS = [
    'BSC-AI-001', 'BSC-CS-101', 'BACC-101', 'HCS101', 'ENG-CIV-201', 'MED-SUR-501'
  ];

  const validateZimcheCode = (code) => {
    // Format: 2-4 letters followed by optional dash and 3-6 alphanumeric chars
    // e.g., BSC-AI-001, HCS101, ENG-201
    const regex = /^[A-Z]{2,4}(-?[A-Z]{2,4})?-?\d{3,6}$/;
    return regex.test(code);
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Keyword Handlers
  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = keywordInput.trim();
      if (tag && !formData.keywords.includes(tag) && formData.keywords.length < 10) {
        setFormData(prev => ({ ...prev, keywords: [...prev.keywords, tag] }));
        setKeywordInput('');
      }
    }
  };

  const removeKeyword = (tag) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== tag) }));
  };

  // ZIMCHE Handlers
  const handleZimcheKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const code = zimcheInput.trim().toUpperCase();
      
      if (!code) return;

      if (formData.zimcheCodes.includes(code)) {
        setZimcheError('Code already added');
        return;
      }

      if (!validateZimcheCode(code)) {
        setZimcheError('Invalid format. Example: BSC-AI-001 or HCS101');
        return;
      }

      setFormData(prev => ({ ...prev, zimcheCodes: [...prev.zimcheCodes, code] }));
      setZimcheInput('');
      setZimcheError(null);
    }
  };

  const addZimcheSuggestion = (code) => {
    if (!formData.zimcheCodes.includes(code)) {
      setFormData(prev => ({ ...prev, zimcheCodes: [...prev.zimcheCodes, code] }));
      setZimcheError(null);
    }
  };

  const removeZimche = (code) => {
    setFormData(prev => ({ ...prev, zimcheCodes: prev.zimcheCodes.filter(c => c !== code) }));
  };

  // File Handlers
  const handlePdfDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    validateAndSetPdf(file);
  };

  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    validateAndSetPdf(file);
  };

  const validateAndSetPdf = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    if (file.size > 150 * 1024 * 1024) { // 150MB
      setError('File size exceeds 150MB limit.');
      return;
    }
    setPdfFile(file);
    setError(null);
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('Cover image exceeds 5MB limit.');
      return;
    }
    // Revoke previous preview URL to prevent memory leak
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleEnrich = async () => {
    if (!formData.title || !formData.description) {
      setError('Title and Description are required for AI enrichment.');
      return;
    }

    setIsEnriching(true);
    setError(null);

    try {
      const enrichment = await enrichMetadata({
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        authors: user.user_metadata?.full_name || 'Unknown Author',
        keywords: formData.keywords,
        language: formData.language
      });

      // Map enrichment to form fields
      const primaryDiscipline = enrichment.disciplines.find(d => d.is_primary)?.code || '';
      const mappedSubject = SUBJECTS.find(s => s.toUpperCase().includes(primaryDiscipline)) || SUBJECTS[0];

      setFormData(prev => ({
        ...prev,
        subject: mappedSubject,
        zimcheCodes: [...new Set([...prev.zimcheCodes, ...enrichment.disciplines.map(d => d.code)])],
        keywords: [...new Set([...prev.keywords, ...enrichment.subject_tags])].slice(0, 10),
        level: mapNQFToLevel(enrichment.nqf_level.level),
        education50Pillars: enrichment.education_5_0_mapping || [],
        enrichmentData: enrichment
      }));

      // Success feedback or just continue
    } catch (err) {
      console.error('Enrichment error:', err);
      setError('DARA AI enrichment failed. You can still fill the fields manually.');
    } finally {
      setIsEnriching(false);
    }
  };

  const mapNQFToLevel = (nqf) => {
    const map = {
      'nqf_1': 'Certificate',
      'nqf_2': 'Certificate',
      'nqf_3': 'Diploma',
      'nqf_4': 'HND',
      'nqf_5': 'Degree',
      'nqf_6': 'Degree',
      'nqf_7': 'Masters',
      'nqf_8': 'PhD'
    };
    return map[nqf] || '';
  };

  // Navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError(null);
    }
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.title) {
          setError('Title is required.');
          return false;
        }
        if (!formData.description || formData.description.trim().split(/\s+/).length < 5) {
          setError('Description must be at least 5 words.');
          return false;
        }
        break;
      case 2:
        if (!formData.subject) {
          setError('Please select a subject.');
          return false;
        }
        if (!formData.level) {
          setError('Please select a programme level.');
          return false;
        }
        break;
      case 3:
        if (!pdfFile && !formData.bookUrl) {
          setError('Please upload a PDF manuscript or provide a valid URL.');
          return false;
        }
        if (formData.bookUrl && !formData.bookUrl.startsWith('http')) {
          setError('Please enter a valid URL starting with http:// or https://');
          return false;
        }
        break;
      case 4:
        // Access model validation — price required only for preview model if logic dictates
        if (formData.accessModel === 'preview' && formData.price && isNaN(parseFloat(formData.price))) {
          setError('Please enter a valid price.');
          return false;
        }
        break;
      case 5:
        if (!formData.copyrightDeclared) {
          setError('You must declare copyright ownership.');
          return false;
        }
        break;
    }
    return true;
  };

  // Submit Logic
  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setLoading(true);
    setUploadProgress(0);

    try {
      // 1. Upload Files first to get URLs
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const timestamp = Date.now();
      
      // Upload PDF
      let pdfUrl = formData.bookUrl;

      if (pdfFile) {
        const pdfFileName = `${timestamp}_${pdfFile.name.replace(/\s+/g, '_')}`;
        const { error: pdfError } = await supabase.storage
          .from('books')
          .upload(`pdfs/${pdfFileName}`, pdfFile);

        if (pdfError) throw pdfError;
        
        pdfUrl = supabase.storage.from('books').getPublicUrl(`pdfs/${pdfFileName}`).data.publicUrl;
      }

      // Upload Cover (if exists)
      let coverUrl = null;
      if (coverFile) {
        const coverFileName = `${timestamp}_${coverFile.name.replace(/\s+/g, '_')}`;
        const { error: coverError } = await supabase.storage
          .from('books')
          .upload(`covers/${coverFileName}`, coverFile);
        
        if (coverError) throw coverError;
        coverUrl = supabase.storage.from('books').getPublicUrl(`covers/${coverFileName}`).data.publicUrl;
      }

      // 2. Insert Book Record
      const { data: book, error: submitError } = await supabase
        .from('books')
        .insert({
          title: formData.title,
          author_names: user.user_metadata?.full_name || 'Unknown Author', // Or add author field to form
          description: formData.description,
          subject: formData.subject,
          zimche_programme_codes: formData.zimcheCodes,
          pillars: formData.education50Pillars,
          level: formData.level,
          file_url: pdfUrl,
          cover_image_url: coverUrl,
          access_model: formData.accessModel,
          creator_id: user.id,
          status: 'published', // Auto-publish for now
          institution_id: formData.accessModel === 'institutional' ? user.institution_id : null, // Assuming user has institution_id
          page_count: 0,
          isbn: formData.isbn,
          enrichment_data: formData.enrichmentData || {}
        })
        .select()
        .single();

      if (submitError) throw submitError;
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSubmissionId(book.id);
      setLoading(false);

    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'An error occurred during submission.');
      setLoading(false);
    }
  };

  if (submissionId && uploadProgress === 100) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <Check size={48} strokeWidth={3} />
          </div>
          <h2>Submission Successful!</h2>
          <p>Your book has been successfully uploaded and is now available.</p>
          <div className={styles.submissionId}>
            <span>ID:</span>
            <code>{submissionId}</code>
          </div>
          <Link to="/author" className={styles.dashboardBtn}>
            Back to Author Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wizardContainer}>
      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressSteps}>
          {STEPS.map((step, index) => (
            <div 
              key={step.id} 
              className={`${styles.step} ${currentStep >= step.id ? styles.activeStep : ''}`}
            >
              <div className={styles.stepNumber}>
                {currentStep > step.id ? <Check size={14} /> : step.id}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
              {index < STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.formCard}>
        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: BOOK DETAILS */}
        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Book Details</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Title <span className={styles.required}>*</span></label>
              <input 
                type="text" 
                name="title" 
                className={styles.input} 
                value={formData.title} 
                onChange={handleInputChange}
                placeholder="Enter the full title of the publication"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Subtitle</label>
              <input 
                type="text" 
                name="subtitle" 
                className={styles.input} 
                value={formData.subtitle} 
                onChange={handleInputChange}
                placeholder="Optional subtitle"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Description / Abstract <span className={styles.required}>*</span></label>
              <textarea 
                name="description" 
                className={styles.textarea} 
                value={formData.description} 
                onChange={handleInputChange}
                placeholder="Provide a summary of the content (100-500 words)"
                rows={6}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Keywords (Max 10)</label>
              <div className={styles.tagInputWrapper}>
                {formData.keywords.map(tag => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button onClick={() => removeKeyword(tag)} className={styles.removeTag}><X size={12} /></button>
                  </span>
                ))}
                <input 
                  type="text" 
                  className={styles.tagInput} 
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  placeholder={formData.keywords.length < 10 ? "Type and press Enter..." : ""}
                  disabled={formData.keywords.length >= 10}
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Language</label>
              <select name="language" className={styles.select} value={formData.language} onChange={handleInputChange}>
                <option value="English">English</option>
                <option value="Shona">Shona</option>
                <option value="Ndebele">Ndebele</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: CLASSIFICATION */}
        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Classification</h2>
              <button 
                className={styles.enrichBtn}
                onClick={handleEnrich}
                disabled={isEnriching}
              >
                {isEnriching ? (
                  <>
                    <Loader2 size={16} className={styles.spin} />
                    <span>Enriching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Auto-fill with DARA AI</span>
                  </>
                )}
              </button>
            </div>
            
            {formData.enrichmentData && (
              <div className={styles.enrichmentSuccess}>
                <Sparkles size={14} />
                <span>Enriched by DARA AI: {formData.enrichmentData.dara_summary.substring(0, 100)}...</span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>Subject <span className={styles.required}>*</span></label>
              <select name="subject" className={styles.select} value={formData.subject} onChange={handleInputChange}>
                <option value="">Select a subject</option>
                {SUBJECTS.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                ZIMCHE Programme Codes
                <span className={styles.labelHint}> (Press Enter to add)</span>
              </label>
              <div className={`${styles.tagInputWrapper} ${zimcheError ? styles.inputError : ''}`}>
                {formData.zimcheCodes.map(code => (
                  <span key={code} className={styles.tag}>
                    {code}
                    <button onClick={() => removeZimche(code)} className={styles.removeTag}><X size={12} /></button>
                  </span>
                ))}
                <input 
                  type="text" 
                  className={styles.tagInput} 
                  value={zimcheInput}
                  onChange={(e) => {
                    setZimcheInput(e.target.value);
                    if (zimcheError) setZimcheError(null);
                  }}
                  onKeyDown={handleZimcheKeyDown}
                  placeholder="e.g. BSC-AI-001"
                />
              </div>
              {zimcheError && <p className={styles.fieldError}>{zimcheError}</p>}
              
              <div className={styles.suggestions}>
                <span className={styles.suggestionLabel}>Suggestions:</span>
                <div className={styles.suggestionList}>
                  {ZIMCHE_SUGGESTIONS.map(sug => (
                    <button 
                      key={sug} 
                      type="button"
                      className={styles.suggestionItem}
                      onClick={() => addZimcheSuggestion(sug)}
                      disabled={formData.zimcheCodes.includes(sug)}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Education 5.0 Pillars</label>
              <div className={styles.checkboxGrid}>
                {EDUCATION_50_PILLARS.map(pillar => (
                  <label key={pillar} className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={formData.education50Pillars.includes(pillar)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          education50Pillars: checked 
                            ? [...prev.education50Pillars, pillar]
                            : prev.education50Pillars.filter(p => p !== pillar)
                        }));
                      }}
                    />
                    <span>{pillar}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Target Audience</label>
              <input 
                type="text" 
                name="targetAudience" 
                className={styles.input} 
                value={formData.targetAudience} 
                onChange={handleInputChange}
                placeholder="e.g. 2nd year BSc Agriculture students"
              />
            </div>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Programme Level <span className={styles.required}>*</span></label>
                <select name="level" className={styles.select} value={formData.level} onChange={handleInputChange}>
                  <option value="">Select Level</option>
                  {LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Edition</label>
                <input 
                  type="text" 
                  name="edition" 
                  className={styles.input} 
                  value={formData.edition} 
                  onChange={handleInputChange}
                  placeholder="e.g. 3rd Edition"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FILE UPLOAD */}
        {currentStep === 3 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>File Upload</h2>
            
            <div className={styles.uploadSection}>
              <label className={styles.label}>Manuscript (PDF) <span className={styles.required}>*</span></label>
              
              <div className={styles.uploadTabs}>
                <button 
                  className={`${styles.uploadTab} ${!formData.bookUrl ? styles.activeTab : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, bookUrl: '' }))}
                >
                  Upload File
                </button>
                <button 
                  className={`${styles.uploadTab} ${formData.bookUrl ? styles.activeTab : ''}`}
                  onClick={() => setPdfFile(null)}
                >
                  Provide URL
                </button>
              </div>

              {!formData.bookUrl ? (
                <div 
                  className={`${styles.dropZone} ${pdfFile ? styles.fileSelected : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handlePdfDrop}
                >
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={handlePdfSelect} 
                    className={styles.fileInput} 
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className={styles.dropLabel}>
                    {pdfFile ? (
                      <div className={styles.fileInfo}>
                        <FileText size={32} className={styles.fileIcon} />
                        <div className={styles.fileName}>{pdfFile.name}</div>
                        <div className={styles.fileSize}>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</div>
                        <span className={styles.changeFile}>Click to change</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={48} className={styles.uploadIcon} />
                        <span className={styles.dropText}>Drag & drop PDF here or click to browse</span>
                        <span className={styles.dropSubText}>Max size: 150MB</span>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <div className={styles.urlInputWrapper}>
                  <input 
                    type="url" 
                    name="bookUrl"
                    className={styles.input}
                    value={formData.bookUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/manuscript.pdf"
                  />
                  <p className={styles.helpText}>Provide a direct link to the PDF manuscript.</p>
                </div>
              )}
            </div>

            <div className={styles.uploadSection}>
              <label className={styles.label}>Cover Image (Optional)</label>
              <div className={styles.coverUploadRow}>
                <div className={styles.coverPreview}>
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover Preview" />
                  ) : (
                    <div className={styles.placeholderCover}>
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
                <div className={styles.coverActions}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCoverSelect} 
                    className={styles.fileInput} 
                    id="cover-upload"
                  />
                  <label htmlFor="cover-upload" className={styles.uploadBtn}>
                    Choose Image
                  </label>
                  <p className={styles.helpText}>JPG or PNG, max 5MB. Recommended ratio 2:3.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ACCESS & PRICING */}
        {currentStep === 4 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Access & Pricing</h2>
            
            <div className={styles.accessGrid}>
              {ACCESS_MODELS.map(model => (
                <label 
                  key={model.id} 
                  className={`${styles.accessCard} ${formData.accessModel === model.id ? styles.activeAccess : ''}`}
                  style={{ '--accent': model.color }}
                >
                  <input 
                    type="radio" 
                    name="accessModel" 
                    value={model.id} 
                    checked={formData.accessModel === model.id} 
                    onChange={handleInputChange}
                    className={styles.hiddenRadio}
                  />
                  <div className={styles.accessIcon}>
                    <model.icon size={24} />
                  </div>
                  <h3 className={styles.accessLabel}>{model.label}</h3>
                  <p className={styles.accessDesc}>{model.desc}</p>
                </label>
              ))}
            </div>

            {formData.accessModel !== 'free' && formData.accessModel !== 'institutional' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Price (USD)</label>
                <div className={styles.inputWrapper}>
                  <DollarSign size={16} className={styles.inputIcon} />
                  <input 
                    type="number" 
                    name="price" 
                    className={styles.input} 
                    value={formData.price} 
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>License Type</label>
                <select name="license" className={styles.select} value={formData.license} onChange={handleInputChange}>
                  {LICENSES.map(lic => (
                    <option key={lic.value} value={lic.value}>{lic.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>ISBN (Optional)</label>
                <input 
                  type="text" 
                  name="isbn" 
                  className={styles.input} 
                  value={formData.isbn} 
                  onChange={handleInputChange}
                  placeholder="e.g. 978-3-16-148410-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & SUBMIT */}
        {currentStep === 5 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Review & Submit</h2>
            
            <div className={styles.summaryCard}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Title:</span>
                <span className={styles.summaryValue}>{formData.title}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Subject:</span>
                <span className={styles.summaryValue}>
                  {formData.subject || 'Unknown'}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Access Model:</span>
                <span className={styles.summaryValue}>
                  {ACCESS_MODELS.find(m => m.id === formData.accessModel)?.label}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>License:</span>
                <span className={styles.summaryValue}>{formData.license}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Files:</span>
                <span className={styles.summaryValue}>
                  {pdfFile?.name} {coverFile && `+ ${coverFile.name}`}
                </span>
              </div>
            </div>

            <div className={styles.attributionPreview}>
              <h3>Attribution Preview</h3>
              <div className={styles.previewBox}>
                <p>
                  <strong>{formData.title}</strong> by {user?.user_metadata?.first_name || 'Author'} {user?.user_metadata?.last_name || ''}. 
                  Published via Dare Digital Library. {new Date().getFullYear()}.
                </p>
              </div>
            </div>

            <label className={styles.copyrightCheckbox}>
              <input 
                type="checkbox" 
                name="copyrightDeclared" 
                checked={formData.copyrightDeclared} 
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>
                I confirm I own the rights to publish this work and it does not infringe on any third-party copyrights.
              </span>
            </label>
          </div>
        )}

        {/* Uploading Overlay */}
        {loading && (
          <div className={styles.uploadOverlay}>
            <div className={styles.uploadProgressCard}>
              <UploadCloud size={48} className={styles.uploadingIcon} />
              <h3>Uploading Publication</h3>
              <p>Please wait while we process your manuscript and cover image...</p>
              
              <div className={styles.uploadProgress}>
                <div className={styles.progressLabel}>
                  <span>{uploadProgress < 100 ? 'Uploading...' : 'Finalizing...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          {currentStep > 1 && !loading && (
            <button onClick={prevStep} className={styles.backBtn}>
              <ChevronLeft size={18} /> Back
            </button>
          )}
          
          {currentStep < 5 ? (
            <button onClick={nextStep} className={styles.nextBtn}>
              Next Step <ChevronRight size={18} />
            </button>
          ) : (
            !loading && (
              <button 
                onClick={handleSubmit} 
                className={styles.submitBtn}
                disabled={!formData.copyrightDeclared}
              >
                Submit Publication
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
