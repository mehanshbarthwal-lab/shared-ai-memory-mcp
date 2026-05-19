# Shared AI Memory MCP

Self-hostable, open-source Remote MCP server that gives Claude and other MCP-compatible AI clients access to shared memory plus large-file and log recall using user-owned database and storage.

## Problem It Solves

AI clients often keep context inside one account, one chat, or one project. This project provides a portable external memory and artifact recall server so multiple MCP-compatible clients can read durable project knowledge and retrieve relevant slices of large files/logs without stuffing huge raw content into the memory database.

Each user deploys their own server and connects it to their own Supabase PostgreSQL database. This repository does not depend on any personal Claude account, Supabase project, Render service, or private deployment.

## Who This Is For

- Developers who want shared memory across Claude projects or accounts.
- Teams experimenting with Remote MCP connectors.
- Builders who want a simple self-hosted memory backend before adding vector search or richer auth.
- People who want to keep their AI memory in their own database.

## Architecture

```mermaid
flowchart LR
  A["Claude or MCP-compatible AI client"] --> B["MCP or REST API"]
  B --> C["Self-hosted shared-ai-memory-mcp server"]
  C --> D["Memory database"]
  D --> E["Small memories"]
  D --> F["Artifact metadata, summaries, chunks"]
  C --> G["Cloud/local storage"]
  G --> H["Raw files, logs, documents, datasets"]
```

## Features

- Remote MCP endpoint at `/mcp`.
- Health endpoint at `/health`.
- Streamable HTTP MCP transport for remote connectors.
- Supabase PostgreSQL persistence.
- Zod input validation.
- Simple bearer token auth with `MEMORY_MCP_TOKEN`.
- Strict TypeScript.
- Simple `ilike` text search for v1.
- `pg_trgm` migration index to support text search.
- Modular search/data layer so vector search can be added later.
- Artifact metadata and chunk indexing for large files.
- Local filesystem archive storage for self-hosted testing.
- S3-compatible storage adapter for Cloudflare R2, AWS S3, Backblaze B2, and MinIO.
- Google Drive and OneDrive adapter interfaces with OAuth setup docs for future implementation.
- REST artifact endpoints under `/api/artifacts`.
- Host-agnostic deployment: Render, Koyeb, Railway, Fly.io, Docker, Docker Compose, VPS, or any Node.js host.

## MCP Tools

- `add_memory`: save durable memory.
- `search_memory`: search memory content.
- `list_project_memories`: list memories for one project.
- `update_memory`: update memory fields.
- `delete_memory`: delete one memory by id.
- `export_memories`: export memories as JSON.
- `register_artifact`: register an externally stored file/log.
- `list_artifacts`: list artifact metadata.
- `search_artifacts`: search artifact metadata, summaries, and chunks.
- `recall_from_artifact`: retrieve relevant chunks from one artifact.
- `index_artifact`: extract searchable snippets from an artifact.
- `archive_large_log`: archive a large log without storing the whole thing as memory.
- `delete_artifact`: soft-delete metadata by default.
- `storage_status`: report database/storage configuration without secrets.

See [docs/mcp-tools.md](docs/mcp-tools.md) for schemas and examples.

## Quick Start

```bash
npm install
cp .env.example .env
npm run build
npm run dev
```

Then visit:

```text
http://localhost:3000/health
```

The MCP endpoint is:

```text
http://localhost:3000/mcp
```

## Environment Variables

Use these exact names:

