// Monthly Rosette Check (was the Base44 "Monthly Rosette Check" workflow).
// Run by .github/workflows/monthly-check.yml on the 1st of every month.
//
//  1. Recalculates every business's ratings and rosettes.
//  2. Applies the retention schedule: hides reviews 36 months after
//     publication and deletes proof of custom 12 months after publication,
//     including the uploaded files.
//
// Needs two GitHub repository secrets: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from '@supabase/supabase-js';

const rawUrl = (process.env.SUPABASE_URL || '').trim();
const url = rawUrl ? new URL(rawUrl).origin : '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const standings = await supabase.rpc('update_business_standings', { p_business_id: null });
if (standings.error) throw standings.error;
console.log('Standings:', JSON.stringify(standings.data));

const retention = await supabase.rpc('apply_review_retention');
if (retention.error) throw retention.error;
const files = (retention.data?.files || []).filter(Boolean);
if (files.length) {
  const removed = await supabase.storage.from('private-files').remove(files);
  if (removed.error) throw removed.error;
}
console.log('Retention:', JSON.stringify({ ...retention.data, files: files.length }));
