# Railway Deployment

Railway can deploy the same code without changes.

1. Create a Railway project from GitHub.
2. Keep `railway.json` or configure manually.
3. Add environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MEMORY_MCP_TOKEN`
- `NODE_ENV=production`

4. Deploy.
5. Verify `/health`.
6. Use your Railway domain plus `/mcp` as the connector URL.
