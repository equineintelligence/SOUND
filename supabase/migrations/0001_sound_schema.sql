-- Sound: database schema for Supabase
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- It creates every table, the security rules, the file storage buckets and the
-- rosette/rating calculation that used to run as a Base44 backend function.

create extension if not exists pgcrypto;

-- ─── Helpers ────────────────────────────────────────────────────────────────

create or replace function public.touch_updated_date()
returns trigger language plpgsql as $$
begin
  new.updated_date = now();
  return new;
end $$;

-- ─── User profiles (replaces the Base44 User entity) ───────────────────────

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_date();
alter table public.profiles enable row level security;

-- True when the signed-in user is an admin. Security definer so it can read
-- profiles without tripping the profiles security rules.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Used by triggers: true for admins, the server (service role key), the SQL
-- editor, and the trusted functions below (which run as their owner).
create or replace function public.is_privileged()
returns boolean language sql stable as $$
  select current_user not in ('anon', 'authenticated') or public.is_admin();
$$;

-- Used to gate the trusted functions: true only when the caller is an admin,
-- the server (service role key) or the SQL editor.
create or replace function public.caller_is_privileged()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(auth.jwt() ->> 'role', '') in ('service_role', '') or public.is_admin();
$$;

-- Create a profile row whenever someone signs up (email or Google).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: admin updates" on public.profiles
  for update using (public.is_admin());
-- Users may update their own name, but never their role (see guard below).
create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid());

create or replace function public.guard_profiles()
returns trigger language plpgsql as $$
begin
  if not public.is_privileged() then
    new.role := old.role;
    new.email := old.email;
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profiles();

-- ─── App tables (generated from the Base44 entity definitions) ──────────────

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  name text not null,
  type jsonb default '[]'::jsonb,
  area text,
  description text,
  services jsonb default '[]'::jsonb,
  phone text,
  website text,
  photos jsonb default '[]'::jsonb,
  opening_hours text,
  contact_email text,
  status text default 'pending_check' check (status in ('pending_check', 'unclaimed', 'claimed')),
  source text default 'customer' check (source in ('owner', 'customer')),
  claimed_by text,
  ownership_proof text,
  rating_overall double precision,
  rating_horse_care double precision,
  rating_communication double precision,
  rating_value double precision,
  rating_professionalism double precision,
  rating_facilities double precision,
  review_count double precision
);
create trigger businesses_touch before update on public.businesses for each row execute function public.touch_updated_date();
alter table public.businesses enable row level security;

create table public.business_claims (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  business text not null,
  contact_name text,
  contact_email text,
  role_at_business text,
  proof_uri text,
  proof_name text,
  status text default 'pending' not null check (status in ('pending', 'approved', 'rejected')),
  moderator_note text
);
create trigger business_claims_touch before update on public.business_claims for each row execute function public.touch_updated_date();
alter table public.business_claims enable row level security;

create table public.business_replies (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  review text not null,
  business text not null,
  text text not null,
  status text default 'pending' check (status in ('pending', 'published', 'removed'))
);
create trigger business_replies_touch before update on public.business_replies for each row execute function public.touch_updated_date();
alter table public.business_replies enable row level security;

create table public.care_visits (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  horse text,
  horse_name text,
  type text default 'Vet' not null check (type in ('Vet', 'Physio', 'Farrier', 'Dentist', 'Chiropractor', 'Bodywork', 'Other')),
  provider text,
  date text not null,
  time text,
  cost double precision,
  notes text
);
create trigger care_visits_touch before update on public.care_visits for each row execute function public.touch_updated_date();
alter table public.care_visits enable row level security;

create table public.flags (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  review text not null,
  business text,
  type text not null check (type in ('policy_breach', 'factual_dispute')),
  reason text,
  details text,
  status text default 'open' check (status in ('open', 'resolved')),
  outcome text
);
create trigger flags_touch before update on public.flags for each row execute function public.touch_updated_date();
alter table public.flags enable row level security;

