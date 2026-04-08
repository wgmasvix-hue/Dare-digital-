import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  User, 
  Building, 
  Calendar, 
  BookOpen,
  FileText,
  MessageSquare,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { researchService } from '../services/researchService';
import styles from './ResearchDetail.module.css';

export default function ResearchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaper();
  }, [id]);

  const fetchPaper = async () => {
    try {
      setLoading(true);
      // Mock data for the research section if not found in DB
      const mockData = [
        {
          id: 'res-1',
          title: 'Impact of Climate-Smart Agriculture on Smallholder Farmers in Masvingo',
          author_names: 'Dr. T. Moyo, Prof. S. Sibanda',
          institution: 'University of Zimbabwe',
          publication_date: '2024-01-15',
          subject: 'Agriculture & Food Security',
          abstract: 'This study investigates the adoption rates and socio-economic impacts of climate-smart agricultural practices among smallholder farmers in the Masvingo province of Zimbabwe. Using a mixed-methods approach, the researchers analyzed data from 450 households across three districts. The findings suggest that while adoption of conservation agriculture and drought-resistant crop varieties has increased by 35% over the last five years, significant barriers remain, including limited access to credit and specialized equipment. However, those who adopted at least three CSA practices reported a 20% increase in crop yields and improved food security during the 2022/23 drought cycle.',
          methodology: 'Mixed-methods approach including household surveys, focus group discussions, and field observations.',
          conclusions: 'The study concludes that targeted policy interventions focusing on financial inclusion and extension services are critical for scaling up CSA adoption in semi-arid regions of Zimbabwe.',
          file_url: 'https://example.com/research/csa-masvingo.pdf',
          keywords: ['Climate-Smart Agriculture', 'Smallholder Farmers', 'Zimbabwe', 'Food Security', 'Masvingo']
        },
        {
          id: 'res-2',
          title: 'Prevalence of Antimicrobial Resistance in Urban Water Systems of Harare',
          author_names: 'L. Gumbo, K. Chidziwa',
          institution: 'National University of Science and Technology',
          publication_date: '2023-11-20',
          subject: 'Public Health & Medicine',
          abstract: 'Antimicrobial resistance (AMR) is a growing global health threat. This research maps the prevalence of resistant bacteria in the Manyame catchment area, which serves as the primary water source for Harare. Water samples were collected from ten strategic points, including wastewater treatment plants and residential tap outlets. Laboratory analysis revealed high levels of multi-drug resistant E. coli and Klebsiella pneumoniae, particularly downstream from industrial zones. The study highlights the urgent need for improved wastewater treatment infrastructure and stricter regulations on pharmaceutical waste disposal.',
          file_url: 'https://example.com/research/amr-harare.pdf',
          keywords: ['AMR', 'Water Quality', 'Harare', 'Public Health', 'Zimbabwe']
        },
        {
          id: 'res-3',
          title: 'Digital Transformation in Zimbabwean Secondary Schools: Challenges and Opportunities',
          author_names: 'M. Zhou',
          institution: 'Midlands State University',
          publication_date: '2024-02-05',
          subject: 'Education & Pedagogy',
          abstract: 'The COVID-19 pandemic accelerated the shift towards digital learning. This paper evaluates the current state of ICT infrastructure in rural vs urban schools across Zimbabwe. Through a comprehensive audit of 100 secondary schools, the research identifies a significant "digital divide," with rural schools lacking basic internet connectivity and hardware. However, the study also showcases innovative mobile-learning initiatives that have successfully reached marginalized students. The paper proposes a framework for a national digital education strategy that prioritizes infrastructure development and teacher training.',
          file_url: 'https://example.com/research/digital-edu-zim.pdf',
          keywords: ['Digital Learning', 'Education', 'Zimbabwe', 'ICT', 'Digital Divide']
        }
      ];

      const found = mockData.find(p => p.id === id);
      if (found) {
        setPaper(found);
      } else {
        const data = await researchService.getResearchById(id);
        setPaper(data);
      }
    } catch (err) {
      console.error('Error fetching paper:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading research paper...</p>
      </div>
    );
  }

  if (!paper) {
    return <Navigate to="/premium" replace />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Navigation */}
        <nav className={styles.nav}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <ArrowLeft size={20} /> Back
          </button>
          <div className={styles.breadcrumbs}>
            <Link to="/research">Research</Link>
            <span>/</span>
            <span className={styles.current}>{paper.subject}</span>
          </div>
        </nav>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <span className={styles.subjectBadge}>{paper.subject}</span>
            <h1 className={styles.title}>{paper.title}</h1>
            
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <User size={18} />
                <div>
                  <label>Authors</label>
                  <span>{paper.author_names}</span>
                </div>
              </div>
              <div className={styles.metaItem}>
                <Building size={18} />
                <div>
                  <label>Institution</label>
                  <span>{paper.institution}</span>
                </div>
              </div>
              <div className={styles.metaItem}>
                <Calendar size={18} />
                <div>
                  <label>Published</label>
                  <span>{paper.publication_date}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Link to={`/reader/${paper.id}`} className={styles.readBtn}>
              <BookOpen size={20} /> Read Full Paper
            </Link>
            <div className={styles.secondaryActions}>
              <button title="Save to Library"><Bookmark size={20} /></button>
              <button title="Share"><Share2 size={20} /></button>
              <button title="Discuss"><MessageSquare size={20} /></button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className={styles.grid}>
          <div className={styles.mainCol}>
            <section className={styles.section}>
              <h3>Abstract</h3>
              <p className={styles.abstract}>{paper.abstract}</p>
            </section>

            {paper.methodology && (
              <section className={styles.section}>
                <h3>Methodology</h3>
                <p>{paper.methodology}</p>
              </section>
            )}

            {paper.conclusions && (
              <section className={styles.section}>
                <h3>Conclusions</h3>
                <p>{paper.conclusions}</p>
              </section>
            )}

            <section className={styles.section}>
              <h3>Keywords</h3>
              <div className={styles.keywords}>
                {paper.keywords?.map(kw => (
                  <span key={kw} className={styles.keyword}>{kw}</span>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h4>Citation</h4>
              <div className={styles.citationBox}>
                <p>
                  {paper.author_names} ({paper.publication_date.split('-')[0]}). 
                  "{paper.title}". Zimbabwean Academic Repository.
                </p>
                <button className={styles.copyBtn}>Copy APA Citation</button>
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <h4>Access Information</h4>
              <div className={styles.accessInfo}>
                <div className={styles.infoRow}>
                  <FileText size={16} />
                  <span>Dare Access</span>
                </div>
                <div className={styles.infoRow}>
                  <ExternalLink size={16} />
                  <span>Peer Reviewed</span>
                </div>
                <div className={styles.infoRow}>
                  <BookOpen size={16} />
                  <span>ZIMCHE Aligned</span>
                </div>
              </div>
            </div>

            <div className={styles.relatedCard}>
              <h4>Related Research</h4>
              <div className={styles.relatedList}>
                <div className={styles.relatedItem}>
                  <p>Sustainable Irrigation Systems in the Lowveld</p>
                  <span>Agriculture • 2023</span>
                </div>
                <div className={styles.relatedItem}>
                  <p>Economic Resilience of Rural Households</p>
                  <span>Economics • 2024</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
