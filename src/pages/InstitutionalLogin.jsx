import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, ShieldCheck, ArrowRight, AlertCircle, Search, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import styles from './Auth.module.css';

export default function InstitutionalLogin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Select Institution, 2: Login
  const [searchQuery, setSearchQuery] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institutionalCode, setInstitutionalCode] = useState('');

  useEffect(() => {
    fetchInstitutions();
  }, []);

  async function fetchInstitutions() {
    try {
      const { data, error } = await supabase
        .from('vocational')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setInstitutions(data || []);
    } catch (err) {
      console.error('Error fetching institutions:', err);
      setInstitutions([]);
    }
  }

  const filteredInstitutions = institutions.filter(inst => 
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectInstitution = (inst) => {
    setSelectedInstitution(inst);
    setStep(2);
  };

  const handleInstitutionalLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Actual institutional login logic would go here
    // For now, we'll inform the user that this feature is being restored to Supabase
    setError('Institutional login is currently being updated. Please use standard login.');
    setLoading(false);
  };

  return (
    <div className={styles.authContainer}>
      <motion.div 
        className={styles.authCard} 
        style={{ maxWidth: '500px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <Link to="/" className={styles.logoGroup}>
            <span className={styles.dare}>Dare</span>
            <span className={styles.period}>.</span>
          </Link>
          <h2 className={styles.title}>Institutional Access</h2>
          <p className={styles.subtitle}>
            {step === 1 
              ? "Find your institution to continue" 
              : `Sign in to ${selectedInstitution.name}`}
          </p>
        </div>

        {error && (
          <motion.div 
            className={styles.errorAlert}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.inputWrapper}>
                <Search size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Search for your university or college..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                {filteredInstitutions.map((inst, index) => (
                  <motion.button
                    key={inst.id}
                    className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors"
                    onClick={() => handleSelectInstitution(inst)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[var(--dare-gold)] group-hover:text-white transition-colors">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--dare-dark)]">{inst.name}</div>
                        <div className="text-xs text-gray-500">{inst.domain || 'Institutional Partner'}</div>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-[var(--dare-gold)]" />
                  </motion.button>
                ))}
                {filteredInstitutions.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Globe size={32} className="mx-auto mb-2 opacity-20" />
                    <p>Institution not found. Please contact your librarian.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 text-center">
                <p className="text-sm text-gray-500 mb-4">Your institution not listed?</p>
                <Link to="/institutions" className="text-[var(--dare-gold)] font-bold hover:underline">
                  Register your institution →
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form 
              key="step2"
              onSubmit={handleInstitutionalLogin} 
              className={styles.form}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 size={20} className="text-[var(--dare-gold)]" />
                  <span className="font-bold text-sm">{selectedInstitution.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-xs text-[var(--dare-gold)] hover:underline"
                >
                  Change
                </button>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Institutional Email</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    type="email"
                    className={styles.input}
                    placeholder={`name@${selectedInstitution.domain || 'university.ac.zw'}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">Or use access code</span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Institutional Access Code</label>
                <div className={styles.inputWrapper}>
                  <ShieldCheck size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter 8-digit code"
                    value={institutionalCode}
                    onChange={(e) => setInstitutionalCode(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Codes are provided by your campus library or IT department.
                </p>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Access Library'} <ArrowRight size={18} />
              </button>

              <div className="mt-6 p-4 border border-amber-100 bg-amber-50/50 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle size={18} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Institutional access requires a valid subscription. If you encounter issues, please visit the <strong>Institutional Support</strong> desk on campus.
                  </p>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className={styles.footerText}>
          Standard user? <Link to="/login" className={styles.link}>Sign in here</Link>
        </p>
      </motion.div>
    </div>
  );
}
