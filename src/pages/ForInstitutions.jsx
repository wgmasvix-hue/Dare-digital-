import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from '../lib/supabase';

async function supabaseInsert(table, data) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select();
  if (error) throw new Error(error.message);
  return result;
}

function useIntersection(ref, options = {}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15, ...options });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function AnimatedSection({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const visible = useIntersection(ref);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: scrolled ? 'rgba(254, 250, 243, 0.95)' : 'var(--dare-cream)',
      backdropFilter: scrolled ? 'blur(8px)' : 'none',
      borderBottom: '1px solid var(--dare-border)',
      boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
      transition: 'all 0.3s ease',
      padding: '16px 24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '24px', fontWeight: '700', color: 'var(--dare-dark)', lineHeight: '1' }}>
            Dare<span style={{ color: 'var(--dare-gold)' }}>.</span>
          </span>
          <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--dare-warm-gray)', marginTop: '4px' }}>DIGITAL LIBRARY</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/institutional-login" style={{ 
            fontSize: '14px', 
            fontWeight: '700', 
            color: 'var(--dare-dark)', 
            textDecoration: 'none',
            padding: '8px 16px',
            border: '1px solid var(--dare-border)',
            borderRadius: '4px',
            transition: 'all 0.2s'
          }} onMouseOver={(e) => e.target.style.backgroundColor = 'var(--dare-border)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
            Institutional Sign In
          </Link>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--dare-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dare-warm-gray)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dare-dark)', cursor: 'pointer' }}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </div>
      </div>
    </header>
  );
};

const HeroSection = ({ formRef, plansRef }) => {
  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
      <div className="hero-animate hero-delay-1" style={{ color: 'var(--dare-gold)', fontSize: '12px', letterSpacing: '4px', fontWeight: '700', marginBottom: '24px' }}>
        INSTITUTIONAL PARTNERSHIPS
      </div>
      <h1 className="hero-animate hero-delay-2" style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--dare-dark)', lineHeight: '1.1', marginBottom: '24px' }}>
        Transform your campus library <br />
        <span style={{ color: 'var(--dare-gold)', fontStyle: 'italic' }}>for the digital age</span>
      </h1>
      <p className="hero-animate hero-delay-3" style={{ fontSize: '18px', color: 'var(--dare-warm-gray)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
        Dare Digital Library gives Zimbabwe's tertiary institutions a single subscription covering 6,000+ academic titles — with offline access built for our connectivity realities.
      </p>
      <div className="hero-animate hero-delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => scrollTo(formRef)} style={{ backgroundColor: 'var(--dare-gold)', color: '#fff', border: 'none', padding: '14px 32px', fontSize: '16px', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Libre Baskerville', serif", fontWeight: '700' }}>
          Request Information
        </button>
        <button onClick={() => scrollTo(plansRef)} style={{ backgroundColor: 'transparent', color: 'var(--dare-dark)', border: '1px solid var(--dare-dark)', padding: '14px 32px', fontSize: '16px', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Libre Baskerville', serif", fontWeight: '700' }}>
          View Plans
        </button>
      </div>
    </section>
  );
};

const StatsBar = () => (
  <section style={{ backgroundColor: 'var(--dare-dark)', padding: '60px 24px', color: '#fff' }}>
    <div className="stats-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {[
        { num: '23+', label: 'Partner Institutions' },
        { num: '6,000+', label: 'Academic Titles' },
        { num: '98%', label: 'Uptime SLA' },
        { num: '40K+', label: 'Students Served' }
      ].map((stat, i) => (
        <AnimatedSection key={i} delay={i * 100}>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '36px', fontWeight: '700', color: 'var(--dare-gold)', marginBottom: '8px' }}>{stat.num}</div>
          <div style={{ fontSize: '14px', color: 'var(--dare-gold-light)', letterSpacing: '1px', textTransform: 'uppercase' }}>{stat.label}</div>
        </AnimatedSection>
      ))}
    </div>
  </section>
);