create table public.horses (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  name text not null,
  breed text,
  sex text check (sex in ('Mare', 'Gelding', 'Stallion', 'Filly', 'Colt')),
  date_of_birth text,
  age double precision,
  height_cm double precision,
  colour text,
  photo_uri text,
  notes text
);
create trigger horses_touch before update on public.horses for each row execute function public.touch_updated_date();
alter table public.horses enable row level security;

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  user_id text not null,
  user_email text,
  user_name text,
  plan text default 'free' check (plan in ('free', 'pro')),
  status text default 'active' check (status in ('active', 'paused', 'cancelled')),
  business_membership boolean default false,
  business_name text,
  started_date text,
  note text
);
create trigger memberships_touch before update on public.memberships for each row execute function public.touch_updated_date();
alter table public.memberships enable row level security;

create table public.proofs_of_custom (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  review text not null,
  business text,
  file_uri text not null,
  file_name text,
  month_of_service text
);
create trigger proofs_of_custom_touch before update on public.proofs_of_custom for each row execute function public.touch_updated_date();
alter table public.proofs_of_custom enable row level security;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  business text not null,
  business_name text,
  business_owner_id text,
  reviewer text,
  display_name text,
  overall_rating double precision not null,
  criterion_horse_care double precision,
  criterion_communication double precision,
  criterion_value double precision,
  criterion_professionalism double precision,
  criterion_facilities double precision,
  topic text,
  service_used text,
  month_of_service text,
  text text not null,
  status text default 'pending' check (status in ('pending', 'published', 'returned', 'removed', 'expired')),
  declaration_accepted boolean,
  senior_review boolean,
  screening_notes jsonb default '[]'::jsonb,
  moderator_note text,
  proof_uri text,
  proof_name text,
  published_date text
);
create trigger reviews_touch before update on public.reviews for each row execute function public.touch_updated_date();
alter table public.reviews enable row level security;

create table public.ride_plans (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  title text not null,
  type text default 'Ride' check (type in ('Ride', 'Lesson', 'Show', 'Clinic', 'Other')),
  horse text,
  horse_name text,
  date text not null,
  time text,
  location text,
  notes text
);
create trigger ride_plans_touch before update on public.ride_plans for each row execute function public.touch_updated_date();
alter table public.ride_plans enable row level security;

create table public.rosettes (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  business text not null,
  category text not null check (category in ('horse_care', 'coaching', 'service')),
  category_label text,
  year double precision,
  status text default 'active' check (status in ('active', 'withdrawn')),
  average double precision,
  review_count double precision,
  awarded_date text
);
create trigger rosettes_touch before update on public.rosettes for each row execute function public.touch_updated_date();
alter table public.rosettes enable row level security;

create table public.training_resources (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  title text not null,
  kind text default 'article' not null check (kind in ('article', 'video', 'exercise')),
  summary text,
  body text,
  video_url text,
  cover_url text,
  duration text
);
create trigger training_resources_touch before update on public.training_resources for each row execute function public.touch_updated_date();
alter table public.training_resources enable row level security;

create table public.upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  user_id text not null,
  user_email text,
  user_name text,
  request_type text default 'pro' not null check (request_type in ('pro', 'business')),
  business_id text,
  business_name text,
  message text,
  status text default 'submitted' not null check (status in ('submitted', 'invoiced', 'paid', 'approved', 'declined')),
  invoice_number text,
  invoice_amount double precision,
  invoice_date text,
  invoice_due text,
  admin_note text
);
create trigger upgrade_requests_touch before update on public.upgrade_requests for each row execute function public.touch_updated_date();
alter table public.upgrade_requests enable row level security;

-- ─── Security rules (same access rules the Base44 entities had) ────────────

-- Businesses
create policy "businesses: read" on public.businesses for select using (
  status in ('unclaimed', 'claimed')
  or created_by_id = auth.uid()
  or claimed_by = auth.uid()::text
  or public.is_admin()
);
create policy "businesses: create" on public.businesses for insert to authenticated
  with check (created_by_id = auth.uid() or public.is_admin());
create policy "businesses: update" on public.businesses for update using (
  created_by_id = auth.uid() or claimed_by = auth.uid()::text or public.is_admin()
);
create policy "businesses: delete" on public.businesses for delete using (public.is_admin());

-- Business claims
create policy "business_claims: read" on public.business_claims for select
  using (created_by_id = auth.uid() or public.is_admin());
create policy "business_claims: create" on public.business_claims for insert to authenticated
  with check (created_by_id = auth.uid());
create policy "business_claims: update" on public.business_claims for update using (public.is_admin());
create policy "business_claims: delete" on public.business_claims for delete using (public.is_admin());

-- Business replies
create policy "business_replies: read" on public.business_replies for select
  using (status = 'published' or created_by_id = auth.uid() or public.is_admin());
