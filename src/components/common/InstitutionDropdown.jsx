import { useState, useEffect } from 'react';
import { ChevronDown, Building } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import styles from './InstitutionDropdown.module.css';

export default function InstitutionDropdown({ onSelect, selectedId, className }) {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('institutions')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setInstitutions(data || []);
      } catch (err) {
        console.error('Error fetching institutions:', err);
        setError('Failed to load institutions');
      } finally {
        setLoading(false);
      }
    }

    fetchInstitutions();
  }, []);

  if (loading) {
    return (
      <div className={`${styles.wrapper} ${className || ''}`}>
        <div className={styles.loading}>Loading institutions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.wrapper} ${className || ''}`}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      <div className={styles.iconWrapper}>
        <Building size={18} className={styles.icon} />
      </div>
      <select
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className={styles.select}
      >
        <option value="">Select your institution</option>
        {institutions.map((inst) => (
          <option key={inst.id} value={inst.id}>
            {inst.name}
          </option>
        ))}
      </select>
      <div className={styles.chevronWrapper}>
        <ChevronDown size={16} className={styles.chevron} />
      </div>
    </div>
  );
}
