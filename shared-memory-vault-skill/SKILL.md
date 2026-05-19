# Shared Memory Vault Skill

Use the Shared AI Memory MCP connector when a project benefits from durable shared memory across Claude sessions, Claude accounts, or other MCP-compatible AI clients.

## Before Project Work

- Search memory before answering project-related questions.
- Search `scope=project` with the current `project_name`.
- Search `scope=global` for durable cross-project preferences and instructions.
- Search artifacts and artifact chunks when the question may depend on large files, logs, documents, datasets, or chat exports.
- Treat memory as context, not as a replacement for the user's current instructions.

## Saving Memory

- Save durable project decisions only when explicitly instructed.
- Ask before saving unless the user says something like "save this to memory", "remember this", or "record this decision".
- Prefer updating an existing memory over creating duplicates.

Good memory candidates:

- stable project decisions
- durable architecture context
- reusable workflow notes
- important file paths
- long-lived instructions
- durable user preferences

Avoid saving temporary details, transient debugging notes, speculation, or short-lived task state.

## Large Files And Logs

- Do not save large files, full logs, huge documents, full datasets, or long raw chat histories as normal memories.
- Use artifact tools for large content.
- Store raw artifacts in configured cloud/local storage.
- Save only metadata, summaries, selected chunks, and references in the database.
- When recalling artifact content, return only relevant chunks and mention which artifact was used.
- Avoid loading or dumping huge files unless the user explicitly asks and it is safe.

## Field Conventions

- Use `scope=global` for cross-project preferences or instructions.
- Use `scope=project` for memories tied to one project.
- Use `scope=account` only for account-specific context.
- Always include `project_name` for project memories.
- Use consistent lowercase tags such as `architecture`, `database`, `deployment`, `workflow`, `decision`, `security`, or `file-path`.
- Choose `memory_type` from `preference`, `project_context`, `instruction`, `fact`, `workflow`, `file_path`, or `decision`.
- Use `importance` from 1 to 5, where 5 is most important.

## Never Save Secrets

Never save:

- API keys
- passwords
- access tokens
- refresh tokens
- private keys
- recovery codes
- session cookies
- login credentials
- Claude credentials
- deployment secrets

If a user asks to save a secret, refuse briefly and suggest environment variables or a secrets manager instead.

## Sensitive Personal Information

Avoid storing sensitive personal information unless the user explicitly requests it, it is genuinely durable, and it is appropriate for the shared memory scope.

## Separation Rules

- Keep global memory separate from project memory.
- Do not save project-specific details as global memory.
- Do not save account-specific context as project memory unless it applies to the project itself.
