import { z } from "zod";
import { indexArtifactById, makeChunks, recallFromArtifactById } from "../artifacts.js";
import { config } from "../config.js";
import { getArtifact, hardDeleteArtifact, insertArtifact, listArtifacts, replaceArtifactChunks, searchArtifacts, softDeleteArtifact, updateArtifactIndexState } from "../db.js";
import { storageManager } from "../storage/index.js";
import { artifactProviders, artifactTypes } from "../types/index.js";
const metadataSchema = z.record(z.unknown()).optional().default({});
function result(payload) {
    return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload
    };
}
export const registerArtifactSchema = {
    project_name: z.string().min(1).max(200).optional(),
    title: z.string().min(1).max(300),
    artifact_type: z.enum(artifactTypes),
    provider: z.enum(artifactProviders),
    storage_key: z.string().min(1).max(2000),
    external_url: z.string().url().optional().nullable(),
    mime_type: z.string().min(1).max(200).optional().nullable(),
    file_size_bytes: z.coerce.number().int().nonnegative().optional().nullable(),
    tags: z.array(z.string().min(1).max(80)).max(25).optional().default([]),
    description: z.string().max(2000).optional().nullable(),
    source_client: z.string().max(200).optional().nullable(),
    source_workspace: z.string().max(500).optional().nullable(),
    metadata: metadataSchema
};
export const listArtifactsSchema = {
    project_name: z.string().min(1).max(200).optional(),
    artifact_type: z.enum(artifactTypes).optional(),
    provider: z.enum(artifactProviders).optional(),
    tag: z.string().min(1).max(80).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
};
export const searchArtifactsSchema = {
    query: z.string().min(1).max(500),
    project_name: z.string().min(1).max(200).optional(),
    artifact_type: z.enum(artifactTypes).optional(),
    provider: z.enum(artifactProviders).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
};
export const recallFromArtifactSchema = {
    artifact_id: z.string().uuid(),
    query: z.string().min(1).max(500),
    max_chunks: z.coerce.number().int().min(1).max(20).optional().default(5),
    include_summary: z.coerce.boolean().optional().default(true)
};
export const indexArtifactSchema = {
    artifact_id: z.string().uuid(),
    force_reindex: z.coerce.boolean().optional().default(false)
};
export const archiveLargeLogSchema = {
    project_name: z.string().min(1).max(200).optional(),
    title: z.string().min(1).max(300),
    provider: z.enum(artifactProviders),
    storage_key: z.string().min(1).max(2000).optional(),
    file_path: z.string().min(1).max(2000).optional(),
    tags: z.array(z.string().min(1).max(80)).max(25).optional().default([]),
    summary: z.string().max(4000).optional(),
    indexing_mode: z.enum(["summary_only", "selected_chunks", "full_text_if_small"])
};
export const deleteArtifactSchema = {
    artifact_id: z.string().uuid(),
    hard_delete: z.coerce.boolean().optional().default(false),
    delete_from_storage: z.coerce.boolean().optional().default(false)
};
export function registerArtifactTools(server) {
    server.registerTool("register_artifact", {
        title: "Register Artifact",
        description: "Register metadata for a large file/log already stored outside the memory database.",
        inputSchema: registerArtifactSchema
    }, async (input) => {
        const parsed = z.object(registerArtifactSchema).parse(input);
        const artifact = await insertArtifact({
            ...parsed,
            scope: parsed.project_name ? "project" : "global",
            external_url: parsed.external_url ?? null,
            mime_type: parsed.mime_type ?? null,
            file_size_bytes: parsed.file_size_bytes ?? null,
            description: parsed.description ?? null,
            source_client: parsed.source_client ?? null,
            source_workspace: parsed.source_workspace ?? null,
            indexed_status: parsed.metadata.summary ? "pending" : "pending"
        });
        return result({ ok: true, data: { artifact, message: "Artifact registered." } });
    });
    server.registerTool("list_artifacts", {
        title: "List Artifacts",
        description: "List registered artifacts by project, type, provider, or tag.",
        inputSchema: listArtifactsSchema
    }, async (input) => {
        const parsed = z.object(listArtifactsSchema).parse(input);
        const artifacts = await listArtifacts({
            ...parsed,
            limit: parsed.limit ?? config.maxSearchResults
        });
        return result({ ok: true, data: { artifacts, count: artifacts.length } });
    });
    server.registerTool("search_artifacts", {
        title: "Search Artifacts",
        description: "Search artifact metadata, summaries, and extracted chunks.",
        inputSchema: searchArtifactsSchema
    }, async (input) => {
        const parsed = z.object(searchArtifactsSchema).parse(input);
        const data = await searchArtifacts({ ...parsed, limit: parsed.limit ?? config.maxSearchResults });
        return result({ ok: true, data });
    });
    server.registerTool("recall_from_artifact", {
        title: "Recall From Artifact",
        description: "Recall only relevant artifact chunks and optional summary.",
        inputSchema: recallFromArtifactSchema
    }, async (input) => {
        const parsed = z.object(recallFromArtifactSchema).parse(input);
        const data = await recallFromArtifactById({
            artifactId: parsed.artifact_id,
            query: parsed.query,
            maxChunks: parsed.max_chunks,
            includeSummary: parsed.include_summary
        });
        return result({ ok: true, data });
    });
    server.registerTool("index_artifact", {
        title: "Index Artifact",
        description: "Extract useful text chunks and summary from an artifact.",
        inputSchema: indexArtifactSchema
    }, async (input) => {
        const parsed = z.object(indexArtifactSchema).parse(input);
        const data = await indexArtifactById(parsed.artifact_id, parsed.force_reindex);
        return result({ ok: true, data });
    });
    server.registerTool("archive_large_log", {
        title: "Archive Large Log",
        description: "Register a large externally stored log and keep only summary/selected chunks in the database.",
        inputSchema: archiveLargeLogSchema
    }, async (input) => {
        const parsed = z.object(archiveLargeLogSchema).parse(input);
        const storageKey = parsed.storage_key ?? parsed.file_path;
        if (!storageKey) {
            return result({ ok: false, error: "storage_key or file_path is required." });
        }
        const artifact = await insertArtifact({
            project_name: parsed.project_name,
            scope: parsed.project_name ? "project" : "global",
            artifact_type: "log_file",
            title: parsed.title,
            provider: parsed.provider,
            storage_key: storageKey,
            tags: parsed.tags,
            summary: parsed.summary ?? null,
            indexed_status: parsed.indexing_mode === "summary_only" ? "skipped" : "pending",
            metadata: { indexing_mode: parsed.indexing_mode }
        });
        if (parsed.indexing_mode !== "summary_only") {
            try {
                const indexed = await indexArtifactById(artifact.id, true);
                return result({ ok: true, data: indexed });
            }
            catch {
                await updateArtifactIndexState(artifact.id, { indexed_status: "failed" });
            }
        }
        else if (parsed.summary) {
            await replaceArtifactChunks(artifact.id, makeChunks(artifact.id, parsed.summary, 3));
        }
        return result({ ok: true, data: { artifact, message: "Large log archived." } });
    });
    server.registerTool("delete_artifact", {
        title: "Delete Artifact",
        description: "Soft-delete artifact metadata by default; optionally hard-delete and remove storage object.",
        inputSchema: deleteArtifactSchema
    }, async (input) => {
        const parsed = z.object(deleteArtifactSchema).parse(input);
        const artifact = await getArtifact(parsed.artifact_id);
        if (!artifact) {
            return result({ ok: false, error: "Artifact not found." });
        }
        if (parsed.delete_from_storage) {
            await storageManager.getAdapter(artifact.provider).deleteFile(artifact.storage_key);
        }
        const deleted = parsed.hard_delete
            ? await hardDeleteArtifact(parsed.artifact_id)
            : await softDeleteArtifact(parsed.artifact_id);
        return result({ ok: true, data: { artifact_id: parsed.artifact_id, deleted } });
    });
    server.registerTool("storage_status", {
        title: "Storage Status",
        description: "Report memory database and artifact storage provider status without exposing secrets.",
        inputSchema: {}
    }, async () => result({
        ok: true,
        data: {
            memory_database_provider: config.databaseProvider,
            active_archive_storage_provider: config.artifactStorageProvider,
            providers: storageManager.providerStatuses()
        }
    }));
}
//# sourceMappingURL=artifactTools.js.map