import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odklvauuiitaoenzhlda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ka2x2YXV1aWl0YW9lbnpobGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTczMzIsImV4cCI6MjA4ODE3MzMzMn0.ZTiLAjhbN867KYVQENh1ZQ7MD91faj3GqY-8FbHl1VY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
