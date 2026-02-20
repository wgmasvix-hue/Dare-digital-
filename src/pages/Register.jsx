import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, User, Building, GraduationCap, 
  CheckCircle, AlertCircle, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './Auth.module.css';

const ROLES = [
  { id: 'student', label: 'Student' },
  { id: 'lecturer', label: 'Lecturer' },
  { id: 'researcher', label: 'Independent Researcher' }
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [institutions, setInstitutions] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student',
    institutionId: '',
    studentNumber: '',
    programme: '',
    yearOfStudy: '',
    termsAccepted: false
  });

  useEffect(() => {
    async function fetchInstitutions() {
      const { data } = await supabase
        .from('institutions')
        .select('id, name')
        .order('name');
      setInstitutions(data || []);
    }
    fetchInstitutions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password) return 'Please fill in all fields';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.firstName || !formData.lastName) return 'Name is required';
    if (!formData.institutionId) return 'Please select an institution';
    if (formData.role === 'student' && !formData.programme) return 'Programme is required';
    return null;
  };

  const handleNext = () => {
    setError(null);
    let validationError = null;
    
    if (step === 1) validationError = validateStep1();
    if (step === 2) validationError = validateStep2();

    if (validationError) {
      setError(validationError);
      return;
    }

    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleRegister = async () => {
    if (!formData.termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            institution_id: formData.institutionId,
            student_number: formData.studentNumber,
            programme: formData.programme,
            year_of_study: formData.yearOfStudy
          }
        }
      });

      if (signUpError) throw signUpError;
      
      // Success - Redirect
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Header */}
        <div className={styles.header}>
          <Link to="/" className={styles.logoGroup}>
            <span className={styles.dare}>Dare</span>
            <span className={styles.period}>.</span>
          </Link>
          <h2 className={styles.title}>Create Account</h2>
          
          {/* Progress Steps */}
          <div className={styles.steps}>
            <div className={`${styles.step} ${step >= 1 ? styles.activeStep : ''}`}>1</div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step >= 2 ? styles.activeStep : ''}`}>2</div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step >= 3 ? styles.activeStep : ''}`}>3</div>
          </div>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: ACCOUNT */}
        {step === 1 && (
          <div className={styles.formStep}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="student@university.ac.zw"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  name="password"
                  type="password"
                  className={styles.input}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  name="confirmPassword"
                  type="password"
                  className={styles.input}
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button onClick={handleNext} className={styles.submitBtn}>
              Next Step <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: IDENTITY */}
        {step === 2 && (
          <div className={styles.formStep}>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>First Name</label>
                <input
                  name="firstName"
                  type="text"
                  className={styles.input}
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  className={styles.input}
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>I am a...</label>
              <div className={styles.roleGrid}>
                {ROLES.map(role => (
                  <label 
                    key={role.id} 
                    className={`${styles.roleCard} ${formData.role === role.id ? styles.activeRole : ''}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.id}
                      checked={formData.role === role.id}
                      onChange={handleChange}
                      className={styles.hiddenRadio}
                    />
                    {role.label}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Institution</label>
              <div className={styles.inputWrapper}>
                <Building size={18} className={styles.inputIcon} />
                <select
                  name="institutionId"
                  className={styles.select}
                  value={formData.institutionId}
                  onChange={handleChange}
                >
                  <option value="">Select your institution</option>
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.role === 'student' && (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Programme of Study</label>
                  <div className={styles.inputWrapper}>
                    <GraduationCap size={18} className={styles.inputIcon} />
                    <input
                      name="programme"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. BSc Computer Science"
                      value={formData.programme}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Student Number</label>
                    <input
                      name="studentNumber"
                      type="text"
                      className={styles.input}
                      value={formData.studentNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Year</label>
                    <select
                      name="yearOfStudy"
                      className={styles.select}
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                    >
                      <option value="">Year</option>
                      {[1, 2, 3, 4, 5, 6].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className={styles.stepActions}>
              <button onClick={handleBack} className={styles.backBtn}>
                <ArrowLeft size={18} /> Back
              </button>
              <button onClick={handleNext} className={styles.submitBtn}>
                Next <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM */}
        {step === 3 && (
          <div className={styles.formStep}>
            <div className={styles.summary}>
              <h3 className={styles.summaryTitle}>Review Details</h3>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Name:</span>
                <span className={styles.summaryValue}>{formData.firstName} {formData.lastName}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Email:</span>
                <span className={styles.summaryValue}>{formData.email}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Role:</span>
                <span className={styles.summaryValue}>{ROLES.find(r => r.id === formData.role)?.label}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Institution:</span>
                <span className={styles.summaryValue}>
                  {institutions.find(i => i.id === formData.institutionId)?.name || 'Selected Institution'}
                </span>
              </div>
            </div>

            <label className={styles.termsCheckbox}>
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span>
                I agree to the <Link to="/terms" className={styles.link}>Terms of Service</Link> and <Link to="/privacy" className={styles.link}>Privacy Policy</Link>.
              </span>
            </label>

            <div className={styles.stepActions}>
              <button onClick={handleBack} className={styles.backBtn}>
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={handleRegister} 
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'} <CheckCircle size={18} />
              </button>
            </div>
          </div>
        )}

        <p className={styles.footerText}>
          Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
