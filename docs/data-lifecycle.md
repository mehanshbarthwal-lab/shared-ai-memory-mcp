# Data Lifecycle

## Delete

Artifact metadata is soft-deleted by default using `deleted_at`. Hard delete is available for irreversible metadata removal.

Raw cloud/local files are not deleted unless `delete_from_storage` is explicitly requested.

## Archive

`archived_at` is present on memory and artifact tables for future archive workflows. For now, archive behavior should be implemented by deployment-specific jobs or future tools.

## Prune

`last_accessed_at`, `archived_at`, and `deleted_at` are available for future pruning jobs. A conservative pruning policy should export data before deleting it.

## Export And Import

`export_memories` exports memory records. Artifact metadata can be listed through REST or MCP. Full import tooling is on the roadmap.

Never export secrets or OAuth tokens as normal memories.
