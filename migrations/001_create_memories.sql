create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('global', 'project', 'account')),
  project_name text null,
  source_account text null,
  source_client text null,
  source_model text null,
  source_workspace text null,
  visibility text not null default 'private' check (visibility in ('private', 'shared', 'public')),
  memory_type text not null check (
    memory_type in (
      'preference',
      'project_context',
      'instruction',
      'fact',
      'workflow',
      'file_path',
      'decision'
    )
  ),
  content text not null,
  tags text[] not null default '{}',
  importance integer not null default 3 check (importance between 1 and 5),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  archived_at timestamptz null,
  last_accessed_at timestamptz null
);

create index if not exists memories_scope_idx on public.memories (scope);
create index if not exists memories_project_name_idx on public.memories (project_name);
create index if not exists memories_memory_type_idx on public.memories (memory_type);
create index if not exists memories_visibility_idx on public.memories (visibility);
create index if not exists memories_deleted_at_idx on public.memories (deleted_at);
create index if not exists memories_archived_at_idx on public.memories (archived_at);
create index if not exists memories_updated_at_idx on public.memories (updated_at desc);
create index if not exists memories_tags_gin_idx on public.memories using gin (tags);
create index if not exists memories_content_trgm_idx on public.memories using gin (content gin_trgm_ops);

create or replace function set_memories_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists memories_set_updated_at on public.memories;
create trigger memories_set_updated_at
before update on public.memories
for each row
execute function set_memories_updated_at();

comment on table public.memories is
  'Shared AI memory records. Use server-side service role access only. If RLS is enabled, create explicit policies for your deployment model.';

-- RLS note:
-- This self-hosted v1 server uses SUPABASE_SERVICE_ROLE_KEY on the server only.
-- If you expose direct browser/client access later, enable RLS and add tenant-aware policies first.
