import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { enrichMetadata } from '../services/enrichmentService';
import * as catalog from '../lib/oerCatalog';
import styles from './AdminSeed.module.css';

const ZIMBABWE_PRIORITY_OER = [
  {
    id: 'zim-agri-1',
    title: 'Conservation Agriculture in Zimbabwe: A Manual for Extension Workers',
    author_names: 'Ministry of Agriculture, Zimbabwe',
    publisher_name: 'MOHCC / FAO',
    faculty: 'Agriculture',
    subject: 'AGR',
    cover_image_url: 'https://picsum.photos/seed/zimagri/400/600',
    file_url: 'https://www.fao.org/3/i3325e/i3325e.pdf',
    access_model: 'dare_access',
    year_published: 2021,
    description: 'A comprehensive guide to Pfumvudza/Intwasa techniques and conservation agriculture tailored for Zimbabwean soil types and climate patterns.',
    license_type: 'CC BY-NC-SA 3.0 IGO'
  },
  {
    id: 'zim-health-1',
    title: 'Zimbabwe National HIV/AIDS Strategic Plan (ZNASP IV)',
    author_names: 'National AIDS Council of Zimbabwe',
    publisher_name: 'NAC',
    faculty: 'Health',
    subject: 'MED',
    cover_image_url: 'https://picsum.photos/seed/zimhealth/400/600',
    file_url: 'https://iris.who.int/bitstream/handle/10665/373828/9789240083851-eng.pdf',
    access_model: 'dare_access',
    year_published: 2022,
    description: 'The strategic framework for Zimbabwe\'s multi-sectoral response to HIV and AIDS, focusing on prevention, treatment, and care.',
    license_type: 'Public Domain'
  }
];

const ALL_RESOURCES = [
  ...ZIMBABWE_PRIORITY_OER,
  ...catalog.OPENSTAX_EXPANDED.slice(0, 5),
  ...catalog.AGRICULTURE_OER.slice(0, 3),
  ...catalog.HEALTH_OER.slice(0, 3),
  ...catalog.ENGINEERING_OER.slice(0, 3),
  ...catalog.EDUCATION_OER.slice(0, 3),
  ...catalog.AI_OER,
  ...catalog.AI_PRIORITY_OER
];

export default function AdminSeed() {
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleSeed = async () => {
    if (status === 'processing') return;
    
    setStatus('processing');
    setLogs([]);
    setProgress(0);
    addLog('🚀 Starting population of ' + ALL_RESOURCES.length + ' resources...', 'info');

    const BATCH_SIZE = 2;
    const resourcesToProcess = ALL_RESOURCES.slice(0, 10); // Limit for safety in browser

    for (let i = 0; i < resourcesToProcess.length; i += BATCH_SIZE) {
      const batch = resourcesToProcess.slice(i, i + BATCH_SIZE);
      addLog(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`, 'info');

      const promises = batch.map(async (resource) => {
        try {
          addLog(`🔍 Processing: ${resource.title}`, 'info');
          let enrichment = null;
          
          try {
            enrichment = await enrichMetadata(resource);
            addLog(`✨ Enriched: ${resource.title}`, 'success');
          } catch (enrichErr) {
            addLog(`⚠️ Enrichment skipped for ${resource.title}: ${enrichErr.message}`, 'warning');
          }
          
          const bookData = {
            ...resource,
            subject: enrichment?.disciplines?.[0]?.code || resource.subject,
            zimche_programme_codes: enrichment?.zimbabwe_relevance?.applicable_programmes || resource.zimche_programme_codes,
            ai_level: enrichment?.nqf_level?.level ? parseInt(enrichment.nqf_level.level.replace('nqf_', '')) : resource.ai_level,
            updated_at: new Date().toISOString()
          };

          if (enrichment) {
            bookData.enrichment_data = enrichment;
          }

          let { error } = await supabase
            .from('books')
            .upsert(bookData, { onConflict: 'id' });

          if (error && error.message.includes('enrichment_data')) {
            addLog(`⚠️ Column 'enrichment_data' missing, retrying without it for ${resource.title}`, 'warning');
            delete bookData.enrichment_data;
            const { error: retryError } = await supabase
              .from('books')
              .upsert(bookData, { onConflict: 'id' });
            error = retryError;
          }

          if (error) throw error;
          addLog(`✅ Saved: ${resource.title}`, 'success');
        } catch (err) {
          addLog(`❌ Error processing ${resource.title}: ${err.message}`, 'error');
        }
      });

      await Promise.all(promises);
      setProgress(Math.round(((i + batch.length) / resourcesToProcess.length) * 100));
      
      if (i + BATCH_SIZE < resourcesToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setStatus('complete');
    addLog('✨ Population complete!', 'success');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 className={styles.title}>Library Seeder</h1>
            <p className={styles.subtitle}>Populate the digital library with enriched OER resources.</p>
          </div>
          <Link to="/admin/library" className={styles.clearBtn} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Manage Backend Books &rarr;
          </Link>
        </div>
        <div className={styles.migrationNote}>
          <strong>Note:</strong> Ensure you have applied the <code>enrichment_data</code> migration in your Supabase SQL Editor for full AI metadata support.
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.controls}>
          <button 
            onClick={handleSeed} 
            disabled={status === 'processing'}
            className={styles.button}
          >
            {status === 'processing' ? 'Processing...' : 'Start Population'}
          </button>
          
          {status === 'processing' && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>

        <div className={styles.logContainer}>
          <div className={styles.logHeader}>
            <span>Process Logs</span>
            <button onClick={() => setLogs([])} className={styles.clearBtn}>Clear</button>
          </div>
          <div className={styles.logs}>
            {logs.length === 0 && <p className={styles.emptyLogs}>No logs yet. Click start to begin.</p>}
            {logs.map((log, i) => (
              <div key={i} className={`${styles.logItem} ${styles[log.type]}`}>
                <span className={styles.timestamp}>[{log.timestamp}]</span>
                <span className={styles.message}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
