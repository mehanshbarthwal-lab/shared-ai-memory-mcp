import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
export declare const registerArtifactSchema: {
    project_name: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    artifact_type: z.ZodEnum<["document", "pdf", "spreadsheet", "image", "dataset", "code_file", "log_file", "chat_export", "audio", "video", "archive", "other"]>;
    provider: z.ZodEnum<["local", "s3", "cloudflare_r2", "aws_s3", "backblaze_b2", "minio", "google_drive", "onedrive"]>;
    storage_key: z.ZodString;
    external_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    mime_type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    file_size_bytes: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    source_client: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    source_workspace: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
};
export declare const listArtifactsSchema: {
    project_name: z.ZodOptional<z.ZodString>;
    artifact_type: z.ZodOptional<z.ZodEnum<["document", "pdf", "spreadsheet", "image", "dataset", "code_file", "log_file", "chat_export", "audio", "video", "archive", "other"]>>;
    provider: z.ZodOptional<z.ZodEnum<["local", "s3", "cloudflare_r2", "aws_s3", "backblaze_b2", "minio", "google_drive", "onedrive"]>>;
    tag: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
};
export declare const searchArtifactsSchema: {
    query: z.ZodString;
    project_name: z.ZodOptional<z.ZodString>;
    artifact_type: z.ZodOptional<z.ZodEnum<["document", "pdf", "spreadsheet", "image", "dataset", "code_file", "log_file", "chat_export", "audio", "video", "archive", "other"]>>;
    provider: z.ZodOptional<z.ZodEnum<["local", "s3", "cloudflare_r2", "aws_s3", "backblaze_b2", "minio", "google_drive", "onedrive"]>>;
    limit: z.ZodOptional<z.ZodNumber>;
};
export declare const recallFromArtifactSchema: {
    artifact_id: z.ZodString;
    query: z.ZodString;
    max_chunks: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    include_summary: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
};
export declare const indexArtifactSchema: {
    artifact_id: z.ZodString;
    force_reindex: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
};
export declare const archiveLargeLogSchema: {
    project_name: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    provider: z.ZodEnum<["local", "s3", "cloudflare_r2", "aws_s3", "backblaze_b2", "minio", "google_drive", "onedrive"]>;
    storage_key: z.ZodOptional<z.ZodString>;
    file_path: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    summary: z.ZodOptional<z.ZodString>;
    indexing_mode: z.ZodEnum<["summary_only", "selected_chunks", "full_text_if_small"]>;
};
export declare const deleteArtifactSchema: {
    artifact_id: z.ZodString;
    hard_delete: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    delete_from_storage: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
};
export declare function registerArtifactTools(server: McpServer): void;
