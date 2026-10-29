import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Shown in the browser console when the build is missing its settings.
  console.error(
    'Sound: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set. ' +
      'Add them to .env.local (local) or the GitHub repository variables (deploy).'
  );
}

export const supabase = createClient(url || 'http://localhost', anonKey || 'missing-key', {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
