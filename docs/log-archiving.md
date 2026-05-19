# Log Archiving

Large logs should not be stored as normal memories.

Use `archive_large_log` to register the log and optionally index:

- `summary_only`
- `selected_chunks`
- `full_text_if_small`

For very large logs, selected chunks should focus on useful lines such as errors, warnings, failures, exceptions, and timeouts.

## Recommended Flow

1. Upload the raw log to local or S3-compatible storage.
2. Call `archive_large_log` with `provider` and `storage_key`.
3. Store a concise summary.
4. Search and recall relevant chunks when needed.

Never log full raw logs in production application logs.
