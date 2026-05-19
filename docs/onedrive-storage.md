# OneDrive Storage

OneDrive support is designed through an adapter interface, but full Microsoft Graph OAuth upload/download is not implemented in v1. This is separate from Claude native connectors: this server talks to Microsoft Graph only through credentials configured by the self-hosting user.

## Environment Variables

```text
ONEDRIVE_CLIENT_ID=
ONEDRIVE_CLIENT_SECRET=
ONEDRIVE_TENANT_ID=
ONEDRIVE_REDIRECT_URI=
ONEDRIVE_FOLDER_ID=
```

## Security Requirements For Future Implementation

- Store refresh tokens encrypted.
- Keep Microsoft Graph credentials server-side.
- Never store OAuth tokens as normal memories.
- Do not expose private sharing URLs unless explicitly configured.
- Support tenant-aware authorization before public multi-user use.

For v1, use local or S3-compatible storage.
