import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { config } from "../config.js";
import { listProjectMemories } from "../db.js";
import type { MemoryRecord, ToolPayload } from "../types/index.js";

const listProjectMemoriesSchema = {
  project_name: z.string().min(1).max(200),
  limit: z.number().int().min(1).max(100).optional()
};

function result<T>(payload: ToolPayload<T>): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload as unknown as Record<string, unknown>
  };
}

export function registerListProjectMemoriesTool(server: McpServer): void {
  server.registerTool(
    "list_project_memories",
    {
      title: "List Project Memories",
      description: "List recent memories for one project.",
      inputSchema: listProjectMemoriesSchema
    },
    async (input): Promise<CallToolResult> => {
      const parsed = z.object(listProjectMemoriesSchema).parse(input);
      const rows = await listProjectMemories(
        parsed.project_name,
        parsed.limit ?? config.maxSearchResults
      );

      return result<{ memories: MemoryRecord[]; count: number }>({
        ok: true,
        data: { memories: rows, count: rows.length }
      });
    }
  );
}
