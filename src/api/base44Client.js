// Data layer for Sound, backed by Supabase.
//
// The app was first built on Base44, and every page talks to `base44.entities`,
// `base44.auth`, `base44.integrations` and `base44.functions`. This file keeps
// that same shape so the pages did not need rewriting, but every call now goes
// to your own Supabase project. The name `base44` is kept only so imports stay
// unchanged.

import { supabase } from './supabaseClient';
import { ENTITIES } from './schema';
import { appUrl, stripBase } from '@/lib/basePath';

const PUBLIC_BUCKET = 'public-files';
const PRIVATE_BUCKET = 'private-files';
const SYSTEM_FIELDS = new Set(['id', 'created_date', 'updated_date', 'created_by_id', 'created_by']);

class ApiError extends Error {
  constructor(message, status, cause) {
    super(message);
    this.status = status;
    this.cause = cause;
  }
}

const fail = (error, status = 400) => {
  throw new ApiError(error?.message || 'Request failed', error?.status || status, error);
};

// ─── Entities ────────────────────────────────────────────────────────────────

// Keep only known columns, and turn '' into null where the column is not text.
function clean(entity, data) {
  const fields = ENTITIES[entity].fields;
  const out = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (SYSTEM_FIELDS.has(key) || !(key in fields)) continue;
    const type = fields[key];
    if (value === '' && type !== 'string') out[key] = null;
    else if (value === undefined) continue;
    else out[key] = value;
  }
  return out;
}

// Supports the query shapes the app uses: { field: value },
// { field: { $in: [...] } }, plus $nin, $ne, $gt, $gte, $lt, $lte.
function applyQuery(builder, query) {
  let q = builder;
  for (const [field, condition] of Object.entries(query || {})) {
    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
      for (const [op, value] of Object.entries(condition)) {
        if (op === '$in') q = q.in(field, value.length ? value : ['__none__']);
        else if (op === '$nin') q = value.length ? q.not(field, 'in', `(${value.map((v) => `"${v}"`).join(',')})`) : q;
        else if (op === '$ne') q = value === null ? q.not(field, 'is', null) : q.neq(field, value);
        else if (op === '$gt') q = q.gt(field, value);
        else if (op === '$gte') q = q.gte(field, value);
        else if (op === '$lt') q = q.lt(field, value);
        else if (op === '$lte') q = q.lte(field, value);
        else throw new ApiError(`Unsupported query operator ${op}`, 400);
      }
    } else if (condition === null) {
      q = q.is(field, null);
    } else {
      q = q.eq(field, condition);
    }
  }
  return q;
}

// Accepts list({ sort, limit, skip }) or the older list(sort, limit, skip).
function readOptions(a, b, c) {
  if (a && typeof a === 'object') return { sort: a.sort, limit: a.limit, skip: a.skip };
  return { sort: a, limit: b, skip: c };
}

function applyOptions(builder, { sort, limit, skip }) {
  let q = builder;
  if (sort) {
    const desc = sort.startsWith('-');
    q = q.order(desc ? sort.slice(1) : sort, { ascending: !desc, nullsFirst: false });
  }
  const from = skip || 0;
  const size = limit || 1000;
  return q.range(from, from + size - 1);
}

function makeEntity(entity) {
  const table = ENTITIES[entity].table;
  const run = async (promise) => {
    const { data, error } = await promise;
    if (error) fail(error);
    return data;
  };

  return {
    async list(a, b, c) {
      const rows = await run(applyOptions(supabase.from(table).select('*'), readOptions(a, b, c)));
      return { items: rows || [] };
    },
    async filter(query, a, b, c) {
      const rows = await run(
        applyOptions(applyQuery(supabase.from(table).select('*'), query), readOptions(a, b, c))
      );
      return { items: rows || [] };
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      if (error) fail(error);
      if (!data) throw new ApiError('Not found', 404);
      return data;
    },
    async create(values) {
      return run(supabase.from(table).insert(clean(entity, values)).select('*').single());
    },
    async bulkCreate(list) {
      return run(supabase.from(table).insert(list.map((v) => clean(entity, v))).select('*'));
    },
    async update(id, values) {
      return run(supabase.from(table).update(clean(entity, values)).eq('id', id).select('*').maybeSingle());
    },
    async delete(id) {
      await run(supabase.from(table).delete().eq('id', id));
      return { ok: true };
    },
    async deleteMany(query) {
      if (!query || !Object.keys(query).length) throw new ApiError('deleteMany needs a filter', 400);
      await run(applyQuery(supabase.from(table).delete(), query));
      return { ok: true };
    },
  };
}

const entities = Object.fromEntries(Object.keys(ENTITIES).map((name) => [name, makeEntity(name)]));

// The Base44 "User" entity is the profiles table. Admins see everyone; other
// members only see themselves.
entities.User = {
  async list() {
    const { data, error } = await supabase.from('profiles').select('*').order('created_date', { ascending: false });
    if (error) fail(error);
    return data || [];
  },
  async filter(query) {
    const { data, error } = await applyQuery(supabase.from('profiles').select('*'), query);
    if (error) fail(error);
    return data || [];
  },
  async get(id) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) fail(error);
    if (!data) throw new ApiError('Not found', 404);
    return data;
  },
};

