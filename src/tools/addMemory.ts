import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { insertMemory } from "../db.js";
import type { MemoryRecord, ToolPayload } from "../types/index.js";
import { memoryScopes, memoryTypes } from "../types/index.js";

const secretPattern =
  /(api[_ -]?key|password|passwd|secret|token|credential|private[_ -]?key|access[_ -]?key|refresh[_ -]?token)/i;

const addMemorySchema = {
  content: z.string().min(1).max(20000).describe("Memory text to save. Never include secrets."),
  scope: z.enum(memoryScopes).describe("Memory visibility scope."),
  project_name: z.string().min(1).max(200).optional().nullable(),
  source_account: z.string().min(1).max(200).optional().nullable(),
  memory_type: z.enum(memoryTypes),
  tags: z.array(z.string().min(1).max(80)).max(25).optional().default([]),
  importance: z.number().int().min(1).max(5).optional().default(3)
};

function result<T>(payload: ToolPayload<T>): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload as unknown as Record<string, unknown>
  };
}

export function registerAddMemoryTool(server: McpServer): void {
  server.registerTool(
    "add_memory",
    {
      title: "Add Memory",
      description: "Save a durable shared memory. Rejects obvious secrets and credentials.",
      inputSchema: addMemorySchema
    },
    async (input): Promise<CallToolResult> => {
      const parsed = z.object(addMemorySchema).parse(input);

      if (secretPattern.test(parsed.content)) {
        return result({
          ok: false,
          error: "Memory content appears to contain a secret or credential. Do not store secrets."
        });
      }

      if (parsed.scope === "project" && !parsed.project_name) {
        return result({ ok: false, error: "project_name is required when scope is project." });
      }

      const memory = await insertMemory({
        content: parsed.content,
        scope: parsed.scope,
        project_name: parsed.project_name ?? null,
        source_account: parsed.source_account ?? null,
        memory_type: parsed.memory_type,
        tags: parsed.tags,
        importance: parsed.importance
      });

      return result<{ memory: MemoryRecord; message: string }>({
        ok: true,
        data: { memory, message: "Memory saved." }
      });
    }
  );
}
