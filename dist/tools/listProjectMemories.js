import { z } from "zod";
import { config } from "../config.js";
import { listProjectMemories } from "../db.js";
const listProjectMemoriesSchema = {
    project_name: z.string().min(1).max(200),
    limit: z.number().int().min(1).max(100).optional()
};
function result(payload) {
    return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload
    };
}
export function registerListProjectMemoriesTool(server) {
    server.registerTool("list_project_memories", {
        title: "List Project Memories",
        description: "List recent memories for one project.",
        inputSchema: listProjectMemoriesSchema
    }, async (input) => {
        const parsed = z.object(listProjectMemoriesSchema).parse(input);
        const rows = await listProjectMemories(parsed.project_name, parsed.limit ?? config.maxSearchResults);
        return result({
            ok: true,
            data: { memories: rows, count: rows.length }
        });
    });
}
//# sourceMappingURL=listProjectMemories.js.map