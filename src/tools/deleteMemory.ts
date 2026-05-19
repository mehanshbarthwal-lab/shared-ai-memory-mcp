import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { deleteMemory } from "../db.js";

const deleteMemorySchema = {
  id: z.string().uuid(),
  hard_delete: z.boolean().optional()
};

type DeleteMemoryPayload = {
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

function result(payload: DeleteMemoryPayload): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload as unknown as Record<string, unknown>
  };
}

export function registerDeleteMemoryTool(server: McpServer): void {
  server.registerTool(
    "delete_memory",
    {
      title: "Delete Memory",
      description:
        "Soft-delete one memory by id by default. Set hard_delete=true only when permanent deletion is required.",
      inputSchema: deleteMemorySchema
    },
    async (input): Promise<CallToolResult> => {
      const parsed = z.object(deleteMemorySchema).parse(input);
      const hardDelete = parsed.hard_delete ?? false;
      const deleted = await deleteMemory(parsed.id, hardDelete);

      if (!deleted) {
        return result({ ok: false, error: "Memory not found." });
      }

      return result({
        ok: true,
        data: {
          id: parsed.id,
          deleted: true,
          hard_delete: hardDelete
        }
      });
    }
  );
}
