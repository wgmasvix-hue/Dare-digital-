import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Upload, 
  User, 
  Calendar, 
  Building, 
  ArrowRight,
  Filter,
  CheckCircle,
  Clock,
  BookOpen,
  Scan,
  ClipboardList,
  History,
  FileSearch,
  Archive,
  Download,
  Plus,
  X,
  Sparkles,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { researchService } from '../services/researchService';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import styles from './LocalResearch.module.css';

const SUBJECTS = [
  'All',
  'Agriculture & Food Security',
  'Climate Change & Environment',
  'Public Health & Medicine',
  'Engineering & Technology',
  'Education & Pedagogy',
  'Economics & Development',
  'Social Sciences & Humanities',
  'Law & Policy'
];

export default function LocalResearch() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('repository');
  const [research, setResearch] = useState([]);
  const [dspaceResearch, setDspaceResearch] = useState([]);
  const [reports, setReports] = useState([]);
  const [digitizationRequests, setDigitizationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDigitizeModal, setShowDigitizeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [digitizeSuccess, setDigitizeSuccess] = useState(false);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedResourceForReport, setSelectedResourceForReport] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
    const currentList = activeTab === 'repository' ? research : (activeTab === 'dspace' ? dspaceResearch : []);
    if (currentPage * itemsPerPage >= currentList.length) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [currentPage, research.length, dspaceResearch.length, activeTab]);

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    author_names: '',
    institution: '',
    subject: 'Agriculture & Food Security',
    file_url: ''
  });

  const [digitizeData, setDigitizeData] = useState({
    resource_title: '',
    author: '',
    resource_type: 'Book',
    description: '',
    urgency: 'Normal'
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, activeSubject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'repository') {
        const data = await researchService.getResearch({ 
          subject: activeSubject,
          q: searchQuery 
        });
        
        if (data && data.length > 0) {
          setResearch(data);
        } else {
          setResearch([
            {
              id: 'res-1',
              title: 'Impact of Climate-Smart Agriculture on Smallholder Farmers in Masvingo',
              author_names: 'Dr. T. Moyo, Prof. S. Sibanda',
              institution: 'University of Zimbabwe',
              publication_date: '2024-01-15',
              subject: 'Agriculture & Food Security',
              abstract: 'This study investigates the adoption rates and socio-economic impacts of climate-smart agricultural practices among smallholder farmers in the Masvingo province of Zimbabwe...',
              status: 'approved'
            },
            {
              id: 'res-2',
              title: 'Prevalence of Antimicrobial Resistance in Urban Water Systems of Harare',
              author_names: 'L. Gumbo, K. Chidziwa',
              institution: 'National University of Science and Technology',
              publication_date: '2023-11-20',
              subject: 'Public Health & Medicine',
              abstract: 'Antimicrobial resistance (AMR) is a growing global health threat. This research maps the prevalence of resistant bacteria in the Manyame catchment area...',
              status: 'approved'
            },
            {
              id: 'res-3',
              title: 'Digital Transformation in Zimbabwean Secondary Schools: Challenges and Opportunities',
              author_names: 'M. Zhou',
              institution: 'Midlands State University',
              publication_date: '2024-02-05',
              subject: 'Education & Pedagogy',
              abstract: 'The COVID-19 pandemic accelerated the shift towards digital learning. This paper evaluates the current state of ICT infrastructure in rural vs urban schools...',
              status: 'approved'
            }
          ]);
        }
      } else if (activeTab === 'dspace') {
        const data = await researchService.getDSpaceResearch({ 
          q: searchQuery 
        });
        setDspaceResearch(data || []);
      } else if (activeTab === 'reports') {
        const data = await researchService.getArchivalReports();
        if (data && data.length > 0) {
          setReports(data);
        } else {
          setReports([
            {
              id: 'rep-1',
              title: '1950s Agricultural Census: Mashonaland Central',
              type: 'Archival Report',
              description: 'Detailed records of crop yields and livestock counts from the colonial era agricultural census.',
              created_at: '2024-01-10'
            },
            {
              id: 'rep-2',
              title: 'Post-Independence Educational Reform Analysis',
              type: 'Policy Report',
              description: 'A comprehensive review of the 1980 educational reforms and their impact on literacy rates.',
              created_at: '2023-12-15'
            }
          ]);
        }
      } else if (activeTab === 'digitization' && user) {
        const data = await researchService.getDigitizationRequests(user.id);
        setDigitizationRequests(data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await researchService.submitResearch({
        ...formData,
        user_id: user.id,
        publication_date: new Date().toISOString().split('T')[0]
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess(false);
        setFormData({
          title: '',
          abstract: '',
          author_names: '',
          institution: '',
          subject: 'Agriculture & Food Security',
          file_url: ''
        });
        fetchData();
      }, 3000);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit research. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDigitizeSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await researchService.requestDigitization({
        ...digitizeData,
        user_id: user.id
      });
      setDigitizeSuccess(true);
      setTimeout(() => {
        setShowDigitizeModal(false);
        setDigitizeSuccess(false);
        setDigitizeData({
          resource_title: '',
          author: '',
          resource_type: 'Book',
          description: '',
          urgency: 'Normal'
        });
        fetchData();
      }, 3000);
    } catch (err) {
      console.error('Digitization request error:', err);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateReport = async (resource) => {
    setSelectedResourceForReport(resource);
    setIsGeneratingReport(true);
    setIsReportModalOpen(true);
    try {
      const report = await geminiService.generateArchivalReport(resource);
      setGeneratedReport(report);
    } catch (error) {
      console.error('Error generating report:', error);
      setGeneratedReport('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const totalPages = Math.ceil(research.length / itemsPerPage);
  const paginatedResearch = research.slice(0, currentPage * itemsPerPage);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <header className={`${styles.hero} relative overflow-hidden`}>
        {/* Real Book Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=2000" 
            alt="Research Background" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
        </div>

        <div className={`${styles.heroContent} relative z-10`}>
          <div className={styles.badge}>Zimbabwean Academic Repository</div>
          <h1 className={styles.title}>Institutional Digital Repository (IDR)</h1>
          <p className={styles.subtitle}>
            A dedicated space for Zimbabwean academics, researchers, and students to share 
            and discover locally-produced knowledge, OERs, and scientific breakthroughs.
          </p>
          
          <div className={styles.heroActions}>
            <button 
              className={styles.primaryBtn}
              onClick={() => setShowDigitizeModal(true)}
            >
              <Scan size={18} /> Request Digitization
            </button>
            <button 
              className={styles.secondaryBtn}
              onClick={() => setShowSubmitModal(true)}
            >
              <Upload size={18} /> Contribute Your Research
            </button>
          </div>
        </div>
        <div className={styles.heroDecoration}>
          <div className={styles.circle1} />
          <div className={styles.circle2} />
        </div>
      </header>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>1,240+</span>
          <span className={styles.statLabel}>Papers Published</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>12</span>
          <span className={styles.statLabel}>Institutions</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>45k</span>
          <span className={styles.statLabel}>Monthly Reads</span>
        </div>
      </section>

      {/* Main Content */}
      <main id="browse" className={styles.main}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'repository' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('repository')}
          >
            Research Repository
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'dspace' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('dspace')}
          >
            DSpace Repository
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'digitization' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('digitization')}
          >
            Digitization Hub
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'reports' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Archival Reports
          </button>
        </div>

        <div className={styles.contentGrid}>
          {/* Sidebar Filters */}
          <aside className={styles.sidebar}>
            {activeTab === 'repository' && (
              <div className={styles.filterGroup}>
                <h3 className={styles.filterTitle}>
                  <Filter size={16} /> Subjects
                </h3>
                <div className={styles.subjectList}>
                  {SUBJECTS.map(subject => (
                    <button
                      key={subject}
                      className={`${styles.subjectBtn} ${activeSubject === subject ? styles.activeSubject : ''}`}
                      onClick={() => setActiveSubject(subject)}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.contributionCard}>
              <Archive size={32} className="mx-auto mb-4 text-amber-400" />
              <h4>Institutional Archives</h4>
              <p>Are you an institution looking to digitize your local resources?</p>
              <button onClick={() => setShowDigitizeModal(true)}>Partner With Us</button>
            </div>
          </aside>

          {/* Results Area */}
          <div className={styles.resultsArea}>
            {(activeTab === 'repository' || activeTab === 'dspace') && (
              <>
                <form className={styles.searchBar} onSubmit={handleSearch}>
                  <Search size={20} className={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder={activeTab === 'dspace' ? "Search DSpace repository..." : "Search by title, author, or keywords..."} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit">Search</button>
                </form>

                <div className={styles.listHeader}>
                  <h2>
                    {activeTab === 'dspace' ? 'DSpace Repository' : (activeSubject === 'All' ? 'Recent Research' : activeSubject)}
                  </h2>
                  <span>{(activeTab === 'repository' ? research : dspaceResearch).length} results found</span>
                </div>

                <div className={styles.researchList}>
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className={styles.skeletonCard} />
                    ))
                  ) : (activeTab === 'repository' ? paginatedResearch : dspaceResearch.slice(0, currentPage * itemsPerPage)).length > 0 ? (
                    <>
                      {(activeTab === 'repository' ? paginatedResearch : dspaceResearch.slice(0, currentPage * itemsPerPage)).map(item => (
                        <div key={item.id} className={styles.researchCard}>
                          <div className={styles.cardHeader}>
                            <span className={styles.cardSubject}>{item.subject}</span>
                            <span className={styles.cardDate}>
                              <Calendar size={14} /> {item.publication_date}
                            </span>
                            {item.is_dspace && (
                              <span className="ml-auto bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                DSpace
                              </span>
                            )}
                          </div>
                          <h3 className={styles.cardTitle}>
                            {item.url ? (
                              <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                            ) : (
                              <Link to={`/reader/${item.id}`}>{item.title}</Link>
                            )}
                          </h3>
                          <div className={styles.cardMeta}>
                            <span className={styles.cardAuthor}>
                              <User size={14} /> {item.author_names}
                            </span>
                            <span className={styles.cardInstitution}>
                              <Building size={14} /> {item.institution}
                            </span>
                          </div>
                          <p className={styles.cardAbstract}>
                            {item.abstract ? item.abstract.substring(0, 180) : 'No abstract available.'}...
                          </p>
                          <div className={styles.cardActions}>
                            {item.url ? (
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.viewBtn}>
                                View in DSpace <ArrowRight size={16} />
                              </a>
                            ) : (
                              <Link to={`/research/${item.id}`} className={styles.viewBtn}>
                                View Details <ArrowRight size={16} />
                              </Link>
                            )}
                            <button 
                              className={styles.saveBtn}
                              onClick={() => handleGenerateReport(item)}
                            >
                              <Sparkles size={16} /> Report
                            </button>
                            <button className={styles.saveBtn}>
                              <Share2 size={16} /> Share
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Infinite Scroll Sentinel */}
                      <div ref={loadMoreRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
                        {hasMore && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--clay)', fontSize: 14 }}>
                            <div className={styles.spinnerSmall} />
                            Loading more research...
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className={styles.emptyState}>
                      <FileText size={48} />
                      <h3>No research found</h3>
                      <p>Try adjusting your filters or search query.</p>
                      {activeTab === 'dspace' && (
                        <button 
                          onClick={async () => {
                            try {
                              setLoading(true);
                              const { data, error } = await supabase.functions.invoke('repository-sync');
                              if (!error) {
                                await fetchData();
                              }
                            } catch (err) {
                              console.error('Sync failed:', err);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all flex items-center gap-2 mx-auto"
                        >
                          <Loader2 className={loading ? "animate-spin" : ""} size={18} />
                          {loading ? "Syncing..." : "Sync Repository Now"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'digitization' && (
              <div className={styles.digitizationHub}>
                <div className={styles.digitizationIntro}>
                  <h3>Modern Digitization Tools</h3>
                  <p>
                    We provide state-of-the-art tools for converting physical local resources into 
                    high-quality digital assets. Request digitization for rare books, archival 
                    assignments, and historical reports.
                  </p>
                  <div className={styles.digitizationSteps}>
                    <div className={styles.step}>
                      <div className={styles.stepIcon}><ClipboardList size={24} /></div>
                      <h4>1. Request</h4>
                      <p>Submit details of the physical resource.</p>
                    </div>
                    <div className={styles.step}>
                      <div className={styles.stepIcon}><Scan size={24} /></div>
                      <h4>2. Process</h4>
                      <p>Our team scans and indexes the material.</p>
                    </div>
                    <div className={styles.step}>
                      <div className={styles.stepIcon}><CheckCircle size={24} /></div>
                      <h4>3. Access</h4>
                      <p>View the digital version in your library.</p>
                    </div>
                  </div>
                </div>

                <div className={styles.digitizationGrid}>
                  <div className={styles.myRequests}>
                    <div className={styles.listHeader}>
                      <h2>My Digitization Requests</h2>
                      <button 
                        className="text-amber-600 font-semibold flex items-center gap-2"
                        onClick={() => setShowDigitizeModal(true)}
                      >
                        <Plus size={18} /> New Request
                      </button>
                    </div>
                    <div className={styles.requestsList}>
                      {loading ? (
                        <div className={styles.skeletonCard} />
                      ) : digitizationRequests.length > 0 ? (
                        digitizationRequests.map(req => (
                          <div key={req.id} className={styles.requestCard}>
                            <div className={styles.requestInfo}>
                              <h4>{req.resource_title}</h4>
                              <p>{req.author} • Requested on {new Date(req.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`${styles.statusBadge} ${styles[`status${req.status.charAt(0).toUpperCase() + req.status.slice(1)}`]}`}>
                              {req.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                          <History size={32} className="mx-auto mb-3 text-gray-300" />
                          <p className="text-gray-500">No active requests found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.digitizationTools}>
                    <h3 className="font-display text-xl mb-4 text-soil">Tools Available</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-xl border border-mist flex gap-3">
                        <Scan className="text-amber-500" size={20} />
                        <div>
                          <h4 className="font-semibold text-sm">High-Res Scanning</h4>
                          <p className="text-xs text-clay">600 DPI archival quality</p>
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-mist flex gap-3">
                        <FileSearch className="text-amber-500" size={20} />
                        <div>
                          <h4 className="font-semibold text-sm">OCR Processing</h4>
                          <p className="text-xs text-clay">Searchable text extraction</p>
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-mist flex gap-3">
                        <Archive className="text-amber-500" size={20} />
                        <div>
                          <h4 className="font-semibold text-sm">Metadata Tagging</h4>
                          <p className="text-xs text-clay">AI-powered indexing</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className={styles.reportsHub}>
                <div className={styles.listHeader}>
                  <h2>Archival Reports & Assignments</h2>
                  <span>{reports.length} Documents Available</span>
                </div>
                <div className={styles.reportsGrid}>
                  {loading ? (
                    Array(4).fill(0).map((_, i) => <div key={i} className={styles.skeletonCard} />)
                  ) : reports.length > 0 ? (
                    reports.map(report => (
                      <motion.div 
                        key={report.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.reportCard}
                      >
                        <div className={styles.reportIcon}>
                          <FileText size={28} />
                        </div>
                        <div className={styles.reportContent}>
                          <span className={styles.reportType}>{report.type}</span>
                          <h4>{report.title}</h4>
                          <p>{report.description}</p>
                          <div className={styles.reportFooter}>
                            <span className={styles.reportDate}>{new Date(report.created_at).toLocaleDateString()}</span>
                            <button className={styles.downloadBtn}>
                              <Download size={16} /> Download
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                      <ClipboardList size={48} className="mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold text-gray-600">No reports available</h3>
                      <p className="text-gray-400">Check back later for new archival materials</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Archival Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={styles.reportModal}
            >
              <div className={styles.modalHeader}>
                <div className={styles.headerTitle}>
                  <Sparkles className={styles.headerIcon} />
                  <div>
                    <h2>Archival Report</h2>
                    <p>{selectedResourceForReport?.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className={styles.closeButton}
                >
                  <X size={24} />
                </button>
              </div>

              <div className={styles.reportContent}>
                {isGeneratingReport ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>DARA is analyzing the resource and generating a professional archival report...</p>
                  </div>
                ) : (
                  <div className={styles.markdownContent}>
                    {generatedReport}
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button 
                  className={styles.secondaryBtn}
                  onClick={() => setIsReportModalOpen(false)}
                >
                  Close
                </button>
                {!isGeneratingReport && (
                  <button className={styles.primaryBtn}>
                    <Download size={18} /> Download Report
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button 
              className={styles.closeModal}
              onClick={() => setShowSubmitModal(false)}
            >
              <X size={24} />
            </button>

            {submitSuccess ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>
                  <CheckCircle size={64} />
                </div>
                <h2>Submission Received!</h2>
                <p>
                  Thank you for contributing to the Zimbabwean Academic Repository. 
                  Your paper is now in the review queue and will be published once verified.
                </p>
                <div className={styles.reviewStep}>
                  <Clock size={20} />
                  <span>Estimated review time: 3-5 business days</span>
                </div>
              </div>
            ) : (
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <BookOpen size={32} className={styles.modalIcon} />
                  <div>
                    <h2>Submit Your Research</h2>
                    <p>Contribute to Zimbabwe's growing body of academic knowledge.</p>
                  </div>
                </div>

                <form className={styles.submitForm} onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label>Research Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Sustainable Energy Solutions for Rural Zimbabwe"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Author(s)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Full names, separated by commas"
                        value={formData.author_names}
                        onChange={(e) => setFormData({...formData, author_names: e.target.value})}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Institution</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. University of Zimbabwe"
                        value={formData.institution}
                        onChange={(e) => setFormData({...formData, institution: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Subject Area</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    >
                      {SUBJECTS.filter(s => s !== 'All').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Abstract</label>
                    <textarea 
                      required 
                      rows={5}
                      placeholder="Briefly describe your research findings and methodology..."
                      value={formData.abstract}
                      onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Document URL (PDF preferred)</label>
                    <input 
                      type="url" 
                      placeholder="Link to your paper (Google Drive, Dropbox, etc.)"
                      value={formData.file_url}
                      onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                    />
                    <p className={styles.formHint}>Note: We will verify the link before publishing.</p>
                  </div>

                  <div className={styles.formActions}>
                    <button 
                      type="button" 
                      className={styles.cancelBtn}
                      onClick={() => setShowSubmitModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={styles.submitBtn}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Paper'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Digitization Modal */}
      {showDigitizeModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button 
              className={styles.closeModal}
              onClick={() => setShowDigitizeModal(false)}
            >
              <X size={24} />
            </button>

            {digitizeSuccess ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>
                  <CheckCircle size={64} />
                </div>
                <h2>Request Submitted!</h2>
                <p>
                  Your digitization request has been logged. Our archival team will 
                  review the resource details and contact you regarding the next steps.
                </p>
                <button 
                  className={styles.primaryBtn} 
                  style={{ margin: '0 auto' }}
                  onClick={() => {
                    setShowDigitizeModal(false);
                    setDigitizeSuccess(false);
                    setActiveTab('digitization');
                  }}
                >
                  View My Requests
                </button>
              </div>
            ) : (
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <Scan size={32} className={styles.modalIcon} />
                  <div>
                    <h2>Request Digitization</h2>
                    <p>Convert physical resources into digital library assets.</p>
                  </div>
                </div>

                <form className={styles.submitForm} onSubmit={handleDigitizeSubmit}>
                  <div className={styles.formGroup}>
                    <label>Resource Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. 1954 Municipal Records of Bulawayo"
                      value={digitizeData.resource_title}
                      onChange={(e) => setDigitizeData({...digitizeData, resource_title: e.target.value})}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Author / Originator</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Name of author or organization"
                        value={digitizeData.author}
                        onChange={(e) => setDigitizeData({...digitizeData, author: e.target.value})}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Resource Type</label>
                      <select 
                        value={digitizeData.resource_type}
                        onChange={(e) => setDigitizeData({...digitizeData, resource_type: e.target.value})}
                      >
                        <option value="Book">Physical Book</option>
                        <option value="Manuscript">Manuscript</option>
                        <option value="Report">Official Report</option>
                        <option value="Archive">Archival Assignment</option>
                        <option value="Map">Historical Map</option>
                        <option value="Other">Other Physical Media</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Physical Description & Location</label>
                    <textarea 
                      required 
                      rows={3}
                      placeholder="Describe the physical condition and where the resource is currently located..."
                      value={digitizeData.description}
                      onChange={(e) => setDigitizeData({...digitizeData, description: e.target.value})}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Urgency Level</label>
                    <div className="flex gap-4">
                      {['Normal', 'High', 'Urgent'].map(level => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="urgency" 
                            value={level}
                            checked={digitizeData.urgency === level}
                            onChange={(e) => setDigitizeData({...digitizeData, urgency: e.target.value})}
                          />
                          <span className="text-sm">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button 
                      type="button" 
                      className={styles.cancelBtn}
                      onClick={() => setShowDigitizeModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={styles.submitBtn}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
