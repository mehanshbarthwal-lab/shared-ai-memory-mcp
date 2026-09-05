<div align="center">

# Shared AI Memory MCP

<p><strong>Self hosted Remote Model Context Protocol server providing persistent shared memory and intelligent artifact recall across AI clients backed by user owned storage</strong></p>

<p>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-success.svg?style=for-the-badge" alt="License MIT" /></a>
  <a href="https://modelcontextprotocol.io/"><img src="https://img.shields.io/badge/Protocol-MCP-blue.svg?style=for-the-badge" alt="Model Context Protocol" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D20.0.0-emerald.svg?style=for-the-badge" alt="Node.js" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
  <a href="#artifact-and-log-storage"><img src="https://img.shields.io/badge/Storage-S3%20%7C%20R2%20%7C%20Local-orange.svg?style=for-the-badge" alt="Storage S3 R2 Local" /></a>
</p>

<p>
  <a href="#problem-it-solves"><strong>Problem Solved</strong></a> &nbsp;&bull;&nbsp;
  <a href="#architecture"><strong>Architecture</strong></a> &nbsp;&bull;&nbsp;
  <a href="#key-capabilities"><strong>Key Capabilities</strong></a> &nbsp;&bull;&nbsp;
  <a href="#mcp-tools-catalog"><strong>Tool Catalog</strong></a> &nbsp;&bull;&nbsp;
  <a href="#quick-start"><strong>Quick Start</strong></a> &nbsp;&bull;&nbsp;
  <a href="#client-integration"><strong>Client Setup</strong></a> &nbsp;&bull;&nbsp;
  <a href="#deployment-options"><strong>Deployment</strong></a> &nbsp;&bull;&nbsp;
  <a href="#documentation-index"><strong>Docs</strong></a>
</p>

<br/>

<a href="#architecture">
  <img src="assets/banner.png" alt="Shared AI Memory MCP Architectural Banner" width="100%" style="border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);" />
</a>

<br/>
<br/>

</div>

---

## Problem It Solves

Modern AI clients and developer tools keep context trapped inside a single account, an isolated chat session, or a specific workspace. When switching between desktop interfaces, terminal workflows, or multi agent orchestrators, institutional knowledge vanishes.

Furthermore, dumping large raw logs, lengthy specifications, or full datasets directly into conversations exhausts token windows, causes prompt bloat, and spikes operational costs.

**Shared AI Memory MCP** solves this by establishing a portable, user owned memory server operating over the official Remote Model Context Protocol:

* **Persistent Structured Knowledge**: Saves durable architectural decisions, workflow rules, file locations, and project context in your own Supabase PostgreSQL database.
* **Intelligent Dual Tier Storage**: Stores large raw files and logs in external cloud or local storage while indexing searchable summaries and snippet chunks for surgical recall.
* **Universal Interoperability**: Connects seamlessly with Claude Desktop, Claude Code, Cursor IDE, Google Antigravity, custom GPTs, and automated backend scripts through one unified endpoint.
* **Complete Data Sovereignty**: Operates entirely on user controlled infrastructure with zero vendor lock in and zero third party telemetry.

> **Audience**: Built for developers, engineering teams, and autonomous AI agents requiring shared memory across tools without sacrificing database ownership or privacy.

---

## Architecture

The server exposes a streamable HTTP Model Context Protocol transport at `/mcp` alongside a protected REST API for external automation. Durable memories live in PostgreSQL with fast trigram search, while large raw artifacts reside in S3 compatible object storage or local archives.

