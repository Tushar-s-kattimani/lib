import { createClient } from '@supabase/supabase-js';

// Use placeholders so the app doesn't crash with a white screen if env variables are missing in Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://missing-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
