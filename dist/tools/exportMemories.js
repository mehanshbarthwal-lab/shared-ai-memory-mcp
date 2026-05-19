import { z } from "zod";
import { exportMemories } from "../db.js";
import { memoryScopes, memoryTypes } from "../types/index.js";
const exportMemoriesSchema = {
    project_name: z.string().min(1).max(200).optional(),
    scope: z.enum(memoryScopes).optional(),
    memory_type: z.enum(memoryTypes).optional()
};
function result(payload) {
    return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload
    };
}
export function registerExportMemoriesTool(server) {
    server.registerTool("export_memories", {
        title: "Export Memories",
        description: "Export memories as structured JSON, optionally filtered by project or scope.",
        inputSchema: exportMemoriesSchema
    }, async (input) => {
        const parsed = z.object(exportMemoriesSchema).parse(input);
        const rows = await exportMemories(parsed);
        return result({
            ok: true,
            data: { memories: rows, count: rows.length }
        });
    });
}
//# sourceMappingURL=exportMemories.js.map