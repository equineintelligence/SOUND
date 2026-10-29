-- Sound: Resource Library
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Adds the library of downloadable templates and guides (livery agreements,
-- lease agreements, employment contracts, workplace discipline guides and so
-- on). Every signed-in member can browse the list; only paying members (Pro or
-- Business membership) and admins can download the files. Only admins add,
-- edit or remove documents.

-- True when the signed-in member has an active Pro or Business membership, or
-- is an admin.
create or replace function public.has_paid_access()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid()::text
      and coalesce(m.status, 'active') = 'active'
      and (m.plan = 'pro' or coalesce(m.business_membership, false))
  );
$$;

create table public.library_documents (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_by text default (auth.jwt() ->> 'email'),
  title text not null,
  category text not null default 'Other',
  description text,
  audience text not null default 'all' check (audience in ('all', 'business', 'pro')),
  file_uri text not null,
  file_name text,
  file_type text,
  file_size double precision,
  version text
);
create trigger library_documents_touch before update on public.library_documents
  for each row execute function public.touch_updated_date();
alter table public.library_documents enable row level security;

create policy "library_documents: signed-in members read" on public.library_documents
  for select to authenticated using (true);
create policy "library_documents: admin create" on public.library_documents
  for insert with check (public.is_admin());
create policy "library_documents: admin update" on public.library_documents
  for update using (public.is_admin());
create policy "library_documents: admin delete" on public.library_documents
  for delete using (public.is_admin());

-- Private storage for the files. Downloads use short-lived links that only
-- paying members and admins can create.
insert into storage.buckets (id, name, public) values ('library-files', 'library-files', false)
  on conflict (id) do nothing;

create policy "library-files: paying members read" on storage.objects for select
  using (bucket_id = 'library-files' and public.has_paid_access());
create policy "library-files: admin upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'library-files' and public.is_admin());
create policy "library-files: admin update" on storage.objects for update
  using (bucket_id = 'library-files' and public.is_admin());
create policy "library-files: admin delete" on storage.objects for delete
  using (bucket_id = 'library-files' and public.is_admin());
