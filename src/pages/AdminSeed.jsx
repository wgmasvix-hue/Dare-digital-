import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { enrichMetadata } from '../services/enrichmentService';
import { gutenbergService } from '../services/gutenbergService';
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
    ddc_code: '630',
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
    ddc_code: '610',
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
  const [gutenbergStatus, setGutenbergStatus] = useState('idle');
  const [libretextsStatus, setLibretextsStatus] = useState('idle');
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
            status: 'published',
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

  const handleGutenbergIngest = async () => {
    if (gutenbergStatus === 'processing') return;
    
    setGutenbergStatus('processing');
    setLogs([]);
    addLog('📚 Starting Project Gutenberg Ingestion...', 'info');

    try {
      let currentPage = 1;
      const MAX_PAGES = 5; // Limit for safety

      while (currentPage <= MAX_PAGES) {
        addLog(`📄 Processing Gutenberg Page ${currentPage}...`, 'info');
        const result = await gutenbergService.ingestBooks(currentPage, addLog);
        
        if (!result.next) {
          addLog('🏁 Reached end of Gutenberg catalog.', 'success');
          break;
        }
        
        currentPage++;
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setGutenbergStatus('complete');
      addLog('✨ Gutenberg Ingestion complete!', 'success');
    } catch (err) {
      setGutenbergStatus('error');
      addLog(`❌ Gutenberg Ingest failed: ${err.message}`, 'error');
    }
  };

  const handleLibreTextsImport = async () => {
    if (libretextsStatus === 'processing') return;
    
    setLibretextsStatus('processing');
    setLogs([]);
    addLog('🧪 Starting LibreTexts Import (Edge Function)...', 'info');

    try {
      const { data, error } = await supabase.functions.invoke('libretexts-import');
      
      if (error) throw error;
      
      addLog(`✅ ${data.message}`, 'success');
      setLibretextsStatus('complete');
    } catch (err) {
      setLibretextsStatus('error');
      addLog(`❌ LibreTexts Import failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ 
        background: 'var(--soil)', 
        color: 'white', 
        padding: '4rem 5%', 
        position: 'relative', 
        overflow: 'hidden',
        borderBottom: 'none'
      }}>
        {/* Real Book Background Image */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.15
        }}>
          <img 
            src="https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&q=80&w=2000" 
            alt="Library Seeder Background" 
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            referrerPolicy="no-referrer"
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(45, 34, 28, 0.8), var(--soil))"
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'relative', zIndex: 10 }}>
          <div>
            <h1 className={styles.title} style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Library Seeder</h1>
            <p className={styles.subtitle} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>Populate the digital library with enriched OER resources.</p>
          </div>
          <Link to="/admin/library" className={styles.clearBtn} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
            Manage Backend Books &rarr;
          </Link>
        </div>
        <div className={styles.migrationNote} style={{ position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}>
          <strong>Note:</strong> Ensure you have applied the <code>enrichment_data</code> migration in your Supabase SQL Editor for full AI metadata support.
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.controls} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleSeed} 
            disabled={status === 'processing' || gutenbergStatus === 'processing'}
            className={styles.button}
          >
            {status === 'processing' ? 'Processing...' : 'Start Population'}
          </button>

          <button 
            onClick={handleGutenbergIngest} 
            disabled={status === 'processing' || gutenbergStatus === 'processing'}
            className={styles.button}
            style={{ background: '#C8861A', color: 'white' }}
          >
            {gutenbergStatus === 'processing' ? 'Ingesting Gutenberg...' : 'Ingest Gutenberg (Top 5 Pages)'}
          </button>

          <button 
            onClick={handleLibreTextsImport} 
            disabled={status === 'processing' || gutenbergStatus === 'processing' || libretextsStatus === 'processing'}
            className={styles.button}
            style={{ background: '#006D77', color: 'white' }}
          >
            {libretextsStatus === 'processing' ? 'Importing LibreTexts...' : 'Import LibreTexts (Edge Function)'}
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
