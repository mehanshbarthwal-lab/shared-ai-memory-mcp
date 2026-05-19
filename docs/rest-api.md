# REST API

Artifact REST endpoints mirror the MCP artifact tools.

All endpoints require:

```text
Authorization: Bearer <MEMORY_MCP_TOKEN>
```

## Endpoints

- `POST /api/artifacts/register`
- `GET /api/artifacts`
- `GET /api/artifacts/search`
- `POST /api/artifacts/:id/recall`
- `POST /api/artifacts/:id/index`
- `DELETE /api/artifacts/:id`

REST is useful for automation, ingestion jobs, and admin scripts. MCP remains the primary AI-client interface.
