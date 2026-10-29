import { createClient } from '@supabase/supabase-js';

// Keep only the https://<project>.supabase.co part, in case the address was
// copied with an extra path such as /rest/v1/ on the end.
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const url = rawUrl ? new URL(rawUrl).origin : '';
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
