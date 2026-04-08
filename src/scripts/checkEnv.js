import dotenv from 'dotenv';

dotenv.config();

console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('VITE_SUPABASE_ANON_KEY exists:', !!process.env.VITE_SUPABASE_ANON_KEY);
