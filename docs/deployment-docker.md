# Docker Deployment

## Build

```bash
docker build -t shared-ai-memory-mcp .
```

## Run

```bash
docker run -p 3000:3000 --env-file .env shared-ai-memory-mcp
```

## Docker Compose

```bash
docker compose up --build
```

The Docker image does not contain secrets. Runtime secrets must come from environment variables or your platform secret manager.