create policy "business_replies: create" on public.business_replies for insert to authenticated
  with check (created_by_id = auth.uid());
create policy "business_replies: update" on public.business_replies for update
  using (created_by_id = auth.uid() or public.is_admin());
create policy "business_replies: delete" on public.business_replies for delete using (public.is_admin());

-- Private yard records and proof of custom: owner + admin only
do $$
declare t text;
begin
  foreach t in array array['care_visits', 'horses', 'ride_plans', 'proofs_of_custom'] loop
    execute format('create policy "%1$s: read" on public.%1$I for select using (created_by_id = auth.uid() or public.is_admin())', t);
    execute format('create policy "%1$s: create" on public.%1$I for insert to authenticated with check (created_by_id = auth.uid())', t);
    execute format('create policy "%1$s: update" on public.%1$I for update using (created_by_id = auth.uid() or public.is_admin()) with check (created_by_id = auth.uid() or public.is_admin())', t);
    execute format('create policy "%1$s: delete" on public.%1$I for delete using (created_by_id = auth.uid() or public.is_admin())', t);
  end loop;
end $$;

-- Flags
create policy "flags: read" on public.flags for select using (created_by_id = auth.uid() or public.is_admin());
create policy "flags: create" on public.flags for insert to authenticated with check (created_by_id = auth.uid());
create policy "flags: update" on public.flags for update using (public.is_admin());
create policy "flags: delete" on public.flags for delete using (public.is_admin());

-- Memberships: members read their own, only admins write
create policy "memberships: read" on public.memberships for select
  using (user_id = auth.uid()::text or public.is_admin());
create policy "memberships: create" on public.memberships for insert with check (public.is_admin());
create policy "memberships: update" on public.memberships for update using (public.is_admin());
create policy "memberships: delete" on public.memberships for delete using (public.is_admin());

-- Reviews
create policy "reviews: read" on public.reviews for select using (
  status = 'published'
  or created_by_id = auth.uid()
  or business_owner_id = auth.uid()::text
  or public.is_admin()
);
create policy "reviews: create" on public.reviews for insert to authenticated with check (created_by_id = auth.uid());
create policy "reviews: update" on public.reviews for update using (created_by_id = auth.uid() or public.is_admin());
create policy "reviews: delete" on public.reviews for delete using (public.is_admin());

-- Rosettes and training resources: everyone reads, only admins write
do $$
declare t text;
begin
  foreach t in array array['rosettes', 'training_resources'] loop
    execute format('create policy "%1$s: read" on public.%1$I for select using (true)', t);
    execute format('create policy "%1$s: create" on public.%1$I for insert with check (public.is_admin())', t);
    execute format('create policy "%1$s: update" on public.%1$I for update using (public.is_admin())', t);
    execute format('create policy "%1$s: delete" on public.%1$I for delete using (public.is_admin())', t);
  end loop;
end $$;

-- Upgrade requests
create policy "upgrade_requests: read" on public.upgrade_requests for select
  using (created_by_id = auth.uid() or user_id = auth.uid()::text or public.is_admin());
create policy "upgrade_requests: create" on public.upgrade_requests for insert to authenticated
  with check (created_by_id = auth.uid());
create policy "upgrade_requests: update" on public.upgrade_requests for update using (public.is_admin());
create policy "upgrade_requests: delete" on public.upgrade_requests for delete using (public.is_admin());

-- ─── Guards: stop members changing moderation fields themselves ────────────
-- Base44 let the author of a record edit any field on it. These triggers keep
-- that, except for fields only a moderator (admin) should set, such as a
-- review's published status or a business's ratings.

create or replace function public.guard_businesses()
returns trigger language plpgsql as $$
begin
  if public.is_privileged() then return new; end if;
  if tg_op = 'INSERT' then
    new.status := 'pending_check';
    if coalesce(new.claimed_by, '') not in ('', auth.uid()::text) then
      raise exception 'A business can only be claimed for yourself';
    end if;
    new.rating_overall := null; new.rating_horse_care := null; new.rating_communication := null;
    new.rating_value := null; new.rating_professionalism := null; new.rating_facilities := null;
    new.review_count := 0;
  else
    new.status := old.status; new.claimed_by := old.claimed_by; new.source := old.source;
    new.created_by_id := old.created_by_id;
    new.rating_overall := old.rating_overall; new.rating_horse_care := old.rating_horse_care;
    new.rating_communication := old.rating_communication; new.rating_value := old.rating_value;
    new.rating_professionalism := old.rating_professionalism; new.rating_facilities := old.rating_facilities;
    new.review_count := old.review_count;
  end if;
  return new;
