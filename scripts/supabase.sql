-- Run once in your Supabase project's SQL editor.
-- Only the backend service-role key may write to this table.
create table if not exists public.resource_submissions (
  id bigint generated always as identity primary key,
  slug text not null unique,
  repository text not null unique,
  metadata jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
alter table public.resource_submissions enable row level security;
-- No anon/authenticated policies: client-side requests cannot read or write submissions.