const PricingSection = ({ onPlanSelect, plansRef }) => {
  const plans = [
    {
      name: 'Foundation Plan',
      price: 'USD 120',
      students: 'Up to 200',
      features: ['1,500+ academic titles', '5 concurrent admin seats', 'Basic analytics', 'Email support (48h)', 'Monthly content updates', 'Offline PWA cache'],
      highlight: false
    },
    {
      name: 'Scholar Plan',
      price: 'USD 380',
      students: 'Up to 800',
      features: ['Full catalogue 6,000+ titles', 'Unlimited admin & faculty seats', 'Advanced analytics', 'Priority support (4h)', 'Weekly updates + new releases', 'Offline-first PWA', 'LMS integration (Moodle/Blackboard)', 'Custom institution branding', 'Dedicated account manager'],
      highlight: true
    },
    {
      name: 'Consortium Plan',
      price: 'Custom',
      students: 'Unlimited',
      features: ['Everything in Scholar', 'Multi-campus dashboard', 'Custom content pipeline', 'White-label option', 'On-site onboarding', 'ZIMCHE reporting tools', 'Dedicated infrastructure tenant', 'SLA-backed uptime'],
      highlight: false
    }
  ];

  return (
    <section id="plans" ref={plansRef} style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '32px', color: 'var(--dare-dark)', marginBottom: '16px' }}>Flexible plans for every campus</h2>
        <p style={{ color: 'var(--dare-warm-gray)' }}>Choose the tier that fits your student body size and technical requirements.</p>
      </div>
      <div className="plan-grid">
        {plans.map((plan, i) => (
          <AnimatedSection key={i} delay={i * 150} className="plan-card-wrapper" style={{ width: '100%', maxWidth: '380px' }}>
            <div style={{
              backgroundColor: plan.highlight ? 'var(--dare-dark)' : '#fff',
              color: plan.highlight ? '#fff' : 'var(--dare-dark)',
              border: plan.highlight ? '1px solid var(--dare-gold)' : '1px solid var(--dare-border)',
              borderRadius: '8px',
              padding: '32px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: plan.highlight ? '0 12px 24px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--dare-gold)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '4px 12px', borderRadius: '12px', letterSpacing: '1px' }}>MOST POPULAR</div>
              )}
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '24px', marginBottom: '8px' }}>{plan.name}</h3>
              <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '24px' }}>{plan.students} students</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: plan.highlight ? 'var(--dare-gold)' : 'var(--dare-dark)', marginBottom: '8px' }}>{plan.price}<span style={{ fontSize: '16px', fontWeight: '400', color: plan.highlight ? '#fff' : 'var(--dare-warm-gray)' }}>/mo</span></div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', flex: 1 }}>
                {plan.features.map((feat, j) => (
                  <li key={j} style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '15px', lineHeight: '1.5', color: plan.highlight ? '#ddd' : 'var(--dare-warm-gray)' }}>
                    <span style={{ color: 'var(--dare-gold)' }}>✓</span> {feat}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => onPlanSelect(plan)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: plan.highlight ? 'var(--dare-gold)' : 'transparent',
                  color: plan.highlight ? '#fff' : 'var(--dare-dark)',
                  border: plan.highlight ? 'none' : '1px solid var(--dare-dark)',
                  borderRadius: '4px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: 'auto',
                  transition: 'all 0.2s'
                }}
              >
                Select Plan
              </button>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
};

