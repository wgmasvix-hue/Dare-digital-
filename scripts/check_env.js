/**
 * Environment Variable Checker for Vercel Deployment
 * Run this script to verify if all required environment variables are set.
 */

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'GEMINI_API_KEY',
  'OPENAI_API_KEY',
  'VITE_HF_API_KEY'
];

console.log('--- DARE Digital Library: Environment Check ---');

let missing = 0;
requiredVars.forEach(v => {
  if (process.env[v]) {
    console.log(`✅ ${v} is set.`);
  } else {
    console.log(`❌ ${v} is MISSING.`);
    missing++;
  }
});

if (missing === 0) {
  console.log('\n🎉 All required environment variables are set! You are ready for Vercel deployment.');
} else {
  console.log(`\n⚠️  ${missing} environment variables are missing. Please add them to your Vercel project settings.`);
  console.log('Refer to .env.example for the list of required variables.');
}

console.log('----------------------------------------------');
