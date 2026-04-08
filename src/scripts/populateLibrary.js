import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { enrichMetadata } from '../services/enrichmentService.js';
import * as catalog from '../lib/oerCatalog.js';

// Initialize Supabase with Service Role Key if available, otherwise Anon Key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://odklvauuiitaoenzhlda.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ka2x2YXV1aWl0YW9lbnpobGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTczMzIsImV4cCI6MjA4ODE3MzMzMn0.ZTiLAjhbN867KYVQENh1ZQ7MD91faj3GqY-8FbHl1VY';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
  ...catalog.OPENSTAX_EXPANDED,
  ...catalog.AGRICULTURE_OER,
  ...catalog.HEALTH_OER,
  ...catalog.ENGINEERING_OER,
  ...catalog.EDUCATION_OER,
  ...catalog.AI_OER,
  ...catalog.AI_PRIORITY_OER
];

async function populate() {
  console.log(`🚀 Starting population of ${ALL_RESOURCES.length} resources...`);
  
  // We'll process in small batches to avoid rate limits
  const BATCH_SIZE = 3;
  const resourcesToProcess = ALL_RESOURCES; // Let's do 15 for now
  
  for (let i = 0; i < resourcesToProcess.length; i += BATCH_SIZE) {
    const batch = resourcesToProcess.slice(i, i + BATCH_SIZE);
    console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
    
    const promises = batch.map(async (resource) => {
      try {
        console.log(`🔍 Processing: ${resource.title}`);
        let enrichment = null;
        
        try {
          enrichment = await enrichMetadata(resource);
          console.log(`✨ Enriched: ${resource.title}`);
        } catch (enrichErr) {
          console.warn(`⚠️ Enrichment skipped for ${resource.title}: ${enrichErr.message}`);
        }
        
        const bookData = {
          ...resource,
          // Map AI fields to top-level columns if they exist
          subject: enrichment?.disciplines?.[0]?.code || resource.subject,
          zimche_programme_codes: enrichment?.zimbabwe_relevance?.applicable_programmes || resource.zimche_programme_codes,
          ai_level: enrichment?.nqf_level?.level ? parseInt(enrichment.nqf_level.level.replace('nqf_', '')) : resource.ai_level,
          updated_at: new Date().toISOString(),
          source: resource.source || 'OER',
          institution_id: resource.institution_id || 'oer-commons'
        };

        // Only add enrichment_data if we actually got something
        if (enrichment) {
          bookData.enrichment_data = enrichment;
        }

        let { error } = await supabase
          .from('books')
          .upsert(bookData, { onConflict: 'id' });

        // If it fails because of enrichment_data column missing, try again without it
        if (error && error.message.includes('enrichment_data')) {
          console.warn(`⚠️ Column 'enrichment_data' missing, retrying without it for ${resource.title}`);
          delete bookData.enrichment_data;
          const { error: retryError } = await supabase
            .from('books')
            .upsert(bookData, { onConflict: 'id' });
          error = retryError;
        }

        if (error) throw error;
        console.log(`✅ Saved: ${resource.title}`);
      } catch (err) {
        console.error(`❌ Error processing ${resource.title}:`, err.message);
      }
    });

    await Promise.all(promises);
    
    // Small delay between batches
    if (i + BATCH_SIZE < resourcesToProcess.length) {
      console.log('Sleeping for 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('✨ Population complete!');
}

populate().catch(console.error);
