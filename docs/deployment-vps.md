# Generic VPS Deployment

Use any VPS that supports Node.js 20+.

## Setup

```bash
git clone https://github.com/YOUR_ORG/shared-ai-memory-mcp.git
cd shared-ai-memory-mcp
npm ci
npm run build
```

Create `.env` on the server with:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MEMORY_MCP_TOKEN`
- `NODE_ENV=production`
- `PORT=3000`

## PM2

```bash
npm install -g pm2
pm2 start dist/server.js --name shared-ai-memory-mcp
pm2 save
```

## HTTPS

Use Nginx, Caddy, Traefik, or a cloud load balancer to terminate HTTPS and proxy to the local `PORT`.
