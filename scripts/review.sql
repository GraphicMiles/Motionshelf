-- Idempotent moderation migration. Run after supabase.sql. No browser role can access these tables.
create table if not exists public.motionshelf_maintainers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);
create table if not exists public.motionshelf_review_events (
  id bigint generated always as identity primary key,
  submission_id bigint not null references public.resource_submissions(id),
  reviewer_id uuid not null references auth.users(id),
  decision text not null check (decision in ('approved','rejected')),
  verification jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.resource_submissions add column if not exists reviewed_at timestamptz;
alter table public.resource_submissions add column if not exists reviewed_by uuid references auth.users(id);
alter table public.resource_submissions add column if not exists verification jsonb;
alter table public.motionshelf_maintainers enable row level security;
alter table public.motionshelf_review_events enable row level security;
revoke all on public.motionshelf_maintainers, public.motionshelf_review_events from anon, authenticated;
revoke all on sequence public.motionshelf_review_events_id_seq from anon, authenticated;
grant select on public.motionshelf_maintainers to service_role;
grant insert, select on public.motionshelf_review_events to service_role;
grant usage, select on sequence public.motionshelf_review_events_id_seq to service_role;
grant select, update on public.resource_submissions to service_role;
create index if not exists motionshelf_submissions_status_idx on public.resource_submissions(status,created_at);
-- Atomic review protects against concurrent decisions; only service_role may call it.
create or replace function public.motionshelf_decide(p_id bigint,p_reviewer uuid,p_decision text,p_verification jsonb)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
begin
 if p_decision not in ('approved','rejected') or not exists
   (select 1 from public.motionshelf_maintainers where user_id=p_reviewer) then return false; end if;
 update public.resource_submissions set status=p_decision,reviewed_at=now(),reviewed_by=p_reviewer,verification=p_verification
 where id=p_id and status='pending';
 if not found then return false; end if;
 insert into public.motionshelf_review_events(submission_id,reviewer_id,decision,verification)
 values (p_id,p_reviewer,p_decision,p_verification);
 return true;
end $$;
revoke all on function public.motionshelf_decide(bigint,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.motionshelf_decide(bigint,uuid,text,jsonb) to service_role;
-- Bounded, atomic global write budget protects free-tier storage across process restarts.
create table if not exists public.motionshelf_write_budget (
  window_start timestamptz primary key,
  requests integer not null check (requests >= 0),
  created_at timestamptz not null default now()
);
alter table public.motionshelf_write_budget enable row level security;
revoke all on public.motionshelf_write_budget from anon,authenticated;
create or replace function public.motionshelf_take_budget(p_limit integer default 120)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
declare bucket timestamptz := date_trunc('hour',now()); used integer;
begin
 if p_limit < 1 or p_limit > 10000 then return false; end if;
 insert into public.motionshelf_write_budget(window_start,requests) values(bucket,1)
 on conflict (window_start) do update set requests=public.motionshelf_write_budget.requests+1
 where public.motionshelf_write_budget.requests < p_limit
 returning requests into used;
 return used is not null;
end $$;
revoke all on function public.motionshelf_take_budget(integer) from public,anon,authenticated;
grant execute on function public.motionshelf_take_budget(integer) to service_role;
-- Retain a small rolling budget table; run during scheduled maintenance.
-- delete from public.motionshelf_write_budget where window_start < now() - interval '7 days';
-- Storage telemetry is available to the API service only. Supabase free database quota: 500 MiB.
create or replace function public.motionshelf_storage_snapshot()
returns jsonb language sql security definer set search_path = public, pg_temp as $$
 select jsonb_build_object(
  'databaseBytes',pg_database_size(current_database()),
  'submissions',(select count(*) from public.resource_submissions),
  'pending',(select count(*) from public.resource_submissions where status='pending'),
  'oldestPending',(select min(created_at) from public.resource_submissions where status='pending'),
  'budgetThisHour',(select requests from public.motionshelf_write_budget where window_start=date_trunc('hour',now()))
 )
$$;
revoke all on function public.motionshelf_storage_snapshot() from public,anon,authenticated;
grant execute on function public.motionshelf_storage_snapshot() to service_role;
