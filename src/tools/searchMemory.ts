import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { config } from "../config.js";
import { searchMemories } from "../db.js";
import type { MemoryRecord, ToolPayload } from "../types/index.js";
import { memoryScopes, memoryTypes } from "../types/index.js";

const searchMemorySchema = {
  query: z.string().min(1).max(500),
  scope: z.enum(memoryScopes).optional(),
  project_name: z.string().min(1).max(200).optional(),
  memory_type: z.enum(memoryTypes).optional(),
  limit: z.number().int().min(1).max(100).optional()
};

function result<T>(payload: ToolPayload<T>): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload as unknown as Record<string, unknown>
  };
}

export function registerSearchMemoryTool(server: McpServer): void {
  server.registerTool(
    "search_memory",
    {
      title: "Search Memory",
      description: "Search saved memories with simple PostgreSQL ilike text matching.",
      inputSchema: searchMemorySchema
    },
    async (input): Promise<CallToolResult> => {
      const parsed = z.object(searchMemorySchema).parse(input);
      const rows = await searchMemories({
        ...parsed,
        limit: parsed.limit ?? config.maxSearchResults
      });

      return result<{ memories: MemoryRecord[]; count: number }>({
        ok: true,
        data: { memories: rows, count: rows.length }
      });
    }
  );
}