// ─── Auth ────────────────────────────────────────────────────────────────────

const loginPath = (returnTo) =>
  appUrl('/login' + (returnTo && returnTo !== '/' ? '?returnTo=' + encodeURIComponent(returnTo) : ''));

// "https://site/repo/write?x=1" → "/write?x=1"
const toReturnPath = (href) => {
  try {
    const url = new URL(href || window.location.href, window.location.origin);
    if (url.origin !== window.location.origin) return '/';
    const path = stripBase(url.pathname);
    if (path.startsWith('/login') || path.startsWith('/register')) return '/';
    return path + url.search;
  } catch {
    return '/';
  }
};

const auth = {
  async me() {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) throw new ApiError('Not signed in', 401);
    const authUser = session.user;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
    return {
      id: authUser.id,
      email: authUser.email,
      full_name:
        profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
      role: profile?.role || 'user',
      created_date: profile?.created_date || authUser.created_at,
    };
  },

  async isAuthenticated() {
    const { data } = await supabase.auth.getSession();
    return Boolean(data?.session);
  },

  async updateMe(values) {
    const { data: sessionData } = await supabase.auth.getSession();
    const id = sessionData?.session?.user?.id;
    if (!id) throw new ApiError('Not signed in', 401);
    const { error } = await supabase.from('profiles').update({ full_name: values.full_name }).eq('id', id);
    if (error) fail(error);
    return auth.me();
  },

  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) fail(error, 401);
    return { access_token: data.session?.access_token, user: data.user };
  },

  async loginWithProvider(provider, returnTo = '/') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + appUrl(returnTo || '/') },
    });
    if (error) fail(error);
  },

  async register({ email, password, full_name }) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + appUrl('/'),
        data: full_name ? { full_name } : undefined,
      },
    });
    if (error) fail(error);
    return { ok: true };
  },

  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
    if (error) fail(error);
    return { access_token: data.session?.access_token };
  },

  async resendOtp(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) fail(error);
  },

  // Supabase keeps the session itself, so there is nothing to store.
  setToken() {},

  async resetPasswordRequest(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + appUrl('/reset-password?token=email-link'),
    });
    if (error) fail(error);
  },

  // The email link signs the person in for recovery, so only the new password is needed.
  async resetPassword({ newPassword }) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) fail(error);
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    window.location.href = loginPath(redirectUrl ? toReturnPath(redirectUrl) : '/');
  },

  redirectToLogin(fromUrl) {
    window.location.href = loginPath(toReturnPath(fromUrl));
  },
};

// ─── File storage ────────────────────────────────────────────────────────────

async function upload(bucket, file) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) throw new ApiError('Sign in to upload files', 401);
  const safeName = (file.name || 'file').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-80);
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) fail(error);
  return path;
}

const integrations = {
  Core: {
    async UploadPublicFile({ file }) {
      const path = await upload(PUBLIC_BUCKET, file);
      const { data } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(path);
      return { file_url: data.publicUrl };
    },
    // Same as UploadPublicFile; kept because older Base44 code calls UploadFile.
    async UploadFile({ file }) {
      return integrations.Core.UploadPublicFile({ file });
    },
    // `bucket` is optional; the Resource Library uses its own "library-files" bucket.
    async UploadPrivateFile({ file, bucket = PRIVATE_BUCKET }) {
      const path = await upload(bucket, file);
      return { file_uri: path };
    },
    async CreateFileSignedUrl({ file_uri, expires_in = 300, bucket = PRIVATE_BUCKET, download }) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(file_uri, expires_in, download ? { download } : undefined);
      if (error) fail(error);
      return { signed_url: data.signedUrl };
    },
    async DeleteFile({ file_uri, bucket = PRIVATE_BUCKET }) {
      const { error } = await supabase.storage.from(bucket).remove([file_uri]);
      if (error) fail(error);
      return { ok: true };
    },
  },
};

// ─── Backend functions ───────────────────────────────────────────────────────
// updateBusinessStandings and applyReviewRetention now run inside the database;
// notifyBusiness is a Supabase Edge Function because it sends email.

const functions = {
  async invoke(name, body = {}) {
    if (name === 'updateBusinessStandings') {
      const { data, error } = await supabase.rpc('update_business_standings', {
        p_business_id: body.business_id || null,
      });
      if (error) fail(error);
      return { data };
    }
    if (name === 'applyReviewRetention') {
      const { data, error } = await supabase.rpc('apply_review_retention');
      if (error) fail(error);
      return { data };
    }
    if (name === 'notifyBusiness') {
      const { data, error } = await supabase.functions.invoke('notify-business', {
        body: { ...body, app_url: window.location.origin + appUrl('/') },
      });
      if (error) fail(error);
      return { data };
    }
    throw new ApiError(`Unknown function ${name}`, 404);
  },
};

export const base44 = { entities, auth, integrations, functions };
export default base44;
