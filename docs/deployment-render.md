# Render Deployment

Render is one supported host, not a requirement.

1. Push this repo to GitHub.
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
6. Add environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MEMORY_MCP_TOKEN`
- `NODE_ENV=production`

7. Deploy.
8. Use `https://your-render-service.example/mcp` as the Remote MCP URL.
