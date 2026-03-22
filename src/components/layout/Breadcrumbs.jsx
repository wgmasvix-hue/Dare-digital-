import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import styles from './Breadcrumbs.module.css';

const routeNames = {
  'library': 'Main Library',
  'research': 'Research (IDR)',
  'book': 'Book Details',
  'reader': 'Reader',
  'research-detail': 'Research Detail',
  'teacher-tools': 'Teacher Tools',
  'vocational-tools': 'Skills Lab',
  'teachers-colleges': 'Teachers Colleges',
  'vocational': 'Vocational Schools',
  'openstax': 'Partner Resources',
  'author': 'Publish With Us',
  'institutions': 'Institutional',
  'profile': 'My Profile',
  'lecturer-dashboard': 'Lecturer Dashboard',
  'author-dashboard': 'Author Dashboard',
  'admin-dashboard': 'Admin Dashboard',
  'ai-textbooks': 'AI Textbooks',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <div className={styles.container}>
        <ol className={styles.list}>
          <li className={styles.item}>
            <Link to="/" className={styles.link}>
              <Home size={16} />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            
            // Handle dynamic IDs (if it looks like a UUID or specific prefix)
            let name = routeNames[value];
            if (!name) {
              if (value.length > 20 || value.includes('-')) {
                // Check if previous part was 'book' or 'reader'
                const prev = pathnames[index - 1];
                if (prev === 'book' || prev === 'reader') {
                  name = 'Details';
                } else if (prev === 'research') {
                  name = 'Paper';
                } else {
                  name = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
                }
              } else {
                name = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
              }
            }

            return (
              <li key={to} className={styles.item}>
                <ChevronRight size={14} className={styles.separator} />
                {last ? (
                  <span className={styles.current} aria-current="page">
                    {name}
                  </span>
                ) : (
                  <Link to={to} className={styles.link}>
                    {name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
