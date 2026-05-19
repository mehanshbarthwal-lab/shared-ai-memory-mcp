# Local Development

## Requirements

- Node.js 20+
- A Supabase project
- The `public.memories`, `public.artifacts`, and `public.artifact_chunks` migrations applied

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` with placeholder-free local values:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MEMORY_MCP_TOKEN`

## Commands

```bash
npm run typecheck
npm run build
npm test
npm run dev
```

## Health Check

```bash
curl http://localhost:3000/health
```

## MCP Endpoint

```text
http://localhost:3000/mcp
```

Send `Authorization: Bearer <MEMORY_MCP_TOKEN>` with MCP requests.