| Name | Required | Description |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Your Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side Supabase service role key. Never expose it to browsers or clients. |
| `MEMORY_MCP_TOKEN` | Yes | Long random bearer token for MCP clients. |
| `TOKEN_ENCRYPTION_KEY` | Future | Placeholder for encrypted OAuth token storage when Google Drive/OneDrive token storage is added. |
| `NODE_ENV` | Recommended | `development`, `test`, or `production`. |
| `PORT` | Recommended | Port supplied by your hosting provider. Local fallback is `3000`. |
| `DATABASE_PROVIDER` | Optional | Defaults to `supabase`. |
| `LOG_LEVEL` | Optional | `debug`, `info`, `warn`, or `error`. Defaults to `info`. |
| `MAX_SEARCH_RESULTS` | Optional | Default result limit when a tool does not provide `limit`. |
| `ARTIFACT_STORAGE_PROVIDER` | Optional | `local`, `s3`, `cloudflare_r2`, `aws_s3`, `backblaze_b2`, `minio`, `google_drive`, or `onedrive`. |
| `LOCAL_ARTIFACT_DIR` | Optional | Local archive directory for the local adapter. |
| `S3_ENDPOINT` | Optional | S3-compatible endpoint. |
| `S3_REGION` | Optional | S3 region, often `auto` for R2. |
| `S3_BUCKET` | Optional | Artifact bucket name. |
| `S3_ACCESS_KEY_ID` | Optional | S3 access key id. |
| `S3_SECRET_ACCESS_KEY` | Optional | S3 secret access key. |
| `S3_FORCE_PATH_STYLE` | Optional | Often `true` for S3-compatible providers. |

## Supabase Setup

1. Create a Supabase project.
2. Open **Project Settings -> API**.
3. Copy the project URL into `SUPABASE_URL`.
4. Copy the service role key into `SUPABASE_SERVICE_ROLE_KEY`.
5. Keep the service role key server-side only.

## Database Migration

1. Open the Supabase SQL editor.
2. Run `migrations/001_create_memories.sql`.
3. Run `migrations/002_create_artifacts.sql`.
4. Confirm `public.memories`, `public.artifacts`, and `public.artifact_chunks` exist.

The migration adds:

- scope and memory type checks
- indexes for `scope`, `project_name`, and `memory_type`
- GIN index for `tags`
- `pg_trgm` support and content trigram index
- `updated_at` trigger
- RLS documentation notes

## Local Development

```bash
npm install
cp .env.example .env
npm run typecheck
npm run build
npm test
npm run dev
```

Use placeholder values only in committed files. Put real secrets in `.env`, platform secret settings, or a secret manager.

## Docker Setup

Build:

```bash
docker build -t shared-ai-memory-mcp .
```

Run:

```bash
docker run -p 3000:3000 --env-file .env shared-ai-memory-mcp
```

Docker Compose:

```bash
docker compose up --build
```

The compose file runs the MCP app and expects your `.env` to point at your Supabase project.

## Large Files, Logs, And Cloud Storage

Small durable memories go into the memory database. Large files, full logs, huge documents, full datasets, and long raw chat histories should not.

For large artifacts:

1. Store raw files/logs in user-owned cloud or local storage.
2. Register artifact metadata in `public.artifacts`.
3. Store only summaries and useful searchable snippets in `public.artifact_chunks`.
4. Recall only relevant chunks through MCP or REST when an AI client needs detail.

Supported v1 storage:

- Local filesystem archive storage for testing and self-hosted setups.
- S3-compatible storage for Cloudflare R2, AWS S3, Backblaze B2, and MinIO.

Designed adapters:

- Google Drive requires OAuth and secure token storage.
- OneDrive requires Microsoft Graph OAuth and secure token storage.

OAuth tokens must never be stored as normal memories. If implemented later, token storage should be encrypted and documented clearly.

REST endpoints:

- `POST /api/artifacts/register`
- `GET /api/artifacts`
- `GET /api/artifacts/search`
- `POST /api/artifacts/:id/recall`
- `POST /api/artifacts/:id/index`
- `DELETE /api/artifacts/:id`

All artifact REST endpoints require `Authorization: Bearer <MEMORY_MCP_TOKEN>`.

## Deployment Options

The same code deploys to any Node.js-compatible host. Provider files are examples only:

