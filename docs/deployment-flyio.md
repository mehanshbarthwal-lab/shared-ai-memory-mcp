# Fly.io Deployment

1. Copy the example config:

```bash
cp fly.toml.example fly.toml
```

2. Change the app name in `fly.toml`.
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

5. Verify:

```text
https://your-app.fly.dev/health
```

6. MCP URL:

```text
https://your-app.fly.dev/mcp
```
