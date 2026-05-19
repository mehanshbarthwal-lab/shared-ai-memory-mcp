import { z } from "zod";
import { deleteMemory } from "../db.js";
const deleteMemorySchema = {
    id: z.string().uuid(),
    hard_delete: z.boolean().optional()
};
function result(payload) {
    return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload
    };
}
export function registerDeleteMemoryTool(server) {
    server.registerTool("delete_memory", {
        title: "Delete Memory",
        description: "Soft-delete one memory by id by default. Set hard_delete=true only when permanent deletion is required.",
        inputSchema: deleteMemorySchema
    }, async (input) => {
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
    });
}
//# sourceMappingURL=deleteMemory.js.map