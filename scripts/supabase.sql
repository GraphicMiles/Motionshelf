-- Run once in your Supabase project's SQL editor.
-- The backend secret key maps to service_role; browser roles receive no access.
create table if not exists public.resource_submissions (
  id bigint generated always as identity primary key,
  slug text not null unique,
  repository text not null unique,
  metadata jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
alter table public.resource_submissions enable row level security;
-- Deny client roles even on older Supabase projects with default public grants.
revoke all on table public.resource_submissions from anon, authenticated;
-- New projects may not automatically grant Data API access to service_role.
grant usage on schema public to service_role;
grant insert, select on table public.resource_submissions to service_role;
-- Identity columns can need sequence usage on some PostgreSQL setups.
revoke all on sequence public.resource_submissions_id_seq from anon, authenticated;
grant usage, select on sequence public.resource_submissions_id_seq to service_role;
-- No anon/authenticated policies: client-side requests cannot read or write submissions.
