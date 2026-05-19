import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { updateMemory } from "../db.js";
import type { MemoryRecord, ToolPayload } from "../types/index.js";
import { memoryScopes, memoryTypes } from "../types/index.js";

const secretPattern =
  /(api[_ -]?key|password|passwd|secret|token|credential|private[_ -]?key|access[_ -]?key|refresh[_ -]?token)/i;

const updateMemorySchema = {
  id: z.string().uuid(),
  content: z.string().min(1).max(20000).optional(),
  tags: z.array(z.string().min(1).max(80)).max(25).optional(),
  importance: z.number().int().min(1).max(5).optional(),
  memory_type: z.enum(memoryTypes).optional(),
  scope: z.enum(memoryScopes).optional(),
  project_name: z.string().min(1).max(200).nullable().optional()
};

function result<T>(payload: ToolPayload<T>): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload as unknown as Record<string, unknown>
  };
}

export function registerUpdateMemoryTool(server: McpServer): void {
  server.registerTool(
    "update_memory",
    {
      title: "Update Memory",
      description: "Update selected fields for an existing memory.",
      inputSchema: updateMemorySchema
    },
    async (input): Promise<CallToolResult> => {
      const parsed = z.object(updateMemorySchema).parse(input);

      if (parsed.content && secretPattern.test(parsed.content)) {
        return result({
          ok: false,
          error: "Updated content appears to contain a secret or credential. Do not store secrets."
        });
      }

      const update = {
        content: parsed.content,
        tags: parsed.tags,
        importance: parsed.importance,
        memory_type: parsed.memory_type,
        scope: parsed.scope,
        project_name: parsed.project_name
      };

      const compactUpdate = Object.fromEntries(
        Object.entries(update).filter(([, value]) => value !== undefined)
      );

      if (Object.keys(compactUpdate).length === 0) {
        return result({ ok: false, error: "Provide at least one field to update." });
      }

      const memory = await updateMemory(parsed.id, compactUpdate);

      if (!memory) {
        return result({ ok: false, error: "Memory not found." });
      }

      return result<{ memory: MemoryRecord; message: string }>({
        ok: true,
        data: { memory, message: "Memory updated." }
      });
    }
  );
}
