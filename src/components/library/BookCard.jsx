import { Link } from 'react-router-dom';
import { BookOpen, Download, Star, ShieldCheck, Globe, Lock } from 'lucide-react';
import styles from './BookCard.module.css';

const FACULTY_COLORS = {
  stem: 'var(--soil)',
  agriculture: 'var(--leaf)',
  health: 'var(--clay)',
  business: 'var(--amber)',
  education: 'var(--gold)',
  engineering: '#2c3e50',
  law: '#8e44ad',
  humanities: '#d35400',
  default: 'var(--bark)'
};

const ACCESS_BADGES = {
  free: { label: 'Free', color: 'var(--leaf)', icon: Globe },
  open_access: { label: 'Open Access', color: 'var(--amber)', icon: BookOpen },
  licensed: { label: 'Licensed', color: 'var(--soil)', icon: ShieldCheck },
  preview: { label: 'Preview', color: 'var(--clay)', bg: 'var(--mist)', icon: Lock }
};

export default function BookCard({ publication, variant = 'grid', onOpen }) {
  if (!publication) return null;

  const {
    id, title, author_names, publisher_name,
    faculty, cover_path, access_model,
    year_published, average_rating, total_downloads,
    page_count, description
  } = publication;

  const facultyColor = FACULTY_COLORS[faculty?.toLowerCase()] || FACULTY_COLORS.default;
  const accessBadge = ACCESS_BADGES[access_model?.toLowerCase()] || ACCESS_BADGES.preview;
  const AccessIcon = accessBadge.icon;

  const handleCardClick = (e) => {
    if (onOpen) {
      e.preventDefault();
      onOpen(publication);
    }
  };

  const CardContent = () => (
    <>
      <div 
        className={styles.coverWrapper}
        style={{ '--spine-color': facultyColor }}
      >
        {cover_path ? (
          <img src={cover_path} alt={title} className={styles.coverImage} loading="lazy" />
        ) : (
          <div 
            className={styles.placeholderCover}
            style={{ background: `linear-gradient(135deg, ${facultyColor}, var(--soil))` }}
          >
            <div className={styles.spine} />
            <span className={styles.placeholderTitle}>{title}</span>
            <span className={styles.placeholderAuthor}>{author_names}</span>
          </div>
        )}
        
        <div className={styles.badges}>
          <span 
            className={styles.accessBadge}
            style={{ 
              backgroundColor: accessBadge.bg || accessBadge.color,
              color: accessBadge.bg ? accessBadge.color : 'white'
            }}
          >
            <AccessIcon size={10} strokeWidth={3} />
            {accessBadge.label}
          </span>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.header}>
          <h3 className={styles.title} title={title}>{title}</h3>
          {variant === 'featured' && description && (
            <p className={styles.description}>{description.substring(0, 120)}...</p>
          )}
        </div>

        <div className={styles.meta}>
          <p className={styles.author}>{author_names}</p>
          <div className={styles.details}>
            {year_published && <span>{year_published}</span>}
            {publisher_name && (
              <>
                <span className={styles.dot}>•</span>
                <span>{publisher_name}</span>
              </>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          {average_rating > 0 && (
            <div className={styles.rating}>
              <Star size={12} fill="var(--amber)" stroke="none" />
              <span>{average_rating.toFixed(1)}</span>
            </div>
          )}
          
          {total_downloads > 0 && (
            <div className={styles.downloads}>
              <Download size={12} />
              <span>{total_downloads.toLocaleString()}</span>
            </div>
          )}

          {page_count && (
            <div className={styles.pages}>
              <span>{page_count} pgs</span>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const containerClass = `${styles.card} ${styles[variant]}`;

  return onOpen ? (
    <div className={containerClass} onClick={handleCardClick} role="button" tabIndex={0}>
      <CardContent />
    </div>
  ) : (
    <Link to={`/book/${id}`} className={containerClass}>
      <CardContent />
    </Link>
  );
}