const HowItWorks = () => (
  <section style={{ backgroundColor: 'var(--dare-sand)', padding: '80px 24px' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '32px', color: 'var(--dare-dark)', textAlign: 'center', marginBottom: '60px' }}>Partnership Process</h2>
      <div className="how-grid">
        {[
          { title: 'Submit Enquiry', text: 'Fill in the partnership form. Our team reviews within 24 hours.' },
          { title: 'Discovery Call', text: '30-minute call to understand your structure, systems, and content priorities.' },
          { title: '30-Day Pilot', text: 'We provision test environment: 50 student accounts, 300 curated titles, no cost.' },
          { title: 'Full Deployment', text: 'Entire student body gains access. We handle onboarding, training, LMS integration.' }
        ].map((step, i) => (
          <AnimatedSection key={i} delay={i * 100}>
            <div style={{ fontSize: '48px', fontFamily: "'Libre Baskerville', serif", color: 'var(--dare-gold)', opacity: 0.3, fontWeight: '700', lineHeight: 1 }}>0{i + 1}</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--dare-dark)', margin: '16px 0 8px' }}>{step.title}</h3>
            <p style={{ fontSize: '15px', color: 'var(--dare-warm-gray)', lineHeight: '1.6' }}>{step.text}</p>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: "How does student access work?", a: "Students log in using their institutional email address. They access the library via our PWA (Progressive Web App) which works on any device without an app store download. The system automatically caches up to 50 titles for offline reading." },
    { q: "Can we integrate with our existing LMS?", a: "Yes. For Scholar and Consortium plans, we support LTI 1.3 integration, allowing seamless access from Moodle, Blackboard, or Canvas environments." },
    { q: "How is content licensed?", a: "Dare Digital Library acts as the licensed distributor. Your institution does not need to sign separate agreements with individual publishers. One subscription covers all rights." },
    { q: "What happens if our internet goes down?", a: "We are offline-first. The service worker automatically caches reading lists and recent books. Students can continue reading offline, and progress syncs automatically when connection is restored." },
    { q: "Can we trial before committing?", a: "Absolutely. We offer a 30-day pilot program with 50 student accounts and 300 curated titles so you can evaluate the platform's performance on your campus network." }
  ];

  return (
    <section style={{ padding: '80px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '32px', color: 'var(--dare-dark)', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ border: '1px solid var(--dare-border)', borderRadius: '8px', overflow: 'hidden' }}>
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{ 
                width: '100%', 
                padding: '20px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: '#fff', 
                border: 'none', 
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--dare-dark)' }}>{faq.q}</span>
              <span style={{ 
                transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0)', 
                transition: 'transform 0.3s', 
                fontSize: '24px', 
                color: 'var(--dare-gold)' 
              }}>+</span>
            </button>
            <div style={{ 
              maxHeight: openIndex === i ? '400px' : '0', 
              overflow: 'hidden', 
              transition: 'max-height 0.4s ease',
              backgroundColor: 'var(--dare-cream)'
            }}>
              <p style={{ padding: '0 20px 20px', color: 'var(--dare-warm-gray)', lineHeight: '1.6', margin: 0 }}>{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const EnquiryForm = ({ formRef, selectedPlan, submitted, setSubmitted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    institution_name: "",
    contact_name: "",
    email: "",
    phone: "",
    role: "",
    student_count: "",
    plan_interest: "",
    message: "",
  });

  useEffect(() => {
    if (selectedPlan) {
      setForm(prev => ({ ...prev, plan_interest: selectedPlan.name }));
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedPlan, formRef]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await supabaseInsert("institution_leads", { ...form, source: "website" });
      
      // Also trigger email to dare.digitallib@gmail.com
      const subject = encodeURIComponent(`Institutional Demo Request: ${form.institution_name}`);
      const body = encodeURIComponent(
        `New Institutional Enquiry from Dare Digital Library Website:\n\n` +
        `Institution: ${form.institution_name}\n` +
        `Contact Person: ${form.contact_name}\n` +
        `Email: ${form.email}\n` +
        `Phone: ${form.phone || 'Not provided'}\n` +
        `Role: ${form.role || 'Not specified'}\n` +
        `Student Count: ${form.student_count || 'Not specified'}\n` +
        `Plan Interest: ${form.plan_interest || 'General Enquiry'}\n\n` +
        `Message:\n${form.message || 'No additional message.'}`
      );
      
      // Open email client
      window.location.href = `mailto:dare.digitallib@gmail.com?subject=${subject}&body=${body}`;
      
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please email us at dare.digitallib@gmail.com");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section ref={formRef} style={{ padding: '80px 24px', backgroundColor: 'var(--dare-sand)', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ color: 'green', fontSize: '48px', marginBottom: '16px' }}>✓</div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '28px', marginBottom: '16px' }}>Enquiry Received</h2>
          <p style={{ color: 'var(--dare-warm-gray)', fontSize: '18px' }}>Thank you for your interest in Dare Digital Library. Our partnership team will review your details and contact you within 24 hours.</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={formRef} style={{ padding: '80px 24px', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '32px', color: 'var(--dare-dark)', textAlign: 'center', marginBottom: '40px' }}>
          {selectedPlan ? `Enquiring about the ${selectedPlan.name}` : "Request partnership information"}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="form-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--dare-dark)' }}>Institution Name*</label>
              <input required name="institution_name" value={form.institution_name} onChange={handleChange} type="text" style={{ padding: '12px', border: '1px solid var(--dare-border)', borderRadius: '4px', fontSize: '16px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--dare-dark)' }}>Your Full Name*</label>
              <input required name="contact_name" value={form.contact_name} onChange={handleChange} type="text" style={{ padding: '12px', border: '1px solid var(--dare-border)', borderRadius: '4px', fontSize: '16px' }} />
            </div>
          </div>

          <div className="form-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--dare-dark)' }}>Email Address*</label>
              <input required name="email" value={form.email} onChange={handleChange} type="email" style={{ padding: '12px', border: '1px solid var(--dare-border)', borderRadius: '4px', fontSize: '16px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--dare-dark)' }}>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} type="tel" style={{ padding: '12px', border: '1px solid var(--dare-border)', borderRadius: '4px', fontSize: '16px' }} />
            </div>
          </div>

          <div className="form-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--dare-dark)' }}>Your Role</label>
              <select name="role" value={form.role} onChange={handleChange} style={{ padding: '12px', border: '1px solid var(--dare-border)', borderRadius: '4px', fontSize: '16px', backgroundColor: '#fff' }}>
                <option value="">Select Role...</option>
                <option value="Librarian/Information Specialist">Librarian/Information Specialist</option>
                <option value="Registrar">Registrar</option>
                <option value="Deputy Vice Chancellor">Deputy Vice Chancellor</option>
                <option value="Head of Department">Head of Department</option>
                <option value="IT Administrator">IT Administrator</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--dare-dark)' }}>Estimated Student Count</label>
              <select name="student_count" value={form.student_count} onChange={handleChange} style={{ padding: '12px', border: '1px solid var(--dare-border)', borderRadius: '4px', fontSize: '16px', backgroundColor: '#fff' }}>
                <option value="">Select Count...</option>
                <option value="Under 200">Under 200</option>
                <option value="200–500">200–500</option>
                <option value="500–1,000">500–1,000</option>
                <option value="1,000–5,000">1,000–5,000</option>
                <option value="5,000–15,000">5,000–15,000</option>
                <option value="15,000+">15,000+</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--dare-dark)' }}>Plan Interest</label>
            <select name="plan_interest" value={form.plan_interest} onChange={handleChange} style={{ padding: '12px', border: '1px solid var(--dare-border)', borderRadius: '4px', fontSize: '16px', backgroundColor: '#fff' }}>
              <option value="">Not sure yet</option>
              <option value="Foundation Plan">Foundation — USD 120</option>
              <option value="Scholar Plan">Scholar — USD 380</option>
              <option value="Consortium Plan">Consortium — Custom</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--dare-dark)' }}>Message (Optional)</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows="4" style={{ padding: '12px', border: '1px solid var(--dare-border)', borderRadius: '4px', fontSize: '16px', resize: 'vertical' }} />
          </div>

          {error && <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '4px', fontSize: '14px' }}>{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              backgroundColor: 'var(--dare-gold)', 
              color: '#fff', 
              border: 'none', 
              padding: '16px', 
              fontSize: '16px', 
              fontWeight: '700', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontFamily: "'Libre Baskerville', serif"
            }}
          >
            {loading ? 'Submitting...' : 'Request Partnership Information →'}
          </button>
        </form>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer style={{ backgroundColor: 'var(--dare-dark)', color: 'var(--dare-border)', padding: '32px 24px', textAlign: 'center', fontSize: '14px' }}>
    <p>© {new Date().getFullYear()} Dare Digital Library · Harare, Zimbabwe · <a href="mailto:dare.digitallib@gmail.com" style={{ color: 'var(--dare-gold)', textDecoration: 'none' }}>dare.digitallib@gmail.com</a></p>
  </footer>
);

