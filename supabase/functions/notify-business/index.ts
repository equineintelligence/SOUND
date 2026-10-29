// notify-business — Supabase Edge Function (was the Base44 notifyBusiness function)
//
// Emails a business when a review of it is published, or invites it to claim a
// profile a customer added. Only admins can call it. Mail is sent through
// Resend (https://resend.com); set these secrets in Supabase:
//   RESEND_API_KEY   your Resend API key
//   EMAIL_FROM       e.g.  Sound <hello@yourdomain.co.za>  (a domain verified in Resend)
//   SITE_URL         optional, e.g. https://sound.co.za/  (used for the button link)

import { createClient } from 'npm:@supabase/supabase-js@2';
import { TEMPLATES } from './templates.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const fill = (template: string, vars: Record<string, string>, html: boolean) =>
  template.replace(/{{(\w+)}}/g, (_, key) => {
    const value = vars[key] ?? '';
    return html ? escapeHtml(value) : value;
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Who is calling? Only admins may send notices.
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const { data: userData } = await admin.auth.getUser(token);
    const caller = userData?.user;
    if (!caller) return json({ error: 'Unauthorized' }, 401);
    const { data: profile } = await admin.from('profiles').select('role').eq('id', caller.id).maybeSingle();
    if (profile?.role !== 'admin') return json({ error: 'Forbidden' }, 403);

    const body = await req.json().catch(() => ({}));
    const kind = String(body?.kind || '');
    const businessId = String(body?.business_id || '');
    const template = TEMPLATES[kind];
    if (!template) return json({ error: 'Unsupported notice' }, 400);
    if (!businessId) return json({ error: 'Missing business' }, 400);

    const { data: business } = await admin.from('businesses').select('*').eq('id', businessId).maybeSingle();
    if (!business) return json({ error: 'Business not found' }, 404);

    const siteUrl = Deno.env.get('SITE_URL') || String(body?.app_url || '');
    const base = siteUrl ? siteUrl.replace(/\/?$/, '/') : '';
    const vars = {
      app_name: 'Sound',
      business_name: business.name || '',
      area: business.area ? ` in ${business.area}` : '',
      cta_url: base ? base + 'business' : '',
    };

    const recipients: string[] = [];
    const contact = (business.contact_email || '').trim();
    if (contact) recipients.push(contact);
    if (business.claimed_by) {
      const { data: owner } = await admin.from('profiles').select('email').eq('id', business.claimed_by).maybeSingle();
      if (owner?.email && !recipients.includes(owner.email)) recipients.push(owner.email);
    }
    if (!recipients.length) return json({ ok: true, sent: [], failed: [], note: 'No contact address on file' });

    const apiKey = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('EMAIL_FROM');
    if (!apiKey || !from) return json({ error: 'Email is not set up: add RESEND_API_KEY and EMAIL_FROM' }, 500);

    const sent: string[] = [];
    const failed: { to: string; reason: string }[] = [];
    for (const to of recipients.slice(0, 3)) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to,
          subject: fill(template.subject, vars, false),
          html: fill(template.html, vars, true),
        }),
      });
      if (res.ok) sent.push(to);
      else failed.push({ to, reason: await res.text() });
    }

    return json({ ok: true, sent, failed });
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
});
