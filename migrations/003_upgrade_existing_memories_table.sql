create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

alter table public.memories
  add column if not exists source_client text null,
  add column if not exists source_model text null,
  add column if not exists source_workspace text null,
  add column if not exists visibility text not null default 'private',
  add column if not exists metadata jsonb not null default '{}',
  add column if not exists deleted_at timestamptz null,
  add column if not exists archived_at timestamptz null,
  add column if not exists last_accessed_at timestamptz null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'memories_visibility_check'
  ) then
    alter table public.memories
      add constraint memories_visibility_check
      check (visibility in ('private', 'shared', 'public'));
  end if;
end $$;

create index if not exists memories_source_client_idx on public.memories (source_client);
create index if not exists memories_source_workspace_idx on public.memories (source_workspace);
create index if not exists memories_visibility_idx on public.memories (visibility);
create index if not exists memories_deleted_at_idx on public.memories (deleted_at);
create index if not exists memories_archived_at_idx on public.memories (archived_at);
create index if not exists memories_last_accessed_at_idx on public.memories (last_accessed_at);
create index if not exists memories_metadata_gin_idx on public.memories using gin (metadata);

comment on table public.memories is
'Shared AI memory records. This migration safely upgrades existing installs without deleting data.';