end $$;
create trigger businesses_guard before insert or update on public.businesses
  for each row execute function public.guard_businesses();

create or replace function public.guard_reviews()
returns trigger language plpgsql as $$
begin
  if public.is_privileged() then return new; end if;
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.reviewer := auth.uid()::text;
    new.business_owner_id := null;
    new.published_date := null;
  else
    if new.status is distinct from old.status and new.status not in ('pending', 'removed') then
      new.status := old.status;
    end if;
    new.reviewer := old.reviewer; new.business := old.business;
    new.business_owner_id := old.business_owner_id; new.published_date := old.published_date;
    new.created_by_id := old.created_by_id;
  end if;
  return new;
end $$;
create trigger reviews_guard before insert or update on public.reviews
  for each row execute function public.guard_reviews();

create or replace function public.guard_business_replies()
returns trigger language plpgsql as $$
begin
  if public.is_privileged() then return new; end if;
  if tg_op = 'INSERT' then
    new.status := 'pending';
    if not exists (
      select 1 from public.businesses b
      where b.id::text = new.business and b.claimed_by = auth.uid()::text
    ) then
      raise exception 'Only the owner of this business can reply';
    end if;
  else
    new.status := old.status; new.created_by_id := old.created_by_id;
  end if;
  return new;
end $$;
create trigger business_replies_guard before insert or update on public.business_replies
  for each row execute function public.guard_business_replies();

create or replace function public.guard_new_request()
returns trigger language plpgsql as $$
begin
  if public.is_privileged() then return new; end if;
  if tg_table_name = 'flags' then
    new.status := 'open'; new.outcome := null;
  elsif tg_table_name = 'business_claims' then
    new.status := 'pending'; new.moderator_note := null;
  elsif tg_table_name = 'upgrade_requests' then
    new.status := 'submitted';
    new.user_id := auth.uid()::text;
    new.invoice_number := null; new.invoice_amount := null;
    new.invoice_date := null; new.invoice_due := null; new.admin_note := null;
  end if;
  return new;
end $$;
create trigger flags_guard before insert on public.flags
  for each row execute function public.guard_new_request();
create trigger business_claims_guard before insert on public.business_claims
  for each row execute function public.guard_new_request();
create trigger upgrade_requests_guard before insert on public.upgrade_requests
  for each row execute function public.guard_new_request();

-- ─── Ratings and rosettes (was the updateBusinessStandings function) ───────
-- Every rated business wears a rosette, coloured by its score: green up to 3.5,
-- yellow over 3.5, red over 4, blue over 4.5. It appears from the first
-- verified review. Pass a business id to refresh one business, or null for all.