```mermaid
flowchart TB
    subgraph Clients["AI Clients and Agents"]
        C1["Anthropic Claude Desktop"]
        C2["Claude Code CLI"]
        C3["Cursor IDE"]
        C4["Google Antigravity"]
        C5["Custom GPTs / REST Scripts"]
    end

    subgraph Server["Shared AI Memory MCP Server"]
        direction TB
        E1["Bearer Auth and Zod Validation"]
        E2["Streamable MCP Transport: /mcp"]
        E3["Artifact REST API: /api/artifacts"]
        E4["Core Memory Manager and Tool Router"]
        E1 --> E2
        E1 --> E3
        E2 --> E4
        E3 --> E4
    end

    subgraph Storage["User Owned Infrastructure"]
        direction TB
        subgraph Database["Supabase PostgreSQL Database"]
            D1[("public.memories<br/>Scope, Tags, Trigram Index")]
            D2[("public.artifacts<br/>Metadata, Summaries, Status")]
            D3[("public.artifact_chunks<br/>Snippet Search and Slices")]
        end
        subgraph Vault["Object Storage Vault"]
            S1["Cloudflare R2 / AWS S3"]
            S2["MinIO / Backblaze B2"]
            S3["Local Filesystem Archive"]
        end
    end

    Clients -->|"HTTP Bearer Token"| Server
    E4 -->|"Structured CRUD and Search"| Database
    E4 -->|"Streaming and Presigned URLs"| Vault
```

---

## Key Capabilities

* **Standard Model Context Protocol Endpoint**: Runs a production streamable HTTP transport at `/mcp` for native remote client integration.
* **Dual Tier Memory and Artifact Model**: Distinguishes compact, durable project facts from massive raw logs and files to maximize context efficiency.
* **High Performance Trigram Search**: Leverages PostgreSQL `pg_trgm` extension for fuzzy text matching across memory content, tags, and artifact chunks.
* **Flexible Multi Cloud Storage**: Built in adapters support Cloudflare R2, Amazon S3, MinIO, Backblaze B2, and local filesystem directories.
* **Strict Schema Verification**: Every inbound request is validated through TypeScript and Zod schemas before hitting storage.
* **Token Preserving Chunk Recall**: Recalls only relevant sections of large files without bloating conversational context windows.
* **Zero Secret Persistence**: Dedicated architectural guardrails actively prevent accidental persistence of passwords, tokens, or private keys.
* **Comprehensive REST API**: Complementary `/api/artifacts` endpoints allow CI/CD pipelines and headless scripts to register artifacts directly.

---

## MCP Tools Catalog

The server exposes fourteen specialized Model Context Protocol tools organized into two operational tiers:

### 1. Memory Management Tools

| Tool Name | Key Parameters | Description |
| :--- | :--- | :--- |
| `add_memory` | `content`, `scope`, `project_name`, `tags`, `memory_type`, `importance` | Saves a durable memory record to PostgreSQL. |
| `search_memory` | `query`, `project_name`, `scope`, `memory_type`, `limit` | Performs fast fuzzy text search across stored memories. |
| `list_project_memories` | `project_name`, `scope`, `limit` | Retrieves all active memories associated with a project. |
| `update_memory` | `id`, `content`, `tags`, `importance`, `memory_type` | Updates existing memory fields without changing creation history. |
| `delete_memory` | `id` | Permanently deletes a memory record by identifier. |
| `export_memories` | `project_name`, `scope` | Exports memories as structured JSON for backups or migrations. |

### 2. Artifact and Log Recall Tools

| Tool Name | Key Parameters | Description |
| :--- | :--- | :--- |
| `register_artifact` | `title`, `project_name`, `storage_path`, `content_type`, `summary` | Registers an externally stored file, log, or dataset in metadata. |
| `list_artifacts` | `project_name`, `scope`, `limit` | Lists registered artifacts and their storage statuses. |
| `search_artifacts` | `query`, `project_name`, `limit` | Searches across artifact titles, summaries, and indexed chunks. |
| `recall_from_artifact` | `artifact_id`, `chunk_indices` | Retrieves specific content slices from an artifact without loading the full file. |
| `index_artifact` | `artifact_id`, `chunks` | Stores searchable snippet chunks extracted from an artifact. |
| `archive_large_log` | `title`, `project_name`, `log_content`, `summary` | Stores a large log in object storage while keeping only a summary in the database. |
| `delete_artifact` | `id`, `hard_delete`, `delete_from_storage` | Soft deletes metadata by default, with optional storage cleanup. |
| `storage_status` | _none_ | Reports active database and storage adapter configurations safely without leaking secrets. |

