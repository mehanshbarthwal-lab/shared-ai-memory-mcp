# Deployment

Shared AI Memory MCP is hosting-provider independent. The same Node.js app can run on Render, Koyeb, Railway, Fly.io, Docker, Docker Compose, a VPS, or another Node-compatible platform.

Provider-specific files in this repository are optional examples. They do not change the app code and should not contain secrets.

## Required Environment Variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MEMORY_MCP_TOKEN`
- `NODE_ENV=production`
- `PORT` when your host requires setting it manually
- `ARTIFACT_STORAGE_PROVIDER`

Optional:

- `DATABASE_PROVIDER=supabase`
- `LOG_LEVEL=info`
- `MAX_SEARCH_RESULTS=10`
- `LOCAL_ARTIFACT_DIR=./artifacts`
- S3-compatible variables when using R2, S3, B2, or MinIO

## Before Deploying

1. Create a Supabase project.
2. Run `migrations/001_create_memories.sql`.
3. Run `migrations/002_create_artifacts.sql`.
4. Generate a long random `MEMORY_MCP_TOKEN`.
5. Add secrets through your hosting provider's secret settings.
6. Confirm no `.env` file is committed.
7. Choose artifact storage: local for testing, S3-compatible for production, or future OAuth adapters.

## Render

1. Push the repo to GitHub.
2. Create a Render Web Service.
3. Build command:

```bash
npm ci && npm run build
```

4. Start command:

```bash
npm start
```

5. Health check path: `/health`.
6. Add required environment variables.
7. Deploy.

Optional: copy `render.yaml.example` to `render.yaml` if you want infrastructure-as-code setup.

## Railway

1. Create a Railway project from the GitHub repo.
2. Railway can use `railway.json`.
3. Add required environment variables.
4. Deploy.
5. Confirm:

```text
https://your-railway-domain.example/health
```

## Koyeb

1. Create a Koyeb Web Service from the GitHub repo.
2. Set build command:

```bash
npm ci && npm run build
```

3. Set run command:

```bash
npm start
```

4. Add required environment variables through Koyeb Secrets.
5. Deploy and verify `/health`.
6. Use your Koyeb public URL plus `/mcp`.

## Fly.io

1. Copy the example config:

```bash
cp fly.toml.example fly.toml
```

2. Edit the app name in `fly.toml`.
3. Set secrets:

```bash
fly secrets set SUPABASE_URL=...
fly secrets set SUPABASE_SERVICE_ROLE_KEY=...
fly secrets set MEMORY_MCP_TOKEN=...
```

4. Deploy:

```bash
fly deploy
```

5. Connect clients to:

```text
https://your-fly-app.fly.dev/mcp
```

## Docker

Build:

```bash
docker build -t shared-ai-memory-mcp .
```

Run:

```bash
docker run -p 3000:3000 --env-file .env shared-ai-memory-mcp
```

Do not bake secrets into the image.

## Docker Compose

```bash
docker compose up --build
```

The compose file reads `.env` and runs the MCP server. It expects Supabase to provide the database and API.

For local artifact storage, mount a durable volume to `LOCAL_ARTIFACT_DIR` before relying on it for production data.

## Generic VPS with Node.js and PM2

Install Node.js 20 or newer, then:

```bash
git clone https://github.com/your-org/shared-ai-memory-mcp.git
cd shared-ai-memory-mcp
npm ci
npm run build
```

Create a production `.env` on the server, then run:

```bash
npm install -g pm2
pm2 start dist/server.js --name shared-ai-memory-mcp
pm2 save
```

Put the app behind HTTPS with Nginx, Caddy, Traefik, or your preferred reverse proxy. Forward traffic to the local port set by `PORT`.

## Connector URL

After deployment, the Remote MCP URL is:

```text
https://your-domain.example/mcp
```

Clients must send:

```text
Authorization: Bearer your-long-random-memory-token
```
