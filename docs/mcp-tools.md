# MCP Tools

All tools return JSON-like structured content and text content suitable for Claude.

## `add_memory`

Input:

- `content` string
- `scope` enum: `global`, `project`, `account`
- `project_name` optional string
- `source_account` optional string
- `memory_type` enum
- `tags` optional string array
- `importance` optional integer from 1 to 5

Use only for durable memory. The tool rejects obvious secret-related content.

## `search_memory`

Input:

- `query` string
- `scope` optional
- `project_name` optional
- `memory_type` optional
- `limit` optional

Searches `content` using simple text matching for v1.

## `list_project_memories`

Input:

- `project_name` string
- `limit` optional

Returns important and recent project memories.

## `update_memory`

Input:

- `id` uuid
- `content` optional
- `tags` optional
- `importance` optional
- `memory_type` optional
- `scope` optional
- `project_name` optional string or null

Use this instead of creating duplicates when memory changes.

## `delete_memory`

Input:

- `id` uuid

Deletes one memory.

## `export_memories`

Input:

- `project_name` optional
- `scope` optional
- `memory_type` optional

Exports filtered memories as JSON.

## Artifact Tools

### `register_artifact`

Registers a file that already exists in cloud/local storage.

### `list_artifacts`

Lists artifact metadata.

### `search_artifacts`

Searches artifact metadata, summaries, and extracted chunks.

### `recall_from_artifact`

Returns only relevant chunks and optional summary from one artifact.

### `index_artifact`

Downloads an artifact through the configured storage adapter and stores useful extracted snippets.

### `archive_large_log`

Registers a large log and stores only summary/selected chunks in the database.

### `delete_artifact`

Soft-deletes artifact metadata by default. Can optionally hard-delete and delete from storage.

### `storage_status`

Reports memory database provider, active archive storage provider, configured artifact providers, and OAuth setup status without exposing secrets.