---

## Quick Start

### Prerequisites

* Node.js version 20.0.0 or higher
* An active Supabase account and project
* An S3 compatible storage bucket or local storage folder

### 1. Clone Repository and Install Dependencies

```bash
git clone https://github.com/mehanshbarthwal-lab/shared-ai-memory-mcp.git
cd shared-ai-memory-mcp
npm install
```

### 2. Configure Environment Variables

Create your local environment file:

```bash
cp .env.example .env
```

Open `.env` and configure your database and authentication keys:

```ini
NODE_ENV=development
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# MCP Client Security
MEMORY_MCP_TOKEN=generate-a-long-random-bearer-token

# Artifact Storage (Default: local filesystem)
ARTIFACT_STORAGE_PROVIDER=local
LOCAL_ARTIFACT_DIR=./storage/artifacts
```

### 3. Run Database Migrations

Apply the database schemas in your Supabase SQL Editor in numerical sequence:

1. Execute [`migrations/001_create_memories.sql`](migrations/001_create_memories.sql) to provision the `memories` table, scope constraints, and trigram text indexes.
2. Execute [`migrations/002_create_artifacts.sql`](migrations/002_create_artifacts.sql) to provision the `artifacts` and `artifact_chunks` tables.

### 4. Build and Run Server

Start in development mode with automatic reload:

```bash
npm run dev
```

Or build and run the optimized production bundle:

```bash
npm run build
npm start
```

### 5. Verify Health Status

Verify the server is running by querying the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "shared-ai-memory-mcp",
  "version": "0.1.0",
  "database": "connected"
}
```

The Model Context Protocol endpoint is ready for incoming connections at `http://localhost:3000/mcp`.

---

## Client Integration

Connect any Model Context Protocol compatible client to your self hosted instance using the following configuration patterns.

### Anthropic Claude Desktop

Add your remote server configuration to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "shared-memory": {
      "url": "https://your-hosted-domain.example/mcp",
      "headers": {
        "Authorization": "Bearer your-long-random-memory-token"
      }
    }
  }
}
```

### Claude Code CLI

Add the server directly from your terminal:

```bash
claude mcp add shared-memory --url https://your-hosted-domain.example/mcp --header "Authorization=Bearer your-long-random-memory-token"
```

### Cursor IDE

In Cursor Settings navigate to **Features > MCP Servers > Add New MCP Server**:

* **Name**: `shared-memory`
* **Type**: `SSE` / `HTTP`
* **URL**: `https://your-hosted-domain.example/mcp`
* **Headers**: `Authorization: Bearer your-long-random-memory-token`

### Google Antigravity

Configure in your Antigravity sidecar or MCP configuration:

```json
{
  "mcpServers": {
    "shared-memory": {
      "command": "node",
      "args": ["dist/server.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key",
        "MEMORY_MCP_TOKEN": "your-bearer-token"
      }
    }
  }
}
```

### Claude Custom Skill

Import the included [`shared-memory-vault-skill/SKILL.md`](shared-memory-vault-skill/SKILL.md) into Claude Code or Claude Desktop. The skill equips the model with behavioral rules:

* Always searches `scope=project` before starting tasks.
* Confirms with the user before saving decisions to memory.
* Automatically routes large logs to artifact storage.
* Strictly rejects requests to persist credentials or private keys.

---

## Artifact and Log Storage

Small facts and decisions go to PostgreSQL. Large logs, datasets, code bundles, and documents are routed to object storage.

