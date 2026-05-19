# Database

The database is the deployer's own Supabase PostgreSQL project.

## Table

Migration file: `migrations/001_create_memories.sql`

Table: `public.memories`

Columns:

- `id uuid primary key default gen_random_uuid()`
- `scope text not null`
- `project_name text null`
- `source_account text null`
- `source_client text null`
- `source_model text null`
- `source_workspace text null`
- `visibility text default 'private'`
- `memory_type text not null`
- `content text not null`
- `tags text[] default '{}'`
- `importance integer default 3`
- `metadata jsonb default '{}'`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`
- `deleted_at timestamptz null`
- `archived_at timestamptz null`
- `last_accessed_at timestamptz null`

## Allowed Scopes

- `global`
- `project`
- `account`

## Allowed Memory Types

- `preference`
- `project_context`
- `instruction`
- `fact`
- `workflow`
- `file_path`
- `decision`

## Indexes

- `scope`
- `project_name`
- `memory_type`
- `visibility`
- `deleted_at`
- `archived_at`
- `updated_at`
- GIN index for `tags`
- trigram GIN index for `content`

## RLS Note

This v1 server uses `SUPABASE_SERVICE_ROLE_KEY` server-side only. The service role bypasses RLS. Do not expose it to browsers or direct clients.

If you later add direct client access or tenant isolation, enable RLS and create tenant-aware policies first.

## Artifact Tables

`public.artifacts` stores metadata and external storage references for large files/logs.

`public.artifact_chunks` stores useful extracted snippets for search and recall. It should not contain entire huge logs, raw datasets, or full long chat histories unless they are small enough and intentionally indexed.

Artifacts include `deleted_at`, `archived_at`, `last_accessed_at`, `visibility`, `source_client`, `source_model`, `source_workspace`, and `metadata` for multi-AI and lifecycle workflows.