export default function ForInstitutions() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const formRef = useRef(null);
  const plansRef = useRef(null);

  useEffect(() => {
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  const cssString = `
    @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
    
    :root {
      --dare-cream: #FEFAF3;
      --dare-dark: #1a1208;
      --dare-gold: #C8922A;
      --dare-gold-light: #b89a6a;
      --dare-warm-gray: #6b5f47;
      --dare-border: #e8dfc8;
      --dare-sand: #f5edd8;
    }

    .dark-mode {
      --dare-cream: #1a1208;
      --dare-dark: #FEFAF3;
      --dare-gold: #FFCC80;
      --dare-gold-light: #d4b483;
      --dare-warm-gray: #bcaaa4;
      --dare-border: #3e362e;
      --dare-sand: #2d241a;
    }

    * { box-sizing: border-box; }
    
    body { 
      margin: 0; 
      font-family: 'Crimson Text', Georgia, serif; 
      background-color: var(--dare-cream);
      color: var(--dare-warm-gray);
    }

    ::selection { background: var(--dare-gold); color: #fff; }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--dare-gold) !important;
      box-shadow: 0 0 0 1px var(--dare-gold);
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .hero-animate { animation: fadeUp 0.8s ease forwards; }
    .hero-delay-1 { animation-delay: 0.1s; opacity: 0; }
    .hero-delay-2 { animation-delay: 0.25s; opacity: 0; }
    .hero-delay-3 { animation-delay: 0.4s; opacity: 0; }

    .plan-grid { display: flex; flex-direction: column; gap: 24px; align-items: center; }
    .form-grid  { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; text-align: center; }
    .how-grid   { display: grid; grid-template-columns: 1fr; gap: 32px; }

    @media (min-width: 640px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .how-grid   { grid-template-columns: repeat(2, 1fr); }
    }

    @media (min-width: 768px) {
      .plan-grid  { flex-direction: row; justify-content: center; align-items: stretch; }
      .form-grid  { grid-template-columns: 1fr 1fr; }
      .stats-grid { grid-template-columns: repeat(4, 1fr); }
      .how-grid   { grid-template-columns: repeat(4, 1fr); }
    }
  `;

  return (
    <div>
      <style>{cssString}</style>
      {!isOnline && (
        <div style={{ background: '#7a4a00', color: '#fff', padding: '10px', textAlign: 'center', fontSize: '13px', position: 'sticky', top: 0, zIndex: 101 }}>
          You are offline. This page will submit your enquiry once connection is restored.
        </div>
      )}
      <Header />
      <HeroSection formRef={formRef} plansRef={plansRef} />
      <StatsBar />
      <PricingSection plansRef={plansRef} onPlanSelect={setSelectedPlan} />
      <HowItWorks />
      <FAQSection />
      <EnquiryForm formRef={formRef} selectedPlan={selectedPlan} submitted={submitted} setSubmitted={setSubmitted} />
      <Footer />
    </div>
  );
}
