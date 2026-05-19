# Architecture

Shared AI Memory MCP is a self-hosted Remote MCP server.

```mermaid
flowchart LR
  Client["Claude or MCP-compatible client"] --> Connector["Remote MCP connector"]
  Connector --> Server["Node.js + Express + MCP SDK"]
  Server --> Auth["Bearer token middleware"]
  Server --> Tools["Memory and artifact tools"]
  Tools --> Supabase["User-owned Supabase project"]
  Supabase --> Memories["public.memories"]
  Supabase --> Artifacts["public.artifacts and public.artifact_chunks"]
  Tools --> Storage["Local/S3-compatible/cloud storage adapters"]
  Storage --> Raw["Raw files, logs, documents, datasets"]
```

## Runtime Layers

- `src/server.ts`: Express server and Streamable HTTP MCP transport.
- `src/auth.ts`: bearer token protection.
- `src/config.ts`: environment parsing and validation.
- `src/logger.ts`: structured logging that avoids memory content.
- `src/db.ts`: Supabase persistence adapter.
- `src/storage/*`: artifact storage adapters.
- `src/tools/*`: MCP tool registrations.
- `src/types/index.ts`: shared memory types.

## Portability

The app listens on `process.env.PORT` with a local fallback of `3000`. It does not assume localhost and can run behind common cloud proxies or reverse proxies.

## Search

v1 uses PostgreSQL text matching through Supabase filters. The migration adds `pg_trgm` and a trigram index on `content` so the database is ready for better text search. Vector search can be added later behind the DB/search layer without changing tool names.
