import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from 'lucide-react';
import LogoIcon from '../common/LogoIcon';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandCol}>
            <Link to="/" className={styles.logoGroup}>
              <LogoIcon size={20} className={styles.logoIcon} />
              <div className={styles.logoText}>
                <span className={styles.dare}>DARE</span>
                <span className={styles.libraryLabel}>DIGITAL LIBRARY</span>
              </div>
            </Link>
            <p className={styles.description}>
              Zimbabwe's premier open educational resource platform, empowering students and educators with quality digital content.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink} aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" className={styles.socialLink} aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" className={styles.socialLink} aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn"><Linkedin size={20} /></a>
            </div>
          </div>

          <div className={styles.linksGrid}>
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Explore</h4>
              <Link to="/library">Main Library</Link>
              <Link to="/openstax">Partner Resources</Link>
              <Link to="/ai-textbooks">AI Textbooks</Link>
              <Link to="/author">Publish With Us</Link>
            </div>
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Portals</h4>
              <Link to="/research">Research Portal</Link>
              <Link to="/vocational">Vocational Hub</Link>
              <Link to="/teachers-colleges">Teachers Colleges</Link>
              <Link to="/institutional">Institutional</Link>
            </div>
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Support</h4>
              <Link to="/help">Help Center</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>

          <div className={styles.newsletterCol}>
            <h4 className={styles.colTitle}>Stay Updated</h4>
            <p className={styles.newsletterText}>Get the latest updates on new resources and features.</p>
            <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email address" className={styles.newsletterInput} />
              <button type="submit" className={styles.newsletterBtn}>Subscribe</button>
            </form>
            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <Phone size={14} />
                <span>+263 784 457 922</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={14} />
                <span>dare.digitallib@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.bottomBar}>
          <div className={styles.copyrightSection}>
            <p className={styles.copyright}>&copy; {currentYear} Dare Digital Library. A project by ChengetAI Labs.</p>
          </div>
          <div className={styles.partnersSection}>
            <span className={styles.partnerLabel}>Partners:</span>
            <div className={styles.partnerLogos}>
              <span title="MHTEISTD">MHTEISTD</span>
              <span title="ZIMSEC">ZIMSEC</span>
              <span title="OpenStax">OpenStax</span>
              <span title="LibreTexts">LibreTexts</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
