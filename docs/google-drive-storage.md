# Google Drive Storage

Google Drive support is designed through an adapter interface, but full OAuth upload/download is not implemented in v1. This is separate from Claude native connectors: this server talks to Google Drive only through credentials configured by the self-hosting user.

## Why

Google Drive requires OAuth consent, refresh tokens, token rotation, and secure token storage. OAuth tokens must not be stored as normal memories.

## Environment Variables

```text
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
GOOGLE_DRIVE_REDIRECT_URI=
GOOGLE_DRIVE_FOLDER_ID=
```

## Security Requirements For Future Implementation

- Store refresh tokens encrypted.
- Never expose OAuth tokens to MCP clients.
- Do not log Drive file contents or token values.
- Do not make files public by default.
- Support user-controlled revocation.

For v1, use local or S3-compatible storage.
