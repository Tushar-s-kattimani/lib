import { createClient } from '@supabase/supabase-js';

// Clean the keys aggressively to remove any hidden characters, spaces, or non-ASCII characters
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://missing-url.supabase.co')
  .trim()
  .replace(/[^a-zA-Z0-9\.\:\/\-\_]/g, ''); // Strict whitelist for URL characters

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing_key')
  .trim()
  .replace(/[^a-zA-Z0-9\.\-\_\=]/g, ''); // Strict whitelist for JWT characters (including =)

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
