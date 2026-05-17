-- Run in Supabase → SQL Editor (additive, safe to re-run)
-- Persists each constitutional analysis so it can be shared via permalink.

create extension if not exists "pgcrypto";

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  claim text not null,
  result jsonb not null,
  retrieval_quality real,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists analyses_created_at_idx
  on public.analyses (created_at desc);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert on public.analyses to anon, authenticated, service_role;

alter table public.analyses enable row level security;

drop policy if exists "analyses_select_anon" on public.analyses;
create policy "analyses_select_anon"
  on public.analyses
  for select
  to anon, authenticated
  using (true);

drop policy if exists "analyses_insert_all" on public.analyses;
create policy "analyses_insert_all"
  on public.analyses
  for insert
  to anon, authenticated, service_role
  with check (true);