```
       Small Text (<10 KB)              Large Files and Logs (>10 KB)
┌───────────────────────────────┐     ┌───────────────────────────────┐
│     public.memories table     │     │     Cloud / Local Storage     │
│   (PostgreSQL Trigram Search) │     │ (Cloudflare R2 / AWS S3 / FS) │
└───────────────────────────────┘     └──────────────┬────────────────┘
                                                     │
                                                     ▼
                                      ┌───────────────────────────────┐
                                      │   public.artifacts metadata   │
                                      │  public.artifact_chunks index │
                                      └───────────────────────────────┘
```

### Storage Provider Configurations

#### Cloudflare R2

```ini
ARTIFACT_STORAGE_PROVIDER=cloudflare_r2
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=your-memory-artifacts
S3_ACCESS_KEY_ID=your-r2-access-key-id
S3_SECRET_ACCESS_KEY=your-r2-secret-access-key
S3_FORCE_PATH_STYLE=true
```

#### Amazon S3

```ini
ARTIFACT_STORAGE_PROVIDER=aws_s3
S3_REGION=us-east-1
S3_BUCKET=your-memory-artifacts
S3_ACCESS_KEY_ID=your-aws-access-key
S3_SECRET_ACCESS_KEY=your-aws-secret-key
```

#### MinIO and Self Hosted S3

```ini
ARTIFACT_STORAGE_PROVIDER=minio
S3_ENDPOINT=http://127.0.0.1:9000
S3_REGION=us-east-1
S3_BUCKET=memory-artifacts
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_FORCE_PATH_STYLE=true
```

---

## Deployment Options

Deploy anywhere Node.js runs. Production templates are preconfigured in the repository:

| Platform | Configuration File | Health Check | Deployment Notes |
| :--- | :--- | :--- | :--- |
| **Render** | `render.yaml.example` | `/health` | Connect GitHub repository, set environment variables, deploy Web Service. |
| **Railway** | `railway.json` | `/health` | Deploy with zero config using the checked in `railway.json` spec. |
| **Koyeb** | `docs/deployment-koyeb.md` | `/health` | Web service deployment with Koyeb Secret management. |
| **Fly.io** | `fly.toml.example` | `/health` | Run `fly deploy` after provisioning secrets with `fly secrets set`. |
| **Docker** | `Dockerfile` | `/health` | Standard multi stage container build. |
| **Docker Compose** | `docker-compose.yml` | `/health` | One command container orchestration for local testing. |
| **Linux VPS** | Systemd / PM2 | `/health` | Run behind Nginx reverse proxy with HTTPS termination. |

### 1. Docker Run

```bash
docker build -t shared-ai-memory-mcp .
docker run -d -p 3000:3000 --env-file .env --name memory-server shared-ai-memory-mcp
```

### 2. Docker Compose

```bash
docker compose up -d --build
```

### 3. VPS with PM2

```bash
npm ci
npm run build
pm2 start dist/server.js --name shared-ai-memory-mcp
```

Refer to [`DEPLOYMENT.md`](DEPLOYMENT.md) for detailed platform specific walkthroughs.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `SUPABASE_URL` | Yes | _none_ | Supabase project API URL (`https://<project>.supabase.co`). |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | _none_ | Server side Supabase service role key. Never expose to client applications. |
| `MEMORY_MCP_TOKEN` | Yes | _none_ | Secret bearer token required for client authentication on `/mcp` and REST endpoints. |
| `PORT` | No | `3000` | Port for the HTTP server to listen on. |
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `test`, `production`). |
| `DATABASE_PROVIDER` | No | `supabase` | Database driver provider. |
| `LOG_LEVEL` | No | `info` | Logging verbosity (`debug`, `info`, `warn`, `error`). |
| `MAX_SEARCH_RESULTS` | No | `20` | Default search limit when unspecified by the client. |
| `ARTIFACT_STORAGE_PROVIDER` | No | `local` | Storage adapter (`local`, `cloudflare_r2`, `aws_s3`, `minio`, `backblaze_b2`). |
| `LOCAL_ARTIFACT_DIR` | No | `./storage/artifacts` | Archive directory when using the local filesystem adapter. |
| `S3_ENDPOINT` | No | _none_ | Custom endpoint URL for S3 compatible providers (R2, MinIO, B2). |
| `S3_REGION` | No | `us-east-1` | S3 region identifier (`auto` for Cloudflare R2). |
| `S3_BUCKET` | No | _none_ | Target bucket name for artifact storage. |
| `S3_ACCESS_KEY_ID` | No | _none_ | Access key identifier for object storage. |
| `S3_SECRET_ACCESS_KEY` | No | _none_ | Secret access key for object storage. |
| `S3_FORCE_PATH_STYLE` | No | `false` | Set to `true` for MinIO, Cloudflare R2, or path style S3 gateways. |

