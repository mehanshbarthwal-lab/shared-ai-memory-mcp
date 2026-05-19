# Security

## Self-Hosted Default

This project is designed for users to deploy their own MCP server connected to their own Supabase project. Do not run one public shared server for unrelated users unless you first add tenant isolation, OAuth or equivalent auth, rate limiting, and audit logging.

## Authentication

v1 uses a single bearer token:

```text
Authorization: Bearer <MEMORY_MCP_TOKEN>
```

Use a long random value and rotate it if exposed.

## Supabase Service Role Key

`SUPABASE_SERVICE_ROLE_KEY` is powerful and must remain server-side only. Never expose it to browsers, client apps, logs, issue reports, or screenshots.

## Never Store Secrets As Memories

Do not store:

- API keys
- passwords
- access tokens
- refresh tokens
- private keys
- recovery codes
- session cookies
- Claude login details
- deployment secrets
- sensitive personal information unless explicitly requested and appropriate

## Logs

Production logs should not include full memory content. When debugging, log ids, counts, tool names, and generic error categories instead of raw memory text.

## Cloud Storage Credentials

Do not commit cloud storage credentials. S3 keys, Google OAuth credentials, and Microsoft OAuth credentials must come from environment variables or a secret manager.

OAuth refresh tokens must not be stored as normal memories. If token storage is implemented later, encrypt tokens and document the operational risk.

Do not make cloud files public by default. Do not expose private file URLs unless explicitly configured.

`TOKEN_ENCRYPTION_KEY` is reserved for future encrypted OAuth token storage. Do not add OAuth token persistence without encryption, rotation guidance, and clear operational documentation.