create or replace function public.update_business_standings(p_business_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  b record;
  cat record;
  v_count int;
  v_recent int;
  v_avg double precision;
  v_active record;
  v_checked int := 0; v_updated int := 0; v_awarded int := 0; v_withdrawn int := 0;
begin
  if not public.caller_is_privileged() then
    raise exception 'Only an admin can refresh standings';
  end if;

  for b in select * from public.businesses where p_business_id is null or id = p_business_id loop
    v_checked := v_checked + 1;
    select count(*) into v_count from public.reviews where business = b.id::text and status = 'published';
    continue when v_count = 0;

    update public.businesses set
      review_count = v_count,
      rating_overall = (select round(avg(overall_rating)::numeric, 1) from public.reviews
                        where business = b.id::text and status = 'published' and overall_rating > 0),
      rating_horse_care = (select round(avg(criterion_horse_care)::numeric, 1) from public.reviews
                        where business = b.id::text and status = 'published' and criterion_horse_care > 0),
      rating_communication = (select round(avg(criterion_communication)::numeric, 1) from public.reviews
                        where business = b.id::text and status = 'published' and criterion_communication > 0),
      rating_value = (select round(avg(criterion_value)::numeric, 1) from public.reviews
                        where business = b.id::text and status = 'published' and criterion_value > 0),
      rating_professionalism = (select round(avg(criterion_professionalism)::numeric, 1) from public.reviews
                        where business = b.id::text and status = 'published' and criterion_professionalism > 0),
      rating_facilities = (select round(avg(criterion_facilities)::numeric, 1) from public.reviews
                        where business = b.id::text and status = 'published' and criterion_facilities > 0)
    where id = b.id;
    v_updated := v_updated + 1;

    select count(*) into v_recent from public.reviews
      where business = b.id::text and status = 'published' and created_date >= now() - interval '365 days';

    for cat in
      select * from (values
        ('horse_care', 'criterion_horse_care', 'Horse care'),
        ('coaching', 'criterion_communication', 'Coaching'),
        ('service', 'criterion_professionalism', 'Service')
      ) as c(category, field, label)
    loop
      execute format(
        'select coalesce(round(avg(%1$I)::numeric, 1), 0) from public.reviews
         where business = $1 and status = ''published'' and %1$I > 0
           and created_date >= now() - interval ''365 days''', cat.field)
        into v_avg using b.id::text;

      select * into v_active from public.rosettes
        where business = b.id::text and category = cat.category and status = 'active' limit 1;

      if v_recent >= 1 and v_avg > 0 then
        if v_active.id is null then
          insert into public.rosettes (business, category, category_label, year, status, average, review_count, awarded_date)
          values (b.id::text, cat.category, cat.label, extract(year from now()), 'active', v_avg, v_recent,
                  to_char(now(), 'YYYY-MM-DD'));
          v_awarded := v_awarded + 1;
        else
          update public.rosettes set average = v_avg, review_count = v_recent where id = v_active.id;
        end if;
      elsif v_active.id is not null then
        update public.rosettes set status = 'withdrawn' where id = v_active.id;
        v_withdrawn := v_withdrawn + 1;
      end if;
    end loop;
  end loop;

  return jsonb_build_object('ok', true, 'checked', v_checked, 'updated', v_updated,
                            'awarded', v_awarded, 'withdrawn', v_withdrawn);
end $$;

-- ─── Retention (was the applyReviewRetention function) ─────────────────────
-- Hides published reviews 36 months after publication and deletes proof of
-- custom records 12 months after their review was published. Returns the
-- storage paths of the deleted proof files so the monthly job can remove them.

create or replace function public.apply_review_retention()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_hidden int; v_files jsonb;
begin
  if not public.caller_is_privileged() then
    raise exception 'Only an admin can apply retention';
  end if;

  update public.reviews
     set status = 'expired',
         moderator_note = 'Hidden from public view 36 months after publication.'
   where status = 'published'
     and coalesce(nullif(published_date, '')::timestamptz, created_date) < now() - interval '1080 days';
  get diagnostics v_hidden = row_count;

  with gone as (
    delete from public.proofs_of_custom p
     using public.reviews r
     where r.id::text = p.review
       and r.status in ('published', 'expired')
       and coalesce(nullif(r.published_date, '')::timestamptz, r.created_date) < now() - interval '360 days'
    returning p.file_uri
  )
  select coalesce(jsonb_agg(file_uri), '[]'::jsonb) into v_files from gone;

  return jsonb_build_object('ok', true, 'hidden', v_hidden,
                            'proofsDeleted', jsonb_array_length(v_files), 'files', v_files);
end $$;

-- Lets the notify-business Edge Function find a business owner's email.
create or replace function public.business_owner_email(p_business_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select p.email from public.businesses b
  join public.profiles p on p.id::text = b.claimed_by
  where b.id = p_business_id and public.caller_is_privileged();
$$;

-- ─── File storage ───────────────────────────────────────────────────────────
-- "public-files": business photos, training media (anyone can view).
-- "private-files": ownership proof, proof of custom, horse photos (owner + admin).
-- Files are stored under a folder named after the uploader's user id.

insert into storage.buckets (id, name, public) values ('public-files', 'public-files', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('private-files', 'private-files', false)
  on conflict (id) do nothing;

create policy "public-files: upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'public-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "public-files: read" on storage.objects for select
  using (bucket_id = 'public-files');
create policy "public-files: delete own or admin" on storage.objects for delete
  using (bucket_id = 'public-files' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

create policy "private-files: upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'private-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "private-files: read own or admin" on storage.objects for select
  using (bucket_id = 'private-files' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "private-files: delete own or admin" on storage.objects for delete
  using (bucket_id = 'private-files' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
