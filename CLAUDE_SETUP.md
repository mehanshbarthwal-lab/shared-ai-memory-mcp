# Claude Setup

Use this guide after deploying Shared AI Memory MCP to a public HTTPS URL.

## Remote MCP Connector

1. Open Claude connector settings.
2. Add a custom Remote MCP connector.
3. Set the endpoint:

```text
https://your-domain.example/mcp
```

4. Configure bearer authentication:

```text
Authorization: Bearer your-long-random-memory-token
```

5. Save the connector.
6. Confirm Claude can see:
   - `add_memory`
   - `search_memory`
   - `list_project_memories`
   - `update_memory`
   - `delete_memory`
   - `export_memories`
   - artifact tools such as `register_artifact`, `search_artifacts`, and `recall_from_artifact`

## Skill Setup

Upload:

```text
shared-memory-vault-skill/SKILL.md
```

Enable it for projects that should use shared memory.

## Recommended Claude Behavior

- Search global and project memory before project-specific work.
- Ask before saving memory unless the user explicitly says to save it.
- Save only durable project facts, instructions, workflows, file paths, and decisions.
- Keep `project_name` stable.
- Keep global memory separate from project memory.

## Never Save

- API keys
- passwords
- tokens
- private keys
- login credentials
- recovery codes
- deployment secrets
- temporary debugging state
