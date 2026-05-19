import "dotenv/config";

import { randomUUID } from "node:crypto";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import cors from "cors";
import express, { type Request, type Response } from "express";

import { requireBearerToken, requireMcpToken } from "./auth.js";
import { config, isProduction } from "./config.js";
import { logger } from "./logger.js";
import { artifactRouter } from "./routes/artifacts.js";
import { registerAddMemoryTool } from "./tools/addMemory.js";
import { registerArtifactTools } from "./tools/artifactTools.js";
import { registerDeleteMemoryTool } from "./tools/deleteMemory.js";
import { registerExportMemoriesTool } from "./tools/exportMemories.js";
import { registerListProjectMemoriesTool } from "./tools/listProjectMemories.js";
import { registerSearchMemoryTool } from "./tools/searchMemory.js";
import { registerUpdateMemoryTool } from "./tools/updateMemory.js";

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "Shared AI Memory Vault MCP",
    version: "0.1.0"
  });

  registerAddMemoryTool(server);
  registerSearchMemoryTool(server);
  registerListProjectMemoriesTool(server);
  registerUpdateMemoryTool(server);
  registerDeleteMemoryTool(server);
  registerExportMemoriesTool(server);
  registerArtifactTools(server);

  return server;
}

const app = express();

app.use(
  cors({
    origin: "*",
    exposedHeaders: ["Mcp-Session-Id"]
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "shared-ai-memory-mcp",
    databaseProvider: config.databaseProvider
  });
});

app.use("/api/artifacts", requireBearerToken, artifactRouter);

const transports = new Map<string, StreamableHTTPServerTransport>();

app.post(["/mcp", "/claude/:mcp_token/mcp"], requireMcpToken, async (req: Request, res: Response) => {
  const sessionId = req.header("mcp-session-id");
  let transport = sessionId ? transports.get(sessionId) : undefined;

  try {
    if (!transport) {
      if (sessionId || !isInitializeRequest(req.body)) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Bad Request: invalid or missing MCP session." },
          id: null
        });
        return;
      }

      const server = createMcpServer();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          if (transport) {
            transports.set(newSessionId, transport);
          }
        }
      });

      transport.onclose = () => {
        if (transport?.sessionId) {
          transports.delete(transport.sessionId);
        }
        server.close();
      };

      await server.connect(transport);
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (!isProduction) {
      logger.error("MCP request failed", { error: message });
    } else {
      logger.error("MCP request failed");
    }

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null
      });
    }
  }
});

app.get(["/mcp", "/claude/:mcp_token/mcp"], requireMcpToken, async (req: Request, res: Response) => {
  const sessionId = req.header("mcp-session-id");
  const transport = sessionId ? transports.get(sessionId) : undefined;

  if (!transport) {
    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Bad Request: invalid or missing MCP session." },
      id: null
    });
    return;
  }

  await transport.handleRequest(req, res);
});

app.delete(["/mcp", "/claude/:mcp_token/mcp"], requireMcpToken, async (req: Request, res: Response) => {
  const sessionId = req.header("mcp-session-id");
  const transport = sessionId ? transports.get(sessionId) : undefined;

  if (!transport) {
    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Bad Request: invalid or missing MCP session." },
      id: null
    });
    return;
  }

  await transport.handleRequest(req, res);
});

app.use((error: unknown, _req: Request, res: Response, _next: unknown) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  if (!isProduction) {
    logger.error("Unhandled error", { error: message });
  }
  res.status(500).json({ error: "Internal server error" });
});

const httpServer = app.listen(config.port, () => {
  logger.info("Shared AI Memory Vault MCP listening", { port: config.port });
});

async function shutdown(): Promise<void> {
  logger.info("Shutting down Shared AI Memory Vault MCP");
  httpServer.close();

  for (const transport of transports.values()) {
    await transport.close();
  }

  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
