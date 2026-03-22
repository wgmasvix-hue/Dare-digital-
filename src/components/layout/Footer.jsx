import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          {/* Brand & Socials */}
          <div className={styles.brandSection}>
            <Link to="/" className={styles.logoGroup}>
              <div className={styles.logoIcon}>
                <div className={styles.bookIcon}>
                  <div className={styles.pageLeft}></div>
                  <div className={styles.pageRight}></div>
                </div>
              </div>
              <div className={styles.logoText}>
                <span className={styles.dare}>DARE</span>
                <span className={styles.digitalLibrary}>DIGITAL LIBRARY</span>
              </div>
            </Link>
            <p className={styles.description}>
              Zimbabwe's premier open educational resource platform.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink} aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" className={styles.socialLink} aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" className={styles.socialLink} aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn"><Linkedin size={18} /></a>
            </div>
          </div>

          {/* Links Grid */}
          <div className={styles.linksGrid}>
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Explore</h4>
              <Link to="/library">Main Library</Link>
              <Link to="/openstax">Partner Resources</Link>
              <Link to="/author">Publish With Us</Link>
            </div>
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Portals</h4>
              <Link to="/ai-textbooks">AI Textbooks</Link>
              <Link to="/research">Research Portal</Link>
              <Link to="/vocational">Vocational Hub</Link>
              <Link to="/teachers-colleges">Teachers Colleges</Link>
              <Link to="/institutional">Institutional</Link>
            </div>
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Support</h4>
              <Link to="/help">Help Center</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className={styles.actionSection}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <Phone size={14} />
                <span>0784457922</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={14} />
                <span>dare.digitallib@gmail.com</span>
              </div>
            </div>
            <div className={styles.newsletterCompact}>
              <input type="email" placeholder="Newsletter" className={styles.miniInput} />
              <button className={styles.miniBtn}>Join</button>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>&copy; {currentYear} Dare Digital Library. ChengetAI Labs.</p>
          <div className={styles.partnersCompact}>
            <span>Partners:</span>
            <span title="MHTEISTD">MHTEISTD</span>
            <span title="ZIMSEC">ZIMSEC</span>
            <span title="OpenStax">OpenStax</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