---

## Security and Data Privacy

> [!IMPORTANT]
> **Single Tenant Architecture**: This server is designed as a single tenant self hosted system. If hosting a shared server for unrelated external users, implement per tenant database isolation, fine grained access policies, and audit logging.

> [!WARNING]
> **Never Persist Secrets**: Under no circumstances should AI clients store credentials, passwords, session cookies, API keys, private keys, or personal identification tokens in memory records.

> [!CAUTION]
> **Service Role Key Security**: Keep your `SUPABASE_SERVICE_ROLE_KEY` strictly on the server. Never bundle it into client applications, commit it to version control, or expose it in public logs.

---

## Documentation Index

Explore the comprehensive guides located in [`docs/`](docs/):

| Guide | Description |
| :--- | :--- |
| [`docs/architecture.md`](docs/architecture.md) | Architectural breakdown of memory workflows and transports. |
| [`docs/mcp-tools.md`](docs/mcp-tools.md) | Complete schemas, arguments, and response payloads for all fourteen tools. |
| [`docs/database.md`](docs/database.md) | Database schema documentation, trigram indexes, and query optimizations. |
| [`docs/artifact-storage.md`](docs/artifact-storage.md) | Object storage architecture and chunking implementation guide. |
| [`docs/large-file-recall.md`](docs/large-file-recall.md) | Strategies for recalling slices of large documents without prompt bloat. |
| [`docs/s3-compatible-storage.md`](docs/s3-compatible-storage.md) | Step by step setup for Cloudflare R2, AWS S3, MinIO, and Backblaze B2. |
| [`docs/security.md`](docs/security.md) | Threat model, authentication verification, and data hygiene rules. |
| [`docs/rest-api.md`](docs/rest-api.md) | REST API specification for programmatic artifact management. |
| [`docs/local-development.md`](docs/local-development.md) | Local testing, unit test execution, and database seeding procedures. |

---

## Development and Testing

```bash
# Run TypeScript compilation check
npm run typecheck

# Build server bundle
npm run build

# Run automated test suite
npm test

# Start development server with live watch
npm run dev
```

---

## Roadmap

* [x] Remote Model Context Protocol streamable transport
* [x] Supabase PostgreSQL persistence with trigram search
* [x] S3 compatible and local artifact storage adapters
* [x] REST API endpoints for external automation
* [x] Dedicated Claude Memory Vault Skill
* [ ] Vector embeddings and semantic search via `pgvector`
* [ ] Google Drive and Microsoft OneDrive OAuth adapters
* [ ] Read only API tokens for safe client inspection
* [ ] Rate limiting and multi tenant authorization
* [ ] Built in database backup and export CLI

See [`ROADMAP.md`](ROADMAP.md) for future development plans.

---

## Author and Attribution

Created and maintained by **[Mehansh Barthwal](https://github.com/mehanshbarthwal-lab)**.

* **Portfolio**: [mehanshlabs.qzz.io](https://mehanshlabs.qzz.io/)
* **Universal Agent Skills**: [Universal Agent Skills Showcase](https://mehanshlabs.qzz.io/universal-agent-skills)
* **GitHub**: [@mehanshbarthwal-lab](https://github.com/mehanshbarthwal-lab)

---

## License

This project is licensed under the **MIT License**. See the [`LICENSE`](LICENSE) file for details.
