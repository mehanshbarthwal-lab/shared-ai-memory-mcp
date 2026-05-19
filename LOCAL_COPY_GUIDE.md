# Local Copy Guide

The intended local destination is:

```text
D:\OneDrive\Desktop\Shared mcp memory\shared-ai-memory-mcp
```

## If This Workspace Has Already Been Copied

Open PowerShell:

```powershell
cd "D:\OneDrive\Desktop\Shared mcp memory\shared-ai-memory-mcp"
npm install
npm run build
```

## Manual Copy from the Current Workspace

If you need to copy it yourself, copy the repository folder while excluding generated and secret files:

```powershell
$source = "D:\OneDrive\文档\Shared AI Memory Vault MCP"
$dest = "D:\OneDrive\Desktop\Shared mcp memory\shared-ai-memory-mcp"
New-Item -ItemType Directory -Force -Path $dest
robocopy $source $dest /E /XD node_modules dist .git logs /XF .env .env.local
```

Then:

```powershell
cd $dest
npm install
npm run build
```

## GitHub Workflow

```powershell
cd "D:\OneDrive\Desktop\Shared mcp memory\shared-ai-memory-mcp"
git init
git add .
git commit -m "Initial release: shared AI memory MCP server"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shared-ai-memory-mcp.git
git push -u origin main
```