- `render.yaml.example`
- `railway.json`
- `fly.toml.example`
- `Dockerfile`
- `docker-compose.yml`
- `docs/deployment-koyeb.md`

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full guide.

## Render Deployment

1. Create a Render Web Service from your GitHub repo.
2. Build command: `npm ci && npm run build`
3. Start command: `npm start`
4. Health check path: `/health`
5. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MEMORY_MCP_TOKEN`, and `NODE_ENV=production`.
6. Use `https://your-render-service.example/mcp` as the connector URL.

## Railway Deployment

1. Deploy the GitHub repo on Railway.
2. Railway can use `railway.json`.
3. Add the same environment variables.
4. Confirm `/health` works.
5. Use the Railway public URL plus `/mcp`.

## Koyeb Deployment

1. Create a Koyeb Web Service from your GitHub repo.
2. Build command: `npm ci && npm run build`
3. Run command: `npm start`
4. Add required environment variables in Koyeb Secrets.
5. Use the Koyeb public URL plus `/mcp`.

## Fly.io Deployment

1. Copy `fly.toml.example` to `fly.toml`.
2. Set your app name.
3. Add secrets:

```bash
fly secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... MEMORY_MCP_TOKEN=...
```

4. Deploy:

```bash
fly deploy
```

## Generic VPS Deployment

```bash
npm ci
npm run build
npm start
```

For production, run behind HTTPS with a process manager such as PM2:

```bash
pm2 start dist/server.js --name shared-ai-memory-mcp
```

## Claude Custom Connector Setup

1. Deploy this server to a public HTTPS URL.
2. Add a custom Remote MCP connector in Claude.
3. Endpoint:

```text
https://your-domain.example/mcp
```

4. Authentication header:

```text
Authorization: Bearer your-long-random-memory-token
```

5. Confirm Claude can list the memory and artifact tools.

## REST API Support

Other AI tools and automation scripts can use the protected REST artifact API under `/api/artifacts`. REST requests use the same bearer token as MCP. See [docs/rest-api.md](docs/rest-api.md).

## Claude Skill Setup

Upload [shared-memory-vault-skill/SKILL.md](shared-memory-vault-skill/SKILL.md) as a Claude Skill. The Skill instructs Claude to search memory before project work, ask before saving unless explicitly told, and avoid storing secrets.

## Security Warnings

- This project is self-hosted by default.
- Do not operate one public shared server for unrelated users unless you add tenant isolation, audit logs, rate limiting, and stronger authentication.
- The v1 bearer token model is simple. Add OAuth or multi-user auth before offering this as public SaaS.
- `SUPABASE_SERVICE_ROLE_KEY` must only be used server-side.
- Never commit `.env`.
- Use HTTPS in production.
- Rotate `MEMORY_MCP_TOKEN` if exposed.
- Production logs must not include full memory content.

## What Not To Store In Memory

Never store:

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

## Example Use Cases

- Store durable architecture decisions for a codebase.
- Keep stable project setup notes across Claude sessions.
- Share workflow preferences across multiple MCP-compatible clients.
- Record important file paths for a long-running project.
- Export project memory before migration or backup.

## Deletion, Pruning, Import, And Export

- Artifact deletion is soft-delete by default through `deleted_at`.
- Use hard delete only when you really want metadata removed.
- Delete raw cloud/local files only when `delete_from_storage` is explicitly requested.
- `archived_at` and `last_accessed_at` columns are present for future pruning/archive jobs.
- Use `export_memories` for memory export. Import tooling is on the roadmap.

## Roadmap

- Optional `pgvector` search.
- Rate limiting.
- Read-only token support.
- Import/export CLI.
- Per-client identity and audit logs.
- OAuth and tenant-aware authorization.

See [ROADMAP.md](ROADMAP.md).

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Please never include secrets, private URLs, personal account names, or credentials in issues or pull requests.

## License

MIT. See [LICENSE](LICENSE).
