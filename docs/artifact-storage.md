# Artifact Storage

Large files and logs should live outside the memory database.

The database stores:

- artifact metadata
- external storage references
- summaries
- selected searchable chunks

Raw content lives in:

- local filesystem archive storage
- S3-compatible storage
- future OAuth-backed Google Drive or OneDrive adapters

## Providers

Set:

```text
ARTIFACT_STORAGE_PROVIDER=local
```

Allowed values:

- `local`
- `s3`
- `cloudflare_r2`
- `aws_s3`
- `backblaze_b2`
- `minio`
- `google_drive`
- `onedrive`

Google Drive and OneDrive are adapter placeholders in v1 because production OAuth token storage needs careful encryption and authorization design.

## Rule Of Thumb

Small durable fact: save as memory.

Large raw artifact: save to storage, register metadata, index only useful chunks.
