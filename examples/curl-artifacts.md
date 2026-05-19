# Artifact REST Examples

Set placeholders first:

```bash
export MEMORY_MCP_TOKEN="replace-with-your-token"
export MEMORY_MCP_URL="https://your-domain.example"
```

Register an artifact:

```bash
curl -X POST "$MEMORY_MCP_URL/api/artifacts/register" \
  -H "Authorization: Bearer $MEMORY_MCP_TOKEN" \
  -H "Content-Type: application/json" \
  --data @examples/register-artifact.json
```

Search artifacts:

```bash
curl "$MEMORY_MCP_URL/api/artifacts/search?query=deployment&project_name=example-project" \
  -H "Authorization: Bearer $MEMORY_MCP_TOKEN"
```
