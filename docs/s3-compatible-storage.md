# S3-Compatible Storage

S3-compatible storage is the recommended production path for v1.

Supported through the same adapter:

- Cloudflare R2
- AWS S3
- Backblaze B2
- MinIO
- generic S3-compatible providers

## Environment Variables

```text
ARTIFACT_STORAGE_PROVIDER=s3
S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_FORCE_PATH_STYLE=true
```

For AWS S3, `S3_ENDPOINT` can usually be empty and `S3_REGION` should be the AWS region.

For Cloudflare R2, use the R2 endpoint, region `auto`, and path-style access if needed.

## Security

- Use private buckets by default.
- Use least-privilege storage credentials.
- Do not commit S3 credentials.
- Signed URLs expire quickly and should not be logged.
