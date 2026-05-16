-- Run in Supabase → SQL Editor (re-run after changes)

create extension if not exists vector;

create table if not exists public.documents (
  id bigint generated always as identity primary key,
  content text not null,
  metadata jsonb not null default '{}',
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

create index if not exists documents_embedding_idx
  on public.documents
  using hnsw (embedding vector_cosine_ops);

-- Similarity search for RAG (src/lib/rag/retrieve.ts)
create or replace function public.match_documents(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where d.embedding is not null
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- Permissions (anon must read for client-side / script retrieval)
grant usage on schema public to anon, authenticated, service_role;
grant select on public.documents to anon, authenticated, service_role;
grant insert on public.documents to anon, authenticated, service_role;
grant execute on function public.match_documents(vector, int) to anon, authenticated, service_role;

-- RLS: embed script may use service_role; retrieval uses anon
alter table public.documents enable row level security;

drop policy if exists "documents_select_anon" on public.documents;
create policy "documents_select_anon"
  on public.documents
  for select
  to anon, authenticated
  using (true);

drop policy if exists "documents_insert_all" on public.documents;
create policy "documents_insert_all"
  on public.documents
  for insert
  to anon, authenticated, service_role
  with check (true);
