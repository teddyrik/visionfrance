create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.scholarships (
  id text primary key,
  slug text not null unique,
  title text not null,
  institution text not null,
  level text not null,
  deadline date not null,
  location text not null,
  coverage text not null,
  summary text not null,
  description text not null,
  eligibility jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  required_documents jsonb not null default '[]'::jsonb,
  duration text not null,
  language text not null,
  audience text not null,
  seats integer not null default 0,
  institution_email text not null,
  featured boolean not null default false,
  status text not null default 'open' check (status in ('open', 'closing', 'closed')),
  published_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.applications (
  id text primary key,
  reference text not null unique,
  scholarship_id text not null references public.scholarships(id) on delete cascade,
  scholarship_slug text not null,
  scholarship_title text not null,
  institution text not null,
  applicant jsonb not null,
  submitted_at timestamptz not null default timezone('utc', now()),
  status text not null default 'received' check (
    status in ('received', 'under_review', 'preselected', 'forwarded', 'approved', 'rejected')
  ),
  status_history jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  institution_notified_at timestamptz null
);

create index if not exists scholarships_featured_deadline_idx
  on public.scholarships (featured desc, deadline asc);

create index if not exists applications_submitted_at_idx
  on public.applications (submitted_at desc);

drop trigger if exists trg_scholarships_updated_at on public.scholarships;
create trigger trg_scholarships_updated_at
before update on public.scholarships
for each row
execute function public.set_updated_at();

alter table public.scholarships enable row level security;
alter table public.applications enable row level security;

drop policy if exists "Public read scholarships" on public.scholarships;
create policy "Public read scholarships"
on public.scholarships
for select
using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vision-france-documents',
  'vision-france-documents',
  false,
  12582912,
  array['application/pdf', 'image/png', 'image/jpeg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on table public.scholarships is 'Catalogue public Vision France';
comment on table public.applications is 'Candidatures centralisees Vision France';
