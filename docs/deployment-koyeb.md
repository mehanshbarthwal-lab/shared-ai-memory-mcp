# Koyeb Deployment

Koyeb can deploy the same code without changes.

1. Create a Koyeb Web Service from your GitHub repository.
2. Set build command:

```bash
npm ci && npm run build
```

3. Set run command:

```bash
npm start
```

4. Add environment variables as Koyeb Secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MEMORY_MCP_TOKEN`
- `NODE_ENV=production`
- artifact storage variables as needed

5. Deploy.
6. Verify:

```text
https://your-koyeb-service.example/health
```

7. MCP URL:

```text
https://your-koyeb-service.example/mcp
```
