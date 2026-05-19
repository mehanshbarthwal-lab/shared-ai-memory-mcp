create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  project_name text null,
  scope text not null default 'project' check (scope in ('global', 'project', 'account')),
  artifact_type text not null check (
    artifact_type in (
      'document',
      'pdf',
      'spreadsheet',
      'image',
      'dataset',
      'code_file',
      'log_file',
      'chat_export',
      'audio',
      'video',
      'archive',
      'other'
    )
  ),
  title text not null,
  description text null,
  provider text not null check (
    provider in (
      'local',
      's3',
      'cloudflare_r2',
      'aws_s3',
      'backblaze_b2',
      'minio',
      'google_drive',
      'onedrive'
    )
  ),
  storage_key text not null,
  external_url text null,
  mime_type text null,
  file_size_bytes bigint null,
  checksum text null,
  source_client text null,
  source_model text null,
  source_workspace text null,
  visibility text not null default 'private' check (visibility in ('private', 'shared', 'public')),
  tags text[] not null default '{}',
  summary text null,
  indexed_status text not null default 'pending' check (
    indexed_status in ('pending', 'indexed', 'failed', 'skipped')
  ),
  indexed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  archived_at timestamptz null,
  last_accessed_at timestamptz null,
  metadata jsonb not null default '{}'
);

create table if not exists public.artifact_chunks (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.artifacts(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  token_estimate integer null,
  page_number integer null,
  section_title text null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}',
  unique (artifact_id, chunk_index)
);

create index if not exists artifacts_project_name_idx on public.artifacts (project_name);
create index if not exists artifacts_provider_idx on public.artifacts (provider);
create index if not exists artifacts_artifact_type_idx on public.artifacts (artifact_type);
create index if not exists artifacts_deleted_at_idx on public.artifacts (deleted_at);
create index if not exists artifacts_archived_at_idx on public.artifacts (archived_at);
create index if not exists artifacts_visibility_idx on public.artifacts (visibility);
create index if not exists artifacts_tags_gin_idx on public.artifacts using gin (tags);
create index if not exists artifacts_summary_trgm_idx on public.artifacts using gin (summary gin_trgm_ops);
create index if not exists artifacts_title_trgm_idx on public.artifacts using gin (title gin_trgm_ops);

create index if not exists artifact_chunks_artifact_id_idx on public.artifact_chunks (artifact_id);
create index if not exists artifact_chunks_content_trgm_idx on public.artifact_chunks using gin (content gin_trgm_ops);

create or replace function set_artifacts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists artifacts_set_updated_at on public.artifacts;
create trigger artifacts_set_updated_at
before update on public.artifacts
for each row
execute function set_artifacts_updated_at();

comment on table public.artifacts is
  'Metadata and references for large files/logs stored outside the memory database.';

comment on table public.artifact_chunks is
  'Useful extracted snippets from artifacts. Do not store entire huge logs or full raw datasets here.';

-- RLS note:
-- This v1 server uses SUPABASE_SERVICE_ROLE_KEY on the server only.
-- If you expose direct client access later, enable RLS and tenant-aware policies first.
